// ─── Toast notifications ────────────────────────────────
// Short status messages in the bottom corner, used by the editor, its dialogs, the gallery, the
// create dialog and the app shell (src/main.ts). Styles: `.toast.<type>` in src/styles/07-theory.css.
//
// Toasts are shown as manual popovers so they enter the browser top layer and
// stay visible above modal <dialog> elements (and their blurred backdrop).

const TOAST_DURATION_MS = 3000;

/** The toast flavours the stylesheet knows; the type becomes a CSS class and picks the ARIA role. */
export type ToastType = 'success' | 'error' | 'warning';

/**
 * Shows `message` for three seconds and returns the toast element (already in the page), or `null` when
 * there is no DOM (Node, tests). `error` toasts get `role="alert"`, the others `role="status"`.
 */
export function showToast(message: string, type: ToastType = 'success'): HTMLDivElement | null {
    if (typeof document === 'undefined') return null;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.textContent = message;

    const supportsPopover = typeof toast.showPopover === 'function';
    if (supportsPopover) {
        toast.setAttribute('popover', 'manual');
    }

    document.body.appendChild(toast);

    if (supportsPopover) {
        try {
            toast.showPopover();
        } catch {
            // Fall back to the regular fixed-position toast.
        }
    }

    window.setTimeout(() => toast.remove(), TOAST_DURATION_MS);
    return toast;
}
