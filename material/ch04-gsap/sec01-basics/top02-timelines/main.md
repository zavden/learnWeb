# Timelines

A **timeline** sequences multiple tweens. It provides precise control over when animations start, overlap, and end.

## Creating a Timeline

```javascript
const tl = gsap.timeline();
tl.to(".box1", { x: 100, duration: 0.5 })
  .to(".box2", { y: 50, duration: 0.5 })
  .to(".box3", { opacity: 0, duration: 0.3 });
```

## Position Parameter

Control when each tween starts relative to the timeline:

| Position | Meaning |
|----------|---------|
| `"+=0.5"` | 0.5s after previous ends |
| `"-=0.2"` | 0.2s before previous ends (overlap) |
| `"<"` | Same start as previous |
| `1` | At absolute time 1s |

## Timeline Controls

- `tl.play()` / `tl.pause()` / `tl.reverse()`
- `tl.restart()` / `tl.seek(time)`
- `tl.timeScale(2)` — Double speed
