import React from 'react';
import { User, UserRole } from '../types';
import Button from './Button';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  onShowProfileSettings: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToPrivateChats: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogout,
  onShowProfileSettings,
  onNavigateToDashboard,
  onNavigateToPrivateChats,
}) => {
  return (
    <nav className="bg-green-700 dark:bg-green-900 p-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1
            className="text-white text-2xl font-bold cursor-pointer"
            onClick={onNavigateToDashboard}
          >
            جامعتك الرقمية way
          </h1>
          {currentUser && (
            <>
              <Button variant="ghost" className="text-white" onClick={onNavigateToDashboard}>
                الرئيسية
              </Button>
              <Button variant="ghost" className="text-white" onClick={onNavigateToPrivateChats}>
                الدردشات الخاصة
              </Button>
            </>
          )}
        </div>

        {currentUser ? (
          <div className="flex items-center space-x-4">
            <img
              src={currentUser.profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-white"
              onClick={onShowProfileSettings}
            />
            <span className="text-white font-medium hidden sm:block">
              {currentUser.name} ({currentUser.role === UserRole.Professor ? 'أستاذ' : 'طالب'})
            </span>
            {currentUser.role === UserRole.Professor && currentUser.stars !== undefined && (
                <span className="text-yellow-400 text-lg">⭐ {currentUser.stars}</span>
            )}
            <Button onClick={onLogout} variant="secondary" size="sm">
              تسجيل الخروج
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <span className="text-white">لم يتم تسجيل الدخول</span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;