# 主页项目库改版方案：从「枚举式」到「业务流 + 痛点驱动」

> 日期：2026-07-25
> 目标读者：阿布（主页 owner）
> 触发反馈：「项目经历不要枚举，按业务流分节点，痛点上面长项目，让读者 20 秒内能定位能力」
> 适配文件：`assets/data/homeConfig.json`（核心数据源）、`index.html`（模板）、`scripts/generate-*.js`（多语言派生）

---

## 一、诊断：为什么现在的项目库「琳琅满目，却只能划划过去」

### 1.1 现状结构（[homeConfig.json](file:///d:/code_project/briskygates.github.io/assets/data/homeConfig.json)）

当前 `projectShowcase.rows` 把 **29 个项目**按**技术分类**铺成 6 行：

| 行 | 分类 | 项目数 |
|---|---|---|
| enterprise-ai | 企业级 AI 解决方案 | 5 |
| rag-knowledge | RAG 与知识工程基建 | 5 |
| doc-intelligence | 多模态文档智能解析 | 6 |
| agent-mcp | Agent 智能体与自动化 | 5 |
| tg-mobile | 社群机器人与生态应用 | 4 |
| platform-auto | 业务后台与运维中枢 | 4 |

### 1.2 三个致命问题

1. **分类轴是「我有什么技术」，不是「你有什么痛点」**
   读者是来求解的，不是来验收技术栈的。他打开页面第一眼看到的是「企业级 AI 解决方案」「RAG 与知识工程基建」——这是工程师视角的自我介绍，不是买方视角的诊断书。

2. **卡片平铺，没有路径感**
   29 张同权重卡片横向滚动，读者无法判断「我该从哪张看起」「这张和我有关吗」。结果是扫两眼就划走——正是你说的「20 秒就过去」。

3. **痛点被埋在 description 里，没有成为信息骨架**
   每张卡片的 `description` 其实已经写了痛点（「扫描件、表格、水印、目录层级缺失」），但它只是卡片正文的一句话，不是导航锚点。读者要读完 3 行才知道这张卡是不是自己要的。

### 1.3 已经做对的地方（别推翻）

- `featured.items`（落地案例 3 则）**已经是痛点驱动**：「研报/公告很多，知识库却经常引用错段落」——标题即痛点，描述即场景。这个模式要**推广到整个项目库**，而不是只留给 3 个代表作。
- `experience.items`（能力履历）按时间段铺，同样可以并进业务流，作为「我在每条流上做了多久」的侧栏佐证。

---

## 二、改版原则：业务流 × 痛点 × 项目挂载

### 2.1 三条叙事铁律（针对「模型不会国人叙事」这一点）

> 国人讲事的习惯是：**先共情你的难处，再说我怎么解，最后用案例佐证**。
> 不是「我有 X 能力、Y 能力、Z 能力」的清单式自夸。

1. **「你」先行，不是「我」先行**
   每条业务流开头一句话必须是「如果你是 ___，正在被 ___ 困住」。先给读者一面镜子，让他自己往里站。

2. **痛点是骨架，项目是肉**
   节点标题写痛点（「召回 top-k 一股脑塞给 LLM，引用错段落」），项目挂在痛点下面作为「我怎么解的」。读者扫痛点就能定位，不用读项目描述。

3. **留节奏，别贪多**
   一条流最多 6 个节点，一个节点最多 2 个项目卡片。超过就合并。29 个项目不需要全部铺开——**80% 的读者只关心 4 条流里的某一条**，其余的收进「更多能力」折叠区。

### 2.2 信息架构对比

```
旧：projectShowcase.rows[]
        └── items[]                      （平铺卡片，按技术分类）

新：businessFlows[]                       （业务流，按买方场景）
        └── persona                      （读者画像：如果你是 X）
        └── nodes[]                      （流程节点）
               └── painPoint             （痛点标题，骨架）
               └── painDetail            （痛点展开 1 句）
               └── projects[]            （挂载的项目，肉）
                       └── id / title / how（我怎么解的，1 句）
```

---

## 三、新信息架构：4 条业务流

> 设计依据：把 29 个项目按「读者画像」归并，**不按技术分类归并**。
> 4 条是上限——超过 4 条，Hero 区的入口就不够「20 秒扫完」。

### 业务流 A：企业知识库从 0 到上线（RAG 全链路）
- **读者画像**：技术负责人 / 业务负责人，文档已堆了一堆，问答不准、上不了生产
- **一句话**：从脏文档到可上线问答网关，一条链路打通

| 节点 | 痛点（骨架） | 挂载项目 |
|---|---|---|
| A1 文档进料 | 扫描件、表格、水印、目录缺失，脏文档喂出脏知识 | pdf2xml、pdf_watermark、paddle_ocr_vl、extract_pdf_toc、gpu_rapid_layout |
| A2 语义分块 | 一刀切分块把表格打散、把语义截断，召回上限被锁死 | pdf_chunker、multi_source_chunk |
| A3 向量化召回 | 关键词命中为主，语义对不上，图表里的数据根本搜不到 | qwen3_pg_recall、report_recall |
| A4 重排与引用 | top-k 一股脑塞给 LLM，引用错段落，问答答非所问 | rerank_system |
| A5 异步入库基建 | 文档入库靠手动跑，规模化不了、回滚不了 | fastapi_celery_kb |
| A6 对话问答网关 | 没有鉴权、审计、日志，上不了生产 | enterprise_chat_openapi |

### 业务流 B：Agent 从演示到生产（智能体工程化）
- **读者画像**：CTO / 技术负责人，Agent demo 好看但换场景就废、上不了线
- **一句话**：把工具编排、代码执行、多智能体协同嵌进可审计的工程流程

| 节点 | 痛点 | 挂载项目 |
|---|---|---|
| B1 工具动态化 | 工具写死，换个场景就废，静态工具链泛化难 | dynamic_mcp |
| B2 多工具编排 | 多工具协同靠手写 if-else，编排逻辑不可复用 | mcp_json_rpc |
| B3 模型能力聚合 | 每个业务系统直连大模型，AI 接口资产失控 | ai_mcp_middleware |
| B4 多智能体协同 | 单 Agent 顶不住复杂任务，拆不动、路由乱 | multi_agent_collab |
| B5 端侧执行 | 没有可控的执行环境，移动端/端侧场景接不进来 | phone_autoglm |

### 业务流 C：金融投研内容生产
- **读者画像**：金融/资讯团队，研报公告多、人工贵、流程断
- **一句话**：从附件采集到盘中异动，把投研内容生产做成自动化流水线

| 节点 | 痛点 | 挂载项目 |
|---|---|---|
| C1 多源采集 | 研报附件散落邮箱，人工搬不动、搬不对 | email_auto_crawl、cc_monitor_gmail |
| C2 实体与语义提取 | 实体/时间提取不准，业务语义理解弱 | temp_ner、announcement_tagging |
| C3 盘中异动监测 | 盘中异动没人盯，风险滞后、机会溜走 | etf_unusual、onchain_token_monitor |
| C4 题型解析引擎 | 评估与生成混在一起，解析不严谨 | multi_llm_analysis |

### 业务流 D：社群变现与办公自动化
- **读者画像**：社群运营 / 私域负责人 / 办公协同负责人
- **一句话**：群规模上来靠人顶不住，把风控、线索、协同交给 Bot 与自动化

| 节点 | 痛点 | 挂载项目 |
|---|---|---|
| D1 群管风控与担保 | 验证、反垃圾、担保交易、客服工单靠人工撑不住 | group_management_bot |
| D2 商业线索洞察 | 群里商机抓不住，线索流失在聊天洪流里 | need_radar_bot |
| D3 历史内容检索 | 聊天记录是黑盒，有价值信息找不到 | tg_ai_search |
| D4 办公协同与桌面效率 | 飞书/邮箱/桌面数据不通，人工对账成本高 | lark_sync、smart_clipboard |

> 校验：A(12) + B(5) + C(7) + D(5) = 29，全部项目归位，无遗漏。

---

## 四、内容样板（可直接改写进 homeConfig.json）

### 4.1 业务流对象的 JSON 结构

```jsonc
{
  "businessFlows": [
    {
      "id": "flow-rag",
      "icon": "📚",
      "accent": "#b49bc8",
      "title": "企业知识库从 0 到上线",
      "subtitle": "RAG 全链路 · 从脏文档到可上线问答网关",
      "persona": "如果你是技术/业务负责人：文档已堆了一堆，问答不准、上不了生产",
      "oneLiner": "不先换更大模型，先把解析、分块、重排、网关修到位",
      "nodes": [
        {
          "id": "a1-doc-feed",
          "stage": "A1 · 文档进料",
          "painPoint": "扫描件、表格、水印、目录缺失，脏文档喂出脏知识",
          "painDetail": "企业知识库最常见的卡点在上游：PDF 结构丢了、表格变成乱码、水印盖住正文、目录层级拿不到。下游怎么调都白搭。",
          "projects": [
            {
              "id": "pdf2xml",
              "title": "高精度 PDF 结构化解析引擎",
              "how": "用底层库逆向 PDF 坐标，提炼文本/表格/层级，给下游最干净的数据源",
              "tags": ["PDF", "FastAPI"]
            },
            {
              "id": "pdf_watermark",
              "title": "智能 PDF 净水处理引擎",
              "how": "可配置规则库 + 视觉坐标匹配，批量去水印，抬升 OCR 基线",
              "tags": ["水印", "批处理"]
            }
          ]
        }
        // ... A2–A6 同结构
      ]
    }
    // ... flow-agent / flow-finance / flow-community
  ]
}
```

### 4.2 节点文案样板（A1 完整示例，照此节奏写其余节点）

> 节点标题用「痛点句」，不用「能力句」。
> 对照：
> - ❌ 能力句：「高精度 PDF 结构化解析」
> - ✅ 痛点句：「扫描件、表格、水印、目录缺失，脏文档喂出脏知识」

```jsonc
{
  "id": "a1-doc-feed",
  "stage": "A1 · 文档进料",
  "painPoint": "扫描件、表格、水印、目录缺失，脏文档喂出脏知识",
  "painDetail": "企业知识库最常见的卡点在上游：PDF 结构丢了、表格变成乱码、水印盖住正文、目录层级拿不到。下游怎么调都白搭。",
  "projects": [
    {
      "id": "pdf2xml",
      "title": "高精度 PDF 结构化解析引擎",
      "how": "用底层库逆向 PDF 坐标，提炼文本/表格/层级，给下游最干净的数据源",
      "tags": ["PDF", "FastAPI"],
      "icon": "📄"
    },
    {
      "id": "pdf_watermark",
      "title": "智能 PDF 净水处理引擎",
      "how": "可配置规则库 + 视觉坐标匹配，批量去水印，抬升 OCR 基线",
      "tags": ["水印", "批处理"],
      "icon": "💧"
    },
    {
      "id": "paddle_ocr_vl",
      "title": "多模态 OCR 视觉解析服务",
      "how": "OCR + 版面理解封装成高并发 API，扫描件上传即解析",
      "tags": ["OCR", "VL"],
      "icon": "👁️"
    },
    {
      "id": "extract_pdf_toc",
      "title": "研报目录层级深度挖掘",
      "how": "书签提取 → 目录页解析 → 版面理解，三级降级兜底",
      "tags": ["PDF", "目录"],
      "icon": "📑"
    },
    {
      "id": "gpu_rapid_layout",
      "title": "GPU 版面元素极速检测",
      "how": "GPU 推理集群加速，高并发异步落库，拆解图/表/段落",
      "tags": ["版面检测", "GPU"],
      "icon": "🖼️"
    }
  ]
}
```

### 4.3 Hero 区改造：给 4 条流一个「入口菜单」

当前 Hero 的 `heroChips` 是 5 个技术词（「企业/金融文档 RAG」「文档智能解析」…）——读者不知道点哪个。

改成 **4 张可点击的「诊断卡」**，每张一句话痛点，点击锚点到对应业务流：

```jsonc
"heroFlowEntries": [
  {
    "id": "flow-rag",
    "icon": "📚",
    "title": "知识库问答不准 / 上不了线",
    "sub": "从脏文档到问答网关，一条链路打通"
  },
  {
    "id": "flow-agent",
    "icon": "🤖",
    "title": "Agent demo 好看，换场景就废",
    "sub": "工具编排 + 多智能体 + 可审计工程化"
  },
  {
    "id": "flow-finance",
    "icon": "📈",
    "title": "研报公告多、人工搬不动",
    "sub": "采集 → 实体 → 异动监测自动化"
  },
  {
    "id": "flow-community",
    "icon": "🤝",
    "title": "群规模上来，靠人顶不住",
    "sub": "风控 / 线索 / 协同交给 Bot"
  }
]
```

> 这一步是「20 秒原则」的关键：读者落地后**第一屏就能选边站**，不用滚动、不用猜。

---

## 五、UI / 交互改造建议（[index.html](file:///d:/code_project/briskygates.github.io/index.html)）

### 5.1 业务流区块的渲染结构

替换当前 `v-for="row in config.projectShowcase.rows"` 的平铺卡片，改成「流程节点」纵向叙事：

```html
<!-- 业务流区块：痛点为骨架，项目挂在痛点下 -->
<section v-for="flow in config.businessFlows" :key="flow.id" :id="flow.id" class="content-section">
  <div class="section-head">
    <h2>{{ flow.title }}</h2>
    <p class="flow-persona">{{ flow.persona }}</p>
    <p class="flow-oneliner">{{ flow.oneLiner }}</p>
  </div>

  <div class="flow-track">
    <article v-for="node in flow.nodes" :key="node.id" class="flow-node">
      <!-- 痛点骨架 -->
      <header class="flow-node-head">
        <span class="flow-stage">{{ node.stage }}</span>
        <h3 class="flow-pain">{{ node.painPoint }}</h3>
        <p class="flow-pain-detail">{{ node.painDetail }}</p>
      </header>
      <!-- 项目挂在痛点下 -->
      <div class="flow-projects">
        <div v-for="p in node.projects" :key="p.id" class="flow-project-card">
          <span class="flow-project-icon">{{ p.icon }}</span>
          <div>
            <strong>{{ p.title }}</strong>
            <p>{{ p.how }}</p>
            <div class="tag-row">
              <span v-for="tag in p.tags" :key="tag" class="tag-pill tag-pill--muted">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</section>
```

### 5.2 视觉层级（[style.css](file:///d:/code_project/briskygates.github.io/assets/css/style.css)）

- **痛点标题**用大字号 + 强调色（`flow.accent`），是节点里最醒目的元素——读者扫标题就能定位
- **项目卡片**降一档视觉权重：小图标 + 标题 + 一句 `how`，不再用大色块卡片
- **节点之间**用纵向连接线（左侧竖线 + 节点圆点），强化「流程」感
- 节点超过 4 个的业务流（如 A 流 6 节点），考虑**默认折叠后 2 个**，点击「展开完整链路」查看全部——避免一屏太长

### 5.3 导航与锚点

- 顶部 `nav` 里把「项目库」改成 **「业务流」**，点击展开二级菜单：A/B/C/D 四条流直达
- 移动端底栏同理，把「项目」换成「业务流」入口

---

## 六、迁移映射表（老项目 → 新位置）

| 旧分类 | 项目 ID | 新业务流 | 新节点 |
|---|---|---|---|
| doc-intelligence | pdf2xml | A | A1 |
| doc-intelligence | pdf_watermark | A | A1 |
| doc-intelligence | paddle_ocr_vl | A | A1 |
| doc-intelligence | extract_pdf_toc | A | A1 |
| doc-intelligence | gpu_rapid_layout | A | A1 |
| doc-intelligence / rag-knowledge | pdf_chunker | A | A2 |
| rag-knowledge | multi_source_chunk | A | A2 |
| rag-knowledge | qwen3_pg_recall | A | A3 |
| enterprise-ai | report_recall | A | A3 |
| enterprise-ai | rerank_system | A | A4 |
| rag-knowledge | fastapi_celery_kb | A | A5 |
| rag-knowledge | enterprise_chat_openapi | A | A6 |
| agent-mcp | dynamic_mcp | B | B1 |
| agent-mcp | mcp_json_rpc | B | B2 |
| agent-mcp | ai_mcp_middleware | B | B3 |
| agent-mcp | multi_agent_collab | B | B4 |
| agent-mcp | phone_autoglm | B | B5 |
| platform-auto | email_auto_crawl | C | C1 |
| platform-auto | cc_monitor_gmail | C | C1 |
| enterprise-ai | temp_ner | C | C2 |
| rag-knowledge | announcement_tagging | C | C2 |
| enterprise-ai | etf_unusual | C | C3 |
| platform-auto | onchain_token_monitor | C | C3 |
| enterprise-ai | multi_llm_analysis | C | C4 |
| tg-mobile | group_management_bot | D | D1 |
| tg-mobile | need_radar_bot | D | D2 |
| tg-mobile | tg_ai_search | D | D3 |
| platform-auto | lark_sync | D | D4 |
| tg-mobile | smart_clipboard | D | D4 |

> `featured.items`（落地案例 3 则）**保留不动**，作为业务流上方的「买方视角案例」入口；它的痛点句式就是业务流节点痛点的范本。
> `experience.items`（能力履历）**保留不动**，但建议在每条履历后加一个 `relatedFlow` 字段，链回对应业务流，形成「履历佐证业务流」的双向引用。

---

## 七、落地步骤（建议顺序）

1. **先动数据，不动模板**
   在 `homeConfig.json` 里新增 `businessFlows` 字段（保留旧 `projectShowcase` 不删，做灰度对照）。先把 A 流的 6 个节点 + 项目文案写完，跑通一条流。

2. **派生多语言配置**
   参照 [scripts/generate-plain-config.js](file:///d:/code_project/briskygates.github.io/scripts/generate-plain-config.js) 等脚本，给 `businessFlows` 加上 plain / en / zh-Hant 的派生逻辑，避免多语言漏译。

3. **改模板渲染**
   在 `index.html` 里加 `businessFlows` 的 `v-for` 区块（第五节样板），先放在旧 `projectShowcase` 下方，对比效果。

4. **Hero 加入口菜单**
   `heroFlowEntries` 4 张诊断卡，点击 `scrollToSection(flow.id)`。

5. **视觉层级调校**
   `style.css` 里加 `.flow-track / .flow-node / .flow-pain / .flow-project-card` 样式，痛点标题最醒目，项目卡片降一档。

6. **A/B 对照后删除旧结构**
   新结构稳定后，把 `projectShowcase` 从配置和模板里移除，同步更新 `scripts/lib/llms-generator.js`、`scripts/lib/jsonld-generator.js`、`scripts/lib/sitemap-generator.js` 里对 `projectShowcase` 的引用（这些脚本会读项目列表生成 SEO 资产）。

7. **测试**
   [tests/config-structure.test.js](file:///d:/code_project/briskygates.github.io/tests/config-structure.test.js) 和 [tests/app-core.test.js](file:///d:/code_project/briskygates.github.io/tests/app-core.test.js) 里大概率断言了 `projectShowcase` 的结构——需要同步改成断言 `businessFlows`。先跑 `npm test` 看红。

---

## 八、一句话总结

> 现在的项目库是「我的技术陈列馆」，改完应该是「你的业务诊断书」：
> 读者进来 → 选边站（4 条流）→ 看到自己卡在哪（痛点节点）→ 看我怎么解（挂载项目）→ 20 秒内决定要不要往下聊。
>
> 痛点是骨架，项目是肉；骨架要露出来，肉要挂上去。
