import { allCatalog } from './functions/_lib/db.js';
import { onRequestGet as catalogGet } from './functions/api/catalog.js';
import { onRequestPost as loginPost } from './functions/api/auth/login.js';
import { onRequestGet as sessionGet } from './functions/api/auth/session.js';
import { onRequestPost as logoutPost } from './functions/api/auth/logout.js';
import { onRequest as adminItems } from './functions/api/admin/items.js';
import { onRequestPost as adminUpload } from './functions/api/admin/upload.js';
import { onRequest as adminMedia } from './functions/api/admin/media.js';

const methodNotAllowed = () => new Response(JSON.stringify({error:'Method not allowed'}), {
  status: 405,
  headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
});

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (path === '/llms.txt') {
        const origin = url.origin;
        let data = {categories:[], products:[], news:[], settings:{}};
        try { data = await allCatalog(env.DB); } catch {}
        const s = data.settings || {};
        const lines = [
          `# ${s.company_name_en || s.company_name_cn || 'TYRKAID Machinery'}`,
          '',
          s.footer_description || s.about_page_intro || 'Rubber, plastic and silicone mixing equipment manufacturer.',
          '',
          '## Main pages',
          '',
          `- [Home](${origin}/)`,
          `- [Products](${origin}/products)`,
          `- [About Us](${origin}/about)`,
          `- [News](${origin}/news)`,
          `- [Contact Us](${origin}/contact)`,
          '',
          '## Product categories',
          ''
        ];
        for (const c of data.categories || []) {
          if (c?.slug && c?.name) lines.push(`- [${c.name}](${origin}/categories/${encodeURIComponent(c.slug)})`);
        }
        lines.push('', '## Featured products', '');
        for (const p of (data.products || []).filter(x=>x.featured).slice(0,12)) {
          if (p?.slug && (p?.name || p?.model)) lines.push(`- [${p.model ? p.model + ' - ' : ''}${p.name || ''}](${origin}/products/${encodeURIComponent(p.slug)})`);
        }
        lines.push('', '## Latest news', '');
        for (const n of (data.news || []).slice(0,10)) {
          if (n?.slug && n?.title) lines.push(`- [${n.title}](${origin}/news/${encodeURIComponent(n.slug)})`);
        }
        lines.push('');
        return new Response(lines.join('\n'), {
          headers: {
            'Content-Type': 'text/markdown; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (path === '/.well-known/ai-catalog.json' || path === '/ai-catalog.json') {
        const origin = url.origin;
        const body = {
          specVersion: '1.0',
          host: {
            displayName: 'TYRKAID Machinery',
            documentationUrl: `${origin}/about`
          },
          entries: []
        };
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (path === '/.well-known/ard.json' || path === '/ard.json') {
        const body = { entries: [] };
        return new Response(JSON.stringify(body, null, 2), {
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (path === '/robots.txt') {
        const origin = url.origin;
        const body = [
          'User-agent: *',
          'Allow: /',
          'Disallow: /admin',
          '',
          `Sitemap: ${origin}/sitemap.xml`,
          ''
        ].join('\n');
        return new Response(body, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (path === '/sitemap.xml') {
        const data = await allCatalog(env.DB);
        const origin = url.origin;
        const urls = new Set([
          `${origin}/`,
          `${origin}/products`,
          `${origin}/about`,
          `${origin}/news`,
          `${origin}/contact`
        ]);

        for (const c of data.categories || []) {
          if (c?.slug) urls.add(`${origin}/categories/${encodeURIComponent(c.slug)}`);
        }
        for (const p of data.products || []) {
          if (p?.slug) urls.add(`${origin}/products/${encodeURIComponent(p.slug)}`);
        }
        for (const n of data.news || []) {
          if (n?.slug) urls.add(`${origin}/news/${encodeURIComponent(n.slug)}`);
        }

        const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          [...urls].map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n') +
          `\n</urlset>`;

        return new Response(body, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600'
          }
        });
      }

      if (path === '/api/catalog') {
        return request.method === 'GET' ? catalogGet({request, env, ctx}) : methodNotAllowed();
      }
      if (path === '/api/auth/login') {
        return request.method === 'POST' ? loginPost({request, env, ctx}) : methodNotAllowed();
      }
      if (path === '/api/auth/session') {
        return request.method === 'GET' ? sessionGet({request, env, ctx}) : methodNotAllowed();
      }
      if (path === '/api/auth/logout') {
        return request.method === 'POST' ? logoutPost({request, env, ctx}) : methodNotAllowed();
      }
      if (path === '/api/admin/items') {
        return adminItems({request, env, ctx});
      }
      if (path === '/api/admin/upload') {
        return request.method === 'POST' ? adminUpload({request, env, ctx}) : methodNotAllowed();
      }
      if (path === '/api/admin/media') {
        return adminMedia({request, env, ctx});
      }
      if (path.startsWith('/api/')) {
        return new Response(JSON.stringify({error:'API route not found'}), {
          status: 404,
          headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
        });
      }

      return env.ASSETS.fetch(request);
    } catch (error) {
      if (path.startsWith('/api/')) {
        return new Response(JSON.stringify({error:error?.message || 'Internal server error'}), {
          status: 500,
          headers: {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}
        });
      }
      throw error;
    }
  }
};
