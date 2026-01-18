import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <div className={cn('flex flex-col w-full', className)} data-slot="data-table">
      {children}
    </div>
  );
}

interface DataTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <div className={cn('flex flex-col', className)} data-slot="data-table-body">
      {children}
    </div>
  );
}
