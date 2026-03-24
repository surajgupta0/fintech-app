import { Router } from 'express';
import * as authController from './auth.controller';
import { validate } from '../../middleware/validate.middleware';
import { authenticateRequest } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../middleware/rateLimit.middleware';
import { registerSchema, loginSchema, refreshSchema, logoutSchema } from './auth.schema';

const router = Router();

// Apply auth rate limiter to sensitive endpoints
router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticateRequest, validate(logoutSchema), authController.logout);
router.get('/me', authenticateRequest, authController.me);

export default router;
