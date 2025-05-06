// static/js/logger.js
export function log(group, ...args) {
    const now = new Date();
    // HH:MM:SS format
    const time = now.toLocaleTimeString('en-GB');
    console.log(`[${time}] [${group}]`, ...args);
}

export function warn(group, ...args) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB');
    console.warn(`[${time}] [${group}]`, ...args);
}

export function error(group, ...args) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-GB');
    console.error(`[${time}] [${group}]`, ...args);
}