import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const newsText = (news as NewsItem[])
      .map((item: NewsItem, index: number) => {
        return `${index + 1}. ${item.title}\n   ${item.snippet}\n`;
      })
      .join('\n');

    const prompt = `다음 뉴스들을 읽고 요약해주세요. 각 뉴스의 핵심 내용을 간결하게 정리하고, 전체적인 트렌드나 주요 이슈를 파악하여 종합적으로 요약해주세요.\n\n${newsText}\n\n요약:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Summarize error:', error);
    const errorMessage = error instanceof Error ? error.message : '요약 중 오류가 발생했습니다.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
