// Preview runtime protocol: the contract between a preview iframe and the app.
//
// Every preview document (examples, HTML-FULL pages, shader pages with a console, the exercise
// cards of theory pages) installs the runtime bridge `learncodeRuntimeBridge`
// (src/utils/renderer/runtimeBridgeRuntime.ts) through a one-line <script> built by
// src/utils/renderer/runtimeBridge.ts, configured with a `RuntimeBridgeConfig` that the renderers
// (documentRenderer.ts, shaderRenderer.ts) produce. From then on the iframe and the app only talk
// through window.postMessage, on four channels told apart by the `source` field:
//
//   iframe → app  'learncode-preview'          RuntimeBridgeMessage  (the runtime bridge)
//                                              ShaderRuntimeMessage  (the shader page script, shaderRenderer.ts)
//                 'learncode-theory-preview'   TheoryPreviewMessage  (the theory page script, theoryRenderer.ts)
//   app → iframe  'learncode-console-command'  ConsoleCommandMessage (REPL and object inspector, ConsoleManager.ts)
//                 'learncode-shader-control'   ShaderControlMessage  (shader panel, ShaderControls.ts)
//
// Receivers on the app side: Preview.ts with its ConsoleManager / RuntimeDiagnostics / ShaderControls
// mixins, TheoryExerciseDialog.ts, and tools/verify-examples.ts (+ verify-core.ts).
//
// Things to know before using these types:
// - This file is type-only. The runtime is serialized and evaluated inside the iframe, so it cannot
//   import values: every string literal below is repeated by hand on both ends.
// - Every message carries the `renderId` of the render that created the document. Preview.ts and the
//   verify tool drop messages whose renderId is not the current render (TheoryExerciseDialog.ts relies on
//   the sending window instead), and the runtime ignores commands for another renderId.
// - Payloads cross a structured clone. They never contain user objects or functions: user values
//   travel as `RemoteValue` previews plus a numeric handle the app can send back to expand them.
// - Nothing validates messages at runtime: each end checks `source` and `renderId`, then trusts the shape.

// ─── Bridge configuration ──────────────────────────────────────────────────────────────────────

/**
 * Where the preview document lives. 'hosted': served from the preview origin, like a real page.
 * Anything else (normally 'srcdoc') is an opaque-origin copy: the runtime then handles same-page
 * `#anchor` links itself and starts workers through data:/blob: URLs. (Storage and cookies get
 * in-memory replacements in either mode, whenever the browser refuses access to them.)
 */
export type RuntimeBridgeMode = 'hosted' | 'srcdoc';

/** `[index into ScriptSourceRange.sources, 1-based original line]`. */
export type SourceLineMapEntry = [sourceIndex: number, sourceLine: number];

/**
 * Compact form of an inline source map (built by extractInlineSourceMapLines in
 * src/utils/renderer/sourceMap.ts): the index is the 1-based generated line, `0` means the line has
 * no mapping (index 0 is always `0`).
 */
export type SourceLineMap = Array<SourceLineMapEntry | 0>;

interface SourceRangeBase {
    /** Editor file these document lines come from (`index.html`, `script.js`, `script.ts`, `page.html`…). */
    path: string;
    /** 1-based document line of the file's first character. */
    startLine: number;
    /** 0-based column of the file's first character on `startLine`. */
    startColumn: number;
    /** Last document line of the file, inclusive (`Number.MAX_SAFE_INTEGER` for a whole HTML-FULL document). */
    endLine: number;
}

/** Script-only fields, declared absent on the other kinds so they can be read on any `SourceRange`. */
interface NoScriptRangeFields {
    compiledPath?: undefined;
    sourceName?: undefined;
    module?: undefined;
    lineMap?: undefined;
    sources?: undefined;
}

/** An HTML-FULL document: the whole page is the learner's file. */
export interface DocumentSourceRange extends SourceRangeBase, NoScriptRangeFields {
    kind: 'document';
}

/** The learner's markup (HTML, SVG) inside the generated page. */
export interface MarkupSourceRange extends SourceRangeBase, NoScriptRangeFields {
    kind: 'markup';
}

/** The learner's (possibly compiled) script inside the generated page. */
export interface ScriptSourceRange extends SourceRangeBase {
    kind: 'script';
    /** File shown for lines the source map does not cover: the compiled script's name. */
    compiledPath: string;
    /**
     * `//# sourceURL=` name of the inline script: the browser uses it as the path of its stack frames,
     * which is how the runtime recognises frames of this script ('' if the script has none).
     */
    sourceName: string;
    /** Whether the script is a `type="module"` script (informational: the runtime does not read it). */
    module: boolean;
    /** Present when the script was compiled with an inline source map (TypeScript, JSX, Vue). */
    lineMap?: SourceLineMap;
    /** Source files of that source map; `SourceLineMapEntry[0]` indexes this list. */
    sources?: string[];
}

/**
 * Where one editor file sits in the generated document, so the runtime can map error positions (which
 * the browser reports in document coordinates or in sourceURL-script coordinates) back to the file.
 */
export type SourceRange = DocumentSourceRange | MarkupSourceRange | ScriptSourceRange;

/**
 * Configuration of the runtime bridge, serialized into the document. Every field is optional: the
 * runtime applies the defaults below (and also accepts `null` or a non-object, meaning all defaults).
 */
export interface RuntimeBridgeConfig {
    /**
     * `false`: console output and the form/link notices are not forwarded; console.error/assert,
     * uncaught errors, rejections, console.clear and REPL answers still are. Default `true`.
     */
    consoleEnabled?: boolean;
    /** Default: opaque ('srcdoc' behaviour). */
    mode?: RuntimeBridgeMode;
    /** Editor files in the document, for error mapping. Default `[]`. */
    ranges?: SourceRange[];
    /** Stamped on every message; commands must carry the same value. Default `0`. */
    renderId?: number;
    /** Replace alert/confirm/prompt with 'dialog-suppressed' notices (renders triggered by typing). */
    suppressDialogs?: boolean;
}

// ─── Values and the object inspector ───────────────────────────────────────────────────────────

/** Kinds of primitive values. `null` is a kind of its own, unlike `typeof`. */
export type PrimitiveValueKind = 'string' | 'number' | 'bigint' | 'boolean' | 'undefined' | 'null' | 'symbol';

/** Kinds of objects the runtime tells apart to preview them like Chrome DevTools. */
export type ObjectValueKind =
    | 'function'
    | 'class'
    | 'window'
    | 'array'
    | 'arguments'
    | 'typedarray'
    | 'arraybuffer'
    | 'dataview'
    | 'map'
    | 'set'
    | 'weakmap'
    | 'weakset'
    | 'weakref'
    | 'date'
    | 'regexp'
    | 'error'
    | 'promise'
    | 'boxed'
    /** A DOM node. */
    | 'node'
    /** NodeList, HTMLCollection or DOMTokenList. */
    | 'domlist'
    | 'object';

/** Classification of any JavaScript value (`classify` in the runtime). */
export type ValueKind = PrimitiveValueKind | ObjectValueKind;

/**
 * Subtypes of values the inspector makes up: a Map entry (`{k => v}`), the [[Entries]] list of a Map
 * or Set, and the `[Exception: …]` text of a property read that threw.
 */
export type SyntheticValueKind = 'entry' | 'entries' | 'exception';

/**
 * A user value as the app sees it: a Chrome-like preview, plus a handle when it can be expanded.
 * The console renders it as `<span class="console-${subtype || type}">`.
 */
export interface RemoteValue {
    /** The primitive kind, or 'object' / 'function'. Synthetic text rows ([[PromiseState]], exceptions) use 'string'. */
    type: PrimitiveValueKind | 'object' | 'function';
    /** Finer kind; absent on a few synthetic text rows ([[PromiseState]], [[Uint8Contents]], [[Exception]]). */
    subtype?: ValueKind | SyntheticValueKind;
    /** One-line preview: `'text'`, `(3) [1, 2, 3]`, `Person {name: 'Ann'}`, `ƒ foo(a)`… */
    preview: string;
    /**
     * Inspector handle of an object; send it in an 'inspect' command to list its properties.
     * Absent for primitives and when the runtime's handle table is full (20000 objects).
     */
    handle?: number;
}

/**
 * A property key that crosses the frame boundary: strings travel as they are, symbols as an id the
 * runtime keeps (only meaningful for the render that produced it).
 */
export type PropertyKeyToken = { string: string; symbol?: undefined } | { symbol: number; string?: undefined };

/**
 * An inspector row with a value: an own data property, a native accessor already read (DOM objects),
 * an internal slot, or an element of an [[Entries]] list.
 */
export interface InspectorValueProperty {
    /** Key as displayed: `name`, `[Symbol(k)]`, `0`, or an internal slot such as `[[Prototype]]`. */
    name: string;
    value: RemoteValue;
    /** `false` renders the key dimmed. Absent on internal slots and on [[Entries]] elements. */
    enumerable?: boolean;
    /**
     * `true` for internal slots: [[Prototype]], [[Entries]], [[PrimitiveValue]], [[Target]],
     * [[PromiseState]], [[PromiseResult]], [[Uint8Contents]], [[Exception]] and an ArrayBuffer's byteLength.
     */
    internal?: boolean;
    /**
     * [[Prototype]] rows only: handle of the object being inspected. Send it back as the `receiver` of
     * the 'inspect' command for the prototype, so getters found there run with the original object as `this`.
     */
    receiver?: number;
    accessor?: undefined;
    hasGetter?: undefined;
    more?: undefined;
}

/**
 * An accessor property whose getter has not run (Chrome's `(...)`): reading it may have side effects,
 * so the app reads it on demand with a 'get-property' command built from these fields.
 */
export interface InspectorAccessorProperty {
    name: string;
    enumerable: boolean;
    accessor: true;
    /** `false` for a setter-only property (rendered as `undefined`). */
    hasGetter: boolean;
    key: PropertyKeyToken;
    /** Handle of the object that owns the accessor (undefined only when the handle table is full). */
    owner: number | undefined;
    /** Handle to use as `this`: the inspected object, also when the accessor lives on one of its prototypes. */
    receiver: number;
    value?: undefined;
    internal?: undefined;
    more?: undefined;
}

/** Last row of a listing cut at 1000 entries. */
export interface InspectorMoreProperty {
    name: '…';
    more: true;
    /** `N more` for own properties; absent when an [[Entries]] list is cut. */
    preview?: string;
    value?: undefined;
    enumerable?: undefined;
    internal?: undefined;
    accessor?: undefined;
    hasGetter?: undefined;
    receiver?: undefined;
}

/** One row of an expanded object: narrow on `more`, then on `accessor`. */
export type InspectorProperty = InspectorValueProperty | InspectorAccessorProperty | InspectorMoreProperty;

/** The handle was unknown (stale render), the key unknown, or listing threw. `error` is shown to the learner. */
export interface InspectFailure {
    ok: false;
    error: string;
    properties?: undefined;
    value?: undefined;
}

/** Answer to an 'inspect' command. */
export interface InspectPropertiesResult {
    ok: true;
    properties: InspectorProperty[];
    value?: undefined;
    error?: undefined;
}

/** Answer to a 'get-property' command: the getter's result (or an `exception` value if it threw). */
export interface GetPropertyResult {
    ok: true;
    value: RemoteValue;
    properties?: undefined;
    error?: undefined;
}

/** Payload of an 'inspect-result' message (ConsoleManager also resolves its timeouts with an `InspectFailure`). */
export type InspectResponse = InspectFailure | InspectPropertiesResult | GetPropertyResult;

// ─── Console output ────────────────────────────────────────────────────────────────────────────

/** A run of plain text; `style` is the CSS of a `%c` directive (the app sanitizes it). */
export interface ConsoleTextPart {
    kind: 'text';
    text: string;
    style?: string;
}

/** An inspectable value (an argument that is not a string, or a `%o` / `%O` substitution). */
export interface ConsoleValuePart {
    kind: 'value';
    value: RemoteValue;
}

/** A console line, in order: Chrome-style format directives already applied. */
export type ConsolePart = ConsoleTextPart | ConsoleValuePart;

/** Severity of a console entry. */
export type ConsoleLevel = 'log' | 'info' | 'debug' | 'warn' | 'error';

/**
 * What produced a 'console' message: the console method (console.groupCollapsed also reports 'group';
 * groupEnd and clear never produce a 'console' message), or a runtime notice: 'form-submit' (a blocked
 * form submission) and 'link' (a link to another site opened in a new tab).
 */
export type ConsoleMessageMethod =
    | 'log'
    | 'info'
    | 'debug'
    | 'warn'
    | 'error'
    | 'dir'
    | 'dirxml'
    | 'table'
    | 'group'
    | 'count'
    | 'countReset'
    | 'time'
    | 'timeLog'
    | 'timeEnd'
    | 'assert'
    | 'trace'
    | 'form-submit'
    | 'link';

/** Output of console.table, already rendered to preview strings. */
export interface ConsoleTable {
    /** `(index)` or `(iteration index)`, then `Key` (Maps), the columns, then `Value`/`Values` if any row is a primitive. */
    header: string[];
    /** One array of cells per row, aligned with `header`. */
    rows: string[][];
    /** More than 1000 rows: only the first 1000 were sent. */
    truncated: boolean;
}

/** A position in a learner's file (already mapped back from the generated document). */
export interface RuntimeLocation {
    path: string;
    /** 1-based. */
    line: number;
    /** 1-based when known, `null` otherwise. */
    column: number | null;
}

/**
 * A parsed stack frame. Frames of the runtime itself and of `<anonymous>` code are dropped; frames of
 * the learner's code are mapped back to the editor file (`mapped: true`).
 */
export interface RuntimeStackFrame {
    functionName: string;
    /** Editor file when mapped; otherwise the script URL's path ('about:srcdoc' for the document). */
    path: string;
    /** 1-based; `0` only on the fallback frame built from an unmapped ErrorEvent without a line. */
    line: number;
    column: number | null;
    /** The original stack line ('' for frames built from an ErrorEvent position). */
    raw: string;
    /** Set when the frame was mapped to an editor file through a `SourceRange`. */
    mapped?: true;
}

// ─── Messages from the preview iframe (source 'learncode-preview') ──────────────────────────────

/** Fields every 'learncode-preview' message carries. */
export interface RuntimeMessageEnvelope {
    source: 'learncode-preview';
    /** `RuntimeBridgeConfig.renderId` (or the shader payload's renderId). */
    renderId: number;
    /** `Date.now()` when the message was created (a message that logs a promise is sent a microtask later). */
    timestamp: number;
}

/** Text fields shared by every message that becomes a console entry. */
interface ConsoleEntryFields {
    /** The entry as styled text runs and inspectable values. */
    parts: ConsolePart[];
    /** Plain-text rendering of `parts` (used for diagnostics, tests, the verify tool and duplicate detection). */
    text: string;
    /** Always `[text]` (kept for older readers). */
    values: string[];
    /** Ids (`groupId`) of the open console groups this entry is nested in, outermost first. */
    groups: number[];
}

/**
 * A console call, or a runtime notice shown as one (blocked form submit, link opened in a new tab,
 * "N console messages dropped"). With `consoleEnabled: false` only level 'error' calls are sent.
 * Sent at most 2000 per second; the excess is summarised by one 'warn' entry.
 */
export interface ConsoleMessage extends RuntimeMessageEnvelope, ConsoleEntryFields {
    kind: 'console';
    level: ConsoleLevel;
    method: ConsoleMessageMethod;
    /** Where the console method was called. Absent on the "messages dropped" notice. */
    location?: RuntimeLocation | null;
    /** Frames of the first Error argument; otherwise the caller's frames for assert/trace; otherwise `[]`. */
    stackFrames: RuntimeStackFrame[];
    /** Raw `stack` of the first Error argument ('' when there is none). */
    stackText: string;
    /** console.group / console.groupCollapsed headers: the id later entries list in `groups`. */
    groupId?: number;
    /** With `groupId`: the group starts collapsed (console.groupCollapsed). */
    collapsed?: boolean;
    /** console.table when the data could be tabulated (`null` only on the fallback described in `RuntimeBridgeMessage`). */
    table?: ConsoleTable | null;
}

/** console.clear() was called: the app empties its console. */
export interface ConsoleClearMessage extends RuntimeMessageEnvelope {
    kind: 'console-clear';
    level: 'log';
    /** 'Console was cleared'. */
    text: string;
    values: string[];
}

/** Fields of an uncaught error / unhandled rejection report. */
interface ErrorReportFields extends ConsoleEntryFields {
    /** `name` of the thrown Error ('' when the thrown value is not an Error; 'NetworkError' for failed script loads). */
    errorName: string;
    /** Best position in the learner's code (first frame with a path and a line), or null. */
    location: RuntimeLocation | null;
    /** `location.path`, or null. */
    path: string | null;
    /** `location.line`, or null. */
    line: number | null;
    /** `location.column`, or null. */
    column: number | null;
    stackFrames: RuntimeStackFrame[];
    /** Raw `stack` of the Error ('' when there is none). */
    stackText: string;
}

/**
 * An uncaught error (`Uncaught TypeError: …`), reported after the page's own `error` listeners ran
 * and not at all if one of them called preventDefault(). Also sent for a <script> that failed to
 * load (`GET … net::ERR_ABORTED 404 (Not Found)`, errorName 'NetworkError').
 */
export interface RuntimeErrorMessage extends RuntimeMessageEnvelope, ErrorReportFields {
    kind: 'runtime-error';
    level: 'error';
}

/** An unhandled promise rejection (`Uncaught (in promise) …`). */
export interface UnhandledRejectionMessage extends RuntimeMessageEnvelope, ErrorReportFields {
    kind: 'unhandled-rejection';
    level: 'error';
}

/** Result of a REPL 'eval' command: a single value part. */
export interface CommandResultMessage extends RuntimeMessageEnvelope, ConsoleEntryFields {
    kind: 'command-result';
    level: 'info';
    /** `ConsoleEvalCommand.commandId`, or null when the command had none. */
    commandId: string | null;
}

/** A REPL 'eval' command threw (`Uncaught …`). */
export interface CommandErrorMessage extends RuntimeMessageEnvelope, ConsoleEntryFields {
    kind: 'command-error';
    level: 'error';
    commandId: string | null;
    stackFrames: RuntimeStackFrame[];
    stackText: string;
}

interface InspectResultEnvelope extends RuntimeMessageEnvelope {
    kind: 'inspect-result';
    level: 'info';
    /** The `requestId` of the 'inspect' or 'get-property' command being answered. */
    requestId: number;
}

/** Answer to an 'inspect' or 'get-property' command. */
export type InspectResultMessage = InspectResultEnvelope & InspectResponse;

/** alert/confirm/prompt was skipped because the render came from typing (`suppressDialogs`). */
export interface DialogSuppressedMessage extends RuntimeMessageEnvelope, ConsoleEntryFields {
    kind: 'dialog-suppressed';
    level: 'info';
    location: RuntimeLocation | null;
}

/**
 * The runtime is installed: sent once, by the runtime <script> near the top of the document (normally
 * before any learner code runs). Hosted previews that never send it are reloaded as srcdoc copies.
 */
export interface RuntimeReadyMessage extends RuntimeMessageEnvelope {
    kind: 'runtime-ready';
    level: 'info';
}

/**
 * Every message the runtime bridge posts to `window.parent`.
 *
 * If posting fails (structured clone error) the runtime posts the message once more with `parts`
 * replaced by a single text part made from `text` and with `table: null`.
 */
export type RuntimeBridgeMessage =
    | ConsoleMessage
    | ConsoleClearMessage
    | RuntimeErrorMessage
    | UnhandledRejectionMessage
    | CommandResultMessage
    | CommandErrorMessage
    | InspectResultMessage
    | DialogSuppressedMessage
    | RuntimeReadyMessage;

/** `kind` of the runtime bridge's messages. */
export type RuntimeBridgeMessageKind = RuntimeBridgeMessage['kind'];

/** Width × height in CSS pixels of a shader canvas. */
export interface ShaderResolution {
    width: number;
    height: number;
}

/** Load state of a shader texture. */
export type ShaderTextureState = 'loading' | 'ready' | 'error' | 'upload-error' | 'missing-asset-base';

export interface ShaderTextureStatus {
    /** Uniform name of the sampler. */
    name: string;
    /** Path of the image inside the topic's assets folder. */
    assetPath: string;
    status: ShaderTextureState;
    /** Natural size once loaded, 0 before. */
    width: number;
    height: number;
}

/** Built-in uniform values of the last frame. */
export interface ShaderBuiltinUniforms {
    /** Seconds since start (excluding paused time). */
    u_time: number;
    /** Seconds since the previous frame (0 while paused). */
    u_delta: number;
    u_resolution: [number, number];
    u_mouse: [number, number];
    u_mouse_pressed: 0 | 1;
    u_frame: number;
}

/** Current value of a custom uniform declared in the example's frontmatter. */
export interface ShaderCustomUniformValue {
    name: string;
    /** GLSL type as written in the frontmatter ('float', 'int', 'bool', 'vec2'…). */
    type: string;
    value: number | number[] | boolean;
}

/**
 * Posted by the shader page script (shaderRenderer.ts), not by the runtime bridge: after a frame
 * (at most every 120 ms) with every field, and whenever a texture changes state with only `textures`.
 */
export interface ShaderStatsMessage extends RuntimeMessageEnvelope {
    kind: 'shader-stats';
    level: 'info';
    textures: ShaderTextureStatus[];
    /** Frame reports only (also for the fields below): frames per second, 0 while paused. */
    fps?: number;
    frame?: number;
    paused?: boolean;
    resolution?: ShaderResolution;
    uniforms?: ShaderBuiltinUniforms;
    customUniforms?: ShaderCustomUniformValue[];
}

/** The learner dragged the canvas resize handle (shader page script). */
export interface ShaderResizeRequestMessage extends RuntimeMessageEnvelope {
    kind: 'shader-resize-request';
    level: 'info';
    resolution: ShaderResolution;
}

/** Messages of the shader page script (same channel as the runtime bridge). */
export type ShaderRuntimeMessage = ShaderStatsMessage | ShaderResizeRequestMessage;

/** Everything that arrives with `source: 'learncode-preview'`: narrow on `kind`. */
export type PreviewFrameMessage = RuntimeBridgeMessage | ShaderRuntimeMessage;

// ─── Messages from theory previews (source 'learncode-theory-preview') ──────────────────────────

/**
 * Posted by the script of a rendered theory page (theoryRenderer.ts) when the learner activates an
 * exercise card: open the exercise in the editor, or show its preview dialog.
 */
export interface TheoryPreviewMessage {
    source: 'learncode-theory-preview';
    renderId: number;
    kind: 'open-exercise' | 'preview-exercise';
    /** Exercise file name taken from the card (never empty). */
    filename: string;
}

// ─── Commands from the app (source 'learncode-console-command') ─────────────────────────────────

interface ConsoleCommandEnvelope {
    source: 'learncode-console-command';
    /** Must equal the document's `RuntimeBridgeConfig.renderId`, or the runtime ignores the command. */
    renderId: number;
}

/**
 * Evaluate a REPL line in the page's global scope (indirect eval; `{a: 1}` is read as an object
 * literal, like Chrome). Answered with 'command-result' or 'command-error'.
 */
export interface ConsoleEvalCommand extends ConsoleCommandEnvelope {
    /** A command without `action` is an eval. */
    action?: 'eval';
    command: string;
    /** Echoed in the answer. */
    commandId?: string;
}

/** List the properties of an object (lazy expansion). Answered with 'inspect-result'. */
export interface ConsoleInspectCommand extends ConsoleCommandEnvelope {
    action: 'inspect';
    /** Echoed in the answer. */
    requestId: number;
    /** `RemoteValue.handle` of the object. */
    handle: number;
    /**
     * Handle of the object to use as `this` for accessors listed in the answer (default: `handle`).
     * When expanding a [[Prototype]] row, pass that row's `receiver`.
     */
    receiver?: number;
}

/** Run the getter of an `InspectorAccessorProperty`. Answered with 'inspect-result'. */
export interface ConsoleGetPropertyCommand extends ConsoleCommandEnvelope {
    action: 'get-property';
    requestId: number;
    /** `InspectorAccessorProperty.owner`. */
    owner: number | undefined;
    /** `InspectorAccessorProperty.key`. */
    key: PropertyKeyToken;
    /** `InspectorAccessorProperty.receiver` (default: the owner). */
    receiver?: number;
}

/** Every command the app sends to the runtime bridge. */
export type ConsoleCommandMessage = ConsoleEvalCommand | ConsoleInspectCommand | ConsoleGetPropertyCommand;

// ─── Commands from the app (source 'learncode-shader-control') ──────────────────────────────────

interface ShaderControlEnvelope {
    source: 'learncode-shader-control';
    renderId: number;
}

/** Commands of the shader panel to the shader page script (it ignores them for another renderId). */
export type ShaderControlMessage = ShaderControlEnvelope &
    (
        | { action: 'set-resolution'; resolution: ShaderResolution }
        | { action: 'set-paused'; paused: boolean }
        /** Restart time, frame count and mouse state. */
        | { action: 'reset-runtime' }
        /** `uniformType` is sent but not read by the page. */
        | { action: 'set-custom-uniform'; name: string; uniformType: string; value: number | number[] | boolean }
        /** Reload every texture (handled by the page; the app currently never sends it). */
        | { action: 'refresh-textures' }
    );
