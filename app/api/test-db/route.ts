import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';

// Supabase 연결 테스트 API
export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    envCheck: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
  };

  try {
    const supabase = createServerSupabaseClient();

    // 1. searches 테이블 존재 확인
    const { data: searchesCheck, error: searchesError } = await supabase
      .from('searches')
      .select('id')
      .limit(1);

    results.searchesTable = {
      exists: !searchesError,
      error: searchesError?.message || null,
      data: searchesCheck,
    };

    // 2. news_items 테이블 존재 확인
    const { data: newsCheck, error: newsError } = await supabase
      .from('news_items')
      .select('id')
      .limit(1);

    results.newsItemsTable = {
      exists: !newsError,
      error: newsError?.message || null,
      data: newsCheck,
    };

    // 3. 테스트 데이터 삽입 시도
    const testKeyword = `test_${Date.now()}`;
    const { data: insertData, error: insertError } = await supabase
      .from('searches')
      .insert({ keyword: testKeyword })
      .select('id, keyword')
      .single();

    results.insertTest = {
      success: !insertError,
      error: insertError?.message || null,
      data: insertData,
    };

    // 4. 삽입된 데이터 삭제 (테스트 정리)
    if (insertData?.id) {
      const { error: deleteError } = await supabase
        .from('searches')
        .delete()
        .eq('id', insertData.id);

      results.deleteTest = {
        success: !deleteError,
        error: deleteError?.message || null,
      };
    }

    // 5. 전체 데이터 카운트
    const { count: searchCount } = await supabase
      .from('searches')
      .select('*', { count: 'exact', head: true });

    const { count: newsCount } = await supabase
      .from('news_items')
      .select('*', { count: 'exact', head: true });

    results.counts = {
      searches: searchCount,
      news_items: newsCount,
    };

    return NextResponse.json(results);
  } catch (error) {
    results.error = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(results, { status: 500 });
  }
}
