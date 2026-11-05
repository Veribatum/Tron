import test from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/sim.js';
import {CYCLE_CIRCUIT,JET_CIRCUIT} from '../src/arenas.js';
const won=s=>{for(const e of [...s.enemies,...s.cores])e.alive=false;return M.advance(s,.02);};
test('both four-match championships progress, bank ranks and preserve campaign checkpoints',()=>{
 for(const kind of ['cycle','jet']){
  const profile={...M.newProfile(),checkpoint:4,checkpointScore:7200,levelSave:{chapter:4},cleared:false},s=M.createRun({mode:kind+'-cup',profile});
  for(let round=0;round<4;round++){
   assert.equal(M.arenaRound(s),round);assert(s.enemies.length>=3);assert(M.isVehicle(s));assert(M.boundsOf(s));assert(Number.isFinite(s.player.x+s.player.y+s.player.z));
   assert.equal(M.isJet(s),kind==='jet');assert(M.objective(s).includes('Match '+(round+1)+'/4'));
   assert(won(s).some(e=>e.kind==='arenaoffer'));const score=s.score;
   assert(s.arenaOffer);assert(!s.finished);assert.equal(s.profile[kind+'Rank'],round+1);
   M.advance(s,1,{attack:true,steer:1});assert.equal(s.score,score);assert(s.arenaOffer);
   if(round<3){assert(M.chooseArena(s,'continue').some(e=>e.kind==='levelcheckpoint'));assert(!s.arenaOffer);assert.equal(s.player.hp,100);assert.equal(s.trails.length,0);}else{assert.deepEqual(M.chooseArena(s,'continue'),[]);M.chooseArena(s,'leave');assert(s.finished);}
  }
  assert.equal(s.profile.checkpoint,4);assert.equal(s.profile.checkpointScore,7200);assert.deepEqual(s.profile.levelSave,profile.levelSave);assert(!s.profile.cleared);assert.equal(s.profile[kind+'CupRound'],0);
 }
});
test('campaign arena victory can immediately unlock the next mission or restore the choice after reload',()=>{
 for(const [chapter,next]of [[7,2],[9,6]]){
  const s=M.createRun({profile:{...M.newProfile(),checkpoint:chapter,checkpointScore:4200}});won(s);const score=s.score;
  const resumed=M.createRun({profile:JSON.parse(JSON.stringify(s.profile))});assert(resumed.arenaOffer);assert.equal(resumed.score,score);M.advance(resumed,.05);assert.equal(resumed.score,score);
  M.chooseArena(resumed,'leave');assert.equal(resumed.chapter,next);assert.equal(resumed.profile.checkpoint,next);assert(!resumed.profile.arenaWon);assert(!resumed.finished);
  M.chooseArena(s,'continue');assert.equal(M.arenaRound(s),1);assert(!s.profile.arenaWon);const continued=M.createRun({profile:s.profile});assert.equal(M.arenaRound(continued),1);assert(!continued.arenaOffer);
 }
});
test('saved circuit progress resumes independently of story heat and invalid round values are normalized',()=>{
 for(const kind of ['cycle','jet'])for(const [saved,expected]of [[2,2],[-1,0],[99,0],['2',0],[null,0]]){
  const s=M.createRun({mode:kind+'-cup',profile:{...M.newProfile(),checkpoint:8,gridHeat:3,jetHeat:3,[kind+'CupRound']:saved}});assert.equal(M.arenaRound(s),expected);assert.equal(s.profile.checkpoint,8);assert(M.validProfile(s.profile));
 }
});
test('cycle layouts differ, all vehicle spawns clear obstacles, and relay siege requires both objectives',()=>{
 assert.equal(new Set(CYCLE_CIRCUIT.map(q=>JSON.stringify(q.cover))).size,4);assert.equal(new Set(JET_CIRCUIT.map(q=>JSON.stringify(q.cover))).size,4);
 for(const kind of ['cycle','jet'])for(let round=0;round<4;round++){
  const s=M.createRun({mode:kind+'-cup',profile:{...M.newProfile(),[kind+'CupRound']:round}});
  for(const a of[s.player,...s.enemies]){
   if(kind==='cycle')assert(M.walkable(s,a.x,a.z,1),JSON.stringify(a));
   else assert(!M.skyTowersOf(s).some(o=>a.y<o.h+2&&Math.abs(a.x-o.x)<o.w+2&&Math.abs(a.z-o.z)<o.d+2));
  }
  if(kind==='jet'&&round===2){assert.equal(s.cores.length,2);s.enemies.forEach(e=>e.alive=false);M.advance(s,.02);assert(!s.arenaOffer);s.cores.forEach(e=>e.alive=false);M.advance(s,.02);assert(s.arenaOffer);}
 }
});
test('jet arena ribbons kill at their actual altitude and cannon fire damages interceptors',()=>{
 const s=M.createRun({mode:'jet-cup'}),e=s.enemies[0];Object.assign(e,{x:0,y:38,z:95,yaw:0,speed:0,fire:99});s.enemies=[e];assert.equal(M.flightTarget(s),e);
 for(let i=0;i<30;i++)M.advance(s,.02,{attack:true});assert(e.hp<e.maxHp);assert(s.score>0);
 const t=M.createRun({mode:'jet-cup'}),r=t.enemies[0];Object.assign(r,{x:20,y:40,z:0,yaw:0,speed:0,fire:99});t.enemies=[r];t.trails=[{id:99,owner:'player',a:{x:16,y:40,z:0},b:{x:24,y:40,z:0},born:0}];M.advance(t,.02);assert(!r.alive);assert(t.arenaOffer);
});
