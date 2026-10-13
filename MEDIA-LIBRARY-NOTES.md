# Tyrkaid 中文官网 · Cloudflare 可视化后台版

架构：GitHub + Cloudflare Workers Static Assets + D1 + GitHub 图片存储。

后台 `/admin` 已支持：

- 网站装修：公司名称、Logo、Banner、About Us、Contact Us、页脚
- 导航菜单：新增、编辑、删除、排序、显示/隐藏
- 产品分类管理
- 产品管理与多图上传
- 新闻管理与封面图上传

## 已有网站升级

先完整覆盖代码，再在 D1 控制台执行：

`d1/site-settings-migration.sql`

详细见：`可视化后台升级说明.md`

## 图片库 / Media Library
后台新增“图片库”：读取 GitHub `public/uploads/` 中的产品、新闻和网站装修图片，支持分类筛选、搜索、上传、查看占用关系、选择多张未使用图片并一次批量删除。正在被产品、新闻、Logo、Banner 或 About 页面引用的图片会自动保护，防止误删导致前台破图。此功能复用现有 `GITHUB_TOKEN`，不需要新增 D1 表或环境变量。
