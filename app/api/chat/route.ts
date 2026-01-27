import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { message, news, conversationHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
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
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // 뉴스 컨텍스트 생성
    let newsContext = '';
    if (news && Array.isArray(news) && news.length > 0) {
      newsContext = '\n\n참고할 뉴스:\n' + news
        .map((item: any, index: number) => {
          return `${index + 1}. ${item.title}\n   ${item.snippet}\n`;
        })
        .join('\n');
    }

    // 대화 히스토리 생성
    let historyContext = '';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      historyContext = '\n\n이전 대화:\n' + conversationHistory
        .slice(-5) // 최근 5개만 사용
        .map((msg: any) => {
          return `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`;
        })
        .join('\n');
    }

    const prompt = `당신은 뉴스에 대해 대화할 수 있는 AI 어시스턴트입니다. 사용자의 질문에 답변할 때 제공된 뉴스 정보를 참고하여 정확하고 유용한 답변을 제공해주세요.${newsContext}${historyContext}\n\n사용자: ${message}\n\nAI:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || '채팅 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
