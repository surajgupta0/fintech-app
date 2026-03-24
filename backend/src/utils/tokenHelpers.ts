import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default-access-secret-key-min-32-chars!!';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-key-min-32-chars!!';
const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES,
  });
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId, tokenId: crypto.randomUUID() }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES,
  });
}

export function verifyAccessToken(token: string): { userId: string; email: string } {
  return jwt.verify(token, ACCESS_SECRET) as { userId: string; email: string };
}

export function verifyRefreshToken(token: string): { userId: string; tokenId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string; tokenId: string };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function parseExpiresIn(expiresIn: string): number {
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60 * 1000; // default 15 minutes

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;
    case 'm': return value * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    default: return 15 * 60 * 1000;
  }
}
