/**
 * Build Script - Combines modular sections into a single HTML file
 */
const fs = require('fs');
const path = require('path');

class ModularBuilder {
    constructor() {
        this.sectionsDir = './sections';
        this.componentsDir = './components';
        this.outputDir = './dist';
    }

    /**
     * Read a file and return its content
     */
    readFile(filePath) {
        try {
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error.message);
            return '';
        }
    }

    /**
     * Build the complete HTML file
     */
    build() {
        console.log('Building modular HTML...');
        
        // Create output directory if it doesn't exist
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }

        // Read the base template
        const baseTemplate = this.readFile('./index-modular.html');
        
        // Load all sections
        const sections = [
            'hero', 'shorts', 'differentiators', 
            'events', 'reviews', 'youtube', 'features'
        ];

        let builtHtml = baseTemplate;

        // Replace section containers with actual content
        sections.forEach(sectionName => {
            const sectionContent = this.readFile(`${this.sectionsDir}/${sectionName}.html`);
            const containerId = `${sectionName}-container`;
            const containerRegex = new RegExp(`<div id="${containerId}"><\/div>`, 'g');
            builtHtml = builtHtml.replace(containerRegex, sectionContent);
        });

        // Load components
        const headerContent = this.readFile(`${this.componentsDir}/header.html`);
        const footerContent = this.readFile(`${this.componentsDir}/footer.html`);
        const quickRailContent = this.readFile(`${this.componentsDir}/quick-rail.html`);
        const consultBarContent = this.readFile(`${this.componentsDir}/consult-bar.html`);

        // Replace component containers
        builtHtml = builtHtml.replace('<div id="header-container"></div>', headerContent);
        builtHtml = builtHtml.replace('<div id="footer-container"></div>', footerContent);
        builtHtml = builtHtml.replace('<div id="quick-rail-container"></div>', quickRailContent);
        builtHtml = builtHtml.replace('<div id="consult-bar-container"></div>', consultBarContent);

        // Remove the section loader script since we're building static HTML
        builtHtml = builtHtml.replace('<script src="/scripts/section-loader.js" defer></script>', '');

        // Write the built file
        fs.writeFileSync(`${this.outputDir}/index.html`, builtHtml);
        console.log('Build completed! Output: dist/index.html');
    }

    /**
     * Watch for changes and rebuild
     */
    watch() {
        console.log('Watching for changes...');
        
        const watchPaths = [
            this.sectionsDir,
            this.componentsDir,
            './index-modular.html'
        ];

        watchPaths.forEach(watchPath => {
            if (fs.existsSync(watchPath)) {
                fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
                    if (filename && (filename.endsWith('.html') || filename.endsWith('.js'))) {
                        console.log(`File ${filename} changed, rebuilding...`);
                        this.build();
                    }
                });
            }
        });
    }
}

// Run the builder
const builder = new ModularBuilder();

if (process.argv.includes('--watch')) {
    builder.build();
    builder.watch();
} else {
    builder.build();
}
