import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isPro, setIsPro]     = useState(false);
  const [devMode, setDevMode] = useState(false);
  const [usage, setUsage]     = useState({ used: 0, limit: 10, remaining: 10 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          setIsPro(tokenResult.claims.pro === true);
        } catch {
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const getIdToken = useCallback(async () => {
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch {
      return null;
    }
  }, [user]);

  const toggleDevMode = () => {
    setDevMode(prev => !prev);
  };

  const refreshProStatus = useCallback(async () => {
    if (!user) return;
    try {
      const tokenResult = await user.getIdTokenResult(true);
      setIsPro(tokenResult.claims.pro === true);
    } catch {
      // silently ignore; keep current state
    }
  }, [user]);

  const refreshUsage = useCallback((newUsage) => {
    setUsage(newUsage);
  }, []);

  const userType = useMemo(() => {
    if (!user) return 'guest';
    if (isPro || devMode) return 'pro';
    return 'user';
  }, [user, isPro, devMode]);

  return (
    <AuthContext.Provider value={{
      user, loading, authError,
      loginWithGoogle, logout, getIdToken,
      isPro, devMode, toggleDevMode, refreshProStatus,
      userType, usage, refreshUsage,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
