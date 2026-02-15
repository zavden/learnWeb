# ScrollTrigger

**ScrollTrigger** is a GSAP plugin that creates scroll-driven animations. It links any GSAP animation to scroll progress.

## Basic Usage

```javascript
gsap.registerPlugin(ScrollTrigger);

gsap.to(".box", {
  x: 500,
  scrollTrigger: {
    trigger: ".box",
    start: "top center",
    end: "bottom center",
    scrub: true
  }
});
```

## Key Properties

| Property | Description |
|----------|-------------|
| `trigger` | Element that triggers the animation |
| `start` | When animation begins (e.g. `"top center"`) |
| `end` | When animation ends |
| `scrub` | Link animation to scroll position |
| `pin` | Pin the trigger element during animation |
| `markers` | Show debug markers |
| `toggleActions` | Control play/pause on enter/leave |

## toggleActions

Format: `"onEnter onLeave onEnterBack onLeaveBack"`

```javascript
scrollTrigger: {
  toggleActions: "play pause reverse reset"
}
```
