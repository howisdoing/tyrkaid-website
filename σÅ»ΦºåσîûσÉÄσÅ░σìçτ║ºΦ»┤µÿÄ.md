# Tyrkaid 可视化后台升级说明

本版本在原有产品、产品分类、新闻后台基础上，新增“网站装修”和“导航菜单”管理。

## 新增功能

### 网站装修
后台 `/admin` → `网站装修` 可直接编辑并实时预览：

- 公司中文名称
- 公司英文名称
- 品牌名称、副标题
- Logo 上传、替换、移除
- 首页 Banner 小标题、主标题、说明
- 首页 Banner 图片上传、替换、移除
- 首页两个按钮的文字与链接
- About Us 页面标题、简介、正文标题、正文内容
- About Us 图片上传、替换、移除
- Contact Us 页面标题、简介
- 地址、电话、邮箱、WhatsApp
- Contact 右侧产品支持文案
- 页脚简介和版权文字

文字保存后直接写入 Cloudflare D1，无需重新构建。图片仍使用 GitHub 图片存储：上传后后台立即本地预览，Cloudflare 自动部署完成后正式图片地址生效。

### 导航菜单
后台 `/admin` → `导航菜单` 可：

- 新增菜单
- 编辑菜单名称
- 修改链接路径
- 修改排序
- 显示/隐藏
- 删除菜单

## 升级已有数据库：必须执行一次

升级代码前后均可，在 Cloudflare → D1 SQLite 数据库 → `industrial-catalog-db` → 控制台中，打开并执行：

`d1/site-settings-migration.sql`

它只新增 `site_settings` 与 `navigation` 两张表，不会删除原有产品、分类、新闻。

执行后可用下面 SQL 检查：

```sql
SELECT name FROM sqlite_master WHERE type='table';
```

应能看到：

- categories
- products
- news
- site_settings
- navigation

## 部署

1. 将本压缩包完整覆盖 GitHub 当前网站仓库。
2. Commit changes。
3. 等 Cloudflare 自动部署成功。
4. 执行 `d1/site-settings-migration.sql`（如果尚未执行）。
5. 打开 `/admin`。
6. 进入“网站装修”修改内容并保存。

原有这些 Cloudflare 配置无需重新设置：

- DB
- ADMIN_USERNAME
- ADMIN_PASSWORD
- SESSION_SECRET
- GITHUB_TOKEN
- GITHUB_OWNER
- GITHUB_REPO
- GITHUB_BRANCH

D1 Database ID 仍已固化在 `wrangler.jsonc`。
