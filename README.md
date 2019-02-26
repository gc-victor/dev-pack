# dev-pack

Super-fast local development module bundler, server with hot module replacement.

⚠️ **IMPORTANT**: Don't use it in production!

## Install

`npm install --save-dev dev-pack`

`yarn add --dev dev-pack`

## How to use

You have to run the command `dev-pack start`, and use the options that you need, to have a really fast dev server with hmr running.

Optionally you can use a config file, by default called **.devpackrc.json**.

dev-pack will look in the load at the input folder for a index.html, a styles.css (not-required), and index.js.

When watch is set to true, it's default value, it will listen for changes to styles.css and any *.js file in the input folder.

### Options

`-c, --config`

Configuration file.

Default: .devpackrc.json

`-w, --watch`

Comma-separate list of directories and/or files to watch

Default: true

`-s, --socket`

Specify a WebSocket port.

Default: 1235

`-e, --external`

Comma-separate, without spaces, list of module IDs to include. Example: react,react-dom
 
Default: none.

`-x, --exclude`

Comma-separate list of directories to exclude. 

Default: node_modules

`-i, --input`

Entry folder.

Default: example

`-h, --html`

Entry html file.

Default: src/index.html

`-j, --js`

Entry JS or TS file.

Default: src/index.js

`-y, --css`

Entry CSS file.

Default: src/styles.css

`-g, --globals`

Comma-separate list of "moduleID:Global" pairs.

Default: none

`-p, --port`

Specify a port.

Default: 1234

`-x, --proxy`

Specify a proxy.

Default: none

## Compatible Versioning

### Summary

Given a version number MAJOR.MINOR, increment the:

- MAJOR version when you make backwards-incompatible updates of any kind
- MINOR version when you make 100% backwards-compatible updates

Additional labels for pre-release and build metadata are available as extensions to the MAJOR.MINOR format.

[![ComVer](https://img.shields.io/badge/ComVer-compliant-brightgreen.svg)](https://github.com/staltz/comver)

## Contribute

First off, thanks for taking the time to contribute!
Now, take a moment to be sure your contributions make sense to everyone else.

### Reporting Issues

Found a problem? Want a new feature? First of all, see if your issue or idea has [already been reported](../../issues).
If it hasn't, just open a [new clear and descriptive issue](../../issues/new).

### Commit message conventions

We are following *AngularJS Git Commit Message Conventions*. This leads to more readable messages that are easy to follow when looking through the project history.

- [AngularJS Git Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#heading=h.uyo6cb12dt6w)
- [Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

### Submitting pull requests

Pull requests are the greatest contributions, so be sure they are focused in scope and do avoid unrelated commits.

-   Fork it!
-   Clone your fork: `git clone http://git.trivago.trv/<your-username>/react-form-core`
-   Navigate to the newly cloned directory: `cd react-form-core`
-   Create a new branch for the new feature: `git checkout -b my-new-feature`
-   Install the tools necessary for development: `npm install`
-   Make your changes.
-   `npm run build` to verify your change doesn't increase output size.
-   `npm test` to make sure your change doesn't break anything.
-   Commit your changes: `git commit -am 'Add some feature'`
-   Push to the branch: `git push origin my-new-feature`
-   Submit a pull request with full remarks documenting your changes.

## License

[MIT License](https://github.com/gc-victor/dev-pack/blob/master/LICENSE.md)