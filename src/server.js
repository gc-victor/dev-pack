// @see: https://gist.github.com/jeffrafter/353700
const path = require('path');
const http = require('http');
const mime = require('mime');
const httpProxy = require('http-proxy');
const { log, resolveApp } = require('./utils');
const mfs = require('./memory-fs');
const { CONFIG_HTML_BASENAME, CONFIG_INPUT, CONFIG_PROXY } = require('./constants');
const { getConfigByKey } = require('./config');

let handlers = {};

const proxy = httpProxy.createProxyServer({});

function createHandler(method) {
    return (req, res) => method.apply(this, [req, res]);
}

function createProxy(req, res) {
    proxy.web(req, res, { target: getConfigByKey(CONFIG_PROXY) });
}

function register(url, method) {
    handlers[url] = createHandler(method);
}

function route(url) {
    const cleanUrl = url.match(/([^?]+)(\?.*)?/)[1];
    const handler = handlers[cleanUrl];

    if (!handler) return fileResponse(url);

    return handler;
}

function write(content, code, pathname) {
    return function(req, res) {
        res.writeHead(code || 200, {
            'Content-Type': pathname
                ? mime.getType(pathname.replace(/\.ts|\.tsx/, '.js'))
                : 'text/plain',
        });
        res.write(content);
        res.end();
    };
}

function fileResponse(pathname) {
    const absolutePath =
        path.dirname(pathname) !== '/'
            ? resolveApp(pathname.replace(/^\//, ''))
            : resolveApp(`${getConfigByKey(CONFIG_INPUT)}${pathname}`);

    try {
        const content = mfs.readFileSync(absolutePath).toString();

        return createHandler(write(content, 200, absolutePath));
    } catch (e) {
        if (getConfigByKey(CONFIG_PROXY)) {
            return (req, res) => {
                return createProxy(req, res);
            };
        }

        const message = `Not file found: ${absolutePath}`;

        log(message);

        return createHandler(write(message, 404));
    }
}

register('/', function(req, res) {
    fileResponse(`/${getConfigByKey(CONFIG_HTML_BASENAME)}`)(req, res);
});

const server = http.createServer(function(req, res) {
    route(req.url)(req, res);
});

module.exports = {
    server,
    register,
    write,
};
