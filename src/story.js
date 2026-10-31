import {CHAPTERS} from './world.js?v=5';
const shot=(speaker,text,camera,look)=>({speaker,text,camera,look});
export function sceneFor(chapter){
 const scenes=[
  [shot('THE GRID / NEXT CYCLE','You survived the first Grid. Now the Warden has ordered every unregistered program in Argon erased.',[-18,12,35],[0,2,0]),shot('ECHO','I can get you out of the Archive. Flynn left an emergency key in an unlisted refuge. Find it before the city forgets us.',[-29,2.1,23],[-27,1.2,27])],
  [shot('ECHO','The transit gate is behind you. The Warden’s riders have your signature. The refuge is beyond the Outlands.',[-10,4,48],[0,1,35])],
  [shot('ECHO','The service ridge is sealed. I found a maintenance tank outside the registry. Take the ridge. The white signal is on the other side.',[-11,4,72],[0,1.1,63])],
  [shot('UNLISTED ADDRESS','No patrols. No registry. A human room in a digital world. Flynn’s terminal is still drawing power.',[-8,3,5],[0,1.5,-10])],
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
