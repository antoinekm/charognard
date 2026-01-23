import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DataTableProps {
  children: ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  return (
    <table className={cn('w-full border-collapse', className)} data-slot="data-table">
      {children}
    </table>
  );
}

interface DataTableBodyProps {
  children: ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return (
    <tbody className={className} data-slot="data-table-body">
      {children}
    </tbody>
  );
}
