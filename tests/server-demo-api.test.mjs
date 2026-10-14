import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import express from 'express';
import { createDemoApiRouter } from '../src/utils/demoApi.js';

let server;
let base;

before(async () => {
    const app = express();
    app.use('/api/demo', createDemoApiRouter());
    await new Promise((resolve) => {
        server = app.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}/api/demo`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('echo returns method, path, query, selected headers and the parsed JSON body', async () => {
    const response = await fetch(`${base}/echo?status=201&tag=a&tag=b`, {
        body: JSON.stringify({ product: 'Taza', qty: 2 }),
        headers: { 'Content-Type': 'application/json', 'X-Cart': '7', Cookie: 'secret=1' },
        method: 'POST',
    });
    assert.equal(response.status, 201);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    assert.equal(response.headers.get('x-demo-server'), 'LearnWeb');
    const data = await response.json();
    assert.equal(data.method, 'POST');
    assert.equal(data.path, '/api/demo/echo');
    assert.deepEqual(data.query, { status: '201', tag: ['a', 'b'] });
    assert.equal(data.headers['content-type'], 'application/json');
    assert.equal(data.headers['x-cart'], '7');
    assert.equal(data.headers.cookie, undefined);
    assert.deepEqual(data.body, { product: 'Taza', qty: 2 });
});

test('echo parses urlencoded and multipart bodies; invalid JSON is a 400', async () => {
    const urlencoded = await fetch(`${base}/echo`, {
        body: new URLSearchParams([['size', 'M'], ['extra', 'leche'], ['extra', 'canela']]),
        method: 'POST',
    }).then((response) => response.json());
    assert.deepEqual(urlencoded.body, { size: 'M', extra: ['leche', 'canela'] });

    const form = new FormData();
    form.append('name', 'Ana');
    form.append('cv', new Blob(['x'.repeat(2048)], { type: 'application/pdf' }), 'cv.pdf');
    const multipart = await fetch(`${base}/echo`, { body: form, method: 'POST' }).then((response) => response.json());
    assert.deepEqual(multipart.body, { name: 'Ana', cv: { name: 'cv.pdf', size: 2048, type: 'application/pdf' } });

    const invalid = await fetch(`${base}/echo`, {
        body: String({ product: 'Taza' }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
    });
    assert.equal(invalid.status, 400);
    const invalidData = await invalid.json();
    assert.equal(invalidData.error, 'Invalid JSON body');
    assert.equal(invalidData.body, '[object Object]');

    const plain = await fetch(`${base}/echo`, { body: 'hola', method: 'PUT' }).then((response) => response.json());
    assert.equal(plain.headers['content-type'], 'text/plain;charset=UTF-8');
    assert.equal(plain.body, 'hola');

    const empty = await fetch(`${base}/echo`).then((response) => response.json());
    assert.equal(empty.body, null);
});

test('cors=no omits CORS headers, cors=origin reflects the origin, expose=1 exposes X-Demo-Server', async () => {
    const closed = await fetch(`${base}/echo?cors=no`, { headers: { Origin: 'http://localhost:3001' } });
    assert.equal(closed.headers.get('access-control-allow-origin'), null);

    const reflected = await fetch(`${base}/echo?cors=origin&expose=1`, { headers: { Origin: 'http://localhost:3001' } });
    assert.equal(reflected.headers.get('access-control-allow-origin'), 'http://localhost:3001');
    assert.equal(reflected.headers.get('access-control-allow-credentials'), 'true');
    assert.equal(reflected.headers.get('access-control-expose-headers'), 'X-Demo-Server');

    const preflight = await fetch(`${base}/echo`, {
        headers: {
            'Access-Control-Request-Headers': 'content-type, x-cart, cookie',
            'Access-Control-Request-Method': 'PUT',
            Origin: 'http://localhost:3001',
        },
        method: 'OPTIONS',
    });
    assert.equal(preflight.status, 204);
    assert.match(preflight.headers.get('access-control-allow-methods'), /PUT/);
    assert.equal(preflight.headers.get('access-control-allow-headers'), 'content-type, x-cart');

    const closedPreflight = await fetch(`${base}/echo?cors=no`, { method: 'OPTIONS' });
    assert.equal(closedPreflight.headers.get('access-control-allow-methods'), null);
});

test('delay waits before answering', async () => {
    const started = performance.now();
    const response = await fetch(`${base}/echo?delay=120&status=503`);
    assert.equal(response.status, 503);
    assert.ok(performance.now() - started >= 100);
});

test('stream sends the body in chunks with a Content-Length unless length=no', async () => {
    const response = await fetch(`${base}/stream?chunks=3&interval=10&size=40`);
    assert.equal(response.headers.get('content-length'), '120');
    const text = await response.text();
    assert.equal(text.length, 120);
    assert.match(text, /^Bloque 1 de 3 \.+\nBloque 2 de 3 \.+\nBloque 3 de 3 \.+\n$/);

    const ndjson = await fetch(`${base}/stream?chunks=2&interval=0&format=ndjson&length=no`);
    assert.equal(ndjson.headers.get('content-length'), null);
    assert.match(ndjson.headers.get('content-type'), /application\/x-ndjson/);
    const lines = (await ndjson.text()).trim().split('\n').map((line) => JSON.parse(line));
    assert.deepEqual(lines, [{ n: 1, of: 2, text: 'Bloque 1 de 2' }, { n: 2, of: 2, text: 'Bloque 2 de 2' }]);
});

test('unknown demo paths answer 404 with an HTML page', async () => {
    const response = await fetch(`${base}/products/42`);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get('access-control-allow-origin'), '*');
    const text = await response.text();
    assert.ok(text.startsWith('<!DOCTYPE html>'));
    await assert.rejects(() => Promise.resolve().then(() => JSON.parse(text)), /Unexpected token '<', "<!DOCTYPE "\.\.\. is not valid JSON/);
});
