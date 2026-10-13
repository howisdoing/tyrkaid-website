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
