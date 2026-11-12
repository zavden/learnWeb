// The "Compile diagnostics" box that preview documents show inside the page when an example cannot run
// (or when the console is closed), plus the HTML escaping the renderers share.
//
// Used by documentRenderer.ts and shaderRenderer.ts. The markup is part of the rendered document, so its
// text and inline styles must stay byte-identical (the course snapshot hashes every rendered document).

import type { Diagnostic } from '../../types/diagnostics.ts';

/** Escape text for use in HTML content and double- or single-quoted attribute values. */
export function escapeHtml(value: string = ''): string {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/**
 * `file:line:column` of a diagnostic (`runtime` stands in for a missing file when there is a line), or
 * `''` when it has neither a file nor a line.
 */
export function formatDiagnosticLocation(diagnostic: Pick<Diagnostic, 'file' | 'line' | 'column'> | null = {}): string {
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

/**
 * The diagnostics box (an `<aside>` with one list item per diagnostic), or `''` when there are none.
 * The markup starts with a newline and spans several lines; HTML-FULL documents flatten it to one line.
 * Every diagnostic is listed whatever its level: callers filter first.
 */
export function buildDiagnosticsMarkup(diagnostics: Diagnostic[] = []): string {
    if (!Array.isArray(diagnostics) || !diagnostics.length) return '';

    const items = diagnostics
        .map((diagnostic) => {
            const location = formatDiagnosticLocation(diagnostic);
            const locationMarkup = location
                ? `<code style="margin-right:8px;color:#7f1d1d;background:rgba(255,255,255,0.55);padding:1px 5px;border-radius:4px;">${escapeHtml(location)}</code>`
                : '';

            const message = String(diagnostic.message || '');
            const messageStyle = message.includes('\n')
                ? ' style="display:block;margin-top:4px;white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;"'
                : '';

            return `<li>${locationMarkup}<span${messageStyle}>${escapeHtml(message)}</span></li>`;
        })
        .join('');

    return `
    <aside style="margin-top:16px;padding:12px 14px;border:1px solid rgba(248,81,73,0.35);border-radius:8px;background:rgba(248,81,73,0.08);font:12px/1.5 -apple-system,BlinkMacSystemFont,sans-serif;color:#b91c1c;">
      <strong style="display:block;margin-bottom:6px;">Compile diagnostics</strong>
      <ul style="margin:0;padding-left:18px;">${items}</ul>
    </aside>`;
}
