import test from 'node:test';
import assert from 'node:assert/strict';

import { renderTheoryHtml } from '../src/utils/theoryRenderer.js';

test('links to .md files in theory open the example preview instead of navigating', () => {
    const html = renderTheoryHtml('Mira [el colapso](03-colapso-de-margenes.md) y [este](./examples/04-x.md).', {
        topicPath: 'ch03-css/sec02-modelo-de-cajas/top03-margenes',
    });
    assert.match(html, /<a href="#" class="theory-example-link" data-theory-exercise-preview="03-colapso-de-margenes\.md" title="Abrir 03-colapso-de-margenes\.md">el colapso<\/a>/);
    assert.match(html, /data-theory-exercise-preview="04-x\.md"/);
});

test('external and asset links keep their behavior', () => {
    const html = renderTheoryHtml('[MDN](https://developer.mozilla.org/) y [datos](datos.json)', {
        topicPath: 'ch02-html/sec01-a/top01-b',
    });
    assert.match(html, /href="https:\/\/developer\.mozilla\.org\/" target="_blank"/);
    assert.match(html, /href="\/api\/topic\/ch02-html\/sec01-a\/top01-b\/assets\/datos\.json"/);
    assert.doesNotMatch(html, /theory-example-link/);
});
