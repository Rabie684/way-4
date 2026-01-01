import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Language, User, ProfileSettings } from '../types';
import { geminiService } from '../services/geminiService';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import { LANGUAGES } from '../constants';

// Manual audio decoding functions (as per Gemini guidelines)
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface JarvisAssistantProps {
  currentUser: User;
  currentSettings: ProfileSettings;
  onBack: () => void;
}

interface JarvisMessage {
  id: string;
  sender: 'user' | 'jarvis';
  text: string;
  sources?: string[];
  audioBase64?: string;
  timestamp: Date;
}

const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ currentUser, currentSettings, onBack }) => {
  const [messages, setMessages] = useState<JarvisMessage[]>([]);
  const [userPrompt, setUserPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initialize AudioContext if not already initialized
    // FIX: Use standard AudioContext instead of webkitAudioContext
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.AudioContext)({ sampleRate: 24000 });
    }
    return () => {
      // Clean up AudioContext on unmount
      if (currentAudioSourceRef.current) {
        currentAudioSourceRef.current.stop();
        currentAudioSourceRef.current.disconnect();
        currentAudioSourceRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  const playAudio = useCallback(async (base64Audio: string) => {
    if (!audioContextRef.current) {
      setError("Audio context not initialized.");
      return;
    }

    // Stop any currently playing audio
    if (currentAudioSourceRef.current) {
      currentAudioSourceRef.current.stop();
      currentAudioSourceRef.current.disconnect();
      currentAudioSourceRef.current = null;
    }

    try {
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0); // Play immediately
      currentAudioSourceRef.current = source;

      source.onended = () => {
        if (currentAudioSourceRef.current === source) {
          currentAudioSourceRef.current = null;
        }
      };

    } catch (err) {
      console.error("Error playing audio:", err);
      setError("فشل تشغيل الصوت.");
    }
  }, []);


  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userPrompt.trim() === '' || loading) return;

    setError('');
    setLoading(true);

    const newUserMessage: JarvisMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userPrompt.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserPrompt('');

    try {
      const response = await geminiService.getJarvisResponse(userPrompt.trim(), currentSettings.language, currentSettings);

      const newJarvisMessage: JarvisMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: response.text,
        sources: response.sources,
        audioBase64: response.audioBase64,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, newJarvisMessage]);

      if (response.audioBase64) {
        playAudio(response.audioBase64);
      }

    } catch (err) {
      console.error("Error communicating with Jarvis:", err);
      // FIX: Complete the error message string
      setError('حدث خطأ في الاتصال بمساعد جارفس. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <Button onClick={onBack} variant="secondary" size="sm" className="ml-2">
            {'<'} عودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-4">
            <span className="emoji-icon-shine text-green-500 text-2xl mr-2">🤖</span> مساعد جارفس
          </h2>
        </div>
      </div>

      {error && <p className="text-red-500 p-4">{error}</p>}
      {loading && <LoadingSpinner />}

      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">مرحباً {currentUser.name}! أنا جارفس، مساعدك الذكي.</p>
            <p>يمكنني مساعدتك في البحث عن معلومات أكاديمية، والإجابة على أسئلتك، وتقديم مصادر موثوقة.</p>
            <p>فقط اسأل!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-2xl ${ // Larger rounded corners
                  message.sender === 'user'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 shadow-sm'
                }`}
              >
                <p className="font-semibold text-sm mb-1">{message.sender === 'user' ? currentUser.name : 'جارفس'}</p>
                <p className="text-base break-words">{message.text}</p>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 text-xs opacity-90">
                    <p className="font-medium">المصادر:</p>
                    <ul className="list-disc list-inside">
                      {message.sources.map((source, index) => (
                        <li key={index}>
                          <a href={source} target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:underline">
                            {source}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <span className="text-xs opacity-80 mt-1 block">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
                {message.audioBase64 && (
                    <Button onClick={() => playAudio(message.audioBase64!)} variant="ghost" size="sm" className="mt-2 text-white dark:text-green-300">
                      ▶️ استمع للرد
                    </Button>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendPrompt} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center sticky bottom-0 bg-white dark:bg-gray-800">
        <Input
          id="jarvis-prompt"
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="اسأل جارفس سؤالاً..."
          className="flex-1 mr-2"
          disabled={loading}
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'جاري الإرسال...' : 'إرسال'}
        </Button>
      </form>
    </div>
  );
};

export default JarvisAssistant;