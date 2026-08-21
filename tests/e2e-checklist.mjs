#!/usr/bin/env node
/**
 * Lightweight E2E checklist for Quest packaging + remote ads config.
 * Usage: node tests/e2e-checklist.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
let failed = 0;

function ok(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("OK  ", msg);
  }
}

const questJs = fs.readFileSync(path.join(root, "android/app/src/main/assets/quest3d/quest.js"), "utf8");
const orderMatch = questJs.match(/var SCENARIO_ORDER = \[([\s\S]*?)\];/);
ok(!!orderMatch, "SCENARIO_ORDER present in quest.js");
const ids = (orderMatch ? orderMatch[1] : "").match(/"([^"]+)"/g)?.map((s) => s.slice(1, -1)) || [];
ok(ids.length >= 30, `At least 30 districts (found ${ids.length})`);

const roadQuest = JSON.parse(
  fs.readFileSync(path.join(root, "android/app/src/main/assets/data/common/road_quest.json"), "utf8"),
);
const playable = roadQuest.chapters.filter((c) => c.playable);
ok(playable.length >= 8, `Playable chapters merged (found ${playable.length})`);
const sceneIds = new Set(playable.flatMap((c) => (c.scenes || []).map((s) => s.id)));
["people", "seatbelt", "accident", "hospital", "priority"].forEach((id) => {
  ok(sceneIds.has(id) || ids.includes(id), `Merged story references district '${id}'`);
});

const ads = JSON.parse(fs.readFileSync(path.join(root, "remote/ads-config.json"), "utf8"));
ok(ads.ads === "Disabled", "Remote ads default Disabled");
ok(typeof ads.interstitialCooldownSec === "number", "Interstitial cooldown configured");

const markings = JSON.parse(
  fs.readFileSync(path.join(root, "android/app/src/main/assets/data/common/road_markings.json"), "utf8"),
);
ok(markings.markings.length === 25, "25 road markings in catalog");

const learn = fs.readFileSync(
  path.join(root, "android/app/src/main/java/com/rtobuddy/nativeapp/ui/learn/LearnScreen.kt"),
  "utf8",
);
ok(learn.includes("when (markingId)"), "MarkingThumb uses id-based drawing");
for (let i = 1; i <= 25; i++) {
  const id = `RM-${String(i).padStart(3, "0")}`;
  ok(learn.includes(`"${id}"`), `MarkingThumb covers ${id}`);
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll E2E checklist checks passed.");
