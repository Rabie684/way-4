import React, { useState, useEffect, useCallback } from 'react';
import { User, Channel, University, College } from '../types';
import { channelService } from '../services/channelService';
import { MOCK_UNIVERSITIES, SUBSCRIPTION_PRICE, MOCK_CHANNELS, MOCK_PROFESSORS } from '../constants';
import Button from './Button';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import { authService } from '../services/authService';

interface StudentDashboardProps {
  currentUser: User;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[]; // Pass channels as prop from App.tsx
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>; // Pass setter as prop
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>; // Pass setter for currentUser
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  onSelectChannel,
  channels,
  setChannels,
  setCurrentUser,
}) => {
  const [selectedUniversityId, setSelectedUniversityId] = useState(currentUser.university ? MOCK_UNIVERSITIES.find(u => u.name === currentUser.university)?.id || '' : '');
  const [selectedCollegeId, setSelectedCollegeId] = useState(currentUser.college ? MOCK_UNIVERSITIES.find(u => u.id === selectedUniversityId)?.colleges.find(c => c.name === currentUser.college)?.id || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const universitiesOptions = MOCK_UNIVERSITIES.map(uni => ({ value: uni.id, label: uni.name }));
  const selectedUniversity = MOCK_UNIVERSITIES.find(uni => uni.id === selectedUniversityId);
  const collegesOptions = selectedUniversity
    ? selectedUniversity.colleges.map(coll => ({ value: coll.id, label: coll.name }))
    : [];

  const fetchAvailableChannels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const universityName = MOCK_UNIVERSITIES.find(u => u.id === selectedUniversityId)?.name;
      const collegeName = selectedUniversity?.colleges.find(c => c.id === selectedCollegeId)?.name;
      
      // Fetch all channels and filter locally for simplicity in mock
      const allChannels = await channelService.getChannels();
      let filtered = allChannels;
      if (universityName) {
          filtered = filtered.filter(c => c.university === universityName);
      }
      if (collegeName) {
          filtered = filtered = filtered.filter(c => c.college === collegeName);
      }
      setChannels(filtered);
    } catch (err) {
      setError('فشل في تحميل القنوات.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedUniversityId, selectedCollegeId, selectedUniversity?.colleges, setChannels]);

  useEffect(() => {
    // Set initial values from currentUser if available
    if (currentUser.university && currentUser.college) {
        const uni = MOCK_UNIVERSITIES.find(u => u.name === currentUser.university);
        if (uni) {
            setSelectedUniversityId(uni.id);
            const coll = uni.colleges.find(c => c.name === currentUser.college);
            if (coll) {
                setSelectedCollegeId(coll.id);
            }
        }
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedUniversityId && selectedCollegeId) {
      fetchAvailableChannels();
    } else {
      setChannels([]); // Clear channels if no selection
    }
  }, [selectedUniversityId, selectedCollegeId, fetchAvailableChannels, setChannels]);

  const handleSubscribe = async (channelId: string) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      // In a real app, this would involve SMS payment gateway.
      // Here, we simulate success and update the channel/professor stars.
      const updatedChannel = await channelService.subscribeToChannel(channelId, currentUser.id);
      
      // Update channels state in App.tsx
      setChannels(prevChannels =>
        prevChannels.map(c => (c.id === channelId ? updatedChannel : c))
      );
      
      // Force update currentUser to reflect professor's stars if current user is that professor (unlikely here)
      // or if it's the student themselves, though student profile doesn't have stars.
      // More importantly, the professor's stars are updated in MOCK_PROFESSORS.
      // If the professor logs in, their stars would be correct.
      const updatedProfessor = MOCK_UNIVERSITIES.flatMap(u => u.colleges.flatMap(c => MOCK_CHANNELS.filter(ch => ch.id === channelId && ch.professorId)))
                                  .map(ch => MOCK_PROFESSORS.find(p => p.id === ch.professorId))
                                  .filter((p): p is User => p !== undefined)[0];

      if (updatedProfessor) {
        // If the current user happens to be the professor of this channel (unlikely for a student dashboard action),
        // update their local state too.
        // Or if we need to show updated stars for professors on the channel card, we'd refetch professors.
      }


      setMessage(`تم الاشتراك في القناة بنجاح! تم خصم ${SUBSCRIPTION_PRICE} دج من رصيدك.`);
      // Refetch channels to ensure updated subscriber count is visible
      fetchAvailableChannels();
    } catch (err) {
      setError('فشل الاشتراك في القناة. يرجى المحاولة مرة أخرى.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isSubscribed = (channel: Channel) => channel.subscribers.includes(currentUser.id);

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        مرحباً طالب {currentUser.name}
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">اختر جامعتك وكليتك</h3>
        <Select
          id="select-university"
          label="الجامعة"
          options={universitiesOptions}
          value={selectedUniversityId}
          onChange={(e) => {
            setSelectedUniversityId(e.target.value);
            setSelectedCollegeId('');
          }}
          required
        />
        {selectedUniversityId && (
          <Select
            id="select-college"
            label="الكلية"
            options={collegesOptions}
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            required
          />
        )}
      </div>

      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">القنوات المتاحة</h3>
      {loading ? (
        <LoadingSpinner />
      ) : channels.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">لا توجد قنوات متاحة لاختيارك.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative flex flex-col justify-between cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div>
                <h4 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">{channel.name}</h4>
                <p className="text-gray-700 dark:text-gray-300">أستاذ: {channel.professorName} <span className="text-yellow-400">⭐ {MOCK_PROFESSORS.find(p => p.id === channel.professorId)?.stars || 0}</span></p>
                <p className="text-gray-700 dark:text-gray-300">الجامعة: {channel.university}</p>
                <p className="text-gray-700 dark:text-gray-300">الكلية: {channel.college}</p>
              </div>
              <div className="mt-4">
                {isSubscribed(channel) ? (
                  <Button onClick={() => onSelectChannel(channel)} fullWidth>
                    عرض القناة
                  </Button>
                ) : (
                  <Button onClick={() => handleSubscribe(channel.id)} fullWidth disabled={loading}>
                    {loading ? 'جاري الاشتراك...' : `اشترك (${SUBSCRIPTION_PRICE} دج)`}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;