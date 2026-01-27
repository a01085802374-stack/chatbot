# 배포 가이드

## 방법 1: GitHub + Vercel (권장)

### 1단계: Git 설치
1. [Git 다운로드](https://git-scm.com/download/win)
2. 설치 후 터미널 재시작

### 2단계: GitHub 저장소 생성
1. [GitHub](https://github.com)에 로그인
2. 우측 상단 "+" 버튼 클릭 → "New repository"
3. 저장소 이름 입력 (예: `news-chatbot`)
4. "Create repository" 클릭

### 3단계: 로컬에서 Git 초기화 및 푸시
```bash
# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit"

# GitHub 저장소 연결 (YOUR_USERNAME과 YOUR_REPO_NAME을 실제 값으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 브랜치 이름 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 4단계: Vercel에 배포
1. [Vercel](https://vercel.com)에 로그인 (GitHub 계정으로 로그인 권장)
2. "Add New Project" 클릭
3. 방금 만든 GitHub 저장소 선택
4. "Import" 클릭
5. **환경 변수 설정**:
   - `GEMINI_API_KEY`: `AIzaSyDgO2AxMYt-Fd7aMBA9Lu4o5ku0bGulNu4`
   - `NEWS_API_KEY`: (선택사항)
6. "Deploy" 클릭

## 방법 2: Vercel CLI로 직접 배포

### 1단계: Vercel CLI 설치
```bash
npm install -g vercel
```

### 2단계: Vercel에 로그인
```bash
vercel login
```

### 3단계: 프로젝트 배포
```bash
vercel
```

### 4단계: 환경 변수 설정
1. Vercel 대시보드로 이동
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:
   - `GEMINI_API_KEY`: `AIzaSyDgO2AxMYt-Fd7aMBA9Lu4o5ku0bGulNu4`
   - `NEWS_API_KEY`: (선택사항)
4. "Redeploy" 클릭

## 방법 3: Vercel 웹 인터페이스에서 직접 업로드

1. [Vercel](https://vercel.com)에 로그인
2. "Add New Project" 클릭
3. "Import Git Repository" 대신 "Browse" 또는 드래그 앤 드롭으로 프로젝트 폴더 업로드
4. 환경 변수 설정 후 배포

## 배포 후 확인

배포가 완료되면 Vercel에서 제공하는 URL로 접속하여 애플리케이션을 테스트할 수 있습니다.

## 문제 해결

- **빌드 오류**: `npm install`이 로컬에서 정상 작동하는지 확인
- **환경 변수 오류**: Vercel 대시보드에서 환경 변수가 올바르게 설정되었는지 확인
- **API 오류**: Gemini API 키가 올바른지 확인
