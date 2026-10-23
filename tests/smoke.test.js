const {JSDOM}=require('jsdom');const fs=require('fs');
let html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');

const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://x.test/'});
const w=dom.window;w.scrollTo=()=>{};const errs=[];w.addEventListener('error',e=>errs.push(e.message+' '+(e.error&&e.error.stack||'').split('\n')[1]));w.console.error=(...a)=>errs.push(a.join(' '));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const d=w.document;
const nav=async h=>{w.location.hash=h;await sleep(25);const t=d.querySelector('h1');return t?t.textContent.trim().slice(0,60):'NO H1'};
const click=s=>{const e=d.querySelector(s);if(!e)throw new Error('missing '+s);e.click()};
const submit=(s,sub)=>{const f=d.querySelector(s);if(!f)throw new Error('missing form '+s);const ev=new w.Event('submit',{bubbles:true,cancelable:true});if(sub)ev.submitter=f.querySelector(sub);f.dispatchEvent(ev)};
const login=async(tab,id,pw)=>{await nav('login');click(`[data-act=tab][data-arg="login|${tab}"]`);await sleep(10);d.querySelector('#f-id').value=id;d.querySelector('#f-pw').value=pw;submit('form[data-form=login]');await sleep(40)};
(async()=>{await sleep(250);const out=[];
 for(const lang of ['en','hi','mr']){
  w.eval(`ui.lang='${lang}';applyUi();state=seed();`);
  for(const h of ['home','search','services','camps','camp-c101','camp-c104','camp-c109','ngos','org-o1','org-o5','org-o7','schemes','scheme-pmjay','eligibility','elig-pmjay','elig-rbsk','community','volunteer','resources','emergency','login','register','join','how','about','help','contact','privacy','terms','accessibility','dataprotection','zzz'])out.push(lang+' '+h+' → '+await nav(h));
  click('[data-act=fab]');await sleep(5);click('[data-act=drawer]');await sleep(5);click('[data-act=closeDrawer]');
  await nav('home');click('[data-act=quick][data-arg="4"]');await sleep(20);out.push('quick→'+w.location.hash);
  await nav('home');d.querySelector('#f-dcat').value='camps';submit('form[data-form=discover]');await sleep(20);out.push('discover→'+w.location.hash+' '+d.querySelectorAll('.list>li').length);
  await nav('c-home');out.push('guard→'+w.location.hash);
  await login('citizen','demo@example.com','demo1234');out.push(lang+' login→'+w.location.hash+' '+d.querySelector('h1').textContent);
  for(const h of ['c-home','c-find','c-requests','c-regs','c-apps','c-saved','c-notifs','c-household','c-profile','c-privacy','c-volunteer','creq-SR-1001','creq-SR-1002','camp-c102','org-o1','scheme-nphce'])out.push(lang+' '+h+' → '+await nav(h));
  for(const k of ['camp','prog','scheme']){await nav('c-home');click(`[data-act=tab][data-arg="rec|${k}"]`);await sleep(10)}
  for(const k of ['info','closed','draft','all']){await nav('c-requests');click(`[data-act=tab][data-arg="req|${k}"]`);await sleep(10)}
  await nav('c-home');click('[data-act=notifPop]');await sleep(5);click('[data-act=profilePop]');await sleep(5);
  // wizard
  await nav('c-newrequest');submit('form[data-form=reqStep]');await sleep(10);d.querySelector('input[name=category][value="Mobility aids"]').checked=true;submit('form[data-form=reqStep]');await sleep(15);
  submit('form[data-form=reqStep]');await sleep(10);d.querySelector('#f-title').value='Wheelchair for father';d.querySelector('#f-desc').value='My father needs a wheelchair after a fall at home.';submit('form[data-form=reqStep]');await sleep(15);
  submit('form[data-form=reqStep]');await sleep(15);submit('form[data-form=reqStep]');await sleep(10);d.querySelector('input[name=consent]').checked=true;submit('form[data-form=reqStep]');await sleep(30);out.push(lang+' submitted→'+w.location.hash);
  await nav('creq-SR-1002');d.querySelector('#f-reply').value='Doctor recommended a standard walker for six weeks.';submit('form[data-form=infoReply]');await sleep(15);out.push('info reply status '+d.querySelector('.phead .badge').textContent);
  await nav('org-o1');click('[data-act=apptForm]');await sleep(5);submit('form[data-form=appt]');await sleep(5);d.querySelector('#f-reason').value='Need consultation';submit('form[data-form=appt]');await sleep(15);
  await nav('c-volunteer');submit('form[data-form=volReg]');await sleep(5);d.querySelector('input[name=skills][value=Marathi]').checked=true;submit('form[data-form=volReg]');await sleep(15);
  await nav('volunteer');click('[data-act=applyOpp][data-arg=v1]');await sleep(5);click('[data-act=confirmYes]');await sleep(10);
  await nav('c-household');click('[data-act=addMember]');await sleep(5);submit('form[data-form=member]');await sleep(5);d.querySelector('#f-name').value='Ravi';d.querySelector('#f-relation').value='Father';d.querySelector('#f-age').value='70';submit('form[data-form=member]');await sleep(10);click('[data-act=recordConsent]');await sleep(5);click('[data-act=confirmYes]');await sleep(10);
  await nav('camp-c102');click('[data-act=register]');await sleep(5);submit('form[data-form=confirmReg]');await sleep(5);d.querySelector('input[name=ok]').checked=true;submit('form[data-form=confirmReg]');await sleep(10);out.push('reg ref '+(d.querySelector('.modal .ref')||{}).textContent);click('[data-act=close]');
  await nav('c-regs');click('[data-act=cancelReg]');await sleep(5);click('[data-act=confirmYes]');await sleep(10);
  await nav('c-profile');submit('form[data-form=profile]');await sleep(10);
  await nav('elig-pmmvy');submit('form[data-form=elig]');await sleep(5);d.querySelector('#f-q_age').value='30';d.querySelector('input[name=q_preg][value=unsure]').checked=true;submit('form[data-form=elig]');await sleep(5);
  await nav('c-privacy');click('[data-act=limitShare]');await sleep(5);click('[data-act=confirmYes]');await sleep(10);
  click('[data-act=displayModal]');await sleep(5);click('[data-act=close]');
  
  await nav('c-home');click('[data-act=logout]');await sleep(20);
  // org
  await login('org','ngo@example.com','ngo12345');out.push(lang+' org→'+w.location.hash);
  for(const h of ['o-home','o-requests','o-referrals','o-programs','o-volunteers','o-camps','o-donations','o-profile','o-reports','o-team'])out.push(h+' → '+await nav(h));
  await nav('o-requests');click('[data-act=orgCase]');await sleep(5);submit('form[data-form=caseAction]','button[value=accepted]');await sleep(10);
  click('[data-act=tab][data-arg="oreq|active"]');await sleep(5);click('[data-act=orgCase]');await sleep(5);click('[data-act=referForm]');await sleep(5);d.querySelector('#f-toOrg').selectedIndex=1;d.querySelector('#f-reason').value='Needs food support';d.querySelector('input[name=shared]:not([disabled])').checked=true;d.querySelector('input[name=consent]').checked=true;submit('form[data-form=referral]');await sleep(10);out.push('referral→'+w.location.hash);
  await nav('o-requests');click('[data-act=tab][data-arg="oreq|appts"]');await sleep(5);click('[data-act=apptConfirm]');await sleep(5);d.querySelector('#f-time').value='24 Oct 11 AM';submit('form[data-form=apptConfirm]');await sleep(5);
  await nav('o-volunteers');click('[data-act=recordHours]');await sleep(5);d.querySelector('#f-hours').value='5';submit('form[data-form=hours]');await sleep(5);
  await nav('o-programs');click('[data-act=progForm]');await sleep(5);submit('form[data-form=progSave]');await sleep(5);click('[data-act=close]');
  await nav('o-camps');click('[data-act="campForm"]');await sleep(5);submit('form[data-form=campSave]','button[value=draft]');await sleep(5);out.push('camp errs '+d.querySelectorAll('.err:not([hidden])').length);click('[data-act=close]');
  click('[data-act=logout]');await sleep(20);
  await login('admin','admin@example.com','admin1234');
  for(const h of ['a-home','a-requests','a-orgs','a-camps','a-regs','a-schemes','a-citizens','a-reports','a-audit'])out.push(h+' → '+await nav(h));
  await nav('a-requests');const s=d.querySelector('form[data-form=route] select');if(s){s.selectedIndex=1;submit('form[data-form=route]');await sleep(10)}
  await nav('a-orgs');click('[data-act=ver][data-arg="o5|verified"]');await sleep(5);click('[data-act=confirmYes]');await sleep(5);
  await nav('a-camps');click('[data-act=campForm][data-arg=c101]');await sleep(5);d.querySelector('#f-venue').value='New Hall';submit('form[data-form=campSave]','button[value=keep]');await sleep(10);
  await nav('a-regs');click('[data-act=mark]');await sleep(5);
  click('[data-act=logout]');await sleep(20);
 }
 // the citizen got the venue change notice?
 w.eval("ui.lang='en'");
 console.log(out.join('\n'));console.log('ERRORS',errs.length,errs.slice(0,8));
 process.exit(errs.length?1:0)})();
