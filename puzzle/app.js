/* 拼图小游戏：10 张程序生成的图片，100 / 200 块两档难度 */
(() => {
  "use strict";

  const IMG_SIZE = 1200;                 // 生成图片的分辨率（正方形）
  const IMAGES = 10;
  const GRIDS = { 100: [10, 10], 200: [20, 10] }; // pieces -> [cols, rows]

  /* ---------- 10 张图片的绘制器（离屏 canvas，无需网络） ---------- */

  const painters = [
    // 0. 彩虹同心圆
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#0f172a"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      const colors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"];
      for (let i = 0; i < 18; i++) {
        g.beginPath();
        g.arc(IMG_SIZE / 2, IMG_SIZE / 2, IMG_SIZE * 0.55 - i * 35, 0, Math.PI * 2);
        g.fillStyle = colors[i % colors.length];
        g.fill();
      }
    },
    // 1. 棋盘渐变
    (c) => {
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, IMG_SIZE, IMG_SIZE);
      grad.addColorStop(0, "#f472b6"); grad.addColorStop(1, "#312e81");
      g.fillStyle = grad; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      const n = 12, s = IMG_SIZE / n;
      for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
        if ((x + y) % 2 === 0) { g.fillStyle = "rgba(255,255,255,.22)"; g.fillRect(x * s, y * s, s, s); }
    },
    // 2. 波浪条纹
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#0b7285"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      for (let i = 0; i < 14; i++) {
        g.beginPath();
        const y = (i / 14) * IMG_SIZE;
        g.moveTo(0, y);
        for (let x = 0; x <= IMG_SIZE; x += 20)
          g.lineTo(x, y + Math.sin(x / 120 + i) * 60);
        g.lineTo(IMG_SIZE, IMG_SIZE); g.lineTo(0, IMG_SIZE); g.closePath();
        g.fillStyle = `hsl(${180 + i * 12} 70% ${30 + i * 3}%)`;
        g.fill();
      }
    },
    // 3. 夜空星城
    (c) => {
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 0, IMG_SIZE);
      grad.addColorStop(0, "#0f172a"); grad.addColorStop(1, "#334155");
      g.fillStyle = grad; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      let seed = 42;
      const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
      for (let i = 0; i < 400; i++) {
        g.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`;
        g.fillRect(rnd() * IMG_SIZE, rnd() * IMG_SIZE * 0.7, 3 + rnd() * 3, 3 + rnd() * 3);
      }
      g.fillStyle = "#fde68a";
      g.fillRect(IMG_SIZE * 0.12, IMG_SIZE * 0.72, 90, IMG_SIZE * 0.28);
      g.fillRect(IMG_SIZE * 0.32, IMG_SIZE * 0.62, 70, IMG_SIZE * 0.38);
      g.fillRect(IMG_SIZE * 0.5, IMG_SIZE * 0.8, 100, IMG_SIZE * 0.2);
      g.fillRect(IMG_SIZE * 0.68, IMG_SIZE * 0.66, 80, IMG_SIZE * 0.34);
      g.fillRect(IMG_SIZE * 0.84, IMG_SIZE * 0.76, 60, IMG_SIZE * 0.24);
    },
    // 4. 曼达拉圆点
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#fef3c7"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      g.translate(IMG_SIZE / 2, IMG_SIZE / 2);
      for (let ring = 1; ring <= 12; ring++) {
        const r = ring * 48;
        for (let k = 0; k < ring * 6; k++) {
          const a = (k / (ring * 6)) * Math.PI * 2;
          g.beginPath();
          g.arc(Math.cos(a) * r, Math.sin(a) * r, 26 - ring, 0, Math.PI * 2);
          g.fillStyle = `hsl(${(ring * 30) % 360} 75% 55%)`;
          g.fill();
        }
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
    },
    // 5. 山峰日落
    (c) => {
      const g = c.getContext("2d");
      const grad = g.createLinearGradient(0, 0, 0, IMG_SIZE);
      grad.addColorStop(0, "#f97316"); grad.addColorStop(0.5, "#fbbf24"); grad.addColorStop(1, "#7c2d12");
      g.fillStyle = grad; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      g.fillStyle = "#fde68a";
      g.beginPath(); g.arc(IMG_SIZE / 2, IMG_SIZE * 0.42, 130, 0, Math.PI * 2); g.fill();
      const peaks = [[0, 0.75, 0.3, 0.9], [0.45, 0.62, 0.8, 0.92], [0.65, 0.8, 1.05, 1]];
      for (const [x0, y0, x1, y1] of peaks) {
        g.fillStyle = "#431407";
        g.beginPath();
        g.moveTo(x0 * IMG_SIZE, IMG_SIZE);
        g.lineTo((x0 + x1) / 2 * IMG_SIZE, y0 * IMG_SIZE);
        g.lineTo(x1 * IMG_SIZE, IMG_SIZE);
        g.closePath(); g.fill();
      }
    },
    // 6. 蜂窝
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#78350f"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      const R = 52;
      for (let row = -1; row * R * 1.5 < IMG_SIZE + R; row++) {
        for (let col = -1; col * R * 1.732 < IMG_SIZE + R; col++) {
          const cx = col * R * 1.732 + (row % 2 ? R * 0.866 : 0);
          const cy = row * R * 1.5;
          g.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = Math.PI / 6 + (i / 6) * Math.PI * 2;
            const x = cx + Math.cos(a) * R * 0.92, y = cy + Math.sin(a) * R * 0.92;
            i ? g.lineTo(x, y) : g.moveTo(x, y);
          }
          g.closePath();
          g.fillStyle = `hsl(${40 + ((row * 7 + col * 13) % 5) * 6} 90% ${52 + ((row + col) % 3) * 6}%)`;
          g.fill();
          g.strokeStyle = "#78350f"; g.lineWidth = 5; g.stroke();
        }
      }
    },
    // 7. 霓虹网格
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#09090b"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      g.strokeStyle = "#22d3ee"; g.lineWidth = 3;
      for (let i = 0; i <= 24; i++) {
        const p = i / 24;
        g.beginPath(); g.moveTo(p * IMG_SIZE, 0); g.lineTo(IMG_SIZE / 2 + (p - 0.5) * IMG_SIZE, IMG_SIZE); g.stroke();
        g.beginPath(); g.moveTo(0, p * IMG_SIZE); g.lineTo(IMG_SIZE, IMG_SIZE / 2 + (p - 0.5) * IMG_SIZE); g.stroke();
      }
      g.strokeStyle = "#e879f9";
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.arc(IMG_SIZE / 2, IMG_SIZE / 2, 80 + i * 90, 0, Math.PI * 2);
        g.stroke();
      }
    },
    // 8. 水果静物（西瓜 / 橙子 / 葡萄）
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#ecfdf5"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      // 西瓜
      g.save(); g.translate(320, 380); g.rotate(-0.4);
      g.fillStyle = "#166534"; g.beginPath(); g.arc(0, 0, 240, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fca5a5"; g.beginPath(); g.arc(0, 0, 220, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#dc2626"; g.beginPath(); g.arc(0, 0, 200, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#111827";
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2, r = 60 + (i % 4) * 45;
        g.beginPath(); g.ellipse(Math.cos(a) * r, Math.sin(a) * r, 10, 16, a, 0, Math.PI * 2); g.fill();
      }
      g.restore();
      // 橙子
      g.fillStyle = "#f97316"; g.beginPath(); g.arc(880, 700, 170, 0, Math.PI * 2); g.fill();
      g.fillStyle = "#fdba74"; g.beginPath(); g.arc(880, 700, 130, 0, Math.PI * 2); g.fill();
      g.strokeStyle = "#ea580c"; g.lineWidth = 6;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.beginPath(); g.moveTo(880, 700);
        g.lineTo(880 + Math.cos(a) * 125, 700 + Math.sin(a) * 125); g.stroke();
      }
      // 葡萄
      for (let i = 0; i < 14; i++) {
        const row = Math.floor(i / 4), k = i % 4;
        g.fillStyle = `hsl(280 60% ${38 + (i % 3) * 6}%)`;
        g.beginPath(); g.arc(840 + k * 55 - row * 27, 180 + row * 52, 48, 0, Math.PI * 2); g.fill();
      }
      g.strokeStyle = "#65a30d"; g.lineWidth = 12;
      g.beginPath(); g.moveTo(900, 120); g.quadraticCurveTo(960, 40, 1020, 60); g.stroke();
    },
    // 9. 像素猫咪
    (c) => {
      const g = c.getContext("2d");
      g.fillStyle = "#c7d2fe"; g.fillRect(0, 0, IMG_SIZE, IMG_SIZE);
      const px = 100, cat = [
        "..X...X..",
        "..XX.XX..",
        ".XXXXXXX.",
        "XXXXXXXXX",
        "XoXXXXXoX",
        "XXXXXXXXX",
        "XXXWWWXXX",
      ];
      const ox = (IMG_SIZE - cat[0].length * px) / 2, oy = (IMG_SIZE - cat.length * px) / 2;
      for (let y = 0; y < cat.length; y++)
        for (let x = 0; x < cat[y].length; x++) {
          const ch = cat[y][x];
          if (ch === ".") continue;
          g.fillStyle = ch === "o" ? "#22d3ee" : ch === "W" ? "#f472b6" : "#1f2937";
          g.fillRect(ox + x * px, oy + y * px, px, px);
        }
      g.fillStyle = "#f472b6";
      g.fillRect(ox + px, oy + cat.length * px, cat[0].length * px - 2 * px, px * 0.9);
    },
  ];

  const images = []; // 离屏 canvas 列表
  for (let i = 0; i < IMAGES; i++) {
    const c = document.createElement("canvas");
    c.width = c.height = IMG_SIZE;
    painters[i](c);
    images.push(c);
  }

  /* ---------- 状态 ---------- */

  const $ = (id) => document.getElementById(id);
  let selectedImg = 0, selectedPieces = 100;
  let order = [];            // order[空位] = 原始块下标
  let cols, rows, moves = 0, timerId = null, seconds = 0;
  let selectedCell = -1;

  /* ---------- 设置界面 ---------- */

  const gallery = $("gallery");
  images.forEach((img, i) => {
    const b = document.createElement("button");
    b.className = "thumb" + (i === 0 ? " selected" : "");
    b.title = `图片 ${i + 1}`;
    b.appendChild(img.cloneNode());
    b.firstChild.getContext("2d").drawImage(img, 0, 0);
    b.addEventListener("click", () => {
      selectedImg = i;
      gallery.querySelectorAll(".thumb").forEach((t) => t.classList.remove("selected"));
      b.classList.add("selected");
    });
    gallery.appendChild(b);
  });

  const diffBtns = document.querySelectorAll(".diff-btn");
  diffBtns.forEach((b) => {
    if (+b.dataset.pieces === selectedPieces) b.classList.add("selected");
    b.addEventListener("click", () => {
      selectedPieces = +b.dataset.pieces;
      diffBtns.forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
  });

  /* ---------- 游戏逻辑 ---------- */

  function shuffle(n) {
    const a = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    if (a.every((v, i) => v === i)) return shuffle(n); // 保证真的打乱
    return a;
  }

  function startGame() {
    [cols, rows] = GRIDS[selectedPieces];
    order = shuffle(cols * rows);
    moves = 0; seconds = 0; selectedCell = -1;
    $("moves").textContent = "步数：0";
    $("timer").textContent = "00:00";
    $("setup").hidden = true;
    $("game").hidden = false;
    clearInterval(timerId);
    timerId = setInterval(() => {
      seconds++;
      $("timer").textContent = fmt(seconds);
    }, 1000);
    buildBoard();
  }

  function buildBoard() {
    const board = $("board");
    board.innerHTML = "";
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    const dataURL = images[selectedImg].toDataURL();
    const n = cols * rows;
    for (let cell = 0; cell < n; cell++) {
      const piece = document.createElement("div");
      piece.className = "piece";
      piece.draggable = true;
      piece.dataset.cell = cell;
      stylePiece(piece, order[cell], dataURL);
      board.appendChild(piece);
    }
    updateProgress();
  }

  // 图片按 cols*rows 倍放大铺在每个块里，再用百分比定位露出对应区域：
  // position P% 的偏移 = (1-倍数)*块宽*P，令其等于 -x*块宽 => P = x/(cols-1)
  function stylePiece(piece, idx, dataURL) {
    const x = idx % cols, y = Math.floor(idx / cols);
    piece.style.backgroundImage = `url(${dataURL})`;
    piece.style.backgroundSize = `${cols * 100}% ${rows * 100}%`;
    piece.style.backgroundPosition = `${(x / (cols - 1)) * 100}% ${(y / (rows - 1)) * 100}%`;
    piece.classList.toggle("correct", order[+piece.dataset.cell] === +piece.dataset.cell);
  }

  function swapCells(a, b) {
    [order[a], order[b]] = [order[b], order[a]];
    moves++;
    $("moves").textContent = `步数：${moves}`;
    const board = $("board");
    const pa = board.children[a], pb = board.children[b];
    const img = images[selectedImg].toDataURL();
    stylePiece(pa, order[a], img);
    stylePiece(pb, order[b], img);
    pa.classList.remove("selected"); pb.classList.remove("selected");
    selectedCell = -1;
    updateProgress();
    if (order.every((v, i) => v === i)) win();
  }

  function updateProgress() {
    const done = order.reduce((s, v, i) => s + (v === i), 0);
    $("progress").textContent = `已完成：${Math.round((done / order.length) * 100)}%`;
  }

  function fmt(s) {
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }

  function win() {
    clearInterval(timerId);
    $("board").querySelectorAll(".piece").forEach((p) => (p.style.outline = "none"));
    $("win-stats").textContent = `用时 ${fmt(seconds)}，共 ${moves} 步（${cols}×${rows} = ${cols * rows} 块）`;
    $("win-overlay").hidden = false;
  }

  /* ---------- 交互：点击交换 + 拖拽交换 ---------- */

  $("board").addEventListener("click", (e) => {
    const piece = e.target.closest(".piece");
    if (!piece) return;
    const cell = +piece.dataset.cell;
    if (piece.classList.contains("correct")) return; // 已归位的块锁定
    if (selectedCell === -1) {
      selectedCell = cell;
      piece.classList.add("selected");
    } else if (selectedCell === cell) {
      piece.classList.remove("selected");
      selectedCell = -1;
    } else {
      swapCells(selectedCell, cell);
    }
  });

  $("board").addEventListener("dragstart", (e) => {
    const piece = e.target.closest(".piece");
    if (!piece || piece.classList.contains("correct")) { e.preventDefault(); return; }
    e.dataTransfer.setData("text/plain", piece.dataset.cell);
    piece.classList.add("dragging");
  });
  $("board").addEventListener("dragend", (e) => e.target.classList?.remove("dragging"));
  $("board").addEventListener("dragover", (e) => e.preventDefault());
  $("board").addEventListener("drop", (e) => {
    e.preventDefault();
    const from = +e.dataTransfer.getData("text/plain");
    const piece = e.target.closest(".piece");
    if (!piece) return;
    const to = +piece.dataset.cell;
    if (from !== to && !$("board").children[to].classList.contains("correct")) swapCells(from, to);
  });

  /* ---------- 按钮 ---------- */

  $("start-btn").addEventListener("click", startGame);
  $("restart-btn").addEventListener("click", startGame);
  $("quit-btn").addEventListener("click", () => {
    clearInterval(timerId);
    $("game").hidden = true;
    $("setup").hidden = false;
  });
  const overlay = $("preview-overlay");
  const pcv = $("preview-canvas");
  $("preview-btn").addEventListener("click", () => {
    pcv.width = pcv.height = IMG_SIZE;
    pcv.getContext("2d").drawImage(images[selectedImg], 0, 0);
    overlay.hidden = false;
  });
  overlay.addEventListener("click", () => (overlay.hidden = true));
  $("win-close").addEventListener("click", () => {
    $("win-overlay").hidden = true;
    $("game").hidden = true;
    $("setup").hidden = false;
  });
})();
