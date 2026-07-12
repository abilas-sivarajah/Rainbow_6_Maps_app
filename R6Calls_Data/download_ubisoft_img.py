import json, os, re, urllib.request, concurrent.futures
ROOT=os.path.dirname(os.path.abspath(__file__))
UB=os.path.join(ROOT,'ubisoft')
IMG=os.path.join(UB,'img')
os.makedirs(os.path.join(IMG,'operators'),exist_ok=True)
os.makedirs(os.path.join(IMG,'loadout'),exist_ok=True)
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36"

def safe(name):
    return re.sub(r'[<>:"/\\|?*]+','_',name).strip()

def fetch(url,out):
    if not url: return ('skip',out)
    if os.path.exists(out) and os.path.getsize(out)>0: return ('skip',out)
    try:
        req=urllib.request.Request(url,headers={'User-Agent':UA})
        data=urllib.request.urlopen(req,timeout=60).read()
        open(out,'wb').write(data)
        return ('ok',out)
    except Exception as e:
        return ('fail',f'{url} :: {e}')

ops=json.load(open(os.path.join(UB,'operators.json'),encoding='utf-8'))
cat=json.load(open(os.path.join(UB,'weapons_catalogue.json'),encoding='utf-8'))

jobs=[]
# operator icon + render
for o in ops:
    slug=o['slug']
    if o.get('operatorIcon'):
        p=f'img/operators/{slug}_icon.png'; o['iconLocal']=p
        jobs.append((o['operatorIcon'],os.path.join(UB,p)))
    if o.get('operatorImage'):
        p=f'img/operators/{slug}_render.png'; o['imageLocal']=p
        jobs.append((o['operatorImage'],os.path.join(UB,p)))

# catalogue images (unique by name) -> map name->local
name2local={}
for w in cat:
    if w.get('image'):
        fn=safe(w['name'])+'.png'
        p=f'img/loadout/{fn}'; w['imageLocal']=p; name2local[w['name']]=p
        jobs.append((w['image'],os.path.join(UB,p)))
    else:
        w['imageLocal']=None

# propagate local path into each operator's loadout
for o in ops:
    for wp in o['loadout']:
        wp['imageLocal']=name2local.get(wp['name'])

ok=skip=0; fails=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    for st,info in ex.map(lambda a:fetch(*a),jobs):
        if st=='ok': ok+=1
        elif st=='skip': skip+=1
        else: fails.append(info)

json.dump(ops, open(os.path.join(UB,'operators.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(cat, open(os.path.join(UB,'weapons_catalogue.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)
print(f"Downloads: OK {ok}, Skip {skip}, Fehler {len(fails)}")
for f in fails[:30]: print("  FAIL",f)
print("Lokale Pfade in JSONs eingetragen.")
