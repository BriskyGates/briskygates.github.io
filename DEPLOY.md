# 部署与开发指南

基于 Jekyll + Vue.js 的个人主页，部署在 GitHub Pages。仓库首页 [README.md](README.md) 展示个人履历（由 `homeConfig.json` 自动生成），本文档涵盖本地开发、部署、SEO 与故障排除。

## 功能特性

- 响应式设计，支持移动端和桌面端
- Vue.js 动态渲染 + 构建时 SEO 预渲染
- 展示个人资料、技能、服务与项目
- `llms.txt` / `llms-full.txt` 供 AI 与爬虫读取

---

## 快速部署到 GitHub Pages

### 1. 准备仓库

仓库名称须为 `username.github.io`（例如：`briskygates.github.io`）。

### 2. 推送代码

```bash
git init
git add .
git commit -m "Initial commit: Jekyll personal homepage"
git branch -M main
git remote add origin https://github.com/你的用户名/你的仓库名.github.io.git
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入 GitHub 仓库 → **Settings** → **Pages**
2. **Source** 选择 **Deploy from a branch**
3. 分支选 **main**，目录选 **/ (root)**
4. 点击 **Save**

### 4. 等待构建

GitHub 会自动构建 Jekyll 站点，通常几分钟内可用：

`https://你的用户名.github.io`

推送 `assets/data/` 配置变更后，GitHub Actions 会自动执行 `npm run build` 并提交 SEO 产物（`index.html` 预渲染、`llms-full.txt`、`README.md` 等）。

---

## 本地开发

### 方式一：Node 预览（推荐，无需 Ruby）

1. 安装 [Node.js](https://nodejs.org/)（LTS 即可）
2. 在项目目录执行：

```powershell
npm install
npm run dev
```

3. 浏览器打开 **http://127.0.0.1:4174**

修改 `index.html` 或 `assets/data/*.json` 后，重新运行 `npm run dev`（或先执行 `node tests/helpers/build-fixture.js` 再刷新页面）。

若报 **`EADDRINUSE` / 端口已被占用**，说明 4174 上已有 dev 服务在跑，**直接打开上面的地址即可**；若要重启，先结束占用进程：

```powershell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 4174).OwningProcess -Force
npm run dev
```

或换端口：`$env:PORT=4000; npm run dev`

### 方式二：Jekyll 完整构建（可选）

需要安装 [Ruby](https://rubyinstaller.org/)（Windows 勾选 “Add Ruby to PATH”）和 Bundler：

```powershell
gem install bundler
bundle install
bundle exec jekyll serve
```

浏览器打开 `http://localhost:4000`。

若提示 **`bundle` 不是内部或外部命令**，请改用 **`npm run dev`**。

---

## 更新网站内容

网站内容配置位于 `assets/data/`：

| 文件 | 说明 |
|------|------|
| `assets/data/homeConfig.json` | 中文内容 |
| `assets/data/homeConfig.en.json` | 英文内容 |

```bash
# 编辑配置后
npm run build          # 预渲染 + 生成 llms-full.txt / README.md
git add assets/data/ index.html llms-full.txt llms-full.en.txt README.md _includes/json-ld.html
git commit -m "Update homepage content"
git push
```

`npm run build` 会：

- 将中文内容**精简预渲染**进 `index.html`（Hero + 文本摘要，供爬虫读取；完整 UI 仍由 Vue 异步加载 JSON）
- 生成 `llms-full.txt` / `llms-full.en.txt` 纯文本履历
- 根据 `homeConfig.json` 重新生成 `README.md`（GitHub 仓库首页）
- 生成 `_includes/json-ld.html` 结构化数据

站点使用**本地托管的 Vue**（`assets/vendor/`）与**系统字体**，避免 Google Fonts / unpkg 在国内拖慢首屏。

站点根目录还提供 [`llms.txt`](llms.txt)，供 LLM / 爬虫发现机器可读数据源。

---

## 自定义域名（可选）

1. 在仓库根目录创建 `CNAME` 文件，写入域名（例如：`example.com`）
2. 在域名 DNS 中添加 CNAME 记录指向 `你的用户名.github.io`

---

## 搜索引擎与 AI 收录

站点已配置 canonical、Open Graph、结构化数据、`robots.txt` 与 `sitemap.xml`。

### Google Search Console 基础步骤

1. 打开 [Google Search Console](https://search.google.com/search-console)，添加资源 `https://briskygates.github.io`
2. 选择 **HTML 标签** 验证，将 `content` 值填入 `_config.yml` 的 `google_site_verification`，提交并推送
3. 在 Search Console → **站点地图** 提交：`https://briskygates.github.io/sitemap.xml`
4. 使用 **网址检查** 对首页及 `llms-full.txt` 点击「请求编入索引」
5. 在 GitHub Profile README、社交简介等处添加本站链接，帮助 Google 发现站点

验证收录：在 Google 搜索 `site:briskygates.github.io`（新站通常需数天至数周）。

### Google AI Mode 搜不到仓库？逐步排查

Google AI Mode（AI 概览）与普通搜索共用索引，但对**可抓取正文**、**站点权威度**要求更高。按顺序排查：

#### 第 1 步：确认「搜什么」与「期望出现什么」

| 搜索词 | 期望结果 | 说明 |
|--------|----------|------|
| `site:briskygates.github.io` | 列出已收录页面 | 若 0 结果 → 整站未入库 |
| `site:github.com briskygates` | 列出 GitHub 上的仓库/代码 | 仓库页与 Pages 站是**不同 URL** |
| `阿布 AI 全栈` / `briskygates RAG` | 可能出现主页或 README | 需页面已被索引且关键词匹配 |

**常见误解**：搜「GitHub 仓库」时，AI 可能引用 `github.com/briskygates/...` 下的 README，而不是 `briskygates.github.io` 主页，两者需分别优化。

#### 第 2 步：确认仓库与站点可公开访问

- [ ] 仓库为 **Public**（Settings → General → Danger Zone 上方可见）
- [ ] GitHub Pages 已启用且访问 `https://briskygates.github.io` 返回 200
- [ ] 以下 URL 在浏览器中可直接打开并有正文：
  - `https://briskygates.github.io/llms-full.txt`
  - `https://briskygates.github.io/llms.txt`
  - `https://briskygates.github.io/assets/data/homeConfig.json`
  - `https://briskygates.github.io/robots.txt`
  - `https://briskygates.github.io/sitemap.xml`

#### 第 3 步：检查 Google 是否已收录

在 Google 搜索（非 AI Mode）执行：

```
site:briskygates.github.io
```

- **0 条结果**：站点尚未入库 → 完成第 4、5 步并等待 1–4 周
- **有首页但无 llms-full.txt**：在 Search Console 对 `llms-full.txt` 单独「请求编入索引」
- **有结果但 AI Mode 仍不引用**：属排名/权威问题 → 加强第 5、6 步外链

#### 第 4 步：完成 Search Console 验证（当前可能缺失）

检查 `_config.yml` 中 `google_site_verification` 是否为空。若为空，Google 无法确认你拥有该站，索引请求会受限：

```yaml
google_site_verification: "在此处填入 Search Console 给的 content 值"
```

填入后 `git push`，在 Search Console 点验证，再提交 sitemap。

#### 第 5 步：确保爬虫能读到「纯文本」内容

本仓库已做以下优化，推送后需确认产物已上线：

| 机制 | 作用 |
|------|------|
| `index.html` PRERENDER 区块 | 首页 HTML 内嵌 Hero + 摘要，不依赖 JS |
| `llms-full.txt` | 完整履历纯文本，专供 AI/爬虫 |
| `llms.txt` | [llmstxt.org](https://llmstxt.org/) 标准索引文件 |
| `README.md` | GitHub 仓库页展示履历，利于 `github.com` 域收录 |
| `_includes/json-ld.html` | Person / WebSite 结构化数据 |

每次改 `homeConfig.json` 后务必执行 `npm run build` 并推送生成文件。可用「查看网页源代码」确认 `index.html` 中 `<!-- PRERENDER:START -->` 区块有文字，而非空白。

#### 第 6 步：增加外部引用（提升 AI 引用概率）

Google AI 更倾向引用有多处佐证的结果。建议：

1. **GitHub Profile README**（`github.com/briskygates/briskygates` 或你的用户主页）写上：
   - 姓名 / 定位一句话
   - 链接 `https://briskygates.github.io`
   - 链接 `https://github.com/briskygates/briskygates.github.io`
2. 在掘金、知乎、LinkedIn 等简介中加入相同链接（保持文案一致，便于实体关联）
3. 若有其他开源项目，在 those README 的「作者」处链回主页

#### 第 7 步：排除技术拦截

- [ ] `robots.txt` 未 `Disallow: /`（当前为 `Allow: /`，正常）
- [ ] 未对 Googlebot 做地域/IP 封锁（GitHub Pages 一般无此问题）
- [ ] 仓库未处于 DMCA 限制或 GitHub 安全警告状态

#### 第 8 步：时间预期与复测

- 新站首次收录：**3 天 – 4 周** 属正常
- 提交 sitemap / 请求索引后：**48–72 小时** 再查 `site:` 结果
- AI Mode 引用往往**晚于**普通搜索收录，且不一定每次触发

**复测清单**（每隔一周执行）：

1. `site:briskygates.github.io` 结果数量是否增加
2. Search Console → **网页** → 已编入索引数量
3. 用无痕窗口在 Google AI Mode 问：「briskygates AI 工程师 上海 RAG」等具体长尾词

---

## 运行测试

```bash
npm install
npm test
```

单元测试与配置文件结构校验位于 `tests/`；端到端测试会启动本地静态服务器验证语言切换等功能。

---

## 项目结构

```
.
├── _config.yml              # Jekyll 配置（含 google_site_verification）
├── _layouts/default.html    # 默认布局
├── _includes/
│   ├── seo-head.html        # canonical / OG / 验证标签
│   └── json-ld.html         # 结构化数据（npm run build 生成）
├── assets/
│   ├── css/style.css
│   ├── data/
│   │   ├── homeConfig.json  # 中文内容（源数据）
│   │   └── homeConfig.en.json
│   ├── js/app-core.js
│   └── vendor/              # 本地 Vue
├── scripts/build.js         # SEO 预渲染构建
├── llms.txt                 # AI / 爬虫站点索引
├── llms-full.txt            # 中文纯文本履历（构建生成）
├── README.md                # GitHub 首页履历（构建生成）
├── DEPLOY.md                # 本文档
├── robots.txt
└── sitemap.xml
```

---

## 故障排除

### 构建失败

- 检查 `_config.yml` 格式是否正确
- 查看 GitHub Actions 日志（Actions → Build SEO artifacts）
- 本地执行 `npm test && npm run build` 复现

### 样式不显示

- 确认 `assets` 目录结构完整
- 检查 CSS 路径是否为 `/assets/css/style.css`

### Vue.js 不工作

- 打开浏览器控制台查看报错
- 确认 `assets/data/homeConfig.json` 可访问
- 运行 `npm test` 检查核心逻辑

### Google / AI 仍搜不到

- 对照上文「Google AI Mode 搜不到仓库？逐步排查」逐项检查
- 确认 `google_site_verification` 已配置
- 确认 `npm run build` 产物已 push 到 `main`

---

## 参考链接

- [Jekyll 官方文档](https://jekyllrb.com/docs/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
- [Google Search Console 帮助](https://support.google.com/webmasters/)
- [llms.txt 规范](https://llmstxt.org/)

## 许可证

MIT License
