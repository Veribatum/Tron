import {LEVELS,LEVEL_VERSION,CELL,floorContains,floorRoute,roadPoint,nearestRoad,FLIGHT_APPROACH,WARDEN_FLOORS,WARDEN_PERMISSIONS,WARDEN_STAIRS} from './levels.js?v=11';
import {moveSpire,stairNavigation} from './spire.js?v=11';
import {CLIPS} from './motion.js?v=11';
import {CITY_BOUNDS,SKY_BOUNDS,CITY_COVER,CITY_ENTRY,CITY_RELAY,SKYPORT,REFUGE_EXIT,PATROL_ROUTES,CIVIC_ROUTES,SKY_TOWERS,SKY_CORES,SKY_EXIT,ARGON_ACCESS,ARGON_RETURN,ARGON_BRIDGE,ARGON_SERVICE_SPAN,ARGON_SERVICE_CACHE,ARGON_RECOVERY} from './world.js?v=11';
export {CITY_BOUNDS,SKY_BOUNDS,CITY_COVER,CITY_RELAY,SKYPORT,REFUGE_EXIT,SKY_TOWERS,SKY_EXIT};
export const VERSION=1;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const forward=a=>({x:Math.sin(a),z:Math.cos(a)});
export const DISC_BOUNDS={x:35,z:42},CYCLE_BOUNDS={x:90,z:67};
export const COVER=[{x:-13,z:0,w:2.4,d:8},{x:13,z:0,w:2.4,d:8},{x:0,z:-13,w:4,d:3},{x:-22,z:-23,w:3,d:3},{x:22,z:-23,w:3,d:3}];
export const TANK_BOUNDS={x:64,z:83},REFUGE_BOUNDS={x:15,z:22};
export const TANK_COVER=[{x:-20,z:22,w:7,d:10},{x:21,z:0,w:7,d:12},{x:-21,z:-29,w:9,d:8},{x:26,z:-46,w:8,d:7}];
export const REFUGE_COVER=[{x:-9,z:-4,w:2.5,d:4},{x:9,z:-4,w:2.5,d:4},{x:0,z:-10,w:2.1,d:.8}];
export const ARCHIVE={x:0,z:-7};
export const isCity=s=>s.chapter===4||s.chapter===6;
export const isCampaign=s=>s.mode==='story'&&!!s.levelMap;
export const isVehicle=s=>!s.onFoot&&(s.chapter===1||s.chapter===2||s.chapter===5||s.chapter===7);
export const isCycle=s=>(s.chapter===1||s.chapter===7)&&isVehicle(s);
export const isTank=s=>s.chapter===2&&isVehicle(s);
export const boundsOf=s=>s.levelMap?.bounds||[DISC_BOUNDS,CYCLE_BOUNDS,TANK_BOUNDS,REFUGE_BOUNDS,CITY_BOUNDS,SKY_BOUNDS,CITY_BOUNDS,CYCLE_BOUNDS][s.chapter];
export const campaignDoors=s=>s.levelMap?s.levelMap.doors.filter(d=>d.permission!==undefined?!s.towerPermissions?.has(d.permission):d.power?s.enemies.some(e=>e.id===d.power&&e.alive):s.levelStage<d.opensAt):[];
const gridPylons=[{x:-27,z:6,w:3,d:15,h:3},{x:27,z:6,w:3,d:15,h:3},{x:0,z:-35,w:8,d:3,h:3}];
const closedCityCover=[...CITY_COVER,{x:0,z:7,w:3,d:.2,h:3.1}];
export const coverOf=s=>s.levelMap?[...s.levelMap.cover,...campaignDoors(s)]:[COVER,[],TANK_COVER,REFUGE_COVER,CITY_COVER,[],s.argonStage<2&&!s.profile.cleared?closedCityCover:CITY_COVER,s.profile.gridHeat===1?gridPylons:[]][s.chapter];
export const gateOf=s=>s.levelMap?campaignNavigation(s).point:s.chapter===6?(s.profile.cleared?{x:-5,z:67}:returnTarget(s)):s.chapter===3?(s.archiveRead?REFUGE_EXIT:ARCHIVE):isCity(s)?(s.relayHacked||s.chapter===6?SKYPORT:CITY_RELAY):s.chapter===5?SKY_EXIT:({x:0,z:s.chapter===7?-57:[-36,-57,-73][s.chapter]});
const palette=['cyan','white','violet'];
export function rng(seed){let n=seed>>>0;return()=>{n+=0x6d2b79f5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
export function newProfile(name='RUNNER',color='cyan'){return{name:String(name).trim().slice(0,20)||'RUNNER',color:palette.includes(color)?color:'cyan',frame:'male',helmet:true,checkpoint:0,cleared:false,bestDisc:0,bestCycle:0,bestTank:0,bestJet:0,bestCity:0,storyVersion:4,levelSave:null,seenScenes:[]}}
export function validProfile(p){return!!p&&typeof p.name==='string'&&p.name.length<=20&&palette.includes(p.color)&&[0,1,2,3,4,5,6,7,8].includes(p.checkpoint)&&typeof p.cleared==='boolean'&&['bestDisc','bestCycle'].every(k=>Number.isFinite(p[k])&&p[k]>=0&&p[k]<1e9)&&(p.frame===undefined||['male','female'].includes(p.frame))&&(p.bestTank===undefined||Number.isFinite(p.bestTank)&&p.bestTank>=0&&p.bestTank<1e9)}
export function createRun({mode='story',profile=newProfile(),seed=7319}={}){
 const s={mode:['story','disc','cycle','tank','jet','city','spire'].includes(mode)?mode:'story',profile:{...newProfile(),...structuredClone(profile)},seed:seed>>>0,random:rng(seed),chapter:mode==='spire'?8:mode==='jet'?5:mode==='city'?4:mode==='tank'?2:mode==='cycle'?1:mode==='story'?profile.checkpoint:0,time:0,score:(mode==='spire'||mode==='story'&&(profile.checkpoint>0||profile.levelSave))&&Number.isFinite(profile.checkpointScore)?profile.checkpointScore:0,kills:0,wave:0,enemies:[],discs:[],shells:[],bolts:[],cores:[],citizens:[],trails:[],pickups:[],events:[],serial:0,combo:0,comboTime:0,finished:false,dead:false,gate:false,waveDelay:0,shake:0};
 if(s.mode==='story'&&s.chapter===6&&!(profile.storyVersion>=4)){
  s.profile.cleared=false;
  s.profile.seenScenes=(Array.isArray(profile.seenScenes)?profile.seenScenes:[]).filter(n=>n!==6);
 }
 if(s.mode==='story'&&s.chapter===6&&s.profile.cleared&&!s.profile.wardenCleared)s.chapter=8;
 if(s.mode==='story'&&s.chapter===8&&s.profile.wardenCleared)s.chapter=6;
 enterChapter(s,s.chapter);return s;
}
export function enterChapter(s,n){
 s.chapter=n;s.towerTransit=null;s.navCache=null;s.cityNav=null;s.argonStage=0;s.onBridge=false;s.levelMap=null;s.onFoot=false;s.levelStage=0;s.flightLeg=0;s.finished=false;s.dead=false;s.chapterTime=0;s.enemies=[];s.discs=[];s.shells=[];s.bolts=[];s.cores=[];s.citizens=[];s.trails=[];s.archiveRead=!!s.profile.flynnFound;s.relayHacked=isCity(s)&&!!s.profile.relayHacked;s.exposure=0;s.searchTime=0;s.cityAlarms=0;s.crouching=false;s.scanner={x:0,z:50};s.pickups=[];s.wave=0;s.gate=false;s.waveDelay=0;s.player={id:'player',x:n===6&&!s.profile.cleared?37:0,z:[26,42,65,16,73,145,s.profile.cleared?73:-69,42][n],y:n===5?38:0,pitch:0,yaw:Math.PI,turretYaw:Math.PI,hp:100,energy:100,attack:0,dash:0,pulse:0,shield:0,invuln:0,stagger:0,action:0,speed:n===1?15:n===5?26:0,trailTime:0,trailStart:null,alive:true};
 if(s.mode==='story'&&n<3)initCampaign(s);
 else if(n===8)initTower(s);
 else if(n===1||n===7)for(let i=0;i<(n===7&&s.profile.gridHeat===1?4:3);i++)s.enemies.push({id:'bike-'+i,type:'bike',x:(i-1)*32,z:-22-i%2*8,yaw:i%2?0:Math.PI/2,hp:70,maxHp:70,alive:true,speed:15+i,fire:4+i,turn:0,trailTime:0,trailStart:null,age:0});
 else if(n===2)for(const [i,x,z]of[[0,-35,5],[1,33,-27],[2,0,-55]])s.enemies.push({id:'tank-'+i,type:'tank',x,z,yaw:0,turretYaw:0,hp:160,maxHp:160,alive:true,speed:0,attack:2+i*.8,windup:0,action:0,path:[],pathTime:0,age:0});
 else if(n===4||n===6)spawnCity(s);
 else if(n===5)spawnSky(s);
 else if(n===0)spawnWave(s);
 if(n>0&&s.mode==='story'){s.profile.checkpoint=n;s.profile.checkpointScore=s.score;s.profile.storyVersion=4;if(n!==6)s.profile.cleared=false;emit(s,'checkpoint',{chapter:n})}
}
const emit=(s,kind,data={})=>s.events.push({kind,...data});
function playClip(a,clip,age=0){a.anim=clip;a.animAge=age;a.animId=(a.animId||0)+1}
function animationTick(a,dt){a.animAge=(a.animAge||0)+dt;a.hitAge=(a.hitAge??99)+dt;a.catchAge=(a.catchAge??99)+dt;if(a.anim&&a.animAge>CLIPS[a.anim]?.duration)a.anim=''}
function pendingTick(s,a){
 const pending=a.pending;if(!pending||!a.alive||a.animAge<pending.impact)return;a.pending=null;
 if(pending.kind==='throw'){
  const target=s.enemies.find(e=>e.id===pending.target&&e.alive),yaw=target?Math.atan2(target.x-a.x,target.z-a.z):pending.yaw,v=forward(yaw),side={x:Math.cos(yaw),z:-Math.sin(yaw)},muzzle=CLIPS.throw.muzzle;
  s.discs.push({id:'disc-'+s.serial++,owner:a.id,x:a.x+v.x*muzzle[2]+side.x*muzzle[0],z:a.z+v.z*muzzle[2]+side.z*muzzle[0],height:isCycle(s)?1.05:muzzle[1]+(s.levelMap?.elevation||0),dx:v.x,dz:v.z,age:0,returning:false,bounces:0,hit:[],damage:isCycle(s)?28:32,speed:isCycle(s)?65:34});emit(s,'throw',{owner:a.id,x:a.x,z:a.z});
 }else if(pending.kind==='melee'){
  const target=s.enemies.find(e=>e.id===pending.target&&e.alive);if(target&&dist(a,target)<3.5&&clearLine(s,a,target)){hurt(s,target,22+pending.combo*6,true);target.stagger=.5}emit(s,'slash',{x:a.x,y:s.levelMap?.elevation||0,z:a.z,yaw:a.yaw,combo:pending.combo});
 }else if(pending.kind==='pulse'){
  for(const e of s.enemies)if(e.alive&&dist(a,e)<9&&clearLine(s,a,e)){hurt(s,e,25,true);e.stagger=e.type==='sentinel'?.8:2.5}emit(s,'pulse',{x:a.x,y:(s.levelMap?.elevation||0)+.12,z:a.z});
 }else if(pending.kind==='level'){performCampaignAction(s,pending.id)}else if(pending.kind==='archive'&&canAccessArchive(s)){s.profile.flynnFound=true;s.archiveRead=true;s.gate=true;emit(s,'archive')}else if(pending.kind==='relay'&&canAccessRelay(s)){s.relayHacked=true;if(s.mode==='story')s.profile.relayHacked=true;s.score+=s.cityAlarms?300:800;if(s.mode==='story')s.profile.checkpointScore=s.score;emit(s,'relay')}else if(pending.kind==='board'&&canBoardJet(s)){if(s.mode==='story')enterChapter(s,5);else finish(s)}else if(pending.kind==='mara'){emit(s,'mara')}
}

export function walkable(s,x,z,r=.5){const b=boundsOf(s);if(s.levelMap&&!floorContains(s.levelMap,x,z,r))return false;if(Math.abs(x)>b.x-r||Math.abs(z)>b.z-r)return false;return !(s.levelMap?[...s.levelMap.props,...campaignDoors(s)]:coverOf(s)).some(o=>Math.abs(x-o.x)<o.w+r&&Math.abs(z-o.z)<o.d+r)}
export function clearLine(s,a,b,r=.3){const n=Math.ceil(dist(a,b)/.45);for(let i=1;i<n;i++){const t=i/n;if(!walkable(s,a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t,r))return false}return true}
export function move(s,a,dx,dz){
 if(a===s.player&&s.chapter===8){
  moveSpire(s,dx,dz,(x,z)=>walkable(s,x,z),index=>enterTowerDeck(s,index));
  return;
 }
 if(a===s.player&&s.onBridge&&s.chapter===4){
  const {x,width}=ARGON_SERVICE_SPAN;
  a.x=clamp(a.x+dx,x-width,x+width);a.z+=dz;return;
 }
 if(walkable(s,a.x+dx,a.z))a.x+=dx;
 if(walkable(s,a.x,a.z+dz))a.z+=dz;
}
export function routeTo(s,a,b){
 const radius=isTank(s)?2.5:.7;if(clearLine(s,a,b,radius))return[b];if(s.levelMap)return floorRoute(s.levelMap,a,b,(x,z,r)=>walkable(s,x,z,r),radius,(a,b,r)=>clearLine(s,a,b,r));const nodes=[a,b];for(const o of coverOf(s))for(const x of[-1,1])for(const z of[-1,1]){const p={x:o.x+x*(o.w+radius+.4),z:o.z+z*(o.d+radius+.4)};if(walkable(s,p.x,p.z,radius))nodes.push(p)}
 const costs=nodes.map(()=>Infinity),done=new Set(),prev=[];costs[0]=0;for(let n=0;n<nodes.length;n++){let u=-1;for(let i=0;i<nodes.length;i++)if(!done.has(i)&&(u<0||costs[i]<costs[u]))u=i;if(u<0||!Number.isFinite(costs[u]))break;if(u===1){const out=[];for(let i=1;i>0;i=prev[i])out.unshift(nodes[i]);return out}done.add(u);for(let j=0;j<nodes.length;j++)if(!done.has(j)&&clearLine(s,nodes[u],nodes[j],radius)){const next=costs[u]+dist(nodes[u],nodes[j]);if(next<costs[j]){costs[j]=next;prev[j]=u}}}return[];
}
function spawnWave(s){s.wave++;const positions=[[-22,15],[22,14],[0,-27],[-28,-9],[28,-12]];for(let i=positions.length-1;i>0;i--){const j=Math.floor(s.random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]]}const count=s.wave===1?2:s.wave===2?3:4;s.enemies=positions.slice(0,count).map(([x,z],i)=>({id:'guard-'+s.wave+'-'+i,type:s.wave===3&&i===3?'sentinel':i%2?'striker':'disc',x,z,yaw:0,hp:s.wave===3&&i===3?140:55+s.wave*8,maxHp:s.wave===3&&i===3?140:55+s.wave*8,alive:true,attack:1.5+i*.5,windup:0,stagger:0,action:0,path:[],pathTime:0,age:0}));emit(s,'wave',{wave:s.wave});}
const onCombatDeck=s=>s.chapter===8?!s.towerTransit:s.player.y<2.5;
export function targetOf(s){if(s.chapter===5)return flightTarget(s);const p=s.player;if(!onCombatDeck(s))return null;return s.enemies.filter(e=>e.alive&&dist(p,e)<(isTank(s)?72:isCycle(s)?48:34)&&clearLine(s,p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null}
export function canAccessArchive(s){return s.chapter===3&&!s.archiveRead&&dist(s.player,ARCHIVE)<3.2}
export function canAccessRelay(s){return s.chapter===4&&!s.relayHacked&&!cityAccessTarget(s)&&dist(s.player,CITY_RELAY)<3.6}
export function canBoardJet(s){return s.chapter===4&&s.relayHacked&&dist(s.player,SKYPORT)<6}
export function canTalkMara(s){return isCity(s)&&(s.chapter===4||s.profile.cleared&&!recoveryTarget(s))&&dist(s.player,{x:-5,z:67})<3.3}
export function act(s,action){
 if(s.dead||s.finished)return false;const p=s.player,target=targetOf(s);
 const levelAction=campaignInteraction(s);if(action==='interact'&&levelAction&&!p.pending){playClip(p,'interact');p.pending={kind:'level',id:levelAction.id,impact:CLIPS.interact.impact};return true}
 if(action==='interact'&&canAccessArchive(s)&&!p.pending){playClip(p,'interact');p.pending={kind:'archive',impact:CLIPS.interact.impact};return true}
 if(action==='interact'&&canAccessRelay(s)&&!p.pending){playClip(p,'interact');p.pending={kind:'relay',impact:CLIPS.interact.impact};return true}
 if(action==='interact'&&canBoardJet(s)&&!p.pending){playClip(p,'interact');p.pending={kind:'board',impact:CLIPS.interact.impact};return true}
 if(action==='interact'&&canTalkMara(s)&&!p.pending){playClip(p,'interact');p.pending={kind:'mara',impact:CLIPS.interact.impact};return true}
 if(s.chapter===5){if(action==='attack'&&p.attack<=0){p.attack=.16;fireBolt(s,p,true);return true}return false}
 if(s.chapter===3||(s.chapter===6&&s.profile.cleared&&!recoveryTarget(s))||s.chapter===7)return false;
 if(isTank(s)){
  if(action==='attack'&&p.attack<=0){p.attack=1.05;p.action=.35;fireShell(s,p,p.turretYaw,48);return true}
  if(action==='pulse'&&p.pulse<=0&&p.energy>=35){p.energy-=35;p.pulse=9;p.shield=2.8;emit(s,'shield',{x:p.x,z:p.z});return true}
  return false;
 }
 if(action==='attack'&&onCombatDeck(s)){
  if(p.attack>0||p.pending||(!target||isVehicle(s)||dist(p,target)>=3.2)&&s.discs.some(d=>d.owner==='player'))return false;
  if(!isVehicle(s)&&target&&dist(p,target)<3.2){s.combo=s.comboTime>0?s.combo%3+1:1;s.comboTime=1.8;p.yaw=Math.atan2(target.x-p.x,target.z-p.z);const clip='slash'+s.combo;playClip(p,clip);p.attack=CLIPS[clip].duration;p.pending={kind:'melee',target:target.id,combo:s.combo,impact:CLIPS[clip].impact};}
  else{const yaw=target?Math.atan2(target.x-p.x,target.z-p.z):p.yaw;if(!isVehicle(s))p.yaw=yaw;playClip(p,'throw');p.attack=.64;p.pending={kind:'throw',target:target?.id,yaw,impact:CLIPS.throw.impact};}return true;
 }
 if(action==='dash'&&!isVehicle(s)&&p.dash<=0&&p.energy>=23){p.energy-=23;p.dash=1.8;p.invuln=.4;p.dashTime=.23;p.pending=null;p.attack=Math.min(p.attack,.2);playClip(p,'dodge');const d=forward(p.yaw);p.dashX=d.x;p.dashZ=d.z;emit(s,'dash',{x:p.x,y:(p.y||0)+.12,z:p.z});return true}
 if(action==='pulse'&&onCombatDeck(s)&&!isVehicle(s)&&!p.pending&&p.pulse<=0&&p.energy>=40){p.energy-=40;p.pulse=9;playClip(p,'pulse');p.pending={kind:'pulse',impact:CLIPS.pulse.impact};return true}

 return false;
}
function hurt(s,a,n,playerHit=false){
 if(!a.alive||a.id==='player'&&a.invuln>0)return false;if(a.id==='player'&&a.shield>0)n*=.2;a.hp=Math.max(0,a.hp-n);a.hitAge=0;if(a.id==='player'){a.invuln=.45;s.shake=.3;emit(s,'hurt',{x:a.x,y:a.y??1,z:a.z,amount:n})}else{a.action=.2;a.windup=0;a.attack=Math.max(a.attack||0,.65);emit(s,'hit',{x:a.x,y:a.y||1,z:a.z,amount:n,byPlayer:playerHit,target:a.id});if(playerHit){s.score+=Math.round(n);s.player.energy=clamp(s.player.energy+2,0,100)}}
 if(a.hp<=0){a.alive=false;a.pending=null;playClip(a,'derez');emit(s,'derez',{x:a.x,y:a.y??.9,z:a.z,bike:isCycle(s),player:a.id==='player'});if(a.id==='player'){s.dead=true;emit(s,'defeat')}else{s.kills++;s.score+=isVehicle(s)?350:a.type==='sentinel'?400:140;if(!isVehicle(s))s.pickups.push({id:'energy-'+s.serial++,x:a.x,z:a.z,age:0});}}
 return true;
}
function discsTick(s,dt){for(const d of s.discs){d.age+=dt;const from={x:d.x,z:d.z};if(d.owner==='player'&&(d.age>.67||d.returning)){d.returning=true;const n=dist(d,s.player)||1;d.dx=(s.player.x-d.x)/n;d.dz=(s.player.z-d.z)/n;if(n<.75){d.gone=true;s.player.catchAge=0;emit(s,'catch',{x:s.player.x,z:s.player.z});continue}}
  const nx=d.x+d.dx*d.speed*dt,nz=d.z+d.dz*d.speed*dt;if(!walkable(s,nx,nz,.15)){if(d.owner!=='player'){d.gone=true;continue}if(d.returning){d.x=nx;d.z=nz}else{if(!walkable(s,nx,d.z,.15))d.dx=-d.dx;else d.dz=-d.dz;d.bounces++;d.returning=d.bounces>1;emit(s,'ricochet',{x:d.x,z:d.z})}}else{d.x=nx;d.z=nz}
  const victims=d.owner==='player'?s.enemies:[s.player];for(const a of victims)if(a.alive&&(s.chapter===8?!s.towerTransit:(a.y||0)<2.5)&&!d.hit.includes(a.id)&&pointSegment(a,from,d)<(s.chapter?1.4:.95)){if(hurt(s,a,d.damage,d.owner==='player')){d.hit.push(a.id);if(d.owner!=='player')d.gone=true;else if(!isVehicle(s))a.stagger=.4}}
  if(d.age>2.8)d.gone=true;
 }s.discs=s.discs.filter(d=>!d.gone)}
function guardTick(s,e,dt){
 e.age+=dt;e.action=Math.max(0,e.action-dt);e.stagger=Math.max(0,e.stagger-dt);if(e.stagger>0)return;const p=s.player,d=dist(e,p);e.yaw=Math.atan2(p.x-e.x,p.z-e.z);
 if(e.windup>0){e.windup-=dt;if(e.windup<=0){const clip=e.type==='disc'?'throw':e.type==='sentinel'?'slash3':'slash1';playClip(e,clip,CLIPS[clip].impact);if(e.type==='disc'){const v=forward(e.yaw);s.discs.push({id:'disc-'+s.serial++,owner:e.id,x:e.x,z:e.z,dx:v.x,dz:v.z,age:0,hit:[],damage:15,speed:20,height:(s.levelMap?.elevation||0)+1.37});emit(s,'throw',{owner:e.id,x:e.x,z:e.z})}else if(d<3.4&&clearLine(s,e,p)){hurt(s,p,e.type==='sentinel'?26:18)}e.action=.4;e.attack=e.type==='sentinel'?1.7:2;emit(s,'enemyStrike',{x:e.x,z:e.z})}return}
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
 if(!player&&s.levelMap){roadRiderTick(s,b,dt);return}
 if(!player){let best=-Infinity,turn=0;const goal=s.player;for(const candidate of[-1,-.5,0,.5,1]){const yaw=b.yaw+candidate*.65,v=forward(yaw),ahead={x:b.x+v.x*9,z:b.z+v.z*9},near={x:b.x+v.x*4,z:b.z+v.z*4};const safe=walkable(s,ahead.x,ahead.z,2)&&!trailDanger(s,b,near,b)&&!trailDanger(s,near,ahead,b);const distance=dist(ahead,goal),score=(safe?1000:0)-distance*.5-Math.abs(candidate)*2+(candidate===b.turn?.5:0);if(score>best){best=score;turn=candidate}}b.turn=turn;b.yaw+=turn*dt*2.6;b.fire-=dt;const angle=Math.abs(wrap(Math.atan2(goal.x-b.x,goal.z-b.z)-b.yaw));if(s.chapter!==7&&b.fire<=0&&dist(b,goal)<45&&angle<.5){const v=forward(b.yaw);s.discs.push({id:'bike-disc-'+s.serial++,owner:b.id,x:b.x,z:b.z,dx:v.x,dz:v.z,age:0,hit:[],damage:18,speed:46});b.fire=3.5;emit(s,'throw',{owner:b.id,x:b.x,z:b.z})}}
 else{b.yaw-=clamp(input.steer||0,-1,1)*dt*2.15;const boost=!!input.boost&&b.energy>2;b.boosting=boost;b.energy=clamp(b.energy+dt*(boost?-26:12),0,100);const wanted=boost?31:input.brake?10:18;b.speed+=(wanted-b.speed)*Math.min(1,dt*3.5)}
 const from={x:b.x,z:b.z},v=forward(b.yaw),to={x:b.x+v.x*b.speed*dt,z:b.z+v.z*b.speed*dt};
 if(!walkable(s,to.x,to.z,.9)||b.age>1.4&&trailDanger(s,from,to,b)){if(s.levelMap){hurt(s,b,12);const q=nearestRoad(s.levelMap,b);b.yaw+=wrap(q.yaw-b.yaw)*Math.min(1,dt*8);b.speed=Math.max(8,b.speed*.7);const pull=Math.min(1,dt*5);if(walkable(s,b.x+(q.x-b.x)*pull,b.z+(q.z-b.z)*pull,.9)){b.x+=(q.x-b.x)*pull;b.z+=(q.z-b.z)*pull}b.trailStart=null;return}crash(s,b);return}b.x=to.x;b.z=to.z;
 if(s.chapter===7&&s.gate)return;
 if(!b.trailStart)b.trailStart={...from};b.trailTime+=dt;if(dist(b,b.trailStart)>1.4){s.trails.push({id:s.serial++,owner:b.id,a:b.trailStart,b:{x:b.x,z:b.z},born:s.time});b.trailStart={x:b.x,z:b.z}}
}
function fireShell(s,a,yaw,damage){const v=forward(yaw);s.shells.push({id:'shell-'+s.serial++,owner:a.id,x:a.x+v.x*3.4,z:a.z+v.z*3.4,dx:v.x,dz:v.z,age:0,damage});emit(s,'cannon',{x:a.x+v.x*3.4,y:2.05,z:a.z+v.z*3.4,dx:v.x,dz:v.z,owner:a.id})}
function tankTick(s,t,dt,input={}){
 if(!t.alive||t.type==='power')return;if(s.levelMap&&t.id!=='player'&&dist(t,s.player)>82)return;t.action=Math.max(0,t.action-dt);const p=s.player;
 if(t.id==='player'){
  t.yaw-=clamp(input.steer||0,-1,1)*dt*1.05;const throttle=Number.isFinite(input.throttle)?clamp(input.throttle,-1,1):1,boost=input.boost&&t.energy>2;
  const wanted=(input.brake?0:throttle)*(boost?13:8);t.speed+=(wanted-t.speed)*Math.min(1,dt*3);t.energy=clamp(t.energy+dt*(boost?-18:9),0,100);t.boosting=boost;
  const locked=s.enemies.find(e=>e.id===p.lockTarget&&e.alive&&clearLine(s,p,e)),target=locked||s.enemies.filter(e=>e.alive&&dist(e,p)<100&&Math.abs(wrap(Math.atan2(e.x-p.x,e.z-p.z)-(input.aim??p.yaw)))<.9&&clearLine(s,p,e)).sort((a,b)=>dist(a,p)-dist(b,p))[0],aim=input.aimActive?input.aim:target?Math.atan2(target.x-t.x,target.z-t.z):Number.isFinite(input.aim)?input.aim:t.yaw;t.turretYaw+=wrap(aim-t.turretYaw)*Math.min(1,dt*5);
 }else{
  const d=dist(t,p),visible=clearLine(s,t,p);t.turretYaw+=wrap(Math.atan2(p.x-t.x,p.z-t.z)-t.turretYaw)*Math.min(1,dt*2);
  if(t.windup>0){t.windup-=dt;t.speed=0;if(t.windup<=0){if(visible){fireShell(s,t,t.turretYaw,t.emplacement?30:24);t.action=.35}t.attack=t.emplacement?2:2.8}}else if(d<(t.emplacement?68:58)&&visible){t.speed=0;t.attack-=dt;if(t.attack<=0)t.windup=t.emplacement?.85:1.25}else if(!t.emplacement){
   t.pathTime-=dt;if(t.pathTime<=0){t.path=routeTo(s,t,p);t.pathTime=1.5}const goal=t.path[0];if(goal){if(dist(t,goal)<3)t.path.shift();const wanted=Math.atan2(goal.x-t.x,goal.z-t.z);t.yaw+=clamp(wrap(wanted-t.yaw),-dt*.8,dt*.8);t.speed=Math.abs(wrap(wanted-t.yaw))<.8?4:0}else t.speed=0;
  }
 }
 const v=forward(t.yaw),nx=t.x+v.x*t.speed*dt,nz=t.z+v.z*t.speed*dt,blocked=s.enemies.some(e=>e.alive&&e!==t&&dist(e,{x:nx,z:nz})<4.5)||(t!==p&&dist(p,{x:nx,z:nz})<4.5);
 if(!blocked&&walkable(s,nx,nz,2.3)){t.x=nx;t.z=nz}else t.speed=0;
}
function shellsTick(s,dt){
 for(const shell of s.shells){shell.age+=dt;const victims=shell.owner==='player'?s.enemies:[s.player],step=55*dt,hit=tankRay(s,shell,{x:shell.dx,z:shell.dz},victims,step);shell.x+=shell.dx*hit.distance;shell.z+=shell.dz*hit.distance;
  if(hit.target)hurt(s,hit.target,shell.damage,shell.owner==='player');
  if(hit.blocked||hit.target){shell.gone=true;emit(s,'explosion',{x:shell.x,y:2.05,z:shell.z})}if(shell.age>2.8)shell.gone=true;
 }s.shells=s.shells.filter(shell=>!shell.gone);
}
function cityAccessTarget(s){
 return s.mode==='story'&&s.chapter===4&&!s.relayHacked?ARGON_ACCESS[s.argonStage]:null;
}
function returnTarget(s){
 const captain=s.enemies.find(e=>e.id===(s.argonStage===3?'reserve-registry':'reserve-captain')&&e.alive);
 return (s.argonStage===1||s.argonStage===3)&&captain?{x:captain.x,z:captain.z,label:'RESERVE CAPTAIN / BRIDGE CIPHER'}:ARGON_RETURN[s.argonStage];
}
function spawnReserve(s){
 s.enemies.push(guard('reserve-captain',0,20,'sentinel'),guard('reserve-flank',-34,46,'striker'),guard('reserve-cipher',3,-64,'striker'));
}
function bridgeTick(s){
 const p=s.player;
 if(s.argonStage<2||s.chapter===4&&s.mode!=='story')return;
 const span=s.chapter===4?ARGON_SERVICE_SPAN:{x:0,width:3,points:ARGON_BRIDGE};
 const [entry,crest,edge,exit]=span.points;
 if(!s.onBridge&&Math.abs(p.x-span.x)<span.width&&p.z<=entry.z&&p.z>=exit.z&&(p.z>entry.z-1||p.z<exit.z+1))s.onBridge=true;
 if(!s.onBridge)return;
 if(p.z>entry.z||p.z<exit.z){s.onBridge=false;p.y=0;return}
 p.x=clamp(p.x,span.x-span.width,span.x+span.width);
 p.y=p.z>crest.z?crest.y*(entry.z-p.z)/(entry.z-crest.z):p.z<edge.z?edge.y*(p.z-exit.z)/(edge.z-exit.z):crest.y;
 if(s.chapter===4&&!s.profile.serviceCache&&distance3(p,ARGON_SERVICE_CACHE)<1.65){
  s.profile.serviceCache=true;s.score+=400;s.profile.checkpointScore=s.score;
  p.hp=clamp(p.hp+25,0,100);
  emit(s,'levelcheckpoint');
  emit(s,'radio',{text:'MARA: That cache belonged to the programs who built this span. Take the charge. They’d want it used.'});
 }
}
function recoveryTarget(s){
 return s.chapter===6&&s.profile.cleared?ARGON_RECOVERY[s.profile.recoveryStage||0]:null;
}
function spawnRecovery(s){
 s.enemies=(recoveryTarget(s)?.guards||[]).map(([x,z,type],i)=>guard('recovery-'+i,x,z,type));
}
function spawnCity(s){
 if(recoveryTarget(s))spawnRecovery(s);
 if(s.chapter===4&&s.mode==='story')s.argonStage=clamp(Math.trunc(s.profile.argonAccess)||0,0,2);
 if(s.chapter===6&&!s.profile.cleared){
  s.argonStage=clamp(Math.trunc(s.profile.argonReturn)||0,0,3);
  if(s.argonStage>0)Object.assign(s.player,{x:0,z:s.argonStage===3?-47:9});
  if(s.argonStage===1)spawnReserve(s);
  if(s.argonStage===3)s.enemies.push(guard('reserve-registry',-37,-62,'sentinel'));
 }

 s.relayHacked=s.chapter===6||s.mode==='story'&&!!s.profile.relayHacked;
 if(s.chapter===4)s.enemies=PATROL_ROUTES.map((route,i)=>({id:'patrol-'+i,type:i===1?'striker':'disc',x:route[0].x,z:route[0].z,yaw:Math.PI,hp:90,maxHp:90,alive:true,attack:2,windup:0,action:0,stagger:0,path:[],pathTime:0,route:structuredClone(route),waypoint:1,suspicion:0,alerted:false,lostSight:0,age:0}));
 s.citizens=CIVIC_ROUTES.map((route,i)=>({id:'citizen-'+i,type:'citizen',x:route[0].x,z:route[0].z,yaw:Math.PI,route:structuredClone(route),waypoint:1,speed:1.2+i%3*.2,path:[],pathTime:0,alive:true}));
 s.citizens.push({id:'mara',type:'mara',x:-5,z:67,yaw:.9,speed:0,alive:true});
}
function followRoute(s,a,dt,speed,goal){
 a.pathTime=(a.pathTime||0)-dt;if(!a.routeGoal||dist(a.routeGoal,goal)>1||a.pathTime<=0&&!a.path?.length){a.path=routeTo(s,a,goal);a.routeGoal={...goal};a.pathTime=.8}
 const next=a.path?.[0];if(!next)return;const n=dist(a,next)||1,angle=Math.atan2(next.x-a.x,next.z-a.z);a.yaw+=wrap(angle-a.yaw)*Math.min(1,dt*6);const step=Math.min(n,dt*speed);move(s,a,(next.x-a.x)/n*step,(next.z-a.z)/n*step);if(n<.4)a.path.shift();
}
function cityTick(s,dt){
 const p=s.player;s.scanner={x:Math.sin(s.time*.12)*35,z:Math.cos(s.time*.12)*50};const scan=s.chapter===4&&s.argonStage<2&&dist(p,s.scanner)<7&&clearLine(s,s.scanner,p);
 for(const c of s.citizens)if(c.route){const goal=c.route[c.waypoint];followRoute(s,c,dt,c.speed,goal);if(dist(c,goal)<.8)c.waypoint=(c.waypoint+1)%c.route.length}
 for(const e of s.enemies)if(e.alive){
  if(s.chapter===6){if(p.y<2&&dist(e,p)<45)guardTick(s,e,dt);continue}
  const distance=dist(e,p),angle=Math.abs(wrap(Math.atan2(p.x-e.x,p.z-e.z)-e.yaw)),range=p.crouching?11:22,seen=p.y<2.5&&distance<range&&(angle<.66||distance<(p.crouching?2.2:4.2))&&clearLine(s,e,p);
  e.suspicion=clamp(e.suspicion+dt*((scan&&dist(e,p)<40)?.75:seen?(p.crouching?.55:1.0):-.38),0,1);
  if(seen){e.lastSeen={x:p.x,z:p.z};e.lostSight=0}else e.lostSight+=dt;
  if(e.suspicion>=1&&!e.alerted){e.alerted=true;s.cityAlarms++;emit(s,'spotted')}
  if(e.alerted){if(seen)guardTick(s,e,dt);else if(e.lostSight<5&&e.lastSeen)followRoute(s,e,dt,3.6,e.lastSeen);else{e.alerted=false;e.suspicion=0;e.windup=0}}
  else{e.stagger=Math.max(0,e.stagger-dt);if(e.stagger<=0){const goal=e.route[e.waypoint];followRoute(s,e,dt,2.2,goal);if(dist(e,goal)<1)e.waypoint=(e.waypoint+1)%e.route.length}}
 }
 s.exposure=Math.max(0,...s.enemies.filter(e=>e.alive).map(e=>e.suspicion));s.alerted=s.enemies.some(e=>e.alive&&e.alerted);
}
export const distance3=(a,b)=>Math.hypot(a.x-b.x,(a.y||0)-(b.y||0),a.z-b.z);
export const flightVector=(yaw,pitch=0)=>({x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:Math.cos(yaw)*Math.cos(pitch)});
export function pointSegment3(p,a,b){const x=b.x-a.x,y=(b.y||0)-(a.y||0),z=b.z-a.z,t=clamp(((p.x-a.x)*x+((p.y||0)-(a.y||0))*y+(p.z-a.z)*z)/(x*x+y*y+z*z||1),0,1);return Math.hypot(p.x-a.x-x*t,(p.y||0)-(a.y||0)-y*t,p.z-a.z-z*t)}
function spawnSky(s){
 s.cores=SKY_CORES.map((q,i)=>({...q,id:'uplink-'+i,type:'uplink',hp:130,maxHp:130,alive:true}));
 s.enemies=[{x:-80,y:48,z:-65},{x:80,y:32,z:-120}].map((q,i)=>({...q,id:'interceptor-'+i,type:'jet',yaw:0,pitch:0,hp:75,maxHp:75,alive:true,speed:24,fire:2+i,action:0}));
 if(s.mode==='story')s.enemies.push({id:'interceptor-2',type:'jet',x:48,y:51,z:15,yaw:0,pitch:0,hp:85,maxHp:85,alive:true,speed:28,fire:2.5,action:0});
}
export function flightTarget(s){
 const p=s.player,f=flightVector(p.yaw,p.pitch),candidates=[...s.cores,...s.enemies].filter(q=>q.alive).map(q=>{const d=distance3(p,q)||1,dot=((q.x-p.x)*f.x+(q.y-p.y)*f.y+(q.z-p.z)*f.z)/d;return{q,d,dot}}).filter(t=>t.d<155&&t.dot>.80).sort((a,b)=>(1-a.dot)*100+a.d*.12-((1-b.dot)*100+b.d*.12));return candidates[0]?.q||null;
}
function fireBolt(s,a,player=false){
 let target=player?flightTarget(s):s.player,v=flightVector(a.yaw,a.pitch);
 if(target){const d=distance3(a,target),lead=target.type==='uplink'?0:d/140,velocity=flightVector(target.yaw||0,target.pitch||0),aim={x:target.x+velocity.x*(target.speed||0)*lead,y:target.y+velocity.y*(target.speed||0)*lead,z:target.z+velocity.z*(target.speed||0)*lead},n=distance3(a,aim)||1;v={x:(aim.x-a.x)/n,y:(aim.y-a.y)/n,z:(aim.z-a.z)/n}}
 s.bolts.push({id:'bolt-'+s.serial++,owner:a.id,x:a.x+v.x*3,y:a.y+v.y*3,z:a.z+v.z*3,dx:v.x,dy:v.y,dz:v.z,age:0,damage:player?13:14});a.action=.16;emit(s,'laser',{x:a.x,y:a.y,z:a.z,owner:a.id});
}
function jetTick(s,a,dt,input={}){
 if(!a.alive)return;
 if(a.id==='player'){
  a.yaw-=clamp(input.steer||0,-1,1)*dt*1.45;a.pitch+=(clamp(input.climb||0,-1,1)*.43-a.pitch)*Math.min(1,dt*3.8);const boost=!!input.boost&&a.energy>2;a.boosting=boost;a.energy=clamp(a.energy+dt*(boost?-20:11),0,100);const wanted=boost?44:input.brake?17:27;a.speed+=(wanted-a.speed)*Math.min(1,dt*2.2);
 }else{
  const p=s.player,nearEdge=Math.abs(a.x)>SKY_BOUNDS.x-30||Math.abs(a.z)>SKY_BOUNDS.z-30,goal=nearEdge?{x:0,y:45,z:0}:p,angle=Math.atan2(goal.x-a.x,goal.z-a.z),pitch=Math.atan2(goal.y-a.y,Math.hypot(goal.x-a.x,goal.z-a.z));a.yaw+=clamp(wrap(angle-a.yaw),-dt*.85,dt*.85);a.pitch+=clamp(pitch-a.pitch,-dt*.35,dt*.35);a.fire-=dt;if(a.fire<=0&&distance3(a,p)<120&&Math.abs(wrap(angle-a.yaw))<.25){fireBolt(s,a);a.fire=s.mode==='story'?1.7:2.4}
 }
 const before={x:a.x,y:a.y,z:a.z},v=flightVector(a.yaw,a.pitch);a.x+=v.x*a.speed*dt;a.y=clamp(a.y+v.y*a.speed*dt,18,90);a.z+=v.z*a.speed*dt;
 if(Math.abs(a.x)>SKY_BOUNDS.x-5||Math.abs(a.z)>SKY_BOUNDS.z-5){a.yaw+=wrap(Math.atan2(-a.x,-a.z)-a.yaw)*Math.min(1,dt*4);a.x=clamp(a.x,-SKY_BOUNDS.x+3,SKY_BOUNDS.x-3);a.z=clamp(a.z,-SKY_BOUNDS.z+3,SKY_BOUNDS.z-3)}
 for(const o of SKY_TOWERS)if(a.y<o.h+2&&Math.abs(a.x-o.x)<o.w+2&&Math.abs(a.z-o.z)<o.d+2){hurt(s,a,20);a.yaw=Math.atan2(a.x-o.x,a.z-o.z);const f=forward(a.yaw);a.x+=f.x*5;a.z+=f.z*5}
 for(const trail of s.trails){
  if(trail.owner===a.id)continue;
  const middle={x:(before.x+a.x)/2,y:(before.y+a.y)/2,z:(before.z+a.z)/2};
  if(pointSegment3(a,trail.a,trail.b)<2.1||pointSegment3(middle,trail.a,trail.b)<2.1){
   hurt(s,a,a.id==='player'?35:85,trail.owner==='player');break;
  }
 }
 if(!a.alive)return;
 a.trailStart??=before;
 if(distance3(a,a.trailStart)>2){
  s.trails.push({id:s.serial++,owner:a.id,a:a.trailStart,b:{x:a.x,y:a.y,z:a.z},born:s.time});
  a.trailStart={x:a.x,y:a.y,z:a.z};
 }
 a.action=Math.max(0,(a.action||0)-dt);
}
function boltsTick(s,dt){
 for(const b of s.bolts){b.age+=dt;const from={x:b.x,y:b.y,z:b.z};b.x+=b.dx*140*dt;b.y+=b.dy*140*dt;b.z+=b.dz*140*dt;
  let blocked=SKY_TOWERS.some(o=>b.y<o.h&&Math.abs(b.x-o.x)<o.w&&Math.abs(b.z-o.z)<o.d);
  if(!blocked)for(const a of b.owner==='player'?[...s.enemies,...s.cores]:[s.player])if(a.alive&&pointSegment3(a,from,b)<(a.type==='uplink'?4.5:2.7)){hurt(s,a,b.damage,b.owner==='player');blocked=true;break}
  if(blocked){b.gone=true;emit(s,'explosion',{x:b.x,y:b.y,z:b.z})}if(b.age>2)b.gone=true;
 }s.bolts=s.bolts.filter(b=>!b.gone);
}
export function rayBox(origin,direction,box,pad=0){
 let near=0,far=Infinity;for(const [axis,extent]of[['x','w'],['z','d']]){const min=box[axis]-box[extent]-pad,max=box[axis]+box[extent]+pad,d=direction[axis];if(Math.abs(d)<.00001){if(origin[axis]<min||origin[axis]>max)return Infinity;continue}let a=(min-origin[axis])/d,b=(max-origin[axis])/d;if(a>b)[a,b]=[b,a];near=Math.max(near,a);far=Math.min(far,b);if(near>far)return Infinity}return far<0?Infinity:near;
}
// The reticle and moving shells share the same first-hit trace, including arena edges.
function tankRay(s,origin,v,victims,maxDistance){
 let distance=maxDistance,target=null,blocked=false;const b=boundsOf(s);
 for(const axis of['x','z'])if(Math.abs(v[axis])>.00001){const edge=((v[axis]>0?b[axis]-.25:-b[axis]+.25)-origin[axis])/v[axis];if(edge>=0&&edge<distance){distance=edge;blocked=true}}
 for(const o of coverOf(s)){const t=rayBox(origin,v,o,.25);if(t<=distance){distance=t;target=null;blocked=true}}
 for(const e of victims)if(e.alive){const x=e.x-origin.x,z=e.z-origin.z,t=x*v.x+z*v.z,side=x*x+z*z-t*t;if(side<=(e.hitRadius||2.5)**2){const half=Math.sqrt(Math.max(0,(e.hitRadius||2.5)**2-side)),near=Math.max(0,t-half);if(t+half>=0&&near<distance){distance=near;target=e;blocked=false}}}
 return{distance,target,blocked};
}
export function aimSolution(s){
 const p=s.player;if(s.chapter===5){const target=flightTarget(s),v=flightVector(p.yaw,p.pitch);return{point:target?{x:target.x,y:target.y,z:target.z}:{x:p.x+v.x*120,y:p.y+v.y*120,z:p.z+v.z*120},target,blocked:false}}
 const v=forward(p.turretYaw),origin={x:p.x+v.x*3.4,z:p.z+v.z*3.4},hit=tankRay(s,origin,v,s.enemies,100);
 return{...hit,point:{x:origin.x+v.x*hit.distance,y:2.05,z:origin.z+v.z*hit.distance}};
}
export function navigationTarget(s){
 if(s.levelMap)return campaignNavigation(s);
 if(s.chapter===5&&s.mode==='story'&&!s.gate&&s.flightLeg<FLIGHT_APPROACH.length){const q=FLIGHT_APPROACH[s.flightLeg];return{point:q,label:q.label}}
 if(isCity(s)){
  const target=recoveryTarget(s)||cityAccessTarget(s)||(s.chapter===6&&!s.profile.cleared?returnTarget(s):gateOf(s));
  const label=target.label||(s.chapter===6?'MARA':s.relayHacked?'SKYPORT':'CIVIC RELAY');
  const p=s.player;
  if(s.chapter===6&&s.argonStage===2&&!s.onBridge)return{point:{x:0,z:7.7},label:'LIGHT BRIDGE ENTRANCE',destination:target};
  if(s.onBridge)return{point:s.chapter===4?{x:ARGON_SERVICE_SPAN.x,z:-38}:s.argonStage===2?target:{x:0,z:-47},label,destination:target};
  let cache=s.cityNav;
  if(!cache||dist(cache.destination,target)>2||dist(cache.from,p)>7||cache.route.length===0){
   cache=s.cityNav={destination:{x:target.x,z:target.z},from:{x:p.x,z:p.z},route:routeTo(s,p,target)};
  }
  while(cache.route.length>1&&clearLine(s,p,cache.route[1],.7))cache.route.shift();
  return{point:cache.route[0]||target,label,destination:target,route:cache.route};
 }
 if(s.chapter===7){
  const destination=gateOf(s),route=s.gate?routeTo(s,s.player,destination):[];
  return{point:route[0]||destination,route:route.length?route:[destination],destination,label:s.profile.gridHeat===1?'CHAMPION EXIT':'FINAL HEAT GATE'};
 }
 if(s.chapter!==5)return{point:gateOf(s),label:s.chapter===4?(s.relayHacked?'SKYPORT':'CIVIC RELAY'):s.chapter===3?(s.archiveRead?'SERVICE DOOR':'FLYNN’S TERMINAL'):'TRANSIT'};
 if(s.gate)return{point:SKY_EXIT,label:'ECHO / RETURN SIGNAL'};
 const remaining=s.cores.filter(c=>c.alive).sort((a,b)=>distance3(s.player,a)-distance3(s.player,b));
 const core=remaining[0];return{point:core||SKY_EXIT,label:core?'ERASURE UPLINK '+String(Number(core.id.split('-').at(-1))+1).padStart(2,'0'):'ECHO / RETURN SIGNAL'};
}
export function advance(s,seconds,input={}){
 const dt=clamp(Number(seconds)||0,0,.05);s.events=[];if(s.dead||s.finished)return s.events;s.time+=dt;s.chapterTime+=dt;const p=s.player;for(const unit of[p,...s.enemies])animationTick(unit,dt);s.shake=Math.max(0,s.shake-dt);for(const key of['attack','dash','pulse','invuln','action'])p[key]=Math.max(0,p[key]-dt);s.comboTime=Math.max(0,s.comboTime-dt);
 p.shield=Math.max(0,(p.shield||0)-dt);p.crouching=isCity(s)&&!!input.crouch;
 if(isCycle(s)){bikeTick(s,p,dt,input);for(const e of s.enemies)bikeTick(s,e,dt,input);s.trails=s.trails.filter(t=>s.time-t.born<(s.levelMap?4:16)).slice(-1600)}
 else if(s.chapter===5){s.trails=s.trails.filter(t=>s.time-t.born<8).slice(-1600);jetTick(s,p,dt,input);for(const e of s.enemies)jetTick(s,e,dt);boltsTick(s,dt)}
 else if(isTank(s)){tankTick(s,p,dt,input);for(const e of s.enemies)if(e.type==='tank')tankTick(s,e,dt);shellsTick(s,dt)}
 else{p.energy=clamp(p.energy+dt*10,0,100);let x=input.x||0,z=input.z||0,n=Math.hypot(x,z);p.moving=n>.08;if(p.dashTime>0){p.dashTime-=dt;move(s,p,p.dashX*dt*23,p.dashZ*dt*23)}else if(p.moving){x/=Math.max(1,n);z/=Math.max(1,n);if(!p.pending)p.yaw=Math.atan2(x,z);move(s,p,x*dt*(p.crouching?3:7),z*dt*(p.crouching?3:7))}if(isCity(s)){if(!s.profile.cleared)bridgeTick(s);cityTick(s,dt);}else for(const e of s.enemies)if(e.alive&&!s.towerTransit&&(!s.levelMap||dist(p,e)<(s.chapter===8?36:70)))guardTick(s,e,dt);for(const orb of s.pickups){orb.age+=dt;if((s.chapter===8?!s.towerTransit:p.y<2)&&dist(orb,p)<2){p.hp=clamp(p.hp+9,0,100);p.energy=clamp(p.energy+18,0,100);orb.gone=true;emit(s,'pickup',{x:orb.x,z:orb.z})}}s.pickups=s.pickups.filter(o=>!o.gone)}
 if(s.dead)return s.events;pendingTick(s,p);if(s.player!==p||s.finished)return s.events;if(input.attack)act(s,'attack');if(input.dash)act(s,'dash');if(input.pulse)act(s,'pulse');if(input.interact)act(s,'interact');discsTick(s,dt);if(s.dead)return s.events;
 if(s.levelMap){tickCampaign(s,dt);return s.events}
 if(s.chapter===3){if(s.archiveRead&&dist(p,REFUGE_EXIT)<3)enterChapter(s,4);return s.events}
 if(isCity(s))return s.events;
 if(s.chapter===5){if(s.mode==='story'&&s.flightLeg<FLIGHT_APPROACH.length&&distance3(p,FLIGHT_APPROACH[s.flightLeg])<24){s.flightLeg++;emit(s,'message',{text:s.flightLeg===3?'ECHO: West channel reached. The uplink is in the open.':'ECHO: Follow the memory channel through the viaduct.'})}if(s.cores.every(e=>!e.alive)&&!s.gate){s.gate=true;emit(s,'gate');if(s.mode!=='story')finish(s)}if(s.mode==='story'&&s.gate&&distance3(p,SKY_EXIT)<17){s.profile.argonReturn=0;enterChapter(s,6)};return s.events}
 if(s.enemies.every(e=>!e.alive)&&!s.gate){if(!s.chapter&&s.wave<3){s.waveDelay+=dt;if(s.waveDelay>1.6){s.waveDelay=0;spawnWave(s)}}else{
   s.gate=true;emit(s,'gate');
   if(s.chapter===7){
    s.trails=[];
    emit(s,'radio',{text:s.profile.gridHeat===1?'DEPOT CONTROL: Champion verified. Take the north exit to the siege tank.':'DEPOT CONTROL: First heat won. Light walls down. Take the north gate to the final heat.'});
   }
   if(s.mode!=='story')finish(s);
  }}
 if(s.mode==='story'&&s.gate&&dist(p,gateOf(s))<(s.chapter===7?10:isVehicle(s)?6:3)){
  if(s.chapter===7&&s.profile.gridHeat!==1){
   s.profile.gridHeat=1;enterChapter(s,7);emit(s,'levelcheckpoint',{reset:true});
   emit(s,'radio',{text:'DEPOT CONTROL: Final heat. Four riders. Mind the divider pylons.'});
  }else enterChapter(s,s.chapter===7?2:s.chapter+1);
 }return s.events;
}
function finish(s){s.finished=true;const key=s.chapter===5?'bestJet':isCity(s)||s.chapter===8?'bestCity':s.chapter===2?'bestTank':isCycle(s)?'bestCycle':'bestDisc';if(s.chapter!==3)s.profile[key]=Math.max(s.profile[key]||0,s.score);if(s.mode==='story')s.profile.cleared=true;emit(s,'victory')}
export function objective(s){
 if(s.levelMap)return campaignObjective(s);
 if(s.chapter===6)return s.profile.cleared?(recoveryTarget(s)?.objective||'Argon is free · relief operation complete'):ARGON_RETURN[s.argonStage].objective;
 if(s.chapter===7){
  const final=s.profile.gridHeat===1;
  return s.gate?(final?'Take the champion’s exit to the aqueduct':'Reach the north gate to start the final heat'):'Light Cycle Grid · Heat '+(final?'2':'1')+'/2 · '+s.enemies.filter(e=>e.alive).length+' riders';
 }
 if(s.chapter===5)return s.gate?'Follow ECHO’s return signal':'Break the erasure array · '+s.cores.filter(e=>e.alive).length+' uplinks';
 if(s.chapter===4&&cityAccessTarget(s))return cityAccessTarget(s).objective;
 if(s.chapter===4)return s.relayHacked?'Reach the skyport · take a light jet':'Recover the root key at the civic relay';
 if(s.chapter===3)return s.archiveRead?'Leave through the service door · enter Argon':'Investigate Flynn’s terminal';
 if(s.chapter===2)return s.gate?'Reach the refuge beyond the ridge':'Cross the Outlands · '+s.enemies.filter(e=>e.alive).length+' tanks remaining';
 if(s.chapter===1)return s.gate?'Reach the Outlands uplink':'Break the pursuit · '+s.enemies.filter(e=>e.alive).length+' cycles remaining';
 if(s.gate)return s.mode==='story'?'Reach the transit gate':'Disc arena cleared';return 'Escape the Archive · wave '+s.wave+' / 3';
}

function guard(id,x,z,type='disc'){
 const hp=type==='sentinel'?125:type==='striker'?70:62;
 return{id,type,x,z,yaw:Math.PI,hp,maxHp:hp,alive:true,attack:2,windup:0,stagger:0,action:0,path:[],pathTime:0,age:0};
}
function towerPermission(s){
 const index=s.towerFloor;
 return s.towerProgress[index]===0&&!s.towerPermissions.has(index)?WARDEN_PERMISSIONS[index]:null;
}
function spawnTowerGuards(s){
 const stage=s.levelMap.stages[s.levelStage];
 const index=s.towerFloor;
 s.enemies=s.towerProgress[index]>=2?[]:stage.guards.map(([x,z,type],i)=>({
  ...guard('warden-'+index+'-'+s.levelStage+'-'+i,x,z,type),y:s.levelMap.elevation
 }));
}
function initTower(s){
 const profile=s.profile,index=clamp(Math.trunc(profile.wardenFloor)||0,0,2);
 s.towerProgress=WARDEN_FLOORS.map((_,i)=>i<index?2:0);
 s.towerProgress[index]=clamp(Math.trunc(profile.wardenStage)||0,0,index===2?1:2);
 s.towerCheckpoint=index;
 s.towerPermissions=new Set(Array.isArray(profile.wardenPermissions)?profile.wardenPermissions:[]);
 for(const [floor,progress] of s.towerProgress.entries())if(progress>0)s.towerPermissions.add(floor);
 s.shardsFound=new Set(Array.isArray(profile.wardenCaches)?profile.wardenCaches:[]);
 s.towerDecks=new Map();
 enterTowerDeck(s,index,true);
 const p=s.player,spawn=s.levelMap.stages[s.levelStage].spawn;
 Object.assign(p,spawn,{yaw:index===1?0:Math.PI});
 if(s.towerProgress[index]>=2){
  const mouth=WARDEN_STAIRS[index].points[0];
  p.x=mouth.x;p.z=mouth.z-Math.sign(mouth.z)*2;
 }
}
function enterTowerDeck(s,index,initial=false){
 const previous=s.towerFloor;
 s.towerTransit=null;
 if(!initial&&previous===index){s.player.y=s.levelMap.elevation;return}
 if(!initial)s.towerDecks.set(previous,{enemies:s.enemies,pickups:s.pickups});
 const stored=s.towerDecks.get(index);
 s.towerFloor=index;s.levelStage=Math.min(s.towerProgress[index],1);s.navCache=null;
 s.levelMap=WARDEN_FLOORS[index];s.onFoot=false;
 s.levelShards=s.levelMap.shards.filter(q=>!s.shardsFound.has(q.id)).map(q=>({...q}));
 s.player.y=s.levelMap.elevation;
 s.discs=[];s.pickups=stored?.pickups||[];
 if(stored)s.enemies=stored.enemies;
 else spawnTowerGuards(s);
 if(!initial&&index>s.towerCheckpoint){
  s.towerCheckpoint=index;s.player.hp=Math.max(75,s.player.hp);
  saveTower(s);
  emit(s,'message',{text:s.levelMap.name+' / CHECKPOINT'});
 }
}
function saveTower(s){
 const index=s.towerCheckpoint;
 Object.assign(s.profile,{wardenFloor:index,wardenStage:s.towerProgress[index],wardenCaches:[...s.shardsFound],wardenPermissions:[...s.towerPermissions],checkpointScore:s.score});
 emit(s,'levelcheckpoint');
}
function initCampaign(s){
 const map=s.levelMap=LEVELS[s.chapter],raw=s.profile.levelSave,save=raw?.version===LEVEL_VERSION&&raw.chapter===s.chapter?raw:null;
 s.levelStage=map.stages?clamp(Number.isInteger(save?.stage)?save.stage:0,0,map.stages.length-1):0;
 s.onFoot=!!save?.onFoot&&s.chapter>0;s.roadS=map.road?clamp(Number(save?.roadS)||0,0,map.routeLength):0;s.roadCheckpoint=map.checkpoints?.filter(t=>t*map.routeLength<=s.roadS+1).length||0;
 s.encountersSeen=new Set();s.ridersSpawned=new Set();s.powersDown=new Set(Array.isArray(save?.powers)?save.powers:[]);s.shardsFound=new Set(Array.isArray(save?.shards)?save.shards:[]);s.levelShards=map.shards.filter(q=>!s.shardsFound.has(q.id)).map(q=>({...q}));
 const spawn=s.onFoot?map.foot.spawn:map.stages?map.stages[s.levelStage].spawn:roadPoint(map,s.roadS);Object.assign(s.player,spawn,{yaw:spawn.yaw??Math.PI,turretYaw:spawn.yaw??Math.PI,speed:s.chapter===1&&!s.onFoot?12:0});
 if(map.powers)for(const q of map.powers)s.enemies.push({...q,type:'power',maxHp:q.hp,alive:!s.powersDown.has(q.id),yaw:0,hitRadius:2.2,attack:999,action:0});
 if(s.chapter===2&&!s.onFoot)for(const [i,x,z]of[[0,4,103],[1,-82,64],[2,-68,-21],[3,52,-48],[4,33,-143],[5,-29,94],[6,64,-73],[7,40,-87]])s.enemies.push({id:'ridge-tank-'+i,type:'tank',emplacement:i>=5,x,z,yaw:0,turretYaw:0,hp:140,maxHp:140,alive:true,attack:3+i*.4,windup:0,action:0,path:[],pathTime:0,age:0,speed:0});
 if(s.chapter===1&&s.onFoot)spawnDepot(s);
 checkpointLevel(s,false);
}
function checkpointLevel(s,reset=false){
 s.profile.checkpoint=s.chapter;s.profile.checkpointScore=s.score;s.profile.cleared=false;s.profile.storyVersion=4;
 s.profile.levelSave={version:LEVEL_VERSION,chapter:s.chapter,stage:s.levelStage,onFoot:s.onFoot,roadS:s.roadS||0,powers:[...s.powersDown],shards:[...s.shardsFound]};
 emit(s,'levelcheckpoint',{reset,area:levelArea(s)});
}
export function levelArea(s){if(s.towerTransit)return WARDEN_STAIRS[s.towerTransit.linkIndex].name;return s.levelMap?(s.onFoot?s.levelMap.foot.name:s.levelMap.stages?.[s.levelStage].name||s.levelMap.name):''}
export function campaignInteraction(s){
 if(s.chapter===8&&(s.towerTransit||s.towerProgress[s.towerFloor]>=2||towerPermission(s)))return null;
 if(!s.levelMap){
  const data=s.chapter===4?cityAccessTarget(s):s.chapter===6?(s.profile.cleared?recoveryTarget(s):ARGON_RETURN[s.argonStage]):null;
  if(s.chapter===6&&s.argonStage===3&&s.enemies.some(e=>e.id==='reserve-registry'&&e.alive))return null;
  if(!data||data.guards&&s.enemies.some(e=>e.alive)||distance3(s.player,data)>3.6||s.chapter===6&&s.argonStage===1&&s.enemies.some(e=>e.id==='reserve-captain'&&e.alive))return null;

  return{id:'argon',point:data,label:data.action,aria:data.label};
 }
 const data=s.onFoot?s.levelMap.foot:s.levelMap.stages?.[s.levelStage];
 if(!data||data.guards&&s.enemies.some(e=>e.alive)||data.kind==='reach'||dist(s.player,data.point)>3.8||data.label==='BOARD'&&dist(s.player,s.levelMap.docked)>6.2)return null;
 return{...data,id:s.onFoot?'transfer':String(s.levelStage),point:data.point,label:data.label||'ACCESS',aria:data.aria};
}
function performCampaignAction(s,id){
 const action=campaignInteraction(s);if(!action||action.id!==id)return;
 if(id==='argon'){
  if(recoveryTarget(s)){
   s.profile.recoveryStage=(s.profile.recoveryStage||0)+1;
   s.score+=350;s.profile.checkpointScore=s.score;s.enemies=[];s.discs=[];
   spawnRecovery(s);emit(s,'levelcheckpoint');
   emit(s,'radio',{text:s.profile.recoveryStage===3?'MARA: The streets are open. We can take it from here.':s.profile.recoveryStage===1?'MARA: Transit is moving. Send the evacuation route over the west relay.':'MARA: The route is live. Meet me at the south entrance.'});return;
  }
  const data=s.chapter===4?ARGON_ACCESS[s.argonStage]:ARGON_RETURN[s.argonStage];
  if(s.chapter===6&&s.argonStage===3){
   s.score+=1200;enterChapter(s,8);return;
  }
  s.argonStage++;s.score+=200;
  if(s.chapter===6&&s.argonStage===3)s.enemies.push(guard('reserve-registry',-37,-62,'sentinel'));
  if(s.chapter===4)s.profile.argonAccess=s.argonStage;
  s.profile.checkpointScore=s.score;
  if(s.chapter===6){
   s.profile.argonReturn=s.argonStage;
   if(s.argonStage===1)spawnReserve(s);
  }
  emit(s,'levelcheckpoint');emit(s,'radio',{text:data.radio});return;
 }
 if(s.chapter===8){
  s.score+=300;
  if(s.levelStage===0){
   s.levelStage=1;s.towerProgress[s.towerFloor]=1;spawnTowerGuards(s);saveTower(s);
  }else if(s.towerFloor<WARDEN_FLOORS.length-1){
   s.towerProgress[s.towerFloor]=2;saveTower(s);
  }else{s.profile.wardenCleared=true;finish(s)}
  emit(s,'radio',{text:action.radio});return;
 }
 if(s.onFoot){enterChapter(s,s.chapter===1?7:s.chapter+1);return}
 if(s.chapter===0&&s.levelStage===4){enterChapter(s,1);return}
 s.levelStage++;s.score+=200;checkpointLevel(s);emit(s,'radio',{text:s.levelMap.stages[s.levelStage].radio});
}
function spawnDepot(s){s.enemies=[guard('depot-guard-0',48,-198,'striker'),guard('depot-guard-1',57,-174,'disc')]}
function dismount(s){
 s.onFoot=true;s.enemies=[];s.trails=[];s.discs=[];s.shells=[];s.player.pending=null;s.player.anim='';s.player.speed=0;s.player.hp=Math.max(75,s.player.hp);Object.assign(s.player,s.levelMap.foot.spawn);s.player.turretYaw=s.player.yaw;
 if(s.chapter===1)spawnDepot(s);checkpointLevel(s,true);emit(s,'radio',{text:s.levelMap.foot.radio});
}
function tickCampaign(s,dt){
 const map=s.levelMap,p=s.player;
 if(s.chapter===8){
  if(s.towerTransit)return;
  const permission=towerPermission(s);
  if(permission&&dist(p,permission)<2.2){
   s.towerPermissions.add(s.towerFloor);s.navCache=null;s.score+=250;saveTower(s);
   emit(s,'message',{text:permission.label+' / ACQUIRED'});
  }
 }
 for(const shard of s.levelShards)if(!shard.gone&&dist(p,shard)<2){shard.gone=true;s.shardsFound.add(shard.id);s.score+=250;p.hp=clamp(p.hp+20,0,100);if(s.chapter===8)saveTower(s);else checkpointLevel(s);emit(s,'radio',{text:shard.text})}s.levelShards=s.levelShards.filter(q=>!q.gone);
 if(map.stages){
  for(const event of map.encounters)if(event.stage>=s.levelStage-1&&event.stage<=s.levelStage&&!s.encountersSeen.has(event.id)&&dist(p,event.at)<event.radius){s.encountersSeen.add(event.id);event.units.forEach(([x,z,type],i)=>s.enemies.push(guard(event.id+'-'+i,x,z,type)));emit(s,'message',{text:event.id==='cell'?'ECHO / LOCAL CHANNEL CONNECTED':event.id==='apron'?'FREIGHT SECURITY / SIGNATURE CHECK':'SECURITY RESPONSE / '+event.id.toUpperCase()})}
  const stage=map.stages[s.levelStage];if(stage.kind==='reach'&&dist(p,stage.point)<5){s.levelStage++;checkpointLevel(s);emit(s,'radio',{text:map.stages[s.levelStage].radio})}return;
 }
 if(s.onFoot)return;
 const near=nearestRoad(map,p);if(near.distance<map.width/2+2)s.roadS=Math.max(s.roadS,near.s);
 if(s.chapter===1)for(const [i,t]of[.07,.35,.65].entries())if(s.roadS>map.routeLength*t&&!s.ridersSpawned.has(i)){s.ridersSpawned.add(i);for(let j=0;j<2;j++){const q=roadPoint(map,Math.max(0,s.roadS-18-j*9));s.enemies.push({id:'pursuer-'+i+'-'+j,type:'bike',...q,roadS:q.s,lane:j?-5:5,hp:65,maxHp:65,alive:true,speed:20+j,age:0,fire:2+j,trailTime:0,trailStart:null,turn:0})}emit(s,'radio',{text:i===0?'ECHO: The Warden found the courier signal. Stay on Freight Line 07; it bends west beneath the viaduct.':i===1?'ECHO: You are crossing the lower city. The maintenance depot is beyond the next two bends.':'ECHO: Depot lights ahead. The bridge past it is erased. Slow down inside the yard; I found another route.'})}
 if(map.powers)for(const q of map.powers){const unit=s.enemies.find(e=>e.id===q.id);if(unit&&!unit.alive&&!s.powersDown.has(q.id)){s.powersDown.add(q.id);checkpointLevel(s);emit(s,'radio',{text:q.id==='power-west'?'ECHO: West dam is down. Follow the aqueduct beneath the old viaduct; the white signal is north.':'ECHO: The last security dam is down. Flynn’s address is through the final canyon bend.'})}}
 const wanted=map.checkpoints.filter(t=>s.roadS>=t*map.routeLength).length;if(wanted>s.roadCheckpoint){s.roadCheckpoint=wanted;checkpointLevel(s);emit(s,'message',{text:'ROUTE CHECKPOINT / '+wanted})}
 const end=map.road.at(-1);if(s.roadS>map.routeLength-32&&dist(p,end)<15&&(!map.powers||s.powersDown.size===map.powers.length))dismount(s);
}
function roadRiderTick(s,b,dt){
 const map=s.levelMap;b.age+=dt;const distanceBehind=s.roadS-b.roadS;b.speed=clamp(19+distanceBehind*.08,15,27);b.roadS=Math.min(map.routeLength-12,b.roadS+b.speed*dt);const q=roadPoint(map,b.roadS),lane=b.lane+Math.sin(b.age*.8)*1.4;
 b.x=q.x+Math.cos(q.yaw)*lane;b.z=q.z-Math.sin(q.yaw)*lane;b.yaw=q.yaw;b.fire-=dt;
 if(b.fire<0&&dist(b,s.player)<42&&clearLine(s,b,s.player)){const n=dist(b,s.player)||1;s.discs.push({id:'road-disc-'+s.serial++,owner:b.id,x:b.x,z:b.z,dx:(s.player.x-b.x)/n,dz:(s.player.z-b.z)/n,age:0,hit:[],damage:12,speed:42});b.fire=3.2;emit(s,'throw',{owner:b.id,x:b.x,z:b.z})}
 if(!b.trailStart)b.trailStart={x:b.x,z:b.z};if(dist(b,b.trailStart)>2){s.trails.push({id:s.serial++,owner:b.id,a:b.trailStart,b:{x:b.x,z:b.z},born:s.time});b.trailStart={x:b.x,z:b.z}}
}
function campaignNavigation(s){
 const map=s.levelMap;if(s.towerTransit)return stairNavigation(s);
 if(s.onFoot)return{point:map.foot.point,label:map.foot.label==='BOARD'?'ARMOR BAY':'WHITE SIGNAL'};
 if(map.stages){
  const stage=map.stages[s.levelStage],p=s.player;
  const stair=s.chapter===8&&s.towerProgress[s.towerFloor]>=2?WARDEN_STAIRS[s.towerFloor]:null;
  const permission=s.chapter===8?towerPermission(s):null;
  const remaining=stage.guards&&!stair&&!permission?s.enemies.filter(e=>e.alive):[];
  const mouth=stair?.points[0];
  const destination=mouth?{...mouth,z:mouth.z+Math.sign(mouth.z)*.6}:permission||(remaining.length?remaining.reduce((a,b)=>dist(p,a)<dist(p,b)?a:b):stage.point);
  const label=stair?.name||permission?.label||(remaining.length?'SECURITY / '+remaining.length+' LEFT':stage.name);
  let cache=s.navCache;
  if(!cache||cache.stage!==s.levelStage||dist(cache.destination,destination)>2||!cache.route.length||!clearLine(s,p,cache.route[0],.5)||s.time-cache.time>.8&&dist(cache.from,p)>4){
   const radius=1.2,line=(a,b,r)=>clearLine(s,a,b,dist(a,p)<.01||dist(b,p)<.01?.5:r),raw=floorRoute(map,p,destination,(x,z,r)=>walkable(s,x,z,r),radius,line),route=[];
   // Keep real turns instead of drawing a diagonal shortcut across a room's props.
   let previous={x:p.x,z:p.z},heading=null;for(let i=0;i<raw.length;i++){const q=raw[i],h=Math.atan2(q.x-previous.x,q.z-previous.z);if(heading!==null&&Math.abs(wrap(h-heading))>.02)route.push(raw[i-1]);heading=h;previous=q}if(raw.length)route.push(raw.at(-1));
   cache=s.navCache={stage:s.levelStage,time:s.time,from:{x:p.x,z:p.z},destination:{x:destination.x,z:destination.z},route};
  }
  while(cache.route.length>1&&dist(p,cache.route[0])<1.1&&clearLine(s,p,cache.route[1],.7))cache.route.shift();
    const route=cache.route.map(q=>({...q,y:map.elevation}));
  return{point:route[0]||{...destination,y:map.elevation},label,destination,route};
 }
 if(map.powers)for(const power of map.powers){const unit=s.enemies.find(e=>e.id===power.id);if(unit?.alive){const gate=map.doors.find(d=>d.power===power.id),at=nearestRoad(map,gate).s;if(s.roadS>at-55&&s.roadS<at+18)return{point:power,label:'SECURITY DAM / POWER CORE'}}}
 const current=nearestRoad(map,s.player).s;
 const route=[14,28,42,56].map(offset=>roadPoint(map,Math.min(map.routeLength,current+offset)));
 return{point:route[0],route,label:s.chapter===1?'FREIGHT LINE 07':'DRY AQUEDUCT'};
}
function campaignObjective(s){
 if(s.onFoot)return s.levelMap.foot.objective;
 if(s.chapter===8){
  if(s.towerTransit)return 'Follow the stairway to the '+(s.towerTransit.up?'next deck':'lower landing')+'.';
  if(s.towerProgress[s.towerFloor]>=2)return 'Climb the '+WARDEN_STAIRS[s.towerFloor].name.toLowerCase()+' to continue the ascent.';
  const permission=towerPermission(s);
  if(permission)return permission.objective;
 }
 if(s.levelMap.stages)return s.levelMap.stages[s.levelStage].objective;
 if(s.chapter===1)return 'Follow Freight Line 07 to the maintenance depot';
 const target=campaignNavigation(s);return target.label.includes('SECURITY')?'Destroy the security dam’s power core':'Follow the dry aqueduct toward Flynn’s white signal';
}
