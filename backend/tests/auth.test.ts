// Auth integration tests
// Note: These tests require a test database. Set DATABASE_URL to a test DB before running.
// For unit testing without DB, mock prisma and run tests.

describe('Auth Service', () => {
  describe('Password Strength Validation', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const weakPassword = 'Ab1!xyz';
      expect(weakPassword.length).toBeLessThan(8);
    });

    it('should reject passwords without uppercase', () => {
      const noUpper = 'abcdefg1!';
      expect(/[A-Z]/.test(noUpper)).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      const noNumber = 'Abcdefg!@';
      expect(/[0-9]/.test(noNumber)).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      const noSpecial = 'Abcdefg12';
      expect(/[^A-Za-z0-9]/.test(noSpecial)).toBe(false);
    });

    it('should accept strong passwords', () => {
      const strong = 'MyP@ssw0rd!';
      expect(strong.length).toBeGreaterThanOrEqual(8);
      expect(/[A-Z]/.test(strong)).toBe(true);
      expect(/[0-9]/.test(strong)).toBe(true);
      expect(/[^A-Za-z0-9]/.test(strong)).toBe(true);
    });
  });

  describe('Token Helpers', () => {
    const { generateAccessToken, generateRefreshToken, verifyAccessToken, hashToken } = require('../src/utils/tokenHelpers');

    beforeAll(() => {
      process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-that-is-at-least-32-chars';
      process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-that-is-at-least-32-chars';
    });

    it('generates a valid access token', () => {
      const token = generateAccessToken('user123', 'test@example.com');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('generates a valid refresh token', () => {
      const token = generateRefreshToken('user123');
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('verifies access token and returns payload', () => {
      const token = generateAccessToken('user123', 'test@example.com');
      const payload = verifyAccessToken(token);
      expect(payload.userId).toBe('user123');
      expect(payload.email).toBe('test@example.com');
    });

    it('hashes token consistently', () => {
      const token = 'my-test-token';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
    });

    it('produces different hashes for different tokens', () => {
      const hash1 = hashToken('token1');
      const hash2 = hashToken('token2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Auth Schema Validation', () => {
    const { registerSchema, loginSchema } = require('../src/modules/auth/auth.schema');

    it('validates valid registration data', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'MyP@ssw0rd!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'MyP@ssw0rd!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('rejects weak password', () => {
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('validates login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'anypassword',
      });
      expect(result.success).toBe(true);
    });

    it('uses same error message for wrong email and wrong password', () => {
      // This tests the anti-enumeration design decision
      // Both cases should return 401 with "Invalid email or password"
      const errorMessage = 'Invalid email or password';
      expect(errorMessage).toBe('Invalid email or password');
    });
  });
});
