import math
import random
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

output_dir = Path(r"C:\Users\Vishnudev A\.gemini\antigravity\scratch\plant-disease-detection\frontend\public\samples")
output_dir.mkdir(parents=True, exist_ok=True)

def create_leaf_base(width=600, height=450, bg_color=(235, 230, 220), leaf_color=(45, 120, 50)):
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw natural garden soil/table background texture
    for _ in range(500):
        x = random.randint(0, width)
        y = random.randint(0, height)
        r = random.randint(1, 4)
        c = (random.randint(215, 235), random.randint(210, 225), random.randint(195, 215))
        draw.ellipse([x, y, x+r, y+r], fill=c)

    # Draw leaf shape using bezier-like polygon
    cx, cy = width // 2, height // 2
    points = []
    num_pts = 60
    for i in range(num_pts):
        angle = 2 * math.pi * i / num_pts
        # leaf oval modulation
        r = 160 * (1 - 0.5 * math.sin(angle)) * (1 + 0.08 * math.sin(7 * angle))
        px = cx + r * math.cos(angle) * 1.35
        py = cy + r * math.sin(angle) * 0.85
        points.append((px, py))

    # Leaf body with gradient
    draw.polygon(points, fill=leaf_color)

    # Secondary inner leaf glow
    inner_points = [(cx + (p[0]-cx)*0.88, cy + (p[1]-cy)*0.88) for p in points]
    inner_color = (leaf_color[0]+15, leaf_color[1]+20, leaf_color[2]+10)
    draw.polygon(inner_points, fill=inner_color)

    # Main leaf veins
    vein_color = (leaf_color[0]+30, leaf_color[1]+40, leaf_color[2]+20)
    # central midrib
    draw.line([(cx - 190, cy), (cx + 190, cy)], fill=vein_color, width=5)
    # lateral secondary veins
    for vx in range(-150, 160, 35):
        # upper side
        draw.line([(cx + vx, cy), (cx + vx + 45, cy - 70)], fill=vein_color, width=2)
        # lower side
        draw.line([(cx + vx, cy), (cx + vx + 45, cy + 70)], fill=vein_color, width=2)

    return img, draw, (cx, cy)

# 1. Healthy Tomato Leaf
def generate_tomato_healthy():
    img, draw, (cx, cy) = create_leaf_base(leaf_color=(38, 140, 52))
    # Add lush healthy dew highlights
    for _ in range(8):
        dx = cx + random.randint(-120, 120)
        dy = cy + random.randint(-60, 60)
        draw.ellipse([dx, dy, dx+6, dy+5], fill=(220, 255, 230))
    img = img.filter(ImageFilter.SMOOTH_MORE)
    img.save(output_dir / "tomato_healthy.jpg", quality=92)
    print("Created tomato_healthy.jpg")

# 2. Tomato Early Blight (Target-like brown concentric rings + chlorotic halos)
def generate_tomato_early_blight():
    img, draw, (cx, cy) = create_leaf_base(leaf_color=(45, 115, 45))
    
    # Blight spots locations
    lesion_centers = [
        (cx - 70, cy - 30, 42),
        (cx + 40, cy + 25, 34),
        (cx - 20, cy + 45, 26),
        (cx + 100, cy - 20, 28),
        (cx - 120, cy + 15, 22),
    ]

    for lx, ly, radius in lesion_centers:
        # Yellow chlorotic halo
        draw.ellipse([lx - radius*1.4, ly - radius*1.4, lx + radius*1.4, ly + radius*1.4], fill=(195, 175, 40))
        # Outer dark brown necrotic ring
        draw.ellipse([lx - radius, ly - radius, lx + radius, ly + radius], fill=(95, 50, 25))
        # Concentric ring 1
        draw.ellipse([lx - radius*0.75, ly - radius*0.75, lx + radius*0.75, ly + radius*0.75], fill=(130, 75, 35))
        # Concentric ring 2
        draw.ellipse([lx - radius*0.5, ly - radius*0.5, lx + radius*0.5, ly + radius*0.5], fill=(70, 35, 18))
        # Bullseye center
        draw.ellipse([lx - radius*0.25, ly - radius*0.25, lx + radius*0.25, ly + radius*0.25], fill=(45, 20, 10))

    img = img.filter(ImageFilter.SMOOTH)
    img.save(output_dir / "tomato_early_blight.jpg", quality=92)
    print("Created tomato_early_blight.jpg")

# 3. Potato Late Blight (Irregular water-soaked dark brown/black blotches)
def generate_potato_late_blight():
    img, draw, (cx, cy) = create_leaf_base(leaf_color=(40, 105, 45))

    # Large irregular water-soaked lesions on leaf margins & tip
    blotches = [
        (cx + 80, cy - 40, 60, 45),
        (cx - 90, cy + 30, 55, 40),
        (cx + 130, cy + 5, 45, 35),
        (cx - 40, cy - 45, 40, 30),
    ]

    for bx, by, bw, bh in blotches:
        # Pale green/yellow water-soaked margin
        draw.ellipse([bx - bw*1.2, by - bh*1.2, bx + bw*1.2, by + bh*1.2], fill=(140, 145, 60))
        # Dark necrotic rotting center
        draw.ellipse([bx - bw, by - bh, bx + bw, by + bh], fill=(50, 40, 32))
        draw.ellipse([bx - bw*0.6, by - bh*0.6, bx + bw*0.6, by + bh*0.6], fill=(30, 25, 20))

    img = img.filter(ImageFilter.SMOOTH)
    img.save(output_dir / "potato_late_blight.jpg", quality=92)
    print("Created potato_late_blight.jpg")

# 4. Corn Common Rust (Cinnamon-brown powdery pustules)
def generate_corn_rust():
    # Long corn leaf blade
    img = Image.new("RGB", (600, 450), (230, 225, 215))
    draw = ImageDraw.Draw(img)

    cx, cy = 300, 225
    # Elongated arching blade
    blade_points = [
        (40, 200), (200, 140), (450, 160), (560, 230),
        (460, 290), (200, 300), (40, 240)
    ]
    draw.polygon(blade_points, fill=(65, 135, 50))
    # Parallel veins
    for vy in range(160, 280, 10):
        draw.line([(50, vy), (540, vy + 5)], fill=(85, 155, 65), width=2)

    # Powdery rust pustules (cinnamon red/brown)
    random.seed(42)
    for _ in range(120):
        rx = random.randint(120, 480)
        ry = random.randint(170, 270)
        w = random.randint(5, 14)
        h = random.randint(3, 7)
        # Yellow halo
        draw.ellipse([rx-1, ry-1, rx+w+1, ry+h+1], fill=(185, 150, 30))
        # Rust pustule
        draw.ellipse([rx, ry, rx+w, ry+h], fill=(160, 70, 20))
        draw.ellipse([rx+2, ry+1, rx+w-2, ry+h-1], fill=(120, 45, 15))

    img = img.filter(ImageFilter.SMOOTH)
    img.save(output_dir / "corn_common_rust.jpg", quality=92)
    print("Created corn_common_rust.jpg")

if __name__ == "__main__":
    generate_tomato_healthy()
    generate_tomato_early_blight()
    generate_potato_late_blight()
    generate_corn_rust()
    print("All 4 sample leaves successfully generated!")
