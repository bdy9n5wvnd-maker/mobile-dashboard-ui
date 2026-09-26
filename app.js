const KEY="mobile_dashboard_v1";
const defaults={name:"",habits:["Move","Eat well","Walk","Reset"],priorities:["","",""],days:{},tasks:[],notes:{}};
let s=load();
function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(s));render()}
function key(){return new Date().toISOString().slice(0,10)}
function current(){if(!s.days[key()])s.days[key()]={p:{},h:{}};return s.days[key()]}
function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function weekStart(){let d=new Date(),n=(d.getDay()+6)%7;d.setDate(d.getDate()-n);d.setHours(0,0,0,0);return d}
function iso(d){return d.toISOString().slice(0,10)}
function render(){
 let d=current(),now=new Date(),hour=now.getHours(),hello=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
 document.querySelector("#date").textContent=now.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
 document.querySelector("#greeting").textContent=s.name?hello+", "+s.name:hello;
 document.querySelector("#priorities").innerHTML=s.priorities.map((x,i)=>`<label class="item ${d.p[i]?"done":""}"><input type="checkbox" data-p="${i}" ${d.p[i]?"checked":""}><input class="text" data-pt="${i}" maxlength="80" value="${esc(x)}" placeholder="Priority ${i+1}"></label>`).join("");
 document.querySelectorAll("[data-p]").forEach(x=>x.onchange=()=>{d.p[x.dataset.p]=x.checked;save()});
 document.querySelectorAll("[data-pt]").forEach(x=>x.onchange=()=>{s.priorities[x.dataset.pt]=x.value.trim();save()});
 document.querySelector("#habits").innerHTML=s.habits.map((x,i)=>`<button class="habit ${d.h[i]?"on":""}" data-h="${i}">${d.h[i]?"✓ ":""}${esc(x)}</button>`).join("");
 document.querySelectorAll("[data-h]").forEach(x=>x.onclick=()=>{d.h[x.dataset.h]=!d.h[x.dataset.h];save()});
 let pc=Object.values(d.p).filter(Boolean).length,hc=Object.values(d.h).filter(Boolean).length,total=3+s.habits.length,pct=Math.round((pc+hc)/Math.max(total,1)*100);
 document.querySelector("#score").textContent=pct+"%";document.querySelector("#scorebar").style.width=pct+"%";document.querySelector("#pcount").textContent=pc+" / 3";document.querySelector("#hcount").textContent=hc+" / "+s.habits.length;
 let open=s.tasks.filter(t=>!t.done);document.querySelector("#taskcount").textContent=open.length;let overdue=open.filter(t=>t.due&&t.due<key()).length;document.querySelector("#tasksub").textContent=overdue?overdue+" overdue":"Nothing overdue";
 document.querySelector("#note").value=s.notes[key()]||"";
 document.querySelector("#tasks").innerHTML=s.tasks.length?s.tasks.map((t,i)=>`<label class="item ${t.done?"done":""}"><input type="checkbox" data-t="${i}" ${t.done?"checked":""}><div style="flex:1"><div>${esc(t.title)}</div><div class="muted">${t.due?"Due "+t.due:"No due date"}</div></div></label>`).join(""):'<div class="muted">No tasks yet.</div>';
 document.querySelectorAll("[data-t]").forEach(x=>x.onchange=()=>{let t=s.tasks[x.dataset.t];t.done=x.checked;t.completed=x.checked?key():"";save()});
 let ws=weekStart(),hits=0;for(let i=0;i<7;i++){let x=new Date(ws);x.setDate(ws.getDate()+i);let a=s.days[iso(x)];if(a)hits+=Object.values(a.h||{}).filter(Boolean).length}
 document.querySelector("#weekhabits").textContent=Math.round(hits/Math.max(s.habits.length*7,1)*100)+"%";
 let start=iso(ws),end=new Date(ws);end.setDate(ws.getDate()+6);document.querySelector("#weekdone").textContent=s.tasks.filter(t=>t.completed&&t.completed>=start&&t.completed<=iso(end)).length;
 document.querySelector("#name").value=s.name;document.querySelector("#habitnames").value=s.habits.join("\n");
}
document.querySelector("#captureForm").onsubmit=e=>{e.preventDefault();let x=document.querySelector("#capture"),v=x.value.trim();if(v){s.tasks.unshift({title:v,due:"",done:false,completed:""});x.value="";save()}};
document.querySelector("#note").oninput=e=>{s.notes[key()]=e.target.value;localStorage.setItem(KEY,JSON.stringify(s))};
document.querySelector("#newTask").onclick=()=>{let title=prompt("Task");if(!title)return;let due=prompt("Due date (YYYY-MM-DD), or leave blank","")||"";s.tasks.unshift({title:title.trim(),due,done:false,completed:""});save()};
document.querySelector("#saveSettings").onclick=()=>{s.name=document.querySelector("#name").value.trim();let h=document.querySelector("#habitnames").value.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,8);if(h.length)s.habits=h;save()};
document.querySelectorAll(".nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".nav button,.view").forEach(x=>x.classList.remove("on"));b.classList.add("on");document.querySelector("#"+b.dataset.v).classList.add("on");window.scrollTo(0,0);render()});
render();