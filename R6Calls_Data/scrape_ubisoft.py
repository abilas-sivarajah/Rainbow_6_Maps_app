import re, json, os, urllib.request, concurrent.futures
ROOT=os.path.dirname(os.path.abspath(__file__))
OUT=os.path.join(ROOT,'ubisoft'); os.makedirs(OUT,exist_ok=True)
BASE="https://www.ubisoft.com/en-us/game/rainbow-six/siege/game-info/operators/"
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
SLUGS="ace alibi amaru aruni ash azami bandit blackbeard blitz brava buck capitao castle caveira clash deimos denari doc dokkaebi echo ela fenrir finka flores frost fuze glaz goyo gridlock grim hibana iana iq jackal jager kaid kali kapkan lesion lion maestro maverick melusi mira montagne mozzie mute nokk nomad oryx osa pulse ram rauora rook sens sentry skopos sledge smoke solid-snake solis striker tachanka thatcher thermite thorn thunderbird tubarao twitch valkyrie vigil wamai warden ying zero zofia".split()
# Health system: Speed 3 -> 100 HP, Speed 2 -> 110 HP, Speed 1 -> 125 HP
HP={3:100,2:110,1:125}

def clean(txt):
    if not txt: return txt
    # fix mojibake: page is utf-8 but curl saved bytes; here we re-decode common bad chars
    return txt

def fetch(slug):
    try:
        req=urllib.request.Request(BASE+slug, headers={'User-Agent':UA})
        html=urllib.request.urlopen(req,timeout=60).read().decode('utf-8','replace')
        m=re.search(r'window\.__PRELOADED_STATE__\s*=\s*(\{.*)', html, re.S)
        if not m: return (slug,None,'no state')
        obj,_=json.JSONDecoder().raw_decode(m.group(1))
        cg=obj.get('ContentfulGraphQl',{})
        key=next((k for k in cg if k.startswith('OperatorDetailsContainer-')),None)
        if not key: return (slug,None,'no container')
        content=cg[key]['content']
        h=content.get('header',{})
        lo=content.get('loadout',[]) or []
        def imgurl(o):
            try: return o.get('url')
            except: return None
        weapons=[]
        for w in lo:
            weapons.append({
                'name':w.get('title'),
                'slot':w.get('weaponType'),          # primary / secondary / gadget / unique-ability
                'subtype':w.get('weaponSubtype'),
                'image':(w.get('weaponImage') or {}).get('url')
            })
        speed=h.get('speed'); armor=h.get('armor')
        rec={
            'slug':slug,
            'name':h.get('operatorName'),
            'realName':h.get('realName'),
            'side':h.get('side'),
            'isAttacker':h.get('isAttacker'),
            'squad':h.get('squad'),
            'faction':h.get('factionName'),
            'speed':speed,
            'armor':armor,
            'health':HP.get(speed),
            'difficulty':h.get('difficulty'),
            'roles':h.get('roles'),
            'ability':h.get('ability'),
            'dateOfBirth':(content.get('biography') or {}).get('dateOfBirth') or h.get('dateOfBirth'),
            'placeOfBirth':(content.get('biography') or {}).get('placeOfBirth') or h.get('placeOfBirth'),
            'biography':(content.get('biography') or {}).get('biography'),
            'operatorIcon':imgurl(h.get('operatorIcon') or {}),
            'operatorImage':imgurl(h.get('operatorImage') or {}),
            'loadout':weapons,
        }
        return (slug,rec,'ok')
    except Exception as e:
        return (slug,None,str(e)[:80])

results={}; fails=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for slug,rec,st in ex.map(fetch,SLUGS):
        if rec: results[slug]=rec
        else: fails.append((slug,st))
        print(('OK  ' if rec else 'FAIL')+f' {slug}'+('' if rec else '  '+st))

operators=[results[s] for s in sorted(results)]
json.dump(operators, open(os.path.join(OUT,'operators.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)

# Build weapon catalogue from all loadouts (unique by name), slot=primary/secondary only for "weapons"
wmap={}
for op in operators:
    for w in op['loadout']:
        n=w['name']
        if not n: continue
        if n not in wmap:
            wmap[n]={'name':n,'slot':w['slot'],'subtype':w['subtype'],'image':w['image'],'operators':[]}
        wmap[n]['operators'].append(op['name'])
weapons=sorted(wmap.values(), key=lambda x:x['name'])
json.dump(weapons, open(os.path.join(OUT,'weapons_catalogue.json'),'w',encoding='utf-8'), ensure_ascii=False, indent=1)

print(f"\nOperatoren: {len(operators)}  Fehler: {len(fails)}")
print(f"Waffen/Gadgets im Katalog (aus Loadouts): {len(weapons)}")
for s,st in fails: print("  FAIL",s,st)
