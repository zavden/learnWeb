import test from 'node:test';
import assert from 'node:assert/strict';

import { findDirectionalPanelTargetIndex, getWrappedPanelIndex } from '../src/utils/panelNavigation.js';

test('wraps panel index cyclically for next and previous movement', () => {
    assert.equal(getWrappedPanelIndex(4, 0, 'up'), 3);
    assert.equal(getWrappedPanelIndex(4, 3, 'down'), 0);
    assert.equal(getWrappedPanelIndex(4, 0, 'left'), 3);
    assert.equal(getWrappedPanelIndex(4, 3, 'right'), 0);
});

test('returns -1 for wrapped movement when panel count is too small or direction is invalid', () => {
    assert.equal(getWrappedPanelIndex(1, 0, 'up'), -1);
    assert.equal(getWrappedPanelIndex(0, 0, 'down'), -1);
    assert.equal(getWrappedPanelIndex(4, 1, 'noop'), -1);
});

test('finds the nearest vertical neighbor in panel geometry', () => {
    const panels = [
        { left: 0, top: 0, width: 400, height: 200 },
        { left: 0, top: 210, width: 400, height: 200 },
        { left: 0, top: 420, width: 400, height: 200 },
    ];

    assert.equal(findDirectionalPanelTargetIndex(panels, 1, 'up'), 0);
    assert.equal(findDirectionalPanelTargetIndex(panels, 1, 'down'), 2);
});

test('wraps vertical panel navigation when there is no further visible neighbor', () => {
    const panels = [
        { left: 0, top: 0, width: 400, height: 200 },
        { left: 0, top: 210, width: 400, height: 200 },
        { left: 0, top: 420, width: 400, height: 200 },
    ];

    assert.equal(findDirectionalPanelTargetIndex(panels, 0, 'up'), 2);
    assert.equal(findDirectionalPanelTargetIndex(panels, 2, 'down'), 0);
});

test('keeps horizontal navigation non-cyclic when no neighbor exists in that direction', () => {
    const panels = [
        { left: 0, top: 0, width: 400, height: 200 },
        { left: 0, top: 210, width: 400, height: 200 },
        { left: 0, top: 420, width: 400, height: 200 },
    ];

    assert.equal(findDirectionalPanelTargetIndex(panels, 0, 'left'), -1);
    assert.equal(findDirectionalPanelTargetIndex(panels, 2, 'right'), -1);
});
