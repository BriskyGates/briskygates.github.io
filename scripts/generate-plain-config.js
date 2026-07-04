'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const zh = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/homeConfig.json'), 'utf8'));

Object.assign(zh.ui, {
    pageTitle: '阿布 · 帮人做 AI 系统',
    pageDescription: '写 Python，把 AI 做出来、部署好、真能用',
    searchPlaceholder: '搜项目、技能、怎么合作…',
    heroCtaPrimary: '看代表作',
    heroCtaSecondary: '看能做什么',
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
        highlightsLabel: '亮点',
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
    tagline: '上海 · 在线',
    status: '可接活',
    heroTitle: '帮企业把 AI 真正用起来，不只是做演示',
    title: '关于我',
    greeting: {
        text: '你好，我是阿布，在上海',
        description: '我是 <strong>AI 全栈工程师</strong>，简单说就是：帮企业把大模型做成能跑、能维护的系统。<br>擅长知识库问答、智能助手、文档处理、机器人这些方向。'
    },
    heroChips: ['AI 落地', '知识库问答', '智能助手', '文档处理', '自动化'],
    roles: [
        { label: '我能做什么', value: '从想法到上线：聊需求 → 搭架构 → 写代码 → 部署运维', type: 'primary' },
        { label: '适合谁', value: '企业、创业团队、有 AI 需求但缺技术的人', type: 'secondary' }
    ],
    stats: [
        { number: '6+', label: '年经验' },
        { number: '80+', label: '项目' },
        { number: '15+', label: 'AI 项目' },
        { number: '全栈', label: '一条龙' }
    ]
});

zh.featured.title = '精选作品';
zh.featured.subtitle = '挑了几个最能代表我能力的项目';

const featuredMap = {
    multi_llm_analysis: {
        title: 'AI 自动批改作业/解析题目',
        subtitle: '多种题型 · 自动检查',
        description: '教培场景用的：不同题型自动选合适的 AI 来解答，还会复查一遍，减少错题。',
        highlights: ['8 种题型自动识别', '解答和评分分开做，更靠谱', '多轮检查，复杂题也能搞定']
    },
    group_management_bot: {
        title: '社群管理 + 担保交易机器人',
        subtitle: '管群 · 收钱 · 分账',
        description: '大群用的 Telegram 机器人：自动管群、防骗子、担保交易、客服工单，一套搞定。',
        highlights: ['入群验证、反垃圾、风控', '担保交易和财务对账', '运营后台一目了然']
    },
    fastapi_celery_kb: {
        title: '金融文档知识库流水线',
        subtitle: '大量文档 · 自动入库',
        description: '把研报、公告等长文档自动拆开、转成向量、存进知识库，给 AI 问答当资料库。',
        highlights: ['研报公告自动切块', '多台机器并行处理', 'Docker 一键部署']
    },
    rerank_system: {
        title: '搜索答案更准的排序器',
        subtitle: '让 AI 引用对的资料',
        description: '知识库搜出来一堆结果后，再智能排序，把最相关、最新的排前面，AI 回答更准。',
        highlights: ['多种排序策略可选', '考虑时效和来源可信度', '有日志可查搜得好不好']
    },
    phone_autoglm: {
        title: '手机批量自动操作',
        subtitle: '看屏幕 · 自动点',
        description: 'AI 能「看」手机屏幕，按你说的去点、去操作，多台手机一起跑，省人工重复劳动。',
        highlights: ['看屏幕做复杂操作', '网页控制台管任务', '提供 API 接入业务流程']
    },
    need_radar_bot: {
        title: '自动挖商机的机器人',
        subtitle: '听群聊 · 找需求',
        description: '24 小时盯着群消息，用 AI 判断谁在找货、谁在出货，自动匹配推送商机。',
        highlights: ['AI 理解买卖意图', '增量抓取 + 推送', '后台管理全部线索']
    }
};

zh.featured.items.forEach(item => {
    const m = featuredMap[item.id];
    if (m) Object.assign(item, m);
});

const rowTitles = {
    'enterprise-ai': { title: '企业 AI 应用', description: '把 AI 做成真正能用的业务系统' },
    'rag-knowledge': { title: '知识库 & 搜索', description: '文档进来 → 切块 → 搜得到 → 答得准' },
    'doc-intelligence': { title: '文档处理', description: 'PDF、扫描件、复杂排版都能结构化提取' },
    'agent-mcp': { title: '智能助手 & 自动化', description: 'AI 能自己规划步骤、调用工具完成任务' },
    'tg-mobile': { title: '机器人和 IM 应用', description: 'Telegram 机器人、搜索、桌面小工具' },
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
zh.experience.subtitle = '这几年主要在这些方向干活';
zh.experience.items = [
    { period: '2024 — 至今', title: '企业 AI 系统', description: '帮企业做智能助手、知识库问答、多模态应用，从 demo 到正式上线都做过。', tags: ['智能助手', '知识库', '手机自动化'] },
    { period: '2022 — 2024', title: '文档处理', description: '处理百万级金融 PDF：复杂排版、OCR、切块，给 AI 准备干净数据。', tags: ['PDF', 'OCR'] },
    { period: '2020 — 至今', title: '机器人和后台', description: '高并发的 Telegram 机器人和监控系统，交易流程要稳。', tags: ['机器人', '飞书', 'Redis'] },
    { period: '持续', title: 'AI 工具链', description: '研究 AI 调工具、写代码、查数据库，让流程可审计、可复现。', tags: ['MCP', 'Agent'] }
];

zh.skills.title = '会什么';
zh.skills.motto = '不光会调大模型，<strong>更会把 AI 嵌进现有系统</strong>，做得稳、扩得开。';
zh.skills.items = [
    { title: 'AI 应用', description: '知识库问答 / 手机自动化 / 模型部署 / 多智能体 / 工具调用', tags: ['RAG', 'Agent', 'MCP'], icon: '🤖' },
    { title: '金融文本 & 知识库', description: '研报公告切块、搜索排序、图表检索、资讯分类', tags: ['向量库', '研报'], icon: '📊' },
    { title: '文档处理', description: 'PDF 解析 / OCR / 去水印 / 表格识别', tags: ['PDF', 'OCR'], icon: '📄' },
    { title: '集成 & 自动化', description: 'Telegram 机器人 / 飞书 / 邮件自动化 / 任务队列', tags: ['Bot', '飞书'], icon: '⚡' }
];
zh.skills.summary = [
    { icon: '🏗️', text: '全栈' },
    { icon: '🧠', text: 'AI 落地' },
    { icon: '🚀', text: '快速交付' }
];

zh.services.title = '能帮你做什么';
zh.services.items = [
    { title: '企业 AI 助手', description: '知识库问答、工作流自动化、私有化部署', technologies: ['RAG', 'Agent'], badge: '企业', icon: '🤖' },
    { title: '文档知识库', description: '研报公告入库、搜索优化、效果评测', technologies: ['向量库', 'Rerank'], badge: '知识库', icon: '📈' },
    { title: '文档处理', description: 'PDF 解析、OCR、去水印、批量结构化', technologies: ['PDF', 'OCR'], badge: '文档', icon: '📄' },
    { title: '机器人和办公自动化', description: 'Telegram/飞书机器人、邮件转发、定时任务', technologies: ['Bot', '飞书'], badge: '自动化', icon: '📱' },
    { title: '技术顾问', description: '架构评审、性能优化、疑难问题', technologies: ['架构', 'Code Review'], badge: '顾问', icon: '📚' }
];
zh.services.partners.title = '适合这样的伙伴';
zh.services.partners.types = [
    { icon: '🚀', type: '创业团队', description: '从 MVP 到产品化，缺后端或 AI 可以找我补' },
    { icon: '🏢', type: '企业', description: '想做知识库、智能问答、AI 集成' },
    { icon: '👥', type: '技术合伙人', description: '一起打磨有商业价值的 AI 产品' }
];
zh.services.partners.note = '欢迎<strong>项目合作</strong>或<strong>长期顾问</strong>，先聊 30 分钟对齐需求 💬';

zh.projects.innovation.title = '我的理念';
zh.projects.innovation.text = 'AI 的价值在于真能用——能监控、能回滚、好维护。用扎实的工程能力，把模型变成业务里在跑的系统。';

Object.assign(zh.contact.intro, {
    title: '有想法？聊聊怎么落地',
    description: '智能助手、知识库、文档处理、机器人都可以聊。我会实话实说能不能做、怎么做。'
});
Object.assign(zh.contact.form, {
    title: '留言',
    subtitle: '留下联系方式，我会尽快回复',
    fields: {
        name: { label: '怎么称呼', placeholder: '你的名字' },
        contact: { label: '联系方式', placeholder: '微信 / 邮箱 / 手机' },
        topic: { label: '想聊什么', placeholder: '合作方向 / 项目需求…' },
        message: { label: '详细说说', placeholder: '简单描述场景和需求，我好针对性回复…' }
    },
    submit: '发送',
    submitting: '发送中…',
    success: '收到了！我会尽快回复',
    error: '发送失败，请稍后重试或直接联系我'
});
zh.contact.availability.labels = {
    usuallyWithin: '工作日一般',
    response: '内回复',
    timezoneLabel: '时区'
};

fs.writeFileSync(
    path.join(root, 'assets/data/homeConfig.plain.json'),
    JSON.stringify(zh, null, 2) + '\n'
);
console.log('Generated assets/data/homeConfig.plain.json');
