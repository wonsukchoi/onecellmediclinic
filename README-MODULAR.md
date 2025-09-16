# OneCell Medi Clinic - Modular Structure

This project has been refactored into a modular structure for better maintainability and organization.

## Project Structure

```
onecellmediclinic/
├── sections/                 # Individual page sections
│   ├── hero.html            # Hero carousel section
│   ├── shorts.html          # Shorts video section
│   ├── differentiators.html # Key features pills
│   ├── events.html          # Events/promotions grid
│   ├── reviews.html         # Customer reviews
│   ├── youtube.html         # YouTube videos
│   └── features.html        # Feature cards
├── components/              # Reusable components
│   ├── header.html          # Site header
│   ├── footer.html          # Site footer
│   ├── quick-rail.html      # Quick action rail
│   └── consult-bar.html     # Consultation form
├── scripts/
│   ├── main.js              # Original JavaScript
│   ├── section-loader.js    # Dynamic section loader
│   └── build.js             # Build script
├── styles/
│   └── main.css             # All styles
├── assets/                  # Images and icons
├── index.html               # Original monolithic file
├── index-modular.html       # Modular template
└── package.json             # Build configuration
```

## Usage

### Development Mode (Dynamic Loading)
1. Use `index-modular.html` as your main file
2. Sections are loaded dynamically via JavaScript
3. Perfect for development and testing individual sections

```bash
# Start development server
npm run serve
# or
python3 -m http.server 8000
```

### Production Mode (Static Build)
1. Run the build script to combine all sections into a single HTML file
2. The output will be in the `dist/` directory

```bash
# Build once
npm run build

# Build and watch for changes
npm run build:watch
```

## Benefits of Modular Structure

1. **Easier Maintenance**: Each section is in its own file
2. **Better Organization**: Clear separation of concerns
3. **Reusability**: Components can be reused across pages
4. **Team Collaboration**: Multiple developers can work on different sections
5. **Performance**: Can load sections on demand
6. **Testing**: Individual sections can be tested in isolation

## Adding New Sections

1. Create a new HTML file in the `sections/` directory
2. Add the section to the `loadHomePage()` method in `section-loader.js`
3. Add a container div in `index-modular.html`
4. Update the build script if using static builds

## Modifying Sections

- Edit the individual HTML files in `sections/` or `components/`
- Changes will be reflected immediately in development mode
- Run `npm run build` to update the static build

## File Naming Convention

- Sections: `kebab-case.html` (e.g., `hero.html`, `youtube.html`)
- Components: `kebab-case.html` (e.g., `header.html`, `footer.html`)
- Containers: `{section-name}-container` (e.g., `hero-container`)

## Browser Support

The modular structure uses modern JavaScript features:
- ES6 Modules
- Fetch API
- Async/Await

For older browser support, consider using a build tool like Webpack or Vite.
