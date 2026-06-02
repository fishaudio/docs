# Realtime WebSocket TTS

Stream text in and get audio out as it's generated — ideal for piping an LLM's token stream to speech.

## Python — `client.tts.stream_websocket`

The first argument is an **iterable of text chunks** (plain `str`, or `TextEvent` / `FlushEvent` for fine control). The sync method returns an `Iterator[bytes]`; the async method must be awaited and returns an `AsyncIterator[bytes]`.

### Sync

```python
from fishaudio import FishAudio
from fishaudio.utils import play

client = FishAudio()

def text_chunks():
    yield "Hello, "
    yield "this is "
    yield "streaming speech."

# Consume audio chunks as they arrive...
for chunk in client.tts.stream_websocket(text_chunks(), reference_id="<voice-id>", model="s2-pro"):
    sink.write(chunk)

# ...or just play the whole stream locally:
play(client.tts.stream_websocket(text_chunks()))
```

### Async

```python
import asyncio
from fishaudio import AsyncFishAudio

async def text_chunks():
    yield "Hello, "
    yield "streaming speech."

async def main():
    async with AsyncFishAudio() as client:
        audio_stream = await client.tts.stream_websocket(text_chunks())
        with open("out.mp3", "wb") as f:
            async for chunk in audio_stream:
                f.write(chunk)

asyncio.run(main())
```

`stream_websocket` keyword params mirror `convert`: `reference_id`, `references`, `format`, `latency`, `speed`, `config`, `model` (default `"s2-pro"`), plus `ws_options` (a `WebSocketOptions` for keepalive/message-size tuning). The sync version also accepts `max_workers` (default `10`) for its background sender thread; the async version does not.

For manual control, yield events instead of strings:

```python
from fishaudio.types import TextEvent, FlushEvent

def events():
    yield TextEvent(text="First sentence.")
    yield FlushEvent()                 # force synthesis of buffered text now
    yield TextEvent(text="Second sentence.")
```

The SDK sends the start/stop frames for you — you only supply text/flush.

## JavaScript — `client.textToSpeech.convertRealtime`

Returns a `RealtimeConnection`; subscribe to events with `RealtimeEvents`. Set `request.text` to `""` and stream the real text via the second argument.

```ts
import { FishAudioClient, RealtimeEvents } from "fish-audio";
import { writeFile } from "node:fs/promises";

const client = new FishAudioClient();

async function* textStream() {
  for (const chunk of [
    "Hello from Fish Audio! ",
    "Streaming over WebSocket.",
  ]) {
    yield chunk;
  }
}

const connection = await client.textToSpeech.convertRealtime(
  { text: "", reference_id: "<voice-id>" },
  textStream()
  // optional positional backend, e.g. "s2-pro"
);

const chunks: Buffer[] = [];
connection.on(RealtimeEvents.OPEN, () => console.log("open"));
connection.on(RealtimeEvents.AUDIO_CHUNK, audio => {
  if (audio instanceof Uint8Array || Buffer.isBuffer(audio))
    chunks.push(Buffer.from(audio));
});
connection.on(RealtimeEvents.ERROR, err => console.error(err));
connection.on(RealtimeEvents.CLOSE, async () => {
  await writeFile("out.mp3", Buffer.concat(chunks));
});
```

`RealtimeEvents`: `OPEN`, `AUDIO_CHUNK`, `ERROR`, `CLOSE`. `textStream` may be an `Iterable<string>` or `AsyncIterable<string>`.

## Protocol notes

- The close frame's event literal is **`"stop"`**, not `"close"` (handled for you by both SDKs; relevant only if you drop to raw frames — use the `fish-audio-api` skill for that).
- A realtime run that fails mid-stream surfaces as `WebSocketError` (Python) / an `ERROR` event (JS). Reconnect rather than retrying on the same socket.
