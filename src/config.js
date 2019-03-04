const path = require('path');
const {
    CONFIG_CSS_FILE,
    CONFIG_EXTERNALS,
    CONFIG_FILE,
    CONFIG_GLOBALS,
    CONFIG_HTML_BASENAME,
    CONFIG_HTML_FILE,
    CONFIG_INPUT,
    CONFIG_JS_FILE,
    CONFIG_PROXY,
    CONFIG_SERVER_PORT,
    CONFIG_SOCKET_PORT,
    CONFIG_WATCH,
    DEFAULT_CONFIG_FILE,
    DEFAULT_CSS_FILE,
    DEFAULT_HTML_FILE,
    DEFAULT_INPUT,
    DEFAULT_JS_FILE,
    DEFAULT_SERVER_PORT,
    DEFAULT_SOCKET_PORT,
    DEFAULT_WATCH,
} = require('./constants');

const config = {};

function getConfig() {
    return config;
}

function getConfigByKey(key) {
    return config[key];
}

function setConfigVariables(options) {
    const globals =
        typeof options.globals === 'string' ? JSON.parse(options.globals) : options.globals;

    config[CONFIG_CSS_FILE] = options.css || DEFAULT_CSS_FILE;
    config[CONFIG_EXTERNALS] = Array.isArray(options.externals)
        ? options.externals.join(',')
        : options.externals || '';
    config[CONFIG_FILE] = options.config || DEFAULT_CONFIG_FILE;
    config[CONFIG_GLOBALS] = globals || {};
    config[CONFIG_HTML_FILE] = options.html || DEFAULT_HTML_FILE;
    config[CONFIG_INPUT] = options.input || DEFAULT_INPUT;
    config[CONFIG_JS_FILE] = options.js || DEFAULT_JS_FILE;
    config[CONFIG_PROXY] = options.proxy;
    config[CONFIG_SERVER_PORT] = options.port || DEFAULT_SERVER_PORT;
    config[CONFIG_SOCKET_PORT] = options.socket || DEFAULT_SOCKET_PORT;
    config[CONFIG_WATCH] = options.watch || DEFAULT_WATCH;

    config[CONFIG_HTML_BASENAME] = path.basename(getConfigByKey(CONFIG_HTML_FILE));
}

module.exports = {
    getConfig,
    getConfigByKey,
    setConfigVariables,
};
