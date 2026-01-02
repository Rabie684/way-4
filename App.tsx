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
import WelcomeScreen from './components/WelcomeScreen';
// FIX: Import JarvisAssistant as a default export
import JarvisAssistant from './components/JarvisAssistant';
import { MOCK_CHANNELS, MOCK_PRIVATE_CHATS, MOCK_DEMO_STUDENT, MOCK_DEMO_PROFESSOR } from './constants';
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner for the splash screen

type AppView = 'dashboard' | 'channelDetail' | 'profileSettings' | 'privateChats' | 'jarvisAssistant'; // Add new view type

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true); // New state for initial app load (splash screen)
  const [channels, setChannels] = useState<Channel[]>(MOCK_CHANNELS);
  const [privateChats, setPrivateChats] = useState<PrivateChat[]>(MOCK_PRIVATE_CHATS); // All private chats for the user
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [profileSettings, setProfileSettings] = useState<ProfileSettings>(() => {
    const savedSettings = localStorage.getItem('profileSettings');
    return savedSettings ? JSON.parse(savedSettings) : { isDarkMode: false, language: Language.AR };
  });

  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false); // Changed to false, managed after isAppLoading
  const [authScreenMode, setAuthScreenMode] = useState<'login' | 'register'>('login'); // To control AuthScreen's initial mode
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null); // State to store PWA install prompt

  useEffect(() => {
    // Apply dark mode and language settings immediately on render
    if (profileSettings.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.lang = profileSettings.language;

    // Simulate initial app loading delay with a splash screen
    const splashTimer = setTimeout(() => {
      setIsAppLoading(false); // End splash screen phase

      // Attempt to load current user after splash screen
      const storedUser = authService.getCurrentUser();
      if (storedUser) {
        setCurrentUser(storedUser);
        setShowWelcomeScreen(false); // If user is logged in, hide welcome screen
      } else {
        setShowWelcomeScreen(true); // If no user, show welcome screen
      }
    }, 1500); // Show splash for 1.5 seconds

    return () => clearTimeout(splashTimer); // Cleanup timeout
  }, [profileSettings]); // Re-run effect if profileSettings changes (for theme/lang updates)

  useEffect(() => {
    // Listen for the beforeinstallprompt event for PWA installation
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
    setShowWelcomeScreen(false); // Ensure welcome screen is hidden after login
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setCurrentUser(null);
    setSelectedChannel(null);
    setCurrentView('dashboard');
    setShowWelcomeScreen(true); // Show welcome screen after logout
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

  const handleNavigateToJarvis = useCallback(() => { // New handler for Jarvis navigation
    setCurrentView('jarvisAssistant');
  }, []);

  const handleDemoLogin = useCallback(async (role: UserRole) => {
    let demoUser: User | null = null;
    if (role === UserRole.Student) {
      demoUser = MOCK_DEMO_STUDENT;
    } else if (role === UserRole.Professor) {
      demoUser = MOCK_DEMO_PROFESSOR;
    }

    if (demoUser) {
      const loggedInUser = await authService.login(demoUser.email, role);
      if (loggedInUser) {
        handleLoginSuccess(loggedInUser);
      } else {
        // Fallback if demo user not found in authService (e.g., if MOCK_DEMO_STUDENT wasn't in the internal array)
        // In this mock setup, it should always succeed if constants are correct.
        console.error("Failed to login demo user.");
      }
    }
  }, [handleLoginSuccess]);

  const handleInstallPWA = useCallback(async () => {
    if (deferredPrompt) {
      // Show the install prompt
      (deferredPrompt as any).prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await (deferredPrompt as any).userChoice;
      // Optionally, send analytics event with outcome of user choice
      console.log(`User response to the install prompt: ${outcome}`);
      // We've used the prompt, and it can't be used again. Clear it.
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  // Render a simple splash screen during initial app loading
  if (isAppLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-700 dark:bg-green-900 text-white">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">جامعتك الرقمية Way</h1>
        <LoadingSpinner />
      </div>
    );
  }

  // Then Welcome Screen if active and no current user
  if (showWelcomeScreen && !currentUser) {
    return (
      <div className={`flex flex-col min-h-screen ${profileSettings.isDarkMode ? 'dark' : ''}`}>
        <WelcomeScreen
          onShowLogin={() => { setShowWelcomeScreen(false); setAuthScreenMode('login'); }}
          onShowRegister={() => { setShowWelcomeScreen(false); setAuthScreenMode('register'); }}
          onDemoLogin={handleDemoLogin} // Pass demo login handler
          deferredPrompt={deferredPrompt} // Pass deferredPrompt
          onInstallPWA={handleInstallPWA} // Pass install handler
        />
      </div>
    );
  }

  // Then Auth Screen if no current user (after welcome screen, or if welcome screen was skipped)
  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        initialIsRegister={authScreenMode === 'register'}
      />
    );
  }

  // Otherwise, render the main application content
  return (
    <div className={`flex flex-col min-h-screen ${profileSettings.isDarkMode ? 'dark' : ''}`}>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onShowProfileSettings={handleShowProfileSettings}
        onNavigateToDashboard={handleBackToDashboard}
        onNavigateToPrivateChats={handleNavigateToPrivateChats}
        onNavigateToJarvis={handleNavigateToJarvis} // Pass Jarvis navigation handler
        deferredPrompt={deferredPrompt} // Pass deferredPrompt to Navbar
        onInstallPWA={handleInstallPWA} // Pass onInstallPWA to Navbar
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
            setCurrentUser={setCurrentUser} // Pass setCurrentUser to StudentDashboard
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
        {currentView === 'jarvisAssistant' && ( // Render JarvisAssistant component
          <JarvisAssistant
            currentUser={currentUser}
            currentSettings={profileSettings}
            onBack={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
};

export default App;