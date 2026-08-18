// Safety-rule tests for the skin questionnaire. Run with: npm run test:skin
// These check that a blocked product is genuinely removed and that the person
// is told why — the rules are useless if they only exist in the type system.
const path = require("path");
const { ingredientConflict, shouldReferToDoctor } = require(path.join(__dirname, "..", ".skintest", "lib", "skincare.js"));

let failures = 0;
function check(name, cond, extra) {
  if (cond) console.log("PASS  " + name);
  else { failures++; console.log("FAIL  " + name + (extra ? "  -> " + extra : "")); }
}

const base = {
  afterCleansing: "comfortable", texture: "any", fragrance: "okay",
  goal: "hydration", budget: "flexible", createdAt: new Date().toISOString(),
};

// Pregnancy is volunteered, never asked — and it must block retinoids outright.
{
  const p = { ...base, flags: ["pregnancy"] };
  const v = ingredientConflict(p, ["retinoid", "smoother-looking"]);
  check("pregnancy blocks retinoids", v.blocked && /pregnan/i.test(v.reason || ""), JSON.stringify(v));
  check("pregnancy leaves gentle products alone", !ingredientConflict(p, ["hydration", "gentle"]).blocked);
}

// Layering rules.
{
  const p = { ...base, usingNow: ["retinol"] };
  check("retinol in use blocks acids", ingredientConflict(p, ["aha"]).blocked && ingredientConflict(p, ["bha"]).blocked);
  const q = { ...base, usingNow: ["acids"] };
  check("acids in use block retinoids", ingredientConflict(q, ["retinoid"]).blocked);
  const r = { ...base, usingNow: ["vitamin-c"] };
  check("vitamin C in use blocks benzoyl peroxide", ingredientConflict(r, ["benzoyl-peroxide"]).blocked);
}

// Reactivity and procedures.
{
  check("stinging often blocks strong actives", ingredientConflict({ ...base, stinging: "often" }, ["retinoid"]).blocked);
  check("recent procedure pauses actives", ingredientConflict({ ...base, flags: ["recent-procedure"] }, ["aha"]).blocked);
  check("prescription defers overlapping actives", ingredientConflict({ ...base, flags: ["prescription"] }, ["benzoyl-peroxide"]).blocked);
}

// Every block has to explain itself to the person.
{
  const cases = [
    [{ ...base, flags: ["pregnancy"] }, ["retinoid"]],
    [{ ...base, usingNow: ["retinol"] }, ["aha"]],
    [{ ...base, stinging: "often" }, ["strong-exfoliant"]],
  ];
  check("every block carries a reason", cases.every(([p, t]) => {
    const v = ingredientConflict(p, t);
    return v.blocked && typeof v.reason === "string" && v.reason.length > 10;
  }));
}

// Care handoff: we defer, we don't diagnose.
{
  check("under a doctor's care triggers a referral", shouldReferToDoctor({ ...base, underCare: true }) === true);
  check("no referral when not under care", shouldReferToDoctor(base) === false);
}

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
