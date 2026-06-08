# Cookbook end-to-end tests

These tests run the **exact code published in the cookbook `.mdx` files** against the live
Fish Audio API, so a recipe can't pass review while showing broken or drifted code.

How it works: for each recipe, the harness extracts the ` ```python ` block straight from
the `.mdx`, substitutes a few placeholders (`<voice-id>`, `play()`, input filenames) with
test fixtures, runs it in an isolated working directory, and asserts it produced valid
audio (magic-byte check). Any voice models a recipe creates are deleted afterward.

## Run

```bash
pip install -r tests/cookbooks/requirements.txt
export FISH_API_KEY=...        # or rely on a workspace .env / keyfile
pytest tests/cookbooks -v
```

If no key is found (env var, `.env`, or local keyfile), the whole suite **skips** rather
than fails — so it's safe in CI without secrets.

## Add a recipe

Append a spec to `specs.py` — no test code changes:

```python
{
    "slug": "my-recipe",
    "path": "developer-guide/sdk-guide/cookbook/my-recipe.mdx",
    "cases": [
        {"name": "happy path", "block": 0, "file": ("out.mp3", "mp3")},
    ],
}
```

Per-case keys:
- `block` — index of the `python` code block in the page (document order).
- `subs` — `{placeholder: replacement}` string substitutions.
- `file` — `(filename, format)` the recipe should write (validated by magic bytes).
- `var` — `(variable, format)` an audio-bytes variable the recipe should define.
- `consumed` — assert the injected `consume()` drained a non-empty stream.
- `postamble` — extra code run after the block (e.g. to drive a generator the block defines).

## Tiers

- **T1 (here):** pure Fish Audio recipes — run fully live.
- **T2:** integration seams (e.g. the `fish-tts` CLI, framework plugins) — test the
  Fish-facing component live; the external framework is contract-checked.
- **T3:** full external round-trips (Telegram/Discord/Twilio) — staging only; see each
  tutorial's manual checklist and any credential-guarded integration test.
