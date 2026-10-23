/* ---------- citizen portal ---------- */
const noticeText=n=>{const p=Object.assign({},n.p);if(p.camp)p.camp=t(p.camp);if(p.status)p.status=t(p.status);if(p.opp)p.opp=t(p.opp);return t(n.k,p)};
const myNotices=z=>state.notices.filter(n=>n.citizenId===z.id).slice().sort((a,b)=>b.at.localeCompare(a.at));
function profileCompletion(z){const f=[['age','Age'],['district','District'],['state','State'],['interests','Healthcare interests'],['supportInterests','Support needs']];const miss=f.filter(([k])=>Array.isArray(z[k])?!z[k].length:(z[k]==null||z[k]===''));return{pct:Math.round((f.length-miss.length)/f.length*100),missing:miss.map(x=>x[1])}}
const forName=(z,r)=>r.memberId?(memberById(z,r.memberId)||{name:t('Family member')}).name:t('Myself');
function upcomingItems(z){
  const it=[];
  state.regs.filter(r=>r.citizenId===z.id&&r.status==='confirmed').forEach(r=>{const c=campById(r.campId);if(c&&daysUntil(c.date)>=0&&c.status!=='cancelled')it.push({date:c.date,title:t(c.title),meta:`${c.venue}, ${t(c.city)} · ${fmtT(c.start)}`,href:'camp-'+c.id,tag:t('Camp registration')})});
  state.appts.filter(a=>a.citizenId===z.id&&['requested','confirmed'].includes(a.status)&&daysUntil(a.date)>=0).forEach(a=>it.push({date:a.date,title:a.type==='callback'?t('Callback request'):t('Appointment request'),meta:`${orgById(a.orgId).name} · ${t(a.slot)}`,href:'c-apps',tag:t(AP_B[a.status][0]),warn:a.status==='requested'}));
  state.vapps.filter(a=>a.citizenId===z.id&&a.status==='accepted'&&a.hours==null).forEach(a=>{const v=oppById(a.oppId);if(daysUntil(v.date)>=0)it.push({date:v.date,title:t(v.title),meta:`${orgById(v.orgId).name} · ${fmtT(v.start)}`,href:'c-volunteer',tag:t('Volunteering')})});
  return it.sort((a,b)=>a.date.localeCompare(b.date));
}
function recList(z,recs){
  if(!recs.length)return empty('search',tt('No suggestions yet'),tt('Add your district and interests so we can suggest services. You can still browse everything.'),`<a class="btn sec" href="#c-profile">${tt('Update preferences')}</a> <a class="btn ghost" href="#c-find">${tt('Browse all services')}</a>`);
  return `<ul class="list">${recs.map(r=>{const i=itemInfo(r.kind,r.id);if(!i)return'';return `<li><span class="lead ${r.kind==='prog'||r.kind==='opp'?'teal':''}">${ic(i.icon)}</span><div class="body"><a class="t" href="#${i.href}">${esc(i.title)}</a><div class="meta">${esc(i.type)} · ${esc(i.sub)}</div><div>${r.why.map(w=>`<span class="reason">${ic('check',12)}${tt(w)}</span>`).join('')}</div></div><div class="side">${saveBtn(r.kind,r.id)}</div></li>`}).join('')}</ul>`;
}
function cHome(){
  const z=me();const comp=profileCompletion(z);
  const reqs=state.requests.filter(r=>r.citizenId===z.id&&r.status!=='draft').sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  const open=reqs.filter(r=>OPEN_REQ.includes(r.status));const infoReq=reqs.filter(r=>r.status==='info');
  const up=upcomingItems(z);const recsAll=z.personalize?matches(z):[];const rt=curTab('rec','all');
  const recs=recsAll.filter(r=>rt==='all'||r.kind===rt).slice(0,5);
  const unread=state.notices.filter(n=>n.citizenId===z.id&&!n.read).length;
  const regCount=state.regs.filter(r=>r.citizenId===z.id&&r.status==='confirmed'&&daysUntil(campById(r.campId).date)>=0&&campById(r.campId).status!=='cancelled').length;
  const apptCount=state.appts.filter(a=>a.citizenId===z.id&&['requested','confirmed'].includes(a.status)&&daysUntil(a.date)>=0).length;
  const hour=new Date().getHours();const greet=hour<12?'Good morning, {name}':hour<17?'Good afternoon, {name}':'Good evening, {name}';
  const hasLoc=state.geo&&state.geo.active;
  const html=`
  <div class="greet" style="margin-bottom:1.25rem">
    <div>
      <div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin-bottom:.35rem">
        <h1 tabindex="-1" style="margin:0">${tt(greet,{name:z.name.split(' ')[0]})}</h1>
        <div style="display:inline-flex;align-items:center;gap:.4rem;background:var(--surface);border:1px solid var(--border);padding:.2rem .65rem;border-radius:999px;font-size:.78rem">
          <span style="color:var(--success);font-size:.65rem">●</span>
          <span>${hasLoc?`<b>${esc(state.geo.display||state.geo.city)}</b>`:`<b>${esc(z.district||state.search.loc||'Pune')}</b>`}</span>
          <button class="btn ghost sm" style="padding:0 .2rem;font-size:.72rem" data-act="detectLocation" title="${tt('Detect live GPS location')}">${ic('pin',12)} ${tt('Detect')}</button>
        </div>
      </div>
      <p style="margin:0">${esc(new Date().toLocaleDateString(LOCALE[ui.lang],{weekday:'long',day:'numeric',month:'long',year:'numeric'}))} · ${tt('Overview of your assistance, camps & health schedule.')}</p>
    </div>
    <div class="row">
      <a class="btn" href="#c-newrequest">${ic('plus',16)}${tt('New assistance request')}</a>
      <a class="btn sec" href="#c-find">${ic('search',16)}${tt('Find services')}</a>
    </div>
  </div>

  ${!z.verified?`<div class="alert warning"><strong>${tt('Verify your account')}</strong><p>${tt('Enter the code sent to {c}. In this prototype the code is 123456.',{c:mask(z.contact)})}</p><form class="row" data-form="verify" novalidate style="align-items:flex-start"><div style="width:170px">${fld('code','',inp('code','','text',`inputmode="numeric" maxlength="6" aria-label="${tt('Verification code')}"`))}</div><button class="btn" type="submit">${tt('Verify account')}</button></form></div>`:''}
  ${infoReq.map(r=>`<div class="alert warning"><div class="between"><div><strong>${tt('{org} needs more information',{org:orgById(r.orgId).name})}</strong><p>${esc(r.infoQ)}</p></div><a class="btn sm" href="#creq-${r.id}">${tt('Respond')}</a></div></div>`).join('')}

  <!-- Summary Metric Strip -->
  <div class="panel strip" style="margin-bottom:1.5rem">
    <a href="#c-requests"><div class="l">${ic('inbox',15)}${tt('Open assistance requests')}</div><div class="v">${open.length}</div><div class="s">${infoReq.length?tt('{n} need your response',{n:infoReq.length}):tt('Active requests')}</div></a>
    <a href="#c-regs"><div class="l">${ic('camp',15)}${tt('Upcoming registrations')}</div><div class="v">${regCount}</div><div class="s">${tt('Medical check-up camps')}</div></a>
    <a href="#c-apps"><div class="l">${ic('calendar',15)}${tt('Appointments & callbacks')}</div><div class="v">${apptCount}</div><div class="s">${tt('Scheduled consultations')}</div></a>
    <a href="#c-notifs"><div class="l">${ic('bell',15)}${tt('Unread notifications')}</div><div class="v">${unread}</div><div class="s">${tt('Status updates')}</div></a>
  </div>

  <!-- Dashboard Grid -->
  <div class="g12">
    <!-- Left Main Column -->
    <div class="s7 stack" style="min-width:0">
      <!-- Active Requests -->
      <section class="panel">
        <div class="panel-h">
          <h2>${ic('inbox',16)} ${tt('My assistance requests')}</h2>
          <a class="small" href="#c-requests">${tt('View all')} (${reqs.length})</a>
        </div>
        ${reqs.length?`<div class="tw"><table><thead><tr><th>${tt('Request')}</th><th>${tt('For')}</th><th>${tt('Organization')}</th><th>${tt('Status')}</th><th>${tt('Updated')}</th></tr></thead><tbody>${reqs.slice(0,4).map(r=>`<tr><td><a href="#creq-${r.id}">${esc(r.title)}</a><br><span class="xs muted ref">${r.id}</span> <span class="xs muted">· ${tt(r.category)}</span></td><td class="small">${esc(forName(z,r))}</td><td class="small">${r.orgId?esc(orgById(r.orgId).name):`<span class="muted">${tt('Not yet assigned')}</span>`}</td><td>${reqBadge(r.status)}</td><td class="small muted">${rel(r.history[r.history.length-1].at)}</td></tr>`).join('')}</tbody></table></div>`:empty('inbox',tt('No requests yet'),tt('Ask for help with medicines, mobility aids, food support and more.'),`<a class="btn" href="#c-newrequest">${tt('New assistance request')}</a>`)}
      </section>

      <!-- Coming Up / Schedule -->
      <section class="panel">
        <div class="panel-h">
          <h2>${ic('calendar',16)} ${tt('Upcoming schedule')}</h2>
          <a class="small" href="#c-regs">${tt('Camp bookings')}</a>
        </div>
        <div class="panel-b">
          ${up.length?`<ol class="tl">${up.slice(0,4).map(i=>`<li class="${i.warn?'warn':'done'}"><div class="when">${fmtD(i.date)} · ${rel(i.date)}</div><a href="#${i.href}"><b>${esc(i.title)}</b></a><div class="xs muted">${esc(i.meta)}</div><span class="badge ${i.warn?'b-warning':'b-info'}" style="margin-top:.3rem">${esc(i.tag)}</span></li>`).join('')}</ol>`:`<p class="small muted" style="margin:0">${tt('No upcoming appointments or camps. Browse medical camps to register.')}</p>`}
        </div>
      </section>

      <!-- Recommendations -->
      <section class="panel">
        <div class="panel-h">
          <h2>${ic('sparkle',16)} ${tt('Recommended for you')}</h2>
          <a class="small" href="#c-profile">${tt('Change preferences')}</a>
        </div>
        ${z.personalize?tabs('rec',[['all',tt('All'),recsAll.length],['camp',tt('Camps'),recsAll.filter(r=>r.kind==='camp').length],['prog',tt('Programmes'),recsAll.filter(r=>r.kind==='prog').length],['scheme',tt('Schemes'),recsAll.filter(r=>r.kind==='scheme').length]],rt)+recList(z,recs):`<div class="panel-b"><p class="small muted">${tt('Personalised suggestions are turned off.')} <a href="#c-privacy">${tt('Change in Privacy & consent')}</a></p></div>`}
        <div class="panel-f xs muted">${tt('Suggestions use simple rules and your saved preferences. They are not official approvals or confirmation of eligibility.')}</div>
      </section>
    </div>

    <!-- Right Sidebar Column -->
    <div class="s5 stack" style="min-width:0">
      <!-- Quick Actions Grid -->
      <section class="panel">
        <div class="panel-h"><h2>${tt('Quick actions')}</h2></div>
        <div class="panel-b qa">
          ${[['camps','camp','Register for a camp'],['c-newrequest','inbox','Request assistance'],['c-resources','gift','Resource support'],['eligibility','check','Check eligibility'],['c-household','family','Family members'],['blood','drop','Blood donation'],['c-volunteer','hand','Volunteer'],['c-grievances','alert','Raise a concern'],['emergency','phone','Emergency numbers']].map(([h,i,l])=>`<a href="#${h}">${ic(i)}${tt(l)}</a>`).join('')}
        </div>
      </section>

      <!-- 24x7 Emergency Helplines -->
      <section class="panel" style="border-left:4px solid var(--error);box-shadow:0 2px 8px rgba(180,35,24,.08)">
        <div class="panel-h">
          <h2 style="color:var(--error);display:flex;align-items:center;gap:.4rem">${ic('phone',16)} ${tt('Emergency helplines (24x7)')}</h2>
          <a class="small" href="#emergency">${tt('All numbers')}</a>
        </div>
        <div class="panel-b">
          <ul style="list-style:none;padding:0;display:grid;gap:.6rem;margin:0">
            ${state.emergency.slice(0,4).map(([n,d])=>`<li style="display:flex;align-items:baseline;justify-content:space-between;border-bottom:1px solid var(--border);padding-bottom:.4rem"><div><a href="tel:${n}" style="font-weight:750;font-size:1.1rem;color:var(--error);text-decoration:none">${n}</a><div class="xs muted">${tt(d).split('(')[0].trim()}</div></div><a class="btn sec sm" href="tel:${n}" style="border-color:var(--error);color:var(--error)">${ic('phone',12)} ${tt('Call')}</a></li>`).join('')}
          </ul>
          <p class="xs muted" style="margin:.75rem 0 0">${tt('Tap to call directly. In any life-threatening emergency dial 112 immediately.')}</p>
        </div>
      </section>

      <!-- Frequently Asked Questions -->
      <section class="panel">
        <details class="faq" style="border:none;margin:0">
          <summary style="font-weight:600;padding:.85rem 1.1rem;display:flex;align-items:center;justify-content:space-between">
            <span>${ic('help',16)} ${tt('Frequently asked questions')}</span>
          </summary>
          <div style="padding:0 1.1rem 1rem">
            <dl style="display:grid;gap:.85rem;margin:0">
              ${[[tt('How do I register for a medical camp?'),tt('Open any camp page and click "Register for camp". You will receive an instant reference number.')],[tt('What does "Under review" mean?'),tt('ChikitsaSeva is verifying your request and matching you with a partner NGO or hospital.')],[tt('How do I add a family member?'),tt('Go to Family & household in the menu and click "Add member".')],[tt('How do I cancel a camp registration?'),tt('Open Camp registrations, choose your booking and click Cancel up to 1 day prior.')],[tt('Can I get free medicines?'),tt('Yes. Submit an assistance request under "Medicine assistance" with your prescription details.')]].map(([q,a])=>`<div><b class="small" style="display:block;margin-bottom:.2rem">${q}</b><p class="small muted" style="margin:0">${a}</p></div>`).join('')}
            </dl>
          </div>
        </details>
      </section>

      <!-- Profile Improvement -->
      ${comp.pct<100?`<section class="panel"><div class="panel-h"><h2>${tt('Profile completion')}</h2><span class="small num">${comp.pct}%</span></div><div class="panel-b"><div class="bar t"><span style="width:${comp.pct}%"></span></div><p class="small" style="margin:.5rem 0">${tt('Add: {f}',{f:comp.missing.map(m=>t(m)).join(', ')})}</p><a class="btn sec sm" href="#c-profile">${tt('Update profile')}</a></div></section>`:''}

      <!-- Recent Activity -->
      <section class="panel">
        <div class="panel-h"><h2>${tt('Recent activity')}</h2><a class="small" href="#c-notifs">${tt('All')}</a></div>
        <div class="panel-b"><ol class="tl">${myNotices(z).slice(0,3).map(n=>`<li class="done"><div class="when">${fmtS(n.at)}</div><span class="small">${esc(noticeText(n))}</span></li>`).join('')}</ol></div>
      </section>
    </div>
  </div>`;
  return{title:t('Dashboard'),sub:t('Citizen portal'),html};
}
function cFind(){
  const z=me();const s=state.search;const forId=state.findFor||'';const m=forId?memberById(z,forId):null;
  const recs=matches(z,{member:m}).slice(0,6);const R=searchResults(s.q,s.loc,s.cat);
  return{title:t('Find services'),sub:t('Citizen portal'),html:`${phead(tt('Find services'),tt('Search everything on ChikitsaSeva. Pick from the lists or type what you need.'))}
  <form class="panel panel-b disc-form five" style="margin-bottom:1rem" data-form="discover" data-arg="app" role="search">
    ${fld('dq',tt('What do you need?'),inp('dq',s.q,'search',`placeholder="${tt('For example: eye camp, medicines, wheelchair')}"`))}
    ${fld('dloc',tt('Location'),sel('dloc',locOptions(),s.loc,'',t('All locations')))}
    ${fld('dcat',tt('Service category'),sel('dcat',SEARCH_CATS.map(([v,l])=>[v,t(l)]),s.cat,'',t('All categories')))}
    ${fld('dfor',tt('Finding for'),sel('dfor',(z.members||[]).filter(x=>x.access!=='pending').map(x=>[x.id,`${x.name} (${t(x.relation)})`]),forId,'',t('Myself')))}
    <button class="btn" type="submit" style="min-height:2.4rem">${tt('Search')}</button></form>
  <div class="row" style="margin-bottom:1.25rem">${QUICK.map(([l,icn],i)=>`<button class="btn sec sm" data-act="quick" data-arg="${i}|app">${ic(icn,14)}${tt(l)}</button>`).join('')}</div>
  ${recs.length&&z.personalize?`<section class="panel" style="margin-bottom:1rem"><div class="panel-h"><h2>${m?tt('Suggested for {name}',{name:m.name}):tt('Suggested for you')}</h2><a class="small" href="#c-profile">${tt('Change preferences')}</a></div>${recList(z,recs)}</section>`:''}
  ${s.q||s.loc||s.cat?resultsHtml(R):`<p class="small muted">${tt('Choose a category or search to see results.')}</p>`}`};
}
function cRequests(){
  const z=me();const all=state.requests.filter(r=>r.citizenId===z.id);const tb=curTab('req','active');
  const g={active:all.filter(r=>OPEN_REQ.includes(r.status)&&r.status!=='info'),info:all.filter(r=>r.status==='info'),closed:all.filter(r=>['resolved','closed','withdrawn'].includes(r.status)),draft:all.filter(r=>r.status==='draft'),all:all.filter(r=>r.status!=='draft')};
  const list=g[tb].sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
  return{title:t('Assistance requests'),sub:t('Citizen portal'),html:`${phead(tt('Assistance requests'),tt('Ask participating organizations for help and follow every update.'),`<a class="btn" href="#c-newrequest">${ic('plus',16)}${tt('New request')}</a>`)}
  <section class="panel">${tabs('req',[['active',tt('Active'),g.active.length],['info',tt('Needs your response'),g.info.length],['closed',tt('Closed'),g.closed.length],['draft',tt('Drafts'),g.draft.length],['all',tt('All'),g.all.length]],tb)}
  ${list.length?`<div class="tw"><table><thead><tr><th>${tt('Reference')}</th><th>${tt('Request')}</th><th>${tt('For')}</th><th>${tt('Organization')}</th><th>${tt('Submitted')}</th><th>${tt('Status')}</th></tr></thead><tbody>${list.map(r=>`<tr><td class="ref">${r.id}</td><td><a href="#creq-${r.id}">${esc(r.title||t('Untitled draft'))}</a><br><span class="xs muted">${tt(r.category||'')}</span></td><td class="small">${esc(forName(z,r))}</td><td class="small">${r.orgId?esc(orgById(r.orgId).name):`<span class="muted">${tt('Not yet assigned')}</span>`}</td><td class="small">${fmtS(r.createdAt)}</td><td>${reqBadge(r.status)}</td></tr>`).join('')}</tbody></table></div>`:empty('inbox',tt('Nothing here'),tb==='info'?tt('No organization is waiting for information from you.'):tt('Requests you create will appear here.'),`<a class="btn sec" href="#c-newrequest">${tt('New request')}</a>`)}</section>
  <details class="faq" style="margin-top:1rem"><summary>${tt('What do the statuses mean?')}</summary><div><dl class="kv">${Object.keys(RS).map(k=>`<dt>${reqBadge(k)}</dt><dd class="small">${tt(RS[k][2])}</dd>`).join('')}</dl></div></details>`};
}
function cNewRequest(){
  const z=me();const d=state.draft||(state.draft={step:1,category:'',memberId:'',title:'',desc:'',contactPref:'Phone call',share:['name','contact','district'],orgId:''});
  const steps=['Type of help','Describe your need','Contact and sharing','Review and submit'];
  const eligible=state.orgs.filter(o=>o.acceptsRequests&&['verified','reviewed'].includes(o.verification)&&(!d.category||o.categories.some(c=>c===d.category||(d.category==='Medicine assistance'&&c==='Medicine assistance'))));
  let body='';
  if(d.step===1)body=`<fieldset><legend>${tt('What kind of help do you need?')}</legend><div class="choice">${REQ_CATS.map(([c,icn,desc])=>`<label><input type="radio" name="category" value="${esc(c)}" ${d.category===c?'checked':''}><span>${ic(icn,16)} <b>${tt(c)}</b><br><span class="xs muted">${tt(desc)}</span></span></label>`).join('')}</div><p class="err" id="err-category" hidden></p></fieldset>
    ${fld('memberId',tt('Who is this request for?'),sel('memberId',(z.members||[]).filter(m=>m.access!=='pending').map(m=>[m.id,`${m.name} (${t(m.relation)})`]),d.memberId,'',t('Myself')),tt('You can request help for family members you manage in Family & household.'))}`;
  if(d.step===2)body=`${fld('title',tt('Short title'),inp('title',d.title,'text',`maxlength="90" placeholder="${tt('For example: Monthly medicines for my mother')}"`))}${fld('desc',tt('Describe what you need'),ta('desc',d.desc,'rows="6"'),tt('Explain the situation in your own words. Do not include ID numbers or full medical records.'))}`;
  if(d.step===3)body=`<fieldset><legend>${tt('How should the organization contact you?')}</legend><div class="choice">${CONTACT_PREFS.map(c=>`<label><input type="radio" name="contactPref" value="${esc(c)}" ${d.contactPref===c?'checked':''}>${tt(c)}</label>`).join('')}</div></fieldset>
    <fieldset><legend>${tt('What can we share with the organization?')}</legend><p class="small muted">${tt('Only the details you tick are shared, and only with the organization handling this request. Your description is always shared.')}</p>${SHARE_FIELDS.map(([k,l])=>`<label class="check"><input type="checkbox" name="share" value="${k}" ${d.share.includes(k)?'checked':''} ${k==='name'?'disabled checked':''}> ${tt(l)}${k==='name'?` <span class="xs muted">(${tt('required')})</span>`:''}</label>`).join('')}<p class="err" id="err-share" hidden></p></fieldset>
    ${fld('orgId',tt('Preferred organization (optional)'),sel('orgId',eligible.map(o=>[o.id,`${o.name} · ${o.city} · ${t(VER[o.verification][0])}`]),d.orgId,'',t('Let ChikitsaSeva find a suitable organization')),tt('If you choose one, your request goes straight to them. They still need to accept it.'))}`;
  if(d.step===4){const o=d.orgId&&orgById(d.orgId);body=`<dl class="kv"><dt>${tt('Type of help')}</dt><dd>${tt(d.category)}</dd><dt>${tt('For')}</dt><dd>${esc(d.memberId?memberById(z,d.memberId).name:t('Myself'))}</dd><dt>${tt('Title')}</dt><dd>${esc(d.title)}</dd><dt>${tt('Description')}</dt><dd>${esc(d.desc)}</dd><dt>${tt('Contact method')}</dt><dd>${tt(d.contactPref)}</dd><dt>${tt('Details shared')}</dt><dd>${['name',...d.share.filter(s=>s!=='name')].map(k=>t(SHARE_FIELDS.find(f=>f[0]===k)[1])).join(', ')}</dd><dt>${tt('Organization')}</dt><dd>${o?esc(o.name):tt('ChikitsaSeva will find a suitable organization')}</dd></dl>
    <div class="alert" style="margin-top:1rem"><p>${tt('Submitting a request does not guarantee assistance. You will see each status change in your portal.')}</p></div><label class="check"><input type="checkbox" name="consent"> ${tt('I consent to sharing the details above with the organization handling this request, for this purpose only.')}</label><p class="err" id="err-consent" hidden></p>`}
  return{title:t('New assistance request'),sub:t('Assistance requests'),navKey:'c-requests',crumbs:[[t('Assistance requests'),'c-requests'],[t('New request')]],html:`${phead(tt('New assistance request'))}
  <ol class="stepper">${steps.map((s,i)=>`<li class="${i+1<d.step?'done':''}" ${i+1===d.step?'aria-current="step"':''}>${tt(s)}</li>`).join('')}</ol>
  <form class="panel" data-form="reqStep" novalidate style="max-width:860px"><div class="panel-b">${body}</div><div class="panel-f between"><div class="row">${d.step>1?`<button class="btn sec" type="button" data-act="reqBack">${tt('Back')}</button>`:''}<button class="btn ghost" type="button" data-act="reqDraft">${tt('Save as draft')}</button></div><button class="btn" type="submit">${d.step<4?tt('Continue'):tt('Submit request')}</button></div></form>`};
}
function cReqDetail(id){
  const z=me();const r=reqById(id);if(!r||r.citizenId!==z.id)return null;
  if(r.status==='draft'){state.draft=Object.assign({step:1},r,{_id:r.id});return cNewRequest()}
  const o=r.orgId&&orgById(r.orgId);const canWithdraw=['review','referred','info','accepted'].includes(r.status);
  const refs=state.referrals.filter(x=>x.requestId===r.id);
  return{title:r.id,sub:t('Assistance requests'),navKey:'c-requests',crumbs:[[t('Assistance requests'),'c-requests'],[r.id]],html:`<div class="phead"><div><div class="row" style="margin-bottom:.35rem"><span class="ref">${r.id}</span>${reqBadge(r.status)}</div><h1 tabindex="-1">${esc(r.title)}</h1><p>${tt(RS[r.status][2])}</p></div>${canWithdraw?`<button class="btn sec" data-act="withdrawReq" data-arg="${r.id}">${tt('Withdraw request')}</button>`:''}</div>
  ${r.status==='info'?`<form class="alert warning" data-form="infoReply" data-arg="${r.id}" novalidate><strong>${tt('{org} asked for more information',{org:o.name})}</strong><p>${esc(r.infoQ)}</p>${fld('reply',tt('Your response'),ta('reply','','rows="3"'),tt('Do not include ID numbers or full medical records.'))}<button class="btn" type="submit">${tt('Send response')}</button></form>`:''}
  <div class="layout r"><div class="stack">
    <section class="panel"><div class="panel-h"><h2>${tt('Progress')}</h2></div><div class="panel-b"><ol class="tl">${r.history.map((h,i)=>`<li class="${h.status==='info'?'warn':'done'}"><div class="when">${fmtD(h.at)} · ${esc(h.by==='You'?t('You'):h.by==='Citizen'?t('You'):h.by)}</div>${reqBadge(h.status)}<p class="small" style="margin:.3rem 0 0">${esc(noteText(h.note))}</p></li>`).join('')}</ol></div></section>
    <section class="panel"><div class="panel-h"><h2>${tt('Request details')}</h2></div><div class="panel-b"><dl class="kv"><dt>${tt('Type of help')}</dt><dd>${tt(r.category)}</dd><dt>${tt('For')}</dt><dd>${esc(forName(z,r))}</dd><dt>${tt('Description')}</dt><dd>${esc(r.desc)}</dd><dt>${tt('Contact method')}</dt><dd>${tt(r.contactPref)}</dd><dt>${tt('Submitted')}</dt><dd>${fmtD(r.createdAt)}</dd></dl></div></section>
  </div><aside class="stack">
    <div class="panel"><div class="panel-h"><h2>${tt('Organization')}</h2></div><div class="panel-b">${o?`<div class="row">${avatar(o)}<div><a href="#org-${o.id}"><b>${esc(o.name)}</b></a><br>${verBadge(o)}</div></div>${r.status==='referred'?`<p class="small muted" style="margin-top:.6rem">${tt('The organization has not accepted this request yet.')}</p>`:''}`:`<p class="small muted">${tt('ChikitsaSeva is finding a suitable organization.')}</p>`}</div></div>
    <div class="panel"><div class="panel-h"><h2>${tt('Shared with the organization')}</h2></div><div class="panel-b"><ul style="padding-left:1.1rem" class="small">${SHARE_FIELDS.map(([k,l])=>`<li>${tt(l)}: <b>${r.share.includes(k)?tt('Shared'):tt('Not shared')}</b></li>`).join('')}</ul><a class="small" href="#c-privacy">${tt('Manage consent')}</a></div></div>
    ${['resolved','closed'].includes(r.status)&&r.orgId?`<div class="panel"><div class="panel-h"><h2>${tt('Rate this service')}</h2></div><div class="panel-b">${rateCell('request',r.id)}</div></div>`:''}
    ${refs.length?`<div class="panel"><div class="panel-h"><h2>${tt('Referrals')}</h2></div><div class="panel-b small">${refs.map(f=>`<p>${tt('Referred to {org} on {d}.',{org:orgById(f.toOrg).name,d:fmtS(f.date)})}</p>`).join('')}</div></div>`:''}
  </aside></div>`};
}
function cRegs(){
  const z=me();const tb=curTab('regs','upcoming');const all=state.regs.filter(r=>r.citizenId===z.id).map(r=>({r,c:campById(r.campId)})).filter(x=>x.c);
  const g={upcoming:all.filter(x=>x.r.status==='confirmed'&&daysUntil(x.c.date)>=0&&x.c.status!=='cancelled'),completed:all.filter(x=>['attended','no-show'].includes(x.r.status)||(x.r.status==='confirmed'&&daysUntil(x.c.date)<0)),cancelled:all.filter(x=>x.r.status==='cancelled'||x.c.status==='cancelled'),all};
  const l=g[tb].sort((a,b)=>b.c.date.localeCompare(a.c.date));
  return{title:t('Camp registrations'),sub:t('Citizen portal'),html:`${phead(tt('Camp registrations'),tt('Your camp bookings, references and attendance.'),`<a class="btn" href="#camps">${ic('camp',16)}${tt('Find a camp')}</a>`)}
  <section class="panel">${tabs('regs',[['upcoming',tt('Upcoming'),g.upcoming.length],['completed',tt('Completed'),g.completed.length],['cancelled',tt('Cancelled'),g.cancelled.length],['all',tt('All'),all.length]],tb)}
  ${l.length?`<div class="tw"><table><thead><tr><th>${tt('Camp')}</th><th>${tt('Date')}</th><th>${tt('Reference')}</th><th>${tt('Status')}</th><th></th></tr></thead><tbody>${l.map(({r,c})=>`<tr><td><a href="#camp-${c.id}">${tt(c.title)}</a><br><span class="xs muted">${esc(c.venue)}, ${tt(c.city)}</span></td><td class="small">${fmtD(c.date)}<br><span class="muted">${fmtT(c.start)}</span></td><td class="ref">${r.ref}</td><td>${c.status==='cancelled'&&r.status==='confirmed'?`<span class="badge b-error">${tt('Camp cancelled')}</span>`:regBadge(r.status)}</td><td>${canCancelReg(r,c)?`<button class="btn sec sm" data-act="cancelReg" data-arg="${r.ref}">${tt('Cancel')}</button>`:r.status==='attended'?rateCell('camp',c.id):''}</td></tr>`).join('')}</tbody></table></div>`:empty('camp',tt('No registrations here'),tt('Registrations you make will be listed with their reference numbers.'),`<a class="btn sec" href="#camps">${tt('Find a camp')}</a>`)}</section>`};
}
function cApps(){
  const z=me();const ap=state.appts.filter(a=>a.citizenId===z.id).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));const va=state.vapps.filter(a=>a.citizenId===z.id);
  return{title:t('Appointments & applications'),sub:t('Citizen portal'),html:`${phead(tt('Appointments & applications'),tt('Appointment and callback requests to providers, and your volunteer applications.'))}
  <div class="alert"><p>${tt('An appointment request is not a confirmed appointment. The provider must confirm it first.')}</p></div>
  <section class="panel" style="margin-bottom:1.25rem"><div class="panel-h"><h2>${tt('Appointment and callback requests')}</h2><a class="small" href="#services">${tt('Find a provider')}</a></div>
  ${ap.length?`<div class="tw"><table><thead><tr><th>${tt('Reference')}</th><th>${tt('Provider')}</th><th>${tt('Type')}</th><th>${tt('Preferred date')}</th><th>${tt('Status')}</th><th></th></tr></thead><tbody>${ap.map(a=>`<tr><td class="ref">${a.id}</td><td><a href="#org-${a.orgId}">${esc(orgById(a.orgId).name)}</a></td><td class="small">${a.type==='callback'?tt('Callback request'):tt('Appointment request')}</td><td class="small">${fmtD(a.date)} · ${tt(a.slot)}${a.confirmedTime?`<br><b>${tt('Confirmed for {t}',{t:a.confirmedTime})}</b>`:''}</td><td>${apBadge(a.status)}</td><td>${['requested','confirmed'].includes(a.status)&&daysUntil(a.date)>=1?`<button class="btn sec sm" data-act="cancelAppt" data-arg="${a.id}">${tt('Cancel')}</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:empty('cal',tt('No appointment requests'),tt('You can request an appointment or callback from a provider’s page.'))}</section>
  <section class="panel"><div class="panel-h"><h2>${tt('Volunteer applications')}</h2><a class="small" href="#c-volunteer">${tt('Volunteering')}</a></div>${vappsTable(va)}</section>`};
}
function vappsTable(va){return va.length?`<div class="tw"><table><thead><tr><th>${tt('Opportunity')}</th><th>${tt('Organization')}</th><th>${tt('Date')}</th><th>${tt('Status')}</th><th></th></tr></thead><tbody>${va.map(a=>{const v=oppById(a.oppId);return `<tr><td>${tt(v.title)}<br><span class="xs muted">${tt(v.activity)}</span></td><td class="small">${esc(orgById(v.orgId).name)}</td><td class="small">${fmtD(v.date)}</td><td>${vaBadge(a)}${a.hours!=null?`<br><span class="xs muted">${tt('{h} hours approved',{h:a.hours})}</span>`:''}</td><td>${a.status==='applied'?`<button class="btn sec sm" data-act="withdrawVapp" data-arg="${a.id}">${tt('Withdraw')}</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`:empty('hand',tt('No applications yet'),tt('Apply for an opportunity to see it here.'),`<a class="btn sec" href="#volunteer">${tt('Browse opportunities')}</a>`)}
function cSaved(){const z=me();const items=z.saved.map(s=>{const[k,id]=s.split(':');return{k,id,i:itemInfo(k,id)}}).filter(x=>x.i);
  return{title:t('Saved services'),sub:t('Citizen portal'),html:`${phead(tt('Saved services'),tt('Services you bookmarked for later.'))}<section class="panel">${items.length?`<ul class="list">${items.map(({k,id,i})=>`<li><span class="lead">${ic(i.icon)}</span><div class="body"><a class="t" href="#${i.href}">${esc(i.title)}</a><div class="meta">${esc(i.type)} · ${esc(i.sub)}</div></div><div class="side"><button class="btn ghost sm" data-act="save" data-arg="${k}:${id}">${tt('Remove')}</button></div></li>`).join('')}</ul>`:empty('bookmark',tt('Nothing saved yet'),tt('Use “Save” on any camp, organization or scheme.'),`<a class="btn sec" href="#c-find">${tt('Find services')}</a>`)}</section>`}}
function cNotifs(){const z=me();const l=myNotices(z);
  return{title:t('Notifications'),sub:t('Citizen portal'),html:`${phead(tt('Notifications'),tt('Status updates about your registrations, requests and applications.'),l.some(n=>!n.read)?`<button class="btn sec" data-act="readAll">${tt('Mark all as read')}</button>`:'')}<section class="panel">${l.length?`<ul class="list">${l.map(n=>`<li style="${n.read?'':'background:var(--info-bg)'}"><span class="lead">${ic('bell')}</span><div class="body"><span class="${n.read?'':'t'}" style="${n.read?'':'font-weight:600'}">${esc(noticeText(n))}</span><div class="meta">${fmtD(n.at)} · ${rel(n.at)}</div></div><div class="side">${n.read?`<span class="xs muted">${tt('Read')}</span>`:`<span class="badge b-info">${tt('New')}</span>`}</div></li>`).join('')}</ul>`:empty('bell',tt('No notifications'),tt('Updates will appear here.'))}</section>
  <p class="xs muted" style="margin-top:.75rem">${tt('Email and SMS delivery are not connected in this prototype.')}</p>`}}
const RELATIONS=['Mother','Father','Spouse','Son','Daughter','Grandparent','Sibling','Other'];
function cHousehold(){const z=me();const ms=z.members||[];
  const acc={guardian:['You manage this profile as parent or guardian','b-info'],consented:['Consent given','b-success'],pending:['Waiting for their consent','b-warning']};
  return{title:t('Family & household'),sub:t('Citizen portal'),html:`${phead(tt('Family & household'),tt('Find services and track requests for people you support. Adults must give their own consent before you can act for them.'),`<button class="btn" data-act="addMember">${ic('plus',16)}${tt('Add family member')}</button>`)}
  <section class="panel">${ms.length?`<div class="tw"><table><thead><tr><th>${tt('Name')}</th><th>${tt('Relation')}</th><th>${tt('Age')}</th><th>${tt('Access')}</th><th>${tt('Requests')}</th><th></th></tr></thead><tbody>${ms.map(m=>`<tr><td><b>${esc(m.name)}</b></td><td>${tt(m.relation)}</td><td class="num">${m.age}</td><td><span class="badge ${acc[m.access][1]}">${tt(acc[m.access][0])}</span>${m.consentOn?`<br><span class="xs muted">${fmtS(m.consentOn)}</span>`:''}</td><td class="num">${state.requests.filter(r=>r.memberId===m.id).length}</td><td><div class="row" style="gap:.3rem">${m.access==='pending'?`<button class="btn sm" data-act="recordConsent" data-arg="${m.id}">${tt('Record consent')}</button>`:`<button class="btn sec sm" data-act="findFor" data-arg="${m.id}">${tt('Find services')}</button>`}<button class="btn ghost sm" data-act="removeMember" data-arg="${m.id}">${tt('Remove')}</button></div></td></tr>`).join('')}</tbody></table></div>`:empty('family',tt('No family members added'),tt('Add a child or an adult who has agreed to let you help them.'))}</section>
  <div class="alert" style="margin-top:1rem"><p>${tt('You cannot view another adult’s personal information unless they consent. Children’s profiles are managed by a parent or guardian.')}</p></div>`}}
function cProfile(){const z=me();const comp=profileCompletion(z);const locs=locOptions();
  return{title:t('Profile & preferences'),sub:t('Citizen portal'),html:`${phead(tt('Profile & preferences'),tt('These details are used only to suggest relevant services and manage your requests.'))}
  <div class="layout r"><form class="panel" data-form="profile" novalidate><div class="panel-b">
    <fieldset><legend>${tt('Personal details')}</legend><div class="fgrid">${fld('name',tt('Full name'),inp('name',z.name),'','full')}${fld('age',tt('Age'),inp('age',z.age??'','number','min="1" max="120"'),tt('Optional.'))}${fld('lang',tt('Preferred language'),sel('lang',LANGS.map(l=>[l,t(l)]),z.lang))}${fld('district',tt('District'),sel('district',locs.map(([c])=>[c,t(c)]),z.district,'',t('Select')))}${fld('state',tt('State'),sel('state',STATES.map(s=>[s,t(s)]),z.state))}${fld('pin',tt('PIN code'),inp('pin',z.pin,'text','inputmode="numeric" maxlength="6"'),tt('Optional.'))}</div></fieldset>
    <fieldset><legend>${tt('Healthcare interests')}</legend><div class="choice">${CAMP_CATS.map(c=>`<label><input type="checkbox" name="interests" value="${esc(c)}" ${z.interests.includes(c)?'checked':''}>${tt(c)}</label>`).join('')}</div></fieldset>
    <fieldset><legend>${tt('Support needs')}</legend><div class="choice">${ORG_CATS.map(c=>`<label><input type="checkbox" name="supportInterests" value="${esc(c)}" ${(z.supportInterests||[]).includes(c)?'checked':''}>${tt(c)}</label>`).join('')}</div></fieldset>
    <fieldset><legend>${tt('Notifications')}</legend>${[['onscreen','In my portal'],['email','Email'],['sms','SMS']].map(([k,l])=>`<label class="check"><input type="checkbox" name="n_${k}" ${z.notify[k]?'checked':''}> ${tt(l)}</label>`).join('')}</fieldset>
    ${fld('a11y',tt('Accessibility needs at camps (optional)'),inp('a11y',z.a11y),tt('Shared with an organizer only when you register for their camp.'))}
  </div><div class="panel-f"><button class="btn" type="submit">${tt('Save changes')}</button></div></form>
  <aside class="stack"><div class="panel panel-b"><p class="label">${tt('Profile completion')}</p><div class="bar t"><span style="width:${comp.pct}%"></span></div><p class="small" style="margin:.5rem 0 0"><b class="num">${comp.pct}%</b>${comp.missing.length?' · '+tt('Missing: {f}',{f:comp.missing.map(m=>t(m)).join(', ')}):''}</p><p class="xs muted" style="margin-top:.5rem">${tt('A complete profile improves suggestions. It is not government verification or proof of eligibility.')}</p></div>
  <div class="panel panel-b"><p class="label">${tt('Account')}</p><dl class="kv"><dt>${tt('Sign-in')}</dt><dd>${esc(mask(z.contact))}</dd><dt>${tt('Status')}</dt><dd>${z.verified?`<span class="badge b-success">${tt('Verified')}</span>`:`<span class="badge b-warning">${tt('Not verified')}</span>`}</dd><dt>${tt('Member since')}</dt><dd>${fmtS(z.createdAt)}</dd></dl></div></aside></div>`}}
function cPrivacy(){const z=me();const reqs=state.requests.filter(r=>r.citizenId===z.id&&r.orgId);const refs=state.referrals.filter(f=>reqs.some(r=>r.id===f.requestId));
  return{title:t('Privacy & consent'),sub:t('Citizen portal'),html:`${phead(tt('Privacy & consent'),tt('See who can see your information and why, and change your choices.'))}
  <section class="panel" style="margin-bottom:1.25rem"><div class="panel-h"><h2>${tt('Information shared with organizations')}</h2></div>${reqs.length?`<div class="tw"><table><thead><tr><th>${tt('Request')}</th><th>${tt('Organization')}</th><th>${tt('Purpose')}</th><th>${tt('Details shared')}</th><th></th></tr></thead><tbody>${reqs.map(r=>`<tr><td><a href="#creq-${r.id}">${r.id}</a><br>${reqBadge(r.status)}</td><td class="small">${esc(orgById(r.orgId).name)}</td><td class="small">${tt(r.category)}</td><td class="small">${r.share.map(k=>t(SHARE_FIELDS.find(f=>f[0]===k)[1])).join(', ')}</td><td>${OPEN_REQ.includes(r.status)&&r.share.length>1?`<button class="btn sec sm" data-act="limitShare" data-arg="${r.id}">${tt('Share name only')}</button>`:''}</td></tr>`).join('')}</tbody></table></div>`:`<div class="panel-b small muted">${tt('Nothing shared yet.')}</div>`}</section>
  ${refs.length?`<section class="panel" style="margin-bottom:1.25rem"><div class="panel-h"><h2>${tt('Referrals between organizations')}</h2></div><div class="tw"><table><thead><tr><th>${tt('Request')}</th><th>${tt('From')}</th><th>${tt('To')}</th><th>${tt('Details shared')}</th><th>${tt('Consent')}</th></tr></thead><tbody>${refs.map(f=>`<tr><td>${f.requestId}</td><td class="small">${esc(orgById(f.fromOrg).name)}</td><td class="small">${esc(orgById(f.toOrg).name)}</td><td class="small">${f.shared.map(k=>t(SHARE_FIELDS.find(x=>x[0]===k)[1])).join(', ')}</td><td><span class="badge b-success">${tt('Given')}</span></td></tr>`).join('')}</tbody></table></div></section>`:''}
  <div class="g12"><section class="panel s6"><div class="panel-h"><h2>${tt('Personalised suggestions')}</h2></div><div class="panel-b"><p class="small">${tt('We use your district, age and interests to suggest services. Turning this off does not stop you from browsing everything.')}</p><label class="check"><input type="checkbox" data-act="togglePersonalize" ${z.personalize?'checked':''}> ${tt('Use my profile to suggest services')}</label></div></section>
  <section class="panel s6"><div class="panel-h"><h2>${tt('Your account data')}</h2></div><div class="panel-b"><p class="small">${tt('We store your name, contact details, optional profile details, registrations, requests and consent choices. We do not store ID numbers or medical records.')}</p>${z.deletion?`<div class="alert warning" style="margin:0"><strong>${tt('Deletion requested')}</strong><p>${tt('An administrator will process your request.')}</p></div>`:`<button class="btn danger sm" data-act="requestDelete">${tt('Request account deletion')}</button>`}</div></section></div>`}}
const SKILLS=['Basic computer use','Marathi','Hindi','English','First aid','Food handling','Public speaking','Patience and listening','Driving'];
function cVolunteer(){const z=me();
  if(!z.volunteer)return{title:t('Volunteering'),sub:t('Citizen portal'),html:`${phead(tt('Become a volunteer'),tt('Tell us a little about yourself. We only ask what organizations need to match you with activities.'))}
    <form class="panel" data-form="volReg" novalidate style="max-width:860px"><div class="panel-b"><fieldset><legend>${tt('Skills')}</legend><div class="choice">${SKILLS.map(s=>`<label><input type="checkbox" name="skills" value="${esc(s)}">${tt(s)}</label>`).join('')}</div><p class="err" id="err-skills" hidden></p></fieldset>
    <div class="fgrid">${fld('availability',tt('Availability'),sel('availability',['Weekday mornings','Weekday evenings','Weekends','Flexible'].map(x=>[x,t(x)])))}${fld('area',tt('General location'),sel('area',locOptions().map(([c])=>[c,t(c)]),z.district))}</div>
    ${fld('experience',tt('Experience (optional)'),ta('experience','','rows="3"'))}</div><div class="panel-f"><button class="btn" type="submit">${tt('Register as volunteer')}</button></div></form>`};
  const va=state.vapps.filter(a=>a.citizenId===z.id);const recs=matches(z).filter(r=>r.kind==='opp');const hrs=va.reduce((s,a)=>s+(a.hours||0),0);
  return{title:t('Volunteering'),sub:t('Citizen portal'),html:`${phead(tt('Volunteering'),tt('Your opportunities, applications and recorded participation.'),`<a class="btn" href="#volunteer">${tt('Browse opportunities')}</a>`)}
  <div class="panel strip" style="margin-bottom:1.25rem"><div><div class="l">${tt('Applications')}</div><div class="v">${va.length}</div></div><div><div class="l">${tt('Accepted')}</div><div class="v">${va.filter(a=>a.status==='accepted').length}</div></div><div><div class="l">${tt('Approved hours')}</div><div class="v">${hrs}</div><div class="s">${tt('Only hours recorded by an organization')}</div></div></div>
  <div class="g12"><section class="panel s7"><div class="panel-h"><h2>${tt('Recommended opportunities')}</h2></div>${recs.length?`<ul class="list">${recs.map(r=>{const v=oppById(r.id);return oppRow(v).replace('<div class="small"',`<div>${r.why.map(w=>`<span class="reason">${ic('check',12)}${tt(w)}</span>`).join('')}</div><div class="small"`)}).join('')}</ul>`:empty('hand',tt('No matches right now'),tt('Browse all opportunities instead.'))}</section>
  <section class="panel s5"><div class="panel-h"><h2>${tt('My volunteer profile')}</h2></div><div class="panel-b"><dl class="kv"><dt>${tt('Skills')}</dt><dd>${z.volunteer.skills.map(s=>t(s)).join(', ')}</dd><dt>${tt('Availability')}</dt><dd>${tt(z.volunteer.availability)}</dd><dt>${tt('Location')}</dt><dd>${tt(z.volunteer.area)}</dd></dl></div></section>
  <section class="panel s12"><div class="panel-h"><h2>${tt('Applications and history')}</h2></div>${vappsTable(va)}</section></div>`};
}
