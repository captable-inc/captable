import type { Metadata } from "next";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { robotoMono, satoshi } from "@/styles/fonts";
import { NextAuthProvider } from "@/providers/next-auth";
import { ProgressBarProvider } from "@/providers/progress-bar";
import { ThemeProvider } from "@/providers/theme-provider";
import { PublicEnvScript } from "@/components/public-env-script";
import { ThemeToggle } from "@/components/theme-toggle";
import { Toaster } from "sonner";
import logo from "@/assets/logo.svg";
import { META } from "@captable/utils/constants";
import ScreenSize from "@/components/screen-size";

export const metadata: Metadata = {
  title: {
    default: META.title,
    template: `%s | ${META.title}`,
  },

  description: META.description,
  icons: [
    {
      rel: "icon",
      url: logo.src,
    },
  ],

  openGraph: {
    title: META.title,
    description: META.description,
    images: [logo.src],
  },

  twitter: {
    card: "summary_large_image",
    title: META.title,
    description: META.description,
    images: [logo.src],
  },

  metadataBase: new URL(META.url),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <html
      lang="en"
      className={cn(satoshi.variable, robotoMono.variable)}
      suppressHydrationWarning
    >
      <head>
        <PublicEnvScript />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider defaultTheme="system" storageKey="captable-theme">
          <main>
            <div className="absolute top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            {children}
            <Toaster richColors position="bottom-right" />
            {isDev && <ScreenSize />}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
