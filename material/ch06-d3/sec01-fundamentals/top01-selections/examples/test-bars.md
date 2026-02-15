# HTML

```html
<h1>test-bars</h1>
```

# CSS

```css
h1 {
  color: #58a6ff;
}
```

# JavaScript

```javascript
const data = [10, 20, 30, 40, 50, 60, 70];
d3.select("body").selectAll("div")
  .data(data).join("div")
  .style("width", d => d * 5 + "px")
  .style("height", "20px")
  .style("background", "#58a6ff")
  .style("margin", "2px")
  .text(d => d);
```
