import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCwIcon, UserMinusIcon } from 'lucide-react';

interface FollowedActionBarProps {
  // Check status
  checkingStatus: boolean;
  checkProgress: { current: number; total: number };
  onCheckAllStatus: () => void;

  // Selection
  selectedCount: number;
  selectableCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;

  // Mass unfollow
  massUnfollowing: boolean;
  massUnfollowProgress: { current: number; total: number };
  onMassUnfollow: () => void;
  remainingUnfollows: number;

  // Filter
  filterNotFollowingBack: boolean;
  onFilterChange: (checked: boolean) => void;
  notFollowingBackCount: number;
  unknownCount: number;

  // Counts
  profilesCount: number;
}

export function FollowedActionBar({
  checkingStatus,
  checkProgress,
  onCheckAllStatus,
  selectedCount,
  selectableCount,
  onSelectAll,
  onDeselectAll,
  massUnfollowing,
  massUnfollowProgress,
  onMassUnfollow,
  remainingUnfollows,
  filterNotFollowingBack,
  onFilterChange,
  notFollowingBackCount,
  unknownCount,
  profilesCount,
}: FollowedActionBarProps) {
  const allSelected = selectedCount === selectableCount && selectableCount > 0;

  return (
    <div className="flex flex-col gap-2 px-4 py-2 border-b border-border bg-muted/30">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="xs"
          onClick={onCheckAllStatus}
          disabled={checkingStatus || massUnfollowing || profilesCount === 0}
        >
          {checkingStatus ? (
            <>
              <Spinner className="size-3" />
              {checkProgress.current}/{checkProgress.total}
            </>
          ) : (
            <>
              <RefreshCwIcon className="size-3" />
              Check follow back
            </>
          )}
        </Button>
        {unknownCount > 0 && !checkingStatus && (
          <span className="text-xs text-muted-foreground">{unknownCount} unchecked</span>
        )}
      </div>

      {profilesCount > 0 && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={allSelected ? onDeselectAll : onSelectAll}
                disabled={massUnfollowing || checkingStatus || selectableCount === 0}
              >
                {allSelected ? 'Deselect all' : 'Select all'}
              </Button>
              {selectedCount > 0 && (
                <span className="text-xs text-muted-foreground">{selectedCount} selected</span>
              )}
            </div>
            {selectedCount > 0 && (
              <Button
                variant="destructive"
                size="xs"
                onClick={onMassUnfollow}
                disabled={massUnfollowing || checkingStatus || remainingUnfollows === 0}
              >
                {massUnfollowing ? (
                  <>
                    <Spinner className="size-3" />
                    {massUnfollowProgress.current}/{massUnfollowProgress.total}
                  </>
                ) : (
                  <>
                    <UserMinusIcon className="size-3" />
                    Unfollow {selectedCount}
                  </>
                )}
              </Button>
            )}
          </div>

          {notFollowingBackCount > 0 && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox
                checked={filterNotFollowingBack}
                onCheckedChange={(checked) => onFilterChange(checked === true)}
                disabled={massUnfollowing || checkingStatus}
              />
              Show only not following back ({notFollowingBackCount})
            </label>
          )}
        </>
      )}
    </div>
  );
}
