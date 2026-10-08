"""Shared machinery for running cookbook recipes verbatim against the live API.

Key ideas:
- `make_shims()` returns FishAudio / AsyncFishAudio that inject the API key and (in the
  sandbox) the required HTTP proxy, so recipe code that calls `FishAudio()` with no args
  runs unchanged in CI, locally, and in the sandbox.
- voice models created by recipes are tracked and deleted in `cleanup_created()`.
"""
import os
from pathlib import Path

import httpx
from fishaudio import AsyncFishAudio as _AsyncFishAudio
from fishaudio import FishAudio as _FishAudio

BASE_URL = "https://api.fish.audio"
# Validated public voice ("Energetic Male"), used to fill <voice-id> placeholders.
PUBLIC_VOICE = "9a9cf47702da476aa4629e2506d4a857"
_WORKSPACE_ENV = "/Users/shawnlai/project/fish-audio/.env"
_LOCAL_KEYFILE = "/tmp/claude/fishdoctest/fishkey"

_created_voice_ids = []


def resolve_key():
    k = os.environ.get("FISH_API_KEY")
    if k:
        return k.strip()
    if os.path.isfile(_LOCAL_KEYFILE):
        v = Path(_LOCAL_KEYFILE).read_text().strip()
        if v:
            return v
    try:
        from dotenv import dotenv_values
        for p in (_WORKSPACE_ENV, str(Path.cwd() / ".env")):
            v = dotenv_values(p).get("FISH_API_KEY")
            if v:
                return v.strip()
    except Exception:
        pass
    return None


def _proxy():
    return os.environ.get("HTTPS_PROXY") or os.environ.get("HTTP_PROXY") or None


def _sync_httpx():
    return httpx.Client(trust_env=False, proxy=_proxy(), base_url=BASE_URL, timeout=240.0)


def _async_httpx():
    return httpx.AsyncClient(trust_env=False, proxy=_proxy(), base_url=BASE_URL, timeout=240.0)


def make_shims(key):
    # Voice-model cleanup is handled by a class-level patch in conftest (so recipes that
    # build their own FishAudio() are covered too), not per instance here.
    def FishAudio(*a, **k):
        k.setdefault("api_key", key)
        k.setdefault("httpx_client", _sync_httpx())
        return _FishAudio(*a, **k)

    def AsyncFishAudio(*a, **k):
        k.setdefault("api_key", key)
        k.setdefault("httpx_client", _async_httpx())
        return _AsyncFishAudio(*a, **k)

    return FishAudio, AsyncFishAudio


def cleanup_created(key):
    if not _created_voice_ids:
        return
    c = _FishAudio(api_key=key, httpx_client=_sync_httpx())
    for vid in list(_created_voice_ids):
        try:
            c.voices.delete(vid)
        except Exception:
            pass
    _created_voice_ids.clear()


def sniff(b):
    if b[:3] == b"ID3" or (len(b) > 1 and b[0] == 0xFF and (b[1] & 0xE0) == 0xE0):
        return "mp3"
    if b[:4] == b"RIFF":
        return "wav"
    if b[:4] == b"OggS":
        return "opus"
    return "unknown"


class Consume:
    """Stand-in for hardware playback (`play`) — drains a stream and remembers its size."""
    last_bytes = 0

    def __call__(self, stream):
        chunks = list(stream)
        self.last_bytes = sum(len(c) for c in chunks)
        return chunks
