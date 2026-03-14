// ─── Theory Viewer Component ────────────────────────────

import { fetchTopicMain } from '../utils/api.js';
import { renderTheoryHtml } from '../utils/theoryRenderer.js';

export class TheoryViewer {
  constructor({ onEditRequest } = {}) {
    this.onEditRequest = onEditRequest;
    this.panel = document.getElementById('theory-panel');
    this.container = document.getElementById('theory-content');
    this.btnTheory = document.getElementById('btn-theory');
    this.btnEdit = document.getElementById('btn-edit-theory');
    this.btnClose = document.getElementById('btn-close-theory');
    this.currentContent = '';
    this.currentTopicPath = '';

    this._initEvents();
  }

  _initEvents() {
    this.btnTheory.addEventListener('click', () => {
      this.toggle();
    });

    this.btnClose.addEventListener('click', () => {
      this.hide();
    });

    this.btnEdit?.addEventListener('click', () => {
      if (!this.currentTopicPath || typeof this.onEditRequest !== 'function') return;
      this.onEditRequest(this.currentTopicPath, this.currentContent);
    });

  }

  async load(topicPath) {
    this.currentTopicPath = topicPath || '';
    if (this.btnEdit) {
      this.btnEdit.disabled = !this.currentTopicPath;
    }

    const data = await fetchTopicMain(topicPath);
    this.renderContent(data?.content || '');
  }

  renderContent(content = '') {
    this.currentContent = typeof content === 'string' ? content : String(content ?? '');

    if (this.currentContent) {
      this.container.innerHTML = renderTheoryHtml(this.currentContent);
      return;
    }

    this.container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No theory content for this topic yet</p>
      </div>
    `;
  }

  toggle() {
    this.panel.classList.toggle('hidden');
  }

  show() {
    this.panel.classList.remove('hidden');
  }

  hide() {
    this.panel.classList.add('hidden');
  }

  clear() {
    this.currentTopicPath = '';
    this.currentContent = '';
    if (this.btnEdit) {
      this.btnEdit.disabled = true;
    }
    this.container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📖</span>
        <p>Select a topic from the sidebar to begin</p>
      </div>
    `;
    this.hide();
  }
}
