// Exercise shortcodes of theory pages: `[[exercise:file.md]]` (a card with a live preview and Preview/Open
// buttons) and `[[exercise:file.md-styles.css]]` / `[[exercise:file.md-(a.js|b.html)]]` (the example's code,
// highlighted, with tabs when there are several files).
//
// The page flow has two steps. `loadTheoryExerciseEmbeds()` is async: it finds the referenced examples,
// fetches each one, parses and compiles it and returns a `TheoryExerciseEmbed` per file name. Then
// `injectTheoryExerciseEmbeds()` (called by `renderTheoryHtml()` in theoryRenderer.ts) replaces every
// shortcode with its card/code markup. Callers: src/components/TheoryViewer.ts, src/components/Preview.ts,
// scripts/snapshot-material.ts and scripts/check-material.ts. Shortcodes inside fenced code blocks stay
// literal. This module and theoryRenderer.ts import each other (highlighting vs. injection): they only call
// each other from functions, never at load time, so keep it that way. Loads under Node too (no DOM at load).

import type { ExampleStage, HighlightColorId, LineHighlight } from '../types/document.ts';
import type {
    TheoryCodeFile,
    TheoryExerciseEmbed,
    TheoryExerciseEmbedInput,
    TheoryExerciseEmbeds,
    TheoryExerciseShortcode,
} from '../types/theory.ts';
import { fetchExample } from './api.ts';
import { compileExample } from './compileClient.ts';
import {
    buildCompiledScriptFiles,
    buildCompiledStyleFiles,
    getPreprocessedStyleFile,
    getTypeScriptFile,
    withCompiledStyleFiles,
} from './compiledStyleView.ts';
import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
} from './exampleEditorial.ts';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from './exampleRenderer.ts';
import {
    getExampleEditorialMetadata,
    getExampleStage,
    isShaderDocument,
    parseExampleDocument,
} from './markdown.ts';
import { highlightCode } from './theoryRenderer.ts';
import { parseHighlights } from './highlights.ts';

/** A whole line holding one shortcode; capture 1 is what follows `exercise:`. Global: use it with `matchAll`/`replace`. */
const THEORY_EXERCISE_SHORTCODE_PATTERN = /^[ \t]*\[\[exercise:([^\]\n]+)\]\][ \t]*$/gim;

// Badge text per stage. Widened to a string lookup (embeds can carry any text); `satisfies` keeps the table in
// step with the `ExampleStage` union.
const EXAMPLE_STAGE_LABELS: Record<string, string | undefined> = {
    minimal: 'Minimal',
    intermediate: 'Intermediate',
    'common-error': 'Common Error',
    exercise: 'Exercise',
    'final-solution': 'Final Solution',
    professional: 'Professional',
} satisfies Record<ExampleStage, string>;

function escapeHtml(value: unknown = ''): string {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalizeFilename(value: string | null | undefined = ''): string {
    return String(value || '').trim();
}

/** The inner markup of an exercise card: header, title, preview slot, badges and the two buttons. */
function buildTheoryExerciseEmbedBody(embed: TheoryExerciseEmbedInput = {}): string {
    const filename = normalizeFilename(embed.filename);
    const description = String(embed.description || '').trim();
    const tags = Array.isArray(embed.tags)
        ? embed.tags.filter((tag) => String(tag || '').trim()).slice(0, 5)
        : [];
    const rating = formatExampleRatingStars(embed.rating);
    const importanceMeta = getExampleImportanceMeta(embed.importance);
    const stageLabel = EXAMPLE_STAGE_LABELS[String(embed.stage || '').trim()] || '';
    const exists = embed.exists !== false;
    const title = description || filename || 'Exercise';
    const summary = exists
        ? (description ? `Opens ${filename}` : 'Preview and jump directly to this exercise.')
        : 'Referenced exercise was not found in this topic.';

    const tagsMarkup = tags.length > 0
        ? `<div class="theory-exercise-embed-tags">${tags
            .map((tag) => `<span class="theory-exercise-embed-tag">${escapeHtml(tag)}</span>`)
            .join('')}</div>`
        : '';
    const previewMarkup = `<div class="theory-exercise-embed-preview${embed.previewSrcdoc ? '' : ' is-empty'}" data-theory-exercise-preview-slot="${escapeHtml(filename)}"><span>${exists ? 'Loading preview...' : 'Exercise missing'}</span></div>`;

    const metaBits: string[] = [];
    if (stageLabel) {
        metaBits.push(`<span class="theory-exercise-embed-badge is-stage">${escapeHtml(stageLabel)}</span>`);
    }
    if (importanceMeta) {
        metaBits.push(
            `<span class="theory-exercise-embed-badge is-${escapeHtml(importanceMeta.accent)}">${escapeHtml(importanceMeta.label)}</span>`
        );
    }
    if (rating) {
        metaBits.push(`<span class="theory-exercise-embed-rating">${escapeHtml(rating)}</span>`);
    }

    return [
        `<div class="theory-exercise-embed-header">`,
        `<span class="theory-exercise-embed-kicker">${exists ? 'Exercise' : 'Missing Exercise'}</span>`,
        `<code class="theory-exercise-embed-file">${escapeHtml(filename || 'unknown')}</code>`,
        `</div>`,
        `<div class="theory-exercise-embed-title">${escapeHtml(title)}</div>`,
        `<p class="theory-exercise-embed-description">${escapeHtml(summary)}</p>`,
        previewMarkup,
        tagsMarkup,
        metaBits.length > 0 ? `<div class="theory-exercise-embed-meta">${metaBits.join('')}</div>` : '',
        `<div class="theory-exercise-embed-actions">`,
        `<button type="button" class="theory-exercise-embed-btn" data-theory-exercise-preview="${escapeHtml(filename)}"${exists ? '' : ' disabled'}>Preview</button>`,
        `<button type="button" class="theory-exercise-embed-btn is-secondary" data-theory-exercise-open="${escapeHtml(filename)}"${exists ? '' : ' disabled'}>Open Exercise</button>`,
        `</div>`,
    ].join('');
}

/**
 * Splits the text after `exercise:` into the example file and the optional code filter: `a.md` is a card,
 * `a.md-b.css` a code embed of one file, `a.md-(b.css|c.js)` of several (matched by file name or path).
 * A trailing `-` with nothing after it is still a code embed, showing every file.
 */
export function parseExerciseShortcode(raw: string | null | undefined = ''): TheoryExerciseShortcode {
    const normalized = String(raw || '').trim();
    const mdDashIndex = normalized.lastIndexOf('.md-');

    if (mdDashIndex === -1) {
        return { filename: normalized, codeEmbed: false, codeFilter: null };
    }

    const filename = normalized.slice(0, mdDashIndex + 3); // includes '.md', excludes '-'
    const filterPart = normalized.slice(mdDashIndex + 4);  // after '.md-'

    let codeFilter: string[] | null = null;
    if (filterPart) {
        if (filterPart.startsWith('(') && filterPart.endsWith(')')) {
            codeFilter = filterPart.slice(1, -1).split('|').map((s) => s.trim()).filter(Boolean);
        } else {
            codeFilter = [filterPart.trim()];
        }
    }

    return { filename, codeEmbed: true, codeFilter };
}

/** Opening line of a fenced code block: capture 1 is the fence, capture 2 the info string. */
const FENCE_OPENING_PATTERN = /^ {0,3}(`{3,}|~{3,})(.*)$/;

// Applies `transform` only to the parts of the Markdown source that are outside fenced code
// blocks, so shortcodes shown as code samples stay literal.
function mapOutsideCodeFences(
    source: string | null | undefined = '',
    transform: (segment: string) => string = (segment) => segment
): string {
    const lines = String(source ?? '').split('\n');
    const output: string[] = [];
    let buffer: string[] = [];
    let fence: { char: string; length: number } | null = null;

    const flush = () => {
        if (buffer.length === 0) return;
        output.push(transform(buffer.join('\n')));
        buffer = [];
    };

    lines.forEach((line) => {
        if (fence) {
            output.push(line);
            const closing = line.match(/^ {0,3}(`{3,}|~{3,})[ \t\r]*$/);
            if (closing && closing[1][0] === fence.char && closing[1].length >= fence.length) {
                fence = null;
            }
            return;
        }

        const opening = line.match(FENCE_OPENING_PATTERN);
        if (opening && !(opening[1][0] === '`' && opening[2].includes('`'))) {
            flush();
            fence = { char: opening[1][0], length: opening[1].length };
            output.push(line);
            return;
        }

        buffer.push(line);
    });

    flush();
    return output.join('\n');
}

/** The distinct example file names a page references, in order of appearance (shortcodes in code fences ignored). */
export function extractTheoryExerciseReferences(content: string | null | undefined = ''): string[] {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const filenames: string[] = [];
    const seen = new Set<string>();

    mapOutsideCodeFences(source, (segment) => {
        for (const match of segment.matchAll(THEORY_EXERCISE_SHORTCODE_PATTERN)) {
            const { filename } = parseExerciseShortcode(match[1]);
            const normalized = normalizeFilename(filename);
            if (!normalized || seen.has(normalized)) continue;
            seen.add(normalized);
            filenames.push(normalized);
        }
        return segment;
    });

    return filenames;
}

/** The exercise card for an embed (`<div class="theory-exercise-embed" …>`); a missing example renders as a disabled card. */
export function renderTheoryExerciseEmbedMarkup(embed: TheoryExerciseEmbedInput = {}): string {
    const filename = normalizeFilename(embed.filename);
    const exists = embed.exists !== false;
    const interactiveAttrs = exists
        ? ' role="button" tabindex="0"'
        : '';

    return `<div class="theory-exercise-embed${exists ? '' : ' is-missing'}" data-theory-exercise-file="${escapeHtml(filename)}" data-theory-exercise-exists="${exists ? '1' : '0'}"${interactiveAttrs}>${buildTheoryExerciseEmbedBody({ ...embed, filename })}</div>`;
}

function getHighlightLanguage(language: string | null | undefined): string {
    if (language === 'vue') return 'xml';
    return language || '';
}

// Line background per highlight color (the editor's translucent colors). Widened to a string lookup because
// color ids come from author text; `satisfies` keeps the keys in step with `HighlightColorId`.
const EMBED_HIGHLIGHT_BG: Record<string, string> = {
    yellow: 'rgba(250, 204, 21, 0.18)',
    green:  'rgba(74, 222, 128, 0.18)',
    blue:   'rgba(96, 165, 250, 0.18)',
    red:    'rgba(248, 113, 113, 0.18)',
    purple: 'rgba(192, 132, 252, 0.18)',
    orange: 'rgba(251, 146, 60, 0.18)',
} satisfies Record<HighlightColorId, string>;

// Split hljs-highlighted HTML by lines, properly closing and reopening <span> tags at
// each newline so every resulting segment is valid HTML on its own.
function splitHighlightedLines(html: string): string[] {
    const lines: string[] = [];
    let current = '';
    const openTags: string[] = [];
    let i = 0;

    while (i < html.length) {
        if (html[i] === '\n') {
            for (let j = openTags.length - 1; j >= 0; j--) current += '</span>';
            lines.push(current);
            current = openTags.join('');
            i++;
        } else if (html[i] === '<') {
            const end = html.indexOf('>', i);
            if (end === -1) { current += html.slice(i); break; }
            const tag = html.slice(i, end + 1);
            if (/^<\/span\b/.test(tag)) openTags.pop();
            else if (/^<span\b/.test(tag)) openTags.push(tag);
            current += tag;
            i = end + 1;
        } else {
            current += html[i];
            i++;
        }
    }
    lines.push(current);
    return lines;
}

function buildHighlightedCodeHtml(content: string, lang: string, highlights: LineHighlight[] | undefined): string {
    const highlighted = highlightCode(content, lang);
    if (!Array.isArray(highlights) || highlights.length === 0) return highlighted;

    const hlMap = new Map(highlights.map(({ line, colorId }): [number, string] => [line, colorId]));
    const lines = splitHighlightedLines(highlighted);

    return lines.map((lineHtml, i) => {
        const colorId = hlMap.get(i + 1);
        if (!colorId) return lineHtml;
        const bg = EMBED_HIGHLIGHT_BG[colorId] || EMBED_HIGHLIGHT_BG.yellow;
        return `<span style="display:inline-block;width:100%;background:${bg}">${lineHtml}</span>`;
    }).join('\n');
}

// Tabs added by the app (not part of the example file), e.g. the CSS a SCSS block compiles to.
const GENERATED_FILE_TITLES: Record<string, string> = {
    css: 'Generated by the Sass compiler (read-only)',
    text: 'Sass compiler messages: @debug, @warn and errors (read-only)',
};

function matchesCodeFilter(file: TheoryCodeFile, filter: string[] | null): boolean {
    if (!Array.isArray(filter)) return true;
    return filter.some((name) => file.name === name || file.path === name || file.path?.endsWith(`/${name}`));
}

// Run/open buttons under a code embed, so console-driven examples can be executed from the theory.
function buildTheoryCodeEmbedActions(embed: TheoryExerciseEmbedInput = {}): string {
    if (embed.exists === false) return '';
    const filename = escapeHtml(normalizeFilename(embed.filename));
    return [
        '<div class="theory-code-embed-actions">',
        `<span class="theory-code-embed-source">${filename}</span>`,
        `<button type="button" class="theory-code-embed-action" data-theory-exercise-preview="${filename}" title="Run this example in a preview window (with console)">▶ Run</button>`,
        `<button type="button" class="theory-code-embed-action" data-theory-exercise-open="${filename}" title="Open this example in the editor">Open in editor</button>`,
        '</div>',
    ].join('');
}

/**
 * The code of an embed as highlighted `<pre>` blocks: one file plain, several as tabs. `codeFilter` picks files by
 * name or path, in the order given (`null`: all); filter names that match nothing are skipped.
 */
export function renderTheoryCodeEmbedMarkup(embed: TheoryExerciseEmbedInput = {}, codeFilter: string[] | null = null): string {
    const filename = normalizeFilename(embed.filename);
    const allFiles = Array.isArray(embed.codeFiles) ? embed.codeFiles : [];

    const files = codeFilter === null
        ? allFiles
        // `filter(Boolean)` drops the names that matched no file.
        : codeFilter.map((name) => allFiles.find((f) => matchesCodeFilter(f, [name]))).filter(Boolean) as TheoryCodeFile[];

    if (files.length === 0) {
        return `<div class="theory-code-embed is-empty" data-theory-code-file="${escapeHtml(filename)}"><p>No files to display.</p></div>`;
    }

    if (files.length === 1) {
        const file = files[0];
        const lang = getHighlightLanguage(file.language);
        const codeHtml = buildHighlightedCodeHtml(file.content || '', lang, file.highlights);
        return [
            `<div class="theory-code-embed is-single" data-theory-code-file="${escapeHtml(filename)}">`,
            `<div class="theory-code-embed-file-header">`,
            `<span class="theory-code-embed-file-name">${escapeHtml(file.name || file.path || '')}</span>`,
            `<span class="theory-code-embed-file-lang">${escapeHtml(file.language || '')}</span>`,
            `</div>`,
            `<pre><code class="hljs language-${escapeHtml(lang)}">${codeHtml}</code></pre>`,
            buildTheoryCodeEmbedActions(embed),
            `</div>`,
        ].join('');
    }

    const tabs = files.map((file, i) => {
        const generatedAttrs = file.generated
            ? ` title="${escapeHtml(GENERATED_FILE_TITLES[file.language] || GENERATED_FILE_TITLES.css)}"`
            : '';
        return `<button type="button" class="theory-code-embed-tab${i === 0 ? ' is-active' : ''}${file.generated ? ' is-generated' : ''}" data-code-tab="${i}"${generatedAttrs}>${escapeHtml(file.name || file.path || '')}</button>`;
    }).join('');

    const panels = files.map((file, i) => {
        const lang = getHighlightLanguage(file.language);
        const codeHtml = buildHighlightedCodeHtml(file.content || '', lang, file.highlights);
        return [
            `<div class="theory-code-embed-panel${i === 0 ? ' is-active' : ''}" data-code-panel="${i}">`,
            `<pre><code class="hljs language-${escapeHtml(lang)}">${codeHtml}</code></pre>`,
            `</div>`,
        ].join('');
    }).join('');

    return [
        `<div class="theory-code-embed" data-theory-code-file="${escapeHtml(filename)}">`,
        `<div class="theory-code-embed-tabs">${tabs}</div>`,
        panels,
        buildTheoryCodeEmbedActions(embed),
        `</div>`,
    ].join('');
}

/**
 * Replaces every shortcode line outside code fences with its embed markup. A file without an entry in
 * `exerciseEmbeds` renders as a missing exercise. `wrapEmbed` post-processes each markup (the theory renderer swaps
 * in a placeholder and restores the markup after Markdown parsing).
 */
export function injectTheoryExerciseEmbeds(
    content: string | null | undefined = '',
    exerciseEmbeds: Readonly<Record<string, TheoryExerciseEmbedInput>> | null | undefined = {},
    wrapEmbed: ((html: string) => string) | null = null
): string {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const embedMap = exerciseEmbeds && typeof exerciseEmbeds === 'object'
        ? exerciseEmbeds
        : {};

    return mapOutsideCodeFences(source, (segment) => segment.replace(THEORY_EXERCISE_SHORTCODE_PATTERN, (_match, rawContent) => {
        const parsed = parseExerciseShortcode(rawContent);
        const embed: TheoryExerciseEmbedInput = embedMap[parsed.filename] || {
            codeFiles: [],
            description: '',
            exists: false,
            filename: parsed.filename,
            importance: '',
            rating: null,
            stage: '',
            tags: [],
        };

        const html = parsed.codeEmbed
            ? renderTheoryCodeEmbedMarkup(embed, parsed.codeFilter)
            : renderTheoryExerciseEmbedMarkup(embed);

        return typeof wrapEmbed === 'function' ? wrapEmbed(html) : html;
    }));
}

/**
 * Loads every example a page references and builds its embed: code files with highlights (plus the compiled CSS/JS
 * tabs of Sass and TypeScript examples), editorial metadata and a static preview document (shader examples render
 * paused). One failing example never fails the rest: a preview that cannot be built leaves `previewSrcdoc` empty,
 * and an example that cannot be fetched or parsed becomes a `exists: false` embed. Resolves to `{}` without a topic
 * path or references.
 */
export async function loadTheoryExerciseEmbeds(
    topicPath: string | null | undefined,
    content: string | null | undefined = ''
): Promise<TheoryExerciseEmbeds> {
    const normalizedTopicPath = String(topicPath || '').trim();
    const filenames = extractTheoryExerciseReferences(content);

    if (!normalizedTopicPath || filenames.length === 0) {
        return {};
    }

    const entries = await Promise.all(
        filenames.map(async (filename): Promise<[string, TheoryExerciseEmbed]> => {
            try {
                const data = await fetchExample(normalizedTopicPath, filename);
                const documentModel = parseExampleDocument(data?.content || '');
                const editorial = getExampleEditorialMetadata(documentModel);

                const highlightsMap = parseHighlights(
                    String(documentModel.metadata?.highlights || ''),
                    documentModel.files
                );

                const codeFiles: TheoryCodeFile[] = documentModel.files.map((file) => {
                    const fileLineMap = highlightsMap.get(file.id);
                    return {
                        content: file.content,
                        highlights: fileLineMap
                            ? Array.from(fileLineMap.entries())
                                .sort(([a], [b]) => a - b)
                                .map(([line, colorId]) => ({ line, colorId }))
                            : [],
                        language: file.language,
                        name: file.name,
                        path: file.path,
                    };
                });

                let previewSrcdoc = '';
                let generatedFiles: TheoryCodeFile[] = [];
                let generatedScriptFiles: TheoryCodeFile[] = [];
                try {
                    if (isShaderDocument(documentModel)) {
                        previewSrcdoc = renderShaderExampleDocument(documentModel, {
                            diagnostics: documentModel.diagnostics || [],
                            renderId: 0,
                            shaderControls: {
                                paused: true,
                                stillFrame: true,
                            },
                            topicPath: normalizedTopicPath,
                        });
                    } else {
                        const result = await compileExample({ document: documentModel });
                        generatedFiles = buildCompiledStyleFiles(documentModel, result);
                        generatedScriptFiles = buildCompiledScriptFiles(documentModel, result);
                        previewSrcdoc = renderCompiledExampleDocument(
                            result.compiledDocument,
                            normalizedTopicPath,
                            result.compileDiagnostics || []
                        );
                    }
                } catch {
                    // Compilation failed — code files are still available, just no preview
                }

                return [filename, {
                    codeFiles: withCompiledStyleFiles(
                        withCompiledStyleFiles(
                            codeFiles,
                            getPreprocessedStyleFile(documentModel)?.path || '',
                            generatedFiles
                        ),
                        getTypeScriptFile(documentModel)?.path || '',
                        generatedScriptFiles
                    ),
                    description: editorial.description || '',
                    exists: true,
                    filename,
                    importance: editorial.importance || '',
                    previewSrcdoc,
                    rating: editorial.rating ?? null,
                    stage: getExampleStage(documentModel) || '',
                    tags: Array.isArray(editorial.tags) ? editorial.tags : [],
                }];
            } catch {
                return [filename, {
                    codeFiles: [],
                    description: '',
                    exists: false,
                    filename,
                    importance: '',
                    previewSrcdoc: '',
                    rating: null,
                    stage: '',
                    tags: [],
                }];
            }
        })
    );

    return Object.fromEntries(entries);
}
