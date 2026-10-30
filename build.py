#!/usr/bin/env python3
"""Builds the missing pages in the inner.css/booking.css/forms.js style from data/site.json,
then normalises links in every page. Run from this folder: python3 build.py"""
import json, re, html, glob, os
from urllib.parse import unquote
E = html.escape
D = json.load(open('data/site.json')); C = D['company']
FILE = {'vehicle-recovery':'recovery','goods-logistics':'logistics','corporate-transportation':'corporate-transport','testing-certification':'driver-testing-certification'}
SV = {FILE.get(s['slug'], s['slug']): s for s in D['services']}
GEN = ['drivers-outsourcing','defensive-driving-training','drivers-academy','driver-testing-certification','corporate-transport','fleet-management']

# ---------- link normalisation ----------
CS = lambda p: 'coming-soon.html?page=' + p.replace(' ', '%20')
LINK = {'About Us':'about.html','Services':'services.html','Contact Us':'contact.html','Book Your Car':'book-car.html','Make Payment':'make-payment.html',
 'Licensing':'licensing.html','Vehicle Recovery':'recovery.html','Drivers Outsourcing':'drivers-outsourcing.html',"Driving School":'learner-driver-training.html',
 'Testing and Certification':'driver-testing-certification.html','Defensive and Advanced Driver Training':'defensive-driving-training.html',
 'General Goods and Equipment Logistics':'logistics.html','Corporate Transportation':'corporate-transport.html','Drivers Academy':'drivers-academy.html',
 'Fleet Management':'fleet-management.html','Vehicle Tracking':'vehicle-tracking.html'}
FOOT = {'Our Story':'about.html#story','Leadership Team':CS('Leadership Team'),'Press &amp; Media':CS('Press and Media'),'Awards':CS('Awards'),
 'Careers':'careers.html','FAQs':'contact.html#faq','Branch Locator':'contact.html#branches','Privacy Policy':CS('Privacy Policy'),
 'Terms of Service':CS('Terms of Service'),'Cookie Policy':CS('Cookie Policy')}
RENAME = {v: k for k, v in {'recovery.html':'vehicle-recovery.html','logistics.html':'goods-logistics.html','corporate-transport.html':'corporate-transportation.html','driver-testing-certification.html':'testing-certification.html'}.items()}
BTN = '<a class="b bd" href="careers.html">Apply for a Job</a>'
BAND = '''<section class="ybn"><div class="w">
<h2><svg class="ic"><use href="#i-users"/></svg>Looking for a job?</h2>
<p>See what we offer, apply in two minutes and upload your CV.</p>
<a class="b bk lg2" href="careers.html">Apply for a job<svg class="ic"><use href="#i-arrow"/></svg></a>
</div></section>
'''
def norm(s, f=''):
    s = re.sub(r'href="coming-soon\.html\?page=([^"]+)"', lambda m: 'href="%s"' % LINK.get(unquote(m.group(1)), m.group(0)[6:-1]), s)
    for old, new in RENAME.items(): s = s.replace('href="%s' % old, 'href="%s' % new)
    for k, v in FOOT.items(): s = s.replace('<a href="#">%s</a>' % k, '<a href="%s">%s</a>' % (v, k))
    if 'class="b bd"' not in s: s = s.replace('<span class="nr">', '<span class="nr">' + BTN, 1)
    if f == 'index.html' and 'Looking for a job' not in s: s = s.replace('<footer', BAND + '<footer', 1)
    return s

# ---------- chrome (from the user's make-payment.html) ----------
src = open('/mnt/user-data/uploads/make-payment.html', encoding='utf-8').read()
TOP = src[src.index('<svg width="0"'):src.index('<main')]
mc = src.index('<a class="b by lg2 mcta"')
FOOTER = src[src.index('<footer'):mc]
TAIL = src[src.index('<a class="fab"'):]
HEAD_T = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>%s | AA Rescue</title>
<meta name="description" content="%s">
<meta name="theme-color" content="#0A0A0B">
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="booking.css">
<link rel="stylesheet" href="inner.css">
<script src="script.js" defer></script>
<script src="forms.js" defer></script>
</head>
<body class="subpage">
        <!--Start of Tawk.to Script-->
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/5eb9049d8ee2956d739ff018/default';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
<!--End of Tawk.to Script-->
'''
def ic(n): return f'<svg class="ic"><use href="#{n}"/></svg>'
BAND_CALL = '''<section class="ybn"><div class="w">
<h2><svg class="ic"><use href="#i-phone"/></svg>Prefer to talk to someone?</h2>
<p>Our team is on the phone 24 hours a day, 7 days a week, including major holidays.</p>
<a class="b bk lg2" href="tel:+2348025551111"><svg class="ic"><use href="#i-phone"/></svg>0802 555 1111</a>
</div></section>
'''
def page(fname, title, desc, body, mcta, cur=None, services=False):
    top = TOP
    if services: top = top.replace('class="ddb"', 'class="ddb cur"', 1)
    if cur: top = top.replace(f'<a href="{cur}">', f'<a href="{cur}" aria-current="page">', 1)
    h = HEAD_T % (E(title), E(desc)) + top + '<main id="top">\n' + body + '\n</main>\n\n' + BAND_CALL + '\n' + FOOTER + f'<a class="b by lg2 mcta" href="#form">{E(mcta)}</a>\n' + TAIL
    open(fname, 'w', encoding='utf-8').write(norm(h, fname))

def hero(crumbs, icon, badge, h1, sub, ctas, photo):
    cr = '<span aria-hidden="true">/</span>'.join(f'<a href="{u}">{E(t)}</a>' for t, u in crumbs[:-1])
    cr += '<span aria-hidden="true">/</span>' + f'<b aria-current="page">{E(crumbs[-1][0])}</b>'
    return f'''<section class="phero">
<div class="hbg" id="hbg" aria-hidden="true"><img src="{photo}" onerror="this.onerror=null;this.src='img/haul-cars.webp'" width="1080" height="810" alt="" fetchpriority="high"></div>
<div class="w pc">
<nav class="crumbs" aria-label="Breadcrumb">{cr}</nav>
<p class="badge">{ic(icon)}{E(badge)}</p>
<h1>{E(h1)}</h1>
<p class="sub">{E(sub)}</p>
<div class="cta">{ctas}</div>
</div>
</section>'''
CALL = f'<a class="b bg2 lg2" href="tel:{C["tel"]}">{ic("i-phone")}Call {C["phone"]}</a>'
PF = lambda slug, alt: f'<div class="pf"><img src="img/photos/{slug}.jpg" onerror="this.onerror=null;this.src=\'img/hq-fleet.webp\'" width="900" height="563" alt="{E(alt)}" loading="lazy"></div>'

# ---------- forms in the site's own pattern ----------
def fd(p, f, opts=None):
    i = f'{p}-{f["id"]}'; t = f.get('t', 'text'); req = f.get('r')
    lab = E(f['l']) + ('' if req else ' <i>(optional)</i>')
    ph = f' placeholder="{E(f["ph"])}"' if f.get('ph') else ''
    rq = ' required' if req else ''
    if t == 'select':
        ctl = f'<select id="{i}" name="{f["id"]}"{rq}><option value="">Choose one</option>' + ''.join(f'<option>{E(x)}</option>' for x in (opts if opts is not None else f.get('o', []))) + '</select>'
    elif t == 'textarea':
        ctl = f'<textarea id="{i}" name="{f["id"]}" rows="3"{ph}{rq}></textarea>'
    elif t == 'tel':
        ctl = f'<input id="{i}" name="{f["id"]}" type="tel"{rq} placeholder="{E(f.get("ph","0802 555 1111"))}" autocomplete="tel" data-v="phone" inputmode="tel">'
    elif t == 'email':
        ctl = f'<input id="{i}" name="{f["id"]}" type="email"{rq} autocomplete="email" data-v="email">'
    elif t == 'number':
        ctl = f'<input id="{i}" name="{f["id"]}" type="number"{rq} min="1" max="10000" inputmode="numeric"{ph}>'
    else:
        ctl = f'<input id="{i}" name="{f["id"]}" type="{t}"{rq}{ph}>'
    half = '' if f.get('c2') is None and t in ('tel', 'email', 'number', 'select', 'date', 'time') or (t == 'text' and not f.get('c2')) else ' c2'
    if f.get('c2'): half = ' c2'
    elif t in ('textarea',): half = ' c2'
    return f'<div class="fd{half}"><label for="{i}">{lab}</label>{ctl}<p class="err" id="e-{i}"></p></div>'

def sform(key, p, ref, name, ok, okt, btn, opts=None, extra=''):
    F = D['forms'][key]; opts = opts or {}
    fs = ''.join(fd(p, f, opts.get(f['id'])) for f in F['fields'] if f['t'] != 'x') if key != 'apply' else ''
    return f'<form class="sf" id="{p}" data-name="{E(name)}" data-ref="{ref}" data-success="{E(ok)}" data-success-title="{E(okt)}" novalidate><div class="gr2">{fs}{extra}</div><button class="b by lg2" type="submit">{E(btn)}</button><p class="fmsg" role="alert"></p></form>'
for k in D['forms']:
    for f in D['forms'][k]['fields']: f.setdefault('t', 'text')

def faq(items): return '<div class="fq lt">' + ''.join(f'<details><summary>{E(q)}</summary><p>{E(a)}</p></details>' for q, a in items) + '</div>'
def rg(slugs):
    out = ''
    for r in slugs:
        r = FILE.get(r, r); s = SV[r]
        out += f'<a href="{r}.html"><b>{E(s["nav"] if len(s["title"])>40 else s["title"])}</b><span>{E(s["short"])}</span><em>Learn more &rarr;</em></a>'
    return f'<div class="rg">{out}</div>'

PREFIX = {'drivers-outsourcing':('drv','DRV'),'defensive-driving-training':('def','DEF'),'drivers-academy':('aca','ACA'),'driver-testing-certification':('tst','TST'),'corporate-transport':('crp','CRP'),'fleet-management':('flt','FLT')}
for slug in GEN:
    s = SV[slug]; p, ref = PREFIX[slug]; F = D['forms'][s['form']]
    ctas = f'<a class="b by lg2" href="#form">{E(s["cta"])}</a>' + (f'<a class="b bd lg2" href="careers.html?position=Driver">Apply as a driver{ic("i-arrow")}</a>' if slug == 'drivers-outsourcing' else CALL)
    body = hero([('Home','index.html'),('Services','services.html'),(s['nav'],'')], s['icon'], s['badge'], s['h1'], s['sub'], ctas, f'img/photos/{slug}.jpg')
    body += f'''<section class="pg2"><div class="w sv2"><div class="bd2">
<div class="it" data-r><h2>{E(s["title"])}</h2><p>{E(s["lead"])}</p><ul class="chk2 in-it">{"".join(f"<li>{ic('i-check')}{E(x)}</li>" for x in s["points"])}</ul>{PF(slug, s["title"])}</div>
<div class="blk" data-r><h2>What you get</h2><div class="hl3">{"".join(f'<div><span class="ib2">{ic(s["icon"])}</span><h3>{E(a)}</h3><p>{E(b)}</p></div>' for a,b in s["features"][:3])}</div></div>
<div class="blk" data-r><h2>How it works</h2><ol class="stp">{"".join(f"<li><b>{E(a)}</b><span>{E(b)}</span></li>" for a,b in s["steps"])}</ol></div>
<div class="blk" data-r><h2>Questions</h2>{faq(s["faqs"] + [("Can I speak to someone instead?", "Yes. Call 0802 555 1111 at any time. Our line is open 24 hours a day, 7 days a week.")])}</div>
<div class="rel blk" data-r><h2>Related services</h2>{rg(s["related"])}</div></div>
<div class="fcard stick" id="form"><h2>{E(F["title"])}</h2><p>{E(F["intro"])}</p>{sform(s["form"], p, ref, s["title"] + " enquiry", "Thank you. Our team will contact you shortly to confirm the details.", "Request received", F["submit"], s.get("formOpts"))}</div></div></section>'''
    page(slug + '.html', s['title'], s['short'], body, s['cta'], services=True)

# ---------- about ----------
A = D['pages']['about']
body = hero([('Home','index.html'),('About Us','')], 'i-award', 'Since 2003', A['h1'], A['sub'], f'<a class="b by lg2" href="services.html">Our services</a><a class="b bg2 lg2" href="contact.html">Contact us</a>', 'img/photos/about.jpg')
body += f'''<section class="wh sx" id="story"><div class="w ab"><div data-r><small>WHO WE ARE</small><h2>A pioneer in rescue and driver training</h2><p>{E(A["who"])}</p><ul class="chk2">{"".join(f"<li>{ic('i-check')}{E(x)}</li>" for x in A["list"])}</ul></div>{PF("about","AA Rescue team")}</div></section>
<section class="dk sx"><div class="w"><div class="abs" data-r>{"".join(f"<div><b>{E(a)}</b><span>{E(b)}</span></div>" for a,b in A["stats"][:3])}</div></div></section>
<section class="sx g"><div class="w"><div class="mvg" data-r><div><small>OUR MISSION</small><h3>{E(A["mission"])}</h3></div><div><small>OUR VISION</small><h3>{E(A["vision"])}</h3></div></div></div></section>
<section class="dk sx" id="values"><div class="w"><div class="sh" data-r><small>CORE VALUES</small><h2>What we stand for</h2></div><div class="vals" data-r>{"".join(f'<div><span class="ib">{ic("i-check")}</span>{E(v)}</div>' for v in A["values"])}</div></div></section>'''
page('about.html', 'About Us', 'AA Rescue is a multi-service organisation founded in 2003, giving comfort and safety to Nigerian motorists.', body, 'Talk to us', cur='about.html')

# ---------- contact ----------
K = D['pages']['contact']; Fc = D['forms']['contact']
body = hero([('Home','index.html'),('Contact Us','')], 'i-mail', 'We are always on', K['h1'], K['sub'], f'<a class="b by lg2" href="tel:{C["tel"]}">{ic("i-phone")}Call {C["phone"]}</a><a class="b bg2 lg2" href="#form">Send a message</a>', 'img/photos/contact.jpg')
body += f'''<section class="pg2"><div class="w cg"><div class="cinfo">
<div class="cem"><span class="ib">{ic("i-phone")}</span><div><b>Emergency line</b><span>Open 24 hours a day, 7 days a week.</span><br><a class="b by" href="tel:{C["tel"]}">{C["phone"]}</a></div></div>
<a href="mailto:{C["email"]}"><span class="ib2">{ic("i-mail")}</span><div><b>Email</b><span>{C["email"]}</span></div></a>
<div id="branches"><span class="ib2">{ic("i-pin")}</span><div><b>Head office</b><p>{E(C["address"])}. We have {C["branches"]} branches across Nigeria.</p></div></div>
<div id="faq"><span class="ib2">{ic("i-hist")}</span><div style="width:100%"><b>Quick answers</b>{faq(K["faqs"])}</div></div></div>
<div class="fcard stick" id="form"><h2>{E(Fc["title"])}</h2><p>{E(Fc["intro"])}</p>{sform("contact","msg","MSG","Contact message","Thank you. We have received your message and will reply shortly.","Message sent",Fc["submit"])}</div></div></section>'''
page('contact.html', 'Contact Us', 'Contact AA Rescue 24/7. Emergency line, email, head office and message form.', body, 'Send a message', cur='contact.html')

# ---------- book car ----------
P = D['pages']['book-car']; Fb = D['forms']['book-car']
body = hero([('Home','index.html'),('Book Your Car','')], 'i-car', 'Car booking', P['h1'], P['sub'], f'<a class="b by lg2" href="#form">Start booking</a>{CALL}', 'img/photos/book-car.jpg')
body += f'''<section class="pg2"><div class="w cg"><div class="fcard" id="form"><h2>{E(Fb["title"])}</h2><p>{E(Fb["intro"])}</p>{sform("book-car","bk","BKG","Car booking request","Thank you. We will confirm availability and price by phone.","Booking request received",Fb["submit"])}</div>
<aside class="cinfo" aria-label="Booking help"><div><span class="ib2">{ic("i-car")}</span><div><b>Choose your vehicle</b><p>Saloon cars, SUVs, executive cars, minibuses and buses, with or without a driver.</p></div></div>
<div><span class="ib2">{ic("i-clock")}</span><div><b>We confirm by phone</b><p>Availability and the final price are confirmed with you before anything is booked.</p></div></div>
<div class="cem"><span class="ib">{ic("i-phone")}</span><div><b>Need it now?</b><span>Call and we will arrange it.</span><br><a class="b by" href="tel:{C["tel"]}">{C["phone"]}</a></div></div></aside></div></section>'''
page('book-car.html', 'Book Your Car', P['sub'], body, 'Start booking')

# ---------- careers (general job application with CV upload) ----------
P = D['pages']['careers']; Fa = D['forms']['apply']; af = {f['id']: f for f in Fa['fields']}
def show(h, cond): return h.replace('<div class="fd', '<div data-show="%s" class="fd' % cond, 1)
others = [x['title'] for x in D['positions'] if x['title'] != 'Driver']
cv = '''<div class="fd c2"><span class="lb">Upload your CV</span><div class="dz" data-max="1" data-req><input type="file" id="app-cv" name="cv" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"><label for="app-cv">''' + ic('i-upload') + '''<b>Upload your CV</b><span>PDF or Word document, up to 5 MB.</span></label><ul class="fl"></ul></div><p class="err" id="e-app-cv"></p></div>'''
consent = '''<div class="fd c2"><div class="chs one" role="group" aria-label="Consent" data-reqany><label><input type="checkbox" name="consent" value="Yes"><span>I confirm the information is true and agree to AA Rescue contacting me about job opportunities.</span></label></div><p class="err" id="e-app-consent"></p></div>'''
fs = ''.join(fd('app', af[i]) for i in ['name','phone','email','state','position'])
fs += show(fd('app', af['type']), 'position=Driver') + show(fd('app', af['licence']), 'position=Driver')
fs += show(fd('app', af['qual']), 'position=' + '||'.join(others)) + fd('app', af['exp']) + fd('app', af['avail']) + cv + fd('app', af['notes']) + consent
roles = ''.join(f'<a href="#form" data-pos="{E(x["title"])}"><span class="ib2">{ic(x["icon"])}</span><h3>{E(x["title"])}</h3><p>{E(x["text"])}</p><em>Apply for this role &rarr;</em></a>' for x in D['positions'])
body = hero([('Home','index.html'),('Careers','')], 'i-users', 'We are hiring', P['h1'], P['sub'], f'<a class="b bd lg2" href="#roles">See roles{ic("i-arrow")}</a><a class="b bg2 lg2" href="#form">Apply now</a>', 'img/photos/careers.jpg')
body += f'''<section class="sx g" id="roles"><div class="w"><div class="sh" data-r><small>CAREERS</small><h2>Roles we recruit for</h2><p>Pick the role that fits you, or choose Other and tell us how you can help.</p></div><div class="hl3 pos" data-r>{roles}</div></div></section>
<section class="pg2"><div class="w cg"><div class="fcard" id="form"><h2>{E(Fa["title"])}</h2><p>{E(Fa["intro"])}</p><form class="sf" id="app" data-name="Job application" data-ref="JOB" data-success="Thank you. Our recruitment team will review your application and contact shortlisted candidates." data-success-title="Application received" novalidate><div class="gr2">{fs}</div><button class="b bd lg2" type="submit">{E(Fa["submit"])}</button><p class="fmsg" role="alert"></p></form></div>
<aside class="cinfo" aria-label="About working with us"><div><span class="ib2">{ic("i-users")}</span><div><b>One form for every role</b><p>Choose your position first. Extra questions appear only when they apply, for example driver type and licence for drivers.</p></div></div>
<div><span class="ib2">{ic("i-shield")}</span><div><b>Every application is read</b><p>Our recruitment team reviews applications and contacts shortlisted candidates.</p></div></div>
<div><span class="ib2">{ic("i-file")}</span><div><b>Have your CV ready</b><p>Upload a PDF or Word CV with your experience, qualifications and contacts.</p></div></div>
<div class="cem"><span class="ib">{ic("i-phone")}</span><div><b>Questions about applying?</b><span>Call our team.</span><br><a class="b by" href="tel:{C["tel"]}">{C["phone"]}</a></div></div></aside></div></section>
<script>(function(){{var s=document.getElementById('app-position');if(!s)return;
function set(v){{s.value=v;['input','change'].forEach(function(e){{s.dispatchEvent(new Event(e,{{bubbles:true}}))}})}}
document.querySelectorAll('[data-pos]').forEach(function(a){{a.addEventListener('click',function(e){{e.preventDefault();set(a.dataset.pos);document.getElementById('form').scrollIntoView({{behavior:'smooth'}})}})}});
window.addEventListener('load',function(){{var q=new URLSearchParams(location.search).get('position');if(q)set(q)}});}})();</script>'''
page('careers.html', 'Careers', 'Apply for a job with AA Rescue. Choose a position, fill a short form and upload your CV.', body, 'Apply now')

# ---------- normalise the pages that already exist ----------
for f in glob.glob('*.html'):
    if f in [g + '.html' for g in GEN] + ['about.html','contact.html','book-car.html','careers.html']: continue
    t = open(f, encoding='utf-8').read(); open(f, 'w', encoding='utf-8').write(norm(t, f))
print('done')
