// ─── Sidebar Navigation Component ───────────────────────

import { fetchTree, setChapterHidden } from '../utils/api.js';

export class Sidebar {
    constructor({ onTopicSelect, onCreateClick, onClipboardDefaultToggle, onFavoritesClick, onPendingClick, onPreviewInfoToggle, onVimDefaultToggle }) {
        this.onTopicSelect = onTopicSelect;
        this.onCreateClick = onCreateClick;
        this.onClipboardDefaultToggle = onClipboardDefaultToggle;
        this.onFavoritesClick = onFavoritesClick;
        this.onPendingClick = onPendingClick;
        this.onPreviewInfoToggle = onPreviewInfoToggle;
        this.onVimDefaultToggle = onVimDefaultToggle;
        this.container = document.getElementById('nav-tree');
        this.btnCreate = document.getElementById('btn-create');
        this.btnFavorites = document.getElementById('btn-favorites');
        this.btnSidebarPreviewInfo = document.getElementById('btn-sidebar-preview-info');
        this.btnSidebarClipboardDefault = document.getElementById('btn-sidebar-clipboard-default');
        this.btnSidebarVimDefault = document.getElementById('btn-sidebar-vim-default');
        this.btnToggleHiddenChapters = document.getElementById('btn-toggle-hidden-chapters');
        this.btnCollapseTree = document.getElementById('btn-collapse-tree');
        this.btnExpandTree = document.getElementById('btn-expand-tree');
        this.treeControls = document.getElementById('sidebar-tree-controls');
        this.tree = [];
        this.activeTopicPath = null;
        this.clipboardDefaultEnabled = true;
        this.previewInfoVisible = true;
        this.vimDefaultEnabled = true;
        this.showHiddenChapters = false;
        this.expandedChapterIds = new Set();
        this.expandedSectionIds = new Set();

        this.btnCreate.addEventListener('click', () => this.onCreateClick());
        this.btnFavorites?.addEventListener('click', () => this.onFavoritesClick?.());
        this.btnPending = document.getElementById('btn-pending');
        this.btnPending?.addEventListener('click', () => this.onPendingClick?.());
        this.btnSidebarPreviewInfo?.addEventListener('click', () => this.onPreviewInfoToggle?.(!this.previewInfoVisible));
        this.btnSidebarClipboardDefault?.addEventListener('click', () => this.onClipboardDefaultToggle?.(!this.clipboardDefaultEnabled));
        this.btnSidebarVimDefault?.addEventListener('click', () => this.onVimDefaultToggle?.(!this.vimDefaultEnabled));
        this.btnToggleHiddenChapters?.addEventListener('click', () => this.toggleHiddenChapters());
        this.btnCollapseTree?.addEventListener('click', () => this.collapseAll());
        this.btnExpandTree?.addEventListener('click', () => this.expandAllVisible());
        this._syncControlState();
    }

    async load() {
        this.tree = await fetchTree({ includeHidden: this.showHiddenChapters });
        this._syncExpansionState();
        this.render();
        if (this.activeTopicPath) {
            this._applyActiveClass();
        }
    }

    render() {
        this.container.innerHTML = '';
        this.container.classList.toggle('showing-hidden', this.showHiddenChapters);
        this._syncControlState();

        if (this.tree.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'tree-empty-state';
            emptyState.innerHTML = this.showHiddenChapters
                ? '<strong>No chapters found.</strong><span>The material tree is empty.</span>'
                : '<strong>No visible chapters.</strong><span>Use <code>Show Hidden</code> to inspect hidden chapters.</span>';
            this.container.appendChild(emptyState);
            return;
        }

        this.tree.forEach((chapter) => {
            const chDiv = document.createElement('div');
            chDiv.className = 'tree-chapter';

            const chapterKey = this._getChapterKey(chapter.id);
            const chapterExpanded = this.expandedChapterIds.has(chapterKey);
            const chItem = this._createItem(chapter.label, 'chapter-item', true, chapterExpanded);

            if (chapter.hidden) {
                chItem.classList.add('is-hidden-entry');
                const hiddenBadge = document.createElement('span');
                hiddenBadge.className = 'tree-hidden-badge';
                hiddenBadge.textContent = 'Hidden';
                chItem.appendChild(hiddenBadge);
            }

            const btnHide = document.createElement('button');
            btnHide.className = 'btn-icon btn-hide-chapter';
            btnHide.type = 'button';
            btnHide.title = chapter.hidden ? `Restore chapter: ${chapter.label}` : `Hide chapter: ${chapter.label}`;
            btnHide.setAttribute('aria-label', btnHide.title);
            btnHide.innerHTML = chapter.hidden
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`
                : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.9-2.54 2.66-4.74 4.94-6.23"></path><path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"></path><path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a11.78 11.78 0 0 1-1.67 2.87"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
            btnHide.addEventListener('click', async (event) => {
                event.stopPropagation();
                await this._toggleChapterHidden(chapter);
            });
            chItem.appendChild(btnHide);
            chDiv.appendChild(chItem);

            const sectionsDiv = document.createElement('div');
            sectionsDiv.className = 'tree-children';
            sectionsDiv.classList.toggle('collapsed', !chapterExpanded);

            chapter.sections.forEach((section) => {
                const sectionKey = this._getSectionKey(chapter.id, section.id);
                const sectionExpanded = this.expandedSectionIds.has(sectionKey);
                const secDiv = document.createElement('div');
                secDiv.className = 'tree-section';

                const secItem = this._createItem(section.label, 'section-item', true, sectionExpanded);
                secDiv.appendChild(secItem);

                const topicsDiv = document.createElement('div');
                topicsDiv.className = 'tree-children';
                topicsDiv.classList.toggle('collapsed', !sectionExpanded);

                section.topics.forEach((topic) => {
                    const topItem = this._createItem(topic.label, 'topic-item', false, false);
                    topItem.dataset.path = topic.path;

                    const btnAdd = document.createElement('button');
                    btnAdd.className = 'btn-icon btn-add-example';
                    btnAdd.title = 'New Example';
                    btnAdd.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

                    btnAdd.addEventListener('click', (event) => {
                        event.stopPropagation();
                        if (this.onCreateClick) {
                            this.onCreateClick(topic.path);
                        }
                    });

                    topItem.appendChild(btnAdd);
                    topItem.addEventListener('click', () => {
                        this.setActive(topic.path);
                        this.onTopicSelect(topic.path, topic.label);
                    });
                    topicsDiv.appendChild(topItem);
                });

                secDiv.appendChild(topicsDiv);
                sectionsDiv.appendChild(secDiv);

                secItem.addEventListener('click', () => {
                    this._toggleSection(sectionKey, secItem, topicsDiv);
                });
            });

            chDiv.appendChild(sectionsDiv);
            this.container.appendChild(chDiv);

            chItem.addEventListener('click', () => {
                this._toggleChapter(chapterKey, chItem, sectionsDiv);
            });
        });
    }

    _createItem(label, className, hasArrow, isExpanded = false) {
        const div = document.createElement('div');
        div.className = `tree-item ${className}`;

        if (hasArrow) {
            const arrow = document.createElement('span');
            arrow.className = `arrow${isExpanded ? ' expanded' : ''}`;
            arrow.textContent = '▶';
            div.appendChild(arrow);
        }

        const labelSpan = document.createElement('span');
        labelSpan.className = 'label';
        labelSpan.textContent = label;
        div.appendChild(labelSpan);

        return div;
    }

    _toggleChapter(chapterKey, item, childrenDiv) {
        const nextExpanded = !this.expandedChapterIds.has(chapterKey);
        this._setChapterExpanded(chapterKey, nextExpanded, item, childrenDiv);
    }

    _toggleSection(sectionKey, item, childrenDiv) {
        const nextExpanded = !this.expandedSectionIds.has(sectionKey);
        this._setSectionExpanded(sectionKey, nextExpanded, item, childrenDiv);
    }

    _setChapterExpanded(chapterKey, expanded, item, childrenDiv) {
        if (expanded) {
            this.expandedChapterIds.add(chapterKey);
        } else {
            this.expandedChapterIds.delete(chapterKey);
        }

        this._applyExpandedState(item, childrenDiv, expanded);
    }

    _setSectionExpanded(sectionKey, expanded, item, childrenDiv) {
        if (expanded) {
            this.expandedSectionIds.add(sectionKey);
        } else {
            this.expandedSectionIds.delete(sectionKey);
        }

        this._applyExpandedState(item, childrenDiv, expanded);
    }

    _applyExpandedState(item, childrenDiv, expanded) {
        const arrow = item.querySelector('.arrow');
        if (arrow) {
            arrow.classList.toggle('expanded', expanded);
        }
        childrenDiv.classList.toggle('collapsed', !expanded);
    }

    _syncExpansionState() {
        const availableChapterIds = new Set(this.tree.map((chapter) => this._getChapterKey(chapter.id)));
        this.expandedChapterIds = new Set(
            Array.from(this.expandedChapterIds).filter((chapterKey) => availableChapterIds.has(chapterKey)),
        );

        const availableSectionIds = new Set();
        this.tree.forEach((chapter) => {
            chapter.sections.forEach((section) => {
                availableSectionIds.add(this._getSectionKey(chapter.id, section.id));
            });
        });

        this.expandedSectionIds = new Set(
            Array.from(this.expandedSectionIds).filter((sectionKey) => availableSectionIds.has(sectionKey)),
        );

    }

    _getChapterKey(chapterId) {
        return `chapter:${chapterId}`;
    }

    _getSectionKey(chapterId, sectionId) {
        return `section:${chapterId}/${sectionId}`;
    }

    _ensureTopicAncestorsExpanded(topicPath) {
        const [chapterId, sectionId] = String(topicPath || '').split('/');
        if (!chapterId || !sectionId) return;

        this.expandedChapterIds.add(this._getChapterKey(chapterId));
        this.expandedSectionIds.add(this._getSectionKey(chapterId, sectionId));
    }

    setActive(topicPath) {
        this.activeTopicPath = topicPath;
        this._ensureTopicAncestorsExpanded(topicPath);
        this.render();
        this._applyActiveClass();
    }

    _applyActiveClass() {
        this.container.querySelectorAll('.tree-item').forEach((el) => {
            el.classList.remove('active');
        });
        const activeEl = this.container.querySelector(`[data-path="${this.activeTopicPath}"]`);
        if (activeEl) activeEl.classList.add('active');
    }

    collapseAll() {
        this.expandedChapterIds.clear();
        this.expandedSectionIds.clear();
        this.render();
        this._applyActiveClass();
    }

    expandAllVisible() {
        this.tree.forEach((chapter) => {
            if (chapter.hidden) return;
            this.expandedChapterIds.add(this._getChapterKey(chapter.id));
            chapter.sections.forEach((section) => {
                this.expandedSectionIds.add(this._getSectionKey(chapter.id, section.id));
            });
        });
        this.render();
        this._applyActiveClass();
    }

    async toggleHiddenChapters() {
        this.showHiddenChapters = !this.showHiddenChapters;
        await this.load();
    }

    _syncControlState() {
        if (this.btnSidebarPreviewInfo) {
            this.btnSidebarPreviewInfo.classList.toggle('is-active', this.previewInfoVisible);
            this.btnSidebarPreviewInfo.setAttribute('aria-pressed', String(this.previewInfoVisible));
            this.btnSidebarPreviewInfo.title = this.previewInfoVisible ? 'Hide preview info' : 'Show preview info';
            this.btnSidebarPreviewInfo.setAttribute('aria-label', this.btnSidebarPreviewInfo.title);
            this.btnSidebarPreviewInfo.textContent = this.previewInfoVisible ? 'Hide Info' : 'Show Info';
        }

        if (this.btnSidebarClipboardDefault) {
            this.btnSidebarClipboardDefault.classList.toggle('is-active', this.clipboardDefaultEnabled);
            this.btnSidebarClipboardDefault.setAttribute('aria-pressed', String(this.clipboardDefaultEnabled));
            this.btnSidebarClipboardDefault.title = this.clipboardDefaultEnabled ? 'Disable system clipboard default' : 'Enable system clipboard default';
            this.btnSidebarClipboardDefault.setAttribute('aria-label', this.btnSidebarClipboardDefault.title);
        }

        if (this.btnSidebarVimDefault) {
            this.btnSidebarVimDefault.classList.toggle('is-active', this.vimDefaultEnabled);
            this.btnSidebarVimDefault.setAttribute('aria-pressed', String(this.vimDefaultEnabled));
            this.btnSidebarVimDefault.title = this.vimDefaultEnabled ? 'Disable Vim default' : 'Enable Vim default';
            this.btnSidebarVimDefault.setAttribute('aria-label', this.btnSidebarVimDefault.title);
        }

        if (this.btnToggleHiddenChapters) {
            this.btnToggleHiddenChapters.classList.toggle('is-active', this.showHiddenChapters);
            this.btnToggleHiddenChapters.textContent = this.showHiddenChapters ? 'Hide Hidden' : 'Show Hidden';
            this.btnToggleHiddenChapters.title = this.showHiddenChapters
                ? 'Return to the normal tree view'
                : 'Temporarily show hidden chapters';
            this.btnToggleHiddenChapters.setAttribute('aria-pressed', String(this.showHiddenChapters));
        }

        if (this.treeControls) {
            this.treeControls.classList.toggle('is-showing-hidden', this.showHiddenChapters);
        }
    }

    setClipboardDefaultEnabled(enabled) {
        this.clipboardDefaultEnabled = Boolean(enabled);
        this._syncControlState();
    }

    setPreviewInfoVisible(visible) {
        this.previewInfoVisible = visible !== false;
        this._syncControlState();
    }

    setVimDefaultEnabled(enabled) {
        this.vimDefaultEnabled = Boolean(enabled);
        this._syncControlState();
    }

    /** Returns tree data for create dialog parent selection */
    getTree() {
        return this.tree.filter((chapter) => !chapter.hidden);
    }

    async _toggleChapterHidden(chapter) {
        if (!chapter?.id) return;

        const nextHidden = !chapter.hidden;
        const action = nextHidden ? 'Hide' : 'Restore';
        const confirmed = window.confirm(`${action} chapter "${chapter.label}" ${nextHidden ? 'from' : 'to'} the normal sidebar view?`);
        if (!confirmed) return;

        try {
            await setChapterHidden(chapter.id, nextHidden);
            await this.load();
        } catch (error) {
            console.error(`Failed to ${nextHidden ? 'hide' : 'restore'} chapter.`, error);
            window.alert(`Could not update chapter visibility: ${error.message}`);
        }
    }
}
