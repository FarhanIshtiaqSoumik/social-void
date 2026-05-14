import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Void",
  description: "Enter the Void. Share your world. A premium social media experience.",
  keywords: ["Social Void", "social media", "connect", "share", "discover"],
  authors: [{ name: "Social Void" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Social Void",
    description: "Enter the Void. Share your world.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Social Void",
    description: "Enter the Void. Share your world.",
  },
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
        </ThemeProvider>
      </body>
    </html>
  );
}
