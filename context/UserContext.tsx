import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'guest' | 'admin';
  credits: number; // "Thermal" points for AI generation
}

interface Transaction {
  id: string;
  type: 'donation' | 'production';
  amount: number;
  date: string;
  note: string;
}

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  login: (name: string, email: string) => void;
  logout: () => void;
  enableAdmin: () => void;
  logoutAdmin: () => void;
  addCredit: (amount: number, note: string) => void;
  deductCredit: (amount: number) => boolean;
  getAllUsers: () => User[]; // Admin only
  getAllTransactions: () => Transaction[]; // Admin only
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Mock Database for Users and Transactions (In a real app, this would be backend)
  const [usersDb, setUsersDb] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Check local storage for admin session
    const adminSession = localStorage.getItem('willwi_admin_session');
    if (adminSession === 'active') setIsAdmin(true);

    const savedUser = localStorage.getItem('willwi_current_user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const login = (name: string, email: string) => {
    const newUser: User = { 
        id: Date.now().toString(), 
        name, 
        email, 
        role: 'guest', 
        credits: 100 // Welcome bonus
    };
    setUser(newUser);
    setUsersDb(prev => [...prev, newUser]);
    localStorage.setItem('willwi_current_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('willwi_current_user');
  };

  const enableAdmin = () => {
    setIsAdmin(true);
    localStorage.setItem('willwi_admin_session', 'active');
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    localStorage.removeItem('willwi_admin_session');
  };

  const addCredit = (amount: number, note: string) => {
    if (!user) return;
    const updatedUser = { ...user, credits: user.credits + amount };
    setUser(updatedUser);
    localStorage.setItem('willwi_current_user', JSON.stringify(updatedUser));
    
    setTransactions(prev => [...prev, {
        id: Date.now().toString(),
        type: 'donation',
        amount,
        date: new Date().toISOString(),
        note
    }]);
  };

  const deductCredit = (amount: number) => {
    if (!user) return false;
    if (user.credits < amount) {
        alert("點數不足 (Insufficient Thermal)。請支持樂捐以獲取更多算力。");
        return false;
    }
    const updatedUser = { ...user, credits: user.credits - amount };
    setUser(updatedUser);
    localStorage.setItem('willwi_current_user', JSON.stringify(updatedUser));
    return true;
  };

  return (
    <UserContext.Provider value={{ 
        user, isAdmin, login, logout, enableAdmin, logoutAdmin, 
        addCredit, deductCredit,
        getAllUsers: () => usersDb,
        getAllTransactions: () => transactions
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
