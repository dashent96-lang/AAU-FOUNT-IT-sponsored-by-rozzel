import { Item, Message, User } from '../types';

/**
 * Data Service using Next.js API Routes (Server-side MongoDB)
 * Ambrose Alli University Lost & Found Portal
 */
export const dataStore = {
  /**
   * Safe fetch wrapper to handle non-JSON error pages and network failures
   */
  async safeFetch(url: string, options: RequestInit) {
    let response;
    try {
      response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(options.headers || {}),
        },
      });
    } catch (networkError) {
      throw new Error("Unable to reach the server. Please check if the local server is running.");
    }

    if (response.status === 404) {
      throw new Error("API Route not found. Ensure you are running the app with 'next dev' and not just opening index.html.");
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text.substring(0, 100));
      throw new Error(`Server Error (${response.status}): The server returned an invalid response.`);
    }

    if (!response.ok) {
      throw new Error(data?.error || `Request failed with status ${response.status}`);
    }

    return data;
  },

  signup: async (userData: Omit<User, 'id'>): Promise<User> => {
    const user = await dataStore.safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'signup', ...userData }),
    });
    dataStore.setCurrentUser(user);
    return user;
  },

  login: async (email: string): Promise<User | null> => {
    try {
      const user = await dataStore.safeFetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email }),
      });
      dataStore.setCurrentUser(user);
      return user;
    } catch (e: any) {
      if (e.message.includes('404') && !e.message.includes('API Route')) return null;
      throw e;
    }
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const user = await dataStore.safeFetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({ action: 'update', userId, updates }),
    });
    dataStore.setCurrentUser(user);
    return user;
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem('aau_current_user');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('aau_current_user', JSON.stringify(user));
    else localStorage.removeItem('aau_current_user');
  },

  logout: () => dataStore.setCurrentUser(null),

  getItems: async (): Promise<Item[]> => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) return [];
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return [];
    } catch (e) {
      console.error("Fetch Items Error:", e);
      return [];
    }
  },

  saveItem: async (item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> => {
    return dataStore.safeFetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  },

  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    return dataStore.safeFetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ ...message }),
    });
  },

  getMessages: async (userId: string): Promise<Message[]> => {
    try {
      const response = await fetch(`/api/messages?userId=${userId}`);
      if (!response.ok) return [];
      return await response.json();
    } catch (e) {
      return [];
    }
  },

  getMessagesForItem: async (userId: string, itemId: string): Promise<Message[]> => {
    const msgs = await dataStore.getMessages(userId);
    return msgs.filter((m) => m.itemId === itemId);
  }
};