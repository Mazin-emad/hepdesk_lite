"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "@/lib/types";
import { MOCK_USERS } from "@/lib/mock-data";
import { getUserProfile, syncUserProfile, updateUserRole } from "@/lib/firestore-service";

interface AuthContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setRole: (role: UserRole) => Promise<void>;
  switchUserPersona: (uid: string) => void;
  availablePersonas: UserProfile[];
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(MOCK_USERS[0]);
  const [availablePersonas, setAvailablePersonas] = useState<UserProfile[]>(MOCK_USERS);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize theme from local storage or prefers-color-scheme
    const savedTheme = localStorage.getItem("helpdesk_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      }
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }

    // Initialize active user persona from local storage
    const savedUserId = localStorage.getItem("helpdesk_active_uid");
    if (savedUserId) {
      getUserProfile(savedUserId).then((profile) => {
        if (profile) {
          setCurrentUserState(profile);
        }
      });
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("helpdesk_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    if (typeof window !== "undefined") {
      localStorage.setItem("helpdesk_active_uid", user.uid);
    }
  };

  const setRole = async (role: UserRole) => {
    const updated = { ...currentUser, role };
    setCurrentUserState(updated);
    await updateUserRole(currentUser.uid, role);
    // Refresh personas list
    setAvailablePersonas((prev) =>
      prev.map((u) => (u.uid === currentUser.uid ? updated : u))
    );
  };

  const switchUserPersona = (uid: string) => {
    const user = availablePersonas.find((p) => p.uid === uid) || MOCK_USERS.find((p) => p.uid === uid);
    if (user) {
      setCurrentUser(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        setRole,
        switchUserPersona,
        availablePersonas,
        theme,
        toggleTheme,
      }}
    >
      <div className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AppProviders");
  }
  return context;
}
