import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/sim.js';
import {CITY_RELAY,SKYPORT,SKY_EXIT,PATROL_ROUTES,ARGON_ACCESS,ARGON_RETURN} from '../src/world.js';
import {sceneFor,ARCHIVE_SCENE,recap} from '../src/story.js';
import {jetModel,animateJet,programModel,animateProgram} from '../src/art.js';
const tick=(s,t,input={})=>{const events=[];for(let i=0;i<Math.ceil(t/.02)&&!s.dead&&!s.finished;i++)events.push(...M.advance(s,.02,input));return events};
test('every story sector has a short scene, a current objective and a resumable save',()=>{for(let chapter=0;chapter<=7;chapter++){const p={...M.newProfile('OLD CODE'),checkpoint:chapter,checkpointScore:1234},s=M.createRun({profile:p});assert(M.validProfile(s.profile));assert(sceneFor(chapter).shots.length);for(const shot of sceneFor(chapter).shots){assert(shot.text.length<320);assert.equal(shot.camera.length,3);assert.equal(shot.look.length,3)}assert(recap(s).length>40);assert.equal(s.chapter,chapter);if(chapter)assert.equal(s.score,1234)}assert(ARCHIVE_SCENE.shots.some(s=>s.text.includes('root key')))});
test('the former refuge ending becomes the city midpoint and preserves old character progress',()=>{const legacy={name:'CIRCUIT',color:'violet',checkpoint:3,cleared:true,flynnFound:true,bestDisc:50,bestCycle:60,checkpointScore:5000};assert(M.validProfile(legacy));const s=M.createRun({profile:legacy});assert(s.archiveRead);assert(!s.finished);assert(!s.profile.cleared);s.player.x=M.REFUGE_EXIT.x;s.player.z=M.REFUGE_EXIT.z;M.advance(s,.02);assert.equal(s.chapter,4);assert.equal(s.profile.checkpoint,4);assert.equal(s.score,5000);assert.equal(s.profile.name,'CIRCUIT');assert(s.citizens.length>=7);assert.equal(s.enemies.length,3);assert(s.events.some(e=>e.kind==='checkpoint'))});
test('city relay gates the skyport, then hands off to a playable jet rather than ending the story',()=>{const s=M.createRun({profile:{...M.newProfile(),checkpoint:4}});s.player.x=SKYPORT.x;s.player.z=SKYPORT.z;M.advance(s,.02);assert.equal(s.chapter,4,'skyport is locked before the relay');s.player.x=CITY_RELAY.x;s.player.z=CITY_RELAY.z;assert(!M.canAccessRelay(s));s.enemies=[];
 for(const tap of ARGON_ACCESS){Object.assign(s.player,{x:tap.x,z:tap.z});assert(M.act(s,'interact'));tick(s,.4)}
 assert(M.canAccessRelay({...s,player:{...s.player,...CITY_RELAY}}));Object.assign(s.player,CITY_RELAY);assert(M.act(s,'interact'));tick(s,.4);assert(s.relayHacked);assert(s.profile.relayHacked);assert(!s.finished);s.player.x=SKYPORT.x;s.player.z=SKYPORT.z;M.advance(s,.02);assert.equal(s.chapter,4,'walking near a jet does not board it');assert(M.canBoardJet(s));assert(M.act(s,'interact'));tick(s,.4);assert.equal(s.chapter,5);assert(s.player.y>0);assert(s.cores.length===3);assert(s.enemies.every(e=>e.type==='jet'));assert.equal(s.profile.checkpoint,5)});
test('an active patrol alert does not lock the override, and the unlocked route rises above street props',()=>{
 const s=M.createRun({profile:{...M.newProfile(),checkpoint:4,argonAccess:1}});
 const override=ARGON_ACCESS[1];
 Object.assign(s.player,{x:override.x,z:override.z});
 s.alerted=true;
 assert.equal(M.campaignInteraction(s)?.label,'JAM');
 assert(M.act(s,'interact'));
 s.enemies=[];
 tick(s,.4);assert.equal(s.argonStage,2);
 tick(s,3.35,{z:-1});assert.equal(s.player.y,8);
 tick(s,.28,{x:-1});assert(s.profile.serviceCache);
 const resumed=M.createRun({profile:s.profile});
 assert(resumed.profile.serviceCache);assert.equal(resumed.argonStage,2);
 tick(s,3,{z:-1});assert.equal(s.player.y,0);assert(!s.onBridge);
});
test('real buildings block patrol sight, crouching slows detection, and a spotted player can break contact',()=>{
 const make=()=>{const s=M.createRun({mode:'city'});s.citizens=[];s.enemies=[{...s.enemies[0],x:0,z:20,yaw:Math.PI,route:[{x:0,z:20},{x:0,z:19}],waypoint:1,path:[],pathTime:0}];s.player.x=0;s.player.z=12;return s};
 const standing=make(),crouched=make();tick(standing,.6);tick(crouched,.6,{crouch:true});assert(standing.exposure>crouched.exposure);assert(crouched.player.crouching);tick(standing,.7);assert(standing.alerted);standing.player.x=-37;standing.player.z=25;assert(!M.clearLine(standing,standing.enemies[0],standing.player));tick(standing,6);assert(!standing.alerted);assert(standing.exposure<.1);
 const cover=make();cover.enemies[0].x=0;cover.enemies[0].z=25;cover.player.x=-37;cover.player.z=25;tick(cover,1);assert(cover.exposure<.1);assert(!cover.alerted);
});
test('city paths, patrol waypoints and both mission terminals have usable collision-free routes',()=>{const s=M.createRun({mode:'city'});for(const route of PATROL_ROUTES)for(const point of route)assert(M.walkable(s,point.x,point.z));const path=[{x:0,z:73},{x:0,z:46},{x:-37,z:46},{x:-32,z:4},{x:-32,z:-39},CITY_RELAY];for(let i=1;i<path.length;i++){const route=M.routeTo(s,path[i-1],path[i]);assert(route.length,JSON.stringify(path[i]));let last=path[i-1];for(const point of route){assert(M.clearLine(s,last,point,.7));last=point}}assert(M.walkable(s,CITY_RELAY.x,CITY_RELAY.z));assert(M.dist(SKYPORT,{x:37,z:-73})<5)});
test('tank reticle ray matches the first surface hit and can identify a clear armored target',()=>{const s=M.createRun({mode:'tank'});s.player.x=-20;s.player.z=38;s.player.turretYaw=Math.PI;s.enemies=[{id:'target',x:-20,z:0,hp:160,alive:true}];let aim=M.aimSolution(s);assert(aim.blocked);assert.equal(aim.target,null);assert(aim.point.z>30);s.player.x=0;s.player.z=20;s.enemies[0].x=0;aim=M.aimSolution(s);assert(!aim.blocked);assert.equal(aim.target.id,'target');assert(Math.abs(aim.point.z-2.5)<.001);s.player.turretYaw=Math.PI/2;assert.equal(M.aimSolution(s).target,null)});
test('light jet has true altitude, banked steering, boost/brake, and three-dimensional weapon damage',()=>{const s=M.createRun({mode:'jet'});s.enemies=[];s.cores=[{id:'core',type:'uplink',x:0,y:38,z:70,hp:130,maxHp:130,alive:true}];assert.equal(M.flightTarget(s)?.id,'core');tick(s,.3,{climb:1,steer:.3,boost:true,attack:true});assert(s.player.y>38);assert(s.player.yaw<Math.PI);assert(s.player.speed>27);assert(s.player.energy<100);tick(s,1,{attack:true});assert(s.cores[0].hp<130);const speed=s.player.speed;tick(s,.4,{brake:true});assert(s.player.speed<speed);assert(s.player.y>=18&&s.player.y<=90);assert(M.pointSegment3({x:0,y:40,z:5},{x:0,y:40,z:0},{x:0,y:40,z:10})<.01);assert(M.pointSegment3({x:0,y:50,z:5},{x:0,y:40,z:0},{x:0,y:40,z:10})>9)});
test('the air battle leads to the reserve, bridge isolation and registry restoration',()=>{
 const s=M.createRun({profile:{...M.newProfile(),checkpoint:5,checkpointScore:9000}});
 for(const core of s.cores)core.alive=false;
 M.advance(s,.02);assert(s.gate);assert(!s.finished);
 Object.assign(s.player,{...SKY_EXIT,yaw:0});M.advance(s,.02);
 assert.equal(s.chapter,6);assert(!s.profile.cleared);assert(!s.finished);
 assert(M.routeTo(s,ARGON_RETURN[0],ARGON_RETURN[1]).length);
 const use=point=>{Object.assign(s.player,{x:point.x,y:point.y||0,z:point.z});assert(M.act(s,'interact'));tick(s,.4)};
 use(ARGON_RETURN[0]);assert.equal(s.argonStage,1);
 Object.assign(s.player,ARGON_RETURN[1]);assert(!M.campaignInteraction(s));
 s.enemies.find(e=>e.id==='reserve-captain').alive=false;
 use(ARGON_RETURN[1]);assert.equal(s.argonStage,2);
 assert.equal(M.createRun({profile:s.profile}).argonStage,2);
 Object.assign(s.player,{x:0,y:0,z:8});tick(s,3.85,{z:-1});
 assert(Math.abs(s.player.y-9)<.05);
 assert(M.act(s,'interact'));tick(s,.4);assert.equal(s.argonStage,3);
 tick(s,4.3,{z:-1});assert.equal(s.player.y,0);assert(!s.onBridge);
 s.enemies.find(e=>e.id==='reserve-registry').alive=false;
 use(ARGON_RETURN[3]);assert(s.finished);assert(s.profile.cleared);
 M.enterChapter(s,6);assert(!s.finished);assert.equal(s.enemies.length,0);assert(M.objective(s).includes('free'));
 const practice=M.createRun({mode:'jet',profile:{...s.profile,checkpoint:4}});
 for(const c of practice.cores)c.alive=false;
 M.advance(practice,.02);assert(practice.finished);assert.equal(practice.profile.checkpoint,4);
});
test('a jet can cut an interceptor with its trail while another altitude clears the same path',()=>{
 const s=M.createRun({mode:'jet'});
 s.enemies=s.enemies.slice(0,1);
 Object.assign(s.enemies[0],{x:0,y:42,z:0,speed:24});
 s.trails=[{owner:'player',a:{x:-10,y:32,z:0},b:{x:10,y:32,z:0},born:0}];
 M.advance(s,.02);assert(s.enemies[0].alive);
 s.enemies[0].y=32;M.advance(s,.02);assert(!s.enemies[0].alive);
});
test('light jet and crouch poses stay finite through animated flight and cover movement',()=>{const jet=jetModel(),hero=programModel();for(let i=0;i<60;i++){animateJet(jet,1/60,{speed:44,turn:1.4,pitch:.3,boosting:true});animateProgram(hero,1/60,{speed:3,crouching:true})}for(const model of[jet,hero]){model.updateMatrixWorld(true);model.traverse(o=>{assert(o.matrixWorld.elements.every(Number.isFinite));if(o.geometry)assert(o.geometry.attributes.position.array.every(Number.isFinite))})}assert(hero.userData.rig.hips.position.y<.86);assert(jet.rotation.x<0);assert(Math.abs(jet.rotation.z)>.1)});

test('a tank shell hits the first actor even when the same frame also reaches a wall',()=>{
 const s=M.createRun({mode:'tank'});s.player.x=-20;s.player.z=42;s.player.yaw=s.player.turretYaw=Math.PI;
 s.enemies=[{...s.enemies[0],id:'near-rock',x:-17.51,z:34.7,hp:160,maxHp:160,alive:true,attack:100}];
 const aim=M.aimSolution(s);assert.equal(aim.target?.id,'near-rock');assert(Math.abs(aim.point.z-(34.7+Math.sqrt(2.5**2-2.49**2)))<.001);
 assert(M.act(s,'attack'));const shell=s.shells[0];shell.z=34.95;M.advance(s,.05,{throttle:0,aim:Math.PI,aimActive:true});
 assert.equal(s.enemies[0].hp,112,'the actor intersects before the rock face, so it takes the hit');assert.equal(s.shells.length,0);
 const hit=s.events.find(e=>e.kind==='explosion');assert(hit);assert(Math.abs(hit.z-aim.point.z)<.001);
});
test('manual tank heading stays independent from hull steering, and arena edges stop the reticle ray',()=>{
 const s=M.createRun({mode:'tank'});for(const e of s.enemies)e.attack=100;const aim=Math.PI-.6;
 tick(s,2.5,{steer:.4,throttle:0,aim,aimActive:true});assert(Math.abs(M.wrap(s.player.turretYaw-aim))<.001);assert(Math.abs(M.wrap(s.player.yaw-aim))>.2);
 s.player.x=50;s.player.z=60;s.player.turretYaw=Math.PI/2;const solution=M.aimSolution(s);assert(solution.blocked);assert(Math.abs(solution.point.x-(M.TANK_BOUNDS.x-.25))<.001);
});
test('flight navigation keeps pointing to a remaining uplink when every target is behind the aircraft',()=>{
 const s=M.createRun({mode:'jet'});s.player.yaw=0;s.enemies=[];assert.equal(M.flightTarget(s),null);
 let nav=M.navigationTarget(s);assert.equal(nav.point.id,'uplink-0');assert(nav.label.includes('01'));
 s.cores[0].alive=false;nav=M.navigationTarget(s);assert.equal(nav.point.id,'uplink-1');
 for(const core of s.cores)core.alive=false;M.advance(s,.02);nav=M.navigationTarget(s);assert.deepEqual(nav.point,SKY_EXIT);assert(nav.label.includes('RETURN'));
});
test('leaving the refuge is a playable journey and practice boarding preserves the campaign',()=>{
 const s=M.createRun({profile:{...M.newProfile(),checkpoint:3}});s.player.x=0;s.player.z=-7;assert(M.act(s,'interact'));tick(s,.4);assert(s.archiveRead);assert.equal(s.chapter,3);assert(M.objective(s).includes('service door'));
 tick(s,2,{z:1});assert.equal(s.chapter,3);tick(s,2,{z:1});assert.equal(s.chapter,4);
 const practice=M.createRun({mode:'city',profile:{...M.newProfile(),checkpoint:2}});practice.relayHacked=true;practice.player.x=SKYPORT.x;practice.player.z=SKYPORT.z;
 assert(M.act(practice,'interact'));tick(practice,.4);assert(practice.finished);assert.equal(practice.profile.checkpoint,2);
});
