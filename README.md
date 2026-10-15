# TYRKAID · Karee-style Fixed Header Release

本版保留 Karee 风格内容区，但恢复稳定的 TYRKAID 两层页头。

## 保留
- Cloudflare Workers + D1 + GitHub 图片存储
- Karee 风格首页内容区
- Karee 风格产品中心
- Karee 风格产品详情
- 后台 Dashboard / 产品 / 新闻 / 网站装修 / 图片库 / 导航

## 本次修正
1. 顶部恢复：
   - Logo
   - 宣传语
   - 主营产品
   - 服务热线
   - 第二行横向导航
2. 整个顶部桌面端继续 sticky
3. 每个前台页面都有右侧联系方式悬浮按钮
4. 产品图片统一 contain，完整显示机器，不裁切
5. 首页产品卡、分类图、产品详情主图、缩略图和更多图片均完整显示

部署：
GitHub 整包覆盖 → Commit → Cloudflare 自动部署。
