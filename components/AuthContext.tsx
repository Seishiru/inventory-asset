import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'Admin' | 'IT/OJT';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  signup: (username: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) return false;

      const data = await res.json();
      setUser(data.user);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const signup = async (username: string, email: string, password: string, role: UserRole) => {
  try {
    const res = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    });
    if (!res.ok) return false;

    const data = await res.json();
    setUser(data.user);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return true;
  } catch {
    return false;
  }
};




  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
