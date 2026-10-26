'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(match,'inline script exists');
const script=new vm.Script(match[1],{filename:'index.html:inline-js'});
function createHarness(){
  class Element{
    constructor(){this.value='';this.textContent='';this.hidden=false;this.children=[];this.dataset={};this.listeners={};this.focused=false;}
    append(...children){this.children.push(...children)}
    replaceChildren(){this.children=[]}
    focus(){this.focused=true}
    addEventListener(name,callback){this.listeners[name]=callback}
  }
  const ids=new Map();
  for(const id of ['task','risk','error','taskline','steps','result','plannerForm']) ids.set(id,new Element());
  const document={getElementById(id){return ids.get(id)},createElement(){return new Element()}};
  const context={document};
  vm.createContext(context);script.runInContext(context);
  return {ids,plan:context.plan};
}
test('empty task is refused without execution',()=>{
  const h=createHarness();
  assert.equal(h.plan(),false);
  assert.match(h.ids.get('error').textContent,/Describe a task/);
  assert.equal(h.ids.get('result').hidden,false); // synthetic DOM default, no generated elements
  assert.equal(h.ids.get('steps').children.length,0);
  assert.equal(h.ids.get('task').focused,true);
});
test('five deterministic steps and a human approval gate',()=>{
  const h=createHarness();
  h.ids.get('task').value='Summarize tickets';
  h.ids.get('risk').value='Sending a reply';
  assert.equal(h.plan(),true);
  const steps=h.ids.get('steps').children;
  assert.equal(steps.length,5);
  assert.equal(steps[3].dataset.control,'approval');
  assert.equal(steps[3].children[1].children[0].textContent,'Sending a reply');
  assert.match(steps[3].children[1].children[1].textContent,/human approval required/);
  assert.equal(steps[4].children[1].children[0].textContent,'Record the decision and outcome');
});
test('unknown risk defaults to external approval, regeneration never duplicates steps',()=>{
  const h=createHarness();
  h.ids.get('task').value='Plan a review';
  assert.equal(h.plan(),true);
  assert.equal(h.ids.get('steps').children[3].children[1].children[0].textContent,'Any consequential external action');
  h.ids.get('risk').value='Issuing a payment';
  assert.equal(h.plan(),true);
  assert.equal(h.ids.get('steps').children.length,5);
  assert.equal(h.ids.get('steps').children[3].children[1].children[0].textContent,'Issuing a payment');
});
test('user HTML is retained as text and never interpolated as markup',()=>{
  const h=createHarness();
  const attacker='<img src=x onerror=alert(1)>';
  h.ids.get('task').value=attacker;
  h.ids.get('risk').value=attacker;
  assert.equal(h.plan(),true);
  assert.equal(h.ids.get('taskline').textContent,'Requested task: '+attacker);
  assert.equal(h.ids.get('steps').children[3].children[1].children[0].textContent,attacker);
  assert.doesNotMatch(match[1],/innerHTML\s*=|eval\s*\(/);
});
test('accessible input labels and reduced-motion support remain in markup',()=>{
  assert.match(html,/<label for="task">/);
  assert.match(html,/<label for="risk">/);
  assert.match(html,/aria-live="polite"/);
  assert.match(html,/@media\(max-width:680px\)/);
  assert.match(html,/prefers-reduced-motion/);
});
