import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api, getStoredToken, setStoredToken } from '../services/api';
import { soundFX } from '../services/sound';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (identifier: string, pass: string) => Promise<void>;
  simpleLogin: (name: string, email: string, callsign?: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; displayName?: string; callsign?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getStoredToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    async function initAuth() {
      const stored = getStoredToken();
      if (stored) {
        try {
          const res = await api.auth.me();
          setUser(res.user);
          soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
        } catch {
          // Token expired or invalid, auto-login with demo user to provide instant seamless experience
          tryAutoDemo();
        }
      } else {
        // Automatically log in as Demo User so user doesn't face friction
        tryAutoDemo();
      }
      setIsLoading(false);
    }

    async function tryAutoDemo() {
      try {
        const res = await api.auth.demoLogin();
        setStoredToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
      } catch (e) {
        console.warn('Auto-demo login failed:', e);
      }
    }

    initAuth();
  }, []);

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
    soundFX.playClick();
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const login = async (identifier: string, pass: string) => {
    const res = await api.auth.login(identifier, pass);
    setStoredToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
    soundFX.playSuccess();
    setAuthModalOpen(false);
  };

  const simpleLogin = async (name: string, email: string, callsign?: string) => {
    const res = await api.auth.simpleLogin(name, email, callsign);
    setStoredToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
    soundFX.playSuccess();
    setAuthModalOpen(false);
  };

  const register = async (data: { username: string; email: string; password: string; displayName?: string; callsign?: string }) => {
    const res = await api.auth.register(data);
    setStoredToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
    soundFX.playSuccess();
    setAuthModalOpen(false);
  };

  const demoLogin = async () => {
    const res = await api.auth.demoLogin();
    setStoredToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    soundFX.setEnabled(res.user.voiceSettings?.soundEffects ?? true);
    soundFX.playSuccess();
    setAuthModalOpen(false);
  };

  const logout = () => {
    setStoredToken(null);
    setTokenState(null);
    setUser(null);
    soundFX.playClick();
  };

  const updateProfile = async (updates: Partial<User>) => {
    const res = await api.auth.updateProfile(updates);
    setUser(res.user);
    if (updates.voiceSettings?.soundEffects !== undefined) {
      soundFX.setEnabled(updates.voiceSettings.soundEffects);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        authModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        simpleLogin,
        register,
        demoLogin,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
