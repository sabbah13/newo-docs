#!/usr/bin/env python3
import argparse
import json
import os
import random
import re
from typing import List, Dict, Tuple
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


def build_slug_map(items: List[dict]) -> Tuple[Dict[str, str], List[Tuple[int, str, str]]]:
    """Pre-compute unique slugs and return:
    - path_to_file: mapping from normalized '/docs' paths to file names (e.g., '/docs/hello-world' -> 'hello-world.md', '/docs' -> 'index.md')
    - index_to_slug_info: list of tuples (idx, url, filename) in the same order as items to be used when writing files
    """
    seen: Dict[str, int] = {}
    path_to_file: Dict[str, str] = {}
    index_to_slug_info: List[Tuple[int, str, str]] = []

    for idx, item in enumerate(items):
        url = item.get("url", "")
        base_slug = derive_slug_from_url(url) if url else f"doc-{idx+1}"
        base_slug = sanitize_slug(base_slug)
        slug = ensure_unique_slug(base_slug, seen)
        filename = f"{slug}.md"

        # Compute normalized '/docs' path key if URL is present
        path_key = None
        if url:
            parsed = urlparse(url)
            path = parsed.path or "/"
            # Normalize: strip trailing '/'
            path_norm = path.rstrip("/")
            if not path_norm:
                path_norm = "/"
            # Only map '/docs' space
            if path_norm == "/docs" or path_norm.startswith("/docs/"):
                path_key = path_norm
                path_to_file[path_key] = filename

        # Always store mapping by index for later
        index_to_slug_info.append((idx, url, filename))

        # Also add a fallback mapping by last segment if unique and under '/docs'
        if path_key:
            segments = [seg for seg in path_key.split("/") if seg]
            if segments and segments[-1] != "docs":
                seg_key = f"/docs/{segments[-1]}"
                # Do not overwrite an existing explicit mapping
                path_to_file.setdefault(seg_key, filename)

    # Ensure root '/docs' points to index.md if present
    path_to_file.setdefault("/docs", path_to_file.get("/docs", "index.md"))

    return path_to_file, index_to_slug_info


def rewrite_internal_links(markdown: str, path_to_file: Dict[str, str]) -> str:
    """Rewrite links that point to docs.newo.ai/docs... or /docs/... to local .md files.
    Preserve fragments (#section). Do not touch external links or images.
    """
    # Match standard markdown links [text](dest)
    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

    def replace(match: re.Match) -> str:
        text = match.group(1)
        dest = match.group(2).strip()

        # Skip images: detect preceding '!' by checking the original string context
        start = match.start()
        if start > 0 and markdown[start - 1] == '!':
            return match.group(0)

        # Ignore pure fragments or mailto
        if dest.startswith('#') or dest.startswith('mailto:'):
            return match.group(0)

        # Parse URL/path
        path = None
        fragment = ''
        # Separate fragment
        if '#' in dest:
            base, frag = dest.split('#', 1)
            dest_base = base
            fragment = f"#{frag}"
        else:
            dest_base = dest

        # Absolute docs domain
        if dest_base.startswith('https://docs.newo.ai') or dest_base.startswith('http://docs.newo.ai'):
            parsed = urlparse(dest_base)
            path = (parsed.path or '/').rstrip('/') or '/'
        # Site-absolute path
        elif dest_base.startswith('/'):
            path = dest_base.rstrip('/') or '/'
        else:
            # relative paths or other domains: leave as-is
            return match.group(0)

        # Only rewrite links under '/docs'
        if path == '/docs' or path.startswith('/docs/'):
            # Map by full path; fallback to last segment mapping
            filename = path_to_file.get(path)
            if not filename:
                segments = [seg for seg in path.split('/') if seg]
                if segments:
                    filename = path_to_file.get(f"/docs/{segments[-1]}")

            if filename:
                new_dest = f"{filename}{fragment}"
                return f"[{text}]({new_dest})"

        return match.group(0)

    return link_pattern.sub(replace, markdown)


def write_markdown_files(items: List[dict], out_dir: str) -> List[str]:
    os.makedirs(out_dir, exist_ok=True)
    created_files: List[str] = []
    # First pass: build mapping and deterministic filenames
    path_to_file, index_to_slug_info = build_slug_map(items)

    for idx, url, filename in index_to_slug_info:
        item = items[idx]
        markdown = item.get("markdown")

        if not isinstance(markdown, str) or not markdown.strip():
            continue

        # Rewrite internal links
        rewritten = rewrite_internal_links(markdown, path_to_file)

        out_path = os.path.join(out_dir, filename)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(rewritten)
            if not rewritten.endswith("\n"):
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


