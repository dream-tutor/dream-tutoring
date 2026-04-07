import { buildHead, buildFAQSchema, buildHomeSchema } from './seo.js';
import { layout, ctaBox, faqSection, consultForm } from './template.js';
import { SUBJECTS, GRADES, SIDO_DESC, VISIT_REGIONS, GU_DESC, DONG_DESC, stripSuffix, stripGuSuffix, ALL_REGIONS, ONLINE_DONG_MAP, sigunguSlug, dongSlug } from './data/regions.js';
import { DONG_SCHOOLS, SCHOOL_TO_LOCATION } from './data/schools.js';

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

  // 각 섹션마다 독립 시드 → 섹션끼리 서로 다른 변형 번호를 가짐
  const vH = getVariant(displayDong, 0, 12);  // hero desc
  const vW = getVariant(displayDong, 1, 12);  // why desc
  const vP = getVariant(displayDong, 2, 12);  // process desc
  const vO = getVariant(displayDong, 3,  3);  // section order (3가지 순서)
  const vC = getVariant(displayDong, 4, 12);  // cta / consult 포인트
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
  const _secA = buildLearningSection(grade, subject, displayDong, nearSchoolName, 4);
  const _secB = buildSubjectStudySection(subject, displayDong, 5);
  const _secC = buildExamGuideSection(displayDong, nearSchoolName, 6);
  const midSections = vO === 0 ? [_secA, _secB, _secC] : vO === 1 ? [_secC, _secA, _secB] : [_secB, _secC, _secA];

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
  const canonicalKeyword = `${gu}${grade || ''}${subject || ''}과외`;
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

${buildLearningSection(grade, subject, displayGu)}

${buildSubjectStudySection(subject, displayGu)}

${buildExamGuideSection(displayGu)}

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
  let h = seed * 1009;
  for (let i = 0; i < location.length; i++) {
    h = (h + location.charCodeAt(i) * (i + 1) * (seed + 1)) & 0xFFFFFF;
  }
  return Math.abs(h) % n;
}

// ── 헬퍼: 학습 콘텐츠 섹션 생성 ─────────────────────────
function buildLearningSection(grade, subject, location, nearSchoolName = null, seed = 4) {
  const v = getVariant(location, seed, 3);
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
function buildSubjectStudySection(subject, location, seed = 5) {
  const v = getVariant(location, seed, 3);
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
function buildExamGuideSection(location, nearSchoolName = null, seed = 6) {
  const v = getVariant(location, seed, 9);
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

  // 표시용 지역명
  let displayName, pageTitle, pageDesc;
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
    pageTitle   = `${dong}${grade || ''}${subject || ''}과외`;
    pageDesc    = `${dong} ${serviceText} 전문 선생님 연결. 1:1 맞춤 수업, 첫 30분 무료 체험.`;
  } else if (level === 'sigungu') {
    displayName = sigungu;
    pageTitle   = `${sigungu}${grade || ''}${subject || ''}과외`;
    pageDesc    = `${sigungu} ${serviceText} 전문 선생님 연결. 1:1 맞춤 수업으로 성적 향상, 첫 30분 무료 체험.`;
  } else {
    displayName = sido;
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

  // 과목 섹션
  const subjectSection = subjectInfo ? `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECT</span>
    <h2 class="sec-title">${displayName} <em>${subject} 과외</em></h2>
    <p class="sec-desc">${subjectInfo.emoji} ${subjectInfo.desc} 전담 선생님을 연결해드립니다.</p>
    <div class="link-list">
      ${Object.entries(SUBJECTS).map(([s, info]) =>
        `<a href="/${encodeURIComponent(displayName + s + '과외')}">${info.emoji} ${displayName} ${s}과외</a>`
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
        `<a href="/${encodeURIComponent(displayName + s + '과외')}">${info.emoji} ${displayName} ${s}과외</a>`
      ).join('')}
    </div>
  </div>
</section>`;

  // 학년 섹션
  const gradeSubjectLinks = gradeInfo
    ? Object.entries(SUBJECTS).map(([s, info]) =>
        `<a href="/${encodeURIComponent(displayName + grade + s + '과외')}">${info.emoji} ${displayName} ${grade} ${s}과외</a>`
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
        `<a href="/${encodeURIComponent(displayName + g + '과외')}">📖 ${displayName} ${g}과외</a>`
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
.rgn-card:hover{border-color:var(--acc);background:#EEF4FF;transform:translateY(-2px)}
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
.grade-link{font-size:13px;color:var(--acc);text-decoration:none;background:#EEF4FF;border-radius:20px;padding:4px 12px;transition:.15s}
.grade-link:hover{background:var(--acc);color:#fff}
/* 인기 지역 섹션 */
.hot-grid{display:flex;flex-wrap:wrap;gap:10px;margin-top:32px}
.hot-card{font-size:14px;font-weight:600;color:var(--ink);text-decoration:none;background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:10px 18px;transition:.2s}
.hot-card:hover{border-color:var(--acc);color:var(--acc);transform:translateY(-2px)}
/* 프로모 배너 섹션 */
.promo-banner{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.promo-visual svg{width:100%;max-width:420px;height:auto;display:block;filter:drop-shadow(0 8px 32px rgba(13,27,42,.12))}
@media(max-width:768px){
  .grade-tabs{grid-template-columns:1fr}
  .hot-grid{gap:8px}
  .hot-card{font-size:13px;padding:8px 14px}
  .promo-banner{grid-template-columns:1fr;gap:28px}
  .promo-visual{order:-1}
  .promo-visual svg{max-width:320px;margin:0 auto}
}
</style>

<!-- HERO -->
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">📍 전국 서비스</div>
    <h1 class="page-h1">내 아이에게 딱 맞는<br><em>선생님을 만나세요</em></h1>
    <p class="page-desc">
      성적이 오르지 않는다면, 아직 맞는 선생님을 못 만난 겁니다.<br>
      드림과외는 우리 아이 학교·과목·수준에 꼭 맞는 선생님을 직접 골라 연결해드립니다.<br>
      방문·화상 모두 가능, 신청 다음날이면 수업이 시작됩니다.
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
          <a href="tel:${PHONE_LINK}" class="btn-hero-sub" style="font-size:14px;padding:12px 20px;background:rgba(13,27,42,.08);color:var(--ink);border-color:var(--border)">📞 전화 상담</a>
        </div>
      </div>
      <div class="promo-visual">
        <svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" aria-label="드림과외 과외 수업 일러스트">
          <!-- 배경 카드 -->
          <rect x="20" y="20" width="380" height="300" rx="20" fill="#fff" stroke="#E2E0D8" stroke-width="1.5"/>
          <!-- 책상 -->
          <rect x="60" y="220" width="300" height="10" rx="5" fill="#E2E0D8"/>
          <rect x="90" y="230" width="12" height="50" rx="4" fill="#E2E0D8"/>
          <rect x="318" y="230" width="12" height="50" rx="4" fill="#E2E0D8"/>
          <!-- 책 -->
          <rect x="80" y="185" width="60" height="36" rx="4" fill="#2563EB" opacity=".85"/>
          <rect x="82" y="187" width="56" height="32" rx="3" fill="#1e3a8a"/>
          <text x="110" y="207" font-family="sans-serif" font-size="10" fill="#93c5fd" text-anchor="middle" font-weight="700">수학</text>
          <rect x="148" y="190" width="50" height="31" rx="4" fill="#F59E0B" opacity=".9"/>
          <text x="173" y="209" font-family="sans-serif" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">영어</text>
          <!-- 노트북 -->
          <rect x="220" y="170" width="120" height="52" rx="6" fill="#0D1B2A"/>
          <rect x="224" y="174" width="112" height="44" rx="4" fill="#1e3a8a"/>
          <line x1="248" y1="188" x2="308" y2="188" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
          <line x1="248" y1="198" x2="295" y2="198" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity=".6"/>
          <line x1="248" y1="208" x2="280" y2="208" stroke="#93c5fd" stroke-width="2" stroke-linecap="round" opacity=".4"/>
          <rect x="230" y="222" width="100" height="6" rx="3" fill="#0D1B2A" opacity=".5"/>
          <!-- 선생님 실루엣 -->
          <circle cx="155" cy="110" r="28" fill="#2563EB" opacity=".15"/>
          <circle cx="155" cy="98" r="18" fill="#0D1B2A"/>
          <ellipse cx="155" cy="140" rx="26" ry="20" fill="#0D1B2A"/>
          <text x="155" y="104" font-family="sans-serif" font-size="16" fill="#fff" text-anchor="middle">👩‍🏫</text>
          <!-- 학생 실루엣 -->
          <circle cx="270" cy="110" r="28" fill="#F59E0B" opacity=".15"/>
          <circle cx="270" cy="98" r="18" fill="#0D1B2A" opacity=".8"/>
          <ellipse cx="270" cy="140" rx="26" ry="20" fill="#0D1B2A" opacity=".8"/>
          <text x="270" y="104" font-family="sans-serif" font-size="16" fill="#fff" text-anchor="middle">👨‍🎓</text>
          <!-- 말풍선 -->
          <rect x="168" y="60" width="84" height="28" rx="8" fill="#2563EB"/>
          <polygon points="200,88 208,100 216,88" fill="#2563EB"/>
          <text x="210" y="79" font-family="sans-serif" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">1:1 맞춤 수업</text>
          <!-- 별점 -->
          <text x="110" y="165" font-family="sans-serif" font-size="13" fill="#F59E0B">★★★★★</text>
          <!-- 배지 -->
          <rect x="290" y="44" width="88" height="28" rx="14" fill="#10B981"/>
          <text x="334" y="62" font-family="sans-serif" font-size="10" fill="#fff" text-anchor="middle" font-weight="700">✓ 24h 매칭</text>
          <rect x="42" y="44" width="80" height="28" rx="14" fill="#F59E0B"/>
          <text x="82" y="62" font-family="sans-serif" font-size="10" fill="#0D1B2A" text-anchor="middle" font-weight="700">30분 무료체험</text>
        </svg>
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
          <div class="rev-avatar" style="background:linear-gradient(135deg,#2563EB,#1e3a8a)">김</div>
          <div><div class="rev-name">김○○ 학생 어머니</div><div class="rev-info">강남구 · 중3 · 수학</div></div>
        </div>
      </div>
      <div class="rev-card">
        <div class="rev-stars">★★★★★</div>
        <p class="rev-text">"영어 내신 성적이 확 올랐어요! 우리 학교 기출 문제를 꿰뚫고 계신 선생님 덕분에 시험 준비가 훨씬 수월해졌습니다. 매칭도 하루 만에 돼서 너무 좋았어요."</p>
        <div class="rev-author">
          <div class="rev-avatar" style="background:linear-gradient(135deg,#F59E0B,#d97706)">박</div>
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
.subj-hero{background:linear-gradient(135deg,#0D1B2A 0%,#1e3a6e 100%);color:#fff;padding:64px 20px 56px;text-align:center}
.subj-hero-emoji{font-size:56px;margin-bottom:16px}
.subj-hero h1{font-size:clamp(28px,5vw,44px);font-weight:800;margin:0 0 12px}
.subj-hero h1 em{color:#F59E0B;font-style:normal}
.subj-hero p{font-size:17px;opacity:.85;max-width:560px;margin:0 auto}
/* 시도 그리드 */
.sido-subj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;margin-top:36px}
.sido-subj-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:18px 16px;text-decoration:none;transition:.2s;display:block}
.sido-subj-card:hover{border-color:var(--acc);transform:translateY(-3px);box-shadow:var(--shadow-h)}
.sido-subj-top{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.sido-subj-name{font-size:17px;font-weight:700;color:var(--ink)}
.sido-badge{font-size:11px;padding:2px 7px;border-radius:10px;font-weight:600;background:#dbeafe;color:#1d4ed8}
.sido-badge-online{background:#fef3c7;color:#b45309}
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

${consultForm({
  leftTitle: `<em>${subject} 과외</em> 무료 상담 신청`,
  leftDesc: `지역과 학년을 알려주시면 24시간 내 ${subject} 전문 선생님을 연결해드립니다.`,
  leftPts: [`신청 후 24시간 내 ${subject} 선생님 매칭`, '첫 수업 30분 무료 체험', '내신·수능·학교별 맞춤 커리큘럼', '부담 없이 선생님 교체 가능'],
})}`;

  return layout({ head, body, keyword: `${subject}과외`, region: '' });
}
