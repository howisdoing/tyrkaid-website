# 部署说明

构建命令：
npm run build

输出目录：
dist

Cloudflare D1 Binding：
DB

数据库：
industrial-catalog-db

已存在的 Cloudflare Secrets / Variables 保持不变：
- ADMIN_USERNAME
- ADMIN_PASSWORD
- SESSION_SECRET
- GITHUB_TOKEN
- GITHUB_OWNER
- GITHUB_REPO
- GITHUB_BRANCH

更新流程：
GitHub 整包覆盖 → Commit → Cloudflare 自动部署。
