// ─── Sidebar Navigation Component ───────────────────────

import { fetchTree } from '../utils/api.js';

export class Sidebar {
    constructor({ onTopicSelect, onCreateClick }) {
        this.onTopicSelect = onTopicSelect;
        this.onCreateClick = onCreateClick;
        this.container = document.getElementById('nav-tree');
        this.btnCreate = document.getElementById('btn-create');
        this.tree = [];
        this.activeTopicPath = null;

        this.btnCreate.addEventListener('click', () => this.onCreateClick());
    }

    async load() {
        this.tree = await fetchTree();
        this.render();
    }

    render() {
        this.container.innerHTML = '';

        this.tree.forEach((chapter) => {
            const chDiv = document.createElement('div');
            chDiv.className = 'tree-chapter';

            // Chapter item
            const chItem = this._createItem(chapter.label, 'chapter-item', true);
            chDiv.appendChild(chItem);

            // Sections container
            const sectionsDiv = document.createElement('div');
            sectionsDiv.className = 'tree-children';

            chapter.sections.forEach((section) => {
                const secDiv = document.createElement('div');
                secDiv.className = 'tree-section';

                const secItem = this._createItem(section.label, 'section-item', true);
                secDiv.appendChild(secItem);

                // Topics container
                const topicsDiv = document.createElement('div');
                topicsDiv.className = 'tree-children';

                section.topics.forEach((topic) => {
                    const topItem = this._createItem(topic.label, 'topic-item', false);
                    topItem.dataset.path = topic.path;

                    // Add '+' button for new example
                    const btnAdd = document.createElement('button');
                    btnAdd.className = 'btn-icon btn-add-example';
                    btnAdd.title = 'New Example';
                    btnAdd.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;

                    btnAdd.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent topic selection
                        // Open create dialog pre-filled for this topic
                        // We need to pass the topic path to the create dialog
                        // But CreateDialog expects a parent selection.
                        // We can modify openCreateDialog or just open it and let user select?
                        // User said: "boton + que me permita crear un nuevo ejemplo en ese topico".
                        // So it should reference this topic.
                        // For now, let's trigger the global create click, but maybe we can improve context later.
                        // Or better: call a specific method on main app?
                        // The Sidebar constructor has onCreateClick.
                        // Let's pass the context.
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

                // Toggle sections
                secItem.addEventListener('click', () => {
                    this._toggleChildren(secItem, topicsDiv);
                });
            });

            chDiv.appendChild(sectionsDiv);
            this.container.appendChild(chDiv);

            // Toggle chapters
            chItem.addEventListener('click', () => {
                this._toggleChildren(chItem, sectionsDiv);
            });
        });
    }

    _createItem(label, className, hasArrow) {
        const div = document.createElement('div');
        div.className = `tree-item ${className}`;

        if (hasArrow) {
            const arrow = document.createElement('span');
            arrow.className = 'arrow expanded';
            arrow.textContent = '▶';
            div.appendChild(arrow);
        }

        const labelSpan = document.createElement('span');
        labelSpan.className = 'label';
        labelSpan.textContent = label;
        div.appendChild(labelSpan);

        return div;
    }

    _toggleChildren(item, childrenDiv) {
        const arrow = item.querySelector('.arrow');
        if (!arrow) return;

        const isExpanded = arrow.classList.contains('expanded');
        if (isExpanded) {
            childrenDiv.classList.add('collapsed');
            arrow.classList.remove('expanded');
        } else {
            childrenDiv.classList.remove('collapsed');
            arrow.classList.add('expanded');
        }
    }

    setActive(topicPath) {
        this.activeTopicPath = topicPath;
        this.container.querySelectorAll('.tree-item').forEach((el) => {
            el.classList.remove('active');
        });
        const activeEl = this.container.querySelector(`[data-path="${topicPath}"]`);
        if (activeEl) activeEl.classList.add('active');
    }

    /** Returns tree data for create dialog parent selection */
    getTree() {
        return this.tree;
    }
}
