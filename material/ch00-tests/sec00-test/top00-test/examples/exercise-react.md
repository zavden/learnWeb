---
framework: react
mode: multi-file
entry: src/main.jsx
exercise: true
exercise_title: "Finish the learner profile"
exercise_instructions: "Render the city from the hidden reference JSON || Add one extra skill chip in App.jsx || Keep styles.css locked"
exercise_hints: "The JSON file is already imported in App.jsx || Reveal the reference file only if you get stuck"
exercise_locked_files: src/styles.css
exercise_compare_pairs: src/App.jsx=>src/solution/AppSolution.jsx
exercise_reference_files: src/data/profile.json
exercise_solution_files: src/solution/AppSolution.jsx
example_stage: exercise
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
import profile from './data/profile.json';

export function App() {
  return (
    <main className="learner-card">
      <p className="learner-card__eyebrow">Exercise</p>
      <h1>{profile.name}</h1>
      <p>TODO: Render the city here.</p>
      <div className="learner-card__skills">
        {profile.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
        <span>TODO</span>
      </div>
    </main>
  );
}
```

## @file src/data/profile.json
## @lang json
## @role config

```json
{
  "name": "React Learner",
  "city": "Guadalajara",
  "skills": ["Props", "State", "Hooks"]
}
```

## @file src/solution/AppSolution.jsx
## @lang jsx
## @role util

```jsx
import React from 'react';
import profile from '../data/profile.json';

export function AppSolution() {
  return (
    <main className="learner-card">
      <p className="learner-card__eyebrow">Solution</p>
      <h1>{profile.name}</h1>
      <p>{profile.city}</p>
      <div className="learner-card__skills">
        {profile.skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
        <span>Debugging</span>
      </div>
    </main>
  );
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

.learner-card {
  display: grid;
  gap: 14px;
  max-width: 480px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.82);
}

.learner-card__eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.learner-card h1,
.learner-card p {
  margin: 0;
}

.learner-card__skills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.learner-card__skills span {
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  color: #1d4ed8;
}
```
