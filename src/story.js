import {CHAPTERS} from './world.js?v=6';
const shot=(speaker,text,camera,look)=>({speaker,text,camera,look});
export function sceneFor(chapter){
 const scenes=[
  [shot('THE GRID / ERASURE CYCLE','The Warden has ordered Argon’s unregistered programs erased. You are one of them. A voice calling herself ECHO just unlocked your cell.',[-69,2.7,141],[-64,1.3,126]),shot('ECHO','I found your name on the manifest. There is an old freight route beneath this facility. Reach its transit records—we need an address the Warden cannot see.',[-57,2.8,130],[-64,1.3,112])],
  [shot('ECHO','Courier 07 was never logged out. You found Flynn’s unlisted address in the manifest; this freight line reaches the maintenance depot on its approach.',[79,4.8,174],[72,1.3,142]),shot('WARDEN / FREIGHT CONTROL','Unregistered courier. The bridge beyond Depot 07 has been removed from the system.',[-14,32,104],[-24,1,88])],
  [shot('ECHO','The bridge is gone, but its old aqueduct still runs beneath the ridge. The depot’s maintenance tank can make that crossing. The white signal is at the far end.',[48,4.5,190],[40,1.5,158])],
  [shot('UNLISTED ADDRESS','The unlisted address from the freight manifest. No patrols. No registry. A human room hidden inside the Grid. Flynn’s terminal is still drawing power.',[-8,3,5],[0,1.5,-10])],
  [shot('ARGON / BEFORE THE ERASURE','Thousands of programs are still living their last ordinary cycle. The Warden’s patrols have sealed the avenues.',[-26,100,76],[0,1,20]),shot('MARA / FREE PROGRAM','ECHO sent me. The civic relay is through the western service alleys. The skyport is beyond it. I’ll keep the channel open.',[-9,2.3,68],[-5,1.2,67])],
  [shot('ECHO','The root key marked three erasure uplinks above Argon. Break their connection to the city, then follow my signal home.',[-12,48,153],[0,37,110]),shot('THE WARDEN','Unregistered aircraft. The city’s memory is under my protection.',[38,66,-74],[65,58,-103])],
  [shot('ARGON / FIRST FREE CYCLE','The erasure order has no address left to reach. Across the district, names return to the registry—and stay their own.',[-14,95,75],[0,2,5]),shot('ECHO','You came here looking for Flynn. You found what he tried to leave us. Mara is waiting in the district.',[-9,2.4,72],[-5,1.1,67])]
 ];return{title:CHAPTERS[chapter],shots:scenes[chapter]||[]};
}
export const ARCHIVE_SCENE={title:'F / PERSONAL ARCHIVE',shots:[
 shot('FLYNN / STORED RECORDING','The Grid remembers people through their names. If its caretaker can erase those names, freedom becomes permission. I left a root key in the civic relay.',[-4,2.4,-5],[0,2,-10]),
 shot('ECHO','The Warden turned that relay into a kill list. We don’t need an exit. We need to break its link to the city. The service door leads into Argon.',[3,2.8,-3],[0,1.5,-10])
]};
export const RELAY_SCENE={title:'THE LIST OF THE LIVING',shots:[
 shot('ECHO','These are not corrupt files. They are people. Mara, the residents outside—every name on this relay is queued for erasure. Flynn’s key can disconnect the list.',[-41,2.8,-34],[-38,1.3,-42]),
 shot('MARA','The Warden moved the erasure command above the city. I unlocked a jet at Skyport 07. Bring our names home.',[30,4,-65],[37,2,-77])
]};
export function recap(s){
 if(s.levelMap){const objective=s.onFoot?s.levelMap.foot.objective:s.levelMap.stages?.[s.levelStage].objective|| (s.chapter===1?'Follow Freight Line 07 to the maintenance depot.':'Cross the dry aqueduct, disable its security dams, and find the white signal.');return 'The Warden erases unregistered identities at the next cycle. ECHO freed you from detention. Flynn’s unlisted address may lead to a way to stop the erasure. '+objective+'.'}
 const task=[
  'Escape the Archive. ECHO is guiding you toward an unlisted refuge before the Warden erases Argon’s unregistered programs.',
  'Break the pursuit and cross the perimeter. The route to Flynn’s refuge continues through the Outlands.',
  'Cross the sealed service ridge in the maintenance tank. Flynn’s white signal is beyond the patrols.',
  s.profile.flynnFound?'Flynn’s recording points to a root key inside Argon’s civic relay. Leave through the refuge’s service door.':'Investigate Flynn’s terminal. It may hold the route to the Warden’s erasure system.',
  s.relayHacked?'The root key is yours. Reach the skyport and take a light jet into the memory lattice.':'Reach the civic relay through Argon’s western service alleys. The root key will open a route to the aerial array.',
  s.gate?'The uplinks are down. Follow ECHO’s return signal to leave the array.':'Destroy the three erasure uplinks above Argon. They connect the Warden’s kill list to the city.',
  'Argon survived the erasure cycle. You can explore the district and speak with Mara.'
 ];return task[s.chapter];
}
