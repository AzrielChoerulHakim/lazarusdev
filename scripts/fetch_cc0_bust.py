#!/usr/bin/env python3
"""Fetch a CC0 scan into the project, validating the exact reviewed bytes.

Original artwork: Poly Haven marble_bust_01 by Rico Cilliers.
Provenance: https://polyhaven.com/a/marble_bust_01 (CC0)
Reviewed GLB mirror: Innerscene (CC0 Poly Haven redistribution)
This script intentionally fails on any unexpected byte change.
"""
import hashlib
import struct
from pathlib import Path
from urllib.request import urlopen, Request

URL = "https://files.innerscene.com/library/marble-bust-f5604fc9/154620fb9200428d8399/polyhaven-marble-bust-01.glb"
SHA256 = "f09278501571c32e50edabcf9a2508427fe967c9511393ef18a6c9f360f340dd"
DEST = Path("assets/models/marble_bust_01.glb")

def verify(data: bytes) -> None:
    if not (1024 < len(data) < 8_000_000):
        raise ValueError(f"Unexpected GLB size: {len(data)}")
    magic, version, length = struct.unpack_from("<4sII", data)
    if magic != b"glTF" or version != 2 or length != len(data):
        raise ValueError("Invalid binary glTF 2.0")
    digest = hashlib.sha256(data).hexdigest()
    if digest != SHA256:
        raise ValueError(f"SHA-256 mismatch: {digest} != {SHA256}")

def main() -> None:
    if DEST.exists():
        verify(DEST.read_bytes())
        print(f"Verified checked-in CC0 bust: {DEST.stat().st_size} bytes")
        return
    request = Request(URL, headers={"User-Agent": "LazarusDev-Asset-Build/1.0"})
    with urlopen(request, timeout=90) as response:
        data = response.read(8_000_001)
    verify(data)
    DEST.parent.mkdir(parents=True, exist_ok=True)
    DEST.write_bytes(data)
    print(f"Downloaded and verified CC0 bust: {len(data)} bytes, sha256={SHA256}")

if __name__ == "__main__":
    main()
