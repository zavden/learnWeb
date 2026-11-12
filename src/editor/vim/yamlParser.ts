function parseScalar(rawValue) {
    const value = String(rawValue ?? '').trim();
    if (!value) return '';

    if (
        (value.startsWith('"') && value.endsWith('"'))
        || (value.startsWith('\'') && value.endsWith('\''))
    ) {
        return value.slice(1, -1);
    }

    return value;
}

// Removes a trailing `# comment` (preceded by whitespace) that is not inside quotes.
export function stripYamlInlineComment(line = '') {
    const text = String(line ?? '');
    let quote = '';

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];

        if (quote) {
            if (char === quote) quote = '';
            continue;
        }

        if (char === '"' || char === '\'') {
            quote = char;
            continue;
        }

        if (char === '#' && (index === 0 || /\s/.test(text[index - 1]))) {
            return text.slice(0, index).replace(/\s+$/, '');
        }
    }

    return text;
}

export function parseSimpleYamlObject(source = '') {
    const root = {};
    const stack = [{ indent: -1, value: root }];
    const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');

    lines.forEach((rawLine, index) => {
        if (!rawLine.trim()) return;
        if (/^\s*#/.test(rawLine)) return;
        const line = stripYamlInlineComment(rawLine);
        if (!line.trim()) return;
        if (/\t/.test(line)) {
            throw new Error(`Line ${index + 1}: tabs are not supported in vim-shortcuts.yaml`);
        }

        const indent = line.match(/^ */)?.[0]?.length || 0;
        if (indent % 2 !== 0) {
            throw new Error(`Line ${index + 1}: indentation must use multiples of 2 spaces`);
        }

        const trimmed = line.trim();
        const separatorIndex = trimmed.indexOf(':');
        if (separatorIndex <= 0) {
            throw new Error(`Line ${index + 1}: expected "key: value"`);
        }

        const key = trimmed.slice(0, separatorIndex).trim();
        const rawValue = trimmed.slice(separatorIndex + 1);
        const hasNestedValue = !rawValue.trim();

        while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        if (!parent || typeof parent.value !== 'object' || parent.value === null || Array.isArray(parent.value)) {
            throw new Error(`Line ${index + 1}: invalid YAML parent structure`);
        }

        if (hasNestedValue) {
            const nextValue = {};
            parent.value[key] = nextValue;
            stack.push({ indent, value: nextValue });
            return;
        }

        parent.value[key] = parseScalar(rawValue);
    });

    return root;
}
