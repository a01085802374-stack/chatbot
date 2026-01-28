-- Supabase에서 실행할 SQL 스키마
-- Supabase 대시보드 > SQL Editor에서 실행하세요

-- 검색 기록 테이블
CREATE TABLE IF NOT EXISTS searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 뉴스 아이템 테이블
CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  snippet TEXT,
  display_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 검색 키워드 인덱스 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_searches_keyword ON searches(keyword);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);

-- 뉴스 아이템의 search_id 인덱스
CREATE INDEX IF NOT EXISTS idx_news_items_search_id ON news_items(search_id);

-- RLS (Row Level Security) 정책 설정
-- 모든 사용자가 읽기/쓰기 가능하도록 설정 (필요시 수정)
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- 읽기 정책
CREATE POLICY "Enable read access for all users" ON searches
  FOR SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON news_items
  FOR SELECT USING (true);

-- 쓰기 정책
CREATE POLICY "Enable insert for all users" ON searches
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable insert for all users" ON news_items
  FOR INSERT WITH CHECK (true);

-- 삭제 정책
CREATE POLICY "Enable delete for all users" ON searches
  FOR DELETE USING (true);

CREATE POLICY "Enable delete for all users" ON news_items
  FOR DELETE USING (true);
