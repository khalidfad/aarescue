/* AA Rescue membership card: builds the card, 3D tilt, flip, and entrance. Usage: <div class="aac" data-aac data-name=".." data-plan=".." data-no=".." data-exp="MM/YY"></div>
   AARCard.set(el,{name,plan,no,exp}) updates a mounted card. Sample details only. */
(function(){
var D={name:'Adaeze Okonkwo',plan:'Family',no:'1050 2048 7731',exp:'09/28'};
function qr(seed){var n=21,s=0,i,x,y,r='';for(i=0;i<seed.length;i++)s=(s*31+seed.charCodeAt(i))>>>0;
function f(a,b){return(a<7&&b<7)||(a>13&&b<7)||(a<7&&b>13)}
function fp(a,b){var q=function(v){return v>13?v-14:v};if(!f(a,b))return 0;a=q(a);b=q(b);return(a===0||a===6||b===0||b===6||(a>1&&a<5&&b>1&&b<5))?1:0}
for(y=0;y<n;y++)for(x=0;x<n;x++){var on;if(f(x,y))on=fp(x,y);else{s=(s*1664525+1013904223)>>>0;on=(s>>>28)&1}if(on)r+='<rect x="'+x+'" y="'+y+'" width="1" height="1"/>'}
return'<svg viewBox="0 0 21 21" shape-rendering="crispEdges" aria-hidden="true">'+r+'</svg>'}
function html(){return'<div class="aac-fl"><div class="aac-tilt" tabindex="0" role="button" aria-pressed="false" aria-label="Membership card. Press to flip."><div class="aac-in">'
+'<div class="aac-f aac-front"><i class="bd t"></i><i class="bd b"></i><i class="bd l"></i><i class="bd r"></i><i class="aac-rg"></i>'
+'<div class="aac-top"><span class="aac-lg"><b>AA</b><em>RESCUE</em></span><span class="aac-mb">MEMBERSHIP</span></div><i class="aac-chip"></i>'
+'<div class="aac-no" data-f="no"></div><div class="aac-bt"><div><small>MEMBER</small><b data-f="name"></b></div><div><small>PLAN</small><b data-f="plan"></b></div><div><small>EXPIRES</small><b data-f="exp"></b></div></div><i class="aac-sh"></i></div>'
+'<div class="aac-f aac-back"><i class="bd t"></i><i class="bd b"></i><i class="bd l"></i><i class="bd r"></i><i class="aac-st"></i>'
+'<div class="aac-bk"><div><h4>We stand by our members in times of emergency</h4><p>24-hour recovery in Lagos, Abuja and Port Harcourt<b>0802 555 1111</b></p></div><div class="aac-qr" data-f="qr"></div></div>'
+'<div class="aac-sp">Sample card with fake details. Not valid for service.</div><i class="aac-sh"></i></div></div></div></div>'}
function set(el,d){var k;for(k in d)if(d[k]!=null)el.dataset[k]=d[k];
[].forEach.call(el.querySelectorAll('[data-f]'),function(n){var f=n.dataset.f;if(f==='qr')n.innerHTML=qr((el.dataset.no||'')+(el.dataset.name||''));else n.textContent=el.dataset[f]||D[f]})}
function mount(el){if(el._aac)return;el._aac=1;el.innerHTML=html();set(el,{name:el.dataset.name||D.name,plan:el.dataset.plan||D.plan,no:el.dataset.no||D.no,exp:el.dataset.exp||D.exp});
var t=el.querySelector('.aac-tilt');
function flip(){var o=el.classList.toggle('flip');t.setAttribute('aria-pressed',o)}
t.addEventListener('click',flip);t.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}});
if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
el.addEventListener('pointermove',function(e){if(e.pointerType==='touch')return;var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;el.classList.add('act');el.style.setProperty('--rx',((.5-y)*16).toFixed(1)+'deg');el.style.setProperty('--ry',((x-.5)*22).toFixed(1)+'deg');el.style.setProperty('--sx',(x*100).toFixed(0)+'%')});
el.addEventListener('pointerleave',function(){el.classList.remove('act');el.style.removeProperty('--rx');el.style.removeProperty('--ry');el.style.removeProperty('--sx')})}
if(!el.dataset.nohint)el.insertAdjacentHTML('afterend','<p class="aac-hint">Tap the card to flip it</p>');
if('IntersectionObserver'in window){var io=new IntersectionObserver(function(a){if(a[0].isIntersecting){el.classList.add('in');io.disconnect()}},{threshold:.25});io.observe(el)}else el.classList.add('in')}
window.AARCard={mount:mount,set:set};
[].forEach.call(document.querySelectorAll('[data-aac]'),mount);
})();
