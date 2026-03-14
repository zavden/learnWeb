import test from 'node:test';
import assert from 'node:assert/strict';

import {
    CONSOLE_HISTORY_LIMIT,
    createConsoleHistorySession,
    navigateConsoleHistory,
    rememberConsoleCommand,
    resetConsoleHistoryNavigation,
} from '../src/utils/consoleHistory.js';

test('console history remembers commands and deduplicates consecutive duplicates', () => {
    let session = createConsoleHistorySession();
    session = rememberConsoleCommand(session, 'window.count');
    session = rememberConsoleCommand(session, 'window.count');
    session = rememberConsoleCommand(session, 'window.total');

    assert.deepEqual(session.entries, ['window.count', 'window.total']);
    assert.equal(session.index, null);
});

test('console history navigates with arrow up and restores draft with arrow down', () => {
    let session = createConsoleHistorySession();
    session = rememberConsoleCommand(session, 'first()');
    session = rememberConsoleCommand(session, 'second()');
    session = rememberConsoleCommand(session, 'third()');

    let result = navigateConsoleHistory(session, 'curr', -1);
    assert.equal(result.value, 'third()');
    assert.equal(result.session.index, 2);

    result = navigateConsoleHistory(result.session, result.value, -1);
    assert.equal(result.value, 'second()');
    assert.equal(result.session.index, 1);

    result = navigateConsoleHistory(result.session, result.value, 1);
    assert.equal(result.value, 'third()');
    assert.equal(result.session.index, 2);

    result = navigateConsoleHistory(result.session, result.value, 1);
    assert.equal(result.value, 'curr');
    assert.equal(result.session.index, null);
});

test('console history resets navigation draft when input changes', () => {
    let session = createConsoleHistorySession();
    session = rememberConsoleCommand(session, 'alpha');
    session = rememberConsoleCommand(session, 'beta');

    const navigated = navigateConsoleHistory(session, '', -1).session;
    const reset = resetConsoleHistoryNavigation(navigated, 'beta + 1');

    assert.equal(reset.index, null);
    assert.equal(reset.draft, 'beta + 1');
    assert.deepEqual(reset.entries, ['alpha', 'beta']);
});

test('console history trims to the configured limit', () => {
    let session = createConsoleHistorySession();

    for (let index = 0; index < CONSOLE_HISTORY_LIMIT + 3; index += 1) {
        session = rememberConsoleCommand(session, `cmd-${index}`);
    }

    assert.equal(session.entries.length, CONSOLE_HISTORY_LIMIT);
    assert.equal(session.entries[0], 'cmd-3');
    assert.equal(session.entries.at(-1), `cmd-${CONSOLE_HISTORY_LIMIT + 2}`);
});
