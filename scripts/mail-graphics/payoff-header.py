# Pay-off "Dit moeten we vaker doen" als witte tekst op transparant (2x), voor in de zwarte mailkop
# onder het logo, in vier lettertypes. Draaien: python3 scripts/mail-graphics/payoff-header.py
from PIL import Image, ImageDraw, ImageFont
TEXT = "Dit moeten we vaker doen"
OUT = "public/images/mail/crm/payoff-%s.png"
# (sleutel, fontbestand, grootte in px bij 1x) — groottes zo gekozen dat de regel even breed oogt als het logo
FONTS = [
    ("oooh-baby", "public/fonts/oooh-baby/OoohBaby-Regular.ttf", 23),
    ("biro-script", "public/fonts/biro/Biro_Script_reduced.ttf", 21),
    ("bradley-hand", "/System/Library/Fonts/Supplemental/Bradley Hand Bold.ttf", 18),
    ("basis-grotesque", "public/fonts/basis-grotesque/basisgrotesque-medium.ttf", 15),
]
S = 2
for key, path, size in FONTS:
    f = ImageFont.truetype(path, size * S)
    l, t, r, b = ImageDraw.Draw(Image.new("L", (10, 10))).textbbox((0, 0), TEXT, font=f)
    pad = 2 * S
    im = Image.new("RGBA", (r - l + pad * 2, b - t + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((pad - l, pad - t), TEXT, font=f, fill=(255, 255, 255, 255))
    im.save(OUT % key)
    print(key, im.width // S, im.height // S)
