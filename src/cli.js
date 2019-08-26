#!/usr/bin/env node

const sade = require('sade');
const { run } = require('../src/run');

const { version } = require('../package');

const prog = sade('dev-pack');

prog.version(version)
    .option('-c, --config', 'Configuration file')
    .option('-i, --input', 'Entry folder')
    .option('-h, --html', 'Entry html file')
    .option('-j, --js', 'Entry js file')
    .option('-y, --css', 'Entry css file')
    .option(
        '-e, --externals',
        'Comma-separate, without spaces, list of module IDs to include. Example: react,react-dom'
    )
    .option(
        '-g, --globals',
        'Comma-separate, without spaces, list of "moduleID:Global" pairs. Example:  react:React,react-dom:ReactDOM'
    )
    .option(
        '-w, --watch',
        'Comma-separate, without spaces, list of directories and/or files to watch'
    )
    .option('-s, --socket', 'Specify a WebSocket port')
    .option('-p, --port', 'Specify a port')
    .option('-x, --proxy', 'Specify a proxy');

prog.command('start')
    .describe(
        'Super-fast development module bundler, with a dev-server, and hot module replacement.'
    )
    .action(run);

prog.parse(process.argv);
