import test from 'node:test';
import assert from 'node:assert/strict';

import { computeVueScriptEnter, isInsideVueScriptBlock } from '../src/editor/vueSmartEnter.js';

test('detects positions inside vue script setup blocks', () => {
    const source = `<template>\n  <div>{{ msg }}</div>\n</template>\n\n<script setup>\nconst msg = 'hello';\n</script>\n`;
    const insidePosition = source.indexOf("const msg");
    const outsidePosition = source.indexOf('<template>');

    assert.equal(isInsideVueScriptBlock(source, insidePosition), true);
    assert.equal(isInsideVueScriptBlock(source, outsidePosition), false);
});

test('vue smart enter keeps import lines at base indentation inside script setup', () => {
    const source = `<script setup>\nimport { useCards } from './composables/useCards.js'; // AQUI\nconst { current, nextCard } = useCards();\n</script>`;
    const cursor = source.indexOf('// AQUI') + '// AQUI'.length;
    const change = computeVueScriptEnter(source, cursor);

    assert.ok(change);
    assert.equal(change.insert, '\n');
});

test('vue smart enter increases indentation after opening braces inside script blocks', () => {
    const source = `<script setup>\nfunction nextCard() {\n  console.log('next');\n}\n</script>`;
    const cursor = source.indexOf('{') + 1;
    const change = computeVueScriptEnter(source, cursor);

    assert.ok(change);
    assert.equal(change.insert, '\n  ');
});

test('vue smart enter does not apply outside script blocks', () => {
    const source = `<template>\n  <button @click="nextCard">Next</button>\n</template>`;
    const cursor = source.indexOf('Next');

    assert.equal(computeVueScriptEnter(source, cursor), null);
});
