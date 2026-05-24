document.addEventListener('DOMContentLoaded', function() {
    // Initialize typed.js functionality
    new Typed('#typed-text', {
        strings: ["AI Trainer @ Turing", "Data Scientist"],
        typeSpeed: 110,
        backSpeed: 50,
        loop: true,
    });

    // Sidebar navigation highlight functionality
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.sidebar ul li a');

    function removeActiveClasses() {
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
    }

    function addActiveClass(sectionId) {
        removeActiveClasses();
        const activeLink = document.querySelector(`.sidebar ul li a[href="#${sectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - sectionHeight / 3) {
                current = section.getAttribute('id');
            }
        });

        addActiveClass(current);
    });

    window.addEventListener('hashchange', () => {
        const currentHash = window.location.hash.replace('#', '');
        addActiveClass(currentHash);
    });
});
