import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { RefreshCwIcon } from 'lucide-react';

interface FollowedActionBarProps {
  // Check status
  checkingStatus: boolean;
  checkProgress: { current: number; total: number };
  onCheckAllStatus: () => void;

  // Mass unfollow (for disabling controls)
  massUnfollowing: boolean;

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
  massUnfollowing,
  filterNotFollowingBack,
  onFilterChange,
  notFollowingBackCount,
  unknownCount,
  profilesCount,
}: FollowedActionBarProps) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-b border-border bg-muted/30">
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

      {profilesCount > 0 && notFollowingBackCount > 0 && (
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <Checkbox
            checked={filterNotFollowingBack}
            onCheckedChange={(checked) => onFilterChange(checked === true)}
            disabled={massUnfollowing || checkingStatus}
          />
          Show only not following back ({notFollowingBackCount})
        </label>
      )}
    </div>
  );
}
