import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '뉴스 검색 및 챗봇',
  description: '키워드로 뉴스를 검색하고 AI와 대화하세요',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
