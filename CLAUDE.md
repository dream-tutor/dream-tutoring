# 드림과외 — 모노레포 CLAUDE.md

## 프로젝트 개요

**dreamtutor.kr**은 한국 과외 중개 서비스로, Cloudflare Workers를 통해 전국 행정구역·학교·과목·학년 조합에 해당하는 약 383,000개의 SEO 최적화 페이지를 동적으로 제공합니다.

**사이트:** https://dreamtutor.kr  
**기술 스택:** Cloudflare Workers (엣지 JS, Node.js 런타임 없음), 바닐라 JavaScript, npm 런타임 의존성 없음  
**언어:** UI/콘텐츠는 한국어, 코드 식별자는 영어

---

## 저장소 구조

```
dream-tutoring/              ← 모노레포 루트
├── dream-tutoring/          ← Worker #1: 학교 검색/탐색 페이지
│   ├── src/index.js         ← /schools/* 라우터
│   ├── scripts/fetch-neis.js← NEIS API에서 학교 데이터 수집
│   ├── regions.js           ← 지역 상수
│   ├── schools.js           ← 학교 데이터
│   └── wrangler.toml        ← 라우트: dreamtutor.kr/schools/*
│
├── dreamtutor-workers/      ← Worker #2: 메인 SEO 페이지 생성기
│   ├── src/
│   │   ├── index.js         ← 엔트리포인트, 요청 분배, 사이트맵
│   │   ├── router.js        ← URL 파싱, 라우트 타입 감지
│   │   ├── renderer.js      ← HTML 생성 (196KB — 모든 페이지 타입)
│   │   ├── seo.js           ← 메타태그, JSON-LD 스키마
│   │   ├── template.js      ← 공통 CSS/레이아웃/컴포넌트 (38KB)
│   │   └── data/
│   │       ├── regions.js   ← VISIT_REGIONS, 과목, 학년, 설명
│   │       ├── all_regions.js← 전국 5,066개 행정구역 전체
│   │       └── schools.js   ← 학교명→위치 매핑 12,000건+
│   ├── public/              ← Cloudflare Assets로 제공되는 정적 파일
│   ├── CLAUDE.md            ← Worker별 세부 문서 (최신 상태 유지)
│   ├── wrangler.toml        ← 라우트: dreamtutor.kr/* 및 www.*
│   └── package.json
│
├── .github/workflows/deploy.yml ← CI/CD: main 푸시 시 dreamtutor-workers 자동 배포
├── robots.txt               ← 루트 robots.txt
├── sitemap.xml              ← 루트 사이트맵
└── index.html               ← 정적 홈페이지 폴백
```

---

## 두 개의 Cloudflare Workers

### Worker 1: `dream-tutoring/` → `dreamtutor-schools`
- **라우트:** `dreamtutor.kr/schools/*`
- **역할:** 학교 검색, 시도/시군구 목록, 개별 학교 페이지
- **배포:** `cd dream-tutoring && npm run deploy`

### Worker 2: `dreamtutor-workers/` → `dreamtutor-seo`
- **라우트:** `dreamtutor.kr/*` 및 `www.dreamtutor.kr/*`
- **역할:** 모든 SEO 페이지 — 지역/과목/학년 조합, 학교 페이지, 화상과외, 교육 아티클
- **배포:** `cd dreamtutor-workers && npm run deploy`
- **자동 배포:** main 브랜치 푸시 시 GitHub Actions 실행

---

## 개발 워크플로우

### 로컬 개발
```bash
# Worker 2 (메인 SEO — 가장 자주 작업)
cd dreamtutor-workers
npm install
npm run dev          # localhost:8787

# Worker 1 (학교)
cd dream-tutoring
npm install
npm run dev          # localhost:8787
```

### 배포
```bash
# 수동 배포 (Cloudflare 인증 필요)
npx wrangler login
npm run deploy

# main 브랜치 푸시 시 dreamtutor-workers가 CI/CD로 자동 배포됨
```

### 로컬 페이지 테스트 예시
```
http://localhost:8787/고덕동수학과외     # 동 단위 과외 페이지
http://localhost:8787/강동구영어과외     # 구 단위 과외 페이지
http://localhost:8787/서울과외           # 시도 단위 페이지
http://localhost:8787/수학              # 과목 아티클
http://localhost:8787/sitemap-seo.xml   # 사이트맵 인덱스
http://localhost:8787/sitemap-seo-1.xml # 첫 번째 청크 (45K URL)
```

---

## URL 라우팅 로직 (dreamtutor-workers)

라우터(`src/router.js`)는 한국어 URL에서 접미사를 역방향으로 제거하며 파싱합니다:

1. **동(dong) 단위:** `/고덕동과외`, `/고덕동수학과외`, `/고덕동중등수학과외`
2. **구(gu/sigungu) 단위:** `/강동구과외`, `/강동구영어과외`
3. **시도(sido) 단위:** `/서울과외`, `/경기과외`
4. **학교 페이지:** `/고덕중학교과외`
5. **화상(온라인) 페이지:** `/화상과외`, `/수원화상수학과외` (방문 불가 지역 대상)
6. **과목 전용 아티클:** `/수학`, `/영어내신전략`

**`parseRoute()`가 반환하는 라우트 타입:**
- `dong` | `gu` | `sido` | `school` | `online` | `subject` | `edu` | `unknown`

**정규 URL 패턴:** `/[지역][학년][과목]과외` — 후행 슬래시 없음, www 없음

---

## 데이터 아키텍처

모든 데이터는 JavaScript 모듈로 내장되어 있습니다 (데이터베이스 없음):

| 데이터 | 파일 | 내용 |
|------|------|------|
| `VISIT_REGIONS` | `data/regions.js` | 방문 가능 지역: 시도 → 시군구 → 동[] |
| `ALL_REGIONS` | `data/all_regions.js` | 전국 5,066개 행정구역 전체 |
| `SUBJECTS` | `data/regions.js` | 수학, 영어, 국어, 과학, 사회, 한국사 |
| `GRADES` | `data/regions.js` | 초등, 중등, 고등, 고3 |
| `SCHOOL_TO_LOCATION` | `data/schools.js` | 학교명 → {s: 시도, g: 시군구, d: 동} |
| `DONG_SCHOOLS` | `data/schools.js` | 동 → 대표 학교 (콘텐츠 생성용) |

**O(1) 조회:** 모든 데이터는 해시맵으로 구성되어 DB 없이 엣지에서 빠른 조회 가능

---

## 핵심 규칙

### 콘텐츠 규칙 (절대 위반 금지)
- **전화번호:** `01048645345` — 버튼 `href="tel:..."` 속성에만 사용, 본문 텍스트에 절대 노출 금지
- **과장 표현 금지:** 최고, No.1, 최대, 최저가 사용 불가 (한국 광고법)
- **공인 통계:** 30년+ 교육노하우, 100만+ 회원, 2,000명+ 선생님
- **모바일 우선:** 모든 레이아웃은 모바일 가독성 기준으로 설계

### 코드 규칙
- **한국 지명 변수명:** `dong`, `gu`, `sido`, `sigungu`
- **대문자 상수:** `VISIT_REGIONS`, `ALL_SIDO`, `SUBJECTS`, `DONG_SCHOOLS`
- **혼합 네이밍:** 한국어 개념 + 영어 로직 (예: `renderDongPage()`, `parseDong()`)
- **런타임 의존성 없음:** npm 런타임 패키지 추가 금지 — Worker 번들 크기를 위해 유지
- **모듈 레벨 초기화:** 비용이 큰 전처리(Map, Set)는 요청마다가 아닌 모듈 로드 시 한 번만 실행

### SEO 규칙
- 모든 페이지에 포함: JSON-LD(LocalBusiness + TutoringService 스키마), og: 태그, canonical URL, `X-Robots-Tag`
- 캐싱: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- 홈페이지: `max-age=3600, stale-while-revalidate=86400`
- 모든 URL 변형 → canonical으로 301 리다이렉트
- 네이버 사이트 인증: `051068c0a0ae6e9caf73755b32cd12430aed1803`
- IndexNow 키: `f7e8d9c0b1a29347e85f0d1c2b3a4956`

### 중복 지명 처리
많은 한국 지역명이 중의적입니다 (예: 중구는 여러 도시에 존재). 라우터에 이를 처리하는 특수 로직이 있으므로, 엣지 케이스를 충분히 이해하지 않고 단순화하지 마세요.

---

## 사이트맵 아키텍처

사이트맵은 `src/index.js`에서 동적으로 생성됩니다:

- `/sitemap-seo.xml` — 청크를 가리키는 사이트맵 인덱스
- `/sitemap-seo-1.xml` ~ `/sitemap-seo-N.xml` — 청크당 45,000개 URL
- `/sitemap-core.xml` — 핵심/우선 페이지 (priority 0.9)

총계: 약 383,059개 URL (2026-03-24 기준)

---

## CI/CD

**파일:** `.github/workflows/deploy.yml`

- 트리거: `main` 브랜치 푸시
- 동작: `cloudflare/wrangler-action@v3`으로 `dreamtutor-workers/` 배포
- 필요한 시크릿: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

**테스트 없음.** 배포 전 반드시 로컬 `npm run dev`로 변경 사항을 확인하세요.

---

## 외부 연동

| 서비스 | 상세 |
|---------|---------|
| **Cloudflare Workers** | 두 Worker 모두 `dreamtutor.kr` 존에 배포 |
| **Cloudflare Assets** | `public/` 디렉토리를 정적 에셋으로 제공 |
| **Google Apps Script** | 리드 폼 제출 엔드포인트 (URL은 `dreamtutor-workers/CLAUDE.md` 참조) |
| **NEIS API** | 한국 정부 학교 DB (fetch-neis.js 스크립트에서 사용) |
| **네이버 웹마스터** | 메타 태그로 사이트 인증 |
| **IndexNow** | 검색엔진 실시간 URL 제출 |

---

## 하지 말아야 할 것

- npm 런타임 의존성 추가 금지 — 번들 크기가 Workers에 매우 중요
- 데이터베이스 추가 금지 — 모든 데이터는 빌드 타임에 내장
- 프로덕션 경로에서 `console.log` 사용 금지 — 개발/스크립트에서만 사용
- 테스트 파일 생성 금지 — 현재 테스트 인프라 없음
- canonical URL 패턴 변경 시 사이트맵 생성 로직도 반드시 함께 수정
- 전화번호를 본문 텍스트로 노출 금지 (`tel:` 링크 속성에만 허용)
- 과장성 마케팅 표현 사용 금지
