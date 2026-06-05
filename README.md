# 个人主页 - GitHub Pages

这是一个基于 Jekyll 的个人主页项目，部署在 GitHub Pages 上。

## 功能特性

- 📱 响应式设计，支持移动端和桌面端
- 🎨 现代化的 UI 设计
- ⚡ 使用 Vue.js 进行动态渲染
- 📊 展示个人资料、技能、服务和项目
- 📮 联系方式展示

## 本地开发

### 前置要求

- Ruby 2.7 或更高版本
- Bundler gem

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/briskygates/briskygates.github.io.git
cd briskygates.github.io
```

2. 安装依赖：
```bash
bundle install
```

3. 启动本地服务器：
```bash
bundle exec jekyll serve
```

4. 在浏览器中打开 `http://localhost:4000`

## 部署到 GitHub Pages

1. 将代码推送到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择主分支（main 或 master）作为源
4. GitHub 会自动构建和部署站点

## 配置文件

网站内容配置位于 `assets/data/` 目录：

- `assets/data/homeConfig.json` — 中文内容
- `assets/data/homeConfig.en.json` — 英文内容

编辑对应文件后提交即可更新网站内容。

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
├── tests/                   # 测试用例
├── index.html               # 主页
├── Gemfile                  # Ruby 依赖
└── README.md                # 项目说明
```

## 许可证

MIT License
