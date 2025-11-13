import prisma from '@db/prisma.js';
import type { AuthTokenPayload } from '@types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import type { LoginInput, RegisterInput } from './auth.schema.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 10;

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate token
    const token = this.generateToken({ userId: user.id, email: user.email });

    return { user, token };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({ userId: user.id, email: user.email });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): AuthTokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    } catch {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: AuthTokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }
}

export const authService = new AuthService();
