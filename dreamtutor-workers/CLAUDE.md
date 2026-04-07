# 드림과외 SEO Workers — CLAUDE.md

## 프로젝트 개요

dreamtutor.kr SEO 최적화 Cloudflare Worker.  
한국어 URL 기반으로 전국 과외 서비스 페이지를 동적 생성합니다.

- **총 페이지 수:** 약 383,059개 (2026-03-24 기준)
- **라우트:** `dreamtutor.kr/*`, `www.dreamtutor.kr/*`
- **Worker 이름:** `dreamtutor-seo`

---

## 파일 구조

```
src/
├── index.js       ← 엔트리포인트: 요청 라우팅, 사이트맵, 정적 파일 처리
├── router.js      ← URL 파싱 및 라우트 타입 감지 (16KB)
├── renderer.js    ← 모든 페이지 타입 HTML 생성 (196KB)
├── seo.js         ← 메타태그 + JSON-LD 스키마 생성 (4KB)
├── template.js    ← 공통 CSS, 레이아웃, UI 컴포넌트 (38KB)
└── data/
    ├── regions.js      ← VISIT_REGIONS, 과목, 학년, 설명 텍스트 (33KB)
    ├── all_regions.js  ← 전국 행정구역 5,066개 전체 (104KB)
    └── schools.js      ← 학교명→위치 매핑, DONG_SCHOOLS (990KB)
```

---

## 라우트 타입

`parseRoute(url)`이 반환하는 라우트 타입과 URL 예시:

| 타입 | URL 예시 | 설명 |
|------|---------|------|
| `dong` | `/고덕동수학과외`, `/고덕동중등수학과외` | 동(읍·면) 단위 과외 |
| `gu` | `/강동구영어과외`, `/강동구` | 시군구 단위 과외 |
| `sido` | `/서울과외`, `/경기` | 시도 단위 과외 |
| `school` | `/고덕중학교과외` | 학교 근처 과외 |
| `online` | `/화상과외`, `/수원화상수학과외` | 화상/온라인 과외 |
| `subject` | `/수학`, `/영어` | 과목 교육 아티클 |
| `edu` | `/수학공부법`, `/영어내신전략` | 세부 교육 아티클 |

**정규 URL 패턴:** `/[지역][학년][과목]과외` (슬래시 없음, www 없음)

---

## 개발 워크플로우

```bash
npm install
npm run dev        # 로컬: http://localhost:8787
npm run preview    # Cloudflare 원격 미리보기
npm run deploy     # 프로덕션 배포
```

**테스트 인프라 없음.** 배포 전 반드시 `npm run dev`로 페이지를 직접 확인하세요.

---

## 중요 규칙 (절대 위반 금지)

### 콘텐츠
- **전화번호 `01048645345`:** 버튼 `href="tel:01048645345"` 속성에만 사용, 본문 텍스트 노출 절대 금지
- **과장 표현 금지:** 최고, No.1, 최대, 최저가 등 사용 불가 (한국 광고법)
- **공인 통계 (이 수치만 사용):**
  - 30년+ 교육노하우
  - 100만+ 회원
  - 2,000명+ 선생님
- **모바일 우선:** 모든 UI는 모바일 가독성 기준

### 코드
- npm 런타임 의존성 추가 금지 (번들 크기 제한)
- `console.log`는 개발/스크립트 전용 — 프로덕션 코드에 사용 금지
- 데이터는 JS 모듈로 내장 — DB 연결 추가 금지
- 중복 지명 처리 로직(`router.js`)은 엣지 케이스를 충분히 이해 후 수정

---

## 데이터 구조

### VISIT_REGIONS (방문과외 가능 지역)
```js
{
  서울: {
    강동구: ['고덕동', '둔촌동', ...],
    강남구: ['역삼동', '삼성동', ...],
    ...
  },
  경기: { ... },
  ...
}
```
주요 도시 17개 시도, 약 80개 시군구 커버.

### ALL_REGIONS (전국 행정구역)
방문 불가 지역 포함 전국 5,066개 행정구역.  
화상과외 페이지 생성 및 redirects에 사용.

### SCHOOL_TO_LOCATION
```js
{ '고덕중학교': { s: '서울', g: '강동구', d: '고덕동' }, ... }
```

### DONG_SCHOOLS
```js
{ '고덕동': '고덕중학교', ... }
```
동 단위 페이지 콘텐츠 생성에 사용.

---

## SEO 설정

모든 페이지에 포함해야 할 항목:
- `<title>`, `<meta name="description">` (80자 이내)
- `og:title`, `og:description`, `og:url`, `og:image`
- `<link rel="canonical">`
- JSON-LD: `LocalBusiness` + `TutoringService` 스키마
- `X-Robots-Tag: index, follow` 헤더

캐시 헤더:
- 일반 페이지: `Cache-Control: public, max-age=86400, stale-while-revalidate=604800`
- 홈페이지: `Cache-Control: public, max-age=3600, stale-while-revalidate=86400`

---

## 사이트맵

`/sitemap-seo.xml` → 인덱스 (청크 목록)  
`/sitemap-seo-N.xml` → 청크당 45,000 URL  
`/sitemap-core.xml` → 핵심 페이지 (priority 0.9)

---

## 외부 연동

| 서비스 | 정보 |
|--------|------|
| **Google Apps Script** (리드폼) | `https://script.google.com/macros/s/AKfycbysEqIGSI9Dz4h4jup9Rn72KBNuuCObBifH_wAPSePhHt3wMe4RDBOxlwupxmrPeXqVjw/exec` |
| **네이버 사이트 인증** | `051068c0a0ae6e9caf73755b32cd12430aed1803` |
| **IndexNow 키** | `f7e8d9c0b1a29347e85f0d1c2b3a4956` |
| **Cloudflare Assets** | `./public/` 디렉토리 |

---

## CI/CD

`main` 브랜치 푸시 → `.github/workflows/deploy.yml` → `cloudflare/wrangler-action@v3` 자동 배포  
필요 시크릿: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
