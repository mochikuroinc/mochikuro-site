/* ============================================================
   mochikuro main.js v3 - 軽量 + 遊び心レイヤー
   ============================================================ */

(function() {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  // ============================================================
  // Header
  // ============================================================

  function initHeader() {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const toggle = $('.menu-toggle');
    const menu = $('.nav-menu');
    if (toggle && menu) {
      toggle.addEventListener('click', () => menu.classList.toggle('open'));
      $$('.nav-menu a').forEach(a => {
        a.addEventListener('click', () => menu.classList.remove('open'));
      });
    }
  }

  // ============================================================
  // Scroll reveal
  // ============================================================

  function initReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => io.observe(el));
  }

  // ============================================================
  // Number count-up
  // ============================================================

  function initCountUp() {
    const nums = $$('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1500;
        const start = performance.now();
        const suffix = el.dataset.suffix || '';
        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          el.textContent = (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  // ============================================================
  // 🐾 肉球スタンプラリー（控えめ版）
  // ============================================================

  const STAMP_KEY = 'mochikuro_paw_v3';
  const STAMPS = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'ceo', label: 'Message' },
    { id: 'ai-dx', label: 'AI/DX' },
    { id: 'ec', label: 'モチアゲEC' },
    { id: 'owner', label: 'パートナー' },
    { id: 'community', label: 'Community' },
    { id: 'contact', label: 'Contact' }
  ];

  function getStamps() {
    try { return JSON.parse(localStorage.getItem(STAMP_KEY) || '[]'); }
    catch(e) { return []; }
  }
  function saveStamps(arr) {
    localStorage.setItem(STAMP_KEY, JSON.stringify(arr));
  }
  function addStamp(id) {
    const cur = getStamps();
    if (cur.includes(id)) return false;
    cur.push(id);
    saveStamps(cur);
    return true;
  }

  function initStampRally() {
    // 訪問ページ記録
    const id = document.body.dataset.stamp;
    if (id) setTimeout(() => addStamp(id), 1500);

    // フローティング肉球ボタン
    const count = getStamps().length;
    const paw = document.createElement('button');
    paw.className = 'hidden-paw';
    paw.title = 'スタンプ帳';
    paw.innerHTML = '<div>🐾<span class="count">' + count + '/' + STAMPS.length + '</span></div>';
    document.body.appendChild(paw);
    paw.addEventListener('click', openStampModal);
  }

  function openStampModal() {
    const collected = getStamps();
    const modal = document.createElement('div');
    modal.className = 'paw-modal open';
    modal.innerHTML = `
      <div class="paw-modal-inner">
        <button class="paw-modal-close" aria-label="閉じる">×</button>
        <div class="chapter-head">SECRET QUEST LOG</div>
        <div style="font-family: var(--f-pixel); font-size: 28px; margin-bottom: 8px;">
          🐾 城下町スタンプ帳
        </div>
        <p style="font-size: 13px; color: var(--c-muted); margin-bottom: 20px; line-height: 1.8;">
          各ページを訪れると肉球スタンプを獲得。<br>
          全部集めると隠しメッセージが解放されます。
        </p>
        <div class="stat-bar">
          <span class="stat-bar-label">HP</span>
          <span class="stat-bar-track"><span class="stat-bar-fill" style="width: ${(collected.length / STAMPS.length) * 100}%"></span></span>
          <span class="pixel" style="font-size: 12px;">${collected.length}/${STAMPS.length}</span>
        </div>
        <div class="paw-stamp-grid">
          ${STAMPS.map(s => `
            <div class="paw-stamp ${collected.includes(s.id) ? 'got' : ''}">
              <div style="font-size: 20px;">${collected.includes(s.id) ? '🐾' : '▯'}</div>
              <div class="label">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${collected.length === STAMPS.length ? `
          <div class="pixel-border" style="margin-top: 24px; font-size: 12px; line-height: 1.8; font-family: var(--f-pixel);">
            <div class="chapter-head" style="margin-bottom: 8px;">QUEST CLEAR</div>
            皆伝おめでとう！<br>
            お問い合わせフォームの件名に<br>
            「<strong style="color: var(--c-warm);">皆伝</strong>」と記すと代表より直接返答あり。
          </div>
        ` : ''}
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('.paw-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  }

  // ============================================================
  // 🐾 クリックで肉球トレイル (fun)
  // ============================================================

  function initPawTrail() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let lastTime = 0;
    document.addEventListener('click', (e) => {
      // UIボタン等は除外
      if (e.target.closest('button, a, input, select, textarea, label, summary')) return;
      const now = Date.now();
      if (now - lastTime < 200) return;
      lastTime = now;

      const paw = document.createElement('div');
      paw.className = 'paw-trail';
      paw.textContent = '🐾';
      paw.style.left = (e.clientX - 10) + 'px';
      paw.style.top = (e.clientY - 10) + 'px';
      document.body.appendChild(paw);
      setTimeout(() => paw.remove(), 1300);
    });
  }

  // ============================================================
  // 🔔 ロゴ5連打で鈴音
  // ============================================================

  function initEasterEgg() {
    const brand = $('.brand');
    if (!brand) return;
    let clicks = 0;
    let timer;
    brand.addEventListener('click', (e) => {
      clicks++;
      clearTimeout(timer);
      timer = setTimeout(() => { clicks = 0; }, 1800);
      if (clicks >= 5) {
        e.preventDefault();
        playBell();
        clicks = 0;
        showToast('🔔 チリン…');
      }
    });
  }

  function playBell() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } catch(e) {}
  }

  function showToast(text) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:var(--c-ink);color:var(--c-bg);padding:14px 28px;border:2px solid var(--c-ink);box-shadow:4px 4px 0 var(--c-ink);font-family:var(--f-pixel);font-size:14px;z-index:9999;animation:fadeIn 0.3s;';
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.4s'; }, 1800);
    setTimeout(() => el.remove(), 2400);
  }

  // ============================================================
  // Init
  // ============================================================

  document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initReveal();
    initCountUp();
    initStampRally();
    initPawTrail();
    initEasterEgg();
  });
})();
