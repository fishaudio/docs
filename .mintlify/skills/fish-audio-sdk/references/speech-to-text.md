# Speech-to-Text (ASR)

Both SDKs wrap `POST /v1/asr`: one audio file per request, and the response arrives when the whole file has been transcribed. Neither SDK has a `model` argument for ASR; you select the model with the `model` HTTP header. Full guide: `https://docs.fish.audio/features/speech-to-text`.

## Choose a model

- `transcribe-1`: general transcription of short recordings. The default when the `model` header is missing.
- `transcribe-1-pro`: multi-speaker conversations and long recordings (up to 60 minutes). `text` contains inline `<|speaker:N|>` markers and bracketed emotion or vocal-event cues such as `[laughter]` or `[高兴]`.

Select `transcribe-1-pro` with the `model` header:

- Python: `request_options=RequestOptions(additional_headers={"model": "transcribe-1-pro"})`, with `from fishaudio.core import RequestOptions`.
- JavaScript: pass `{ headers: { model: "transcribe-1-pro" } }` as the second argument of `convert`.
- Write the value exactly, in lowercase. A missing or unrecognized value (for example `Transcribe-1-Pro` or `transcribe-1pro`) is served and billed as `transcribe-1`, and no error is returned. If you expected `transcribe-1-pro` but the transcript has no speaker markers, check the header.

## Python: `client.asr.transcribe`

```python
from fishaudio import FishAudio
from fishaudio.core import RequestOptions

client = FishAudio()  # reads FISH_API_KEY

with open("audio.wav", "rb") as f:
    result = client.asr.transcribe(
        audio=f.read(),
        language="en",  # optional hint; omit to auto-detect
        request_options=RequestOptions(
            additional_headers={"model": "transcribe-1-pro"},  # omit for transcribe-1
            timeout=900,  # long Pro recordings can take several minutes
        ),
    )

print(result.text)

for seg in result.segments:
    print(f"[{seg.start:.2f}s - {seg.end:.2f}s] {seg.text}")
```

Keyword params:

| Param                | Type                     | Default      | Notes                                                                                                                                                                                             |
| -------------------- | ------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audio`              | `bytes`                  | — (required) | Raw file bytes; the format is detected from the content. The SDK sends them as MessagePack.                                                                                                       |
| `language`           | `str`                    | auto-detect  | Optional hint, a lowercase ISO 639-1 code (`"en"`, `"zh"`, `"ja"`). Detection still runs, and the hint does not force the transcript language. `"en-US"` or `"English"` may be rejected with 400. |
| `include_timestamps` | `bool`                   | `True`       | `True` (default) requests word-level timestamps, which adds processing time; pass `False` when you only need text (`segments` is then empty).                                                     |
| `request_options`    | `RequestOptions \| None` | `None`       | Per-request `timeout` and headers. Select the model here: `RequestOptions(additional_headers={"model": "transcribe-1-pro"})`.                                                                     |

### Response shape (`ASRResponse`)

```python
result.text            # str: full transcript (Pro: with <|speaker:N|> markers and [cues])
result.duration        # float: total audio duration in seconds, including silence
result.segments        # list[ASRSegment]; [] when timestamps are off or no speech was found
# each segment:
seg.text               # str: usually one word (one or a few characters in Chinese/Japanese)
seg.start              # float: seconds
seg.end                # float: seconds (can equal start)
```

`duration`, `start`, and `end` are all in **seconds**. The SDK's `ASRResponse` docstring says milliseconds; that is wrong, so do not divide by 1000.

Segment text has no punctuation, speaker markers, or cues, and can be normalized (for example `35` for `3.5`), so it does not always match `text` character for character. Segments are not speaker turns.

### Fields the Python SDK does not expose

In `fish-audio-sdk` 1.3.0, `ASRResponse` keeps only `text`, `duration`, and `segments`. It silently drops these response fields:

- `language` (English name, such as `English`) and `language_code` (ISO 639-1, such as `en`), returned when the language is known;
- `request_id` (`transcribe-1-pro`), also sent as the `x-request-id` header;
- `speaker_turns` (`transcribe-1-pro`, when timestamps are requested).

`asr.transcribe()` also cannot send the `transcribe-1-pro` fields `tag_audio_events`, `diarize`, `num_speakers`, `min_speakers`, or `max_speakers`. For any of these, call the API directly. Field semantics are in the `fish-audio-api` skill (`POST /v1/asr`).

```python
import os
import httpx

with open("meeting.mp3", "rb") as f:
    r = httpx.post(
        "https://api.fish.audio/v1/asr",
        headers={
            "Authorization": f"Bearer {os.environ['FISH_API_KEY']}",
            "model": "transcribe-1-pro",
        },
        files={"audio": f},
        data={"ignore_timestamps": "false"},  # word timestamps + speaker_turns
        # Long Pro recordings can take several minutes; httpx defaults to 5 s.
        timeout=httpx.Timeout(900.0, connect=10.0),
    )
r.raise_for_status()
result = r.json()
print(result.get("language_code"), result.get("request_id"))
for turn in result.get("speaker_turns", []):
    print(f"{turn['speaker']} [{turn['start']:.2f}-{turn['end']:.2f}] {turn['text']}")
```

### Errors (Python)

`asr.transcribe()` raises `APIError` (`RateLimitError` for 429, `ServerError` for 5xx) with `.status`, `.message`, and `.body` (the raw response text). `transcribe-1-pro` error bodies also carry `code` and `request_id`:

```python
import json
from fishaudio.exceptions import APIError

try:
    result = client.asr.transcribe(audio=audio_bytes)
except APIError as e:
    try:
        err = json.loads(e.body or "{}")
    except ValueError:
        err = {}  # errors from the network edge may not be JSON
    print(e.status, err.get("code"), err.get("request_id"))
    raise
```

Branch on `code` or the HTTP status, never on `message`. Retry 429 and 5xx with exponential backoff (the Python SDK does not retry); do not retry other 4xx responses. See the `fish-audio-api` skill for the status and `code` list.

## JavaScript: `client.speechToText.convert`

```ts
import { FishAudioClient } from "fish-audio";
import { readFile } from "node:fs/promises";

const client = new FishAudioClient();

const buf = await readFile("audio.wav");
const result = await client.speechToText.convert(
  {
    audio: new File([buf], "audio.wav"),
    language: "en", // optional hint; omit to auto-detect
    ignore_timestamps: false, // false → word-level segments (and speaker_turns on Pro)
  },
  { headers: { model: "transcribe-1-pro" }, timeoutInSeconds: 900 }
);

console.log(result.text);
for (const seg of result.segments) {
  console.log(`[${seg.start}-${seg.end}] ${seg.text}`);
}
```

`STTRequest` = `{ audio: File; language?: string; ignore_timestamps?: boolean }`, sent as multipart. JS uses `ignore_timestamps` (the inverse of Python's `include_timestamps`), and the server default is `true`, so you get no `segments` unless you pass `false`.

In Node.js, the built-in `fetch` that the SDK uses stops waiting for response headers after 300 s, whatever `timeoutInSeconds` says (the call fails with `fetch failed`). For long Pro recordings, raise that limit once at startup with the `undici` package (`undici@7` runs on Node.js 20.18.1+; `undici@8` needs Node.js 22.19+ and fails at import on older versions):

```ts
import { Agent, setGlobalDispatcher } from "undici"; // npm install undici@7

setGlobalDispatcher(
  new Agent({ headersTimeout: 900_000, bodyTimeout: 900_000 })
);
```

`STTResponse` types only `{ text, duration, segments }`; at runtime the body also has `language`, `language_code`, and on Pro `request_id` and `speaker_turns`. Widen the type to read them:

```ts
type SpeakerTurn = {
  speaker: string;
  text: string;
  start: number;
  end: number;
};
const body = result as typeof result & {
  language?: string;
  language_code?: string;
  request_id?: string;
  speaker_turns?: SpeakerTurn[];
};
for (const turn of body.speaker_turns ?? []) {
  console.log(`${turn.speaker} [${turn.start}-${turn.end}] ${turn.text}`);
}
```

The JS SDK cannot send `tag_audio_events`, `diarize`, or the speaker counts; use `fetch` with `FormData` for those (see the `fish-audio-api` skill).

## Limits and formats (both SDKs)

- `transcribe-1` is designed for short recordings: up to 50 MiB per request, and keep MP3 and Opus files under 25 MiB. For recordings longer than a few minutes, use `transcribe-1-pro`.
- `transcribe-1-pro` accepts recordings up to 60 minutes (longer returns 400 `audio_too_long`). Send long recordings as compressed audio (MP3, Opus, or AAC); a request that is too large returns 413. Send a whole conversation as one file: speaker labels are consistent within one response, not across requests.
- Processing time grows with the length of the recording, and long `transcribe-1-pro` requests can take several minutes. Both SDKs default to a 240 s timeout; raise it for long recordings (the examples use 900 s), and in Node.js also raise the `fetch` header limit shown above.
- Both models accept WAV, MP3, AAC (including M4A/MP4), FLAC, and Ogg (Opus or Vorbis). `transcribe-1-pro` also accepts WebM/Matroska and MOV, including browser recordings. Browser WebM recordings may not be accepted by `transcribe-1`; convert them to Ogg/Opus, MP3, or WAV, or use `transcribe-1-pro`. AIFF, CAF, WMA, AMR, AC-3, and raw (headerless) PCM return 400.
