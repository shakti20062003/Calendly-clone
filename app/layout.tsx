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
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center space-x-8">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold text-gray-900">Calendly</span>
                  </Link>
                  
                  <div className="hidden md:flex space-x-1">
                    <Link 
                      href="/" 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Event Types
                    </Link>
                    <Link 
                      href="/meetings" 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Meetings
                    </Link>
                    <Link 
                      href="/availability" 
                      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                    >
                      Availability
                    </Link>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">John Doe</span>
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