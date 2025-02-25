class TopNavbar extends HTMLElement {
  connectedCallback() {
    fetch(new URL('./navbar.html', import.meta.url))
      .then(response => response.text())
      .then(html => {
        this.innerHTML = html;
        // Attach event listener for hamburger toggle
        const toggleBtn = this.querySelector('.navbar-toggle');
        const menu = this.querySelector('.navbar-menu');
        if (toggleBtn && menu) {
          toggleBtn.addEventListener('click', () => {
            menu.classList.toggle('active');
            toggleBtn.classList.toggle('active');
          });
        }
      })
      .catch(e => console.error(e));
  }
}
customElements.define('top-navbar', TopNavbar);
