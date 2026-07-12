import json, os, urllib.parse, urllib.request, concurrent.futures
BASE="https://www.r6calls.com"
ROOT=os.path.dirname(os.path.abspath(__file__))
def load(f): return json.load(open(os.path.join(ROOT,'data',f), encoding='utf-8'))
def fetch(url, out):
    if os.path.exists(out) and os.path.getsize(out)>0: return ('skip',out)
    try:
        req=urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
        data=urllib.request.urlopen(req, timeout=60).read()
        os.makedirs(os.path.dirname(out), exist_ok=True)
        open(out,'wb').write(data)
        return ('ok',out)
    except Exception as e:
        return ('fail', f'{out} :: {e}')
def enc(s): return urllib.parse.quote(s)

jobs=[]
# Operators
ops=load('dataOperators.json')['operators']
for o in ops:
    n=o['nickName']
    for kind in ('avatar','fullBody'):
        url=f"{BASE}/img/operators/{enc(n)}/{kind}.webp"
        out=os.path.join(ROOT,'img','operators',n,f'{kind}.webp')
        jobs.append((url,out))
# Weapons
w=load('dataWeapons.json')
for x in w['weapons']:
    name=x['name'][1:] if x['name'].startswith('.') else x['name']
    jobs.append((f"{BASE}/img/weapons/{enc(name)}.png", os.path.join(ROOT,'img','weapons',f'{name}.png')))
for g in w['gadgets']:
    name=g['name'][1:] if g['name'].startswith('.') else g['name']
    jobs.append((f"{BASE}/img/gadgets/{enc(name)}.png", os.path.join(ROOT,'img','gadgets',f'{name}.png')))

print(f"Jobs gesamt: {len(jobs)}")
ok=skip=0; fails=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    for st,info in ex.map(lambda a: fetch(*a), jobs):
        if st=='ok': ok+=1
        elif st=='skip': skip+=1
        else: fails.append(info)
print(f"OK: {ok}  Skip: {skip}  Fehler: {len(fails)}")
for f in fails[:40]: print("  FAIL", f)
