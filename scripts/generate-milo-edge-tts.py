#!/usr/bin/env python3
"""
Batch-generate Milo MP3 clips with Microsoft Edge TTS (he-IL-HilaNeural).

Usage:
  npx tsx scripts/export-milo-he-female-queue.ts
  python3 scripts/generate-milo-edge-tts.py [--queue scripts/milo-he-female-queue.json]
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import subprocess
import sys

try:
    import edge_tts
except ImportError:
    print("[SETUP] Installing edge-tts...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "edge-tts"])
    import edge_tts

VOICE = "he-IL-HilaNeural"
DEFAULT_QUEUE = os.path.join(os.path.dirname(__file__), "milo-he-female-queue.json")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "audio", "milo")
MAX_CONCURRENCY = 3


async def synthesize_item(semaphore: asyncio.Semaphore, item: dict, out_dir: str) -> bool:
    filename = item.get("filename", "").strip()
    text = item.get("text", "").strip()

    if not filename or not text:
        print(f"[SKIP] Invalid entry: {item}")
        return False

    if not filename.lower().endswith(".mp3"):
        filename += ".mp3"

    output_path = os.path.join(out_dir, filename)

    async with semaphore:
        try:
            print(f"[START] {filename}")
            communicator = edge_tts.Communicate(text=text, voice=VOICE)
            await communicator.save(output_path)
            size_kb = round(os.path.getsize(output_path) / 1024, 1)
            print(f"[DONE]  {filename} ({size_kb} KB)")
            return True
        except Exception as err:
            print(f"[ERROR] {filename}: {err}", file=sys.stderr)
            return False


async def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--queue", default=DEFAULT_QUEUE)
    args = parser.parse_args()

    if not os.path.exists(args.queue):
        print(f"[ERROR] Queue file not found: {args.queue}", file=sys.stderr)
        print("Run: npx tsx scripts/export-milo-he-female-queue.ts", file=sys.stderr)
        sys.exit(1)

    with open(args.queue, "r", encoding="utf-8") as f:
        items = json.load(f)

    if not isinstance(items, list) or not items:
        print("[ERROR] Queue must be a non-empty JSON array.", file=sys.stderr)
        sys.exit(1)

    out_dir = os.path.abspath(OUTPUT_DIR)
    os.makedirs(out_dir, exist_ok=True)

    print("=" * 60)
    print(f" Edge TTS batch — {VOICE}")
    print(f" Items: {len(items)}  →  {out_dir}")
    print("=" * 60)

    semaphore = asyncio.Semaphore(MAX_CONCURRENCY)
    results = await asyncio.gather(
        *[synthesize_item(semaphore, item, out_dir) for item in items]
    )

    ok = sum(1 for r in results if r)
    fail = len(results) - ok
    print("\n" + "=" * 60)
    print(f"COMPLETE: {ok} ok, {fail} failed, {len(results)} total")
    print("=" * 60)

    if fail:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
