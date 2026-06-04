import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '@/lib/api';
import type { User } from '@/lib/api';

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (username: string, password: string, remember?: boolean) => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Check authentication status on mount
    const checkAuth = async () => {
        try {
            const data = await api.getCurrentUser();
            setUser(data.user);
        } catch (error: unknown) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (username: string, password: string, remember?: boolean) => {
        const userData = await api.login(username, password, remember);
        setUser(userData);
    };

    const register = async (username: string, password: string) => {
        const userData = await api.register(username, password);
        setUser(userData);
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
