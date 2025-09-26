// Dropdown Menu Enhancement
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.nav__item--dropdown');
    
    dropdownItems.forEach(item => {
        const dropdown = item.querySelector('.nav__dropdown');
        let hoverTimeout;
        
        // Show dropdown on mouse enter
        item.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            
            // Hide all other dropdowns first
            dropdownItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherDropdown = otherItem.querySelector('.nav__dropdown');
                    otherDropdown.style.opacity = '0';
                    otherDropdown.style.visibility = 'hidden';
                }
            });
            
            // Show current dropdown
            dropdown.style.opacity = '1';
            dropdown.style.visibility = 'visible';
        });
        
        // Hide dropdown on mouse leave with delay
        item.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            }, 200); // Slightly longer delay
        });
        
        // Keep dropdown open when hovering over the dropdown itself
        dropdown.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
        });
        
        dropdown.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            }, 200);
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav__item--dropdown')) {
            dropdownItems.forEach(item => {
                const dropdown = item.querySelector('.nav__dropdown');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            });
        }
    });
    
    // Handle keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            dropdownItems.forEach(item => {
                const dropdown = item.querySelector('.nav__dropdown');
                dropdown.style.opacity = '0';
                dropdown.style.visibility = 'hidden';
            });
        }
    });
    
    // Close dropdown when scrolling
    window.addEventListener('scroll', function() {
        dropdownItems.forEach(item => {
            const dropdown = item.querySelector('.nav__dropdown');
            dropdown.style.opacity = '0';
            dropdown.style.visibility = 'hidden';
        });
    });
});
