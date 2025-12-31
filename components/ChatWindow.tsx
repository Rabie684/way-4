import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import Input from './Input';
import Button from './Button';

interface ChatWindowProps {
  messages: Message[];
  currentUser: User;
  onSendMessage: (text: string) => Promise<void>;
  chatTitle: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, currentUser, onSendMessage, chatTitle }) => {
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '' || sending) return;

    setSending(true);
    try {
      await onSendMessage(newMessage.trim());
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally display an error message to the user
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{chatTitle}</h3>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">لا توجد رسائل بعد. ابدأ المحادثة!</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  message.senderId === currentUser.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100'
                }`}
              >
                <p className="font-semibold text-sm">{message.senderName}</p>
                <p className="text-base break-words">{message.text}</p>
                <span className="text-xs opacity-80 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center sticky bottom-0 bg-white dark:bg-gray-800">
        <Input
          id="newMessage"
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 mr-2"
          disabled={sending}
        />
        <Button type="submit" disabled={sending}>
          {sending ? 'جاري الإرسال...' : 'إرسال'}
        </Button>
      </form>
    </div>
  );
};

export default ChatWindow;