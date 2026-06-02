# Voice Cloning & Voice Models

Two ways to use a custom voice:

1. **Instant (zero-shot)** — pass reference audio inline on each `convert` call. Nothing is saved.
2. **Persistent voice model** — create a model once, then reuse its `id` as `reference_id`.

## 1. Instant cloning (inline references)

### Python

```python
from fishaudio import FishAudio
from fishaudio.types import ReferenceAudio
from fishaudio.utils import save

client = FishAudio()

with open("reference.wav", "rb") as f:
    audio = client.tts.convert(
        text="This is spoken in the cloned voice.",
        references=[ReferenceAudio(audio=f.read(), text="Exact transcript of reference.wav.")],
    )
save(audio, "cloned.mp3")
```

`ReferenceAudio` = `{ audio: <bytes>, text: <str> }`. `text` must match what's spoken in `audio` (include punctuation for prosody). 10–30 s of clean speech works best.

### JavaScript

```ts
import { FishAudioClient, play } from "fish-audio";
import { readFile } from "node:fs/promises";

const client = new FishAudioClient();

const buf = await readFile("reference.wav");
const audio = await client.textToSpeech.convert({
  text: "This is spoken in the cloned voice.",
  references: [
    {
      audio: new File([buf], "reference.wav"),
      text: "Exact transcript of reference.wav.",
    },
  ],
});
await play(audio);
```

In JS, `ReferenceAudio.audio` is a `File`.

## 2. Persistent voice models

### Create — Python `voices.create`

```python
with open("sample1.wav", "rb") as f1, open("sample2.wav", "rb") as f2:
    voice = client.voices.create(
        title="My Voice",
        voices=[f1.read(), f2.read()],   # list of raw audio bytes, one per sample
        description="Custom clone",
        texts=["Transcript of sample1.", "Transcript of sample2."],  # optional; ASR is run if omitted
        tags=["en", "narration"],
        visibility="private",            # "public" | "unlist" | "private" (default "private")
    )

print(voice.id, voice.state)  # state: created | training | trained | failed
```

`voices.create` keyword params: `title` (required), `voices: list[bytes]` (required), `description`, `texts`, `tags`, `cover_image: bytes`, `visibility="private"`, `train_mode="fast"`, `enhance_audio_quality=True`.

### Create — JavaScript `voices.ivc.create`

```ts
import { readFile } from "node:fs/promises";

const buf = await readFile("sample1.wav");
const voice = await client.voices.ivc.create({
  title: "My Voice",
  voices: [new File([buf], "sample1.wav")], // File[]
  description: "Custom clone",
  visibility: "private",
});
console.log(voice._id, voice.state);
```

> Note the JS path is `client.voices.ivc.create` (IVC = instant voice cloning), and `voices` are `File[]`.

### Use a created model

```python
audio = client.tts.convert(text="Using my saved voice.", reference_id=voice.id)
```

```ts
const audio = await client.textToSpeech.convert({
  text: "Using my saved voice.",
  reference_id: voice._id,
});
```

## Managing voice models

| Action | Python                                                                                 | JavaScript                                                  |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| List   | `client.voices.list(self_only=True)` → `PaginatedResponse[Voice]` (`.total`, `.items`) | `client.voices.search({ self: true })` → `{ total, items }` |
| Get    | `client.voices.get(voice_id)`                                                          | `client.voices.get(voiceId)`                                |
| Update | `client.voices.update(voice_id, title=..., visibility=...)`                            | `client.voices.update(voiceId, { title, visibility })`      |
| Delete | `client.voices.delete(voice_id)`                                                       | `client.voices.delete(voiceId)`                             |

Python `voices.list` is manually paged: `page_size` (default 10), `page_number` (default 1), plus filters `title`, `tags`, `self_only`, `author_id`, `language`, `title_language`, and `sort_by` (`"task_count"` default, or `"created_at"`). There is no auto-pager — loop `page_number` yourself.

A model is usable as a `reference_id` once its `state` is `"trained"`. States: `created → training → trained` (or `failed`).
