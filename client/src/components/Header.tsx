'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-green-600 focus:text-white focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg p-1" aria-label="RetailAgent Home">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <span className="text-white font-bold text-sm">RA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RetailAgent</span>
            </Link>
            <nav aria-label="Main navigation" className="flex gap-6">
              <Link
                href="/"
                aria-current={pathname === '/' ? 'page' : undefined}
                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1 ${
                  pathname === '/'
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Contact Us
              </Link>
              <Link
                href="/contacts"
                aria-current={pathname === '/contacts' ? 'page' : undefined}
                className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-2 py-1 ${
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
    </>
  );
}
