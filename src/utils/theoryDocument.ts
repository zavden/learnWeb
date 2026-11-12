// The editor's theory pseudo-document: a topic's `main.md` wrapped so the editor can open it like an example.
//
// `createTheoryDocument()` is called by the editor when it opens a topic's theory (src/components/editor/
// fileOperations.ts). Everything that must behave differently for theory (the preview, saving through
// `modifyTopicMain`, session snapshots, the toolbar) asks `isTheoryDocument()` and reads the text with
// `getTheoryDocumentContent()` (src/components/Preview.ts, src/components/editor/theoryEditor.ts,
// sessionManager.ts). The shape is `TheoryDocument` (src/types/theory.ts): not an `ExampleDocument`, it is
// never parsed from or serialized to Markdown frontmatter. No DOM access: also loaded by the tests.

import type { TheoryDocument, TheoryDocumentInput } from '../types/theory.ts';

/** Wraps theory Markdown as the editor document with a single `main.md` file. Non-strings become text. */
export function createTheoryDocument(content: string | null | undefined = ''): TheoryDocument {
    const normalizedContent = typeof content === 'string' ? content : String(content ?? '');

    return {
        blocks: [],
        diagnostics: [],
        files: [
            {
                content: normalizedContent,
                id: 'theory-main',
                language: 'markdown',
                name: 'main.md',
                path: 'main.md',
                role: 'theory',
                sourceKind: 'theory',
            },
        ],
        metadata: {
            editorTarget: 'theory',
        },
        rendererMode: 'web',
        sessionId: 'theory-main',
        sourceFormat: 'virtual-files',
    };
}

/**
 * Whether a document is a theory document, judged only by `metadata.editorTarget` (trimmed, case-insensitive).
 * It returns `boolean`, not a type predicate: it is a sniff of a metadata key, not a check of the shape, and an
 * example whose frontmatter says `editorTarget: theory` would also pass. It accepts partial documents,
 * `null` and `undefined`.
 */
export function isTheoryDocument(documentModel: TheoryDocumentInput | null | undefined = {}): boolean {
    return (
        String(documentModel?.metadata?.editorTarget || '')
            .trim()
            .toLowerCase() === 'theory'
    );
}

/** The Markdown text of a theory document (its `main.md`, else its first file); `''` for any other document. */
export function getTheoryDocumentContent(documentModel: TheoryDocumentInput | null | undefined = {}): string {
    if (!isTheoryDocument(documentModel)) {
        return '';
    }

    // `documentModel` is not null here: `isTheoryDocument()` returned true, which needs a `metadata`.
    const file = (documentModel!.files || []).find((entry) => entry?.path === 'main.md') || documentModel!.files?.[0];

    return typeof file?.content === 'string' ? file.content : '';
}
