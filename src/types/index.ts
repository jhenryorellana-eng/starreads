// Student types
export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  avatarUrl?: string;
  currentStreak: number;
  maxStreak: number;
  lastActivityDate?: string;
}

// Book types
export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorVerified: boolean;
  description?: string;
  coverUrl?: string;
  averageRating: number;
  totalIdeas: number;
  totalIlluminated: number;
  totalFires: number;
  totalSaves: number;
  totalDuration?: number;
  tags: string[];
  isPublished: boolean;
}

// Idea (video) types
export interface Idea {
  id: string;
  bookId: string;
  title: string;
  ideaNumber: number;
  keyPhrase: string;
  videoUrl: string;
  videoThumbnailUrl?: string;
  durationSeconds: number;
  audioTrackName?: string;
  intelligenceType: IntelligenceType;
  illuminatedCount: number;
  fireCount: number;
  saveCount: number;
  shareCount: number;
  viewCount: number;
  orderIndex: number;
}

// Feed item combines idea with book info
export interface FeedItem extends Idea {
  bookTitle: string;
  bookAuthor: string;
  bookAuthorVerified: boolean;
  bookCoverUrl?: string;
  bookTotalIdeas: number;
  // User-specific state
  hasIlluminated?: boolean;
  hasFired?: boolean;
  hasBookmarked?: boolean;
  isViewed?: boolean;
}

// Intelligence types
export type IntelligenceType =
  | 'mental'
  | 'emocional'
  | 'social'
  | 'financiera'
  | 'creativa'
  | 'fisica'
  | 'espiritual';

export interface Intelligence {
  code: IntelligenceType;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Reactions
export type ReactionType = 'illuminated' | 'fire';

// Book progress
export interface BookProgress {
  id: string;
  bookId: string;
  ideasViewed: number;
  ideasCompleted: number;
  progressPercent: number;
  status: 'reading' | 'completed';
  startedAt: string;
  completedAt?: string;
  lastViewedAt: string;
  // Joined data
  book?: Book;
}

// Bookmark
export interface BookmarkItem {
  ideaId: string;
  createdAt: string;
  idea?: Idea;
  bookTitle?: string;
  bookAuthor?: string;
}

// Playlist
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverColor: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlaylistItem {
  id: string;
  playlistId: string;
  ideaId: string;
  orderIndex: number;
  idea?: Idea;
}

// Collection (curated)
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  gradientFrom: string;
  gradientTo: string;
  isFeatured: boolean;
  bookCount?: number;
}

// Reflection
export interface Reflection {
  id: string;
  ideaId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  ideaTitle?: string;
  bookTitle?: string;
}

// Student intelligence profile
export interface StudentIntelligence {
  intelligenceCode: IntelligenceType;
  score: number;
  ideasConsumed: number;
}

// Profile stats
export interface ProfileStats {
  totalBooksExplored: number;
  totalIdeasDiscovered: number;
  currentStreak: number;
  maxStreak: number;
  intelligences: StudentIntelligence[];
}

// Search
export interface SearchResult {
  books: Book[];
  ideas: Idea[];
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// WebView Bridge types
export interface SuperAppMessage {
  type: 'NOTIFICATION' | 'LOGOUT' | 'NAVIGATE' | 'CLOSE' | 'REFRESH';
  payload?: Record<string, unknown>;
}

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}
