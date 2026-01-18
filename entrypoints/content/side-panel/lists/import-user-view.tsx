import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon, SearchIcon } from 'lucide-react';

interface ImportUserViewProps {
  listId: string;
  listName: string;
  onBack: () => void;
  onImportComplete: () => void;
}

export function ImportUserView({ listName, onBack }: ImportUserViewProps) {
  const [username, setUsername] = useState('');

  const handleImport = () => {
    // TODO: Implement import logic
    console.log('Import user:', username);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium truncate">Import a user to {listName}</span>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Enter username..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <Button size="sm" onClick={handleImport} disabled={!username.trim()}>
                Import
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
