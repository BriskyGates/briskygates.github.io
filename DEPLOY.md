# GitHub Pages 部署指南

## 快速开始

### 1. 准备仓库

确保你的 GitHub 仓库名称格式为：`username.github.io`（例如：`briskygates.github.io`）

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

1. 进入你的 GitHub 仓库
2. 点击 **Settings**（设置）
3. 在左侧菜单中找到 **Pages**
4. 在 **Source** 下拉菜单中选择 **Deploy from a branch**
5. 选择 **main** 分支和 **/ (root)** 目录
6. 点击 **Save**

### 4. 等待构建

GitHub 会自动构建你的 Jekyll 站点，通常需要几分钟时间。构建完成后，你的网站将在以下地址可用：

`https://你的用户名.github.io`

## 本地测试

在推送到 GitHub 之前，你可以在本地测试站点：

### Windows 用户

1. 安装 Ruby（推荐使用 [RubyInstaller](https://rubyinstaller.org/)）
2. 安装 Bundler：
   ```bash
   gem install bundler
   ```
3. 安装依赖：
   ```bash
   bundle install
   ```
4. 启动本地服务器：
   ```bash
   bundle exec jekyll serve
   ```
5. 在浏览器中打开 `http://localhost:4000`

## 更新内容

要更新网站内容，只需编辑 `_data/homeConfig.json` 文件，然后提交并推送更改：

```bash
git add _data/homeConfig.json
git commit -m "Update homepage content"
git push
```

GitHub 会自动重新构建和部署你的站点。

## 自定义域名（可选）

如果你想使用自定义域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 在文件中写入你的域名（例如：`example.com`）
3. 在你的域名 DNS 设置中添加 CNAME 记录指向 `你的用户名.github.io`

## 故障排除

### 构建失败

- 检查 `_config.yml` 文件格式是否正确
- 确保所有必需的文件都存在
- 查看 GitHub Actions 日志了解详细错误信息

### 样式不显示

- 确保 `assets` 目录结构正确
- 检查 CSS 文件路径是否正确

### Vue.js 不工作

- 检查浏览器控制台是否有错误
- 确保网络连接正常（Vue.js 从 CDN 加载）
- 检查 `window.siteConfig` 是否正确传递

## 技术支持

如有问题，请查看：
- [Jekyll 官方文档](https://jekyllrb.com/docs/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)
