function normalizeText(text = '') {
    return String(text || '');
}

function detectIndentUnit(text = '') {
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

function stripTrailingLineComment(text = '') {
    return String(text || '').replace(/\/\/.*$/, '').trimEnd();
}

export function isInsideVueScriptBlock(text = '', position = 0) {
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

export function computeVueScriptEnter(text = '', position = 0) {
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

export function vueScriptEnterCommand(view) {
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
