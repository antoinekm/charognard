import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { DataTable, DataTableBody } from '@/components/ui/data-table/data-table';
import { DataTableHeader, DataTableHeaderCell } from '@/components/ui/data-table/data-table-header';
import { DataTableRow } from '@/components/ui/data-table/data-table-row';
import { DataTableCell } from '@/components/ui/data-table/data-table-cell';
import {
  HistoryIcon,
  RefreshCwIcon,
  Trash2Icon,
  UserPlusIcon,
  UserMinusIcon,
  PlayIcon,
  CheckCircleIcon,
  DownloadIcon,
  UploadIcon,
  SearchIcon,
  CameraIcon,
  AlertCircleIcon,
  CheckIcon,
  AlertTriangleIcon,
  InfoIcon,
} from 'lucide-react';
import type { ActionLog, LogActionType, LogType } from '@/types/logs';
import { getActionLogs, clearActionLogs } from '@/lib/storage/logs';

export function HistoryTab() {
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getActionLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClear = async () => {
    await clearActionLogs();
    setLogs([]);
  };

  const getActionIcon = (actionType: LogActionType) => {
    switch (actionType) {
      case 'follow':
        return <UserPlusIcon className="size-3.5" />;
      case 'unfollow':
        return <UserMinusIcon className="size-3.5" />;
      case 'automation_start':
        return <PlayIcon className="size-3.5" />;
      case 'automation_end':
        return <CheckCircleIcon className="size-3.5" />;
      case 'check_status':
        return <SearchIcon className="size-3.5" />;
      case 'import':
        return <UploadIcon className="size-3.5" />;
      case 'export':
        return <DownloadIcon className="size-3.5" />;
      case 'snapshot':
        return <CameraIcon className="size-3.5" />;
      default:
        return <HistoryIcon className="size-3.5" />;
    }
  };

  const getLogTypeIcon = (logType: LogType) => {
    switch (logType) {
      case 'success':
        return <CheckIcon className="size-3" />;
      case 'error':
        return <AlertCircleIcon className="size-3" />;
      case 'warning':
        return <AlertTriangleIcon className="size-3" />;
      case 'info':
      default:
        return <InfoIcon className="size-3" />;
    }
  };

  const getLogTypeColor = (logType: LogType) => {
    switch (logType) {
      case 'success':
        return 'text-green-500 bg-green-500/10';
      case 'error':
        return 'text-red-500 bg-red-500/10';
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'info':
      default:
        return 'text-blue-500 bg-blue-500/10';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 86400000).toDateString() === date.toDateString();

    const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return time;
    } else if (isYesterday) {
      return `Yesterday ${time}`;
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ` ${time}`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action bar */}
      <div className="flex items-center justify-between p-3 border-b border-border shrink-0">
        <span className="text-sm text-muted-foreground">
          {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="xs" onClick={loadLogs} disabled={loading}>
            <RefreshCwIcon className="size-3" />
            Refresh
          </Button>
          <Button variant="outline" size="xs" onClick={handleClear} disabled={loading || logs.length === 0}>
            <Trash2Icon className="size-3" />
            Clear
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="size-6" />
          </div>
        ) : logs.length === 0 ? (
          <Empty className="h-64 border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon />
              </EmptyMedia>
              <EmptyTitle>No history</EmptyTitle>
              <EmptyDescription>Actions will appear here as you use the extension.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={loadLogs}>
                <RefreshCwIcon />
                Refresh
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <DataTable>
            <DataTableHeader>
              <DataTableHeaderCell align="center">Type</DataTableHeaderCell>
              <DataTableHeaderCell>Status</DataTableHeaderCell>
              <DataTableHeaderCell className="w-full">Message</DataTableHeaderCell>
              <DataTableHeaderCell align="right">Time</DataTableHeaderCell>
            </DataTableHeader>
            <DataTableBody>
              {logs.map((log) => (
                <DataTableRow key={log.id}>
                  <DataTableCell align="center">
                    <div className="p-1 rounded bg-muted inline-flex">
                      {getActionIcon(log.actionType)}
                    </div>
                  </DataTableCell>
                  <DataTableCell>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getLogTypeColor(log.logType)}`}>
                      {getLogTypeIcon(log.logType)}
                      {log.logType}
                    </span>
                  </DataTableCell>
                  <DataTableCell>
                    <span className="text-sm" title={log.message}>
                      {log.message}
                    </span>
                  </DataTableCell>
                  <DataTableCell align="right">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTime(log.timestamp)}
                    </span>
                  </DataTableCell>
                </DataTableRow>
              ))}
            </DataTableBody>
          </DataTable>
        )}
      </ScrollArea>
    </div>
  );
}
