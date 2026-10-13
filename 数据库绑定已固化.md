# D1 数据库绑定已固化

本版本已经把 D1 数据库绑定直接写入 `wrangler.jsonc`：

- Binding：`DB`
- Database name：`industrial-catalog-db`
- Database ID：`fae4447c-5c95-4030-b0c3-aecc3e60a487`

因此以后整包覆盖 GitHub 并由 Cloudflare 自动部署时，不需要再手动添加 D1 Binding。

注意：如果将来你删除并重新创建 D1 数据库，Database ID 会改变，届时需要同步修改 `wrangler.jsonc`。
