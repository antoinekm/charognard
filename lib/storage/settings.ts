import type { UserSettings } from '@/lib/types';
import { getAccountData, setAccountData } from '.';

export async function getSettings(): Promise<UserSettings> {
  const accountData = await getAccountData();
  return accountData.settings;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<void> {
  const accountData = await getAccountData();
  accountData.settings = { ...accountData.settings, ...settings };
  await setAccountData(accountData);
}
