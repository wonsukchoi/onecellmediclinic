/**
 * Section Loader - Dynamically loads HTML sections into the main page
 */
class SectionLoader {
    constructor() {
        this.sections = new Map();
        this.loadedSections = new Set();
    }

    /**
     * Load a section from a file
     * @param {string} sectionName - Name of the section to load
     * @param {string} containerId - ID of the container to load the section into
     * @returns {Promise<void>}
     */
    async loadSection(sectionName, containerId) {
        try {
            const response = await fetch(`/sections/${sectionName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load section: ${sectionName}`);
            }
            
            const html = await response.text();
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = html;
                this.loadedSections.add(sectionName);
                console.log(`Section ${sectionName} loaded successfully`);
            } else {
                console.error(`Container ${containerId} not found`);
            }
        } catch (error) {
            console.error(`Error loading section ${sectionName}:`, error);
        }
    }

    /**
     * Load multiple sections
     * @param {Array} sections - Array of {name, containerId} objects
     */
    async loadSections(sections) {
        const loadPromises = sections.map(section => 
            this.loadSection(section.name, section.containerId)
        );
        
        await Promise.all(loadPromises);
    }

    /**
     * Load all sections for the home page
     */
    async loadHomePage() {
        const sections = [
            { name: 'hero', containerId: 'hero-container' },
            { name: 'shorts', containerId: 'shorts-container' },
            { name: 'differentiators', containerId: 'differentiators-container' },
            { name: 'events', containerId: 'events-container' },
            { name: 'reviews', containerId: 'reviews-container' },
            { name: 'youtube', containerId: 'youtube-container' },
            { name: 'features', containerId: 'features-container' }
        ];

        await this.loadSections(sections);
    }

    /**
     * Initialize mobile menu functionality
     */
    initializeMobileMenu() {
        const toggle = document.querySelector('.nav__toggle');
        const menu = document.getElementById('nav-menu');
        
        console.log('🔍 Mobile Menu Debug (Section Loader):');
        console.log('Toggle button found:', !!toggle);
        console.log('Menu found:', !!menu);
        console.log('Window width:', window.innerWidth);
        
        if (toggle && menu) {
            console.log('✅ Setting up mobile menu click handler');
            
            toggle.addEventListener('click', function(event) {
                console.log('🎯 HAMBURGER CLICKED! (From Section Loader)');
                event.preventDefault();
                event.stopPropagation();
                
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
            
            console.log('✅ Mobile menu click handler attached successfully');
        } else {
            console.log('❌ Failed to find mobile menu elements');
        }
    }

    /**
     * Load header and footer components
     */
    async loadComponents() {
        try {
            // Load header
            const headerResponse = await fetch('/components/header.html');
            if (headerResponse.ok) {
                const headerHtml = await headerResponse.text();
                const headerContainer = document.getElementById('header-container');
                if (headerContainer) {
                    headerContainer.innerHTML = headerHtml;
                    
                    // Initialize mobile menu after header is loaded
                    setTimeout(() => {
                        this.initializeMobileMenu();
                    }, 100);
                }
            }

            // Load footer
            const footerResponse = await fetch('/components/footer.html');
            if (footerResponse.ok) {
                const footerHtml = await footerResponse.text();
                const footerContainer = document.getElementById('footer-container');
                if (footerContainer) {
                    footerContainer.innerHTML = footerHtml;
                }
            }

            // Load quick rail
            const quickRailResponse = await fetch('/components/quick-rail.html');
            if (quickRailResponse.ok) {
                const quickRailHtml = await quickRailResponse.text();
                const quickRailContainer = document.getElementById('quick-rail-container');
                if (quickRailContainer) {
                    quickRailContainer.innerHTML = quickRailHtml;
                    // Initialize quick rail after loading
                    setTimeout(() => {
                        if (window.initializeQuickRail) {
                            window.initializeQuickRail();
                        }
                    }, 100);
                }
            }

            // Load consult bar
            const consultBarResponse = await fetch('/components/consult-bar.html');
            if (consultBarResponse.ok) {
                const consultBarHtml = await consultBarResponse.text();
                const consultBarContainer = document.getElementById('consult-bar-container');
                if (consultBarContainer) {
                    consultBarContainer.innerHTML = consultBarHtml;
                }
            }
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }
}

// Initialize section loader when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const loader = new SectionLoader();
    
    // Load components first
    await loader.loadComponents();
    
    // Load page sections
    await loader.loadHomePage();
    
    // Initialize carousel after hero section is loaded
    setTimeout(() => {
        if (window.initializeCarousel) {
            window.initializeCarousel();
        }
    }, 200);
    
    // Initialize shorts functionality
    if (typeof initializeShorts === 'function') {
        initializeShorts();
    }
    
    // Initialize consult bar functionality
    const cta = document.querySelector('.consult-cta');
    if (cta) {
        cta.addEventListener('click', () => {
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
    }
});

// Export for use in other modules
window.SectionLoader = SectionLoader;
