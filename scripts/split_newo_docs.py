#!/usr/bin/env python3
import argparse
import json
import os
import random
import re
from typing import List, Dict
from urllib.parse import urlparse


def derive_slug_from_url(url: str) -> str:
    parsed = urlparse(url)
    path = parsed.path or "/"
    # Expecting paths like /docs or /docs/<slug>
    # Use the last non-empty segment; default to "index" when path ends with /docs
    segments = [seg for seg in path.split("/") if seg]
    if not segments:
        return "index"
    if segments[-1] == "docs" and len(segments) == 1:
        return "index"
    return segments[-1]


def sanitize_slug(slug: str) -> str:
    slug = slug.strip().lower()
    slug = slug.replace(" ", "-").replace("_", "-")
    # Keep alphanumerics and hyphens only
    slug = re.sub(r"[^a-z0-9\-]", "", slug)
    slug = re.sub(r"\-+", "-", slug)  # collapse repeats
    slug = slug.strip("-")
    return slug or "index"


def ensure_unique_slug(slug: str, seen: Dict[str, int]) -> str:
    if slug not in seen:
        seen[slug] = 0
        return slug
    seen[slug] += 1
    return f"{slug}-{seen[slug]}"


def write_markdown_files(items: List[dict], out_dir: str) -> List[str]:
    os.makedirs(out_dir, exist_ok=True)
    created_files: List[str] = []
    seen: Dict[str, int] = {}

    for idx, item in enumerate(items):
        url = item.get("url", "")
        markdown = item.get("markdown")

        if not isinstance(markdown, str) or not markdown.strip():
            # Skip items without markdown content
            continue

        base_slug = derive_slug_from_url(url) if url else f"doc-{idx+1}"
        base_slug = sanitize_slug(base_slug)
        slug = ensure_unique_slug(base_slug, seen)

        filename = f"{slug}.md"
        out_path = os.path.join(out_dir, filename)

        # Write content as-is; add trailing newline for proper formatting
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(markdown)
            if not markdown.endswith("\n"):
                f.write("\n")

        created_files.append(out_path)

    return created_files


def main() -> None:
    parser = argparse.ArgumentParser(description="Split Newo all-docs.json into individual Markdown files.")
    parser.add_argument("--input", required=True, help="Path to all-docs.json")
    parser.add_argument("--out", required=True, help="Output directory for .md files")
    parser.add_argument("--sample", type=int, default=5, help="How many random files to sample for verification output")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        raise ValueError("Expected a JSON array at the root of the input file")

    created_files = write_markdown_files(data, args.out)
    print(f"Wrote {len(created_files)} markdown files to {args.out}")

    # Sample a few outputs for quick verification
    sample_count = min(args.sample, len(created_files))
    if sample_count == 0:
        print("No files were created. Check the input JSON structure.")
        return

    sampled = random.sample(created_files, sample_count)
    print("\nSampled files:")
    for path in sampled:
        print(f"- {path}")
        try:
            with open(path, "r", encoding="utf-8") as f:
                # Show first ~10 lines as a preview
                for i, line in enumerate(f):
                    if i >= 10:
                        break
                    print(line.rstrip())
        except Exception as e:
            print(f"  [Error reading {path}: {e}]")
        print("\n---\n")


if __name__ == "__main__":
    main()


