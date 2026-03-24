import {
  VISIT_REGIONS, DONG_TO_GU, DONG_TO_SIDO,
  stripSuffix, stripGuSuffix,
  SUBJECTS, GRADES, ALL_SIDO,
  ALL_REGIONS, ONLINE_DONG_MAP, ONLINE_SIGUNGU_MAP,
  DUPLICATE_SIGUNGUS, DUPLICATE_DONGS,
} from './data/regions.js';
import { SCHOOL_TO_LOCATION } from './data/schools.js';

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
  // 슬래시 제거 후 "과외" 접미사 제거
  let slug = decodeURIComponent(pathname.replace(/^\//, '').replace(/\/$/, ''));
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

// sitemap용 전체 경로 생성
export function getAllRoutes() {
  const routes = [];
  const suffixVariants = (name, stripFn) => [name, stripFn(name)];

  for (const [sido, gus] of Object.entries(VISIT_REGIONS)) {
    for (const [gu, dongs] of Object.entries(gus)) {
      // 시군구 레벨 (중복 시군구는 strip 버전 제외, 시도+시군구 복합 추가)
      const guSlugs = DUPLICATE_SIGUNGUS.has(stripGuSuffix(gu))
        ? [gu] : suffixVariants(gu, stripGuSuffix);
      for (const guSlug of guSlugs) {
        routes.push(`/${guSlug}과외`);
        for (const grade of GRADE_KEYS) {
          routes.push(`/${guSlug}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${guSlug}${grade}${subject}과외`);
          }
        }
      }
      if (DUPLICATE_SIGUNGUS.has(stripGuSuffix(gu))) {
        for (const sg of guSlugs) {
          const combo = sido + sg;
          routes.push(`/${combo}과외`);
          for (const grade of GRADE_KEYS) {
            routes.push(`/${combo}${grade}과외`);
            for (const subject of SUBJECT_KEYS) {
              routes.push(`/${combo}${grade}${subject}과외`);
            }
          }
        }
      }

      // 동 레벨 (2글자 동은 strip 버전 제외)
      for (const dong of dongs) {
        const dongSlugs = dong.length > 2 ? suffixVariants(dong, stripSuffix) : [dong];
        for (const dongSlug of dongSlugs) {
          routes.push(`/${dongSlug}과외`);
          for (const grade of GRADE_KEYS) {
            routes.push(`/${dongSlug}${grade}과외`);
            for (const subject of SUBJECT_KEYS) {
              routes.push(`/${dongSlug}${grade}${subject}과외`);
            }
          }
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${dongSlug}${subject}과외`);
          }
        }
      }
    }
  }

  // 학교 레벨 (정식 학교명 + 단축명, 과목 조합)
  for (const school of SCHOOL_ROUTE_NAMES) {
    routes.push(`/${school}과외`);
    for (const subject of SUBJECT_KEYS) {
      routes.push(`/${school}${subject}과외`);
    }
    const short = school.replace(/학교$/, '');
    if (short !== school) {
      routes.push(`/${short}과외`);
      for (const subject of SUBJECT_KEYS) {
        routes.push(`/${short}${subject}과외`);
      }
    }
  }

  // 시도 레벨 (화상+방문 통합 URL)
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

  // ALL_REGIONS 시군구 + 동 레벨 (방문과외 불가 지역 포함, 학년+과목 조합 추가)
  for (const [sido, sigungus] of Object.entries(ALL_REGIONS)) {
    for (const [sigungu, dongs] of Object.entries(sigungus)) {
      const strippedSg = stripGuSuffix(sigungu);
      const sigunguSlugs = (sigungu === strippedSg || DUPLICATE_SIGUNGUS.has(strippedSg))
        ? [sigungu] : [sigungu, strippedSg];
      for (const sigunguSlug of sigunguSlugs) {
        routes.push(`/${sigunguSlug}과외`);
        for (const subject of SUBJECT_KEYS) {
          routes.push(`/${sigunguSlug}${subject}과외`);
        }
        for (const grade of GRADE_KEYS) {
          routes.push(`/${sigunguSlug}${grade}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${sigunguSlug}${grade}${subject}과외`);
          }
        }
      }

      // 중복 시군구는 시도+시군구 복합 URL 추가 생성 (/인천중구과외, /부산동구과외)
      if (DUPLICATE_SIGUNGUS.has(stripGuSuffix(sigungu))) {
        for (const sg of sigunguSlugs) {
          const combo = sido + sg;
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
      }

      for (const dong of dongs) {
        // 2글자 동은 strip 버전 제외 (/중동과외는 생성, /중과외는 미생성)
        const dongSlugs = dong.length > 2
          ? (dong === stripSuffix(dong) ? [dong] : [dong, stripSuffix(dong)])
          : [dong];
        for (const dongSlug of dongSlugs) {
          routes.push(`/${dongSlug}과외`);
          for (const subject of SUBJECT_KEYS) {
            routes.push(`/${dongSlug}${subject}과외`);
          }
          for (const grade of GRADE_KEYS) {
            routes.push(`/${dongSlug}${grade}과외`);
            for (const subject of SUBJECT_KEYS) {
              routes.push(`/${dongSlug}${grade}${subject}과외`);
            }
          }
        }

        // 중복 동 이름은 시군구+동 복합 URL 추가 생성
        if (DUPLICATE_DONGS.has(dong)) {
          const strippedSigungu = stripGuSuffix(sigungu);
          const strippedDong    = dong.length > 2 ? stripSuffix(dong) : dong;
          for (const sg of sigungu === strippedSigungu ? [sigungu] : [sigungu, strippedSigungu]) {
            for (const d of dong === strippedDong ? [dong] : [dong, strippedDong]) {
              const combo = sg + d;
              routes.push(`/${combo}과외`);
              for (const subject of SUBJECT_KEYS) {
                routes.push(`/${combo}${subject}과외`);
              }
            }
          }
        }
      }
    }
  }

  return [...new Set(routes)];
}
