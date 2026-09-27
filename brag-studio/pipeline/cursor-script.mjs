/** Injected before the product loads. Headless Chrome has no OS cursor, so the recording draws one. */
export const CURSOR_SCRIPT = `(() => {
  const style = document.createElement('style');
  style.textContent = \`
    #brag-cursor, #brag-ripple {
      position: fixed; z-index: 2147483647; pointer-events: none;
      left: 0; top: 0;
    }
    #brag-cursor {
      width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%;
      border: 2px solid #fff; background: rgba(255, 89, 79, 0.92);
      box-shadow: 0 2px 10px rgba(0,0,0,.45);
    }
    #brag-cursor.down { background: #ffbd62; transform: scale(0.82); }
    #brag-ripple {
      width: 14px; height: 14px; margin: -7px 0 0 -7px; border-radius: 50%;
      border: 2px solid rgba(255, 189, 98, .95); opacity: 0;
    }
    #brag-ripple.go { animation: brag-rip .45s ease-out; }
    @keyframes brag-rip {
      from { opacity: .9; transform: scale(0.6); }
      to { opacity: 0; transform: scale(2.4); }
    }
  \`;
  const mount = () => {
    if (document.getElementById('brag-cursor')) return;
    document.documentElement.appendChild(style);
    const c = document.createElement('div');
    c.id = 'brag-cursor';
    const r = document.createElement('div');
    r.id = 'brag-ripple';
    document.body.appendChild(c);
    document.body.appendChild(r);
    window.addEventListener('mousemove', e => {
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
    }, true);
    window.addEventListener('mousedown', e => {
      c.classList.add('down');
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      r.classList.remove('go');
      void r.offsetWidth;
      r.classList.add('go');
    }, true);
    window.addEventListener('mouseup', () => c.classList.remove('down'), true);
  };
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);
})();`;
