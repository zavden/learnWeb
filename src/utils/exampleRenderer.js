function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function buildDiagnosticsMarkup(diagnostics = []) {
    if (!diagnostics.length) return '';

    const items = diagnostics
        .map((diagnostic) => `<li>${escapeHtml(diagnostic.message)}</li>`)
        .join('');

    return `
    <aside style="margin-top:16px;padding:12px 14px;border:1px solid rgba(248,81,73,0.35);border-radius:8px;background:rgba(248,81,73,0.08);font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;color:#b91c1c;">
      <strong style="display:block;margin-bottom:6px;">Compile diagnostics</strong>
      <ul style="margin:0;padding-left:18px;">${items}</ul>
    </aside>`;
}

export function renderCompiledExampleDocument(compiledDocument = {}, topicPath = '', diagnostics = []) {
    const assetBase = topicPath ? `/api/topic/${topicPath}/assets/` : '';
    const framework = compiledDocument.framework || '';
    const html = compiledDocument.html || '';
    const css = compiledDocument.css || '';
    const js = compiledDocument.js || '';
    const diagnosticsMarkup = buildDiagnosticsMarkup(diagnostics);
    const baseStyles = framework === 'react'
        ? 'body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; } #root { min-height: calc(100vh - 32px); }'
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
  <script>
  try {
    ${js}
  } catch (e) {
    document.body.innerHTML += '<pre style="color:red;margin-top:12px;font-size:12px;">Runtime Error: ' + e.message + '</pre>';
  }
  </script>
</body>
</html>`;
}
