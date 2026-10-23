import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync,existsSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
const basedir="brand/landing", html=readFileSync(join(basedir,"index.html"),"utf8");
const scoreDir=join(basedir,"score");
const index=readFileSync(join(scoreDir,"index.html"),"utf8");
const app=readFileSync(join(scoreDir,"score.js"),"utf8");
test("CTA opens local six-step questionnaire",()=>{
  assert.equal((html.match(/href="\.\/score\/"/g)||[]).length,2);
  assert.ok(existsSync(join(scoreDir,"index.html")));
});
test("name/email mandatory and never sent in static preview",()=>{
  assert.match(app,/state\.atIntro/);
  assert.match(app,/name\.length<2/);
  assert.match(app,/email\.length>254/);
  assert.match(app,/no se envían ni se guardan/i);
  assert.doesNotMatch(app,/fetch\(|localStorage|sessionStorage|XMLHttpRequest/);
});
test("six screens use all source questionnaires and show score",()=>{
  assert.match(app,/PASO.*DE 6/);
  assert.match(app,/SCORE CALIA/);
  assert.match(app,/50\*\(state\.energy-1\)\/9/);
  assert.match(app,/state\.answers\.some\(n=>n===null\)/);
  assert.match(app,/const FATIGUE=/);
  assert.match(app,/const PAGES=/);
});
test("local image and stylesheet paths exist",()=>{
  for(const p of ["../../assets/styles.css","../../assets/img/icons/3d/energy.svg","./score.css","./score.js"]){
    assert.ok(existsSync(resolve(scoreDir,p)),p);
  }
});
