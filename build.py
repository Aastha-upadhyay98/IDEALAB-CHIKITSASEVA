#!/usr/bin/env python3
"""Builds the single-file app (index.html) from src/.

Usage: python3 build.py
"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).parent
SRC = ROOT / "src"

def translations():
    rows = {}
    for f in sorted((SRC / "i18n").glob("*.tsv")):
        for n, line in enumerate(f.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                continue
            parts = line.split("\t")
            if len(parts) != 3:
                raise SystemExit(f"{f.name}:{n}: expected 3 tab-separated columns (English, Hindi, Marathi)")
            en, hi, mr = parts
            ph = set(re.findall(r"\{\w+\}", en))
            if set(re.findall(r"\{\w+\}", hi)) != ph or set(re.findall(r"\{\w+\}", mr)) != ph:
                raise SystemExit(f"{f.name}:{n}: placeholders differ from English: {en}")
            rows[en] = (hi, mr)
    return rows

def main():
    rows = translations()
    i18n = ("const TR=" + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) +
            ";\nconst T={hi:{},mr:{}};for(const k in TR){T.hi[k]=TR[k][0];T.mr[k]=TR[k][1]}\n")
    js = i18n + "".join(p.read_text(encoding="utf-8") for p in sorted((SRC / "js").glob("*.js")))
    html = (SRC / "template.html").read_text(encoding="utf-8")
    html = html.replace("/*__CSS__*/", (SRC / "style.css").read_text(encoding="utf-8"))
    html = html.replace("/*__JS__*/", js)
    (ROOT / "index.html").write_text(html, encoding="utf-8")
    print(f"Built index.html with {len(rows)} translations")

if __name__ == "__main__":
    main()
