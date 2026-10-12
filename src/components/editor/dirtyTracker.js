// ─── Dirty-state helpers ────────────────────────────────
// The editor stores a "signature" (the serialized document) for the last
// loaded/saved version. The document is dirty while the current signature
// differs from that saved signature.

export function createDirtyTracker() {
    let savedSignature = null;
    let dirty = false;

    return {
        markSaved(signature) {
            savedSignature = typeof signature === 'string' ? signature : null;
            dirty = false;
        },

        reset() {
            savedSignature = null;
            dirty = false;
        },

        update(signature) {
            const nextDirty = savedSignature !== null
                && typeof signature === 'string'
                && signature !== savedSignature;
            const changed = nextDirty !== dirty;
            dirty = nextDirty;
            return changed;
        },

        isDirty() {
            return dirty;
        },

        getSavedSignature() {
            return savedSignature;
        },
    };
}

export function buildDiscardChangesMessage(documentLabel = '', actionLabel = '') {
    const label = String(documentLabel || '').trim() || 'The current document';
    const action = String(actionLabel || '').trim() || 'continue';
    return `${label} has unsaved changes.\n\nDiscard them and ${action}?`;
}

// Generic "latest request wins" gate for async loaders.
export function createRequestGate() {
    let current = 0;

    return {
        next() {
            current += 1;
            return current;
        },

        isCurrent(token) {
            return token === current;
        },

        invalidate() {
            current += 1;
        },
    };
}
