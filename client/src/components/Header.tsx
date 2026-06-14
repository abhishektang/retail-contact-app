'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">OA</span>
            </div>
            <span className="text-xl font-bold text-gray-900">OpenAgent</span>
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/'
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Contact Us
            </Link>
            <Link
              href="/contacts"
              className={`text-sm font-medium transition-colors ${
                pathname === '/contacts'
                  ? 'text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Contacts
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
