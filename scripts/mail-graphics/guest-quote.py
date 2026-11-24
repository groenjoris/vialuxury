# De gastquote “Dit moeten we vaker doen!” in Caveat (halfvet) als afbeelding op transparant (2x),
# in donker (voor lichte vlakken) en wit (voor de zwarte footer). Een afbeelding, want een webfont
# werkt niet in elke mailclient. Draaien: python3 scripts/mail-graphics/guest-quote.py
# (daarna de maten en ?v= in GuestQuote in email-designs/components/crm.tsx bijwerken)
from PIL import Image, ImageDraw, ImageFont
TEXT = "“Dit moeten we vaker doen!”"
FONT = "public/fonts/caveat/Caveat-Variable.ttf"
SIZE = 38  # px bij 1x
S = 2
f = ImageFont.truetype(FONT, SIZE * S)
f.set_variation_by_axes([600])
l, t, r, b = ImageDraw.Draw(Image.new("L", (10, 10))).textbbox((0, 0), TEXT, font=f)
pad = S
for name, color in [("donker", (20, 20, 20, 255)), ("wit", (255, 255, 255, 255))]:
    im = Image.new("RGBA", (r - l + 2 * pad, b - t + 2 * pad), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((pad - l, pad - t), TEXT, font=f, fill=color)
    im.save(f"public/images/mail/crm/gastquote-{name}.png")
    print(name, im.width / S, im.height / S)
