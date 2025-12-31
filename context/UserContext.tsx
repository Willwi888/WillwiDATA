import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

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
  login: (name: string, email: string) => Promise<void>;
  logout: () => void;
  enableAdmin: () => void;
  logoutAdmin: () => void;
  addCredit: (amount: number, note: string) => Promise<void>;
  deductCredit: (amount: number) => Promise<boolean>;
  getAllUsers: () => User[]; // Admin only
  getAllTransactions: () => Transaction[]; // Admin only
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Mock Database for Users and Transactions (loaded from Supabase)
  const [usersDb, setUsersDb] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Check local storage for admin session
    const adminSession = localStorage.getItem('willwi_admin_session');
    if (adminSession === 'active') setIsAdmin(true);

    // Load current user from localStorage first (for immediate availability)
    const savedUser = localStorage.getItem('willwi_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Load users and transactions from Supabase
    loadUsersFromSupabase();
    loadTransactionsFromSupabase();
  }, []);

  const loadUsersFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');
      
      if (error) {
        console.error('Error loading users from Supabase:', error);
      } else if (data) {
        // Convert to local User format
        const users: User[] = data.map(u => ({
          id: u.id,
          name: u.name || '',
          email: u.email || '',
          role: u.is_admin ? 'admin' : 'guest',
          credits: u.credits || 0
        }));
        setUsersDb(users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadTransactionsFromSupabase = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading transactions from Supabase:', error);
      } else if (data) {
        const txns: Transaction[] = data.map(t => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          date: t.created_at,
          note: t.note || t.description || ''
        }));
        setTransactions(txns);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
  };

  const login = async (name: string, email: string) => {
    try {
      // NOTE: This is a simplified user management system without proper authentication.
      // In a production environment, you should implement proper authentication using
      // Supabase Auth (supabase.auth.signUp, supabase.auth.signIn) to secure user data.
      // The current implementation allows anyone to access any user account by email.
      
      // Check if user exists in Supabase
      const { data: existingUsers } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);
      
      let userId: string;
      let credits: number = 100;
      
      if (existingUsers && existingUsers.length > 0) {
        // User exists, use their data
        const dbUser = existingUsers[0];
        userId = dbUser.id;
        credits = dbUser.credits || 0;
      } else {
        // Create new user in Supabase
        const { data: newUser, error } = await supabase
          .from('users')
          .insert([{ 
            name, 
            email, 
            credits: 100,
            is_admin: false
          }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating user in Supabase:', error);
          // Fallback to local-only user if database is unavailable
          // This maintains functionality when offline but won't sync to database
          userId = `local-${Date.now()}`;
          console.warn('Using local-only user ID. Data will not be synced to Supabase.');
        } else {
          userId = newUser.id;
          credits = newUser.credits;
        }
      }
      
      const newUser: User = { 
        id: userId, 
        name, 
        email, 
        role: 'guest', 
        credits
      };
      
      setUser(newUser);
      setUsersDb(prev => {
        const filtered = prev.filter(u => u.id !== userId);
        return [...filtered, newUser];
      });
      localStorage.setItem('willwi_current_user', JSON.stringify(newUser));
      
      // Reload data from Supabase
      loadUsersFromSupabase();
    } catch (error) {
      console.error('Login error:', error);
      alert('登入失敗：發生錯誤。');
    }
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

  const addCredit = async (amount: number, note: string) => {
    if (!user) return;
    
    try {
      const updatedCredits = user.credits + amount;
      
      // Update user credits in Supabase
      const { error: userError } = await supabase
        .from('users')
        .update({ credits: updatedCredits })
        .eq('id', user.id);
      
      if (userError) {
        console.error('Error updating user credits:', userError);
      }
      
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'donation',
          amount,
          note,
          description: note
        }]);
      
      if (txError) {
        console.error('Error creating transaction:', txError);
      }
      
      // Update local state
      const updatedUser = { ...user, credits: updatedCredits };
      setUser(updatedUser);
      localStorage.setItem('willwi_current_user', JSON.stringify(updatedUser));
      
      // Reload transactions
      loadTransactionsFromSupabase();
    } catch (error) {
      console.error('Add credit error:', error);
    }
  };

  const deductCredit = async (amount: number) => {
    if (!user) return false;
    if (user.credits < amount) {
        alert("點數不足 (Insufficient Thermal)。請支持樂捐以獲取更多算力。");
        return false;
    }
    
    try {
      const updatedCredits = user.credits - amount;
      
      // Update user credits in Supabase
      const { error: userError } = await supabase
        .from('users')
        .update({ credits: updatedCredits })
        .eq('id', user.id);
      
      if (userError) {
        console.error('Error deducting user credits:', userError);
        return false;
      }
      
      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert([{
          user_id: user.id,
          type: 'production',
          amount: -amount,
          description: 'AI generation usage',
          note: 'AI generation usage'
        }]);
      
      if (txError) {
        console.error('Error creating transaction:', txError);
      }
      
      // Update local state
      const updatedUser = { ...user, credits: updatedCredits };
      setUser(updatedUser);
      localStorage.setItem('willwi_current_user', JSON.stringify(updatedUser));
      
      // Reload transactions
      loadTransactionsFromSupabase();
      
      return true;
    } catch (error) {
      console.error('Deduct credit error:', error);
      return false;
    }
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
