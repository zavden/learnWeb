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
import { compileExampleDocument } from './src/utils/exampleCompiler.js';
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
app.use(cors());
app.use(express.json());

const COMPILE_CACHE_MAX_ENTRIES = 120;
const compileCache = new Map();

// ─── Helpers ────────────────────────────────────────────

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
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
        const chapterPath = path.join(MATERIAL_DIR, chapterId);

        if (!chapterId || !/^ch\d+-.+/.test(chapterId)) {
            return res.status(400).json({ error: 'Invalid chapter id' });
        }

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
    const { ch, sec, top } = req.params;
    const filePath = path.join(MATERIAL_DIR, ch, sec, top, 'main.md');
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'main.md not found' });
    res.json({ content: fs.readFileSync(filePath, 'utf-8') });
});

app.patch('/api/topic/:ch/:sec/:top/main', (req, res) => {
    const { ch, sec, top } = req.params;
    const { content } = req.body || {};
    const dirPath = path.join(MATERIAL_DIR, ch, sec, top);
    const filePath = path.join(dirPath, 'main.md');

    ensureDir(dirPath);
    fs.writeFileSync(filePath, typeof content === 'string' ? content : String(content ?? ''), 'utf-8');
    res.json({ filename: 'main.md' });
});

// ─── GET /api/topic/:ch/:sec/:top/examples ──────────────

app.get('/api/topic/:ch/:sec/:top/examples', (req, res) => {
    const { ch, sec, top } = req.params;
    const dirPath = path.join(MATERIAL_DIR, ch, sec, top, 'examples');
    ensureDir(dirPath);
    const files = fs
        .readdirSync(dirPath)
        .filter((f) => f.endsWith('.md'))
        .sort();
    res.json(files);
});

// ─── GET /api/topic/:ch/:sec/:top/examples/:file ────────

app.get('/api/topic/:ch/:sec/:top/examples/:file', (req, res) => {
    const { ch, sec, top, file } = req.params;
    const filePath = path.join(MATERIAL_DIR, ch, sec, top, 'examples', file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    res.json({ content: fs.readFileSync(filePath, 'utf-8') });
});

// ─── POST /api/topic/:ch/:sec/:top/examples ─────────────

app.post('/api/topic/:ch/:sec/:top/examples', (req, res) => {
    const { ch, sec, top } = req.params;
    const { content } = req.body;
    const dirPath = path.join(MATERIAL_DIR, ch, sec, top, 'examples');
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

    fs.writeFileSync(path.join(dirPath, filename), content, 'utf-8');
    res.json({ filename });
});

// ─── PATCH /api/topic/:ch/:sec/:top/examples/* ──────

app.patch('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    const { ch, sec, top } = req.params;
    const file = req.params[0]; // Capture everything after /examples/
    const { content } = req.body;
    const filePath = path.join(MATERIAL_DIR, ch, sec, top, 'examples', file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.writeFileSync(filePath, content, 'utf-8');
    res.json({ filename: file });
});

// ─── DELETE /api/topic/:ch/:sec/:top/examples/* ─────

app.delete('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    const { ch, sec, top } = req.params;
    const file = req.params[0]; // Capture everything after /examples/
    const filePath = path.join(MATERIAL_DIR, ch, sec, top, 'examples', file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
    fs.unlinkSync(filePath);
    res.json({ deleted: file });
});

// ─── PUT /api/topic/:ch/:sec/:top/examples/* ────────

app.put('/api/topic/:ch/:sec/:top/examples/*', (req, res) => {
    const { ch, sec, top } = req.params;
    const file = req.params[0]; // Capture everything after /examples/
    const { newFilename } = req.body;
    const oldPath = path.join(MATERIAL_DIR, ch, sec, top, 'examples', file);
    const newPath = path.join(MATERIAL_DIR, ch, sec, top, 'examples', newFilename);

    if (!fs.existsSync(oldPath)) return res.status(404).json({ error: 'File not found' });
    if (fs.existsSync(newPath)) return res.status(409).json({ error: 'Target filename already exists' });

    fs.renameSync(oldPath, newPath);
    res.json({ oldFilename: file, newFilename });
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

        const result = await compileExampleDocument(sourceDocument);
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
            targetDir = path.join(MATERIAL_DIR, parentPath);
            prefix = 'sec';
        } else if (type === 'topic') {
            targetDir = path.join(MATERIAL_DIR, parentPath);
            prefix = 'top';
        } else if (type === 'example') {
            // parentPath should be "ch/sec/top"
            targetDir = path.join(MATERIAL_DIR, parentPath, 'examples');
            // Check if examples dir exists, if not create it (should exist for topics)
            if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

            // For examples, name is the filename
            const filename = name.endsWith('.md') ? name : `${name}.md`;
            const filePath = path.join(targetDir, filename);

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
        const slug = slugify(name);
        const folderName = `${prefix}${nextNum}-${slug}`;
        const newPath = path.join(targetDir, folderName);

        fs.mkdirSync(newPath, { recursive: true });

        if (type === 'topic') {
            fs.mkdirSync(path.join(newPath, 'examples'), { recursive: true });
            fs.mkdirSync(path.join(newPath, 'assets'), { recursive: true });
            const label = name.charAt(0).toUpperCase() + name.slice(1);
            fs.writeFileSync(
                path.join(newPath, 'main.md'),
                `# Topic ${nextNum} - ${label}\n\nWrite your theory here.\n`,
                'utf-8'
            );
        }

        res.json({ folderName, path: newPath });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── Serve topic assets ─────────────────────────────────

app.get('/api/topic/:ch/:sec/:top/assets', (req, res) => {
    try {
        const { ch, sec, top } = req.params;
        const assetsDir = path.join(MATERIAL_DIR, ch, sec, top, 'assets');

        if (!fs.existsSync(assetsDir) || !fs.statSync(assetsDir).isDirectory()) {
            return res.json([]);
        }

        const assets = fs.readdirSync(assetsDir, { withFileTypes: true })
            .filter((entry) => entry.isFile() && !entry.name.startsWith('.'))
            .map((entry) => ({
                filename: entry.name,
                path: entry.name,
                url: `/api/topic/${encodeURIComponent(ch)}/${encodeURIComponent(sec)}/${encodeURIComponent(top)}/assets/${encodeURIComponent(entry.name)}`,
            }))
            .sort((left, right) => left.filename.localeCompare(right.filename));

        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/topic/:ch/:sec/:top/assets/:file', (req, res) => {
    const { ch, sec, top, file } = req.params;
    const filePath = path.join(MATERIAL_DIR, ch, sec, top, 'assets', file);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Asset not found' });
    res.sendFile(filePath);
});

// ─── Start ──────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`📚 Learning API running on http://localhost:${PORT}`);
});
