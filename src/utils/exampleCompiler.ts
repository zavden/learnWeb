// Entry point of compilation: turns an example document into a `CompileResult` (src/types/compile.ts).
// React and Vue examples go to their own compilers (single-file for legacy blocks, multi-file for
// virtual files); every other example is compiled block by block: markup (HTML/SVG/Pug/HTML-FULL), style
// (CSS/SCSS/Sass) and script (JavaScript/TypeScript), in src/utils/compiler/.
// Runs under Node only, inside the isolated worker thread (src/utils/compiler/compileWorkerThread.ts) for
// the server and the scripts, and directly in tests. Shader examples never get here.
//
// The output is hashed by the course snapshot: keep the order of the returned object keys and of the
// diagnostics (markup, style, script).

import type { CompileResult, CompileSourceDocument } from '../types/compile.ts';
import type { ExampleMetadata, MetadataValue } from '../types/document.ts';
import { getBlockBySlot, getFileBySlot } from './compiler/helpers.ts';
import { compileMarkup } from './compiler/markupCompiler.ts';
import { compileStyle } from './compiler/styleCompiler.ts';
import { compileScript } from './compiler/scriptCompiler.ts';
import { compileReactSingleFileDocument, compileReactMultiFileDocument } from './compiler/reactCompiler.ts';
import { compileVueSingleFileDocument, compileVueMultiFileDocument } from './compiler/vueCompiler.ts';

/** `false` or the text `false` (any case or spacing): how `loop_protect` and `typecheck` are turned off. */
function isDisabledFlag(value: MetadataValue | undefined): boolean {
    return (
        value === false ||
        String(value ?? '')
            .trim()
            .toLowerCase() === 'false'
    );
}

/**
 * Compiles an example document. Compile errors are reported as `compileDiagnostics` (next to whatever
 * output could still be produced) rather than thrown. A missing document compiles to an empty page; an
 * HTML-FULL document keeps only its markup (other blocks are compiled but their output is dropped).
 */
export async function compileExampleDocument(
    sourceDocument: CompileSourceDocument | null | undefined,
): Promise<CompileResult> {
    if (sourceDocument?.metadata?.framework === 'react' && sourceDocument?.sourceFormat === 'virtual-files') {
        return compileReactMultiFileDocument(sourceDocument);
    }

    if (sourceDocument?.metadata?.framework === 'react') {
        return compileReactSingleFileDocument(sourceDocument);
    }

    if (sourceDocument?.metadata?.framework === 'vue' && sourceDocument?.sourceFormat === 'virtual-files') {
        return compileVueMultiFileDocument(sourceDocument);
    }

    if (sourceDocument?.metadata?.framework === 'vue') {
        return compileVueSingleFileDocument(sourceDocument);
    }

    const markupBlock = getBlockBySlot(sourceDocument, 'markup');
    const styleBlock = getBlockBySlot(sourceDocument, 'style');
    const scriptBlock = getBlockBySlot(sourceDocument, 'script');
    const scriptFile = getFileBySlot(sourceDocument, 'script');

    const metadata: ExampleMetadata = sourceDocument?.metadata || {};
    const markupResult = compileMarkup(markupBlock, { loopProtect: !isDisabledFlag(metadata.loop_protect) });
    const styleResult = compileStyle(styleBlock);
    const scriptResult = compileScript(scriptBlock, {
        loopProtect: !isDisabledFlag(metadata.loop_protect),
        sourcePath: scriptFile?.path || '',
        typeCheck: !isDisabledFlag(metadata.typecheck),
    });

    if (markupBlock?.type === 'html-full') {
        return {
            compiledDocument: {
                css: '',
                fullDocumentHtml: markupResult.fullDocumentHtml,
                html: '',
                js: '',
            },
            compileDiagnostics: [...markupResult.diagnostics],
        };
    }

    return {
        compiledDocument: {
            html: markupResult.html,
            css: styleResult.css,
            js: scriptResult.js,
            ...(scriptResult.jsView ? { jsView: scriptResult.jsView } : {}),
            lang: String(metadata.lang ?? '').trim(),
            markupType: markupBlock?.type || '',
            runtimeScriptPath: scriptFile?.path || '',
        },
        compileDiagnostics: [...markupResult.diagnostics, ...styleResult.diagnostics, ...scriptResult.diagnostics],
    };
}
