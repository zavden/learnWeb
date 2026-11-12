// Typed DOM lookups.
//
// Most of the UI is wired to elements that index.html always contains. These helpers return such
// an element with the type the caller asks for, without the `| null` that the DOM API adds. They do
// not check anything: a missing element comes back as `null` and fails at its first use, exactly as
// a bare `document.getElementById()` call would. For an element that may really be absent, call the
// DOM API directly and handle `null`.

/** The element with this id, which index.html is known to contain. */
export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
    return document.getElementById(id) as T;
}

/** The first match of `selector` under `root`, for a match that is known to exist. */
export function queryRequired<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
    return root.querySelector(selector) as T;
}
