import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, ArrowDownIcon, ArrowUpDownIcon } from 'lucide-react';

interface DataTableHeaderProps {
  children: ReactNode;
  columns: string;
  className?: string;
  style?: CSSProperties;
}

export function DataTableHeader({ children, columns, className, style }: DataTableHeaderProps) {
  return (
    <div
      className={cn(
        'grid items-stretch',
        'border-b border-border bg-muted/30',
        'text-xs font-medium text-muted-foreground uppercase tracking-wide',
        className
      )}
      style={{ gridTemplateColumns: columns, ...style }}
      data-slot="data-table-header"
    >
      {children}
    </div>
  );
}

export type SortDirection = 'asc' | 'desc' | null;

interface DataTableHeaderCellProps {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
}

export function DataTableHeaderCell({
  children,
  className,
  align = 'left',
  sortable,
  sortDirection,
  onSort,
}: DataTableHeaderCellProps) {
  const content = (
    <>
      <span className="truncate">{children}</span>
      {sortable && (
        <span className="ml-1 shrink-0">
          {sortDirection === 'asc' ? (
            <ArrowUpIcon className="size-3" />
          ) : sortDirection === 'desc' ? (
            <ArrowDownIcon className="size-3" />
          ) : (
            <ArrowUpDownIcon className="size-3 opacity-50" />
          )}
        </span>
      )}
    </>
  );

  if (sortable) {
    return (
      <button
        type="button"
        onClick={onSort}
        className={cn(
          'min-w-0 px-3 py-2.5 border-r border-border/30 last:border-r-0 flex items-center gap-0.5',
          'hover:bg-muted/50 transition-colors cursor-pointer select-none',
          align === 'center' && 'justify-center text-center',
          align === 'right' && 'justify-end text-right',
          className
        )}
        data-slot="data-table-header-cell"
        data-sortable="true"
        data-sort-direction={sortDirection || undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'min-w-0 truncate px-3 py-2.5 border-r border-border/30 last:border-r-0 flex items-center',
        align === 'center' && 'justify-center text-center',
        align === 'right' && 'justify-end text-right',
        className
      )}
      data-slot="data-table-header-cell"
    >
      {children}
    </div>
  );
}
