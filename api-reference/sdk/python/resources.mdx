<a id="fishaudio.resources.voices"></a>

# fishaudio.resources.voices

Voice management namespace client.

<a id="fishaudio.resources.voices.VoicesClient"></a>

## VoicesClient Objects

```python
class VoicesClient()
```

Synchronous voice management operations.

<a id="fishaudio.resources.voices.VoicesClient.list"></a>

#### list

```python
def list(
    *,
    page_size: int = 10,
    page_number: int = 1,
    title: Optional[str] = OMIT,
    tags: Optional[Union[List[str], str]] = OMIT,
    self_only: bool = False,
    author_id: Optional[str] = OMIT,
    language: Optional[Union[List[str], str]] = OMIT,
    title_language: Optional[Union[List[str], str]] = OMIT,
    sort_by: str = "task_count",
    request_options: Optional[RequestOptions] = None
) -> PaginatedResponse[Voice]
```

List available voices/models.

**Arguments**:

- `page_size` - Number of results per page
- `page_number` - Page number (1-indexed)
- `title` - Filter by title
- `tags` - Filter by tags (single tag or list)
- `self_only` - Only return user's own voices
- `author_id` - Filter by author ID
- `language` - Filter by language(s)
- `title_language` - Filter by title language(s)
- `sort_by` - Sort field ("task_count" or "created_at")
- `request_options` - Request-level overrides
  

**Returns**:

  Paginated response with total count and voice items
  

**Example**:

    ```python
    client = FishAudio(api_key="...")

    # List all voices
    voices = client.voices.list(page_size=20)
    print(f"Total: {voices.total}")
    for voice in voices.items:
        print(f"{voice.title}: {voice.id}")

    # Filter by tags
    tagged = client.voices.list(tags=["male", "english"])
    ```

<a id="fishaudio.resources.voices.VoicesClient.get"></a>

#### get

```python
def get(voice_id: str,
        *,
        request_options: Optional[RequestOptions] = None) -> Voice
```

Get voice by ID.

**Arguments**:

- `voice_id` - Voice model ID
- `request_options` - Request-level overrides
  

**Returns**:

  Voice model details
  

**Example**:

    ```python
    client = FishAudio(api_key="...")
    voice = client.voices.get("voice_id_here")
    print(voice.title, voice.description)
    ```

<a id="fishaudio.resources.voices.VoicesClient.create"></a>

#### create

```python
def create(*,
           title: str,
           voices: List[bytes],
           description: Optional[str] = OMIT,
           texts: Optional[List[str]] = OMIT,
           tags: Optional[List[str]] = OMIT,
           cover_image: Optional[bytes] = OMIT,
           visibility: Visibility = "private",
           train_mode: str = "fast",
           enhance_audio_quality: bool = True,
           request_options: Optional[RequestOptions] = None) -> Voice
```

Create/clone a new voice.

**Arguments**:

- `title` - Voice model name
- `voices` - List of audio file bytes for training
- `description` - Voice description
- `texts` - Transcripts for voice samples
- `tags` - Tags for categorization
- `cover_image` - Cover image bytes
- `visibility` - Visibility setting (public, unlist, private)
- `train_mode` - Training mode (currently only "fast" supported)
- `enhance_audio_quality` - Whether to enhance audio quality
- `request_options` - Request-level overrides
  

**Returns**:

  Created voice model
  

**Example**:

    ```python
    client = FishAudio(api_key="...")

    with open("voice1.wav", "rb") as f1, open("voice2.wav", "rb") as f2:
        voice = client.voices.create(
            title="My Voice",
            voices=[f1.read(), f2.read()],
            description="Custom voice clone",
            tags=["custom", "english"]
        )
    print(f"Created: {voice.id}")
    ```

<a id="fishaudio.resources.voices.VoicesClient.update"></a>

#### update

```python
def update(voice_id: str,
           *,
           title: Optional[str] = OMIT,
           description: Optional[str] = OMIT,
           cover_image: Optional[bytes] = OMIT,
           visibility: Optional[Visibility] = OMIT,
           tags: Optional[List[str]] = OMIT,
           request_options: Optional[RequestOptions] = None) -> None
```

Update voice metadata.

**Arguments**:

- `voice_id` - Voice model ID
- `title` - New title
- `description` - New description
- `cover_image` - New cover image bytes
- `visibility` - New visibility setting
- `tags` - New tags
- `request_options` - Request-level overrides
  

**Example**:

    ```python
    client = FishAudio(api_key="...")
    client.voices.update(
        "voice_id_here",
        title="Updated Title",
        visibility="public"
    )
    ```

<a id="fishaudio.resources.voices.VoicesClient.delete"></a>

#### delete

```python
def delete(voice_id: str,
           *,
           request_options: Optional[RequestOptions] = None) -> None
```

Delete a voice.

**Arguments**:

- `voice_id` - Voice model ID
- `request_options` - Request-level overrides
  

**Example**:

    ```python
    client = FishAudio(api_key="...")
    client.voices.delete("voice_id_here")
    ```

<a id="fishaudio.resources.voices.AsyncVoicesClient"></a>

## AsyncVoicesClient Objects

```python
class AsyncVoicesClient()
```

Asynchronous voice management operations.

<a id="fishaudio.resources.voices.AsyncVoicesClient.list"></a>

#### list

```python
async def list(
    *,
    page_size: int = 10,
    page_number: int = 1,
    title: Optional[str] = OMIT,
    tags: Optional[Union[List[str], str]] = OMIT,
    self_only: bool = False,
    author_id: Optional[str] = OMIT,
    language: Optional[Union[List[str], str]] = OMIT,
    title_language: Optional[Union[List[str], str]] = OMIT,
    sort_by: str = "task_count",
    request_options: Optional[RequestOptions] = None
) -> PaginatedResponse[Voice]
```

List available voices/models (async). See sync version for details.

<a id="fishaudio.resources.voices.AsyncVoicesClient.get"></a>

#### get

```python
async def get(voice_id: str,
              *,
              request_options: Optional[RequestOptions] = None) -> Voice
```

Get voice by ID (async). See sync version for details.

<a id="fishaudio.resources.voices.AsyncVoicesClient.create"></a>

#### create

```python
async def create(*,
                 title: str,
                 voices: List[bytes],
                 description: Optional[str] = OMIT,
                 texts: Optional[List[str]] = OMIT,
                 tags: Optional[List[str]] = OMIT,
                 cover_image: Optional[bytes] = OMIT,
                 visibility: Visibility = "private",
                 train_mode: str = "fast",
                 enhance_audio_quality: bool = True,
                 request_options: Optional[RequestOptions] = None) -> Voice
```

Create/clone a new voice (async). See sync version for details.

<a id="fishaudio.resources.voices.AsyncVoicesClient.update"></a>

#### update

```python
async def update(voice_id: str,
                 *,
                 title: Optional[str] = OMIT,
                 description: Optional[str] = OMIT,
                 cover_image: Optional[bytes] = OMIT,
                 visibility: Optional[Visibility] = OMIT,
                 tags: Optional[List[str]] = OMIT,
                 request_options: Optional[RequestOptions] = None) -> None
```

Update voice metadata (async). See sync version for details.

<a id="fishaudio.resources.voices.AsyncVoicesClient.delete"></a>

#### delete

```python
async def delete(voice_id: str,
                 *,
                 request_options: Optional[RequestOptions] = None) -> None
```

Delete a voice (async). See sync version for details.

<a id="fishaudio.resources.realtime"></a>

# fishaudio.resources.realtime

Real-time WebSocket streaming helpers.

<a id="fishaudio.resources.realtime.iter_websocket_audio"></a>

#### iter\_websocket\_audio

```python
def iter_websocket_audio(ws) -> Iterator[bytes]
```

Process WebSocket audio messages (sync).

Receives messages from WebSocket, yields audio chunks, handles errors.
Unknown events are ignored and iteration continues.

**Arguments**:

- `ws` - WebSocket connection from httpx_ws.connect_ws
  

**Yields**:

  Audio bytes
  

**Raises**:

- `WebSocketError` - On disconnect or error finish event

<a id="fishaudio.resources.realtime.aiter_websocket_audio"></a>

#### aiter\_websocket\_audio

```python
async def aiter_websocket_audio(ws) -> AsyncIterator[bytes]
```

Process WebSocket audio messages (async).

Receives messages from WebSocket, yields audio chunks, handles errors.
Unknown events are ignored and iteration continues.

**Arguments**:

- `ws` - WebSocket connection from httpx_ws.aconnect_ws
  

**Yields**:

  Audio bytes
  

**Raises**:

- `WebSocketError` - On disconnect or error finish event

<a id="fishaudio.resources.tts"></a>

# fishaudio.resources.tts

TTS (Text-to-Speech) namespace client.

<a id="fishaudio.resources.tts.TTSClient"></a>

## TTSClient Objects

```python
class TTSClient()
```

Synchronous TTS operations.

<a id="fishaudio.resources.tts.TTSClient.convert"></a>

#### convert

```python
def convert(
        *,
        text: str,
        config: TTSConfig = TTSConfig(),
        model: Model = "s1",
        request_options: Optional[RequestOptions] = None) -> Iterator[bytes]
```

Convert text to speech.

**Arguments**:

- `text` - Text to synthesize
- `config` - TTS configuration (audio settings, voice, model parameters)
- `model` - TTS model to use
- `request_options` - Request-level overrides
  

**Returns**:

  Iterator of audio bytes
  

**Example**:

    ```python
    from fishaudio import FishAudio, TTSConfig

    client = FishAudio(api_key="...")

    # Simple usage with defaults
    audio = client.tts.convert(text="Hello world")

    # Custom configuration
    config = TTSConfig(format="wav", mp3_bitrate=192)
    audio = client.tts.convert(text="Hello world", config=config)

    with open("output.mp3", "wb") as f:
        for chunk in audio:
            f.write(chunk)
    ```

<a id="fishaudio.resources.tts.TTSClient.stream_websocket"></a>

#### stream\_websocket

```python
def stream_websocket(text_stream: Iterable[Union[str, TextEvent, FlushEvent]],
                     *,
                     config: TTSConfig = TTSConfig(),
                     model: Model = "s1",
                     max_workers: int = 10) -> Iterator[bytes]
```

Stream text and receive audio in real-time via WebSocket.

Perfect for conversational AI, live captioning, and streaming applications.

**Arguments**:

- `text_stream` - Iterator of text chunks to stream
- `config` - TTS configuration (audio settings, voice, model parameters)
- `model` - TTS model to use
- `max_workers` - ThreadPoolExecutor workers for concurrent sender
  

**Returns**:

  Iterator of audio bytes
  

**Example**:

    ```python
    from fishaudio import FishAudio, TTSConfig

    client = FishAudio(api_key="...")

    def text_generator():
        yield "Hello, "
        yield "this is "
        yield "streaming text!"

    # Simple usage with defaults
    with open("output.mp3", "wb") as f:
        for audio_chunk in client.tts.stream_websocket(text_generator()):
            f.write(audio_chunk)

    # Custom configuration
    config = TTSConfig(format="wav", latency="normal")
    with open("output.wav", "wb") as f:
        for audio_chunk in client.tts.stream_websocket(text_generator(), config=config):
            f.write(audio_chunk)
    ```

<a id="fishaudio.resources.tts.AsyncTTSClient"></a>

## AsyncTTSClient Objects

```python
class AsyncTTSClient()
```

Asynchronous TTS operations.

<a id="fishaudio.resources.tts.AsyncTTSClient.convert"></a>

#### convert

```python
async def convert(*,
                  text: str,
                  config: TTSConfig = TTSConfig(),
                  model: Model = "s1",
                  request_options: Optional[RequestOptions] = None)
```

Convert text to speech (async).

**Arguments**:

- `text` - Text to synthesize
- `config` - TTS configuration (audio settings, voice, model parameters)
- `model` - TTS model to use
- `request_options` - Request-level overrides
  

**Returns**:

  Async iterator of audio bytes
  

**Example**:

    ```python
    from fishaudio import AsyncFishAudio, TTSConfig

    client = AsyncFishAudio(api_key="...")

    # Simple usage with defaults
    audio = await client.tts.convert(text="Hello world")

    # Custom configuration
    config = TTSConfig(format="wav", mp3_bitrate=192)
    audio = await client.tts.convert(text="Hello world", config=config)

    async with aiofiles.open("output.mp3", "wb") as f:
        async for chunk in audio:
            await f.write(chunk)
    ```

<a id="fishaudio.resources.tts.AsyncTTSClient.stream_websocket"></a>

#### stream\_websocket

```python
async def stream_websocket(text_stream: AsyncIterable[Union[str, TextEvent,
                                                            FlushEvent]],
                           *,
                           config: TTSConfig = TTSConfig(),
                           model: Model = "s1")
```

Stream text and receive audio in real-time via WebSocket (async).

Perfect for conversational AI, live captioning, and streaming applications.

**Arguments**:

- `text_stream` - Async iterator of text chunks to stream
- `config` - TTS configuration (audio settings, voice, model parameters)
- `model` - TTS model to use
  

**Returns**:

  Async iterator of audio bytes
  

**Example**:

    ```python
    from fishaudio import AsyncFishAudio, TTSConfig

    client = AsyncFishAudio(api_key="...")

    async def text_generator():
        yield "Hello, "
        yield "this is "
        yield "async streaming!"

    # Simple usage with defaults
    async with aiofiles.open("output.mp3", "wb") as f:
        async for audio_chunk in client.tts.stream_websocket(text_generator()):
            await f.write(audio_chunk)

    # Custom configuration
    config = TTSConfig(format="wav", latency="normal")
    async with aiofiles.open("output.wav", "wb") as f:
        async for audio_chunk in client.tts.stream_websocket(text_generator(), config=config):
            await f.write(audio_chunk)
    ```

<a id="fishaudio.resources.account"></a>

# fishaudio.resources.account

Account namespace client for billing and credits.

<a id="fishaudio.resources.account.AccountClient"></a>

## AccountClient Objects

```python
class AccountClient()
```

Synchronous account operations.

<a id="fishaudio.resources.account.AccountClient.get_credits"></a>

#### get\_credits

```python
def get_credits(*,
                request_options: Optional[RequestOptions] = None) -> Credits
```

Get API credit balance.

**Arguments**:

- `request_options` - Request-level overrides
  

**Returns**:

  Credits information
  

**Example**:

    ```python
    client = FishAudio(api_key="...")
    credits = client.account.get_credits()
    print(f"Available credits: {float(credits.credit)}")
    ```

<a id="fishaudio.resources.account.AccountClient.get_package"></a>

#### get\_package

```python
def get_package(*,
                request_options: Optional[RequestOptions] = None) -> Package
```

Get package information.

**Arguments**:

- `request_options` - Request-level overrides
  

**Returns**:

  Package information
  

**Example**:

    ```python
    client = FishAudio(api_key="...")
    package = client.account.get_package()
    print(f"Balance: {package.balance}/{package.total}")
    ```

<a id="fishaudio.resources.account.AsyncAccountClient"></a>

## AsyncAccountClient Objects

```python
class AsyncAccountClient()
```

Asynchronous account operations.

<a id="fishaudio.resources.account.AsyncAccountClient.get_credits"></a>

#### get\_credits

```python
async def get_credits(*,
                      request_options: Optional[RequestOptions] = None
                      ) -> Credits
```

Get API credit balance (async).

**Arguments**:

- `request_options` - Request-level overrides
  

**Returns**:

  Credits information
  

**Example**:

    ```python
    client = AsyncFishAudio(api_key="...")
    credits = await client.account.get_credits()
    print(f"Available credits: {float(credits.credit)}")
    ```

<a id="fishaudio.resources.account.AsyncAccountClient.get_package"></a>

#### get\_package

```python
async def get_package(*,
                      request_options: Optional[RequestOptions] = None
                      ) -> Package
```

Get package information (async).

**Arguments**:

- `request_options` - Request-level overrides
  

**Returns**:

  Package information
  

**Example**:

    ```python
    client = AsyncFishAudio(api_key="...")
    package = await client.account.get_package()
    print(f"Balance: {package.balance}/{package.total}")
    ```

<a id="fishaudio.resources.asr"></a>

# fishaudio.resources.asr

ASR (Automatic Speech Recognition) namespace client.

<a id="fishaudio.resources.asr.ASRClient"></a>

## ASRClient Objects

```python
class ASRClient()
```

Synchronous ASR operations.

<a id="fishaudio.resources.asr.ASRClient.transcribe"></a>

#### transcribe

```python
def transcribe(
        *,
        audio: bytes,
        language: Optional[str] = OMIT,
        include_timestamps: bool = True,
        request_options: Optional[RequestOptions] = None) -> ASRResponse
```

Transcribe audio to text.

**Arguments**:

- `audio` - Audio file bytes
- `language` - Language code (e.g., "en", "zh"). Auto-detected if not provided.
- `include_timestamps` - Whether to include timestamp information for segments
- `request_options` - Request-level overrides
  

**Returns**:

  ASRResponse with transcription text, duration, and segments
  

**Example**:

    ```python
    client = FishAudio(api_key="...")

    with open("audio.mp3", "rb") as f:
        audio_bytes = f.read()

    result = client.asr.transcribe(audio=audio_bytes, language="en")
    print(result.text)
    for segment in result.segments:
        print(f"{segment.start}-{segment.end}: {segment.text}")
    ```

<a id="fishaudio.resources.asr.AsyncASRClient"></a>

## AsyncASRClient Objects

```python
class AsyncASRClient()
```

Asynchronous ASR operations.

<a id="fishaudio.resources.asr.AsyncASRClient.transcribe"></a>

#### transcribe

```python
async def transcribe(
        *,
        audio: bytes,
        language: Optional[str] = OMIT,
        include_timestamps: bool = True,
        request_options: Optional[RequestOptions] = None) -> ASRResponse
```

Transcribe audio to text (async).

**Arguments**:

- `audio` - Audio file bytes
- `language` - Language code (e.g., "en", "zh"). Auto-detected if not provided.
- `include_timestamps` - Whether to include timestamp information for segments
- `request_options` - Request-level overrides
  

**Returns**:

  ASRResponse with transcription text, duration, and segments
  

**Example**:

    ```python
    client = AsyncFishAudio(api_key="...")

    async with aiofiles.open("audio.mp3", "rb") as f:
        audio_bytes = await f.read()

    result = await client.asr.transcribe(audio=audio_bytes, language="en")
    print(result.text)
    for segment in result.segments:
        print(f"{segment.start}-{segment.end}: {segment.text}")
    ```

