import React, { useState } from 'react';
import { Language, User, ProfileSettings } from '../types';
import { geminiService } from '../services/geminiService';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import LoadingSpinner from './LoadingSpinner';
import { LANGUAGES } from '../constants';

interface JarvisAssistantProps {
  currentUser: User;
  currentSettings: ProfileSettings;
  onBack: () => void;
}

const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ currentUser, currentSettings, onBack }) => {
  const [summaryText, setSummaryText] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [targetLanguage, setTargetLanguage] = useState<Language>(Language.EN); // Default to English

  const languageOptions = LANGUAGES.map(lang => ({ value: lang.code, label: lang.name }));

  const handleTranslateSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (summaryText.trim() === '') {
      setTranslationError('الرجاء إدخال الملخص للترجمة.');
      return;
    }

    setTranslationLoading(true);
    setTranslationError('');
    setTranslatedSummary('');
    try {
      const result = await geminiService.translateSummary(summaryText, targetLanguage);
      setTranslatedSummary(result);
    } catch (err) {
      setTranslationError('فشل الترجمة بواسطة جارفس.');
      console.error(err);
    } finally {
      setTranslationLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900">
      <div className="p-4 md:p-6 bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-2 sm:mb-0">
          <Button onClick={onBack} variant="secondary" size="sm" className="ml-2">
            {'<'} عودة
          </Button>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mr-4 flex items-center">
            <span className="text-green-500 text-2xl mr-2">🤖</span> مساعد جارفس
          </h2>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center">
            <span className="text-green-500 text-2xl mr-2">🤖</span> ترجمة وملخصات من المجلات العلمية الجزائرية
          </h3>
          <form onSubmit={handleTranslateSummary}>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:text-gray-100 mb-4 h-40 resize-y custom-scrollbar"
              placeholder="أدخل الملخص العلمي هنا ليترجمه جارفس..."
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
            ></textarea>
            <Select
                id="targetLanguage"
                label="اللغة المستهدفة للترجمة"
                options={languageOptions.filter(opt => opt.value !== currentSettings.language)} // Don't allow translating to current UI language
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as Language)}
                className="mb-4"
            />
            <Button type="submit" fullWidth disabled={translationLoading}>
              {translationLoading ? 'جارفس يترجم...' : 'اطلب من جارفس الترجمة'}
            </Button>
          </form>
          {translationError && <p className="text-red-500 mt-4">{translationError}</p>}
          {translationLoading && <LoadingSpinner />}
          {translatedSummary && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">ترجمة جارفس:</h4>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{translatedSummary}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JarvisAssistant;