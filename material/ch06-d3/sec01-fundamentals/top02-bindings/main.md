# Data Bindings

The **data join** pattern is what makes D3 powerful. It binds data arrays to DOM elements.

## The Pattern: Enter, Update, Exit

```javascript
const data = [10, 20, 30, 40, 50];

const bars = d3.select("#chart")
  .selectAll("rect")
  .data(data);

// ENTER: Create new elements for new data
bars.enter()
  .append("rect")
  .attr("width", d => d * 5)
  .attr("height", 20)
  .attr("y", (d, i) => i * 25);

// UPDATE: Modify existing elements
bars.attr("width", d => d * 5);

// EXIT: Remove elements with no data
bars.exit().remove();
```

## The `.join()` Shorthand (D3 v5+)

```javascript
d3.select("#chart")
  .selectAll("rect")
  .data(data)
  .join("rect")
    .attr("width", d => d * 5)
    .attr("height", 20)
    .attr("y", (d, i) => i * 25)
    .attr("fill", "#58a6ff");
```

## Key Function

Use a key function for object identity:

```javascript
.data(data, d => d.id)
```
