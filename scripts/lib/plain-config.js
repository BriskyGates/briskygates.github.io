'use strict';

const fs = require('node:fs');
const path = require('node:path');

// Keep business-facing copy in JSON; arrays replace the technical version's lists.
function mergeConfig(base, override) {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
        result[key] = value && typeof value === 'object' && !Array.isArray(value)
            ? mergeConfig(base?.[key] || {}, value)
            : value;
    }
    return result;
}

function generatePlainConfig(baseName, variant) {
    const dataDir = path.join(__dirname, '../../assets/data');
    const read = name => JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
    const config = mergeConfig(read(baseName), read(`overrides/${variant}.json`));
    fs.writeFileSync(path.join(dataDir, `homeConfig.${variant}.json`), JSON.stringify(config, null, 2) + '\n');
    console.log(`Generated assets/data/homeConfig.${variant}.json`);
}

module.exports = { generatePlainConfig };
