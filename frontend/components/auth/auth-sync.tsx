"use client";

import { useEffect } from "react";
import { getAuthToken } from "@/lib/auth-client";
import { setAuthTokenCookie } from "@/lib/actions/auth";

/**
 * This component syncs authentication tokens from localStorage to cookies
 * on initial page load, ensuring server components can access auth state.
 * 
 * This is needed for users who logged in before cookie-based auth was implemented.
 * The sync happens silently in the background without page reloads.
 */
export function AuthSync() {
  useEffect(() => {
    const syncAuthToken = async () => {
      const token = getAuthToken();
      
      // If there's a token in localStorage, ensure it's also in cookies
      if (token) {
        try {
          await setAuthTokenCookie(token);
          console.log("[AuthSync] Token synced to cookie");
        } catch (error) {
          console.error("[AuthSync] Failed to sync token to cookie:", error);
        }
      }
    };

    // Sync on mount
    syncAuthToken();
  }, []); // Empty dependency array - only run once on mount

  return null;
}
