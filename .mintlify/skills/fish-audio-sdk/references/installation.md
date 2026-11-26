# Installation & Authentication

## Python (`fishaudio`)

```bash
pip install fish-audio-sdk          # imported as `fishaudio`
pip install "fish-audio-sdk[utils]" # adds local audio playback helpers (play)
```

- Requires Python 3.9+.
- Import name is **`fishaudio`** even though the PyPI/dist name is `fish-audio-sdk`.

## JavaScript / TypeScript (`fish-audio`)

```bash
npm install fish-audio
# or: pnpm add fish-audio  / yarn add fish-audio
```

- Requires Node.js 20+ (uses the global `fetch`, `File` and Web Streams).
- Ships ES module and CommonJS builds: `import { FishAudioClient } from "fish-audio"` and `const { FishAudioClient } = require("fish-audio")` both work (`require` needs `fish-audio` 0.2.0+).
- The WebSocket methods (`textToSpeech.convertRealtime`, `speechToText.convertRealtime`) are Node.js only.

## Authentication

Get an API key at `https://fish.audio/app/api-keys`. Both SDKs read `FISH_API_KEY` from the environment automatically.

```bash
export FISH_API_KEY=your_api_key_here
```

```python
from fishaudio import FishAudio

client = FishAudio()                       # reads FISH_API_KEY
client = FishAudio(api_key="your_api_key") # or pass explicitly
```

```ts
import { FishAudioClient } from "fish-audio";

const client = new FishAudioClient(); // reads FISH_API_KEY
const client2 = new FishAudioClient({ apiKey: process.env.MY_KEY }); // or pass explicitly
```

Never hardcode a key in source. If neither the argument nor `FISH_API_KEY` is set, the Python client raises `ValueError` at construction time.

### Other client options

| Option             | Python                              | JavaScript                                 |
| ------------------ | ----------------------------------- | ------------------------------------------ |
| API key            | `api_key=`                          | `apiKey:`                                  |
| Base URL           | `base_url="https://api.fish.audio"` | `baseUrl:` / `environment:`                |
| Request timeout    | `timeout=240.0` (seconds)           | per-call `requestOptions.timeoutInSeconds` |
| Custom HTTP client | `httpx_client=`                     | (not exposed)                              |

> Python caveat: if you pass your own `httpx_client`, your `base_url` and `timeout` are **not** applied to it. Pre-configure those on the client you inject. The SDK still adds the `Authorization` header to every request.

There is no client-level `max_retries` or `default_headers` option in Python. Per-request headers go through `request_options`. See [errors.md](errors.md) for retry/timeout behavior.

## Local audio playback

The `play()` helper is for local/desktop use and shells out to a system tool:

- **Python:** needs `ffmpeg` (or pass `use_ffmpeg=False` to try `mpv`). Install the `[utils]` extra. Missing tools raise `DependencyError` with the install command.
- **JavaScript:** spawns `ffplay` (from ffmpeg) and is **Node-only**.

Install ffmpeg:

```bash
# macOS
brew install ffmpeg
# Debian/Ubuntu
sudo apt-get install ffmpeg
```

In a server or browser context, don't use `play()`. Use `save()` (Python) or write/stream the bytes yourself.

## Verify a key works

```python
from fishaudio import FishAudio

client = FishAudio()
print(client.account.get_credits())  # raises AuthenticationError (401) if the key is bad
```

```ts
import { FishAudioClient } from "fish-audio";

const client = new FishAudioClient();
console.log(await client.user.get_api_credit());
```
