import { buildHead, buildFAQSchema, buildHomeSchema } from './seo.js';
import { layout, ctaBox, faqSection, consultForm } from './template.js';
import { SUBJECTS, GRADES, SIDO_DESC, VISIT_REGIONS, GU_DESC, DONG_DESC, stripSuffix, stripGuSuffix, ALL_REGIONS, ONLINE_DONG_MAP, sigunguSlug, dongSlug } from './data/regions.js';
import { DONG_SCHOOLS, SCHOOL_TO_LOCATION } from './data/schools.js';
import { EDU_ARTICLES } from './router.js';

// 동·구 → 학교 목록 역방향 맵 (모듈 로드 시 1회 생성)
// 중복 이름 충돌 방지: 동 키 = '시군구|동', 구 키 = '시도|시군구'
const DONG_TO_SCHOOLS = {};  // key: gu|dong
const GU_TO_SCHOOLS = {};    // key: sido|gu
for (const [school, loc] of Object.entries(SCHOOL_TO_LOCATION)) {
  if (loc.d && loc.g) {
    const dk = loc.g + '|' + loc.d;
    (DONG_TO_SCHOOLS[dk] = DONG_TO_SCHOOLS[dk] || []).push(school);
  }
  if (loc.g && loc.s) {
    const gk = loc.s + '|' + loc.g;
    (GU_TO_SCHOOLS[gk] = GU_TO_SCHOOLS[gk] || []).push(school);
  }
}

const PHONE_LINK = '01048645345';

// ── SVG 일러스트 배너 (깨지지 않는 인라인) ──────────────
function tutoringImage(seed) {
  const idx = ((seed - 1) % 6) + 1;
  return `<section class="tutor-img-sec">
  <img src="/images/tutoring${idx}.jpg" alt="드림과외 1:1 맞춤 수업" loading="lazy" width="1200" height="360">
</section>`;
}

// ── 이미지 + 동기부여 메시지 콜아웃 (페이지 중간 삽입) ────
function imageCallout(location, seed, hashKey = null) {
  const imgIdx = ((seed - 1) % 6) + 1;
  const v = getVariant(hashKey || location, seed + 10, 12);
  const messages = [
    { title: '공부의 방향을 잡는 것이<br>성적 향상의 시작입니다', desc: '드림과외 선생님이 학생에게 맞는 공부법을 찾아드립니다.' },
    { title: '혼자 고민하지 마세요<br>전문가가 함께합니다', desc: '학습 상담부터 시험 대비까지, 드림과외가 동행합니다.' },
    { title: '지금 시작하면<br>다음 시험이 달라집니다', desc: '미루지 마세요. 빠른 상담이 빠른 변화를 만듭니다.' },
    { title: '아이의 가능성을<br>믿어주세요', desc: '좋은 선생님을 만나면 공부가 즐거워집니다.' },
    { title: '매일 조금씩,<br>꾸준히 쌓이는 실력', desc: '1:1 과외로 매일 성장하는 우리 아이를 만나보세요.' },
    { title: '시험 걱정,<br>이제 그만하셔도 됩니다', desc: '드림과외 선생님이 시험 대비를 책임져드립니다.' },
    { title: '성적이 오르는 공부,<br>방법이 다릅니다', desc: '학생 맞춤 커리큘럼으로 효율적인 학습을 시작하세요.' },
    { title: '우리 아이에게 딱 맞는<br>선생님이 있습니다', desc: '24시간 내 매칭, 첫 30분 무료 체험까지.' },
    { title: '공부 습관이 바뀌면<br>결과가 달라집니다', desc: '드림과외 선생님과 함께 올바른 학습 습관을 만드세요.' },
    { title: '빠른 상담 한 번이<br>1년을 바꿉니다', desc: '지금 연락 주시면 오늘 안에 상담해드립니다.' },
    { title: '포기하기엔<br>아직 이릅니다', desc: '어떤 학생이든 맞는 방법이 있습니다. 드림과외가 찾아드립니다.' },
    { title: '학원에서 안 되면<br>과외가 답입니다', desc: '1:1 맞춤 수업으로 부족한 부분만 집중 보완하세요.' },
  ];
  const msg = messages[v];
  return `<section class="sec" style="padding:0">
  <div class="wrap" style="padding:0 20px">
    <div class="img-callout">
      <img src="/images/tutoring${imgIdx}.jpg" alt="드림과외 학습 이미지" loading="lazy" width="1200" height="240">
      <div class="img-callout-text">
        <h3>${msg.title}</h3>
        <p>${msg.desc}</p>
      </div>
    </div>
  </div>
</section>`;
}

// ── 공통: 방문/화상 요금 텍스트 설명 ──────────────────
function priceTableHtml(locationLabel, subject, isVisit) {
  const subj = subject ? ` ${subject}` : '';
  const visitBlock = isVisit ? `
    <div class="price-text-block">
      <h3>🏠 방문과외 예상 비용</h3>
      <p>초등 월 26만원 / 중등 월 30만원 / 고1·2 월 34만원 / 고3 월 38만원</p>
    </div>` : '';
  return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">PRICING</span>
    <h2 class="sec-title">${locationLabel}${subj} 과외 <em>예상 비용</em></h2>
    ${visitBlock}
    <div class="price-text-block">
      <h3>💻 화상과외 예상 비용</h3>
      <p>초등 월 24만원 / 중등 월 27만원 / 고1·2 월 31만원 / 고3 월 33만원</p>
    </div>
    <p class="price-note">※ 첫 30분 무료 체험 제공 · 정확한 비용은 무료 상담 후 안내</p>
    <p class="price-note">(주 2회·1시간 기준, 수업 횟수·시간에 따라 달라질 수 있습니다)</p>
  </div>
</section>`;
}

// ── 동 레벨 페이지 ──────────────────────────────────────
export function renderDongPage({ dong, gu, sido, grade, subject, withSuffix }) {
  const displayDong = withSuffix ? dong : stripSuffix(dong);
  const gradeInfo = grade ? GRADES[grade] : null;
  const subjectInfo = subject ? SUBJECTS[subject] : null;
  const isVisit = Object.values(VISIT_REGIONS)
    .flatMap(g => Object.values(g).flat()).includes(dong);

  const keyword = `${displayDong}${grade || ''}${subject || ''}과외`;
  const canonicalKeyword = `${dong}${grade || ''}${subject || ''}과외`;
  const title = `${keyword} | 1:1 전문 드림과외`;
  const description = [
    `${displayDong} ${grade || '초중고'} ${subject || '전과목'} 과외 전문.`,
    isVisit ? '방문·화상 모두 가능.' : '화상과외 가능.',
    `검증된 선생님 24시간 내 매칭. 첫 30분 무료 체험.`,
  ].join(' ');

  const url = `/${encodeURIComponent(canonicalKeyword)}`;
  const head = buildHead({ title, description, url, type: isVisit ? 'local' : 'online' });

  const faqs = buildFAQs({ dong: displayDong, gu, grade, subject, isVisit });
  const faqSchema = buildFAQSchema(faqs);
  const nearSchoolName = DONG_SCHOOLS[dong] || null;
  const relatedLinks = buildDongRelatedLinks({ dong, displayDong, gu, grade, subject, nearSchoolName });


  const subjectLabel = subjectInfo ? subjectInfo.desc : (subject ? `${subject} 전 과정` : '전 과목');
  const gradeLabel = gradeInfo ? gradeInfo.desc : '초·중·고 전 학년';
  const gradeDetail = gradeInfo ? gradeInfo.detail : '기초부터 심화까지';
  const subjectEmoji = subjectInfo ? subjectInfo.emoji : '📚';
  const visitText = isVisit
    ? '방문과외·화상과외 모두 가능합니다.'
    : '화상과외로 집에서 편리하게 수업 받을 수 있습니다.';

  // 복합키: 동+구+시도 → 같은 시군구 내 동끼리도 변형 분산
  const hashKey = dong + gu + sido;
  const vH = getVariant(hashKey, 0, 12);  // hero desc
  const vW = getVariant(hashKey, 1, 12);  // why desc
  const vP = getVariant(hashKey, 2, 12);  // process desc
  const vO = getVariant(hashKey, 3,  3);  // section order (3가지 순서)
  const vC = getVariant(hashKey, 4, 12);  // cta / consult 포인트
  const v  = vH; // buildLearningSection 등 기존 호환용

  const areaDesc = DONG_DESC[dong] || GU_DESC[gu] || `${gu}에 위치한 주거 지역입니다.`;
  const heroDescArr = [
    `${areaDesc} 드림과외는 ${displayDong} 인근에서 학생들을 지도해온 검증된 선생님을 연결해드립니다. ${gradeLabel} ${subjectLabel} 1:1 전문 과외로, ${visitText}`,
    `${areaDesc} ${displayDong} 학생들의 성적 향상을 위해 경험 있는 전문 선생님을 빠르게 매칭해드립니다. ${gradeLabel} ${subjectLabel} 과외로, ${visitText}`,
    `${areaDesc} 드림과외 선생님은 ${displayDong} 학교 내신 출제 경향을 파악하고 있습니다. ${gradeLabel} ${subjectLabel} 1:1 맞춤 수업으로, ${visitText}`,
    `${areaDesc} 성적이 제자리라면 아직 맞는 선생님을 못 만난 겁니다. ${displayDong} 담당 드림과외 선생님이 ${gradeLabel} ${subjectLabel}을 책임집니다. ${visitText}`,
    `${areaDesc} ${displayDong}에서 ${subjectLabel} 과외를 찾고 계신가요? 드림과외가 ${gradeLabel} 수준에 딱 맞는 선생님을 24시간 내 연결해드립니다. ${visitText}`,
    `${areaDesc} ${displayDong} 지역 학부모님들이 선택한 드림과외입니다. ${gradeLabel} ${subjectLabel} 전문 선생님이 아이의 부족한 부분을 정확히 짚어드립니다. ${visitText}`,
    `${areaDesc} 혼자 공부하면 어디서 막히는지 모릅니다. 드림과외 ${displayDong} 선생님이 ${gradeLabel} ${subjectLabel} 취약점부터 체계적으로 잡아드립니다. ${visitText}`,
    `${areaDesc} 드림과외는 ${displayDong} 학생 한 명 한 명의 학교·수준·목표에 맞는 선생님을 직접 골라 연결합니다. ${gradeLabel} ${subjectLabel} 1:1 수업, ${visitText}`,
    `${displayDong} ${gradeLabel} ${subjectLabel} 과외 선생님을 찾으신다면 드림과외로 연락 주세요. 검증된 선생님을 24시간 내 매칭해드리며, ${visitText}`,
    `${areaDesc} 다음 시험에서 반드시 오르고 싶다면 지금 바로 시작하세요. 드림과외 ${displayDong} ${subjectLabel} 선생님이 ${gradeLabel} 학생의 목표 달성을 도와드립니다. ${visitText}`,
    `${areaDesc} 선생님이 바뀌면 성적이 달라집니다. 드림과외는 ${displayDong} ${gradeLabel} ${subjectLabel} 학생에게 맞는 선생님을 신중하게 연결합니다. ${visitText}`,
    `${areaDesc} ${displayDong}에서 드림과외를 통해 수업을 시작한 학생들이 다음 시험에서 달라집니다. ${gradeLabel} ${subjectLabel} 1:1 맞춤 수업, ${visitText}`,
  ];
  const heroDesc = heroDescArr[vH];

  // WHY 섹션 설명 (12가지 변형)
  const whyDescArr = [
    `${displayDong} 학부모님들의 교육 관심에 부응해, 드림과외는 검증된 전문 선생님을 연결합니다. 학생 수준과 목표에 맞는 맞춤 커리큘럼을 제공하며, ${gradeDetail}을 목표로 하는 1:1 맞춤 수업으로 성적 향상을 함께 만들어드립니다.`,
    `좋은 과외는 '누가 가르치느냐'에서 시작합니다. 드림과외 ${displayDong} 선생님은 학교 내신 기출을 꿰뚫고 있으며, 아이의 약점부터 정확히 짚어드립니다. ${gradeDetail}까지, 체계적으로 함께합니다.`,
    `드림과외는 단순한 과외 중개가 아닙니다. ${displayDong} 학생의 학습 특성을 파악해 가장 잘 맞는 선생님을 직접 골라 드립니다. ${gradeDetail} 목표로 1:1 집중 관리합니다.`,
    `성적이 오르지 않는 데는 이유가 있습니다. 개념이 흔들리거나, 선생님과 안 맞거나. 드림과외 ${displayDong}은 그 두 가지를 동시에 잡습니다. ${gradeDetail}을 중심으로 확실히 관리합니다.`,
    `${displayDong} 학생 한 명 한 명이 다릅니다. 드림과외는 아이의 현재 수준·목표·학교에 맞게 선생님을 매칭하고, ${gradeDetail} 달성을 위한 커리큘럼을 직접 설계합니다.`,
    `검증 없는 선생님은 위험합니다. 드림과외는 30년 교육 노하우로 학력·경력·수업 능력을 직접 확인한 선생님만 연결합니다. ${displayDong} 학생의 ${gradeDetail}이 목표입니다.`,
    `처음 수업이 마음에 들지 않으면 선생님을 바꿔드립니다. 드림과외는 ${displayDong} 학생과 딱 맞는 선생님을 찾을 때까지 함께합니다. ${gradeDetail}까지 책임지겠습니다.`,
    `드림과외 ${displayDong} 선생님은 학생 학교의 시험 출제 경향을 알고 있습니다. 교과서 중심 내신 대비부터 ${gradeDetail}까지, 현장 경험으로 쌓은 노하우로 지도합니다.`,
    `시험이 끝날 때마다 "이번엔 왜 또..."라는 말이 반복된다면, 방법을 바꿀 때입니다. 드림과외는 ${displayDong} ${gradeDetail}에 맞는 가장 효율적인 방법을 알고 있습니다.`,
    `30년간 수만 명의 학생을 지도한 경험이 드림과외에 있습니다. ${displayDong}에서도 그 노하우 그대로, ${gradeDetail}을 목표로 1:1 맞춤 수업을 진행합니다.`,
    `드림과외는 선생님 매칭 후에도 꾸준히 관리합니다. 수업 피드백을 정기적으로 확인하며, ${displayDong} 학생이 ${gradeDetail} 목표를 달성할 수 있도록 함께 조율합니다.`,
    `혼자 공부하는 것과 1:1로 배우는 것은 속도가 다릅니다. 드림과외 ${displayDong} 선생님이 ${gradeDetail}까지의 최단 경로를 안내해드립니다.`,
  ];
  const whyDesc = whyDescArr[vW];

  // PROCESS 섹션 설명 (12가지 변형)
  const processDescArr = [
    `복잡한 절차 없이 빠르고 간편하게 ${displayDong} 전문 선생님을 만나보세요. 전화 한 통, 폼 작성 한 번으로 내 아이에게 꼭 맞는 선생님을 찾아드립니다.`,
    `전화 한 통이면 충분합니다. 학교·과목·학년을 말씀해주시면 나머지는 저희가 다 합니다. ${displayDong} 전문 선생님을 24시간 내 연결해드립니다.`,
    `신청부터 수업 시작까지 딱 하루면 됩니다. ${displayDong} 지역 담당자가 직접 검토해 아이에게 맞는 선생님을 골라드립니다.`,
    `여러 과외 플랫폼을 비교할 필요 없습니다. 드림과외에 연락 한 번이면 ${displayDong} 전문 선생님이 내일부터 수업을 시작합니다.`,
    `처음 과외를 알아보는 분도 걱정 마세요. 드림과외 상담사가 처음부터 끝까지 안내해드립니다. ${displayDong} 지역 선생님 매칭, 어렵지 않습니다.`,
    `바쁜 학부모님을 위해 최대한 간단하게 만들었습니다. 연락처와 과목만 알려주시면 ${displayDong} 맞춤 선생님을 바로 찾아드립니다.`,
    `상담 → 매칭 → 체험 → 시작. 딱 4단계입니다. ${displayDong} 지역 전문 선생님과의 만남, 생각보다 빠릅니다.`,
    `기다리지 않아도 됩니다. 드림과외는 신청 후 24시간 이내에 ${displayDong} 담당 선생님을 연결해드립니다. 시험이 가까울수록 빠르게 움직이세요.`,
    `선생님 찾는 데 시간 낭비하지 마세요. 드림과외가 ${displayDong} 학생에게 맞는 선생님을 직접 검토해서 추천해드립니다.`,
    `상담은 완전 무료입니다. 부담 없이 연락주시면 ${displayDong} 지역 선생님 현황과 일정을 바로 안내해드립니다.`,
    `이미 수업 중인 선생님이 맞지 않아도 괜찮습니다. 드림과외는 언제든 ${displayDong} 다른 선생님으로 교체해드립니다.`,
    `지금 신청하시면 이번 주 안에 수업이 시작됩니다. ${displayDong} 전문 선생님 매칭, 지금 바로 시작해보세요.`,
  ];
  const processDesc = processDescArr[vP];

  // CTA 포인트 (12가지 변형 세트)
  const ctaPointSets = [
    ['상담 후 24시간 내 선생님 매칭', '첫 30분 무료 체험 제공', `${displayDong} 학교별 내신 전문 선생님`, '맞춤 커리큘럼 제공'],
    ['24시간 이내 최적 선생님 연결', '첫 수업 30분 무료', `${displayDong} 출제 경향 파악한 선생님`, '언제든 선생님 교체 가능'],
    ['당일 상담, 내일부터 수업 가능', '체험 후 결정 가능 (무료 30분)', `${displayDong} 지역 전문 선생님`, '주 1~5회 유연한 일정'],
    ['1:1 맞춤 커리큘럼 설계', '첫 30분 무료 체험', `${displayDong} 내신 기출 숙지 선생님`, '선생님 교체 부담 없음'],
    ['신청 즉시 담당자 배정', '무료 30분 체험 수업', `${displayDong} 학교 시험 전문 선생님`, '방문·화상 선택 가능'],
    ['30년 교육 노하우 선생님', '첫 30분 무료 체험', `${displayDong} 전담 선생님 배정`, '성적 관리 지속 피드백'],
    ['연락 후 24시간 내 매칭 완료', '선생님 마음에 안 들면 교체', `${displayDong} 과목별 전문 선생님`, '첫 수업 30분 무료'],
    ['2,000명+ 선생님 풀에서 매칭', '무료 첫 체험 수업', `${displayDong} 인근 내신 전문 선생님`, '시험 전 집중 수업 가능'],
    ['아이 수준 맞춤 선생님 연결', '첫 30분 체험 무료', `${displayDong} 학교별 기출 파악`, '수업 후 진도 보고'],
    ['상담부터 매칭까지 무료', '30분 무료 체험 후 결정', `${displayDong} 지역 검증 선생님`, '내신·수능 통합 관리'],
    ['빠른 선생님 연결 (24시간)', '첫 체험 수업 무료', `${displayDong} 전문 담당 선생님`, '부담 없는 선생님 교체'],
    ['전국 100만+ 이용 검증 플랫폼', '무료 30분 체험 수업', `${displayDong} 내신 전문 매칭`, '일정 유연 조정 가능'],
  ];
  const ctaPoints = ctaPointSets[vC];

  // 중간 섹션 순서 변형 (3가지 순서)
  const _secA = buildLearningSection(grade, subject, displayDong, nearSchoolName, 4, hashKey);
  const _secB = buildSubjectStudySection(subject, displayDong, 5, hashKey);
  const _secC = buildExamGuideSection(displayDong, nearSchoolName, 6, hashKey);
  const midSections = vO === 0 ? [_secA, _secB, _secC] : vO === 1 ? [_secC, _secA, _secB] : [_secB, _secC, _secA];

  // 이미지 번호 결정 (지역명 해시 기반, 1~6)
  const imgIdx = ((dong.charCodeAt(0) + dong.charCodeAt(1)) % 6) + 1;
  const imgIdx2 = (imgIdx % 6) + 1;
  const imgIdx3 = (imgIdx2 % 6) + 1;

  const body = `
<!-- PAGE HERO -->
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">📍 ${sido} · ${gu}</div>
    <h1 class="page-h1">${displayDong}<em>${subject || ''}과외</em>${grade ? `&nbsp;${grade}` : ''}</h1>
    <p class="page-desc">
      ${heroDesc}
      상담 신청 후 24시간 내 매칭 가능하며, 첫 30분은 무료 체험입니다.
    </p>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤 수업</span>
      <span class="hero-chip">✅ 24시간 내 매칭</span>
      <span class="hero-chip">✅ 첫 30분 무료 체험</span>
      ${isVisit ? '<span class="hero-chip">🏠 방문과외</span>' : ''}
      <span class="hero-chip">💻 화상과외</span>
      <span class="hero-chip">📋 내신 전문</span>
      <span class="hero-chip">🎓 수능 대비</span>
      <span class="hero-chip">${subjectEmoji} ${subject || '전 과목'} 전문</span>
    </div>
  </div>
</section>

<!-- WHY DREAMTUTOR -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${displayDong}에서 <em>드림과외</em>를 선택하는 이유</h2>
    <p class="sec-desc">${whyDesc}</p>
    <div class="str-grid">
      <div class="str-card">
        <span class="str-icon">🏆</span>
        <div class="str-num">30<span>년+</span></div>
        <h3>교육 노하우</h3>
        <p>${displayDong} 지역 학생 지도 경험을 바탕으로, 30년+ 교육 노하우로 맞춤 커리큘럼을 설계합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">👥</span>
        <div class="str-num">100<span>만+</span></div>
        <h3>누적 회원수</h3>
        <p>전국 100만 명 이상의 학생과 학부모가 드림과외와 함께한 교육 플랫폼입니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">👩‍🏫</span>
        <div class="str-num">2,000<span>+</span></div>
        <h3>전문 선생님</h3>
        <p>각 과목·학년별 전문 선생님이 학생 맞춤 1:1 맞춤 수업을 진행합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">⚡</span>
        <div class="str-num">24<span>h</span></div>
        <h3>빠른 매칭</h3>
        <p>상담 신청 후 24시간 이내 ${displayDong} ${subject || ''}전문 선생님을 연결합니다. 급하시면 전화 상담도 가능합니다.</p>
      </div>
    </div>
  </div>
</section>

<!-- PROCESS -->
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">HOW IT WORKS</span>
    <h2 class="sec-title">딱 <em>4단계</em>로 시작하세요</h2>
    <p class="sec-desc">${processDesc}</p>
    <div class="process-grid">
      <div class="process-step">
        <div class="process-circle">1</div>
        <h3>무료 상담 신청</h3>
        <p>이름·연락처·학년·과목을 입력하고 무료 상담을 신청합니다. 아래 폼 또는 전화로 신청하세요.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">2</div>
        <h3>선생님 매칭</h3>
        <p>24시간 내 ${displayDong} 지역 ${grade || '해당 학년'} ${subject || '해당 과목'} 전문 선생님을 개인 맞춤 연결합니다.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">3</div>
        <h3>첫 30분 무료 체험</h3>
        <p>첫 30분은 무료 체험입니다. 선생님의 수업 방식과 학생과의 궁합을 직접 확인 후 결정하세요.</p>
      </div>
      <div class="process-step">
        <div class="process-circle">4</div>
        <h3>정기 수업 시작</h3>
        <p>주 1~5회 맞춤 일정으로 체계적인 1:1 수업을 시작합니다. 언제든지 일정 조정이 가능합니다.</p>
      </div>
    </div>
  </div>
</section>

${buildLocalAreaSection(dong, displayDong, gu, nearSchoolName, isVisit)}

${midSections[0]}

${imageCallout(displayDong, imgIdx2, hashKey)}

${midSections[1]}

${midSections[2]}

${priceTableHtml(displayDong, subject, isVisit)}

${ctaBox(keyword)}

${buildDongSchoolSection(dong, displayDong, subject, gu)}

<!-- RELATED LINKS -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">RELATED</span>
    <h2 class="sec-title">관련 <em>과외 정보</em></h2>
    <p class="sec-desc">${displayDong} 주변 지역 및 다른 과목·학년별 과외 정보를 확인하세요.</p>
    <div class="link-list">
      ${relatedLinks}
    </div>
  </div>
</section>

${faqSection(faqs, faqSchema)}

${consultForm({
  leftTitle: `<em>지금 바로</em> 무료 상담<br>신청하세요`,
  leftDesc: `${displayDong} 지역 ${subject || ''}${grade ? grade + ' ' : ''}전문 선생님을<br>24시간 내 연결해드립니다.`,
  leftPts: ctaPoints,
  regionValue: displayDong,
})}`;

  const breadcrumb = [
    { label: sido },
    { label: gu, url: `/${encodeURIComponent(stripGuSuffix(gu) + '과외')}` },
    { label: keyword },
  ];

  return layout({ head, body, breadcrumb, keyword, region: displayDong });
}

// ── 시군구 레벨 페이지 ─────────────────────────────────
export function renderGuPage({ gu, sido, grade, subject, withSuffix }) {
  const displayGu = withSuffix ? gu : stripGuSuffix(gu);
  const keyword = `${displayGu}${grade || ''}${subject || ''}과외`;
  const guSlug = sigunguSlug(sido, gu);
  const canonicalKeyword = `${guSlug}${grade || ''}${subject || ''}과외`;
  const title = `${keyword} | 드림과외`;
  const description = `${displayGu} ${grade || '초중고'} ${subject || '전과목'} 과외. 방문·화상 모두 가능. 검증된 선생님 24시간 매칭. 첫 30분 무료 체험.`;

  const url = `/${encodeURIComponent(canonicalKeyword)}`;
  const head = buildHead({ title, description, url, type: 'local' });

  const dongs = ALL_REGIONS[sido]?.[gu] || [];

  const guBase = sigunguSlug(sido, gu);
  const subjectLinks = Object.entries(SUBJECTS).map(([s, info]) =>
    `<a href="/${encodeURIComponent(guBase + s + '과외')}">${subjectEmoji(info)} ${displayGu} ${s}과외</a>`
  ).join('');

  const gradeLinks = Object.entries(GRADES).map(([g]) =>
    `<a href="/${encodeURIComponent(guBase + g + '과외')}">${displayGu} ${g}과외</a>`
  ).join('');

  const dongCards = [...dongs].sort((a, b) => a.localeCompare(b, 'ko')).map(d => {
    const ds = dongSlug(gu, d);
    return `<div class="card">
  <a href="/${encodeURIComponent(ds + (subject || '') + '과외')}">${d} ${subject || ''}과외</a>
</div>`;
  }).join('');


  const faqs = [
    { q: `${displayGu} 방문과외도 가능한가요?`, a: `네, ${displayGu} 지역은 방문과외와 화상과외 모두 가능합니다. 학생 자택으로 직접 방문하는 1:1 수업을 제공하며, 상황에 따라 화상과외로도 동일한 수준의 수업을 받을 수 있습니다.` },
    { q: `${displayGu} 학교 내신 대비도 가능한가요?`, a: `드림과외 선생님들은 ${displayGu} 인근 학교 내신 대비에 충분한 경험을 갖추고 있습니다. 학생 학교와 학년에 맞춘 내신 대비 수업 및 서술형·수행평가 대비도 함께 진행합니다.` },
    { q: `선생님 매칭은 얼마나 걸리나요?`, a: `상담 신청 후 24시간 이내에 최적의 선생님을 매칭해드립니다. 급하신 경우 전화 상담으로 더 빠른 매칭이 가능합니다.` },
    { q: `${displayGu} 선생님은 어떻게 연결되나요?`, a: `드림과외는 30년+ 교육 노하우를 바탕으로 학력·경력·수업 능력을 종합적으로 평가한 전문 선생님을 연결합니다. 수강생 피드백을 지속적으로 관리하며 수업 품질을 유지합니다.` },
    { q: `첫 수업이 정말 무료인가요?`, a: `네, 첫 30분은 무료 체험입니다. 선생님의 수업 방식을 직접 체험한 후 결정하실 수 있습니다.` },
  ];
  const faqSchema = buildFAQSchema(faqs);

  const guImgIdx = ((gu.charCodeAt(0) + gu.charCodeAt(1)) % 6) + 1;
  const guImgIdx2 = (guImgIdx % 6) + 1;
  const guImgIdx3 = (guImgIdx2 % 6) + 1;

  const body = `
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">📍 ${sido}</div>
    <h1 class="page-h1">${displayGu}<em>${subject || ''}과외</em>${grade ? `&nbsp;${grade}` : ''}</h1>
    <p class="page-desc">
      ${GU_DESC[gu] || `${sido}에 위치한 지역입니다`}
      드림과외는 ${displayGu} 인근 학교 내신 기출을 숙지한 검증된 선생님을 24시간 내 매칭해드립니다.
      방문과외·화상과외 모두 가능하며, 첫 30분은 무료 체험 제공.
    </p>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤 수업</span>
      <span class="hero-chip">✅ 24시간 내 매칭</span>
      <span class="hero-chip">✅ 첫 30분 무료 체험</span>
      <span class="hero-chip">🏠 방문과외</span>
      <span class="hero-chip">💻 화상과외</span>
      <span class="hero-chip">📋 내신 전문</span>
    </div>
  </div>
</section>

<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${displayGu}에서 <em>드림과외</em>가 다른 이유</h2>
    <p class="sec-desc">
      드림과외는 단순한 과외 중개가 아닙니다. 30년+ 교육 노하우를 바탕으로 검증된 전문 선생님을 ${displayGu} 지역 학생과 연결합니다.
      학생 수준·학교·목표에 맞는 맞춤 커리큘럼을 제공하며, 선생님이 마음에 들지 않으면 언제든 교체해드립니다.
    </p>
    <div class="str-grid">
      <div class="str-card"><span class="str-icon">🏆</span><div class="str-num">30<span>년+</span></div><h3>교육 노하우</h3><p>${displayGu} 지역 학생 지도 경험을 바탕으로, 30년+ 교육 노하우로 맞춤 커리큘럼을 설계합니다.</p></div>
      <div class="str-card"><span class="str-icon">👥</span><div class="str-num">100<span>만+</span></div><h3>누적 회원수</h3><p>전국 100만 명 이상의 학생과 학부모가 드림과외와 함께한 교육 플랫폼입니다.</p></div>
      <div class="str-card"><span class="str-icon">👩‍🏫</span><div class="str-num">2,000<span>+</span></div><h3>전문 선생님</h3><p>각 과목·학년별 전문 선생님이 학생 맞춤 1:1 수업을 진행합니다.</p></div>
      <div class="str-card"><span class="str-icon">⚡</span><div class="str-num">24<span>h</span></div><h3>빠른 매칭</h3><p>신청 후 24시간 이내 ${displayGu} 지역 전문 선생님을 연결합니다.</p></div>
    </div>
  </div>
</section>

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">${displayGu} <em>과목별 과외</em></h2>
    <p class="sec-desc">수학·영어·국어·과학·사회 전 과목 1:1 맞춤 과외를 제공합니다.</p>
    <div class="link-list">${subjectLinks}</div>
    <h2 class="sec-title" style="margin-top:40px">${displayGu} <em>학년별 과외</em></h2>
    <p class="sec-desc">초등·중등·고등 전 학년 맞춤 과외, 수능·검정고시 전문까지 커버합니다.</p>
    <div class="link-list">${gradeLinks}</div>
  </div>
</section>

${dongs.length ? `<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">AREAS</span>
    <h2 class="sec-title">${displayGu} <em>세부 지역</em> 과외</h2>
    <p class="sec-desc">아래 지역을 선택하시면 해당 동 전문 선생님을 안내해드립니다.</p>
    <div class="card-grid">${dongCards}</div>
  </div>
</section>` : ''}

${buildGuSchoolSection(gu, displayGu, subject, sido)}

${buildLearningSection(grade, subject, displayGu, null, 4, gu + sido)}

${buildSubjectStudySection(subject, displayGu, 5, gu + sido)}

${imageCallout(displayGu, guImgIdx, gu + sido)}

${buildExamGuideSection(displayGu, null, 6, gu + sido)}

${priceTableHtml(displayGu, subject, true)}

${ctaBox(keyword)}
${faqSection(faqs, faqSchema)}

${consultForm({
  leftTitle: `<em>지금 바로</em> 무료 상담<br>신청하세요`,
  leftDesc: `${displayGu} 지역 전문 선생님을<br>24시간 내 연결해드립니다.`,
  leftPts: [
    '상담 후 24시간 내 선생님 매칭',
    '첫 30분 무료 체험',
    `${displayGu} 학교별 내신 전문`,
    '맞춤 커리큘럼 제공',
  ],
  regionValue: displayGu,
})}`;

  return layout({ head, body, breadcrumb: [{ label: sido }, { label: keyword }], keyword, region: displayGu });
}

// ── 시도 레벨 페이지 ───────────────────────────────────
export function renderSidoPage({ sido, grade, subject }) {
  const keyword = `${sido}${grade || ''}${subject || ''}과외`;
  const title = `${keyword} | 드림과외`;
  const sidoDesc = SIDO_DESC[sido] || `${sido} 지역 전문 과외`;
  const description = `${keyword} 전문 드림과외. ${sidoDesc}. 화상과외로 전국 어디서나 가능.`;

  const url = `/${encodeURIComponent(keyword)}`;
  const head = buildHead({ title, description, url, type: 'online' });

  const gus = VISIT_REGIONS[sido] ? Object.keys(VISIT_REGIONS[sido]) : [];
  const allGus = ALL_REGIONS[sido] ? Object.keys(ALL_REGIONS[sido]).sort((a, b) => a.localeCompare(b, 'ko')) : [];
  const allGuCards = allGus.map(gu => {
    const gs = sigunguSlug(sido, gu);
    return `<div class="card"><a href="/${encodeURIComponent(gs + (subject || '') + '과외')}">${gu} ${subject || ''}과외</a></div>`;
  }).join('');

  const subjectLinks = Object.entries(SUBJECTS).map(([s, info]) =>
    `<a href="/${encodeURIComponent(sido + (grade || '') + s + '과외')}">${subjectEmoji(info)} ${sido} ${s}과외</a>`
  ).join('');


  const faqs = [
    { q: `${sido}에서 화상과외가 효과가 있나요?`, a: `네, 화상과외는 방문과외와 동일한 1:1 수업 효과를 제공합니다. 오히려 이동 시간이 없어 더 많은 시간을 학습에 집중할 수 있으며, 전국 최고 수준의 선생님과 수업이 가능합니다.` },
    { q: `${sido} 학교 내신 대비도 가능한가요?`, a: `드림과외 선생님들은 ${sido} 지역 학교 내신 대비에 충분한 경험을 갖추고 있습니다. 학생 학교와 학년에 맞춘 내신 대비 커리큘럼을 제공하며, 서술형·수행평가 대비도 함께 진행합니다.` },
    { q: `선생님 매칭은 얼마나 걸리나요?`, a: `상담 신청 후 24시간 이내에 최적의 선생님을 매칭해드립니다. 급하신 경우 전화 상담으로 더 빠른 매칭이 가능합니다.` },
    { q: `수업 교재나 교구는 어떻게 되나요?`, a: `선생님이 학생의 학교 교과서와 수준에 맞춰 교재를 추천해드립니다. 학교 교과서 위주로 수업하는 것도 가능하고, 별도 교재를 사용하는 것도 가능합니다.` },
    { q: `첫 수업이 정말 무료인가요?`, a: `네, 첫 30분은 무료 체험입니다. 선생님의 수업 방식을 직접 체험한 후 결정하실 수 있습니다.` },
  ];
  const faqSchema = buildFAQSchema(faqs);

  const sidoImgIdx = ((sido.charCodeAt(0)) % 6) + 1;
  const sidoImgIdx2 = (sidoImgIdx % 6) + 1;
  const sidoImgIdx3 = (sidoImgIdx2 % 6) + 1;

  const body = `
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">${gus.length ? `📍 ${sido}` : `🌐 ${sido} 전국 서비스`}</div>
    <h1 class="page-h1">${sido}<em>${subject || ''}과외</em>${grade ? `&nbsp;${grade}` : ''}</h1>
    <p class="page-desc">
      ${sidoDesc}. 드림과외는 ${sido} 지역 전문 과외 서비스를 제공합니다.
      ${gus.length ? '방문과외·화상과외 모두 가능하며,' : '화상과외로 이동 없이'} 전문 선생님과 1:1 맞춤 수업을 받으세요.
      신청 후 24시간 내 매칭, 첫 30분 무료 체험.
    </p>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤 수업</span>
      <span class="hero-chip">✅ 24시간 내 매칭</span>
      <span class="hero-chip">✅ 첫 30분 무료 체험</span>
      ${gus.length ? '<span class="hero-chip">🏠 방문과외</span>' : ''}
      <span class="hero-chip">💻 화상과외</span>
      <span class="hero-chip">🌐 전국 서비스</span>
      <span class="hero-chip">📋 내신 전문</span>
    </div>
  </div>
</section>

<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${sido} <em>드림과외</em> 특징</h2>
    <p class="sec-desc">
      ${sidoDesc}. 드림과외 화상과외는 이동 없이 집에서 전문 선생님과
      1:1 맞춤 수업이 가능합니다. 전문 선생님을 연결하며,
      학교 교과서·내신 기출 위주의 맞춤 수업을 제공합니다.
    </p>
    <div class="str-grid">
      <div class="str-card"><span class="str-icon">🏆</span><div class="str-num">30<span>년+</span></div><h3>교육 노하우</h3><p>30년+ 교육 현장 경험으로 과목별 최적 커리큘럼 제공. 수능부터 내신까지 체계적 관리.</p></div>
      <div class="str-card"><span class="str-icon">👥</span><div class="str-num">100<span>만+</span></div><h3>누적 회원수</h3><p>전국 100만 명 이상의 학생과 학부모가 드림과외와 함께한 교육 플랫폼입니다.</p></div>
      <div class="str-card"><span class="str-icon">👩‍🏫</span><div class="str-num">2,000<span>+</span></div><h3>전문 선생님</h3><p>각 과목·학년별 전문 선생님이 화상수업에서도 동일한 1:1 맞춤 수업을 진행합니다.</p></div>
      <div class="str-card"><span class="str-icon">⚡</span><div class="str-num">24<span>h</span></div><h3>빠른 매칭</h3><p>신청 후 24시간 이내 전문 선생님을 연결합니다. 지역 제한 없이 맞춤 매칭.</p></div>
    </div>
  </div>
</section>

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">${sido} <em>과목별 과외</em></h2>
    <p class="sec-desc">수학·영어·국어·과학·사회·한국사 전 과목 1:1 화상 과외를 제공합니다.</p>
    <div class="link-list">${subjectLinks}</div>
  </div>
</section>

${allGus.length ? `<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">AREAS</span>
    <h2 class="sec-title">${sido} <em>시군구별 과외</em></h2>
    <p class="sec-desc">원하시는 지역을 선택하시면 해당 시군구 전문 선생님을 안내해드립니다.</p>
    <div class="card-grid">${allGuCards}</div>
  </div>
</section>` : ''}

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">PROCESS</span>
    <h2 class="sec-title">딱 <em>4단계</em>로 시작하세요</h2>
    <p class="sec-desc">복잡한 절차 없이 빠르고 간편하게 전문 선생님을 만나보세요.</p>
    <div class="process-grid">
      <div class="process-step"><div class="process-circle">1</div><h3>무료 상담 신청</h3><p>이름·연락처·학년·과목을 입력하고 무료 상담을 신청합니다.</p></div>
      <div class="process-step"><div class="process-circle">2</div><h3>선생님 매칭</h3><p>24시간 내 ${sido} 지역 ${subject || ''}전문 선생님을 개인 맞춤 연결합니다.</p></div>
      <div class="process-step"><div class="process-circle">3</div><h3>첫 30분 무료 체험</h3><p>첫 30분은 무료 체험입니다. 화상으로 수업 방식을 직접 체험해보세요.</p></div>
      <div class="process-step"><div class="process-circle">4</div><h3>정기 수업 시작</h3><p>주 1~5회 맞춤 일정으로 체계적인 화상 1:1 수업을 시작합니다.</p></div>
    </div>
  </div>
</section>

${buildLearningSection(grade, subject, sido)}

${buildSubjectStudySection(subject, sido)}

${imageCallout(sido, sidoImgIdx)}

${buildExamGuideSection(sido)}

${priceTableHtml(sido, subject, gus.length > 0)}

${ctaBox(keyword)}
${faqSection(faqs, faqSchema)}

${consultForm({
  leftTitle: `<em>지금 바로</em> 무료 상담<br>신청하세요`,
  leftDesc: `${sido} 지역 전문 선생님을<br>24시간 내 연결해드립니다.`,
  leftPts: [
    '상담 후 24시간 내 선생님 매칭',
    '첫 30분 무료 체험',
    '전문 선생님 1:1 맞춤 연결',
    '맞춤 커리큘럼 제공',
  ],
  regionValue: sido,
})}`;

  return layout({ head, body, breadcrumb: [{ label: keyword }], keyword, region: sido });
}

// ── 학교 레벨 페이지 ──────────────────────────────────────
export function renderSchoolPage({ schoolName, dong, gu, sido, grade, subject }) {
  const shortName   = schoolName.replace(/학교$/, '');
  const displayDong = stripSuffix(dong);
  const displayGu   = stripGuSuffix(gu);
  const schoolType  = schoolName.includes('중학교') ? '중학교'
    : schoolName.includes('고등학교') ? '고등학교'
    : schoolName.includes('초등학교') ? '초등학교' : '학교';
  const inferGrade  = schoolType === '중학교' ? '중등'
    : schoolType === '고등학교' ? '고등'
    : schoolType === '초등학교' ? '초등' : null;
  const isVisit = Object.values(VISIT_REGIONS)
    .flatMap(g => Object.values(g).flat()).includes(dong);
  const subjectInfo  = subject ? SUBJECTS[subject] : null;
  const subjectEmoji = subjectInfo ? subjectInfo.emoji : '📚';
  const visitText    = isVisit ? '방문·화상 모두 가능' : '화상과외 가능';

  const keyword    = `${shortName}${subject || ''}과외`;
  const title      = `${schoolName} 과외 | 내신 대비 1:1 드림과외`;
  const description = `${schoolName} 학생 전문 1:1 과외. ${displayGu} ${displayDong} 위치. 학교 교과서·내신 기출 중심 수업, 수행평가 대비. ${visitText}. 검증된 선생님 24시간 내 매칭.`;
  const url        = `/${encodeURIComponent(schoolName + (subject || '') + '과외')}`;
  const head       = buildHead({ title, description, url, type: isVisit ? 'local' : 'online' });

  const faqs = buildFAQSchema([
    {
      q: `${schoolName} 내신 대비 과외가 가능한가요?`,
      a: `드림과외 선생님들은 ${schoolName} 시험 출제 경향과 교과서 범위를 파악하고 있습니다. 단원별 핵심 개념 정리, 기출 유형 풀이, 서술형·수행평가 대비까지 학교 일정에 맞춰 커리큘럼을 구성합니다.`,
    },
    {
      q: `방문과외와 화상과외 중 어떤 것이 가능한가요?`,
      a: isVisit
        ? `${displayDong} 지역은 방문과외와 화상과외 모두 가능합니다. 학생 자택으로 직접 방문하는 1:1 수업과 집에서 편하게 받는 화상 수업 중 선택하실 수 있습니다.`
        : `${displayDong} 지역은 화상과외로 진행됩니다. 이동 시간 없이 집에서 전문 선생님과 1:1 수업이 가능합니다.`,
    },
    {
      q: `선생님 매칭은 얼마나 걸리나요?`,
      a: `상담 신청 후 24시간 이내에 최적의 선생님을 연결해드립니다. 시험이 임박한 경우 빠른 매칭이 가능하도록 안내해드립니다.`,
    },
    {
      q: `첫 수업이 무료인가요?`,
      a: `첫 30분은 무료 체험입니다. 선생님의 수업 방식과 학생과의 궁합을 직접 확인하신 후 결정하실 수 있습니다.`,
    },
    {
      q: `수업 일정은 어떻게 조율하나요?`,
      a: `주 1~5회, 학생과 학부모님의 일정에 맞춰 유연하게 조정합니다. 시험 기간에는 단기 집중 수업 일정도 조율 가능합니다.`,
    },
  ]);
  const faqSectionHtml = buildFAQSchema([]);  // schema only — section built below

  const faqItems = [
    {
      q: `${schoolName} 내신 대비 과외가 가능한가요?`,
      a: `드림과외 선생님들은 ${schoolName} 시험 출제 경향과 교과서 범위를 파악하고 있습니다. 단원별 핵심 개념 정리, 기출 유형 풀이, 서술형·수행평가 대비까지 학교 일정에 맞춰 커리큘럼을 구성합니다.`,
    },
    {
      q: `방문과외와 화상과외 중 어떤 것이 가능한가요?`,
      a: isVisit
        ? `${displayDong} 지역은 방문과외와 화상과외 모두 가능합니다. 학생 자택으로 직접 방문하는 1:1 수업과 집에서 편하게 받는 화상 수업 중 선택하실 수 있습니다.`
        : `${displayDong} 지역은 화상과외로 진행됩니다. 이동 시간 없이 집에서 전문 선생님과 1:1 수업이 가능합니다.`,
    },
    {
      q: `선생님 매칭은 얼마나 걸리나요?`,
      a: `상담 신청 후 24시간 이내에 최적의 선생님을 연결해드립니다. 시험이 임박한 경우 빠른 매칭이 가능하도록 안내해드립니다.`,
    },
    {
      q: `첫 수업이 무료인가요?`,
      a: `첫 30분은 무료 체험입니다. 선생님의 수업 방식과 학생과의 궁합을 직접 확인하신 후 결정하실 수 있습니다.`,
    },
    {
      q: `수업 일정은 어떻게 조율하나요?`,
      a: `주 1~5회, 학생과 학부모님의 일정에 맞춰 유연하게 조정합니다. 시험 기간에는 단기 집중 수업 일정도 조율 가능합니다.`,
    },
  ];
  const faqSchema = buildFAQSchema(faqItems);

  // 과목별 링크 — URL은 정식 학교명 사용 (단축명은 중복 충돌 위험)
  const subjectLinks = Object.entries(SUBJECTS).map(([s, info]) =>
    `<a href="/${encodeURIComponent(schoolName + s + '과외')}">${info.emoji} ${shortName} ${s}과외</a>`
  ).join('');

  // 관련 링크 (학교 → 동, 구) — 중복 지역 대비 proper slug 사용
  const dongUrlSlug = dong ? dongSlug(gu, dong) : '';
  const guUrlSlug   = sigunguSlug(sido, gu);
  const areaDisplay = displayDong || gu;
  const areaSlug    = dongUrlSlug || guUrlSlug;
  const relatedLinks = [
    `<a href="/${encodeURIComponent(areaSlug + '과외')}">📍 ${areaDisplay} 과외 전체</a>`,
    ...Object.entries(SUBJECTS).map(([s]) =>
      `<a href="/${encodeURIComponent(areaSlug + s + '과외')}">${areaDisplay} ${s}과외</a>`
    ),
    ...(dongUrlSlug ? [`<a href="/${encodeURIComponent(guUrlSlug + '과외')}">${gu} 과외 전체</a>`] : []),
  ].join('');

  const breadcrumb = [
    { label: sido },
    { label: gu, url: `/${encodeURIComponent(guUrlSlug + '과외')}` },
    ...(dong ? [{ label: dong, url: `/${encodeURIComponent(dongUrlSlug + '과외')}` }] : []),
    { label: keyword },
  ];

  const body = `
<!-- HERO -->
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">🏫 ${sido} · ${gu} · ${displayDong}</div>
    <h1 class="page-h1">${schoolName}<em>${subject ? ' ' + subject : ''}과외</em></h1>
    <p class="page-desc">
      ${displayGu}에 위치한 ${schoolName} 학생을 위한 1:1 전문 과외입니다.
      학교 교과서와 내신 기출 문제를 중심으로 수업을 구성하며,
      서술형·수행평가 대비도 함께 진행합니다.
      ${isVisit ? '방문과외·화상과외 모두 가능하며,' : '화상과외로 진행되며,'}
      상담 신청 후 24시간 내에 선생님을 매칭해드립니다.
      첫 30분을 무료로 체험하실 수 있습니다.
    </p>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤 수업</span>
      <span class="hero-chip">✅ 24시간 내 매칭</span>
      <span class="hero-chip">✅ 첫 30분 무료 체험</span>
      ${isVisit ? '<span class="hero-chip">🏠 방문과외</span>' : ''}
      <span class="hero-chip">💻 화상과외</span>
      <span class="hero-chip">📋 내신 전문</span>
      <span class="hero-chip">${subjectEmoji} ${subject || '전 과목'}</span>
    </div>
  </div>
</section>

<!-- 학교 정보 -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">SCHOOL INFO</span>
    <h2 class="sec-title">${schoolName} <em>기본 정보</em></h2>
    <div class="str-grid">
      <div class="str-card">
        <span class="str-icon">🏫</span>
        <h3>학교 종류</h3>
        <p>${schoolType} | ${sido} ${gu} ${dong} 소재</p>
      </div>
      <div class="str-card">
        <span class="str-icon">${isVisit ? '🏠' : '💻'}</span>
        <h3>수업 방식</h3>
        <p>${isVisit ? '방문과외 · 화상과외 모두 가능합니다.' : '화상과외로 진행됩니다. 이동 없이 집에서 편리하게 받을 수 있습니다.'}</p>
      </div>
      <div class="str-card">
        <span class="str-icon">📋</span>
        <h3>내신 대비</h3>
        <p>${schoolName} 교과서 기반 내신 대비, 단원별 핵심 개념 정리, 기출 유형 분석을 진행합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">✏️</span>
        <h3>수행평가</h3>
        <p>서술형 답안 작성, 수행평가 주제 준비, 발표 자료 구성 등을 함께 지도합니다.</p>
      </div>
    </div>
  </div>
</section>

<!-- 과목별 과외 -->
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">${shortName} <em>과목별 과외</em></h2>
    <p class="sec-desc">수학·영어·국어·과학·사회·한국사 전 과목 1:1 맞춤 과외를 제공합니다.</p>
    <div class="link-list">${subjectLinks}</div>
  </div>
</section>

<!-- 왜 드림과외 -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${shortName}에서 <em>드림과외</em>를 선택하는 이유</h2>
    <p class="sec-desc">
      드림과외 선생님은 ${schoolName} 학교의 내신 시험 출제 경향과 수업 방식을
      파악하고 있습니다. 학생 개개인의 수준과 목표에 맞는 맞춤형 커리큘럼을 제공합니다.
    </p>
    <div class="str-grid">
      <div class="str-card">
        <span class="str-icon">🏆</span>
        <div class="str-num">30<span>년+</span></div>
        <h3>교육 노하우</h3>
        <p>${displayDong} 지역 학생 지도 경험을 바탕으로 30년+ 교육 노하우로 맞춤 커리큘럼을 설계합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">👩‍🏫</span>
        <div class="str-num">2,000<span>+</span></div>
        <h3>전문 선생님</h3>
        <p>${schoolType} 과목별 전문 선생님이 학생 수준에 맞는 1:1 수업을 진행합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">⚡</span>
        <div class="str-num">24<span>h</span></div>
        <h3>빠른 매칭</h3>
        <p>상담 신청 후 24시간 이내 ${schoolName} 내신에 맞는 선생님을 연결합니다.</p>
      </div>
      <div class="str-card">
        <span class="str-icon">🎁</span>
        <h3>첫 30분 무료 체험</h3>
        <p>첫 30분을 무료로 체험하실 수 있습니다. 선생님과 궁합을 확인 후 결정하세요.</p>
      </div>
    </div>
  </div>
</section>

${buildLearningSection(inferGrade, subject, schoolName, schoolName)}

${buildSubjectStudySection(subject, shortName)}

${buildExamGuideSection(schoolName, schoolName)}

${ctaBox(keyword)}

<!-- 관련 링크 (학교 → 동/구) -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">RELATED</span>
    <h2 class="sec-title"><em>${areaDisplay}</em> 지역 과외 정보</h2>
    <p class="sec-desc">${schoolName}가 위치한 ${areaDisplay} 지역의 다른 과외 정보를 확인하세요.</p>
    <div class="link-list">${relatedLinks}</div>
  </div>
</section>

${faqSection(faqItems, faqSchema)}

${consultForm({
  leftTitle: `<em>${shortName}</em> 학생<br>무료 상담 신청`,
  leftDesc: `${displayDong} ${schoolName} 내신 전문 선생님을<br>24시간 내 연결해드립니다.`,
  leftPts: [
    `${schoolName} 내신 기출 파악 선생님`,
    '상담 후 24시간 내 선생님 매칭',
    '첫 30분 무료 체험',
    '맞춤 커리큘럼 제공',
  ],
  regionValue: displayDong,
})}`;

  return layout({ head, body, breadcrumb, keyword, region: displayDong });
}

// ── 헬퍼: 지역명 기반 변형 인덱스 (독립 시드 지원) ──────────
function getVariant(location, seed = 0, n = 12) {
  let h = 2166136261 ^ (seed * 2654435761);
  for (let i = 0; i < location.length; i++) {
    const c = location.charCodeAt(i);
    // 한글 유니코드를 2바이트로 분리해 해싱 (FNV-1a)
    h ^= c & 0xFF;
    h = Math.imul(h, 16777619);
    h ^= (c >> 8) & 0xFF;
    h = Math.imul(h, 16777619);
  }
  // murmur3 finalizer - 강한 혼합
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) % n;
}

// ── 헬퍼: 학습 콘텐츠 섹션 생성 ─────────────────────────
function buildLearningSection(grade, subject, location, nearSchoolName = null, seed = 4, hashKey = null) {
  const v = getVariant(hashKey || location, seed, 3);
  const schoolRef = nearSchoolName || `${location} 인근`;

  const sm = subject ? {
    수학: { title: '수학 과외 학습 방법', steps: ['개념 이해 → 유형 훈련 → 실전 문제 풀이', '오답 노트 작성으로 취약 유형 반복 보완', '학교 교과서 기반 내신 기출 집중 분석'] },
    영어: { title: '영어 과외 학습 방법', steps: ['어휘 학습 → 독해 훈련 → 쓰기·말하기 적용', '교과서 본문 분석과 서술형 표현 정리', '수능 유형(빈칸·순서·주제) 반복 연습'] },
    국어: { title: '국어 과외 학습 방법', steps: ['기초 문법 → 독해 전략 → 서술형 답안 작성', '문학 작품 분석과 현대어 풀이 훈련', '내신 기출 서술형과 수능 국어 유형 대비'] },
    과학: { title: '과학 과외 학습 방법', steps: ['핵심 개념 이해 → 원리 적용 → 응용 문제 풀이', '물리·화학·생물·지구과학 단원별 체계적 학습', '수행평가·실험 보고서 작성 함께 대비'] },
    사회: { title: '사회 과외 학습 방법', steps: ['개념 흐름 파악 → 사건·맥락 연결 → 암기 전략', '지리·역사·일반사회 단원 균형 있게 학습', '서술형 문제 대비 및 수행평가 답안 작성'] },
    한국사: { title: '한국사 과외 학습 방법', steps: ['시대별 흐름 파악 → 주요 사건·인물 암기', '내신 서술형과 한국사능력검정시험 동시 대비', '연표 정리와 오답 반복으로 장기 기억 강화'] },
  }[subject] : null;
  const subjectBlock = sm ? `
    <div class="learning-method">
      <h3>${sm.title}</h3>
      <ul>${sm.steps.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>` : '';

  const cardsHtml = cards => cards.map(c =>
    `<div class="learning-card"><span class="learning-icon">${c.icon}</span><h3>${c.title}</h3><p>${c.desc}</p></div>`
  ).join('');

  // ── 초등 ──
  if (grade === '초등') {
    const intro = [
      `초등 시기는 학습 습관과 기초 학력의 토대를 만드는 중요한 단계입니다. 드림과외는 아이의 흥미를 살리면서 자기주도학습 능력을 함께 키워드립니다.`,
      `초등학교 때 만들어진 공부 습관은 중·고등학교까지 이어집니다. 드림과외는 아이가 부담 없이 공부와 친해질 수 있도록 눈높이 맞춤 수업으로 지도합니다.`,
      `기초 학력을 탄탄하게 다져두면 중학교 진학 후 훨씬 수월합니다. 드림과외는 ${location} 학교 교과서 중심으로 기초부터 차근차근 잡아드립니다.`,
    ][v];
    const cards = [
      [
        { icon:'📖', title:'기초 학력 강화', desc:'학교 교과서 중심으로 개념을 탄탄히 다집니다. 모르는 부분을 즉시 바로잡아 학교 수업에 자신감을 갖게 해드립니다.' },
        { icon:'🌱', title:'학습 습관 형성', desc:'스스로 예습·복습하는 루틴을 만들어드립니다. 숙제 관리와 계획 세우기를 선생님과 함께 연습합니다.' },
        { icon:'✏️', title:'수행평가 대비', desc:'학교별 수행평가 기준에 맞춰 과제, 발표, 보고서 작성을 꼼꼼히 준비합니다.' },
        { icon:'😊', title:'과목 흥미 유발', desc:'눈높이에 맞는 설명으로 과목에 흥미와 자신감을 심어드립니다. 싫어하는 과목도 재미있게 접근합니다.' },
      ],
      [
        { icon:'📖', title:'기초 개념 완성', desc:'이해가 안 된 부분은 다음으로 넘기지 않고 확실히 짚고 갑니다. 단원마다 완성도 있게 학습합니다.' },
        { icon:'🌱', title:'자기주도 습관', desc:'예습·복습·숙제 관리를 습관으로 만들어드립니다. 선생님 없이도 스스로 공부할 수 있는 힘을 기릅니다.' },
        { icon:'✏️', title:'수행평가 준비', desc:'보고서, 발표, 과제를 선생님과 미리 준비합니다. 일정을 함께 관리해 마감에 쫓기지 않도록 합니다.' },
        { icon:'😊', title:'흥미·자신감 형성', desc:'어렵게 느껴지는 과목을 아이 수준에 맞게 다시 설명합니다. 흥미가 생기면 점수도 자연히 따라옵니다.' },
      ],
      [
        { icon:'📖', title:'교과서 단원 완성', desc:'교과서 진도에 맞춰 단원별 핵심을 정리합니다. 모르는 채로 넘어가는 일 없이 한 단원씩 완성합니다.' },
        { icon:'🌱', title:'공부 루틴 만들기', desc:'공부 루틴이 없는 아이도 선생님과 함께 일정을 잡으며 스스로 하는 습관을 기릅니다.' },
        { icon:'✏️', title:'수행평가 전 과정', desc:'보고서 쓰기부터 발표 연습까지 수행평가 전 과정을 단계별로 함께 준비합니다.' },
        { icon:'😊', title:'눈높이 맞춤 설명', desc:'아이가 이해할 수 있는 언어와 예시로 설명합니다. 지루하거나 어려운 과목도 쉽게 받아들이도록 접근합니다.' },
      ],
    ][v];
    return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 초등 과외 <em>학습 포인트</em></h2>
    <p class="sec-desc">${intro}</p>
    <ul class="check-list">
      ${cards.map(c => `<li><strong>${c.title}</strong> — ${c.desc}</li>`).join('')}
    </ul>
    ${subjectBlock}
  </div>
</section>`;
  }

  // ── 중등 ──
  if (grade === '중등') {
    const intro = [
      `중학교 내신은 고등학교 성적과 입시에 직접 영향을 미칩니다. 드림과외는 ${schoolRef} 학교 출제 경향을 파악하고 체계적인 내신 관리를 도와드립니다.`,
      `중학교 때 내신을 잘 관리하면 고등학교 진학 후 선택의 폭이 넓어집니다. 드림과외는 ${nearSchoolName ? nearSchoolName + '을 포함한 ' : ''}${location} 인근 학교 기출 경향에 맞춘 수업을 제공합니다.`,
      `중등 내신은 지필고사와 수행평가 두 축을 모두 챙겨야 합니다. 드림과외는 ${location} 학교 일정에 맞춰 시험 전 집중 관리와 평소 수업을 병행합니다.`,
    ][v];
    const points = [
      [`${schoolRef} 학교별 기출 분석과 단원별 핵심 문제 유형을 집중적으로 다룹니다. 시험 전 2~3주 특별 관리를 함께 진행합니다.`,
       `서술형·논술형 답안 작성법과 실험 보고서, 발표 자료 준비를 체계적으로 지도합니다.`,
       `과목별 효과적인 공부 방법을 알려드립니다. 오답 노트 활용과 복습 루틴을 함께 만들어드립니다.`,
       `선생님 없이도 스스로 공부하는 힘을 기릅니다. 계획 세우기, 집중력 향상, 시험 관리까지 함께합니다.`],
      [`${nearSchoolName ? nearSchoolName + ' 등 ' : ''}인근 학교 출제 패턴을 분석하고 자주 나오는 유형을 집중 훈련합니다.`,
       `서술형 답안 작성과 수행평가를 함께 준비합니다. 조건 충족과 핵심어 포함법을 반복 훈련합니다.`,
       `틀린 문제를 그냥 넘기지 않습니다. 오답 원인을 파악하고 같은 실수를 반복하지 않도록 관리합니다.`,
       `중간·기말 2~3주 전부터 시험 범위를 집중 정리하고 최종 점검합니다.`],
      [`시험 범위의 핵심 개념을 단원별로 정리합니다. 분량이 많아도 우선순위를 정해 효율적으로 준비합니다.`,
       `수행평가 마감을 미리 파악하고 준비 일정을 함께 잡습니다. 발표·보고서·실험 보고서 전 유형을 지도합니다.`,
       `배운 내용을 잊지 않도록 복습 주기를 만들어드립니다. 시험 직전 몰아서 공부하는 악순환을 끊어드립니다.`,
       `특히 약한 단원을 파악하고 집중적으로 보완합니다. 전체 점수를 끌어올리는 가장 효율적인 방법입니다.`],
    ][v];
    return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 중등 과외 <em>학습 포인트</em></h2>
    <p class="sec-desc">${intro}</p>
    <ul class="check-list">
      ${points.map(p => `<li>${p}</li>`).join('')}
    </ul>
    ${subjectBlock}
  </div>
</section>`;
  }

  // ── 고등 ──
  if (grade === '고등') {
    const intro = [
      `고등학교는 내신과 수능을 동시에 준비하는 중요한 시기입니다. 드림과외는 ${schoolRef} 학교 내신부터 수능·입시 전략까지 체계적으로 관리해드립니다.`,
      `고등 내신은 수시 전형에 직결됩니다. 드림과외는 ${nearSchoolName ? nearSchoolName + '을 포함한 ' : ''}${location} 학교 출제 경향 분석과 수능 연계 학습을 함께 진행합니다.`,
      `수능과 내신을 따로 준비하면 시간이 부족합니다. 드림과외는 ${location} 학교 내신을 수능 흐름에 맞게 연계해 통합 관리합니다.`,
    ][v];
    const points = [
      [`학교 교과서 기반 내신 대비와 수능 연계 학습을 병행합니다. 두 시험이 겹치는 범위를 먼저 완성해 시간을 효율적으로 씁니다.`,
       `학생부 기재 사항을 의식한 수행평가 준비와 세특(세부능력 및 특기사항) 활동을 지도합니다.`,
       `수시·정시 비중과 목표 대학에 맞는 학습 전략을 안내합니다. 진로에 따른 과목 선택도 함께 상담합니다.`,
       `수능 연계 교재 활용법, 모의고사 분석, 오답 정리까지 체계적인 학습 방법을 함께 만들어갑니다.`],
      [`${nearSchoolName ? nearSchoolName + ' 등 ' : ''}${location} 고등학교 출제 경향을 파악하고 빈출 유형을 집중적으로 준비합니다.`,
       `수행평가 주제 선정부터 작성, 발표까지 단계별로 지도합니다. 학생부 세특 활동과도 연계합니다.`,
       `수능 기출을 유형별로 분류하고 취약한 유형을 집중 훈련합니다. 모의고사 성적 분석도 함께 진행합니다.`,
       `내신·수능·모의고사 일정을 통합해 월별 학습 계획을 세웁니다. 중요한 시험을 빠짐없이 준비합니다.`],
      [`내신과 수능이 겹치는 범위를 함께 학습합니다. 별도 준비 시간 없이 효율적으로 두 시험을 대비합니다.`,
       `수행평가, 세특, 동아리 등 학생부 전반을 관리합니다. 수시 전형에서 경쟁력 있는 학생부를 만들어드립니다.`,
       `수시·정시 등 목표에 맞는 입시 경로를 안내합니다. 불필요한 혼란 없이 학습에 집중할 수 있도록 돕습니다.`,
       `모의고사 결과를 과목별·유형별로 분석합니다. 어디서 점수를 더 올릴 수 있는지 구체적인 방향을 찾습니다.`],
    ][v];
    return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 고등 과외 <em>학습 포인트</em></h2>
    <p class="sec-desc">${intro}</p>
    <ul class="check-list">
      ${points.map(p => `<li>${p}</li>`).join('')}
    </ul>
    ${subjectBlock}
  </div>
</section>`;
  }

  // ── 학년 미지정: 전 학년 가이드 ──
  const allIntro = [
    `드림과외는 초등부터 고등까지 학년별 특성에 맞는 1:1 맞춤 학습을 제공합니다. ${location} 학생의 현재 수준과 목표에 따라 최적의 커리큘럼을 구성합니다.`,
    `${location} 학생이라면 학년과 목표에 따라 필요한 학습이 다릅니다. 드림과외는 초등 기초부터 고등 수능까지 단계별로 맞춤 지도합니다.`,
    `학년마다 집중해야 할 포인트가 다릅니다. 드림과외는 ${location} 학생의 현재 학년과 약점을 파악해 가장 필요한 부분부터 채워드립니다.`,
  ][v];
  const midIntro = [
    `중학교 내신은 고등학교 성적과 입시에 직접 영향을 미칩니다. 드림과외는 ${schoolRef} 학교별 출제 경향을 파악하고 체계적인 내신 관리를 도와드립니다.`,
    `중학교 때 내신을 잘 관리하면 고등학교 진학 후 선택의 폭이 넓어집니다. 드림과외는 ${location} 인근 학교 기출 경향에 맞춘 수업을 제공합니다.`,
    `중등 내신은 지필고사와 수행평가 두 축을 모두 챙겨야 합니다. 드림과외는 ${location} 학교 일정에 맞춰 시험 전 집중 관리와 평소 수업을 병행합니다.`,
  ][v];
  const highIntro = [
    `고등학교는 내신과 수능을 동시에 준비하는 중요한 시기입니다. 드림과외는 ${schoolRef} 학교 내신부터 수능·입시 전략까지 체계적으로 관리해드립니다.`,
    `고등 내신은 수시 전형에 직결됩니다. 드림과외는 ${location} 학교 출제 경향 분석과 수능 연계 학습을 함께 진행합니다.`,
    `수능과 내신을 따로 준비하면 시간이 부족합니다. 드림과외는 ${location} 학교 내신을 수능 흐름에 맞게 연계해 통합 관리합니다.`,
  ][v];
  return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 과외 <em>학년별 학습 포인트</em></h2>
    <p class="sec-desc">${allIntro}</p>
    <div class="study-steps">
      <div class="study-step">
        <div class="step-badge">초등</div>
        <div>
          <h3>🌱 기초와 학습 습관</h3>
          <p>${`초등 시기는 학습 습관과 기초 학력의 토대를 만드는 중요한 단계입니다. 드림과외는 아이의 흥미를 살리면서 자기주도학습 능력을 함께 키워드립니다.`} 교과서 중심으로 개념을 다지고, 수행평가 대비와 공부 루틴을 선생님과 함께 만들어드립니다.</p>
        </div>
      </div>
      <div class="study-step">
        <div class="step-badge">중등</div>
        <div>
          <h3>📝 내신과 수행평가 집중</h3>
          <p>${midIntro} 학교별 기출 분석, 서술형 답안 작성, 수행평가 일정 관리까지 함께 챙겨드립니다.</p>
        </div>
      </div>
      <div class="study-step">
        <div class="step-badge">고등</div>
        <div>
          <h3>🎓 내신·수능 동시 대비</h3>
          <p>${highIntro} 학생부 관리, 입시 전략 안내, 모의고사 분석까지 체계적으로 진행합니다.</p>
        </div>
      </div>
    </div>
    ${subjectBlock}
  </div>
</section>`;
}

// ── 헬퍼: 과목별 상세 학습법 섹션 ────────────────────────
function buildSubjectStudySection(subject, location, seed = 5, hashKey = null) {
  const v = getVariant(hashKey || location, seed, 3);
  const methods = {
    수학: {
      intros: [
        `수학은 개념 이해 없이 문제 풀이만 반복하면 실력이 쌓이지 않습니다. ${location} 드림과외 수학 선생님은 원리를 완전히 이해한 뒤 유형 훈련으로 연결하는 방식으로 지도합니다.`,
        `수학 점수가 오르지 않는 이유는 대부분 개념이 불완전하기 때문입니다. ${location} 드림과외는 공식을 외우기 전에 왜 그 공식이 나오는지 이해하는 수업을 합니다.`,
        `문제를 많이 풀어도 개념이 없으면 유사 문제에서 또 막힙니다. ${location} 드림과외 수학 선생님은 개념 이해를 바탕으로 유형별 접근법을 함께 정리합니다.`,
      ],
      items: [
        { icon: '📐', title: '개념 완전 이해', desc: '공식 암기가 아닌 원리 이해 중심 수업입니다. 왜 그런지 이해해야 응용 문제도 풀 수 있습니다.' },
        { icon: '📝', title: '유형별 반복 훈련', desc: '내신 출제 유형을 분류하고 각 유형을 반복 훈련합니다. 실수 없는 안정적인 점수 확보가 목표입니다.' },
        { icon: '🎯', title: '오답 노트 관리', desc: '틀린 문제를 체계적으로 정리하고 반복 복습합니다. 같은 실수를 두 번 하지 않는 습관을 만듭니다.' },
        { icon: '📊', title: '수능 연계 대비', desc: '내신 학습이 수능 수학으로 자연스럽게 이어지도록 커리큘럼을 구성합니다.' },
      ],
    },
    영어: {
      intros: [
        `영어는 단기간에 올리기 어렵지만, 올바른 방법으로 꾸준히 하면 점수가 오릅니다. ${location} 드림과외 영어 선생님은 어휘·독해·서술형을 균형 있게 지도합니다.`,
        `영어는 어휘와 구조를 함께 익혀야 읽기도 쓰기도 수월해집니다. ${location} 드림과외는 교과서 본문 분석부터 수능 유형까지 체계적으로 연결합니다.`,
        `내신 영어와 수능 영어는 방향이 다릅니다. ${location} 드림과외 영어 선생님은 학생의 학년과 목표에 맞게 두 시험을 균형 있게 대비합니다.`,
      ],
      items: [
        { icon: '📖', title: '어휘·문법 기초', desc: '교과서 핵심 어휘와 문법 사항을 정리합니다. 기초가 튼튼해야 독해와 서술형이 수월해집니다.' },
        { icon: '🔍', title: '독해 전략 훈련', desc: '문단 구조 파악, 주제·요지 찾기, 빈칸 추론 등 수능 독해 유형별 접근법을 익힙니다.' },
        { icon: '✍️', title: '서술형 표현 정리', desc: '내신 서술형에 자주 등장하는 표현과 문형을 정리하고 반복 연습합니다.' },
        { icon: '🎙️', title: '말하기·수행평가', desc: '수행평가 말하기·발표 준비를 함께 진행하며 영어에 대한 자신감을 키웁니다.' },
      ],
    },
    국어: {
      intros: [
        `국어는 단순히 글을 읽는 과목이 아닙니다. ${location} 드림과외 국어 선생님은 독해 전략, 문학 분석, 서술형 답안 작성을 체계적으로 지도합니다.`,
        `국어는 문학, 비문학, 문법이 모두 시험에 나옵니다. ${location} 드림과외는 각 영역을 균형 있게 다루며 내신 서술형과 수능 국어를 함께 준비합니다.`,
        `국어 점수는 감으로 푸는 게 아닙니다. ${location} 드림과외 국어 선생님은 지문 분석 방법과 답안 작성 전략을 체계적으로 훈련합니다.`,
      ],
      items: [
        { icon: '📚', title: '문학 작품 분석', desc: '소설·시·수필의 주제, 표현 방식, 서술자 시점 등 내신 출제 포인트를 집중 정리합니다.' },
        { icon: '📄', title: '비문학 독해 전략', desc: '지문 구조 파악과 핵심 정보 추출 능력을 훈련합니다. 수능 비문학 유형도 함께 다룹니다.' },
        { icon: '✏️', title: '서술형 답안 작성', desc: '내신 서술형에서 감점을 줄이는 답안 작성법을 훈련합니다. 조건 확인·핵심어 포함 방법을 익힙니다.' },
        { icon: '🔡', title: '문법 체계 정리', desc: '음운·형태·통사론 등 국어 문법을 체계적으로 정리합니다. 헷갈리는 개념을 확실히 잡아드립니다.' },
      ],
    },
    과학: {
      intros: [
        `과학은 개념과 원리를 이해한 뒤 실험·적용까지 연결해야 내신에서 좋은 점수를 받을 수 있습니다. ${location} 드림과외 과학 선생님은 물리·화학·생물·지구과학 전 분야를 지도합니다.`,
        `과학은 암기만으로는 응용 문제를 풀기 어렵습니다. ${location} 드림과외는 개념 원리 이해를 중심으로 실험·계산·서술형까지 폭넓게 지도합니다.`,
        `수행평가 비중이 큰 과학은 실험 보고서 작성 능력도 중요합니다. ${location} 드림과외 과학 선생님은 개념 수업과 수행평가 준비를 함께 진행합니다.`,
      ],
      items: [
        { icon: '⚗️', title: '핵심 개념 이해', desc: '암기보다 원리 이해 중심으로 개념을 잡습니다. 개념이 잡혀야 응용 문제도 풀 수 있습니다.' },
        { icon: '🔬', title: '실험·수행평가 대비', desc: '실험 보고서 작성법, 결론 도출 방법을 함께 준비합니다. 수행평가 배점이 큰 만큼 철저히 대비합니다.' },
        { icon: '📐', title: '계산 문제 훈련', desc: '물리·화학의 계산 문제를 단계적으로 풀이하는 훈련을 합니다. 공식 적용 순서를 체계화합니다.' },
        { icon: '🧬', title: '단원별 집중 관리', desc: '물리·화학·생물·지구과학 각 단원의 출제 비중을 파악하고 효율적으로 학습합니다.' },
      ],
    },
    사회: {
      intros: [
        `사회는 방대한 내용을 체계적으로 정리하지 않으면 시험에서 실수가 잦습니다. ${location} 드림과외 사회 선생님은 개념 흐름 파악과 서술형 대비에 집중합니다.`,
        `사회는 외울 내용이 많지만 흐름을 이해하면 훨씬 수월해집니다. ${location} 드림과외는 원인·결과 연결 중심으로 개념을 정리하고 서술형까지 대비합니다.`,
        `사회 서술형은 핵심어를 포함한 완결된 문장이 요구됩니다. ${location} 드림과외 사회 선생님은 개념 학습과 답안 작성 훈련을 병행합니다.`,
      ],
      items: [
        { icon: '🗺️', title: '개념 흐름 파악', desc: '단순 암기가 아닌 내용 간의 연결 관계를 파악합니다. 원인·결과 관계를 이해하면 기억에 오래 남습니다.' },
        { icon: '📰', title: '시사·현안 연계', desc: '교과 내용과 실제 사회 현상을 연결해 이해합니다. 수행평가 논술에도 도움이 됩니다.' },
        { icon: '✏️', title: '서술형 답안 작성', desc: '사회 서술형은 핵심어를 포함한 완결된 문장이 중요합니다. 감점 없는 답안 작성을 반복 훈련합니다.' },
        { icon: '📋', title: '수행평가 프로젝트', desc: '발표, 보고서, 포트폴리오 등 다양한 수행평가 형식을 함께 준비합니다.' },
      ],
    },
    한국사: {
      intros: [
        `한국사는 시대별 흐름을 이해하지 않으면 내신과 수능 모두 어렵습니다. ${location} 드림과외 한국사 선생님은 연표 정리와 핵심 사건 중심으로 체계적으로 지도합니다.`,
        `한국사는 암기량이 많지만 시대별 흐름을 먼저 잡으면 훨씬 쉬워집니다. ${location} 드림과외는 전체 역사 흐름을 먼저 그린 뒤 세부 사건을 채워가는 방식으로 지도합니다.`,
        `한국사 내신과 한국사능력검정시험을 함께 준비하면 효율적입니다. ${location} 드림과외 한국사 선생님은 두 시험을 통합한 학습 계획을 제공합니다.`,
      ],
      items: [
        { icon: '⏳', title: '시대별 흐름 파악', desc: '선사시대부터 현대까지 시대별 핵심 사건과 흐름을 연표로 정리합니다. 전체 그림을 먼저 그립니다.' },
        { icon: '📌', title: '핵심 사건·인물 암기', desc: '시험에 자주 나오는 사건, 인물, 제도를 효율적으로 암기하는 전략을 제공합니다.' },
        { icon: '✍️', title: '내신 서술형 대비', desc: '학교별 서술형 출제 경향에 맞춰 답안 작성을 반복 훈련합니다. 조건 충족과 핵심어 포함이 핵심입니다.' },
        { icon: '🎯', title: '한국사능력검정 병행', desc: '내신 한국사와 한국사능력검정시험을 동시에 대비하는 효율적인 학습 계획을 제공합니다.' },
      ],
    },
  };
  const m = subject ? methods[subject] : null;
  if (!m) return '';
  return `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">STUDY METHOD</span>
    <h2 class="sec-title">${location} <em>${subject}</em> 학습 방법</h2>
    <p class="sec-desc">${m.intros[v]}</p>
    <div class="study-steps">
      ${m.items.map(item => `<div class="study-step">
        <div class="step-badge">${item.icon}</div>
        <div><h3>${item.title}</h3><p>${item.desc}</p></div>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

// ── 헬퍼: 내신·수능·수행평가 가이드 섹션 ───────────────────
function buildExamGuideSection(location, nearSchoolName = null, seed = 6, hashKey = null) {
  const v = getVariant(hashKey || location, seed, 9);
  const schoolRef = nearSchoolName || `${location} 인근`;
  const intros = [
    `드림과외는 정기고사, 수행평가, 수능까지 학생의 모든 시험을 함께 준비합니다. ${location} 학교 일정에 맞춰 체계적인 학습 계획을 수립합니다.`,
    `시험마다 준비 방법이 다릅니다. 드림과외는 ${schoolRef} 학교의 내신 기출 경향을 파악하고, 학생 개개인의 일정에 맞는 준비 계획을 함께 세웁니다.`,
    `내신과 수능을 따로 준비하면 시간이 부족합니다. 드림과외는 ${location} 학교 내신 범위와 수능 연계 내용을 통합해 효율적으로 관리합니다.`,
    `시험 직전에 벼락치기하면 다음 시험에도 똑같이 반복됩니다. 드림과외 ${location} 선생님은 평소부터 내신을 꼼꼼히 관리해드립니다.`,
    `${schoolRef} 학교 기출 경향을 알면 공부 효율이 달라집니다. 드림과외는 시험별 출제 포인트를 분석하고 학생에게 꼭 맞는 준비 방법을 제시합니다.`,
    `수행평가는 미리 준비할수록 유리합니다. 드림과외 ${location} 선생님은 정기고사와 수행평가 일정을 통합해 빠짐없이 챙겨드립니다.`,
    `"이번엔 열심히 했는데..." 그 말이 반복된다면 방법이 문제입니다. 드림과외는 ${location} 학생의 시험 준비 방법을 처음부터 다시 세웁니다.`,
    `내신 한 점이 수시 전형에서 결정적입니다. 드림과외 ${location} 선생님은 ${schoolRef} 내신 기출을 분석해 점수를 끌어올립니다.`,
    `시험 일정이 겹칠수록 계획이 중요합니다. 드림과외는 ${location} 학생의 중간·기말·수행평가 일정을 한눈에 정리하고 우선순위를 잡아드립니다.`,
  ];
  const cardSets = [
    [
      { icon:'📋', title:'내신 기출 분석', desc:`${schoolRef} 학교의 기출 문제 유형과 출제 경향을 파악하고 단원별 핵심 문제를 집중적으로 다룹니다.` },
      { icon:'✏️', title:'수행평가 완벽 준비', desc:'서술형·논술형 답안 작성법, 발표 준비, 실험 보고서 작성까지 수행평가의 모든 유형을 함께 대비합니다.' },
      { icon:'🎯', title:'수능 연계 학습', desc:'내신과 수능이 겹치는 범위를 효율적으로 학습합니다. 수능 기출 유형 분석과 취약 영역 집중 보완을 진행합니다.' },
      { icon:'📅', title:'시험 일정 관리', desc:'중간·기말고사, 수행평가, 모의고사 일정을 고려한 월별·주별 학습 계획을 선생님과 함께 수립합니다.' },
    ],
    [
      { icon:'📋', title:'학교별 기출 대비', desc:`${nearSchoolName ? nearSchoolName + '을 포함한 ' : ''}${location} 학교 시험의 출제 패턴을 분석합니다. 자주 나오는 유형과 배점 높은 문제를 집중 준비합니다.` },
      { icon:'✏️', title:'서술형·수행평가', desc:'서술형 답안 작성 방법과 수행평가 준비를 체계적으로 지도합니다. 조건 충족과 감점 포인트 관리에 집중합니다.' },
      { icon:'🎯', title:'수능 기출 분석', desc:'수능 유형별 기출을 분석하고 취약한 영역을 집중적으로 보완합니다. 모의고사 성적 추이도 함께 관리합니다.' },
      { icon:'📅', title:'월별 학습 계획', desc:'내신 시험과 수능 준비 일정을 함께 고려한 월별 계획을 세웁니다. 무엇을 언제 해야 할지 명확하게 정리합니다.' },
    ],
    [
      { icon:'📋', title:'단원별 핵심 정리', desc:`${location} 학교 시험 범위의 핵심 개념을 단원별로 정리합니다. 분량이 많아도 우선순위를 정해 효율적으로 준비합니다.` },
      { icon:'✏️', title:'수행평가 전 유형', desc:'발표·보고서·포트폴리오 등 모든 수행평가 유형을 지도합니다. 마감 전 여유 있게 완성할 수 있도록 일정을 관리합니다.' },
      { icon:'🎯', title:'수능 연계 범위', desc:'교과서 내용 중 수능과 겹치는 범위를 먼저 완성합니다. 내신을 준비하면서 수능 기초도 함께 쌓을 수 있습니다.' },
      { icon:'📅', title:'시험별 집중 기간', desc:'중간·기말 직전 2~3주를 집중 준비 기간으로 설정합니다. 평소 수업과 시험 대비 수업의 균형을 조율합니다.' },
    ],
    [
      { icon:'📋', title:'기출 유형 집중 훈련', desc:`${location} 학교에서 반복 출제되는 유형을 집중 훈련합니다. 한 문제 틀려도 이유를 찾고 다시는 같은 실수를 하지 않습니다.` },
      { icon:'✏️', title:'수행평가 일정 선제 관리', desc:'수행평가 마감 2주 전부터 준비를 시작합니다. 주제 선정·자료 조사·작성까지 선생님이 함께 단계별로 이끌어드립니다.' },
      { icon:'🎯', title:'오답 원인 분석', desc:'틀린 문제의 원인을 파악해야 점수가 오릅니다. 개념 부족인지 실수인지 판단하고 맞춤 보완 계획을 세웁니다.' },
      { icon:'📅', title:'시험 전 마지막 점검', desc:'시험 전날까지 취약 단원을 집중 점검합니다. 헷갈리는 개념을 확실히 정리하고 자신감 있게 시험장에 들어갑니다.' },
    ],
    [
      { icon:'📋', title:'내신 핵심 포인트 압축', desc:`${schoolRef} 시험 범위에서 배점이 높은 포인트를 압축 정리합니다. 공부할 내용이 많을수록 선택과 집중이 중요합니다.` },
      { icon:'✏️', title:'서술형 감점 제로 전략', desc:'서술형은 조건을 모두 충족해야 점수를 받습니다. 핵심어 포함, 문장 구조, 분량 맞추기를 반복 훈련합니다.' },
      { icon:'🎯', title:'수능 빈출 유형 선별', desc:'수능 기출 중 출제 빈도가 높은 유형을 선별해 집중 연습합니다. 시간 대비 효율이 가장 높은 방법입니다.' },
      { icon:'📅', title:'D-30 내신 대비 플랜', desc:'시험 30일 전부터 단계별 준비 계획을 세웁니다. 범위 정리 → 기출 풀이 → 오답 반복 → 최종 점검 순서로 진행합니다.' },
    ],
    [
      { icon:'📋', title:'출제 경향 사전 파악', desc:`${location} 학교의 최근 3회 기출을 분석해 자주 나오는 개념과 문제 형식을 파악합니다. 준비하는 방향 자체가 달라집니다.` },
      { icon:'✏️', title:'수행평가 밀착 지도', desc:'발표·실험·보고서·포트폴리오 등 형식에 맞게 세부 지도합니다. 선생님이 옆에서 함께 완성해드립니다.' },
      { icon:'🎯', title:'모의고사 피드백', desc:'모의고사 결과를 과목별·단원별로 분석합니다. 어디서 점수를 더 올릴 수 있는지 구체적인 방향을 찾습니다.' },
      { icon:'📅', title:'학기별 로드맵 수립', desc:'학기 초부터 중간·기말·수능 일정을 고려한 학기 전체 로드맵을 수립합니다. 큰 그림을 보면 공부가 흔들리지 않습니다.' },
    ],
    [
      { icon:'📋', title:'취약 단원 집중 보완', desc:`${location} 학생의 취약 단원을 먼저 파악합니다. 전체를 다 잘할 필요 없이, 약한 부분을 올리는 게 총점 향상에 가장 효율적입니다.` },
      { icon:'✏️', title:'수행평가 완성도 관리', desc:'수행평가는 완성도가 점수를 결정합니다. 드림과외 선생님은 제출 전 마지막 완성도를 함께 점검해드립니다.' },
      { icon:'🎯', title:'연계 교재 활용 전략', desc:'수능 연계 교재를 학교 내신과 연결해서 학습합니다. 같은 시간을 공부해도 두 가지 효과를 동시에 냅니다.' },
      { icon:'📅', title:'주간 학습 점검', desc:'매주 학습 진도와 이해도를 점검합니다. 놓친 부분이 생기면 즉시 보완해 시험 전 허점을 없앱니다.' },
    ],
    [
      { icon:'📋', title:'중간·기말 집중 대비', desc:`${schoolRef} 시험 2주 전부터 집중 모드로 전환합니다. 핵심 개념 압축, 기출 반복, 오답 정리를 순서대로 진행합니다.` },
      { icon:'✏️', title:'논술·서술형 전략 훈련', desc:'논술형 문항은 논리적 구성이 핵심입니다. 서론-본론-결론 구조와 핵심어 배치 방법을 반복 훈련합니다.' },
      { icon:'🎯', title:'수능 등급 전략', desc:'목표 등급에 맞는 학습 범위를 설정합니다. 2등급은 1등급과 다른 전략이 필요합니다. 효율적인 목표 설정으로 점수를 끌어올립니다.' },
      { icon:'📅', title:'시험별 D-DAY 카운트다운', desc:'시험마다 D-DAY를 설정하고 역순으로 일정을 배치합니다. 마감에 쫓기지 않고 여유 있게 준비를 마칩니다.' },
    ],
    [
      { icon:'📋', title:'내신 오답 패턴 분석', desc:`${location} 학생의 지난 시험 오답을 분석합니다. 반복되는 실수 패턴을 파악하면 다음 시험 준비 방향이 명확해집니다.` },
      { icon:'✏️', title:'수행평가 주제 선정 지원', desc:'수행평가 주제 선정부터 자료 수집, 작성까지 전 과정을 함께합니다. 처음부터 방향을 잘 잡으면 훨씬 수월합니다.' },
      { icon:'🎯', title:'수능 약점 과목 집중', desc:'모의고사 결과에서 약점 과목을 파악해 집중 보완합니다. 강한 과목보다 약한 과목을 올리는 것이 총점 상승에 효율적입니다.' },
      { icon:'📅', title:'학사 일정 연동 관리', desc:'학교 학사 일정을 수업 계획에 반영합니다. 현장 체험, 행사, 방학 일정까지 고려해 균형 잡힌 학습을 유지합니다.' },
    ],
  ];
  return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">EXAM GUIDE</span>
    <h2 class="sec-title">${location} <em>시험 대비</em> 방법</h2>
    <p class="sec-desc">${intros[v]}</p>
    <ul class="check-list">
      ${cardSets[v].map(c => `<li><strong>${c.title}</strong> — ${c.desc}</li>`).join('')}
    </ul>
  </div>
</section>`;
}

// ── 헬퍼: 지역 차별화 섹션 (텍스트 블록) ──────────────────
function buildLocalAreaSection(dong, displayDong, gu, nearSchoolName, isVisit) {
  const areaDesc = DONG_DESC[dong] || GU_DESC[gu] || `${gu}에 위치한 주거 지역입니다.`;
  const visitText = isVisit
    ? `방문과외와 화상과외를 모두 선택할 수 있습니다. 학생 자택으로 직접 방문하거나, 집에서 화상으로 수업받는 두 가지 방법을 상황에 따라 유연하게 바꿀 수 있습니다.`
    : `화상과외로 진행됩니다. 이동 시간 없이 집에서 전문 선생님과 1:1 수업이 가능하며, 전국 어디서나 이용할 수 있습니다.`;
  const schoolText = nearSchoolName
    ? `${nearSchoolName} 학생이라면 해당 학교 기출 문제와 내신 출제 경향을 파악한 선생님을 연결해드립니다. 수행평가·서술형 대비도 함께 진행합니다.`
    : `${gu} 인근 학교의 내신 출제 경향에 맞춘 수업을 진행합니다. 학교 교과서와 기출 문제를 중심으로, 학교별 맞춤 수업을 구성합니다.`;

  return `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">LOCAL INFO</span>
    <h2 class="sec-title">${displayDong} <em>과외 안내</em></h2>
    <p class="sec-desc">${areaDesc}</p>
    <div class="info-block">
      <p>📍 <strong>수업 방식</strong> — ${visitText}</p>
      <p>🏫 <strong>내신 대비</strong> — ${schoolText}</p>
      <p>📅 <strong>수업 일정</strong> — 학생과 학부모님의 일정에 맞춰 주 1~5회, 1회 1~2시간으로 유연하게 조율합니다. 시험 기간 전후로 집중 수업 일정도 함께 조율 가능합니다.</p>
    </div>
    <div class="info-tags">
      ${isVisit ? '<span class="info-tag">🏠 방문과외 가능</span>' : ''}
      <span class="info-tag">💻 화상과외 가능</span>
      <span class="info-tag">📋 내신 기출 대비</span>
      <span class="info-tag">✅ 첫 30분 무료</span>
      <span class="info-tag">⚡ 24시간 내 매칭</span>
    </div>
  </div>
</section>`;
}

// ── 헬퍼: FAQ 5개 생성 ────────────────────────────────
function buildFAQs({ dong, gu, grade, subject, isVisit }) {
  const s = subject || '과외';
  const g = grade || '';
  const gradeQ = grade === '초등' ? '초등학생도 1:1 과외 효과가 있나요?'
    : grade === '중등' ? `${dong} ${g} 내신 대비는 어떻게 진행되나요?`
    : grade === '고등' ? `${dong} ${g} 내신과 수능 동시 대비가 가능한가요?`
    : `${dong} 학교 내신 대비도 가능한가요?`;
  const gradeA = grade === '초등'
    ? `네, 초등학생은 학습 습관 형성이 중요한 시기입니다. 드림과외 선생님은 눈높이에 맞는 설명으로 과목별 흥미를 유발하고, 자기주도학습 습관을 함께 잡아드립니다. 수행평가 대비도 함께 진행합니다.`
    : grade === '중등'
    ? `중학교 내신은 지필고사와 수행평가가 모두 중요합니다. 드림과외 선생님은 ${dong} 인근 학교의 출제 경향을 숙지하고, 단원별 핵심 개념과 서술형 문제 대비 커리큘럼을 제공합니다.`
    : grade === '고등'
    ? `고등학교 시기에는 내신과 수능을 동시에 대비해야 합니다. 드림과외 선생님은 ${dong} 인근 학교 내신 기출 분석과 함께 수능 연계 학습을 병행하며, 학생부 관리와 입시 전략도 안내해드립니다.`
    : `드림과외 선생님들은 ${dong} 인근 학교 내신 대비에 충분한 경험을 갖추고 있습니다. 학생 학교와 학년에 맞춘 내신 대비 커리큘럼을 제공하며, 서술형·수행평가 대비도 함께 진행합니다.`;
  return [
    {
      q: `${dong} 방문과외도 가능한가요?`,
      a: isVisit
        ? `네, ${dong}은 방문과외 서비스 지역입니다. 학생 자택으로 직접 방문하는 1:1 수업을 제공합니다. 화상과외도 함께 선택 가능하며, 상황에 맞게 유연하게 변경할 수 있습니다.`
        : `${dong} 지역은 화상과외로 진행됩니다. 집에서 편리하게 전국 최고 수준의 선생님과 1:1 수업이 가능하며, 이동 시간을 절약해 더 많은 시간을 학습에 집중할 수 있습니다.`,
    },
    {
      q: gradeQ,
      a: gradeA,
    },
    {
      q: `${g}${subject ? subject + ' ' : ''}선생님은 어떻게 검증되나요?`,
      a: `드림과외는 30년+ 교육 노하우를 바탕으로 학력·경력·수업 능력을 종합적으로 평가한 전문 선생님을 연결합니다. 수강생 피드백을 지속적으로 관리하며 수업 품질을 유지합니다.`,
    },
    {
      q: `수업 일정이나 교재는 어떻게 정하나요?`,
      a: `수업 일정은 학생·학부모님과 상의해 주 1~5회 유연하게 조정합니다. 교재는 선생님이 학생의 학교 교과서와 수준에 맞춰 추천해드리며, 학교 교과서 위주 수업도 가능합니다.`,
    },
    {
      q: `첫 수업이 정말 무료인가요?`,
      a: `네, 첫 30분은 무료 체험입니다. 선생님의 수업 방식, 학생과의 궁합, 커리큘럼 방향을 직접 체험한 후 결정하실 수 있습니다.`,
    },
  ];
}

// ── 헬퍼: 동 페이지 학교 섹션 ────────────────────────────
function buildDongSchoolSection(dong, displayDong, subject, gu) {
  const schools = DONG_TO_SCHOOLS[(gu || '') + '|' + dong] || DONG_TO_SCHOOLS[dong];
  if (!schools || schools.length === 0) return '';
  const subj = subject || '';
  const links = [...schools].sort((a, b) => a.localeCompare(b, 'ko')).map(s => {
    const short = s.replace(/여자고등학교$/, '여고').replace(/여자중학교$/, '여중').replace(/초등학교$/, '초').replace(/중학교$/, '중').replace(/고등학교$/, '고').replace(/학교$/, '');
    return `<a href="/${encodeURIComponent(s + subj + '과외')}" class="school-link">🏫 ${short}</a>`;
  }).join('');
  return `<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SCHOOLS</span>
    <h2 class="sec-title">${displayDong} <em>학교 내신</em> 과외</h2>
    <p class="sec-desc">${displayDong} 학교별 내신 기출을 숙지한 전문 선생님을 연결해드립니다.</p>
    <div class="school-link-grid">${links}</div>
  </div>
</section>`;
}

// ── 헬퍼: 구 페이지 학교 섹션 ────────────────────────────
function buildGuSchoolSection(gu, displayGu, subject, sido) {
  const schools = GU_TO_SCHOOLS[(sido || '') + '|' + gu] || GU_TO_SCHOOLS[gu];
  if (!schools || schools.length === 0) return '';
  const subj = subject || '';
  const sorted = [...schools].sort((a, b) => a.localeCompare(b, 'ko'));
  const elem   = sorted.filter(s => s.includes('초등'));
  const middle = sorted.filter(s => s.includes('중학'));
  const high   = sorted.filter(s => s.includes('고등'));
  const other  = sorted.filter(s => !s.includes('초등') && !s.includes('중학') && !s.includes('고등'));

  function schoolLinks(list) {
    return list.map(s => {
      const short = s.replace(/여자고등학교$/, '여고').replace(/여자중학교$/, '여중').replace(/초등학교$/, '초').replace(/중학교$/, '중').replace(/고등학교$/, '고').replace(/학교$/, '');
      return `<a href="/${encodeURIComponent(s + subj + '과외')}" class="school-link">🏫 ${short}</a>`;
    }).join('');
  }

  const groups = [
    { label: '초등학교', list: elem },
    { label: '중학교',   list: middle },
    { label: '고등학교', list: high },
    { label: '기타',     list: other },
  ].filter(g => g.list.length > 0);

  const html = groups.map(g => `
    <div class="school-group">
      <h3 class="school-group-title">${g.label} <span class="school-count">${g.list.length}개</span></h3>
      <div class="school-link-grid">${schoolLinks(g.list)}</div>
    </div>`).join('');

  return `<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SCHOOLS</span>
    <h2 class="sec-title">${displayGu} <em>학교 내신</em> 과외</h2>
    <p class="sec-desc">${displayGu} 인근 학교 내신 시험에 맞춘 1:1 전문 과외를 제공합니다.</p>
    ${html}
  </div>
</section>`;
}

// ── 헬퍼: 관련 링크 생성 ────────────────────────────────
function buildDongRelatedLinks({ dong, displayDong, gu, grade, subject, nearSchoolName }) {
  const links = [];
  const guDisplay = stripGuSuffix(gu);

  if (!grade && !subject) {
    for (const s of Object.keys(SUBJECTS)) {
      links.push(`<a href="/${encodeURIComponent(displayDong + s + '과외')}">${displayDong} ${s}과외</a>`);
    }
    for (const g of Object.keys(GRADES)) {
      links.push(`<a href="/${encodeURIComponent(displayDong + g + '과외')}">${displayDong} ${g}과외</a>`);
    }
  } else if (grade && !subject) {
    for (const s of Object.keys(SUBJECTS)) {
      links.push(`<a href="/${encodeURIComponent(displayDong + grade + s + '과외')}">${displayDong} ${grade} ${s}과외</a>`);
    }
    links.push(`<a href="/${encodeURIComponent(displayDong + '과외')}">${displayDong} 과외 전체</a>`);
  } else if (!grade && subject) {
    for (const g of Object.keys(GRADES)) {
      links.push(`<a href="/${encodeURIComponent(displayDong + g + subject + '과외')}">${displayDong} ${g} ${subject}과외</a>`);
    }
    links.push(`<a href="/${encodeURIComponent(displayDong + '과외')}">${displayDong} 과외 전체</a>`);
  } else {
    links.push(`<a href="/${encodeURIComponent(displayDong + subject + '과외')}">${displayDong} ${subject}과외</a>`);
    links.push(`<a href="/${encodeURIComponent(displayDong + grade + '과외')}">${displayDong} ${grade}과외</a>`);
    links.push(`<a href="/${encodeURIComponent(displayDong + '과외')}">${displayDong} 과외 전체</a>`);
  }

  links.push(`<a href="/${encodeURIComponent(guDisplay + '과외')}">${guDisplay} 과외 전체보기</a>`);

  // 역방향 링크: 동 → 해당 학교 과외 페이지
  if (nearSchoolName) {
    const shortSchool = nearSchoolName.replace(/학교$/, '');
    const schoolSlug  = subject
      ? `${nearSchoolName}${subject}과외`
      : `${nearSchoolName}과외`;
    links.push(`<a href="/${encodeURIComponent(schoolSlug)}">🏫 ${shortSchool} 내신 과외</a>`);
  }

  return links.join('');
}

// ── 헬퍼: 과목 이모지 ────────────────────────────────
function subjectEmoji(info) {
  return info?.emoji || '📚';
}

// ── 화상과외 페이지 렌더러 ────────────────────────────
export function renderOnlinePage({ level, sido, sigungu, dong, grade, subject }) {
  const subjectInfo = subject ? SUBJECTS[subject] : null;
  const gradeInfo   = grade   ? GRADES[grade]     : null;

  // 표시용 지역명 + 링크용 slug (중복 시군구/동 처리)
  let displayName, linkSlug, pageTitle, pageDesc;
  // 방문과외 가능 여부 판단
  let isVisit = false;
  if (level === 'dong' && dong) {
    isVisit = !!(VISIT_REGIONS[sido]?.[sigungu]?.includes(dong));
  } else if (level === 'sigungu' && sigungu) {
    isVisit = !!(VISIT_REGIONS[sido]?.[sigungu]?.length);
  } else if (level === 'sido') {
    isVisit = !!(VISIT_REGIONS[sido] && Object.keys(VISIT_REGIONS[sido]).length > 0);
  }

  const serviceText = isVisit ? '방문·화상과외' : '화상과외';

  if (level === 'dong') {
    displayName = dong;
    linkSlug    = dongSlug(sigungu, dong);
    pageTitle   = `${linkSlug}${grade || ''}${subject || ''}과외`;
    pageDesc    = `${dong} ${serviceText} 전문 선생님 연결. 1:1 맞춤 수업, 첫 30분 무료 체험.`;
  } else if (level === 'sigungu') {
    displayName = sigungu;
    linkSlug    = sigunguSlug(sido, sigungu);
    pageTitle   = `${linkSlug}${grade || ''}${subject || ''}과외`;
    pageDesc    = `${sigungu} ${serviceText} 전문 선생님 연결. 1:1 맞춤 수업으로 성적 향상, 첫 30분 무료 체험.`;
  } else {
    displayName = sido;
    linkSlug    = sido;
    pageTitle   = `${sido}${grade || ''}${subject || ''}과외`;
    pageDesc    = `${sido} ${serviceText} 전문 선생님 연결. 전 과목 1:1 맞춤 수업, 첫 30분 무료 체험.`;
  }

  const keyword = pageTitle;
  const subjectLabel = subject || '전 과목';
  const gradeLabel   = grade   || '전 학년';

  const head = buildHead({
    title:       `${pageTitle} | 드림과외`,
    description: pageDesc,
    url:         `/${encodeURIComponent(keyword)}`,
    type:        isVisit ? 'local' : 'online',
  });

  // WHY 섹션
  const onlineFeatures = `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${displayName} <em>드림과외</em> 특징</h2>
    <p class="sec-desc">이동 없이 집에서 전국 최고 수준의 선생님과 1:1 맞춤 수업을 받으세요.</p>
    <div class="str-grid">
      <div class="str-card"><span class="str-icon">🏆</span><div class="str-num">30<span>년+</span></div><h3>교육 노하우</h3><p>30년+ 교육 현장 경험으로 과목별 최적 커리큘럼 제공. 수능부터 내신까지 체계적 관리.</p></div>
      <div class="str-card"><span class="str-icon">👥</span><div class="str-num">100<span>만+</span></div><h3>누적 회원수</h3><p>전국 100만 명 이상의 학생과 학부모가 드림과외와 함께한 교육 플랫폼입니다.</p></div>
      <div class="str-card"><span class="str-icon">👩‍🏫</span><div class="str-num">2,000<span>+</span></div><h3>전문 선생님</h3><p>각 과목·학년별 전문 선생님이 1:1 맞춤 수업을 진행합니다.</p></div>
      <div class="str-card"><span class="str-icon">⚡</span><div class="str-num">24<span>h</span></div><h3>빠른 매칭</h3><p>신청 후 24시간 이내 전문 선생님을 연결합니다. 지역 제한 없이 맞춤 매칭.</p></div>
    </div>
  </div>
</section>`;

  // 과목 섹션 (링크에 linkSlug 사용 - 중복 시군구/동 처리)
  const subjectSection = subjectInfo ? `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECT</span>
    <h2 class="sec-title">${displayName} <em>${subject} 과외</em></h2>
    <p class="sec-desc">${subjectInfo.emoji} ${subjectInfo.desc} 전담 선생님을 연결해드립니다.</p>
    <div class="link-list">
      ${Object.entries(SUBJECTS).map(([s, info]) =>
        `<a href="/${encodeURIComponent(linkSlug + s + '과외')}">${info.emoji} ${displayName} ${s}과외</a>`
      ).join('')}
    </div>
  </div>
</section>` : `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">${displayName} <em>과목별 과외</em></h2>
    <p class="sec-desc">수학·영어·국어·과학·사회·한국사 전 과목 1:1 맞춤 과외를 제공합니다.</p>
    <div class="link-list">
      ${Object.entries(SUBJECTS).map(([s, info]) =>
        `<a href="/${encodeURIComponent(linkSlug + s + '과외')}">${info.emoji} ${displayName} ${s}과외</a>`
      ).join('')}
    </div>
  </div>
</section>`;

  // 학년 섹션 (링크에 linkSlug 사용)
  const gradeSubjectLinks = gradeInfo
    ? Object.entries(SUBJECTS).map(([s, info]) =>
        `<a href="/${encodeURIComponent(linkSlug + grade + s + '과외')}">${info.emoji} ${displayName} ${grade} ${s}과외</a>`
      ).join('')
    : '';
  const gradeSection = gradeInfo ? `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">RELATED</span>
    <h2 class="sec-title">${gradeLabel} <em>과목별 과외</em></h2>
    <p class="sec-desc">${displayName} ${grade} 과외를 과목별로 찾아보세요.</p>
    <div class="link-list">${gradeSubjectLinks}</div>
  </div>
</section>` : `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">GRADES</span>
    <h2 class="sec-title">${displayName} <em>학년별 과외</em></h2>
    <p class="sec-desc">초등·중등·고등 전 학년 맞춤 과외를 제공합니다.</p>
    <div class="link-list">
      ${Object.entries(GRADES).map(([g]) =>
        `<a href="/${encodeURIComponent(linkSlug + g + '과외')}">📖 ${displayName} ${g}과외</a>`
      ).join('')}
    </div>
  </div>
</section>`;

  // 가격 섹션
  const priceSection = `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">PRICING</span>
    <h2 class="sec-title">${displayName} 과외 <em>예상 비용</em></h2>
    ${isVisit ? `<div class="price-text-block">
      <h3>🏠 방문과외 예상 비용</h3>
      <p>초등 월 26만원 / 중등 월 30만원 / 고1·2 월 34만원 / 고3 월 38만원</p>
    </div>` : ''}
    <div class="price-text-block">
      <h3>💻 화상과외 예상 비용</h3>
      <p>초등 월 24만원 / 중등 월 27만원 / 고1·2 월 31만원 / 고3 월 33만원</p>
    </div>
    <p class="price-note">※ 첫 30분 무료 체험 제공 · 정확한 비용은 무료 상담 후 안내</p>
    <p class="price-note">(주 2회·1시간 기준, 수업 횟수·시간에 따라 달라질 수 있습니다)</p>
  </div>
</section>`;

  // 하위/상위 지역 링크
  const navLinks = buildOnlineNavLinks({ level, sido, sigungu, dong, subject });

  // FAQ
  const faqs = [
    { q: `${displayName} 과외 선생님은 어떻게 연결되나요?`, a: `전국 각지의 검증된 선생님 중 ${displayName} 학생에게 최적인 분을 매칭해드립니다. 30년+ 교육 노하우를 바탕으로 학력·경력·수업 능력을 종합 평가합니다.` },
    isVisit
      ? { q: `${displayName} 방문과외도 가능한가요?`, a: `네, ${displayName} 지역은 방문과외와 화상과외 모두 가능합니다. 학생 자택으로 직접 방문하는 1:1 수업과 집에서 편하게 받는 화상 수업 중 선택하실 수 있습니다.` }
      : { q: `화상 수업에 필요한 장비가 있나요?`, a: `태블릿 또는 노트북을 준비해주시면 됩니다. 수업 방법은 상담 후 안내해드립니다.` },
    { q: `첫 수업은 정말 무료인가요?`, a: `네, 첫 30분은 무료 체험입니다. 체험 후 선생님이 맞으면 정식 수업을 진행하시면 됩니다.` },
    { q: `${displayName} 학교 내신 대비도 가능한가요?`, a: `드림과외 선생님들은 ${displayName} 인근 학교 내신 대비에 충분한 경험을 갖추고 있습니다. 학교 교과서·기출 중심 수업과 서술형·수행평가 대비도 함께 진행합니다.` },
    { q: `수업 일정은 어떻게 조율하나요?`, a: `학생·학부모님이 원하시는 요일·시간을 말씀해주시면 맞춰드립니다. 주 1~5회 유연하게 설정 가능합니다.` },
  ];

  const faqSchema = buildFAQSchema(faqs);

  const body = `
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">${level === 'dong' ? `📍 ${sido} · ${sigungu}` : level === 'sigungu' ? `📍 ${sido}` : '🌐 전국 서비스'}</div>
    <h1 class="page-h1">${displayName}<em>${subject || ''}과외</em>${grade ? `&nbsp;${grade}` : ''}</h1>
    <p class="page-desc">
      ${pageDesc}
      상담 신청 후 24시간 내 매칭, 첫 30분 무료 체험.
    </p>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤 수업</span>
      <span class="hero-chip">✅ 24시간 내 매칭</span>
      <span class="hero-chip">✅ 첫 30분 무료 체험</span>
      ${isVisit ? '<span class="hero-chip">🏠 방문과외</span>' : ''}
      <span class="hero-chip">💻 화상과외</span>
      <span class="hero-chip">📋 내신 전문</span>
      ${subject ? `<span class="hero-chip">${subjectInfo.emoji} ${subject} 전문</span>` : ''}
    </div>
  </div>
</section>
${onlineFeatures}
${subjectSection}
${buildLearningSection(grade, subject, displayName)}
${buildSubjectStudySection(subject, displayName)}
${buildExamGuideSection(displayName)}
${priceSection}
${gradeSection}
${navLinks}
${ctaBox(keyword)}
${faqSection(faqs, faqSchema)}
${consultForm({
  leftTitle: `<em>지금 바로</em> 무료 상담<br>신청하세요`,
  leftDesc: `${displayName} 전문 선생님을<br>24시간 내 연결해드립니다.`,
  leftPts: [
    '상담 후 24시간 내 선생님 매칭',
    '첫 30분 무료 체험',
    '전 과목 1:1 맞춤 수업',
    '맞춤 커리큘럼 제공',
  ],
  regionValue: displayName,
})}
`;

  const breadcrumb = buildOnlineBreadcrumb({ level, sido, sigungu, dong, grade, subject });

  return layout({
    head,
    body,
    breadcrumb,
    keyword,
    region: displayName,
  });
}

function buildOnlineBreadcrumb({ level, sido, sigungu, dong, grade, subject }) {
  const bc = [{ label: '홈', href: '/' }];
  const suffix = (grade || '') + (subject || '') + '과외';
  bc.push({ label: `${sido} 과외`, href: `/${encodeURIComponent(sido + '과외')}` });
  if (level === 'sigungu' || level === 'dong') {
    bc.push({ label: `${sigungu} 과외`, href: `/${encodeURIComponent(sigungu + '과외')}` });
  }
  if (level === 'dong') {
    bc.push({ label: `${dong} ${suffix}` });
  } else if (level === 'sigungu') {
    bc.push({ label: `${sigungu} ${suffix}` });
  } else {
    bc.push({ label: `${sido} ${suffix}` });
  }
  return bc;
}

function buildOnlineNavLinks({ level, sido, sigungu, dong, subject }) {
  const links = [];
  const loc = dong || sigungu || sido;
  const subjectLinks = Object.keys(SUBJECTS).map(s =>
    `<a href="/${encodeURIComponent(loc + s + '과외')}">${s}과외</a>`
  ).join('');

  if (level === 'sido') {
    const sigungus = Object.keys(ALL_REGIONS[sido] || {}).sort((a, b) => a.localeCompare(b, 'ko'));
    if (sigungus.length) {
      links.push(`
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">AREAS</span>
    <h2 class="sec-title">${sido} <em>시군구별 과외</em></h2>
    <p class="sec-desc">아래 지역을 선택하시면 해당 시군구 전문 선생님을 안내해드립니다.</p>
    <div class="card-grid">
      ${sigungus.map(sg => {
        const sg_slug = sigunguSlug(sido, sg);
        const slug = subject ? `${sg_slug}${subject}과외` : `${sg_slug}과외`;
        return `<div class="card"><a href="/${encodeURIComponent(slug)}">${sg} 과외</a></div>`;
      }).join('')}
    </div>
  </div>
</section>`);
    }
  } else if (level === 'sigungu') {
    const dongs = [...(ALL_REGIONS[sido]?.[sigungu] || [])].sort((a, b) => a.localeCompare(b, 'ko'));
    if (dongs.length) {
      const sg_slug = sigunguSlug(sido, sigungu);
      links.push(`
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">AREAS</span>
    <h2 class="sec-title">${sigungu} <em>동별 과외</em></h2>
    <p class="sec-desc">아래 동을 선택하시면 해당 지역 전문 선생님을 안내해드립니다.</p>
    <div class="link-list" style="margin-bottom:16px">
      <a href="/${encodeURIComponent(sido + '과외')}">← ${sido} 과외 전체보기</a>
      <a href="/${encodeURIComponent(sg_slug + '과외')}">${sigungu} 과외 전체</a>
    </div>
    <div class="card-grid">
      ${dongs.map(d => {
        const ds = dongSlug(sigungu, d);
        const slug = subject ? `${ds}${subject}과외` : `${ds}과외`;
        return `<div class="card"><a href="/${encodeURIComponent(slug)}">${d} 과외</a></div>`;
      }).join('')}
    </div>
  </div>
</section>`);
    }
    // 시군구 학교 섹션
    links.push(buildGuSchoolSection(sigungu, sigungu, subject, sido));
  } else {
    const sg_slug = sigunguSlug(sido, sigungu);
    // 동 학교 섹션
    links.push(buildDongSchoolSection(dong, dong, subject, sigungu));
    links.push(`
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">RELATED</span>
    <h2 class="sec-title">${dong} <em>관련 과외</em></h2>
    <p class="sec-desc">상위 지역 및 다른 과목별 과외 정보를 확인하세요.</p>
    <div class="link-list">
      <a href="/${encodeURIComponent(sg_slug + '과외')}">← ${sigungu} 과외 전체</a>
      <a href="/${encodeURIComponent(sido + '과외')}">← ${sido} 과외 전체</a>
      ${subjectLinks}
    </div>
  </div>
</section>`);
  }
  return links.join('\n');
}

// ── 홈페이지 ─────────────────────────────────────────────
export function renderHomePage() {
  const title = '드림과외 | 전국 1:1 전문 과외 매칭';
  const description = '초·중·고 전 과목 1:1 맞춤 과외. 방문·화상 모두 가능. 검증된 선생님 24시간 내 매칭. 첫 30분 무료 체험.';
  const url = '/';
  const homeSchemas = buildHomeSchema();
  const homeSchemaScripts = homeSchemas
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('');
  const head = buildHead({ title, description, url, type: 'local' }) + homeSchemaScripts;

  const body = `
<style>
/* ── 홈 전용 추가 CSS ── */
.home-stats{display:grid;grid-template-columns:repeat(4,1fr);margin-top:32px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:14px;overflow:hidden}
.home-stat{text-align:center;padding:18px 12px;border-right:1px solid rgba(255,255,255,.1)}
.home-stat:last-child{border-right:none}
.home-stat-num{display:block;font-family:"Gmarket Sans",sans-serif;font-size:24px;font-weight:700;color:#fff;line-height:1.1}
.home-stat-num span{font-size:13px;color:var(--acc2)}
.home-stat-label{font-size:11px;color:rgba(255,255,255,.6);margin-top:3px;display:block}
.subj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin-top:40px}
.subj-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:22px 16px;text-align:center;cursor:pointer;transition:.2s;text-decoration:none;display:block;font-family:inherit;width:100%;box-sizing:border-box}
.subj-card:hover{border-color:var(--acc);transform:translateY(-3px);box-shadow:var(--shadow-h);background:var(--white)}
.subj-icon{font-size:32px;display:block;margin-bottom:10px}
.subj-name{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:3px}
.subj-desc{font-size:11px;color:var(--muted)}
.rgn-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-top:40px}
.rgn-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:16px 12px;text-align:center;text-decoration:none;transition:.2s;display:block}
.rgn-card:hover{border-color:var(--acc);background:rgba(90,143,123,.04);transform:translateY(-2px)}
.rgn-icon{font-size:22px;display:block;margin-bottom:6px}
.rgn-name{font-size:14px;font-weight:700;color:var(--ink)}
.rgn-sub{font-size:11px;color:var(--muted);margin-top:2px}
.step-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:40px;position:relative}
.step-grid::before{content:"";position:absolute;top:27px;left:12.5%;right:12.5%;height:1px;background:repeating-linear-gradient(90deg,var(--acc) 0,var(--acc) 8px,transparent 8px,transparent 18px);z-index:0}
.step-item{text-align:center;padding:0 12px;position:relative;z-index:1}
.step-circle{width:54px;height:54px;border-radius:50%;background:var(--bg);border:2px solid var(--acc);display:flex;align-items:center;justify-content:center;font-family:"Gmarket Sans",sans-serif;font-size:20px;font-weight:700;color:var(--acc);margin:0 auto 16px;box-shadow:0 0 0 6px var(--bg)}
.step-item h3{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px}
.step-item p{font-size:12px;color:var(--muted);line-height:1.68}
.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px}
.rev-card{background:var(--white);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow);border:1px solid var(--border)}
.rev-stars{color:var(--acc2);font-size:13px;letter-spacing:2px;margin-bottom:12px}
.rev-text{font-size:13.5px;color:var(--ink);line-height:1.88;margin-bottom:16px;word-break:keep-all}
.rev-author{display:flex;align-items:center;gap:10px;padding-top:14px;border-top:1px solid var(--border)}
.rev-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Gmarket Sans",sans-serif;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.rev-name{font-size:13px;font-weight:700;color:var(--ink)}
.rev-info{font-size:11px;color:var(--muted);margin-top:2px}
@media(max-width:768px){
  .home-stats{grid-template-columns:1fr 1fr}
  .home-stat{border-right:none;border-bottom:1px solid rgba(255,255,255,.1)}
  .home-stat:nth-child(odd){border-right:1px solid rgba(255,255,255,.1)}
  .home-stat:nth-last-child(-n+2){border-bottom:none}
  .subj-grid{grid-template-columns:repeat(3,1fr);gap:10px}
  .subj-card{padding:16px 10px}
  .subj-icon{font-size:26px;margin-bottom:8px}
  .subj-name{font-size:13px}
  .rgn-grid{grid-template-columns:repeat(3,1fr);gap:10px}
  .step-grid{grid-template-columns:1fr 1fr;gap:28px 16px}
  .step-grid::before{display:none}
  .rev-grid{grid-template-columns:1fr}
}
@media(max-width:420px){
  .subj-grid{grid-template-columns:repeat(3,1fr)}
  .rgn-grid{grid-template-columns:repeat(3,1fr)}
}
/* 학년별 섹션 */
.grade-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:40px}
.grade-group{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:24px 20px}
.grade-group h3{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid var(--acc)}
.grade-links{display:flex;flex-wrap:wrap;gap:8px}
.grade-link{font-size:13px;color:var(--acc);text-decoration:none;background:rgba(90,143,123,.06);border-radius:20px;padding:4px 12px;transition:.15s}
.grade-link:hover{background:var(--acc);color:#fff}
/* 인기 지역 섹션 */
.hot-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px}
.hot-card{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:10px 18px;transition:.2s}
.hot-card:hover{border-color:var(--acc);color:var(--acc);transform:translateY(-2px)}
/* 프로모 배너 섹션 */
.promo-banner{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.promo-visual img{width:100%;max-width:420px;height:auto;display:block;border-radius:18px;object-fit:cover;box-shadow:0 8px 32px rgba(44,51,69,.12)}
@media(max-width:768px){
  .grade-tabs{grid-template-columns:1fr}
  .hot-grid{gap:8px}
  .hot-card{font-size:13px;padding:8px 14px}
  .promo-banner{grid-template-columns:1fr;gap:28px}
  .promo-visual{order:-1}
  .promo-visual img{max-width:320px;margin:0 auto}
}
</style>

<!-- HERO -->
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">📍 전국 서비스</div>
    <h1 class="page-h1">내 아이에게 딱 맞는 <em>선생님</em>을 만나세요</h1>
    <ul class="hero-points">
      <li>성적이 오르지 않는다면, 아직 맞는 선생님을 못 만난 겁니다.</li>
      <li>학교·과목·수준에 꼭 맞는 선생님을 직접 골라 연결합니다.</li>
      <li>방문·화상 모두 가능, 신청 다음날이면 수업이 시작됩니다.</li>
    </ul>
    <div class="hero-btns">
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청하기</button>
      <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
    </div>
    <div class="hero-chips">
      <span class="hero-chip">✅ 1:1 맞춤</span>
      <span class="hero-chip">✅ 24h 매칭</span>
      <span class="hero-chip">✅ 무료 체험</span>
      <span class="hero-chip">🏠 방문과외</span>
      <span class="hero-chip">💻 화상과외</span>
    </div>
    <div class="home-stats">
      <div class="home-stat"><span class="home-stat-num">30<span>년+</span></span><span class="home-stat-label">교육 노하우</span></div>
      <div class="home-stat"><span class="home-stat-num">2,000<span>명+</span></span><span class="home-stat-label">전문 선생님</span></div>
      <div class="home-stat"><span class="home-stat-num">100<span>만+</span></span><span class="home-stat-label">누적 회원</span></div>
      <div class="home-stat"><span class="home-stat-num">24<span>시간</span></span><span class="home-stat-label">빠른 매칭</span></div>
    </div>
  </div>
</section>

<!-- STRENGTH -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">OUR STRENGTH</span>
    <h2 class="sec-title">드림과외를 <em>선택하는 이유</em></h2>
    <p class="sec-desc">좋은 과외는 '누가 가르치느냐'에서 시작합니다. 드림과외 선생님은 우리 아이 학교 기출을 꿰뚫고 있고, 약점부터 정확히 짚어드립니다.</p>
    <div class="str-grid">
      <div class="str-card"><span class="str-icon">📚</span><div class="str-num">30<span>년+</span></div><h3>교육 현장 경험</h3><p>수십 년간 내신·수능을 현장에서 지도해온 노하우. 유행하는 공부법이 아니라 검증된 방법으로 가르칩니다.</p></div>
      <div class="str-card"><span class="str-icon">👩‍🏫</span><div class="str-num">2,000<span>명+</span></div><h3>전문 선생님</h3><p>학력·경력·수업 능력을 직접 확인한 선생님만 연결합니다. 마음에 안 들면 언제든 교체해드립니다.</p></div>
      <div class="str-card"><span class="str-icon">👨‍👩‍👧</span><div class="str-num">100<span>만+</span></div><h3>누적 회원</h3><p>전국 학부모·학생이 선택한 과외 매칭 서비스. 성적이 오른 아이들의 이야기가 쌓여 있습니다.</p></div>
      <div class="str-card"><span class="str-icon">⚡</span><div class="str-num">24<span>시간</span></div><h3>빠른 매칭</h3><p>신청 다음날이면 수업이 시작됩니다. 시험이 가까울수록 하루가 아깝습니다. 지금 바로 연락주세요.</p></div>
    </div>
  </div>
</section>

<!-- PROMO IMAGE SECTION -->
<section class="sec sec-bg" id="promo">
  <div class="wrap">
    <div class="promo-banner">
      <div class="promo-text">
        <span class="sec-label">DREAMTUTOR STORY</span>
        <h2 class="sec-title" style="margin-bottom:14px">선생님 한 명이<br><em>인생을 바꿉니다</em></h2>
        <p style="color:var(--muted);font-size:14px;line-height:1.9;word-break:keep-all;max-width:420px">
          드림과외는 과외 중개 플랫폼이 아닙니다.<br>
          아이에게 맞는 선생님을 찾지 못해 헤매는 학부모님을 위해,
          30년간 직접 발로 뛰며 검증한 선생님을 연결해드리는 서비스입니다.<br><br>
          "성적이 오르지 않으면 방법을 바꿔야 합니다."<br>
          드림과외가 그 첫 번째 선택이 되겠습니다.
        </p>
        <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
          <button class="btn-hero-main" onclick="openModal()" style="font-size:14px;padding:12px 24px">✍️ 무료 상담 신청</button>
          <a href="tel:${PHONE_LINK}" class="btn-hero-sub" style="font-size:14px;padding:12px 20px;background:rgba(90,143,123,.06);color:var(--ink);border-color:var(--border)">📞 전화 상담</a>
        </div>
      </div>
      <div class="promo-visual">
        <img src="/images/tutoring1.jpg" alt="드림과외 선생님과 학생이 함께하는 1:1 방문 과외 수업 장면" width="420" height="560" loading="lazy">
      </div>
    </div>
  </div>
</section>

<!-- SUBJECTS -->
<section class="sec sec-bg" id="subjects">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">전 과목 <em>1:1 맞춤</em> 과외</h2>
    <p class="sec-desc">수학·영어부터 검정고시·코딩까지, 필요한 모든 과목을 커버합니다.</p>
    <div class="subj-grid">
      <a href="/수학과외" class="subj-card"><span class="subj-icon">🔢</span><div class="subj-name">수학</div><div class="subj-desc">중·고등 전 과정</div></a>
      <a href="/영어과외" class="subj-card"><span class="subj-icon">🔤</span><div class="subj-name">영어</div><div class="subj-desc">내신·수능·회화</div></a>
      <a href="/국어과외" class="subj-card"><span class="subj-icon">📖</span><div class="subj-name">국어</div><div class="subj-desc">독서·문학·문법</div></a>
      <a href="/과학과외" class="subj-card"><span class="subj-icon">🔬</span><div class="subj-name">과학</div><div class="subj-desc">물·화·생·지</div></a>
      <a href="/사회과외" class="subj-card"><span class="subj-icon">🌏</span><div class="subj-name">사회/역사</div><div class="subj-desc">내신 집중</div></a>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🎓</span><div class="subj-name">수능</div><div class="subj-desc">N수·재수 대비</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">📜</span><div class="subj-name">검정고시</div><div class="subj-desc">초·중·고 전문</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🗣️</span><div class="subj-name">영어 회화</div><div class="subj-desc">원어민·화상</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">💻</span><div class="subj-name">코딩</div><div class="subj-desc">파이썬·앱·웹</div></button>
    </div>
  </div>
</section>

<!-- REGIONS -->
<section class="sec sec-wh" id="regions">
  <div class="wrap">
    <span class="sec-label">REGIONS</span>
    <h2 class="sec-title">지역별 <em>전문 과외</em></h2>
    <p class="sec-desc">원하시는 지역을 선택하시면 해당 지역 전문 선생님을 안내해드립니다.<br>방문과외·화상과외 모두 가능하며 지역에 따라 서비스가 다를 수 있습니다.</p>
    <div class="rgn-grid">
      <a href="/서울과외" class="rgn-card"><span class="rgn-icon">🏙️</span><div class="rgn-name">서울</div><div class="rgn-sub">강동·송파·노원 등</div></a>
      <a href="/경기과외" class="rgn-card"><span class="rgn-icon">🏘️</span><div class="rgn-name">경기</div><div class="rgn-sub">광명·수원·남양주 등</div></a>
      <a href="/인천과외" class="rgn-card"><span class="rgn-icon">🌊</span><div class="rgn-name">인천</div><div class="rgn-sub">남동·연수 등</div></a>
      <a href="/부산과외" class="rgn-card"><span class="rgn-icon">🌆</span><div class="rgn-name">부산</div><div class="rgn-sub">해운대·수영 등</div></a>
      <a href="/대구과외" class="rgn-card"><span class="rgn-icon">🏛️</span><div class="rgn-name">대구</div><div class="rgn-sub">달서·수성 등</div></a>
      <a href="/대전과외" class="rgn-card"><span class="rgn-icon">⚗️</span><div class="rgn-name">대전</div><div class="rgn-sub">서구 둔산동 등</div></a>
      <a href="/광주과외" class="rgn-card"><span class="rgn-icon">🌿</span><div class="rgn-name">광주</div><div class="rgn-sub">광산구 수완동 등</div></a>
      <a href="/울산과외" class="rgn-card"><span class="rgn-icon">⚓</span><div class="rgn-name">울산</div><div class="rgn-sub">중구 태화동 등</div></a>
      <a href="/충북과외" class="rgn-card"><span class="rgn-icon">🌾</span><div class="rgn-name">충북</div><div class="rgn-sub">청주 가경·복대 등</div></a>
      <a href="/충남과외" class="rgn-card"><span class="rgn-icon">🌻</span><div class="rgn-name">충남</div><div class="rgn-sub">천안·아산 등</div></a>
      <a href="/전북과외" class="rgn-card"><span class="rgn-icon">🍀</span><div class="rgn-name">전북</div><div class="rgn-sub">전주 완산 등</div></a>
      <a href="/전남과외" class="rgn-card"><span class="rgn-icon">🌸</span><div class="rgn-name">전남</div><div class="rgn-sub">목포·여수 등</div></a>
      <a href="/경남과외" class="rgn-card"><span class="rgn-icon">🏞️</span><div class="rgn-name">경남</div><div class="rgn-sub">창원·진주 등</div></a>
      <a href="/경북과외" class="rgn-card"><span class="rgn-icon">🏯</span><div class="rgn-name">경북</div><div class="rgn-sub">포항·구미 등</div></a>
      <a href="/강원과외" class="rgn-card"><span class="rgn-icon">🏔️</span><div class="rgn-name">강원</div><div class="rgn-sub">춘천·원주 등</div></a>
      <a href="/세종과외" class="rgn-card"><span class="rgn-icon">🏛️</span><div class="rgn-name">세종</div><div class="rgn-sub">행정중심복합도시</div></a>
      <a href="/제주과외" class="rgn-card"><span class="rgn-icon">🌺</span><div class="rgn-name">제주</div><div class="rgn-sub">제주시·서귀포</div></a>
    </div>
    <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--muted)">※ 방문과외는 지역별로 가능 여부가 다르며, 전국 화상과외는 어디서나 가능합니다.</p>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="sec sec-bg" id="how">
  <div class="wrap">
    <span class="sec-label">HOW IT WORKS</span>
    <h2 class="sec-title">딱 <em>4단계</em>로 시작하세요</h2>
    <p class="sec-desc">전화 한 통이면 충분합니다. 학교·과목·학년을 말씀해주시면 나머지는 저희가 다 합니다.</p>
    <div class="step-grid">
      <div class="step-item">
        <div class="step-circle">1</div>
        <h3>상담 신청</h3>
        <p>전화 또는 폼으로 학년·과목·지역을 알려주세요. 1분이면 됩니다.</p>
      </div>
      <div class="step-item">
        <div class="step-circle">2</div>
        <h3>선생님 매칭</h3>
        <p>담당자가 직접 검토해 아이에게 딱 맞는 선생님을 고릅니다. 24시간 안에.</p>
      </div>
      <div class="step-item">
        <div class="step-circle">3</div>
        <h3>30분 무료 체험</h3>
        <p>첫 30분은 무료입니다. 마음에 들면 계속, 아니면 선생님을 바꿔드립니다.</p>
      </div>
      <div class="step-item">
        <div class="step-circle">4</div>
        <h3>성적이 달라집니다</h3>
        <p>다음 시험에서 달라집니다. 먼저 경험한 학부모님들이 증명합니다.</p>
      </div>
    </div>
  </div>
</section>

<!-- GRADES -->
<section class="sec sec-bg" id="grades">
  <div class="wrap">
    <span class="sec-label">BY GRADE</span>
    <h2 class="sec-title">학년별 <em>맞춤 과외</em></h2>
    <p class="sec-desc">학년마다 다른 목표, 학년에 꼭 맞는 선생님을 연결해드립니다.</p>
    <div class="grade-tabs">
      <div class="grade-group">
        <h3>🎒 초등 과외</h3>
        <div class="grade-links">
          <a href="/서울초등과외" class="grade-link">서울</a>
          <a href="/경기초등과외" class="grade-link">경기</a>
          <a href="/인천초등과외" class="grade-link">인천</a>
          <a href="/부산초등과외" class="grade-link">부산</a>
          <a href="/대구초등과외" class="grade-link">대구</a>
          <a href="/대전초등과외" class="grade-link">대전</a>
          <a href="/광주초등과외" class="grade-link">광주</a>
          <a href="/울산초등과외" class="grade-link">울산</a>
          <a href="/충북초등과외" class="grade-link">충북</a>
          <a href="/충남초등과외" class="grade-link">충남</a>
        </div>
      </div>
      <div class="grade-group">
        <h3>📚 중등 과외</h3>
        <div class="grade-links">
          <a href="/서울중등과외" class="grade-link">서울</a>
          <a href="/경기중등과외" class="grade-link">경기</a>
          <a href="/인천중등과외" class="grade-link">인천</a>
          <a href="/부산중등과외" class="grade-link">부산</a>
          <a href="/대구중등과외" class="grade-link">대구</a>
          <a href="/대전중등과외" class="grade-link">대전</a>
          <a href="/광주중등과외" class="grade-link">광주</a>
          <a href="/울산중등과외" class="grade-link">울산</a>
          <a href="/충북중등과외" class="grade-link">충북</a>
          <a href="/충남중등과외" class="grade-link">충남</a>
        </div>
      </div>
      <div class="grade-group">
        <h3>🎓 고등 과외</h3>
        <div class="grade-links">
          <a href="/서울고등과외" class="grade-link">서울</a>
          <a href="/경기고등과외" class="grade-link">경기</a>
          <a href="/인천고등과외" class="grade-link">인천</a>
          <a href="/부산고등과외" class="grade-link">부산</a>
          <a href="/대구고등과외" class="grade-link">대구</a>
          <a href="/대전고등과외" class="grade-link">대전</a>
          <a href="/광주고등과외" class="grade-link">광주</a>
          <a href="/울산고등과외" class="grade-link">울산</a>
          <a href="/충북고등과외" class="grade-link">충북</a>
          <a href="/충남고등과외" class="grade-link">충남</a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- HOT AREAS -->
<section class="sec sec-wh" id="hot-areas">
  <div class="wrap">
    <span class="sec-label">HOT AREAS</span>
    <h2 class="sec-title">인기 <em>과외 지역</em></h2>
    <p class="sec-desc">수요가 많은 지역일수록 더 많은 전문 선생님이 대기 중입니다.</p>
    <div class="hot-grid">
      <a href="/대치동과외" class="hot-card">📍 대치동</a>
      <a href="/잠실동과외" class="hot-card">📍 잠실동</a>
      <a href="/목동과외" class="hot-card">📍 목동</a>
      <a href="/상계동과외" class="hot-card">📍 상계동</a>
      <a href="/신림동과외" class="hot-card">📍 신림동</a>
      <a href="/반포동과외" class="hot-card">📍 반포동</a>
      <a href="/고덕동과외" class="hot-card">📍 고덕동</a>
      <a href="/철산동과외" class="hot-card">📍 철산동</a>
      <a href="/하안동과외" class="hot-card">📍 하안동</a>
      <a href="/분당과외" class="hot-card">📍 분당</a>
      <a href="/일산과외" class="hot-card">📍 일산</a>
      <a href="/안양시동안평촌동과외" class="hot-card">📍 평촌(안양)</a>
      <a href="/해운대과외" class="hot-card">📍 해운대</a>
      <a href="/수성구과외" class="hot-card">📍 수성구</a>
      <a href="/둔산동과외" class="hot-card">📍 둔산동</a>
    </div>
  </div>
</section>

<!-- REVIEWS -->
<section class="sec sec-bg" id="reviews">
  <div class="wrap">
    <span class="sec-label">REVIEWS</span>
    <h2 class="sec-title">수강생 <em>생생 후기</em></h2>
    <p class="sec-desc">성적이 오른 학생들의 솔직한 이야기입니다. 드림과외가 아니었으면 못 찾았을 선생님들을 만났습니다.</p>
    <div class="rev-grid">
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p class="rev-text">"3개월 만에 수학 점수가 62점에서 89점으로 올랐어요! 선생님이 학교 시험 경향을 정확히 파악하고 있어서 내신 대비에 특히 효과적이었습니다."</p>
        <div class="rev-author">
          <div class="rev-avatar" style="background:#5A8F7B">김</div>
          <div><div class="rev-name">김○○ 학생 어머니</div><div class="rev-info">강남구 · 중3 · 수학</div></div>
        </div>
      </div>
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p class="rev-text">"영어 내신 성적이 확 올랐어요! 우리 학교 기출 문제를 꿰뚫고 계신 선생님 덕분에 시험 준비가 훨씬 수월해졌습니다. 매칭도 하루 만에 돼서 너무 좋았어요."</p>
        <div class="rev-author">
          <div class="rev-avatar" style="background:#C4956A">박</div>
          <div><div class="rev-name">박○○ 학생</div><div class="rev-info">서초구 · 고2 · 영어</div></div>
        </div>
      </div>
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p class="rev-text">"수능 준비를 늦게 시작해서 걱정이 많았는데, 드림과외에서 연결해준 선생님 덕분에 6개월 만에 수학 4등급에서 2등급으로 올랐어요!"</p>
        <div class="rev-author">
          <div class="rev-avatar" style="background:linear-gradient(135deg,#10B981,#059669)">이</div>
          <div><div class="rev-name">이○○ 학생</div><div class="rev-info">노원구 · 고3 · 수학</div></div>
        </div>
      </div>
    </div>
  </div>
</section>

${consultForm({
  leftTitle: '지금 바로 <em>무료 상담</em> 신청하세요',
  leftDesc: '전화 한 통, 폼 작성 한 번으로 내 아이에게 딱 맞는 선생님을 찾아드립니다.',
  leftPts: ['신청 후 24시간 내 선생님 매칭', '첫 수업 30분 무료 체험', '학교·과목별 전문 선생님 연결', '부담 없이 선생님 교체 가능'],
})}`;

  return layout({ head, body, keyword: '전국과외', region: '' });
}

// ─── 과목 전용 페이지 (/수학과외, /영어과외 등) ───────────────────────────
export function renderSubjectPage({ subject }) {
  const info = SUBJECTS[subject] || { emoji: '📚', desc: '전 과정 맞춤 과외' };
  const title = `${subject}과외 | 전국 지역별 1:1 ${subject} 전문 과외 매칭`;
  const description = `전국 어디서나 1:1 ${subject} 전문 과외. 방문·화상 모두 가능. 검증된 선생님 24시간 내 매칭. 첫 30분 무료 체험.`;
  const url = `/${subject}과외`;
  const head = buildHead({ title, description, url, type: 'local' });

  // 방문 가능 시도 (VISIT_REGIONS)
  const visitSidos = Object.keys(VISIT_REGIONS);

  // 전체 시도 그리드
  const sidoGrid = Object.entries(SIDO_DESC).map(([sido, desc]) => {
    const isVisit = visitSidos.includes(sido);
    const badge = isVisit ? '<span class="sido-badge">방문</span>' : '<span class="sido-badge sido-badge-online">화상</span>';
    return `<a href="/${encodeURIComponent(sido + subject + '과외')}" class="sido-subj-card">
      <div class="sido-subj-top"><span class="sido-subj-name">${sido}</span>${badge}</div>
      <div class="sido-subj-desc">${desc.split('.')[0]}</div>
    </a>`;
  }).join('');

  // 인기 시군구 (방문 가능 지역 위주)
  const popularGus = [
    { gu: '강남구', sido: '서울' }, { gu: '서초구', sido: '서울' }, { gu: '노원구', sido: '서울' },
    { gu: '분당구', sido: '경기' }, { gu: '수원시영통구', sido: '경기' }, { gu: '일산동구', sido: '경기' },
    { gu: '부평구', sido: '인천' }, { gu: '해운대구', sido: '부산' }, { gu: '수성구', sido: '대구' },
    { gu: '유성구', sido: '대전' },
  ];
  const popularLinks = popularGus.map(({ gu, sido: _ }) => {
    const display = gu.replace(/(시|구|군)$/, '');
    return `<a href="/${encodeURIComponent(gu + subject + '과외')}" class="popular-gu-link">${display} ${subject}과외</a>`;
  }).join('');

  const body = `
<style>
.subj-hero{background:linear-gradient(135deg,#2F3E2E 0%,#4A6741 60%,#5A8F7B 100%);color:#fff;padding:64px 20px 56px;text-align:center}
.subj-hero-emoji{font-size:56px;margin-bottom:16px}
.subj-hero h1{font-size:clamp(28px,5vw,44px);font-weight:800;margin:0 0 12px}
.subj-hero h1 em{color:#E8D5B5;font-style:normal}
.subj-hero p{font-size:17px;opacity:.85;max-width:560px;margin:0 auto}
/* 시도 그리드 */
.sido-subj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-top:36px}
.sido-subj-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:18px 16px;text-decoration:none;transition:.2s;display:block}
.sido-subj-card:hover{border-color:var(--acc);transform:translateY(-3px);box-shadow:var(--shadow-h)}
.sido-subj-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.sido-subj-name{font-size:17px;font-weight:700;color:var(--ink)}
.sido-badge{font-size:11px;padding:2px 7px;border-radius:10px;font-weight:600;background:rgba(90,143,123,.1);color:#4A6741}
.sido-badge-online{background:rgba(196,149,106,.12);color:#9A7B55}
.sido-subj-desc{font-size:12px;color:var(--muted);line-height:1.4}
/* 인기 시군구 */
.popular-gu-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
.popular-gu-link{font-size:14px;font-weight:500;color:var(--ink);text-decoration:none;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:8px 16px;transition:.2s}
.popular-gu-link:hover{border-color:var(--acc);color:var(--acc)}
@media(max-width:768px){
  .sido-subj-grid{grid-template-columns:repeat(2,1fr)}
}
</style>

<!-- HERO -->
<div class="subj-hero">
  <div class="subj-hero-emoji">${info.emoji}</div>
  <h1>전국 <em>${subject}</em> 과외</h1>
  <p>${info.desc} · 방문·화상 모두 가능 · 24시간 내 선생님 매칭</p>
</div>

<!-- 시도별 지역 선택 -->
<section class="sec sec-wh" id="regions">
  <div class="wrap">
    <span class="sec-label">지역 선택</span>
    <h2 class="sec-title">지역별 <em>${subject} 과외</em></h2>
    <p class="sec-desc">원하는 지역을 선택하면 해당 지역 ${subject} 전문 선생님 정보를 확인할 수 있습니다.</p>
    <div class="sido-subj-grid">${sidoGrid}</div>
  </div>
</section>

<!-- 인기 시군구 -->
<section class="sec sec-bg" id="popular-gu">
  <div class="wrap">
    <span class="sec-label">인기 지역</span>
    <h2 class="sec-title">인기 <em>${subject} 과외</em> 지역</h2>
    <p class="sec-desc">수요가 많은 지역일수록 더 많은 전문 선생님이 대기 중입니다.</p>
    <div class="popular-gu-grid">${popularLinks}</div>
  </div>
</section>

<!-- 교육정보 -->
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">STUDY GUIDE</span>
    <h2 class="sec-title">${subject} <em>교육정보</em></h2>
    <p class="sec-desc">${subject} 공부법, 내신 전략, 수능 대비 가이드를 확인하세요.</p>
    <div class="link-list">
      ${(EDU_ARTICLES[subject] || []).map(a => `<a href="/${a.slug}">${a.title}</a>`).join('')}
    </div>
  </div>
</section>

${consultForm({
  leftTitle: `<em>${subject} 과외</em> 무료 상담 신청`,
  leftDesc: `지역과 학년을 알려주시면 24시간 내 ${subject} 전문 선생님을 연결해드립니다.`,
  leftPts: [`신청 후 24시간 내 ${subject} 선생님 매칭`, '첫 수업 30분 무료 체험', '내신·수능·학교별 맞춤 커리큘럼', '부담 없이 선생님 교체 가능'],
})}`;

  return layout({ head, body, keyword: `${subject}과외`, region: '' });
}

// ── 교육정보 페이지 렌더러 ────────────────────────────────
const EDU_CONTENT = {
  수학공부법: {
    sections: [
      { h: '개념 이해가 먼저입니다', p: '수학은 공식을 외우는 과목이 아닙니다. 왜 그 공식이 나오는지, 어떤 상황에서 쓰이는지를 이해해야 합니다. 교과서 정의를 읽고 "왜?"라는 질문을 던져보세요. 개념을 설명할 수 있을 때 비로소 이해한 것입니다.' },
      { h: '유형별 반복 훈련', p: '개념을 이해했다면 유형별 문제를 반복해서 풀어야 합니다. 같은 유형을 최소 5문제 이상 연속으로 풀면 풀이 패턴이 몸에 익습니다. 처음엔 기본 유형부터, 익숙해지면 심화 유형으로 넘어가세요.' },
      { h: '오답 노트는 성적을 올리는 열쇠', p: '틀린 문제를 그냥 넘기면 같은 실수를 반복합니다. 오답 노트에 (1)문제 (2)내가 틀린 풀이 (3)올바른 풀이 (4)틀린 이유를 정리하세요. 시험 전에 오답 노트만 복습해도 점수가 크게 오릅니다.' },
      { h: '시간 관리 연습', p: '실전에서는 시간이 부족해서 못 푸는 경우가 많습니다. 평소에 타이머를 켜고 문제를 풀어보세요. 한 문제에 3분 이상 걸리면 표시해두고 넘어가는 연습을 하면, 실전에서 시간 배분이 자연스러워집니다.' },
      { h: '1:1 과외가 효과적인 이유', p: '수학은 학생마다 막히는 포인트가 다릅니다. 학원 수업은 모두에게 같은 진도를 나가지만, 1:1 과외는 학생이 약한 부분만 집중적으로 잡아줍니다. 드림과외 선생님은 학생 수준에 맞춰 개념 설명 → 유형 연습 → 오답 정리까지 체계적으로 관리합니다.' },
    ],
  },
  수학내신전략: {
    sections: [
      { h: '교과서가 출제의 80%입니다', p: '내신 시험은 교과서에서 나옵니다. 교과서 예제·유제·연습문제를 완벽히 풀 수 있어야 합니다. 특히 "예제"의 풀이 과정을 그대로 재현할 수 있는지 확인하세요. 교과서를 3번 반복하면 기본 점수는 확보됩니다.' },
      { h: '학교별 기출 분석이 핵심', p: '같은 교육과정이라도 선생님마다 출제 스타일이 다릅니다. 이전 시험지를 구해서 어떤 유형을 자주 출제하는지, 서술형 비중은 어떤지 분석하세요. 드림과외 선생님은 학교별 기출 경향을 파악하고 있어 효율적인 대비가 가능합니다.' },
      { h: '서술형 답안 작성법', p: '서술형은 과정을 얼마나 논리적으로 적느냐가 관건입니다. 풀이 과정에서 "∵(이유)"와 "∴(결론)"을 명확히 표시하고, 조건→풀이→답 순서로 정리하세요. 단위와 조건 확인도 감점 포인트이니 꼭 챙기세요.' },
      { h: '시험 2주 전 학습 타임라인', p: '2주 전: 범위 전체 개념 복습 / 10일 전: 유형별 문제 풀기 / 1주일 전: 오답 정리 + 기출 풀기 / 3일 전: 틀린 문제만 재풀이 / 전날: 공식·핵심 개념만 훑기. 이 타임라인을 지키면 벼락치기 없이 안정적으로 준비할 수 있습니다.' },
      { h: '과외로 내신 관리하는 법', p: '매주 정해진 시간에 과외를 받으면 학습 루틴이 잡힙니다. 선생님이 매 수업 끝에 다음 주 과제를 내고, 시험 전에는 모의 시험을 실시합니다. 혼자 하면 놓치기 쉬운 개념 빈틈을 1:1로 채워주는 것이 과외의 핵심입니다.' },
    ],
  },
  수학오답관리: {
    sections: [
      { h: '오답 노트, 왜 만들어야 하나요?', p: '같은 유형을 계속 틀리는 건 개념이 흔들리거나 풀이 습관에 문제가 있기 때문입니다. 오답 노트는 자신의 약점 지도를 만드는 과정입니다. 시험 전 오답 노트만 보면 가장 효율적인 복습이 됩니다.' },
      { h: '효과적인 오답 노트 작성법', p: '(1)문제를 적거나 붙인다 (2)내 풀이를 적는다(틀렸더라도) (3)올바른 풀이를 적는다 (4)"왜 틀렸는지" 이유를 한 줄로 적는다. 이유를 적는 과정이 가장 중요합니다. 계산 실수인지, 개념 착오인지, 문제를 잘못 읽었는지 구분하세요.' },
      { h: '오답 유형별 대처법', p: '계산 실수: 풀이를 천천히 다시 쓰는 연습 / 개념 착오: 교과서 해당 단원 복습 / 시간 부족: 타이머 훈련 / 문제 이해 부족: 문제 조건에 밑줄 긋기 연습. 유형별로 다른 대처법이 필요합니다.' },
      { h: '주간 오답 복습 루틴', p: '매주 일요일, 그 주에 틀린 문제를 다시 풀어보세요. 다시 틀리는 문제가 진짜 약점입니다. 이 문제들만 별도로 표시해 시험 전 집중 공략하세요. 3주 연속 맞추면 그 유형은 졸업입니다.' },
      { h: '과외 선생님과 함께하는 오답 관리', p: '혼자 오답 노트를 만들면 "왜 틀렸는지" 정확히 파악하기 어렵습니다. 과외 선생님이 오답 원인을 분석하고, 약한 개념을 보충 설명하면 같은 실수를 반복하지 않게 됩니다. 드림과외에서는 매 수업 오답 분석을 기본으로 진행합니다.' },
    ],
  },
  수학개념정리: {
    sections: [
      { h: '개념 정리의 올바른 순서', p: '(1)교과서 정의 읽기 (2)정의를 내 말로 바꿔 쓰기 (3)예제 직접 풀기 (4)비슷한 유형 3문제 풀기. 이 4단계를 거치면 암기가 아니라 이해 기반의 개념 정리가 됩니다.' },
      { h: '단원 간 연결 고리 찾기', p: '수학은 단원끼리 이어져 있습니다. 일차함수 → 이차함수 → 미분. 새 단원을 배울 때 이전 단원과 어떻게 연결되는지 파악하면 전체 그림이 보입니다. 마인드맵으로 단원 관계도를 그려보는 것도 좋은 방법입니다.' },
      { h: '공식을 외우지 말고 유도하세요', p: '공식을 암기만 하면 살짝 변형된 문제에서 무너집니다. 공식이 어디서 나왔는지 유도 과정을 이해하면, 시험장에서 공식이 생각 안 나도 직접 만들어 쓸 수 있습니다. 핵심 공식 10개의 유도 과정을 직접 써보세요.' },
      { h: '개념 확인 자가 테스트', p: '친구에게 설명하듯 개념을 소리 내어 설명해보세요. 막히는 부분이 바로 약점입니다. 또는 교과서를 덮고 단원 핵심 내용을 백지에 써보는 "백지 복습법"도 효과적입니다.' },
      { h: '1:1 과외에서의 개념 학습', p: '과외 선생님은 학생이 개념을 정확히 이해했는지 질문으로 확인합니다. "이 공식이 왜 성립해?", "이 조건이 없으면 어떻게 돼?"와 같은 질문으로 깊은 이해를 이끌어냅니다. 학원에서는 불가능한 양방향 소통이 과외의 장점입니다.' },
    ],
  },
  수능수학대비: {
    sections: [
      { h: '수능 수학, 출제 원리를 파악하세요', p: '수능 수학은 교과서 개념의 심화·융합입니다. EBS 연계 교재를 풀되, 단순히 많이 푸는 것보다 한 문제를 깊이 분석하는 것이 중요합니다. 킬러 문항은 여러 개념이 결합된 구조이므로, 어떤 개념들이 섞였는지 파악하는 연습을 하세요.' },
      { h: '등급별 맞춤 전략', p: '1~2등급 목표: 킬러 문항 대비에 집중, 4점 문항 시간 단축 / 3~4등급 목표: 3점 문항 정확도 높이기, 쉬운 4점 문항 공략 / 5등급 이하: 기본 개념 완성부터, 2점·쉬운 3점 확실히 맞추기. 현재 위치에 맞는 전략이 필요합니다.' },
      { h: '시간 배분 전략 (75분)', p: '1~15번(가형 기준): 25분 / 16~21번: 20분 / 22~28번: 20분 / 29~30번: 10분. 어려운 문제에 매달리지 말고 과감히 넘기세요. 쉬운 문제를 확실히 맞추는 것이 등급을 올리는 가장 빠른 길입니다.' },
      { h: '기출 활용법', p: '최근 5개년 수능·모의고사 기출을 유형별로 분류해서 풀어보세요. 각 유형의 접근법을 정리하고, 틀린 문제는 어떤 개념이 부족했는지 분석합니다. 기출 3회독이면 출제 패턴이 보이기 시작합니다.' },
      { h: '수능 대비 과외의 효과', p: '수능은 혼자 준비하면 방향을 잃기 쉽습니다. 과외 선생님이 학생 수준에 맞는 로드맵을 짜고, 매주 약점을 체크하며 방향을 잡아줍니다. 특히 킬러 문항 풀이 전략과 시간 관리는 경험 있는 선생님의 코칭이 큰 차이를 만듭니다.' },
    ],
  },
  영어공부법: {
    sections: [
      { h: '어휘가 영어의 기초입니다', p: '영어 성적의 70%는 어휘력에서 결정됩니다. 하루 30개씩 꾸준히 외우되, 문장 속에서 외우세요. 단어장만 달달 외우면 실전에서 못 떠올립니다. 예문과 함께 외우면 독해 속도도 함께 올라갑니다.' },
      { h: '문법은 패턴으로 익히세요', p: '문법책을 처음부터 끝까지 읽는 것보다, 자주 출제되는 패턴 30개를 완벽히 익히는 것이 낫습니다. 관계대명사, 분사구문, 가정법, 비교급 등 핵심 문법을 예문 중심으로 반복하세요.' },
      { h: '독해는 구조 파악이 핵심', p: '영어 지문은 일정한 구조를 가집니다. 주제문(보통 첫 문장) → 근거 → 예시 → 결론. 이 구조를 파악하며 읽으면 지문 전체를 다 해석하지 않아도 답을 찾을 수 있습니다. 매일 1지문씩 구조 분석 연습을 하세요.' },
      { h: '듣기와 말하기도 함께', p: '내신에서 듣기 비중이 점점 커지고 있습니다. 매일 15분 영어 듣기 연습을 하세요. EBS 교재 음원이 가장 시험에 가깝습니다. 들으면서 따라 말하는 섀도잉을 하면 듣기와 말하기가 동시에 향상됩니다.' },
      { h: '영어 과외의 차별점', p: '영어는 학생마다 약한 영역이 다릅니다. 어휘가 부족한 학생, 문법이 약한 학생, 독해 속도가 느린 학생. 1:1 과외는 학생의 약점을 정확히 진단하고 맞춤 처방을 내립니다. 드림과외 영어 선생님은 학교 교과서 본문 분석까지 함께합니다.' },
    ],
  },
  영어내신전략: {
    sections: [
      { h: '교과서 본문 완벽 암기', p: '영어 내신의 핵심은 교과서 본문입니다. 본문을 3단계로 공략하세요. 1단계: 해석 완벽히 하기 / 2단계: 주요 표현·문법 포인트 정리 / 3단계: 빈칸·순서·요약 유형으로 변형 연습. 본문을 통째로 외울 필요는 없지만, 핵심 문장은 영작할 수 있어야 합니다.' },
      { h: '변형 문제 대비가 당락을 결정', p: '내신 영어는 교과서 지문을 변형한 문제가 출제됩니다. 동의어 치환, 문장 순서 바꾸기, 빈칸 넣기 등. 교과서 문장을 다양하게 바꿔보는 연습이 필요합니다. 핵심 문장의 동의어 표현을 3개씩 정리해두세요.' },
      { h: '서술형·영작 대비', p: '서술형 비중이 40%까지 높아진 학교도 있습니다. 교과서 주요 문장을 영작할 수 있도록 연습하세요. 특히 조건 영작(주어진 단어를 사용해서 쓰기)은 문법 정확성이 중요하므로, 시제·수일치·관사를 꼼꼼히 체크하는 습관이 필요합니다.' },
      { h: '듣기 평가 만점 전략', p: '듣기는 연습량이 실력입니다. 시험 2주 전부터 매일 20분씩 듣기 연습을 하세요. 한 번 듣고 답을 적은 후, 스크립트를 보며 못 들은 부분을 확인합니다. 같은 음원을 3번 반복하면 귀가 트입니다.' },
      { h: '과외로 영어 내신 올리기', p: '영어 내신은 학교 선생님의 출제 스타일을 아는 것이 중요합니다. 드림과외 선생님은 학교별 시험 유형을 분석하고, 교과서 본문 기반의 변형 문제를 직접 만들어 연습시킵니다. 서술형 첨삭도 매 수업 진행합니다.' },
    ],
  },
  영어독해전략: {
    sections: [
      { h: '지문 구조를 먼저 파악하세요', p: '영어 지문은 주제문 → 뒷받침 문장 → 예시 → 결론 구조입니다. 첫 문장과 마지막 문장을 먼저 읽으면 전체 내용의 70%를 파악할 수 있습니다. 역접(However, But)과 인과(Therefore, Thus) 연결어를 눈여겨보세요.' },
      { h: '유형별 접근법', p: '주제 찾기: 반복되는 핵심어 추적 / 빈칸 추론: 앞뒤 문맥 단서 활용 / 순서 배열: 지시어·접속사 흐름 파악 / 문장 삽입: 대명사·지시어가 가리키는 대상 확인. 각 유형마다 정해진 풀이 전략이 있습니다.' },
      { h: '모르는 단어 대처법', p: '독해 중 모르는 단어가 나오면 당황하지 마세요. 문맥에서 의미를 추론하는 연습이 중요합니다. 긍정/부정, 원인/결과 관계에서 단어의 느낌을 파악하면 정확한 뜻을 몰라도 문제를 풀 수 있습니다.' },
      { h: '속독 훈련법', p: '처음에는 정확하게, 점차 빠르게. 매일 1지문을 시간 재며 읽고, 이해도를 체크하세요. 해석할 때 한국어로 번역하지 말고, 영어 어순 그대로 의미를 파악하는 직독직해 연습이 속도를 높이는 핵심입니다.' },
      { h: '과외에서의 독해 훈련', p: '과외 선생님과 함께 지문을 분석하면, 혼자 읽을 때 놓치는 구조와 단서를 발견할 수 있습니다. 선생님이 "이 문장에서 답의 근거를 찾아봐"라고 물으면, 스스로 근거를 찾는 능력이 길러집니다.' },
    ],
  },
  영어어휘암기: {
    sections: [
      { h: '하루 30개, 문장과 함께', p: '단어만 달달 외우면 3일이면 절반을 잊습니다. 단어를 문장 속에서 외우세요. "abandon = 포기하다" 대신 "He abandoned his plan. (그는 계획을 포기했다.)" 이렇게 외우면 오래 기억됩니다.' },
      { h: '어근·접두사·접미사 활용', p: 'un-(부정), re-(다시), -tion(명사), -able(가능) 같은 조각을 알면 처음 보는 단어도 의미를 추론할 수 있습니다. 핵심 어근 50개만 외우면 수천 개 단어의 의미를 유추할 수 있습니다.' },
      { h: '반복 주기가 핵심입니다', p: '에빙하우스 망각 곡선에 따르면, 외운 후 1일·3일·7일·30일에 복습하면 장기 기억에 정착됩니다. 매일 새 단어 30개 + 이전 복습 30개, 총 60개를 투자 시간 20분으로 관리하세요.' },
      { h: '시험 빈출 어휘 정리', p: '모든 단어를 똑같이 외울 필요는 없습니다. 교과서·모의고사·수능에서 자주 나오는 핵심 어휘 1,000개를 우선 정복하세요. 빈도순 단어장을 활용하면 효율적입니다.' },
      { h: '과외로 어휘력 키우기', p: '과외 선생님이 매 수업 단어 테스트를 진행하면 강제적인 복습 효과가 있습니다. 또한 독해 수업 중 만나는 모르는 단어를 바로 정리해주므로, 자연스럽게 어휘력이 늘어납니다.' },
    ],
  },
  수능영어대비: {
    sections: [
      { h: '수능 영어, 절대평가를 활용하세요', p: '수능 영어는 절대평가입니다. 90점 이상이면 1등급. 매 문항을 완벽히 맞추려 하기보다, 자신 있는 유형에서 확실히 득점하는 전략이 중요합니다. 듣기 17문항을 먼저 확보하고, 독해에서 실수를 줄이세요.' },
      { h: 'EBS 연계 활용법', p: 'EBS 수능특강·수능완성은 간접 연계됩니다. 지문의 소재나 주제가 비슷하게 출제되므로, EBS 교재를 풀 때 지문의 핵심 주제와 논리 구조를 파악하는 연습이 중요합니다. 단순히 답만 맞추지 말고, "왜 이 답인지" 근거를 정리하세요.' },
      { h: '고난도 유형 공략', p: '빈칸 추론, 순서 배열, 문장 삽입이 가장 어려운 유형입니다. 이 세 유형은 지문의 논리 흐름을 정확히 파악해야 풀 수 있습니다. 매일 3문제씩 이 유형만 집중 연습하면, 한 달 후 정답률이 크게 올라갑니다.' },
      { h: '시간 관리 (70분)', p: '듣기: 25분(자동 진행) / 독해 18~28번: 25분 / 고난도 29~45번: 20분. 어려운 문제는 2분 이상 고민하지 말고 넘기세요. 마지막에 다시 돌아오는 것이 시간 효율적입니다.' },
      { h: '수능 영어 과외의 가치', p: '수능 영어는 유형별 전략이 정해져 있습니다. 과외 선생님이 학생의 약한 유형을 진단하고, 그 유형에 맞는 풀이 전략을 집중 훈련시킵니다. 1등급을 향한 맞춤 로드맵, 드림과외에서 함께하세요.' },
    ],
  },
  국어공부법: {
    sections: [
      { h: '국어도 공부가 필요합니다', p: '국어는 "감"으로 푸는 과목이 아닙니다. 문학은 분석 틀이, 비문학은 독해 전략이 필요합니다. 체계적으로 접근하면 가장 빠르게 성적이 오르는 과목이 국어입니다.' },
      { h: '지문 읽기의 기술', p: '지문을 읽을 때 핵심 문장에 밑줄을 긋고, 각 문단의 핵심 내용을 한 줄로 요약하세요. 이 습관이 쌓이면 어떤 지문이든 빠르게 구조를 파악할 수 있습니다.' },
      { h: '문학 작품 접근법', p: '시: 화자의 정서와 태도 파악 / 소설: 인물의 심리 변화와 갈등 구조 / 고전: 현대어 해석 + 주제 의식. 작품을 읽을 때 "작가가 말하고 싶은 것이 무엇인가?"를 항상 생각하세요.' },
      { h: '문법, 어렵지 않습니다', p: '국어 문법은 범위가 정해져 있습니다. 음운 변동, 품사, 문장 구조, 국어의 역사. 이 네 가지를 정리하면 문법 문제의 90%를 커버할 수 있습니다. 개념을 정리한 후 기출 문제로 확인하세요.' },
      { h: '과외로 국어 성적 올리기', p: '국어는 혼자 공부하면 "왜 이 답이 맞는지" 납득이 안 되는 경우가 많습니다. 과외 선생님과 함께 문제를 풀면, 정답의 근거를 명확히 이해할 수 있습니다. 특히 서술형 답안 작성 능력은 피드백 없이는 향상되기 어렵습니다.' },
    ],
  },
  국어내신전략: {
    sections: [
      { h: '교과서 작품 분석이 전부입니다', p: '국어 내신은 교과서에 실린 작품에서 출제됩니다. 각 작품의 주제, 표현 기법, 인물 분석을 노트에 정리하세요. 선생님이 수업 시간에 강조한 부분은 시험에 나올 확률이 높습니다.' },
      { h: '수업 필기의 중요성', p: '국어 내신에서는 선생님의 해석이 정답입니다. 수업 시간에 선생님이 설명하는 작품 해석, 강조 포인트를 빠짐없이 필기하세요. 교과서에 없는 내용도 시험에 나올 수 있습니다.' },
      { h: '비문학 지문 공략', p: '교과서 비문학 지문은 반복 읽기가 핵심입니다. 1회차: 전체 흐름 파악 / 2회차: 핵심 개념 정리 / 3회차: 문단별 관계 파악. 비문학은 구조를 이해하면 어떤 변형 문제가 나와도 대응할 수 있습니다.' },
      { h: '서술형 답안 고득점 비법', p: '서술형은 "키워드"를 넣었느냐가 핵심입니다. 문제에서 묻는 것을 정확히 파악하고, 답안에 반드시 포함해야 할 핵심어를 포함하세요. 두괄식으로 결론부터 쓰고, 근거를 덧붙이는 구조가 가장 안전합니다.' },
      { h: '과외 선생님의 내신 관리', p: '과외 선생님은 학교별 출제 경향에 맞춰 예상 문제를 만들어줍니다. 서술형 답안을 직접 써보고 첨삭받는 과정이 점수 향상에 가장 효과적입니다. 작품 해석도 학교 선생님의 관점에 맞춰 준비합니다.' },
    ],
  },
  국어비문학전략: {
    sections: [
      { h: '비문학, 정보 처리 능력입니다', p: '비문학은 배경 지식이 아니라 글을 정확히 읽는 능력을 묻습니다. 처음 보는 주제라도 지문 안에 모든 답이 있습니다. 지문 밖 지식으로 풀면 오답에 빠집니다.' },
      { h: '문단별 핵심 파악법', p: '각 문단을 읽고 한 줄 요약을 적어보세요. "이 문단은 ○○에 대한 설명이다" 수준이면 충분합니다. 전체를 읽은 후 요약을 이어 보면, 글의 논리 구조가 한눈에 보입니다.' },
      { h: '선지 분석 기술', p: '보기를 읽을 때 "지문에 근거가 있는가?"를 따져보세요. 맞는 것 같지만 지문에 없는 내용은 오답입니다. 선지의 핵심어를 지문에서 찾아 밑줄을 긋는 습관이 정확도를 높입니다.' },
      { h: '출제 빈출 주제 정리', p: '과학 기술, 경제 원리, 철학 논증, 예술 비평이 자주 나옵니다. 각 분야의 기본 용어를 미리 익혀두면 지문 이해 속도가 빨라집니다. 기출 지문을 분야별로 분류해서 읽어보세요.' },
      { h: '과외로 비문학 정복하기', p: '비문학은 혼자 읽으면 "이해했다고 착각"하기 쉽습니다. 과외 선생님이 "이 문단의 핵심이 뭐야?"라고 질문하면, 정확히 이해했는지 바로 확인됩니다. 이런 훈련이 반복되면 어떤 지문이든 빠르고 정확하게 읽을 수 있게 됩니다.' },
    ],
  },
  국어문학분석: {
    sections: [
      { h: '문학의 4요소를 파악하세요', p: '모든 문학 작품은 화자/서술자, 소재, 주제, 표현 기법으로 분석할 수 있습니다. 시를 읽으면 "누가 말하는지(화자)", "어떤 감정인지(정서)", "어떤 방법으로 표현했는지(기법)"를 정리하세요.' },
      { h: '시 분석의 3단계', p: '1단계: 시어의 사전적 의미 파악 / 2단계: 시어의 비유적·상징적 의미 추론 / 3단계: 화자의 정서와 태도 종합. 이 순서로 분석하면 생소한 시도 체계적으로 해석할 수 있습니다.' },
      { h: '소설 분석 프레임', p: '인물(성격과 변화) / 사건(갈등의 원인과 해결) / 배경(시간·공간·사회적 배경의 의미) / 서술 시점(1인칭/3인칭, 관찰자/전지적). 이 네 가지 틀로 분석하면 어떤 소설 문제든 대응할 수 있습니다.' },
      { h: '고전 문학 접근법', p: '고전 문학은 현대어 해석이 첫 번째 관문입니다. 자주 쓰이는 고어 표현 50개를 먼저 외우세요. 그다음 작품의 시대적 배경과 작가 의식을 파악하면 해석이 수월해집니다.' },
      { h: '과외에서의 문학 수업', p: '문학은 해석의 다양성이 있지만, 시험에서는 "출제자의 의도"에 맞는 해석이 정답입니다. 과외 선생님은 출제 의도에 맞는 분석법을 가르치고, 학생이 혼자 분석하는 능력을 키워줍니다.' },
    ],
  },
  수능국어대비: {
    sections: [
      { h: '수능 국어의 특성 이해', p: '수능 국어는 사고력 시험입니다. 암기보다 글을 정확히 읽고 논리적으로 판단하는 능력이 필요합니다. 독서(비문학)·문학·언어와 매체(문법), 세 영역을 균형 있게 준비하세요.' },
      { h: '화법과 작문 만점 전략', p: '1~5번 화법·작문은 규칙이 명확한 영역입니다. 대화 원리, 발표 전략, 작문 과정 등 출제 유형이 정해져 있으므로 기출 20문제만 풀어도 패턴이 보입니다. 여기서 5문제 확보하면 나머지가 편해집니다.' },
      { h: '독서(비문학) 고득점 비결', p: '독서 영역은 매년 새로운 지문이 나오므로, 많이 읽는 것보다 구조적으로 읽는 훈련이 중요합니다. 지문의 정보 간 관계(원인-결과, 비교-대조, 문제-해결)를 파악하며 읽으세요.' },
      { h: '시간 관리 (80분)', p: '화법·작문(1~5번): 8분 / 언어·매체(11~16번): 10분 / 독서(6~10, 17~27번): 35분 / 문학(28~45번): 25분 / 검토: 2분. 독서에 가장 많은 시간을 배분하되, 한 지문에 8분 이상 쓰지 마세요.' },
      { h: '과외로 수능 국어 대비하기', p: '수능 국어는 혼자 풀면 실력이 정체되기 쉽습니다. 과외 선생님은 오답 원인을 정확히 진단하고, 학생에게 맞는 지문 읽기 전략을 코칭합니다. 매주 모의고사 1회분을 같이 분석하면 꾸준히 성장합니다.' },
    ],
  },
  과학공부법: {
    sections: [
      { h: '개념 이해 → 문제 적용', p: '과학은 개념을 이해한 후 문제에 적용하는 과목입니다. 교과서를 읽을 때 "왜 이런 현상이 일어나는가?"를 항상 질문하세요. 원리를 이해하면 처음 보는 문제도 풀 수 있습니다.' },
      { h: '실험과 탐구 과정 정리', p: '과학 시험에서 실험 관련 문제 비중이 높습니다. 실험의 목적, 변인(독립/종속/통제), 결과 해석, 결론 도출 과정을 정리하세요. 실험 보고서를 직접 작성해보는 연습도 도움됩니다.' },
      { h: '계산 문제 정복법', p: '물리·화학에서 계산 문제는 공식 암기가 아니라 상황 분석이 핵심입니다. 문제를 읽고 (1)주어진 정보 정리 (2)구하려는 것 확인 (3)적용할 공식 선택. 이 3단계를 습관화하면 계산 문제가 쉬워집니다.' },
      { h: '단원별 마인드맵 만들기', p: '과학은 단원 내 개념들이 유기적으로 연결됩니다. 각 단원을 공부한 후 마인드맵으로 핵심 개념과 관계를 정리하세요. 시험 전에 마인드맵만 보면 전체 단원이 한눈에 들어옵니다.' },
      { h: '과외로 과학 성적 올리기', p: '과학은 개념 질문을 많이 할수록 빨리 늘어납니다. 과외 선생님에게 "왜요?"를 편하게 물어볼 수 있는 환경이 중요합니다. 드림과외 선생님은 실험 수행평가 준비부터 계산 문제 풀이까지 꼼꼼히 함께합니다.' },
    ],
  },
  과학내신전략: {
    sections: [
      { h: '교과서 + 실험 노트가 핵심', p: '과학 내신은 교과서 개념과 실험에서 출제됩니다. 교과서를 3번 읽고, 수업 시간 실험 내용을 빠짐없이 정리하세요. 선생님이 칠판에 적은 보충 설명도 반드시 기록하세요.' },
      { h: '서술형 대비 핵심', p: '과학 서술형은 "개념을 정확한 용어로 설명할 수 있느냐"를 봅니다. 답안에 반드시 과학 용어를 사용하고, 원인과 결과를 논리적으로 연결하세요. 모범 답안을 여러 번 써보는 연습이 효과적입니다.' },
      { h: '수행평가 만점 전략', p: '수행평가는 실험 보고서, 발표, 포트폴리오 등 다양합니다. 실험 보고서는 가설-방법-결과-결론 형식을 지키고, 표와 그래프를 깔끔하게 그리세요. 발표는 핵심만 간결하게, 시간 엄수가 중요합니다.' },
      { h: '시험 전 복습 전략', p: '2주 전: 전 범위 개념 1회독 / 1주 전: 문제 풀이 + 오답 정리 / 3일 전: 실험 과정·결과 복습 / 전날: 핵심 공식·용어만 확인. 특히 실험 관련 내용은 그림과 함께 정리하면 기억에 오래 남습니다.' },
      { h: '과외로 과학 내신 관리', p: '과학은 단원마다 난이도 차이가 크고, 학생마다 어려워하는 단원이 다릅니다. 과외 선생님이 약한 단원을 집중적으로 보충하고, 수행평가 준비도 함께 도와줍니다. 실험 보고서 작성법도 1:1로 배울 수 있습니다.' },
    ],
  },
  과학실험대비: {
    sections: [
      { h: '실험 보고서의 기본 구조', p: '좋은 실험 보고서는 정해진 틀을 따릅니다. 실험 목적 → 가설 설정 → 준비물 → 실험 방법 → 결과(표/그래프) → 결론 → 고찰. 각 항목을 빠짐없이 채우는 것이 기본 점수를 확보하는 열쇠입니다.' },
      { h: '변인 통제 이해하기', p: '실험에서 가장 중요한 것은 변인 통제입니다. 독립 변인(내가 바꾸는 것), 종속 변인(측정하는 결과), 통제 변인(같게 유지하는 것)을 정확히 구분하세요. 이것을 실험 보고서에 명시하면 높은 점수를 받습니다.' },
      { h: '표와 그래프 작성법', p: '실험 결과는 표로 정리한 후 그래프로 시각화하세요. 그래프에는 제목, 축 이름, 단위를 반드시 표시하고, 데이터 점을 정확히 찍은 후 추세선을 그리세요. 깔끔한 그래프가 보고서 품질을 높입니다.' },
      { h: '결론과 고찰 쓰는 법', p: '결론은 실험 결과를 가설과 비교하여 "가설이 맞았다/틀렸다"를 판단하는 것입니다. 고찰에는 오차 원인, 개선 방안, 추가 탐구 주제를 적으세요. 이 부분이 수행평가에서 A등급을 결정합니다.' },
      { h: '과외 선생님과 실험 대비', p: '수행평가는 채점 기준이 정해져 있습니다. 과외 선생님이 채점 기준에 맞춰 보고서를 미리 검토하고 피드백을 줍니다. 혼자 쓰면 놓치기 쉬운 형식적 요소와 내용적 깊이를 함께 잡아줍니다.' },
    ],
  },
  과학개념학습: {
    sections: [
      { h: '교과서를 능동적으로 읽기', p: '교과서를 수동적으로 읽지 마세요. 읽으면서 "왜?"를 반복적으로 질문하세요. "왜 물이 끓으면 기체가 되지?" "왜 행성은 타원 궤도를 돌지?" 이런 질문이 개념의 깊은 이해로 이끕니다.' },
      { h: '시각 자료 활용', p: '과학 개념은 글로 읽는 것보다 그림·도표·영상으로 보면 이해가 빠릅니다. 교과서 삽화를 직접 다시 그려보세요. 세포 구조, 회로도, 지구 내부 구조 등을 직접 그리면 기억에 오래 남습니다.' },
      { h: '일상과 연결하기', p: '과학 개념을 일상 현상과 연결하면 쉽게 이해됩니다. 관성의 법칙 = 버스 급정거 시 몸이 앞으로 쏠림 / 삼투압 = 배추에 소금 뿌리면 물이 나옴. 이렇게 연결하면 시험에서도 쉽게 떠올립니다.' },
      { h: '단원 정리 노트 만들기', p: '한 단원을 공부한 후 A4 한 장에 핵심 내용을 요약하세요. 핵심 개념, 공식, 실험 결과, 자주 틀리는 포인트를 포함하세요. 시험 직전에 이 한 장만 보면 전체를 빠르게 복습할 수 있습니다.' },
      { h: '과외에서의 개념 학습', p: '과학 개념은 "이해했다고 착각"하기 쉽습니다. 과외 선생님이 개념을 설명하게 하고, 부족한 부분을 바로 보충합니다. 질문과 답변이 오가는 양방향 수업이 과학 이해도를 빠르게 높입니다.' },
    ],
  },
  수능과학대비: {
    sections: [
      { h: '선택과목 전략적으로 고르기', p: '물리학, 화학, 생명과학, 지구과학 중 자신에게 맞는 2과목을 선택하세요. 암기가 강하면 생명과학·지구과학, 계산이 강하면 물리학·화학이 유리합니다. 학교 내신과 겹치는 과목을 선택하면 효율적입니다.' },
      { h: '개념 완성이 먼저', p: '수능 과탐은 개념에서 출제됩니다. 교과서 개념을 100% 이해한 후에 문제를 풀어야 합니다. 개념이 불완전한 상태에서 문제만 풀면 실력이 정체됩니다. 기본 개념 1회독 → 심화 개념 → 문제 풀이 순서를 지키세요.' },
      { h: '킬러 문항 대비법', p: '2~3문제의 고난도 문항이 등급을 결정합니다. 이 문항은 여러 개념을 융합하거나, 실험 설계 능력을 묻습니다. 기출 킬러 문항을 유형별로 분류해 집중 연습하세요. 한 문제당 10분 이상 깊이 사고하는 훈련이 필요합니다.' },
      { h: '기출 분석 방법', p: '최근 5개년 수능·모의고사 기출을 3회독 하세요. 1회독: 풀기 / 2회독: 오답 분석 + 개념 보충 / 3회독: 시간 내 풀기. 기출을 충분히 분석하면 출제자가 어떤 개념을 어떻게 물어보는지 패턴이 보입니다.' },
      { h: '과외로 수능 과탐 준비하기', p: '수능 과탐은 개념의 깊은 이해가 필요해서, 질문할 수 있는 환경이 중요합니다. 과외 선생님이 어려운 개념을 학생 수준에 맞게 설명하고, 킬러 문항 풀이 전략을 코칭합니다. 주간 모의고사 분석도 함께 진행합니다.' },
    ],
  },
  사회공부법: {
    sections: [
      { h: '흐름을 이해하세요', p: '사회 과목은 단순 암기가 아니라 "왜 이런 제도가 생겼는지", "이 현상의 원인과 결과는 무엇인지" 흐름을 이해하는 것이 중요합니다. 개념을 인과 관계로 연결하면 암기할 양이 절반으로 줄어듭니다.' },
      { h: '키워드 중심 정리', p: '교과서에서 굵은 글씨, 핵심 용어를 먼저 뽑아 정리하세요. 각 키워드의 정의를 한 줄로 쓸 수 있어야 합니다. 키워드끼리의 관계(원인-결과, 비교-대조)를 화살표로 연결하면 구조가 보입니다.' },
      { h: '자료 해석 능력 키우기', p: '사회 시험에서 그래프, 표, 통계 자료 해석 문제가 자주 나옵니다. 자료를 볼 때 (1)제목 확인 (2)단위 확인 (3)추세 파악 (4)특이점 발견 순서로 분석하세요. 매주 시사 자료 1개를 분석하는 연습을 하면 실력이 쌓입니다.' },
      { h: '시사와 교과 연계', p: '사회 과목은 시사 이슈와 연결하면 흥미가 생깁니다. 뉴스에서 본 경제 정책, 사회 문제를 교과서 개념과 연결해보세요. 이런 사고 습관이 서술형 문제에서 풍부한 답안을 쓰는 힘이 됩니다.' },
      { h: '과외로 사회 공부하기', p: '사회는 정리가 잘 되어 있으면 쉽고, 안 되어 있으면 막막한 과목입니다. 과외 선생님이 단원별 핵심을 체계적으로 정리해주고, 서술형 답안 작성법을 직접 연습시킵니다.' },
    ],
  },
  사회내신전략: {
    sections: [
      { h: '교과서 3회독 전략', p: '1회독: 전체 흐름 파악, 핵심 키워드 표시 / 2회독: 키워드별 개념 정리, 인과 관계 파악 / 3회독: 빈칸 채우기식 자가 테스트. 3회독이면 내신 기본 점수 80점은 확보됩니다.' },
      { h: '선생님의 수업 자료 활용', p: '사회 내신은 교과서 + 수업 자료에서 출제됩니다. PPT, 프린트, 영상 자료에서 나온 내용도 시험 범위입니다. 수업 자료를 모아서 교과서 내용과 함께 정리하세요.' },
      { h: '서술형 고득점 비법', p: '서술형은 (1)핵심 개념 제시 (2)구체적 사례나 근거 (3)결론의 3단 구성으로 작성하세요. "~이기 때문에 ~이다" 형식의 인과 관계 문장이 높은 점수를 받습니다. 분량은 지정된 줄의 80% 이상 채우세요.' },
      { h: '자주 출제되는 유형 정리', p: '개념 비교(A와 B의 차이점), 그래프/표 해석, 사례 적용(~에 해당하는 것), 서술형(~의 원인/결과 서술). 이 4가지 유형을 기출에서 연습하면 출제 패턴에 익숙해집니다.' },
      { h: '과외로 사회 내신 올리기', p: '사회 내신은 정리력 싸움입니다. 과외 선생님이 단원별 핵심 정리본을 만들어주고, 서술형 모의 문제를 출제해 연습시킵니다. 혼자 하면 놓치기 쉬운 수업 내 포인트도 함께 짚어줍니다.' },
    ],
  },
  사회서술형대비: {
    sections: [
      { h: '서술형 답안의 기본 구조', p: '좋은 서술형 답안은 구조가 명확합니다. 주장(결론) → 근거(이유) → 사례 또는 부연. 한 문장으로 핵심을 말하고, 두세 문장으로 근거를 덧붙이세요. 핵심 용어를 반드시 포함해야 점수를 받습니다.' },
      { h: '채점 기준 파악하기', p: '서술형은 채점 기준표에 따라 점수가 주어집니다. "키워드 포함 여부", "논리적 연결", "분량 충족"이 주요 기준입니다. 기출 서술형의 모범 답안을 분석하면 어떤 요소가 점수를 결정하는지 알 수 있습니다.' },
      { h: '논리적 글쓰기 연습', p: '"~이므로 ~이다", "이와 달리 ~", "이를 통해 알 수 있는 것은 ~" 같은 논리적 연결어를 활용하세요. 원인과 결과, 비교와 대조를 명확히 드러내는 문장이 높은 점수를 받습니다.' },
      { h: '시간 내 답안 쓰기', p: '서술형에 너무 많은 시간을 쓰면 객관식을 놓칩니다. 서술형 1문제당 5분 이내로 쓰는 연습을 하세요. 핵심만 간결하게, 불필요한 서론은 빼고 바로 본론으로 들어가세요.' },
      { h: '과외에서의 서술형 훈련', p: '서술형은 피드백 없이는 향상되기 어렵습니다. 과외 선생님이 답안을 읽고 "이 부분은 더 구체적으로", "이 키워드가 빠졌어" 같은 피드백을 즉시 줍니다. 이런 반복 훈련이 서술형 실력을 빠르게 올립니다.' },
    ],
  },
  사회시사연계: {
    sections: [
      { h: '시사 이슈를 교과서와 연결하기', p: '뉴스에서 접하는 경제 정책, 환경 문제, 인권 이슈는 사회 교과서 개념과 직결됩니다. 뉴스를 볼 때 "이것은 교과서 몇 단원과 관련될까?"를 생각하는 습관을 들이세요.' },
      { h: '주간 시사 노트 만들기', p: '매주 시사 이슈 2~3개를 골라 (1)요약 (2)관련 교과 개념 (3)나의 의견을 한 페이지로 정리하세요. 이 노트가 쌓이면 서술형에서 활용할 수 있는 풍부한 소재가 됩니다.' },
      { h: '토론과 글쓰기 연습', p: '시사 이슈에 대해 찬반 의견을 정리하고, 200자 내외로 자신의 입장을 써보세요. 논리적 글쓰기 능력이 향상되면 서술형뿐 아니라 수행평가에서도 좋은 결과를 얻을 수 있습니다.' },
      { h: '출제 빈출 시사 주제', p: '기후 변화와 탄소 중립, 디지털 경제와 플랫폼 노동, 인구 감소와 지방 소멸, 민주주의와 시민 참여. 이런 주제는 매년 시험에 나올 가능성이 높으니 기본 배경 지식을 갖추어 두세요.' },
      { h: '과외에서의 시사 학습', p: '과외 선생님과 함께 시사 이슈를 토론하면 비판적 사고력이 길러집니다. 선생님이 다양한 관점을 제시하고, 학생이 자신의 논거를 정리하는 연습은 수행평가와 서술형 모두에 도움됩니다.' },
    ],
  },
  수능사회대비: {
    sections: [
      { h: '사탐 선택과목 전략', p: '생활과 윤리, 사회문화, 한국지리가 응시 인원이 많아 등급 받기 유리합니다. 자신의 강점에 맞게 선택하되, 학교 내신과 겹치는 과목을 선택하면 효율적입니다.' },
      { h: '개념 완벽 정리가 먼저', p: '수능 사탐은 개념 정확도를 묻습니다. 비슷한 개념의 미세한 차이(예: 사회화/재사회화, 형식적 평등/실질적 평등)를 정확히 구분해야 합니다. 헷갈리는 개념 쌍을 정리하는 것이 핵심입니다.' },
      { h: '자료 분석 문제 공략', p: '표, 그래프, 통계 자료를 읽는 연습을 많이 하세요. 자료의 단위, 기준, 추세를 먼저 파악하고, 선지와 하나씩 대조하세요. 자료 분석 문제는 풀이 시간이 오래 걸리므로, 빠르게 정보를 읽는 연습이 필요합니다.' },
      { h: '기출 활용법', p: '최근 5개년 수능+모의고사 기출을 유형별로 분류하세요. 개념 확인형, 자료 분석형, 사례 적용형으로 나누어 풀면 각 유형의 접근법이 체계적으로 잡힙니다.' },
      { h: '과외로 수능 사탐 준비하기', p: '사탐은 개념이 정확해야 고득점이 가능합니다. 과외 선생님이 헷갈리는 개념을 명확히 정리해주고, 자료 분석 문제 풀이 전략을 코칭합니다. 주간 모의고사 분석으로 꾸준히 실력을 점검합니다.' },
    ],
  },
  한국사공부법: {
    sections: [
      { h: '흐름이 먼저, 암기는 나중', p: '한국사는 시대 순서와 인과 관계를 먼저 파악하세요. "왜 이 사건이 일어났고, 그 결과 무엇이 바뀌었는지"를 이해하면 암기할 양이 크게 줄어듭니다. 연표를 만들어 전체 흐름을 한눈에 보세요.' },
      { h: '시대별 키워드 정리', p: '각 시대의 핵심 키워드 10개를 뽑아 정리하세요. 고조선: 8조법 / 삼국: 율령 반포 / 고려: 과거제 / 조선: 훈민정음. 키워드를 중심으로 살을 붙이면 체계적으로 공부할 수 있습니다.' },
      { h: '헷갈리는 사건 비교 정리', p: '임진왜란 vs 병자호란, 동학 농민 운동 vs 갑오개혁, 3·1 운동 vs 6·10 만세 운동. 비슷한 사건을 표로 비교하면(원인/과정/결과/의의) 혼동하지 않습니다.' },
      { h: '사료와 자료 읽기', p: '한국사 시험에서 사료나 지도를 주고 시대를 묻는 문제가 자주 나옵니다. 대표적인 사료의 키워드를 외워두세요. "만민공동회" → 독립협회 / "교정청" → 동학 농민 운동. 키워드 하나로 시대를 특정할 수 있습니다.' },
      { h: '과외로 한국사 정복하기', p: '한국사는 체계적인 정리가 되면 빠르게 마스터할 수 있지만, 혼자 정리하면 시간이 오래 걸립니다. 과외 선생님이 시대별 핵심을 구조화해주고, 기출 유형별 접근법을 알려줍니다.' },
    ],
  },
  한국사내신전략: {
    sections: [
      { h: '수업 내용이 곧 시험 범위', p: '한국사 내신은 교과서 + 수업 자료에서 나옵니다. 선생님이 수업에서 강조한 사건, 인물, 의의를 반드시 정리하세요. 교과서에 없는 보충 설명도 시험에 나올 수 있습니다.' },
      { h: '연표와 마인드맵 활용', p: '시험 범위의 핵심 사건을 연표로 정리하고, 각 사건 간의 인과 관계를 마인드맵으로 그리세요. 시각적으로 정리하면 전체 구조가 머릿속에 들어옵니다.' },
      { h: '서술형 대비', p: '한국사 서술형은 "~의 배경/원인/결과/의의를 서술하시오" 형식이 많습니다. 핵심 사건마다 배경-과정-결과-의의를 4줄로 정리해두면 어떤 서술형이 나와도 대응할 수 있습니다.' },
      { h: '시험 전 벼락치기 전략', p: '시간이 없다면 연표 + 핵심 키워드만 반복하세요. 각 시대별 대표 사건 3개, 대표 인물 2명, 핵심 제도 1개만 외워도 기본 점수를 확보할 수 있습니다.' },
      { h: '과외로 한국사 내신 올리기', p: '한국사는 정리가 잘 되어 있으면 쉽지만, 막연히 외우면 끝이 없습니다. 과외 선생님이 시대별 핵심을 구조화하고, 서술형 모의 문제를 출제해 연습시킵니다.' },
    ],
  },
  한국사시대정리: {
    sections: [
      { h: '선사~고대: 국가의 형성', p: '구석기(뗀석기)→ 신석기(간석기, 빗살무늬토기)→ 청동기(고조선, 비파형동검). 고조선의 8조법은 당시 사회상을 보여줍니다. 철기 시대에 여러 나라(부여, 고구려, 옥저, 동예, 삼한)가 등장합니다.' },
      { h: '삼국~남북국: 고대 국가 발전', p: '고구려(광개토대왕, 을지문덕)/ 백제(근초고왕, 무령왕)/ 신라(진흥왕, 화랑도). 통일신라의 골품제와 발해의 해동성국 시기를 비교하세요. 삼국의 불교 수용 순서(고→백→신)도 중요합니다.' },
      { h: '고려: 무신정권과 대외 항쟁', p: '고려의 핵심은 과거제 실시, 무신 정변, 몽골 항쟁, 공민왕 개혁입니다. 고려청자, 팔만대장경, 상감기법 등 문화 성과도 시험에 자주 나옵니다.' },
      { h: '조선: 유교 정치와 실학', p: '조선 전기: 훈민정음, 과전법, 비변사 / 조선 후기: 실학(유형원, 정약용), 대동법, 균역법. 임진왜란→병자호란 이후 사회 변화와 영·정조의 탕평책이 핵심입니다.' },
      { h: '근현대: 개항~대한민국', p: '강화도 조약(1876)→ 동학농민운동→ 갑오개혁→ 대한제국→ 일제강점기(3·1운동, 임시정부)→ 광복→ 6·25→ 민주화. 근현대사는 사건의 시간 순서와 인과 관계를 정확히 알아야 합니다.' },
    ],
  },
  한국사능력검정: {
    sections: [
      { h: '한능검 시험 구조 이해', p: '한국사능력검정시험은 심화(1~3급)와 기본(4~6급)으로 나뉩니다. 심화 1급은 70점 이상. 50문항 80분이며, 시대별로 골고루 출제됩니다. 공무원·군무원 등 취업에 필요한 자격이므로 1급을 목표로 하세요.' },
      { h: '기출 반복이 핵심', p: '한능검은 기출에서 70% 이상 유사하게 출제됩니다. 최근 10회분 기출을 3회독 하세요. 1회독: 풀기 / 2회독: 오답 분석 + 개념 보충 / 3회독: 시간 내 풀기. 기출만 철저히 해도 1급이 가능합니다.' },
      { h: '사료 키워드 암기', p: '"교정청" → 동학 / "과전법" → 조선 태조 / "비변사" → 중종 / "대동법" → 광해군. 사료에 등장하는 핵심 키워드와 시대를 연결하는 것이 빠른 풀이의 비결입니다. 키워드 100개를 정리하세요.' },
      { h: '시대 구분 빠르게 하기', p: '문제를 읽자마자 시대를 특정할 수 있어야 합니다. 인물(세종→조선), 사건(임오군란→고종), 제도(골품제→신라)로 시대를 빠르게 파악하세요. 시대만 맞추면 선지 소거가 쉬워집니다.' },
      { h: '과외로 한능검 준비하기', p: '한능검은 범위가 넓어서 혼자 정리하면 시간이 많이 걸립니다. 과외 선생님이 시대별 핵심 정리와 기출 분석을 효율적으로 진행하고, 약한 시대를 집중 보충합니다.' },
    ],
  },
  수능한국사대비: {
    sections: [
      { h: '수능 한국사는 절대평가', p: '수능 한국사는 절대평가로, 40점 이상이면 1등급입니다. 20문항 중 8문제만 맞추면 되므로, 완벽하지 않아도 됩니다. 자주 나오는 유형만 확실히 잡으면 부담 없이 1등급을 받을 수 있습니다.' },
      { h: '빈출 주제 TOP 10', p: '(1)고조선 (2)삼국의 문화 (3)고려 정치 (4)조선 전기 제도 (5)임진왜란·병자호란 (6)영·정조 (7)개항기 (8)일제강점기 (9)대한민국 정부 수립 (10)민주화 운동. 이 10가지를 확실히 하면 12문제 이상 맞출 수 있습니다.' },
      { h: '연표 암기 전략', p: '핵심 연도 20개만 외우세요. 676(신라통일), 918(고려건국), 1392(조선건국), 1446(훈민정음), 1592(임진왜란), 1876(강화도조약), 1919(3·1운동), 1945(광복), 1950(6·25), 1987(6월항쟁). 이것만으로 시대 파악이 됩니다.' },
      { h: '3주 완성 전략', p: '1주차: 선사~고려 개념 정리 + 기출 / 2주차: 조선~근대 개념 정리 + 기출 / 3주차: 일제~현대 + 전 범위 모의고사. 하루 1시간씩 3주면 수능 한국사 1등급이 충분합니다.' },
      { h: '과외로 빠르게 끝내기', p: '과외 선생님과 함께하면 3주 완성이 2주로 줄어듭니다. 선생님이 핵심만 골라 설명하고, 기출 분석을 함께 하면 혼자 공부할 때보다 훨씬 효율적입니다.' },
    ],
  },
};

export function renderEduPage({ slug, title, desc, subject }) {
  const content = EDU_CONTENT[slug];
  if (!content) return null;

  const subjectInfo = SUBJECTS[subject];
  const pageTitle = `${title} | 드림과외 교육정보`;
  const description = `${desc}. 드림과외가 알려드리는 ${subject} 학습 전략과 공부법.`;
  const url = `/${slug}`;

  const head = buildHead({ title: pageTitle, description, url, type: 'local' });

  const otherArticles = EDU_ARTICLES[subject]
    .filter(a => a.slug !== slug)
    .map(a => `<a href="/${a.slug}">${a.title}</a>`)
    .join('');

  const allSubjectLinks = Object.entries(EDU_ARTICLES)
    .map(([s, articles]) => {
      const info = SUBJECTS[s];
      return `<div style="margin-bottom:16px">
        <strong>${info?.emoji || '📚'} ${s}</strong>
        <div class="link-list" style="margin-top:8px">
          ${articles.map(a => `<a href="/${a.slug}">${a.title}</a>`).join('')}
        </div>
      </div>`;
    }).join('');

  const imgIdx = ((slug.charCodeAt(0) + slug.charCodeAt(2)) % 6) + 1;

  const body = `
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">${subjectInfo?.emoji || '📚'} ${subject} 교육정보</div>
    <h1 class="page-h1">${title.replace(subject + ' ', subject + ' <em>') + '</em>'}</h1>
    <p class="page-desc">${desc}. 드림과외가 현장 경험을 바탕으로 정리한 실전 학습 가이드입니다.</p>
    <div class="hero-btns">
      <a href="/${subject}과외" class="btn-hero-sub">${subjectInfo?.emoji || '📚'} ${subject}과외 알아보기</a>
      <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청</button>
    </div>
  </div>
</section>

${content.sections.map((s, i) => `
<section class="sec ${i % 2 === 0 ? 'sec-wh' : 'sec-bg'}">
  <div class="wrap">
    <span class="sec-label">STEP ${i + 1}</span>
    <h2 class="sec-title"><em>${s.h}</em></h2>
    <p style="font-size:15px;color:var(--ink);line-height:2;word-break:keep-all;max-width:800px">${s.p}</p>
  </div>
</section>`).join('')}

${ctaBox(`${subject} 과외`)}

<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">MORE</span>
    <h2 class="sec-title">${subject} <em>교육정보</em> 더보기</h2>
    <div class="link-list">${otherArticles}</div>
  </div>
</section>

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">ALL GUIDES</span>
    <h2 class="sec-title">전 과목 <em>교육정보</em></h2>
    <p class="sec-desc">과목별 공부법, 내신 전략, 수능 대비 가이드를 확인하세요.</p>
    ${allSubjectLinks}
  </div>
</section>

${consultForm({
  leftTitle: '<em>' + subject + ' 과외</em> 무료 상담',
  leftDesc: subject + ' 전문 선생님과 1:1 맞춤 수업을 시작하세요.',
  leftPts: ['24시간 내 선생님 매칭', '첫 30분 무료 체험', '내신·수능 맞춤 커리큘럼', '언제든 선생님 교체 가능'],
})}`;

  return layout({ head, body, keyword: title, region: '' });
}
