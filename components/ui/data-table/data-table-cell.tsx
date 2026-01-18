import type { ReactNode, MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';

interface DataTableCellProps {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  noPadding?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function DataTableCell({ children, className, align = 'left', noPadding, onClick }: DataTableCellProps) {
  return (
    <div
      className={cn(
        'min-w-0 border-r border-border/30 last:border-r-0 flex items-center',
        !noPadding && 'px-3 py-2',
        align === 'center' && 'justify-center text-center',
        align === 'right' && 'justify-end text-right',
        className
      )}
      data-slot="data-table-cell"
      onClick={onClick}
    >
      {children}
    </div>
  );
}
