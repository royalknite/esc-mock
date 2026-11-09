#!/usr/bin/env python3
"""
Programmatic Android & PWA Icon Generator for ENGLISH STUDY CENTRE.
Uses only Python Standard Library (zlib, struct, math) to generate valid,
crisp PNG icons without any external dependencies or cloud services.
"""

import zlib
import struct
import math
import os

def create_png_buffer(width, height, get_pixel_func):
    """Encodes an RGBA pixel array into a valid PNG binary format."""
    # IHDR Chunk
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_chunk = b'IHDR' + ihdr
    ihdr_crc = struct.pack('>I', zlib.crc32(ihdr_chunk) & 0xffffffff)

    # Scanlines with filter byte 0 (None)
    raw_scanlines = bytearray()
    for y in range(height):
        raw_scanlines.append(0) # filter type 0
        for x in range(width):
            r, g, b, a = get_pixel_func(x, y, width, height)
            raw_scanlines.extend((int(r) & 0xff, int(g) & 0xff, int(b) & 0xff, int(a) & 0xff))

    compressed = zlib.compress(bytes(raw_scanlines), level=9)
    idat_chunk = b'IDAT' + compressed
    idat_crc = struct.pack('>I', zlib.crc32(idat_chunk) & 0xffffffff)

    # IEND Chunk
    iend_chunk = b'IEND'
    iend_crc = struct.pack('>I', zlib.crc32(iend_chunk) & 0xffffffff)

    png_bytes = (
        b'\x89PNG\r\n\x1a\n'
        + struct.pack('>I', len(ihdr)) + ihdr_chunk + ihdr_crc
        + struct.pack('>I', len(compressed)) + idat_chunk + idat_crc
        + struct.pack('>I', 0) + iend_chunk + iend_crc
    )
    return png_bytes

def render_esc_icon(x, y, w, h, is_maskable=False):
    # Normalized coordinates 0.0 to 1.0
    nx = x / float(w)
    ny = y / float(h)

    # If maskable, scale inward by safe-margin (0.82 centered)
    if is_maskable:
        cx = 0.5
        cy = 0.5
        nx = cx + (nx - cx) / 0.82
        ny = cy + (ny - cy) / 0.82
        if nx < 0.0 or nx > 1.0 or ny < 0.0 or ny > 1.0:
            # Full-bleed deep background for maskable edges
            t = (y / float(h))
            r = int(9 + (30 - 9) * t)
            g = int(20 + (58 - 20) * t)
            b = int(41 + (138 - 41) * t)
            return (r, g, b, 255)

    # Base Royal/Navy Background Gradient
    # Top-left to bottom-right
    t_diag = (nx * 0.4 + ny * 0.6)
    bg_r = int(9 + (30 - 9) * t_diag)
    bg_g = int(20 + (58 - 20) * t_diag)
    bg_b = int(41 + (138 - 41) * t_diag)
    color = [bg_r, bg_g, bg_b, 255]

    # Rounded Squircle border (only if not maskable)
    if not is_maskable:
        # Distance to rounded rect (rx ~ 0.22)
        corner_r = 0.22
        dx = max(0.0, abs(nx - 0.5) - (0.5 - corner_r))
        dy = max(0.0, abs(ny - 0.5) - (0.5 - corner_r))
        dist_corner = math.sqrt(dx*dx + dy*dy)
        if dist_corner > corner_r:
            return (0, 0, 0, 0) # transparent outside squircle
        elif dist_corner > corner_r - 0.02:
            # Gold rim accent
            color[0] = 59
            color[1] = 130
            color[2] = 246

    # Crimson Header Shield ribbon (ny: 0.10 to 0.24, nx: 0.28 to 0.72)
    if 0.10 <= ny <= 0.25 and 0.28 <= nx <= 0.72:
        # Crimson gradient
        t_rib = (ny - 0.10) / 0.15
        color[0] = int(239 - 85 * t_rib)
        color[1] = int(68 - 42 * t_rib)
        color[2] = int(68 - 42 * t_rib)

    # ESC Monogram Plaque (ny: 0.26 to 0.46, nx: 0.22 to 0.78)
    if 0.26 <= ny <= 0.46 and 0.22 <= nx <= 0.78:
        # Dark navy plaque
        color[0] = 8
        color[1] = 19
        color[2] = 41

        # Border of plaque
        if nx <= 0.23 or nx >= 0.77 or ny <= 0.27 or ny >= 0.45:
            color[0] = 220
            color[1] = 38
            color[2] = 38

        # ESC Letter rendering (simplified high-contrast stylized geometric monogram)
        # E: nx 0.27 to 0.40, ny 0.30 to 0.42
        if 0.30 <= ny <= 0.42:
            # Letter 'E'
            if 0.28 <= nx <= 0.39:
                if nx <= 0.31 or ny <= 0.325 or (0.355 <= ny <= 0.37 and nx <= 0.38) or ny >= 0.395:
                    color[0] = 245
                    color[1] = 158
                    color[2] = 11

            # Letter 'S'
            if 0.43 <= nx <= 0.56:
                is_top = (ny <= 0.325)
                is_mid = (0.355 <= ny <= 0.37)
                is_bot = (ny >= 0.395)
                is_tl = (0.325 <= ny <= 0.36 and nx <= 0.455)
                is_br = (0.365 <= ny <= 0.40 and nx >= 0.535)
                if is_top or is_mid or is_bot or is_tl or is_br:
                    color[0] = 245
                    color[1] = 158
                    color[2] = 11

            # Letter 'C'
            if 0.60 <= nx <= 0.72:
                is_top = (ny <= 0.325)
                is_bot = (ny >= 0.395)
                is_left = (nx <= 0.63)
                if is_top or is_bot or is_left:
                    color[0] = 245
                    color[1] = 158
                    color[2] = 11

    # White Open Book Symbol (ny: 0.50 to 0.67)
    if 0.50 <= ny <= 0.67:
        # Spine is at nx = 0.50
        # Left page: nx 0.24 to 0.50
        # Right page: nx 0.50 to 0.76
        # Gentle page curve: center drops slightly
        spine_y = 0.54 + 0.04 * math.sin(math.pi * nx)
        page_bottom = spine_y + 0.10

        if spine_y <= ny <= page_bottom and 0.24 <= nx <= 0.76:
            # Pure white book pages
            color[0] = 250
            color[1] = 252
            color[2] = 255

            # Subtle page line impressions in soft slate
            rel_y = (ny - spine_y) / 0.10
            if (0.30 <= rel_y <= 0.36 or 0.55 <= rel_y <= 0.61 or 0.78 <= rel_y <= 0.84):
                if (0.28 <= nx <= 0.46) or (0.54 <= nx <= 0.72):
                    color[0] = 148
                    color[1] = 163
                    color[2] = 184

            # Spine center line (crimson ribbon)
            if 0.495 <= nx <= 0.505:
                color[0] = 220
                color[1] = 38
                color[2] = 38

    # OMR Bubble Capsule Bar (ny: 0.72 to 0.81, nx: 0.26 to 0.74)
    if 0.72 <= ny <= 0.81 and 0.26 <= nx <= 0.74:
        # Capsule container
        color[0] = 7
        color[1] = 18
        color[2] = 40

        # Border of capsule
        if nx <= 0.27 or nx >= 0.73 or ny <= 0.725 or ny >= 0.805:
            color[0] = 59
            color[1] = 130
            color[2] = 246

        # 4 Bubbles (A, B, C, D)
        # Centers at nx: 0.33, 0.44, 0.55, 0.66, cy = 0.765, radius = 0.026
        cy_b = 0.765
        r_b = 0.026
        for idx, bx in enumerate([0.33, 0.44, 0.55, 0.66]):
            dx = nx - bx
            dy = ny - cy_b
            dist = math.sqrt(dx*dx + dy*dy)
            if dist <= r_b:
                if idx == 0:
                    # Bubble A: FILLED CRIMSON (Marked correct answer!)
                    color[0] = 220
                    color[1] = 38
                    color[2] = 38
                    # White dot center
                    if dist <= r_b * 0.4:
                        color[0] = 255
                        color[1] = 255
                        color[2] = 255
                else:
                    # Bubbles B, C, D: White ring
                    if dist >= r_b - 0.007:
                        color[0] = 255
                        color[1] = 255
                        color[2] = 255
                    elif dist <= r_b * 0.4:
                        color[0] = 200
                        color[1] = 210
                        color[2] = 225
                    else:
                        color[0] = 255
                        color[1] = 255
                        color[2] = 255

    # Bottom Branding Strip Accent (ny: 0.86 to 0.94)
    if 0.86 <= ny <= 0.94 and 0.22 <= nx <= 0.78:
        # Soft educational white/gold emblem indicator
        if 0.895 <= ny <= 0.91:
            color[0] = 255
            color[1] = 255
            color[2] = 255
        elif 0.93 <= ny <= 0.94:
            color[0] = 248
            color[1] = 113
            color[2] = 113

    return tuple(color)

def main():
    public_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'public'))
    os.makedirs(public_dir, exist_ok=True)

    targets = [
        ('pwa-512x512.png', 512, 512, False),
        ('pwa-maskable-512x512.png', 512, 512, True),
        ('pwa-192x192.png', 192, 192, False),
        ('apple-touch-icon.png', 180, 180, False),
        ('favicon-32x32.png', 32, 32, False),
        ('favicon-16x16.png', 16, 16, False),
    ]

    for filename, w, h, is_maskable in targets:
        path = os.path.join(public_dir, filename)
        print(f"Generating {filename} ({w}x{h}, maskable={is_maskable})...")
        png_data = create_png_buffer(w, h, lambda x, y, width, height: render_esc_icon(x, y, width, height, is_maskable))
        with open(path, 'wb') as f:
            f.write(png_data)
        print(f"  ✓ Saved {path} ({len(png_data)} bytes)")

if __name__ == '__main__':
    main()
