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
