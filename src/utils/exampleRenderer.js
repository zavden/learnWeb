import { getShaderConfig } from './markdown.js';

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

function buildShaderStatusMarkup(title = '', message = '') {
    return `
      <div id="shader-status" class="shader-status"${title || message ? '' : ' hidden'}>
        <strong id="shader-status-title">${escapeHtml(title)}</strong>
        <pre id="shader-status-message">${escapeHtml(message)}</pre>
      </div>`;
}

function buildShaderBridgeMarkup({ consoleEnabled = false, renderId = 0 } = {}) {
    return consoleEnabled ? buildRuntimeBridgeMarkup(renderId) : '';
}

function buildShaderRuntimeScript({
    vertexSource = '',
    fragmentSource = '',
    resolution = { width: 800, height: 600 },
    consoleEnabled = false,
    renderId = 0,
    controls = {},
    assetBase = '',
} = {}) {
    const payload = JSON.stringify({
        assetBase,
        consoleEnabled: Boolean(consoleEnabled),
        controls: controls && typeof controls === 'object' ? controls : {},
        fragmentSource,
        renderId: Number.isFinite(renderId) ? renderId : 0,
        resolution,
        vertexSource,
    });

    return `
  <script>
  (() => {
    const payload = ${payload};
    const MESSAGE_SOURCE = 'learncode-preview';
    const SHADER_CONTROL_SOURCE = 'learncode-shader-control';
    const canvas = document.getElementById('shader-canvas');
    const shell = document.getElementById('shader-shell');
    const stageMeta = document.querySelector('.shader-stage__meta');
    const status = document.getElementById('shader-status');
    const statusTitle = document.getElementById('shader-status-title');
    const statusMessage = document.getElementById('shader-status-message');

    function setStatus(title, message) {
      status.hidden = false;
      statusTitle.textContent = title || 'Shader preview unavailable';
      statusMessage.textContent = message || '';
    }

    function clearStatus() {
      status.hidden = true;
      statusTitle.textContent = '';
      statusMessage.textContent = '';
    }

    function initCanvasSize() {
      const width = Math.max(1, Number(payload.resolution?.width) || 800);
      const height = Math.max(1, Number(payload.resolution?.height) || 600);
      if (canvas.width !== width) {
        canvas.width = width;
      }
      if (canvas.height !== height) {
        canvas.height = height;
      }
      canvas.style.aspectRatio = width + ' / ' + height;
      shell.style.setProperty('--shader-preview-width', width + 'px');
      if (stageMeta) {
        stageMeta.textContent = width + ' x ' + height;
      }
    }

    function compileShader(gl, type, source, label) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
      }

      const info = gl.getShaderInfoLog(shader) || 'Unknown shader compile error.';
      gl.deleteShader(shader);
      throw new Error(label + ' shader compile error\\n' + info);
    }

    function createProgram(gl, vertexShader, fragmentShader) {
      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
      }

      const info = gl.getProgramInfoLog(program) || 'Unknown program link error.';
      gl.deleteProgram(program);
      throw new Error('Shader program link error\\n' + info);
    }

    function setUniformIfPresent(gl, program, name, apply) {
      const location = gl.getUniformLocation(program, name);
      if (location == null) return;
      apply(location);
    }

    function normalizeResolution(value) {
      const width = Math.max(1, Number(value?.width) || 0);
      const height = Math.max(1, Number(value?.height) || 0);

      if (!width || !height) {
        return null;
      }

      return {
        width: Math.round(width),
        height: Math.round(height),
      };
    }

    function cloneUniformValue(value) {
        if (Array.isArray(value)) {
            return value.map((entry) => Number(entry));
      }

      if (typeof value === 'boolean') {
        return value;
      }

      return Number(value);
    }

      function normalizeCustomUniforms(definitions) {
        return Array.isArray(definitions)
          ? definitions
            .filter((uniform) => uniform && typeof uniform.name === 'string' && typeof uniform.type === 'string')
            .map((uniform) => ({
              name: uniform.name,
              type: uniform.type,
              value: cloneUniformValue(uniform.value),
            }))
        : [];
      }

      function normalizeTextures(definitions) {
      return Array.isArray(definitions)
        ? definitions
            .filter((texture) => texture && typeof texture.name === 'string' && typeof texture.assetPath === 'string')
            .map((texture, index) => ({
              assetPath: texture.assetPath,
              image: null,
              name: texture.name,
              objectUrl: '',
              status: payload.assetBase ? 'loading' : 'missing-asset-base',
              texture: null,
              unit: index,
              url: payload.assetBase ? payload.assetBase + encodeURIComponent(texture.assetPath) : '',
              width: 0,
              height: 0,
            }))
        : [];
    }

    function postShaderStats(extra = {}) {
      try {
        window.parent?.postMessage({
          source: MESSAGE_SOURCE,
          renderId: payload.renderId,
          kind: 'shader-stats',
          level: 'info',
          timestamp: Date.now(),
          ...extra,
        }, '*');
      } catch {
        // Ignore bridge failures so the shader can keep rendering.
      }
    }

    function render() {
      initCanvasSize();

      const gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        preserveDrawingBuffer: true,
        stencil: false,
      });

      if (!gl) {
        throw new Error('This browser could not create a WebGL context.');
      }

      let vertexShader = null;
      let fragmentShader = null;
      let program = null;
      let buffer = null;
      let animationFrameId = 0;
      let didCleanup = false;
      let frameCount = 0;
      let previousFrameTime = null;
      let accumulatedTime = 0;
      let lastReportTime = null;
      let reportFrameCount = 0;
      let paused = Boolean(payload.controls?.paused);
      const customUniforms = normalizeCustomUniforms(payload.controls?.customUniforms);
      const textureResources = normalizeTextures(payload.controls?.textures);
      const mouseState = {
        pressed: false,
        x: 0,
        y: 0,
      };
      const uniformLocations = {};

      function updateMouseState(event) {
        const rect = canvas.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          mouseState.x = 0;
          mouseState.y = 0;
          return;
        }

        const normalizedX = (event.clientX - rect.left) / rect.width;
        const normalizedY = (event.clientY - rect.top) / rect.height;
        const clampedX = Math.min(1, Math.max(0, normalizedX));
        const clampedY = Math.min(1, Math.max(0, normalizedY));

        mouseState.x = clampedX * canvas.width;
        mouseState.y = (1 - clampedY) * canvas.height;
      }

      function handlePointerMove(event) {
        updateMouseState(event);
      }

      function handlePointerDown(event) {
        mouseState.pressed = true;
        updateMouseState(event);
      }

      function handlePointerUp() {
        mouseState.pressed = false;
      }

      function handlePointerLeave() {
        mouseState.pressed = false;
      }

      function resetRuntimeState() {
        frameCount = 0;
        previousFrameTime = null;
        accumulatedTime = 0;
        lastReportTime = null;
        reportFrameCount = 0;
        mouseState.pressed = false;
        mouseState.x = 0;
        mouseState.y = 0;
      }

      function createTextureUploadCanvas(image) {
        const width = image.naturalWidth || image.width || 0;
        const height = image.naturalHeight || image.height || 0;

        if (!width || !height) {
          return null;
        }

        const uploadCanvas = document.createElement('canvas');
        uploadCanvas.width = width;
        uploadCanvas.height = height;

        const context = uploadCanvas.getContext('2d', { alpha: true });
        if (!context) {
          return null;
        }

        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        return uploadCanvas;
      }

      function postTextureSnapshot() {
        postShaderStats({
          textures: textureResources.map((resource) => ({
            assetPath: resource.assetPath,
            height: resource.height,
            name: resource.name,
            status: resource.status,
            width: resource.width,
          })),
        });
      }

      function initializeTexture(resource) {
        if (resource.image) {
          resource.image.onload = null;
          resource.image.onerror = null;
          resource.image = null;
        }
        if (resource.objectUrl) {
          URL.revokeObjectURL(resource.objectUrl);
          resource.objectUrl = '';
        }
        if (!resource.texture) {
          resource.texture = gl.createTexture();
        }
        gl.activeTexture(gl.TEXTURE0 + resource.unit);
        gl.bindTexture(gl.TEXTURE_2D, resource.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          1,
          1,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array([20, 24, 38, 255])
        );

        if (!resource.url) {
          resource.status = 'missing-asset-base';
          postTextureSnapshot();
          return;
        }

        resource.status = 'loading';
        postTextureSnapshot();

        fetch(resource.url, { mode: 'cors' })
          .then((response) => {
            if (!response.ok) {
              throw new Error('Texture request failed with status ' + response.status);
            }
            return response.blob();
          })
          .then((blob) => {
            if (didCleanup || !resource.texture) return;

            const objectUrl = URL.createObjectURL(blob);
            resource.objectUrl = objectUrl;

            const image = new Image();
            image.decoding = 'async';
            image.crossOrigin = 'anonymous';
            image.onload = () => {
              if (didCleanup || !resource.texture) return;
              resource.image = image;
              resource.width = image.naturalWidth || image.width || 0;
              resource.height = image.naturalHeight || image.height || 0;

              try {
                const uploadSource = createTextureUploadCanvas(image) || image;
                gl.activeTexture(gl.TEXTURE0 + resource.unit);
                gl.bindTexture(gl.TEXTURE_2D, resource.texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, uploadSource);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                resource.status = 'ready';
              } catch (error) {
                resource.status = 'upload-error';
                console.error(error);
              }

              postTextureSnapshot();
            };
            image.onerror = () => {
              if (didCleanup) return;
              resource.status = 'error';
              postTextureSnapshot();
            };
            image.src = objectUrl;
            resource.image = image;
          })
          .catch((error) => {
            if (didCleanup) return;
            resource.status = 'error';
            console.error(error);
            postTextureSnapshot();
          });
      }

      function handleControlMessage(event) {
        if (event.source !== window.parent) return;

        const data = event.data || {};
        if (data.source !== SHADER_CONTROL_SOURCE || data.renderId !== payload.renderId) return;

        if (data.action === 'set-resolution') {
          const nextResolution = normalizeResolution(data.resolution);
          if (nextResolution) {
            payload.resolution = nextResolution;
          }
          return;
        }

        if (data.action === 'set-paused') {
          paused = Boolean(data.paused);
          previousFrameTime = null;
          return;
        }

        if (data.action === 'reset-runtime') {
          resetRuntimeState();
          return;
        }

        if (data.action === 'set-custom-uniform') {
          const targetUniform = customUniforms.find((uniform) => uniform.name === data.name);
          if (targetUniform) {
            targetUniform.value = cloneUniformValue(data.value);
          }
          return;
        }

        if (data.action === 'refresh-textures') {
          textureResources.forEach((resource) => {
            resource.status = payload.assetBase ? 'loading' : 'missing-asset-base';
            resource.width = 0;
            resource.height = 0;
            initializeTexture(resource);
          });
        }
      }

      const cleanup = () => {
        if (didCleanup || !gl) return;
        didCleanup = true;
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
        canvas.removeEventListener('pointermove', handlePointerMove);
        canvas.removeEventListener('pointerdown', handlePointerDown);
        canvas.removeEventListener('pointerleave', handlePointerLeave);
        canvas.removeEventListener('pointercancel', handlePointerLeave);
        window.removeEventListener('pointerup', handlePointerUp);
        window.removeEventListener('message', handleControlMessage);
        textureResources.forEach((resource) => {
          if (resource.image) {
            resource.image.onload = null;
            resource.image.onerror = null;
            resource.image = null;
          }
          if (resource.objectUrl) {
            URL.revokeObjectURL(resource.objectUrl);
            resource.objectUrl = '';
          }
          if (resource.texture) {
            gl.deleteTexture(resource.texture);
            resource.texture = null;
          }
        });
        if (buffer) {
          gl.deleteBuffer(buffer);
          buffer = null;
        }
        if (program) {
          gl.deleteProgram(program);
          program = null;
        }
        if (vertexShader) {
          gl.deleteShader(vertexShader);
          vertexShader = null;
        }
        if (fragmentShader) {
          gl.deleteShader(fragmentShader);
          fragmentShader = null;
        }
      };

      function getUniformLocation(name) {
        if (!(name in uniformLocations)) {
          uniformLocations[name] = gl.getUniformLocation(program, name);
        }
        return uniformLocations[name];
      }

      function setCachedUniform(name, apply) {
        const location = getUniformLocation(name);
        if (location == null) return;
        apply(location);
      }

      function drawFrame(now) {
        if (didCleanup) return;

        initCanvasSize();
        gl.viewport(0, 0, canvas.width, canvas.height);

        const rawDeltaSeconds = previousFrameTime == null
          ? 0
          : Math.max(0, now - previousFrameTime) / 1000;
        previousFrameTime = now;
        const deltaSeconds = paused ? 0 : rawDeltaSeconds;
        if (!paused) {
          accumulatedTime += rawDeltaSeconds;
        }
        const elapsedSeconds = accumulatedTime;
        reportFrameCount += 1;

        setCachedUniform('u_resolution', (location) => {
          gl.uniform2f(location, canvas.width, canvas.height);
        });
        setCachedUniform('u_time', (location) => {
          gl.uniform1f(location, elapsedSeconds);
        });
        setCachedUniform('u_delta', (location) => {
          gl.uniform1f(location, deltaSeconds);
        });
        setCachedUniform('u_mouse', (location) => {
          gl.uniform2f(location, mouseState.x, mouseState.y);
        });
        setCachedUniform('u_mouse_pressed', (location) => {
          gl.uniform1f(location, mouseState.pressed ? 1 : 0);
        });
        setCachedUniform('u_frame', (location) => {
          gl.uniform1f(location, frameCount);
        });
        customUniforms.forEach((uniform) => {
          setCachedUniform(uniform.name, (location) => {
            if (uniform.type === 'bool') {
              gl.uniform1i(location, uniform.value ? 1 : 0);
              return;
            }

            if (uniform.type === 'int') {
              gl.uniform1i(location, Math.trunc(Number(uniform.value) || 0));
              return;
            }

            if (uniform.type === 'vec2') {
              const vector = Array.isArray(uniform.value) ? uniform.value : [0, 0];
              gl.uniform2f(location, Number(vector[0]) || 0, Number(vector[1]) || 0);
              return;
            }

            if (uniform.type === 'vec3') {
              const vector = Array.isArray(uniform.value) ? uniform.value : [0, 0, 0];
              gl.uniform3f(location, Number(vector[0]) || 0, Number(vector[1]) || 0, Number(vector[2]) || 0);
              return;
            }

            if (uniform.type === 'vec4') {
              const vector = Array.isArray(uniform.value) ? uniform.value : [0, 0, 0, 0];
              gl.uniform4f(
                location,
                Number(vector[0]) || 0,
                Number(vector[1]) || 0,
                Number(vector[2]) || 0,
                Number(vector[3]) || 0
              );
              return;
            }

            gl.uniform1f(location, Number(uniform.value) || 0);
          });
        });
        textureResources.forEach((resource) => {
          gl.activeTexture(gl.TEXTURE0 + resource.unit);
          gl.bindTexture(gl.TEXTURE_2D, resource.texture);
          setCachedUniform(resource.name, (location) => {
            gl.uniform1i(location, resource.unit);
          });
        });

        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        if (lastReportTime == null || now - lastReportTime >= 120 || frameCount === 0) {
          const elapsedSinceReport = lastReportTime == null ? 0 : now - lastReportTime;
          const fps = elapsedSinceReport > 0
            ? (reportFrameCount * 1000) / elapsedSinceReport
            : 0;

          postShaderStats({
            fps,
            frame: frameCount,
            paused,
            resolution: {
              width: canvas.width,
              height: canvas.height,
            },
            uniforms: {
              u_time: elapsedSeconds,
              u_delta: deltaSeconds,
              u_resolution: [canvas.width, canvas.height],
              u_mouse: [mouseState.x, mouseState.y],
              u_mouse_pressed: mouseState.pressed ? 1 : 0,
              u_frame: frameCount,
            },
            customUniforms: customUniforms.map((uniform) => ({
              name: uniform.name,
              type: uniform.type,
              value: cloneUniformValue(uniform.value),
            })),
            textures: textureResources.map((resource) => ({
              assetPath: resource.assetPath,
              height: resource.height,
              name: resource.name,
              status: resource.status,
              width: resource.width,
            })),
          });
          lastReportTime = now;
          reportFrameCount = 0;
        }

        if (!paused) {
          frameCount += 1;
        }
        animationFrameId = requestAnimationFrame(drawFrame);
      }

      try {
        vertexShader = compileShader(gl, gl.VERTEX_SHADER, payload.vertexSource, 'Vertex');
        fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, payload.fragmentSource, 'Fragment');
        program = createProgram(gl, vertexShader, fragmentShader);

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1,
          ]),
          gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, 'a_position');
        if (positionLocation < 0) {
          throw new Error('Vertex shader must declare attribute vec2 a_position for the fullscreen quad.');
        }

        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.viewport(0, 0, canvas.width, canvas.height);
        setUniformIfPresent(gl, program, 'u_resolution', (location) => {
          uniformLocations.u_resolution = location;
        });
        setUniformIfPresent(gl, program, 'u_time', (location) => {
          uniformLocations.u_time = location;
        });
        setUniformIfPresent(gl, program, 'u_delta', (location) => {
          uniformLocations.u_delta = location;
        });
        setUniformIfPresent(gl, program, 'u_mouse', (location) => {
          uniformLocations.u_mouse = location;
        });
        setUniformIfPresent(gl, program, 'u_mouse_pressed', (location) => {
          uniformLocations.u_mouse_pressed = location;
        });
        setUniformIfPresent(gl, program, 'u_frame', (location) => {
          uniformLocations.u_frame = location;
        });
        textureResources.forEach((resource) => {
          setUniformIfPresent(gl, program, resource.name, (location) => {
            uniformLocations[resource.name] = location;
          });
          initializeTexture(resource);
        });

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerdown', handlePointerDown);
        canvas.addEventListener('pointerleave', handlePointerLeave);
        canvas.addEventListener('pointercancel', handlePointerLeave);
        window.addEventListener('pointerup', handlePointerUp);
        window.addEventListener('message', handleControlMessage);

        clearStatus();
        animationFrameId = requestAnimationFrame(drawFrame);
      } catch (error) {
        cleanup();
        throw error;
      }

      window.addEventListener('pagehide', cleanup, { once: true });
    }

    try {
      render();
    } catch (error) {
      console.error(error);
      setStatus('Shader preview unavailable', error?.message || String(error));
    }
  })();
  </script>`;
}

export function renderShaderExampleDocument(documentModel = {}, options = {}) {
    const blocks = Array.isArray(documentModel?.blocks) ? documentModel.blocks : [];
    const diagnostics = Array.isArray(options.diagnostics) ? options.diagnostics : [];
    const shaderConfig = getShaderConfig(documentModel);
    const consoleEnabled = Boolean(options.consoleEnabled);
    const shaderControls = options.shaderControls && typeof options.shaderControls === 'object'
        ? options.shaderControls
        : {};
    const topicPath = String(options.topicPath || '').trim();
    const renderId = Number.isFinite(options.renderId) ? options.renderId : 0;
    const vertexBlock = blocks.find((block) => block.type === 'vertex') || null;
    const fragmentBlock = blocks.find((block) => block.type === 'fragment') || null;
    const blockingDiagnostics = diagnostics.filter((diagnostic) => diagnostic.level === 'error');
    const resolution = shaderConfig.resolution || { width: 800, height: 600 };
    const runtimeResolution = shaderControls?.currentResolution && Number.isFinite(shaderControls.currentResolution.width)
        && Number.isFinite(shaderControls.currentResolution.height)
        ? shaderControls.currentResolution
        : resolution;
    const customUniforms = Array.isArray(shaderControls?.customUniforms)
        ? shaderControls.customUniforms.map((uniform) => ({
            name: uniform.name,
            type: uniform.type,
            value: Array.isArray(uniform.value)
                ? uniform.value.map((entry) => Number(entry))
                : typeof uniform.value === 'boolean'
                    ? uniform.value
                    : Number(uniform.value),
        }))
        : [];
    const textures = Array.isArray(shaderControls?.textures) && shaderControls.textures.length > 0
        ? shaderControls.textures.map((texture) => ({
            assetPath: texture.assetPath,
            name: texture.name,
        }))
        : (shaderConfig.textures || []).map((texture) => ({
            assetPath: texture.assetPath,
            name: texture.name,
        }));
    const assetBase = topicPath ? `/api/topic/${topicPath}/assets/` : '';
    const diagnosticsMarkup = consoleEnabled ? '' : buildDiagnosticsMarkup(diagnostics);
    const bridgeMarkup = buildShaderBridgeMarkup({ consoleEnabled, renderId });

    const missingSource = !vertexBlock || !fragmentBlock || blockingDiagnostics.length > 0;
    const statusTitle = missingSource ? 'Shader preview unavailable' : '';
    const statusMessage = missingSource
        ? blockingDiagnostics.map((diagnostic) => diagnostic.message).join('\n')
            || 'Shader documents need valid Vertex and Fragment blocks.'
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      color-scheme: dark;
    }

    html,
    body {
      margin: 0;
      min-height: 100%;
      background: #020617;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    }

    body {
      padding: 16px;
      box-sizing: border-box;
    }

    .shader-shell {
      --shader-preview-width: ${runtimeResolution.width}px;
      display: grid;
      gap: 12px;
      width: min(100%, var(--shader-preview-width));
      margin: 0 auto;
    }

    .shader-stage {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 240px;
      overflow: hidden;
      background:
        linear-gradient(45deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.92)),
        repeating-linear-gradient(
          45deg,
          rgba(148, 163, 184, 0.08) 0 12px,
          rgba(15, 23, 42, 0.08) 12px 24px
        );
      border: 1px solid rgba(148, 163, 184, 0.18);
    }

    #shader-canvas {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      background: #000000;
    }

    .shader-stage__meta {
      position: absolute;
      right: 12px;
      bottom: 12px;
      padding: 6px 8px;
      border-radius: 999px;
      background: rgba(2, 6, 23, 0.72);
      color: rgba(226, 232, 240, 0.84);
      font-size: 11px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      backdrop-filter: blur(10px);
    }

    .shader-status {
      position: absolute;
      inset: 0;
      display: grid;
      align-content: center;
      gap: 8px;
      padding: 20px;
      background: rgba(2, 6, 23, 0.82);
      backdrop-filter: blur(8px);
      box-sizing: border-box;
    }

    .shader-status[hidden] {
      display: none;
    }

    .shader-status strong {
      font-size: 15px;
    }

    .shader-status pre {
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: #fda4af;
      font: 12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace;
    }
  </style>
  ${bridgeMarkup}
</head>
<body>
  <main id="shader-shell" class="shader-shell">
    <section class="shader-stage">
      <canvas id="shader-canvas" width="${runtimeResolution.width}" height="${runtimeResolution.height}"></canvas>
      <div class="shader-stage__meta">${runtimeResolution.width} x ${runtimeResolution.height}</div>
      ${buildShaderStatusMarkup(statusTitle, statusMessage)}
    </section>
    ${diagnosticsMarkup}
  </main>
  ${missingSource ? '' : buildShaderRuntimeScript({
        assetBase,
        consoleEnabled,
        controls: {
            customUniforms,
            paused: Boolean(shaderControls?.paused),
            resolution: runtimeResolution,
            textures,
        },
        renderId,
        fragmentSource: fragmentBlock.content || '',
        resolution: runtimeResolution,
        vertexSource: vertexBlock.content || '',
    })}
</body>
</html>`;
}
