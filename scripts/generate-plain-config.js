'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const zh = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/homeConfig.json'), 'utf8'));

Object.assign(zh.ui, {
    pageTitle: '阿布 · 帮企业把 AI 真正用起来',
    pageDescription: '把知识库、文档处理、智能助手做成能上线、能维护的系统',
    searchPlaceholder: '搜项目、技能、怎么合作…',
    heroCtaPrimary: '发我你的知识库现状',
    heroCtaSecondary: '看 3 个落地案例',
    contactMethodsTitle: '怎么联系',
    languageToggle: { tooltip: '选语言' },
    toast: {
        wechatCopied: '微信号已复制',
        xianyuCopied: '店铺名已复制',
        imCopied: '账号已复制'
    },
    projectStatus: {
        production: '已上线',
        active: '在维护',
        testing: '测试中',
        development: '开发中',
        planned: '计划中',
        highlightsLabel: '我做了什么',
        progressLabel: '进度'
    },
    greetings: {
        morning: '早上好',
        afternoon: '下午好',
        evening: '晚上好',
        night: '夜深了还在忙？'
    }
});

zh.ui.nav = [
    { id: 'home', label: '首页', shortLabel: '首页', icon: 'fas fa-house' },
    { id: 'showcase', label: '代表作', shortLabel: '作品', icon: 'fas fa-fire' },
    { id: 'projects', label: '项目', shortLabel: '项目', icon: 'fas fa-layer-group' },
    { id: 'experience', label: '经历', shortLabel: '经历', icon: 'fas fa-route' },
    { id: 'skills', label: '技能', shortLabel: '技能', icon: 'fas fa-bolt' },
    { id: 'services', label: '服务', shortLabel: '服务', icon: 'fas fa-briefcase' },
    { id: 'contact', label: '联系', shortLabel: '联系', icon: 'fas fa-envelope' }
];

Object.assign(zh.profile, {
    tagline: '上海 · 可远程',
    status: '可接活',
    heroTitle: '帮企业把 AI 真正用起来，不只是做演示',
    title: '关于我',
    greeting: {
        text: '你好，我是阿布，在上海',
        description:
            '我是<strong>企业 AI 落地工程师</strong>：帮团队把知识库问答、文档处理、智能助手做成<strong>能部署、能评测、能维护</strong>的系统。<br>如果你卡在「搜不准、解析炸、助手上不了线」，可以把现状发我。'
    },
    heroChips: ['企业知识库', '金融文档 RAG', '文档处理', '助手上生产', '机器人自动化'],
    roles: [
        {
            label: '一句话',
            value: '找能把知识库 / 助手 / 文档智能真正做成线上系统的人，就找阿布',
            type: 'primary'
        },
        {
            label: '适合谁',
            value: '技术负责人 · 业务负责人 · 创业公司 CTO',
            type: 'secondary'
        }
    ],
    stats: [
        { number: '6+', label: '年经验' },
        { number: '80+', label: '项目' },
        { number: '15+', label: 'AI 项目' },
        { number: '全栈', label: '一条龙' }
    ]
});

zh.featured.title = '落地案例';
zh.featured.subtitle = '用买方听得懂的话说清楚：解决什么问题、我做了什么';

const featuredMap = {
    fastapi_celery_kb: {
        title: '研报公告一堆，知识库还老引用错段落',
        subtitle: '金融知识库 · 切块 · 重排',
        description:
            '文档已经入库了，问答还是答非所问。先把解析和切块修好，再加上时效/来源排序，而不是先换更大模型。',
        highlights: ['重建解析和语义切块，异步入库', '加上时效和权威重排，并留下评测日志', 'Docker 部署，方便交接和回滚']
    },
    doc_intelligence: {
        title: '扫描件和乱版面，把整个知识库项目拖进泥潭',
        subtitle: 'PDF / OCR / 目录 / 去水印',
        description:
            '扫描件、表格、水印、目录缺失是常见坑。目标是把脏文档变成能检索的干净结构；能用规则稳住就先用规则。',
        highlights: ['PDF 结构解析和表格识别', '去水印提升 OCR，目录提取多级兜底', '做成高并发解析接口给下游用']
    },
    group_management_bot: {
        title: '群一大，风控/担保/客服靠人顶不住',
        subtitle: '社群机器人 · 担保对账',
        description:
            '商业社群扩起来后，验证、防骗、担保交易和客服靠人工撑不住。重点做稳、能对账、能监控。',
        highlights: ['入群验证、反垃圾、风控自动化', '担保交易和财务对账', '运营后台 + 工单客服闭环']
    }
};

zh.featured.items.forEach(item => {
    const m = featuredMap[item.id];
    if (m) Object.assign(item, m);
});

const rowTitles = {
    'enterprise-ai': { title: '企业 AI 应用', description: '把 AI 做成真正能上线的业务系统（详见上面 3 个案例）' },
    'rag-knowledge': { title: '知识库 & 搜索', description: '文档进来 → 切块 → 搜得到 → 答得准' },
    'doc-intelligence': { title: '文档处理', description: '扫描件、乱版面、水印、目录——知识库上游的脏活' },
    'agent-mcp': { title: '智能助手 & 自动化', description: 'AI 能自己规划步骤、调用工具完成任务' },
    'tg-mobile': { title: '机器人和 IM 应用', description: '社群机器人、搜索、桌面小工具' },
    'platform-auto': { title: '后台和运维', description: '监控、调度、数据同步这些基础设施' }
};
zh.projectShowcase.rows.forEach(row => {
    const t = rowTitles[row.id];
    if (t) Object.assign(row, t);
});

const projectMap = {
    multi_llm_analysis: { title: 'AI 教育题目解析', subtitle: '8 种题型', description: '不同题型走不同 AI，解答完还会复查。' },
    rerank_system: { title: '搜索结果重排序', subtitle: '让问答更准', description: '搜出来的资料再排个序，引用更靠谱。' },
    report_recall: { title: '研报图文一起搜', subtitle: '图和字都能找', description: 'PDF 里的图表和文字分别存，问的时候都能搜到。' },
    etf_unusual: { title: 'ETF 异动提醒', subtitle: '行情监控', description: '盯盘发现异常就推送，辅助投研决策。' },
    temp_ner: { title: '金融实体识别', subtitle: '认公司、认时间', description: '从研报里自动提取公司名、时间等关键信息。' },
    fastapi_celery_kb: { title: '文档批量入库', subtitle: '异步处理', description: '大量文档排队处理，自动切块和向量化。' },
    multi_source_chunk: { title: '各种格式文档切块', subtitle: '统一管线', description: '不同来源的文档用同一套流程切块入库。' },
    qwen3_pg_recall: { title: '向量搜索服务', subtitle: 'PostgreSQL', description: '用向量数据库做语义搜索，找相似内容。' },
    enterprise_chat_openapi: { title: '企业问答 API', subtitle: '开箱即用', description: '封装好搜索+问答，别的系统直接调接口。' },
    announcement_tagging: { title: '公告自动打标签', subtitle: '分类整理', description: '海量公告自动分类打标，方便下游使用。' },
    pdf2xml: { title: 'PDF 结构化解析', subtitle: '提取文字表格', description: '把 PDF 拆成干净的结构化数据，给后续流程用。' },
    pdf_chunker: { title: '研报智能切块', subtitle: '保留逻辑', description: '按段落和表格智能切分，不丢上下文。' },
    pdf_watermark: { title: 'PDF 去水印', subtitle: '批量处理', description: '研报批量去水印，后面 OCR 更准。' },
    paddle_ocr_vl: { title: '图片 OCR 服务', subtitle: '上传即解析', description: '扫描件、复杂图片上传就能提取文字结构。' },
    extract_pdf_toc: { title: 'PDF 目录提取', subtitle: '多级兜底', description: '尽量把研报目录结构还原出来。' },
    gpu_rapid_layout: { title: '版面元素检测', subtitle: 'GPU 加速', description: '快速识别文档里的图、表、段落位置。' },
    phone_autoglm: { title: '手机群控平台', subtitle: '云手机', description: '网页管多台手机，API 下发任务查进度。' },
    dynamic_mcp: { title: 'AI 写代码调工具', subtitle: '沙箱执行', description: 'AI 在隔离环境里写代码、调工具，更灵活。' },
    mcp_json_rpc: { title: '多工具编排', subtitle: '自动串联', description: '你说一句话，AI 自动规划调哪些工具、什么顺序。' },
    ai_mcp_middleware: { title: 'AI 能力统一网关', subtitle: '集中管理', description: '各业务系统通过统一入口调 AI，好管好用。' },
    multi_agent_collab: { title: '多个 AI 协作', subtitle: '分工干活', description: '复杂任务拆给多个 AI 角色，自动配合完成。' },
    group_management_bot: { title: '社群运营机器人', subtitle: '管群变现', description: '管群、担保交易、客服，私域变现一条龙。' },
    need_radar_bot: { title: '商机挖掘雷达', subtitle: '听群找单', description: '监听群消息，AI 找买卖需求并推送。' },
    tg_ai_search: { title: '群聊历史搜索', subtitle: '全文+语义', description: '在大量聊天记录里快速找到有用信息。' },
    smart_clipboard: { title: 'AI 剪贴板', subtitle: 'Windows 桌面', description: '复制内容时 AI 自动帮你改写、整理。' },
    onchain_token_monitor: { title: '链上交易监控', subtitle: '实时推送', description: '盯链上交易，异常就推到 IM。' },
    cc_monitor_gmail: { title: '邮件自动转发', subtitle: '邮件→IM', description: '重要邮件自动提取内容发到聊天工具。' },
    lark_sync: { title: '飞书数据同步', subtitle: '表格对接', description: '飞书表格和后端系统双向同步，少手工对账。' },
    email_auto_crawl: { title: '邮箱研报自动采集', subtitle: 'RPA', description: '自动收邮件附件、提取表格数据入库。' }
};

zh.projectShowcase.rows.forEach(row => {
    row.items.forEach(item => {
        const m = projectMap[item.id];
        if (m) Object.assign(item, m);
    });
});

zh.experience.title = '做过什么';
zh.experience.subtitle = '这些年主要在「能上线」这条线上干活';
zh.experience.items = [
    {
        period: '2024 — 至今',
        title: '企业 AI 系统',
        description: '帮企业做智能助手、知识库问答、多模态应用，从试做到正式上线都做过，强调能监控、能回滚。',
        tags: ['智能助手', '知识库', '可观测']
    },
    {
        period: '2022 — 2024',
        title: '文档处理',
        description: '处理百万级金融 PDF：复杂排版、OCR、切块，给 AI 准备干净数据。',
        tags: ['PDF', 'OCR']
    },
    {
        period: '2020 — 至今',
        title: '机器人和后台',
        description: '高并发的社群机器人和监控系统，交易和客服流程要稳。',
        tags: ['机器人', '飞书', 'Redis']
    },
    {
        period: '持续',
        title: 'AI 工具链',
        description: '研究 AI 调工具、写代码、查数据库，让流程可审计、可复现。',
        tags: ['MCP', 'Agent']
    }
];

zh.skills.title = '会什么';
zh.skills.motto = '不光会调大模型，<strong>更会把 AI 嵌进现有系统</strong>，做得稳、扩得开、能交接。';
zh.skills.items = [
    {
        title: 'AI 应用',
        description: '知识库问答 / 助手上生产 / 模型服务化 / 多智能体 / 工具调用',
        tags: ['RAG', 'Agent', 'MCP'],
        icon: '🤖'
    },
    {
        title: '金融文本 & 知识库',
        description: '研报公告切块、搜索排序、图表检索、资讯分类',
        tags: ['向量库', 'Rerank', '研报'],
        icon: '📊'
    },
    {
        title: '文档处理',
        description: 'PDF 解析 / OCR / 去水印 / 表格识别 / 目录还原',
        tags: ['PDF', 'OCR'],
        icon: '📄'
    },
    {
        title: '集成 & 自动化',
        description: '社群机器人 / 飞书 / 邮件自动化 / 任务队列',
        tags: ['Bot', '飞书'],
        icon: '⚡'
    }
];
zh.skills.summary = [
    { icon: '🏗️', text: '全栈' },
    { icon: '🧠', text: 'AI 落地' },
    { icon: '🚀', text: '快速交付' }
];

zh.services.title = '怎么合作';
zh.services.items = [
    {
        title: '15 分钟先聊清楚',
        description: '先看问题是不是匹配；你把场景说清，我口头给建议，不写长方案。',
        technologies: ['澄清', '匹配'],
        badge: '免费 · 限时',
        icon: '💬'
    },
    {
        title: '知识库 / AI 落地诊断',
        description: '访谈现状、画架构草图、列风险和优先级。先把坑标出来，再决定要不要上大项目。',
        technologies: ['诊断纪要', '路线图'],
        badge: '诊断包',
        icon: '🩺'
    },
    {
        title: '技术顾问',
        description: '架构评审、关键决策、Code Review、疑难排障。适合已有团队、缺「做过线上」的人盯方向。',
        technologies: ['架构', 'Code Review'],
        badge: '按月顾问',
        icon: '📚'
    },
    {
        title: '模块交付',
        description: '固定范围：文档解析、召回重排、问答网关、机器人自动化等，带验收和交接。',
        technologies: ['解析', 'Rerank', '网关', 'Bot'],
        badge: '可报价模块',
        icon: '📦'
    },
    {
        title: '完整项目',
        description: '从调研到上线交接一条龙。按里程碑付款；档期满了会直说。',
        technologies: ['RAG', 'Agent', 'FastAPI'],
        badge: '端到端',
        icon: '🚀'
    }
];
zh.services.partners.title = '这样的伙伴最合适';
zh.services.partners.types = [
    {
        icon: '🏗️',
        type: '技术负责人',
        description: 'Demo 好看上不了线、知识库不准、链路没法监控'
    },
    {
        icon: '🏢',
        type: '业务负责人',
        description: '文档多、人工贵、流程断——需要知识库或机器人'
    },
    {
        icon: '🚀',
        type: '创业公司 CTO',
        description: '要快、要稳，缺人顶核心模块'
    }
];
zh.services.partners.note =
    '不做纯 PPT 包装，也不接「三天万能助手」表演项目。欢迎先<strong>发知识库/文档现状</strong>，再约 15 分钟聊 💬';

zh.projects.innovation.title = '我的理念';
zh.projects.innovation.text =
    'AI 的价值在于真能用——能监控、能回滚、好维护。我不卖概念，我交付业务里在跑的系统。';

Object.assign(zh.contact.intro, {
    title: '把你的知识库 / 助手现状发我',
    description: '搜不准、解析炸、助手上不了线都可以聊。我会实话实说能不能做，并建议走诊断、顾问还是模块交付。'
});
zh.contact.collaboration.types = [
    { icon: '🩺', text: '诊断包' },
    { icon: '📚', text: '技术顾问' },
    { icon: '📦', text: '模块交付' },
    { icon: '🚀', text: '完整项目' }
];
Object.assign(zh.contact.form, {
    title: '开始合作',
    subtitle: '发我现状就行；工作日一般 2–4 小时内回复',
    fields: {
        name: { label: '怎么称呼', placeholder: '你的名字' },
        contact: { label: '联系方式', placeholder: '微信 / 邮箱 / 手机' },
        topic: { label: '想聊什么', placeholder: '知识库不准 / 文档解析 / 助手上线 / 顾问…' },
        message: {
            label: '现状简述',
            placeholder: '已有什么（文档量、是否入库、卡在哪）、目标与时间…'
        }
    },
    submit: '发我现状',
    submitting: '发送中…',
    success: '收到了！我会尽快回复并建议下一步',
    error: '发送失败，请稍后重试或直接联系我'
});
zh.contact.availability.labels = {
    usuallyWithin: '工作日一般',
    response: '内回复',
    timezoneLabel: '时区'
};
zh.contact.footer.highlights = ['工程优先', '结果可验收', '范围先谈清'];

fs.writeFileSync(path.join(root, 'assets/data/homeConfig.plain.json'), JSON.stringify(zh, null, 2) + '\n');
console.log('Generated assets/data/homeConfig.plain.json');
