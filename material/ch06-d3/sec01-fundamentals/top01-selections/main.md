# Selections

**Selections** are the core of D3. They let you select DOM elements and bind data to them.

## Selecting Elements

```javascript
d3.select("h1")          // First matching element
d3.selectAll("p")        // All matching elements
d3.select("#chart")      // By ID
d3.selectAll(".bar")     // By class
```

## Modifying Elements

```javascript
d3.select("h1")
  .text("Hello D3!")
  .style("color", "#58a6ff")
  .attr("class", "title")
  .classed("active", true);
```

## Chaining

D3 methods return the selection, so you can chain them:

```javascript
d3.selectAll("p")
  .style("color", "white")
  .style("font-size", "16px")
  .text("Updated!");
```

## Append & Remove

```javascript
d3.select("body")
  .append("svg")
  .attr("width", 400)
  .attr("height", 200);

d3.select(".old-element").remove();
```
