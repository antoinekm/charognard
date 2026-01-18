import { useState, useEffect, useCallback } from 'react';
import type { ProspectList, ProspectListUser } from '@/lib/types';
import {
  getLists,
  getList,
  createList,
  deleteList,
  updateList,
  getListUsers,
  removeUserFromList,
  removeUsersFromList,
  getListUserCount,
} from '@/lib/storage/lists';
import { followUser } from '@/lib/instagram';
import { addFollowedProfile } from '@/lib/storage/profiles';
import { getRemainingDailyActions, incrementDailyActionCount, canPerformAction } from '@/lib/storage/daily-actions';
import { getSettings } from '@/lib/storage/settings';
import { toastManager } from '@/components/ui/toast';

export function useLists() {
  const [lists, setLists] = useState<(ProspectList & { userCount: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLists();
      const listsWithCounts = await Promise.all(
        data.map(async (list) => ({
          ...list,
          userCount: await getListUserCount(list.id),
        }))
      );
      setLists(listsWithCounts);
    } catch (err) {
      console.error('Failed to load lists:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateList = useCallback(async (name: string) => {
    setCreating(true);
    try {
      const list = await createList(name);
      setLists((prev) => [{ ...list, userCount: 0 }, ...prev]);
      toastManager.add({ title: `Created list "${name}"`, type: 'success' });
      return list;
    } catch (err) {
      console.error('Failed to create list:', err);
      toastManager.add({ title: 'Failed to create list', type: 'error' });
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const handleDeleteList = useCallback(async (listId: string) => {
    try {
      const list = lists.find((l) => l.id === listId);
      await deleteList(listId);
      setLists((prev) => prev.filter((l) => l.id !== listId));
      toastManager.add({ title: `Deleted list "${list?.name ?? ''}"`, type: 'success' });
    } catch (err) {
      console.error('Failed to delete list:', err);
      toastManager.add({ title: 'Failed to delete list', type: 'error' });
    }
  }, [lists]);

  const handleRenameList = useCallback(async (listId: string, name: string) => {
    try {
      await updateList(listId, name);
      setLists((prev) =>
        prev.map((l) => (l.id === listId ? { ...l, name } : l))
      );
      toastManager.add({ title: `Renamed list to "${name}"`, type: 'success' });
    } catch (err) {
      console.error('Failed to rename list:', err);
      toastManager.add({ title: 'Failed to rename list', type: 'error' });
    }
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  return {
    lists,
    loading,
    creating,
    loadLists,
    handleCreateList,
    handleDeleteList,
    handleRenameList,
  };
}

export function useListDetail(listId: string) {
  const [list, setList] = useState<ProspectList | null>(null);
  const [users, setUsers] = useState<ProspectListUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [followingUser, setFollowingUser] = useState<string | null>(null);
  const [massFollowing, setMassFollowing] = useState(false);
  const [massFollowProgress, setMassFollowProgress] = useState({ current: 0, total: 0 });
  const [remainingFollows, setRemainingFollows] = useState<number>(150);
  const [followLimit, setFollowLimit] = useState<number>(150);

  const refreshRemainingActions = useCallback(async () => {
    const remaining = await getRemainingDailyActions('follow');
    const settings = await getSettings();
    setRemainingFollows(remaining);
    setFollowLimit(settings.followLimit);
  }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [listData, usersData] = await Promise.all([
        getList(listId),
        getListUsers(listId),
      ]);
      setList(listData);
      setUsers(usersData);
      await refreshRemainingActions();
    } catch (err) {
      console.error('Failed to load list users:', err);
    } finally {
      setLoading(false);
    }
  }, [listId, refreshRemainingActions]);

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

  const selectAll = useCallback(() => {
    setSelectedUsers(new Set(users.map((u) => u.user.pk)));
  }, [users]);

  const deselectAll = useCallback(() => {
    setSelectedUsers(new Set());
  }, []);

  const handleFollow = useCallback(async (userId: string) => {
    if (!(await canPerformAction('follow'))) {
      toastManager.add({ title: 'Daily follow limit reached', type: 'error' });
      return;
    }

    setFollowingUser(userId);
    const listUser = users.find((u) => u.user.pk === userId);

    try {
      await followUser(userId);
      await incrementDailyActionCount('follow');
      if (listUser) {
        await addFollowedProfile(listUser.user);
      }
      await removeUserFromList(listId, userId);
      setUsers((prev) => prev.filter((u) => u.user.pk !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      await refreshRemainingActions();
      toastManager.add({ title: `Followed @${listUser?.user.username ?? 'user'}`, type: 'success' });
    } catch (err) {
      console.error('Failed to follow:', err);
      toastManager.add({ title: 'Failed to follow', type: 'error' });
    } finally {
      setFollowingUser(null);
    }
  }, [listId, users, refreshRemainingActions]);

  const handleRemoveFromList = useCallback(async (userId: string) => {
    const listUser = users.find((u) => u.user.pk === userId);

    try {
      await removeUserFromList(listId, userId);
      setUsers((prev) => prev.filter((u) => u.user.pk !== userId));
      setSelectedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      toastManager.add({ title: `Removed @${listUser?.user.username ?? 'user'} from list`, type: 'success' });
    } catch (err) {
      console.error('Failed to remove from list:', err);
      toastManager.add({ title: 'Failed to remove from list', type: 'error' });
    }
  }, [listId, users]);

  const handleMassFollow = useCallback(async () => {
    const usersToFollow = users.filter((u) => selectedUsers.has(u.user.pk));

    if (usersToFollow.length === 0) return;

    setMassFollowing(true);
    setMassFollowProgress({ current: 0, total: usersToFollow.length });

    for (let i = 0; i < usersToFollow.length; i++) {
      if (!(await canPerformAction('follow'))) {
        console.error('Daily follow limit reached, stopping mass follow');
        break;
      }

      const listUser = usersToFollow[i];
      setMassFollowProgress({ current: i + 1, total: usersToFollow.length });

      try {
        await followUser(listUser.user.pk);
        await incrementDailyActionCount('follow');
        await addFollowedProfile(listUser.user);
        await removeUserFromList(listId, listUser.user.pk);
        setUsers((prev) => prev.filter((u) => u.user.pk !== listUser.user.pk));
        setSelectedUsers((prev) => {
          const next = new Set(prev);
          next.delete(listUser.user.pk);
          return next;
        });
        setRemainingFollows((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to follow:', listUser.user.username, err);
      }

      if (i < usersToFollow.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
      }
    }

    await refreshRemainingActions();
    setMassFollowing(false);
    setMassFollowProgress({ current: 0, total: 0 });
  }, [listId, users, selectedUsers, refreshRemainingActions]);

  const handleMassRemoveFromList = useCallback(async () => {
    const usersToRemove = users.filter((u) => selectedUsers.has(u.user.pk));

    if (usersToRemove.length === 0) return;

    try {
      await removeUsersFromList(listId, usersToRemove.map((u) => u.user.pk));
      setUsers((prev) => prev.filter((u) => !selectedUsers.has(u.user.pk)));
      setSelectedUsers(new Set());
      toastManager.add({ title: `Removed ${usersToRemove.length} users from list`, type: 'success' });
    } catch (err) {
      console.error('Failed to remove from list:', err);
      toastManager.add({ title: 'Failed to remove from list', type: 'error' });
    }
  }, [listId, users, selectedUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    list,
    users,
    loading,
    remainingFollows,
    followLimit,

    // Selection
    selectedUsers,
    toggleSelectUser,
    selectAll,
    deselectAll,

    // Single follow
    followingUser,
    handleFollow,
    handleRemoveFromList,

    // Mass follow
    massFollowing,
    massFollowProgress,
    handleMassFollow,
    handleMassRemoveFromList,

    // Refresh
    loadUsers,
  };
}
