document.addEventListener('DOMContentLoaded', () => {
  const yes = document.getElementById('yesBtn');
  const no = document.getElementById('noBtn');
  const buttons = document.getElementById('buttons');
  const gifContainer = document.getElementById('gifContainer');

  function showGif() {
    buttons.classList.add('hidden');
    gifContainer.classList.remove('hidden');
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
});
