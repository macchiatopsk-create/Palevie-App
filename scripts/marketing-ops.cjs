#!/usr/bin/env node
"use strict";
/**
 * PALEVIE marketing ops: offline analysis and editorial preflight only.
 * Inspired by the workflow of https://github.com/steveaimkt/marketing-team (MIT).
 * This script NEVER fetches account data, generates media, or publishes posts.
 */
const fs = require("node:fs");
const path = require("node:path");

const FORMATS = new Set(["shade-battle", "color-lab", "beauty-real", "beauty-pov", "screen-demo"]);
const VIDEO_ORIGINS = new Set(["original-footage", "licensed-stock", "owned-screen-recording", "original-motion-graphics"]);
const FORBIDDEN_CLAIMS = [
  /(?:100\s*%\s*(?:accurate|match|guaranteed))/i,
  /\b(?:guaranteed\s+(?:skin\s+tone|personal\s+color|shade)\s+match|clinically\s+proven)\b/i,
  /\b(?:diagnos(?:e|is|ed)|medical\s+grade\s+skin\s+scan)\b/i
];

function finiteCount(x, field, optional = false) {
  if (optional && (x === undefined || x === null || x === "")) return null;
  if (!Number.isFinite(x) || x < 0) throw Error(field + " must be a nonnegative finite number");
  return x;
}
function normalizeReels(input) {
  if (!input || !Array.isArray(input.reels) || !input.reels.length) throw Error("Expected a nonempty reels array");
  if (!["synthetic_fixture", "account_export"].includes(input.kind)) throw Error("Set kind to synthetic_fixture or account_export");
  if (input.kind === "account_export" && typeof input.source !== "string") throw Error("Account export must name its source");
  const ids = new Set();
  return input.reels.map((r, i) => {
    if (!r || typeof r.id !== "string" || !r.id.trim() || ids.has(r.id)) throw Error("Unique reel id required at row " + i);
    ids.add(r.id);
    if (!FORMATS.has(r.format)) throw Error("Unknown format at " + r.id);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.postedDate || "") || !Number.isFinite(Date.parse(r.postedDate + "T12:00:00Z"))) throw Error("Invalid postedDate at " + r.id);
    if (typeof r.title !== "string" || !r.title.trim()) throw Error("Title missing at " + r.id);
    const result = { id:r.id, title:r.title.trim(), format:r.format, postedDate:r.postedDate };
    for (const field of ["views", "reach", "likes", "comments", "saves", "shares"]) result[field] = finiteCount(r[field],r.id+"."+field);
    result.avgWatchSeconds = finiteCount(r.avgWatchSeconds, r.id+".avgWatchSeconds", true);
    result.interactions = result.likes + result.comments + result.saves + result.shares;
    result.interactionsPerThousandReach = result.reach ? Math.round(result.interactions / result.reach * 10000) / 10 : null;
    return result;
  });
}
function median(values) {
  const sorted = values.slice().sort((a,b)=>a-b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length/2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
}
function report(input) {
  const rows = normalizeReels(input);
  const groups = [...new Set(rows.map(r=>r.format))].map(format => {
    const subset = rows.filter(r=>r.format===format);
    return {format, posts:subset.length, medianViews:median(subset.map(r=>r.views)),
      medianReach:median(subset.map(r=>r.reach)),
      medianWatchSeconds:median(subset.filter(r=>r.avgWatchSeconds!==null).map(r=>r.avgWatchSeconds)),
      totalInteractions:subset.reduce((sum,r)=>sum+r.interactions,0)};
  }).sort((a,b)=>b.medianViews-a.medianViews);
  const ranked = [...rows].sort((a,b)=>b.views-a.views);
  const safe = value => value === null ? "unavailable" : Number(value).toLocaleString("en-US",{maximumFractionDigits:2});
  const label = input.kind === "synthetic_fixture" ? "SYNTHETIC DEMO — NOT ACCOUNT DATA" : "ACCOUNT EXPORT — SOURCE: "+input.source;
  const lines = ["# PALEVIE — Reel performance review", "", "**Source:** "+label, "**Reels sampled:** "+rows.length,
    "", "No claim of causation, real-human identity, follower conversion, retention percentage or purchases is made from Reel views.", "",
    "## By format", "", "| Format | Reels | Median views | Median reach | Median avg watch (s) | Interactions total |",
    "|---|---:|---:|---:|---:|---:|"];
  for (const g of groups) lines.push("| "+g.format+" | "+g.posts+" | "+safe(g.medianViews)+" | "+safe(g.medianReach)+" | "+safe(g.medianWatchSeconds)+" | "+safe(g.totalInteractions)+" |");
  lines.push("", "## Leading and trailing examples", "");
  for (const [title,items] of [["Higher views",ranked.slice(0,Math.min(3,ranked.length))],["Lower views",ranked.slice(-Math.min(3,ranked.length)).reverse()]]) {
    lines.push("**"+title+"**");
    for (const r of items) lines.push("- "+r.postedDate+" · "+r.title+" ["+r.format+"] — "+safe(r.views)+" views; "+safe(r.reach)+" reach; "+safe(r.interactionsPerThousandReach)+" interactions / 1,000 reached");
    lines.push("");
  }
  lines.push("## Next test — hypothesis, not promise", "",
    "- Keep the strongest repeated format as a control; test at least one visually different, footage-first treatment.",
    "- Compare posts at the same 24h and 72h age; record reach, watch time, saves, shares and actual profile/website activity where separately measured.",
    "- Do not scale to 5–6 posts/day until the first three new cuts pass video review and show credible engagement.",
    "- Do not interpret impressions, views, or server page requests as verified people.",
    "");
  return lines.join("\n");
}
function validateBrief(b) {
  const errors=[];
  const need=(ok,reason)=>{if(!ok)errors.push(reason);};
  need(b&&typeof b==="object"&&!Array.isArray(b),"Brief must be an object");
  if (!b || typeof b!=="object" || Array.isArray(b)) return {ok:false,errors};
  need(typeof b.id==="string"&&b.id.trim().length>2,"Missing content ID");
  need(FORMATS.has(b.format),"Format is not a supported PALEVIE reel type");
  need(typeof b.hook==="string"&&b.hook.trim().length>=8,"First-two-seconds hook needs real text");
  need(typeof b.script==="string"&&b.script.trim().length>=30,"Script/shot list needs detail");
  need(typeof b.caption==="string"&&b.caption.trim().length>=15,"Caption needs real text");
  const media=b.media||{};
  need(typeof media.asset==="string"&&media.asset.trim().length>3,"No reviewed final MP4/video asset recorded");
  need(VIDEO_ORIGINS.has(media.origin),"Media origin and rights must be identified");
  need(typeof media.rightsEvidence==="string"&&media.rightsEvidence.trim().length>8,"Missing source license/filming rights evidence");
  need(media.commercialUseCleared===true,"Commercial-use rights not cleared");
  need(media.personReleaseChecked===true,"Model/subject permission or applicable release not checked");
  need(media.audioCleared===true,"Music and sound-use rights not cleared");
  need(media.aspectRatio==="9:16","Final Reel must be 9:16");
  need(Number.isFinite(media.durationSeconds)&&media.durationSeconds>=5&&media.durationSeconds<=60,"Review final 5–60s duration");
  const qc=b.quality||{};
  for (const field of ["watchedFinalVideo","firstTwoSecondsCompelling","readableOnPhone","realVisualChange","accurateDemonstration","noMisleadingResults","claimsReviewed"]) {
    need(qc[field]===true,"QC incomplete: "+field);
  }
  if (b.format==="beauty-real" || b.format==="beauty-pov") {
    need(["original-footage","licensed-stock"].includes(media.origin),"Beauty real/POV must use actual licensed or original footage");
    need(media.realHumanAction===true,"Real hands/face/application must be visible; not a static slide or AI still");
    need(media.staticSlideDeck===false,"PPT-style still-motion Reel rejected");
  }
  if (b.format==="screen-demo") {
    need(["owned-screen-recording","original-footage"].includes(media.origin),"Screen demo needs actual owned recording");
    need(qc.currentProductScreenChecked===true,"Product UI/date claims must match current website");
  }
  if (b.format==="color-lab") need(qc.colorValuesVerified===true,"Color-lab swatch values must be checked, not visually faked");
  const allCopy=[b.hook,b.script,b.caption].filter(x=>typeof x==="string").join(" ");
  if (FORBIDDEN_CLAIMS.some(re=>re.test(allCopy))) errors.push("Unsubstantiated diagnostic/accuracy claim; rewrite and review");
  need(b.ownerApproved===true,"Owner review/approval missing — scheduling blocked");
  return {ok:errors.length===0,errors};
}
function readJson(file) { return JSON.parse(fs.readFileSync(path.resolve(file),"utf8")); }
function main(argv) {
  const [cmd,file] = argv;
  if (!["report","review"].includes(cmd) || !file) {
    process.stderr.write("Usage: node scripts/marketing-ops.cjs report <reels.json> | review <reel-brief.json>\n");
    process.exitCode=2;return;
  }
  try {
    const input=readJson(file);
    if (cmd==="report") process.stdout.write(report(input)+"\n");
    else {
      const result=validateBrief(input);
      process.stdout.write(JSON.stringify({id:input?.id??null,decision:result.ok?"READY_FOR_MANUAL_SCHEDULING":"BLOCKED",errors:result.errors},null,2)+"\n");
      if (!result.ok) process.exitCode=2;
    }
  } catch(error) {process.stderr.write("Marketing ops: "+error.message+"\n");process.exitCode=2;}
}
if (require.main===module) main(process.argv.slice(2));
module.exports={normalizeReels,median,report,validateBrief};
