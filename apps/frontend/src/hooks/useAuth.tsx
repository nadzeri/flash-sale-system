import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock authentication
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[email] && storedUsers[email] === password) {
      const user = { email };
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const signup = async (email: string, password: string) => {
    // Mock signup
    const storedUsers = JSON.parse(localStorage.getItem('users') || '{}');
    if (storedUsers[email]) {
      throw new Error('User already exists');
    }
    storedUsers[email] = password;
    localStorage.setItem('users', JSON.stringify(storedUsers));
    
    const user = { email };
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
