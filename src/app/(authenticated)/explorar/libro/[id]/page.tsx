'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth-store';
import type { Book, Idea, BookProgress } from '@/types';

export default function BookDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuthStore();
  const [book, setBook] = useState<Book | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [progress, setProgress] = useState<BookProgress | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fromIdeaId = searchParams.get('fromIdea');

  useEffect(() => {
    if (!token || !id) return;

    const fetchBookData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };

        const [bookRes, ideasRes] = await Promise.all([
          fetch(`/api/books/${id}`, { headers }),
          fetch(`/api/books/${id}/ideas`, { headers }),
        ]);

        if (bookRes.ok) {
          const data = await bookRes.json();
          setBook(data.book);
          setProgress(data.progress || null);
          setViewedIds(new Set(data.viewedIdeaIds || []));
          setSimilarBooks(data.similarBooks || []);
        }

        if (ideasRes.ok) {
          const data = await ideasRes.json();
          setIdeas(data.ideas || []);
        }
      } catch (err) {
        console.error('Error fetching book:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookData();
  }, [token, id]);

  if (isLoading || !book) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nextIdea = ideas.find((i) => !viewedIds.has(i.id));

  return (
    <div className="min-h-screen bg-background-dark pb-24">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 pt-12 pb-3 bg-gradient-to-b from-background-dark to-transparent">
        <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-icon flex items-center justify-center">
          <span className="material-icons-round text-white">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full glass-icon flex items-center justify-center">
            <span className="material-icons-round text-white">share</span>
          </button>
          <button className="w-10 h-10 rounded-full glass-icon flex items-center justify-center">
            <span className="material-icons-round text-white">favorite_border</span>
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="relative h-[420px] overflow-hidden">
        {book.coverUrl ? (
          <img alt={book.title} className="w-full h-full object-cover" src={book.coverUrl} />
        ) : (
          <div className="w-full h-full bg-surface-dark flex items-center justify-center">
            <span className="material-icons-round text-8xl text-gray-600">auto_stories</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark/40 via-transparent to-background-dark" />

        {/* Book info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 text-shadow-lg">{book.title}</h1>
          <p className="text-base text-gray-300 mb-3 text-shadow">{book.author}</p>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="material-icons-round text-sm text-orange-400">local_fire_department</span>
              <span className="text-sm text-white font-semibold">{book.totalFires}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-icons-round text-sm text-yellow-300">lightbulb</span>
              <span className="text-sm text-gray-300">{book.totalIlluminated}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="material-icons-round text-sm text-gray-400">schedule</span>
              <span className="text-sm text-gray-300">
                {Math.ceil((book.totalDuration || book.totalIdeas * 45) / 60)} min
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="sticky top-0 z-30 px-5 py-3 glass-panel">
        <button
          onClick={() => {
            if (nextIdea) router.push(`/?ideaId=${nextIdea.id}`);
            else if (ideas.length > 0) router.push(`/?ideaId=${ideas[0].id}`);
          }}
          className="w-full btn-gradient py-4 rounded-xl flex items-center justify-center gap-3"
        >
          <span className="material-icons-round">play_arrow</span>
          <span className="font-bold">
            {progress && progress.progressPercent > 0
              ? `CONTINUAR`
              : 'EMPEZAR DESDE IDEA 1'}
          </span>
          {progress && (
            <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {progress.progressPercent}%
            </span>
          )}
        </button>
      </div>

      {/* Description */}
      {book.description && (
        <div className="px-5 py-4">
          <p className="text-sm text-gray-300 leading-relaxed">{book.description}</p>
        </div>
      )}

      {/* Ideas Grid */}
      <div className="px-5 py-4">
        <h2 className="text-lg font-bold text-white mb-4">Ideas</h2>

        <div className="grid grid-cols-4 gap-3">
          {ideas.map((idea, index) => {
            const isViewed = viewedIds.has(idea.id);
            const isCurrent = fromIdeaId ? idea.id === fromIdeaId : index === 0;

            return (
              <Link
                key={idea.id}
                href={`/?ideaId=${idea.id}`}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${
                  isCurrent
                    ? 'border-2 border-primary shadow-[0_0_15px_-3px_rgba(220,121,168,0.5)] bg-surface-dark'
                    : isViewed
                    ? 'border border-white/5 bg-surface-dark/50'
                    : 'border border-white/5 bg-background-dark/50'
                }`}
              >
                {isViewed ? (
                  <span className="material-icons-round text-green-400 text-xl">check_circle</span>
                ) : (
                  <span className={`font-extrabold text-lg ${isCurrent ? 'text-white' : 'text-gray-500 font-bold'}`}>
                    {String(idea.ideaNumber).padStart(2, '0')}
                  </span>
                )}
                {isCurrent && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Similar Books */}
      {similarBooks.length > 0 && (
        <div className="px-5 py-4">
          <h2 className="text-lg font-bold text-white mb-4">Libros Similares</h2>
          <div className="flex overflow-x-auto gap-4 no-scrollbar -mx-5 px-5 snap-x">
            {similarBooks.map((sb) => (
              <Link
                key={sb.id}
                href={`/explorar/libro/${sb.id}`}
                className="flex-none w-[120px] snap-center group"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-surface-dark mb-2 border border-white/5 transition-transform group-hover:-translate-y-1">
                  {sb.coverUrl ? (
                    <img alt={sb.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" src={sb.coverUrl} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons-round text-3xl text-gray-600">auto_stories</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-semibold text-white line-clamp-2">{sb.title}</p>
                <p className="text-[10px] text-gray-400 truncate">{sb.author}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
