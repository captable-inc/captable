"use client";

import type { Session } from "@captable/auth";
import type React from "react";

export type AuthProviderProps = {
  session?: Session | null;
  children: React.ReactNode;
};

export const AuthProvider = ({ session, children }: AuthProviderProps) => {
  // Better Auth doesn't need a provider wrapper like NextAuth
  // The auth client handles session management automatically
  return <>{children}</>;
};

// Keep the old export name for backward compatibility
export const NextAuthProvider = AuthProvider;
