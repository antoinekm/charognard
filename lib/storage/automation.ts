import type { AutomationSettings, AutomationProgress } from '@/lib/types';
import { getAccountDataAsync, setAccountDataAsync } from '.';

export async function getAutomationSettings(): Promise<AutomationSettings> {
  const accountData = await getAccountDataAsync();
  return accountData.automation;
}

export async function updateAutomationSettings(
  settings: Partial<AutomationSettings>
): Promise<void> {
  const accountData = await getAccountDataAsync();
  accountData.automation = { ...accountData.automation, ...settings };
  await setAccountDataAsync(accountData);
}

export async function setLastAutomationRun(): Promise<void> {
  const accountData = await getAccountDataAsync();
  accountData.automation.lastRunAt = Date.now();
  accountData.automation.currentProgress = undefined;
  await setAccountDataAsync(accountData);
}

export async function getAutomationProgress(): Promise<AutomationProgress | undefined> {
  const accountData = await getAccountDataAsync();
  const progress = accountData.automation.currentProgress;

  if (progress) {
    const today = new Date().toISOString().split('T')[0];
    if (progress.date === today) {
      return progress;
    }
    // Old progress, clear it
    accountData.automation.currentProgress = undefined;
    await setAccountDataAsync(accountData);
  }

  return undefined;
}

export async function startAutomationProgress(targetFollowCount: number): Promise<void> {
  const accountData = await getAccountDataAsync();
  accountData.automation.currentProgress = {
    date: new Date().toISOString().split('T')[0],
    targetFollowCount,
    completedFollowCount: 0,
    unfollowCompleted: false,
  };
  await setAccountDataAsync(accountData);
}

export async function updateAutomationProgress(
  updates: Partial<AutomationProgress>
): Promise<void> {
  const accountData = await getAccountDataAsync();
  if (accountData.automation.currentProgress) {
    accountData.automation.currentProgress = {
      ...accountData.automation.currentProgress,
      ...updates,
    };
    await setAccountDataAsync(accountData);
  }
}
