# HTML

```html
<div class="scene">
  <div class="box"></div>
</div>
```

# CSS

```css
.scene {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.box {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #11d45d, #5811ff);
  border-radius: 12px;
}
```

# JavaScript

```javascript
gsap.to(".box", {
  x: 200,
  rotation: 360,
  duration: 1.5,
  ease: "power2.out",
  repeat: -1,
  yoyo: true
});
```
