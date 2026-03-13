function getBlockContent(documentModel, slot) {
    return (documentModel?.blocks || []).find((block) => block.slot === slot)?.content || '';
}

export function renderExampleDocument(documentModel, topicPath = '') {
    const markup = getBlockContent(documentModel, 'markup');
    const styles = getBlockContent(documentModel, 'style');
    const script = getBlockContent(documentModel, 'script');
    const assetBase = topicPath ? `/api/topic/${topicPath}/assets/` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${assetBase ? `<base href="${assetBase}">` : ''}
  <style>
    body { margin: 0; padding: 16px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    ${styles}
  </style>
</head>
<body>
  ${markup}
  <script>
  try {
    ${script}
  } catch (e) {
    document.body.innerHTML += '<pre style="color:red;margin-top:12px;font-size:12px;">Error: ' + e.message + '</pre>';
  }
  </script>
</body>
</html>`;
}
