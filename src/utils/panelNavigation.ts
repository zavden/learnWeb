// Keyboard navigation between the editor's panels (Ctrl+direction / Vim): which panel a direction leads to.
// Pure index math over panel geometry; the DOM lookups live in src/components/Editor.ts and
// src/components/editor/metadataDialogs.ts, which pass in plain rectangles.

/** A direction the user can move the focus in. */
export type PanelDirection = 'left' | 'right' | 'up' | 'down';

/** Position and size of a panel on screen (viewport pixels, as `getBoundingClientRect()` reports them). */
export interface PanelRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

function getDirectionStep(direction: PanelDirection | '' = ''): -1 | 0 | 1 {
    if (direction === 'left' || direction === 'up') return -1;
    if (direction === 'right' || direction === 'down') return 1;
    return 0;
}

/**
 * Index of the previous (`left`/`up`) or next (`right`/`down`) panel in document order, wrapping
 * around at the ends. `-1` when there are fewer than two panels or the direction is not one of the four.
 */
export function getWrappedPanelIndex(length = 0, currentIndex = 0, direction: PanelDirection | '' = ''): number {
    const total = Number.isFinite(length) ? Math.max(0, Math.trunc(length)) : 0;
    if (total <= 1) return -1;

    const step = getDirectionStep(direction);
    if (!step) return -1;

    const normalizedIndex = Math.min(Math.max(Math.trunc(currentIndex), 0), total - 1);
    return (normalizedIndex + step + total) % total;
}

/**
 * Index of the panel nearest to the current one in the given direction, by distance between centers
 * (the sideways offset counts a quarter as much). Only panels more than 4px away in that direction
 * qualify. When none does, `up`/`down` wrap around to the previous/next panel and `left`/`right`
 * give `-1`, as does any invalid input.
 */
export function findDirectionalPanelTargetIndex(
    panels: readonly PanelRect[] = [],
    currentIndex = 0,
    direction: PanelDirection | '' = '',
): number {
    if (!Array.isArray(panels) || panels.length <= 1) return -1;

    const normalizedIndex = Math.min(Math.max(Math.trunc(currentIndex), 0), panels.length - 1);
    const currentPanel = panels[normalizedIndex];
    if (!currentPanel) return -1;

    const currentCenter = {
        x: currentPanel.left + currentPanel.width / 2,
        y: currentPanel.top + currentPanel.height / 2,
    };

    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    panels.forEach((panel, panelIndex) => {
        if (!panel || panelIndex === normalizedIndex) return;

        const center = {
            x: panel.left + panel.width / 2,
            y: panel.top + panel.height / 2,
        };
        const deltaX = center.x - currentCenter.x;
        const deltaY = center.y - currentCenter.y;

        let primary: number | null = null;
        let secondary: number | null = null;

        if (direction === 'left' && deltaX < -4) {
            primary = Math.abs(deltaX);
            secondary = Math.abs(deltaY);
        } else if (direction === 'right' && deltaX > 4) {
            primary = Math.abs(deltaX);
            secondary = Math.abs(deltaY);
        } else if (direction === 'up' && deltaY < -4) {
            primary = Math.abs(deltaY);
            secondary = Math.abs(deltaX);
        } else if (direction === 'down' && deltaY > 4) {
            primary = Math.abs(deltaY);
            secondary = Math.abs(deltaX);
        }

        if (primary == null) return;

        // `secondary` is assigned together with `primary`, which is known to be set here.
        const score = primary + secondary! * 0.25;
        if (score < bestScore) {
            bestScore = score;
            bestIndex = panelIndex;
        }
    });

    if (bestIndex >= 0) {
        return bestIndex;
    }

    if (direction === 'up' || direction === 'down') {
        return getWrappedPanelIndex(panels.length, normalizedIndex, direction);
    }

    return -1;
}
