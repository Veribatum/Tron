export const VERSION=1;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const forward=a=>({x:Math.sin(a),z:Math.cos(a)});
export const DISC_BOUNDS={x:35,z:42},CYCLE_BOUNDS={x:90,z:67};
export const COVER=[{x:-13,z:0,w:2.4,d:8},{x:13,z:0,w:2.4,d:8},{x:0,z:-13,w:4,d:3},{x:-22,z:-23,w:3,d:3},{x:22,z:-23,w:3,d:3}];
const palette=['cyan','white','violet'];
export function rng(seed){let n=seed>>>0;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function newProfile(name='RUNNER',color='cyan'){return{name:String(name).trim().slice(0,20)||'RUNNER',color:palette.includes(color)?color:'cyan',checkpoint:0,cleared:false,bestDisc:0,bestCycle:0}}
export function validProfile(p){return!!p&&typeof p.name==='string'&&p.name.length<=20&&palette.includes(p.color)&&[0,1].includes(p.checkpoint)&&typeof p.cleared==='boolean'&&['bestDisc','bestCycle'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<1e9)}
export function createRun({mode='story',profile=newProfile(),seed=7319}={}){
 const s={mode:['story','disc','cycle'].includes(mode)?mode:'story',profile:structuredClone(profile),seed:seed>>>0,random:rng(seed),chapter:mode==='cycle'||mode==='story'&&profile.checkpoint===1?1:0,time:0,score:mode==='story'&&profile.checkpoint===1&&Number.isFinite(profile.checkpointScore)?profile.checkpointScore:0,kills:0,wave:0,enemies:[],discs:[],trails:[],pickups:[],events:[],serial:0,combo:0,comboTime:0,finished:false,dead:false,gate:false,waveDelay:0,shake:0};
 enterChapter(s,s.chapter);return s;
}
export function enterChapter(s,n){
 s.chapter=n;s.chapterTime=0;s.enemies=[];s.discs=[];s.trails=[];s.pickups=[];s.wave=0;s.gate=false;s.waveDelay=0;s.player={id:'player',x:0,z:n?42:26,yaw:Math.PI,hp:100,energy:100,attack:0,dash:0,pulse:0,invuln:0,stagger:0,action:0,speed:n?15:0,trailTime:0,trailStart:null,alive:true};
 if(n){for(let i=0;i<3;i++)s.enemies.push({id:'bike-'+i,type:'bike',x:(i-1)*32,z:-22-i%2*8,yaw:i%2?0:Math.PI/2,hp:70,alive:true,speed:15+i,fire:4+i,turn:0,trailTime:0,trailStart:null,age:0});if(s.mode==='story'){s.profile.checkpoint=1;s.profile.checkpointScore=s.score;emit(s,'checkpoint',{chapter:1});}emit(s,'message',{text:'LIGHT CYCLE ONLINE · cut their trails, break the pursuit.'})}
 else spawnWave(s);
}
const emit=(s,kind,data={})=>s.events.push({kind,...data});
export function walkable(s,x,z,r=.5){const b=s.chapter?CYCLE_BOUNDS:DISC_BOUNDS;if(Math.abs(x)>b.x-r||Math.abs(z)>b.z-r)return false;return !!s.chapter||!COVER.some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r)}
export function clearLine(s,a,b,r=.3){const n=Math.ceil(dist(a,b)/.45);for(let i=1;i<n;i++){const t=i/n;if(!walkable(s,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,r))return false}return true}
export function move(s,a,dx,dz){if(walkable(s,a.x+dx,a.z))a.x+=dx;if(walkable(s,a.x,a.z+dz))a.z+=dz}
export function routeTo(s,a,b){
 if(clearLine(s,a,b,.7))return[b];const nodes=[a,b];for(const o of COVER)for(const x of[-1,1])for(const z of[-1,1]){const p={x:o.x+x*(o.w+1.1),z:o.z+z*(o.d+1.1)};if(walkable(s,p.x,p.z,.7))nodes.push(p)}
 const costs=nodes.map(()=>Infinity),done=new Set(),prev=[];costs[0]=0;for(let n=0;n<nodes.length;n++){let u=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(u<0||costs[i]<costs[u]))u=i;if(u<0||!Number.isFinite(costs[u]))break;if(u===1){const out=[];for(let i=1;i>0;i=prev[i])out.unshift(nodes[i]);return out}done.add(u);for(let j=0;j<nodes.length;j++)if(!done.has(j)&&clearLine(s,nodes[u],nodes[j],.7)){const next=costs[u]+dist(nodes[u],nodes[j]);if(next<costs[j]){costs[j]=next;prev[j]=u}}}return[];
}
function spawnWave(s){s.wave++;const positions=[[-22,15],[22,14],[0,-27],[-28,-9],[28,-12]];for(let i=positions.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]]}const count=s.wave===1?2:s.wave===2?3:4;s.enemies=positions.slice(0,count).map(([x,z],i)=>({id:'guard-'+s.wave+'-'+i,type:s.wave===3&&i===3?'sentinel':i%2?'striker':'disc',x,z,yaw:0,hp:s.wave===3&&i===3?140:55+s.wave*8,maxHp:s.wave===3&&i===3?140:55+s.wave*8,alive:true,attack:1.5+i*.5,windup:0,stagger:0,action:0,path:[],pathTime:0,age:0}));emit(s,'wave',{wave:s.wave});}
export function targetOf(s){const p=s.player;return s.enemies.filter(e=>e.alive&&dist(p,e)<(s.chapter?48:34)&&clearLine(s,p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null}
export function act(s,action){
 if(s.dead||s.finished)return false;const p=s.player,target=targetOf(s);
 if(action==='attack'){
  if(p.attack>0||(!target||s.chapter||dist(p,target)>=3.2)&&s.discs.some(d=>d.owner==='player'))return false;p.attack=s.chapter?.6:.58;p.action=.42;
  if(!s.chapter&&target&&dist(p,target)<3.2){s.combo=s.comboTime>0?s.combo%3+1:1;s.comboTime=1.8;p.yaw=Math.atan2(target.x-p.x,target.z-p.z);hurt(s,target,22+s.combo*6,true);target.stagger=.5;emit(s,'slash',{x:p.x,z:p.z,yaw:p.yaw,combo:s.combo});}
  else{let yaw=p.yaw;if(target){yaw=Math.atan2(target.x-p.x,target.z-p.z);if(!s.chapter)p.yaw=yaw}s.discs.push({id:'disc-'+s.serial++,owner:'player',x:p.x,z:p.z,dx:Math.sin(yaw),dz:Math.cos(yaw),age:0,returning:false,bounces:0,hit:[],damage:s.chapter?28:32,speed:s.chapter?65:34});emit(s,'throw',{owner:'player',x:p.x,z:p.z})}return true;
 }
 if(action==='dash'&&!s.chapter&&p.dash<=0&&p.energy>=23){p.energy-=23;p.dash=1.8;p.invuln=.4;p.dashTime=.23;const d=forward(p.yaw);p.dashX=d.x;p.dashZ=d.z;emit(s,'dash',{x:p.x,z:p.z});return true}
 if(action==='pulse'&&!s.chapter&&p.pulse<=0&&p.energy>=40){p.energy-=40;p.pulse=9;p.action=.6;for(const e of s.enemies)if(e.alive&&dist(p,e)<9&&clearLine(s,p,e)){hurt(s,e,25,true);e.stagger=e.type==='sentinel'?.8:2.5}emit(s,'pulse',{x:p.x,z:p.z});return true}
 return false;
}
function hurt(s,a,n,playerHit=false){
 if(!a.alive||a.id==='player'&&a.invuln>0)return false;a.hp=Math.max(0,a.hp-n);if(a.id==='player'){a.invuln=.45;s.shake=.3;emit(s,'hurt',{x:a.x,z:a.z,amount:n})}else{a.action=.2;emit(s,'hit',{x:a.x,z:a.z,amount:n});if(playerHit){s.score+=Math.round(n);s.player.energy=clamp(s.player.energy+2,0,100)}}
 if(a.hp<=0){a.alive=false;emit(s,'derez',{x:a.x,z:a.z,bike:s.chapter===1,player:a.id==='player'});if(a.id==='player'){s.dead=true;emit(s,'defeat')}else{s.kills++;s.score+=s.chapter?350:a.type==='sentinel'?400:140;if(!s.chapter)s.pickups.push({id:'energy-'+s.serial++,x:a.x,z:a.z,age:0});}}
 return true;
}
function discsTick(s,dt){for(const d of s.discs){d.age+=dt;const from={x:d.x,z:d.z};if(d.owner==='player'&&(d.age>.67||d.returning)){d.returning=true;const n=dist(d,s.player)||1;d.dx=(s.player.x-d.x)/n;d.dz=(s.player.z-d.z)/n;if(n<1.2){d.gone=true;emit(s,'catch',{x:s.player.x,z:s.player.z});continue}}
  const nx=d.x+d.dx*d.speed*dt,nz=d.z+d.dz*d.speed*dt;if(!walkable(s,nx,nz,.15)){if(d.owner!=='player'){d.gone=true;continue}if(d.returning){d.x=nx;d.z=nz}else{if(!walkable(s,nx,d.z,.15))d.dx=-d.dx;else d.dz=-d.dz;d.bounces++;d.returning=d.bounces>1;emit(s,'ricochet',{x:d.x,z:d.z})}}else{d.x=nx;d.z=nz}
  const victims=d.owner==='player'?s.enemies:[s.player];for(const a of victims)if(a.alive&&!d.hit.includes(a.id)&&pointSegment(a,from,d)<(s.chapter?1.4:.95)){if(hurt(s,a,d.damage,d.owner==='player')){d.hit.push(a.id);if(d.owner!=='player')d.gone=true;else if(!s.chapter)a.stagger=.4}}
  if(d.age>2.8)d.gone=true;
 }s.discs=s.discs.filter(d=>!d.gone)}
function guardTick(s,e,dt){
 e.age+=dt;e.action=Math.max(0,e.action-dt);e.stagger=Math.max(0,e.stagger-dt);if(e.stagger>0)return;const p=s.player,d=dist(e,p);e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
 if(e.windup>0){e.windup-=dt;if(e.windup<=0){if(e.type==='disc'){const v=forward(e.yaw);s.discs.push({id:'disc-'+s.serial++,owner:e.id,x:e.x,z:e.z,dx:v.x,dz:v.z,age:0,hit:[],damage:15,speed:20});emit(s,'throw',{owner:e.id,x:e.x,z:e.z})}else if(d<3.4&&clearLine(s,e,p)){hurt(s,p,e.type==='sentinel'?26:18)}e.action=.4;e.attack=e.type==='sentinel'?1.7:2;emit(s,'enemyStrike',{x:e.x,z:e.z})}return}
 const reach=e.type==='disc'?14:2.5;if(d>reach||!clearLine(s,e,p)){
  e.pathTime-=dt;if(e.pathTime<=0||!e.path.length){e.path=routeTo(s,e,p);e.pathTime=.65}
  const goal=e.path[0];if(goal){const n=dist(e,goal)||1,step=Math.min(n,dt*(e.type==='sentinel'?3.2:4.2));move(s,e,(goal.x-e.x)/n*step,(goal.z-e.z)/n*step);if(n<.5)e.path.shift()}
 }else{e.attack-=dt;if(e.attack<=0){e.windup=e.type==='sentinel'?1.15:.8;emit(s,'windup',{x:e.x,z:e.z})}}
}
export function pointSegment(p,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=clamp(((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.z-a.z-dz*t)}
function orient(a,b,c){return(b.x-a.x)*(c.z-a.z)-(b.z-a.z)*(c.x-a.x)}
export function segmentsCross(a,b,c,d){const p=orient(a,b,c),q=orient(a,b,d),r=orient(c,d,a),t=orient(c,d,b);return p*q<0&&r*t<0}
function trailDanger(s,a,b,bike){for(const t of s.trails){if(t.owner===bike.id&&s.time-t.born<.9)continue;if(segmentsCross(a,b,t.a,t.b)||pointSegment(b,t.a,t.b)<.8)return true}return false}
function crash(s,bike){if(!bike.alive)return;hurt(s,bike,bike.hp,bike.id!=='player')}
function bikeTick(s,b,dt,input){
 if(!b.alive)return;const player=b.id==='player';b.age=(b.age||0)+dt;
 if(!player){let best=-Infinity,turn=0;const goal=s.player;for(const candidate of[-1,-.5,0,.5,1]){const yaw=b.yaw+candidate*.65,v=forward(yaw),ahead={x:b.x+v.x*9,z:b.z+v.z*9},near={x:b.x+v.x*4,z:b.z+v.z*4};const safe=walkable(s,ahead.x,ahead.z,2)&&!trailDanger(s,b,near,b)&&!trailDanger(s,near,ahead,b);const distance=dist(ahead,goal),score=(safe?1000:0)-distance*.5-Math.abs(candidate)*2+(candidate===b.turn?.5:0);if(score>best){best=score;turn=candidate}}b.turn=turn;b.yaw+=turn*dt*2.6;b.fire-=dt;const angle=Math.abs(wrap(Math.atan2(goal.x-b.x,goal.z-b.z)-b.yaw));if(b.fire<=0&&dist(b,goal)<45&&angle<.5){const v=forward(b.yaw);s.discs.push({id:'bike-disc-'+s.serial++,owner:b.id,x:b.x,z:b.z,dx:v.x,dz:v.z,age:0,hit:[],damage:18,speed:46});b.fire=3.5;emit(s,'throw',{owner:b.id,x:b.x,z:b.z})}}
 else{b.yaw-=clamp(input.steer||0,-1,1)*dt*2.15;const boost=!!input.boost&&b.energy>2;b.boosting=boost;b.energy=clamp(b.energy+dt*(boost?-26:12),0,100);const wanted=boost?31:input.brake?10:18;b.speed+=(wanted-b.speed)*Math.min(1,dt*3.5)}
 const from={x:b.x,z:b.z},v=forward(b.yaw),to={x:b.x+v.x*b.speed*dt,z:b.z+v.z*b.speed*dt};
 if(!walkable(s,to.x,to.z,.9)||b.age>1.4&&trailDanger(s,from,to,b)){crash(s,b);return}b.x=to.x;b.z=to.z;
 if(!b.trailStart)b.trailStart={...from};b.trailTime+=dt;if(dist(b,b.trailStart)>1.4){s.trails.push({id:s.serial++,owner:b.id,a:b.trailStart,b:{x:b.x,z:b.z},born:s.time});b.trailStart={x:b.x,z:b.z}}
}
export function advance(s,seconds,input={}){
 const dt=clamp(Number(seconds)||0,0,.05);s.events=[];if(s.dead||s.finished)return s.events;s.time+=dt;s.chapterTime+=dt;const p=s.player;s.shake=Math.max(0,s.shake-dt);for(const key of['attack','dash','pulse','invuln','action'])p[key]=Math.max(0,p[key]-dt);s.comboTime=Math.max(0,s.comboTime-dt);
 if(s.chapter){bikeTick(s,p,dt,input);for(const e of s.enemies)bikeTick(s,e,dt,input);s.trails=s.trails.filter(t=>s.time-t.born<16).slice(-1600)}
 else{p.energy=clamp(p.energy+dt*10,0,100);let x=input.x||0,z=input.z||0,n=Math.hypot(x,z);p.moving=n>.08;if(p.dashTime>0){p.dashTime-=dt;move(s,p,p.dashX*dt*23,p.dashZ*dt*23)}else if(p.moving){x/=Math.max(1,n);z/=Math.max(1,n);p.yaw=Math.atan2(x,z);move(s,p,x*dt*7,z*dt*7)}for(const e of s.enemies)if(e.alive)guardTick(s,e,dt);for(const orb of s.pickups){orb.age+=dt;if(dist(orb,p)<2){p.hp=clamp(p.hp+9,0,100);p.energy=clamp(p.energy+18,0,100);orb.gone=true;emit(s,'pickup',{x:orb.x,z:orb.z})}}s.pickups=s.pickups.filter(o=>!o.gone)}
 if(s.dead)return s.events;if(input.attack)act(s,'attack');if(input.dash)act(s,'dash');if(input.pulse)act(s,'pulse');discsTick(s,dt);if(s.dead)return s.events;
 if(s.enemies.every(e=>!e.alive)&&!s.gate){if(!s.chapter&&s.wave<3){s.waveDelay+=dt;if(s.waveDelay>1.6){s.waveDelay=0;spawnWave(s)}}else{s.gate=true;emit(s,'gate');if(s.mode!=='story')finish(s)}}
 if(s.mode==='story'&&s.gate&&dist(p,{x:0,z:s.chapter?-57:-36})<(s.chapter?6:3)){if(!s.chapter)enterChapter(s,1);else finish(s)}return s.events;
}
function finish(s){s.finished=true;if(s.chapter){s.profile.bestCycle=Math.max(s.profile.bestCycle,s.score);if(s.mode==='story')s.profile.cleared=true}else s.profile.bestDisc=Math.max(s.profile.bestDisc,s.score);emit(s,'victory')}
export function objective(s){if(s.chapter)return s.gate?'Reach the uplink at the far end of the arena':'Break the pursuit · '+s.enemies.filter(e=>e.alive).length+' cycles remaining';if(s.gate)return s.mode==='story'?'Reach the transit gate · your light cycle is waiting':'Disc arena cleared';return'Clear the quarantine · wave '+s.wave+' / 3'}
