import json
import os

# 注意：此脚本为一次性文案润色脚本，已执行完毕。
# projectShowcase 已迁移为 businessFlows 结构，不在此脚本覆盖范围内。
# 如需更新 businessFlows 文案，请直接编辑 assets/data/homeConfig.json。

json_path = r"d:\code_project\briskygates.github.io\assets\data\homeConfig.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Update Hero section
data["profile"]["heroTitle"] = "让 AI 跨越技术演示，落地为真实的生产力"
data["profile"]["greeting"]["description"] = "作为 <strong>AI 全栈开发工程师</strong>，我致力于填补大模型与实际业务之间的鸿沟。<br>擅长将复杂的 RAG、Agent 与多模态技术，转化为稳定、可扩展的企业级应用。"
data["profile"]["heroChips"] = ["大模型应用落地", "企业级 RAG 架构", "多智能体 (Agent) 协作", "高并发微服务", "业务流程自动化"]
data["profile"]["roles"][0]["value"] = "从 0 到 1 搭建企业级 AI 应用：需求解析 -> 架构设计 -> 研发交付 -> 上线运维"

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
