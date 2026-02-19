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
      .from('reflections')
      .select(`*, ideas (title, books (title))`)
      .eq('student_id', auth.sub)
      .order('updated_at', { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: 'Error al cargar reflexiones' }, { status: 500 });
    }

    const reflections = (data || []).map((r: any) => ({
      id: r.id,
      ideaId: r.idea_id,
      content: r.content,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      ideaTitle: r.ideas?.title,
      bookTitle: r.ideas?.books?.title,
    }));

    return NextResponse.json({ reflections });
  } catch (error) {
    console.error('Reflections error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) return unauthorizedResponse();

  try {
    const { ideaId, content } = await request.json();

    if (!ideaId || !content?.trim()) {
      return NextResponse.json({ error: 'Idea y contenido requeridos' }, { status: 400 });
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('reflections')
      .insert({
        student_id: auth.sub,
        idea_id: ideaId,
        content: content.trim(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error al guardar reflexión' }, { status: 500 });
    }

    return NextResponse.json({ reflection: data });
  } catch (error) {
    console.error('Create reflection error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
