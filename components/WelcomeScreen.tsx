import React from 'react';
import Button from './Button';
import { UserRole } from '../types';

interface WelcomeScreenProps {
  onShowLogin: () => void;
  onShowRegister: () => void;
  onDemoLogin: (role: UserRole) => void; // New prop for demo login
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onShowLogin, onShowRegister, onDemoLogin }) => {
  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center p-4 overflow-hidden"
      style={{
        // Using a more generic university image, but styling to give it an Algerian feel
        backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e087561ccf7a?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
      }}
    >
      {/* Subtle green overlay for Algerian theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900 to-green-700 opacity-75"></div>
      
      <div className="relative z-10 text-center text-white p-8 bg-black bg-opacity-60 rounded-lg shadow-2xl max-w-2xl transform transition-all duration-500 scale-95 hover:scale-100">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 animate-fade-in-up">
          جامعتك الرقمية Way
        </h1>
        <p className="text-xl md:text-2xl mb-8 animate-fade-in-up delay-100">
          مستقبل التعليم الجزائري بين يديك
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse animate-fade-in-up delay-200">
          <Button onClick={onShowLogin} variant="primary" size="lg">
            تسجيل الدخول
          </Button>
          <Button onClick={onShowRegister} variant="secondary" size="lg">
            إنشاء حساب
          </Button>
        </div>
        <div className="mt-8 pt-4 border-t border-green-400 border-opacity-30">
          <p className="text-lg mb-4 text-green-100 animate-fade-in-up delay-300">أو جرب التطبيق الآن:</p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 sm:space-x-reverse animate-fade-in-up delay-400">
            <Button onClick={() => onDemoLogin(UserRole.Student)} variant="ghost" size="md" className="text-green-300 hover:text-white border border-green-300 hover:border-green-100">
              دخول كطالب تجريبي
            </Button>
            <Button onClick={() => onDemoLogin(UserRole.Professor)} variant="ghost" size="md" className="text-green-300 hover:text-white border border-green-300 hover:border-green-100">
              دخول كأستاذ تجريبي
            </Button>
          </div>
        </div>
      </div>
      {/* FIX: Removed 'jsx' prop and ensure it's standard CSS within a <style> tag */}
      <style>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(20px); }
          50% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in-up.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in-up.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in-up.delay-300 { animation-delay: 0.3s; }
        .animate-fade-in-up.delay-400 { animation-delay: 0.4s; }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default WelcomeScreen;