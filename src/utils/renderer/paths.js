export function encodeTopicPath(topicPath = '') {
    return String(topicPath || '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

export function encodeAssetPath(assetPath = '') {
    return String(assetPath || '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

export function getTopicAssetBase(topicPath = '') {
    const encoded = encodeTopicPath(topicPath);
    return encoded ? `/api/topic/${encoded}/assets/` : '';
}
