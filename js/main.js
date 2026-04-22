/* ============================================================
   mochikuro main.js
   意味のある遊び心だけ残す
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
  // スクロールリビール（ふわっと出現）
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
  // 🎮 ブート画面（初回のみ）
  // ============================================================
  function initBoot() {
    if (sessionStorage.getItem('mochi_booted')) return;
    const boot = document.createElement('div');
    boot.className = 'game-boot';
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
    return location.pathname.includes('/mochiage-ec/') ? '../' : '';
  }

  // ============================================================
  // ✨ パーティクル（静かに浮遊）
  // ============================================================
  function initParticles() {
    if (window.matchMedia('(max-width:768px)').matches) return;
    const container = document.createElement('div');
    container.className = 'particles';
    document.body.prepend(container);
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (12 + Math.random() * 18) + 's';
      p.style.animationDelay = (-Math.random() * 20) + 's';
      p.style.width = p.style.height = (1.5 + Math.random() * 2) + 'px';
      if (Math.random() > 0.7) p.style.background = '#fafaf7';
      container.appendChild(p);
    }
  }

  // ============================================================
  // 🐾 クリックで肉球
  // ============================================================
  function initPawClick() {
    document.addEventListener('click', e => {
      if (e.target.closest('a,button,input,textarea,select,label')) return;
      const paw = document.createElement('div');
      paw.textContent = '🐾';
      paw.style.cssText = `position:fixed;left:${e.clientX-12}px;top:${e.clientY-12}px;font-size:24px;pointer-events:none;z-index:9999;`;
      document.body.appendChild(paw);
      paw.animate([
        { transform: 'scale(1) translateY(0)', opacity: 1 },
        { transform: 'scale(0.6) translateY(-30px)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      setTimeout(() => paw.remove(), 800);
    });
  }

  // ============================================================
  // 🃏 カード3Dティルト
  // ============================================================
  function initCardTilt() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    document.querySelectorAll('.svc-card,.rpg-card,.card').forEach(card => {
      card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateZ(4px)`;
        card.style.boxShadow = `${-x*10}px ${y*10}px 20px rgba(0,0,0,0.1)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  // ============================================================
  // ✨ ナビリンクアンダーライン
  // ============================================================
  function initNavGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .nav-menu a::after { content:'';position:absolute;bottom:0;left:0;right:0;height:2px;background:#d4af37;transform:scaleX(0);transform-origin:right;transition:transform 0.3s ease; }
      .nav-menu a:hover::after { transform:scaleX(1);transform-origin:left; }
      .nav-menu a { position:relative; }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🔢 数字カウントアップ
  // ============================================================
  function initCountUp() {
    const nums = document.querySelectorAll('[data-count]');
    if (!nums.length || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const duration = 1500;
        const start = performance.now();
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (Number.isInteger(target) ? Math.floor(target * eased) : (target * eased).toFixed(1)) + (el.dataset.suffix || '');
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  // ============================================================
  // 🌟 ゴールデン選択色
  // ============================================================
  function initSelectionColor() {
    const style = document.createElement('style');
    style.textContent = `::selection{background:rgba(212,175,55,0.3);color:#0a0a0a}::-moz-selection{background:rgba(212,175,55,0.3);color:#0a0a0a}`;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🖼 画像ホバーで浮く
  // ============================================================
  function initImageHover() {
    document.querySelectorAll('.feat-img,.split-img,.img-card').forEach(el => {
      el.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.boxShadow = ''; });
    });
  }

  // ============================================================
  // 🐱 フッター猫ゆらゆら + クリックでぴょん＋鈴音
  // ============================================================
  function initFooterCats() {
    const cats = document.querySelectorAll('footer img[src*="cat-"]');
    cats.forEach((img, i) => {
      img.style.animation = `catSway ${3 + i * 0.5}s ease-in-out infinite alternate`;
      img.style.cursor = 'pointer';
      img.addEventListener('click', e => {
        e.stopPropagation();
        img.animate([
          { transform: 'translateY(0) rotate(0)' },
          { transform: 'translateY(-12px) rotate(10deg)' },
          { transform: 'translateY(0) rotate(0)' }
        ], { duration: 400, easing: 'ease-out' });
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.frequency.value = 1200; osc.type = 'sine';
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
          osc.start(); osc.stop(ctx.currentTime + 0.4);
        } catch (e) {}
      });
    });
    const style = document.createElement('style');
    style.textContent = `@keyframes catSway{0%{transform:rotate(-3deg)}100%{transform:rotate(3deg)}}`;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🎯 ボタングロウ
  // ============================================================
  function initButtonGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .btn-gold:hover,.nav-cta:hover{box-shadow:0 0 20px rgba(212,175,55,0.4)}
      .btn-line:hover,.btn-ghost:hover{box-shadow:0 0 16px rgba(250,250,247,0.15)}
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🔄 スムーズスクロール
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  // ============================================================
  // 🌊 マウス追従グロウ（さりげないゴールドの光）
  // ============================================================
  function initMouseGlow() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    const glow = document.createElement('div');
    glow.style.cssText = 'position:fixed;width:300px;height:300px;border-radius:50%;pointer-events:none;z-index:0;background:radial-gradient(circle,rgba(212,175,55,0.04) 0%,transparent 70%);transition:transform 0.3s ease;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.transform = `translate(${e.clientX - 150}px, ${e.clientY - 150}px)`;
    });
  }

  // ============================================================
  // 🔑 コナミコマンド（隠し要素）
  // ============================================================
  function initKonami() {
    const el = document.createElement('div');
    el.className = 'rpg-dialog-float';
    el.innerHTML = '<div id="rpgDialogText"></div>';
    document.body.appendChild(el);

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
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            [523, 659, 784, 1047].forEach((freq, i) => {
              const o = ctx.createOscillator();
              const g = ctx.createGain();
              o.connect(g); g.connect(ctx.destination);
              o.frequency.value = freq; o.type = 'square';
              g.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.15);
              g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
              o.start(ctx.currentTime + i * 0.15);
              o.stop(ctx.currentTime + i * 0.15 + 0.3);
            });
          } catch (e) {}
          el.querySelector('#rpgDialogText').innerHTML = '🎊 隠しコマンド発見！ あなたはmochikuroマスターです。';
          el.classList.add('show');
          setTimeout(() => el.classList.remove('show'), 5000);
        }
      } else { idx = 0; }
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
    initPawClick();
    initCardTilt();
    initNavGlow();
    initCountUp();
    initSelectionColor();
    initImageHover();
    initFooterCats();
    initButtonGlow();
    initSmoothScroll();
    initMouseGlow();
    initKonami();
  });
})();
