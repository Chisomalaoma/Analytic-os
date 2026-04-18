'use client'

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from 'nextjs-toploader';
import AuthProvider from '@/components/providers/AuthProvider';
import { ZendeskProvider } from '@/components/providers/ZendeskProvider';
import { CurrencyProvider } from '@/contexts/CurrencyContext';
import SessionTimeout from '@/components/SessionTimeout';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";
import Head from 'next/head';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CurrencyProvider>
              <ZendeskProvider>
                <NextTopLoader color="#4459FF" showSpinner={false} />
                <SessionTimeout />
                {children}
              </ZendeskProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
