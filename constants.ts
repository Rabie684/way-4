import { Language, UserRole, User, Channel, University, PrivateChat } from './types';

export const API_KEY = process.env.API_KEY || 'YOUR_GEMINI_API_KEY_HERE'; // Gemini API Key

export const LANGUAGES = [
  { code: Language.AR, name: 'العربية' },
  { code: Language.EN, name: 'English' },
  { code: Language.FR, name: 'Français' },
];

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: 'uni1',
    name: 'جامعة الجزائر 1',
    colleges: [
      { id: 'coll1', name: 'كلية العلوم', specializations: ['الرياضيات', 'الفيزياء', 'الكيمياء'] },
      { id: 'coll2', name: 'كلية الحقوق', specializations: ['القانون العام', 'القانون الخاص'] },
    ],
  },
  {
    id: 'uni2',
    name: 'جامعة وهران 2',
    colleges: [
      { id: 'coll3', name: 'كلية الطب', specializations: ['الطب العام', 'جراحة الأسنان'] },
      { id: 'coll4', name: 'كلية التكنولوجيا', specializations: ['علوم الحاسوب', 'الهندسة الكهربائية'] },
    ],
  },
];

export const MOCK_PROFESSORS: User[] = [
  {
    id: 'prof1',
    email: 'prof1@example.com',
    name: 'أحمد علي',
    profilePic: 'https://picsum.photos/100/100?random=1',
    role: UserRole.Professor,
    university: 'جامعة الجزائر 1',
    college: 'كلية العلوم',
    stars: 10,
  },
  {
    id: 'prof2',
    email: 'prof2@example.com',
    name: 'فاطمة الزهراء',
    profilePic: 'https://picsum.photos/100/100?random=2',
    role: UserRole.Professor,
    university: 'جامعة وهران 2',
    college: 'كلية الطب',
    stars: 15,
  },
];

export const MOCK_STUDENTS: User[] = [
  {
    id: 'stud1',
    email: 'stud1@example.com',
    name: 'سارة خالد',
    profilePic: 'https://picsum.photos/100/100?random=3',
    role: UserRole.Student,
    university: 'جامعة الجزائر 1',
    college: 'كلية العلوم',
  },
  {
    id: 'stud2',
    email: 'stud2@example.com',
    name: 'محمد أمين',
    profilePic: 'https://picsum.photos/100/100?random=4',
    role: UserRole.Student,
    university: 'جامعة وهران 2',
    college: 'كلية الطب',
  },
];

// Demo accounts for quick testing
export const MOCK_DEMO_STUDENT: User = {
  id: 'demo_stud',
  email: 'demo.student@way.dz',
  name: 'طالب تجريبي',
  profilePic: 'https://picsum.photos/100/100?random=99',
  role: UserRole.Student,
  university: 'جامعة الجزائر 1',
  college: 'كلية العلوم',
};

export const MOCK_DEMO_PROFESSOR: User = {
  id: 'demo_prof',
  email: 'demo.professor@way.dz',
  name: 'أستاذ تجريبي',
  profilePic: 'https://picsum.photos/100/100?random=98',
  role: UserRole.Professor,
  university: 'جامعة وهران 2',
  college: 'كلية الطب',
  stars: 20,
};


export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'chan1',
    name: 'الرياضيات',
    professorId: 'prof1',
    professorName: 'أحمد علي',
    university: 'جامعة الجزائر 1',
    college: 'كلية العلوم',
    content: [
      { id: 'cont1', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'مقدمة في الجبر.pdf' },
      { id: 'cont2', type: 'image', url: 'https://picsum.photos/800/600?random=5' },
      { id: 'cont3', type: 'video', url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', thumbnail: 'https://picsum.photos/300/200?random=6' },
    ],
    chatMessages: [
      { id: 'msg1', senderId: 'prof1', senderName: 'أحمد علي', text: 'أهلاً بكم في قناة الرياضيات!', timestamp: new Date(Date.now() - 3600000) },
      { id: 'msg2', senderId: 'stud1', senderName: 'سارة خالد', text: 'شكراً أستاذ.', timestamp: new Date(Date.now() - 1800000) },
    ],
    googleMeetLink: 'https://meet.google.com/xxx-yyyy-zzz',
    subscribers: ['stud1', 'demo_stud'], // Add demo student
  },
  {
    id: 'chan2',
    name: 'الفيزياء',
    professorId: 'prof1',
    professorName: 'أحمد علي',
    university: 'جامعة الجزائر 1',
    college: 'كلية العلوم',
    content: [
      { id: 'cont4', type: 'pdf', url: 'https://www.africau.edu/images/default/sample.pdf', fileName: 'ميكانيكا الكم.pdf' },
    ],
    chatMessages: [
      { id: 'msg3', senderId: 'prof1', senderName: 'أحمد علي', text: 'مرحباً بطلاب الفيزياء.', timestamp: new Date(Date.now() - 7200000) },
    ],
    googleMeetLink: 'https://meet.google.com/abc-def-ghi',
    subscribers: [],
  },
  {
    id: 'chan3',
    name: 'الطب العام',
    professorId: 'prof2',
    professorName: 'فاطمة الزهراء',
    university: 'جامعة وهران 2',
    college: 'كلية الطب',
    content: [
      { id: 'cont5', type: 'image', url: 'https://picsum.photos/800/600?random=7' },
    ],
    chatMessages: [],
    googleMeetLink: 'https://meet.google.com/jkl-mno-pqr',
    subscribers: ['stud2', 'demo_stud'], // Add demo student
  },
];

export const MOCK_PRIVATE_CHATS: PrivateChat[] = [
  {
    id: 'pc1',
    participants: ['prof1', 'stud1'],
    messages: [
      { id: 'pmsg1', senderId: 'prof1', senderName: 'أحمد علي', text: 'كيف حالك يا سارة؟', timestamp: new Date(Date.now() - 1000000) },
      { id: 'pmsg2', senderId: 'stud1', senderName: 'سارة خالد', text: 'بخير، شكراً أستاذ.', timestamp: new Date(Date.now() - 500000) },
    ],
  },
  // Add a demo private chat for testing
  {
    id: 'pc_demo_prof_stud',
    participants: ['demo_prof', 'demo_stud'],
    messages: [
      { id: 'dpmsg1', senderId: 'demo_prof', senderName: 'أستاذ تجريبي', text: 'مرحباً بالطالب التجريبي!', timestamp: new Date(Date.now() - 200000) },
      { id: 'dpmsg2', senderId: 'demo_stud', senderName: 'طالب تجريبي', text: 'مرحباً أستاذ تجريبي.', timestamp: new Date(Date.now() - 100000) },
    ],
  },
];

export const SUBSCRIPTION_PRICE = 100; // DZD