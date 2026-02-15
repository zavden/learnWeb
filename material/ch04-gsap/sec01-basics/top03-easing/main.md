# Easing

Easing controls the rate of change of an animation. GSAP provides a rich set of built-in ease functions.

## Common Eases

| Ease | Description |
|------|-------------|
| `"none"` | Linear, constant speed |
| `"power1.out"` | Gentle deceleration |
| `"power2.inOut"` | Smooth acceleration/deceleration |
| `"back.out(1.7)"` | Overshoots then settles |
| `"elastic.out(1, 0.3)"` | Springy bounce |
| `"bounce.out"` | Ball bounce effect |

## Ease Directions

- `.in` — Starts slow, ends fast
- `.out` — Starts fast, ends slow (most natural)
- `.inOut` — Smooth start and end

## Custom Ease

```javascript
gsap.to(".box", {
  x: 300,
  ease: "elastic.out(1, 0.5)",
  duration: 2
});
```

> **Tip**: Visit [GSAP Ease Visualizer](https://gsap.com/docs/v3/Eases/) to preview all eases interactively.
