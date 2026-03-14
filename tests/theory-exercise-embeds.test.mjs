import test from 'node:test';
import assert from 'node:assert/strict';

import {
    extractTheoryExerciseReferences,
    injectTheoryExerciseEmbeds,
    renderTheoryExerciseEmbedMarkup,
} from '../src/utils/theoryExerciseEmbeds.js';

test('theory exercise references are extracted in source order without duplicates', () => {
    const content = `
# Theory

[[exercise:ex01.md]]

Body copy.

[[exercise:ex02.md]]
[[exercise:ex01.md]]
`;

    assert.deepEqual(extractTheoryExerciseReferences(content), ['ex01.md', 'ex02.md']);
});

test('theory exercise embed markup exposes preview and open actions', () => {
    const markup = renderTheoryExerciseEmbedMarkup({
        description: 'Filter cards with a composable',
        exists: true,
        filename: 'ex08.md',
        importance: 'important',
        previewSrcdoc: '<!DOCTYPE html><html><body>Preview</body></html>',
        rating: 4,
        stage: 'exercise',
        tags: ['vue', 'sfc'],
    });

    assert.match(markup, /theory-exercise-embed-preview/);
    assert.match(markup, /data-theory-exercise-preview-slot="ex08\.md"/);
    assert.match(markup, /data-theory-exercise-file="ex08\.md"/);
    assert.match(markup, /data-theory-exercise-preview="ex08\.md"/);
    assert.match(markup, /data-theory-exercise-open="ex08\.md"/);
    assert.match(markup, /Filter cards with a composable/);
    assert.match(markup, /★★★★☆/);
});

test('theory markdown shortcodes are replaced with rendered exercise embeds', () => {
    const content = `
Intro text

[[exercise:ex03.md]]
`;

    const decorated = injectTheoryExerciseEmbeds(content, {
        'ex03.md': {
            description: 'Exercise description',
            exists: true,
            filename: 'ex03.md',
            importance: 'critical',
            rating: 5,
            stage: 'exercise',
            tags: ['react'],
        },
    });

    assert.match(decorated, /theory-exercise-embed/);
    assert.match(decorated, /Exercise description/);
    assert.doesNotMatch(decorated, /\[\[exercise:/);
});

test('theory markdown preserves surrounding text when multiple exercise embeds are interleaved', () => {
    const content = `
## Try Inline Exercise Previews

[[exercise:ex01.md]]

testA

[[exercise:ex05.md]]

testB

[[exercise:ex04.md]]

testC
`;

    const decorated = injectTheoryExerciseEmbeds(content, {
        'ex01.md': {
            exists: true,
            filename: 'ex01.md',
        },
        'ex05.md': {
            description: 'Pug sampler',
            exists: true,
            filename: 'ex05.md',
        },
        'ex04.md': {
            exists: true,
            filename: 'ex04.md',
        },
    });

    assert.match(decorated, /Try Inline Exercise Previews/);
    assert.match(decorated, /testA/);
    assert.match(decorated, /testB/);
    assert.match(decorated, /testC/);
    assert.equal((decorated.match(/data-theory-exercise-file=/g) || []).length, 3);
});
