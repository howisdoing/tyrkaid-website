# PageSpeed 第一阶段优化

本版本不改页面视觉结构，主要处理 PageSpeed 报告中的高价值项。

## 1. 首屏数据请求瀑布
以前：
HTML → JS → `/api/catalog` → D1 → 页面

现在：
Worker 在返回 HTML 时并行读取 D1，并把当前公开数据注入首屏 HTML。
React 启动后直接使用注入数据，不再额外等待 `/api/catalog` 才显示页面。

效果：
- 减少一次首屏网络往返
- 保留“刷新不闪旧内容”
- 降低首屏/LCP 等待

## 2. 图片加载策略
- Logo / 首页 Banner / 产品详情主图：eager + high priority
- 产品列表非关键图片、缩略图、About 图片、新闻封面：lazy loading
- 所有主要图片增加 async decode

## 3. 后台上传图片自动压缩
后台新上传的 JPEG / PNG / WebP：
- 大于约 220 KB 才尝试优化
- 最大边限制约 1800 px
- 自动转 WebP（质量约 82%）
- 如果压缩后反而没有明显变小，则保留原文件

注意：已经存在 GitHub 的旧图片不会被自动重压缩。
如果要压缩旧图，需要在后台重新上传替换。

## 4. 静态资源缓存
- `/assets/*`：1 年 immutable
- `/uploads/*`：1 年 immutable
- favicon：1 天

因为上传图片文件名带时间戳和随机 ID，所以可安全长期缓存。

## 5. 没有做的高风险改动
本阶段没有拆分后台代码，也没有改变现有 UI/路由/数据库结构。
PageSpeed 的“未使用 JavaScript”只有约 28 KiB，优先级低于图片和首屏请求链，因此留到第二阶段。
