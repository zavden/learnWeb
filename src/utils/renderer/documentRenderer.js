import { buildDiagnosticsMarkup } from './diagnosticsMarkup.js';
import { getTopicAssetBase } from './paths.js';
import {
    RUNTIME_BRIDGE_CONFIG_PLACEHOLDER,
    buildRuntimeBridgeMarkupWithPlaceholder,
    escapeInlineScript,
    escapeInlineStyle,
    serializeForInlineScript,
} from './runtimeBridge.js';
import { isModuleScript } from './scriptKind.js';
import { extractInlineSourceMapLines } from './sourceMap.js';

const COMPILED_SOURCE_NAME = 'learncode-compiled.js';

function isBlockingDiagnostic(diagnostic) {
    return diagnostic?.level === 'error' && diagnostic?.blocking !== false;
}

function countNewlines(text = '') {
    let count = 0;
    for (let index = 0; index < text.length; index += 1) {
        if (text.charCodeAt(index) === 10) count += 1;
    }
    return count;
}

function positionAtEnd(text = '') {
    const lastNewline = text.lastIndexOf('\n');
    return {
        line: countNewlines(text) + 1,
        column: text.length - lastNewline - 1,
    };
}

function getSourceUrlName(js = '') {
    const matches = Array.from(String(js || '').matchAll(/\/\/[#@] sourceURL=([^\s]+)/g));
    return matches.at(-1)?.[1] || '';
}

function appendUserScriptSourceReference(js = '', runtimeScriptPath = '') {
    if (!js) return js;

    // Compiled code with an inline source map (TypeScript, React, Vue): give it a stable script name so
    // stack frames can be resolved through the source map.
    if (/sourceMappingURL=/i.test(js) && !/sourceURL=/i.test(js)) {
        return js.replace(/(\/\/# sourceMappingURL=)/, `//# sourceURL=${COMPILED_SOURCE_NAME}\n$1`);
    }

    if (/sourceURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${runtimeScriptPath || 'script.js'}`;
}

function buildDocumentBuilder() {
    let text = '';
    const ranges = [];

    return {
        append(chunk = '') {
            text += chunk;
        },
        appendSource(chunk = '', range = null) {
            if (range && chunk) {
                const start = positionAtEnd(text);
                ranges.push({
                    ...range,
                    startLine: start.line,
                    startColumn: start.column,
                    endLine: start.line + countNewlines(chunk),
                });
            }
            text += chunk;
        },
        get text() {
            return text;
        },
        ranges,
    };
}

function finalizeBridgeConfig(html = '', config = {}) {
    const json = serializeForInlineScript(config);
    // Function replacement: the JSON may contain `$` sequences.
    return html.replace(RUNTIME_BRIDGE_CONFIG_PLACEHOLDER, () => json);
}

function buildBridgeConfig({ consoleEnabled, renderId, hosted, suppressDialogs, ranges }) {
    return {
        consoleEnabled: Boolean(consoleEnabled),
        mode: hosted ? 'hosted' : 'srcdoc',
        ranges,
        renderId,
        suppressDialogs: Boolean(suppressDialogs),
    };
}

// Replaces the contents of comments with spaces (same length) so tag searches ignore text like
// `<!-- no escribimos <head> -->` while indexes still point into the original string.
function maskHtmlComments(html = '') {
    return String(html).replace(/<!--[\s\S]*?(?:-->|$)/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

function findInsertionPoint(html = '') {
    const masked = maskHtmlComments(html);
    const bodyStart = masked.search(/<body\b/i);
    const headEnd = masked.search(/<\/head\s*>/i);
    const limit = [bodyStart, headEnd].filter((index) => index >= 0).reduce((min, index) => Math.min(min, index), masked.length);

    // `<meta charset>` must stay within the first bytes of the document, so the runtime goes after it.
    const charsetPattern = /<meta\b[^>]*\bcharset\s*=[^>]*>/ig;
    let charset = charsetPattern.exec(masked);
    while (charset && charset.index >= limit) charset = null;
    if (charset) return { index: charset.index + charset[0].length, wrapInHead: false };

    const head = /<head\b[^>]*>/i.exec(masked);
    if (head) return { index: head.index + head[0].length, wrapInHead: false };

    const root = /<html\b[^>]*>/i.exec(masked);
    if (root) return { index: root.index + root[0].length, wrapInHead: true };

    const doctype = /<!doctype[^>]*>/i.exec(masked);
    if (doctype) return { index: doctype.index + doctype[0].length, wrapInHead: false };

    return { index: 0, wrapInHead: false };
}

function renderFullDocument(documentHtml = '', options = {}) {
    const { assetBase, diagnosticsMarkup, hosted, markupPath } = options;
    let html = String(documentHtml || '');

    // Everything is injected inline (no new lines) so the learner's line numbers stay valid.
    const baseMarkup = assetBase && !hosted && !/<base\b[^>]*\bhref\s*=/i.test(html)
        ? `<base href="${assetBase}">`
        : '';
    const injected = `${baseMarkup}${buildRuntimeBridgeMarkupWithPlaceholder()}`;
    const insertion = findInsertionPoint(html);
    const markup = insertion.wrapInHead ? `<head>${injected}</head>` : injected;
    html = `${html.slice(0, insertion.index)}${markup}${html.slice(insertion.index)}`;

    if (diagnosticsMarkup) {
        const flatDiagnostics = diagnosticsMarkup.replace(/\n\s*/g, ' ');
        const bodyClose = maskHtmlComments(html).search(/<\/body>/i);
        html = bodyClose >= 0
            ? `${html.slice(0, bodyClose)}${flatDiagnostics}${html.slice(bodyClose)}`
            : `${html}${flatDiagnostics}`;
    }

    const ranges = [{
        kind: 'document',
        path: markupPath || 'index.html',
        startLine: 1,
        startColumn: 0,
        endLine: Number.MAX_SAFE_INTEGER,
    }];

    return finalizeBridgeConfig(html, buildBridgeConfig({ ...options, ranges }));
}

const SVG_BASE_STYLES = `
:where(html), :where(body) { margin: 0; min-height: 100%; background: #000; }
:where(body) { color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
:where(.learncode-svg-preview) { width: 100%; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; overflow: auto; }
:where(.learncode-svg-preview) > :where(svg) { display: block; flex: 0 0 auto; max-width: none; height: auto; background: #fff; }`;

const FRAMEWORK_BASE_STYLES = 'html, body { margin: 0; padding: 0; } body { padding: 16px; box-sizing: border-box; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }';

function getBaseStyles({ framework, isPureSvgDocument, hasBlockingDiagnostics }) {
    if (isPureSvgDocument) return SVG_BASE_STYLES;
    if (framework === 'react') return `${FRAMEWORK_BASE_STYLES}${hasBlockingDiagnostics ? '' : ' #root { min-height: calc(100vh - 32px); }'}`;
    if (framework === 'vue') return `${FRAMEWORK_BASE_STYLES}${hasBlockingDiagnostics ? '' : ' #app { min-height: calc(100vh - 32px); }'}`;
    // Plain HTML examples get the browser's real defaults (8px body margin, default fonts…) so CSS
    // lessons behave exactly like a standalone page.
    return '';
}

/**
 * Build the preview document for a compiled example.
 *
 * options:
 * - consoleEnabled, renderId: runtime bridge settings
 * - hosted: the document will be served from the preview origin (its URL already lives inside the
 *   topic's assets folder, so no <base> is injected)
 * - suppressDialogs: replace alert/confirm/prompt with console notices (live editing)
 * - markupPath: editor path of the markup file (for mapping errors back to it)
 */
// The page language matters for hyphenation, `:lang()` and screen readers. Examples can set it
// with `lang: en` in their frontmatter; the course content is Spanish, so that's the default.
function getDocumentLanguage(value) {
    const lang = String(value ?? '').trim();
    return /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(lang) ? lang : 'es';
}

export function renderCompiledExampleDocument(compiledDocument = {}, topicPath = '', diagnostics = [], options = {}) {
    const hosted = Boolean(options.hosted);
    const assetBase = getTopicAssetBase(topicPath);
    const framework = compiledDocument?.framework || '';
    const fullDocumentHtml = compiledDocument?.fullDocumentHtml || '';
    const html = compiledDocument?.html || '';
    const css = compiledDocument?.css || '';
    const markupType = compiledDocument?.markupType || '';
    const runtimeScriptPath = compiledDocument?.runtimeScriptPath || '';
    const consoleEnabled = Boolean(options.consoleEnabled);
    const renderId = Number.isFinite(options.renderId) ? options.renderId : 0;
    const markupPath = options.markupPath || 'index.html';
    const visibleDiagnostics = (Array.isArray(diagnostics) ? diagnostics : []).filter((diagnostic) => diagnostic?.blocking !== false);
    const hasBlockingDiagnostics = visibleDiagnostics.some(isBlockingDiagnostic);
    const diagnosticsMarkup = consoleEnabled && !hasBlockingDiagnostics
        ? ''
        : buildDiagnosticsMarkup(visibleDiagnostics);
    const sharedOptions = {
        consoleEnabled,
        hosted,
        renderId,
        suppressDialogs: Boolean(options.suppressDialogs),
    };

    if (fullDocumentHtml) {
        return renderFullDocument(fullDocumentHtml, {
            ...sharedOptions,
            assetBase,
            diagnosticsMarkup,
            markupPath,
        });
    }

    const isPureSvgDocument = markupType === 'svg' && !framework;
    const baseStyles = getBaseStyles({ framework, isPureSvgDocument, hasBlockingDiagnostics });
    const js = appendUserScriptSourceReference(compiledDocument?.js || '', runtimeScriptPath);
    const isModule = !framework && isModuleScript(js);
    const sourceMap = js ? extractInlineSourceMapLines(js) : null;
    const scriptSourceName = getSourceUrlName(js);
    const mapsMarkup = Boolean(html) && (markupType === 'html' || markupType === 'svg' || !markupType);

    const builder = buildDocumentBuilder();
    builder.append(`<!DOCTYPE html>\n<html lang="${getDocumentLanguage(compiledDocument?.lang)}">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n`);
    if (assetBase && !hosted) builder.append(`<base href="${assetBase}">\n`);
    builder.append(`${buildRuntimeBridgeMarkupWithPlaceholder()}\n`);
    if (baseStyles) builder.append(`<style>${baseStyles}\n</style>\n`);
    if (css) builder.append(`<style>${escapeInlineStyle(css)}\n</style>\n`);
    builder.append('</head>\n<body>\n');

    if (isPureSvgDocument) {
        builder.append('<div class="learncode-svg-preview">');
        builder.appendSource(html, { kind: 'markup', path: markupPath });
        builder.append('</div>\n');
    } else if (html) {
        builder.appendSource(html, mapsMarkup ? { kind: 'markup', path: markupPath } : null);
        builder.append('\n');
    }

    if (diagnosticsMarkup) builder.append(`${diagnosticsMarkup}\n`);

    if (js) {
        builder.append(isModule ? '<script type="module">' : '<script>');
        builder.appendSource(escapeInlineScript(js), {
            kind: 'script',
            path: sourceMap?.sources?.[0] || runtimeScriptPath || scriptSourceName || 'script.js',
            compiledPath: runtimeScriptPath || scriptSourceName || 'script.js',
            sourceName: scriptSourceName,
            module: isModule,
            ...(sourceMap ? { lineMap: sourceMap.lineMap, sources: sourceMap.sources } : {}),
        });
        builder.append('</script>\n');
    }

    builder.append('</body>\n</html>');

    return finalizeBridgeConfig(builder.text, buildBridgeConfig({ ...sharedOptions, ranges: builder.ranges }));
}
