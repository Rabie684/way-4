import React, { useState, useEffect, useCallback } from 'react';
import { User, Channel, University, College } from '../types';
import { channelService } from '../services/channelService';
import { MOCK_UNIVERSITIES } from '../constants';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';

interface ProfessorDashboardProps {
  currentUser: User;
  onSelectChannel: (channel: Channel) => void;
  channels: Channel[]; // Pass channels as prop from App.tsx
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>; // Pass setter as prop
}

const ProfessorDashboard: React.FC<ProfessorDashboardProps> = ({ currentUser, onSelectChannel, channels, setChannels }) => {
  const [showCreateChannelForm, setShowCreateChannelForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [selectedUniversityId, setSelectedUniversityId] = useState(currentUser.university ? MOCK_UNIVERSITIES.find(u => u.name === currentUser.university)?.id || '' : '');
  const [selectedCollegeId, setSelectedCollegeId] = useState(currentUser.college ? MOCK_UNIVERSITIES.find(u => u.id === selectedUniversityId)?.colleges.find(c => c.name === currentUser.college)?.id || '' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const universitiesOptions = MOCK_UNIVERSITIES.map(uni => ({ value: uni.id, label: uni.name }));
  const selectedUniversity = MOCK_UNIVERSITIES.find(uni => uni.id === selectedUniversityId);
  const collegesOptions = selectedUniversity
    ? selectedUniversity.colleges.map(coll => ({ value: coll.id, label: coll.name }))
    : [];

  const specializationsOptions = selectedUniversity?.colleges.find(c => c.id === selectedCollegeId)?.specializations.map(spec => ({ value: spec, label: spec })) || [];


  const fetchProfessorChannels = useCallback(async () => {
    setLoading(true);
    try {
      const allChannels = await channelService.getChannels();
      const professorChannels = allChannels.filter(c => c.professorId === currentUser.id);
      setChannels(professorChannels);
    } catch (err) {
      setError('فشل في تحميل القنوات.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, setChannels]);

  useEffect(() => {
    fetchProfessorChannels();
  }, [fetchProfessorChannels]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!selectedUniversityId || !selectedCollegeId || !newChannelName) {
      setError('الرجاء ملء جميع الحقول.');
      setLoading(false);
      return;
    }

    const universityName = MOCK_UNIVERSITIES.find(u => u.id === selectedUniversityId)?.name;
    const collegeName = selectedUniversity?.colleges.find(c => c.id === selectedCollegeId)?.name;

    if (!universityName || !collegeName) {
        setError('خطأ في تحديد الجامعة أو الكلية.');
        setLoading(false);
        return;
    }

    try {
      const newChannel = await channelService.createChannel(
        currentUser.id,
        newChannelName,
        universityName,
        collegeName
      );
      setChannels(prev => [...prev, newChannel]);
      setNewChannelName('');
      setShowCreateChannelForm(false);
    } catch (err) {
      setError('فشل إنشاء القناة.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const professorChannels = channels.filter(c => c.professorId === currentUser.id);

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        مرحباً أستاذ {currentUser.name}
      </h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <Button onClick={() => setShowCreateChannelForm(!showCreateChannelForm)} className="mb-6">
        {showCreateChannelForm ? 'إلغاء إنشاء قناة' : 'إنشاء قناة جديدة'}
      </Button>

      {showCreateChannelForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">إنشاء قناة</h3>
          <form onSubmit={handleCreateChannel}>
            <Select
              id="create-university"
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
                id="create-college"
                label="الكلية"
                options={collegesOptions}
                value={selectedCollegeId}
                onChange={(e) => setSelectedCollegeId(e.target.value)}
                required
              />
            )}
            {selectedCollegeId && (
                <Select
                    id="newChannelName"
                    label="اسم القناة (التخصص)"
                    options={specializationsOptions}
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    required
                />
            )}
            <Button type="submit" fullWidth className="mt-4" disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء القناة'}
            </Button>
          </form>
        </div>
      )}

      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">قنواتي</h3>
      {loading ? (
        <LoadingSpinner />
      ) : professorChannels.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">لم تقم بإنشاء أي قنوات بعد.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professorChannels.map((channel) => (
            <div
              key={channel.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectChannel(channel)}
            >
              <h4 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">{channel.name}</h4>
              <p className="text-gray-700 dark:text-gray-300">الجامعة: {channel.university}</p>
              <p className="text-gray-700 dark:text-gray-300">الكلية: {channel.college}</p>
              <p className="text-gray-700 dark:text-gray-300">
                المشتركون: {channel.subscribers.length}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;