# HTML

```html
<svg id="canvas"></svg>
```

# CSS

```css
body {
  background: #1a1a2e;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
path {
  fill: none;
  stroke: #333;
  stroke-width: 2px;
  stroke-dasharray: 4;
}
circle {
  fill: #58a6ff;
  stroke: white;
  stroke-width: 2px;
}
```

# JavaScript

```javascript
const width = 600;
const height = 400;

const svg = d3.select("#canvas")
  .attr("width", width)
  .attr("height", height);

// 1. Define a random path generator
const line = d3.line()
  .curve(d3.curveCatmullRomClosed);

// Create some random points for the path
const data = d3.range(6).map(() => [
  50 + Math.random() * (width - 100),
  50 + Math.random() * (height - 100)
]);

// 2. Draw the path
const path = svg.append("path")
  .attr("d", line(data));

// 3. Draw the circle
const circle = svg.append("circle")
  .attr("r", 10)
  .attr("transform", `translate(${data[0]})`);

// 4. Animate along the path
function transition() {
  circle.transition()
    .duration(5000)
    .ease(d3.easeLinear)
    .attrTween("transform", translateAlong(path.node()))
    .on("end", transition); // Loop
}

// Helper: Returns an attrTween for translating along the specified path element.
function translateAlong(path) {
  const l = path.getTotalLength();
  return function(d, i, a) {
    return function(t) {
      const p = path.getPointAtLength(t * l);
      return `translate(${p.x},${p.y})`;
    };
  };
}

transition();
```
