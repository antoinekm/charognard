import type { InstagramUser, ProspectList, ProspectListUser } from '@/lib/types';
import { getAccountData, setAccountData } from '.';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// List CRUD operations
export async function createList(name: string): Promise<ProspectList> {
  const accountData = await getAccountData();
  if (!accountData.lists) {
    accountData.lists = {};
  }
  if (!accountData.listUsers) {
    accountData.listUsers = {};
  }

  const list: ProspectList = {
    id: generateId(),
    name,
    createdAt: Date.now(),
  };

  accountData.lists[list.id] = list;
  accountData.listUsers[list.id] = {};
  await setAccountData(accountData);

  return list;
}

export async function getLists(): Promise<ProspectList[]> {
  const accountData = await getAccountData();
  if (!accountData.lists) {
    return [];
  }
  return Object.values(accountData.lists).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getList(listId: string): Promise<ProspectList | null> {
  const accountData = await getAccountData();
  return accountData.lists?.[listId] || null;
}

export async function updateList(listId: string, name: string): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.lists?.[listId]) {
    accountData.lists[listId].name = name;
    await setAccountData(accountData);
  }
}

export async function deleteList(listId: string): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.lists) {
    delete accountData.lists[listId];
  }
  if (accountData.listUsers) {
    delete accountData.listUsers[listId];
  }
  await setAccountData(accountData);
}

// List users operations
export async function addUserToList(listId: string, user: InstagramUser): Promise<void> {
  const accountData = await getAccountData();
  if (!accountData.listUsers) {
    accountData.listUsers = {};
  }
  if (!accountData.listUsers[listId]) {
    accountData.listUsers[listId] = {};
  }

  accountData.listUsers[listId][user.pk] = {
    user,
    addedAt: Date.now(),
  };
  await setAccountData(accountData);
}

export async function addUsersToList(listId: string, users: InstagramUser[]): Promise<void> {
  const accountData = await getAccountData();
  if (!accountData.listUsers) {
    accountData.listUsers = {};
  }
  if (!accountData.listUsers[listId]) {
    accountData.listUsers[listId] = {};
  }

  const now = Date.now();
  for (const user of users) {
    accountData.listUsers[listId][user.pk] = {
      user,
      addedAt: now,
    };
  }
  await setAccountData(accountData);
}

export async function removeUserFromList(listId: string, userId: string): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.listUsers?.[listId]) {
    delete accountData.listUsers[listId][userId];
    await setAccountData(accountData);
  }
}

export async function removeUsersFromList(listId: string, userIds: string[]): Promise<void> {
  const accountData = await getAccountData();
  if (accountData.listUsers?.[listId]) {
    for (const userId of userIds) {
      delete accountData.listUsers[listId][userId];
    }
    await setAccountData(accountData);
  }
}

export async function getListUsers(listId: string): Promise<ProspectListUser[]> {
  const accountData = await getAccountData();
  if (!accountData.listUsers?.[listId]) {
    return [];
  }
  return Object.values(accountData.listUsers[listId]).sort((a, b) => b.addedAt - a.addedAt);
}

export async function getListUserCount(listId: string): Promise<number> {
  const accountData = await getAccountData();
  if (!accountData.listUsers?.[listId]) {
    return 0;
  }
  return Object.keys(accountData.listUsers[listId]).length;
}

export async function isUserInList(listId: string, userId: string): Promise<boolean> {
  const accountData = await getAccountData();
  return !!accountData.listUsers?.[listId]?.[userId];
}
