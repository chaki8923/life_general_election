#!/usr/bin/env python3
"""Render a cheerful rightward walk cycle from a transparent character PNG."""

from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter


def rotate_layer_around(layer: Image.Image, anchor: tuple[float, float], angle_deg: float) -> Image.Image:
    """Rotate a full-canvas RGBA layer around an arbitrary anchor."""
    theta = math.radians(angle_deg)
    cos_t = math.cos(theta)
    sin_t = math.sin(theta)
    cx, cy = anchor
    # Pillow expects an inverse mapping from output coordinates to input coordinates.
    coeffs = (
        cos_t,
        sin_t,
        cx - cos_t * cx - sin_t * cy,
        -sin_t,
        cos_t,
        cy + sin_t * cx - cos_t * cy,
    )
    return layer.transform(
        layer.size,
        Image.Transform.AFFINE,
        coeffs,
        resample=Image.Resampling.BICUBIC,
    )


def split_character(source: Image.Image) -> tuple[Image.Image, Image.Image, Image.Image]:
    """Split the two dark lower limbs from the torso while keeping soft alpha edges."""
    rgba = np.asarray(source.convert("RGBA")).copy()
    h, w = rgba.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w]
    rgb = rgba[:, :, :3]
    alpha = rgba[:, :, 3]

    # The supplied mascot has a white shirt and dark gray/brown legs below ~59% height.
    # Brightness-gating keeps the shirt hem with the torso instead of cutting a rectangle.
    brightness = rgb.max(axis=2)
    lower_dark = (yy >= int(h * 0.585)) & (brightness < 190) & (alpha > 0)
    left_mask = lower_dark & (xx < int(w * 0.525))
    right_mask = lower_dark & ~left_mask

    def layer_for(mask: np.ndarray) -> Image.Image:
        out = rgba.copy()
        out[:, :, 3] = np.where(mask, alpha, 0).astype(np.uint8)
        return Image.fromarray(out, "RGBA")

    torso = rgba.copy()
    torso[:, :, 3] = np.where(left_mask | right_mask, 0, alpha).astype(np.uint8)
    return Image.fromarray(torso, "RGBA"), layer_for(left_mask), layer_for(right_mask)


def pose_character(
    torso: Image.Image,
    left_leg: Image.Image,
    right_leg: Image.Image,
    phase: float,
) -> Image.Image:
    w, h = torso.size
    swing = math.sin(phase)
    left_angle = 9.0 * swing
    right_angle = -9.0 * swing

    posed = Image.new("RGBA", torso.size, (0, 0, 0, 0))
    # Back leg first, front leg second. Swap naturally every half-cycle.
    left = rotate_layer_around(left_leg, (w * 0.455, h * 0.61), left_angle)
    right = rotate_layer_around(right_leg, (w * 0.575, h * 0.61), right_angle)
    if swing >= 0:
        posed.alpha_composite(right)
        posed.alpha_composite(left)
    else:
        posed.alpha_composite(left)
        posed.alpha_composite(right)
    posed.alpha_composite(torso)

    # A tiny shoulder sway and alternating squash/stretch gives the step some weight.
    sway = 1.15 * math.sin(phase + math.pi / 2)
    posed = posed.rotate(sway, resample=Image.Resampling.BICUBIC, expand=True)
    stretch = 1.0 + 0.007 * math.cos(phase * 2)
    posed = posed.resize(
        (max(1, round(posed.width / stretch)), max(1, round(posed.height * stretch))),
        Image.Resampling.LANCZOS,
    )
    return posed


def make_particles(width: int, height: int, seed: int = 17) -> list[dict[str, float]]:
    rng = random.Random(seed)
    particles: list[dict[str, float]] = []
    for _ in range(13):
        particles.append(
            {
                "x": rng.uniform(0, width),
                "y": rng.uniform(height * 0.20, height * 0.72),
                "speed": rng.uniform(18, 42),
                "size": rng.uniform(3.5, 7.5),
                "phase": rng.uniform(0, math.tau),
                "tone": rng.choice([0, 1, 2]),
            }
        )
    return particles


def render(args: argparse.Namespace) -> None:
    output_dir = Path(args.output_dir)
    frames_dir = output_dir / "frames"
    frames_dir.mkdir(parents=True, exist_ok=True)

    background = Image.open(args.background).convert("RGB")
    background = background.resize((args.width, args.height), Image.Resampling.LANCZOS)

    source = Image.open(args.character).convert("RGBA")
    torso, left_leg, right_leg = split_character(source)
    scale = args.character_height / source.height
    scaled_size = (round(source.width * scale), args.character_height)
    torso = torso.resize(scaled_size, Image.Resampling.LANCZOS)
    left_leg = left_leg.resize(scaled_size, Image.Resampling.LANCZOS)
    right_leg = right_leg.resize(scaled_size, Image.Resampling.LANCZOS)

    frame_count = round(args.duration * args.fps)
    particles = make_particles(args.width, args.height)
    gif_frames: list[Image.Image] = []

    # The path on the generated plate sits around 80% of frame height.
    ground_y = int(args.height * 0.805)
    travel_start = -scaled_size[0] - 40
    travel_end = args.width + 40
    cycles = args.duration * 1.88

    for index in range(frame_count):
        progress = index / frame_count
        elapsed = index / args.fps
        phase = math.tau * cycles * progress
        frame = background.convert("RGBA")

        # A few slow petals make the scene feel alive without competing with the mascot.
        particle_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        pd = ImageDraw.Draw(particle_layer)
        colors = [(255, 139, 92, 120), (255, 193, 104, 115), (126, 190, 142, 105)]
        for particle in particles:
            px = (particle["x"] - elapsed * particle["speed"] + 40) % (args.width + 80) - 40
            py = particle["y"] + math.sin(elapsed * 1.35 + particle["phase"]) * 12
            size = particle["size"]
            pd.ellipse((px - size, py - size * 0.48, px + size, py + size * 0.48), fill=colors[int(particle["tone"])])
        particle_layer = particle_layer.filter(ImageFilter.GaussianBlur(0.45))
        frame.alpha_composite(particle_layer)

        character = pose_character(torso, left_leg, right_leg, phase)
        bob = -5.0 * abs(math.sin(phase))
        char_x = travel_start + (travel_end - travel_start) * progress
        char_y = ground_y - character.height + bob

        # Soft contact shadow tightens as the character lands and widens in passing steps.
        shadow_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow_layer)
        shadow_w = scaled_size[0] * (0.43 + 0.035 * math.cos(phase * 2))
        shadow_h = 15 - 3 * abs(math.sin(phase))
        shadow_cx = char_x + character.width / 2
        sd.ellipse(
            (shadow_cx - shadow_w / 2, ground_y - shadow_h / 2, shadow_cx + shadow_w / 2, ground_y + shadow_h / 2),
            fill=(89, 61, 42, 66),
        )
        shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(8))
        frame.alpha_composite(shadow_layer)
        frame.alpha_composite(character, (round(char_x), round(char_y)))

        # Very subtle warm lift keeps the source cutout integrated with the sunny plate.
        wash = Image.new("RGBA", frame.size, (255, 229, 170, 9))
        frame = Image.alpha_composite(frame, wash).convert("RGB")
        frame_path = frames_dir / f"frame_{index:04d}.png"
        frame.save(frame_path, compress_level=2)

        if index == round(frame_count * 0.48):
            frame.save(output_dir / "poster.png", optimize=True)
        if index % 2 == 0:
            gif_frames.append(frame.resize((640, 360), Image.Resampling.LANCZOS))

    gif_frames[0].save(
        output_dir / "character-walk-preview.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=round(2000 / args.fps),
        loop=0,
        optimize=False,
        disposal=2,
    )

    # Quick visual QA sheet: four evenly spaced moments in the walk.
    sheet = Image.new("RGB", (640 * 2, 360 * 2), "white")
    for slot, fraction in enumerate((0.20, 0.37, 0.54, 0.71)):
        frame_index = min(frame_count - 1, round(fraction * frame_count))
        still = Image.open(frames_dir / f"frame_{frame_index:04d}.png").convert("RGB")
        still = still.resize((640, 360), Image.Resampling.LANCZOS)
        sheet.paste(still, ((slot % 2) * 640, (slot // 2) * 360))
    sheet.save(output_dir / "contact-sheet.jpg", quality=90, optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", required=True)
    parser.add_argument("--character", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--character-height", type=int, default=355)
    parser.add_argument("--duration", type=float, default=6.0)
    parser.add_argument("--fps", type=int, default=30)
    return parser.parse_args()


if __name__ == "__main__":
    render(parse_args())
