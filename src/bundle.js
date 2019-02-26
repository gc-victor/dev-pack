const fs = require('fs');
const path = require('path');
const resolve = require('resolve');
const srcURL = require('source-map-url');
const traverse = require('@babel/traverse').default;
const { parse } = require('@babel/parser');
const { SourceListMap } = require('source-list-map');
const { transform } = require('sucrase');
const mfs = require('./memory-fs');
const prelude = require('./prelude');
const { resolveApp } = require('./utils');
const { getConfigByKey } = require('./config');
const { CONFIG_EXTERNALS, CONFIG_GLOBALS, CONFIG_INPUT } = require('./constants');

function createAsset(absolutePath) {
    let compiledCode = {};

    const relativePath = absolutePath.replace(resolveApp(), '');
    const content = fs
        .readFileSync(resolveApp(absolutePath), 'utf-8')
        // TODO: Add in the option to define env variables
        .replace(/process\.env\.NODE_ENV/g, process.env.NODE_ENV);
    const hasSrcMapUrl = srcURL.existsIn(content);
    const dependencies = [];

    if (!hasSrcMapUrl) {
        const ast = parse(content, {
            allowImportExportEverywhere: true,
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
        });

        // @see: https://github.com/egoist/konan
        traverse(ast, {
            enter(path) {
                if (path.node.type === 'CallExpression') {
                    const callee = path.get('callee');
                    const isDynamicImport = callee.isImport();
                    if (callee.isIdentifier({ name: 'require' }) || isDynamicImport) {
                        const arg = path.node.arguments[0];

                        dependencies.push(arg.value);
                    }
                } else if (
                    path.node.type === 'ImportDeclaration' ||
                    path.node.type === 'ExportNamedDeclaration' ||
                    path.node.type === 'ExportAllDeclaration'
                ) {
                    const { source } = path.node;
                    if (source && source.value) {
                        dependencies.push(source.value);
                    }
                }
            },
        });

        compiledCode = transform(content, {
            filePath: resolveApp(),
            transforms: ['imports', 'jsx', 'typescript'],
        });
    }

    const map = hasSrcMapUrl && JSON.parse(fs.readFileSync(`${absolutePath}.map`, 'utf8'));
    const code = hasSrcMapUrl && srcURL.removeFrom(content);

    return {
        absolutePath,
        content: content,
        code: compiledCode.code || code,
        dependencies,
        hasSrcMapUrl,
        id: relativePath,
        map: compiledCode.map || map,
    };
}

function createBundle(entry) {
    const bundle = 'bundle.js';
    const bundleMap = `${bundle}.map`;
    const bundlePath = resolveApp(path.join('server', bundle));
    const sourceListMap = new SourceListMap();
    const modulesIds = [];
    const graph = createGraph(entry);
    const length = graph.length;
    const input = getConfigByKey(CONFIG_INPUT);

    // TODO: Add options to define env variables
    sourceListMap.add('var global = global || {};\n');
    sourceListMap.add('var process = process || { env: {} };\n');
    sourceListMap.add(`var configGlobals = ${JSON.stringify(getConfigByKey(CONFIG_GLOBALS))};\n`);
    sourceListMap.add(`var __DEV_PACK_ENTRY_POINT__ = "${graph[0].id}";\n`);
    sourceListMap.add('var __DEV_PACK_MODULES__ = {\n');

    for (let i = 0; i < length; i++) {
        sourceListMapModule(graph, i, modulesIds, sourceListMap);
    }

    sourceListMap.add('};\n');
    sourceListMap.add(prelude);

    const { map, source } = sourceListMap.toStringWithSourceMap({ file: bundlePath });

    mfs.writeFileSync(
        resolveApp(path.join(input, bundle)),
        `
            ${source}
            //# sourceMappingURL=${bundleMap}
        `,
        err => {
            if (err) throw err;
        }
    );
    mfs.writeFileSync(resolveApp(path.join(input, bundleMap)), JSON.stringify(map), err => {
        if (err) throw err;
    });
}

function createGraph(entry) {
    let queue;

    const mainAsset = createAsset(entry);

    queue = [mainAsset];

    const regx = RegExp(`${getConfigByKey(CONFIG_EXTERNALS).replace(/,/g, '|')}`);

    for (let asset of queue) {
        const length = asset.dependencies.length;

        asset.mapping = {};

        for (let i = 0; i < length; i++) {
            const dependency = asset.dependencies[i];
            const res = resolve.sync(dependency, {
                basedir: path.dirname(asset.absolutePath),
                extensions: ['.js', '.ts', '.tsx'],
                preserveSymlinks: true,
            });

            if (!/node_modules/g.test(res) || regx.test(res)) {
                const child = createAsset(res);

                asset.mapping[dependency] = child.id;
                queue.push(child);
            }
        }
    }

    return queue;
}

function createHotModuleUpdate(entry) {
    let hasSrcMapUrl;

    const entryBasename = path.basename(entry);
    const bundlePath = resolveApp(path.join(getConfigByKey(CONFIG_INPUT), entryBasename));
    const sourceListMap = new SourceListMap();
    const modulesIds = [];
    const graph = createGraph(entry);
    const length = graph.length;

    sourceListMap.add('hotUpdate({');

    for (let i = 0; i < length; i++) {
        if (graph[i].id === entry) {
            hasSrcMapUrl = graph[i].hasSrcMapUrl;

            sourceListMapModule(graph, i, modulesIds, sourceListMap);

            break;
        }
    }

    sourceListMap.add('});');

    const { map, source } = sourceListMap.toStringWithSourceMap({ file: bundlePath });

    !hasSrcMapUrl &&
        mfs.writeFileSync(`${bundlePath}.map`, JSON.stringify(map), err => {
            if (err) throw err;
        });

    return !hasSrcMapUrl
        ? `${source}\n//# sourceMappingURL=${entryBasename}.map`
        : `hotUpdate({"${graph[0].id}": [function (require, module, exports) {\n${
              graph[0].code
          }\n},{},],\n});`;
}

function sourceListMapModule(graph, i, modulesIds, sourceListMap) {
    const mod = graph[i];
    const id = mod.id;
    const hasId = modulesIds.indexOf(id) > -1;

    if (!hasId) {
        sourceListMap.add(`"${id}": [function (require, module, exports) {\n`);
        !mod.hasSrcMapUrl && sourceListMap.add(mod.code, mod.id, mod.content);
        mod.hasSrcMapUrl && sourceListMap.add(mod.code);
        sourceListMap.add(`\n},${JSON.stringify(mod.mapping)}],\n`);

        modulesIds.push(id);
    }
}

module.exports = {
    createBundle,
    createModule: createHotModuleUpdate,
};
