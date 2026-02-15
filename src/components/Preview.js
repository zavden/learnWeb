// ─── Live Preview Component ─────────────────────────────

export class Preview {
    constructor() {
        this.iframe = document.getElementById('preview-frame');
        this.btnRefresh = document.getElementById('btn-refresh');
        this._debounceTimer = null;
        this._currentTopicPath = null;

        this.btnRefresh.addEventListener('click', () => {
            if (this._lastCode) this.update(this._lastCode);
        });

        this._lastCode = null;
    }

    setTopicPath(topicPath) {
        this._currentTopicPath = topicPath;
    }

    update({ html: htmlStr, css: cssStr, js: jsStr }) {
        this._lastCode = { html: htmlStr, css: cssStr, js: jsStr };

        // Debounce to avoid excessive iframe refreshes
        clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => {
            this._render(htmlStr, cssStr, jsStr);
        }, 300);
    }

    _render(htmlStr, cssStr, jsStr) {
        // Build asset base URL for the current topic
        const assetBase = this._currentTopicPath
            ? `/api/topic/${this._currentTopicPath}/assets/`
            : '';

        const doc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${assetBase ? `<base href="${assetBase}">` : ''}
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, sans-serif; }
    ${cssStr}
  </style>
</head>
<body>
  ${htmlStr}
  <script>
  try {
    ${jsStr}
  } catch(e) {
    document.body.innerHTML += '<pre style="color:red;margin-top:12px;font-size:12px;">Error: ' + e.message + '</pre>';
  }
  </script>
</body>
</html>`;

        this.iframe.srcdoc = doc;
    }
}
