import json

json_path = r"d:\code_project\briskygates.github.io\assets\data\homeConfig.en.json"

with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Update Hero section
data["profile"]["heroTitle"] = "Turning AI from Tech Demos into Real Production Power"
data["profile"]["greeting"]["description"] = "As an <strong>AI Full-Stack Engineer</strong>, I bridge the gap between LLMs and real-world business needs.<br>Specializing in transforming complex RAG, Agents, and multimodal tech into stable, scalable enterprise applications."
data["profile"]["heroChips"] = ["LLM Productionization", "Enterprise RAG Architecture", "Multi-Agent Collaboration", "High-Concurrency Microservices", "Workflow Automation"]
data["profile"]["roles"][0]["value"] = "Building Enterprise AI Apps from 0 to 1: Requirements → Architecture → Development → Ops"

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

# Update Category Descriptions
data["projectShowcase"]["rows"][0]["title"] = "Enterprise AI Solutions"
data["projectShowcase"]["rows"][0]["description"] = "Transforming cutting-edge model capabilities into production systems that solve actual business pain points"

data["projectShowcase"]["rows"][1]["title"] = "RAG & Knowledge Engineering Infrastructure"
data["projectShowcase"]["rows"][1]["description"] = "Building the full RAG pipeline from document parsing, high-quality chunking to precise retrieval"

data["projectShowcase"]["rows"][2]["title"] = "Multimodal Document Intelligence"
data["projectShowcase"]["rows"][2]["description"] = "Solving precise structured extraction for complex layouts, scanned copies, and multimodal documents"

data["projectShowcase"]["rows"][3]["title"] = "Agents & Automation"
data["projectShowcase"]["rows"][3]["description"] = "Building agent networks capable of perceiving complex environments, autonomous planning, and toolchain orchestration"

data["projectShowcase"]["rows"][4]["title"] = "Community Bots & Ecosystem Apps"
data["projectShowcase"]["rows"][4]["description"] = "Deeply integrating IM ecosystems with hybrid search to build high-conversion, highly sticky commercial productivity tools"

data["projectShowcase"]["rows"][5]["title"] = "Backend Systems & Ops Orchestration"
data["projectShowcase"]["rows"][5]["description"] = "Providing stable and reliable infrastructure for monitoring, asynchronous scheduling, and data flow"

# Also updating some items inside projectShowcase to sound more professional
showcase_updates = {
    "multi_llm_analysis": {"title": "Multi-LLM Education Parsing Engine", "description": "Built a complex question recognition routing network, separated evaluation and generation stages, supporting multi-round automatic verification for rigorous parsing."},
    "report_recall": {"title": "Multimodal Report Retrieval", "description": "Achieved dual-track vector storage for inline charts and text in PDFs, precisely responding to advanced retrieval needs for chart data and text evidence in investment research."},
    "etf_unusual": {"title": "Intraday ETF Quant Monitoring", "description": "Built a millisecond-level market and news anomaly monitoring engine, automatically evaluating risks across multidimensional quant indicators to assist investment decisions."},
    "temp_ner": {"title": "High-Precision Financial NER", "description": "Provided customized financial entity extraction for research reports, combining knowledge graph retrieval and financial cycle logic parsing to enhance semantic understanding of business data."},
    "fastapi_celery_kb": {"title": "Massive Long-Doc Async Ingestion", "description": "An asynchronous distributed document processing system based on Celery and Docker, supporting automated ingestion and vectorization orchestration of reports."},
    "multi_source_chunk": {"title": "Adaptive Multi-Format Chunking", "description": "Built an automated high-dimensional chunking service supporting various formats, deployed in GPU production to smoothly support massive streaming information ingestion."},
    "qwen3_pg_recall": {"title": "Qwen3 Vector Retrieval Platform", "description": "Enterprise-grade vector retrieval microservice based on cutting-edge Embedding models and PGVector, deeply optimizing semantic hit rates for vertical industry texts."},
    "enterprise_chat_openapi": {"title": "Enterprise Conversational Q&A Gateway", "description": "Provided standardized conversational RAG OpenAPI interfaces, encapsulating underlying complex retrieval and LLM generation logic with complete authentication and auditing."},
    "announcement_tagging": {"title": "Financial News Smart Tagging", "description": "Used NLP models for automated tag extraction and classification of massive corporate announcements, providing data support for downstream information aggregation and push."},
    "pdf2xml": {"title": "High-Precision PDF Structuring Engine", "description": "Utilized low-level libraries to reversely parse PDF coordinates with high precision, extracting text, tables, and logical hierarchy as the purest structured data source for RAG."},
    "pdf_chunker": {"title": "Report Smart Semantic Chunking", "description": "Intelligent chunking algorithms specifically optimized for financial layouts, effectively recognizing various table formats and outputting high-quality Markdown while preserving business context."},
    "pdf_watermark": {"title": "Smart PDF Watermark Removal", "description": "Based on configurable rule bases and visual coordinate matching, enabling batch watermark removal for reports to significantly raise the baseline accuracy of subsequent OCR."},
    "paddle_ocr_vl": {"title": "Multimodal OCR Visual Service", "description": "Encapsulated advanced OCR and layout understanding models into high-concurrency APIs, providing out-of-the-box structured extraction for scanned copies and complex images."},
    "extract_pdf_toc": {"title": "Deep Report TOC Extraction", "description": "Designed a three-level fallback strategy from bookmark extraction to page parsing to layout understanding, maximally boosting the TOC reconstruction success rate of complex reports."},
    "gpu_rapid_layout": {"title": "Ultra-Fast GPU Layout Detection", "description": "Layout element recognition API accelerated by GPU inference clusters, supporting high-concurrency asynchronous ingestion to efficiently dismantle charts, tables, and paragraphs."},
    "dynamic_mcp": {"title": "Sandboxed Code Execution & Tool Proxy", "description": "Empowered LLMs to dynamically write and execute code in isolated sandboxes and mount tools on demand, effectively solving the generalization challenges of static toolchains."},
    "mcp_json_rpc": {"title": "MCP Service Orchestration Engine", "description": "Intelligently planning multi-tool invocation links based on natural language instructions, supporting context-aware complex intent decomposition and concurrent task execution."},
    "ai_mcp_middleware": {"title": "Enterprise Model Capability Gateway", "description": "Built a unified AI tool scheduling middleware, shielding the complexity of business systems directly connecting to LLMs, achieving centralized control and routing of AI API assets."},
    "multi_agent_collab": {"title": "Complex Multi-Agent Collaboration", "description": "Designed multi-role Agent collaborative networks, realizing autonomous decomposition, multi-round routing, and automated execution loops for complex tasks, empowering workflow reconstruction."},
    "group_management_bot": {"title": "Community Ops & Monetization Hub", "description": "All-in-one community operations solution covering anti-fraud risk control, escrow trading, and smart customer service, deeply empowering the efficient conversion of private traffic."},
    "need_radar_bot": {"title": "Community Lead Insight Radar", "description": "24/7 full-volume monitoring of community dynamics, extracting business intents with LLMs to accurately capture complementary opportunities and deliver real-time targeted alerts."},
    "tg_ai_search": {"title": "Community History Smart Search", "description": "Dual-track retrieval system fusing full-text search and vector similarity, deeply mining and precisely locating valuable information in massive community chat histories."},
    "smart_clipboard": {"title": "AI-Enhanced Smart Clipboard", "description": "Desktop productivity tool built with Rust for extreme performance, tracking and reshaping clipboard content with LLMs in real-time, seamlessly bridging various workflows."},
    "onchain_token_monitor": {"title": "High-Freq On-chain Asset Monitor", "description": "Built low-latency on-chain data listening nodes, combined with Redis caching for high-speed deduplication and analysis, pushing core trading intelligence in milliseconds."},
    "cc_monitor_gmail": {"title": "Email Intel Automated Routing", "description": "Real-time monitoring of core inboxes, extracting high-value email information via custom rules and delivering across platforms, bridging the information silo between Email and IM."},
    "lark_sync": {"title": "Enterprise Data Synergy Pipeline", "description": "Breaking the data barrier between Lark multidimensional tables and backend systems, achieving bi-directional real-time sync of order statuses and client info, eliminating manual reconciliation costs."},
    "email_auto_crawl": {"title": "Report Attachment RPA Crawler", "description": "Automated polling of emails to extract key data tables from attached reports, outputting standard structured ledgers, vastly improving financial data ingestion efficiency."}
}

for row in data["projectShowcase"]["rows"]:
    for item in row["items"]:
        item_id = item["id"]
        if item_id in showcase_updates:
            item.update(showcase_updates[item_id])

# Update Experience section
data["experience"]["subtitle"] = "Full-stack engineering capabilities honed in complex business scenarios"
data["experience"]["items"][0]["title"] = "Enterprise AI Architecture & Dev"
data["experience"]["items"][0]["description"] = "Deeply led the design and implementation of enterprise agents, complex RAG architectures, and multimodal applications. Accumulated full-cycle tuning experience from POC to high-availability production systems."
data["experience"]["items"][1]["title"] = "Document Intelligence & Data Pipelines"
data["experience"]["items"][1]["description"] = "Led the construction of a million-level financial document parsing pipeline, overcoming core challenges like complex PDF layouts, deep OCR, and high-priority chunking strategies to build a high-quality data foundation."
data["experience"]["items"][2]["title"] = "High-Concurrency IM Bots & Backends"
data["experience"]["items"][2]["description"] = "Designed and implemented high-concurrency commercial ecosystem bots and ops monitoring hubs, proficient in async frameworks and caching queues to guarantee absolute stability of core trading flows."

# Update Skills section
data["skills"]["motto"] = "Not just an LLM prompter—<strong>dedicated to seamlessly integrating AI into enterprise systems</strong> to provide stable, scalable engineering architectures."

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Successfully updated EN JSON.")
