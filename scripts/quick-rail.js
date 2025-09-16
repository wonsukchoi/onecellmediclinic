/**
 * Quick Rail functionality - handles expand/collapse of floating action buttons
 */
function initializeQuickRail() {
    const rail = document.querySelector('.quick-rail');
    const trigger = document.querySelector('.quick-rail__trigger');
    const toggleBtn = document.querySelector('.quick-rail__toggle');
    
    if (!rail) {
        console.log('Quick rail not found');
        return;
    }
    
    console.log('Initializing quick rail...');
    
    function collapseRail() {
        console.log('Collapsing rail');
        rail.classList.add('is-collapsed');
        rail.setAttribute('aria-expanded', 'false');
    }
    
    function expandRail() {
        console.log('Expanding rail');
        rail.classList.remove('is-collapsed');
        rail.setAttribute('aria-expanded', 'true');
    }
    
    // Add event listeners
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            collapseRail();
        });
        console.log('Toggle button event listener added');
    } else {
        console.log('Toggle button not found');
    }
    
    if (trigger) {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            expandRail();
        });
        console.log('Trigger button event listener added');
    } else {
        console.log('Trigger button not found');
    }
    
    // Add click handlers for other buttons
    const actionButtons = rail.querySelectorAll('.quick-rail__btn:not(.quick-rail__toggle)');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Action button clicked:', btn.textContent);
            // Add specific functionality for each button here
        });
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeQuickRail);
} else {
    initializeQuickRail();
}

// Export for use in other modules
window.initializeQuickRail = initializeQuickRail;
