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

      // For HTML navigation requests, fetch the SPA shell and the public catalog/settings
      // in parallel, then inject the current D1 data into the first HTML response.
      // This removes the extra /api/catalog round trip on first paint and prevents stale
      // DEFAULT_SETTINGS from flashing before the real site settings arrive.
      const accept = request.headers.get('Accept') || '';
      const isHtmlNavigation = request.method === 'GET' && accept.includes('text/html');
      if (isHtmlNavigation) {
        const [assetResponse, bootstrap] = await Promise.all([
          env.ASSETS.fetch(request),
          allCatalog(env.DB)
        ]);
        const contentType = assetResponse.headers.get('Content-Type') || '';
        if (contentType.includes('text/html')) {
          let html = await assetResponse.text();
          const safeJson = JSON.stringify(bootstrap)
            .replace(/</g, '\\u003c')
            .replace(/>/g, '\\u003e')
            .replace(/&/g, '\\u0026')
            .replace(/\u2028/g, '\\u2028')
            .replace(/\u2029/g, '\\u2029');
          const bootstrapScript = `<script>window.__TYRKAID_BOOTSTRAP__=${safeJson};</script>`;
          const heroUrl = bootstrap?.settings?.hero_image_url;
          const heroPreload = heroUrl
            ? `<link rel="preload" as="image" href="${String(heroUrl).replace(/&/g,'&amp;').replace(/"/g,'&quot;')}" fetchpriority="high">`
            : '';
          html = html.includes('</head>')
            ? html.replace('</head>', `${heroPreload}${bootstrapScript}</head>`)
            : heroPreload + bootstrapScript + html;
          const h = new Headers(assetResponse.headers);
          h.set('Content-Type', 'text/html; charset=utf-8');
          h.set('Cache-Control', 'no-cache, must-revalidate');
          h.delete('Content-Length');
          return new Response(html, {status: assetResponse.status, statusText: assetResponse.statusText, headers: h});
        }
        return assetResponse;
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
