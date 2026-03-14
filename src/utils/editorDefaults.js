import fs from 'fs';

function readBooleanFlagState(filePath) {
    if (!filePath || !fs.existsSync(filePath)) {
        return { enabled: true };
    }

    const content = fs.readFileSync(filePath, 'utf-8').trim().toLowerCase();
    return {
        enabled: !(content === '0' || content === 'false' || content === 'off'),
    };
}

function writeBooleanFlagState(filePath, enabled = true) {
    const nextEnabled = Boolean(enabled);
    fs.writeFileSync(filePath, nextEnabled ? '1\n' : '0\n', 'utf-8');
    return { enabled: nextEnabled };
}

export function readVimDefaultState(filePath) {
    return readBooleanFlagState(filePath);
}

export function writeVimDefaultState(filePath, enabled = true) {
    return writeBooleanFlagState(filePath, enabled);
}

export function readClipboardDefaultState(filePath) {
    return readBooleanFlagState(filePath);
}

export function writeClipboardDefaultState(filePath, enabled = true) {
    return writeBooleanFlagState(filePath, enabled);
}
