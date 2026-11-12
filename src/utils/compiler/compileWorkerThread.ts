import { parentPort } from 'worker_threads';
import { compileExampleDocument } from '../exampleCompiler.ts';
import { errorMessage } from '../errors.ts';
import type { CompileThreadMessage, CompileThreadRequest } from './types.ts';

// Runs inside a worker thread (see isolatedCompiler.ts) so a runaway Sass `@while`, a Pug
// `- while (true) {}` or a huge output can be killed without taking the API server down.
// Protocol: answers each `compile` request with `{ id, ok, result | error }` and announces `ready`
// once the compilers are loaded. `parentPort` is always set here: this module only ever runs as
// the worker started by isolatedCompiler.ts.

parentPort!.on('message', async (message: CompileThreadRequest) => {
    if (message?.type !== 'compile') return;

    try {
        const result = await compileExampleDocument(message.document);
        parentPort!.postMessage({ id: message.id, ok: true, result } satisfies CompileThreadMessage);
    } catch (error) {
        parentPort!.postMessage({ error: errorMessage(error), id: message.id, ok: false } satisfies CompileThreadMessage);
    }
});

parentPort!.postMessage({ type: 'ready' } satisfies CompileThreadMessage);
