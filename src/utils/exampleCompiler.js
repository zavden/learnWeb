import path from 'path';
import { createHash } from 'crypto';
import { build } from 'esbuild';
import pug from 'pug';
import * as sass from 'sass';
import ts from 'typescript';
import { compile as compileVueTemplate } from '@vue/compiler-dom';
import {
    compileScript as compileVueSfcScript,
    compileStyle as compileVueSfcStyle,
    compileTemplate as compileVueSfcTemplate,
    parse as parseVueSfc,
} from '@vue/compiler-sfc';

const VIRTUAL_NAMESPACE = 'learncode-virtual';
const VIRTUAL_ENTRY = '__learncode_entry__';
const VIRTUAL_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.html', '.css', '.scss', '.sass', '.json', '.vue'];
const INLINE_NAMESPACE = 'learncode-inline';

function createCompileDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
}

function normalizeSourcePath(value = '', fallback = 'source.js') {
    const normalized = normalizeVirtualPath(value);
    return normalized || fallback;
}

function formatTsDiagnostic(diagnostic) {
    return ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
}

function normalizeVirtualPath(value = '') {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

function createVueSfcScopeToken(sourcePath = '') {
    return createHash('sha1')
        .update(String(sourcePath || 'component.vue'))
        .digest('hex')
        .slice(0, 8);
}

function normalizeVueSfcScriptLanguage(language = '') {
    const normalized = String(language || '').trim().toLowerCase();
    if (!normalized || normalized === 'js' || normalized === 'javascript') return 'javascript';
    if (normalized === 'ts' || normalized === 'typescript') return 'typescript';
    return normalized;
}

function normalizeVueSfcStyleLanguage(language = '') {
    const normalized = String(language || '').trim().toLowerCase();
    if (!normalized || normalized === 'css') return 'css';
    if (normalized === 'scss' || normalized === 'sass') return normalized;
    return normalized;
}

function normalizeVueSfcTemplateLanguage(language = '') {
    const normalized = String(language || '').trim().toLowerCase();
    return normalized || 'html';
}

function toVueSfcDiagnosticPosition(error, block = null) {
    const line = error?.loc?.start?.line ?? null;
    const column = error?.loc?.start?.column ?? null;

    if (!block || line == null) {
        return {
            line,
            column,
        };
    }

    return {
        line: (block.loc?.start?.line ?? 1) + line - 1,
        column,
    };
}

function createVueSfcDiagnostic(level, code, message, sourcePath, error = null, block = null, extra = {}) {
    const position = toVueSfcDiagnosticPosition(error, block);

    return createCompileDiagnostic(
        level,
        code,
        message,
        {
            column: position.column,
            file: sourcePath || null,
            line: position.line,
            ...extra,
        }
    );
}

function hasDiagnosticCode(diagnostics = [], code = '') {
    return diagnostics.some((diagnostic) => diagnostic.code === code);
}

function inferLoader(language = '') {
    switch (language) {
        case 'tsx':
            return 'tsx';
        case 'jsx':
            return 'jsx';
        case 'typescript':
        case 'ts':
            return 'ts';
        case 'javascript':
        case 'js':
            return 'js';
        case 'css':
        case 'scss':
        case 'sass':
            return 'css';
        case 'json':
            return 'json';
        default:
            return 'js';
    }
}

function compileMarkup(block) {
    if (!block) {
        return {
            html: '',
            fullDocumentHtml: '',
            diagnostics: [],
        };
    }

    if (block.type === 'html' || block.type === 'svg') {
        return {
            html: block.content || '',
            fullDocumentHtml: '',
            diagnostics: [],
        };
    }

    if (block.type === 'html-full') {
        return {
            html: '',
            fullDocumentHtml: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'pug') {
        try {
            return {
                html: pug.render(block.content || '', {
                    doctype: 'html',
                }),
                fullDocumentHtml: '',
                diagnostics: [],
            };
        } catch (error) {
            return {
                html: '',
                fullDocumentHtml: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'pug-compile-error',
                        error.message || 'Failed to compile Pug.',
                        { slot: 'markup', type: 'pug' }
                    ),
                ],
            };
        }
    }

    return {
        html: '',
        fullDocumentHtml: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-markup-compiler',
                `No compiler available for markup type "${block.type}".`,
                { slot: 'markup', type: block.type }
            ),
        ],
    };
}

function compileStyle(block) {
    if (!block) {
        return {
            css: '',
            diagnostics: [],
        };
    }

    if (block.type === 'css') {
        return {
            css: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'scss' || block.type === 'sass') {
        try {
            const result = sass.compileString(block.content || '', {
                syntax: block.type === 'sass' ? 'indented' : 'scss',
                style: 'expanded',
            });

            return {
                css: result.css,
                diagnostics: [],
            };
        } catch (error) {
            return {
                css: '',
                diagnostics: [
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        error.message || 'Failed to compile style block.',
                        { slot: 'style', type: block.type }
                    ),
                ],
            };
        }
    }

    return {
        css: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-style-compiler',
                `No compiler available for style type "${block.type}".`,
                { slot: 'style', type: block.type }
            ),
        ],
    };
}

function getFileBySlot(sourceDocument, slot) {
    return (sourceDocument?.files || []).find((file) => file.slot === slot) || null;
}

function appendSourceUrl(js = '', sourcePath = '') {
    if (!js || !sourcePath) return js || '';
    if (/sourceURL=|sourceMappingURL=/i.test(js)) return js;
    return `${js}\n//# sourceURL=${sourcePath}`;
}

function compileScript(block, { sourcePath = '' } = {}) {
    if (!block) {
        return {
            js: '',
            diagnostics: [],
        };
    }

    if (block.type === 'javascript') {
        return {
            js: appendSourceUrl(block.content || '', normalizeSourcePath(sourcePath, 'script.js')),
            diagnostics: [],
        };
    }

    if (block.type === 'typescript') {
        const result = ts.transpileModule(block.content || '', {
            compilerOptions: {
                inlineSourceMap: true,
                inlineSources: true,
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ES2020,
            },
            fileName: normalizeSourcePath(sourcePath, 'script.ts'),
            reportDiagnostics: true,
        });

        const diagnostics = (result.diagnostics || []).map((diagnostic) => {
            const sourceFile = diagnostic.file;
            const start = typeof diagnostic.start === 'number' ? diagnostic.start : null;
            const position = sourceFile && start != null ? sourceFile.getLineAndCharacterOfPosition(start) : null;

            return createCompileDiagnostic(
                diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
                'typescript-transpile',
                formatTsDiagnostic(diagnostic),
                {
                    column: position ? position.character + 1 : null,
                    file: normalizeSourcePath(sourcePath, 'script.ts'),
                    line: position ? position.line + 1 : null,
                    slot: 'script',
                    type: 'typescript',
                }
            );
        });

        return {
            js: result.outputText || '',
            diagnostics,
        };
    }

    return {
        js: '',
        diagnostics: [
            createCompileDiagnostic(
                'error',
                'unsupported-script-compiler',
                `No compiler available for script type "${block.type}".`,
                { slot: 'script', type: block.type }
            ),
        ],
    };
}

function getBlockBySlot(sourceDocument, slot) {
    return (sourceDocument?.blocks || []).find((block) => block.slot === slot) || null;
}

function createInlineModulesPlugin(files = new Map(), entryPath = 'entry.js') {
    return {
        name: 'learncode-inline-modules',
        setup(buildContext) {
            buildContext.onResolve({ filter: /.*/ }, async (args) => {
                if (args.path === entryPath && args.kind === 'entry-point') {
                    return { namespace: INLINE_NAMESPACE, path: entryPath };
                }

                if (args.namespace !== INLINE_NAMESPACE) {
                    return null;
                }

                const resolved = args.path.startsWith('.')
                    ? path.posix.normalize(path.posix.join(path.posix.dirname(args.importer), args.path))
                    : args.path;

                if (files.has(resolved)) {
                    return { namespace: INLINE_NAMESPACE, path: resolved };
                }

                if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
                    return buildContext.resolve(args.path, {
                        importer: args.importer,
                        kind: args.kind,
                        resolveDir: process.cwd(),
                    });
                }

                return null;
            });

            buildContext.onLoad({ filter: /.*/, namespace: INLINE_NAMESPACE }, (args) => {
                const file = files.get(args.path);
                if (!file) return null;

                return {
                    contents: file.contents,
                    loader: file.loader,
                    resolveDir: file.resolveDir || process.cwd(),
                };
            });
        },
    };
}

function buildReactSingleFileEntry(appSource = '') {
    return `
import React from 'react';
import { createRoot } from 'react-dom/client';

${appSource}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React root element "#root" was not found.');
}

if (typeof App !== 'function') {
  throw new Error('React single-file examples must define a top-level App component.');
}

const root = createRoot(rootElement);
root.render(React.createElement(App));
`;
}

function validateReactSingleFileAppBlock(appBlock) {
    const diagnostics = [];
    const source = appBlock?.content || '';

    if (!appBlock) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'missing-react-entry',
                'React examples require a JSX or TSX app block.',
                { slot: 'app' }
            )
        );
        return diagnostics;
    }

    if (!['jsx', 'tsx'].includes(appBlock.type)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'unsupported-react-app-block',
                `React examples require JSX or TSX, not "${appBlock.type}".`,
                { slot: 'app', type: appBlock.type }
            )
        );
    }

    if (/^\s*import\s/m.test(source)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'react-single-file-imports-not-supported',
                'React single-file examples cannot use import statements yet.',
                { slot: 'app', type: appBlock.type }
            )
        );
    }

    if (/^\s*export\s/m.test(source)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'react-single-file-exports-not-supported',
                'React single-file examples cannot use export statements yet.',
                { slot: 'app', type: appBlock.type }
            )
        );
    }

    return diagnostics;
}

async function buildReactBundle({ contents, loader, sourcefile }) {
    const result = await build({
        absWorkingDir: process.cwd(),
        bundle: true,
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        format: 'iife',
        jsx: 'automatic',
        jsxImportSource: 'react',
        logLevel: 'silent',
        minify: false,
        platform: 'browser',
        sourcemap: 'inline',
        sourcesContent: true,
        target: ['es2020'],
        write: false,
        stdin: {
            contents,
            loader,
            resolveDir: process.cwd(),
            sourcefile: normalizeSourcePath(sourcefile, `react-example.${loader}`),
        },
        outdir: 'out',
    });

    return {
        js: result.outputFiles?.find((file) => file.path.endsWith('.js'))?.text || '',
        css: result.outputFiles?.find((file) => file.path.endsWith('.css'))?.text || '',
    };
}

async function compileReactSingleFileDocument(sourceDocument) {
    const appBlock = getBlockBySlot(sourceDocument, 'app');
    const styleBlock = getBlockBySlot(sourceDocument, 'style');
    const styleResult = compileStyle(styleBlock);
    const appDiagnostics = validateReactSingleFileAppBlock(appBlock);

    if (appDiagnostics.some((diagnostic) => diagnostic.level === 'error')) {
        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: styleResult.css,
                js: '',
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
                ...appDiagnostics,
            ],
        };
    }

    try {
        const appFile = getFileBySlot(sourceDocument, 'app');
        const bundle = await buildReactBundle({
            contents: buildReactSingleFileEntry(appBlock.content || ''),
            loader: appBlock.type === 'tsx' ? 'tsx' : 'jsx',
            sourcefile: appFile?.path || `react-example.${appBlock.type === 'tsx' ? 'tsx' : 'jsx'}`,
        });

        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: [styleResult.css, bundle.css].filter(Boolean).join('\n\n'),
                js: bundle.js,
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
            ],
        };
    } catch (error) {
        const diagnostics = (error.errors || []).map((entry) => createCompileDiagnostic(
            'error',
            'react-build-error',
            entry.text || 'Failed to compile React example.',
            {
                column: entry.location?.column ?? null,
                file: entry.location?.file ?? null,
                line: entry.location?.line ?? null,
                slot: 'app',
                type: appBlock?.type || 'jsx',
            }
        ));

        if (diagnostics.length === 0) {
            diagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'react-build-error',
                    error.message || 'Failed to compile React example.',
                    { slot: 'app', type: appBlock?.type || 'jsx' }
                )
            );
        }

        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: styleResult.css,
                js: '',
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
                ...diagnostics,
            ],
        };
    }
}

function validateVueSingleFile(markupBlock, scriptBlock) {
    const diagnostics = [];
    const scriptSource = scriptBlock?.content || '';

    if (!markupBlock) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'missing-vue-template',
                'Vue examples require an HTML block for the template.',
                { slot: 'markup' }
            )
        );
        return diagnostics;
    }

    if (markupBlock.type !== 'html') {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'invalid-vue-template-block',
                `Vue examples require an HTML block for the template, not "${markupBlock.type}".`,
                { slot: 'markup', type: markupBlock.type }
            )
        );
    }

    if (!scriptBlock) {
        return diagnostics;
    }

    if (!['javascript', 'typescript'].includes(scriptBlock.type)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'invalid-vue-script-block',
                `Vue examples require JavaScript or TypeScript for the script block, not "${scriptBlock.type}".`,
                { slot: 'script', type: scriptBlock.type }
            )
        );
        return diagnostics;
    }

    if (/(?:^|\n)\s*import\s+[^'"]*['"]\.\.?\//m.test(scriptSource)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-single-file-relative-imports-not-supported',
                'Vue single-file examples cannot use relative imports yet.',
                { slot: 'script', type: scriptBlock.type }
            )
        );
    }

    if (!/\bexport\s+default\b/.test(scriptSource)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-single-file-default-export-required',
                'Vue single-file examples with a script block must export a default component definition, for example `export default { setup() { ... } }` or `export default defineComponent({ ... })`.',
                { slot: 'script', type: scriptBlock.type }
            )
        );
    }

    if (
        /\bdata\s*\(/.test(scriptSource)
        || /\bmethods\s*:/.test(scriptSource)
        || /\bcomputed\s*:/.test(scriptSource)
    ) {
        diagnostics.push(
            createCompileDiagnostic(
                'warning',
                'vue-options-api-detected',
                'Options API still works, but new Vue examples should prefer Composition API via `setup()` or `defineComponent(...)`.',
                { slot: 'script', type: scriptBlock.type }
            )
        );
    }

    return diagnostics;
}

function compileVueTemplateModule(templateSource = '', sourcePath = 'template.html') {
    const errors = [];
    const result = compileVueTemplate(templateSource || '', {
        filename: sourcePath || 'template.html',
        mode: 'module',
        onError: (error) => {
            errors.push(error);
        },
    });

    const diagnostics = errors.map((error) => createCompileDiagnostic(
        'error',
        'vue-template-compile-error',
        error.message || 'Failed to compile Vue template.',
        {
            column: error.loc?.start?.column ?? null,
            file: sourcePath || null,
            line: error.loc?.start?.line ?? null,
            slot: 'markup',
            type: 'html',
        }
    ));

    return {
        code: result?.code
            ? `${result.code}\nexport default render;\n`
            : '',
        diagnostics,
    };
}

function compileVueSfcFile(source = '', sourcePath = 'Component.vue') {
    const diagnostics = [];
    const extractedCss = [];
    const scopeToken = createVueSfcScopeToken(sourcePath);
    let descriptor = null;
    let scriptLanguage = 'javascript';

    try {
        const parsed = parseVueSfc(source || '', {
            filename: sourcePath || 'Component.vue',
        });

        descriptor = parsed.descriptor;

        for (const error of parsed.errors || []) {
            diagnostics.push(
                typeof error === 'string'
                    ? createCompileDiagnostic(
                        'error',
                        'vue-sfc-parse-error',
                        error,
                        { file: sourcePath || null }
                    )
                    : createVueSfcDiagnostic(
                        'error',
                        'vue-sfc-parse-error',
                        error.message || 'Failed to parse Vue SFC.',
                        sourcePath,
                        error
                    )
            );
        }
    } catch (error) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-parse-error',
                error.message || 'Failed to parse Vue SFC.',
                { file: sourcePath || null }
            )
        );

        return {
            code: '',
            css: '',
            diagnostics,
            loader: 'js',
        };
    }

    if (!descriptor) {
        return {
            code: '',
            css: '',
            diagnostics,
            loader: 'js',
        };
    }

    if (/<template\b[^>]*\bsrc\s*=/i.test(source) && !hasDiagnosticCode(diagnostics, 'vue-sfc-template-src-not-supported')) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-template-src-not-supported',
                `Vue SFC "${sourcePath}" cannot use <template src="..."> yet.`,
                { file: sourcePath || null }
            )
        );
    }

    if (/<script\b[^>]*\bsrc\s*=/i.test(source) && !hasDiagnosticCode(diagnostics, 'vue-sfc-script-src-not-supported')) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-src-not-supported',
                `Vue SFC "${sourcePath}" cannot use external <script src="..."> blocks yet.`,
                { file: sourcePath || null }
            )
        );
    }

    if (/<style\b[^>]*\bmodule(?:\s|>|=)/i.test(source) && !hasDiagnosticCode(diagnostics, 'vue-sfc-style-module-not-supported')) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-style-module-not-supported',
                `Vue SFC "${sourcePath}" does not support CSS modules yet.`,
                { file: sourcePath || null }
            )
        );
    }

    if (!descriptor.template) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-template-required',
                `Vue SFC "${sourcePath}" must include a <template> block.`,
                { file: sourcePath || null }
            )
        );
    }

    if (descriptor.customBlocks.length > 0) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-custom-block-not-supported',
                `Vue SFC "${sourcePath}" uses custom blocks, which are not supported yet.`,
                { file: sourcePath || null }
            )
        );
    }

    if (descriptor.template?.src && !hasDiagnosticCode(diagnostics, 'vue-sfc-template-src-not-supported')) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-template-src-not-supported',
                `Vue SFC "${sourcePath}" cannot use <template src="..."> yet.`,
                { file: sourcePath || null }
            )
        );
    }

    const templateLanguage = normalizeVueSfcTemplateLanguage(descriptor.template?.lang);
    if (descriptor.template && templateLanguage !== 'html') {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-template-language-not-supported',
                `Vue SFC "${sourcePath}" only supports plain HTML templates for now.`,
                { file: sourcePath || null, language: templateLanguage }
            )
        );
    }

    if ((descriptor.script?.src || descriptor.scriptSetup?.src) && !hasDiagnosticCode(diagnostics, 'vue-sfc-script-src-not-supported')) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-src-not-supported',
                `Vue SFC "${sourcePath}" cannot use external <script src="..."> blocks yet.`,
                { file: sourcePath || null }
            )
        );
    }

    const normalScriptLanguage = normalizeVueSfcScriptLanguage(descriptor.script?.lang);
    const setupScriptLanguage = normalizeVueSfcScriptLanguage(descriptor.scriptSetup?.lang);

    if (descriptor.script && !['javascript', 'typescript'].includes(normalScriptLanguage)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-language-not-supported',
                `Vue SFC "${sourcePath}" only supports JavaScript or TypeScript script blocks.`,
                { file: sourcePath || null, language: normalScriptLanguage }
            )
        );
    }

    if (descriptor.scriptSetup && !['javascript', 'typescript'].includes(setupScriptLanguage)) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-language-not-supported',
                `Vue SFC "${sourcePath}" only supports JavaScript or TypeScript script blocks.`,
                { file: sourcePath || null, language: setupScriptLanguage }
            )
        );
    }

    if (
        descriptor.script
        && descriptor.scriptSetup
        && normalScriptLanguage !== setupScriptLanguage
    ) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-language-mismatch',
                `Vue SFC "${sourcePath}" cannot mix <script> and <script setup> with different languages.`,
                { file: sourcePath || null }
            )
        );
    }

    descriptor.styles.forEach((styleBlock) => {
        if (styleBlock.src) {
            diagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'vue-sfc-style-src-not-supported',
                    `Vue SFC "${sourcePath}" cannot use <style src="..."> yet.`,
                    { file: sourcePath || null }
                )
            );
        }

        if (styleBlock.module && !hasDiagnosticCode(diagnostics, 'vue-sfc-style-module-not-supported')) {
            diagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'vue-sfc-style-module-not-supported',
                    `Vue SFC "${sourcePath}" does not support CSS modules yet.`,
                    { file: sourcePath || null }
                )
            );
        }

        const styleLanguage = normalizeVueSfcStyleLanguage(styleBlock.lang);
        if (!['css', 'scss', 'sass'].includes(styleLanguage)) {
            diagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'vue-sfc-style-language-not-supported',
                    `Vue SFC "${sourcePath}" only supports CSS, SCSS or SASS styles.`,
                    { file: sourcePath || null, language: styleLanguage }
                )
            );
        }
    });

    if (diagnostics.some((diagnostic) => diagnostic.level === 'error')) {
        return {
            code: '',
            css: '',
            diagnostics,
            loader: 'js',
        };
    }

    let scriptResult = null;

    try {
        if (descriptor.script || descriptor.scriptSetup) {
            scriptResult = compileVueSfcScript(descriptor, {
                id: scopeToken,
                genDefaultAs: '__sfc__',
            });
            scriptLanguage = descriptor.scriptSetup
                ? setupScriptLanguage
                : normalScriptLanguage;
        }
    } catch (error) {
        diagnostics.push(
            createCompileDiagnostic(
                'error',
                'vue-sfc-script-compile-error',
                error.message || `Failed to compile the script block in "${sourcePath}".`,
                { file: sourcePath || null }
            )
        );
    }

    if (diagnostics.some((diagnostic) => diagnostic.level === 'error')) {
        return {
            code: '',
            css: '',
            diagnostics,
            loader: scriptLanguage === 'typescript' ? 'ts' : 'js',
        };
    }

    const hasScopedStyles = descriptor.styles.some((styleBlock) => styleBlock.scoped);
    const templateErrors = [];
    const templateResult = compileVueSfcTemplate({
        source: descriptor.template?.content || '',
        filename: sourcePath || 'Component.vue',
        id: scopeToken,
        scoped: hasScopedStyles,
        compilerOptions: {
            bindingMetadata: scriptResult?.bindings || {},
        },
        onError: (error) => {
            templateErrors.push(error);
        },
    });

    templateErrors.forEach((error) => {
        diagnostics.push(
            createVueSfcDiagnostic(
                'error',
                'vue-sfc-template-compile-error',
                error.message || `Failed to compile the template in "${sourcePath}".`,
                sourcePath,
                error,
                descriptor.template
            )
        );
    });

    descriptor.styles.forEach((styleBlock) => {
        const styleLanguage = normalizeVueSfcStyleLanguage(styleBlock.lang);
        let cssSource = styleBlock.content || '';

        if (styleLanguage === 'scss' || styleLanguage === 'sass') {
            try {
                const sassResult = sass.compileString(cssSource, {
                    syntax: styleLanguage === 'sass' ? 'indented' : 'scss',
                    style: 'expanded',
                });

                cssSource = sassResult.css;
            } catch (error) {
                diagnostics.push(
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        error.message || `Failed to compile style block in "${sourcePath}".`,
                        { file: sourcePath || null, type: styleLanguage }
                    )
                );
                return;
            }
        }

        const compiledStyle = compileVueSfcStyle({
            filename: sourcePath || 'Component.vue',
            id: scopeToken,
            scoped: Boolean(styleBlock.scoped),
            source: cssSource,
        });

        (compiledStyle.errors || []).forEach((error) => {
            if (typeof error === 'string') {
                diagnostics.push(
                    createCompileDiagnostic(
                        'error',
                        'vue-sfc-style-compile-error',
                        error,
                        { file: sourcePath || null }
                    )
                );
                return;
            }

            diagnostics.push(
                createVueSfcDiagnostic(
                    'error',
                    'vue-sfc-style-compile-error',
                    error.message || `Failed to compile a style block in "${sourcePath}".`,
                    sourcePath,
                    error,
                    styleBlock
                )
            );
        });

        if (compiledStyle.code) {
            extractedCss.push(compiledStyle.code);
        }
    });

    const moduleParts = [];

    if (scriptResult?.content) {
        moduleParts.push(scriptResult.content.trim());
    } else {
        moduleParts.push('const __sfc__ = {};');
    }

    if (templateResult?.code) {
        moduleParts.push(templateResult.code.trim());
        moduleParts.push('__sfc__.render = render;');
    }

    if (hasScopedStyles) {
        moduleParts.push(`__sfc__.__scopeId = "data-v-${scopeToken}";`);
    }

    moduleParts.push('export default __sfc__;');

    return {
        code: moduleParts.filter(Boolean).join('\n\n'),
        css: extractedCss.join('\n\n'),
        diagnostics,
        loader: scriptLanguage === 'typescript' ? 'ts' : 'js',
    };
}

function buildVueSingleFileEntry({ componentImportPath, templateImportPath }) {
    return `
import { createApp } from 'vue';
import componentDefinition from ${JSON.stringify(componentImportPath)};
import { render } from ${JSON.stringify(templateImportPath)};

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error('Vue root element "#app" was not found.');
}

const resolvedComponent = componentDefinition ?? {};
const normalizedComponent = typeof resolvedComponent === 'function'
  ? { setup: resolvedComponent, render }
  : { ...resolvedComponent, render };

createApp(normalizedComponent).mount(rootElement);
`;
}

async function buildVueSingleFileBundle({ scriptPath, scriptSource, scriptLoader, templateCode, templatePath }) {
    const entryPath = '__learncode_vue_single__/entry.js';
    const normalizedScriptPath = normalizeSourcePath(
        scriptPath,
        scriptLoader === 'ts' ? 'component.ts' : 'component.js'
    );
    const normalizedTemplatePath = normalizeSourcePath(templatePath, 'index.html');
    const componentImportPath = `./${path.posix.relative(path.posix.dirname(entryPath), normalizedScriptPath)}`;
    const templateImportPath = `./${path.posix.relative(path.posix.dirname(entryPath), normalizedTemplatePath)}`;
    const files = new Map([
        [
            entryPath,
            {
                contents: buildVueSingleFileEntry({
                    componentImportPath,
                    templateImportPath,
                }),
                loader: 'js',
                resolveDir: process.cwd(),
            },
        ],
        [
            normalizedScriptPath,
            {
                contents: scriptSource || 'export default {};',
                loader: scriptLoader,
                resolveDir: process.cwd(),
            },
        ],
        [
            normalizedTemplatePath,
            {
                contents: templateCode,
                loader: 'js',
                resolveDir: process.cwd(),
            },
        ],
    ]);

    const result = await build({
        absWorkingDir: process.cwd(),
        bundle: true,
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        entryPoints: [entryPath],
        format: 'iife',
        logLevel: 'silent',
        minify: false,
        outdir: 'out',
        platform: 'browser',
        plugins: [createInlineModulesPlugin(files, entryPath)],
        sourcemap: 'inline',
        sourcesContent: true,
        target: ['es2020'],
        write: false,
    });

    return {
        js: result.outputFiles?.find((file) => file.path.endsWith('.js'))?.text || '',
    };
}

async function compileVueSingleFileDocument(sourceDocument) {
    const markupBlock = getBlockBySlot(sourceDocument, 'markup');
    const scriptBlock = getBlockBySlot(sourceDocument, 'script');
    const styleBlock = getBlockBySlot(sourceDocument, 'style');
    const markupFile = getFileBySlot(sourceDocument, 'markup');
    const scriptFile = getFileBySlot(sourceDocument, 'script');
    const styleResult = compileStyle(styleBlock);
    const validationDiagnostics = validateVueSingleFile(markupBlock, scriptBlock);
    const templateResult = compileVueTemplateModule(markupBlock?.content || '', markupFile?.path || 'index.html');
    const hasBlockingDiagnostics = [...validationDiagnostics, ...templateResult.diagnostics]
        .some((diagnostic) => diagnostic.level === 'error');

    if (hasBlockingDiagnostics) {
        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: styleResult.css,
                js: '',
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
                ...validationDiagnostics,
                ...templateResult.diagnostics,
            ],
        };
    }

    try {
        const bundle = await buildVueSingleFileBundle({
            scriptPath: scriptFile?.path || '',
            scriptLoader: scriptBlock?.type === 'typescript' ? 'ts' : 'js',
            scriptSource: scriptBlock?.content || 'export default {};',
            templateCode: templateResult.code,
            templatePath: markupFile?.path || 'index.html',
        });

        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: styleResult.css,
                js: bundle.js,
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
                ...validationDiagnostics.filter((diagnostic) => diagnostic.level !== 'error'),
                ...templateResult.diagnostics.filter((diagnostic) => diagnostic.level !== 'error'),
            ],
        };
    } catch (error) {
        const diagnostics = (error.errors || []).map((entry) => createCompileDiagnostic(
            'error',
            'vue-build-error',
            entry.text || 'Failed to compile Vue example.',
            {
                column: entry.location?.column ?? null,
                file: entry.location?.file ?? null,
                line: entry.location?.line ?? null,
            }
        ));

        if (diagnostics.length === 0) {
            diagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'vue-build-error',
                    error.message || 'Failed to compile Vue example.'
                )
            );
        }

        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: styleResult.css,
                js: '',
            },
            compileDiagnostics: [
                ...styleResult.diagnostics,
                ...diagnostics,
            ],
        };
    }
}

function createVirtualReactFileMap(files = []) {
    const diagnostics = [];
    const map = new Map();

    files.forEach((file) => {
        const virtualPath = normalizeVirtualPath(file.path);
        let contents = file.content || '';
        let language = file.language || '';

        if (language === 'scss' || language === 'sass') {
            try {
                const result = sass.compileString(contents, {
                    syntax: language === 'sass' ? 'indented' : 'scss',
                    style: 'expanded',
                });

                contents = result.css;
            } catch (error) {
                diagnostics.push(
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        error.message || `Failed to compile "${virtualPath}".`,
                        { file: virtualPath, type: language }
                    )
                );
                contents = '';
            }
        }

        map.set(virtualPath, {
            ...file,
            contents,
            language,
            path: virtualPath,
        });
    });

    return { diagnostics, map };
}

function resolveVirtualImport(specifier, importerPath, fileMap) {
    const basePath = importerPath ? path.posix.dirname(importerPath) : '';
    const rawCandidate = specifier.startsWith('.')
        ? path.posix.normalize(path.posix.join(basePath, specifier))
        : normalizeVirtualPath(specifier);

    const candidates = [
        rawCandidate,
        ...VIRTUAL_EXTENSIONS.map((extension) => `${rawCandidate}${extension}`),
        ...VIRTUAL_EXTENSIONS.map((extension) => `${rawCandidate}/index${extension}`),
    ].map(normalizeVirtualPath);

    return candidates.find((candidate) => fileMap.has(candidate)) || null;
}

function createVirtualFilesPlugin(fileMap, entryPath) {
    return {
        name: 'learncode-virtual-files',
        setup(buildContext) {
            buildContext.onResolve({ filter: /.*/ }, async (args) => {
                if (args.path === VIRTUAL_ENTRY && args.kind === 'entry-point') {
                    return { namespace: VIRTUAL_NAMESPACE, path: entryPath };
                }

                if (args.namespace !== VIRTUAL_NAMESPACE) {
                    return null;
                }

                const resolved = resolveVirtualImport(args.path, args.importer, fileMap);
                if (!resolved) {
                    if (!args.path.startsWith('.') && !args.path.startsWith('/')) {
                        return buildContext.resolve(args.path, {
                            importer: args.importer,
                            kind: args.kind,
                            resolveDir: process.cwd(),
                        });
                    }

                    return null;
                }

                return { namespace: VIRTUAL_NAMESPACE, path: resolved };
            });

            buildContext.onLoad({ filter: /.*/, namespace: VIRTUAL_NAMESPACE }, (args) => {
                const file = fileMap.get(args.path);
                if (!file) return null;

                return {
                    contents: file.contents,
                    loader: file.loader || inferLoader(file.language),
                    resolveDir: path.posix.dirname(args.path),
                };
            });
        },
    };
}

function createVirtualVueFileMap(files = []) {
    const diagnostics = [];
    const map = new Map();
    const extractedStyles = [];

    files.forEach((file) => {
        const virtualPath = normalizeVirtualPath(file.path);
        let contents = file.content || '';
        let language = file.language || '';
        let loader = null;

        if (language === 'scss' || language === 'sass') {
            try {
                const result = sass.compileString(contents, {
                    syntax: language === 'sass' ? 'indented' : 'scss',
                    style: 'expanded',
                });

                contents = result.css;
                loader = 'css';
            } catch (error) {
                diagnostics.push(
                    createCompileDiagnostic(
                        'error',
                        'sass-compile-error',
                        error.message || `Failed to compile "${virtualPath}".`,
                        { file: virtualPath, type: language }
                    )
                );
                contents = '';
                loader = 'css';
            }
        }

        if (language === 'html') {
            const templateResult = compileVueTemplateModule(contents, virtualPath);
            diagnostics.push(...templateResult.diagnostics);
            contents = templateResult.code || 'export const render = () => null;\nexport default render;\n';
            loader = 'js';
            language = 'javascript';
        }

        if (language === 'vue') {
            const sfcResult = compileVueSfcFile(contents, virtualPath);
            diagnostics.push(...sfcResult.diagnostics);
            contents = sfcResult.code || 'const __sfc__ = {};\nexport default __sfc__;\n';
            loader = sfcResult.loader || 'js';
            language = loader === 'ts' ? 'typescript' : 'javascript';

            if (sfcResult.css) {
                extractedStyles.push(sfcResult.css);
            }
        }

        map.set(virtualPath, {
            ...file,
            contents,
            language,
            loader: loader || inferLoader(language),
            path: virtualPath,
        });
    });

    return { diagnostics, extractedStyles, map };
}

async function compileReactMultiFileDocument(sourceDocument) {
    const files = sourceDocument.files || [];
    const entryPath = normalizeVirtualPath(sourceDocument?.metadata?.entry || '');
    const { diagnostics: fileDiagnostics, map: fileMap } = createVirtualReactFileMap(files);

    if (!entryPath || !fileMap.has(entryPath)) {
        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: '',
                js: '',
            },
            compileDiagnostics: [
                ...fileDiagnostics,
                createCompileDiagnostic(
                    'error',
                    'missing-react-entry-file',
                    entryPath
                        ? `Entry file "${entryPath}" does not exist in this project.`
                        : 'React multi-file examples must declare a valid entry file.',
                    { entry: entryPath || null }
                ),
            ],
        };
    }

    try {
        const result = await build({
            absWorkingDir: process.cwd(),
            bundle: true,
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        entryPoints: [VIRTUAL_ENTRY],
        format: 'iife',
        jsx: 'automatic',
        jsxImportSource: 'react',
        logLevel: 'silent',
        minify: false,
        outdir: 'out',
        platform: 'browser',
        plugins: [createVirtualFilesPlugin(fileMap, entryPath)],
        sourcemap: 'inline',
        sourcesContent: true,
        target: ['es2020'],
        write: false,
    });

        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: result.outputFiles?.find((file) => file.path.endsWith('.css'))?.text || '',
                js: result.outputFiles?.find((file) => file.path.endsWith('.js'))?.text || '',
            },
            compileDiagnostics: fileDiagnostics,
        };
    } catch (error) {
        const buildDiagnostics = (error.errors || []).map((entry) => createCompileDiagnostic(
            'error',
            'react-build-error',
            entry.text || 'Failed to compile React multi-file example.',
            {
                column: entry.location?.column ?? null,
                file: entry.location?.file ?? null,
                line: entry.location?.line ?? null,
            }
        ));

        if (buildDiagnostics.length === 0) {
            buildDiagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'react-build-error',
                    error.message || 'Failed to compile React multi-file example.'
                )
            );
        }

        return {
            compiledDocument: {
                framework: 'react',
                html: '<div id="root"></div>',
                css: '',
                js: '',
            },
            compileDiagnostics: [
                ...fileDiagnostics,
                ...buildDiagnostics,
            ],
        };
    }
}

async function compileVueMultiFileDocument(sourceDocument) {
    const files = sourceDocument.files || [];
    const entryPath = normalizeVirtualPath(sourceDocument?.metadata?.entry || '');
    const { diagnostics: fileDiagnostics, extractedStyles, map: fileMap } = createVirtualVueFileMap(files);

    if (!entryPath || !fileMap.has(entryPath)) {
        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: '',
                js: '',
            },
            compileDiagnostics: [
                ...fileDiagnostics,
                createCompileDiagnostic(
                    'error',
                    'missing-vue-entry-file',
                    entryPath
                        ? `Entry file "${entryPath}" does not exist in this project.`
                        : 'Vue multi-file examples must declare a valid entry file.',
                    { entry: entryPath || null }
                ),
            ],
        };
    }

    if (fileDiagnostics.some((diagnostic) => diagnostic.level === 'error')) {
        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: '',
                js: '',
            },
            compileDiagnostics: fileDiagnostics,
        };
    }

    try {
        const result = await build({
            absWorkingDir: process.cwd(),
            bundle: true,
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        entryPoints: [VIRTUAL_ENTRY],
        format: 'iife',
        logLevel: 'silent',
        minify: false,
        outdir: 'out',
        platform: 'browser',
        plugins: [createVirtualFilesPlugin(fileMap, entryPath)],
        sourcemap: 'inline',
        sourcesContent: true,
        target: ['es2020'],
        write: false,
    });

        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: [
                    result.outputFiles?.find((file) => file.path.endsWith('.css'))?.text || '',
                    ...extractedStyles,
                ].filter(Boolean).join('\n\n'),
                js: result.outputFiles?.find((file) => file.path.endsWith('.js'))?.text || '',
            },
            compileDiagnostics: fileDiagnostics,
        };
    } catch (error) {
        const buildDiagnostics = (error.errors || []).map((entry) => createCompileDiagnostic(
            'error',
            'vue-build-error',
            entry.text || 'Failed to compile Vue multi-file example.',
            {
                column: entry.location?.column ?? null,
                file: entry.location?.file ?? null,
                line: entry.location?.line ?? null,
            }
        ));

        if (buildDiagnostics.length === 0) {
            buildDiagnostics.push(
                createCompileDiagnostic(
                    'error',
                    'vue-build-error',
                    error.message || 'Failed to compile Vue multi-file example.'
                )
            );
        }

        return {
            compiledDocument: {
                framework: 'vue',
                html: '<div id="app"></div>',
                css: '',
                js: '',
            },
            compileDiagnostics: [
                ...fileDiagnostics,
                ...buildDiagnostics,
            ],
        };
    }
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
