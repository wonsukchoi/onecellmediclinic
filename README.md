# OneCell Medi Clinic - Landing Site Foundation

A lightweight, static foundation for a plastic surgery/dermatology clinic site inspired by modern Korean clinic layouts.

## Structure
- `index.html`: Landing page with hero carousel, shorts grid, events, reviews, videos, features, and footer
- `styles/main.css`: Responsive styles
- `scripts/main.js`: Nav toggle + autoplay carousel

## Run locally
Open `index.html` directly or serve with a simple HTTP server to avoid CORS issues.

### macOS (Python)
```bash
cd /Users/wonsukchoi/Desktop/onecellmediclinic
python3 -m http.server 5173
```
Visit `http://localhost:5173` in your browser.

## Customize
- Replace Unsplash/Youtube thumbnails with your assets
- Update clinic copy and contact info in `index.html`
- Adjust colors in `:root` within `styles/main.css`

## Notes
This is a static foundation; integrate your framework/CMS later if needed. 