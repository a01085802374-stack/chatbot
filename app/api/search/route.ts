import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keyword } = await request.json();

    if (!keyword) {
      return NextResponse.json(
        { error: '키워드가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEWS_API_KEY;

    // NewsAPI를 사용하여 뉴스 검색
    // 무료 API 키: https://newsapi.org/register 에서 발급 가능
    const searchUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(keyword)}&language=ko&sortBy=publishedAt&pageSize=10${apiKey ? `&apiKey=${apiKey}` : ''}`;

    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!response.ok) {
      // API 키가 없어도 동작하도록 기본 뉴스 제공 (제한적)
      if (data.status === 'error' && data.message?.includes('API key')) {
        // API 키 없이도 작동하도록 Google News RSS 사용
        return await searchWithGoogleNewsRSS(keyword);
      }
      throw new Error(data.message || '검색 중 오류가 발생했습니다.');
    }

    const newsItems = (data.articles || [])
      .filter((article: any) => article.title && article.url)
      .slice(0, 10)
      .map((article: any) => ({
        title: article.title || '',
        link: article.url || '',
        snippet: article.description || article.content?.substring(0, 200) || '',
        displayLink: new URL(article.url).hostname.replace('www.', ''),
      }));

    return NextResponse.json({ news: newsItems });
  } catch (error: any) {
    console.error('Search error:', error);
    // 오류 발생 시 Google News RSS로 폴백
    try {
      return await searchWithGoogleNewsRSS(keyword);
    } catch (fallbackError: any) {
      return NextResponse.json(
        { error: error.message || '검색 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
  }
}

// Google News RSS를 사용한 대체 검색 방법 (API 키 불필요)
async function searchWithGoogleNewsRSS(keyword: string) {
  try {
    // Google News RSS 피드 사용
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(keyword)}&hl=ko&gl=KR&ceid=KR:ko`;
    
    const response = await fetch(rssUrl);
    const xmlText = await response.text();
    
    // 간단한 XML 파싱
    const items: any[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let count = 0;
    
    while ((match = itemRegex.exec(xmlText)) !== null && count < 10) {
      const itemContent = match[1];
      const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
      const linkMatch = itemContent.match(/<link>(.*?)<\/link>/);
      const descriptionMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/);
      
      if (titleMatch && linkMatch) {
        const title = titleMatch[1].replace(/&lt;.*?&gt;/g, '').trim();
        const link = linkMatch[1];
        const snippet = descriptionMatch 
          ? descriptionMatch[1].replace(/&lt;.*?&gt;/g, '').substring(0, 200).trim()
          : '';
        
        try {
          const url = new URL(link);
          items.push({
            title,
            link,
            snippet,
            displayLink: url.hostname.replace('www.', ''),
          });
          count++;
        } catch (e) {
          // 유효하지 않은 URL 스킵
        }
      }
    }
    
    return NextResponse.json({ news: items });
  } catch (error: any) {
    throw new Error('뉴스 검색에 실패했습니다.');
  }
}
