export function buildRuntimeBridgeMarkup(renderId = 0) {
    return `
  <script>
  (() => {
    const RENDER_ID = ${JSON.stringify(renderId)};
    const MESSAGE_SOURCE = 'learncode-preview';
    const COMMAND_SOURCE = 'learncode-console-command';

    function normalizePath(value) {
      let text = String(value || '').trim();
      if (!text) return '';

      text = text.replace(/^eval at .*?\\((.*)\\)$/i, '$1');

      try {
        if (/^[a-z]+:\\/\\//i.test(text)) {
          const url = new URL(text);
          if (url.protocol === 'http:' || url.protocol === 'https:') {
            text = url.pathname || text;
          }
        }
      } catch {
        // Ignore invalid URLs and keep the original text.
      }

      return text.replace(/^\\/+/, '');
    }

    function parseStackFrames(stack) {
      return String(stack || '')
        .split('\\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          let match = line.match(/^at\\s+(.*?)\\s+\\((.+):(\\d+):(\\d+)\\)$/);
          if (match) {
            return {
              functionName: match[1] || '',
              path: normalizePath(match[2]),
              line: Number(match[3]),
              column: Number(match[4]),
              raw: line,
            };
          }

          match = line.match(/^at\\s+(.+):(\\d+):(\\d+)$/);
          if (match) {
            return {
              functionName: '',
              path: normalizePath(match[1]),
              line: Number(match[2]),
              column: Number(match[3]),
              raw: line,
            };
          }

          match = line.match(/^(.*?)@(.+):(\\d+):(\\d+)$/);
          if (match) {
            return {
              functionName: match[1] || '',
              path: normalizePath(match[2]),
              line: Number(match[3]),
              column: Number(match[4]),
              raw: line,
            };
          }

          return null;
        })
        .filter(Boolean);
    }

    function describeElement(value) {
      const tag = value?.tagName ? value.tagName.toLowerCase() : 'element';
      const id = value?.id ? '#' + value.id : '';
      const className = typeof value?.className === 'string'
        ? '.' + value.className.trim().split(/\\s+/).filter(Boolean).join('.')
        : '';
      return '<' + tag + id + className + '>';
    }

    function serializeValue(value, depth = 0, seen) {
      if (value === null) return 'null';
      if (value === undefined) return 'undefined';

      const type = typeof value;
      if (type === 'string') return value;
      if (type === 'number' || type === 'boolean' || type === 'bigint') return String(value);
      if (type === 'function') return '[Function ' + (value.name || 'anonymous') + ']';

      if (value instanceof Error) {
        return value.name + ': ' + value.message;
      }

      if (typeof Element !== 'undefined' && value instanceof Element) {
        return describeElement(value);
      }

      if (!seen) {
        seen = new WeakSet();
      }

      if (type === 'object') {
        if (seen.has(value)) return '[Circular]';
        seen.add(value);
      }

      if (Array.isArray(value)) {
        if (depth >= 2) return '[Array(' + value.length + ')]';
        const items = value.slice(0, 8).map((entry) => serializeValue(entry, depth + 1, seen));
        const suffix = value.length > 8 ? ', ...' : '';
        return '[' + items.join(', ') + suffix + ']';
      }

      if (type === 'object') {
        const tag = Object.prototype.toString.call(value);
        const keys = Object.keys(value);

        if (depth >= 2) {
          return tag === '[object Object]'
            ? '{' + keys.slice(0, 6).join(', ') + (keys.length > 6 ? ', ...' : '') + '}'
            : tag;
        }

        const pairs = keys.slice(0, 8).map((key) => key + ': ' + serializeValue(value[key], depth + 1, seen));
        const suffix = keys.length > 8 ? ', ...' : '';
        return '{ ' + pairs.join(', ') + suffix + ' }';
      }

      try {
        return String(value);
      } catch {
        return '[Unserializable]';
      }
    }

    function describeError(error, fallbackMessage) {
      const resolvedError = error instanceof Error
        ? error
        : error != null
          ? new Error(String(error))
          : null;
      const message = resolvedError
        ? resolvedError.name + ': ' + resolvedError.message
        : String(fallbackMessage || 'Runtime error');
      const stackText = resolvedError?.stack || '';

      return {
        message,
        stackFrames: parseStackFrames(stackText),
        stackText,
      };
    }

    function describeConsolePayload(args) {
      const values = args.map((value) => serializeValue(value));
      const firstError = args.find((value) => value instanceof Error);
      const describedError = firstError ? describeError(firstError) : null;

      return {
        values,
        stackFrames: describedError?.stackFrames || [],
        stackText: describedError?.stackText || '',
      };
    }

    function post(kind, level, values, extra = {}) {
      try {
        window.parent?.postMessage({
          source: MESSAGE_SOURCE,
          renderId: RENDER_ID,
          kind,
          level,
          values,
          timestamp: Date.now(),
          ...extra,
        }, '*');
      } catch {
        // Ignore bridge failures so preview execution can continue.
      }
    }

    const targetConsole = window.console || {};
    ['log', 'info', 'warn', 'error'].forEach((level) => {
      const original = typeof targetConsole[level] === 'function'
        ? targetConsole[level].bind(targetConsole)
        : null;

      try {
        targetConsole[level] = (...args) => {
          const payload = describeConsolePayload(args);
          post('console', level, payload.values, {
            stackFrames: payload.stackFrames,
            stackText: payload.stackText,
          });
          if (original) {
            return original(...args);
          }
          return undefined;
        };
      } catch {
        // Leave console untouched if the browser does not allow reassignment.
      }
    });

    window.addEventListener('error', (event) => {
      const describedError = describeError(event.error, event.message || 'Runtime error');
      const fallbackPath = normalizePath(event.filename || '');
      const fallbackFrames = fallbackPath || event.lineno
        ? [{
            functionName: '',
            path: fallbackPath,
            line: event.lineno || null,
            column: event.colno || null,
            raw: '',
          }]
        : [];

      post('runtime-error', 'error', [describedError.message], {
        column: event.colno || null,
        line: event.lineno || null,
        path: fallbackPath || null,
        stackFrames: describedError.stackFrames.length > 0 ? describedError.stackFrames : fallbackFrames,
        stackText: describedError.stackText,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      const describedError = describeError(event.reason, 'Unhandled promise rejection');
      post('unhandled-rejection', 'error', [describedError.message], {
        stackFrames: describedError.stackFrames,
        stackText: describedError.stackText,
      });
    });

    window.addEventListener('message', (event) => {
      if (event.source !== window.parent) return;

      const data = event.data || {};
      if (data.source !== COMMAND_SOURCE || data.renderId !== RENDER_ID) return;

      Promise.resolve()
        .then(() => window.eval(data.command || ''))
        .then((result) => {
          post('command-result', 'info', [serializeValue(result)], {
            commandId: data.commandId || null,
          });
        })
        .catch((error) => {
          const describedError = describeError(error, 'Command failed');
          post('command-error', 'error', [
            describedError.message,
          ], {
            commandId: data.commandId || null,
            stackFrames: describedError.stackFrames,
            stackText: describedError.stackText,
          });
        });
    });
  })();
  </script>`;
}
