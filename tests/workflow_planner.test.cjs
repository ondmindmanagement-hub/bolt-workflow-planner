'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const inlineJs = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(inlineJs, 'single-page application should include a script');

function parseSteps(html) {
  const encoded = html.match(/<pre>([\s\S]*?)<\/pre>/)[1];
  return JSON.parse(encoded.replace(/&quot;/g, '"'));
}

function runPlanner(task, risk) {
  const elements = {
    task: { value: task },
    risk: { value: risk },
    result: { innerHTML: '' },
  };
  const alerts = [];
  const ctx = {
    document: { getElementById(id) { assert.ok(elements[id], 'known DOM id'); return elements[id]; } },
    alert(text) { alerts.push(text); },
  };
  vm.createContext(ctx);
  vm.runInContext(inlineJs[1], ctx, { filename: 'workflow_planner.js' });
  ctx.plan();
  return { resultHtml: elements.result.innerHTML, alerts };
}

test('requires an explicit task before creating a plan', () => {
  const r = runPlanner('   ', 'publish changes');
  assert.equal(r.alerts.length, 1);
  assert.equal(r.resultHtml, '');
});
test('creates exactly five ordered steps and a human approval boundary', () => {
  const r = runPlanner('Review invoices', 'approve invoice payment');
  assert.equal(r.alerts.length, 0);
  const steps = parseSteps(r.resultHtml);
  assert.deepEqual(steps.map(s => s.step), [1,2,3,4,5]);
  assert.equal(steps[3].control, 'human approval required');
  assert.equal(steps[3].action, 'approve invoice payment');
  assert.equal(steps[4].control, 'audit');
});
test('never substitutes an external action when risk is empty', () => {
  const r = runPlanner('Triaging tickets', ' ');
  const steps = parseSteps(r.resultHtml);
  assert.equal(steps[3].control, 'human approval required');
  assert.match(steps[3].action,/consequential external action/);
});
test('escapes untrusted task text rather than rendering markup', () => {
  const r = runPlanner('<img src=x onerror=alert(1)>', 'delete');
  assert.ok(r.resultHtml.includes('&lt;img'));
  assert.ok(!r.resultHtml.includes('<img'));
});
test('does not execute or render untrusted HTML from risk input', () => {
  const r = runPlanner('Safe plan', '<svg onload=alert(1)>');
  assert.ok(r.resultHtml.includes('&lt;svg'));
  assert.ok(!r.resultHtml.includes('<svg'));
});
test('includes official planning files and an open-source license', () => {
  for (const file of ['scope.md','prd.md','spec.md','LICENSE']) {
    assert.ok(fs.statSync(path.join(root,file)).size > 100, file);
  }
});
