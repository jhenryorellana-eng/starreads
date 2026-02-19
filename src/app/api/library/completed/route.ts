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
      .from('book_progress')
      .select(`*, books (*)`)
      .eq('student_id', auth.sub)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Error al cargar' }, { status: 500 });
    }

    const items = (data || []).map((p: any) => ({
      id: p.id,
      bookId: p.book_id,
      ideasCompleted: p.ideas_completed,
      progressPercent: p.progress_percent,
      status: p.status,
      completedAt: p.completed_at,
      book: p.books ? {
        id: p.books.id,
        title: p.books.title,
        author: p.books.author,
        coverUrl: p.books.cover_url,
        totalIdeas: p.books.total_ideas,
      } : null,
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Completed error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
