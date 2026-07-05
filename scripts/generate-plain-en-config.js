'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const en = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/homeConfig.en.json'), 'utf8'));

Object.assign(en.ui, {
    pageTitle: 'Abu · I Build AI Systems',
    pageDescription: 'Python dev who ships AI that actually works in production',
    searchPlaceholder: 'Search projects, skills, how we can work together…',
    heroCtaPrimary: 'See featured work',
    heroCtaSecondary: 'See what I do',
    contactMethodsTitle: 'Get in touch',
    languageToggle: { tooltip: 'Pick a language' },
    toast: {
        wechatCopied: 'WeChat ID copied',
        xianyuCopied: 'Store name copied',
        imCopied: 'Account copied'
    },
    projectStatus: {
        production: 'Live',
        active: 'Maintained',
        testing: 'Testing',
        development: 'In progress',
        planned: 'Planned',
        highlightsLabel: 'Highlights',
        progressLabel: 'Progress'
    },
    greetings: {
        morning: 'Good morning',
        afternoon: 'Good afternoon',
        evening: 'Good evening',
        night: 'Still up working?'
    }
});

en.ui.nav = [
    { id: 'home', label: 'Home', shortLabel: 'Home', icon: 'fas fa-house' },
    { id: 'showcase', label: 'Featured', shortLabel: 'Work', icon: 'fas fa-fire' },
    { id: 'projects', label: 'Projects', shortLabel: 'Projects', icon: 'fas fa-layer-group' },
    { id: 'experience', label: 'Experience', shortLabel: 'Exp', icon: 'fas fa-route' },
    { id: 'skills', label: 'Skills', shortLabel: 'Skills', icon: 'fas fa-bolt' },
    { id: 'services', label: 'Services', shortLabel: 'Services', icon: 'fas fa-briefcase' },
    { id: 'contact', label: 'Contact', shortLabel: 'Contact', icon: 'fas fa-envelope' }
];

Object.assign(en.profile, {
    tagline: 'Shanghai · Online',
    status: 'Open to work',
    heroTitle: 'Help companies use AI for real — not just demos',
    title: 'About me',
    greeting: {
        text: "Hi, I'm Abu, based in Shanghai",
        description: "I'm an <strong>AI full-stack engineer</strong> — I help companies turn large language models into systems that run, scale, and stay maintainable.<br>Knowledge bases, AI assistants, document processing, bots — that's my wheelhouse."
    },
    heroChips: ['AI in production', 'Knowledge bases', 'AI assistants', 'Document AI', 'Automation'],
    roles: [
        { label: 'What I do', value: 'Idea to launch: talk requirements → design architecture → build → deploy & maintain', type: 'primary' },
        { label: 'Good fit for', value: 'Companies, startups, and teams that need AI but lack in-house tech', type: 'secondary' }
    ],
    stats: [
        { number: '6+', label: 'Years' },
        { number: '80+', label: 'Projects' },
        { number: '15+', label: 'AI builds' },
        { number: 'Full-stack', label: 'End to end' }
    ]
});

en.featured.title = 'Featured work';
en.featured.subtitle = 'A few projects that best show what I can do';

const featuredMap = {
    multi_llm_analysis: {
        title: 'AI homework grading & problem solving',
        subtitle: 'Many question types · auto-check',
        description: 'Built for education: picks the right AI per question type, then double-checks answers to cut down errors.',
        highlights: ['8 question types auto-detected', 'Answer and scoring done separately for reliability', 'Multi-round review for hard problems']
    },
    group_management_bot: {
        title: 'Community bot + escrow trading',
        subtitle: 'Group ops · payments · splits',
        description: 'Telegram bot for large groups: moderation, scam prevention, escrow trades, support tickets — all in one.',
        highlights: ['Join verification, anti-spam, risk controls', 'Escrow trades and financial reconciliation', 'Admin dashboard at a glance']
    },
    fastapi_celery_kb: {
        title: 'Financial document knowledge pipeline',
        subtitle: 'Lots of docs · auto-ingest',
        description: 'Splits long reports and filings into chunks, turns them into vectors, and stores them for AI Q&A.',
        highlights: ['Reports and filings auto-chunked', 'Parallel processing across machines', 'One-click Docker deploy']
    },
    rerank_system: {
        title: 'Search result reranker',
        subtitle: 'Helps AI cite the right sources',
        description: 'After a knowledge base search returns hits, this re-ranks them so the most relevant and recent come first.',
        highlights: ['Multiple ranking strategies', 'Weighs freshness and source trust', 'Logs to audit search quality']
    },
    phone_autoglm: {
        title: 'Bulk phone automation',
        subtitle: 'Sees the screen · taps for you',
        description: 'AI reads phone screens and runs tasks you describe — many phones at once, less repetitive manual work.',
        highlights: ['Screen-based complex actions', 'Web console for task management', 'API to plug into workflows']
    },
    need_radar_bot: {
        title: 'Lead-finding bot',
        subtitle: 'Listens to chats · spots demand',
        description: 'Watches group messages 24/7, uses AI to spot buyers and sellers, and pushes matched leads.',
        highlights: ['AI understands buy/sell intent', 'Incremental crawl + push alerts', 'Dashboard for all leads']
    }
};

en.featured.items.forEach(item => {
    const m = featuredMap[item.id];
    if (m) Object.assign(item, m);
});

const rowTitles = {
    'enterprise-ai': { title: 'Enterprise AI apps', description: 'AI built to run in real business systems' },
    'rag-knowledge': { title: 'Knowledge bases & search', description: 'Docs in → chunk → findable → accurate answers' },
    'doc-intelligence': { title: 'Document processing', description: 'PDFs, scans, messy layouts — structured output' },
    'agent-mcp': { title: 'AI assistants & automation', description: 'AI plans steps and calls tools to finish tasks' },
    'tg-mobile': { title: 'Bots & messaging apps', description: 'Telegram bots, search, desktop utilities' },
    'platform-auto': { title: 'Backend & ops', description: 'Monitoring, scheduling, data sync infrastructure' }
};
en.projectShowcase.rows.forEach(row => {
    const t = rowTitles[row.id];
    if (t) Object.assign(row, t);
});

const projectMap = {
    multi_llm_analysis: { title: 'AI education problem solver', subtitle: '8 question types', description: 'Different AI per type, with a review pass after.' },
    rerank_system: { title: 'Search reranking', subtitle: 'Better Q&A', description: 'Re-orders search hits so citations are more reliable.' },
    report_recall: { title: 'Report image + text search', subtitle: 'Charts and text', description: 'Stores charts and text separately so both are searchable.' },
    etf_unusual: { title: 'ETF anomaly alerts', subtitle: 'Market watch', description: 'Watches markets and pushes when something looks off.' },
    temp_ner: { title: 'Financial entity extraction', subtitle: 'Companies, dates', description: 'Pulls company names, dates, and key facts from reports.' },
    fastapi_celery_kb: { title: 'Bulk document ingest', subtitle: 'Async pipeline', description: 'Queues large doc batches for chunking and vectorization.' },
    multi_source_chunk: { title: 'Multi-format chunking', subtitle: 'One pipeline', description: 'Same flow for docs from different sources.' },
    qwen3_pg_recall: { title: 'Vector search service', subtitle: 'PostgreSQL', description: 'Semantic search with a vector database.' },
    enterprise_chat_openapi: { title: 'Enterprise Q&A API', subtitle: 'Ready to use', description: 'Search + Q&A wrapped as an API for other systems.' },
    announcement_tagging: { title: 'Filing auto-tagging', subtitle: 'Sort & label', description: 'Tags huge volumes of filings for downstream use.' },
    pdf2xml: { title: 'PDF structured parsing', subtitle: 'Text & tables', description: 'Turns PDFs into clean structured data.' },
    pdf_chunker: { title: 'Report smart chunking', subtitle: 'Keeps context', description: 'Splits by paragraphs and tables without losing meaning.' },
    pdf_watermark: { title: 'PDF watermark removal', subtitle: 'Batch jobs', description: 'Batch-remove watermarks so OCR works better.' },
    paddle_ocr_vl: { title: 'Image OCR service', subtitle: 'Upload & parse', description: 'Upload scans or complex images and get text structure back.' },
    extract_pdf_toc: { title: 'PDF table of contents', subtitle: 'Multi fallback', description: 'Tries hard to restore report outline structure.' },
    gpu_rapid_layout: { title: 'Layout element detection', subtitle: 'GPU speed', description: 'Quickly finds figures, tables, and blocks in docs.' },
    phone_autoglm: { title: 'Phone fleet control', subtitle: 'Cloud phones', description: 'Web UI to manage many phones; API for tasks and status.' },
    dynamic_mcp: { title: 'AI writes code to use tools', subtitle: 'Sandboxed', description: 'AI writes and runs code in isolation for flexibility.' },
    mcp_json_rpc: { title: 'Multi-tool orchestration', subtitle: 'Auto chaining', description: 'You ask in plain language; AI plans which tools to call.' },
    ai_mcp_middleware: { title: 'Unified AI gateway', subtitle: 'Central control', description: 'One entry point for business systems to call AI.' },
    multi_agent_collab: { title: 'Multiple AIs working together', subtitle: 'Split the work', description: 'Hard tasks split across AI roles that coordinate.' },
    group_management_bot: { title: 'Community ops bot', subtitle: 'Groups & revenue', description: 'Moderation, escrow, support — monetize private communities.' },
    need_radar_bot: { title: 'Lead radar', subtitle: 'Chat mining', description: 'Listens to groups, finds buy/sell intent, pushes leads.' },
    tg_ai_search: { title: 'Chat history search', subtitle: 'Full-text + semantic', description: 'Find useful info fast in huge chat logs.' },
    smart_clipboard: { title: 'AI clipboard', subtitle: 'Windows desktop', description: 'AI rewrites and tidies text when you copy.' },
    onchain_token_monitor: { title: 'On-chain trade monitor', subtitle: 'Live alerts', description: 'Watches on-chain activity and pings IM on anomalies.' },
    cc_monitor_gmail: { title: 'Email auto-forward', subtitle: 'Email → IM', description: 'Important emails extracted and sent to chat tools.' },
    lark_sync: { title: 'Lark data sync', subtitle: 'Sheet integration', description: 'Two-way sync between Lark sheets and backend systems.' },
    email_auto_crawl: { title: 'Inbox report crawler', subtitle: 'RPA', description: 'Collects email attachments and pulls table data into storage.' }
};

en.projectShowcase.rows.forEach(row => {
    row.items.forEach(item => {
        const m = projectMap[item.id];
        if (m) Object.assign(item, m);
    });
});

en.experience.title = 'What I have done';
en.experience.subtitle = 'Main areas I have worked in recently';
en.experience.items = [
    { period: '2024 — present', title: 'Enterprise AI systems', description: 'AI assistants, knowledge Q&A, multimodal apps — from demo to production.', tags: ['AI assistants', 'Knowledge bases', 'Phone automation'] },
    { period: '2022 — 2024', title: 'Document processing', description: 'Millions of financial PDFs: messy layouts, OCR, chunking — clean data for AI.', tags: ['PDF', 'OCR'] },
    { period: '2020 — present', title: 'Bots & backends', description: 'High-traffic Telegram bots and monitoring; trading flows that must stay up.', tags: ['Bots', 'Lark', 'Redis'] },
    { period: 'Ongoing', title: 'AI tooling', description: 'AI calling tools, writing code, querying databases — auditable, repeatable flows.', tags: ['MCP', 'Agent'] }
];

en.skills.title = 'What I know';
en.skills.motto = 'Not just tuning models — <strong>embedding AI into existing systems</strong> so it stays stable and scales.';
en.skills.items = [
    { title: 'AI applications', description: 'Knowledge Q&A / phone automation / model deploy / multi-agent / tool use', tags: ['RAG', 'Agent', 'MCP'], icon: '🤖' },
    { title: 'Finance text & knowledge', description: 'Report chunking, search ranking, chart retrieval, news classification', tags: ['Vector DB', 'Reports'], icon: '📊' },
    { title: 'Document processing', description: 'PDF parsing / OCR / watermark removal / table recognition', tags: ['PDF', 'OCR'], icon: '📄' },
    { title: 'Integration & automation', description: 'Telegram bots / Lark / email automation / job queues', tags: ['Bot', 'Lark'], icon: '⚡' }
];
en.skills.summary = [
    { icon: '🏗️', text: 'Full-stack' },
    { icon: '🧠', text: 'AI in production' },
    { icon: '🚀', text: 'Fast delivery' }
];

en.services.title = 'How I can help';
en.services.items = [
    { title: 'Enterprise AI assistant', description: 'Knowledge Q&A, workflow automation, private deploy', technologies: ['RAG', 'Agent'], badge: 'Enterprise', icon: '🤖' },
    { title: 'Document knowledge base', description: 'Report ingest, search tuning, quality evaluation', technologies: ['Vector DB', 'Rerank'], badge: 'Knowledge', icon: '📈' },
    { title: 'Document processing', description: 'PDF parsing, OCR, watermark removal, batch structure', technologies: ['PDF', 'OCR'], badge: 'Docs', icon: '📄' },
    { title: 'Bots & office automation', description: 'Telegram/Lark bots, email forwarding, scheduled jobs', technologies: ['Bot', 'Lark'], badge: 'Automation', icon: '📱' },
    { title: 'Technical advisor', description: 'Architecture review, performance tuning, hard problems', technologies: ['Architecture', 'Code review'], badge: 'Advisor', icon: '📚' }
];
en.services.partners.title = 'Good partners look like';
en.services.partners.types = [
    { icon: '🚀', type: 'Startups', description: 'From MVP to product — need backend or AI help' },
    { icon: '🏢', type: 'Enterprises', description: 'Want knowledge bases, AI Q&A, or AI integration' },
    { icon: '👥', type: 'Tech partners', description: 'Build AI products with real business value together' }
];
en.services.partners.note = 'Happy to talk <strong>project work</strong> or <strong>ongoing advisory</strong> — 30 minutes to align first 💬';

en.projects.innovation.title = 'How I think';
en.projects.innovation.text = 'AI only matters if it runs in production — observable, rollback-friendly, maintainable. Solid engineering turns models into systems your business actually uses.';

Object.assign(en.contact.intro, {
    title: 'Got an idea? Let us talk execution',
    description: 'AI assistants, knowledge bases, document AI, bots — all fair game. I will be straight about what is feasible and how.'
});
Object.assign(en.contact.form, {
    title: 'Leave a message',
    subtitle: 'Drop your contact info and I will reply soon',
    fields: {
        name: { label: 'Your name', placeholder: 'How to address you' },
        contact: { label: 'Contact', placeholder: 'WeChat / email / phone' },
        topic: { label: 'Topic', placeholder: 'What you want to discuss…' },
        message: { label: 'Details', placeholder: 'Briefly describe your scenario and needs so I can reply usefully…' }
    },
    submit: 'Send',
    submitting: 'Sending…',
    success: 'Got it — I will reply soon',
    error: 'Send failed — try again later or contact me directly'
});
en.contact.availability.labels = {
    usuallyWithin: 'Weekdays usually within',
    response: 'to reply',
    timezoneLabel: 'Timezone'
};

fs.writeFileSync(
    path.join(root, 'assets/data/homeConfig.plain-en.json'),
    JSON.stringify(en, null, 2) + '\n'
);
console.log('Generated assets/data/homeConfig.plain-en.json');
