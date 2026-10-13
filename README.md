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
