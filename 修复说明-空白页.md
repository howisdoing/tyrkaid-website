# 空白页修复说明

本版修复两个问题：

1. Cloudflare Workers Static Assets 不会自动执行旧的 Pages `functions/` 目录，因此 `/api/catalog` 可能被 SPA 回退成 `index.html`，前端拿到 `{}` 后对 `categories.map(...)` 调用导致白屏。
2. 前端现在会校验 API 返回值；即使 D1/API 暂时没绑定，也会显示演示数据而不是白屏。

新增 `worker.js` 作为 Worker 入口，并在 `wrangler.jsonc` 中设置：

- `main: ./worker.js`
- `assets.directory: ./dist`
- `assets.not_found_handling: single-page-application`
- `assets.run_worker_first: ["/api/*"]`

这样 `/api/*` 先进入 Worker，其他页面走 Vite 静态资源和 SPA 回退。

部署后仍需在 Cloudflare Worker 的 Bindings 中把已有 D1 数据库绑定为 `DB`。
