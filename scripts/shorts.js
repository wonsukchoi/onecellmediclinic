/**
 * Shorts navigation functionality
 */
function initializeShorts() {
    const shortsContainer = document.querySelector('.shorts-container');
    if (!shortsContainer) {
        console.log('Shorts container not found');
        return;
    }

    console.log('Initializing shorts navigation...');
    
    const shortsGrid = shortsContainer.querySelector('.shorts-grid');
    const prevBtn = shortsContainer.querySelector('.shorts-nav--prev');
    const nextBtn = shortsContainer.querySelector('.shorts-nav--next');
    
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
    
    const cardWidth = 250 + 16; // card width (250px) + margin-right (16px)
    let currentIndex = 0;
    const visibleCards = Math.floor(shortsGrid.clientWidth / cardWidth);

    // Function to update the shorts grid position
    function updateShortsPosition(smooth = true) {
        if (!cards.length) return;
        
        // Calculate position
        let translateX = -currentIndex * cardWidth;
        console.log('Updating position to:', translateX, 'Current index:', currentIndex);
        
        // Apply transform with or without transition
        shortsGrid.style.transition = smooth ? 'transform 0.3s ease' : 'none';
        shortsGrid.style.transform = `translateX(${translateX}px)`;
    }

    // Navigate to the next slide
    function nextSlide() {
        console.log('Next slide clicked');
        currentIndex++;
        // If we've gone past the end, loop back to the beginning
        if (currentIndex > cards.length - visibleCards) {
            currentIndex = 0;
        }
        updateShortsPosition();
    }

    // Navigate to the previous slide
    function prevSlide() {
        console.log('Previous slide clicked');
        currentIndex--;
        // If we've gone before the beginning, loop to the end
        if (currentIndex < 0) {
            currentIndex = Math.max(0, cards.length - visibleCards);
        }
        updateShortsPosition();
    }

    // Add event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide();
        });
        console.log('Next button event listener added');
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
        console.log('Previous button event listener added');
    }

    // Touch/swipe support for mobile
    let startX = 0;
    let isDragging = false;

    shortsGrid.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    shortsGrid.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    shortsGrid.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    });

    // Initialize position
    updateShortsPosition(false);
    
    console.log('Shorts navigation initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShorts);
} else {
    initializeShorts();
}

// Export for use in other modules
window.initializeShorts = initializeShorts;
