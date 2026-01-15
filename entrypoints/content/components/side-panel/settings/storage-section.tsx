import { useState, useEffect } from 'react';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { DatabaseIcon, UsersIcon } from 'lucide-react';
import type { StorageUsage } from '@/lib/types';
import { getStorageUsage, formatBytes } from '@/lib/storage/usage';

export function StorageSection() {
  const [usage, setUsage] = useState<StorageUsage | null>(null);

  useEffect(() => {
    getStorageUsage().then(setUsage);
  }, []);

  if (!usage) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="pt-6 border-t border-border">
      <h3 className="font-heading font-semibold text-base mb-4">Storage</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DatabaseIcon className="size-4" />
            <span>Used</span>
          </div>
          <span className="font-medium">
            {formatBytes(usage.usedBytes)} / {formatBytes(usage.totalBytes)}
          </span>
        </div>

        <Progress value={usage.percentage}>
          <ProgressTrack className="h-2">
            <ProgressIndicator className={getProgressColor(usage.percentage)} />
          </ProgressTrack>
        </Progress>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="size-4" />
            <span>Tracked profiles</span>
          </div>
          <span className="font-medium">{usage.profilesCount.toLocaleString()}</span>
        </div>

        {usage.percentage >= 70 && (
          <p className="text-xs text-warning">
            Storage is getting full. Consider unfollowing old profiles to free up space.
          </p>
        )}
      </div>
    </div>
  );
}
