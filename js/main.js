/* ============================================================
   mochikuro main.js - 全ページ共通ゲームエフェクト
   ============================================================ */

(function() {
  'use strict';

  // ============================================================
  // ヘッダー
  // ============================================================
  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => menu.classList.toggle('open'));
      menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
    }
  }

  // ============================================================
  // スクロールリビール
  // ============================================================
  function initReveal() {
    const els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  // ============================================================
  // 🎮 ブート画面（自動挿入）
  // ============================================================
  function initBoot() {
    if (sessionStorage.getItem('mochi_booted')) return;
    const boot = document.createElement('div');
    boot.className = 'game-boot';
    boot.id = 'gameBoot';
    boot.innerHTML = `
      <img src="${getAssetPath()}assets/images/cat-white.png" alt="" style="width:48px;height:48px;image-rendering:pixelated;animation:bootBlink 1.5s ease infinite;" onerror="this.style.display='none'">
      <div class="game-boot-text">N O W &nbsp; L O A D I N G</div>
      <div class="game-boot-bar"><div class="game-boot-fill"></div></div>
    `;
    document.body.prepend(boot);
    setTimeout(() => {
      boot.classList.add('fade-out');
      setTimeout(() => boot.remove(), 800);
    }, 2200);
    sessionStorage.setItem('mochi_booted', '1');
  }

  function getAssetPath() {
    // mochiage-ec/ 配下なら ../ を付ける
    return location.pathname.includes('/mochiage-ec/') ? '../' : '';
  }

  // ============================================================
  // ✨ パーティクル
  // ============================================================
  function initParticles() {
    if (window.matchMedia('(max-width:768px)').matches) return;
    const container = document.createElement('div');
    container.className = 'particles';
    document.body.prepend(container);
    for (let i = 0; i < 25; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (-Math.random() * 15) + 's';
      p.style.width = p.style.height = (2 + Math.random() * 3) + 'px';
      if (Math.random() > 0.7) p.style.background = '#fafaf7';
      container.appendChild(p);
    }
  }

  // ============================================================
  // 📊 XPバー
  // ============================================================
  function initXPBar() {
    const bar = document.createElement('div');
    bar.className = 'xp-bar';
    bar.style.width = '0%';
    document.body.prepend(bar);
    window.addEventListener('scroll', () => {
      const pct = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (pct > 0 ? (window.scrollY / pct) * 100 : 0) + '%';
    }, { passive: true });
  }

  // ============================================================
  // 🏆 レベルシステム
  // ============================================================
  let xp = parseInt(sessionStorage.getItem('mochi_xp') || '0');
  const titles = ['VISITOR', 'EXPLORER', 'ADVENTURER', 'CHALLENGER', 'HERO'];

  function initLevel() {
    const badge = document.createElement('div');
    badge.className = 'level-badge';
    badge.id = 'levelBadge';
    document.body.appendChild(badge);
    updateLevel();
    let lastScroll = Math.floor(window.scrollY / 300);
    window.addEventListener('scroll', () => {
      const now = Math.floor(window.scrollY / 300);
      if (now > lastScroll) { addXP(1); lastScroll = now; }
    }, { passive: true });
  }

  function addXP(amount) {
    xp += amount;
    sessionStorage.setItem('mochi_xp', xp);
    updateLevel();
  }

  function updateLevel() {
    const badge = document.getElementById('levelBadge');
    if (!badge) return;
    const lv = Math.min(5, Math.floor(xp / 5) + 1);
    const title = titles[Math.min(lv - 1, titles.length - 1)];
    badge.innerHTML = `<span class="lv">Lv.${lv}</span> <span style="opacity:0.6">${title}</span>`;
    badge.style.boxShadow = `0 0 ${16 + xp}px rgba(212,175,55,${Math.min(0.3 + xp * 0.02, 0.8)})`;
  }
  window._addXP = addXP;

  // ============================================================
  // 🔥 コンボカウンター
  // ============================================================
  function initCombo() {
    const el = document.createElement('div');
    el.className = 'combo';
    el.innerHTML = '<div class="combo-num" id="comboNum">0</div><div class="combo-label">C O M B O</div>';
    document.body.appendChild(el);

    let combo = 0, timer = null;
    const numEl = el.querySelector('.combo-num');
    document.addEventListener('click', () => {
      combo++;
      numEl.textContent = combo;
      el.classList.add('show');
      numEl.style.fontSize = combo >= 10 ? '60px' : combo >= 5 ? '52px' : '48px';
      numEl.style.color = combo >= 10 ? '#c2603b' : '#d4af37';
      clearTimeout(timer);
      timer = setTimeout(() => { combo = 0; el.classList.remove('show'); }, 2000);
      addXP(1);
    });
  }

  // ============================================================
  // 💬 RPGダイアログ
  // ============================================================
  function initDialog() {
    const el = document.createElement('div');
    el.className = 'rpg-dialog-float';
    el.innerHTML = '<div class="speaker">SYSTEM</div><div id="rpgDialogText"></div>';
    document.body.appendChild(el);

    const messages = [
      'ようこそ、mochikuro の世界へ。',
      'この先には 3つの事業 が待っている…',
      'EC × AI × DX。あなたの冒険が始まる。',
      '企業価値をモチアゲる旅に出よう。',
      'スクロールして先に進もう。▼',
      '隠しコマンドを知っているか？ ↑↑↓↓←→←→BA',
      'ページの最後まで辿り着けるか？',
      'クリックするとXPがたまるぞ。',
    ];
    let shown = new Set();
    let triggers = [300, 800, 1500, 2500, 4000];
    let nextTrigger = 0;

    function showMsg() {
      const available = messages.filter((_, i) => !shown.has(i));
      if (!available.length) return;
      const idx = messages.indexOf(available[Math.floor(Math.random() * available.length)]);
      shown.add(idx);
      const textEl = el.querySelector('#rpgDialogText');
      textEl.textContent = '';
      el.classList.add('show');
      let i = 0;
      const iv = setInterval(() => {
        textEl.textContent += messages[idx][i];
        i++;
        if (i >= messages[idx].length) {
          clearInterval(iv);
          textEl.innerHTML += '<span class="blink">▼</span>';
          setTimeout(() => el.classList.remove('show'), 4000);
        }
      }, 50);
    }

    window.addEventListener('scroll', () => {
      if (nextTrigger >= triggers.length) return;
      if (window.scrollY > triggers[nextTrigger]) { showMsg(); nextTrigger++; }
    }, { passive: true });
    setTimeout(showMsg, 3500);

    window._showRPGDialog = function(text) {
      const textEl = el.querySelector('#rpgDialogText');
      textEl.innerHTML = text;
      el.classList.add('show');
      setTimeout(() => el.classList.remove('show'), 5000);
    };
  }

  // ============================================================
  // 🔊 8bit サウンド
  // ============================================================
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = 'square';
      if (type === 'click') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.05);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(); osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'hover') {
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start(); osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'fanfare') {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.frequency.value = freq; o.type = 'square';
          g.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
          o.start(ctx.currentTime + i * 0.15);
          o.stop(ctx.currentTime + i * 0.15 + 0.3);
        });
      }
    } catch (e) {}
  }

  function initSounds() {
    document.querySelectorAll('.btn-gold,.btn-line,.btn-primary,.btn-ghost,.nav-cta,a.btn').forEach(el => {
      el.addEventListener('click', () => playSound('click'));
    });
    document.querySelectorAll('.svc-card,.rpg-card,.card,.noren-card').forEach(el => {
      el.addEventListener('mouseenter', () => playSound('hover'));
    });
  }

  // ============================================================
  // 🎆 クリックパーティクル爆発
  // ============================================================
  function initClickBurst() {
    document.addEventListener('click', e => {
      if (e.target.closest('a,button,input,textarea,select,label')) return;
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:4px;height:4px;background:${Math.random() > 0.5 ? '#d4af37' : '#c2603b'};border-radius:50%;pointer-events:none;z-index:9999;`;
        document.body.appendChild(p);
        const angle = (Math.PI * 2 / 6) * i;
        const dist = 30 + Math.random() * 40;
        p.animate([
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ], { duration: 600, easing: 'ease-out' });
        setTimeout(() => p.remove(), 600);
      }
    });
  }

  // ============================================================
  // 🔑 コナミコマンド
  // ============================================================
  function initKonami() {
    const code = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
    let idx = 0;
    document.addEventListener('keydown', e => {
      if (e.keyCode === code[idx]) {
        idx++;
        if (idx === code.length) {
          idx = 0;
          const flash = document.createElement('div');
          flash.className = 'screen-flash';
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 600);
          playSound('fanfare');
          addXP(50);
          if (window._showRPGDialog) {
            window._showRPGDialog('<span class="speaker">SECRET</span> 隠しコマンド発動！ Lv.MAX 到達！ 🎊');
          }
        }
      } else { idx = 0; }
    });
  }

  // ============================================================
  // 🌀 セクションワイプ
  // ============================================================
  function initWipe() {
    // 自動的にセクションにwipeクラスを付与
    document.querySelectorAll('.section,.svc-section,.feat,.split,.content').forEach(el => {
      el.classList.add('section-wipe');
    });
    const wipes = document.querySelectorAll('.section-wipe');
    if (!wipes.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('wipe-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    wipes.forEach(w => io.observe(w));
  }

  // ============================================================
  // 🖼 パララックス
  // ============================================================
  function initParallax() {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    const imgs = document.querySelectorAll('.feat-img img,.split-img img,.img-card img');
    if (!imgs.length) return;
    window.addEventListener('scroll', () => {
      imgs.forEach(img => {
        const rect = img.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (rect.top - window.innerHeight / 2) * 0.05;
          img.style.transform = `translateY(${offset}px) scale(1.05)`;
        }
      });
    }, { passive: true });
  }

  // ============================================================
  // 🐾 スタンプラリー
  // ============================================================
  const STAMP_KEY = 'mochikuro_paw_v3';
  const STAMPS = [
    { id: 'home', label: 'Home' }, { id: 'about', label: 'About' },
    { id: 'ceo', label: 'Message' }, { id: 'ai-dx', label: 'AI/DX' },
    { id: 'ec', label: 'モチアゲEC' }, { id: 'owner', label: 'パートナー' },
    { id: 'community', label: 'Community' }, { id: 'contact', label: 'Contact' }
  ];

  function getStamps() { try { return JSON.parse(localStorage.getItem(STAMP_KEY) || '[]'); } catch (e) { return []; } }
  function addStamp(id) {
    const cur = getStamps();
    if (cur.includes(id)) return false;
    cur.push(id);
    localStorage.setItem(STAMP_KEY, JSON.stringify(cur));
    return true;
  }

  function initStampRally() {
    const id = document.body.dataset.stamp;
    if (id) setTimeout(() => { if (addStamp(id)) addXP(3); }, 1500);

    const count = getStamps().length;
    const paw = document.createElement('button');
    paw.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:90;background:#0a0a0a;border:2px solid #d4af37;color:#d4af37;padding:6px 12px;font-size:11px;cursor:pointer;box-shadow:0 0 12px rgba(212,175,55,0.2);';
    paw.innerHTML = `🐾 ${count}/${STAMPS.length}`;
    paw.title = 'スタンプ帳';
    document.body.appendChild(paw);
    paw.addEventListener('click', () => {
      const collected = getStamps();
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,10,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
      modal.innerHTML = `
        <div style="background:#0a0a0a;border:2px solid #d4af37;max-width:400px;width:100%;padding:32px;position:relative;box-shadow:0 0 30px rgba(212,175,55,0.3);">
          <button onclick="this.closest('div[style]').parentElement.remove()" style="position:absolute;top:8px;right:12px;background:none;border:none;color:#d4af37;font-size:20px;cursor:pointer;">×</button>
          <div style="font-size:20px;color:#d4af37;margin-bottom:16px;">🐾 スタンプ帳</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            ${STAMPS.map(s => `<div style="text-align:center;padding:8px 4px;border:1px solid ${collected.includes(s.id) ? '#d4af37' : '#333'};background:${collected.includes(s.id) ? 'rgba(212,175,55,0.1)' : 'transparent'};font-size:10px;color:${collected.includes(s.id) ? '#d4af37' : '#555'};">${collected.includes(s.id) ? '🐾' : '？'}<br>${s.label}</div>`).join('')}
          </div>
          ${collected.length === STAMPS.length ? '<div style="margin-top:16px;padding:12px;border:1px dashed #d4af37;text-align:center;font-size:12px;color:#d4af37;">🎊 全スタンプ制覇！ お問い合わせの件名に「皆伝」と記すと代表より直接返答あり。</div>' : ''}
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    });
  }

  // ============================================================
  // 初期化
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initReveal();
    initBoot();
    initParticles();
    initXPBar();
    initLevel();
    initCombo();
    initDialog();
    initSounds();
    initClickBurst();
    initKonami();
    initWipe();
    initParallax();
    initStampRally();
  });
})();
