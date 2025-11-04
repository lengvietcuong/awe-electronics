"use client";

import * as React from "react";
import { isAuthenticated } from "./auth-client";

interface AuthContextType {
  isLoggedIn: boolean;
  updateAuthState: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Function to update auth state - can be called from anywhere
  const updateAuthState = React.useCallback(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  // Check auth state on mount
  React.useEffect(() => {
    updateAuthState();
  }, [updateAuthState]);

  // Also listen for storage events (when auth changes in another tab)
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "awe-auth-token") {
        updateAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [updateAuthState]);

  const value = React.useMemo(
    () => ({ isLoggedIn, updateAuthState }),
    [isLoggedIn, updateAuthState]
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
