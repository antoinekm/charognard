// Instagram API Types
export interface InstagramUser {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  is_verified: boolean;
  is_private: boolean;
}

export interface Suggestion {
  user: InstagramUser;
  social_context: string;
  caption: string;
}

export interface AymlResponse {
  more_available: boolean;
  max_id: string;
  suggested_users: {
    suggestions: Suggestion[];
  };
}

// Friendship Status
export interface FriendshipStatus {
  following: boolean;
  followed_by: boolean;
  blocking: boolean;
  muting: boolean;
  is_private: boolean;
  incoming_request: boolean;
  outgoing_request: boolean;
}

// Message Types for extension communication
export enum MessageType {
  GetSuggestions = 'GET_SUGGESTIONS',
  FollowUser = 'FOLLOW_USER',
  UnfollowUser = 'UNFOLLOW_USER',
  RunAutomation = 'RUN_AUTOMATION',
  UpdateAlarm = 'UPDATE_ALARM',
  TogglePanel = 'TOGGLE_PANEL',
}

export interface BaseMessage {
  type: MessageType;
}

export interface GetSuggestionsMessage extends BaseMessage {
  type: MessageType.GetSuggestions;
}

export interface FollowUserMessage extends BaseMessage {
  type: MessageType.FollowUser;
  userId: string;
}

export interface UnfollowUserMessage extends BaseMessage {
  type: MessageType.UnfollowUser;
  userId: string;
}

export interface RunAutomationMessage extends BaseMessage {
  type: MessageType.RunAutomation;
}

export interface UpdateAlarmMessage extends BaseMessage {
  type: MessageType.UpdateAlarm;
}

export interface TogglePanelMessage extends BaseMessage {
  type: MessageType.TogglePanel;
}

export type ExtensionMessage =
  | GetSuggestionsMessage
  | FollowUserMessage
  | UnfollowUserMessage
  | RunAutomationMessage
  | UpdateAlarmMessage
  | TogglePanelMessage;

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Storage Types
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

// Lists
export interface ProspectList {
  id: string;
  name: string;
  createdAt: number;
}

export interface ProspectListUser {
  user: InstagramUser;
  addedAt: number;
}

// Action Log Types
export type LogActionType =
  | 'follow'
  | 'unfollow'
  | 'check_status'
  | 'automation_start'
  | 'automation_end'
  | 'import'
  | 'export';

export type LogType = 'info' | 'success' | 'warning' | 'error';

export interface ActionLog {
  id: string;
  timestamp: number;
  actionType: LogActionType;
  logType: LogType;
  message: string;
}
