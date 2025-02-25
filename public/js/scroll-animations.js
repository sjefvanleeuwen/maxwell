document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const animations = [
    'card--from-bottom',
    'card--from-left',
    'card--from-right',
    'card--from-top',
    'card--zoom-in'
  ];
  
  // Add initial hidden classes with random animations
  cards.forEach(card => {
    card.classList.add('card--hidden');
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    card.classList.add(randomAnimation);
  });
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('card--visible');
        }, 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px'
  });

  cards.forEach(card => observer.observe(card));
});
