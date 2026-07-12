import json, os, html
ROOT=os.path.dirname(os.path.abspath(__file__))
def load(f): return json.load(open(os.path.join(ROOT,'data',f), encoding='utf-8'))

# ---------- OPERATORS ----------
ops_raw=load('dataOperators.json')['operators']
keep=['nickName','side','organization','prevOrganization','squad','status','firstName','lastName',
      'town','state','country','age','height','weight','monthNumber','dayNumber','operation','quote',
      'biographyParagraphs','psychologicalReportParagraphs']
ops=[{k:o.get(k) for k in keep} for o in ops_raw]

# ---------- WEAPONS ----------
w=load('dataWeapons.json')
weapons=[{k:x.get(k) for k in ('name','type','country','operation','descriptionParagraphs')} for x in w['weapons']]
gadgets=[{k:x.get(k) for k in ('name','type','operation','descriptionParagraphs')} for x in w['gadgets']]
types={t['id']:t['name'] for t in w.get('types',[])}

CSS="""
*{box-sizing:border-box}
body{margin:0;background:#12151c;color:#e6e9ef;font-family:'Segoe UI',system-ui,sans-serif}
header{position:sticky;top:0;z-index:20;background:#0d1017;padding:12px 16px;border-bottom:1px solid #232838;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
header h1{font-size:18px;margin:0;color:#7cc0ff}
header a{color:#9fb3c8;text-decoration:none;font-size:14px;padding:4px 8px;border:1px solid #2a3242;border-radius:5px}
input[type=search]{background:#1b1f2a;border:1px solid #2a3242;color:#e6e9ef;padding:7px 10px;border-radius:6px;font-size:14px;min-width:180px}
.chip{background:#1b1f2a;border:1px solid #2a3242;color:#cdd6e4;padding:6px 11px;border-radius:20px;cursor:pointer;font-size:13px}
.chip.active{background:#2563eb;border-color:#2563eb;color:#fff}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px;padding:16px}
.card{background:#171b24;border:1px solid #232838;border-radius:10px;overflow:hidden;cursor:pointer;transition:.15s;display:flex;flex-direction:column}
.card:hover{border-color:#3b82f6;transform:translateY(-2px)}
.card .imgwrap{aspect-ratio:1;background:#0e1116;display:flex;align-items:center;justify-content:center;overflow:hidden}
.card img{width:100%;height:100%;object-fit:cover}
.card.weapon .imgwrap{aspect-ratio:16/9}
.card.weapon img{object-fit:contain;padding:8px}
.card .meta{padding:8px 10px}
.card .name{font-weight:600;font-size:14px}
.card .sub{font-size:12px;color:#8b97ab;margin-top:2px}
.side-att{color:#ff8c42}.side-def{color:#4aa3ff}
.overlay{position:fixed;inset:0;background:rgba(6,8,12,.85);z-index:50;display:none;padding:24px;overflow:auto}
.overlay.show{display:block}
.modal{max-width:900px;margin:auto;background:#151922;border:1px solid #2a3242;border-radius:14px;overflow:hidden}
.modal .top{display:flex;gap:20px;padding:20px;flex-wrap:wrap}
.modal .top img{max-height:340px;border-radius:8px;background:#0e1116}
.modal h2{margin:0 0 4px}
.modal .quote{font-style:italic;color:#9fb3c8;margin:8px 0}
.modal table{border-collapse:collapse;margin-top:8px;font-size:14px}
.modal td{padding:3px 12px 3px 0;color:#cdd6e4}.modal td.k{color:#7f8ba0}
.modal .bio{padding:0 20px 20px;line-height:1.55;color:#c7d0de;font-size:14px}
.modal .bio h4{color:#7cc0ff;margin:16px 0 6px}
.close{position:sticky;top:0;float:right;background:#e11d48;color:#fff;border:none;width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;margin:10px}
.count{color:#7f8ba0;font-size:13px}
"""

# ---------- OPERATORS PAGE ----------
op_js=json.dumps(ops, ensure_ascii=False)
operators_html="""<!doctype html><html lang=de><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>R6 Operatoren</title>
<style>__CSS__</style></head><body>
<header>
 <h1>R6 Operatoren</h1>
 <a href="weapons.html">&rarr; Waffen</a>
 <input type=search id=q placeholder="Suche Operator...">
 <span class=chip data-side="" onclick="setSide('',this)">Alle</span>
 <span class=chip data-side="attackers" onclick="setSide('attackers',this)">Angreifer</span>
 <span class=chip data-side="defenders" onclick="setSide('defenders',this)">Verteidiger</span>
 <span class=count id=count></span>
</header>
<div class=grid id=grid></div>
<div class=overlay id=ov onclick="if(event.target==this)close_()"><div class=modal id=modal></div></div>
<script>
const OPS=__OPS__;
const enc=encodeURIComponent;
let side='',term='';
function imgOp(n,kind){return 'img/operators/'+enc(n)+'/'+kind+'.webp';}
function sideCls(s){return s=='attackers'?'side-att':'side-def';}
function render(){
 const g=document.getElementById('grid');g.innerHTML='';
 const list=OPS.filter(o=>(!side||o.side==side)&&o.nickName.toLowerCase().includes(term));
 document.getElementById('count').textContent=list.length+' Operatoren';
 list.forEach(o=>{
  const c=document.createElement('div');c.className='card';
  c.innerHTML='<div class=imgwrap><img loading=lazy src="'+imgOp(o.nickName,'avatar')+'"></div>'+
   '<div class=meta><div class=name>'+esc(o.nickName)+'</div>'+
   '<div class="sub '+sideCls(o.side)+'">'+(o.side=='attackers'?'Angreifer':'Verteidiger')+' &middot; '+esc(o.organization||'')+'</div></div>';
  c.onclick=()=>detail(o);g.appendChild(c);
 });
}
function row(k,v){return v&&v!='Undefined'?'<tr><td class=k>'+k+'</td><td>'+esc(v)+'</td></tr>':'';}
function detail(o){
 const m=document.getElementById('modal');
 let bio=(o.biographyParagraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('');
 let psy=(o.psychologicalReportParagraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('');
 const bday=(o.dayNumber&&o.monthNumber&&o.dayNumber!='Undefined')?o.dayNumber+'.'+o.monthNumber+'.':'';
 m.innerHTML='<button class=close onclick="close_()">&times;</button>'+
  '<div class=top><img src="'+imgOp(o.nickName,'fullBody')+'">'+
  '<div><h2>'+esc(o.nickName)+'</h2>'+
  '<div class="sub '+sideCls(o.side)+'">'+(o.side=='attackers'?'Angreifer':'Verteidiger')+'</div>'+
  (o.quote?'<div class=quote>'+esc(o.quote)+'</div>':'')+
  '<table>'+row('Name',((o.firstName||'')+' '+(o.lastName||'')).trim())+row('Organisation',o.organization)+
   row('Squad',o.squad)+row('Status',o.status)+row('Land',o.country)+row('Ort',[o.town,o.state].filter(x=>x&&x!='Undefined').join(', '))+
   row('Alter',o.age)+row('Geburtstag',bday)+row('Groesse',o.height&&o.height!='Undefined'?o.height+' m':'')+
   row('Gewicht',o.weight&&o.weight!='Undefined'?o.weight+' kg':'')+row('Operation',o.operation)+'</table></div></div>'+
  '<div class=bio>'+(bio?'<h4>Biografie</h4>'+bio:'')+(psy?'<h4>Psychologischer Bericht</h4>'+psy:'')+'</div>';
 document.getElementById('ov').classList.add('show');
}
function close_(){document.getElementById('ov').classList.remove('show');}
function setSide(s,el){side=s;document.querySelectorAll('header .chip').forEach(c=>c.classList.remove('active'));el.classList.add('active');render();}
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML;}
document.getElementById('q').addEventListener('input',e=>{term=e.target.value.toLowerCase();render();});
document.querySelector('header .chip').classList.add('active');
render();
</script></body></html>"""
operators_html=operators_html.replace('__CSS__',CSS).replace('__OPS__',op_js)
open(os.path.join(ROOT,'operators.html'),'w',encoding='utf-8').write(operators_html)

# ---------- WEAPONS PAGE ----------
data_js=json.dumps({'weapons':weapons,'gadgets':gadgets,'types':types}, ensure_ascii=False)
weapons_html="""<!doctype html><html lang=de><head><meta charset=utf-8>
<meta name=viewport content="width=device-width,initial-scale=1"><title>R6 Waffen & Gadgets</title>
<style>__CSS__</style></head><body>
<header>
 <h1>R6 Waffen &amp; Gadgets</h1>
 <a href="operators.html">&rarr; Operatoren</a>
 <input type=search id=q placeholder="Suche...">
 <span class=chip data-cat="weapons" onclick="setCat('weapons',this)">Waffen</span>
 <span class=chip data-cat="gadgets" onclick="setCat('gadgets',this)">Gadgets</span>
 <span id=types></span>
 <span class=count id=count></span>
</header>
<div class=grid id=grid></div>
<div class=overlay id=ov onclick="if(event.target==this)close_()"><div class=modal id=modal></div></div>
<script>
const DATA=__DATA__;
const enc=encodeURIComponent;
let cat='weapons',ttype='',term='';
function imgW(name,c){const n=name.startsWith('.')?name.substring(1):name;return 'img/'+c+'/'+enc(n)+'.png';}
function typeName(id){return DATA.types[id]||id;}
function renderTypes(){
 const box=document.getElementById('types');box.innerHTML='';
 if(cat!='weapons'){return;}
 const used=[...new Set(DATA.weapons.map(w=>w.type))];
 const all=document.createElement('span');all.className='chip'+(ttype==''?' active':'');all.textContent='Alle Typen';all.onclick=()=>{ttype='';render();renderTypes();};box.appendChild(all);
 used.forEach(t=>{const c=document.createElement('span');c.className='chip'+(ttype==t?' active':'');c.textContent=typeName(t);c.onclick=()=>{ttype=t;render();renderTypes();};box.appendChild(c);});
}
function render(){
 const g=document.getElementById('grid');g.innerHTML='';
 let list=DATA[cat].filter(x=>x.name.toLowerCase().includes(term));
 if(cat=='weapons'&&ttype)list=list.filter(x=>x.type==ttype);
 document.getElementById('count').textContent=list.length+' '+(cat=='weapons'?'Waffen':'Gadgets');
 list.forEach(x=>{
  const c=document.createElement('div');c.className='card weapon';
  c.innerHTML='<div class=imgwrap><img loading=lazy src="'+imgW(x.name,cat)+'"></div>'+
   '<div class=meta><div class=name>'+esc(x.name)+'</div>'+
   '<div class=sub>'+esc(cat=='weapons'?typeName(x.type):x.type)+(x.country&&x.country!='Unknown'?' &middot; '+esc(x.country):'')+'</div></div>';
  c.onclick=()=>detail(x);g.appendChild(c);
 });
}
function detail(x){
 const m=document.getElementById('modal');
 let desc=(x.descriptionParagraphs||[]).map(p=>'<p>'+esc(p)+'</p>').join('');
 m.innerHTML='<button class=close onclick="close_()">&times;</button>'+
  '<div class=top><img src="'+imgW(x.name,cat)+'" style="max-height:200px">'+
  '<div><h2>'+esc(x.name)+'</h2><table>'+
  '<tr><td class=k>Typ</td><td>'+esc(cat=='weapons'?typeName(x.type):x.type)+'</td></tr>'+
  (x.country&&x.country!='Unknown'?'<tr><td class=k>Land</td><td>'+esc(x.country)+'</td></tr>':'')+
  (x.operation?'<tr><td class=k>Operation</td><td>'+esc(x.operation)+'</td></tr>':'')+
  '</table></div></div><div class=bio>'+desc+'</div>';
 document.getElementById('ov').classList.add('show');
}
function close_(){document.getElementById('ov').classList.remove('show');}
function setCat(c,el){cat=c;ttype='';document.querySelectorAll('header .chip[data-cat]').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderTypes();render();}
function esc(s){const d=document.createElement('div');d.textContent=s==null?'':s;return d.innerHTML;}
document.getElementById('q').addEventListener('input',e=>{term=e.target.value.toLowerCase();render();});
document.querySelector('header .chip[data-cat]').classList.add('active');
renderTypes();render();
</script></body></html>"""
weapons_html=weapons_html.replace('__CSS__',CSS).replace('__DATA__',data_js)
open(os.path.join(ROOT,'weapons.html'),'w',encoding='utf-8').write(weapons_html)
print("operators.html + weapons.html erstellt")
print("Operatoren:",len(ops)," Waffen:",len(weapons)," Gadgets:",len(gadgets))
