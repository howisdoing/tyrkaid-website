# TYRKAID 网站修改说明

本版本参考 tyrkaid.com 的信息架构和产品展示重点进行重新设计，但不是网页复制。

已修改：
- 品牌文字：TYRKAID MACHINERY
- 首页 Hero 与产品行业定位
- 首页 17+ / 1-stop / 24/7 / 98% 数据区
- Why Tyrkaid：耐用性、易用性、安全性
- About Tyrkaid 页面
- Contact 页面
- Footer 公司信息
- 产品中心仍然从 D1 后台读取，保持可维护性

## 可选：修改 D1 产品分类

Cloudflare D1 → industrial-catalog-db → 控制台，复制执行：

`d1/tyrkaid-categories.sql`

它会把当前演示分类改成：
1. Open Mixing Mill
2. Internal Mixer
3. Double-Cone Calender
4. Rubber Mixing Auxiliary Equipment

注意：现有两条演示产品仍然是测试产品。建议后台登录后删除，再录入真实产品型号和图片。

## Logo

目前使用的是文字版 TYRKAID 标识，没有复制参考网站的 Logo 图片。如果有正式 Logo，请上传给 ChatGPT 或把 Logo 文件放到 `public/`，再替换顶部 Logo。
