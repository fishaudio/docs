"""Run every cookbook recipe verbatim against the live Fish Audio API.

For each case: extract the exact code block from the .mdx, apply the spec's placeholder
substitutions, execute it in an isolated cwd, and assert it produced valid audio.
"""
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import harness  # noqa: E402
from extract import python_blocks  # noqa: E402
from specs import SPECS  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]  # fish-docs/


def _cases():
    for spec in SPECS:
        for case in spec["cases"]:
            yield pytest.param(spec, case, id=f"{spec['slug']}::{case['name']}")


@pytest.mark.parametrize("spec,case", list(_cases()))
def test_cookbook_recipe(spec, case, shims, base_client, work_cwd):
    fish_audio, async_fish_audio = shims
    blocks = python_blocks(ROOT / spec["path"])
    assert case["block"] < len(blocks), f"{spec['slug']}: block {case['block']} out of range"

    code = blocks[case["block"]]["code"]
    for old, new in case.get("subs", {}).items():
        code = code.replace(old, new)

    # Continuation snippets assume types imported by an earlier block on the page; provide them.
    from fishaudio.types import ReferenceAudio, TTSConfig
    from fishaudio.utils import save

    consume = harness.Consume()
    ns = {
        "__name__": "__cookbook__",
        "FishAudio": fish_audio,
        "AsyncFishAudio": async_fish_audio,
        "client": base_client,
        "consume": consume,
        "TTSConfig": TTSConfig,
        "ReferenceAudio": ReferenceAudio,
        "save": save,
    }
    exec(compile(code, spec["path"], "exec"), ns)
    if case.get("postamble"):
        exec(compile(case["postamble"], "<postamble>", "exec"), ns)

    if "file" in case:
        name, fmt = case["file"]
        path = work_cwd / name
        assert path.exists(), f"{name} was not created"
        if fmt == "srt":
            text = path.read_text(encoding="utf-8")
            assert "-->" in text, f"{name} has no SRT/VTT cues"
        else:
            data = path.read_bytes()
            assert data, f"{name} is empty"
            assert harness.sniff(data) == fmt, f"{name}: expected {fmt}, got {harness.sniff(data)}"
    if "var" in case:
        name, fmt = case["var"]
        val = ns.get(name)
        assert isinstance(val, (bytes, bytearray)) and val, f"`{name}` is not audio bytes"
        assert harness.sniff(val) == fmt, f"`{name}`: expected {fmt}, got {harness.sniff(val)}"
    if "var_nonempty" in case:
        val = ns.get(case["var_nonempty"])
        assert isinstance(val, (bytes, bytearray)) and val, f"`{case['var_nonempty']}` is not non-empty bytes"
    if "truthy" in case:
        assert ns.get(case["truthy"]), f"`{case['truthy']}` is empty/falsy after the recipe"
    if case.get("consumed"):
        assert consume.last_bytes > 0, "no audio was produced by the stream"
