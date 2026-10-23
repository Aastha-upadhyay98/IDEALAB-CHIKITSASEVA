'use strict';
/* ---------- helpers ---------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5;
const TODAY=(()=>{const x=new Date();x.setHours(0,0,0,0);return x})();
const pad=n=>String(n).padStart(2,'0');
const iso=x=>`${x.getFullYear()}-${pad(x.getMonth()+1)}-${pad(x.getDate())}`;
const off=n=>iso(new Date(TODAY.getTime()+n*DAY));
const pd=s=>{const [y,m,d]=String(s).split('-').map(Number);return new Date(y,m-1,d)};
const daysUntil=s=>Math.round((pd(s)-TODAY)/DAY);
const LAST_UPDATED='22 October 2026';

/* ---------- UI prefs (per-viewer convenience) ---------- */
let ui={lang:'en',fs:15,theme:'system'};
try{const s=localStorage.getItem('cs2-ui');if(s)ui=Object.assign(ui,JSON.parse(s))}catch(e){}
if(!['en','hi','mr'].includes(ui.lang))ui.lang='en';
const saveUi=()=>{try{localStorage.setItem('cs2-ui',JSON.stringify(ui))}catch(e){}};
const LOCALE={en:'en-IN',hi:'hi-IN',mr:'mr-IN-u-nu-latn'};
const curLang=()=>state&&state.user&&state.user.type!=='citizen'&&/^#(o|a)-/.test(location.hash)?'en':ui.lang;
function t(s,p){const L=curLang();let out=(L!=='en'&&T[L]&&T[L][s])||s;if(p)out=out.replace(/\{(\w+)\}/g,(m,k)=>p[k]!=null?p[k]:m);return out}
const tt=(s,p)=>esc(t(s,p));
function applyUi(){
  const r=document.documentElement;r.style.fontSize=ui.fs+'px';r.lang=ui.lang;
  if(ui.theme==='system')r.removeAttribute('data-theme');else r.setAttribute('data-theme',ui.theme);
}
const fmtD=s=>s?pd(s).toLocaleDateString(LOCALE[curLang()],{weekday:'short',day:'numeric',month:'short',year:'numeric'}):'—';
const fmtS=s=>s?pd(s).toLocaleDateString(LOCALE[curLang()],{day:'numeric',month:'short',year:'numeric'}):'—';
const fmtT=x=>{if(!x)return'';const[h,m]=x.split(':').map(Number);return new Date(2000,0,1,h,m).toLocaleTimeString(LOCALE[curLang()],{hour:'numeric',minute:'2-digit'})};
const fmtDay=s=>pd(s).toLocaleDateString(LOCALE[curLang()],{day:'numeric'});
const fmtMon=s=>pd(s).toLocaleDateString(LOCALE[curLang()],{month:'short'});
const inr=n=>'₹'+Number(n).toLocaleString('en-IN');
const stamp=()=>new Date().toLocaleString('en-IN',{day:'numeric',month:'short',year:'numeric',hour:'numeric',minute:'2-digit'});
const rel=s=>{const d=daysUntil(s);if(d===0)return t('Today');if(d===1)return t('Tomorrow');if(d===-1)return t('Yesterday');return d>0?t('In {n} days',{n:d}):t('{n} days ago',{n:-d})};
const datebox=s=>`<div class="datebox" aria-hidden="true"><b>${esc(fmtMon(s))}</b><span>${esc(fmtDay(s))}</span></div>`;

const NOTE_RX=[[/^Request submitted\.$/,'Request submitted.'],[/^Sent to (.+?) at your request\.$/,'Sent to {x} at your request.'],[/^Sent to (.+)\.$/,'Sent to {x}.'],[/^Withdrawn by the citizen\.$/,'Withdrawn by the citizen.'],[/^Citizen response: ([\s\S]*)$/,'Your response: {x}'],[/^Citizen limited shared details to name only\.$/,'You limited shared details to your name only.'],[/^Referred to (.+?) for additional support\.$/,'Referred to {x} for additional support.'],[/^Accepted by (.+?)\.$/,'Accepted by {x}.'],[/^Assistance is under way\.$/,'Assistance is under way.'],[/^Marked as resolved\.$/,'Marked as resolved.'],[/^Request closed\.$/,'Request closed.']];
function noteText(n){for(const[rx,k] of NOTE_RX){const m=n.match(rx);if(m)return t(k,{x:m[1]})}return n}
/* ---------- icons ---------- */
const P={home:'<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
hospital:'<path d="M4 21V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16M2 21h20"/><path d="M12 8v6M9 11h6"/>',camp:'<path d="M3 20L12 4l9 16z"/><path d="M12 20v-6M8.5 20l3.5-6 3.5 6"/>',
users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',doc:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/>',
heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',hand:'<path d="M18 11V7.5a1.5 1.5 0 0 0-3 0V11M15 10.5V5.5a1.5 1.5 0 0 0-3 0v5M12 10V4.5a1.5 1.5 0 0 0-3 0V11M9 11V7.5a1.5 1.5 0 0 0-3 0V15a6 6 0 0 0 6 6h1a5 5 0 0 0 5-5v-5"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01"/>',bell:'<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',inbox:'<path d="M3 13l3-8h12l3 8v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1 3h6l1-3h5"/>',
cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',pill:'<path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7z"/><path d="M7 7l7 7"/>',
access:'<circle cx="12" cy="4.5" r="1.8"/><path d="M12 7v6h5l2 5M12 9H8M9.5 12.8A5 5 0 1 0 15 19"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
food:'<path d="M5 3v8a2.5 2.5 0 0 0 5 0V3M7.5 3v18M18 3c-2 0-3 3-3 7h3v11"/>',gift:'<rect x="3" y="8" width="18" height="5"/><path d="M5 13v8h14v-8M12 8v13M12 8C10 4 7 4 7 6s3 2 5 2zm0 0c2-4 5-4 5-2s-3 2-5 2z"/>',
chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',sliders:'<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
logout:'<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>',menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',chev:'<path d="M6 9l6 6 6-6"/>',
check:'<path d="M5 12l5 5 9-10"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',pin:'<path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
phone:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/>',globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
plus:'<path d="M12 5v14M5 12h14"/>',share:'<path d="M5 12h12M13 6l6 6-6 6"/>',book:'<path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2z"/>',
alert:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',collapse:'<path d="M15 6l-6 6 6 6"/>',expand:'<path d="M9 6l6 6-6 6"/>',family:'<circle cx="8" cy="7" r="3"/><circle cx="17" cy="9" r="2.3"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0M13.5 20a4 4 0 0 1 8 0"/>',
senior:'<circle cx="11" cy="4.5" r="2"/><path d="M11 7v6l-3 8M11 13l3 3v5M8 10l3-2 3 2M17 11v10"/>',megaphone:'<path d="M3 10v4l13 5V5zM16 8a4 4 0 0 1 0 8M7 15l1.5 5h3L10 16"/>',
aa:'<path d="M3 19L8 5l5 14M4.8 14h6.4M14 19l3.5-9 3.5 9M15.2 16h4.6"/>',eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'};
const ic=(n,s=18)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;
const LOGO=(s=40)=>`<svg width="${s}" height="${s}" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="6" fill="#102A43"/><path d="M16 8h8v8h8v8h-8v8h-8v-8H8v-8h8z" fill="#fff"/><path d="M8 34h24" stroke="#0F766E" stroke-width="3"/><circle cx="20" cy="20" r="2.6" fill="#175CD3"/></svg>`;

/* ---------- reference data ---------- */
const STATES=['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
const CAMP_CATS=['General Health Check-up','Eye Care','Diabetes & Hypertension Screening','Maternal & Child Health','Dental Care','Senior Citizen Health','Women’s Health','Vaccination'];
const SCHEME_CATS=['Healthcare','Preventive health and wellness','Maternal and child health','Senior citizen welfare','Disability-related support','Financial assistance','Social welfare'];
const ORG_CATS=['Healthcare','Medicine assistance','Food support','Senior citizen care','Disability assistance','Child welfare','Women and family support','Rehabilitation','Mental-health support resources','Blood donation coordination','Mobility aids','Community outreach'];
const REQ_CATS=[['Medicine assistance','pill','Help with the cost of prescribed medicines'],['Mobility aids','access','Wheelchairs, walkers and other aids'],['Senior citizen care','senior','Home visits and support for older people'],['Food support','food','Meals and ration support for families'],['Disability assistance','access','Rehabilitation and disability support'],['Child welfare','family','Support for mothers and young children'],['Medical equipment donation enquiry','gift','Offer or ask about medical equipment'],['Blood donation information','drop','Find blood donation information'],['Other healthcare support','hospital','Anything else related to health']];
const LANGS=['English','Hindi','Marathi','Tamil','Bengali','Telugu'];
const ADMINS=[{email:'admin@example.com',password:'admin1234',name:'Demo Administrator',role:'System administrator'}];
const SHARE_FIELDS=[['name','Your name'],['contact','Contact details'],['district','District'],['age','Age'],['household','Household member details']];
const CONTACT_PREFS=['Phone call','SMS','Email','In-app messages only'];

/* ---------- lookups ---------- */
const campById=id=>state.camps.find(c=>c.id===id);
const schemeById=id=>state.schemes.find(s=>s.id===id);
const orgById=id=>state.orgs.find(o=>o.id===id);
const progById=id=>state.programs.find(p=>p.id===id);
const oppById=id=>state.opps.find(o=>o.id===id);
const reqById=id=>state.requests.find(r=>r.id===id);
const me=()=>state.user&&state.user.type==='citizen'?state.citizens.find(c=>c.id===state.user.id):null;
const myOrg=()=>state.user&&state.user.type==='org'?orgById(state.user.orgId):null;
const citizenById=id=>state.citizens.find(c=>c.id===id);
function log(actor,action,detail){state.audit.unshift({at:stamp(),actor,action,detail})}
function notify(citizenId,k,p){state.notices.push({citizenId,at:off(0),k,p:p||{},read:false})}

/* ---------- camps (kept from v1) ---------- */
const seatsTaken=id=>state.regs.filter(r=>r.campId===id&&['confirmed','pending','attended','no-show'].includes(r.status)).length;
const seatsLeft=c=>c.capacity?Math.max(0,c.capacity-seatsTaken(c.id)):null;
function campState(c){
  if(c.status==='cancelled')return'cancelled';if(c.status==='draft')return'draft';
  if(pd(c.date)<TODAY)return'completed';if(pd(c.regOpen)>TODAY)return'soon';if(pd(c.deadline)<TODAY)return'closed';
  if(c.capacity&&seatsTaken(c.id)>=c.capacity)return'full';return'open';
}
const isPublic=c=>c.status!=='draft';
const CS_B={open:['Registration open','b-success','✓'],soon:['Opens soon','b-info','◷'],closed:['Registration closed','b-muted','✕'],full:['Fully booked','b-warning','●'],completed:['Completed','b-muted','✔'],cancelled:['Cancelled','b-error','⊘'],draft:['Draft','b-warning','✎']};
function campBadge(c){const st=campState(c);const[l,cls,i]=CS_B[st];return `<span class="badge ${cls}"><span aria-hidden="true">${i}</span>${st==='soon'?tt('Opens {d}',{d:fmtS(c.regOpen)}):tt(l)}</span>`}
const REG_B={confirmed:['Confirmed','b-success','✓'],pending:['Pending approval','b-warning','◷'],cancelled:['Cancelled','b-muted','⊘'],attended:['Attended','b-teal','✔'],'no-show':['No-show','b-warning','✕']};
const regBadge=s=>{const[l,c,i]=REG_B[s];return `<span class="badge ${c}"><span aria-hidden="true">${i}</span>${tt(l)}</span>`};
function availText(c){const st=campState(c);if(!c.capacity)return t('No capacity limit');if(st==='cancelled'||st==='completed')return'—';return t('{n} of {cap} slots available',{n:seatsLeft(c),cap:c.capacity})}
function ageOk(p,c){if(p.age==null||p.age==='')return true;if(c.minAge!=null&&p.age<c.minAge)return false;if(c.maxAge!=null&&p.age>c.maxAge)return false;return true}
function validateRegistration(z,c){
  if(!z)return t('Please log in to register.');if(!z.verified)return t('Verify your account before registering for a camp.');
  const st=campState(c);
  if(st==='draft'||st==='cancelled')return t('This camp is not accepting registrations because it has been cancelled.');
  if(st==='completed')return t('This camp has already taken place.');
  if(st==='soon')return t('Registration opens on {d}.',{d:fmtD(c.regOpen)});
  if(st==='closed')return t('The registration deadline ({d}) has passed.',{d:fmtD(c.deadline)});
  if(st==='full')return t('All slots for this camp are booked.');
  if(state.regs.some(r=>r.campId===c.id&&r.citizenId===z.id&&['confirmed','pending'].includes(r.status)))return t('You already have an active registration for this camp.');
  if((c.minAge!=null||c.maxAge!=null)&&(z.age==null||z.age===''))return t('This camp has an age requirement. Add your age to your profile, then try again.');
  if(!ageOk(z,c))return t('Your profile age does not meet this camp’s age requirement.');
  return null;
}
function serverRegister(cid,campId){
  const z=citizenById(cid),c=campById(campId);if(!c)return{ok:false,error:t('This camp could not be found.')};
  const e=validateRegistration(z,c);if(e)return{ok:false,error:e};
  const r={ref:mkRef(state),campId,citizenId:cid,status:'confirmed',createdAt:off(0),updatedAt:off(0)};state.regs.push(r);
  notify(cid,'Your registration for the {camp} is confirmed. Reference {ref}.',{camp:c.title,ref:r.ref});
  log(z.name+' (citizen)','Registered for camp',`${c.title} (${c.id}), ref ${r.ref}`);return{ok:true,reg:r};
}
const canCancelReg=(r,c)=>r.status==='confirmed'&&daysUntil(c.date)>=1&&c.status!=='cancelled';

/* ---------- requests & organizations ---------- */
const RS={draft:['Draft','b-muted','You have not submitted this request yet.'],review:['Under review','b-info','ChikitsaSeva is reviewing your request to find a suitable organization.'],
  referred:['Referred to organization','b-info','Sent to an organization. They have not yet accepted it.'],info:['Additional information required','b-warning','The organization needs more details from you before it can decide.'],
  accepted:['Accepted','b-success','An organization has agreed to help.'],progress:['In progress','b-teal','Assistance is under way.'],resolved:['Resolved','b-success','The organization reports that this request is resolved.'],
  closed:['Closed','b-muted','This request is closed.'],withdrawn:['Withdrawn','b-muted','You withdrew this request.']};
const reqBadge=s=>`<span class="badge ${RS[s][1]}">${tt(RS[s][0])}</span>`;
const OPEN_REQ=['review','referred','info','accepted','progress'];
const VER={unverified:['Unverified listing','b-muted','Listed by the organization. ChikitsaSeva has not checked these details.'],pending:['Verification pending','b-warning','The organization has applied for verification. Review is not complete.'],
  reviewed:['Documents reviewed','b-info','ChikitsaSeva has reviewed submitted documents. Full verification is not complete.'],verified:['Verified by ChikitsaSeva','b-success','Checked against ChikitsaSeva’s published verification process. This is not a government approval.'],
  expired:['Verification expired','b-error','Verification has lapsed and must be renewed.'],suspended:['Verification suspended','b-error','Verification has been suspended pending review.']};
const verBadge=o=>{const[l,c]=VER[o.verification];return `<span class="badge ${c}">${o.verification==='verified'?ic('shield',13):''}${tt(l)}</span>`};
const AP_B={requested:['Request sent – not confirmed','b-warning'],confirmed:['Confirmed by provider','b-success'],declined:['Declined by provider','b-muted'],cancelled:['Cancelled','b-muted']};
const apBadge=s=>`<span class="badge ${AP_B[s][1]}">${tt(AP_B[s][0])}</span>`;
const VA_B={applied:['Application sent','b-info'],accepted:['Accepted','b-success'],declined:['Not selected','b-muted'],withdrawn:['Withdrawn','b-muted'],participated:['Participation recorded','b-teal']};
const vaBadge=a=>{const k=a.hours!=null?'participated':a.status;return `<span class="badge ${VA_B[k][1]}">${tt(VA_B[k][0])}</span>`};
const initials=n=>n.split(/\s+/).filter(w=>/^[A-Z]/.test(w)).slice(0,2).map(w=>w[0]).join('');
const avatar=o=>`<span class="avatar" style="background:${o.color}" aria-hidden="true">${esc(initials(o.name))}</span>`;
const publicOrgs=()=>state.orgs.filter(o=>o.verification!=='suspended');
const memberById=(z,id)=>(z.members||[]).find(m=>m.id===id);

/* ---------- explainable matching ---------- */
function matches(z,opts={}){
  const out=[];const prof=Object.assign({},z,opts.member?{age:opts.member.age}:{});
  const city=(prof.district||prof.city||'').toLowerCase(),st=prof.state;
  const near=(c,s)=>city&&String(c).toLowerCase()===city?'Available in your selected district.':(st&&s===st?'Available in your state.':null);
  state.camps.forEach(c=>{const s=campState(c);if(!['open','soon'].includes(s))return;if(!ageOk(prof,c))return;
    const why=[];const n=near(c.city,c.state);if(n)why.push(n);if((z.interests||[]).includes(c.category))why.push('Matches your selected healthcare interests.');
    if(c.minAge!=null&&prof.age!=null&&prof.age>=c.minAge&&c.minAge>=30)why.push('This service may be relevant to your age group.');
    if(s==='open')why.push('Registration is currently open.');
    if(why.length<2||(!n&&!(z.interests||[]).includes(c.category)))return;
    if(state.regs.some(r=>r.campId===c.id&&r.citizenId===z.id&&r.status==='confirmed'))return;
    out.push({kind:'camp',id:c.id,score:why.length+(n?2:0),why,date:c.date})});
  state.programs.forEach(p=>{if(p.status==='closed')return;const o=orgById(p.orgId);if(!o||['suspended','expired'].includes(o.verification))return;
    const why=[];const n=near(p.city,o.state);if(n)why.push(n);if((z.supportInterests||[]).includes(p.type))why.push('Matches your selected support needs.');
    if(p.type==='Senior citizen care'&&prof.age>=60)why.push('This service may be relevant to your age group.');
    if(!n||why.length<2)return;out.push({kind:'prog',id:p.id,score:why.length+1,why})});
  state.schemes.filter(s=>s.status==='active').forEach(s=>{const why=[];const ak=prof.age!=null;const inR=ak&&(s.minAge==null||prof.age>=s.minAge)&&(s.maxAge==null||prof.age<=s.maxAge);
    if(ak&&!inR)return;const i=(s.interests||[]).find(x=>(z.interests||[]).includes(x));if(i)why.push('Matches your selected healthcare interests.');
    if(ak&&s.minAge!=null&&s.minAge>=60&&inR)why.push('This service may be relevant to your age group.');
    if(s.id==='pmjay'&&ak&&prof.age>=70)why.push('This service may be relevant to your age group.');
    if(s.openToAll&&!why.length)why.push('Open to all citizens. Check official eligibility.');
    if(!why.length)return;out.push({kind:'scheme',id:s.id,score:why.length,why})});
  if(z.volunteer){state.opps.forEach(v=>{if(daysUntil(v.deadline)<0)return;const why=[];const n=near(v.city,orgById(v.orgId).state);if(n)why.push(n);
    if(v.skills.some(sk=>(z.volunteer.skills||[]).some(x=>sk.toLowerCase().includes(x.toLowerCase()))))why.push('Matches your volunteer skills.');
    if(!why.length)return;out.push({kind:'opp',id:v.id,score:why.length,why})})}
  return out.sort((a,b)=>b.score-a.score);
}
function itemInfo(kind,id){
  if(kind==='camp'){const c=campById(id);return c&&{title:t(c.title),sub:`${fmtS(c.date)} · ${t(c.city)}`,href:'camp-'+id,icon:'camp',type:t('Medical camp')}}
  if(kind==='prog'){const p=progById(id);const o=p&&orgById(p.orgId);return p&&{title:t(p.title),sub:`${o.name} · ${t(p.city)}`,href:'org-'+p.orgId,icon:'users',type:t('NGO programme')}}
  if(kind==='scheme'){const s=schemeById(id);return s&&{title:s.name,sub:t(s.category),href:'scheme-'+id,icon:'doc',type:t('Government scheme')}}
  if(kind==='org'){const o=orgById(id);return o&&{title:o.name,sub:`${t(o.type)} · ${t(o.city)}`,href:'org-'+id,icon:o.kind==='ngo'?'users':'hospital',type:o.kind==='ngo'?t('Organization'):t('Healthcare provider')}}
  if(kind==='opp'){const v=oppById(id);return v&&{title:t(v.title),sub:`${orgById(v.orgId).name} · ${fmtS(v.date)}`,href:'volunteer',icon:'hand',type:t('Volunteer opportunity')}}
  return null;
}
const isSaved=(k,id)=>{const z=me();return!!z&&z.saved.includes(k+':'+id)};
const saveBtn=(k,id,sm=true)=>{const s=isSaved(k,id);return `<button class="btn ${s?'teal':'sec'} ${sm?'sm':''}" data-act="save" data-arg="${k}:${id}" aria-pressed="${s}">${ic('bookmark',14)}${s?tt('Saved'):tt('Save')}</button>`};

/* ---------- UI primitives ---------- */
function toast(msg,kind='info'){const el=document.createElement('div');el.className='toast '+kind;el.textContent=msg;$('#toasts').appendChild(el);setTimeout(()=>el.remove(),5200)}
function announce(msg){const a=$('#sr-alert');a.textContent='';setTimeout(()=>a.textContent=msg,50)}
let lastFocus=null,pendingConfirm=null;
function openModal(html,{wide=false,label='Dialog'}={}){
  lastFocus=document.activeElement;
  $('#modal-root').innerHTML=`<div class="modal-back" data-act="modalBack"><div class="modal${wide?' wide':''}" role="dialog" aria-modal="true" aria-label="${esc(label)}" tabindex="-1">${html}</div></div>`;
  const m=$('.modal');const f=m.querySelector('input:not([type=hidden]):not([type=radio]),select,textarea,input[type=radio]');(f||m).focus();
}
function closeModal(){if(!$('#modal-root').innerHTML)return;$('#modal-root').innerHTML='';if(lastFocus&&document.contains(lastFocus))lastFocus.focus()}
function confirmDialog({title,body,confirm,danger=false,onYes}){
  openModal(`<h2>${esc(title)}</h2><div>${body}</div><div class="m-actions"><button class="btn sec" data-act="close">${tt('Go back')}</button><button class="btn ${danger?'danger':''}" data-act="confirmYes">${esc(confirm)}</button></div>`,{label:title});
  pendingConfirm=onYes;
}
const fld=(name,label,input,hint='',cls='')=>`<div class="field ${cls}">${label?`<label for="f-${name}">${label}</label>`:''}${input}${hint?`<p class="hint">${hint}</p>`:''}<p class="err" id="err-${name}" hidden></p></div>`;
const inp=(name,val='',type='text',extra='')=>`<input id="f-${name}" name="${name}" type="${type}" value="${esc(val??'')}" ${extra}>`;
const sel=(name,opts,val='',extra='',blank='')=>`<select id="f-${name}" name="${name}" ${extra}>${blank!==null?`<option value="">${esc(blank||t('Select'))}</option>`:''}${opts.map(o=>{const[v,l]=Array.isArray(o)?o:[o,o];return `<option value="${esc(v)}" ${String(v)===String(val??'')?'selected':''}>${esc(l)}</option>`}).join('')}</select>`;
const ta=(name,val='',extra='')=>`<textarea id="f-${name}" name="${name}" ${extra}>${esc(val)}</textarea>`;
function setErrors(form,errs){
  $$('.err',form).forEach(e=>{e.hidden=true;e.textContent=''});$$('[aria-invalid]',form).forEach(e=>e.removeAttribute('aria-invalid'));
  const keys=Object.keys(errs);
  keys.forEach(k=>{const e=$('#err-'+k,form);const i=form.querySelector(`[name="${k}"]`);if(e){e.hidden=false;e.textContent=errs[k]}if(i){i.setAttribute('aria-invalid','true');i.setAttribute('aria-errormessage','err-'+k)}});
  if(keys.length){const i=form.querySelector(`[name="${keys[0]}"]`);if(i)i.focus();announce(errs[keys[0]])}
  return!keys.length;
}
const crumbs=l=>`<nav class="crumbs" aria-label="${tt('Breadcrumb')}"><ol>${l.map((c,i)=>i===l.length-1?`<li aria-current="page">${esc(c[0])}</li>`:`<li><a href="#${c[1]}">${esc(c[0])}</a></li>`).join('')}</ol></nav>`;
const phead=(h,p='',actions='')=>`<div class="phead"><div><h1 tabindex="-1">${h}</h1>${p?`<p>${p}</p>`:''}</div>${actions?`<div class="row">${actions}</div>`:''}</div>`;
const empty=(icon,title,text,action='')=>`<div class="empty"><span class="em-ic">${ic(icon,22)}</span><h3>${title}</h3><p>${text}</p>${action}</div>`;
const mask=c=>!c?'':c.includes('@')?c.replace(/^(.).*(@.*)$/,'$1•••$2'):c.replace(/^(\d{2})\d+(\d{2})$/,'$1••••••$2');
const tabs=(key,list,cur)=>`<div class="tabs" role="tablist">${list.map(([k,l,n])=>`<button role="tab" aria-selected="${cur===k}" data-act="tab" data-arg="${key}|${k}">${l}${n!=null?`<span class="cnt">${n}</span>`:''}</button>`).join('')}</div>`;
const curTab=(key,def)=>state.tabs[key]||def;

/* ---------- public shell ---------- */
const NAV=[['home','Home'],['services','Healthcare Services',[['services','hospital','Hospitals, clinics and providers','Search verified healthcare providers'],['camps','camp','Medical camps','Free check-up and screening camps'],['resources','book','Health resources','Awareness material and official links'],['blood','drop','Blood donation','Drives and donor guidance'],['emergency','phone','Emergency numbers','National helplines and ambulance']]],
  ['camps','Camps'],['ngos','NGOs & Partners'],['schemes','Government Schemes'],['community','Community Support',[['community','gift','Programmes and donations','Assistance programmes and verified campaigns'],['ngos','users','NGO directory','Find organizations by service'],['equipment','gift','Donate medical equipment','Offer aids you no longer need'],['join','plus','Register your organization','Publish services on ChikitsaSeva']]],
  ['volunteer','Volunteer'],['about','About'],['help','Help']];
function publicHeader(base){
  const u=state.user;const cur=b=>({blood:'services',equipment:'community',camp:'camps',scheme:'schemes',elig:'schemes',eligibility:'schemes',org:'ngos',emergency:'services',resources:'services',join:'community'}[b]||b);
  const portal=u?(u.type==='citizen'?['c-home','My citizen portal']:u.type==='org'?['o-home','Organization workspace']:['a-home','Admin workspace']):null;
  return `<header class="site-h"><div class="wrap">
    <button class="iconbtn menu-btn" data-act="drawer" aria-label="${tt('Open menu')}">${ic('menu')}</button>
    <a class="brand" href="#home" aria-label="ChikitsaSeva ${tt('Home')}">${LOGO(40)}<span><span class="brand-n">ChikitsaSeva</span><br><span class="brand-t">${tt('Healthcare, Welfare & Community Support.')}</span></span></a>
    <form class="gsearch" data-form="gsearch" role="search"><label class="sr-only" for="gq">${tt('Search services or organizations')}</label><input id="gq" name="q" type="search" placeholder="${tt('Search services, camps, organizations')}" value="${esc(state.search.q)}"><button class="btn" type="submit" aria-label="${tt('Search')}">${ic('search',16)}</button></form>
    <div class="h-actions">${portal?`<a class="btn" href="#${portal[0]}">${ic('user',16)}<span class="hide-m">${tt(portal[1])}</span></a>`:`<a class="btn sec hide-m" href="#login">${tt('Log in')}</a><a class="btn" href="#register">${ic('user',16)}${tt('Citizen portal')}</a>`}</div>
  </div></header>
  <nav class="mainnav" aria-label="${tt('Main')}"><div class="wrap"><ul>${NAV.map(([k,l,sub],i)=>sub?`<li><button class="dd" data-act="dd" data-arg="${i}" aria-expanded="false" aria-controls="dd-${i}" ${cur(base)===k?'aria-current="page"':''}>${tt(l)}${ic('chev',14)}</button><div class="ddm" id="dd-${i}">${sub.map(([h,icn,a,b])=>`<a href="#${h}">${ic(icn)}<span>${tt(a)}<small>${tt(b)}</small></span></a>`).join('')}</div></li>`:`<li><a href="#${k}" ${cur(base)===k?'aria-current="page"':''}>${tt(l)}</a></li>`).join('')}</ul></div></nav>
  <div class="demo" role="note"><div class="wrap"><span><strong>${tt('Prototype.')}</strong> ${tt('All camps, organizations, people and requests are fictional sample data. Scheme summaries are unverified. Changes are kept until you reload.')}</span><button class="btn sec sm" data-act="reset">${tt('Reset sample data')}</button></div></div>`;
}
function drawerHtml(){
  const u=state.user;
  return `<div class="scrim" data-act="closeDrawer"></div><nav class="drawer" aria-label="${tt('Menu')}"><div class="between" style="margin-bottom:.5rem"><b>ChikitsaSeva</b><button class="iconbtn" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.3)" data-act="closeDrawer" aria-label="${tt('Close menu')}">${ic('x')}</button></div>
  ${NAV.map(([k,l,sub])=>sub?`<h2>${tt(l)}</h2>${sub.map(([h,icn,a])=>`<a href="#${h}">${ic(icn)}${tt(a)}</a>`).join('')}`:`<a href="#${k}">${tt(l)}</a>`).join('')}
  <h2>${tt('Account')}</h2>${u?`<a href="#${u.type==='citizen'?'c-home':u.type==='org'?'o-home':'a-home'}">${ic('user')}${tt('My workspace')}</a>`:`<a href="#login">${ic('user')}${tt('Log in')}</a><a href="#register">${ic('plus')}${tt('Create account')}</a>`}</nav>`;
}
function publicFooter(){
  return `<footer class="site-f"><div class="wrap"><div class="fgrid5">
    <div><h2>ChikitsaSeva</h2><p>${tt('An independent public-service initiative connecting citizens with healthcare, welfare schemes and community support. It is not an official government website.')}</p></div>
    <div><h2>${tt('Services')}</h2><ul><li><a href="#services">${tt('Service directory')}</a></li><li><a href="#camps">${tt('Medical camps')}</a></li><li><a href="#resources">${tt('Health resources')}</a></li><li><a href="#blood">${tt('Blood donation')}</a></li><li><a href="#emergency">${tt('Emergency numbers')}</a></li></ul></div>
    <div><h2>${tt('Community')}</h2><ul><li><a href="#ngos">${tt('NGO directory')}</a></li><li><a href="#join">${tt('NGO participation')}</a></li><li><a href="#volunteer">${tt('Volunteer')}</a></li><li><a href="#community">${tt('Programmes and donations')}</a></li><li><a href="#equipment">${tt('Donate medical equipment')}</a></li></ul></div>
    <div><h2>${tt('Government schemes')}</h2><ul><li><a href="#schemes">${tt('Scheme resources')}</a></li><li><a href="#eligibility">${tt('Check eligibility')}</a></li></ul></div>
    <div><h2>${tt('About and policies')}</h2><ul><li><a href="#about">${tt('About')}</a></li><li><a href="#contact">${tt('Contact')}</a></li><li><a href="#accessibility">${tt('Accessibility')}</a></li><li><a href="#privacy">${tt('Privacy')}</a></li><li><a href="#terms">${tt('Terms')}</a></li><li><a href="#dataprotection">${tt('Data protection')}</a></li></ul></div>
  </div><div class="fbot"><span>© 2026 ChikitsaSeva · ${tt('Independent public-service initiative')}</span><span>${tt('Last updated: {d}',{d:LAST_UPDATED})}</span></div></div></footer>`;
}
const LANG_OPTS=[['en','English'],['hi','हिंदी'],['mr','मराठी']];
const langSeg=(id='')=>`<div class="seg" role="group" aria-label="${tt('Language')}" ${id?`id="${id}"`:''}>${LANG_OPTS.map(([v,l])=>`<button data-act="lang" data-arg="${v}" aria-pressed="${ui.lang===v}" lang="${v}">${l}</button>`).join('')}</div>`;
function fabHtml(open){
  return `<button class="fab" data-act="fab" aria-expanded="${!!open}" aria-controls="fab-panel">${ic('aa',16)}${tt('Language & display')}</button>${open?`<div class="fab-panel" id="fab-panel" role="dialog" aria-label="${tt('Language & display')}">${displayControls()}</div>`:''}`;
}
const displayControls=()=>`<h2>${tt('Language & display')}</h2>
  <div class="grp"><p class="label">${tt('Language')}</p>${langSeg()}</div>
  <div class="grp"><p class="label">${tt('Text size')}</p><div class="seg" role="group" aria-label="${tt('Text size')}">${[[14,'A−'],[15,'A'],[17,'A+'],[19,'A++']].map(([v,l])=>`<button data-act="fs" data-arg="${v}" aria-pressed="${ui.fs===v}">${l}</button>`).join('')}</div></div>
  <div class="grp"><p class="label">${tt('Theme')}</p><div class="seg" role="group" aria-label="${tt('Theme')}">${[['system','Automatic'],['light','Light'],['dark','Dark']].map(([v,l])=>`<button data-act="theme" data-arg="${v}" aria-pressed="${ui.theme===v}">${tt(l)}</button>`).join('')}</div></div>
  <a class="small" href="#accessibility">${tt('Accessibility statement')}</a>`;

/* ---------- app shell ---------- */
function sideItems(role){
  if(role==='citizen'){const z=me();const unread=state.notices.filter(n=>n.citizenId===z.id&&!n.read).length;const info=state.requests.filter(r=>r.citizenId===z.id&&r.status==='info').length;
    return[['Overview',[['c-home','home','Dashboard'],['c-find','search','Find services']]],['My services',[['c-requests','inbox','Assistance requests',info||null],['c-regs','camp','Camp registrations'],['c-apps','cal','Appointments & applications'],['c-resources','gift','Resource support'],['c-saved','bookmark','Saved services']]],['Community',[['c-volunteer','hand','Volunteering']]],['Account',[['c-notifs','bell','Notifications',unread||null],['c-household','family','Family & household'],['c-profile','sliders','Profile & preferences'],['c-privacy','shield','Privacy & consent'],['c-grievances','alert','Feedback & grievances']]]]}
  if(role==='org'){const o=myOrg();const nr=state.requests.filter(r=>r.orgId===o.id&&r.status==='referred').length+state.appts.filter(a=>a.orgId===o.id&&a.status==='requested').length;
    return[['Workspace',[['o-home','home','Overview'],['o-profile','users','Organization profile'],['o-programs','doc','Services & programmes']]],['Casework',[['o-requests','inbox','Assistance requests',nr||null],['o-referrals','share','Referrals'],['o-offers','gift','Equipment offers',state.offers.filter(x=>x.status==='available').length||null]]],['Activities',[['o-volunteers','hand','Volunteers'],['o-camps','camp','Events & camps'],['o-donations','gift','Donations']]],['Management',[['o-reports','chart','Reports'],['o-team','shield','Team & permissions']]]]}
  const q=state.requests.filter(r=>r.status==='review').length,ov=state.orgs.filter(o=>o.verification==='pending').length;
  return[['Platform',[['a-home','home','Overview'],['a-requests','inbox','Request routing',q||null],['a-orgs','shield','Organization verification',ov||null],['a-grievances','alert','Grievances',state.grievances.filter(g=>g.status==='open').length||null],['a-announce','megaphone','Announcements']]],['Healthcare',[['a-camps','camp','Camps'],['a-regs','check','Registrations & attendance'],['a-schemes','doc','Schemes']]],['Records',[['a-citizens','users','Citizens'],['a-reports','chart','Reports'],['a-audit','book','Audit log']]]];
}
function appShell(role,route,P){
  const loc=role==='citizen';const L=s=>loc?tt(s):esc(s);
  const who=role==='citizen'?{n:me().name,s:t('Citizen')}:role==='org'?{n:state.orgUsers[0].name,s:myOrg().name}:{n:ADMINS[0].name,s:ADMINS[0].role};
  const items=sideItems(role);const label={citizen:'Citizen portal',org:'Organization workspace',admin:'Admin workspace'}[role];
  const unread=role==='citizen'?state.notices.filter(n=>n.citizenId===me().id&&!n.read).length:0;
  return `<div class="app ${state.collapsed?'collapsed':''}" id="app-shell">
  <aside class="side" aria-label="${L('Workspace navigation')}">
    <a class="side-brand" href="#home">${LOGO(32)}<span class="hide-c"><b>ChikitsaSeva</b><small>${L(label)}</small></span></a>
    <nav class="side-nav">${items.map(([g,list])=>`<h3 class="hide-c">${L(g)}</h3>${list.map(([h,icn,l,n])=>`<a href="#${h}" ${route===h||(P.navKey===h)?'aria-current="page"':''} title="${L(l)}">${ic(icn)}<span class="hide-c">${L(l)}</span>${n?`<span class="cnt" aria-label="${n} ${L('pending')}">${n}</span>`:''}</a>`).join('')}`).join('')}</nav>
    <div class="side-foot">
      ${loc?`<div class="hide-c"><p class="lbl">${tt('Language')}</p>${langSeg()}</div>`:''}
      <button class="side-btn" data-act="displayModal" style="margin-top:.4rem">${ic('aa',16)}<span class="hide-c">${L('Display settings')}</span></button>
      <a class="side-btn" href="#home">${ic('globe',16)}<span class="hide-c">${L('Public website')}</span></a>
      <button class="side-btn desk-only" data-act="collapse" aria-label="${state.collapsed?L('Expand sidebar'):L('Collapse sidebar')}">${ic(state.collapsed?'expand':'collapse',16)}<span class="hide-c">${L('Collapse sidebar')}</span></button>
      <div class="side-user"><span class="avatar" style="background:#1E4A75;width:2rem;height:2rem;font-size:.75rem">${esc(initials(who.n))}</span><span class="hide-c" style="min-width:0;flex:1"><b>${esc(who.n)}</b><small>${esc(who.s)}</small></span><button class="side-btn hide-c" style="width:auto" data-act="logout" title="${L('Log out')}" aria-label="${L('Log out')}">${ic('logout',16)}</button></div>
    </div>
  </aside>
  <div class="app-main">
    <header class="topbar">
      <button class="iconbtn mob-only" data-act="navOpen" aria-label="${L('Open navigation')}">${ic('menu')}</button>
      <div class="tt"><b>${esc(P.title)}</b>${P.sub?`<small>${esc(P.sub)}</small>`:''}</div>
      ${loc?`<form data-form="appsearch" role="search"><label class="sr-only" for="aq">${tt('Search services')}</label><input id="aq" name="q" type="search" placeholder="${tt('Search camps, organizations, schemes')}"><button class="btn" type="submit" aria-label="${tt('Search')}">${ic('search',16)}</button></form>`:'<span style="margin-left:auto"></span>'}
      ${loc?`<div class="rel"><button class="iconbtn" data-act="notifPop" aria-expanded="false" aria-label="${tt('Notifications')}${unread?', '+unread+' '+tt('unread'):''}">${ic('bell')}${unread?`<span class="dot">${unread}</span>`:''}</button><div id="notif-pop"></div></div>`:''}
      <div class="rel"><button class="iconbtn" data-act="profilePop" aria-expanded="false" aria-label="${L('Account menu')}">${ic('user')}</button><div id="profile-pop"></div></div>
    </header>
    <div class="demo" role="note"><div class="wrap" style="max-width:none"><span>${L('Prototype with fictional sample data. Changes are kept until you reload.')}</span><button class="btn sec sm" data-act="reset">${L('Reset sample data')}</button></div></div>
    <main id="main" tabindex="-1" class="app-content">${P.crumbs?crumbs(P.crumbs):''}${P.html}</main>
  </div></div>`;
}
