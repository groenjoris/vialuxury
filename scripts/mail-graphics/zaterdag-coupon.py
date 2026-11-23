import random, math, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1400,740; SS=2
F='public/fonts/'
def font(name,size): return ImageFont.truetype(F+name,size*SS)
REC=lambda s: font('recoleta/Recoleta-Bold.ttf',s)
BAS=lambda s: font('basis-grotesque/basisgrotesque-bold.ttf',s)
NAVY=(13,19,34); GOLD=(243,206,115); CREAM=(250,240,214); ORANGE=(240,140,60); INK=(20,20,20)
random.seed(15)
bg=Image.new('RGB',(W*SS,H*SS),NAVY)
# zachte gloed achter de coupon
glow=Image.new('L',(W*SS,H*SS),0)
ImageDraw.Draw(glow).ellipse([W*SS*0.18,H*SS*0.05,W*SS*0.82,H*SS*0.95],fill=90)
glow=glow.filter(ImageFilter.GaussianBlur(160*SS))
bg=Image.composite(Image.new('RGB',bg.size,(38,52,88)),bg,glow)
# stralen
rays=Image.new('RGBA',bg.size,(0,0,0,0)); rd=ImageDraw.Draw(rays)
cx,cy=W*SS/2,H*SS/2
for i in range(24):
    a=i*math.pi/12; b=a+math.pi/36; R=W*SS
    rd.polygon([(cx,cy),(cx+R*math.cos(a),cy+R*math.sin(a)),(cx+R*math.cos(b),cy+R*math.sin(b))],fill=(255,255,255,9))
bg=Image.alpha_composite(bg.convert('RGBA'),rays)
# confetti
conf=Image.new('RGBA',bg.size,(0,0,0,0))
def piece(x,y,kind,col,size,rot):
    s=int(size*SS); t=Image.new('RGBA',(s*4,s*4),(0,0,0,0)); d=ImageDraw.Draw(t); c=s*2
    if kind=='rect': d.rounded_rectangle([c-s,c-s*0.38,c+s,c+s*0.38],radius=s*0.12,fill=col)
    elif kind=='dot': d.ellipse([c-s*0.5,c-s*0.5,c+s*0.5,c+s*0.5],fill=col)
    elif kind=='ring': d.ellipse([c-s*0.6,c-s*0.6,c+s*0.6,c+s*0.6],outline=col,width=max(2,int(s*0.18)))
    elif kind=='star':
        pts=[]
        for k in range(8):
            r=s*(1.0 if k%2==0 else 0.28); a=k*math.pi/4
            pts.append((c+r*math.cos(a),c+r*math.sin(a)))
        d.polygon(pts,fill=col)
    elif kind=='curl':
        pts=[(c-s*1.6+i*s*0.08, c+math.sin(i*0.32)*s*0.45) for i in range(41)]
        d.line(pts,fill=col,width=max(3,int(s*0.2)),joint='curve')
    t=t.rotate(rot,resample=Image.BICUBIC)
    conf.alpha_composite(t,(int(x*SS-s*2),int(y*SS-s*2)))
cols=[GOLD,GOLD,CREAM,ORANGE,(255,255,255)]
n=0
while n<150:
    x=random.uniform(-10,W+10); y=random.uniform(-10,H+10)
    # midden vrijhouden voor de coupon
    if abs(x-W/2)<430 and abs(y-H/2)<215: continue
    kind=random.choice(['rect','rect','rect','dot','dot','ring','star','curl'])
    size=random.uniform(9,22) if kind!='curl' else random.uniform(16,26)
    col=random.choice(cols)+(random.choice([255,255,220,170]),)
    piece(x,y,kind,col,size,random.uniform(0,360)); n+=1
bg=Image.alpha_composite(bg,conf)
# coupon
CW,CH=800,360; pad=80
cp=Image.new('RGBA',((CW+pad*2)*SS,(CH+pad*2)*SS),(0,0,0,0)); d=ImageDraw.Draw(cp)
x0,y0=pad*SS,pad*SS; x1,y1=x0+CW*SS,y0+CH*SS
d.rounded_rectangle([x0,y0,x1,y1],radius=26*SS,fill=GOLD)
split=x0+int(CW*0.735)*SS
nr=22*SS
for (px,py) in [(split,y0),(split,y1)]:
    d.ellipse([px-nr,py-nr,px+nr,py+nr],fill=(0,0,0,0))
# perforatie
yy=y0+nr+10*SS
while yy<y1-nr-10*SS:
    d.line([(split,yy),(split,yy+12*SS)],fill=INK+(150,),width=3*SS); yy+=24*SS
# binnenrand links
d.rounded_rectangle([x0+16*SS,y0+16*SS,split-22*SS,y1-16*SS],radius=14*SS,outline=INK+(70,),width=2*SS)
def ctext(txt,f,cxp,y,fill=INK,spacing=0):
    if spacing:
        w=sum(d.textlength(ch,font=f) for ch in txt)+spacing*(len(txt)-1); x=cxp-w/2
        for ch in txt:
            d.text((x,y),ch,font=f,fill=fill); x+=d.textlength(ch,font=f)+spacing
    else:
        w=d.textlength(txt,font=f); d.text((cxp-w/2,y),txt,font=f,fill=fill)
lc=(x0+split)/2
# lint "Zaterdag kortingsdag"
f=BAS(21); lab='ZATERDAG KORTINGSDAG'; sp=4*SS
lw=sum(d.textlength(ch,font=f) for ch in lab)+sp*(len(lab)-1)
d.rounded_rectangle([lc-lw/2-22*SS,y0+38*SS,lc+lw/2+22*SS,y0+84*SS],radius=23*SS,fill=INK)
ctext(lab,f,lc,y0+48*SS,fill=GOLD,spacing=sp)
# €15
f=REC(190); ctext('€15',f,lc-6*SS,y0+78*SS)
f=REC(40); ctext('persoonlijke korting',f,lc,y0+272*SS)
# strook rechts: alleen vandaag (verticaal)
stub=Image.new('RGBA',(CH*SS,int(CW*0.265)*SS),(0,0,0,0)); sd=ImageDraw.Draw(stub)
f1=REC(46); f2=BAS(19)
t1='Alleen'; t2='vandaag'
for i,(t,f_) in enumerate([(t1,f1),(t2,f1)]):
    w=sd.textlength(t,font=f_); sd.text(((CH*SS-w)/2,(48+i*50)*SS),t,font=f_,fill=INK)
t3='GELDIG OP ZATERDAG'; sp=3*SS
w=sum(sd.textlength(ch,font=f2) for ch in t3)+sp*(len(t3)-1); x=(CH*SS-w)/2
for ch in t3:
    sd.text((x,160*SS),ch,font=f2,fill=INK+(190,)); x+=sd.textlength(ch,font=f2)+sp
stub=stub.rotate(90,expand=True)
cp.alpha_composite(stub,(split,y0))
cp=cp.rotate(5,resample=Image.BICUBIC)
# schaduw
sh=Image.new('RGBA',cp.size,(0,0,0,0)); sh.putalpha(cp.getchannel('A').point(lambda v:int(v*0.55)))
sh=sh.filter(ImageFilter.GaussianBlur(22*SS))
ox=int((W*SS-cp.width)/2); oy=int((H*SS-cp.height)/2)
bg.alpha_composite(sh,(ox+10*SS,oy+22*SS)); bg.alpha_composite(cp,(ox,oy))
# een paar confetti over de coupon heen
conf=Image.new('RGBA',bg.size,(0,0,0,0))
for (x,y,k,c,s,r) in [(318,196,'star',CREAM,20,10),(1088,548,'star',(255,255,255),17,20),(1060,170,'rect',ORANGE,16,35),(338,560,'rect',CREAM,15,-30),(1108,300,'dot',ORANGE,14,0),(290,360,'ring',(255,255,255),14,0)]:
    piece(x,y,k,c+(255,),s,r)
bg=Image.alpha_composite(bg,conf)
out=bg.convert('RGB').resize((W,H),Image.LANCZOS)
out.save(sys.argv[1],quality=90,optimize=True)
