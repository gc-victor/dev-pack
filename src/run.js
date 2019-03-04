const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const chokidar = require('chokidar');
const querystring = require('query-string');
const mfs = require('./memory-fs');
const { getConfigByKey, setConfigVariables } = require('./config');
const { html } = require('./html');
const { createBundle, createModule } = require('./bundle');
const { register, server, write } = require('./server');
const {
    DEFAULT_CONFIG_FILE,
    DEFAULT_JS_FILE,
    DEFAULT_HTML_FILE,
    CONFIG_CSS_FILE,
    CONFIG_HTML_FILE,
    CONFIG_INPUT,
    CONFIG_JS_FILE,
    CONFIG_SERVER_PORT,
    CONFIG_SOCKET_PORT,
} = require('./constants');
const { log, resolveApp } = require('./utils');

require('dotenv').config({ path: resolveApp(DEFAULT_CONFIG_FILE) });

function run(options) {
    let config;

    try {
        config = fs.readFileSync(resolveApp(options.config || DEFAULT_CONFIG_FILE), 'utf8');
        config = JSON.parse(config);
    } catch (e) {
        config = {};
    }

    setConfigVariables({ ...config, ...options });

    const input = getConfigByKey(CONFIG_INPUT);
    const socketPort = getConfigByKey(CONFIG_SOCKET_PORT);
    const serverPort = getConfigByKey(CONFIG_SERVER_PORT);
    const css = getConfigByKey(CONFIG_CSS_FILE);
    const configHtmlFile = getConfigByKey(CONFIG_HTML_FILE);
    const htmlPathname =
        configHtmlFile === DEFAULT_HTML_FILE
            ? path.join(input, getConfigByKey(CONFIG_HTML_FILE))
            : configHtmlFile;
    const configJsFile = getConfigByKey(CONFIG_JS_FILE);
    const jsPathname =
        configJsFile === DEFAULT_JS_FILE
            ? path.join(input, getConfigByKey(CONFIG_JS_FILE))
            : configJsFile;

    mfs.mkdirpSync(resolveApp(input));

    createBundle(jsPathname);
    html(htmlPathname);

    const wss = new WebSocket.Server({ port: socketPort });
    const getExtension = pathname => pathname.split('.').pop();
    const isJavaScript = pathname => /js|ts|tsx/.test(getExtension(pathname));
    const isCSS = pathname => /css/.test(getExtension(pathname));

    wss.on('connection', function connection(ws) {
        log('WebSocket connection');
        ws.on('error', error => log(error));
        watch(ws);
    });

    function watch(ws) {
        chokidar
            .watch([
                `${input}/**/*.js`,
                `${input}/**/*.ts`,
                `${input}/**/*.tsx`,
                `${input}/**/*.css`,
                `${css}`,
            ])
            .on('change', function(pathname) {
                if (ws.readyState === 1) {
                    log('File changed: ' + pathname);
                    isJavaScript(pathname) && ws.send(pathname);
                    isCSS(pathname) && RegExp(`${css}`).test(pathname) && ws.send(pathname);
                }
            });
    }

    function updateJs(file, req, res) {
        write(createModule(file), 200, file)(req, res);
        log('Module updated!');
    }

    function updateCSS(file, req, res) {
        const cssFile = resolveApp(file);
        const css = fs.existsSync(cssFile) && fs.readFileSync(resolveApp(cssFile));

        write(css, 200, file)(req, res);
        log('Style updated!');
    }

    register('/hot-update', function(req, res) {
        const file = querystring.parse(req.url.replace('/hot-update', '')).path;

        isJavaScript(file) && updateJs(file, req, res);
        isCSS(file) && updateCSS(file, req, res);
    });

    server.listen(serverPort);
    server.on('request', () => {
        createBundle(jsPathname);
    });
    log(`Listening on http://localhost:${serverPort}`);
}

module.exports = {
    run,
};
