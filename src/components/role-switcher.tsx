"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "./providers";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { UserCheck, Shield, Users, ChevronDown, Check } from "lucide-react";
import { UserRole } from "@/lib/types";

export function RoleSwitcher() {
  const { currentUser, switchUserPersona, availablePersonas, setRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "manager":
        return (
          <Badge variant="oxblood" className="text-[10px] uppercase font-mono font-bold">
            <Shield className="mr-1 h-3 w-3 text-secondary" />
            Manager
          </Badge>
        );
      case "staff":
        return (
          <Badge variant="ochre" className="text-[10px] uppercase font-mono font-bold">
            <UserCheck className="mr-1 h-3 w-3 text-primary" />
            Staff
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold">
            <Users className="mr-1 h-3 w-3 text-muted-foreground" />
            Employee
          </Badge>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 h-8 px-2.5 border-dashed hover:border-primary transition-all text-xs"
        title="Switch active user persona or role for testing"
      >
        <span className="text-[11px] text-muted-foreground hidden sm:inline font-mono">Role:</span>
        {getRoleBadge(currentUser.role)}
        <ChevronDown className="h-3 w-3 opacity-60 ml-0.5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-md border border-border bg-card p-2 shadow-md z-50 animate-in fade-in-0 zoom-in-95">
          <div className="px-2 py-1.5 border-b border-border/60 mb-1">
            <p className="text-xs font-display font-bold text-foreground">Switch Test Persona</p>
            <p className="text-[11px] text-muted-foreground">
              Test HelpDesk Lite from different role clearances
            </p>
          </div>

          <div className="space-y-1 py-1">
            {availablePersonas.map((user) => {
              const isSelected = user.uid === currentUser.uid;
              return (
                <button
                  key={user.uid}
                  onClick={() => {
                    switchUserPersona(user.uid);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xs text-left text-xs transition-colors hover:bg-muted ${
                    isSelected ? "bg-muted/80 font-medium" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{user.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    {getRoleBadge(user.role)}
                    {isSelected && <Check className="h-3.5 w-3.5 text-primary ml-1" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border/60 mt-1">
            <p className="text-[11px] font-mono text-muted-foreground px-2 mb-1.5">
              Set role for {currentUser.name}:
            </p>
            <div className="grid grid-cols-3 gap-1 px-1">
              {(["employee", "staff", "manager"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    setRole(r);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1 rounded-xs text-[11px] font-mono font-semibold uppercase border transition-all ${
                    currentUser.role === r
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted border-border text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
