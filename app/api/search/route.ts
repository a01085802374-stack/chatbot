import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export async function POST(request: NextRequest) {
  let keyword = '';
  
  try {
    const body = await request.json();
    keyword = body.keyword || '';

    if (!keyword) {
      return NextResponse.json(
        { error: '키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    // Google News RSS로 뉴스 검색
    const newsItems = await fetchNewsFromRSS(keyword);
    
    // Supabase에 검색 기록 및 뉴스 저장
    await saveToDatabase(keyword, newsItems);

    return NextResponse.json({ news: newsItems });
  } catch (error) {
    console.error('Search error:', error);
    
    // 오류 발생 시에도 keyword가 있으면 재시도
    if (keyword) {
      try {
        const newsItems = await fetchNewsFromRSS(keyword);
        // DB 저장 실패해도 검색 결과는 반환
        try {
          await saveToDatabase(keyword, newsItems);
        } catch (dbError) {
          console.error('DB save error:', dbError);
        }
        return NextResponse.json({ news: newsItems });
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
    
    return NextResponse.json(
      { error: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Supabase에 검색 기록 및 뉴스 저장
async function saveToDatabase(keyword: string, newsItems: NewsItem[]): Promise<void> {
  const supabase = createServerSupabaseClient();
  
  // 검색 기록 저장
  const { data: searchData, error: searchError } = await supabase
    .from('searches')
    .insert({ keyword })
    .select('id')
    .single();

  if (searchError) {
    console.error('Search insert error:', searchError);
    throw searchError;
  }

  if (!searchData) {
    throw new Error('Failed to create search record');
  }

  // 뉴스 아이템 저장
  if (newsItems.length > 0) {
    const newsRecords = newsItems.map(item => ({
      search_id: searchData.id,
      title: item.title,
      link: item.link,
      snippet: item.snippet,
      display_link: item.displayLink,
    }));

    const { error: newsError } = await supabase
      .from('news_items')
      .insert(newsRecords);

    if (newsError) {
      console.error('News insert error:', newsError);
      throw newsError;
    }
  }
}

// Google News RSS에서 뉴스 가져오기
async function fetchNewsFromRSS(keyword: string): Promise<NewsItem[]> {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
  
  const response = await fetch(rssUrl);
  const xmlText = await response.text();
  
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let count = 0;
  
  while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
    const itemContent = match[1];
    
    // 다양한 XML 형식 지원
    let title = '';
    const titleCdataMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const titlePlainMatch = itemContent.match(/<title>(.*?)<\/title>/);
    if (titleCdataMatch) {
      title = titleCdataMatch[1];
    } else if (titlePlainMatch) {
      title = titlePlainMatch[1];
    }
    
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
    
    let snippet = '';
    const descCdataMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
    const descPlainMatch = itemContent.match(/<description>(.*?)<\/description>/);
    if (descCdataMatch) {
      snippet = descCdataMatch[1];
    } else if (descPlainMatch) {
      snippet = descPlainMatch[1];
    }
    
    if (title && linkMatch) {
      title = title.replace(/<[^>]*>/g, '').replace(/&lt;.*?&gt;/g, '').trim();
      const link = linkMatch[1];
      snippet = snippet.replace(/<[^>]*>/g, '').replace(/&lt;.*?&gt;/g, '').substring(0, 200).trim();
      
      try {
        const url = new URL(link);
        items.push({
          title,
          link,
          snippet,
          displayLink: url.hostname.replace('www.', ''),
        });
        count++;
      } catch {
        // 유효하지 않은 URL 스킵
      }
    }
  }
  
  return items;
}
