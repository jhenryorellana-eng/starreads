import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const supabase = createServerClient();

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('book_id', params.id)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Ideas query error:', error);
      return NextResponse.json({ error: 'Error al cargar ideas' }, { status: 500 });
    }

    const mappedIdeas = (ideas || []).map((i: Record<string, unknown>) => ({
      id: i.id,
      bookId: i.book_id,
      title: i.title,
      ideaNumber: i.idea_number,
      keyPhrase: i.key_phrase,
      videoUrl: i.video_url,
      videoThumbnailUrl: i.video_thumbnail_url,
      durationSeconds: i.duration_seconds,
      intelligenceType: i.intelligence_type,
      illuminatedCount: i.illuminated_count,
      fireCount: i.fire_count,
      saveCount: i.save_count,
      viewCount: i.view_count,
      orderIndex: i.order_index,
    }));

    return NextResponse.json({ ideas: mappedIdeas });
  } catch (error) {
    console.error('Book ideas error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
