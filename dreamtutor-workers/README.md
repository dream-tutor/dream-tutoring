# 드림과외 SEO Workers

## 프로젝트 구조
```
src/
├── index.js          # Workers 메인 엔트리
├── router.js         # URL 파싱 및 라우팅
├── renderer.js       # 페이지 HTML 생성
├── seo.js            # 메타태그 + JSON-LD 스키마
├── template.js       # 공통 레이아웃
└── data/
    └── regions.js    # 지역/과목/학년 데이터
```

## Claude Code에서 실행 순서

### 1단계 - 설치
```bash
npm install
```

### 2단계 - Cloudflare 로그인
```bash
npx wrangler login
```

### 3단계 - 로컬 테스트
```bash
npm run dev
# http://localhost:8787/고덕동수학과외 접속해서 확인
```

### 4단계 - 배포
```bash
npm run deploy
```

### 5단계 - Cloudflare 대시보드에서 Routes 설정
```
Workers & Pages → dreamtutor-seo → Settings → Triggers → Routes
추가: dreamtutor.kr/*과외
```

### 6단계 - GitHub Actions 설정
GitHub 레포 Settings → Secrets 에 추가:
- CLOUDFLARE_API_TOKEN: Cloudflare API 토큰
- CLOUDFLARE_ACCOUNT_ID: 계정 ID

### 7단계 - Sitemap 제출
- 구글 서치콘솔: https://dreamtutor.kr/sitemap-seo.xml
- 네이버 서치어드바이저: 동일 URL 제출

## 생성되는 페이지 예시
- /고덕동과외
- /고덕과외
- /고덕동수학과외
- /고덕동고등수학과외
- /강동구과외
- /강동구고등영어과외

## 네이버 서치어드바이저 인증키 설정
seo.js 파일에서 YOUR_NAVER_KEY를 실제 키로 교체:
```js
<meta name="naver-site-verification" content="실제키">
```
