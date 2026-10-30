import * as T from '../vendor/three.module.js';
export const COLORS={cyan:0x67e9ff,white:0xe6f7ff,violet:0xc39cff,orange:0xff873c,red:0xff424d};
const metal=(color=0x080c12)=>new T.MeshStandardMaterial({color,metalness:.75,roughness:.27});
const light=color=>new T.MeshBasicMaterial({color});
const mesh=(g,geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
const box=(g,m,w,h,d,x=0,y=0,z=0)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const sphere=(g,m,r,x=0,y=0,z=0)=>mesh(g,new T.SphereGeometry(r,16,12),m,x,y,z);
const rod=(g,m,r,h,x,y,z)=>mesh(g,new T.CylinderGeometry(r,r,h,10),m,x,y,z);
export function discModel(color=COLORS.cyan){const g=new T.Group(),dark=metal(),glow=light(color);mesh(g,new T.TorusGeometry(.25,.035,8,32),glow);mesh(g,new T.TorusGeometry(.205,.035,6,32),dark);mesh(g,new T.TorusGeometry(.158,.012,6,28),glow);g.userData.spin=true;return g}
export function programModel(color=COLORS.cyan,{heavy=false,rider=false}={}){
 const g=new T.Group(),skin=metal(heavy?0x151a21:0x10151d),trim=metal(0x2a3541),glow=light(color),joint=metal(0x05080e),rig={};
 const hips=new T.Group();hips.position.y=.98;g.add(hips);rig.hips=hips;const torso=new T.Group();hips.add(torso);rig.torso=torso;
 const chest=mesh(torso,new T.CapsuleGeometry(heavy?.33:.27,.33,6,14),skin,0,.37,0);chest.scale.set(1,1,.64);box(torso,trim,.39,.07,.29,0,.02,0);
 for(const side of[-1,1]){const stripe=box(torso,glow,.027,.44,.018,side*.16,.35,.176);stripe.rotation.z=side*-.14;box(torso,glow,.23,.023,.025,side*.12,.59,.145);box(torso,glow,.025,.36,.025,side*.25,.3,-.11)}
 box(torso,glow,.21,.025,.02,0,.15,.18);const back=discModel(color);back.position.set(0,.42,-.205);torso.add(back);
 const neck=rod(torso,joint,.075,.15,0,.76,0),head=new T.Group();head.position.y=.9;torso.add(head);rig.head=head;const shell=sphere(head,skin,.205);shell.scale.set(.85,1.1,.92);const visor=mesh(head,new T.SphereGeometry(.207,20,12,0,Math.PI,Math.PI*.35,Math.PI*.35),metal(0x010309));visor.rotation.y=Math.PI/2;visor.scale.set(.88,1.04,.95);box(head,glow,.29,.018,.025,0,.06,.174);for(const side of[-1,1])box(head,glow,.016,.19,.07,side*.17,.015,-.025);
 for(const side of[-1,1]){
  const suffix=side<0?'L':'R',shoulder=new T.Group();shoulder.position.set(side*(heavy?.38:.31),.63,0);torso.add(shoulder);sphere(shoulder,trim,heavy?.16:.115).scale.set(1, .7,1);const upper=mesh(shoulder,new T.CapsuleGeometry(.082,.2,5,10),skin,0,-.17,0);const elbow=new T.Group();elbow.position.y=-.32;shoulder.add(elbow);sphere(elbow,joint,.075);mesh(elbow,new T.CapsuleGeometry(.077,.2,5,10),skin,0,-.16,0);box(elbow,glow,.023,.24,.018,side*.04,-.16,.066);const hand=box(elbow,skin,.105,.13,.1,0,-.36,.018);shoulder.rotation.z=side*.1;elbow.rotation.x=-.12;rig['arm'+suffix]=shoulder;rig['elbow'+suffix]=elbow;rig['hand'+suffix]=hand;
  const leg=new T.Group();leg.position.set(side*.14,0,0);hips.add(leg);mesh(leg,new T.CapsuleGeometry(.105,.26,5,12),skin,0,-.22,0);const knee=new T.Group();knee.position.y=-.44;leg.add(knee);sphere(knee,trim,.105);mesh(knee,new T.CapsuleGeometry(.085,.28,5,10),skin,0,-.23,0);box(knee,glow,.027,.3,.02,side*.045,-.23,.08);box(knee,skin,.17,.13,.29,0,-.47,.055);box(knee,glow,.025,.045,.22,side*.064,-.48,.07);rig['leg'+suffix]=leg;rig['knee'+suffix]=knee;
 }
 const handDisc=discModel(color);handDisc.scale.setScalar(.8);handDisc.rotation.y=Math.PI/2;handDisc.position.set(.06,-.25,.05);rig.elbowR.add(handDisc);rig.disc=handDisc;g.userData.rig=rig;g.userData.phase=0;g.userData.rider=rider;if(rider)g.scale.setScalar(.74);return g;
}
export function animateProgram(g,dt,state={}){
 const r=g.userData.rig;g.userData.phase+=dt*(state.moving?9:1.4);const stride=state.moving?Math.sin(g.userData.phase)*.65:0,attack=state.action>0?Math.sin(Math.min(1,state.action/.42)*Math.PI):0;
 r.hips.position.y=.98+(state.moving?Math.abs(Math.cos(g.userData.phase))*.035:Math.sin(g.userData.phase)*.008);r.legL.rotation.x=stride;r.legR.rotation.x=-stride;r.kneeL.rotation.x=Math.max(0,-stride)*.7;r.kneeR.rotation.x=Math.max(0,stride)*.7;r.armL.rotation.x=-stride*.7;r.armR.rotation.x=stride*.7-attack*1.8;r.elbowR.rotation.x=-.15-attack*.7;r.torso.rotation.y=attack*.35;r.torso.rotation.x=state.dashing?.35:0;r.head.rotation.y=Math.sin(g.userData.phase*.4)*.025;r.disc.visible=!state.thrown;
 if(state.windup>0){r.armR.rotation.x=-1.3;r.elbowR.rotation.x=-1;r.torso.rotation.y=-.25}
 if(g.userData.rider){r.hips.position.y=.74;r.torso.rotation.x=.7;r.legL.rotation.x=r.legR.rotation.x=-1.4;r.kneeL.rotation.x=r.kneeR.rotation.x=1.55;r.armL.rotation.x=r.armR.rotation.x=-1.3;r.elbowL.rotation.x=r.elbowR.rotation.x=-.2;r.disc.visible=false}
}
export function cycleModel(color=COLORS.cyan){
 const g=new T.Group(),body=metal(0x070b10),rim=metal(0x26333d),glow=light(color),wheels=[];
 for(const z of[-1.05,1.05]){const wheel=new T.Group();wheel.position.set(0,.49,z);g.add(wheel);const tire=mesh(wheel,new T.TorusGeometry(.39,.1,10,36),body);tire.rotation.y=Math.PI/2;for(const side of[-1,1]){const edge=mesh(wheel,new T.TorusGeometry(.39,.024,6,36),glow,side*.1,0,0);edge.rotation.y=Math.PI/2;const hub=rod(wheel,rim,.21,.19,0,0,0);hub.rotation.z=Math.PI/2}wheels.push(wheel)}
 const core=mesh(g,new T.CapsuleGeometry(.29,1.4,8,20),body,0,.64,0);core.rotation.x=Math.PI/2;core.scale.x=.9;const hood=sphere(g,body,.39,0,.73,.83);hood.scale.set(.8,.72,1.5);for(const side of[-1,1]){const line=box(g,glow,.026,.035,1.7,side*.24,.72,.04);box(g,rim,.08,.1,.8,side*.29,.36,0);const rail=box(g,glow,.018,.23,.7,side*.2,.6,.7);rail.rotation.x=.1;box(g,glow,.03,.04,.3,side*.15,.61,-1.2)}
 const glass=mesh(g,new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI*.6),metal(0x091c27),0,.86,.5);glass.scale.set(.75,1,1.2);glass.rotation.x=.4;box(g,glow,.26,.05,.04,0,.56,1.48);
 const rider=programModel(color,{rider:true});rider.position.set(0,.31,-.28);g.add(rider);g.userData.rider=rider;g.userData.wheels=wheels;return g;
}
export function recognizer(){const g=new T.Group(),dark=metal(0x0a1018),glow=light(0xff944b);for(const side of[-1,1]){box(g,dark,2,10,3,side*6,-2,0);box(g,glow,.08,8,.08,side*6-1,-2,1.55);box(g,dark,5,1.5,3,side*4,3.5,0)}box(g,dark,8,2.8,4,0,4,0);box(g,glow,5.7,.2,.07,0,4.1,2.04);return g}
