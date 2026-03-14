---
entry: src/main.jsx
framework: react
mode: multi-file
example_description: "React multi-file project that imports local JSON and renders a lesson list with an SVG asset."
example_tags: "react|jsx|project|json|assets"
example_rating: 5
example_importance: important
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
import React from 'react';
import lessonData from './data/lessons.json';

export function App() {
  return (
    <main className="json-demo">
      <header className="json-demo__hero">
        <img src="lesson-badge.svg" alt="Lesson badge" width="64" height="64" />
        <div>
          <p className="json-demo__eyebrow">React + local JSON</p>
          <h1>{lessonData.title}</h1>
          <p>{lessonData.description}</p>
        </div>
      </header>
      <ol className="json-demo__list">
        {lessonData.lessons.map((lesson) => (
          <li key={lesson.id}>
            <strong>{lesson.label}</strong>
            <span>{lesson.duration}</span>
          </li>
        ))}
      </ol>
    </main>
  );
}
```

## @file src/data/lessons.json
## @lang json
## @role config

```json
{
  "title": "React Data Snapshot",
  "description": "This mini-project imports JSON from the same Markdown document.",
  "lessons": [
    {
      "id": 1,
      "label": "Props review",
      "duration": "8 min"
    },
    {
      "id": 2,
      "label": "State refresh",
      "duration": "18 min"
    },
    {
      "id": 3,
      "label": "Hook order",
      "duration": "10 min"
    }
  ]
}
```

## @file src/styles.css
## @lang css
## @role style

```css
body {
  margin: 0;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

.json-demo {
  display: grid;
  gap: 18px;
  max-width: 720px;
  margin: 0 auto;
}

.json-demo__hero {
  display: flex;
  gap: 16px;
  align-items: center;
}

.json-demo__eyebrow {
  margin: 0 0 4px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.json-demo__hero h1,
.json-demo__hero p {
  margin: 0;
}

.json-demo__list {
  display: grid;
  gap: 10px;
  margin: 0;
  padding-left: 20px;
}

.json-demo__list li {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.82);
}
```
