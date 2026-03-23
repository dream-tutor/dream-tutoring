import { parseRoute, getAllRoutes } from './router.js';
import { renderDongPage, renderGuPage, renderSidoPage, renderSchoolPage, renderOnlinePage, renderHomePage } from './renderer.js';

const SITE_URL = 'https://dreamtutor.kr';
const CHUNK_SIZE = 45000;

// 모듈 초기화 시 1회 계산 (Workers 시작 CPU 시간, 요청당 제한 없음)
const ALL_ROUTES = getAllRoutes();
const CHUNK_COUNT = Math.ceil(ALL_ROUTES.length / CHUNK_SIZE);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // robots.txt
    if (pathname === '/robots.txt') {
      return new Response(
        `User-agent: *\nAllow: /\n\nUser-agent: Yeti\nAllow: /\n\nUser-agent: Googlebot\nAllow: /\n\nSitemap: https://dreamtutor.kr/sitemap-seo.xml\n`,
        {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400',
          },
        }
      );
    }

    // 사이트맵 인덱스
    if (pathname === '/sitemap-seo.xml') {
      return handleSitemapIndex();
    }

    // 청크별 사이트맵 /sitemap-seo-1.xml ~ /sitemap-seo-N.xml
    const chunkMatch = pathname.match(/^\/sitemap-seo-(\d+)\.xml$/);
    if (chunkMatch) {
      return handleSitemapChunk(parseInt(chunkMatch[1], 10));
    }

    // 파비콘
    if (pathname === '/favicon.ico' || pathname === '/favicon.svg') {
      const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#0D1B2A"/>
  <text x="16" y="24" font-family="Georgia,serif" font-size="22" font-weight="700" fill="#F59E0B" text-anchor="middle">D</text>
</svg>`;
      return new Response(favicon, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=604800',
        },
      });
    }

    // OG 이미지 동적 생성
    if (pathname === '/og-image.png') {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
        <rect width="1200" height="630" fill="#0D1B2A"/>
        <rect x="0" y="0" width="1200" height="6" fill="#2563EB"/>
        <text x="600" y="260" font-family="Arial,sans-serif" font-size="96" font-weight="bold" fill="white" text-anchor="middle">드림과외</text>
        <text x="600" y="360" font-family="Arial,sans-serif" font-size="42" fill="#93c5fd" text-anchor="middle">전국 1:1 전문 과외 매칭 서비스</text>
        <text x="600" y="440" font-family="Arial,sans-serif" font-size="30" fill="rgba(255,255,255,0.6)" text-anchor="middle">초·중·고 전 과목 · 방문·화상과외 · 24시간 내 매칭</text>
        <rect x="460" y="490" width="280" height="60" rx="12" fill="#2563EB"/>
        <text x="600" y="528" font-family="Arial,sans-serif" font-size="26" font-weight="bold" fill="white" text-anchor="middle">무료 상담 신청</text>
      </svg>`;
      return new Response(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // 구 정적 HTML 파일 → Workers 한국어 URL로 301 리다이렉트
    const HTML_REDIRECTS = {
      '/gwangmyeong.html':              '/광명시과외',
      '/gwangmyeong-dong-math.html':    '/광명동수학과외',
      '/gwangmyeong-dong-english.html': '/광명동영어과외',
      '/cheolsan-dong-math.html':       '/철산동수학과외',
      '/cheolsan-dong-english.html':    '/철산동영어과외',
      '/haan-dong-math.html':           '/하안동수학과외',
      '/haan-dong-english.html':        '/하안동영어과외',
      '/soha-dong-math.html':           '/소하동수학과외',
      '/soha-dong-english.html':        '/소하동영어과외',
      '/iljik-dong-math.html':          '/일직동수학과외',
      '/iljik-dong-english.html':       '/일직동영어과외',
    };
    if (HTML_REDIRECTS[pathname]) {
      return Response.redirect(SITE_URL + HTML_REDIRECTS[pathname], 301);
    }

    // 홈페이지
    if (pathname === '/') {
      return new Response(renderHomePage(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
        },
      });
    }

    // 라우트 파싱 - 매칭 안 되면 Pages/Origin으로 pass-through
    const route = parseRoute(pathname);
    if (!route) return fetch(request);

    let html;
    try {
      if (route.type === 'dong') {
        html = renderDongPage(route.params);
      } else if (route.type === 'gu') {
        html = renderGuPage(route.params);
      } else if (route.type === 'sido') {
        html = renderSidoPage(route.params);
      } else if (route.type === 'school') {
        html = renderSchoolPage(route.params);
      } else if (route.type === 'online') {
        html = renderOnlinePage(route.params);
      } else {
        return new Response(null, { status: 404 });
      }
    } catch (e) {
      console.error(e);
      return new Response('Server Error', { status: 500 });
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Robots-Tag': 'index, follow',
      },
    });
  },
};

// 사이트맵 인덱스 - 청크 목록만 반환 (빠름)
function handleSitemapIndex() {
  const today = new Date().toISOString().split('T')[0];
  const sitemaps = Array.from({ length: CHUNK_COUNT }, (_, i) =>
    `<sitemap><loc>${SITE_URL}/sitemap-seo-${i + 1}.xml</loc><lastmod>${today}</lastmod></sitemap>`
  ).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

// 청크 사이트맵 - 최대 45,000개 URL
function handleSitemapChunk(chunkNum) {
  if (chunkNum < 1 || chunkNum > CHUNK_COUNT) {
    return new Response('Not Found', { status: 404 });
  }

  const start = (chunkNum - 1) * CHUNK_SIZE;
  const chunk = ALL_ROUTES.slice(start, start + CHUNK_SIZE);
  const today = new Date().toISOString().split('T')[0];

  const urls = chunk.map(r =>
    `<url><loc>${SITE_URL}${r}</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`
  ).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
