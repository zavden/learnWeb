// Display helpers for an example's editorial metadata (description, tags, rating, importance): the
// star string and the importance pill shown by the gallery cards (Gallery.ts), the preview header
// (main.ts) and the exercise embeds of theory pages (theoryExerciseEmbeds.ts). The metadata itself is
// parsed and validated by src/utils/markdown; these helpers only format it.

import type { ExampleEditorialMetadata, ExampleImportance } from '../types/document.ts';

/**
 * Pill data for each importance level; `accent` is the CSS modifier (`is-<accent>`) of the pill.
 * `satisfies` keeps this table in step with the `ExampleImportance` union (derived from
 * EXAMPLE_IMPORTANCE_VALUES): adding or removing a level there makes this fail to compile.
 */
export const EXAMPLE_IMPORTANCE_META = Object.freeze({
    critical: { accent: 'critical', label: 'Critical' },
    important: { accent: 'important', label: 'Important' },
    trivial: { accent: 'trivial', label: 'Trivial' },
    useful: { accent: 'useful', label: 'Useful' },
} satisfies Record<ExampleImportance, { accent: string; label: string }>);

/** Pill data of one importance level. */
export type ExampleImportanceMeta = (typeof EXAMPLE_IMPORTANCE_META)[ExampleImportance];

/**
 * The editorial fields {@link hasExampleEditorialMetadata} looks at. Any of them may be missing or
 * empty, so a partly filled metadata object is accepted.
 */
export type ExampleEditorialFields = Partial<Pick<ExampleEditorialMetadata, 'description' | 'tags' | 'rating' | 'importance'>>;

/** The pill data for an importance name (case and surrounding spaces ignored), or `null` when it is not a known level. */
export function getExampleImportanceMeta(value = ''): ExampleImportanceMeta | null {
    const levels: Readonly<Record<string, ExampleImportanceMeta | undefined>> = EXAMPLE_IMPORTANCE_META;
    return levels[String(value || '').trim().toLowerCase()] || null;
}

/** Whether the metadata carries anything worth showing: a description, a tag, an integer rating or an importance. */
export function hasExampleEditorialMetadata(metadata: ExampleEditorialFields | null = null): boolean {
    if (!metadata || typeof metadata !== 'object') return false;
    return Boolean(
        String(metadata.description || '').trim()
        || (Array.isArray(metadata.tags) && metadata.tags.length > 0)
        || Number.isInteger(metadata.rating)
        || String(metadata.importance || '').trim()
    );
}

/** `★★★☆☆`-style text for a rating clamped to 0..5; `''` when there is no rating or it is 0. */
export function formatExampleRatingStars(rating: number | null = null): string {
    const value = Number.isInteger(rating) ? Math.max(0, Math.min(5, rating as number)) : 0;
    if (!value) return '';
    return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}
