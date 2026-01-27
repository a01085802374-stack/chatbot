# Vercel 환경 변수 설정 가이드

이 프로젝트를 Vercel에 배포하기 전에 다음 환경 변수들을 설정해야 합니다.

## 설정 방법

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택 (또는 새 프로젝트 생성)
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭
5. 아래 환경 변수들을 추가:

### 필수 환경 변수

#### 1. GEMINI_API_KEY
- **설명**: Google Gemini API 키
- **발급 방법**:
  1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
  2. "Create API Key" 클릭
  3. 생성된 API 키를 복사하여 입력

#### 2. NEWS_API_KEY (선택사항)
- **설명**: NewsAPI 키 (뉴스 검색 개선용)
- **발급 방법**:
  1. [NewsAPI](https://newsapi.org/register) 접속
  2. 무료 계정 생성
  3. API 키 발급
  4. 생성된 API 키를 복사하여 입력
- **참고**: 이 키가 없어도 Google News RSS를 통해 뉴스 검색이 가능합니다.

## 환경 변수 추가 단계

각 환경 변수를 추가할 때:
1. **Key**: 환경 변수 이름 입력 (예: `GEMINI_API_KEY`)
2. **Value**: API 키 또는 ID 값 입력
3. **Environment**: 
   - Production (프로덕션)
   - Preview (프리뷰)
   - Development (개발)
   
   모든 환경에 적용하려면 세 가지 모두 선택하세요.

4. **Add** 버튼 클릭

## 확인

환경 변수를 추가한 후:
1. 프로젝트를 다시 배포하거나
2. Vercel 대시보드에서 "Redeploy" 클릭

환경 변수가 제대로 설정되었는지 확인하려면 배포 후 애플리케이션을 테스트해보세요.

## 보안 주의사항

- ✅ 환경 변수는 `.env.local` 파일에만 저장하고 Git에 커밋하지 마세요
- ✅ `.gitignore`에 `.env*.local`이 포함되어 있는지 확인하세요
- ✅ Vercel 환경 변수는 암호화되어 저장됩니다
- ❌ API 키를 코드에 하드코딩하지 마세요
- ❌ API 키를 공개 저장소에 업로드하지 마세요
