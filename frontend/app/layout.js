'use client'

import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/lib/auth-context'
import { SocketProvider } from '@/lib/socket-context'
import { useState } from 'react'

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }))

  return (
    <html lang="en">
      <head>
        <title>Y-Ultimate Management Platform</title>
        <meta name="description" content="Ultimate Frisbee Tournament and Coaching Management Platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <SocketProvider>
              <div className="relative">
                {/* Background Pattern */}
                <div className="fixed inset-0 bg-hero-pattern opacity-5 pointer-events-none" />
                
                {/* Main Content */}
                <div className="relative z-10">
                  {children}
                </div>
                
                {/* Toast Notifications */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    },
                    success: {
                      iconTheme: {
                        primary: '#22c55e',
                        secondary: '#ffffff',
                      },
                    },
                    error: {
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#ffffff',
                      },
                    },
                  }}
                />
              </div>
            </SocketProvider>
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}