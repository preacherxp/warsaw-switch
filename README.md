# Warsaw switch

An interactive pixel-art Warsaw day and night switch. No build step or dependencies.

[Live demo](https://preacherxp.github.io/warsaw-switch/) · [60 fps MP4](warsaw-day-night-60fps.mp4) · [Instagram 4:5 MP4](warsaw-instagram-4x5-60fps.mp4) · [Instagram cover](warsaw-instagram-cover.jpg)

Drag to move through the hours. Tap or press Space to toggle. Use the arrow keys to step through time.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Use the switch

Copy `city-switch.js` and `warsaw.js` into your site, then include:

```html
<script src="city-switch.js"></script>
<script src="warsaw.js"></script>
<warsaw-switch style="display: block; width: min(680px, 100%);"></warsaw-switch>
```

The element exposes `checked`, `position`, and `jump(night)`. Listen for `change` events (`detail.night`) and `scrub` events (`detail.position`, `detail.hour`, `detail.dark`).

## Publishing

GitHub Pages serves the root of the `main` branch. Push changes to `main` to update the demo.

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ” by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT), as credited in the engine source.

The MP4 is a seven-second recording of the complete browser-rendered switch at 1600 × 1000 and 60 fps, including the moving glass lens. The Instagram MP4 is the same loop at 1080 × 1350 (4:5), and its cover is a still from the night hold; both keep the whole switch inside the 3:4 profile-grid crop.
