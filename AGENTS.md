# AI 协同开发指南 (AGENTS.md)

本文档是本项目中所有 AI Agent（包括 Antigravity、Claude、Cursor、Copilot 等）的最高级别开发与演进规范。**任何涉及 UI 样式、前端布局与内容变更的任务必须严格遵守本文档规则，严防低级错误重现。**

---

## 1. 核心铁律：移动端响应式与防溢出规范（严禁再犯）

### 1.1 历史教训与痛点复盘
在手机页面（尤其是 **320px (iPhone SE 1)**、**360px (Android 紧凑屏)**、**375px** 视口以及**英文版（如 `lang=en`, `lang=plain-en`）**下，曾出现部分按钮（如 `.hero-flow-entry`）、内容卡片头部（`.bento-card__header` / `.radar-status-badge`）、工具状态标签（`.plain-tool-status`）超过手机屏幕宽度，导致页面产生横向滚动条、组件右边缘被裁断或挤出卡片外。

### 1.2 五大引发溢出的深层原因与解决法则

#### 规则 1：CSS Grid 单列轨道必须显式声明 `minmax(0, 1fr)`
- **原因**：在 CSS Grid 规范中，`grid-template-columns: 1fr` 实际上等价于 `minmax(auto, 1fr)`！当网格项（或其子项文字）具有较大的 intrinsic min-content 时，列宽会被子元素强行撑大，完全无视视口宽度。
- **强制写法**：移动端媒体查询（如 `@media (max-width: 768px)`）中，所有网格必须使用 `minmax(0, 1fr)`：
  ```css
  /* 错误写法 */
  .grid-container { grid-template-columns: 1fr; }

  /* 正确写法 */
  .grid-container { grid-template-columns: minmax(0, 1fr); width: 100%; max-width: 100%; }
  ```

#### 规则 2：所有按钮与可点击卡片必须包含弹性收缩声明
- **原因**：`<button>` 标签和自定义交互卡片默认具有 `min-width: auto;`。如果内部包含文本，按钮宽度将优先保持文字完整而不会自动收缩，即使内部文本设置了 `overflow: hidden; text-overflow: ellipsis;` 也会失效。
- **强制写法**：
  ```css
  button, .btn-primary, .btn-secondary, .bento-flow-tile, .hero-flow-entry {
      min-width: 0;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
  }
  /* 内部文本容器 */
  .btn-text-wrap {
      min-width: 0;
      flex: 1;
  }
  ```

#### 规则 3：长文本与长英文折行保护，慎用无限制的 `white-space: nowrap`
- **原因**：英文单词和专业术语较长（如 `Existing monitoring project · data feed needed`），一旦带有 `white-space: nowrap` 或缺乏折行规则，在 320px/360px 宽度下单行直接撑破 300px。
- **强制写法**：
  - 容器统一添加折行：`word-break: break-word; overflow-wrap: break-word;`
  - 单行强截断必须组合三件套：`min-width: 0; max-width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;`
  - 推荐多行弹性截断：
    ```css
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
    ```

#### 规则 4：Flex 横向排列头部必须具备自动换行或列布局
- **原因**：卡片顶部的 `display: flex; justify-content: space-between;`，若左侧是标题/个人信息，右侧是固定宽度标签（`flex: 0 0 auto`），在移动端二者并排必然超出卡片宽度。
- **强制写法**：
  - 移动端卡片头部必须开启 `flex-wrap: wrap; gap: 8px;`，或者在小屏直接切换为 `flex-direction: column; align-items: flex-start;`。
  - 右侧标签不得使用固定的 `flex: 0 0 auto`，应使用 `flex: 0 1 auto; max-width: 100%;`。

#### 规则 5：控制嵌套内边距与树状缩进
- **原因**：外层容器 padding + 网格 padding + 卡片 padding + 树状 track 缩进层层叠加，在 320px 屏幕下会导致实际内容可用宽度只剩不到 180px。
- **强制写法**：
  - 移动端卡片内边距控制在 `14px ~ 16px`。
  - 流程轴线（`.flow-section`, `.flow-track`）在手机端左缩进严禁超过 `14px`。

---

## 2. 自动化守卫与回归测试要求

本项目已建立端到端自动化测试集，任何涉及 CSS、HTML 模板或多语言数据的变更，**必须在提交前全部通过自动化测试**。

```bash
# 1. 运行所有单元测试（含配置结构、图标映射、SEO构建校验）
npm test

# 2. 运行 Playwright 端到端测试（含 320px / 375px / 390px 全语言防溢出自动化检测）
npm run test:e2e

# 3. 执行生产构建
npm run build
```

> [!IMPORTANT]
> **溢出测试守护文件**：`tests/e2e/mobile-layout-overflow.spec.js`
> 该测试在 320px（iPhone SE 1）、375px（iPhone SE 2/3）、390px（iPhone 12/13/14）视口下，遍历所有 6 种语言版本（`zh`, `en`, `zh-Hant`, `plain`, `plain-en`, `plain-Hant`），严格断言 `document.documentElement.scrollWidth <= viewport.width`，且页面中所有按钮和卡片不得超出其父级或视口。**测试不通过严禁交付。**

---

## 3. 项目架构与单一数据源原则

1. **多语言配置驱动**：
   - 核心数据源位于 `assets/data/homeConfig*.json`。
   - 包含 6 个语言版本，靠 URL 参数 `?lang=...` 切换。
2. **图标映射规则**：
   - 页面图标均在 `assets/js/main.js` 中通过 `getTechIcon` 和 `getNavIcon` 映射，**严禁将 `title` 放前面，必须使用跨语言稳定的语义 key 或 emoji**。
3. **构建流程**：
   - 修改定位或文案后需运行 `npm run build` 同步生成预渲染静态骨架、`llms-full.txt`、`sitemap.xml` 等。
