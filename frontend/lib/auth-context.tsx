"use client";

import * as React from "react";
import type { ApiAccountProfile } from "./types/api";
import {
  isAuthenticated,
  getStoredAccountProfile,
  setStoredAccountProfile,
  clearStoredAccountProfile,
} from "./auth-client";

interface AuthContextType {
  isLoggedIn: boolean;
  profile: ApiAccountProfile | null;
  updateAuthState: () => void;
  setProfile: (profile: ApiAccountProfile | null) => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [profile, setProfileState] = React.useState<ApiAccountProfile | null>(null);

  // Function to update auth state - can be called from anywhere
  const updateAuthState = React.useCallback(() => {
    const loggedIn = isAuthenticated();
    setIsLoggedIn(loggedIn);

    if (loggedIn) {
      setProfileState(getStoredAccountProfile());
    } else {
      setProfileState(null);
    }
  }, []);

  const setProfile = React.useCallback((nextProfile: ApiAccountProfile | null) => {
    if (nextProfile) {
      setStoredAccountProfile(nextProfile);
    } else {
      clearStoredAccountProfile();
    }
    setProfileState(nextProfile);
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Check auth state on mount
  React.useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  // Also listen for storage events (when auth changes in another tab)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      if (
        e.key === "awe-auth-token" ||
        e.key === "awe-account-profile"
      ) {
        updateAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [updateAuthState]);

  const value = React.useMemo(
    () => ({ isLoggedIn, profile, updateAuthState, setProfile }),
    [isLoggedIn, profile, updateAuthState, setProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
