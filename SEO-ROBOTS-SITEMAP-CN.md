# SEO：robots.txt 与 sitemap.xml 修复

## 原问题
由于项目使用 SPA fallback，访问：

`/robots.txt`

时没有真实 robots 文件，Cloudflare 返回了 `index.html`。
Lighthouse 因而把 HTML 当 robots.txt 解析，出现：
- Unknown directive
- Syntax not understood
- robots.txt 无效

## 本版本修复
Worker 直接处理：

### `/robots.txt`
返回纯文本：
- 允许搜索引擎抓取全站
- 禁止抓取 `/admin`
- 自动指向当前域名的 `/sitemap.xml`

### `/sitemap.xml`
动态读取 D1，并自动列出：
- 首页
- 产品中心
- About
- News
- Contact
- 所有产品分类
- 所有产品详情
- 所有已发布新闻详情

因此以后新增产品、分类或新闻，不需要手动更新 sitemap。

## 验证
部署后打开：

`https://你的域名/robots.txt`

应该看到纯文本，不是 HTML。

再打开：

`https://你的域名/sitemap.xml`

应该看到 XML URL 列表。
