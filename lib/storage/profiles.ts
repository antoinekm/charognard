import type { InstagramUser, FollowedProfile } from '@/lib/types';
import { getAccountData, setAccountData } from '.';

export async function addFollowedProfile(user: InstagramUser): Promise<void> {
  const accountData = await getAccountData();
  accountData.followedProfiles[user.pk] = {
    user,
    followedAt: Date.now(),
    followedBack: null,
  };
  await setAccountData(accountData);
}

export async function removeFollowedProfile(userId: string): Promise<void> {
  const accountData = await getAccountData();
  delete accountData.followedProfiles[userId];
  await setAccountData(accountData);
}

export async function getFollowedProfiles(): Promise<FollowedProfile[]> {
  const accountData = await getAccountData();
  return Object.values(accountData.followedProfiles).sort(
    (a, b) => b.followedAt - a.followedAt
  );
}

export async function getFollowedProfile(userId: string): Promise<FollowedProfile | null> {
  const accountData = await getAccountData();
  return accountData.followedProfiles[userId] || null;
}

export async function updateFollowedBackStatus(
  userId: string,
  followedBack: boolean
): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.followedProfiles[userId]) {
    accountData.followedProfiles[userId].followedBack = followedBack;
    accountData.followedProfiles[userId].lastCheckedAt = Date.now();
    await setAccountData(accountData);
  }
}

export async function getProfilesOlderThan(days: number): Promise<FollowedProfile[]> {
  const accountData = await getAccountData();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return Object.values(accountData.followedProfiles)
    .filter((profile) => profile.followedAt < cutoff)
    .sort((a, b) => a.followedAt - b.followedAt);
}

export async function clearAllFollowedProfiles(): Promise<void> {
  const accountData = await getAccountData();
  accountData.followedProfiles = {};
  await setAccountData(accountData);
}

export async function updateProfilePicUrl(userId: string, profilePicUrl: string): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.followedProfiles[userId]) {
    accountData.followedProfiles[userId].user.profile_pic_url = profilePicUrl;
    await setAccountData(accountData);
  }
}
