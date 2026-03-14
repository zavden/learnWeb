function getDirectionStep(direction = '') {
    if (direction === 'left' || direction === 'up') return -1;
    if (direction === 'right' || direction === 'down') return 1;
    return 0;
}

export function getWrappedPanelIndex(length = 0, currentIndex = 0, direction = '') {
    const total = Number.isFinite(length) ? Math.max(0, Math.trunc(length)) : 0;
    if (total <= 1) return -1;

    const step = getDirectionStep(direction);
    if (!step) return -1;

    const normalizedIndex = Math.min(Math.max(Math.trunc(currentIndex), 0), total - 1);
    return (normalizedIndex + step + total) % total;
}

export function findDirectionalPanelTargetIndex(panels = [], currentIndex = 0, direction = '') {
    if (!Array.isArray(panels) || panels.length <= 1) return -1;

    const normalizedIndex = Math.min(Math.max(Math.trunc(currentIndex), 0), panels.length - 1);
    const currentPanel = panels[normalizedIndex];
    if (!currentPanel) return -1;

    const currentCenter = {
        x: currentPanel.left + (currentPanel.width / 2),
        y: currentPanel.top + (currentPanel.height / 2),
    };

    let bestIndex = -1;
    let bestScore = Number.POSITIVE_INFINITY;

    panels.forEach((panel, panelIndex) => {
        if (!panel || panelIndex === normalizedIndex) return;

        const center = {
            x: panel.left + (panel.width / 2),
            y: panel.top + (panel.height / 2),
        };
        const deltaX = center.x - currentCenter.x;
        const deltaY = center.y - currentCenter.y;

        let primary = null;
        let secondary = null;

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

        const score = primary + (secondary * 0.25);
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
