# Pug
```pug
main.demo-card(data-combo="pug-scss")
  h1 Pug playground
  p#status Combination: pug-scss
  button#action(type="button") Toggle state
```

# SCSS
```scss
$accent: #b45309;

.demo-card {
  max-width: 420px;
  padding: 24px;
  border: 2px solid $accent;
  border-radius: 18px;
  background: rgba($accent, 0.12);
  color: #431407;
  font: 16px/1.5 system-ui, sans-serif;

  #action {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: $accent;
    color: #ffffff;
    cursor: pointer;
  }

  &.is-active {
    background: rgba(#059669, 0.14);
    border-color: #059669;
    color: #065f46;
  }
}
```
