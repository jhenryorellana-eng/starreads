import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { query } = await request.json();

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ books: [] });
    }

    const supabase = createServerClient();
    const searchTerm = `%${query.trim()}%`;

    // Search books by title or author
    const { data: books, error } = await supabase
      .from('books')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.${searchTerm},author.ilike.${searchTerm}`)
      .limit(20);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Error en búsqueda' }, { status: 500 });
    }

    const mappedBooks = (books || []).map((b: Record<string, unknown>) => ({
      id: b.id,
      title: b.title,
      slug: b.slug,
      author: b.author,
      authorVerified: b.author_verified,
      description: b.description,
      coverUrl: b.cover_url,
      averageRating: Number(b.average_rating),
      totalIdeas: b.total_ideas,
      totalIlluminated: b.total_illuminated,
      totalFires: b.total_fires,
      totalSaves: b.total_saves,
      tags: b.tags || [],
      isPublished: b.is_published,
    }));

    return NextResponse.json({ books: mappedBooks });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
