import { parentPort } from 'worker_threads';
import { compileExampleDocument } from '../exampleCompiler.js';

// Runs inside a worker thread (see isolatedCompiler.js) so a runaway Sass `@while`, a Pug
// `- while (true) {}` or a huge output can be killed without taking the API server down.

parentPort.on('message', async (message) => {
    if (message?.type !== 'compile') return;

    try {
        const result = await compileExampleDocument(message.document);
        parentPort.postMessage({ id: message.id, ok: true, result });
    } catch (error) {
        parentPort.postMessage({ error: error?.message || String(error), id: message.id, ok: false });
    }
});

parentPort.postMessage({ type: 'ready' });
