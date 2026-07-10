import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "CMC Travel - Trải Nghiệm Du Lịch Thượng Lưu",
  description: "Khám phá thế giới cùng CMC Travel - Dịch vụ du lịch cao cấp tại Việt Nam",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi" suppressHydrationWarning
      className={cn("h-full", "antialiased", playfair.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body suppressHydrationWarning 
      className="min-h-full flex flex-col">
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
