import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Health-First Coach — Build better days, one habit at a time",
  description:
    "A personalized digital health coach that helps you turn small daily actions into lasting routines. Adaptive coaching, contextual nudges, and progress that makes sense.",
  keywords: [
    "health coach",
    "habit tracking",
    "wellness",
    "behavior change",
    "AI coach",
    "digital health",
  ],
  authors: [{ name: "Health-First Inc." }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Health-First Coach",
    description:
      "Small actions. Personalized guidance. Lasting habits. Your personalized digital health coach.",
    siteName: "Health-First",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Health-First Coach",
    description:
      "Small actions. Personalized guidance. Lasting habits.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
