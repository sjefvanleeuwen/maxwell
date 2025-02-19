class Navbar {
    constructor() {
        this.toggle = document.querySelector('.navbar-toggle');
        this.menu = document.querySelector('.navbar-menu');
        this.init();
    }

    init() {
        if (this.toggle && this.menu) {
            this.toggle.addEventListener('click', () => this.toggleMenu());
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.navbar')) {
                    this.closeMenu();
                }
            });
            // Close menu when resizing to desktop
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    this.closeMenu();
                }
            });
        }
    }

    toggleMenu() {
        this.toggle.classList.toggle('active');
        this.menu.classList.toggle('active');
    }

    closeMenu() {
        this.toggle.classList.remove('active');
        this.menu.classList.remove('active');
    }
}

// Initialize navbar
document.addEventListener('DOMContentLoaded', () => {
    new Navbar();
});
