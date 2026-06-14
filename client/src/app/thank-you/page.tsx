'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const name = searchParams.get('name') || 'there';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Thank you, {name}!
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Your message has been received. Our team will get back to you as soon as possible.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
        >
          Back to Contact Us
        </Link>
        <Link
          href="/contacts"
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition-colors"
        >
          View All Contacts
        </Link>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
      <ThankYouContent />
    </Suspense>
  );
}
