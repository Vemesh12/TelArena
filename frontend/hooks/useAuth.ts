"use client";
import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";

export interface User {
  id: string;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string;
  fullName?: string;
  age?: number;
  primaryLanguage?: string;
  freefireUid?: string;
  phone?: string;
  role: string;
  verification?: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const me = await api.getMe() as User;
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      api.setToken(token);
      window.history.replaceState({}, "", window.location.pathname);
    }
    fetchUser();
  }, [fetchUser]);

  const logout = useCallback(() => {
    api.clearToken();
    setUser(null);
    window.location.href = "/";
  }, []);

  return { user, isLoading, logout, refetch: fetchUser };
}
