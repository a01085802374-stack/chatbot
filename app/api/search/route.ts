import { NextRequest, NextResponse } from 'next/server';

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

    // Google News RSS 사용 (API 키 불필요)
    return await searchWithGoogleNewsRSS(keyword);
  } catch (error) {
    console.error('Search error:', error);
    
    // 오류 발생 시에도 keyword가 있으면 재시도
    if (keyword) {
      try {
        return await searchWithGoogleNewsRSS(keyword);
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

// Google News RSS를 사용한 검색 (API 키 불필요)
async function searchWithGoogleNewsRSS(keyword: string): Promise<NextResponse> {
  try {
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    interface NewsItem {
      title: string;
      link: string;
      snippet: string;
      displayLink: string;
    }
    
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
    
    return NextResponse.json({ news: items });
  } catch {
    throw new Error('뉴스 검색에 실패했습니다.');
  }
}
