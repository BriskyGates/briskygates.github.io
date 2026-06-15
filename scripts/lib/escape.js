'use strict';

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function stripHtml(value) {
    return String(value).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

module.exports = { escapeHtml, stripHtml };
