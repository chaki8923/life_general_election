#!/usr/bin/env python3
"""Render a stationary, right-facing, cheerful walk loop from a four-pose sprite sheet."""

from __future__ import annotations

import argparse
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


def load_poses(sprite_sheet_path: str, target_height: int) -> list[Image.Image]:
    sheet = Image.open(sprite_sheet_path).convert("RGBA")
    poses: list[Image.Image] = []
    for index in range(4):
        left = round(sheet.width * index / 4)
        right = round(sheet.width * (index + 1) / 4)
        panel = sheet.crop((left, 0, right, sheet.height))
        alpha_box = panel.getchannel("A").getbbox()
        if alpha_box is None:
            raise ValueError(f"Sprite panel {index + 1} is empty")
        pose = panel.crop(alpha_box)
        scale = target_height / pose.height
        pose = pose.resize(
            (max(1, round(pose.width * scale)), target_height),
            Image.Resampling.LANCZOS,
        )
        poses.append(pose)
    return poses


def make_particles(width: int, height: int, seed: int = 31) -> list[dict[str, float]]:
    rng = random.Random(seed)
    return [
        {
            "x": rng.uniform(0, width),
            "y": rng.uniform(height * 0.18, height * 0.70),
            "speed": rng.uniform(12, 30),
            "size": rng.uniform(3.0, 6.5),
            "phase": rng.uniform(0, math.tau),
            "tone": rng.choice([0, 1, 2]),
        }
        for _ in range(11)
    ]


def crisp_pose(poses: list[Image.Image], cycle_progress: float) -> Image.Image:
    """Return exactly one opaque pose; never composite adjacent character frames."""
    position = cycle_progress * 4
    current_index = int(position) % 4
    return poses[current_index].copy()


def render(args: argparse.Namespace) -> None:
    output_dir = Path(args.output_dir)
    frames_dir = output_dir / "frames-v3"
    frames_dir.mkdir(parents=True, exist_ok=True)

    background = Image.open(args.background).convert("RGB")
    background = background.resize((args.width, args.height), Image.Resampling.LANCZOS)
    poses = load_poses(args.sprite_sheet, args.character_height)
    particles = make_particles(args.width, args.height)

    frame_count = round(args.duration * args.fps)
    ground_y = int(args.height * 0.805)
    # Slightly left of center leaves inviting space in the direction of travel.
    center_x = int(args.width * 0.47)
    cycles = round(args.duration * 1.0)  # One full two-step gait per second.
    gif_frames: list[Image.Image] = []

    for index in range(frame_count):
        progress = index / frame_count
        elapsed = index / args.fps
        cycle_progress = (progress * cycles) % 1.0
        phase = math.tau * cycle_progress
        frame = background.convert("RGBA")

        # Slow leftward petals reinforce that the mascot intends to walk toward screen-right.
        particle_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        pd = ImageDraw.Draw(particle_layer)
        colors = [(255, 139, 92, 115), (255, 193, 104, 105), (126, 190, 142, 95)]
        for particle in particles:
            px = (particle["x"] - elapsed * particle["speed"] + 40) % (args.width + 80) - 40
            py = particle["y"] + math.sin(elapsed * 1.25 + particle["phase"]) * 10
            size = particle["size"]
            pd.ellipse(
                (px - size, py - size * 0.45, px + size, py + size * 0.45),
                fill=colors[int(particle["tone"])],
            )
        frame.alpha_composite(particle_layer.filter(ImageFilter.GaussianBlur(0.4)))

        character = crisp_pose(poses, cycle_progress)
        # Two landings per gait cycle: upbeat, compact bounce without moving across the screen.
        bounce = -8.0 * abs(math.sin(phase))
        forward_pulse = 3.0 * math.sin(phase)
        lean = -1.8 + 0.7 * math.sin(phase + math.pi / 2)
        character = character.rotate(lean, resample=Image.Resampling.BICUBIC, expand=True)
        stretch = 1.0 + 0.008 * math.cos(phase * 2)
        character = character.resize(
            (max(1, round(character.width / stretch)), max(1, round(character.height * stretch))),
            Image.Resampling.LANCZOS,
        )
        char_x = center_x - character.width / 2 + forward_pulse
        char_y = ground_y - character.height + bounce

        shadow_layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(shadow_layer)
        shadow_w = args.character_height * (0.30 + 0.025 * math.cos(phase * 2))
        shadow_h = 14 - 3 * abs(math.sin(phase))
        sd.ellipse(
            (
                center_x - shadow_w / 2,
                ground_y - shadow_h / 2,
                center_x + shadow_w / 2,
                ground_y + shadow_h / 2,
            ),
            fill=(89, 61, 42, 64),
        )
        frame.alpha_composite(shadow_layer.filter(ImageFilter.GaussianBlur(8)))
        frame.alpha_composite(character, (round(char_x), round(char_y)))

        # A minimal warm wash integrates the sprite with the sunny park plate.
        frame = Image.alpha_composite(frame, Image.new("RGBA", frame.size, (255, 229, 170, 7))).convert("RGB")
        frame_path = frames_dir / f"frame_{index:04d}.png"
        frame.save(frame_path, compress_level=2)

        if index == round(frame_count * 0.42):
            frame.save(output_dir / "poster-in-place-v3.png", optimize=True)
        if index % 2 == 0:
            gif_frames.append(frame.resize((640, 360), Image.Resampling.LANCZOS))

    # GIF timing is stored in 10 ms units. A 70/70/60 pattern averages exactly
    # 66.67 ms for the 15 fps preview, keeping 90 frames at a 6.0 second loop.
    gif_durations = [60 if index % 3 == 2 else 70 for index in range(len(gif_frames))]
    gif_frames[0].save(
        output_dir / "character-walk-in-place-right-v3.gif",
        save_all=True,
        append_images=gif_frames[1:],
        duration=gif_durations,
        loop=0,
        optimize=False,
        disposal=2,
    )

    sheet = Image.new("RGB", (640 * 2, 360 * 2), "white")
    for slot, fraction in enumerate((0.10, 0.14, 0.18, 0.22)):
        frame_index = min(frame_count - 1, round(fraction * frame_count))
        still = Image.open(frames_dir / f"frame_{frame_index:04d}.png").convert("RGB")
        still = still.resize((640, 360), Image.Resampling.LANCZOS)
        sheet.paste(still, ((slot % 2) * 640, (slot // 2) * 360))
    sheet.save(output_dir / "contact-sheet-in-place-v3.jpg", quality=91, optimize=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--background", required=True)
    parser.add_argument("--sprite-sheet", required=True)
    parser.add_argument("--output-dir", required=True)
    parser.add_argument("--width", type=int, default=1280)
    parser.add_argument("--height", type=int, default=720)
    parser.add_argument("--character-height", type=int, default=430)
    parser.add_argument("--duration", type=float, default=6.0)
    parser.add_argument("--fps", type=int, default=30)
    return parser.parse_args()


if __name__ == "__main__":
    render(parse_args())
