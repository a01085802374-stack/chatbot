# 뉴스 검색 및 챗봇 애플리케이션

키워드를 입력하면 구글에서 관련 뉴스를 검색하고, 제미나이 API를 사용하여 뉴스를 요약하고 대화할 수 있는 챗봇입니다.

## 기능

- 🔍 키워드 기반 뉴스 검색 (구글 검색)
- 📰 최대 10개의 뉴스 표시
- 📝 제미나이 API를 사용한 뉴스 요약
- 💬 뉴스 기반 대화형 챗봇
- 💾 Supabase를 활용한 검색 기록 및 뉴스 저장

## 환경 변수 설정

### 로컬 개발

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Vercel 배포

1. Vercel 프로젝트 설정으로 이동
2. Settings > Environment Variables 섹션으로 이동
3. 다음 환경 변수들을 추가:
   - `GEMINI_API_KEY`: Google Gemini API 키
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anonymous Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key

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

### Supabase 설정
1. [Supabase](https://supabase.com)에 접속하여 계정 생성
2. 새 프로젝트 생성
3. Project Settings > API에서 키 확인:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
4. SQL Editor에서 `supabase-schema.sql` 파일의 내용 실행

### 데이터베이스 테이블 구조

#### searches (검색 기록)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| keyword | TEXT | 검색 키워드 |
| created_at | TIMESTAMP | 생성 시간 |

#### news_items (뉴스 아이템)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | UUID | Primary Key |
| search_id | UUID | 검색 기록 FK |
| title | TEXT | 뉴스 제목 |
| link | TEXT | 뉴스 링크 |
| snippet | TEXT | 뉴스 내용 요약 |
| display_link | TEXT | 표시용 링크 |
| created_at | TIMESTAMP | 생성 시간 |

## API 엔드포인트

### POST /api/search
키워드로 뉴스 검색 및 DB 저장

### POST /api/summarize
뉴스 요약 생성

### POST /api/chat
뉴스 기반 AI 대화

### GET /api/history
검색 히스토리 조회 (쿼리: `limit`, `keyword`)

### DELETE /api/history
검색 기록 삭제 (쿼리: `id`)
