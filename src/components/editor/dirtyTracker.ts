// ─── Dirty-state helpers ────────────────────────────────
// Small state holders with no DOM access, shared by the editor (src/components/Editor.ts: unsaved-changes
// tracking), the app shell (src/main.ts: the "discard changes?" prompt) and the gallery
// (src/components/Gallery.ts: ignoring stale async loads).
//
// The editor stores a "signature" (the serialized document) for the last
// loaded/saved version. The document is dirty while the current signature
// differs from that saved signature.

/** Tracks whether the current document signature differs from the last saved one. */
export interface DirtyTracker {
    /** Records `signature` as the saved version and clears the dirty flag; a non-string means "no saved version". */
    markSaved(signature: string | null | undefined): void;
    /** Forgets the saved version (nothing loaded): the tracker stays clean until the next `markSaved`. */
    reset(): void;
    /**
     * Recomputes the dirty flag for the current `signature` and returns whether the flag CHANGED (not whether
     * it is set). Never dirty while there is no saved version or when `signature` is not a string.
     */
    update(signature: string | null | undefined): boolean;
    isDirty(): boolean;
    getSavedSignature(): string | null;
}

/** A fresh tracker: no saved version, clean. */
export function createDirtyTracker(): DirtyTracker {
    let savedSignature: string | null = null;
    let dirty = false;

    return {
        markSaved(signature: string | null | undefined): void {
            savedSignature = typeof signature === 'string' ? signature : null;
            dirty = false;
        },

        reset(): void {
            savedSignature = null;
            dirty = false;
        },

        update(signature: string | null | undefined): boolean {
            const nextDirty = savedSignature !== null
                && typeof signature === 'string'
                && signature !== savedSignature;
            const changed = nextDirty !== dirty;
            dirty = nextDirty;
            return changed;
        },

        isDirty(): boolean {
            return dirty;
        },

        getSavedSignature(): string | null {
            return savedSignature;
        },
    };
}

/**
 * The text of the "discard unsaved changes?" confirm dialog. Blank labels fall back to
 * "The current document" and "continue".
 */
export function buildDiscardChangesMessage(documentLabel: string = '', actionLabel: string = ''): string {
    const label = String(documentLabel || '').trim() || 'The current document';
    const action = String(actionLabel || '').trim() || 'continue';
    return `${label} has unsaved changes.\n\nDiscard them and ${action}?`;
}

/** A "latest request wins" gate: take a token before an async load, check it is still current after. */
export interface RequestGate {
    /** Starts a new request and returns its token; every older token stops being current. */
    next(): number;
    isCurrent(token: number): boolean;
    /** Makes every outstanding token stale without starting a new request. */
    invalidate(): void;
}

/** A fresh generic "latest request wins" gate for async loaders (see {@link RequestGate}). */
export function createRequestGate(): RequestGate {
    let current = 0;

    return {
        next(): number {
            current += 1;
            return current;
        },

        isCurrent(token: number): boolean {
            return token === current;
        },

        invalidate(): void {
            current += 1;
        },
    };
}
