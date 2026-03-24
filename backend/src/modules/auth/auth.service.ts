import bcrypt from 'bcryptjs';
import prisma from '../../config/database';
import { AppError } from '../../middleware/error.middleware';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  parseExpiresIn,
} from '../../utils/tokenHelpers';
import { AuthResponse, UserResponse } from '../../types';

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const BCRYPT_ROUNDS = 12;

export async function register(
  email: string,
  password: string,
  name: string
): Promise<AuthResponse> {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // Create user
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Store refresh token hash in DB
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  };
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  // Find user — same error message for wrong email or password (prevent enumeration)
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Compare password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  // Invalidate all existing refresh tokens for security
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revoked: false },
    data: { revoked: true },
  });

  // Generate new tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id);

  // Store new refresh token
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      token: tokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    user: { id: user.id, email: user.email, name: user.name },
    accessToken,
    refreshToken,
  };
}

export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
}> {
  // Verify JWT signature
  let decoded: { userId: string; tokenId: string };
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
  }

  // Check token exists in DB and is not revoked
  const tokenHash = hashToken(refreshToken);
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!storedToken) {
    throw new AppError('Refresh token not found', 401, 'TOKEN_NOT_FOUND');
  }

  if (storedToken.revoked) {
    // Potential token reuse attack — revoke ALL tokens for this user
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId },
      data: { revoked: true },
    });
    throw new AppError('Refresh token has been revoked', 401, 'TOKEN_REVOKED');
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError('Refresh token has expired', 401, 'TOKEN_EXPIRED');
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  // Get user info for new access token
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Issue new token pair
  const newAccessToken = generateAccessToken(user.id, user.email);
  const newRefreshToken = generateRefreshToken(user.id);

  const newTokenHash = hashToken(newRefreshToken);
  const expiresAt = new Date(Date.now() + parseExpiresIn(REFRESH_EXPIRES_IN));

  await prisma.refreshToken.create({
    data: {
      token: newTokenHash,
      userId: user.id,
      expiresAt,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (storedToken) {
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });
  }
}

export async function getCurrentUser(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}
