# De gastquote “Dit moeten we vaker doen!” als geanimeerde gif voor de zwarte footer (footer 3 van de
# voorbeeldmail "Dit moeten we vaker doen"): de quote wordt in 1 seconde van links naar rechts
# geschreven, staat 3 seconden stil en begint opnieuw. Het eerste beeld is de hele quote (de 3
# seconden rust), zodat mailclients die een gif niet afspelen (Outlook op Windows) de quote tonen
# en geen leeg vlak. Gif kent geen halfdoorzichtig, dus de achtergrond is de footerkleur (#141414).
# Bron: gastquote-wit.png (guest-quote.py). Draaien: python3 scripts/mail-graphics/guest-quote-gif.py
from PIL import Image

BG = (20, 20, 20)
W = 500  # 2x van 250 px
FRAMES = 25  # 1 seconde, 40 ms per beeld
src = Image.open("public/images/mail/crm/gastquote-wit.png").convert("RGBA")
src = src.resize((W, round(src.height * W / src.width)), Image.LANCZOS)
full = Image.new("RGB", src.size, BG)
full.paste(src, (0, 0), src)
empty = Image.new("RGB", src.size, BG)

frames, durations = [full], [3000]
for i in range(FRAMES):
    x = round(W * i / FRAMES)
    fr = empty.copy()
    if x:
        fr.paste(full.crop((0, 0, x, full.height)), (0, 0))
    frames.append(fr)
    durations.append(40)
pal = full.quantize(colors=32)
frames = [f.quantize(palette=pal, dither=Image.NONE) for f in frames]
out = "public/images/mail/crm/gastquote-wit.gif"
frames[0].save(out, save_all=True, append_images=frames[1:], duration=durations, loop=0, disposal=1, optimize=False)
print(out, src.width / 2, src.height / 2)
