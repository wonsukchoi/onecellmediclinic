document.addEventListener('DOMContentLoaded', function () {
	// Nav toggle
	const toggle = document.querySelector('.nav__toggle');
	const menu = document.getElementById('nav-menu');
	if (toggle && menu) {
		toggle.addEventListener('click', () => {
			const isOpen = menu.classList.toggle('is-open');
			toggle.setAttribute('aria-expanded', String(isOpen));
		});
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
		
		const cardWidth = 400 + 12; // card width (400px) + margin-right (12px)
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

		// Add event listeners
		nextBtn.addEventListener('click', nextSlide);
		prevBtn.addEventListener('click', prevSlide);

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

	prev?.addEventListener('click', prevSlide);
	next?.addEventListener('click', () => nextSlide(false));
	carousel.addEventListener('mouseenter', stopAuto);
	carousel.addEventListener('mouseleave', startAuto);

	renderDots();
	startAuto();

	// Header transparency over hero
	const header = document.querySelector('.site-header');
	function updateHeaderTransparency() {
		if (!header) return;
		const atTop = window.scrollY < 20;
		if (atTop) header.classList.add('is-transparent');
		else header.classList.remove('is-transparent');
	}
	updateHeaderTransparency();
	window.addEventListener('scroll', updateHeaderTransparency, { passive: true });

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

	// Consult CTA (demo only)
	const cta = document.querySelector('.consult-cta');
	cta?.addEventListener('click', () => {
		const nameInput = document.getElementById('c-name');
		const phoneInput = document.getElementById('c-phone');
		const name = nameInput && 'value' in nameInput ? String(nameInput.value).trim() : '';
		const phone = phoneInput && 'value' in phoneInput ? String(phoneInput.value).trim() : '';
		if (!name || !phone) {
			alert('이름과 전화번호를 입력해주세요.');
			return;
		}
		alert('상담 신청이 접수되었습니다. 빠르게 연락드리겠습니다.');
	});
}); 