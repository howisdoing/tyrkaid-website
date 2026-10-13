# Cloudflare 免费企业产品展示站

这是一套不依赖 Supabase、R2、Cloudflare Access 或 Vercel 的企业产品展示网站。

## 架构

- GitHub：保存代码和产品/新闻图片
- Cloudflare Pages：部署 React/Vite 前台
- Cloudflare Pages Functions：提供后台 API
- Cloudflare D1：保存产品分类、产品、技术参数和新闻
- 自建管理员登录：用户名/密码保存在 Cloudflare Secrets，登录状态使用 HttpOnly Cookie

## 目录

- `src/` 前台和后台界面
- `functions/` Cloudflare Pages Functions API
- `d1/schema.sql` D1 数据库建表和演示数据
- `public/uploads/products/` 产品图片
- `public/uploads/news/` 新闻图片
- `部署教程-中文.md` 完整部署教程

## Cloudflare 构建参数

- Framework preset: React / Vite
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 留空

## 必须配置的 D1 Binding

Binding name 必须是：`DB`

## 必须配置的 Secrets / Variables

敏感项请设置为 Secret：

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `SESSION_SECRET`（建议 32 字符以上随机字符串）
- `GITHUB_TOKEN`

普通变量：

- `GITHUB_OWNER`
- `GITHUB_REPO`
- `GITHUB_BRANCH`，通常填 `main`

## 重要说明

后台上传图片后，图片会提交到 GitHub 的 `public/uploads/`。GitHub 的新 commit 会触发 Cloudflare 自动重新部署。部署完成后，图片正式可访问。

单张图片在此项目中限制为 5 MB。实际使用建议压缩到 300–800 KB，并优先用 WebP/JPEG。
