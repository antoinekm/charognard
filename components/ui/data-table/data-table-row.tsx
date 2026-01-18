import type { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface DataTableRowProps {
  children: ReactNode;
  columns: string;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
}

export function DataTableRow({ children, columns, className, style, selected }: DataTableRowProps) {
  return (
    <div
      className={cn(
        'group grid items-stretch',
        'border-b border-border/50 last:border-b-0',
        selected && 'bg-accent/30',
        className
      )}
      style={{ gridTemplateColumns: columns, ...style }}
      data-slot="data-table-row"
      data-selected={selected || undefined}
    >
      {children}
    </div>
  );
}
