/**
 * Hero Carousel functionality with labels and timeline
 */
function initializeCarousel() {
    const carousel = document.querySelector('[data-carousel]');
    if (!carousel) {
        console.log('Carousel not found');
        return;
    }

    const track = carousel.querySelector('[data-carousel-track]');
    const slides = Array.from(track.children);
    const prev = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const dotsEl = carousel.querySelector('[data-carousel-dots]');

    if (!track || !slides.length) {
        console.log('Carousel track or slides not found');
        return;
    }

    console.log('Initializing carousel with', slides.length, 'slides');

    let index = slides.findIndex(s => s.classList.contains('is-active'));
    if (index < 0) index = 0;
    let timerId = null;
    const slideInterval = 5000; // 5 seconds per slide

    // Slide data with labels
    const slideData = [
        { label: "브라운 코성형", description: "예쁨 급상승, 맞춤형 크라이믹" },
        { label: "원셀 피부과", description: "VIP 프리미엄 케어 프로그램" },
        { label: "3D-CT 시스템", description: "안전이 만든 아름다움" },
        { label: "자연스러운 라인", description: "시간이 지나도 어색하지 않게" },
        { label: "수술 후 케어", description: "부기와 멍을 줄이는 관리" }
    ];

    function renderDots() {
        if (!dotsEl) return;
        
        dotsEl.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'carousel__dot';
            dot.setAttribute('aria-label', `슬라이드 ${i + 1}: ${slideData[i]?.label || ''}`);
            
            if (i === index) {
                dot.setAttribute('aria-current', 'true');
                dot.classList.add('is-active');
            }
            
            dot.addEventListener('click', () => go(i, false));
            dotsEl.appendChild(dot);
        });
    }

    function go(newIndex, fromAuto = false) {
        if (newIndex === index) return;
        
        // Remove active class from current slide
        slides[index]?.classList.remove('is-active');
        
        // Update index with wrapping
        index = (newIndex + slides.length) % slides.length;
        
        // Add active class to new slide
        slides[index]?.classList.add('is-active');
        
        // Update dots and label
        renderDots();
        
        // Restart auto-advance if not from auto
        if (!fromAuto) restartAuto();
    }

    function nextSlide(fromAuto = false) { 
        go(index + 1, fromAuto); 
    }
    
    function prevSlide() { 
        go(index - 1); 
    }

    function startAuto() {
        stopAuto();
        timerId = setInterval(() => nextSlide(true), slideInterval);
    }
    
    function stopAuto() { 
        if (timerId) {
            clearInterval(timerId);
            timerId = null;
        }
    }
    
    function restartAuto() { 
        stopAuto(); 
        startAuto(); 
    }

    // Add event listeners
    if (prev) {
        prev.addEventListener('click', (e) => {
            e.preventDefault();
            prevSlide();
        });
        console.log('Previous button event listener added');
    }
    
    if (next) {
        next.addEventListener('click', (e) => {
            e.preventDefault();
            nextSlide(false);
        });
        console.log('Next button event listener added');
    }

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    // Touch/swipe support
    let startX = 0;
    let startY = 0;
    let isDragging = false;

    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isDragging = true;
        stopAuto();
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const diffX = startX - endX;
        const diffY = startY - endY;
        
        // Only trigger if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                nextSlide(false);
            } else {
                prevSlide();
            }
        }
        
        startAuto();
    });

    // Initialize
    renderDots();
    startAuto();

    console.log('Carousel initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCarousel);
} else {
    initializeCarousel();
}

// Export for use in other modules
window.initializeCarousel = initializeCarousel;
