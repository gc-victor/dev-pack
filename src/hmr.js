module.exports = `(function() {
    const head = document.getElementsByTagName('head')[0];
    const ws = new WebSocket('ws://localhost:__PORT__');

    ws.onmessage = event => {
        const getExtension = pathname => pathname.split('.').pop();
        const isJavaScript = pathname => /js|ts|tsx/.test(getExtension(pathname));
        const isCSS = pathname => /css/.test(getExtension(pathname));
        const path = event.data;

        console.log('File changed: ' + path);
        isJavaScript(path) && downloadUpdateJavaScript(path);
        isCSS(path) && downloadUpdateCSS(path);
    };

    function downloadUpdateJavaScript(path) {
        const script = document.createElement('script');
        
        script.type = 'text/javascript';
        script.src = \`/hot-update?path=\${path}\`;
        
        head.appendChild(script);
    }
    
    function downloadUpdateCSS(path) {
        const stylesheet = head.querySelector('#dev-pack-css');
        const link = document.createElement('link');

        link.id = 'dev-pack-css';
        link.rel = 'stylesheet';
        link.href = \`/hot-update?hash=\${+new Date()}&path=\${path}\`;        
        
        stylesheet.parentNode.replaceChild(link, stylesheet);
    }
})();`;
