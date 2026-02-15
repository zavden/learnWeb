# Scales & Axes

**Scales** map data values to visual values (pixels, colors). **Axes** render the scale as a visual guide.

## Linear Scale

```javascript
const xScale = d3.scaleLinear()
  .domain([0, 100])     // Data range
  .range([0, 400]);     // Pixel range

xScale(50);  // → 200
```

## Common Scales

| Scale | Use Case |
|-------|----------|
| `scaleLinear()` | Continuous numeric data |
| `scaleBand()` | Categorical data (bar charts) |
| `scaleOrdinal()` | Categorical → colors |
| `scaleTime()` | Date/time data |
| `scaleLog()` | Logarithmic data |

## Band Scale (for bar charts)

```javascript
const xScale = d3.scaleBand()
  .domain(["A", "B", "C", "D"])
  .range([0, 400])
  .padding(0.2);
```

## Axes

```javascript
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .call(xAxis);

svg.append("g").call(yAxis);
```
