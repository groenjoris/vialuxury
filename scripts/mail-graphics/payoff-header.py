# Pay-off "Dit moeten we vaker doen !" als witte tekst op transparant (2x), voor in de zwarte mailkop
# onder het logo, in drie lettertypes. Elke regel is precies even breed als het logo (201 px): de
# lettergrootte wordt daarop afgesteld. Het uitroepteken hoort er altijd bij en staat met een kleine
# ruimte (GAP, deel van de lettergrootte) los van de laatste letter.
# Draaien: python3 scripts/mail-graphics/payoff-header.py  (daarna ?v= in CrmHeader.tsx ophogen)
from PIL import Image, ImageDraw, ImageFont
BODY, MARK = "Dit moeten we vaker doen", "!"
GAP = 0.16
OUT = "public/images/mail/crm/payoff-%s.png"
LOGO_WIDTH = 201
# (sleutel, fontbestand, gewicht voor een variabel font of None)
FONTS = [
    ("caveat", "public/fonts/caveat/Caveat-Variable.ttf", 600),
    ("lora", "public/fonts/lora/Lora-Italic-Variable.ttf", 500),  # Lora Medium Italic
    ("recoleta", "public/fonts/recoleta/Recoleta-Light.otf", None),
]
# Lettertypes waarvan het uitroepteken een haarlijn is: iets aandikken, zodat het klein ook leest
THIN_EXCLAMATION: set[str] = set()
S = 2
probe = ImageDraw.Draw(Image.new("L", (10, 10)))

def load(path, size, weight=None):
    f = ImageFont.truetype(path, size)
    if weight:  # variabel font: gewicht kiezen (Caveat halfvet, Lora medium)
        f.set_variation_by_axes([weight])
    return f

def measure(f, size):
    """Inktvak van de hele regel: (links, boven, rechts, onder) en de x van het uitroepteken."""
    bl, bt, br, bb = probe.textbbox((0, 0), BODY, font=f)
    mx = br + GAP * size
    ml, mt, mr, mb = probe.textbbox((mx, 0), MARK, font=f)
    return bl, min(bt, mt), mr, max(bb, mb), mx

for key, path, weight in FONTS:
    target = LOGO_WIDTH * S
    extra = S if key in THIN_EXCLAMATION else 0  # ruimte voor de aangedikte rand rechts
    size = 40.0
    for _ in range(8):
        l, t, r, b, mx = measure(load(path, size, weight), size)
        size *= (target - extra) / (r - l)
    f = load(path, size, weight)
    l, t, r, b, mx = measure(f, size)
    im = Image.new("RGBA", (target, round(b - t) + 2 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    white = (255, 255, 255, 255)
    d.text((-l, S - t), BODY, font=f, fill=white)
    if key in THIN_EXCLAMATION:
        d.text((mx - l, S - t), MARK, font=f, fill=white, stroke_width=1, stroke_fill=white)
    else:
        d.text((mx - l, S - t), MARK, font=f, fill=white)
    im.save(OUT % key)
    print(key, im.width // S, round(im.height / S), "font", round(size / S, 1))
