export const EXAMPLE_IMPORTANCE_META = Object.freeze({
    critical: { accent: 'critical', label: 'Critical' },
    important: { accent: 'important', label: 'Important' },
    trivial: { accent: 'trivial', label: 'Trivial' },
    useful: { accent: 'useful', label: 'Useful' },
});

export function getExampleImportanceMeta(value = '') {
    return EXAMPLE_IMPORTANCE_META[String(value || '').trim().toLowerCase()] || null;
}

export function hasExampleEditorialMetadata(metadata = null) {
    if (!metadata || typeof metadata !== 'object') return false;
    return Boolean(
        String(metadata.description || '').trim()
        || (Array.isArray(metadata.tags) && metadata.tags.length > 0)
        || Number.isInteger(metadata.rating)
        || String(metadata.importance || '').trim()
    );
}

export function formatExampleRatingStars(rating = null) {
    const value = Number.isInteger(rating) ? Math.max(0, Math.min(5, rating)) : 0;
    if (!value) return '';
    return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`;
}
