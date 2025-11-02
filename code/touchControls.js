(function() {
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) return;

  const style = document.createElement('style');
  style.textContent = `
    #joystick, #buttons { position: fixed; z-index: 10000; touch-action: none; }
    #joystick { left: 10vw; bottom: 12vh; width: 150px; height: 150px; border-radius: 50%; }
    #joystick-base, #joystick-stick {
      position: absolute; border-radius: 50%;
    }
    #joystick-base {
      width: 100%; height: 100%; background: rgba(255,255,255,0.1);
      border: 2px solid rgba(255,255,255,0.3);
    }
    #joystick-stick {
      width: 60px; height: 60px; left: 45px; top: 45px;
      background: rgba(255,255,255,0.3);
    }
    #buttons {
      right: 6vw; bottom: 10vh;
      display: flex; gap: 20px;
    }
    .btn {
      width: 70px; height: 70px;
      border-radius: 50%; background: rgba(255,255,255,0.3);
      text-align: center; line-height: 70px;
      font-size: 24px; font-weight: bold; color: white;
      border: 2px solid rgba(255,255,255,0.4);
      user-select: none;
    }
  `;
  document.head.appendChild(style);

  // Joystick
  const joy = document.createElement('div');
  joy.id = 'joystick';
  joy.innerHTML = '<div id="joystick-base"></div><div id="joystick-stick"></div>';
  document.body.appendChild(joy);
  const stick = joy.querySelector('#joystick-stick');
  let center = {x: 0, y: 0}, active = false;

  joy.addEventListener('touchstart', e => {
    const t = e.touches[0];
    center = {x: t.clientX, y: t.clientY};
    joy.style.left = center.x - 75 + 'px';
    joy.style.top = center.y - 75 + 'px';
    joy.style.display = 'block';
    active = true;
  });
  joy.addEventListener('touchmove', e => {
    if (!active) return;
    const t = e.touches[0];
    const dx = t.clientX - center.x, dy = t.clientY - center.y;
    const dist = Math.min(Math.sqrt(dx*dx+dy*dy), 60);
    const angle = Math.atan2(dy, dx);
    stick.style.left = 75 + Math.cos(angle)*dist - 30 + 'px';
    stick.style.top  = 75 + Math.sin(angle)*dist - 30 + 'px';
    const x = Math.cos(angle)*(dist/60), y = Math.sin(angle)*(dist/60);
    simulateKeys(x, y);
  });
  joy.addEventListener('touchend', () => {
    active = false;
    stick.style.left = '45px';
    stick.style.top  = '45px';
    releaseKeys();
  });

  // Buttons
  const buttons = document.createElement('div');
  buttons.id = 'buttons';
  buttons.innerHTML = `
    <div class="btn" id="btnA">A</div>
    <div class="btn" id="btnB">B</div>
  `;
  document.body.appendChild(buttons);
  const vibrate = () => navigator.vibrate?.(40);

  const map = { btnA: 'Space', btnB: 'KeyZ' };
  ['btnA', 'btnB'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('touchstart', () => {
      vibrate();
      sendKey(map[id], true);
    });
    el.addEventListener('touchend', () => sendKey(map[id], false));
  });

  function sendKey(code, down) {
    const e = new KeyboardEvent(down ? 'keydown' : 'keyup', { code });
    document.dispatchEvent(e);
  }
  function simulateKeys(x, y) {
    sendKey('ArrowLeft', x < -0.3);
    sendKey('ArrowRight', x > 0.3);
  }
  function releaseKeys() {
    ['ArrowLeft','ArrowRight'].forEach(k => sendKey(k,false));
  }
})();
