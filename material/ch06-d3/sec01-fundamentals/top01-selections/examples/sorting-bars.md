# HTML

```html
<div id="controls">
  <button id="update">Randomize & Sort</button>
</div>
<svg id="chart"></svg>
```

# CSS

```css
body {
  background: #1a1a2e;
  font-family: sans-serif;
  color: white;
  padding: 20px;
}
#controls { margin-bottom: 20px; }
button {
  padding: 8px 16px;
  background: #58a6ff;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}
button:hover { background: #79c0ff; }
```

# JavaScript

```javascript
const width = 600;
const height = 400;
const margin = {top: 20, right: 20, bottom: 30, left: 40};

const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height);

const x = d3.scaleBand()
  .rangeRound([margin.left, width - margin.right])
  .padding(0.1);

const y = d3.scaleLinear()
  .range([height - margin.bottom, margin.top]);

const g = svg.append("g");
const xAxisGroup = svg.append("g")
  .attr("transform", `translate(0,${height - margin.bottom})`);

function update(data) {
  // Update domains
  x.domain(data.map(d => d.name));
  y.domain([0, d3.max(data, d => d.value)]).nice();

  // JOIN
  const bars = g.selectAll("rect")
    .data(data, d => d.name); // Key function is important for animation!

  // EXIT
  bars.exit()
    .transition().duration(750)
    .attr("y", height - margin.bottom)
    .attr("height", 0)
    .remove();

  // UPDATE
  bars.transition().duration(750)
    .attr("x", d => x(d.name))
    .attr("y", d => y(d.value))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.value));

  // ENTER
  bars.enter().append("rect")
    .attr("fill", "#58a6ff")
    .attr("x", d => x(d.name))
    .attr("y", height - margin.bottom) // Start from bottom
    .attr("height", 0)
    .attr("width", x.bandwidth())
    .transition().duration(750)
    .attr("y", d => y(d.value))
    .attr("height", d => y(0) - y(d.value));

  // Update Axis
  xAxisGroup.transition().duration(750)
    .call(d3.axisBottom(x));
}

// Generate random data
function getRandomData() {
  const count = 5 + Math.floor(Math.random() * 10);
  return d3.range(count).map(i => ({
    name: String.fromCharCode(65 + i), // A, B, C...
    value: 10 + Math.floor(Math.random() * 90)
  })).sort((a, b) => b.value - a.value); // Initial sort
}

// Initial render
update(getRandomData());

// Button handler
d3.select("#update").on("click", () => {
  const data = getRandomData();
  update(data);
});
```
