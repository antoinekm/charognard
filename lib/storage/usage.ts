import type { StorageUsage } from '@/types/storage';
import { STORAGE_KEY, getStorageData } from '.';

const STORAGE_LIMIT_BYTES = 10 * 1024 * 1024; // 10 MB

export async function getStorageUsage(): Promise<StorageUsage> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const data = result[STORAGE_KEY];

  const usedBytes = data ? new Blob([JSON.stringify(data)]).size : 0;
  const percentage = (usedBytes / STORAGE_LIMIT_BYTES) * 100;

  // Count total profiles across all accounts
  let profilesCount = 0;
  if (data && typeof data === 'object' && data !== null && 'accounts' in data) {
    const storageData = await getStorageData();
    for (const accountId in storageData.accounts) {
      profilesCount += Object.keys(storageData.accounts[accountId].followedProfiles || {}).length;
    }
  }

  return {
    usedBytes,
    totalBytes: STORAGE_LIMIT_BYTES,
    percentage: Math.min(percentage, 100),
    profilesCount,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
