---
framework: react
---

# TSX
```tsx
type StepProps = {
  label: string;
  done: boolean;
};

function Step({ label, done }: StepProps) {
  return <li>{done ? 'Done' : 'Pending'}: {label}</li>;
}

function App() {
  const [steps] = React.useState<StepProps[]>([
    { label: 'Create components', done: true },
    { label: 'Add state', done: true },
    { label: 'Understand props', done: false },
  ]);

  return (
    <main>
      <h1>Hello React TSX</h1>
      <ul>
        {steps.map((step) => (
          <Step key={step.label} label={step.label} done={step.done} />
        ))}
      </ul>
    </main>
  );
}
```
