import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCwIcon } from 'lucide-react';
import { FilterButtons, type SuggestionFilters } from './filter-popover';

interface SelectionBarProps {
  loading: boolean;
  hasItems: boolean;
  massFollowing: boolean;
  filters: SuggestionFilters;
  onFiltersChange: (filters: SuggestionFilters) => void;
  onRefresh: () => void;
  container?: HTMLElement | null;
}

export function SelectionBar({
  loading,
  hasItems,
  massFollowing,
  filters,
  onFiltersChange,
  onRefresh,
  container,
}: SelectionBarProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 shrink-0">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-7 w-7 rounded-lg" />
      </div>
    );
  }

  if (!hasItems) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30 shrink-0">
      <FilterButtons
        filters={filters}
        onFiltersChange={onFiltersChange}
        disabled={massFollowing}
        container={container}
      />
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRefresh}
        disabled={loading || massFollowing}
      >
        <RefreshCwIcon className={loading ? 'animate-spin' : ''} />
      </Button>
    </div>
  );
}
