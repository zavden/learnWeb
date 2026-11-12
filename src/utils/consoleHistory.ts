// Command history of the preview console input (ArrowUp / ArrowDown to browse earlier commands).
//
// Pure functions over an immutable-by-convention session object: none mutates its argument, each
// returns a fresh, sanitized session. The state itself lives in ConsoleManager
// (src/components/preview/ConsoleManager.ts), one session per console session key, kept in a Map for the page's lifetime.

/** Most commands a session remembers; older ones are dropped. */
export const CONSOLE_HISTORY_LIMIT = 50;

/** The history state of one console. */
export interface ConsoleHistorySession {
    /** What the user had typed before browsing; shown again when browsing moves past the newest entry. */
    draft: string;
    /** Remembered commands, oldest first (trimmed, never empty, at most {@link CONSOLE_HISTORY_LIMIT}). */
    entries: string[];
    /** Entry currently shown while browsing, or `null` when the input is not showing a history entry. */
    index: number | null;
}

/** Direction of one browsing step: `-1` towards older commands (ArrowUp), `1` towards newer ones (ArrowDown). */
export type ConsoleHistoryDirection = -1 | 1;

/** Result of {@link navigateConsoleHistory}. */
export interface ConsoleHistoryNavigation {
    /** `false` when there was nothing to browse (the input must be left alone). */
    changed: boolean;
    session: ConsoleHistorySession;
    /** What the console input should now contain. */
    value: string;
}

function sanitizeEntries(entries: unknown = []): string[] {
    if (!Array.isArray(entries)) return [];

    return entries
        .map((entry: unknown) => String(entry || '').trim())
        .filter(Boolean)
        .slice(-CONSOLE_HISTORY_LIMIT);
}

/**
 * A valid session from whatever is given: entries are trimmed and capped, and an out-of-range `index`
 * becomes `null`. With no argument it is an empty session.
 */
export function createConsoleHistorySession(
    session: Partial<ConsoleHistorySession> | null = {},
): ConsoleHistorySession {
    const entries = sanitizeEntries(session?.entries);
    const rawIndex = Number.isInteger(session?.index) ? (session?.index as number) : null;

    return {
        draft: typeof session?.draft === 'string' ? session.draft : '',
        entries,
        index: rawIndex !== null && rawIndex >= 0 && rawIndex < entries.length ? rawIndex : null,
    };
}

/**
 * Records a command that was just run: clears the browsing state and draft, and skips a command equal
 * to the last one. A blank command only sanitizes the session. `limit` caps the entries (at least 1).
 */
export function rememberConsoleCommand(
    session: Partial<ConsoleHistorySession> | null = {},
    command = '',
    limit = CONSOLE_HISTORY_LIMIT,
): ConsoleHistorySession {
    const trimmedCommand = String(command || '').trim();
    const nextSession = createConsoleHistorySession(session);

    if (!trimmedCommand) {
        return nextSession;
    }

    const lastEntry = nextSession.entries.at(-1);
    const nextEntries =
        lastEntry === trimmedCommand
            ? nextSession.entries
            : [...nextSession.entries, trimmedCommand].slice(-Math.max(1, limit));

    return {
        draft: '',
        entries: nextEntries,
        index: null,
    };
}

/** Stops browsing because the user edited the input: `draft` becomes the text to come back to. */
export function resetConsoleHistoryNavigation(
    session: Partial<ConsoleHistorySession> | null = {},
    draft = '',
): ConsoleHistorySession {
    const nextSession = createConsoleHistorySession(session);

    return {
        ...nextSession,
        draft: typeof draft === 'string' ? draft : '',
        index: null,
    };
}

/**
 * One ArrowUp / ArrowDown step. The first step up saves `currentInput` as the draft; stepping down
 * past the newest entry restores it. Does nothing (`changed: false`) with no entries, when stepping
 * down while not browsing, or for a direction other than -1 and 1.
 */
export function navigateConsoleHistory(
    session: Partial<ConsoleHistorySession> | null = {},
    currentInput = '',
    direction: ConsoleHistoryDirection = -1,
): ConsoleHistoryNavigation {
    const nextSession = createConsoleHistorySession(session);
    const entries = nextSession.entries;

    if (!entries.length || ![-1, 1].includes(direction)) {
        return {
            changed: false,
            session: nextSession,
            value: typeof currentInput === 'string' ? currentInput : '',
        };
    }

    if (direction === -1) {
        const nextIndex = nextSession.index === null ? entries.length - 1 : Math.max(0, nextSession.index - 1);

        return {
            changed: true,
            session: {
                draft: nextSession.index === null ? String(currentInput || '') : nextSession.draft,
                entries,
                index: nextIndex,
            },
            value: entries[nextIndex],
        };
    }

    if (nextSession.index === null) {
        return {
            changed: false,
            session: nextSession,
            value: typeof currentInput === 'string' ? currentInput : '',
        };
    }

    if (nextSession.index >= entries.length - 1) {
        return {
            changed: true,
            session: {
                draft: '',
                entries,
                index: null,
            },
            value: nextSession.draft,
        };
    }

    const nextIndex = nextSession.index + 1;
    return {
        changed: true,
        session: {
            ...nextSession,
            index: nextIndex,
        },
        value: entries[nextIndex],
    };
}
