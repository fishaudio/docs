"""Per-recipe test specs.

Each case names a code block (by index, in document order) from a cookbook .mdx, the
placeholder substitutions that make it runnable, and what to assert. Adding coverage for
a new cookbook is ~4 lines here — no test code to touch.
"""
from harness import PUBLIC_VOICE

COOKBOOK = "developer-guide/sdk-guide/cookbook"

SPECS = [
    {
        "slug": "streaming-to-file",
        "path": f"{COOKBOOK}/streaming-to-file.mdx",
        "cases": [
            {"name": "sync stream to file", "block": 0, "file": ("output.mp3", "mp3")},
            {"name": "async stream to file", "block": 1, "file": ("output.mp3", "mp3")},
            {"name": "collect to bytes", "block": 2, "var": ("audio", "mp3")},
        ],
    },
    {
        "slug": "instant-voice-cloning",
        "path": f"{COOKBOOK}/instant-voice-cloning.mdx",
        "cases": [
            {"name": "sync ReferenceAudio clone", "block": 0, "file": ("cloned.mp3", "mp3")},
            {"name": "async ReferenceAudio clone", "block": 1, "file": ("cloned.mp3", "mp3")},
            {"name": "reuse via create + reference_id", "block": 2, "var": ("audio", "mp3")},
        ],
    },
    {
        "slug": "realtime-llm-to-speech",
        "path": f"{COOKBOOK}/realtime-llm-to-speech.mdx",
        "cases": [
            {
                "name": "sync websocket + play",
                "block": 0,
                "subs": {"<voice-id>": PUBLIC_VOICE, "play(audio_stream)": "consume(audio_stream)"},
                "consumed": True,
            },
            {"name": "async websocket to file", "block": 1, "file": ("out.mp3", "mp3")},
            {
                "name": "FlushEvent boundary",
                "block": 2,
                "postamble": "consume(client.tts.stream_websocket(turns()))",
                "consumed": True,
            },
        ],
    },
    # ---- recipes authored by the cookbook workflow (one live-tested primary block each) ----
    {
        "slug": "transcribe-to-captions",
        "path": f"{COOKBOOK}/transcribe-to-captions.mdx",
        "cases": [{"name": "SRT/VTT captions", "block": 0, "file": ("captions.srt", "srt")}],
    },
    {
        "slug": "batch-transcribe-with-language-hint",
        "path": f"{COOKBOOK}/batch-transcribe-with-language-hint.mdx",
        "cases": [
            {"name": "batch transcribe (sync)", "block": 0, "truthy": "results"},
            {"name": "batch transcribe (async)", "block": 1},  # runs to completion = pass
        ],
    },
    {
        "slug": "telephony-8khz-audio",
        "path": f"{COOKBOOK}/telephony-8khz-audio.mdx",
        "cases": [
            {"name": "8 kHz wav (sync)", "block": 0, "file": ("out.wav", "wav")},
            {"name": "8 kHz wav (async)", "block": 1, "file": ("out.wav", "wav")},
            {"name": "8 kHz raw pcm", "block": 2, "var_nonempty": "audio"},
        ],
    },
    {
        "slug": "clone-and-wait-until-ready",
        "path": f"{COOKBOOK}/clone-and-wait-until-ready.mdx",
        "cases": [
            {"name": "create + poll + synth (sync)", "block": 0, "file": ("out.mp3", "mp3"),
             "subs": {"deadline = time.time() + 300  # 5-minute timeout":
                      "deadline = time.time() + 600  # extended timeout for test"}},
            {"name": "create + poll + synth (async)", "block": 1, "file": ("out.mp3", "mp3")},
        ],
    },
    {
        "slug": "oneshot-vs-persistent-cloning",
        "path": f"{COOKBOOK}/oneshot-vs-persistent-cloning.mdx",
        "cases": [
            {"name": "one-shot ReferenceAudio (sync)", "block": 0, "file": ("oneshot.mp3", "mp3")},
            {"name": "one-shot ReferenceAudio (async)", "block": 1, "file": ("oneshot.mp3", "mp3")},
            {"name": "persistent create + reuse", "block": 2, "file": ("persistent.mp3", "mp3")},
            {"name": "reuse known id", "block": 3, "var": ("audio", "mp3"),
             "subs": {"<voice-id>": PUBLIC_VOICE}},
        ],
    },
    {
        "slug": "discover-library-voice",
        "path": f"{COOKBOOK}/discover-library-voice.mdx",
        "cases": [{"name": "library search + synth", "block": 0, "file": ("out.mp3", "mp3"),
                   "subs": {"<voice-id>": PUBLIC_VOICE}}],
    },
    {
        "slug": "voice-agent-loop",
        "path": f"{COOKBOOK}/voice-agent-loop.mdx",
        "cases": [
            {"name": "asr -> reply -> tts (sync)", "block": 0, "file": ("reply.mp3", "mp3"),
             "subs": {'"<voice-id>"': f'"{PUBLIC_VOICE}"'}},
            {"name": "asr -> reply -> tts (async)", "block": 1, "file": ("reply.mp3", "mp3"),
             "subs": {'"<voice-id>"': f'"{PUBLIC_VOICE}"'}},
        ],
    },
]
