/* Form handling for inner pages.
   Set FORM_ENDPOINT to your backend (POST JSON). Until then the demo success state is shown. */
(function () {
  'use strict';
  var FORM_ENDPOINT = '';
  var forms = document.querySelectorAll('form[data-form]');
  var today = new Date().toISOString().slice(0, 10);
  [].forEach.call(document.querySelectorAll('input[type=date]'), function (d) { d.min = today; });

  function check(f) {
    var ok = true, first = null;
    [].forEach.call(f.querySelectorAll('input,select,textarea'), function (el) {
      if (el.classList.contains('hpi')) return;
      var e = document.getElementById('e-' + el.id), v = el.value.trim(), m = '';
      if (el.required && !v) m = 'This field is required.';
      else if (v && el.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) m = 'Enter a valid email address.';
      else if (v && el.type === 'tel' && !/^\+?[\d\s-]{7,16}$/.test(v)) m = 'Enter a valid phone number.';
      else if (v && el.type === 'number' && +v <= 0) m = 'Enter a number above zero.';
      if (e) e.textContent = m;
      if (m) { el.setAttribute('aria-invalid', 'true'); ok = false; first = first || el; } else el.removeAttribute('aria-invalid');
    });
    if (first) first.focus();
    return ok;
  }

  [].forEach.call(forms, function (f) {
    var card = f.closest('.fcard2'), msg = f.querySelector('.fmsg'), btn = f.querySelector('button[type=submit]');
    f.addEventListener('submit', function (ev) {
      ev.preventDefault();
      msg.textContent = '';
      if (f.querySelector('.hpi').value) return;
      if (!check(f)) return;
      var data = { form: f.dataset.form, page: location.pathname };
      [].forEach.call(f.elements, function (el) { if (el.id && !el.classList.contains('hpi') && el.type !== 'submit') data[el.name || el.id.replace(/^f-/, '')] = el.value.trim(); });
      btn.disabled = true;
      var send = FORM_ENDPOINT
        ? fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(function (r) { if (!r.ok) throw 0; })
        : new Promise(function (r) { setTimeout(r, 600); });
      send.then(function () {
        card.classList.add('done'); card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }).catch(function () {
        msg.textContent = 'We could not send that. Please try again or call 0802 555 1111.';
      }).then(function () { btn.disabled = false; });
    });
    f.addEventListener('input', function (ev) {
      var el = ev.target, e = document.getElementById('e-' + el.id);
      if (e && el.getAttribute('aria-invalid')) { e.textContent = ''; el.removeAttribute('aria-invalid'); }
    });
  });
})();
