#!/usr/bin/env python3
"""Generates all inner pages from data/site.json. Run: python3 build.py"""
import json, re, html
from urllib.parse import unquote

D = json.load(open('data/site.json'))
C = D['company']
SV = D['services']
E = html.escape

# --- link map: old coming-soon labels -> real pages
LINK = {'About Us':'about.html','Services':'services.html','Contact Us':'contact.html','Book Your Car':'book-car.html',
 'Make Payment':'make-payment.html','Licensing':'https://licence.aarescuenigeria.com','Blog':'https://blog.aarescuenigeria.com',
 'Vehicle Recovery':'vehicle-recovery.html','Drivers Outsourcing':'drivers-outsourcing.html',"Learner Driver's Training":'learner-driver-training.html',
 'Testing and Certification':'testing-certification.html','Defensive and Advanced Driver Training':'defensive-driving-training.html',
 'General Goods and Equipment Logistics':'goods-logistics.html','Corporate Transportation':'corporate-transportation.html',
 'Drivers Academy':'drivers-academy.html','Fleet Management':'fleet-management.html','Vehicle Tracking':'vehicle-tracking.html'}
FOOT = {'Our Story':'about.html#story','Leadership Team':'about.html#story','Press &amp; Media':'contact.html','Awards':'about.html#values',
 'Careers':'apply-driver.html','FAQs':'contact.html#faq','Branch Locator':'contact.html#branches'}

def relink(s):
    s = re.sub(r'href="coming-soon\.html\?page=([^"]+)"', lambda m: 'href="%s"' % LINK.get(unquote(m.group(1)), 'services.html'), s)
    for k, v in FOOT.items():
        s = s.replace('<a href="#">%s</a>' % k, '<a href="%s">%s</a>' % (v, k))
    return s

src = open('/mnt/user-data/uploads/coming-soon.html', encoding='utf-8').read()
top = relink(src[src.index('<svg width="0"'):src.index('<main')])
bot = relink(src[src.index('<footer'):src.index('<script>\n(function(){')])
top = top.replace('<a href="index.html">Home</a>', '<a href="index.html">Home</a>', 1)
# Make service dropdown point at dedicated pages
top = top.replace('<a href="haul-vehicle.html">Haulage</a>', '<a href="haul-vehicle.html">Haulage</a>')

def page(fname, title, desc, body, bg='haul-cars'):
    h = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)} | AA Rescue</title>
<meta name="description" content="{E(desc)}">
<meta name="theme-color" content="#0A0A0B">
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800;900&display=swap">
<link rel="stylesheet" href="styles.css">
<link rel="stylesheet" href="pages.css">
<script src="script.js" defer></script>
<script src="pages.js" defer></script>
</head>
<body class="subpage">
{top}
<main id="top">
{body}
</main>
{bot}
</body>
</html>'''
    open(fname, 'w', encoding='utf-8').write(h)

def ic(n): return f'<svg class="ic"><use href="#{n}"/></svg>'

def hero(crumbs, badge_icon, badge, h1, sub, ctas, bg='haul-cars'):
    cr = '<span aria-hidden="true">/</span>'.join(
        f'<a href="{u}">{E(t)}</a>' for t, u in crumbs[:-1])
    cr += ('<span aria-hidden="true">/</span>' if crumbs[:-1] else '') + f'<b aria-current="page">{E(crumbs[-1][0])}</b>'
    return f'''<section class="phero">
<div class="hbg" id="hbg" aria-hidden="true"><img src="img/{bg}.webp" width="1080" height="810" alt="" fetchpriority="high"></div>
<div class="w pc">
<nav class="crumbs" aria-label="Breadcrumb">{cr}</nav>
<p class="badge">{ic(badge_icon)}{E(badge)}</p>
<h1>{E(h1)}</h1>
<p class="sub">{E(sub)}</p>
<div class="cta">{ctas}</div>
</div>
</section>'''

CALL = f'<a class="b bg2 lg2" href="tel:{C["tel"]}">{ic("i-phone")}{C["phone"]}</a>'

def field(pfx, f, opts=None):
    i = pfx + f['id']; t = f.get('t', 'text'); req = ' required' if f.get('r') else ''
    lab = E(f['l']) + (' <i>(optional)</i>' if not f.get('r') and '(optional)' not in f['l'] and t != 'select' and False else '')
    ph = f' placeholder="{E(f["ph"])}"' if f.get('ph') else ''
    ac = {'name':'name','phone':'tel','email':'email','company':'organization'}.get(f['id'], 'off')
    ac = f' autocomplete="{ac}"' if ac != 'off' else ''
    if t == 'select':
        o = opts if opts is not None else f.get('o', [])
        ctl = f'<select id="{i}" name="{f["id"]}"{req}><option value="">Select…</option>' + ''.join(f'<option>{E(x)}</option>' for x in o) + '</select>'
    elif t == 'textarea':
        ctl = f'<textarea id="{i}" name="{f["id"]}"{req}{ph}></textarea>'
    else:
        extra = ' inputmode="tel"' if t == 'tel' else (' min="1"' if t == 'number' else '')
        ctl = f'<input id="{i}" name="{f["id"]}" type="{t}"{req}{ph}{extra}{ac}>'
    return f'<div class="fd{" c2" if f.get("c2") else ""}"><label for="{i}">{lab}</label>{ctl}<p class="err" id="e-{i}"></p></div>'

def form(key, opts=None, pfx='f-'):
    F = D['forms'][key]; opts = opts or {}
    fs = ''.join(field(pfx, f, opts.get(f['id'])) for f in F['fields'])
    return f'''<div class="fcard2" id="request">
<h2>{E(F["title"])}</h2><p>{E(F["intro"])}</p>
<form data-form="{key}" novalidate>
<div class="gr2">{fs}</div>
<div class="hp" aria-hidden="true"><label for="{pfx}hp">Leave empty</label><input class="hpi" id="{pfx}hp" tabindex="-1" autocomplete="off"></div>
<div class="fsub"><button class="b by lg2" type="submit">{E(F["submit"])}{ic("i-arrow")}</button><small>We use your details only to respond to this request.</small></div>
<p class="fmsg" role="alert"></p>
</form>
<div class="ok" role="status"><span class="ib">{ic("i-checkc")}</span><h3>Request received</h3><p>Thank you. Our team will contact you shortly. For anything urgent, call {C["phone"]}.</p></div>
</div>'''

def side(emerg=False):
    steps = ['You send the form','We confirm by phone or email','We deliver the service']
    return f'''<aside class="side">
<div class="callout"><h3>{"Need help right now?" if emerg else "Prefer to talk?"}</h3><p>Our team is available {E(C["hours"])}.</p><a class="b by" href="tel:{C["tel"]}">{ic("i-phone")}Call {C["phone"]}</a></div>
<div class="nxt"><h3>What happens next</h3><ol>{"".join(f'<li><b>{n+1}</b>{s}</li>' for n,s in enumerate(steps))}</ol></div>
</aside>'''

def faq(items):
    return '<div class="fq">' + ''.join(f'<details><summary>{E(q)}{ic("i-chev")}</summary><p>{E(a)}</p></details>' for q, a in items) + '</div>'

def sh(small, h2, p=''):
    return f'<div class="sh" data-r><small>{small}</small><h2>{h2}</h2>{"<p>"+E(p)+"</p>" if p else ""}</div>'

def banner():
    return f'''<section class="ybn"><div class="w"><h2>{ic("i-bolt")}Roadside emergency?</h2><p>Dispatch is open {E(C["hours"])}.</p>
<a class="b bk lg2" href="tel:{C["tel"]}">{ic("i-phone")}Call {C["phone"]}</a></div></section>'''

by = {s['slug']: s for s in SV}

def service_page(s):
    ctas = f'<a class="b by lg2" href="#request">{E(s["cta"])}{ic("i-arrow")}</a>{CALL}'
    chips = ''
    body = hero([('Home','index.html'),('Services','services.html'),(s['nav'],'')], s['icon'], s['badge'], s['h1'], s['sub'], ctas)
    body += f'''
<section class="wh"><div class="w sp">
<div class="tx" data-r><small>OVERVIEW</small><h2>{E(s["title"])}</h2><p>{E(s["lead"])}</p>
<ul class="ck">{"".join(f"<li>{ic('i-check')}{E(p)}</li>" for p in s["points"])}</ul>
<a class="b by lg2" href="#request">{E(s["cta"])}{ic("i-arrow")}</a></div>
<ul class="facts" data-r data-stagger>{"".join(f"<li data-r><b>{E(a)}</b><span>{E(b)}</span></li>" for a,b in s["facts"])}</ul>
</div></section>
<section class="sec lt"><div class="w">{sh("WHAT YOU GET","What is included")}
<div class="fgrid" data-stagger>{"".join(f'<div class="fcard" data-r><span class="ib l">{ic(s["icon"])}</span><h3>{E(a)}</h3><p>{E(b)}</p></div>' for a,b in s["features"])}</div></div></section>
<section class="dk"><div class="w">{sh("HOW IT WORKS","Three simple steps")}
<ol class="stp" data-stagger>{"".join(f'<li data-r><b>{i+1}</b><h3>{E(a)}</h3><p>{E(b)}</p></li>' for i,(a,b) in enumerate(s["steps"]))}</ol></div></section>
<section class="sec lt" id="form"><div class="w">{sh("GET STARTED",E(s["cta"]))}
<div class="fwrap">{form(s["form"], s.get("formOpts"))}{side(s["slug"]=="vehicle-recovery")}</div></div></section>
<section class="sec"><div class="w">{sh("FAQ","Common questions")}{faq(s["faqs"])}</div></section>
<section class="sec lt"><div class="w">{sh("RELATED","You may also need")}
<div class="fgrid" data-stagger>{"".join(rel(by[r]) for r in s["related"])}</div></div></section>
{banner()}'''
    page(s['slug'] + '.html', s['title'], s['short'], body)

def rel(x):
    return f'<a class="fcard" data-r href="{x["slug"]}.html"><span class="ib l">{ic(x["icon"])}</span><h3>{E(x["title"])}</h3><p>{E(x["short"])}</p><span class="more">Learn more{ic("i-arrow")}</span></a>'

for s in SV: service_page(s)

# --- Services index
extra = [dict(slug='haul-vehicle', title='Vehicle Haulage', icon='i-truck', short='Multi-loader and flatbed trucks move your vehicles across the country. Book online.'),
         dict(slug='', title='Licensing', icon='i-doc', short='Vehicle papers, driver\'s licence and International Driving Permit.', ext='https://licence.aarescuenigeria.com'),
         dict(slug='', title='Job Portal', icon='i-search', short='Find driver and personnel roles with AA Rescue.', ext='apply-driver.html')]
def card(x):
    href = x.get('ext') or x['slug'] + '.html'
    return f'<a class="fcard" data-r href="{href}"><span class="ib l">{ic(x["icon"])}</span><h3>{E(x["title"])}</h3><p>{E(x["short"])}</p><span class="more">Learn more{ic("i-arrow")}</span></a>'
body = hero([('Home','index.html'),('Services','')], 'i-bolt', 'All services', 'Everything your vehicle and fleet needs',
            'From emergency rescue to driver training, haulage and fleet management, all under one roof since 2003.',
            f'<a class="b by lg2" href="contact.html">Talk to us{ic("i-arrow")}</a>{CALL}')
body += f'<section class="sec lt"><div class="w">{sh("OUR SERVICES","Choose a service")}<div class="sgrid" data-stagger>{"".join(card(x) for x in SV[:1]+extra[:1]+SV[1:]+extra[1:])}</div></div></section>{banner()}'
page('services.html', 'Services', 'All AA Rescue services: rescue, haulage, driver training, outsourcing, logistics, fleet management and tracking.', body)

# --- About
A = D['pages']['about']
body = hero([('Home','index.html'),('About Us','')], 'i-award', 'Since 2003', A['h1'], A['sub'], f'<a class="b by lg2" href="services.html">Our services{ic("i-arrow")}</a><a class="b bg2 lg2" href="contact.html">Contact us{ic("i-arrow")}</a>')
body += f'''<section class="wh" id="story"><div class="w sp"><div class="tx" data-r><small>WHO WE ARE</small><h2>A pioneer in rescue and driver training</h2><p>{E(A["who"])}</p>
<a class="b by lg2" href="contact.html">Work with us{ic("i-arrow")}</a></div>
<div data-r><p style="font-weight:700;margin-bottom:14px">What we do</p><ul class="ck">{"".join(f"<li>{ic('i-check')}{E(i)}</li>" for i in A["list"])}</ul></div></div></section>
<section class="dk"><div class="w"><ul class="st5 s4" data-stagger>{"".join(f'<li class="card" data-r><b>{E(a)}</b><span>{E(b)}</span></li>' for a,b in A["stats"])}</ul></div></section>
<section class="sec lt" id="values"><div class="w">{sh("PURPOSE","Mission, vision and values")}
<div class="vals" data-stagger><div class="fcard" data-r><span class="ib l">{ic("i-nav")}</span><h3>Mission</h3><p>{E(A["mission"])}</p></div>
<div class="fcard" data-r><span class="ib l">{ic("i-search")}</span><h3>Vision</h3><p>{E(A["vision"])}</p></div>
<div class="fcard" data-r><span class="ib l">{ic("i-award")}</span><h3>Core values</h3><ul class="tags">{"".join(f"<li>{E(v)}</li>" for v in A["values"])}</ul></div></div></div></section>
<section class="sec"><div class="w">{sh("TEAM","Over 17 branches across Nigeria","A dynamic board, strategic management and passionate people serve you nationwide.")}
<div class="ctr"><a class="b by lg2" href="contact.html#branches">Find a branch{ic("i-pin")}</a></div></div></section>{banner()}'''
page('about.html', 'About Us', 'AA Rescue is a multi-service organisation founded in 2003, giving comfort and safety to Nigerian motorists.', body)

# --- Contact
K = D['pages']['contact']
body = hero([('Home','index.html'),('Contact Us','')], 'i-mail', 'We are always on', K['h1'], K['sub'], f'<a class="b by lg2" href="tel:{C["tel"]}">{ic("i-phone")}Call {C["phone"]}</a><a class="b bg2 lg2" href="#request">Send a message{ic("i-arrow")}</a>')
body += f'''<section class="sec lt"><div class="w">
<div class="cinfo" data-stagger>
<a class="fcard" data-r href="tel:{C["tel"]}"><span class="ib l">{ic("i-phone")}</span><b>Emergency line</b><p>{C["phone"]}</p></a>
<a class="fcard" data-r href="mailto:{C["email"]}"><span class="ib l">{ic("i-mail")}</span><b>Email</b><p>{C["email"]}</p></a>
<div class="fcard" data-r><span class="ib l">{ic("i-clock")}</span><b>Working hours</b><p>{E(C["hours"].capitalize())}</p></div></div>
<div class="fwrap">{form("contact")}<aside class="side">
<div class="callout" id="branches"><h3>Head office</h3><p>{E(C["address"])}. We have {C["branches"]} branches across Nigeria.</p><a class="b by" href="https://www.google.com/maps/search/?api=1&amp;query={E(C["address"].replace(" ","+"))}">{ic("i-pin")}Open in Maps</a></div>
<div class="nxt"><h3>Follow us</h3><div class="so"><a href="https://www.facebook.com/aarescuenigeria/" aria-label="Facebook">{ic("i-fb")}</a><a href="https://twitter.com/AARescueNigeria" aria-label="X">{ic("i-tw")}</a><a href="https://www.instagram.com/aarescuenigeria/" aria-label="Instagram">{ic("i-ig")}</a></div></div></aside></div></div></section>
<section class="sec" id="faq"><div class="w">{sh("FAQ","Quick answers")}{faq(K["faqs"])}</div></section>'''
page('contact.html', 'Contact Us', 'Contact AA Rescue 24/7. Emergency line, email, head office and message form.', body)

# --- Book car & Payment
for key, slug, icn, badge, btxt, bk in [('book-car','book-car','i-car','Car booking','Book your car','book-car'),('make-payment','make-payment','i-shield','Secure payments','Make a payment','payment')]:
    P = D['pages'][key]
    body = hero([('Home','index.html'),(P['title'],'')], icn, badge, P['h1'], P['sub'], f'<a class="b by lg2" href="#request">{btxt}{ic("i-arrow")}</a>{CALL}')
    body += f'<section class="sec lt"><div class="w"><div class="fwrap">{form(bk)}{side()}</div></div></section>'
    page(slug + '.html', P['title'], P['sub'], body)

# --- Rewrite links in the three existing pages
for f in ['index.html', 'haul-vehicle.html', 'coming-soon.html']:
    t = open('/mnt/user-data/uploads/' + f, encoding='utf-8').read()
    open(f, 'w', encoding='utf-8').write(relink(t))
print('built', len(SV) + 4, 'pages')
