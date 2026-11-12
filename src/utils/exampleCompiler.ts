import { getBlockBySlot, getFileBySlot } from './compiler/helpers.ts';
import { compileMarkup } from './compiler/markupCompiler.ts';
import { compileStyle } from './compiler/styleCompiler.ts';
import { compileScript } from './compiler/scriptCompiler.ts';
import { compileReactSingleFileDocument, compileReactMultiFileDocument } from './compiler/reactCompiler.ts';
import { compileVueSingleFileDocument, compileVueMultiFileDocument } from './compiler/vueCompiler.ts';

function isDisabledFlag(value) {
    return value === false || String(value ?? '').trim().toLowerCase() === 'false';
}

export async function compileExampleDocument(sourceDocument) {
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

    const metadata = sourceDocument?.metadata || {};
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
            compileDiagnostics: [
                ...markupResult.diagnostics,
            ],
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
        compileDiagnostics: [
            ...markupResult.diagnostics,
            ...styleResult.diagnostics,
            ...scriptResult.diagnostics,
        ],
    };
}
