import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  snippet: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

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

    let newsContext = '';
    if (news && Array.isArray(news) && news.length > 0) {
      newsContext = '\n\n참고할 뉴스:\n' + (news as NewsItem[])
        .map((item: NewsItem, index: number) => {
          return `${index + 1}. ${item.title}\n   ${item.snippet}\n`;
        })
        .join('\n');
    }

    let historyContext = '';
    if (conversationHistory && Array.isArray(conversationHistory)) {
      historyContext = '\n\n이전 대화:\n' + (conversationHistory as ChatMessage[])
        .slice(-5)
        .map((msg: ChatMessage) => {
          return `${msg.role === 'user' ? '사용자' : 'AI'}: ${msg.content}`;
        })
        .join('\n');
    }

    const prompt = `당신은 뉴스에 대해 대화할 수 있는 AI 어시스턴트입니다. 사용자의 질문에 답변할 때 제공된 뉴스 정보를 참고하여 정확하고 유용한 답변을 제공해주세요.${newsContext}${historyContext}\n\n사용자: ${message}\n\nAI:`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 생성할 수 없습니다.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : '채팅 중 오류가 발생했습니다.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
