#!/usr/bin/env python3
"""Vendor the exact Poly Haven CC0 sky/HDRI for deterministic web builds."""
import hashlib
import io
import json
import pathlib
import urllib.request

ASSET = "kloppenheim_06_puresky"
OUT = pathlib.Path("assets/hdris")
AGENT = "LazarusDev-site/1.0 (CC0 asset pipeline)"

def fetch(url, cap):
    req = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(req, timeout=60) as response:
        data = response.read(cap + 1)
        if len(data) > cap:
            raise ValueError(f"Asset exceeds the {cap // 1024 // 1024} MiB cap")
        return data

def main():
    OUT.mkdir(parents=True, exist_ok=True)
    metadata = json.loads(fetch(f"https://api.polyhaven.com/files/{ASSET}", 200_000))
    original = metadata["hdri"]["1k"]["hdr"]
    hdr = fetch(original["url"], 8 * 1024 * 1024)
    assert hdr.startswith(b"#?RADIANCE") or hdr.startswith(b"#?RGBE"), "Invalid Radiance HDR"
    if original.get("md5"):
        assert hashlib.md5(hdr).hexdigest() == original["md5"], "HDR checksum mismatch"
    (OUT / f"{ASSET}_1k.hdr").write_bytes(hdr)
    # Official Poly Haven tonemapped preview is downscaled to a web-sized jpg.
    photo_info = metadata.get("tonemapped", {})
    if not photo_info:
        raise ValueError("Poly Haven did not provide a tonemapped photographic sky")
    photo = fetch(photo_info["url"], 65 * 1024 * 1024)
    from PIL import Image, ImageOps
    image = Image.open(io.BytesIO(photo)).convert("RGB")
    image.thumbnail((2048, 1024), Image.Resampling.LANCZOS)
    image.save(OUT / "sky_photo_2k.jpg", quality=87, optimize=True, progressive=True, subsampling=0)
    print(f"Verified CC0 photographic sky {ASSET}: HDR {len(hdr):,} bytes, JPG {image.size}")

if __name__ == "__main__":
    main()
