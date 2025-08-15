import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { type Session, type User, type AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  currentUser: User | null;
  session: Session | null;
  isLoadingAuth: boolean;
  error: AuthError | null;
  login: (email: string, password?: string) => Promise<{ success: boolean; error: AuthError | null }>;
  signup: (email: string, password?: string, username?: string) => Promise<{ success: boolean; error: AuthError | null; message?: string }>;
  logout: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoadingAuth(true);
    setError(null);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email,
      password: password!,
    });

    setIsLoadingAuth(false);
    if (loginError) {
      setError(loginError);
      return { success: false, error: loginError };
    }
    return { success: true, error: null };
  };

  const signup = async (email: string, password?: string, username?: string) => {
    setIsLoadingAuth(true);
    setError(null);
    const { error: signupError } = await supabase.auth.signUp({
      email: email,
      password: password!,
      options: {
        data: {
          username: username,
        },
      },
    });

    setIsLoadingAuth(false);
    if (signupError) {
      setError(signupError);
      return { success: false, error: signupError };
    }
    
    // For signup, Supabase may require email confirmation. We'll return a success message.
    // The onAuthStateChange listener will handle user state if auto-confirmation is on.
    // If not, the user needs to confirm their email.
    return { success: true, error: null, message: "Signup successful! Please check your email for a confirmation link." };
  };

  const logout = async () => {
    setIsLoadingAuth(true);
    const { error: signOutError } = await supabase.auth.signOut();
    setIsLoadingAuth(false); // Let onAuthStateChange handle user state, but we can stop loading indicator here.
    if (signOutError) {
      setError(signOutError);
      return { error: signOutError };
    }
    return { error: null };
  };

  const value = { currentUser, session, isLoadingAuth, error, login, signup, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};