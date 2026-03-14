import { marked } from 'marked';

let markedConfigured = false;

function ensureMarkedConfigured() {
    if (markedConfigured) return;

    marked.setOptions({
        breaks: true,
        gfm: true,
    });

    markedConfigured = true;
}

export function renderTheoryHtml(content = '') {
    ensureMarkedConfigured();
    return marked.parse(typeof content === 'string' ? content : String(content ?? ''));
}

export function renderTheoryPreviewDocument(content = '', options = {}) {
    const assetBase = options.topicPath ? `/api/topic/${options.topicPath}/assets/` : '';
    const renderedContent = String(content || '').trim()
        ? renderTheoryHtml(content)
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
  </style>
</head>
<body>
  <main>${renderedContent}</main>
</body>
</html>`;
}
