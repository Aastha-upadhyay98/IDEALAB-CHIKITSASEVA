/* ---------- router ---------- */
const PUB={home:pHome,search:pSearch,services:pServices,camps:pCamps,ngos:pNgos,schemes:pSchemes,eligibility:()=>pEligibility(null),community:pCommunity,volunteer:pVolunteer,resources:pResources,emergency:pEmergency,login:pLogin,register:pRegister,join:pJoin};
['how','about','help','contact','privacy','terms','accessibility','dataprotection'].forEach(k=>PUB[k]=()=>pStatic(k));
const CIT={'c-home':cHome,'c-find':cFind,'c-requests':cRequests,'c-newrequest':cNewRequest,'c-regs':cRegs,'c-apps':cApps,'c-saved':cSaved,'c-notifs':cNotifs,'c-household':cHousehold,'c-profile':cProfile,'c-privacy':cPrivacy,'c-volunteer':cVolunteer};
const ORG={'o-home':oHome,'o-requests':oRequests,'o-referrals':oReferrals,'o-programs':oPrograms,'o-volunteers':oVolunteers,'o-camps':oCamps,'o-donations':oDonations,'o-profile':oProfile,'o-reports':oReports,'o-team':oTeam};
const ADM={'a-home':aHome,'a-requests':aRequests,'a-orgs':aOrgs,'a-camps':aCamps,'a-regs':aRegs,'a-schemes':aSchemes,'a-citizens':aCitizens,'a-reports':aReports,'a-audit':aAudit};
const LEGACY={dashboard:'c-home',profile:'c-profile',myregs:'c-regs',admin:'a-home',nearby:'c-find'};
let firstRender=true,fabOpen=false;
const IN_APP=['camps','services','ngos','schemes','eligibility','community','volunteer','resources','emergency','search'];
function render(){
  let r=location.hash.slice(1)||'home';if(LEGACY[r]){location.replace('#'+LEGACY[r]);return}
  const m=r.match(/^(camp|scheme|elig|org|creq)-(.+)$/);const base=m?m[1]:r,arg=m?m[2]:null;
  const role=r.startsWith('c-')||base==='creq'?'citizen':r.startsWith('o-')?'org':r.startsWith('a-')?'admin':null;
  if(role&&(!state.user||state.user.type!==role)){state.after=r;state.loginTab=role;toast(t('Log in to continue.'));location.hash='login';return}
  const z=me();let P,appRole=role;
  if(role==='citizen')P=base==='creq'?cReqDetail(arg):CIT[r]();
  else if(role==='org')P=(ORG[r]||(()=>null))();
  else if(role==='admin')P=(ADM[r]||(()=>null))();
  else if(z&&['camp','org','scheme'].includes(base)){appRole='citizen';P={camp:campDetail,org:orgDetail,scheme:schemeDetail}[base](arg,true);if(P){P.navKey='c-find';P.sub=t('Citizen portal')}}
  else if(z&&(IN_APP.includes(r)||base==='elig')){appRole='citizen';P=base==='elig'?pEligibility(arg):PUB[r]();P.navKey=r==='camps'?'c-regs':'c-find';P.sub=t('Citizen portal');P.full=false;if(r==='search'){location.replace('#c-find');return}}
  else if(base==='camp')P=campDetail(arg);else if(base==='org')P=orgDetail(arg);else if(base==='scheme')P=schemeDetail(arg);else if(base==='elig')P=pEligibility(arg);
  else P=(PUB[r]||pNotFound)();
  if(!P)P=pNotFound();
  document.title=`${P.title} · ChikitsaSeva`;
  if(appRole){$('#app').innerHTML=appShell(appRole,r,P);$('#fab-root').innerHTML=''}
  else{$('#app').innerHTML=publicHeader(base)+`<main id="main" tabindex="-1">${P.full?P.html:`<div class="wrap">${P.crumbs?crumbs(P.crumbs):''}${P.html}</div>`}</main>`+publicFooter();$('#fab-root').innerHTML=fabHtml(fabOpen)}
  if(P.mount)P.mount();
  if(!firstRender){window.scrollTo(0,0);const h=$('#main h1');if(h)h.focus({preventScroll:true})}
  firstRender=false;
}
function go(tok){if(location.hash.slice(1)===tok)render();else location.hash=tok}
function rerenderKeep(){const y=window.scrollY;firstRender=true;render();window.scrollTo(0,y)}
const actor=()=>state.user.type==='admin'?ADMINS[0].name:state.user.type==='org'?`${state.orgUsers.find(u=>u.orgId===state.user.orgId).name} (${myOrg().name})`:me().name+' (citizen)';
function closePops(){$$('.ddm.open').forEach(d=>{d.classList.remove('open');const b=$(`[aria-controls="${d.id}"]`);if(b)b.setAttribute('aria-expanded','false')});['#notif-pop','#profile-pop'].forEach(s=>{const p=$(s);if(p&&p.innerHTML){p.innerHTML='';const b=p.previousElementSibling;if(b)b.setAttribute('aria-expanded','false')}})}

/* ---------- actions ---------- */
const ACT={
  skip(){const m=$('#main');if(m)m.focus()},
  lang(v){ui.lang=v;saveUi();applyUi();rerenderKeep();const b=$(`[data-act="lang"][data-arg="${v}"]`);if(b)b.focus();toast(t('Language changed'),'success')},
  fs(v){ui.fs=Number(v);saveUi();applyUi();rerenderKeep()},
  theme(v){ui.theme=v;saveUi();applyUi();rerenderKeep()},
  fab(){fabOpen=!fabOpen;$('#fab-root').innerHTML=fabHtml(fabOpen);$('.fab').focus()},
  displayModal(){openModal(displayControls()+`<div class="m-actions"><button class="btn" data-act="close">${tt('Done')}</button></div>`,{label:t('Language & display')})},
  drawer(){$('#overlay-root').innerHTML=drawerHtml();$('.drawer a').focus()},
  closeDrawer(){$('#overlay-root').innerHTML=''},
  navOpen(){$('#app-shell').classList.add('nav-open');$('#overlay-root').innerHTML=`<div class="scrim" data-act="navClose" style="z-index:70"></div>`;$('.side-nav a').focus()},
  navClose(){const a=$('#app-shell');if(a)a.classList.remove('nav-open');$('#overlay-root').innerHTML=''},
  collapse(){state.collapsed=!state.collapsed;$('#app-shell').classList.toggle('collapsed',state.collapsed);rerenderKeep()},
  dd(i,b){const m=$('#dd-'+i);const open=!m.classList.contains('open');closePops();if(open){m.classList.add('open');b.setAttribute('aria-expanded','true');m.querySelector('a').focus()}},
  notifPop(_,b){const p=$('#notif-pop');if(p.innerHTML){closePops();return}closePops();const z=me();const l=myNotices(z).slice(0,5);
    p.innerHTML=`<div class="pop"><div class="panel-h"><h3>${tt('Notifications')}</h3>${l.some(n=>!n.read)?`<button class="btn ghost sm" data-act="readAll">${tt('Mark all as read')}</button>`:''}</div><ul class="list">${l.map(n=>`<li style="${n.read?'':'background:var(--info-bg)'}"><div class="body"><span class="small">${esc(noticeText(n))}</span><div class="meta">${rel(n.at)}</div></div></li>`).join('')}</ul><div class="panel-f"><a class="small" href="#c-notifs">${tt('View all notifications')}</a></div></div>`;b.setAttribute('aria-expanded','true')},
  profilePop(_,b){const p=$('#profile-pop');if(p.innerHTML){closePops();return}closePops();const c=state.user.type==='citizen';const L=s=>c?tt(s):esc(s);
    p.innerHTML=`<div class="pop pop-menu" style="width:240px;padding:.35rem 0">${c?`<a href="#c-profile">${ic('sliders',16)}${L('Profile & preferences')}</a><a href="#c-privacy">${ic('shield',16)}${L('Privacy & consent')}</a>`:''}<a href="#home">${ic('globe',16)}${L('Public website')}</a><button data-act="displayModal">${ic('aa',16)}${L('Display settings')}</button><button data-act="logout">${ic('logout',16)}${L('Log out')}</button></div>`;b.setAttribute('aria-expanded','true')},
  readAll(){state.notices.forEach(n=>{if(n.citizenId===me().id)n.read=true});rerenderKeep()},
  logout(){state.user=null;fabOpen=false;toast(t('You have logged out.'),'success');go('home')},
  reset(){confirmDialog({title:t('Reset sample data?'),body:`<p>${tt('All changes you made in this session will be lost.')}</p>`,confirm:t('Reset data'),danger:true,onYes:()=>{state=seed();go('home')}})},
  detectLocation(){
    if(!navigator.geolocation){
      toast('Geolocation is not supported by your browser.','error');
      return;
    }
    toast('Detecting real-time GPS location...','info');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        state.geo = { lat, lon, active: true, accuracy: Math.round(pos.coords.accuracy) };
        const CITY_MAP = {
          'Pune': [18.5204, 73.8567],
          'Mumbai': [19.0760, 72.8777],
          'Nagpur': [21.1458, 79.0882],
          'Nashik': [19.9975, 73.7898],
          'Lucknow': [26.8467, 80.9462],
          'Jaipur': [26.9124, 75.7873],
          'Delhi': [28.6139, 77.2090],
          'Bengaluru': [12.9716, 77.5946],
          'Hyderabad': [17.3850, 78.4867],
          'Ahmedabad': [23.0225, 72.5714]
        };
        let closest = 'Pune', minD = Infinity;
        for (const [c, [clat, clon]] of Object.entries(CITY_MAP)) {
          const d = Math.hypot(lat - clat, lon - clon);
          if (d < minD) { minD = d; closest = c; }
        }
        state.geo.city = closest;
        state.geo.display = `${closest}, India`;
        state.search.loc = closest;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            const town = data.address.city || data.address.town || data.address.suburb || data.address.county || closest;
            state.geo.display = `${town}, ${data.address.state || 'India'}`;
          }
        } catch(e) {}
        toast(`Real-time location: ${state.geo.display} (${lat.toFixed(3)}°N, ${lon.toFixed(3)}°E)`, 'success');
        rerenderKeep();
      },
      (err) => {
        toast(`Location access: ${err.message}. Showing Pune region.`, 'warning');
        state.geo = { lat: 18.5204, lon: 73.8567, active: true, city: 'Pune', display: 'Pune, Maharashtra' };
        state.search.loc = 'Pune';
        rerenderKeep();
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  },
  clearLocation(){
    state.geo = null;
    state.search.loc = '';
    toast('Location filter reset.', 'info');
    rerenderKeep();
  },
  close:closeModal,
  confirmYes(){const f=pendingConfirm;pendingConfirm=null;closeModal();if(f)f()},
  tab(a){const[k,v]=a.split('|');if(k==='login')state.loginTab=v;else state.tabs[k]=v;rerenderKeep();const b=$(`[data-act="tab"][data-arg="${a}"]`);if(b)b.focus()},
  quick(a){const[i,app]=a.split('|');const[,,route,cat]=QUICK[i];
    if(app||me()&&route!=='volunteer'){const map={services:'providers',camps:'camps',ngos:'ngos',schemes:'schemes',volunteer:'volunteer'};state.search={q:cat||'',loc:state.search.loc,cat:map[route]};if(me())go('c-find');else go('search');return}
    if(cat){state.orgF=Object.assign({q:'',cat:'',loc:'',ver:'',lang:'',kind:''},{cat})}go(route)},
  forgot(){openModal(`<h2>${tt('Reset your password')}</h2><form data-form="forgot" novalidate>${fld('id',tt('Email address or mobile number'),inp('id'))}<div class="m-actions"><button class="btn sec" type="button" data-act="close">${tt('Go back')}</button><button class="btn" type="submit">${tt('Send reset link')}</button></div></form>`,{label:t('Reset your password')})},
  clearCampF(){Object.assign(state.campF,{q:'',cat:'',loc:'',from:'',status:'upcoming',free:false,access:false,sort:'date'});rerenderKeep()},
  clearSchemeF(){Object.assign(state.schemeF,{q:'',cat:'',st:'',age:'',method:''});rerenderKeep()},
  clearOrgF(){state.orgF={q:'',cat:'',loc:'',ver:'',lang:'',kind:''};rerenderKeep()},
  save(a){const z=me();if(!z){toast(t('Log in to save services.'));state.after=location.hash.slice(1);go('login');return}const i=z.saved.indexOf(a);if(i>-1){z.saved.splice(i,1);toast(t('Removed from saved services.'))}else{z.saved.push(a);toast(t('Saved. Find it under Saved services.'),'success')}rerenderKeep()},
  register(id){const c=campById(id),z=me();if(!z){state.after='camp-'+id;state.loginTab='citizen';toast(t('Log in or create an account to register for this camp.'));go('login');return}
    const e=validateRegistration(z,c);if(e){toast(e,'warning');return}
    openModal(`<h2>${tt('Confirm your registration')}</h2><dl class="kv"><dt>${tt('Camp')}</dt><dd>${tt(c.title)}</dd><dt>${tt('Date')}</dt><dd>${fmtD(c.date)}, ${fmtT(c.start)}</dd><dt>${tt('Venue')}</dt><dd>${esc(c.venue)}, ${esc(c.city)}</dd><dt>${tt('Name')}</dt><dd>${esc(z.name)}</dd><dt>${tt('Bring')}</dt><dd>${esc(c.docs)}</dd></dl>
    <form data-form="confirmReg" data-arg="${c.id}" novalidate style="margin-top:1rem"><label class="check"><input type="checkbox" name="ok"> ${tt('I am registering myself and the details above are correct.')}</label><p class="err" id="err-ok" hidden></p><div id="reg-error"></div><div class="m-actions"><button class="btn sec" type="button" data-act="close">${tt('Go back')}</button><button class="btn" type="submit">${tt('Confirm registration')}</button></div></form>`,{label:t('Confirm your registration')})},
  cancelReg(ref){const r=state.regs.find(x=>x.ref===ref),c=campById(r.campId);confirmDialog({title:t('Cancel this registration?'),body:`<p>${tt('You will lose your place at the {camp} on {d}.',{camp:t(c.title),d:fmtD(c.date)})}</p>`,confirm:t('Cancel registration'),danger:true,onYes:()=>{if(!canCancelReg(r,c))return;r.status='cancelled';notify(r.citizenId,'You cancelled your registration for the {camp}.',{camp:c.title});log(actor(),'Cancelled registration',`${c.title}, ref ${ref}`);toast(t('Registration cancelled.'),'success');rerenderKeep()}})},
  share(id){const c=campById(id);const txt=`${t(c.title)}\n${fmtD(c.date)}, ${fmtT(c.start)}\n${c.venue}, ${c.city}`;if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(()=>toast(t('Camp details copied. Paste them into a message to share.'),'success'),()=>toast(txt));else toast(txt)},
  reqOrg(id){const o=orgById(id);const cat=(REQ_CATS.find(([c])=>o.categories.includes(c))||[''])[0];state.draft={step:1,category:cat,memberId:'',title:'',desc:'',contactPref:'Phone call',share:['name','contact','district'],orgId:id};go('c-newrequest')},
  reqCat(c){state.draft={step:1,category:c,memberId:'',title:'',desc:'',contactPref:'Phone call',share:['name','contact','district'],orgId:''};go('c-newrequest')},
  reqBack(){const f=$('form[data-form="reqStep"]');captureStep(f);state.draft.step--;rerenderKeep()},
  reqDraft(){const f=$('form[data-form="reqStep"]');captureStep(f);const d=state.draft,z=me();
    if(d._id){Object.assign(reqById(d._id),{category:d.category,memberId:d.memberId||null,title:d.title,desc:d.desc,contactPref:d.contactPref,share:d.share,orgId:d.orgId||null})}
    else state.requests.push({id:'SR-'+(1000+state.requests.length+1),citizenId:z.id,memberId:d.memberId||null,category:d.category,title:d.title,desc:d.desc,contactPref:d.contactPref,share:d.share,orgId:d.orgId||null,status:'draft',createdAt:off(0),history:[]});
    state.draft=null;state.tabs.req='draft';toast(t('Draft saved.'),'success');go('c-requests')},
  withdrawReq(id){confirmDialog({title:t('Withdraw this request?'),body:`<p>${tt('The organization will be told you no longer need help with this request. You can submit a new one later.')}</p>`,confirm:t('Withdraw request'),danger:true,onYes:()=>{const r=reqById(id);r.status='withdrawn';r.history.push({at:off(0),status:'withdrawn',note:'Withdrawn by the citizen.',by:'You'});log(actor(),'Withdrew request',id);toast(t('Request withdrawn.'),'success');rerenderKeep()}})},
  apptForm(id){if(!me()){state.after='org-'+id;state.loginTab='citizen';toast(t('Log in to request an appointment.'));go('login');return}const o=orgById(id);
    openModal(`<h2>${tt('Request an appointment or callback')}</h2><p class="small muted">${esc(o.name)}</p><div class="alert"><p>${tt('This sends a request. It is not a confirmed appointment until the provider confirms it.')}</p></div>
    <form data-form="appt" data-arg="${id}" novalidate><fieldset><legend>${tt('Type of request')}</legend><div class="choice"><label><input type="radio" name="type" value="appointment" checked>${tt('Appointment request')}</label><label><input type="radio" name="type" value="callback">${tt('Callback request')}</label></div></fieldset>
    <div class="fgrid">${fld('date',tt('Preferred date'),inp('date',off(1),'date',`min="${off(1)}"`))}${fld('slot',tt('Preferred time'),sel('slot',['Morning','Afternoon','Evening'].map(s=>[s,t(s)]),'Morning','',null))}</div>${fld('reason',tt('Reason'),ta('reason','','rows="3"'),tt('A short reason is enough. Do not include full medical records.'))}
    <div class="m-actions"><button class="btn sec" type="button" data-act="close">${tt('Go back')}</button><button class="btn" type="submit">${tt('Send request')}</button></div></form>`,{label:t('Request an appointment or callback')})},
  cancelAppt(id){confirmDialog({title:t('Cancel this request?'),body:'',confirm:t('Cancel request'),danger:true,onYes:()=>{state.appts.find(a=>a.id===id).status='cancelled';toast(t('Request cancelled.'),'success');rerenderKeep()}})},
  applyOpp(id){const z=me();if(!z){state.after='volunteer';state.loginTab='citizen';toast(t('Log in to apply.'));go('login');return}
    if(!z.volunteer){toast(t('Register as a volunteer first. It takes a minute.'));go('c-volunteer');return}
    const v=oppById(id);if(state.vapps.some(a=>a.oppId===id&&a.citizenId===z.id&&a.status!=='withdrawn')){toast(t('You have already applied for this opportunity.'),'warning');return}
    if(state.vapps.filter(a=>a.oppId===id&&a.status==='accepted').length>=v.positions){toast(t('All places are filled.'),'warning');return}
    confirmDialog({title:t('Apply for this opportunity?'),body:`<p><b>${tt(v.title)}</b><br>${esc(orgById(v.orgId).name)} · ${fmtD(v.date)}</p><p class="small muted">${tt('The organization will see your name, skills and availability.')}</p>`,confirm:t('Apply'),onYes:()=>{state.vapps.push({id:'VA-'+(state.vapps.length+1),oppId:id,citizenId:z.id,status:'applied',createdAt:off(0),hours:null});notify(z.id,'Your application for {opp} was sent.',{opp:v.title});log(actor(),'Applied to volunteer',v.title);toast(t('Application sent.'),'success');rerenderKeep()}})},
  withdrawVapp(id){state.vapps.find(a=>a.id===id).status='withdrawn';toast(t('Application withdrawn.'),'success');rerenderKeep()},
  addMember(){openModal(`<h2>${tt('Add family member')}</h2><form data-form="member" novalidate>${fld('name',tt('Name'),inp('name'))}<div class="fgrid">${fld('relation',tt('Relation'),sel('relation',RELATIONS.map(r=>[r,t(r)])))}${fld('age',tt('Age'),inp('age','','number','min="0" max="120"'))}</div><p class="small muted">${tt('If they are 18 or older, they must give consent before you can request services for them.')}</p><div class="m-actions"><button class="btn sec" type="button" data-act="close">${tt('Go back')}</button><button class="btn" type="submit">${tt('Add member')}</button></div></form>`,{label:t('Add family member')})},
  recordConsent(id){const m=memberById(me(),id);confirmDialog({title:t('Record consent'),body:`<p>${tt('Confirm that {name} has agreed to let you find services and make requests for them. In a live service they would confirm this themselves.',{name:m.name})}</p>`,confirm:t('Record consent'),onYes:()=>{m.access='consented';m.consentOn=off(0);log(actor(),'Recorded household consent',m.name);toast(t('Consent recorded.'),'success');rerenderKeep()}})},
  removeMember(id){const z=me();confirmDialog({title:t('Remove family member?'),body:'',confirm:t('Remove'),danger:true,onYes:()=>{z.members=z.members.filter(m=>m.id!==id);rerenderKeep()}})},
  findFor(id){state.findFor=id;go('c-find')},
  limitShare(id){confirmDialog({title:t('Share your name only?'),body:`<p>${tt('The organization will no longer see your other details for this request. This may make it harder for them to contact you.')}</p>`,confirm:t('Share name only'),onYes:()=>{const r=reqById(id);r.share=['name'];r.history.push({at:off(0),status:r.status,note:'Citizen limited shared details to name only.',by:'You'});log(actor(),'Limited consent',id);toast(t('Sharing updated.'),'success');rerenderKeep()}})},
  togglePersonalize(_,el){me().personalize=el.checked;toast(t('Preference saved.'),'success')},
  requestDelete(){confirmDialog({title:t('Request account deletion?'),body:`<p>${tt('An administrator will delete your account. Records needed for audit are kept in anonymised form.')}</p>`,confirm:t('Request deletion'),danger:true,onYes:()=>{me().deletion=true;log(actor(),'Requested deletion','');rerenderKeep()}})},
  // organization
  orgCase:caseModal,
  referForm(id){closeModal();referForm(id)},
  apptConfirm(id){openModal(`<h2>Confirm ${id}</h2><form data-form="apptConfirm" data-arg="${id}" novalidate>${fld('time','Confirmed date and time',inp('time','','text','placeholder="e.g. 24 Oct, 11:00 AM"'))}<div class="m-actions"><button class="btn sec" type="button" data-act="close">Cancel</button><button class="btn" type="submit">Confirm appointment</button></div></form>`,{label:'Confirm'})},
  apptDecline(id){const a=state.appts.find(x=>x.id===id);a.status='declined';notify(a.citizenId,'Your request {id} was declined by the provider.',{id});log(actor(),'Declined appointment request',id);rerenderKeep()},
  progForm:progForm,oppForm:oppForm,
  vappSet(a){const[id,st]=a.split('|');const x=state.vapps.find(v=>v.id===id);x.status=st;const v=oppById(x.oppId);notify(x.citizenId,st==='accepted'?'You were accepted for {opp}.':'You were not selected for {opp}.',{opp:v.title});log(actor(),st==='accepted'?'Accepted volunteer':'Declined volunteer',`${v.title}, ${id}`);rerenderKeep()},
  recordHours(id){openModal(`<h2>Record participation</h2><form data-form="hours" data-arg="${id}" novalidate>${fld('hours','Hours attended',inp('hours','','number','min="0.5" step="0.5"'),'Only record hours you have confirmed.')}<div class="m-actions"><button class="btn sec" type="button" data-act="close">Cancel</button><button class="btn" type="submit">Record</button></div></form>`,{label:'Record participation'})},
  pickCamp(id){state.adminCamp=id;rerenderKeep()},
  submitLink(id){openModal(`<h2>Submit official donation link</h2><form data-form="donLink" data-arg="${id}" novalidate>${fld('url','Official donation page URL',inp('url','','url','placeholder="https://"'),'ChikitsaSeva reviews the link before showing it to citizens.')}<div class="m-actions"><button class="btn sec" type="button" data-act="close">Cancel</button><button class="btn" type="submit">Submit for review</button></div></form>`,{label:'Donation link'})},
  // admin
  campForm(a){const[id,org]=(a||'').split('|');openModal(campFormHtml(id?campById(id):null,org==='org'),{wide:true,label:'Camp'})},
  schemeForm(id){openModal(schemeFormHtml(id?schemeById(id):null),{wide:true,label:'Scheme'})},
  publishCamp(id){const c=campById(id);if(Object.keys(campErrors(c)).length){toast('This camp is missing required details. Use Edit to complete them.','error');return}confirmDialog({title:'Publish this camp?',body:`<p>${E(c.title)} will be visible to all citizens.</p>`,confirm:'Publish camp',onYes:()=>{c.status='published';c.publishedAt=off(0);log(actor(),'Published camp',c.title);toast('Camp published.','success');rerenderKeep()}})},
  cancelCamp(id){const c=campById(id);openModal(`<h2>Cancel this camp?</h2><p>${E(c.title)} on ${fmtEn(c.date)}. Everyone registered will be notified.</p><form data-form="cancelCamp" data-arg="${id}" novalidate>${fld('reason','Reason shown to citizens',inp('reason'))}<div class="m-actions"><button class="btn sec" type="button" data-act="close">Go back</button><button class="btn danger" type="submit">Cancel camp</button></div></form>`,{label:'Cancel camp'})},
  viewRegs(id){state.adminCamp=id;state.adminRegQ='';go('a-regs')},
  mark(a){const[ref,st]=a.split('|');const r=state.regs.find(x=>x.ref===ref);const prev=r.status;r.status=st;const c=campById(r.campId);if(st==='attended')notify(r.citizenId,'Your attendance at the {camp} was recorded.',{camp:c.title});log(actor(),'Recorded attendance',`${c.title}, ${ref}: ${prev} → ${st}`);$('#regs-box').innerHTML=regsTable(r.campId)},
  toggleScheme(id){const s=schemeById(id);s.status=s.status==='active'?'inactive':'active';log(actor(),'Changed scheme status',`${s.name}: ${s.status}`);rerenderKeep()},
  ver(a){const[id,st]=a.split('|');const o=orgById(id);const labels={reviewed:'Mark documents reviewed',verified:'Verify organization',suspended:'Suspend verification',pending:'Reinstate for review'};
    confirmDialog({title:labels[st]+'?',body:`<p>${E(o.name)} will show “${VER[st][0]}” on its public profile.</p>${st==='verified'?'<p class="small muted">Confirm you have completed every step of the published verification process.</p>':''}`,confirm:labels[st],danger:st==='suspended',onYes:()=>{o.verification=st;if(st==='verified')o.verifiedOn=o.reviewedOn=off(0);if(st==='reviewed')o.reviewedOn=off(0);log(actor(),labels[st],o.name);toast('Status updated.','success');rerenderKeep()}})},
  processDelete(id){const c=citizenById(id);confirmDialog({title:'Delete this account?',body:`<p>${E(c.name)}’s personal details will be deleted. Records are kept in anonymised form.</p>`,confirm:'Delete account',danger:true,onYes:()=>{state.citizens=state.citizens.filter(x=>x.id!==id);state.regs.forEach(r=>{if(r.citizenId===id)r.citizenId='deleted'});log(actor(),'Deleted citizen account',id);rerenderKeep()}})}
};
function captureStep(f){if(!f)return;const d=state.draft;const fd=new FormData(f);
  if(d.step===1){d.category=fd.get('category')||d.category;d.memberId=fd.get('memberId')||''}
  if(d.step===2){d.title=(fd.get('title')||'').trim();d.desc=(fd.get('desc')||'').trim()}
  if(d.step===3){d.contactPref=fd.get('contactPref')||d.contactPref;d.share=['name',...fd.getAll('share').filter(s=>s!=='name')];d.orgId=fd.get('orgId')||''}}

/* ---------- forms ---------- */
const FORM={
  discover(f){const fd=new FormData(f);state.search={q:fd.get('dq')||'',loc:fd.get('dloc')||'',cat:fd.get('dcat')||''};if(f.dataset.arg==='app'){state.findFor=fd.get('dfor')||'';rerenderKeep()}else go('search')},
  gsearch(f){state.search={q:new FormData(f).get('q')||'',loc:'',cat:''};go('search')},
  appsearch(f){state.search={q:new FormData(f).get('q')||'',loc:'',cat:''};go('c-find')},
  login(f){const tab=f.dataset.arg,d=Object.fromEntries(new FormData(f)),msg=$('#login-msg',f);const e={};if(!d.id.trim())e.id=t('Enter your email address or mobile number.');if(!d.pw)e.pw=t('Enter your password.');if(!setErrors(f,e))return;
    if(Date.now()<state.lockUntil){msg.innerHTML=`<div class="alert error" role="alert"><strong>${tt('Too many attempts')}</strong><p>${tt('Wait 30 seconds, then try again.')}</p></div>`;return}
    const id=d.id.trim().toLowerCase();let ok=null;
    if(tab==='citizen'){const c=state.citizens.find(x=>x.password&&x.contact.toLowerCase()===id&&x.password===d.pw);if(c)ok={type:'citizen',id:c.id,home:'c-home'}}
    if(tab==='org'){const u=state.orgUsers.find(x=>x.email===id&&x.password===d.pw);if(u)ok={type:'org',orgId:u.orgId,home:'o-home'}}
    if(tab==='admin'){const a=ADMINS.find(x=>x.email===id&&x.password===d.pw);if(a)ok={type:'admin',home:'a-home'}}
    if(!ok){state.fails++;if(state.fails>=5){state.lockUntil=Date.now()+30000;state.fails=0}msg.innerHTML=`<div class="alert error" role="alert"><strong>${tt('Login failed')}</strong><p>${tt('The details you entered do not match our records.')}</p></div>`;$('#f-pw',f).value='';return}
    state.fails=0;state.user=ok;fabOpen=false;const pre={citizen:['c-','creq-','camp-','org-','volunteer'],org:['o-'],admin:['a-']}[ok.type];const a=state.after&&pre.some(p=>state.after.startsWith(p))?state.after:ok.home;state.after=null;if(ok.type!=='citizen')log(actor(),'Logged in','');go(a)},
  forgot(f){const d=Object.fromEntries(new FormData(f));if(!setErrors(f,d.id.trim()?{}:{id:t('Enter your email address or mobile number.')}))return;closeModal();toast(t('If an account exists, we have sent reset instructions.'),'success')},
  signup(f){const d=Object.fromEntries(new FormData(f));const e={};const ct=(d.contact||'').trim();
    if(!d.name.trim())e.name=t('Enter your full name.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ct)&&!/^[6-9]\d{9}$/.test(ct.replace(/^\+?91/,'')))e.contact=t('Enter a valid email address or a 10-digit mobile number.');
    if(!d.pw||d.pw.length<8||!/\d/.test(d.pw))e.pw=t('Use at least 8 characters, including a number.');if(d.pw2!==d.pw)e.pw2=t('Passwords do not match.');if(!d.terms)e.terms=t('Agree to the Terms of Use to continue.');if(!setErrors(f,e))return;
    if(state.citizens.some(c=>c.contact.toLowerCase()===ct.toLowerCase())){toast(t('If this email or number is new, your account has been created. Otherwise, log in.'));go('login');return}
    const c={id:'u'+Date.now().toString(36),name:d.name.trim(),contact:ct,password:d.pw,age:null,lang:'',city:'',district:'',state:'',pin:'',interests:[],supportInterests:[],a11y:'',notify:{onscreen:true,email:true,sms:false},verified:false,deletion:false,createdAt:off(0),personalize:true,members:[],saved:[],volunteer:null};
    state.citizens.push(c);state.user={type:'citizen',id:c.id};toast(t('Account created.'),'success');go('c-home')},
  verify(f){const d=Object.fromEntries(new FormData(f));if(!setErrors(f,d.code.trim()==='123456'?{}:{code:t('That code is not correct.')}))return;me().verified=true;toast(t('Account verified.'),'success');rerenderKeep()},
  profile(f){const fd=new FormData(f),d=Object.fromEntries(fd);const e={};if(!d.name.trim())e.name=t('Enter your full name.');if(d.age!==''&&!(Number(d.age)>=1&&Number(d.age)<=120))e.age=t('Enter an age between 1 and 120.');if(d.pin&&!/^\d{6}$/.test(d.pin))e.pin=t('PIN code must be 6 digits.');if(!setErrors(f,e))return;
    const z=me();const dist=d.district;const st=dist?(locOptions().find(([c])=>c===dist)||['',''])[1].split(', ')[1]||d.state:d.state;
    Object.assign(z,{name:d.name.trim(),age:d.age===''?null:Number(d.age),lang:d.lang,district:dist,city:dist,state:d.state||st,pin:d.pin.trim(),interests:fd.getAll('interests'),supportInterests:fd.getAll('supportInterests'),a11y:d.a11y.trim(),notify:{onscreen:!!d.n_onscreen,email:!!d.n_email,sms:!!d.n_sms}});toast(t('Profile saved.'),'success');rerenderKeep()},
  reqStep(f){const d=state.draft;captureStep(f);const e={};
    if(d.step===1&&!d.category)e.category=t('Choose the kind of help you need.');
    if(d.step===2){if(!d.title)e.title=t('Enter a short title.');if(d.desc.length<15)e.desc=t('Describe your need in a little more detail.')}
    if(d.step===4&&!f.querySelector('[name=consent]').checked)e.consent=t('Give consent to submit, or save as a draft.');
    if(!setErrors(f,e))return;
    if(d.step<4){d.step++;rerenderKeep();$('#main h1').focus();return}
    const z=me();const o=d.orgId&&orgById(d.orgId);const id=d._id||'SR-'+(1000+state.requests.length+1);
    const h=[{at:off(0),status:'review',note:'Request submitted.',by:'You'}];if(o)h.push({at:off(0),status:'referred',note:`Sent to ${o.name} at your request.`,by:'ChikitsaSeva'});
    const rec={id,citizenId:z.id,memberId:d.memberId||null,category:d.category,title:d.title,desc:d.desc,contactPref:d.contactPref,share:d.share,orgId:o?o.id:null,status:o?'referred':'review',createdAt:off(0),history:h};
    if(d._id)Object.assign(reqById(d._id),rec);else state.requests.push(rec);
    notify(z.id,'Update on request {id}: {status}.',{id,status:RS[rec.status][0]});log(actor(),'Submitted assistance request',`${id} (${d.category})`);state.draft=null;toast(t('Request {id} submitted.',{id}),'success');go('creq-'+id)},
  infoReply(f){const d=Object.fromEntries(new FormData(f));if(!setErrors(f,d.reply.trim().length>3?{}:{reply:t('Enter your response.')}))return;const r=reqById(f.dataset.arg);r.status='referred';r.infoQ=null;r.history.push({at:off(0),status:'referred',note:'Citizen response: '+d.reply.trim(),by:'You'});log(actor(),'Responded to information request',r.id);toast(t('Response sent.'),'success');rerenderKeep()},
  elig(f){const s=schemeById(f.dataset.arg),d=Object.fromEntries(new FormData(f));const e={};
    s.checks.forEach(ch=>{const v=d['q_'+ch.id];if(ch.type==='age'?(v===''||v==null):!v)e['q_'+ch.id]=t('Answer this question.')});if(!setErrors(f,e))return;
    const res=s.checks.map(ch=>{const v=d['q_'+ch.id];if(ch.type==='age'){const a=Number(v);return(ch.min==null||a>=ch.min)&&(ch.max==null||a<=ch.max)?'pass':'fail'}return v==='yes'?'pass':v==='no'?'fail':'unknown'});
    const out=s.mode==='any'?(res.includes('pass')?'pass':res.includes('unknown')?'unknown':'fail'):(res.includes('fail')?'fail':res.includes('unknown')?'unknown':'pass');
    const R={pass:['success','You appear to meet the listed criteria'],fail:['warning','You may not meet the listed criteria'],unknown:['','More information is needed']}[out];
    const b=$('#elig-result');b.innerHTML=`<div class="alert ${R[0]}" role="status"><strong>${tt(R[1])}</strong><p>${tt('This is a preliminary indication, not an official eligibility decision.')}</p><a class="btn sm" href="${esc(s.url)}" target="_blank" rel="noopener">${tt('Confirm on the official website')}</a></div>`;b.focus()},
  confirmReg(f){if(!setErrors(f,f.querySelector('[name=ok]').checked?{}:{ok:t('Confirm that the details are correct.')}))return;const res=serverRegister(state.user.id,f.dataset.arg);
    if(!res.ok){$('#reg-error').innerHTML=`<div class="alert error" role="alert"><p>${esc(res.error)}</p></div>`;return}
    const c=campById(f.dataset.arg);openModal(`<div class="alert success" role="status"><strong>${tt('You are registered')}</strong><p>${tt(c.title)}</p></div><dl class="kv"><dt>${tt('Reference')}</dt><dd class="ref" style="font-size:1.0625rem">${res.reg.ref}</dd><dt>${tt('Date')}</dt><dd>${fmtD(c.date)}, ${fmtT(c.start)}</dd></dl><div class="m-actions"><button class="btn sec" data-act="close">${tt('Close')}</button><a class="btn" href="#c-regs">${tt('My registrations')}</a></div>`,{label:t('You are registered')});
    const y=window.scrollY;firstRender=true;render();window.scrollTo(0,y)},
  appt(f){const d=Object.fromEntries(new FormData(f));const e={};if(!d.date||daysUntil(d.date)<1)e.date=t('Choose a date from tomorrow onwards.');if(d.reason.trim().length<5)e.reason=t('Enter a short reason.');if(!setErrors(f,e))return;
    const id='AP-'+(2000+state.appts.length+1);state.appts.push({id,citizenId:me().id,orgId:f.dataset.arg,type:d.type,date:d.date,slot:d.slot,reason:d.reason.trim(),status:'requested',createdAt:off(0)});
    notify(me().id,'Your callback request {id} was sent. It is not yet confirmed.',{id});log(actor(),'Requested appointment',`${id} with ${orgById(f.dataset.arg).name}`);closeModal();toast(t('Request {id} sent. The provider must confirm it.',{id}),'success');rerenderKeep()},
  volReg(f){const fd=new FormData(f);const sk=fd.getAll('skills');if(!setErrors(f,sk.length?{}:{skills:t('Choose at least one skill.')}))return;me().volunteer={skills:sk,availability:fd.get('availability')||'Flexible',area:fd.get('area')||me().district,experience:fd.get('experience')||''};toast(t('You are registered as a volunteer.'),'success');rerenderKeep()},
  member(f){const d=Object.fromEntries(new FormData(f));const e={};if(!d.name.trim())e.name=t('Enter a name.');if(!d.relation)e.relation=t('Choose a relation.');if(d.age===''||Number(d.age)<0||Number(d.age)>120)e.age=t('Enter an age.');if(!setErrors(f,e))return;
    const age=Number(d.age);me().members.push({id:'m'+Date.now().toString(36),name:d.name.trim(),relation:d.relation,age,access:age<18?'guardian':'pending',consentOn:age<18?off(0):null});closeModal();toast(age<18?t('Family member added.'):t('Added. Record their consent before acting for them.'),'success');rerenderKeep()},
  join(f){const fd=new FormData(f),d=Object.fromEntries(fd);const e={};const cats=fd.getAll('cats');
    ['name','type','person','city','state','about'].forEach(k=>{if(!String(d[k]||'').trim())e[k]=t('This field is required.')});if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email||''))e.email=t('Enter a valid email address.');if(!d.pw||d.pw.length<8||!/\d/.test(d.pw))e.pw=t('Use at least 8 characters, including a number.');if(!cats.length)e.cats=t('Choose at least one service.');if(state.orgUsers.some(u=>u.email===d.email))e.email=t('This email is already registered.');if(!setErrors(f,e))return;
    const id='o'+(state.orgs.length+1)+Date.now().toString(36).slice(-3);state.orgs.push({id,name:d.name.trim(),kind:['NGO','Community group'].includes(d.type)?'ngo':'provider',type:d.type,city:d.city.trim(),district:d.city.trim(),state:d.state,address:d.city.trim(),about:d.about.trim(),mission:'',categories:cats,services:[],areas:d.areas.split(',').map(x=>x.trim()).filter(Boolean),langs:['English'],beneficiaries:[],eligibility:'',process:'',contact:'Pending verification',website:d.website,hours:'',access:'',verification:'pending',verifiedOn:null,reviewedOn:null,acceptsRequests:false,acceptsAppointments:false,color:'#475569',regNo:d.regNo,contactPerson:d.person});
    state.orgUsers.push({email:d.email,password:d.pw,orgId:id,name:d.person.trim(),role:'Administrator'});state.user={type:'org',orgId:id};log(actor(),'Registered organization',d.name);toast(t('Submitted. Your organization shows “Verification pending” until review is complete.'),'success');go('o-home')},
  // organization
  caseAction(f,sub){const r=reqById(f.dataset.arg);const act=sub&&sub.value;const note=(new FormData(f).get('note')||'').trim();
    if((act==='info'||act==='decline')&&note.length<5){setErrors(f,{note:'Add a note for the citizen.'});return}
    const o=myOrg();const msgs={accepted:'Accepted by '+o.name+'.',progress:'Assistance is under way.',resolved:'Marked as resolved.',closed:'Request closed.'};
    if(act==='decline'){r.status='review';r.orgId=null;r.history.push({at:off(0),status:'review',note:`${o.name} could not take this request: ${note} ChikitsaSeva will look for another organization.`,by:o.name})}
    else{r.status=act;if(act==='info')r.infoQ=note;r.history.push({at:off(0),status:act,note:note||msgs[act],by:o.name})}
    notify(r.citizenId,act==='info'?'{org} needs more information for request {id}.':'Update on request {id}: {status}.',{org:o.name,id:r.id,status:RS[r.status][0]});log(actor(),'Updated request',`${r.id}: ${act}`);closeModal();toast('Request updated.','success');rerenderKeep()},
  referral(f){const fd=new FormData(f);const sh=fd.getAll('shared');const e={};if(!fd.get('toOrg'))e.toOrg='Choose an organization.';if((fd.get('reason')||'').trim().length<5)e.reason='Give a reason.';if(!sh.length)e.shared='Choose what to share.';if(!f.querySelector('[name=consent]').checked)e.consent='Confirm the citizen agreed.';if(!setErrors(f,e))return;
    const r=reqById(f.dataset.arg);const to=orgById(fd.get('toOrg'));state.referrals.push({id:'RF-'+(300+state.referrals.length+1),requestId:r.id,fromOrg:myOrg().id,toOrg:to.id,reason:fd.get('reason').trim(),shared:sh,consent:'given',date:off(0),status:'sent',outcome:''});
    r.history.push({at:off(0),status:r.status,note:`Referred to ${to.name} for additional support.`,by:myOrg().name});notify(r.citizenId,'Update on request {id}: {status}.',{id:r.id,status:'Referred to organization'});log(actor(),'Sent referral',`${r.id} to ${to.name}`);closeModal();toast('Referral sent.','success');go('o-referrals')},
  apptConfirm(f){const v=(new FormData(f).get('time')||'').trim();if(!setErrors(f,v?{}:{time:'Enter the confirmed date and time.'}))return;const a=state.appts.find(x=>x.id===f.dataset.arg);a.status='confirmed';a.confirmedTime=v;notify(a.citizenId,'Your request {id} was confirmed by the provider.',{id:a.id});log(actor(),'Confirmed appointment',a.id);closeModal();rerenderKeep()},
  progSave(f){const d=Object.fromEntries(new FormData(f));const e={};['title','type','desc','eligibility'].forEach(k=>{if(!String(d[k]||'').trim())e[k]='Required.'});if(!setErrors(f,e))return;const data={title:d.title.trim(),type:d.type,city:d.city.trim(),desc:d.desc.trim(),eligibility:d.eligibility.trim(),availability:d.availability.trim(),status:d.status,start:d.start||off(0),end:d.end||null,docs:d.docs.trim(),process:d.process.trim()};
    if(f.dataset.arg)Object.assign(progById(f.dataset.arg),data);else state.programs.push(Object.assign({id:'p'+(state.programs.length+1),orgId:myOrg().id,contact:myOrg().contact},data));log(actor(),'Saved programme',data.title);closeModal();toast('Programme saved.','success');rerenderKeep()},
  oppSave(f){const d=Object.fromEntries(new FormData(f));const e={};['title','activity','date','deadline','resp'].forEach(k=>{if(!String(d[k]||'').trim())e[k]='Required.'});if(d.deadline&&d.date&&d.deadline>d.date)e.deadline='Must be on or before the date.';if(!setErrors(f,e))return;
    state.opps.push({id:'v'+(state.opps.length+1),orgId:myOrg().id,title:d.title.trim(),activity:d.activity.trim(),city:d.city.trim(),date:d.date,start:d.start,end:d.end,skills:d.skills.split(',').map(s=>s.trim()).filter(Boolean),resp:d.resp.trim(),elig:d.elig.trim(),positions:Number(d.positions)||1,deadline:d.deadline,status:'open'});log(actor(),'Published volunteer opportunity',d.title);closeModal();toast('Opportunity published.','success');rerenderKeep()},
  hours(f){const h=Number(new FormData(f).get('hours'));if(!setErrors(f,h>0&&h<=24?{}:{hours:'Enter hours between 0.5 and 24.'}))return;const a=state.vapps.find(x=>x.id===f.dataset.arg);a.hours=h;notify(a.citizenId,'Your participation in {opp} was recorded.',{opp:oppById(a.oppId).title});log(actor(),'Recorded volunteer hours',`${a.id}: ${h} h`);closeModal();rerenderKeep()},
  donLink(f){const u=(new FormData(f).get('url')||'').trim();if(!setErrors(f,/^https:\/\//.test(u)?{}:{url:'Enter an https:// link.'}))return;state.campaigns.find(d=>d.id===f.dataset.arg).pendingUrl=u;log(actor(),'Submitted donation link for review',u);closeModal();toast('Submitted for review.','success');rerenderKeep()},
  orgProfile(f){const fd=new FormData(f),d=Object.fromEntries(fd);const o=myOrg();Object.assign(o,{about:d.about.trim(),mission:d.mission.trim(),services:d.services.split('\n').map(s=>s.trim()).filter(Boolean),areas:d.areas.split(',').map(s=>s.trim()).filter(Boolean),eligibility:d.eligibility.trim(),process:d.process.trim(),hours:d.hours.trim(),website:d.website.trim(),contact:d.contact.trim()||o.contact,acceptsRequests:!!d.acceptsRequests,acceptsAppointments:!!d.acceptsAppointments});log(actor(),'Edited organization profile',o.name);toast('Profile saved.','success');rerenderKeep()},
  // admin
  route(f){const r=reqById(f.dataset.arg);const oid=new FormData(f).get('org-'+r.id);if(!oid){toast('Choose an organization.','warning');return}const o=orgById(oid);r.orgId=oid;r.status='referred';r.history.push({at:off(0),status:'referred',note:`Sent to ${o.name}.`,by:'ChikitsaSeva'});notify(r.citizenId,'Update on request {id}: {status}.',{id:r.id,status:'Referred to organization'});log(actor(),'Routed request',`${r.id} to ${o.name}`);toast('Request routed.','success');rerenderKeep()},
  campSave(f,sub){const id=f.dataset.arg,asOrg=!!f.dataset.org,d=Object.fromEntries(new FormData(f));const intent=sub&&sub.value||'keep';const e=campErrors(d);if(id&&d.capacity&&Number(d.capacity)<seatsTaken(id))e.capacity=`Cannot be lower than ${seatsTaken(id)} existing registrations.`;if(!setErrors(f,e))return;
    const data={title:d.title.trim(),category:d.category,short:d.short.trim(),desc:d.desc.trim()||d.short.trim(),date:d.date,start:d.start,end:d.end,venue:d.venue.trim(),address:d.address.trim(),city:d.city.trim(),district:d.district.trim(),state:d.state,pin:d.pin.trim(),services:d.services.split('\n').map(x=>x.trim()).filter(Boolean),audience:d.audience.trim()||'All',eligibility:d.eligibility.trim()||'Open to all.',minAge:d.minAge===''?null:Number(d.minAge),maxAge:d.maxAge===''?null:Number(d.maxAge),access:d.access.trim(),docs:d.docs.trim()||'Any photo identity document.',regOpen:d.regOpen,deadline:d.deadline,capacity:d.capacity===''?null:Number(d.capacity),fee:d.fee.trim()||'Free',cancelPolicy:d.cancelPolicy.trim()};
    if(id){const c=campById(id);const changed=c.status==='published'&&(c.venue!==data.venue||c.date!==data.date||c.start!==data.start||c.address!==data.address);Object.assign(c,data);if(intent==='publish'){c.status='published';c.publishedAt=off(0)}
      if(changed){const n=state.regs.filter(r=>r.campId===id&&r.status==='confirmed');n.forEach(r=>notify(r.citizenId,'Important: the venue, date or time of the {camp} has changed. Please check the camp page.',{camp:c.title}));toast(`Saved. ${n.length} registered citizens notified of the change.`,'success')}else toast('Changes saved.','success');log(actor(),'Edited camp',c.title)}
    else{const o=asOrg?myOrg():null;state.camps.push(Object.assign({id:'c'+(110+state.camps.length),status:intent==='publish'?'published':'draft',publishedAt:intent==='publish'?off(0):null,cancelReason:'',organizer:o?o.name:'Demo organizer (fictional)',orgId:o?o.id:null,contact:o?o.contact:'Organizer contact details will appear here once verified.'},data));log(actor(),intent==='publish'?'Created and published camp':'Created draft camp',data.title);toast(intent==='publish'?'Camp published.':'Saved as draft.','success')}
    closeModal();rerenderKeep()},
  schemeSave(f){const id=f.dataset.arg,d=Object.fromEntries(new FormData(f));const e={};if(!d.name.trim())e.name='Enter the official name.';if(!d.authority.trim())e.authority='Enter the authority.';if(!d.category)e.category='Choose a category.';if(!d.desc.trim())e.desc='Enter a summary.';if(!/^https:\/\/[^\s]+\.(gov\.in|nic\.in)(\/.*)?$/i.test(d.url.trim()))e.url='Enter an official https:// URL ending in .gov.in or .nic.in.';if(!setErrors(f,e))return;
    const data={name:d.name.trim(),authority:d.authority.trim(),category:d.category,jurisdiction:d.jurisdiction,desc:d.desc.trim(),benefits:d.benefits.trim(),beneficiaries:d.beneficiaries.trim(),conditions:d.conditions.trim()||'See the official source.',minAge:d.minAge===''?null:Number(d.minAge),maxAge:d.maxAge===''?null:Number(d.maxAge),docs:d.docs.split('\n').map(x=>x.trim()).filter(Boolean),method:d.method.trim()||'See official source',process:d.process.trim(),url:d.url.trim(),lastVerified:d.lastVerified||null};
    if(id)Object.assign(schemeById(id),data);else state.schemes.push(Object.assign({id:'s'+Date.now().toString(36),status:'active',mode:'all',checks:[{id:'gen',type:'yesno',label:'Do you meet the conditions described on the official website?'}],interests:[],openToAll:false,faq:[],dates:'Ongoing',contact:'Refer to the official website.'},data));log(actor(),'Saved scheme',data.name);closeModal();toast('Scheme saved.','success');rerenderKeep()},
  cancelCamp(f){const d=Object.fromEntries(new FormData(f));if(!setErrors(f,d.reason.trim()?{}:{reason:'Enter a reason.'}))return;const c=campById(f.dataset.arg);c.status='cancelled';c.cancelReason=d.reason.trim();state.regs.filter(r=>r.campId===c.id&&r.status==='confirmed').forEach(r=>notify(r.citizenId,'The {camp} has been cancelled.',{camp:c.title}));log(actor(),'Cancelled camp',`${c.title}: ${c.cancelReason}`);closeModal();toast('Camp cancelled. Registered citizens notified.','success');rerenderKeep()}
};
const FILTER={
  camp(el){state.campF[el.name]=el.type==='checkbox'?el.checked:el.value;renderCampResults()},
  scheme(el){state.schemeF[el.name]=el.value;renderSchemeResults()},
  org(el){state.orgF[el.name]=el.value;renderOrgResults()},
  adminCamp(el){state.adminCamp=el.value;$('#regs-box').innerHTML=el.value?regsTable(el.value):''},
  adminRegQ(el){state.adminRegQ=el.value;if(state.adminCamp)$('#regs-box').innerHTML=regsTable(state.adminCamp)}
};

/* ---------- wiring ---------- */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');
  if(!e.target.closest('.ddm,.pop,[data-act="dd"],[data-act="notifPop"],[data-act="profilePop"]'))closePops();
  if(fabOpen&&!e.target.closest('.fab,.fab-panel')){fabOpen=false;$('#fab-root').innerHTML=fabHtml(false)}
  if(!b){const a=e.target.closest('a[href^="#"]');if(a&&$('#app-shell.nav-open'))ACT.navClose();if(a&&$('.drawer'))ACT.closeDrawer();return}
  if(b.dataset.act==='modalBack'){if(e.target===b)closeModal();return}
  if(b.dataset.act==='togglePersonalize'){ACT.togglePersonalize(null,b);return}
  if(b.disabled)return;
  if(b.getAttribute('aria-disabled')==='true'){e.preventDefault();const r=$('#reg-reason');if(r)toast(r.textContent.trim(),'warning');return}
  e.preventDefault();const f=ACT[b.dataset.act];if(f)f(b.dataset.arg,b,e);
});
document.addEventListener('submit',e=>{const f=e.target.closest('form[data-form]');if(f){e.preventDefault();const h=FORM[f.dataset.form];if(h)h(f,e.submitter)}});
document.addEventListener('input',e=>{const el=e.target.closest('[data-filter]');if(el&&!['checkbox','radio'].includes(el.type)&&el.tagName!=='SELECT')FILTER[el.dataset.filter](el)});
document.addEventListener('change',e=>{const el=e.target.closest('[data-filter]');if(el&&(['checkbox','radio'].includes(el.type)||el.tagName==='SELECT'))FILTER[el.dataset.filter](el)});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if($('#modal-root').innerHTML){closeModal();return}if($('.drawer')){ACT.closeDrawer();return}if($('#app-shell.nav-open')){ACT.navClose();return}if(fabOpen){fabOpen=false;$('#fab-root').innerHTML=fabHtml(false);$('.fab').focus();return}closePops()}
  if(e.key==='Tab'&&$('.modal')){const fs=$$('.modal a[href],.modal button:not([disabled]),.modal input:not([disabled]),.modal select,.modal textarea').filter(x=>x.offsetParent!==null);if(!fs.length)return;const a=fs[0],z=fs[fs.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}
});
window.addEventListener('hashchange',()=>{closeModal();$('#overlay-root').innerHTML='';render()});
state=seed();applyUi();
$('#app').innerHTML=`<div class="loading" role="status"><span class="spinner"></span>Loading ChikitsaSeva…</div>`;
setTimeout(render,120);
