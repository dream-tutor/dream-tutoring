import { SCHOOLS, SCHOOL_TYPE, BY_DONG, BY_SIGUNGU, BY_SIDO } from '../schools.js';
import { SIDO, SIDO_DESC, VISIT_SIGUNGU, SUBJECTS } from '../regions.js';

const PHONE      = '01048645345';
const SITE       = 'https://dreamtutor.kr/schools';
const MAIN_SITE  = 'https://dreamtutor.kr';

// ── 라우터 ────────────────────────────────────────────
export default {
  async fetch(request) {
    const url  = new URL(request.url);
    // /schools 접두사 제거 후 라우팅
    const path = decodeURIComponent(url.pathname.replace(/^\/schools/, '').replace(/\/+$/, '') || '/');

    // /school/:id
    const schoolM = path.match(/^\/school\/([A-Z]\d{9})$/i);
    if (schoolM) return html(renderSchoolPage(schoolM[1].toUpperCase()));

    // /sido/:sido
    const sidoM = path.match(/^\/sido\/(.+)$/);
    if (sidoM) return html(renderSidoPage(sidoM[1]));

    // /sigungu/:sido/:sigungu
    const sigunguM = path.match(/^\/sigungu\/([^/]+)\/(.+)$/);
    if (sigunguM) return html(renderSigunguPage(sigunguM[1], decodeURIComponent(sigunguM[2])));

    // /search
    if (path === '/search') return html(renderSearchPage(url.searchParams.get('q') || ''));

    // /
    if (path === '/' || path === '') return html(renderHomePage());

    return new Response('페이지를 찾을 수 없습니다.', { status: 404 });
  },
};

function html(body) {
  return new Response(body, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' },
  });
}

// ── 공통 HTML 쉘 ──────────────────────────────────────
function shell({ title, description, canonical, body }) {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:type" content="website">
<style>
:root{--pri:#2563EB;--ink:#111827;--muted:#6B7280;--bg:#F9FAFB;--wh:#fff;--radius:14px}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Apple SD Gothic Neo','Pretendard',sans-serif;color:var(--ink);background:var(--bg);line-height:1.6}
a{color:inherit;text-decoration:none}
em{color:var(--pri);font-style:normal}
.wrap{max-width:1080px;margin:0 auto;padding:0 20px}

/* 헤더 */
header{background:var(--wh);border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:100}
.hdr{display:flex;align-items:center;justify-content:space-between;height:60px;gap:16px}
.logo{font-size:18px;font-weight:800;color:var(--pri)}
.hdr-search{flex:1;max-width:340px;position:relative}
.hdr-search input{width:100%;padding:8px 36px 8px 14px;border:1.5px solid #d1d5db;border-radius:999px;font-size:14px;outline:none}
.hdr-search input:focus{border-color:var(--pri)}
.hdr-search button{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);font-size:16px}
.btn-cta{background:var(--pri);color:#fff;padding:8px 18px;border-radius:999px;font-size:14px;font-weight:600;border:none;cursor:pointer;white-space:nowrap}
.btn-tel{color:var(--pri);border:1.5px solid var(--pri);padding:7px 14px;border-radius:999px;font-size:14px;font-weight:600}

/* 히어로 */
.hero{background:linear-gradient(135deg,#1e3a8a 0%,#2563EB 100%);color:#fff;padding:56px 0 48px}
.hero h1{font-size:clamp(22px,4vw,36px);font-weight:800;line-height:1.3;margin-bottom:12px}
.hero h1 em{color:#93C5FD}
.hero p{font-size:16px;opacity:.9;max-width:560px;margin-bottom:28px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap}
.hero-btns .btn-main{background:#fff;color:var(--pri);padding:14px 28px;border-radius:999px;font-weight:700;font-size:15px;border:none;cursor:pointer}
.hero-btns .btn-sub{border:2px solid rgba(255,255,255,.6);color:#fff;padding:13px 24px;border-radius:999px;font-weight:600;font-size:15px}
.bc{background:#f3f4f6;border-bottom:1px solid #e5e7eb;padding:8px 0;font-size:12px;color:var(--muted)}
.bc a{color:var(--pri)}.bc span{margin:0 6px}

/* 섹션 */
.sec{padding:52px 0}
.sec-bg{background:#EFF6FF}
.sec-label{font-size:11px;font-weight:700;letter-spacing:.1em;color:var(--pri);text-transform:uppercase;display:block;margin-bottom:8px}
.sec-title{font-size:clamp(20px,3vw,28px);font-weight:800;margin-bottom:12px}
.sec-desc{color:var(--muted);font-size:15px;max-width:600px;margin-bottom:32px}

/* 학교 정보 카드 */
.school-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px;margin-bottom:32px}
.info-card{background:var(--wh);border:1px solid #e5e7eb;border-radius:var(--radius);padding:20px;text-align:center}
.info-card .ic-label{font-size:12px;color:var(--muted);margin-bottom:6px}
.info-card .ic-value{font-size:18px;font-weight:700;color:var(--ink)}
.badge-type{display:inline-block;padding:4px 12px;border-radius:999px;font-size:13px;font-weight:600}
.badge-0{background:#DBEAFE;color:#1D4ED8}   /* 초등 */
.badge-1{background:#D1FAE5;color:#065F46}   /* 중등 */
.badge-2{background:#FEE2E2;color:#991B1B}   /* 고등 */

/* 과목 링크 그리드 */
.subject-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
@media(max-width:480px){.subject-grid{grid-template-columns:repeat(2,1fr)}}
.subj-card{background:var(--wh);border:1.5px solid #e5e7eb;border-radius:var(--radius);padding:18px 14px;text-align:center;transition:.2s}
.subj-card:hover{border-color:var(--pri);background:#EFF6FF}
.subj-card .s-emoji{font-size:28px;display:block;margin-bottom:8px}
.subj-card .s-name{font-size:14px;font-weight:700}

/* 학교 카드 그리드 */
.school-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
.sc-card{background:var(--wh);border:1px solid #e5e7eb;border-radius:var(--radius);padding:18px;display:flex;flex-direction:column;gap:8px;transition:.2s}
.sc-card:hover{border-color:var(--pri);box-shadow:0 4px 16px rgba(37,99,235,.1)}
.sc-card .sc-name{font-size:15px;font-weight:700}
.sc-card .sc-loc{font-size:12px;color:var(--muted)}

/* 폼 */
.form-wrap{background:var(--wh);border-radius:20px;padding:32px;max-width:520px;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.form-wrap h3{font-size:18px;font-weight:700;margin-bottom:20px}
.fg{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.fg label{font-size:13px;font-weight:600;color:var(--ink)}
.fg label span{color:#EF4444}
.fi{border:1.5px solid #d1d5db;border-radius:10px;padding:10px 14px;font-size:15px;outline:none;width:100%}
.fi:focus{border-color:var(--pri)}
.fs{border:1.5px solid #d1d5db;border-radius:10px;padding:10px 14px;font-size:15px;outline:none;width:100%;background:#fff}
.fsub{width:100%;background:var(--pri);color:#fff;border:none;border-radius:12px;padding:14px;font-size:16px;font-weight:700;cursor:pointer;margin-top:4px}

/* 검색 결과 */
.search-input-wrap{max-width:560px;margin:0 auto 40px;position:relative}
.search-input-wrap input{width:100%;padding:16px 56px 16px 20px;border:2px solid var(--pri);border-radius:999px;font-size:16px;outline:none}
.search-input-wrap button{position:absolute;right:16px;top:50%;transform:translateY(-50%);background:var(--pri);border:none;color:#fff;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:16px}
.result-list{display:flex;flex-direction:column;gap:12px}
.result-item{background:var(--wh);border:1px solid #e5e7eb;border-radius:var(--radius);padding:16px 20px;display:flex;justify-content:space-between;align-items:center;transition:.2s}
.result-item:hover{border-color:var(--pri)}
.result-item .ri-name{font-size:15px;font-weight:700}
.result-item .ri-loc{font-size:13px;color:var(--muted);margin-top:2px}
.result-item .ri-btn{background:var(--pri);color:#fff;padding:7px 16px;border-radius:999px;font-size:13px;font-weight:600;white-space:nowrap}

/* 지역 허브 */
.sido-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px}
.sido-card{background:var(--wh);border:1px solid #e5e7eb;border-radius:var(--radius);padding:18px;text-align:center;transition:.2s;font-weight:600}
.sido-card:hover{border-color:var(--pri);color:var(--pri)}

/* 모달 */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}
.modal-ov.open{display:flex}
.modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto}
.modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.modal-close{background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)}

/* 유틸 */
.tag{display:inline-block;padding:4px 10px;background:#EFF6FF;color:var(--pri);border-radius:999px;font-size:12px;font-weight:600;margin:3px}
.link-list{display:flex;flex-wrap:wrap;gap:10px}
.link-list a{background:var(--wh);border:1px solid #e5e7eb;border-radius:999px;padding:7px 16px;font-size:13px;font-weight:600;transition:.2s}
.link-list a:hover{background:var(--pri);color:#fff;border-color:var(--pri)}
footer{background:#111827;color:#9CA3AF;padding:32px 0;font-size:13px;text-align:center}
footer a{color:#9CA3AF}footer b{color:#fff}

@media(max-width:640px){.school-grid{grid-template-columns:1fr}.subject-grid{grid-template-columns:repeat(2,1fr)}}
</style>
</head>
<body>
<header>
  <div class="wrap hdr">
    <a class="logo" href="${SITE}/">드림<em>과외</em></a>
    <form class="hdr-search" action="${SITE}/search" method="get">
      <input name="q" type="search" placeholder="학교명 검색...">
      <button type="submit">🔍</button>
    </form>
    <div style="display:flex;gap:8px;align-items:center">
      <a class="btn-tel" href="tel:${PHONE}">📞 전화</a>
      <button class="btn-cta" onclick="openModal()">무료 상담</button>
    </div>
  </div>
</header>

${body}

<footer>
  <div class="wrap">
    <b>드림과외</b> · 전국 1:1 전문 과외 · <a href="tel:${PHONE}">${PHONE}</a><br><br>
    <a href="${MAIN_SITE}">드림과외 홈</a> · <a href="${SITE}/">학교별 과외</a> · <a href="${SITE}/search">학교 검색</a>
  </div>
</footer>

<div class="modal-ov" id="mOv" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-hdr">
      <span style="font-weight:700;font-size:16px">📋 무료 상담 신청</span>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form onsubmit="submitForm(event)">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="fg"><label>이름 <span>*</span></label><input class="fi" name="이름" required placeholder="홍길동"></div>
        <div class="fg"><label>연락처 <span>*</span></label><input class="fi" name="연락처" type="tel" required placeholder="010-0000-0000"></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="fg"><label>학년 <span>*</span></label>
          <select class="fs" name="학년" required>
            <option value="">선택</option>
            <option>초등 1~3학년</option><option>초등 4~6학년</option>
            <option>중학교 1학년</option><option>중학교 2학년</option><option>중학교 3학년</option>
            <option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option>
          </select>
        </div>
        <div class="fg"><label>희망 과목 <span>*</span></label>
          <select class="fs" name="과목" required>
            <option value="">선택</option>
            <option>수학</option><option>영어</option><option>국어</option>
            <option>과학</option><option>사회</option><option>한국사</option>
          </select>
        </div>
      </div>
      <div class="fg"><label>재학 학교</label><input class="fi" name="학교" id="modalSchool" placeholder=""></div>
      <div class="fg"><label>거주 지역</label><input class="fi" name="지역" id="modalRegion" placeholder="예: 광명시 철산동"></div>
      <div class="fg"><label>문의내용</label><textarea class="fi" name="문의내용" rows="3" placeholder="궁금한 점을 자유롭게 작성해 주세요."></textarea></div>
      <button type="submit" class="fsub">✍️ 무료 상담 신청하기</button>
    </form>
  </div>
</div>

<script>
function openModal(school,region){
  document.getElementById('mOv').classList.add('open');
  document.body.style.overflow='hidden';
  if(school) document.getElementById('modalSchool').value=school;
  if(region) document.getElementById('modalRegion').value=region;
}
function closeModal(){document.getElementById('mOv').classList.remove('open');document.body.style.overflow='';}
function submitForm(e){
  e.preventDefault();
  // TODO: 웹훅 연동 시 여기에 fetch 추가
  closeModal();
  alert('상담 신청이 완료됐습니다!\\n📞 ${PHONE} 으로 곧 연락드립니다.');
  e.target.reset();
}
</script>
</body>
</html>`;
}

// ── 학교 상세 페이지 ──────────────────────────────────
function renderSchoolPage(schoolId) {
  const school = SCHOOLS[schoolId];
  if (!school) return shell({
    title: '학교를 찾을 수 없습니다 | 드림과외',
    description: '요청하신 학교 정보를 찾을 수 없습니다.',
    canonical: `${SITE}/school/${schoolId}`,
    body: `<div class="wrap" style="padding:80px 20px;text-align:center"><h1>학교를 찾을 수 없습니다</h1><a href="${SITE}/">← 홈으로</a></div>`,
  });

  const [name, typeIdx, sidoIdx, sigungu, dong] = school;
  const typeName  = SCHOOL_TYPE[typeIdx];
  const sidoName  = SIDO[sidoIdx];
  const isVisit   = !!(VISIT_SIGUNGU[sidoName]?.includes(sigungu));
  const visitText = isVisit ? '방문·화상 모두 가능' : '화상과외 가능';

  // 같은 동의 다른 학교
  const nearbySameType = (BY_DONG[dong] || [])
    .filter(id => id !== schoolId && SCHOOLS[id]?.[1] === typeIdx)
    .slice(0, 6);

  // 같은 시군구의 같은 종류 학교
  const nearbyOther = (BY_SIGUNGU[sigungu] || [])
    .filter(id => id !== schoolId && !nearbySameType.includes(id) && SCHOOLS[id]?.[1] === typeIdx)
    .slice(0, 8);

  const subjectCards = SUBJECTS.map(s => `
    <a class="subj-card" href="${MAIN_SITE}/${encodeURIComponent(dong + s + '과외')}">
      <span class="s-emoji">${subjectEmoji(s)}</span>
      <span class="s-name">${name} ${s}과외</span>
    </a>`).join('');

  const nearbyCards = [...nearbySameType, ...nearbyOther].map(id => {
    const sc = SCHOOLS[id];
    if (!sc) return '';
    return `<a class="sc-card" href="${SITE}/school/${id}">
      <span class="badge-type badge-${sc[1]}">${SCHOOL_TYPE[sc[1]]}</span>
      <span class="sc-name">${esc(sc[0])}</span>
      <span class="sc-loc">📍 ${esc(sc[3])} ${esc(sc[4])}</span>
    </a>`;
  }).join('');

  const title       = `${name} 과외 | 내신 대비 1:1 전문 드림과외`;
  const description = `${name} 학생 전문 과외. ${sigungu} ${dong} 위치. ${visitText}. 검증된 선생님 24시간 내 매칭, 첫 수업 무료.`;

  const bc = `<div class="bc"><div class="wrap bc-in">
    <a href="${SITE}/">홈</a><span>›</span>
    <a href="${SITE}/sido/${encodeURIComponent(sidoName)}">${sidoName}</a><span>›</span>
    <a href="${SITE}/sigungu/${encodeURIComponent(sidoName)}/${encodeURIComponent(sigungu)}">${sigungu}</a><span>›</span>
    ${esc(name)}
  </div></div>`;

  const body = `
${bc}
<section class="hero">
  <div class="wrap">
    <span class="tag">${visitText}</span>
    <h1>${esc(name)} <em>과외</em></h1>
    <p>${sigungu} ${dong}에 위치한 ${typeName}입니다.<br>
    드림과외는 ${name} 내신 출제 경향을 파악한 검증된 선생님을 24시간 내 매칭해드립니다.</p>
    <div class="hero-btns">
      <button class="btn-main" onclick="openModal('${esc(name)}','${esc(sigungu + ' ' + dong)}')">✍️ 무료 상담 신청</button>
      <a class="btn-sub" href="tel:${PHONE}">📞 전화 상담</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <span class="sec-label">SCHOOL INFO</span>
    <h2 class="sec-title">${esc(name)} <em>학교 정보</em></h2>
    <div class="school-info-grid">
      <div class="info-card">
        <div class="ic-label">학교 종류</div>
        <div class="ic-value"><span class="badge-type badge-${typeIdx}">${typeName}</span></div>
      </div>
      <div class="info-card">
        <div class="ic-label">지역</div>
        <div class="ic-value">${esc(sidoName)} ${esc(sigungu)}</div>
      </div>
      <div class="info-card">
        <div class="ic-label">소재지</div>
        <div class="ic-value">${esc(dong)}</div>
      </div>
      <div class="info-card">
        <div class="ic-label">수업 방식</div>
        <div class="ic-value">${isVisit ? '방문+화상' : '화상과외'}</div>
      </div>
    </div>
    <p style="color:var(--muted);font-size:14px">
      ✅ 24시간 내 선생님 매칭 &nbsp;|&nbsp; ✅ 첫 수업 100% 무료 &nbsp;|&nbsp; ✅ 부담 없이 선생님 교체
    </p>
  </div>
</section>

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SUBJECTS</span>
    <h2 class="sec-title">${esc(name)} <em>과목별 과외</em></h2>
    <p class="sec-desc">수학·영어·국어·과학 등 전 과목 1:1 맞춤 과외를 제공합니다.</p>
    <div class="subject-grid">${subjectCards}</div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <span class="sec-label">WHY DREAMTUTOR</span>
    <h2 class="sec-title">${esc(name)}에서 <em>드림과외</em>를 선택하는 이유</h2>
    <p class="sec-desc">
      드림과외 선생님은 ${name} 학교의 내신 출제 경향과 수행평가 기준을 파악하고 있습니다.
      학교 교과서와 기출문제를 중심으로 맞춤 커리큘럼을 설계해 성적 향상을 이끌어냅니다.
    </p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px">
      ${[
        ['🏆','내신 전문','학교별 기출 분석과 시험 유형 파악으로 내신 점수를 집중 관리합니다.'],
        ['⚡','24시간 매칭','상담 신청 후 24시간 내 최적의 선생님을 연결해드립니다.'],
        ['🎁','첫 수업 무료','부담 없이 체험 후 결정하세요. 선생님 교체도 자유롭습니다.'],
        ['📋','수행평가 대비','서술형·수행평가 준비를 함께 진행합니다.'],
      ].map(([ic, t, d]) => `<div class="info-card" style="text-align:left">
        <div style="font-size:28px;margin-bottom:8px">${ic}</div>
        <div style="font-weight:700;margin-bottom:6px">${t}</div>
        <div style="font-size:13px;color:var(--muted)">${d}</div>
      </div>`).join('')}
    </div>
  </div>
</section>

${nearbyCards ? `<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">NEARBY SCHOOLS</span>
    <h2 class="sec-title">${esc(sigungu)} <em>근처 학교</em></h2>
    <p class="sec-desc">같은 지역 다른 학교의 과외 정보도 확인하세요.</p>
    <div class="school-grid">${nearbyCards}</div>
  </div>
</section>` : ''}

<section class="sec">
  <div class="wrap">
    <span class="sec-label">CONSULT</span>
    <h2 class="sec-title">${esc(name)} <em>무료 상담 신청</em></h2>
    <p class="sec-desc">지금 바로 신청하시면 24시간 내 담당자가 연락드립니다.</p>
    <div class="form-wrap">
      <h3>📋 무료 상담 신청</h3>
      <form onsubmit="submitForm(event)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="fg"><label>이름 <span>*</span></label><input class="fi" name="이름" required placeholder="홍길동"></div>
          <div class="fg"><label>연락처 <span>*</span></label><input class="fi" name="연락처" type="tel" required placeholder="010-0000-0000"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="fg"><label>학년 <span>*</span></label>
            <select class="fs" name="학년" required>
              <option value="">선택</option>
              <option>초등 1~3학년</option><option>초등 4~6학년</option>
              <option>중학교 1학년</option><option>중학교 2학년</option><option>중학교 3학년</option>
              <option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option>
            </select>
          </div>
          <div class="fg"><label>희망 과목 <span>*</span></label>
            <select class="fs" name="과목" required>
              <option value="">선택</option>
              <option>수학</option><option>영어</option><option>국어</option>
              <option>과학</option><option>사회</option><option>한국사</option>
            </select>
          </div>
        </div>
        <div class="fg"><label>재학 학교</label><input class="fi" name="학교" value="${esc(name)}" placeholder=""></div>
        <div class="fg"><label>거주 지역</label><input class="fi" name="지역" value="${esc(sigungu + ' ' + dong)}" placeholder=""></div>
        <div class="fg"><label>문의내용</label><textarea class="fi" name="문의내용" rows="3" placeholder="궁금한 점을 자유롭게 작성해 주세요."></textarea></div>
        <button type="submit" class="fsub">✍️ 무료 상담 신청하기</button>
      </form>
    </div>
  </div>
</section>`;

  return shell({ title, description, canonical: `${SITE}/school/${schoolId}`, body });
}

// ── 시도 허브 페이지 ──────────────────────────────────
function renderSidoPage(sidoRaw) {
  const sidoName = decodeURIComponent(sidoRaw);
  const sidoIdx  = SIDO.indexOf(sidoName);
  if (sidoIdx === -1) return shell({
    title: '지역을 찾을 수 없습니다',
    description: '요청하신 지역 정보를 찾을 수 없습니다.',
    canonical: `${SITE}/sido/${sidoRaw}`,
    body: `<div class="wrap" style="padding:80px 20px;text-align:center"><h1>지역을 찾을 수 없습니다</h1></div>`,
  });

  const schoolIds = BY_SIDO[sidoIdx] || [];
  const sigungus  = [...new Set(schoolIds.map(id => SCHOOLS[id]?.[3]).filter(Boolean))].sort();
  const desc      = SIDO_DESC[sidoName] || `${sidoName} 지역 전문 과외`;

  const sigunguCards = sigungus.map(sg => `
    <a class="sido-card" href="${SITE}/sigungu/${encodeURIComponent(sidoName)}/${encodeURIComponent(sg)}">
      ${esc(sg)}<br><small style="color:var(--muted);font-weight:400">${(BY_SIGUNGU[sg] || []).length}개 학교</small>
    </a>`).join('');

  const recentSchools = schoolIds.slice(0, 12).map(id => {
    const sc = SCHOOLS[id];
    if (!sc) return '';
    return `<a class="sc-card" href="${SITE}/school/${id}">
      <span class="badge-type badge-${sc[1]}">${SCHOOL_TYPE[sc[1]]}</span>
      <span class="sc-name">${esc(sc[0])}</span>
      <span class="sc-loc">📍 ${esc(sc[3])} ${esc(sc[4])}</span>
    </a>`;
  }).join('');

  const title       = `${sidoName} 학교 과외 | 드림과외`;
  const description = `${sidoName} 전체 학교 과외 정보. ${desc}. 방문·화상 1:1 맞춤 과외, 24시간 내 매칭.`;

  const body = `
<div class="bc"><div class="wrap">
  <a href="${SITE}/">홈</a><span>›</span>${esc(sidoName)}
</div></div>
<section class="hero">
  <div class="wrap">
    <h1>${esc(sidoName)} <em>학교 과외</em></h1>
    <p>${desc}.<br>드림과외는 ${sidoName} 학교별 내신 전문 선생님을 연결합니다.</p>
    <div class="hero-btns">
      <button class="btn-main" onclick="openModal('','${esc(sidoName)}')">✍️ 무료 상담 신청</button>
      <a class="btn-sub" href="tel:${PHONE}">📞 전화 상담</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <span class="sec-label">AREAS</span>
    <h2 class="sec-title">${esc(sidoName)} <em>시군구별</em> 학교 과외</h2>
    <p class="sec-desc">원하시는 지역을 선택하시면 해당 지역 학교 목록을 확인할 수 있습니다.</p>
    <div class="sido-grid">${sigunguCards}</div>
  </div>
</section>

${recentSchools ? `<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">SCHOOLS</span>
    <h2 class="sec-title">${esc(sidoName)} <em>주요 학교</em></h2>
    <div class="school-grid">${recentSchools}</div>
    <p style="margin-top:20px"><a href="${SITE}/search?q=${encodeURIComponent(sidoName)}" style="color:var(--pri);font-weight:600">→ ${sidoName} 전체 학교 검색</a></p>
  </div>
</section>` : ''}`;

  return shell({ title, description, canonical: `${SITE}/sido/${encodeURIComponent(sidoName)}`, body });
}

// ── 시군구 허브 페이지 ────────────────────────────────
function renderSigunguPage(sidoRaw, sigungu) {
  const sidoName  = decodeURIComponent(sidoRaw);
  const schoolIds = BY_SIGUNGU[sigungu] || [];

  const byType = { 0: [], 1: [], 2: [] };
  for (const id of schoolIds) {
    const sc = SCHOOLS[id];
    if (sc) byType[sc[1]].push(id);
  }

  const typeSection = [['초등학교', 0], ['중학교', 1], ['고등학교', 2]].map(([label, t]) => {
    if (!byType[t].length) return '';
    const cards = byType[t].map(id => {
      const sc = SCHOOLS[id];
      return `<a class="sc-card" href="${SITE}/school/${id}">
        <span class="sc-name">${esc(sc[0])}</span>
        <span class="sc-loc">📍 ${esc(sc[4])}</span>
      </a>`;
    }).join('');
    return `
    <h3 style="margin:32px 0 16px;font-size:18px">${label} (${byType[t].length}개)</h3>
    <div class="school-grid">${cards}</div>`;
  }).join('');

  const isVisit   = !!(VISIT_SIGUNGU[sidoName]?.includes(sigungu));
  const visitText = isVisit ? '방문·화상 모두 가능' : '화상과외 가능';
  const title       = `${sigungu} 학교 과외 목록 | 드림과외`;
  const description = `${sidoName} ${sigungu} 전체 학교 과외. ${visitText}. 초중고 내신 전문 선생님 24시간 매칭.`;

  const body = `
<div class="bc"><div class="wrap">
  <a href="${SITE}/">홈</a><span>›</span>
  <a href="${SITE}/sido/${encodeURIComponent(sidoName)}">${esc(sidoName)}</a><span>›</span>${esc(sigungu)}
</div></div>
<section class="hero">
  <div class="wrap">
    <span class="tag">${visitText}</span>
    <h1>${esc(sigungu)} <em>학교 과외</em></h1>
    <p>${sidoName} ${sigungu} 내 ${schoolIds.length}개 학교 전문 과외.<br>
    학교별 내신 기출을 파악한 선생님을 24시간 내 매칭해드립니다.</p>
    <div class="hero-btns">
      <button class="btn-main" onclick="openModal('','${esc(sigungu)}')">✍️ 무료 상담 신청</button>
      <a class="btn-sub" href="tel:${PHONE}">📞 전화 상담</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <span class="sec-label">SCHOOLS</span>
    <h2 class="sec-title">${esc(sigungu)} <em>전체 학교</em> 목록</h2>
    ${typeSection || '<p style="color:var(--muted)">등록된 학교 정보가 없습니다.</p>'}
  </div>
</section>`;

  return shell({ title, description, canonical: `${SITE}/sigungu/${encodeURIComponent(sidoName)}/${encodeURIComponent(sigungu)}`, body });
}

// ── 검색 페이지 ───────────────────────────────────────
function renderSearchPage(query) {
  const q = query.trim();

  let results = [];
  if (q.length >= 1) {
    for (const [id, sc] of Object.entries(SCHOOLS)) {
      if (sc[0].includes(q) || sc[3].includes(q) || sc[4].includes(q) || SIDO[sc[2]].includes(q)) {
        results.push(id);
        if (results.length >= 50) break;
      }
    }
  }

  const resultHtml = results.length
    ? results.map(id => {
        const sc = SCHOOLS[id];
        return `<a class="result-item" href="${SITE}/school/${id}">
          <div>
            <div class="ri-name"><span class="badge-type badge-${sc[1]}" style="font-size:11px;margin-right:8px">${SCHOOL_TYPE[sc[1]]}</span>${esc(sc[0])}</div>
            <div class="ri-loc">📍 ${esc(SIDO[sc[2]])} ${esc(sc[3])} ${esc(sc[4])}</div>
          </div>
          <span class="ri-btn">과외 보기</span>
        </a>`;
      }).join('')
    : q ? '<p style="text-align:center;color:var(--muted);padding:40px 0">검색 결과가 없습니다. 다른 검색어를 입력해보세요.</p>' : '';

  const title = q ? `"${q}" 학교 검색 결과 | 드림과외` : '학교 검색 | 드림과외';
  const description = `전국 학교 검색. ${q ? `"${q}" 검색 결과 ${results.length}건.` : ''} 드림과외에서 학교별 내신 전문 과외를 찾아보세요.`;

  const body = `
<section class="sec">
  <div class="wrap">
    <h1 class="sec-title" style="text-align:center;margin-bottom:32px">
      학교 <em>검색</em>
    </h1>
    <form class="search-input-wrap" action="${SITE}/search" method="get">
      <input name="q" type="search" value="${esc(q)}" placeholder="학교명, 지역명 입력..." autofocus>
      <button type="submit">🔍</button>
    </form>
    ${q ? `<p style="margin-bottom:20px;color:var(--muted);font-size:14px">"${esc(q)}" 검색 결과 ${results.length}건</p>` : ''}
    <div class="result-list">${resultHtml}</div>
  </div>
</section>`;

  return shell({ title, description, canonical: `${SITE}/search`, body });
}

// ── 홈 페이지 ─────────────────────────────────────────
function renderHomePage() {
  const schoolCount = Object.keys(SCHOOLS).length;

  const sidoCards = SIDO.map(s => `
    <a class="sido-card" href="${SITE}/sido/${encodeURIComponent(s)}">
      ${esc(s)}<br><small style="color:var(--muted);font-weight:400">${(BY_SIDO[SIDO.indexOf(s)] || []).length}개 학교</small>
    </a>`).join('');

  const body = `
<section class="hero" style="text-align:center">
  <div class="wrap">
    <h1>전국 <em>${schoolCount.toLocaleString()}개</em> 학교<br>내신 전문 과외</h1>
    <p>재학 학교 이름으로 내신 기출을 파악한 전문 선생님을 찾아보세요.<br>24시간 내 매칭, 첫 수업 100% 무료.</p>
    <form action="${SITE}/search" method="get" style="display:flex;gap:0;max-width:440px;margin:0 auto 20px">
      <input name="q" type="search" style="flex:1;padding:14px 20px;border:2px solid rgba(255,255,255,.5);border-right:none;border-radius:999px 0 0 999px;font-size:15px;background:rgba(255,255,255,.15);color:#fff;outline:none" placeholder="학교명 검색...">
      <button type="submit" style="background:#fff;color:var(--pri);border:none;border-radius:0 999px 999px 0;padding:0 24px;font-weight:700;cursor:pointer;font-size:15px">검색</button>
    </form>
    <div class="hero-btns" style="justify-content:center">
      <button class="btn-main" onclick="openModal()">✍️ 무료 상담 신청</button>
      <a class="btn-sub" href="tel:${PHONE}">📞 전화 상담</a>
    </div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <span class="sec-label">REGIONS</span>
    <h2 class="sec-title">지역별 <em>학교 과외</em></h2>
    <p class="sec-desc">원하시는 지역을 선택하시면 해당 지역 학교 목록을 확인할 수 있습니다.</p>
    <div class="sido-grid">${sidoCards}</div>
  </div>
</section>

<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">HOW IT WORKS</span>
    <h2 class="sec-title">간단한 <em>3단계</em></h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:24px;text-align:center">
      ${[['🔍','학교 검색','학교명으로 내 학교를 검색합니다.'],['👩‍🏫','선생님 매칭','24시간 내 내신 전문 선생님이 연결됩니다.'],['🎓','무료 체험','첫 수업은 100% 무료로 체험합니다.']].map(([ic,t,d])=>`<div class="info-card"><div style="font-size:36px;margin-bottom:12px">${ic}</div><div style="font-weight:700;margin-bottom:8px">${t}</div><div style="color:var(--muted);font-size:14px">${d}</div></div>`).join('')}
    </div>
  </div>
</section>`;

  return shell({
    title: '전국 학교별 과외 | 드림과외',
    description: `전국 ${schoolCount}개 학교 내신 전문 1:1 과외. 학교 이름으로 검색해 맞춤 선생님을 찾아보세요. 24시간 매칭, 첫 수업 무료.`,
    canonical: SITE + '/',
    body,
  });
}

// ── 유틸 ──────────────────────────────────────────────
function esc(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function subjectEmoji(s) {
  return { 수학:'🔢', 영어:'🔤', 국어:'📖', 과학:'🔬', 사회:'🌏', 한국사:'📜' }[s] || '📚';
}
