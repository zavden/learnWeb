// Building blocks of the example document model: frontmatter parsing and metadata normalization,
// fence detection, virtual-path helpers, block/file constructors and language lookups. Everything here is
// pure and synchronous. Used by the rest of src/utils/markdown/ (parsers.ts, documentApi.ts,
// documentMeta.ts, the validators, shader.ts, mutations.ts, fileTypeChange.ts) and by a few tests; the app
// reaches it through src/utils/markdown.ts. The shapes it builds are described in src/types/document.ts.
//
// Gotchas: metadata keys outside KNOWN_METADATA_KEYS are kept verbatim (case-sensitive), and the table
// lookups by text (`LANGUAGE_LABELS[...]`, `BLOCK_ALIASES[...]`) do not filter inherited keys such as
// `constructor`, exactly like the original JavaScript.

import { getBlockDefinition, normalizeBlockType } from '../../config/exampleBlocks.ts';
import type { Diagnostic, DiagnosticDetails, DiagnosticLevel } from '../../types/diagnostics.ts';
import type {
    BlockSlot,
    BlockType,
    ExampleBlock,
    ExampleDocumentInput,
    ExampleImportance,
    ExampleMetadata,
    ExampleMetadataInput,
    FileSourceKind,
    MetadataValue,
    VirtualFile,
} from '../../types/document.ts';
import {
    EXAMPLE_IMPORTANCE_VALUES,
    KNOWN_METADATA_KEYS,
    LANGUAGE_FILE_EXTENSIONS,
    LANGUAGE_LABELS,
    LEGACY_APP_LANGUAGE_OPTIONS,
    LEGACY_FILE_TEMPLATES,
    LEGACY_MARKUP_LANGUAGE_OPTIONS,
    LEGACY_SCRIPT_LANGUAGE_OPTIONS,
    LEGACY_STYLE_LANGUAGE_OPTIONS,
    LIKELY_VIRTUAL_ASSET_EXTENSIONS,
} from './constants.ts';

/**
 * A table read by arbitrary text: unknown keys give `undefined`. Only a type view: like the plain
 * JavaScript lookup, an inherited key (`constructor`) still returns the inherited value.
 */
type Lookup<T> = Readonly<Record<string, T[keyof T] | undefined>>;

/** Opening fence of an example block, as `parseFenceOpening()` reads it. */
export interface FenceOpening {
    /** `` ` `` or `~`. */
    char: string;
    /** Number of fence characters (3 or more); a closing fence must be at least as long. */
    length: number;
    /** Normalized info string (`normalizeBlockType()`): aliases resolved, `''` never (the pattern needs one). */
    language: string;
}

/** `parseExampleTagsMetadataValue()`: normalized tags and the duplicates found. */
export interface ParsedExampleTags {
    /** One `duplicate-example-tag` warning per repeated tag. */
    diagnostics: Diagnostic[];
    /** Tags joined with `|` (what `example_tags` is normalized to). */
    normalizedValue: string;
    /** Lower-case tags with single spaces, first occurrence order, no duplicates. */
    tags: string[];
}

/** `parseFrontmatter()`: the normalized metadata and where the body starts. */
export interface ParsedFrontmatter {
    metadata: ExampleMetadata;
    /** Index of the first body line (0 without frontmatter or when it is never closed). */
    startIndex: number;
    diagnostics: Diagnostic[];
}

/** What a virtual path is wrong with (`getVirtualPathIssue()`); `''` when it is fine. */
export type VirtualPathIssue = 'empty' | 'traversal' | '';

/** Language family of a legacy block type, for the "change badge" rules. */
export type LegacyLanguageFamily = 'markup' | 'style' | 'script' | 'app' | 'shader' | 'unknown';

/** Language family of a virtual file, for the "change badge" rules (`sfc` = Vue single-file component). */
export type VirtualLanguageFamily = 'style' | 'json' | 'sfc' | 'markup' | 'code' | 'unknown';

/** `buildVirtualFile()` options: the file's fields before normalization. Block fields are for legacy files only. */
export interface BuildVirtualFileOptions {
    path: string;
    language: string;
    content?: string;
    role?: string;
    sourceKind?: FileSourceKind;
    blockId?: string | null;
    blockType?: BlockType | null;
    slot?: BlockSlot | null;
    heading?: string | null;
    /** Position of the file; becomes `order` and part of `id`. */
    index?: number;
}

function normalizeResolutionMetadataLiteral(value: MetadataValue = ''): string {
    const text = String(value ?? '').trim();
    if (!text) return '';

    const match = text.match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!match) return text;

    const width = Number.parseInt(match[1], 10);
    const height = Number.parseInt(match[2], 10);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return text;
    }

    return `${width}x${height}`;
}

/** Builds a structural diagnostic: `{ level, code, message, ...details }`. */
export function createDiagnostic(
    level: DiagnosticLevel,
    code: string,
    message: string,
    details: DiagnosticDetails = {},
): Diagnostic {
    return { level, code, message, ...details };
}

/** A Markdown ATX heading (`#` … `######` + text): the label line above a legacy block. */
export function isHeadingLine(line: string): boolean {
    return /^#{1,6}\s+.+$/.test(line);
}

const FENCE_OPENING_PATTERN = /^(`{3,}|~{3,})[ \t]*([\w+-]+)[ \t]*$/;
const FENCE_CLOSING_PATTERN = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;
const INDENTED_FENCE_CLOSING_PATTERN = /^[ \t]+(`{3,}|~{3,})[ \t]*$/;

/** Opening fence of an example block: ```lang, ````lang or ~~~lang at column 0; `null` for any other line. */
export function parseFenceOpening(line: string | null = ''): FenceOpening | null {
    const match = String(line ?? '').match(FENCE_OPENING_PATTERN);
    if (!match) return null;

    return {
        char: match[1][0],
        length: match[1].length,
        language: normalizeBlockType(match[2]),
    };
}

/**
 * A closing fence uses the same character as the opening fence, is at least as long,
 * may be indented up to 3 spaces and carries no info string.
 */
export function isFenceClosingLine(line: string | null = '', fence: FenceOpening | null = null): boolean {
    if (!fence) return false;
    const match = String(line ?? '').match(FENCE_CLOSING_PATTERN);
    // `match!`: only read when Boolean(match) is true.
    return Boolean(match) && match![1][0] === fence.char && match![1].length >= fence.length;
}

/**
 * A deeper indented fence (4+ spaces or tabs). Not a closing fence by itself, but used
 * to recover when a block was clearly meant to end there.
 */
export function isIndentedFenceClosingLine(line: string | null = '', fence: FenceOpening | null = null): boolean {
    if (!fence) return false;
    const match = String(line ?? '').match(INDENTED_FENCE_CLOSING_PATTERN);
    // `match!`: only read when Boolean(match) is true.
    return Boolean(match) && match![1][0] === fence.char && match![1].length >= fence.length;
}

/**
 * Picks a backtick fence longer than any backtick run that starts a content line,
 * so the content can never close its own block.
 */
export function getFenceForContent(content: string | null = ''): string {
    let longestRun = 0;

    String(content ?? '')
        .split('\n')
        .forEach((line) => {
            const match = line.match(/^[ \t]*(`{3,})/);
            if (match) {
                longestRun = Math.max(longestRun, match[1].length);
            }
        });

    return '`'.repeat(Math.max(3, longestRun + 1));
}

/** Whether the line opens an example block. */
export function isFenceLine(line: string): boolean {
    return Boolean(parseFenceOpening(line));
}

/** Normalized language of an opening fence line, `''` when the line is not one. */
export function parseFenceLanguage(line: string): string {
    return parseFenceOpening(line)?.language || '';
}

/**
 * Normalizes the body of a fenced block: removes leading and trailing blank lines and the
 * indentation shared by every non-blank line. Relative indentation (including the first
 * line's) is preserved, which matters for Pug and SASS. The result is stable: parsing it
 * again yields the same text.
 */
export function stripSurroundingBlankLines(lines: readonly string[] = []): string {
    let start = 0;
    let end = lines.length;

    while (start < end && lines[start].trim() === '') start += 1;
    while (end > start && lines[end - 1].trim() === '') end -= 1;

    const bodyLines = lines.slice(start, end);
    // Typed through `as` so the callback's assignments are not narrowed away after the loop.
    let commonIndent = null as string | null;

    bodyLines.forEach((line) => {
        if (line.trim() === '') return;
        // `!`: the pattern can match the empty string, so it always matches.
        const indent = line.match(/^[ \t]*/)![0];

        if (commonIndent === null) {
            commonIndent = indent;
            return;
        }

        let length = 0;
        while (length < commonIndent.length && length < indent.length && commonIndent[length] === indent[length]) {
            length += 1;
        }
        commonIndent = commonIndent.slice(0, length);
    });

    if (!commonIndent) {
        return bodyLines.join('\n');
    }

    return bodyLines
        .map((line) => {
            // `!`: checked non-empty just above (the callback does not see that narrowing).
            if (line.startsWith(commonIndent!)) return line.slice(commonIndent!.length);
            return line.trim() === '' ? '' : line;
        })
        .join('\n');
}

/** Case-insensitive heading comparison; a missing heading always matches. */
export function headingsMatch(actualHeading: string | null | undefined, expectedHeading: string): boolean {
    if (!actualHeading) return true;
    return actualHeading.trim().toLowerCase() === expectedHeading.trim().toLowerCase();
}

/** Trims a frontmatter key and lower-cases it when it is a known key; other keys keep their spelling. */
export function normalizeMetadataKey(key: string = ''): string {
    const value = String(key).trim();
    const lowered = value.toLowerCase();

    if (KNOWN_METADATA_KEYS.has(lowered)) {
        return lowered;
    }

    return value;
}

/** Lower-cases `mode:` and maps `single`/`singlefile` and `multi`/`multifile` to the canonical modes. */
export function normalizeModeValue(value: MetadataValue = ''): string {
    const normalized = String(value).trim().toLowerCase();

    if (['single', 'single-file', 'singlefile'].includes(normalized)) {
        return 'single-file';
    }

    if (['multi', 'multi-file', 'multifile'].includes(normalized)) {
        return 'multi-file';
    }

    return normalized;
}

/** Trims and lower-cases `renderer:` (not validated here). */
export function normalizeRendererValue(value: MetadataValue = ''): string {
    return String(value).trim().toLowerCase();
}

/**
 * Booleans and boolean words (`true/1/yes/on`, `false/0/no/off`, any case) become booleans; anything else
 * is returned unchanged (including numbers: frontmatter `1` is the number 1, not `true`).
 */
export function normalizeBooleanMetadataValue<T>(value: T): T | boolean {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();

        if (['true', '1', 'yes', 'on'].includes(normalized)) {
            return true;
        }

        if (['false', '0', 'no', 'off'].includes(normalized)) {
            return false;
        }
    }

    return value;
}

/** `example_description` as text, trimmed (`''` when absent). */
export function normalizeExampleDescriptionMetadataValue(value: MetadataValue | null | undefined = ''): string {
    return String(value ?? '').trim();
}

/**
 * Parses `example_tags`: a list, or text separated by `|` (when it contains one) or by commas. Tags are
 * trimmed, lower-cased and their inner whitespace collapsed; empty and repeated tags are dropped.
 */
export function parseExampleTagsMetadataValue(
    value: MetadataValue | readonly string[] | null | undefined = '',
): ParsedExampleTags {
    const diagnostics: Diagnostic[] = [];

    const rawEntries: readonly unknown[] = Array.isArray(value)
        ? value
        : String(value ?? '').trim()
          ? String(value ?? '').split(String(value).includes('|') ? '|' : ',')
          : [];

    const tags: string[] = [];
    const seen = new Set<string>();

    rawEntries.forEach((entry) => {
        const normalizedTag = String(entry ?? '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');

        if (!normalizedTag) return;

        if (seen.has(normalizedTag)) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'duplicate-example-tag',
                    `Example tag "${normalizedTag}" is declared more than once. Only the first value is used.`,
                    { tag: normalizedTag },
                ),
            );
            return;
        }

        seen.add(normalizedTag);
        tags.push(normalizedTag);
    });

    return {
        diagnostics,
        normalizedValue: tags.join('|'),
        tags,
    };
}

/** `example_rating` as an integer 1–5, or `null` when absent or invalid. */
export function parseExampleRatingValue(value: MetadataValue | null | undefined): number | null {
    if (value === undefined || value === null || value === '') return null;

    const numericValue = typeof value === 'number' ? value : Number.parseInt(String(value).trim(), 10);

    if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > 5) {
        return null;
    }

    return numericValue;
}

/** The valid rating as a number; otherwise the raw value as trimmed text (validation reports it). */
export function normalizeExampleRatingMetadataValue(value: MetadataValue | null | undefined): number | string {
    const parsed = parseExampleRatingValue(value);
    return parsed ?? String(value ?? '').trim();
}

/** `example_importance` lower-cased when it is a valid level, `''` otherwise. */
export function parseExampleImportanceValue(value: MetadataValue | null | undefined = ''): ExampleImportance | '' {
    const normalizedValue = String(value ?? '')
        .trim()
        .toLowerCase();
    return EXAMPLE_IMPORTANCE_VALUES.has(normalizedValue) ? (normalizedValue as ExampleImportance) : '';
}

/** The valid importance level; otherwise the raw value lower-cased (validation reports it). */
export function normalizeExampleImportanceMetadataValue(value: MetadataValue | null | undefined): string {
    const parsed = parseExampleImportanceValue(value);
    return (
        parsed ||
        String(value ?? '')
            .trim()
            .toLowerCase()
    );
}

/**
 * Normalizes frontmatter: drops empty values (`''`, `null`, `undefined`), normalizes the known keys (see
 * `ExampleMetadata`) and copies every other key as it is. Returns a new object; keys keep their input order.
 */
export function normalizeMetadata(metadata: ExampleMetadataInput = {}): ExampleMetadata {
    const normalized: ExampleMetadata = {};

    Object.entries(metadata).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;

        const normalizedKey = normalizeMetadataKey(key);

        if (normalizedKey === 'framework') {
            normalized.framework = String(value).trim().toLowerCase();
            return;
        }

        if (normalizedKey === 'renderer') {
            normalized.renderer = normalizeRendererValue(value);
            return;
        }

        if (normalizedKey === 'mode') {
            normalized.mode = normalizeModeValue(value);
            return;
        }

        if (normalizedKey === 'entry') {
            normalized.entry = normalizeVirtualPath(String(value));
            return;
        }

        if (normalizedKey === 'console') {
            normalized.console = normalizeBooleanMetadataValue(value);
            return;
        }

        if (normalizedKey === 'editor_hidden_files') {
            normalized.editor_hidden_files = String(value).trim();
            return;
        }

        if (normalizedKey === 'resolution') {
            normalized.resolution = normalizeResolutionMetadataLiteral(value);
            return;
        }

        if (normalizedKey === 'shader_uniforms') {
            normalized.shader_uniforms = String(value ?? '').trim();
            return;
        }

        if (normalizedKey === 'shader_textures') {
            normalized.shader_textures = String(value ?? '').trim();
            return;
        }

        if (normalizedKey === 'example_description') {
            normalized.example_description = normalizeExampleDescriptionMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_tags') {
            normalized.example_tags = parseExampleTagsMetadataValue(value).normalizedValue;
            return;
        }

        if (normalizedKey === 'example_rating') {
            normalized.example_rating = normalizeExampleRatingMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_importance') {
            normalized.example_importance = normalizeExampleImportanceMetadataValue(value);
            return;
        }

        if (normalizedKey === 'exercise' || normalizedKey === 'console') {
            normalized[normalizedKey] = normalizeBooleanMetadataValue(value);
            return;
        }

        if (normalizedKey === 'example_stage') {
            normalized.example_stage = String(value).trim().toLowerCase();
            return;
        }

        if (normalizedKey === 'highlights') {
            normalized.highlights = String(value).trim();
            return;
        }

        normalized[normalizedKey] = value;
    });

    return normalized;
}

/** Deep copy through JSON (metadata only holds scalars). */
export function cloneMetadata(metadata: ExampleMetadata | null | undefined = {}): ExampleMetadata {
    return JSON.parse(JSON.stringify(metadata || {}));
}

/** Trims a virtual path, turns `\\` into `/`, removes leading `./` and `/` and collapses repeated slashes. */
export function normalizeVirtualPath(value: string = ''): string {
    return String(value)
        .trim()
        .replaceAll('\\', '/')
        .replace(/^\.\/+/, '')
        .replace(/^\/+/, '')
        .replace(/\/{2,}/g, '/');
}

/** Segments of the normalized path (`[]` for an empty path). */
export function getVirtualPathSegments(path: string = ''): string[] {
    const normalized = normalizeVirtualPath(path);
    return normalized ? normalized.split('/') : [];
}

/** `empty` for an empty path, `traversal` when a segment is `.`, `..` or empty, `''` when the path is valid. */
export function getVirtualPathIssue(path: string = ''): VirtualPathIssue {
    const normalized = normalizeVirtualPath(path);

    if (!normalized) {
        return 'empty';
    }

    const segments = getVirtualPathSegments(normalized);

    if (segments.some((segment) => segment === '.' || segment === '..' || segment === '')) {
        return 'traversal';
    }

    return '';
}

/** Last segment of the normalized path (the input itself when there is none). */
export function getFileName(path: string = ''): string {
    return normalizeVirtualPath(path).split('/').pop() || path;
}

/** Lower-case extension with its dot (`.tsx`); `''` without one or for dotfiles (`.env`). */
export function getFileExtension(path: string = ''): string {
    const fileName = getFileName(path);
    const index = fileName.lastIndexOf('.');

    if (index <= 0) return '';
    return fileName.slice(index).toLowerCase();
}

/** Extensions expected for a language, preferred first; `[]` for unknown languages. Returns the table's own array. */
export function getExpectedExtensions(language: string = ''): string[] {
    return (LANGUAGE_FILE_EXTENSIONS as Lookup<typeof LANGUAGE_FILE_EXTENSIONS>)[normalizeBlockType(language)] || [];
}

/** Whether the path has a binary asset extension (images, fonts, audio, video). */
export function isLikelyVirtualAssetPath(path: string = ''): boolean {
    return LIKELY_VIRTUAL_ASSET_EXTENSIONS.has(getFileExtension(path));
}

/**
 * Builds a legacy block. `type` must be a registered block type or alias: an unknown type throws a
 * TypeError (callers check `getBlockDefinition()` first). The heading defaults to the canonical one.
 */
export function buildBlock(
    type: string,
    content: string,
    headingOverride: string | null = null,
    id: string = '',
): ExampleBlock {
    const normalizedType = normalizeBlockType(type);
    // `!` and `as BlockType`: callers only pass registered types (an unknown one throws here, as before).
    const definition = getBlockDefinition(normalizedType)!;
    return {
        id,
        slot: definition.slot,
        type: normalizedType as BlockType,
        language: normalizedType as BlockType,
        heading: headingOverride || definition.heading,
        content,
    };
}

/** Builds a document file: normalizes path and language and derives `id`, `name` and `order` from the index. */
export function buildVirtualFile({
    path,
    language,
    content = '',
    role = '',
    sourceKind = 'virtual',
    blockId = null,
    blockType = null,
    slot = null,
    heading = null,
    index = 0,
}: BuildVirtualFileOptions): VirtualFile {
    const normalizedLanguage = normalizeBlockType(language);
    const normalizedPath = normalizeVirtualPath(path);

    return {
        id: `${normalizedPath || `file-${index}`}:${index}`,
        path: normalizedPath || `file-${index}`,
        name: getFileName(normalizedPath || `file-${index}`),
        language: normalizedLanguage,
        role,
        content,
        sourceKind,
        blockId,
        blockType,
        slot,
        heading,
        order: index,
    };
}

/** Directory part of the normalized path (`''` at the top level). */
export function getDirectoryName(path: string = ''): string {
    const normalized = normalizeVirtualPath(path);
    const slashIndex = normalized.lastIndexOf('/');
    return slashIndex === -1 ? '' : normalized.slice(0, slashIndex);
}

/** File name without its extension. */
export function getFileStem(path: string = ''): string {
    const fileName = getFileName(path);
    const extension = getFileExtension(path);

    if (!extension) return fileName;
    return fileName.slice(0, -extension.length);
}

/** A free path for a copy of the file: `name-copy.ext`, then `name-copy-2.ext`, `name-copy-3.ext`… */
export function createDuplicatePath(path: string = '', existingPaths: ReadonlySet<string> = new Set()): string {
    const normalizedPath = normalizeVirtualPath(path);
    if (!normalizedPath) return normalizedPath;

    const extension = getFileExtension(normalizedPath);
    const stem = getFileStem(normalizedPath);
    const directory = getDirectoryName(normalizedPath);
    const buildPath = (suffix: string): string => {
        const fileName = `${stem}${suffix}${extension}`;
        return directory ? `${directory}/${fileName}` : fileName;
    };

    let candidate = buildPath('-copy');
    let index = 2;

    while (existingPaths.has(candidate)) {
        candidate = buildPath(`-copy-${index}`);
        index += 1;
    }

    return candidate;
}

function isCanonicalNumberLiteral(value: string = ''): boolean {
    return /^-?\d+(\.\d+)?$/.test(value) && String(Number(value)) === value;
}

/**
 * Reads one frontmatter value: `true`/`false` → boolean, canonical numbers → number, `"…"` → JSON string
 * (raw inner text when it is not valid JSON), `'…'` → YAML single-quoted text, anything else → trimmed text.
 */
export function parseMetadataValue(rawValue: string = ''): MetadataValue {
    const value = String(rawValue).trim();

    if (value === '') return '';
    if (value === 'true') return true;
    if (value === 'false') return false;
    // Only coerce numbers that survive the roundtrip ("007" and "1.50" stay strings).
    if (isCanonicalNumberLiteral(value)) return Number(value);

    if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
        // Values are serialized with JSON.stringify, so decode them with JSON.parse.
        // Hand-written values with invalid escapes (e.g. "C:\path") fall back to the raw text.
        try {
            const parsed: unknown = JSON.parse(value);
            if (typeof parsed === 'string') return parsed;
        } catch {
            /* fall through */
        }

        return value.slice(1, -1);
    }

    if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) {
        // YAML single-quoted scalar: '' is an escaped single quote.
        return value.slice(1, -1).replaceAll("''", "'");
    }

    return value;
}

/**
 * Reads the `---` frontmatter at the top of the lines (`key: value` per line). Without an opening `---`
 * there is no frontmatter; an unclosed one is an error and the whole text is parsed as body.
 */
export function parseFrontmatter(lines: readonly string[] = []): ParsedFrontmatter {
    if (lines[0]?.trim() !== '---') {
        return {
            metadata: {},
            startIndex: 0,
            diagnostics: [],
        };
    }

    const diagnostics: Diagnostic[] = [];
    let endIndex = -1;

    for (let index = 1; index < lines.length; index += 1) {
        if (lines[index].trim() === '---') {
            endIndex = index;
            break;
        }
    }

    if (endIndex === -1) {
        diagnostics.push(
            createDiagnostic('error', 'unclosed-frontmatter', 'Frontmatter starts with "---" but is never closed.'),
        );

        return {
            metadata: {},
            startIndex: 0,
            diagnostics,
        };
    }

    const metadata: Record<string, MetadataValue> = {};

    for (let index = 1; index < endIndex; index += 1) {
        const line = lines[index];
        if (!line.trim()) continue;

        const match = line.match(/^([A-Za-z][\w-]*)\s*:\s*(.*)$/);
        if (!match) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'invalid-frontmatter-line',
                    `Ignoring unsupported frontmatter line at ${index + 1}.`,
                    { line: index + 1 },
                ),
            );
            continue;
        }

        const key = normalizeMetadataKey(match[1]);

        if (Object.prototype.hasOwnProperty.call(metadata, key)) {
            diagnostics.push(
                createDiagnostic(
                    'warning',
                    'duplicate-frontmatter-key',
                    `Frontmatter key "${key}" is declared more than once. The last value wins.`,
                    { key, line: index + 1 },
                ),
            );
        }

        metadata[key] = parseMetadataValue(match[2]);
    }

    return {
        metadata: normalizeMetadata(metadata),
        startIndex: endIndex + 1,
        diagnostics,
    };
}

/** Writes one frontmatter value so that `parseMetadataValue()` reads it back unchanged (plain when safe, else JSON). */
export function serializeMetadataValue(value: MetadataValue): string {
    if (typeof value === 'boolean' || typeof value === 'number') {
        return String(value);
    }

    if (
        typeof value === 'string' &&
        /^[A-Za-z0-9_./-]+$/.test(value) &&
        value !== 'true' &&
        value !== 'false' &&
        !isCanonicalNumberLiteral(value)
    ) {
        return value;
    }

    return JSON.stringify(value);
}

/** The `---` frontmatter block for the metadata (normalized, keys sorted); `''` when there is none. */
export function buildFrontmatter(metadata: ExampleMetadataInput = {}): string {
    const normalized = normalizeMetadata(metadata);
    // normalizeMetadata() drops empty values, so no entry is undefined.
    const entries = Object.entries(normalized) as [string, MetadataValue][];

    if (entries.length === 0) return '';

    const lines = entries
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => `${key}: ${serializeMetadataValue(value)}`);

    return ['---', ...lines, '---'].join('\n');
}

/**
 * A list of paths or values from exercise metadata: a list as it is, or text split on `||`, else `|`,
 * else `,` (the first separator found wins). `\\n` becomes a newline; entries are trimmed, empty ones dropped.
 */
export function parseExerciseListValue(value: MetadataValue | readonly string[] | null | undefined): string[] {
    if (Array.isArray(value)) {
        return value.map((entry) => String(entry || '').trim()).filter(Boolean);
    }

    const text = String(value || '').trim();
    if (!text) return [];

    const separator = text.includes('||') ? '||' : text.includes('|') ? '|' : ',';

    return text
        .split(separator)
        .map((entry) => entry.replace(/\\n/g, '\n').trim())
        .filter(Boolean);
}

/**
 * Free-text lists (exercise_instructions, exercise_hints) are separated ONLY by "||",
 * so a single "|" or a comma can be used inside a step.
 */
export function parseExerciseTextListValue(value: MetadataValue | readonly string[] | null | undefined): string[] {
    if (Array.isArray(value)) {
        return value.map((entry) => String(entry ?? '').trim()).filter(Boolean);
    }

    const text = String(value ?? '').trim();
    if (!text) return [];

    return text
        .split('||')
        .map((entry) => entry.replace(/\\n/g, '\n').trim())
        .filter(Boolean);
}

/** `parseExerciseListValue()` with every entry normalized as a virtual path. */
export function parseExercisePathList(value: MetadataValue | readonly string[] | null | undefined): string[] {
    return parseExerciseListValue(value)
        .map((entry) => normalizeVirtualPath(entry))
        .filter(Boolean);
}

/** Normalizes language options (aliases resolved) and drops empty and repeated ones, keeping the first. */
export function dedupeNormalizedLanguageOptions(options: readonly string[] = []): string[] {
    const seen = new Set<string>();
    const normalizedOptions: string[] = [];

    options.forEach((option) => {
        const normalized = normalizeBlockType(option);
        if (!normalized || seen.has(normalized)) return;
        seen.add(normalized);
        normalizedOptions.push(normalized);
    });

    return normalizedOptions;
}

/** Display name of a language: the block heading, else `LANGUAGE_LABELS`, else the language upper-cased. */
export function getLanguageLabel(language: string = ''): string {
    const normalized = normalizeBlockType(language);
    const definition = getBlockDefinition(normalized);
    if (definition?.heading) return definition.heading;
    return (LANGUAGE_LABELS as Lookup<typeof LANGUAGE_LABELS>)[normalized] || normalized.toUpperCase();
}

/** Family of a legacy block language (`shader` for vertex/fragment). */
export function getLegacyLanguageFamily(language: string = ''): LegacyLanguageFamily {
    const normalized = normalizeBlockType(language);

    if (LEGACY_MARKUP_LANGUAGE_OPTIONS.includes(normalized)) return 'markup';
    if (LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalized)) return 'style';
    if (LEGACY_SCRIPT_LANGUAGE_OPTIONS.includes(normalized)) return 'script';
    if (LEGACY_APP_LANGUAGE_OPTIONS.includes(normalized)) return 'app';
    if ((LEGACY_FILE_TEMPLATES as Lookup<typeof LEGACY_FILE_TEMPLATES>)[normalized]?.role === 'shader') return 'shader';

    return 'unknown';
}

/** Family of a virtual file language. */
export function getVirtualLanguageFamily(language: string = ''): VirtualLanguageFamily {
    const normalized = normalizeBlockType(language);

    if (LEGACY_STYLE_LANGUAGE_OPTIONS.includes(normalized)) return 'style';
    if (normalized === 'json') return 'json';
    if (normalized === 'vue') return 'sfc';
    if (normalized === 'html') return 'markup';
    if (['jsx', 'tsx', 'javascript', 'typescript'].includes(normalized)) return 'code';

    return 'unknown';
}

/** Whether the file is the project's entry: marked `@role entry` or named by `metadata.entry`. */
export function isDocumentEntryFile(
    documentModel: ExampleDocumentInput | null | undefined,
    file: VirtualFile | null | undefined,
): boolean {
    if (!file) return false;

    return (
        file.role === 'entry' ||
        normalizeVirtualPath(documentModel?.metadata?.entry || '') === normalizeVirtualPath(file.path || '')
    );
}

/**
 * The extension a file of `language` should have: its current one when already valid (`.mjs`/`.mts` and
 * `.htm` are kept in kind), otherwise the language's preferred one; `''` for languages without one.
 */
export function getPreferredExpectedExtension(path: string = '', language: string = ''): string {
    const expectedExtensions = getExpectedExtensions(language);
    const currentExtension = getFileExtension(path);

    if (!expectedExtensions.length) return '';
    if (expectedExtensions.includes(currentExtension)) return currentExtension;

    if (currentExtension === '.mjs' && expectedExtensions.includes('.mts')) {
        return '.mts';
    }

    if (currentExtension === '.mts' && expectedExtensions.includes('.mjs')) {
        return '.mjs';
    }

    if (currentExtension === '.htm' && expectedExtensions.includes('.htm')) {
        return '.htm';
    }

    return expectedExtensions[0];
}

/** The path with its extension switched to the one expected for `language` (unchanged when it already fits). */
export function getExpectedPathForLanguage(path: string = '', language: string = ''): string {
    const normalizedPath = normalizeVirtualPath(path);
    const preferredExtension = getPreferredExpectedExtension(normalizedPath, language);

    if (!normalizedPath || !preferredExtension) {
        return normalizedPath;
    }

    const directory = getDirectoryName(normalizedPath);
    const stem = getFileStem(normalizedPath);
    const fileName = `${stem}${preferredExtension}`;

    return directory ? `${directory}/${fileName}` : fileName;
}

export { normalizeBlockType };
