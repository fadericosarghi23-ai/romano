/* Animazioni leggere + intro — Laura Romanò
   - Intro mostrata una sola volta per sessione, all'apertura del sito.
   - Reveal allo scroll SOLO su blocchi di testo e tile home (mai immagini/slider).
   - Tutto fail-safe: in caso di errore o browser incompatibile, la pagina resta
     pienamente visibile e l'intro viene rimossa comunque. */
(function () {
  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  /* ── INTRO (subito, prima del render del body) ───────────────────── */
  try {
    var firstVisit = true;
    try { firstVisit = !sessionStorage.getItem('lrIntroShown'); } catch (e) {}
    // Refresh e avanti/indietro NON devono mostrare l'intro: solo all'apertura del sito.
    var isReload = false;
    try {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      isReload = nav ? (nav.type === 'reload' || nav.type === 'back_forward')
                     : (performance.navigation && performance.navigation.type === 1);
    } catch (e) {}
    var force = /[?&]intro\b/.test(location.search);   // ?intro forza l'intro (demo/test)
    if (force) { firstVisit = true; isReload = false; }
    if (firstVisit && !isReload && !reduce) {
      try { sessionStorage.setItem('lrIntroShown', '1'); } catch (e) {}
      var ov = document.createElement('div');
      ov.id = 'lr-intro';
      ov.setAttribute('aria-hidden', 'true');
      // stili critici inline: coprono la pagina anche se il CSS tarda
      ov.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:#f4f1ee;';
      ov.innerHTML =
        '<svg class="lr-sig" viewBox="0 0 520 240" xmlns="http://www.w3.org/2000/svg" focusable="false">' +
          '<defs>' +
            '<linearGradient id="lrInk" x1="0" y1="0" x2="1" y2="0">' +
              '<stop offset="0" stop-color="#fff"/><stop offset=".84" stop-color="#fff"/>' +
              '<stop offset="1" stop-color="#fff" stop-opacity="0"/>' +
            '</linearGradient>' +
            '<mask id="lrPen" maskUnits="userSpaceOnUse" x="-200" y="-200" width="1200" height="700">' +
              '<rect class="lr-wipe" x="0" y="0" width="10" height="10" fill="url(#lrInk)"/>' +
            '</mask>' +
          '</defs>' +
          '<text class="lr-name lr-line lr-line1" x="0" y="80" font-size="88">LAURA</text>' +
          '<text class="lr-name lr-line lr-line2" x="0" y="160" font-size="88">ROMANÒ</text>' +
          '<text class="lr-arch" x="170" y="215" font-size="100" mask="url(#lrPen)">architect</text>' +
        '</svg>';
      (document.body || document.documentElement).appendChild(ov);

      var removeIntro = function () { if (ov && ov.parentNode) ov.parentNode.removeChild(ov); };
      var exitIntro = function () {
        if (ov.classList.contains('lr-intro-out')) return;
        ov.classList.add('lr-intro-out');
        setTimeout(removeIntro, 1000);
      };

      // Impagina come nel logo: "architect" parte a ~44% del nome, largo ~95%
      // del nome, con la base poco sotto "ROMANÒ". Misurato sui font reali.
      var layout = function () {
        var svg = ov.querySelector('svg');
        var l1 = svg.querySelector('.lr-line1'), l2 = svg.querySelector('.lr-line2');
        var ar = svg.querySelector('.lr-arch'), wipe = svg.querySelector('.lr-wipe');
        var b1 = l1.getBBox(), b2 = l2.getBBox();
        var nameW = Math.max(b1.width, b2.width);
        var aw = ar.getBBox().width || 1;
        ar.setAttribute('font-size', (100 * (nameW * 0.95) / aw).toFixed(1));
        ar.setAttribute('x', (b2.x + nameW * 0.44).toFixed(1));
        ar.setAttribute('y', (160 + 88 * 0.7 * 0.78).toFixed(1));
        var ba = ar.getBBox();
        // la maschera copre la parola; la punta sfumata (ultimo 16%) finisce oltre il testo
        wipe.setAttribute('x', (ba.x - 6).toFixed(1));
        wipe.setAttribute('y', (ba.y - 14).toFixed(1));
        wipe.setAttribute('height', (ba.height + 28).toFixed(1));
        wipe.setAttribute('width', ((ba.width + 16) / 0.84).toFixed(1));
        var minX = Math.min(b1.x, b2.x, ba.x) - 10, minY = Math.min(b1.y, ba.y) - 10;
        var maxX = Math.max(b1.x + b1.width, b2.x + b2.width, ba.x + ba.width) + 10;
        var maxY = Math.max(b2.y + b2.height, ba.y + ba.height) + 10;
        svg.setAttribute('viewBox', [minX, minY, maxX - minX, maxY - minY].map(function (v) { return v.toFixed(1); }).join(' '));
      };

      var started = false;
      var go = function () {
        if (started) return; started = true;
        try { layout(); } catch (e) {}
        ov.classList.add('lr-go');
        setTimeout(exitIntro, 2900);            // nome + scrittura + breve pausa
      };
      // aspetta i font (Lexend Deca + corsivo daniel), ma non oltre 1.2s
      try {
        Promise.all([
          document.fonts.load('500 88px "Lexend Deca"'),
          document.fonts.load('100px danielregular')
        ]).then(go, go);
      } catch (e) { go(); }
      setTimeout(go, 1200);

      ov.addEventListener('click', exitIntro);      // clic/tap per saltare
      setTimeout(removeIntro, 6500);                // fail-safe assoluto
    }
  } catch (e) {}

  /* ── REVEAL allo scroll (dopo il DOM) ────────────────────────────── */
  function initReveal() {
    try {
      if (!('IntersectionObserver' in window)) return; // nessun gate: tutto visibile
      var content = document.querySelector('#content') || document.querySelector('main') || document.body;
      if (!content) return;
      document.documentElement.classList.add('lr-anim');

      var excluded = function (el) {
        if (el.closest('.site-header') || el.closest('.site-footer')) return true;
        // MAI toccare gli slider né il loro contenuto
        if (el.closest('.sow-slider-base') || el.querySelector('.sow-slider-base')) return true;
        return false;
      };
      var hasText = function (el) { return (el.textContent || '').replace(/\s+/g, '') !== ''; };

      // 1) elementi di TESTO (titoli, paragrafi, liste, citazioni), ovunque nel contenuto
      var textSel = 'h1, h2, h3, h4, h5, p, li, blockquote, figcaption';
      var textTargets = Array.prototype.slice.call(content.querySelectorAll(textSel))
        .filter(function (el) {
          if (excluded(el)) return false;
          if (!hasText(el)) return false;
          // solo "foglie" di testo: niente <li> che contiene <p>, ecc.
          if (el.querySelector(textSel)) return false;
          return true;
        });

      // 2) blocchi di sola immagine (tile senza testo): così entrano anche loro
      var blockTargets = Array.prototype.slice.call(content.querySelectorAll('.panel-grid-cell'))
        .filter(function (el) {
          if (excluded(el)) return false;
          if (el.querySelector(textSel)) return false; // ha testo → lo gestiamo per-elemento
          return !!el.querySelector('img');
        });

      var targets = textTargets.concat(blockTargets);
      // niente reveal annidati
      var reveal = targets.filter(function (el) {
        return !targets.some(function (p) { return p !== el && p.contains(el); });
      });
      var idxByParent = new Map();
      reveal.forEach(function (el) {
        el.classList.add('lr-reveal');
        if (/^H[1-4]$/.test(el.tagName)) el.classList.add('lr-head');
        // stagger "a cascata": ritardo crescente tra fratelli dello stesso blocco
        var p = el.parentNode;
        var i = idxByParent.get(p) || 0; idxByParent.set(p, i + 1);
        if (i > 0) el.style.setProperty('--lr-d', Math.min(i, 6) * 0.08 + 's');
      });

      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('lr-in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });
      reveal.forEach(function (el) { io.observe(el); });

      // Niente "reveal-all" anticipato: così l'animazione si vede davvero mentre
      // scrolli. Rete di sicurezza: arrivati in fondo alla pagina, rivela ciò
      // che restasse (gli ultimi elementi che non raggiungono la soglia).
      var onEnd = function () {
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
          reveal.forEach(function (el) { el.classList.add('lr-in'); });
          window.removeEventListener('scroll', onEnd);
        }
      };
      window.addEventListener('scroll', onEnd, { passive: true });
      // Fail-safe assoluto e lungo: nulla resta nascosto se l'IO non scattasse.
      setTimeout(function () {
        reveal.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (!el.classList.contains('lr-in') && r.top < window.innerHeight) el.classList.add('lr-in');
        });
      }, 9000);
    } catch (e) {
      try { document.documentElement.classList.remove('lr-anim'); } catch (_) {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initReveal);
  else initReveal();
})();
