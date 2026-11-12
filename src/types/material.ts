// Shapes of the material library as the local API serves it.
//
// `material/` holds the course: chapter folders (`chNN-slug`) containing section folders (`secNN-slug`)
// containing topic folders (`topNN-slug`). `buildMaterialTree` (src/utils/materialTree.ts) reads those
// folders, `GET /api/tree` sends the result and the sidebar renders it. Next to the tree, three small
// JSON dotfiles in the repository root keep the user's state: `.hiddens` (hidden chapters),
// `.favorites` and `.pending` (example files). Users edit those files by hand, so every type below that
// describes file CONTENT comes in two flavours: the raw shape (untrusted, whatever was parsed) and the
// normalized shape (what the stores return after cleaning it up).

/**
 * Where a tree label comes from: `custom` is a real title (a chapter or section `label.txt`, or the first
 * heading of a topic's `main.md`); `slug` is the folder name with its dashes turned into spaces.
 */
export type MaterialLabelSource = 'custom' | 'slug';

/** A topic folder (`topNN-slug`): one theory page (`main.md`) plus its examples. */
export interface MaterialTopic {
    /** Folder name, e.g. `top03-logica-booleana`. */
    id: string;
    label: string;
    labelSource: MaterialLabelSource;
    /** The `NN` of the folder name; `0` when the name does not follow the `topNN-slug` pattern. */
    number: number;
    /** `chapterId/sectionId/topicId`: the key every `/api/topic/...` route and the saved session use. */
    path: string;
}

/** A section folder (`secNN-slug`) with its topics in numeric order. */
export interface MaterialSection {
    /** Folder name, e.g. `sec01-operadores`. */
    id: string;
    label: string;
    labelSource: MaterialLabelSource;
    /** The `NN` of the folder name; `0` when the name does not follow the `secNN-slug` pattern. */
    number: number;
    topics: MaterialTopic[];
}

/** A chapter folder (`chNN-slug`) with its sections in numeric order. */
export interface MaterialChapter {
    /** Folder name, e.g. `ch01-logica`. */
    id: string;
    /** `true` when the chapter is listed in `.hiddens`. Hidden chapters are only sent when asked for. */
    hidden: boolean;
    label: string;
    labelSource: MaterialLabelSource;
    /** The `NN` of the folder name; `0` when the name does not follow the `chNN-slug` pattern. */
    number: number;
    sections: MaterialSection[];
}

/** The whole library: chapters in numeric order (`[]` when `material/` does not exist). */
export type MaterialTree = MaterialChapter[];

/**
 * Content of `.hiddens` as read from disk. Hand-edited, so nothing is guaranteed: only `chapters` is
 * looked at, and only when it is an array whose entries are then cleaned one by one.
 */
export interface RawHiddenState {
    chapters?: unknown;
}

/** Normalized `.hiddens` state: unique, sorted chapter folder names (`chNN-slug`). */
export interface HiddenState {
    chapters: string[];
}

/**
 * Content of `.favorites` / `.pending` as read from disk: either `{ "items": [...] }` or a bare array.
 * Entries are untrusted (any JSON value) until the stores normalize them.
 */
export type RawExampleListState = unknown[] | { items?: unknown };

/**
 * Normalized `.favorites` / `.pending` state: unique repository-relative example paths such as
 * `material/ch01-a/sec01-b/top01-c/examples/demo.md`, in file order. Anything that is not such a path
 * has been dropped.
 */
export interface ExampleListState {
    items: string[];
}

/** Favorites and pending lists have the same shape and rules. */
export type FavoritesState = ExampleListState;
export type PendingState = ExampleListState;

/**
 * One saved example reference resolved against the disk, as the favorites and pending dialogs list it.
 * `exists` is `false` for a path whose file was deleted or renamed outside the app.
 */
export interface ExampleReferenceEntry {
    exists: boolean;
    /** File name only, e.g. `demo.md`. */
    filename: string;
    /** The normalized repository-relative path (the same string stored in `items`). */
    path: string;
    /** `chapterId/sectionId/topicId` of the example, or `''` when the path has no three-folder topic. */
    topicPath: string;
}

export type FavoriteEntry = ExampleReferenceEntry;
export type PendingEntry = ExampleReferenceEntry;
