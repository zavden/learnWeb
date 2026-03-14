export function createTheoryDocument(content = '') {
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

export function isTheoryDocument(documentModel = {}) {
    return String(documentModel?.metadata?.editorTarget || '').trim().toLowerCase() === 'theory';
}

export function getTheoryDocumentContent(documentModel = {}) {
    if (!isTheoryDocument(documentModel)) {
        return '';
    }

    const file = (documentModel.files || []).find((entry) => entry?.path === 'main.md')
        || documentModel.files?.[0];

    return typeof file?.content === 'string' ? file.content : '';
}
