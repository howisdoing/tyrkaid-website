# GitHub + Cloudflare Pages/Functions + D1 部署教程（无需绑定信用卡版）

> 本项目不使用 Supabase、R2、Cloudflare Access、Vercel。正常使用 GitHub Free、Cloudflare Pages/Workers Free 和 D1 Free 即可起步。

---

## 一、你最终会得到什么

网站前台：
- 首页
- 产品中心
- 产品分类
- 产品型号详情页
- 多张产品图、缩略图、大图
- 产品介绍和技术参数
- 公司新闻

管理后台：
- `/admin`
- 管理产品分类
- 新增/修改/删除产品
- 上传产品图片
- 发布/修改/删除新闻
- 上传新闻封面

数据与图片：
- D1 保存文字和结构化数据
- GitHub 仓库保存图片

---

## 二、先上传项目到 GitHub

### 1. 创建仓库

登录 GitHub，点击 **New repository**。

建议名称：

`company-website`

仓库可以是 Public 或 Private。Cloudflare Git Integration 支持连接 GitHub 仓库。

### 2. 上传文件

把本 ZIP 解压后的所有文件上传到仓库根目录。

正确结构应该是：

```text
company-website/
├── package.json
├── index.html
├── vite.config.js
├── src/
├── functions/
├── public/
├── d1/
└── 部署教程-中文.md
```

不要再套一层文件夹。

---

## 三、创建 Cloudflare D1 数据库

### 1. 打开 Cloudflare Dashboard

进入 **D1 SQL Database**，点击 **Create database**。

建议数据库名：

`industrial-catalog-db`

位置可以按主要访问区域选择；不确定就用默认。

### 2. 初始化数据库

创建成功后进入数据库，选择 **Console**。

打开项目里的：

`d1/schema.sql`

复制全部 SQL，粘贴到 D1 Console，然后点击 **Execute**。

执行完成后会建立：

- `categories`
- `products`
- `news`

并写入少量演示数据。

---

## 四、把 GitHub 项目部署到 Cloudflare Pages

### 1. 创建 Pages 项目

进入 Cloudflare：

**Workers & Pages → Create → Pages / Connect to Git**

连接 GitHub，然后选择刚才的 `company-website` 仓库。

### 2. 构建参数

填写：

```text
Framework preset: React / Vite
Production branch: main
Build command: npm run build
Build output directory: dist
Root directory: 留空
```

然后开始第一次部署。

第一次部署即使 D1 和 Secrets 还没配完，前台也可能显示演示数据；后台功能需要后面的配置。

---

## 五、给 Pages 项目绑定 D1

进入你的 Pages 项目：

**Settings → Bindings → Add → D1 database bindings**

填写：

```text
Variable name: DB
D1 database: industrial-catalog-db
```

这里的 Variable name 必须是：

`DB`

保存后，需要重新部署一次，D1 binding 才会生效。

---

## 六、创建后台登录账号

本项目不需要 Cloudflare Access。

后台账号密码保存在 Cloudflare 服务器端 Secret，不会放进 GitHub，也不会暴露到浏览器源码里。

进入：

**Pages 项目 → Settings → Variables and Secrets → Add**

建立以下 3 个 Secret：

### ADMIN_USERNAME

例如：

`admin`

### ADMIN_PASSWORD

设置一个强密码，例如至少 14–20 位，包含大小写字母、数字和符号。

不要使用示例密码。

### SESSION_SECRET

这是登录 Cookie 的签名密钥。

建议使用 32–64 位随机字符串，例如密码管理器自动生成。

以上三个建议都选择 **Encrypt / Secret**。

---

## 七、创建 GitHub 图片上传 Token

后台上传图片时，需要 Cloudflare Function 有权限把图片写进你自己的 GitHub 仓库。

建议使用 GitHub **Fine-grained personal access token**，不要用账号密码。

### 1. GitHub 中打开

**Settings → Developer settings → Personal access tokens → Fine-grained tokens**

点击创建新 token。

### 2. Repository access

选择：

**Only select repositories**

只选择你的：

`company-website`

不要授权全部仓库。

### 3. Repository permissions

给这个仓库：

**Contents: Read and write**

即可让后台通过 GitHub Contents API 创建图片文件。

设置合理的过期时间，例如 90 天、180 天或 1 年。到期后重新生成并更新 Cloudflare Secret。

### 4. 保存 Token

GitHub token 通常只完整显示一次，请立即复制。

不要：
- 放进 GitHub 代码
- 写进 `.env` 后上传
- 发给其他人

---

## 八、把 GitHub 参数放进 Cloudflare

回到：

**Cloudflare Pages 项目 → Settings → Variables and Secrets**

建立：

### GITHUB_TOKEN

类型：Secret / Encrypt

值：刚才生成的 Fine-grained token。

### GITHUB_OWNER

普通变量。

例如你的 GitHub 地址是：

`github.com/emily/company-website`

那么：

`GITHUB_OWNER = emily`

### GITHUB_REPO

`GITHUB_REPO = company-website`

### GITHUB_BRANCH

通常：

`GITHUB_BRANCH = main`

保存后重新部署。

---

## 九、最终 Cloudflare 设置应该是

### D1 Binding

```text
DB → industrial-catalog-db
```

### Secrets

```text
ADMIN_USERNAME
ADMIN_PASSWORD
SESSION_SECRET
GITHUB_TOKEN
```

### Variables

```text
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH=main
```

---

## 十、测试网站

Cloudflare 部署完成后会给你：

`https://xxxxx.pages.dev`

测试：

- `/`
- `/products`
- `/news`
- `/admin`

### 后台登录

打开：

`https://xxxxx.pages.dev/admin`

输入 Cloudflare Secrets 中配置的管理员用户名和密码。

登录成功后，可以管理分类、产品和新闻。

---

## 十一、第一次添加产品

推荐顺序：

1. 先进入 Categories
2. 创建产品分类
3. 再进入 Products
4. 新建产品型号
5. 选择所属分类
6. 填写产品介绍
7. 填写技术参数
8. 上传产品图片
9. 保存

技术参数一行一个：

```text
Mixing Capacity: 3 L
Motor Power: 7.5 kW
Rotor Speed: 40 rpm
Voltage: 380 V
```

---

## 十二、图片上传为什么会稍微延迟

因为我们刻意不用 R2，以避免开通需要支付方式的服务。

流程是：

```text
/admin 上传图片
    ↓
Cloudflare Function
    ↓
GitHub API
    ↓
图片写入 public/uploads/
    ↓
GitHub 产生新 commit
    ↓
Cloudflare 自动重新构建
    ↓
图片正式出现在网站
```

因此上传图片后，后台会立即记录图片路径，但需要等 Cloudflare 完成这一次自动部署后，图片才正式可访问。

文字数据（产品名、参数、新闻正文等）写入 D1，一般不需要重新部署。

---

## 十三、图片使用建议

为了避免 GitHub 仓库越来越大：

- 单张建议 300–800 KB
- 产品大图建议宽度约 1600–2200 px
- 优先 WebP 或压缩 JPEG
- 不建议直接上传手机原始 10–30 MB 图片
- 本程序硬性限制单张不超过 5 MB

目录自动使用：

```text
public/uploads/products/
public/uploads/news/
```

---

## 十四、绑定正式域名

等 `pages.dev` 测试全部正常以后：

Pages 项目 → **Custom domains** → **Set up a custom domain**

填写：

`www.yourcompany.com`

如果域名 DNS 已经在 Cloudflare，按界面提示完成绑定即可。

---

## 十五、以后日常怎么用

平时不需要改 GitHub 代码。

直接：

`你的域名/admin`

然后：

- 新增产品
- 修改产品
- 修改技术参数
- 发布新闻
- 上传图片

只有当你要改：

- 网站 Logo
- 导航
- 公司固定介绍
- 网站颜色
- 页面布局
- 新功能

才需要修改代码并让 Cloudflare 重新部署。

---

## 十六、安全注意事项

1. `GITHUB_TOKEN` 必须存为 Cloudflare Secret。
2. `ADMIN_PASSWORD` 必须存为 Cloudflare Secret。
3. `SESSION_SECRET` 必须是足够长的随机值。
4. 不要把这些 Secret 写进 GitHub。
5. GitHub token 只授权当前网站仓库，并只给 Contents Read/Write。
6. Token 到期后，重新生成，再更新 Cloudflare `GITHUB_TOKEN`。
7. Cloudflare 默认 HTTPS，请不要用 HTTP 访问后台。

---

## 十七、常见错误

### 1. 首页只有演示数据

通常是 D1 没绑定，检查：

`Settings → Bindings → DB`

并重新部署。

### 2. `/admin` 登录提示 Admin secrets are not configured

缺少：

- ADMIN_USERNAME
- ADMIN_PASSWORD
- SESSION_SECRET

添加后重新部署。

### 3. 图片上传提示 GitHub upload secrets are not configured

缺少：

- GITHUB_TOKEN
- GITHUB_OWNER
- GITHUB_REPO

### 4. 图片上传 GitHub 返回 403

通常是 token 权限不足。

确认 Fine-grained token：

- 选中了正确仓库
- Contents = Read and write
- Token 没有过期

### 5. 图片上传成功，但马上看不到

正常。GitHub commit 后需要 Cloudflare 自动部署完成。

### 6. 产品页面刷新 404

项目已经包含 `public/_redirects`：

```text
/* /index.html 200
```

如果仍出现问题，检查该文件是否存在于 GitHub。

---

## 十八、这套方案不需要什么

不需要：

- Supabase
- R2
- Cloudflare Access
- Vercel
- MySQL 服务器
- VPS
- WordPress

主要只需要：

```text
GitHub
+ Cloudflare Pages / Functions
+ Cloudflare D1
```

以及你的正式域名（如果需要）。
