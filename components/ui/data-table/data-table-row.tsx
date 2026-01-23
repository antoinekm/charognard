import type { ReactNode, MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';

interface DataTableRowProps {
  children: ReactNode;
  className?: string;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLTableRowElement>;
}

export function DataTableRow({ children, className, selected, onClick }: DataTableRowProps) {
  return (
    <tr
      className={cn(
        'group border-b border-border/50 last:border-b-0',
        selected && 'bg-accent/30',
        onClick && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      data-slot="data-table-row"
      data-selected={selected || undefined}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
