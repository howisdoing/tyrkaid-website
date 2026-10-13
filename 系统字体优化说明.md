# 系统字体优化版

本版本基于当前正常布局版制作，只替换字体来源，不改变页面网格、宽高、图片规则、导航结构、后台功能或 D1/GitHub 配置。

## 已修改

- 删除 Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`) 依赖。
- 全站改为系统字体栈：macOS/iOS 优先使用系统字体和苹方，Windows 优先使用 Segoe UI / 微软雅黑。
- 首页、产品中心、产品详情、新闻、About、Contact、后台的标题做了轻微字距校正，以减少字体替换后的换行变化。
- 保留现有顶部宣传语字号、产品图片、多图图库、图片库、可视化后台等全部功能。

## 部署

直接整包覆盖 GitHub 当前仓库并 Commit，等待 Cloudflare 自动部署即可。无需修改 D1、Secrets 或环境变量。
