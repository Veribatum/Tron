// The deck floor masks still handle rooms and cover. Stair surfaces join those
// masks in world space, with the current flight resolving overlapping x/z.
import {WARDEN_STAIRS} from './levels.js?v=12';

function project(point,a,b){
 const dx=b.x-a.x,dz=b.z-a.z,length=Math.hypot(dx,dz);
 const t=Math.max(0,Math.min(1,((point.x-a.x)*dx+(point.z-a.z)*dz)/(length*length)));
 const x=a.x+dx*t,z=a.z+dz*t;
 return {y:a.y+(b.y-a.y)*t,distance:Math.hypot(point.x-x,point.z-z)};
}

export function moveSpire(s,dx,dz,canWalk,enterDeck){
 const p=s.player;
 for(const [xStep,zStep] of [[dx,0],[0,dz]]){
  if(!xStep&&!zStep)continue;
  const to={x:p.x+xStep,z:p.z+zStep};
  if(!s.towerTransit){
   const linkIndex=WARDEN_STAIRS.findIndex((link,i)=>{
    if((i!==s.towerFloor&&i+1!==s.towerFloor)||s.towerProgress[i]<2)return false;
    const mouth=link.points[0],side=Math.sign(mouth.z);
    return Math.abs(to.x-mouth.x)<link.width/2-.5&&side*(p.z-mouth.z)<=0&&side*(to.z-mouth.z)>0;
   });
   if(linkIndex<0){
    if(canWalk(to.x,to.z)){p.x=to.x;p.z=to.z}
    continue;
   }
   const up=linkIndex===s.towerFloor;
   s.towerTransit={linkIndex,up,segment:up?0:WARDEN_STAIRS[linkIndex].points.length-2};
  }
  const {linkIndex,segment}=s.towerTransit,link=WARDEN_STAIRS[linkIndex],points=link.points,last=points.length-2;
  const side=Math.sign(points[0].z);
  if((segment===0||segment===last)&&Math.abs(to.x-points[0].x)<link.width/2-.5&&side*(to.z-points[0].z)<=0){
   p.x=to.x;p.z=to.z;
   enterDeck(linkIndex+(segment===last?1:0));
   continue;
  }
  const candidates=[segment,segment-1,segment+1].filter(i=>i>=0&&i<=last).map(i=>({...project(to,points[i],points[i+1]),segment:i}));
  const next=candidates.reduce((a,b)=>a.distance<=b.distance?a:b);
  if(next.distance<=link.width/2-.5){
   p.x=to.x;p.z=to.z;p.y=next.y;s.towerTransit.segment=next.segment;
  }
 }
}

export function stairNavigation(s){
 const {linkIndex,up,segment}=s.towerTransit,link=WARDEN_STAIRS[linkIndex];
 const route=up?link.points.slice(segment+1):link.points.slice(0,segment+1).reverse();
 // Guide one step onto the destination deck so its navigation takes over.
 const endpoint=route.at(-1);
 route[route.length-1]={...endpoint,z:endpoint.z-Math.sign(endpoint.z)*2};
 if(route.length>1&&Math.hypot(s.player.x-route[0].x,s.player.z-route[0].z)<1)route.shift();
 return {point:route[0],route,destination:route.at(-1),label:link.name};
}
