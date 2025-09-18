/**
 * Event Slider functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const eventSlider = document.querySelector('.event-slider');
    if (!eventSlider) return;
    
    const track = eventSlider.querySelector('.event-slider__track');
    const prevBtn = document.querySelector('.event-slider__control--prev');
    const nextBtn = document.querySelector('.event-slider__control--next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    const cards = Array.from(track.querySelectorAll('.event-card'));
    if (!cards.length) return;
    
    // Get the container width and calculate how much to scroll for one card
    const visibleCards = 4; // We're showing 4 cards at a time
    let containerWidth = track.clientWidth;
    let cardWidth = containerWidth / visibleCards; // Width of a single card
    
    // Function to recalculate card width on resize
    function updateCardWidth() {
        containerWidth = track.clientWidth;
        cardWidth = containerWidth / visibleCards;
        console.log('Updated card width:', cardWidth);
    }
    
    // Auto-slide interval (5 seconds)
    const autoSlideInterval = 5000;
    let autoSlideTimer = null;
    
    // Scroll by one card width
    function scrollPrev() {
        // Check if we're at the beginning, if so, loop to the end
        if (track.scrollLeft <= 10) {
            track.scrollTo({
                left: track.scrollWidth - track.clientWidth,
                behavior: 'smooth'
            });
        } else {
            // Scroll by exactly one card width
            track.scrollBy({
                left: -cardWidth,
                behavior: 'smooth'
            });
        }
        
        // Reset auto-slide timer
        resetAutoSlideTimer();
    }
    
    function scrollNext() {
        // Check if we're at the end, if so, loop back to the beginning
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 10) {
            track.scrollTo({
                left: 0,
                behavior: 'smooth'
            });
        } else {
            // Scroll by exactly one card width
            track.scrollBy({
                left: cardWidth,
                behavior: 'smooth'
            });
        }
        
        // Reset auto-slide timer
        resetAutoSlideTimer();
        
        // Log for debugging
        console.log('Scrolling next by', cardWidth, 'pixels');
    }
    
    // Start auto-slide
    function startAutoSlide() {
        stopAutoSlide();
        // Ensure we're using the most up-to-date card width
        updateCardWidth();
        autoSlideTimer = setInterval(scrollNext, autoSlideInterval);
        console.log('Auto-slide started with interval:', autoSlideInterval, 'ms');
    }
    
    // Stop auto-slide
    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }
    
    // Reset auto-slide timer
    function resetAutoSlideTimer() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    // Add event listeners
    prevBtn.addEventListener('click', scrollPrev);
    nextBtn.addEventListener('click', scrollNext);
    
    // Pause auto-slide on hover
    eventSlider.addEventListener('mouseenter', stopAutoSlide);
    eventSlider.addEventListener('mouseleave', startAutoSlide);
    
    // Handle keyboard navigation
    eventSlider.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            scrollPrev();
        } else if (e.key === 'ArrowRight') {
            scrollNext();
        }
    });
    
    // Optional: Hide controls when at the beginning or end
    function updateControlVisibility() {
        const isAtStart = track.scrollLeft <= 10;
        const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 10;
        
        prevBtn.style.opacity = isAtStart ? '0.3' : '1';
        nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
    }
    
    track.addEventListener('scroll', updateControlVisibility);
    window.addEventListener('resize', function() {
        updateCardWidth();
        updateControlVisibility();
    });
    
    // Initial setup
    updateCardWidth();
    updateControlVisibility();
    
    // Start auto-slide
    startAutoSlide();
});
