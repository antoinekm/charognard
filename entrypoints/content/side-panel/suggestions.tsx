import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { DataTable, DataTableBody } from '@/components/ui/data-table/data-table';
import { DataTableHeader, DataTableHeaderCell, type SortDirection } from '@/components/ui/data-table/data-table-header';
import { DataTableRow } from '@/components/ui/data-table/data-table-row';
import { DataTableCell } from '@/components/ui/data-table/data-table-cell';
import { DataTableUserCell } from '@/components/ui/data-table/data-table-user-cell';
import { useAuth } from '../hooks/use-auth';
import { fetchSuggestions, followUser, unfollowUser, checkFriendshipStatus } from '@/lib/instagram';
import { addFollowedProfile, removeFollowedProfile } from '@/lib/storage/profiles';
import { getRemainingDailyActions, incrementDailyActionCount, canPerformAction } from '@/lib/storage/daily-actions';
import { getSettings } from '@/lib/storage/settings';
import { logger } from '@/lib/storage/logs';
import type { Suggestion } from '@/lib/types';
import { toastManager } from '@/components/ui/toast';
import { RefreshCwIcon, UserPlusIcon, UserMinusIcon, LogInIcon, UsersIcon } from 'lucide-react';
import { VerifiedBadge } from '../components/ui/verified-badge';
import { ActionFooter } from '../components/ui/action-footer';
import { SelectionBar } from '../components/side-panel/suggestions/selection-bar';
import { ProfileListSkeleton } from '../components/side-panel/suggestions/profile-list-skeleton';
import type { SuggestionFilters } from '../components/side-panel/suggestions/filter-popover';

interface SuggestionsTabProps {
  container: HTMLElement;
}

export function SuggestionsTab({ container }: SuggestionsTabProps) {
  const { setLoggedOut } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [followingUser, setFollowingUser] = useState<string | null>(null);
  const [nextMaxId, setNextMaxId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [massFollowing, setMassFollowing] = useState(false);
  const [massFollowProgress, setMassFollowProgress] = useState({ current: 0, total: 0 });
  const [filters, setFilters] = useState<SuggestionFilters>({ privacy: [], verified: [] });
  const [remainingFollows, setRemainingFollows] = useState<number>(150);
  const [followLimit, setFollowLimit] = useState<number>(150);
  const [sortKey, setSortKey] = useState<'username' | 'reason' | 'privacy' | 'verified' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const loadSuggestions = async (append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const data = await fetchSuggestions(append ? nextMaxId ?? undefined : undefined);
      if (append) {
        setSuggestions((prev) => [...prev, ...data.suggested_users.suggestions]);
      } else {
        setSuggestions(data.suggested_users.suggestions);
      }
      setNextMaxId(data.max_id || null);
      setHasMore(data.more_available);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load suggestions';
      setError(message);
      if (message.toLowerCase().includes('log in')) {
        setLoggedOut();
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const refreshRemainingActions = async () => {
    const remainingFollow = await getRemainingDailyActions('follow');
    const settings = await getSettings();
    setRemainingFollows(remainingFollow);
    setFollowLimit(settings.followLimit);
  };

  const handleFollow = async (userId: string) => {
    if (!(await canPerformAction('follow'))) {
      toastManager.add({ title: 'Daily follow limit reached', type: 'error' });
      return;
    }

    setFollowingUser(userId);
    const suggestion = suggestions.find((s) => s.user.pk === userId);

    try {
      await followUser(userId);
      await incrementDailyActionCount('follow');
      if (suggestion) {
        await addFollowedProfile(suggestion.user);
        toastManager.add({ title: `Followed @${suggestion.user.username}`, type: 'success' });
        await logger.success('follow', `Followed @${suggestion.user.username}`);
      }
      setFollowedUsers((prev) => new Set([...prev, userId]));
      await refreshRemainingActions();
    } catch (err) {
      console.error('Failed to follow:', err);
      toastManager.add({ title: 'Failed to follow', type: 'error' });
      await logger.error('follow', `Failed to follow @${suggestion?.user.username ?? userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFollowingUser(null);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!(await canPerformAction('unfollow'))) {
      toastManager.add({ title: 'Daily unfollow limit reached', type: 'error' });
      return;
    }

    setFollowingUser(userId);
    const suggestion = suggestions.find((s) => s.user.pk === userId);

    try {
      await unfollowUser(userId);
      await incrementDailyActionCount('unfollow');
      await removeFollowedProfile(userId);
      setFollowedUsers((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
      toastManager.add({ title: `Unfollowed @${suggestion?.user.username ?? 'user'}`, type: 'success' });
      await logger.success('unfollow', `Unfollowed @${suggestion?.user.username ?? userId}`);
    } catch (err) {
      console.error('Failed to unfollow:', err);
      toastManager.add({ title: 'Failed to unfollow', type: 'error' });
      await logger.error('unfollow', `Failed to unfollow @${suggestion?.user.username ?? userId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setFollowingUser(null);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((s) => {
      // Privacy filter: empty or both = all, single value = filter
      if (filters.privacy.length === 1) {
        if (filters.privacy[0] === 'public' && s.user.is_private) return false;
        if (filters.privacy[0] === 'private' && !s.user.is_private) return false;
      }
      // Verified filter: empty or both = all, single value = filter
      if (filters.verified.length === 1) {
        if (filters.verified[0] === 'verified' && !s.user.is_verified) return false;
        if (filters.verified[0] === 'not-verified' && s.user.is_verified) return false;
      }
      return true;
    });
  }, [suggestions, filters]);

  const selectableUsers = filteredSuggestions.filter(
    (s) => !followedUsers.has(s.user.pk)
  );

  const handleSort = (key: 'username' | 'reason' | 'privacy' | 'verified') => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedSuggestions = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredSuggestions;

    return [...filteredSuggestions].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'username':
          comparison = a.user.username.localeCompare(b.user.username);
          break;
        case 'reason':
          comparison = (a.social_context || '').localeCompare(b.social_context || '');
          break;
        case 'privacy':
          comparison = Number(a.user.is_private) - Number(b.user.is_private);
          break;
        case 'verified':
          comparison = Number(b.user.is_verified) - Number(a.user.is_verified);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredSuggestions, sortKey, sortDirection]);

  const handleMassFollow = async () => {
    const usersToFollow = suggestions.filter(
      (s) => selectedUsers.has(s.user.pk) && !followedUsers.has(s.user.pk)
    );

    if (usersToFollow.length === 0) return;

    const settings = await getSettings();
    const shouldSkipFollowers = settings.skipFollowers;

    setMassFollowing(true);
    setMassFollowProgress({ current: 0, total: usersToFollow.length });

    let skippedCount = 0;

    for (let i = 0; i < usersToFollow.length; i++) {
      if (!(await canPerformAction('follow'))) {
        console.error('Daily follow limit reached, stopping mass follow');
        break;
      }

      const suggestion = usersToFollow[i];
      setMassFollowProgress({ current: i + 1, total: usersToFollow.length });

      try {
        // Check if user already follows us (skip if enabled)
        if (shouldSkipFollowers) {
          try {
            const friendshipStatus = await checkFriendshipStatus(suggestion.user.pk);
            if (friendshipStatus.followed_by) {
              // User already follows us, skip them
              setSelectedUsers((prev) => {
                const next = new Set(prev);
                next.delete(suggestion.user.pk);
                return next;
              });
              skippedCount++;
              // Small delay before checking next user
              await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 500));
              continue;
            }
          } catch (err) {
            // If friendship check fails, proceed with follow attempt
            console.error('Failed to check friendship status:', suggestion.user.username, err);
          }
        }

        await followUser(suggestion.user.pk);
        await incrementDailyActionCount('follow');
        await addFollowedProfile(suggestion.user);
        setFollowedUsers((prev) => new Set([...prev, suggestion.user.pk]));
        setSelectedUsers((prev) => {
          const next = new Set(prev);
          next.delete(suggestion.user.pk);
          return next;
        });
        setRemainingFollows((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to follow:', suggestion.user.username, err);
      }

      if (i < usersToFollow.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 2000));
      }
    }

    if (skippedCount > 0) {
      toastManager.add({
        title: `Skipped ${skippedCount} user${skippedCount > 1 ? 's' : ''} who already follow you`,
        type: 'info',
      });
    }

    await refreshRemainingActions();
    setMassFollowing(false);
    setMassFollowProgress({ current: 0, total: 0 });
  };

  useEffect(() => {
    loadSuggestions();
    refreshRemainingActions();
  }, []);

  const primaryText = `${suggestions.length} suggestions${followedUsers.size > 0 ? ` • ${followedUsers.size} followed this session` : ''}`;

  return (
    <>
      <SelectionBar
        loading={loading}
        hasItems={suggestions.length > 0}
        massFollowing={massFollowing}
        filters={filters}
        onFiltersChange={setFilters}
        onRefresh={() => loadSuggestions()}
        container={container}
      />

      <ScrollArea className="flex-1">
        {loading ? (
          <ProfileListSkeleton />
        ) : error ? (
          error.toLowerCase().includes('log in') ? (
            <Empty className="h-64 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>Please log in to Instagram to see suggestions.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  onClick={() => window.open('https://www.instagram.com/accounts/login/', '_blank')}
                >
                  Open Instagram
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive-foreground mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={() => loadSuggestions()}>
                Retry
              </Button>
            </div>
          )
        ) : suggestions.length === 0 ? (
          <Empty className="h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <UsersIcon />
              </EmptyMedia>
              <EmptyTitle>No suggestions</EmptyTitle>
              <EmptyDescription>We couldn't find any suggestions for you right now.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => loadSuggestions()}>
                <RefreshCwIcon />
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable>
            <DataTableHeader>
              <DataTableHeaderCell align="center" className="w-10">
                <Checkbox
                  checked={selectedUsers.size === selectableUsers.length && selectableUsers.length > 0}
                  indeterminate={selectedUsers.size > 0 && selectedUsers.size < selectableUsers.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedUsers(new Set(selectableUsers.map((s) => s.user.pk)));
                    } else {
                      setSelectedUsers(new Set());
                    }
                  }}
                  disabled={massFollowing || selectableUsers.length === 0}
                  className="cursor-pointer"
                />
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'username' ? sortDirection : null}
                onSort={() => handleSort('username')}
              >
                User
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'reason' ? sortDirection : null}
                onSort={() => handleSort('reason')}
              >
                Reason
              </DataTableHeaderCell>
              <DataTableHeaderCell
                align="center"
                sortable
                sortDirection={sortKey === 'privacy' ? sortDirection : null}
                onSort={() => handleSort('privacy')}
              >
                Privacy
              </DataTableHeaderCell>
              <DataTableHeaderCell
                align="center"
                sortable
                sortDirection={sortKey === 'verified' ? sortDirection : null}
                onSort={() => handleSort('verified')}
              >
                <VerifiedBadge />
              </DataTableHeaderCell>
              <DataTableHeaderCell align="center" noPadding>
                <Button
                  size="xs"
                  onClick={handleMassFollow}
                  disabled={massFollowing || remainingFollows === 0 || selectedUsers.size === 0}
                  className={selectedUsers.size === 0 ? 'invisible' : ''}
                >
                  {massFollowing ? (
                    <>
                      <Spinner className="size-3" />
                      {massFollowProgress.current}/{massFollowProgress.total}
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="size-3" />
                      Follow {selectedUsers.size || 0}
                    </>
                  )}
                </Button>
              </DataTableHeaderCell>
            </DataTableHeader>
            <DataTableBody>
              {sortedSuggestions.map((suggestion) => {
                const isFollowed = followedUsers.has(suggestion.user.pk);
                const isFollowing = followingUser === suggestion.user.pk;

                return (
                  <DataTableRow
                    key={suggestion.user.pk}
                    selected={selectedUsers.has(suggestion.user.pk)}
                  >
                    <DataTableCell align="center">
                      {!isFollowed && (
                        <Checkbox
                          checked={selectedUsers.has(suggestion.user.pk)}
                          onCheckedChange={() => toggleSelectUser(suggestion.user.pk)}
                          disabled={massFollowing}
                          className="cursor-pointer"
                        />
                      )}
                    </DataTableCell>
                    <DataTableCell noPadding>
                      <DataTableUserCell user={suggestion.user} />
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-sm text-muted-foreground truncate">
                        {suggestion.social_context || '—'}
                      </span>
                    </DataTableCell>
                    <DataTableCell align="center">
                      <span className="text-sm text-muted-foreground">
                        {suggestion.user.is_private ? 'Private' : 'Public'}
                      </span>
                    </DataTableCell>
                    <DataTableCell align="center">
                      {suggestion.user.is_verified && <VerifiedBadge />}
                    </DataTableCell>
                    <DataTableCell align="center" noPadding>
                      <Button
                        variant={isFollowed ? 'secondary' : 'default'}
                        size="xs"
                        onClick={() =>
                          isFollowed ? handleUnfollow(suggestion.user.pk) : handleFollow(suggestion.user.pk)
                        }
                        disabled={isFollowing || remainingFollows === 0}
                      >
                        {isFollowing ? (
                          <Spinner className="size-3" />
                        ) : isFollowed ? (
                          <>
                            <UserMinusIcon className="size-3" />
                            Following
                          </>
                        ) : (
                          <>
                            <UserPlusIcon className="size-3" />
                            Follow
                          </>
                        )}
                      </Button>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>

            {hasMore && (
              <div className="p-3 text-center border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadSuggestions(true)}
                  disabled={loadingMore}
                  className="w-full"
                >
                  {loadingMore ? <Spinner className="size-4" /> : 'Load more'}
                </Button>
              </div>
            )}
          </DataTable>
        )}
      </ScrollArea>

      <ActionFooter
        primaryText={primaryText}
        remaining={remainingFollows}
        limit={followLimit}
        actionLabel="follows"
      />
    </>
  );
}
