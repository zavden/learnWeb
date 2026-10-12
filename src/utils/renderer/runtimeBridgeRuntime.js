// Preview runtime bridge.
//
// IMPORTANT: `learncodeRuntimeBridge` is serialized with Function.prototype.toString() and evaluated
// inside the preview iframe (see runtimeBridge.js). It must stay completely self-contained: no imports,
// no references to anything declared outside the function body.
//
// Responsibilities:
// - Chrome-like console capture (log/info/debug/warn/error/table/dir/group/count/time/assert/trace/clear)
//   with format specifiers and an object inspector whose entries the parent can expand lazily.
// - Runtime error / unhandled rejection reporting with stack frames mapped back to editor files/lines.
// - REPL commands, form-submit capture, dialog suppression during live editing, and storage/link/worker
//   shims for opaque-origin (srcdoc) previews.
export function learncodeRuntimeBridge(config) {
    'use strict';

    const cfg = config && typeof config === 'object' ? config : {};
    const win = window;
    const doc = typeof document !== 'undefined' ? document : null;
    const INSTALL_KEY = Symbol.for('learncode.runtimeBridge');
    if (win[INSTALL_KEY]) return;
    try {
        Object.defineProperty(win, INSTALL_KEY, { value: true });
    } catch {
        // Ignore: the guard is only an optimisation.
    }

    // Global loop guard for the guards LearnWeb inserts into loops of inline <script> tags
    // (src/utils/compiler/loopGuard.js; keep the 1200 ms limit and the message in sync). The script
    // block appends its own copy, which simply replaces this one.
    if (typeof win.__lwLoop !== 'function') {
        win.__lwLoop = function __lwLoop(line) {
            const g = win.__lwLoop;
            if (!g.on) {
                g.on = 1;
                g.n = 0;
                g.t = performance.now();
                if (!g.ch) {
                    g.ch = new MessageChannel();
                    g.ch.port1.onmessage = () => { g.on = 0; };
                }
                g.ch.port2.postMessage(0);
                return false;
            }
            if ((++g.n & 63) !== 0 || performance.now() - g.t <= 1200) return false;
            g.on = 0;
            g.msg = 'Possible infinite loop at line ' + line + ': it kept running for more than 1.2s without letting the page update, so LearnWeb stopped it. (Add "loop_protect: false" to the example frontmatter to disable this guard.)';
            return true;
        };
    }

    const RENDER_ID = cfg.renderId == null ? 0 : cfg.renderId;
    const MESSAGE_SOURCE = 'learncode-preview';
    const COMMAND_SOURCE = 'learncode-console-command';
    const RUNTIME_NAME = 'learncode-runtime.js';
    const CONSOLE_ENABLED = cfg.consoleEnabled !== false;
    const RANGES = Array.isArray(cfg.ranges) ? cfg.ranges : [];
    const OPAQUE_MODE = cfg.mode !== 'hosted';
    const PREVIEW_PROPS = 8;
    const PREVIEW_ITEMS = 100;
    const STRING_PREVIEW = 120;
    const EXPAND_LIMIT = 1000;
    const MAX_HANDLES = 20000;
    const FLOOD_LIMIT = 2000;
    const TOP_STRING_LIMIT = 20000;

    // Natives captured before user code can patch them.
    const objToString = Object.prototype.toString;
    const hasOwn = Object.prototype.hasOwnProperty;
    const getProto = Object.getPrototypeOf;
    const getOwnDesc = Object.getOwnPropertyDescriptor;
    const ownKeys = Reflect.ownKeys;
    const reflectGet = Reflect.get;
    const fnToString = Function.prototype.toString;
    const isArray = Array.isArray;
    const arrayFrom = Array.from;
    const NativeError = Error;
    const NativePromise = Promise;
    const promiseThen = Promise.prototype.then;
    const NativeMap = Map;
    const NativeWeakMap = WeakMap;
    const mapSize = getOwnDesc(Map.prototype, 'size').get;
    const setSize = getOwnDesc(Set.prototype, 'size').get;
    const mapEntries = Map.prototype.entries;
    const setValues = Set.prototype.values;
    const weakMapHas = WeakMap.prototype.has;
    const weakSetHas = WeakSet.prototype.has;
    const dateGetTime = Date.prototype.getTime;
    const dateToString = Date.prototype.toString;
    const regexpToString = RegExp.prototype.toString;
    const typedArrayProto = getProto(Uint8Array.prototype);
    const typedArrayLength = getOwnDesc(typedArrayProto, 'length').get;
    const typedArrayTag = getOwnDesc(typedArrayProto, Symbol.toStringTag).get;
    const arrayBufferByteLength = getOwnDesc(ArrayBuffer.prototype, 'byteLength').get;
    const symbolToString = Symbol.prototype.toString;
    const nativeSetTimeout = typeof win.setTimeout === 'function' ? win.setTimeout.bind(win) : null;
    const nowMs = () => (win.performance && typeof win.performance.now === 'function' ? win.performance.now() : Date.now());
    const parentWin = win.parent;
    const DOC_PATH = normalizePath(win.location ? String(win.location.href || '') : '');

    // ─── Messaging ─────────────────────────────────────────

    const outbox = [];

    function send(message) {
        try {
            parentWin.postMessage(message, '*');
        } catch {
            try {
                parentWin.postMessage({
                    ...message,
                    parts: [{ kind: 'text', text: String(message.text || '') }],
                    table: null,
                }, '*');
            } catch {
                // Ignore bridge failures so preview execution can continue.
            }
        }
    }

    function createMessage(kind, level, extra) {
        return {
            source: MESSAGE_SOURCE,
            renderId: RENDER_ID,
            kind,
            level,
            timestamp: Date.now(),
            ...extra,
        };
    }

    // Messages are delivered in order. A message containing a top-level Promise waits for one microtask
    // checkpoint so its preview reflects the state the promise had when it was logged.
    function enqueue(message, ctx) {
        const promises = ctx && ctx.promises ? ctx.promises : [];
        const item = { message, ready: promises.length === 0, promises };
        if (item.ready && outbox.length === 0) {
            send(message);
            return;
        }
        outbox.push(item);
        if (!item.ready) {
            promiseThen.call(NativePromise.resolve(), () => {
                item.ready = true;
                drainOutbox();
            });
        }
    }

    function drainOutbox() {
        while (outbox.length > 0 && outbox[0].ready) {
            const item = outbox.shift();
            if (item.promises.length > 0) finalizePromiseTokens(item.message, item.promises);
            send(item.message);
        }
    }

    function finalizePromiseTokens(message, promises) {
        const replaceTokens = (text) => {
            let next = String(text);
            promises.forEach((entry) => {
                if (next.includes(entry.token)) next = next.split(entry.token).join(promiseStatePreview(entry.promise));
            });
            return next;
        };

        if (typeof message.text === 'string') message.text = replaceTokens(message.text);
        if (Array.isArray(message.values)) message.values = message.values.map(replaceTokens);
        if (Array.isArray(message.parts)) {
            message.parts.forEach((part) => {
                if (part.kind === 'text') part.text = replaceTokens(part.text);
                if (part.kind === 'value' && part.value) part.value.preview = replaceTokens(part.value.preview);
            });
        }
    }

    let floodWindowStart = 0;
    let floodCount = 0;
    let floodDropped = 0;
    let floodTimer = 0;

    function reportDroppedMessages() {
        if (!floodDropped) return;
        const dropped = floodDropped;
        floodDropped = 0;
        const text = dropped + ' console message' + (dropped === 1 ? '' : 's') + ' dropped (more than ' + FLOOD_LIMIT + ' per second).';
        enqueue(createMessage('console', 'warn', {
            method: 'warn',
            parts: [{ kind: 'text', text }],
            text,
            values: [text],
            groups: [],
            stackFrames: [],
            stackText: '',
        }));
    }

    function allowConsoleMessage() {
        const time = Date.now();
        if (time - floodWindowStart >= 1000) {
            reportDroppedMessages();
            floodWindowStart = time;
            floodCount = 0;
        }
        floodCount += 1;
        if (floodCount <= FLOOD_LIMIT) return true;
        floodDropped += 1;
        if (!floodTimer && nativeSetTimeout) {
            floodTimer = nativeSetTimeout(() => {
                floodTimer = 0;
                reportDroppedMessages();
            }, 1000);
        }
        return false;
    }

    // ─── Stack frames and source mapping ───────────────────

    function normalizePath(value) {
        let text = String(value || '').trim();
        if (!text) return '';

        try {
            if (/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) {
                const url = new URL(text);
                if (url.protocol === 'http:' || url.protocol === 'https:') {
                    text = url.pathname || text;
                }
            }
        } catch {
            // Keep the original text.
        }

        if (/^about:srcdoc/i.test(text)) return 'about:srcdoc';
        return text.replace(/^\/+/, '');
    }

    function parseStackFrames(stack) {
        return String(stack || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                let match = line.match(/^at\s+(.*?)\s+\((.+):(\d+):(\d+)\)$/);
                if (match) {
                    return { functionName: match[1] || '', path: normalizePath(match[2]), line: Number(match[3]), column: Number(match[4]), raw: line };
                }
                match = line.match(/^at\s+(.+):(\d+):(\d+)$/);
                if (match) {
                    return { functionName: '', path: normalizePath(match[1]), line: Number(match[2]), column: Number(match[3]), raw: line };
                }
                match = line.match(/^(.*?)@(.+):(\d+):(\d+)$/);
                if (match) {
                    return { functionName: match[1] || '', path: normalizePath(match[2]), line: Number(match[3]), column: Number(match[4]), raw: line };
                }
                return null;
            })
            .filter(Boolean);
    }

    function isDocumentPath(path) {
        return path === DOC_PATH || path === 'about:srcdoc' || path === '';
    }

    function applySourceMap(range, line, column) {
        const lineMap = Array.isArray(range.lineMap) ? range.lineMap : null;
        if (!lineMap) {
            return { path: range.path, line, column, mapped: true };
        }

        for (let candidate = line; candidate >= 1 && candidate > line - 60; candidate -= 1) {
            const entry = lineMap[candidate];
            if (Array.isArray(entry)) {
                const sources = Array.isArray(range.sources) ? range.sources : [];
                const source = String(sources[entry[0]] || range.path || '').replace(/^\.\//, '');
                return { path: source || range.path, line: entry[1], column: candidate === line ? column : null, mapped: true };
            }
        }

        return { path: range.compiledPath || range.path, line, column };
    }

    // `absolute`: the line/column are relative to the whole HTML document (ErrorEvent, inline handlers).
    // Otherwise lines are relative to the script element (stack frames of scripts with a sourceURL).
    function mapFrame(frame, absolute) {
        if (!frame) return null;
        const path = frame.path || '';
        if (path === RUNTIME_NAME || path.endsWith('/' + RUNTIME_NAME)) return null;
        if (/<anonymous>/.test(path)) return null;
        const line = Number(frame.line) || 0;
        const column = Number(frame.column) || null;

        for (const range of RANGES) {
            if (!range.sourceName || path !== range.sourceName) continue;
            const isAbsolute = absolute && line >= range.startLine;
            const relativeLine = isAbsolute ? line - range.startLine + 1 : line;
            const relativeColumn = isAbsolute && line === range.startLine && column ? column - range.startColumn : column;
            return { ...frame, ...applySourceMap(range, relativeLine, relativeColumn) };
        }

        if (isDocumentPath(path) && line) {
            for (const range of RANGES) {
                if (line < range.startLine || line > range.endLine) continue;
                const relativeLine = line - range.startLine + 1;
                const relativeColumn = line === range.startLine && column ? column - range.startColumn : column;
                return { ...frame, ...applySourceMap(range, relativeLine, relativeColumn) };
            }
        }

        return { ...frame };
    }

    function mapFrames(frames, absolute) {
        return frames.map((frame) => mapFrame(frame, absolute)).filter(Boolean);
    }

    function captureCallerFrames() {
        try {
            return mapFrames(parseStackFrames(new NativeError().stack), false);
        } catch {
            return [];
        }
    }

    function primaryLocation(frames) {
        const frame = frames.find((entry) => entry && entry.path && entry.line);
        return frame ? { path: frame.path, line: frame.line, column: frame.column || null } : null;
    }

    // ─── Value classification ──────────────────────────────

    function brand(getter, value) {
        try {
            getter.call(value);
            return true;
        } catch {
            return false;
        }
    }

    function safeTag(value) {
        try {
            return objToString.call(value);
        } catch {
            return '[object Object]';
        }
    }

    function isClassFunction(value) {
        try {
            return /^class[\s{]/.test(fnToString.call(value));
        } catch {
            return false;
        }
    }

    function isDomNode(value) {
        try {
            return typeof win.Node === 'function' && value instanceof win.Node;
        } catch {
            return false;
        }
    }

    function classify(value) {
        if (value === null) return 'null';
        const type = typeof value;
        if (type !== 'object' && type !== 'function') return type;
        if (type === 'function') return isClassFunction(value) ? 'class' : 'function';
        if (value === win) return 'window';

        let arrayCheck = false;
        try {
            arrayCheck = isArray(value);
        } catch {
            arrayCheck = false;
        }
        if (arrayCheck) return 'array';

        const tag = safeTag(value);
        switch (tag) {
            case '[object Map]': if (brand(mapSize, value)) return 'map'; break;
            case '[object Set]': if (brand(setSize, value)) return 'set'; break;
            case '[object WeakMap]': if (brand(function () { return weakMapHas.call(this, {}); }, value)) return 'weakmap'; break;
            case '[object WeakSet]': if (brand(function () { return weakSetHas.call(this, {}); }, value)) return 'weakset'; break;
            case '[object WeakRef]': return 'weakref';
            case '[object Date]': if (brand(dateGetTime, value)) return 'date'; break;
            case '[object RegExp]': return 'regexp';
            case '[object Error]': return 'error';
            case '[object Promise]': return 'promise';
            case '[object ArrayBuffer]':
            case '[object SharedArrayBuffer]': return 'arraybuffer';
            case '[object DataView]': return 'dataview';
            case '[object Arguments]': return 'arguments';
            case '[object Number]':
            case '[object String]':
            case '[object Boolean]':
            case '[object BigInt]':
            case '[object Symbol]': if (boxedPrimitive(value) !== undefined) return 'boxed'; break;
            case '[object Window]': return 'window';
            default: break;
        }

        try {
            if (ArrayBuffer.isView(value)) return 'typedarray';
        } catch {
            // Ignore.
        }
        if (isDomNode(value)) return 'node';
        try {
            if (value instanceof NativeError) return 'error';
        } catch {
            // Ignore.
        }
        return 'object';
    }

    function boxedPrimitive(value) {
        const candidates = [Number.prototype.valueOf, String.prototype.valueOf, Boolean.prototype.valueOf];
        if (typeof BigInt === 'function') candidates.push(BigInt.prototype.valueOf);
        candidates.push(Symbol.prototype.valueOf);
        for (const valueOf of candidates) {
            try {
                return { value: valueOf.call(value) };
            } catch {
                // Try the next primitive wrapper.
            }
        }
        return undefined;
    }

    function isErrorValue(value) {
        return value !== null && typeof value === 'object' && classify(value) === 'error';
    }

    function safeGet(target, key, receiver) {
        try {
            return { ok: true, value: reflectGet(target, key, receiver === undefined ? target : receiver) };
        } catch (error) {
            return { ok: false, error };
        }
    }

    function safeProto(value) {
        try {
            return getProto(value);
        } catch {
            return undefined;
        }
    }

    function constructorName(value) {
        let proto = safeProto(value);
        let guard = 0;
        while (proto && guard < 50) {
            guard += 1;
            let descriptor = null;
            try {
                descriptor = getOwnDesc(proto, 'constructor');
            } catch {
                descriptor = null;
            }
            if (descriptor && 'value' in descriptor && typeof descriptor.value === 'function') {
                const name = functionName(descriptor.value);
                if (name) return name;
            }
            proto = safeProto(proto);
        }
        return '';
    }

    function functionName(fn) {
        try {
            const descriptor = getOwnDesc(fn, 'name');
            return descriptor && typeof descriptor.value === 'string' ? descriptor.value : '';
        } catch {
            return '';
        }
    }

    function prototypeOwner(value) {
        try {
            const descriptor = getOwnDesc(value, 'constructor');
            const ctor = descriptor && 'value' in descriptor ? descriptor.value : null;
            if (typeof ctor === 'function') {
                const protoDescriptor = getOwnDesc(ctor, 'prototype');
                if (protoDescriptor && protoDescriptor.value === value) return ctor;
            }
        } catch {
            // Ignore.
        }
        return null;
    }

    function safeKeys(value) {
        try {
            return ownKeys(value);
        } catch {
            return [];
        }
    }

    function isIndexKey(key) {
        return typeof key === 'string' && /^(?:0|[1-9]\d*)$/.test(key) && Number(key) < 4294967295;
    }

    function previewKeys(value, { includeIndices = true } = {}) {
        const includeHidden = Boolean(prototypeOwner(value));
        return safeKeys(value).filter((key) => {
            if (!includeIndices && isIndexKey(key)) return false;
            let descriptor = null;
            try {
                descriptor = getOwnDesc(value, key);
            } catch {
                return false;
            }
            if (!descriptor) return false;
            return descriptor.enumerable || includeHidden;
        });
    }

    // ─── Formatting ────────────────────────────────────────

    function truncate(text, limit) {
        const value = String(text);
        return value.length > limit ? value.slice(0, limit) + '…' : value;
    }

    function quoteString(text, limit = STRING_PREVIEW) {
        const value = truncate(text, limit);
        const quote = value.includes("'") && !value.includes('"') ? '"' : "'";
        const escaped = value
            .replace(/\\/g, '\\\\')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t')
            .split(quote).join('\\' + quote);
        return quote + escaped + quote;
    }

    function symbolText(symbol) {
        try {
            return symbolToString.call(symbol);
        } catch {
            return 'Symbol()';
        }
    }

    function formatKey(key) {
        if (typeof key === 'symbol') return '[' + symbolText(key) + ']';
        if (/^[A-Za-z_$][\w$]*$/.test(key) || isIndexKey(key)) return key;
        return quoteString(key);
    }

    function formatPrimitive(value, kind, quoted) {
        switch (kind) {
            case 'string': return quoted ? quoteString(value) : truncate(value, TOP_STRING_LIMIT);
            case 'number': return Object.is(value, -0) ? '-0' : String(value);
            case 'bigint': return String(value) + 'n';
            case 'boolean': return String(value);
            case 'undefined': return 'undefined';
            case 'null': return 'null';
            case 'symbol': return symbolText(value);
            default: return String(value);
        }
    }

    function isPrimitiveKind(kind) {
        return kind === 'string' || kind === 'number' || kind === 'bigint' || kind === 'boolean'
            || kind === 'undefined' || kind === 'null' || kind === 'symbol';
    }

    function errorHeadline(error) {
        const nameResult = safeGet(error, 'name');
        const messageResult = safeGet(error, 'message');
        const name = nameResult.ok && typeof nameResult.value === 'string' && nameResult.value ? nameResult.value : 'Error';
        const message = messageResult.ok && messageResult.value != null ? String(messageResult.value) : '';
        return message ? name + ': ' + message : name;
    }

    function dateText(value) {
        try {
            return dateToString.call(value);
        } catch {
            return 'Invalid Date';
        }
    }

    function regexpText(value) {
        try {
            return regexpToString.call(value);
        } catch {
            return '/(?:)/';
        }
    }

    function lengthOf(value) {
        const result = safeGet(value, 'length');
        return result.ok && typeof result.value === 'number' ? result.value : 0;
    }

    function typedArrayInfo(value) {
        try {
            return { name: typedArrayTag.call(value) || 'TypedArray', length: typedArrayLength.call(value) };
        } catch {
            return { name: 'DataView', length: 0 };
        }
    }

    function byteLengthOf(value) {
        try {
            return arrayBufferByteLength.call(value);
        } catch {
            const result = safeGet(value, 'byteLength');
            return result.ok ? Number(result.value) || 0 : 0;
        }
    }

    function nodeLabel(node) {
        try {
            const type = node.nodeType;
            if (type === 1) {
                const tag = String(node.localName || node.tagName || 'element').toLowerCase();
                const id = node.id ? '#' + node.id : '';
                const className = typeof node.className === 'string' && node.className.trim()
                    ? '.' + node.className.trim().split(/\s+/).join('.')
                    : '';
                return '<' + tag + id + className + '>';
            }
            if (type === 3) return '#text ' + quoteString(node.data || '', 60);
            if (type === 8) return '<!--' + truncate(node.data || '', 60) + '-->';
            if (type === 9) return '#document';
            if (type === 11) return '#document-fragment';
            return String(node.nodeName || 'Node');
        } catch {
            return 'Node';
        }
    }

    function functionSignature(fn) {
        if (isClassFunction(fn)) return 'class ' + (functionName(fn) || '(anonymous)');
        let source = '';
        try {
            source = fnToString.call(fn);
        } catch {
            source = '';
        }
        const isArrow = /^(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(source);
        if (isArrow) return truncate(source.replace(/\s+/g, ' '), 60);
        const paramsMatch = source.match(/^[^(]*\(([^)]*)\)/);
        const params = paramsMatch ? paramsMatch[1].replace(/\s+/g, ' ').trim() : '';
        const isAsync = /^async\b/.test(source);
        return (isAsync ? 'async ' : '') + 'ƒ ' + (functionName(fn) || '') + '(' + params + ')';
    }

    function functionSource(fn) {
        let source = '';
        try {
            source = fnToString.call(fn);
        } catch {
            return functionSignature(fn);
        }
        source = truncate(source, 4000);
        if (/^class[\s{]/.test(source)) return source;
        if (/^(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>/.test(source)) return source;
        const replaced = source.replace(/^(async\s+)?function\b\s*/, (match, asyncPrefix) => (asyncPrefix ? 'async ' : '') + 'ƒ ');
        if (replaced !== source) return replaced;
        return 'ƒ ' + source;
    }

    // Compact preview used inside other previews: `{…}`, `Array(3)`, `ƒ`, `'text'`.
    function shortPreview(value) {
        const kind = classify(value);
        if (isPrimitiveKind(kind)) return formatPrimitive(value, kind, true);
        switch (kind) {
            case 'function': return 'ƒ';
            case 'class': return 'class ' + (functionName(value) || '(anonymous)');
            case 'array': {
                const name = constructorName(value);
                return (name && name !== 'Array' ? name : 'Array') + '(' + lengthOf(value) + ')';
            }
            case 'typedarray': {
                const info = typedArrayInfo(value);
                return info.name + '(' + info.length + ')';
            }
            case 'map': return 'Map(' + mapSize.call(value) + ')';
            case 'set': return 'Set(' + setSize.call(value) + ')';
            case 'weakmap': return 'WeakMap';
            case 'weakset': return 'WeakSet';
            case 'weakref': return 'WeakRef';
            case 'date': return dateText(value);
            case 'regexp': return regexpText(value);
            case 'error': return errorHeadline(value);
            case 'promise': return 'Promise';
            case 'arraybuffer': return 'ArrayBuffer(' + byteLengthOf(value) + ')';
            case 'dataview': return 'DataView(' + byteLengthOf(value) + ')';
            case 'arguments': return 'Arguments(' + lengthOf(value) + ')';
            case 'boxed': {
                const boxed = boxedPrimitive(value);
                return boxedTypeName(boxed && boxed.value);
            }
            case 'window': return 'Window';
            case 'node': return nodeLabel(value);
            default: {
                const proto = safeProto(value);
                if (proto === null) return '[Object: null prototype] ' + (safeKeys(value).length ? '{…}' : '{}');
                const name = constructorName(value);
                if (name && name !== 'Object') return name;
                return safeKeys(value).length ? '{…}' : '{}';
            }
        }
    }

    function boxedTypeName(primitive) {
        switch (typeof primitive) {
            case 'number': return 'Number';
            case 'string': return 'String';
            case 'boolean': return 'Boolean';
            case 'bigint': return 'BigInt';
            case 'symbol': return 'Symbol';
            default: return 'Object';
        }
    }

    function propertyPreview(target, key) {
        let descriptor = null;
        try {
            descriptor = getOwnDesc(target, key);
        } catch {
            return '[Exception]';
        }
        if (!descriptor) return 'undefined';
        if (!('value' in descriptor)) return '(...)';
        return shortPreview(descriptor.value);
    }

    function collectionItems(value, kind) {
        const items = [];
        let total = 0;
        try {
            if (kind === 'map') {
                total = mapSize.call(value);
                const iterator = mapEntries.call(value);
                for (let step = iterator.next(); !step.done && items.length < PREVIEW_PROPS; step = iterator.next()) {
                    items.push(shortPreview(step.value[0]) + ' => ' + shortPreview(step.value[1]));
                }
            } else {
                total = setSize.call(value);
                const iterator = setValues.call(value);
                for (let step = iterator.next(); !step.done && items.length < PREVIEW_PROPS; step = iterator.next()) {
                    items.push(shortPreview(step.value));
                }
            }
        } catch {
            // Ignore iteration failures.
        }
        if (total > items.length) items.push('…');
        return items;
    }

    function arrayLikePreviewItems(value, length) {
        const items = [];
        const limit = Math.min(length, PREVIEW_ITEMS);
        let holes = 0;
        const flushHoles = () => {
            if (!holes) return;
            items.push(holes === 1 ? 'empty' : 'empty × ' + holes);
            holes = 0;
        };
        for (let index = 0; index < limit; index += 1) {
            let present = false;
            try {
                present = hasOwn.call(value, index);
            } catch {
                present = false;
            }
            if (!present) {
                holes += 1;
                continue;
            }
            flushHoles();
            items.push(propertyPreview(value, String(index)));
        }
        flushHoles();
        if (length > limit) items.push('…');
        return items;
    }

    function objectEntriesPreview(value, keys) {
        const items = keys.slice(0, PREVIEW_PROPS).map((key) => formatKey(key) + ': ' + propertyPreview(value, key));
        if (keys.length > PREVIEW_PROPS) items.push('…');
        return items;
    }

    // One-level preview used for top-level console arguments and expanded property rows.
    function fullPreview(value, ctx, mode) {
        const kind = classify(value);
        if (isPrimitiveKind(kind)) return formatPrimitive(value, kind, true);
        switch (kind) {
            case 'function':
            case 'class':
                return mode === 'top' ? functionSource(value) : functionSignature(value);
            case 'array':
            case 'arguments': {
                const length = lengthOf(value);
                const name = kind === 'arguments' ? 'Arguments' : constructorName(value);
                const items = arrayLikePreviewItems(value, length);
                const extraKeys = previewKeys(value, { includeIndices: false }).filter((key) => key !== 'length');
                objectEntriesPreview(value, extraKeys).forEach((item) => items.push(item));
                const prefix = name && name !== 'Array' ? name + '(' + length + ')' : '(' + length + ')';
                return prefix + ' [' + items.join(', ') + ']';
            }
            case 'typedarray': {
                const info = typedArrayInfo(value);
                return info.name + '(' + info.length + ') [' + arrayLikePreviewItems(value, info.length).join(', ') + ']';
            }
            case 'map': return 'Map(' + mapSize.call(value) + ') {' + collectionItems(value, 'map').join(', ') + '}';
            case 'set': return 'Set(' + setSize.call(value) + ') {' + collectionItems(value, 'set').join(', ') + '}';
            case 'weakmap': return 'WeakMap {}';
            case 'weakset': return 'WeakSet {}';
            case 'weakref': return 'WeakRef {}';
            case 'promise': return promisePreview(value, ctx, mode);
            case 'boxed': {
                const boxed = boxedPrimitive(value);
                const primitive = boxed ? boxed.value : undefined;
                return boxedTypeName(primitive) + ' {' + formatPrimitive(primitive, classify(primitive), true) + '}';
            }
            case 'object': {
                const proto = safeProto(value);
                let prefix = '';
                if (proto === null) {
                    prefix = '[Object: null prototype] ';
                } else {
                    const name = constructorName(value);
                    if (name && name !== 'Object') {
                        prefix = name + ' ';
                    } else {
                        const tag = safeGet(value, Symbol.toStringTag);
                        if (tag.ok && typeof tag.value === 'string' && tag.value && tag.value !== 'Object') prefix = tag.value + ' ';
                    }
                }
                return prefix + '{' + objectEntriesPreview(value, previewKeys(value)).join(', ') + '}';
            }
            default:
                return shortPreview(value);
        }
    }

    // ─── Promises ──────────────────────────────────────────

    const promiseStates = new NativeWeakMap();
    let promiseTokenSeq = 0;

    function trackPromise(promise) {
        let record = promiseStates.get(promise);
        if (record) return record;
        record = { state: 'pending', value: undefined };
        promiseStates.set(promise, record);
        try {
            // Note: observing a promise marks it as handled, so a logged promise that later rejects
            // is shown as `<rejected>` instead of producing an "Uncaught (in promise)" report.
            promiseThen.call(promise, (value) => {
                record.state = 'fulfilled';
                record.value = value;
            }, (reason) => {
                record.state = 'rejected';
                record.value = reason;
            });
        } catch {
            // Not a real promise.
        }
        return record;
    }

    function promiseStatePreview(promise) {
        const record = promiseStates.get(promise) || { state: 'pending' };
        if (record.state === 'pending') return 'Promise {<pending>}';
        return 'Promise {<' + record.state + '>: ' + shortPreview(record.value) + '}';
    }

    function promisePreview(promise, ctx, mode) {
        if (mode === 'top' && ctx && Array.isArray(ctx.promises)) {
            trackPromise(promise);
            promiseTokenSeq += 1;
            const token = '\u0000LCPROMISE' + promiseTokenSeq + '\u0000';
            ctx.promises.push({ token, promise });
            return token;
        }
        const record = promiseStates.get(promise);
        return record ? promiseStatePreview(promise) : 'Promise {…}';
    }

    // ─── Handles for lazy expansion ────────────────────────

    const handles = new NativeMap();
    const handleIds = new NativeWeakMap();
    const symbolKeys = new NativeMap();
    let nextHandle = 1;
    let nextSymbolKey = 1;

    function EntriesView(kind, owner) {
        this.kind = kind;
        this.owner = owner;
    }

    function EntryView(key, value) {
        this.key = key;
        this.value = value;
    }

    function handleFor(value, dedupe = true) {
        if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return undefined;
        if (dedupe) {
            const existing = handleIds.get(value);
            if (existing) return existing;
        }
        if (handles.size >= MAX_HANDLES) return undefined;
        const id = nextHandle;
        nextHandle += 1;
        handles.set(id, value);
        if (dedupe) handleIds.set(value, id);
        return id;
    }

    function keyToken(key) {
        if (typeof key !== 'symbol') return { string: String(key) };
        const id = nextSymbolKey;
        nextSymbolKey += 1;
        symbolKeys.set(id, key);
        return { symbol: id };
    }

    function resolveKeyToken(token) {
        if (token && typeof token.string === 'string') return token.string;
        if (token && symbolKeys.has(token.symbol)) return symbolKeys.get(token.symbol);
        return undefined;
    }

    function describe(value, mode, ctx) {
        const kind = classify(value);
        if (isPrimitiveKind(kind)) {
            return { type: kind, subtype: kind, preview: formatPrimitive(value, kind, true) };
        }
        const descriptor = {
            type: typeof value === 'function' ? 'function' : 'object',
            subtype: kind,
            preview: mode === 'proto' ? prototypeLabel(value) : fullPreview(value, ctx, mode),
        };
        const handle = handleFor(value);
        if (handle) descriptor.handle = handle;
        return descriptor;
    }

    function prototypeLabel(value) {
        const owner = prototypeOwner(value);
        const ownerName = owner ? functionName(owner) : '';
        if (ownerName) return ownerName + '.prototype';
        return shortPreview(value);
    }

    function inspectProperties(target, receiverHandle) {
        const properties = [];

        if (target instanceof EntriesView) {
            let index = 0;
            try {
                const iterator = target.kind === 'map' ? mapEntries.call(target.owner) : setValues.call(target.owner);
                for (let step = iterator.next(); !step.done; step = iterator.next()) {
                    if (index >= EXPAND_LIMIT) {
                        properties.push({ name: '…', more: true });
                        break;
                    }
                    if (target.kind === 'map') {
                        const entry = new EntryView(step.value[0], step.value[1]);
                        properties.push({
                            name: String(index),
                            value: {
                                type: 'object',
                                subtype: 'entry',
                                preview: '{' + shortPreview(entry.key) + ' => ' + shortPreview(entry.value) + '}',
                                handle: handleFor(entry, false),
                            },
                        });
                    } else {
                        properties.push({ name: String(index), value: describe(step.value, 'prop') });
                    }
                    index += 1;
                }
            } catch (error) {
                properties.push({ name: '[[Exception]]', internal: true, value: { type: 'string', preview: errorHeadline(error) } });
            }
            return properties;
        }

        if (target instanceof EntryView) {
            properties.push({ name: 'key', value: describe(target.key, 'prop') });
            properties.push({ name: 'value', value: describe(target.value, 'prop') });
            return properties;
        }

        const kind = classify(target);
        let keys = [];
        try {
            keys = ownKeys(target);
        } catch (error) {
            properties.push({ name: '[[Exception]]', internal: true, value: { type: 'string', preview: errorHeadline(error) } });
        }

        let count = 0;
        for (const key of keys) {
            if (count >= EXPAND_LIMIT) {
                properties.push({ name: '…', more: true, preview: (keys.length - count) + ' more' });
                break;
            }
            let descriptor = null;
            try {
                descriptor = getOwnDesc(target, key);
            } catch {
                descriptor = null;
            }
            if (!descriptor) continue;
            count += 1;
            const item = {
                name: typeof key === 'symbol' ? '[' + symbolText(key) + ']' : key,
                enumerable: Boolean(descriptor.enumerable),
            };
            if ('value' in descriptor) {
                item.value = describe(descriptor.value, 'prop');
            } else {
                item.accessor = true;
                item.hasGetter = typeof descriptor.get === 'function';
                item.key = keyToken(key);
                item.owner = handleFor(target);
                item.receiver = receiverHandle;
            }
            properties.push(item);
        }

        if (kind === 'map' || kind === 'set') {
            const size = kind === 'map' ? mapSize.call(target) : setSize.call(target);
            properties.push({
                name: '[[Entries]]',
                internal: true,
                value: { type: 'object', subtype: 'entries', preview: 'Array(' + size + ')', handle: handleFor(new EntriesView(kind, target), false) },
            });
        }
        if (kind === 'boxed') {
            const boxed = boxedPrimitive(target);
            properties.push({ name: '[[PrimitiveValue]]', internal: true, value: describe(boxed ? boxed.value : undefined, 'prop') });
        }
        if (kind === 'weakref') {
            const deref = safeGet(target, 'deref');
            let referent;
            try {
                referent = typeof deref.value === 'function' ? deref.value.call(target) : undefined;
            } catch {
                referent = undefined;
            }
            properties.push({ name: '[[Target]]', internal: true, value: describe(referent, 'prop') });
        }
        if (kind === 'arraybuffer') {
            try {
                const bytes = new Uint8Array(target, 0, Math.min(byteLengthOf(target), 64));
                const hex = arrayFrom(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');
                properties.push({ name: '[[Uint8Contents]]', internal: true, value: { type: 'string', preview: '<' + hex + (byteLengthOf(target) > 64 ? ' …' : '') + '>' } });
            } catch {
                // Detached buffers.
            }
            properties.push({ name: 'byteLength', internal: true, value: describe(byteLengthOf(target), 'prop') });
        }
        if (kind === 'promise') {
            const record = trackPromise(target);
            properties.push({ name: '[[PromiseState]]', internal: true, value: { type: 'string', preview: "'" + record.state + "'" } });
            if (record.state !== 'pending') {
                properties.push({ name: '[[PromiseResult]]', internal: true, value: describe(record.value, 'prop') });
            }
        }

        const proto = safeProto(target);
        if (proto !== null && proto !== undefined) {
            properties.push({ name: '[[Prototype]]', internal: true, value: describe(proto, 'proto'), receiver: receiverHandle });
        }

        return properties;
    }

    async function handleInspect(data) {
        if (!handles.has(data.handle)) {
            return { ok: false, error: 'This object is no longer available (the preview was re-rendered).' };
        }
        const target = handles.get(data.handle);
        const receiverHandle = handles.has(data.receiver) ? data.receiver : data.handle;
        if (classify(target) === 'promise') {
            trackPromise(target);
            await null;
            await null;
            await null;
        }
        return { ok: true, properties: inspectProperties(target, receiverHandle) };
    }

    function handleGetProperty(data) {
        if (!handles.has(data.owner)) {
            return { ok: false, error: 'This object is no longer available (the preview was re-rendered).' };
        }
        const owner = handles.get(data.owner);
        const receiver = handles.has(data.receiver) ? handles.get(data.receiver) : owner;
        const key = resolveKeyToken(data.key);
        if (key === undefined) return { ok: false, error: 'Unknown property.' };
        const result = safeGet(owner, key, receiver);
        if (!result.ok) {
            return { ok: true, value: { type: 'string', subtype: 'exception', preview: '[Exception: ' + (isErrorValue(result.error) ? errorHeadline(result.error) : shortPreview(result.error)) + ']' } };
        }
        return { ok: true, value: describe(result.value, 'prop') };
    }

    // ─── Console formatting ────────────────────────────────

    function formatArgs(args, ctx) {
        const parts = [];
        let rest = args;

        const pushText = (text, style) => {
            if (text === '') return;
            const last = parts[parts.length - 1];
            if (last && last.kind === 'text' && (last.style || '') === (style || '')) {
                last.text += text;
                return;
            }
            parts.push(style ? { kind: 'text', text, style } : { kind: 'text', text });
        };

        if (typeof args[0] === 'string' && args[0].includes('%')) {
            const format = args[0];
            let argIndex = 1;
            let style = '';
            let buffer = '';
            const flush = () => {
                pushText(buffer, style);
                buffer = '';
            };

            for (let index = 0; index < format.length; index += 1) {
                const char = format[index];
                if (char !== '%' || index === format.length - 1) {
                    buffer += char;
                    continue;
                }
                const spec = format[index + 1];
                if (spec === '%') {
                    buffer += '%';
                    index += 1;
                    continue;
                }
                if (!'sdifoOc'.includes(spec)) {
                    buffer += char;
                    continue;
                }
                if (argIndex >= args.length) {
                    buffer += char + spec;
                    index += 1;
                    continue;
                }
                const arg = args[argIndex];
                argIndex += 1;
                index += 1;
                if (spec === 's') {
                    buffer += typeof arg === 'string' ? arg : shortPreview(arg).replace(/^'(.*)'$/s, '$1');
                } else if (spec === 'd' || spec === 'i') {
                    buffer += typeof arg === 'bigint' ? String(arg) + 'n' : typeof arg === 'symbol' ? 'NaN' : String(Number.parseInt(arg, 10));
                } else if (spec === 'f') {
                    buffer += typeof arg === 'symbol' ? 'NaN' : String(Number.parseFloat(arg));
                } else if (spec === 'o' || spec === 'O') {
                    flush();
                    parts.push({ kind: 'value', value: describe(arg, 'top', ctx) });
                } else if (spec === 'c') {
                    flush();
                    style = typeof arg === 'string' ? arg : '';
                }
            }
            flush();
            rest = args.slice(argIndex);
            if (rest.length > 0 && parts.length > 0) pushText(' ');
        }

        rest.forEach((arg, index) => {
            if (index > 0) pushText(' ');
            if (typeof arg === 'string') {
                pushText(truncate(arg, TOP_STRING_LIMIT));
            } else {
                parts.push({ kind: 'value', value: describe(arg, 'top', ctx) });
            }
        });

        return parts;
    }

    function partsText(parts) {
        return parts.map((part) => (part.kind === 'text' ? part.text : part.value ? part.value.preview : '')).join('');
    }

    function ownEnumerableKeys(value) {
        return safeKeys(value).filter((key) => {
            if (typeof key === 'symbol') return false;
            try {
                const descriptor = getOwnDesc(value, key);
                return Boolean(descriptor && descriptor.enumerable);
            } catch {
                return false;
            }
        });
    }

    function buildTable(data, columnsArg) {
        if (data === null || (typeof data !== 'object' && typeof data !== 'function')) return null;
        const kind = classify(data);
        let entries = [];
        if (kind === 'map') {
            try {
                entries = arrayFrom(mapEntries.call(data)).map((entry, index) => [String(index), entry[1], entry[0]]);
            } catch {
                entries = [];
            }
        } else if (kind === 'set') {
            try {
                entries = arrayFrom(setValues.call(data)).map((value, index) => [String(index), value]);
            } catch {
                entries = [];
            }
        } else {
            entries = ownEnumerableKeys(data).map((key) => {
                const result = safeGet(data, key);
                return [key, result.ok ? result.value : undefined];
            });
        }

        const truncated = entries.length > 1000;
        entries = entries.slice(0, 1000);
        const columns = [];
        const columnSet = new Set();
        let hasValueColumn = false;
        const hasKeyColumn = kind === 'map';
        const rows = entries.map(([key, value, mapKey]) => {
            const row = { key, cells: {}, value: '', mapKey: hasKeyColumn ? shortPreview(mapKey) : '' };
            if (value !== null && (typeof value === 'object' || typeof value === 'function') && classify(value) !== 'date' && classify(value) !== 'regexp') {
                ownEnumerableKeys(value).forEach((columnKey) => {
                    if (!columnSet.has(columnKey)) {
                        columnSet.add(columnKey);
                        columns.push(columnKey);
                    }
                    row.cells[columnKey] = propertyPreview(value, columnKey);
                });
            } else {
                row.value = shortPreview(value);
                hasValueColumn = true;
            }
            return row;
        });

        let selectedColumns = columns;
        if (isArray(columnsArg)) selectedColumns = columnsArg.map((column) => String(column));
        selectedColumns = selectedColumns.slice(0, 20);
        const header = [kind === 'map' || kind === 'set' ? '(iteration index)' : '(index)'];
        if (hasKeyColumn) header.push('Key');
        selectedColumns.forEach((column) => header.push(column));
        if (hasValueColumn) header.push(kind === 'map' || kind === 'set' ? 'Values' : 'Value');

        return {
            header,
            rows: rows.map((row) => {
                const cells = [row.key];
                if (hasKeyColumn) cells.push(row.mapKey);
                selectedColumns.forEach((column) => cells.push(hasOwn.call(row.cells, column) ? row.cells[column] : ''));
                if (hasValueColumn) cells.push(row.value);
                return cells;
            }),
            truncated,
        };
    }

    function describeErrorStack(error) {
        const stackResult = safeGet(error, 'stack');
        const stackText = stackResult.ok && typeof stackResult.value === 'string' ? stackResult.value : '';
        return { frames: mapFrames(parseStackFrames(stackText), false), stackText };
    }

    // ─── Console capture ───────────────────────────────────

    const consoleObject = win.console || {};
    const originals = {};
    const groupStack = [];
    const counters = new NativeMap();
    const timers = new NativeMap();
    let groupSequence = 0;

    function emit(level, args, extra) {
        const options = extra || {};
        if (!CONSOLE_ENABLED && level !== 'error') return;
        if (!allowConsoleMessage()) return;

        const ctx = { promises: [] };
        const parts = formatArgs(args, ctx);
        const callerFrames = captureCallerFrames();
        const firstError = args.find((arg) => isErrorValue(arg));
        let stackFrames = [];
        let stackText = '';
        if (firstError) {
            const described = describeErrorStack(firstError);
            stackFrames = described.frames;
            stackText = described.stackText;
        } else if (options.withStack) {
            stackFrames = callerFrames;
        }

        const text = partsText(parts);
        const message = createMessage('console', level, {
            method: options.method || level,
            parts,
            text,
            values: [text],
            groups: groupStack.slice(),
            location: primaryLocation(callerFrames),
            stackFrames,
            stackText,
        });
        if (options.groupId) {
            message.groupId = options.groupId;
            message.collapsed = Boolean(options.collapsed);
        }
        if (options.table) message.table = options.table;
        enqueue(message, ctx);
    }

    function emitText(level, text, method) {
        emit(level, [text], { method });
    }

    function formatDuration(ms) {
        return Number(ms.toFixed(3)) + ' ms';
    }

    function labelOf(args) {
        return args.length > 0 && args[0] !== undefined ? String(args[0]) : 'default';
    }

    const consoleImplementations = {
        log: (args) => emit('log', args, { method: 'log' }),
        info: (args) => emit('info', args, { method: 'info' }),
        debug: (args) => emit('debug', args, { method: 'debug' }),
        warn: (args) => emit('warn', args, { method: 'warn' }),
        error: (args) => emit('error', args, { method: 'error' }),
        dirxml: (args) => emit('log', args, { method: 'dirxml' }),
        dir: (args) => emit('log', args.slice(0, 1), { method: 'dir' }),
        table: (args) => {
            if (!CONSOLE_ENABLED) return;
            const table = buildTable(args[0], args[1]);
            emit('log', table ? [args[0]] : args, { method: 'table', table });
        },
        group: (args) => {
            groupSequence += 1;
            const id = groupSequence;
            emit('log', args.length ? args : ['console.group'], { method: 'group', groupId: id, collapsed: false });
            groupStack.push(id);
        },
        groupCollapsed: (args) => {
            groupSequence += 1;
            const id = groupSequence;
            emit('log', args.length ? args : ['console.groupCollapsed'], { method: 'group', groupId: id, collapsed: true });
            groupStack.push(id);
        },
        groupEnd: () => {
            groupStack.pop();
        },
        count: (args) => {
            const label = labelOf(args);
            const next = (counters.get(label) || 0) + 1;
            counters.set(label, next);
            emitText('log', label + ': ' + next, 'count');
        },
        countReset: (args) => {
            const label = labelOf(args);
            if (counters.has(label)) {
                counters.set(label, 0);
            } else {
                emitText('warn', "Count for '" + label + "' does not exist", 'countReset');
            }
        },
        time: (args) => {
            const label = labelOf(args);
            if (timers.has(label)) {
                emitText('warn', "Timer '" + label + "' already exists", 'time');
                return;
            }
            timers.set(label, nowMs());
        },
        timeLog: (args) => {
            const label = labelOf(args);
            if (!timers.has(label)) {
                emitText('warn', "Timer '" + label + "' does not exist", 'timeLog');
                return;
            }
            emit('log', [label + ': ' + formatDuration(nowMs() - timers.get(label)), ...args.slice(1)], { method: 'timeLog' });
        },
        timeEnd: (args) => {
            const label = labelOf(args);
            if (!timers.has(label)) {
                emitText('warn', "Timer '" + label + "' does not exist", 'timeEnd');
                return;
            }
            const elapsed = nowMs() - timers.get(label);
            timers.delete(label);
            emitText('log', label + ': ' + formatDuration(elapsed), 'timeEnd');
        },
        assert: (args) => {
            if (args[0]) return;
            const rest = args.slice(1);
            let payload;
            if (rest.length === 0) payload = ['Assertion failed: console.assert'];
            else if (typeof rest[0] === 'string') payload = ['Assertion failed: ' + rest[0], ...rest.slice(1)];
            else payload = ['Assertion failed:', ...rest];
            emit('error', payload, { method: 'assert', withStack: true });
        },
        trace: (args) => emit('log', args.length ? args : ['console.trace'], { method: 'trace', withStack: true }),
        clear: () => {
            groupStack.length = 0;
            enqueue(createMessage('console-clear', 'log', { text: 'Console was cleared', values: ['Console was cleared'] }));
        },
    };

    Object.keys(consoleImplementations).forEach((method) => {
        const original = typeof consoleObject[method] === 'function' ? consoleObject[method].bind(consoleObject) : null;
        originals[method] = original;
        const implementation = consoleImplementations[method];
        try {
            consoleObject[method] = function (...args) {
                try {
                    implementation(args);
                } catch {
                    // Never let the console bridge break user code.
                }
                return original ? original(...args) : undefined;
            };
        } catch {
            // Leave the console untouched if it cannot be reassigned.
        }
    });

    // ─── Errors ────────────────────────────────────────────

    function describeThrown(value, prefix) {
        if (isErrorValue(value)) return prefix + ' ' + errorHeadline(value);
        if (typeof value === 'string') return prefix + ' ' + JSON.stringify(value);
        return prefix + ' ' + fullPreview(value, null, 'prop');
    }

    function errorNameOf(value) {
        if (!isErrorValue(value)) return '';
        const result = safeGet(value, 'name');
        return result.ok && typeof result.value === 'string' ? result.value : 'Error';
    }

    win.addEventListener('error', (event) => {
        if (!event || typeof event.message !== 'string') return;
        const error = event.error;
        let message;
        let frames = [];
        let stackText = '';

        if (isErrorValue(error)) {
            message = 'Uncaught ' + errorHeadline(error);
            const described = describeErrorStack(error);
            frames = described.frames;
            stackText = described.stackText;
        } else if (error === undefined || error === null) {
            message = event.message || 'Uncaught error';
            if (!/^Uncaught\b/.test(message)) message = 'Uncaught ' + message;
        } else {
            message = describeThrown(error, 'Uncaught');
        }

        // Syntax errors (and non-Error throws) carry no useful stack: use the ErrorEvent position, whose
        // line is relative to the whole document, and map it back to the learner's file.
        const errorName = errorNameOf(error);
        const hasMappedFrame = frames.some((frame) => frame.mapped);
        if ((event.filename || event.lineno) && (errorName === 'SyntaxError' || !hasMappedFrame)) {
            const fallback = mapFrame({
                functionName: '',
                path: normalizePath(event.filename || ''),
                line: Number(event.lineno) || 0,
                column: Number(event.colno) || null,
                raw: '',
            }, true);
            if (fallback && (fallback.mapped || frames.length === 0)) frames = [fallback, ...frames];
        }

        const location = primaryLocation(frames);
        enqueue(createMessage('runtime-error', 'error', {
            errorName,
            parts: [{ kind: 'text', text: message }],
            text: message,
            values: [message],
            groups: [],
            location,
            path: location ? location.path : null,
            line: location ? location.line : null,
            column: location ? location.column : null,
            stackFrames: frames,
            stackText,
        }));
    });

    win.addEventListener('unhandledrejection', (event) => {
        const reason = event ? event.reason : undefined;
        const message = describeThrown(reason, 'Uncaught (in promise)');
        const described = isErrorValue(reason) ? describeErrorStack(reason) : { frames: [], stackText: '' };
        const location = primaryLocation(described.frames);
        enqueue(createMessage('unhandled-rejection', 'error', {
            errorName: errorNameOf(reason),
            parts: [{ kind: 'text', text: message }],
            text: message,
            values: [message],
            groups: [],
            location,
            path: location ? location.path : null,
            line: location ? location.line : null,
            column: location ? location.column : null,
            stackFrames: described.frames,
            stackText: described.stackText,
        }));
    });

    // ─── Parent commands (REPL + inspector) ────────────────

    function runCommand(data) {
        let source = String(data.command || '');
        if (/^\s*\{[\s\S]*\}\s*$/.test(source)) {
            try {
                // Chrome treats `{a: 1}` typed in the console as an object literal.
                Function('return (' + source + '\n)');
                source = '(' + source + '\n)';
            } catch {
                // Keep it as a block statement.
            }
        }

        try {
            const result = (0, eval)(source);
            const ctx = { promises: [] };
            const value = describe(result, 'top', ctx);
            const text = value.preview;
            enqueue(createMessage('command-result', 'info', {
                commandId: data.commandId || null,
                parts: [{ kind: 'value', value }],
                text,
                values: [text],
                groups: [],
            }), ctx);
        } catch (error) {
            const message = describeThrown(error, 'Uncaught');
            const described = isErrorValue(error) ? describeErrorStack(error) : { frames: [], stackText: '' };
            enqueue(createMessage('command-error', 'error', {
                commandId: data.commandId || null,
                parts: [{ kind: 'text', text: message }],
                text: message,
                values: [message],
                groups: [],
                stackFrames: described.frames,
                stackText: described.stackText,
            }));
        }
    }

    win.addEventListener('message', (event) => {
        if (event.source !== parentWin) return;
        const data = event.data || {};
        if (data.source !== COMMAND_SOURCE || data.renderId !== RENDER_ID) return;
        const action = data.action || 'eval';

        if (action === 'eval') {
            runCommand(data);
            return;
        }

        if (action === 'inspect') {
            handleInspect(data)
                .catch((error) => ({ ok: false, error: errorHeadline(error) }))
                .then((result) => send(createMessage('inspect-result', 'info', { requestId: data.requestId, ...result })));
            return;
        }

        if (action === 'get-property') {
            let result;
            try {
                result = handleGetProperty(data);
            } catch (error) {
                result = { ok: false, error: errorHeadline(error) };
            }
            send(createMessage('inspect-result', 'info', { requestId: data.requestId, ...result }));
        }
    });

    // ─── Forms ─────────────────────────────────────────────

    win.addEventListener('submit', (event) => {
        if (event.defaultPrevented) return;
        const form = event.target;
        if (!form || String(form.tagName || '').toUpperCase() !== 'FORM') return;
        const submitter = event.submitter || null;
        const attribute = (element, name) => (element && typeof element.getAttribute === 'function' ? element.getAttribute(name) : null);
        // Attributes, not form.method/form.action: a control named "method" or "action" shadows those properties.
        const rawMethod = String(attribute(submitter, 'formmethod') || attribute(form, 'method') || 'get').toLowerCase();
        const method = ['get', 'post', 'dialog'].includes(rawMethod) ? rawMethod : 'get';
        if (method === 'dialog') return;

        event.preventDefault();
        if (!CONSOLE_ENABLED) return;

        let entries = [];
        try {
            entries = arrayFrom(new FormData(form, submitter || undefined).entries());
        } catch {
            try {
                entries = arrayFrom(new FormData(form).entries());
            } catch {
                entries = [];
            }
        }
        // Files are shown as the browser would describe them; a GET only sends their names.
        const describeFile = (file) => {
            if (!file || !file.name) return 'File (no file chosen)';
            const size = file.size >= 1024 ? Math.round(file.size / 1024) + ' KB' : file.size + ' bytes';
            return 'File "' + file.name + '" (' + size + (file.type ? ', ' + file.type : '') + ')';
        };
        const isFile = (value) => typeof win.File === 'function' && value instanceof win.File;
        const data = {};
        entries.forEach(([name, rawValue]) => {
            const value = isFile(rawValue) ? describeFile(rawValue) : rawValue;
            if (hasOwn.call(data, name)) {
                data[name] = isArray(data[name]) ? data[name].concat([value]) : [data[name], value];
            } else {
                data[name] = value;
            }
        });
        const rawAction = attribute(submitter, 'formaction') ?? attribute(form, 'action');
        let target = rawAction || '(this page)';
        if (method === 'get') {
            // GET replaces the action's query string with the form data (the fragment stays).
            try {
                const query = new win.URLSearchParams(entries.map(([name, value]) => [name, isFile(value) ? value.name : String(value)])).toString();
                const action = rawAction || '';
                const hashIndex = action.indexOf('#');
                const withoutHash = hashIndex === -1 ? action : action.slice(0, hashIndex);
                const hash = hashIndex === -1 ? '' : action.slice(hashIndex);
                const queryIndex = withoutHash.indexOf('?');
                const base = queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
                target = (base || (rawAction ? '' : '(this page)')) + '?' + query + hash;
            } catch {
                // Keep the raw action.
            }
        } else {
            const rawEnctype = String(attribute(submitter, 'formenctype') || attribute(form, 'enctype') || '').toLowerCase();
            const enctype = ['multipart/form-data', 'text/plain'].includes(rawEnctype) ? rawEnctype : 'application/x-www-form-urlencoded';
            target += ' (' + enctype + ')';
        }
        emit('info', ['Form submitted (navigation blocked in preview): ' + method.toUpperCase() + ' ' + target, data], { method: 'form-submit' });
    });

    // ─── Links to other sites ──────────────────────────────

    // Following a link to another site would replace the preview with that site (or with an error
    // page when the site refuses to be framed). Such links open in a new tab instead.
    win.addEventListener('click', (event) => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const anchor = event.target && typeof event.target.closest === 'function' ? event.target.closest('a[href]') : null;
        if (!anchor || anchor.hasAttribute('download')) return;
        const target = String(anchor.getAttribute('target') || '').toLowerCase();
        if (target && target !== '_self' && target !== '_top' && target !== '_parent') return;
        let url = null;
        try {
            url = new URL(anchor.href, doc ? doc.baseURI : undefined);
        } catch {
            return;
        }
        if (!/^https?:$/.test(url.protocol) || url.origin === win.location.origin) return;
        event.preventDefault();
        try {
            win.open(url.href, '_blank', 'noopener');
        } catch {
            // Ignore: popups may be blocked.
        }
        if (CONSOLE_ENABLED) emit('info', ['Link opened in a new tab (the preview stays on this page): ' + url.href], { method: 'link' });
    });

    // ─── Dialogs during live editing ───────────────────────

    if (cfg.suppressDialogs) {
        const describeDialogArgs = (args) => args.map((arg) => (typeof arg === 'string' ? JSON.stringify(arg) : shortPreview(arg))).join(', ');
        const notify = (name, args, result) => {
            const text = name + '(' + describeDialogArgs(args) + ') skipped while editing'
                + (result === undefined ? '' : ' (returned ' + result + ')')
                + ' — press ⟳ Refresh to run it with dialogs.';
            enqueue(createMessage('dialog-suppressed', 'info', { text, values: [text], parts: [{ kind: 'text', text }], groups: [], location: primaryLocation(captureCallerFrames()) }));
        };
        try {
            win.alert = function alert(...args) { notify('alert', args); };
            win.confirm = function confirm(...args) { notify('confirm', args, 'false'); return false; };
            win.prompt = function prompt(...args) { notify('prompt', args, 'null'); return null; };
        } catch {
            // Ignore.
        }
    }

    // ─── Opaque-origin shims (srcdoc previews: gallery, theory, fallback) ───

    function createMemoryStorage() {
        const data = new NativeMap();
        const proto = {};
        Object.defineProperties(proto, {
            getItem: { value: function getItem(key) { const name = String(key); return data.has(name) ? data.get(name) : null; } },
            setItem: { value: function setItem(key, value) { data.set(String(key), String(value)); } },
            removeItem: { value: function removeItem(key) { data.delete(String(key)); } },
            clear: { value: function clear() { data.clear(); } },
            key: { value: function key(index) { const keys = arrayFrom(data.keys()); return index >= 0 && index < keys.length ? keys[index] : null; } },
            length: { get() { return data.size; } },
            [Symbol.toStringTag]: { value: 'Storage' },
        });
        return new Proxy(Object.create(proto), {
            get(target, key, receiver) {
                if (typeof key === 'symbol' || key in proto) return Reflect.get(proto, key, receiver);
                return data.has(key) ? data.get(key) : undefined;
            },
            set(target, key, value) {
                if (typeof key === 'symbol') return false;
                data.set(String(key), String(value));
                return true;
            },
            has(target, key) {
                return typeof key === 'string' && (data.has(key) || key in proto);
            },
            deleteProperty(target, key) {
                data.delete(String(key));
                return true;
            },
            ownKeys() {
                return arrayFrom(data.keys());
            },
            getOwnPropertyDescriptor(target, key) {
                if (typeof key === 'string' && data.has(key)) {
                    return { value: data.get(key), writable: true, enumerable: true, configurable: true };
                }
                return undefined;
            },
        });
    }

    ['localStorage', 'sessionStorage'].forEach((name) => {
        let available = true;
        try {
            void win[name];
        } catch {
            available = false;
        }
        if (available) return;
        const storage = createMemoryStorage();
        try {
            Object.defineProperty(win, name, { configurable: true, enumerable: true, get: () => storage });
        } catch {
            // Ignore.
        }
    });

    if (doc) {
        let cookieAvailable = true;
        try {
            void doc.cookie;
        } catch {
            cookieAvailable = false;
        }
        if (!cookieAvailable) {
            const jar = new NativeMap();
            try {
                Object.defineProperty(doc, 'cookie', {
                    configurable: true,
                    get: () => arrayFrom(jar.entries()).map(([name, value]) => (name ? name + '=' + value : value)).join('; '),
                    set: (input) => {
                        const segments = String(input).split(';');
                        const pair = segments.shift() || '';
                        const separator = pair.indexOf('=');
                        const name = (separator >= 0 ? pair.slice(0, separator) : '').trim();
                        const value = (separator >= 0 ? pair.slice(separator + 1) : pair).trim();
                        const expired = segments.some((segment) => {
                            const [attribute, attributeValue = ''] = segment.split('=');
                            const key = attribute.trim().toLowerCase();
                            if (key === 'max-age') return Number(attributeValue) <= 0;
                            if (key === 'expires') return Date.parse(attributeValue) <= Date.now();
                            return false;
                        });
                        if (expired) jar.delete(name);
                        else jar.set(name, value);
                    },
                });
            } catch {
                // Ignore.
            }
        }
    }

    if (OPAQUE_MODE && doc) {
        // With <base href> pointing at the assets folder, `href="#id"` would navigate the frame away.
        doc.addEventListener('click', (event) => {
            if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const target = event.target && typeof event.target.closest === 'function' ? event.target.closest('a[href]') : null;
            if (!target) return;
            const href = target.getAttribute('href') || '';
            if (href[0] !== '#') return;
            event.preventDefault();
            const fragment = href.slice(1);
            try {
                win.location.hash = fragment;
            } catch {
                let element = null;
                try {
                    element = doc.getElementById(decodeURIComponent(fragment)) || doc.getElementsByName(decodeURIComponent(fragment))[0] || null;
                } catch {
                    element = null;
                }
                if (element && typeof element.scrollIntoView === 'function') element.scrollIntoView();
            }
        });
    }

    // Lets the parent know the document booted (hosted previews fall back to srcdoc otherwise).
    send(createMessage('runtime-ready', 'info', {}));

    if (OPAQUE_MODE && typeof win.Worker === 'function' && typeof win.Blob === 'function' && win.URL && typeof win.URL.createObjectURL === 'function') {
        // An opaque origin cannot start a worker from an http URL; bootstrap it from a blob instead.
        const NativeWorker = win.Worker;
        const WorkerShim = function Worker(url, options) {
            if (!new.target) throw new TypeError("Failed to construct 'Worker': Please use the 'new' operator.");
            try {
                return new NativeWorker(url, options);
            } catch (error) {
                let absolute = '';
                try {
                    absolute = new URL(String(url), doc ? doc.baseURI : undefined).href;
                } catch {
                    throw error;
                }
                if (!/^https?:/i.test(absolute)) throw error;
                const isModule = options && options.type === 'module';
                const bootstrap = isModule ? 'import ' + JSON.stringify(absolute) + ';' : 'importScripts(' + JSON.stringify(absolute) + ');';
                const blobUrl = win.URL.createObjectURL(new win.Blob([bootstrap], { type: 'text/javascript' }));
                return new NativeWorker(blobUrl, options);
            }
        };
        WorkerShim.prototype = NativeWorker.prototype;
        try {
            win.Worker = WorkerShim;
        } catch {
            // Ignore.
        }
    }
}
