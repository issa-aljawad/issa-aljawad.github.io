# Main Tear Loader Process

This folder holds the assets for the main `index.html` tear loader. The same process can be reused for other section loaders.

## Current Assets

- `mask.png`
  - Full `1920x1080` mask canvas.
  - White area is the visible tear opening.
  - Black area is hidden.
  - Do not crop this file.

- `tear-frame.webp`
  - Full `1920x1080` frame canvas.
  - White ripped border.
  - Black fill is handled visually with `mix-blend-mode: screen`.
  - Must align with `mask.png`.

- `inner-background.png`
  - Full `1920x1080` background shown inside the tear before the final reveal.
  - Masked by `mask.png`.

- `Character.webp`
  - Full `1920x1080` character canvas.
  - Masked by `mask.png`.

- `eyes-closed.webp`
  - Full `1920x1080` closed-eye version.
  - Same canvas/alignment as `Character.webp`.

- `upper-right-slach.png`
  - Upper slash accent.
  - Reveals left to right.

- `lower-right-slash.png`
  - Lower slash accent.
  - Reveals right to left.

## Export Rules

- Export every visual layer at `1920x1080`.
- Keep the same canvas origin for all layers.
- Do not crop individual layers.
- Use transparency where needed.
- Keep `mask.png` aligned exactly with `tear-frame.webp`.

## Animation Structure

1. Loader starts as a full viewport black screen.
2. `tear-frame.webp` reveals left to right.
3. `inner-background.png` reveals with the frame, masked by `mask.png`.
4. Character slides into the masked tear opening.
5. Upper and lower slash accents reveal.
6. Closed-eye layer flashes for the blink.
7. Character, slashes, and inner background fade out.
8. The viewport black fill stays fullscreen, but it uses an inverted `mask.png` cutout.
9. JavaScript syncs that viewport cutout to the real `.main-tear-loader__scene` position before animation starts.
10. The frame and viewport cutout mask scale together, revealing the page behind the loader through the torn opening.

## Important Implementation Notes

- The normal content mask is inside the `1920x1080` SVG scene:
  - `mainTearBackgroundMask`
  - `mainTearFaceMask`

- The final page reveal is a separate fullscreen SVG:
  - `.main-tear-loader__viewport-cutout`
  - `.main-tear-loader__viewport-mask-image`

- The viewport cutout is synced in `JAVA/main-loader.js`:

```js
syncViewportMaskToScene(loader);
```

This measures `.main-tear-loader__scene` and writes the matching `x`, `y`, `width`, and `height` onto `.main-tear-loader__viewport-mask-image`.

- The frame and final viewport mask use the same scale keyframe:

```css
mainTearSubtleExpand
```

That is what keeps the final reveal tied to the frame.

## Timing Controls

The main timing is in `CSS/Main-Loader.css`.

- Frame reveal:
  - `.main-tear-loader__frame`

- Background reveal:
  - `.main-tear-loader__masked-background`

- Character slide:
  - `.main-tear-loader__face-image`

- Slash reveal:
  - `.main-tear-loader__slash--upper`
  - `.main-tear-loader__slash--lower`

- Blink:
  - `.main-tear-loader__face-image--closed`

- Final page reveal scale:
  - `.main-tear-loader__frame`
  - `.main-tear-loader__viewport-mask-image`

## Reusing For Another Loader

1. Create a new asset folder.
2. Export all layers at `1920x1080`.
3. Keep one `mask.png` and one matching `tear-frame` layer.
4. Duplicate the CSS/JS loader structure with new class names.
5. Keep the fullscreen viewport cutout approach for the final page reveal.
6. Keep the JS sync step so the final reveal mask starts from the real on-screen frame position.
