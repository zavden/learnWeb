import path from 'path';
import {
    VIRTUAL_NAMESPACE,
    VIRTUAL_EXTENSIONS,
    INLINE_NAMESPACE,
    inferLoader,
    normalizeVirtualPath,
} from './helpers.js';

export function createInlineModulesPlugin(files = new Map(), entryPath = 'entry.js') {
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

export function resolveVirtualImport(specifier, importerPath, fileMap) {
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

export function createVirtualFilesPlugin(fileMap, entryPath) {
    return {
        name: 'learncode-virtual-files',
        setup(buildContext) {
            buildContext.onResolve({ filter: /.*/ }, async (args) => {
                if (args.path === '__learncode_entry__' && args.kind === 'entry-point') {
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
