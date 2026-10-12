// ─── Toast notifications ────────────────────────────────
// Toasts are shown as manual popovers so they enter the browser top layer and
// stay visible above modal <dialog> elements (and their blurred backdrop).

const TOAST_DURATION_MS = 3000;

export function showToast(message, type = 'success') {
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
