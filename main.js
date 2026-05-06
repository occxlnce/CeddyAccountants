// Parallax effects
class ParallaxController {
  constructor() {
    this.elements = [];
    this.init();
  }

  init() {
    // Find all parallax elements
    this.findParallaxElements();
    this.setupEventListeners();
    this.updateParallax(); // Initial update
  }

  findParallaxElements() {
    // Background parallax elements
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    parallaxBgs.forEach(el => {
      this.elements.push({
        element: el,
        type: 'background',
        speed: el.classList.contains('parallax-slow') ? 0.2 : 
               el.classList.contains('parallax-medium') ? 0.4 : 
               el.classList.contains('parallax-fast') ? 0.6 : 0.3
      });
    });

    // Brand mark parallax
    const brandParallax = document.querySelectorAll('.brand-parallax');
    brandParallax.forEach(el => {
      this.elements.push({
        element: el,
        type: 'brand',
        speed: 0.15
      });
    });

    // Decorative parallax elements
    const decorativeElements = document.querySelectorAll('.parallax-element');
    decorativeElements.forEach(el => {
      this.elements.push({
        element: el,
        type: 'decorative',
        speed: parseFloat(el.dataset.speed) || 0.3
      });
    });

    // Auto-detect background images in hero sections
    const heroSections = document.querySelectorAll('.home-hero, .page-hero');
    heroSections.forEach(section => {
      const computedStyle = window.getComputedStyle(section);
      if (computedStyle.backgroundImage && computedStyle.backgroundImage !== 'none') {
        // Create parallax wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'parallax';
        wrapper.style.position = 'absolute';
        wrapper.style.top = '0';
        wrapper.style.left = '0';
        wrapper.style.width = '100%';
        wrapper.style.height = '100%';
        wrapper.style.overflow = 'hidden';
        wrapper.style.zIndex = '-1';

        const parallaxBg = document.createElement('div');
        parallaxBg.className = 'parallax-bg parallax-medium';
        parallaxBg.style.backgroundImage = computedStyle.backgroundImage;
        parallaxBg.style.backgroundSize = computedStyle.backgroundSize;
        parallaxBg.style.backgroundPosition = computedStyle.backgroundPosition;
        parallaxBg.style.backgroundRepeat = computedStyle.backgroundRepeat;

        wrapper.appendChild(parallaxBg);
        section.style.position = 'relative';
        section.insertBefore(wrapper, section.firstChild);

        // Remove original background
        section.style.backgroundImage = 'none';

        this.elements.push({
          element: parallaxBg,
          type: 'background',
          speed: 0.3
        });
      }
    });
  }

  setupEventListeners() {
    let ticking = false;

    const updateParallax = () => {
      this.updateParallax();
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    };

    // Scroll event
    window.addEventListener('scroll', requestTick);

    // Mouse move for subtle parallax on some elements
    document.addEventListener('mousemove', (e) => {
      const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      this.elements.forEach(item => {
        if (item.type === 'decorative' || item.type === 'brand') {
          const translateX = mouseX * item.speed * 10;
          const translateY = mouseY * item.speed * 10;
          item.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        }
      });
    });
  }

  updateParallax() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    this.elements.forEach(item => {
      if (item.type === 'background') {
        const rect = item.element.parentElement.getBoundingClientRect();
        const elementTop = rect.top + scrollTop;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Only update if element is in view
        if (rect.bottom >= 0 && rect.top <= windowHeight) {
          const scrollPercent = (scrollTop - elementTop + windowHeight) / (elementHeight + windowHeight);
          const translateY = scrollPercent * item.speed * 100;
          item.element.style.transform = `translateY(${translateY}px)`;
        }
      }
    });
  }
}

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
    });
  }

  // Highlight active nav link based on current page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('active');
  });

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Initialize parallax
  new ParallaxController();

  // Update brand marks to use parallax
  const brandMarks = document.querySelectorAll('.brand-mark');
  brandMarks.forEach(mark => {
    const style = mark.getAttribute('style');
    if (style && style.includes('background-image')) {
      // Extract background image URL
      const bgMatch = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (bgMatch) {
        const bgUrl = bgMatch[1];
        mark.innerHTML = `<div class="brand-parallax" style="background-image: url('${bgUrl}');"></div>`;
        mark.removeAttribute('style');
      }
    }
  });

  // Contact form handler (demo)
  const form = document.querySelector('#contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.querySelector('#form-status');
      if (status) {
        status.textContent = 'Thank you. Your enquiry has been received — Ceddy will respond within one business day.';
        status.style.color = 'var(--muted-gold)';
      }
      form.reset();
    });
  }
});
