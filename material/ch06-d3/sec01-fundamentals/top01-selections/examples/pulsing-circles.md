# HTML

```html
<svg id="canvas"></svg>
```

# CSS

```css
body {
  background: #1a1a2e;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  margin: 0;
}
```

# JavaScript

```javascript
const width = 600;
const height = 400;

const svg = d3.select("#canvas")
  .attr("width", width)
  .attr("height", height);

// Create dataset of 20 points
const data = d3.range(20).map(i => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  r: 5 + Math.random() * 20,
  color: d3.interpolateRainbow(Math.random())
}));

const circles = svg.selectAll("circle")
  .data(data)
  .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", d => d.r)
    .attr("fill", d => d.color)
    .attr("opacity", 0.7);

// Animation function
function pulse() {
  circles.transition()
    .duration(2000)
    .ease(d3.easeSinInOut)
    .attr("r", d => d.r * 1.5)
    .attr("opacity", 0.4)
    .transition()
    .duration(2000)
    .attr("r", d => d.r)
    .attr("opacity", 0.7)
    .on("end", pulse); // Loop
}

pulse();
```
