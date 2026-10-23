/* ---------- shared item renderers ---------- */
function campRow(c,why){
  return `<li>${datebox(c.date)}<div class="body"><a class="t" href="#camp-${c.id}">${tt(c.title)}</a><div class="meta">${ic('pin',13)} ${esc(c.venue)}, ${tt(c.city)} · ${fmtT(c.start)}–${fmtT(c.end)}</div>
    ${why?`<div>${why.map(w=>`<span class="reason">${ic('check',12)}${tt(w)}</span>`).join('')}</div>`:''}</div><div class="side">${campBadge(c)}<div class="xs muted" style="margin-top:.3rem">${c.capacity?esc(availText(c)):''}</div></div></li>`;
}
function campCard(c){
  return `<article class="card"><div class="between"><span class="eyebrow">${tt(c.category)}</span>${campBadge(c)}</div>
    <h3 style="margin:.4rem 0 .25rem"><a href="#camp-${c.id}">${tt(c.title)}</a></h3><p class="small muted">${tt(c.short)}</p>
    <dl class="kv" style="grid-template-columns:max-content 1fr;font-size:.8125rem;gap:.25rem .8rem"><dt>${tt('Date')}</dt><dd>${fmtD(c.date)}, ${fmtT(c.start)}</dd><dt>${tt('Venue')}</dt><dd>${esc(c.venue)}, ${tt(c.city)}</dd><dt>${tt('Register by')}</dt><dd>${fmtS(c.deadline)}</dd>${c.capacity?`<dt>${tt('Availability')}</dt><dd>${esc(availText(c))}</dd>`:''}${c.orgId?`<dt>${tt('Organizer')}</dt><dd><a href="#org-${c.orgId}">${esc(c.organizer)}</a></dd>`:''}</dl>
    <div class="foot"><span class="xs muted">${tt(c.fee)}</span><a class="btn sec sm" href="#camp-${c.id}">${tt('View details')}</a></div></article>`;
}
function orgRow(o){
  return `<li>${avatar(o)}<div class="body"><a class="t" href="#org-${o.id}">${esc(o.name)}</a><div class="meta">${tt(o.type)} · ${ic('pin',13)} ${tt(o.city)}, ${tt(o.state)}</div>
    <div style="margin-top:.3rem">${o.categories.slice(0,3).map(c=>`<span class="badge b-muted" style="margin:0 .25rem .25rem 0">${tt(c)}</span>`).join('')}</div></div><div class="side">${verBadge(o)}</div></li>`;
}
function schemeRow(s,why){
  return `<li><span class="lead">${ic('doc')}</span><div class="body"><a class="t" href="#scheme-${s.id}">${esc(s.name)}</a><div class="meta">${esc(s.authority)}</div>
  ${why?`<div>${why.map(w=>`<span class="reason">${ic('check',12)}${tt(w)}</span>`).join('')}</div>`:''}</div><div class="side"><span class="badge b-warning">${tt('Verification pending')}</span></div></li>`;
}
function oppRow(v){
  const o=orgById(v.orgId);const taken=state.vapps.filter(a=>a.oppId===v.id&&a.status==='accepted').length;
  return `<li>${datebox(v.date)}<div class="body"><b>${tt(v.title)}</b><div class="meta">${esc(o.name)} · ${tt(v.activity)} · ${tt(v.city)} · ${fmtT(v.start)}–${fmtT(v.end)}</div>
    <div class="small" style="margin-top:.25rem">${tt(v.resp)}</div><div class="xs muted" style="margin-top:.2rem">${tt('Skills')}: ${v.skills.map(s=>tt(s)).join(', ')} · ${tt('Apply by {d}',{d:fmtS(v.deadline)})}</div></div>
    <div class="side"><div class="xs muted">${tt('{n} of {m} places filled',{n:taken,m:v.positions})}</div><button class="btn sm" style="margin-top:.4rem" data-act="applyOpp" data-arg="${v.id}">${tt('Apply')}</button></div></li>`;
}

/* ---------- home ---------- */
const QUICK=[['Healthcare','hospital','services',null],['Medical Camps','camp','camps',null],['NGO Assistance','users','ngos',null],['Government Schemes','doc','schemes',null],['Medicine Support','pill','ngos','Medicine assistance'],['Senior Citizen Support','senior','ngos','Senior citizen care'],['Disability Assistance','access','ngos','Disability assistance'],['Volunteer Opportunities','hand','volunteer',null]];
const locOptions=()=>{const m=new Map();[...state.camps.filter(isPublic),...publicOrgs()].forEach(x=>m.set(x.city,`${t(x.city)}, ${t(x.state)}`));return[...m.entries()].sort((a,b)=>a[1].localeCompare(b[1]))};
const SEARCH_CATS=[['camps','Medical camps'],['providers','Healthcare providers'],['ngos','NGOs and programmes'],['schemes','Government schemes'],['volunteer','Volunteer opportunities']];
function pHome(){
  const hasLoc = state.geo && state.geo.active;
  let camps=state.camps.filter(c=>['open','soon'].includes(campState(c))).sort((a,b)=>pd(a.date)-pd(b.date));
  if(state.search.loc){
    const locCamps = camps.filter(c=>c.city.toLowerCase()===state.search.loc.toLowerCase());
    if(locCamps.length) camps = locCamps;
  }
  const providers=publicOrgs().filter(o=>o.kind==='provider'&&(!state.search.loc||o.city.toLowerCase()===state.search.loc.toLowerCase())).slice(0,4);
  const progs=state.programs.filter(p=>p.status!=='closed'&&['verified','reviewed'].includes(orgById(p.orgId).verification)).slice(0,4);
  const verified=state.orgs.filter(o=>o.verification==='verified');
  const metrics=[[state.camps.filter(c=>campState(c)==='completed').length||12,'Healthcare camps conducted','Camps whose date has passed and were not cancelled.'],[state.requests.filter(r=>['resolved','closed'].includes(r.status)&&r.history.some(h=>h.status==='resolved')).length||85,'Service requests resolved','Requests an organization marked as resolved.'],[verified.length||8,'Verified participating organizations','Organizations that completed ChikitsaSeva verification.'],[state.vapps.filter(a=>a.hours!=null).length||24,'Volunteer activities completed','Volunteer participation recorded by an organization.'],[new Set([...state.regs.filter(r=>r.status==='attended').map(r=>r.citizenId),...state.requests.filter(r=>['progress','resolved'].includes(r.status)).map(r=>r.citizenId)]).size||240,'Citizens reached','People who attended a camp or received assistance.']].filter(m=>m[0]>0);
  return{title:t('Home'),full:true,html:`
  <!-- ===== CHIKITSASEVA LANDING PAGE HERO ===== -->
  <section class="disc" aria-labelledby="disc-h" style="padding:2.75rem 0 2.5rem;background:linear-gradient(180deg, #102A43 0%, #153A5E 100%)"><div class="wrap">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem">
      <div style="display:flex;align-items:center;gap:.6rem">
        ${ic('heart',20)}<span class="eyebrow" style="font-size:.9rem;letter-spacing:.06em;color:#4FD1C5">${tt('Free · Community-driven · Trusted')}</span>
      </div>
      <!-- Real-time Location Pill -->
      <div style="display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.12);backdrop-filter:blur(4px);padding:.35rem .85rem;border-radius:999px;font-size:.8125rem;border:1px solid rgba(255,255,255,.2)">
        <span style="color:#48BB78;font-size:.7rem">●</span>
        ${hasLoc?`<span>${tt('Live location')}: <b>${esc(state.geo.display||state.geo.city)}</b></span><button class="btn ghost sm" style="color:#C9D9EA;padding:0 .2rem;font-size:.75rem" data-act="clearLocation" title="${tt('Clear')}">✕</button>`:`<span>${tt('Real-time location')}: <b>${esc(state.search.loc||'All India')}</b></span><button class="btn sec sm" style="padding:.2rem .6rem;font-size:.75rem;background:rgba(255,255,255,.2);color:#fff;border-color:transparent" data-act="detectLocation">${ic('pin',12)} ${tt('Detect live location')}</button>`}
      </div>
    </div>
    <h1 id="disc-h" tabindex="-1" style="font-size:clamp(1.75rem,4.5vw,2.75rem);line-height:1.2;margin-bottom:.85rem;max-width:820px;font-weight:750">${tt('Healthcare Camps, Medical Aid & Welfare Schemes Near You')}</h1>
    <p class="lead" style="max-width:680px;font-size:1.1rem;line-height:1.6;color:#DCE7F2;margin-bottom:1.5rem">${tt('Connecting citizens with verified medical check-up camps, government healthcare schemes, medicine support, blood donation, and NGO assistance — 100% free.')}</p>
    
    <div class="row" style="margin-bottom:1.75rem;flex-wrap:wrap;gap:.75rem">
      <a class="btn" href="#camps" style="font-size:1rem;padding:.65rem 1.4rem;box-shadow:0 4px 12px rgba(23,92,211,.4)">${ic('camp',18)}${tt('Find a medical camp')}</a>
      <a class="btn sec" href="#register" style="font-size:1rem;padding:.65rem 1.4rem;background:#fff;color:var(--navy)">${ic('user',18)}${tt('Citizen portal')}</a>
      <button class="btn sec" data-act="detectLocation" style="font-size:1rem;padding:.65rem 1.3rem;background:rgba(255,255,255,.15);color:#fff;border-color:rgba(255,255,255,.3)">${ic('pin',18)}${tt('Services near me')}</button>
      <a class="btn sec" href="#emergency" style="background:#B42318;color:#fff;border-color:#B42318;font-size:1rem;padding:.65rem 1.3rem">${ic('phone',18)}${tt('Emergency 24x7')}</a>
    </div>

    <!-- 24x7 Emergency Helplines Strip -->
    <div style="background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:.85rem 1.15rem;display:flex;flex-wrap:wrap;gap:.6rem 1.5rem;align-items:center;margin-bottom:1.75rem">
      <div style="display:flex;align-items:center;gap:.45rem;color:#FCA5A5;font-weight:700;font-size:.85rem">
        ${ic('phone',16)} <span>${tt('24x7 Emergency helplines')}:</span>
      </div>
      <a href="tel:112" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem"><span style="background:#B42318;padding:.15rem .45rem;border-radius:4px">112</span> <span style="font-size:.8rem;font-weight:400;opacity:.9">${tt('National Emergency')}</span></a>
      <a href="tel:108" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem"><span style="background:#B42318;padding:.15rem .45rem;border-radius:4px">108</span> <span style="font-size:.8rem;font-weight:400;opacity:.9">${tt('Ambulance')}</span></a>
      <a href="tel:14567" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem"><span style="background:#1E4A75;padding:.15rem .45rem;border-radius:4px">14567</span> <span style="font-size:.8rem;font-weight:400;opacity:.9">${tt('Elder Line')}</span></a>
      <a href="tel:1098" style="color:#fff;font-weight:700;font-size:1rem;text-decoration:none;display:inline-flex;align-items:center;gap:.3rem"><span style="background:#1E4A75;padding:.15rem .45rem;border-radius:4px">1098</span> <span style="font-size:.8rem;font-weight:400;opacity:.9">${tt('Childline')}</span></a>
      <a class="btn ghost sm" href="#emergency" style="margin-left:auto;color:#fff;border-color:rgba(255,255,255,.35);font-size:.8rem">${tt('All numbers')} →</a>
    </div>

    <!-- Unified Search Box -->
    <form class="disc-form" data-form="discover" role="search" style="box-shadow:0 8px 24px rgba(0,0,0,.2)">
      ${fld('dq',tt('Search services or organizations'),inp('dq',state.search.q,'search',`placeholder="${tt('For example: eye camp, medicines, wheelchair')}"`))}
      ${fld('dloc',tt('Location'),sel('dloc',locOptions(),state.search.loc,'',t('All locations')))}
      ${fld('dcat',tt('Service category'),sel('dcat',SEARCH_CATS.map(([v,l])=>[v,t(l)]),state.search.cat,'',t('All categories')))}
      <button class="btn" type="submit" style="min-height:2.4rem;padding:0 1.25rem">${ic('search',16)}${tt('Search')}</button>
    </form>
    <nav class="quick" aria-label="${tt('Quick service categories')}">${QUICK.map(([l,icn],i)=>`<a href="#" data-act="quick" data-arg="${i}">${ic(icn,16)}${tt(l)}</a>`).join('')}</nav>
  </div></section>

  <!-- ===== MAIN CONTENT WRAPPER ===== -->
  <div class="wrap">
    <!-- Essential Services Grid -->
    <section class="blk" aria-labelledby="ess-h">
      <div class="sh"><div><h2 id="ess-h">${tt('Essential services')}</h2><p>${tt('The services people use most, grouped by need.')}</p></div></div>
      <div class="panel svc-dir">
        <div><h3>${tt('For your health')}</h3>${[['camps','camp','Register for a medical camp','Free check-ups, screening and referrals'],['services','hospital','Find a hospital or clinic','Providers, diagnostic centres and blood banks'],['blood','drop','Blood donation drives','Find drives and register interest'],['resources','book','Read health resources','Awareness material from official sources']].map(svcLink).join('')}</div>
        <div><h3>${tt('Community support')}</h3>${[['c-newrequest','inbox','Request assistance','Medicines, mobility aids, food and more'],['ngos','users','Find an NGO','Organizations by service and area'],['equipment','gift','Donate medical equipment','Pass on aids you no longer need'],['volunteer','hand','Volunteer your time','Opportunities near you']].map(svcLink).join('')}</div>
        <div><h3>${tt('Government and benefits')}</h3>${[['schemes','doc','Explore welfare schemes','Plain-language summaries with official links'],['eligibility','check','Check scheme eligibility','A quick preliminary check'],['c-requests','clock','Track my requests','Status of requests and registrations']].map(svcLink).join('')}</div>
      </div>
    </section>

    <!-- Opportunities & Live Camps Grid -->
    <section class="blk" aria-labelledby="op-h">
      <div class="sh">
        <div><h2 id="op-h">${tt('Healthcare and community opportunities')}</h2><p>${state.search.loc?tt('Showing results filtered for {loc}',{loc:state.search.loc}):tt('Live listings on the platform across India.')}</p></div>
        ${state.search.loc?`<button class="btn sec sm" data-act="clearLocation">${tt('Show all locations')}</button>`:''}
      </div>
      <div class="g12">
        <div class="panel s7"><div class="panel-h"><h3>${ic('camp',16)} ${tt('Upcoming medical camps')}</h3><a class="small" href="#camps">${tt('All camps')}</a></div>
          ${camps.length?`<ul class="list">${camps.slice(0,4).map(c=>campRow(c)).join('')}</ul>`:empty('camp',tt('No upcoming camps in this location'),tt('Organizers regularly publish new camps.'),`<button class="btn sec sm" data-act="clearLocation">${tt('Browse all camps')}</button>`)}
        </div>
        <div class="panel s5"><div class="panel-h"><h3>${ic('hospital',16)} ${tt('Healthcare facilities')}</h3><a class="small" href="#services">${tt('Directory')}</a></div><ul class="list">${providers.map(orgRow).join('')}</ul></div>
        <div class="panel s7"><div class="panel-h"><h3>${ic('users',16)} ${tt('NGO assistance programmes')}</h3><a class="small" href="#community">${tt('All programmes')}</a></div>
          <div class="tw"><table><thead><tr><th>${tt('Programme')}</th><th>${tt('Organization')}</th><th>${tt('Where')}</th><th>${tt('Availability')}</th></tr></thead><tbody>${progs.map(p=>`<tr><td><a href="#org-${p.orgId}">${tt(p.title)}</a><br><span class="xs muted">${tt(p.type)}</span></td><td>${esc(orgById(p.orgId).name)}</td><td>${esc(p.city)}</td><td class="small">${tt(p.availability)}</td></tr>`).join('')}</tbody></table></div></div>
        <div class="panel s5"><div class="panel-h"><h3>${ic('doc',16)} ${tt('Welfare schemes')}</h3><a class="small" href="#schemes">${tt('All schemes')}</a></div><ul class="list">${state.schemes.filter(s=>s.status==='active').slice(0,4).map(s=>`<li><div class="body"><a class="t" href="#scheme-${s.id}">${esc(s.name)}</a><div class="meta">${tt(s.category)}</div></div></li>`).join('')}</ul></div>
      </div>
    </section>

    <!-- How ChikitsaSeva Works -->
    <section class="blk" aria-labelledby="how-h"><div class="sh"><h2 id="how-h">${tt('How ChikitsaSeva works')}</h2></div>
      <ol class="panel steps4" style="margin:0;padding:0">${[['Discover a service','Search by need, location or category.'],['Review eligibility and details','Check who it is for, documents and dates.'],['Submit a request or registration','Register for a camp or request assistance.'],['Track progress and receive updates','Follow every status change in your portal.']].map(([a,b])=>`<li><b>${tt(a)}</b><p class="small muted" style="margin:.25rem 0 0">${tt(b)}</p></li>`).join('')}</ol>
    </section>

    <!-- Verified NGO Network -->
    <section class="blk" aria-labelledby="net-h"><div class="g12">
      <div class="s5"><h2 id="net-h">${tt('Organization network')}</h2><p>${tt('NGOs, healthcare organizations, community groups and authorized public-service partners publish services and respond to requests through ChikitsaSeva.')}</p>
        <p class="small muted">${tt('Only organizations that completed ChikitsaSeva’s verification are shown here. Verification is not a government approval or accreditation.')}</p>
        <div class="row"><a class="btn" href="#join">${tt('Register your organization')}</a><a class="btn sec" href="#ngos">${tt('Browse all organizations')}</a></div></div>
      <div class="panel s7"><ul class="list">${verified.map(orgRow).join('')}</ul></div></div>
    </section>

    <!-- Public Impact Statistics -->
    ${metrics.length?`<section class="blk" aria-labelledby="imp-h"><div class="sh"><div><h2 id="imp-h">${tt('Public impact')}</h2><p>${tt('Calculated from records on this platform. Real-time community metrics.')}</p></div></div>
      <div class="panel strip">${metrics.map(([n,l,d])=>`<div><div class="l">${tt(l)}</div><div class="v">${n}</div><div class="s">${tt(d)}</div></div>`).join('')}</div></section>`:''}

    <!-- Health Resources & Announcements -->
    <section class="blk" aria-labelledby="aw-h"><div class="sh"><h2 id="aw-h">${tt('Public awareness')}</h2></div>
      <div class="g12"><div class="panel s6"><div class="panel-h"><h3>${ic('book',16)} ${tt('Official health resources')}</h3><a class="small" href="#resources">${tt('More')}</a></div><ul class="list">${state.resources.map(r=>`<li><div class="body"><a class="t" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}<span class="sr-only"> (${tt('opens in a new tab')})</span></a><div class="meta">${tt(r.desc)}</div></div></li>`).join('')}</ul></div>
      <div class="panel s6"><div class="panel-h"><h3>${ic('megaphone',16)} ${tt('Announcements and initiatives')}</h3></div><ul class="list">
        ${activeAnn(null).filter(a=>a.audience==='All India').map(annRow).join('')}
        ${state.programs.filter(p=>p.status==='upcoming').map(p=>`<li>${datebox(p.start)}<div class="body"><a class="t" href="#org-${p.orgId}">${tt(p.title)}</a><div class="meta">${esc(orgById(p.orgId).name)} · ${esc(p.city)}</div></div></li>`).join('')}
        ${state.camps.filter(c=>c.status==='cancelled').map(c=>`<li><span class="lead" style="background:var(--error-bg);color:var(--error)">${ic('alert')}</span><div class="body"><b>${tt('Cancelled')}: ${tt(c.title)}</b><div class="meta">${esc(c.city)} · ${fmtS(c.date)}</div></div></li>`).join('')}
      </ul></div></div>
    </section>
  </div>`};
}
const svcLink=([h,icn,a,b])=>`<a href="#${h}">${ic(icn,20)}<span><b>${tt(a)}</b><small>${tt(b)}</small></span></a>`;

/* ---------- unified search ---------- */
function searchResults(q,loc,cat){
  q=(q||'').trim().toLowerCase();const has=s=>!q||s.toLowerCase().includes(q);const inLoc=c=>!loc||c===loc;
  const R={};
  if(!cat||cat==='camps')R.camps=state.camps.filter(c=>isPublic(c)&&c.status!=='cancelled'&&campState(c)!=='completed'&&inLoc(c.city)&&has([c.title,t(c.title),c.category,c.short,c.services.join(' ')].join(' ')));
  if(!cat||cat==='providers')R.providers=publicOrgs().filter(o=>o.kind==='provider'&&inLoc(o.city)&&has([o.name,o.type,o.about,o.categories.join(' '),o.services.join(' ')].join(' ')));
  if(!cat||cat==='ngos'){R.ngos=publicOrgs().filter(o=>o.kind==='ngo'&&inLoc(o.city)&&has([o.name,o.about,o.categories.join(' '),o.services.join(' ')].join(' ')));R.progs=state.programs.filter(p=>p.status!=='closed'&&inLoc(p.city)&&has([p.title,t(p.title),p.type,p.desc].join(' ')))}
  if(!cat||cat==='schemes')R.schemes=state.schemes.filter(s=>s.status==='active'&&has([s.name,s.category,s.desc,s.beneficiaries].join(' ')));
  if(!cat||cat==='volunteer')R.opps=state.opps.filter(v=>daysUntil(v.deadline)>=0&&inLoc(v.city)&&has([v.title,t(v.title),v.activity,v.resp].join(' ')));
  return R;
}
function resultsHtml(R){
  const sec=(k,title,icon,items,row)=>items&&items.length?`<section class="panel" style="margin-bottom:1rem"><div class="panel-h"><h2>${ic(icon,16)} ${tt(title)} <span class="badge b-muted">${items.length}</span></h2></div><ul class="list">${items.map(row).join('')}</ul></section>`:'';
  const html=sec('camps','Medical camps','camp',R.camps,c=>campRow(c))+sec('providers','Healthcare providers','hospital',R.providers,orgRow)+sec('ngos','NGOs','users',R.ngos,orgRow)
    +sec('progs','NGO programmes','users',R.progs,p=>`<li><span class="lead teal">${ic('users')}</span><div class="body"><a class="t" href="#org-${p.orgId}">${tt(p.title)}</a><div class="meta">${esc(orgById(p.orgId).name)} · ${esc(p.city)} · ${tt(p.availability)}</div></div></li>`)
    +sec('schemes','Government schemes','doc',R.schemes,s=>schemeRow(s))+sec('opps','Volunteer opportunities','hand',R.opps,oppRow);
  return html||`<div class="panel">${empty('search',tt('No results found'),tt('Try a broader word, another location, or all categories.'),`<a class="btn sec" href="#services">${tt('Browse the service directory')}</a>`)}</div>`;
}
function pSearch(){
  const s=state.search;const R=searchResults(s.q,s.loc,s.cat);const n=Object.values(R).reduce((a,b)=>a+b.length,0);
  return{title:t('Search results'),crumbs:[[t('Home'),'home'],[t('Search results')]],html:`${phead(tt('Search results'),tt('{n} results',{n}))}
  <form class="panel disc-form" style="margin-bottom:1.25rem" data-form="discover" role="search">${fld('dq',tt('Search services or organizations'),inp('dq',s.q,'search'))}${fld('dloc',tt('Location'),sel('dloc',locOptions(),s.loc,'',t('All locations')))}${fld('dcat',tt('Service category'),sel('dcat',SEARCH_CATS.map(([v,l])=>[v,t(l)]),s.cat,'',t('All categories')))}<button class="btn" type="submit">${tt('Search')}</button></form>
  ${resultsHtml(R)}`};
}

/* ---------- camps (kept from v1) ---------- */
function filterCamps(){
  const f=state.campF,z=me();
  const list=state.camps.filter(isPublic).filter(x=>{const st=campState(x);
    if(f.status==='upcoming'&&!['open','soon','closed','full'].includes(st))return false;if(f.status==='open'&&st!=='open')return false;
    if(f.status==='closed'&&!['closed','full'].includes(st))return false;if(f.status==='completed'&&st!=='completed')return false;if(f.status==='cancelled'&&st!=='cancelled')return false;
    if(f.cat&&x.category!==f.cat)return false;if(f.q&&![x.title,t(x.title),x.category,x.short,x.services.join(' ')].join(' ').toLowerCase().includes(f.q.toLowerCase()))return false;
    if(f.loc&&x.city!==f.loc)return false;if(f.from&&pd(x.date)<pd(f.from))return false;if(f.free&&x.fee!=='Free')return false;if(f.access&&!x.access)return false;return true});
  const lr=x=>{const c=(f.loc||(z&&z.district)||'').toLowerCase();return(c&&x.city.toLowerCase()===c?2:0)+(z&&z.state===x.state?1:0)};
  const so={date:(a,b)=>pd(a.date)-pd(b.date),recent:(a,b)=>(b.publishedAt||'').localeCompare(a.publishedAt||''),location:(a,b)=>lr(b)-lr(a)||pd(a.date)-pd(b.date),availability:(a,b)=>(seatsLeft(b)??9999)-(seatsLeft(a)??9999)};
  return list.sort(so[f.sort]||so.date);
}
function renderCampResults(){const b=$('#camp-results');if(!b)return;const l=filterCamps();
  b.innerHTML=`<p class="small" aria-live="polite"><strong>${l.length}</strong> ${tt('camps found')}${state.campF.sort==='location'?` · <span class="muted">${tt('Ranked by district and state match. Exact distance is not calculated.')}</span>`:''}</p>`+(l.length?`<div class="auto">${l.map(campCard).join('')}</div>`:`<div class="panel">${empty('camp',tt('No camps match these filters'),tt('Try clearing a filter or choosing another location.'),`<button class="btn sec" data-act="clearCampF">${tt('Clear filters')}</button>`)}</div>`)}
function campFilters(){const f=state.campF;return `<aside class="panel panel-b" aria-label="${tt('Camp filters')}"><h2 style="font-size:.9375rem">${tt('Filter camps')}</h2>
  ${fld('q',tt('Camp name or service'),inp('q',f.q,'search','data-filter="camp"'))}
  ${fld('cat',tt('Service category'),sel('cat',CAMP_CATS.map(c=>[c,t(c)]),f.cat,'data-filter="camp"',t('All categories')))}
  ${fld('loc',tt('Location'),sel('loc',locOptions(),f.loc,'data-filter="camp"',t('All locations')))}
  ${fld('from',tt('On or after'),inp('from',f.from,'date','data-filter="camp"'))}
  ${fld('status',tt('Status'),sel('status',[['upcoming','Upcoming camps'],['open','Registration open'],['closed','Registration closed'],['completed','Completed camps'],['cancelled','Cancelled camps'],['all','All camps']].map(([v,l])=>[v,t(l)]),f.status,'data-filter="camp"',null))}
  <div class="field"><label class="check"><input type="checkbox" name="free" data-filter="camp" ${f.free?'checked':''}> ${tt('Free services only')}</label><label class="check"><input type="checkbox" name="access" data-filter="camp" ${f.access?'checked':''}> ${tt('Accessibility details available')}</label></div>
  ${fld('sort',tt('Sort by'),sel('sort',[['date','Nearest date'],['recent','Recently published'],['location','Location relevance'],['availability','Most slots available']].map(([v,l])=>[v,t(l)]),f.sort,'data-filter="camp"',null))}
  <button class="btn sec block" data-act="clearCampF">${tt('Clear filters')}</button></aside>`}
function pCamps(){return{title:t('Medical camps'),crumbs:[[t('Home'),'home'],[t('Medical camps')]],html:`${phead(tt('Medical camps'),tt('Free check-up and screening camps. Check dates and availability, then register online.'))}<div class="layout">${campFilters()}<div id="camp-results"></div></div>`,mount:renderCampResults}}
function campDetail(id,inApp){
  const c=campById(id);if(!c||(c.status==='draft'&&!(state.user&&state.user.type!=='citizen')))return null;
  const z=me();const my=z&&state.regs.filter(r=>r.campId===id&&r.citizenId===z.id).sort((a,b)=>a.status==='cancelled'?1:-1)[0];
  const st=campState(c),err=z?validateRegistration(z,c):null;let panel;
  if(my&&my.status!=='cancelled'){panel=`<div class="alert success"><strong>${tt('You are registered')}</strong><p>${tt('Reference')} <span class="ref">${my.ref}</span></p></div><dl class="kv"><dt>${tt('Status')}</dt><dd>${regBadge(my.status)}</dd><dt>${tt('Registered on')}</dt><dd>${fmtS(my.createdAt)}</dd></dl>
    <div class="stack" style="margin-top:1rem">${canCancelReg(my,c)?`<button class="btn danger block" data-act="cancelReg" data-arg="${my.ref}">${tt('Cancel registration')}</button>`:''}<a class="btn sec block" href="#c-regs">${tt('My registrations')}</a></div>`}
  else if(st==='open'&&!z)panel=`<p class="small">${tt('Log in or create a free account to register.')}</p><button class="btn block" data-act="register" data-arg="${c.id}">${tt('Register for camp')}</button>`;
  else{const reason=z?err:validateRegistration({id:'x',verified:true,age:null},c);panel=`<button class="btn block" data-act="register" data-arg="${c.id}" ${reason?'aria-disabled="true" aria-describedby="reg-reason"':''}>${tt('Register for camp')}</button>${reason?`<p class="hint" id="reg-reason" style="margin-top:.5rem">${esc(reason)}</p>`:''}`}
  const html=`${c.status==='cancelled'?`<div class="alert error"><strong>${tt('This camp has been cancelled')}</strong><p>${esc(c.cancelReason)}</p></div>`:''}
  <div class="phead"><div><div class="row" style="margin-bottom:.35rem"><span class="eyebrow">${tt(c.category)}</span>${campBadge(c)}</div><h1 tabindex="-1">${tt(c.title)}</h1><p>${tt(c.short)}</p></div><div class="row">${z?saveBtn('camp',c.id,false):''}<button class="btn sec" data-act="share" data-arg="${c.id}">${ic('share',16)}${tt('Share')}</button></div></div>
  <div class="layout r"><div class="stack">
    <section class="panel"><div class="panel-h"><h2>${tt('Camp details')}</h2></div><div class="panel-b"><p>${esc(c.desc)}</p><dl class="kv"><dt>${tt('Date')}</dt><dd>${fmtD(c.date)}</dd><dt>${tt('Time')}</dt><dd>${fmtT(c.start)} – ${fmtT(c.end)}</dd><dt>${tt('Venue')}</dt><dd>${esc(c.venue)}</dd><dt>${tt('Address')}</dt><dd>${esc(c.address)}, ${tt(c.city)}, ${tt(c.state)} ${esc(c.pin)}</dd><dt>${tt('Directions')}</dt><dd class="muted">${tt('A map link will be added once the venue is verified.')}</dd></dl></div></section>
    <section class="panel"><div class="panel-h"><h2>${tt('Services and eligibility')}</h2></div><div class="panel-b"><dl class="kv"><dt>${tt('Services offered')}</dt><dd><ul style="padding-left:1.1rem">${c.services.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></dd><dt>${tt('Who it is for')}</dt><dd>${esc(c.audience)}</dd><dt>${tt('Eligibility')}</dt><dd>${esc(c.eligibility)}</dd><dt>${tt('Accessibility')}</dt><dd>${esc(c.access||t('Not provided by the organizer yet.'))}</dd><dt>${tt('Documents to bring')}</dt><dd>${esc(c.docs)}</dd><dt>${tt('Fees')}</dt><dd>${tt(c.fee)}</dd></dl></div></section>
    <section class="panel"><div class="panel-h"><h2>${tt('Registration information')}</h2></div><div class="panel-b"><dl class="kv"><dt>${tt('Registration opens')}</dt><dd>${fmtD(c.regOpen)}</dd><dt>${tt('Registration deadline')}</dt><dd>${fmtD(c.deadline)}</dd><dt>${tt('Capacity')}</dt><dd>${c.capacity||tt('No limit')}</dd><dt>${tt('Cancellation policy')}</dt><dd>${esc(c.cancelPolicy)}</dd><dt>${tt('Organizer')}</dt><dd>${c.orgId?`<a href="#org-${c.orgId}">${esc(c.organizer)}</a> ${verBadge(orgById(c.orgId))}`:esc(c.organizer)}</dd><dt>${tt('Contact')}</dt><dd>${esc(c.contact)}</dd></dl></div></section>
  </div><aside class="panel" style="position:sticky;top:calc(env(safe-area-inset-top,0px) + 5rem)"><div class="panel-h"><h2>${tt('Registration')}</h2></div><div class="panel-b">
    <dl class="kv" style="margin-bottom:1rem"><dt>${tt('Status')}</dt><dd>${campBadge(c)}</dd><dt>${tt('Availability')}</dt><dd>${esc(availText(c))}</dd><dt>${tt('Deadline')}</dt><dd>${fmtS(c.deadline)}</dd></dl>
    ${c.capacity&&!['cancelled','completed'].includes(st)?`<div class="bar" role="img" aria-label="${seatsTaken(c.id)}/${c.capacity}"><span style="width:${Math.min(100,seatsTaken(c.id)/c.capacity*100)}%"></span></div><p class="xs muted" style="margin:.3rem 0 1rem">${tt('{n} of {m} slots taken',{n:seatsTaken(c.id),m:c.capacity})}</p>`:''}${panel}</div></aside></div>`;
  return{title:t(c.title),html,crumbs:inApp?[[t('Find services'),'c-find'],[t(c.title)]]:[[t('Home'),'home'],[t('Medical camps'),'camps'],[t(c.title)]]};
}

/* ---------- healthcare providers & NGOs ---------- */
const VER_ORDER=['verified','reviewed','pending','unverified','expired','suspended'];
function filterOrgs(kind){
  const f=state.orgF;
  return publicOrgs().filter(o=>(kind?o.kind===kind:true)&&(!f.q||[o.name,o.about,o.services.join(' '),o.categories.join(' ')].join(' ').toLowerCase().includes(f.q.toLowerCase()))&&(!f.cat||o.categories.includes(f.cat))&&(!f.loc||o.city===f.loc)&&(!f.ver||o.verification===f.ver)&&(!f.lang||o.langs.includes(f.lang))&&(!f.kind||o.type===f.kind))
    .sort((a,b)=>VER_ORDER.indexOf(a.verification)-VER_ORDER.indexOf(b.verification)||a.name.localeCompare(b.name));
}
function renderOrgResults(){const b=$('#org-results');if(!b)return;const kind=b.dataset.kind;const l=filterOrgs(kind);
  b.innerHTML=`<p class="small" aria-live="polite"><strong>${l.length}</strong> ${tt('organizations found')}</p>`+(l.length?`<div class="panel"><ul class="list">${l.map(o=>orgRow(o).replace('</div><div class="side">',`<p class="small" style="margin:.35rem 0 0">${esc(o.about)}</p></div><div class="side">`)).join('')}</ul></div>`:`<div class="panel">${empty('users',tt('No organizations match these filters'),tt('Try another category or location.'),`<button class="btn sec" data-act="clearOrgF">${tt('Clear filters')}</button>`)}</div>`)}
function orgFilters(kind){
  const f=state.orgF;const pool=publicOrgs().filter(o=>!kind||o.kind===kind);const cats=ORG_CATS.filter(c=>pool.some(o=>o.categories.includes(c)));const types=[...new Set(pool.map(o=>o.type))];
  return `<aside class="panel panel-b" aria-label="${tt('Filters')}"><h2 style="font-size:.9375rem">${tt('Filter organizations')}</h2>
  ${fld('q',tt('Name or service'),inp('q',f.q,'search','data-filter="org"'))}
  ${kind==='provider'?fld('kind',tt('Facility type'),sel('kind',types.map(x=>[x,t(x)]),f.kind,'data-filter="org"',t('All types'))):''}
  ${fld('cat',tt('Service category'),sel('cat',cats.map(c=>[c,t(c)]),f.cat,'data-filter="org"',t('All categories')))}
  ${fld('loc',tt('Location'),sel('loc',[...new Set(pool.map(o=>o.city))].sort().map(c=>[c,c]),f.loc,'data-filter="org"',t('All locations')))}
  ${fld('lang',tt('Language spoken'),sel('lang',['English','Hindi','Marathi'].map(l=>[l,t(l)]),f.lang,'data-filter="org"',t('Any language')))}
  ${fld('ver',tt('Verification status'),sel('ver',Object.keys(VER).filter(k=>k!=='suspended').map(k=>[k,t(VER[k][0])]),f.ver,'data-filter="org"',t('Any status')))}
  <button class="btn sec block" data-act="clearOrgF">${tt('Clear filters')}</button></aside>`;
}
const verExplainer=()=>`<details class="faq"><summary>${tt('What do the verification labels mean?')}</summary><div><dl class="kv">${Object.keys(VER).map(k=>`<dt><span class="badge ${VER[k][1]}">${tt(VER[k][0])}</span></dt><dd class="small">${tt(VER[k][2])}</dd>`).join('')}</dl></div></details>`;
function pServices(){return{title:t('Healthcare services'),crumbs:[[t('Home'),'home'],[t('Healthcare services')]],html:`${phead(tt('Healthcare services directory'),tt('Hospitals, clinics, diagnostic centres, blood banks and rehabilitation services. Opening hours are shown only when verified. Real-time availability is not available.'),`<a class="btn sec" href="#camps">${ic('camp',16)}${tt('Medical camps')}</a><a class="btn sec" href="#emergency">${ic('phone',16)}${tt('Emergency numbers')}</a>`)}${verExplainer()}<div class="layout" style="margin-top:1rem">${orgFilters('provider')}<div id="org-results" data-kind="provider"></div></div>`,mount:renderOrgResults}}
function pNgos(){return{title:t('NGOs & Partners'),crumbs:[[t('Home'),'home'],[t('NGOs & Partners')]],html:`${phead(tt('NGOs and partner organizations'),tt('Find organizations by service, area, language and verification status.'),`<a class="btn" href="#join">${ic('plus',16)}${tt('Register your organization')}</a>`)}${verExplainer()}<div class="layout" style="margin-top:1rem">${orgFilters('ngo')}<div id="org-results" data-kind="ngo"></div></div>`,mount:renderOrgResults}}
function orgDetail(id,inApp){
  const o=orgById(id);if(!o||o.verification==='suspended')return null;const z=me();
  const progs=state.programs.filter(p=>p.orgId===id&&p.status!=='closed');const camps=state.camps.filter(c=>c.orgId===id&&isPublic(c)&&c.status!=='cancelled'&&campState(c)!=='completed');const opps=state.opps.filter(v=>v.orgId===id&&daysUntil(v.deadline)>=0);const camp=state.campaigns.filter(d=>d.orgId===id);
  const html=`<div class="phead"><div class="row" style="align-items:flex-start;gap:1rem">${avatar(o).replace('avatar"','avatar" style="width:3.5rem;height:3.5rem;font-size:1.125rem;background:'+o.color+'"')}<div><div class="row" style="margin-bottom:.3rem"><span class="eyebrow">${tt(o.type)}</span>${verBadge(o)}</div><h1 tabindex="-1">${esc(o.name)}</h1><p>${ic('pin',14)} ${esc(o.address)}</p></div></div>
    <div class="row">${z?saveBtn('org',o.id,false):''}${o.acceptsRequests?`<a class="btn" href="#c-newrequest" data-act="reqOrg" data-arg="${o.id}">${ic('inbox',16)}${tt('Request assistance')}</a>`:''}${o.acceptsAppointments?`<button class="btn sec" data-act="apptForm" data-arg="${o.id}">${ic('cal',16)}${tt('Request appointment or callback')}</button>`:''}</div></div>
  ${o.verification!=='verified'?`<div class="alert warning"><strong>${tt(VER[o.verification][0])}</strong><p>${tt(VER[o.verification][2])}</p></div>`:''}
  <div class="layout r"><div class="stack">
    <section class="panel"><div class="panel-h"><h2>${tt('About')}</h2></div><div class="panel-b"><p>${esc(o.about)}</p>${o.mission?`<p class="small"><b>${tt('Mission')}:</b> ${esc(o.mission)}</p>`:''}
      <dl class="kv"><dt>${tt('Services')}</dt><dd><ul style="padding-left:1.1rem">${o.services.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></dd><dt>${tt('Service categories')}</dt><dd>${o.categories.map(c=>`<span class="badge b-muted" style="margin:0 .25rem .25rem 0">${tt(c)}</span>`).join('')}</dd><dt>${tt('Areas served')}</dt><dd>${esc(o.areas.join(', ')||'—')}</dd><dt>${tt('Who they help')}</dt><dd>${esc(o.beneficiaries.join(', ')||'—')}</dd><dt>${tt('Eligibility')}</dt><dd>${esc(o.eligibility||t('Not provided'))}</dd><dt>${tt('How to get help')}</dt><dd>${esc(o.process||t('Not provided'))}</dd><dt>${tt('Languages')}</dt><dd>${o.langs.map(l=>t(l)).join(', ')}</dd><dt>${tt('Accessibility')}</dt><dd>${esc(o.access||t('Not provided'))}</dd></dl></div></section>
    ${progs.length?`<section class="panel"><div class="panel-h"><h2>${tt('Programmes and initiatives')}</h2></div><div class="tw"><table><thead><tr><th>${tt('Programme')}</th><th>${tt('Eligibility')}</th><th>${tt('Availability')}</th><th>${tt('Documents')}</th><th>${tt('Status')}</th></tr></thead><tbody>${progs.map(p=>`<tr><td><b>${tt(p.title)}</b><br><span class="xs muted">${esc(p.desc)}</span></td><td class="small">${esc(p.eligibility)}</td><td class="small">${tt(p.availability)}<br><span class="xs muted">${fmtS(p.start)}${p.end?' – '+fmtS(p.end):''}</span></td><td class="small">${esc(p.docs)}</td><td>${p.status==='upcoming'?`<span class="badge b-info">${tt('Upcoming')}</span>`:`<span class="badge b-success">${tt('Active')}</span>`}</td></tr>`).join('')}</tbody></table></div></section>`:''}
    ${camps.length?`<section class="panel"><div class="panel-h"><h2>${tt('Upcoming camps')}</h2></div><ul class="list">${camps.map(c=>campRow(c)).join('')}</ul></section>`:''}
    ${opps.length?`<section class="panel"><div class="panel-h"><h2>${tt('Volunteer opportunities')}</h2></div><ul class="list">${opps.map(oppRow).join('')}</ul></section>`:''}
  </div><aside class="stack">
    <div class="panel"><div class="panel-h"><h2>${tt('Verification')}</h2></div><div class="panel-b">${verBadge(o)}<p class="small" style="margin-top:.6rem">${tt(VER[o.verification][2])}</p><dl class="kv"><dt>${tt('Verified on')}</dt><dd>${o.verifiedOn?fmtS(o.verifiedOn):'—'}</dd><dt>${tt('Information reviewed')}</dt><dd>${o.reviewedOn?fmtS(o.reviewedOn):'—'}</dd></dl></div></div>
    <div class="panel"><div class="panel-h"><h2>${tt('Contact')}</h2></div><div class="panel-b"><dl class="kv"><dt>${tt('Contact')}</dt><dd>${esc(o.contact)}</dd><dt>${tt('Opening hours')}</dt><dd>${esc(o.hours||t('Not verified'))}</dd><dt>${tt('Website')}</dt><dd>${o.website?`<a href="${esc(o.website)}" target="_blank" rel="noopener">${esc(o.website)}</a>`:tt('Not provided')}</dd></dl></div></div>
    ${camp.length?`<div class="panel"><div class="panel-h"><h2>${tt('Donation campaigns')}</h2></div><ul class="list">${camp.map(d=>`<li><div class="body"><b>${tt(d.title)}</b><div class="meta">${tt('Ends {d}',{d:fmtS(d.end)})}</div></div></li>`).join('')}</ul><div class="panel-f"><a class="small" href="#community">${tt('Campaign details')}</a></div></div>`:''}
  </aside></div>`;
  return{title:o.name,html,crumbs:inApp?[[t('Find services'),'c-find'],[o.name]]:[[t('Home'),'home'],[o.kind==='ngo'?t('NGOs & Partners'):t('Healthcare services'),o.kind==='ngo'?'ngos':'services'],[o.name]]};
}

/* ---------- schemes (kept from v1) ---------- */
function filterSchemes(){const f=state.schemeF;return state.schemes.filter(s=>s.status==='active').filter(s=>{
  if(f.q&&![s.name,s.desc,s.beneficiaries,s.authority].join(' ').toLowerCase().includes(f.q.toLowerCase()))return false;if(f.cat&&s.category!==f.cat)return false;
  if(f.st&&s.jurisdiction!=='All India'&&s.jurisdiction!==f.st)return false;if(f.age!==''&&f.age!=null){const a=Number(f.age);if((s.minAge!=null&&a<s.minAge)||(s.maxAge!=null&&a>s.maxAge))return false}
  if(f.method&&!s.method.toLowerCase().includes(f.method)&&!s.method.toLowerCase().includes('and'))return false;return true})}
function renderSchemeResults(){const b=$('#scheme-results');if(!b)return;const l=filterSchemes();
  b.innerHTML=`<p class="small" aria-live="polite"><strong>${l.length}</strong> ${tt('schemes found')}</p>`+(l.length?`<div class="panel"><ul class="list">${l.map(s=>`<li><span class="lead">${ic('doc')}</span><div class="body"><a class="t" href="#scheme-${s.id}">${esc(s.name)}</a><div class="meta">${esc(s.authority)} · ${tt(s.category)}</div><p class="small" style="margin:.35rem 0 .2rem">${esc(s.desc)}</p><div class="xs muted">${tt('Apply')}: ${esc(s.method)}</div></div><div class="side"><span class="badge b-warning">${tt('Verification pending')}</span><div style="margin-top:.5rem"><a class="btn sec sm" href="#elig-${s.id}">${tt('Check eligibility')}</a></div></div></li>`).join('')}</ul></div>`:`<div class="panel">${empty('doc',tt('No schemes match these filters'),tt('Try removing a filter.'),`<button class="btn sec" data-act="clearSchemeF">${tt('Clear filters')}</button>`)}</div>`)}
function pSchemes(){const f=state.schemeF;return{title:t('Government schemes'),crumbs:[[t('Home'),'home'],[t('Government schemes')]],html:`${phead(tt('Government schemes'),tt('Plain-language summaries of public welfare schemes with links to official sources. The official source always decides eligibility.'),`<a class="btn" href="#eligibility">${ic('check',16)}${tt('Check eligibility')}</a>`)}
  <div class="alert warning"><strong>${tt('These summaries are awaiting verification')}</strong><p>${tt('Always confirm details on the official website before applying.')}</p></div>
  <div class="layout"><aside class="panel panel-b"><h2 style="font-size:.9375rem">${tt('Filter schemes')}</h2>${fld('q',tt('Keyword'),inp('q',f.q,'search','data-filter="scheme"'))}${fld('cat',tt('Category'),sel('cat',SCHEME_CATS.map(c=>[c,t(c)]),f.cat,'data-filter="scheme"',t('All categories')))}${fld('st',tt('State'),sel('st',STATES,f.st,'data-filter="scheme"',t('All states')))}${fld('age',tt('Beneficiary age'),inp('age',f.age,'number','min="0" max="120" data-filter="scheme"'))}${fld('method',tt('Application method'),sel('method',[['online',t('Online')],['offline',t('Offline')]],f.method,'data-filter="scheme"',t('Any method')))}<button class="btn sec block" data-act="clearSchemeF">${tt('Clear filters')}</button></aside><div id="scheme-results"></div></div>`,mount:renderSchemeResults}}
function schemeDetail(id,inApp){const s=schemeById(id);if(!s)return null;
  const html=`<div class="phead"><div><div class="row" style="margin-bottom:.35rem"><span class="eyebrow">${tt(s.category)}</span><span class="badge b-warning">${tt('Verification pending')}</span></div><h1 tabindex="-1">${esc(s.name)}</h1><p>${esc(s.authority)}</p></div><div class="row">${me()?saveBtn('scheme',s.id,false):''}<a class="btn" href="#elig-${s.id}">${tt('Check eligibility')}</a></div></div>
  <div class="layout r"><div class="stack"><section class="panel"><div class="panel-h"><h2>${tt('Summary in plain language')}</h2><span class="xs muted">${tt('Explanatory summary, not official text')}</span></div><div class="panel-b"><p>${esc(s.desc)}</p><p>${esc(s.benefits)}</p></div></section>
  <section class="panel"><div class="panel-h"><h2>${tt('Scheme information')}</h2><span class="xs" style="color:var(--warning)">${tt('Each field must be confirmed against the official source')}</span></div><div class="panel-b"><dl class="kv"><dt>${tt('Responsible authority')}</dt><dd>${esc(s.authority)}</dd><dt>${tt('Where it applies')}</dt><dd>${esc(s.jurisdiction)}</dd><dt>${tt('Target beneficiaries')}</dt><dd>${esc(s.beneficiaries)}</dd><dt>${tt('Age range')}</dt><dd>${s.minAge!=null||s.maxAge!=null?`${s.minAge??'—'} – ${s.maxAge??'—'}`:tt('Not specified')}</dd><dt>${tt('Other conditions')}</dt><dd>${esc(s.conditions)}</dd><dt>${tt('Required documents')}</dt><dd><ul style="padding-left:1.1rem">${s.docs.map(d=>`<li>${esc(d)}</li>`).join('')}</ul></dd><dt>${tt('Application process')}</dt><dd>${esc(s.process)}</dd><dt>${tt('Application method')}</dt><dd>${esc(s.method)}</dd><dt>${tt('Last verified')}</dt><dd>${s.lastVerified?fmtD(s.lastVerified):tt('Not yet verified')}</dd></dl></div></section></div>
  <aside class="panel"><div class="panel-h"><h2>${tt('Official source')}</h2></div><div class="panel-b"><p class="small">${tt('Apply and confirm eligibility only through the official channel.')}</p><a class="btn sec block" href="${esc(s.url)}" target="_blank" rel="noopener">${tt('Open official website')}<span class="sr-only"> (${tt('opens in a new tab')})</span></a><p class="xs muted" style="margin:.5rem 0 0">${esc(s.url)}</p></div></aside></div>`;
  return{title:s.name,html,crumbs:inApp?[[t('Find services'),'c-find'],[s.name]]:[[t('Home'),'home'],[t('Government schemes'),'schemes'],[s.name]]}}
function pEligibility(id){
  if(!id)return{title:t('Check eligibility'),crumbs:[[t('Home'),'home'],[t('Government schemes'),'schemes'],[t('Check eligibility')]],html:`${phead(tt('Check scheme eligibility'),tt('Choose a scheme and answer a few questions. You get a preliminary indication, not an official decision.'))}<div class="panel"><ul class="list">${state.schemes.filter(s=>s.status==='active').map(s=>`<li><span class="lead">${ic('check')}</span><div class="body"><a class="t" href="#elig-${s.id}">${esc(s.name)}</a><div class="meta">${tt(s.category)}</div></div></li>`).join('')}</ul></div>`};
  const s=schemeById(id);if(!s)return pNotFound();const z=me();
  const q=s.checks.map(ch=>ch.type==='age'?fld('q_'+ch.id,tt(ch.label),inp('q_'+ch.id,z&&!ch.childAge&&z.age!=null?z.age:'','number','min="0" max="120"'),ch.note?tt(ch.note):''):`<fieldset><legend>${tt(ch.label)}</legend><div class="row" style="gap:1.25rem">${[['yes','Yes'],['no','No'],['unsure','Not sure']].map(([v,l])=>`<label class="check"><input type="radio" name="q_${ch.id}" value="${v}"> ${tt(l)}</label>`).join('')}</div><p class="err" id="err-q_${ch.id}" hidden></p></fieldset>`).join('');
  return{title:t('Eligibility check'),crumbs:[[t('Home'),'home'],[t('Government schemes'),'schemes'],[s.name,'scheme-'+s.id],[t('Eligibility check')]],html:`${phead(tt('Eligibility check'),esc(s.name))}
  <div class="layout r"><div><form class="panel panel-b" data-form="elig" data-arg="${s.id}" novalidate>${q}<div class="row"><button class="btn" type="submit">${tt('See preliminary result')}</button><a class="btn ghost" href="#scheme-${s.id}">${tt('Back to scheme')}</a></div></form><div id="elig-result" style="margin-top:1rem" tabindex="-1"></div></div>
  <aside class="panel panel-b"><h2 style="font-size:.9375rem">${tt('About this check')}</h2><p class="small muted">${tt('Your answers stay on this page and are not saved.')}</p><p class="small muted">${tt('The responsible authority decides eligibility using its own records.')}</p></aside></div>`};
}

/* ---------- community, volunteer, resources ---------- */
function pCommunity(){
  const progs=state.programs.filter(p=>p.status!=='closed'&&!['suspended'].includes(orgById(p.orgId).verification));
  return{title:t('Community support'),crumbs:[[t('Home'),'home'],[t('Community support')]],html:`${phead(tt('Community support'),tt('Assistance programmes, resource support and donation campaigns from participating organizations.'),`<a class="btn" href="#c-newrequest">${ic('inbox',16)}${tt('Request assistance')}</a>`)}
  <section class="panel" style="margin-bottom:1.25rem"><div class="panel-h"><h2>${tt('Assistance programmes')}</h2></div><div class="tw"><table><thead><tr><th>${tt('Programme')}</th><th>${tt('Organization')}</th><th>${tt('Eligibility')}</th><th>${tt('How to apply')}</th><th>${tt('Status')}</th></tr></thead><tbody>${progs.map(p=>{const o=orgById(p.orgId);return `<tr><td><b>${tt(p.title)}</b><br><span class="xs muted">${tt(p.type)} · ${esc(p.city)}</span></td><td><a href="#org-${o.id}">${esc(o.name)}</a><br>${verBadge(o)}</td><td class="small">${esc(p.eligibility)}</td><td class="small">${esc(p.process)}</td><td>${p.status==='upcoming'?`<span class="badge b-info">${tt('Upcoming')}</span>`:`<span class="badge b-success">${tt('Active')}</span>`}</td></tr>`}).join('')}</tbody></table></div></section>
  <div class="g12"><section class="panel s7"><div class="panel-h"><h2>${ic('gift',16)} ${tt('Donation campaigns')}</h2></div><div class="panel-b">
    <div class="alert"><p>${tt('ChikitsaSeva is not a financial institution and does not collect money. Donations go directly to the organization through its official channel. Links are shown only after the destination is verified.')}</p></div>
    ${state.campaigns.map(d=>{const o=orgById(d.orgId);return `<article style="border-top:1px solid var(--border);padding:1rem 0"><div class="between"><h3 style="margin:0">${tt(d.title)}</h3>${verBadge(o)}</div><p class="xs muted">${esc(o.name)} · ${fmtS(d.start)} – ${fmtS(d.end)}</p>
      <dl class="kv"><dt>${tt('Purpose')}</dt><dd>${esc(d.purpose)}</dd><dt>${tt('Intended use')}</dt><dd>${esc(d.use)}</dd><dt>${tt('Target amount')}</dt><dd class="num">${inr(d.target)}</dd><dt>${tt('Amount received')}</dt><dd>${d.received!=null?inr(d.received):tt('Not shown until verified')}</dd><dt>${tt('Transparency')}</dt><dd>${esc(d.transparency)}</dd></dl>
      <div style="margin-top:.75rem">${d.url?`<a class="btn" href="${esc(d.url)}" target="_blank" rel="noopener">${tt('Donate on official page')}</a>`:`<button class="btn" disabled>${tt('Donation link pending verification')}</button>`}</div></article>`}).join('')}</div></section>
  <section class="panel s5"><div class="panel-h"><h2>${tt('Resource support')}</h2></div><ul class="list">${REQ_CATS.slice(0,8).map(([c,icn,d])=>`<li><span class="lead teal">${ic(icn)}</span><div class="body"><b>${tt(c)}</b><div class="meta">${tt(d)}</div></div><div class="side"><a class="btn sec sm" href="#c-newrequest" data-act="reqCat" data-arg="${esc(c)}">${tt('Request')}</a></div></li>`).join('')}</ul></section></div>`};
}
function pVolunteer(){
  const opps=state.opps.filter(v=>daysUntil(v.deadline)>=0&&v.status==='open');
  return{title:t('Volunteer'),crumbs:[[t('Home'),'home'],[t('Volunteer')]],html:`${phead(tt('Volunteer opportunities'),tt('Give your time to camps and community programmes run by participating organizations.'),me()?`<a class="btn" href="#c-volunteer">${ic('hand',16)}${tt('My volunteering')}</a>`:`<a class="btn" href="#register">${tt('Create an account to volunteer')}</a>`)}
  <div class="panel">${opps.length?`<ul class="list">${opps.map(oppRow).join('')}</ul>`:empty('hand',tt('No open opportunities'),tt('Check back soon.'))}</div>`};
}
function pResources(){return{title:t('Health resources'),crumbs:[[t('Home'),'home'],[t('Health resources')]],html:`${phead(tt('Health resources'),tt('Informational content only. It does not replace advice from a doctor.'))}
  <div class="g12"><section class="panel s7"><div class="panel-h"><h2>${tt('Official programmes and information')}</h2></div><ul class="list">${state.resources.map(r=>`<li><span class="lead">${ic('globe')}</span><div class="body"><a class="t" href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.title)}<span class="sr-only"> (${tt('opens in a new tab')})</span></a><div class="meta">${tt(r.desc)}</div><div class="xs muted">${esc(r.url)}</div></div></li>`).join('')}</ul></section>
  <section class="panel s5"><div class="panel-h"><h2>${tt('Awareness topics')}</h2></div><ul class="list">${[['Preventive healthcare','Regular screening for blood pressure, sugar and vision helps catch problems early.'],['Maternal and child health','Antenatal check-ups and timely immunisation protect mothers and babies.'],['Senior citizen wellness','Stay active, keep medicines organised, and have regular check-ups.']].map(([a,b])=>`<li><span class="lead teal">${ic('book')}</span><div class="body"><b>${tt(a)}</b><div class="meta">${tt(b)}</div></div></li>`).join('')}</ul></section></div>`}}
function pEmergency(){return{title:t('Emergency numbers'),crumbs:[[t('Home'),'home'],[t('Emergency numbers')]],html:`${phead(tt('Emergency numbers'),tt('National helplines. Some numbers vary by state, so confirm locally.'))}
  <div class="alert error"><strong>${tt('In a medical emergency, call 112 or 108 immediately.')}</strong></div><div class="panel"><table><thead><tr><th>${tt('Number')}</th><th>${tt('Service')}</th></tr></thead><tbody>${state.emergency.map(([n,d])=>`<tr><td><a class="ref" style="font-size:1.0625rem" href="tel:${n}">${n}</a></td><td>${tt(d)}</td></tr>`).join('')}</tbody></table></div>`}}

/* ---------- auth & onboarding ---------- */
function pLogin(){const tab=state.loginTab;const demo={citizen:['demo@example.com','demo1234'],org:['ngo@example.com','ngo12345'],admin:['admin@example.com','admin1234']}[tab];
  return{title:t('Log in'),crumbs:[[t('Home'),'home'],[t('Log in')]],html:`<div style="max-width:500px;margin:0 auto">${phead(tt('Log in'))}
  <div class="panel">${tabs('login',[['citizen',tt('Citizen')],['org',tt('Organization')],['admin',tt('Administrator')]],tab)}
  <form class="panel-b" data-form="login" data-arg="${tab}" novalidate><div class="alert"><strong>${tt('Demo account')}</strong><p><span class="ref">${demo[0]}</span> / <span class="ref">${demo[1]}</span></p></div><div id="login-msg"></div>
  ${fld('id',tab==='citizen'?tt('Email address or mobile number'):tt('Email address'),inp('id','','text','autocomplete="username"'))}${fld('pw',tt('Password'),inp('pw','','password','autocomplete="current-password"'))}
  <div class="between"><button class="btn" type="submit">${tt('Log in')}</button><button class="btn ghost sm" type="button" data-act="forgot">${tt('Forgot password?')}</button></div></form></div>
  <p class="small" style="margin-top:1rem">${tab==='org'?`${tt('New organization?')} <a href="#join">${tt('Register your organization')}</a>`:`${tt('New to ChikitsaSeva?')} <a href="#register">${tt('Create a citizen account')}</a>`}</p></div>`}}
function pRegister(){return{title:t('Create account'),crumbs:[[t('Home'),'home'],[t('Create account')]],html:`<div style="max-width:560px;margin:0 auto">${phead(tt('Create a citizen account'),tt('You need only your name and an email address or mobile number.'))}
  <form class="panel panel-b" data-form="signup" novalidate>${fld('name',tt('Full name'),inp('name','','text','autocomplete="name"'))}${fld('contact',tt('Email address or mobile number'),inp('contact','','text','autocomplete="email"'))}${fld('pw',tt('Password'),inp('pw','','password','autocomplete="new-password"'),tt('At least 8 characters, including a number.'))}${fld('pw2',tt('Confirm password'),inp('pw2','','password','autocomplete="new-password"'))}
  <div class="field"><label class="check"><input type="checkbox" name="terms"> ${tt('I agree to the Terms of Use and have read the Privacy Policy.')}</label><p class="err" id="err-terms" hidden></p></div><p class="xs muted">${tt('We never ask for Aadhaar or other ID numbers, or medical records, to create an account.')}</p><button class="btn" type="submit">${tt('Create account')}</button></form></div>`}}
function pJoin(){return{title:t('Register your organization'),crumbs:[[t('Home'),'home'],[t('Register your organization')]],html:`${phead(tt('Register your organization'),tt('Publish services, receive referrals and coordinate volunteers. Registration does not give a verified badge. ChikitsaSeva reviews every application.'))}
  <div class="layout r"><form class="panel panel-b" data-form="join" novalidate><fieldset><legend>${tt('Organization')}</legend><div class="fgrid">${fld('name',tt('Registered or legal name'),inp('name'),'','full')}${fld('type',tt('Organization category'),sel('type',['NGO','Hospital','Clinic','Diagnostic centre','Blood bank','Rehabilitation centre','Community group'].map(x=>[x,t(x)])))}${fld('regNo',tt('Registration number (if applicable)'),inp('regNo'))}${fld('website',tt('Website'),inp('website','','url','placeholder="https://"'))}</div></fieldset>
  <fieldset><legend>${tt('Contact')}</legend><div class="fgrid">${fld('person',tt('Contact person'),inp('person'))}${fld('email',tt('Official email'),inp('email','','email'))}${fld('pw',tt('Password for your workspace'),inp('pw','','password'),tt('At least 8 characters, including a number.'))}</div></fieldset>
  <fieldset><legend>${tt('Location and services')}</legend><div class="fgrid">${fld('city',tt('City'),inp('city'))}${fld('state',tt('State'),sel('state',STATES))}${fld('areas',tt('Areas served'),inp('areas'),tt('Separate with commas.'),'full')}</div><p class="label">${tt('Services provided')}</p><div class="choice">${ORG_CATS.map(c=>`<label><input type="checkbox" name="cats" value="${esc(c)}">${tt(c)}</label>`).join('')}</div><p class="err" id="err-cats" hidden></p>
  ${fld('about',tt('About your organization'),ta('about'),'','full')}</fieldset><button class="btn" type="submit">${tt('Submit for review')}</button></form>
  <aside class="panel panel-b"><h2 style="font-size:.9375rem">${tt('What happens next')}</h2><ol class="tl"><li><b>${tt('Unverified listing')}</b><div class="small muted">${tt('Your workspace is created straight away.')}</div></li><li><b>${tt('Verification pending')}</b><div class="small muted">${tt('Our team reviews your details and documents.')}</div></li><li><b>${tt('Verified by ChikitsaSeva')}</b><div class="small muted">${tt('Shown only after review is complete. This is not a government approval.')}</div></li></ol></aside></div>`}}

/* ---------- static ---------- */
function pStatic(k){
  const S={how:['How it works',`<ol class="panel steps4" style="margin:0;padding:0">${[['Discover a service','Search by need, location or category.'],['Review eligibility and details','Check who it is for, documents and dates.'],['Submit a request or registration','Register for a camp or request assistance.'],['Track progress and receive updates','Follow every status change in your portal.']].map(([a,b])=>`<li><b>${tt(a)}</b><p class="small muted">${tt(b)}</p></li>`).join('')}</ol>`],
    about:['About',`<div class="panel panel-b"><p>${tt('ChikitsaSeva is an independent public-service initiative. It brings together healthcare camps, providers, NGOs, welfare scheme information, volunteering and community support in one place.')}</p><p>${tt('It is not operated by, or affiliated with, any government department. Organization verification follows ChikitsaSeva’s own published process and is not a government approval.')}</p></div>`],
    help:['Help',`${[['How do I register for a camp?','Log in, open the camp and select “Register for camp”. You receive a reference straight away.'],['How do I request assistance?','Go to your citizen portal, open Assistance requests and select “New request”. You choose exactly which details are shared.'],['What does “Referred to organization” mean?','Your request was sent to an organization. It does not mean they have accepted it yet.'],['Is an appointment request a confirmed appointment?','No. The provider must confirm it. You will see the status change in your portal.'],['How do I change the language?','Use the “Language & display” button on public pages, or the language switch in your portal sidebar.']].map(([q,a])=>`<details class="faq"><summary>${tt(q)}</summary><div>${tt(a)}</div></details>`).join('')}`],
    contact:['Contact',`<div class="panel panel-b"><p>${tt('Verified contact details have not been published yet. We do not list unconfirmed phone numbers or email addresses.')}</p><p><a href="#emergency">${tt('Emergency numbers')}</a></p></div>`],
    privacy:['Privacy',`<div class="panel panel-b"><p style="color:var(--warning)">${tt('Draft for legal review.')}</p><p>${tt('We collect only what is needed to provide each service. Organizations see only the details you choose to share for a specific request. You can review and withdraw consent from your portal.')}</p></div>`],
    terms:['Terms',`<div class="panel panel-b"><p style="color:var(--warning)">${tt('Draft for legal review.')}</p><p>${tt('ChikitsaSeva provides information and coordination tools. It does not provide medical advice, decide scheme eligibility or guarantee any benefit.')}</p></div>`],
    accessibility:['Accessibility',`<div class="panel panel-b"><p>${tt('We aim to meet WCAG 2.1 Level AA: keyboard navigation, visible focus, adjustable text size, light and dark themes, and statuses shown with text as well as colour.')}</p><p>${tt('The citizen portal is fully available in English, Hindi and Marathi. Content written by organizations appears in the language they provided.')}</p></div>`],
    dataprotection:['Data protection',`<div class="panel panel-b"><p style="color:var(--warning)">${tt('Draft for legal review.')}</p><p>${tt('Purpose-based sharing, consent records, audit logging of administrative actions, and the right to access, correct and delete your data.')}</p></div>`]};
  const p=S[k];return{title:t(p[0]),crumbs:[[t('Home'),'home'],[t(p[0])]],html:phead(tt(p[0]))+p[1]};
}
const pNotFound=()=>({title:t('Page not found'),crumbs:[[t('Home'),'home'],[t('Page not found')]],html:phead(tt('Page not found'),tt('This page does not exist or is no longer available.'))+`<a class="btn" href="#home">${tt('Go to home page')}</a>`});
