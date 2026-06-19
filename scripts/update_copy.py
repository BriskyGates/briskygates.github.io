import json
import os

json_path = r"d:\code_project\briskygates.github.io\assets\data\homeConfig.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Update Hero section
data["profile"]["heroTitle"] = "让 AI 跨越技术演示，落地为真实的生产力"
data["profile"]["greeting"]["description"] = "作为 <strong>AI 全栈开发工程师</strong>，我致力于填补大模型与实际业务之间的鸿沟。<br>擅长将复杂的 RAG、Agent 与多模态技术，转化为稳定、可扩展的企业级应用。"
data["profile"]["heroChips"] = ["大模型应用落地", "企业级 RAG 架构", "多智能体 (Agent) 协作", "高并发微服务", "业务流程自动化"]
data["profile"]["roles"][0]["value"] = "从 0 到 1 搭建企业级 AI 应用：需求解析 → 架构设计 → 研发交付 → 上线运维"

# Update Featured items
featured_updates = {
    "multi_llm_analysis": {
        "title": "多模型驱动的教育解析引擎",
        "subtitle": "精准解析 · 智能复核",
        "description": "面向复杂教育场景的自动化评估系统。通过智能路由分发，针对 8 类复杂题型调用最优大模型，结合多轮校验工作流，大幅提升教辅解析的准确度与效率。",
        "highlights": [
            "构建 8 类题型的自动化识别与路由分发引擎",
            "创新性拆分评估与生成双链路，保障解答严谨性",
            "设计多轮复核流水线，实现复杂题型的精准解析"
        ]
    },
    "group_management_bot": {
        "title": "社群运营与担保交易引擎",
        "subtitle": "高并发 · 业务闭环",
        "description": "为庞大商业社群量身定制的自动化管理与交易平台。深度集成智能风控、资金担保、自动分账与工单客服系统，支撑高并发场景下社群的高效商业化运转。",
        "highlights": [
            "实现从入群验证、反垃圾到风控管理的自动化治理",
            "构建高可靠的专群资金担保与财务对账系统",
            "提供完整的运营端控制台，实现商业流转闭环"
        ]
    },
    "fastapi_celery_kb": {
        "title": "海量金融文档 RAG 数据管线",
        "subtitle": "高并发异步 · 自动化流转",
        "description": "专为金融级海量长文档打造的知识工程流水线。实现从文档智能解析、语义高维分块到高性能向量入库的全自动调度，为大模型提供实时、精准的行业知识底座。",
        "highlights": [
            "实现研报与公告的自动化结构、高质量语义分块",
            "基于 Celery 构建多节点并行的异步任务调度集群",
            "通过 Docker Compose 提供易于扩展的生产级部署方案"
        ]
    },
    "rerank_system": {
        "title": "高精度语义检索重排序引擎",
        "subtitle": "多维融合 · 意图对齐",
        "description": "突破基础 RAG 检索的准确率瓶颈。引入多维度语义重排策略，结合文档时效性、来源权威性进行动态打分与 MMR 多样性去重，确保大模型始终基于最优上下文生成回答。",
        "highlights": [
            "灵活集成多种深度语义打分模型与定制化重排策略",
            "创新融合时效与权威度的综合排序算法",
            "提供完整的查询质量评估与召回链路追踪日志"
        ]
    },
    "phone_autoglm": {
        "title": "移动端智能体群控中枢",
        "subtitle": "视觉感知 · 批量自动化",
        "description": "基于多模态视觉大模型的移动端自动化调度系统。将自然语言转化为精准的终端操作指令，实现多设备的并行任务下发与状态监控，大幅降低跨应用重复操作的业务成本。",
        "highlights": [
            "深度结合屏幕视觉感知与多步复杂操作规划",
            "提供可视化 Web 控制台进行任务编排与设备监控",
            "提供标准化业务接口，轻松将移动端操作接入企业工作流"
        ]
    },
    "need_radar_bot": {
        "title": "智能商业线索挖掘雷达",
        "subtitle": "意图分析 · 供需匹配",
        "description": "24小时不间断的智能商机挖掘平台。利用大模型深度理解海量非结构化文本中的供需意图，精准计算匹配互补资源，并通过自动化订阅引擎完成高质量商机的实时触达。",
        "highlights": [
            "利用大模型构建精准的供方/需方意图提取与语义对齐",
            "构建基于白名单规则的增量抓取与高可用订阅推送引擎",
            "提供全功能运营管理后台，实现线索全生命周期管理"
        ]
    }
}

for item in data["featured"]["items"]:
    item_id = item["id"]
    if item_id in featured_updates:
        item.update(featured_updates[item_id])

# Update Category Descriptions
data["projectShowcase"]["rows"][0]["title"] = "企业级 AI 解决方案"
data["projectShowcase"]["rows"][0]["description"] = "将前沿模型能力转化为切实解决业务痛点的生产系统"

data["projectShowcase"]["rows"][1]["title"] = "RAG 与知识工程基建"
data["projectShowcase"]["rows"][1]["description"] = "构建从文档解析、高质量分块到精准召回的 RAG 全链路底座"

data["projectShowcase"]["rows"][2]["title"] = "多模态文档智能解析"
data["projectShowcase"]["rows"][2]["description"] = "解决复杂版面、扫描件、多模态文档的精准结构化提取难题"

data["projectShowcase"]["rows"][3]["title"] = "Agent 智能体与自动化"
data["projectShowcase"]["rows"][3]["description"] = "打造感知复杂环境、自主规划并调度工具链的智能体网络"

data["projectShowcase"]["rows"][4]["title"] = "社群机器人与生态应用"
data["projectShowcase"]["rows"][4]["description"] = "深度整合 IM 生态与混合检索能力，打造高转化、高粘性的商业效率工具"

data["projectShowcase"]["rows"][5]["title"] = "业务后台与运维中枢"
data["projectShowcase"]["rows"][5]["description"] = "提供稳定可靠的监控、异步调度与数据流转基础设施"

# Also updating some items inside projectShowcase to sound more professional
showcase_updates = {
    "multi_llm_analysis": {"title": "多模型教育解析引擎", "description": "构建复杂题型识别分流网络，分离评估与生成环节，支持多轮自动复核以确保解析严谨性。"},
    "report_recall": {"title": "研报图文多模态召回", "description": "实现 PDF 文档内联图表与正文的双路向量化存储，精准响应投研问答中对图表数据和文本证据的高阶检索需求。"},
    "etf_unusual": {"title": "ETF 盘中异动量化监测", "description": "构建毫秒级行情与资讯异动监测引擎，多维量化指标自动评估风险，通过实时预警辅助投研决策。"},
    "temp_ner": {"title": "高精度金融实体识别 (NER)", "description": "针对研报文本提供定制化的金融实体提取服务，结合知识图谱召回与财报周期逻辑解析，强化业务数据的语义理解。"},
    "fastapi_celery_kb": {"title": "海量长文档异步入库集群", "description": "基于 Celery 与 Docker 构建的异步分布式文档处理系统，支撑研报与公告的自动化入库与向量化编排。"},
    "multi_source_chunk": {"title": "全格式文档自适应分块管线", "description": "构建兼容多格式来源的自动化高维分块服务，部署于 GPU 生产环境，平稳支撑大规模资讯信息的流式清洗与入库。"},
    "qwen3_pg_recall": {"title": "Qwen3 向量化检索中台", "description": "基于前沿 Embedding 模型与 PGVector 架构的企业级向量召回微服务，深度优化垂直行业文本的语义命中率。"},
    "enterprise_chat_openapi": {"title": "企业级对话问答网关", "description": "提供标准化的对话式 RAG OpenAPI 接口，封装底层的复杂检索与大模型生成逻辑，提供完整的鉴权与调用日志审计。"},
    "announcement_tagging": {"title": "金融资讯智能打标分类", "description": "利用 NLP 模型对海量上市公司公告与资讯进行自动化标签提取与归类，为下游的信息聚合与个性化推送提供数据支撑。"},
    "pdf2xml": {"title": "高精度 PDF 结构化解析引擎", "description": "运用底层库高精度逆向解析 PDF 坐标，提炼文本、表格与逻辑层级，为下游 RAG 检索提供最纯净的结构化数据源。"},
    "pdf_chunker": {"title": "研报/公告智能语义分块", "description": "专门针对金融排版优化的智能分块算法，有效识别多形态表格并输出高质量 Markdown，最大程度保留文档的业务逻辑语境。"},
    "pdf_watermark": {"title": "智能 PDF 净水处理引擎", "description": "基于可配置规则库与视觉坐标匹配，实现研报批量去水印处理，显著提升后续 OCR 识别与文本提取的准确率基线。"},
    "paddle_ocr_vl": {"title": "多模态 OCR 视觉解析服务", "description": "将先进的 OCR 与版面理解模型封装为高并发 API，提供开箱即用的扫描件与复杂图片信息的结构化提取能力。"},
    "extract_pdf_toc": {"title": "研报目录层级深度挖掘", "description": "设计书签提取、目录页解析到版面理解的三级降级兜底策略，极致提升复杂金融研报的结构化目录还原成功率。"},
    "gpu_rapid_layout": {"title": "GPU 版面元素极速检测", "description": "基于 GPU 推理集群加速的版面元素识别 API，支持高并发异步落库，高效拆解图、表、段落等文档区块。"},
    "dynamic_mcp": {"title": "沙箱化代码执行与工具代理", "description": "赋能大模型在隔离沙箱中动态编写执行代码并按需挂载工具，有效解决静态工具链的泛化难题。"},
    "mcp_json_rpc": {"title": "MCP 服务流编排引擎", "description": "根据自然语言指令智能规划多工具调用链路，支持上下文感知的复杂意图拆解与多并发任务执行。"},
    "ai_mcp_middleware": {"title": "企业级模型能力聚合网关", "description": "构建统一的 AI 工具调度中间层，屏蔽各业务系统直连大模型的复杂性，实现 AI 接口资产的集中化管控与路由。"},
    "multi_agent_collab": {"title": "复杂业务多智能体协同", "description": "设计多角色 Agent 协同网络，实现复杂任务的自主拆解、多轮路由与自动化执行闭环，赋能复杂业务工作流重构。"},
    "group_management_bot": {"title": "社群管理与商业变现中枢", "description": "一体化社群运营解决方案，涵盖反作弊风控、担保交易与智能客服，深度赋能私域流量的高效转化与商业变现。"},
    "need_radar_bot": {"title": "社群商业线索洞察雷达", "description": "7x24小时全量监听社群动态，以 LLM 提取商业意图，实现互补商机的精准捕捉与定向实时触达。"},
    "tg_ai_search": {"title": "社群历史内容智能检索引擎", "description": "融合全文检索与向量相似度的双路召回系统，深度挖掘并精准定位海量社群聊天记录中的有价值信息。"},
    "smart_clipboard": {"title": "AI 增强智能剪贴板", "description": "基于 Rust 极致性能打造的桌面级效率辅助工具，实时监听并调用大模型重塑剪贴板内容，无缝衔接各类工作流。"},
    "onchain_token_monitor": {"title": "链上资产高频监控预警", "description": "搭建低延迟链上数据监听节点，结合 Redis 缓存实现高速去重与研判，毫秒级推送核心交易情报。"},
    "cc_monitor_gmail": {"title": "邮件情报自动化分发引擎", "description": "实时监听核心邮箱，通过定制化规则萃取高价值邮件信息并跨平台路由投递，打通邮件到 IM 的信息孤岛。"},
    "lark_sync": {"title": "企业办公协同数据管道", "description": "打通飞书多维表格与后端业务系统的数据壁垒，实现订单状态、客商信息的双向实时同步更新，消除人工对账成本。"},
    "email_auto_crawl": {"title": "研报附件 RPA 自动化采集", "description": "自动化轮询邮箱并萃取附件研报中的关键数据表格，输出标准结构化台账，极大提升金融投研数据入库效率。"}
}

for row in data["projectShowcase"]["rows"]:
    for item in row["items"]:
        item_id = item["id"]
        if item_id in showcase_updates:
            item.update(showcase_updates[item_id])

# Update Experience section to be more professional
data["experience"]["subtitle"] = "在复杂的业务场景中，磨练出的全栈工程实力"
data["experience"]["items"][0]["title"] = "企业 AI 架构设计与研发"
data["experience"]["items"][0]["description"] = "深度主导企业级智能体、复杂 RAG 架构、多模态应用的设计与落地。积累了从 POC 概念验证到高可用生产系统的全链路调优经验。"
data["experience"]["items"][1]["title"] = "文档智能与非结构化数据处理"
data["experience"]["items"][1]["description"] = "主导构建百万级金融文档解析管线，攻克 PDF 复杂版面、深度 OCR 识别、高优分块策略等核心难题，奠定高质量数据底座。"
data["experience"]["items"][2]["title"] = "高并发 IM 机器人与后台架构"
data["experience"]["items"][2]["description"] = "设计并实现高并发的商业生态机器人与运维监控中枢，熟练应用异步框架与缓存队列，保障核心交易流的绝对稳定性。"

# Update Skills section
data["skills"]["motto"] = "不仅精于大模型的调度，<strong>更专注于将 AI 技术无缝融合入企业系统</strong>，提供稳定、可扩展的工程落地架构。"

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully updated JSON.")
