import { buildDiagnosticsMarkup } from './diagnosticsMarkup.js';
import { buildRuntimeBridgeMarkup } from './runtimeBridge.js';

function buildUserScriptMarkup(js = '', options = {}) {
    const consoleEnabled = Boolean(options.consoleEnabled);
    const runtimeScriptPath = String(options.runtimeScriptPath || '').trim();
    const scriptBody = appendUserScriptSourceReference(js, runtimeScriptPath);

    if (consoleEnabled) {
        return `
  <script>
${scriptBody}
  </script>`;
    }

    return `
  <script>
  try {
${scriptBody}
  } catch (e) {
    document.body.innerHTML += '<pre style="color:red;margin-top:12px;font-size:12px;">Runtime Error: ' + e.message + '</pre>';
    throw e;
  }
  </script>`;
}

function appendUserScriptSourceReference(js = '', runtimeScriptPath = '') {
    if (!js || !runtimeScriptPath) return js;
    if (/sourceURL=|sourceMappingURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${runtimeScriptPath}`;
}

function injectAfterOpeningTag(source = '', tagName = '', markup = '') {
    if (!source || !tagName || !markup) return source;

    const pattern = new RegExp(`<${tagName}\\b[^>]*>`, 'i');
    if (!pattern.test(source)) return source;
    return source.replace(pattern, (match) => `${match}\n${markup}`);
}

function injectBeforeClosingTag(source = '', tagName = '', markup = '') {
    if (!source || !tagName || !markup) return source;

    const pattern = new RegExp(`</${tagName}>`, 'i');
    if (!pattern.test(source)) return source;
    return source.replace(pattern, `${markup}\n</${tagName}>`);
}

function injectFullDocumentMarkup(documentHtml = '', options = {}) {
    let html = documentHtml || '';
    const assetBase = options.assetBase || '';
    const diagnosticsMarkup = options.diagnosticsMarkup || '';
    const bridgeMarkup = buildRuntimeBridgeMarkup(options.renderId || 0);

    if (assetBase && !/<base\b/i.test(html)) {
        const baseMarkup = `<base href="${assetBase}">`;
        if (/<head\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'head', baseMarkup);
        } else if (/<html\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'html', `<head>\n${baseMarkup}\n</head>`);
        } else {
            html = `${baseMarkup}\n${html}`;
        }
    }

    if (bridgeMarkup) {
        if (/<head\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'head', bridgeMarkup);
        } else if (/<html\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'html', `<head>\n${bridgeMarkup}\n</head>`);
        } else if (/<body\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'body', bridgeMarkup);
        } else {
            html = `${bridgeMarkup}\n${html}`;
        }
    }

    if (diagnosticsMarkup) {
        if (/<body\b/i.test(html)) {
            html = injectBeforeClosingTag(html, 'body', diagnosticsMarkup);
        } else if (/<html\b/i.test(html)) {
            html = injectBeforeClosingTag(html, 'html', `<body>\n${diagnosticsMarkup}\n</body>`);
        } else {
            html = `${html}\n${diagnosticsMarkup}`;
        }
    }

    return html;
}

export function renderCompiledExampleDocument(compiledDocument = {}, topicPath = '', diagnostics = [], options = {}) {
    const assetBase = topicPath ? `/api/topic/${topicPath}/assets/` : '';
    const framework = compiledDocument.framework || '';
    const fullDocumentHtml = compiledDocument.fullDocumentHtml || '';
    const html = compiledDocument.html || '';
    const css = compiledDocument.css || '';
    const js = compiledDocument.js || '';
    const markupType = compiledDocument.markupType || '';
    const runtimeScriptPath = compiledDocument.runtimeScriptPath || '';
    const consoleEnabled = Boolean(options.consoleEnabled);
    const renderId = Number.isFinite(options.renderId) ? options.renderId : 0;
    const hasBlockingDiagnostics = Array.isArray(diagnostics) && diagnostics.some((diagnostic) => diagnostic?.level === 'error');
    const diagnosticsMarkup = consoleEnabled && !hasBlockingDiagnostics
        ? ''
        : buildDiagnosticsMarkup(diagnostics);

    if (fullDocumentHtml) {
        return injectFullDocumentMarkup(fullDocumentHtml, {
            assetBase,
            consoleEnabled,
            diagnosticsMarkup,
            renderId,
        });
    }

    const isPureSvgDocument = markupType === 'svg' && !framework;
    const baseStyles = isPureSvgDocument
        ? `
html {
  margin: 0;
  width: 100%;
  min-height: 100%;
  background: #000;
}
body {
  margin: 0;
  width: 100%;
  min-height: 100vh;
  background: #000;
  color: #e5e7eb;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: auto;
}
.learncode-svg-preview {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  background: #000;
  overflow: auto;
}
.learncode-svg-preview > svg {
  display: block;
  flex: 0 0 auto;
  max-width: none;
  height: auto;
  background: transparent;
}
        `
        : framework === 'react'
            ? `body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }${hasBlockingDiagnostics ? '' : ' #root { min-height: calc(100vh - 32px); }'}`
            : framework === 'vue'
                ? `body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }${hasBlockingDiagnostics ? '' : ' #app { min-height: calc(100vh - 32px); }'}`
                : 'body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }';
    const trailingStyles = isPureSvgDocument
        ? `
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  min-height: 100% !important;
  background: #000 !important;
  display: block !important;
  overflow: auto !important;
}
.learncode-svg-preview {
  width: 100% !important;
  min-height: 100vh !important;
  display: flex !important;
  align-items: flex-start !important;
  justify-content: center !important;
  background: #000 !important;
  overflow: auto !important;
}
.learncode-svg-preview > svg {
  display: block !important;
  flex: 0 0 auto !important;
  margin: 0 !important;
  background: transparent !important;
}
        `
        : '';
    const bodyMarkup = isPureSvgDocument
        ? `<div class="learncode-svg-preview">${html}</div>`
        : html;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${assetBase ? `<base href="${assetBase}">` : ''}
  <style>
    ${baseStyles}
    ${css}
    ${trailingStyles}
  </style>
</head>
<body>
  ${bodyMarkup}
  ${diagnosticsMarkup}
  ${buildRuntimeBridgeMarkup(renderId)}
  ${buildUserScriptMarkup(js, { consoleEnabled, runtimeScriptPath })}
</body>
</html>`;
}
