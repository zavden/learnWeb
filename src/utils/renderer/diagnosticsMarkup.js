export function escapeHtml(value = '') {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function formatDiagnosticLocation(diagnostic = {}) {
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

export function buildDiagnosticsMarkup(diagnostics = []) {
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
