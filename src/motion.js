// Timing is shared by the simulation and the procedural rig: contact and release
// happen on the same frame as the corresponding pose, including at low FPS.
export const CLIPS={
 throw:{duration:.64,impact:.18,muzzle:[.29,1.42,.72],keys:[
  [0,{}],[.1,{torso:[-.06,-.62,-.06],armR:[-.5,-.4,-.9],elbowR:[-1.35,0,0],armL:[-.35,0,-.25],wristR:[0,.4,-.5]}],
  [.18,{torso:[.12,.22,.04],armR:[-1.3,.12,-.15],elbowR:[-.12,0,0],wristR:[0,0,-1.1],fingersR:.05}],
  [.34,{torso:[.08,.5,.05],armR:[-.8,.3,.6],elbowR:[-.3,0,0],wristR:[0,0,-.35]}],[.64,{}]]},
 slash1:{duration:.48,impact:.17,keys:[
  [0,{}],[.08,{torso:[.05,-.5,0],armR:[-.8,-.25,-.8],elbowR:[-1,0,0],armL:[-.8,0,-.2]}],
  [.17,{torso:[.18,.5,.04],armR:[-1.15,.18,.15],elbowR:[-.15,0,0],wristR:[0,0,-1.2],hipY:.86}],
  [.30,{torso:[.08,.64,.04],armR:[-.5,.45,.75],elbowR:[-.6,0,0]}],[.48,{}]]},
 slash2:{duration:.52,impact:.19,keys:[
  [0,{}],[.08,{torso:[.03,.65,0],armR:[-.55,.4,.8],elbowR:[-.8,0,0],armL:[-.75,0,-.4]}],
  [.19,{torso:[.12,-.55,-.05],armR:[-1.35,-.4,-.55],elbowR:[-.25,0,0],wristR:[0,.2,1],hipY:.85}],
  [.34,{torso:[.05,-.7,-.04],armR:[-.8,-.6,-.95],elbowR:[-.6,0,0]}],[.52,{}]]},
 slash3:{duration:.72,impact:.29,keys:[
  [0,{}],[.15,{torso:[-.18,-.2,0],armR:[-2.45,0,.25],elbowR:[-.55,0,0],armL:[-.7,0,-.4],hipY:.93}],
  [.29,{torso:[.47,.17,0],armR:[-1.4,0,-.18],elbowR:[-.12,0,0],armL:[-.65,0,-.5],hipY:.75,footL:[-.16,.024,.35],footR:[.16,.024,-.28]}],
  [.46,{torso:[.3,.28,0],armR:[-.55,0,-.1],elbowR:[-.7,0,0],hipY:.82}],[.72,{}]]},
 dodge:{duration:.46,keys:[
  [0,{}],[.055,{hipY:.68,torso:[.58,0,0],armL:[.4,0,-.55],armR:[.5,0,.4],elbowL:[-.8,0,0],elbowR:[-.9,0,0],footL:[-.16,.04,.42],footR:[.17,.16,-.36]}],
  [.21,{hipY:.72,torso:[.48,0,0],armL:[.4,0,-.4],armR:[.2,0,.4],footL:[-.16,.025,.32],footR:[.17,.12,-.28]}],[.46,{}]]},
 pulse:{duration:.74,impact:.25,keys:[
  [0,{}],[.16,{hipY:.86,torso:[-.12,0,0],armL:[-.9,0,.3],armR:[-.9,0,-.3],elbowL:[-1.7,0,0],elbowR:[-1.7,0,0],fingersL:.1,fingersR:.1}],
  [.25,{hipY:.79,torso:[.13,0,0],armL:[-.95,0,-1.05],armR:[-.95,0,1.05],elbowL:[-.2,0,0],elbowR:[-.2,0,0],fingersL:0,fingersR:0}],
  [.46,{hipY:.88,armL:[-.5,0,-.7],armR:[-.5,0,.7],elbowL:[-.4,0,0],elbowR:[-.4,0,0]}],[.74,{}]]},
 interact:{duration:.65,impact:.32,keys:[
  [0,{}],[.24,{torso:[.1,-.1,0],armR:[-1.2,0,-.14],elbowR:[-.45,0,0],wristR:[-.25,0,0],fingersR:0}],
  [.40,{torso:[.1,-.1,0],armR:[-1.2,0,-.14],elbowR:[-.45,0,0],fingersR:.15}],[.65,{}]]},
 derez:{duration:.44,keys:[
  [0,{}],[.12,{hipY:.76,torso:[.35,.2,.13],head:[-.2,0,0],armL:[-.3,0,-.5],armR:[-.2,0,.5]}],
  [.44,{hipY:.42,torso:[.85,.32,.2],head:[-.3,0,0],armL:[-.6,0,-.6],armR:[-.5,0,.4],elbowL:[-.8,0,0],elbowR:[-.8,0,0]}]]}
};
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
const ease=t=>{t=clamp(t);return t*t*(3-2*t)};
const blend=(a,b,t)=>Array.isArray(a)?a.map((v,i)=>mix(v,b[i],t)):mix(a,b,t);
const neutral=()=>({hipX:0,hipY:.94,hipZ:0,hips:[0,0,0],torso:[0,0,0],head:[0,0,0],armL:[-.08,0,-.09],armR:[-.1,0,.09],elbowL:[-.18,0,0],elbowR:[-.22,0,0],wristL:[0,0,0],wristR:[0,0,0],fingersL:.35,fingersR:.75,footL:[-.145,.024,.025],footR:[.145,.024,.025],toeL:0,toeR:0});
function overlay(pose,clip,age,weight=1){
 const definition=CLIPS[clip];if(!definition)return pose;
 const keys=definition.keys,t=clamp(age,0,definition.duration);let a=keys[0],b=keys.at(-1);
 for(let i=1;i<keys.length;i++)if(t<=keys[i][0]){a=keys[i-1];b=keys[i];break}
 const u=ease((t-a[0])/Math.max(.001,b[0]-a[0])),base=neutral();
 for(const key of new Set([...Object.keys(a[1]),...Object.keys(b[1])])){const value=blend(a[1][key]??base[key],b[1][key]??base[key],u);pose[key]=blend(pose[key],value,weight)}
 return pose;
}
export function gaitFrequency(speed){return speed>0?speed*.31/(2*mix(.25,.43,clamp(speed/7))):0}
export function samplePose({phase=0,speed=0,moveX=0,moveZ=1,time=0,turn=0,clip='',age=0,windup=0,heavy=false,hitAge=99,catchAge=99,crouching=false}={}){
 const p=neutral(),amount=ease(clamp(speed/.8)),amplitude=mix(.25,.43,clamp(speed/7)),direction=Math.hypot(moveX,moveZ)||1;
 const feet=[];let support=0;
 for(const [side,offset]of[['L',0],['R',.5]]){
  const t=((phase+offset)%1+1)%1,stance=t<.31,u=stance?t/.31:(t-.31)/.69;
  const z=stance?mix(amplitude,-amplitude,u):mix(-amplitude,amplitude,ease(u)),lift=stance?0:Math.sin(Math.PI*u)*.24;
  p['foot'+side][0]+=moveX/direction*z*amount;p['foot'+side][1]+=lift*amount;p['foot'+side][2]+=moveZ/direction*z*amount;
  p['toe'+side]=stance?-.14*ease((t-.2)/.11):.16*Math.sin(Math.PI*u);feet.push({side,stance,phase:t});
  support=Math.max(support,stance?Math.sin(Math.PI*clamp(u))**.25:0);
 }
 p.hipY=mix(.94+Math.sin(time*1.6)*.004,.93-.105*support,amount);p.hipX=Math.sin(phase*Math.PI*2)*.018*amount;
 p.hips[2]=-clamp(turn,-3,3)*.035;p.torso=[.11*amount,Math.sin(phase*Math.PI*2)*.09*amount,clamp(turn,-3,3)*-.035];p.head=[-.06*amount,Math.sin(time*.4)*.04,0];
 const swing=Math.sin(phase*Math.PI*2)*.7*amount;p.armL[0]=-swing-.1;p.armR[0]=swing-.1;p.elbowL[0]=-.4-Math.max(0,swing)*.5;p.elbowR[0]=-.4-Math.max(0,-swing)*.5;
 if(crouching){p.hipY-=.14;p.torso[0]+=.16;p.head[0]-=.08;p.armL[0]-=.15;p.armR[0]-=.15}
 if(clip&&age<=CLIPS[clip]?.duration)overlay(p,clip,age);
 if(windup>0){const wind=heavy?'slash3':'throw';overlay(p,wind,CLIPS[wind].impact*(1-clamp(windup)),.95)}
 if(catchAge<.3&&(!clip||clip==='throw'&&age>.32)){const u=Math.sin(clamp(catchAge/.3)*Math.PI);p.armR=blend(p.armR,[-1.05,.1,-.15],u);p.elbowR=blend(p.elbowR,[-.8,0,0],u);p.fingersR=mix(.1,.85,ease(catchAge/.18))}
 if(hitAge<.28){const weight=Math.sin(clamp(hitAge/.28)*Math.PI);p.torso[0]-=.28*weight;p.torso[2]+=.1*weight;p.head[0]+=.23*weight;p.elbowL[0]-=.3*weight;p.elbowR[0]-=.3*weight}
 p.contacts=feet;return p;
}
// Sagittal two-link IK; boots counter-rotate so a planted sole stays level.
export function legAngles(y,z,upper=.445,lower=.45){
 const length=clamp(Math.hypot(y,z),.08,upper+lower-.001),hip=-Math.atan2(z,-y)-Math.acos(clamp((upper*upper+length*length-lower*lower)/(2*upper*length),-1,1)),knee=Math.PI-Math.acos(clamp((upper*upper+lower*lower-length*length)/(2*upper*lower),-1,1));
 return{hip,knee,ankle:-hip-knee};
}
