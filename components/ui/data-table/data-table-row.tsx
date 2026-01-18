import type { ReactNode, CSSProperties, MouseEventHandler } from 'react';
import { cn } from '@/lib/utils';

interface DataTableRowProps {
  children: ReactNode;
  columns: string;
  className?: string;
  style?: CSSProperties;
  selected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function DataTableRow({ children, columns, className, style, selected, onClick }: DataTableRowProps) {
  return (
    <div
      className={cn(
        'group grid items-stretch',
        'border-b border-border/50 last:border-b-0',
        selected && 'bg-accent/30',
        onClick && 'hover:bg-accent/50 transition-colors',
        className
      )}
      style={{ gridTemplateColumns: columns, ...style }}
      data-slot="data-table-row"
      data-selected={selected || undefined}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
