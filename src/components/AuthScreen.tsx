import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface AuthScreenProps {
  onLogin: (userId: number) => void;
}

const AuthScreen = ({ onLogin }: AuthScreenProps) => {
  const [isRegistration, setIsRegistration] = useState(false);
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    if (numbers.length <= 1) return `+${numbers}`;
    if (numbers.length <= 4) return `+${numbers[0]} (${numbers.slice(1)}`;
    if (numbers.length <= 7) return `+${numbers[0]} (${numbers.slice(1, 4)}) ${numbers.slice(4)}`;
    if (numbers.length <= 9) return `+${numbers[0]} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7)}`;
    return `+${numbers[0]} (${numbers.slice(1, 4)}) ${numbers.slice(4, 7)}-${numbers.slice(7, 9)}-${numbers.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const getCleanPhone = () => {
    return '+' + phone.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistration) {
        if (!username.trim()) {
          toast({ title: 'Ошибка', description: 'Введите имя пользователя', variant: 'destructive' });
          setLoading(false);
          return;
        }

        const userId = await api.users.createUser(username, getCleanPhone());
        
        toast({ title: 'Регистрация успешна', description: 'Добро пожаловать!' });
        onLogin(userId);
      } else {
        const response = await fetch(`https://functions.poehali.dev/f32bef91-79c0-41e6-b236-f2d74386b62b?action=login&phone=${encodeURIComponent(getCleanPhone())}`);
        const data = await response.json();

        if (data.success) {
          toast({ title: 'Вход выполнен', description: 'Добро пожаловать!' });
          onLogin(data.user.id);
        } else {
          toast({ 
            title: 'Пользователь не найден', 
            description: 'Зарегистрируйтесь для продолжения',
            variant: 'destructive' 
          });
          setIsRegistration(true);
        }
      }
    } catch (error) {
      toast({ 
        title: 'Ошибка', 
        description: 'Произошла ошибка. Попробуйте снова.',
        variant: 'destructive' 
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl font-bold text-white">M</span>
          </div>
          <CardTitle className="text-2xl">{isRegistration ? 'Регистрация' : 'Вход в мессенджер'}</CardTitle>
          <CardDescription>
            {isRegistration ? 'Создайте новый аккаунт' : 'Введите номер телефона для входа'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistration && (
              <div>
                <label className="text-sm font-medium mb-2 block">Имя пользователя</label>
                <Input
                  type="text"
                  placeholder="Иван Иванов"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={isRegistration}
                  className="bg-secondary border-0"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={handlePhoneChange}
                required
                className="bg-secondary border-0"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : (isRegistration ? 'Зарегистрироваться' : 'Войти')}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setIsRegistration(!isRegistration);
                setUsername('');
              }}
            >
              {isRegistration ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthScreen;
