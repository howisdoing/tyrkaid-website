# 图片库升级说明

后台新增“图片库”栏目：

- 浏览 `public/uploads/products/`、`public/uploads/news/`、`public/uploads/site/`
- 按分类筛选和按文件名搜索
- 从图片库直接批量上传图片
- 标记图片是否正在被产品、新闻、Logo、Banner、About 页面引用
- 使用中的图片自动保护，不允许直接删除
- 未使用图片可多选并“一次批量删除”
- 批量删除只产生一次 GitHub commit，然后 Cloudflare 自动重新部署

## 是否需要改数据库？
不需要。沿用当前 D1 数据库。

## 是否需要新增 Secret？
不需要。继续使用现有：
- GITHUB_TOKEN
- GITHUB_OWNER
- GITHUB_REPO
- GITHUB_BRANCH
- ADMIN_USERNAME
- ADMIN_PASSWORD
- SESSION_SECRET

## 删除正在使用的图片
为了避免前台出现破图，图片库不会直接删除“使用中”的图片。请先到产品、新闻或网站装修中移除该图片并保存，再回图片库删除。
