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
import { compileExampleDocument } from './src/utils/exampleCompiler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MATERIAL_DIR = path.join(__dirname, 'material');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Helpers ────────────────────────────────────────────

function slugify(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function parseDirName(name) {
    const match = name.match(/^(ch|sec|top)(\d+)-(.+)$/);
    if (!match) return null;
    return { type: match[1], number: parseInt(match[2], 10), label: match[3] };
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

// ─── GET /api/tree ──────────────────────────────────────

app.get('/api/tree', (req, res) => {
    try {
        const chapters = fs
            .readdirSync(MATERIAL_DIR)
            .filter((d) => d.startsWith('ch') && fs.statSync(path.join(MATERIAL_DIR, d)).isDirectory())
            .sort();

        const tree = chapters.map((ch) => {
            const chPath = path.join(MATERIAL_DIR, ch);
            const parsed = parseDirName(ch);
            const sections = fs
                .readdirSync(chPath)
                .filter((d) => d.startsWith('sec') && fs.statSync(path.join(chPath, d)).isDirectory())
                .sort();

            return {
                id: ch,
                label: parsed ? parsed.label.replace(/-/g, ' ') : ch,
                number: parsed?.number ?? 0,
                sections: sections.map((sec) => {
                    const secPath = path.join(chPath, sec);
                    const parsedSec = parseDirName(sec);
                    const topics = fs
                        .readdirSync(secPath)
                        .filter((d) => d.startsWith('top') && fs.statSync(path.join(secPath, d)).isDirectory())
                        .sort();

                    return {
                        id: sec,
                        label: parsedSec ? parsedSec.label.replace(/-/g, ' ') : sec,
                        number: parsedSec?.number ?? 0,
                        topics: topics.map((top) => {
                            const parsedTop = parseDirName(top);
                            return {
                                id: top,
                                label: parsedTop ? parsedTop.label.replace(/-/g, ' ') : top,
                                number: parsedTop?.number ?? 0,
                                path: `${ch}/${sec}/${top}`,
                            };
                        }),
                    };
                }),
            };
        });

        res.json(tree);
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

app.post('/api/compile', (req, res) => {
    try {
        const sourceDocument = req.body?.document
            || parseExampleDocument(req.body?.content || '');
        const result = compileExampleDocument(sourceDocument);

        res.json({
            document: sourceDocument,
            compiledDocument: result.compiledDocument,
            compileDiagnostics: result.compileDiagnostics,
        });
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
                content: block.content.replace(/Hello World/g, name).replace(/Hello from Pug/g, name).replace(/SCSS preset/g, name),
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
