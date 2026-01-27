import type { ProfileSnapshot } from '@/types/storage';
import { getAccountData, setAccountData } from '.';

export const MAX_SNAPSHOTS = 90;

function getDateString(timestamp: number): string {
  return new Date(timestamp).toISOString().split('T')[0];
}

export async function addSnapshot(
  followerCount: number,
  followingCount: number
): Promise<void> {
  const accountData = await getAccountData();

  if (!accountData.profileSnapshots) {
    accountData.profileSnapshots = [];
  }

  const today = getDateString(Date.now());
  const lastSnapshot = accountData.profileSnapshots[accountData.profileSnapshots.length - 1];

  if (lastSnapshot && getDateString(lastSnapshot.timestamp) === today) {
    lastSnapshot.followerCount = followerCount;
    lastSnapshot.followingCount = followingCount;
    lastSnapshot.timestamp = Date.now();
  } else {
    accountData.profileSnapshots.push({
      timestamp: Date.now(),
      followerCount,
      followingCount,
    });
  }

  if (accountData.profileSnapshots.length > MAX_SNAPSHOTS) {
    accountData.profileSnapshots = accountData.profileSnapshots.slice(-MAX_SNAPSHOTS);
  }

  await setAccountData(accountData);
}

export async function getSnapshots(): Promise<ProfileSnapshot[]> {
  const accountData = await getAccountData();
  return accountData.profileSnapshots || [];
}
