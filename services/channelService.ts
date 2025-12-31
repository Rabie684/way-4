import { Channel, ChannelContent, Message, PrivateChat, User, UserRole } from '../types';
import { MOCK_CHANNELS, MOCK_PRIVATE_CHATS, MOCK_PROFESSORS } from '../constants';
import { authService } from './authService';

// This is a mock service. In a real application, this would interact with a backend.
export const channelService = {
  getChannels: async (university?: string, college?: string): Promise<Channel[]> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API call
    let filteredChannels = MOCK_CHANNELS;
    if (university) {
      filteredChannels = filteredChannels.filter(c => c.university === university);
    }
    if (college) {
      filteredChannels = filteredChannels.filter(c => c.college === college);
    }
    return [...filteredChannels]; // Return a copy
  },

  getChannelById: async (id: string): Promise<Channel | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_CHANNELS.find(c => c.id === id) || null;
  },

  createChannel: async (professorId: string, name: string, university: string, college: string): Promise<Channel> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const professor = MOCK_PROFESSORS.find(p => p.id === professorId);
    if (!professor) {
      throw new Error('Professor not found');
    }

    const newChannel: Channel = {
      id: `chan-${Date.now()}`,
      name,
      professorId,
      professorName: professor.name,
      university,
      college,
      content: [],
      chatMessages: [],
      googleMeetLink: 'https://meet.google.com/new', // Placeholder for new channels
      subscribers: [],
    };
    MOCK_CHANNELS.push(newChannel);
    return newChannel;
  },

  publishContent: async (channelId: string, content: Omit<ChannelContent, 'id'>): Promise<Channel> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const channelIndex = MOCK_CHANNELS.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      throw new Error('Channel not found');
    }
    const newContent: ChannelContent = { ...content, id: `cont-${Date.now()}` };
    MOCK_CHANNELS[channelIndex].content.push(newContent);
    return MOCK_CHANNELS[channelIndex];
  },

  sendChannelMessage: async (channelId: string, sender: User, text: string): Promise<Channel> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const channelIndex = MOCK_CHANNELS.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      throw new Error('Channel not found');
    }
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      text,
      timestamp: new Date(),
    };
    MOCK_CHANNELS[channelIndex].chatMessages.push(newMessage);
    return MOCK_CHANNELS[channelIndex];
  },

  subscribeToChannel: async (channelId: string, studentId: string): Promise<Channel> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate payment/subscription delay
    const channelIndex = MOCK_CHANNELS.findIndex(c => c.id === channelId);
    if (channelIndex === -1) {
      throw new Error('Channel not found');
    }
    if (!MOCK_CHANNELS[channelIndex].subscribers.includes(studentId)) {
      MOCK_CHANNELS[channelIndex].subscribers.push(studentId);

      // Increment professor's stars
      const professorIndex = MOCK_PROFESSORS.findIndex(p => p.id === MOCK_CHANNELS[channelIndex].professorId);
      if (professorIndex !== -1) {
        MOCK_PROFESSORS[professorIndex].stars = (MOCK_PROFESSORS[professorIndex].stars || 0) + 5;
        // If the current logged-in user is this professor, update their local storage too.
        const currentUser = authService.getCurrentUser();
        if (currentUser?.id === MOCK_PROFESSORS[professorIndex].id) {
            authService.updateUser(MOCK_PROFESSORS[professorIndex]);
        }
      }
    }
    return MOCK_CHANNELS[channelIndex];
  },

  getPrivateChats: async (userId: string): Promise<PrivateChat[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_PRIVATE_CHATS.filter(pc => pc.participants.includes(userId));
  },

  getOrCreatePrivateChat: async (user1Id: string, user2Id: string, user1Name: string, user2Name: string): Promise<PrivateChat> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    let chat = MOCK_PRIVATE_CHATS.find(pc =>
      (pc.participants[0] === user1Id && pc.participants[1] === user2Id) ||
      (pc.participants[0] === user2Id && pc.participants[1] === user1Id)
    );

    if (!chat) {
      chat = {
        id: `pc-${Date.now()}`,
        participants: [user1Id, user2Id],
        messages: [],
      };
      MOCK_PRIVATE_CHATS.push(chat);
    }
    return chat;
  },

  sendPrivateMessage: async (chatId: string, sender: User, text: string): Promise<PrivateChat> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const chatIndex = MOCK_PRIVATE_CHATS.findIndex(pc => pc.id === chatId);
    if (chatIndex === -1) {
      throw new Error('Private chat not found');
    }
    const newMessage: Message = {
      id: `pmsg-${Date.now()}`,
      senderId: sender.id,
      senderName: sender.name,
      text,
      timestamp: new Date(),
    };
    MOCK_PRIVATE_CHATS[chatIndex].messages.push(newMessage);
    return MOCK_PRIVATE_CHATS[chatIndex];
  },
};