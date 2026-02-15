# Pin & Snap

**Pin** locks an element in place while the scroll continues. **Snap** jumps the scroll to defined positions.

## Pinning

```javascript
ScrollTrigger.create({
  trigger: ".panel",
  pin: true,
  start: "top top",
  end: "+=500"  // Pin for 500px of scrolling
});
```

## Snapping

```javascript
ScrollTrigger.create({
  snap: {
    snapTo: 1 / 3,       // Snap to every 1/3
    duration: 0.5,
    ease: "power1.inOut"
  }
});
```

## Combining with Timelines

```javascript
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".container",
    pin: true,
    scrub: 1,
    snap: 1 / 4
  }
});

tl.to(".step1", { opacity: 1 })
  .to(".step2", { opacity: 1 })
  .to(".step3", { opacity: 1 });
```
