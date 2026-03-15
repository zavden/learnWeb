import { marked } from 'marked';
import { injectTheoryExerciseEmbeds } from './theoryExerciseEmbeds.js';
import hljs from 'highlight.js/lib/core';
import hljsXml from 'highlight.js/lib/languages/xml';
import hljsCss from 'highlight.js/lib/languages/css';
import hljsJavascript from 'highlight.js/lib/languages/javascript';
import hljsTypescript from 'highlight.js/lib/languages/typescript';
import hljsJson from 'highlight.js/lib/languages/json';
import hljsScss from 'highlight.js/lib/languages/scss';
import hljsGlsl from 'highlight.js/lib/languages/glsl';
import hljsBash from 'highlight.js/lib/languages/bash';
import hljsMarkdown from 'highlight.js/lib/languages/markdown';

hljs.registerLanguage('xml', hljsXml);
hljs.registerLanguage('html', hljsXml);
hljs.registerLanguage('svg', hljsXml);
hljs.registerLanguage('pug', hljsXml);
hljs.registerLanguage('css', hljsCss);
hljs.registerLanguage('scss', hljsScss);
hljs.registerLanguage('sass', hljsScss);
hljs.registerLanguage('javascript', hljsJavascript);
hljs.registerLanguage('js', hljsJavascript);
hljs.registerLanguage('jsx', hljsJavascript);
hljs.registerLanguage('typescript', hljsTypescript);
hljs.registerLanguage('ts', hljsTypescript);
hljs.registerLanguage('tsx', hljsTypescript);
hljs.registerLanguage('json', hljsJson);
hljs.registerLanguage('glsl', hljsGlsl);
hljs.registerLanguage('vertex', hljsGlsl);
hljs.registerLanguage('fragment', hljsGlsl);
hljs.registerLanguage('bash', hljsBash);
hljs.registerLanguage('shell', hljsBash);
hljs.registerLanguage('sh', hljsBash);
hljs.registerLanguage('markdown', hljsMarkdown);
hljs.registerLanguage('md', hljsMarkdown);

let markedConfigured = false;

function serializeInlineScriptValue(value) {
    return JSON.stringify(value)
        .replace(/<\/script/gi, '<\\/script')
        .replace(/<!--/g, '<\\!--')
        .replace(/\u2028/g, '\\u2028')
        .replace(/\u2029/g, '\\u2029');
}

export function highlightCode(code, lang) {
    const language = String(lang || '').trim().toLowerCase();
    if (language && hljs.getLanguage(language)) {
        try {
            return hljs.highlight(code, { language }).value;
        } catch (_) { /* fall through */ }
    }
    return hljs.highlightAuto(code).value;
}

function ensureMarkedConfigured() {
    if (markedConfigured) return;

    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    marked.use({
        renderer: {
            code(code, lang) {
                const highlighted = highlightCode(code, lang);
                const langClass = lang ? ` language-${lang}` : '';
                return `<pre><code class="hljs${langClass}">${highlighted}</code></pre>`;
            },
        },
    });

    markedConfigured = true;
}

export function renderTheoryHtml(content = '', options = {}) {
    ensureMarkedConfigured();
    const source = typeof content === 'string' ? content : String(content ?? '');
    const prepared = injectTheoryExerciseEmbeds(source, options.exerciseEmbeds || {});
    return marked.parse(prepared);
}

export function renderTheoryPreviewDocument(content = '', options = {}) {
    const assetBase = options.topicPath ? `/api/topic/${options.topicPath}/assets/` : '';
    const renderId = Number.isFinite(options.renderId) ? options.renderId : 0;
    const previewPayload = Object.fromEntries(
        Object.entries(options.exerciseEmbeds || {}).map(([filename, embed]) => [
            filename,
            typeof embed?.previewSrcdoc === 'string' ? embed.previewSrcdoc : '',
        ])
    );
    const serializedPreviewPayload = serializeInlineScriptValue(previewPayload);
    const renderedContent = String(content || '').trim()
        ? renderTheoryHtml(content, {
            exerciseEmbeds: options.exerciseEmbeds || {},
        })
        : `
        <div class="theory-empty-state">
          <div class="theory-empty-icon">📝</div>
          <p>No theory content for this topic yet</p>
        </div>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${assetBase ? `<base href="${assetBase}">` : ''}
  <style>
    :root {
      color-scheme: dark;
      font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      min-height: 100%;
      background: #0f172a;
      color: #e5e7eb;
    }

    body {
      padding: 24px;
      line-height: 1.7;
      font-size: 15px;
    }

    main {
      width: min(920px, 100%);
      margin: 0 auto;
    }

    h1, h2, h3, h4, h5, h6 {
      line-height: 1.2;
      margin: 0 0 14px;
      color: #f8fafc;
    }

    h1 {
      color: #60a5fa;
      font-size: 28px;
      margin-top: 0;
    }

    h2 {
      font-size: 22px;
      margin-top: 28px;
      color: #f8fafc;
    }

    h3 {
      font-size: 18px;
      margin-top: 22px;
      color: #dbeafe;
    }

    p, ul, ol, blockquote, pre, table {
      margin: 0 0 16px;
    }

    ul, ol {
      padding-left: 22px;
    }

    a {
      color: #7dd3fc;
    }

    a:hover {
      color: #bae6fd;
    }

    code {
      font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.92em;
      background: rgba(148, 163, 184, 0.14);
      color: #f8fafc;
      border-radius: 6px;
      padding: 0.12rem 0.38rem;
    }

    pre {
      overflow: auto;
      background: #111827;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 12px;
      padding: 14px 16px;
    }

    pre code {
      background: transparent;
      border-radius: 0;
      display: block;
      padding: 0;
    }

    /* highlight.js — atom-one-dark (adapted) */
    pre code.hljs { display: block; overflow-x: auto; padding: 0; background: transparent; }
    .hljs { color: #abb2bf; }
    .hljs-comment, .hljs-quote { color: #5c6370; font-style: italic; }
    .hljs-doctag, .hljs-formula, .hljs-keyword { color: #c678dd; }
    .hljs-deletion, .hljs-name, .hljs-section, .hljs-selector-tag, .hljs-subst { color: #e06c75; }
    .hljs-literal { color: #56b6c2; }
    .hljs-addition, .hljs-attribute, .hljs-meta .hljs-string, .hljs-regexp, .hljs-string { color: #98c379; }
    .hljs-attr, .hljs-number, .hljs-selector-attr, .hljs-selector-class, .hljs-selector-pseudo, .hljs-template-variable, .hljs-type, .hljs-variable { color: #d19a66; }
    .hljs-bullet, .hljs-link, .hljs-meta, .hljs-selector-id, .hljs-symbol, .hljs-title { color: #61aeee; }
    .hljs-built_in, .hljs-class .hljs-title, .hljs-title.class_ { color: #e6c07b; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: 700; }
    .hljs-link { text-decoration: underline; }

    blockquote {
      border-left: 3px solid #38bdf8;
      padding: 4px 0 4px 16px;
      color: #cbd5e1;
      background: rgba(15, 23, 42, 0.4);
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 12px;
    }

    hr {
      border: 0;
      border-top: 1px solid rgba(148, 163, 184, 0.18);
      margin: 24px 0;
    }

    .theory-exercise-embed {
      margin: 18px 0;
      padding: 16px 18px;
      border: 1px solid rgba(96, 165, 250, 0.18);
      border-radius: 16px;
      background:
        linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(2, 6, 23, 0.96)),
        rgba(15, 23, 42, 0.9);
      box-shadow: 0 14px 34px rgba(2, 6, 23, 0.24);
      cursor: pointer;
    }

    .theory-exercise-embed:hover,
    .theory-exercise-embed:focus-within {
      border-color: rgba(125, 211, 252, 0.34);
      transform: translateY(-1px);
    }

    .theory-exercise-embed.is-missing {
      border-style: dashed;
      border-color: rgba(248, 113, 113, 0.28);
      cursor: default;
    }

    .theory-exercise-embed-header,
    .theory-exercise-embed-meta,
    .theory-exercise-embed-actions,
    .theory-exercise-embed-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    .theory-exercise-embed-header {
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .theory-exercise-embed-kicker {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #7dd3fc;
    }

    .theory-exercise-embed-file {
      font-size: 12px;
    }

    .theory-exercise-embed-title {
      font-size: 17px;
      font-weight: 600;
      color: #f8fafc;
      margin-bottom: 8px;
    }

    .theory-exercise-embed-description {
      margin: 0 0 12px;
      color: #cbd5e1;
    }

    .theory-exercise-embed-preview {
      margin: 0 0 12px;
      height: 170px;
      border-radius: 14px;
      overflow: hidden;
      background: #020617;
      border: 1px solid rgba(148, 163, 184, 0.14);
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.48);
    }

    .theory-exercise-embed-preview iframe {
      width: 100%;
      height: 100%;
      display: block;
      border: none;
      background: #fff;
    }

    .theory-exercise-embed-preview.is-empty {
      display: grid;
      place-items: center;
      color: #94a3b8;
      font-size: 12px;
    }

    .theory-exercise-embed-tags {
      margin-bottom: 12px;
    }

    .theory-exercise-embed-tag,
    .theory-exercise-embed-badge {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 0 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      background: rgba(15, 23, 42, 0.76);
      border: 1px solid rgba(148, 163, 184, 0.18);
      color: #e2e8f0;
    }

    .theory-exercise-embed-badge.is-critical {
      border-color: rgba(248, 113, 113, 0.28);
      color: #fecaca;
    }

    .theory-exercise-embed-badge.is-important {
      border-color: rgba(251, 191, 36, 0.28);
      color: #fde68a;
    }

    .theory-exercise-embed-badge.is-useful {
      border-color: rgba(34, 211, 238, 0.28);
      color: #a5f3fc;
    }

    .theory-exercise-embed-badge.is-trivial {
      border-color: rgba(74, 222, 128, 0.28);
      color: #bbf7d0;
    }

    .theory-exercise-embed-rating {
      color: #fbbf24;
      letter-spacing: 0.08em;
      font-size: 12px;
      font-weight: 700;
    }

    .theory-exercise-embed-actions {
      margin-top: 14px;
    }

    .theory-exercise-embed-btn {
      appearance: none;
      border: 1px solid rgba(125, 211, 252, 0.24);
      background: rgba(37, 99, 235, 0.18);
      color: #dbeafe;
      border-radius: 999px;
      padding: 6px 12px;
      font: inherit;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }

    .theory-exercise-embed-btn.is-secondary {
      background: rgba(15, 23, 42, 0.52);
      color: #e5e7eb;
      border-color: rgba(148, 163, 184, 0.18);
    }

    .theory-exercise-embed-btn[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .theory-empty-state {
      min-height: calc(100vh - 48px);
      display: grid;
      place-items: center;
      text-align: center;
      color: #94a3b8;
    }

    .theory-empty-icon {
      font-size: 38px;
      margin-bottom: 10px;
    }

    .theory-code-embed {
      margin: 18px 0;
      border: 1px solid rgba(148, 163, 184, 0.18);
      border-radius: 12px;
      background: #111827;
      overflow: hidden;
    }

    .theory-code-embed-tabs {
      display: flex;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.6);
      overflow-x: auto;
    }

    .theory-code-embed-tab {
      appearance: none;
      border: none;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: #94a3b8;
      padding: 8px 14px;
      font: inherit;
      font-size: 12px;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      cursor: pointer;
      white-space: nowrap;
    }

    .theory-code-embed-tab:hover {
      color: #e2e8f0;
      background: rgba(148, 163, 184, 0.08);
    }

    .theory-code-embed-tab.is-active {
      color: #60a5fa;
      border-bottom-color: #60a5fa;
    }

    .theory-code-embed-panel {
      display: none;
    }

    .theory-code-embed-panel.is-active {
      display: block;
    }

    .theory-code-embed-file-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
      background: rgba(15, 23, 42, 0.6);
    }

    .theory-code-embed-file-name {
      font-size: 12px;
      font-family: "JetBrains Mono", ui-monospace, monospace;
      color: #e2e8f0;
    }

    .theory-code-embed-file-lang {
      font-size: 10px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .theory-code-embed pre {
      margin: 0;
      border: none;
      border-radius: 0;
      padding: 14px 16px;
      background: transparent;
      overflow-x: auto;
    }

    .theory-code-embed pre code {
      font-size: 13px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <main>${renderedContent}</main>
  <script>
    (() => {
      const MESSAGE_SOURCE = 'learncode-theory-preview';
      const RENDER_ID = ${JSON.stringify(renderId)};

      function post(kind, filename) {
        if (!filename) return;
        window.parent?.postMessage({
          source: MESSAGE_SOURCE,
          renderId: RENDER_ID,
          kind,
          filename,
        }, '*');
      }

      const previewPayload = ${serializedPreviewPayload};

      document.querySelectorAll('[data-theory-exercise-preview-slot]').forEach((slot) => {
        const filename = String(slot.getAttribute('data-theory-exercise-preview-slot') || '').trim();
        const previewSrcdoc = previewPayload[filename] || '';
        const exists = slot.closest('.theory-exercise-embed')?.getAttribute('data-theory-exercise-exists') === '1';

        if (!previewSrcdoc) {
          slot.classList.add('is-empty');
          slot.innerHTML = '<span>' + (exists ? 'Preview unavailable' : 'Exercise missing') + '</span>';
          return;
        }

        const iframe = document.createElement('iframe');
        iframe.sandbox = 'allow-scripts';
        iframe.loading = 'lazy';
        iframe.srcdoc = previewSrcdoc;
        slot.classList.remove('is-empty');
        slot.innerHTML = '';
        slot.appendChild(iframe);
      });

      document.addEventListener('click', (event) => {
        const openButton = event.target.closest('[data-theory-exercise-open]');
        if (openButton) {
          event.preventDefault();
          event.stopPropagation();
          post('open-exercise', openButton.getAttribute('data-theory-exercise-open'));
          return;
        }

        const previewButton = event.target.closest('[data-theory-exercise-preview]');
        if (previewButton) {
          event.preventDefault();
          event.stopPropagation();
          post('preview-exercise', previewButton.getAttribute('data-theory-exercise-preview'));
          return;
        }

        const card = event.target.closest('.theory-exercise-embed[data-theory-exercise-exists="1"]');
        if (card) {
          post('preview-exercise', card.getAttribute('data-theory-exercise-file'));
        }
      });

      document.addEventListener('keydown', (event) => {
        const card = event.target.closest('.theory-exercise-embed[data-theory-exercise-exists="1"]');
        if (!card) return;
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        post('preview-exercise', card.getAttribute('data-theory-exercise-file'));
      });

      document.addEventListener('click', (event) => {
        const tab = event.target.closest('.theory-code-embed-tab');
        if (!tab) return;
        const embed = tab.closest('.theory-code-embed');
        if (!embed) return;
        const index = tab.getAttribute('data-code-tab');
        embed.querySelectorAll('.theory-code-embed-tab').forEach((t) => {
          t.classList.toggle('is-active', t.getAttribute('data-code-tab') === index);
        });
        embed.querySelectorAll('.theory-code-embed-panel').forEach((p) => {
          p.classList.toggle('is-active', p.getAttribute('data-code-panel') === index);
        });
      });
    })();
  </script>
</body>
</html>`;
}
