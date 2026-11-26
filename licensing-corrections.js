(function () {
  var form = document.getElementById('lic');
  if (!form) return;
  var steps = form.querySelectorAll('.fstep');
  var application = steps[1], details = steps[2];
  form.insertBefore(details, application);
  var progress = form.querySelectorAll('.fprog button');
  progress[1].setAttribute('aria-label', 'Go to step 2: Your details');
  progress[2].setAttribute('aria-label', 'Go to step 3: Your application');
  var serviceHeading = application.querySelector('h3');
  var formHeading = form.closest('.fcard').querySelector('h2');
  var unconditionalFields = Array.prototype.filter.call(form.querySelectorAll('.fd'), function (field) { return !field.hasAttribute('data-show'); });
  function updateTitle() {
    var selected = form.querySelector('input[name="service"]:checked');
    serviceHeading.textContent = selected ? selected.value : 'Your application';
    formHeading.textContent = selected ? selected.value + ' application' : 'Licensing application';
  }
  form.addEventListener('change', function (event) {
    if (event.target.name !== 'service') return;
    unconditionalFields.forEach(function (field) {
      field.hidden = false;
      field.querySelectorAll('input,select,textarea').forEach(function (input) { input.disabled = false; });
    });
  });
  form.addEventListener('change', updateTitle);
  updateTitle();
  var email = document.getElementById('lic-email');
  email.required = false;
  email.previousElementSibling.innerHTML = 'Email <i>(optional)</i>';
  var renewal = "Renew vehicle documents||Renew driver's licence";
  var dob = document.getElementById('lic-dob').closest('.fd');
  dob.dataset.show += '||' + renewal;
  var driverNote = document.createElement('p');
  driverNote.className = 'hint c2';
  driverNote.dataset.show = "service=Renew driver's licence";
  driverNote.textContent = 'We will check your details to determine whether recapture is required.';
  application.querySelector('.gr2').appendChild(driverNote);
  var newFields = document.createElement('div');
  newFields.className = 'fd c2';
  newFields.dataset.show = 'service=New vehicle registration';
  newFields.innerHTML = '<label for="lic-fuel">Fuel type</label><input id="lic-fuel" name="fuel_type" required><p class="err"></p><span class="lb">Customs papers and chassis image</span><div class="dz" data-multiple data-min="2" data-max="4" data-req><input type="file" id="lic-customs" name="customs_and_chassis" accept="image/*,application/pdf" multiple><label for="lic-customs"><b>Upload customs papers and chassis image</b><span>Include a clear chassis image from the windscreen or driver’s door.</span></label><ul class="fl"></ul></div><p class="err"></p>';
  application.querySelector('.gr2').appendChild(newFields);
  document.addEventListener('DOMContentLoaded', function () {
    function simplifyRenewal() {
      var selected = form.querySelector('input[name="service"]:checked');
      var value = selected ? selected.value : '';
      var isVehicle = value === 'Renew vehicle documents';
      var isDriver = value === "Renew driver's licence";
      if (!isVehicle && !isDriver) return;
      [details, application].forEach(function (step) {
        step.querySelectorAll('.fd').forEach(function (field) {
          var allowed = step === details
            ? field.querySelector('#lic-fullname, #lic-nin, #lic-phone')
            : field.querySelector('#lic-dob, ' + (isDriver ? '#lic-d_licno, #lic-old_licence' : '#lic-vehicle_papers'));
          if (!allowed) {
            field.hidden = true;
            field.querySelectorAll('input,select,textarea').forEach(function (input) { input.disabled = true; });
          }
        });
      });
    }
    form.addEventListener('change', simplifyRenewal);
    form.addEventListener('input', simplifyRenewal);
    simplifyRenewal();
  });
})();
