'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const src = path.join(root, 'node_modules/vue/dist/vue.global.prod.js');
const destDir = path.join(root, 'assets/vendor');
const dest = path.join(destDir, 'vue.global.prod.js');

if (!fs.existsSync(src)) {
    console.warn('skip vendor-vue: run npm install first');
    process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Copied Vue → ${path.relative(root, dest)}`);
