'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import { BottomNav } from '@/components/layout/BottomNav';
import type { BookmarkItem } from '@/types';

export default function BibliotecaPage() {
  const { token } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookmarks = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/library/bookmarks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarks(data.items || []);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemoveBookmark = async (e: React.MouseEvent, ideaId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!token) return;
    try {
      await fetch(`/api/ideas/${ideaId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setBookmarks((prev) => prev.filter((b) => b.ideaId !== ideaId));
    } catch (err) {
      console.error('Remove bookmark error:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-panel pt-12 pb-4 px-5">
        <h1 className="text-2xl font-bold text-white">Biblioteca</h1>
        {bookmarks.length > 0 && (
          <p className="text-sm text-gray-400 mt-1">{bookmarks.length} video{bookmarks.length !== 1 ? 's' : ''} guardado{bookmarks.length !== 1 ? 's' : ''}</p>
        )}
      </div>

      <div className="px-5 py-6 pb-24">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-round text-5xl text-gray-600 mb-4">bookmark_border</span>
            <p className="text-sm text-gray-400">No tienes videos guardados</p>
            <p className="text-xs text-gray-500 mt-1">Guarda ideas desde el feed para verlas después</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <Link
                key={bm.ideaId}
                href={`/?mode=bookmarks&startId=${bm.ideaId}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark/40 border border-white/5 hover:border-primary/30 transition-all group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-dark flex-shrink-0 relative">
                  {bm.idea?.videoThumbnailUrl ? (
                    <img alt="" className="w-full h-full object-cover" src={bm.idea.videoThumbnailUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons-round text-gray-600">play_circle</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <span className="material-icons-round text-white text-lg">play_arrow</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white line-clamp-1">{bm.idea?.keyPhrase || bm.idea?.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{bm.bookTitle} • {bm.bookAuthor}</p>
                </div>
                <button
                  onClick={(e) => handleRemoveBookmark(e, bm.ideaId)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                >
                  <span className="material-icons-round text-gray-500 text-lg">close</span>
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
