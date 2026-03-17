import { parseRoute, getAllRoutes } from './router.js';
import { renderDongPage, renderGuPage, renderSidoPage, renderSchoolPage, renderOnlinePage } from './renderer.js';

const SITE_URL = 'https://dreamtutor.kr';
const CHUNK_SIZE = 45000;

// 모듈 초기화 시 1회 계산 (Workers 시작 CPU 시간, 요청당 제한 없음)
const ALL_ROUTES = getAllRoutes();
const CHUNK_COUNT = Math.ceil(ALL_ROUTES.length / CHUNK_SIZE);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 사이트맵 인덱스
    if (pathname === '/sitemap-seo.xml') {
      return handleSitemapIndex();
    }

    // 청크별 사이트맵 /sitemap-seo-1.xml ~ /sitemap-seo-N.xml
    const chunkMatch = pathname.match(/^\/sitemap-seo-(\d+)\.xml$/);
    if (chunkMatch) {
      return handleSitemapChunk(parseInt(chunkMatch[1], 10));
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
