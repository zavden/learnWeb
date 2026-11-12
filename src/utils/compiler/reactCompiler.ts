// React compilers (called by src/utils/exampleCompiler.ts for `framework: react`). Both bundle with
// esbuild into one development IIFE (automatic JSX runtime, inline source map) that mounts on
// `<div id="root">`; React itself comes from the app's node_modules.
// - Single file (legacy blocks): a JSX/TSX `app` block that defines `App` (no imports or exports) plus
//   an optional style block; a generated entry renders `<App />`.
// - Multi-file (virtual files): the project's files, starting at the `entry` metadata; SCSS/Sass files
//   are compiled to CSS before bundling, CSS imports end up in the bundle's CSS.

import path from 'path';
import { build, type BuildFailure } from 'esbuild';
import * as sass from 'sass';
import type { CompileResult, CompileSourceDocument } from '../../types/compile.ts';
import type { Diagnostic } from '../../types/diagnostics.ts';
import type { VirtualFile } from '../../types/document.ts';
import {
    VIRTUAL_ENTRY,
    createCompileDiagnostic,
    normalizeSourcePath,
    normalizeVirtualPath,
    getBlockBySlot,
    getFileBySlot,
} from './helpers.ts';
import { compileStyle } from './styleCompiler.ts';
import type { CompilerBlock, InlineModule, ProjectModule } from './types.ts';
import { createVirtualFilesPlugin, createInlineModulesPlugin } from './virtualFilesPlugin.ts';

function buildReactSingleFileEntry(appImportPath: string): string {
    return `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from ${JSON.stringify(appImportPath)};

globalThis.React = React;

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('React root element "#root" was not found.');
}

const root = createRoot(rootElement);
root.render(React.createElement(App));
`;
}

function validateReactSingleFileAppBlock(appBlock: CompilerBlock | null): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
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

interface ReactSingleFileBundleInput {
    appSource: string;
    /** Document path of the app block (`App.jsx`); `react-example.<loader>` when empty. */
    appPath: string;
    loader: 'jsx' | 'tsx';
}

async function buildReactSingleFileBundle({ appSource, appPath, loader }: ReactSingleFileBundleInput): Promise<{ js: string; css: string }> {
    const entryPath = '__learncode_react_single__/entry.js';
    const normalizedAppPath = normalizeSourcePath(appPath, `react-example.${loader}`);
    const appImportPath = `./${path.posix.relative(
        path.posix.dirname(entryPath),
        normalizedAppPath,
    )}`;

    const files = new Map<string, InlineModule>([
        [
            entryPath,
            {
                contents: buildReactSingleFileEntry(appImportPath),
                loader: 'jsx',
                resolveDir: process.cwd(),
            },
        ],
        [
            normalizedAppPath,
            {
                contents: `${appSource}\nexport { App };`,
                loader,
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
        jsx: 'automatic',
        jsxImportSource: 'react',
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
        css: result.outputFiles?.find((file) => file.path.endsWith('.css'))?.text || '',
    };
}

/**
 * Compiles a single-file React example (an `app` block and an optional style block). Validation and
 * build errors leave `js` empty; the style block's CSS is kept so the page still gets its styles.
 */
export async function compileReactSingleFileDocument(sourceDocument: CompileSourceDocument): Promise<CompileResult> {
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
        const bundle = await buildReactSingleFileBundle({
            // The app block exists: without one, validation reported an error and we returned above.
            appSource: appBlock!.content || '',
            appPath: appFile?.path || '',
            loader: appBlock!.type === 'tsx' ? 'tsx' : 'jsx',
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
                ...appDiagnostics,
            ],
        };
    } catch (caught) {
        // esbuild throws a BuildFailure (one entry in `errors` per problem); anything else only has a message.
        const error = caught as Partial<BuildFailure>;
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

/** The project files keyed by normalized path, with SCSS/Sass compiled to CSS (a failed file becomes empty). */
function createVirtualReactFileMap(files: readonly VirtualFile[] = []): { diagnostics: Diagnostic[]; map: Map<string, ProjectModule> } {
    const diagnostics: Diagnostic[] = [];
    const map = new Map<string, ProjectModule>();

    files.forEach((file) => {
        const virtualPath = normalizeVirtualPath(file.path);
        let contents = file.content || '';
        const language = file.language || '';

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
                        (error as Error).message || `Failed to compile "${virtualPath}".`,
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

/**
 * Compiles a multi-file React project from its `entry` file. A missing entry or a build error leaves
 * `css` and `js` empty; Sass errors are reported but the build still runs without that file's CSS.
 */
export async function compileReactMultiFileDocument(sourceDocument: CompileSourceDocument): Promise<CompileResult> {
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
    } catch (caught) {
        // esbuild throws a BuildFailure (one entry in `errors` per problem); anything else only has a message.
        const error = caught as Partial<BuildFailure>;
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
