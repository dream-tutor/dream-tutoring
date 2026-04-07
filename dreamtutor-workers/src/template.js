const PHONE_LINK = '01048645345';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbysEqIGSI9Dz4h4jup9Rn72KBNuuCObBifH_wAPSePhHt3wMe4RDBOxlwupxmrPeXqVjw/exec';

// ── CSS ──────────────────────────────────────────────────
const CSS = `
:root{--ink:#3B3B3B;--acc:#5A8F7B;--acc2:#C4956A;--bg:#FAF8F5;--white:#FFFFFF;--muted:#8C8C8C;--border:#E8E3DB;--radius:14px;--shadow:0 2px 16px rgba(0,0,0,.04);--shadow-h:0 8px 24px rgba(0,0,0,.08)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:"Noto Sans KR",sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;overflow-x:hidden}
a{color:inherit;text-decoration:none}
/* HEADER */
.hdr{position:fixed;top:0;left:0;right:0;z-index:999;background:rgba(250,248,245,.96);backdrop-filter:blur(10px);border-bottom:1px solid var(--border);height:60px;display:flex;align-items:center}
.hdr-in{max-width:1120px;margin:0 auto;padding:0 20px;width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{display:flex;align-items:center;gap:8px;text-decoration:none;flex-shrink:0}
.logo-mark{width:34px;height:34px;background:#3B3B3B;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-family:"Gmarket Sans",sans-serif;font-size:13px;font-weight:700}
.logo-text{font-family:"Gmarket Sans",sans-serif;font-size:18px;font-weight:700;color:var(--ink)}
.logo-text em{color:var(--acc);font-style:normal}
.hdr-nav{display:flex;gap:2px}
.hdr-nav a{text-decoration:none;color:var(--muted);font-size:13px;font-weight:500;padding:7px 12px;border-radius:8px;transition:.15s;white-space:nowrap}
.hdr-nav a:hover{color:var(--ink);background:rgba(13,27,42,.06)}
.hdr-cta{display:flex;gap:8px;flex-shrink:0}
.btn-tel{display:flex;align-items:center;gap:5px;background:transparent;border:1.5px solid var(--border);color:var(--ink);font-size:13px;font-weight:600;padding:7px 14px;border-radius:9px;text-decoration:none;white-space:nowrap;transition:.15s}
.btn-tel:hover{border-color:var(--acc);color:var(--acc)}
.btn-apply{display:flex;align-items:center;gap:5px;background:var(--acc);color:#fff;font-size:13px;font-weight:700;padding:8px 16px;border-radius:9px;border:none;cursor:pointer;font-family:inherit;white-space:nowrap;transition:.15s}
.btn-apply:hover{filter:brightness(1.1)}
/* LAYOUT */
.pt60{padding-top:60px}
.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
.sec{padding:56px 0}
.sec-wh{background:var(--white)}
.sec-bg{background:var(--bg)}
.sec-label{display:block;font-size:11px;font-weight:700;letter-spacing:3px;color:var(--acc);margin-bottom:10px;text-transform:uppercase}
.sec-title{font-family:"Gmarket Sans",sans-serif;font-size:clamp(20px,3.5vw,32px);font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:10px;word-break:keep-all}
.sec-title em{color:var(--acc);font-style:normal}
.sec-desc{color:var(--muted);font-size:14px;line-height:1.85;margin-bottom:36px;word-break:keep-all}
/* BREADCRUMB */
.bc{padding:10px 0;font-size:12px;color:var(--muted);background:var(--white);border-bottom:1px solid var(--border)}
.bc-in{max-width:1120px;margin:0 auto;padding:0 20px}
.bc a{color:var(--acc)}
.bc span{margin:0 5px}
/* PAGE HERO */
.page-hero{background:linear-gradient(135deg,#2F3E2E 0%,#4A6741 50%,#5A8F7B 100%);padding:52px 0 48px;position:relative;overflow:hidden}
.page-hero::before{content:"";position:absolute;top:-120px;right:-60px;width:380px;height:380px;background:radial-gradient(circle,rgba(196,149,106,.06) 0%,transparent 70%);pointer-events:none}
.page-hero::after{content:"";position:absolute;bottom:-80px;left:-40px;width:300px;height:300px;background:radial-gradient(circle,rgba(255,255,255,.03) 0%,transparent 70%);pointer-events:none}
.page-hero-in{position:relative;z-index:1}
.region-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:rgba(255,255,255,.85);font-size:11px;font-weight:700;padding:5px 14px;border-radius:100px;margin-bottom:16px;letter-spacing:.5px}
.page-h1{font-family:"Gmarket Sans",sans-serif;font-size:clamp(32px,5.5vw,58px);font-weight:700;color:#fff;line-height:1.18;margin-bottom:14px;word-break:keep-all}
.page-h1 em{color:#E8D5B5;font-style:normal}
.page-desc{color:rgba(255,255,255,.75);font-size:15px;line-height:1.88;margin-bottom:28px;word-break:keep-all;max-width:700px}
.hero-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:28px}
.btn-hero-main{display:inline-flex;align-items:center;gap:8px;background:var(--acc2);color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:11px;border:none;cursor:pointer;font-family:inherit;transition:.2s;white-space:nowrap}
.btn-hero-main:hover{filter:brightness(1.05);transform:translateY(-1px);box-shadow:0 4px 16px rgba(196,149,106,.3)}
.btn-hero-sub{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.1);color:#fff;font-size:14px;font-weight:600;padding:14px 22px;border-radius:11px;text-decoration:none;border:1px solid rgba(255,255,255,.2);transition:.2s;white-space:nowrap}
.btn-hero-sub:hover{background:rgba(255,255,255,.18)}
.hero-points{list-style:none;display:flex;flex-direction:column;gap:6px;margin-bottom:28px}
.hero-points li{color:rgba(255,255,255,.78);font-size:15px;line-height:1.7;word-break:keep-all;padding-left:20px;position:relative}
.hero-points li::before{content:"·";position:absolute;left:0;color:var(--acc2);font-weight:700;font-size:20px;line-height:1.5}
.hero-chips{display:flex;flex-wrap:wrap;gap:7px}
.hero-chip{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.82);font-size:11px;padding:4px 12px;border-radius:100px}
/* STRENGTH CARDS */
.str-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.str-card{background:var(--white);border-radius:var(--radius);padding:24px 20px;border:1px solid var(--border);transition:.2s;position:relative;overflow:hidden}
.str-card::before{content:"";position:absolute;top:0;left:0;right:0;height:3px}
.str-card:nth-child(1)::before{background:var(--acc)}
.str-card:nth-child(2)::before{background:var(--acc2)}
.str-card:nth-child(3)::before{background:#8BA98B}
.str-card:nth-child(4)::before{background:#A0896C}
.str-card:hover{transform:translateY(-3px);box-shadow:var(--shadow-h)}
.str-icon{font-size:28px;margin-bottom:12px;display:block}
.str-num{font-family:"Gmarket Sans",sans-serif;font-size:34px;font-weight:700;color:var(--ink);line-height:1;margin-bottom:4px}
.str-num span{font-size:16px}
.str-card h3{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:6px}
.str-card p{font-size:12px;color:var(--muted);line-height:1.7}
/* PROCESS */
.process-grid{display:grid;grid-template-columns:repeat(4,1fr);position:relative;margin-top:40px}
.process-grid::before{content:"";position:absolute;top:27px;left:12.5%;right:12.5%;height:1px;background:repeating-linear-gradient(90deg,var(--acc) 0,var(--acc) 8px,transparent 8px,transparent 18px);z-index:0}
.process-step{text-align:center;padding:0 12px;position:relative;z-index:1}
.process-circle{width:54px;height:54px;border-radius:50%;background:var(--bg);border:2px solid var(--acc);display:flex;align-items:center;justify-content:center;font-family:"Gmarket Sans",sans-serif;font-size:20px;font-weight:700;color:var(--acc);margin:0 auto 16px;box-shadow:0 0 0 6px var(--bg)}
.process-step h3{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:6px}
.process-step p{font-size:12px;color:var(--muted);line-height:1.68}
/* PRICE TABLE */
.price-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border-radius:12px;box-shadow:var(--shadow)}
.price-table{width:100%;border-collapse:collapse;min-width:480px}
.price-table th{background:var(--ink);color:#fff;font-size:13px;font-weight:700;padding:14px 16px;text-align:center}
.price-table td{background:var(--white);font-size:13px;padding:13px 16px;text-align:center;border-bottom:1px solid var(--border)}
.price-table tr:last-child td{border-bottom:none}
.price-table tr:hover td{background:#f0f4ff}
.price-strong{font-weight:700;color:var(--acc)}
.price-note{font-size:11px;color:var(--muted);margin-top:10px;text-align:right}
/* PRICE TEXT BLOCK */
.price-text-block{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:22px 24px;margin-bottom:16px}
.price-text-block h3{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:10px}
.price-text-block>p{font-size:14px;color:var(--ink);line-height:1.8;margin-bottom:6px}
.price-text-block .price-note{text-align:left;margin-top:8px}
/* REVIEWS */
.review-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.review-card{background:var(--white);border-radius:18px;padding:26px;box-shadow:var(--shadow);border:1px solid var(--border);display:flex;flex-direction:column;gap:14px}
.review-stars{color:#F59E0B;font-size:13px;letter-spacing:2px}
.review-text{font-size:13.5px;color:var(--ink);line-height:1.88;flex:1;word-break:keep-all}
.review-author{display:flex;align-items:center;gap:10px;padding-top:12px;border-top:1px solid var(--border)}
.review-avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:"Gmarket Sans",sans-serif;font-size:14px;font-weight:700;color:#fff;flex-shrink:0}
.review-name{font-size:13px;font-weight:700;color:var(--ink)}
.review-info{font-size:11px;color:var(--muted);margin-top:2px}
/* CTA DARK BOX */
.cta-wrap{background:var(--white);padding:0 0 4px}
.cta-dark{background:linear-gradient(135deg,#2F3E2E,#4A6741);border-radius:18px;padding:36px 32px;display:flex;align-items:center;justify-content:space-between;gap:24px;margin:0}
.cta-dark-left h3{font-family:"Gmarket Sans",sans-serif;font-size:clamp(15px,2.4vw,22px);font-weight:700;color:#fff;margin-bottom:8px;word-break:keep-all}
.cta-dark-left p{color:rgba(255,255,255,.65);font-size:13px;line-height:1.75}
.cta-dark-btns{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap}
/* FAQ */
.faq-list{display:flex;flex-direction:column}
.faq-item{border-bottom:1px solid var(--border);padding:20px 0}
.faq-item:last-child{border-bottom:none}
.faq-q{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:8px;display:flex;gap:10px;align-items:flex-start}
.faq-q::before{content:"Q";background:var(--acc);color:#fff;border-radius:6px;padding:2px 7px;font-size:11px;font-weight:700;flex-shrink:0;margin-top:2px}
.faq-a{font-size:13px;color:var(--muted);line-height:1.82;padding-left:28px}
/* LINK LISTS */
.link-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.link-list a{color:var(--acc);font-size:13px;background:rgba(90,143,123,.05);border:1px solid rgba(90,143,123,.18);border-radius:8px;padding:6px 14px;transition:.15s;white-space:nowrap}
.link-list a:hover{background:var(--acc);color:#fff;border-color:var(--acc)}
/* SCHOOL LINKS */
.school-link-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;margin-bottom:4px}
.school-link{color:var(--acc);font-size:13px;background:rgba(90,143,123,.05);border:1px solid rgba(90,143,123,.18);border-radius:8px;padding:5px 12px;text-decoration:none;transition:.15s;white-space:nowrap;display:inline-flex;align-items:center;gap:4px}
.school-link:hover{background:var(--acc);color:#fff;border-color:var(--acc)}
.school-type{font-size:10px;font-weight:700;background:rgba(0,0,0,.08);border-radius:4px;padding:1px 4px;margin-left:2px}
.school-group{margin-top:24px}
.school-group-title{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:4px}
.school-count{font-size:12px;font-weight:400;color:var(--muted)}
/* CARD GRID */
.card-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:16px}
.card{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:14px;font-size:13px;transition:.15s}
.card:hover{border-color:var(--acc);box-shadow:var(--shadow)}
.card a{color:var(--acc);font-weight:600}
/* TAGS */
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}
.tag{background:rgba(37,99,235,.06);color:var(--acc);border:1px solid rgba(37,99,235,.15);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:500}
/* CONSULT FORM */
.form-sec{background:linear-gradient(135deg,#2F3E2E 0%,#4A6741 100%);padding:72px 0;position:relative;overflow:hidden}
.form-sec::before{content:"";position:absolute;top:-80px;right:-80px;width:400px;height:400px;border:1px solid rgba(255,255,255,.05);border-radius:50%}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;position:relative;z-index:1}
.form-left h2{font-family:"Gmarket Sans",sans-serif;font-size:clamp(20px,3vw,32px);font-weight:700;color:#fff;line-height:1.3;margin-bottom:14px;word-break:keep-all}
.form-left h2 em{color:var(--acc2);font-style:normal}
.form-left p{color:rgba(255,255,255,.65);font-size:14px;line-height:1.8;margin-bottom:22px}
.form-pts{display:flex;flex-direction:column;gap:10px}
.form-pt{display:flex;align-items:center;gap:10px;font-size:13px;color:rgba(255,255,255,.82)}
.form-pt::before{content:"✓";width:20px;height:20px;min-width:20px;background:var(--acc);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
.cform{background:#fff;border-radius:20px;padding:28px}
.cform h3{font-size:16px;font-weight:700;color:var(--ink);margin-bottom:4px}
.fdesc{font-size:13px;color:var(--muted);margin-bottom:20px}
.fg{margin-bottom:12px}
.fg label{display:block;font-size:12px;font-weight:600;color:var(--ink);margin-bottom:5px}
.fg label span{color:var(--acc)}
.fi,.fs,.fta{width:100%;padding:10px 13px;border:1.5px solid var(--border);border-radius:10px;font-size:14px;font-family:inherit;background:var(--bg);color:var(--ink);transition:.15s;outline:none}
.fi:focus,.fs:focus,.fta:focus{border-color:var(--acc);background:#fff}
.fta{resize:vertical;min-height:72px}
.fr{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fsub{width:100%;padding:13px;background:var(--acc);color:#fff;font-size:14px;font-weight:700;border:none;border-radius:11px;cursor:pointer;font-family:inherit;margin-top:6px;transition:.15s}
.fsub:hover{filter:brightness(1.1)}
.fsub:disabled{opacity:.6;cursor:not-allowed}
/* FOOTER */
footer{background:#2F3E2E;padding:48px 0 24px}
.footer-grid{display:grid;grid-template-columns:1.2fr 1fr 1fr;gap:36px;margin-bottom:36px}
.footer-brand p{font-size:13px;color:rgba(255,255,255,.4);line-height:1.8;margin-top:10px}
.footer-col h4{font-size:12px;font-weight:700;color:rgba(255,255,255,.6);margin-bottom:12px;text-transform:uppercase;letter-spacing:1px}
.footer-col ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.footer-col ul a{font-size:12px;color:rgba(255,255,255,.4);text-decoration:none;transition:.15s}
.footer-col ul a:hover{color:rgba(255,255,255,.8)}
.footer-hours{font-size:12px;color:rgba(255,255,255,.4);line-height:1.7;margin-bottom:14px}
.footer-bottom{border-top:1px solid rgba(255,255,255,.08);padding-top:18px;display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.3);flex-wrap:wrap;gap:8px}
/* FLOATING */
.floating{position:fixed;bottom:24px;right:20px;display:flex;flex-direction:column;gap:10px;z-index:900}
.fbtn{display:flex;align-items:center;justify-content:center;gap:6px;padding:12px 20px;border-radius:100px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:inherit;box-shadow:0 4px 20px rgba(0,0,0,.2);transition:.15s;white-space:nowrap;text-decoration:none}
.fbtn:hover{transform:translateY(-2px)}
.f-tel{background:var(--white);color:var(--ink)}
.f-apply{background:var(--acc);color:#fff}
/* MODAL */
.modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9999;display:none;align-items:center;justify-content:center;padding:20px}
.modal-ov.open{display:flex}
.modal{background:#fff;border-radius:20px;padding:28px;width:100%;max-width:460px;max-height:90vh;overflow-y:auto}
.modal-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
.modal-title{font-size:16px;font-weight:700;color:var(--ink)}
.modal-close{background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted);line-height:1;padding:4px}
/* SUCCESS MODAL */
.suc-modal{text-align:center;max-width:320px;padding:36px 28px}
.suc-emoji{font-size:56px;margin-bottom:16px}
.suc-title{font-family:"Gmarket Sans",sans-serif;font-size:22px;font-weight:700;color:var(--ink);margin-bottom:8px}
.suc-desc{font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:24px}
.suc-btn{background:var(--acc);color:#fff;border:none;border-radius:11px;padding:12px 36px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s}
.suc-btn:hover{filter:brightness(1.1)}
/* LEARNING CARDS */
.learning-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px}
.learning-card{background:var(--bg);border-radius:var(--radius);padding:22px 18px;border:1px solid var(--border)}
.learning-icon{font-size:26px;margin-bottom:10px;display:block}
.learning-card h3{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:6px}
.learning-card p{font-size:12px;color:var(--muted);line-height:1.75}
.learning-method{background:var(--white);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin-top:8px}
.learning-method h3{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:12px}
.learning-method ul{list-style:none;display:flex;flex-direction:column;gap:8px}
.learning-method li{font-size:13px;color:var(--muted);padding-left:20px;position:relative;line-height:1.7}
.learning-method li::before{content:"✓";position:absolute;left:0;color:var(--acc);font-weight:700}
/* CHECK LIST - 컴팩트 박스 */
.check-list{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}
.check-list li{display:flex;flex-direction:column;gap:6px;font-size:13px;color:var(--muted);line-height:1.7;word-break:keep-all;background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:16px 18px}
.check-list li::before{content:"✓";flex-shrink:0;width:24px;height:24px;background:var(--acc);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
.check-list strong{color:var(--ink);font-weight:700;font-size:14px}
/* IMAGE CALLOUT */
.img-callout{position:relative;overflow:hidden;border-radius:16px;margin:0}
.img-callout img{width:100%;height:320px;object-fit:cover;object-position:center 40%;display:block;filter:brightness(.5)}
.img-callout-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;z-index:1}
.img-callout-text h3{font-family:"Gmarket Sans",sans-serif;font-size:clamp(18px,3vw,26px);font-weight:700;color:#fff;line-height:1.35;margin-bottom:8px;word-break:keep-all}
.img-callout-text p{font-size:14px;color:rgba(255,255,255,.78);line-height:1.7;max-width:480px;word-break:keep-all}
/* STUDY STEPS - 과목별 학습법 */
.study-steps{display:flex;flex-direction:column;gap:0;margin-top:28px;border:1px solid var(--border);border-radius:14px;overflow:hidden}
.study-step{display:flex;align-items:flex-start;gap:20px;padding:20px 24px;border-bottom:1px solid var(--border);background:var(--white)}
.study-step:last-child{border-bottom:none}
.study-step:nth-child(odd){background:var(--bg)}
.step-badge{flex-shrink:0;width:36px;height:36px;background:var(--acc);color:#fff;border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:"Gmarket Sans",sans-serif;font-size:14px;font-weight:700}
.study-step h3{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:5px}
.study-step p{font-size:13px;color:var(--muted);line-height:1.75;word-break:keep-all}
/* INFO BLOCK - 지역 정보 텍스트 블록 */
.info-block{background:var(--white);border:1px solid var(--border);border-radius:14px;padding:28px 28px;margin-top:24px}
.info-block p{font-size:14px;color:var(--ink);line-height:1.9;word-break:keep-all;margin-bottom:14px}
.info-block p:last-child{margin-bottom:0}
.info-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}
.info-tag{display:inline-flex;align-items:center;gap:5px;background:rgba(90,143,123,.06);color:var(--acc);border:1px solid rgba(90,143,123,.18);border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600}
/* (removed tutor-img-sec) */
/* MOBILE */
@media(max-width:768px){
  /* 헤더 */
  .hdr-nav{display:none}
  .btn-tel{font-size:12px;padding:7px 12px}
  .btn-apply{font-size:12px;padding:7px 13px}
  /* 레이아웃 */
  .wrap{padding:0 20px}
  .sec{padding:44px 0}
  /* 타이포그래피 */
  .sec-label{font-size:10px;letter-spacing:2px;margin-bottom:8px}
  .sec-title{font-size:20px;line-height:1.4;word-break:keep-all;margin-bottom:12px}
  .sec-desc{font-size:13px;line-height:1.8;margin-bottom:28px;word-break:keep-all;color:var(--muted)}
  /* 히어로 */
  .page-hero{padding:36px 0 32px}
  .page-h1{font-size:28px;line-height:1.3}
  .page-desc{font-size:13px;line-height:1.8;margin-bottom:20px}
  .hero-btns{flex-direction:column;gap:8px;margin-bottom:18px}
  .btn-hero-main{font-size:14px;padding:13px 20px;width:100%;justify-content:center}
  .btn-hero-sub{font-size:13px;padding:12px 16px;width:100%;justify-content:center}
  .hero-points{gap:3px;margin-bottom:20px}
  .hero-points li{font-size:13px;line-height:1.7;padding-left:14px}
  .hero-points li::before{font-size:16px}
  .hero-chips{gap:5px}
  .hero-chip{font-size:10px;padding:4px 9px}
  .region-badge{font-size:10px;padding:4px 11px;margin-bottom:12px}
  /* 강점 카드 */
  .str-grid{grid-template-columns:1fr 1fr;gap:10px}
  .str-card{padding:18px 14px}
  .str-num{font-size:24px}
  .str-icon{font-size:22px;margin-bottom:8px}
  .str-card h3{font-size:12px;margin-bottom:4px}
  .str-card p{font-size:12px;line-height:1.7;color:var(--muted)}
  /* 프로세스 */
  .process-grid{grid-template-columns:1fr 1fr;gap:20px 14px;margin-top:28px}
  .process-grid::before{display:none}
  .process-circle{width:42px;height:42px;font-size:16px;margin-bottom:12px}
  .process-step h3{font-size:13px;margin-bottom:4px}
  .process-step p{font-size:12px;line-height:1.7;color:var(--muted)}
  /* 후기 */
  .review-grid{grid-template-columns:1fr;gap:14px}
  .review-card{padding:20px}
  .review-text{font-size:13px;line-height:1.8}
  .review-name{font-size:13px}
  .review-info{font-size:11px}
  /* CTA 박스 */
  .cta-wrap{padding:0 0 2px}
  .cta-dark{flex-direction:column;text-align:center;padding:24px 20px;gap:14px;border-radius:14px}
  .cta-dark-left h3{font-size:16px;line-height:1.4;margin-bottom:6px}
  .cta-dark-left p{font-size:12px;line-height:1.7}
  .cta-dark-btns{justify-content:center;width:100%;flex-direction:column;gap:8px}
  .cta-dark-btns .btn-hero-main,.cta-dark-btns .btn-hero-sub{width:100%;justify-content:center;font-size:13px;padding:12px 18px}
  /* 폼 */
  .form-sec{padding:44px 0}
  .form-grid{grid-template-columns:1fr;gap:24px}
  .form-left{text-align:center}
  .form-pts{text-align:left}
  .form-pt{font-size:13px;line-height:1.7}
  .cform{padding:24px 18px}
  .cform h3{font-size:15px}
  .fdesc{font-size:13px;margin-bottom:16px}
  .fr{grid-template-columns:1fr}
  .fg{margin-bottom:14px}
  .fi,.fs,.fta{font-size:14px;padding:11px 13px}
  .fg label{font-size:12px;margin-bottom:5px}
  .fsub{padding:14px;font-size:14px}
  /* FAQ */
  .faq-item{padding:18px 0}
  .faq-q{font-size:13px;line-height:1.6}
  .faq-a{font-size:12px;line-height:1.8;padding-left:26px}
  /* 가격 블록 */
  .price-text-block{padding:18px}
  .price-text-block h3{font-size:14px;margin-bottom:8px}
  .price-text-block>p{font-size:13px;line-height:1.75}
  .price-note{font-size:11px}
  /* 학습 카드 */
  .learning-grid{grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
  .learning-card{padding:16px 12px}
  .learning-icon{font-size:22px;margin-bottom:8px}
  .learning-card h3{font-size:12px;margin-bottom:4px}
  .learning-card p{font-size:11px;line-height:1.7;color:var(--muted)}
  .learning-method{padding:16px 18px}
  .learning-method h3{font-size:13px;margin-bottom:10px}
  .learning-method ul{gap:8px}
  .learning-method li{font-size:12px;line-height:1.75}
  /* 링크/카드 그리드 */
  .card-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px}
  .card{padding:12px}
  .card a{font-size:12px}
  .link-list a{font-size:12px;padding:6px 12px}
  /* 푸터 */
  footer{padding:36px 0 18px}
  .footer-grid{grid-template-columns:1fr;gap:20px;margin-bottom:24px}
  .footer-brand p{font-size:12px;line-height:1.75}
  .footer-col ul{gap:10px}
  .footer-col ul a{font-size:12px}
  .footer-bottom{flex-direction:column;text-align:center;gap:5px;font-size:11px}
  /* 플로팅 버튼 */
  .floating{bottom:16px;right:12px;gap:8px}
  .fbtn{padding:10px 16px;font-size:13px}
  /* 체크리스트 - 모바일 1열 컴팩트 */
  .check-list{grid-template-columns:1fr;gap:8px;margin-top:16px}
  .check-list li{padding:12px 14px;gap:4px;font-size:12px;line-height:1.7}
  .check-list strong{font-size:12px}
  /* 이미지 콜아웃 */
  .img-callout img{height:200px}
  .img-callout-text h3{font-size:16px}
  .img-callout-text p{font-size:12px}
  /* 학습 스텝 */
  .study-step{gap:12px;padding:16px 14px}
  .step-badge{width:30px;height:30px;font-size:11px;border-radius:7px}
  .study-step h3{font-size:13px}
  .study-step p{font-size:12px;line-height:1.75;color:var(--muted)}
  /* 정보 블록 */
  .info-block{padding:18px 14px}
  .info-block p{font-size:13px;line-height:1.8}
  /* 학교 링크 */
  .school-link{font-size:12px;padding:6px 12px}
}
@media(max-width:420px){
  .wrap{padding:0 16px}
  .page-h1{font-size:28px}
  .str-grid{grid-template-columns:1fr 1fr;gap:10px}
  .str-card{padding:18px 14px}
  .process-grid{grid-template-columns:1fr 1fr}
  .learning-grid{grid-template-columns:1fr 1fr}
  .cta-dark{padding:24px 18px}
  .cform{padding:22px 16px}
}
`;

// ── JS ───────────────────────────────────────────────────
const JS = `
var GAS='${GAS_URL}';
function openModal(){document.getElementById('mOv').classList.add('open');document.body.style.overflow='hidden'}
function closeModal(){document.getElementById('mOv').classList.remove('open');document.body.style.overflow=''}
function showSuccess(){
  var o=document.getElementById('sucOv');
  o.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeSuc(){
  document.getElementById('sucOv').classList.remove('open');
  document.body.style.overflow='';
}
function _postGAS(form,cb){
  var el=form.elements;
  var data={
    name:el['이름']?el['이름'].value:'',
    phone:el['연락처']?el['연락처'].value:'',
    grade:el['학년']?el['학년'].value:'',
    subject:el['과목']?el['과목'].value:'',
    region:el['지역']?el['지역'].value:'',
    school:el['학교']?el['학교'].value:'',
    message:el['문의내용']?el['문의내용'].value:''
  };
  fetch(GAS,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify(data)}).then(cb).catch(cb);
}
function submitPageForm(e){
  e.preventDefault();
  var f=e.target,b=f.querySelector('.fsub');
  b.disabled=true;b.textContent='제출 중...';
  _postGAS(f,function(){
    f.reset();b.disabled=false;b.textContent='✍️ 무료 상담 신청하기';
    showSuccess();
  });
}
function submitModal(e){
  e.preventDefault();
  var f=e.target,b=f.querySelector('.fsub');
  b.disabled=true;b.textContent='제출 중...';
  _postGAS(f,function(){
    closeModal();f.reset();b.disabled=false;b.textContent='✍️ 신청하기';
    showSuccess();
  });
}`;

// ── LAYOUT ───────────────────────────────────────────────
export function layout({ head, body, breadcrumb = [], keyword = '', region = '' }) {
  const bcHtml = '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-5R81Y8FGFR"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-5R81Y8FGFR');
</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${head}
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Gmarket+Sans:wght@500;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<header class="hdr">
  <div class="hdr-in">
    <a href="/" class="logo">
      <div class="logo-mark">드림</div>
      <div class="logo-text">드림<em>과외</em></div>
    </a>
    <nav class="hdr-nav">
      <a href="/#subjects">과목별</a>
      <a href="/#regions">지역별</a>
      <a href="/#how">이용방법</a>
      <a href="/#reviews">후기</a>
      <a href="/#consult">상담 신청</a>
    </nav>
    <div class="hdr-cta">
      <a href="tel:${PHONE_LINK}" class="btn-tel">📞 전화 상담</a>
      <button class="btn-apply" onclick="openModal()">✍️ 무료 상담 신청</button>
    </div>
  </div>
</header>
<div class="pt60">
${bcHtml}
${body}
</div>
${_footerHtml()}
${_floatingHtml()}
${_modalHtml(keyword, region)}
${_successOverlay()}
<script>${JS}</script>
</body>
</html>`;
}

function _footerHtml() {
  return `<footer>
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="logo">
          <div class="logo-text" style="color:rgba(255,255,255,.85)">드림<em>과외</em></div>
        </a>
        <p>전국 1:1 전문 과외 드림과외.<br>지역·학교·과목에 맞는 선생님을 연결합니다.</p>
      </div>
      <div class="footer-col">
        <h4>서비스</h4>
        <ul>
          <li><a href="/">홈</a></li>
          <li><a href="/#subjects">과목별 과외</a></li>
          <li><a href="/#regions">지역별 과외</a></li>
          <li><a href="/#how">이용방법</a></li>
          <li><a href="/#consult">무료 상담</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>상담 문의</h4>
        <a href="tel:${PHONE_LINK}" class="btn-tel" style="margin-bottom:8px;display:inline-flex;color:rgba(255,255,255,.85);border-color:rgba(255,255,255,.25)">📞 전화 상담</a>
        <button class="btn-apply" style="width:100%;justify-content:center" onclick="openModal()">✍️ 무료 상담 신청</button>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 드림과외. All rights reserved.</span>
      <span>개인정보처리방침 · 이용약관</span>
    </div>
    <div style="text-align:center;margin-top:12px;font-size:11px;color:rgba(255,255,255,.25)">광고 전화는 정중히 사절합니다.</div>
  </div>
</footer>`;
}

function _floatingHtml() {
  return `<div class="floating">
  <a href="tel:${PHONE_LINK}" class="fbtn f-tel">📞 전화 상담</a>
  <button class="fbtn f-apply" onclick="openModal()">✨ 무료 신청</button>
</div>`;
}

function _modalHtml(keyword, region = '') {
  if (!region) region = keyword ? keyword.replace(/과외$/, '') : '';
  return `<div class="modal-ov" id="mOv" onclick="if(event.target===this)closeModal()">
  <div class="modal">
    <div class="modal-hdr">
      <div class="modal-title">📋 무료 상담 신청</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <form id="mForm" onsubmit="submitModal(event)">
      <div class="fr">
        <div class="fg"><label>이름 <span>*</span></label><input class="fi" name="이름" type="text" placeholder="홍길동" required></div>
        <div class="fg"><label>연락처 <span>*</span></label><input class="fi" name="연락처" type="tel" placeholder="010-0000-0000" required></div>
      </div>
      <div class="fr">
        <div class="fg"><label>학년 <span>*</span></label>
          <select class="fs" name="학년" required>
            <option value="">선택</option>
            <option>초등 1~3학년</option><option>초등 4~6학년</option>
            <option>중학교 1학년</option><option>중학교 2학년</option><option>중학교 3학년</option>
            <option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option>
            <option>N수생/성인</option>
          </select>
        </div>
        <div class="fg"><label>희망 과목 <span>*</span></label>
          <select class="fs" name="과목" required>
            <option value="">선택</option>
            <option>수학</option><option>영어</option><option>국어</option>
            <option>과학</option><option>사회</option><option>한국사</option><option>전 과목</option>
          </select>
        </div>
      </div>
      <div class="fg"><label>거주 지역</label><input class="fi" name="지역" type="text" value="${region}" placeholder="${region || '예: 광명시 철산동'}"></div>
      <div class="fg"><label>학교명 (선택)</label><input class="fi" name="학교" type="text" placeholder="학교명 (선택)"></div>
      <div class="fg"><label>문의내용 (선택)</label><textarea class="fta" name="문의내용" placeholder="궁금한 점을 자유롭게 작성해 주세요."></textarea></div>
      <button type="submit" class="fsub">✍️ 신청하기</button>
    </form>
  </div>
</div>`;
}

function _successOverlay() {
  return `<div class="modal-ov" id="sucOv" onclick="if(event.target===this)closeSuc()">
  <div class="modal suc-modal">
    <div class="suc-emoji">🎉</div>
    <div class="suc-title">신청 완료!</div>
    <p class="suc-desc">상담 신청이 접수됐습니다.<br>담당자가 확인 후 연락드리겠습니다.</p>
    <button class="suc-btn" onclick="closeSuc()">확인</button>
  </div>
</div>`;
}

// ── CTA 박스 (다크) ──────────────────────────────────────
export function ctaBox(keyword = '') {
  return `<div class="cta-wrap">
  <div class="wrap">
    <div class="cta-dark">
      <div class="cta-dark-left">
        <h3>
          <span style="font-size:1.4em;font-weight:800;color:#FFB800;display:block;">${keyword}</span>
          <span style="font-size:0.65em;font-weight:400;opacity:0.85;">선생님이 기다리고 있어요</span>
        </h3>
        <p style="white-space:nowrap;">신청 후 24시간 내 매칭 · 첫 30분 무료 체험</p>
      </div>
      <div class="cta-dark-btns">
        <button class="btn-hero-main" onclick="openModal()">✍️ 무료 상담 신청</button>
        <a href="tel:${PHONE_LINK}" class="btn-hero-sub">📞 전화 상담</a>
      </div>
    </div>
  </div>
</div>`;
}

// ── FAQ 섹션 ─────────────────────────────────────────────
export function faqSection(faqs, schemaJson) {
  return `<section class="sec sec-bg">
  <div class="wrap">
    <span class="sec-label">FAQ</span>
    <h2 class="sec-title">자주 묻는 <em>질문</em></h2>
    <div class="faq-list">
      ${faqs.map(({ q, a }) => `<div class="faq-item">
        <div class="faq-q">${q}</div>
        <div class="faq-a">${a}</div>
      </div>`).join('')}
    </div>
  </div>
</section>
<script type="application/ld+json">${JSON.stringify(schemaJson)}</script>`;
}

// ── 공통 상담 폼 (페이지 하단) ────────────────────────────
export function consultForm({ leftTitle, leftDesc, leftPts, regionValue = '', schoolPlaceholder = '' }) {
  return `<section class="form-sec" id="consult">
  <div class="wrap">
    <div class="form-grid">
      <div class="form-left">
        <h2>${leftTitle}</h2>
        <p>${leftDesc}</p>
        <div class="form-pts">
          ${leftPts.map(p => `<div class="form-pt">${p}</div>`).join('')}
        </div>
      </div>
      <div class="cform">
        <h3>📋 무료 상담 신청</h3>
        <p class="fdesc">작성하신 정보로 빠르게 연락드립니다.</p>
        <form onsubmit="submitPageForm(event)">
          <div class="fr">
            <div class="fg"><label>이름 <span>*</span></label><input class="fi" name="이름" type="text" placeholder="홍길동" required></div>
            <div class="fg"><label>연락처 <span>*</span></label><input class="fi" name="연락처" type="tel" placeholder="010-0000-0000" required></div>
          </div>
          <div class="fr">
            <div class="fg"><label>학년 <span>*</span></label>
              <select class="fs" name="학년" required>
                <option value="">선택</option>
                <option>초등 1~3학년</option><option>초등 4~6학년</option>
                <option>중학교 1학년</option><option>중학교 2학년</option><option>중학교 3학년</option>
                <option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option>
                <option>N수생/성인</option>
              </select>
            </div>
            <div class="fg"><label>희망 과목 <span>*</span></label>
              <select class="fs" name="과목" required>
                <option value="">선택</option>
                <option>수학</option><option>영어</option><option>국어</option>
                <option>과학</option><option>사회</option><option>한국사</option><option>전 과목</option>
              </select>
            </div>
          </div>
          <div class="fg"><label>거주 지역</label><input class="fi" name="지역" type="text" value="${regionValue}" placeholder="${regionValue || '예: 광명시 철산동'}"></div>
          <div class="fg"><label>학교명 (선택)</label><input class="fi" name="학교" type="text" placeholder="학교명 (선택)"></div>
          <div class="fg"><label>문의내용 (선택)</label><textarea class="fta" name="문의내용" placeholder="궁금한 점을 자유롭게 작성해 주세요."></textarea></div>
          <button type="submit" class="fsub">✍️ 무료 상담 신청하기</button>
        </form>
      </div>
    </div>
  </div>
</section>`;
}
