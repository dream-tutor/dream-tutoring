const SITE_URL = 'https://dreamtutor.kr';
const SITE_NAME = '드림과외';

// 메타태그 + JSON-LD 생성
export function buildHead({ title, description, url, type = 'local' }) {
  const schema = buildSchema({ title, description, url, type });
  return `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${SITE_URL}${url}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${SITE_URL}${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${SITE_NAME}">
<meta name="naver-site-verification" content="YOUR_NAVER_KEY">
<script type="application/ld+json">${JSON.stringify(schema)}</script>`.trim();
}

function buildSchema({ title, description, url, type }) {
  const base = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE_NAME,
    description,
    url: `${SITE_URL}${url}`,
    priceRange: '$$',
    image: `${SITE_URL}/og-image.png`,
    sameAs: [`${SITE_URL}`],
  };

  if (type === 'local') {
    return {
      ...base,
      '@type': 'TutoringService',
      serviceType: title,
      areaServed: { '@type': 'Place', name: title },
    };
  }

  if (type === 'online') {
    return {
      ...base,
      '@type': 'TutoringService',
      serviceType: '화상과외',
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceType: '온라인 화상',
      },
    };
  }

  return base;
}

// FAQ 스키마 (각 페이지 하단용)
export function buildFAQSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
