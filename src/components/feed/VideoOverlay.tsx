'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { FeedItem } from '@/types';

interface VideoOverlayProps {
  item: FeedItem;
}

export function VideoOverlay({ item }: VideoOverlayProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-[80%] pointer-events-auto">
      {/* Badge */}
      <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2 animate-pulse" />
        <span className="text-xs font-bold text-primary tracking-wide uppercase">
          Idea {item.ideaNumber} de {item.bookTotalIdeas}
        </span>
      </div>

      {/* Title */}
      <Link href={`/explorar/libro/${item.bookId}`}>
        <h1 className="text-2xl font-bold text-white mb-1 text-shadow leading-tight hover:text-primary transition-colors">
          {item.bookTitle}
        </h1>
      </Link>

      {/* Author */}
      <h2 className="text-base text-gray-300 font-medium mb-3 flex items-center gap-1 text-shadow">
        <span className="opacity-70">por</span> {item.bookAuthor}
        {item.bookAuthorVerified && (
          <span className="material-icons-round text-sm text-blue-400 ml-1">verified</span>
        )}
      </h2>

      {/* Description / Key Phrase */}
      <div className="text-sm text-white/90 leading-relaxed mb-2 text-shadow relative">
        <p className={expanded ? '' : 'line-clamp-2'}>
          {item.keyPhrase}
          {!expanded && item.keyPhrase.length > 100 && (
            <button
              onClick={() => setExpanded(true)}
              className="font-bold text-primary cursor-pointer hover:underline ml-1 inline"
            >
              más
            </button>
          )}
        </p>
        {expanded && (
          <button
            onClick={() => setExpanded(false)}
            className="font-bold text-primary cursor-pointer hover:underline mt-1 block"
          >
            menos
          </button>
        )}
      </div>

      {/* Audio Ticker */}
      {item.audioTrackName && (
        <div className="flex items-center gap-2 mt-2 opacity-80">
          <span className="material-icons-round text-sm text-white">music_note</span>
          <div className="text-xs text-white overflow-hidden w-40 whitespace-nowrap">
            <span className="inline-block">{item.audioTrackName}</span>
          </div>
        </div>
      )}
    </div>
  );
}
