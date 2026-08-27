"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/nextjs";
import { signInWithCustomToken, signOut as signOutFirebase } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/lib/types";
import { updateUserRole } from "@/lib/firestore-service";

interface AuthContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  setRole: (role: UserRole) => Promise<void>;
  theme: "light" | "dark";
  toggleTheme: () => void;
  signOut: () => Promise<void>;
}

const EMPTY_USER: UserProfile = {
  uid: "",
  name: "Guest",
  email: "",
  role: "employee",
  createdAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user: clerkUser } = useUser();
  const { signOut: signOutClerk } = useClerkAuth();

  const [currentUser, setCurrentUserState] = useState<UserProfile>(EMPTY_USER);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn || !clerkUser) {
      setCurrentUserState(EMPTY_USER);
      return;
    }

    const sync = async () => {
      const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";
      const email = clerkUser.primaryEmailAddress?.emailAddress || "";
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!response.ok) {
        throw new Error("Unable to sync user profile");
      }

      const data = (await response.json()) as { profile: UserProfile };
      const profile = data.profile;

      setCurrentUserState(profile);
    };

    sync().catch((error) => {
      console.error("Failed to sync Clerk user to Firestore profile:", error);
      const fallback = {
        uid: clerkUser.id,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        role: "employee" as const,
        createdAt: new Date().toISOString(),
      };
      setCurrentUserState(fallback);
    });
  }, [clerkUser, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) {
      return;
    }

    let cancelled = false;

    const connectFirebase = async () => {
      const response = await fetch("/api/firebase-token", { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to mint Firebase custom token");
      }

      const { token } = await response.json();
      if (cancelled) {
        return;
      }

      await signInWithCustomToken(auth, token);
    };

    connectFirebase().catch((error) => {
      console.error("Firebase custom token sync failed:", error);
    });

    return () => {
      cancelled = true;
    };
  }, [clerkUser?.id, isLoaded, isSignedIn]);

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
  };

  const setRole = async (role: UserRole) => {
    if (!currentUser.uid) {
      return;
    }

    const updated = { ...currentUser, role };
    setCurrentUserState(updated);
    await updateUserRole(currentUser.uid, role);
  };

  const signOut = async () => {
    try {
      await signOutFirebase(auth);
      if (auth.currentUser) {
        console.warn("Firebase session still present after signOut attempt");
      }
    } catch (error) {
      console.warn("Firebase sign-out was not available:", error);
    }

    await signOutClerk(() => {
      setCurrentUserState(EMPTY_USER);
    });
    setCurrentUserState(EMPTY_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        setRole,
        theme,
        toggleTheme,
        signOut,
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
