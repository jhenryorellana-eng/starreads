import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('bookmarks')
      .select(`*, ideas (*, books (title, author))`)
      .eq('student_id', auth.sub)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
    }

    const items = (data || []).map((b: any) => ({
      ideaId: b.idea_id,
      createdAt: b.created_at,
      idea: b.ideas ? {
        id: b.ideas.id,
        title: b.ideas.title,
        keyPhrase: b.ideas.key_phrase,
        videoThumbnailUrl: b.ideas.video_thumbnail_url,
        durationSeconds: b.ideas.duration_seconds,
      } : null,
      bookTitle: b.ideas?.books?.title,
      bookAuthor: b.ideas?.books?.author,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Bookmarks error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
