// The same match definitions drive campaign invitations and replayable circuits.
const block=(x,z,w,d,h=4)=>({x,z,w,d,h});
export const CYCLE_CIRCUIT=[
 {name:'DEPOT QUALIFIER',brief:'Trap three depot riders with your light wall. Victory releases the siege tank. You may stay for the championship.',rivals:3,speed:16,cover:[]},
 {name:'SPLIT CIRCUIT',brief:'Four riders weave between long divider walls. Brake before the openings and cut across their escape routes.',rivals:4,speed:18,cover:[block(-27,0,3,25),block(27,0,3,25),block(0,-39,12,3)]},
 {name:'CROSS CURRENT',brief:'Offset barriers split the Grid into crossing lanes. Five riders compete for the same gaps.',rivals:5,speed:19,cover:[block(-46,-14,18,3),block(37,18,18,3),block(-13,28,3,10),block(16,-34,3,10)]},
 {name:'CROWN OF THE GRID',brief:'Defeat five championship riders in the inner ring. Long-lived walls make every turn matter.',rivals:5,speed:21,trailLife:24,cover:[block(-32,0,3,22),block(32,0,3,22),block(0,-24,17,3),block(0,24,17,3)]}
];
export const JET_CIRCUIT=[
 {name:'SEA OF SIMULATION',brief:'The Warden has sealed the return corridor. Destroy the three blockade fighters with cannons or light ribbons to open a route home.',rivals:3,hp:85,speed:28,cover:[block(-48,-15,9,12,62),block(48,-40,9,12,74),block(0,-110,13,14,45)]},
 {name:'NEEDLE FOREST',brief:'Hunt four interceptors between tall memory needles. Climb over their ribbons or lure them through yours.',rivals:4,hp:95,speed:30,cover:[-80,0,80].flatMap((x,i)=>[-75,30].map(z=>block(x+(i===1?15:0),z,6,8,58+(i%2)*27)))},
 {name:'RELAY SIEGE',brief:'Two shield relays hold the evacuation channel closed. Break both relays and their four defenders.',rivals:4,hp:100,speed:31,cores:[{x:-70,y:33,z:-90},{x:70,y:64,z:-90}],cover:[block(-70,-90,10,12,22),block(70,-90,10,12,52),block(0,0,15,22,54),block(-100,65,7,12,72),block(100,65,7,12,72)]},
 {name:'WARDEN ACE',brief:'The Warden’s ace and four wingmen guard the last channel. Use the tower corridors to break their firing lines.',rivals:5,hp:105,ace:true,speed:32,cover:[block(-48,-25,10,36,78),block(48,-25,10,36,78),block(-105,-125,14,14,60),block(105,-125,14,14,60),block(0,65,13,12,32)]}
];
export const RANKS=['UNRANKED','QUALIFIED','CONTENDER','ELITE','CHAMPION'];
export const circuitFor=kind=>kind==='cycle'?CYCLE_CIRCUIT:JET_CIRCUIT;
export const safeRound=value=>Number.isInteger(value)&&value>=0&&value<4?value:0;
