import { Language, UserRole, User, Channel, University, PrivateChat } from './types';

// Gemini API Key: It is HIGHLY recommended to obtain this from an environment variable (e.g., `process.env.API_KEY`)
// for security. DO NOT hardcode your API key in client-side code for production.
// For local development or static PWA builds where `process.env` might not be injected,
// replace 'YOUR_GEMINI_API_KEY_HERE' with your actual key for testing, but be aware of security implications.
export const API_KEY = process.env.API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

export const LANGUAGES = [
  { code: Language.AR, name: 'العربية' },
  { code: Language.EN, name: 'English' },
  { code: Language.FR, name: 'Français' },
];

export const MOCK_UNIVERSITIES: University[] = [
  {
    id: 'uni1',
    name: 'جامعة الجزائر 1 بن يوسف بن خدة',
    colleges: [
      { id: 'coll1_1', name: 'كلية العلوم', specializations: ['الرياضيات', 'الفيزياء', 'الكيمياء', 'الإعلام الآلي'] },
      { id: 'coll1_2', name: 'كلية الحقوق', specializations: ['القانون العام', 'القانون الخاص', 'علوم سياسية'] },
      { id: 'coll1_3', name: 'كلية الطب', specializations: ['الطب البشري', 'طب الأسنان', 'الصيدلة'] },
    ],
  },
  {
    id: 'uni2',
    name: 'جامعة وهران 1 أحمد بن بلة',
    colleges: [
      { id: 'coll2_1', name: 'كلية العلوم الدقيقة والتطبيقية', specializations: ['الفيزياء التطبيقية', 'الكيمياء الصناعية', 'الجيولوجيا'] },
      { id: 'coll2_2', name: 'كلية الآداب والفنون', specializations: ['اللغة العربية وآدابها', 'اللغة الإنجليزية', 'تاريخ وفنون'] },
      { id: 'coll2_3', name: 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير', specializations: ['علوم مالية ومحاسبة', 'إدارة الأعمال', 'تسويق'] },
    ],
  },
  {
    id: 'uni3',
    name: 'جامعة العلوم والتكنولوجيا هواري بومدين (USTHB)',
    colleges: [
      { id: 'coll3_1', name: 'كلية الرياضيات', specializations: ['رياضيات', 'إحصاء', 'بحث عملي'] },
      { id: 'coll3_2', name: 'كلية الإعلام الآلي', specializations: ['هندسة برمجيات', 'ذكاء اصطناعي', 'شبكات واتصالات'] },
      { id: 'coll3_3', name: 'كلية الهندسة المدنية', specializations: ['هندسة مدنية', 'هندسة مائية', 'هندسة معمارية'] },
      { id: 'coll3_4', name: 'كلية الإلكترونيك و الكهروميكانيك', specializations: ['إلكترونيك', 'كهرباء', 'ميكانيك'] },
    ],
  },
  {
    id: 'uni4',
    name: 'جامعة قسنطينة 1 الإخوة منتوري',
    colleges: [
      { id: 'coll4_1', name: 'كلية الطب', specializations: ['الطب البشري', 'طب الأسنان', 'الصيدلة'] },
      { id: 'coll4_2', name: 'كلية العلوم والتكنولوجيا', specializations: ['هندسة كهربائية', 'هندسة ميكانيكية', 'هندسة كيميائية'] },
      { id: 'coll4_3', name: 'كلية الحقوق والعلوم السياسية', specializations: ['القانون الخاص', 'القانون العام', 'علوم سياسية'] },
    ],
  },
  {
    id: 'uni5',
    name: 'جامعة باجي مختار عنابة',
    colleges: [
      { id: 'coll5_1', name: 'كلية التكنولوجيا', specializations: ['هندسة صناعية', 'هندسة الطرائق', 'هندسة كهربائية'] },
      { id: 'coll5_2', name: 'كلية العلوم الاقتصادية والتجارية وعلوم التسيير', specializations: ['اقتصاد كمي', 'إدارة أعمال دولية', 'مالية وبنوك'] },
      { id: 'coll5_3', name: 'كلية الطب', specializations: ['طب', 'صيدلة', 'جراحة أسنان'] },
    ],
  },
  {
    id: 'uni6',
    name: 'جامعة ابن خلدون تيارت',
    colleges: [
      { id: 'coll6_1', name: 'كلية العلوم الإنسانية والاجتماعية', specializations: ['علم النفس', 'علم الاجتماع', 'تاريخ'] },
      { id: 'coll6_2', name: 'كلية العلوم الدقيقة والإعلام الآلي', specializations: ['رياضيات وإعلام آلي', 'فيزياء', 'كيمياء'] },
      { id: 'coll6_3', name: 'كلية الآداب واللغات والفنون', specializations: ['لغة عربية', 'لغة فرنسية', 'لغة إنجليزية'] },
    ],
  },
  {
    id: 'uni7', // New university ID
    name: 'جامعة ابن خلدون ملحقة قصر الشلالة', // New university name
    colleges: [
      { id: 'coll7_1', name: 'كلية العلوم', specializations: ['الرياضيات التطبيقية', 'فيزياء المواد', 'علوم الحياة'] },
      { id: 'coll7_2', name: 'كلية العلوم الاقتصادية و علوم التسيير', specializations: ['محاسبة ومالية', 'إدارة أعمال', 'اقتصاد دولي', 'تسويق'] },
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
    university: 'جامعة الجزائر 1 بن يوسف بن خدة',
    college: 'كلية العلوم',
    stars: 10,
    deviceToken: undefined,
  },
  {
    id: 'prof2',
    email: 'prof2@example.com',
    name: 'فاطمة الزهراء',
    profilePic: 'https://picsum.photos/100/100?random=2',
    role: UserRole.Professor,
    university: 'جامعة وهران 1 أحمد بن بلة',
    college: 'كلية الطب',
    stars: 15,
    deviceToken: undefined,
  },
  {
    id: 'prof3',
    email: 'prof3@example.com',
    name: 'خالد بن طاهر',
    profilePic: 'https://picsum.photos/100/100?random=10',
    role: UserRole.Professor,
    university: 'جامعة العلوم والتكنولوجيا هواري بومدين (USTHB)',
    college: 'كلية الإعلام الآلي',
    stars: 20,
    deviceToken: undefined,
  },
];

export const MOCK_STUDENTS: User[] = [
  {
    id: 'stud1',
    email: 'stud1@example.com',
    name: 'سارة خالد',
    profilePic: 'https://picsum.photos/100/100?random=3',
    role: UserRole.Student,
    university: 'جامعة الجزائر 1 بن يوسف بن خدة',
    college: 'كلية العلوم',
    balance: 500, // Initial balance
    deviceToken: undefined,
  },
  {
    id: 'stud2',
    email: 'stud2@example.com',
    name: 'محمد أمين',
    profilePic: 'https://picsum.photos/100/100?random=4',
    role: UserRole.Student,
    university: 'جامعة وهران 1 أحمد بن بلة',
    college: 'كلية الطب',
    balance: 750, // Initial balance
    deviceToken: undefined,
  },
  {
    id: 'stud3',
    email: 'stud3@example.com',
    name: 'ليلى مراد',
    profilePic: 'https://picsum.photos/100/100?random=11',
    role: UserRole.Student,
    university: 'جامعة العلوم والتكنولوجيا هواري بومدين (USTHB)',
    college: 'كلية الإعلام الآلي',
    balance: 1000, // Initial balance
    deviceToken: undefined,
  },
];

// Demo accounts for quick testing
export const MOCK_DEMO_STUDENT: User = {
  id: 'demo_stud',
  email: 'demo.student@way.dz',
  name: 'حمر العين ربيع',
  profilePic: 'https://picsum.photos/100/100?random=99',
  role: UserRole.Student,
  university: 'جامعة ابن خلدون ملحقة قصر الشلالة', // Updated university
  college: 'كلية العلوم الاقتصادية و علوم التسيير', // Updated college
  balance: 2000, // Initial balance for demo student
  deviceToken: undefined,
};

export const MOCK_DEMO_PROFESSOR: User = {
  id: 'demo_prof',
  email: 'demo.professor@way.dz',
  name: 'بن الطاهر بختة',
  profilePic: 'https://picsum.photos/100/100?random=98',
  role: UserRole.Professor,
  university: 'جامعة ابن خلدون ملحقة قصر الشلالة', // Updated university
  college: 'كلية العلوم الاقتصادية و علوم التسيير', // Updated college
  stars: 20,
  deviceToken: undefined,
};


export const MOCK_CHANNELS: Channel[] = [
  {
    id: 'chan1',
    name: 'الرياضيات',
    professorId: 'prof1',
    professorName: 'أحمد علي',
    university: 'جامعة الجزائر 1 بن يوسف بن خدة',
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
    university: 'جامعة الجزائر 1 بن يوسف بن خدة',
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
    name: 'الطب البشري',
    professorId: 'prof2',
    professorName: 'فاطمة الزهراء',
    university: 'جامعة وهران 1 أحمد بن بلة',
    college: 'كلية الطب',
    content: [
      { id: 'cont5', type: 'image', url: 'https://picsum.photos/800/600?random=7' },
    ],
    chatMessages: [],
    googleMeetLink: 'https://meet.google.com/jkl-mno-pqr',
    subscribers: ['stud2', 'demo_stud'], // Add demo student
  },
  {
    id: 'chan4',
    name: 'هندسة برمجيات',
    professorId: 'prof3',
    professorName: 'خالد بن طاهر',
    university: 'جامعة العلوم والتكنولوجيا هواري بومدين (USTHB)',
    college: 'كلية الإعلام الآلي',
    content: [
      { id: 'cont6', type: 'pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileName: 'أساسيات هندسة البرمجيات.pdf' },
      { id: 'cont7', type: 'video', url: 'https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4', thumbnail: 'https://picsum.photos/300/200?random=12' },
    ],
    chatMessages: [
      { id: 'msg4', senderId: 'prof3', senderName: 'خالد بن طاهر', text: 'أهلاً بطلاب هندسة البرمجيات.', timestamp: new Date(Date.now() - 1200000) },
    ],
    googleMeetLink: 'https://meet.google.com/stu-vwx-yza',
    subscribers: ['stud3'],
  },
  {
    id: 'chan5',
    name: 'إدارة أعمال', // Specialization name from the new college
    professorId: 'demo_prof', // Demo professor teaching
    professorName: 'بن الطاهر بختة',
    university: 'جامعة ابن خلدون ملحقة قصر الشلالة', // Updated university
    college: 'كلية العلوم الاقتصادية و علوم التسيير', // Updated college
    content: [],
    chatMessages: [],
    googleMeetLink: 'https://meet.google.com/mnb-vfr-cde',
    subscribers: [],
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
      { id: 'dpmsg1', senderId: 'demo_prof', senderName: 'بن الطاهر بختة', text: 'مرحباً بالطالب التجريبي!', timestamp: new Date(Date.now() - 200000) },
      { id: 'dpmsg2', senderId: 'demo_stud', senderName: 'حمر العين ربيع', text: 'مرحباً أستاذ تجريبي.', timestamp: new Date(Date.now() - 100000) },
    ],
  },
];

export const SUBSCRIPTION_PRICE = 100; // DZD