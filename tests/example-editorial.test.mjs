import test from 'node:test';
import assert from 'node:assert/strict';

import {
    formatExampleRatingStars,
    getExampleImportanceMeta,
    hasExampleEditorialMetadata,
} from '../src/utils/exampleEditorial.js';

test('example editorial helpers expose importance metadata and formatted stars', () => {
    assert.deepEqual(getExampleImportanceMeta('critical'), {
        accent: 'critical',
        label: 'Critical',
    });
    assert.equal(formatExampleRatingStars(4), '★★★★☆');
    assert.equal(formatExampleRatingStars(null), '');
});

test('example editorial helper detects when metadata is effectively empty', () => {
    assert.equal(hasExampleEditorialMetadata({
        description: '',
        tags: [],
        rating: null,
        importance: '',
    }), false);

    assert.equal(hasExampleEditorialMetadata({
        description: 'Short summary',
        tags: [],
        rating: null,
        importance: '',
    }), true);
});
