import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'normal';
  const limit = parseInt(searchParams.get('limit') || '10');
  const intelligence = searchParams.get('intelligence');
  const startFromIdea = searchParams.get('startFromIdea');
  const excludeParam = searchParams.get('exclude');
  const excludeIds = excludeParam ? excludeParam.split(',').filter(Boolean) : [];

  try {
    const supabase = createServerClient();

    // === MODO LIBRO ===
    if (mode === 'book' && startFromIdea) {
      const { data: targetIdea } = await supabase
        .from('ideas')
        .select('book_id, order_index')
        .eq('id', startFromIdea)
        .single();

      if (!targetIdea) {
        return NextResponse.json({ items: [], nextCursor: null });
      }

      const { data: ideas, error } = await supabase
        .from('ideas')
        .select(`*, books!inner (id, title, author, author_verified, cover_url, total_ideas)`)
        .eq('book_id', targetIdea.book_id)
        .gte('order_index', targetIdea.order_index)
        .order('order_index', { ascending: true });

      if (error || !ideas) {
        return NextResponse.json({ items: [], nextCursor: null });
      }

      const enriched = await enrichItems(supabase, ideas, auth.sub);
      return NextResponse.json({ items: enriched, nextCursor: null, bookComplete: true });
    }

    // === MODO BOOKMARKS ===
    if (mode === 'bookmarks') {
      const { data: bookmarkRows } = await supabase
        .from('bookmarks')
        .select('idea_id')
        .eq('student_id', auth.sub);

      const bookmarkedIds = (bookmarkRows || []).map((b: { idea_id: string }) => b.idea_id);
      if (bookmarkedIds.length === 0) {
        return NextResponse.json({ items: [], reset: false });
      }

      const availableIds = bookmarkedIds.filter((id: string) => !excludeIds.includes(id));

      if (availableIds.length === 0) {
        return NextResponse.json({ items: [], reset: true });
      }

      const selectedIds = shuffle(availableIds).slice(0, limit);

      const { data: ideas } = await supabase
        .from('ideas')
        .select(`*, books!inner (id, title, author, author_verified, cover_url, total_ideas)`)
        .in('id', selectedIds);

      const shuffled = shuffle(ideas || []);
      const enriched = await enrichItems(supabase, shuffled, auth.sub);
      return NextResponse.json({ items: enriched, hasMore: true });
    }

    // === MODO NORMAL / INTELLIGENCE ===
    // 1. Obtener IDs completados por el usuario
    const { data: completedRows } = await supabase
      .from('idea_views')
      .select('idea_id')
      .eq('student_id', auth.sub)
      .eq('completed', true);

    const completedIds = new Set((completedRows || []).map((v: { idea_id: string }) => v.idea_id));

    // 2. Obtener TODAS las ideas candidatas (publicadas)
    let candidateQuery = supabase
      .from('ideas')
      .select('id, books!inner(is_published)')
      .eq('books.is_published', true);

    if (intelligence) {
      candidateQuery = candidateQuery.eq('intelligence_type', intelligence);
    }

    const { data: allIdeas } = await candidateQuery;

    const allCandidateIds = (allIdeas || []).map((i: { id: string }) => i.id);

    // 3. Separar en no-completados y completados, excluyendo los ya mostrados
    const notCompletedAvailable = allCandidateIds.filter(
      (id: string) => !completedIds.has(id) && !excludeIds.includes(id)
    );
    const completedAvailable = allCandidateIds.filter(
      (id: string) => completedIds.has(id) && !excludeIds.includes(id)
    );

    // 4. Priorizar no-completados, luego completados
    let selectedIds: string[] = [];
    const shuffledNotCompleted = shuffle(notCompletedAvailable);
    selectedIds.push(...shuffledNotCompleted.slice(0, limit));

    if (selectedIds.length < limit) {
      const remaining = limit - selectedIds.length;
      const shuffledCompleted = shuffle(completedAvailable);
      selectedIds.push(...shuffledCompleted.slice(0, remaining));
    }

    // 5. Si no hay nada disponible → reset
    if (selectedIds.length === 0) {
      return NextResponse.json({ items: [], reset: true, hasMore: true });
    }

    // 6. Fetch ideas completas
    const { data: ideas } = await supabase
      .from('ideas')
      .select(`*, books!inner (id, title, author, author_verified, cover_url, total_ideas)`)
      .in('id', selectedIds);

    // 7. Mantener el orden shuffled (el .in() no garantiza orden)
    const idOrder = new Map(selectedIds.map((id, idx) => [id, idx]));
    const sortedIdeas = (ideas || []).sort(
      (a: any, b: any) => (idOrder.get(a.id) || 0) - (idOrder.get(b.id) || 0)
    );

    const enriched = await enrichItems(supabase, sortedIdeas, auth.sub);
    return NextResponse.json({ items: enriched, hasMore: true });

  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

async function enrichItems(supabase: any, ideas: any[], studentId: string) {
  if (!ideas || ideas.length === 0) return [];

  // Contar ideas reales por libro
  const bookIds = [...new Set(ideas.map((i: any) => i.books.id))];
  const { data: ideaCounts } = await supabase
    .from('ideas')
    .select('book_id')
    .in('book_id', bookIds);

  const bookIdeaCountMap = new Map<string, number>();
  (ideaCounts || []).forEach((row: { book_id: string }) => {
    bookIdeaCountMap.set(row.book_id, (bookIdeaCountMap.get(row.book_id) || 0) + 1);
  });

  // User state
  const ideaIds = ideas.map((i: { id: string }) => i.id);

  const [reactionsResult, bookmarksResult, viewsResult] = await Promise.all([
    supabase
      .from('reactions')
      .select('idea_id, type')
      .eq('student_id', studentId)
      .in('idea_id', ideaIds),
    supabase
      .from('bookmarks')
      .select('idea_id')
      .eq('student_id', studentId)
      .in('idea_id', ideaIds),
    supabase
      .from('idea_views')
      .select('idea_id')
      .eq('student_id', studentId)
      .in('idea_id', ideaIds),
  ]);

  const userReactions = new Map<string, Set<string>>();
  (reactionsResult.data || []).forEach((r: { idea_id: string; type: string }) => {
    if (!userReactions.has(r.idea_id)) userReactions.set(r.idea_id, new Set());
    userReactions.get(r.idea_id)!.add(r.type);
  });

  const userBookmarks = new Set(
    (bookmarksResult.data || []).map((b: { idea_id: string }) => b.idea_id)
  );
  const userViews = new Set(
    (viewsResult.data || []).map((v: { idea_id: string }) => v.idea_id)
  );

  return ideas.map((idea: any) => ({
    id: idea.id,
    bookId: idea.books.id,
    title: idea.title,
    ideaNumber: idea.idea_number,
    keyPhrase: idea.key_phrase,
    videoUrl: idea.video_url,
    videoThumbnailUrl: idea.video_thumbnail_url,
    durationSeconds: idea.duration_seconds,
    audioTrackName: idea.audio_track_name,
    intelligenceType: idea.intelligence_type,
    illuminatedCount: idea.illuminated_count,
    fireCount: idea.fire_count,
    saveCount: idea.save_count,
    shareCount: idea.share_count,
    viewCount: idea.view_count,
    orderIndex: idea.order_index,
    bookTitle: idea.books.title,
    bookAuthor: idea.books.author,
    bookAuthorVerified: idea.books.author_verified,
    bookCoverUrl: idea.books.cover_url,
    bookTotalIdeas: bookIdeaCountMap.get(idea.books.id) || 0,
    hasIlluminated: userReactions.get(idea.id)?.has('illuminated') || false,
    hasFired: userReactions.get(idea.id)?.has('fire') || false,
    hasBookmarked: userBookmarks.has(idea.id),
    isViewed: userViews.has(idea.id),
  }));
}
