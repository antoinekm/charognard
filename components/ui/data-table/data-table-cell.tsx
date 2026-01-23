import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableCellProps {
  children?: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
  noPadding?: boolean;
  onClick?: () => void;
}

export function DataTableCell({ children, className, align = 'left', noPadding, onClick }: DataTableCellProps) {
  return (
    <td
      className={cn(
        'min-w-0 border-r border-border/30 last:border-r-0 align-middle px-3',
        !noPadding && 'py-2',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        onClick && 'cursor-pointer',
        className
      )}
      data-slot="data-table-cell"
      onClick={onClick}
    >
      {children}
    </td>
  );
}
