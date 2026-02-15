# Tweens

A **tween** is the core building block of GSAP. It animates a single property change over time.

## Key Methods

- `gsap.to(target, vars)` — Animate TO the given values
- `gsap.from(target, vars)` — Animate FROM the given values
- `gsap.fromTo(target, fromVars, toVars)` — Animate from one state to another
- `gsap.set(target, vars)` — Immediately set properties (no animation)

## Common Properties

| Property | Description |
|----------|-------------|
| `duration` | Length of animation in seconds |
| `delay` | Wait before starting |
| `x`, `y` | Transform translateX/Y |
| `rotation` | Rotation in degrees |
| `scale` | Scale transform |
| `opacity` | Opacity (0–1) |
| `ease` | Easing function |

## Example

```javascript
gsap.to(".box", {
  x: 200,
  rotation: 360,
  duration: 1,
  ease: "power2.out"
});
```
