"""Pytest fixtures: API key, client shims, a generated reference clip, and a clean
working directory seeded with the input files recipes expect.
"""
import os
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).parent))
import harness  # noqa: E402


@pytest.fixture(scope="session")
def api_key():
    key = harness.resolve_key()
    if not key:
        pytest.skip("FISH_API_KEY not available (env var, /tmp keyfile, or workspace .env)")
    # Recipes import their own `FishAudio`, which reads FISH_API_KEY from the environment —
    # export it so the verbatim, unmodified recipe code authenticates.
    os.environ["FISH_API_KEY"] = key
    return key


@pytest.fixture(scope="session")
def shims(api_key):
    return harness.make_shims(api_key)


@pytest.fixture(scope="session")
def base_client(shims):
    fish_audio, _ = shims
    return fish_audio()


@pytest.fixture(scope="session")
def sample_wav(base_client):
    # One short, clean reference clip, generated once and reused as recipe input.
    return base_client.tts.convert(
        text="Exact transcript of what is said in reference dot wav.", format="wav"
    )


@pytest.fixture(scope="session", autouse=True)
def _track_and_cleanup(api_key):
    # Patch voices.create at the class level (sync AND async) so EVERY client — including a
    # recipe's own verbatim FishAudio()/AsyncFishAudio() — records created models for cleanup.
    from fishaudio.resources.voices import AsyncVoicesClient, VoicesClient

    sync_orig = VoicesClient.create
    async_orig = AsyncVoicesClient.create

    def sync_create(self, *a, **k):
        voice = sync_orig(self, *a, **k)
        harness._created_voice_ids.append(voice.id)
        return voice

    async def async_create(self, *a, **k):
        voice = await async_orig(self, *a, **k)
        harness._created_voice_ids.append(voice.id)
        return voice

    VoicesClient.create = sync_create
    AsyncVoicesClient.create = async_create
    yield
    VoicesClient.create = sync_orig
    AsyncVoicesClient.create = async_orig
    harness.cleanup_created(api_key)


@pytest.fixture()
def work_cwd(tmp_path, sample_wav, monkeypatch):
    # Recipes read/write relative paths; give them an isolated cwd with inputs present.
    for name in ("reference.wav", "sample.wav", "speech.wav"):
        (tmp_path / name).write_bytes(sample_wav)
    monkeypatch.chdir(tmp_path)
    return tmp_path
