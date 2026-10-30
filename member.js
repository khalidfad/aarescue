/* AA Rescue membership: sign up, login, dashboard.
   PREVIEW ONLY: accounts live in this browser (localStorage) and the password hash is NOT secure.
   For launch, post the forms to your real endpoints (signup.php / login.php) and load dashboard data from your database. */
(function(){
var U='aar_members',S='aar_session',DAY=864e5;
var PLANS={starter:{n:'Starter',r:2,v:1,p:35000,k:['24/7 dispatch line','Member dashboard']},standard:{n:'Standard',r:5,v:2,p:85000,k:['Priority dispatch','10% off driving school']},family:{n:'Family',r:12,v:5,p:180000,k:['Priority dispatch','Renewal & document reminders']}};
var BR=[['Head Office, Lekki, Lagos', 'AAR-HQ'], ['Abuja Office 1, Gudu', 'AAR-ABJ1'], ['Abuja Office 2', 'AAR-ABJ2'], ['Kaduna Office', 'AAR-KAD'], ['Orchid Road Office, Lagos', 'AAR-ORC'], ['Festac Office, Lagos', 'AAR-FST'], ['Ikeja Office, Lagos', 'AAR-IKJ'], ['Magodo Office, Lagos', 'AAR-OMO'], ['Ogombo Office, Lagos', 'AAR-OGO'], ['Lekki Phase 1 Office, Lagos', 'AAR-LEK1'], ['Ikota Office, Lagos', 'AAR-IKO'], ['Port Harcourt 1', 'AAR-PHC1'], ['Port Harcourt 2', 'AAR-PHC2'], ['Sangotedo', 'AAR-SAN'], ['Benin', 'AAR-BEN'], ['Allen', 'AAR-ALN'], ['Ikoyi', ''], ['Bayelsa', 'AAR-BAY'], ['Asaba', 'AAR-ASB'], ['Uyo', 'AAR-UYO'], ['Chevron', 'AAR-CHV']];  /* branch register: [name, code]; Ikoyi has no code until its clash with Ikota is resolved */
var $=function(s,r){return(r||document).querySelector(s)};
var iso=function(o){return new Date(Date.now()+o*DAY).toISOString().slice(0,10)};
var esc=function(s){return String(s).replace(/[&<>"']/g,function(c){return'&#'+c.charCodeAt(0)+';'})};
var fmt=function(d){return new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})};
function hs(s){var h=5381,i;for(i=0;i<s.length;i++)h=(h*33)^s.charCodeAt(i);return(h>>>0).toString(36)}
function rd(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function users(){var u=rd(U);if(!u){u={demo:{username:'demo',name:'Adaeze Okonkwo',email:'adaeze@example.com',phone:'0801 234 5678',plan:'standard',branch:'Lekki Phase 1 Office, Lagos',bc:'AAR-LEK1',id:'AAR-100245',joined:iso(-250),h:hs('demo:Demo@1234'),
vehicles:[{m:'Toyota Camry',pl:'LND-482KJ',lic:iso(140),ins:iso(21),rw:iso(-12)},{m:'Honda CR-V',pl:'ABC-317XY',lic:iso(260),ins:iso(190),rw:iso(75)}],
history:[{id:'AAR-RSC-04226',d:iso(-12),t:'Breakdown',v:'Toyota Camry',l:'Lekki Phase 1 to Home'},{id:'AAR-RSC-03826',d:iso(-47),t:'Flat tyre',v:'Honda CR-V',l:'Ikoyi to Workshop'},{id:'AAR-REC-01126',d:iso(-93),t:'Accident recovery',v:'Toyota Camry',l:'Third Mainland Bridge to Workshop'},{id:'AAR-RSC-03126',d:iso(-171),t:'Battery',v:'Honda CR-V',l:'Victoria Island, on site'}]}};save(u)}return u}
function save(u){try{localStorage.setItem(U,JSON.stringify(u))}catch(e){}}
function me(){var s=localStorage.getItem(S);return s?users()[s]:null}
function bad(el,m){var f=el.closest('.fld');f.classList.toggle('bad',!!m);f.querySelector('.err').textContent=m||''}
function msg(t,ok){var m=$('#fmsg');m.textContent=t;m.className='fm-msg'+(ok?' ok':'')}

/* nav: Login becomes My Dashboard when signed in */
var u0=me();[].forEach.call(document.querySelectorAll('[data-auth-link]'),function(a){if(u0){a.href='dashboard.html';a.lastChild.textContent='My Dashboard'}});
/* show/hide password */
[].forEach.call(document.querySelectorAll('.eye'),function(b){b.onclick=function(){var i=b.parentNode.querySelector('input');i.type=i.type==='password'?'text':'password'}});

var sf=$('#signupForm');if(sf){var q=new URLSearchParams(location.search).get('plan');if(q&&PLANS[q])$('#plan').value=q;
var pf=$('#plan')&&$('#plan').closest('.fld');
if(pf&&$('#plan').tagName==='SELECT'&&!$('#branch')){var bf=pf.cloneNode(true),bl=bf.querySelector('label'),bs=bf.querySelector('select'),er=bf.querySelector('.err');
if(bl){bl.textContent='Home branch';bl.setAttribute('for','branch')}bs.id='branch';bs.name='branch';
bs.innerHTML='<option value="">Choose your nearest branch</option>'+BR.map(function(b,i){return'<option value="'+i+'">'+esc(b[0])+(b[1]?' ('+b[1]+')':'')+'</option>'}).join('')+'<option value="-1">Not sure, assign me a branch</option>';
if(er)er.textContent='';bf.classList.remove('bad');pf.parentNode.insertBefore(bf,pf.nextSibling)}
sf.onsubmit=function(e){e.preventDefault();var f=sf.elements,ok=true,all=users();
function chk(el,t,m){var v=el.value.trim();bad(el,t(v)?'':m);if(!t(v))ok=false}
chk(f.fullname,function(v){return v.length>2},'Enter your full name');
chk(f.username,function(v){return/^[A-Za-z0-9_.]{3,20}$/.test(v)},'3-20 letters, numbers, . or _');
chk(f.email,function(v){return/^\S+@\S+\.\S+$/.test(v)},'Enter a valid email');
chk(f.phone,function(v){return/^(\+?234|0)\d{10}$/.test(v.replace(/\s/g,''))},'Enter a valid Nigerian number');
if(f.branch)chk(f.branch,function(v){return v!==''},'Choose your nearest branch');
chk(f.password,function(v){return v.length>=8},'Use at least 8 characters');
if(!ok)return;var un=f.username.value.trim().toLowerCase();
if(all[un]){bad(f.username,'That username is taken');return}
var b=f.branch?BR[+f.branch.value]:null;
all[un]={username:un,branch:b?b[0]:'',bc:b?b[1]:'',name:f.fullname.value.trim(),email:f.email.value.trim(),phone:f.phone.value.trim(),plan:f.plan.value,id:'AAR-'+(100000+Math.floor(Math.random()*899999)),joined:iso(0),h:hs(un+':'+f.password.value),vehicles:[],history:[]};
save(all);localStorage.setItem(S,un);msg('Account created. Taking you to your dashboard...',1);setTimeout(function(){location.href='dashboard.html'},700)}}

var lf=$('#loginForm');if(lf){lf.onsubmit=function(e){e.preventDefault();var f=lf.elements,un=f.username.value.trim().toLowerCase(),pw=f.password.value,ok=true;
bad(f.username,un?'':'Enter your username');bad(f.password,pw?'':'Enter your password');if(!un||!pw)return;
var u=users()[un];if(!u||u.h!==hs(un+':'+pw)){msg('Incorrect username or password.');return}
localStorage.setItem(S,un);location.href='dashboard.html'}}

if(document.body.dataset.page==='dashboard'){var u=me();if(!u){location.replace('login.html');return}
var p=PLANS[u.plan]||PLANS.starter,used=u.history.length,left=Math.max(0,p.r-used),end=new Date(u.joined).getTime()+365*DAY,days=Math.max(0,Math.ceil((end-Date.now())/DAY));
$('#dHi').textContent='Welcome, '+u.name.split(' ')[0];$('#dStat').textContent='Active member \u00B7 '+u.id;
$('#dSub').textContent=p.n+' plan \u00B7 renews '+fmt(end);
$('#sLeft').textContent=left+' / '+p.r;$('#sDays').textContent=days;$('#sVeh').textContent=u.vehicles.length+' / '+p.v;$('#sTot').textContent=used;
$('#pName').textContent=p.n;$('#pPrice').textContent='\u20A6'+p.p.toLocaleString()+' per year \u00B7 renews '+fmt(end);
setTimeout(function(){$('#mBar').style.width=Math.min(100,used/p.r*100)+'%'},200);
$('#mTxt').textContent=used+' of '+p.r+' rescues used this membership year.'+(left===0?' Call us for additional rescues.':'');
$('#pPerks').innerHTML=[p.r+' rescues a year','Up to '+p.v+' vehicle'+(p.v>1?'s':'')].concat(p.k).map(function(k){return'<li>'+esc(k)+'</li>'}).join('');
$('#hist').innerHTML=u.history.length?u.history.map(function(h){return'<div class="hr2"><span>'+fmt(h.d)+'</span><span><b>'+esc(h.t)+' \u00B7 '+esc(h.v)+'</b><small>'+esc(h.l)+' \u00B7 '+esc(h.id)+'</small></span><span class="tag">Completed</span></div>'}).join(''):'<p class="empty">No rescues yet. We hope it stays that way, but we are one call away on 0802 555 1111.</p>';
function st(d,l){var n=Math.ceil((new Date(d)-Date.now())/DAY);return'<span class="tag '+(n<0?'r2':n<=30?'w2':'')+'">'+l+': '+(n<0?'expired':n<=30?'due in '+n+'d':fmt(d))+'</span>'}
function veh(){$('#veh').innerHTML=u.vehicles.length?u.vehicles.map(function(v){return'<div class="vh"><b>'+esc(v.m)+' \u00B7 '+esc(v.pl)+'</b>'+(v.lic?'<div class="ch">'+st(v.lic,'Licence')+st(v.ins,'Insurance')+st(v.rw,'Roadworthy')+'</div>':'')+'</div>'}).join(''):'<p class="empty">Add your first vehicle so we can find it faster.</p>'}veh();
$('#acct').innerHTML='<dt>Name</dt><dd>'+esc(u.name)+'</dd><dt>Username</dt><dd>'+esc(u.username)+'</dd><dt>Email</dt><dd>'+esc(u.email)+'</dd><dt>Phone</dt><dd>'+esc(u.phone)+'</dd>'+(u.branch?'<dt>Home branch</dt><dd>'+esc(u.branch)+(u.bc?' ('+esc(u.bc)+')':'')+'</dd>':'')+'<dt>Member since</dt><dd>'+fmt(u.joined)+'</dd>';
$('#logout').onclick=function(){localStorage.removeItem(S);location.href='index.html'};
var d=$('#vd');$('#addV').onclick=function(){$('#ve').textContent='';d.showModal()};$('#vc').onclick=function(){d.close()};
$('#vf').onsubmit=function(e){e.preventDefault();var m=$('#vm').value.trim(),pl=$('#vp').value.trim().toUpperCase();
if(!m||!pl){$('#ve').textContent='Enter the make and the plate number.';return}
if(u.vehicles.length>=p.v){$('#ve').textContent='Your '+p.n+' plan covers '+p.v+' vehicle'+(p.v>1?'s':'')+'. Upgrade to add more.';return}
u.vehicles.push({m:m,pl:pl});var a=users();a[u.username]=u;save(a);veh();$('#sVeh').textContent=u.vehicles.length+' / '+p.v;$('#vm').value=$('#vp').value='';d.close()}}
})();
