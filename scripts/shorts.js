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
    
    const cardWidth = 240 + 8; // card width (240px) + margin-right (8px)
    let currentIndex = 0;
    const visibleCards = Math.floor(shortsGrid.clientWidth / cardWidth);
    let autoScrollInterval = null;

    // Create infinite loop by duplicating all cards
    function createInfiniteLoop() {
        // Clone all cards and append to the end for seamless infinite loop
        const totalCards = cards.length;
        for (let i = 0; i < totalCards; i++) {
            const clone = cards[i].cloneNode(true);
            shortsGrid.appendChild(clone);
        }
    }

    // Function to update the shorts grid position
    function updateShortsPosition(smooth = true) {
        if (!cards.length) return;
        
        // Calculate position
        let translateX = -currentIndex * cardWidth;
        console.log('Updating position to:', translateX, 'Current index:', currentIndex);
        
        // Apply transform with or without transition
        shortsGrid.style.transition = smooth ? 'transform 0.3s ease' : 'none';
        shortsGrid.style.transform = `translate3d(${translateX}px, 0, 0)`;
    }

    // Navigate to the next slide
    function nextSlide() {
        console.log('Next slide clicked');
        currentIndex++;
        
        // If we've reached the end of original cards, reset to beginning seamlessly
        if (currentIndex >= cards.length) {
            currentIndex = 0;
            // Reset position without animation
            updateShortsPosition(false);
            // Then animate to the correct position
            setTimeout(() => {
                updateShortsPosition(true);
            }, 50);
        } else {
            updateShortsPosition();
        }
    }

    // Navigate to the previous slide
    function prevSlide() {
        console.log('Previous slide clicked');
        currentIndex--;
        
        // If we've gone before the beginning, loop to the end seamlessly
        if (currentIndex < 0) {
            currentIndex = cards.length - 1;
            // Reset position without animation
            updateShortsPosition(false);
            // Then animate to the correct position
            setTimeout(() => {
                updateShortsPosition(true);
            }, 50);
        } else {
            updateShortsPosition();
        }
    }

    // Start auto-scroll
    function startAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
        }
        autoScrollInterval = setInterval(() => {
            nextSlide();
        }, 5000); // 5 seconds
    }

    // Stop auto-scroll
    function stopAutoScroll() {
        if (autoScrollInterval) {
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }

    // Disable user interaction - only auto-scroll allowed
    // Touch/swipe disabled
    // Manual navigation disabled

    // Create infinite loop
    createInfiniteLoop();
    
    // Initialize position
    updateShortsPosition(false);
    
    // Start auto-scroll
    startAutoScroll();
    
    console.log('Shorts section initialized - auto-scroll only with infinite loop');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeShorts);
} else {
    initializeShorts();
}

// Export for use in other modules
window.initializeShorts = initializeShorts;
