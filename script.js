(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (n, a, b) { return Math.min(b, Math.max(a, n)); };

  /* ---------- Mobile menu + Services dropdown ---------- */
  var hd = $('#hd'), mb = $('#mb'), nav = $('#nav'), mbUse = $('use', mb);
  var dd = $('.dd'), ddb = $('.ddb');
  function setDD(open) { dd.classList.toggle('open', open); ddb.setAttribute('aria-expanded', open); }
  function setMenu(open) {
    nav.classList.toggle('open', open);
    hd.classList.toggle('menu-open', open);
    mb.setAttribute('aria-expanded', open);
    mb.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mbUse.setAttribute('href', open ? '#i-x' : '#i-menu');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) hd.classList.remove('hide'); else setDD(false);
  }
  mb.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  ddb.addEventListener('click', function () { setDD(!dd.classList.contains('open')); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) setDD(false); });
  dd.addEventListener('mouseenter', function () { ddb.setAttribute('aria-expanded', 'true'); });
  dd.addEventListener('mouseleave', function () { ddb.setAttribute('aria-expanded', dd.classList.contains('open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setDD(false); } });

  /* ---------- Scroll-driven effects (one rAF loop) ---------- */
  var fab = $('#fab'), hbg = $('#hbg');
  var pin = $('#how'), steps = pin ? $$('.ps li', pin) : [], rpn = pin ? $('.rpn', pin) : null;
  var pars = $$('.pf img');
  var lastY = 0, ticking = false;
  function pinned() { return pin && !reduce && window.innerWidth >= 900; }

  function update() {
    ticking = false;
    var y = window.scrollY, vh = window.innerHeight;
    var max = root.scrollHeight - vh;
    root.style.setProperty('--sp', max > 0 ? (y / max).toFixed(4) : 0);

    hd.classList.toggle('is-scrolled', y > 40);
    if (!nav.classList.contains('open')) hd.classList.toggle('hide', y > 500 && y > lastY + 4);
    if (y < lastY - 4) hd.classList.remove('hide');
    lastY = y;
    if (fab) fab.classList.toggle('show', y > 520);

    if (!reduce) {
      if (hbg && y < vh * 1.4) hbg.style.setProperty('--py', (y * 0.22).toFixed(1) + 'px');
      pars.forEach(function (img) {
        var r = img.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var c = (r.top + r.height / 2 - vh / 2) / vh;
        img.style.setProperty('--py', (c * -40).toFixed(1) + 'px');
      });
    }

    if (pin) {
      if (pinned()) {
        var top = pin.offsetTop, span = pin.offsetHeight - vh;
        var p = clamp((y - top) / span, 0, 1);
        pin.style.setProperty('--p', p.toFixed(4));
        var idx = p < 0.34 ? 0 : p < 0.7 ? 1 : 2;
        steps.forEach(function (li, i) { li.classList.toggle('on', i <= idx); });
        if (rpn) rpn.style.opacity = p > 0.97 ? 1 : 0.35;
      } else {
        steps.forEach(function (li) { li.classList.add('on'); });
      }
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

  /* ---------- Tracking form (home page) ----------
     Set TRACKING_API to your endpoint (GET <url>?id=<ID>) returning JSON:
     { "title":"...", "location":"...", "value":"Oct 11", "label":"EST. DELIVERY", "pct":62, "stage":2 }
     stage is 0-3 (Booked, Loaded, In transit, Delivered) or null. A 404 means "not found".
     While TRACKING_API is empty, the DEMO records below are used. */
  var form = $('#trk');
  if (form) {
    var TRACKING_API = '';
    var DEMO = {
      'REC-042-LEK': { title: 'Flatbed Unit #042 En Route', location: 'Lagos-Ibadan Toll Plaza \u00b7 Sector 3B', value: '14 MIN', label: 'EST. ARRIVAL', pct: 75, stage: null },
      'HAUL-1001': { title: 'Multi-loader haulage \u00b7 8 vehicles', location: 'Apapa, Lagos to Abuja \u00b7 now near Ilorin', value: 'OCT 11', label: 'EST. DELIVERY', pct: 62, stage: 2 },
      'HAUL-1002': { title: 'Flatbed haulage \u00b7 1 vehicle', location: 'Port Harcourt to Lagos', value: 'DONE', label: 'DELIVERED', pct: 100, stage: 3 }
    };
    var input = $('#tid'), msg = $('#tmsg'), submit = $('button', form);
    var out = { id: $('#did'), t: $('#tt'), l: $('#tl'), v: $('#tv'), k: $('#tk2'), bar: $('#tbar'), stg: $('#stg') };
    var barBox = $('.bar', form.parentNode);
    var initial = { title: out.t.textContent, location: out.l.textContent, value: out.v.textContent, label: out.k.textContent, pct: 75, stage: null };

    var show = function (id, d) {
      out.id.textContent = 'ID: #' + id;
      out.t.textContent = d.title; out.l.textContent = d.location;
      out.v.textContent = d.value; out.k.textContent = d.label;
      out.bar.style.width = d.pct + '%';
      barBox.setAttribute('aria-valuenow', d.pct);
      var has = d.stage !== null && d.stage !== undefined;
      out.stg.hidden = !has;
      if (has) $$('li', out.stg).forEach(function (li, i) { li.classList.toggle('on', i <= d.stage); });
    };
    var lookup = function (id) {
      if (TRACKING_API) {
        return fetch(TRACKING_API + '?id=' + encodeURIComponent(id), { headers: { Accept: 'application/json' } })
          .then(function (r) { if (r.status === 404) throw new Error('nf'); if (!r.ok) throw new Error('err'); return r.json(); });
      }
      return new Promise(function (res, rej) { setTimeout(function () { DEMO[id] ? res(DEMO[id]) : rej(new Error('nf')); }, 450); });
    };
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
  }

  /* ---------- Newsletter: footer form, post prompts and the 15-second popup ----------
     Front-end only. Set NEWSLETTER_API to your endpoint (POST JSON {email, source}) and have it send the
     welcome email: "Welcome! You'll now receive updates, offers, and news." */
  var NEWSLETTER_API = '';
  var WELCOME = "Welcome! You'll now receive updates, offers, and news.";
  var okEmail = function (v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()); };
  function subscribe(email, source) {
    var done = function () { try { localStorage.setItem('aar_nl', '1'); } catch (e) {} };
    if (!NEWSLETTER_API) { done(); return Promise.resolve(); }
    return fetch(NEWSLETTER_API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), source: source }) })
      .then(function (r) { if (!r.ok) throw new Error('x'); done(); });
  }
  function nlSubmit(form, input, out, source, after) {
    if (!okEmail(input.value)) { out.textContent = 'Please enter a valid email address.'; input.focus(); return; }
    out.textContent = '';
    subscribe(input.value, source).then(function () { out.textContent = WELCOME; input.value = ''; if (after) after(); })
      .catch(function () { out.textContent = 'We could not send this. Check your connection and try again, or call 0802 555 1111.'; });
  }
  var nlf = $('#nlf'), nle = $('#nle'), nlm = $('#nlm');
  if (nlf) nlf.addEventListener('submit', function (e) { e.preventDefault(); nlSubmit(nlf, nle, nlm, 'footer'); });
  document.addEventListener('submit', function (e) {
    var f = e.target.closest ? e.target.closest('form.nlsub') : null; if (!f) return;
    e.preventDefault();
    nlSubmit(f, $('input', f), $('.nlm', f), f.dataset.src || 'post', f.dataset.src === 'popup' ? function () { setTimeout(closeNl, 2200); } : null);
  });
  var nlp = null;
  function closeNl() { if (nlp) { nlp.classList.remove('open'); nlp.setAttribute('aria-hidden', 'true'); } try { sessionStorage.setItem('aar_nlp', '1'); } catch (e) {} }
  function openNl() {
    nlp = document.createElement('div'); nlp.className = 'nlp'; nlp.setAttribute('role', 'dialog'); nlp.setAttribute('aria-modal', 'true'); nlp.setAttribute('aria-labelledby', 'nlt');
    nlp.innerHTML = '<div class="nlc"><button class="nlx" type="button" aria-label="Close"><svg class="ic" viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg></button>'
      + '<span class="ico"><svg class="ic" viewBox="0 0 24 24" width="26" height="26"><path d="M4 6h16v12H4zM4 7l8 6 8-6" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"/></svg></span>'
      + '<h2 id="nlt">Stay in the loop</h2><p>Get updates, offers, and news from AA Rescue straight to your inbox.</p>'
      + '<form class="nlsub" data-src="popup" novalidate><input type="email" placeholder="Enter your email" autocomplete="email" aria-label="Email address"><button class="b by" type="submit">Subscribe</button><p class="nlm" role="status" aria-live="polite"></p></form>'
      + '<button class="nln" type="button">No thanks</button></div>';
    document.body.appendChild(nlp);
    $('.nlx', nlp).onclick = closeNl; $('.nln', nlp).onclick = closeNl;
    nlp.addEventListener('click', function (e) { if (e.target === nlp) closeNl(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nlp.classList.contains('open')) closeNl(); });
    requestAnimationFrame(function () { nlp.classList.add('open'); nlp.setAttribute('aria-hidden', 'false'); $('input', nlp).focus({ preventScroll: true }); });
  }
  (function popupTimer() {
    var subbed = false, seen = false;
    try { subbed = localStorage.getItem('aar_nl') === '1'; seen = sessionStorage.getItem('aar_nlp') === '1'; } catch (e) {}
    if (subbed || seen || !$('#nlf')) return;
    var busyPop = function () { return $('#bpm.open') || document.body.style.overflow === 'hidden'; };
    if ($('section.hero')) {
      /* homepage: open the popup once the visitor has scrolled a while (about 40% of the page, at least 900px) */
      var armed = true;
      var check = function () {
        if (!armed || busyPop()) return;
        var max = root.scrollHeight - window.innerHeight;
        if (window.scrollY > Math.max(900, max * 0.4)) { armed = false; window.removeEventListener('scroll', check); openNl(); }
      };
      window.addEventListener('scroll', check, { passive: true });
      return;
    }
    /* other pages: 15 seconds after load */
    var tries = 0;
    setTimeout(function wait() {
      if (busyPop() && tries++ < 20) return setTimeout(wait, 3000);
      if (!busyPop()) openNl();
    }, 15000);
  })();

  /* ---------- Blog (sample posts: edit this list) ---------- */
  var POSTS = [
    { cat: 'News', title: 'Membership plans from \u20A6150,000', excerpt: 'Standard cover for one car starts at \u20A6150,000, with 24-hour recovery in Lagos, Abuja and Port Harcourt.',
      body: ['AA Rescue membership is priced by the number of vehicles you register. Standard (1 car) is \u20A6150,000, Family (2 cars) is \u20A6280,000 and Comprehensive (3 cars) is \u20A6360,000.', 'Members also enjoy rapid response and 3% off other AA Rescue services. See the membership page for fleet plans.'] },
    { cat: 'Tips', title: '5 checks to make before a long trip', excerpt: 'Tyres, oil, lights, brakes and coolant: a quick routine that prevents most breakdowns.',
      body: ['Before a long journey, check your tyre pressure and tread, engine oil, lights, brakes and coolant level. Carry a spare tyre, a warning triangle and a charged phone.', 'A few minutes of checking at home is far cheaper than a breakdown on the road. If anything looks wrong, call us before you set off.'] },
    { cat: 'Tips', title: 'Broken down on the expressway? Do this first', excerpt: 'Stay calm, get safe and call for help. Here is the step-by-step plan our team recommends.',
      body: ['Switch on your hazard lights, move the vehicle as far off the road as you safely can, and get everyone out on the side away from traffic.', 'Place a warning triangle behind the vehicle if it is safe, then call our 24-hour line on 0802 555 1111 and share your exact location.'] },
    { cat: 'Company Updates', title: 'New learner registration: what to expect', excerpt: 'Registration days, your introduction session and how your lessons are scheduled.',
      body: ['New learners are registered every Monday and Friday at 3:00 PM, and introduction sessions hold every Monday and Tuesday.', 'After registration our team confirms your lesson schedule with you. All training must be completed within three months of starting.'] }
  ];
  function postCard(p, full) {
    var c = document.createElement('article'); c.className = 'bgc';
    var sm = document.createElement('small'); sm.textContent = p.cat; c.appendChild(sm);
    var h = document.createElement('h3'); h.textContent = p.title; c.appendChild(h);
    var ex = document.createElement('p'); ex.textContent = p.excerpt; c.appendChild(ex);
    if (full) {
      var d = document.createElement('details'), s = document.createElement('summary'), pb = document.createElement('div');
      s.textContent = 'Read more'; pb.className = 'pb';
      p.body.forEach(function (t) { var q = document.createElement('p'); q.textContent = t; pb.appendChild(q); });
      pb.insertAdjacentHTML('beforeend', '<div class="psub"><b>Enjoyed this post?</b><p>Get news, tips and company updates in your inbox.</p><form class="nlsub" data-src="post" novalidate><input type="email" placeholder="Enter your email" autocomplete="email" aria-label="Email address"><button class="b by" type="submit">Subscribe</button><p class="nlm" role="status" aria-live="polite"></p></form></div>');
      d.appendChild(s); d.appendChild(pb); c.appendChild(d);
    }
    return c;
  }
  var bg = $('#bgrid'), bcats = $('#bcats'), bh = $('#bhome');
  if (bg && bcats) {
    var cats = ['All', 'News', 'Tips', 'Company Updates'], act = 'All';
    var draw = function () {
      bg.innerHTML = ''; POSTS.filter(function (p) { return act === 'All' || p.cat === act; }).forEach(function (p) { bg.appendChild(postCard(p, true)); });
      [].forEach.call(bcats.children, function (b) { b.setAttribute('aria-pressed', b.dataset.c === act ? 'true' : 'false'); });
    };
    cats.forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.dataset.c = c; b.textContent = c; b.onclick = function () { act = c; draw(); }; bcats.appendChild(b); });
    draw();
    var hash = decodeURIComponent((location.hash || '').slice(1)); if (cats.indexOf(hash) > 0) { act = hash; draw(); }
  }
  if (bh) POSTS.slice(0, 3).forEach(function (p) { bh.appendChild(postCard(p, false)); });

  /* ---------- Clients carousel: local logo first, then the existing-site logo, then the client's name ---------- */
  $$('.cc').forEach(function (cc) {
    $$('.ccl img', cc).forEach(function (img) {
      var li = img.parentNode, tried = false;
      function fail() {
        if (!tried && img.dataset.fallback) { tried = true; img.src = img.dataset.fallback; }
        else li.classList.add('noimg');
      }
      img.addEventListener('error', fail);
      if (img.complete && img.naturalWidth === 0) fail();
    });
    var btn = $('.ccp', cc);
    if (btn) btn.addEventListener('click', function () {
      var p = cc.classList.toggle('paused');
      btn.setAttribute('aria-pressed', p);
      btn.setAttribute('aria-label', p ? 'Play logo carousel' : 'Pause logo carousel');
      $('use', btn).setAttribute('href', p ? '#i-play' : '#i-pause');
    });
  });

  /* ---------- Tire cursor (styles live in styles.css) ---------- */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var tireSvg = '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22.5" fill="#15161a" stroke="rgba(255,255,255,.6)" stroke-width="1.2"/><circle cx="24" cy="24" r="20" fill="none" stroke="#3b3e46" stroke-width="5" stroke-dasharray="5 3.2"/><circle cx="24" cy="24" r="14.5" fill="#0b0b0d"/><circle cx="24" cy="24" r="12" fill="#e4e7ec"/><circle cx="24" cy="24" r="12" fill="none" stroke="#FFC400" stroke-width="2"/><path d="M24 24V13M24 24l10.5-3.4M24 24l6.5 8.9M24 24l-6.5 8.9M24 24l-10.5-3.4" stroke="#8a8f98" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="24" r="3.2" fill="#15161a"/></svg>';
    var tire = document.createElement('div');
    tire.className = 'tire'; tire.setAttribute('aria-hidden', 'true');
    tire.innerHTML = '<div class="tw">' + tireSvg + '</div>';
    document.body.appendChild(tire);
    root.classList.add('tire-on');
    var tw = tire.firstChild, mx = 0, my = 0, cx = 0, cy = 0, lx = 0, ly = 0, rot = 0, acc = 0, live = false, heading = 0;
    var tick = function () {
      if (!live) return;
      cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2;
      var dx = cx - lx, dy = cy - ly, d = Math.hypot(dx, dy);
      if (d > 0.05) {
        heading = Math.atan2(dy, dx);
        var dir = Math.abs(dx) >= Math.abs(dy) ? (dx >= 0 ? 1 : -1) : (dy >= 0 ? 1 : -1);
        rot += d * 4.5 * dir;
        if (!reduce) {
          acc += d;
          if (acc > 30) {
            acc = 0;
            var k = document.createElement('div');
            k.className = 'tm';
            k.style.transform = 'translate(' + cx + 'px,' + cy + 'px) rotate(' + heading + 'rad) translateY(-3.5px)';
            k.addEventListener('animationend', function () { k.remove(); });
            document.body.appendChild(k);
          }
        }
      }
      lx = cx; ly = cy;
      tire.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      tw.style.rotate = rot + 'deg';
      requestAnimationFrame(tick);
    };
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      if (!live) { live = true; cx = lx = mx; cy = ly = my; tire.style.opacity = 1; requestAnimationFrame(tick); }
      var t = e.target;
      if (t && t.closest) {
        tire.classList.toggle('hot', !!t.closest('a,button,summary,label,select,[role=button]'));
        tire.classList.toggle('txt', !!t.closest('input,textarea'));
      }
    });
    document.addEventListener('mousedown', function () { tire.classList.add('down'); });
    document.addEventListener('mouseup', function () { tire.classList.remove('down'); });
    root.addEventListener('mouseleave', function () { tire.style.opacity = 0; live = false; });
  }

  var y = $('#y'); if (y) y.textContent = new Date().getFullYear();
})();
