import json

# Note: This is a one-off copy-polish script, already executed.
# projectShowcase has been migrated to businessFlows and is not covered here.
# To update businessFlows copy, edit assets/data/homeConfig.en.json directly.

json_path = r"d:\code_project\briskygates.github.io\assets\data\homeConfig.en.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Update Hero section
data["profile"]["heroTitle"] = "Turning AI from Tech Demos into Real Production Power"
data["profile"]["greeting"]["description"] = "As an <strong>AI Full-Stack Engineer</strong>, I bridge the gap between LLMs and real-world business needs.<br>Specializing in transforming complex RAG, Agents, and multimodal tech into stable, scalable enterprise applications."
data["profile"]["heroChips"] = ["LLM Productionization", "Enterprise RAG Architecture", "Multi-Agent Collaboration", "High-Concurrency Microservices", "Workflow Automation"]
data["profile"]["roles"][0]["value"] = "Building Enterprise AI Apps from 0 to 1: Requirements -> Architecture -> Development -> Ops"

# Update Featured items
featured_updates = {
    "multi_llm_analysis": {
        "title": "Multi-LLM Education Evaluation Engine",
        "subtitle": "Precision Parsing · Smart Verification",
        "description": "An automated evaluation system for complex education scenarios. By intelligently routing 8 types of complex questions to optimal LLMs and integrating multi-round validation workflows, it significantly boosts the accuracy and efficiency of educational material parsing.",
        "highlights": [
            "Built an automated recognition and routing engine for 8 question types",
            "Innovatively decoupled evaluation and generation pipelines for rigorous answers",
            "Designed a multi-round verification workflow for precise parsing of complex questions"
        ]
    },
    "group_management_bot": {
        "title": "Community Ops & Escrow Trading Engine",
        "subtitle": "High Concurrency · Business Closed-Loop",
        "description": "A tailored automation management and trading platform for massive commercial communities. Deeply integrates smart risk control, fund escrow, automated profit splitting, and ticketing systems to support highly concurrent commercial operations.",
        "highlights": [
            "Automated governance from group entry verification, anti-spam to risk control",
            "Built a highly reliable escrow and financial reconciliation system for VIP groups",
            "Provided a comprehensive admin console to close the commercial workflow loop"
        ]
    },
    "fastapi_celery_kb": {
        "title": "Enterprise RAG Data Pipeline",
        "subtitle": "Async Concurrency · Automated Flow",
        "description": "A knowledge engineering pipeline designed for massive financial long-form documents. Enables fully automated scheduling from smart document parsing and high-dimensional semantic chunking to high-performance vector ingestion, providing a real-time, precise knowledge base for LLMs.",
        "highlights": [
            "Automated structural and high-quality semantic chunking of reports and announcements",
            "Built a multi-node parallel asynchronous task scheduling cluster with Celery",
            "Provided scalable production deployment solutions via Docker Compose"
        ]
    },
    "rerank_system": {
        "title": "High-Precision Semantic Reranking Engine",
        "subtitle": "Multi-dimensional Fusion · Intent Alignment",
        "description": "Breaking the accuracy bottleneck of standard RAG retrieval. Introduces multi-dimensional semantic reranking strategies, dynamically scoring by document recency and source authority with MMR diversity deduplication, ensuring LLMs generate answers based on the optimal context.",
        "highlights": [
            "Flexibly integrated multiple deep semantic scoring models and custom reranking strategies",
            "Innovatively fused recency and authority into a comprehensive ranking algorithm",
            "Provided full query quality evaluation and retrieval tracing logs"
        ]
    },
    "phone_autoglm": {
        "title": "Mobile Agent Orchestration Hub",
        "subtitle": "Visual Perception · Batch Automation",
        "description": "A mobile automation scheduling system powered by multimodal visual LLMs. Translates natural language into precise terminal operation commands, enabling parallel task dispatching and status monitoring across multiple devices, drastically reducing the cost of cross-app repetitive operations.",
        "highlights": [
            "Deeply integrated screen visual perception with multi-step complex operation planning",
            "Provided a visual Web console for task orchestration and device monitoring",
            "Offered standardized business APIs to easily integrate mobile operations into workflows"
        ]
    },
    "need_radar_bot": {
        "title": "Intelligent Lead Generation Radar",
        "subtitle": "Intent Analysis · Supply-Demand Matching",
        "description": "A 24/7 intelligent business opportunity mining platform. Uses LLMs to deeply understand supply and demand intents from massive unstructured texts, precisely matches complementary resources, and delivers high-quality leads in real-time via an automated subscription engine.",
        "highlights": [
            "Utilized LLMs for precise supply/demand intent extraction and semantic alignment",
            "Built an incremental scraping and high-availability subscription pushing engine",
            "Provided a full-featured admin backend for comprehensive lead lifecycle management"
        ]
    }
}

for item in data["featured"]["items"]:
    item_id = item["id"]
    if item_id in featured_updates:
        item.update(featured_updates[item_id])

# Update Experience section
data["experience"]["subtitle"] = "Full-stack engineering capabilities honed in complex business scenarios"
data["experience"]["items"][0]["title"] = "Enterprise AI Architecture & Dev"
data["experience"]["items"][0]["description"] = "Deeply led the design and implementation of enterprise agents, complex RAG architectures, and multimodal applications. Accumulated full-cycle tuning experience from POC to high-availability production systems."
data["experience"]["items"][1]["title"] = "Document Intelligence & Data Pipelines"
data["experience"]["items"][1]["description"] = "Led the construction of a million-level financial document parsing pipeline, overcoming core challenges like complex PDF layouts, deep OCR, and high-priority chunking strategies to build a high-quality data foundation."
data["experience"]["items"][2]["title"] = "High-Concurrency IM Bots & Backends"
data["experience"]["items"][2]["description"] = "Designed and implemented high-concurrency commercial ecosystem bots and ops monitoring hubs, proficient in async frameworks and caching queues to guarantee absolute stability of core trading flows."

# Update Skills section
data["skills"]["motto"] = "Not just an LLM prompter-<strong>dedicated to seamlessly integrating AI into enterprise systems</strong> to provide stable, scalable engineering architectures."

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully updated EN JSON.")
