const fs = require('fs');
const path = require('path');
const mfs = require('./memory-fs');
const { resolveApp } = require('./utils');
const {
    CONFIG_CSS_FILE,
    CONFIG_GLOBALS,
    CONFIG_HTML_BASENAME,
    CONFIG_INPUT,
    CONFIG_SOCKET_PORT,
} = require('./constants');
const { getConfigByKey } = require('./config');
const hmr = require('./hmr');

function transformHtml(content) {
    let getResult = '';

    this.toString = () => getResult;
    this.replace = ({
        before = false,
        elements = [],
        endOfBody,
        endOfHead,
        indentation = '    ',
        startOfHead,
    }) => {
        const search = {
            startOfHead: '<head>',
            endOfHead: '</head>',
            endOfBody: '</body>',
        };
        const position =
            (startOfHead && 'startOfHead') ||
            (endOfHead && 'endOfHead') ||
            (endOfBody && 'endOfBody');
        const searchPosition = search[position];

        getResult = elements.reduce(
            (acc, element) =>
                acc.replace(
                    searchPosition,
                    before
                        ? `${indentation}${element}\n${searchPosition}`
                        : `${searchPosition}\n${indentation}${element}`
                ),
            getResult || content
        );

        return this;
    };

    return this;
}

function cdnGlobals() {
    const globals = Object.keys(getConfigByKey(CONFIG_GLOBALS));

    return globals.map(key => {
        const global = getConfigByKey(CONFIG_GLOBALS)[key];

        return global.cdn ? `<script src="${global.cdn}"></script>` : '';
    });
}

function html(pathname) {
    let content = fs.readFileSync(resolveApp(pathname)).toString();
    const input = getConfigByKey(CONFIG_INPUT);
    const css = getConfigByKey(CONFIG_CSS_FILE);

    const cssFile = path.join(input, css);
    const hasCSSFile = fs.existsSync(cssFile);
    const bundle = 'bundle.js';
    const newContent = transformHtml(content)
        .replace({ startOfHead: true, elements: ['<base href="/">'] })
        .replace({
            endOfHead: true,
            elements: [
                hasCSSFile ? `<link id="dev-pack-css" rel="stylesheet" href="${css}" />` : '',
            ],
            before: true,
        })
        .replace({
            content,
            endOfHead: true,
            elements: cdnGlobals(),
            before: true,
        })
        .replace({
            content,
            endOfBody: true,
            elements: [bundle].map(src => `<script src="${src}"></script>`),
            before: true,
        })
        .replace({
            content,
            endOfBody: true,
            elements: [
                `<script>${hmr.replace('__PORT__', getConfigByKey(CONFIG_SOCKET_PORT))}</script>`,
            ],
            before: true,
        })
        .toString();

    if (hasCSSFile) {
        const css = fs.readFileSync(resolveApp(cssFile));

        mfs.writeFile(resolveApp(cssFile), css, err => {
            if (err) throw err;
        });
    }

    mfs.writeFile(
        resolveApp(path.join(input, getConfigByKey(CONFIG_HTML_BASENAME))),
        newContent,
        err => {
            if (err) throw err;
        }
    );
}

module.exports = {
    html,
};
