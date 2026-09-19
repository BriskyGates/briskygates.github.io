const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const mainSrc = fs.readFileSync(path.join(ROOT, 'assets/js/main.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

// ── 从 main.js 源码里把三个图标方法抠出来（按唯一签名定位 + 花括号配平）────────────
function grabMethod(signature) {
    const re = new RegExp(`\\n(\\s*)${signature.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`);
    const m = mainSrc.match(re);
    assert.ok(m, `main.js 里找不到方法定义：${signature}`);
    const open = mainSrc.indexOf('{', m.index);
    let depth = 0;
    for (let i = open; i < mainSrc.length; i++) {
        if (mainSrc[i] === '{') depth++;
        else if (mainSrc[i] === '}') {
            depth--;
            if (depth === 0) return mainSrc.slice(m.index + m[1].length, i + 1) + ',';
        }
    }
    throw new Error(`方法 ${signature} 花括号不配平`);
}

const methods = [
    grabMethod('getNavIcon(id)'),
    grabMethod('getTechIcon(idOrKey, context)'),
    grabMethod("getBrandAvatar(size = 'md')")
].join('\n');

const fns = new Function(`return ({${methods}})`).call();
const fakeThis = { config: { profile: { avatar: '🐶', name: '阿布' } } };
Object.keys(fns).forEach((k) => { fns[k] = fns[k].bind(fakeThis); });

// ── 6 个语言配置 ──────────────────────────────────────────────────────────
const CONFIGS = fs.readdirSync(path.join(ROOT, 'assets/data'))
    .filter((f) => /^homeConfig.*\.json$/.test(f))
    .map((f) => ({ file: f, data: JSON.parse(fs.readFileSync(path.join(ROOT, 'assets/data', f), 'utf8')) }));

// ── 从 index.html 里读出真实的调用表达式，避免测试与模板各说各话 ────────────────
const TEMPLATE_CALLS = [...indexHtml.matchAll(/getTechIcon\(([^)]*)\)/g)]
    .map((m) => m[1])
    .filter((arg) => arg.includes(','))
    .map((arg) => {
        const idx = arg.lastIndexOf(',');
        return { expr: arg.slice(0, idx).trim(), ctx: arg.slice(idx + 1).trim().replace(/^'|'$/g, '') };
    });

const NAV_CALL = indexHtml.match(/getNavIcon\(([^)]*)\)/);

// context → 该 context 下要遍历的配置条目（与各 v-for 一一对应）
const ENTRIES = {
    'hero-flow': (c) => c.profile.heroFlowEntries || [],
    'flow-project': (c) => (c.businessFlows?.flows || []).flatMap((f) => (f.nodes || []).flatMap((n) => n.projects || [])),
    skill: (c) => c.skills?.items || [],
    service: (c) => c.services?.items || [],
    partner: (c) => c.services?.partners?.types || [],
    'contact-intro': (c) => [c.contact?.intro].filter(Boolean),
    'contact-avail': (c) => [c.contact?.availability].filter(Boolean),
    'contact-collab': (c) => [c.contact?.collaboration].filter(Boolean),
    'contact-type': (c) => c.contact?.collaboration?.types || [],
    philosophy: (c) => [c.projects?.innovation].filter(Boolean)
};

// 模板里各 v-for 的循环变量名不同（entry / p / skill / service / partner / type），
// 统一绑到当前条目上，这样测试读到的就是模板里那行表达式的真实取值。
const LOCAL_NAMES = ['entry', 'item', 'p', 'skill', 'service', 'partner', 'type', 'tag', 'node', 'flow'];
function resolve(expr, entry, config) {
    return new Function(...LOCAL_NAMES, 'config', `return (${expr});`)(
        ...LOCAL_NAMES.map(() => entry),
        config
    );
}

// 兜底分支现在也返回 <svg>，所以不能只看 "<svg" 开头 —— 必须把兜底标记本身排除掉，
// 否则「语义分支全失配、只拿到占位图标」这种最要命的情况会被误判为通过。
const FALLBACK_MARK = 'tech-icon--fallback';
function isRealIcon(out) {
    const s = String(out).trim();
    return s.startsWith('<svg') && !s.includes(FALLBACK_MARK);
}

test('index.html 里每个 getTechIcon 调用都传了跨语言稳定的键', () => {
    for (const { ctx } of TEMPLATE_CALLS) {
        assert.ok(ENTRIES[ctx], `模板里出现了测试未覆盖的 context：${ctx}`);
    }
});

for (const { file, data } of CONFIGS) {
    test(`${file}：全部图标调用点都渲染成 <svg>` , () => {
        const broken = [];

        const navKey = NAV_CALL ? NAV_CALL[1] : 'item.id';
        for (const item of data.ui?.nav || []) {
            const out = fns.getNavIcon(resolve(navKey, item, data));
            if (!isRealIcon(out)) broken.push(`[nav] ${item.label}`);
        }

        for (const { expr, ctx } of TEMPLATE_CALLS) {
            for (const entry of ENTRIES[ctx](data)) {
                const out = fns.getTechIcon(resolve(expr, entry, data), ctx);
                const label = entry.title || entry.type || entry.text || entry.label || entry.id;
                if (!isRealIcon(out)) broken.push(`[${ctx}] ${label}`);
            }
        }

        for (const size of ['sm', 'md', 'lg']) {
            if (!isRealIcon(fns.getBrandAvatar(size))) broken.push(`[avatar] ${size}`);
        }

        assert.deepEqual(broken, [], `以下图标掉成了文本：\n  ${broken.join('\n  ')}`);
    });
}

test('兜底分支不再输出裸文本', () => {
    assert.ok(
        !mainSrc.includes('tech-badge-dot'),
        'getTechIcon 的兜底分支又把 key 当文本返回了（tech-badge-dot 这个 class 在 CSS 里根本没有定义）'
    );
    assert.ok(
        !/return\s*`<span[^`]*\$\{k\}/.test(mainSrc),
        'getTechIcon 里出现了把 key 内插进文本节点的写法'
    );
});
