# Pay-off "Dit moeten we vaker doen!" als witte tekst op transparant (2x), voor in de zwarte mailkop
# onder het logo, in zes lettertypes. Elke regel is precies even breed als het logo (201 px): de
# lettergrootte wordt daarop afgesteld. Draaien: python3 scripts/mail-graphics/payoff-header.py
from PIL import Image, ImageDraw, ImageFont
TEXT = "Dit moeten we vaker doen!"
OUT = "public/images/mail/crm/payoff-%s.png"
LOGO_WIDTH = 201
FONTS = [
    ("oooh-baby", "public/fonts/oooh-baby/OoohBaby-Regular.ttf"),
    ("la-belle-aurore", "public/fonts/la-belle-aurore/LaBelleAurore.ttf"),
    ("caveat", "public/fonts/caveat/Caveat-Variable.ttf"),
    ("bradley-hand", "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"),
    ("basis-grotesque", "public/fonts/basis-grotesque/basisgrotesque-medium.ttf"),
    ("recoleta", "public/fonts/recoleta/Recoleta-SemiBold.ttf"),
]
S = 2
THIN_EXCLAMATION = {"oooh-baby"}
probe = ImageDraw.Draw(Image.new("L", (10, 10)))
def load(path, size):
    f = ImageFont.truetype(path, size)
    if "Variable" in path:  # Caveat: variabel font, halfvet voor leesbaarheid op zwart
        f.set_variation_by_axes([600])
    return f
for key, path in FONTS:
    target = LOGO_WIDTH * S
    # lettergrootte zoeken waarbij de inkt precies de logobreedte vult
    size = 40.0
    for _ in range(6):
        l, t, r, b = probe.textbbox((0, 0), TEXT, font=load(path, size))
        size *= target / (r - l)
    f = load(path, size)
    l, t, r, b = probe.textbbox((0, 0), TEXT, font=f)
    im = Image.new("RGBA", (target, b - t + 2 * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    x0 = -l + (target - (r - l)) / 2
    if key in THIN_EXCLAMATION:
        x0 -= S  # ruimte voor de aangedikte rand rechts
    d.text((x0, S - t), TEXT, font=f, fill=(255, 255, 255, 255))
    if key in THIN_EXCLAMATION:
        # het uitroepteken van dit lettertype is een haarlijn: iets aandikken, zodat het klein ook leest
        d.text((x0 + d.textlength(TEXT[:-1], font=f), S - t), TEXT[-1], font=f, fill=(255, 255, 255, 255), stroke_width=1, stroke_fill=(255, 255, 255, 255))
    im.save(OUT % key)
    print(key, im.width // S, round(im.height / S), "font", round(size / S, 1))
