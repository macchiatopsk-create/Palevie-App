// Run with: node scripts/test-camera-events.cjs
// Exercises the actual route with an in-memory database stub. No network calls.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..");
const routePath = path.join(root, "app/api/events/route.ts");
const routeSource = fs.readFileSync(routePath, "utf8");
const clientSource = fs.readFileSync(path.join(root, "lib/analytics.ts"), "utf8");
const cameraEvents = [
  "drape_mode_selected",
  "drape_camera_started",
  "drape_camera_error",
  "drape_camera_color_switched",
];
const declaredCameraEvents = [...new Set(
  [...clientSource.matchAll(/"(drape_(?:mode_selected|camera_[^"]+))"/g)].map(match => match[1])
)].sort();
assert.deepEqual(declaredCameraEvents, [...cameraEvents].sort(),
  "Update the camera route regression cases when camera events change.");

const inserted = [];
let databaseError = null;
const routeModule = { exports: {} };
const compiled = ts.transpileModule(routeSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
}).outputText;
vm.runInNewContext(compiled, {
  exports: routeModule.exports,
  module: routeModule,
  require(name) {
    if (name === "next/server") return {
      NextResponse: { json: (body, init = {}) => new Response(JSON.stringify(body), {
        ...init, headers: { "content-type": "application/json" },
      }) },
    };
    if (name === "@/lib/server/supabaseAdmin") return {
      getSupabaseAdmin: () => ({ from(table) {
        assert.equal(table, "events");
        return { async insert(row) {
          if (!databaseError) inserted.push(row);
          return { error: databaseError };
        } };
      } }),
    };
    if (name === "crypto") return require("node:crypto");
    throw new Error(`Unexpected route dependency: ${name}`);
  },
}, { filename: routePath });

function request(body) {
  return new Request("https://camera-test.invalid/api/events", {
    method: "POST",
    headers: { "content-type": "application/json", "x-palevie-visitor": "camera-regression-test" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

(async () => {
  for (const name of cameraEvents) {
    assert.ok(clientSource.includes(`"${name}"`), `${name} must be declared by the client`);
    const response = await routeModule.exports.POST(request({ name, props: { surface: "quiz" } }));
    assert.equal(response.status, 200, `${name} must be accepted`);
    assert.equal(inserted.at(-1).event_name, name, `${name} must reach storage`);
    assert.equal(inserted.at(-1).visitor_id, "camera-regression-test");
    console.log(`PASS ${name}: accepted and stored`);
  }
  const beforeInvalid = inserted.length;
  assert.equal((await routeModule.exports.POST(request({ name: "unrecognized_event" }))).status, 400);
  assert.equal((await routeModule.exports.POST(request("not-json"))).status, 400);
  assert.equal(inserted.length, beforeInvalid, "Invalid events must not reach storage");
  console.log("PASS unknown and malformed events remain rejected");

  await routeModule.exports.POST(request({ name: "drape_camera_error", props: { text: "x".repeat(12001) } }));
  assert.equal(inserted.at(-1).props.truncated, true);
  console.log("PASS oversized properties remain truncated");

  databaseError = { message: "simulated storage failure" };
  assert.equal((await routeModule.exports.POST(request({ name: "drape_camera_started" }))).status, 503);
  console.log("PASS storage failure remains a 503");
  console.log("Camera analytics regression tests passed; no external data was written.");
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
