import { useState } from 'react';
import { ListsView } from './lists-view';
import { ListDetailView } from './list-detail-view';

interface ListsTabProps {
  container: HTMLElement;
}

export function ListsTab({ container }: ListsTabProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  if (selectedListId) {
    return (
      <ListDetailView
        listId={selectedListId}
        onBack={() => setSelectedListId(null)}
        container={container}
      />
    );
  }

  return <ListsView onSelectList={setSelectedListId} />;
}
