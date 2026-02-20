import { Item, Message, User, ItemStatus, Category } from '../types';

/**
 * Ambrose Alli University Lost & Found Portal
 * Centralized Data Management with MongoDB + Local Fallback
 */

export const ADMIN_ID = 'admin-id';
export const ADMIN_EMAIL = 'admin@gmail.com';

const IS_SERVER = typeof window === 'undefined';

// Local Fallback Storage Keys
const KEYS = {
  ITEMS: 'aau_items_local',
  MESSAGES: 'aau_messages_local',
  USER: 'aau_current_user',
  USERS_LIST: 'aau_all_users_local',
  INITIALIZED: 'aau_db_init'
};

// Realistic Seed Data for AAU
const SEED_ITEMS: Item[] = [
  {
    id: 'seed-1',
    title: 'Black HP Laptop Charger',
    description: 'Found a 65W HP laptop charger plugged in near the back row. It has a small piece of blue tape on the brick.',
    category: Category.ELECTRONICS,
    location: 'E-Library (New Site)',
    date: new Date().toISOString().split('T')[0],
    status: ItemStatus.FOUND,
    imageUrl: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?q=80&w=800&auto=format&fit=crop',
    posterId: 'user-999',
    posterName: 'Library Desk',
    createdAt: Date.now() - 3600000,
    isVerified: true
  },
  {
    id: 'seed-2',
    title: 'Red Leather Wallet',
    description: 'Lost my red leather wallet containing my school ID (M. Benson) and some cash. Likely dropped between the shuttle park and the gate.',
    category: Category.WALLETS,
    location: 'New Site Main Gate',
    date: new Date().toISOString().split('T')[0],
    status: ItemStatus.LOST,
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=800&auto=format&fit=crop',
    posterId: 'user-1',
    posterName: 'Mary Benson',
    createdAt: Date.now() - 7200000,
    isVerified: true
  }
];

export const dataStore = {
  async safeFetch(url: string, options: RequestInit) {
    if (IS_SERVER) return null;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (err) {
      console.warn(`Backend connection failed for ${url}. Operating in Local Recovery mode.`);
      return null;
    }
  },

  _getLocal<T>(key: string, def: T): T {
    if (IS_SERVER) return def;
    try {
      if (key === KEYS.ITEMS && !localStorage.getItem(KEYS.INITIALIZED)) {
        localStorage.setItem(KEYS.ITEMS, JSON.stringify(SEED_ITEMS));
        localStorage.setItem(KEYS.INITIALIZED, 'true');
        return SEED_ITEMS as unknown as T;
      }
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : def;
    } catch (e) {
      return def;
    }
  },

  _setLocal(key: string, data: any) {
    if (IS_SERVER) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Local Recovery Sync Error:", e);
    }
  },

  setCurrentUser: (user: User | null) => {
    dataStore._setLocal(KEYS.USER, user);
  },

  getCurrentUser: (): User | null => {
    return dataStore._getLocal<User | null>(KEYS.USER, null);
  },

  logout: () => {
    dataStore.setCurrentUser(null);
  },

  signup: async (userData: Omit<User, 'id'>): Promise<User> => {
    const apiUser = await dataStore.safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signup', ...userData }),
    });
    const user = apiUser || { ...userData, id: 'user-' + Math.random().toString(36).substr(2, 9) };
    dataStore.setCurrentUser(user);
    
    // If local mode, track users for admin
    if (!apiUser) {
      const allUsers = dataStore._getLocal<User[]>(KEYS.USERS_LIST, []);
      dataStore._setLocal(KEYS.USERS_LIST, [...allUsers, user]);
    }
    return user;
  },

  login: async (email: string): Promise<User | null> => {
    const apiUser = await dataStore.safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'login', email }),
    });
    if (apiUser) {
      dataStore.setCurrentUser(apiUser);
      return apiUser;
    }
    if (email.toLowerCase() === ADMIN_EMAIL) {
      const admin = { id: ADMIN_ID, name: 'AAU Admin Support', email: ADMIN_EMAIL };
      dataStore.setCurrentUser(admin);
      return admin;
    }
    // Search local users
    const localUsers = dataStore._getLocal<User[]>(KEYS.USERS_LIST, []);
    const user = localUsers.find(u => u.email === email.toLowerCase());
    if (user) dataStore.setCurrentUser(user);
    return user || null;
  },

  getAllUsers: async (): Promise<User[]> => {
    const apiUsers = await dataStore.safeFetch('/api/auth/users', { method: 'GET' });
    if (apiUsers) return apiUsers;
    return dataStore._getLocal<User[]>(KEYS.USERS_LIST, []);
  },

  getItems: async (all = false): Promise<Item[]> => {
    const apiItems = await dataStore.safeFetch(`/api/items?all=${all}`, { method: 'GET' });
    if (apiItems && Array.isArray(apiItems)) {
      dataStore._setLocal(KEYS.ITEMS, apiItems);
      return apiItems;
    }
    const localItems = dataStore._getLocal<Item[]>(KEYS.ITEMS, SEED_ITEMS);
    return all ? localItems : localItems.filter(i => i && i.isVerified);
  },

  saveItem: async (itemData: Partial<Item>): Promise<Item> => {
    const apiItem = await dataStore.safeFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    
    const newItem = apiItem || {
      ...itemData,
      id: 'item-' + Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      isVerified: false
    } as Item;

    if (!apiItem) {
      const items = dataStore._getLocal<Item[]>(KEYS.ITEMS, SEED_ITEMS);
      dataStore._setLocal(KEYS.ITEMS, [newItem, ...items]);
    }
    return newItem;
  },

  updateItem: async (itemId: string, updates: Partial<Item>): Promise<Item> => {
    const apiItem = await dataStore.safeFetch('/api/items', {
      method: 'PUT',
      body: JSON.stringify({ itemId, ...updates }),
    });

    if (!apiItem) {
      const items = dataStore._getLocal<Item[]>(KEYS.ITEMS, SEED_ITEMS);
      const updatedItems = items.map(i => i.id === itemId ? { ...i, ...updates } : i);
      dataStore._setLocal(KEYS.ITEMS, updatedItems);
      return updatedItems.find(i => i.id === itemId)!;
    }
    return apiItem;
  },

  updateItemStatus: async (itemId: string, status: ItemStatus): Promise<Item> => {
    return dataStore.updateItem(itemId, { status });
  },

  verifyItem: async (itemId: string): Promise<Item> => {
    return dataStore.updateItem(itemId, { isVerified: true });
  },

  deleteItem: async (itemId: string): Promise<boolean> => {
    const result = await dataStore.safeFetch(`/api/items?itemId=${itemId}`, { method: 'DELETE' });
    
    const items = dataStore._getLocal<Item[]>(KEYS.ITEMS, SEED_ITEMS);
    dataStore._setLocal(KEYS.ITEMS, items.filter(i => i.id !== itemId));
    return result ? result.success : true;
  },

  getMessages: async (userId: string): Promise<Message[]> => {
    const apiMsgs = await dataStore.safeFetch(`/api/messages?userId=${userId}`, { method: 'GET' });
    if (apiMsgs && Array.isArray(apiMsgs)) {
      dataStore._setLocal(KEYS.MESSAGES, apiMsgs);
      return apiMsgs;
    }
    return dataStore._getLocal<Message[]>(KEYS.MESSAGES, []);
  },

  getMessagesForItem: async (userId: string, itemId: string): Promise<Message[]> => {
    const all = await dataStore.getMessages(userId);
    return (all || []).filter(m => m && m.itemId === itemId);
  },

  sendMessage: async (msgData: Partial<Message>): Promise<Message> => {
    const apiMsg = await dataStore.safeFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify(msgData),
    });

    const newMsg = apiMsg || {
      ...msgData,
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    } as Message;

    if (!apiMsg) {
      const msgs = dataStore._getLocal<Message[]>(KEYS.MESSAGES, []);
      dataStore._setLocal(KEYS.MESSAGES, [...msgs, newMsg]);
    }
    return newMsg;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const apiUser = await dataStore.safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'update', userId, updates }),
    });
    
    const current = dataStore.getCurrentUser();
    const updated = apiUser || (current ? { ...current, ...updates } : updates as User);
    if (current && updated.id === current.id) {
      dataStore.setCurrentUser(updated);
    }
    return updated;
  }
};