import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
  createdAt: Date;
}

export interface Chat {
  id: string;
  programId: string;
  programTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  ownerId: string;
  participants: string[]; // [studentId, ownerId]
  lastMessage: string | null;
  lastMessageTimestamp: Timestamp | null;
  unreadCountStudent: number;
  unreadCountOwner: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateChatParams {
  programId: string;
  programTitle: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  ownerId: string;
}

export interface SendMessageParams {
  chatId: string;
  text: string;
}
