# Errors, Retries & Timeouts

The two SDKs have **different** exception models. The tables below reflect what the SDK source actually raises — not every exported class is thrown.

## Python exceptions

Hierarchy (all subclasses of `FishAudioError`):

| Exception             | When                                           | Attributes                        |
| --------------------- | ---------------------------------------------- | --------------------------------- |
| `APIError`            | base for HTTP errors                           | `.status`, `.message`, `.body`    |
| `AuthenticationError` | 401 — bad/missing key                          | (APIError)                        |
| `PermissionError`     | 403                                            | (APIError)                        |
| `NotFoundError`       | 404 — voice id not found                       | (APIError)                        |
| `RateLimitError`      | 429                                            | (APIError)                        |
| `ServerError`         | 5xx                                            | (APIError)                        |
| `WebSocketError`      | realtime stream failed                         | —                                 |
| `DependencyError`     | missing system tool (e.g. ffmpeg for `play()`) | `.dependency`, `.install_command` |

```python
from fishaudio import FishAudio
from fishaudio.exceptions import (
    AuthenticationError,
    RateLimitError,
    NotFoundError,
    APIError,
    FishAudioError,
)

client = FishAudio()
try:
    audio = client.tts.convert(text="Hello!", reference_id="maybe-missing")
except AuthenticationError:
    ...  # bad API key
except RateLimitError:
    ...  # slow down / out of quota
except NotFoundError:
    ...  # reference_id doesn't exist
except APIError as e:
    print(e.status, e.message)  # any other HTTP error
except FishAudioError as e:
    print("SDK error:", e)      # non-HTTP (e.g. WebSocketError, DependencyError)
```

> **Do not catch `ValidationError`.** The class exists and is exported, but the SDK **never raises it**. Invalid input comes back as an `APIError` (HTTP 422). Catch `APIError` (and read `.status == 422`) instead.

### Retries & timeouts (Python)

- **No automatic retries.** The Python client makes a single request and raises on failure. Implement your own retry loop if you need one (e.g. back off on `RateLimitError`).
- **Timeout** is set on the client: `FishAudio(timeout=240.0)` (seconds, default 240).
- `RequestOptions(max_retries=...)` exists but is currently a **no-op** — don't rely on it. `RequestOptions(timeout=..., additional_headers=...)` does work per request:

```python
from fishaudio.core.request_options import RequestOptions

audio = client.tts.convert(
    text="Hello!",
    request_options=RequestOptions(timeout=30.0, additional_headers={"X-Trace": "abc"}),
)
```

## JavaScript exceptions

```ts
import {
  FishAudioClient,
  FishAudioError,
  FishAudioTimeoutError,
} from "fish-audio";
import { UnprocessableEntityError } from "fish-audio"; // re-exported from the package root

const client = new FishAudioClient();
try {
  const audio = await client.textToSpeech.convert({
    text: "Hello!",
    reference_id: "maybe-missing",
  });
} catch (err) {
  if (err instanceof UnprocessableEntityError) {
    console.error("422 validation:", err.body?.detail); // [{ loc, msg, type }]
  } else if (err instanceof FishAudioTimeoutError) {
    console.error("request timed out");
  } else if (err instanceof FishAudioError) {
    console.error(err.statusCode, err.body); // branch on err.statusCode (401/403/404/...)
  } else {
    throw err;
  }
}
```

What the JS client actually throws:

| Error                                                 | When                                                                                         |
| ----------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `UnprocessableEntityError` (extends `FishAudioError`) | 422 — the **only** typed HTTP subclass thrown; `.body` is `{ detail: [{ loc, msg, type }] }` |
| `FishAudioError`                                      | every other non-2xx response; read `.statusCode`, `.body`, `.rawResponse`                    |
| `FishAudioTimeoutError`                               | request exceeded the timeout                                                                 |

> The package also exports `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, and `TooEarlyError`, but the current client throws a generic `FishAudioError` for those statuses. **Branch on `err.statusCode`** rather than relying on `instanceof NotFoundError`.

### Retries & timeouts (JavaScript)

- **Automatic retries are built in.** The client retries `408`, `429`, and `>= 500` with exponential backoff (≈1 s base, 60 s cap) plus jitter, honoring `Retry-After`. You don't need to hand-roll a 429 loop.
- Tune per call via `requestOptions` (the trailing argument on every method):

```ts
const audio = await client.textToSpeech.convert({ text: "Hello!" }, "s2-pro", {
  maxRetries: 5,
  timeoutInSeconds: 30,
  abortSignal: controller.signal,
});
```

- Default request timeout is **240 s** (`240000 ms`); override with `requestOptions.timeoutInSeconds`.
- `requestOptions` also accepts per-request `apiKey`, `headers`, and `queryParams`.

## Inspecting raw responses (JS)

Every method returns an awaitable that also exposes the raw response:

```ts
const { data, rawResponse } = await client.textToSpeech
  .convert({ text: "Hi" })
  .withRawResponse();
console.log(rawResponse.headers);
```
