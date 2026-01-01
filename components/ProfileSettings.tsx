import React, { useState } from 'react';
import { Language, User, ProfileSettings } from '../types';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import { LANGUAGES } from '../constants';
import { authService } from '../services/authService';
import LoadingSpinner from './LoadingSpinner';

interface ProfileSettingsProps {
  currentUser: User;
  currentSettings: ProfileSettings;
  onUpdateUser: (updatedUser: User) => void;
  onUpdateSettings: (settings: ProfileSettings) => void;
  onClose: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  currentUser,
  currentSettings,
  onUpdateUser,
  onUpdateSettings,
  onClose,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [profilePic, setProfilePic] = useState(currentUser.profilePic);
  const [selectedLanguage, setSelectedLanguage] = useState(currentSettings.language);
  const [isDarkMode, setIsDarkMode] = useState(currentSettings.isDarkMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const updatedUser: User = { ...currentUser, name, profilePic };
      const result = await authService.updateUser(updatedUser);
      onUpdateUser(result);
      setMessage('تم تحديث الملف الشخصي بنجاح!');
    } catch (err) {
      setError('فشل تحديث الملف الشخصي.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = () => {
    onUpdateSettings({ language: selectedLanguage, isDarkMode });
    setMessage('تم تحديث الإعدادات بنجاح!');
  };

  const languageOptions = LANGUAGES.map(lang => ({ value: lang.code, label: lang.name }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 md:p-8 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">إعدادات الملف الشخصي</h2>

        {loading && <LoadingSpinner />}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        {/* Profile Update Section */}
        <form onSubmit={handleUpdateProfile} className="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">تعديل الملف الشخصي</h3>
          <div className="flex flex-col items-center mb-6">
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-green-500 mb-4"
            />
            <Input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-auto"
            />
          </div>
          <Input
            id="name"
            label="الاسم"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mb-4"
          />
          <Button type="submit" fullWidth disabled={loading}>
            حفظ التغييرات
          </Button>
        </form>

        {/* Settings Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">الإعدادات العامة</h3>
          <Select
            id="language"
            label="اللغة"
            options={languageOptions}
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value as Language)}
            className="mb-4"
          />
          <div className="flex items-center justify-between mb-4">
            <label htmlFor="darkMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              الوضع الليلي
            </label>
            <input
              type="checkbox"
              id="darkMode"
              checked={isDarkMode}
              onChange={() => setIsDarkMode(!isDarkMode)}
              className="h-5 w-5 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
          </div>
          <Button onClick={handleUpdateSettings} fullWidth disabled={loading}>
            حفظ الإعدادات
          </Button>
        </div>

        <Button onClick={onClose} variant="secondary" fullWidth className="mt-8">
          إغلاق
        </Button>
      </div>
    </div>
  );
};

export default ProfileSettings;