import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentUser, login as loginApi, logout as logoutApi } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// User type
interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'teacher';
  subjects: string[];
}

// Auth context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
});

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        console.log('Checking auth status...');
        const data = await getCurrentUser();
        console.log('Auth check result:', data);
        if (data?.user) {
          console.log('User is authenticated:', data.user);
          setUser(data.user);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect based on role
  useEffect(() => {
    if (user && !isLoading) {
      console.log('Redirecting user based on role:', user.role);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      }
    }
  }, [user, isLoading, navigate]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login with:', email);
      const data = await loginApi(email, password);
      console.log('Login response:', data);
      
      if (data?.user) {
        console.log('Login successful, user data:', data.user);
        setUser(data.user);
        
        // Show success toast
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.firstName}!`,
        });
        
        return true;
      }
      
      console.log('Login failed, no user data returned');
      toast({
        title: "Login failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Please check your credentials and try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutApi();
      setUser(null);
      navigate('/login');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuth = () => useContext(AuthContext);
