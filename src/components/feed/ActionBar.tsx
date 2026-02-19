'use client';

import { useState } from 'react';
import type { FeedItem } from '@/types';

interface ActionBarProps {
  item: FeedItem;
  onReact: (type: 'illuminated' | 'fire') => void;
  onBookmark: () => void;
  onShare: () => void;
  onViewBook: () => void;
}

export function ActionBar({ item, onReact, onBookmark, onShare, onViewBook }: ActionBarProps) {
  const [illuminateAnim, setIlluminateAnim] = useState(false);
  const [fireAnim, setFireAnim] = useState(false);

  const handleIlluminate = () => {
    setIlluminateAnim(true);
    onReact('illuminated');
    setTimeout(() => setIlluminateAnim(false), 400);
  };

  const handleFire = () => {
    setFireAnim(true);
    onReact('fire');
    setTimeout(() => setFireAnim(false), 400);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Book Avatar */}
      <div className="flex flex-col items-center gap-1 group cursor-pointer" onClick={onViewBook}>
        <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 relative overflow-hidden transition-transform group-active:scale-95">
          {item.bookCoverUrl ? (
            <img
              alt={item.bookTitle}
              className="w-full h-full object-cover rounded-full"
              src={item.bookCoverUrl}
            />
          ) : (
            <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center">
              <span className="material-icons-round text-primary text-lg">auto_stories</span>
            </div>
          )}
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-primary rounded-full w-4 h-4 flex items-center justify-center border border-black">
            <span className="material-icons-round text-[10px] text-white">add</span>
          </div>
        </div>
      </div>

      {/* Me Iluminó */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleIlluminate}
          className={`w-12 h-12 rounded-full glass-icon flex items-center justify-center ${
            illuminateAnim ? 'animate-scale-bounce' : ''
          }`}
        >
          <span
            className={`material-icons-round text-3xl ${
              item.hasIlluminated
                ? 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.5)]'
                : 'text-white'
            }`}
          >
            lightbulb
          </span>
        </button>
        <span className="text-xs font-semibold text-white/90 text-shadow">
          {formatCount(item.illuminatedCount)}
        </span>
      </div>

      {/* Fire */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={handleFire}
          className={`w-12 h-12 rounded-full glass-icon flex items-center justify-center group ${
            fireAnim ? 'animate-scale-bounce' : ''
          }`}
        >
          <span
            className={`material-icons-round text-3xl transition-colors ${
              item.hasFired ? 'text-primary' : 'text-white group-active:text-primary'
            }`}
          >
            local_fire_department
          </span>
        </button>
        <span className="text-xs font-semibold text-white/90 text-shadow">
          {formatCount(item.fireCount)}
        </span>
      </div>

      {/* Bookmark */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onBookmark}
          className="w-12 h-12 rounded-full glass-icon flex items-center justify-center"
        >
          <span
            className={`material-icons-round text-3xl ${
              item.hasBookmarked ? 'text-primary' : 'text-white'
            }`}
          >
            {item.hasBookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
        <span className="text-xs font-semibold text-white/90 text-shadow">
          {formatCount(item.saveCount)}
        </span>
      </div>

      {/* Share */}
      <div className="flex flex-col items-center gap-1">
        <button
          onClick={onShare}
          className="w-12 h-12 rounded-full glass-icon flex items-center justify-center"
        >
          <span className="material-icons-round text-3xl text-white -rotate-45 ml-1">
            link
          </span>
        </button>
        <span className="text-xs font-semibold text-white/90 text-shadow">Share</span>
      </div>

      {/* Vinyl Spinner */}
      <div className="mt-2 animate-spin-slow">
        <div className="w-10 h-10 rounded-full bg-gray-900 border-[3px] border-gray-800 flex items-center justify-center overflow-hidden relative">
          {item.bookCoverUrl ? (
            <img
              alt="Audio"
              className="w-6 h-6 rounded-full object-cover opacity-80"
              src={item.bookCoverUrl}
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-surface-dark" />
          )}
        </div>
      </div>
    </div>
  );
}
