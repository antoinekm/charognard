import type { OnboardingData } from '@/types/storage';
import { getStorageData, setStorageData } from '.';

export async function getOnboardingData(): Promise<OnboardingData> {
  const data = await getStorageData();
  return data.onboarding || { completed: false, developerFollowed: false };
}

export async function setOnboardingCompleted(developerFollowed: boolean): Promise<void> {
  const data = await getStorageData();
  data.onboarding = {
    completed: true,
    completedAt: Date.now(),
    developerFollowed,
  };
  await setStorageData(data);
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const onboarding = await getOnboardingData();
  return onboarding.completed;
}
