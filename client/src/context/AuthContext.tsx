
import React, { createContext, useContext, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher';
  subjects: string[];
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@eduschool.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin' as const,
  subjects: ['All']
};

const AuthContext = createContext<AuthContextType>({
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  login: async () => true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AuthContext.Provider
      value={{
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: async () => true,
        logout: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
