// Builds the preview document of a compiled (non-shader) example: the page the preview iframe loads,
// either as `srcdoc` or uploaded to the preview host (previewHost.ts, `hosted: true`).
//
// Input: a `CompiledDocument` (src/types/compile.ts) and its compile diagnostics. Callers: the editor preview
// (src/components/Preview.ts), the theory exercise dialog and embeds, the gallery/favorites/pending cards,
// the theory editor, tools/verify-examples.ts and scripts/snapshot-material.ts (through the barrel
// src/utils/exampleRenderer.ts). Shader examples are rendered by shaderRenderer.ts instead.
//
// Two shapes of document:
// - HTML-FULL (`fullDocumentHtml`): the learner's own page, with the runtime bridge (and a `<base>`, and
//   the diagnostics box) spliced in without adding any line, so browser line numbers stay the learner's.
// - Everything else: a page assembled here (head, base styles, CSS, markup, diagnostics box, script).
//   While assembling it, the document builder records where each learner file lands (`SourceRange`s);
//   the ranges go into the runtime bridge config so the runtime can map error positions back to files.
//
// The bridge <script> is emitted with a placeholder and the real `RuntimeBridgeConfig` replaces it at the
// end (the ranges are only known once the document is built). It is a single line, so it never moves the
// lines that follow it.
//
// Gotcha: the output is hashed by the course snapshot (three variants per example). Any change to the
// emitted text, even whitespace, changes every preview: keep it byte-identical unless that is the point.

import type { CompiledDocument } from '../../types/compile.ts';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type { Framework } from '../../types/document.ts';
import type { RuntimeBridgeConfig, SourceRange } from '../../types/runtime.ts';
import { buildDiagnosticsMarkup } from './diagnosticsMarkup.ts';
import { getTopicAssetBase } from './paths.ts';
import {
    RUNTIME_BRIDGE_CONFIG_PLACEHOLDER,
    buildRuntimeBridgeMarkupWithPlaceholder,
    escapeInlineScript,
    escapeInlineStyle,
    serializeForInlineScript,
} from './runtimeBridge.ts';
import { isModuleScript } from './scriptKind.ts';
import { extractInlineSourceMapLines } from './sourceMap.ts';

/** `//# sourceURL` given to compiled scripts that carry a source map (TypeScript, React, Vue). */
const COMPILED_SOURCE_NAME = 'learncode-compiled.js';

/** `Omit` applied to each member of a union, so each `kind` of range keeps its own fields. */
type WithoutPosition<Range> = Range extends SourceRange ? Omit<Range, 'startLine' | 'startColumn' | 'endLine'> : never;

/** A `SourceRange` before its position in the document is known (`appendSource()` adds the position). */
type SourceRangeInput = WithoutPosition<SourceRange>;

/** Builds the document text while recording where each learner file lands in it. */
interface DocumentBuilder {
    /** Append generated text. */
    append(chunk?: string): void;
    /** Append a learner file; when `range` is given and the chunk is not empty, record its position. */
    appendSource(chunk?: string, range?: SourceRangeInput | null): void;
    readonly text: string;
    readonly ranges: SourceRange[];
}

/** Runtime bridge settings shared by both document shapes. */
interface BridgeSettings {
    consoleEnabled?: boolean;
    hosted?: boolean;
    renderId?: number;
    suppressDialogs?: boolean;
}

/** Options of `renderFullDocument()` (HTML-FULL). */
interface FullDocumentOptions extends BridgeSettings {
    /** `<base href>` to inject (srcdoc only); `''` for none. */
    assetBase?: string;
    /** The diagnostics box, already built (`''` for none). */
    diagnosticsMarkup?: string;
    /** Editor path of the HTML-FULL file. */
    markupPath?: string;
}

/** Inputs of `getBaseStyles()`. */
interface BaseStyleOptions {
    framework: Framework | '';
    isPureSvgDocument: boolean;
    hasBlockingDiagnostics: boolean;
}

/**
 * Options of `renderCompiledExampleDocument()`. Every field is optional; the defaults give the plain
 * srcdoc document of a gallery card (console off, render id 0).
 */
export interface RenderCompiledExampleOptions {
    /**
     * The app shows a console for this preview: console output is forwarded, and the in-page diagnostics
     * box only appears for blocking errors (otherwise the console and the editor list them).
     */
    consoleEnabled?: boolean;
    /** Stamped on every runtime message; non-finite values become 0. */
    renderId?: number;
    /**
     * The document will be served from the preview origin (its URL already lives inside the topic's
     * assets folder, so no `<base>` is injected) instead of loaded as `srcdoc`.
     */
    hosted?: boolean;
    /** Replace alert/confirm/prompt with console notices (renders triggered by typing). */
    suppressDialogs?: boolean;
    /** Editor path of the markup (or HTML-FULL) file, for mapping errors back to it. Default `index.html`. */
    markupPath?: string;
}

function isBlockingDiagnostic(diagnostic: Diagnostic | null | undefined): boolean {
    return diagnostic?.level === 'error' && diagnostic?.blocking !== false;
}

function countNewlines(text: string = ''): number {
    let count = 0;
    for (let index = 0; index < text.length; index += 1) {
        if (text.charCodeAt(index) === 10) count += 1;
    }
    return count;
}

/** 1-based line and 0-based column right after the end of `text`. */
function positionAtEnd(text: string = ''): { line: number; column: number } {
    const lastNewline = text.lastIndexOf('\n');
    return {
        line: countNewlines(text) + 1,
        column: text.length - lastNewline - 1,
    };
}

/** Name in the last `//# sourceURL=` comment of the script, or `''`. */
function getSourceUrlName(js: string = ''): string {
    const matches = Array.from(String(js || '').matchAll(/\/\/[#@] sourceURL=([^\s]+)/g));
    return matches.at(-1)?.[1] || '';
}

/**
 * Give the script a `//# sourceURL=` name unless it already has one: that name is how the runtime recognises
 * the learner's stack frames. `learncode-compiled.js` for source-mapped output, else the script's path.
 */
function appendUserScriptSourceReference(js: string = '', runtimeScriptPath: string = ''): string {
    if (!js) return js;

    // Compiled code with an inline source map (TypeScript, React, Vue): give it a stable script name so
    // stack frames can be resolved through the source map.
    if (/sourceMappingURL=/i.test(js) && !/sourceURL=/i.test(js)) {
        return js.replace(/(\/\/# sourceMappingURL=)/, `//# sourceURL=${COMPILED_SOURCE_NAME}\n$1`);
    }

    if (/sourceURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${runtimeScriptPath || 'script.js'}`;
}

function buildDocumentBuilder(): DocumentBuilder {
    let text = '';
    const ranges: SourceRange[] = [];

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

/** Replace the bridge config placeholder with the serialized config. */
function finalizeBridgeConfig(html: string = '', config: RuntimeBridgeConfig = {}): string {
    const json = serializeForInlineScript(config);
    // Function replacement: the JSON may contain `$` sequences.
    return html.replace(RUNTIME_BRIDGE_CONFIG_PLACEHOLDER, () => json);
}

function buildBridgeConfig({ consoleEnabled, renderId, hosted, suppressDialogs, ranges }: BridgeSettings & { ranges: SourceRange[] }): RuntimeBridgeConfig {
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
function maskHtmlComments(html: string = ''): string {
    return String(html).replace(/<!--[\s\S]*?(?:-->|$)/g, (comment) => comment.replace(/[^\n]/g, ' '));
}

/**
 * Where the runtime goes in an HTML-FULL document: after `<meta charset>` (if it comes before `<body>` and
 * `</head>`), else after `<head>`, else after `<html>` (wrapped in a new `<head>`), else after the doctype,
 * else at the very start.
 */
function findInsertionPoint(html: string = ''): { index: number; wrapInHead: boolean } {
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

/** The HTML-FULL variant: the learner's page with the runtime, `<base>` and diagnostics spliced in. */
function renderFullDocument(documentHtml: string = '', options: FullDocumentOptions = {}): string {
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

    const ranges: SourceRange[] = [{
        kind: 'document',
        path: markupPath || 'index.html',
        startLine: 1,
        startColumn: 0,
        endLine: Number.MAX_SAFE_INTEGER,
    }];

    return finalizeBridgeConfig(html, buildBridgeConfig({ ...options, ranges }));
}

/** Base styles of a pure SVG example: black page, the drawing centred horizontally on a white background. */
const SVG_BASE_STYLES = `
:where(html), :where(body) { margin: 0; min-height: 100%; background: #000; }
:where(body) { color: #e5e7eb; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
:where(.learncode-svg-preview) { width: 100%; min-height: 100vh; display: flex; align-items: flex-start; justify-content: center; overflow: auto; }
:where(.learncode-svg-preview) > :where(svg) { display: block; flex: 0 0 auto; max-width: none; height: auto; background: #fff; }`;

/** Base styles of React and Vue examples. */
const FRAMEWORK_BASE_STYLES = 'html, body { margin: 0; padding: 0; } body { padding: 16px; box-sizing: border-box; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }';

function getBaseStyles({ framework, isPureSvgDocument, hasBlockingDiagnostics }: BaseStyleOptions): string {
    if (isPureSvgDocument) return SVG_BASE_STYLES;
    if (framework === 'react') return `${FRAMEWORK_BASE_STYLES}${hasBlockingDiagnostics ? '' : ' #root { min-height: calc(100vh - 32px); }'}`;
    if (framework === 'vue') return `${FRAMEWORK_BASE_STYLES}${hasBlockingDiagnostics ? '' : ' #app { min-height: calc(100vh - 32px); }'}`;
    // Plain HTML examples get the browser's real defaults (8px body margin, default fonts…) so CSS
    // lessons behave exactly like a standalone page.
    return '';
}

// The page language matters for hyphenation, `:lang()` and screen readers. Examples can set it
// with `lang: en` in their frontmatter; the course content is Spanish, so that's the default.
function getDocumentLanguage(value: string | null | undefined): string {
    const lang = String(value ?? '').trim();
    return /^[a-zA-Z]{2,3}(-[a-zA-Z0-9]{2,8})*$/.test(lang) ? lang : 'es';
}

/**
 * Build the preview document (complete HTML text) of a compiled example.
 *
 * `compiledDocument` may be partial or `{}` (an empty page, used to clear the preview or to show only
 * diagnostics). `topicPath` (`ch/sec/top`) locates the topic's assets for the srcdoc `<base>`.
 * `diagnostics` are the compile diagnostics: non-blocking ones (`blocking: false`) are left out, the
 * others are shown in a box inside the page (always when one blocks, otherwise only without a console).
 */
export function renderCompiledExampleDocument(
    compiledDocument: Partial<CompiledDocument> | null = {},
    topicPath: string | null = '',
    diagnostics: Diagnostic[] = [],
    options: RenderCompiledExampleOptions = {},
): string {
    const hosted = Boolean(options.hosted);
    const assetBase = getTopicAssetBase(topicPath);
    const framework = compiledDocument?.framework || '';
    const fullDocumentHtml = compiledDocument?.fullDocumentHtml || '';
    const html = compiledDocument?.html || '';
    const css = compiledDocument?.css || '';
    const markupType = compiledDocument?.markupType || '';
    const runtimeScriptPath = compiledDocument?.runtimeScriptPath || '';
    const consoleEnabled = Boolean(options.consoleEnabled);
    // `!`: Number.isFinite() is true only for a number, but it does not narrow.
    const renderId = Number.isFinite(options.renderId) ? options.renderId! : 0;
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
