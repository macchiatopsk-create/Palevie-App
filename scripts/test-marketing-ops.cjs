#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const {normalizeReels,median,report,validateBrief}=require("./marketing-ops.cjs");
const root=path.resolve(__dirname,"..");
let passed=0;
function test(name,fn){fn();passed++;process.stdout.write("PASS marketing: "+name+"\n");}
const fixture=JSON.parse(fs.readFileSync(path.join(root,"marketing-team/inputs/sample-reels.json"),"utf8"));
const brief=JSON.parse(fs.readFileSync(path.join(root,"marketing-team/briefs/pilot-real-beauty.json"),"utf8"));
test("sample input openly labeled synthetic; no private Metricool export committed",()=>{
 assert.equal(fixture.kind,"synthetic_fixture");
 assert.ok(fixture.reels.length>=4);
 assert.equal(report(fixture).includes("SYNTHETIC DEMO — NOT ACCOUNT DATA"),true);
});
test("metrics distinct: views vs reach, do not invent watch time or retention",()=>{
 const rows=normalizeReels(fixture);
 assert.ok(rows[0].views>rows[0].reach);
 assert.equal(rows[0].interactions,rows[0].likes+rows[0].comments+rows[0].saves+rows[0].shares);
 assert.equal(rows.filter(r=>r.avgWatchSeconds===null).length>0,true);
 assert.ok(report(fixture).includes("unavailable"));
 assert.ok(!/\d+%\s*retention/.test(report(fixture)));
});
test("group ranking uses medians and single-sample uncertainty stays visible",()=>{
 assert.equal(median([1,3,2]),2);
 assert.equal(median([1,3,2,4]),2.5);
 const text=report(fixture);
 assert.ok(text.includes("Median views"));
 assert.ok(text.includes("hypothesis, not promise"));
 assert.ok(text.includes("5–6 posts/day"));
});
test("invalid figures and duplicate IDs fail before analysis",()=>{
 const bad=JSON.parse(JSON.stringify(fixture));bad.reels[0].views=-2;
 assert.throws(()=>report(bad),/nonnegative/);
 const dup=JSON.parse(JSON.stringify(fixture));dup.reels[1].id=dup.reels[0].id;
 assert.throws(()=>report(dup),/Unique reel id/);
 const source=JSON.parse(JSON.stringify(fixture));source.kind="account_export";delete source.source;
 assert.throws(()=>report(source),/name its source/);
});
test("pilot is intentionally blocked: no footage or rights or owner approval",()=>{
 const v=validateBrief(brief);assert.equal(v.ok,false);
 assert.ok(v.errors.some(x=>/final MP4/.test(x)));
 assert.ok(v.errors.some(x=>/approval/.test(x)));
});
const ready={
 id:"approved-in-test-only",format:"beauty-real",hook:"Same lipstick, two finishes.",
 script:"00:00 close-up of hand applying lipstick. 00:04 close-up natural gloss application. 00:08 finished comparison.",
 caption:"A beauty experiment with actual licensed footage, no shade matching claim.",
 media:{asset:"/local/approved.mov",origin:"original-footage",rightsEvidence:"Original recording rights receipt #demo",
  commercialUseCleared:true,personReleaseChecked:true,audioCleared:true,aspectRatio:"9:16",durationSeconds:10,
  realHumanAction:true,staticSlideDeck:false},
 quality:{watchedFinalVideo:true,firstTwoSecondsCompelling:true,readableOnPhone:true,realVisualChange:true,
  accurateDemonstration:true,noMisleadingResults:true,claimsReviewed:true},
 ownerApproved:true
};
test("complete reviewed real-footage brief passes as manual scheduling eligible",()=>{
 const r=validateBrief(ready);assert.deepEqual(r,{ok:true,errors:[]});
});
test("PPT look, synthetic human, missing usage rights are blocked",()=>{
 for(const patch of [{media:{...ready.media,staticSlideDeck:true}},
  {media:{...ready.media,origin:"original-motion-graphics"}},
  {media:{...ready.media,personReleaseChecked:false}},
  {media:{...ready.media,commercialUseCleared:false}}]){
   const r=validateBrief({...ready,...patch});assert.equal(r.ok,false);
 }
});
test("claims and unverified scan/product demonstrations are not approved",()=>{
 assert.equal(validateBrief({...ready,caption:"A 100% accurate personal color match guaranteed!"}).ok,false);
 assert.equal(validateBrief({...ready,format:"screen-demo",media:{...ready.media,origin:"owned-screen-recording"}}).ok,false);
 assert.equal(validateBrief({...ready,format:"color-lab"}).ok,false);
});
test("owner approval remains mandatory even if all other metadata says okay",()=>{
 const v=validateBrief({...ready,ownerApproved:false});
 assert.equal(v.ok,false);assert.ok(v.errors.some(x=>/approval/.test(x)));
});
test("marketing system is intentionally offline and cannot schedule or sell",()=>{
 const src=fs.readFileSync(path.join(__dirname,"marketing-ops.cjs"),"utf8");
 assert.ok(!/\bfetch\s*\(|\bhttps\.request\s*\(|createScheduledPost|run_web_automation/.test(src));
 const doc=fs.readFileSync(path.join(root,"marketing-team/README.md"),"utf8");
 assert.ok(doc.includes("does not install the Claude plugin"));
 assert.ok(doc.includes("Metricool"));
 assert.ok(doc.includes("MIT"));
});
process.stdout.write("MARKETING_OPS_PASS "+passed+" offline checks; no account mutations\n");
