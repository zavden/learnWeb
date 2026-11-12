// Builds the <script> that installs the preview runtime (runtimeBridgeRuntime.ts) in a preview document,
// plus the escaping helpers every renderer uses to inline JSON, user scripts and user styles safely.
//
// Called by documentRenderer.ts (example and HTML-FULL documents, with a config placeholder that is
// filled in once the source ranges are known), shaderRenderer.ts (shader documents with a console) and
// scripts/snapshot-material.ts (which hashes the runtime source once instead of in every document).
//
// The runtime is shipped as text: `learncodeRuntimeBridge.toString()`, JSON-encoded and evaluated with
// an indirect eval, so its source never needs its own file or request. See the header of
// runtimeBridgeRuntime.ts for what that requires from the runtime's code.
import type { RuntimeBridgeConfig } from '../../types/runtime.ts';
import { learncodeRuntimeBridge } from './runtimeBridgeRuntime.ts';

/** `//# sourceURL` of the evaluated runtime: names its stack frames, which the runtime then skips. */
export const RUNTIME_BRIDGE_SCRIPT_NAME = 'learncode-runtime.js';

/**
 * Stands for the config JSON in markup built before the config is known; documentRenderer.ts replaces
 * it with the serialized `RuntimeBridgeConfig`. It is a JSON string literal so the script stays valid
 * JavaScript even if it is never replaced (the runtime then gets a string and uses its defaults).
 */
export const RUNTIME_BRIDGE_CONFIG_PLACEHOLDER = '"__LEARNCODE_BRIDGE_CONFIG__"';

/**
 * JSON for embedding inside an inline <script>: `<` is escaped so the payload can never close the
 * script element (`</script>`) or open an HTML comment (`<!--`). `undefined` becomes `null`.
 */
export function serializeForInlineScript(value: unknown): string {
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
export function escapeInlineScript(code: string | null = ''): string {
    return String(code || '')
        .replace(/<\/(script)/gi, '<\\/$1')
        .replace(/<!--/g, '\\x3C!--');
}

/** Make user CSS safe to inline in <style>…</style>: `</style` would end the element early. */
export function escapeInlineStyle(css: string | null = ''): string {
    return String(css || '').replace(/<\/(style)/gi, '<\\/$1');
}

const RUNTIME_SOURCE_JSON = serializeForInlineScript(
    `(${learncodeRuntimeBridge.toString()})\n//# sourceURL=${RUNTIME_BRIDGE_SCRIPT_NAME}`,
);

/**
 * Single-line <script> that installs the preview runtime. Keeping it on one line means injecting it
 * never shifts the line numbers of the learner's code (important for HTML-FULL documents).
 * `configJson` is JavaScript source for the config argument: serialized JSON or the placeholder.
 */
export function buildRuntimeBridgeScriptBody(configJson: string = 'null'): string {
    return `(0,eval)(${RUNTIME_SOURCE_JSON})(${configJson});`;
}

/**
 * The complete runtime <script> for a known config (shader documents). `consoleEnabled` and `mode`
 * default to `true` and 'srcdoc'; a non-finite `renderId` becomes 0.
 */
export function buildRuntimeBridgeMarkup(renderId: number = 0, options: RuntimeBridgeConfig = {}): string {
    const config: RuntimeBridgeConfig = {
        consoleEnabled: true,
        mode: 'srcdoc',
        ranges: [],
        ...options,
        renderId: Number.isFinite(renderId) ? renderId : 0,
    };

    return `<script>${buildRuntimeBridgeScriptBody(serializeForInlineScript(config))}</script>`;
}

/** The runtime <script> with `RUNTIME_BRIDGE_CONFIG_PLACEHOLDER` where the config goes. */
export function buildRuntimeBridgeMarkupWithPlaceholder(): string {
    return `<script>${buildRuntimeBridgeScriptBody(RUNTIME_BRIDGE_CONFIG_PLACEHOLDER)}</script>`;
}
