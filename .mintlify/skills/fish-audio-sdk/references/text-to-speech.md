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
audio = client.tts.convert(text="Speaking faster.", model="s2-pro", speed=1.5)
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
| `model`           | `"s2-pro" \| "s1"`                  | `"s2-pro"`    | Synthesis model per current SDK typing. The API also accepts `"s2.1-pro"` / `"s2.1-pro-free"`, forwarded fine at runtime, but add `# type: ignore` for static checkers. `s1` is deprecated and will be retired on December 31, 2026; after that date, requests that specify `s1` are served by `s2.1-pro`. `speech-1.5` / `speech-1.6` are deprecated. |
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

- `s2.1-pro` is recommended for production; `s2-pro` is the Python SDK default. `s1` is the previous generation: S1 is deprecated and will be retired on December 31, 2026. After that date, requests that specify `s1` are served by `s2.1-pro`. Migration: `https://docs.fish.audio/developer-guide/models-pricing/migrate-from-s1`.
- Emotion/expression is controlled inline in `text` (S2-Pro uses free-form `[bracket]` tags; the deprecated S1 uses legacy `(parenthesis)` tags, and the API does not convert between them); there is no separate SDK parameter. Full tag list: `https://docs.fish.audio/api-reference/emotion-reference`.
