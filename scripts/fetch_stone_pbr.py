#!/usr/bin/env python3
"""Acquire official Poly Haven 1K weathered sandstone PBR maps (CC0)."""
from pathlib import Path
from urllib.request import urlopen, Request
import hashlib

SLUG = "old_sandstone_02"
SUFFIXES = ("diff", "nor_gl", "rough")
EXPECTED_SHA256 = {
    "diff": "a58111224570bb33eba3c348bc7e3207255b5efb07f9cf274209c56b71d6825c",
    "nor_gl": "4dcaa85f9de33d77cec4e89e6f63cd1afecb81e436104c1b7eb4b151fe0b7f75",
    "rough": "5473aa8e1c244f8e191f4e6616b75062af98fc04594c2c28f66c44aa078c0ebe",
}
DIR = Path("assets/textures")
BASE = f"https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/{SLUG}"

def main():
    DIR.mkdir(parents=True, exist_ok=True)
    for suffix in SUFFIXES:
        filename=f"{SLUG}_{suffix}_1k.jpg"
        target=DIR / filename
        if target.exists():
            data=target.read_bytes()
        else:
            url=f"{BASE}/{filename}"
            request=Request(url,headers={"User-Agent":"LazarusDev-CC0-Asset-Pipeline/1.0"})
            with urlopen(request,timeout=90) as response:
                data=response.read(3_000_001)
        if not (10_000<len(data)<3_000_000) or not data.startswith(b"\xff\xd8\xff"):
            raise RuntimeError(f"Invalid JPEG: {filename}, bytes={len(data)}")
        digest=hashlib.sha256(data).hexdigest()
        if digest != EXPECTED_SHA256[suffix]:
            raise RuntimeError(f"Checksum mismatch: {filename}: {digest}")
        target.write_bytes(data)
        print(filename, len(data), "verified SHA256", digest)
if __name__=="__main__":
    main()
