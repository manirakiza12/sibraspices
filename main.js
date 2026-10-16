const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
$('#year').textContent = new Date().getFullYear();

// Navigation remains usable with touch, keyboard, and orientation changes.
const menu = $('#mobile-nav');
const menuToggle = $('#menu-toggle');
function closeMenu(restoreFocus = false) {
  menu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$$('#mobile-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) closeMenu(true);
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Crossfade carousel. Pause on focus, hover, hidden tabs, and reduced-motion preference.
const hero = $('#hero');
const slides = $$('.hero-slide');
const dots = $$('.slide-dot');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let userPaused = motion.matches;
let timer;
function showSlide(next) {
  index = (next + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    const active = i === index;
    slide.classList.toggle('opacity-100', active);
    slide.classList.toggle('opacity-0', !active);
    slide.classList.toggle('visible', active);
    slide.classList.toggle('invisible', !active);
    slide.classList.toggle('pointer-events-none', !active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
    dots[i].setAttribute('aria-current', String(active));
    const marker = dots[i].querySelector('span');
    marker.classList.toggle('w-7', active);
    marker.classList.toggle('w-2', !active);
    marker.classList.toggle('bg-burgundy', active);
    marker.classList.toggle('bg-burgundy/25', !active);
  });
  $('#slide-count').textContent = `${String(index + 1).padStart(2, '0')} / 03`;
}
function stopTimer() { clearInterval(timer); }
function startTimer() {
  stopTimer();
  if (!userPaused && !motion.matches && !document.hidden && !hero.contains(document.activeElement) && !hero.matches(':hover')) {
    timer = setInterval(() => showSlide(index + 1), 6500);
  }
}
function move(next) { showSlide(next); startTimer(); }
$('#next-slide').addEventListener('click', () => move(index + 1));
$('#prev-slide').addEventListener('click', () => move(index - 1));
dots.forEach((dot, i) => dot.addEventListener('click', () => move(i)));
function updatePause() {
  $('#pause-slider').setAttribute('aria-pressed', String(userPaused));
  $('#pause-slider').setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  $('#pause-slider').textContent = userPaused ? '▷' : 'Ⅱ';
}
$('#pause-slider').addEventListener('click', () => { userPaused = !userPaused; updatePause(); startTimer(); });
hero.addEventListener('mouseenter', stopTimer);
hero.addEventListener('mouseleave', startTimer);
hero.addEventListener('focusin', stopTimer);
hero.addEventListener('focusout', () => requestAnimationFrame(startTimer));
document.addEventListener('visibilitychange', startTimer);
motion.addEventListener('change', () => { if (motion.matches) userPaused = true; updatePause(); startTimer(); });
hero.addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    // Move focus to the controls before a slide's content becomes inert.
    if (event.target.closest('.hero-slide')) $('#next-slide').focus();
    move(index + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
let touch;
hero.addEventListener('touchstart', event => {
  if (event.touches.length === 1) touch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
hero.addEventListener('touchend', event => {
  if (!touch || !event.changedTouches.length) return;
  const dx = event.changedTouches[0].clientX - touch.x;
  const dy = event.changedTouches[0].clientY - touch.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(index + (dx < 0 ? 1 : -1));
  touch = undefined;
}, { passive: true });
updatePause();
startTimer();

// Filters do not hide the surrounding catalogue or change the listed prices.
$$('.product-filter').forEach(button => button.addEventListener('click', () => {
  const category = button.dataset.filter;
  $$('.product-filter').forEach(filter => {
    const active = filter === button;
    filter.setAttribute('aria-pressed', String(active));
    for (const name of ['border-burgundy', 'bg-burgundy', 'text-white']) filter.classList.toggle(name, active);
    for (const name of ['border-line', 'text-stone', 'hover:border-burgundy', 'hover:text-burgundy']) filter.classList.toggle(name, !active);
  });
  let visible = 0;
  $$('.product-card').forEach(card => {
    card.hidden = category !== 'All spices' && card.dataset.category !== category;
    if (!card.hidden) visible++;
  });
  $('#filter-status').textContent = `${visible} ${visible === 1 ? 'product' : 'products'} shown for ${category}.`;
}));

// Shop shortcuts reuse the catalogue filters.
$$('[data-shop-filter]').forEach(link => link.addEventListener('click', () => {
  const filter = $$('.product-filter').find(button => button.dataset.filter === link.dataset.shopFilter);
  if (filter) filter.click();
  $$('.shop-menu').forEach(menu => { menu.open = false; });
}));
document.addEventListener('click', event => {
  $$('.shop-menu').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') $$('.shop-menu').forEach(menu => {
    if (menu.open) { menu.open = false; menu.querySelector('summary').focus(); }
  });
});

// Service CTAs preselect the relevant booking option.
$$('[data-service]').forEach(link => link.addEventListener('click', () => {
  $('#service').value = link.dataset.service;
}));
const phone = $('#phone');
phone.addEventListener('input', () => phone.setCustomValidity(''));
$('#booking-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const values = Object.fromEntries([...data].map(([key, value]) => [key, String(value).trim()]));
  const digits = values.phone.replace(/\D/g, '');
  if (!/^[+\d\s().-]+$/.test(values.phone) || digits.length < 9 || digits.length > 15) {
    phone.setCustomValidity('Please enter a valid phone number with 9–15 digits.');
    phone.reportValidity();
    return;
  }
  if (!values.name || !values.location) {
    $('#booking-status').textContent = 'Please include your name and location so our team can respond.';
    return;
  }
  if (!form.reportValidity()) return;
  const message = `Hello SIBRA SPICES! I’d like to inquire about ${values.service}.\n\nName: ${values.name}\nPhone: ${values.phone}\nLocation: ${values.location}${values.message ? '\n\nDetails: ' + values.message : ''}\n\nPlease confirm availability, pricing, and the next steps.`;
  const url = 'https://wa.me/256763415857?text=' + encodeURIComponent(message);
  const link = document.createElement('a');
  link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.click();
  $('#booking-status').textContent = 'Your request is ready in WhatsApp. Review it and tap Send. Your appointment or order is confirmed by our team.';
});
