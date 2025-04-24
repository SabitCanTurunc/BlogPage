export enum SubscriptionPlan {
  ESSENTIAL = 'ESSENTIAL',
  PREMIUM = 'PREMIUM',
  UNLIMITED = 'UNLIMITED'
}

export interface SubscriptionPlanDetails {
  plan: SubscriptionPlan;
  title: string;
  description: string;
  price: string;
  features: string[];
}

export interface SubscriptionRequest {
  id?: number;
  userId?: number;
  username?: string;
  email?: string;
  currentPlan?: SubscriptionPlan;
  requestedPlan: SubscriptionPlan;
  requestDate?: string;
  processDate?: string;
  adminNote?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string; // Kullanıcının isteği için açıklama
} 