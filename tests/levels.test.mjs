import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/sim.js';
import {sceneFor} from '../src/story.js';
import {LEVELS,roadPoint,nearestRoad,FLIGHT_APPROACH} from '../src/levels.js';
const run=chapter=>M.createRun({profile:{...M.newProfile('EXPLORER'),checkpoint:chapter}});
function followFoot(s,chapter,max=5000){
 const stages=new Set();for(let i=0;i<max&&!s.dead&&s.chapter===chapter&&(!M.isVehicle(s));i++){
  stages.add(s.levelStage);const goal=M.navigationTarget(s).point,dx=goal.x-s.player.x,dz=goal.z-s.player.z,n=Math.hypot(dx,dz)||1,interaction=M.campaignInteraction(s);
  M.advance(s,.04,{x:dx/n,z:dz/n,attack:!interaction,interact:!!interaction,pulse:s.player.hp<55});
 }assert(!s.dead,'a combat-capable route through the authored level is survivable');return stages;
}
function followRoad(s,max=6000){
 const chapter=s.chapter;for(let i=0;i<max&&!s.dead&&!s.onFoot;i++){
  const p=s.player,near=nearestRoad(s.levelMap,p),goal=roadPoint(s.levelMap,near.s+(chapter===1?12:9)),angle=M.wrap(Math.atan2(goal.x-p.x,goal.z-p.z)-p.yaw),nav=M.navigationTarget(s),power=nav.label.includes('POWER')?s.enemies.find(e=>e.alive&&e.type==='power'&&M.dist(e,nav.point)<1):null,target=power||M.targetOf(s);
  M.advance(s,.04,{throttle:1,steer:M.clamp(-angle*(chapter===1?2:1.9),-1,1),brake:chapter===1&&Math.abs(angle)>.7,attack:true,pulse:chapter===2,aim:target?Math.atan2(target.x-p.x,target.z-p.z):p.yaw,aimActive:!!target});
 }assert(!s.dead);assert(s.onFoot,'the winding road reaches a usable dismount point');
}
test('authored campaign floors form rooms, corridors and long winding roads, separate from arena practice',()=>{
 for(let chapter=0;chapter<3;chapter++){const s=run(chapter),arena=M.createRun({mode:['disc','cycle','tank'][chapter]});assert(s.levelMap);assert(!arena.levelMap);assert(M.walkable(s,s.player.x,s.player.z));assert(s.levelMap.walls.length>30);assert(s.levelMap.floor.size>600);if(chapter){assert(s.levelMap.routeLength>550);let yaw=0;for(let i=1;i<s.levelMap.road.length;i++)yaw+=Math.abs(M.wrap(roadPoint(s.levelMap,s.levelMap.road[i].s).yaw-roadPoint(s.levelMap,s.levelMap.road[i-1].s).yaw));assert(yaw>Math.PI*2,'multiple bends replace a flat arena') }}
 const s=run(0);assert(!M.clearLine(s,s.player,LEVELS[0].stages[0].point));assert(!M.walkable(s,40,80),'solid space beside the coolant spine is not walkable');
});
test('archive doors have matching collision and cannot be bypassed by A* through thin barriers',()=>{
 const s=run(0);assert(!M.walkable(s,0,6));s.levelStage=2;assert(M.walkable(s,0,6));s.levelStage=3;assert.equal(M.routeTo(s,{x:12,z:-152},{x:68,z:-148}).length,0);s.levelStage=4;assert(M.routeTo(s,{x:12,z:-152},{x:68,z:-148}).length);
 for(let stage=0;stage<LEVELS[0].stages.length;stage++){s.levelStage=stage;const {spawn,point}=LEVELS[0].stages[stage],path=M.routeTo(s,spawn,point);assert(path.length);let last=spawn;for(const q of path){assert(M.clearLine(s,last,q,.7));last=q}}
});
test('the whole opening traverses five objectives and boards a visible courier instead of clearing three waves',()=>{
 const s=run(0),stages=followFoot(s,0);assert.deepEqual([...stages],[0,1,2,3,4]);assert.equal(s.chapter,1);assert.equal(s.profile.checkpoint,1);assert(M.isCycle(s));assert(s.score>0);
 const q=run(0);M.advance(q,.02);q.enemies.forEach(e=>e.alive=false);for(let i=0;i<40;i++)M.advance(q,.05);assert.equal(q.chapter,0);assert.equal(q.levelStage,0);assert(!q.gate,'kills alone never teleport the campaign to the next vehicle');
});
test('mid-level checkpoints restore objectives, doors, character and records without resetting the level to its entrance',()=>{
 const s=run(0);for(let i=0;i<1000&&s.levelStage<2;i++){const goal=M.navigationTarget(s).point,n=M.dist(s.player,goal)||1,action=M.campaignInteraction(s);M.advance(s,.04,{x:(goal.x-s.player.x)/n,z:(goal.z-s.player.z)/n,attack:!action,interact:!!action})}assert.equal(s.levelStage,2);const p=JSON.parse(JSON.stringify(s.profile));p.bestCycle=4321;const resumed=M.createRun({profile:p});assert.equal(resumed.levelStage,2);assert.equal(resumed.profile.name,'EXPLORER');assert.equal(resumed.profile.bestCycle,4321);assert(M.walkable(resumed,0,6));assert(M.dist(resumed.player,LEVELS[0].stages[2].spawn)<.01);assert(M.objective(resumed).includes('manifest'));
});
test('the highway is drivable end to end, has moving pursuers, and hands off to an on-foot Grid entrance',()=>{
 const s=run(1);followRoad(s);assert(s.roadS>550);assert.equal(s.chapter,1);assert(!M.isVehicle(s));assert.equal(s.profile.levelSave.onFoot,true);assert(s.ridersSpawned.size>=3);assert(s.enemies.every(e=>['disc','striker'].includes(e.type)));const saved=JSON.parse(JSON.stringify(s.profile)),resume=M.createRun({profile:saved});assert(resume.onFoot);assert(!M.isVehicle(resume));assert(M.objective(resume).includes('Light Cycle Grid'));followFoot(s,1,1000);assert.equal(s.chapter,7);assert(M.isCycle(s));assert(!M.act(s,'attack'));for(const rider of s.enemies)rider.alive=false;M.advance(s,.02);assert(s.gate);M.chooseArena(s,'continue');assert.equal(s.chapter,7);assert.equal(s.profile.gridHeat,1);assert.equal(s.enemies.length,4);assert(M.coverOf(s).length);
 for(const rider of s.enemies)rider.alive=false;M.advance(s,.02);M.chooseArena(s,'leave');
 assert.equal(s.chapter,2);assert(M.isTank(s));
});
test('the aqueduct requires real cannon hits on power cores, opens matching gates and ends at a walkable refuge entrance',()=>{
 const s=run(2);assert.equal(M.campaignDoors(s).length,2);followRoad(s);assert.equal(s.powersDown.size,2);assert.equal(M.campaignDoors(s).length,0);assert(!M.isVehicle(s));assert(M.objective(s).includes('refuge'));followFoot(s,2,1000);assert.equal(s.chapter,3);assert(M.canAccessArchive({...s,player:{...s.player,...M.ARCHIVE}}));assert(!s.profile.flynnFound);
});
test('route saves and optional identity caches survive reloads while old sector saves migrate onto real levels',()=>{
 const s=run(0);s.player.x=46;s.player.z=32;M.advance(s,.02);assert(s.shardsFound.has('engineer'));assert.equal(s.profile.levelSave.shards.length,1);const q=M.createRun({profile:JSON.parse(JSON.stringify(s.profile))});assert(!q.levelShards.some(x=>x.id==='engineer'));
 for(const chapter of[0,1,2]){const legacy={name:'OLD CODE',color:'violet',frame:'female',helmet:false,checkpoint:chapter,cleared:false,bestDisc:900,bestCycle:1300,bestTank:800};const migrated=M.createRun({profile:legacy});assert(migrated.levelMap);assert.equal(migrated.profile.name,'OLD CODE');assert.equal(migrated.profile.bestCycle,1300);assert.equal(migrated.profile.frame,'female');assert.equal(migrated.profile.helmet,false)}
});
test('the aerial mission has a navigable approach through channels before the uplinks',()=>{
 const s=run(5);assert.equal(M.navigationTarget(s).label,'SKYPORT DEPARTURE');s.player.x=FLIGHT_APPROACH[0].x;s.player.y=FLIGHT_APPROACH[0].y;s.player.z=FLIGHT_APPROACH[0].z;M.advance(s,.02);assert.equal(s.flightLeg,1);assert.equal(M.navigationTarget(s).label,'WEST MEMORY CHANNEL');
});

test('vehicle and refuge scenes refer to the route actually entered',()=>{assert(sceneFor(0).shots[0].text.includes('cell'));assert(sceneFor(1).shots.some(q=>q.text.includes('bridge')));assert(sceneFor(2).shots.some(q=>q.text.includes('aqueduct')));assert(sceneFor(3).shots[0].text.includes('terminal'));assert(sceneFor(0).shots.every(q=>q.camera[1]<6))});

test('keyboard movement follows archive corners without skipping a required waypoint beside a column',()=>{const s=run(0);for(let i=0;i<2200&&!s.dead&&s.chapter===0;i++){const goal=M.navigationTarget(s).point,dx=goal.x-s.player.x,dz=goal.z-s.player.z,x=Math.abs(dx)>.18?Math.sign(dx):0,z=Math.abs(dz)>.18?Math.sign(dz):0;for(let j=0;j<3&&s.chapter===0;j++){const interaction=M.campaignInteraction(s);M.advance(s,.04,{x,z,attack:!interaction,interact:!!interaction,pulse:s.player.hp<50})}}assert(!s.dead);assert.equal(s.chapter,1,JSON.stringify({stage:s.levelStage,player:s.player,nav:M.navigationTarget(s)}))});
