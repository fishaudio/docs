"""Extract fenced code blocks from a Mintlify .mdx file.

The cookbook tests run the *published* code, so we pull the exact ```python blocks
out of the .mdx rather than maintaining a separate copy that can drift.
"""
import re
from pathlib import Path

# Column-0 fences: ```lang [optional label]\n <code> \n```
_FENCE = re.compile(r"^```([A-Za-z0-9_+-]*)([^\n]*)\n(.*?)^```", re.M | re.S)


def code_blocks(mdx_path, lang=None):
    text = Path(mdx_path).read_text(encoding="utf-8")
    out = []
    for m in _FENCE.finditer(text):
        block_lang = m.group(1)
        if lang and block_lang != lang:
            continue
        out.append({
            "lang": block_lang,
            "label": m.group(2).strip(),
            "code": m.group(3).rstrip("\n") + "\n",
        })
    return out


def python_blocks(mdx_path):
    return code_blocks(mdx_path, "python")


if __name__ == "__main__":
    import sys
    for i, b in enumerate(python_blocks(sys.argv[1])):
        print(f"--- block {i} ({b['label'] or 'python'}) ---")
        print(b["code"])
