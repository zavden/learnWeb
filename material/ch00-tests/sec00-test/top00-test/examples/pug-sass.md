# Pug
```pug
main.demo-card(data-combo="pug-sass")
  h1 Pug playground
  p#status Combination: pug-sass
  button#action(type="button") Toggle state
```

# SASS
```sass
$accent: #7c3aed

.demo-card
  max-width: 420px
  padding: 24px
  border: 2px solid $accent
  border-radius: 18px
  background: rgba($accent, 0.12)
  color: #2e1065
  font: 16px/1.5 system-ui, sans-serif

  #action
    padding: 10px 14px
    border: 0
    border-radius: 999px
    background: $accent
    color: #ffffff
    cursor: pointer

  &.is-active
    background: rgba(#0f766e, 0.14)
    border-color: #0f766e
    color: #134e4a
```
