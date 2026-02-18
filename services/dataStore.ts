
import { Item, Message, ItemStatus, Category, Conversation, User } from '../types';

/**
 * MONGODB ATLAS PRODUCTION CONFIGURATION
 */
const ATLAS_CONFIG = {
  endpoint: process.env.MONGODB_ATLAS_ENDPOINT || '',
  apiKey: process.env.MONGODB_ATLAS_API_KEY || '',
  dataSource: process.env.MONGODB_CLUSTER || 'Cluster0',
  database: process.env.MONGODB_DB_NAME || 'aau_lost_found_db',
};

const headers = {
  'Content-Type': 'application/json',
  'api-key': ATLAS_CONFIG.apiKey,
};

export const isCloudConnected = () => !!(ATLAS_CONFIG.endpoint && ATLAS_CONFIG.apiKey);

/**
 * Standardized Atlas Action Wrapper
 */
async function atlasAction(action: string, collection: string, body: any) {
  if (isCloudConnected()) {
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
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Atlas HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(`Atlas API Error [${action}] on [${collection}]:`, error);
      return mockAtlasBehavior(action, collection, body);
    }
  }
  return mockAtlasBehavior(action, collection, body);
}

async function mockAtlasBehavior(action: string, collection: string, body: any) {
  const STORAGE_KEY = `aau_db_${collection}`;
  const getData = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  const setData = (data: any) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  switch (action) {
    case 'find':
      let docs = getData();
      if (body.filter) {
        docs = docs.filter((d: any) => 
          Object.entries(body.filter).every(([k, v]) => d[k] === v)
        );
      }
      if (body.sort?.createdAt === -1) {
        docs.sort((a: any, b: any) => b.createdAt - a.createdAt);
      }
      return { documents: docs };

    case 'findOne':
      const one = getData().find((d: any) => 
        Object.entries(body.filter).every(([k, v]) => d[k] === v)
      );
      return { document: one || null };

    case 'insertOne':
      const current = getData();
      const newDoc = { 
        ...body.document, 
        _id: `id_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: body.document.createdAt || Date.now()
      };
      setData([...current, newDoc]);
      return { insertedId: newDoc._id };

    default:
      return { documents: [], document: null };
  }
}

export const dataStore = {
  // --- USER AUTHENTICATION ---
  signup: async (userData: Omit<User, 'id'>): Promise<User> => {
    const existing = await atlasAction('findOne', 'users', { filter: { email: userData.email.toLowerCase() } });
    if (existing.document) {
      const user = { ...existing.document, id: existing.document._id };
      dataStore.setCurrentUser(user);
      return user;
    }
    const newUser = { ...userData, email: userData.email.toLowerCase(), createdAt: new Date().toISOString() };
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
    const data = localStorage.getItem('aau_session_v2');
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem('aau_session_v2', JSON.stringify(user));
    else localStorage.removeItem('aau_session_v2');
  },

  logout: () => dataStore.setCurrentUser(null),

  // --- ITEM MANAGEMENT ---
  getItems: async (): Promise<Item[]> => {
    const res = await atlasAction('find', 'items', { sort: { createdAt: -1 } });
    return (res.documents || []).map((d: any) => ({ ...d, id: d._id }));
  },

  saveItem: async (item: Omit<Item, 'id' | 'createdAt'>): Promise<Item> => {
    const newItem = { ...item, createdAt: Date.now() };
    const res = await atlasAction('insertOne', 'items', { document: newItem });
    return { ...newItem, id: res.insertedId };
  },

  // --- MESSAGING SYSTEM ---
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
    const [itemsRes, messagesRes] = await Promise.all([
      atlasAction('find', 'items', {}),
      atlasAction('find', 'messages', {})
    ]);

    const allItems = itemsRes.documents || [];
    const userMessages = (messagesRes.documents || []).filter((m: any) => 
      m.senderId === userId || m.receiverId === userId
    );

    const convMap = new Map<string, Conversation>();

    userMessages.forEach((msg: any) => {
      const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const key = `${msg.itemId}_${otherUserId}`;
      const item = allItems.find((i: any) => i._id === msg.itemId);
      
      if (!convMap.has(key)) {
        convMap.set(key, {
          itemId: msg.itemId,
          otherUserId,
          otherUserName: item?.posterId === otherUserId ? item.posterName : "AAU User",
          itemTitle: item?.title || "Deleted Item",
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
