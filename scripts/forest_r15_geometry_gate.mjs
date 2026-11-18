/** R15 deterministic geometry and source integrity gate. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {projectAtriumLight} from '../src/storybook/atrium-lighting.mjs';
const root=resolve(import.meta.dirname,'..');
const read=file=>readFileSync(resolve(root,file),'utf8');
const a=projectAtriumLight(0),b=projectAtriumLight(50),c=projectAtriumLight(100);
assert.equal(a.value,0);assert.equal(c.value,100);
assert.equal(projectAtriumLight(-100).value,0);assert.equal(projectAtriumLight(140).value,100);
for(const p of [a,b,c]) {
 assert.ok(p.left.core.includes('Z')&&p.right.core.includes('Z'));
 assert.ok(p.left.penumbra&&p.right.penumbra);
 assert.ok(p.reliefOpacity>=0&&p.reliefOpacity<=1);
 assert.ok(p.reliefRaking>=0&&p.reliefRaking<=1);
 assert.ok(p.beamX2>p.beamX1);
}
assert.ok(a.left.direction>0&&a.right.direction>0,'left lamp casts rightward shadows');
assert.ok(c.left.direction<0&&c.right.direction<0,'right lamp casts leftward shadows');
assert.ok(b.left.direction<0&&b.right.direction>0,'center lamp casts outward');
assert.ok(a.left.length<c.left.length,'distant left column shadow grows');
assert.ok(c.right.length<a.right.length,'distant right column shadow grows');
assert.notEqual(a.left.core,b.left.core);
assert.notEqual(b.left.core,c.left.core);
assert.notEqual(a.reliefBeamFrom,c.reliefBeamFrom);
const rootHtml=read('index.html'),nestedHtml=read('storybook/index.html');
const template='<template id="atrium-room-template">';
assert.equal(rootHtml.slice(rootHtml.indexOf(template)),nestedHtml.slice(nestedHtml.indexOf(template)),'room template parity');
for(const html of [rootHtml,nestedHtml]) {
 assert.ok(html.includes('src/storybook/atrium-room.js'));
 assert.ok(html.includes('data-portal-silhouette="pointed"'));
 assert.equal((html.match(/data-atrium-shadow="/g)||[]).length,4);
 assert.ok(html.includes('atrium-pencil-pressure')&&html.includes('atrium-relief-raking'));
 assert.ok(html.includes('class="atrium-clearing-shortcut"'));
 assert.ok(html.includes('data-open-concept="oracle"')&&html.includes('data-open-concept="archive"'));
}
const css=read('src/storybook/styles/atrium-room.css'),js=read('src/storybook/atrium-room.js');
assert.ok(css.includes('atrium-r15-enter')&&css.includes('atrium-column-sheen'));
assert.ok(js.includes('projectAtriumLight')&&js.includes('inertBefore'));
assert.ok(read('docs/forest/revision/r13/RENDERED-VISUAL-REVIEW.md').includes('NOT SIGNED OFF'));
console.log('PASS R15 geometry: two paritied templates, pointed portal, four distinct shadow paths, independent material and relief highlights, R13 frozen.');
