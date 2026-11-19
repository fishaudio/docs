---
name: fish-audio-agents
description: Build, publish, and talk to a Fish Audio voice agent (voice agent, phone agent, voice bot) through the Agents API (`/v1/agent`). Use when the user asks to create or deploy a voice agent, give it a phone number, put it on a web page, or read back its conversations. Covers the API key, creating and configuring an agent, publishing, three ways to reach it (console test call, a one-file browser demo, a phone number), reading a session back, the Agents API errors, and which page to read for tools, knowledge base, deployment, and telephony. For text-to-speech or speech-to-text alone, use the `fish-audio-sdk` or `fish-audio-api` skill instead.
---

# Fish Audio Agents Skill

Use this skill to take a user from an API key to a first conversation with a working Fish Audio voice agent, and to find the right page for everything after that. Work through the steps in order. Each step ends with a condition that tells you it is done.

## Global facts

- Base URL: `https://api.fish.audio`. Every Agents endpoint lives under `/v1/agent`.
- Auth: `Authorization: Bearer $FISH_API_KEY` on every request. Read the key from the environment or the project's `.env` and refer to it as `$FISH_API_KEY` in commands and code.
- The key belongs on a server. Browser code gets a per-call session token from your backend instead.
- Every account starts with a $5 trial balance, about 70 minutes of conversation.
- Full API reference for any endpoint: `https://docs.fish.audio/api-reference/endpoint/agent/<operation>.md` (for example `create-agent.md`). Every docs page is also served as markdown: append `.md` to its URL.

## Sessions are created only when a call starts

A session (`POST /v1/agent/sessions`) is a short-lived join token for exactly one call, and it is billed. Create one only at the moment a user starts a call, one per call. A session that no client joins ends as `failed`. To check a key or test the setup, use `GET /v1/agent/agents`.

## Step 1: Ask what to build

Ask the user, in one message, for anything the request has not already answered:

1. **Purpose**: what the agent does and for whom (for example "takes bakery orders by phone").
2. **Opening line**: what the agent says first.
3. **Language**: the language the agent speaks.
4. **Delivery**: how they want to talk to it first: a test call in the console, a demo on their own page, or a phone number.

If the user leaves a choice to you, use English, an opening line you write from the purpose, and the console.

Facts the agent will tell callers about the business (menu, prices, opening hours, policies) also come from the user. Ask for the ones the purpose needs, or build without them as step 3 describes.

Done when: you have a value for all four.

## Step 2: Get the API key

1. Look for `FISH_API_KEY` in the environment, then in a `.env` file at the project root.
2. If neither has it, ask the user to create a key at `https://fish.audio/app/agents/api-keys?new=1` and add it to `.env` as `FISH_API_KEY=...` themselves. The key is shown once. If `.env` is not listed in `.gitignore`, tell the user and offer to add it.
3. Check the key:

```bash
curl https://api.fish.audio/v1/agent/agents \
  --header "Authorization: Bearer $FISH_API_KEY"
```

A `200` (an empty list on a new account) means the key works. A `401` means it is wrong or expired: ask for a new one. This request creates nothing.

When the key lives only in `.env`, load it into the shell first, for example `set -a; . ./.env; set +a`.

Done when: the check returns `200`.

## Step 3: Create the agent

Create and configure the agent in one call:

```bash
curl --request POST https://api.fish.audio/v1/agent/agents \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "name": "Bakery orders",
    "config": {
      "prompt": {
        "system_prompt": "You take orders for Rosa'\''s Bakery by phone. Keep answers short and conversational. ...",
        "first_message_mode": "fixed",
        "first_message": "Hi, this is Rosa'\''s Bakery. What can I get started for you?"
      },
      "voice": {
        "voice_id": "802e3bc2b27e49c2995d23ef70e6ac89",
        "speaking_language": "en"
      }
    }
  }'
```

- `system_prompt`: write it from the purpose and from facts the user gave. For a menu, prices, hours, or policies the user has not given, tell the agent to say that the staff will confirm them, and list in your reply what the user should send you to fill them in. It is capped at 32,000 tokens; keep it under 2,000 for latency and cost. See `https://docs.fish.audio/agents/build/configuration.md`.
- `first_message_mode`: `fixed` speaks `first_message` word for word, `prompt` generates the opening from `first_message_prompt`, `off` waits for the caller.
- `speaking_language`: a language code such as `en`, `es`, `ja`, `zh`. The supported list is in `https://docs.fish.audio/agents/build/voice-language.md`.
- `voice_id`: any public voice model id. `802e3bc2b27e49c2995d23ef70e6ac89` is an English voice. For another language, pick a voice from the Voice Library in that language (no key needed):

```bash
curl "https://api.fish.audio/model?language=ja&sort_by=score&page_size=5"
```

Use an `_id` from `items` as `voice_id`.

The response contains `agent_id`. Save it as `AGENT_ID` (in the shell, and in `.env` if the project will use it).

To change the configuration later, `PATCH /v1/agent/agents/$AGENT_ID/config` with only the fields to change. It deep-merges into the draft; lists are replaced as a whole.

Done when: you have an `agent_id`.

## Step 4: Publish

Sessions run only published configuration. Creating a session for an agent that was never published returns `409`.

```bash
curl --request POST https://api.fish.audio/v1/agent/agents/$AGENT_ID/publish \
  --header "Authorization: Bearer $FISH_API_KEY"
```

Every later change to the draft needs another publish to go live.

Done when: the response has a `version_number`.

## Step 5: Deliver a way to talk to it

Follow the delivery the user chose in step 1.

### Console test call

Give the user `https://fish.audio/app/agents/<agent_id>` and tell them to click **Test call** in the top bar. The browser asks for the microphone, then they are talking to the agent. A test call runs the draft, which matches the published version right after publishing.

### Your own page

This one-file Node.js server (Node 18+, no dependencies) serves a page with the call widget and a route that creates a session with the API key when the user starts a call. Copy it from here as written. Only a project without Node needs the Quickstart: its **Your own page** tab in `https://docs.fish.audio/agents/quickstart.md` has the same server in Python (`server.py`, Python 3.8+).

```javascript server.mjs
import { createServer } from "node:http";

const page = `<!doctype html>
<meta charset="utf-8">
<title>Fish Agent demo</title>
<fish-agent agent-name="My agent"></fish-agent>
<script src="https://unpkg.com/@fishaudio/agent-widget-embed" async></script>
<script>
  document.querySelector("fish-agent").sessionTokenProvider = async () => {
    const response = await fetch("/voice-session", { method: "POST" });
    if (!response.ok) throw new Error("backend answered " + response.status);
    return response.json();
  };
</script>`;

createServer(async (req, res) => {
  if (req.method !== "POST" || req.url !== "/voice-session") {
    res.writeHead(200, { "Content-Type": "text/html" });
    return res.end(page);
  }
  try {
    const upstream = await fetch("https://api.fish.audio/v1/agent/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FISH_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ agent_id: process.env.AGENT_ID }),
    });
    const body = await upstream.text();
    if (upstream.ok) console.log("session", JSON.parse(body).session_id);
    else console.log("failed", upstream.status, body);
    res.writeHead(upstream.status, { "Content-Type": "application/json" });
    res.end(body);
  } catch (error) {
    console.error(error);
    res.writeHead(502).end();
  }
}).listen(3000, "localhost", () => console.log("open http://localhost:3000"));
```

1. Write the file into the project unchanged.
2. Start it in a shell where `FISH_API_KEY` and `AGENT_ID` are set, for example `set -a; . ./.env; set +a; node server.mjs`.
3. Check it answers: `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000` returns `200`.
4. Give the user the start command from step 2 as the first thing to do: run it in their own terminal, then open the page. A server you start from your own tool usually stops when your command, turn, or session ends, so say that your check was a one-off and the user's terminal is where the server keeps running.
5. Tell the user to open `http://localhost:3000`, click the launcher in the corner, and allow the microphone. The page needs `localhost` or `https`; a plain `http` LAN address gets no microphone.

Whenever you tell the user the page is ready, including after later changes, check it with the `curl` from step 3 first. Published changes reach the next call without a restart.

The server prints each call's `session_id`. For production, keep the same shape: the backend holds the key and returns session tokens, the page runs the widget or the Web SDK. See `https://docs.fish.audio/agents/deploy/authenticated-sessions.md`.

### Phone number

A purchased number is a US or Canada local number that rents for $1.20 a month, charged daily until it is released. Tell the user this and wait for a clear yes before buying.

1. Find a number:

```bash
curl "https://api.fish.audio/v1/agent/available-phone-numbers?country_code=US" \
  --header "Authorization: Bearer $FISH_API_KEY"
```

2. Buy one from `available_phone_numbers` and bind the agent in the same request:

```bash
curl --request POST https://api.fish.audio/v1/agent/phone-numbers \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "provider": "twilio",
    "phone_number": "+14155550123",
    "agent_id": "'$AGENT_ID'"
  }'
```

The response has the `phone_number_id`. The user dials the number and the agent answers.

3. If the user is outside the US and Canada, have the agent call them instead. Outbound calls reach the US, Canada, Japan, the UK, Italy, Australia, and Mexico:

```bash
curl --request POST https://api.fish.audio/v1/agent/phone-calls \
  --header "Authorization: Bearer $FISH_API_KEY" \
  --header "Content-Type: application/json" \
  --header "Idempotency-Key: first-call-1" \
  --data '{
    "agent_id": "'$AGENT_ID'",
    "phone_number_id": "YOUR_PHONE_NUMBER_ID",
    "to_number": "+14155550123"
  }'
```

Use a fresh `Idempotency-Key` for each distinct call. The response includes the call's `session_id`.

After testing, ask whether to keep the number. To stop the rental:

```bash
curl --request DELETE https://api.fish.audio/v1/agent/phone-numbers/YOUR_PHONE_NUMBER_ID \
  --header "Authorization: Bearer $FISH_API_KEY"
```

Done when: the user has a link, a running page, or a number to call.

## Step 6: Read the conversation back

When the user says they finished a call, find it and read it:

```bash
curl "https://api.fish.audio/v1/agent/sessions?agent_id=$AGENT_ID" \
  --header "Authorization: Bearer $FISH_API_KEY"
```

The newest session comes first. Read it by id:

```bash
curl "https://api.fish.audio/v1/agent/sessions/SESSION_ID" \
  --header "Authorization: Bearer $FISH_API_KEY"
```

`status` is `completed` after a normal hang-up, and `items` holds the messages and tool calls in order. Tell the user what was said. If there is no session, or it ended as `failed`, check the errors below and the server output. See `https://docs.fish.audio/agents/monitor/conversation-history.md`.

Done when: you have reported the session's status and what was said.

## Errors

Errors come back as JSON `{ "status": ..., "message": ... }`. A `422` is a list of field errors instead. Full reference: `https://docs.fish.audio/api-reference/agent-errors.md`.

| Status | Message or cause | What to do |
| --- | --- | --- |
| `401` | Missing, invalid, or expired key | Ask the user for a new key from `https://fish.audio/app/agents/api-keys?new=1`. |
| `402` | Out of API credit | Only session creation and number purchase charge up front. Ask the user to top up. |
| `403` | `Phone number limit reached for this team (N)` | Release a number first, or use one the team already holds. |
| `404` | Missing id, or one that belongs to another team | Treat both the same. Check the id came from this account. |
| `409` | `Agent has no published version` | Publish (step 4), then create the session again. |
| `409` | `This number is already on the platform` | Pick another number from the search. |
| `415` | Missing body or wrong `Content-Type` | Send `Content-Type: application/json`. |
| `422` | Field errors (`loc` names the field) | Fix those fields. Common causes: `system_prompt` over 32,000 tokens; an explicit `null` in a `PATCH` (omit the field to keep it, send `""` to clear text); an unknown field. |
| `422` on `/phone-calls` | `reason` such as `destination_not_allowed` | The destination is refused. See `https://docs.fish.audio/agents/telephony/outbound-calls.md#errors`. |
| `502`, `503` | An upstream or platform dependency failed | Retry with backoff. A failed number purchase leaves a row with status `error` that is safe to release. |

## Where to look next

Fetch the page for the task before writing code. All of these are markdown.

| Task | Page |
| --- | --- |
| How agents, drafts, versions, and sessions fit together | `https://docs.fish.audio/agents/concepts.md` |
| System prompt, opening line, turn-taking, timezone | `https://docs.fish.audio/agents/build/configuration.md` |
| Voice, speaking language, speech recognition | `https://docs.fish.audio/agents/build/voice-language.md` |
| Let the agent call your HTTP API (look up an order, book a slot) | `https://docs.fish.audio/agents/build/webhook-tools.md` |
| Tools that run in the user's browser | `https://docs.fish.audio/agents/build/client-tools.md` |
| Let the agent hang up the call itself | `https://docs.fish.audio/agents/build/system-tools.md` |
| Answer from your own documents | `https://docs.fish.audio/agents/build/knowledge-base.md` |
| Personalize each call with variables | `https://docs.fish.audio/agents/build/dynamic-variables.md` |
| Use your own LLM endpoint | `https://docs.fish.audio/agents/build/custom-llm.md` |
| Choose how users reach the agent | `https://docs.fish.audio/agents/deploy/overview.md` |
| Embed the widget on a site | `https://docs.fish.audio/agents/deploy/widget.md` |
| Backend-issued session tokens and per-session overrides | `https://docs.fish.audio/agents/deploy/authenticated-sessions.md` |
| Let anyone call without a backend (origin allowlist) | `https://docs.fish.audio/agents/deploy/public-agents.md` |
| Build your own call UI | `https://docs.fish.audio/agents/deploy/web-sdk.md`, `https://docs.fish.audio/agents/deploy/react-sdk.md` |
| Versions, publishing, rollback | `https://docs.fish.audio/agents/deploy/versions-publishing.md` |
| Phone numbers, inbound and outbound calls, transfers | `https://docs.fish.audio/agents/telephony/phone-numbers.md`, `https://docs.fish.audio/agents/telephony/inbound-calls.md`, `https://docs.fish.audio/agents/telephony/outbound-calls.md`, `https://docs.fish.audio/agents/telephony/transfers.md` |
| Transcripts and recordings | `https://docs.fish.audio/agents/monitor/conversation-history.md` |
| Get notified when a call ends | `https://docs.fish.audio/agents/monitor/webhooks.md` |
| Automated tests for an agent | `https://docs.fish.audio/agents/test/agent-tests.md` |
| Prices | `https://docs.fish.audio/agents/pricing.md` |
