'use client';

import { useEffect, useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE = `${API_URL}/api/v1`;

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

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ContactsListPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterVerified, setFilterVerified] = useState<string>('');
  const [announcement, setAnnouncement] = useState('');

  const fetchContacts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (filterVerified) params.set('verified', filterVerified);

      const response = await fetch(`${API_BASE}/contacts?${params}`);
      if (!response.ok) throw new Error('Failed to fetch contacts');
      const result = await response.json();
      setContacts(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [search, filterVerified]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleVerify = async (id: number, name: string) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      });
      if (!response.ok) throw new Error('Failed to verify contact');
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isVerified: true } : c))
      );
      setAnnouncement(`${name} has been marked as verified`);
    } catch (err) {
      setAnnouncement(`Error: ${err instanceof Error ? err.message : 'Failed to verify contact'}`);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contact');
      setContacts((prev) => prev.filter((c) => c.id !== id));
      setMeta((prev) => ({ ...prev, total: prev.total - 1 }));
      setAnnouncement(`${name} has been deleted`);
    } catch (err) {
      setAnnouncement(`Error: ${err instanceof Error ? err.message : 'Failed to delete contact'}`);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContacts(1);
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" aria-busy="true" aria-label="Loading contacts">
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
        <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => { setError(''); fetchContacts(); }}
            className="mt-2 text-sm text-red-700 underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <span className="text-sm text-gray-500" aria-live="polite">
          {meta.total} contact{meta.total !== 1 ? 's' : ''} total
        </span>
      </div>

      {/* Search and Filter Bar */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-8" role="search" aria-label="Search contacts">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search contacts</label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="filter-verified" className="sr-only">Filter by verification status</label>
          <select
            id="filter-verified"
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">All contacts</option>
            <option value="true">Verified only</option>
            <option value="false">Unverified only</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>

      {contacts.length === 0 ? (
        <div className="text-center py-16" role="status">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg">No contacts found</p>
          <p className="text-gray-400 text-sm mt-1">
            {search || filterVerified ? 'Try adjusting your search or filters.' : 'Contacts submitted via the form will appear here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4" role="list" aria-label="Contacts list">
            {contacts.map((contact) => (
              <article
                key={contact.id}
                role="listitem"
                aria-label={`${contact.firstName} ${contact.lastName}${contact.isVerified ? ', verified' : ''}`}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-green-500"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-gray-900 truncate">
                        {contact.firstName} {contact.lastName}
                      </h2>
                      {contact.isVerified && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800" aria-label="Verified contact">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600">
                      <span>{contact.email}</span>
                      <span className="hidden sm:inline" aria-hidden="true">•</span>
                      <span>{contact.phone}</span>
                    </div>
                    {contact.note && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">{contact.note}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      <time dateTime={contact.createdAt}>
                        {new Date(contact.createdAt).toLocaleDateString('en-AU', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0" role="group" aria-label={`Actions for ${contact.firstName} ${contact.lastName}`}>
                    <button
                      onClick={() => handleVerify(contact.id, `${contact.firstName} ${contact.lastName}`)}
                      disabled={contact.isVerified}
                      aria-label={contact.isVerified ? `${contact.firstName} is already verified` : `Mark ${contact.firstName} ${contact.lastName} as verified`}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                        contact.isVerified
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 cursor-pointer'
                      }`}
                    >
                      {contact.isVerified ? 'Verified' : 'Mark as verified'}
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`)}
                      aria-label={`Delete ${contact.firstName} ${contact.lastName}`}
                      className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => fetchContacts(meta.page - 1)}
                disabled={meta.page <= 1}
                aria-label="Previous page"
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                ← Previous
              </button>
              <span className="text-sm text-gray-600" aria-current="page">
                Page {meta.page} of {meta.totalPages}
              </span>
              <button
                onClick={() => fetchContacts(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                aria-label="Next page"
                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
