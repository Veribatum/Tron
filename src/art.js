import * as T from '../vendor/three.module.js';
import {CLIPS,gaitFrequency,samplePose,legAngles} from './motion.js?v=12';
export const COLORS={cyan:0x67e9ff,white:0xe6f7ff,violet:0xc39cff,orange:0xff873c,red:0xff424d};
const metal=(color=0x080c12)=>new T.MeshStandardMaterial({color,metalness:.75,roughness:.27});
const light=color=>new T.MeshBasicMaterial({color});
const mesh=(g,geo,mat,x=0,y=0,z=0)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
const box=(g,m,w,h,d,x=0,y=0,z=0)=>mesh(g,new T.BoxGeometry(w,h,d),m,x,y,z);
const sphere=(g,m,r,x=0,y=0,z=0)=>mesh(g,new T.SphereGeometry(r,16,12),m,x,y,z);
const rod=(g,m,r,h,x,y,z)=>mesh(g,new T.CylinderGeometry(r,r,h,10),m,x,y,z);
export function discModel(color=COLORS.cyan){const g=new T.Group(),dark=metal(),glow=light(color);mesh(g,new T.TorusGeometry(.25,.035,8,32),glow);mesh(g,new T.TorusGeometry(.205,.035,6,32),dark);mesh(g,new T.TorusGeometry(.158,.012,6,28),glow);g.userData.spin=true;return g}
// Closed, smooth cross sections give the suit a continuous anatomical silhouette.
function surface(rings,segments=28){
 const positions=[],uv=[],indices=[];
 for(let j=0;j<rings.length;j++){const[y,rx,rz,offset=0]=rings[j];for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;positions.push(Math.cos(a)*rx,y,Math.sin(a)*rz+offset);uv.push(i/segments,j/(rings.length-1))}}
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const k=j*(segments+1)+i;indices.push(k,k+segments+1,k+1,k+1,k+segments+1,k+segments+2)}
 for(const end of[0,rings.length-1]){const center=positions.length/3;positions.push(0,rings[end][0],rings[end][3]||0);uv.push(.5,.5);for(let i=0;i<segments;i++){const k=end*(segments+1)+i;indices.push(...(end?[center,k+1,k]:[center,k,k+1]))}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();return geo;
}
function circuit(g,mat,points,r=.012){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,5,false),mat)}
function oval(g,mat,r,x,y,z,sx,sy,sz){const m=sphere(g,mat,r,x,y,z);m.scale.set(sx,sy,sz);return m}
export function programModel(color=COLORS.cyan,{heavy=false,rider=false,frame='male',helmet=true,style='standard'}={}){
 const female=frame==='female',mara=style==='mara',g=new T.Group(),suit=new T.MeshStandardMaterial({color:0x111b29,roughness:mara?.25:.47,metalness:.3}),armor=new T.MeshStandardMaterial({color:mara?0x263340:heavy?0x3b434b:0x283847,roughness:.37,metalness:.4}),edge=metal(0x526572),glow=light(color),rubber=metal(0x080e16),face=new T.MeshStandardMaterial({color:female?0xd4b4a0:0xbca78e,roughness:.68,metalness:0}),hair=new T.MeshStandardMaterial({color:0x10161c,roughness:.9,metalness:0}),rig={};
 const hips=new T.Group();hips.position.y=1.03;g.add(hips);rig.hips=hips;
 const pelvis=mesh(hips,surface([[-.12,.19,.12],[0,.245,.15],[.1,female?.21:.23,.14],[.16,.18,.13]]),suit);pelvis.scale.x=heavy?1.09:1;
 const torso=new T.Group();hips.add(torso);rig.torso=torso;
 mesh(torso,surface([[.05,.20,.135],[.18,female?.16:.21,.12],[.32,female?.18:.245,.13],[.47,female?.245:.29,female?.18:.17],[.60,female?.221:.255,.15],[.69,female?.167:.197,.115],[.73,.105,.09]]),suit).scale.x=heavy?1.09:1;
 if(mara){
  circuit(torso,glow,[[-.13,.68,.116],[-.13,.56,.156],[-.067,.46,.179],[.069,.39,.145],[.105,.27,.128],[.12,.15,.128]],.011);
  circuit(torso,glow,[[.12,.68,-.116],[.12,.56,-.146],[.071,.42,-.168],[-.108,.31,-.139],[-.12,.16,-.131]],.01);
 }
 for(const side of[-1,1]){
  if(!mara){const plate=mesh(torso,surface([[.36,.085,.028],[.43,.12,.06],[.54,.125,.055],[.62,.105,.03],[.65,.07,.015]],20),armor,side*(female?.118:.132),0,.13);plate.rotation.z=side*-.08;}
  if(!mara)circuit(torso,glow,[[side*.08,.67,.126],[side*.176,.63,.131],[side*(female?.193:.221),.51,.133],[side*.153,.37,.122],[side*(female?.12:.15),.22,.114]],.01);
  circuit(torso,edge,[[side*.10,.37,.151],[side*.08,.27,.135],[side*.09,.17,.14]],.007);
  circuit(torso,glow,[[side*.20,.13,-.12],[side*.23,.35,-.14],[side*.22,.58,-.14],[side*.1,.66,-.12]],.009);
  circuit(torso,glow,[[side*.055,.18,-.15],[side*.10,.26,-.18],[side*.14,.31,-.17]],.009);
  circuit(torso,edge,[[side*.13,.57,.194],[side*.18,.54,.197],[side*.19,.46,.192]],.009);
  const belt=box(torso,armor,.12,.06,.28,side*.14,.075,0);belt.rotation.z=side*.08;
 }
 for(let i=0;i<(mara?0:2);i++){mesh(torso,surface([[.13+i*.068,.09,.022],[.17+i*.068,.10,.025],[.19+i*.068,.08,.01]],16),armor,0,0,.133);}
 box(torso,glow,.055,.025,.017,0,.09,.157);
 const socket=mesh(torso,new T.TorusGeometry(.205,.023,8,32),edge,0,.48,-.158);
 socket.scale.set(1,1,.65);
 const back=discModel(color);back.scale.setScalar(.73);back.position.set(0,.48,-.18);torso.add(back);rig.backDisc=back;
 rod(torso,rubber,.077,.14,0,.77,0);const collar=mesh(torso,new T.TorusGeometry(.082,.014,8,24),armor,0,.74,0);collar.rotation.x=Math.PI/2;
 const head=new T.Group();head.position.y=.91;torso.add(head);rig.head=head;
 const headGeometry=surface([[-.16,.05,.055],[-.14,.08,.073],[-.10,.112,.09],[-.065,.131,.108],[-.025,.14,.119],[.025,.141,.123],[.07,.14,.123],[.12,.13,.113],[.16,.10,.09],[.19,.06,.06],[.205,.012,.015]],32);
 if(!helmet){const p=headGeometry.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);if(z>0){const cheek=.012*Math.exp(-Math.pow((Math.abs(x)-.075)/.045,2)-Math.pow((y+.04)/.055,2));const socket=.008*Math.exp(-Math.pow((Math.abs(x)-.055)/.03,2)-Math.pow((y-.026)/.026,2));p.setZ(i,z+cheek-socket)}}headGeometry.computeVertexNormals()}
 mesh(head,headGeometry,helmet?armor:face);
 if(helmet){
  const visorGeometry=new T.BufferGeometry();
  visorGeometry.setAttribute('position',new T.Float32BufferAttribute([
   0,.112,.138, -.121,.071,.094, -.112,-.052,.112, -.058,-.122,.118,
   0,-.148,.139, .058,-.122,.118, .112,-.052,.112, .121,.071,.094,
   0,.002,.166
  ],3));
  visorGeometry.setIndex([0,1,8,1,2,8,2,3,8,3,4,8,4,5,8,5,6,8,6,7,8,7,0,8]);
  visorGeometry.computeVertexNormals();
  mesh(head,visorGeometry,new T.MeshPhysicalMaterial({color:0x030813,metalness:.62,roughness:.21,clearcoat:1}));
  circuit(head,glow,mara?[[-.117,.071,.103],[-.066,.043,.148],[.047,.04,.156],[.117,.07,.107]]:[[-.114,.07,.104],[-.058,.076,.139],[0,.05,.163],[.058,.076,.139],[.114,.07,.104]],.007);
  if(!mara)circuit(head,glow,[[0,.041,.165],[0,-.036,.166],[0,-.091,.154]],.006);
  for(const side of[-1,1])circuit(head,edge,[[side*.113,-.048,.115],[side*.075,-.125,.112],[side*.015,-.148,.139]],.006);
  if(mara){
   circuit(head,glow,[[.113,.07,.105],[.138,.05,.008],[.126,.081,-.063],[.086,.116,-.082]],.006);
   circuit(head,glow,[[-.078,.088,-.102],[0,.103,-.122],[.07,.10,-.102]],.006);
  }

 }else{
  oval(head,hair,.146,0,.10,-.025,1, .77, .94);
  if(mara){
   circuit(head,hair,[[-.111,.152,.082],[-.054,.187,.104],[.046,.138,.147],[.119,.074,.105]],.026);
   circuit(head,glow,[[-.148,.006,-.007],[-.154,-.044,.003],[-.145,-.076,.01]],.007);
  }
if(female){for(const side of[-1,1]){
   oval(head,hair,.105,side*.121,-.025,-.055,.40,side<0?2.05:1.45,.83);
   circuit(head,edge,[[side*.07,.176,-.055],[side*.124,.122,-.095],[side*.136,.014,-.10],[side*.122,-.112,-.087]],.005);
  }circuit(head,hair,[[-.12,.14,.05],[-.075,.175,.085],[.005,.17,.115],[.075,.12,.12]],.028)}
  rig.eyes=[];for(const side of[-1,1]){oval(head,face,.035,side*.142,-.01,.008,.4,1,.65);const eye=new T.Group();eye.position.set(side*.056,.025,.13);head.add(eye);oval(eye,new T.MeshStandardMaterial({color:0xcbd3d4,roughness:.65}),.023,0,0,0,1,.31,.42);oval(eye,rubber,.009,0,0,.012,.85,1,.35);rig.eyes.push(eye);circuit(head,hair,[[side*.025,.057,.125],[side*.057,.068,.12],[side*.08,.058,.102]],.006)}
  oval(head,face,.028,0,-.015,.137,.55,1.25,1.1);oval(head,new T.MeshStandardMaterial({color:mara?0x804454:0x986a66,roughness:mara?.42:.8}),.027,0,-.078,.122,1.12,.23,.35);
 }
 for(const side of[-1,1]){
  const suffix=side<0?'L':'R',shoulder=new T.Group();shoulder.position.set(side*(heavy?.285:female?.222:.247),.625,0);torso.add(shoulder);
  mesh(shoulder,surface([[-.13,.06,.059],[-.06,.074,.077],[.01,.067,.067],[.033,.039,.052]],20),mara?suit:armor);
  if(!mara)circuit(shoulder,glow,[[side*.008,.024,.055],[side*.048,-.015,.062],[side*.063,-.074,.046]],.007);
  mesh(shoulder,surface([[-.32,.055,.057],[-.24,.075,.078],[-.13,female?.075:.09,.085],[-.06,.07,.07]]),suit);
  const elbow=new T.Group();elbow.position.y=-.325;shoulder.add(elbow);oval(elbow,rubber,.059,0,0,0,1,.9,1);
  mesh(elbow,surface([[-.29,.043,.045],[-.22,.065,.063],[-.1,.073,.067],[-.045,.06,.055]]),armor);
  circuit(elbow,glow,[[side*.025,-.05,.062],[side*.038,-.13,.068],[side*.025,-.25,.05]],.009);
  circuit(elbow,edge,[[side*.047,-.10,-.048],[side*.044,-.19,-.056],[side*.028,-.27,-.039]],.008);
  const hand=new T.Group();hand.position.set(0,-.31,.014);elbow.add(hand);oval(hand,suit,.055,0,-.027,0,.82,1.25,.55);
  const fingers=[];for(let f=0;f<4;f++){const pivot=new T.Group();pivot.position.set((f-1.5)*.023,-.060,.012);hand.add(pivot);mesh(pivot,new T.CapsuleGeometry(.012,.045,3,7),rubber,0,-.025,0);pivot.rotation.x=-.28;fingers.push(pivot)}rig['fingers'+suffix]=fingers;const thumb=mesh(hand,new T.CapsuleGeometry(.017,.035,3,7),suit,-side*.052,-.028,.025);thumb.rotation.z=side*.55;
  shoulder.rotation.z=side*.09;elbow.rotation.x=-.15;rig['arm'+suffix]=shoulder;rig['elbow'+suffix]=elbow;rig['hand'+suffix]=hand;
  const leg=new T.Group();leg.position.set(side*(female?.139:.145),-.03,0);hips.add(leg);
  mesh(leg,surface([[-.43,.069,.073],[-.34,.09,.097],[-.16,female?.115:.11,.117],[-.05,.11,.109],[.015,.095,.09]]),suit);
  const thigh=oval(leg,mara?suit:armor,.1,side*.04,-.21,.044,.75,1.7,.5);thigh.rotation.z=side*.08;
  circuit(leg,glow,[[side*.079,-.06,.063],[side*.09,-.20,.073],[side*.065,-.37,.066]],.01);
  const knee=new T.Group();knee.position.y=-.445;leg.add(knee);oval(knee,rubber,.074,0,0,0,1,1,.8);oval(knee,armor,.08,0,-.005,.047,.8,1.05,.6);
  mesh(knee,surface([[-.43,.061,.064],[-.31,.066,.081],[-.14,.092,.091],[-.045,.073,.073]]),armor);
  circuit(knee,glow,[[side*.045,-.10,.079],[side*.055,-.20,.075],[side*.035,-.37,.065]],.009);
  const ankle=new T.Group();ankle.position.y=-.45;knee.add(ankle);oval(ankle,rubber,.10,0,-.01,.055,.79,.67,1.85);box(ankle,armor,.16,.045,.31,0,-.042,.055);circuit(ankle,glow,[[-.06,-.006,.17],[0,.001,.216],[.06,-.006,.17]],.006);rig['ankle'+suffix]=ankle;
  rig['leg'+suffix]=leg;rig['knee'+suffix]=knee;
 }
 const handDisc=discModel(color);handDisc.scale.setScalar(.63);handDisc.rotation.y=Math.PI/2;handDisc.position.set(.065,-.065,.055);rig.handR.add(handDisc);rig.disc=handDisc;
 g.userData.rig=rig;g.userData.phase=0;g.userData.rider=rider;g.userData.frame=frame;g.userData.mara=mara;if(rider)g.scale.setScalar(.74);return g;
}
const unitDown=new T.Vector3(0,-1,0),mix=(a,b,t)=>a+(b-a)*t,cap=(n,a,b)=>Math.max(a,Math.min(b,n));
function armIK(g,side,target,weight=1){
 const r=g.userData.rig,root=r['arm'+side],elbow=r['elbow'+side];g.updateMatrixWorld(true);
 const goal=r.torso.worldToLocal(g.localToWorld(new T.Vector3(...target))),delta=goal.clone().sub(root.position),distance=cap(delta.length(),.05,.634),direction=delta.normalize(),pole=new T.Vector3(side==='L'?-.7:.7,-.4,-.3);pole.addScaledVector(direction,-pole.dot(direction)).normalize();
 const along=(.325**2-(.31**2+.014**2)+distance**2)/(2*distance),bend=Math.sqrt(Math.max(0,.325**2-along**2)),mid=root.position.clone().addScaledVector(direction,along).addScaledVector(pole,bend),upper=mid.clone().sub(root.position).normalize();
 const wanted=new T.Quaternion().setFromUnitVectors(unitDown,upper),lower=goal.sub(mid).normalize().applyQuaternion(wanted.clone().invert()),bendRotation=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,-.31,.014).normalize(),lower);root.quaternion.slerp(wanted,weight);elbow.quaternion.slerp(bendRotation,weight);
}
export function animateProgram(g,dt,state={}){
 const r=g.userData.rig,m=g.userData.motion??={speed:0,phase:0,time:0,contacts:{L:false,R:false},ready:false};dt=cap(dt,0,.1);const amount=1-Math.exp(-dt*16),wanted=state.speed??(state.moving?7:0);m.speed=mix(m.speed,wanted,amount);m.time+=dt;m.phase=(m.phase+gaitFrequency(m.speed)*dt)%1;g.userData.phase=m.phase*Math.PI*2;
 let clip=state.clip||'',age=state.age||0;if(!clip&&state.action>0){clip='throw';age=.42-state.action}
 const pose=samplePose({phase:m.phase,speed:m.speed,moveX:state.moveX||0,moveZ:state.moveZ??1,time:m.time,turn:state.turn||0,clip,age,windup:state.windupRatio||0,heavy:state.heavy,hitAge:state.hitAge,catchAge:state.catchAge,crouching:state.crouching});
 if(g.userData.rider){pose.hipY=.70;pose.hipZ=0;pose.hips=[0,0,-(state.bank||0)*.12];pose.torso=[.98+(state.boosting?.09:0)-(state.braking?.08:0),0,-(state.bank||0)*.15];pose.head=[-.55,cap(state.turn||0,-1,1)*.12,0];pose.footL=[-.392,.02,-.34];pose.footR=[.392,.02,-.34];pose.fingersL=pose.fingersR=.95;pose.toeL=pose.toeR=.1;if(clip==='throw'||(state.catchAge??99)<.3)pose.armR[0]-=pose.torso[0];}
 const weight=m.ready?1-Math.exp(-dt*(clip.startsWith('slash')?44:28)):1;m.ready=true;
 r.hips.position.lerp(new T.Vector3(pose.hipX,pose.hipY,pose.hipZ),weight);
 for(const[name,values]of Object.entries({hips:pose.hips,torso:pose.torso,head:pose.head,armL:pose.armL,armR:pose.armR,elbowL:pose.elbowL,elbowR:pose.elbowR,handL:pose.wristL,handR:pose.wristR})){const joint=r[name];for(let i=0;i<3;i++){const axis=['x','y','z'][i];joint.rotation[axis]=mix(joint.rotation[axis],values[i],weight)}}
 const inverse=r.hips.quaternion.clone().invert();for(const side of['L','R']){
  const leg=r['leg'+side],foot=new T.Vector3(...pose['foot'+side]).sub(r.hips.position).applyQuaternion(inverse).sub(leg.position),roll=Math.atan2(foot.x,-foot.y),angles=legAngles(-Math.hypot(foot.x,foot.y),foot.z);
  leg.rotation.set(angles.hip,0,roll);r['knee'+side].rotation.set(angles.knee,0,0);r['ankle'+side].rotation.set(angles.ankle-r.hips.rotation.x+pose['toe'+side],0,-roll-r.hips.rotation.z);
  for(const finger of r['fingers'+side])finger.rotation.x=mix(finger.rotation.x,-pose['fingers'+side]*1.3,weight);
 }
 if(g.userData.rider){armIK(g,'L',[-.419,.811,.851]);const attack=clip==='throw'?cap(age/.08,0,1)*(1-cap((age-.4)/.24,0,1)):0,catching=(state.catchAge??99)<.3?Math.sin(state.catchAge/.3*Math.PI):0;armIK(g,'R',[.419,.811,.851],1-Math.max(attack,catching));}
 const blinkPhase=m.time%4.6,blink=blinkPhase>4.36?1-Math.sin((blinkPhase-4.36)/.24*Math.PI):1;for(const eye of r.eyes||[])eye.scale.y=Math.max(.06,blink);
 const inFlight=!!state.thrown;const ridingHand=g.userData.rider&&(clip==='throw'&&age<.18||(state.catchAge??99)<.3);const wielded=g.userData.rider?ridingHand:clip==='throw'||clip.startsWith('slash')||(state.catchAge??99)<.3||(state.windupRatio||0)>0;
 r.disc.visible=wielded&&!inFlight;r.backDisc.visible=!wielded&&!inFlight;
 const contacts=[];for(const foot of pose.contacts){if(foot.stance&&!m.contacts[foot.side]&&m.speed>1&&!clip&&!g.userData.rider)contacts.push(foot.side);m.contacts[foot.side]=foot.stance}return{contacts,phase:m.phase,speed:m.speed};
}
export function cycleModel(color=COLORS.cyan,options={}){
 const g=new T.Group(),body=metal(0x070b10),rim=metal(0x26333d),glow=light(color),wheels=[];
 for(const z of[-1.05,1.05]){const wheel=new T.Group();wheel.position.set(0,.49,z);g.add(wheel);const tire=mesh(wheel,new T.TorusGeometry(.39,.1,10,36),body);tire.rotation.y=Math.PI/2;for(const side of[-1,1]){const edge=mesh(wheel,new T.TorusGeometry(.39,.024,6,36),glow,side*.1,0,0);edge.rotation.y=Math.PI/2;const hub=rod(wheel,rim,.21,.19,0,0,0);hub.rotation.z=Math.PI/2}wheels.push(wheel)}
 const core=mesh(g,new T.CapsuleGeometry(.29,1.4,8,20),body,0,.64,0);core.rotation.x=Math.PI/2;core.scale.x=.9;const hood=sphere(g,body,.39,0,.73,.83);hood.scale.set(.8,.72,1.5);for(const side of[-1,1]){const line=box(g,glow,.026,.035,1.7,side*.24,.72,.04);box(g,rim,.08,.1,.8,side*.29,.36,0);const rail=box(g,glow,.018,.23,.7,side*.2,.6,.7);rail.rotation.x=.1;box(g,glow,.03,.04,.3,side*.15,.61,-1.2)}
 const glass=mesh(g,new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI*.6),metal(0x091c27),0,.86,.5);glass.scale.set(.75,1,1.2);glass.rotation.x=.4;box(g,glow,.26,.05,.04,0,.56,1.48);
 const rider=programModel(color,{...options,rider:true});rider.position.set(0,.31,-.1);g.add(rider);for(const side of[-1,1]){const grip=rod(g,rim,.032,.18,side*.31,.91,.53);grip.rotation.z=Math.PI/2;box(g,body,.04,.13,.04,side*.26,.84,.53)}g.userData.rider=rider;g.userData.wheels=wheels;return g;
}
export function recognizer(){const g=new T.Group(),dark=metal(0x0a1018),glow=light(0xff944b);for(const side of[-1,1]){box(g,dark,2,10,3,side*6,-2,0);box(g,glow,.08,8,.08,side*6-1,-2,1.55);box(g,dark,5,1.5,3,side*4,3.5,0)}box(g,dark,8,2.8,4,0,4,0);box(g,glow,5.7,.2,.07,0,4.1,2.04);return g}

export function tankModel(color=COLORS.cyan){
 const g=new T.Group(),body=metal(0x263540),black=metal(0x0a111a),trim=metal(0x536775),glow=light(color);
 // Split armored pods and a low wedge hull preserve the classic tank silhouette.
 const hull=mesh(g,surface([[.5,1.5,2.35],[1.0,1.7,2.3],[1.45,1.25,1.8],[1.6,.9,1.5]],12),body);const tracks=[];
 for(const side of[-1,1]){
  const pod=new T.Group();pod.position.x=side*1.95;g.add(pod);const shell=box(pod,body,1.05,1.15,4.8,0,.9,0);const nose=oval(pod,body,.6,0,.93,2.15,.88,1,1.15);
  for(const z of[-1.6,-.8,0,.8,1.6]){const wheel=mesh(pod,new T.CylinderGeometry(.36,.36,.8,12),black,0,.46,z);wheel.rotation.z=Math.PI/2;tracks.push(wheel)}
  for(const x of[-.54,.54])circuit(pod,glow,[[x,.48,-2],[x,1.25,-2.15],[x,1.42,1.8],[x,1.15,2.5],[x,.50,2.25]],.035);

 }
 const turret=new T.Group();turret.position.y=1.6;g.add(turret);mesh(turret,surface([[0,.95,1.18],[.4,1.07,1.0],[.70,.66,.65]],12),body);const hatch=mesh(turret,new T.CylinderGeometry(.45,.52,.12,24),black,0,.75,-.1);const ring=mesh(turret,new T.TorusGeometry(.38,.024,6,32),glow,0,.82,-.1);ring.rotation.x=Math.PI/2;
 const barrel=new T.Group();barrel.position.set(0,.45,.65);turret.add(barrel);box(barrel,black,.35,.3,2.7,0,0,1.1);box(barrel,trim,.48,.43,.65,0,0,2.35);box(barrel,glow,.29,.22,.03,0,0,2.69);for(const side of[-1,1])box(barrel,glow,.025,.035,2.35,side*.185,.085,1.1);
 for(const side of[-1,1]){circuit(turret,glow,[[side*.78,.12,-.7],[side*.82,.46,-.25],[side*.6,.61,.35]],.022);box(g,glow,.45,.06,.04,side*.72,1.12,2.25)}
 const treads=new T.InstancedMesh(new T.BoxGeometry(1.05,.10,.22),trim,72);treads.instanceMatrix.setUsage(T.DynamicDrawUsage);treads.frustumCulled=false;g.add(treads);const flash=mesh(barrel,new T.SphereGeometry(.26,10,8),new T.MeshBasicMaterial({color,transparent:true,depthWrite:false}),0,0,2.75);flash.visible=false;
 const shield=mesh(g,new T.SphereGeometry(3.6,24,16),new T.MeshBasicMaterial({color,transparent:true,opacity:.1,wireframe:true,depthWrite:false}),0,.7,0);shield.scale.y=.65;shield.visible=false;g.userData={turret,barrel,tracks,shield,treads,flash,trackTravel:[0,0]};animateTank(g,0,{});return g;
}

export function animateCycle(g,dt,state={}){
 const m=g.userData,rate=state.turn||0,blend=1-Math.exp(-dt*9);m.bank=mix(m.bank||0,cap(-rate*.22,-.5,.5),blend);g.rotation.z=m.bank;g.rotation.x=mix(g.rotation.x,state.braking?.045:state.boosting?-.025:0,blend);g.position.y=Math.sin((m.driveTime=(m.driveTime||0)+dt)*18)*Math.min(.012,(state.speed||0)*.001);
 for(const wheel of m.wheels)wheel.rotation.x+=dt*(state.speed||0)/.49;m.wheels[1].rotation.y=mix(m.wheels[1].rotation.y,cap(-rate*.08,-.17,.17),blend);
 animateProgram(m.rider,dt,{...state,bank:m.bank});return m.bank;
}
export function treadPoint(distance){
 const radius=.42,straight=3.5,arc=Math.PI*radius,length=straight*2+arc*2,u=((distance%length)+length)%length;
 if(u<straight)return{z:-1.75+u,y:1.04,angle:0};if(u<straight+arc){const a=(u-straight)/radius;return{z:1.75+radius*Math.sin(a),y:.62+radius*Math.cos(a),angle:a}}
 if(u<straight*2+arc)return{z:1.75-(u-straight-arc),y:.2,angle:Math.PI};const a=(u-straight*2-arc)/radius;return{z:-1.75-radius*Math.sin(a),y:.62-radius*Math.cos(a),angle:Math.PI+a};
}
export function animateTank(g,dt,state={}){
 const m=g.userData,dummy=m.treadDummy??=new T.Object3D(),turn=state.turn||0,speed=state.speed||0;let index=0;
 for(let side=0;side<2;side++){m.trackTravel[side]+=dt*(speed+(side?1:-1)*turn*1.95);for(let i=0;i<36;i++){const point=treadPoint(i/36*(7+Math.PI*.84)+m.trackTravel[side]);dummy.position.set((side?1:-1)*1.95,point.y,point.z);dummy.rotation.set(point.angle,0,0);dummy.updateMatrix();m.treads.setMatrixAt(index++,dummy.matrix)}}m.treads.instanceMatrix.needsUpdate=true;
 for(const wheel of m.tracks)wheel.rotation.x+=dt*speed/.36;m.turret.rotation.y=(state.turretYaw||0)-(state.yaw||0);
 const elapsed=Math.max(0,.35-(state.action||0)),recoil=state.action>0?(1-Math.exp(-elapsed*100))*Math.exp(-elapsed*13):0;m.barrel.position.z=.65-recoil*.36;m.turret.rotation.x=-recoil*.025;m.flash.visible=(state.action||0)>.26;m.flash.material.opacity=cap((state.action||0)/.35,0,1);m.flash.scale.setScalar(.6+recoil*.8);
 m.shield.visible=state.shield>0;const shieldFade=Math.min(1,(state.shield||0)*2);m.shield.material.opacity=.10*shieldFade;m.shield.scale.set(1,.65,1).multiplyScalar(1+Math.sin((state.shield||0)*16)*.012);g.rotation.x=mix(g.rotation.x,cap(-(speed-(m.lastSpeed??speed))*.018,-.025,.025),1-Math.exp(-dt*8));m.lastSpeed=speed;
}

export function jetModel(color=COLORS.cyan,options={}){
 const g=new T.Group(),black=metal(0x09131c),armor=metal(0x263d4a),glow=light(color),wings=[];
 const body=mesh(g,surface([[-2.5,.08,.06],[-1.8,.42,.24],[-.2,.54,.32],[1.6,.26,.21],[2.6,.025,.035]],24),black);body.rotation.x=Math.PI/2;
 for(const side of[-1,1]){const wing=new T.Group();wing.position.x=side*.38;g.add(wing);const shape=new T.Shape();shape.moveTo(0,1);shape.lineTo(side*3.55,-1.2);shape.lineTo(side*3.0,-2.0);shape.lineTo(0,-1.1);shape.closePath();const panel=mesh(wing,new T.ExtrudeGeometry(shape,{depth:.09,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:1,steps:1}),armor);panel.rotation.x=Math.PI/2;
  circuit(wing,glow,[[0,.06,1],[side*3.55,.06,-1.2],[side*3,.06,-2],[0,.06,-1.1]],.026);const cannon=box(g,black,.15,.16,1.3,side*.92,-.04,.85);box(g,glow,.09,.09,.035,side*.92,-.04,1.52);const tail=box(g,armor,.10,.75,.8,side*.7,.4,-1.5);tail.rotation.z=-side*.3;circuit(g,glow,[[side*.73,.2,-1.8],[side*.9,.75,-1.8],[side*.9,.75,-1.1]],.018);wings.push(wing)}
 const canopy=oval(g,new T.MeshPhysicalMaterial({color:0x0a2e40,metalness:.7,roughness:.17,clearcoat:1,transparent:true,opacity:.8}),.48,0,.28,.25,.85,.62,1.75);const pilot=programModel(color,{...options,rider:true});pilot.scale.setScalar(.38);pilot.position.set(0,.12,-.2);g.add(pilot);
 const engines=[];for(const side of[-1,1]){const ring=mesh(g,new T.TorusGeometry(.17,.03,6,24),glow,side*.30,.02,-2.03);const flame=mesh(g,new T.ConeGeometry(.13,.8,10),new T.MeshBasicMaterial({color,transparent:true,opacity:.7,depthWrite:false,blending:T.AdditiveBlending}),side*.30,.02,-2.4);flame.rotation.x=-Math.PI/2;engines.push(flame)}g.userData={wings,pilot,engines,bank:0};return g;
}
export function animateJet(g,dt,state={}){
 const m=g.userData,blend=1-Math.exp(-dt*7);m.bank=mix(m.bank,cap(-(state.turn||0)*.4,-.7,.7),blend);g.rotation.z=m.bank;g.rotation.x=-(state.pitch||0);for(let i=0;i<m.wings.length;i++)m.wings[i].rotation.z=mix(m.wings[i].rotation.z,(i?1:-1)*(state.braking?.27:state.boosting?-.08:0),blend);for(const flame of m.engines){flame.scale.y=mix(flame.scale.y,state.boosting?2.2:.8,blend);flame.material.opacity=state.boosting?.85:.5}animateProgram(m.pilot,dt,{speed:0,boosting:state.boosting,bank:m.bank});
}
