function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function formatDiagnosticLocation(diagnostic = {}) {
    if (!diagnostic?.file && !diagnostic?.line) return '';

    let value = diagnostic.file || 'runtime';
    if (diagnostic.line) {
        value += `:${diagnostic.line}`;
        if (diagnostic.column) {
            value += `:${diagnostic.column}`;
        }
    }

    return value;
}

function buildDiagnosticsMarkup(diagnostics = []) {
    if (!diagnostics.length) return '';

    const items = diagnostics
        .map((diagnostic) => {
            const location = formatDiagnosticLocation(diagnostic);
            const locationMarkup = location
                ? `<code style="margin-right:8px;color:#7f1d1d;background:rgba(255,255,255,0.55);padding:1px 5px;border-radius:4px;">${escapeHtml(location)}</code>`
                : '';

            return `<li>${locationMarkup}${escapeHtml(diagnostic.message)}</li>`;
        })
        .join('');

    return `
    <aside style="margin-top:16px;padding:12px 14px;border:1px solid rgba(248,81,73,0.35);border-radius:8px;background:rgba(248,81,73,0.08);font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;color:#b91c1c;">
      <strong style="display:block;margin-bottom:6px;">Compile diagnostics</strong>
      <ul style="margin:0;padding-left:18px;">${items}</ul>
    </aside>`;
}

function buildRuntimeBridgeMarkup(renderId = 0) {
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
    const consoleMarkup = options.consoleEnabled ? buildRuntimeBridgeMarkup(options.renderId || 0) : '';

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

    if (consoleMarkup) {
        if (/<head\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'head', consoleMarkup);
        } else if (/<html\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'html', `<head>\n${consoleMarkup}\n</head>`);
        } else if (/<body\b/i.test(html)) {
            html = injectAfterOpeningTag(html, 'body', consoleMarkup);
        } else {
            html = `${consoleMarkup}\n${html}`;
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
    const runtimeScriptPath = compiledDocument.runtimeScriptPath || '';
    const consoleEnabled = Boolean(options.consoleEnabled);
    const renderId = Number.isFinite(options.renderId) ? options.renderId : 0;
    const diagnosticsMarkup = consoleEnabled ? '' : buildDiagnosticsMarkup(diagnostics);

    if (fullDocumentHtml) {
        return injectFullDocumentMarkup(fullDocumentHtml, {
            assetBase,
            consoleEnabled,
            diagnosticsMarkup,
            renderId,
        });
    }

    const baseStyles = framework === 'react'
        ? 'body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; } #root { min-height: calc(100vh - 32px); }'
        : framework === 'vue'
            ? 'body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; } #app { min-height: calc(100vh - 32px); }'
            : 'body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${assetBase ? `<base href="${assetBase}">` : ''}
  <style>
    ${baseStyles}
    ${css}
  </style>
</head>
<body>
  ${html}
  ${diagnosticsMarkup}
  ${consoleEnabled ? buildRuntimeBridgeMarkup(renderId) : ''}
  ${buildUserScriptMarkup(js, { consoleEnabled, runtimeScriptPath })}
</body>
</html>`;
}
