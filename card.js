/* AA Rescue membership card. Usage:
   <div class="aac" data-name="Amara Okafor" data-plan="Family" data-tier="family" data-num="1050 0020 2611" data-thru="09/27" data-sample></div>
   AARCard.set(el, {name, plan, tier, num, thru}) updates a card later (dashboard, sign-up preview). */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); };
  var CHK = '<i class="aac__chk k-t"></i><i class="aac__chk k-b"></i><i class="aac__chk k-l"></i><i class="aac__chk k-r"></i>';
  var RINGS = '<svg class="aac__rings" viewBox="0 0 200 200" aria-hidden="true"><circle class="band" cx="100" cy="100" r="22"/><circle class="band" cx="100" cy="100" r="42"/><circle class="band" cx="100" cy="100" r="62"/><circle class="band" cx="100" cy="100" r="82"/><circle class="pulse" cx="100" cy="100" r="96"/><circle class="pulse" cx="100" cy="100" r="96"/><circle class="pulse" cx="100" cy="100" r="96"/></svg>';
  function barcode(seed) {
    var h = 7, i, x = 0, out = '';
    for (i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    for (i = 0; i < 46; i++) { h = (h * 1103515245 + 12345) >>> 0; var w = 1 + (h >>> 16) % 3; if (i % 2 === 0) out += '<rect x="' + x + '" y="0" width="' + w + '" height="30"/>'; x += w + 1; }
    return '<svg viewBox="0 0 ' + x + ' 30" preserveAspectRatio="none" aria-hidden="true">' + out + '</svg>';
  }
  function build(d) {
    var sample = d.sample ? '<span class="aac__smp rv" style="--i:6">Sample</span>' : '';
    return '<div class="aac__float"><div class="aac__tilt"><div class="aac__flip">'
      + '<div class="aac__face aac__front">' + CHK + RINGS
      + '<div class="aac__logo rv" style="--i:0"><b>AA</b><small>RESCUE</small></div>'
      + '<div class="aac__title rv" style="--i:1"><b>Membership</b><span class="aac__plan" data-f="plan">' + esc(d.plan) + '</span></div>'
      + '<div class="aac__chip rv" style="--i:2"></div><svg class="aac__nfc rv" style="--i:2" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5c3 4 3 10 0 14M11 3c4.5 5.5 4.5 12.500 0 18M15 1c6 7 6 15 0 22"/></svg>'
      + '<div class="aac__num rv" style="--i:3" data-f="num">' + esc(d.num) + '</div>'
      + '<div class="aac__name rv" style="--i:4" data-f="name">' + esc(d.name) + '</div>'
      + '<div class="aac__thru rv" style="--i:4"><small>Valid thru</small><b data-f="thru">' + esc(d.thru) + '</b></div>'
      + '<div class="aac__tag rv" style="--i:5"><span>We stand by our members in times of emergency</span><span>24/7</span></div>'
      + sample + '<div class="aac__sheen"></div><div class="aac__glare"></div></div>'
      + '<div class="aac__face aac__back">' + CHK
      + '<div class="aac__stripe"></div><div class="aac__sign"><span data-f="sign">' + esc(d.name) + '</span><small>Authorised signature</small></div>'
      + '<div class="aac__info"><p><b>24-hour rescue and recovery:</b> Lagos, Abuja, Port Harcourt</p><p>Lagos <b>0802 555 1111</b> &middot; Abuja <b>0802 555 3333</b></p><p>Port Harcourt <b>0802 555 6666</b> &middot; customercare@aarescuenigeria.com</p></div>'
      + '<div class="aac__bar">' + barcode(d.num || 'AAR') + '</div><div class="aac__fine">Quote your member number when you call for help.</div>'
      + '<div class="aac__sheen"></div><div class="aac__glare"></div></div>'
      + '</div></div></div>';
  }
  function scramble(el, text) {
    if (reduce || !el) { if (el) el.textContent = text; return; }
    var t0 = performance.now(), dur = 1100, chars = '0123456789';
    (function tick(t) {
      var p = Math.min(1, (t - t0) / dur), n = Math.floor(p * text.length), out = '', i;
      for (i = 0; i < text.length; i++) out += (i < n || /[^0-9A-Z]/.test(text[i])) ? text[i] : chars[Math.floor(Math.random() * 10)];
      el.textContent = out; if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function read(el) { var g = function (k) { return el.getAttribute('data-' + k) || ''; }; return { name: g('name'), plan: g('plan'), tier: g('tier') || 'standard', num: g('num'), thru: g('thru'), sample: el.hasAttribute('data-sample') }; }
  function fields(el, d) {
    [].forEach.call(el.querySelectorAll('[data-f]'), function (n) {
      var k = n.getAttribute('data-f'), v = k === 'sign' ? d.name : d[k]; if (v != null && n.textContent !== String(v)) n.textContent = v;
    });
    if (d.tier) el.setAttribute('data-tier', d.tier);
    el.classList.toggle('aac--long', String(d.name || '').length > 17);
    el.setAttribute('aria-label', 'AA Rescue membership card for ' + (d.name || 'member') + ', ' + (d.plan || '') + ' plan. Press to flip.');
  }
  function flip(el, on) { el.classList.toggle('is-flipped', on == null ? !el.classList.contains('is-flipped') : on); }
  function bind(el) {
    el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
    el.addEventListener('click', function () { flip(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(el); } });
    if (fine && !reduce) {
      var tilt = el.querySelector('.aac__tilt');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.classList.add('is-tilting');
        tilt.style.setProperty('--ry', ((x - .5) * 22).toFixed(2) + 'deg'); tilt.style.setProperty('--rx', ((.5 - y) * 18).toFixed(2) + 'deg');
        [].forEach.call(el.querySelectorAll('.aac__face'), function (f) { f.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); f.style.setProperty('--my', (y * 100).toFixed(1) + '%'); });
      });
      el.addEventListener('pointerleave', function () { el.classList.remove('is-tilting'); tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
    }
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); play(e.target); } });
  }, { threshold: 0.35 }) : null;
  function play(el) { el.classList.add('aac--in'); var n = el.querySelector('.aac__num'); if (n) scramble(n, el._d.num); }
  function mount(el, d) {
    d = d || read(el); el._d = d;
    if (!el._built) { el.innerHTML = build(d); el._built = true; bind(el); if (io) io.observe(el); else play(el); }
    fields(el, d); return el;
  }
  function set(el, patch) {
    var d = el._d || read(el); for (var k in patch) d[k] = patch[k]; el._d = d;
    if (!el._built) return mount(el, d);
    fields(el, d);
    var n = el.querySelector('.aac__num'); if (n && patch.num != null) n.textContent = patch.num;
    var bar = el.querySelector('.aac__bar'); if (bar && patch.num != null) bar.innerHTML = barcode(d.num);
    return el;
  }
  function replay(el) { el.classList.remove('aac--in'); void el.offsetWidth; el.classList.add('aac--in'); var n = el.querySelector('.aac__num'); if (n) scramble(n, el._d.num); }
  window.AARCard = { mount: mount, set: set, flip: flip, replay: replay };
  function init() { [].forEach.call(document.querySelectorAll('.aac[data-name]:not([data-manual])'), function (el) { mount(el); }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
