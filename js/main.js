/* ============================================================
   mochikuro main.js - 全ページ共通
   楽しいけど疲れない、ちょうどいい遊び心
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
  // 🎮 ブート画面（セッション初回のみ）
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
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (10 + Math.random() * 15) + 's';
      p.style.animationDelay = (-Math.random() * 20) + 's';
      p.style.width = p.style.height = (1.5 + Math.random() * 2) + 'px';
      p.style.opacity = '0';
      if (Math.random() > 0.7) p.style.background = '#fafaf7';
      container.appendChild(p);
    }
  }

  // ============================================================
  // 📊 XPバー（スクロール進捗 - ゴールドのシマー）
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
  // 🏆 レベルバッジ（右下 - スクロール＋ページ訪問で上がる）
  // ============================================================
  let xp = parseInt(sessionStorage.getItem('mochi_xp') || '0');
  const titles = ['VISITOR', 'EXPLORER', 'ADVENTURER', 'CHALLENGER', 'HERO'];

  function initLevel() {
    const badge = document.createElement('div');
    badge.className = 'level-badge';
    badge.id = 'levelBadge';
    document.body.appendChild(badge);
    updateLevel();
    let lastScroll = Math.floor(window.scrollY / 500);
    window.addEventListener('scroll', () => {
      const now = Math.floor(window.scrollY / 500);
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
    badge.innerHTML = `<span class="lv">Lv.${lv}</span> <span style="opacity:0.5">${title}</span>`;
  }
  window._addXP = addXP;

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
          // フラッシュ
          const flash = document.createElement('div');
          flash.className = 'screen-flash';
          document.body.appendChild(flash);
          setTimeout(() => flash.remove(), 600);
          // ファンファーレ
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
          addXP(50);
          // メッセージ
          const textEl = el.querySelector('#rpgDialogText');
          textEl.innerHTML = '<span style="background:#d4af37;color:#0a0a0a;font-size:10px;font-weight:700;padding:2px 8px;margin-right:8px;">SECRET</span> 隠しコマンド発動！ Lv.MAX 🎊';
          el.classList.add('show');
          setTimeout(() => el.classList.remove('show'), 5000);
        }
      } else { idx = 0; }
    });
  }

  // ============================================================
  // 🐾 スタンプラリー（左下 - 静かに存在）
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
    paw.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:90;background:#0a0a0a;border:1px solid rgba(212,175,55,0.4);color:rgba(212,175,55,0.7);padding:6px 12px;font-size:11px;cursor:pointer;transition:all 0.3s;';
    paw.innerHTML = `🐾 ${count}/${STAMPS.length}`;
    paw.title = 'スタンプ帳';
    document.body.appendChild(paw);
    paw.addEventListener('mouseenter', () => { paw.style.borderColor = '#d4af37'; paw.style.color = '#d4af37'; });
    paw.addEventListener('mouseleave', () => { paw.style.borderColor = 'rgba(212,175,55,0.4)'; paw.style.color = 'rgba(212,175,55,0.7)'; });
    paw.addEventListener('click', () => {
      const collected = getStamps();
      const modal = document.createElement('div');
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(10,10,10,0.85);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;';
      modal.innerHTML = `
        <div style="background:#0a0a0a;border:2px solid #d4af37;max-width:400px;width:100%;padding:32px;position:relative;box-shadow:0 0 30px rgba(212,175,55,0.2);">
          <button onclick="this.closest('div[style]').parentElement.remove()" style="position:absolute;top:8px;right:12px;background:none;border:none;color:#d4af37;font-size:20px;cursor:pointer;">×</button>
          <div style="font-size:18px;color:#d4af37;margin-bottom:16px;">🐾 スタンプ帳</div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;">
            ${STAMPS.map(s => `<div style="text-align:center;padding:8px 4px;border:1px solid ${collected.includes(s.id) ? '#d4af37' : '#222'};background:${collected.includes(s.id) ? 'rgba(212,175,55,0.08)' : 'transparent'};font-size:10px;color:${collected.includes(s.id) ? '#d4af37' : '#444'};transition:all 0.3s;">${collected.includes(s.id) ? '🐾' : '？'}<br>${s.label}</div>`).join('')}
          </div>
          ${collected.length === STAMPS.length ? '<div style="margin-top:16px;padding:12px;border:1px dashed #d4af37;text-align:center;font-size:12px;color:#d4af37;">🎊 全制覇！ 件名に「皆伝」でお問い合わせください。</div>' : ''}
        </div>
      `;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
    });
  }

  // ============================================================
  // 🖼 画像ホバー（ふわっと浮く）
  // ============================================================
  function initImageHover() {
    document.querySelectorAll('.feat-img,.split-img,.img-card').forEach(el => {
      el.style.transition = 'transform 0.4s ease, box-shadow 0.4s ease';
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'translateY(-6px)';
        el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
        el.style.boxShadow = '';
      });
    });
  }

  // ============================================================
  // 🐱 フッター猫ゆらゆら
  // ============================================================
  function initFooterCats() {
    document.querySelectorAll('footer img[src*="cat-"]').forEach((img, i) => {
      img.style.transition = 'transform 0.3s ease';
      img.style.animation = `catSway ${3 + i * 0.5}s ease-in-out infinite alternate`;
    });
    const style = document.createElement('style');
    style.textContent = `
      @keyframes catSway {
        0% { transform: rotate(-3deg); }
        100% { transform: rotate(3deg); }
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🐾 クリックで肉球エフェクト
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
  // 🃏 カードの3Dティルト（hover時に視点追従）
  // ============================================================
  function initCardTilt() {
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
  // ✨ ナビリンクのアンダーラインアニメーション
  // ============================================================
  function initNavGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .nav-menu a::after {
        content: '';
        position: absolute;
        bottom: 0; left: 0; right: 0;
        height: 2px;
        background: #d4af37;
        transform: scaleX(0);
        transform-origin: right;
        transition: transform 0.3s ease;
      }
      .nav-menu a:hover::after {
        transform: scaleX(1);
        transform-origin: left;
      }
      .nav-menu a { position: relative; }
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
        const suffix = el.dataset.suffix || '';
        const tick = now => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = (Number.isInteger(target) ? Math.floor(target * eased) : (target * eased).toFixed(1)) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  // ============================================================
  // 🌟 ゴールデンテキスト選択色
  // ============================================================
  function initSelectionColor() {
    const style = document.createElement('style');
    style.textContent = `
      ::selection { background: rgba(212,175,55,0.3); color: #0a0a0a; }
      ::-moz-selection { background: rgba(212,175,55,0.3); color: #0a0a0a; }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🐱 フッター猫クリックで鈴音
  // ============================================================
  function initFooterCats() {
    const cats = document.querySelectorAll('footer img[src*="cat-"]');
    cats.forEach((img, i) => {
      // ゆらゆら
      img.style.animation = `catSway ${3 + i * 0.5}s ease-in-out infinite alternate`;
      img.style.cursor = 'pointer';
      // クリックでぴょん
      img.addEventListener('click', e => {
        e.stopPropagation();
        img.animate([
          { transform: 'translateY(0) rotate(0)' },
          { transform: 'translateY(-12px) rotate(10deg)' },
          { transform: 'translateY(0) rotate(0)' }
        ], { duration: 400, easing: 'ease-out' });
        addXP(2);
        // 鈴音
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
    style.textContent = `@keyframes catSway { 0% { transform: rotate(-3deg); } 100% { transform: rotate(3deg); } }`;
    document.head.appendChild(style);
  }

  // ============================================================
  // ⌨️ タイトルのタイピングエフェクト（ヒーローのみ）
  // ============================================================
  function initTyping() {
    const hero = document.querySelector('.hero-text-area h1, .hero-catch-v2');
    if (!hero) return;
    const originalHTML = hero.innerHTML;
    const text = hero.textContent;
    hero.innerHTML = '';
    hero.style.visibility = 'visible';
    let i = 0;
    const type = () => {
      if (i < text.length) {
        hero.textContent += text[i];
        i++;
        setTimeout(type, 40 + Math.random() * 30);
      } else {
        // 終わったらHTML復元（emタグ等）
        hero.innerHTML = originalHTML;
      }
    };
    setTimeout(type, 2500); // ブート画面の後
  }

  // ============================================================
  // 🎯 ボタンhover時にゴールドグロウ
  // ============================================================
  function initButtonGlow() {
    const style = document.createElement('style');
    style.textContent = `
      .btn-gold:hover, .nav-cta:hover {
        box-shadow: 0 0 20px rgba(212,175,55,0.4);
      }
      .btn-line:hover, .btn-ghost:hover {
        box-shadow: 0 0 16px rgba(250,250,247,0.15);
      }
    `;
    document.head.appendChild(style);
  }

  // ============================================================
  // 🔄 スムーズな内部リンクスクロール
  // ============================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
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
    initKonami();
    initStampRally();
    initPawClick();
    initCardTilt();
    initNavGlow();
    initCountUp();
    initSelectionColor();
    initFooterCats();
    initTyping();
    initButtonGlow();
    initSmoothScroll();
    initImageHover();
  });
})();
