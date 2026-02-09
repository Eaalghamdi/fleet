import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, type User, type Department, type Role, Department as Dept, Role as UserRole } from '../api';

// Development mode - set to true to bypass backend authentication
const DEV_MODE = import.meta.env.VITE_DEV_AUTH === 'true';

// Mock users for development
const MOCK_USERS: Record<string, User> = {
  admin: {
    id: 'dev-admin-001',
    username: 'admin',
    fullName: 'Admin User',
    department: Dept.ADMIN,
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  operator: {
    id: 'dev-operator-001',
    username: 'operator',
    fullName: 'Operator User',
    department: Dept.OPERATION,
    role: UserRole.OPERATOR,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  operation: {
    id: 'dev-operator-001',
    username: 'operation',
    fullName: 'Operation User',
    department: Dept.OPERATION,
    role: UserRole.OPERATOR,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  garage: {
    id: 'dev-garage-001',
    username: 'garage',
    fullName: 'Garage User',
    department: Dept.GARAGE,
    role: UserRole.OPERATOR,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  maintenance: {
    id: 'dev-maintenance-001',
    username: 'maintenance',
    fullName: 'Maintenance User',
    department: Dept.MAINTENANCE,
    role: UserRole.OPERATOR,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: Role[]) => boolean;
  hasDepartment: (...departments: Department[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        if (DEV_MODE) {
          // In dev mode, just restore from localStorage
          setUser(JSON.parse(storedUser));
        } else {
          try {
            // Verify token is still valid
            const currentUser = await authApi.me();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));
          } catch {
            // Token is invalid, clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    if (DEV_MODE) {
      // Dev mode: accept any password, match username to mock user
      const mockUser = MOCK_USERS[username.toLowerCase()] || MOCK_USERS.admin;
      const devUser = { ...mockUser, username }; // Use entered username
      localStorage.setItem('accessToken', 'dev-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify(devUser));
      setUser(devUser);
      return;
    }

    const response = await authApi.login({ username, password });
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const hasDepartment = useCallback(
    (...departments: Department[]) => {
      if (!user) return false;
      return departments.includes(user.department);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
    hasDepartment,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
