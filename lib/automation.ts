import { fetchSuggestions, followUser, unfollowUser, checkFriendshipStatus } from './instagram';
import {
  getAutomationSettings,
  setLastAutomationRun,
  getAutomationProgress,
  startAutomationProgress,
  updateAutomationProgress,
} from './storage/automation';
import {
  getFollowedProfiles,
  addFollowedProfile,
  removeFollowedProfile,
  updateFollowedBackStatus,
} from './storage/profiles';
import { canPerformAction, incrementDailyActionCount } from './storage/daily-actions';
import { loggerAsync } from './storage/logs';

export interface AutomationResult {
  followedCount: number;
  unfollowedCount: number;
  errors: string[];
}

// Random delay between actions (2-4 seconds)
function randomDelay(): Promise<void> {
  const delay = 2000 + Math.random() * 2000;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

export async function runAutomation(): Promise<AutomationResult> {
  const result: AutomationResult = {
    followedCount: 0,
    unfollowedCount: 0,
    errors: [],
  };

  const settings = await getAutomationSettings();

  if (!settings.enabled) {
    return result;
  }

  // Check if there's an in-progress automation to resume
  let progress = await getAutomationProgress();
  const isResuming = !!progress;

  if (!progress) {
    // Start new automation progress
    await startAutomationProgress(settings.autoFollowCount);
    progress = await getAutomationProgress();
    await loggerAsync.info('automation_start', `Automation started (target: ${settings.autoFollowCount} follows)`);
  } else {
    await loggerAsync.info('automation_start', `Automation resumed (${progress.completedFollowCount}/${progress.targetFollowCount} follows done)`);
  }

  // Auto-unfollow first (so we free up follow slots) - skip if already done
  if (settings.autoUnfollowEnabled && !progress?.unfollowCompleted) {
    try {
      const unfollowResult = await runAutoUnfollow(
        settings.autoUnfollowDaysThreshold,
        settings.autoUnfollowOnlyNonFollowers ?? true
      );
      result.unfollowedCount = unfollowResult.count;
      result.errors.push(...unfollowResult.errors);
      await updateAutomationProgress({ unfollowCompleted: true });
    } catch (error) {
      result.errors.push(`Auto-unfollow failed: ${error}`);
    }
  }

  // Auto-follow - resume from where we left off
  if (settings.autoFollowEnabled && progress) {
    const remainingFollows = progress.targetFollowCount - progress.completedFollowCount;

    if (remainingFollows > 0) {
      if (isResuming) {
        console.log(`[Charognard] Resuming automation: ${progress.completedFollowCount}/${progress.targetFollowCount} follows done`);
      }

      try {
        const alreadyCompleted = progress.completedFollowCount;
        const followResult = await runAutoFollow(remainingFollows, async (sessionCount) => {
          // Update progress after each follow (alreadyCompleted + current session count)
          await updateAutomationProgress({
            completedFollowCount: alreadyCompleted + sessionCount,
          });
        });
        result.followedCount = followResult.count;
        result.errors.push(...followResult.errors);
      } catch (error) {
        result.errors.push(`Auto-follow failed: ${error}`);
      }
    }
  }

  // Mark as completed (this also clears the progress)
  await setLastAutomationRun();

  // Log automation completion
  if (result.errors.length > 0) {
    await loggerAsync.warning('automation_end', `Automation completed with ${result.errors.length} error(s) - ${result.followedCount} followed, ${result.unfollowedCount} unfollowed`);
  } else {
    await loggerAsync.success('automation_end', `Automation completed - ${result.followedCount} followed, ${result.unfollowedCount} unfollowed`);
  }

  return result;
}

async function runAutoFollow(
  maxCount: number,
  onProgress?: (completedCount: number) => Promise<void>
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;
  let consecutiveEmptyBatches = 0;
  const maxEmptyBatches = 3; // Safety limit to avoid infinite loops

  while (count < maxCount && consecutiveEmptyBatches < maxEmptyBatches) {
    try {
      // Fetch suggestions (Instagram refreshes these after follows)
      const response = await fetchSuggestions();
      const suggestions = response.suggested_users.suggestions;

      // Filter out private accounts
      const publicSuggestions = suggestions.filter((s) => !s.user.is_private);

      if (publicSuggestions.length === 0) {
        consecutiveEmptyBatches++;
        continue;
      }

      let followedInBatch = 0;

      for (const suggestion of publicSuggestions) {
        if (count >= maxCount) {
          break;
        }

        if (!(await canPerformAction('follow'))) {
          // Daily limit reached, exit completely
          return { count, errors };
        }

        try {
          await followUser(suggestion.user.pk);
          await incrementDailyActionCount('follow');
          await addFollowedProfile(suggestion.user);
          count++;
          followedInBatch++;

          // Save progress after each follow
          if (onProgress) {
            await onProgress(count);
          }

          // Random delay between actions
          if (count < maxCount) {
            await randomDelay();
          }
        } catch (error) {
          errors.push(`Failed to follow @${suggestion.user.username}: ${error}`);
        }
      }

      // Reset empty batch counter if we followed anyone
      if (followedInBatch > 0) {
        consecutiveEmptyBatches = 0;
      } else {
        consecutiveEmptyBatches++;
      }
    } catch (error) {
      errors.push(`Failed to fetch suggestions: ${error}`);
      break;
    }
  }

  return { count, errors };
}

async function runAutoUnfollow(
  daysThreshold: number,
  onlyNonFollowers: boolean
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const profiles = await getFollowedProfiles();
    const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;

    // Get profiles older than threshold
    const oldProfiles = profiles.filter((p) => p.followedAt < cutoff);

    for (const profile of oldProfiles) {
      if (!(await canPerformAction('unfollow'))) {
        break;
      }

      try {
        let shouldUnfollow = true;

        // Only check follow-back status if we want to keep followers
        if (onlyNonFollowers) {
          const shouldCheck = !profile.lastCheckedAt ||
            Date.now() - profile.lastCheckedAt > 24 * 60 * 60 * 1000; // 24 hours

          let followedBack = profile.followedBack;

          if (shouldCheck) {
            const status = await checkFriendshipStatus(profile.user.pk);
            followedBack = status.followed_by;
            await updateFollowedBackStatus(profile.user.pk, followedBack);
            await randomDelay();
          }

          shouldUnfollow = followedBack === false;
        }

        if (shouldUnfollow) {
          await unfollowUser(profile.user.pk);
          await incrementDailyActionCount('unfollow');
          await removeFollowedProfile(profile.user.pk);
          count++;
          await randomDelay();
        }
      } catch (error) {
        errors.push(`Failed to process @${profile.user.username}: ${error}`);
      }
    }
  } catch (error) {
    errors.push(`Failed to get profiles: ${error}`);
  }

  return { count, errors };
}
