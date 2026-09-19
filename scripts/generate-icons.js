'use strict';

/**
 * 品牌静态资源生成器
 *
 * 用 Playwright(Chromium) 把矢量源文件栅格化为站点需要的位图：
 *   - favicon.ico（16/32/48 多尺寸，PNG 载荷）
 *   - favicon-32.png / apple-touch-icon.png / icon-192.png / icon-512.png
 *   - og-cover.png（1200x630，IM / 社交平台分享缩略图）
 *
 * 依赖：assets/img/favicon.svg 为唯一矢量源，改设计只需改这个文件再跑一次。
 * 用法：npm run icons
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const root = path.join(__dirname, '..');
const imgDir = path.join(root, 'assets', 'img');
const faviconSvgPath = path.join(imgDir, 'favicon.svg');
const BRAND_GRADIENT = 'linear-gradient(135deg, #38bdf8 0%, #818cf8 55%, #c084fc 100%)';

/**
 * 读取矢量源，并剥掉根节点的固定尺寸。
 * 注意只动根 <svg> 标签：早前的写法用 /\\swidth="…"/ 全局首个匹配，
 * 一旦源文件根节点没写 width（响应式写法很常见），就会误删内部 rect 的 width → 底盘消失。
 */
function readFaviconSvg() {
    const raw = fs.readFileSync(faviconSvgPath, 'utf8');
    return raw.replace(/<svg\b[^>]*>/, (tag) => tag
        .replace(/\swidth="[^"]*"/, '')
        .replace(/\sheight="[^"]*"/, '')
        .replace('<svg', '<svg style="width:100%;height:100%;display:block"'));
}

/**
 * 全幅版（去圆角、去内描边）：iOS 添加到主屏 / Android PWA 会自己裁圆角，
 * 若图里已带圆角 + 透明边角，系统再裁一次就会露出黑角。
 */
function readFullBleedSvg() {
    return readFaviconSvg()
        .replace(/<rect width="64" height="64" rx="[\d.]+" fill="url\(#plate\)"\s*\/>/, '<rect width="64" height="64" fill="url(#plate)"/>')
        .replace(/\s*<rect x="1\.6"[^>]*\/>/, '');
}

async function renderSquare(page, svg, size) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(
        `<!DOCTYPE html><html><head><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}` +
        `svg{width:100vw;height:100vh;display:block}</style></head><body>${svg}</body></html>`
    );
    return page.screenshot({ omitBackground: true });
}

/** 组装 ICO 容器（每个尺寸直接放 PNG 载荷，Windows/浏览器均支持） */
function buildIco(entries) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(entries.length, 4);

    let offset = 6 + entries.length * 16;
    const directory = entries.map((entry) => {
        const item = Buffer.alloc(16);
        item.writeUInt8(entry.size >= 256 ? 0 : entry.size, 0);
        item.writeUInt8(entry.size >= 256 ? 0 : entry.size, 1);
        item.writeUInt8(0, 2);
        item.writeUInt8(0, 3);
        item.writeUInt16LE(1, 4);
        item.writeUInt16LE(32, 6);
        item.writeUInt32LE(entry.data.length, 8);
        item.writeUInt32LE(offset, 12);
        offset += entry.data.length;
        return item;
    });

    return Buffer.concat([header, ...directory, ...entries.map((entry) => entry.data)]);
}

function ogCoverHtml() {
    return `<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: #08090d;
    font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", system-ui, sans-serif;
    color: #f5f7fa; position: relative;
  }
  .glow { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .5; }
  .glow--a { width: 520px; height: 520px; left: -140px; top: -180px; background: #2563eb; }
  .glow--b { width: 460px; height: 460px; right: -120px; bottom: -200px; background: #7c3aed; }
  .glow--c { width: 360px; height: 360px; right: 300px; top: -160px; background: #0ea5e9; opacity: .3; }
  .grid {
    position: absolute; inset: 0; opacity: .16;
    background-image: linear-gradient(rgba(148,163,184,.28) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148,163,184,.28) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse at 34% 42%, #000 8%, transparent 76%);
    -webkit-mask-image: radial-gradient(ellipse at 34% 42%, #000 8%, transparent 76%);
  }
  .frame { position: absolute; inset: 18px; border-radius: 26px; border: 1px solid rgba(148,163,184,.18); }
  .cover {
    position: relative; height: 100%; display: flex; align-items: center;
    gap: 52px; padding: 0 84px 74px;
  }
  .emblem { width: 172px; height: 172px; flex: 0 0 auto; filter: drop-shadow(0 16px 38px rgba(56,189,248,.32)); }
  .emblem svg { width: 100%; height: 100%; display: block; }
  .text { padding-top: 6px; }
  .eyebrow {
    display: inline-flex; align-items: center; gap: 9px;
    font-size: 20px; letter-spacing: .14em; color: #7dd3fc; margin-bottom: 18px;
  }
  .eyebrow i { width: 9px; height: 9px; border-radius: 50%; background: #34d399; box-shadow: 0 0 12px #34d399; }
  h1 { font-size: 62px; font-weight: 700; line-height: 1.1; white-space: nowrap; }
  .gradient-text {
    background: ${BRAND_GRADIENT};
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .role { margin-top: 18px; font-size: 31px; font-weight: 600; color: #e8eaed; white-space: nowrap; }
  .desc { margin-top: 14px; font-size: 23px; color: #9aa4b6; white-space: nowrap; }
  .chips { margin-top: 26px; display: flex; gap: 11px; }
  .chip {
    font-size: 20px; padding: 9px 19px; border-radius: 999px; color: #cbd5e1; white-space: nowrap;
    border: 1px solid rgba(148,163,184,.32); background: rgba(148,163,184,.09);
  }
  .footer {
    position: absolute; left: 84px; right: 84px; bottom: 40px;
    padding-top: 20px; border-top: 1px solid rgba(148,163,184,.16);
    display: flex; align-items: center; justify-content: space-between;
    font-size: 21px; letter-spacing: .03em; color: #8b95a7;
  }
  .footer b { color: #a8b3c4; font-weight: 500; }
</style></head>
<body>
  <div class="glow glow--a"></div><div class="glow glow--b"></div><div class="glow glow--c"></div>
  <div class="grid"></div>
  <div class="frame"></div>
  <div class="cover">
    <div class="emblem">${readFaviconSvg()}</div>
    <div class="text">
      <div class="eyebrow"><i></i>上海 · 可接项目</div>
      <h1><span class="gradient-text">阿布</span> · 企业 AI 落地工程师</h1>
      <div class="role">把 RAG、Agent、文档智能做成可上生产的系统</div>
      <div class="desc">可部署 · 可评测 · 可运维 —— 不做只有 Demo 好看的 AI</div>
      <div class="chips">
        <span class="chip">企业 / 金融文档 RAG</span>
        <span class="chip">文档智能解析</span>
        <span class="chip">Bot / 飞书自动化</span>
      </div>
    </div>
  </div>
  <div class="footer"><span>个人官网 · 落地案例与能力履历</span><b>briskygates.github.io</b></div>
</body></html>`;
}

async function main() {
    const svg = readFaviconSvg();
    const svgFullBleed = readFullBleedSvg();
    const browser = await chromium.launch();
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const written = [];

    // 1. 方形图标（圆角版给浏览器标签页，全幅版交给系统自己裁圆角）
    const squares = [
        { name: 'favicon-32.png', size: 32, svg },
        { name: 'apple-touch-icon.png', size: 180, svg: svgFullBleed },
        { name: 'icon-192.png', size: 192, svg: svgFullBleed },
        { name: 'icon-512.png', size: 512, svg: svgFullBleed }
    ];
    const icoEntries = [];

    for (const target of squares) {
        const data = await renderSquare(page, target.svg, target.size);
        fs.writeFileSync(path.join(imgDir, target.name), data);
        written.push(target.name);
    }
    for (const size of [16, 32, 48]) {
        icoEntries.push({ size, data: await renderSquare(page, svg, size) });
    }

    // 2. favicon.ico 放站点根目录（IM / 浏览器默认抓取位置）
    const ico = buildIco(icoEntries);
    fs.writeFileSync(path.join(root, 'favicon.ico'), ico);
    written.push('favicon.ico');

    // 3. 社交分享封面
    await page.setViewportSize({ width: 1200, height: 630 });
    await page.setContent(ogCoverHtml(), { waitUntil: 'load' });
    const og = await page.screenshot();
    fs.writeFileSync(path.join(imgDir, 'og-cover.png'), og);
    written.push('og-cover.png');

    await browser.close();
    console.log(`生成完成（${written.length} 个文件）：`);
    written.forEach((name) => console.log(`  - ${name}`));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
