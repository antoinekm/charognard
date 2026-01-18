import { Skeleton } from '@/components/ui/skeleton';

interface ProfileListSkeletonProps {
  count?: number;
}

export function ProfileListSkeleton({ count = 8 }: ProfileListSkeletonProps) {
  return (
    <div className="flex flex-col">
      {/* Header skeleton */}
      <div
        className="grid items-center border-b border-border bg-muted/30 px-3 py-2.5"
        style={{ gridTemplateColumns: '40px minmax(100px, 1fr) 1fr 100px 100px 90px' }}
      >
        <Skeleton className="size-4 rounded" />
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-12 mx-auto" />
        <Skeleton className="h-3 w-12 mx-auto" />
        <div />
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="grid items-center border-b border-border/50 px-3 py-2"
          style={{ gridTemplateColumns: '40px minmax(100px, 1fr) 1fr 100px 100px 90px' }}
        >
          <Skeleton className="size-4 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-4 w-10 mx-auto" />
          <Skeleton className="size-4 rounded-full mx-auto" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}
