// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calendly Clone - Schedule Meetings',
  description: 'Easy scheduling for meetings and appointments',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
              <div className="flex justify-between h-14 sm:h-16">
                <div className="flex items-center space-x-2 sm:space-x-8">
                  <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <span className="text-base sm:text-xl font-semibold text-gray-900">Calendly</span>
                  </Link>

                  <div className="flex space-x-0.5 sm:space-x-1">
                    <Link
                      href="/"
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Events
                    </Link>
                    <Link
                      href="/meetings"
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Meetings
                    </Link>
                    <Link
                      href="/availability"
                      className="px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Availability
                    </Link>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-100">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden xs:inline">John</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 hidden sm:inline">Doe</span>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}