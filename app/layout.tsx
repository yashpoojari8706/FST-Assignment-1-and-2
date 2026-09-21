import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ShopFlow | Accessible Studio Gear & Hardware",
  description:
    "High-performance, accessible e-commerce application demonstrating React Server Components, client Zustand state, and end-to-end type-safe Next.js Server Actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Server-rendered accessible header with client interactive leaves */}
          <Header />

          {/* Main content viewport */}
          <main className="flex-1 flex flex-col">{children}</main>

          {/* Server-rendered minimal accessible footer */}
          <footer className="border-t bg-muted/20 py-8 text-center text-xs text-muted-foreground">
            <div className="container mx-auto px-4 space-y-2">
              <p className="font-medium text-foreground">
                ShopFlow &bull; Academic Prototype for Fullstack Development (DJS23AMD302)
              </p>
              <p>
                RSC Architecture &bull; Zustand Persistent Store &bull; Shared Zod Validation &bull; Native Server Actions
              </p>
            </div>
          </footer>

          {/* Accessible notification toaster */}
          <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
