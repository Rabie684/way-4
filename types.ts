export enum UserRole {
  Professor = 'professor',
  Student = 'student',
}

export enum Language {
  AR = 'ar',
  EN = 'en',
  FR = 'fr',
}

export interface User {
  id: string;
  email: string;
  name: string;
  profilePic: string;
  role: UserRole;
  university?: string;
  college?: string;
  stars?: number; // Only for Professor
  balance?: number; // New: For student wallet
  deviceToken?: string; // New: For Firebase Cloud Messaging (FCM) device token
}

export interface ChannelContent {
  id: string;
  type: 'pdf' | 'image' | 'video';
  url: string;
  fileName?: string; // For PDFs
  thumbnail?: string; // For videos
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
}

export interface Channel {
  id: string;
  name: string; // Specialization name
  professorId: string;
  professorName: string;
  university: string;
  college: string;
  content: ChannelContent[];
  chatMessages: Message[];
  googleMeetLink: string;
  subscribers: string[]; // User IDs of students who subscribed
}

export interface PrivateChat {
  id: string;
  participants: [string, string]; // [user1Id, user2Id]
  messages: Message[];
}

export interface University {
  id: string;
  name: string;
  colleges: College[];
}

export interface College {
  id: string;
  name: string;
  specializations: string[]; // Specialization names which can become channel names
}

export interface ProfileSettings {
  isDarkMode: boolean;
  language: Language;
}