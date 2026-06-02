# Speech-to-Text (ASR)

## Python — `client.asr.transcribe`

```python
from fishaudio import FishAudio

client = FishAudio()

with open("audio.wav", "rb") as f:
    result = client.asr.transcribe(audio=f.read(), language="en")

print(result.text)

for seg in result.segments:
    print(f"[{seg.start:.2f}s - {seg.end:.2f}s] {seg.text}")
```

Keyword params:

| Param                | Type                     | Default      | Notes                                                                                                                   |
| -------------------- | ------------------------ | ------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `audio`              | `bytes`                  | — (required) | Raw audio bytes.                                                                                                        |
| `language`           | `str`                    | auto-detect  | Omit to auto-detect (e.g. `"en"`, `"zh"`, `"ja"`).                                                                      |
| `include_timestamps` | `bool`                   | `True`       | `False` omits per-segment timestamps (and `segments` is empty). Computing timestamps adds latency on clips under ~30 s. |
| `request_options`    | `RequestOptions \| None` | `None`       | Per-request timeout / headers.                                                                                          |

### Response shape (`ASRResponse`)

```python
result.text            # str  — full transcript
result.duration        # float — total audio duration in MILLISECONDS
result.segments        # list[ASRSegment]
# each segment:
seg.text               # str
seg.start              # float — seconds
seg.end                # float — seconds
```

> **Unit gotcha (verified in source):** segment `start` / `end` are in **seconds**, but `duration` is in **milliseconds**. Don't assume they share a unit.

## JavaScript — `client.speechToText.convert`

```ts
import { FishAudioClient } from "fish-audio";
import { readFile } from "node:fs/promises";

const client = new FishAudioClient();

const buf = await readFile("audio.wav");
const result = await client.speechToText.convert({
  audio: new File([buf], "audio.wav"),
  language: "en", // optional; omit to auto-detect
  ignore_timestamps: false, // false → include per-segment timestamps
});

console.log(result.text);
for (const seg of result.segments) {
  console.log(`[${seg.start}-${seg.end}] ${seg.text}`);
}
```

`STTRequest` = `{ audio: File; language?: string; ignore_timestamps?: boolean }`. Note JS uses `ignore_timestamps` (the inverse of Python's `include_timestamps`). `STTResponse` mirrors the Python shape: `{ text, duration, segments }`.
