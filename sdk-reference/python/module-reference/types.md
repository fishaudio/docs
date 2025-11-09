<a id="fishaudio.types.voices"></a>

# fishaudio.types.voices

Voice and model management types.

<a id="fishaudio.types.voices.Sample"></a>

## Sample Objects

```python
class Sample(BaseModel)
```

A sample audio for a voice model.

<a id="fishaudio.types.voices.Author"></a>

## Author Objects

```python
class Author(BaseModel)
```

Voice model author information.

<a id="fishaudio.types.voices.Voice"></a>

## Voice Objects

```python
class Voice(BaseModel)
```

A voice model

Represents a TTS voice that can be used for synthesis.

<a id="fishaudio.types.tts"></a>

# fishaudio.types.tts

TTS-related types.

<a id="fishaudio.types.tts.ReferenceAudio"></a>

## ReferenceAudio Objects

```python
class ReferenceAudio(BaseModel)
```

Reference audio for voice cloning/style.

<a id="fishaudio.types.tts.Prosody"></a>

## Prosody Objects

```python
class Prosody(BaseModel)
```

Speech prosody settings (speed and volume).

<a id="fishaudio.types.tts.TTSConfig"></a>

## TTSConfig Objects

```python
class TTSConfig(BaseModel)
```

TTS generation configuration.

Reusable configuration for text-to-speech requests. Create once, use multiple times.
All parameters have sensible defaults.

<a id="fishaudio.types.tts.TTSRequest"></a>

## TTSRequest Objects

```python
class TTSRequest(BaseModel)
```

Request parameters for text-to-speech generation.

This model is used internally for WebSocket streaming.
For the HTTP API, parameters are passed directly to methods.

<a id="fishaudio.types.tts.StartEvent"></a>

## StartEvent Objects

```python
class StartEvent(BaseModel)
```

WebSocket start event.

<a id="fishaudio.types.tts.TextEvent"></a>

## TextEvent Objects

```python
class TextEvent(BaseModel)
```

WebSocket text chunk event.

<a id="fishaudio.types.tts.FlushEvent"></a>

## FlushEvent Objects

```python
class FlushEvent(BaseModel)
```

WebSocket flush event - forces buffer to generate audio immediately.

<a id="fishaudio.types.tts.CloseEvent"></a>

## CloseEvent Objects

```python
class CloseEvent(BaseModel)
```

WebSocket close event.

<a id="fishaudio.types.account"></a>

# fishaudio.types.account

Account-related types (credits, packages, etc.).

<a id="fishaudio.types.account.Credits"></a>

## Credits Objects

```python
class Credits(BaseModel)
```

User's API credit balance.

<a id="fishaudio.types.account.Package"></a>

## Package Objects

```python
class Package(BaseModel)
```

User's prepaid package information.

<a id="fishaudio.types.asr"></a>

# fishaudio.types.asr

ASR (Automatic Speech Recognition) related types.

<a id="fishaudio.types.asr.ASRSegment"></a>

## ASRSegment Objects

```python
class ASRSegment(BaseModel)
```

A timestamped segment of transcribed text.

<a id="fishaudio.types.asr.ASRResponse"></a>

## ASRResponse Objects

```python
class ASRResponse(BaseModel)
```

Response from speech-to-text transcription.

<a id="fishaudio.types.asr.ASRResponse.duration"></a>

#### duration

Duration in milliseconds

<a id="fishaudio.types.shared"></a>

# fishaudio.types.shared

Shared types used across the SDK.

<a id="fishaudio.types.shared.PaginatedResponse"></a>

## PaginatedResponse Objects

```python
class PaginatedResponse(BaseModel, Generic[T])
```

Generic paginated response.

