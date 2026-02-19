import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(request.url);
  const sort = searchParams.get('sort') || 'trending';
  const intelligence = searchParams.get('intelligence');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const supabase = createServerClient();

    let query = supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .limit(limit);

    if (intelligence) {
      // Filter books that have ideas with this intelligence type
      const { data: bookIds } = await supabase
        .from('ideas')
        .select('book_id')
        .eq('intelligence_type', intelligence);

      if (bookIds && bookIds.length > 0) {
        const uniqueIds = [...new Set(bookIds.map((b: { book_id: string }) => b.book_id))];
        query = query.in('id', uniqueIds);
      }
    }

    if (sort === 'trending') {
      query = query.order('created_at', { ascending: false });
    } else if (sort === 'rating') {
      query = query.order('average_rating', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data: books, error } = await query;

    if (error) {
      console.error('Books query error:', error);
      return NextResponse.json({ error: 'Error al cargar libros' }, { status: 500 });
    }

    // Calcular stats dinámicamente desde la tabla ideas
    const bookIds = (books || []).map((b: any) => b.id);
    const { data: ideasData } = await supabase
      .from('ideas')
      .select('book_id, illuminated_count, fire_count, save_count')
      .in('book_id', bookIds);

    const bookStatsMap = new Map<string, { count: number; illuminated: number; fires: number; saves: number }>();
    (ideasData || []).forEach((idea: any) => {
      const stats = bookStatsMap.get(idea.book_id) || { count: 0, illuminated: 0, fires: 0, saves: 0 };
      stats.count++;
      stats.illuminated += idea.illuminated_count || 0;
      stats.fires += idea.fire_count || 0;
      stats.saves += idea.save_count || 0;
      bookStatsMap.set(idea.book_id, stats);
    });

    const mappedBooks = (books || []).map((b: Record<string, unknown>) => {
      const stats = bookStatsMap.get(b.id as string) || { count: 0, illuminated: 0, fires: 0, saves: 0 };
      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        authorVerified: b.author_verified,
        description: b.description,
        coverUrl: b.cover_url,
        averageRating: Number(b.average_rating),
        totalIdeas: stats.count,
        totalIlluminated: stats.illuminated,
        totalFires: stats.fires,
        totalSaves: stats.saves,
        tags: b.tags || [],
        isPublished: b.is_published,
      };
    });

    // Ordenar por suma de fuegos + focos (trending dinámico)
    if (sort === 'trending') {
      mappedBooks.sort((a: { totalFires: number; totalIlluminated: number }, b: { totalFires: number; totalIlluminated: number }) =>
        (b.totalFires + b.totalIlluminated) - (a.totalFires + a.totalIlluminated)
      );
    }

    return NextResponse.json({ books: mappedBooks });
  } catch (error) {
    console.error('Books error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
