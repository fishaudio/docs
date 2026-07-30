// End-to-end runner for the JavaScript examples in the docs.
// Extracts ```javascript blocks straight from the .mdx, substitutes placeholders, runs each
// verbatim in Node against the live Fish Audio API, and asserts it produced valid output.
//
// Key: $FISH_API_KEY, or the workspace .env. Skips (exit 0) if no key — safe for CI.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { FishAudioClient } from "fish-audio";
import { SPECS } from "./specs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const FISH = resolve(HERE, "../..");
const WS = resolve(FISH, "..");
const PUBLIC_VOICE = "9a9cf47702da476aa4629e2506d4a857";

function resolveKey() {
  if (process.env.FISH_API_KEY) return process.env.FISH_API_KEY.trim();
  try {
    const m = readFileSync(join(WS, ".env"), "utf8").match(/^\s*(?:export\s+)?FISH_API_KEY\s*=\s*(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, "");
  } catch {}
  return null;
}
const KEY = resolveKey();
if (!KEY) { console.log("SKIP: FISH_API_KEY not found (env or workspace .env)"); process.exit(0); }
process.env.FISH_API_KEY = KEY;

const client = new FishAudioClient({ apiKey: KEY });
const toBytes = async (s) => { const c = []; for await (const x of s) c.push(Buffer.from(x)); return Buffer.concat(c); };
const sniff = (b) =>
  (b.slice(0, 3).toString() === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) ? "mp3"
  : b.slice(0, 4).toString() === "RIFF" ? "wav"
  : b.slice(0, 4).toString() === "OggS" ? "opus" : "?";

function jsBlocks(mdxRel) {
  const src = readFileSync(join(FISH, mdxRel), "utf8");
  const re = /```javascript[^\n]*\n([\s\S]*?)```/g;
  const out = []; let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return out;
}

// One reference clip, reused as recipe input (speech.wav / reference.wav / sample.wav).
const sampleWav = await toBytes(
  await client.textToSpeech.convert({ text: "A sample clip for testing.", format: "wav" }, "s2-pro")
);

const RUNS = join(HERE, "_runs");
rmSync(RUNS, { recursive: true, force: true });
mkdirSync(RUNS, { recursive: true });

let pass = 0, fail = 0;
for (const spec of SPECS) {
  const blocks = jsBlocks(spec.mdx);
  for (const c of spec.cases) {
    let code = blocks[c.block];
    if (code === undefined) { console.log(`FAIL  ${spec.slug}::${c.name}\n      block ${c.block} not found`); fail++; continue; }
    for (const [k, v] of Object.entries(c.subs || {})) code = code.split(k).join(v.replace("<PUBLIC_VOICE>", PUBLIC_VOICE));
    const dir = join(RUNS, `${spec.slug}-${c.block}`);
    mkdirSync(dir, { recursive: true });
    for (const f of ["speech.wav", "reference.wav", "sample.wav"]) writeFileSync(join(dir, f), sampleWav);
    writeFileSync(join(dir, "run.mjs"), code);
    let ok = true, err = "";
    try {
      execFileSync(process.execPath, ["run.mjs"], { cwd: dir, env: { ...process.env }, stdio: "pipe", timeout: 180000 });
    } catch (e) { ok = false; err = (e.stderr?.toString() || e.message).trim().split("\n").slice(-3).join(" | "); }
    if (ok && c.file) {
      const p = join(dir, c.file[0]);
      if (!existsSync(p)) { ok = false; err = `${c.file[0]} not written`; }
      else {
        const b = readFileSync(p);
        if (c.file[1] === "srt") { if (!b.toString().includes("-->")) { ok = false; err = `${c.file[0]} has no SRT cues`; } }
        else if (c.file[1] !== "any" && sniff(b) !== c.file[1]) { ok = false; err = `${c.file[0]} is ${sniff(b)} not ${c.file[1]}`; }
      }
    }
    console.log(`${ok ? "PASS" : "FAIL"}  ${spec.slug}::${c.name}` + (ok ? "" : `\n      ${err}`));
    ok ? pass++ : fail++;
  }
}

// Best-effort cleanup of any throwaway voices the examples created.
try {
  const page = await client.voices.search({ self: true, page_size: 50 });
  for (const v of (page.items || [])) {
    if (/zzz|my voice|my narrator/i.test(v.title || "")) { try { await client.voices.delete(v._id || v.id); } catch {} }
  }
} catch {}

console.log(`\n=== ${pass}/${pass + fail} JS blocks passed ===`);
process.exit(fail ? 1 : 0);
