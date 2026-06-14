'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  note: string | null;
  isVerified: boolean;
  createdAt: string;
}

export default function ContactsListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_URL}/contacts`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleVerify = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      });
      if (!response.ok) throw new Error('Failed to verify contact');
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isVerified: true } : c))
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to verify contact');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      const response = await fetch(`${API_URL}/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete contact');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => { setError(''); setLoading(true); fetchContacts(); }}
            className="mt-2 text-sm text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <span className="text-sm text-gray-500">
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No contacts yet</p>
          <p className="text-gray-400 text-sm mt-1">Contacts submitted via the form will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {contact.firstName} {contact.lastName}
                    </h3>
                    {contact.isVerified && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                    <span>{contact.email}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{contact.phone}</span>
                  </div>
                  {contact.note && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">{contact.note}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(contact.createdAt).toLocaleDateString('en-AU', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleVerify(contact.id)}
                    disabled={contact.isVerified}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      contact.isVerified
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                    }`}
                  >
                    {contact.isVerified ? 'Verified' : 'Mark as verified'}
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
