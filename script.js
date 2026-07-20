const preloader = document.querySelector('.preloader');
const cursorGlow = document.querySelector('.cursor-glow');
const header = document.querySelector('.site-header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const productTitle = document.querySelector('#product-title');
const productDetail = document.querySelector('#product-detail');
const productSelect = document.querySelector('#product-select');
const productOrbit = document.querySelector('.product-orbit');

window.addEventListener('load', () => {
  setTimeout(() => preloader.classList.add('hidden'), 450);
});

const themeSwitch = document.querySelector('.theme-switch input');
if (themeSwitch) {
  themeSwitch.checked = document.body.classList.contains('light-theme');
  
  themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-theme');
      localStorage.setItem('theme', 'dark');
    }
  });
}

menuToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.addEventListener('click', event => {
  if (event.target.matches('a')) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('[data-reveal]').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index * 55, 420)}ms`;
  revealObserver.observe(element);
});

const sections = [...document.querySelectorAll('main section, footer')];
const navLinks = [...document.querySelectorAll('.main-nav a')];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -45% 0px' });
sections.forEach(section => section.id && sectionObserver.observe(section));

window.addEventListener('scroll', () => {
  const scrolled = window.scrollY > 40;
  header.style.background = scrolled ? 'rgba(8, 10, 14, .78)' : 'rgba(8, 10, 14, .58)';
  document.documentElement.style.setProperty('--scroll', window.scrollY);
}, { passive: true });

window.addEventListener('pointermove', event => {
  cursorGlow.animate({ left: `${event.clientX}px`, top: `${event.clientY}px` }, { duration: 650, fill: 'forwards', easing: 'ease-out' });
});

document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateY = ((x / rect.width) - 0.5) * 14;
    const rotateX = ((0.5 - y / rect.height)) * 14;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = 'rotateX(0deg) rotateY(0deg) translateY(0)';
  });
});

document.querySelectorAll('.magnetic').forEach(button => {
  button.addEventListener('pointermove', event => {
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    button.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px)`;
  });
  button.addEventListener('pointerleave', () => {
    button.style.transform = 'translate(0, 0)';
  });
});

function setProduct({ product, detail, image }) {
  productTitle.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 420, easing: 'ease-out' });
  productDetail.animate([{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 520, easing: 'ease-out' });
  productTitle.textContent = product;
  productDetail.textContent = detail;
  if (image) {
    productOrbit.style.setProperty('--product-image', `url("${image}")`);
  }
}

document.querySelectorAll('.product-row').forEach(row => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.product-row').forEach(item => item.classList.remove('active'));
    row.classList.add('active');
    if (productSelect) productSelect.value = row.dataset.product;
    setProduct(row.dataset);
  });
});

if (productSelect) {
  productSelect.addEventListener('change', () => {
    const option = productSelect.selectedOptions[0];
    const matchingRow = document.querySelector(`.product-row[data-product="${CSS.escape(productSelect.value)}"]`);
    document.querySelectorAll('.product-row').forEach(item => item.classList.toggle('active', item === matchingRow));
    setProduct({
      product: option.value,
      detail: option.dataset.detail,
      image: option.dataset.image
    });
  });
}

const canvas = document.querySelector('#particle-field');
const context = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth * devicePixelRatio;
  canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  particles = Array.from({ length: Math.min(90, Math.floor(window.innerWidth / 18)) }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.42,
    vy: (Math.random() - 0.5) * 0.42,
    size: Math.random() * 2.2 + 0.6,
    hue: Math.random() > 0.5 ? 50 : 0
  }));
}

function drawParticles() {
  context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy;
    if (particle.x < 0 || particle.x > window.innerWidth) particle.vx *= -1;
    if (particle.y < 0 || particle.y > window.innerHeight) particle.vy *= -1;
    context.beginPath();
    context.fillStyle = particle.hue === 50 ? 'rgba(255, 212, 0, .72)' : 'rgba(243, 35, 35, .56)';
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    context.fill();
    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const other = particles[nextIndex];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance < 132) {
        context.strokeStyle = `rgba(255,255,255,${(1 - distance / 132) * 0.12})`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(particle.x, particle.y);
        context.lineTo(other.x, other.y);
        context.stroke();
      }
    }
  });
  requestAnimationFrame(drawParticles);
}

resizeCanvas();
drawParticles();
window.addEventListener('resize', resizeCanvas);
