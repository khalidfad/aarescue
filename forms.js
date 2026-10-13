(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Settings ----------
     DEFAULT_ENDPOINT: URL that receives every form (multipart/form-data, POST).
     A single form can use its own URL with data-endpoint="...".
     Fields sent: form_name, reference, page, plus the form's own fields and any files.
     Reply with JSON { "reference": "..." } if you want your own reference shown.
     While no URL is set, forms run in demo mode and send nothing. */
  var DEFAULT_ENDPOINT = '';
  var MAX_BYTES = 5 * 1024 * 1024;
  var FILE_OK = /\.(jpe?g|png|webp|heic|pdf|docx?|xlsx?)$/i;

  function phoneOk(v) { return /^\+?\d{7,15}$/.test(v.replace(/[\s().-]/g, '')); }
  function emailOk(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
  function size(f) { return f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1) + ' MB'; }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }
  function ref(prefix) {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return 'AAR-' + (prefix || 'REQ') + '-' + s;
  }

  $$('form.sf').forEach(function (form) {
    var steps = $$('.fstep', form), cur = 0, msg = $('.fmsg', form);
    var dzs = [];

    /* money + dates */
    $$('[data-money]', form).forEach(function (i) {
      i.addEventListener('input', function () { var d = i.value.replace(/\D/g, '').slice(0, 12); i.value = d ? Number(d).toLocaleString('en-US') : ''; });
    });
    $$('input[type=date][data-future]', form).forEach(function (i) { i.min = new Date().toISOString().slice(0, 10); });

    /* file drop zones */
    $$('.dz', form).forEach(function (root) {
      var input = $('input[type=file]', root), list = $('.fl', root), files = [], multi = root.hasAttribute('data-multiple'), max = +root.dataset.max || 5;
      var fd = root.closest('.fd'), err = $('.err', fd);
      function render() {
        list.innerHTML = '';
        files.forEach(function (f, i) {
          var li = el('li', '', '<span class="ft"><svg class="ic"><use href="#i-file"/></svg></span><span class="fn"><b></b><small>' + size(f) + '</small></span><button type="button"><svg class="ic"><use href="#i-x"/></svg></button>');
          li.querySelector('b').textContent = f.name;
          var b = li.querySelector('button'); b.setAttribute('aria-label', 'Remove ' + f.name);
          b.addEventListener('click', function () { files.splice(i, 1); render(); });
          list.appendChild(li);
        });
      }
      function add(fs) {
        err.textContent = ''; root.removeAttribute('aria-invalid');
        Array.prototype.slice.call(fs).forEach(function (f) {
          if (!FILE_OK.test(f.name)) { err.textContent = f.name + ' is not supported. Use JPG, PNG, PDF or Office files.'; return; }
          if (f.size > MAX_BYTES) { err.textContent = f.name + ' is over 5 MB.'; return; }
          if (!multi) files = [];
          if (files.length >= max) { err.textContent = 'You can add up to ' + max + ' files here.'; return; }
          files.push(f);
        });
        render();
      }
      input.addEventListener('change', function () { add(input.files); input.value = ''; });
      ['dragenter', 'dragover'].forEach(function (ev) { root.addEventListener(ev, function (e) { e.preventDefault(); root.classList.add('over'); }); });
      ['dragleave', 'drop'].forEach(function (ev) { root.addEventListener(ev, function (e) { e.preventDefault(); root.classList.remove('over'); }); });
      root.addEventListener('drop', function (e) { if (e.dataTransfer) add(e.dataTransfer.files); });
      dzs.push({ root: root, name: input.name, get: function () { return files; }, clear: function () { files = []; render(); } });
    });

    /* use my location */
    $$('[data-geo]', form).forEach(function (btn) {
      var target = document.getElementById(btn.dataset.geo), note = btn.nextElementSibling;
      btn.addEventListener('click', function () {
        if (!navigator.geolocation) { note.textContent = 'Location is not available on this device. Please type it in.'; return; }
        btn.disabled = true; note.textContent = 'Finding you\u2026';
        navigator.geolocation.getCurrentPosition(function (p) {
          var c = p.coords.latitude.toFixed(5) + ', ' + p.coords.longitude.toFixed(5);
          target.value = (target.value ? target.value + ' ' : '') + '(GPS ' + c + ')';
          note.textContent = 'Location added. Add a landmark if you can.'; btn.disabled = false;
          target.dispatchEvent(new Event('input', { bubbles: true }));
        }, function () { note.textContent = 'We could not get your location. Please type it in.'; btn.disabled = false; }, { enableHighAccuracy: true, timeout: 10000 });
      });
    });

    /* conditional fields */
    function val(n) {
      var els = form.elements[n]; if (!els) return '';
      if (els.length === undefined) return els.type === 'checkbox' ? (els.checked ? els.value : '') : els.value;
      var out = [];
      Array.prototype.forEach.call(els, function (e) { if ((e.type === 'radio' || e.type === 'checkbox') ? e.checked : e.value) out.push(e.value); });
      return out.join('|');
    }
    var conds = $$('[data-show]', form);
    function applyShow() {
      conds.forEach(function (c) {
        var p = c.dataset.show.split('='), v = val(p[0]), on = p[1] === '*' ? v !== '' : v.split('|').indexOf(p[1]) > -1;
        c.hidden = !on;
        $$('input,select,textarea', c).forEach(function (i) { i.disabled = !on; });
      });
    }
    form.addEventListener('change', applyShow); form.addEventListener('input', applyShow); applyShow();

    /* validation */
    function setErr(fd, text, target) {
      var e = $('.err', fd); if (e) e.textContent = text || '';
      var t = target || $('input,select,textarea,.chs,.dz', fd);
      if (t) { if (text) t.setAttribute('aria-invalid', 'true'); else t.removeAttribute('aria-invalid'); }
    }
    function validate(scope) {
      var first = null, n = 0;
      $$('.fd', scope).forEach(function (fd) {
        if (fd.hidden) return;
        var text = '', target = null;
        var input = $('input:not([type=radio]):not([type=checkbox]):not([type=file]),select,textarea', fd);
        var chs = $('.chs', fd), dz = $('.dz', fd), cb = $('input[type=checkbox][required]', fd);
        if (input) {
          var v = input.value.trim(); target = input;
          if (input.required && !v) text = input.dataset.msg || 'This field is required.';
          else if (v) {
            var rule = input.dataset.v || '';
            if (rule === 'phone' && !phoneOk(v)) text = 'Enter a valid phone number.';
            else if (rule === 'email' && !emailOk(v)) text = 'Enter a valid email address.';
            else if (rule.indexOf('min:') === 0 && v.length < +rule.slice(4)) text = input.dataset.msg || 'Please enter a little more detail.';
            else if (rule === 'num' && !(+v.replace(/\D/g, '') > 0)) text = 'Enter a number greater than 0.';
            else if (input.type === 'number' && (+v < +(input.min || 0) || (input.max && +v > +input.max))) text = 'Enter a number between ' + (input.min || 0) + ' and ' + input.max + '.';
          }
        }
        if (chs) {
          target = chs;
          var any = $$('input:checked', chs).length > 0;
          if ((chs.hasAttribute('data-req') || chs.hasAttribute('data-reqany')) && !any) text = 'Please choose an option.';
        }
        if (dz && dz.hasAttribute('data-req')) {
          target = dz; var d = dzs.filter(function (x) { return x.root === dz; })[0];
          if (d && !d.get().length) text = 'Please upload a file.';
        }
        if (cb && !cb.checked) { text = cb.dataset.msg || 'Please tick this box to continue.'; target = cb; }
        if (text) { n++; if (!first) first = target; }
        setErr(fd, text, target);
      });
      return { n: n, first: first };
    }
    function focusFirst(t) {
      if (!t) return;
      var f = t.matches('input,select,textarea') ? t : ($('input', t) || t);
      if (f.focus) f.focus({ preventScroll: true });
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
    form.addEventListener('input', function (e) { var fd = e.target.closest('.fd'); if (fd && $('.err', fd) && $('.err', fd).textContent) setErr(fd, ''); });
    form.addEventListener('change', function (e) { var fd = e.target.closest('.fd'); if (fd && $('.err', fd) && $('.err', fd).textContent) setErr(fd, ''); });

    /* steps */
    var prog = $('.fprog', form), back = $('.fback', form), next = $('.fnext', form), sub = $('.fsubmit', form);
    function show(n, scroll) {
      cur = n;
      steps.forEach(function (s, i) { s.hidden = i !== n; if (i === n) { s.classList.remove('in'); void s.offsetWidth; s.classList.add('in'); } });
      if (prog) {
        $$('li', prog).forEach(function (li, i) { li.classList.toggle('on', i === n); li.classList.toggle('done', i < n); });
        var bar = $('.fbar i', form); if (bar) bar.style.width = ((n + 1) / steps.length * 100) + '%';
        var lab = $('.fstepl', form); if (lab) lab.textContent = 'Step ' + (n + 1) + ' of ' + steps.length + ' \u00b7 ' + (steps[n].dataset.title || '');
      }
      if (back) back.hidden = n === 0;
      if (next) next.hidden = n === steps.length - 1;
      if (sub) sub.hidden = n !== steps.length - 1;
      if (msg) msg.textContent = '';
      if (scroll) {
        var h = $('h3', steps[n]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 110, behavior: reduce ? 'auto' : 'smooth' });
      }
    }
    if (steps.length) {
      show(0, false);
      if (next) next.addEventListener('click', function () {
        var r = validate(steps[cur]);
        if (r.n) { if (msg) msg.textContent = r.n === 1 ? 'Please fix 1 item to continue.' : 'Please fix ' + r.n + ' items to continue.'; focusFirst(r.first); return; }
        show(cur + 1, true);
      });
      if (back) back.addEventListener('click', function () { show(cur - 1, true); });
      if (prog) $$('li button', prog).forEach(function (b, i) { b.addEventListener('click', function () { if (i < cur) show(i, true); }); });
    }

    /* submit */
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches('input:not([type=file]):not([type=checkbox]):not([type=radio]):not([type=submit])')) {
        e.preventDefault();
        if (steps.length && cur < steps.length - 1) next.click(); else form.requestSubmit();
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r;
      if (steps.length) {
        for (var i = 0; i < steps.length; i++) {
          r = validate(steps[i]);
          if (r.n) { show(i, true); if (msg) msg.textContent = 'Please fix ' + r.n + (r.n === 1 ? ' item' : ' items') + ' to continue.'; setTimeout(function () { focusFirst(r.first); }, 350); return; }
        }
      } else {
        r = validate(form);
        if (r.n) { if (msg) msg.textContent = r.n === 1 ? 'Please fix 1 item below.' : 'Please fix ' + r.n + ' items below.'; focusFirst(r.first); return; }
      }
      var btn = $('button[type=submit]', form), label = btn.innerHTML, reference = ref(form.dataset.ref), endpoint = form.dataset.endpoint || DEFAULT_ENDPOINT;
      btn.disabled = true; btn.textContent = 'Sending\u2026'; if (msg) msg.textContent = '';
      var fd = new FormData();
      fd.append('form_name', form.dataset.name || form.id); fd.append('reference', reference); fd.append('page', location.pathname.split('/').pop());
      Array.prototype.forEach.call(form.elements, function (f) {
        if (!f.name || f.disabled || f.type === 'file' || f.type === 'submit' || f.type === 'button') return;
        if ((f.type === 'radio' || f.type === 'checkbox') && !f.checked) return;
        fd.append(f.name, f.value);
      });
      dzs.forEach(function (d) { d.get().forEach(function (f) { fd.append(d.name, f, f.name); }); });
      var p = endpoint
        ? fetch(endpoint, { method: 'POST', body: fd }).then(function (res) { if (!res.ok) throw new Error('http'); return res.json().catch(function () { return {}; }); }).then(function (j) { return (j && j.reference) || reference; })
        : new Promise(function (res) { setTimeout(function () { res(reference); }, 800); });
      p.then(function (refNo) { done(refNo, !endpoint); }).catch(function () {
        if (msg) msg.textContent = 'We could not send this. Check your connection and try again, or call 0802 555 1111.';
        btn.disabled = false; btn.innerHTML = label;
      });
    });

    function done(refNo, demo) {
      var box = el('div', 'fdone');
      box.setAttribute('tabindex', '-1');
      box.innerHTML = '<span class="ok"><svg class="ic"><use href="#i-check"/></svg></span><h3></h3><p class="dsub"></p><div class="ref"><span>Your reference</span><b></b><button type="button" class="b bl2">Copy</button></div>' +
        (demo ? '<p class="demo">Demo mode: nothing was sent. Connect the form to your server to receive real submissions.</p>' : '') +
        '<div class="acts"><a class="b by wa" href="#">Confirm on WhatsApp</a><button type="button" class="b bl2 again">Send another</button><a class="b bl2" href="index.html">Back to home</a></div>';
      $('h3', box).textContent = form.dataset.successTitle || 'Request received';
      $('.dsub', box).textContent = form.dataset.success || 'Thank you. Our team will review this and contact you shortly.';
      $('.ref b', box).textContent = refNo;
      $('.wa', box).href = 'https://wa.me/2348025551111?text=' + encodeURIComponent('Hello AA Rescue, I just submitted "' + (form.dataset.name || 'a form') + '" on your website. Reference: ' + refNo);
      var cp = $('.ref .b', box);
      cp.addEventListener('click', function () {
        function ok() { cp.textContent = 'Copied'; setTimeout(function () { cp.textContent = 'Copy'; }, 1600); }
        if (navigator.clipboard) navigator.clipboard.writeText(refNo).then(ok, ok); else ok();
      });
      $('.again', box).addEventListener('click', function () {
        box.remove(); form.reset(); dzs.forEach(function (d) { d.clear(); }); applyShow();
        var b = $('button[type=submit]', form); b.disabled = false; b.innerHTML = b.dataset.label || 'Submit';
        form.hidden = false; if (steps.length) show(0, false);
        form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      });
      form.hidden = true; form.parentNode.insertBefore(box, form.nextSibling);
      box.focus({ preventScroll: true });
      box.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
    var sb = $('button[type=submit]', form); if (sb) sb.dataset.label = sb.innerHTML;
  });

  /* services filter */
  var flt = $('.flt');
  if (flt) {
    var cards = $$('.svc[data-cat]');
    flt.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', flt).forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
      var c = b.dataset.cat;
      cards.forEach(function (card) { card.hidden = c !== 'all' && card.dataset.cat.split(' ').indexOf(c) < 0; });
    });
  }

  /* sticky "Request now" bar: hide when the form is on screen */
  var mcta = $('.mcta'), target = $('#form');
  if (mcta && target && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { mcta.classList.toggle('off', es[0].isIntersecting); }, { threshold: 0.1 }).observe(target);
  }
})();
