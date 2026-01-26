import type { ActionLog, LogActionType, LogType } from '@/types/logs';
import { getAccountData, setAccountData, getAccountDataAsync, setAccountDataAsync } from '.';

export const MAX_LOG_ENTRIES = 500;

function createLog(
  actionType: LogActionType,
  logType: LogType,
  message: string
): ActionLog {
  return {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    actionType,
    logType,
    message,
  };
}

export async function addActionLog(
  actionType: LogActionType,
  logType: LogType,
  message: string
): Promise<void> {
  const accountData = await getAccountData();
  const log = createLog(actionType, logType, message);

  // Ensure actionLogs array exists
  if (!accountData.actionLogs) {
    accountData.actionLogs = [];
  }

  // Add to beginning (newest first)
  accountData.actionLogs.unshift(log);

  // Trim to max entries
  if (accountData.actionLogs.length > MAX_LOG_ENTRIES) {
    accountData.actionLogs = accountData.actionLogs.slice(0, MAX_LOG_ENTRIES);
  }

  await setAccountData(accountData);
}

// Async version for background script (uses browser.cookies API)
export async function addActionLogAsync(
  actionType: LogActionType,
  logType: LogType,
  message: string
): Promise<void> {
  const accountData = await getAccountDataAsync();
  const log = createLog(actionType, logType, message);

  // Ensure actionLogs array exists
  if (!accountData.actionLogs) {
    accountData.actionLogs = [];
  }

  // Add to beginning (newest first)
  accountData.actionLogs.unshift(log);

  // Trim to max entries
  if (accountData.actionLogs.length > MAX_LOG_ENTRIES) {
    accountData.actionLogs = accountData.actionLogs.slice(0, MAX_LOG_ENTRIES);
  }

  await setAccountDataAsync(accountData);
}

export async function getActionLogs(): Promise<ActionLog[]> {
  const accountData = await getAccountData();
  return accountData.actionLogs || [];
}

export async function clearActionLogs(): Promise<void> {
  const accountData = await getAccountData();
  accountData.actionLogs = [];
  await setAccountData(accountData);
}

// Convenience functions for common log types (content script)
export const logger = {
  info: (actionType: LogActionType, message: string) =>
    addActionLog(actionType, 'info', message),

  success: (actionType: LogActionType, message: string) =>
    addActionLog(actionType, 'success', message),

  warning: (actionType: LogActionType, message: string) =>
    addActionLog(actionType, 'warning', message),

  error: (actionType: LogActionType, message: string) =>
    addActionLog(actionType, 'error', message),
};

// Async versions for background script (uses browser.cookies API)
export const loggerAsync = {
  info: (actionType: LogActionType, message: string) =>
    addActionLogAsync(actionType, 'info', message),

  success: (actionType: LogActionType, message: string) =>
    addActionLogAsync(actionType, 'success', message),

  warning: (actionType: LogActionType, message: string) =>
    addActionLogAsync(actionType, 'warning', message),

  error: (actionType: LogActionType, message: string) =>
    addActionLogAsync(actionType, 'error', message),
};
