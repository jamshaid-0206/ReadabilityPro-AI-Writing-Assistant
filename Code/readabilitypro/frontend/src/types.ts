export type SubscriptionTier = 'free' | 'premium';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  subscriptionTier: SubscriptionTier;
  createdAt: any;
  updatedAt: any;
}

export interface AnalysisResult {
  metrics: {
    sentences: number;
    words: number;
    syllables: number;
    complexWords: number;
  };
  scores: {
    fleschEase: number;
    fleschKincaid: number;
    gunningFog: number;
    interpretation: string;
  };
}

export interface ImprovedVersion {
  type: string;
  text: string;
  label: string;
  icon?: any;
}
