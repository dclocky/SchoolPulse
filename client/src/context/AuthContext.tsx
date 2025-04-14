import { createContext, useContext, ReactNode } from 'react';

interface User {
  id: 1,
  username: 'admin',
  email: 'admin@eduschool.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  subjects: ['All']
}

interface AuthContextType {
  user: User;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: {
    id: 1,
    username: 'admin',
    email: 'admin@eduschool.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    subjects: ['All']
  },
  isAuthenticated: true,
  isLoading: false,
  login: async () => true,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const mockUser = {
    id: 1,
    username: 'admin',
    email: 'admin@eduschool.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin' as const,
    subjects: ['All']
  };

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