const KEY="mobile_command_center_v2";
const defaults={name:"",budget:0,habits:["Move","Eat well","Walk","Reset"],priorities:["","",""],days:{},tasks:[],events:[],spend:[],notes:{},weekNotes:{},actions:[
{name:"Add Reminder",icon:"＋",url:""},
{name:"Add Event",icon:"＋",url:""},
{name:"Directions",icon:"↗",url:""},
{name:"Music",icon:"♪",url:""}
]};
let s=load();
function load(){try{const old=JSON.parse(localStorage.getItem(KEY)||"{}");return {...structuredClone(defaults),...old}}catch{return structuredClone(defaults)}}
function persist(){localStorage.setItem(KEY,JSON.stringify(s))}
function save(){persist();render()}
function today(){return new Date().toISOString().slice(0,10)}
function current(){let k=today();if(!s.days[k])s.days[k]={p:{},h:{}};return s.days[k]}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function money(x){return "$"+Number(x||0).toLocaleString(undefined,{maximumFractionDigits:0})}
function weekStart(){let d=new Date(),n=(d.getDay()+6)%7;d.setDate(d.getDate()-n);d.setHours(0,0,0,0);return d}
function iso(d){return d.toISOString().slice(0,10)}
function weekDates(){let a=[],st=weekStart();for(let i=0;i<7;i++){let d=new Date(st);d.setDate(st.getDate()+i);a.push(d)}return a}
function navigate(id){document.querySelectorAll(".view,.nav button").forEach(x=>x.classList.remove("on"));document.querySelector("#"+id).classList.add("on");let b=document.querySelector(`.nav button[data-view="${id}"]`);if(b)b.classList.add("on");window.scrollTo({top:0,behavior:"smooth"});render()}
function render(){
 const d=current(),now=new Date(),hr=now.getHours(),hello=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
 document.querySelector("#greeting").textContent=s.name?hello+", "+s.name:hello;
 document.querySelector("#date").innerHTML=now.toLocaleDateString(undefined,{weekday:"long"})+"<br>"+now.toLocaleDateString(undefined,{month:"short",day:"numeric"});
 document.querySelector("#priorities").innerHTML=s.priorities.map((p,i)=>`<label class="item ${d.p[i]?"done":""}"><input type="checkbox" data-p="${i}" ${d.p[i]?"checked":""}><div class="itemtext"><input data-pt="${i}" maxlength="80" value="${esc(p)}" placeholder="Priority ${i+1}"></div></label>`).join("");
 document.querySelectorAll("[data-p]").forEach(x=>x.onchange=()=>{d.p[x.dataset.p]=x.checked;save()});
 document.querySelectorAll("[data-pt]").forEach(x=>x.onchange=()=>{s.priorities[x.dataset.pt]=x.value.trim();save()});
 document.querySelector("#habits").innerHTML=s.habits.map((h,i)=>`<button class="habit ${d.h[i]?"on":""}" data-h="${i}"><div class="habit-mark">${d.h[i]?"✓":"○"}</div><div class="habit-name">${esc(h)}</div></button>`).join("");
 document.querySelectorAll("[data-h]").forEach(x=>x.onclick=()=>{d.h[x.dataset.h]=!d.h[x.dataset.h];save()});
 const pc=Object.values(d.p).filter(Boolean).length,hc=Object.values(d.h).filter(Boolean).length,total=3+s.habits.length,score=Math.round((pc+hc)/Math.max(total,1)*100);
 document.querySelector("#score").textContent=score+"%";document.querySelector("#ring").style.background=`conic-gradient(var(--accent) ${score}%,#252c34 ${score}%)`;
 document.querySelector("#heroTitle").textContent=score===100?"Day complete":score>=60?"Good progress":score>0?"Day underway":"Start the day";
 document.querySelector("#heroSub").textContent=score===100?"Your priorities and daily basics are complete.":"Your priorities, habits and tasks roll up here.";
 document.querySelector("#priorityCount").textContent=pc+" / 3";document.querySelector("#habitCount").textContent=hc+" / "+s.habits.length;
 const open=s.tasks.filter(t=>!t.done),overdue=open.filter(t=>t.due&&t.due<today()).length;
 document.querySelector("#openTasks").textContent=open.length;document.querySelector("#taskSub").textContent=overdue?overdue+" overdue":"Nothing overdue";
 const wd=weekDates(),start=iso(wd[0]),end=iso(wd[6]);let hits=0;
 wd.forEach(x=>{let z=s.days[iso(x)];if(z)hits+=Object.values(z.h||{}).filter(Boolean).length});
 const hp=Math.round(hits/Math.max(s.habits.length*7,1)*100);document.querySelector("#habitPct").textContent=hp+"%";document.querySelector("#habitBar").style.width=hp+"%";
 const ws=s.spend.filter(x=>x.date>=start&&x.date<=end).reduce((a,b)=>a+Number(b.amount||0),0);document.querySelector("#weekSpend").textContent=money(ws);document.querySelector("#weekSpend2").textContent=money(ws);document.querySelector("#spendTotal").textContent=money(ws);
 document.querySelector("#budgetSub").textContent=s.budget?money(Math.max(s.budget-ws,0))+" remaining of "+money(s.budget):"No spending target";
 const upcoming=[...s.events].filter(e=>e.date>=today()).sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
 document.querySelector("#eventCount").textContent=upcoming.length;document.querySelector("#eventSub").textContent=upcoming[0]?upcoming[0].title+" · "+upcoming[0].date:"Nothing scheduled";
 renderNext(upcoming);renderActions();renderTasks();renderEvents();renderSpend();
 document.querySelector("#weekRange").textContent=wd[0].toLocaleDateString(undefined,{month:"short",day:"numeric"})+" – "+wd[6].toLocaleDateString(undefined,{month:"short",day:"numeric"});
 document.querySelector("#weekdays").innerHTML=wd.map(x=>{let z=s.days[iso(x)],n=z?Object.values(z.h||{}).filter(Boolean).length:0;return `<div class="wd">${x.toLocaleDateString(undefined,{weekday:"narrow"})}<div class="bubble ${n?"hit":""}">${n}</div></div>`}).join("");
 document.querySelector("#habitHits").textContent=hits;document.querySelector("#tasksDone").textContent=s.tasks.filter(t=>t.completed&&t.completed>=start&&t.completed<=end).length;document.querySelector("#weekEvents").textContent=s.events.filter(e=>e.date>=start&&e.date<=end).length;
 document.querySelector("#dailyNote").value=s.notes[today()]||"";document.querySelector("#weekNote").value=s.weekNotes[start]||"";
 document.querySelector("#displayName").value=s.name;document.querySelector("#budget").value=s.budget||"";document.querySelector("#habitNames").value=s.habits.join("\n");
 renderActionSettings();
}
function renderNext(upcoming){
 const el=document.querySelector("#nextUp"),todayEvents=upcoming.filter(e=>e.date===today()).slice(0,3);
 if(!todayEvents.length){el.innerHTML='<div class="placeholder">Calendar is not connected yet. Add events manually in Life for now; the next version will connect this area to an Apple Shortcut bridge.</div>';return}
 el.innerHTML=todayEvents.map(e=>`<div class="event"><div class="event-time">${esc(e.time||"Today")}</div><div><div class="event-title">${esc(e.title)}</div><div class="event-sub">${esc(e.note||"")}</div></div></div>`).join("");
}
function renderActions(){
 const el=document.querySelector("#quickActions");el.innerHTML=s.actions.map((a,i)=>`<button class="action ${a.url?"":"empty"}" data-action="${i}"><div class="action-icon">${esc(a.icon||"•")}</div><div class="action-name">${esc(a.name||"Action")}</div></button>`).join("");
 document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>{let a=s.actions[b.dataset.action];if(!a.url){navigate("settingsView");return}window.location.href=a.url});
}
function renderTasks(){
 const el=document.querySelector("#tasks");if(!s.tasks.length){el.innerHTML='<div class="placeholder">No tasks yet. Use Quick Capture or Add.</div>';return}
 el.innerHTML=s.tasks.map((t,i)=>`<div class="item ${t.done?"done":""}"><input type="checkbox" data-task="${i}" ${t.done?"checked":""}><div class="itemtext"><div class="task-title">${esc(t.title)}</div><div class="muted">${t.due?"Due "+t.due:"No due date"}</div></div><button class="mini" data-deltask="${i}">×</button></div>`).join("");
 document.querySelectorAll("[data-task]").forEach(x=>x.onchange=()=>{let t=s.tasks[x.dataset.task];t.done=x.checked;t.completed=x.checked?today():"";save()});
 document.querySelectorAll("[data-deltask]").forEach(x=>x.onclick=()=>{s.tasks.splice(Number(x.dataset.deltask),1);save()});
}
function renderEvents(){
 const el=document.querySelector("#events"),arr=[...s.events].sort((a,b)=>(a.date+(a.time||"")).localeCompare(b.date+(b.time||"")));
 if(!arr.length){el.innerHTML='<div class="placeholder">No manual events yet. These will eventually be supplemented by your calendar integration.</div>';return}
 el.innerHTML=arr.map(e=>{let i=s.events.indexOf(e);return `<div class="item"><div class="itemtext"><div class="task-title">${esc(e.title)}</div><div class="muted">${esc(e.date)} ${esc(e.time||"")}</div></div><button class="mini" data-delevent="${i}">×</button></div>`}).join("");
 document.querySelectorAll("[data-delevent]").forEach(x=>x.onclick=()=>{s.events.splice(Number(x.dataset.delevent),1);save()});
}
function renderSpend(){
 const el=document.querySelector("#spending"),arr=[...s.spend].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,10);
 el.innerHTML=arr.length?arr.map((x)=>`<div class="money"><span>${esc(x.label)} <span class="muted">${esc(x.date)}</span></span><strong>${money(x.amount)}</strong></div>`).join(""):'<div class="placeholder" style="margin-top:10px">No spending logged.</div>';
}
function renderActionSettings(){
 const el=document.querySelector("#actionSettings");el.innerHTML=s.actions.map((a,i)=>`<div class="settings-action"><input class="input" data-aname="${i}" value="${esc(a.name)}" placeholder="Name"><input class="input" data-aurl="${i}" value="${esc(a.url)}" placeholder="URL / Shortcut URL"><input class="input" data-aicon="${i}" value="${esc(a.icon)}" maxlength="2" aria-label="Icon"></div>`).join("");
}
document.querySelector("#captureForm").onsubmit=e=>{e.preventDefault();let x=document.querySelector("#capture"),v=x.value.trim();if(v){s.tasks.unshift({title:v,due:"",done:false,completed:""});x.value="";save()}};
document.querySelector("#addTask").onclick=()=>{let title=prompt("Task");if(!title)return;let due=prompt("Due date (YYYY-MM-DD), or leave blank","")||"";s.tasks.unshift({title:title.trim(),due,done:false,completed:""});save()};
document.querySelector("#addEvent").onclick=()=>{let title=prompt("Event");if(!title)return;let date=prompt("Date (YYYY-MM-DD)",today());if(!date)return;let time=prompt("Time (for example 3:30 PM), or leave blank","")||"";s.events.push({title:title.trim(),date,time,note:""});save()};
document.querySelector("#addSpend").onclick=()=>{let label=prompt("What did you spend on?");if(!label)return;let amount=Number(prompt("Amount","0"));if(!Number.isFinite(amount)||amount<0)return;s.spend.unshift({label:label.trim(),amount,date:today()});save()};
document.querySelector("#dailyNote").oninput=e=>{s.notes[today()]=e.target.value;persist()};
document.querySelector("#weekNote").oninput=e=>{s.weekNotes[iso(weekStart())]=e.target.value;persist()};
document.querySelector("#saveSettings").onclick=()=>{s.name=document.querySelector("#displayName").value.trim();s.budget=Math.max(0,Number(document.querySelector("#budget").value)||0);let h=document.querySelector("#habitNames").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,8);if(h.length)s.habits=h;document.querySelectorAll("[data-aname]").forEach(x=>s.actions[x.dataset.aname].name=x.value.trim()||"Action");document.querySelectorAll("[data-aurl]").forEach(x=>s.actions[x.dataset.aurl].url=x.value.trim());document.querySelectorAll("[data-aicon]").forEach(x=>s.actions[x.dataset.aicon].icon=x.value.trim()||"•");save();navigate("todayView")};
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>navigate(b.dataset.view));
document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>navigate(b.dataset.nav));
render();