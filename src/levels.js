// Authored campaign spaces. Practice arenas keep their separate rules and maps.
export const CELL=4,LEVEL_VERSION=1;
const rect=(id,x,z,w,d,roof=true)=>({id,x,z,w,d,roof});
const length=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const key=(x,z)=>x+','+z;
export function smoothRoad(points){
 const out=[];let distance=0;
 for(let i=0;i<points.length-1;i++)for(let j=0;j<16;j++){
  const t=j/16,p0=points[Math.max(0,i-1)],p1=points[i],p2=points[i+1],p3=points[Math.min(points.length-1,i+2)];
  const axis=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t),p={x:axis('x'),z:axis('z')};
  if(out.length)distance+=length(p,out.at(-1));out.push({...p,s:distance});
 }
 const end=points.at(-1);distance+=length(end,out.at(-1));out.push({...end,s:distance});return out;
}
export function roadPoint(map,s){
 const road=map.road;s=Math.max(0,Math.min(road.at(-1).s,s));let i=1;while(i<road.length-1&&road[i].s<s)i++;
 const a=road[i-1],b=road[i],t=(s-a.s)/(b.s-a.s||1);return{x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,yaw:Math.atan2(b.x-a.x,b.z-a.z),s};
}
export function nearestRoad(map,p){
 let best={distance:Infinity,s:0,x:map.road[0].x,z:map.road[0].z,yaw:Math.PI};
 for(let i=1;i<map.road.length;i++){const a=map.road[i-1],b=map.road[i],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.z-a.z)*dz)/(dx*dx+dz*dz||1))),x=a.x+dx*t,z=a.z+dz*t,distance=Math.hypot(p.x-x,p.z-z);if(distance<best.distance)best={x,z,distance,s:a.s+(b.s-a.s)*t,yaw:Math.atan2(dx,dz)}}return best;
}
const archive={id:'archive',name:'ARCHIVE / THE UNLISTED',bounds:{x:104,z:188},start:{x:-64,z:138,yaw:Math.PI},rooms:[
 rect('DETENTION 07',-64,124,12,20),rect('CELL ACCESS',-64,96,4,12),rect('PROCESSING HALL',-44,80,28,12),rect('SERVICE LINK',-8,80,8,4),rect('COOLANT SPINE',0,52,4,28),rect('REACTOR CONCOURSE',24,24,28,16),rect('ARCHIVE ACCESS',0,-12,4,20),rect('ARCHIVE STACKS',-20,-44,24,12),rect('UNLISTED STACK',-60,-44,20,8),rect('FREIGHT LINK',-36,-72,4,16),rect('FREIGHT APRON',-8,-104,32,16,false),rect('TRANSIT CONTROL',12,-140,12,20),rect('GARAGE ACCESS',40,-152,16,4),rect('VEHICLE BAY',68,-152,16,16)
 ],props:[{x:-68,z:121,w:2,d:4,h:1.8},{x:-40,z:80,w:3,d:3,h:2.4},{x:16,z:24,w:3,d:3,h:5.8},{x:40,z:12,w:3,d:2,h:2.6},{x:-12,z:-44,w:2,d:5,h:3.6},{x:-24,z:-48,w:2,d:4,h:3.6},{x:-16,z:-104,w:4,d:4,h:2.4},{x:16,z:-156,w:2,d:1,h:1.2}],
 doors:[{id:'coolant',x:0,z:6,w:4,d:.6,opensAt:2},{id:'freight',x:12,z:-124,w:10,d:.6,opensAt:3},{id:'garage',x:28,z:-152,w:.6,d:4,opensAt:4}],
 stages:[
 {name:'DETENTION / PROCESSING',point:{x:-20,z:80},kind:'reach',objective:'Escape detention through the processing hall',spawn:{x:-64,z:138},radio:'ECHO: Your name is on the erasure manifest. I opened your cell. The service spine leads to the freight terminal.'},
 {name:'REACTOR CONCOURSE',point:{x:36,z:24},kind:'use',label:'POWER',aria:'Restore service power',objective:'Restore power to the sealed archive passage',spawn:{x:-16,z:80},radio:'ECHO: The freight route lost power. Follow the coolant spine to the reactor concourse. Its manual breaker is still local.'},
 {name:'ARCHIVE STACKS',point:{x:-32,z:-44},kind:'use',label:'READ',aria:'Read the transit manifest',objective:'Find Flynn’s unlisted address in the transit manifest',spawn:{x:32,z:32},radio:'ECHO: Power is back. The archive bulkhead is open. Find a route the Warden cannot see.'},
 {name:'FREIGHT APRON',point:{x:12,z:-152},kind:'use',label:'OPEN',aria:'Open the freight garage',objective:'Cross the freight apron and open the vehicle bay',spawn:{x:-32,z:-44},radio:'ECHO: An address with no registry entry. Flynn. The footbridge beyond freight has been erased; we need a vehicle.'},
 {name:'VEHICLE BAY',point:{x:68,z:-148},kind:'board',label:'BOARD',aria:'Board the freight light cycle',objective:'Take the courier cycle onto the service highway',spawn:{x:12,z:-152},radio:'ECHO: Courier cycle 07 is still charged. The highway follows the same freight line to the old maintenance depot.'}
 ],encounters:[
 {id:'cell',stage:0,at:{x:-64,z:131},radius:12,units:[[-64,111,'disc']]},
 {id:'processing',stage:0,at:{x:-64,z:93},radius:13,units:[[-55,81,'disc'],[-25,81,'striker']]},
 {id:'reactor',stage:1,at:{x:0,z:43},radius:12,units:[[12,30,'striker'],[43,28,'disc']]},
 {id:'stacks',stage:2,at:{x:0,z:-27},radius:12,units:[[-8,-40,'disc'],[-35,-36,'striker']]},
 {id:'apron',stage:3,at:{x:-36,z:-83},radius:13,units:[[-26,-106,'disc'],[12,-98,'striker'],[12,-138,'sentinel']]}
 ],shards:[{id:'forgotten',x:-72,z:-44,text:'A name the registry never counted. Someone hid a whole family’s identities in the unlisted stack.'},{id:'engineer',x:46,z:32,text:'The reactor log names an engineer who refused the Warden’s order. ECHO saves the signature.'}],
 docked:{kind:'cycle',x:68,z:-154,yaw:Math.PI}};
const cycle={id:'highway',name:'SERVICE HIGHWAY / FREIGHT LINE 07',bounds:{x:128,z:220},start:{x:72,z:160,yaw:Math.PI},width:26,
 road:smoothRoad([{x:72,z:160},{x:72,z:124},{x:40,z:88},{x:-20,z:88},{x:-68,z:52},{x:-68,z:-12},{x:-20,z:-56},{x:52,z:-56},{x:84,z:-96},{x:84,z:-148},{x:40,z:-180}]),
 rooms:[rect('MAINTENANCE DEPOT',40,-188,28,20,false),rect('ARMOR BAY',24,-196,12,10)],props:[{x:54,z:-188,w:3,d:4,h:2.6}],doors:[],
 foot:{spawn:{x:44,z:-176,yaw:Math.PI},point:{x:24,z:-190},label:'BOARD',aria:'Board the maintenance tank',objective:'Enter the depot’s armor bay and take the maintenance tank',name:'MAINTENANCE DEPOT / ON FOOT',radio:'ECHO: The bridge to the refuge is gone. Park here. A maintenance tank can take the dry aqueduct below it.'},
 docked:{kind:'tank',x:24,z:-196,yaw:0},checkpoints:[.28,.58,.83],shards:[]};
const tank={id:'aqueduct',name:'DRY AQUEDUCT / THE WHITE SIGNAL',bounds:{x:140,z:232},start:{x:40,z:180,yaw:Math.PI},width:36,
 road:smoothRoad([{x:40,z:180},{x:40,z:136},{x:0,z:104},{x:-64,z:104},{x:-92,z:64},{x:-92,z:8},{x:-56,z:-24},{x:16,z:-24},{x:52,z:-60},{x:52,z:-116},{x:0,z:-152},{x:-52,z:-152},{x:-72,z:-188}]),
 rooms:[rect('UNLISTED APPROACH',-72,-194,22,22,false),rect('REFUGE PASSAGE',-72,-210,8,14)],
 props:[{x:42,z:123,w:3,d:3,h:7},{x:-85,z:40,w:4,d:5,h:8},{x:-50,z:-18,w:3,d:3,h:6},{x:43,z:-57,w:3,d:3,h:7}],
 doors:[{id:'dam-west',x:-40,z:104,w:.65,d:18,power:'power-west'},{id:'dam-north',x:52,z:-96,w:18,d:.65,power:'power-north'}],
 powers:[{id:'power-west',x:-28,z:115,hp:96},{id:'power-north',x:63,z:-80,hp:96}],
 foot:{spawn:{x:-72,z:-190,yaw:Math.PI},point:{x:-72,z:-212},label:'ENTER',aria:'Enter Flynn’s refuge',objective:'Leave the tank and enter the unlisted refuge',name:'WHITE SIGNAL / ON FOOT',radio:'ECHO: That white doorway is the address from the manifest. The tank cannot fit. Leave it here. We made it.'},
 docked:{kind:'tank',x:-80,z:-182,yaw:Math.PI},checkpoints:[.20,.44,.68,.87],shards:[]};
function prepare(map){
 if(map.id==='highway')map.props.push({x:12,z:-196,w:.4,d:10,h:6.5,wall:true},{x:24,z:-206,w:12,d:.4,h:6.5,wall:true},{x:36,z:-196,w:.4,d:10,h:6.5,wall:true});
 if(map.id==='aqueduct')map.props=map.props.map((o,i)=>{const q=roadPoint(map,map.road.at(-1).s*[.16,.37,.58,.79][i]),side=i%2?1:-1;return{...o,x:q.x+Math.cos(q.yaw)*15*side,z:q.z-Math.sin(q.yaw)*15*side}});
 if(map.id!=='aqueduct'){const d=map.docked;map.props.push({x:d.x,z:d.z,w:d.kind==='tank'?2.2:.7,d:d.kind==='tank'?3.5:2.4,h:2.5,vehicle:true})}
 if(map.stages)for(const stage of map.stages)if(stage.kind==='use')map.props.push({x:stage.point.x,z:stage.point.z-2,w:1.2,d:.8,h:1.2,console:true});
 const floor=new Map();
 for(const r of map.rooms)for(let x=Math.floor((r.x-r.w)/CELL);x<Math.ceil((r.x+r.w)/CELL);x++)for(let z=Math.floor((r.z-r.d)/CELL);z<Math.ceil((r.z+r.d)/CELL);z++)floor.set(key(x,z),{x:(x+.5)*CELL,z:(z+.5)*CELL,room:r.id});
 if(map.road)for(let x=-map.bounds.x;x<map.bounds.x;x+=CELL)for(let z=-map.bounds.z;z<map.bounds.z;z+=CELL){const p={x:x+CELL/2,z:z+CELL/2};if(nearestRoad(map,p).distance<map.width/2)floor.set(key(Math.floor(p.x/CELL),Math.floor(p.z/CELL)),{...p,room:'ROAD'})}
 const edges=new Map();const add=(axis,at,from)=>{const k=axis+':'+at;if(!edges.has(k))edges.set(k,[]);edges.get(k).push(from)};
 for(const k of floor.keys()){const [x,z]=k.split(',').map(Number);if(!floor.has(key(x-1,z)))add('x',x*CELL,z*CELL);if(!floor.has(key(x+1,z)))add('x',(x+1)*CELL,z*CELL);if(!floor.has(key(x,z-1)))add('z',z*CELL,x*CELL);if(!floor.has(key(x,z+1)))add('z',(z+1)*CELL,x*CELL)}
 const walls=[];for(const[k,starts]of edges){const[axis,at0]=k.split(':'),at=Number(at0);starts.sort((a,b)=>a-b);let a=starts[0],b=a+CELL;const push=()=>walls.push(axis==='x'?{x:at,z:(a+b)/2,w:.25,d:(b-a)/2,h:map.road?map.id==='highway'?1.1:12:6.5,wall:true}:{x:(a+b)/2,z:at,w:(b-a)/2,d:.25,h:map.road?map.id==='highway'?1.1:12:6.5,wall:true});for(let i=1;i<starts.length;i++){if(starts[i]===b)b+=CELL;else{push();a=starts[i];b=a+CELL}}push()}
 map.floor=floor;map.walls=walls;map.cover=[...walls,...map.props];map.routeLength=map.road?.at(-1).s||0;return map;
}
export const LEVELS=[prepare(archive),prepare(cycle),prepare(tank)];
export function floorContains(map,x,z,r=.5){for(const dx of[-r,r])for(const dz of[-r,r])if(!map.floor.has(key(Math.floor((x+dx)/CELL),Math.floor((z+dz)/CELL))))return false;return true}
// A small A* over the authored floor mask, with line checks to prevent corner cutting.
export function floorRoute(map,a,b,canWalk,radius=.7,canLine=()=>true){
 const center=(x,z)=>({x:(x+.5)*CELL,z:(z+.5)*CELL}),pick=p=>{let best=null,bestDistance=Infinity;const ix=Math.floor(p.x/CELL),iz=Math.floor(p.z/CELL);for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const x=ix+dx,z=iz+dz,q=center(x,z),d=length(p,q);if(d<bestDistance&&map.floor.has(key(x,z))&&canWalk(q.x,q.z,radius)&&canLine(p,q,radius)){best=[x,z];bestDistance=d}}return best};
 const start=pick(a),end=pick(b);if(!start||!end)return[];const startKey=key(...start),endKey=key(...end),open=[{x:start[0],z:start[1],k:startKey,g:0,f:0}],cost=new Map([[startKey,0]]),prev=new Map(),closed=new Set(),heur=(x,z)=>Math.hypot(x-end[0],z-end[1]);let visited=0;
 while(open.length&&visited++<7000){let best=0;for(let i=1;i<open.length;i++)if(open[i].f<open[best].f)best=i;const q=open.splice(best,1)[0];if(closed.has(q.k))continue;if(q.k===endKey){const path=[b];for(let k=q.k;k!==startKey;){const[x,z]=k.split(',').map(Number);path.unshift(center(x,z));k=prev.get(k);if(!k)return[]}path.unshift(center(...start));return path}closed.add(q.k);
  for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=q.x+dx,z=q.z+dz,k=key(x,z),p=center(x,z),g=q.g+Math.hypot(dx,dz);if(closed.has(k)||g>=(cost.get(k)??Infinity)||!map.floor.has(k)||!canWalk(p.x,p.z,radius)||!canLine(center(q.x,q.z),p,radius))continue;if(dx&&dz&&(!canWalk(center(x,q.z).x,center(x,q.z).z,radius)||!canWalk(center(q.x,z).x,center(q.x,z).z,radius)))continue;cost.set(k,g);prev.set(k,q.k);open.push({x,z,k,g,f:g+heur(x,z)})}
 }return[];
}
export const FLIGHT_APPROACH=[{x:0,y:38,z:120,label:'SKYPORT DEPARTURE'},{x:-56,y:36,z:50,label:'WEST MEMORY CHANNEL'},{x:-64,y:36,z:-35,label:'WEST UPLINK'},{x:0,y:48,z:-72,label:'CENTRAL VIADUCT'},{x:65,y:58,z:-103,label:'EAST UPLINK'},{x:20,y:48,z:-145,label:'WARDEN SPINE'},{x:0,y:43,z:-169,label:'COMMAND UPLINK'}];
