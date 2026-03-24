import { buildHead, buildFAQSchema } from './seo.js';
import { layout, ctaBox, faqSection, consultForm } from './template.js';
import { SUBJECTS, GRADES, SIDO_DESC, VISIT_REGIONS, GU_DESC, DONG_DESC, stripSuffix, stripGuSuffix, ALL_REGIONS, ONLINE_DONG_MAP, sigunguSlug } from './data/regions.js';
import { DONG_SCHOOLS } from './data/schools.js';

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
  const title = `${keyword} | 1:1 전문 드림과외`;
  const description = [
    `${displayDong} ${grade || '초중고'} ${subject || '전과목'} 과외 전문.`,
    isVisit ? '방문·화상 모두 가능.' : '화상과외 가능.',
    `검증된 선생님 24시간 내 매칭. 첫 30분 무료 체험.`,
  ].join(' ');

  const url = `/${encodeURIComponent(keyword)}`;
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

  const v = getVariant(displayDong);
  const areaDesc = DONG_DESC[dong] || GU_DESC[gu] || `${gu}에 위치한 주거 지역입니다.`;
  const heroDescArr = [
    `${areaDesc} 드림과외는 ${displayDong} 인근에서 학생들을 지도해온 검증된 선생님을 연결해드립니다. ${gradeLabel} ${subjectLabel} 1:1 전문 과외로, ${visitText}`,
    `${areaDesc} ${displayDong} 학생들의 성적 향상을 위해 경험 있는 전문 선생님을 빠르게 매칭해드립니다. ${gradeLabel} ${subjectLabel} 과외로, ${visitText}`,
    `${areaDesc} 드림과외 선생님은 ${displayDong} 학교 내신 출제 경향을 파악하고 있습니다. ${gradeLabel} ${subjectLabel} 1:1 맞춤 수업으로, ${visitText}`,
  ];
  const heroDesc = heroDescArr[v];

  // 중간 섹션 순서 변형 (v에 따라 순환)
  const _secA = buildLearningSection(grade, subject, displayDong, nearSchoolName);
  const _secB = buildSubjectStudySection(subject, displayDong);
  const _secC = buildExamGuideSection(displayDong, nearSchoolName);
  const midSections = v === 0 ? [_secA, _secB, _secC] : v === 1 ? [_secC, _secA, _secB] : [_secB, _secC, _secA];

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
    <p class="sec-desc">
      ${displayDong} 학부모님들의 교육 관심에 부응해, 드림과외는 검증된 전문 선생님을 연결합니다.
      학생 수준과 목표에 맞는 맞춤 커리큘럼을 제공하며, ${gradeDetail}을 목표로 하는
      1:1 맞춤 수업으로 성적 향상을 함께 만들어드립니다.
    </p>
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
    <p class="sec-desc">
      복잡한 절차 없이 빠르고 간편하게 ${displayDong} 전문 선생님을 만나보세요.
      전화 한 통, 폼 작성 한 번으로 내 아이에게 꼭 맞는 선생님을 찾아드립니다.
    </p>
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
  leftPts: [
    '상담 후 24시간 내 선생님 매칭',
    '첫 30분 무료 체험 제공',
    `${displayDong} 학교별 내신 전문 선생님`,
    '맞춤 커리큘럼 제공',
  ],
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
  const title = `${keyword} | 드림과외`;
  const description = `${displayGu} ${grade || '초중고'} ${subject || '전과목'} 과외. 방문·화상 모두 가능. 검증된 선생님 24시간 매칭. 첫 30분 무료 체험.`;

  const url = `/${encodeURIComponent(keyword)}`;
  const head = buildHead({ title, description, url, type: 'local' });

  const dongs = ALL_REGIONS[sido]?.[gu] || [];

  const subjectLinks = Object.entries(SUBJECTS).map(([s, info]) =>
    `<a href="/${encodeURIComponent(displayGu + s + '과외')}">${subjectEmoji(info)} ${displayGu} ${s}과외</a>`
  ).join('');

  const gradeLinks = Object.entries(GRADES).map(([g, info]) =>
    `<a href="/${encodeURIComponent(displayGu + g + '과외')}">${displayGu} ${g}과외</a>`
  ).join('');

  const dongCards = dongs.map(d => {
    const ds = stripSuffix(d);
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
      드림과외는 단순한 과외 중개가 아닙니다. 30년+ 교육 노하우를 바탕으로
      검증된 전문 선생님을 ${displayGu} 지역 학생과 연결합니다.
      ${displayGu} 지역 학생들의 학습 특성에 맞는 맞춤 커리큘럼을 제공하며,
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
  const allGus = ALL_REGIONS[sido] ? Object.keys(ALL_REGIONS[sido]) : [];
  const allGuCards = allGus.map(gu => {
    const gd = stripGuSuffix(gu);
    return `<div class="card"><a href="/${encodeURIComponent(gd + (subject || '') + '과외')}">${gu} ${subject || ''}과외</a></div>`;
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

  // 과목별 링크
  const subjectLinks = Object.entries(SUBJECTS).map(([s, info]) =>
    `<a href="/${encodeURIComponent(shortName + s + '과외')}">${info.emoji} ${shortName} ${s}과외</a>`
  ).join('');

  // 관련 링크 (학교 → 동, 구)
  const relatedLinks = [
    `<a href="/${encodeURIComponent(displayDong + '과외')}">📍 ${displayDong} 과외 전체</a>`,
    ...Object.entries(SUBJECTS).map(([s]) =>
      `<a href="/${encodeURIComponent(displayDong + s + '과외')}">${displayDong} ${s}과외</a>`
    ),
    `<a href="/${encodeURIComponent(displayGu + '과외')}">${displayGu} 과외 전체</a>`,
  ].join('');

  const breadcrumb = [
    { label: sido },
    { label: gu, url: `/${encodeURIComponent(displayGu + '과외')}` },
    { label: dong, url: `/${encodeURIComponent(displayDong + '과외')}` },
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
    <h2 class="sec-title"><em>${displayDong}</em> 지역 과외 정보</h2>
    <p class="sec-desc">${schoolName}이 위치한 ${displayDong} 지역의 다른 과외 정보를 확인하세요.</p>
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

// ── 헬퍼: 지역명 기반 변형 인덱스 (0·1·2) ───────────────────
function getVariant(location) {
  let h = 0;
  for (let i = 0; i < location.length; i++) h += location.charCodeAt(i);
  return h % 3;
}

// ── 헬퍼: 학습 콘텐츠 섹션 생성 ─────────────────────────
function buildLearningSection(grade, subject, location, nearSchoolName = null) {
  const v = getVariant(location);
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
    <h2 class="sec-title">${location} 초등 과외 <em>학습 가이드</em></h2>
    <p class="sec-desc">${intro}</p>
    <div class="learning-grid">${cardsHtml(cards)}</div>
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
    const cards = [
      [
        { icon:'📝', title:'내신 집중 대비', desc:'학교별 기출 분석과 단원별 핵심 문제 유형을 집중적으로 다룹니다. 시험 전 2~3주 특별 관리를 제공합니다.' },
        { icon:'📋', title:'수행평가 관리', desc:'서술형·논술형 답안 작성법과 실험 보고서, 발표 자료 준비를 체계적으로 지도합니다.' },
        { icon:'📚', title:'공부 방법 코칭', desc:'과목별 효과적인 공부 방법을 알려드립니다. 오답 노트 활용과 복습 루틴을 함께 만들어드립니다.' },
        { icon:'🎯', title:'자기주도학습', desc:'선생님 없이도 스스로 공부하는 힘을 기릅니다. 계획 세우기, 집중력 향상, 시험 관리까지 함께 합니다.' },
      ],
      [
        { icon:'📝', title:'기출 경향 분석', desc:`${nearSchoolName ? nearSchoolName + ' 등 ' : ''}인근 학교의 출제 패턴을 분석하고 자주 나오는 유형을 집중 훈련합니다.` },
        { icon:'📋', title:'서술형·수행평가', desc:'서술형 답안 작성과 수행평가를 함께 준비합니다. 조건 충족과 핵심어 포함법을 반복 훈련합니다.' },
        { icon:'📚', title:'오답 분석 루틴', desc:'틀린 문제를 그냥 넘기지 않습니다. 오답 원인을 파악하고 같은 실수를 반복하지 않도록 관리합니다.' },
        { icon:'🎯', title:'시험 전 집중 관리', desc:'중간·기말 2~3주 전부터 시험 범위를 집중 정리하고 최종 점검합니다.' },
      ],
      [
        { icon:'📝', title:'단원별 핵심 정리', desc:'시험 범위의 핵심 개념을 단원별로 정리합니다. 분량이 많아도 우선순위를 정해 효율적으로 준비합니다.' },
        { icon:'📋', title:'수행평가 일정 관리', desc:'수행평가 마감을 미리 파악하고 준비 일정을 함께 잡습니다. 발표·보고서·실험 보고서 전 유형을 지도합니다.' },
        { icon:'📚', title:'복습 루틴 형성', desc:'배운 내용을 잊지 않도록 복습 주기를 만들어드립니다. 시험 직전 몰아서 공부하는 악순환을 끊어드립니다.' },
        { icon:'🎯', title:'취약 단원 보완', desc:'특히 약한 단원을 파악하고 집중적으로 보완합니다. 전체 점수를 끌어올리는 가장 효율적인 방법입니다.' },
      ],
    ][v];
    return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 중등 과외 <em>학습 가이드</em></h2>
    <p class="sec-desc">${intro}</p>
    <div class="learning-grid">${cardsHtml(cards)}</div>
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
    const cards = [
      [
        { icon:'🏫', title:'내신 + 수능 동시 대비', desc:'학교 교과서 기반 내신 대비와 수능 연계 학습을 병행합니다. 두 마리 토끼를 잡는 커리큘럼을 설계합니다.' },
        { icon:'🗂️', title:'학생부·수행평가 관리', desc:'학생부 기재 사항을 의식한 수행평가 준비와 세특(세부능력 및 특기사항) 활동을 지도합니다.' },
        { icon:'🎓', title:'입시 전략 안내', desc:'수시·정시 비중과 목표 대학에 맞는 학습 전략을 안내합니다. 진로에 따른 과목 선택도 함께 상담합니다.' },
        { icon:'📊', title:'과목별 공부 방법', desc:'수능 연계 교재 활용법, 모의고사 분석, 오답 정리까지 체계적인 학습 방법을 함께 만들어갑니다.' },
      ],
      [
        { icon:'🏫', title:'학교별 내신 분석', desc:`${nearSchoolName ? nearSchoolName + ' 등 ' : ''}${location} 고등학교의 출제 경향을 파악하고 빈출 유형을 집중적으로 준비합니다.` },
        { icon:'🗂️', title:'수행평가·학생부', desc:'수행평가 주제 선정부터 작성, 발표까지 단계별로 지도합니다. 학생부 세특 활동과도 연계합니다.' },
        { icon:'🎓', title:'수능 유형별 전략', desc:'수능 기출을 유형별로 분류하고 취약한 유형을 집중 훈련합니다. 모의고사 성적 분석도 함께 진행합니다.' },
        { icon:'📊', title:'시험 일정 통합 관리', desc:'내신·수능·모의고사 일정을 통합해 월별 학습 계획을 세웁니다. 중요한 시험을 빠짐없이 준비합니다.' },
      ],
      [
        { icon:'🏫', title:'내신·수능 통합 관리', desc:'내신과 수능이 겹치는 범위를 함께 학습합니다. 별도 준비 시간 없이 효율적으로 두 시험을 대비합니다.' },
        { icon:'🗂️', title:'학생부 관리', desc:'수행평가, 세특, 동아리 등 학생부 전반을 관리합니다. 수시 전형에서 경쟁력 있는 학생부를 만들어드립니다.' },
        { icon:'🎓', title:'입시 정보 안내', desc:'수시·정시 등 목표에 맞는 입시 경로를 안내합니다. 불필요한 혼란 없이 학습에 집중할 수 있도록 돕습니다.' },
        { icon:'📊', title:'모의고사 분석', desc:'모의고사 결과를 과목별·유형별로 분석합니다. 어디서 점수를 더 올릴 수 있는지 구체적인 방향을 찾습니다.' },
      ],
    ][v];
    return `
<section class="sec sec-wh">
  <div class="wrap">
    <span class="sec-label">LEARNING GUIDE</span>
    <h2 class="sec-title">${location} 고등 과외 <em>학습 가이드</em></h2>
    <p class="sec-desc">${intro}</p>
    <div class="learning-grid">${cardsHtml(cards)}</div>
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
    <h2 class="sec-title">${location} 과외 <em>학년별 학습 가이드</em></h2>
    <p class="sec-desc">${allIntro}</p>
    <h3 style="font-family:'Gmarket Sans',sans-serif;font-size:17px;font-weight:700;color:var(--ink);margin:0 0 10px">🌱 초등 과외 — 기초와 학습 습관 형성</h3>
    <p style="color:var(--muted);font-size:13px;line-height:1.8;margin-bottom:14px;word-break:keep-all">초등 시기는 학습 습관과 기초 학력의 토대를 만드는 중요한 단계입니다. 드림과외는 아이의 흥미를 살리면서 자기주도학습 능력을 함께 키워드립니다.</p>
    <div class="learning-grid" style="margin-bottom:32px">
      <div class="learning-card"><span class="learning-icon">📖</span><h3>기초 학력 강화</h3><p>학교 교과서 중심으로 개념을 탄탄하게 다집니다. 모르는 부분을 즉시 바로잡아 학교 수업에 자신감을 갖게 해드립니다.</p></div>
      <div class="learning-card"><span class="learning-icon">🌱</span><h3>학습 습관 형성</h3><p>스스로 예습·복습하는 루틴을 만들어드립니다. 숙제 관리와 계획 세우기를 선생님과 함께 연습합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">✏️</span><h3>수행평가 대비</h3><p>학교별 수행평가 기준에 맞춰 과제, 발표, 보고서 작성을 꼼꼼히 준비합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">😊</span><h3>과목 흥미 유발</h3><p>눈높이에 맞는 설명으로 과목에 흥미와 자신감을 심어드립니다. 싫어하는 과목도 재미있게 접근합니다.</p></div>
    </div>
    <h3 style="font-family:'Gmarket Sans',sans-serif;font-size:17px;font-weight:700;color:var(--ink);margin:0 0 10px">📝 중등 과외 — 내신과 수행평가 집중 관리</h3>
    <p style="color:var(--muted);font-size:13px;line-height:1.8;margin-bottom:14px;word-break:keep-all">${midIntro}</p>
    <div class="learning-grid" style="margin-bottom:32px">
      <div class="learning-card"><span class="learning-icon">📝</span><h3>내신 집중 대비</h3><p>학교별 기출 분석과 단원별 핵심 문제 유형을 집중적으로 다룹니다. 시험 전 2~3주 특별 관리를 제공합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">📋</span><h3>수행평가 관리</h3><p>서술형·논술형 답안 작성법과 실험 보고서, 발표 자료 준비를 체계적으로 지도합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">📚</span><h3>공부 방법 코칭</h3><p>과목별 효과적인 공부 방법을 알려드립니다. 오답 노트 활용과 복습 루틴을 함께 만들어드립니다.</p></div>
      <div class="learning-card"><span class="learning-icon">🎯</span><h3>자기주도학습</h3><p>선생님 없이도 스스로 공부하는 힘을 기릅니다. 계획 세우기, 집중력 향상, 시험 관리까지 함께 합니다.</p></div>
    </div>
    <h3 style="font-family:'Gmarket Sans',sans-serif;font-size:17px;font-weight:700;color:var(--ink);margin:0 0 10px">🎓 고등 과외 — 내신·수능 동시 대비</h3>
    <p style="color:var(--muted);font-size:13px;line-height:1.8;margin-bottom:14px;word-break:keep-all">${highIntro}</p>
    <div class="learning-grid">
      <div class="learning-card"><span class="learning-icon">🏫</span><h3>내신 + 수능 병행</h3><p>학교 교과서 기반 내신 대비와 수능 연계 학습을 병행합니다. 두 마리 토끼를 잡는 커리큘럼을 설계합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">🗂️</span><h3>학생부·수행평가 관리</h3><p>학생부 기재 사항을 의식한 수행평가 준비와 세특(세부능력 및 특기사항) 활동을 지도합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">🎓</span><h3>입시 전략 안내</h3><p>수시·정시 비중과 목표 대학에 맞는 학습 전략을 안내합니다. 진로에 따른 과목 선택도 상담합니다.</p></div>
      <div class="learning-card"><span class="learning-icon">📊</span><h3>모의고사 분석</h3><p>수능 연계 교재 활용법, 모의고사 결과 분석, 취약 단원 집중 보완까지 체계적으로 관리합니다.</p></div>
    </div>
    ${subjectBlock}
  </div>
</section>`;
}

// ── 헬퍼: 과목별 상세 학습법 섹션 ────────────────────────
function buildSubjectStudySection(subject, location) {
  const v = getVariant(location);
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
    <h2 class="sec-title">${location} <em>${subject} 과외</em> 학습 방법</h2>
    <p class="sec-desc">${m.intros[v]}</p>
    <div class="str-grid">
      ${m.items.map(item => `<div class="str-card">
        <span class="str-icon">${item.icon}</span>
        <h3>${item.title}</h3>
        <p>${item.desc}</p>
      </div>`).join('')}
    </div>
  </div>
</section>`;
}

// ── 헬퍼: 내신·수능·수행평가 가이드 섹션 ───────────────────
function buildExamGuideSection(location, nearSchoolName = null) {
  const v = getVariant(location);
  const schoolRef = nearSchoolName || `${location} 인근`;
  const intros = [
    `드림과외는 정기고사, 수행평가, 수능까지 학생의 모든 시험을 함께 준비합니다. ${location} 학교 일정에 맞춰 체계적인 학습 계획을 수립합니다.`,
    `시험마다 준비 방법이 다릅니다. 드림과외는 ${schoolRef} 학교의 내신 기출 경향을 파악하고, 학생 개개인의 일정에 맞는 준비 계획을 함께 세웁니다.`,
    `내신과 수능을 따로 준비하면 시간이 부족합니다. 드림과외는 ${location} 학교 내신 범위와 수능 연계 내용을 통합해 효율적으로 관리합니다.`,
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
  ];
  return `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">EXAM GUIDE</span>
    <h2 class="sec-title">${location} <em>내신·수능·수행평가</em> 대비</h2>
    <p class="sec-desc">${intros[v]}</p>
    <div class="str-grid">
      ${cardSets[v].map(c => `<div class="str-card"><span class="str-icon">${c.icon}</span><h3>${c.title}</h3><p>${c.desc}</p></div>`).join('')}
    </div>
  </div>
</section>`;
}

// ── 헬퍼: 지역 차별화 섹션 ─────────────────────────────
function buildLocalAreaSection(dong, displayDong, gu, nearSchoolName, isVisit) {
  const areaDesc = DONG_DESC[dong] || `${gu}에 위치한 주거 지역입니다.`;
  const visitCard = isVisit
    ? `<div class="str-card"><span class="str-icon">🏠</span><h3>방문·화상과외 모두 가능</h3><p>${displayDong} 지역은 학생 자택 방문과외와 화상과외를 모두 선택할 수 있습니다. 상황에 따라 유연하게 변경도 가능합니다.</p></div>`
    : `<div class="str-card"><span class="str-icon">💻</span><h3>화상과외로 진행</h3><p>${displayDong} 지역은 화상과외로 진행됩니다. 이동 시간 없이 집에서 전문 선생님과 1:1 수업이 가능합니다.</p></div>`;
  const schoolCard = nearSchoolName
    ? `<div class="str-card"><span class="str-icon">🏫</span><h3>${nearSchoolName} 내신 대비</h3><p>${nearSchoolName} 학생의 내신 준비를 도와드립니다. 학교 교과서 기반 수업과 서술형·수행평가 대비를 함께 진행합니다.</p></div>`
    : `<div class="str-card"><span class="str-icon">📋</span><h3>${gu} 학교 내신 대비</h3><p>${gu} 인근 학교의 내신 출제 경향에 맞춘 수업을 진행합니다. 학교 교과서와 기출 문제를 중심으로 준비합니다.</p></div>`;

  return `
<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">LOCAL INFO</span>
    <h2 class="sec-title">${displayDong} <em>지역 안내</em></h2>
    <p class="sec-desc">${areaDesc}</p>
    <div class="str-grid">
      <div class="str-card">
        <span class="str-icon">📍</span>
        <h3>${displayDong} 위치</h3>
        <p>${gu}에 위치한 ${displayDong} 지역 학생을 위해 드림과외 선생님을 연결해드립니다.</p>
      </div>
      ${visitCard}
      ${schoolCard}
      <div class="str-card">
        <span class="str-icon">📅</span>
        <h3>유연한 수업 일정</h3>
        <p>학생과 학부모님의 일정에 맞춰 주 1~5회, 1회 1~2시간으로 수업 일정을 조율합니다.</p>
      </div>
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
    canonical:   `/${encodeURIComponent(keyword)}`,
    keywords:    `${displayName} 과외, ${displayName} 화상과외, ${displayName} 온라인과외, ${subjectLabel} 과외`,
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
    const sigungus = Object.keys(ALL_REGIONS[sido] || {});
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
    const dongs = ALL_REGIONS[sido]?.[sigungu] || [];
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
        const slug = subject ? `${d}${subject}과외` : `${d}과외`;
        return `<div class="card"><a href="/${encodeURIComponent(slug)}">${d} 과외</a></div>`;
      }).join('')}
    </div>
  </div>
</section>`);
    }
  } else {
    const sg_slug = sigunguSlug(sido, sigungu);
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
  const description = '초·중·고 전 과목 1:1 맞춤 과외. 검증된 선생님을 24시간 내 매칭. 방문·화상과외 모두 가능. 첫 30분 무료 체험. 전국 어디서나 드림과외.';
  const url = '/';
  const head = buildHead({ title, description, url, type: 'local' });

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
.subj-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--radius);padding:22px 16px;text-align:center;cursor:pointer;transition:.2s;border:none;font-family:inherit;width:100%}
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
</style>

<!-- HERO -->
<section class="page-hero">
  <div class="wrap page-hero-in">
    <div class="region-badge">📍 전국 서비스</div>
    <h1 class="page-h1">내 아이에게 딱 맞는<br><em>선생님을 만나세요</em></h1>
    <p class="page-desc">
      지역·학교·과목에 맞는 검증된 전문 선생님을 연결해드립니다.<br>
      초·중·고 전 과목 1:1 맞춤 과외. 방문·화상 모두 가능하며, 신청 후 24시간 내 매칭 완료.
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
    <p class="sec-desc">30년 교육 노하우와 검증된 선생님으로 확실한 성적 향상을 만들어드립니다.</p>
    <div class="str-grid">
      <div class="str-card"><span class="str-icon">📚</span><div class="str-num">30<span>년+</span></div><h3>교육 노하우</h3><p>30년 이상 쌓아온 교육 경험으로 과목별 최적 커리큘럼 제공</p></div>
      <div class="str-card"><span class="str-icon">👩‍🏫</span><div class="str-num">2,000<span>명+</span></div><h3>전문 선생님</h3><p>지역별·과목별 전문 선생님 다수 보유. 내신·수능 전문 튜터</p></div>
      <div class="str-card"><span class="str-icon">👨‍👩‍👧</span><div class="str-num">100<span>만+</span></div><h3>누적 회원</h3><p>전국 학부모·학생이 선택한 과외 매칭 플랫폼</p></div>
      <div class="str-card"><span class="str-icon">⚡</span><div class="str-num">24<span>시간</span></div><h3>빠른 매칭</h3><p>신청 후 24시간 이내 최적 선생님을 연결해드립니다</p></div>
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
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🔢</span><div class="subj-name">수학</div><div class="subj-desc">중·고등 전 과정</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🔤</span><div class="subj-name">영어</div><div class="subj-desc">내신·수능·회화</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">📖</span><div class="subj-name">국어</div><div class="subj-desc">독서·문학·문법</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🔬</span><div class="subj-name">과학</div><div class="subj-desc">물·화·생·지</div></button>
      <button class="subj-card" onclick="openModal()"><span class="subj-icon">🌏</span><div class="subj-name">사회/역사</div><div class="subj-desc">내신 집중</div></button>
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
      <a href="/경남과외" class="rgn-card"><span class="rgn-icon">🏞️</span><div class="rgn-name">경남</div><div class="rgn-sub">창원·진주 등</div></a>
    </div>
    <p style="text-align:center;margin-top:20px;font-size:13px;color:var(--muted)">※ 방문과외는 지역별로 가능 여부가 다르며, 전국 화상과외는 어디서나 가능합니다.</p>
  </div>
</section>

<!-- HOW IT WORKS -->
<section class="sec sec-bg" id="how">
  <div class="wrap">
    <span class="sec-label">HOW IT WORKS</span>
    <h2 class="sec-title">딱 <em>4단계</em>로 시작하세요</h2>
    <p class="sec-desc">복잡한 절차 없이 빠르고 간단하게 선생님을 만나보세요.</p>
    <div class="step-grid">
      <div class="step-item">
        <div class="step-circle">1</div>
        <h3>상담 신청</h3>
        <p>이름·연락처·과목을 입력하고 무료 상담을 신청하세요</p>
      </div>
      <div class="step-item">
        <div class="step-circle">2</div>
        <h3>선생님 매칭</h3>
        <p>24시간 내 지역·과목·학교에 맞는 최적 선생님 연결</p>
      </div>
      <div class="step-item">
        <div class="step-circle">3</div>
        <h3>무료 체험수업</h3>
        <p>첫 수업 30분 무료 체험 후 선생님 수업 방식을 확인하세요</p>
      </div>
      <div class="step-item">
        <div class="step-circle">4</div>
        <h3>성적 향상</h3>
        <p>체계적인 1:1 수업으로 확실한 성적 향상을 경험하세요</p>
      </div>
    </div>
  </div>
</section>

<!-- REVIEWS -->
<section class="sec sec-wh" id="reviews">
  <div class="wrap">
    <span class="sec-label">REVIEWS</span>
    <h2 class="sec-title">수강생 <em>생생 후기</em></h2>
    <p class="sec-desc">드림과외를 경험한 학생과 학부모님의 실제 이야기입니다.</p>
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
