// ─── Theory Viewer Component ────────────────────────────

import { fetchTopicMain } from '../utils/api.js';
import { renderTheoryHtml } from '../utils/theoryRenderer.js';
import { loadTheoryExerciseEmbeds } from '../utils/theoryExerciseEmbeds.js';

export class TheoryViewer {
  constructor({ onEditRequest, onExerciseOpenRequest, onExercisePreviewRequest } = {}) {
    this.onEditRequest = onEditRequest;
    this.onExerciseOpenRequest = onExerciseOpenRequest;
    this.onExercisePreviewRequest = onExercisePreviewRequest;
    this.panel = document.getElementById('theory-panel');
    this.container = document.getElementById('theory-content');
    this.btnTheory = document.getElementById('btn-theory');
    this.btnEdit = document.getElementById('btn-edit-theory');
    this.btnClose = document.getElementById('btn-close-theory');
    this.currentContent = '';
    this.currentTopicPath = '';
    this._renderToken = 0;

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

    this.container?.addEventListener('click', (event) => {
      const openButton = event.target.closest('[data-theory-exercise-open]');
      if (openButton) {
        event.preventDefault();
        event.stopPropagation();
        this._handleExerciseOpen(openButton.getAttribute('data-theory-exercise-open'));
        return;
      }

      const previewButton = event.target.closest('[data-theory-exercise-preview]');
      if (previewButton) {
        event.preventDefault();
        event.stopPropagation();
        this._handleExercisePreview(previewButton.getAttribute('data-theory-exercise-preview'));
        return;
      }

      const card = event.target.closest('.theory-exercise-embed[data-theory-exercise-exists="1"]');
      if (card) {
        event.preventDefault();
        this._handleExercisePreview(card.getAttribute('data-theory-exercise-file'));
      }
    });

    this.container?.addEventListener('keydown', (event) => {
      const card = event.target.closest('.theory-exercise-embed[data-theory-exercise-exists="1"]');
      if (!card) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this._handleExercisePreview(card.getAttribute('data-theory-exercise-file'));
    });

  }

  async load(topicPath) {
    this.currentTopicPath = topicPath || '';
    if (this.btnEdit) {
      this.btnEdit.disabled = !this.currentTopicPath;
    }

    const data = await fetchTopicMain(topicPath);
    await this.renderContent(data?.content || '');
  }

  async renderContent(content = '') {
    this.currentContent = typeof content === 'string' ? content : String(content ?? '');
    const renderToken = ++this._renderToken;

    if (this.currentContent) {
      const exerciseEmbeds = await loadTheoryExerciseEmbeds(this.currentTopicPath, this.currentContent);
      if (renderToken !== this._renderToken) return;
      this.container.innerHTML = renderTheoryHtml(this.currentContent, {
        exerciseEmbeds,
      });
      this._hydrateExercisePreviewSlots(exerciseEmbeds);
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
    this._renderToken += 1;
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

  _handleExercisePreview(filename) {
    const normalizedFilename = String(filename || '').trim();
    if (!normalizedFilename || !this.currentTopicPath || typeof this.onExercisePreviewRequest !== 'function') return;
    this.onExercisePreviewRequest(this.currentTopicPath, normalizedFilename);
  }

  _handleExerciseOpen(filename) {
    const normalizedFilename = String(filename || '').trim();
    if (!normalizedFilename || !this.currentTopicPath || typeof this.onExerciseOpenRequest !== 'function') return;
    this.onExerciseOpenRequest(this.currentTopicPath, normalizedFilename);
  }

  _hydrateExercisePreviewSlots(exerciseEmbeds = {}) {
    if (!this.container) return;

    this.container.querySelectorAll('[data-theory-exercise-preview-slot]').forEach((slot) => {
      const filename = String(slot.getAttribute('data-theory-exercise-preview-slot') || '').trim();
      const previewSrcdoc = exerciseEmbeds?.[filename]?.previewSrcdoc || '';
      if (!previewSrcdoc) {
        slot.classList.add('is-empty');
        slot.innerHTML = `<span>${slot.closest('.theory-exercise-embed')?.dataset?.theoryExerciseExists === '1'
          ? 'Preview unavailable'
          : 'Exercise missing'}</span>`;
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.sandbox = 'allow-scripts';
      iframe.loading = 'lazy';
      iframe.srcdoc = previewSrcdoc;
      slot.classList.remove('is-empty');
      slot.innerHTML = '';
      slot.appendChild(iframe);
    });
  }
}
