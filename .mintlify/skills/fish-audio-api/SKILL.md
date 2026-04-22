---
name: fish-audio-api
description: Write direct HTTP / WebSocket calls to the Fish Audio platform (TTS, ASR, voice models, wallet, real-time TTS streaming) without depending on the Python or JavaScript SDK. Use when the user asks to call Fish Audio from curl, a language without an official SDK, an edge/runtime environment that cannot install the SDK, or when they explicitly want raw REST / WebSocket code. Covers authentication, endpoint URLs, required headers, request / response schemas, MessagePack vs JSON vs multipart encoding rules, multi-speaker dialogue, and the WebSocket streaming protocol.
---

# Fish Audio Raw API Skill

Use this skill to generate correct, runnable Fish Audio API calls without any SDK. The canonical machine-readable sources are:

- REST: `https://docs.fish.audio/api-reference/openapi.json`
- WebSocket: `https://docs.fish.audio/api-reference/asyncapi.yml`

This file condenses those into rules an agent can apply directly.

## Global facts

- Base URL: `https://api.fish.audio`
- WebSocket base: `wss://api.fish.audio`
- Auth (all endpoints): `Authorization: Bearer <FISH_API_KEY>`
- Get API keys: `https://fish.audio/app/api-keys`
- Never hardcode keys — read from an env var like `FISH_API_KEY`.
- Errors are JSON `{status, message}` for 401 / 402 / 404, and an array of `{loc, type, msg, ctx, in}` for 422 (validation).

## Endpoint map

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/v1/tts` | Text-to-Speech (streams audio bytes) |
| POST | `/v1/asr` | Speech-to-Text (returns JSON transcript) |
| GET | `/model` | List voice models |
| POST | `/model` | Create voice model (voice cloning) |
| GET | `/model/{id}` | Get voice model metadata |
| PATCH | `/model/{id}` | Update voice model |
| DELETE | `/model/{id}` | Delete voice model |
| GET | `/wallet/{user_id}/package` | Subscription package info (`user_id` defaults to `self`) |
| GET | `/wallet/{user_id}/api-credit` | API credit balance (`user_id` defaults to `self`) |
| WSS | `/v1/tts/live` | Real-time TTS streaming (MessagePack frames) |

## Text-to-Speech — `POST /v1/tts`

Required headers:

- `Authorization: Bearer <FISH_API_KEY>`
- `Content-Type: application/json` **or** `application/msgpack`
- `model: s2-pro` (required). Values: `s1`, `s2-pro`. Default to `s2-pro` unless the user explicitly asks otherwise.

Response: streaming audio bytes (`Transfer-Encoding: chunked`) in the format set by `format`. Write to a file or pipe to a player. There is **no JSON wrapper** on success.

### Request body fields (TTSRequest)

| Field | Type | Default | Notes |
| --- | --- | --- | --- |
| `text` | string | — (required) | The text to synthesize. Use speaker tags `<\|speaker:0\|>`, `<\|speaker:1\|>` for multi-speaker. |
| `reference_id` | string \| string[] \| null | null | Voice model ID. Array = multi-speaker (S2-Pro only). |
| `references` | ReferenceAudio[] \| ReferenceAudio[][] \| null | null | Inline zero-shot cloning samples. **Requires `application/msgpack`** because `audio` is raw bytes. 2D array for multi-speaker. |
| `temperature` | number 0–1 | 0.7 | Expressiveness. |
| `top_p` | number 0–1 | 0.7 | Nucleus sampling. |
| `prosody.speed` | number 0.5–2 | 1 | Playback speed. |
| `prosody.volume` | number (dB) | 0 | Loudness offset. |
| `prosody.normalize_loudness` | bool | true | **S2-Pro only.** |
| `chunk_length` | int 100–300 | 300 | Text segment size. |
| `min_chunk_length` | int 0–100 | 50 | Min chars before a new chunk. |
| `normalize` | bool | true | Normalize numbers/etc. for EN/ZH. |
| `format` | `wav` \| `pcm` \| `mp3` \| `opus` | `mp3` | Output format. |
| `sample_rate` | int \| null | null (44100, or 48000 for opus) | Output sample rate. |
| `mp3_bitrate` | 64 \| 128 \| 192 | 128 | Only when `format=mp3`. |
| `opus_bitrate` | -1000 \| 24 \| 32 \| 48 \| 64 | -1000 (auto) | Only when `format=opus`. |
| `latency` | `low` \| `normal` \| `balanced` | `normal` | Quality vs latency. |
| `max_new_tokens` | int | 1024 | Per-chunk audio token cap. |
| `repetition_penalty` | number | 1.2 | >1.0 reduces repeats. |
| `condition_on_previous_chunks` | bool | true | Cross-chunk voice consistency. |
| `early_stop_threshold` | number 0–1 | 1.0 | Batch early-stop. |

`ReferenceAudio` = `{ audio: <raw bytes>, text: <transcript string> }`. 10–30 s of clean speech works best.

### Voice source rules

1. **Library / custom voice model** → set `reference_id` to the model `_id`. Simplest path.
2. **Zero-shot from audio** → set `references` (array of `{audio, text}`) and use **MessagePack** body. JSON cannot carry raw audio bytes.
3. **Multi-speaker dialogue (S2-Pro only)** → `reference_id: [id0, id1, ...]` and embed `<|speaker:0|>` / `<|speaker:1|>` markers inside `text`. For zero-shot multi-speaker, `references` is an array-of-arrays, one inner array per speaker.

### Single-speaker curl

```bash
curl --request POST https://api.fish.audio/v1/tts \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --header "model: s2-pro" \
  --data '{
    "text": "Hello! Welcome to Fish Audio.",
    "reference_id": "<voice-model-id>",
    "format": "mp3",
    "mp3_bitrate": 128,
    "latency": "normal"
  }' \
  --output out.mp3
```

### Multi-speaker curl (S2-Pro)

```bash
curl --request POST https://api.fish.audio/v1/tts \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --header "model: s2-pro" \
  --data '{
    "text": "<|speaker:0|>Good morning!<|speaker:1|>Good morning! How are you?",
    "reference_id": ["<speaker-0-id>", "<speaker-1-id>"],
    "format": "mp3"
  }' \
  --output dialogue.mp3
```

### Python (no SDK, streaming to file)

```python
import os, httpx

payload = {
    "text": "Hello from Fish Audio.",
    "reference_id": "<voice-model-id>",
    "format": "mp3",
    "latency": "normal",
}

headers = {
    "Authorization": f"Bearer {os.environ['FISH_API_KEY']}",
    "Content-Type": "application/json",
    "model": "s2-pro",
}

with httpx.stream("POST", "https://api.fish.audio/v1/tts",
                  headers=headers, json=payload, timeout=None) as r:
    r.raise_for_status()
    with open("out.mp3", "wb") as f:
        for chunk in r.iter_bytes():
            f.write(chunk)
```

### Python with inline references (MessagePack)

```python
import os, httpx, msgpack

with open("sample.wav", "rb") as f:
    ref_audio = f.read()

payload = {
    "text": "Clone this voice and say this line.",
    "references": [{"audio": ref_audio, "text": "Transcript of sample.wav."}],
    "format": "mp3",
}

headers = {
    "Authorization": f"Bearer {os.environ['FISH_API_KEY']}",
    "Content-Type": "application/msgpack",
    "model": "s2-pro",
}

body = msgpack.packb(payload, use_bin_type=True)
with httpx.stream("POST", "https://api.fish.audio/v1/tts",
                  headers=headers, content=body, timeout=None) as r:
    r.raise_for_status()
    with open("out.mp3", "wb") as f:
        for chunk in r.iter_bytes():
            f.write(chunk)
```

### Node.js (fetch, streaming)

```js
import { createWriteStream } from "node:fs";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

const res = await fetch("https://api.fish.audio/v1/tts", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.FISH_API_KEY}`,
    "Content-Type": "application/json",
    model: "s2-pro",
  },
  body: JSON.stringify({
    text: "Hello from Fish Audio.",
    reference_id: "<voice-model-id>",
    format: "mp3",
    latency: "normal",
  }),
});

if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
await pipeline(Readable.fromWeb(res.body), createWriteStream("out.mp3"));
```

## Speech-to-Text — `POST /v1/asr`

Required headers: `Authorization`. Content type: `multipart/form-data` or `application/msgpack`.

Form fields:

- `audio` (binary, required)
- `language` (string, optional; omit to auto-detect)
- `ignore_timestamps` (bool, default `true`; set `false` to get per-segment timestamps — adds latency on clips < 30 s)

Response (200):

```json
{
  "text": "full transcript",
  "duration": 12.34,
  "segments": [{"text": "...", "start": 0.0, "end": 1.23}]
}
```

### curl

```bash
curl --request POST https://api.fish.audio/v1/asr \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --form "audio=@input.wav" \
  --form "language=en" \
  --form "ignore_timestamps=false"
```

### Python

```python
import os, httpx

with open("input.wav", "rb") as f:
    r = httpx.post(
        "https://api.fish.audio/v1/asr",
        headers={"Authorization": f"Bearer {os.environ['FISH_API_KEY']}"},
        files={"audio": f},
        data={"language": "en", "ignore_timestamps": "false"},
        timeout=120,
    )
r.raise_for_status()
print(r.json()["text"])
```

## Voice models — `/model`

### List: `GET /model`

Query params: `page_size` (default 10), `page_number` (default 1), `title`, `tag` (string or array), `self` (bool — only your models), `author_id`, `language`, `title_language`, `sort_by` (`score` | `task_count` | `created_at`, default `score`).

Returns `{total, items: ModelEntity[]}`.

### Create: `POST /model` (multipart/form-data)

Required: `type=tts`, `title`, `train_mode=fast`, `voices` (one or more audio file uploads).

Optional: `visibility` (`public` | `unlist` | `private`, default `public`; `cover_image` is required if `public`), `description`, `cover_image`, `texts` (transcripts matching each voice; if omitted, ASR is run on the audio), `tags` (string or array), `enhance_audio_quality` (bool, default `false`).

```bash
curl --request POST https://api.fish.audio/model \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --form "type=tts" \
  --form "train_mode=fast" \
  --form "title=My Voice" \
  --form "visibility=private" \
  --form "voices=@sample1.wav" \
  --form "voices=@sample2.wav" \
  --form "texts=Transcript of sample 1." \
  --form "texts=Transcript of sample 2." \
  --form "tags=en" \
  --form "tags=narration"
```

Returns 201 with the full `ModelEntity` including `_id`, `state` (`created` | `training` | `trained` | `failed`), `visibility`, `samples`, `author`, counts, timestamps. Use `_id` as `reference_id` in `/v1/tts`.

### Get / Update / Delete

- `GET /model/{id}` → `ModelEntity`
- `PATCH /model/{id}` — JSON, form-urlencoded, multipart, or msgpack. Nullable fields: `title`, `description`, `cover_image` (binary), `visibility`, `tags`.
- `DELETE /model/{id}` → 200 on success.

```bash
curl --request PATCH https://api.fish.audio/model/<id> \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{"title": "Renamed", "visibility": "unlist"}'
```

## Wallet

- `GET /wallet/self/package` → `{user_id, type, total, balance, created_at, updated_at, finished_at}`
- `GET /wallet/self/api-credit` → `{_id, user_id, credit, created_at, updated_at, has_phone_sha256, has_free_credit}`. Pass `?check_free_credit=true` to also populate `has_free_credit` (default `false` — the field is `null` when not checked).

Replace `self` with a specific `user_id` if you have permission; otherwise always use `self`.

## WebSocket TTS — `wss://api.fish.audio/v1/tts/live`

For low-latency / streaming TTS (e.g. LLM token stream → speech). All frames are **MessagePack-encoded** binary messages.

### Connection headers

- `Authorization: Bearer <FISH_API_KEY>`
- `model: s2-pro` (or `s1`) — **required**

### Event sequence

Client → server:

1. `StartEvent` — once, first message: `{event: "start", request: <TTSRequest>}`. The `request` object is the same schema as `POST /v1/tts` above. Usually `request.text = ""` and the real text streams in `TextEvent`s.
2. `TextEvent` — one per text chunk: `{event: "text", text: "..."}`. Send as many as needed.
3. `FlushEvent` — optional: `{event: "flush"}`. Forces the server to synthesize buffered text immediately (use for turn-taking / low-latency flushes).
4. `CloseEvent` — final: `{event: "stop"}`. **Note the literal is `stop`, not `close`.**

Server → client:

- `AudioEvent`: `{event: "audio", audio: <bytes>}` — many of these, concatenate in order to reconstruct the audio stream in the format set by `request.format`.
- `FinishEvent`: `{event: "finish", reason: "stop" | "error"}` — exactly one, then the server closes the socket. Ignore unknown events for forward compatibility.

### Python example (`websockets>=14` + `msgpack`)

`additional_headers` is the parameter name in `websockets` v14+. On older
releases use `extra_headers=` or import from `websockets.legacy.client`.

```python
import asyncio, os, msgpack, websockets
from websockets.exceptions import ConnectionClosed

API_KEY = os.environ["FISH_API_KEY"]
URL = "wss://api.fish.audio/v1/tts/live"

start = {
    "event": "start",
    "request": {
        "text": "",
        "reference_id": "<voice-model-id>",
        "format": "mp3",
        "latency": "normal",
    },
}

async def run(text_stream):
    headers = {"Authorization": f"Bearer {API_KEY}", "model": "s2-pro"}
    async with websockets.connect(URL, additional_headers=headers,
                                  max_size=None) as ws:
        await ws.send(msgpack.packb(start, use_bin_type=True))

        async def sender():
            try:
                async for chunk in text_stream:
                    await ws.send(msgpack.packb(
                        {"event": "text", "text": chunk}, use_bin_type=True))
                await ws.send(msgpack.packb({"event": "stop"}, use_bin_type=True))
            except ConnectionClosed:
                pass  # server sent finish before the text stream drained

        send_task = asyncio.create_task(sender())
        try:
            with open("out.mp3", "wb") as f:
                async for raw in ws:
                    msg = msgpack.unpackb(raw, raw=False)
                    if msg["event"] == "audio":
                        f.write(msg["audio"])
                    elif msg["event"] == "finish":
                        if msg["reason"] == "error":
                            raise RuntimeError("TTS failed")
                        break
        finally:
            send_task.cancel()
            try:
                await send_task
            except (asyncio.CancelledError, ConnectionClosed):
                pass

async def words():
    for w in ["Hello", " from", " Fish", " Audio."]:
        yield w

asyncio.run(run(words()))
```

### Node.js example (`ws` + `@msgpack/msgpack`)

```js
import WebSocket from "ws";
import { encode, decode } from "@msgpack/msgpack";
import { createWriteStream } from "node:fs";

const ws = new WebSocket("wss://api.fish.audio/v1/tts/live", {
  headers: {
    Authorization: `Bearer ${process.env.FISH_API_KEY}`,
    model: "s2-pro",
  },
});

const out = createWriteStream("out.mp3");

ws.on("open", () => {
  ws.send(encode({
    event: "start",
    request: { text: "", reference_id: "<voice-model-id>", format: "mp3" },
  }));
  ws.send(encode({ event: "text", text: "Hello from Fish Audio." }));
  ws.send(encode({ event: "stop" }));
});

ws.on("message", (buf) => {
  const msg = decode(buf);
  if (msg.event === "audio") out.write(Buffer.from(msg.audio));
  else if (msg.event === "finish") {
    out.end();
    ws.close();
    if (msg.reason === "error") throw new Error("TTS failed");
  }
});
```

## Emotion / expression control

The S1 model uses `(parenthesis)` tags inside `text`, e.g. `(happy) What a day!`. S2-Pro uses free-form `[bracket]` natural-language tags, e.g. `[slightly sarcastic, rising tone]`. Either works through `text` — no separate parameter. Full list: `https://docs.fish.audio/api-reference/emotion-reference.md`.

## Encoding and content-type rules

- Use `application/json` for normal TTS requests — it's the simplest and works for `reference_id` flows.
- Use `application/msgpack` when you need to send raw audio bytes inline (inline `references`, or the WebSocket protocol).
- Use `multipart/form-data` for `/v1/asr` and `POST /model` because they upload files.
- All WebSocket frames are MessagePack binary, regardless of inner payload.

## Error handling checklist

- 401 → missing / bad `Authorization` header.
- 402 → out of credit. Check `/wallet/self/api-credit`.
- 404 → bad `model/{id}` (voice model doesn't exist or isn't visible to you).
- 422 → validation. The response is an array; each item's `loc` points at the offending field. Most common causes:
  - `model` header missing on `/v1/tts` or WebSocket.
  - `reference_id` is an array but model is `s1` (multi-speaker requires `s2-pro`).
  - `references` sent with `Content-Type: application/json` (must be msgpack).
  - Numeric param out of range (`temperature`, `top_p`, `chunk_length`, `min_chunk_length`, `prosody.speed`, `early_stop_threshold`).
  - `mp3_bitrate` / `opus_bitrate` set without matching `format`.
- WebSocket: a `finish` event with `reason: "error"` means the server failed mid-stream — surface the message and reconnect rather than retrying on the same socket.

## Decision shortcuts

- User just wants audio from text → `POST /v1/tts` with JSON + `reference_id`.
- User has a raw voice clip and wants instant cloning → `POST /v1/tts` with MessagePack + `references`.
- User wants dialogue between multiple speakers → `POST /v1/tts` on `s2-pro` with `reference_id` array and `<|speaker:N|>` tags.
- User is streaming tokens from an LLM and wants speech to play as it arrives → WebSocket `/v1/tts/live`.
- User wants a persistent custom voice they can reuse → `POST /model` first, then reuse the returned `_id` as `reference_id`.
- User wants a transcript → `POST /v1/asr`.
