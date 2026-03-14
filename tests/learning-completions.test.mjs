import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getLearningCssCompletionEntries,
    getLearningHtmlCompletionEntries,
    getLearningJavaScriptCompletionEntries,
} from '../src/editor/learningCompletions.js';

test('HTML learning completions expose core pedagogical snippets', () => {
    const labels = new Set(getLearningHtmlCompletionEntries().map((entry) => entry.label));

    assert.ok(labels.has('html:page'));
    assert.ok(labels.has('div'));
    assert.ok(labels.has('section'));
    assert.ok(labels.has('button'));
    assert.ok(labels.has('a'));
    assert.ok(labels.has('img'));
    assert.ok(labels.has('ul>li'));
    assert.ok(labels.has('form'));
});

test('CSS learning completions expose common layout and responsive snippets', () => {
    const labels = new Set(getLearningCssCompletionEntries().map((entry) => entry.label));

    assert.ok(labels.has('display:flex'));
    assert.ok(labels.has('display:grid'));
    assert.ok(labels.has('padding'));
    assert.ok(labels.has('margin'));
    assert.ok(labels.has('border-radius'));
    assert.ok(labels.has('box-shadow'));
    assert.ok(labels.has('transition'));
    assert.ok(labels.has(':hover'));
    assert.ok(labels.has('@media'));
});

test('JavaScript learning completions expose basic DOM and control flow snippets', () => {
    const labels = new Set(getLearningJavaScriptCompletionEntries().map((entry) => entry.label));

    assert.ok(labels.has('function'));
    assert.ok(labels.has('querySelector'));
    assert.ok(labels.has('addEventListener'));
    assert.ok(labels.has('if'));
    assert.ok(labels.has('for...of'));
    assert.ok(labels.has('console.log'));
    assert.ok(labels.has('setTimeout'));
    assert.ok(labels.has('fetch'));
});
