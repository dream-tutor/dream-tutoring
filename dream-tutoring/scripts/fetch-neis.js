#!/usr/bin/env node
// ⚠️  나중에 사용 (현재 비활성 - package.json에서 제거됨)
// 실행: NEIS_KEY=발급키 node --input-type=module scripts/fetch-neis.js
/**
 * NEIS API에서 전국 학교 데이터를 수집해 schools.js를 생성합니다.
 *
 * 사용법:
 *   1. https://open.neis.go.kr 에서 API 키 발급
 *   2. NEIS_KEY=발급키 node scripts/fetch-neis.js
 *   3. 생성된 schools.js를 프로젝트 루트에 교체
 *
 * 수집 대상: 초등학교 / 중학교 / 고등학교 전국 (약 12,028개)
 */

import { writeFileSync } from 'fs';
import { setTimeout } from 'timers/promises';

const API_KEY  = process.env.NEIS_KEY || 'OPEN_API_KEY_HERE';
const BASE_URL = 'https://open.neis.go.kr/hub/schoolInfo';
const PAGE_SIZE = 1000;

// 시도코드 매핑 (NEIS → 우리 인덱스)
const SIDO_CODE_MAP = {
  B10: 0,  // 서울
  C10: 3,  // 부산
  D10: 4,  // 대구
  E10: 2,  // 인천
  F10: 6,  // 광주
  G10: 5,  // 대전
  H10: 7,  // 울산
  I10: 8,  // 세종
  J10: 1,  // 경기
  K10: 9,  // 강원
  M10: 10, // 충북
  N10: 11, // 충남
  P10: 12, // 전북
  Q10: 13, // 전남
  R10: 14, // 경북
  S10: 15, // 경남
  T10: 16, // 제주
};

// 학교종류 매핑
const TYPE_MAP = {
  '초등학교': 0,
  '중학교':   1,
  '고등학교': 2,
};

/**
 * NEIS API 호출 (페이지네이션)
 */
async function fetchPage(sidoCode, schoolKind, page) {
  const params = new URLSearchParams({
    KEY:               API_KEY,
    Type:              'json',
    pIndex:            page,
    pSize:             PAGE_SIZE,
    ATPT_OFCDC_SC_CODE: sidoCode,
    SCHUL_KND_SC_NM:   schoolKind,
  });
  const res = await fetch(`${BASE_URL}?${params}`);
  const json = await res.json();

  if (json.RESULT?.CODE === 'INFO-200') return []; // 데이터 없음
  if (!json.schoolInfo) {
    console.warn('예상치 못한 응답:', JSON.stringify(json).slice(0, 200));
    return [];
  }
  return json.schoolInfo[1]?.row || [];
}

/**
 * 주소에서 동/면/읍 추출
 * "경기도 광명시 철산동 38-1" → "철산동"
 */
function extractDong(address) {
  const m = address.match(/(\S+(?:동|면|읍|가|리))\s/);
  return m ? m[1] : '';
}

/**
 * 시군구 이름 정규화
 * "수원시 영통구" → "수원시" (단순화) 또는 구 정보 포함
 */
function extractSigungu(row) {
  // LCTN_SC_NM: "경기도 수원시 영통구"
  const parts = row.LCTN_SC_NM?.split(' ') || [];
  // parts[1] = 시군구, parts[2] = 구(있는 경우)
  if (parts.length >= 3) {
    const city = parts[1]; // 수원시, 성남시 등
    const gu   = parts[2]; // 영통구, 분당구 등 (특별시/광역시 직할 구도 여기 해당)
    // 광역시의 경우 parts[1]이 바로 구
    if (city.endsWith('구') || city.endsWith('군')) return city;
    // 특례시/도시: "수원시 영통구" → 검색 편의상 "수원시"로 단일화
    return city;
  }
  return parts[1] || '';
}

async function main() {
  console.log('NEIS 학교 데이터 수집 시작...');
  const schoolKinds = ['초등학교', '중학교', '고등학교'];
  const sidoCodes   = Object.keys(SIDO_CODE_MAP);

  const result = {};
  let total = 0;

  for (const sidoCode of sidoCodes) {
    for (const kind of schoolKinds) {
      let page = 1;
      while (true) {
        process.stdout.write(`  ${sidoCode} ${kind} p${page}...`);
        const rows = await fetchPage(sidoCode, kind, page);
        if (rows.length === 0) { console.log(' (끝)'); break; }

        for (const row of rows) {
          const id      = row.SD_SCHUL_CODE;
          const name    = row.SCHUL_NM;
          const typeIdx = TYPE_MAP[row.SCHUL_KND_SC_NM];
          const sidoIdx = SIDO_CODE_MAP[row.ATPT_OFCDC_SC_CODE];
          const sigungu = extractSigungu(row);
          const dong    = extractDong(row.ORG_RDNMA || row.LCTN_SC_NM || '');

          if (typeIdx === undefined || sidoIdx === undefined) continue;
          result[id] = [name, typeIdx, sidoIdx, sigungu, dong];
        }

        console.log(` ${rows.length}개`);
        total += rows.length;
        if (rows.length < PAGE_SIZE) break;
        page++;
        await setTimeout(200); // API 호출 간격 (rate limit 방지)
      }
    }
  }

  console.log(`\n총 ${total}개 학교 수집 완료`);
  generateFile(result);
}

function generateFile(schools) {
  const SIDO = ['서울','경기','인천','부산','대구','대전','광주','울산','세종','강원','충북','충남','전북','전남','경북','경남','제주'];
  const lines = Object.entries(schools).map(([id, s]) =>
    `  "${id}": ${JSON.stringify(s)},`
  );

  const content = `// 전국 학교 데이터 (NEIS API 자동 생성)
// 총 ${Object.keys(schools).length}개 학교
// 형식: schoolId → [이름, 종류(0=초/1=중/2=고), 시도인덱스, 시군구, 동]
// 시도: ${SIDO.map((s,i) => `${i}=${s}`).join(', ')}

export const SCHOOL_TYPE = ['초등학교', '중학교', '고등학교'];

export const SCHOOLS = {
${lines.join('\n')}
};

export const BY_DONG    = {};
export const BY_SIGUNGU = {};
export const BY_SIDO    = {};
for (const [id, s] of Object.entries(SCHOOLS)) {
  const [, , sidoIdx, sigungu, dong] = s;
  (BY_DONG[dong]       ||= []).push(id);
  (BY_SIGUNGU[sigungu] ||= []).push(id);
  (BY_SIDO[sidoIdx]    ||= []).push(id);
}
`;

  writeFileSync('schools.js', content, 'utf8');
  console.log('schools.js 생성 완료!');
}

main().catch(console.error);
