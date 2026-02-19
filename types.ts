
export enum ItemStatus {
  LOST = 'LOST',
  FOUND = 'FOUND',
  RECLAIMED = 'RECLAIMED'
}

export enum Category {
  ELECTRONICS = 'Electronics',
  DOCUMENTS = 'Documents',
  CLOTHING = 'Clothing',
  WALLETS = 'Wallets/Bags',
  OTHERS = 'Others'
}

export interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
  faculty?: string;
  level?: string;
  studentId?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  preferredMeetingSpot?: string;
  socialHandle?: string;
}

export interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  date: string;
  status: ItemStatus;
  imageUrl: string;
  posterId: string;
  posterName: string;
  createdAt: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  itemId: string;
  content: string;
  timestamp: number;
}

export interface Conversation {
  itemId: string;
  otherUserId: string;
  otherUserName: string;
  itemTitle: string;
  lastMessage: string;
  lastTimestamp: number;
  messages: Message[];
}
