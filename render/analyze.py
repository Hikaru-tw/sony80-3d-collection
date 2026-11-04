from PIL import Image
import numpy as np
from scipy import ndimage as ndi
from pathlib import Path
S = Path(__file__).parent
im = np.array(Image.open(S/"front.png").convert("RGB")).astype(int)
H,W,_ = im.shape
r,g,b = im[...,0],im[...,1],im[...,2]
def comps(mask, minarea=30):
    lab,n = ndi.label(mask); out=[]
    for i in range(1,n+1):
        ys,xs=np.where(lab==i)
        if len(xs)>=minarea: out.append(dict(area=len(xs),x0=xs.min(),x1=xs.max(),y0=ys.min(),y1=ys.max(),cx=xs.mean(),cy=ys.mean()))
    return sorted(out,key=lambda c:-c['area'])
orange = (r>200)&(g>80)&(g<150)&(b<90)
cream = (r>235)&(g>228)&(b>205)
dark = (r+g+b)<330
white = (r>245)&(g>245)&(b>245)
tan = (abs(r-190)<28)&(abs(g-173)<28)&(abs(b-154)<30)
print("size",W,H)
o=comps(orange,500)[0]; print("orange band:",o)
c=comps(orange|cream,2000); print("label comps:",[ (x['x0'],x['x1'],x['y0'],x['y1'],x['area']) for x in c[:3]])
d=comps(dark,800); print("dark comps:",[ (x['x0'],x['x1'],x['y0'],x['y1'],x['area']) for x in d[:6]])
w=comps(white,80); print("white comps:",[ (x['x0'],x['x1'],x['y0'],x['y1'],x['area'],round(x['cx']),round(x['cy'])) for x in w[:12]])
win=d[0]
sub=np.zeros_like(tan); sub[win['y0']:win['y1'],win['x0']:win['x1']]=True
t=comps(tan&sub,200); print("tan in window:",[ (x['x0'],x['x1'],x['y0'],x['y1'],x['area']) for x in t[:3]])
print("window dark color:", im[win['y0']+8, (win['x0']+win['x1'])//2], " near hub:", im[int(w[0]['cy']), int(w[0]['x1'])+6])
# small dark comps (screws) anywhere
sd=[x for x in comps(dark,40) if x['area']<900]; print("small dark comps:",[ (x['x0'],x['x1'],x['y0'],x['y1'],x['area']) for x in sd[:12]])
Image.fromarray(im.astype('uint8')).crop((60,200,460,341)).resize((1200,423),Image.LANCZOS).save(S/"lower_zoom.png")
Image.fromarray(im.astype('uint8')).crop((80,90,280,200)).resize((1000,550),Image.LANCZOS).save(S/"hub_zoom.png")
