import { learncodeRuntimeBridge } from './runtimeBridgeRuntime.js';

export const RUNTIME_BRIDGE_SCRIPT_NAME = 'learncode-runtime.js';
export const RUNTIME_BRIDGE_CONFIG_PLACEHOLDER = '"__LEARNCODE_BRIDGE_CONFIG__"';

/**
 * JSON for embedding inside an inline <script>: `<` is escaped so the payload can never close the
 * script element (`</script>`) or open an HTML comment (`<!--`).
 */
export function serializeForInlineScript(value) {
    return JSON.stringify(value === undefined ? null : value)
        .replace(/</g, '\\u003c')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

/**
 * Make user JavaScript safe to inline in <script>…</script> without changing what it does:
 * `</script` would end the element early and `<!--` (+ `<script`) would switch the HTML tokenizer into
 * the "double escaped" state where the real closing tag is ignored.
 */
export function escapeInlineScript(code = '') {
    return String(code || '')
        .replace(/<\/(script)/gi, '<\\/$1')
        .replace(/<!--/g, '\\x3C!--');
}

export function escapeInlineStyle(css = '') {
    return String(css || '').replace(/<\/(style)/gi, '<\\/$1');
}

const RUNTIME_SOURCE_JSON = serializeForInlineScript(
    `(${learncodeRuntimeBridge.toString()})\n//# sourceURL=${RUNTIME_BRIDGE_SCRIPT_NAME}`,
);

/**
 * Single-line <script> that installs the preview runtime. Keeping it on one line means injecting it
 * never shifts the line numbers of the learner's code (important for HTML-FULL documents).
 */
export function buildRuntimeBridgeScriptBody(configJson = 'null') {
    return `(0,eval)(${RUNTIME_SOURCE_JSON})(${configJson});`;
}

export function buildRuntimeBridgeMarkup(renderId = 0, options = {}) {
    const config = {
        consoleEnabled: true,
        mode: 'srcdoc',
        ranges: [],
        ...options,
        renderId: Number.isFinite(renderId) ? renderId : 0,
    };

    return `<script>${buildRuntimeBridgeScriptBody(serializeForInlineScript(config))}</script>`;
}

export function buildRuntimeBridgeMarkupWithPlaceholder() {
    return `<script>${buildRuntimeBridgeScriptBody(RUNTIME_BRIDGE_CONFIG_PLACEHOLDER)}</script>`;
}
