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

    // Get book
    const { data: book, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error || !book) {
      return NextResponse.json({ error: 'Libro no encontrado' }, { status: 404 });
    }

    // Calcular stats dinámicamente desde la tabla ideas
    const { data: bookIdeas } = await supabase
      .from('ideas')
      .select('illuminated_count, fire_count, save_count, duration_seconds')
      .eq('book_id', params.id);

    const ideaCount = (bookIdeas || []).length;
    const totalIlluminated = (bookIdeas || []).reduce((sum: number, i: any) => sum + (i.illuminated_count || 0), 0);
    const totalFires = (bookIdeas || []).reduce((sum: number, i: any) => sum + (i.fire_count || 0), 0);
    const totalSaves = (bookIdeas || []).reduce((sum: number, i: any) => sum + (i.save_count || 0), 0);
    const totalDuration = (bookIdeas || []).reduce((sum: number, i: any) => sum + (i.duration_seconds || 0), 0);

    // Get user progress for this book
    const { data: progress } = await supabase
      .from('book_progress')
      .select('*')
      .eq('student_id', auth.sub)
      .eq('book_id', params.id)
      .single();

    // Get viewed idea IDs (solo completados al 50%+)
    const { data: views } = await supabase
      .from('idea_views')
      .select('idea_id')
      .eq('student_id', auth.sub)
      .eq('completed', true);

    const viewedIdeaIds = (views || []).map((v: { idea_id: string }) => v.idea_id);

    // Get similar books (same tags or random published)
    const { data: similarBooks } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .neq('id', params.id)
      .limit(5);

    return NextResponse.json({
      book: {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        authorVerified: book.author_verified,
        description: book.description,
        coverUrl: book.cover_url,
        averageRating: Number(book.average_rating),
        totalIdeas: ideaCount,
        totalIlluminated,
        totalFires,
        totalSaves,
        totalDuration,
        tags: book.tags || [],
        isPublished: book.is_published,
      },
      progress: progress
        ? {
            id: progress.id,
            bookId: progress.book_id,
            ideasCompleted: progress.ideas_completed,
            progressPercent: progress.progress_percent,
            status: progress.status,
            lastViewedAt: progress.last_viewed_at,
          }
        : null,
      viewedIdeaIds,
      similarBooks: await (async () => {
        const simIds = (similarBooks || []).map((b: any) => b.id);
        const { data: simIdeas } = simIds.length > 0
          ? await supabase.from('ideas').select('book_id').in('book_id', simIds)
          : { data: [] };
        const simCountMap = new Map<string, number>();
        (simIdeas || []).forEach((r: { book_id: string }) => {
          simCountMap.set(r.book_id, (simCountMap.get(r.book_id) || 0) + 1);
        });
        return (similarBooks || []).map((b: Record<string, unknown>) => ({
          id: b.id,
          title: b.title,
          slug: b.slug,
          author: b.author,
          coverUrl: b.cover_url,
          totalIdeas: simCountMap.get(b.id as string) || 0,
          averageRating: Number(b.average_rating),
        }));
      })(),
    });
  } catch (error) {
    console.error('Book detail error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
