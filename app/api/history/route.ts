import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';

// 검색 히스토리 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || '';

    let query = supabase
      .from('searches')
      .select(`
        id,
        keyword,
        created_at,
        news_items (
          id,
          title,
          link,
          snippet,
          display_link,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 키워드 필터링
    if (keyword) {
      query = query.ilike('keyword', `%${keyword}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('History fetch error:', error);
      return NextResponse.json(
        { error: '히스토리 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ history: data });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { error: '히스토리 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 특정 검색 기록 삭제
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: '삭제할 검색 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('searches')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: '삭제 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: '삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
