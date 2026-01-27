# 뉴스 검색 및 챗봇 애플리케이션

키워드를 입력하면 구글에서 관련 뉴스를 검색하고, 제미나이 API를 사용하여 뉴스를 요약하고 대화할 수 있는 챗봇입니다.

## 기능

- 🔍 키워드 기반 뉴스 검색 (구글 검색)
- 📰 최대 10개의 뉴스 표시
- 📝 제미나이 API를 사용한 뉴스 요약
- 💬 뉴스 기반 대화형 챗봇

## 환경 변수 설정

### 로컬 개발

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### Vercel 배포

1. Vercel 프로젝트 설정으로 이동
2. Settings > Environment Variables 섹션으로 이동
3. 다음 환경 변수들을 추가:
   - `GEMINI_API_KEY`: Google Gemini API 키
   - `GOOGLE_SEARCH_API_KEY`: Google Custom Search API 키
   - `GOOGLE_SEARCH_ENGINE_ID`: Google Custom Search Engine ID

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## API 키 발급 방법

### Google Gemini API
1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. API 키 생성

### NewsAPI (선택사항)
1. [NewsAPI](https://newsapi.org/register)에 접속하여 무료 계정 생성
2. API 키 발급
3. `.env.local` 파일에 `NEWS_API_KEY` 추가

**참고**: NewsAPI 키가 없어도 Google News RSS를 통해 뉴스 검색이 가능합니다. 다만 NewsAPI를 사용하면 더 많은 뉴스와 상세 정보를 얻을 수 있습니다.
