import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { api, type Chat, type Message, type User } from '@/lib/api';

type Section = 'chats' | 'calls' | 'contacts' | 'communities' | 'groups' | 'settings' | 'profile' | 'kelan';

const CURRENT_USER_ID = 1;

const Index = () => {
  const [activeSection, setActiveSection] = useState<Section>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [kelanListening, setKelanListening] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadChats();
    loadUserProfile();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  const loadChats = async () => {
    setLoading(true);
    const data = await api.chats.getChats(CURRENT_USER_ID);
    setChats(data);
    setLoading(false);
  };

  const loadMessages = async (chatId: number) => {
    const data = await api.chats.getMessages(chatId);
    setMessages(data);
  };

  const loadUserProfile = async () => {
    const data = await api.users.getProfile(CURRENT_USER_ID);
    setUserProfile(data);
  };

  const loadContacts = async () => {
    const data = await api.users.getContacts(CURRENT_USER_ID);
    setContacts(data);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;

    await api.chats.sendMessage(selectedChat, CURRENT_USER_ID, message);
    setMessage('');
    loadMessages(selectedChat);
    loadChats();
    
    toast({
      title: 'Сообщение отправлено',
      duration: 2000,
    });
  };

  const handleCreateChat = async (name: string) => {
    const chatId = await api.chats.createChat(name, 'direct', CURRENT_USER_ID);
    loadChats();
    setSelectedChat(chatId);
    
    toast({
      title: 'Чат создан',
      duration: 2000,
    });
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    await api.users.updateProfile(CURRENT_USER_ID, updates);
    loadUserProfile();
    
    toast({
      title: 'Профиль обновлён',
      duration: 2000,
    });
  };

  const sidebarSections = [
    { id: 'chats' as Section, icon: 'MessageSquare', label: 'Чаты' },
    { id: 'calls' as Section, icon: 'Phone', label: 'Звонки' },
    { id: 'contacts' as Section, icon: 'Users', label: 'Контакты' },
    { id: 'communities' as Section, icon: 'Globe', label: 'Сообщества' },
    { id: 'groups' as Section, icon: 'UsersRound', label: 'Группы' },
    { id: 'kelan' as Section, icon: 'Mic', label: 'Келан' },
  ];

  const bottomSections = [
    { id: 'settings' as Section, icon: 'Settings', label: 'Настройки' },
    { id: 'profile' as Section, icon: 'User', label: 'Профиль' },
  ];

  const renderChatList = () => {
    const selectedChatData = chats.find(c => c.id === selectedChat);
    
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="relative flex-1">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Поиск чатов..." className="pl-10 bg-secondary border-0" />
          </div>
          <Button 
            size="icon" 
            variant="ghost" 
            className="ml-2"
            onClick={() => {
              const name = prompt('Название чата:');
              if (name) handleCreateChat(name);
            }}
          >
            <Icon name="Plus" size={20} />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">Загрузка...</div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <p>Нет чатов</p>
              <Button variant="link" onClick={() => {
                const name = prompt('Название чата:');
                if (name) handleCreateChat(name);
              }}>
                Создать первый чат
              </Button>
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-secondary/50 transition-colors ${
                  selectedChat === chat.id ? 'bg-secondary' : ''
                }`}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar_url || ''} />
                    <AvatarFallback className="bg-primary/20 text-primary">{chat.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{chat.last_message || 'Нет сообщений'}</p>
                </div>
                {(chat.unread_count || 0) > 0 && (
                  <Badge className="bg-primary text-primary-foreground">{chat.unread_count}</Badge>
                )}
              </div>
            ))
          )}
        </ScrollArea>
      </div>
    );
  };

  const renderChatWindow = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/20 text-primary">Р</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Рабочий чат</h3>
            <p className="text-xs text-muted-foreground">В сети</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Icon name="Phone" size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <Icon name="Video" size={20} />
          </Button>
          <Button size="icon" variant="ghost">
            <Icon name="MonitorUp" size={20} />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${msg.isOwn ? 'order-2' : 'order-1'}`}>
                {!msg.isOwn && (
                  <p className="text-xs text-primary font-medium mb-1">{msg.author}</p>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Button size="icon" variant="ghost">
            <Icon name="Paperclip" size={20} />
          </Button>
          <Input
            placeholder="Написать сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 bg-secondary border-0"
          />
          <Button size="icon" variant="ghost">
            <Icon name="Smile" size={20} />
          </Button>
          <Button size="icon" className="bg-primary hover:bg-primary/90">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderKelan = () => (
    <div className="flex flex-col items-center justify-center h-full p-8">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative inline-block">
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center ${
              kelanListening ? 'animate-pulse-glow' : ''
            }`}
          >
            <Icon name="Mic" size={64} className="text-white" />
          </div>
          {kelanListening && (
            <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping opacity-75" />
          )}
        </div>
        <h2 className="text-3xl font-bold">Келан</h2>
        <p className="text-muted-foreground">
          Ваш голосовой помощник готов к работе. Нажмите на кнопку, чтобы начать разговор.
        </p>
        <Button
          size="lg"
          className="bg-primary hover:bg-primary/90"
          onClick={() => setKelanListening(!kelanListening)}
        >
          <Icon name={kelanListening ? 'MicOff' : 'Mic'} className="mr-2" />
          {kelanListening ? 'Остановить' : 'Начать разговор'}
        </Button>
        {kelanListening && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center justify-center gap-1">
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-12 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              <div className="w-1 h-10 bg-primary rounded-full animate-pulse" style={{ animationDelay: '450ms' }} />
              <div className="w-1 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
            </div>
            <p className="text-sm text-primary font-medium">Слушаю...</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Настройки</h2>
      <div className="space-y-4">
        <div className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors">
          <h3 className="font-medium mb-2">Уведомления</h3>
          <p className="text-sm text-muted-foreground">Настройте уведомления для чатов и звонков</p>
        </div>
        <div className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors">
          <h3 className="font-medium mb-2">Конфиденциальность</h3>
          <p className="text-sm text-muted-foreground">Управление приватностью и безопасностью</p>
        </div>
        <div className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors">
          <h3 className="font-medium mb-2">Звук и видео</h3>
          <p className="text-sm text-muted-foreground">Настройки микрофона, камеры и динамиков</p>
        </div>
        <div className="p-4 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors">
          <h3 className="font-medium mb-2">Тема оформления</h3>
          <p className="text-sm text-muted-foreground">Темная тема активна</p>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Профиль</h2>
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="w-32 h-32">
          <AvatarFallback className="bg-primary/20 text-primary text-4xl">Я</AvatarFallback>
        </Avatar>
        <Button variant="outline">Изменить фото</Button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Имя</label>
          <Input className="mt-1" placeholder="Ваше имя" />
        </div>
        <div>
          <label className="text-sm font-medium">О себе</label>
          <Input className="mt-1" placeholder="Расскажите о себе" />
        </div>
        <div>
          <label className="text-sm font-medium">Телефон</label>
          <Input className="mt-1" placeholder="+7 (___) ___-__-__" />
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90">Сохранить изменения</Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'chats':
        return (
          <div className="grid grid-cols-[350px_1fr] h-full">
            <div className="border-r border-border">{renderChatList()}</div>
            <div>{selectedChat ? renderChatWindow() : <div className="flex items-center justify-center h-full text-muted-foreground">Выберите чат</div>}</div>
          </div>
        );
      case 'kelan':
        return renderKelan();
      case 'settings':
        return renderSettings();
      case 'profile':
        return renderProfile();
      case 'calls':
        return <div className="flex items-center justify-center h-full text-muted-foreground">История звонков</div>;
      case 'contacts':
        return <div className="flex items-center justify-center h-full text-muted-foreground">Ваши контакты</div>;
      case 'communities':
        return <div className="flex items-center justify-center h-full text-muted-foreground">Сообщества</div>;
      case 'groups':
        return <div className="flex items-center justify-center h-full text-muted-foreground">Группы</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className="w-20 bg-sidebar flex flex-col items-center py-4 space-y-2 border-r border-sidebar-border">
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 cursor-pointer hover:bg-primary/80 transition-colors">
          <span className="text-xl font-bold">M</span>
        </div>
        <div className="w-full flex-1 space-y-2">
          {sidebarSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full h-12 flex items-center justify-center rounded-lg transition-colors ${
                activeSection === section.id ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
              title={section.label}
            >
              <Icon name={section.icon as any} size={24} />
            </button>
          ))}
        </div>
        <div className="w-full space-y-2">
          {bottomSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full h-12 flex items-center justify-center rounded-lg transition-colors ${
                activeSection === section.id ? 'bg-sidebar-accent text-sidebar-primary' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
              title={section.label}
            >
              <Icon name={section.icon as any} size={24} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default Index;