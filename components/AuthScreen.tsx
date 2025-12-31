import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import Input from './Input';
import Button from './Button';
import Select from './Select';
import { MOCK_UNIVERSITIES } from '../constants';

interface AuthScreenProps {
  onLoginSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Student);
  const [selectedUniversityId, setSelectedUniversityId] = useState('');
  const [selectedCollegeId, setSelectedCollegeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const universitiesOptions = MOCK_UNIVERSITIES.map(uni => ({ value: uni.id, label: uni.name }));
  const selectedUniversity = MOCK_UNIVERSITIES.find(uni => uni.id === selectedUniversityId);
  const collegesOptions = selectedUniversity
    ? selectedUniversity.colleges.map(coll => ({ value: coll.id, label: coll.name }))
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User | null = null;
      if (isRegister) {
        const universityName = MOCK_UNIVERSITIES.find(u => u.id === selectedUniversityId)?.name;
        const collegeName = selectedUniversity?.colleges.find(c => c.id === selectedCollegeId)?.name;

        if (!universityName || !collegeName) {
            setError('الرجاء اختيار الجامعة والكلية.');
            setLoading(false);
            return;
        }

        user = await authService.register(email, name, role, universityName, collegeName);
        if (!user) {
            setError('فشل التسجيل. ربما البريد الإلكتروني مستخدم بالفعل.');
        }
      } else {
        user = await authService.login(email, role);
        if (!user) {
            setError('فشل تسجيل الدخول. تأكد من البريد الإلكتروني والدور.');
        }
      }

      if (user) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-6">
          {isRegister ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </h2>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="ادخل بريدك الإلكتروني"
          />

          {isRegister && (
            <Input
              id="name"
              label="الاسم"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="ادخل اسمك"
            />
          )}

          <Select
            id="role"
            label="الدور"
            options={[
              { value: UserRole.Student, label: 'طالب' },
              { value: UserRole.Professor, label: 'أستاذ' },
            ]}
            value={role}
            onChange={(e) => {
              setRole(e.target.value as UserRole);
              setSelectedUniversityId('');
              setSelectedCollegeId('');
            }}
            required
          />

          {isRegister && (
            <>
              <Select
                id="university"
                label="الجامعة"
                options={[{ value: '', label: 'اختر جامعة...' }, ...universitiesOptions]}
                value={selectedUniversityId}
                onChange={(e) => {
                  setSelectedUniversityId(e.target.value);
                  setSelectedCollegeId(''); // Reset college when university changes
                }}
                required
              />

              {selectedUniversityId && (
                <Select
                  id="college"
                  label="الكلية"
                  options={[{ value: '', label: 'اختر كلية...' }, ...collegesOptions]}
                  value={selectedCollegeId}
                  onChange={(e) => setSelectedCollegeId(e.target.value)}
                  required
                />
              )}
            </>
          )}

          <Button type="submit" fullWidth className="mt-6" disabled={loading}>
            {loading ? 'جاري التحميل...' : (isRegister ? 'تسجيل' : 'دخول')}
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
          {isRegister ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
          <Button
            variant="ghost"
            onClick={() => setIsRegister(!isRegister)}
            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
          >
            {isRegister ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </Button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;