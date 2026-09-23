// Regression: signing out clears account identity while preserving device attribution.
const path = require("path");

const values = new Map([
  ["palevie-local-owner-v1", "user-1"],
  ["palevie-member-v1", JSON.stringify({ name: "Sung", joinedAt: "2026-01-01T00:00:00.000Z" })],
  ["palevie-profile-v1", "profile"],
  ["palevie-visitor-v1", "visitor"],
  ["palevie-attribution-first-v1", "first-touch"],
  ["palevie-attribution-last-v1", "last-touch"],
  ["palevie-events-v1", "events"],
]);
const dispatched = [];
global.localStorage = {
  getItem: key => values.has(key) ? values.get(key) : null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
global.window = { dispatchEvent: event => dispatched.push(event.type) };

const { releaseLocalData } = require(path.join(__dirname, "..", ".logouttest", "localOwner.js"));
releaseLocalData();

let failures = 0;
function check(name, condition) {
  if (condition) console.log("PASS  " + name);
  else { failures++; console.log("FAIL  " + name); }
}
check("member identity is cleared", !values.has("palevie-member-v1"));
check("personal profile is cleared", !values.has("palevie-profile-v1"));
check("local owner stamp is cleared", !values.has("palevie-local-owner-v1"));
check("member listeners are notified", dispatched.includes("palevie:member"));
check("wishlist listeners are notified", dispatched.includes("palevie-wishlist-changed"));
check("visitor id remains", values.get("palevie-visitor-v1") === "visitor");
check("first-touch attribution remains", values.get("palevie-attribution-first-v1") === "first-touch");
check("last-touch attribution remains", values.get("palevie-attribution-last-v1") === "last-touch");
check("device event log remains", values.get("palevie-events-v1") === "events");
console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
