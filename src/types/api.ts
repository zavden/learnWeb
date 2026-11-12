// Request and response payloads of the local API (`/api/...`, served by server.ts on port 3001).
//
// One section per endpoint family. The browser calls them through src/utils/api.ts (which returns
// these types) and server.ts builds them in its route handlers. Every JSON body is exactly what the
// route handler sends; failures are always `ApiErrorBody` with a non-2xx status. These are TYPES only:
// nothing here is checked at runtime, so a response is as trustworthy as the server that sent it.
//
// The demo API under `/api/demo` (src/utils/demoApi.ts) and the static topic assets
// (`GET /api/topic/:ch/:sec/:top/assets/<file>`, raw file bytes) are not JSON payloads of this app and
// are not described here.

import type { ExampleReferenceEntry, HiddenState, MaterialTree } from './material.ts';

// TODO(ts-migration): use ExampleDocument from src/types/document.ts once it exists
/** A parsed example document as the compile route receives it (the real model lives in src/types/document.ts). */
export type CompileRequestDocument = object;

// TODO(ts-migration): use the compile result types from src/types/compile.ts once they exist
/** The compiled output of a document (the real model lives in src/types/compile.ts). */
export interface CompileResponse {
    document: CompileRequestDocument;
    compiledDocument: object;
    compileDiagnostics: object[];
    compileMeta: object;
}

/** Body of every failed response (status 400, 403, 404, 409, 410 or 500, depending on the route). */
export interface ApiErrorBody {
    error: string;
}

// ─── Tree and hidden chapters ──────────────────────────────────

/** `GET /api/tree` (`?includeHidden=1` keeps the hidden chapters, flagged `hidden: true`). */
export type TreeResponse = MaterialTree;

/** `GET /api/tree/hidden-state`: the normalized content of `.hiddens`. */
export type HiddenStateResponse = HiddenState;

/** Body of `PATCH /api/tree/chapters/:chapterId/hidden`. Anything but `hidden: false` hides the chapter. */
export interface SetChapterHiddenRequest {
    hidden?: boolean;
}

/**
 * Response of `PATCH /api/tree/chapters/:chapterId/hidden`. Answers 400 for an id that is not
 * `chNN-slug` and 404 when the chapter folder does not exist.
 */
export interface SetChapterHiddenResponse {
    chapterId: string;
    hidden: boolean;
    /** `.hiddens` after the change. */
    hiddenState: HiddenState;
    /** The visible tree after the change (hidden chapters left out). */
    tree: MaterialTree;
}

// ─── Editor defaults (Vim and system clipboard) ────────────────

/**
 * Response of `GET` and `PATCH /api/editor/vim-default` and `/api/editor/clipboard-default`: whether the
 * option is on by default. Enabled when the flag file is missing.
 */
export interface EditorFlagState {
    enabled: boolean;
}

/** Body of the `PATCH` routes above. Anything but `enabled: false` turns the option on. */
export interface EditorFlagRequest {
    enabled?: boolean;
}

export type VimDefaultState = EditorFlagState;
export type ClipboardDefaultState = EditorFlagState;

// ─── Vim shortcuts ─────────────────────────────────────────────

// TODO(ts-migration): use VimShortcutConfig from src/editor/vimShortcutConfig.ts once it exists
/** Vim shortcut table: section (`global`, `tabs`, `panels`, `shaders`) > key group (`shift`, `leader`, ...) > action > key token. */
export type VimShortcutConfigPayload = Record<string, Record<string, Record<string, string>>>;

/** Response of `GET /api/editor/vim-shortcuts`. */
export interface VimShortcutsResponse {
    /** The effective shortcuts: the defaults merged with `vim-shortcuts.yaml`. */
    config: VimShortcutConfigPayload;
    /** Always `vim-shortcuts.yaml`: the file the user edits. */
    path: string;
    /** `file` when the YAML was valid and used; `default` when it was missing, empty or rejected. */
    source: 'default' | 'file';
    /** Why the YAML was rejected (empty when `source` is `file` or the file is empty). */
    warnings: string[];
}

// ─── Favorites and pending ─────────────────────────────────────

/** Body of `POST` and `DELETE /api/favorites` and `/api/pending`: a repository-relative example path. */
export interface ExamplePathRequest {
    path: string;
}

/** Response of `GET /api/favorites`. */
export interface FavoritesResponse {
    /** The same list resolved against the disk. */
    entries: ExampleReferenceEntry[];
    /** Normalized example paths, in file order. */
    items: string[];
}

/**
 * Response of `POST` and `DELETE /api/favorites`. A path that is not an example file is accepted and
 * ignored, so `items` may not contain `path`.
 */
export interface FavoriteChangeResponse extends FavoritesResponse {
    /** The trimmed path from the request (not normalized). */
    path: string;
}

/** Response of `GET /api/pending`. */
export type PendingResponse = FavoritesResponse;

/** Response of `POST` and `DELETE /api/pending`. */
export type PendingChangeResponse = FavoriteChangeResponse;

// ─── Topic theory (`main.md`) ──────────────────────────────────

/** Response of `GET /api/topic/:ch/:sec/:top/main` (404 `main.md not found` when the topic has none). */
export interface TopicMainResponse {
    content: string;
}

/** Body of `PATCH /api/topic/:ch/:sec/:top/main`. The server stores a non-string as its string form. */
export interface TopicMainWriteRequest {
    content: string;
}

/** Response of `PATCH /api/topic/:ch/:sec/:top/main`. */
export interface TopicMainWriteResponse {
    filename: 'main.md';
}

// ─── Topic examples ────────────────────────────────────────────

/** Response of `GET /api/topic/:ch/:sec/:top/examples`: `.md` file names (README excluded) in natural order. `[]` when the topic has no `examples/` folder. */
export type ExamplesListResponse = string[];

/** Response of `GET /api/topic/:ch/:sec/:top/examples/:file` (404 `File not found`). */
export interface ExampleReadResponse {
    content: string;
}

/** Body of `POST /api/topic/:ch/:sec/:top/examples` (save as a new, timestamp-named example). */
export interface ExampleSaveRequest {
    content: string;
}

/** Response of `POST /api/topic/:ch/:sec/:top/examples`. */
export interface ExampleSaveResponse {
    /** The generated name, like `nov-12-2026-09:30:15.md`. */
    filename: string;
}

/** Body of `PATCH /api/topic/:ch/:sec/:top/examples/:file` (400 `Missing content` when it is not a string). */
export interface ExampleModifyRequest {
    content: string;
}

/** Response of `PATCH /api/topic/:ch/:sec/:top/examples/:file` (404 `File not found`). */
export interface ExampleModifyResponse {
    filename: string;
}

/** Response of `DELETE /api/topic/:ch/:sec/:top/examples/:file` (404 `File not found`). */
export interface ExampleDeleteResponse {
    deleted: string;
}

/** Body of `PUT /api/topic/:ch/:sec/:top/examples/:file` (rename). */
export interface ExampleRenameRequest {
    newFilename: string;
}

/** Response of `PUT /api/topic/:ch/:sec/:top/examples/:file`. Answers 404 `File not found` and 409 `Target filename already exists`. */
export interface ExampleRenameResponse {
    oldFilename: string;
    newFilename: string;
}

// ─── Create ────────────────────────────────────────────────────

/** What `POST /api/create` can make. */
export type CreateItemType = 'chapter' | 'section' | 'topic' | 'example';

/**
 * Body of `POST /api/create`. `parentPath` is the parent's path: empty for a chapter, `chapterId` for a
 * section, `chapterId/sectionId` for a topic, `chapterId/sectionId/topicId` for an example.
 */
export interface CreateItemRequest {
    type: CreateItemType;
    /** Display name; for an example, the file name (`.md` is appended when missing). */
    name: string;
    parentPath?: string;
    /** Examples only: the preset the new example starts from (default `html-css-javascript`). */
    sessionPreset?: string;
}

/** Response for a new chapter, section or topic folder. */
export interface CreateFolderResponse {
    /** The generated folder name, like `ch05-my-chapter`. */
    folderName: string;
    /** Absolute path of the new folder on the server's disk. */
    path: string;
}

/** Response for a new example (409 `Example already exists` when the file is there). */
export interface CreateExampleResponse {
    filename: string;
    /** Absolute path of the new file on the server's disk. */
    path: string;
    sessionPreset: string;
}

/** Response of `POST /api/create`. Answers 400 `Invalid type` and 404 `Parent not found` on failure. */
export type CreateItemResponse = CreateFolderResponse | CreateExampleResponse;

// ─── Topic assets ──────────────────────────────────────────────

/** One file of a topic's `assets/` folder. */
export interface TopicAsset {
    /** Path inside `assets/`, with `/` separators (the same as `path`). */
    filename: string;
    path: string;
    /** Ready-to-use URL of the file (`/api/topic/.../assets/<path>`), every segment URL-encoded. */
    url: string;
}

/** Response of `GET /api/topic/:ch/:sec/:top/assets`: all files below `assets/` (dotfiles skipped), sorted by name. `[]` when there is no folder. */
export type TopicAssetsResponse = TopicAsset[];

// ─── Preview documents ─────────────────────────────────────────

/** Body of `POST /api/preview-documents`. */
export interface PreviewDocumentRequest {
    /** The complete rendered HTML document (400 `Missing preview html` when it is not a string). */
    html: string;
    /** `chapterId/sectionId/topicId` the example belongs to, so relative URLs reach its `assets/`. A path that is not exactly three segments hosts the document outside any topic. */
    topicPath?: string;
    /** Sent by the client for its own bookkeeping; the server ignores it. */
    renderId?: number;
}

/** Response of `POST /api/preview-documents`. */
export interface PreviewDocumentResponse {
    id: string;
    /** Origin of the API server as the server sees it. The client may swap the host (see previewHost.ts). */
    origin: string;
    port: number;
    /** Path of the hosted document, relative to the origin (`/preview/<ch>/<sec>/<top>/<id>/index.html`). */
    url: string;
}

// ─── Compile ───────────────────────────────────────────────────

/** Body of `POST /api/compile`: a parsed document, or raw example text when there is no document. */
export interface CompileRequest {
    document?: CompileRequestDocument;
    content?: string;
}
