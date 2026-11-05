export const CITY_BOUNDS={x:57,z:84},SKY_BOUNDS={x:160,z:205};
export const CITY_RELAY={x:-38,z:-39},SKYPORT={x:37,z:-76},CITY_ENTRY={x:0,z:73},REFUGE_EXIT={x:0,z:17};
export const CITY_BUILDINGS=[];
for(const [z,d]of[[63,8],[25,13],[-19,13],[-59,10]])for(const side of[-1,1]){
 CITY_BUILDINGS.push({x:side*19,z,w:10,d,h:25+(Math.abs(z)%5)*8,building:true});
 CITY_BUILDINGS.push({x:side*51,z,w:5,d:d-1,h:18+(Math.abs(z)%3)*9,building:true});
}
export const CITY_COVER=[...CITY_BUILDINGS,{x:-37,z:20,w:2.2,d:2.5,h:2.4},{x:-37,z:-9,w:2.5,d:2,h:2.4},{x:36,z:26,w:2,d:2,h:2.4},{x:37,z:-77,w:3.5,d:2,h:.8,prop:'cradle'},{x:-38,z:-42,w:1.8,d:.8,h:1.2,prop:'relay'}];
export const PATROL_ROUTES=[
 [{x:0,z:47},{x:0,z:4},{x:36,z:4},{x:36,z:47}],
 [{x:-37,z:45},{x:-37,z:4},{x:-37,z:-40},{x:0,z:-40},{x:0,z:4},{x:0,z:46},{x:-37,z:46}],
 [{x:37,z:4},{x:37,z:-40},{x:0,z:-40},{x:0,z:-76},{x:37,z:-71}]
];
export const CIVIC_ROUTES=[
 [{x:-6,z:68},{x:-6,z:50},{x:6,z:50},{x:6,z:68}],
 [{x:6,z:40},{x:6,z:9},{x:27,z:9},{x:32,z:43}],
 [{x:-6,z:43},{x:-31,z:43},{x:-31,z:8},{x:-6,z:8}],
 [{x:7,z:-4},{x:7,z:-35},{x:31,z:-35},{x:31,z:-4}],
 [{x:-6,z:-43},{x:-32,z:-43},{x:-32,z:-73},{x:-6,z:-73}],
 [{x:32,z:-47},{x:32,z:-72},{x:42,z:-72},{x:42,z:-47}]
];
export const SKY_TOWERS=[{x:-24,z:63,w:7,d:11,h:38},{x:35,z:15,w:9,d:13,h:48},{x:-28,z:-91,w:8,d:9,h:65},{x:36,z:-48,w:8,d:12,h:56},{x:101,z:-39,w:9,d:12,h:37},{x:-96,z:-79,w:9,d:10,h:53},{x:-130,z:-125,w:12,d:16,h:58},{x:129,z:-133,w:13,d:18,h:67},{x:-133,z:0,w:11,d:15,h:49},{x:130,z:19,w:12,d:15,h:54},{x:-87,z:105,w:13,d:13,h:41},{x:87,z:104,w:12,d:12,h:45}];
export const SKY_CORES=[{x:-64,y:36,z:-35},{x:65,y:58,z:-103},{x:0,y:43,z:-169}];
export const SKY_EXIT={x:0,y:43,z:176};
export const CHAPTERS=['ARCHIVE / THE UNLISTED','FREIGHT LINE 07','THE DRY AQUEDUCT','WHITE SIGNAL','ARGON / SILENT DISTRICT','THE MEMORY LATTICE','ARGON / GROUND RESERVE','DEPOT 07 / LIGHT CYCLE GRID','WARDEN SPIRE','RETURN CORRIDOR / LIGHT JET CIRCUIT'];

export const ARGON_ACCESS=[
 {x:36,z:45,label:'TRANSIT TAP',action:'SPOOF',objective:'Spoof a transit identity at the east checkpoint',radio:'MARA: You have a transit identity. Take the cross street to the west alley and blind the Recognizer.'},
 {x:-37,z:5,label:'SCANNER OVERRIDE',action:'JAM',objective:'Jam the Recognizer from the west service alley',radio:'MARA: Scanner dark. Follow the cyan stairs above the patrols, or stay in the alley. Both reach the relay.'}
];
export const ARGON_RETURN=[
 {x:34,z:-70,label:'SKYPORT / SERVICE LIFT',action:'OPEN',objective:'Open the service lift and find the Warden’s ground reserve',radio:'ECHO: The array is cut off. The reserve still has the order. Its captain carries the bridge cipher.'},
 {x:0,z:8,label:'BRIDGE EMITTER',action:'EXTEND',objective:'Derezz the reserve captain and use his cipher at the bridge emitter',radio:'ECHO: Bridge online. Take the upper span and pull the emergency isolation switch.'},
 {x:0,y:9,z:-19,label:'ISOLATION SWITCH',action:'ISOLATE',objective:'Climb the light bridge and isolate the ground reserve',radio:'MARA: The reserve is off the network. Cross the span and use Flynn’s key at the registry.'},
 {x:-37,z:-72,label:'FREE REGISTRY',action:'RESTORE',objective:'Restore Argon’s registry with Flynn’s root key'}
];
export const ARGON_BRIDGE=[
 {z:8,y:0},{z:-13,y:9},{z:-25,y:9},{z:-46,y:0}
];

export const ARGON_SERVICE_SPAN={
 x:-37,width:3,points:[{z:3,y:0},{z:-12,y:8},{z:-23,y:8},{z:-37,y:0}]
};
export const ARGON_SERVICE_CACHE={x:-39,y:8,z:-19};

export const ARGON_RECOVERY=[
 {x:36,z:45,label:'TRANSIT REOPEN',action:'RESTORE',objective:'Argon is free · clear the transit blockade and reopen the east line',guards:[[34,51,'disc'],[39,38,'striker'],[33,42,'sentinel']]},
 {x:-38,z:-39,label:'RECOVERY RELAY',action:'BROADCAST',objective:'Cross to the west relay and broadcast the evacuation route',guards:[[-34,-40,'disc'],[-40,-31,'striker'],[-33,-48,'disc']]},
 {x:-5,z:67,label:'MARA / DEBRIEF',action:'REPORT',objective:'Report back to Mara at the south entrance',guards:[]}
];
