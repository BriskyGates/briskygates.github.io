'use strict';

const fs = require('node:fs');
const path = require('node:path');
const OpenCC = require('opencc-js');

const root = path.join(__dirname, '..');
const converter = OpenCC.Converter({ from: 'cn', to: 'tw' });

function convertValue(value) {
    if (typeof value === 'string') {
        return converter(value);
    }
    if (Array.isArray(value)) {
        return value.map(convertValue);
    }
    if (value && typeof value === 'object') {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
            out[key] = convertValue(nested);
        }
        return out;
    }
    return value;
}

const zh = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/homeConfig.json'), 'utf8'));
const hant = convertValue(zh);

hant.ui.languageToggle = {
    tooltip: '選擇語言'
};

fs.writeFileSync(
    path.join(root, 'assets/data/homeConfig.zh-Hant.json'),
    JSON.stringify(hant, null, 2) + '\n'
);
console.log('Generated assets/data/homeConfig.zh-Hant.json');
