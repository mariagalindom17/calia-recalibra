import test from "node:test";
import assert from "node:assert/strict";
import { calculateEnergyScore } from "../src/lib/energy-score.ts";
import { fatigueTotal, FATIGUE_ITEMS, SYMPTOM_PROMPTS, SYMPTOM_PAGES } from "../src/lib/energy-questionnaire.ts";

test("score endpoints: 0 to 100", () => {
  assert.equal(calculateEnergyScore(1, 63), 0);
  assert.equal(calculateEnergyScore(10, 9), 100);
});
test("equal weights, 0–100 scaling, rounding", () => {
  assert.equal(calculateEnergyScore(10, 63), 50);
  assert.equal(calculateEnergyScore(1, 9), 50);
  assert.equal(calculateEnergyScore(5, 36), 47);
});
test("rejects incomplete or invalid values", () => {
  for (const [energy,sum] of [[null,40],[5,null],[0,9],[11,9],[5,8],[5,64],[5.5,36],[5,36.5]]) {
    assert.equal(calculateEnergyScore(energy,sum),null);
  }
});
test("score increases with more energy and less reported interference", () => {
  for (let e=1;e<=10;e++)for(let f=9;f<=63;f++){
    const x=calculateEnergyScore(e,f);
    assert.ok(x>=0&&x<=100);
    if(e<10) assert.ok(calculateEnergyScore(e+1,f)>=x);
    if(f>9) assert.ok(calculateEnergyScore(e,f-1)>=x);
  }
});
test("nine mandatory fatigue answers, total 9–63", () => {
  assert.equal(FATIGUE_ITEMS.length,9);
  assert.equal(fatigueTotal(Array(9).fill(1)),9);
  assert.equal(fatigueTotal(Array(9).fill(7)),63);
  assert.equal(fatigueTotal([4,4,4,4,4,4,4,4,4]),36);
  assert.equal(fatigueTotal([1,2,3,null,5,6,7,4,4]),null);
});
test("all 21 symptoms occur once in three neutral mixed screens", () => {
  assert.equal(SYMPTOM_PROMPTS.length,21);
  assert.equal(SYMPTOM_PAGES.length,3);
  assert.ok(SYMPTOM_PAGES.every(page=>page.length===7));
  const ids=SYMPTOM_PAGES.flat();
  assert.equal(new Set(ids).size,21);
  assert.deepEqual(new Set(ids),new Set(SYMPTOM_PROMPTS.map(s=>s.id)));
  for(const page of SYMPTOM_PAGES){
    const tags=new Set(page.map(id=>SYMPTOM_PROMPTS.find(s=>s.id===id).tag));
    assert.ok(tags.size>=3,"mixed categories on each page");
  }
});
