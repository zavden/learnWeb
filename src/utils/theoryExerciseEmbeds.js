import { fetchExample } from './api.js';
import { compileExample } from './compileClient.js';
import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
} from './exampleEditorial.js';
import { renderCompiledExampleDocument, renderShaderExampleDocument } from './exampleRenderer.js';
import {
    getExampleEditorialMetadata,
    getExampleStage,
    isShaderDocument,
    parseExampleDocument,
} from './markdown.js';
import { highlightCode } from './theoryRenderer.js';

const THEORY_EXERCISE_SHORTCODE_PATTERN = /^[ \t]*\[\[exercise:([^\]\n]+)\]\][ \t]*$/gim;

const EXAMPLE_STAGE_LABELS = {
    minimal: 'Minimal',
    intermediate: 'Intermediate',
    'common-error': 'Common Error',
    exercise: 'Exercise',
    'final-solution': 'Final Solution',
};

function escapeHtml(value = '') {
    return String(value ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function normalizeFilename(value = '') {
    return String(value || '').trim();
}

function buildTheoryExerciseEmbedBody(embed = {}) {
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

    const metaBits = [];
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

export function parseExerciseShortcode(raw = '') {
    const normalized = String(raw || '').trim();
    const mdDashIndex = normalized.lastIndexOf('.md-');

    if (mdDashIndex === -1) {
        return { filename: normalized, codeEmbed: false, codeFilter: null };
    }

    const filename = normalized.slice(0, mdDashIndex + 3); // includes '.md', excludes '-'
    const filterPart = normalized.slice(mdDashIndex + 4);  // after '.md-'

    let codeFilter = null;
    if (filterPart) {
        if (filterPart.startsWith('(') && filterPart.endsWith(')')) {
            codeFilter = filterPart.slice(1, -1).split('|').map((s) => s.trim()).filter(Boolean);
        } else {
            codeFilter = [filterPart.trim()];
        }
    }

    return { filename, codeEmbed: true, codeFilter };
}

export function extractTheoryExerciseReferences(content = '') {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const filenames = [];
    const seen = new Set();

    for (const match of source.matchAll(THEORY_EXERCISE_SHORTCODE_PATTERN)) {
        const { filename } = parseExerciseShortcode(match[1]);
        const normalized = normalizeFilename(filename);
        if (!normalized || seen.has(normalized)) continue;
        seen.add(normalized);
        filenames.push(normalized);
    }

    return filenames;
}

export function renderTheoryExerciseEmbedMarkup(embed = {}) {
    const filename = normalizeFilename(embed.filename);
    const exists = embed.exists !== false;
    const interactiveAttrs = exists
        ? ' role="button" tabindex="0"'
        : '';

    return `<div class="theory-exercise-embed${exists ? '' : ' is-missing'}" data-theory-exercise-file="${escapeHtml(filename)}" data-theory-exercise-exists="${exists ? '1' : '0'}"${interactiveAttrs}>${buildTheoryExerciseEmbedBody({ ...embed, filename })}</div>`;
}

function getHighlightLanguage(language) {
    if (language === 'vue') return 'xml';
    return language || '';
}

function matchesCodeFilter(file, filter) {
    if (!Array.isArray(filter)) return true;
    return filter.some((name) => file.name === name || file.path === name || file.path?.endsWith(`/${name}`));
}

export function renderTheoryCodeEmbedMarkup(embed = {}, codeFilter = null) {
    const filename = normalizeFilename(embed.filename);
    const allFiles = Array.isArray(embed.codeFiles) ? embed.codeFiles : [];

    const files = codeFilter === null
        ? allFiles
        : codeFilter.map((name) => allFiles.find((f) => matchesCodeFilter(f, [name]))).filter(Boolean);

    if (files.length === 0) {
        return `<div class="theory-code-embed is-empty" data-theory-code-file="${escapeHtml(filename)}"><p>No files to display.</p></div>`;
    }

    if (files.length === 1) {
        const file = files[0];
        const lang = getHighlightLanguage(file.language);
        const highlighted = highlightCode(file.content || '', lang);
        return [
            `<div class="theory-code-embed is-single" data-theory-code-file="${escapeHtml(filename)}">`,
            `<div class="theory-code-embed-file-header">`,
            `<span class="theory-code-embed-file-name">${escapeHtml(file.name || file.path || '')}</span>`,
            `<span class="theory-code-embed-file-lang">${escapeHtml(file.language || '')}</span>`,
            `</div>`,
            `<pre><code class="hljs language-${escapeHtml(lang)}">${highlighted}</code></pre>`,
            `</div>`,
        ].join('');
    }

    const tabs = files.map((file, i) =>
        `<button type="button" class="theory-code-embed-tab${i === 0 ? ' is-active' : ''}" data-code-tab="${i}">${escapeHtml(file.name || file.path || '')}</button>`
    ).join('');

    const panels = files.map((file, i) => {
        const lang = getHighlightLanguage(file.language);
        const highlighted = highlightCode(file.content || '', lang);
        return [
            `<div class="theory-code-embed-panel${i === 0 ? ' is-active' : ''}" data-code-panel="${i}">`,
            `<pre><code class="hljs language-${escapeHtml(lang)}">${highlighted}</code></pre>`,
            `</div>`,
        ].join('');
    }).join('');

    return [
        `<div class="theory-code-embed" data-theory-code-file="${escapeHtml(filename)}">`,
        `<div class="theory-code-embed-tabs">${tabs}</div>`,
        panels,
        `</div>`,
    ].join('');
}

export function injectTheoryExerciseEmbeds(content = '', exerciseEmbeds = {}) {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const embedMap = exerciseEmbeds && typeof exerciseEmbeds === 'object'
        ? exerciseEmbeds
        : {};

    return source.replace(THEORY_EXERCISE_SHORTCODE_PATTERN, (_match, rawContent) => {
        const parsed = parseExerciseShortcode(rawContent);
        const embed = embedMap[parsed.filename] || {
            codeFiles: [],
            description: '',
            exists: false,
            filename: parsed.filename,
            importance: '',
            rating: null,
            stage: '',
            tags: [],
        };

        if (parsed.codeEmbed) {
            return renderTheoryCodeEmbedMarkup(embed, parsed.codeFilter);
        }

        return renderTheoryExerciseEmbedMarkup(embed);
    });
}

export async function loadTheoryExerciseEmbeds(topicPath, content = '') {
    const normalizedTopicPath = String(topicPath || '').trim();
    const filenames = extractTheoryExerciseReferences(content);

    if (!normalizedTopicPath || filenames.length === 0) {
        return {};
    }

    const entries = await Promise.all(
        filenames.map(async (filename) => {
            try {
                const data = await fetchExample(normalizedTopicPath, filename);
                const documentModel = parseExampleDocument(data?.content || '');
                const editorial = getExampleEditorialMetadata(documentModel);
                let previewSrcdoc = '';

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
                    previewSrcdoc = renderCompiledExampleDocument(
                        result.compiledDocument,
                        normalizedTopicPath,
                        result.compileDiagnostics || []
                    );
                }

                return [filename, {
                    codeFiles: documentModel.files.map((file) => ({
                        content: file.content,
                        language: file.language,
                        name: file.name,
                        path: file.path,
                    })),
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
