// Common types and interfaces

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  currency: string;
  billingCycle: string;
  nextBillingDate: Date;
  status: string;
  category?: string | null;
  userId?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
