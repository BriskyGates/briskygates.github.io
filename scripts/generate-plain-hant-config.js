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

const plain = JSON.parse(fs.readFileSync(path.join(root, 'assets/data/homeConfig.plain.json'), 'utf8'));
const plainHant = convertValue(plain);

plainHant.ui.languageToggle = {
    tooltip: '選語言'
};

fs.writeFileSync(
    path.join(root, 'assets/data/homeConfig.plain-Hant.json'),
    JSON.stringify(plainHant, null, 2) + '\n'
);
console.log('Generated assets/data/homeConfig.plain-Hant.json');
