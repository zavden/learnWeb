import path from 'path';
import { createHash } from 'crypto';
import { build } from 'esbuild';
import * as sass from 'sass';
import { compile as compileVueTemplate } from '@vue/compiler-dom';
import {
    compileScript as compileVueSfcScript,
    compileStyle as compileVueSfcStyle,
    compileTemplate as compileVueSfcTemplate,
    parse as parseVueSfc,
} from '@vue/compiler-sfc';
import {
    VIRTUAL_ENTRY,
    createCompileDiagnostic,
    hasDiagnosticCode,
    inferLoader,
    normalizeSourcePath,
    normalizeVirtualPath,
    getBlockBySlot,
    getFileBySlot,
} from './helpers.js';
import { compileStyle } from './styleCompiler.js';
import { createInlineModulesPlugin, createVirtualFilesPlugin } from './virtualFilesPlugin.js';

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

export async function compileVueSingleFileDocument(sourceDocument) {
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
                ...validationDiagnostics,
                ...templateResult.diagnostics,
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

export async function compileVueMultiFileDocument(sourceDocument) {
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
