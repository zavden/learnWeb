import path from 'path';
import { build } from 'esbuild';
import pug from 'pug';
import * as sass from 'sass';
import ts from 'typescript';

const VIRTUAL_NAMESPACE = 'learncode-virtual';
const VIRTUAL_ENTRY = '__learncode_entry__';
const VIRTUAL_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss', '.sass', '.json'];

function createCompileDiagnostic(level, code, message, details = {}) {
    return { level, code, message, ...details };
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
            diagnostics: [],
        };
    }

    if (block.type === 'html' || block.type === 'svg') {
        return {
            html: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'pug') {
        try {
            return {
                html: pug.render(block.content || '', {
                    doctype: 'html',
                }),
                diagnostics: [],
            };
        } catch (error) {
            return {
                html: '',
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

function compileScript(block) {
    if (!block) {
        return {
            js: '',
            diagnostics: [],
        };
    }

    if (block.type === 'javascript') {
        return {
            js: block.content || '',
            diagnostics: [],
        };
    }

    if (block.type === 'typescript') {
        const result = ts.transpileModule(block.content || '', {
            compilerOptions: {
                target: ts.ScriptTarget.ES2020,
                module: ts.ModuleKind.ES2020,
            },
            reportDiagnostics: true,
        });

        const diagnostics = (result.diagnostics || []).map((diagnostic) => createCompileDiagnostic(
            diagnostic.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
            'typescript-transpile',
            formatTsDiagnostic(diagnostic),
            { slot: 'script', type: 'typescript' }
        ));

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

async function buildReactBundle({ contents, loader }) {
    const result = await build({
        absWorkingDir: process.cwd(),
        bundle: true,
        define: {
            'process.env.NODE_ENV': '"development"',
        },
        format: 'iife',
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        logLevel: 'silent',
        minify: false,
        platform: 'browser',
        target: ['es2020'],
        write: false,
        stdin: {
            contents,
            loader,
            resolveDir: process.cwd(),
            sourcefile: `react-example.${loader}`,
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
        const bundle = await buildReactBundle({
            contents: buildReactSingleFileEntry(appBlock.content || ''),
            loader: appBlock.type === 'tsx' ? 'tsx' : 'jsx',
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
                    loader: inferLoader(file.language),
                    resolveDir: path.posix.dirname(args.path),
                };
            });
        },
    };
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
            jsxFactory: 'React.createElement',
            jsxFragment: 'React.Fragment',
            logLevel: 'silent',
            minify: false,
            outdir: 'out',
            platform: 'browser',
            plugins: [createVirtualFilesPlugin(fileMap, entryPath)],
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

export async function compileExampleDocument(sourceDocument) {
    if (sourceDocument?.metadata?.framework === 'react' && sourceDocument?.metadata?.mode === 'multi-file') {
        return compileReactMultiFileDocument(sourceDocument);
    }

    if (sourceDocument?.metadata?.framework === 'react') {
        return compileReactSingleFileDocument(sourceDocument);
    }

    const markupBlock = getBlockBySlot(sourceDocument, 'markup');
    const styleBlock = getBlockBySlot(sourceDocument, 'style');
    const scriptBlock = getBlockBySlot(sourceDocument, 'script');

    const markupResult = compileMarkup(markupBlock);
    const styleResult = compileStyle(styleBlock);
    const scriptResult = compileScript(scriptBlock);

    return {
        compiledDocument: {
            html: markupResult.html,
            css: styleResult.css,
            js: scriptResult.js,
        },
        compileDiagnostics: [
            ...markupResult.diagnostics,
            ...styleResult.diagnostics,
            ...scriptResult.diagnostics,
        ],
    };
}
