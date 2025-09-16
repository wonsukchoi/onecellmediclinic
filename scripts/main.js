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

	function renderDots() {
		dotsEl.innerHTML = '';
		slides.forEach((_, i) => {
			const b = document.createElement('button');
			b.type = 'button';
			b.setAttribute('aria-label', `슬라이드 ${i + 1}`);
			if (i === index) b.setAttribute('aria-current', 'true');
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
		timerId = setInterval(() => nextSlide(true), 5000);
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