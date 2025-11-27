import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api, type Chat, type Message, type User } from '@/lib/api';
import AuthScreen from '@/components/AuthScreen';

type Section = 'chats' | 'calls' | 'contacts' | 'communities' | 'groups' | 'settings' | 'profile' | 'kelan';

const Index = () => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('chats');
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [kelanListening, setKelanListening] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ type: 'audio' | 'video' | 'screen', chatName: string } | null>(null);
  const [callDialer, setCallDialer] = useState<{ show: boolean, number: string }>({ show: false, number: '' });
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUserId) {
      loadChats();
      loadUserProfile();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat);
    }
  }, [selectedChat]);

  useEffect(() => {
    ringtoneRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA4PWqfn77BdGQg+ltrzxnMnBSx+zPLaizsIHGW56+SaSwwOVKTj8bllHAc5j9b00H0rBSZ5yvDglEILElyx6+ynVREKQ5vd8shyJwUviM/z2Ic3CBpqu+vnn04ODla+6O+vYBsHO5PY88lzJwYpfMry4JhFDBBcr+rss1saCD+Z3PLHcycGLIHO8tiJOAcZaLvs56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvs5qBODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt55pODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt555OEM5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt5qBODw5Wv+jvr2AbBj+Z3PLHcycGLIHO8tiJOAcZaLvt5qBODw5Wv+jvr2AbBj+Z3PLHcycGLIHO8tiJOAcZaLvt5qBODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt5qBODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv+jvr2EcBj+Z3PLHcycGLIHO8tiJOAcZaLvt56BODw5Wv... [truncated]
    ringtoneRef.current.loop = true;
  }, []);

  const loadChats = async () => {
    if (!currentUserId) return;
    setLoading(true);
    const data = await api.chats.getChats(currentUserId);
    setChats(data);
    setLoading(false);
  };

  const loadMessages = async (chatId: number) => {
    const data = await api.chats.getMessages(chatId);
    setMessages(data);
  };

  const loadUserProfile = async () => {
    if (!currentUserId) return;
    const data = await api.users.getProfile(currentUserId);
    setUserProfile(data);
  };

  const loadContacts = async () => {
    if (!currentUserId) return;
    const data = await api.users.getContacts(currentUserId);
    setContacts(data);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !currentUserId) return;

    await api.chats.sendMessage(selectedChat, currentUserId, message);
    setMessage('');
    loadMessages(selectedChat);
    loadChats();
    
    toast({
      title: 'Сообщение отправлено',
      duration: 2000,
    });
  };

  const handleCreateChat = async (name: string) => {
    if (!currentUserId) return;
    const chatId = await api.chats.createChat(name, 'direct', currentUserId);
    loadChats();
    setSelectedChat(chatId);
    
    toast({
      title: 'Чат создан',
      duration: 2000,
    });
  };

  const handleUpdateProfile = async (updates: Partial<User>) => {
    if (!currentUserId) return;
    await api.users.updateProfile(currentUserId, updates);
    loadUserProfile();
    
    toast({
      title: 'Профиль обновлён',
      duration: 2000,
    });
  };

  const initiateCall = (type: 'audio' | 'video' | 'screen') => {
    ringtoneRef.current?.play();
    setIncomingCall({ type, chatName: chats.find(c => c.id === selectedChat)?.name || 'Неизвестный' });
    
    setTimeout(() => {
      ringtoneRef.current?.pause();
      if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
    }, 5000);
  };

  const handleDialNumber = (digit: string) => {
    if (callDialer.number.length < 15) {
      setCallDialer(prev => ({ ...prev, number: prev.number + digit }));
    }
  };

  const handleCall = () => {
    if (callDialer.number) {
      toast({ title: 'Звонок', description: `Вызов на номер ${callDialer.number}` });
      initiateCall('audio');
      setCallDialer({ show: false, number: '' });
    }
  };

  const handleLogin = (userId: number) => {
    setCurrentUserId(userId);
    localStorage.setItem('userId', userId.toString());
  };

  useEffect(() => {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      setCurrentUserId(parseInt(savedUserId));
    }
  }, []);

  if (!currentUserId) {
    return <AuthScreen onLogin={handleLogin} />;
  }

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

  const renderChatWindow = () => {
    const currentChat = chats.find(c => c.id === selectedChat);
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/20 text-primary">{currentChat?.name[0] || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{currentChat?.name || 'Чат'}</h3>
              <p className="text-xs text-muted-foreground">В сети</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => initiateCall('audio')}>
              <Icon name="Phone" size={20} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => initiateCall('video')}>
              <Icon name="Video" size={20} />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => initiateCall('screen')}>
              <Icon name="MonitorUp" size={20} />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                Нет сообщений. Начните переписку!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.user_id === currentUserId;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%]`}>
                      {!isOwn && (
                        <p className="text-xs text-primary font-medium mb-1">{msg.author}</p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-secondary border-0"
            />
            <Button size="icon" variant="ghost">
              <Icon name="Smile" size={20} />
            </Button>
            <Button size="icon" className="bg-primary hover:bg-primary/90" onClick={handleSendMessage}>
              <Icon name="Send" size={20} />
            </Button>
          </div>
        </div>
      </div>
    );
  };

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

  const renderProfile = () => {
    const [editUsername, setEditUsername] = useState(userProfile?.username || '');
    const [editBio, setEditBio] = useState(userProfile?.bio || '');
    const [editPhone, setEditPhone] = useState(userProfile?.phone || '');

    useEffect(() => {
      if (userProfile) {
        setEditUsername(userProfile.username);
        setEditBio(userProfile.bio || '');
        setEditPhone(userProfile.phone || '');
      }
    }, [userProfile]);

    const handleSave = () => {
      handleUpdateProfile({
        username: editUsername,
        bio: editBio,
        phone: editPhone,
      });
    };

    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Профиль</h2>
          <Button
            variant="outline"
            onClick={() => {
              localStorage.removeItem('userId');
              setCurrentUserId(null);
            }}
          >
            Выйти
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-32 h-32">
            <AvatarFallback className="bg-primary/20 text-primary text-4xl">
              {userProfile?.username?.[0] || 'Я'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Имя</label>
            <Input
              className="mt-1"
              placeholder="Ваше имя"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">О себе</label>
            <Input
              className="mt-1"
              placeholder="Расскажите о себе"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Телефон</label>
            <Input
              className="mt-1"
              placeholder="+7 (___) ___-__-__"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </div>
      </div>
    );
  };

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
        return (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <div className="w-full max-w-md space-y-6">
              <h2 className="text-2xl font-bold text-center">Набор номера</h2>
              <div className="bg-secondary rounded-lg p-4 text-center">
                <Input
                  value={callDialer.number}
                  readOnly
                  placeholder="Введите номер"
                  className="text-2xl text-center bg-transparent border-0 font-mono"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
                  <Button
                    key={digit}
                    size="lg"
                    variant="outline"
                    className="h-16 text-2xl font-semibold"
                    onClick={() => handleDialNumber(digit)}
                  >
                    {digit}
                  </Button>
                ))}
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCallDialer(prev => ({ ...prev, number: prev.number.slice(0, -1) }))}
                  disabled={!callDialer.number}
                >
                  <Icon name="Delete" className="mr-2" />
                  Удалить
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleCall}
                  disabled={!callDialer.number}
                >
                  <Icon name="Phone" className="mr-2" />
                  Позвонить
                </Button>
              </div>
            </div>
          </div>
        );
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
    <>
      <Dialog open={incomingCall !== null} onOpenChange={() => {
        setIncomingCall(null);
        ringtoneRef.current?.pause();
        if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Входящий звонок</DialogTitle>
            <DialogDescription>
              {incomingCall?.type === 'audio' && 'Аудиозвонок'}
              {incomingCall?.type === 'video' && 'Видеозвонок'}
              {incomingCall?.type === 'screen' && 'Демонстрация экрана'}
              {' от '}{incomingCall?.chatName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4">
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                setIncomingCall(null);
                ringtoneRef.current?.pause();
                if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
                toast({ title: 'Звонок отклонён' });
              }}
            >
              <Icon name="PhoneOff" className="mr-2" />
              Отклонить
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                setIncomingCall(null);
                ringtoneRef.current?.pause();
                if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
                toast({ title: 'Звонок принят' });
              }}
            >
              <Icon name="Phone" className="mr-2" />
              Принять
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default Index;