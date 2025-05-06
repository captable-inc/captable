import {
  Links,
  type LinksFunction,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { ThemeProvider } from "./components/theme/provider";
import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "stylesheet", href: styles },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// This script runs immediately before any React code to prevent flash of unstyled content
function ThemeScript() {
  const themeScript = `
    (function() {
      function getThemePreference() {
        const storedTheme = typeof localStorage !== 'undefined' && localStorage.getItem('theme');
        
        if (storedTheme && storedTheme !== 'system') {
          return storedTheme;
        }
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      const theme = getThemePreference();
      
      document.documentElement.classList.add(theme);
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
