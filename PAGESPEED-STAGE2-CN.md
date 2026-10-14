# PageSpeed 第二阶段优化

这版针对第二次 Lighthouse 结果做了取舍调整。

## 1. 文档请求延迟
上一版为了减少 `/api/catalog` 往返，把 D1 查询放进 HTML 文档返回链路。
这会让浏览器必须等 D1 查询结束才能拿到 HTML，在移动网络下反而增加 TTFB。

本版改回：
- HTML / JS / 图片直接由 Cloudflare Static Assets 返回
- Worker 只优先处理 `/api/*`
- 首屏仍使用中性加载状态，因此不会闪现旧的 DEFAULT_SETTINGS

## 2. 渲染阻塞 CSS
Vite 构建时把 CSS 直接内联到 `index.html`：
- 消除单独 CSS 网络请求
- 减少渲染阻塞和依赖树
- CSS 体积较小，适合当前项目

## 3. 初始 DOM / 主线程
对首屏以下 `.section` 和页脚启用 `content-visibility:auto`，
浏览器可以延后布局/绘制视口外内容，降低初始主线程工作。

## 4. 图片 189 KiB
后台新上传的大图仍会自动尝试压缩并转换 WebP。
但已经存在 GitHub 的旧图不会自动重新编码。
PageSpeed 如果仍列出旧图，请在后台重新上传替换对应图片。

## 5. 未使用 JavaScript 约 30 KiB
目前数值不大，本阶段没有大规模重构后台代码。
若后续仍要继续压分数，可把 `/admin` 单独拆成动态 chunk。
