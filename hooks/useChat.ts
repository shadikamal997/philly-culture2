'use client';

import { useState, useEffect } from 'react';
import { Chat, ChatMessage } from '@/types/chat';
import {
  subscribeToMessages,
  subscribeToUserChats,
  sendMessage as sendChatMessage,
  markMessagesAsRead,
  getChat,
} from '@/services/chatService';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to get and manage chat messages
 */
export function useChatMessages(chatId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToMessages(chatId, (newMessages) => {
      setMessages(newMessages);
      setLoading(false);

      // Mark as read when messages are received
      if (user?.uid && newMessages.length > 0) {
        markMessagesAsRead(chatId, user.uid).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, [chatId, user?.uid]);

  const sendMessage = async (text: string) => {
    if (!chatId || !user?.uid || !userData) {
      throw new Error('Not authenticated');
    }

    await sendChatMessage(
      chatId,
      user.uid,
      userData.displayName || userData.fullName || 'User',
      user.email || userData.email || '',
      text
    );
  };

  return {
    messages,
    loading,
    sendMessage,
  };
}

/**
 * Hook to get user's chats
 */
export function useUserChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserChats(user.uid, (userChats) => {
      setChats(userChats);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  return {
    chats,
    loading,
  };
}

/**
 * Hook to get a specific chat
 */
export function useChat(chatId: string | null) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getChat(chatId)
      .then((chatData) => {
        setChat(chatData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching chat:', error);
        setLoading(false);
      });
  }, [chatId]);

  return {
    chat,
    loading,
  };
}
