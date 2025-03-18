/**
 * Dashboard Layout Component
 * 
 * Provides the standard layout structure for dashboard pages including
 * navigation, header, and content area.
 */

import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex gap-6 md:gap-10">
              <a href="/" className="flex items-center space-x-2">
                <span className="font-bold inline-block">AgriSmart</span>
              </a>
              <nav className="hidden gap-6 md:flex">
                <a href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground">
                  Dashboard
                </a>
                <a href="/marketplace" className="flex items-center text-sm font-medium text-muted-foreground">
                  Marketplace
                </a>
                <a href="/chat" className="flex items-center text-sm font-medium">
                  Messages
                </a>
                <a href="/community" className="flex items-center text-sm font-medium text-muted-foreground">
                  Community
                </a>
                <a href="/resources" className="flex items-center text-sm font-medium text-muted-foreground">
                  Resources
                </a>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <a href="/profile" className="rounded-full h-8 w-8 bg-muted flex items-center justify-center">
                <span className="sr-only">User profile</span>
                <span className="text-xs">U</span>
              </a>
            </div>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; {new Date().getFullYear()} AgriSmart. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
