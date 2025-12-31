import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Channel, ProfileSettings, Language, PrivateChat } from './types';
import { authService } from './services/authService';
import AuthScreen from './components/AuthScreen';
import Navbar from './components/Navbar';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentDashboard from './components/StudentDashboard';
import ChannelDetail from './components/ChannelDetail';
import ProfileSettingsComponent from './components/ProfileSettings';
import PrivateChatView from './components/PrivateChatView';
import { MOCK_CHANNELS, MOCK_PRIVATE_CHATS } from './constants';

type AppView = 'dashboard' | 'channelDetail' | 'profileSettings' | 'privateChats';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>(MOCK_PRIVATE_CHATS); // All private chats for the user
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => {
    const savedSettings = localStorage.getItem('profileSettings');
    return savedSettings ? JSON.parse(savedSettings) : { isDarkMode: false, language: Language.AR };
  });

  useEffect(() => {
    // Attempt to load current user from local storage on app start
    const storedUser = authService.getCurrentUser();
    if (storedUser) {
      setCurrentUser(storedUser);
    }

    // Apply dark mode class to body
    if (profileSettings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Set document language attribute
    document.documentElement.lang = profileSettings.language;
  }, [profileSettings]);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setSelectedChannel(null);
    setCurrentView('dashboard');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
  }, []);

  const handleUpdateSettings = useCallback((settings: ProfileSettings) => {
    setProfileSettings(settings);
    localStorage.setItem('profileSettings', JSON.stringify(settings));
  }, []);

  const handleSelectChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setCurrentView('channelDetail');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedChannel(null);
    setCurrentView('dashboard');
  }, []);

  const handleShowProfileSettings = useCallback(() => {
    setCurrentView('profileSettings');
  }, []);

  const handleCloseProfileSettings = useCallback(() => {
    setCurrentView('dashboard');
  }, []);

  const handleNavigateToPrivateChats = useCallback(() => {
    setCurrentView('privateChats');
  }, []);

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`flex flex-col min-h-screen ${profileSettings.isDarkMode ? 'dark' : ''}`}>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowProfileSettings={handleShowProfileSettings}
        onNavigateToDashboard={handleBackToDashboard}
        onNavigateToPrivateChats={handleNavigateToPrivateChats}
      />
      <main className="flex-1 flex overflow-hidden">
        {currentView === 'dashboard' && currentUser.role === UserRole.Professor && (
          <ProfessorDashboard
            currentUser={currentUser}
            onSelectChannel={handleSelectChannel}
            channels={channels}
            setChannels={setChannels}
          />
        )}
        {currentView === 'dashboard' && currentUser.role === UserRole.Student && (
          <StudentDashboard
            currentUser={currentUser}
            onSelectChannel={handleSelectChannel}
            channels={channels}
            setChannels={setChannels}
            setCurrentUser={setCurrentUser}
          />
        )}
        {currentView === 'channelDetail' && selectedChannel && (
          <ChannelDetail
            channel={selectedChannel}
            currentUser={currentUser}
            onBack={handleBackToDashboard}
            setChannels={setChannels}
            currentSettings={profileSettings} // Pass profileSettings as currentSettings
          />
        )}
        {currentView === 'profileSettings' && (
          <ProfileSettingsComponent
            currentUser={currentUser}
            currentSettings={profileSettings}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onClose={handleCloseProfileSettings}
          />
        )}
        {currentView === 'privateChats' && (
            <PrivateChatView
                currentUser={currentUser}
                onBack={handleBackToDashboard}
                privateChats={privateChats}
                setPrivateChats={setPrivateChats}
            />
        )}
      </main>
    </div>
  );
};

export default App;