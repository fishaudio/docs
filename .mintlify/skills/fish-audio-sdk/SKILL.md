---
name: fish-audio-sdk
description: Write code with the official Fish Audio SDKs — Python (`fishaudio`, PyPI `fish-audio-sdk`) and JavaScript/TypeScript (`fish-audio`). Use when the user wants text-to-speech, speech-to-text, voice cloning / voice-model management, or realtime WebSocket TTS through the installed SDK rather than raw HTTP. Covers install and auth, sync + async Python, the TypeScript client, exact method signatures and defaults, model selection (s1 / s2-pro), the real exception types, and the Python↔JavaScript naming differences. For raw REST/WebSocket calls without an SDK (curl, unsupported languages, edge runtimes), use the `fish-audio-api` skill instead.
---

# Fish Audio SDK Skill

Use this skill to generate correct, runnable code with the **official Fish Audio SDKs**:

- **Python** — package `fish-audio-sdk` on PyPI, imported as `fishaudio`. (The same wheel still ships a separate legacy `fish_audio_sdk` package — do **not** mix them; everything here is the modern `fishaudio` package.)
- **JavaScript / TypeScript** — package `fish-audio` on npm, imported as `FishAudioClient`.

If the user wants raw `curl` / HTTP / WebSocket without installing an SDK, use the **`fish-audio-api`** skill instead.

> This file is the index. Deeper, task-specific rules and full examples live in [`references/`](references/). Read the reference for the task you're doing before writing code.

## Global facts

- **Auth:** both SDKs read the API key from the `FISH_API_KEY` environment variable automatically. Get keys at `https://fish.audio/app/api-keys`. Never hardcode a key — read it from the environment.
- **Base URL:** `https://api.fish.audio` (override with `base_url=` in Python / `baseUrl:` in JS).
- **Models:** `s2-pro` (default — highest quality) and `s1`. `speech-1.5` / `speech-1.6` are **deprecated**. In Python pass `model="s2-pro"` (keyword); in JS pass the **positional** `backend` argument.
- **Audio formats:** `mp3` (default), `wav`, `pcm`, `opus`.
- **Playback in examples:** `play()` shells out to a system audio tool — Python uses **ffmpeg/ffplay** (or `mpv`), JS uses **ffplay**. It is for local/desktop use; in a server, `save()` to a file or stream the bytes instead. See [references/installation.md](references/installation.md).

## Quick start — Python

```python
from fishaudio import FishAudio
from fishaudio.utils import play, save

client = FishAudio()  # reads FISH_API_KEY

# Generate speech (returns the full audio as bytes)
audio = client.tts.convert(text="Hello from Fish Audio!")

save(audio, "output.mp3")   # write to a file
# play(audio)               # or play locally (needs ffmpeg)
```

Async — identical resource tree on `AsyncFishAudio`, used as a context manager:

```python
import asyncio
from fishaudio import AsyncFishAudio
from fishaudio.utils import save

async def main():
    async with AsyncFishAudio() as client:
        audio = await client.tts.convert(text="Hello from Fish Audio!")
        save(audio, "output.mp3")

asyncio.run(main())
```

## Quick start — JavaScript / TypeScript

```ts
import { FishAudioClient, play } from "fish-audio";

const client = new FishAudioClient({ apiKey: process.env.FISH_API_KEY });

// convert() returns audio you can play or pipe to a file
const audio = await client.textToSpeech.convert({
  text: "Hello from Fish Audio!",
}); // defaults to model "s2-pro"
await play(audio); // local playback (needs ffplay)
```

To pick a model in JS, pass `backend` as the **positional** argument (not a named option):

```ts
const audio = await client.textToSpeech.convert({ text: "Hi" }, "s1");
```

## Capabilities → references

| Task                                                             | Reference                                                    |
| ---------------------------------------------------------------- | ------------------------------------------------------------ |
| Install, auth, playback deps, verify a key                       | [references/installation.md](references/installation.md)     |
| Text-to-Speech (convert, stream, formats, prosody, model select) | [references/text-to-speech.md](references/text-to-speech.md) |
| Voice cloning (instant references + persistent voice models)     | [references/voice-cloning.md](references/voice-cloning.md)   |
| Speech-to-Text (transcribe, segments, timestamps)                | [references/speech-to-text.md](references/speech-to-text.md) |
| Realtime WebSocket TTS (stream text → audio)                     | [references/websocket.md](references/websocket.md)           |
| Errors, retries, and timeouts (the **real** exception types)     | [references/errors.md](references/errors.md)                 |

## Python ↔ JavaScript name map

The two SDKs do **not** use the same names. Use this map when porting code between them.

| Concept               | Python (`fishaudio`)                              | JavaScript (`fish-audio`)                                  |
| --------------------- | ------------------------------------------------- | ---------------------------------------------------------- |
| Client                | `FishAudio()` / `AsyncFishAudio()`                | `new FishAudioClient({ apiKey })`                          |
| Text-to-Speech        | `client.tts.convert(text=...)` → `bytes`          | `client.textToSpeech.convert({ text })`                    |
| TTS HTTP stream       | `client.tts.stream(...)` → `AudioStream`          | (use `convert`; realtime streaming is `convertRealtime`)   |
| Realtime WebSocket    | `client.tts.stream_websocket(text_stream)`        | `client.textToSpeech.convertRealtime(request, textStream)` |
| Speech-to-Text        | `client.asr.transcribe(audio=...)`                | `client.speechToText.convert({ audio })`                   |
| List voice models     | `client.voices.list()`                            | `client.voices.search()`                                   |
| Get voice model       | `client.voices.get(id)`                           | `client.voices.get(id)`                                    |
| Create voice (clone)  | `client.voices.create(title=..., voices=[bytes])` | `client.voices.ivc.create({ title, voices: [File] })`      |
| Update / delete voice | `client.voices.update(id, ...)` / `delete(id)`    | `client.voices.update(id, ...)` / `delete(id)`             |
| Credit balance        | `client.account.get_credits()`                    | `client.user.get_api_credit()`                             |
| Subscription package  | `client.account.get_package()`                    | `client.user.get_package()`                                |
| Choose model          | `model="s2-pro"` keyword arg                      | positional `backend` arg, e.g. `convert(req, "s2-pro")`    |

## Decision shortcuts

- **Audio from text** → `tts.convert` (Python) / `textToSpeech.convert` (JS).
- **Reuse a saved voice** → pass `reference_id` (the voice model `id`).
- **Clone a voice instantly from a clip** → pass `references=[ReferenceAudio(audio=..., text=...)]` (Python) / `references: [{ audio, text }]` (JS). See [voice-cloning](references/voice-cloning.md).
- **Persistent custom voice to reuse** → create a voice model, then use its `id` as `reference_id`.
- **Stream tokens from an LLM and play speech as it arrives** → `tts.stream_websocket` (Python) / `textToSpeech.convertRealtime` (JS). See [websocket](references/websocket.md).
- **Transcribe audio** → `asr.transcribe` (Python) / `speechToText.convert` (JS).

## Gotchas (verified against the SDK source)

- Python `latency` accepts only **`"normal"` or `"balanced"`** (default `"balanced"`) — there is no `"low"`.
- The Python client has **no `max_retries`** and does **not** auto-retry; the JS client **does** auto-retry (configurable via per-call `requestOptions.maxRetries`). See [errors](references/errors.md).
- Python defines a `ValidationError` class but **never raises it** — don't catch it expecting validation failures; a 422 surfaces as `APIError`. The JS SDK throws `UnprocessableEntityError` on 422.
- ASR segment `start` / `end` are in **seconds**, but `duration` is in **milliseconds**. See [speech-to-text](references/speech-to-text.md).
