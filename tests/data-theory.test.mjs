import test from 'node:test';
import assert from 'node:assert/strict';

import {
    renderTheoryHtml,
    renderTheoryPreviewDocument,
    resolveTheoryAssetUrl,
    sanitizeTheoryRawHtml,
} from '../src/utils/theoryRenderer.js';
import {
    extractTheoryExerciseReferences,
    injectTheoryExerciseEmbeds,
} from '../src/utils/theoryExerciseEmbeds.js';

const F = '```';
const TOPIC = 'ch01-html/sec01-basics/top01-intro';

// ─── #5 raw HTML in prose ───────────────────────────────

test('tags and comparisons written in prose render as text', () => {
    const html = renderTheoryHtml('Generics like Array<string>, f<T>(x), and if a<b and b>c then. The <p> element.');

    assert.match(html, /Array&lt;string&gt;/);
    assert.match(html, /f&lt;T&gt;\(x\)/);
    assert.match(html, /a&lt;b and b&gt;c/);
    assert.match(html, /The &lt;p&gt; element/);
    assert.doesNotMatch(html, /<string>|<b |<p> element/);
});

test('dangerous tags and event handlers never reach the DOM', () => {
    const source = [
        '<script>alert(1)</script>',
        '',
        'Inline <style>body{display:none}</style> and <link rel="stylesheet" href="x.css"> and <base href="/">',
        '',
        '<iframe src="https://example.com"></iframe>',
        '',
        'Type here: <textarea> unclosed then **bold**',
        '',
        '<img src=x onerror=alert(1)>',
        '',
        '<div class="note" onclick="alert(1)">hi</div>',
    ].join('\n');
    const html = renderTheoryHtml(source);

    for (const tag of ['script', 'style', 'link', 'base', 'iframe', 'textarea', 'img', 'div']) {
        assert.doesNotMatch(html, new RegExp(`<${tag}[\\s>]`, 'i'), tag);
    }
    // Escaped tags show up as text; no real tag may carry an event handler.
    assert.doesNotMatch(html, /<[a-z][^>]*\son\w+=/i);
    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.match(html, /<strong>bold<\/strong>/);
});

test('block-level tags at line start become a paragraph with markdown still applied', () => {
    const html = renderTheoryHtml('<p> is the paragraph element with **bold** text');
    assert.equal(html.trim(), '<p>&lt;p&gt; is the paragraph element with <strong>bold</strong> text</p>');
});

test('allowlisted tags render with only class/title/open attributes', () => {
    const inline = renderTheoryHtml('Press <kbd class="key" onclick="x()" style="color:red">Ctrl</kbd> + <mark>C</mark>, H<sub>2</sub>O, x<sup>2</sup>, <abbr title="HyperText">HTML</abbr>, <small>tiny</small>');
    assert.match(inline, /<kbd class="key">Ctrl<\/kbd>/);
    assert.match(inline, /<mark>C<\/mark>/);
    assert.match(inline, /<sub>2<\/sub>/);
    assert.match(inline, /<abbr title="HyperText">HTML<\/abbr>/);
    assert.doesNotMatch(inline, /onclick|style=/);

    const details = renderTheoryHtml('<details open onclick="x"><summary>Show</summary>\n\nHidden *md*\n\n</details>');
    assert.match(details, /<details open><summary>Show<\/summary>/);
    assert.match(details, /<p>Hidden <em>md<\/em><\/p>/);
    assert.match(details, /<\/details>/);
});

test('html comments stay hidden and inline code keeps escaping', () => {
    const html = renderTheoryHtml('Text <!-- author note --> more `<script>` and `a < b`');
    assert.match(html, /<!-- author note -->/);
    assert.match(html, /<code>&lt;script&gt;<\/code>/);
    assert.match(html, /<code>a &lt; b<\/code>/);
    assert.equal(sanitizeTheoryRawHtml('<!-- unclosed'), '&lt;!-- unclosed');
});

// ─── #14 fence info strings and embeds inside fences ────

test('fence info strings use only the first word as the language', () => {
    const html = renderTheoryHtml(`${F}html title="demo"\n<b>x</b>\n${F}`);
    assert.match(html, /<code class="hljs language-html">/);
    assert.match(html, /hljs-name">b</);
    assert.doesNotMatch(html, /title=/);
});

test('embed shortcodes inside code fences stay literal and are not fetched', () => {
    const source = `Intro\n\n${F}md\n[[exercise:ex01.md]]\n${F}\n\n~~~\n[[exercise:ex02.md]]\n~~~\n\n[[exercise:ex03.md]]\n`;

    assert.deepEqual(extractTheoryExerciseReferences(source), ['ex03.md']);

    const injected = injectTheoryExerciseEmbeds(source, {}, () => 'EMBED');
    assert.match(injected, /\[\[exercise:ex01\.md\]\]/);
    assert.match(injected, /\[\[exercise:ex02\.md\]\]/);
    assert.doesNotMatch(injected, /\[\[exercise:ex03\.md\]\]/);

    const html = renderTheoryHtml(source);
    assert.doesNotMatch(html, /LEARNWEB_EMBED/);
    assert.match(html, /\[\[exercise:ex01\.md\]/);
    assert.match(html, /theory-exercise-embed is-missing/);
});

// ─── #9 asset URLs and links ────────────────────────────

test('relative image and asset link URLs resolve to the topic assets folder', () => {
    const html = renderTheoryHtml([
        '![Box](box-model.png)',
        '![Nested](./assets/img/flex.svg "Flex")',
        '![Remote](https://example.com/a.png)',
        '[Notes](notes.pdf) [MDN](https://developer.mozilla.org) [Top](#top) [Bad](javascript:alert(1)) [Page](other.md)',
    ].join('\n\n'), { topicPath: TOPIC });

    assert.match(html, /<img src="\/api\/topic\/ch01-html\/sec01-basics\/top01-intro\/assets\/box-model\.png" alt="Box">/);
    assert.match(html, /<img src="\/api\/topic\/ch01-html\/sec01-basics\/top01-intro\/assets\/img\/flex\.svg" alt="Nested" title="Flex">/);
    assert.match(html, /<img src="https:\/\/example\.com\/a\.png"/);
    assert.match(html, /<a href="\/api\/topic\/ch01-html\/sec01-basics\/top01-intro\/assets\/notes\.pdf" target="_blank"/);
    assert.match(html, /<a href="https:\/\/developer\.mozilla\.org" target="_blank" rel="noopener noreferrer">MDN<\/a>/);
    assert.match(html, /<a href="#top">Top<\/a>/);
    // Links to examples of the topic open their preview (see theory-example-links.test.mjs).
    assert.match(html, /data-theory-exercise-preview="other\.md"[^>]*>Page<\/a>/);
    assert.doesNotMatch(html, /javascript:/);
});

test('asset URL resolution encodes topic segments and leaves absolute URLs alone', () => {
    assert.equal(resolveTheoryAssetUrl('diagram.png', 'ch01-diseño web/sec01-a/top01-b'), '/api/topic/ch01-dise%C3%B1o%20web/sec01-a/top01-b/assets/diagram.png');
    assert.equal(resolveTheoryAssetUrl('/api/topic/x/y/z/assets/a.png', TOPIC), '/api/topic/x/y/z/assets/a.png');
    assert.equal(resolveTheoryAssetUrl('data:image/png;base64,AAA', TOPIC), 'data:image/png;base64,AAA');
    assert.equal(resolveTheoryAssetUrl('../other/a.png', TOPIC), '../other/a.png');
    assert.equal(resolveTheoryAssetUrl('a.png', ''), 'a.png');
});

test('theory preview document resolves images and encodes the base href', () => {
    const documentHtml = renderTheoryPreviewDocument('![x](a.png)', { topicPath: 'ch01-a b/sec01-c/top01-d' });
    assert.match(documentHtml, /<base href="\/api\/topic\/ch01-a%20b\/sec01-c\/top01-d\/assets\/">/);
    assert.match(documentHtml, /<img src="\/api\/topic\/ch01-a%20b\/sec01-c\/top01-d\/assets\/a\.png"/);
});

// ─── TheoryViewer load race ─────────────────────────────

function createFakeElement() {
    return {
        classList: { add() {}, remove() {}, toggle() {} },
        disabled: false,
        innerHTML: '',
        addEventListener() {},
        querySelectorAll() { return []; },
    };
}

test('a slow theory fetch never overwrites a newer topic', async () => {
    const elements = new Map();
    const previousDocument = globalThis.document;
    const previousFetch = globalThis.fetch;
    const pending = new Map();

    globalThis.document = {
        getElementById(id) {
            if (!elements.has(id)) elements.set(id, createFakeElement());
            return elements.get(id);
        },
    };
    globalThis.fetch = (url) => new Promise((resolve) => {
        pending.set(String(url), () => resolve({
            ok: true,
            json: async () => ({ content: String(url).includes('slow') ? '# Slow topic' : '# Fast topic' }),
        }));
    });

    try {
        const { TheoryViewer } = await import('../src/components/TheoryViewer.js');
        const viewer = new TheoryViewer();

        const slowLoad = viewer.load('ch01-a/sec01-b/top01-slow');
        const fastLoad = viewer.load('ch01-a/sec01-b/top02-fast');

        pending.get('/api/topic/ch01-a/sec01-b/top02-fast/main')();
        await fastLoad;
        pending.get('/api/topic/ch01-a/sec01-b/top01-slow/main')();
        await slowLoad;

        const container = elements.get('theory-content');
        assert.match(container.innerHTML, /Fast topic/);
        assert.doesNotMatch(container.innerHTML, /Slow topic/);
        assert.equal(viewer.currentContent, '# Fast topic');
    } finally {
        globalThis.document = previousDocument;
        globalThis.fetch = previousFetch;
    }
});
