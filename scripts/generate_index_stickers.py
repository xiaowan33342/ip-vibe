"""Build the five directory stickers from the user's original artwork.

This script uses only classical Pillow compositing. It does not redraw or
regenerate the supplied characters, logos, or product image. Original RGB
pixels are preserved; only connected canvas backgrounds are made transparent
where a source file does not already contain alpha.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = PROJECT_ROOT.parent / "封面和AboutMe用"
OUTPUT_ROOT = PROJECT_ROOT / "assets" / "images" / "index-stickers"

SOURCES = {
    "mallow": SOURCE_ROOT / "原始 Mallow 奶油色角色图.png",
    "rumi": SOURCE_ROOT / "原始“小鼻噶”角色图.png",
    "am_bagel": SOURCE_ROOT / "始 AM Bagel 彩色 Logo.png",
    "greyhound": SOURCE_ROOT / "原始细狗卡通形象.png",
    "qingliang_bag": SOURCE_ROOT / "一个单独米白色手提袋.png",
    "qingliang_logo": SOURCE_ROOT / "“念”图形 Logo.png",
}

OUTPUTS = {
    "mallow": OUTPUT_ROOT / "sticker-mallow-nook.png",
    "rumi": OUTPUT_ROOT / "sticker-rumi.png",
    "am_bagel": OUTPUT_ROOT / "sticker-am-bagel.png",
    "greyhound": OUTPUT_ROOT / "sticker-greyhound.png",
    "qingliang": OUTPUT_ROOT / "sticker-yinian-qingliang.png",
    "qingliang_bag_component": OUTPUT_ROOT / "sticker-yinian-qingliang-bag.png",
    "qingliang_label_component": OUTPUT_ROOT / "sticker-yinian-qingliang-label.png",
}

FONT_BOLD = Path(r"C:\Windows\Fonts\msyhbd.ttc")
FONT_REGULAR = Path(r"C:\Windows\Fonts\msyh.ttc")
PENCIL = (101, 86, 72, 205)


def require_sources() -> None:
    missing = [str(path) for path in SOURCES.values() if not path.exists()]
    if missing:
        raise FileNotFoundError("Missing original sticker sources:\n" + "\n".join(missing))


def trim_alpha(image: Image.Image, padding: int = 0) -> Image.Image:
    rgba = image.convert("RGBA")
    bbox = rgba.getchannel("A").getbbox()
    if not bbox:
        return rgba
    left, top, right, bottom = bbox
    left = max(0, left - padding)
    top = max(0, top - padding)
    right = min(rgba.width, right + padding)
    bottom = min(rgba.height, bottom + padding)
    return rgba.crop((left, top, right, bottom))


def remove_connected_canvas(image: Image.Image, threshold: int) -> Image.Image:
    """Clear only background connected to the source canvas edge."""
    rgba = image.convert("RGBA")
    work = rgba.copy()
    marker = (1, 2, 3, 255)
    draw = ImageDraw.Draw(work)
    edge_points = [
        (0, 0),
        (rgba.width - 1, 0),
        (0, rgba.height - 1),
        (rgba.width - 1, rgba.height - 1),
        (rgba.width // 2, 0),
        (rgba.width // 2, rgba.height - 1),
        (0, rgba.height // 2),
        (rgba.width - 1, rgba.height // 2),
    ]
    for point in edge_points:
        ImageDraw.floodfill(work, point, marker, thresh=threshold)

    pixels = np.asarray(work)
    cleared = np.all(pixels[:, :, :3] == np.array(marker[:3], dtype=np.uint8), axis=2)
    output = np.asarray(rgba).copy()
    output[:, :, 3][cleared] = 0
    return trim_alpha(Image.fromarray(output, "RGBA"), 2)


def isolate_bag(image: Image.Image) -> Image.Image:
    """Mask the central single bag while leaving its original pixels untouched."""
    rgba = image.convert("RGBA")
    width, height = rgba.size
    mask = Image.new("L", rgba.size, 0)
    draw = ImageDraw.Draw(mask)

    # Main paper bag silhouette, excluding the partial bags around the crop.
    body = [
        (int(width * 0.16), int(height * 0.27)),
        (int(width * 0.20), int(height * 0.23)),
        (int(width * 0.88), int(height * 0.20)),
        (int(width * 0.93), int(height * 0.26)),
        (int(width * 0.92), int(height * 0.92)),
        (int(width * 0.88), int(height * 0.97)),
        (int(width * 0.21), int(height * 0.96)),
        (int(width * 0.16), int(height * 0.90)),
    ]
    draw.polygon(body, fill=255)

    # Preserve the original brown handles above the bag opening.
    rgb = np.asarray(rgba)[:, :, :3].astype(np.int16)
    chroma = rgb.max(axis=2) - rgb.min(axis=2)
    brightness = rgb.mean(axis=2)
    handle_pixels = (chroma > 24) & (brightness < 205)
    roi = np.zeros((height, width), dtype=bool)
    roi[int(height * 0.035) : int(height * 0.38), int(width * 0.31) : int(width * 0.75)] = True
    handle_pixels &= roi
    handle_mask = Image.fromarray((handle_pixels * 255).astype(np.uint8), "L").filter(ImageFilter.MaxFilter(5))
    mask = ImageChops.lighter(mask, handle_mask)
    mask = mask.filter(ImageFilter.GaussianBlur(0.7))

    result = rgba.copy()
    result.putalpha(mask)
    return trim_alpha(result, 2)


def fit(image: Image.Image, max_width: int, max_height: int) -> Image.Image:
    rgba = trim_alpha(image)
    scale = min(max_width / rgba.width, max_height / rgba.height)
    size = (max(1, round(rgba.width * scale)), max(1, round(rgba.height * scale)))
    return rgba.resize(size, Image.Resampling.LANCZOS)


def alpha_paste(canvas: Image.Image, layer: Image.Image, xy: tuple[int, int]) -> None:
    canvas.alpha_composite(layer.convert("RGBA"), xy)


def rotate_layer(layer: Image.Image, degrees: float) -> Image.Image:
    return layer.rotate(degrees, resample=Image.Resampling.BICUBIC, expand=True)


def paper_label(
    size: tuple[int, int],
    text: str,
    fill: tuple[int, int, int, int],
    ink: tuple[int, int, int, int],
    font_size: int,
    seed: int,
    bow: bool = False,
) -> Image.Image:
    width, height = size
    rng = random.Random(seed)
    label = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(label)
    polygon = [
        (7, 12 + rng.randint(-3, 3)),
        (width // 3, 5 + rng.randint(-2, 3)),
        (width - 10, 9 + rng.randint(-3, 3)),
        (width - 5, height - 13 + rng.randint(-3, 3)),
        (width * 2 // 3, height - 5 + rng.randint(-2, 3)),
        (11, height - 8 + rng.randint(-3, 3)),
    ]
    draw.polygon(polygon, fill=fill)
    for _ in range(75):
        x = rng.randrange(12, max(13, width - 12))
        y = rng.randrange(10, max(11, height - 10))
        shade = rng.choice([(123, 92, 70, 8), (255, 255, 255, 16)])
        draw.point((x, y), fill=shade)

    font = ImageFont.truetype(str(FONT_BOLD), font_size)
    text_box = draw.textbbox((0, 0), text, font=font)
    text_width = text_box[2] - text_box[0]
    text_height = text_box[3] - text_box[1]
    reserved = 68 if bow else 0
    x = max(24, (width - reserved - text_width) // 2)
    y = (height - text_height) // 2 - text_box[1]
    draw.text((x, y), text, font=font, fill=ink)
    if bow:
        draw_bow(draw, (width - 48, height // 2), 24, (184, 102, 128, 255), PENCIL)
    return label


def qingliang_label(logo: Image.Image) -> Image.Image:
    size = (520, 210)
    label = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(label)
    draw.polygon([(8, 13), (507, 5), (515, 194), (18, 205), (4, 182)], fill=(250, 239, 202, 255))
    for x in range(22, 500, 19):
        draw.line((x, 18, x + 5, 190), fill=(163, 126, 73, 8), width=1)
    logo_fit = fit(logo, 102, 92)
    alpha_paste(label, logo_fit, ((size[0] - logo_fit.width) // 2, 15))
    font = ImageFont.truetype(str(FONT_BOLD), 38)
    text = "一念清凉五台山文创"
    box = draw.textbbox((0, 0), text, font=font)
    x = (size[0] - (box[2] - box[0])) // 2
    draw.text((x, 126 - box[1]), text, font=font, fill=(36, 82, 72, 255))
    return label


def draw_star(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int, fill, outline=PENCIL) -> None:
    cx, cy = center
    points = []
    for index in range(8):
        angle = -math.pi / 2 + index * math.pi / 4
        current = radius if index % 2 == 0 else radius * 0.34
        points.append((cx + math.cos(angle) * current, cy + math.sin(angle) * current))
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=max(2, radius // 10), joint="curve")


def draw_heart(draw: ImageDraw.ImageDraw, center: tuple[int, int], size: int, fill, outline=PENCIL) -> None:
    cx, cy = center
    points = [
        (cx, cy + size),
        (cx - size, cy),
        (cx - size * 0.65, cy - size * 0.65),
        (cx, cy - size * 0.16),
        (cx + size * 0.65, cy - size * 0.65),
        (cx + size, cy),
    ]
    draw.polygon(points, fill=fill)
    draw.line(points + [points[0]], fill=outline, width=max(2, size // 10), joint="curve")


def draw_bow(draw: ImageDraw.ImageDraw, center: tuple[int, int], size: int, fill, outline=PENCIL) -> None:
    cx, cy = center
    left = [(cx - 4, cy), (cx - size, cy - size // 2), (cx - size, cy + size // 2)]
    right = [(cx + 4, cy), (cx + size, cy - size // 2), (cx + size, cy + size // 2)]
    draw.polygon(left, fill=fill)
    draw.polygon(right, fill=fill)
    draw.ellipse((cx - 7, cy - 7, cx + 7, cy + 7), fill=fill, outline=outline, width=2)
    draw.line(left + [left[0]], fill=outline, width=2)
    draw.line(right + [right[0]], fill=outline, width=2)


def draw_bagel(draw: ImageDraw.ImageDraw, center: tuple[int, int], radius: int) -> None:
    cx, cy = center
    draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=(220, 153, 79, 255), outline=PENCIL, width=4)
    draw.ellipse((cx - radius // 3, cy - radius // 3, cx + radius // 3, cy + radius // 3), fill=(255, 244, 217, 255), outline=PENCIL, width=3)
    for dx, dy in [(-12, -15), (15, -10), (-9, 15), (17, 12)]:
        draw.ellipse((cx + dx - 2, cy + dy - 4, cx + dx + 2, cy + dy + 4), fill=(255, 238, 192, 255))


def draw_pen(draw: ImageDraw.ImageDraw, start: tuple[int, int], length: int) -> None:
    x, y = start
    draw.line((x, y, x + length, y - length // 3), fill=(115, 91, 70, 255), width=10)
    draw.line((x + 2, y - 3, x + length + 2, y - length // 3 - 3), fill=(237, 202, 147, 255), width=4)
    draw.polygon([(x + length, y - length // 3), (x + length + 15, y - length // 3 - 2), (x + length + 4, y - length // 3 + 9)], fill=(101, 86, 72, 255))


def draw_bookmark(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int]) -> None:
    left, top, right, bottom = box
    notch = (left + right) // 2
    points = [(left, top), (right, top), (right, bottom), (notch, bottom - 16), (left, bottom)]
    draw.polygon(points, fill=(205, 153, 111, 255), outline=PENCIL)
    draw.line(points + [points[0]], fill=PENCIL, width=3)


def decorate_mallow(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw_star(draw, (1260, 180), 32, (246, 211, 120, 255))
    draw_star(draw, (320, 220), 22, (240, 173, 190, 255))
    draw_heart(draw, (1270, 680), 22, (244, 181, 196, 255))
    draw.ellipse((250, 650, 270, 670), fill=(194, 151, 107, 255))


def decorate_rumi(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw_bow(draw, (730, 180), 30, (238, 181, 199, 255))
    draw_star(draw, (160, 250), 23, (246, 211, 131, 255))
    draw.ellipse((735, 585, 753, 603), fill=(214, 141, 165, 255))
    draw.arc((95, 410, 235, 650), 250, 80, fill=(120, 92, 79, 220), width=4)


def decorate_amb(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw_bagel(draw, (1110, 170), 46)
    draw_star(draw, (1130, 750), 25, (247, 211, 128, 255))
    for x, y in [(1030, 790), (1075, 820), (1160, 805)]:
        draw.ellipse((x, y, x + 13, y + 8), fill=(181, 117, 64, 255))
    patch = [(100, 720), (250, 710), (260, 860), (110, 870)]
    draw.polygon(patch, fill=(247, 222, 174, 220), outline=PENCIL)
    for x in range(125, 250, 34):
        draw.line((x, 716, x + 10, 865), fill=(205, 147, 100, 110), width=3)


def decorate_greyhound(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    draw_pen(draw, (170, 240), 105)
    draw_bookmark(draw, (1180, 650, 1240, 770))
    draw_star(draw, (1170, 230), 23, (213, 166, 117, 255))
    draw.line((1130, 300, 1180, 285), fill=PENCIL, width=4)
    draw.line((1142, 324, 1200, 310), fill=PENCIL, width=3)


def decorate_qingliang(canvas: Image.Image) -> None:
    draw = ImageDraw.Draw(canvas)
    mountain = [(90, 710), (175, 650), (245, 700), (335, 610), (430, 695)]
    draw.line(mountain, fill=(49, 92, 78, 225), width=6, joint="curve")
    for x, y in [(820, 180), (880, 215), (925, 170)]:
        draw.ellipse((x, y, x + 13, y + 13), fill=(188, 147, 75, 255))
    draw.rectangle((90, 780, 170, 845), fill=(223, 204, 164, 245), outline=PENCIL, width=3)
    draw.line((110, 807, 150, 807), fill=(65, 92, 79, 180), width=3)


def shifted(mask: Image.Image, dx: int, dy: int) -> Image.Image:
    output = Image.new("L", mask.size, 0)
    output.paste(mask, (dx, dy))
    return output


def irregular_expand(mask: Image.Image, radius: int, seed: int) -> Image.Image:
    rng = random.Random(seed)
    expanded = mask.copy()
    for degree in range(0, 360, 5):
        radians = math.radians(degree)
        wobble = 2.2 * math.sin(radians * 3 + 0.7) + 1.6 * math.sin(radians * 7)
        distance = max(1, radius + round(wobble) + rng.randint(-2, 2))
        dx = round(math.cos(radians) * distance)
        dy = round(math.sin(radians) * distance)
        expanded = ImageChops.lighter(expanded, shifted(mask, dx, dy))
    return expanded.filter(ImageFilter.GaussianBlur(0.65))


def finish_sticker(content: Image.Image, target_size: tuple[int, int], seed: int) -> Image.Image:
    alpha = content.getchannel("A")
    paper_mask = irregular_expand(alpha, 34, seed)
    outer_mask = irregular_expand(alpha, 38, seed + 41)
    pencil_edge = ImageChops.subtract(outer_mask, paper_mask)
    duplicate_edge = ImageChops.subtract(shifted(outer_mask, 2, -1), paper_mask)

    result = Image.new("RGBA", content.size, (0, 0, 0, 0))
    shadow_mask = shifted(paper_mask, 7, 10).filter(ImageFilter.GaussianBlur(10))
    shadow = Image.new("RGBA", content.size, (92, 71, 54, 0))
    shadow.putalpha(shadow_mask.point(lambda value: round(value * 0.1)))
    result = Image.alpha_composite(result, shadow)

    paper = Image.new("RGBA", content.size, (255, 253, 248, 0))
    paper.putalpha(paper_mask)
    result = Image.alpha_composite(result, paper)

    rng = np.random.default_rng(seed)
    edge = np.asarray(pencil_edge, dtype=np.float32)
    texture = rng.uniform(0.64, 0.96, edge.shape)
    edge_alpha = np.clip(edge * texture * 0.78, 0, 255).astype(np.uint8)
    pencil = Image.new("RGBA", content.size, PENCIL)
    pencil.putalpha(Image.fromarray(edge_alpha, "L"))
    result = Image.alpha_composite(result, pencil)

    repeated = Image.new("RGBA", content.size, (95, 82, 70, 0))
    repeated.putalpha(duplicate_edge.point(lambda value: round(value * 0.08)))
    result = Image.alpha_composite(result, repeated)
    result = Image.alpha_composite(result, content)

    cropped = trim_alpha(result, 3)
    target = Image.new("RGBA", target_size, (0, 0, 0, 0))
    fitted = fit(cropped, target_size[0] - 28, target_size[1] - 28)
    alpha_paste(target, fitted, ((target.width - fitted.width) // 2, (target.height - fitted.height) // 2))
    return target


def build_mallow() -> Image.Image:
    canvas = Image.new("RGBA", (1500, 1060), (0, 0, 0, 0))
    subject = fit(Image.open(SOURCES["mallow"]), 820, 800)
    alpha_paste(canvas, subject, (520, 90))
    decorate_mallow(canvas)
    label = paper_label((650, 120), "Mallow Nook甜点小屋", (250, 232, 174, 255), (111, 79, 49, 255), 42, 11)
    alpha_paste(canvas, rotate_layer(label, 4), (85, 760))
    return finish_sticker(canvas, (1450, 1000), 101)


def build_rumi() -> Image.Image:
    canvas = Image.new("RGBA", (960, 1080), (0, 0, 0, 0))
    subject = fit(Image.open(SOURCES["rumi"]), 620, 700)
    alpha_paste(canvas, subject, ((canvas.width - subject.width) // 2 + 25, 105))
    decorate_rumi(canvas)
    label = paper_label((540, 112), "@Rumi绒米", (249, 222, 232, 255), (86, 72, 67, 255), 46, 17, bow=True)
    alpha_paste(canvas, rotate_layer(label, -4), (80, 790))
    return finish_sticker(canvas, (900, 1000), 202)


def build_amb() -> Image.Image:
    canvas = Image.new("RGBA", (1380, 1040), (0, 0, 0, 0))
    subject = fit(remove_connected_canvas(Image.open(SOURCES["am_bagel"]), 30), 960, 790)
    alpha_paste(canvas, subject, (275, 155))
    decorate_amb(canvas)
    label = paper_label((520, 112), "AMBagel贝果", (239, 211, 164, 255), (113, 67, 34, 255), 45, 23)
    alpha_paste(canvas, rotate_layer(label, 7), (28, 80))
    return finish_sticker(canvas, (1300, 1000), 303)


def build_greyhound() -> Image.Image:
    canvas = Image.new("RGBA", (1500, 1050), (0, 0, 0, 0))
    subject = fit(remove_connected_canvas(Image.open(SOURCES["greyhound"]), 18), 1040, 760)
    alpha_paste(canvas, subject, (350, 95))
    decorate_greyhound(canvas)
    label = paper_label((690, 112), "白衣红陶细狗文创", (231, 198, 159, 255), (91, 62, 44, 255), 43, 29)
    alpha_paste(canvas, rotate_layer(label, 3), (80, 780))
    return finish_sticker(canvas, (1450, 1000), 404)


def build_qingliang() -> Image.Image:
    canvas = Image.new("RGBA", (1120, 1080), (0, 0, 0, 0))
    bag = fit(isolate_bag(Image.open(SOURCES["qingliang_bag"])), 680, 700)
    alpha_paste(canvas, bag, (350, 260))
    logo = remove_connected_canvas(Image.open(SOURCES["qingliang_logo"]), 24)
    label = qingliang_label(logo)
    alpha_paste(canvas, rotate_layer(label, -1), (45, 90))
    decorate_qingliang(canvas)
    return finish_sticker(canvas, (1050, 1000), 505)


def build_qingliang_components() -> tuple[Image.Image, Image.Image]:
    """Build independent bag and label layers for responsive index placement."""
    bag_canvas = Image.new("RGBA", (820, 880), (0, 0, 0, 0))
    bag = fit(isolate_bag(Image.open(SOURCES["qingliang_bag"])), 650, 690)
    alpha_paste(bag_canvas, bag, ((bag_canvas.width - bag.width) // 2 + 24, 82))

    bag_draw = ImageDraw.Draw(bag_canvas)
    bag_draw.line(
        [(32, 708), (112, 650), (180, 702), (268, 618), (348, 694)],
        fill=(49, 92, 78, 225),
        width=6,
        joint="curve",
    )
    for x, y in [(690, 118), (742, 154), (772, 112)]:
        bag_draw.ellipse((x, y, x + 12, y + 12), fill=(188, 147, 75, 255))
    bag_draw.rectangle((52, 758, 126, 820), fill=(223, 204, 164, 245), outline=PENCIL, width=3)
    bag_draw.line((70, 785, 108, 785), fill=(65, 92, 79, 180), width=3)

    logo = remove_connected_canvas(Image.open(SOURCES["qingliang_logo"]), 24)
    label = qingliang_label(logo)
    label_canvas = Image.new("RGBA", (580, 250), (0, 0, 0, 0))
    alpha_paste(label_canvas, label, (30, 20))

    return (
        finish_sticker(bag_canvas, (760, 800), 506),
        finish_sticker(label_canvas, (600, 270), 507),
    )


def build_preview(images: dict[str, Image.Image]) -> Image.Image:
    preview = Image.new("RGB", (2400, 1550), (248, 242, 230))
    draw = ImageDraw.Draw(preview)
    cell = 48
    for y in range(0, preview.height, cell):
        for x in range(0, preview.width, cell):
            if (x // cell + y // cell) % 2 == 0:
                draw.rectangle((x, y, x + cell, y + cell), fill=(242, 234, 220))

    placements = {
        "mallow": ((65, 90), 820),
        "rumi": ((1580, 45), 610),
        "am_bagel": ((860, 590), 670),
        "greyhound": ((70, 970), 620),
        "qingliang": ((1690, 900), 560),
    }
    for key, (position, width) in placements.items():
        source = images[key]
        scaled = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
        preview.paste(scaled, position, scaled)
    return preview


def main() -> None:
    require_sources()
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    images = {
        "mallow": build_mallow(),
        "rumi": build_rumi(),
        "am_bagel": build_amb(),
        "greyhound": build_greyhound(),
        "qingliang": build_qingliang(),
    }
    for key, image in images.items():
        image.save(OUTPUTS[key], format="PNG", optimize=True)
    qingliang_bag, qingliang_label = build_qingliang_components()
    qingliang_bag.save(OUTPUTS["qingliang_bag_component"], format="PNG", optimize=True)
    qingliang_label.save(OUTPUTS["qingliang_label_component"], format="PNG", optimize=True)
    build_preview(images).save(OUTPUT_ROOT / "stickers-preview.png", format="PNG", optimize=True)

    for key, path in OUTPUTS.items():
        print(f"{key}: {path.relative_to(PROJECT_ROOT)} {images[key].size} RGBA")


if __name__ == "__main__":
    main()
