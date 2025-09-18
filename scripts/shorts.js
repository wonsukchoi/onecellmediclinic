/**
 * Shorts navigation functionality - Manual scrolling without buttons
 */
function initializeShorts() {
    const shortsContainer = document.querySelector('.shorts-container');
    if (!shortsContainer) {
        console.log('Shorts container not found');
        return;
    }

    console.log('Initializing shorts with manual scrolling...');
    
    const shortsGrid = shortsContainer.querySelector('.shorts-grid');
    
    if (!shortsGrid) {
        console.log('Shorts grid not found');
        return;
    }
    
    const cards = Array.from(shortsGrid.children);
    console.log('Number of cards:', cards.length);
    
    if (cards.length === 0) {
        console.log('No cards found in shorts grid');
        return;
    }
    
    // Add scroll snap functionality
    shortsGrid.style.scrollSnapType = 'x mandatory';
    
    // Make each card a snap point
    cards.forEach(card => {
        card.style.scrollSnapAlign = 'start';
    });
    
    // Add touch and mouse drag scrolling enhancement
    let isDown = false;
    let startX;
    let scrollLeft;

    shortsGrid.addEventListener('mousedown', (e) => {
        isDown = true;
        shortsGrid.style.cursor = 'grabbing';
        startX = e.pageX - shortsGrid.offsetLeft;
        scrollLeft = shortsGrid.scrollLeft;
        e.preventDefault();
    });

    shortsGrid.addEventListener('mouseleave', () => {
        isDown = false;
        shortsGrid.style.cursor = 'grab';
    });

    shortsGrid.addEventListener('mouseup', () => {
        isDown = false;
        shortsGrid.style.cursor = 'grab';
    });

    shortsGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - shortsGrid.offsetLeft;
        const walk = (x - startX) * 2; // Scroll speed multiplier
        shortsGrid.scrollLeft = scrollLeft - walk;
    });
    
    console.log('Shorts section initialized with manual horizontal scrolling');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShorts);
} else {
    initializeShorts();
}

// Export for use in other modules
window.initializeShorts = initializeShorts;
