# 드림과외 SEO Workers 프로젝트

## 프로젝트 개요
- dreamtutor.kr 과외 사이트 SEO 최적화
- Cloudflare Workers로 동적 페이지 생성
- 한국어 URL 기반 (/고덕동수학과외 등)

## 현재 상태
- 총 383,059개 페이지 생성 중 (2026-03-24 기준)
- 전국 행정구역 데이터 확장 반영 후 수치

## 파일 구조
- src/index.js: Workers 메인 엔트리
- src/router.js: URL 파싱 및 라우팅
- src/renderer.js: 페이지 HTML 생성
- src/seo.js: 메타태그 + JSON-LD
- src/template.js: 공통 레이아웃
- src/data/regions.js: 지역 데이터
- src/data/schools.js: 학교 데이터 (DONG_SCHOOLS)

## 중요 규칙
- 전화번호 010-4864-5345 텍스트 노출 금지 (버튼만)
- 과장 표현 금지 (No.1, 최고 등)
- 통계: 30년+ 교육노하우, 100만+ 회원, 2000명+ 선생님
- 모바일 가독성 우선
- Google Apps Script URL: https://script.google.com/macros/s/AKfycbysEqIGSI9Dz4h4jup9Rn72KBNuuCObBifH_wAPSePhHt3wMe4RDBOxlwupxmrPeXqVjw/exec

## 다음 작업
- sitemap-seo.xml 최종 제출
