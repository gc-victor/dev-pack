const { realpathSync } = require('fs');
const { resolve } = require('path');

const appDirectory = `${realpathSync(process.cwd())}/`;
const resolveApp = relativePath =>
    relativePath ? resolve(appDirectory, relativePath || '') : appDirectory;

function log(...args) {
    // eslint-disable-next-line no-console
    console.log(...args);
}

function varDump(...args) {
    // eslint-disable-next-line no-console
    console.error(...args);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
}

const getExtension = pathname => pathname.split('.').pop();
const isJavaScript = pathname => /js|ts|tsx/.test(getExtension(pathname));
const isCSS = pathname => /css/.test(getExtension(pathname));

module.exports = {
    appDirectory,
    getExtension,
    isCSS,
    isJavaScript,
    log,
    resolveApp,
    varDump,
};
