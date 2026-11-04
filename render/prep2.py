"""Cut the paper-label artwork out of the flattened illustration (side A) and derive a side-B variant."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
S = Path(__file__).parent
front = Image.open(S / "front.png").convert("RGBA")
LABEL = (30, 32, 488, 245)            # label incl. its dark outline, in front.png px
a = front.crop(LABEL)
a.save(S / "label_a.png")
a.resize((a.width // 2, a.height // 2), Image.LANCZOS).save(S / "label_a_lo.png")

b = a.copy()
d = ImageDraw.Draw(b)
# the "A" sits at ~(62,160) in front.png -> (32,128) in label space; cover it with orange and write "B"
ax, ay = 62 - LABEL[0], 160 - LABEL[1]
d.rectangle((12, 118, 43, 151), fill=(237, 110, 44, 255))   # measured extent of the illustration's 'A' glyph incl. its swash
try:
    f = ImageFont.truetype("arialbd.ttf", 30)
except Exception:
    f = ImageFont.load_default()
d.text((27, 134), "B", fill=(33, 23, 20, 255), font=f, anchor="mm")
b.save(S / "label_b.png")
b.resize((b.width // 2, b.height // 2), Image.LANCZOS).save(S / "label_b_lo.png")
print("label", a.size)
