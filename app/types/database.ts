// 검색 기록 테이블 타입
export interface SearchRecord {
  id: string;
  keyword: string;
  created_at: string;
}

// 뉴스 아이템 테이블 타입
export interface NewsRecord {
  id: string;
  search_id: string;
  title: string;
  link: string;
  snippet: string;
  display_link: string;
  created_at: string;
}

// 검색 결과와 뉴스를 함께 포함하는 타입
export interface SearchWithNews extends SearchRecord {
  news_items: NewsRecord[];
}

// API 응답용 뉴스 아이템 타입
export interface NewsItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}
