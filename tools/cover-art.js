// 封面與 App 圖示產生器：在遊戲頁面（http://localhost:5173）的 console 執行，
// 會用遊戲裡的寫實水果繪圖（art / SKIN / FLESH）畫出「刀切水果」的封面。
// window.makeCoverArt() 會回傳 { cover, coverBg, icon, iconFg, iconBg, splash } 六張 canvas。
(() => {
  const rnd = seed => { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

  function background(g, w, h, cx, cy) {
    const R = Math.hypot(w, h) * 0.6;
    let gr = g.createRadialGradient(cx, cy, 0, cx, cy, R);
    gr.addColorStop(0, '#6a1b5c'); gr.addColorStop(0.45, '#33103f'); gr.addColorStop(1, '#0e0512');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    // 放射光芒
    g.save(); g.translate(cx, cy); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 18; i++) {
      g.rotate(Math.PI * 2 / 18);
      g.globalAlpha = i % 2 ? 0.05 : 0.09; g.fillStyle = '#ff9ec0';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(R, -R * 0.07); g.lineTo(R, R * 0.07); g.closePath(); g.fill();
    }
    g.restore();
    // 散景光點
    const r = rnd(7);
    for (let i = 0; i < 40; i++) {
      const x = r() * w, y = r() * h, s = (0.004 + r() * 0.02) * Math.min(w, h);
      g.globalAlpha = 0.05 + r() * 0.12; g.fillStyle = r() < 0.5 ? '#ffd6e5' : '#ffd166';
      g.beginPath(); g.arc(x, y, s, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  // 被切開的水果：沿著刀痕分成兩半，露出果肉
  function sliced(g, id, x, y, r, ang, gap, spin) {
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    for (const side of [-1, 1]) {
      g.save();
      g.translate(x + nx * side * gap, y + ny * side * gap);
      g.rotate(ang + side * spin);
      g.beginPath(); if (side < 0) g.rect(-r * 2, -r * 2, r * 4, r * 2); else g.rect(-r * 2, 0, r * 4, r * 2); g.clip();
      const sk = art('s', id, r), L = sk.logical;
      g.drawImage(sk, -L / 2, -L / 2, L, L);
      const fl = art('f', id, r), FL = fl.logical;
      g.scale(1, 0.5); g.drawImage(fl, -FL / 2, -FL / 2, FL, FL);
      g.restore();
    }
  }
  function whole(g, id, x, y, r, rot) {
    const sk = art('s', id, r), L = sk.logical;
    g.save(); g.translate(x, y); g.rotate(rot); g.drawImage(sk, -L / 2, -L / 2, L, L); g.restore();
  }

  // 主廚刀：刀刃金屬漸層 + 刀鋒高光 + 木頭刀柄與鉚釘
  function knife(g, x, y, ang, len) {
    const w = len * 0.17;
    g.save(); g.translate(x, y); g.rotate(ang);
    g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = len * 0.04; g.shadowOffsetY = len * 0.02;
    const blade = () => { g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(len * 0.9, -w / 2); g.quadraticCurveTo(len * 1.0, -w * 0.45, len, -w * 0.32); g.quadraticCurveTo(len * 0.86, w * 0.5, len * 0.52, w * 0.5); g.lineTo(0, w * 0.5); g.closePath(); };
    blade();
    let gr = g.createLinearGradient(0, -w / 2, 0, w / 2);
    gr.addColorStop(0, '#9aa6b2'); gr.addColorStop(0.35, '#eef2f6'); gr.addColorStop(0.6, '#b9c3cd'); gr.addColorStop(0.92, '#dfe6ee'); gr.addColorStop(1, '#ffffff');
    g.fillStyle = gr; g.fill();
    g.shadowColor = 'transparent';
    g.save(); blade(); g.clip();
    g.globalAlpha = 0.6; g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(len * 0.1, -w * 0.15); g.lineTo(len * 0.8, -w * 0.25); g.lineTo(len * 0.8, -w * 0.17); g.lineTo(len * 0.1, -w * 0.07); g.closePath(); g.fill();
    g.globalAlpha = 0.9; g.strokeStyle = '#ffffff'; g.lineWidth = w * 0.05;
    g.beginPath(); g.moveTo(0, w * 0.44); g.lineTo(len * 0.52, w * 0.44); g.quadraticCurveTo(len * 0.84, w * 0.44, len * 0.98, -w * 0.3); g.stroke();
    g.restore();
    g.strokeStyle = 'rgba(60,70,80,0.6)'; g.lineWidth = w * 0.03; blade(); g.stroke();
    // 護手
    gr = g.createLinearGradient(0, -w * 0.6, 0, w * 0.6);
    gr.addColorStop(0, '#6b7480'); gr.addColorStop(0.5, '#d5dbe2'); gr.addColorStop(1, '#59616b');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-w * 0.28, -w * 0.58, w * 0.3, w * 1.16, w * 0.08); g.fill();
    // 刀柄
    gr = g.createLinearGradient(0, -w * 0.4, 0, w * 0.4);
    gr.addColorStop(0, '#7a4a2c'); gr.addColorStop(0.5, '#4a2816'); gr.addColorStop(1, '#2a150a');
    g.fillStyle = gr; g.beginPath(); g.roundRect(-len * 0.52, -w * 0.4, len * 0.52 - w * 0.26, w * 0.8, w * 0.35); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.12)'; g.lineWidth = w * 0.04;
    g.beginPath(); g.moveTo(-len * 0.48, -w * 0.18); g.lineTo(-w * 0.4, -w * 0.2); g.stroke();
    for (const t of [0.15, 0.3, 0.45]) {
      gr = g.createRadialGradient(-len * t - w * 0.04, -w * 0.04, 0, -len * t, 0, w * 0.12);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8b939c');
      g.fillStyle = gr; g.beginPath(); g.arc(-len * t, 0, w * 0.11, 0, 7); g.fill();
    }
    g.restore();
  }

  // 發光刀痕
  function slashGlow(g, x, y, ang, len, width) {
    g.save(); g.translate(x, y); g.rotate(ang); g.globalCompositeOperation = 'lighter';
    for (const [lw, a, c] of [[width * 3, 0.12, '255,120,170'], [width * 1.6, 0.35, '255,200,225'], [width * 0.5, 0.95, '255,255,255']]) {
      const gr = g.createLinearGradient(-len / 2, 0, len / 2, 0);
      gr.addColorStop(0, `rgba(${c},0)`); gr.addColorStop(0.5, `rgba(${c},${a})`); gr.addColorStop(1, `rgba(${c},0)`);
      g.fillStyle = gr; g.beginPath(); g.ellipse(0, 0, len / 2, lw / 2, 0, 0, 7); g.fill();
    }
    g.restore();
  }

  // 果汁噴濺：沿著刀痕法線兩側噴出
  function juiceSpray(g, x, y, ang, r, color, seed, n) {
    const R = rnd(seed), nx = -Math.sin(ang), ny = Math.cos(ang);
    g.fillStyle = color;
    for (let i = 0; i < n; i++) {
      const side = R() < 0.5 ? -1 : 1, along = (R() - 0.5) * r * 2.2, out = r * (0.3 + R() * 1.5);
      const px = x + Math.cos(ang) * along + nx * side * out, py = y + Math.sin(ang) * along + ny * side * out;
      const s = r * (0.012 + R() * 0.035), dir = Math.atan2(ny * side, nx * side) + (R() - 0.5) * 0.8;
      g.globalAlpha = 0.55 + R() * 0.45;
      g.beginPath(); g.ellipse(px, py, s * (1.5 + R() * 2), s, dir, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }

  function sparkle(g, x, y, s) {
    g.save(); g.translate(x, y); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ffffff';
    for (const a of [0, Math.PI / 2]) { g.save(); g.rotate(a); g.beginPath(); g.moveTo(-s, 0); g.quadraticCurveTo(0, -s * 0.12, s, 0); g.quadraticCurveTo(0, s * 0.12, -s, 0); g.fill(); g.restore(); }
    g.globalAlpha = 0.6; g.beginPath(); g.arc(0, 0, s * 0.18, 0, 7); g.fill();
    g.restore();
  }

  function title(g, cx, cy, size) {
    g.save(); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = `900 ${size}px "PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
    g.shadowColor = 'rgba(255,92,138,0.8)'; g.shadowBlur = size * 0.35;
    g.lineJoin = 'round'; g.lineWidth = size * 0.16; g.strokeStyle = '#4a0b2a'; g.strokeText('寶貝切切樂', cx, cy);
    g.shadowBlur = 0;
    const gr = g.createLinearGradient(0, cy - size / 2, 0, cy + size / 2);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#ffc2d6'); gr.addColorStop(1, '#ff5c8a');
    g.fillStyle = gr; g.fillText('寶貝切切樂', cx, cy);
    g.font = `800 ${size * 0.32}px "PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
    g.lineWidth = size * 0.07; g.strokeStyle = '#3a1500'; g.strokeText('— 水果忍者特別版 —', cx, cy + size * 0.78);
    g.fillStyle = '#ffd166'; g.fillText('— 水果忍者特別版 —', cx, cy + size * 0.78);
    g.restore();
  }

  // 主構圖：大西瓜被刀切開 + 周圍的水果；u = 基本尺寸，withTitle 決定要不要畫標題
  function scene(g, w, h, u, cx, cy, withTitle, extras = true, kDist = 1.05, kLen = 1.45) {
    const ang = -0.42;
    if (extras) {
      whole(g, 'strawberry', cx + u * 1.75, cy + u * 0.05, u * 0.3, 0.4);
      sliced(g, 'orange', cx - u * 1.6, cy + u * 0.55, u * 0.42, 0.6, u * 0.07, 0.15);
      juiceSpray(g, cx - u * 1.6, cy + u * 0.55, 0.6, u * 0.42, '#ffa53a', 21, 30);
      sliced(g, 'lemon', cx + u * 1.5, cy + u * 0.75, u * 0.36, -1.1, u * 0.06, 0.12);
      whole(g, 'kiwi', cx - u * 1.35, cy - u * 0.95, u * 0.28, -0.3);
    }
    juiceSpray(g, cx, cy, ang, u, '#ff3b55', 3, 90);
    sliced(g, 'watermelon', cx, cy, u * 0.95, ang, u * 0.2, 0.12);
    slashGlow(g, cx, cy, ang, u * 3.4, u * 0.11);
    // 刀已經從左下往右上劃過西瓜：刀身在西瓜右上方，後面留下發光刀痕
    knife(g, cx + Math.cos(ang) * u * kDist, cy + Math.sin(ang) * u * kDist, ang, u * kLen);
    const R = rnd(11);
    for (let i = 0; i < 12; i++) sparkle(g, cx + (R() - 0.5) * u * 4, cy + (R() - 0.5) * u * 2.4, u * (0.04 + R() * 0.07));
    if (withTitle) title(g, w / 2, cy + u * 1.55, u * 0.42);
  }

  function canvasOf(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  window.makeCoverArt = () => {
    artCache.clear();
    const out = {};
    // 1) 封面（橫式 1920×1080，含標題）
    let c = out.cover = canvasOf(1920, 1080), g = c.getContext('2d');
    background(g, 1920, 1080, 960, 430); scene(g, 1920, 1080, 300, 960, 430, true);
    // 2) 主選單背景（沒有標題，標題用網頁文字顯示）
    c = out.coverBg = canvasOf(1920, 1080); g = c.getContext('2d');
    background(g, 1920, 1080, 960, 540); scene(g, 1920, 1080, 300, 960, 540, false);
    // 3) App 圖示（正方形，只有切開的西瓜和刀）
    c = out.icon = canvasOf(1024, 1024); g = c.getContext('2d');
    background(g, 1024, 1024, 512, 512); scene(g, 1024, 1024, 280, 420, 600, false, false, 1.0, 1.0);
    // 4) Android 自適應圖示前景（透明背景，內容縮在中間安全範圍內）
    c = out.iconFg = canvasOf(1024, 1024); g = c.getContext('2d');
    scene(g, 1024, 1024, 190, 440, 580, false, false, 1.0, 1.0);
    // 5) Android 自適應圖示背景
    c = out.iconBg = canvasOf(1024, 1024); g = c.getContext('2d');
    background(g, 1024, 1024, 512, 512);
    // 6) 啟動畫面（2732×2732，置中構圖含標題）
    c = out.splash = canvasOf(2732, 2732); g = c.getContext('2d');
    background(g, 2732, 2732, 1366, 1250); scene(g, 2732, 2732, 330, 1366, 1250, true);
    return out;
  };
})();
