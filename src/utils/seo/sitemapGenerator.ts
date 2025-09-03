interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

const baseUrl = 'https://fundroad.com';

// Static pages configuration
const staticPages: SitemapUrl[] = [
  {
    loc: '/',
    changefreq: 'weekly',
    priority: 1.0,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/fonctionnalites',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/blog',
    changefreq: 'daily',
    priority: 0.9,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/contact',
    changefreq: 'monthly',
    priority: 0.7,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/tarifs',
    changefreq: 'monthly',
    priority: 0.8,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/politique-confidentialite',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    loc: '/conditions-generales',
    changefreq: 'yearly',
    priority: 0.3,
    lastmod: new Date().toISOString().split('T')[0]
  }
];

// Generate XML sitemap
export const generateSitemap = async (blogArticles?: any[]): Promise<string> => {
  let urls = [...staticPages];

  // Add blog articles if provided
  if (blogArticles && blogArticles.length > 0) {
    const blogUrls: SitemapUrl[] = blogArticles.map(article => ({
      loc: `/blog/${article.slug}`,
      lastmod: new Date(article.created_at).toISOString().split('T')[0],
      changefreq: 'monthly' as const,
      priority: 0.6
    }));
    urls = [...urls, ...blogUrls];
  }

  const urlsXml = urls.map(url => `
  <url>
    <loc>${baseUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    ${url.changefreq ? `<changefreq>${url.changefreq}</changefreq>` : ''}
    ${url.priority !== undefined ? `<priority>${url.priority}</priority>` : ''}
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`;
};

// Generate robots.txt content
export const generateRobotsTxt = (): string => {
  return `# Robots.txt pour Fund Road
User-agent: *
Allow: /

# Pages privées - Interdites aux moteurs de recherche
Disallow: /admin/
Disallow: /dashboard/
Disallow: /roadmap/
Disallow: /auth/
Disallow: /confirm/
Disallow: /financing/
Disallow: /_/
Disallow: /api/

# Fichiers et dossiers techniques
Disallow: /*.json$
Disallow: /src/
Disallow: /node_modules/

# Optimisation pour les moteurs de recherche spécifiques
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Dernière mise à jour: ${new Date().toISOString().split('T')[0]}
`;
};