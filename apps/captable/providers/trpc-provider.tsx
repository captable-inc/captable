"use client";

import { TRPCReactProvider } from "@/trpc/react";

interface TRPCProviderProps {
  children: React.ReactNode;
  cookies: string;
}

export function TRPCProvider({ children, cookies }: TRPCProviderProps) {
  return <TRPCReactProvider cookies={cookies}>{children}</TRPCReactProvider>;
}
