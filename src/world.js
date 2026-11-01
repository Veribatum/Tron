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
export const SKY_TOWERS=[{x:-130,z:-125,w:12,d:16,h:58},{x:129,z:-133,w:13,d:18,h:67},{x:-133,z:0,w:11,d:15,h:49},{x:130,z:19,w:12,d:15,h:54},{x:-87,z:105,w:13,d:13,h:41},{x:87,z:104,w:12,d:12,h:45}];
export const SKY_CORES=[{x:-64,y:36,z:-35},{x:65,y:58,z:-103},{x:0,y:43,z:-169}];
export const SKY_EXIT={x:0,y:43,z:176};
export const CHAPTERS=['ARCHIVE / THE UNLISTED','FREIGHT LINE 07','THE DRY AQUEDUCT','WHITE SIGNAL','ARGON / SILENT DISTRICT','THE MEMORY LATTICE','ARGON / FIRST FREE CYCLE'];
