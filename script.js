// ===== CLOCK =====
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  document.getElementById('menubar-time').textContent = `${h}:${m}`;
}
updateClock();
setInterval(updateClock, 1000);

// ===== ELEMENTS =====
const macWindow        = document.getElementById('macos-window');
const btnNanti         = document.getElementById('btn-nanti');
const btnBuka          = document.getElementById('btn-buka');
const btnBack          = document.getElementById('btn-back');
const screenWelcome    = document.getElementById('screen-welcome');
const screenQuestion   = document.getElementById('screen-question');
const screenMood       = document.getElementById('screen-mood');
const screenBadMood    = document.getElementById('screen-bad-mood');
const screenGoodMood   = document.getElementById('screen-good-mood');
const screenQuiz       = document.getElementById('screen-quiz');
const screenPassed      = document.getElementById('screen-passed');
const screenConfirmRead = document.getElementById('screen-confirm-read');
const windowDialog     = document.getElementById('window-dialog');
const anniversaryEl    = document.getElementById('anniversary-content');
const windowTitleText  = document.getElementById('window-title-text');

// ===== GLOBAL AUDIO =====
const audio     = document.getElementById('bg-audio');
let isPlaying   = false;
let annInited   = false;

function toggleAudio() {
  if (!isPlaying) {
    audio.play().catch(() => {});
    isPlaying = true;
  } else {
    audio.pause();
    isPlaying = false;
  }
  syncMusicButtons();
}

function syncMusicButtons() {
  const icon      = isPlaying ? '■' : '♪';
  const dockMusic = document.querySelector('.dock-item[data-label="Musik"] .dock-icon');
  const annIcon   = document.getElementById('music-icon');
  const annBtn    = document.getElementById('music-btn');

  if (dockMusic) dockMusic.textContent = isPlaying ? '🔊' : '🎵';
  if (annIcon)   annIcon.textContent   = icon;
  if (annBtn)    annBtn.classList.toggle('playing', isPlaying);
}

// Dock musik — pop animation
const dockMusicItem = document.querySelector('.dock-item[data-label="Musik"]');
const musicHint = document.getElementById('music-hint');

function dismissMusicHint() {
  if (!musicHint || musicHint.classList.contains('hidden')) return;
  musicHint.classList.add('hidden');
  musicHint.addEventListener('animationend', () => musicHint.remove(), { once: true });
}

// Auto-dismiss hint after 9s (appear 1.8s + 3 pulse cycles ~6s)
setTimeout(dismissMusicHint, 5000);

dockMusicItem.addEventListener('click', function () {
  dismissMusicHint();
  toggleAudio();
  this.classList.remove('popping');
  void this.offsetWidth;
  this.classList.add('popping');
  this.addEventListener('animationend', () => {
    this.classList.remove('popping');
    this.style.pointerEvents = 'none';
    setTimeout(() => { this.style.pointerEvents = ''; }, 50);
  }, { once: true });
});

// ===== NANTI — shake window =====
btnNanti.addEventListener('click', () => {
  macWindow.classList.remove('shaking');
  void macWindow.offsetWidth;
  macWindow.classList.add('shaking');
  macWindow.addEventListener('animationend', () => macWindow.classList.remove('shaking'), { once: true });
});

// ===== SCREEN NAVIGATION (dialog screens) =====
function goToScreen(from, to) {
  from.classList.add('screen-exit');
  to.classList.remove('screen-hidden', 'screen-exit-right');
}

function goBack(from, to) {
  from.classList.add('screen-exit-right');
  to.classList.remove('screen-exit', 'screen-exit-right', 'screen-hidden');
}

// Dock 💌 → kembali ke screen welcome dari screen manapun
document.querySelector('.dock-item[data-label="Hanny"]').addEventListener('click', () => {
  // Tutup photo window jika terbuka
  photoWindow.classList.add('photo-window-hidden');
  closeLightbox();

  const allScreens   = [screenWelcome, screenQuestion, screenMood, screenBadMood, screenGoodMood, screenQuiz, screenPassed, screenConfirmRead];
  const activeScreen = allScreens.find(s =>
    !s.classList.contains('screen-hidden') &&
    !s.classList.contains('screen-exit')   &&
    !s.classList.contains('screen-exit-right')
  );

  if (!activeScreen || activeScreen === screenWelcome) return;

  // Slide active screen keluar ke kanan
  activeScreen.classList.add('screen-exit-right');

  // Sembunyikan screen lain yang tidak aktif sekaligus (tanpa animasi)
  resetQuizDodge();
  [screenQuestion, screenMood, screenBadMood, screenGoodMood, screenQuiz, screenPassed, screenConfirmRead].forEach(s => {
    if (s !== activeScreen) {
      s.classList.add('screen-hidden');
      s.classList.remove('screen-exit', 'screen-exit-right');
    }
  });

  // Welcome screen masuk dari kiri (screen-exit = translateX(-40px) → 0)
  screenWelcome.classList.remove('screen-exit', 'screen-exit-right', 'screen-hidden');
  btnBuka.disabled = false;
});

// Buka Pesan → slide ke pertanyaan
btnBuka.addEventListener('click', () => {
  btnBuka.disabled = true;
  goToScreen(screenWelcome, screenQuestion);
});

// ===== LAUNCH ANNIVERSARY — window expand ke fullscreen =====
let originalWindowSize = null;

function launchAnniversary() {
  // Snapshot posisi saat ini sebelum expand
  const rect = macWindow.getBoundingClientRect();
  originalWindowSize = { w: rect.width, h: rect.height, top: rect.top, left: rect.left };

  // Override animation & set posisi eksak sebagai inline px
  macWindow.style.animation = 'none';
  macWindow.style.opacity   = '1';
  macWindow.style.top       = rect.top + 'px';
  macWindow.style.left      = rect.left + 'px';
  macWindow.style.width     = rect.width + 'px';
  macWindow.style.height    = rect.height + 'px';
  macWindow.style.transform = 'none';
  macWindow.style.maxWidth  = 'none';

  void macWindow.offsetWidth; // force reflow

  // Animasi expand ke fullscreen
  macWindow.style.transition = 'top 0.5s ease, left 0.5s ease, width 0.5s ease, height 0.5s ease, border-radius 0.5s ease, box-shadow 0.5s ease';
  macWindow.style.top          = '0';
  macWindow.style.left         = '0';
  macWindow.style.width        = '100%';
  macWindow.style.height       = '100%';
  macWindow.style.borderRadius = '0';
  macWindow.style.boxShadow    = 'none';
  macWindow.style.zIndex       = '20'; // tutup dock & menubar

  setTimeout(() => {
    // Swap konten: tutup dialog, buka anniversary
    windowDialog.style.display    = 'none';
    windowTitleText.style.opacity = '0';
    btnBack.classList.add('visible');

    anniversaryEl.classList.add('active');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        anniversaryEl.classList.add('visible');
        if (!annInited) {
          initAnniversary();
          annInited = true;
        }
      });
    });
  }, 520);
}

// ===== KEMBALI — window shrink ke dialog =====
btnBack.addEventListener('click', () => {
  // Fade out anniversary
  anniversaryEl.classList.remove('visible');
  btnBack.classList.remove('visible');

  setTimeout(() => {
    // Tutup anniversary, buka dialog
    anniversaryEl.classList.remove('active');
    windowDialog.style.display    = 'flex';
    windowTitleText.style.opacity = '';

    // Hitung posisi tengah semula
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const finalLeft = (vw - originalWindowSize.w) / 2;
    const finalTop  = (vh - originalWindowSize.h) / 2;

    macWindow.style.transition   = 'top 0.45s ease, left 0.45s ease, width 0.45s ease, height 0.45s ease, border-radius 0.45s ease, box-shadow 0.45s ease';
    macWindow.style.top          = finalTop  + 'px';
    macWindow.style.left         = finalLeft + 'px';
    macWindow.style.width        = originalWindowSize.w + 'px';
    macWindow.style.height       = originalWindowSize.h + 'px';
    macWindow.style.borderRadius = '12px';
    macWindow.style.boxShadow    = '0 40px 100px rgba(0,0,0,0.7)';

    setTimeout(() => {
      // Bersihkan inline styles, biarkan CSS ambil alih
      macWindow.removeAttribute('style');
      macWindow.style.animation = 'none';
      macWindow.style.opacity   = '1';

      // Reset semua screen ke state awal
      resetQuizDodge();
      [screenQuestion, screenMood, screenBadMood, screenGoodMood, screenQuiz, screenPassed, screenConfirmRead].forEach(s => {
        s.classList.add('screen-hidden');
        s.classList.remove('screen-exit', 'screen-exit-right');
      });
      screenWelcome.classList.remove('screen-exit', 'screen-exit-right', 'screen-hidden');
      btnBuka.disabled = false;
    }, 460);
  }, 300);
});

// Tombol "Tidak" → langsung ke anniversary
// "Tidak, sudah baca" → konfirmasi dulu
document.getElementById('btn-tidak').addEventListener('click', () => {
  goToScreen(screenQuestion, screenConfirmRead);
});

// Konfirmasi: "Iya, sudah baca" → anniversary
document.getElementById('btn-confirm-yes').addEventListener('click', launchAnniversary);

// Konfirmasi: "Eh, salah klik" → balik ke pertanyaan
document.getElementById('btn-confirm-no').addEventListener('click', () => {
  goBack(screenConfirmRead, screenQuestion);
});

// Tombol "Ya, pertama kali" → ke screen mood
document.getElementById('btn-ya').addEventListener('click', () => {
  goToScreen(screenQuestion, screenMood);
});

// Tombol mood good → screen good mood
document.getElementById('btn-mood-good').addEventListener('click', () => {
  goToScreen(screenMood, screenGoodMood);
});

// "Nanti dulu" → balik ke home
document.getElementById('btn-good-mood-back').addEventListener('click', () => {
  [screenQuestion, screenMood, screenGoodMood, screenBadMood].forEach(s => {
    s.classList.add('screen-hidden');
    s.classList.remove('screen-exit', 'screen-exit-right');
  });
  screenWelcome.classList.remove('screen-exit', 'screen-exit-right', 'screen-hidden');
  btnBuka.disabled = false;
});

// "Oke lanjut" → quiz screen
document.getElementById('btn-good-mood-next').addEventListener('click', () => {
  resetQuizDodge();
  goToScreen(screenGoodMood, screenQuiz);
});

// "Ya" → screen lolos
document.getElementById('btn-quiz-ya').addEventListener('click', () => {
  resetQuizDodge();
  goToScreen(screenQuiz, screenPassed);
});

// "Lanjut ke Pesan" → launch anniversary
document.getElementById('btn-passed-next').addEventListener('click', launchAnniversary);

// ===== QUIZ DODGE BUTTON =====
let dodgeActive = false;
const btnQuizTidak = document.getElementById('btn-quiz-tidak');
const quizBtnContainer = btnQuizTidak.parentNode;

function moveToRandom() {
  const w   = btnQuizTidak.offsetWidth  || 100;
  const h   = btnQuizTidak.offsetHeight || 40;
  const pad = 24;
  const x   = Math.random() * (window.innerWidth  - w - pad * 2) + pad;
  const y   = Math.random() * (window.innerHeight - h - pad * 2) + pad;
  btnQuizTidak.style.left = x + 'px';
  btnQuizTidak.style.top  = y + 'px';
}

function resetQuizDodge() {
  if (!dodgeActive) return;
  btnQuizTidak.removeAttribute('style');
  quizBtnContainer.appendChild(btnQuizTidak);
  dodgeActive = false;
}

function activateDodge() {
  if (!dodgeActive) {
    const rect = btnQuizTidak.getBoundingClientRect();
    dodgeActive = true;
    Object.assign(btnQuizTidak.style, {
      position:   'fixed',
      left:       rect.left + 'px',
      top:        rect.top  + 'px',
      width:      rect.width + 'px',
      margin:     '0',
      zIndex:     '9999',
      transition: 'left 0.22s cubic-bezier(0.34,1.56,0.64,1), top 0.22s cubic-bezier(0.34,1.56,0.64,1)',
    });
    document.body.appendChild(btnQuizTidak);
    setTimeout(moveToRandom, 30);
  } else {
    moveToRandom();
  }
}

// Desktop: kabur saat hover
btnQuizTidak.addEventListener('mouseenter', activateDodge);

// Mobile: kabur saat disentuh, preventDefault agar tap tidak terdaftar
btnQuizTidak.addEventListener('touchstart', (e) => {
  e.preventDefault();
  activateDodge();
}, { passive: false });

// Tombol mood bad → screen bad mood
document.getElementById('btn-mood-bad').addEventListener('click', () => {
  goToScreen(screenMood, screenBadMood);
});

// "Oke, istirahat dulu" → kembali ke screen welcome
document.getElementById('btn-bad-mood-back').addEventListener('click', () => {
  [screenBadMood, screenMood, screenQuestion].forEach(s => {
    s.classList.add('screen-hidden');
    s.classList.remove('screen-exit', 'screen-exit-right');
  });
  screenWelcome.classList.remove('screen-exit', 'screen-exit-right', 'screen-hidden');
  btnBuka.disabled = false;
});

// ===== INIT ANNIVERSARY =====
function initAnniversary() {
  // Typed.js
  new Typed('#typed-names', {
    strings: ['Raihanny Athifa Zahra', 'Dua Setengah Tahun Bersama'],
    typeSpeed: 60, backSpeed: 40, backDelay: 2200, loop: true,
  });

  // Particles.js
  particlesJS('particles-js', {
    particles: {
      number: { value: 35, density: { enable: true, value_area: 800 } },
      color:  { value: ['#e8a0bf', '#c2185b', '#d4a373', '#f8bbd0'] },
      shape:  { type: 'char', character: { value: ['♥', '✿', '✦'], font: 'Arial', style: '', weight: '400' } },
      opacity: { value: 0.5, random: true },
      size:    { value: 14, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 1.2, direction: 'top', random: true, straight: false, out_mode: 'out' },
    },
    interactivity: { detect_on: 'window', events: { onhover: { enable: false }, onclick: { enable: false } } },
    retina_detect: true,
  });

  // Scroll reveal — IntersectionObserver dengan root = .ann-scroll
  const scrollContainer = document.querySelector('.ann-scroll');
  const revealObserver  = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('revealed');
    });
  }, { root: scrollContainer, threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  scrollContainer.querySelectorAll('[data-reveal]').forEach((el, i) => {
    const delay = el.dataset.revealDelay || 0;
    el.style.transitionDelay = delay + 'ms';
    revealObserver.observe(el);
  });

  // Music button
  document.getElementById('music-btn').addEventListener('click', toggleAudio);
  syncMusicButtons();

  // Confetti
  const closingSection  = document.querySelector('.closing');
  const confettiObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { spawnConfetti(); confettiObserver.disconnect(); }
    });
  }, { root: scrollContainer, threshold: 0.3 });
  if (closingSection) confettiObserver.observe(closingSection);
}

// ===== PHOTO WINDOW =====
const photoWindow   = document.getElementById('photo-window');
const photoLightbox = document.getElementById('photo-lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const photoImgs     = Array.from(document.querySelectorAll('.photo-grid [data-photo]'));
let currentPhotoIdx = 0;

function openPhotoWindow() {
  photoWindow.classList.remove('photo-window-hidden');
}
function closePhotoWindow() {
  photoWindow.classList.add('photo-window-hidden');
}
function openLightbox(idx) {
  currentPhotoIdx = idx;
  lightboxImg.src = photoImgs[idx].src;
  photoLightbox.classList.remove('photo-lightbox-hidden');
}
function closeLightbox() {
  photoLightbox.classList.add('photo-lightbox-hidden');
}
function lightboxNav(dir) {
  currentPhotoIdx = (currentPhotoIdx + dir + photoImgs.length) % photoImgs.length;
  lightboxImg.src = photoImgs[currentPhotoIdx].src;
}

document.querySelector('.dock-item[data-label="Foto"]').addEventListener('click', openPhotoWindow);
document.getElementById('photo-close').addEventListener('click', closePhotoWindow);
document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => lightboxNav(-1));
document.getElementById('lightbox-next').addEventListener('click', () => lightboxNav(1));

photoImgs.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));

photoLightbox.addEventListener('click', (e) => {
  if (e.target === photoLightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (photoLightbox.classList.contains('photo-lightbox-hidden')) return;
  if (e.key === 'ArrowLeft')  lightboxNav(-1);
  if (e.key === 'ArrowRight') lightboxNav(1);
  if (e.key === 'Escape')     closeLightbox();
});

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  const colors    = ['#e8a0bf', '#c2185b', '#d4a373', '#f48fb1', '#ffffff', '#fce4ec'];
  for (let i = 0; i < 70; i++) {
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    piece.style.left              = Math.random() * 100 + 'vw';
    const size                    = Math.random() * 9 + 5;
    piece.style.width             = size + 'px';
    piece.style.height            = size + 'px';
    piece.style.background        = colors[Math.floor(Math.random() * colors.length)];
    piece.style.borderRadius      = Math.random() > 0.5 ? '50%' : '3px';
    piece.style.animationDuration = (Math.random() * 4 + 4) + 's';
    piece.style.animationDelay    = (Math.random() * 6) + 's';
    container.appendChild(piece);
  }
}

// ===== GALLERY TAP (mobile) =====
document.querySelectorAll('.gallery-item').forEach(item => {
  item.addEventListener('click', () => {
    const isTouch = !window.matchMedia('(hover: hover)').matches;
    if (!isTouch) return;
    const wasOpen = item.classList.contains('tapped');
    document.querySelectorAll('.gallery-item.tapped').forEach(el => el.classList.remove('tapped'));
    if (!wasOpen) item.classList.add('tapped');
  });
});
