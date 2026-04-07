import {
  VISIT_REGIONS, DONG_TO_GU, DONG_TO_SIDO,
  stripSuffix, stripGuSuffix,
  SUBJECTS, GRADES, ALL_SIDO,
  ALL_REGIONS, ONLINE_DONG_MAP, ONLINE_SIGUNGU_MAP,
  DUPLICATE_SIGUNGUS, DUPLICATE_DONGS, sigunguSlug,
} from './data/regions.js';
import { SCHOOL_TO_LOCATION } from './data/schools.js';

// ── 교육정보 라우트 정의 ──
export const EDU_ARTICLES = {
  수학: [
    { slug: '수학공부법', title: '수학 공부법 가이드', desc: '수학 성적 올리는 단계별 공부법' },
    { slug: '수학내신전략', title: '수학 내신 전략', desc: '학교 시험 완벽 대비 내신 전략' },
    { slug: '수학오답관리', title: '수학 오답 관리법', desc: '틀린 문제로 실력 키우는 오답 노트 전략' },
    { slug: '수학개념정리', title: '수학 개념 정리 비법', desc: '교과서 개념을 내 것으로 만드는 방법' },
    { slug: '수능수학대비', title: '수능 수학 대비 전략', desc: '수능 수학 고득점 로드맵' },
  ],
  영어: [
    { slug: '영어공부법', title: '영어 공부법 가이드', desc: '영어 실력 향상 단계별 가이드' },
    { slug: '영어내신전략', title: '영어 내신 전략', desc: '학교 영어 시험 만점 전략' },
    { slug: '영어독해전략', title: '영어 독해 전략', desc: '지문 유형별 독해 접근법' },
    { slug: '영어어휘암기', title: '영어 어휘 암기법', desc: '효율적인 영단어 암기 전략' },
    { slug: '수능영어대비', title: '수능 영어 대비 전략', desc: '수능 영어 등급 올리는 로드맵' },
  ],
  국어: [
    { slug: '국어공부법', title: '국어 공부법 가이드', desc: '국어 성적 올리는 핵심 공부법' },
    { slug: '국어내신전략', title: '국어 내신 전략', desc: '국어 내신 만점 완벽 가이드' },
    { slug: '국어비문학전략', title: '비문학 독해 전략', desc: '비문학 지문 정복 가이드' },
    { slug: '국어문학분석', title: '문학 작품 분석법', desc: '문학 작품 해석과 감상의 기술' },
    { slug: '수능국어대비', title: '수능 국어 대비 전략', desc: '수능 국어 안정적 고득점 전략' },
  ],
  과학: [
    { slug: '과학공부법', title: '과학 공부법 가이드', desc: '과학 성적 올리는 학습 전략' },
    { slug: '과학내신전략', title: '과학 내신 전략', desc: '과학 내신 대비 완벽 가이드' },
    { slug: '과학실험대비', title: '과학 실험·수행평가 대비', desc: '수행평가 만점 받는 실험 보고서 전략' },
    { slug: '과학개념학습', title: '과학 개념 학습법', desc: '과학 핵심 개념 체계적 이해법' },
    { slug: '수능과학대비', title: '수능 과학탐구 대비', desc: '수능 과탐 선택과목 전략' },
  ],
  사회: [
    { slug: '사회공부법', title: '사회 공부법 가이드', desc: '사회 과목 효율적 학습법' },
    { slug: '사회내신전략', title: '사회 내신 전략', desc: '사회 내신 대비 핵심 전략' },
    { slug: '사회서술형대비', title: '사회 서술형 대비', desc: '서술형 평가 고득점 전략' },
    { slug: '사회시사연계', title: '사회 시사 연계 학습', desc: '시사 이슈와 교과 연계 학습법' },
    { slug: '수능사회대비', title: '수능 사회탐구 대비', desc: '수능 사탐 고득점 로드맵' },
  ],
  한국사: [
    { slug: '한국사공부법', title: '한국사 공부법 가이드', desc: '한국사 암기법과 흐름 정리' },
    { slug: '한국사내신전략', title: '한국사 내신 전략', desc: '한국사 내신 만점 전략' },
    { slug: '한국사시대정리', title: '한국사 시대별 정리', desc: '시대별 핵심 사건·인물 총정리' },
    { slug: '한국사능력검정', title: '한국사능력검정시험 대비', desc: '한능검 1급 합격 전략' },
    { slug: '수능한국사대비', title: '수능 한국사 대비', desc: '수능 한국사 만점 전략' },
  ],
};

// 교육정보 slug → 기사 정보 매핑 (O(1) 조회)
export const EDU_SLUG_MAP = {};
for (const [subject, articles] of Object.entries(EDU_ARTICLES)) {
  for (const article of articles) {
    EDU_SLUG_MAP[article.slug] = { ...article, subject };
  }
}

// 전체 동 목록 (방문가능)
const ALL_DONGS = Object.values(VISIT_REGIONS)
  .flatMap(gus => Object.values(gus).flat());

// 전체 시군구 목록
const ALL_GUS = Object.values(VISIT_REGIONS)
  .flatMap(gus => Object.keys(gus));

const SUBJECT_KEYS = Object.keys(SUBJECTS);
const GRADE_KEYS = Object.keys(GRADES);

// ── 시군구+동 복합 맵 (중복 동 이름 처리, O(1) 조회) ──
// 키: sigungu+dong 의 4가지 접미사 조합, 값: {sido, sigungu, dong}
const SIGUNGU_DONG_MAP = {};



// 시도+시군구 복합 맵 (중복 시군구 처리: /인천중구과외 → {sido:'인천', sigungu:'중구'})
const SIDO_SIGUNGU_MAP = {};

{
  for (const [sido, sigungus] of Object.entries(ALL_REGIONS)) {
    for (const [sigungu, dongs] of Object.entries(sigungus)) {
      for (const dong of dongs) {
        const sg0 = sigungu;
        const sg1 = stripGuSuffix(sigungu);
        const d0  = dong;
        const d1  = stripSuffix(dong);
        for (const sg of sg0 === sg1 ? [sg0] : [sg0, sg1]) {
          for (const d of d0 === d1 ? [d0] : [d0, d1]) {
            if (!SIGUNGU_DONG_MAP[sg + d]) {
              SIGUNGU_DONG_MAP[sg + d] = { sido, sigungu, dong };
            }
          }
        }
      }
      // 시도+시군구 복합 맵 구성
      const sg0 = sigungu;
      const sg1 = stripGuSuffix(sigungu);
      for (const sg of sg0 === sg1 ? [sg0] : [sg0, sg1]) {
        const key = sido + sg;
        if (!SIDO_SIGUNGU_MAP[key]) {
          SIDO_SIGUNGU_MAP[key] = { sido, sigungu };
        }
      }
    }
  }
}

// ── 학교 라우팅 맵 (모듈 로드 시 1회 생성, O(1) 조회) ──
// SCHOOL_TO_LOCATION 전체 기반 (전국 학교, dong 정보 있는 것 우선)
const SCHOOL_SLUG_MAP = {};       // 정식명/단축명 slug → 정식 학교명
const SCHOOL_ROUTE_NAMES = [];    // 사이트맵용 정식 학교명 목록

for (const school of Object.keys(SCHOOL_TO_LOCATION)) {
  if (SCHOOL_SLUG_MAP[school]) continue;    // 이미 등록된 학교 중복 방지
  SCHOOL_ROUTE_NAMES.push(school);
  SCHOOL_SLUG_MAP[school] = school;         // 정식명: "가락중학교"
  const short = school.replace(/학교$/, '');
  if (short !== school && !SCHOOL_SLUG_MAP[short]) {
    SCHOOL_SLUG_MAP[short] = school;        // 단축명: "가락중"
  }
}

/**
 * URL 경로를 파싱해서 페이지 타입과 파라미터를 반환
 * @param {string} pathname - 예: /고덕동수학과외, /대치동화상과외
 * @returns {{ type, params } | null}
 */
export function parseRoute(pathname) {
  let slug = decodeURIComponent(pathname.replace(/^\//, '').replace(/\/$/, ''));

  // 교육정보 페이지 매칭 (과외 접미사 없는 별도 라우트)
  if (EDU_SLUG_MAP[slug]) {
    return { type: 'edu', params: EDU_SLUG_MAP[slug] };
  }

  // 슬래시 제거 후 "과외" 접미사 제거
  if (!slug.endsWith('과외')) return null;
  slug = slug.replace(/과외$/, '');

  // 화상과외 여부 확인 (과목/학년 추출 전에 체크)
  const isOnline = slug.endsWith('화상');
  if (isOnline) slug = slug.slice(0, -2);

  // 과목 추출 (뒤에서)
  let subject = null;
  for (const s of SUBJECT_KEYS) {
    if (slug.endsWith(s)) {
      subject = s;
      slug = slug.slice(0, -s.length);
      break;
    }
  }

  // 학년 추출 (뒤에서)
  let grade = null;
  for (const g of GRADE_KEYS) {
    if (slug.endsWith(g)) {
      grade = g;
      slug = slug.slice(0, -g.length);
      break;
    }
  }

  if (!slug && subject && !grade && !isOnline) return { type: 'subject', params: { subject } };
  if (!slug) return null;

  // 동 매칭 (정확히 or 접미사 없는 버전, 2글자 동은 strip 매칭 제외)
  for (const dong of ALL_DONGS) {
    if (slug === dong || (dong.length > 2 && slug === stripSuffix(dong))) {
      const gu = DONG_TO_GU[dong];
      const sido = DONG_TO_SIDO[dong];
      return {
        type: 'dong',
        params: { dong, gu, sido, grade, subject, withSuffix: slug === dong }
      };
    }
  }

  // 시군구 매칭 (중복 시군구는 strip 매칭 제외)
  for (const gu of ALL_GUS) {
    const isStrip = slug === stripGuSuffix(gu) && slug !== gu;
    if (slug === gu || (isStrip && !DUPLICATE_SIGUNGUS.has(slug))) {
      const sido = Object.entries(VISIT_REGIONS).find(([, gus]) =>
        Object.keys(gus).includes(gu))?.[0];
      return {
        type: 'gu',
        params: { gu, sido, grade, subject, withSuffix: slug === gu }
      };
    }
  }

  // 시도 매칭
  for (const sido of ALL_SIDO) {
    if (slug === sido) {
      return { type: 'sido', params: { sido, grade, subject } };
    }
  }

  // 학교 매칭 (O(1)) - 방문과외만
  if (!isOnline) {
    const canonicalSchool = SCHOOL_SLUG_MAP[slug];
    if (canonicalSchool) {
      const loc  = SCHOOL_TO_LOCATION[canonicalSchool];
      const dong = loc?.d || '';
      const gu   = loc?.g || '';
      const sido = loc?.s || '';
      return {
        type: 'school',
        params: { schoolName: canonicalSchool, dong, gu, sido, grade, subject },
      };
    }
  }

  // 온라인 라우팅 (화상 URL + 방문과외 불가 지역의 일반 과외 URL)
  // 시도: isOnline일 때만 (일반 URL은 위 시도 매칭 블록에서 이미 처리됨)
  if (isOnline) {
    for (const sido of ALL_SIDO) {
      if (slug === sido) {
        return { type: 'online', params: { level: 'sido', sido, grade, subject } };
      }
    }
  }

  // 시군구 매칭 - 방문과외 불가 지역도 포함 (정확히 or 접미사 없는 버전)
  const sigunguSido = ONLINE_SIGUNGU_MAP[slug];
  if (sigunguSido) {
    return { type: 'online', params: { level: 'sigungu', sido: sigunguSido, sigungu: slug, grade, subject } };
  }
  for (const [sigungu, sido] of Object.entries(ONLINE_SIGUNGU_MAP)) {
    const stripped = stripGuSuffix(sigungu);
    if (slug === stripped && !DUPLICATE_SIGUNGUS.has(stripped)) {
      return { type: 'online', params: { level: 'sigungu', sido, sigungu, grade, subject } };
    }
  }

  // 시도+시군구 복합 매칭 (중복 시군구 처리: /인천중구과외, /부산동구과외)
  const sgInfo = SIDO_SIGUNGU_MAP[slug];
  if (sgInfo) {
    return { type: 'online', params: { level: 'sigungu', sido: sgInfo.sido, sigungu: sgInfo.sigungu, grade, subject } };
  }

  // 동 매칭 - 방문과외 불가 지역도 포함 (정확히 or 접미사 없는 버전, 2글자 동 strip 제외)
  const dongInfo = ONLINE_DONG_MAP[slug];
  if (dongInfo) {
    return { type: 'online', params: { level: 'dong', sido: dongInfo.sido, sigungu: dongInfo.sigungu, dong: slug, grade, subject } };
  }
  for (const [dong, info] of Object.entries(ONLINE_DONG_MAP)) {
    if (dong.length > 2 && slug === stripSuffix(dong)) {
      return { type: 'online', params: { level: 'dong', sido: info.sido, sigungu: info.sigungu, dong, grade, subject } };
    }
  }

  // 시군구+동 복합 매칭 (중복 동 이름 처리: /부평구청천동과외, /수원중앙동과외)
  const sdInfo = SIGUNGU_DONG_MAP[slug];
  if (sdInfo) {
    return { type: 'online', params: { level: 'dong', sido: sdInfo.sido, sigungu: sdInfo.sigungu, dong: sdInfo.dong, grade, subject } };
  }

  return null;
}

// sitemap용 전체 경로 생성 (canonical URL만 포함, suffix-less 변형 제외)
export function getAllRoutes() {
  const routes = [];

  for (const [sido, gus] of Object.entries(VISIT_REGIONS)) {
    for (const [gu, dongs] of Object.entries(gus)) {
      // 시군구 레벨 (정식명만, strip 버전 제외)
      routes.push(`/${gu}과외`);
      for (const grade of GRADE_KEYS) {
        routes.push(`/${gu}${grade}과외`);
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${gu}${grade}${subject}과외`);
        }
      }
      // 중복 시군구는 시도+시군구 복합 URL 추가
      if (DUPLICATE_SIGUNGUS.has(stripGuSuffix(gu))) {
        const combo = sido + gu;
        routes.push(`/${combo}과외`);
        for (const grade of GRADE_KEYS) {
          routes.push(`/${combo}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${combo}${grade}${subject}과외`);
          }
        }
      }

      // 동 레벨 (정식명만, strip 버전 제외)
      for (const dong of dongs) {
        routes.push(`/${dong}과외`);
        for (const grade of GRADE_KEYS) {
          routes.push(`/${dong}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${dong}${grade}${subject}과외`);
          }
        }
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${dong}${subject}과외`);
        }
      }
    }
  }

  // 학교 레벨 (정식 학교명만, 단축명 제외)
  for (const school of SCHOOL_ROUTE_NAMES) {
    routes.push(`/${school}과외`);
    for (const subject of SUBJECT_KEYS) {
      routes.push(`/${school}${subject}과외`);
    }
  }

  // 시도 레벨
  for (const sido of ALL_SIDO) {
    routes.push(`/${sido}과외`);
    for (const subject of SUBJECT_KEYS) {
      routes.push(`/${sido}${subject}과외`);
    }
    for (const grade of GRADE_KEYS) {
      routes.push(`/${sido}${grade}과외`);
      for (const subject of SUBJECT_KEYS) {
        routes.push(`/${sido}${grade}${subject}과외`);
      }
    }
  }

  // ALL_REGIONS 시군구 + 동 레벨 (방문과외 불가 지역 포함, 정식명만)
  for (const [sido, sigungus] of Object.entries(ALL_REGIONS)) {
    for (const [sigungu, dongs] of Object.entries(sigungus)) {
      routes.push(`/${sigungu}과외`);
      for (const subject of SUBJECT_KEYS) {
        routes.push(`/${sigungu}${subject}과외`);
      }
      for (const grade of GRADE_KEYS) {
        routes.push(`/${sigungu}${grade}과외`);
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${sigungu}${grade}${subject}과외`);
        }
      }

      // 중복 시군구는 시도+시군구 복합 URL 추가
      if (DUPLICATE_SIGUNGUS.has(stripGuSuffix(sigungu))) {
        const combo = sido + sigungu;
        routes.push(`/${combo}과외`);
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${combo}${subject}과외`);
        }
        for (const grade of GRADE_KEYS) {
          routes.push(`/${combo}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${combo}${grade}${subject}과외`);
          }
        }
      }

      for (const dong of dongs) {
        routes.push(`/${dong}과외`);
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${dong}${subject}과외`);
        }
        for (const grade of GRADE_KEYS) {
          routes.push(`/${dong}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${dong}${grade}${subject}과외`);
          }
        }

        // 중복 동 이름은 시군구+동 복합 URL (정식명만)
        if (DUPLICATE_DONGS.has(dong)) {
          const combo = sigungu + dong;
          routes.push(`/${combo}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${combo}${subject}과외`);
          }
        }
      }
    }
  }

  return [...new Set(routes)];
}

// 핵심 페이지 경로 (sitemap-core.xml용, priority 0.9)
// 시도 전체 조합 + 방문가능 시군구 base URL + 교육정보 페이지
export function getCoreRoutes() {
  const routes = [];

  // 교육정보 페이지 (핵심 콘텐츠)
  for (const articles of Object.values(EDU_ARTICLES)) {
    for (const a of articles) {
      routes.push(`/${a.slug}`);
    }
  }

  // 시도 레벨 (과목·학년 전체 조합)
  for (const sido of ALL_SIDO) {
    routes.push(`/${sido}과외`);
    for (const s of SUBJECT_KEYS) routes.push(`/${sido}${s}과외`);
    for (const g of GRADE_KEYS) {
      routes.push(`/${sido}${g}과외`);
      for (const s of SUBJECT_KEYS) routes.push(`/${sido}${g}${s}과외`);
    }
  }

  // 방문가능 시군구 base URL (정식명만, strip 버전 제외)
  for (const [sido, gus] of Object.entries(VISIT_REGIONS)) {
    for (const gu of Object.keys(gus)) {
      const slug = sigunguSlug(sido, gu);
      routes.push(`/${slug}과외`);
    }
  }

  return [...new Set(routes)];
}
