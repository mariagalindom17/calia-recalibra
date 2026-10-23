import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const page = readFileSync("src/app/score/page.tsx","utf8");
const api = readFileSync("src/app/api/calia-interest/route.ts","utf8");
const css = readFileSync("brand/landing/landing.css","utf8");
const landing = readFileSync("brand/landing/index.html","utf8");

test("both name and email are required before the questions",()=>{
  assert.match(page,/minLength=\{2\} maxLength=\{80\} required/);
  assert.match(page,/name="email" type="email"/);
  assert.match(page,/maxLength=\{254\} required/);
  assert.match(page,/!registered \? <div className="es-lead-step"/);
});
test("registration must be confirmed by the backend, not just locally typed",()=>{
  assert.match(page,/if\(!response\.ok \|\| payload\.ok!==true\)throw new Error/);
  assert.match(page,/setRegistered\(true\)/);
  assert.match(page,/CALIA_PRIVACY_URL/);
  assert.match(api,/nombre\.length < 2/);
  assert.match(api,/CALIA_LEADS_ENABLED/);
  assert.match(api,/NEXT_PUBLIC_CALIA_PRIVACY_URL/);
  assert.match(api,/fuente:"calia-score-formulario"/);
});
test("no health questionnaire responses leak into lead capture request",()=>{
  const requestBody = page.match(/body:JSON\.stringify\((\{nombre,email,[^}]+\})\)/)?.[1]??"";
  assert.ok(requestBody,"registration payload is present");
  for(const word of ["fatigue","selected","energy","symptom"])assert.ok(!requestBody.includes(word),word);
});
test("pink brand tile keeps 3D icons in a bounded 3-column grid",()=>{
  assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(css,/position:static;inset:auto/);
  assert.match(css,/object-fit:contain/);
  const sources=[...landing.matchAll(/class="lp-story-icon [^"]+" src="([^"]+)"/g)];
  assert.equal(sources.length,3);
  for(const match of sources){
    assert.match(match[1],/\.svg$/);
  }
});
