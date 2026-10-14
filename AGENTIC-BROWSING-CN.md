# Lighthouse 智能体浏览修复

## 原问题
SPA fallback 会把不存在的：
- `/llms.txt`
- `/.well-known/ai-catalog.json`

返回成 `index.html`。

所以 Lighthouse 会看到：
- llms.txt 没有 Markdown H1 和链接
- ai-catalog.json 实际是 HTML，JSON 解析失败

## 本版本新增

### `/llms.txt`
动态读取 D1，生成 Markdown：
- H1 公司名称
- 首页 / 产品 / About / News / Contact 链接
- 产品分类链接
- 推荐产品链接
- 最新新闻链接

### AI Catalog
同时支持：
- `/.well-known/ai-catalog.json`
- `/ai-catalog.json`

返回有效的 AI Catalog 1.0 JSON。

### ARD
同时支持：
- `/.well-known/ard.json`
- `/ard.json`

并在 HTML head 中加入 `rel="ard"` 发现链接。

当前 TYRKAID 网站是企业展示站，不对外发布 MCP / Agent / Tool 等可调用 AI 资源，因此 catalog 的 `entries` 保持空数组，避免虚构能力。

## 部署后验证

打开：

`/llms.txt`

应看到 Markdown 文本。

打开：

`/.well-known/ai-catalog.json`

应看到 JSON，而不是 HTML。

打开：

`/.well-known/ard.json`

应看到 JSON-LD。


## ARD 规范说明

当前 ARD 的标准发现路径是：

`/.well-known/ard.json`

本版本的 ARD manifest 使用最小有效结构：

```json
{
  "entries": []
}
```

因为 TYRKAID 当前是企业展示网站，并没有公开 MCP Server、Agent、Skill 或其他可调用智能体资源，所以不虚构 entries。
旧的 `/.well-known/ai-catalog.json` 继续保留，仅用于兼容仍检查旧路径的客户端/Lighthouse。
