import { Skeleton } from '@/components/ui/skeleton';

interface ProfileListSkeletonProps {
  count?: number;
}

export function ProfileListSkeleton({ count = 8 }: ProfileListSkeletonProps) {
  return (
    <table className="w-full border-collapse border-b border-border">
      {/* Header skeleton */}
      <thead>
        <tr className="border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <th className="w-10 px-3 py-2.5 border-r border-border/30">
            <Skeleton className="size-4 rounded mx-auto" />
          </th>
          <th className="px-3 py-2.5 border-r border-border/30 text-left">
            <Skeleton className="h-3 w-12" />
          </th>
          <th className="px-3 py-2.5 border-r border-border/30 text-left">
            <Skeleton className="h-3 w-14" />
          </th>
          <th className="px-3 py-2.5 border-r border-border/30 text-center">
            <Skeleton className="h-3 w-12 mx-auto" />
          </th>
          <th className="px-3 py-2.5 border-r border-border/30 text-center">
            <Skeleton className="h-3 w-12 mx-auto" />
          </th>
          <th className="px-3 py-2.5" />
        </tr>
      </thead>

      {/* Rows skeleton */}
      <tbody>
        {Array.from({ length: count }).map((_, i) => (
          <tr key={i} className="border-b border-border/50">
            <td className="px-3 py-2 border-r border-border/30 text-center">
              <Skeleton className="size-4 rounded mx-auto" />
            </td>
            <td className="px-3 py-2 border-r border-border/30">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
            </td>
            <td className="px-3 py-2 border-r border-border/30">
              <Skeleton className="h-3 w-32" />
            </td>
            <td className="px-3 py-2 border-r border-border/30 text-center">
              <Skeleton className="h-4 w-10 mx-auto" />
            </td>
            <td className="px-3 py-2 border-r border-border/30 text-center">
              <Skeleton className="size-4 rounded-full mx-auto" />
            </td>
            <td className="px-3 py-2">
              <Skeleton className="h-8 w-16 rounded-md" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
