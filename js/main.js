
// Smooth Scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Active Nav Highlighting
document.addEventListener("DOMContentLoaded", function() {
    const currentLocation = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        // Remove default active class first
        link.classList.remove('active');
        
        // Add active class if link matches current page
        if (link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
        
        // Default to home if on root path
        if (currentLocation === "" && link.getAttribute('href') === "index.html") {
            link.classList.add('active');
        }
    });
});

(function () {
    var searchInput = document.getElementById('faq-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        var searchTerm = this.value.toLowerCase().trim();
        var items = document.querySelectorAll('.accordion-item');
        var noResults = document.getElementById('faq-no-results');
        var visibleCount = 0;

        items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            if (searchTerm === '' || text.indexOf(searchTerm) !== -1) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        if (noResults) {
            if (visibleCount === 0 && searchTerm !== '') {
                noResults.classList.remove('hidden');
            } else {
                noResults.classList.add('hidden');
            }
        }
    });
})();
