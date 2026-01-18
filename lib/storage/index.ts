import type {
  FollowedProfile,
  DailyActions,
  UserSettings,
  AutomationSettings,
  ProspectList,
  ProspectListUser,
} from '@/lib/types';
import { getCurrentUserId, getCurrentUserIdAsync } from '@/lib/instagram';

export interface AccountData {
  followedProfiles: Record<string, FollowedProfile>;
  dailyActions?: DailyActions;
  settings: UserSettings;
  automation: AutomationSettings;
  lists?: Record<string, ProspectList>;
  listUsers?: Record<string, Record<string, ProspectListUser>>;
}

interface StorageData {
  accounts: Record<string, AccountData>;
  settings: UserSettings;
  automation: AutomationSettings;
  onboarding?: {
    completed: boolean;
    completedAt?: number;
    developerFollowed: boolean;
  };
}

interface LegacyStorageData {
  followedProfiles: Record<string, FollowedProfile>;
  dailyActions?: { date: string; count: number };
}

export const STORAGE_KEY = 'ig_extension_data';
export const DEFAULT_FOLLOW_LIMIT = 150;
export const DEFAULT_UNFOLLOW_LIMIT = 150;
export const DEFAULT_SKIP_FOLLOWERS = true;

export const DEFAULT_AUTOMATION: AutomationSettings = {
  enabled: false,
  frequency: 'Daily',
  dayOfWeek: 1,
  hour: 10,
  minute: 0,
  autoFollowEnabled: true,
  autoFollowCount: 50,
  autoUnfollowEnabled: true,
  autoUnfollowDaysThreshold: 7,
  autoUnfollowOnlyNonFollowers: true,
};

function getDefaultStorageData(): StorageData {
  return {
    accounts: {},
    settings: {
      followLimit: DEFAULT_FOLLOW_LIMIT,
      unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
      skipFollowers: DEFAULT_SKIP_FOLLOWERS,
    },
    automation: { ...DEFAULT_AUTOMATION },
  };
}

export function getDefaultAccountData(): AccountData {
  return {
    followedProfiles: {},
    settings: {
      followLimit: DEFAULT_FOLLOW_LIMIT,
      unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
      skipFollowers: DEFAULT_SKIP_FOLLOWERS,
    },
    automation: { ...DEFAULT_AUTOMATION },
  };
}

export async function getStorageData(): Promise<StorageData> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY] as StorageData | LegacyStorageData | undefined;

  if (!data) {
    return getDefaultStorageData();
  }

  // Migration from old format (no accounts structure)
  if ('followedProfiles' in data && !('accounts' in data)) {
    const legacyData = data as LegacyStorageData;
    const userId = getCurrentUserId();
    const migratedData: StorageData = {
      accounts: {},
      settings: {
        followLimit: DEFAULT_FOLLOW_LIMIT,
        unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
        skipFollowers: DEFAULT_SKIP_FOLLOWERS,
      },
      automation: { ...DEFAULT_AUTOMATION },
    };
    if (userId) {
      migratedData.accounts[userId] = {
        followedProfiles: legacyData.followedProfiles,
        dailyActions: legacyData.dailyActions
          ? {
              date: legacyData.dailyActions.date,
              followCount: Math.floor(legacyData.dailyActions.count / 2),
              unfollowCount: Math.ceil(legacyData.dailyActions.count / 2),
            }
          : undefined,
        settings: migratedData.settings,
        automation: migratedData.automation,
      };
    }
    await setStorageData(migratedData);
    return migratedData;
  }

  const storageData = data as StorageData;

  // Ensure settings exist
  if (!storageData.settings) {
    storageData.settings = {
      followLimit: DEFAULT_FOLLOW_LIMIT,
      unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
      skipFollowers: DEFAULT_SKIP_FOLLOWERS,
    };
  }

  // Ensure skipFollowers setting exists (migration for existing users)
  if (storageData.settings.skipFollowers === undefined) {
    storageData.settings.skipFollowers = DEFAULT_SKIP_FOLLOWERS;
  }

  // Ensure automation settings exist
  if (!storageData.automation) {
    storageData.automation = { ...DEFAULT_AUTOMATION };
  }

  return storageData;
}

export async function setStorageData(data: StorageData): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: data });
}

function getCurrentAccountId(): string {
  const userId = getCurrentUserId();
  if (!userId) {
    throw new Error('Not logged in to Instagram');
  }
  return userId;
}

async function getCurrentAccountIdAsync(): Promise<string> {
  const userId = await getCurrentUserIdAsync();
  if (!userId) {
    throw new Error('Not logged in to Instagram');
  }
  return userId;
}

export async function getAccountData(): Promise<AccountData> {
  const data = await getStorageData();
  const accountId = getCurrentAccountId();

  // Account doesn't exist yet - create with defaults
  if (!data.accounts[accountId]) {
    return getDefaultAccountData();
  }

  const accountData = data.accounts[accountId];

  // Migration: if account exists but doesn't have settings/automation yet,
  // migrate from global settings (for existing users)
  let needsMigration = false;

  if (!accountData.settings) {
    accountData.settings = data.settings || {
      followLimit: DEFAULT_FOLLOW_LIMIT,
      unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
      skipFollowers: DEFAULT_SKIP_FOLLOWERS,
    };
    needsMigration = true;
  }

  if (!accountData.automation) {
    accountData.automation = data.automation || { ...DEFAULT_AUTOMATION };
    needsMigration = true;
  }

  // Save migrated data
  if (needsMigration) {
    data.accounts[accountId] = accountData;
    await setStorageData(data);
  }

  return accountData;
}

export async function setAccountData(accountData: AccountData): Promise<void> {
  const data = await getStorageData();
  const accountId = getCurrentAccountId();
  data.accounts[accountId] = accountData;
  await setStorageData(data);
}

// Async versions for background script (uses browser.cookies API)
export async function getAccountDataAsync(): Promise<AccountData> {
  const data = await getStorageData();
  const accountId = await getCurrentAccountIdAsync();

  if (!data.accounts[accountId]) {
    return getDefaultAccountData();
  }

  const accountData = data.accounts[accountId];

  let needsMigration = false;

  if (!accountData.settings) {
    accountData.settings = data.settings || {
      followLimit: DEFAULT_FOLLOW_LIMIT,
      unfollowLimit: DEFAULT_UNFOLLOW_LIMIT,
      skipFollowers: DEFAULT_SKIP_FOLLOWERS,
    };
    needsMigration = true;
  }

  if (!accountData.automation) {
    accountData.automation = data.automation || { ...DEFAULT_AUTOMATION };
    needsMigration = true;
  }

  if (needsMigration) {
    data.accounts[accountId] = accountData;
    await setStorageData(data);
  }

  return accountData;
}

export async function setAccountDataAsync(accountData: AccountData): Promise<void> {
  const data = await getStorageData();
  const accountId = await getCurrentAccountIdAsync();
  data.accounts[accountId] = accountData;
  await setStorageData(data);
}
