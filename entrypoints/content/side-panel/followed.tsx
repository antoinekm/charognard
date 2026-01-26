import { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { DataTable, DataTableBody } from '@/components/ui/data-table/data-table';
import { DataTableHeader, DataTableHeaderCell, type SortDirection } from '@/components/ui/data-table/data-table-header';
import { DataTableRow } from '@/components/ui/data-table/data-table-row';
import { DataTableCell } from '@/components/ui/data-table/data-table-cell';
import { DataTableUserCell } from '@/components/ui/data-table/data-table-user-cell';
import { RefreshCwIcon, UserMinusIcon, HeartIcon, SearchIcon, XIcon } from 'lucide-react';
import { ActionFooter } from '../components/ui/action-footer';
import { FollowBackStatus } from '../components/side-panel/followed/follow-back-status';
import { VerifiedBadge } from '../components/ui/verified-badge';
import { FollowedActionBar } from '../components/side-panel/followed/followed-action-bar';
import { useFollowedProfiles } from '../hooks/use-followed-profiles';
import { imageRefreshQueue } from '@/lib/image-refresh-queue';

interface FollowedTabProps {
  container: HTMLElement;
}

export function FollowedTab({ container }: FollowedTabProps) {
  const {
    profiles,
    filteredProfiles,
    loading,
    remainingUnfollows,
    unfollowLimit,
    notFollowingBackCount,
    unknownCount,
    checkingStatus,
    checkProgress,
    checkAllStatus,
    unfollowingUser,
    handleUnfollow,
    handleRemoveFromList,
    selectedUsers,
    toggleSelectUser,
    selectAll,
    deselectAll,
    massUnfollowing,
    massUnfollowProgress,
    handleMassUnfollow,
    handleMassRemoveFromList,
    filterNotFollowingBack,
    setFilterNotFollowingBack,
    loadProfiles,
    updateProfileImage,
  } = useFollowedProfiles();

  const [sortKey, setSortKey] = useState<'username' | 'followed' | 'status' | 'lastChecked' | 'verified' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleImageError = useCallback((userId: string) => {
    // Add to queue - it handles deduplication and rate limiting
    imageRefreshQueue.add({
      userId,
      onSuccess: (newUrl) => updateProfileImage(userId, newUrl),
    });
  }, [updateProfileImage]);

  const handleSort = (key: 'username' | 'followed' | 'status' | 'lastChecked' | 'verified') => {
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

  const sortedProfiles = useMemo(() => {
    if (!sortKey || !sortDirection) return filteredProfiles;

    return [...filteredProfiles].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'username':
          comparison = a.user.username.localeCompare(b.user.username);
          break;
        case 'followed':
          comparison = a.followedAt - b.followedAt;
          break;
        case 'status': {
          // Sort order: not following back (-1) < unknown (0) < following back (1)
          const statusOrder = (status: boolean | null) => {
            if (status === false) return -1;
            if (status === null || status === undefined) return 0;
            return 1;
          };
          comparison = statusOrder(a.followedBack) - statusOrder(b.followedBack);
          break;
        }
        case 'lastChecked':
          comparison = (a.lastCheckedAt || 0) - (b.lastCheckedAt || 0);
          break;
        case 'verified':
          comparison = Number(b.user.is_verified) - Number(a.user.is_verified);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredProfiles, sortKey, sortDirection]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const primaryText = `${profiles.length} followed${notFollowingBackCount > 0 ? ` • ${notFollowingBackCount} not following back` : ''}`;

  return (
    <div className="flex flex-col h-full">
      <FollowedActionBar
        checkingStatus={checkingStatus}
        checkProgress={checkProgress}
        onCheckAllStatus={checkAllStatus}
        massUnfollowing={massUnfollowing}
        filterNotFollowingBack={filterNotFollowingBack}
        onFilterChange={setFilterNotFollowingBack}
        notFollowingBackCount={notFollowingBackCount}
        unknownCount={unknownCount}
        profilesCount={profiles.length}
      />

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="size-6" />
          </div>
        ) : profiles.length === 0 ? (
          <Empty className="h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HeartIcon />
              </EmptyMedia>
              <EmptyTitle>No followed profiles</EmptyTitle>
              <EmptyDescription>Follow users from the Suggestions tab to track them here.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => loadProfiles()}>
                <RefreshCwIcon />
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        ) : filteredProfiles.length === 0 ? (
          <Empty className="h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <SearchIcon />
              </EmptyMedia>
              <EmptyTitle>No results</EmptyTitle>
              <EmptyDescription>No profiles match your current filter.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => setFilterNotFollowingBack(false)}>
                Clear filter
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable>
            <DataTableHeader>
              <DataTableHeaderCell align="center" className="w-10">
                <Checkbox
                  checked={selectedUsers.size === filteredProfiles.length && filteredProfiles.length > 0}
                  indeterminate={selectedUsers.size > 0 && selectedUsers.size < filteredProfiles.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                  disabled={massUnfollowing || checkingStatus || filteredProfiles.length === 0}
                  className="cursor-pointer"
                />
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'username' ? sortDirection : null}
                onSort={() => handleSort('username')}
                className="max-w-50"
              >
                User
              </DataTableHeaderCell>
              <DataTableHeaderCell
                align="center"
                sortable
                sortDirection={sortKey === 'verified' ? sortDirection : null}
                onSort={() => handleSort('verified')}
              >
                <VerifiedBadge />
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'followed' ? sortDirection : null}
                onSort={() => handleSort('followed')}
              >
                Followed
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'status' ? sortDirection : null}
                onSort={() => handleSort('status')}
              >
                Status
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'lastChecked' ? sortDirection : null}
                onSort={() => handleSort('lastChecked')}
              >
                Checked
              </DataTableHeaderCell>
              <DataTableHeaderCell align="center" noPadding>
                <Button
                  size="xs"
                  onClick={handleMassUnfollow}
                  disabled={massUnfollowing || checkingStatus || remainingUnfollows === 0 || selectedUsers.size === 0}
                  className={selectedUsers.size === 0 ? 'invisible' : ''}
                >
                  {massUnfollowing ? (
                    <>
                      <Spinner className="size-3" />
                      {massUnfollowProgress.current}/{massUnfollowProgress.total}
                    </>
                  ) : (
                    <>
                      <UserMinusIcon className="size-3" />
                      Unfollow {selectedUsers.size}
                    </>
                  )}
                </Button>
              </DataTableHeaderCell>
              <DataTableHeaderCell align="center" noPadding>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleMassRemoveFromList}
                  disabled={massUnfollowing || checkingStatus || selectedUsers.size === 0}
                  className={selectedUsers.size === 0 ? 'invisible' : ''}
                >
                  <XIcon className="size-3" />
                </Button>
              </DataTableHeaderCell>
            </DataTableHeader>
            <DataTableBody>
              {sortedProfiles.map((profile) => {
                const isUnfollowing = unfollowingUser === profile.user.pk;

                return (
                  <DataTableRow
                    key={profile.user.pk}
                    selected={selectedUsers.has(profile.user.pk)}
                  >
                    <DataTableCell align="center">
                      <Checkbox
                        checked={selectedUsers.has(profile.user.pk)}
                        onCheckedChange={() => toggleSelectUser(profile.user.pk)}
                        disabled={massUnfollowing || checkingStatus}
                        className="cursor-pointer"
                      />
                    </DataTableCell>
                    <DataTableCell noPadding className="max-w-50">
                      <DataTableUserCell user={profile.user} onImageError={handleImageError} />
                    </DataTableCell>
                    <DataTableCell align="center">
                      {profile.user.is_verified && <VerifiedBadge />}
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(profile.followedAt)}
                      </span>
                    </DataTableCell>
                    <DataTableCell>
                      <FollowBackStatus followedBack={profile.followedBack} />
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-xs text-muted-foreground">
                        {profile.lastCheckedAt ? formatTimeAgo(profile.lastCheckedAt) : '—'}
                      </span>
                    </DataTableCell>
                    <DataTableCell align="center" noPadding>
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleUnfollow(profile.user.pk)}
                        disabled={isUnfollowing || massUnfollowing || checkingStatus || remainingUnfollows === 0}
                      >
                        {isUnfollowing ? (
                          <Spinner className="size-3" />
                        ) : (
                          <>
                            <UserMinusIcon className="size-3" />
                            Unfollow
                          </>
                        )}
                      </Button>
                    </DataTableCell>
                    <DataTableCell align="center" noPadding>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRemoveFromList(profile.user.pk)}
                              disabled={isUnfollowing || massUnfollowing || checkingStatus}
                            >
                              <XIcon className="size-3" />
                            </Button>
                          }
                        />
                        <TooltipPopup container={container}>Remove from list</TooltipPopup>
                      </Tooltip>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
            </DataTableBody>
          </DataTable>
        )}
      </ScrollArea>

      <ActionFooter
        primaryText={primaryText}
        remaining={remainingUnfollows}
        limit={unfollowLimit}
        actionLabel="unfollows"
      />
    </div>
  );
}
