// Enter key for `.vue` files: inside a `<script>` block, a new line keeps the current indentation, adds
// one level after an opening `{`, `[` or `(` and drops one before a closing one. CodeMirror's HTML
// language indents script lines as markup, which is what this command replaces there. Outside script
// blocks the command declines (returns false) and the default Enter runs.
//
// Wired in src/components/Editor.ts as the first entry of the keymap of `vue` files. The pure helpers
// (`isInsideVueScriptBlock`, `computeVueScriptEnter`) work on plain text so tests can run without a view.

import type { EditorView } from '@codemirror/view';

/** The single text change Enter makes: insert `insert` at `from` (`to` equals `from`, nothing is replaced). */
export interface VueScriptEnterChange {
    from: number;
    to: number;
    /** A newline followed by the indentation of the new line. */
    insert: string;
}

function normalizeText(text: string = ''): string {
    return String(text || '');
}

// The file's indent unit: a tab if any indented line starts with tabs, otherwise the smallest leading
// run of spaces, otherwise two spaces.
function detectIndentUnit(text: string = ''): string {
    const source = normalizeText(text);
    const lines = source.split('\n');

    for (const line of lines) {
        const match = line.match(/^(\t+| +)\S/);
        if (!match) continue;
        if (match[1].includes('\t')) return '\t';
    }

    let smallestSpaceIndent = Infinity;
    for (const line of lines) {
        const match = line.match(/^( +)\S/);
        if (!match) continue;
        smallestSpaceIndent = Math.min(smallestSpaceIndent, match[1].length);
    }

    if (Number.isFinite(smallestSpaceIndent) && smallestSpaceIndent > 0) {
        return ' '.repeat(smallestSpaceIndent);
    }

    return '  ';
}

function stripTrailingLineComment(text: string = ''): string {
    return String(text || '').replace(/\/\/.*$/, '').trimEnd();
}

/**
 * Whether `position` (a character offset, clamped to the text) lies after the `>` of a `<script …>` tag
 * that has no `</script>` before the position. Case-insensitive; it does not parse HTML.
 */
export function isInsideVueScriptBlock(text: string = '', position: number = 0): boolean {
    const source = normalizeText(text);
    const clampedPosition = Math.max(0, Math.min(Number(position) || 0, source.length));
    const lowerBefore = source.slice(0, clampedPosition).toLowerCase();

    const lastScriptOpen = lowerBefore.lastIndexOf('<script');
    if (lastScriptOpen === -1) return false;

    const scriptOpenEnd = lowerBefore.indexOf('>', lastScriptOpen);
    if (scriptOpenEnd === -1 || scriptOpenEnd >= clampedPosition) return false;

    const lastScriptClose = lowerBefore.lastIndexOf('</script>');
    return lastScriptClose < lastScriptOpen;
}

/**
 * The change Enter should make at `position`, or `null` when the position is not inside a script block.
 * A trailing `//` comment is ignored when looking for an opening bracket before the cursor.
 */
export function computeVueScriptEnter(text: string = '', position: number = 0): VueScriptEnterChange | null {
    const source = normalizeText(text);
    const clampedPosition = Math.max(0, Math.min(Number(position) || 0, source.length));

    if (!isInsideVueScriptBlock(source, clampedPosition)) {
        return null;
    }

    const lineStart = source.lastIndexOf('\n', Math.max(0, clampedPosition - 1)) + 1;
    const lineEndIndex = source.indexOf('\n', clampedPosition);
    const lineEnd = lineEndIndex === -1 ? source.length : lineEndIndex;
    const lineBeforeCursor = source.slice(lineStart, clampedPosition);
    const lineAfterCursor = source.slice(clampedPosition, lineEnd);
    const currentIndent = (lineBeforeCursor.match(/^\s*/) || [''])[0];
    const indentUnit = detectIndentUnit(source);
    const codeBeforeCursor = stripTrailingLineComment(lineBeforeCursor);
    const trimmedAfter = lineAfterCursor.trimStart();

    let nextIndent = currentIndent;

    if (/[{\[(]$/.test(codeBeforeCursor)) {
        nextIndent = `${currentIndent}${indentUnit}`;
    } else if (/^[}\])]/.test(trimmedAfter) && currentIndent.endsWith(indentUnit)) {
        nextIndent = currentIndent.slice(0, currentIndent.length - indentUnit.length);
    }

    return {
        from: clampedPosition,
        to: clampedPosition,
        insert: `\n${nextIndent}`,
    };
}

/**
 * CodeMirror command for Enter in Vue files. Handles only an empty main selection inside a script block
 * and returns false otherwise, so the next Enter binding runs.
 */
export function vueScriptEnterCommand(view: EditorView): boolean {
    const selection = view.state.selection.main;
    if (!selection || !selection.empty) return false;

    const change = computeVueScriptEnter(view.state.doc.toString(), selection.from);
    if (!change) return false;

    view.dispatch({
        changes: change,
        selection: { anchor: change.from + change.insert.length },
        scrollIntoView: true,
        userEvent: 'input',
    });
    return true;
}
