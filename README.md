# 个人主页 - GitHub Pages

这是一个基于 Jekyll 的个人主页项目，部署在 GitHub Pages 上。

## 功能特性

- 📱 响应式设计，支持移动端和桌面端
- 🎨 现代化的 UI 设计
- ⚡ 使用 Vue.js 进行动态渲染
- 📊 展示个人资料、技能、服务和项目
- 📮 联系方式展示

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

若提示 **`bundle` 不是内部或外部命令**，说明未安装 Ruby，请改用上面的 **`npm run dev`**。

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支（main 或 master）作为源
4. GitHub 会自动构建和部署站点

## 配置文件

网站内容配置位于 `assets/data/` 目录：

- `assets/data/homeConfig.json` — 中文内容
- `assets/data/homeConfig.en.json` — 英文内容

编辑对应文件后提交即可更新网站内容。修改配置后请运行预渲染构建，以便爬虫与 AI 工具能读取页面正文：

```bash
npm run build
```

该命令会：
- 将中文内容预渲染进 `index.html`（无需执行 JavaScript 即可抓取正文）
- 生成 `llms-full.txt` / `llms-full.en.txt` 纯文本履历
- 生成 `_includes/json-ld.html` 结构化数据

站点根目录还提供 [`llms.txt`](llms.txt)，供 LLM / 爬虫发现机器可读数据源。推送到 `main` 后，GitHub Actions 会在配置变更时自动执行 `npm run build` 并提交生成文件。

## 运行测试

```bash
npm install
npm test
```

单元测试与配置文件结构校验位于 `tests/` 目录；端到端测试会启动本地静态服务器验证语言切换等功能。

## 项目结构

```
.
├── _config.yml              # Jekyll 配置文件
├── _layouts/
│   └── default.html         # 默认布局模板
├── assets/
│   ├── css/
│   │   └── style.css        # 样式文件
│   ├── data/
│   │   ├── homeConfig.json  # 中文内容配置
│   │   └── homeConfig.en.json # 英文内容配置
│   └── js/
│       ├── app-core.js      # 核心逻辑（可测试）
│       └── main.js          # 页面入口脚本
├── _includes/
│   └── json-ld.html         # 结构化数据（npm run build 生成）
├── scripts/
│   └── build.js             # SEO 预渲染构建
├── llms.txt                 # AI / 爬虫站点索引
├── llms-full.txt            # 中文纯文本履历（构建生成）
├── llms-full.en.txt         # 英文纯文本履历（构建生成）
├── Gemfile                  # Ruby 依赖
└── README.md                # 项目说明
```

## 许可证

MIT License
