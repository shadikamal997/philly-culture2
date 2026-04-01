'use client';

import { useState } from 'react';
import { useUserChats } from '@/hooks/useChat';
import ChatInterface from '@/components/chat/ChatInterface';
import { Chat } from '@/types/chat';

export default function AdminChatsPage() {
  const { chats, loading } = useUserChats();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Student Support Chats
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage conversations with enrolled students
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chats List */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Active Chats ({chats.length})
            </h2>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {chats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-500 dark:text-gray-400">
                  No active chats yet
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setSelectedChat(chat)}
                    className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedChat?.id === chat.id
                        ? 'bg-red-50 dark:bg-red-900/20'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                        {chat.studentName}
                      </h3>
                      {chat.unreadCountOwner > 0 && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {chat.unreadCountOwner}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {chat.studentEmail}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-1">
                      {chat.programTitle}
                    </p>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <ChatInterface
              chatId={selectedChat.id}
              programTitle={`${selectedChat.studentName} - ${selectedChat.programTitle}`}
            />
          ) : (
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 h-[600px] flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-500 dark:text-gray-400">
                  Select a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
