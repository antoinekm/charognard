import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { Progress, ProgressTrack, ProgressIndicator } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { toastManager } from '@/components/ui/toast';
import { DatabaseIcon, UsersIcon, DownloadIcon, UploadIcon } from 'lucide-react';
import type { StorageUsage } from '@/lib/types';
import { getStorageUsage, formatBytes } from '@/lib/storage/usage';
import { exportAllData, importAllData } from '@/lib/storage';

export function StorageSection() {
  const [usage, setUsage] = useState<StorageUsage | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshUsage = () => {
    getStorageUsage().then(setUsage);
  };

  useEffect(() => {
    refreshUsage();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `charognard-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toastManager.add({ title: 'Data exported successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to export data:', err);
      toastManager.add({ title: 'Failed to export data', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      const text = await file.text();
      await importAllData(text);
      refreshUsage();
      toastManager.add({ title: 'Data imported successfully', type: 'success' });
    } catch (err) {
      console.error('Failed to import data:', err);
      toastManager.add({ title: 'Failed to import data. Invalid file format.', type: 'error' });
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!usage) {
    return null;
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 70) return 'bg-warning';
    return 'bg-primary';
  };

  return (
    <div className="pt-6 border-t border-border">
      <h3 className="font-heading font-semibold text-base mb-4">Storage</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <DatabaseIcon className="size-4" />
            <span>Used</span>
          </div>
          <span className="font-medium">
            {formatBytes(usage.usedBytes)} / {formatBytes(usage.totalBytes)}
          </span>
        </div>

        <Progress value={usage.percentage}>
          <ProgressTrack className="h-2">
            <ProgressIndicator className={getProgressColor(usage.percentage)} />
          </ProgressTrack>
        </Progress>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <UsersIcon className="size-4" />
            <span>Tracked profiles</span>
          </div>
          <span className="font-medium">{usage.profilesCount.toLocaleString()}</span>
        </div>

        {usage.percentage >= 70 && (
          <p className="text-xs text-warning">
            Storage is getting full. Consider unfollowing old profiles to free up space.
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleExport}
            disabled={exporting || importing}
          >
            <DownloadIcon className="size-4" />
            {exporting ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleImportClick}
            disabled={exporting || importing}
          >
            <UploadIcon className="size-4" />
            {importing ? 'Importing...' : 'Import'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Export or import all data to transfer between environments.
        </p>
      </div>
    </div>
  );
}
