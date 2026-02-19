
import { Item, Message, User, Category, ItemStatus } from '../types';

/**
 * MongoDB Atlas Data API Configuration
 */
const ATLAS_CONFIG = {
  endpoint: (typeof process !== 'undefined' && process.env.MONGODB_ATLAS_ENDPOINT) || '',
  apiKey: (typeof process !== 'undefined' && process.env.MONGODB_ATLAS_API_KEY) || '',
  cluster: (typeof process !== 'undefined' && process.env.MONGODB_CLUSTER) || 'Cluster0',
  database: (typeof process !== 'undefined' && process.env.MONGODB_DB_NAME) || 'aau_lost_found',
};

async function callAtlas(action: string, collection: string, filter: any = {}, document: any = null, update: any = null) {
  if (!ATLAS_CONFIG.endpoint || !ATLAS_CONFIG.apiKey) {
    return null;
  }

  try {
    const body: any = {
      dataSource: ATLAS_CONFIG.cluster,
      database: ATLAS_CONFIG.database,
      collection: collection,
      filter: filter,
    };
    if (document) body.document = document;
    if (update) body.update = update;

    const response = await fetch(`${ATLAS_CONFIG.endpoint}/action/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': ATLAS_CONFIG.apiKey,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || `Atlas API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`[ATLAS_ERROR] ${collection}:${action}:`, error.message);
    throw error;
  }
}

const getLocal = (key: string) => JSON.parse(localStorage.getItem(`aau_${key}`) || '[]');
const setLocal = (key: string, data: any) => localStorage.setItem(`aau_${key}`, JSON.stringify(data));

export const dataStore = {
  signup: async (userData: Omit<User, 'id'>): Promise<User> => {
    const newUser = { ...userData, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    const atlasRes = await callAtlas('insertOne', 'users', {}, newUser);
    if (atlasRes) return { ...newUser, id: atlasRes.insertedId };
    const users = getLocal('users');
    users.push(newUser);
    setLocal('users', users);
    return newUser;
  },

  login: async (email: string): Promise<User | null> => {
    const atlasRes = await callAtlas('findOne', 'users', { email: email.toLowerCase() });
    if (atlasRes && atlasRes.document) {
      const doc = atlasRes.document;
      return { ...doc, id: doc._id || doc.id };
    }
    const users = getLocal('users');
    return users.find((u: any) => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  updateUser: async (userId: string, updates: Partial<User>): Promise<User> => {
    const atlasRes = await callAtlas('updateOne', 'users', { _id: { "$oid": userId } }, null, { "$set": updates });
    
    // Update local session
    const currentUser = dataStore.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const updatedUser = { ...currentUser, ...updates };
      dataStore.setCurrentUser(updatedUser);
      
      // Fallback for list of users
      const users = getLocal('users');
      const index = users.findIndex((u: any) => (u._id || u.id) === userId);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        setLocal('users', users);
      }
      return updatedUser;
    }
    throw new Error("User not found in local session");
  },

  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem('aau_current_user');
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) localStorage.setItem('aau_current_user', JSON.stringify(user));
    else localStorage.removeItem('aau_current_user');
  },

  logout: () => dataStore.setCurrentUser(null),

  getItems: async (): Promise<Item[]> => {
    const atlasRes = await callAtlas('find', 'items', {});
    if (atlasRes && atlasRes.documents) {
      return atlasRes.documents.map((d: any) => ({ ...d, id: d._id || d.id }));
    }
    return getLocal('items');
  },

  saveItem: async (item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9), createdAt: Date.now() };
    const atlasRes = await callAtlas('insertOne', 'items', {}, newItem);
    if (atlasRes) return { ...newItem, id: atlasRes.insertedId };
    const items = getLocal('items');
    items.unshift(newItem);
    setLocal('items', items);
    return newItem;
  },

  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    const newMsg = { ...message, id: Math.random().toString(36).substr(2, 9), timestamp: Date.now() };
    const atlasRes = await callAtlas('insertOne', 'messages', {}, newMsg);
    if (atlasRes) return { ...newMsg, id: atlasRes.insertedId };
    const messages = getLocal('messages');
    messages.push(newMsg);
    setLocal('messages', messages);
    return newMsg;
  },

  getMessages: async (userId: string): Promise<Message[]> => {
    const atlasRes = await callAtlas('find', 'messages', {
      $or: [{ senderId: userId }, { receiverId: userId }]
    });
    if (atlasRes && atlasRes.documents) return atlasRes.documents.map((d: any) => ({ ...d, id: d._id || d.id }));
    const messages = getLocal('messages');
    return messages.filter((m: any) => m.senderId === userId || m.receiverId === userId);
  },

  getMessagesForItem: async (userId: string, itemId: string): Promise<Message[]> => {
    const msgs = await dataStore.getMessages(userId);
    return msgs.filter((m) => m.itemId === itemId);
  }
};
