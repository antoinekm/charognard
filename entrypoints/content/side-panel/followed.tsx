import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { RefreshCwIcon, UserMinusIcon, HeartIcon, SearchIcon, XIcon } from 'lucide-react';
import { ProfileCard } from '../components/ui/profile-card';
import { ActionFooter } from '../components/ui/action-footer';
import { FollowBackStatus } from '../components/side-panel/followed/follow-back-status';
import { FollowedActionBar } from '../components/side-panel/followed/followed-action-bar';
import { useFollowedProfiles } from '../hooks/use-followed-profiles';

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
    filterNotFollowingBack,
    setFilterNotFollowingBack,
    loadProfiles,
  } = useFollowedProfiles();

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
        selectedCount={selectedUsers.size}
        selectableCount={filteredProfiles.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        massUnfollowing={massUnfollowing}
        massUnfollowProgress={massUnfollowProgress}
        onMassUnfollow={handleMassUnfollow}
        remainingUnfollows={remainingUnfollows}
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
          <div className="p-2">
            {filteredProfiles.map((profile) => {
              const isUnfollowing = unfollowingUser === profile.user.pk;

              return (
                <ProfileCard
                  key={profile.user.pk}
                  user={profile.user}
                  leftSlot={
                    <Checkbox
                      checked={selectedUsers.has(profile.user.pk)}
                      onCheckedChange={() => toggleSelectUser(profile.user.pk)}
                      disabled={massUnfollowing || checkingStatus}
                      className="cursor-pointer"
                    />
                  }
                  statusSlot={
                    <FollowBackStatus
                      followedBack={profile.followedBack}
                      lastCheckedAt={profile.lastCheckedAt}
                      container={container}
                    />
                  }
                  infoSlot={
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      Followed {formatTimeAgo(profile.followedAt)}
                    </p>
                  }
                >
                  <div className="flex items-center gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleUnfollow(profile.user.pk)}
                      disabled={isUnfollowing || massUnfollowing || checkingStatus || remainingUnfollows === 0}
                    >
                      {isUnfollowing ? (
                        <Spinner className="size-4" />
                      ) : (
                        <>
                          <UserMinusIcon className="size-4" />
                          Unfollow
                        </>
                      )}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleRemoveFromList(profile.user.pk)}
                            disabled={isUnfollowing || massUnfollowing || checkingStatus}
                          >
                            <XIcon className="size-4" />
                          </Button>
                        }
                      />
                      <TooltipPopup container={container}>Remove from list (keep following)</TooltipPopup>
                    </Tooltip>
                  </div>
                </ProfileCard>
              );
            })}
          </div>
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
