(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };

  /* ---------- Mobile menu ---------- */
  var hd = $('#hd'), mb = $('#mb'), nav = $('#nav'), mbUse = $('use', mb);
  function setMenu(open) {
    nav.classList.toggle('open', open);
    mb.setAttribute('aria-expanded', open);
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mbUse.setAttribute('href', open ? '#i-x' : '#i-menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) hd.classList.remove('hide'); else setDD(false);
  }
  mb.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });

  /* Services dropdown: hover/focus handled in CSS; click toggles for touch and keyboard */
  var dd = $('.dd'), ddb = $('.ddb');
  function setDD(open) { dd.classList.toggle('open', open); ddb.setAttribute('aria-expanded', open); }
  ddb.addEventListener('click', function () { setDD(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDD(false); });
  dd.addEventListener('mouseenter', function () { ddb.setAttribute('aria-expanded', 'true'); });
  dd.addEventListener('mouseleave', function () { ddb.setAttribute('aria-expanded', dd.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setDD(false); } });

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */
  var prog = $('.prog i'), fab = $('#fab'), hi = $('#hbg');
  var pin = $('#how'), steps = $$('.ps li', pin), rd = $('.rd', pin), rpn = $('.rpn', pin);
  var pars = $$('.pf img');
  var lastY = 0, ticking = false;

  function pinned() { return !reduce && window.innerWidth >= 900; }

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = root.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);

    hd.classList.toggle('sc', y > 40);
    if (!nav.classList.contains('open')) hd.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4) hd.classList.remove('hide');
    lastY = y;
    fab.classList.toggle('show', y > 520);

    if (!reduce) {
      if (y < vh * 1.2) hi.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
      pars.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', (c * -40).toFixed(1) + 'px');
      });
    }

    if (pinned()) {
      var top = pin.offsetTop, span = pin.offsetHeight - vh;
      var p = clamp((y - top) / span, 0, 1);
      pin.style.setProperty('--p', p.toFixed(4));
      var idx = p < 0.34 ? 0 : p < 0.7 ? 1 : 2;
      steps.forEach(function (li, i) { li.classList.toggle('on', i <= idx); });
      rpn.style.opacity = p > 0.97 ? 1 : 0.35;
    } else {
      steps.forEach(function (li) { li.classList.add('on'); });
    }
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  update();

  /* ---------- Reveal on scroll ---------- */
  $$('[data-stagger]').forEach(function (g) {
    $$('[data-r]', g).forEach(function (el, i) { el.style.setProperty('--d', Math.min(i * 0.07, 0.42) + 's'); });
  });
  var targets = $$('[data-r]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Counters ---------- */
  function count(el) {
    var n = +el.dataset.n, s = el.dataset.s || '';
    if (reduce) { el.textContent = n.toLocaleString('en-US') + s; return; }
    var t0 = performance.now(), dur = 1600;
    (function tick(t) {
      var p = clamp((t - t0) / dur, 0, 1);
      el.textContent = Math.round(n * (1 - Math.pow(1 - p, 4))).toLocaleString('en-US') + s;
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  if ('IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { co.unobserve(e.target); count(e.target); } });
    }, { threshold: 0.6 });
    $$('[data-n]').forEach(function (el) { co.observe(el); });
  }

  /* ---------- Spotlight hover ---------- */
  $$('.spot').forEach(function (el) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Tracking form ----------
     Set TRACKING_API to your endpoint (GET <url>?id=<ID>) returning JSON:
     { "title":"...", "location":"...", "value":"Oct 11", "label":"EST. DELIVERY", "pct":62, "stage":2 }
     stage is 0-3 (Booked, Loaded, In transit, Delivered) or null. A 404 means "not found".
     While TRACKING_API is empty, the DEMO records below are used. */
  var TRACKING_API = '';
  var DEMO = {
    'REC-042-LEK': { title: 'Flatbed Unit #042 En Route', location: 'Lagos-Ibadan Toll Plaza \u00b7 Sector 3B', value: '14 MIN', label: 'EST. ARRIVAL', pct: 75, stage: null },
    'HAUL-1001': { title: 'Multi-loader haulage \u00b7 8 vehicles', location: 'Apapa, Lagos to Abuja \u00b7 now near Ilorin', value: 'OCT 11', label: 'EST. DELIVERY', pct: 62, stage: 2 },
    'HAUL-1002': { title: 'Flatbed haulage \u00b7 1 vehicle', location: 'Port Harcourt to Lagos', value: 'DONE', label: 'DELIVERED', pct: 100, stage: 3 }
  };
  var form = $('#trk'), input = $('#tid'), msg = $('#tmsg'), submit = $('button', form);
  var out = { id: $('#did'), t: $('#tt'), l: $('#tl'), v: $('#tv'), k: $('#tk2'), bar: $('#tbar'), stg: $('#stg') };
  var barBox = $('.bar', form.parentNode);
  var initial = { title: out.t.textContent, location: out.l.textContent, value: out.v.textContent, label: out.k.textContent, pct: 75, stage: null };

  function show(id, d) {
    out.id.textContent = 'ID: #' + id;
    out.t.textContent = d.title; out.l.textContent = d.location;
    out.v.textContent = d.value; out.k.textContent = d.label;
    out.bar.style.width = d.pct + '%';
    barBox.setAttribute('aria-valuenow', d.pct);
    var has = d.stage !== null && d.stage !== undefined;
    out.stg.hidden = !has;
    if (has) $$('li', out.stg).forEach(function (li, i) { li.classList.toggle('on', i <= d.stage); });
  }
  function lookup(id) {
    if (TRACKING_API) {
      return fetch(TRACKING_API + '?id=' + encodeURIComponent(id), { headers: { Accept: 'application/json' } })
        .then(function (r) { if (r.status === 404) throw new Error('nf'); if (!r.ok) throw new Error('err'); return r.json(); });
    }
    return new Promise(function (res, rej) { setTimeout(function () { DEMO[id] ? res(DEMO[id]) : rej(new Error('nf')); }, 450); });
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var id = input.value.trim().toUpperCase().replace(/^#/, '');
    input.removeAttribute('aria-invalid');
    if (!/^[A-Z0-9-]{4,24}$/.test(id)) {
      input.setAttribute('aria-invalid', 'true');
      msg.style.color = ''; msg.textContent = 'Enter a valid tracking ID, for example HAUL-1001.';
      input.focus(); return;
    }
    msg.textContent = ''; submit.disabled = true;
    lookup(id).then(function (d) {
      show(id, d);
      msg.style.color = 'rgba(255,255,255,.6)';
      msg.textContent = TRACKING_API ? 'Status updated just now.' : 'Showing demo data until the tracking API is connected.';
    }).catch(function (err) {
      input.setAttribute('aria-invalid', 'true'); msg.style.color = '';
      msg.textContent = err.message === 'nf' ? 'No transport found for that ID. Check it and try again.' : 'Tracking is unavailable right now. Call 0802 555 1111.';
    }).then(function () { submit.disabled = false; });
  });
  input.addEventListener('input', function () {
    if (!input.value) { input.removeAttribute('aria-invalid'); msg.textContent = ''; show('REC-042-LEK', initial); }
  });

  /* ---------- Newsletter (front-end only: connect to your email provider) ---------- */
  var nlf = $('#nlf'), nle = $('#nle'), nlm = $('#nlm');
  nlf.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nle.value.trim())) { nlm.textContent = 'Please enter a valid email address.'; nle.focus(); return; }
    nlm.textContent = 'Thanks! You are on the list.'; nle.value = '';
  });

  var y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();
