module.exports = `(function outer(modules, cache, entry) {
    function newRequire(name) {
        if (!cache[name]) {
            if (!modules[name]) {
                const err = new Error(\`Cannot find module \${name}\`);
                err.code = 'MODULE_NOT_FOUND';
                throw err;
            }
            const m = (cache[name] = { exports: {} });
            modules[name][0].call(
                m.exports,
                function(x) {
                    const id = modules[name][1][x];
                    
                    if (/css/.test(x.split('.').pop())) return;
                    if (configGlobals && configGlobals[x]) return window[configGlobals[x].window];
                    
                    return newRequire(id || x);
                },
                m,
                m.exports
            );
        }

        return cache[name].exports;
    }
    
    window.hotUpdate = function(updatedModules) {
        const id = Object.keys(updatedModules)[0];

        cache = {};
        modules[id] = updatedModules[id];

        newRequire(entry);
        
        console.log('Update applied.');
    };
    
    newRequire(entry);
})(__DEV_PACK_MODULES__, {}, __DEV_PACK_ENTRY_POINT__);
`;
