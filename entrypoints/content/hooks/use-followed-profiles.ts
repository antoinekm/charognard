import { useState, useEffect, useCallback } from 'react';
import type { FollowedProfile } from '@/lib/types';
import { checkFriendshipStatus, unfollowUser } from '@/lib/instagram';
import { getFollowedProfiles, removeFollowedProfile, updateFollowedBackStatus } from '@/lib/storage/profiles';
import { getRemainingDailyActions, incrementDailyActionCount, canPerformAction } from '@/lib/storage/daily-actions';
import { getSettings } from '@/lib/storage/settings';
import { toastManager } from '@/components/ui/toast';

export function useFollowedProfiles() {
  const [profiles, setProfiles] = useState<FollowedProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [checkProgress, setCheckProgress] = useState({ current: 0, total: 0 });
  const [unfollowingUser, setUnfollowingUser] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [massUnfollowing, setMassUnfollowing] = useState(false);
  const [massUnfollowProgress, setMassUnfollowProgress] = useState({ current: 0, total: 0 });
  const [filterNotFollowingBack, setFilterNotFollowingBack] = useState(false);
  const [remainingUnfollows, setRemainingUnfollows] = useState<number>(150);
  const [unfollowLimit, setUnfollowLimit] = useState<number>(150);

  const refreshRemainingActions = useCallback(async () => {
    const remaining = await getRemainingDailyActions('unfollow');
    const settings = await getSettings();
    setRemainingUnfollows(remaining);
    setUnfollowLimit(settings.unfollowLimit);
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFollowedProfiles();
      setProfiles(data);
      await refreshRemainingActions();
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoading(false);
    }
  }, [refreshRemainingActions]);

  const checkAllStatus = useCallback(async () => {
    if (profiles.length === 0) return;

    setCheckingStatus(true);
    setCheckProgress({ current: 0, total: profiles.length });

    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i];
      setCheckProgress({ current: i + 1, total: profiles.length });

      try {
        const status = await checkFriendshipStatus(profile.user.pk);
        await updateFollowedBackStatus(profile.user.pk, status.followed_by);
        setProfiles((prev) =>
          prev.map((p) => (p.user.pk === profile.user.pk ? { ...p, followedBack: status.followed_by } : p))
        );
      } catch (err) {
        console.error('Failed to check status:', profile.user.username, err);
      }

      if (i < profiles.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
      }
    }

    setCheckingStatus(false);
    setCheckProgress({ current: 0, total: 0 });
  }, [profiles]);

  const handleUnfollow = useCallback(async (userId: string) => {
    if (!(await canPerformAction('unfollow'))) {
      toastManager.add({ title: 'Daily unfollow limit reached', type: 'error' });
      return;
    }

    setUnfollowingUser(userId);
    const profile = profiles.find((p) => p.user.pk === userId);

    try {
      await unfollowUser(userId);
      await incrementDailyActionCount('unfollow');
      await removeFollowedProfile(userId);
      setProfiles((prev) => prev.filter((p) => p.user.pk !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      await refreshRemainingActions();
      toastManager.add({ title: `Unfollowed @${profile?.user.username ?? 'user'}`, type: 'success' });
    } catch (err) {
      console.error('Failed to unfollow:', err);
      toastManager.add({ title: 'Failed to unfollow', type: 'error' });
    } finally {
      setUnfollowingUser(null);
    }
  }, [profiles, refreshRemainingActions]);

  const handleRemoveFromList = useCallback(async (userId: string) => {
    const profile = profiles.find((p) => p.user.pk === userId);

    try {
      await removeFollowedProfile(userId);
      setProfiles((prev) => prev.filter((p) => p.user.pk !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      toastManager.add({ title: `Removed @${profile?.user.username ?? 'user'} from list`, type: 'success' });
    } catch (err) {
      console.error('Failed to remove from list:', err);
      toastManager.add({ title: 'Failed to remove from list', type: 'error' });
    }
  }, [profiles]);

  const toggleSelectUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  }, []);

  const filteredProfiles = filterNotFollowingBack
    ? profiles.filter((p) => p.followedBack === false)
    : profiles;

  const selectAll = useCallback(() => {
    setSelectedUsers(new Set(filteredProfiles.map((p) => p.user.pk)));
  }, [filteredProfiles]);

  const deselectAll = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const handleMassUnfollow = useCallback(async () => {
    const usersToUnfollow = profiles.filter((p) => selectedUsers.has(p.user.pk));

    if (usersToUnfollow.length === 0) return;

    setMassUnfollowing(true);
    setMassUnfollowProgress({ current: 0, total: usersToUnfollow.length });

    for (let i = 0; i < usersToUnfollow.length; i++) {
      if (!(await canPerformAction('unfollow'))) {
        console.error('Daily unfollow limit reached, stopping mass unfollow');
        break;
      }

      const profile = usersToUnfollow[i];
      setMassUnfollowProgress({ current: i + 1, total: usersToUnfollow.length });

      try {
        await unfollowUser(profile.user.pk);
        await incrementDailyActionCount('unfollow');
        await removeFollowedProfile(profile.user.pk);
        setProfiles((prev) => prev.filter((p) => p.user.pk !== profile.user.pk));
        setSelectedUsers((prev) => {
          const next = new Set(prev);
          next.delete(profile.user.pk);
          return next;
        });
        setRemainingUnfollows((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to unfollow:', profile.user.username, err);
      }

      if (i < usersToUnfollow.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
      }
    }

    await refreshRemainingActions();
    setMassUnfollowing(false);
    setMassUnfollowProgress({ current: 0, total: 0 });
  }, [profiles, selectedUsers, refreshRemainingActions]);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  const notFollowingBackCount = profiles.filter((p) => p.followedBack === false).length;
  const unknownCount = profiles.filter((p) => p.followedBack === null).length;

  return {
    // Data
    profiles,
    filteredProfiles,
    loading,
    remainingUnfollows,
    unfollowLimit,
    notFollowingBackCount,
    unknownCount,

    // Check status
    checkingStatus,
    checkProgress,
    checkAllStatus,

    // Single unfollow
    unfollowingUser,
    handleUnfollow,
    handleRemoveFromList,

    // Selection
    selectedUsers,
    toggleSelectUser,
    selectAll,
    deselectAll,

    // Mass unfollow
    massUnfollowing,
    massUnfollowProgress,
    handleMassUnfollow,

    // Filter
    filterNotFollowingBack,
    setFilterNotFollowingBack,

    // Refresh
    loadProfiles,
  };
}
