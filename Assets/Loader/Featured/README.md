# Featured Tear Loader Template

This folder is for the Featured Artworks section loader.

It was copied from the working Main loader process, but uses its own CSS/JS namespace:

- CSS: `CSS/Loader/Featured-loader.css`
- JS: `JAVA/Loader/Featured-loader.js`
- JS global: `window.FeaturedTearLoader`

## Expected Assets

Use the same filenames as the Main loader template unless we decide to customize the JS:

- `mask.png`
- `tear-frame.webp`
- `inner-background.png`
- `Character.webp`
- `eyes-closed.webp`
- `upper-right-slach.png`
- `lower-right-slash.png`

## Export Rules

- Export every layer at `1920x1080`.
- Do not crop individual layers.
- Keep `mask.png`, `tear-frame.webp`, and visual layers aligned on the same canvas.
- White in `mask.png` is visible.
- Black in `mask.png` is hidden.

## Reuse Notes

The Featured loader keeps the same important structure as the Main loader:

- Normal content is masked inside a `1920x1080` SVG scene.
- The final page reveal uses a fullscreen black SVG cutout.
- JavaScript syncs the fullscreen cutout to the real loader frame before the final scale.
- The frame and viewport mask share the same final scale variables.

When the Featured assets are ready, place them here and test the loader in a separate HTML file before connecting it to the `#projects` navigation flow.
