#!/usr/bin/env python3
"""Vendor NASA SVS LROC lunar albedo + LOLA elevation at web-ready resolution.

Public-domain U.S. government scientific visualization material.
Original: https://svs.gsfc.nasa.gov/4720/
"""
from pathlib import Path
import hashlib
import urllib.request

SOURCE = "https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720"
ASSETS = {
    "lroc_color_2k.jpg": (f"{SOURCE}/lroc_color_2k.jpg", 2048, 1024),
    "ldem_3_8bit.jpg": (f"{SOURCE}/ldem_3_8bit.jpg", 1024, 512),
}
def main():
    from PIL import Image
    out = Path("assets/moon")
    out.mkdir(parents=True, exist_ok=True)
    for name, (url, width, height) in ASSETS.items():
        request = urllib.request.Request(url, headers={"User-Agent": "LazarusDev-CC0-assets/1.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read(2 * 1024 * 1024 + 1)
        if len(data) > 2 * 1024 * 1024 or not data.startswith(bytes.fromhex("ffd8ff")):
            raise RuntimeError(f"Invalid JPEG payload for {name}")
        target = out / name
        target.write_bytes(data)
        with Image.open(target) as image:
            if image.size != (width, height):
                raise RuntimeError(f"{name} expected {(width, height)}, got {image.size}")
        print(f"{name}: {len(data)} bytes, SHA256 {hashlib.sha256(data).hexdigest()}")
if __name__ == "__main__":
    main()
