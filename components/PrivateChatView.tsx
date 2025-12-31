import React, { useState, useEffect, useCallback } from 'react';
import { PrivateChat, User, Message, UserRole } from '../types';
import { channelService } from '../services/channelService';
import ChatWindow from './ChatWindow';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Select from './Select';
import { MOCK_PROFESSORS, MOCK_STUDENTS } from '../constants';

interface PrivateChatViewProps {
  currentUser: User;
  onBack: () => void;
  // This prop and setter are needed to update the parent's `privateChats` state
  setPrivateChats: React.Dispatch<React.SetStateAction<PrivateChat[]>>;
  privateChats: PrivateChat[]; // Pass current private chats from App.tsx
}

const PrivateChatView: React.FC<PrivateChatViewProps> = ({ currentUser, onBack, setPrivateChats, privateChats }) => {
  const [selectedChat, setSelectedChat] = useState<PrivateChat | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showNewChatForm, setShowNewChatForm] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState('');

  const fetchPrivateChats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const chats = await channelService.getPrivateChats(currentUser.id);
      setPrivateChats(chats);
    } catch (err) {
      setError('فشل تحميل الدردشات الخاصة.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, setPrivateChats]);

  useEffect(() => {
    fetchPrivateChats();
  }, [fetchPrivateChats]);

  const handleSendMessage = async (text: string) => {
    if (!selectedChat) return;
    try {
      const updatedChat = await channelService.sendPrivateMessage(selectedChat.id, currentUser, text);
      setSelectedChat(updatedChat);
      setPrivateChats(prev => prev.map(pc => (pc.id === updatedChat.id ? updatedChat : pc)));
    } catch (err) {
      console.error('فشل إرسال رسالة خاصة:', err);
      setError('فشل إرسال الرسالة.');
    }
  };

  const allPossibleRecipients = (currentUser.role === UserRole.Professor ? MOCK_STUDENTS : MOCK_PROFESSORS)
    .filter(u => u.id !== currentUser.id) // Exclude self
    .map(u => ({ value: u.id, label: `${u.name} (${u.role === UserRole.Professor ? 'أستاذ' : 'طالب'})` }));

  const handleCreateNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecipientId) {
      setError('الرجاء اختيار مستخدم لبدء الدردشة معه.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const recipient = [...MOCK_PROFESSORS, ...MOCK_STUDENTS].find(u => u.id === selectedRecipientId);
      if (!recipient) {
        throw new Error('المستلم غير موجود.');
      }
      const newChat = await channelService.getOrCreatePrivateChat(
        currentUser.id,
        recipient.id,
        currentUser.name,
        recipient.name
      );
      setPrivateChats(prev => {
        if (!prev.some(pc => pc.id === newChat.id)) {
            return [...prev, newChat];
        }
        return prev;
      });
      setSelectedChat(newChat);
      setShowNewChatForm(false);
      setSelectedRecipientId('');
    } catch (err) {
      setError('فشل بدء الدردشة الجديدة.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <Button onClick={onBack} variant="secondary" size="sm" className="ml-2">
            {'<'} عودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-4">دردشاتي الخاصة</h2>
        </div>
        <Button onClick={() => setShowNewChatForm(!showNewChatForm)} className="mt-2 sm:mt-0">
          {showNewChatForm ? 'إلغاء' : 'بدء دردشة جديدة'}
        </Button>
      </div>

      {error && <p className="text-red-500 p-4">{error}</p>}
      {loading && <LoadingSpinner />}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-4 md:p-6">
        {/* Chat List */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <h3 className="text-xl font-semibold p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            جهات الاتصال
          </h3>
          <div className="p-4 space-y-2 custom-scrollbar overflow-y-auto max-h-[calc(100vh-200px)]">
            {showNewChatForm && (
                <form onSubmit={handleCreateNewChat} className="mb-4 p-3 border border-blue-200 dark:border-blue-700 rounded-md bg-blue-50 dark:bg-blue-900">
                    <Select
                        id="newRecipient"
                        label="المستلم"
                        options={[{ value: '', label: 'اختر مستلم...' }, ...allPossibleRecipients]}
                        value={selectedRecipientId}
                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                        required
                    />
                    <Button type="submit" fullWidth disabled={loading} className="mt-2">
                        {loading ? 'جاري البدء...' : 'بدء الدردشة'}
                    </Button>
                </form>
            )}
            {privateChats.length === 0 && !showNewChatForm ? (
              <p className="text-center text-gray-500 dark:text-gray-400">لا توجد دردشات خاصة.</p>
            ) : (
              privateChats.map((chat) => {
                const otherParticipantId = chat.participants.find(id => id !== currentUser.id);
                const otherParticipant = [...MOCK_PROFESSORS, ...MOCK_STUDENTS].find(u => u.id === otherParticipantId);
                const chatName = otherParticipant?.name || 'مستخدم غير معروف';
                const chatPic = otherParticipant?.profilePic || 'https://picsum.photos/100/100?random=0';

                return (
                  <div
                    key={chat.id}
                    className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                                ${selectedChat?.id === chat.id ? 'bg-blue-100 dark:bg-blue-700' : ''}`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <img src={chatPic} alt="Profile" className="w-10 h-10 rounded-full mr-3" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{chatName}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'لا توجد رسائل'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2">
          {selectedChat ? (
            <ChatWindow
              messages={selectedChat.messages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              chatTitle={`دردشة مع ${[...MOCK_PROFESSORS, ...MOCK_STUDENTS].find(u => u.id === selectedChat.participants.find(p => p !== currentUser.id))?.name || 'مستخدم'}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-500 dark:text-gray-400">
              اختر دردشة من القائمة لبدء المحادثة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrivateChatView;