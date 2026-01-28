'use client';

import { useState } from 'react';

interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [summary, setSummary] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('키워드를 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');
    setNews([]);
    setSummary('');
    setConversationHistory([]);

    try {
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword }),
      });

      if (!searchResponse.ok) {
        const errorData = await searchResponse.json();
        throw new Error(errorData.error || '검색 중 오류가 발생했습니다.');
      }

      const searchData = await searchResponse.json();
      setNews(searchData.news || []);

      if (searchData.news && searchData.news.length > 0) {
        const summarizeResponse = await fetch('/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ news: searchData.news }),
        });

        if (summarizeResponse.ok) {
          const summarizeData = await summarizeResponse.json();
          setSummary(summarizeData.summary || '');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatMessage.trim()) {
      return;
    }

    if (news.length === 0) {
      setError('먼저 뉴스를 검색해주세요.');
      return;
    }

    setChatLoading(true);
    setError('');

    const userMessage: Message = {
      role: 'user',
      content: chatMessage,
    };

    const updatedHistory = [...conversationHistory, userMessage];
    setConversationHistory(updatedHistory);
    setChatMessage('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatMessage,
          news: news,
          conversationHistory: updatedHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '채팅 중 오류가 발생했습니다.');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
      };

      setConversationHistory([...updatedHistory, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '채팅 중 오류가 발생했습니다.';
      setError(errorMessage);
      setConversationHistory(conversationHistory);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ marginBottom: '2rem', color: '#333', fontSize: '2rem' }}>
          뉴스 검색 및 AI 챗봇
        </h1>

        <div className="input-group">
          <input
            type="text"
            placeholder="검색할 키워드를 입력하세요..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleSearch)}
            disabled={loading}
          />
          <button
            className="btn"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? '검색 중...' : '검색'}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading && <div className="loading">뉴스를 검색하고 요약하는 중...</div>}

        {news.length > 0 && (
          <>
            <div>
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                검색된 뉴스 ({news.length}개)
              </h2>
              <div className="news-list">
                {news.map((item, index) => (
                  <div key={index} className="news-item">
                    <h3>{item.title}</h3>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.displayLink}
                    </a>
                    <p>{item.snippet}</p>
                  </div>
                ))}
              </div>
            </div>

            {summary && (
              <div className="summary-section">
                <h2>뉴스 요약</h2>
                <p style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
              </div>
            )}

            <div className="chat-section">
              <h2 style={{ marginBottom: '1rem', color: '#333' }}>
                뉴스에 대해 질문하기
              </h2>

              {conversationHistory.length > 0 && (
                <div className="chat-messages">
                  {conversationHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.role}`}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>
              )}

              <div className="chat-input-group">
                <input
                  type="text"
                  placeholder="뉴스에 대해 질문해보세요..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => !chatLoading && handleKeyDown(e, handleChat)}
                  disabled={chatLoading}
                />
                <button
                  className="btn"
                  onClick={handleChat}
                  disabled={chatLoading}
                >
                  {chatLoading ? '전송 중...' : '전송'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
