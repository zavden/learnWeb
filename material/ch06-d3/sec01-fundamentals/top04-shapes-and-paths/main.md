# Shapes & Paths

D3 provides generators that convert data into SVG path strings.

## Line Generator

```javascript
const line = d3.line()
  .x((d, i) => xScale(i))
  .y(d => yScale(d))
  .curve(d3.curveCatmullRom);

svg.append("path")
  .datum(data)
  .attr("d", line)
  .attr("fill", "none")
  .attr("stroke", "#58a6ff")
  .attr("stroke-width", 2);
```

## Arc Generator (for pie/donut charts)

```javascript
const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(100);

const pie = d3.pie();

svg.selectAll("path")
  .data(pie(data))
  .join("path")
    .attr("d", arc)
    .attr("fill", (d, i) => d3.schemeCategory10[i]);
```

## Area Generator

```javascript
const area = d3.area()
  .x((d, i) => xScale(i))
  .y0(height)
  .y1(d => yScale(d));
```

## Common Curves

| Curve | Effect |
|-------|--------|
| `d3.curveLinear` | Straight segments |
| `d3.curveCatmullRom` | Smooth# Shapes & Paths

D3 provi | Staircase |
| `d3.curveBasis` | B-spline |
