export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'exploration' | 'social' | 'discovery' | 'challenge';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  estimatedTime: string;
  image: string;
  steps: QuestStep[];
  requirements: string[];
  rewards: QuestReward[];
  area?: {
    center: [number, number];
    radius: number; // in meters
  };
  isActive: boolean;
  createdAt: string;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  type: 'location' | 'photo' | 'interaction' | 'discovery';
  targetLocation?: [number, number];
  radius?: number; // in meters
  photoRequired?: boolean;
  photoPrompt?: string;
  verificationMethod: 'location' | 'photo' | 'manual' | 'automatic';
  isCompleted: boolean;
  completedAt?: string;
  completedPhoto?: string;
}

export interface QuestReward {
  type: 'points' | 'badge' | 'unlock';
  value: number | string;
  name: string;
  description: string;
}

export interface UserQuestProgress {
  id: string;
  questId: string;
  userId: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'abandoned';
  currentStep: number;
  completedSteps: string[];
  startedAt: string;
  completedAt?: string;
  totalPoints: number;
  photos: { [stepId: string]: string };
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  totalPoints: number;
  level: number;
  badges: Badge[];
  completedQuests: string[];
  currentQuests: string[];
  joinedAt: string;
  lastActive: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: string;
}