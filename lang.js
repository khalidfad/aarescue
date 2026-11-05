/* AA Rescue language switcher (EN | FR). Remembers the choice across pages.
   Add more phrases to FR below, or add a new language: AARLang.add('es', {...}) and a button with data-lang="es". */
(function () {
  'use strict';
  var KEY = 'aar_lang', DICT = { fr: {} }, cur = 'en', busy = false;
  var norm = function (t) { return t.replace(/[\u2018\u2019]/g, "'").replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim(); };
  var ATTRS = ['placeholder', 'aria-label', 'title'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, NOSCRIPT: 1 };
  var orig = new WeakMap();

  function add(code, map) { DICT[code] = DICT[code] || {}; for (var k in map) DICT[code][norm(k)] = map[k]; }

  /* ---------- French ---------- */
  add('fr', {
    /* header, menu */
    'Home': 'Accueil', 'About Us': 'À propos', 'Services': 'Services', 'Outsourcing': 'Externalisation', 'Galaxy': 'Galaxy', 'Blog': 'Blog',
    'Testimonials': 'Témoignages', 'Careers': 'Carrières', 'Contact Us': 'Nous contacter', 'Login': 'Connexion', 'Book Your Car': 'Réserver votre véhicule',
    'Make Payment': 'Effectuer un paiement', 'Membership': 'Adhésion', 'Language': 'Langue', 'Open menu': 'Ouvrir le menu', 'Close menu': 'Fermer le menu',
    'Vehicular Recovery and Rescue Services': 'Récupération et dépannage de véhicules', 'Drivers Outsourcing': 'Externalisation de chauffeurs',
    'Driving School': 'Auto-école', 'Testing and Confirmation of Drivers': 'Test et confirmation des chauffeurs',
    'Defensive and Advanced Drivers Training': 'Formation à la conduite défensive et avancée', 'General Goods and Equipment Logistics': "Logistique de marchandises et d'équipements",
    'Corporate Transportation': "Transport d'entreprise", 'Drivers Academy': 'Académie des chauffeurs', 'Haulage': 'Transport de véhicules', 'Licensing': 'Licences et permis',
    'Job Portal': 'Portail emploi', 'Fleet Management': 'Gestion de flotte', 'Vehicle Tracking': 'Suivi de véhicules', 'View all services': 'Voir tous les services',
    /* footer */
    "Nigeria's most trusted roadside assistance and mobility solutions company since 2003.": "L'entreprise d'assistance routière et de solutions de mobilité la plus fiable du Nigeria depuis 2003.",
    'About': 'À propos', 'Our Story': 'Notre histoire', 'Leadership Team': 'Équipe de direction', 'Press & Media': 'Presse et médias', 'Awards': 'Distinctions',
    'Vehicle Recovery': 'Récupération de véhicules', 'Driver Outsourcing': 'Externalisation de chauffeurs', 'Vehicle Licensing': 'Licences de véhicules',
    'Corporate': 'Entreprises', 'Fleet Solutions': 'Solutions de flotte', 'Corporate Transport': "Transport d'entreprise", 'Driver Hire': 'Embauche de chauffeurs', 'Logistics': 'Logistique',
    'Support': 'Assistance', 'FAQs': 'FAQ', 'Member Login': 'Connexion membre', 'Report an Issue': 'Signaler un problème', 'Branch Locator': 'Trouver une agence', 'Emergency Line': "Ligne d'urgence",
    'AA Rescue Limited. All rights reserved.': 'AA Rescue Limited. Tous droits réservés.', 'Privacy Policy': 'Politique de confidentialité',
    'Terms of Service': "Conditions d'utilisation", 'Cookie Policy': 'Politique relative aux cookies',
    /* newsletter */
    'Stay up to date': 'Restez informé', 'Receive news, offers, and safety tips from AA Rescue.': "Recevez les actualités, offres et conseils de sécurité d'AA Rescue.",
    'Enter your email': 'Entrez votre e-mail', 'Email address': 'Adresse e-mail', 'Subscribe': "S'abonner",
    "Welcome! You'll now receive updates, offers, and news.": 'Bienvenue ! Vous recevrez désormais nos actualités, offres et nouveautés.',
    'Please enter a valid email address.': 'Veuillez saisir une adresse e-mail valide.', 'Stay in the loop': 'Restez au courant',
    'Get updates, offers, and news from AA Rescue straight to your inbox.': "Recevez les actualités, offres et nouveautés d'AA Rescue directement dans votre boîte mail.",
    'No thanks': 'Non merci', 'Close': 'Fermer', 'Enjoyed this post?': 'Cet article vous a plu ?', 'Get news, tips and company updates in your inbox.': 'Recevez actualités, conseils et nouvelles de l\'entreprise dans votre boîte mail.',
    /* CTAs */
    'Do you need a driver?': "Avez-vous besoin d'un chauffeur ?", 'Get trained, vetted drivers for your business. Request outsourced drivers today.': 'Obtenez des chauffeurs formés et vérifiés pour votre entreprise. Demandez des chauffeurs externalisés dès aujourd\'hui.',
    'Request a Driver': 'Demander un chauffeur', 'Looking for a job?': 'Vous cherchez un emploi ?', 'See what we offer, apply in two minutes and upload your CV.': 'Découvrez nos offres, postulez en deux minutes et téléchargez votre CV.',
    'Apply for a job': 'Postuler à un emploi', 'Apply for a Job': 'Postuler à un emploi', 'Get Emergency Help': "Obtenir de l'aide d'urgence", 'Read all testimonials': 'Lire tous les témoignages',
    'Share your experience': 'Partager votre expérience', 'Speak with Sales': "Parler à l'équipe commerciale", 'Sign up': "S'inscrire", 'Log in': 'Se connecter', 'Become a member': 'Devenir membre',
    'Looking for staff or drivers?': 'Vous cherchez du personnel ou des chauffeurs ?',
    /* blog */
    'Latest from the blog': 'Dernières nouvelles du blog', 'News, tips and company updates from AA Rescue.': "Actualités, conseils et nouvelles de l'entreprise AA Rescue.",
    'All': 'Tout', 'News': 'Actualités', 'Tips': 'Conseils', 'Company Updates': "Nouvelles de l'entreprise", 'Read more': 'Lire la suite', 'View all posts': 'Voir tous les articles',
    'Road safety': 'Sécurité routière', 'Rescue tips': 'Conseils de dépannage',
    '5 checks to make before a long trip': '5 vérifications à faire avant un long trajet', 'Tyres, oil, lights, brakes and coolant: a quick routine that prevents most breakdowns.': "Pneus, huile, feux, freins et liquide de refroidissement : une routine rapide qui évite la plupart des pannes.",
    'Before a long journey, check your tyre pressure and tread, engine oil, lights, brakes and coolant level. Carry a spare tyre, a warning triangle and a charged phone.': "Avant un long voyage, vérifiez la pression et l'usure des pneus, l'huile moteur, les feux, les freins et le niveau de liquide de refroidissement. Emportez une roue de secours, un triangle de signalisation et un téléphone chargé.",
    'A few minutes of checking at home is far cheaper than a breakdown on the road. If anything looks wrong, call us before you set off.': "Quelques minutes de vérification à la maison coûtent bien moins cher qu'une panne sur la route. Si quelque chose vous semble anormal, appelez-nous avant de partir.",
    'Broken down on the expressway? Do this first': "En panne sur l'autoroute ? Faites ceci en premier", 'Stay calm, get safe and call for help. Here is the step-by-step plan our team recommends.': "Restez calme, mettez-vous en sécurité et appelez à l'aide. Voici le plan étape par étape que recommande notre équipe.",
    'Switch on your hazard lights, move the vehicle as far off the road as you safely can, and get everyone out on the side away from traffic.': "Allumez vos feux de détresse, rangez le véhicule le plus loin possible de la chaussée en toute sécurité, et faites sortir tout le monde du côté opposé à la circulation.",
    'Place a warning triangle behind the vehicle if it is safe, then call our 24-hour line on 0802 555 1111 and share your exact location.': "Placez un triangle de signalisation derrière le véhicule si c'est sans danger, puis appelez notre ligne disponible 24 h/24 au 0802 555 1111 et indiquez votre position exacte.",
    'New learner registration: what to expect': "Inscription des nouveaux apprenants : à quoi s'attendre", 'Registration days, your introduction session and how your lessons are scheduled.': "Les jours d'inscription, votre séance d'introduction et l'organisation de vos leçons.",
    'New learners are registered every Monday and Friday at 3:00 PM, and introduction sessions hold every Monday and Tuesday.': "Les nouveaux apprenants sont inscrits chaque lundi et vendredi à 15 h, et les séances d'introduction ont lieu chaque lundi et mardi.",
    'After registration our team confirms your lesson schedule with you. All training must be completed within three months of starting.': "Après l'inscription, notre équipe confirme avec vous votre calendrier de leçons. Toute la formation doit être terminée dans les trois mois suivant le début.",
    'Membership plans from ₦150,000': "Formules d'adhésion à partir de 150 000 ₦", 'Standard cover for one car starts at ₦150,000, with 24-hour recovery in Lagos, Abuja and Port Harcourt.': "La formule Standard pour un véhicule commence à 150 000 ₦, avec dépannage 24 h/24 à Lagos, Abuja et Port Harcourt.",
    'AA Rescue membership is priced by the number of vehicles you register. Standard (1 car) is ₦150,000, Family (2 cars) is ₦280,000 and Comprehensive (3 cars) is ₦360,000.': "L'adhésion AA Rescue dépend du nombre de véhicules enregistrés. Standard (1 voiture) : 150 000 ₦, Famille (2 voitures) : 280 000 ₦, Complète (3 voitures) : 360 000 ₦.",
    'Members also enjoy rapid response and 3% off other AA Rescue services. See the membership page for fleet plans.': "Les membres bénéficient aussi d'une intervention rapide et de 3 % de remise sur les autres services d'AA Rescue. Consultez la page Adhésion pour les formules de flotte.",
    'Fresh from the blog': 'Du nouveau sur le blog', 'Latest updates from AA Rescue': "Dernières nouvelles d'AA Rescue", 'Visit the blog': 'Visiter le blog', 'Maybe later': 'Peut-être plus tard',
    /* shared form words */
    '(optional)': '(facultatif)', 'Optional': 'Facultatif', 'Choose one': 'Choisissez', 'Select…': 'Sélectionner…', 'Back': 'Retour', 'Continue': 'Continuer', 'Yes': 'Oui', 'No': 'Non', 'Other': 'Autre',
    'Date': 'Date', 'Full name': 'Nom complet', 'Phone number': 'Numéro de téléphone', 'Email': 'E-mail', 'Surname': 'Nom', 'Other names': 'Autres prénoms', 'Submit application': 'Envoyer la candidature',
    'Submit request': 'Envoyer la demande', 'Request received': 'Demande reçue', 'Application received': 'Candidature reçue', 'Sending…': 'Envoi…', 'Finding you…': 'Localisation en cours…',
    'This field is required.': 'Ce champ est obligatoire.', 'Enter a valid email address.': 'Saisissez une adresse e-mail valide.', 'Enter a valid phone number.': 'Saisissez un numéro de téléphone valide.',
    'Please choose an option.': 'Veuillez choisir une option.', 'Please upload a file.': 'Veuillez téléverser un fichier.', 'Please tick this box to continue.': 'Veuillez cocher cette case pour continuer.',
    'Please enter a little more detail.': 'Veuillez donner un peu plus de détails.', 'Enter a number greater than 0.': 'Saisissez un nombre supérieur à 0.', 'Please fix 1 item below.': 'Veuillez corriger 1 élément ci-dessous.',
    'Please fix 1 item to continue.': 'Veuillez corriger 1 élément pour continuer.', 'Thank you. Our team will review this and contact you shortly.': 'Merci. Notre équipe étudiera votre demande et vous contactera sous peu.',
    'We could not send this. Check your connection and try again, or call 0802 555 1111.': "Envoi impossible. Vérifiez votre connexion et réessayez, ou appelez le 0802 555 1111.",
    'Location is not available on this device. Please type it in.': "La localisation n'est pas disponible sur cet appareil. Veuillez la saisir.", 'We could not get your location. Please type it in.': "Impossible d'obtenir votre position. Veuillez la saisir.",
    'Location added. Add a landmark if you can.': 'Position ajoutée. Ajoutez un repère si possible.', 'Anything else we should know?': "Autre chose à nous signaler ?", 'Anything else we should know? (optional)': 'Autre chose à nous signaler ? (facultatif)',
    /* careers / apply form */
    'Thanks for applying. Our HR team will review your application and get back to you.': "Merci de votre candidature. Notre équipe RH l'examinera et reviendra vers vous.",
    'Apply for a job': 'Postuler à un emploi', 'State you live in': "État où vous vivez", 'Position you are applying for': 'Poste visé', 'Role': 'Poste', 'Type of driver': 'Type de chauffeur', "Driver's licence": 'Permis de conduire',
    'Highest qualification (optional)': 'Diplôme le plus élevé (facultatif)', 'Years of driving experience': "Années d'expérience de conduite", 'Available to start': 'Disponible pour commencer', 'Available to start (optional)': 'Disponible pour commencer (facultatif)',
    'Upload your CV': 'Téléversez votre CV', 'PDF or Word document, up to 5 MB.': 'Document PDF ou Word, 5 Mo maximum.', 'Upload your CV (PDF or Word, max 5 MB)': 'Téléversez votre CV (PDF ou Word, 5 Mo max.)',
    'I confirm the information is true and agree to AA Rescue contacting me about job opportunities.': "Je confirme que les informations sont exactes et j'accepte qu'AA Rescue me contacte au sujet d'opportunités d'emploi.",
    'We use your details only to respond to this request.': 'Nous utilisons vos informations uniquement pour répondre à cette demande.', 'Driver': 'Chauffeur', 'Driving instructor': 'Moniteur de conduite', 'Rescue or recovery operator': 'Opérateur de dépannage ou de remorquage',
    'Mechanic or technician': 'Mécanicien ou technicien', 'Dispatcher or operations': 'Répartiteur ou opérations', 'Customer service': 'Service client', 'Sales and marketing': 'Ventes et marketing', 'Finance and administration': 'Finance et administration',
    'Executive driver': 'Chauffeur de direction', 'Pool driver': 'Chauffeur de pool', 'Dispatch driver or rider': 'Chauffeur ou coursier de livraison', 'Truck or haulage driver': 'Chauffeur de camion ou de convoyage', 'Bus driver': "Chauffeur d'autobus",
    'Police or escort trained': "Formé à l'escorte ou à la police", 'Yes, valid licence': 'Oui, permis valide', 'Yes, but expired': 'Oui, mais expiré', 'Not yet': 'Pas encore', 'SSCE or equivalent': 'SSCE ou équivalent', 'OND or NCE': 'OND ou NCE',
    "HND or Bachelor's degree": 'HND ou licence', "Master's degree or higher": 'Master ou supérieur', 'Trade or vocational certificate': 'Certificat professionnel ou technique', 'Less than 1 year': "Moins d'un an", '1 to 3 years': '1 à 3 ans', '4 to 7 years': '4 à 7 ans',
    '8 years or more': '8 ans ou plus', 'Immediately': 'Immédiatement', 'Within 2 weeks': 'Sous 2 semaines', 'Within a month': 'Sous un mois', 'e.g. Lagos': 'p. ex. Lagos',
    'Years of work experience': 'Années d\'expérience professionnelle', 'Logistics and warehouse': 'Logistique et entrepôt', 'Human resources': 'Ressources humaines', 'IT and technology': 'Informatique et technologie', 'Security': 'Sécurité', 'Graduate trainee or intern': 'Jeune diplômé stagiaire ou stagiaire', 'Open roles': 'Postes ouverts', 'Applying as a driver?': 'Vous postulez comme chauffeur ?',
    /* outsourcing: request a driver */
    "Client's name": "Nom du client", 'Company or client name': "Nom de l'entreprise ou du client", 'Contact person': 'Personne à contacter', 'Duration needed': 'Durée nécessaire', 'Where will the driver work?': 'Où le chauffeur travaillera-t-il ?',
    'Office address': 'Adresse du bureau', 'Residential address': 'Adresse du domicile', 'Residential address (optional)': 'Adresse du domicile (facultatif)', 'Telephone number 1': 'Numéro de téléphone 1', 'Telephone number 2 (optional)': 'Numéro de téléphone 2 (facultatif)',
    'Official': 'Professionnel', 'Personal': 'Personnel', 'One-off': 'Ponctuel', 'Contract': 'Contrat', 'How many drivers?': 'Combien de chauffeurs ?', 'Manual': 'Manuelle', 'Auto': 'Automatique', 'Mainland Lagos': 'Lagos continent', 'Island': 'Île',
    'Recruitment purpose': 'Objet du recrutement', 'Type of service': 'Type de service', 'Type of vehicle': 'Type de véhicule', 'Class of vehicle': 'Catégorie de véhicule', 'Age range': "Tranche d'âge", 'Residential area of driver': 'Zone de résidence du chauffeur',
    'Is accommodation available?': "Un hébergement est-il disponible ?", 'Provision for overtime': 'Prévision pour heures supplémentaires', 'Provision for annual leave': 'Prévision pour congés annuels', 'Marital status preference': 'Préférence de situation matrimoniale',
    'No preference': 'Aucune préférence', 'Single': 'Célibataire', 'Married': 'Marié(e)', '1. Client': '1. Client', '2. Driver needed': '2. Chauffeur demandé', '3. Terms and sign': '3. Conditions et signature', 'Client details': 'Informations du client',
    'Driver needed': 'Chauffeur demandé', 'Terms and signature': 'Conditions et signature', 'Name of client (typed as signature)': 'Nom du client (saisi comme signature)', 'Submit request': 'Envoyer la demande',
    'Thank you. Our Outsourcing team will contact you to confirm the details and the service charge.': "Merci. Notre équipe d'externalisation vous contactera pour confirmer les détails et les frais de service.",
    'I have read and accept the terms and conditions for clients (one-off package).': "J'ai lu et j'accepte les conditions générales pour les clients (forfait ponctuel).",
    'Terms and conditions for clients (one-off package)': 'Conditions générales pour les clients (forfait ponctuel)', 'Request outsourced drivers': 'Demander des chauffeurs externalisés',
    'I need drivers': "J'ai besoin de chauffeurs", 'I am a driver': 'Je suis chauffeur', 'Drivers outsourcing': 'Externalisation de chauffeurs',
    /* outsourcing: driver application */
    '1. You': '1. Vous', '2. Guarantor 1': '2. Garant 1', '3. Guarantor 2': '3. Garant 2', '4. Documents': '4. Documents', '5. Declare': '5. Déclaration', 'Your details': 'Vos informations', 'Guarantor 1': 'Garant 1', 'Guarantor 2': 'Garant 2',
    'Documents and payment': 'Documents et paiement', 'Declaration': 'Déclaration', 'I drive a': 'Je conduis un(e)', 'Car': 'Voiture', 'Truck': 'Camion', "Driver's licence number (optional)": 'Numéro de permis de conduire (facultatif)',
    'Residential phone number': 'Téléphone du domicile', 'Office phone number (optional)': 'Téléphone du bureau (facultatif)', 'Occupation or job title': 'Profession ou intitulé du poste', 'Business name and address': "Nom et adresse de l'entreprise",
    'Email address (optional)': 'Adresse e-mail (facultatif)', 'Relationship to applicant': 'Lien avec le candidat', 'Years known': "Années de connaissance", 'Your documents (optional)': 'Vos documents (facultatif)',
    "Guarantors' documents (optional)": 'Documents des garants (facultatif)', 'Proof of payment (optional)': 'Preuve de paiement (facultatif)', 'Registration payment': "Paiement de l'inscription", 'Drop files here': 'Déposez les fichiers ici', 'or tap to browse': 'ou touchez pour parcourir',
    'Upload copies now, or bring photocopies to the office.': 'Téléversez des copies maintenant, ou apportez des photocopies au bureau.', 'Please do not guarantee someone who has not been well known to you for at least 5 years.': "Ne vous portez pas garant d'une personne que vous ne connaissez pas bien depuis au moins 5 ans.",
    'I confirm that the information in this application is true and correct.': 'Je confirme que les informations de cette candidature sont exactes.', 'My two guarantors have each known me for at least 5 years and have agreed to guarantee me.': "Mes deux garants me connaissent chacun depuis au moins 5 ans et ont accepté de se porter garants.",
    'Your full name (typed as signature)': 'Votre nom complet (saisi comme signature)', 'Submit application': 'Envoyer la candidature', 'Thank you. Your application has been received. Our team will review it and contact you about the next steps.': "Merci. Votre candidature a bien été reçue. Notre équipe l'examinera et vous contactera pour les prochaines étapes.",
    'Application received': 'Candidature reçue'
  });

  /* ---------- engine ---------- */
  function tr(text) { var d = DICT[cur]; if (!d) return null; var k = norm(text); return k && d[k] != null ? d[k] : null; }
  function doText(node) {
    var rec = orig.get(node);
    if (cur === 'en') { if (rec && rec.t != null && node.nodeValue !== rec.t) node.nodeValue = rec.t; return; }
    var cu = node.nodeValue, out = tr(cu);
    if (out == null) { if (rec && rec.t != null && cu === rec.o) return; return; }
    if (!rec) { rec = {}; orig.set(node, rec); }
    if (rec.o !== cu) rec.t = cu;
    var lead = cu.match(/^\s*/)[0], trail = cu.match(/\s*$/)[0];
    rec.o = lead + out + trail; node.nodeValue = rec.o;
  }
  function doAttrs(el) {
    ATTRS.forEach(function (a) {
      if (!el.hasAttribute || !el.hasAttribute(a)) return;
      var key = '_aar_' + a, v = el.getAttribute(a);
      if (cur === 'en') { if (el[key] != null) { el.setAttribute(a, el[key]); el[key] = null; } return; }
      var out = tr(v);
      if (out != null) { if (el[key] == null) el[key] = v; el.setAttribute(a, out); }
    });
    if (el.tagName === 'INPUT' && /^(submit|button)$/.test(el.type) && el.value) {
      if (cur === 'en') { if (el._aar_v != null) { el.value = el._aar_v; el._aar_v = null; } }
      else { var o = tr(el.value); if (o != null) { if (el._aar_v == null) el._aar_v = el.value; el.value = o; } }
    }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { doText(root); return; }
    if (root.nodeType !== 1 || SKIP[root.tagName]) return;
    doAttrs(root);
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function apply() { busy = true; walk(document.body); var t = document.title; if (cur === 'fr') { var o = tr(t); if (o) { document.title = o; document._aarTitle = t; } } else if (document._aarTitle) { document.title = document._aarTitle; } busy = false; }
  function setUI() {
    document.documentElement.lang = cur;
    [].forEach.call(document.querySelectorAll('.lang [data-lang]'), function (b) { b.setAttribute('aria-pressed', b.dataset.lang === cur ? 'true' : 'false'); });
  }
  function set(code) {
    if (code !== 'en' && !DICT[code]) return;
    cur = code; try { localStorage.setItem(KEY, code); } catch (e) {}
    setUI(); apply();
    try { document.dispatchEvent(new CustomEvent('aar:lang', { detail: code })); } catch (e) {}
  }
  function init() {
    var saved = 'en'; try { saved = localStorage.getItem(KEY) || 'en'; } catch (e) {}
    cur = DICT[saved] || saved === 'en' ? saved : 'en';
    [].forEach.call(document.querySelectorAll('.lang [data-lang]'), function (b) { b.addEventListener('click', function () { set(b.dataset.lang); }); });
    setUI(); if (cur !== 'en') apply();
    var mo = new MutationObserver(function (list) {
      if (busy || cur === 'en') return; busy = true;
      list.forEach(function (m) {
        if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes') doAttrs(m.target);
        else [].forEach.call(m.addedNodes, walk);
      });
      busy = false;
    });
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  window.AARLang = { set: set, get: function () { return cur; }, add: add, t: function (s) { return tr(s) || s; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
