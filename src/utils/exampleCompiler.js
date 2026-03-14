import { getBlockBySlot, getFileBySlot } from './compiler/helpers.js';
import { compileMarkup } from './compiler/markupCompiler.js';
import { compileStyle } from './compiler/styleCompiler.js';
import { compileScript } from './compiler/scriptCompiler.js';
import { compileReactSingleFileDocument, compileReactMultiFileDocument } from './compiler/reactCompiler.js';
import { compileVueSingleFileDocument, compileVueMultiFileDocument } from './compiler/vueCompiler.js';

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

    const markupResult = compileMarkup(markupBlock);
    const styleResult = compileStyle(styleBlock);
    const scriptResult = compileScript(scriptBlock, { sourcePath: scriptFile?.path || '' });

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
