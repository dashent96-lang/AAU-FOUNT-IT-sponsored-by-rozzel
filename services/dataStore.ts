
import { Item, Message, ItemStatus, Category, Conversation, User } from '../types';

/**
 * MONGODB ATLAS PRODUCTION CONFIGURATION
 * =====================================
 * This service is pre-wired for Vercel/Atlas integration.
 * It uses Environment Variables to keep your keys secure.
 */

const ATLAS_CONFIG = {
  // Try to get from environment or fallback for development
  endpoint: (typeof process !== 'undefined' && process.env.MONGODB_ATLAS_ENDPOINT) || 'https://data.mongodb-api.com/app/data-abcde/endpoint/data/v1',
  apiKey: (typeof process !== 'undefined' && process.env.MONGODB_ATLAS_API_KEY) || 'YOUR_ATLAS_DATA_API_KEY',
  dataSource: (typeof process !== 'undefined' && process.env.MONGODB_CLUSTER) || 'Cluster0',
  database: (typeof process !== 'undefined' && process.env.MONGODB_DB_NAME) || 'aau_lost_found_db',
};

const headers = {
  'Content-Type': 'application/json',
  'api-key': ATLAS_CONFIG.apiKey,
};

/**
 * Atlas Data API Request Wrapper
 */
async function atlasAction(action: string, collection: string, body: any) {
  // If we have a real endpoint and it's not the default placeholder, use fetch
  if (!ATLAS_CONFIG.endpoint.includes('data-abcde') && ATLAS_CONFIG.apiKey !== 'YOUR_ATLAS_DATA_API_KEY') {
    try {
      const response = await fetch(`${ATLAS_CONFIG.endpoint}/action/${action}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dataSource: ATLAS_CONFIG.dataSource,
          database: ATLAS_CONFIG.database,
          collection,
          ...body,
        }),
      });
      return await response.json();
    } catch (error) {
      console.error(`Atlas Data API Error (${action}):`, error);
      throw error;
    }
  }
  
  // FALLBACK: Local Storage Mocking (Useful for testing before adding ENV variables on Vercel)
  return mockAtlasBehavior(action, collection, body);
}

async function mockAtlasBehavior(action: string, collection: string, body: any) {
  const STORAGE_KEY = `aau_atlas_db_${collection}`;
  const getData = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const setData = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  await new Promise(r => setTimeout(r, 400)); // Network latency simulation

  switch (action) {
    case 'find':
      const docs = getData();
      const filtered = body.filter 
        ? docs.filter((d: any) => Object.keys(body.filter).every(k => d[k] === body.filter[k]))
        : docs;
      return { 
        documents: filtered.sort((a: any, b: any) => 
          (body.sort?.createdAt === -1 ? b.createdAt - a.createdAt : 0)
        ) 
      };

    case 'findOne':
      const one = getData().find((d: any) => Object.keys(body.filter).every(k => d[k] === body.filter[k]));
      return { document: one || null };

    case 'insertOne':
      const current = getData();
      const newDoc = { 
        ...body.document, 
        _id: `id_${Math.random().toString(36).substr(2, 9)}` 
      };
      setData([...current, newDoc]);
      return { insertedId: newDoc._id };

    case 'aggregate':
      // Simplified mock aggregation for messages
      return { documents: [] };

    default:
      return { error: 'Action not supported in mock' };
  }
}

export const dataStore = {
  // --- USER OPERATIONS ---
  signup: async (userData: Omit<User, 'id'>): Promise<User> => {
    const check = await atlasAction('findOne', 'users', { filter: { email: userData.email } });
    if (check.document) return { ...check.document, id: check.document._id };

    const newUser = { ...userData, createdAt: new Date().toISOString() };
    const res = await atlasAction('insertOne', 'users', { document: newUser });
    const user = { ...userData, id: res.insertedId };
    dataStore.setCurrentUser(user);
    return user;
  },

  login: async (email: string): Promise<User | null> => {
    const res = await atlasAction('findOne', 'users', { filter: { email: email.toLowerCase() } });
    if (res.document) {
      const user = { ...res.document, id: res.document._id };
      dataStore.setCurrentUser(user);
      return user;
    }
    return null;
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('aau_atlas_session');
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem('aau_atlas_session', JSON.stringify(user));
    else localStorage.removeItem('aau_atlas_session');
  },

  logout: () => dataStore.setCurrentUser(null),

  // --- ITEM OPERATIONS ---
  getItems: async (): Promise<Item[]> => {
    const res = await atlasAction('find', 'items', { sort: { createdAt: -1 } });
    return res.documents.map((d: any) => ({ ...d, id: d._id }));
  },

  saveItem: async (item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> => {
    const newItem = { ...item, createdAt: Date.now() };
    const res = await atlasAction('insertOne', 'items', { document: newItem });
    return { ...newItem, id: res.insertedId };
  },

  // --- MESSAGE OPERATIONS ---
  sendMessage: async (message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> => {
    const newMessage = { ...message, timestamp: Date.now() };
    const res = await atlasAction('insertOne', 'messages', { document: newMessage });
    return { ...newMessage, id: res.insertedId };
  },

  getMessagesForItem: async (userId: string, itemId: string): Promise<Message[]> => {
    const res = await atlasAction('find', 'messages', { filter: { itemId } });
    return (res.documents || [])
      .filter((m: any) => m.senderId === userId || m.receiverId === userId)
      .map((m: any) => ({ ...m, id: m._id }));
  },

  getConversations: async (userId: string): Promise<Conversation[]> => {
    const itemsRes = await atlasAction('find', 'items', {});
    const items = itemsRes.documents || [];
    
    const messagesRes = await atlasAction('find', 'messages', {});
    const messages = (messagesRes.documents || []).filter((m: any) => m.senderId === userId || m.receiverId === userId);

    const convMap = new Map<string, Conversation>();

    messages.forEach((msg: any) => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.itemId}_${otherUserId}`;
      const item = items.find((i: any) => i._id === msg.itemId);
      
      if (!convMap.has(key)) {
        convMap.set(key, {
          itemId: msg.itemId,
          otherUserId,
          otherUserName: item?.posterId === otherUserId ? item.posterName : "Student",
          itemTitle: item?.title || "Unknown Item",
          lastMessage: msg.content,
          lastTimestamp: msg.timestamp,
          messages: []
        });
      }

      const conv = convMap.get(key)!;
      conv.messages.push({ ...msg, id: msg._id });
      if (msg.timestamp > conv.lastTimestamp) {
        conv.lastMessage = msg.content;
        conv.lastTimestamp = msg.timestamp;
      }
    });

    return Array.from(convMap.values()).sort((a, b) => b.lastTimestamp - a.lastTimestamp);
  }
};
