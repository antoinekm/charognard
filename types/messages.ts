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
