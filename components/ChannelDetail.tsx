import React, { useState, useEffect, useCallback } from 'react';
import { Channel, User, ChannelContent, Language, UserRole, ProfileSettings } from '../types';
import { channelService } from '../services/channelService';
import Button from './Button';
import Input from './Input';
import ChatWindow from './ChatWindow';
import LoadingSpinner from './LoadingSpinner';
import { geminiService } from '../services/geminiService';
import Select from './Select';
import { LANGUAGES } from '../constants';
import { authService } from '../services/authService'; // Import authService to get all users

interface ChannelDetailProps {
  channel: Channel;
  currentUser: User;
  onBack: () => void;
  // This prop and setter are needed to update the parent's `channels` state
  // when content is published or chat messages are added.
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  currentSettings: ProfileSettings; // Added currentSettings prop
}

const ChannelDetail: React.FC<ChannelDetailProps> = ({ channel, currentUser, onBack, setChannels, currentSettings }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'chat'>('content');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'image' | 'video'>('pdf');

  const isProfessor = currentUser.role === UserRole.Professor && currentUser.id === channel.professorId;
  const isSubscribed = channel.subscribers.includes(currentUser.id);

  const languageOptions = LANGUAGES.map(lang => ({ value: lang.code, label: lang.name }));

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handlePublishContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('الرجاء اختيار ملف للتحميل.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Url = reader.result as string;
        const newContent: Omit<ChannelContent, 'id'> = {
          type: uploadFileType,
          url: base64Url,
          fileName: uploadFileType === 'pdf' ? uploadFile.name : undefined,
          thumbnail: uploadFileType === 'video' ? 'https://picsum.photos/300/200?random=' + Date.now() : undefined, // Mock thumbnail
        };
        const updatedChannel = await channelService.publishContent(channel.id, newContent);
        setChannels(prev => prev.map(c => (c.id === updatedChannel.id ? updatedChannel : c)));
        setUploadFile(null);
        setMessage('تم نشر المحتوى بنجاح!');
        // Removed Firebase Cloud Messaging notification simulation as per user request.
      };
      reader.readAsDataURL(uploadFile);
    } catch (err) {
      setError('فشل نشر المحتوى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    try {
      const updatedChannel = await channelService.sendChannelMessage(channel.id, currentUser, text);
      setChannels(prev => prev.map(c => (c.id === updatedChannel.id ? updatedChannel : c)));
    } catch (err) {
      console.error('فشل إرسال رسالة القناة:', err);
      setError('فشل إرسال الرسالة.');
    }
  };
  
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Clear message after a few seconds
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  // Check subscription before rendering content
  if (!isProfessor && !isSubscribed) {
    return (
      <div className="p-6 md:p-8 text-center bg-gray-100 dark:bg-gray-900 min-h-full flex flex-col justify-center items-center">
        <h2 className="text-3xl font-bold text-red-600 mb-4">لا يمكنك الوصول إلى هذه القناة</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">يجب عليك الاشتراك في هذه القناة للوصول إلى محتواها ودردشتها.</p>
        <Button onClick={onBack} variant="primary">
          العودة إلى لوحة التحكم
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <Button onClick={onBack} variant="secondary" size="sm" className="ml-2">
            {'<'} عودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-4">
            قناة {channel.name}
          </h2>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button
            onClick={() => setActiveTab('content')}
            variant={activeTab === 'content' ? 'primary' : 'ghost'}
          >
            المحتوى
          </Button>
          <Button
            onClick={() => setActiveTab('chat')}
            variant={activeTab === 'chat' ? 'primary' : 'ghost'}
          >
            الدردشة
          </Button>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 p-4">{error}</p>}
      {message && <p className="text-green-600 p-4">{message}</p>}

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Content Display */}
            <div className="flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto custom-scrollbar">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">المحتوى التعليمي</h3>
              <div className="space-y-4 flex-1">
                {channel.content.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">لا يوجد محتوى في هذه القناة بعد.</p>
                ) : (
                  channel.content.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between shadow-sm"
                    >
                      {item.type === 'pdf' && (
                        <div className="flex items-center">
                          <span className="emoji-icon-shine text-green-500 text-2xl mr-2">📄</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                            {item.fileName || 'ملف PDF'}
                          </a>
                        </div>
                      )}
                      {item.type === 'image' && (
                        <div className="flex items-center">
                          <span className="emoji-icon-shine text-green-500 text-2xl mr-2">🖼️</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                            مشاهدة الصورة
                          </a>
                        </div>
                      )}
                      {item.type === 'video' && (
                        <div className="flex flex-col items-start">
                          <span className="emoji-icon-shine text-green-500 text-2xl mr-2">🎥</span>
                          <video controls src={item.url} poster={item.thumbnail} className="max-w-xs h-auto rounded-md mb-2"></video>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">
                            مشاهدة الفيديو
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              <div className="mt-6 p-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={channel.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors w-full"
                >
                  <span className="mr-2">📞</span> الانضمام إلى اجتماع Google Meet
                </a>
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Professor Content Upload Form */}
              {isProfessor && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">نشر محتوى جديد</h3>
                  <form onSubmit={handlePublishContent}>
                    <Select
                        id="uploadFileType"
                        label="نوع المحتوى"
                        options={[
                            { value: 'pdf', label: 'ملف PDF' },
                            { value: 'image', label: 'صورة' },
                            { value: 'video', label: 'فيديو' },
                        ]}
                        value={uploadFileType}
                        onChange={(e) => setUploadFileType(e.target.value as 'pdf' | 'image' | 'video')}
                        className="mb-4"
                    />
                    <Input
                      id="contentFile"
                      type="file"
                      accept={
                        uploadFileType === 'pdf' ? '.pdf' :
                        uploadFileType === 'image' ? 'image/*' :
                        uploadFileType === 'video' ? 'video/*' : ''
                      }
                      onChange={handleUploadFileChange}
                      className="mb-4"
                      required
                    />
                    <Button type="submit" fullWidth disabled={loading}>
                      {loading ? 'جاري النشر...' : 'نشر المحتوى'}
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="h-full">
            <ChatWindow
              messages={channel.chatMessages}
              currentUser={currentUser}
              onSendMessage={handleSendMessage}
              chatTitle="دردشة القناة"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelDetail;