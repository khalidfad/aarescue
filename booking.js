(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Settings ----------
     SUBMIT_URL: your endpoint. The form is sent as multipart/form-data (POST) with
       reference, client fields, vehicles (JSON), vehicle_<n>_papers, vehicle_<n>_photos,
       id_front and id_back files. Reply with JSON { "reference": "..." } (optional).
     While it is empty the form runs in demo mode and sends nothing. */
  var SUBMIT_URL = '';
  var MAX_BYTES = 5 * 1024 * 1024;
  var FILE_OK = /\.(jpe?g|png|webp|heic|pdf)$/i;

  var MODELS = {
    'BMW': ['3 Series (328i / 335i)', '6 Series', '7 Series', 'X3', 'X5', 'X6'],
    'Honda': ['Accord', 'City', 'Civic', 'Crosstour', 'CR-V', 'Jazz', 'Odyssey', 'Pilot'],
    'Hyundai': ['Santa Fe', 'Sonata'],
    'Kia': ['Amanti', 'Cadenza', 'Carens', 'Cerato', 'Optima', 'Picanto', 'Rio', 'Sportage'],
    'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Autobiography', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar'],
    'Lexus': ['ES', 'GX', 'RX'],
    'Mercedes-Benz': ['A-Class', 'AMG GT', 'B-Class', 'C-Class', 'CLA', 'CLS', 'E-Class', 'G-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'S-Class', 'V-Class', 'X-Class'],
    'Nissan': ['Altima', 'Murano', 'Pathfinder', 'Primera', 'Sunny'],
    'Rolls-Royce': ['Cullinan', 'Ghost', 'Phantom', 'Wraith'],
    'Toyota': ['Camry', 'Corolla', 'Highlander', 'Hilux', 'Sequoia', 'Sienna', 'Tacoma', 'Tundra'],
    'Volkswagen': ['Beetle', 'CC', 'Golf', 'Jetta', 'Passat', 'Routan', 'Sharan', 'Transporter']
  };
  var STATES = ['Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'];
  var STEPS = ['Your details', 'Vehicles', 'Pickup & delivery', 'ID & referral', 'Review & confirm'];

  var state = { step: 0, max: 0, vehicles: [], editing: -1, submitted: false, dirty: false };

  /* ---------- helpers ---------- */
  function val(id) { return ($('#' + id).value || '').trim(); }
  function checked(name) { var r = $('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function phoneOk(v) { return /^\+?\d{7,15}$/.test(v.replace(/[\s().-]/g, '')); }
  function emailOk(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
  function size(f) { return f.size < 1048576 ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : (f.size / 1048576).toFixed(1) + ' MB'; }
  function setErr(id, msg) {
    var el = $('#e-' + id), inp = $('#' + id);
    if (el) el.textContent = msg || '';
    if (inp) {
      if (msg) { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', 'e-' + id); }
      else { inp.removeAttribute('aria-invalid'); inp.removeAttribute('aria-describedby'); }
    }
  }
  function money(inp) {
    inp.addEventListener('input', function () {
      var d = inp.value.replace(/\D/g, '').slice(0, 12);
      inp.value = d ? Number(d).toLocaleString('en-US') : '';
    });
  }
  function fill(sel, first, items) {
    sel.innerHTML = '<option value="">' + first + '</option>' + items.map(function (i) { return '<option>' + esc(i) + '</option>'; }).join('');
  }

  /* ---------- uploader ---------- */
  function uploader(root, o) {
    var input = $('input[type=file]', root), list = $('.fl', root), files = [], urls = [];
    function fail(msg) { setErr(o.err, msg); }
    function render() {
      urls.forEach(function (u) { URL.revokeObjectURL(u); }); urls = [];
      list.innerHTML = '';
      files.forEach(function (f, i) {
        var li = document.createElement('li'), th;
        if (/^image\//.test(f.type) && !/heic/i.test(f.type)) { var u = URL.createObjectURL(f); urls.push(u); th = '<img src="' + u + '" alt="">'; }
        else th = '<span class="ft"><svg class="ic"><use href="#i-file"/></svg></span>';
        li.innerHTML = th + '<span class="fn"><b>' + esc(f.name) + '</b><small>' + size(f) + '</small></span><button type="button" aria-label="Remove ' + esc(f.name) + '"><svg class="ic"><use href="#i-x"/></svg></button>';
        li.querySelector('button').addEventListener('click', function () { files.splice(i, 1); render(); fail(''); state.dirty = true; });
        list.appendChild(li);
      });
    }
    function add(fs) {
      fail('');
      Array.prototype.slice.call(fs).forEach(function (f) {
        if (!FILE_OK.test(f.name)) { fail(f.name + ' is not supported. Use JPG, PNG or PDF.'); return; }
        if (f.size > MAX_BYTES) { fail(f.name + ' is over 5 MB.'); return; }
        if (!o.multiple) files = [];
        if (o.max && files.length >= o.max) { fail('You can add up to ' + o.max + ' files here.'); return; }
        files.push(f);
      });
      render(); state.dirty = true;
    }
    input.addEventListener('change', function () { add(input.files); input.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) { root.addEventListener(ev, function (e) { e.preventDefault(); root.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { root.addEventListener(ev, function (e) { e.preventDefault(); root.classList.remove('over'); }); });
    root.addEventListener('drop', function (e) { if (e.dataTransfer && e.dataTransfer.files) add(e.dataTransfer.files); });
    return { get: function () { return files.slice(); }, set: function (a) { files = a.slice(); render(); }, input: input };
  }
  var upPapers = uploader($('#dzPapers'), { multiple: true, max: 4, err: 'fPapers' });
  var upPhotos = uploader($('#dzPhotos'), { multiple: true, max: 6, err: 'fPhotos' });
  var upId = uploader($('#dzId'), { multiple: false, err: 'fId' });
  var upIdB = uploader($('#dzIdB'), { multiple: false, err: 'fIdB' });

  /* ---------- selects and inputs ---------- */
  var yr = new Date().getFullYear(), years = [];
  for (var y = yr; y >= 1980; y--) years.push(String(y));
  fill($('#vYear'), 'Choose year', years);
  fill($('#vBrand'), 'Choose brand', Object.keys(MODELS).concat(['Others']));
  fill($('#dState'), 'Choose state', STATES);
  $('#pDate').min = new Date().toISOString().slice(0, 10);
  money($('#vValue')); money($('#price'));

  function onBrand() {
    var b = $('#vBrand').value, other = b === 'Others', m = $('#vModel');
    $('#vBrandOW').hidden = !other; $('#vModelW').hidden = other; $('#vModelOW').hidden = true;
    if (!other) { fill(m, b ? 'Choose model' : 'Choose a brand first', b ? MODELS[b].concat(['Others']) : []); m.disabled = !b; }
    else $('#vModelOW').hidden = false;
  }
  function onModel() { if ($('#vBrand').value !== 'Others') $('#vModelOW').hidden = $('#vModel').value !== 'Others'; }
  $('#vBrand').addEventListener('change', onBrand);
  $('#vModel').addEventListener('change', onModel);
  onBrand();

  $('#qMinus').addEventListener('click', function () { var q = $('#vQty'); q.value = Math.max(1, (parseInt(q.value, 10) || 1) - 1); });
  $('#qPlus').addEventListener('click', function () { var q = $('#vQty'); q.value = Math.min(10, (parseInt(q.value, 10) || 1) + 1); });

  $$('input[name="pick"]').forEach(function (r) {
    r.addEventListener('change', function () { var yes = checked('pick') === 'yes'; $('#pkYes').hidden = !yes; $('#pkNo').hidden = yes; });
  });

  /* ---------- vehicle editor ---------- */
  function readVeh() {
    var brand = $('#vBrand').value, bo = brand === 'Others', model = $('#vModel').value;
    return {
      type: checked('vType'),
      brand: bo ? val('vBrandO') : brand,
      model: (bo || model === 'Others') ? val('vModelO') : model,
      year: $('#vYear').value, value: val('vValue').replace(/\D/g, ''),
      cond: checked('vCond'), sec: checked('vSec'),
      qty: parseInt($('#vQty').value, 10) || 0, notes: val('vNotes'),
      papers: upPapers.get(), photos: upPhotos.get()
    };
  }
  function pristine() {
    var v = readVeh();
    return !v.type && !$('#vBrand').value && !v.year && !v.cond && !v.sec && !v.notes && !v.value && !v.papers.length && !v.photos.length;
  }
  function clearEditor() {
    $$('#ved input[type=radio]').forEach(function (r) { r.checked = false; });
    ['vBrand', 'vYear'].forEach(function (id) { $('#' + id).value = ''; });
    ['vBrandO', 'vModelO', 'vValue', 'vNotes'].forEach(function (id) { $('#' + id).value = ''; });
    $('#vQty').value = 1; onBrand(); upPapers.set([]); upPhotos.set([]);
    ['vType', 'vBrand', 'vModel', 'vBrandO', 'vModelO', 'vYear', 'vCond', 'vSec', 'vQty', 'fPapers', 'fPhotos'].forEach(function (id) { setErr(id, ''); });
  }
  function writeVeh(v) {
    clearEditor();
    var r;
    if ((r = $('input[name="vType"][value="' + v.type + '"]'))) r.checked = true;
    if ((r = $('input[name="vCond"][value="' + v.cond + '"]'))) r.checked = true;
    if ((r = $('input[name="vSec"][value="' + v.sec + '"]'))) r.checked = true;
    var known = !!MODELS[v.brand];
    $('#vBrand').value = known ? v.brand : 'Others'; onBrand();
    if (known) {
      if (MODELS[v.brand].indexOf(v.model) > -1) $('#vModel').value = v.model;
      else { $('#vModel').value = 'Others'; onModel(); $('#vModelO').value = v.model; }
    } else { $('#vBrandO').value = v.brand; $('#vModelO').value = v.model; }
    $('#vYear').value = v.year; $('#vValue').value = v.value ? Number(v.value).toLocaleString('en-US') : '';
    $('#vQty').value = v.qty; $('#vNotes').value = v.notes; upPapers.set(v.papers); upPhotos.set(v.photos);
  }
  function validVeh() {
    var v = readVeh(), bad = [];
    function c(id, msg) { setErr(id, msg); if (msg) bad.push(id); }
    c('vType', v.type ? '' : 'Choose a vehicle type.');
    c('vBrand', $('#vBrand').value ? '' : 'Choose a brand.');
    if ($('#vBrand').value === 'Others') { c('vBrandO', v.brand.length < 2 ? 'Type the brand.' : ''); c('vModelO', v.model.length < 1 ? 'Type the model.' : ''); }
    else {
      c('vModel', $('#vModel').value ? '' : 'Choose a model.');
      if ($('#vModel').value === 'Others') c('vModelO', v.model.length < 1 ? 'Type the model.' : '');
    }
    c('vYear', v.year ? '' : 'Choose the year.');
    c('vCond', v.cond ? '' : 'Choose the condition.');
    c('vSec', v.sec ? '' : 'Choose the security status.');
    c('vQty', v.qty >= 1 && v.qty <= 10 ? '' : 'Enter a quantity from 1 to 10.');
    return bad.length ? bad[0] : '';
  }
  function showEditor(open, idx) {
    state.editing = open ? (idx === undefined ? -1 : idx) : -1;
    $('#ved').hidden = !open; $('#vAdd').hidden = open || !state.vehicles.length;
    $('#vCancel').hidden = !open || !state.vehicles.length;
    var n = state.editing >= 0 ? state.editing + 1 : state.vehicles.length + 1;
    $('#vedT').textContent = state.editing >= 0 ? 'Edit vehicle ' + n : 'Vehicle ' + n;
    $('#vSave').textContent = state.editing >= 0 ? 'Save changes' : 'Add vehicle';
  }
  function saveVeh() {
    var bad = validVeh();
    if (bad) { focusId(bad); return false; }
    var v = readVeh();
    if (state.editing >= 0) state.vehicles[state.editing] = v; else state.vehicles.push(v);
    setErr('vehicles', '');
    clearEditor(); showEditor(false); renderList(); state.dirty = true;
    return true;
  }
  function renderList() {
    var ul = $('#vlist');
    ul.innerHTML = state.vehicles.map(function (v, i) {
      var name = esc(v.year + ' ' + v.brand + ' ' + v.model);
      return '<li class="vc"><span class="vi"><svg class="ic"><use href="#i-car"/></svg></span><div class="vt"><b>' + name + '</b><p>' + esc([v.type, v.cond, v.sec].join(' \u00b7 ')) + ' \u00b7 Qty ' + v.qty + '</p><p class="vf">' + v.papers.length + ' paper' + (v.papers.length === 1 ? '' : 's') + ' \u00b7 ' + v.photos.length + ' photo' + (v.photos.length === 1 ? '' : 's') + '</p></div><div class="va"><button type="button" data-edit="' + i + '" aria-label="Edit ' + name + '"><svg class="ic"><use href="#i-edit"/></svg></button><button type="button" data-del="' + i + '" aria-label="Remove ' + name + '"><svg class="ic"><use href="#i-trash"/></svg></button></div></li>';
    }).join('');
  }
  $('#vlist').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.edit !== undefined) { var i = +b.dataset.edit; writeVeh(state.vehicles[i]); showEditor(true, i); $('#ved').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
    if (b.dataset.del !== undefined) {
      var d = state.vehicles[+b.dataset.del];
      if (window.confirm('Remove ' + d.year + ' ' + d.brand + ' ' + d.model + ' from this booking?')) {
        state.vehicles.splice(+b.dataset.del, 1); renderList();
        if (!state.vehicles.length) showEditor(true); else showEditor(false);
      }
    }
  });
  $('#vSave').addEventListener('click', saveVeh);
  $('#vAdd').addEventListener('click', function () { clearEditor(); showEditor(true); $('#ved').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
  $('#vCancel').addEventListener('click', function () { clearEditor(); showEditor(false); });
  showEditor(true);

  /* ---------- validation per step ---------- */
  function focusId(id) {
    var el = $('#' + id) || $('input[name="' + id + '"]');
    if (!el) { var m = $('#e-' + id); if (m) m.scrollIntoView({ block: 'center' }); return; }
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }
  function validate(step) {
    var bad = [];
    function c(id, msg) { setErr(id, msg); if (msg) bad.push(id); }
    if (step === 0) {
      c('cName', val('cName').length < 2 ? 'Enter your full name.' : '');
      c('cPhone', phoneOk(val('cPhone')) ? '' : 'Enter a valid phone number.');
      c('cEmail', val('cEmail') && !emailOk(val('cEmail')) ? 'Enter a valid email address.' : '');
      c('cAddr', val('cAddr').length < 5 ? 'Enter your address.' : '');
    }
    if (step === 1) {
      if (!$('#ved').hidden) {
        if (pristine() && state.vehicles.length) showEditor(false);
        else if (!saveVeh()) { $('#stepMsg').textContent = 'Please complete the vehicle details to continue.'; return false; }
      }
      if (!state.vehicles.length) { setErr('vehicles', 'Add at least one vehicle to continue.'); bad.push('vehicles'); }
      else setErr('vehicles', '');
    }
    if (step === 2) {
      var yes = checked('pick') === 'yes';
      ['pAddr', 'pPerson', 'pPhone', 'pOffice'].forEach(function (id) { setErr(id, ''); });
      if (yes) {
        c('pAddr', val('pAddr').length < 5 ? 'Enter the pickup address.' : '');
        c('pPerson', val('pPerson').length < 2 ? 'Enter a contact person.' : '');
        c('pPhone', phoneOk(val('pPhone')) ? '' : 'Enter a valid phone number.');
      } else c('pOffice', $('#pOffice').value ? '' : 'Choose a drop-off office.');
      c('dName', val('dName').length < 2 ? 'Enter the receiver\u2019s name.' : '');
      c('dPhone', phoneOk(val('dPhone')) ? '' : 'Enter a valid phone number.');
      c('dState', $('#dState').value ? '' : 'Choose the delivery state.');
      c('dAddr', val('dAddr').length < 3 ? 'Enter the delivery location.' : '');
    }
    if (step === 3) {
      c('idType', $('#idType').value ? '' : 'Choose your ID type.');
      c('fId', upId.get().length ? '' : 'Upload a photo or scan of your ID.');
      c('rPhone', val('rPhone') && !phoneOk(val('rPhone')) ? 'Enter a valid phone number.' : '');
      c('rEmail', val('rEmail') && !emailOk(val('rEmail')) ? 'Enter a valid email address.' : '');
    }
    if (step === 4) {
      c('cAcc', $('#cAcc').checked ? '' : 'Please confirm the details are accurate.');
      c('cTerms', $('#cTerms').checked ? '' : 'Please agree to continue.');
    }
    $('#stepMsg').textContent = bad.length ? (bad.length === 1 ? 'Please fix 1 item to continue.' : 'Please fix ' + bad.length + ' items to continue.') : '';
    if (bad.length) { focusId(bad[0]); return false; }
    return true;
  }

  /* ---------- navigation ---------- */
  var panels = $$('.pn'), rail = $$('#rail2 li');
  function show(n, noScroll) {
    state.step = n; state.max = Math.max(state.max, n);
    panels.forEach(function (p, i) { p.hidden = i !== n; if (i === n) { p.classList.remove('in'); void p.offsetWidth; p.classList.add('in'); } });
    rail.forEach(function (li, i) {
      li.classList.toggle('on', i === n); li.classList.toggle('done', i < n);
      var b = $('button', li); b.disabled = i > state.max;
      if (i === n) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $('#bBack').hidden = n === 0;
    $('#bNext').innerHTML = (n === 4 ? 'Submit booking' : 'Continue') + '<svg class="ic"><use href="#i-arrow"/></svg>';
    $('#mstep').textContent = 'Step ' + (n + 1) + ' of 5 \u00b7 ' + STEPS[n];
    $('#mfill').style.width = ((n + 1) / 5 * 100) + '%';
    $('#stepMsg').textContent = '';
    if (n === 4) renderReview();
    if (!noScroll) {
      var h = $('h2', panels[n]); if (h) h.focus({ preventScroll: true });
      window.scrollTo({ top: $('#bcard').getBoundingClientRect().top + window.scrollY - 96, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
  $('#bNext').addEventListener('click', function () {
    if (!validate(state.step)) return;
    if (state.step < 4) show(state.step + 1); else submit();
  });
  $('#bBack').addEventListener('click', function () { if (state.step > 0) show(state.step - 1); });
  $('#rail2').addEventListener('click', function (e) {
    var b = e.target.closest('button[data-go]'); if (!b || b.disabled) return;
    var n = +b.dataset.go;
    if (n < state.step || validate(state.step)) show(n);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target.matches('input:not([type=file]):not([type=checkbox]):not([type=radio])') && !$('#bk').hidden) {
      if (e.target.closest('#ved')) { e.preventDefault(); saveVeh(); return; }
      e.preventDefault(); $('#bNext').click();
    }
  });
  $('#bk').addEventListener('input', function (e) {
    state.dirty = true;
    if (e.target.id) setErr(e.target.id, '');
    if (e.target.name) setErr(e.target.name, '');
  });
  $('#bk').addEventListener('change', function (e) { if (e.target.name) setErr(e.target.name, ''); });

  /* ---------- review ---------- */
  function row(k, v) { return v ? '<div><dt>' + k + '</dt><dd>' + esc(v) + '</dd></div>' : ''; }
  function sec(title, step, body) { return '<section class="rv"><header><h3>' + title + '</h3><button type="button" class="ed" data-go="' + step + '">Edit</button></header><dl>' + body + '</dl></section>'; }
  function renderReview() {
    var yes = checked('pick') === 'yes', qty = state.vehicles.reduce(function (s, v) { return s + v.qty; }, 0);
    var vh = state.vehicles.map(function (v) {
      return '<li><b>' + esc(v.year + ' ' + v.brand + ' ' + v.model) + '</b><span>' + esc(v.type + ' \u00b7 ' + v.cond + ' \u00b7 ' + v.sec) + ' \u00b7 Qty ' + v.qty + ' \u00b7 ' + v.papers.length + ' paper(s) \u00b7 ' + v.photos.length + ' photo(s)</span></li>';
    }).join('');
    var f = upId.get()[0], fb = upIdB.get()[0];
    $('#rev').innerHTML =
      sec('Your details', 0, row('Name', val('cName')) + row('Phone', val('cPhone')) + row('Email', val('cEmail')) + row('Address', val('cAddr'))) +
      '<section class="rv"><header><h3>Vehicles (' + qty + ')</h3><button type="button" class="ed" data-go="1">Edit</button></header><ul class="rvl">' + vh + '</ul></section>' +
      sec('Pickup & delivery', 2,
        row('Pickup', yes ? 'We collect it' : 'I will drop it off') +
        (yes ? row('Pickup address', val('pAddr')) + row('Contact', val('pPerson') + ' \u00b7 ' + val('pPhone')) + row('Pickup date', val('pDate')) : row('Drop-off office', $('#pOffice').value)) +
        row('Receiver', val('dName') + ' \u00b7 ' + val('dPhone')) + row('Delivery', val('dAddr') + ', ' + $('#dState').value) +
        row('Proposed price', val('price') ? '\u20a6' + val('price') : '')) +
      sec('ID & referral', 3, row('ID type', $('#idType').value) + row('ID file', f ? f.name : '') + row('ID back', fb ? fb.name : '') +
        row('Referred by', val('rName')) + row('Referral phone', val('rPhone')) + row('Referral email', val('rEmail')));
  }
  $('#rev').addEventListener('click', function (e) { var b = e.target.closest('button[data-go]'); if (b) show(+b.dataset.go); });

  /* ---------- submit ---------- */
  function makeRef() {
    var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return 'AAR-HL-' + s;
  }
  function build(ref) {
    var fd = new FormData(), yes = checked('pick') === 'yes';
    fd.append('reference', ref);
    fd.append('client_name', val('cName')); fd.append('client_phone', val('cPhone')); fd.append('client_email', val('cEmail')); fd.append('client_address', val('cAddr'));
    fd.append('pickup', yes ? 'yes' : 'no');
    fd.append('pickup_address', val('pAddr')); fd.append('pickup_contact', val('pPerson')); fd.append('pickup_phone', val('pPhone')); fd.append('pickup_date', val('pDate'));
    fd.append('dropoff_office', $('#pOffice').value);
    fd.append('receiver_name', val('dName')); fd.append('receiver_phone', val('dPhone')); fd.append('delivery_state', $('#dState').value); fd.append('delivery_location', val('dAddr'));
    fd.append('proposed_price', val('price').replace(/\D/g, ''));
    fd.append('id_type', $('#idType').value);
    fd.append('referral_name', val('rName')); fd.append('referral_phone', val('rPhone')); fd.append('referral_email', val('rEmail'));
    fd.append('vehicles', JSON.stringify(state.vehicles.map(function (v) {
      return { type: v.type, brand: v.brand, model: v.model, year: v.year, value: v.value, condition: v.cond, security: v.sec, quantity: v.qty, notes: v.notes };
    })));
    state.vehicles.forEach(function (v, i) {
      v.papers.forEach(function (f) { fd.append('vehicle_' + i + '_papers', f, f.name); });
      v.photos.forEach(function (f) { fd.append('vehicle_' + i + '_photos', f, f.name); });
    });
    upId.get().forEach(function (f) { fd.append('id_front', f, f.name); });
    upIdB.get().forEach(function (f) { fd.append('id_back', f, f.name); });
    return fd;
  }
  function submit() {
    var btn = $('#bNext'), label = btn.innerHTML, ref = makeRef();
    btn.disabled = true; btn.textContent = 'Submitting\u2026'; $('#stepMsg').textContent = '';
    var p = SUBMIT_URL
      ? fetch(SUBMIT_URL, { method: 'POST', body: build(ref) }).then(function (r) { if (!r.ok) throw new Error('http'); return r.json().catch(function () { return {}; }); }).then(function (j) { return (j && j.reference) || ref; })
      : new Promise(function (res) { setTimeout(function () { res(ref); }, 900); });
    p.then(done).catch(function () {
      $('#stepMsg').textContent = 'We could not send your booking. Check your connection and try again, or call 0802 555 1111.';
      btn.disabled = false; btn.innerHTML = label;
    });
  }
  function done(ref) {
    state.submitted = true;
    $('#bk').hidden = true; $('#done').hidden = false;
    $('#refNo').textContent = ref; $('#demoNote').hidden = !!SUBMIT_URL;
    $('#doneWa').href = 'https://wa.me/2348025551111?text=' + encodeURIComponent('Hello AA Rescue, I just submitted a haulage booking. Reference: ' + ref + '. Name: ' + val('cName'));
    rail.forEach(function (li) { li.classList.add('done'); li.classList.remove('on'); });
    $('#mstep').textContent = 'Booking received'; $('#mfill').style.width = '100%';
    $('#done').focus({ preventScroll: true });
    window.scrollTo({ top: $('#bcard').getBoundingClientRect().top + window.scrollY - 96, behavior: reduce ? 'auto' : 'smooth' });
  }
  $('#refCopy').addEventListener('click', function () {
    var t = $('#refNo').textContent, b = $('#refCopy');
    function ok() { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1600); }
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok, ok); else ok();
  });
  $('#again').addEventListener('click', function () { state.dirty = false; location.reload(); });

  window.addEventListener('beforeunload', function (e) { if (state.dirty && !state.submitted) { e.preventDefault(); e.returnValue = ''; } });

  show(0, true);
})();
