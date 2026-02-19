import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromRequest, unauthorizedResponse } from '@/lib/auth';
import { createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const supabase = createServerClient();

    const [booksRes, ideasRes, allIdeasRes, completedViewsRes] = await Promise.all([
      supabase
        .from('book_progress')
        .select('id', { count: 'exact' })
        .eq('student_id', auth.sub),
      supabase
        .from('idea_views')
        .select('id', { count: 'exact' })
        .eq('student_id', auth.sub)
        .eq('completed', true),
      // Total de ideas por tipo de inteligencia (solo libros publicados)
      supabase
        .from('ideas')
        .select('intelligence_type, books!inner(is_published)')
        .eq('books.is_published', true),
      // Ideas completadas por el usuario
      supabase
        .from('idea_views')
        .select('idea_id, ideas!inner(intelligence_type)')
        .eq('student_id', auth.sub)
        .eq('completed', true),
    ]);

    // Contar total de ideas por tipo de inteligencia
    const totalByType = new Map<string, number>();
    (allIdeasRes.data || []).forEach((idea: Record<string, unknown>) => {
      const type = idea.intelligence_type as string;
      if (type) {
        totalByType.set(type, (totalByType.get(type) || 0) + 1);
      }
    });

    // Contar completadas por tipo de inteligencia
    const completedByType = new Map<string, number>();
    (completedViewsRes.data || []).forEach((view: Record<string, unknown>) => {
      const ideas = view.ideas as Record<string, unknown> | null;
      const type = ideas?.intelligence_type as string;
      if (type) {
        completedByType.set(type, (completedByType.get(type) || 0) + 1);
      }
    });

    // Construir intelligences con porcentaje dinámico
    const intelligenceTypes = new Set([...totalByType.keys(), ...completedByType.keys()]);
    const intelligences = Array.from(intelligenceTypes).map((code) => {
      const total = totalByType.get(code) || 0;
      const completed = completedByType.get(code) || 0;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        intelligenceCode: code,
        score,
        ideasConsumed: completed,
      };
    });

    return NextResponse.json({
      totalBooksExplored: booksRes.count || 0,
      totalIdeasDiscovered: ideasRes.count || 0,
      intelligences,
    });
  } catch (error) {
    console.error('Profile stats error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
