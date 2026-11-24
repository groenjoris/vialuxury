# Pay-off "Dit moeten we vaker doen!" als witte tekst op transparant (2x), voor in de zwarte mailkop
# onder het logo, in vijf lettertypes. Elke regel is precies even breed als het logo (201 px): de
# lettergrootte wordt daarop afgesteld. Draaien: python3 scripts/mail-graphics/payoff-header.py
from PIL import Image, ImageDraw, ImageFont
TEXT = "Dit moeten we vaker doen!"
OUT = "public/images/mail/crm/payoff-%s.png"
LOGO_WIDTH = 201
FONTS = [
    ("oooh-baby", "public/fonts/oooh-baby/OoohBaby-Regular.ttf"),
    ("biro-script", "public/fonts/biro/Biro_Script_reduced.ttf"),
    ("bradley-hand", "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf"),
    ("basis-grotesque", "public/fonts/basis-grotesque/basisgrotesque-medium.ttf"),
    ("recoleta", "public/fonts/recoleta/Recoleta-SemiBold.ttf"),
]
S = 2
probe = ImageDraw.Draw(Image.new("L", (10, 10)))
for key, path in FONTS:
    target = LOGO_WIDTH * S
    # lettergrootte zoeken waarbij de inkt precies de logobreedte vult
    size = 40.0
    for _ in range(6):
        l, t, r, b = probe.textbbox((0, 0), TEXT, font=ImageFont.truetype(path, size))
        size *= target / (r - l)
    f = ImageFont.truetype(path, size)
    l, t, r, b = probe.textbbox((0, 0), TEXT, font=f)
    im = Image.new("RGBA", (target, b - t + 2 * S), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((-l + (target - (r - l)) / 2, S - t), TEXT, font=f, fill=(255, 255, 255, 255))
    im.save(OUT % key)
    print(key, im.width // S, round(im.height / S), "font", round(size / S, 1))
