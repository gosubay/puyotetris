"""Independent integer implementation of Puyo Nexus oldid=200816 pseudocode.
Run with Python; golden results are checked by the JavaScript suite.
"""
import hashlib,json
from pathlib import Path
def draw(seed,n):
    seed=(seed*0x5D588B65+0x269EC3)&0xffffffff
    return seed,((seed>>16)*n)>>16
def reference(seed):
    rng=seed; colors=list('RGBYP'); palette=''
    for n in range(5,0,-1):
        rng,i=draw(rng,n); palette+=colors.pop(i)
    pools={}
    for n in (3,4,5):
        pool=[i%n for i in range(256)]
        for length in (16,32,64):
            for row in range(256//length-1):
                for _ in range(length//2):
                    rng,i=draw(rng,length); rng,j=draw(rng,length)
                    i+=row*length; j+=(row+1)*length
                    pool[i],pool[j]=pool[j],pool[i]
        pools[n]=pool
    pools[4][:4]=pools[3][:4]; pools[5][:4]=pools[3][:4]
    return dict(seed=seed,rng=rng,palette=palette,
        hashes={n:hashlib.sha256(bytes(pool)).hexdigest() for n,pool in pools.items()},
        prefix=''.join(palette[i] for i in pools[4][:32]))
target=Path(__file__).with_name('puyo-golden.json')
target.write_text(json.dumps([reference(s) for s in (0,1,42,4660,34066,65535)],indent=2)+'\n')
