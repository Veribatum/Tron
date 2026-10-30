import * as T from '../vendor/three.module.js';
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
export function programModel(color=COLORS.cyan,{heavy=false,rider=false,frame='male',helmet=true}={}){
 const female=frame==='female',g=new T.Group(),suit=new T.MeshStandardMaterial({color:0x182530,roughness:.56,metalness:.3}),armor=new T.MeshStandardMaterial({color:heavy?0x3b434b:0x354450,roughness:.46,metalness:.4}),edge=metal(0x526572),glow=light(color),rubber=metal(0x080e16),face=new T.MeshStandardMaterial({color:female?0xd4b4a0:0xbca78e,roughness:.68,metalness:0}),hair=metal(0x10161c),rig={};
 const hips=new T.Group();hips.position.y=1.03;g.add(hips);rig.hips=hips;
 const pelvis=mesh(hips,surface([[-.12,.19,.12],[0,.245,.15],[.1,female?.21:.23,.14],[.16,.18,.13]]),suit);pelvis.scale.x=heavy?1.25:1;
 const torso=new T.Group();hips.add(torso);rig.torso=torso;
 mesh(torso,surface([[.05,.20,.135],[.18,female?.16:.21,.12],[.32,female?.18:.245,.13],[.47,female?.245:.29,female?.18:.17],[.60,female?.255:.30,.15],[.69,female?.22:.27,.115],[.73,.105,.09]]),suit).scale.x=heavy?1.25:1;
 for(const side of[-1,1]){
  const plate=mesh(torso,surface([[.36,.085,.028],[.43,.12,.06],[.54,.125,.055],[.62,.105,.03],[.65,.07,.015]],20),armor,side*(female?.118:.132),0,.13);plate.rotation.z=side*-.08;
  circuit(torso,glow,[[side*.08,.67,.145],[side*.21,.63,.15],[side*(female?.225:.27),.51,.15],[side*.17,.37,.16],[side*(female?.135:.17),.22,.137]]);
  circuit(torso,edge,[[side*.10,.37,.151],[side*.08,.27,.135],[side*.09,.17,.14]],.007);
  circuit(torso,glow,[[side*.20,.13,-.12],[side*.23,.35,-.14],[side*.22,.58,-.14],[side*.1,.66,-.12]],.009);
  const belt=box(torso,armor,.12,.06,.28,side*.14,.075,0);belt.rotation.z=side*.08;
 }
 for(let i=0;i<3;i++){const plate=mesh(torso,surface([[.13+i*.068,.09,.022],[.17+i*.068,.10,.025],[.19+i*.068,.08,.01]],16),armor,0,0,.133);}
 box(torso,glow,.055,.025,.017,0,.09,.157);
 const back=discModel(color);back.scale.setScalar(.73);back.position.set(0,.48,-.18);torso.add(back);rig.backDisc=back;
 rod(torso,rubber,.077,.14,0,.77,0);const collar=mesh(torso,new T.TorusGeometry(.082,.014,8,24),armor,0,.74,0);collar.rotation.x=Math.PI/2;
 const head=new T.Group();head.position.y=.91;torso.add(head);rig.head=head;
 mesh(head,surface([[-.16,.07,.065],[-.12,.11,.09],[-.02,.142,.127],[.10,.137,.12],[.18,.09,.085],[.205,.018,.02]],28),helmet?armor:face);
 if(helmet){
  const visor=mesh(head,new T.SphereGeometry(.152,28,16,0,Math.PI,Math.PI*.23,Math.PI*.5),new T.MeshPhysicalMaterial({color:0x040e19,metalness:.85,roughness:.12,clearcoat:1}));visor.rotation.y=0;visor.position.set(0,.016,.016);visor.scale.set(1,1.08,1.06);
  circuit(head,glow,[[-.136,.05,.06],[-.115,.09,.13],[0,.10,.17],[.115,.09,.13],[.136,.05,.06]],.008);
  circuit(head,edge,[[-.12,-.05,.10],[-.09,-.12,.115],[0,-.15,.10],[.09,-.12,.115],[.12,-.05,.10]],.012);
  for(const side of[-1,1]){oval(head,rubber,.067,side*.14,.018,0,.32,1,1);circuit(head,glow,[[side*.15,-.055,-.02],[side*.155,.035,-.035],[side*.13,.125,-.025]],.009)}
 }else{
  oval(head,hair,.146,0,.10,-.025,1, .77, .94);if(female){for(const side of[-1,1])oval(head,hair,.105,side*.125,-.04,-.04,.43,2.1,.85)}
  for(const side of[-1,1]){oval(head,face,.035,side*.142,-.01,.008,.4,1,.65);oval(head,new T.MeshStandardMaterial({color:0xcbd3d4,roughness:.65}),.023,side*.056,.025,.13,1,.31,.42);oval(head,rubber,.009,side*.055,.025,.142,.85,1,.35);circuit(head,hair,[[side*.025,.057,.125],[side*.057,.068,.12],[side*.08,.058,.102]],.006)}
  oval(head,face,.028,0,-.015,.137,.55,1.25,1.1);oval(head,new T.MeshStandardMaterial({color:0x986a66,roughness:.8}),.027,0,-.078,.122,1.12,.23,.35);for(const side of[-1,1])oval(head,face,.05,side*.073,-.043,.079,.8,.7,.7);
 }
 for(const side of[-1,1]){
  const suffix=side<0?'L':'R',shoulder=new T.Group();shoulder.position.set(side*(heavy?.385:female?.265:.305),.625,0);torso.add(shoulder);
  oval(shoulder,armor,female?.095:.105,side*.015,-.035,0,heavy?1.45:1,.78,1);circuit(shoulder,glow,[[side*.05,.017,.083],[side*.105,-.04,.06],[side*.095,-.10,.018]],.009);
  mesh(shoulder,surface([[-.32,.055,.057],[-.24,.075,.078],[-.13,female?.075:.09,.085],[-.06,.07,.07]]),suit);
  const elbow=new T.Group();elbow.position.y=-.325;shoulder.add(elbow);oval(elbow,rubber,.059,0,0,0,1,.9,1);
  mesh(elbow,surface([[-.29,.043,.045],[-.22,.065,.063],[-.1,.073,.067],[-.045,.06,.055]]),armor);
  circuit(elbow,glow,[[side*.025,-.05,.062],[side*.038,-.13,.068],[side*.025,-.25,.05]],.009);
  const hand=new T.Group();hand.position.set(0,-.31,.014);elbow.add(hand);oval(hand,suit,.055,0,-.027,0,.82,1.25,.55);
  for(let f=0;f<4;f++){const finger=mesh(hand,new T.CapsuleGeometry(.012,.045,3,7),rubber,(f-1.5)*.023,-.085,.012);finger.rotation.x=-.28}const thumb=mesh(hand,new T.CapsuleGeometry(.017,.035,3,7),suit,-side*.052,-.028,.025);thumb.rotation.z=side*.55;
  shoulder.rotation.z=side*.09;elbow.rotation.x=-.15;rig['arm'+suffix]=shoulder;rig['elbow'+suffix]=elbow;rig['hand'+suffix]=hand;
  const leg=new T.Group();leg.position.set(side*(female?.139:.145),-.03,0);hips.add(leg);
  mesh(leg,surface([[-.43,.069,.073],[-.34,.09,.097],[-.16,female?.115:.11,.117],[-.05,.11,.109],[.015,.095,.09]]),suit);
  const thigh=oval(leg,armor,.1,side*.04,-.21,.044,.75,1.7,.5);thigh.rotation.z=side*.08;
  circuit(leg,glow,[[side*.079,-.06,.063],[side*.09,-.20,.073],[side*.065,-.37,.066]],.01);
  const knee=new T.Group();knee.position.y=-.445;leg.add(knee);oval(knee,rubber,.074,0,0,0,1,1,.8);oval(knee,armor,.08,0,-.005,.047,.8,1.05,.6);
  mesh(knee,surface([[-.43,.061,.064],[-.31,.066,.081],[-.14,.092,.091],[-.045,.073,.073]]),armor);
  circuit(knee,glow,[[side*.045,-.10,.079],[side*.055,-.20,.075],[side*.035,-.37,.065]],.009);
  oval(knee,rubber,.10,0,-.46,.055,.79,.67,1.85);box(knee,armor,.16,.045,.31,0,-.492,.055);circuit(knee,glow,[[-.06,-.456,.17],[0,-.449,.216],[.06,-.456,.17]],.006);
  rig['leg'+suffix]=leg;rig['knee'+suffix]=knee;
 }
 const handDisc=discModel(color);handDisc.scale.setScalar(.63);handDisc.rotation.y=Math.PI/2;handDisc.position.set(.07,-.35,.07);rig.elbowR.add(handDisc);rig.disc=handDisc;
 g.userData.rig=rig;g.userData.phase=0;g.userData.rider=rider;g.userData.frame=frame;if(rider)g.scale.setScalar(.74);return g;
}
export function animateProgram(g,dt,state={}){
 const r=g.userData.rig;g.userData.phase+=dt*(state.moving?9:1.4);const phase=g.userData.phase,stride=state.moving?Math.sin(phase)*.62:0,attack=state.action>0?Math.sin(Math.min(1,state.action/.42)*Math.PI):0;
 r.hips.position.y=1.03+(state.moving?Math.abs(Math.cos(phase))*.028:Math.sin(phase)*.007);r.legL.rotation.x=stride;r.legR.rotation.x=-stride;r.kneeL.rotation.x=Math.max(0,-stride)*.75;r.kneeR.rotation.x=Math.max(0,stride)*.75;
 r.armL.rotation.set(-stride*.6,0,-.09);r.armR.rotation.set(stride*.6-attack*1.55,0,.09+attack*.22);r.elbowL.rotation.x=-.14-Math.max(0,stride)*.4;r.elbowR.rotation.x=-.18-attack*.85;r.torso.rotation.y=stride*.07+attack*.55;r.torso.rotation.x=state.dashing?.3:0;r.head.rotation.y=-attack*.22+Math.sin(phase*.4)*.025;r.disc.visible=!state.thrown;r.backDisc.visible=false;
 if(state.windup>0){r.armR.rotation.x=-1.3;r.elbowR.rotation.x=-1;r.torso.rotation.y=-.3}
 if(g.userData.rider){r.hips.position.y=.74;r.torso.rotation.x=.7;r.legL.rotation.x=r.legR.rotation.x=-1.4;r.kneeL.rotation.x=r.kneeR.rotation.x=1.55;r.armL.rotation.x=r.armR.rotation.x=-1.3;r.elbowL.rotation.x=r.elbowR.rotation.x=-.2;r.disc.visible=false;r.backDisc.visible=true}
}
export function cycleModel(color=COLORS.cyan,options={}){
 const g=new T.Group(),body=metal(0x070b10),rim=metal(0x26333d),glow=light(color),wheels=[];
 for(const z of[-1.05,1.05]){const wheel=new T.Group();wheel.position.set(0,.49,z);g.add(wheel);const tire=mesh(wheel,new T.TorusGeometry(.39,.1,10,36),body);tire.rotation.y=Math.PI/2;for(const side of[-1,1]){const edge=mesh(wheel,new T.TorusGeometry(.39,.024,6,36),glow,side*.1,0,0);edge.rotation.y=Math.PI/2;const hub=rod(wheel,rim,.21,.19,0,0,0);hub.rotation.z=Math.PI/2}wheels.push(wheel)}
 const core=mesh(g,new T.CapsuleGeometry(.29,1.4,8,20),body,0,.64,0);core.rotation.x=Math.PI/2;core.scale.x=.9;const hood=sphere(g,body,.39,0,.73,.83);hood.scale.set(.8,.72,1.5);for(const side of[-1,1]){const line=box(g,glow,.026,.035,1.7,side*.24,.72,.04);box(g,rim,.08,.1,.8,side*.29,.36,0);const rail=box(g,glow,.018,.23,.7,side*.2,.6,.7);rail.rotation.x=.1;box(g,glow,.03,.04,.3,side*.15,.61,-1.2)}
 const glass=mesh(g,new T.SphereGeometry(.32,16,10,0,Math.PI*2,0,Math.PI*.6),metal(0x091c27),0,.86,.5);glass.scale.set(.75,1,1.2);glass.rotation.x=.4;box(g,glow,.26,.05,.04,0,.56,1.48);
 const rider=programModel(color,{...options,rider:true});rider.position.set(0,.31,-.28);g.add(rider);g.userData.rider=rider;g.userData.wheels=wheels;return g;
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
  for(let z=-2;z<2.2;z+=.45)box(pod,trim,1.1,.08,.16,0,.28,z);
 }
 const turret=new T.Group();turret.position.y=1.6;g.add(turret);mesh(turret,surface([[0,.95,1.18],[.4,1.07,1.0],[.70,.66,.65]],12),body);const hatch=mesh(turret,new T.CylinderGeometry(.45,.52,.12,24),black,0,.75,-.1);const ring=mesh(turret,new T.TorusGeometry(.38,.024,6,32),glow,0,.82,-.1);ring.rotation.x=Math.PI/2;
 const barrel=new T.Group();barrel.position.set(0,.45,.65);turret.add(barrel);box(barrel,black,.35,.3,2.7,0,0,1.1);box(barrel,trim,.48,.43,.65,0,0,2.35);box(barrel,glow,.29,.22,.03,0,0,2.69);for(const side of[-1,1])box(barrel,glow,.025,.035,2.35,side*.185,.085,1.1);
 for(const side of[-1,1]){circuit(turret,glow,[[side*.78,.12,-.7],[side*.82,.46,-.25],[side*.6,.61,.35]],.022);box(g,glow,.45,.06,.04,side*.72,1.12,2.25)}
 const shield=mesh(g,new T.SphereGeometry(3.6,24,16),new T.MeshBasicMaterial({color,transparent:true,opacity:.1,wireframe:true,depthWrite:false}),0,.7,0);shield.scale.y=.65;shield.visible=false;g.userData={turret,barrel,tracks,shield};return g;
}
