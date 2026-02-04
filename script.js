document.addEventListener('DOMContentLoaded', () => {
  const yes = document.getElementById('yesBtn');
  const no = document.getElementById('noBtn');
  const buttons = document.getElementById('buttons');
  const gifContainer = document.getElementById('gifContainer');

  function showGif() {
    buttons.classList.add('hidden');
    gifContainer.classList.remove('hidden');
    startSticker();
  }

  yes.addEventListener('click', showGif);

  // Ensure the "No" button cannot be clicked — it will move away.
  no.addEventListener('click', (e) => { e.preventDefault(); moveButton(); });
  no.addEventListener('mousedown', (e) => { e.preventDefault(); moveButton(); });
  no.addEventListener('keydown', (e) => e.preventDefault());

  // Place the button using fixed coordinates so we can move it freely
  no.style.position = 'fixed';

  function moveButtonTo(x, y) {
    const bw = no.offsetWidth;
    const bh = no.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const nx = Math.max(0, Math.min(x, vw - bw));
    const ny = Math.max(0, Math.min(y, vh - bh));
    no.style.left = nx + 'px';
    no.style.top = ny + 'px';
  }

  function randomPosition() {
    const bw = no.offsetWidth;
    const bh = no.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const x = Math.random() * (vw - bw);
    const y = Math.random() * (vh - bh);
    return { x, y };
  }

  function moveButton() {
    const p = randomPosition();
    moveButtonTo(p.x, p.y);
  }

  // If the mouse comes close, move the button away from the cursor
  document.addEventListener('mousemove', (e) => {
    const rect = no.getBoundingClientRect();
    const bx = rect.left + rect.width / 2;
    const by = rect.top + rect.height / 2;
    const dx = e.clientX - bx;
    const dy = e.clientY - by;
    const dist = Math.hypot(dx, dy);
    if (dist < 140) {
      // move to a position biased away from the cursor
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      let x = (e.clientX < vw / 2)
        ? Math.random() * (vw - rect.width - vw / 2) + vw / 2
        : Math.random() * (vw / 2 - rect.width);
      let y = (e.clientY < vh / 2)
        ? Math.random() * (vh - rect.height - vh / 2) + vh / 2
        : Math.random() * (vh / 2 - rect.height);
      moveButtonTo(x, y);
    }
  });

  // Defensive: prevent keyboard and touch from triggering the No button
  no.addEventListener('touchstart', (e) => { e.preventDefault(); moveButton(); }, { passive: false });

  // Place the button initially next to the "Sí" button
  function placeNextToYes() {
    // ensure layout measurements are ready
    const rect = yes.getBoundingClientRect();
    const gap = 12; // gap in px between buttons
    // position to the right of the yes button; clamp will happen in moveButtonTo
    const x = rect.right + gap;
    const y = rect.top;
    moveButtonTo(x, y);
  }

  // Initial placement: put 'No' next to 'Sí'
  // run after a tick to ensure fonts and layout are settled
  setTimeout(placeNextToYes, 0);

  // Keep inside on resize: try to keep the 'No' next to 'Sí'
  window.addEventListener('resize', () => {
    setTimeout(placeNextToYes, 0);
  });

  // --- Sticker (salvapantallas) logic ---
  const sticker = document.getElementById('sticker');
  let animId = null;
  function startSticker() {
    if (!sticker) return;

    const start = () => {
      // ensure visible before measuring
      sticker.classList.remove('hidden');
      // run on next frame so layout is updated
      requestAnimationFrame(() => {
        const sw = sticker.offsetWidth || 110;
        const sh = sticker.offsetHeight || 110;
        let x = (window.innerWidth - sw) / 2;
        let y = (window.innerHeight - sh) / 2;
        // random initial velocity (slower)
        const STICKER_SPEED = 0.45; // lower values -> slower movement
        let vx = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1) * STICKER_SPEED;
        let vy = (Math.random() * 2 + 1) * (Math.random() < 0.5 ? 1 : -1) * STICKER_SPEED;

        function step() {
          x += vx;
          y += vy;
          const maxX = window.innerWidth - sw;
          const maxY = window.innerHeight - sh;
          if (x <= 0) { x = 0; vx = Math.abs(vx); }
          if (y <= 0) { y = 0; vy = Math.abs(vy); }
          if (x >= maxX) { x = maxX; vx = -Math.abs(vx); }
          if (y >= maxY) { y = maxY; vy = -Math.abs(vy); }
          sticker.style.left = x + 'px';
          sticker.style.top = y + 'px';
          animId = requestAnimationFrame(step);
        }

        // start the loop
        if (animId) cancelAnimationFrame(animId);
        animId = requestAnimationFrame(step);

        // keep sticker inside on resize
        window.addEventListener('resize', () => {
          const sw2 = sticker.offsetWidth || sw;
          const sh2 = sticker.offsetHeight || sh;
          x = Math.min(x, window.innerWidth - sw2);
          y = Math.min(y, window.innerHeight - sh2);
        });
      });
    };

    // If image not loaded yet (common on mobile), wait for load before starting
    if (sticker.complete && sticker.naturalWidth !== 0) {
      start();
    } else {
      sticker.onload = start;
      // fallback: still attempt to start if image fails to load
      sticker.onerror = start;
      // make visible as early hint
      sticker.classList.remove('hidden');
    }
  }
});
