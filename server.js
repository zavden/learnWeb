import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    buildExampleDocument,
    createExampleDocumentFromPreset,
    parseExampleDocument,
} from './src/utils/markdown.js';
import { cloneSerializable, createCompileCacheKey } from './src/utils/compileCache.js';
import { compileExampleDocumentIsolated, warmUpIsolatedCompiler } from './src/utils/compiler/isolatedCompiler.js';
import {
    readClipboardDefaultState,
    readVimDefaultState,
    writeClipboardDefaultState,
    writeVimDefaultState,
} from './src/utils/editorDefaults.js';
import {
    addFavorite,
    readFavoritesState,
    removeFavorite,
    resolveFavorites,
} from './src/utils/favoritesStore.js';
import {
    addPending,
    readPendingState,
    removePending,
    resolvePending,
} from './src/utils/pendingStore.js';
import { loadVimShortcutConfig } from './src/editor/vimShortcutConfig.js';
import { buildMaterialTree, readHiddenState, setChapterHidden } from './src/utils/materialTree.js';
import { createDemoApiRouter } from './src/utils/demoApi.js';

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
// files and only echoes the request back. It sets its own CORS headers (see src/utils/demoApi.js).
app.use('/api/demo', createDemoApiRouter());

app.use((req, res, next) => {
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
app.use(express.json({ limit: '20mb' }));

const COMPILE_CACHE_MAX_ENTRIES = 120;
const compileCache = new Map();

// ─── Helpers ────────────────────────────────────────────

function slugify(name) {
    return String(name || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

class PathError extends Error {
    constructor(message, status = 400) {
        super(message);
        this.status = status;
    }
}

// Resolve `segments` under `baseDir` and refuse anything that escapes it (`..`, absolute paths,
// encoded separators decoded by Express, etc.).
function resolveInside(baseDir, ...segments) {
    const base = path.resolve(baseDir);
    const target = path.resolve(base, ...segments.map((segment) => String(segment ?? '')));
    if (target !== base && !target.startsWith(base + path.sep)) {
        throw new PathError('Invalid path');
    }
    return target;
}

function assertPlainSegment(value, label = 'segment') {
    const segment = String(value ?? '');
    if (!segment || segment === '.' || segment === '..' || /[\\/\0]/.test(segment)) {
        throw new PathError(`Invalid ${label}`);
    }
    return segment;
}

function resolveTopicDir(params = {}) {
    return resolveInside(
        MATERIAL_DIR,
        assertPlainSegment(params.ch, 'chapter'),
        assertPlainSegment(params.sec, 'section'),
        assertPlainSegment(params.top, 'topic'),
    );
}

function resolveExampleFile(params = {}, filename = '') {
    const name = assertPlainSegment(filename, 'filename');
    if (!name.toLowerCase().endsWith('.md')) {
        throw new PathError('Examples must be .md files');
    }
    return resolveInside(resolveTopicDir(params), 'examples', name);
}

function sendRouteError(res, err) {
    const status = err instanceof PathError ? err.status : 500;
    res.status(status).json({ error: err?.message || 'Unexpected error' });
}

function toMaterialRelativePath(absolutePath) {
    return path.relative(path.dirname(MATERIAL_DIR), absolutePath).split(path.sep).join('/');
}

function forgetExampleReferences(absolutePath, replacementPath = '') {
    const relativePath = toMaterialRelativePath(absolutePath);
    const replacement = replacementPath ? toMaterialRelativePath(replacementPath) : '';

    for (const [stateFile, readState, removeEntry, addEntry] of [
        [FAVORITES_FILE, readFavoritesState, removeFavorite, addFavorite],
        [PENDING_FILE, readPendingState, removePending, addPending],
    ]) {
        try {
            if (!readState(stateFile).items.includes(relativePath)) continue;
            removeEntry(stateFile, relativePath);
            if (replacement) addEntry(stateFile, replacement);
        } catch (err) {
            console.warn(`Could not update ${path.basename(stateFile)}:`, err.message);
        }
    }
}

function getNextNumber(entries, prefix) {
    let max = 0;
    for (const entry of entries) {
        const m = entry.match(new RegExp(`^${prefix}(\\d+)-`));
        if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return String(max + 1).padStart(2, '0');
}

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function getCachedCompileResponse(cacheKey) {
    if (!compileCache.has(cacheKey)) return null;

    const cached = compileCache.get(cacheKey);
    compileCache.delete(cacheKey);
    compileCache.set(cacheKey, cached);
    return cloneSerializable(cached);
}

function setCachedCompileResponse(cacheKey, responsePayload) {
    if (compileCache.has(cacheKey)) {
        compileCache.delete(cacheKey);
    }

    compileCache.set(cacheKey, cloneSerializable(responsePayload));

    while (compileCache.size > COMPILE_CACHE_MAX_ENTRIES) {
        const oldestKey = compileCache.keys().next().value;
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

        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tree/hidden-state', (req, res) => {
    try {
        res.json(readHiddenState(HIDDEN_STATE_FILE));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/tree/chapters/:chapterId/hidden', (req, res) => {
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
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/editor/vim-default', (req, res) => {
    try {
        res.json(readVimDefaultState(VIM_DEFAULT_FILE));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/editor/vim-default', (req, res) => {
    try {
        const enabled = req.body?.enabled !== false;
        res.json(writeVimDefaultState(VIM_DEFAULT_FILE, enabled));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/editor/clipboard-default', (req, res) => {
    try {
        res.json(readClipboardDefaultState(CLIPBOARD_DEFAULT_FILE));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/editor/clipboard-default', (req, res) => {
    try {
        const enabled = req.body?.enabled !== false;
        res.json(writeClipboardDefaultState(CLIPBOARD_DEFAULT_FILE, enabled));
    } catch (err) {
        res.status(500).json({ error: err.message });
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
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/favorites', (req, res) => {
    try {
        const state = readFavoritesState(FAVORITES_FILE);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/favorites', (req, res) => {
    try {
        const favoritePath = String(req.body?.path || '').trim();
        const state = addFavorite(FAVORITES_FILE, favoritePath);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: favoritePath,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/favorites', (req, res) => {
    try {
        const favoritePath = String(req.body?.path || '').trim();
        const state = removeFavorite(FAVORITES_FILE, favoritePath);
        const entries = resolveFavorites(FAVORITES_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: favoritePath,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/pending', (req, res) => {
    try {
        const state = readPendingState(PENDING_FILE);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/pending', (req, res) => {
    try {
        const pendingPath = String(req.body?.path || '').trim();
        const state = addPending(PENDING_FILE, pendingPath);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: pendingPath,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/pending', (req, res) => {
    try {
        const pendingPath = String(req.body?.path || '').trim();
        const state = removePending(PENDING_FILE, pendingPath);
        const entries = resolvePending(PENDING_FILE, MATERIAL_DIR);
        res.json({
            entries,
            items: state.items,
            path: pendingPath,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── GET /api/topic/:ch/:sec/:top/main ──────────────────

app.get('/api/topic/:ch/:sec/:top/main', (req, res) => {
    try {
        const filePath = resolveInside(resolveTopicDir(req.params), 'main.md');
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'main.md not found' });
        res.json({ content: fs.readFileSync(filePath, 'utf-8') });
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.patch('/api/topic/:ch/:sec/:top/main', (req, res) => {
    try {
        const { content } = req.body || {};
        const dirPath = resolveTopicDir(req.params);
        const filePath = resolveInside(dirPath, 'main.md');

        ensureDir(dirPath);
        fs.writeFileSync(filePath, typeof content === 'string' ? content : String(content ?? ''), 'utf-8');
        res.json({ filename: 'main.md' });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── GET /api/topic/:ch/:sec/:top/examples ──────────────

const exampleFilenameCollator = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });

app.get('/api/topic/:ch/:sec/:top/examples', (req, res) => {
    try {
        const dirPath = resolveInside(resolveTopicDir(req.params), 'examples');
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return res.json([]);
        const files = fs
            .readdirSync(dirPath)
            .filter((f) => f.toLowerCase().endsWith('.md') && f.toLowerCase() !== 'readme.md')
            .sort(exampleFilenameCollator.compare);
        res.json(files);
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── GET /api/topic/:ch/:sec/:top/examples/:file ────────

app.get('/api/topic/:ch/:sec/:top/examples/:file', (req, res) => {
    try {
        const filePath = resolveExampleFile(req.params, req.params.file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        res.json({ content: fs.readFileSync(filePath, 'utf-8') });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── POST /api/topic/:ch/:sec/:top/examples ─────────────

app.post('/api/topic/:ch/:sec/:top/examples', (req, res) => {
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
        res.json({ filename });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── PATCH /api/topic/:ch/:sec/:top/examples/* ──────

app.patch('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const { content } = req.body || {};
        const filePath = resolveExampleFile(req.params, file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        if (typeof content !== 'string') return res.status(400).json({ error: 'Missing content' });
        fs.writeFileSync(filePath, content, 'utf-8');
        res.json({ filename: file });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── DELETE /api/topic/:ch/:sec/:top/examples/* ─────

app.delete('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const filePath = resolveExampleFile(req.params, file);
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        fs.unlinkSync(filePath);
        forgetExampleReferences(filePath);
        res.json({ deleted: file });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── PUT /api/topic/:ch/:sec/:top/examples/* ────────

app.put('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    try {
        const file = req.params[0]; // Capture everything after /examples/
        const { newFilename } = req.body || {};
        const oldPath = resolveExampleFile(req.params, file);
        const newPath = resolveExampleFile(req.params, newFilename);

        if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File not found' });
        if (fs.existsSync(newPath)) return res.status(409).json({ error: 'Target filename already exists' });

        fs.renameSync(oldPath, newPath);
        forgetExampleReferences(oldPath, newPath);
        res.json({ oldFilename: file, newFilename });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── POST /api/compile ───────────────────────────────────

app.post('/api/compile', async (req, res) => {
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
            });
            return;
        }

        // Sass/Pug/TypeScript run in a worker thread with memory and time limits (see isolatedCompiler.js).
        const result = await compileExampleDocumentIsolated(sourceDocument);
        const responsePayload = {
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
            error: err.message,
            compiledDocument: { html: '', css: '', js: '' },
            compileDiagnostics: [
                {
                    level: 'error',
                    code: 'compile-request-failed',
                    message: err.message,
                },
            ],
        });
    }
});

// ─── POST /api/create ───────────────────────────────────

app.post('/api/create', (req, res) => {
    try {
        const { type, name, parentPath, sessionPreset } = req.body; // type: 'chapter' | 'section' | 'topic'
        let targetDir;
        let prefix;
        const replaceTemplateTokens = (content = '') => String(content)
            .replaceAll('__EXAMPLE_NAME__', name)
            .replace(/Hello World/g, name)
            .replace(/Hello from Pug/g, name)
            .replace(/SCSS preset/g, name)
            .replace(/Hello React/g, name)
            .replace(/React TSX Todo/g, name);

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

            const sourceDocument = createExampleDocumentFromPreset(sessionPreset || 'html-css-javascript');
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
            return res.json({ filename, path: filePath, sessionPreset: sessionPreset || 'html-css-javascript' });
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

        res.json({ folderName, path: newPath });
    } catch (err) {
        sendRouteError(res, err);
    }
});

// ─── Serve topic assets ─────────────────────────────────

function listAssetFiles(assetsDir, prefix = '') {
    return fs.readdirSync(assetsDir, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith('.'))
        .flatMap((entry) => {
            const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
            if (entry.isDirectory()) return listAssetFiles(path.join(assetsDir, entry.name), relativePath);
            return entry.isFile() ? [relativePath] : [];
        });
}

app.get('/api/topic/:ch/:sec/:top/assets', (req, res) => {
    try {
        const { ch, sec, top } = req.params;
        const assetsDir = resolveInside(resolveTopicDir(req.params), 'assets');

        if (!fs.existsSync(assetsDir) || !fs.statSync(assetsDir).isDirectory()) {
            return res.json([]);
        }

        const assets = listAssetFiles(assetsDir)
            .map((relativePath) => ({
                filename: relativePath,
                path: relativePath,
                url: `/api/topic/${encodeURIComponent(ch)}/${encodeURIComponent(sec)}/${encodeURIComponent(top)}/assets/${relativePath.split('/').map(encodeURIComponent).join('/')}`,
            }))
            .sort((left, right) => left.filename.localeCompare(right.filename));

        res.json(assets);
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.get('/api/topic/:ch/:sec/:top/assets/*', (req, res) => {
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

const PREVIEW_DOCUMENT_LIMIT = 24;
const PREVIEW_PLACEHOLDER_SEGMENT = '_';
const previewDocuments = new Map();
let previewDocumentCounter = 0;

function getPreviewOrigin() {
    const host = !HOST || HOST === '0.0.0.0' || HOST === '::' ? '127.0.0.1' : HOST;
    return `http://${host.includes(':') ? `[${host}]` : host}:${PORT}`;
}

function parsePreviewTopic(topicPath = '') {
    const segments = String(topicPath || '').split('/').filter(Boolean);
    if (segments.length !== 3) {
        return { ch: PREVIEW_PLACEHOLDER_SEGMENT, sec: PREVIEW_PLACEHOLDER_SEGMENT, top: PREVIEW_PLACEHOLDER_SEGMENT };
    }
    const [ch, sec, top] = segments;
    resolveTopicDir({ ch, sec, top });
    return { ch, sec, top };
}

app.post('/api/preview-documents', (req, res) => {
    try {
        const html = req.body?.html;
        if (typeof html !== 'string') throw new PathError('Missing preview html');

        const topic = parsePreviewTopic(req.body?.topicPath);
        previewDocumentCounter += 1;
        const id = `${Date.now().toString(36)}-${previewDocumentCounter.toString(36)}`;
        previewDocuments.set(id, { html, ...topic });
        while (previewDocuments.size > PREVIEW_DOCUMENT_LIMIT) {
            previewDocuments.delete(previewDocuments.keys().next().value);
        }

        const encodedTopic = [topic.ch, topic.sec, topic.top].map(encodeURIComponent).join('/');
        res.json({
            id,
            origin: getPreviewOrigin(),
            port: PORT,
            url: `/preview/${encodedTopic}/${id}/index.html`,
        });
    } catch (err) {
        sendRouteError(res, err);
    }
});

app.get('/preview/:ch/:sec/:top/:id/*', (req, res) => {
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
    warmUpIsolatedCompiler().catch((err) => console.warn('Compile worker warm-up failed:', err.message));
});
