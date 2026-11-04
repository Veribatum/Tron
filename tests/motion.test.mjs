import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../vendor/three.module.js';
import * as M from '../src/sim.js';
import {CLIPS,legAngles} from '../src/motion.js';
import {programModel,animateProgram,cycleModel,animateCycle,tankModel,animateTank,treadPoint} from '../src/art.js';
const tick=(s,t,input={})=>{for(let n=0;n<Math.ceil(t/.01);n++)M.advance(s,.01,input)};
const duel=()=>{const s=M.createRun({mode:'disc'});s.player.x=0;s.player.z=12;s.enemies=[{id:'test',x:0,z:10,yaw:0,type:'striker',hp:500,maxHp:500,alive:true,attack:100,stagger:0,windup:0,path:[],pathTime:0}];return s};
const near=(a,b,tolerance=.00001)=>assert(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);
test('melee damage arrives at contact, can miss a retreating target, and is canceled by dodge',()=>{
 const hit=duel();M.act(hit,'attack');tick(hit,CLIPS.slash1.impact-.02);assert.equal(hit.enemies[0].hp,500);tick(hit,.03);assert.equal(hit.enemies[0].hp,472);tick(hit,.3);assert.equal(hit.enemies[0].hp,472);
 const miss=duel();M.act(miss,'attack');miss.enemies[0].z=-2;tick(miss,.3);assert.equal(miss.enemies[0].hp,500);
 const canceled=duel();M.act(canceled,'attack');M.act(canceled,'dash');tick(canceled,.4);assert.equal(canceled.enemies[0].hp,500);assert.equal(canceled.player.pending,null);
});
test('a short step closes melee range, the next strike buffers, and dodging follows input',()=>{
 const s=duel();s.enemies[0].z=8;s.enemies[0].stagger=2;
 assert(M.act(s,'attack'));
 tick(s,.12);assert(s.player.z<11.2);assert.equal(s.enemies[0].hp,500);
 M.advance(s,.01,{attack:true});tick(s,.39);
 assert.equal(s.combo,2);assert.equal(s.enemies[0].hp,438);
 const start=s.player.x;M.advance(s,.01,{dash:true,x:1});
 assert(s.player.x>start);assert.equal(s.player.dashZ,0);
});
test('a disc exists only after release, uses the moving character position, and registers a catch',()=>{
 const s=duel();s.enemies[0].z=2;M.act(s,'attack');assert.equal(s.discs.length,0);assert.equal(s.player.anim,'throw');tick(s,.16,{x:1});assert.equal(s.discs.length,0);tick(s,.03,{x:1});assert.equal(s.discs.length,1);assert(s.discs[0].x>.5);assert.equal(s.discs[0].height,CLIPS.throw.muzzle[1]);tick(s,2);assert.equal(s.discs.length,0);assert(s.player.catchAge<2);
});
test('IK soles remain on the floor across running and every combat clip',()=>{
 const model=programModel();for(const clip of['',...Object.keys(CLIPS)])for(let frame=0;frame<60;frame++){
  animateProgram(model,1/60,{speed:clip?0:7,clip,age:frame/60*(CLIPS[clip]?.duration||1),moveZ:1});model.updateMatrixWorld(true);
  for(const side of['L','R']){const boot=model.userData.rig['ankle'+side].children[1],points=boot.geometry.attributes.position;for(let i=0;i<points.count;i++){const world=boot.localToWorld(new T.Vector3().fromBufferAttribute(points,i));assert(world.y>-.085,`${clip} sole penetrated the floor at ${world.y}`)}}
 }
});
test('two-link IK reaches a planted ankle and counter-rotates the boot',()=>{for(const[y,z]of[[-.88,0],[-.75,.4],[-.65,-.35]]){const a=legAngles(y,z);near(-.445*Math.cos(a.hip)-.45*Math.cos(a.hip+a.knee),y);near(-.445*Math.sin(a.hip)-.45*Math.sin(a.hip+a.knee),z);near(a.hip+a.knee+a.ankle,0)}});
test('rider hands stay on grips under boost, braking and bank, with feet on pegs',()=>{
 const bike=cycleModel();for(const state of[{speed:18,turn:0},{speed:31,turn:2,boosting:true},{speed:10,turn:-2,braking:true}]){for(let i=0;i<20;i++)animateCycle(bike,1/60,state);bike.updateMatrixWorld(true);for(const side of['L','R']){const sign=side==='L'?-1:1,hand=bike.userData.rider.userData.rig['hand'+side].getWorldPosition(new T.Vector3()),goal=bike.localToWorld(new T.Vector3(sign*.31,.91,.53));assert(hand.distanceTo(goal)<.003);const foot=bike.userData.rider.userData.rig['ankle'+side].getWorldPosition(new T.Vector3()),peg=bike.localToWorld(new T.Vector3(sign*.29,.325,-.35));assert(foot.distanceTo(peg)<.04)}}
});
test('cycle lean and tread travel have the same result at 30 and 120 FPS; tank steering counter-rotates its tracks',()=>{
 const run=hz=>{const bike=cycleModel(),tank=tankModel();for(let i=0;i<hz;i++){animateCycle(bike,1/hz,{speed:20,turn:1.6});animateTank(tank,1/hz,{speed:8,turn:1,turretYaw:.4,yaw:.2})}return{bank:bike.rotation.z,travel:tank.userData.trackTravel,wheel:bike.userData.wheels[0].rotation.x}};
 const a=run(30),b=run(120);near(a.bank,b.bank);near(a.wheel,b.wheel);near(a.travel[0],b.travel[0]);near(a.travel[1],b.travel[1]);const tank=tankModel();animateTank(tank,.1,{speed:0,turn:1});assert(tank.userData.trackTravel[0]<0);assert(tank.userData.trackTravel[1]>0);
 const length=7+Math.PI*.84;for(const t of[0,.2,2,4,8]){const p=treadPoint(t),q=treadPoint(t+length);near(p.z,q.z);near(p.y,q.y)}
});
test('paused animation does not advance bones, wheel rotation, or the tank tread phase',()=>{
 const model=programModel(),bike=cycleModel(),tank=tankModel();animateProgram(model,.05,{speed:7});animateCycle(bike,.05,{speed:20,turn:1});animateTank(tank,.05,{speed:8});const before={leg:model.userData.rig.legL.rotation.x,phase:model.userData.motion.phase,wheel:bike.userData.wheels[0].rotation.x,treads:[...tank.userData.trackTravel]};for(let i=0;i<60;i++){animateProgram(model,0,{speed:7});animateCycle(bike,0,{speed:20,turn:1});animateTank(tank,0,{speed:8})}near(model.userData.rig.legL.rotation.x,before.leg);near(model.userData.motion.phase,before.phase);near(bike.userData.wheels[0].rotation.x,before.wheel);assert.deepEqual(tank.userData.trackTravel,before.treads);
});
