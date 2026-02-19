import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');

  try {
    const supabase = createServerClient();

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select(`
        *,
        books!inner (title, author)
      `)
      .gt('save_count', 0)
      .order('save_count', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Trending ideas error:', error);
      return NextResponse.json({ error: 'Error al cargar trending' }, { status: 500 });
    }

    const mappedIdeas = (ideas || []).map((i: any) => ({
      id: i.id,
      bookId: i.book_id,
      title: i.title,
      ideaNumber: i.idea_number,
      keyPhrase: i.key_phrase,
      videoUrl: i.video_url,
      videoThumbnailUrl: i.video_thumbnail_url,
      durationSeconds: i.duration_seconds,
      saveCount: i.save_count,
      illuminatedCount: i.illuminated_count,
      bookTitle: i.books.title,
      bookAuthor: i.books.author,
    }));

    return NextResponse.json({ ideas: mappedIdeas });
  } catch (error) {
    console.error('Trending error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
