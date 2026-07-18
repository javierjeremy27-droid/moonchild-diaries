// ---------- Fan Zone drawer tabs ----------
document.querySelectorAll('.drawer-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.drawer-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.drawer-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panel = document.getElementById(tab.dataset.panel);
    panel.classList.add('active');
    // this panel's content may have been display:none since page load, so its
    // .reveal elements might never have fired their scroll-triggered animation —
    // force them visible now rather than relying on the observer noticing.
    panel.querySelectorAll('.reveal:not(.is-visible)').forEach(el => el.classList.add('is-visible'));
  });
});

// ---------- Moonchild Easter egg (tap logo 5x) ----------
const brandTrigger = document.getElementById('brandTrigger');
const moonchildOverlay = document.getElementById('moonchildOverlay');
const closeMoonchildOverlay = document.getElementById('closeMoonchildOverlay');
let brandTapCount = 0;
let brandTapTimer = null;

if(brandTrigger){
  brandTrigger.addEventListener('click', () => {
    brandTapCount++;
    clearTimeout(brandTapTimer);
    brandTapTimer = setTimeout(() => { brandTapCount = 0; }, 2000);
    if(brandTapCount >= 5){
      brandTapCount = 0;
      moonchildOverlay.hidden = false;
      document.body.style.overflow = 'hidden';
    }
  });
}
if(closeMoonchildOverlay){
  closeMoonchildOverlay.addEventListener('click', () => {
    moonchildOverlay.hidden = true;
    document.body.style.overflow = '';
  });
}

// ---------- Active section nav highlighting ----------
const navLinks = document.querySelectorAll('nav ul a[href^="#"]');
const observedSections = Array.from(navLinks).map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

if(observedSections.length){
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = document.querySelector(`nav ul a[href="#${entry.target.id}"]`);
      if(!link) return;
      if(entry.isIntersecting){
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  observedSections.forEach(sec => navObserver.observe(sec));
}

// ---------- Diary header: date stamp + typewriter ----------
const diaryDateEl = document.getElementById('diaryDate');
if(diaryDateEl){
  const today = new Date();
  diaryDateEl.textContent = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

const typedLineEl = document.getElementById('typedLine');
if(typedLineEl){
  const fullText = "this one's for you.";
  let i = 0;
  function typeNext(){
    if(i <= fullText.length){
      typedLineEl.textContent = fullText.slice(0, i);
      i++;
      setTimeout(typeNext, 55);
    }
  }
  setTimeout(typeNext, 500);
}

// ---------- Starfield canvas with gentle mouse parallax ----------
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let mouseX = 0, mouseY = 0;

function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const count = Math.floor((canvas.width * canvas.height) / 9000);
  stars = Array.from({length: count}, () => {
    const isGlowing = Math.random() < 0.1;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: isGlowing ? (Math.random() * 1.2 + 1.4) : (Math.random() * 1.3 + 0.3),
      baseAlpha: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random() * 0.6 + 0.2,
      glow: isGlowing
    };
  });
}

// ---------- Shooting stars ----------
let shootingStars = [];

function spawnShootingStar(){
  const startX = Math.random() * canvas.width;
  const startY = Math.random() * canvas.height * 0.4;
  const angle = (Math.PI / 4) + (Math.random() * 0.3 - 0.15);
  const speed = 9 + Math.random() * 6;
  shootingStars.push({
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1
  });
  const nextDelay = 6000 + Math.random() * 12000;
  setTimeout(spawnShootingStar, nextDelay);
}
setTimeout(spawnShootingStar, 4000 + Math.random() * 6000);

function drawShootingStars(){
  shootingStars.forEach(s => {
    const tailX = s.x - s.vx * 6;
    const tailY = s.y - s.vy * 6;
    const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    grad.addColorStop(0, `rgba(244,237,228,${s.life})`);
    grad.addColorStop(1, 'rgba(244,237,228,0)');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.012;
  });
  shootingStars = shootingStars.filter(s => s.life > 0 && s.y < canvas.height + 50 && s.x < canvas.width + 50);
}

function drawStars(t){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const parallaxX = (mouseX - canvas.width / 2) * 0.01;
  const parallaxY = (mouseY - canvas.height / 2) * 0.01;

  for(const s of stars){
    const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
    const px = s.x - parallaxX * s.depth;
    const py = s.y - parallaxY * s.depth;

    if(s.glow){
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(232,160,160,0.6)';
    }
    ctx.beginPath();
    ctx.fillStyle = `rgba(244,237,228,${Math.max(0, alpha)})`;
    ctx.arc(px, py, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawShootingStars();
  requestAnimationFrame(drawStars);
}

window.addEventListener('resize', resizeCanvas);
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

resizeCanvas();
requestAnimationFrame(drawStars);


// ---------- Scroll-driven moon phase (signature element) ----------
const moonShadow = document.getElementById('moonShadow');
const moonLabel = document.getElementById('moonLabel');
const phaseLabels = ['new moon', 'waxing crescent', 'first quarter', 'waxing gibbous', 'full moon'];

function updateMoon(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

  // shadow slides from fully covering (left: -10%) to fully clear (left: 110%)
  const shadowLeft = -10 + progress * 120;
  moonShadow.style.left = shadowLeft + '%';

  const labelIndex = Math.min(Math.floor(progress * phaseLabels.length), phaseLabels.length - 1);
  moonLabel.textContent = phaseLabels[labelIndex];
}
window.addEventListener('scroll', updateMoon, { passive: true });
updateMoon();

// ---------- Reveal on scroll ----------
const revealEls = document.querySelectorAll('.reveal:not(.is-visible)');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---------- Discography cards ----------
document.querySelectorAll('.record').forEach(card => {
  const toggle = () => {
    const isOpen = card.classList.toggle('open');
    card.setAttribute('aria-expanded', isOpen);
  };
  card.addEventListener('click', toggle);
  card.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggle();
    }
  });
});

// ---------- Background music player (shared across Spotlight + Moods) ----------
const bgFrame = document.getElementById('bgPlayerFrame');
const bgPlayToggle = document.getElementById('bgPlayToggle');
const nowPlayingBar = document.getElementById('nowPlayingBar');
const nowPlayingLabel = document.getElementById('nowPlayingLabel');
const nowPlayingStop = document.getElementById('nowPlayingStop');

const trackLibrary = {
  DropwjmHtoo: 'Oceans & Engines',
  OkOohmpromQ: 'Selene',
  PhXOcId57CY: 'Switchblade',
  'qYwsPx-ryxk': 'Backburner',
  'IFmK1-WR3zU': 'Strong Girl',
  rX2iFcmJyzw: 'Plot Twist',
  d4CF4km1rUQ: 'High School in Jakarta',
  'qx5PUE-pxVM': 'Vintage',
  OXtZfPZIex4: 'Every Summertime',
  dfzDQChhWZo: 'Blue Moon'
};

let currentVideoId = null;

function updatePlayingUI(){
  const playing = !!currentVideoId;

  // spotlight button
  if(bgPlayToggle){
    const isSpotlightTrack = currentVideoId === 'DropwjmHtoo';
    bgPlayToggle.classList.toggle('is-playing', isSpotlightTrack);
    bgPlayToggle.textContent = isSpotlightTrack ? '⏸ pause background music' : '♫ play in background';
  }

  // mood song buttons
  document.querySelectorAll('.mood-song').forEach(btn => {
    btn.classList.toggle('is-playing', btn.dataset.video === currentVideoId);
  });

  // floating now-playing bar
  if(playing){
    nowPlayingBar.hidden = false;
    nowPlayingLabel.textContent = trackLibrary[currentVideoId] || 'playing';
  } else {
    nowPlayingBar.hidden = true;
  }
}

function playTrack(videoId){
  bgFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}`;
  currentVideoId = videoId;
  updatePlayingUI();
}

function stopTrack(){
  bgFrame.src = '';
  currentVideoId = null;
  updatePlayingUI();
}

if(bgPlayToggle){
  bgPlayToggle.addEventListener('click', () => {
    if(currentVideoId === 'DropwjmHtoo'){
      stopTrack();
    } else {
      playTrack('DropwjmHtoo');
    }
  });
}

if(nowPlayingStop){
  nowPlayingStop.addEventListener('click', stopTrack);
}

// ---------- Mood picker ----------
const moodData = {
  heartbreak: {
    label: 'heartbreak',
    color: '#E8A0A0',
    text: "The kind of songs you play right after it ends — not to feel better, just to feel it fully, all the way through.",
    songs: [
      { title: 'Oceans & Engines — Nicole (2022)', video: 'DropwjmHtoo' },
      { title: 'Switchblade — Moonchild (2020)', video: 'PhXOcId57CY' }
    ]
  },
  longing: {
    label: 'longing',
    color: '#C9B8DB',
    text: "Distance turned into melody — the particular ache of wanting someone who isn't in the room with you.",
    songs: [
      { title: 'Selene — Moonchild (2020)', video: 'OkOohmpromQ' },
      { title: 'Backburner — Nicole (2022)', video: 'qYwsPx-ryxk' }
    ]
  },
  growth: {
    label: 'self-growth',
    color: '#D9C36A',
    text: "The quiet, unglamorous work of becoming someone new, told one uncomfortably honest verse at a time.",
    songs: [
      { title: 'Strong Girl — Buzz (2024)', video: 'IFmK1-WR3zU' },
      { title: 'Plot Twist — Moonchild (2020)', video: 'rX2iFcmJyzw' }
    ]
  },
  nostalgia: {
    label: 'nostalgia',
    color: '#F4EDE4',
    text: "Jakarta afternoons, old bedrooms, versions of yourself you've already outgrown but still miss.",
    songs: [
      { title: 'High School in Jakarta — Nicole (2022)', video: 'd4CF4km1rUQ' },
      { title: 'Vintage — Zephyr (2018)', video: 'qx5PUE-pxVM' }
    ]
  },
  hope: {
    label: 'hope',
    color: '#9FD8C0',
    text: "Small, stubborn hope — the kind that shows up quietly, after everything else has already been said.",
    songs: [
      { title: 'Every Summertime — single (2021)', video: 'OXtZfPZIex4' },
      { title: 'Blue Moon — Buzz (2024)', video: 'dfzDQChhWZo' }
    ]
  }
};

const moodButtons = document.querySelectorAll('.mood-btn');
const moodName = document.getElementById('moodName');
const moodText = document.getElementById('moodText');
const moodSongs = document.getElementById('moodSongs');
const moodDisplay = document.getElementById('moodDisplay');
const root = document.documentElement;

function renderMood(data){
  moodName.textContent = data.label;
  moodText.textContent = data.text;
  moodSongs.innerHTML = data.songs
    .map(s => `<button type="button" class="mood-song" data-video="${s.video}">${s.title}</button>`)
    .join('');
  root.style.setProperty('--accent', data.color);
  root.style.setProperty('--accent-soft', data.color + '40');
  updatePlayingUI();
}

// event delegation: handle clicks on any mood-song button, even after re-render
moodSongs.addEventListener('click', (e) => {
  const btn = e.target.closest('.mood-song');
  if(!btn) return;
  const videoId = btn.dataset.video;
  if(currentVideoId === videoId){
    stopTrack();
  } else {
    playTrack(videoId);
  }
});

moodButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    moodButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMood(moodData[btn.dataset.mood]);
  });
});

// render the default mood's songs on page load
renderMood(moodData.heartbreak);

// ---------- Favorites ----------
const albumInfo = {
  zephyr: { title: 'Zephyr', year: '2018', tag: 'debut EP · early sketches', cover: 'zephyr-cover.jpg' },
  moonchild: { title: 'Moonchild', year: '2020', tag: 'concept album · sci-fi lullaby', cover: 'moonchild-cover.jpg' },
  nicole: { title: 'Nicole', year: '2022', tag: 'self-titled · diary entries', cover: 'nicole-cover.jpg' },
  buzz: { title: 'Buzz', year: '2024', tag: 'folk-rock · identity crisis', cover: 'buzz-cover.jpg' }
};

function loadFavorites(){
  try{
    return JSON.parse(localStorage.getItem('moonchild_favorites') || '{"albums":[],"tracks":[]}');
  } catch(e){
    return { albums: [], tracks: [] };
  }
}

function saveFavorites(favs){
  localStorage.setItem('moonchild_favorites', JSON.stringify(favs));
}

function renderFavorites(){
  const favs = loadFavorites();
  const grid = document.getElementById('favoritesGrid');
  const empty = document.getElementById('favoritesEmpty');
  if(!grid) return;

  const hasAny = favs.albums.length > 0 || favs.tracks.length > 0;
  empty.hidden = hasAny;
  grid.innerHTML = '';

  favs.albums.forEach(albumKey => {
    const info = albumInfo[albumKey];
    if(!info) return;
    const card = document.createElement('div');
    card.className = 'record';
    card.innerHTML = `
      <div class="fav-star active" onclick="toggleFavorite('${albumKey}', this)">
        <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.5L21 9.3l-5 4.6L17.5 21 12 17.5 6.5 21 8 13.9l-5-4.6 6.1-0.8z"/></svg>
      </div>
      <div class="img-slot cover-slot"><img src="${info.cover}" alt="${info.title} cover"></div>
      <div class="year">${info.year}</div>
      <h3>${info.title}</h3>
      <div class="mood-tag">${info.tag}</div>
    `;
    grid.appendChild(card);
  });

  favs.tracks.forEach(track => {
    const card = document.createElement('div');
    card.className = 'record';
    card.innerHTML = `
      <div class="fav-star active" onclick="toggleFavoriteTrack('${track.id}', '${track.title}', this)">
        <svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.5L21 9.3l-5 4.6L17.5 21 12 17.5 6.5 21 8 13.9l-5-4.6 6.1-0.8z"/></svg>
      </div>
      <div class="year">track</div>
      <h3>${track.title}</h3>
      <div class="mood-tag">spotlight track</div>
    `;
    grid.appendChild(card);
  });
}

function toggleFavorite(albumKey, starEl){
  const favs = loadFavorites();
  const idx = favs.albums.indexOf(albumKey);
  if(idx === -1){
    favs.albums.push(albumKey);
  } else {
    favs.albums.splice(idx, 1);
  }
  saveFavorites(favs);
  syncStarButtons();
  renderFavorites();
}

function toggleFavoriteTrack(trackId, trackTitle, starEl){
  const favs = loadFavorites();
  const idx = favs.tracks.findIndex(t => t.id === trackId);
  if(idx === -1){
    favs.tracks.push({ id: trackId, title: trackTitle });
  } else {
    favs.tracks.splice(idx, 1);
  }
  saveFavorites(favs);
  syncStarButtons();
  renderFavorites();
}

function syncStarButtons(){
  const favs = loadFavorites();
  document.querySelectorAll('.fav-star[data-album]').forEach(el => {
    el.classList.toggle('active', favs.albums.includes(el.dataset.album));
  });
  document.querySelectorAll('.fav-star[data-track]').forEach(el => {
    el.classList.toggle('active', favs.tracks.some(t => t.id === el.dataset.track));
  });
}

syncStarButtons();
renderFavorites();

// ---------- Quiz ----------
const quizQuestions = [
  {
    q: "when things get hard, you tend to —",
    options: [
      { text: 'write it all down, unfiltered', album: 'nicole' },
      { text: 'go quiet and process alone', album: 'moonchild' },
      { text: 'get in the car and just drive', album: 'buzz' },
      { text: 'pretend it\'s fine and keep moving', album: 'zephyr' }
    ]
  },
  {
    q: "your ideal Friday night is —",
    options: [
      { text: 'a long drive with no destination', album: 'buzz' },
      { text: 'alone with headphones and the lights off', album: 'moonchild' },
      { text: 'texting one person everything on your mind', album: 'nicole' },
      { text: 'just staying in, low-key, unsure what you want', album: 'zephyr' }
    ]
  },
  {
    q: "you're most yourself when —",
    options: [
      { text: 'no one is performing, just being honest', album: 'nicole' },
      { text: 'you\'re somewhere new, half-lost', album: 'buzz' },
      { text: 'you\'re inside your own head, world-building', album: 'moonchild' },
      { text: 'you\'re still figuring out who that even is', album: 'zephyr' }
    ]
  },
  {
    q: "a breakup for you would sound like —",
    options: [
      { text: 'quiet, aching, dreamlike', album: 'moonchild' },
      { text: 'blunt, specific, diary-entry honest', album: 'nicole' },
      { text: 'restless, on-the-move, unresolved', album: 'buzz' },
      { text: 'a little unsure how to feel yet', album: 'zephyr' }
    ]
  },
  {
    q: "pick a color palette —",
    options: [
      { text: 'deep blues and moonlight silver', album: 'moonchild' },
      { text: 'warm rust and denim', album: 'buzz' },
      { text: 'soft neutrals, close-up and personal', album: 'nicole' },
      { text: 'pale pastels, still finding its shape', album: 'zephyr' }
    ]
  },
  {
    q: "what are you most afraid of right now?",
    options: [
      { text: 'losing myself in someone else', album: 'moonchild' },
      { text: 'being truly seen and it not being enough', album: 'nicole' },
      { text: 'staying the same forever', album: 'buzz' },
      { text: 'not knowing who I am yet', album: 'zephyr' }
    ]
  },
  {
    q: "how would a friend describe your energy lately?",
    options: [
      { text: 'dreamy, a little far away', album: 'moonchild' },
      { text: 'open book, brutally honest', album: 'nicole' },
      { text: 'in flux, chasing something', album: 'buzz' },
      { text: 'still sketching things out', album: 'zephyr' }
    ]
  }
];

const quizResults = {
  zephyr: {
    title: 'Zephyr',
    text: "You're in your early-sketches era — still figuring out the shape of things, a little rough around the edges, but already honest about it. Nothing about you is fully settled yet, and that's the point.",
    cover: 'zephyr-cover.jpg'
  },
  moonchild: {
    title: 'Moonchild',
    text: "You process the world through a dreamlike, private lens — building your own mythology around what hurts instead of stating it plainly. Sound is your shelter.",
    cover: 'moonchild-cover.jpg'
  },
  nicole: {
    title: 'Nicole',
    text: "You say the true thing plainly, unguarded, diary-entry honest. No concept album distance for you — just direct, personal, and specific.",
    cover: 'nicole-cover.jpg'
  },
  buzz: {
    title: 'Buzz',
    text: "You're in your identity-crisis-on-the-road era — restless, a little unresolved, figuring it out in real time instead of waiting for the answer first.",
    cover: 'buzz-cover.jpg'
  }
};

let quizIndex = 0;
let quizTally = { zephyr: 0, moonchild: 0, nicole: 0, buzz: 0 };

function renderQuizQuestion(){
  const q = quizQuestions[quizIndex];
  document.getElementById('quizProgress').textContent = `question ${quizIndex + 1} of ${quizQuestions.length}`;
  document.getElementById('quizQuestion').textContent = q.q;
  const optionsEl = document.getElementById('quizOptions');
  optionsEl.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.type = 'button';
    btn.textContent = opt.text;
    btn.addEventListener('click', () => {
      quizTally[opt.album]++;
      quizIndex++;
      if(quizIndex < quizQuestions.length){
        renderQuizQuestion();
      } else {
        showQuizResult();
      }
    });
    optionsEl.appendChild(btn);
  });
}

function showQuizResult(){
  const winner = Object.keys(quizTally).reduce((a, b) => quizTally[a] >= quizTally[b] ? a : b);
  const result = quizResults[winner];
  document.getElementById('quizCard').hidden = true;
  const resultCard = document.getElementById('quizResultCard');
  resultCard.hidden = false;
  document.getElementById('quizResultTitle').textContent = result.title;
  document.getElementById('quizResultText').textContent = result.text;
  const coverEl = document.getElementById('quizResultCover');
  coverEl.innerHTML = `<img src="${result.cover}" alt="${result.title} cover">`;

  // if logged in, save this result so their avatar gets a matching colored ring
  if(typeof currentUser !== 'undefined' && currentUser && typeof supabaseClient !== 'undefined' && supabaseClient){
    supabaseClient.from('profiles').update({ quiz_result: winner }).eq('id', currentUser.id)
      .then(() => { if(typeof refreshAuthUI === 'function') refreshAuthUI(); });
  }
}

document.getElementById('quizRetakeBtn').addEventListener('click', () => {
  quizIndex = 0;
  quizTally = { zephyr: 0, moonchild: 0, nicole: 0, buzz: 0 };
  document.getElementById('quizResultCard').hidden = true;
  document.getElementById('quizCard').hidden = false;
  renderQuizQuestion();
});

document.getElementById('quizShareBtn').addEventListener('click', () => {
  const winner = Object.keys(quizTally).reduce((a, b) => quizTally[a] >= quizTally[b] ? a : b);
  const result = quizResults[winner];

  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1000;
  const c = canvas.getContext('2d');

  const grad = c.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0d1030');
  grad.addColorStop(1, '#1a2456');
  c.fillStyle = grad;
  c.fillRect(0, 0, canvas.width, canvas.height);

  c.fillStyle = '#d9c36a';
  c.font = '20px monospace';
  c.textAlign = 'center';
  c.fillText('YOUR NIKI ERA IS', canvas.width / 2, 380);

  c.fillStyle = '#e8a0a0';
  c.font = 'italic 64px Georgia';
  c.fillText(result.title, canvas.width / 2, 460);

  c.fillStyle = '#f4ede4';
  c.font = '18px sans-serif';
  wrapText(c, result.text, canvas.width / 2, 520, 560, 30);

  c.fillStyle = '#c9b8db';
  c.font = '14px monospace';
  c.fillText('moonchild diaries — a NIKI fan page', canvas.width / 2, 940);

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    c.drawImage(img, canvas.width/2 - 150, 120, 300, 300);
    downloadCanvas();
  };
  img.onerror = downloadCanvas;
  img.src = result.cover;

  function downloadCanvas(){
    const link = document.createElement('a');
    link.download = `my-niki-era-${result.title.toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
});

function wrapText(context, text, x, y, maxWidth, lineHeight){
  const words = text.split(' ');
  let line = '';
  let curY = y;
  for(let n = 0; n < words.length; n++){
    const testLine = line + words[n] + ' ';
    if(context.measureText(testLine).width > maxWidth && n > 0){
      context.fillText(line, x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line, x, curY);
}

renderQuizQuestion();

// ---------- Guestbook (Supabase) ----------
const SUPABASE_URL = 'https://hwpessocyrascxzcaamd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cGVzc29jeXJhc2N4emNhYW1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMjc0MjIsImV4cCI6MjA5OTYwMzQyMn0.uV3TZGrmbQyn4oy8cpL16DAbQpGsjw0b0IaMW6sfq04';

let supabaseClient = null;
if(window.supabase){
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

const noteInput = document.getElementById('noteInput');
const noteCharCount = document.getElementById('noteCharCount');
const noteSubmitBtn = document.getElementById('noteSubmitBtn');
const noteStatus = document.getElementById('noteStatus');
const notesGrid = document.getElementById('notesGrid');

if(noteInput){
  noteInput.addEventListener('input', () => {
    noteCharCount.textContent = `${noteInput.value.length} / 120`;
  });
}

function shuffleArray(arr){
  const a = arr.slice();
  for(let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function loadNotes(){
  if(!supabaseClient || !notesGrid) return;
  const { data, error } = await supabaseClient
    .from('notes')
    .select('message')
    .order('created_at', { ascending: false })
    .limit(500);

  if(error){
    notesGrid.innerHTML = `<p style="opacity:0.5; font-family:'Space Mono',monospace; font-size:0.75rem;">couldn't load notes right now</p>`;
    return;
  }

  const randomThirty = shuffleArray(data || []).slice(0, 30);
  notesGrid.innerHTML = randomThirty.map(n => `
    <div class="note-card">
      <div class="note-moon"></div>
      <p></p>
    </div>
  `).join('');

  // set text safely (avoid HTML injection)
  const cards = notesGrid.querySelectorAll('.note-card p');
  randomThirty.forEach((n, i) => {
    if(cards[i]) cards[i].textContent = n.message;
  });

  if(randomThirty.length === 0){
    notesGrid.innerHTML = `<p style="opacity:0.5; font-family:'Space Mono',monospace; font-size:0.75rem;">no notes yet — be the first to leave one</p>`;
  }
}

if(noteSubmitBtn){
  noteSubmitBtn.addEventListener('click', async () => {
    const message = noteInput.value.trim();
    if(!message){
      noteStatus.textContent = 'write something first';
      return;
    }
    if(!supabaseClient){
      noteStatus.textContent = 'guestbook not connected yet';
      return;
    }
    noteSubmitBtn.disabled = true;
    noteStatus.textContent = 'posting...';

    const notePayload = { message };
    if(currentUser){ notePayload.user_id = currentUser.id; }
    const { error } = await supabaseClient.from('notes').insert(notePayload);

    noteSubmitBtn.disabled = false;
    if(error){
      noteStatus.textContent = 'something went wrong — try again';
    } else {
      noteInput.value = '';
      noteCharCount.textContent = '0 / 120';
      noteStatus.textContent = 'posted! ✓';
      loadNotes();
    }
  });
}

loadNotes();

// ---------- Auth + Moon Avatar ----------
let currentUser = null;
let currentProfile = null;

function paintMoon(el, phase, colorName, direction){
  const colorMap = {
    rose: '#e8a0a0', lavender: '#c9b8db', gold: '#d9c36a',
    twilight: '#4a5aa8', moonlight: '#f4ede4'
  };
  const hex = colorMap[colorName] || colorMap.lavender;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.style.background = `radial-gradient(circle at 35% 30%, ${hex}, #2a2050 75%)`;

  const size = el.clientWidth || 56;
  const fractions = { new: 0, crescent: 0.32, half: 0.5, gibbous: 0.68, full: 1.15 };
  const offsetPx = Math.round(size * (fractions[phase] ?? 0.5));
  const dir = direction === -1 ? -1 : 1;
  el.style.boxShadow = `inset ${dir * offsetPx}px 0 0 0 #0d1030`;
}

function randomMoonAttrs(){
  const phases = ['new','crescent','half','gibbous','full'];
  const colors = ['rose','lavender','gold','twilight','moonlight'];
  return {
    phase: phases[Math.floor(Math.random() * phases.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    direction: Math.random() < 0.5 ? 1 : -1
  };
}

async function refreshAuthUI(){
  if(!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  currentUser = session ? session.user : null;

  const loginTriggerBtn = document.getElementById('loginTrigger');
  const navAvatar = document.getElementById('navAvatar');

  if(!currentUser){
    currentProfile = null;
    loginTriggerBtn.hidden = false;
    navAvatar.hidden = true;
    document.getElementById('accountDropdown').hidden = true;
    return;
  }

  loginTriggerBtn.hidden = true;
  navAvatar.hidden = false;

  let { data: profile, error: profileError } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if(profileError && profileError.code === 'PGRST116'){
    // No profile row exists for this account (e.g. it predates the
    // profiles trigger, or the trigger didn't fire). Without this,
    // every future settings save would silently match 0 rows. Create
    // one now instead of failing silently.
    const fallback = randomMoonAttrs();
    const { data: created, error: createError } = await supabaseClient
      .from('profiles')
      .insert({
        id: currentUser.id,
        moon_phase: fallback.phase,
        moon_color: fallback.color,
        moon_direction: fallback.direction
      })
      .select()
      .single();
    if(createError){
      console.error('Could not create missing profile row:', createError.message);
    } else {
      profile = created;
    }
  } else if(profileError){
    console.error('Profile fetch failed:', profileError.message);
  }

  currentProfile = profile;
  if(profile){
    applyAvatarRing(navAvatar, profile.quiz_result);
    paintMoon(navAvatar, profile.moon_phase, profile.moon_color, profile.moon_direction);
    document.getElementById('dropdownName').textContent = profile.display_name;
    document.getElementById('dropdownPhase').textContent = `${profile.moon_phase} · ${profile.moon_color}`;
    const dropdownAvatarEl = document.getElementById('dropdownAvatar');
    applyAvatarRing(dropdownAvatarEl, profile.quiz_result);
    paintMoon(dropdownAvatarEl, profile.moon_phase, profile.moon_color, profile.moon_direction);
  }
}

function applyAvatarRing(el, quizResult){
  el.classList.remove('ring-zephyr', 'ring-moonchild', 'ring-nicole', 'ring-buzz');
  if(quizResult){ el.classList.add(`ring-${quizResult}`); }
}

// ---------- Auth modal ----------
const authBackdrop = document.getElementById('authBackdrop');
const loginTrigger = document.getElementById('loginTrigger');
const authClose = document.getElementById('authClose');

if(loginTrigger){
  loginTrigger.addEventListener('click', () => { authBackdrop.hidden = false; });
}
if(authClose){
  authClose.addEventListener('click', () => { authBackdrop.hidden = true; });
}
if(authBackdrop){
  authBackdrop.addEventListener('click', (e) => { if(e.target === authBackdrop) authBackdrop.hidden = true; });
}

document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const isLogin = tab.dataset.tab === 'login';
    document.getElementById('loginForm').hidden = !isLogin;
    document.getElementById('signupForm').hidden = isLogin;
  });
});

const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('loginStatus');
    if(!supabaseClient){
      status.textContent = "connection isn't ready — check your internet and try again";
      return;
    }
    status.textContent = 'logging in...';
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if(error){
      status.textContent = error.message;
    } else {
      // apply any name chosen at signup time that couldn't be saved earlier
      // (e.g. if email confirmation was required and there was no session yet)
      const pendingName = localStorage.getItem('moonchild_pending_name_' + email);
      if(pendingName){
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if(sessionData.session){
          await supabaseClient.from('profiles').update({ display_name: pendingName }).eq('id', sessionData.session.user.id);
        }
        localStorage.removeItem('moonchild_pending_name_' + email);
      }
      status.textContent = 'welcome back ✓';
      await refreshAuthUI();
      setTimeout(() => { authBackdrop.hidden = true; status.textContent = ''; loginForm.reset(); }, 700);
    }
  });
}

const signupForm = document.getElementById('signupForm');
if(signupForm){
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('signupStatus');
    if(!supabaseClient){
      status.textContent = "connection isn't ready — check your internet and try again";
      return;
    }
    status.textContent = 'creating account...';
    const name = document.getElementById('signupName').value.trim() || 'a fan';
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if(error){
      status.textContent = error.message;
      return;
    }

    // save the chosen name locally, keyed by email, so it can be applied
    // the moment there's an actual session (right now, or at next login
    // if email confirmation is required first).
    localStorage.setItem('moonchild_pending_name_' + email, name);

    // if email confirmation is required, there's no session yet —
    // the account exists, but the person needs to confirm before logging in.
    if(!data.session){
      status.textContent = 'check your email to confirm your account, then log in ✓';
      return;
    }

    const { error: nameError } = await supabaseClient.from('profiles').update({ display_name: name }).eq('id', data.user.id);
    if(nameError){ console.warn('display name save failed:', nameError.message); }
    localStorage.removeItem('moonchild_pending_name_' + email);

    status.textContent = 'account created ✓';
    await refreshAuthUI();
    setTimeout(() => { authBackdrop.hidden = true; status.textContent = ''; signupForm.reset(); }, 700);
  });
}

// ---------- Account dropdown ----------
const navAvatarEl = document.getElementById('navAvatar');
const accountDropdown = document.getElementById('accountDropdown');
if(navAvatarEl){
  navAvatarEl.addEventListener('click', () => {
    accountDropdown.hidden = !accountDropdown.hidden;
  });
}
document.addEventListener('click', (e) => {
  if(accountDropdown && !accountDropdown.hidden){
    if(!accountDropdown.contains(e.target) && e.target !== navAvatarEl){
      accountDropdown.hidden = true;
    }
  }
});

const logoutBtn = document.getElementById('logoutBtn');
if(logoutBtn){
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    accountDropdown.hidden = true;
    await refreshAuthUI();
  });
}

// ---------- Settings modal ----------
const settingsBackdrop = document.getElementById('settingsBackdrop');
const openSettingsBtn = document.getElementById('openSettingsBtn');
const settingsClose = document.getElementById('settingsClose');

if(openSettingsBtn){
  openSettingsBtn.addEventListener('click', () => {
    accountDropdown.hidden = true;
    settingsBackdrop.hidden = false;
    if(currentProfile){
      document.getElementById('settingsName').value = currentProfile.display_name;
      paintMoon(document.getElementById('settingsAvatar'), currentProfile.moon_phase, currentProfile.moon_color, currentProfile.moon_direction);
    }
  });
}
if(settingsClose){
  settingsClose.addEventListener('click', () => {
    settingsBackdrop.hidden = true;
    pendingMoon = null; // clear any previewed-but-unsaved reroll
  });
}
if(settingsBackdrop){
  settingsBackdrop.addEventListener('click', (e) => {
    if(e.target === settingsBackdrop){
      settingsBackdrop.hidden = true;
      pendingMoon = null; // clear any previewed-but-unsaved reroll
    }
  });
}

let pendingMoon = null;
const rerollBtn = document.getElementById('rerollBtn');
if(rerollBtn){
  rerollBtn.addEventListener('click', () => {
    pendingMoon = randomMoonAttrs();
    paintMoon(document.getElementById('settingsAvatar'), pendingMoon.phase, pendingMoon.color, pendingMoon.direction);
  });
}

const saveSettingsBtn = document.getElementById('saveSettingsBtn');
if(saveSettingsBtn){
  saveSettingsBtn.addEventListener('click', async () => {
    const status = document.getElementById('settingsStatus');
    const newName = document.getElementById('settingsName').value.trim() || 'a fan';
    const updates = { display_name: newName };
    if(pendingMoon){
      updates.moon_phase = pendingMoon.phase;
      updates.moon_color = pendingMoon.color;
      updates.moon_direction = pendingMoon.direction;
    }
    if(!currentUser){
      status.textContent = 'please log in again first';
      return;
    }
    status.textContent = 'saving...';
    const { data: updatedRows, error } = await supabaseClient
      .from('profiles')
      .update(updates)
      .eq('id', currentUser.id)
      .select();

    if(error){
      status.textContent = error.message;
    } else if(!updatedRows || updatedRows.length === 0){
      // no error, but nothing actually changed — usually means the profile
      // row wasn't found, or the session no longer matches this account.
      status.textContent = "couldn't save — try logging out and back in";
    } else {
      status.textContent = 'saved ✓';
      pendingMoon = null;
      await refreshAuthUI();
      setTimeout(() => { settingsBackdrop.hidden = true; status.textContent = ''; }, 700);
    }
  });
}

refreshAuthUI();