# Text-to-Speech

## Python: `client.tts`

`convert()` returns the **complete audio as `bytes`**. `stream()` returns an iterable of byte chunks.

```python
from fishaudio import FishAudio
from fishaudio.utils import play, save

client = FishAudio()

# Simplest: default model voice
audio = client.tts.convert(text="Hello, world!")
save(audio, "out.mp3")

# Use a specific voice model by id
audio = client.tts.convert(
    text="Using a saved voice.",
    reference_id="9a9cf47702da476aa4629e2506d4a857",
)

# Pick a model and adjust speed
audio = client.tts.convert(text="Speaking faster.", model="s2.1-pro", speed=1.5)
```

### `tts.convert` parameters

All keyword-only:

| Param             | Type                                | Default       | Notes                                                            |
| ----------------- | ----------------------------------- | ------------- | ---------------------------------------------------------------- |
| `text`            | `str`                               | — (required)  | Text to synthesize.                                              |
| `reference_id`    | `str \| None`                       | `None`        | Voice model id to speak with.                                    |
| `references`      | `list[ReferenceAudio] \| None`      | `None`        | Inline clone samples; see [voice-cloning.md](voice-cloning.md). |
| `format`          | `"mp3" \| "wav" \| "pcm" \| "opus"` | `"mp3"`       | Output format.                                                   |
| `latency`         | `"normal" \| "balanced"`            | `"balanced"`  | `normal` = higher quality, `balanced` = faster. (No `"low"`.)    |
| `speed`           | `float`                             | —             | Shortcut for prosody speed (0.5–2.0).                            |
| `config`          | `TTSConfig`                         | `TTSConfig()` | Reusable bundle of the settings below.                           |
| `model`           | `"s2.1-pro" \| "s2.1-pro-free" \| "s2-pro" \| "drama-3" \| "s1"` or any `str` | `"s2.1-pro"`  | Synthesis model (`fish-audio-sdk` 1.4.0 and later; 1.3.0 and earlier defaulted to `"s2-pro"`). `s1` is deprecated and will be retired on December 31, 2026; after that date, requests that specify `s1` are served by `s2.1-pro`. `speech-1.5` / `speech-1.6` are deprecated. |
| `request_options` | `RequestOptions \| None`            | `None`        | Per-request timeout / headers; see [errors.md](errors.md).      |

Direct params (`reference_id`, `format`, `latency`, `speed`) override the matching field on `config` when set.

### Reusable config with `TTSConfig`

```python
from fishaudio.types import TTSConfig, Prosody

config = TTSConfig(
    reference_id="933563129e564b19a115bedd57b7406a",
    format="wav",
    latency="normal",
    prosody=Prosody(speed=1.2, volume=-5),  # speed 0.5–2.0, volume dB -20..20
    temperature=0.7,                         # 0.0–1.0
    top_p=0.7,                               # 0.0–1.0
    chunk_length=200,                        # 100–300
)

audio1 = client.tts.convert(text="First line.", config=config)
audio2 = client.tts.convert(text="Second line.", config=config)
```

`TTSConfig` fields (with defaults): `format="mp3"`, `sample_rate=None`, `mp3_bitrate=128` (`64|128|192`), `opus_bitrate=32` (kbps: `-1000|24|32|48|64`, `-1000`=auto), `normalize=True`, `chunk_length=200`, `latency="balanced"`, `reference_id=None`, `references=[]`, `prosody=None`, `top_p=0.7`, `temperature=0.7`, `max_new_tokens=1024`, `repetition_penalty=1.2`, `min_chunk_length=50`, `condition_on_previous_chunks=True`, `early_stop_threshold=1.0`.

### Streaming the HTTP response

```python
# Iterate chunks as they arrive
for chunk in client.tts.stream(text="Long passage..."):
    sink.write(chunk)

# Or collect everything into bytes
audio = client.tts.stream(text="Hello!").collect()
```

Async: every method mirrors onto `AsyncFishAudio`; `await client.tts.convert(...)`, and `client.tts.stream(...)` must be awaited before iterating with `async for`.

### Word timestamps (`fish-audio-sdk` 1.6.0+)

`convert_with_timestamps()` / `stream_with_timestamps()` take the same keyword arguments as `convert()` / `stream()` and call `POST /v1/tts/stream/with-timestamp`.

```python
result = client.tts.convert_with_timestamps(text="Hello! Welcome to Fish Audio.")
result.audio      # bytes, complete audio
result.segments   # list[TTSTimestampSegment(text, start, end)], seconds from the start of result.audio
result.duration   # float | None, length reported by the API

with client.tts.stream_with_timestamps(text="Long passage...", format="opus") as stream:
    for event in stream:         # TTSTimestampEvent
        sink.write(event.audio)  # may be b"" on a closing event that only corrects timings
        show(stream.segments)    # timings so far on the full-audio timeline; re-read after every event
```

- Segments are words without punctuation; Chinese/Japanese come back one character per segment; numbers follow the spoken reading (`$42.50` → `42`, `50`). Never match segments against the input text.
- Text the API can't time (only punctuation, or only a tag like `[sigh]`): audio is complete, `segments == []`, `duration is None`. Guard before formatting `duration`.
- `stream.collect()` returns the same `TTSTimestampResult`; call it instead of iterating. After iteration has started it raises `RuntimeError`.
- Leaving the `with` block (e.g. `break`) closes the connection; without `with`, call `stream.close()` (`await stream.aclose()` async).
- Async: `await client.tts.convert_with_timestamps(...)`; `async with await client.tts.stream_with_timestamps(...) as stream: async for event in stream: ...`.
- Do not add `event.chunk_audio_offset_sec` to `stream.segments` or `result.segments`: they are already global. (`event.alignment` is the raw per-chunk snapshot, chunk-local times, `None` when absent.)
- No timestamps from `stream_websocket()`, and the JS SDK has no timestamp method; use the HTTP/WebSocket endpoints from the `fish-audio-api` skill.

## JavaScript: `client.textToSpeech`

`convert(request, backend?, requestOptions?)` resolves to a `ReadableStream<Uint8Array>` you can `play()` or pipe to a file. `backend` is the **second positional** argument, **not** a named option. Always pass it: the npm release (`fish-audio` 0.1.0) defaults it to the deprecated `"s1"` at runtime, although its README says `"s2-pro"`.

```ts
import { FishAudioClient, play, type Backends } from "fish-audio";
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";

const client = new FishAudioClient();

// model only (the cast is needed: the npm 0.1.0 `Backends` type omits "s2.1-pro")
const audio = await client.textToSpeech.convert(
  { text: "Hello, world!" },
  "s2.1-pro" as Backends
);
await play(audio);

// specific voice + model
const audio2 = await client.textToSpeech.convert(
  {
    text: "Using a saved voice.",
    reference_id: "9a9cf47702da476aa4629e2506d4a857",
  },
  "s2.1-pro" as Backends // <-- positional backend, not { backend: "s2.1-pro" }
);

// pipe to a file instead of playing
await new Promise((resolve, reject) =>
  Readable.fromWeb(audio2)
    .pipe(createWriteStream("out.mp3"))
    .on("finish", resolve)
    .on("error", reject)
);
```

`TTSRequest` (the first argument) fields: `text` (required), `reference_id?`, `references?`, `format?`, `latency?`, `prosody?: { speed?; volume? }`, `temperature?`, `top_p?`, `chunk_length?`, `mp3_bitrate?`, `opus_bitrate?`, `sample_rate?`, `normalize?`, plus the advanced generation knobs (`max_new_tokens`, `repetition_penalty`, etc.). Field names are `snake_case`, matching the API.

> The npm 0.1.0 JS `Backends` type is `'speech-1.5' | 'speech-1.6' | 'agent-x0' | 's1' | 's1-mini'`; the API also accepts `s2-pro`, `s2.1-pro`, and `s2.1-pro-free`, so pass those with an `as Backends` cast. Prefer `s2.1-pro` for production. Do not choose `s1` or `s1-mini`.

## Model & expression notes

- `s2.1-pro` is recommended for production and is the Python SDK default (`fish-audio-sdk` 1.4.0 and later). `s1` is the previous generation: S1 is deprecated and will be retired on December 31, 2026. After that date, requests that specify `s1` are served by `s2.1-pro`. Migration: `https://docs.fish.audio/developer-guide/models-pricing/migrate-from-s1`.
- Emotion/expression is controlled inline in `text` (S2-Pro uses free-form `[bracket]` tags; the deprecated S1 uses legacy `(parenthesis)` tags, and the API does not convert between them); there is no separate SDK parameter. Full tag list: `https://docs.fish.audio/api-reference/emotion-reference`.
