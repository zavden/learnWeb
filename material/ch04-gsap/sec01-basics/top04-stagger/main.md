# Stagger

**Stagger** lets you offset the start time of animations across multiple targets, creating cascading and wave effects.

## Basic Stagger

```javascript
gsap.to(".box", {
  y: -50,
  stagger: 0.1,  // 0.1s between each element
  duration: 0.5
});
```

## Advanced Stagger Object

```javascript
gsap.to(".box", {
  y: -50,
  stagger: {
    amount: 1,        // Total time spread
    from: "center",   // Start from center elements
    grid: [4, 4],     // Grid layout for 2D effects
    ease: "power2.in"
  }
});
```

## `from` Options

| Value | Effect |
|-------|--------|
| `"start"` | Left to right (default) |
| `"end"` | Right to left |
| `"center"` | From center outward |
| `"edges"` | From edges inward |
| `"random"` | Random order |
| `[0.5, 0.5]` | From specific grid position |
