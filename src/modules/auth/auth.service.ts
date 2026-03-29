import crypto from 'node:crypto';

import prisma from '@db/prisma.js';
import type { AuthTokenPayload } from '@types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import type { LoginInput, RegisterInput } from './auth.schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 30;
const EMAIL_VERIFICATION_EXPIRY_HOURS = 24;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const userSelect = {
  id: true,
  email: true,
  name: true,
  avatarUrl: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
      select: userSelect,
    });

    const accessToken = this.generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    // Send verification email (non-blocking)
    this.sendVerificationEmail(user.id, user.email).catch(() => {});

    return { user, accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.passwordHash) {
      throw new Error('This account uses Google sign-in. Please use Google to log in.');
    }

    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const accessToken = this.generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Google OAuth — verify access token via userinfo, create or link user
   */
  async googleAuth(googleAccessToken: string) {
    const payload = await this.getGoogleUserInfo(googleAccessToken);

    if (!payload || !payload.email) {
      throw new Error('Invalid Google token');
    }

    const { email, name, sub: googleId, email_verified } = payload;

    // Check if user exists by googleId or email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      select: { ...userSelect, googleId: true },
    });

    if (user) {
      // Link Google account if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            emailVerified: email_verified ? true : user.emailVerified,
          },
          select: { ...userSelect, googleId: true },
        });
      } else if (email_verified && !user.emailVerified) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
          select: { ...userSelect, googleId: true },
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          emailVerified: email_verified ?? false,
        },
        select: { ...userSelect, googleId: true },
      });
    }

    const accessToken = this.generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = await this.createRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(userId: number, email: string) {
    // Invalidate existing tokens
    await prisma.emailVerificationToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + EMAIL_VERIFICATION_EXPIRY_HOURS);

    await prisma.emailVerificationToken.create({
      data: { token, userId, expiresAt },
    });

    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    const { sendEmail } = await import('../../utils/email.js');
    await sendEmail(
      email,
      'Verify your email — Subtrackify',
      `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="margin: 0 0 16px; font-size: 24px; color: #111;">Verify your email</h2>
        <p style="margin: 0 0 24px; color: #555; line-height: 1.5;">
          Click the button below to verify your email address. This link expires in ${EMAIL_VERIFICATION_EXPIRY_HOURS} hours.
        </p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 32px; background: #111; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
          Verify Email
        </a>
        <p style="margin: 24px 0 0; color: #999; font-size: 13px;">
          If you didn't create an account on Subtrackify, you can ignore this email.
        </p>
      </div>
      `
    );
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string) {
    const stored = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored) {
      throw new Error('Invalid verification token');
    }

    if (stored.usedAt) {
      throw new Error('Verification token already used');
    }

    if (stored.expiresAt < new Date()) {
      throw new Error('Verification token expired');
    }

    await prisma.$transaction([
      prisma.emailVerificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: stored.userId },
        data: { emailVerified: true },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string) {
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!stored) {
      throw new Error('Invalid refresh token');
    }

    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new Error('Refresh token expired');
    }

    // Token rotation: delete old, issue new pair
    await prisma.refreshToken.delete({ where: { id: stored.id } });

    const accessToken = this.generateAccessToken({
      userId: stored.user.id,
      email: stored.user.email,
    });
    const newRefreshToken = await this.createRefreshToken(stored.user.id);

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout — invalidate a single refresh token
   */
  async logout(refreshToken: string) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Verify JWT access token
   */
  verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate short-lived JWT access token
   */
  private generateAccessToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  /**
   * Create a refresh token in the database
   */
  private async createRefreshToken(userId: number): Promise<string> {
    const token = crypto.randomBytes(48).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
      data: { token, userId, expiresAt },
    });

    return token;
  }

  /**
   * Get Google user info from access token
   */
  private async getGoogleUserInfo(
    accessToken: string
  ): Promise<{ email?: string; name?: string; sub: string; email_verified?: boolean } | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Google user info');
      }

      const data = (await response.json()) as {
        sub: string;
        email?: string;
        name?: string;
        email_verified?: boolean;
      };

      if (!data.sub) return null;

      return {
        email: data.email,
        name: data.name,
        sub: data.sub,
        email_verified: data.email_verified,
      };
    } catch {
      throw new Error('Invalid Google token');
    }
  }
}

export const authService = new AuthService();
