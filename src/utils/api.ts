// ─── API Utilities ──────────────────────────────────────
//
// Every call the browser makes to the local API (`/api/...`, served by server.ts; Vite proxies it in
// development). One function per endpoint, each returning the parsed JSON typed with the payload
// types of src/types/api.ts, which is also where status codes and request bodies are documented.
//
// Failed responses (any non-2xx status) throw an `Error` whose message is the server's `error`
// text, falling back to the HTTP status text; callers show that message to the user.
// `fetchTopicMain` is the exception: it never throws on a bad status and yields empty content.
// The compile worker (src/workers/compileWorker.ts) imports this module too, so it must stay free
// of DOM access.

import type {
    ApiErrorBody,
    ClipboardDefaultState,
    CreateItemRequest,
    CreateItemResponse,
    CreateItemType,
    EditorFlagRequest,
    ExampleDeleteResponse,
    ExampleModifyRequest,
    ExampleModifyResponse,
    ExamplePathRequest,
    ExampleReadResponse,
    ExampleRenameRequest,
    ExampleRenameResponse,
    ExampleSaveRequest,
    ExampleSaveResponse,
    ExamplesListResponse,
    FavoriteChangeResponse,
    FavoritesResponse,
    PendingChangeResponse,
    PendingResponse,
    SetChapterHiddenRequest,
    SetChapterHiddenResponse,
    TopicAssetsResponse,
    TopicMainResponse,
    TopicMainWriteRequest,
    TopicMainWriteResponse,
    TreeResponse,
    VimDefaultState,
    VimShortcutsResponse,
} from '../types/api.ts';
import type { CompileRequest, CompileResponse } from '../types/compile.ts';

const BASE = '/api';

/** Options of {@link fetchTree}. */
export interface FetchTreeOptions {
    /** Also return the chapters listed in `.hiddens` (flagged `hidden: true`). */
    includeHidden?: boolean;
}

/** Options of {@link createItem} that only apply to some item types. */
export type CreateItemOptions = Pick<CreateItemRequest, 'sessionPreset'>;

/**
 * Encodes every segment of "ch/sec/top" so folder names with spaces, accents, "#", "?" or
 * "%" still produce a valid URL. Empty segments are dropped; a missing path gives `''`.
 */
export function encodeTopicPath(topicPath: string | null = ''): string {
    return String(topicPath || '')
        .split('/')
        .filter(Boolean)
        .map((segment) => encodeURIComponent(segment))
        .join('/');
}

function topicUrl(topicPath: string, suffix = ''): string {
    return `${BASE}/topic/${encodeTopicPath(topicPath)}${suffix}`;
}

// The one place where a response body is asserted to be the payload type the caller expects.
async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        let message = res.statusText;
        try {
            const data = (await res.json()) as Partial<ApiErrorBody>;
            if (data.error) message = data.error;
        } catch { }
        throw new Error(message);
    }
    return res.json() as Promise<T>;
}

/** `GET /api/tree`: the chapter > section > topic tree. */
export async function fetchTree(options: FetchTreeOptions = {}): Promise<TreeResponse> {
    const params = new URLSearchParams();
    if (options.includeHidden) {
        params.set('includeHidden', '1');
    }

    const query = params.toString();
    const res = await fetch(`${BASE}/tree${query ? `?${query}` : ''}`);
    return handleResponse<TreeResponse>(res);
}

/** `PATCH /api/tree/chapters/:chapterId/hidden`: hides (or, with `false`, restores) a chapter in the sidebar. */
export async function setChapterHidden(chapterId: string, hidden: boolean = true): Promise<SetChapterHiddenResponse> {
    const body: SetChapterHiddenRequest = { hidden };
    const res = await fetch(`${BASE}/tree/chapters/${encodeURIComponent(chapterId)}/hidden`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<SetChapterHiddenResponse>(res);
}

/** `GET /api/editor/vim-default`: whether Vim keys are on by default. */
export async function fetchVimDefaultState(): Promise<VimDefaultState> {
    const res = await fetch(`${BASE}/editor/vim-default`);
    return handleResponse<VimDefaultState>(res);
}

/** `PATCH /api/editor/vim-default`: saves the Vim default. */
export async function updateVimDefaultState(enabled: boolean = true): Promise<VimDefaultState> {
    const body: EditorFlagRequest = { enabled };
    const res = await fetch(`${BASE}/editor/vim-default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<VimDefaultState>(res);
}

/** `GET /api/editor/clipboard-default`: whether the editor uses the system clipboard by default. */
export async function fetchClipboardDefaultState(): Promise<ClipboardDefaultState> {
    const res = await fetch(`${BASE}/editor/clipboard-default`);
    return handleResponse<ClipboardDefaultState>(res);
}

/** `PATCH /api/editor/clipboard-default`: saves the system clipboard default. */
export async function updateClipboardDefaultState(enabled: boolean = true): Promise<ClipboardDefaultState> {
    const body: EditorFlagRequest = { enabled };
    const res = await fetch(`${BASE}/editor/clipboard-default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<ClipboardDefaultState>(res);
}

/** `GET /api/editor/vim-shortcuts`: the effective Vim shortcut table plus any warning about `vim-shortcuts.yaml`. */
export async function fetchVimShortcutConfig(): Promise<VimShortcutsResponse> {
    const res = await fetch(`${BASE}/editor/vim-shortcuts`);
    return handleResponse<VimShortcutsResponse>(res);
}

/** `GET /api/favorites`. */
export async function fetchFavorites(): Promise<FavoritesResponse> {
    const res = await fetch(`${BASE}/favorites`);
    return handleResponse<FavoritesResponse>(res);
}

/** `POST /api/favorites`: marks an example (repository-relative path) as favorite. */
export async function addFavorite(path: string): Promise<FavoriteChangeResponse> {
    const body: ExamplePathRequest = { path };
    const res = await fetch(`${BASE}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<FavoriteChangeResponse>(res);
}

/** `DELETE /api/favorites`: unmarks a favorite example. */
export async function removeFavorite(path: string): Promise<FavoriteChangeResponse> {
    const body: ExamplePathRequest = { path };
    const res = await fetch(`${BASE}/favorites`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<FavoriteChangeResponse>(res);
}

/** `GET /api/pending`. */
export async function fetchPending(): Promise<PendingResponse> {
    const res = await fetch(`${BASE}/pending`);
    return handleResponse<PendingResponse>(res);
}

/** `POST /api/pending`: marks an example (repository-relative path) as pending. */
export async function addPending(path: string): Promise<PendingChangeResponse> {
    const body: ExamplePathRequest = { path };
    const res = await fetch(`${BASE}/pending`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<PendingChangeResponse>(res);
}

/** `DELETE /api/pending`: unmarks a pending example. */
export async function removePending(path: string): Promise<PendingChangeResponse> {
    const body: ExamplePathRequest = { path };
    const res = await fetch(`${BASE}/pending`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<PendingChangeResponse>(res);
}

/** `GET .../main`: the topic's theory markdown. Never throws on a bad status: a topic without `main.md` gives `{ content: '' }`. */
export async function fetchTopicMain(topicPath: string): Promise<TopicMainResponse> {
    const res = await fetch(topicUrl(topicPath, '/main'));
    if (!res.ok) return { content: '' };
    return res.json();
}

/** `PATCH .../main`: overwrites the topic's theory markdown. */
export async function modifyTopicMain(topicPath: string, content: string): Promise<TopicMainWriteResponse> {
    const body: TopicMainWriteRequest = { content };
    const res = await fetch(topicUrl(topicPath, '/main'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<TopicMainWriteResponse>(res);
}

/** `GET .../examples`: the topic's example file names, in natural order. */
export async function fetchExamples(topicPath: string): Promise<ExamplesListResponse> {
    const res = await fetch(topicUrl(topicPath, '/examples'));
    return handleResponse<ExamplesListResponse>(res);
}

/** `GET .../assets`: the files below the topic's `assets/` folder. */
export async function fetchTopicAssets(topicPath: string): Promise<TopicAssetsResponse> {
    const res = await fetch(topicUrl(topicPath, '/assets'));
    return handleResponse<TopicAssetsResponse>(res);
}

/** `GET .../examples/:filename`: the markdown source of one example. Throws on a missing file. */
export async function fetchExample(topicPath: string, filename: string): Promise<ExampleReadResponse> {
    const res = await fetch(topicUrl(topicPath, `/examples/${encodeURIComponent(filename)}`));
    return handleResponse<ExampleReadResponse>(res);
}

/** `POST .../examples`: saves `content` as a NEW example; the server picks the (timestamp) file name. */
export async function saveExample(topicPath: string, content: string): Promise<ExampleSaveResponse> {
    const body: ExampleSaveRequest = { content };
    const res = await fetch(topicUrl(topicPath, '/examples'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<ExampleSaveResponse>(res);
}

/**
 * `POST /api/create`: makes a chapter, section, topic or example. `parentPath` locates the parent
 * (see {@link CreateItemRequest}); `options.sessionPreset` only matters for examples.
 */
export async function createItem(
    type: CreateItemType,
    name: string,
    parentPath = '',
    options: CreateItemOptions = {},
): Promise<CreateItemResponse> {
    const body: CreateItemRequest = { type, name, parentPath, ...options };
    const res = await fetch(`${BASE}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<CreateItemResponse>(res);
}

/** `PATCH .../examples/:filename`: overwrites an existing example. */
export async function modifyExample(topicPath: string, filename: string, content: string): Promise<ExampleModifyResponse> {
    const body: ExampleModifyRequest = { content };
    const res = await fetch(topicUrl(topicPath, `/examples/${encodeURIComponent(filename)}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<ExampleModifyResponse>(res);
}

/** `DELETE .../examples/:filename`: deletes an example (the server also drops it from favorites and pending). */
export async function removeExample(topicPath: string, filename: string): Promise<ExampleDeleteResponse> {
    const res = await fetch(topicUrl(topicPath, `/examples/${encodeURIComponent(filename)}`), {
        method: 'DELETE',
    });
    return handleResponse<ExampleDeleteResponse>(res);
}

/** `PUT .../examples/:oldFilename`: renames an example. Rejects when `newFilename` already exists. */
export async function renameExample(topicPath: string, oldFilename: string, newFilename: string): Promise<ExampleRenameResponse> {
    const body: ExampleRenameRequest = { newFilename };
    const res = await fetch(topicUrl(topicPath, `/examples/${encodeURIComponent(oldFilename)}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return handleResponse<ExampleRenameResponse>(res);
}

/**
 * `POST /api/compile`: compiles a document (or raw example text) on the server. Used directly by the
 * compile worker and, as a fallback, by compileClient.ts.
 */
export async function requestCompileExample({ document, content }: CompileRequest): Promise<CompileResponse> {
    const res = await fetch(`${BASE}/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ document, content }),
    });
    return handleResponse<CompileResponse>(res);
}
