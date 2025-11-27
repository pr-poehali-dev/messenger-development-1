const USERS_API = 'https://functions.poehali.dev/f32bef91-79c0-41e6-b236-f2d74386b62b';
const CHATS_API = 'https://functions.poehali.dev/e9e36b17-1a5b-4d67-8ed3-1e6ae69577a9';

export interface User {
  id: number;
  username: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Chat {
  id: number;
  name: string;
  type: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

export interface Message {
  id: number;
  text: string;
  created_at: string;
  user_id: number;
  author: string;
}

export const api = {
  users: {
    async getProfile(userId: number): Promise<User> {
      const response = await fetch(`${USERS_API}?action=get_profile&user_id=${userId}`);
      const data = await response.json();
      return data.user;
    },

    async createUser(username: string, phone: string): Promise<number> {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_user', username, phone }),
      });
      const data = await response.json();
      return data.user_id;
    },

    async updateProfile(userId: number, updates: Partial<User>): Promise<boolean> {
      const response = await fetch(USERS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...updates }),
      });
      const data = await response.json();
      return data.success;
    },

    async getContacts(userId: number): Promise<User[]> {
      const response = await fetch(`${USERS_API}?action=get_contacts&user_id=${userId}`);
      const data = await response.json();
      return data.contacts;
    },

    async addContact(userId: number, contactUserId: number): Promise<boolean> {
      const response = await fetch(USERS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_contact', user_id: userId, contact_user_id: contactUserId }),
      });
      const data = await response.json();
      return data.success;
    },
  },

  chats: {
    async getChats(userId: number): Promise<Chat[]> {
      const response = await fetch(`${CHATS_API}?action=get_chats&user_id=${userId}`);
      const data = await response.json();
      return data.chats;
    },

    async getMessages(chatId: number): Promise<Message[]> {
      const response = await fetch(`${CHATS_API}?action=get_messages&chat_id=${chatId}`);
      const data = await response.json();
      return data.messages;
    },

    async createChat(name: string, type: string, userId: number): Promise<number> {
      const response = await fetch(CHATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_chat', name, type, user_id: userId }),
      });
      const data = await response.json();
      return data.chat_id;
    },

    async sendMessage(chatId: number, userId: number, text: string): Promise<number> {
      const response = await fetch(CHATS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_message', chat_id: chatId, user_id: userId, text }),
      });
      const data = await response.json();
      return data.message_id;
    },
  },
};
