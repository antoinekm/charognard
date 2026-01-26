import type { InstagramUser } from './instagram';

export interface FollowedProfile {
  user: InstagramUser;
  followedAt: number;
  followedBack: boolean | null;
  lastCheckedAt?: number;
}

export interface DailyActions {
  date: string;
  followCount: number;
  unfollowCount: number;
}

export interface UserSettings {
  followLimit: number;
  unfollowLimit: number;
  skipFollowers: boolean;
}

export type ScheduleFrequency = 'Daily' | 'Weekly';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface AutomationProgress {
  date: string;
  targetFollowCount: number;
  completedFollowCount: number;
  unfollowCompleted: boolean;
}

export interface AutomationSettings {
  enabled: boolean;
  frequency: ScheduleFrequency;
  dayOfWeek: DayOfWeek;
  hour: number;
  minute: number;
  autoFollowEnabled: boolean;
  autoFollowCount: number;
  autoUnfollowEnabled: boolean;
  autoUnfollowDaysThreshold: number;
  autoUnfollowOnlyNonFollowers: boolean;
  lastRunAt?: number;
  currentProgress?: AutomationProgress;
}

export interface OnboardingData {
  completed: boolean;
  completedAt?: number;
  developerFollowed: boolean;
}

export interface StorageUsage {
  usedBytes: number;
  totalBytes: number;
  percentage: number;
  profilesCount: number;
}

export type ActionType = 'follow' | 'unfollow';
