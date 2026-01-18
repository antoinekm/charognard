import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ExternalLinkIcon } from 'lucide-react';

interface DataTableUserCellUser {
  pk: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
}

interface DataTableUserCellProps {
  user: DataTableUserCellUser;
  badges?: ReactNode;
  statusSlot?: ReactNode;
  className?: string;
}

export function DataTableUserCell({
  user,
  badges,
  statusSlot,
  className,
}: DataTableUserCellProps) {
  const profileUrl = `https://www.instagram.com/${user.username}/`;

  return (
    <a
      href={profileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'relative flex items-center gap-2 min-w-0 w-full self-stretch px-3 py-2',
        className
      )}
      data-slot="data-table-user-cell"
    >
      <img
        src={user.profile_pic_url}
        alt={user.username}
        className="size-4 rounded object-cover shrink-0"
        data-slot="user-avatar"
      />

      <div className="flex items-center gap-1.5 min-w-0 flex-1" data-slot="user-info">
        <span className="font-medium text-sm truncate" data-slot="user-username">
          {user.username}
        </span>
        {user.full_name && (
          <span className="text-sm text-muted-foreground truncate" data-slot="user-fullname">
            ({user.full_name})
          </span>
        )}
        {badges}
        {statusSlot}
      </div>

      <span
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2',
          'flex items-center gap-1 px-2 py-1 rounded-md',
          'text-xs font-medium',
          'bg-background border border-border shadow-sm',
          'opacity-0 group-hover:opacity-100 transition-opacity'
        )}
      >
        Open
        <ExternalLinkIcon className="size-3" />
      </span>
    </a>
  );
}
