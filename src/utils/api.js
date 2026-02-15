// ─── API Utilities ──────────────────────────────────────

const BASE = '/api';

async function handleResponse(res) {
    if (!res.ok) {
        let message = res.statusText;
        try {
            const data = await res.json();
            if (data.error) message = data.error;
        } catch { }
        throw new Error(message);
    }
    return res.json();
}

export async function fetchTree() {
    const res = await fetch(`${BASE}/tree`);
    return handleResponse(res);
}

export async function fetchTopicMain(topicPath) {
    const res = await fetch(`${BASE}/topic/${topicPath}/main`);
    if (!res.ok) return { content: '' };
    return res.json();
}

export async function fetchExamples(topicPath) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples`);
    return handleResponse(res);
}

export async function fetchExample(topicPath, filename) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples/${encodeURIComponent(filename)}`);
    return handleResponse(res);
}

export async function saveExample(topicPath, content) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return handleResponse(res);
}

export async function createItem(type, name, parentPath = '') {
    const res = await fetch(`${BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, parentPath }),
    });
    return handleResponse(res);
}

export async function modifyExample(topicPath, filename, content) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples/${filename}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
    });
    return handleResponse(res);
}

export async function removeExample(topicPath, filename) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples/${filename}`, {
        method: 'DELETE',
    });
    return handleResponse(res);
}

export async function renameExample(topicPath, oldFilename, newFilename) {
    const res = await fetch(`${BASE}/topic/${topicPath}/examples/${oldFilename}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newFilename }),
    });
    return handleResponse(res);
}
