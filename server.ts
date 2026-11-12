// The local API of LearnWeb: an Express 4 server on 127.0.0.1:3001 (`node server.ts`, started next to
// Vite by `npm run dev`). Vite proxies `/api` to it, so the app talks to it same-origin.
//
// It reads and writes the repository: the material tree, theory (`main.md`) and examples of a topic,
// topic assets, the dotfiles (`.favorites`, `.pending`, `.hiddens`, `.vim_enable`, `.clipboard_default`)
// and `vim-shortcuts.yaml`. It also compiles examples (`/api/compile`, in a worker thread) and hosts the
// rendered preview documents (`/api/preview-documents`, `/preview/...`) on this origin, which is
// cross-origin to the app on purpose. Payload shapes are in src/types/api.ts.
//
// Security: pages running learner code can reach this server, so every path that comes from a URL or
// a body goes through `resolveInside` / `assertPlainSegment` / `resolveTopicDir` / `resolveExampleFile`
// (a refusal is a `PathError`, answered by `sendRouteError`), and requests from foreign origins are
// refused before any route runs (the only cross-origin exceptions are read-only topic assets and the
// demo API). Keep those checks, the body limit, the status codes and the headers exactly as they are.
// The whole server lives in this one file; routes are grouped by section comment.

import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    buildExampleDocument,
    createExampleDocumentFromPreset,
    parseExampleDocument,
} from './src/utils/markdown.ts';
import { cloneSerializable, createCompileCacheKey } from './src/utils/compileCache.ts';
import { compileExampleDocumentIsolated, warmUpIsolatedCompiler } from './src/utils/compiler/isolatedCompiler.ts';
import {
    readClipboardDefaultState,
    readVimDefaultState,
    writeClipboardDefaultState,
    writeVimDefaultState,
} from './src/utils/editorDefaults.ts';
import {
    addFavorite,
    readFavoritesState,
    removeFavorite,
    resolveFavorites,
} from './src/utils/favoritesStore.ts';
import {
    addPending,
    readPendingState,
    removePending,
    resolvePending,
} from './src/utils/pendingStore.ts';
import { loadVimShortcutConfig } from './src/editor/vimShortcutConfig.ts';
import { buildMaterialTree, readHiddenState, setChapterHidden } from './src/utils/materialTree.ts';
import { createDemoApiRouter } from './src/utils/demoApi.ts';
import { errorMessage } from './src/utils/errors.ts';
import type {
    ClipboardDefaultState,
    CreateExampleResponse,
    CreateFolderResponse,
    CreateItemRequest,
    EditorFlagRequest,
    ExampleDeleteResponse,
    ExampleModifyRequest,
    ExampleModifyResponse,
    ExamplePathRequest,
    ExampleReadResponse,
    ExampleRenameRequest,
    ExampleRenameResponse,
    ExampleSaveRequest,
    ExampleSaveResponse,
    ExamplesListResponse,
    FavoriteChangeResponse,
    FavoritesResponse,
    HiddenStateResponse,
    PendingChangeResponse,
    PendingResponse,
    PreviewDocumentRequest,
    PreviewDocumentResponse,
    SetChapterHiddenRequest,
    SetChapterHiddenResponse,
    TopicAsset,
    TopicAssetsResponse,
    TopicMainResponse,
    TopicMainWriteRequest,
    TopicMainWriteResponse,
    TreeResponse,
    VimDefaultState,
    VimShortcutsResponse,
} from './src/types/api.ts';
import type { CompileErrorResponse, CompileRequest, CompileResponse } from './src/types/compile.ts';
import type { ExampleDocument } from './src/types/document.ts';
import type { ExampleListState } from './src/types/material.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MATERIAL_DIR = path.join(__dirname, 'material');
const HIDDEN_STATE_FILE = path.join(__dirname, '.hiddens');
const VIM_DEFAULT_FILE = path.join(__dirname, '.vim_enable');
const CLIPBOARD_DEFAULT_FILE = path.join(__dirname, '.clipboard_default');
const FAVORITES_FILE = path.join(__dirname, '.favorites');
const PENDING_FILE = path.join(__dirname, '.pending');
const VIM_SHORTCUTS_FILE = path.join(__dirname, 'vim-shortcuts.yaml');

const app = express();

// The API is only meant to be used by the local Vite app (same origin through the proxy).
// Topic assets are the exception: sandboxed preview iframes have an opaque ("null") origin
// and need CORS to fetch() them, so only read-only asset GETs are opened to any origin.
const ASSET_ROUTE_PATTERN = /^\/api\/topic\/[^/]+\/[^/]+\/[^/]+\/assets(\/|$)/;
const LOCAL_APP_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/i;
const assetCors = cors({ origin: '*', methods: ['GET', 'HEAD'] });
const appCors = cors({
    origin(origin, callback) {
        callback(null, !origin || LOCAL_APP_ORIGIN_PATTERN.test(origin));
    },
});
// The demo API of the network lessons (fetch, CORS, streams) is open to any origin: it reads no
// files and only echoes the request back. It sets its own CORS headers (see src/utils/demoApi.ts).
app.use('/api/demo', createDemoApiRouter());

// Origin gate, ahead of every other route: read-only asset requests get open CORS; any other request
// that carries a non-local Origin header is refused with 403; the rest gets CORS headers for the
// local app origins only.
app.use((req: Request, res: Response, next: NextFunction) => {
    if ((req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') && ASSET_ROUTE_PATTERN.test(req.path)) {
        // Lets the preview runtime read the status of a failed asset request (a 404 module import) in
        // its resource timings, also from sandboxed srcdoc copies.
        res.set('Timing-Allow-Origin', '*');
        return assetCors(req, res, next);
    }

    const origin = req.headers.origin;
    if (origin && !LOCAL_APP_ORIGIN_PATTERN.test(origin)) {
        return res.status(403).json({ error: 'Origin not allowed' });
    }

    return appCors(req, res, next);
});
// Bodies are JSON; 20 MB leaves room for whole example documents and rendered preview HTML.
app.use(express.json({ limit: '20mb' }));

// ─── Request types ──────────────────────────────────────

/** Route parameters that name a topic: `/api/topic/:ch/:sec/:top/...`. */
interface TopicParams {
    ch: string;
    sec: string;
    top: string;
}

/** A topic route that ends in `*` (the example or asset file name): Express exposes the capture as `params[0]`. */
interface TopicWildcardParams extends TopicParams {
    0: string;
}

/** `/preview/:ch/:sec/:top/:id/*`. */
interface PreviewParams extends TopicWildcardParams {
    id: string;
}

/** Routes without parameters. */
type NoParams = Record<string, never>;

// Request bodies are untrusted JSON: every field may be missing or have another type, so the payload
// types of src/types/api.ts are used as `Partial` and each handler keeps checking what it reads.

// ─── Compile cache ──────────────────────────────────────

const COMPILE_CACHE_MAX_ENTRIES = 120;
/** Least recently used first (a hit re-inserts its key); holds the response payloads of `/api/compile`. */
const compileCache = new Map<string, CompileResponse>();

// ─── Helpers ────────────────────────────────────────────

/** Folder-name slug: ASCII lowercase letters and digits joined by single dashes. */
function slugify(name?: string | null): string {
    return String(name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

/** A request that names a path outside what it may touch; `sendRouteError` answers it with `status`. */
class PathError extends Error {
    readonly status: number;

    constructor(message: string, status = 400) {
        super(message);
        this.status = status;
    }
}

/**
 * Resolves `segments` under `baseDir` and refuses anything that escapes it (`..`, absolute paths,
 * encoded separators decoded by Express, etc.) with a `PathError('Invalid path')`.
 */
function resolveInside(baseDir: string, ...segments: string[]): string {
    const base = path.resolve(baseDir);
    const target = path.resolve(base, ...segments.map((segment) => String(segment ?? '')));
    if (target !== base && !target.startsWith(base + path.sep)) {
        throw new PathError('Invalid path');
    }
    return target;
}

/** A single path segment: not empty, not `.` or `..`, no separator and no NUL. Anything else throws a `PathError` ("Invalid <label>"). */
function assertPlainSegment(value: unknown, label = 'segment'): string {
    const segment = String(value ?? '');
    if (!segment || segment === '.' || segment === '..' || /[\\/\0]/.test(segment)) {
        throw new PathError(`Invalid ${label}`);
    }
    return segment;
}

/** Absolute folder of the topic named by the route params; every segment is validated. */
function resolveTopicDir(params: Partial<TopicParams> = {}): string {
    return resolveInside(
        MATERIAL_DIR,
        assertPlainSegment(params.ch, 'chapter'),
        assertPlainSegment(params.sec, 'section'),
        assertPlainSegment(params.top, 'topic'),
    );
}

/** Absolute path of an example file of the topic; only plain `.md` file names are accepted. */
function resolveExampleFile(params: Partial<TopicParams> = {}, filename: unknown = ''): string {
    const name = assertPlainSegment(filename, 'filename');
    if (!name.toLowerCase().endsWith('.md')) {
        throw new PathError('Examples must be .md files');
    }
    return resolveInside(resolveTopicDir(params), 'examples', name);
}

/** Answers a failed route: the `PathError` status, or 500, with the error message. */
function sendRouteError(res: Response, err: unknown): void {
    const status = err instanceof PathError ? err.status : 500;
    const message = typeof err === 'object' && err !== null && 'message' in err ? err.message : undefined;
    res.status(status).json({ error: message || 'Unexpected error' });
}

/** Repository-relative path with `/` separators, the form `.favorites` and `.pending` store. */
function toMaterialRelativePath(absolutePath: string): string {
    return path.relative(path.dirname(MATERIAL_DIR), absolutePath).split(path.sep).join('/');
}

/** A state dotfile (`.favorites`, `.pending`) with the functions that read and edit it. */
type ExampleListStore = [
    stateFile: string,
    readState: (stateFile: string) => ExampleListState,
    removeEntry: (stateFile: string, relativePath: string) => ExampleListState,
    addEntry: (stateFile: string, relativePath: string) => ExampleListState,
];

/**
 * After an example file is deleted or renamed, drops it from the favorites and pending lists (and
 * lists `replacementPath` instead when it was renamed). A failure is logged, never thrown.
 */
function forgetExampleReferences(absolutePath: string, replacementPath = ''): void {
    const relativePath = toMaterialRelativePath(absolutePath);
    const replacement = replacementPath ? toMaterialRelativePath(replacementPath) : '';

    const stores: ExampleListStore[] = [
        [FAVORITES_FILE, readFavoritesState, removeFavorite, addFavorite],
        [PENDING_FILE, readPendingState, removePending, addPending],
    ];
    for (const [stateFile, readState, removeEntry, addEntry] of stores) {
        try {
            if (!readState(stateFile).items.includes(relativePath)) continue;
            removeEntry(stateFile, relativePath);
            if (replacement) addEntry(stateFile, replacement);
        } catch (err) {
            console.warn(`Could not update ${path.basename(stateFile)}:`, errorMessage(err));
        }
    }
}

/** Two-digit number after the highest `<prefix>NN-` entry (`ch`, `sec`, `top`): the next folder number. */
function getNextNumber(entries: string[], prefix: string): string {
    let max = 0;
    for (const entry of entries) {
        const m = entry.match(new RegExp(`^${prefix}(\\d+)-`));
        if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return String(max + 1).padStart(2, '0');
}

/** Creates the folder (and its parents) when it is missing. */
function ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

/** A copy of the cached response (and marks it most recently used), or null. */
function getCachedCompileResponse(cacheKey: string): CompileResponse | null {
    if (!compileCache.has(cacheKey)) return null;

    const cached = compileCache.get(cacheKey)!; // `has` was just checked
    compileCache.delete(cacheKey);
    compileCache.set(cacheKey, cached);
    return cloneSerializable(cached);
}

/** Stores a copy of the response, evicting the least recently used entries beyond `COMPILE_CACHE_MAX_ENTRIES`. */
function setCachedCompileResponse(cacheKey: string, responsePayload: CompileResponse): void {
    if (compileCache.has(cacheKey)) {
        compileCache.delete(cacheKey);
    }

    compileCache.set(cacheKey, cloneSerializable(responsePayload));

    while (compileCache.size > COMPILE_CACHE_MAX_ENTRIES) {
        const oldestKey = compileCache.keys().next().value!; // the loop condition guarantees an entry
        compileCache.delete(oldestKey);
    }
}

// ─── GET /api/tree ──────────────────────────────────────

app.get('/api/tree', (req, res) => {
    try {
        const includeHidden = req.query.includeHidden === '1';
        const tree = buildMaterialTree(MATERIAL_DIR, {
            hiddenStateFile: HIDDEN_STATE_FILE,
            includeHidden,
        });

        res.json(tree satisfies TreeResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

// ─── Hidden chapters (`.hiddens`) ───────────────────────

app.get('/api/tree/hidden-state', (req, res) => {
    try {
        res.json(readHiddenState(HIDDEN_STATE_FILE) satisfies HiddenStateResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.patch('/api/tree/chapters/:chapterId/hidden', (req: Request<{ chapterId: string }, unknown, Partial<SetChapterHiddenRequest>>, res: Response) => {
    try {
        const chapterId = String(req.params.chapterId || '').trim();
        const hidden = req.body?.hidden !== false;

        if (!chapterId || !/^ch\d+-[^/\\]+$/.test(chapterId) || chapterId.includes('..')) {
            return res.status(400).json({ error: 'Invalid chapter id' });
        }

        const chapterPath = resolveInside(MATERIAL_DIR, chapterId);

        if (!fs.existsSync(chapterPath) || !fs.statSync(chapterPath).isDirectory()) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const hiddenState = setChapterHidden(HIDDEN_STATE_FILE, chapterId, hidden);
        const tree = buildMaterialTree(MATERIAL_DIR, {
            hiddenStateFile: HIDDEN_STATE_FILE,
            includeHidden: false,
        });

        res.json({
            chapterId,
            hidden,
            hiddenState,
            tree,
        } satisfies SetChapterHiddenResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

// ─── Editor defaults: Vim keys, system clipboard, Vim shortcuts ──

app.get('/api/editor/vim-default', (req, res) => {
    try {
        res.json(readVimDefaultState(VIM_DEFAULT_FILE) satisfies VimDefaultState);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.patch('/api/editor/vim-default', (req: Request<NoParams, unknown, Partial<EditorFlagRequest>>, res: Response) => {
    try {
        const enabled = req.body?.enabled !== false;
        res.json(writeVimDefaultState(VIM_DEFAULT_FILE, enabled) satisfies VimDefaultState);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.get('/api/editor/clipboard-default', (req, res) => {
    try {
        res.json(readClipboardDefaultState(CLIPBOARD_DEFAULT_FILE) satisfies ClipboardDefaultState);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.patch('/api/editor/clipboard-default', (req: Request<NoParams, unknown, Partial<EditorFlagRequest>>, res: Response) => {
    try {
        const enabled = req.body?.enabled !== false;
        res.json(writeClipboardDefaultState(CLIPBOARD_DEFAULT_FILE, enabled) satisfies ClipboardDefaultState);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.get('/api/editor/vim-shortcuts', (req, res) => {
    try {
        const source = fs.existsSync(VIM_SHORTCUTS_FILE)
            ? fs.readFileSync(VIM_SHORTCUTS_FILE, 'utf-8')
            : '';
        const result = loadVimShortcutConfig(source);
        res.json({
            config: result.config,
            path: 'vim-shortcuts.yaml',
            source: result.source,
            warnings: result.warnings,
        } satisfies VimShortcutsResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

// ─── Favorites (`.favorites`) and pending (`.pending`): lists of example paths ──

app.get('/api/favorites', (req, res) => {
    try {
        const state = readFavoritesState(FAVORITES_FILE);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
        } satisfies FavoritesResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.post('/api/favorites', (req: Request<NoParams, unknown, Partial<ExamplePathRequest>>, res: Response) => {
    try {
        const favoritePath = String(req.body?.path || '').trim();
        const state = addFavorite(FAVORITES_FILE, favoritePath);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: favoritePath,
        } satisfies FavoriteChangeResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.delete('/api/favorites', (req: Request<NoParams, unknown, Partial<ExamplePathRequest>>, res: Response) => {
    try {
        const favoritePath = String(req.body?.path || '').trim();
        const state = removeFavorite(FAVORITES_FILE, favoritePath);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: favoritePath,
        } satisfies FavoriteChangeResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.get('/api/pending', (req, res) => {
    try {
        const state = readPendingState(PENDING_FILE);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
        } satisfies PendingResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.post('/api/pending', (req: Request<NoParams, unknown, Partial<ExamplePathRequest>>, res: Response) => {
    try {
        const pendingPath = String(req.body?.path || '').trim();
        const state = addPending(PENDING_FILE, pendingPath);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: pendingPath,
        } satisfies PendingChangeResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

app.delete('/api/pending', (req: Request<NoParams, unknown, Partial<ExamplePathRequest>>, res: Response) => {
    try {
        const pendingPath = String(req.body?.path || '').trim();
        const state = removePending(PENDING_FILE, pendingPath);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: pendingPath,
        } satisfies PendingChangeResponse);
    } catch (err) {
        res.status(500).json({ error: errorMessage(err) });
    }
});

// ─── GET /api/topic/:ch/:sec/:top/main ──────────────────

app.get('/api/topic/:ch/:sec/:top/main', (req: Request<TopicParams>, res: Response) => {
    try {
        const filePath = resolveInside(resolveTopicDir(req.params), 'main.md');
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'main.md not found' });
        res.json({ content: fs.readFileSync(filePath, 'utf-8') } satisfies TopicMainResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.patch('/api/topic/:ch/:sec/:top/main', (req: Request<TopicParams, unknown, Partial<TopicMainWriteRequest>>, res: Response) => {
    try {
        const { content } = req.body || {};
        const dirPath = resolveTopicDir(req.params);
        const filePath = resolveInside(dirPath, 'main.md');

        ensureDir(dirPath);
        fs.writeFileSync(filePath, typeof content === 'string' ? content : String(content ?? ''), 'utf-8');
        res.json({ filename: 'main.md' } satisfies TopicMainWriteResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── GET /api/topic/:ch/:sec/:top/examples ──────────────

const exampleFilenameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

app.get('/api/topic/:ch/:sec/:top/examples', (req: Request<TopicParams>, res: Response) => {
    try {
        const dirPath = resolveInside(resolveTopicDir(req.params), 'examples');
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return res.json([] satisfies ExamplesListResponse);
        const files = fs
            .readdirSync(dirPath)
            .filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'readme.md')
            .sort(exampleFilenameCollator.compare);
        res.json(files satisfies ExamplesListResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── GET /api/topic/:ch/:sec/:top/examples/:file ────────

app.get('/api/topic/:ch/:sec/:top/examples/:file', (req: Request<TopicParams & { file: string }>, res: Response) => {
    try {
        const filePath = resolveExampleFile(req.params, req.params.file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        res.json({ content: fs.readFileSync(filePath, 'utf-8') } satisfies ExampleReadResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── POST /api/topic/:ch/:sec/:top/examples ─────────────

app.post('/api/topic/:ch/:sec/:top/examples', (req: Request<TopicParams, unknown, Partial<ExampleSaveRequest>>, res: Response) => {
    try {
        const { content } = req.body || {};
        const dirPath = resolveInside(resolveTopicDir(req.params), 'examples');
        ensureDir(dirPath);

        const now = new Date();
        const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const month = months[now.getMonth()];
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const filename = `${month}-${day}-${year}-${hours}:${minutes}:${seconds}.md`;

        fs.writeFileSync(resolveInside(dirPath, filename), typeof content === 'string' ? content : '', 'utf-8');
        res.json({ filename } satisfies ExampleSaveResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── PATCH /api/topic/:ch/:sec/:top/examples/* ──────

app.patch('/api/topic/:ch/:sec/:top/examples/*', (req: Request<TopicWildcardParams, unknown, Partial<ExampleModifyRequest>>, res: Response) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const { content } = req.body || {};
        const filePath = resolveExampleFile(req.params, file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        if (typeof content !== 'string') return res.status(400).json({ error: 'Missing content' });
        fs.writeFileSync(filePath, content, 'utf-8');
        res.json({ filename: file } satisfies ExampleModifyResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── DELETE /api/topic/:ch/:sec/:top/examples/* ─────

app.delete('/api/topic/:ch/:sec/:top/examples/*', (req: Request<TopicWildcardParams>, res: Response) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const filePath = resolveExampleFile(req.params, file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        fs.unlinkSync(filePath);
        forgetExampleReferences(filePath);
        res.json({ deleted: file } satisfies ExampleDeleteResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── PUT /api/topic/:ch/:sec/:top/examples/* ────────

app.put('/api/topic/:ch/:sec/:top/examples/*', (req: Request<TopicWildcardParams, unknown, Partial<ExampleRenameRequest>>, res: Response) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const { newFilename } = req.body || {};
        const oldPath = resolveExampleFile(req.params, file);
        const newPath = resolveExampleFile(req.params, newFilename);

        if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File not found' });
        if (fs.existsSync(newPath)) return res.status(409).json({ error: 'Target filename already exists' });

        fs.renameSync(oldPath, newPath);
        forgetExampleReferences(oldPath, newPath);
        res.json({ oldFilename: file, newFilename: newFilename! } satisfies ExampleRenameResponse); // resolveExampleFile rejected a missing name
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── POST /api/compile ───────────────────────────────────

app.post('/api/compile', async (req: Request<NoParams, unknown, Partial<CompileRequest>>, res: Response) => {
    try {
        const sourceDocument = req.body?.document
            || parseExampleDocument(req.body?.content || '');
        const cacheKey = createCompileCacheKey({ document: sourceDocument });
        const cached = getCachedCompileResponse(cacheKey);

        if (cached) {
            res.json({
                ...cached,
                compileMeta: {
                    ...(cached.compileMeta || {}),
                    cacheKey,
                    cacheStatus: 'hit',
                },
            } satisfies CompileResponse);
            return;
        }

        // Sass/Pug/TypeScript run in a worker thread with memory and time limits (see isolatedCompiler.ts).
        const result = await compileExampleDocumentIsolated(sourceDocument);
        const responsePayload: CompileResponse = {
            document: sourceDocument,
            compiledDocument: result.compiledDocument,
            compileDiagnostics: result.compileDiagnostics,
            compileMeta: {
                cacheKey,
                cacheStatus: 'miss',
            },
        };

        setCachedCompileResponse(cacheKey, responsePayload);

        res.json(responsePayload);
    } catch (err) {
        res.status(500).json({
            error: errorMessage(err),
            compiledDocument: { html: '', css: '', js: '' },
            compileDiagnostics: [
                {
                    level: 'error',
                    code: 'compile-request-failed',
                    message: errorMessage(err),
                },
            ],
        } satisfies CompileErrorResponse);
    }
});

// ─── POST /api/create ───────────────────────────────────

app.post('/api/create', (req: Request<NoParams, unknown, Partial<CreateItemRequest>>, res: Response) => {
    try {
        const { type, name, parentPath, sessionPreset } = req.body; // type: 'chapter' | 'section' | 'topic' | 'example'
        let targetDir: string;
        let prefix: string;
        // `String(name)` is what String.prototype.replace did implicitly with the replacement text.
        const replaceTemplateTokens = (content = ''): string => String(content)
            .replaceAll('__EXAMPLE_NAME__', String(name))
            .replace(/Hello World/g, String(name))
            .replace(/Hello from Pug/g, String(name))
            .replace(/SCSS preset/g, String(name))
            .replace(/Hello React/g, String(name))
            .replace(/React TSX Todo/g, String(name));

        if (type === 'chapter') {
            targetDir = MATERIAL_DIR;
            prefix = 'ch';
        } else if (type === 'section') {
            targetDir = resolveInside(MATERIAL_DIR, assertPlainSegment(parentPath, 'chapter'));
            prefix = 'sec';
        } else if (type === 'topic') {
            const [chapter, section, ...rest] = String(parentPath || '').split('/');
            if (rest.length) throw new PathError('Invalid section path');
            targetDir = resolveInside(MATERIAL_DIR, assertPlainSegment(chapter, 'chapter'), assertPlainSegment(section, 'section'));
            prefix = 'top';
        } else if (type === 'example') {
            // parentPath should be "ch/sec/top"
            const [ch, sec, top, ...rest] = String(parentPath || '').split('/');
            if (rest.length) throw new PathError('Invalid topic path');
            targetDir = resolveInside(resolveTopicDir({ ch, sec, top }), 'examples');
            // Check if examples dir exists, if not create it (should exist for topics)
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            // For examples, name is the filename
            const rawName = String(name || '').trim();
            const filename = rawName.endsWith('.md') ? rawName : `${rawName}.md`;
            const filePath = resolveExampleFile({ ch, sec, top }, filename);

            if (fs.existsSync(filePath)) return res.status(409).json({ error: 'Example already exists' });

            const sourceDocument: ExampleDocument = createExampleDocumentFromPreset(sessionPreset || 'html-css-javascript');
            sourceDocument.blocks = sourceDocument.blocks.map((block) => ({
                ...block,
                content: replaceTemplateTokens(block.content),
            }));
            sourceDocument.files = sourceDocument.files.map((file) => ({
                ...file,
                content: replaceTemplateTokens(file.content),
            }));
            const template = buildExampleDocument(sourceDocument);
            fs.writeFileSync(filePath, template, 'utf-8');
            return res.json({ filename, path: filePath, sessionPreset: sessionPreset || 'html-css-javascript' } satisfies CreateExampleResponse);
        } else {
            return res.status(400).json({ error: 'Invalid type' });
        }

        if (!fs.existsSync(targetDir)) return res.status(404).json({ error: 'Parent not found' });

        const existing = fs.readdirSync(targetDir).filter((d) => d.startsWith(prefix));
        const nextNum = getNextNumber(existing, prefix);
        const slug = slugify(name) || 'untitled';
        const folderName = `${prefix}${nextNum}-${slug}`;
        const newPath = path.join(targetDir, folderName);

        fs.mkdirSync(newPath, { recursive: true });

        if (type === 'topic') {
            fs.mkdirSync(path.join(newPath, 'examples'), { recursive: true });
            fs.mkdirSync(path.join(newPath, 'assets'), { recursive: true });
            const label = String(name || '').trim();
            // The first heading of main.md is the topic label shown in the sidebar.
            fs.writeFileSync(
                path.join(newPath, 'main.md'),
                `# ${label.charAt(0).toUpperCase()}${label.slice(1)}\n\nWrite your theory here.\n`,
                'utf-8'
            );
        }

        res.json({ folderName, path: newPath } satisfies CreateFolderResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── Serve topic assets ─────────────────────────────────

/** Paths (with `/` separators, relative to `assetsDir`) of every file below it, skipping dotfiles and dot folders. */
function listAssetFiles(assetsDir: string, prefix = ''): string[] {
    return fs.readdirSync(assetsDir, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith('.'))
        .flatMap((entry) => {
            const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) return listAssetFiles(path.join(assetsDir, entry.name), relativePath);
            return entry.isFile() ? [relativePath] : [];
        });
}

app.get('/api/topic/:ch/:sec/:top/assets', (req: Request<TopicParams>, res: Response) => {
    try {
        const { ch, sec, top } = req.params;
        const assetsDir = resolveInside(resolveTopicDir(req.params), 'assets');

        if (!fs.existsSync(assetsDir) || !fs.statSync(assetsDir).isDirectory()) {
            return res.json([] satisfies TopicAssetsResponse);
        }

        const assets: TopicAsset[] = listAssetFiles(assetsDir)
            .map((relativePath) => ({
                filename: relativePath,
                path: relativePath,
                url: `/api/topic/${encodeURIComponent(ch)}/${encodeURIComponent(sec)}/${encodeURIComponent(top)}/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
            }))
            .sort((left, right) => left.filename.localeCompare(right.filename));

        res.json(assets satisfies TopicAssetsResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.get('/api/topic/:ch/:sec/:top/assets/*', (req: Request<TopicWildcardParams>, res: Response) => {
    try {
        const assetsDir = resolveInside(resolveTopicDir(req.params), 'assets');
        const relativePath = String(req.params[0] || '');
        const segments = relativePath.split('/').filter(Boolean).map((segment) => assertPlainSegment(segment, 'asset path'));
        if (segments.length === 0) {
            return res.redirect(307, req.originalUrl.replace(/\/+$/, '').replace(/\?.*$/, ''));
        }
        const filePath = resolveInside(assetsDir, ...segments);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return res.status(404).json({ error: 'Asset not found' });
        res.sendFile(filePath);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── Preview hosting ────────────────────────────────────
// Rendered example documents are served from this API origin (http://127.0.0.1:3001), which is
// cross-origin to the Vite app (localhost:5174). The preview iframe can therefore use
// `allow-same-origin` without being able to reach the app, and learner code gets a real web origin:
// localStorage/sessionStorage/IndexedDB/cookies, #fragment links, history.pushState, Workers, and
// relative URLs that resolve into the topic's assets/ folder (the document "lives" next to them).
// Documents are kept in memory only (last PREVIEW_DOCUMENT_LIMIT renders).

/** A hosted preview: the rendered HTML and the topic whose `assets/` its relative URLs reach. */
interface PreviewDocument extends TopicParams {
    html: string;
}

const PREVIEW_DOCUMENT_LIMIT = 24;
/** Stands for chapter, section and topic when an example is not inside a topic: no assets are served for it. */
const PREVIEW_PLACEHOLDER_SEGMENT = '_';
/** Oldest first; keyed by the id in the preview URL. */
const previewDocuments = new Map<string, PreviewDocument>();
let previewDocumentCounter = 0;

function getPreviewOrigin(): string {
    const host = !HOST || HOST === '0.0.0.0' || HOST === '::' ? '127.0.0.1' : HOST;
    return `http://${host.includes(':') ? `[${host}]` : host}:${PORT}`;
}

/** The topic named by `chapter/section/topic`, or the placeholder segments for any other value. Throws a `PathError` for a path that escapes `material/`. */
function parsePreviewTopic(topicPath = ''): TopicParams {
    const segments = String(topicPath || '').split('/').filter(Boolean);
    if (segments.length !== 3) {
        return { ch: PREVIEW_PLACEHOLDER_SEGMENT, sec: PREVIEW_PLACEHOLDER_SEGMENT, top: PREVIEW_PLACEHOLDER_SEGMENT };
    }
    const [ch, sec, top] = segments;
    resolveTopicDir({ ch, sec, top });
    return { ch, sec, top };
}

app.post('/api/preview-documents', (req: Request<NoParams, unknown, Partial<PreviewDocumentRequest>>, res: Response) => {
    try {
        const html = req.body?.html;
        if (typeof html !== 'string') throw new PathError('Missing preview html');

        const topic = parsePreviewTopic(req.body?.topicPath);
        previewDocumentCounter += 1;
        const id = `${Date.now().toString(36)}-${previewDocumentCounter.toString(36)}`;
        previewDocuments.set(id, { html, ...topic });
        while (previewDocuments.size > PREVIEW_DOCUMENT_LIMIT) {
            previewDocuments.delete(previewDocuments.keys().next().value!); // the loop condition guarantees an entry
        }

        const encodedTopic = [topic.ch, topic.sec, topic.top].map(encodeURIComponent).join('/');
        res.json({
            id,
            origin: getPreviewOrigin(),
            port: PORT,
            url: `/preview/${encodedTopic}/${id}/index.html`,
        } satisfies PreviewDocumentResponse);
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.get('/preview/:ch/:sec/:top/:id/*', (req: Request<PreviewParams>, res: Response) => {
    try {
        const relativePath = String(req.params[0] || '');
        if (relativePath === '' || relativePath === 'index.html') {
            const previewDocument = previewDocuments.get(req.params.id);
            res.set('Cache-Control', 'no-store');
            if (!previewDocument) {
                return res.status(410).type('html').send('<!DOCTYPE html><meta charset="utf-8"><p style="font:13px system-ui;color:#666">This preview has expired. Press Refresh in the preview toolbar.</p>');
            }
            return res.type('html').send(previewDocument.html);
        }

        if (req.params.ch === PREVIEW_PLACEHOLDER_SEGMENT) {
            return res.status(404).json({ error: 'Asset not found (example is not inside a topic)' });
        }

        const assetsDir = resolveInside(resolveTopicDir(req.params), 'assets');
        const segments = relativePath.split('/').filter(Boolean).map((segment) => assertPlainSegment(segment, 'asset path'));
        const filePath = resolveInside(assetsDir, ...segments);
        if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        res.set('Cache-Control', 'no-cache');
        return res.sendFile(filePath);
    } catch (err) {
        return sendRouteError(res, err);
    }
});

// ─── Start ──────────────────────────────────────────────

const PORT = 3001;
// Bind to loopback only: this API reads and writes files in the repository.
const HOST = process.env.LEARNWEB_API_HOST || '127.0.0.1';
app.listen(PORT, HOST, () => {
    console.log(`📚 Learning API running on http://${HOST}:${PORT}`);
    warmUpIsolatedCompiler().catch((err: unknown) => console.warn('Compile worker warm-up failed:', errorMessage(err)));
});
