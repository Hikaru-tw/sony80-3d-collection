"""Flatten the tilted cassette illustration into face textures."""
from PIL import Image, ImageDraw
from pathlib import Path
import numpy as np, sys

SRC = Path(__file__).parent.parent / "reference image" / "cassette.png"
OUTLINE = (33, 23, 20)
TAN = (190, 173, 154)

c = Image.open(SRC).convert("RGBA").rotate(18.0, expand=True, resample=Image.BICUBIC)
a = np.array(c)[..., 3] > 128
ys, xs = np.where(a)
c = c.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))          # 539 x 343
body = c.crop((10, 0, 530, 341))                                          # main shell rect 520 x 341
W, H = body.size

front = Image.new("RGBA", (W, H), OUTLINE + (255,))
front.alpha_composite(body)
front.save("front.png")
front.resize((W // 2, H // 2), Image.LANCZOS).save("front_lo.png")

# back: plain shell with dark outline (never really visible at the reference angles)
back = Image.new("RGBA", (W, H), OUTLINE + (255,))
d = ImageDraw.Draw(back)
d.rounded_rectangle((0, 0, W - 1, H - 1), radius=26, fill=TAN + (255,), outline=OUTLINE + (255,), width=7)
back.save("back.png")
print("front", front.size, "aspect", W / H)
