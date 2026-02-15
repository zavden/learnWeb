// ─── Theory Viewer Component ────────────────────────────

import { marked } from 'marked';
import { fetchTopicMain } from '../utils/api.js';

export class TheoryViewer {
  constructor() {
    this.panel = document.getElementById('theory-panel');
    this.container = document.getElementById('theory-content');
    this.btnTheory = document.getElementById('btn-theory');
    this.btnClose = document.getElementById('btn-close-theory');


    marked.setOptions({
      breaks: true,
      gfm: true,
    });

    this._initEvents();
  }

  _initEvents() {
    this.btnTheory.addEventListener('click', () => {
      this.toggle();
    });

    this.btnClose.addEventListener('click', () => {
      this.hide();
    });

  }





  async load(topicPath) {
    const data = await fetchTopicMain(topicPath);
    if (data.content) {
      this.container.innerHTML = marked.parse(data.content);
    } else {
      this.container.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>No theory content for this topic yet</p>
        </div>
      `;
    }
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
    this.container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📖</span>
        <p>Select a topic from the sidebar to begin</p>
      </div>
    `;
    this.hide();
  }
}
