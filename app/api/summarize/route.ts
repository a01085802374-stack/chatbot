import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  snippet: string;
}

export async function POST(request: NextRequest) {
  try {
    const { news } = await request.json();

    if (!news || !Array.isArray(news) || news.length === 0) {
      return NextResponse.json(
        { error: '뉴스 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const newsText = (news as NewsItem[])
      .map((item: NewsItem, index: number) => {
        return `${index + 1}. ${item.title}\n   ${item.snippet}\n`;
      })
      .join('\n');

    const prompt = `다음 뉴스들을 읽고 요약해주세요. 각 뉴스의 핵심 내용을 간결하게 정리하고, 전체적인 트렌드나 주요 이슈를 파악하여 종합적으로 요약해주세요.\n\n${newsText}\n\n요약:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'API 오류');
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || '요약을 생성할 수 없습니다.';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    const errorMessage = error instanceof Error ? error.message : '요약 중 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
