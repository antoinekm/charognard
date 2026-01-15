import type { ActionType } from '@/lib/types';
import { getAccountData, setAccountData } from '.';
import { getSettings } from './settings';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export async function getDailyActionCount(actionType: ActionType): Promise<number> {
  const accountData = await getAccountData();
  const today = getTodayDate();

  if (accountData.dailyActions?.date === today) {
    return actionType === 'follow'
      ? accountData.dailyActions.followCount
      : accountData.dailyActions.unfollowCount;
  }
  return 0;
}

export async function getRemainingDailyActions(actionType: ActionType): Promise<number> {
  const count = await getDailyActionCount(actionType);
  const settings = await getSettings();
  const limit = actionType === 'follow' ? settings.followLimit : settings.unfollowLimit;
  return Math.max(0, limit - count);
}

export async function canPerformAction(actionType: ActionType): Promise<boolean> {
  const remaining = await getRemainingDailyActions(actionType);
  return remaining > 0;
}

export async function incrementDailyActionCount(actionType: ActionType): Promise<void> {
  const accountData = await getAccountData();
  const today = getTodayDate();

  if (accountData.dailyActions?.date === today) {
    if (actionType === 'follow') {
      accountData.dailyActions.followCount += 1;
    } else {
      accountData.dailyActions.unfollowCount += 1;
    }
  } else {
    accountData.dailyActions = {
      date: today,
      followCount: actionType === 'follow' ? 1 : 0,
      unfollowCount: actionType === 'unfollow' ? 1 : 0,
    };
  }

  await setAccountData(accountData);
}
