import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  getDocs,
  getDoc,
  increment,
} from 'firebase/firestore';
import { db } from '@/firebase/firebaseClient';
import { Chat, ChatMessage, CreateChatParams, SendMessageParams } from '@/types/chat';

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

/**
 * Get or create a chat for a program enrollment
 */
export async function getOrCreateChat(params: CreateChatParams): Promise<string> {
  const { programId, studentId, ownerId, programTitle, studentName, studentEmail } = params;

  // Check if chat already exists
  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(
    chatsRef,
    where('programId', '==', programId),
    where('studentId', '==', studentId)
  );

  const existingChats = await getDocs(q);

  if (!existingChats.empty) {
    return existingChats.docs[0].id;
  }

  // Create new chat
  const chatDoc = await addDoc(chatsRef, {
    programId,
    programTitle,
    studentId,
    studentName,
    studentEmail,
    ownerId,
    participants: [studentId, ownerId],
    lastMessage: null,
    lastMessageTimestamp: null,
    unreadCountStudent: 0,
    unreadCountOwner: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return chatDoc.id;
}

/**
 * Send a message in a chat
 */
export async function sendMessage(
  chatId: string,
  senderId: string,
  senderName: string,
  senderEmail: string,
  text: string
): Promise<void> {
  if (!text.trim()) {
    throw new Error('Message cannot be empty');
  }

  // Get chat to determine recipient
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    throw new Error('Chat not found');
  }

  const chatData = chatSnap.data();
  const isStudent = senderId === chatData.studentId;

  // Add message
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  await addDoc(messagesRef, {
    chatId,
    senderId,
    senderName,
    senderEmail,
    text: text.trim(),
    timestamp: serverTimestamp(),
    read: false,
    createdAt: new Date(),
  });

  // Update chat
  await updateDoc(chatRef, {
    lastMessage: text.trim(),
    lastMessageTimestamp: serverTimestamp(),
    updatedAt: serverTimestamp(),
    // Increment unread count for recipient
    ...(isStudent
      ? { unreadCountOwner: increment(1) }
      : { unreadCountStudent: increment(1) }),
  });
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(chatId: string, userId: string): Promise<void> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    return;
  }

  const chatData = chatSnap.data();
  const isStudent = userId === chatData.studentId;

  // Reset unread count
  await updateDoc(chatRef, {
    ...(isStudent
      ? { unreadCountStudent: 0 }
      : { unreadCountOwner: 0 }),
  });

  // Mark messages as read
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    where('senderId', '!=', userId),
    where('read', '==', false)
  );

  const unreadMessages = await getDocs(q);

  const updatePromises = unreadMessages.docs.map((doc) =>
    updateDoc(doc.ref, { read: true })
  );

  await Promise.all(updatePromises);
}

/**
 * Subscribe to chat messages
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = collection(db, MESSAGES_COLLECTION);
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ChatMessage[];
    callback(messages);
  });
}

/**
 * Subscribe to user's chats
 */
export function subscribeToUserChats(
  userId: string,
  callback: (chats: Chat[]) => void
): () => void {
  const chatsRef = collection(db, CHATS_COLLECTION);
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[];
    callback(chats);
  });
}

/**
 * Get a specific chat
 */
export async function getChat(chatId: string): Promise<Chat | null> {
  const chatRef = doc(db, CHATS_COLLECTION, chatId);
  const chatSnap = await getDoc(chatRef);

  if (!chatSnap.exists()) {
    return null;
  }

  return {
    id: chatSnap.id,
    ...chatSnap.data(),
  } as Chat;
}
