# TYRKAID · Karee-style Cloudflare Edition

这一版以 www.leoloo.cn / Karee Fitness 的公开页面结构和设计语言为参考，
重做 TYRKAID 前台和后台视觉，但继续使用现有：

- Cloudflare Workers + Static Assets
- Cloudflare D1
- GitHub 图片存储
- /admin 后台登录
- 产品 / 分类 / 新闻 / 网站装修 / 图片库 / 导航
- 产品“推荐到首页”
- 后台首页 Dashboard
- robots.txt / sitemap.xml / llms.txt / ARD
- 多图产品图库

## 前台
- 极简白底 sticky header
- 首页：Hero → 产品分类 → 精选产品 → 关于我们 → 新闻
- 产品中心：分类筛选 + 搜索 + 产品卡片
- 产品详情：主图 + 多缩略图 + 概览 + 技术参数 + 更多图片
- 工业设备图片继续使用 contain，避免裁切机器

## 后台
保留原功能与 D1 数据结构，只统一为更轻、更简洁的视觉样式。

## 部署
1. 整包覆盖 GitHub 仓库。
2. Commit / Push。
3. 等 Cloudflare 自动部署。
4. 原有 D1、Secrets 和 GitHub Token 无需重新设置。
