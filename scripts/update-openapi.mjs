import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const schemaUrl =
  process.env.OPENAPI_SCHEMA_URL ?? "https://api.fish.audio/openapi.json";
const outputPath =
  process.env.OPENAPI_OUTPUT_PATH ?? "api-reference/openapi.json";
const fetchTimeoutMs = Number(process.env.OPENAPI_FETCH_TIMEOUT_MS ?? 30000);

async function main() {
  const response = await fetch(schemaUrl, {
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(fetchTimeoutMs),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download OpenAPI schema: ${response.status} ${response.statusText}`
    );
  }

  const rawSchema = await response.text();
  const schema = JSON.parse(rawSchema);

  if (typeof schema.openapi !== "string" || !schema.openapi.startsWith("3.")) {
    throw new Error("Downloaded file is not an OpenAPI 3.x schema");
  }

  if (!schema.paths || typeof schema.paths !== "object") {
    throw new Error("Downloaded OpenAPI schema is missing paths");
  }

  const formattedSchema = `${JSON.stringify(schema, null, 2)}\n`;
  const resolvedOutputPath = path.resolve(outputPath);
  const tempPath = `${resolvedOutputPath}.tmp`;

  await mkdir(path.dirname(resolvedOutputPath), { recursive: true });
  await writeFile(tempPath, formattedSchema);

  try {
    await rename(tempPath, resolvedOutputPath);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }

  console.log(`Updated ${outputPath} from ${schemaUrl}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
