document.addEventListener('DOMContentLoaded', function () {
	// Header scroll behavior
	const header = document.querySelector('.site-header');
	let lastScrollY = window.scrollY;
	
	function updateHeader() {
		if (!header) return;
		
		const currentScrollY = window.scrollY;
		
		// Prevent negative scroll values
		if (currentScrollY >= 0) {
			if (currentScrollY > 10) {
				header.classList.add('scrolled');
			} else {
				header.classList.remove('scrolled');
			}
			
			lastScrollY = currentScrollY;
		}
	}
	
	window.addEventListener('scroll', updateHeader, { passive: true });
	updateHeader(); // Initial call
	
	// Simple nav toggle - BASIC VERSION
	const toggle = document.querySelector('.nav__toggle');
	const menu = document.getElementById('nav-menu');
	
	console.log('🔍 Debug Info:');
	console.log('Toggle button found:', !!toggle);
	console.log('Menu found:', !!menu);
	console.log('Window width:', window.innerWidth);
	
	if (toggle && menu) {
		console.log('✅ Setting up click handler');
		
		toggle.addEventListener('click', function(event) {
			console.log('🎯 HAMBURGER CLICKED!');
			event.preventDefault();
			
			// Simple toggle
			if (menu.classList.contains('is-open')) {
				console.log('📱 Closing menu');
				menu.classList.remove('is-open');
				toggle.classList.remove('is-active');
				document.body.style.overflow = '';
			} else {
				console.log('📱 Opening menu');
				menu.classList.add('is-open');
				toggle.classList.add('is-active');
				document.body.style.overflow = 'hidden';
			}
			
			console.log('Menu classes after toggle:', menu.className);
		});
		
		console.log('✅ Click handler attached');
	} else {
		console.log('❌ Failed to find toggle or menu elements');
	}

	// Shorts navigation
	const shortsContainer = document.querySelector('.shorts-container');
	if (shortsContainer) {
		console.log('Shorts container found');
		const shortsGrid = shortsContainer.querySelector('.shorts-grid');
		const prevBtn = shortsContainer.querySelector('.shorts-nav--prev');
		const nextBtn = shortsContainer.querySelector('.shorts-nav--next');
		
		console.log('Prev button:', prevBtn);
		console.log('Next button:', nextBtn);
		
		const cards = Array.from(shortsGrid.children);
		console.log('Number of cards:', cards.length);
		
		const cardWidth = 250 + 16; // card width (250px) + margin-right (16px)
		let currentIndex = 0;
		const visibleCards = Math.floor(shortsGrid.clientWidth / cardWidth);
		console.log('Visible cards:', visibleCards);

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
				// Disable transition for the wrap-around
				shortsGrid.style.transition = 'none';
				setTimeout(() => {
					updateShortsPosition(true);
				}, 10);
			} else {
				updateShortsPosition();
			}
		}

		// Navigate to the previous slide
		function prevSlide() {
			console.log('Previous slide clicked');
			currentIndex--;
			// If we've gone before the start, loop to the end
			if (currentIndex < 0) {
				currentIndex = cards.length - visibleCards;
				// Disable transition for the wrap-around
				shortsGrid.style.transition = 'none';
				setTimeout(() => {
					updateShortsPosition(true);
				}, 10);
			} else {
				updateShortsPosition();
			}
		}

		// Add event listeners for button navigation
		if (prevBtn && nextBtn) {
			nextBtn.addEventListener('click', nextSlide);
			prevBtn.addEventListener('click', prevSlide);
		}

		// Initialize position
		updateShortsPosition(false);

		// Handle window resize
		window.addEventListener('resize', () => {
			// Recalculate visible cards
			const newVisibleCards = Math.floor(shortsGrid.clientWidth / cardWidth);
			if (newVisibleCards !== visibleCards && newVisibleCards > 0) {
				// Adjust the current index if needed
				if (currentIndex > cards.length - newVisibleCards) {
					currentIndex = Math.max(0, cards.length - newVisibleCards);
				}
				updateShortsPosition(false);
			}
		});

		// Touch events for mobile sliding
		let touchStartX = 0;
		let touchEndX = 0;
		let isTouching = false;

		// Check if we're on a mobile device
		const isMobile = window.matchMedia('(max-width: 768px)').matches;

		if (isMobile) {
			// On mobile, we use native scrolling with snap points
			console.log('Mobile device detected, using native scrolling');
		} else {
			// On desktop, we use our custom navigation
			console.log('Desktop device detected, using custom navigation');
			
			// Prevent default scrolling behavior on the shorts grid
			shortsGrid.addEventListener('wheel', (e) => {
				e.preventDefault();
				
				// Scroll horizontally based on wheel direction
				if (e.deltaY > 0) {
					nextSlide();
				} else {
					prevSlide();
				}
			}, { passive: false });
		}
	}

	// Carousel
	const carousel = document.querySelector('[data-carousel]');
	if (!carousel) return;
	const track = carousel.querySelector('[data-carousel-track]');
	const slides = Array.from(track.children);
	const prev = carousel.querySelector('[data-carousel-prev]');
	const next = carousel.querySelector('[data-carousel-next]');
	const dotsEl = carousel.querySelector('[data-carousel-dots]');

	let index = slides.findIndex(s => s.classList.contains('is-active'));
	if (index < 0) index = 0;
	let timerId = null;
	const slideInterval = 5000; // 5 seconds per slide

	function renderDots() {
		dotsEl.innerHTML = '';
		slides.forEach((_, i) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.setAttribute('aria-label', `슬라이드 ${i + 1}`);
			if (i === index) {
				b.setAttribute('aria-current', 'true');
				// Reset animation by removing and re-adding the element
				setTimeout(() => {
					const currentDot = dotsEl.querySelector('[aria-current="true"]');
					if (currentDot) {
						const parent = currentDot.parentNode;
						const clone = currentDot.cloneNode(true);
						parent.replaceChild(clone, currentDot);
					}
				}, 10);
			}
			b.addEventListener('click', () => go(i, false));
			dotsEl.appendChild(b);
		});
	}

	function go(newIndex, fromAuto = false) {
		if (newIndex === index) return;
		slides[index]?.classList.remove('is-active');
		index = (newIndex + slides.length) % slides.length;
		slides[index]?.classList.add('is-active');
		renderDots();
		if (!fromAuto) restartAuto();
	}

	function nextSlide(fromAuto = false) { go(index + 1, fromAuto); }
	function prevSlide() { go(index - 1); }

	function startAuto() {
		stopAuto();
		timerId = setInterval(() => nextSlide(true), slideInterval);
	}
	function stopAuto() { if (timerId) clearInterval(timerId); }
	function restartAuto() { stopAuto(); startAuto(); }

	// Make sure we have the carousel control buttons before adding event listeners
	if (prev) prev.addEventListener('click', prevSlide);
	if (next) next.addEventListener('click', () => nextSlide(false));
	carousel.addEventListener('mouseenter', stopAuto);
	carousel.addEventListener('mouseleave', startAuto);

	renderDots();
	startAuto();

	// Header shadow on scroll and sticky state
	function updateHeaderState() {
		if (!header) return;
		const scrolled = window.scrollY > 20;
		
		// Update header class with throttling for better performance
		if (scrolled && !header.classList.contains('scrolled')) {
			header.classList.add('scrolled');
			document.body.classList.add('header-sticky');
		} else if (!scrolled && header.classList.contains('scrolled')) {
			header.classList.remove('scrolled');
			document.body.classList.remove('header-sticky');
		}
	}
	
	// Initialize header state
	updateHeaderState();
	
	// Use requestAnimationFrame for smoother scrolling performance
	let ticking = false;
	window.addEventListener('scroll', function() {
		if (!ticking) {
			window.requestAnimationFrame(function() {
				updateHeaderState();
				ticking = false;
			});
			ticking = true;
		}
	}, { passive: true });

	// Quick rail collapse/expand
	const rail = document.querySelector('.quick-rail');
	const trigger = document.querySelector('.quick-rail__trigger');
	const toggleBtn = document.querySelector('.quick-rail__toggle');
	function collapseRail() {
		if (!rail) return;
		rail.classList.add('is-collapsed');
		rail.setAttribute('aria-expanded', 'false');
	}
	function expandRail() {
		if (!rail) return;
		rail.classList.remove('is-collapsed');
		rail.setAttribute('aria-expanded', 'true');
	}
	toggleBtn?.addEventListener('click', collapseRail);
	trigger?.addEventListener('click', expandRail);

	// Initialize Supabase-powered features
	initializeSupabaseFeatures();

	// Enhanced Consult CTA with Supabase integration
	const cta = document.querySelector('.consult-cta');
	cta?.addEventListener('click', () => {
		// Open contact form instead of basic alert
		if (window.contactFormManager) {
			window.contactFormManager.openForm();
		} else {
			// Fallback for when Supabase modules aren't loaded
			const nameInput = document.getElementById('c-name');
			const phoneInput = document.getElementById('c-phone');
			const name = nameInput && 'value' in nameInput ? String(nameInput.value).trim() : '';
			const phone = phoneInput && 'value' in phoneInput ? String(phoneInput.value).trim() : '';
			if (!name || !phone) {
				alert('이름과 전화번호를 입력해주세요.');
				return;
			}
			alert('상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.');
		}
	});
});

// Initialize Supabase-powered features
async function initializeSupabaseFeatures() {
	try {
		// Dynamically import Supabase modules
		const { default: contactFormManager } = await import('./contact-form.js');
		const { default: appointmentBookingManager } = await import('./appointment-booking.js');
		const { default: authManager } = await import('./auth.js');
		const { default: eventBannerManager } = await import('./event-banners.js');
		
		// Make managers globally available
		window.contactFormManager = contactFormManager;
		window.appointmentBookingManager = appointmentBookingManager;
		window.authManager = authManager;
		window.eventBannerManager = eventBannerManager;
		
		console.log('Supabase features initialized successfully');
		
		// Initialize event banners on page load
		eventBannerManager.checkAndDisplayBanners();
		
	} catch (error) {
		console.warn('Some Supabase features could not be loaded:', error);
		// Continue without Supabase features - site will still work
	}
} 