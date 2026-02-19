'use client';

import Link from 'next/link';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  rank?: number;
}

export function BookCard({ book, rank }: BookCardProps) {
  return (
    <Link
      href={`/explorar/libro/${book.id}`}
      className="flex items-center gap-4 p-3 rounded-xl bg-surface-dark/40 border border-white/5 hover:border-white/10 transition-all active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <div className="w-16 h-20 rounded-lg overflow-hidden bg-surface-dark flex-shrink-0 relative">
        {book.coverUrl ? (
          <img alt={book.title} className="w-full h-full object-cover" src={book.coverUrl} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-icons-round text-2xl text-gray-600">auto_stories</span>
          </div>
        )}
        {rank !== undefined && (
          <div className="absolute top-1 left-1 bg-primary/90 text-white text-[8px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {rank}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{book.title}</p>
        <p className="text-xs text-gray-400 truncate">{book.author}</p>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <span className="material-icons-round text-xs text-orange-400">local_fire_department</span>
            <span className="text-[10px] text-gray-400">{book.totalFires}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons-round text-xs text-primary">auto_stories</span>
            <span className="text-[10px] text-gray-400">{book.totalIdeas} ideas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons-round text-xs text-yellow-300">lightbulb</span>
            <span className="text-[10px] text-gray-400">{book.totalIlluminated}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
