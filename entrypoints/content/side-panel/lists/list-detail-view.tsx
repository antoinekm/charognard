import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipTrigger, TooltipPopup } from '@/components/ui/tooltip';
import { Menu, MenuTrigger, MenuPopup, MenuItem } from '@/components/ui/menu';
import { DataTable, DataTableBody } from '@/components/ui/data-table/data-table';
import { DataTableHeader, DataTableHeaderCell, type SortDirection } from '@/components/ui/data-table/data-table-header';
import { DataTableRow } from '@/components/ui/data-table/data-table-row';
import { DataTableCell } from '@/components/ui/data-table/data-table-cell';
import { DataTableUserCell } from '@/components/ui/data-table/data-table-user-cell';
import { ArrowLeftIcon, UserPlusIcon, XIcon, DownloadIcon } from 'lucide-react';
import { VerifiedBadge } from '../../components/ui/verified-badge';
import { ActionFooter } from '../../components/ui/action-footer';
import { useListDetail } from '../../hooks/use-lists';
import { ImportUserView } from './import-user-view';

interface ListDetailViewProps {
  listId: string;
  onBack: () => void;
  container: HTMLElement;
}

type ListDetailSubView = 'list' | 'import-user';

export function ListDetailView({ listId, onBack, container }: ListDetailViewProps) {
  const [subView, setSubView] = useState<ListDetailSubView>('list');
  const {
    list,
    users,
    loading,
    remainingFollows,
    followLimit,
    selectedUsers,
    toggleSelectUser,
    selectAll,
    deselectAll,
    followingUser,
    handleFollow,
    handleRemoveFromList,
    massFollowing,
    massFollowProgress,
    handleMassFollow,
    handleMassRemoveFromList,
    loadUsers,
  } = useListDetail(listId);

  const [sortKey, setSortKey] = useState<'username' | 'added' | 'verified' | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const sortedUsers = useMemo(() => {
    if (!sortKey || !sortDirection) return users;

    return [...users].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case 'username':
          comparison = a.user.username.localeCompare(b.user.username);
          break;
        case 'added':
          comparison = a.addedAt - b.addedAt;
          break;
        case 'verified':
          comparison = Number(b.user.is_verified) - Number(a.user.is_verified);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [users, sortKey, sortDirection]);

  // Early return AFTER all hooks
  if (subView === 'import-user') {
    return (
      <ImportUserView
        listId={listId}
        listName={list?.name ?? 'List'}
        onBack={() => setSubView('list')}
        onImportComplete={() => {
          loadUsers();
          setSubView('list');
        }}
      />
    );
  }

  const handleSort = (key: 'username' | 'added' | 'verified') => {
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

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const primaryText = `${users.length} user${users.length !== 1 ? 's' : ''} in list`;
  const columns = '40px minmax(100px, 1fr) 60px 100px 90px 40px';

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <Button variant="ghost" size="icon-sm" onClick={onBack}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <span className="text-sm font-medium truncate">{list?.name ?? 'List'}</span>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner className="size-6" />
          </div>
        ) : (
          <DataTable>
            <DataTableHeader columns={columns}>
              <DataTableHeaderCell>
                <Checkbox
                  checked={selectedUsers.size === users.length && users.length > 0}
                  indeterminate={selectedUsers.size > 0 && selectedUsers.size < users.length}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectAll();
                    } else {
                      deselectAll();
                    }
                  }}
                  disabled={massFollowing || users.length === 0}
                  className="cursor-pointer"
                />
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'username' ? sortDirection : null}
                onSort={() => handleSort('username')}
              >
                User
              </DataTableHeaderCell>
              <DataTableHeaderCell
                align="center"
                sortable
                sortDirection={sortKey === 'verified' ? sortDirection : null}
                onSort={() => handleSort('verified')}
              >
                <VerifiedBadge />
              </DataTableHeaderCell>
              <DataTableHeaderCell
                sortable
                sortDirection={sortKey === 'added' ? sortDirection : null}
                onSort={() => handleSort('added')}
              >
                Added
              </DataTableHeaderCell>
              <DataTableHeaderCell className="p-0! justify-center">
                <Button
                  size="xs"
                  onClick={handleMassFollow}
                  disabled={massFollowing || remainingFollows === 0 || selectedUsers.size === 0}
                  className={selectedUsers.size === 0 ? 'invisible' : ''}
                >
                  {massFollowing ? (
                    <>
                      <Spinner className="size-3" />
                      {massFollowProgress.current}/{massFollowProgress.total}
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="size-3" />
                      Follow {selectedUsers.size}
                    </>
                  )}
                </Button>
              </DataTableHeaderCell>
              <DataTableHeaderCell className="p-0! justify-center">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleMassRemoveFromList}
                  disabled={massFollowing || selectedUsers.size === 0}
                  className={selectedUsers.size === 0 ? 'invisible' : ''}
                >
                  <XIcon className="size-3" />
                </Button>
              </DataTableHeaderCell>
            </DataTableHeader>
            <DataTableBody>
              {sortedUsers.map((listUser) => {
                const isFollowing = followingUser === listUser.user.pk;

                return (
                  <DataTableRow
                    key={listUser.user.pk}
                    columns={columns}
                    selected={selectedUsers.has(listUser.user.pk)}
                  >
                    <DataTableCell>
                      <Checkbox
                        checked={selectedUsers.has(listUser.user.pk)}
                        onCheckedChange={() => toggleSelectUser(listUser.user.pk)}
                        disabled={massFollowing}
                        className="cursor-pointer"
                      />
                    </DataTableCell>
                    <DataTableCell noPadding>
                      <DataTableUserCell user={listUser.user} />
                    </DataTableCell>
                    <DataTableCell align="center">
                      {listUser.user.is_verified && <VerifiedBadge />}
                    </DataTableCell>
                    <DataTableCell>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(listUser.addedAt)}
                      </span>
                    </DataTableCell>
                    <DataTableCell noPadding className="flex items-center justify-center">
                      <Button
                        size="xs"
                        onClick={() => handleFollow(listUser.user.pk)}
                        disabled={isFollowing || massFollowing || remainingFollows === 0}
                      >
                        {isFollowing ? (
                          <Spinner className="size-3" />
                        ) : (
                          <>
                            <UserPlusIcon className="size-3" />
                            Follow
                          </>
                        )}
                      </Button>
                    </DataTableCell>
                    <DataTableCell noPadding className="flex items-center justify-center">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleRemoveFromList(listUser.user.pk)}
                              disabled={isFollowing || massFollowing}
                            >
                              <XIcon className="size-3" />
                            </Button>
                          }
                        />
                        <TooltipPopup container={container}>Remove from list</TooltipPopup>
                      </Tooltip>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}

              <DataTableRow columns={columns}>
                <DataTableCell />
                <DataTableCell>
                  <Menu>
                    <MenuTrigger
                      render={
                        <Button variant="ghost" size="xs" className="text-muted-foreground -ml-2">
                          <DownloadIcon className="size-3" />
                          Import
                        </Button>
                      }
                    />
                    <MenuPopup align="start" container={container}>
                      <MenuItem>Import suggestions</MenuItem>
                      <MenuItem onClick={(e) => { e.stopPropagation(); setSubView('import-user'); }}>Import a user</MenuItem>
                      <MenuItem>Import a user's followers</MenuItem>
                      <MenuItem>Import a user's followings</MenuItem>
                    </MenuPopup>
                  </Menu>
                </DataTableCell>
                <DataTableCell />
                <DataTableCell />
                <DataTableCell />
                <DataTableCell />
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        )}
      </ScrollArea>

      <ActionFooter
        primaryText={primaryText}
        remaining={remainingFollows}
        limit={followLimit}
        actionLabel="follows"
      />
    </div>
  );
}
