export const CONSOLE_HISTORY_LIMIT = 50;

function sanitizeEntries(entries = []) {
    if (!Array.isArray(entries)) return [];

    return entries
        .map((entry) => String(entry || '').trim())
        .filter(Boolean)
        .slice(-CONSOLE_HISTORY_LIMIT);
}

export function createConsoleHistorySession(session = {}) {
    const entries = sanitizeEntries(session?.entries);
    const rawIndex = Number.isInteger(session?.index) ? session.index : null;

    return {
        draft: typeof session?.draft === 'string' ? session.draft : '',
        entries,
        index: rawIndex !== null && rawIndex >= 0 && rawIndex < entries.length ? rawIndex : null,
    };
}

export function rememberConsoleCommand(session = {}, command = '', limit = CONSOLE_HISTORY_LIMIT) {
    const trimmedCommand = String(command || '').trim();
    const nextSession = createConsoleHistorySession(session);

    if (!trimmedCommand) {
        return nextSession;
    }

    const lastEntry = nextSession.entries.at(-1);
    const nextEntries = lastEntry === trimmedCommand
        ? nextSession.entries
        : [...nextSession.entries, trimmedCommand].slice(-Math.max(1, limit));

    return {
        draft: '',
        entries: nextEntries,
        index: null,
    };
}

export function resetConsoleHistoryNavigation(session = {}, draft = '') {
    const nextSession = createConsoleHistorySession(session);

    return {
        ...nextSession,
        draft: typeof draft === 'string' ? draft : '',
        index: null,
    };
}

export function navigateConsoleHistory(session = {}, currentInput = '', direction = -1) {
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
        const nextIndex = nextSession.index === null
            ? entries.length - 1
            : Math.max(0, nextSession.index - 1);

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
