import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { DataTable, DataTableBody } from '@/components/ui/data-table/data-table';
import { DataTableHeader, DataTableHeaderCell, type SortDirection } from '@/components/ui/data-table/data-table-header';
import { DataTableRow } from '@/components/ui/data-table/data-table-row';
import { DataTableCell } from '@/components/ui/data-table/data-table-cell';
import { PlusIcon, TrashIcon, ChevronRightIcon } from 'lucide-react';
import { useLists } from '../../hooks/use-lists';

interface ListsViewProps {
  onSelectList: (listId: string) => void;
}

export function ListsView({ onSelectList }: ListsViewProps) {
  const { lists, loading, creating, handleCreateList, handleDeleteList, handleRenameList } = useLists();
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [sortKey, setSortKey] = useState<'name' | 'users' | 'created' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleCreate = async () => {
    if (!newListName.trim()) {
      setIsCreating(false);
      return;
    }
    const list = await handleCreateList(newListName.trim());
    if (list) {
      setNewListName('');
      setIsCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreating(false);
    setNewListName('');
  };

  const handleStartRename = (listId: string, currentName: string) => {
    setEditingListId(listId);
    setEditingName(currentName);
  };

  const handleConfirmRename = async () => {
    if (!editingListId || !editingName.trim()) return;
    await handleRenameList(editingListId, editingName.trim());
    setEditingListId(null);
    setEditingName('');
  };

  const handleCancelRename = () => {
    setEditingListId(null);
    setEditingName('');
  };

  const handleSort = (key: 'name' | 'users' | 'created') => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortKey(null);
        setSortDirection(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedLists = useMemo(() => {
    if (!sortKey || !sortDirection) return lists;

    return [...lists].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'users':
          comparison = a.userCount - b.userCount;
          break;
        case 'created':
          comparison = a.createdAt - b.createdAt;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [lists, sortKey, sortDirection]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const columns = 'minmax(150px, 1fr) 80px 120px 44px';

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="size-6" />
          </div>
        ) : (
          <DataTable>
            <DataTableHeader columns={columns}>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'name' ? sortDirection : null}
                onSort={() => handleSort('name')}
              >
                Name
              </DataTableHeaderCell>
              <DataTableHeaderCell
                align="center"
                sortable
                sortDirection={sortKey === 'users' ? sortDirection : null}
                onSort={() => handleSort('users')}
              >
                Users
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'created' ? sortDirection : null}
                onSort={() => handleSort('created')}
              >
                Created
              </DataTableHeaderCell>
              <DataTableHeaderCell />
            </DataTableHeader>
            <DataTableBody>
              {sortedLists.map((list) => (
                <DataTableRow
                  key={list.id}
                  columns={columns}
                  className="cursor-pointer"
                  onClick={() => editingListId !== list.id && onSelectList(list.id)}
                >
                  <DataTableCell
                    onClick={(e) => {
                      e.stopPropagation();
                      if (editingListId !== list.id) {
                        handleStartRename(list.id, list.name);
                      }
                    }}
                    className="cursor-text relative"
                  >
                    {editingListId === list.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleConfirmRename();
                          } else if (e.key === 'Escape') {
                            handleCancelRename();
                          }
                        }}
                        onBlur={handleConfirmRename}
                        autoFocus
                        className="text-sm font-medium bg-transparent border-none outline-none w-full p-0 m-0"
                      />
                    ) : (
                      <>
                        <span className="text-sm font-medium truncate">{list.name}</span>
                        <span
                          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-background border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectList(list.id);
                          }}
                        >
                          Open
                          <ChevronRightIcon className="size-3" />
                        </span>
                      </>
                    )}
                  </DataTableCell>
                  <DataTableCell align="center">
                    <span className="text-sm text-muted-foreground">{list.userCount}</span>
                  </DataTableCell>
                  <DataTableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(list.createdAt)}</span>
                  </DataTableCell>
                  <DataTableCell noPadding className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDeleteList(list.id)}
                    >
                      <TrashIcon className="size-3" />
                    </Button>
                  </DataTableCell>
                </DataTableRow>
              ))}

              {isCreating ? (
                <DataTableRow columns={columns}>
                  <DataTableCell>
                    <input
                      type="text"
                      placeholder="List name..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreate();
                        } else if (e.key === 'Escape') {
                          handleCancelCreate();
                        }
                      }}
                      onBlur={() => {
                        if (!newListName.trim()) {
                          handleCancelCreate();
                        }
                      }}
                      autoFocus
                      disabled={creating}
                      className="text-sm font-medium bg-transparent border-none outline-none w-full p-0 m-0 placeholder:text-muted-foreground/50"
                    />
                  </DataTableCell>
                  <DataTableCell />
                  <DataTableCell />
                  <DataTableCell noPadding className="flex items-center justify-center">
                    {creating && <Spinner className="size-4" />}
                  </DataTableCell>
                </DataTableRow>
              ) : (
                <DataTableRow columns={columns}>
                  <DataTableCell>
                    <Button variant="ghost" size="xs" onClick={() => setIsCreating(true)} className="text-muted-foreground -ml-2">
                      <PlusIcon className="size-3" />
                      New list
                    </Button>
                  </DataTableCell>
                  <DataTableCell />
                  <DataTableCell />
                  <DataTableCell />
                </DataTableRow>
              )}
            </DataTableBody>
          </DataTable>
        )}
      </ScrollArea>
    </div>
  );
}
