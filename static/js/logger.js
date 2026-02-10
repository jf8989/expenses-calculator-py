// static/js/logger.js
/**
 * Simple logger utility to prepend timestamps and group identifiers.
 */

function getTimestamp() {
    // Format: YYYY-MM-DD HH:MM:SS
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toLocaleTimeString('en-GB'); // HH:MM:SS
    return `${date} ${time}`;
    // Or just time: return now.toLocaleTimeString('en-GB');
}

export function log(group, ...args) {
    console.log(`[${getTimestamp()}] [${group}]`, ...args);
}

export function warn(group, ...args) {
    console.warn(`[${getTimestamp()}] [${group}]`, ...args);
}

export function error(group, ...args) {
    console.error(`[${getTimestamp()}] [${group}]`, ...args);
}