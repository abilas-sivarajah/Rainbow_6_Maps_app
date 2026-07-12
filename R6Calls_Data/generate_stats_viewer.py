# -*- coding: utf-8 -*-
import json, os
UB=os.path.dirname(os.path.abspath(__file__))+'/ubisoft'
UB=os.path.normpath(UB)
ops=json.load(open(os.path.join(UB,'operators.json'),encoding='utf-8'))
cat=json.load(open(os.path.join(UB,'weapons_catalogue.json'),encoding='utf-8'))

CSS = """
*{box-sizing:border-box}
body{margin:0;background:#0f1218;color:#e7ebf3;font-family:'Segoe UI',system-ui,sans-serif}
a{color:inherit}
header{position:sticky;top:0;z-index:30;background:#0a0d13;border-bottom:1px solid #1e2534;padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header h1{font-size:17px;margin:0;color:#8fd0ff}
header .lnk{font-size:13px;color:#9fb0c6;text-decoration:none;padding:5px 9px;border:1px solid #263042;border-radius:6px}
header .lnk:hover{border-color:#3b82f6;color:#cfe4ff}
input[type=search]{background:#161b26;border:1px solid #273244;color:#e7ebf3;padding:7px 11px;border-radius:7px;font-size:14px;min-width:170px}
.chip{background:#161b26;border:1px solid #273244;color:#c7d2e2;padding:6px 11px;border-radius:20px;cursor:pointer;font-size:13px;user-select:none}
.chip.active{background:#2563eb;border-color:#2563eb;color:#fff}
.chip.att.active{background:#e8712f;border-color:#e8712f}
.chip.def.active{background:#2f7fe8;border-color:#2f7fe8}
.count{color:#7c889c;font-size:13px;margin-left:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:13px;padding:16px}
.card{background:#141924;border:1px solid #1f2736;border-radius:12px;overflow:hidden;cursor:pointer;transition:.15s;display:flex;flex-direction:column}
.card:hover{border-color:#3b82f6;transform:translateY(-3px)}
.card .imgwrap{aspect-ratio:1;background:radial-gradient(circle at 50% 30%,#1c2534,#0d1017);display:flex;align-items:flex-end;justify-content:center;overflow:hidden}
.card .imgwrap img{width:100%;height:100%;object-fit:cover;object-position:top center}
.card.wpn .imgwrap{aspect-ratio:16/9;align-items:center}
.card.wpn .imgwrap img{object-fit:contain;padding:8px}
.card .meta{padding:8px 10px}
.card .nm{font-weight:600;font-size:14px}
.card .sb{font-size:11px;color:#8593a8;margin-top:2px;display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.badge{font-size:10px;padding:1px 6px;border-radius:10px;font-weight:600}
.att-b{background:#3a230f;color:#ff9a52}.def-b{background:#122a4a;color:#69aaff}
.pips{display:inline-flex;gap:2px}
.pip{width:8px;height:8px;border-radius:50%;background:#2a3446}
.pip.on{background:#6ee7a0}
.pip.arm.on{background:#7fb0ff}
.pip.dif.on{background:#ffcf6e}
.hp{color:#6ee7a0;font-weight:700}
.overlay{position:fixed;inset:0;background:rgba(4,6,10,.9);z-index:60;display:none;padding:20px;overflow:auto}
.overlay.show{display:block}
.modal{max-width:920px;margin:auto;background:#121722;border:1px solid #273244;border-radius:16px;overflow:hidden;position:relative}
.close{position:absolute;top:12px;right:12px;background:#e11d48;color:#fff;border:none;width:34px;height:34px;border-radius:50%;font-size:19px;cursor:pointer;z-index:2}
.mtop{display:flex;gap:22px;padding:22px;flex-wrap:wrap;background:linear-gradient(180deg,#161d2b,#121722)}
.mtop .render{width:230px;max-width:40vw;border-radius:10px;background:#0d1017;object-fit:contain}
.mtop h2{margin:0 0 2px;font-size:26px}
.mtop .real{color:#93a2b8;margin-bottom:10px}
.statbox{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0}
.statbox .s{min-width:70px}
.statbox .s .lab{font-size:11px;color:#7c889c;text-transform:uppercase;letter-spacing:.5px}
.statbox .s .val{font-size:20px;font-weight:700;margin-top:2px}
.kv{font-size:13px;color:#c7d2e2;line-height:1.7}
.kv b{color:#7c889c;font-weight:500;display:inline-block;min-width:95px}
.roles span{background:#1c2433;border:1px solid #2a3547;padding:2px 9px;border-radius:12px;font-size:12px;margin-right:5px;color:#bcd0ea}
.section{padding:0 22px 20px}
.section h3{color:#8fd0ff;font-size:15px;border-bottom:1px solid #1f2736;padding-bottom:6px;margin:18px 0 12px}
.load{display:flex;gap:12px;flex-wrap:wrap}
.load .w{background:#141924;border:1px solid #1f2736;border-radius:9px;padding:8px;width:150px;text-align:center}
.load .w img{width:100%;height:64px;object-fit:contain}
.load .w .wn{font-size:12px;font-weight:600;margin-top:5px}
.load .w .wt{font-size:10px;color:#8593a8;text-transform:uppercase}
.slotlabel{font-size:11px;color:#7c889c;text-transform:uppercase;letter-spacing:.5px;width:100%;margin:6px 0 2px}
.bio{padding:0 22px 24px;line-height:1.6;color:#c2cddd;font-size:14px}
.bio h4{color:#8fd0ff;margin:16px 0 6px}
.ability{padding:0 22px 4px;color:#c2cddd;font-size:14px;line-height:1.6}
.ability b{color:#8fd0ff}
"""

def pips(n,cls=''):
    return '<span class=pips>'+''.join(f'<span class="pip {cls} {"on" if i<n else ""}"></span>' for i in range(3))+'</span>'

ops_js=json.dumps(ops, ensure_ascii=False)
cat_js=json.dumps(cat, ensure_ascii=False)

OPERATORS_HTML = r"""<!doctype html><html lang=de><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>R6 Operatoren – Stats</title>
<style>__CSS__</style></head><body>
<header>
 <h1>R6 Operatoren &middot; Stats</h1>
 <a class=lnk href="weapons_catalogue.html">&rarr; Waffenkatalog</a>
 <a class=lnk href="../index.html">&rarr; Start</a>
 <input type=search id=q placeholder="Suche...">
 <span class="chip active" data-s="" onclick="setSide('',this)">Alle</span>
 <span class="chip att" data-s="att" onclick="setSide('att',this)">Angreifer</span>
 <span class="chip def" data-s="def" onclick="setSide('def',this)">Verteidiger</span>
 <span class=count id=count></span>
</header>
<div class=grid id=grid></div>
<div class=overlay id=ov onclick="if(event.target==this)cl()"><div class=modal id=modal></div></div>
<script>
const OPS=__OPS__;
let side='',term='';
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML;}
function pips(n,cls){let h='<span class=pips>';for(let i=0;i<3;i++)h+='<span class="pip '+cls+' '+(i<n?'on':'')+'"></span>';return h+'</span>';}
function mdToHtml(md){if(!md)return '';let h=esc(md);
 h=h.replace(/\\\[.*?\\\]/g,'[...]');
 h=h.replace(/^###\s*(.+)$/gm,'<h4>$1</h4>');
 h=h.replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/\*(.+?)\*/g,'<i>$1</i>');
 h=h.split(/\n\n+/).map(p=>p.match(/^<h4>/)?p:'<p>'+p.replace(/\n/g,'<br>')+'</p>').join('');
 return h;}
function render(){
 const g=document.getElementById('grid');g.innerHTML='';
 const list=OPS.filter(o=>(!side||(side=='att'?o.isAttacker:!o.isAttacker))&&o.name.toLowerCase().includes(term));
 document.getElementById('count').textContent=list.length+' Operatoren';
 list.forEach(o=>{
  const c=document.createElement('div');c.className='card';
  const bc=o.isAttacker?'att-b':'def-b';const bl=o.isAttacker?'ATK':'DEF';
  c.innerHTML='<div class=imgwrap><img loading=lazy src="'+(o.imageLocal||'')+'"></div>'+
   '<div class=meta><div class=nm>'+esc(o.name)+'</div>'+
   '<div class=sb><span class="badge '+bc+'">'+bl+'</span> <span class=hp>'+o.health+' HP</span></div>'+
   '<div class=sb>Speed '+pips(o.speed,'')+' &nbsp; Armor '+pips(o.armor,'arm')+'</div></div>';
  c.onclick=()=>detail(o);g.appendChild(c);
 });
}
function group(o,slot){return o.loadout.filter(w=>w.slot==slot);}
function wcard(w){return '<div class=w><img src="'+(w.imageLocal||'')+'"><div class=wn>'+esc(w.name)+'</div>'+(w.subtype?'<div class=wt>'+esc(w.subtype)+'</div>':'')+'</div>';}
function detail(o){
 const m=document.getElementById('modal');
 const prim=group(o,'primary'),sec=group(o,'secondary'),gad=group(o,'gadget'),abi=group(o,'unique-ability');
 let load='<div class=load>';
 if(prim.length){load+='<div class=slotlabel>Primärwaffen</div>'+prim.map(wcard).join('');}
 if(sec.length){load+='<div class=slotlabel>Sekundärwaffen</div>'+sec.map(wcard).join('');}
 if(gad.length){load+='<div class=slotlabel>Gadgets</div>'+gad.map(wcard).join('');}
 if(abi.length){load+='<div class=slotlabel>Spezialfähigkeit</div>'+abi.map(wcard).join('');}
 load+='</div>';
 const ab=o.ability||{};
 m.innerHTML='<button class=close onclick="cl()">&times;</button>'+
  '<div class=mtop><img class=render src="'+(o.imageLocal||'')+'">'+
  '<div style="flex:1;min-width:240px"><h2>'+esc(o.name)+'</h2><div class=real>'+esc(o.realName||'')+'</div>'+
  '<div class=statbox>'+
   '<div class=s><div class=lab>Health</div><div class="val hp">'+o.health+'</div></div>'+
   '<div class=s><div class=lab>Speed</div><div class=val>'+pips(o.speed,'')+'</div></div>'+
   '<div class=s><div class=lab>Armor</div><div class=val>'+pips(o.armor,'arm')+'</div></div>'+
   '<div class=s><div class=lab>Schwierigkeit</div><div class=val>'+pips(o.difficulty,'dif')+'</div></div>'+
  '</div>'+
  '<div class=kv><div><b>Seite</b>'+(o.isAttacker?'Angreifer':'Verteidiger')+'</div>'+
   (o.faction?'<div><b>Einheit</b>'+esc(o.faction)+'</div>':'')+
   (o.squad&&o.squad.length?'<div><b>Squad</b>'+esc([].concat(o.squad).join(', '))+'</div>':'')+
   (o.dateOfBirth?'<div><b>Geburtstag</b>'+esc(o.dateOfBirth)+'</div>':'')+
   (o.placeOfBirth?'<div><b>Herkunft</b>'+esc(o.placeOfBirth)+'</div>':'')+'</div>'+
   (o.roles&&o.roles.length?'<div class=roles style="margin-top:8px">'+o.roles.map(r=>'<span>'+esc(r)+'</span>').join('')+'</div>':'')+
  '</div></div>'+
  (ab.content?'<div class=section><h3>'+esc(ab.title||'Spezialfähigkeit')+'</h3><div class=ability>'+mdToHtml(ab.content)+'</div></div>':'')+
  '<div class=section><h3>Loadout</h3>'+load+'</div>'+
  (o.biography?'<div class=section><h3>Biografie &amp; Bericht</h3><div class=bio>'+mdToHtml(o.biography)+'</div></div>':'');
 document.getElementById('ov').classList.add('show');
 document.getElementById('ov').scrollTop=0;
}
function cl(){document.getElementById('ov').classList.remove('show');}
function setSide(s,el){side=s;document.querySelectorAll('header .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');render();}
document.getElementById('q').addEventListener('input',e=>{term=e.target.value.toLowerCase();render();});
document.addEventListener('keydown',e=>{if(e.key=='Escape')cl();});
render();
</script></body></html>"""

WEAPONS_HTML = r"""<!doctype html><html lang=de><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>R6 Waffenkatalog</title>
<style>__CSS__</style></head><body>
<header>
 <h1>R6 Waffenkatalog</h1>
 <a class=lnk href="operators_stats.html">&rarr; Operatoren</a>
 <a class=lnk href="../index.html">&rarr; Start</a>
 <input type=search id=q placeholder="Suche...">
 <span id=slots></span>
 <span class=count id=count></span>
</header>
<div class=grid id=grid></div>
<div class=overlay id=ov onclick="if(event.target==this)cl()"><div class=modal id=modal></div></div>
<script>
const CAT=__CAT__;
const SLOTS={primary:'Primärwaffen',secondary:'Sekundärwaffen',gadget:'Gadgets','unique-ability':'Fähigkeiten'};
let slot='primary',term='';
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML;}
function renderSlots(){const b=document.getElementById('slots');b.innerHTML='';
 Object.keys(SLOTS).forEach(s=>{const c=document.createElement('span');c.className='chip'+(slot==s?' active':'');c.textContent=SLOTS[s];c.onclick=()=>{slot=s;renderSlots();render();};b.appendChild(c);});}
function render(){
 const g=document.getElementById('grid');g.innerHTML='';
 const list=CAT.filter(w=>w.slot==slot&&w.name.toLowerCase().includes(term));
 document.getElementById('count').textContent=list.length+' Einträge';
 list.forEach(w=>{
  const c=document.createElement('div');c.className='card wpn';
  c.innerHTML='<div class=imgwrap><img loading=lazy src="'+(w.imageLocal||'')+'"></div>'+
   '<div class=meta><div class=nm>'+esc(w.name)+'</div><div class=sb>'+esc(w.subtype||SLOTS[w.slot])+'</div></div>';
  c.onclick=()=>detail(w);g.appendChild(c);
 });
}
function detail(w){
 const m=document.getElementById('modal');
 m.innerHTML='<button class=close onclick="cl()">&times;</button>'+
  '<div class=mtop><img class=render style="width:280px;background:#0d1017;object-fit:contain" src="'+(w.imageLocal||'')+'">'+
  '<div style="flex:1;min-width:240px"><h2>'+esc(w.name)+'</h2>'+
  '<div class=kv><div><b>Kategorie</b>'+esc(SLOTS[w.slot]||w.slot)+'</div>'+
  (w.subtype?'<div><b>Typ</b>'+esc(w.subtype)+'</div>':'')+
  '<div><b>Verwendet von</b>'+esc((w.operators||[]).join(', '))+'</div></div>'+
  '</div></div>';
 document.getElementById('ov').classList.add('show');document.getElementById('ov').scrollTop=0;
}
function cl(){document.getElementById('ov').classList.remove('show');}
document.getElementById('q').addEventListener('input',e=>{term=e.target.value.toLowerCase();render();});
document.addEventListener('keydown',e=>{if(e.key=='Escape')cl();});
renderSlots();render();
</script></body></html>"""

open(os.path.join(UB,'operators_stats.html'),'w',encoding='utf-8').write(
    OPERATORS_HTML.replace('__CSS__',CSS).replace('__OPS__',ops_js))
open(os.path.join(UB,'weapons_catalogue.html'),'w',encoding='utf-8').write(
    WEAPONS_HTML.replace('__CSS__',CSS).replace('__CAT__',cat_js))
print("operators_stats.html + weapons_catalogue.html erstellt in ubisoft/")
