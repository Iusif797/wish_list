import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Список желаний",
  description: "Социальное приложение для списков желаний",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t)t='dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(26,173,100,0.08),#f8fafc)] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(26,173,100,0.06),#020617)] text-slate-900 dark:text-slate-100 transition-colors duration-300">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
