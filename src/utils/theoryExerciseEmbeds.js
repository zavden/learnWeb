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

export function extractTheoryExerciseReferences(content = '') {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const filenames = [];
    const seen = new Set();

    for (const match of source.matchAll(THEORY_EXERCISE_SHORTCODE_PATTERN)) {
        const filename = normalizeFilename(match[1]);
        if (!filename || seen.has(filename)) continue;
        seen.add(filename);
        filenames.push(filename);
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

export function injectTheoryExerciseEmbeds(content = '', exerciseEmbeds = {}) {
    const source = typeof content === 'string' ? content : String(content ?? '');
    const embedMap = exerciseEmbeds && typeof exerciseEmbeds === 'object'
        ? exerciseEmbeds
        : {};

    return source.replace(THEORY_EXERCISE_SHORTCODE_PATTERN, (_match, rawFilename) => {
        const filename = normalizeFilename(rawFilename);
        return renderTheoryExerciseEmbedMarkup(embedMap[filename] || {
            description: '',
            exists: false,
            filename,
            importance: '',
            rating: null,
            stage: '',
            tags: [],
        });
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
