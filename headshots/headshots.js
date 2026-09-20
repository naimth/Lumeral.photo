(() => {
  'use strict';
  const body = document.body;
  const stage = document.querySelector('.stage');
  const cards = [...document.querySelectorAll('.portrait')];
  const count = cards.length;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const dialog = document.querySelector('.lightbox');
  const number = document.querySelector('#current-number');
  const title = document.querySelector('#current-title');
  const strip = document.querySelector('.filmstrip');
  const spatialButton = document.querySelector('#spatial-view');
  const gridButton = document.querySelector('#grid-view');
  let selected = 0, position = 0, target = 0, frame = 0, grid = motion.matches;
  let pointer = null, dragged = false, opener = null;
  const wrap = n => ((n % count) + count) % count;
  const pad = n => String(n + 1).padStart(2, '0');
  const thumbs = cards.map((card, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Show portrait ${i + 1}: ${card.dataset.title}`);
    button.setAttribute('aria-pressed', String(i === 0));
    const img = card.querySelector('img').cloneNode();
    img.alt = ''; img.loading = 'lazy'; img.removeAttribute('fetchpriority');
    button.append(img);
    button.addEventListener('click', () => select(i));
    strip.append(button);
    return button;
  });
  function paint() {
    if (grid) return;
    const width = cards[0].offsetWidth;
    const compact = stage.clientWidth < 600;
    cards.forEach((card, i) => {
      let offset = wrap(i - position + count / 2) - count / 2;
      const a = Math.abs(offset);
      const x = offset * width * (compact ? .88 : .97);
      const z = -a * width * (compact ? .65 : .60);
      const angle = Math.sign(offset) * Math.min(a, 1.2) * (compact ? -25 : -32);
      card.style.transform = `translate3d(${x}px,${Math.min(a,3)*11}px,${z}px) rotateY(${angle}deg)`;
      card.style.opacity = a > 3.6 ? '0' : String(Math.max(.38,1 - a*.14));
      card.style.visibility = a > 3.6 ? 'hidden' : 'visible';
      card.style.zIndex = String(20 - Math.round(a * 2));
    });
  }
  function tick() {
    frame = 0;
    const delta = target - position;
    if (motion.matches || Math.abs(delta) < .001) { position = target; paint(); return; }
    position += delta * .105;
    paint(); frame = requestAnimationFrame(tick);
  }
  function animate() { if (!frame) frame = requestAnimationFrame(tick); }
  function updateSelection() {
    selected = wrap(Math.round(target));
    number.textContent = pad(selected);
    title.textContent = cards[selected].dataset.title;
    cards.forEach((card, i) => {
      card.classList.toggle('is-active', i === selected);
      card.tabIndex = grid || i === selected ? 0 : -1;
    });
    thumbs.forEach((thumb, i) => thumb.setAttribute('aria-pressed', String(i === selected)));
    // Warm the immediately adjacent portraits for the next interaction.
    [-1, 0, 1].forEach(delta => { cards[wrap(selected + delta)].querySelector('img').loading = 'eager'; });
  }
  function select(i) {
    const delta = wrap(i - wrap(Math.round(target)) + count / 2) - count / 2;
    target = Math.round(target) + delta;
    updateSelection(); animate();
  }
  function step(delta) { target = Math.round(target) + delta; updateSelection(); animate(); }
  function setGrid(value) {
    grid = value;
    body.classList.toggle('grid-mode', grid);
    gridButton.setAttribute('aria-pressed', String(grid));
    spatialButton.setAttribute('aria-pressed', String(!grid));
    stage.tabIndex = grid ? -1 : 0;
    stage.setAttribute('aria-label', grid ? 'All ten portraits. Select a portrait to view full size.' : 'Portrait gallery. Use left and right arrow keys to browse.');
    position = target;
    updateSelection(); paint();
  }
  function showImage() {
    const original = cards[selected].querySelector('img');
    const image = document.querySelector('#lightbox-image');
    image.src = original.src; image.alt = original.alt;
    document.querySelector('#lightbox-label').textContent = `${pad(selected)} / 10 — ${cards[selected].dataset.title}`;
  }
  function openViewer(i, trigger) {
    if (typeof dialog.showModal !== 'function') { location.href = cards[i].href; return; }
    select(i); opener = trigger;
    showImage(); dialog.showModal(); body.classList.add('viewer-open');
    document.querySelector('.close-lightbox').focus();
  }
  cards.forEach((card, i) => card.addEventListener('click', event => {
    event.preventDefault();
    if (dragged) { dragged = false; return; }
    if (grid || i === selected) openViewer(i, card); else select(i);
  }));
  stage.addEventListener('dragstart', event => event.preventDefault());
  stage.addEventListener('pointerdown', event => {
    if (grid || event.button !== 0) return;
    dragged = false;
    pointer = { id:event.pointerId, x:event.clientX, y:event.clientY, origin:position, horizontal:false };
    cancelAnimationFrame(frame); frame = 0;
  });
  stage.addEventListener('pointermove', event => {
    if (!pointer || pointer.id !== event.pointerId || grid) return;
    const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
    if (!pointer.horizontal && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) { pointer = null; animate(); return; }
    if (Math.abs(dx) > 8) {
      if (!pointer.horizontal) stage.setPointerCapture(event.pointerId);
      pointer.horizontal = true; dragged = true;
      position = pointer.origin - dx / (cards[0].offsetWidth * .9);
      target = position; paint();
    }
  });
  function finish(event) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const wasDrag = pointer.horizontal;
    pointer = null;
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    target = Math.round(target); updateSelection(); animate();
    if (wasDrag) setTimeout(() => { dragged = false; }, 0);
  }
  stage.addEventListener('pointerup', finish);
  stage.addEventListener('pointercancel', finish);
  window.addEventListener('pointerup', finish);
  document.querySelector('#previous').addEventListener('click', () => step(-1));
  document.querySelector('#next').addEventListener('click', () => step(1));
  spatialButton.addEventListener('click', () => setGrid(false));
  gridButton.addEventListener('click', () => setGrid(true));
  stage.addEventListener('keydown', event => {
    if (grid) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); step(event.key === 'ArrowRight' ? 1 : -1); stage.focus({preventScroll:true}); }
    if (event.key === 'Home') { event.preventDefault(); select(0); }
    if (event.key === 'End') { event.preventDefault(); select(count - 1); }
    if (event.key === 'Enter' && event.target === stage) { event.preventDefault(); openViewer(selected,stage); }
  });
  function viewerStep(delta) { step(delta); showImage(); }
  document.querySelector('.lightbox-previous').addEventListener('click', () => viewerStep(-1));
  document.querySelector('.lightbox-next').addEventListener('click', () => viewerStep(1));
  document.querySelector('.close-lightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); viewerStep(event.key === 'ArrowRight' ? 1 : -1); }
  });
  dialog.addEventListener('click', event => { if (event.target === dialog || event.target.classList.contains('lightbox-body')) dialog.close(); });
  dialog.addEventListener('close', () => {
    body.classList.remove('viewer-open');
    if (opener) (grid || opener === stage ? opener : cards[selected]).focus({preventScroll:true});
  });
  window.addEventListener('resize', paint, {passive:true});
  motion.addEventListener('change', () => { if (motion.matches) setGrid(true); });
  body.classList.add('enhanced');
  document.querySelectorAll('.view-switch,.gallery-controls,.filmstrip,.view-hint').forEach(element => { element.hidden = false; });
  setGrid(grid);
})();
