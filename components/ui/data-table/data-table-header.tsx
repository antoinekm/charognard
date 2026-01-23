import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface DataTableHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DataTableHeader({ children, className }: DataTableHeaderProps) {
  return (
    <thead data-slot="data-table-header">
      <tr
        className={cn(
          'border-b border-border bg-muted/30',
          'text-xs font-medium text-muted-foreground uppercase tracking-wide',
          className
        )}
      >
        {children}
      </tr>
    </thead>
  );
}

export type SortDirection = 'asc' | 'desc' | null;

interface DataTableHeaderCellProps {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  noPadding?: boolean;
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export function DataTableHeaderCell({
  children,
  className,
  align = 'left',
  noPadding,
  sortable,
  sortDirection,
  onSort,
}: DataTableHeaderCellProps) {
  const content = (
    <>
      <span className="truncate">{children}</span>
      {sortable && sortDirection && (
        <span className="ml-1 shrink-0">
          {sortDirection === 'asc' ? (
            <ArrowUpIcon className="size-3" />
          ) : (
            <ArrowDownIcon className="size-3" />
          )}
        </span>
      )}
    </>
  );

  const cellClassName = cn(
    'min-w-0 px-3 border-r border-border/30 last:border-r-0',
    !noPadding && 'py-2.5',
    align === 'left' && 'text-left',
    align === 'center' && 'text-center',
    align === 'right' && 'text-right',
    className
  );

  if (sortable) {
    return (
      <th
        className={cn(cellClassName, 'cursor-pointer select-none hover:bg-muted/50 transition-colors')}
        onClick={onSort}
        data-slot="data-table-header-cell"
        data-sortable="true"
        data-sort-direction={sortDirection || undefined}
      >
        <span className="inline-flex items-center gap-0.5">
          {content}
        </span>
      </th>
    );
  }

  return (
    <th className={cellClassName} data-slot="data-table-header-cell">
      {children}
    </th>
  );
}
