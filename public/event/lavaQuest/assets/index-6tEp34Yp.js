(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const l of document.querySelectorAll('link[rel="modulepreload"]'))r(l);new MutationObserver(l=>{for(const c of l)if(c.type==="childList")for(const d of c.addedNodes)d.tagName==="LINK"&&d.rel==="modulepreload"&&r(d)}).observe(document,{childList:!0,subtree:!0});function i(l){const c={};return l.integrity&&(c.integrity=l.integrity),l.referrerPolicy&&(c.referrerPolicy=l.referrerPolicy),l.crossOrigin==="use-credentials"?c.credentials="include":l.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(l){if(l.ep)return;l.ep=!0;const c=i(l);fetch(l.href,c)}})();const Pd="lq_session_v1",Yh=2;function Px(s){const t=[];let i=0;const r=[];let l="",c=!1;for(;i<s.length;){const h=s[i];if(c){if(h==='"'){if(s[i+1]==='"'){l+='"',i+=2;continue}c=!1,i+=1;continue}l+=h,i+=1;continue}if(h==='"'){c=!0,i+=1;continue}if(h===","){r.push(l),l="",i+=1;continue}if(h==="\r"){i+=1;continue}if(h===`
`){r.push(l),r.some(p=>p.length>0)&&t.push(r.slice()),r.length=0,l="",i+=1;continue}l+=h,i+=1}if(r.push(l),r.some(h=>h.length>0)&&t.push(r.slice()),t.length===0)return[];const d=t[0].map(h=>h.trim());return t.slice(1).map(h=>{const p={};return d.forEach((m,g)=>{p[m]=(h[g]??"").trim()}),p})}async function Po(s){const t=String(s).replace(/^\//,""),i="./",l=`${i.endsWith("/")?i:`${i}/`}${t}`,c=await fetch(l);if(!c.ok)throw new Error(`CSV fetch failed: ${l} (${c.status})`);return Px(await c.text())}function Bx(){try{const s=localStorage.getItem(Pd);return s?JSON.parse(s):null}catch{return null}}function Ix(s){try{localStorage.setItem(Pd,JSON.stringify(s))}catch{}}function Zh(){try{localStorage.removeItem(Pd)}catch{}}function Fx(s,t){const i=Number(t);return s.filter(r=>Number(r.level)===i)}function jh(s){const t=/^bot_(\d+)$/.exec(s.trim());return t?Number.parseInt(t[1],10)-1:-1}async function hc(s){await new Promise(t=>setTimeout(t,s))}function Hx(s,t){const i=Fx(s,t),r=new Map;for(const l of i){const c=jh(l.bot_id);if(c<=0)continue;const d=Number.parseFloat(String(l.delay_ms??"0"))||0,h=r.get(c);(h===void 0||d<h)&&r.set(c,d)}return[...r.entries()].map(([l,c])=>({idx:l,delay_ms:c})).sort((l,c)=>l.delay_ms-c.delay_ms||l.idx-c.idx)}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Bd="172",Gx=0,N_=1,Vx=2,K0=1,kx=2,oa=3,Za=0,qn=1,la=2,Wa=0,ws=1,O_=2,z_=3,P_=4,Xx=5,Tr=100,qx=101,Wx=102,Yx=103,Zx=104,jx=200,Kx=201,Qx=202,Jx=203,Kh=204,Qh=205,$x=206,tS=207,eS=208,nS=209,iS=210,aS=211,rS=212,sS=213,oS=214,Jh=0,$h=1,td=2,Ls=3,ed=4,nd=5,id=6,ad=7,Id=0,lS=1,cS=2,Ya=0,uS=1,fS=2,hS=3,dS=4,pS=5,mS=6,gS=7,Q0=300,Ns=301,Os=302,rd=303,sd=304,Qc=306,qc=1e3,Ar=1001,od=1002,Ai=1003,_S=1004,dc=1005,Ni=1006,lh=1007,Rr=1008,da=1009,J0=1010,$0=1011,Zo=1012,Fd=1013,Cr=1014,ca=1015,$o=1016,Hd=1017,Gd=1018,zs=1020,tv=35902,ev=1021,nv=1022,bi=1023,iv=1024,av=1025,Ds=1026,Ps=1027,rv=1028,Vd=1029,sv=1030,kd=1031,Xd=1033,Bc=33776,Ic=33777,Fc=33778,Hc=33779,ld=35840,cd=35841,ud=35842,fd=35843,hd=36196,dd=37492,pd=37496,md=37808,gd=37809,_d=37810,vd=37811,yd=37812,xd=37813,Sd=37814,Md=37815,Ed=37816,Td=37817,bd=37818,Ad=37819,Rd=37820,Cd=37821,Gc=36492,wd=36494,Dd=36495,ov=36283,Ud=36284,Ld=36285,Nd=36286,vS=3200,yS=3201,lv=0,xS=1,Xa="",di="srgb",Bs="srgb-linear",Wc="linear",Fe="srgb",fs=7680,B_=519,SS=512,MS=513,ES=514,cv=515,TS=516,bS=517,AS=518,RS=519,I_=35044,F_="300 es",ua=2e3,Yc=2001;class Fs{addEventListener(t,i){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[t]===void 0&&(r[t]=[]),r[t].indexOf(i)===-1&&r[t].push(i)}hasEventListener(t,i){if(this._listeners===void 0)return!1;const r=this._listeners;return r[t]!==void 0&&r[t].indexOf(i)!==-1}removeEventListener(t,i){if(this._listeners===void 0)return;const l=this._listeners[t];if(l!==void 0){const c=l.indexOf(i);c!==-1&&l.splice(c,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const r=this._listeners[t.type];if(r!==void 0){t.target=this;const l=r.slice(0);for(let c=0,d=l.length;c<d;c++)l[c].call(this,t);t.target=null}}}const Rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let H_=1234567;const Wo=Math.PI/180,jo=180/Math.PI;function Hs(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Rn[s&255]+Rn[s>>8&255]+Rn[s>>16&255]+Rn[s>>24&255]+"-"+Rn[t&255]+Rn[t>>8&255]+"-"+Rn[t>>16&15|64]+Rn[t>>24&255]+"-"+Rn[i&63|128]+Rn[i>>8&255]+"-"+Rn[i>>16&255]+Rn[i>>24&255]+Rn[r&255]+Rn[r>>8&255]+Rn[r>>16&255]+Rn[r>>24&255]).toLowerCase()}function ve(s,t,i){return Math.max(t,Math.min(i,s))}function qd(s,t){return(s%t+t)%t}function CS(s,t,i,r,l){return r+(s-t)*(l-r)/(i-t)}function wS(s,t,i){return s!==t?(i-s)/(t-s):0}function Yo(s,t,i){return(1-i)*s+i*t}function DS(s,t,i,r){return Yo(s,t,1-Math.exp(-i*r))}function US(s,t=1){return t-Math.abs(qd(s,t*2)-t)}function LS(s,t,i){return s<=t?0:s>=i?1:(s=(s-t)/(i-t),s*s*(3-2*s))}function NS(s,t,i){return s<=t?0:s>=i?1:(s=(s-t)/(i-t),s*s*s*(s*(s*6-15)+10))}function OS(s,t){return s+Math.floor(Math.random()*(t-s+1))}function zS(s,t){return s+Math.random()*(t-s)}function PS(s){return s*(.5-Math.random())}function BS(s){s!==void 0&&(H_=s);let t=H_+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function IS(s){return s*Wo}function FS(s){return s*jo}function HS(s){return(s&s-1)===0&&s!==0}function GS(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function VS(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function kS(s,t,i,r,l){const c=Math.cos,d=Math.sin,h=c(i/2),p=d(i/2),m=c((t+r)/2),g=d((t+r)/2),_=c((t-r)/2),x=d((t-r)/2),M=c((r-t)/2),E=d((r-t)/2);switch(l){case"XYX":s.set(h*g,p*_,p*x,h*m);break;case"YZY":s.set(p*x,h*g,p*_,h*m);break;case"ZXZ":s.set(p*_,p*x,h*g,h*m);break;case"XZX":s.set(h*g,p*E,p*M,h*m);break;case"YXY":s.set(p*M,h*g,p*E,h*m);break;case"ZYZ":s.set(p*E,p*M,h*g,h*m);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+l)}}function bs(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function zn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Oi={DEG2RAD:Wo,RAD2DEG:jo,generateUUID:Hs,clamp:ve,euclideanModulo:qd,mapLinear:CS,inverseLerp:wS,lerp:Yo,damp:DS,pingpong:US,smoothstep:LS,smootherstep:NS,randInt:OS,randFloat:zS,randFloatSpread:PS,seededRandom:BS,degToRad:IS,radToDeg:FS,isPowerOfTwo:HS,ceilPowerOfTwo:GS,floorPowerOfTwo:VS,setQuaternionFromProperEuler:kS,normalize:zn,denormalize:bs};class De{constructor(t=0,i=0){De.prototype.isVector2=!0,this.x=t,this.y=i}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,i){return this.x=t,this.y=i,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const i=this.x,r=this.y,l=t.elements;return this.x=l[0]*i+l[3]*r+l[6],this.y=l[1]*i+l[4]*r+l[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,i){return this.x=ve(this.x,t.x,i.x),this.y=ve(this.y,t.y,i.y),this}clampScalar(t,i){return this.x=ve(this.x,t,i),this.y=ve(this.y,t,i),this}clampLength(t,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(t)/i;return Math.acos(ve(r,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,r=this.y-t.y;return i*i+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this}rotateAround(t,i){const r=Math.cos(i),l=Math.sin(i),c=this.x-t.x,d=this.y-t.y;return this.x=c*r-d*l+t.x,this.y=c*l+d*r+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ue{constructor(t,i,r,l,c,d,h,p,m){ue.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,i,r,l,c,d,h,p,m)}set(t,i,r,l,c,d,h,p,m){const g=this.elements;return g[0]=t,g[1]=l,g[2]=h,g[3]=i,g[4]=c,g[5]=p,g[6]=r,g[7]=d,g[8]=m,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const i=this.elements,r=t.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],this}extractBasis(t,i,r){return t.setFromMatrix3Column(this,0),i.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const i=t.elements;return this.set(i[0],i[4],i[8],i[1],i[5],i[9],i[2],i[6],i[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const r=t.elements,l=i.elements,c=this.elements,d=r[0],h=r[3],p=r[6],m=r[1],g=r[4],_=r[7],x=r[2],M=r[5],E=r[8],A=l[0],S=l[3],v=l[6],P=l[1],N=l[4],D=l[7],q=l[2],H=l[5],O=l[8];return c[0]=d*A+h*P+p*q,c[3]=d*S+h*N+p*H,c[6]=d*v+h*D+p*O,c[1]=m*A+g*P+_*q,c[4]=m*S+g*N+_*H,c[7]=m*v+g*D+_*O,c[2]=x*A+M*P+E*q,c[5]=x*S+M*N+E*H,c[8]=x*v+M*D+E*O,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[3]*=t,i[6]*=t,i[1]*=t,i[4]*=t,i[7]*=t,i[2]*=t,i[5]*=t,i[8]*=t,this}determinant(){const t=this.elements,i=t[0],r=t[1],l=t[2],c=t[3],d=t[4],h=t[5],p=t[6],m=t[7],g=t[8];return i*d*g-i*h*m-r*c*g+r*h*p+l*c*m-l*d*p}invert(){const t=this.elements,i=t[0],r=t[1],l=t[2],c=t[3],d=t[4],h=t[5],p=t[6],m=t[7],g=t[8],_=g*d-h*m,x=h*p-g*c,M=m*c-d*p,E=i*_+r*x+l*M;if(E===0)return this.set(0,0,0,0,0,0,0,0,0);const A=1/E;return t[0]=_*A,t[1]=(l*m-g*r)*A,t[2]=(h*r-l*d)*A,t[3]=x*A,t[4]=(g*i-l*p)*A,t[5]=(l*c-h*i)*A,t[6]=M*A,t[7]=(r*p-m*i)*A,t[8]=(d*i-r*c)*A,this}transpose(){let t;const i=this.elements;return t=i[1],i[1]=i[3],i[3]=t,t=i[2],i[2]=i[6],i[6]=t,t=i[5],i[5]=i[7],i[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const i=this.elements;return t[0]=i[0],t[1]=i[3],t[2]=i[6],t[3]=i[1],t[4]=i[4],t[5]=i[7],t[6]=i[2],t[7]=i[5],t[8]=i[8],this}setUvTransform(t,i,r,l,c,d,h){const p=Math.cos(c),m=Math.sin(c);return this.set(r*p,r*m,-r*(p*d+m*h)+d+t,-l*m,l*p,-l*(-m*d+p*h)+h+i,0,0,1),this}scale(t,i){return this.premultiply(ch.makeScale(t,i)),this}rotate(t){return this.premultiply(ch.makeRotation(-t)),this}translate(t,i){return this.premultiply(ch.makeTranslation(t,i)),this}makeTranslation(t,i){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,i,0,0,1),this}makeRotation(t){const i=Math.cos(t),r=Math.sin(t);return this.set(i,-r,0,r,i,0,0,0,1),this}makeScale(t,i){return this.set(t,0,0,0,i,0,0,0,1),this}equals(t){const i=this.elements,r=t.elements;for(let l=0;l<9;l++)if(i[l]!==r[l])return!1;return!0}fromArray(t,i=0){for(let r=0;r<9;r++)this.elements[r]=t[r+i];return this}toArray(t=[],i=0){const r=this.elements;return t[i]=r[0],t[i+1]=r[1],t[i+2]=r[2],t[i+3]=r[3],t[i+4]=r[4],t[i+5]=r[5],t[i+6]=r[6],t[i+7]=r[7],t[i+8]=r[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ch=new ue;function uv(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Ko(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function XS(){const s=Ko("canvas");return s.style.display="block",s}const G_={};function As(s){s in G_||(G_[s]=!0,console.warn(s))}function qS(s,t,i){return new Promise(function(r,l){function c(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:l();break;case s.TIMEOUT_EXPIRED:setTimeout(c,i);break;default:r()}}setTimeout(c,i)})}function WS(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function YS(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const V_=new ue().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),k_=new ue().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ZS(){const s={enabled:!0,workingColorSpace:Bs,spaces:{},convert:function(l,c,d){return this.enabled===!1||c===d||!c||!d||(this.spaces[c].transfer===Fe&&(l.r=ha(l.r),l.g=ha(l.g),l.b=ha(l.b)),this.spaces[c].primaries!==this.spaces[d].primaries&&(l.applyMatrix3(this.spaces[c].toXYZ),l.applyMatrix3(this.spaces[d].fromXYZ)),this.spaces[d].transfer===Fe&&(l.r=Us(l.r),l.g=Us(l.g),l.b=Us(l.b))),l},fromWorkingColorSpace:function(l,c){return this.convert(l,this.workingColorSpace,c)},toWorkingColorSpace:function(l,c){return this.convert(l,c,this.workingColorSpace)},getPrimaries:function(l){return this.spaces[l].primaries},getTransfer:function(l){return l===Xa?Wc:this.spaces[l].transfer},getLuminanceCoefficients:function(l,c=this.workingColorSpace){return l.fromArray(this.spaces[c].luminanceCoefficients)},define:function(l){Object.assign(this.spaces,l)},_getMatrix:function(l,c,d){return l.copy(this.spaces[c].toXYZ).multiply(this.spaces[d].fromXYZ)},_getDrawingBufferColorSpace:function(l){return this.spaces[l].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(l=this.workingColorSpace){return this.spaces[l].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],i=[.2126,.7152,.0722],r=[.3127,.329];return s.define({[Bs]:{primaries:t,whitePoint:r,transfer:Wc,toXYZ:V_,fromXYZ:k_,luminanceCoefficients:i,workingColorSpaceConfig:{unpackColorSpace:di},outputColorSpaceConfig:{drawingBufferColorSpace:di}},[di]:{primaries:t,whitePoint:r,transfer:Fe,toXYZ:V_,fromXYZ:k_,luminanceCoefficients:i,outputColorSpaceConfig:{drawingBufferColorSpace:di}}}),s}const we=ZS();function ha(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Us(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let hs;class jS{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{hs===void 0&&(hs=Ko("canvas")),hs.width=t.width,hs.height=t.height;const r=hs.getContext("2d");t instanceof ImageData?r.putImageData(t,0,0):r.drawImage(t,0,0,t.width,t.height),i=hs}return i.width>2048||i.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),i.toDataURL("image/jpeg",.6)):i.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const i=Ko("canvas");i.width=t.width,i.height=t.height;const r=i.getContext("2d");r.drawImage(t,0,0,t.width,t.height);const l=r.getImageData(0,0,t.width,t.height),c=l.data;for(let d=0;d<c.length;d++)c[d]=ha(c[d]/255)*255;return r.putImageData(l,0,0),i}else if(t.data){const i=t.data.slice(0);for(let r=0;r<i.length;r++)i instanceof Uint8Array||i instanceof Uint8ClampedArray?i[r]=Math.floor(ha(i[r]/255)*255):i[r]=ha(i[r]);return{data:i,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let KS=0;class fv{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:KS++}),this.uuid=Hs(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const r={uuid:this.uuid,url:""},l=this.data;if(l!==null){let c;if(Array.isArray(l)){c=[];for(let d=0,h=l.length;d<h;d++)l[d].isDataTexture?c.push(uh(l[d].image)):c.push(uh(l[d]))}else c=uh(l);r.url=c}return i||(t.images[this.uuid]=r),r}}function uh(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?jS.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let QS=0;class Un extends Fs{constructor(t=Un.DEFAULT_IMAGE,i=Un.DEFAULT_MAPPING,r=Ar,l=Ar,c=Ni,d=Rr,h=bi,p=da,m=Un.DEFAULT_ANISOTROPY,g=Xa){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:QS++}),this.uuid=Hs(),this.name="",this.source=new fv(t),this.mipmaps=[],this.mapping=i,this.channel=0,this.wrapS=r,this.wrapT=l,this.magFilter=c,this.minFilter=d,this.anisotropy=m,this.format=h,this.internalFormat=null,this.type=p,this.offset=new De(0,0),this.repeat=new De(1,1),this.center=new De(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ue,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=g,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const i=t===void 0||typeof t=="string";if(!i&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),i||(t.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Q0)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case qc:t.x=t.x-Math.floor(t.x);break;case Ar:t.x=t.x<0?0:1;break;case od:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case qc:t.y=t.y-Math.floor(t.y);break;case Ar:t.y=t.y<0?0:1;break;case od:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Un.DEFAULT_IMAGE=null;Un.DEFAULT_MAPPING=Q0;Un.DEFAULT_ANISOTROPY=1;class $e{constructor(t=0,i=0,r=0,l=1){$e.prototype.isVector4=!0,this.x=t,this.y=i,this.z=r,this.w=l}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,i,r,l){return this.x=t,this.y=i,this.z=r,this.w=l,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;case 3:this.w=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this.w=t.w+i.w,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this.w+=t.w*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this.w=t.w-i.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const i=this.x,r=this.y,l=this.z,c=this.w,d=t.elements;return this.x=d[0]*i+d[4]*r+d[8]*l+d[12]*c,this.y=d[1]*i+d[5]*r+d[9]*l+d[13]*c,this.z=d[2]*i+d[6]*r+d[10]*l+d[14]*c,this.w=d[3]*i+d[7]*r+d[11]*l+d[15]*c,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const i=Math.sqrt(1-t.w*t.w);return i<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/i,this.y=t.y/i,this.z=t.z/i),this}setAxisAngleFromRotationMatrix(t){let i,r,l,c;const p=t.elements,m=p[0],g=p[4],_=p[8],x=p[1],M=p[5],E=p[9],A=p[2],S=p[6],v=p[10];if(Math.abs(g-x)<.01&&Math.abs(_-A)<.01&&Math.abs(E-S)<.01){if(Math.abs(g+x)<.1&&Math.abs(_+A)<.1&&Math.abs(E+S)<.1&&Math.abs(m+M+v-3)<.1)return this.set(1,0,0,0),this;i=Math.PI;const N=(m+1)/2,D=(M+1)/2,q=(v+1)/2,H=(g+x)/4,O=(_+A)/4,V=(E+S)/4;return N>D&&N>q?N<.01?(r=0,l=.707106781,c=.707106781):(r=Math.sqrt(N),l=H/r,c=O/r):D>q?D<.01?(r=.707106781,l=0,c=.707106781):(l=Math.sqrt(D),r=H/l,c=V/l):q<.01?(r=.707106781,l=.707106781,c=0):(c=Math.sqrt(q),r=O/c,l=V/c),this.set(r,l,c,i),this}let P=Math.sqrt((S-E)*(S-E)+(_-A)*(_-A)+(x-g)*(x-g));return Math.abs(P)<.001&&(P=1),this.x=(S-E)/P,this.y=(_-A)/P,this.z=(x-g)/P,this.w=Math.acos((m+M+v-1)/2),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this.w=i[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,i){return this.x=ve(this.x,t.x,i.x),this.y=ve(this.y,t.y,i.y),this.z=ve(this.z,t.z,i.z),this.w=ve(this.w,t.w,i.w),this}clampScalar(t,i){return this.x=ve(this.x,t,i),this.y=ve(this.y,t,i),this.z=ve(this.z,t,i),this.w=ve(this.w,t,i),this}clampLength(t,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this.w+=(t.w-this.w)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this.z=t.z+(i.z-t.z)*r,this.w=t.w+(i.w-t.w)*r,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this.w=t[i+3],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t[i+3]=this.w,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this.w=t.getW(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class JS extends Fs{constructor(t=1,i=1,r={}){super(),this.isRenderTarget=!0,this.width=t,this.height=i,this.depth=1,this.scissor=new $e(0,0,t,i),this.scissorTest=!1,this.viewport=new $e(0,0,t,i);const l={width:t,height:i,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ni,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const c=new Un(l,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);c.flipY=!1,c.generateMipmaps=r.generateMipmaps,c.internalFormat=r.internalFormat,this.textures=[];const d=r.count;for(let h=0;h<d;h++)this.textures[h]=c.clone(),this.textures[h].isRenderTargetTexture=!0,this.textures[h].renderTarget=this;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,i,r=1){if(this.width!==t||this.height!==i||this.depth!==r){this.width=t,this.height=i,this.depth=r;for(let l=0,c=this.textures.length;l<c;l++)this.textures[l].image.width=t,this.textures[l].image.height=i,this.textures[l].image.depth=r;this.dispose()}this.viewport.set(0,0,t,i),this.scissor.set(0,0,t,i)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let r=0,l=t.textures.length;r<l;r++)this.textures[r]=t.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;const i=Object.assign({},t.texture.image);return this.texture.source=new fv(i),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class wr extends JS{constructor(t=1,i=1,r={}){super(t,i,r),this.isWebGLRenderTarget=!0}}class hv extends Un{constructor(t=null,i=1,r=1,l=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:i,height:r,depth:l},this.magFilter=Ai,this.minFilter=Ai,this.wrapR=Ar,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class $S extends Un{constructor(t=null,i=1,r=1,l=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:i,height:r,depth:l},this.magFilter=Ai,this.minFilter=Ai,this.wrapR=Ar,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class tl{constructor(t=0,i=0,r=0,l=1){this.isQuaternion=!0,this._x=t,this._y=i,this._z=r,this._w=l}static slerpFlat(t,i,r,l,c,d,h){let p=r[l+0],m=r[l+1],g=r[l+2],_=r[l+3];const x=c[d+0],M=c[d+1],E=c[d+2],A=c[d+3];if(h===0){t[i+0]=p,t[i+1]=m,t[i+2]=g,t[i+3]=_;return}if(h===1){t[i+0]=x,t[i+1]=M,t[i+2]=E,t[i+3]=A;return}if(_!==A||p!==x||m!==M||g!==E){let S=1-h;const v=p*x+m*M+g*E+_*A,P=v>=0?1:-1,N=1-v*v;if(N>Number.EPSILON){const q=Math.sqrt(N),H=Math.atan2(q,v*P);S=Math.sin(S*H)/q,h=Math.sin(h*H)/q}const D=h*P;if(p=p*S+x*D,m=m*S+M*D,g=g*S+E*D,_=_*S+A*D,S===1-h){const q=1/Math.sqrt(p*p+m*m+g*g+_*_);p*=q,m*=q,g*=q,_*=q}}t[i]=p,t[i+1]=m,t[i+2]=g,t[i+3]=_}static multiplyQuaternionsFlat(t,i,r,l,c,d){const h=r[l],p=r[l+1],m=r[l+2],g=r[l+3],_=c[d],x=c[d+1],M=c[d+2],E=c[d+3];return t[i]=h*E+g*_+p*M-m*x,t[i+1]=p*E+g*x+m*_-h*M,t[i+2]=m*E+g*M+h*x-p*_,t[i+3]=g*E-h*_-p*x-m*M,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,i,r,l){return this._x=t,this._y=i,this._z=r,this._w=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,i=!0){const r=t._x,l=t._y,c=t._z,d=t._order,h=Math.cos,p=Math.sin,m=h(r/2),g=h(l/2),_=h(c/2),x=p(r/2),M=p(l/2),E=p(c/2);switch(d){case"XYZ":this._x=x*g*_+m*M*E,this._y=m*M*_-x*g*E,this._z=m*g*E+x*M*_,this._w=m*g*_-x*M*E;break;case"YXZ":this._x=x*g*_+m*M*E,this._y=m*M*_-x*g*E,this._z=m*g*E-x*M*_,this._w=m*g*_+x*M*E;break;case"ZXY":this._x=x*g*_-m*M*E,this._y=m*M*_+x*g*E,this._z=m*g*E+x*M*_,this._w=m*g*_-x*M*E;break;case"ZYX":this._x=x*g*_-m*M*E,this._y=m*M*_+x*g*E,this._z=m*g*E-x*M*_,this._w=m*g*_+x*M*E;break;case"YZX":this._x=x*g*_+m*M*E,this._y=m*M*_+x*g*E,this._z=m*g*E-x*M*_,this._w=m*g*_-x*M*E;break;case"XZY":this._x=x*g*_-m*M*E,this._y=m*M*_-x*g*E,this._z=m*g*E+x*M*_,this._w=m*g*_+x*M*E;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+d)}return i===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,i){const r=i/2,l=Math.sin(r);return this._x=t.x*l,this._y=t.y*l,this._z=t.z*l,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(t){const i=t.elements,r=i[0],l=i[4],c=i[8],d=i[1],h=i[5],p=i[9],m=i[2],g=i[6],_=i[10],x=r+h+_;if(x>0){const M=.5/Math.sqrt(x+1);this._w=.25/M,this._x=(g-p)*M,this._y=(c-m)*M,this._z=(d-l)*M}else if(r>h&&r>_){const M=2*Math.sqrt(1+r-h-_);this._w=(g-p)/M,this._x=.25*M,this._y=(l+d)/M,this._z=(c+m)/M}else if(h>_){const M=2*Math.sqrt(1+h-r-_);this._w=(c-m)/M,this._x=(l+d)/M,this._y=.25*M,this._z=(p+g)/M}else{const M=2*Math.sqrt(1+_-r-h);this._w=(d-l)/M,this._x=(c+m)/M,this._y=(p+g)/M,this._z=.25*M}return this._onChangeCallback(),this}setFromUnitVectors(t,i){let r=t.dot(i)+1;return r<Number.EPSILON?(r=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=r):(this._x=0,this._y=-t.z,this._z=t.y,this._w=r)):(this._x=t.y*i.z-t.z*i.y,this._y=t.z*i.x-t.x*i.z,this._z=t.x*i.y-t.y*i.x,this._w=r),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ve(this.dot(t),-1,1)))}rotateTowards(t,i){const r=this.angleTo(t);if(r===0)return this;const l=Math.min(1,i/r);return this.slerp(t,l),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,i){const r=t._x,l=t._y,c=t._z,d=t._w,h=i._x,p=i._y,m=i._z,g=i._w;return this._x=r*g+d*h+l*m-c*p,this._y=l*g+d*p+c*h-r*m,this._z=c*g+d*m+r*p-l*h,this._w=d*g-r*h-l*p-c*m,this._onChangeCallback(),this}slerp(t,i){if(i===0)return this;if(i===1)return this.copy(t);const r=this._x,l=this._y,c=this._z,d=this._w;let h=d*t._w+r*t._x+l*t._y+c*t._z;if(h<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,h=-h):this.copy(t),h>=1)return this._w=d,this._x=r,this._y=l,this._z=c,this;const p=1-h*h;if(p<=Number.EPSILON){const M=1-i;return this._w=M*d+i*this._w,this._x=M*r+i*this._x,this._y=M*l+i*this._y,this._z=M*c+i*this._z,this.normalize(),this}const m=Math.sqrt(p),g=Math.atan2(m,h),_=Math.sin((1-i)*g)/m,x=Math.sin(i*g)/m;return this._w=d*_+this._w*x,this._x=r*_+this._x*x,this._y=l*_+this._y*x,this._z=c*_+this._z*x,this._onChangeCallback(),this}slerpQuaternions(t,i,r){return this.copy(t).slerp(i,r)}random(){const t=2*Math.PI*Math.random(),i=2*Math.PI*Math.random(),r=Math.random(),l=Math.sqrt(1-r),c=Math.sqrt(r);return this.set(l*Math.sin(t),l*Math.cos(t),c*Math.sin(i),c*Math.cos(i))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,i=0){return this._x=t[i],this._y=t[i+1],this._z=t[i+2],this._w=t[i+3],this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._w,t}fromBufferAttribute(t,i){return this._x=t.getX(i),this._y=t.getY(i),this._z=t.getZ(i),this._w=t.getW(i),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class Q{constructor(t=0,i=0,r=0){Q.prototype.isVector3=!0,this.x=t,this.y=i,this.z=r}set(t,i,r){return r===void 0&&(r=this.z),this.x=t,this.y=i,this.z=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,i){switch(t){case 0:this.x=i;break;case 1:this.y=i;break;case 2:this.z=i;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,i){return this.x=t.x+i.x,this.y=t.y+i.y,this.z=t.z+i.z,this}addScaledVector(t,i){return this.x+=t.x*i,this.y+=t.y*i,this.z+=t.z*i,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,i){return this.x=t.x-i.x,this.y=t.y-i.y,this.z=t.z-i.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,i){return this.x=t.x*i.x,this.y=t.y*i.y,this.z=t.z*i.z,this}applyEuler(t){return this.applyQuaternion(X_.setFromEuler(t))}applyAxisAngle(t,i){return this.applyQuaternion(X_.setFromAxisAngle(t,i))}applyMatrix3(t){const i=this.x,r=this.y,l=this.z,c=t.elements;return this.x=c[0]*i+c[3]*r+c[6]*l,this.y=c[1]*i+c[4]*r+c[7]*l,this.z=c[2]*i+c[5]*r+c[8]*l,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const i=this.x,r=this.y,l=this.z,c=t.elements,d=1/(c[3]*i+c[7]*r+c[11]*l+c[15]);return this.x=(c[0]*i+c[4]*r+c[8]*l+c[12])*d,this.y=(c[1]*i+c[5]*r+c[9]*l+c[13])*d,this.z=(c[2]*i+c[6]*r+c[10]*l+c[14])*d,this}applyQuaternion(t){const i=this.x,r=this.y,l=this.z,c=t.x,d=t.y,h=t.z,p=t.w,m=2*(d*l-h*r),g=2*(h*i-c*l),_=2*(c*r-d*i);return this.x=i+p*m+d*_-h*g,this.y=r+p*g+h*m-c*_,this.z=l+p*_+c*g-d*m,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const i=this.x,r=this.y,l=this.z,c=t.elements;return this.x=c[0]*i+c[4]*r+c[8]*l,this.y=c[1]*i+c[5]*r+c[9]*l,this.z=c[2]*i+c[6]*r+c[10]*l,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,i){return this.x=ve(this.x,t.x,i.x),this.y=ve(this.y,t.y,i.y),this.z=ve(this.z,t.z,i.z),this}clampScalar(t,i){return this.x=ve(this.x,t,i),this.y=ve(this.y,t,i),this.z=ve(this.z,t,i),this}clampLength(t,i){const r=this.length();return this.divideScalar(r||1).multiplyScalar(ve(r,t,i))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,i){return this.x+=(t.x-this.x)*i,this.y+=(t.y-this.y)*i,this.z+=(t.z-this.z)*i,this}lerpVectors(t,i,r){return this.x=t.x+(i.x-t.x)*r,this.y=t.y+(i.y-t.y)*r,this.z=t.z+(i.z-t.z)*r,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,i){const r=t.x,l=t.y,c=t.z,d=i.x,h=i.y,p=i.z;return this.x=l*p-c*h,this.y=c*d-r*p,this.z=r*h-l*d,this}projectOnVector(t){const i=t.lengthSq();if(i===0)return this.set(0,0,0);const r=t.dot(this)/i;return this.copy(t).multiplyScalar(r)}projectOnPlane(t){return fh.copy(this).projectOnVector(t),this.sub(fh)}reflect(t){return this.sub(fh.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const i=Math.sqrt(this.lengthSq()*t.lengthSq());if(i===0)return Math.PI/2;const r=this.dot(t)/i;return Math.acos(ve(r,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const i=this.x-t.x,r=this.y-t.y,l=this.z-t.z;return i*i+r*r+l*l}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,i,r){const l=Math.sin(i)*t;return this.x=l*Math.sin(r),this.y=Math.cos(i)*t,this.z=l*Math.cos(r),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,i,r){return this.x=t*Math.sin(i),this.y=r,this.z=t*Math.cos(i),this}setFromMatrixPosition(t){const i=t.elements;return this.x=i[12],this.y=i[13],this.z=i[14],this}setFromMatrixScale(t){const i=this.setFromMatrixColumn(t,0).length(),r=this.setFromMatrixColumn(t,1).length(),l=this.setFromMatrixColumn(t,2).length();return this.x=i,this.y=r,this.z=l,this}setFromMatrixColumn(t,i){return this.fromArray(t.elements,i*4)}setFromMatrix3Column(t,i){return this.fromArray(t.elements,i*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,i=0){return this.x=t[i],this.y=t[i+1],this.z=t[i+2],this}toArray(t=[],i=0){return t[i]=this.x,t[i+1]=this.y,t[i+2]=this.z,t}fromBufferAttribute(t,i){return this.x=t.getX(i),this.y=t.getY(i),this.z=t.getZ(i),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,i=Math.random()*2-1,r=Math.sqrt(1-i*i);return this.x=r*Math.cos(t),this.y=i,this.z=r*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const fh=new Q,X_=new tl;class el{constructor(t=new Q(1/0,1/0,1/0),i=new Q(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=i}set(t,i){return this.min.copy(t),this.max.copy(i),this}setFromArray(t){this.makeEmpty();for(let i=0,r=t.length;i<r;i+=3)this.expandByPoint(xi.fromArray(t,i));return this}setFromBufferAttribute(t){this.makeEmpty();for(let i=0,r=t.count;i<r;i++)this.expandByPoint(xi.fromBufferAttribute(t,i));return this}setFromPoints(t){this.makeEmpty();for(let i=0,r=t.length;i<r;i++)this.expandByPoint(t[i]);return this}setFromCenterAndSize(t,i){const r=xi.copy(i).multiplyScalar(.5);return this.min.copy(t).sub(r),this.max.copy(t).add(r),this}setFromObject(t,i=!1){return this.makeEmpty(),this.expandByObject(t,i)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,i=!1){t.updateWorldMatrix(!1,!1);const r=t.geometry;if(r!==void 0){const c=r.getAttribute("position");if(i===!0&&c!==void 0&&t.isInstancedMesh!==!0)for(let d=0,h=c.count;d<h;d++)t.isMesh===!0?t.getVertexPosition(d,xi):xi.fromBufferAttribute(c,d),xi.applyMatrix4(t.matrixWorld),this.expandByPoint(xi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),pc.copy(t.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),pc.copy(r.boundingBox)),pc.applyMatrix4(t.matrixWorld),this.union(pc)}const l=t.children;for(let c=0,d=l.length;c<d;c++)this.expandByObject(l[c],i);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,i){return i.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,xi),xi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let i,r;return t.normal.x>0?(i=t.normal.x*this.min.x,r=t.normal.x*this.max.x):(i=t.normal.x*this.max.x,r=t.normal.x*this.min.x),t.normal.y>0?(i+=t.normal.y*this.min.y,r+=t.normal.y*this.max.y):(i+=t.normal.y*this.max.y,r+=t.normal.y*this.min.y),t.normal.z>0?(i+=t.normal.z*this.min.z,r+=t.normal.z*this.max.z):(i+=t.normal.z*this.max.z,r+=t.normal.z*this.min.z),i<=-t.constant&&r>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Bo),mc.subVectors(this.max,Bo),ds.subVectors(t.a,Bo),ps.subVectors(t.b,Bo),ms.subVectors(t.c,Bo),Ba.subVectors(ps,ds),Ia.subVectors(ms,ps),mr.subVectors(ds,ms);let i=[0,-Ba.z,Ba.y,0,-Ia.z,Ia.y,0,-mr.z,mr.y,Ba.z,0,-Ba.x,Ia.z,0,-Ia.x,mr.z,0,-mr.x,-Ba.y,Ba.x,0,-Ia.y,Ia.x,0,-mr.y,mr.x,0];return!hh(i,ds,ps,ms,mc)||(i=[1,0,0,0,1,0,0,0,1],!hh(i,ds,ps,ms,mc))?!1:(gc.crossVectors(Ba,Ia),i=[gc.x,gc.y,gc.z],hh(i,ds,ps,ms,mc))}clampPoint(t,i){return i.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,xi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(xi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(na[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),na[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),na[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),na[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),na[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),na[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),na[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),na[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(na),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const na=[new Q,new Q,new Q,new Q,new Q,new Q,new Q,new Q],xi=new Q,pc=new el,ds=new Q,ps=new Q,ms=new Q,Ba=new Q,Ia=new Q,mr=new Q,Bo=new Q,mc=new Q,gc=new Q,gr=new Q;function hh(s,t,i,r,l){for(let c=0,d=s.length-3;c<=d;c+=3){gr.fromArray(s,c);const h=l.x*Math.abs(gr.x)+l.y*Math.abs(gr.y)+l.z*Math.abs(gr.z),p=t.dot(gr),m=i.dot(gr),g=r.dot(gr);if(Math.max(-Math.max(p,m,g),Math.min(p,m,g))>h)return!1}return!0}const tM=new el,Io=new Q,dh=new Q;class Jc{constructor(t=new Q,i=-1){this.isSphere=!0,this.center=t,this.radius=i}set(t,i){return this.center.copy(t),this.radius=i,this}setFromPoints(t,i){const r=this.center;i!==void 0?r.copy(i):tM.setFromPoints(t).getCenter(r);let l=0;for(let c=0,d=t.length;c<d;c++)l=Math.max(l,r.distanceToSquared(t[c]));return this.radius=Math.sqrt(l),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const i=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=i*i}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,i){const r=this.center.distanceToSquared(t);return i.copy(t),r>this.radius*this.radius&&(i.sub(this.center).normalize(),i.multiplyScalar(this.radius).add(this.center)),i}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Io.subVectors(t,this.center);const i=Io.lengthSq();if(i>this.radius*this.radius){const r=Math.sqrt(i),l=(r-this.radius)*.5;this.center.addScaledVector(Io,l/r),this.radius+=l}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(dh.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Io.copy(t.center).add(dh)),this.expandByPoint(Io.copy(t.center).sub(dh))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const ia=new Q,ph=new Q,_c=new Q,Fa=new Q,mh=new Q,vc=new Q,gh=new Q;class dv{constructor(t=new Q,i=new Q(0,0,-1)){this.origin=t,this.direction=i}set(t,i){return this.origin.copy(t),this.direction.copy(i),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,i){return i.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ia)),this}closestPointToPoint(t,i){i.subVectors(t,this.origin);const r=i.dot(this.direction);return r<0?i.copy(this.origin):i.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const i=ia.subVectors(t,this.origin).dot(this.direction);return i<0?this.origin.distanceToSquared(t):(ia.copy(this.origin).addScaledVector(this.direction,i),ia.distanceToSquared(t))}distanceSqToSegment(t,i,r,l){ph.copy(t).add(i).multiplyScalar(.5),_c.copy(i).sub(t).normalize(),Fa.copy(this.origin).sub(ph);const c=t.distanceTo(i)*.5,d=-this.direction.dot(_c),h=Fa.dot(this.direction),p=-Fa.dot(_c),m=Fa.lengthSq(),g=Math.abs(1-d*d);let _,x,M,E;if(g>0)if(_=d*p-h,x=d*h-p,E=c*g,_>=0)if(x>=-E)if(x<=E){const A=1/g;_*=A,x*=A,M=_*(_+d*x+2*h)+x*(d*_+x+2*p)+m}else x=c,_=Math.max(0,-(d*x+h)),M=-_*_+x*(x+2*p)+m;else x=-c,_=Math.max(0,-(d*x+h)),M=-_*_+x*(x+2*p)+m;else x<=-E?(_=Math.max(0,-(-d*c+h)),x=_>0?-c:Math.min(Math.max(-c,-p),c),M=-_*_+x*(x+2*p)+m):x<=E?(_=0,x=Math.min(Math.max(-c,-p),c),M=x*(x+2*p)+m):(_=Math.max(0,-(d*c+h)),x=_>0?c:Math.min(Math.max(-c,-p),c),M=-_*_+x*(x+2*p)+m);else x=d>0?-c:c,_=Math.max(0,-(d*x+h)),M=-_*_+x*(x+2*p)+m;return r&&r.copy(this.origin).addScaledVector(this.direction,_),l&&l.copy(ph).addScaledVector(_c,x),M}intersectSphere(t,i){ia.subVectors(t.center,this.origin);const r=ia.dot(this.direction),l=ia.dot(ia)-r*r,c=t.radius*t.radius;if(l>c)return null;const d=Math.sqrt(c-l),h=r-d,p=r+d;return p<0?null:h<0?this.at(p,i):this.at(h,i)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const i=t.normal.dot(this.direction);if(i===0)return t.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(t.normal)+t.constant)/i;return r>=0?r:null}intersectPlane(t,i){const r=this.distanceToPlane(t);return r===null?null:this.at(r,i)}intersectsPlane(t){const i=t.distanceToPoint(this.origin);return i===0||t.normal.dot(this.direction)*i<0}intersectBox(t,i){let r,l,c,d,h,p;const m=1/this.direction.x,g=1/this.direction.y,_=1/this.direction.z,x=this.origin;return m>=0?(r=(t.min.x-x.x)*m,l=(t.max.x-x.x)*m):(r=(t.max.x-x.x)*m,l=(t.min.x-x.x)*m),g>=0?(c=(t.min.y-x.y)*g,d=(t.max.y-x.y)*g):(c=(t.max.y-x.y)*g,d=(t.min.y-x.y)*g),r>d||c>l||((c>r||isNaN(r))&&(r=c),(d<l||isNaN(l))&&(l=d),_>=0?(h=(t.min.z-x.z)*_,p=(t.max.z-x.z)*_):(h=(t.max.z-x.z)*_,p=(t.min.z-x.z)*_),r>p||h>l)||((h>r||r!==r)&&(r=h),(p<l||l!==l)&&(l=p),l<0)?null:this.at(r>=0?r:l,i)}intersectsBox(t){return this.intersectBox(t,ia)!==null}intersectTriangle(t,i,r,l,c){mh.subVectors(i,t),vc.subVectors(r,t),gh.crossVectors(mh,vc);let d=this.direction.dot(gh),h;if(d>0){if(l)return null;h=1}else if(d<0)h=-1,d=-d;else return null;Fa.subVectors(this.origin,t);const p=h*this.direction.dot(vc.crossVectors(Fa,vc));if(p<0)return null;const m=h*this.direction.dot(mh.cross(Fa));if(m<0||p+m>d)return null;const g=-h*Fa.dot(gh);return g<0?null:this.at(g/d,c)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ze{constructor(t,i,r,l,c,d,h,p,m,g,_,x,M,E,A,S){Ze.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,i,r,l,c,d,h,p,m,g,_,x,M,E,A,S)}set(t,i,r,l,c,d,h,p,m,g,_,x,M,E,A,S){const v=this.elements;return v[0]=t,v[4]=i,v[8]=r,v[12]=l,v[1]=c,v[5]=d,v[9]=h,v[13]=p,v[2]=m,v[6]=g,v[10]=_,v[14]=x,v[3]=M,v[7]=E,v[11]=A,v[15]=S,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ze().fromArray(this.elements)}copy(t){const i=this.elements,r=t.elements;return i[0]=r[0],i[1]=r[1],i[2]=r[2],i[3]=r[3],i[4]=r[4],i[5]=r[5],i[6]=r[6],i[7]=r[7],i[8]=r[8],i[9]=r[9],i[10]=r[10],i[11]=r[11],i[12]=r[12],i[13]=r[13],i[14]=r[14],i[15]=r[15],this}copyPosition(t){const i=this.elements,r=t.elements;return i[12]=r[12],i[13]=r[13],i[14]=r[14],this}setFromMatrix3(t){const i=t.elements;return this.set(i[0],i[3],i[6],0,i[1],i[4],i[7],0,i[2],i[5],i[8],0,0,0,0,1),this}extractBasis(t,i,r){return t.setFromMatrixColumn(this,0),i.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(t,i,r){return this.set(t.x,i.x,r.x,0,t.y,i.y,r.y,0,t.z,i.z,r.z,0,0,0,0,1),this}extractRotation(t){const i=this.elements,r=t.elements,l=1/gs.setFromMatrixColumn(t,0).length(),c=1/gs.setFromMatrixColumn(t,1).length(),d=1/gs.setFromMatrixColumn(t,2).length();return i[0]=r[0]*l,i[1]=r[1]*l,i[2]=r[2]*l,i[3]=0,i[4]=r[4]*c,i[5]=r[5]*c,i[6]=r[6]*c,i[7]=0,i[8]=r[8]*d,i[9]=r[9]*d,i[10]=r[10]*d,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromEuler(t){const i=this.elements,r=t.x,l=t.y,c=t.z,d=Math.cos(r),h=Math.sin(r),p=Math.cos(l),m=Math.sin(l),g=Math.cos(c),_=Math.sin(c);if(t.order==="XYZ"){const x=d*g,M=d*_,E=h*g,A=h*_;i[0]=p*g,i[4]=-p*_,i[8]=m,i[1]=M+E*m,i[5]=x-A*m,i[9]=-h*p,i[2]=A-x*m,i[6]=E+M*m,i[10]=d*p}else if(t.order==="YXZ"){const x=p*g,M=p*_,E=m*g,A=m*_;i[0]=x+A*h,i[4]=E*h-M,i[8]=d*m,i[1]=d*_,i[5]=d*g,i[9]=-h,i[2]=M*h-E,i[6]=A+x*h,i[10]=d*p}else if(t.order==="ZXY"){const x=p*g,M=p*_,E=m*g,A=m*_;i[0]=x-A*h,i[4]=-d*_,i[8]=E+M*h,i[1]=M+E*h,i[5]=d*g,i[9]=A-x*h,i[2]=-d*m,i[6]=h,i[10]=d*p}else if(t.order==="ZYX"){const x=d*g,M=d*_,E=h*g,A=h*_;i[0]=p*g,i[4]=E*m-M,i[8]=x*m+A,i[1]=p*_,i[5]=A*m+x,i[9]=M*m-E,i[2]=-m,i[6]=h*p,i[10]=d*p}else if(t.order==="YZX"){const x=d*p,M=d*m,E=h*p,A=h*m;i[0]=p*g,i[4]=A-x*_,i[8]=E*_+M,i[1]=_,i[5]=d*g,i[9]=-h*g,i[2]=-m*g,i[6]=M*_+E,i[10]=x-A*_}else if(t.order==="XZY"){const x=d*p,M=d*m,E=h*p,A=h*m;i[0]=p*g,i[4]=-_,i[8]=m*g,i[1]=x*_+A,i[5]=d*g,i[9]=M*_-E,i[2]=E*_-M,i[6]=h*g,i[10]=A*_+x}return i[3]=0,i[7]=0,i[11]=0,i[12]=0,i[13]=0,i[14]=0,i[15]=1,this}makeRotationFromQuaternion(t){return this.compose(eM,t,nM)}lookAt(t,i,r){const l=this.elements;return ti.subVectors(t,i),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),Ha.crossVectors(r,ti),Ha.lengthSq()===0&&(Math.abs(r.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),Ha.crossVectors(r,ti)),Ha.normalize(),yc.crossVectors(ti,Ha),l[0]=Ha.x,l[4]=yc.x,l[8]=ti.x,l[1]=Ha.y,l[5]=yc.y,l[9]=ti.y,l[2]=Ha.z,l[6]=yc.z,l[10]=ti.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,i){const r=t.elements,l=i.elements,c=this.elements,d=r[0],h=r[4],p=r[8],m=r[12],g=r[1],_=r[5],x=r[9],M=r[13],E=r[2],A=r[6],S=r[10],v=r[14],P=r[3],N=r[7],D=r[11],q=r[15],H=l[0],O=l[4],V=l[8],w=l[12],R=l[1],I=l[5],J=l[9],$=l[13],ut=l[2],gt=l[6],z=l[10],K=l[14],X=l[3],ht=l[7],Et=l[11],L=l[15];return c[0]=d*H+h*R+p*ut+m*X,c[4]=d*O+h*I+p*gt+m*ht,c[8]=d*V+h*J+p*z+m*Et,c[12]=d*w+h*$+p*K+m*L,c[1]=g*H+_*R+x*ut+M*X,c[5]=g*O+_*I+x*gt+M*ht,c[9]=g*V+_*J+x*z+M*Et,c[13]=g*w+_*$+x*K+M*L,c[2]=E*H+A*R+S*ut+v*X,c[6]=E*O+A*I+S*gt+v*ht,c[10]=E*V+A*J+S*z+v*Et,c[14]=E*w+A*$+S*K+v*L,c[3]=P*H+N*R+D*ut+q*X,c[7]=P*O+N*I+D*gt+q*ht,c[11]=P*V+N*J+D*z+q*Et,c[15]=P*w+N*$+D*K+q*L,this}multiplyScalar(t){const i=this.elements;return i[0]*=t,i[4]*=t,i[8]*=t,i[12]*=t,i[1]*=t,i[5]*=t,i[9]*=t,i[13]*=t,i[2]*=t,i[6]*=t,i[10]*=t,i[14]*=t,i[3]*=t,i[7]*=t,i[11]*=t,i[15]*=t,this}determinant(){const t=this.elements,i=t[0],r=t[4],l=t[8],c=t[12],d=t[1],h=t[5],p=t[9],m=t[13],g=t[2],_=t[6],x=t[10],M=t[14],E=t[3],A=t[7],S=t[11],v=t[15];return E*(+c*p*_-l*m*_-c*h*x+r*m*x+l*h*M-r*p*M)+A*(+i*p*M-i*m*x+c*d*x-l*d*M+l*m*g-c*p*g)+S*(+i*m*_-i*h*M-c*d*_+r*d*M+c*h*g-r*m*g)+v*(-l*h*g-i*p*_+i*h*x+l*d*_-r*d*x+r*p*g)}transpose(){const t=this.elements;let i;return i=t[1],t[1]=t[4],t[4]=i,i=t[2],t[2]=t[8],t[8]=i,i=t[6],t[6]=t[9],t[9]=i,i=t[3],t[3]=t[12],t[12]=i,i=t[7],t[7]=t[13],t[13]=i,i=t[11],t[11]=t[14],t[14]=i,this}setPosition(t,i,r){const l=this.elements;return t.isVector3?(l[12]=t.x,l[13]=t.y,l[14]=t.z):(l[12]=t,l[13]=i,l[14]=r),this}invert(){const t=this.elements,i=t[0],r=t[1],l=t[2],c=t[3],d=t[4],h=t[5],p=t[6],m=t[7],g=t[8],_=t[9],x=t[10],M=t[11],E=t[12],A=t[13],S=t[14],v=t[15],P=_*S*m-A*x*m+A*p*M-h*S*M-_*p*v+h*x*v,N=E*x*m-g*S*m-E*p*M+d*S*M+g*p*v-d*x*v,D=g*A*m-E*_*m+E*h*M-d*A*M-g*h*v+d*_*v,q=E*_*p-g*A*p-E*h*x+d*A*x+g*h*S-d*_*S,H=i*P+r*N+l*D+c*q;if(H===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const O=1/H;return t[0]=P*O,t[1]=(A*x*c-_*S*c-A*l*M+r*S*M+_*l*v-r*x*v)*O,t[2]=(h*S*c-A*p*c+A*l*m-r*S*m-h*l*v+r*p*v)*O,t[3]=(_*p*c-h*x*c-_*l*m+r*x*m+h*l*M-r*p*M)*O,t[4]=N*O,t[5]=(g*S*c-E*x*c+E*l*M-i*S*M-g*l*v+i*x*v)*O,t[6]=(E*p*c-d*S*c-E*l*m+i*S*m+d*l*v-i*p*v)*O,t[7]=(d*x*c-g*p*c+g*l*m-i*x*m-d*l*M+i*p*M)*O,t[8]=D*O,t[9]=(E*_*c-g*A*c-E*r*M+i*A*M+g*r*v-i*_*v)*O,t[10]=(d*A*c-E*h*c+E*r*m-i*A*m-d*r*v+i*h*v)*O,t[11]=(g*h*c-d*_*c-g*r*m+i*_*m+d*r*M-i*h*M)*O,t[12]=q*O,t[13]=(g*A*l-E*_*l+E*r*x-i*A*x-g*r*S+i*_*S)*O,t[14]=(E*h*l-d*A*l-E*r*p+i*A*p+d*r*S-i*h*S)*O,t[15]=(d*_*l-g*h*l+g*r*p-i*_*p-d*r*x+i*h*x)*O,this}scale(t){const i=this.elements,r=t.x,l=t.y,c=t.z;return i[0]*=r,i[4]*=l,i[8]*=c,i[1]*=r,i[5]*=l,i[9]*=c,i[2]*=r,i[6]*=l,i[10]*=c,i[3]*=r,i[7]*=l,i[11]*=c,this}getMaxScaleOnAxis(){const t=this.elements,i=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],r=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],l=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(i,r,l))}makeTranslation(t,i,r){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,i,0,0,1,r,0,0,0,1),this}makeRotationX(t){const i=Math.cos(t),r=Math.sin(t);return this.set(1,0,0,0,0,i,-r,0,0,r,i,0,0,0,0,1),this}makeRotationY(t){const i=Math.cos(t),r=Math.sin(t);return this.set(i,0,r,0,0,1,0,0,-r,0,i,0,0,0,0,1),this}makeRotationZ(t){const i=Math.cos(t),r=Math.sin(t);return this.set(i,-r,0,0,r,i,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,i){const r=Math.cos(i),l=Math.sin(i),c=1-r,d=t.x,h=t.y,p=t.z,m=c*d,g=c*h;return this.set(m*d+r,m*h-l*p,m*p+l*h,0,m*h+l*p,g*h+r,g*p-l*d,0,m*p-l*h,g*p+l*d,c*p*p+r,0,0,0,0,1),this}makeScale(t,i,r){return this.set(t,0,0,0,0,i,0,0,0,0,r,0,0,0,0,1),this}makeShear(t,i,r,l,c,d){return this.set(1,r,c,0,t,1,d,0,i,l,1,0,0,0,0,1),this}compose(t,i,r){const l=this.elements,c=i._x,d=i._y,h=i._z,p=i._w,m=c+c,g=d+d,_=h+h,x=c*m,M=c*g,E=c*_,A=d*g,S=d*_,v=h*_,P=p*m,N=p*g,D=p*_,q=r.x,H=r.y,O=r.z;return l[0]=(1-(A+v))*q,l[1]=(M+D)*q,l[2]=(E-N)*q,l[3]=0,l[4]=(M-D)*H,l[5]=(1-(x+v))*H,l[6]=(S+P)*H,l[7]=0,l[8]=(E+N)*O,l[9]=(S-P)*O,l[10]=(1-(x+A))*O,l[11]=0,l[12]=t.x,l[13]=t.y,l[14]=t.z,l[15]=1,this}decompose(t,i,r){const l=this.elements;let c=gs.set(l[0],l[1],l[2]).length();const d=gs.set(l[4],l[5],l[6]).length(),h=gs.set(l[8],l[9],l[10]).length();this.determinant()<0&&(c=-c),t.x=l[12],t.y=l[13],t.z=l[14],Si.copy(this);const m=1/c,g=1/d,_=1/h;return Si.elements[0]*=m,Si.elements[1]*=m,Si.elements[2]*=m,Si.elements[4]*=g,Si.elements[5]*=g,Si.elements[6]*=g,Si.elements[8]*=_,Si.elements[9]*=_,Si.elements[10]*=_,i.setFromRotationMatrix(Si),r.x=c,r.y=d,r.z=h,this}makePerspective(t,i,r,l,c,d,h=ua){const p=this.elements,m=2*c/(i-t),g=2*c/(r-l),_=(i+t)/(i-t),x=(r+l)/(r-l);let M,E;if(h===ua)M=-(d+c)/(d-c),E=-2*d*c/(d-c);else if(h===Yc)M=-d/(d-c),E=-d*c/(d-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+h);return p[0]=m,p[4]=0,p[8]=_,p[12]=0,p[1]=0,p[5]=g,p[9]=x,p[13]=0,p[2]=0,p[6]=0,p[10]=M,p[14]=E,p[3]=0,p[7]=0,p[11]=-1,p[15]=0,this}makeOrthographic(t,i,r,l,c,d,h=ua){const p=this.elements,m=1/(i-t),g=1/(r-l),_=1/(d-c),x=(i+t)*m,M=(r+l)*g;let E,A;if(h===ua)E=(d+c)*_,A=-2*_;else if(h===Yc)E=c*_,A=-1*_;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+h);return p[0]=2*m,p[4]=0,p[8]=0,p[12]=-x,p[1]=0,p[5]=2*g,p[9]=0,p[13]=-M,p[2]=0,p[6]=0,p[10]=A,p[14]=-E,p[3]=0,p[7]=0,p[11]=0,p[15]=1,this}equals(t){const i=this.elements,r=t.elements;for(let l=0;l<16;l++)if(i[l]!==r[l])return!1;return!0}fromArray(t,i=0){for(let r=0;r<16;r++)this.elements[r]=t[r+i];return this}toArray(t=[],i=0){const r=this.elements;return t[i]=r[0],t[i+1]=r[1],t[i+2]=r[2],t[i+3]=r[3],t[i+4]=r[4],t[i+5]=r[5],t[i+6]=r[6],t[i+7]=r[7],t[i+8]=r[8],t[i+9]=r[9],t[i+10]=r[10],t[i+11]=r[11],t[i+12]=r[12],t[i+13]=r[13],t[i+14]=r[14],t[i+15]=r[15],t}}const gs=new Q,Si=new Ze,eM=new Q(0,0,0),nM=new Q(1,1,1),Ha=new Q,yc=new Q,ti=new Q,q_=new Ze,W_=new tl;class Bi{constructor(t=0,i=0,r=0,l=Bi.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=i,this._z=r,this._order=l}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,i,r,l=this._order){return this._x=t,this._y=i,this._z=r,this._order=l,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,i=this._order,r=!0){const l=t.elements,c=l[0],d=l[4],h=l[8],p=l[1],m=l[5],g=l[9],_=l[2],x=l[6],M=l[10];switch(i){case"XYZ":this._y=Math.asin(ve(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-g,M),this._z=Math.atan2(-d,c)):(this._x=Math.atan2(x,m),this._z=0);break;case"YXZ":this._x=Math.asin(-ve(g,-1,1)),Math.abs(g)<.9999999?(this._y=Math.atan2(h,M),this._z=Math.atan2(p,m)):(this._y=Math.atan2(-_,c),this._z=0);break;case"ZXY":this._x=Math.asin(ve(x,-1,1)),Math.abs(x)<.9999999?(this._y=Math.atan2(-_,M),this._z=Math.atan2(-d,m)):(this._y=0,this._z=Math.atan2(p,c));break;case"ZYX":this._y=Math.asin(-ve(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(x,M),this._z=Math.atan2(p,c)):(this._x=0,this._z=Math.atan2(-d,m));break;case"YZX":this._z=Math.asin(ve(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(-g,m),this._y=Math.atan2(-_,c)):(this._x=0,this._y=Math.atan2(h,M));break;case"XZY":this._z=Math.asin(-ve(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(x,m),this._y=Math.atan2(h,c)):(this._x=Math.atan2(-g,M),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+i)}return this._order=i,r===!0&&this._onChangeCallback(),this}setFromQuaternion(t,i,r){return q_.makeRotationFromQuaternion(t),this.setFromRotationMatrix(q_,i,r)}setFromVector3(t,i=this._order){return this.set(t.x,t.y,t.z,i)}reorder(t){return W_.setFromEuler(this),this.setFromQuaternion(W_,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],i=0){return t[i]=this._x,t[i+1]=this._y,t[i+2]=this._z,t[i+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Bi.DEFAULT_ORDER="XYZ";class pv{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let iM=0;const Y_=new Q,_s=new tl,aa=new Ze,xc=new Q,Fo=new Q,aM=new Q,rM=new tl,Z_=new Q(1,0,0),j_=new Q(0,1,0),K_=new Q(0,0,1),Q_={type:"added"},sM={type:"removed"},vs={type:"childadded",child:null},_h={type:"childremoved",child:null};class bn extends Fs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:iM++}),this.uuid=Hs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bn.DEFAULT_UP.clone();const t=new Q,i=new Bi,r=new tl,l=new Q(1,1,1);function c(){r.setFromEuler(i,!1)}function d(){i.setFromQuaternion(r,void 0,!1)}i._onChange(c),r._onChange(d),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:i},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:l},modelViewMatrix:{value:new Ze},normalMatrix:{value:new ue}}),this.matrix=new Ze,this.matrixWorld=new Ze,this.matrixAutoUpdate=bn.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pv,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,i){this.quaternion.setFromAxisAngle(t,i)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,i){return _s.setFromAxisAngle(t,i),this.quaternion.multiply(_s),this}rotateOnWorldAxis(t,i){return _s.setFromAxisAngle(t,i),this.quaternion.premultiply(_s),this}rotateX(t){return this.rotateOnAxis(Z_,t)}rotateY(t){return this.rotateOnAxis(j_,t)}rotateZ(t){return this.rotateOnAxis(K_,t)}translateOnAxis(t,i){return Y_.copy(t).applyQuaternion(this.quaternion),this.position.add(Y_.multiplyScalar(i)),this}translateX(t){return this.translateOnAxis(Z_,t)}translateY(t){return this.translateOnAxis(j_,t)}translateZ(t){return this.translateOnAxis(K_,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(aa.copy(this.matrixWorld).invert())}lookAt(t,i,r){t.isVector3?xc.copy(t):xc.set(t,i,r);const l=this.parent;this.updateWorldMatrix(!0,!1),Fo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?aa.lookAt(Fo,xc,this.up):aa.lookAt(xc,Fo,this.up),this.quaternion.setFromRotationMatrix(aa),l&&(aa.extractRotation(l.matrixWorld),_s.setFromRotationMatrix(aa),this.quaternion.premultiply(_s.invert()))}add(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.add(arguments[i]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Q_),vs.child=t,this.dispatchEvent(vs),vs.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const i=this.children.indexOf(t);return i!==-1&&(t.parent=null,this.children.splice(i,1),t.dispatchEvent(sM),_h.child=t,this.dispatchEvent(_h),_h.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),aa.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),aa.multiply(t.parent.matrixWorld)),t.applyMatrix4(aa),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Q_),vs.child=t,this.dispatchEvent(vs),vs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,i){if(this[t]===i)return this;for(let r=0,l=this.children.length;r<l;r++){const d=this.children[r].getObjectByProperty(t,i);if(d!==void 0)return d}}getObjectsByProperty(t,i,r=[]){this[t]===i&&r.push(this);const l=this.children;for(let c=0,d=l.length;c<d;c++)l[c].getObjectsByProperty(t,i,r);return r}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fo,t,aM),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fo,rM,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const i=this.matrixWorld.elements;return t.set(i[8],i[9],i[10]).normalize()}raycast(){}traverse(t){t(this);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].traverseVisible(t)}traverseAncestors(t){const i=this.parent;i!==null&&(t(i),i.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const i=this.children;for(let r=0,l=i.length;r<l;r++)i[r].updateMatrixWorld(t)}updateWorldMatrix(t,i){const r=this.parent;if(t===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),i===!0){const l=this.children;for(let c=0,d=l.length;c<d;c++)l[c].updateWorldMatrix(!1,!0)}}toJSON(t){const i=t===void 0||typeof t=="string",r={};i&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const l={};l.uuid=this.uuid,l.type=this.type,this.name!==""&&(l.name=this.name),this.castShadow===!0&&(l.castShadow=!0),this.receiveShadow===!0&&(l.receiveShadow=!0),this.visible===!1&&(l.visible=!1),this.frustumCulled===!1&&(l.frustumCulled=!1),this.renderOrder!==0&&(l.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(l.userData=this.userData),l.layers=this.layers.mask,l.matrix=this.matrix.toArray(),l.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(l.matrixAutoUpdate=!1),this.isInstancedMesh&&(l.type="InstancedMesh",l.count=this.count,l.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(l.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(l.type="BatchedMesh",l.perObjectFrustumCulled=this.perObjectFrustumCulled,l.sortObjects=this.sortObjects,l.drawRanges=this._drawRanges,l.reservedRanges=this._reservedRanges,l.visibility=this._visibility,l.active=this._active,l.bounds=this._bounds.map(h=>({boxInitialized:h.boxInitialized,boxMin:h.box.min.toArray(),boxMax:h.box.max.toArray(),sphereInitialized:h.sphereInitialized,sphereRadius:h.sphere.radius,sphereCenter:h.sphere.center.toArray()})),l.maxInstanceCount=this._maxInstanceCount,l.maxVertexCount=this._maxVertexCount,l.maxIndexCount=this._maxIndexCount,l.geometryInitialized=this._geometryInitialized,l.geometryCount=this._geometryCount,l.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(l.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(l.boundingSphere={center:l.boundingSphere.center.toArray(),radius:l.boundingSphere.radius}),this.boundingBox!==null&&(l.boundingBox={min:l.boundingBox.min.toArray(),max:l.boundingBox.max.toArray()}));function c(h,p){return h[p.uuid]===void 0&&(h[p.uuid]=p.toJSON(t)),p.uuid}if(this.isScene)this.background&&(this.background.isColor?l.background=this.background.toJSON():this.background.isTexture&&(l.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(l.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){l.geometry=c(t.geometries,this.geometry);const h=this.geometry.parameters;if(h!==void 0&&h.shapes!==void 0){const p=h.shapes;if(Array.isArray(p))for(let m=0,g=p.length;m<g;m++){const _=p[m];c(t.shapes,_)}else c(t.shapes,p)}}if(this.isSkinnedMesh&&(l.bindMode=this.bindMode,l.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(t.skeletons,this.skeleton),l.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const h=[];for(let p=0,m=this.material.length;p<m;p++)h.push(c(t.materials,this.material[p]));l.material=h}else l.material=c(t.materials,this.material);if(this.children.length>0){l.children=[];for(let h=0;h<this.children.length;h++)l.children.push(this.children[h].toJSON(t).object)}if(this.animations.length>0){l.animations=[];for(let h=0;h<this.animations.length;h++){const p=this.animations[h];l.animations.push(c(t.animations,p))}}if(i){const h=d(t.geometries),p=d(t.materials),m=d(t.textures),g=d(t.images),_=d(t.shapes),x=d(t.skeletons),M=d(t.animations),E=d(t.nodes);h.length>0&&(r.geometries=h),p.length>0&&(r.materials=p),m.length>0&&(r.textures=m),g.length>0&&(r.images=g),_.length>0&&(r.shapes=_),x.length>0&&(r.skeletons=x),M.length>0&&(r.animations=M),E.length>0&&(r.nodes=E)}return r.object=l,r;function d(h){const p=[];for(const m in h){const g=h[m];delete g.metadata,p.push(g)}return p}}clone(t){return new this.constructor().copy(this,t)}copy(t,i=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),i===!0)for(let r=0;r<t.children.length;r++){const l=t.children[r];this.add(l.clone())}return this}}bn.DEFAULT_UP=new Q(0,1,0);bn.DEFAULT_MATRIX_AUTO_UPDATE=!0;bn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Mi=new Q,ra=new Q,vh=new Q,sa=new Q,ys=new Q,xs=new Q,J_=new Q,yh=new Q,xh=new Q,Sh=new Q,Mh=new $e,Eh=new $e,Th=new $e;class Ti{constructor(t=new Q,i=new Q,r=new Q){this.a=t,this.b=i,this.c=r}static getNormal(t,i,r,l){l.subVectors(r,i),Mi.subVectors(t,i),l.cross(Mi);const c=l.lengthSq();return c>0?l.multiplyScalar(1/Math.sqrt(c)):l.set(0,0,0)}static getBarycoord(t,i,r,l,c){Mi.subVectors(l,i),ra.subVectors(r,i),vh.subVectors(t,i);const d=Mi.dot(Mi),h=Mi.dot(ra),p=Mi.dot(vh),m=ra.dot(ra),g=ra.dot(vh),_=d*m-h*h;if(_===0)return c.set(0,0,0),null;const x=1/_,M=(m*p-h*g)*x,E=(d*g-h*p)*x;return c.set(1-M-E,E,M)}static containsPoint(t,i,r,l){return this.getBarycoord(t,i,r,l,sa)===null?!1:sa.x>=0&&sa.y>=0&&sa.x+sa.y<=1}static getInterpolation(t,i,r,l,c,d,h,p){return this.getBarycoord(t,i,r,l,sa)===null?(p.x=0,p.y=0,"z"in p&&(p.z=0),"w"in p&&(p.w=0),null):(p.setScalar(0),p.addScaledVector(c,sa.x),p.addScaledVector(d,sa.y),p.addScaledVector(h,sa.z),p)}static getInterpolatedAttribute(t,i,r,l,c,d){return Mh.setScalar(0),Eh.setScalar(0),Th.setScalar(0),Mh.fromBufferAttribute(t,i),Eh.fromBufferAttribute(t,r),Th.fromBufferAttribute(t,l),d.setScalar(0),d.addScaledVector(Mh,c.x),d.addScaledVector(Eh,c.y),d.addScaledVector(Th,c.z),d}static isFrontFacing(t,i,r,l){return Mi.subVectors(r,i),ra.subVectors(t,i),Mi.cross(ra).dot(l)<0}set(t,i,r){return this.a.copy(t),this.b.copy(i),this.c.copy(r),this}setFromPointsAndIndices(t,i,r,l){return this.a.copy(t[i]),this.b.copy(t[r]),this.c.copy(t[l]),this}setFromAttributeAndIndices(t,i,r,l){return this.a.fromBufferAttribute(t,i),this.b.fromBufferAttribute(t,r),this.c.fromBufferAttribute(t,l),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Mi.subVectors(this.c,this.b),ra.subVectors(this.a,this.b),Mi.cross(ra).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Ti.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,i){return Ti.getBarycoord(t,this.a,this.b,this.c,i)}getInterpolation(t,i,r,l,c){return Ti.getInterpolation(t,this.a,this.b,this.c,i,r,l,c)}containsPoint(t){return Ti.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Ti.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,i){const r=this.a,l=this.b,c=this.c;let d,h;ys.subVectors(l,r),xs.subVectors(c,r),yh.subVectors(t,r);const p=ys.dot(yh),m=xs.dot(yh);if(p<=0&&m<=0)return i.copy(r);xh.subVectors(t,l);const g=ys.dot(xh),_=xs.dot(xh);if(g>=0&&_<=g)return i.copy(l);const x=p*_-g*m;if(x<=0&&p>=0&&g<=0)return d=p/(p-g),i.copy(r).addScaledVector(ys,d);Sh.subVectors(t,c);const M=ys.dot(Sh),E=xs.dot(Sh);if(E>=0&&M<=E)return i.copy(c);const A=M*m-p*E;if(A<=0&&m>=0&&E<=0)return h=m/(m-E),i.copy(r).addScaledVector(xs,h);const S=g*E-M*_;if(S<=0&&_-g>=0&&M-E>=0)return J_.subVectors(c,l),h=(_-g)/(_-g+(M-E)),i.copy(l).addScaledVector(J_,h);const v=1/(S+A+x);return d=A*v,h=x*v,i.copy(r).addScaledVector(ys,d).addScaledVector(xs,h)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const mv={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ga={h:0,s:0,l:0},Sc={h:0,s:0,l:0};function bh(s,t,i){return i<0&&(i+=1),i>1&&(i-=1),i<1/6?s+(t-s)*6*i:i<1/2?t:i<2/3?s+(t-s)*6*(2/3-i):s}class Te{constructor(t,i,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,i,r)}set(t,i,r){if(i===void 0&&r===void 0){const l=t;l&&l.isColor?this.copy(l):typeof l=="number"?this.setHex(l):typeof l=="string"&&this.setStyle(l)}else this.setRGB(t,i,r);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,i=di){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,we.toWorkingColorSpace(this,i),this}setRGB(t,i,r,l=we.workingColorSpace){return this.r=t,this.g=i,this.b=r,we.toWorkingColorSpace(this,l),this}setHSL(t,i,r,l=we.workingColorSpace){if(t=qd(t,1),i=ve(i,0,1),r=ve(r,0,1),i===0)this.r=this.g=this.b=r;else{const c=r<=.5?r*(1+i):r+i-r*i,d=2*r-c;this.r=bh(d,c,t+1/3),this.g=bh(d,c,t),this.b=bh(d,c,t-1/3)}return we.toWorkingColorSpace(this,l),this}setStyle(t,i=di){function r(c){c!==void 0&&parseFloat(c)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let l;if(l=/^(\w+)\(([^\)]*)\)/.exec(t)){let c;const d=l[1],h=l[2];switch(d){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return r(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,i);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return r(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,i);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(h))return r(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,i);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(l=/^\#([A-Fa-f\d]+)$/.exec(t)){const c=l[1],d=c.length;if(d===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,i);if(d===6)return this.setHex(parseInt(c,16),i);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,i);return this}setColorName(t,i=di){const r=mv[t.toLowerCase()];return r!==void 0?this.setHex(r,i):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ha(t.r),this.g=ha(t.g),this.b=ha(t.b),this}copyLinearToSRGB(t){return this.r=Us(t.r),this.g=Us(t.g),this.b=Us(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=di){return we.fromWorkingColorSpace(Cn.copy(this),t),Math.round(ve(Cn.r*255,0,255))*65536+Math.round(ve(Cn.g*255,0,255))*256+Math.round(ve(Cn.b*255,0,255))}getHexString(t=di){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,i=we.workingColorSpace){we.fromWorkingColorSpace(Cn.copy(this),i);const r=Cn.r,l=Cn.g,c=Cn.b,d=Math.max(r,l,c),h=Math.min(r,l,c);let p,m;const g=(h+d)/2;if(h===d)p=0,m=0;else{const _=d-h;switch(m=g<=.5?_/(d+h):_/(2-d-h),d){case r:p=(l-c)/_+(l<c?6:0);break;case l:p=(c-r)/_+2;break;case c:p=(r-l)/_+4;break}p/=6}return t.h=p,t.s=m,t.l=g,t}getRGB(t,i=we.workingColorSpace){return we.fromWorkingColorSpace(Cn.copy(this),i),t.r=Cn.r,t.g=Cn.g,t.b=Cn.b,t}getStyle(t=di){we.fromWorkingColorSpace(Cn.copy(this),t);const i=Cn.r,r=Cn.g,l=Cn.b;return t!==di?`color(${t} ${i.toFixed(3)} ${r.toFixed(3)} ${l.toFixed(3)})`:`rgb(${Math.round(i*255)},${Math.round(r*255)},${Math.round(l*255)})`}offsetHSL(t,i,r){return this.getHSL(Ga),this.setHSL(Ga.h+t,Ga.s+i,Ga.l+r)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,i){return this.r=t.r+i.r,this.g=t.g+i.g,this.b=t.b+i.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,i){return this.r+=(t.r-this.r)*i,this.g+=(t.g-this.g)*i,this.b+=(t.b-this.b)*i,this}lerpColors(t,i,r){return this.r=t.r+(i.r-t.r)*r,this.g=t.g+(i.g-t.g)*r,this.b=t.b+(i.b-t.b)*r,this}lerpHSL(t,i){this.getHSL(Ga),t.getHSL(Sc);const r=Yo(Ga.h,Sc.h,i),l=Yo(Ga.s,Sc.s,i),c=Yo(Ga.l,Sc.l,i);return this.setHSL(r,l,c),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const i=this.r,r=this.g,l=this.b,c=t.elements;return this.r=c[0]*i+c[3]*r+c[6]*l,this.g=c[1]*i+c[4]*r+c[7]*l,this.b=c[2]*i+c[5]*r+c[8]*l,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,i=0){return this.r=t[i],this.g=t[i+1],this.b=t[i+2],this}toArray(t=[],i=0){return t[i]=this.r,t[i+1]=this.g,t[i+2]=this.b,t}fromBufferAttribute(t,i){return this.r=t.getX(i),this.g=t.getY(i),this.b=t.getZ(i),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Cn=new Te;Te.NAMES=mv;let oM=0;class Gs extends Fs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:oM++}),this.uuid=Hs(),this.name="",this.type="Material",this.blending=ws,this.side=Za,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Kh,this.blendDst=Qh,this.blendEquation=Tr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Te(0,0,0),this.blendAlpha=0,this.depthFunc=Ls,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=B_,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=fs,this.stencilZFail=fs,this.stencilZPass=fs,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const i in t){const r=t[i];if(r===void 0){console.warn(`THREE.Material: parameter '${i}' has value of undefined.`);continue}const l=this[i];if(l===void 0){console.warn(`THREE.Material: '${i}' is not a property of THREE.${this.type}.`);continue}l&&l.isColor?l.set(r):l&&l.isVector3&&r&&r.isVector3?l.copy(r):this[i]=r}}toJSON(t){const i=t===void 0||typeof t=="string";i&&(t={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(t).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(t).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(t).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(t).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(t).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==ws&&(r.blending=this.blending),this.side!==Za&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Kh&&(r.blendSrc=this.blendSrc),this.blendDst!==Qh&&(r.blendDst=this.blendDst),this.blendEquation!==Tr&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Ls&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==B_&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==fs&&(r.stencilFail=this.stencilFail),this.stencilZFail!==fs&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==fs&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function l(c){const d=[];for(const h in c){const p=c[h];delete p.metadata,d.push(p)}return d}if(i){const c=l(t.textures),d=l(t.images);c.length>0&&(r.textures=c),d.length>0&&(r.images=d)}return r}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const i=t.clippingPlanes;let r=null;if(i!==null){const l=i.length;r=new Array(l);for(let c=0;c!==l;++c)r[c]=i[c].clone()}return this.clippingPlanes=r,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class zi extends Gs{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Te(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.combine=Id,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ln=new Q,Mc=new De;class Pi{constructor(t,i,r=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=i,this.count=t!==void 0?t.length/i:0,this.normalized=r,this.usage=I_,this.updateRanges=[],this.gpuType=ca,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,i){this.updateRanges.push({start:t,count:i})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,i,r){t*=this.itemSize,r*=i.itemSize;for(let l=0,c=this.itemSize;l<c;l++)this.array[t+l]=i.array[r+l];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let i=0,r=this.count;i<r;i++)Mc.fromBufferAttribute(this,i),Mc.applyMatrix3(t),this.setXY(i,Mc.x,Mc.y);else if(this.itemSize===3)for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyMatrix3(t),this.setXYZ(i,ln.x,ln.y,ln.z);return this}applyMatrix4(t){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyMatrix4(t),this.setXYZ(i,ln.x,ln.y,ln.z);return this}applyNormalMatrix(t){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.applyNormalMatrix(t),this.setXYZ(i,ln.x,ln.y,ln.z);return this}transformDirection(t){for(let i=0,r=this.count;i<r;i++)ln.fromBufferAttribute(this,i),ln.transformDirection(t),this.setXYZ(i,ln.x,ln.y,ln.z);return this}set(t,i=0){return this.array.set(t,i),this}getComponent(t,i){let r=this.array[t*this.itemSize+i];return this.normalized&&(r=bs(r,this.array)),r}setComponent(t,i,r){return this.normalized&&(r=zn(r,this.array)),this.array[t*this.itemSize+i]=r,this}getX(t){let i=this.array[t*this.itemSize];return this.normalized&&(i=bs(i,this.array)),i}setX(t,i){return this.normalized&&(i=zn(i,this.array)),this.array[t*this.itemSize]=i,this}getY(t){let i=this.array[t*this.itemSize+1];return this.normalized&&(i=bs(i,this.array)),i}setY(t,i){return this.normalized&&(i=zn(i,this.array)),this.array[t*this.itemSize+1]=i,this}getZ(t){let i=this.array[t*this.itemSize+2];return this.normalized&&(i=bs(i,this.array)),i}setZ(t,i){return this.normalized&&(i=zn(i,this.array)),this.array[t*this.itemSize+2]=i,this}getW(t){let i=this.array[t*this.itemSize+3];return this.normalized&&(i=bs(i,this.array)),i}setW(t,i){return this.normalized&&(i=zn(i,this.array)),this.array[t*this.itemSize+3]=i,this}setXY(t,i,r){return t*=this.itemSize,this.normalized&&(i=zn(i,this.array),r=zn(r,this.array)),this.array[t+0]=i,this.array[t+1]=r,this}setXYZ(t,i,r,l){return t*=this.itemSize,this.normalized&&(i=zn(i,this.array),r=zn(r,this.array),l=zn(l,this.array)),this.array[t+0]=i,this.array[t+1]=r,this.array[t+2]=l,this}setXYZW(t,i,r,l,c){return t*=this.itemSize,this.normalized&&(i=zn(i,this.array),r=zn(r,this.array),l=zn(l,this.array),c=zn(c,this.array)),this.array[t+0]=i,this.array[t+1]=r,this.array[t+2]=l,this.array[t+3]=c,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==I_&&(t.usage=this.usage),t}}class gv extends Pi{constructor(t,i,r){super(new Uint16Array(t),i,r)}}class _v extends Pi{constructor(t,i,r){super(new Uint32Array(t),i,r)}}class nn extends Pi{constructor(t,i,r){super(new Float32Array(t),i,r)}}let lM=0;const fi=new Ze,Ah=new bn,Ss=new Q,ei=new el,Ho=new el,_n=new Q;class Wn extends Fs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:lM++}),this.uuid=Hs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(uv(t)?_v:gv)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,i){return this.attributes[t]=i,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,i,r=0){this.groups.push({start:t,count:i,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(t,i){this.drawRange.start=t,this.drawRange.count=i}applyMatrix4(t){const i=this.attributes.position;i!==void 0&&(i.applyMatrix4(t),i.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const c=new ue().getNormalMatrix(t);r.applyNormalMatrix(c),r.needsUpdate=!0}const l=this.attributes.tangent;return l!==void 0&&(l.transformDirection(t),l.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return fi.makeRotationFromQuaternion(t),this.applyMatrix4(fi),this}rotateX(t){return fi.makeRotationX(t),this.applyMatrix4(fi),this}rotateY(t){return fi.makeRotationY(t),this.applyMatrix4(fi),this}rotateZ(t){return fi.makeRotationZ(t),this.applyMatrix4(fi),this}translate(t,i,r){return fi.makeTranslation(t,i,r),this.applyMatrix4(fi),this}scale(t,i,r){return fi.makeScale(t,i,r),this.applyMatrix4(fi),this}lookAt(t){return Ah.lookAt(t),Ah.updateMatrix(),this.applyMatrix4(Ah.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ss).negate(),this.translate(Ss.x,Ss.y,Ss.z),this}setFromPoints(t){const i=this.getAttribute("position");if(i===void 0){const r=[];for(let l=0,c=t.length;l<c;l++){const d=t[l];r.push(d.x,d.y,d.z||0)}this.setAttribute("position",new nn(r,3))}else{const r=Math.min(t.length,i.count);for(let l=0;l<r;l++){const c=t[l];i.setXYZ(l,c.x,c.y,c.z||0)}t.length>i.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),i.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new el);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new Q(-1/0,-1/0,-1/0),new Q(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),i)for(let r=0,l=i.length;r<l;r++){const c=i[r];ei.setFromBufferAttribute(c),this.morphTargetsRelative?(_n.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(_n),_n.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(_n)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Jc);const t=this.attributes.position,i=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new Q,1/0);return}if(t){const r=this.boundingSphere.center;if(ei.setFromBufferAttribute(t),i)for(let c=0,d=i.length;c<d;c++){const h=i[c];Ho.setFromBufferAttribute(h),this.morphTargetsRelative?(_n.addVectors(ei.min,Ho.min),ei.expandByPoint(_n),_n.addVectors(ei.max,Ho.max),ei.expandByPoint(_n)):(ei.expandByPoint(Ho.min),ei.expandByPoint(Ho.max))}ei.getCenter(r);let l=0;for(let c=0,d=t.count;c<d;c++)_n.fromBufferAttribute(t,c),l=Math.max(l,r.distanceToSquared(_n));if(i)for(let c=0,d=i.length;c<d;c++){const h=i[c],p=this.morphTargetsRelative;for(let m=0,g=h.count;m<g;m++)_n.fromBufferAttribute(h,m),p&&(Ss.fromBufferAttribute(t,m),_n.add(Ss)),l=Math.max(l,r.distanceToSquared(_n))}this.boundingSphere.radius=Math.sqrt(l),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,i=this.attributes;if(t===null||i.position===void 0||i.normal===void 0||i.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=i.position,l=i.normal,c=i.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pi(new Float32Array(4*r.count),4));const d=this.getAttribute("tangent"),h=[],p=[];for(let V=0;V<r.count;V++)h[V]=new Q,p[V]=new Q;const m=new Q,g=new Q,_=new Q,x=new De,M=new De,E=new De,A=new Q,S=new Q;function v(V,w,R){m.fromBufferAttribute(r,V),g.fromBufferAttribute(r,w),_.fromBufferAttribute(r,R),x.fromBufferAttribute(c,V),M.fromBufferAttribute(c,w),E.fromBufferAttribute(c,R),g.sub(m),_.sub(m),M.sub(x),E.sub(x);const I=1/(M.x*E.y-E.x*M.y);isFinite(I)&&(A.copy(g).multiplyScalar(E.y).addScaledVector(_,-M.y).multiplyScalar(I),S.copy(_).multiplyScalar(M.x).addScaledVector(g,-E.x).multiplyScalar(I),h[V].add(A),h[w].add(A),h[R].add(A),p[V].add(S),p[w].add(S),p[R].add(S))}let P=this.groups;P.length===0&&(P=[{start:0,count:t.count}]);for(let V=0,w=P.length;V<w;++V){const R=P[V],I=R.start,J=R.count;for(let $=I,ut=I+J;$<ut;$+=3)v(t.getX($+0),t.getX($+1),t.getX($+2))}const N=new Q,D=new Q,q=new Q,H=new Q;function O(V){q.fromBufferAttribute(l,V),H.copy(q);const w=h[V];N.copy(w),N.sub(q.multiplyScalar(q.dot(w))).normalize(),D.crossVectors(H,w);const I=D.dot(p[V])<0?-1:1;d.setXYZW(V,N.x,N.y,N.z,I)}for(let V=0,w=P.length;V<w;++V){const R=P[V],I=R.start,J=R.count;for(let $=I,ut=I+J;$<ut;$+=3)O(t.getX($+0)),O(t.getX($+1)),O(t.getX($+2))}}computeVertexNormals(){const t=this.index,i=this.getAttribute("position");if(i!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new Pi(new Float32Array(i.count*3),3),this.setAttribute("normal",r);else for(let x=0,M=r.count;x<M;x++)r.setXYZ(x,0,0,0);const l=new Q,c=new Q,d=new Q,h=new Q,p=new Q,m=new Q,g=new Q,_=new Q;if(t)for(let x=0,M=t.count;x<M;x+=3){const E=t.getX(x+0),A=t.getX(x+1),S=t.getX(x+2);l.fromBufferAttribute(i,E),c.fromBufferAttribute(i,A),d.fromBufferAttribute(i,S),g.subVectors(d,c),_.subVectors(l,c),g.cross(_),h.fromBufferAttribute(r,E),p.fromBufferAttribute(r,A),m.fromBufferAttribute(r,S),h.add(g),p.add(g),m.add(g),r.setXYZ(E,h.x,h.y,h.z),r.setXYZ(A,p.x,p.y,p.z),r.setXYZ(S,m.x,m.y,m.z)}else for(let x=0,M=i.count;x<M;x+=3)l.fromBufferAttribute(i,x+0),c.fromBufferAttribute(i,x+1),d.fromBufferAttribute(i,x+2),g.subVectors(d,c),_.subVectors(l,c),g.cross(_),r.setXYZ(x+0,g.x,g.y,g.z),r.setXYZ(x+1,g.x,g.y,g.z),r.setXYZ(x+2,g.x,g.y,g.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let i=0,r=t.count;i<r;i++)_n.fromBufferAttribute(t,i),_n.normalize(),t.setXYZ(i,_n.x,_n.y,_n.z)}toNonIndexed(){function t(h,p){const m=h.array,g=h.itemSize,_=h.normalized,x=new m.constructor(p.length*g);let M=0,E=0;for(let A=0,S=p.length;A<S;A++){h.isInterleavedBufferAttribute?M=p[A]*h.data.stride+h.offset:M=p[A]*g;for(let v=0;v<g;v++)x[E++]=m[M++]}return new Pi(x,g,_)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const i=new Wn,r=this.index.array,l=this.attributes;for(const h in l){const p=l[h],m=t(p,r);i.setAttribute(h,m)}const c=this.morphAttributes;for(const h in c){const p=[],m=c[h];for(let g=0,_=m.length;g<_;g++){const x=m[g],M=t(x,r);p.push(M)}i.morphAttributes[h]=p}i.morphTargetsRelative=this.morphTargetsRelative;const d=this.groups;for(let h=0,p=d.length;h<p;h++){const m=d[h];i.addGroup(m.start,m.count,m.materialIndex)}return i}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const p=this.parameters;for(const m in p)p[m]!==void 0&&(t[m]=p[m]);return t}t.data={attributes:{}};const i=this.index;i!==null&&(t.data.index={type:i.array.constructor.name,array:Array.prototype.slice.call(i.array)});const r=this.attributes;for(const p in r){const m=r[p];t.data.attributes[p]=m.toJSON(t.data)}const l={};let c=!1;for(const p in this.morphAttributes){const m=this.morphAttributes[p],g=[];for(let _=0,x=m.length;_<x;_++){const M=m[_];g.push(M.toJSON(t.data))}g.length>0&&(l[p]=g,c=!0)}c&&(t.data.morphAttributes=l,t.data.morphTargetsRelative=this.morphTargetsRelative);const d=this.groups;d.length>0&&(t.data.groups=JSON.parse(JSON.stringify(d)));const h=this.boundingSphere;return h!==null&&(t.data.boundingSphere={center:h.center.toArray(),radius:h.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const i={};this.name=t.name;const r=t.index;r!==null&&this.setIndex(r.clone(i));const l=t.attributes;for(const m in l){const g=l[m];this.setAttribute(m,g.clone(i))}const c=t.morphAttributes;for(const m in c){const g=[],_=c[m];for(let x=0,M=_.length;x<M;x++)g.push(_[x].clone(i));this.morphAttributes[m]=g}this.morphTargetsRelative=t.morphTargetsRelative;const d=t.groups;for(let m=0,g=d.length;m<g;m++){const _=d[m];this.addGroup(_.start,_.count,_.materialIndex)}const h=t.boundingBox;h!==null&&(this.boundingBox=h.clone());const p=t.boundingSphere;return p!==null&&(this.boundingSphere=p.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const $_=new Ze,_r=new dv,Ec=new Jc,t0=new Q,Tc=new Q,bc=new Q,Ac=new Q,Rh=new Q,Rc=new Q,e0=new Q,Cc=new Q;class cn extends bn{constructor(t=new Wn,i=new zi){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=i,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const i=this.geometry.morphAttributes,r=Object.keys(i);if(r.length>0){const l=i[r[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,d=l.length;c<d;c++){const h=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}getVertexPosition(t,i){const r=this.geometry,l=r.attributes.position,c=r.morphAttributes.position,d=r.morphTargetsRelative;i.fromBufferAttribute(l,t);const h=this.morphTargetInfluences;if(c&&h){Rc.set(0,0,0);for(let p=0,m=c.length;p<m;p++){const g=h[p],_=c[p];g!==0&&(Rh.fromBufferAttribute(_,t),d?Rc.addScaledVector(Rh,g):Rc.addScaledVector(Rh.sub(i),g))}i.add(Rc)}return i}raycast(t,i){const r=this.geometry,l=this.material,c=this.matrixWorld;l!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),Ec.copy(r.boundingSphere),Ec.applyMatrix4(c),_r.copy(t.ray).recast(t.near),!(Ec.containsPoint(_r.origin)===!1&&(_r.intersectSphere(Ec,t0)===null||_r.origin.distanceToSquared(t0)>(t.far-t.near)**2))&&($_.copy(c).invert(),_r.copy(t.ray).applyMatrix4($_),!(r.boundingBox!==null&&_r.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(t,i,_r)))}_computeIntersections(t,i,r){let l;const c=this.geometry,d=this.material,h=c.index,p=c.attributes.position,m=c.attributes.uv,g=c.attributes.uv1,_=c.attributes.normal,x=c.groups,M=c.drawRange;if(h!==null)if(Array.isArray(d))for(let E=0,A=x.length;E<A;E++){const S=x[E],v=d[S.materialIndex],P=Math.max(S.start,M.start),N=Math.min(h.count,Math.min(S.start+S.count,M.start+M.count));for(let D=P,q=N;D<q;D+=3){const H=h.getX(D),O=h.getX(D+1),V=h.getX(D+2);l=wc(this,v,t,r,m,g,_,H,O,V),l&&(l.faceIndex=Math.floor(D/3),l.face.materialIndex=S.materialIndex,i.push(l))}}else{const E=Math.max(0,M.start),A=Math.min(h.count,M.start+M.count);for(let S=E,v=A;S<v;S+=3){const P=h.getX(S),N=h.getX(S+1),D=h.getX(S+2);l=wc(this,d,t,r,m,g,_,P,N,D),l&&(l.faceIndex=Math.floor(S/3),i.push(l))}}else if(p!==void 0)if(Array.isArray(d))for(let E=0,A=x.length;E<A;E++){const S=x[E],v=d[S.materialIndex],P=Math.max(S.start,M.start),N=Math.min(p.count,Math.min(S.start+S.count,M.start+M.count));for(let D=P,q=N;D<q;D+=3){const H=D,O=D+1,V=D+2;l=wc(this,v,t,r,m,g,_,H,O,V),l&&(l.faceIndex=Math.floor(D/3),l.face.materialIndex=S.materialIndex,i.push(l))}}else{const E=Math.max(0,M.start),A=Math.min(p.count,M.start+M.count);for(let S=E,v=A;S<v;S+=3){const P=S,N=S+1,D=S+2;l=wc(this,d,t,r,m,g,_,P,N,D),l&&(l.faceIndex=Math.floor(S/3),i.push(l))}}}}function cM(s,t,i,r,l,c,d,h){let p;if(t.side===qn?p=r.intersectTriangle(d,c,l,!0,h):p=r.intersectTriangle(l,c,d,t.side===Za,h),p===null)return null;Cc.copy(h),Cc.applyMatrix4(s.matrixWorld);const m=i.ray.origin.distanceTo(Cc);return m<i.near||m>i.far?null:{distance:m,point:Cc.clone(),object:s}}function wc(s,t,i,r,l,c,d,h,p,m){s.getVertexPosition(h,Tc),s.getVertexPosition(p,bc),s.getVertexPosition(m,Ac);const g=cM(s,t,i,r,Tc,bc,Ac,e0);if(g){const _=new Q;Ti.getBarycoord(e0,Tc,bc,Ac,_),l&&(g.uv=Ti.getInterpolatedAttribute(l,h,p,m,_,new De)),c&&(g.uv1=Ti.getInterpolatedAttribute(c,h,p,m,_,new De)),d&&(g.normal=Ti.getInterpolatedAttribute(d,h,p,m,_,new Q),g.normal.dot(r.direction)>0&&g.normal.multiplyScalar(-1));const x={a:h,b:p,c:m,normal:new Q,materialIndex:0};Ti.getNormal(Tc,bc,Ac,x.normal),g.face=x,g.barycoord=_}return g}class Dr extends Wn{constructor(t=1,i=1,r=1,l=1,c=1,d=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:i,depth:r,widthSegments:l,heightSegments:c,depthSegments:d};const h=this;l=Math.floor(l),c=Math.floor(c),d=Math.floor(d);const p=[],m=[],g=[],_=[];let x=0,M=0;E("z","y","x",-1,-1,r,i,t,d,c,0),E("z","y","x",1,-1,r,i,-t,d,c,1),E("x","z","y",1,1,t,r,i,l,d,2),E("x","z","y",1,-1,t,r,-i,l,d,3),E("x","y","z",1,-1,t,i,r,l,c,4),E("x","y","z",-1,-1,t,i,-r,l,c,5),this.setIndex(p),this.setAttribute("position",new nn(m,3)),this.setAttribute("normal",new nn(g,3)),this.setAttribute("uv",new nn(_,2));function E(A,S,v,P,N,D,q,H,O,V,w){const R=D/O,I=q/V,J=D/2,$=q/2,ut=H/2,gt=O+1,z=V+1;let K=0,X=0;const ht=new Q;for(let Et=0;Et<z;Et++){const L=Et*I-$;for(let tt=0;tt<gt;tt++){const St=tt*R-J;ht[A]=St*P,ht[S]=L*N,ht[v]=ut,m.push(ht.x,ht.y,ht.z),ht[A]=0,ht[S]=0,ht[v]=H>0?1:-1,g.push(ht.x,ht.y,ht.z),_.push(tt/O),_.push(1-Et/V),K+=1}}for(let Et=0;Et<V;Et++)for(let L=0;L<O;L++){const tt=x+L+gt*Et,St=x+L+gt*(Et+1),Z=x+(L+1)+gt*(Et+1),ft=x+(L+1)+gt*Et;p.push(tt,St,ft),p.push(St,Z,ft),X+=6}h.addGroup(M,X,w),M+=X,x+=K}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Dr(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Is(s){const t={};for(const i in s){t[i]={};for(const r in s[i]){const l=s[i][r];l&&(l.isColor||l.isMatrix3||l.isMatrix4||l.isVector2||l.isVector3||l.isVector4||l.isTexture||l.isQuaternion)?l.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[i][r]=null):t[i][r]=l.clone():Array.isArray(l)?t[i][r]=l.slice():t[i][r]=l}}return t}function Pn(s){const t={};for(let i=0;i<s.length;i++){const r=Is(s[i]);for(const l in r)t[l]=r[l]}return t}function uM(s){const t=[];for(let i=0;i<s.length;i++)t.push(s[i].clone());return t}function vv(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:we.workingColorSpace}const fM={clone:Is,merge:Pn};var hM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,dM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class ja extends Gs{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=hM,this.fragmentShader=dM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Is(t.uniforms),this.uniformsGroups=uM(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const i=super.toJSON(t);i.glslVersion=this.glslVersion,i.uniforms={};for(const l in this.uniforms){const d=this.uniforms[l].value;d&&d.isTexture?i.uniforms[l]={type:"t",value:d.toJSON(t).uuid}:d&&d.isColor?i.uniforms[l]={type:"c",value:d.getHex()}:d&&d.isVector2?i.uniforms[l]={type:"v2",value:d.toArray()}:d&&d.isVector3?i.uniforms[l]={type:"v3",value:d.toArray()}:d&&d.isVector4?i.uniforms[l]={type:"v4",value:d.toArray()}:d&&d.isMatrix3?i.uniforms[l]={type:"m3",value:d.toArray()}:d&&d.isMatrix4?i.uniforms[l]={type:"m4",value:d.toArray()}:i.uniforms[l]={value:d}}Object.keys(this.defines).length>0&&(i.defines=this.defines),i.vertexShader=this.vertexShader,i.fragmentShader=this.fragmentShader,i.lights=this.lights,i.clipping=this.clipping;const r={};for(const l in this.extensions)this.extensions[l]===!0&&(r[l]=!0);return Object.keys(r).length>0&&(i.extensions=r),i}}class yv extends bn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ze,this.projectionMatrix=new Ze,this.projectionMatrixInverse=new Ze,this.coordinateSystem=ua}copy(t,i){return super.copy(t,i),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,i){super.updateWorldMatrix(t,i),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Va=new Q,n0=new De,i0=new De;class Ei extends yv{constructor(t=50,i=1,r=.1,l=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=r,this.far=l,this.focus=10,this.aspect=i,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const i=.5*this.getFilmHeight()/t;this.fov=jo*2*Math.atan(i),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Wo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return jo*2*Math.atan(Math.tan(Wo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,i,r){Va.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Va.x,Va.y).multiplyScalar(-t/Va.z),Va.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(Va.x,Va.y).multiplyScalar(-t/Va.z)}getViewSize(t,i){return this.getViewBounds(t,n0,i0),i.subVectors(i0,n0)}setViewOffset(t,i,r,l,c,d){this.aspect=t/i,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=l,this.view.width=c,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let i=t*Math.tan(Wo*.5*this.fov)/this.zoom,r=2*i,l=this.aspect*r,c=-.5*l;const d=this.view;if(this.view!==null&&this.view.enabled){const p=d.fullWidth,m=d.fullHeight;c+=d.offsetX*l/p,i-=d.offsetY*r/m,l*=d.width/p,r*=d.height/m}const h=this.filmOffset;h!==0&&(c+=t*h/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+l,i,i-r,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.fov=this.fov,i.object.zoom=this.zoom,i.object.near=this.near,i.object.far=this.far,i.object.focus=this.focus,i.object.aspect=this.aspect,this.view!==null&&(i.object.view=Object.assign({},this.view)),i.object.filmGauge=this.filmGauge,i.object.filmOffset=this.filmOffset,i}}const Ms=-90,Es=1;class pM extends bn{constructor(t,i,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const l=new Ei(Ms,Es,t,i);l.layers=this.layers,this.add(l);const c=new Ei(Ms,Es,t,i);c.layers=this.layers,this.add(c);const d=new Ei(Ms,Es,t,i);d.layers=this.layers,this.add(d);const h=new Ei(Ms,Es,t,i);h.layers=this.layers,this.add(h);const p=new Ei(Ms,Es,t,i);p.layers=this.layers,this.add(p);const m=new Ei(Ms,Es,t,i);m.layers=this.layers,this.add(m)}updateCoordinateSystem(){const t=this.coordinateSystem,i=this.children.concat(),[r,l,c,d,h,p]=i;for(const m of i)this.remove(m);if(t===ua)r.up.set(0,1,0),r.lookAt(1,0,0),l.up.set(0,1,0),l.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),d.up.set(0,0,1),d.lookAt(0,-1,0),h.up.set(0,1,0),h.lookAt(0,0,1),p.up.set(0,1,0),p.lookAt(0,0,-1);else if(t===Yc)r.up.set(0,-1,0),r.lookAt(-1,0,0),l.up.set(0,-1,0),l.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),d.up.set(0,0,-1),d.lookAt(0,-1,0),h.up.set(0,-1,0),h.lookAt(0,0,1),p.up.set(0,-1,0),p.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const m of i)this.add(m),m.updateMatrixWorld()}update(t,i){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:l}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[c,d,h,p,m,g]=this.children,_=t.getRenderTarget(),x=t.getActiveCubeFace(),M=t.getActiveMipmapLevel(),E=t.xr.enabled;t.xr.enabled=!1;const A=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,t.setRenderTarget(r,0,l),t.render(i,c),t.setRenderTarget(r,1,l),t.render(i,d),t.setRenderTarget(r,2,l),t.render(i,h),t.setRenderTarget(r,3,l),t.render(i,p),t.setRenderTarget(r,4,l),t.render(i,m),r.texture.generateMipmaps=A,t.setRenderTarget(r,5,l),t.render(i,g),t.setRenderTarget(_,x,M),t.xr.enabled=E,r.texture.needsPMREMUpdate=!0}}class xv extends Un{constructor(t,i,r,l,c,d,h,p,m,g){t=t!==void 0?t:[],i=i!==void 0?i:Ns,super(t,i,r,l,c,d,h,p,m,g),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class mM extends wr{constructor(t=1,i={}){super(t,t,i),this.isWebGLCubeRenderTarget=!0;const r={width:t,height:t,depth:1},l=[r,r,r,r,r,r];this.texture=new xv(l,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=i.generateMipmaps!==void 0?i.generateMipmaps:!1,this.texture.minFilter=i.minFilter!==void 0?i.minFilter:Ni}fromEquirectangularTexture(t,i){this.texture.type=i.type,this.texture.colorSpace=i.colorSpace,this.texture.generateMipmaps=i.generateMipmaps,this.texture.minFilter=i.minFilter,this.texture.magFilter=i.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},l=new Dr(5,5,5),c=new ja({name:"CubemapFromEquirect",uniforms:Is(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:qn,blending:Wa});c.uniforms.tEquirect.value=i;const d=new cn(l,c),h=i.minFilter;return i.minFilter===Rr&&(i.minFilter=Ni),new pM(1,10,this).update(t,d),i.minFilter=h,d.geometry.dispose(),d.material.dispose(),this}clear(t,i,r,l){const c=t.getRenderTarget();for(let d=0;d<6;d++)t.setRenderTarget(this,d),t.clear(i,r,l);t.setRenderTarget(c)}}class gM extends bn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Bi,this.environmentIntensity=1,this.environmentRotation=new Bi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,i){return super.copy(t,i),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const i=super.toJSON(t);return this.fog!==null&&(i.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(i.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(i.object.backgroundIntensity=this.backgroundIntensity),i.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(i.object.environmentIntensity=this.environmentIntensity),i.object.environmentRotation=this.environmentRotation.toArray(),i}}const Ch=new Q,_M=new Q,vM=new ue;class Mr{constructor(t=new Q(1,0,0),i=0){this.isPlane=!0,this.normal=t,this.constant=i}set(t,i){return this.normal.copy(t),this.constant=i,this}setComponents(t,i,r,l){return this.normal.set(t,i,r),this.constant=l,this}setFromNormalAndCoplanarPoint(t,i){return this.normal.copy(t),this.constant=-i.dot(this.normal),this}setFromCoplanarPoints(t,i,r){const l=Ch.subVectors(r,i).cross(_M.subVectors(t,i)).normalize();return this.setFromNormalAndCoplanarPoint(l,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,i){return i.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,i){const r=t.delta(Ch),l=this.normal.dot(r);if(l===0)return this.distanceToPoint(t.start)===0?i.copy(t.start):null;const c=-(t.start.dot(this.normal)+this.constant)/l;return c<0||c>1?null:i.copy(t.start).addScaledVector(r,c)}intersectsLine(t){const i=this.distanceToPoint(t.start),r=this.distanceToPoint(t.end);return i<0&&r>0||r<0&&i>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,i){const r=i||vM.getNormalMatrix(t),l=this.coplanarPoint(Ch).applyMatrix4(t),c=this.normal.applyMatrix3(r).normalize();return this.constant=-l.dot(c),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const vr=new Jc,Dc=new Q;class Wd{constructor(t=new Mr,i=new Mr,r=new Mr,l=new Mr,c=new Mr,d=new Mr){this.planes=[t,i,r,l,c,d]}set(t,i,r,l,c,d){const h=this.planes;return h[0].copy(t),h[1].copy(i),h[2].copy(r),h[3].copy(l),h[4].copy(c),h[5].copy(d),this}copy(t){const i=this.planes;for(let r=0;r<6;r++)i[r].copy(t.planes[r]);return this}setFromProjectionMatrix(t,i=ua){const r=this.planes,l=t.elements,c=l[0],d=l[1],h=l[2],p=l[3],m=l[4],g=l[5],_=l[6],x=l[7],M=l[8],E=l[9],A=l[10],S=l[11],v=l[12],P=l[13],N=l[14],D=l[15];if(r[0].setComponents(p-c,x-m,S-M,D-v).normalize(),r[1].setComponents(p+c,x+m,S+M,D+v).normalize(),r[2].setComponents(p+d,x+g,S+E,D+P).normalize(),r[3].setComponents(p-d,x-g,S-E,D-P).normalize(),r[4].setComponents(p-h,x-_,S-A,D-N).normalize(),i===ua)r[5].setComponents(p+h,x+_,S+A,D+N).normalize();else if(i===Yc)r[5].setComponents(h,_,A,N).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+i);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),vr.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const i=t.geometry;i.boundingSphere===null&&i.computeBoundingSphere(),vr.copy(i.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(vr)}intersectsSprite(t){return vr.center.set(0,0,0),vr.radius=.7071067811865476,vr.applyMatrix4(t.matrixWorld),this.intersectsSphere(vr)}intersectsSphere(t){const i=this.planes,r=t.center,l=-t.radius;for(let c=0;c<6;c++)if(i[c].distanceToPoint(r)<l)return!1;return!0}intersectsBox(t){const i=this.planes;for(let r=0;r<6;r++){const l=i[r];if(Dc.x=l.normal.x>0?t.max.x:t.min.x,Dc.y=l.normal.y>0?t.max.y:t.min.y,Dc.z=l.normal.z>0?t.max.z:t.min.z,l.distanceToPoint(Dc)<0)return!1}return!0}containsPoint(t){const i=this.planes;for(let r=0;r<6;r++)if(i[r].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Sv extends Gs{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Te(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Zc=new Q,jc=new Q,a0=new Ze,Go=new dv,Uc=new Jc,wh=new Q,r0=new Q;class yM extends bn{constructor(t=new Wn,i=new Sv){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=i,this.updateMorphTargets()}copy(t,i){return super.copy(t,i),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const i=t.attributes.position,r=[0];for(let l=1,c=i.count;l<c;l++)Zc.fromBufferAttribute(i,l-1),jc.fromBufferAttribute(i,l),r[l]=r[l-1],r[l]+=Zc.distanceTo(jc);t.setAttribute("lineDistance",new nn(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,i){const r=this.geometry,l=this.matrixWorld,c=t.params.Line.threshold,d=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),Uc.copy(r.boundingSphere),Uc.applyMatrix4(l),Uc.radius+=c,t.ray.intersectsSphere(Uc)===!1)return;a0.copy(l).invert(),Go.copy(t.ray).applyMatrix4(a0);const h=c/((this.scale.x+this.scale.y+this.scale.z)/3),p=h*h,m=this.isLineSegments?2:1,g=r.index,x=r.attributes.position;if(g!==null){const M=Math.max(0,d.start),E=Math.min(g.count,d.start+d.count);for(let A=M,S=E-1;A<S;A+=m){const v=g.getX(A),P=g.getX(A+1),N=Lc(this,t,Go,p,v,P);N&&i.push(N)}if(this.isLineLoop){const A=g.getX(E-1),S=g.getX(M),v=Lc(this,t,Go,p,A,S);v&&i.push(v)}}else{const M=Math.max(0,d.start),E=Math.min(x.count,d.start+d.count);for(let A=M,S=E-1;A<S;A+=m){const v=Lc(this,t,Go,p,A,A+1);v&&i.push(v)}if(this.isLineLoop){const A=Lc(this,t,Go,p,E-1,M);A&&i.push(A)}}}updateMorphTargets(){const i=this.geometry.morphAttributes,r=Object.keys(i);if(r.length>0){const l=i[r[0]];if(l!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,d=l.length;c<d;c++){const h=l[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[h]=c}}}}}function Lc(s,t,i,r,l,c){const d=s.geometry.attributes.position;if(Zc.fromBufferAttribute(d,l),jc.fromBufferAttribute(d,c),i.distanceSqToSegment(Zc,jc,wh,r0)>r)return;wh.applyMatrix4(s.matrixWorld);const p=t.ray.origin.distanceTo(wh);if(!(p<t.near||p>t.far))return{distance:p,point:r0.clone().applyMatrix4(s.matrixWorld),index:l,face:null,faceIndex:null,barycoord:null,object:s}}const s0=new Q,o0=new Q;class Dh extends yM{constructor(t,i){super(t,i),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const i=t.attributes.position,r=[];for(let l=0,c=i.count;l<c;l+=2)s0.fromBufferAttribute(i,l),o0.fromBufferAttribute(i,l+1),r[l]=l===0?0:r[l-1],r[l+1]=r[l]+s0.distanceTo(o0);t.setAttribute("lineDistance",new nn(r,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class fa extends bn{constructor(){super(),this.isGroup=!0,this.type="Group"}}class xM extends Un{constructor(t,i,r,l,c,d,h,p,m){super(t,i,r,l,c,d,h,p,m),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Mv extends Un{constructor(t,i,r,l,c,d,h,p,m,g=Ds){if(g!==Ds&&g!==Ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&g===Ds&&(r=Cr),r===void 0&&g===Ps&&(r=zs),super(null,l,c,d,h,p,g,r,m),this.isDepthTexture=!0,this.image={width:t,height:i},this.magFilter=h!==void 0?h:Ai,this.minFilter=p!==void 0?p:Ai,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const i=super.toJSON(t);return this.compareFunction!==null&&(i.compareFunction=this.compareFunction),i}}class Rs extends Wn{constructor(t=1,i=32,r=0,l=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:i,thetaStart:r,thetaLength:l},i=Math.max(3,i);const c=[],d=[],h=[],p=[],m=new Q,g=new De;d.push(0,0,0),h.push(0,0,1),p.push(.5,.5);for(let _=0,x=3;_<=i;_++,x+=3){const M=r+_/i*l;m.x=t*Math.cos(M),m.y=t*Math.sin(M),d.push(m.x,m.y,m.z),h.push(0,0,1),g.x=(d[x]/t+1)/2,g.y=(d[x+1]/t+1)/2,p.push(g.x,g.y)}for(let _=1;_<=i;_++)c.push(_,_+1,0);this.setIndex(c),this.setAttribute("position",new nn(d,3)),this.setAttribute("normal",new nn(h,3)),this.setAttribute("uv",new nn(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Rs(t.radius,t.segments,t.thetaStart,t.thetaLength)}}class Yd extends Wn{constructor(t=1,i=1,r=1,l=32,c=1,d=!1,h=0,p=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:i,height:r,radialSegments:l,heightSegments:c,openEnded:d,thetaStart:h,thetaLength:p};const m=this;l=Math.floor(l),c=Math.floor(c);const g=[],_=[],x=[],M=[];let E=0;const A=[],S=r/2;let v=0;P(),d===!1&&(t>0&&N(!0),i>0&&N(!1)),this.setIndex(g),this.setAttribute("position",new nn(_,3)),this.setAttribute("normal",new nn(x,3)),this.setAttribute("uv",new nn(M,2));function P(){const D=new Q,q=new Q;let H=0;const O=(i-t)/r;for(let V=0;V<=c;V++){const w=[],R=V/c,I=R*(i-t)+t;for(let J=0;J<=l;J++){const $=J/l,ut=$*p+h,gt=Math.sin(ut),z=Math.cos(ut);q.x=I*gt,q.y=-R*r+S,q.z=I*z,_.push(q.x,q.y,q.z),D.set(gt,O,z).normalize(),x.push(D.x,D.y,D.z),M.push($,1-R),w.push(E++)}A.push(w)}for(let V=0;V<l;V++)for(let w=0;w<c;w++){const R=A[w][V],I=A[w+1][V],J=A[w+1][V+1],$=A[w][V+1];(t>0||w!==0)&&(g.push(R,I,$),H+=3),(i>0||w!==c-1)&&(g.push(I,J,$),H+=3)}m.addGroup(v,H,0),v+=H}function N(D){const q=E,H=new De,O=new Q;let V=0;const w=D===!0?t:i,R=D===!0?1:-1;for(let J=1;J<=l;J++)_.push(0,S*R,0),x.push(0,R,0),M.push(.5,.5),E++;const I=E;for(let J=0;J<=l;J++){const ut=J/l*p+h,gt=Math.cos(ut),z=Math.sin(ut);O.x=w*z,O.y=S*R,O.z=w*gt,_.push(O.x,O.y,O.z),x.push(0,R,0),H.x=gt*.5+.5,H.y=z*.5*R+.5,M.push(H.x,H.y),E++}for(let J=0;J<l;J++){const $=q+J,ut=I+J;D===!0?g.push(ut,ut+1,$):g.push(ut+1,ut,$),V+=3}m.addGroup(v,V,D===!0?1:2),v+=V}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yd(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Ur extends Wn{constructor(t=1,i=1,r=1,l=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:i,widthSegments:r,heightSegments:l};const c=t/2,d=i/2,h=Math.floor(r),p=Math.floor(l),m=h+1,g=p+1,_=t/h,x=i/p,M=[],E=[],A=[],S=[];for(let v=0;v<g;v++){const P=v*x-d;for(let N=0;N<m;N++){const D=N*_-c;E.push(D,-P,0),A.push(0,0,1),S.push(N/h),S.push(1-v/p)}}for(let v=0;v<p;v++)for(let P=0;P<h;P++){const N=P+m*v,D=P+m*(v+1),q=P+1+m*(v+1),H=P+1+m*v;M.push(N,D,H),M.push(D,q,H)}this.setIndex(M),this.setAttribute("position",new nn(E,3)),this.setAttribute("normal",new nn(A,3)),this.setAttribute("uv",new nn(S,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ur(t.width,t.height,t.widthSegments,t.heightSegments)}}class Zd extends Wn{constructor(t=1,i=.4,r=12,l=48,c=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:i,radialSegments:r,tubularSegments:l,arc:c},r=Math.floor(r),l=Math.floor(l);const d=[],h=[],p=[],m=[],g=new Q,_=new Q,x=new Q;for(let M=0;M<=r;M++)for(let E=0;E<=l;E++){const A=E/l*c,S=M/r*Math.PI*2;_.x=(t+i*Math.cos(S))*Math.cos(A),_.y=(t+i*Math.cos(S))*Math.sin(A),_.z=i*Math.sin(S),h.push(_.x,_.y,_.z),g.x=t*Math.cos(A),g.y=t*Math.sin(A),x.subVectors(_,g).normalize(),p.push(x.x,x.y,x.z),m.push(E/l),m.push(M/r)}for(let M=1;M<=r;M++)for(let E=1;E<=l;E++){const A=(l+1)*M+E-1,S=(l+1)*(M-1)+E-1,v=(l+1)*(M-1)+E,P=(l+1)*M+E;d.push(A,S,P),d.push(S,v,P)}this.setIndex(d),this.setAttribute("position",new nn(h,3)),this.setAttribute("normal",new nn(p,3)),this.setAttribute("uv",new nn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Zd(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class Uh extends Gs{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Te(16777215),this.specular=new Te(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Te(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=lv,this.normalScale=new De(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.combine=Id,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class SM extends Gs{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vS,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class MM extends Gs{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const l0={enabled:!1,files:{},add:function(s,t){this.enabled!==!1&&(this.files[s]=t)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class EM{constructor(t,i,r){const l=this;let c=!1,d=0,h=0,p;const m=[];this.onStart=void 0,this.onLoad=t,this.onProgress=i,this.onError=r,this.itemStart=function(g){h++,c===!1&&l.onStart!==void 0&&l.onStart(g,d,h),c=!0},this.itemEnd=function(g){d++,l.onProgress!==void 0&&l.onProgress(g,d,h),d===h&&(c=!1,l.onLoad!==void 0&&l.onLoad())},this.itemError=function(g){l.onError!==void 0&&l.onError(g)},this.resolveURL=function(g){return p?p(g):g},this.setURLModifier=function(g){return p=g,this},this.addHandler=function(g,_){return m.push(g,_),this},this.removeHandler=function(g){const _=m.indexOf(g);return _!==-1&&m.splice(_,2),this},this.getHandler=function(g){for(let _=0,x=m.length;_<x;_+=2){const M=m[_],E=m[_+1];if(M.global&&(M.lastIndex=0),M.test(g))return E}return null}}}const TM=new EM;class jd{constructor(t){this.manager=t!==void 0?t:TM,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,i){const r=this;return new Promise(function(l,c){r.load(t,l,i,c)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}jd.DEFAULT_MATERIAL_NAME="__DEFAULT";class bM extends jd{constructor(t){super(t)}load(t,i,r,l){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const c=this,d=l0.get(t);if(d!==void 0)return c.manager.itemStart(t),setTimeout(function(){i&&i(d),c.manager.itemEnd(t)},0),d;const h=Ko("img");function p(){g(),l0.add(t,this),i&&i(this),c.manager.itemEnd(t)}function m(_){g(),l&&l(_),c.manager.itemError(t),c.manager.itemEnd(t)}function g(){h.removeEventListener("load",p,!1),h.removeEventListener("error",m,!1)}return h.addEventListener("load",p,!1),h.addEventListener("error",m,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(h.crossOrigin=this.crossOrigin),c.manager.itemStart(t),h.src=t,h}}class AM extends jd{constructor(t){super(t)}load(t,i,r,l){const c=new Un,d=new bM(this.manager);return d.setCrossOrigin(this.crossOrigin),d.setPath(this.path),d.load(t,function(h){c.image=h,c.needsUpdate=!0,i!==void 0&&i(c)},r,l),c}}class Ev extends bn{constructor(t,i=1){super(),this.isLight=!0,this.type="Light",this.color=new Te(t),this.intensity=i}dispose(){}copy(t,i){return super.copy(t,i),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const i=super.toJSON(t);return i.object.color=this.color.getHex(),i.object.intensity=this.intensity,this.groundColor!==void 0&&(i.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(i.object.distance=this.distance),this.angle!==void 0&&(i.object.angle=this.angle),this.decay!==void 0&&(i.object.decay=this.decay),this.penumbra!==void 0&&(i.object.penumbra=this.penumbra),this.shadow!==void 0&&(i.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(i.object.target=this.target.uuid),i}}const Lh=new Ze,c0=new Q,u0=new Q;class RM{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new De(512,512),this.map=null,this.mapPass=null,this.matrix=new Ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Wd,this._frameExtents=new De(1,1),this._viewportCount=1,this._viewports=[new $e(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const i=this.camera,r=this.matrix;c0.setFromMatrixPosition(t.matrixWorld),i.position.copy(c0),u0.setFromMatrixPosition(t.target.matrixWorld),i.lookAt(u0),i.updateMatrixWorld(),Lh.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Lh),r.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),r.multiply(Lh)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Kd extends yv{constructor(t=-1,i=1,r=1,l=-1,c=.1,d=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=i,this.top=r,this.bottom=l,this.near=c,this.far=d,this.updateProjectionMatrix()}copy(t,i){return super.copy(t,i),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,i,r,l,c,d){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=i,this.view.offsetX=r,this.view.offsetY=l,this.view.width=c,this.view.height=d,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),i=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,l=(this.top+this.bottom)/2;let c=r-t,d=r+t,h=l+i,p=l-i;if(this.view!==null&&this.view.enabled){const m=(this.right-this.left)/this.view.fullWidth/this.zoom,g=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=m*this.view.offsetX,d=c+m*this.view.width,h-=g*this.view.offsetY,p=h-g*this.view.height}this.projectionMatrix.makeOrthographic(c,d,h,p,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const i=super.toJSON(t);return i.object.zoom=this.zoom,i.object.left=this.left,i.object.right=this.right,i.object.top=this.top,i.object.bottom=this.bottom,i.object.near=this.near,i.object.far=this.far,this.view!==null&&(i.object.view=Object.assign({},this.view)),i}}class CM extends RM{constructor(){super(new Kd(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class wM extends Ev{constructor(t,i){super(t,i),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bn.DEFAULT_UP),this.updateMatrix(),this.target=new bn,this.shadow=new CM}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class DM extends Ev{constructor(t,i){super(t,i),this.isAmbientLight=!0,this.type="AmbientLight"}}class UM extends Ei{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}function f0(s,t,i,r){const l=LM(r);switch(i){case ev:return s*t;case iv:return s*t;case av:return s*t*2;case rv:return s*t/l.components*l.byteLength;case Vd:return s*t/l.components*l.byteLength;case sv:return s*t*2/l.components*l.byteLength;case kd:return s*t*2/l.components*l.byteLength;case nv:return s*t*3/l.components*l.byteLength;case bi:return s*t*4/l.components*l.byteLength;case Xd:return s*t*4/l.components*l.byteLength;case Bc:case Ic:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Fc:case Hc:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case cd:case fd:return Math.max(s,16)*Math.max(t,8)/4;case ld:case ud:return Math.max(s,8)*Math.max(t,8)/2;case hd:case dd:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case pd:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case md:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case gd:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case _d:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case vd:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case yd:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case xd:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Sd:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Md:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Ed:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Td:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case bd:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Ad:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Rd:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Cd:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Gc:case wd:case Dd:return Math.ceil(s/4)*Math.ceil(t/4)*16;case ov:case Ud:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Ld:case Nd:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${i} format.`)}function LM(s){switch(s){case da:case J0:return{byteLength:1,components:1};case Zo:case $0:case $o:return{byteLength:2,components:1};case Hd:case Gd:return{byteLength:2,components:4};case Cr:case Fd:case ca:return{byteLength:4,components:1};case tv:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bd}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bd);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Tv(){let s=null,t=!1,i=null,r=null;function l(c,d){i(c,d),r=s.requestAnimationFrame(l)}return{start:function(){t!==!0&&i!==null&&(r=s.requestAnimationFrame(l),t=!0)},stop:function(){s.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(c){i=c},setContext:function(c){s=c}}}function NM(s){const t=new WeakMap;function i(h,p){const m=h.array,g=h.usage,_=m.byteLength,x=s.createBuffer();s.bindBuffer(p,x),s.bufferData(p,m,g),h.onUploadCallback();let M;if(m instanceof Float32Array)M=s.FLOAT;else if(m instanceof Uint16Array)h.isFloat16BufferAttribute?M=s.HALF_FLOAT:M=s.UNSIGNED_SHORT;else if(m instanceof Int16Array)M=s.SHORT;else if(m instanceof Uint32Array)M=s.UNSIGNED_INT;else if(m instanceof Int32Array)M=s.INT;else if(m instanceof Int8Array)M=s.BYTE;else if(m instanceof Uint8Array)M=s.UNSIGNED_BYTE;else if(m instanceof Uint8ClampedArray)M=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+m);return{buffer:x,type:M,bytesPerElement:m.BYTES_PER_ELEMENT,version:h.version,size:_}}function r(h,p,m){const g=p.array,_=p.updateRanges;if(s.bindBuffer(m,h),_.length===0)s.bufferSubData(m,0,g);else{_.sort((M,E)=>M.start-E.start);let x=0;for(let M=1;M<_.length;M++){const E=_[x],A=_[M];A.start<=E.start+E.count+1?E.count=Math.max(E.count,A.start+A.count-E.start):(++x,_[x]=A)}_.length=x+1;for(let M=0,E=_.length;M<E;M++){const A=_[M];s.bufferSubData(m,A.start*g.BYTES_PER_ELEMENT,g,A.start,A.count)}p.clearUpdateRanges()}p.onUploadCallback()}function l(h){return h.isInterleavedBufferAttribute&&(h=h.data),t.get(h)}function c(h){h.isInterleavedBufferAttribute&&(h=h.data);const p=t.get(h);p&&(s.deleteBuffer(p.buffer),t.delete(h))}function d(h,p){if(h.isInterleavedBufferAttribute&&(h=h.data),h.isGLBufferAttribute){const g=t.get(h);(!g||g.version<h.version)&&t.set(h,{buffer:h.buffer,type:h.type,bytesPerElement:h.elementSize,version:h.version});return}const m=t.get(h);if(m===void 0)t.set(h,i(h,p));else if(m.version<h.version){if(m.size!==h.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(m.buffer,h,p),m.version=h.version}}return{get:l,remove:c,update:d}}var OM=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,zM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,PM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,BM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,IM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,FM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,HM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,GM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,VM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,kM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,XM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,qM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,WM=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,YM=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ZM=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,jM=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,KM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,QM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,JM=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,$M=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,tE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,eE=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,nE=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,iE=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,aE=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,rE=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,sE=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,oE=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,lE=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cE=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,uE="gl_FragColor = linearToOutputTexel( gl_FragColor );",fE=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hE=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,dE=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,pE=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,mE=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,gE=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,_E=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,vE=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,yE=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,xE=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,SE=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ME=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,EE=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,TE=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,bE=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,AE=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,RE=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,CE=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,wE=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,DE=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,UE=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,LE=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,NE=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,OE=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,zE=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,PE=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,BE=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,IE=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,FE=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,HE=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,GE=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,VE=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,kE=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,XE=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,qE=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,WE=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,YE=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ZE=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jE=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,KE=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,QE=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,JE=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,$E=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,tT=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,eT=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,nT=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,iT=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,aT=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,rT=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sT=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,oT=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,lT=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,cT=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,uT=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,fT=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hT=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,dT=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,pT=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,mT=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,gT=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,_T=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,vT=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,yT=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,xT=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ST=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,MT=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ET=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,TT=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,bT=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,AT=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,RT=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,CT=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,wT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,DT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,UT=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,LT=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const NT=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,OT=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,PT=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,BT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,IT=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,FT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,HT=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,GT=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,VT=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,kT=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,XT=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qT=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,WT=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,YT=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ZT=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jT=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,KT=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,QT=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,JT=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$T=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,tb=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,eb=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,nb=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ib=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,ab=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rb=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sb=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ob=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cb=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ub=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,fb=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,hb=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,fe={alphahash_fragment:OM,alphahash_pars_fragment:zM,alphamap_fragment:PM,alphamap_pars_fragment:BM,alphatest_fragment:IM,alphatest_pars_fragment:FM,aomap_fragment:HM,aomap_pars_fragment:GM,batching_pars_vertex:VM,batching_vertex:kM,begin_vertex:XM,beginnormal_vertex:qM,bsdfs:WM,iridescence_fragment:YM,bumpmap_pars_fragment:ZM,clipping_planes_fragment:jM,clipping_planes_pars_fragment:KM,clipping_planes_pars_vertex:QM,clipping_planes_vertex:JM,color_fragment:$M,color_pars_fragment:tE,color_pars_vertex:eE,color_vertex:nE,common:iE,cube_uv_reflection_fragment:aE,defaultnormal_vertex:rE,displacementmap_pars_vertex:sE,displacementmap_vertex:oE,emissivemap_fragment:lE,emissivemap_pars_fragment:cE,colorspace_fragment:uE,colorspace_pars_fragment:fE,envmap_fragment:hE,envmap_common_pars_fragment:dE,envmap_pars_fragment:pE,envmap_pars_vertex:mE,envmap_physical_pars_fragment:AE,envmap_vertex:gE,fog_vertex:_E,fog_pars_vertex:vE,fog_fragment:yE,fog_pars_fragment:xE,gradientmap_pars_fragment:SE,lightmap_pars_fragment:ME,lights_lambert_fragment:EE,lights_lambert_pars_fragment:TE,lights_pars_begin:bE,lights_toon_fragment:RE,lights_toon_pars_fragment:CE,lights_phong_fragment:wE,lights_phong_pars_fragment:DE,lights_physical_fragment:UE,lights_physical_pars_fragment:LE,lights_fragment_begin:NE,lights_fragment_maps:OE,lights_fragment_end:zE,logdepthbuf_fragment:PE,logdepthbuf_pars_fragment:BE,logdepthbuf_pars_vertex:IE,logdepthbuf_vertex:FE,map_fragment:HE,map_pars_fragment:GE,map_particle_fragment:VE,map_particle_pars_fragment:kE,metalnessmap_fragment:XE,metalnessmap_pars_fragment:qE,morphinstance_vertex:WE,morphcolor_vertex:YE,morphnormal_vertex:ZE,morphtarget_pars_vertex:jE,morphtarget_vertex:KE,normal_fragment_begin:QE,normal_fragment_maps:JE,normal_pars_fragment:$E,normal_pars_vertex:tT,normal_vertex:eT,normalmap_pars_fragment:nT,clearcoat_normal_fragment_begin:iT,clearcoat_normal_fragment_maps:aT,clearcoat_pars_fragment:rT,iridescence_pars_fragment:sT,opaque_fragment:oT,packing:lT,premultiplied_alpha_fragment:cT,project_vertex:uT,dithering_fragment:fT,dithering_pars_fragment:hT,roughnessmap_fragment:dT,roughnessmap_pars_fragment:pT,shadowmap_pars_fragment:mT,shadowmap_pars_vertex:gT,shadowmap_vertex:_T,shadowmask_pars_fragment:vT,skinbase_vertex:yT,skinning_pars_vertex:xT,skinning_vertex:ST,skinnormal_vertex:MT,specularmap_fragment:ET,specularmap_pars_fragment:TT,tonemapping_fragment:bT,tonemapping_pars_fragment:AT,transmission_fragment:RT,transmission_pars_fragment:CT,uv_pars_fragment:wT,uv_pars_vertex:DT,uv_vertex:UT,worldpos_vertex:LT,background_vert:NT,background_frag:OT,backgroundCube_vert:zT,backgroundCube_frag:PT,cube_vert:BT,cube_frag:IT,depth_vert:FT,depth_frag:HT,distanceRGBA_vert:GT,distanceRGBA_frag:VT,equirect_vert:kT,equirect_frag:XT,linedashed_vert:qT,linedashed_frag:WT,meshbasic_vert:YT,meshbasic_frag:ZT,meshlambert_vert:jT,meshlambert_frag:KT,meshmatcap_vert:QT,meshmatcap_frag:JT,meshnormal_vert:$T,meshnormal_frag:tb,meshphong_vert:eb,meshphong_frag:nb,meshphysical_vert:ib,meshphysical_frag:ab,meshtoon_vert:rb,meshtoon_frag:sb,points_vert:ob,points_frag:lb,shadow_vert:cb,shadow_frag:ub,sprite_vert:fb,sprite_frag:hb},Ot={common:{diffuse:{value:new Te(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ue},alphaMap:{value:null},alphaMapTransform:{value:new ue},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ue}},envmap:{envMap:{value:null},envMapRotation:{value:new ue},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ue}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ue}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ue},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ue},normalScale:{value:new De(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ue},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ue}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ue}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ue}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Te(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Te(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ue},alphaTest:{value:0},uvTransform:{value:new ue}},sprite:{diffuse:{value:new Te(16777215)},opacity:{value:1},center:{value:new De(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ue},alphaMap:{value:null},alphaMapTransform:{value:new ue},alphaTest:{value:0}}},Li={basic:{uniforms:Pn([Ot.common,Ot.specularmap,Ot.envmap,Ot.aomap,Ot.lightmap,Ot.fog]),vertexShader:fe.meshbasic_vert,fragmentShader:fe.meshbasic_frag},lambert:{uniforms:Pn([Ot.common,Ot.specularmap,Ot.envmap,Ot.aomap,Ot.lightmap,Ot.emissivemap,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,Ot.fog,Ot.lights,{emissive:{value:new Te(0)}}]),vertexShader:fe.meshlambert_vert,fragmentShader:fe.meshlambert_frag},phong:{uniforms:Pn([Ot.common,Ot.specularmap,Ot.envmap,Ot.aomap,Ot.lightmap,Ot.emissivemap,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,Ot.fog,Ot.lights,{emissive:{value:new Te(0)},specular:{value:new Te(1118481)},shininess:{value:30}}]),vertexShader:fe.meshphong_vert,fragmentShader:fe.meshphong_frag},standard:{uniforms:Pn([Ot.common,Ot.envmap,Ot.aomap,Ot.lightmap,Ot.emissivemap,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,Ot.roughnessmap,Ot.metalnessmap,Ot.fog,Ot.lights,{emissive:{value:new Te(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag},toon:{uniforms:Pn([Ot.common,Ot.aomap,Ot.lightmap,Ot.emissivemap,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,Ot.gradientmap,Ot.fog,Ot.lights,{emissive:{value:new Te(0)}}]),vertexShader:fe.meshtoon_vert,fragmentShader:fe.meshtoon_frag},matcap:{uniforms:Pn([Ot.common,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,Ot.fog,{matcap:{value:null}}]),vertexShader:fe.meshmatcap_vert,fragmentShader:fe.meshmatcap_frag},points:{uniforms:Pn([Ot.points,Ot.fog]),vertexShader:fe.points_vert,fragmentShader:fe.points_frag},dashed:{uniforms:Pn([Ot.common,Ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:fe.linedashed_vert,fragmentShader:fe.linedashed_frag},depth:{uniforms:Pn([Ot.common,Ot.displacementmap]),vertexShader:fe.depth_vert,fragmentShader:fe.depth_frag},normal:{uniforms:Pn([Ot.common,Ot.bumpmap,Ot.normalmap,Ot.displacementmap,{opacity:{value:1}}]),vertexShader:fe.meshnormal_vert,fragmentShader:fe.meshnormal_frag},sprite:{uniforms:Pn([Ot.sprite,Ot.fog]),vertexShader:fe.sprite_vert,fragmentShader:fe.sprite_frag},background:{uniforms:{uvTransform:{value:new ue},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:fe.background_vert,fragmentShader:fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ue}},vertexShader:fe.backgroundCube_vert,fragmentShader:fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:fe.cube_vert,fragmentShader:fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:fe.equirect_vert,fragmentShader:fe.equirect_frag},distanceRGBA:{uniforms:Pn([Ot.common,Ot.displacementmap,{referencePosition:{value:new Q},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:fe.distanceRGBA_vert,fragmentShader:fe.distanceRGBA_frag},shadow:{uniforms:Pn([Ot.lights,Ot.fog,{color:{value:new Te(0)},opacity:{value:1}}]),vertexShader:fe.shadow_vert,fragmentShader:fe.shadow_frag}};Li.physical={uniforms:Pn([Li.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ue},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ue},clearcoatNormalScale:{value:new De(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ue},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ue},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ue},sheen:{value:0},sheenColor:{value:new Te(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ue},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ue},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ue},transmissionSamplerSize:{value:new De},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ue},attenuationDistance:{value:0},attenuationColor:{value:new Te(0)},specularColor:{value:new Te(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ue},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ue},anisotropyVector:{value:new De},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ue}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag};const Nc={r:0,b:0,g:0},yr=new Bi,db=new Ze;function pb(s,t,i,r,l,c,d){const h=new Te(0);let p=c===!0?0:1,m,g,_=null,x=0,M=null;function E(N){let D=N.isScene===!0?N.background:null;return D&&D.isTexture&&(D=(N.backgroundBlurriness>0?i:t).get(D)),D}function A(N){let D=!1;const q=E(N);q===null?v(h,p):q&&q.isColor&&(v(q,1),D=!0);const H=s.xr.getEnvironmentBlendMode();H==="additive"?r.buffers.color.setClear(0,0,0,1,d):H==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,d),(s.autoClear||D)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function S(N,D){const q=E(D);q&&(q.isCubeTexture||q.mapping===Qc)?(g===void 0&&(g=new cn(new Dr(1,1,1),new ja({name:"BackgroundCubeMaterial",uniforms:Is(Li.backgroundCube.uniforms),vertexShader:Li.backgroundCube.vertexShader,fragmentShader:Li.backgroundCube.fragmentShader,side:qn,depthTest:!1,depthWrite:!1,fog:!1})),g.geometry.deleteAttribute("normal"),g.geometry.deleteAttribute("uv"),g.onBeforeRender=function(H,O,V){this.matrixWorld.copyPosition(V.matrixWorld)},Object.defineProperty(g.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),l.update(g)),yr.copy(D.backgroundRotation),yr.x*=-1,yr.y*=-1,yr.z*=-1,q.isCubeTexture&&q.isRenderTargetTexture===!1&&(yr.y*=-1,yr.z*=-1),g.material.uniforms.envMap.value=q,g.material.uniforms.flipEnvMap.value=q.isCubeTexture&&q.isRenderTargetTexture===!1?-1:1,g.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,g.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,g.material.uniforms.backgroundRotation.value.setFromMatrix4(db.makeRotationFromEuler(yr)),g.material.toneMapped=we.getTransfer(q.colorSpace)!==Fe,(_!==q||x!==q.version||M!==s.toneMapping)&&(g.material.needsUpdate=!0,_=q,x=q.version,M=s.toneMapping),g.layers.enableAll(),N.unshift(g,g.geometry,g.material,0,0,null)):q&&q.isTexture&&(m===void 0&&(m=new cn(new Ur(2,2),new ja({name:"BackgroundMaterial",uniforms:Is(Li.background.uniforms),vertexShader:Li.background.vertexShader,fragmentShader:Li.background.fragmentShader,side:Za,depthTest:!1,depthWrite:!1,fog:!1})),m.geometry.deleteAttribute("normal"),Object.defineProperty(m.material,"map",{get:function(){return this.uniforms.t2D.value}}),l.update(m)),m.material.uniforms.t2D.value=q,m.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,m.material.toneMapped=we.getTransfer(q.colorSpace)!==Fe,q.matrixAutoUpdate===!0&&q.updateMatrix(),m.material.uniforms.uvTransform.value.copy(q.matrix),(_!==q||x!==q.version||M!==s.toneMapping)&&(m.material.needsUpdate=!0,_=q,x=q.version,M=s.toneMapping),m.layers.enableAll(),N.unshift(m,m.geometry,m.material,0,0,null))}function v(N,D){N.getRGB(Nc,vv(s)),r.buffers.color.setClear(Nc.r,Nc.g,Nc.b,D,d)}function P(){g!==void 0&&(g.geometry.dispose(),g.material.dispose()),m!==void 0&&(m.geometry.dispose(),m.material.dispose())}return{getClearColor:function(){return h},setClearColor:function(N,D=1){h.set(N),p=D,v(h,p)},getClearAlpha:function(){return p},setClearAlpha:function(N){p=N,v(h,p)},render:A,addToRenderList:S,dispose:P}}function mb(s,t){const i=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},l=x(null);let c=l,d=!1;function h(R,I,J,$,ut){let gt=!1;const z=_($,J,I);c!==z&&(c=z,m(c.object)),gt=M(R,$,J,ut),gt&&E(R,$,J,ut),ut!==null&&t.update(ut,s.ELEMENT_ARRAY_BUFFER),(gt||d)&&(d=!1,D(R,I,J,$),ut!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(ut).buffer))}function p(){return s.createVertexArray()}function m(R){return s.bindVertexArray(R)}function g(R){return s.deleteVertexArray(R)}function _(R,I,J){const $=J.wireframe===!0;let ut=r[R.id];ut===void 0&&(ut={},r[R.id]=ut);let gt=ut[I.id];gt===void 0&&(gt={},ut[I.id]=gt);let z=gt[$];return z===void 0&&(z=x(p()),gt[$]=z),z}function x(R){const I=[],J=[],$=[];for(let ut=0;ut<i;ut++)I[ut]=0,J[ut]=0,$[ut]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:J,attributeDivisors:$,object:R,attributes:{},index:null}}function M(R,I,J,$){const ut=c.attributes,gt=I.attributes;let z=0;const K=J.getAttributes();for(const X in K)if(K[X].location>=0){const Et=ut[X];let L=gt[X];if(L===void 0&&(X==="instanceMatrix"&&R.instanceMatrix&&(L=R.instanceMatrix),X==="instanceColor"&&R.instanceColor&&(L=R.instanceColor)),Et===void 0||Et.attribute!==L||L&&Et.data!==L.data)return!0;z++}return c.attributesNum!==z||c.index!==$}function E(R,I,J,$){const ut={},gt=I.attributes;let z=0;const K=J.getAttributes();for(const X in K)if(K[X].location>=0){let Et=gt[X];Et===void 0&&(X==="instanceMatrix"&&R.instanceMatrix&&(Et=R.instanceMatrix),X==="instanceColor"&&R.instanceColor&&(Et=R.instanceColor));const L={};L.attribute=Et,Et&&Et.data&&(L.data=Et.data),ut[X]=L,z++}c.attributes=ut,c.attributesNum=z,c.index=$}function A(){const R=c.newAttributes;for(let I=0,J=R.length;I<J;I++)R[I]=0}function S(R){v(R,0)}function v(R,I){const J=c.newAttributes,$=c.enabledAttributes,ut=c.attributeDivisors;J[R]=1,$[R]===0&&(s.enableVertexAttribArray(R),$[R]=1),ut[R]!==I&&(s.vertexAttribDivisor(R,I),ut[R]=I)}function P(){const R=c.newAttributes,I=c.enabledAttributes;for(let J=0,$=I.length;J<$;J++)I[J]!==R[J]&&(s.disableVertexAttribArray(J),I[J]=0)}function N(R,I,J,$,ut,gt,z){z===!0?s.vertexAttribIPointer(R,I,J,ut,gt):s.vertexAttribPointer(R,I,J,$,ut,gt)}function D(R,I,J,$){A();const ut=$.attributes,gt=J.getAttributes(),z=I.defaultAttributeValues;for(const K in gt){const X=gt[K];if(X.location>=0){let ht=ut[K];if(ht===void 0&&(K==="instanceMatrix"&&R.instanceMatrix&&(ht=R.instanceMatrix),K==="instanceColor"&&R.instanceColor&&(ht=R.instanceColor)),ht!==void 0){const Et=ht.normalized,L=ht.itemSize,tt=t.get(ht);if(tt===void 0)continue;const St=tt.buffer,Z=tt.type,ft=tt.bytesPerElement,At=Z===s.INT||Z===s.UNSIGNED_INT||ht.gpuType===Fd;if(ht.isInterleavedBufferAttribute){const Mt=ht.data,ot=Mt.stride,dt=ht.offset;if(Mt.isInstancedInterleavedBuffer){for(let zt=0;zt<X.locationSize;zt++)v(X.location+zt,Mt.meshPerAttribute);R.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=Mt.meshPerAttribute*Mt.count)}else for(let zt=0;zt<X.locationSize;zt++)S(X.location+zt);s.bindBuffer(s.ARRAY_BUFFER,St);for(let zt=0;zt<X.locationSize;zt++)N(X.location+zt,L/X.locationSize,Z,Et,ot*ft,(dt+L/X.locationSize*zt)*ft,At)}else{if(ht.isInstancedBufferAttribute){for(let Mt=0;Mt<X.locationSize;Mt++)v(X.location+Mt,ht.meshPerAttribute);R.isInstancedMesh!==!0&&$._maxInstanceCount===void 0&&($._maxInstanceCount=ht.meshPerAttribute*ht.count)}else for(let Mt=0;Mt<X.locationSize;Mt++)S(X.location+Mt);s.bindBuffer(s.ARRAY_BUFFER,St);for(let Mt=0;Mt<X.locationSize;Mt++)N(X.location+Mt,L/X.locationSize,Z,Et,L*ft,L/X.locationSize*Mt*ft,At)}}else if(z!==void 0){const Et=z[K];if(Et!==void 0)switch(Et.length){case 2:s.vertexAttrib2fv(X.location,Et);break;case 3:s.vertexAttrib3fv(X.location,Et);break;case 4:s.vertexAttrib4fv(X.location,Et);break;default:s.vertexAttrib1fv(X.location,Et)}}}}P()}function q(){V();for(const R in r){const I=r[R];for(const J in I){const $=I[J];for(const ut in $)g($[ut].object),delete $[ut];delete I[J]}delete r[R]}}function H(R){if(r[R.id]===void 0)return;const I=r[R.id];for(const J in I){const $=I[J];for(const ut in $)g($[ut].object),delete $[ut];delete I[J]}delete r[R.id]}function O(R){for(const I in r){const J=r[I];if(J[R.id]===void 0)continue;const $=J[R.id];for(const ut in $)g($[ut].object),delete $[ut];delete J[R.id]}}function V(){w(),d=!0,c!==l&&(c=l,m(c.object))}function w(){l.geometry=null,l.program=null,l.wireframe=!1}return{setup:h,reset:V,resetDefaultState:w,dispose:q,releaseStatesOfGeometry:H,releaseStatesOfProgram:O,initAttributes:A,enableAttribute:S,disableUnusedAttributes:P}}function gb(s,t,i){let r;function l(m){r=m}function c(m,g){s.drawArrays(r,m,g),i.update(g,r,1)}function d(m,g,_){_!==0&&(s.drawArraysInstanced(r,m,g,_),i.update(g,r,_))}function h(m,g,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,m,0,g,0,_);let M=0;for(let E=0;E<_;E++)M+=g[E];i.update(M,r,1)}function p(m,g,_,x){if(_===0)return;const M=t.get("WEBGL_multi_draw");if(M===null)for(let E=0;E<m.length;E++)d(m[E],g[E],x[E]);else{M.multiDrawArraysInstancedWEBGL(r,m,0,g,0,x,0,_);let E=0;for(let A=0;A<_;A++)E+=g[A]*x[A];i.update(E,r,1)}}this.setMode=l,this.render=c,this.renderInstances=d,this.renderMultiDraw=h,this.renderMultiDrawInstances=p}function _b(s,t,i,r){let l;function c(){if(l!==void 0)return l;if(t.has("EXT_texture_filter_anisotropic")===!0){const O=t.get("EXT_texture_filter_anisotropic");l=s.getParameter(O.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else l=0;return l}function d(O){return!(O!==bi&&r.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function h(O){const V=O===$o&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(O!==da&&r.convert(O)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&O!==ca&&!V)}function p(O){if(O==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";O="mediump"}return O==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let m=i.precision!==void 0?i.precision:"highp";const g=p(m);g!==m&&(console.warn("THREE.WebGLRenderer:",m,"not supported, using",g,"instead."),m=g);const _=i.logarithmicDepthBuffer===!0,x=i.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),M=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),A=s.getParameter(s.MAX_TEXTURE_SIZE),S=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),v=s.getParameter(s.MAX_VERTEX_ATTRIBS),P=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),N=s.getParameter(s.MAX_VARYING_VECTORS),D=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),q=E>0,H=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:p,textureFormatReadable:d,textureTypeReadable:h,precision:m,logarithmicDepthBuffer:_,reverseDepthBuffer:x,maxTextures:M,maxVertexTextures:E,maxTextureSize:A,maxCubemapSize:S,maxAttributes:v,maxVertexUniforms:P,maxVaryings:N,maxFragmentUniforms:D,vertexTextures:q,maxSamples:H}}function vb(s){const t=this;let i=null,r=0,l=!1,c=!1;const d=new Mr,h=new ue,p={value:null,needsUpdate:!1};this.uniform=p,this.numPlanes=0,this.numIntersection=0,this.init=function(_,x){const M=_.length!==0||x||r!==0||l;return l=x,r=_.length,M},this.beginShadows=function(){c=!0,g(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(_,x){i=g(_,x,0)},this.setState=function(_,x,M){const E=_.clippingPlanes,A=_.clipIntersection,S=_.clipShadows,v=s.get(_);if(!l||E===null||E.length===0||c&&!S)c?g(null):m();else{const P=c?0:r,N=P*4;let D=v.clippingState||null;p.value=D,D=g(E,x,N,M);for(let q=0;q!==N;++q)D[q]=i[q];v.clippingState=D,this.numIntersection=A?this.numPlanes:0,this.numPlanes+=P}};function m(){p.value!==i&&(p.value=i,p.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function g(_,x,M,E){const A=_!==null?_.length:0;let S=null;if(A!==0){if(S=p.value,E!==!0||S===null){const v=M+A*4,P=x.matrixWorldInverse;h.getNormalMatrix(P),(S===null||S.length<v)&&(S=new Float32Array(v));for(let N=0,D=M;N!==A;++N,D+=4)d.copy(_[N]).applyMatrix4(P,h),d.normal.toArray(S,D),S[D+3]=d.constant}p.value=S,p.needsUpdate=!0}return t.numPlanes=A,t.numIntersection=0,S}}function yb(s){let t=new WeakMap;function i(d,h){return h===rd?d.mapping=Ns:h===sd&&(d.mapping=Os),d}function r(d){if(d&&d.isTexture){const h=d.mapping;if(h===rd||h===sd)if(t.has(d)){const p=t.get(d).texture;return i(p,d.mapping)}else{const p=d.image;if(p&&p.height>0){const m=new mM(p.height);return m.fromEquirectangularTexture(s,d),t.set(d,m),d.addEventListener("dispose",l),i(m.texture,d.mapping)}else return null}}return d}function l(d){const h=d.target;h.removeEventListener("dispose",l);const p=t.get(h);p!==void 0&&(t.delete(h),p.dispose())}function c(){t=new WeakMap}return{get:r,dispose:c}}const Cs=4,h0=[.125,.215,.35,.446,.526,.582],br=20,Nh=new Kd,d0=new Te;let Oh=null,zh=0,Ph=0,Bh=!1;const Er=(1+Math.sqrt(5))/2,Ts=1/Er,p0=[new Q(-Er,Ts,0),new Q(Er,Ts,0),new Q(-Ts,0,Er),new Q(Ts,0,Er),new Q(0,Er,-Ts),new Q(0,Er,Ts),new Q(-1,1,-1),new Q(1,1,-1),new Q(-1,1,1),new Q(1,1,1)];class m0{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,i=0,r=.1,l=100){Oh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),Ph=this._renderer.getActiveMipmapLevel(),Bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,r,l,c),i>0&&this._blur(c,0,0,i),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,i=null){return this._fromTexture(t,i)}fromCubemap(t,i=null){return this._fromTexture(t,i)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=v0(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_0(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Oh,zh,Ph),this._renderer.xr.enabled=Bh,t.scissorTest=!1,Oc(t,0,0,t.width,t.height)}_fromTexture(t,i){t.mapping===Ns||t.mapping===Os?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Oh=this._renderer.getRenderTarget(),zh=this._renderer.getActiveCubeFace(),Ph=this._renderer.getActiveMipmapLevel(),Bh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=i||this._allocateTargets();return this._textureToCubeUV(t,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),i=4*this._cubeSize,r={magFilter:Ni,minFilter:Ni,generateMipmaps:!1,type:$o,format:bi,colorSpace:Bs,depthBuffer:!1},l=g0(t,i,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==i){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=g0(t,i,r);const{_lodMax:c}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=xb(c)),this._blurMaterial=Sb(c,t,i)}return l}_compileMaterial(t){const i=new cn(this._lodPlanes[0],t);this._renderer.compile(i,Nh)}_sceneToCubeUV(t,i,r,l){const h=new Ei(90,1,i,r),p=[1,-1,1,1,1,1],m=[1,1,1,-1,-1,-1],g=this._renderer,_=g.autoClear,x=g.toneMapping;g.getClearColor(d0),g.toneMapping=Ya,g.autoClear=!1;const M=new zi({name:"PMREM.Background",side:qn,depthWrite:!1,depthTest:!1}),E=new cn(new Dr,M);let A=!1;const S=t.background;S?S.isColor&&(M.color.copy(S),t.background=null,A=!0):(M.color.copy(d0),A=!0);for(let v=0;v<6;v++){const P=v%3;P===0?(h.up.set(0,p[v],0),h.lookAt(m[v],0,0)):P===1?(h.up.set(0,0,p[v]),h.lookAt(0,m[v],0)):(h.up.set(0,p[v],0),h.lookAt(0,0,m[v]));const N=this._cubeSize;Oc(l,P*N,v>2?N:0,N,N),g.setRenderTarget(l),A&&g.render(E,h),g.render(t,h)}E.geometry.dispose(),E.material.dispose(),g.toneMapping=x,g.autoClear=_,t.background=S}_textureToCubeUV(t,i){const r=this._renderer,l=t.mapping===Ns||t.mapping===Os;l?(this._cubemapMaterial===null&&(this._cubemapMaterial=v0()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_0());const c=l?this._cubemapMaterial:this._equirectMaterial,d=new cn(this._lodPlanes[0],c),h=c.uniforms;h.envMap.value=t;const p=this._cubeSize;Oc(i,0,0,3*p,2*p),r.setRenderTarget(i),r.render(d,Nh)}_applyPMREM(t){const i=this._renderer,r=i.autoClear;i.autoClear=!1;const l=this._lodPlanes.length;for(let c=1;c<l;c++){const d=Math.sqrt(this._sigmas[c]*this._sigmas[c]-this._sigmas[c-1]*this._sigmas[c-1]),h=p0[(l-c-1)%p0.length];this._blur(t,c-1,c,d,h)}i.autoClear=r}_blur(t,i,r,l,c){const d=this._pingPongRenderTarget;this._halfBlur(t,d,i,r,l,"latitudinal",c),this._halfBlur(d,t,r,r,l,"longitudinal",c)}_halfBlur(t,i,r,l,c,d,h){const p=this._renderer,m=this._blurMaterial;d!=="latitudinal"&&d!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const g=3,_=new cn(this._lodPlanes[l],m),x=m.uniforms,M=this._sizeLods[r]-1,E=isFinite(c)?Math.PI/(2*M):2*Math.PI/(2*br-1),A=c/E,S=isFinite(c)?1+Math.floor(g*A):br;S>br&&console.warn(`sigmaRadians, ${c}, is too large and will clip, as it requested ${S} samples when the maximum is set to ${br}`);const v=[];let P=0;for(let O=0;O<br;++O){const V=O/A,w=Math.exp(-V*V/2);v.push(w),O===0?P+=w:O<S&&(P+=2*w)}for(let O=0;O<v.length;O++)v[O]=v[O]/P;x.envMap.value=t.texture,x.samples.value=S,x.weights.value=v,x.latitudinal.value=d==="latitudinal",h&&(x.poleAxis.value=h);const{_lodMax:N}=this;x.dTheta.value=E,x.mipInt.value=N-r;const D=this._sizeLods[l],q=3*D*(l>N-Cs?l-N+Cs:0),H=4*(this._cubeSize-D);Oc(i,q,H,3*D,2*D),p.setRenderTarget(i),p.render(_,Nh)}}function xb(s){const t=[],i=[],r=[];let l=s;const c=s-Cs+1+h0.length;for(let d=0;d<c;d++){const h=Math.pow(2,l);i.push(h);let p=1/h;d>s-Cs?p=h0[d-s+Cs-1]:d===0&&(p=0),r.push(p);const m=1/(h-2),g=-m,_=1+m,x=[g,g,_,g,_,_,g,g,_,_,g,_],M=6,E=6,A=3,S=2,v=1,P=new Float32Array(A*E*M),N=new Float32Array(S*E*M),D=new Float32Array(v*E*M);for(let H=0;H<M;H++){const O=H%3*2/3-1,V=H>2?0:-1,w=[O,V,0,O+2/3,V,0,O+2/3,V+1,0,O,V,0,O+2/3,V+1,0,O,V+1,0];P.set(w,A*E*H),N.set(x,S*E*H);const R=[H,H,H,H,H,H];D.set(R,v*E*H)}const q=new Wn;q.setAttribute("position",new Pi(P,A)),q.setAttribute("uv",new Pi(N,S)),q.setAttribute("faceIndex",new Pi(D,v)),t.push(q),l>Cs&&l--}return{lodPlanes:t,sizeLods:i,sigmas:r}}function g0(s,t,i){const r=new wr(s,t,i);return r.texture.mapping=Qc,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function Oc(s,t,i,r,l){s.viewport.set(t,i,r,l),s.scissor.set(t,i,r,l)}function Sb(s,t,i){const r=new Float32Array(br),l=new Q(0,1,0);return new ja({name:"SphericalGaussianBlur",defines:{n:br,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/i,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:l}},vertexShader:Qd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Wa,depthTest:!1,depthWrite:!1})}function _0(){return new ja({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Qd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wa,depthTest:!1,depthWrite:!1})}function v0(){return new ja({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Qd(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wa,depthTest:!1,depthWrite:!1})}function Qd(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Mb(s){let t=new WeakMap,i=null;function r(h){if(h&&h.isTexture){const p=h.mapping,m=p===rd||p===sd,g=p===Ns||p===Os;if(m||g){let _=t.get(h);const x=_!==void 0?_.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==x)return i===null&&(i=new m0(s)),_=m?i.fromEquirectangular(h,_):i.fromCubemap(h,_),_.texture.pmremVersion=h.pmremVersion,t.set(h,_),_.texture;if(_!==void 0)return _.texture;{const M=h.image;return m&&M&&M.height>0||g&&M&&l(M)?(i===null&&(i=new m0(s)),_=m?i.fromEquirectangular(h):i.fromCubemap(h),_.texture.pmremVersion=h.pmremVersion,t.set(h,_),h.addEventListener("dispose",c),_.texture):null}}}return h}function l(h){let p=0;const m=6;for(let g=0;g<m;g++)h[g]!==void 0&&p++;return p===m}function c(h){const p=h.target;p.removeEventListener("dispose",c);const m=t.get(p);m!==void 0&&(t.delete(p),m.dispose())}function d(){t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:r,dispose:d}}function Eb(s){const t={};function i(r){if(t[r]!==void 0)return t[r];let l;switch(r){case"WEBGL_depth_texture":l=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":l=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":l=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":l=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:l=s.getExtension(r)}return t[r]=l,l}return{has:function(r){return i(r)!==null},init:function(){i("EXT_color_buffer_float"),i("WEBGL_clip_cull_distance"),i("OES_texture_float_linear"),i("EXT_color_buffer_half_float"),i("WEBGL_multisampled_render_to_texture"),i("WEBGL_render_shared_exponent")},get:function(r){const l=i(r);return l===null&&As("THREE.WebGLRenderer: "+r+" extension not supported."),l}}}function Tb(s,t,i,r){const l={},c=new WeakMap;function d(_){const x=_.target;x.index!==null&&t.remove(x.index);for(const E in x.attributes)t.remove(x.attributes[E]);x.removeEventListener("dispose",d),delete l[x.id];const M=c.get(x);M&&(t.remove(M),c.delete(x)),r.releaseStatesOfGeometry(x),x.isInstancedBufferGeometry===!0&&delete x._maxInstanceCount,i.memory.geometries--}function h(_,x){return l[x.id]===!0||(x.addEventListener("dispose",d),l[x.id]=!0,i.memory.geometries++),x}function p(_){const x=_.attributes;for(const M in x)t.update(x[M],s.ARRAY_BUFFER)}function m(_){const x=[],M=_.index,E=_.attributes.position;let A=0;if(M!==null){const P=M.array;A=M.version;for(let N=0,D=P.length;N<D;N+=3){const q=P[N+0],H=P[N+1],O=P[N+2];x.push(q,H,H,O,O,q)}}else if(E!==void 0){const P=E.array;A=E.version;for(let N=0,D=P.length/3-1;N<D;N+=3){const q=N+0,H=N+1,O=N+2;x.push(q,H,H,O,O,q)}}else return;const S=new(uv(x)?_v:gv)(x,1);S.version=A;const v=c.get(_);v&&t.remove(v),c.set(_,S)}function g(_){const x=c.get(_);if(x){const M=_.index;M!==null&&x.version<M.version&&m(_)}else m(_);return c.get(_)}return{get:h,update:p,getWireframeAttribute:g}}function bb(s,t,i){let r;function l(x){r=x}let c,d;function h(x){c=x.type,d=x.bytesPerElement}function p(x,M){s.drawElements(r,M,c,x*d),i.update(M,r,1)}function m(x,M,E){E!==0&&(s.drawElementsInstanced(r,M,c,x*d,E),i.update(M,r,E))}function g(x,M,E){if(E===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,M,0,c,x,0,E);let S=0;for(let v=0;v<E;v++)S+=M[v];i.update(S,r,1)}function _(x,M,E,A){if(E===0)return;const S=t.get("WEBGL_multi_draw");if(S===null)for(let v=0;v<x.length;v++)m(x[v]/d,M[v],A[v]);else{S.multiDrawElementsInstancedWEBGL(r,M,0,c,x,0,A,0,E);let v=0;for(let P=0;P<E;P++)v+=M[P]*A[P];i.update(v,r,1)}}this.setMode=l,this.setIndex=h,this.render=p,this.renderInstances=m,this.renderMultiDraw=g,this.renderMultiDrawInstances=_}function Ab(s){const t={geometries:0,textures:0},i={frame:0,calls:0,triangles:0,points:0,lines:0};function r(c,d,h){switch(i.calls++,d){case s.TRIANGLES:i.triangles+=h*(c/3);break;case s.LINES:i.lines+=h*(c/2);break;case s.LINE_STRIP:i.lines+=h*(c-1);break;case s.LINE_LOOP:i.lines+=h*c;break;case s.POINTS:i.points+=h*c;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",d);break}}function l(){i.calls=0,i.triangles=0,i.points=0,i.lines=0}return{memory:t,render:i,programs:null,autoReset:!0,reset:l,update:r}}function Rb(s,t,i){const r=new WeakMap,l=new $e;function c(d,h,p){const m=d.morphTargetInfluences,g=h.morphAttributes.position||h.morphAttributes.normal||h.morphAttributes.color,_=g!==void 0?g.length:0;let x=r.get(h);if(x===void 0||x.count!==_){let R=function(){V.dispose(),r.delete(h),h.removeEventListener("dispose",R)};var M=R;x!==void 0&&x.texture.dispose();const E=h.morphAttributes.position!==void 0,A=h.morphAttributes.normal!==void 0,S=h.morphAttributes.color!==void 0,v=h.morphAttributes.position||[],P=h.morphAttributes.normal||[],N=h.morphAttributes.color||[];let D=0;E===!0&&(D=1),A===!0&&(D=2),S===!0&&(D=3);let q=h.attributes.position.count*D,H=1;q>t.maxTextureSize&&(H=Math.ceil(q/t.maxTextureSize),q=t.maxTextureSize);const O=new Float32Array(q*H*4*_),V=new hv(O,q,H,_);V.type=ca,V.needsUpdate=!0;const w=D*4;for(let I=0;I<_;I++){const J=v[I],$=P[I],ut=N[I],gt=q*H*4*I;for(let z=0;z<J.count;z++){const K=z*w;E===!0&&(l.fromBufferAttribute(J,z),O[gt+K+0]=l.x,O[gt+K+1]=l.y,O[gt+K+2]=l.z,O[gt+K+3]=0),A===!0&&(l.fromBufferAttribute($,z),O[gt+K+4]=l.x,O[gt+K+5]=l.y,O[gt+K+6]=l.z,O[gt+K+7]=0),S===!0&&(l.fromBufferAttribute(ut,z),O[gt+K+8]=l.x,O[gt+K+9]=l.y,O[gt+K+10]=l.z,O[gt+K+11]=ut.itemSize===4?l.w:1)}}x={count:_,texture:V,size:new De(q,H)},r.set(h,x),h.addEventListener("dispose",R)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)p.getUniforms().setValue(s,"morphTexture",d.morphTexture,i);else{let E=0;for(let S=0;S<m.length;S++)E+=m[S];const A=h.morphTargetsRelative?1:1-E;p.getUniforms().setValue(s,"morphTargetBaseInfluence",A),p.getUniforms().setValue(s,"morphTargetInfluences",m)}p.getUniforms().setValue(s,"morphTargetsTexture",x.texture,i),p.getUniforms().setValue(s,"morphTargetsTextureSize",x.size)}return{update:c}}function Cb(s,t,i,r){let l=new WeakMap;function c(p){const m=r.render.frame,g=p.geometry,_=t.get(p,g);if(l.get(_)!==m&&(t.update(_),l.set(_,m)),p.isInstancedMesh&&(p.hasEventListener("dispose",h)===!1&&p.addEventListener("dispose",h),l.get(p)!==m&&(i.update(p.instanceMatrix,s.ARRAY_BUFFER),p.instanceColor!==null&&i.update(p.instanceColor,s.ARRAY_BUFFER),l.set(p,m))),p.isSkinnedMesh){const x=p.skeleton;l.get(x)!==m&&(x.update(),l.set(x,m))}return _}function d(){l=new WeakMap}function h(p){const m=p.target;m.removeEventListener("dispose",h),i.remove(m.instanceMatrix),m.instanceColor!==null&&i.remove(m.instanceColor)}return{update:c,dispose:d}}const bv=new Un,y0=new Mv(1,1),Av=new hv,Rv=new $S,Cv=new xv,x0=[],S0=[],M0=new Float32Array(16),E0=new Float32Array(9),T0=new Float32Array(4);function Vs(s,t,i){const r=s[0];if(r<=0||r>0)return s;const l=t*i;let c=x0[l];if(c===void 0&&(c=new Float32Array(l),x0[l]=c),t!==0){r.toArray(c,0);for(let d=1,h=0;d!==t;++d)h+=i,s[d].toArray(c,h)}return c}function dn(s,t){if(s.length!==t.length)return!1;for(let i=0,r=s.length;i<r;i++)if(s[i]!==t[i])return!1;return!0}function pn(s,t){for(let i=0,r=t.length;i<r;i++)s[i]=t[i]}function $c(s,t){let i=S0[t];i===void 0&&(i=new Int32Array(t),S0[t]=i);for(let r=0;r!==t;++r)i[r]=s.allocateTextureUnit();return i}function wb(s,t){const i=this.cache;i[0]!==t&&(s.uniform1f(this.addr,t),i[0]=t)}function Db(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dn(i,t))return;s.uniform2fv(this.addr,t),pn(i,t)}}function Ub(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else if(t.r!==void 0)(i[0]!==t.r||i[1]!==t.g||i[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),i[0]=t.r,i[1]=t.g,i[2]=t.b);else{if(dn(i,t))return;s.uniform3fv(this.addr,t),pn(i,t)}}function Lb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dn(i,t))return;s.uniform4fv(this.addr,t),pn(i,t)}}function Nb(s,t){const i=this.cache,r=t.elements;if(r===void 0){if(dn(i,t))return;s.uniformMatrix2fv(this.addr,!1,t),pn(i,t)}else{if(dn(i,r))return;T0.set(r),s.uniformMatrix2fv(this.addr,!1,T0),pn(i,r)}}function Ob(s,t){const i=this.cache,r=t.elements;if(r===void 0){if(dn(i,t))return;s.uniformMatrix3fv(this.addr,!1,t),pn(i,t)}else{if(dn(i,r))return;E0.set(r),s.uniformMatrix3fv(this.addr,!1,E0),pn(i,r)}}function zb(s,t){const i=this.cache,r=t.elements;if(r===void 0){if(dn(i,t))return;s.uniformMatrix4fv(this.addr,!1,t),pn(i,t)}else{if(dn(i,r))return;M0.set(r),s.uniformMatrix4fv(this.addr,!1,M0),pn(i,r)}}function Pb(s,t){const i=this.cache;i[0]!==t&&(s.uniform1i(this.addr,t),i[0]=t)}function Bb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dn(i,t))return;s.uniform2iv(this.addr,t),pn(i,t)}}function Ib(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(dn(i,t))return;s.uniform3iv(this.addr,t),pn(i,t)}}function Fb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dn(i,t))return;s.uniform4iv(this.addr,t),pn(i,t)}}function Hb(s,t){const i=this.cache;i[0]!==t&&(s.uniform1ui(this.addr,t),i[0]=t)}function Gb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),i[0]=t.x,i[1]=t.y);else{if(dn(i,t))return;s.uniform2uiv(this.addr,t),pn(i,t)}}function Vb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),i[0]=t.x,i[1]=t.y,i[2]=t.z);else{if(dn(i,t))return;s.uniform3uiv(this.addr,t),pn(i,t)}}function kb(s,t){const i=this.cache;if(t.x!==void 0)(i[0]!==t.x||i[1]!==t.y||i[2]!==t.z||i[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=t.w);else{if(dn(i,t))return;s.uniform4uiv(this.addr,t),pn(i,t)}}function Xb(s,t,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(s.uniform1i(this.addr,l),r[0]=l);let c;this.type===s.SAMPLER_2D_SHADOW?(y0.compareFunction=cv,c=y0):c=bv,i.setTexture2D(t||c,l)}function qb(s,t,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(s.uniform1i(this.addr,l),r[0]=l),i.setTexture3D(t||Rv,l)}function Wb(s,t,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(s.uniform1i(this.addr,l),r[0]=l),i.setTextureCube(t||Cv,l)}function Yb(s,t,i){const r=this.cache,l=i.allocateTextureUnit();r[0]!==l&&(s.uniform1i(this.addr,l),r[0]=l),i.setTexture2DArray(t||Av,l)}function Zb(s){switch(s){case 5126:return wb;case 35664:return Db;case 35665:return Ub;case 35666:return Lb;case 35674:return Nb;case 35675:return Ob;case 35676:return zb;case 5124:case 35670:return Pb;case 35667:case 35671:return Bb;case 35668:case 35672:return Ib;case 35669:case 35673:return Fb;case 5125:return Hb;case 36294:return Gb;case 36295:return Vb;case 36296:return kb;case 35678:case 36198:case 36298:case 36306:case 35682:return Xb;case 35679:case 36299:case 36307:return qb;case 35680:case 36300:case 36308:case 36293:return Wb;case 36289:case 36303:case 36311:case 36292:return Yb}}function jb(s,t){s.uniform1fv(this.addr,t)}function Kb(s,t){const i=Vs(t,this.size,2);s.uniform2fv(this.addr,i)}function Qb(s,t){const i=Vs(t,this.size,3);s.uniform3fv(this.addr,i)}function Jb(s,t){const i=Vs(t,this.size,4);s.uniform4fv(this.addr,i)}function $b(s,t){const i=Vs(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,i)}function tA(s,t){const i=Vs(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,i)}function eA(s,t){const i=Vs(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,i)}function nA(s,t){s.uniform1iv(this.addr,t)}function iA(s,t){s.uniform2iv(this.addr,t)}function aA(s,t){s.uniform3iv(this.addr,t)}function rA(s,t){s.uniform4iv(this.addr,t)}function sA(s,t){s.uniform1uiv(this.addr,t)}function oA(s,t){s.uniform2uiv(this.addr,t)}function lA(s,t){s.uniform3uiv(this.addr,t)}function cA(s,t){s.uniform4uiv(this.addr,t)}function uA(s,t,i){const r=this.cache,l=t.length,c=$c(i,l);dn(r,c)||(s.uniform1iv(this.addr,c),pn(r,c));for(let d=0;d!==l;++d)i.setTexture2D(t[d]||bv,c[d])}function fA(s,t,i){const r=this.cache,l=t.length,c=$c(i,l);dn(r,c)||(s.uniform1iv(this.addr,c),pn(r,c));for(let d=0;d!==l;++d)i.setTexture3D(t[d]||Rv,c[d])}function hA(s,t,i){const r=this.cache,l=t.length,c=$c(i,l);dn(r,c)||(s.uniform1iv(this.addr,c),pn(r,c));for(let d=0;d!==l;++d)i.setTextureCube(t[d]||Cv,c[d])}function dA(s,t,i){const r=this.cache,l=t.length,c=$c(i,l);dn(r,c)||(s.uniform1iv(this.addr,c),pn(r,c));for(let d=0;d!==l;++d)i.setTexture2DArray(t[d]||Av,c[d])}function pA(s){switch(s){case 5126:return jb;case 35664:return Kb;case 35665:return Qb;case 35666:return Jb;case 35674:return $b;case 35675:return tA;case 35676:return eA;case 5124:case 35670:return nA;case 35667:case 35671:return iA;case 35668:case 35672:return aA;case 35669:case 35673:return rA;case 5125:return sA;case 36294:return oA;case 36295:return lA;case 36296:return cA;case 35678:case 36198:case 36298:case 36306:case 35682:return uA;case 35679:case 36299:case 36307:return fA;case 35680:case 36300:case 36308:case 36293:return hA;case 36289:case 36303:case 36311:case 36292:return dA}}class mA{constructor(t,i,r){this.id=t,this.addr=r,this.cache=[],this.type=i.type,this.setValue=Zb(i.type)}}class gA{constructor(t,i,r){this.id=t,this.addr=r,this.cache=[],this.type=i.type,this.size=i.size,this.setValue=pA(i.type)}}class _A{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,i,r){const l=this.seq;for(let c=0,d=l.length;c!==d;++c){const h=l[c];h.setValue(t,i[h.id],r)}}}const Ih=/(\w+)(\])?(\[|\.)?/g;function b0(s,t){s.seq.push(t),s.map[t.id]=t}function vA(s,t,i){const r=s.name,l=r.length;for(Ih.lastIndex=0;;){const c=Ih.exec(r),d=Ih.lastIndex;let h=c[1];const p=c[2]==="]",m=c[3];if(p&&(h=h|0),m===void 0||m==="["&&d+2===l){b0(i,m===void 0?new mA(h,s,t):new gA(h,s,t));break}else{let _=i.map[h];_===void 0&&(_=new _A(h),b0(i,_)),i=_}}}class Vc{constructor(t,i){this.seq=[],this.map={};const r=t.getProgramParameter(i,t.ACTIVE_UNIFORMS);for(let l=0;l<r;++l){const c=t.getActiveUniform(i,l),d=t.getUniformLocation(i,c.name);vA(c,d,this)}}setValue(t,i,r,l){const c=this.map[i];c!==void 0&&c.setValue(t,r,l)}setOptional(t,i,r){const l=i[r];l!==void 0&&this.setValue(t,r,l)}static upload(t,i,r,l){for(let c=0,d=i.length;c!==d;++c){const h=i[c],p=r[h.id];p.needsUpdate!==!1&&h.setValue(t,p.value,l)}}static seqWithValue(t,i){const r=[];for(let l=0,c=t.length;l!==c;++l){const d=t[l];d.id in i&&r.push(d)}return r}}function A0(s,t,i){const r=s.createShader(t);return s.shaderSource(r,i),s.compileShader(r),r}const yA=37297;let xA=0;function SA(s,t){const i=s.split(`
`),r=[],l=Math.max(t-6,0),c=Math.min(t+6,i.length);for(let d=l;d<c;d++){const h=d+1;r.push(`${h===t?">":" "} ${h}: ${i[d]}`)}return r.join(`
`)}const R0=new ue;function MA(s){we._getMatrix(R0,we.workingColorSpace,s);const t=`mat3( ${R0.elements.map(i=>i.toFixed(4))} )`;switch(we.getTransfer(s)){case Wc:return[t,"LinearTransferOETF"];case Fe:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function C0(s,t,i){const r=s.getShaderParameter(t,s.COMPILE_STATUS),l=s.getShaderInfoLog(t).trim();if(r&&l==="")return"";const c=/ERROR: 0:(\d+)/.exec(l);if(c){const d=parseInt(c[1]);return i.toUpperCase()+`

`+l+`

`+SA(s.getShaderSource(t),d)}else return l}function EA(s,t){const i=MA(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${i[1]}( vec4( value.rgb * ${i[0]}, value.a ) );`,"}"].join(`
`)}function TA(s,t){let i;switch(t){case uS:i="Linear";break;case fS:i="Reinhard";break;case hS:i="Cineon";break;case dS:i="ACESFilmic";break;case mS:i="AgX";break;case gS:i="Neutral";break;case pS:i="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),i="Linear"}return"vec3 "+s+"( vec3 color ) { return "+i+"ToneMapping( color ); }"}const zc=new Q;function bA(){we.getLuminanceCoefficients(zc);const s=zc.x.toFixed(4),t=zc.y.toFixed(4),i=zc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${i} );`,"	return dot( weights, rgb );","}"].join(`
`)}function AA(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ko).join(`
`)}function RA(s){const t=[];for(const i in s){const r=s[i];r!==!1&&t.push("#define "+i+" "+r)}return t.join(`
`)}function CA(s,t){const i={},r=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let l=0;l<r;l++){const c=s.getActiveAttrib(t,l),d=c.name;let h=1;c.type===s.FLOAT_MAT2&&(h=2),c.type===s.FLOAT_MAT3&&(h=3),c.type===s.FLOAT_MAT4&&(h=4),i[d]={type:c.type,location:s.getAttribLocation(t,d),locationSize:h}}return i}function ko(s){return s!==""}function w0(s,t){const i=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,i).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function D0(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const wA=/^[ \t]*#include +<([\w\d./]+)>/gm;function Od(s){return s.replace(wA,UA)}const DA=new Map;function UA(s,t){let i=fe[t];if(i===void 0){const r=DA.get(t);if(r!==void 0)i=fe[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,r);else throw new Error("Can not resolve #include <"+t+">")}return Od(i)}const LA=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function U0(s){return s.replace(LA,NA)}function NA(s,t,i,r){let l="";for(let c=parseInt(t);c<parseInt(i);c++)l+=r.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return l}function L0(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function OA(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===K0?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===kx?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===oa&&(t="SHADOWMAP_TYPE_VSM"),t}function zA(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ns:case Os:t="ENVMAP_TYPE_CUBE";break;case Qc:t="ENVMAP_TYPE_CUBE_UV";break}return t}function PA(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Os:t="ENVMAP_MODE_REFRACTION";break}return t}function BA(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Id:t="ENVMAP_BLENDING_MULTIPLY";break;case lS:t="ENVMAP_BLENDING_MIX";break;case cS:t="ENVMAP_BLENDING_ADD";break}return t}function IA(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const i=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,i),112)),texelHeight:r,maxMip:i}}function FA(s,t,i,r){const l=s.getContext(),c=i.defines;let d=i.vertexShader,h=i.fragmentShader;const p=OA(i),m=zA(i),g=PA(i),_=BA(i),x=IA(i),M=AA(i),E=RA(c),A=l.createProgram();let S,v,P=i.glslVersion?"#version "+i.glslVersion+`
`:"";i.isRawShaderMaterial?(S=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,E].filter(ko).join(`
`),S.length>0&&(S+=`
`),v=["#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,E].filter(ko).join(`
`),v.length>0&&(v+=`
`)):(S=[L0(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,E,i.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",i.batching?"#define USE_BATCHING":"",i.batchingColor?"#define USE_BATCHING_COLOR":"",i.instancing?"#define USE_INSTANCING":"",i.instancingColor?"#define USE_INSTANCING_COLOR":"",i.instancingMorph?"#define USE_INSTANCING_MORPH":"",i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.map?"#define USE_MAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+g:"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.displacementMap?"#define USE_DISPLACEMENTMAP":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.mapUv?"#define MAP_UV "+i.mapUv:"",i.alphaMapUv?"#define ALPHAMAP_UV "+i.alphaMapUv:"",i.lightMapUv?"#define LIGHTMAP_UV "+i.lightMapUv:"",i.aoMapUv?"#define AOMAP_UV "+i.aoMapUv:"",i.emissiveMapUv?"#define EMISSIVEMAP_UV "+i.emissiveMapUv:"",i.bumpMapUv?"#define BUMPMAP_UV "+i.bumpMapUv:"",i.normalMapUv?"#define NORMALMAP_UV "+i.normalMapUv:"",i.displacementMapUv?"#define DISPLACEMENTMAP_UV "+i.displacementMapUv:"",i.metalnessMapUv?"#define METALNESSMAP_UV "+i.metalnessMapUv:"",i.roughnessMapUv?"#define ROUGHNESSMAP_UV "+i.roughnessMapUv:"",i.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+i.anisotropyMapUv:"",i.clearcoatMapUv?"#define CLEARCOATMAP_UV "+i.clearcoatMapUv:"",i.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+i.clearcoatNormalMapUv:"",i.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+i.clearcoatRoughnessMapUv:"",i.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+i.iridescenceMapUv:"",i.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+i.iridescenceThicknessMapUv:"",i.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+i.sheenColorMapUv:"",i.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+i.sheenRoughnessMapUv:"",i.specularMapUv?"#define SPECULARMAP_UV "+i.specularMapUv:"",i.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+i.specularColorMapUv:"",i.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+i.specularIntensityMapUv:"",i.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+i.transmissionMapUv:"",i.thicknessMapUv?"#define THICKNESSMAP_UV "+i.thicknessMapUv:"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.flatShading?"#define FLAT_SHADED":"",i.skinning?"#define USE_SKINNING":"",i.morphTargets?"#define USE_MORPHTARGETS":"",i.morphNormals&&i.flatShading===!1?"#define USE_MORPHNORMALS":"",i.morphColors?"#define USE_MORPHCOLORS":"",i.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+i.morphTextureStride:"",i.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+i.morphTargetsCount:"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+p:"",i.sizeAttenuation?"#define USE_SIZEATTENUATION":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ko).join(`
`),v=[L0(i),"#define SHADER_TYPE "+i.shaderType,"#define SHADER_NAME "+i.shaderName,E,i.useFog&&i.fog?"#define USE_FOG":"",i.useFog&&i.fogExp2?"#define FOG_EXP2":"",i.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",i.map?"#define USE_MAP":"",i.matcap?"#define USE_MATCAP":"",i.envMap?"#define USE_ENVMAP":"",i.envMap?"#define "+m:"",i.envMap?"#define "+g:"",i.envMap?"#define "+_:"",x?"#define CUBEUV_TEXEL_WIDTH "+x.texelWidth:"",x?"#define CUBEUV_TEXEL_HEIGHT "+x.texelHeight:"",x?"#define CUBEUV_MAX_MIP "+x.maxMip+".0":"",i.lightMap?"#define USE_LIGHTMAP":"",i.aoMap?"#define USE_AOMAP":"",i.bumpMap?"#define USE_BUMPMAP":"",i.normalMap?"#define USE_NORMALMAP":"",i.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",i.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",i.emissiveMap?"#define USE_EMISSIVEMAP":"",i.anisotropy?"#define USE_ANISOTROPY":"",i.anisotropyMap?"#define USE_ANISOTROPYMAP":"",i.clearcoat?"#define USE_CLEARCOAT":"",i.clearcoatMap?"#define USE_CLEARCOATMAP":"",i.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",i.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",i.dispersion?"#define USE_DISPERSION":"",i.iridescence?"#define USE_IRIDESCENCE":"",i.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",i.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",i.specularMap?"#define USE_SPECULARMAP":"",i.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",i.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",i.roughnessMap?"#define USE_ROUGHNESSMAP":"",i.metalnessMap?"#define USE_METALNESSMAP":"",i.alphaMap?"#define USE_ALPHAMAP":"",i.alphaTest?"#define USE_ALPHATEST":"",i.alphaHash?"#define USE_ALPHAHASH":"",i.sheen?"#define USE_SHEEN":"",i.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",i.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",i.transmission?"#define USE_TRANSMISSION":"",i.transmissionMap?"#define USE_TRANSMISSIONMAP":"",i.thicknessMap?"#define USE_THICKNESSMAP":"",i.vertexTangents&&i.flatShading===!1?"#define USE_TANGENT":"",i.vertexColors||i.instancingColor||i.batchingColor?"#define USE_COLOR":"",i.vertexAlphas?"#define USE_COLOR_ALPHA":"",i.vertexUv1s?"#define USE_UV1":"",i.vertexUv2s?"#define USE_UV2":"",i.vertexUv3s?"#define USE_UV3":"",i.pointsUvs?"#define USE_POINTS_UV":"",i.gradientMap?"#define USE_GRADIENTMAP":"",i.flatShading?"#define FLAT_SHADED":"",i.doubleSided?"#define DOUBLE_SIDED":"",i.flipSided?"#define FLIP_SIDED":"",i.shadowMapEnabled?"#define USE_SHADOWMAP":"",i.shadowMapEnabled?"#define "+p:"",i.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",i.numLightProbes>0?"#define USE_LIGHT_PROBES":"",i.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",i.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",i.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",i.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",i.toneMapping!==Ya?"#define TONE_MAPPING":"",i.toneMapping!==Ya?fe.tonemapping_pars_fragment:"",i.toneMapping!==Ya?TA("toneMapping",i.toneMapping):"",i.dithering?"#define DITHERING":"",i.opaque?"#define OPAQUE":"",fe.colorspace_pars_fragment,EA("linearToOutputTexel",i.outputColorSpace),bA(),i.useDepthPacking?"#define DEPTH_PACKING "+i.depthPacking:"",`
`].filter(ko).join(`
`)),d=Od(d),d=w0(d,i),d=D0(d,i),h=Od(h),h=w0(h,i),h=D0(h,i),d=U0(d),h=U0(h),i.isRawShaderMaterial!==!0&&(P=`#version 300 es
`,S=[M,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+S,v=["#define varying in",i.glslVersion===F_?"":"layout(location = 0) out highp vec4 pc_fragColor;",i.glslVersion===F_?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+v);const N=P+S+d,D=P+v+h,q=A0(l,l.VERTEX_SHADER,N),H=A0(l,l.FRAGMENT_SHADER,D);l.attachShader(A,q),l.attachShader(A,H),i.index0AttributeName!==void 0?l.bindAttribLocation(A,0,i.index0AttributeName):i.morphTargets===!0&&l.bindAttribLocation(A,0,"position"),l.linkProgram(A);function O(I){if(s.debug.checkShaderErrors){const J=l.getProgramInfoLog(A).trim(),$=l.getShaderInfoLog(q).trim(),ut=l.getShaderInfoLog(H).trim();let gt=!0,z=!0;if(l.getProgramParameter(A,l.LINK_STATUS)===!1)if(gt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(l,A,q,H);else{const K=C0(l,q,"vertex"),X=C0(l,H,"fragment");console.error("THREE.WebGLProgram: Shader Error "+l.getError()+" - VALIDATE_STATUS "+l.getProgramParameter(A,l.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+J+`
`+K+`
`+X)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):($===""||ut==="")&&(z=!1);z&&(I.diagnostics={runnable:gt,programLog:J,vertexShader:{log:$,prefix:S},fragmentShader:{log:ut,prefix:v}})}l.deleteShader(q),l.deleteShader(H),V=new Vc(l,A),w=CA(l,A)}let V;this.getUniforms=function(){return V===void 0&&O(this),V};let w;this.getAttributes=function(){return w===void 0&&O(this),w};let R=i.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=l.getProgramParameter(A,yA)),R},this.destroy=function(){r.releaseStatesOfProgram(this),l.deleteProgram(A),this.program=void 0},this.type=i.shaderType,this.name=i.shaderName,this.id=xA++,this.cacheKey=t,this.usedTimes=1,this.program=A,this.vertexShader=q,this.fragmentShader=H,this}let HA=0;class GA{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const i=t.vertexShader,r=t.fragmentShader,l=this._getShaderStage(i),c=this._getShaderStage(r),d=this._getShaderCacheForMaterial(t);return d.has(l)===!1&&(d.add(l),l.usedTimes++),d.has(c)===!1&&(d.add(c),c.usedTimes++),this}remove(t){const i=this.materialCache.get(t);for(const r of i)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const i=this.materialCache;let r=i.get(t);return r===void 0&&(r=new Set,i.set(t,r)),r}_getShaderStage(t){const i=this.shaderCache;let r=i.get(t);return r===void 0&&(r=new VA(t),i.set(t,r)),r}}class VA{constructor(t){this.id=HA++,this.code=t,this.usedTimes=0}}function kA(s,t,i,r,l,c,d){const h=new pv,p=new GA,m=new Set,g=[],_=l.logarithmicDepthBuffer,x=l.vertexTextures;let M=l.precision;const E={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function A(w){return m.add(w),w===0?"uv":`uv${w}`}function S(w,R,I,J,$){const ut=J.fog,gt=$.geometry,z=w.isMeshStandardMaterial?J.environment:null,K=(w.isMeshStandardMaterial?i:t).get(w.envMap||z),X=K&&K.mapping===Qc?K.image.height:null,ht=E[w.type];w.precision!==null&&(M=l.getMaxPrecision(w.precision),M!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",M,"instead."));const Et=gt.morphAttributes.position||gt.morphAttributes.normal||gt.morphAttributes.color,L=Et!==void 0?Et.length:0;let tt=0;gt.morphAttributes.position!==void 0&&(tt=1),gt.morphAttributes.normal!==void 0&&(tt=2),gt.morphAttributes.color!==void 0&&(tt=3);let St,Z,ft,At;if(ht){const Ee=Li[ht];St=Ee.vertexShader,Z=Ee.fragmentShader}else St=w.vertexShader,Z=w.fragmentShader,p.update(w),ft=p.getVertexShaderID(w),At=p.getFragmentShaderID(w);const Mt=s.getRenderTarget(),ot=s.state.buffers.depth.getReversed(),dt=$.isInstancedMesh===!0,zt=$.isBatchedMesh===!0,Xt=!!w.map,Kt=!!w.matcap,he=!!K,F=!!w.aoMap,Ve=!!w.lightMap,ae=!!w.bumpMap,se=!!w.normalMap,qt=!!w.displacementMap,be=!!w.emissiveMap,bt=!!w.metalnessMap,U=!!w.roughnessMap,T=w.anisotropy>0,it=w.clearcoat>0,mt=w.dispersion>0,Tt=w.iridescence>0,vt=w.sheen>0,Vt=w.transmission>0,Ut=T&&!!w.anisotropyMap,Ft=it&&!!w.clearcoatMap,me=it&&!!w.clearcoatNormalMap,Ct=it&&!!w.clearcoatRoughnessMap,Ht=Tt&&!!w.iridescenceMap,Yt=Tt&&!!w.iridescenceThicknessMap,Wt=vt&&!!w.sheenColorMap,Bt=vt&&!!w.sheenRoughnessMap,$t=!!w.specularMap,oe=!!w.specularColorMap,Oe=!!w.specularIntensityMap,W=Vt&&!!w.transmissionMap,wt=Vt&&!!w.thicknessMap,ct=!!w.gradientMap,xt=!!w.alphaMap,Dt=w.alphaTest>0,Lt=!!w.alphaHash,te=!!w.extensions;let We=Ya;w.toneMapped&&(Mt===null||Mt.isXRRenderTarget===!0)&&(We=s.toneMapping);const un={shaderID:ht,shaderType:w.type,shaderName:w.name,vertexShader:St,fragmentShader:Z,defines:w.defines,customVertexShaderID:ft,customFragmentShaderID:At,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:M,batching:zt,batchingColor:zt&&$._colorsTexture!==null,instancing:dt,instancingColor:dt&&$.instanceColor!==null,instancingMorph:dt&&$.morphTexture!==null,supportsVertexTextures:x,outputColorSpace:Mt===null?s.outputColorSpace:Mt.isXRRenderTarget===!0?Mt.texture.colorSpace:Bs,alphaToCoverage:!!w.alphaToCoverage,map:Xt,matcap:Kt,envMap:he,envMapMode:he&&K.mapping,envMapCubeUVHeight:X,aoMap:F,lightMap:Ve,bumpMap:ae,normalMap:se,displacementMap:x&&qt,emissiveMap:be,normalMapObjectSpace:se&&w.normalMapType===xS,normalMapTangentSpace:se&&w.normalMapType===lv,metalnessMap:bt,roughnessMap:U,anisotropy:T,anisotropyMap:Ut,clearcoat:it,clearcoatMap:Ft,clearcoatNormalMap:me,clearcoatRoughnessMap:Ct,dispersion:mt,iridescence:Tt,iridescenceMap:Ht,iridescenceThicknessMap:Yt,sheen:vt,sheenColorMap:Wt,sheenRoughnessMap:Bt,specularMap:$t,specularColorMap:oe,specularIntensityMap:Oe,transmission:Vt,transmissionMap:W,thicknessMap:wt,gradientMap:ct,opaque:w.transparent===!1&&w.blending===ws&&w.alphaToCoverage===!1,alphaMap:xt,alphaTest:Dt,alphaHash:Lt,combine:w.combine,mapUv:Xt&&A(w.map.channel),aoMapUv:F&&A(w.aoMap.channel),lightMapUv:Ve&&A(w.lightMap.channel),bumpMapUv:ae&&A(w.bumpMap.channel),normalMapUv:se&&A(w.normalMap.channel),displacementMapUv:qt&&A(w.displacementMap.channel),emissiveMapUv:be&&A(w.emissiveMap.channel),metalnessMapUv:bt&&A(w.metalnessMap.channel),roughnessMapUv:U&&A(w.roughnessMap.channel),anisotropyMapUv:Ut&&A(w.anisotropyMap.channel),clearcoatMapUv:Ft&&A(w.clearcoatMap.channel),clearcoatNormalMapUv:me&&A(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ct&&A(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Ht&&A(w.iridescenceMap.channel),iridescenceThicknessMapUv:Yt&&A(w.iridescenceThicknessMap.channel),sheenColorMapUv:Wt&&A(w.sheenColorMap.channel),sheenRoughnessMapUv:Bt&&A(w.sheenRoughnessMap.channel),specularMapUv:$t&&A(w.specularMap.channel),specularColorMapUv:oe&&A(w.specularColorMap.channel),specularIntensityMapUv:Oe&&A(w.specularIntensityMap.channel),transmissionMapUv:W&&A(w.transmissionMap.channel),thicknessMapUv:wt&&A(w.thicknessMap.channel),alphaMapUv:xt&&A(w.alphaMap.channel),vertexTangents:!!gt.attributes.tangent&&(se||T),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!gt.attributes.color&&gt.attributes.color.itemSize===4,pointsUvs:$.isPoints===!0&&!!gt.attributes.uv&&(Xt||xt),fog:!!ut,useFog:w.fog===!0,fogExp2:!!ut&&ut.isFogExp2,flatShading:w.flatShading===!0,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:_,reverseDepthBuffer:ot,skinning:$.isSkinnedMesh===!0,morphTargets:gt.morphAttributes.position!==void 0,morphNormals:gt.morphAttributes.normal!==void 0,morphColors:gt.morphAttributes.color!==void 0,morphTargetsCount:L,morphTextureStride:tt,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numClippingPlanes:d.numPlanes,numClipIntersection:d.numIntersection,dithering:w.dithering,shadowMapEnabled:s.shadowMap.enabled&&I.length>0,shadowMapType:s.shadowMap.type,toneMapping:We,decodeVideoTexture:Xt&&w.map.isVideoTexture===!0&&we.getTransfer(w.map.colorSpace)===Fe,decodeVideoTextureEmissive:be&&w.emissiveMap.isVideoTexture===!0&&we.getTransfer(w.emissiveMap.colorSpace)===Fe,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===la,flipSided:w.side===qn,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:te&&w.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(te&&w.extensions.multiDraw===!0||zt)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return un.vertexUv1s=m.has(1),un.vertexUv2s=m.has(2),un.vertexUv3s=m.has(3),m.clear(),un}function v(w){const R=[];if(w.shaderID?R.push(w.shaderID):(R.push(w.customVertexShaderID),R.push(w.customFragmentShaderID)),w.defines!==void 0)for(const I in w.defines)R.push(I),R.push(w.defines[I]);return w.isRawShaderMaterial===!1&&(P(R,w),N(R,w),R.push(s.outputColorSpace)),R.push(w.customProgramCacheKey),R.join()}function P(w,R){w.push(R.precision),w.push(R.outputColorSpace),w.push(R.envMapMode),w.push(R.envMapCubeUVHeight),w.push(R.mapUv),w.push(R.alphaMapUv),w.push(R.lightMapUv),w.push(R.aoMapUv),w.push(R.bumpMapUv),w.push(R.normalMapUv),w.push(R.displacementMapUv),w.push(R.emissiveMapUv),w.push(R.metalnessMapUv),w.push(R.roughnessMapUv),w.push(R.anisotropyMapUv),w.push(R.clearcoatMapUv),w.push(R.clearcoatNormalMapUv),w.push(R.clearcoatRoughnessMapUv),w.push(R.iridescenceMapUv),w.push(R.iridescenceThicknessMapUv),w.push(R.sheenColorMapUv),w.push(R.sheenRoughnessMapUv),w.push(R.specularMapUv),w.push(R.specularColorMapUv),w.push(R.specularIntensityMapUv),w.push(R.transmissionMapUv),w.push(R.thicknessMapUv),w.push(R.combine),w.push(R.fogExp2),w.push(R.sizeAttenuation),w.push(R.morphTargetsCount),w.push(R.morphAttributeCount),w.push(R.numDirLights),w.push(R.numPointLights),w.push(R.numSpotLights),w.push(R.numSpotLightMaps),w.push(R.numHemiLights),w.push(R.numRectAreaLights),w.push(R.numDirLightShadows),w.push(R.numPointLightShadows),w.push(R.numSpotLightShadows),w.push(R.numSpotLightShadowsWithMaps),w.push(R.numLightProbes),w.push(R.shadowMapType),w.push(R.toneMapping),w.push(R.numClippingPlanes),w.push(R.numClipIntersection),w.push(R.depthPacking)}function N(w,R){h.disableAll(),R.supportsVertexTextures&&h.enable(0),R.instancing&&h.enable(1),R.instancingColor&&h.enable(2),R.instancingMorph&&h.enable(3),R.matcap&&h.enable(4),R.envMap&&h.enable(5),R.normalMapObjectSpace&&h.enable(6),R.normalMapTangentSpace&&h.enable(7),R.clearcoat&&h.enable(8),R.iridescence&&h.enable(9),R.alphaTest&&h.enable(10),R.vertexColors&&h.enable(11),R.vertexAlphas&&h.enable(12),R.vertexUv1s&&h.enable(13),R.vertexUv2s&&h.enable(14),R.vertexUv3s&&h.enable(15),R.vertexTangents&&h.enable(16),R.anisotropy&&h.enable(17),R.alphaHash&&h.enable(18),R.batching&&h.enable(19),R.dispersion&&h.enable(20),R.batchingColor&&h.enable(21),w.push(h.mask),h.disableAll(),R.fog&&h.enable(0),R.useFog&&h.enable(1),R.flatShading&&h.enable(2),R.logarithmicDepthBuffer&&h.enable(3),R.reverseDepthBuffer&&h.enable(4),R.skinning&&h.enable(5),R.morphTargets&&h.enable(6),R.morphNormals&&h.enable(7),R.morphColors&&h.enable(8),R.premultipliedAlpha&&h.enable(9),R.shadowMapEnabled&&h.enable(10),R.doubleSided&&h.enable(11),R.flipSided&&h.enable(12),R.useDepthPacking&&h.enable(13),R.dithering&&h.enable(14),R.transmission&&h.enable(15),R.sheen&&h.enable(16),R.opaque&&h.enable(17),R.pointsUvs&&h.enable(18),R.decodeVideoTexture&&h.enable(19),R.decodeVideoTextureEmissive&&h.enable(20),R.alphaToCoverage&&h.enable(21),w.push(h.mask)}function D(w){const R=E[w.type];let I;if(R){const J=Li[R];I=fM.clone(J.uniforms)}else I=w.uniforms;return I}function q(w,R){let I;for(let J=0,$=g.length;J<$;J++){const ut=g[J];if(ut.cacheKey===R){I=ut,++I.usedTimes;break}}return I===void 0&&(I=new FA(s,R,w,c),g.push(I)),I}function H(w){if(--w.usedTimes===0){const R=g.indexOf(w);g[R]=g[g.length-1],g.pop(),w.destroy()}}function O(w){p.remove(w)}function V(){p.dispose()}return{getParameters:S,getProgramCacheKey:v,getUniforms:D,acquireProgram:q,releaseProgram:H,releaseShaderCache:O,programs:g,dispose:V}}function XA(){let s=new WeakMap;function t(d){return s.has(d)}function i(d){let h=s.get(d);return h===void 0&&(h={},s.set(d,h)),h}function r(d){s.delete(d)}function l(d,h,p){s.get(d)[h]=p}function c(){s=new WeakMap}return{has:t,get:i,remove:r,update:l,dispose:c}}function qA(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function N0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function O0(){const s=[];let t=0;const i=[],r=[],l=[];function c(){t=0,i.length=0,r.length=0,l.length=0}function d(_,x,M,E,A,S){let v=s[t];return v===void 0?(v={id:_.id,object:_,geometry:x,material:M,groupOrder:E,renderOrder:_.renderOrder,z:A,group:S},s[t]=v):(v.id=_.id,v.object=_,v.geometry=x,v.material=M,v.groupOrder=E,v.renderOrder=_.renderOrder,v.z=A,v.group=S),t++,v}function h(_,x,M,E,A,S){const v=d(_,x,M,E,A,S);M.transmission>0?r.push(v):M.transparent===!0?l.push(v):i.push(v)}function p(_,x,M,E,A,S){const v=d(_,x,M,E,A,S);M.transmission>0?r.unshift(v):M.transparent===!0?l.unshift(v):i.unshift(v)}function m(_,x){i.length>1&&i.sort(_||qA),r.length>1&&r.sort(x||N0),l.length>1&&l.sort(x||N0)}function g(){for(let _=t,x=s.length;_<x;_++){const M=s[_];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:i,transmissive:r,transparent:l,init:c,push:h,unshift:p,finish:g,sort:m}}function WA(){let s=new WeakMap;function t(r,l){const c=s.get(r);let d;return c===void 0?(d=new O0,s.set(r,[d])):l>=c.length?(d=new O0,c.push(d)):d=c[l],d}function i(){s=new WeakMap}return{get:t,dispose:i}}function YA(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let i;switch(t.type){case"DirectionalLight":i={direction:new Q,color:new Te};break;case"SpotLight":i={position:new Q,direction:new Q,color:new Te,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":i={position:new Q,color:new Te,distance:0,decay:0};break;case"HemisphereLight":i={direction:new Q,skyColor:new Te,groundColor:new Te};break;case"RectAreaLight":i={color:new Te,position:new Q,halfWidth:new Q,halfHeight:new Q};break}return s[t.id]=i,i}}}function ZA(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let i;switch(t.type){case"DirectionalLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"SpotLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De};break;case"PointLight":i={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new De,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=i,i}}}let jA=0;function KA(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function QA(s){const t=new YA,i=ZA(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let m=0;m<9;m++)r.probe.push(new Q);const l=new Q,c=new Ze,d=new Ze;function h(m){let g=0,_=0,x=0;for(let w=0;w<9;w++)r.probe[w].set(0,0,0);let M=0,E=0,A=0,S=0,v=0,P=0,N=0,D=0,q=0,H=0,O=0;m.sort(KA);for(let w=0,R=m.length;w<R;w++){const I=m[w],J=I.color,$=I.intensity,ut=I.distance,gt=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)g+=J.r*$,_+=J.g*$,x+=J.b*$;else if(I.isLightProbe){for(let z=0;z<9;z++)r.probe[z].addScaledVector(I.sh.coefficients[z],$);O++}else if(I.isDirectionalLight){const z=t.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const K=I.shadow,X=i.get(I);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,r.directionalShadow[M]=X,r.directionalShadowMap[M]=gt,r.directionalShadowMatrix[M]=I.shadow.matrix,P++}r.directional[M]=z,M++}else if(I.isSpotLight){const z=t.get(I);z.position.setFromMatrixPosition(I.matrixWorld),z.color.copy(J).multiplyScalar($),z.distance=ut,z.coneCos=Math.cos(I.angle),z.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),z.decay=I.decay,r.spot[A]=z;const K=I.shadow;if(I.map&&(r.spotLightMap[q]=I.map,q++,K.updateMatrices(I),I.castShadow&&H++),r.spotLightMatrix[A]=K.matrix,I.castShadow){const X=i.get(I);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,r.spotShadow[A]=X,r.spotShadowMap[A]=gt,D++}A++}else if(I.isRectAreaLight){const z=t.get(I);z.color.copy(J).multiplyScalar($),z.halfWidth.set(I.width*.5,0,0),z.halfHeight.set(0,I.height*.5,0),r.rectArea[S]=z,S++}else if(I.isPointLight){const z=t.get(I);if(z.color.copy(I.color).multiplyScalar(I.intensity),z.distance=I.distance,z.decay=I.decay,I.castShadow){const K=I.shadow,X=i.get(I);X.shadowIntensity=K.intensity,X.shadowBias=K.bias,X.shadowNormalBias=K.normalBias,X.shadowRadius=K.radius,X.shadowMapSize=K.mapSize,X.shadowCameraNear=K.camera.near,X.shadowCameraFar=K.camera.far,r.pointShadow[E]=X,r.pointShadowMap[E]=gt,r.pointShadowMatrix[E]=I.shadow.matrix,N++}r.point[E]=z,E++}else if(I.isHemisphereLight){const z=t.get(I);z.skyColor.copy(I.color).multiplyScalar($),z.groundColor.copy(I.groundColor).multiplyScalar($),r.hemi[v]=z,v++}}S>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=Ot.LTC_FLOAT_1,r.rectAreaLTC2=Ot.LTC_FLOAT_2):(r.rectAreaLTC1=Ot.LTC_HALF_1,r.rectAreaLTC2=Ot.LTC_HALF_2)),r.ambient[0]=g,r.ambient[1]=_,r.ambient[2]=x;const V=r.hash;(V.directionalLength!==M||V.pointLength!==E||V.spotLength!==A||V.rectAreaLength!==S||V.hemiLength!==v||V.numDirectionalShadows!==P||V.numPointShadows!==N||V.numSpotShadows!==D||V.numSpotMaps!==q||V.numLightProbes!==O)&&(r.directional.length=M,r.spot.length=A,r.rectArea.length=S,r.point.length=E,r.hemi.length=v,r.directionalShadow.length=P,r.directionalShadowMap.length=P,r.pointShadow.length=N,r.pointShadowMap.length=N,r.spotShadow.length=D,r.spotShadowMap.length=D,r.directionalShadowMatrix.length=P,r.pointShadowMatrix.length=N,r.spotLightMatrix.length=D+q-H,r.spotLightMap.length=q,r.numSpotLightShadowsWithMaps=H,r.numLightProbes=O,V.directionalLength=M,V.pointLength=E,V.spotLength=A,V.rectAreaLength=S,V.hemiLength=v,V.numDirectionalShadows=P,V.numPointShadows=N,V.numSpotShadows=D,V.numSpotMaps=q,V.numLightProbes=O,r.version=jA++)}function p(m,g){let _=0,x=0,M=0,E=0,A=0;const S=g.matrixWorldInverse;for(let v=0,P=m.length;v<P;v++){const N=m[v];if(N.isDirectionalLight){const D=r.directional[_];D.direction.setFromMatrixPosition(N.matrixWorld),l.setFromMatrixPosition(N.target.matrixWorld),D.direction.sub(l),D.direction.transformDirection(S),_++}else if(N.isSpotLight){const D=r.spot[M];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(S),D.direction.setFromMatrixPosition(N.matrixWorld),l.setFromMatrixPosition(N.target.matrixWorld),D.direction.sub(l),D.direction.transformDirection(S),M++}else if(N.isRectAreaLight){const D=r.rectArea[E];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(S),d.identity(),c.copy(N.matrixWorld),c.premultiply(S),d.extractRotation(c),D.halfWidth.set(N.width*.5,0,0),D.halfHeight.set(0,N.height*.5,0),D.halfWidth.applyMatrix4(d),D.halfHeight.applyMatrix4(d),E++}else if(N.isPointLight){const D=r.point[x];D.position.setFromMatrixPosition(N.matrixWorld),D.position.applyMatrix4(S),x++}else if(N.isHemisphereLight){const D=r.hemi[A];D.direction.setFromMatrixPosition(N.matrixWorld),D.direction.transformDirection(S),A++}}}return{setup:h,setupView:p,state:r}}function z0(s){const t=new QA(s),i=[],r=[];function l(g){m.camera=g,i.length=0,r.length=0}function c(g){i.push(g)}function d(g){r.push(g)}function h(){t.setup(i)}function p(g){t.setupView(i,g)}const m={lightsArray:i,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:l,state:m,setupLights:h,setupLightsView:p,pushLight:c,pushShadow:d}}function JA(s){let t=new WeakMap;function i(l,c=0){const d=t.get(l);let h;return d===void 0?(h=new z0(s),t.set(l,[h])):c>=d.length?(h=new z0(s),d.push(h)):h=d[c],h}function r(){t=new WeakMap}return{get:i,dispose:r}}const $A=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,t1=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function e1(s,t,i){let r=new Wd;const l=new De,c=new De,d=new $e,h=new SM({depthPacking:yS}),p=new MM,m={},g=i.maxTextureSize,_={[Za]:qn,[qn]:Za,[la]:la},x=new ja({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new De},radius:{value:4}},vertexShader:$A,fragmentShader:t1}),M=x.clone();M.defines.HORIZONTAL_PASS=1;const E=new Wn;E.setAttribute("position",new Pi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const A=new cn(E,x),S=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=K0;let v=this.type;this.render=function(H,O,V){if(S.enabled===!1||S.autoUpdate===!1&&S.needsUpdate===!1||H.length===0)return;const w=s.getRenderTarget(),R=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),J=s.state;J.setBlending(Wa),J.buffers.color.setClear(1,1,1,1),J.buffers.depth.setTest(!0),J.setScissorTest(!1);const $=v!==oa&&this.type===oa,ut=v===oa&&this.type!==oa;for(let gt=0,z=H.length;gt<z;gt++){const K=H[gt],X=K.shadow;if(X===void 0){console.warn("THREE.WebGLShadowMap:",K,"has no shadow.");continue}if(X.autoUpdate===!1&&X.needsUpdate===!1)continue;l.copy(X.mapSize);const ht=X.getFrameExtents();if(l.multiply(ht),c.copy(X.mapSize),(l.x>g||l.y>g)&&(l.x>g&&(c.x=Math.floor(g/ht.x),l.x=c.x*ht.x,X.mapSize.x=c.x),l.y>g&&(c.y=Math.floor(g/ht.y),l.y=c.y*ht.y,X.mapSize.y=c.y)),X.map===null||$===!0||ut===!0){const L=this.type!==oa?{minFilter:Ai,magFilter:Ai}:{};X.map!==null&&X.map.dispose(),X.map=new wr(l.x,l.y,L),X.map.texture.name=K.name+".shadowMap",X.camera.updateProjectionMatrix()}s.setRenderTarget(X.map),s.clear();const Et=X.getViewportCount();for(let L=0;L<Et;L++){const tt=X.getViewport(L);d.set(c.x*tt.x,c.y*tt.y,c.x*tt.z,c.y*tt.w),J.viewport(d),X.updateMatrices(K,L),r=X.getFrustum(),D(O,V,X.camera,K,this.type)}X.isPointLightShadow!==!0&&this.type===oa&&P(X,V),X.needsUpdate=!1}v=this.type,S.needsUpdate=!1,s.setRenderTarget(w,R,I)};function P(H,O){const V=t.update(A);x.defines.VSM_SAMPLES!==H.blurSamples&&(x.defines.VSM_SAMPLES=H.blurSamples,M.defines.VSM_SAMPLES=H.blurSamples,x.needsUpdate=!0,M.needsUpdate=!0),H.mapPass===null&&(H.mapPass=new wr(l.x,l.y)),x.uniforms.shadow_pass.value=H.map.texture,x.uniforms.resolution.value=H.mapSize,x.uniforms.radius.value=H.radius,s.setRenderTarget(H.mapPass),s.clear(),s.renderBufferDirect(O,null,V,x,A,null),M.uniforms.shadow_pass.value=H.mapPass.texture,M.uniforms.resolution.value=H.mapSize,M.uniforms.radius.value=H.radius,s.setRenderTarget(H.map),s.clear(),s.renderBufferDirect(O,null,V,M,A,null)}function N(H,O,V,w){let R=null;const I=V.isPointLight===!0?H.customDistanceMaterial:H.customDepthMaterial;if(I!==void 0)R=I;else if(R=V.isPointLight===!0?p:h,s.localClippingEnabled&&O.clipShadows===!0&&Array.isArray(O.clippingPlanes)&&O.clippingPlanes.length!==0||O.displacementMap&&O.displacementScale!==0||O.alphaMap&&O.alphaTest>0||O.map&&O.alphaTest>0){const J=R.uuid,$=O.uuid;let ut=m[J];ut===void 0&&(ut={},m[J]=ut);let gt=ut[$];gt===void 0&&(gt=R.clone(),ut[$]=gt,O.addEventListener("dispose",q)),R=gt}if(R.visible=O.visible,R.wireframe=O.wireframe,w===oa?R.side=O.shadowSide!==null?O.shadowSide:O.side:R.side=O.shadowSide!==null?O.shadowSide:_[O.side],R.alphaMap=O.alphaMap,R.alphaTest=O.alphaTest,R.map=O.map,R.clipShadows=O.clipShadows,R.clippingPlanes=O.clippingPlanes,R.clipIntersection=O.clipIntersection,R.displacementMap=O.displacementMap,R.displacementScale=O.displacementScale,R.displacementBias=O.displacementBias,R.wireframeLinewidth=O.wireframeLinewidth,R.linewidth=O.linewidth,V.isPointLight===!0&&R.isMeshDistanceMaterial===!0){const J=s.properties.get(R);J.light=V}return R}function D(H,O,V,w,R){if(H.visible===!1)return;if(H.layers.test(O.layers)&&(H.isMesh||H.isLine||H.isPoints)&&(H.castShadow||H.receiveShadow&&R===oa)&&(!H.frustumCulled||r.intersectsObject(H))){H.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,H.matrixWorld);const $=t.update(H),ut=H.material;if(Array.isArray(ut)){const gt=$.groups;for(let z=0,K=gt.length;z<K;z++){const X=gt[z],ht=ut[X.materialIndex];if(ht&&ht.visible){const Et=N(H,ht,w,R);H.onBeforeShadow(s,H,O,V,$,Et,X),s.renderBufferDirect(V,null,$,Et,H,X),H.onAfterShadow(s,H,O,V,$,Et,X)}}}else if(ut.visible){const gt=N(H,ut,w,R);H.onBeforeShadow(s,H,O,V,$,gt,null),s.renderBufferDirect(V,null,$,gt,H,null),H.onAfterShadow(s,H,O,V,$,gt,null)}}const J=H.children;for(let $=0,ut=J.length;$<ut;$++)D(J[$],O,V,w,R)}function q(H){H.target.removeEventListener("dispose",q);for(const V in m){const w=m[V],R=H.target.uuid;R in w&&(w[R].dispose(),delete w[R])}}}const n1={[Jh]:$h,[td]:id,[ed]:ad,[Ls]:nd,[$h]:Jh,[id]:td,[ad]:ed,[nd]:Ls};function i1(s,t){function i(){let W=!1;const wt=new $e;let ct=null;const xt=new $e(0,0,0,0);return{setMask:function(Dt){ct!==Dt&&!W&&(s.colorMask(Dt,Dt,Dt,Dt),ct=Dt)},setLocked:function(Dt){W=Dt},setClear:function(Dt,Lt,te,We,un){un===!0&&(Dt*=We,Lt*=We,te*=We),wt.set(Dt,Lt,te,We),xt.equals(wt)===!1&&(s.clearColor(Dt,Lt,te,We),xt.copy(wt))},reset:function(){W=!1,ct=null,xt.set(-1,0,0,0)}}}function r(){let W=!1,wt=!1,ct=null,xt=null,Dt=null;return{setReversed:function(Lt){if(wt!==Lt){const te=t.get("EXT_clip_control");wt?te.clipControlEXT(te.LOWER_LEFT_EXT,te.ZERO_TO_ONE_EXT):te.clipControlEXT(te.LOWER_LEFT_EXT,te.NEGATIVE_ONE_TO_ONE_EXT);const We=Dt;Dt=null,this.setClear(We)}wt=Lt},getReversed:function(){return wt},setTest:function(Lt){Lt?Mt(s.DEPTH_TEST):ot(s.DEPTH_TEST)},setMask:function(Lt){ct!==Lt&&!W&&(s.depthMask(Lt),ct=Lt)},setFunc:function(Lt){if(wt&&(Lt=n1[Lt]),xt!==Lt){switch(Lt){case Jh:s.depthFunc(s.NEVER);break;case $h:s.depthFunc(s.ALWAYS);break;case td:s.depthFunc(s.LESS);break;case Ls:s.depthFunc(s.LEQUAL);break;case ed:s.depthFunc(s.EQUAL);break;case nd:s.depthFunc(s.GEQUAL);break;case id:s.depthFunc(s.GREATER);break;case ad:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}xt=Lt}},setLocked:function(Lt){W=Lt},setClear:function(Lt){Dt!==Lt&&(wt&&(Lt=1-Lt),s.clearDepth(Lt),Dt=Lt)},reset:function(){W=!1,ct=null,xt=null,Dt=null,wt=!1}}}function l(){let W=!1,wt=null,ct=null,xt=null,Dt=null,Lt=null,te=null,We=null,un=null;return{setTest:function(Ee){W||(Ee?Mt(s.STENCIL_TEST):ot(s.STENCIL_TEST))},setMask:function(Ee){wt!==Ee&&!W&&(s.stencilMask(Ee),wt=Ee)},setFunc:function(Ee,vn,pi){(ct!==Ee||xt!==vn||Dt!==pi)&&(s.stencilFunc(Ee,vn,pi),ct=Ee,xt=vn,Dt=pi)},setOp:function(Ee,vn,pi){(Lt!==Ee||te!==vn||We!==pi)&&(s.stencilOp(Ee,vn,pi),Lt=Ee,te=vn,We=pi)},setLocked:function(Ee){W=Ee},setClear:function(Ee){un!==Ee&&(s.clearStencil(Ee),un=Ee)},reset:function(){W=!1,wt=null,ct=null,xt=null,Dt=null,Lt=null,te=null,We=null,un=null}}}const c=new i,d=new r,h=new l,p=new WeakMap,m=new WeakMap;let g={},_={},x=new WeakMap,M=[],E=null,A=!1,S=null,v=null,P=null,N=null,D=null,q=null,H=null,O=new Te(0,0,0),V=0,w=!1,R=null,I=null,J=null,$=null,ut=null;const gt=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,K=0;const X=s.getParameter(s.VERSION);X.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(X)[1]),z=K>=1):X.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),z=K>=2);let ht=null,Et={};const L=s.getParameter(s.SCISSOR_BOX),tt=s.getParameter(s.VIEWPORT),St=new $e().fromArray(L),Z=new $e().fromArray(tt);function ft(W,wt,ct,xt){const Dt=new Uint8Array(4),Lt=s.createTexture();s.bindTexture(W,Lt),s.texParameteri(W,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(W,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let te=0;te<ct;te++)W===s.TEXTURE_3D||W===s.TEXTURE_2D_ARRAY?s.texImage3D(wt,0,s.RGBA,1,1,xt,0,s.RGBA,s.UNSIGNED_BYTE,Dt):s.texImage2D(wt+te,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,Dt);return Lt}const At={};At[s.TEXTURE_2D]=ft(s.TEXTURE_2D,s.TEXTURE_2D,1),At[s.TEXTURE_CUBE_MAP]=ft(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),At[s.TEXTURE_2D_ARRAY]=ft(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),At[s.TEXTURE_3D]=ft(s.TEXTURE_3D,s.TEXTURE_3D,1,1),c.setClear(0,0,0,1),d.setClear(1),h.setClear(0),Mt(s.DEPTH_TEST),d.setFunc(Ls),ae(!1),se(N_),Mt(s.CULL_FACE),F(Wa);function Mt(W){g[W]!==!0&&(s.enable(W),g[W]=!0)}function ot(W){g[W]!==!1&&(s.disable(W),g[W]=!1)}function dt(W,wt){return _[W]!==wt?(s.bindFramebuffer(W,wt),_[W]=wt,W===s.DRAW_FRAMEBUFFER&&(_[s.FRAMEBUFFER]=wt),W===s.FRAMEBUFFER&&(_[s.DRAW_FRAMEBUFFER]=wt),!0):!1}function zt(W,wt){let ct=M,xt=!1;if(W){ct=x.get(wt),ct===void 0&&(ct=[],x.set(wt,ct));const Dt=W.textures;if(ct.length!==Dt.length||ct[0]!==s.COLOR_ATTACHMENT0){for(let Lt=0,te=Dt.length;Lt<te;Lt++)ct[Lt]=s.COLOR_ATTACHMENT0+Lt;ct.length=Dt.length,xt=!0}}else ct[0]!==s.BACK&&(ct[0]=s.BACK,xt=!0);xt&&s.drawBuffers(ct)}function Xt(W){return E!==W?(s.useProgram(W),E=W,!0):!1}const Kt={[Tr]:s.FUNC_ADD,[qx]:s.FUNC_SUBTRACT,[Wx]:s.FUNC_REVERSE_SUBTRACT};Kt[Yx]=s.MIN,Kt[Zx]=s.MAX;const he={[jx]:s.ZERO,[Kx]:s.ONE,[Qx]:s.SRC_COLOR,[Kh]:s.SRC_ALPHA,[iS]:s.SRC_ALPHA_SATURATE,[eS]:s.DST_COLOR,[$x]:s.DST_ALPHA,[Jx]:s.ONE_MINUS_SRC_COLOR,[Qh]:s.ONE_MINUS_SRC_ALPHA,[nS]:s.ONE_MINUS_DST_COLOR,[tS]:s.ONE_MINUS_DST_ALPHA,[aS]:s.CONSTANT_COLOR,[rS]:s.ONE_MINUS_CONSTANT_COLOR,[sS]:s.CONSTANT_ALPHA,[oS]:s.ONE_MINUS_CONSTANT_ALPHA};function F(W,wt,ct,xt,Dt,Lt,te,We,un,Ee){if(W===Wa){A===!0&&(ot(s.BLEND),A=!1);return}if(A===!1&&(Mt(s.BLEND),A=!0),W!==Xx){if(W!==S||Ee!==w){if((v!==Tr||D!==Tr)&&(s.blendEquation(s.FUNC_ADD),v=Tr,D=Tr),Ee)switch(W){case ws:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case O_:s.blendFunc(s.ONE,s.ONE);break;case z_:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case P_:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}else switch(W){case ws:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case O_:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case z_:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case P_:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",W);break}P=null,N=null,q=null,H=null,O.set(0,0,0),V=0,S=W,w=Ee}return}Dt=Dt||wt,Lt=Lt||ct,te=te||xt,(wt!==v||Dt!==D)&&(s.blendEquationSeparate(Kt[wt],Kt[Dt]),v=wt,D=Dt),(ct!==P||xt!==N||Lt!==q||te!==H)&&(s.blendFuncSeparate(he[ct],he[xt],he[Lt],he[te]),P=ct,N=xt,q=Lt,H=te),(We.equals(O)===!1||un!==V)&&(s.blendColor(We.r,We.g,We.b,un),O.copy(We),V=un),S=W,w=!1}function Ve(W,wt){W.side===la?ot(s.CULL_FACE):Mt(s.CULL_FACE);let ct=W.side===qn;wt&&(ct=!ct),ae(ct),W.blending===ws&&W.transparent===!1?F(Wa):F(W.blending,W.blendEquation,W.blendSrc,W.blendDst,W.blendEquationAlpha,W.blendSrcAlpha,W.blendDstAlpha,W.blendColor,W.blendAlpha,W.premultipliedAlpha),d.setFunc(W.depthFunc),d.setTest(W.depthTest),d.setMask(W.depthWrite),c.setMask(W.colorWrite);const xt=W.stencilWrite;h.setTest(xt),xt&&(h.setMask(W.stencilWriteMask),h.setFunc(W.stencilFunc,W.stencilRef,W.stencilFuncMask),h.setOp(W.stencilFail,W.stencilZFail,W.stencilZPass)),be(W.polygonOffset,W.polygonOffsetFactor,W.polygonOffsetUnits),W.alphaToCoverage===!0?Mt(s.SAMPLE_ALPHA_TO_COVERAGE):ot(s.SAMPLE_ALPHA_TO_COVERAGE)}function ae(W){R!==W&&(W?s.frontFace(s.CW):s.frontFace(s.CCW),R=W)}function se(W){W!==Gx?(Mt(s.CULL_FACE),W!==I&&(W===N_?s.cullFace(s.BACK):W===Vx?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ot(s.CULL_FACE),I=W}function qt(W){W!==J&&(z&&s.lineWidth(W),J=W)}function be(W,wt,ct){W?(Mt(s.POLYGON_OFFSET_FILL),($!==wt||ut!==ct)&&(s.polygonOffset(wt,ct),$=wt,ut=ct)):ot(s.POLYGON_OFFSET_FILL)}function bt(W){W?Mt(s.SCISSOR_TEST):ot(s.SCISSOR_TEST)}function U(W){W===void 0&&(W=s.TEXTURE0+gt-1),ht!==W&&(s.activeTexture(W),ht=W)}function T(W,wt,ct){ct===void 0&&(ht===null?ct=s.TEXTURE0+gt-1:ct=ht);let xt=Et[ct];xt===void 0&&(xt={type:void 0,texture:void 0},Et[ct]=xt),(xt.type!==W||xt.texture!==wt)&&(ht!==ct&&(s.activeTexture(ct),ht=ct),s.bindTexture(W,wt||At[W]),xt.type=W,xt.texture=wt)}function it(){const W=Et[ht];W!==void 0&&W.type!==void 0&&(s.bindTexture(W.type,null),W.type=void 0,W.texture=void 0)}function mt(){try{s.compressedTexImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Tt(){try{s.compressedTexImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function vt(){try{s.texSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Vt(){try{s.texSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ut(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ft(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function me(){try{s.texStorage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ct(){try{s.texStorage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Ht(){try{s.texImage2D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Yt(){try{s.texImage3D.apply(s,arguments)}catch(W){console.error("THREE.WebGLState:",W)}}function Wt(W){St.equals(W)===!1&&(s.scissor(W.x,W.y,W.z,W.w),St.copy(W))}function Bt(W){Z.equals(W)===!1&&(s.viewport(W.x,W.y,W.z,W.w),Z.copy(W))}function $t(W,wt){let ct=m.get(wt);ct===void 0&&(ct=new WeakMap,m.set(wt,ct));let xt=ct.get(W);xt===void 0&&(xt=s.getUniformBlockIndex(wt,W.name),ct.set(W,xt))}function oe(W,wt){const xt=m.get(wt).get(W);p.get(wt)!==xt&&(s.uniformBlockBinding(wt,xt,W.__bindingPointIndex),p.set(wt,xt))}function Oe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),d.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),g={},ht=null,Et={},_={},x=new WeakMap,M=[],E=null,A=!1,S=null,v=null,P=null,N=null,D=null,q=null,H=null,O=new Te(0,0,0),V=0,w=!1,R=null,I=null,J=null,$=null,ut=null,St.set(0,0,s.canvas.width,s.canvas.height),Z.set(0,0,s.canvas.width,s.canvas.height),c.reset(),d.reset(),h.reset()}return{buffers:{color:c,depth:d,stencil:h},enable:Mt,disable:ot,bindFramebuffer:dt,drawBuffers:zt,useProgram:Xt,setBlending:F,setMaterial:Ve,setFlipSided:ae,setCullFace:se,setLineWidth:qt,setPolygonOffset:be,setScissorTest:bt,activeTexture:U,bindTexture:T,unbindTexture:it,compressedTexImage2D:mt,compressedTexImage3D:Tt,texImage2D:Ht,texImage3D:Yt,updateUBOMapping:$t,uniformBlockBinding:oe,texStorage2D:me,texStorage3D:Ct,texSubImage2D:vt,texSubImage3D:Vt,compressedTexSubImage2D:Ut,compressedTexSubImage3D:Ft,scissor:Wt,viewport:Bt,reset:Oe}}function a1(s,t,i,r,l,c,d){const h=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,p=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),m=new De,g=new WeakMap;let _;const x=new WeakMap;let M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function E(U,T){return M?new OffscreenCanvas(U,T):Ko("canvas")}function A(U,T,it){let mt=1;const Tt=bt(U);if((Tt.width>it||Tt.height>it)&&(mt=it/Math.max(Tt.width,Tt.height)),mt<1)if(typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&U instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&U instanceof ImageBitmap||typeof VideoFrame<"u"&&U instanceof VideoFrame){const vt=Math.floor(mt*Tt.width),Vt=Math.floor(mt*Tt.height);_===void 0&&(_=E(vt,Vt));const Ut=T?E(vt,Vt):_;return Ut.width=vt,Ut.height=Vt,Ut.getContext("2d").drawImage(U,0,0,vt,Vt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Tt.width+"x"+Tt.height+") to ("+vt+"x"+Vt+")."),Ut}else return"data"in U&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Tt.width+"x"+Tt.height+")."),U;return U}function S(U){return U.generateMipmaps}function v(U){s.generateMipmap(U)}function P(U){return U.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:U.isWebGL3DRenderTarget?s.TEXTURE_3D:U.isWebGLArrayRenderTarget||U.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function N(U,T,it,mt,Tt=!1){if(U!==null){if(s[U]!==void 0)return s[U];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+U+"'")}let vt=T;if(T===s.RED&&(it===s.FLOAT&&(vt=s.R32F),it===s.HALF_FLOAT&&(vt=s.R16F),it===s.UNSIGNED_BYTE&&(vt=s.R8)),T===s.RED_INTEGER&&(it===s.UNSIGNED_BYTE&&(vt=s.R8UI),it===s.UNSIGNED_SHORT&&(vt=s.R16UI),it===s.UNSIGNED_INT&&(vt=s.R32UI),it===s.BYTE&&(vt=s.R8I),it===s.SHORT&&(vt=s.R16I),it===s.INT&&(vt=s.R32I)),T===s.RG&&(it===s.FLOAT&&(vt=s.RG32F),it===s.HALF_FLOAT&&(vt=s.RG16F),it===s.UNSIGNED_BYTE&&(vt=s.RG8)),T===s.RG_INTEGER&&(it===s.UNSIGNED_BYTE&&(vt=s.RG8UI),it===s.UNSIGNED_SHORT&&(vt=s.RG16UI),it===s.UNSIGNED_INT&&(vt=s.RG32UI),it===s.BYTE&&(vt=s.RG8I),it===s.SHORT&&(vt=s.RG16I),it===s.INT&&(vt=s.RG32I)),T===s.RGB_INTEGER&&(it===s.UNSIGNED_BYTE&&(vt=s.RGB8UI),it===s.UNSIGNED_SHORT&&(vt=s.RGB16UI),it===s.UNSIGNED_INT&&(vt=s.RGB32UI),it===s.BYTE&&(vt=s.RGB8I),it===s.SHORT&&(vt=s.RGB16I),it===s.INT&&(vt=s.RGB32I)),T===s.RGBA_INTEGER&&(it===s.UNSIGNED_BYTE&&(vt=s.RGBA8UI),it===s.UNSIGNED_SHORT&&(vt=s.RGBA16UI),it===s.UNSIGNED_INT&&(vt=s.RGBA32UI),it===s.BYTE&&(vt=s.RGBA8I),it===s.SHORT&&(vt=s.RGBA16I),it===s.INT&&(vt=s.RGBA32I)),T===s.RGB&&it===s.UNSIGNED_INT_5_9_9_9_REV&&(vt=s.RGB9_E5),T===s.RGBA){const Vt=Tt?Wc:we.getTransfer(mt);it===s.FLOAT&&(vt=s.RGBA32F),it===s.HALF_FLOAT&&(vt=s.RGBA16F),it===s.UNSIGNED_BYTE&&(vt=Vt===Fe?s.SRGB8_ALPHA8:s.RGBA8),it===s.UNSIGNED_SHORT_4_4_4_4&&(vt=s.RGBA4),it===s.UNSIGNED_SHORT_5_5_5_1&&(vt=s.RGB5_A1)}return(vt===s.R16F||vt===s.R32F||vt===s.RG16F||vt===s.RG32F||vt===s.RGBA16F||vt===s.RGBA32F)&&t.get("EXT_color_buffer_float"),vt}function D(U,T){let it;return U?T===null||T===Cr||T===zs?it=s.DEPTH24_STENCIL8:T===ca?it=s.DEPTH32F_STENCIL8:T===Zo&&(it=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===Cr||T===zs?it=s.DEPTH_COMPONENT24:T===ca?it=s.DEPTH_COMPONENT32F:T===Zo&&(it=s.DEPTH_COMPONENT16),it}function q(U,T){return S(U)===!0||U.isFramebufferTexture&&U.minFilter!==Ai&&U.minFilter!==Ni?Math.log2(Math.max(T.width,T.height))+1:U.mipmaps!==void 0&&U.mipmaps.length>0?U.mipmaps.length:U.isCompressedTexture&&Array.isArray(U.image)?T.mipmaps.length:1}function H(U){const T=U.target;T.removeEventListener("dispose",H),V(T),T.isVideoTexture&&g.delete(T)}function O(U){const T=U.target;T.removeEventListener("dispose",O),R(T)}function V(U){const T=r.get(U);if(T.__webglInit===void 0)return;const it=U.source,mt=x.get(it);if(mt){const Tt=mt[T.__cacheKey];Tt.usedTimes--,Tt.usedTimes===0&&w(U),Object.keys(mt).length===0&&x.delete(it)}r.remove(U)}function w(U){const T=r.get(U);s.deleteTexture(T.__webglTexture);const it=U.source,mt=x.get(it);delete mt[T.__cacheKey],d.memory.textures--}function R(U){const T=r.get(U);if(U.depthTexture&&(U.depthTexture.dispose(),r.remove(U.depthTexture)),U.isWebGLCubeRenderTarget)for(let mt=0;mt<6;mt++){if(Array.isArray(T.__webglFramebuffer[mt]))for(let Tt=0;Tt<T.__webglFramebuffer[mt].length;Tt++)s.deleteFramebuffer(T.__webglFramebuffer[mt][Tt]);else s.deleteFramebuffer(T.__webglFramebuffer[mt]);T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer[mt])}else{if(Array.isArray(T.__webglFramebuffer))for(let mt=0;mt<T.__webglFramebuffer.length;mt++)s.deleteFramebuffer(T.__webglFramebuffer[mt]);else s.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&s.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&s.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let mt=0;mt<T.__webglColorRenderbuffer.length;mt++)T.__webglColorRenderbuffer[mt]&&s.deleteRenderbuffer(T.__webglColorRenderbuffer[mt]);T.__webglDepthRenderbuffer&&s.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const it=U.textures;for(let mt=0,Tt=it.length;mt<Tt;mt++){const vt=r.get(it[mt]);vt.__webglTexture&&(s.deleteTexture(vt.__webglTexture),d.memory.textures--),r.remove(it[mt])}r.remove(U)}let I=0;function J(){I=0}function $(){const U=I;return U>=l.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+U+" texture units while this GPU supports only "+l.maxTextures),I+=1,U}function ut(U){const T=[];return T.push(U.wrapS),T.push(U.wrapT),T.push(U.wrapR||0),T.push(U.magFilter),T.push(U.minFilter),T.push(U.anisotropy),T.push(U.internalFormat),T.push(U.format),T.push(U.type),T.push(U.generateMipmaps),T.push(U.premultiplyAlpha),T.push(U.flipY),T.push(U.unpackAlignment),T.push(U.colorSpace),T.join()}function gt(U,T){const it=r.get(U);if(U.isVideoTexture&&qt(U),U.isRenderTargetTexture===!1&&U.version>0&&it.__version!==U.version){const mt=U.image;if(mt===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(mt.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(it,U,T);return}}i.bindTexture(s.TEXTURE_2D,it.__webglTexture,s.TEXTURE0+T)}function z(U,T){const it=r.get(U);if(U.version>0&&it.__version!==U.version){Z(it,U,T);return}i.bindTexture(s.TEXTURE_2D_ARRAY,it.__webglTexture,s.TEXTURE0+T)}function K(U,T){const it=r.get(U);if(U.version>0&&it.__version!==U.version){Z(it,U,T);return}i.bindTexture(s.TEXTURE_3D,it.__webglTexture,s.TEXTURE0+T)}function X(U,T){const it=r.get(U);if(U.version>0&&it.__version!==U.version){ft(it,U,T);return}i.bindTexture(s.TEXTURE_CUBE_MAP,it.__webglTexture,s.TEXTURE0+T)}const ht={[qc]:s.REPEAT,[Ar]:s.CLAMP_TO_EDGE,[od]:s.MIRRORED_REPEAT},Et={[Ai]:s.NEAREST,[_S]:s.NEAREST_MIPMAP_NEAREST,[dc]:s.NEAREST_MIPMAP_LINEAR,[Ni]:s.LINEAR,[lh]:s.LINEAR_MIPMAP_NEAREST,[Rr]:s.LINEAR_MIPMAP_LINEAR},L={[SS]:s.NEVER,[RS]:s.ALWAYS,[MS]:s.LESS,[cv]:s.LEQUAL,[ES]:s.EQUAL,[AS]:s.GEQUAL,[TS]:s.GREATER,[bS]:s.NOTEQUAL};function tt(U,T){if(T.type===ca&&t.has("OES_texture_float_linear")===!1&&(T.magFilter===Ni||T.magFilter===lh||T.magFilter===dc||T.magFilter===Rr||T.minFilter===Ni||T.minFilter===lh||T.minFilter===dc||T.minFilter===Rr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(U,s.TEXTURE_WRAP_S,ht[T.wrapS]),s.texParameteri(U,s.TEXTURE_WRAP_T,ht[T.wrapT]),(U===s.TEXTURE_3D||U===s.TEXTURE_2D_ARRAY)&&s.texParameteri(U,s.TEXTURE_WRAP_R,ht[T.wrapR]),s.texParameteri(U,s.TEXTURE_MAG_FILTER,Et[T.magFilter]),s.texParameteri(U,s.TEXTURE_MIN_FILTER,Et[T.minFilter]),T.compareFunction&&(s.texParameteri(U,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(U,s.TEXTURE_COMPARE_FUNC,L[T.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Ai||T.minFilter!==dc&&T.minFilter!==Rr||T.type===ca&&t.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||r.get(T).__currentAnisotropy){const it=t.get("EXT_texture_filter_anisotropic");s.texParameterf(U,it.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,l.getMaxAnisotropy())),r.get(T).__currentAnisotropy=T.anisotropy}}}function St(U,T){let it=!1;U.__webglInit===void 0&&(U.__webglInit=!0,T.addEventListener("dispose",H));const mt=T.source;let Tt=x.get(mt);Tt===void 0&&(Tt={},x.set(mt,Tt));const vt=ut(T);if(vt!==U.__cacheKey){Tt[vt]===void 0&&(Tt[vt]={texture:s.createTexture(),usedTimes:0},d.memory.textures++,it=!0),Tt[vt].usedTimes++;const Vt=Tt[U.__cacheKey];Vt!==void 0&&(Tt[U.__cacheKey].usedTimes--,Vt.usedTimes===0&&w(T)),U.__cacheKey=vt,U.__webglTexture=Tt[vt].texture}return it}function Z(U,T,it){let mt=s.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(mt=s.TEXTURE_2D_ARRAY),T.isData3DTexture&&(mt=s.TEXTURE_3D);const Tt=St(U,T),vt=T.source;i.bindTexture(mt,U.__webglTexture,s.TEXTURE0+it);const Vt=r.get(vt);if(vt.version!==Vt.__version||Tt===!0){i.activeTexture(s.TEXTURE0+it);const Ut=we.getPrimaries(we.workingColorSpace),Ft=T.colorSpace===Xa?null:we.getPrimaries(T.colorSpace),me=T.colorSpace===Xa||Ut===Ft?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let Ct=A(T.image,!1,l.maxTextureSize);Ct=be(T,Ct);const Ht=c.convert(T.format,T.colorSpace),Yt=c.convert(T.type);let Wt=N(T.internalFormat,Ht,Yt,T.colorSpace,T.isVideoTexture);tt(mt,T);let Bt;const $t=T.mipmaps,oe=T.isVideoTexture!==!0,Oe=Vt.__version===void 0||Tt===!0,W=vt.dataReady,wt=q(T,Ct);if(T.isDepthTexture)Wt=D(T.format===Ps,T.type),Oe&&(oe?i.texStorage2D(s.TEXTURE_2D,1,Wt,Ct.width,Ct.height):i.texImage2D(s.TEXTURE_2D,0,Wt,Ct.width,Ct.height,0,Ht,Yt,null));else if(T.isDataTexture)if($t.length>0){oe&&Oe&&i.texStorage2D(s.TEXTURE_2D,wt,Wt,$t[0].width,$t[0].height);for(let ct=0,xt=$t.length;ct<xt;ct++)Bt=$t[ct],oe?W&&i.texSubImage2D(s.TEXTURE_2D,ct,0,0,Bt.width,Bt.height,Ht,Yt,Bt.data):i.texImage2D(s.TEXTURE_2D,ct,Wt,Bt.width,Bt.height,0,Ht,Yt,Bt.data);T.generateMipmaps=!1}else oe?(Oe&&i.texStorage2D(s.TEXTURE_2D,wt,Wt,Ct.width,Ct.height),W&&i.texSubImage2D(s.TEXTURE_2D,0,0,0,Ct.width,Ct.height,Ht,Yt,Ct.data)):i.texImage2D(s.TEXTURE_2D,0,Wt,Ct.width,Ct.height,0,Ht,Yt,Ct.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){oe&&Oe&&i.texStorage3D(s.TEXTURE_2D_ARRAY,wt,Wt,$t[0].width,$t[0].height,Ct.depth);for(let ct=0,xt=$t.length;ct<xt;ct++)if(Bt=$t[ct],T.format!==bi)if(Ht!==null)if(oe){if(W)if(T.layerUpdates.size>0){const Dt=f0(Bt.width,Bt.height,T.format,T.type);for(const Lt of T.layerUpdates){const te=Bt.data.subarray(Lt*Dt/Bt.data.BYTES_PER_ELEMENT,(Lt+1)*Dt/Bt.data.BYTES_PER_ELEMENT);i.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ct,0,0,Lt,Bt.width,Bt.height,1,Ht,te)}T.clearLayerUpdates()}else i.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ct,0,0,0,Bt.width,Bt.height,Ct.depth,Ht,Bt.data)}else i.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ct,Wt,Bt.width,Bt.height,Ct.depth,0,Bt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else oe?W&&i.texSubImage3D(s.TEXTURE_2D_ARRAY,ct,0,0,0,Bt.width,Bt.height,Ct.depth,Ht,Yt,Bt.data):i.texImage3D(s.TEXTURE_2D_ARRAY,ct,Wt,Bt.width,Bt.height,Ct.depth,0,Ht,Yt,Bt.data)}else{oe&&Oe&&i.texStorage2D(s.TEXTURE_2D,wt,Wt,$t[0].width,$t[0].height);for(let ct=0,xt=$t.length;ct<xt;ct++)Bt=$t[ct],T.format!==bi?Ht!==null?oe?W&&i.compressedTexSubImage2D(s.TEXTURE_2D,ct,0,0,Bt.width,Bt.height,Ht,Bt.data):i.compressedTexImage2D(s.TEXTURE_2D,ct,Wt,Bt.width,Bt.height,0,Bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):oe?W&&i.texSubImage2D(s.TEXTURE_2D,ct,0,0,Bt.width,Bt.height,Ht,Yt,Bt.data):i.texImage2D(s.TEXTURE_2D,ct,Wt,Bt.width,Bt.height,0,Ht,Yt,Bt.data)}else if(T.isDataArrayTexture)if(oe){if(Oe&&i.texStorage3D(s.TEXTURE_2D_ARRAY,wt,Wt,Ct.width,Ct.height,Ct.depth),W)if(T.layerUpdates.size>0){const ct=f0(Ct.width,Ct.height,T.format,T.type);for(const xt of T.layerUpdates){const Dt=Ct.data.subarray(xt*ct/Ct.data.BYTES_PER_ELEMENT,(xt+1)*ct/Ct.data.BYTES_PER_ELEMENT);i.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,xt,Ct.width,Ct.height,1,Ht,Yt,Dt)}T.clearLayerUpdates()}else i.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Ct.width,Ct.height,Ct.depth,Ht,Yt,Ct.data)}else i.texImage3D(s.TEXTURE_2D_ARRAY,0,Wt,Ct.width,Ct.height,Ct.depth,0,Ht,Yt,Ct.data);else if(T.isData3DTexture)oe?(Oe&&i.texStorage3D(s.TEXTURE_3D,wt,Wt,Ct.width,Ct.height,Ct.depth),W&&i.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Ct.width,Ct.height,Ct.depth,Ht,Yt,Ct.data)):i.texImage3D(s.TEXTURE_3D,0,Wt,Ct.width,Ct.height,Ct.depth,0,Ht,Yt,Ct.data);else if(T.isFramebufferTexture){if(Oe)if(oe)i.texStorage2D(s.TEXTURE_2D,wt,Wt,Ct.width,Ct.height);else{let ct=Ct.width,xt=Ct.height;for(let Dt=0;Dt<wt;Dt++)i.texImage2D(s.TEXTURE_2D,Dt,Wt,ct,xt,0,Ht,Yt,null),ct>>=1,xt>>=1}}else if($t.length>0){if(oe&&Oe){const ct=bt($t[0]);i.texStorage2D(s.TEXTURE_2D,wt,Wt,ct.width,ct.height)}for(let ct=0,xt=$t.length;ct<xt;ct++)Bt=$t[ct],oe?W&&i.texSubImage2D(s.TEXTURE_2D,ct,0,0,Ht,Yt,Bt):i.texImage2D(s.TEXTURE_2D,ct,Wt,Ht,Yt,Bt);T.generateMipmaps=!1}else if(oe){if(Oe){const ct=bt(Ct);i.texStorage2D(s.TEXTURE_2D,wt,Wt,ct.width,ct.height)}W&&i.texSubImage2D(s.TEXTURE_2D,0,0,0,Ht,Yt,Ct)}else i.texImage2D(s.TEXTURE_2D,0,Wt,Ht,Yt,Ct);S(T)&&v(mt),Vt.__version=vt.version,T.onUpdate&&T.onUpdate(T)}U.__version=T.version}function ft(U,T,it){if(T.image.length!==6)return;const mt=St(U,T),Tt=T.source;i.bindTexture(s.TEXTURE_CUBE_MAP,U.__webglTexture,s.TEXTURE0+it);const vt=r.get(Tt);if(Tt.version!==vt.__version||mt===!0){i.activeTexture(s.TEXTURE0+it);const Vt=we.getPrimaries(we.workingColorSpace),Ut=T.colorSpace===Xa?null:we.getPrimaries(T.colorSpace),Ft=T.colorSpace===Xa||Vt===Ut?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,T.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,T.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ft);const me=T.isCompressedTexture||T.image[0].isCompressedTexture,Ct=T.image[0]&&T.image[0].isDataTexture,Ht=[];for(let xt=0;xt<6;xt++)!me&&!Ct?Ht[xt]=A(T.image[xt],!0,l.maxCubemapSize):Ht[xt]=Ct?T.image[xt].image:T.image[xt],Ht[xt]=be(T,Ht[xt]);const Yt=Ht[0],Wt=c.convert(T.format,T.colorSpace),Bt=c.convert(T.type),$t=N(T.internalFormat,Wt,Bt,T.colorSpace),oe=T.isVideoTexture!==!0,Oe=vt.__version===void 0||mt===!0,W=Tt.dataReady;let wt=q(T,Yt);tt(s.TEXTURE_CUBE_MAP,T);let ct;if(me){oe&&Oe&&i.texStorage2D(s.TEXTURE_CUBE_MAP,wt,$t,Yt.width,Yt.height);for(let xt=0;xt<6;xt++){ct=Ht[xt].mipmaps;for(let Dt=0;Dt<ct.length;Dt++){const Lt=ct[Dt];T.format!==bi?Wt!==null?oe?W&&i.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt,0,0,Lt.width,Lt.height,Wt,Lt.data):i.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt,$t,Lt.width,Lt.height,0,Lt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):oe?W&&i.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt,0,0,Lt.width,Lt.height,Wt,Bt,Lt.data):i.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt,$t,Lt.width,Lt.height,0,Wt,Bt,Lt.data)}}}else{if(ct=T.mipmaps,oe&&Oe){ct.length>0&&wt++;const xt=bt(Ht[0]);i.texStorage2D(s.TEXTURE_CUBE_MAP,wt,$t,xt.width,xt.height)}for(let xt=0;xt<6;xt++)if(Ct){oe?W&&i.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,0,0,0,Ht[xt].width,Ht[xt].height,Wt,Bt,Ht[xt].data):i.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,0,$t,Ht[xt].width,Ht[xt].height,0,Wt,Bt,Ht[xt].data);for(let Dt=0;Dt<ct.length;Dt++){const te=ct[Dt].image[xt].image;oe?W&&i.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt+1,0,0,te.width,te.height,Wt,Bt,te.data):i.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt+1,$t,te.width,te.height,0,Wt,Bt,te.data)}}else{oe?W&&i.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,0,0,0,Wt,Bt,Ht[xt]):i.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,0,$t,Wt,Bt,Ht[xt]);for(let Dt=0;Dt<ct.length;Dt++){const Lt=ct[Dt];oe?W&&i.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt+1,0,0,Wt,Bt,Lt.image[xt]):i.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+xt,Dt+1,$t,Wt,Bt,Lt.image[xt])}}}S(T)&&v(s.TEXTURE_CUBE_MAP),vt.__version=Tt.version,T.onUpdate&&T.onUpdate(T)}U.__version=T.version}function At(U,T,it,mt,Tt,vt){const Vt=c.convert(it.format,it.colorSpace),Ut=c.convert(it.type),Ft=N(it.internalFormat,Vt,Ut,it.colorSpace),me=r.get(T),Ct=r.get(it);if(Ct.__renderTarget=T,!me.__hasExternalTextures){const Ht=Math.max(1,T.width>>vt),Yt=Math.max(1,T.height>>vt);Tt===s.TEXTURE_3D||Tt===s.TEXTURE_2D_ARRAY?i.texImage3D(Tt,vt,Ft,Ht,Yt,T.depth,0,Vt,Ut,null):i.texImage2D(Tt,vt,Ft,Ht,Yt,0,Vt,Ut,null)}i.bindFramebuffer(s.FRAMEBUFFER,U),se(T)?h.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,mt,Tt,Ct.__webglTexture,0,ae(T)):(Tt===s.TEXTURE_2D||Tt>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&Tt<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,mt,Tt,Ct.__webglTexture,vt),i.bindFramebuffer(s.FRAMEBUFFER,null)}function Mt(U,T,it){if(s.bindRenderbuffer(s.RENDERBUFFER,U),T.depthBuffer){const mt=T.depthTexture,Tt=mt&&mt.isDepthTexture?mt.type:null,vt=D(T.stencilBuffer,Tt),Vt=T.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ut=ae(T);se(T)?h.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ut,vt,T.width,T.height):it?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ut,vt,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,vt,T.width,T.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Vt,s.RENDERBUFFER,U)}else{const mt=T.textures;for(let Tt=0;Tt<mt.length;Tt++){const vt=mt[Tt],Vt=c.convert(vt.format,vt.colorSpace),Ut=c.convert(vt.type),Ft=N(vt.internalFormat,Vt,Ut,vt.colorSpace),me=ae(T);it&&se(T)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,me,Ft,T.width,T.height):se(T)?h.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,me,Ft,T.width,T.height):s.renderbufferStorage(s.RENDERBUFFER,Ft,T.width,T.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function ot(U,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(i.bindFramebuffer(s.FRAMEBUFFER,U),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const mt=r.get(T.depthTexture);mt.__renderTarget=T,(!mt.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),gt(T.depthTexture,0);const Tt=mt.__webglTexture,vt=ae(T);if(T.depthTexture.format===Ds)se(T)?h.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Tt,0,vt):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,Tt,0);else if(T.depthTexture.format===Ps)se(T)?h.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Tt,0,vt):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,Tt,0);else throw new Error("Unknown depthTexture format")}function dt(U){const T=r.get(U),it=U.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==U.depthTexture){const mt=U.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),mt){const Tt=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,mt.removeEventListener("dispose",Tt)};mt.addEventListener("dispose",Tt),T.__depthDisposeCallback=Tt}T.__boundDepthTexture=mt}if(U.depthTexture&&!T.__autoAllocateDepthBuffer){if(it)throw new Error("target.depthTexture not supported in Cube render targets");ot(T.__webglFramebuffer,U)}else if(it){T.__webglDepthbuffer=[];for(let mt=0;mt<6;mt++)if(i.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer[mt]),T.__webglDepthbuffer[mt]===void 0)T.__webglDepthbuffer[mt]=s.createRenderbuffer(),Mt(T.__webglDepthbuffer[mt],U,!1);else{const Tt=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,vt=T.__webglDepthbuffer[mt];s.bindRenderbuffer(s.RENDERBUFFER,vt),s.framebufferRenderbuffer(s.FRAMEBUFFER,Tt,s.RENDERBUFFER,vt)}}else if(i.bindFramebuffer(s.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=s.createRenderbuffer(),Mt(T.__webglDepthbuffer,U,!1);else{const mt=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Tt=T.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,Tt),s.framebufferRenderbuffer(s.FRAMEBUFFER,mt,s.RENDERBUFFER,Tt)}i.bindFramebuffer(s.FRAMEBUFFER,null)}function zt(U,T,it){const mt=r.get(U);T!==void 0&&At(mt.__webglFramebuffer,U,U.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),it!==void 0&&dt(U)}function Xt(U){const T=U.texture,it=r.get(U),mt=r.get(T);U.addEventListener("dispose",O);const Tt=U.textures,vt=U.isWebGLCubeRenderTarget===!0,Vt=Tt.length>1;if(Vt||(mt.__webglTexture===void 0&&(mt.__webglTexture=s.createTexture()),mt.__version=T.version,d.memory.textures++),vt){it.__webglFramebuffer=[];for(let Ut=0;Ut<6;Ut++)if(T.mipmaps&&T.mipmaps.length>0){it.__webglFramebuffer[Ut]=[];for(let Ft=0;Ft<T.mipmaps.length;Ft++)it.__webglFramebuffer[Ut][Ft]=s.createFramebuffer()}else it.__webglFramebuffer[Ut]=s.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){it.__webglFramebuffer=[];for(let Ut=0;Ut<T.mipmaps.length;Ut++)it.__webglFramebuffer[Ut]=s.createFramebuffer()}else it.__webglFramebuffer=s.createFramebuffer();if(Vt)for(let Ut=0,Ft=Tt.length;Ut<Ft;Ut++){const me=r.get(Tt[Ut]);me.__webglTexture===void 0&&(me.__webglTexture=s.createTexture(),d.memory.textures++)}if(U.samples>0&&se(U)===!1){it.__webglMultisampledFramebuffer=s.createFramebuffer(),it.__webglColorRenderbuffer=[],i.bindFramebuffer(s.FRAMEBUFFER,it.__webglMultisampledFramebuffer);for(let Ut=0;Ut<Tt.length;Ut++){const Ft=Tt[Ut];it.__webglColorRenderbuffer[Ut]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,it.__webglColorRenderbuffer[Ut]);const me=c.convert(Ft.format,Ft.colorSpace),Ct=c.convert(Ft.type),Ht=N(Ft.internalFormat,me,Ct,Ft.colorSpace,U.isXRRenderTarget===!0),Yt=ae(U);s.renderbufferStorageMultisample(s.RENDERBUFFER,Yt,Ht,U.width,U.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ut,s.RENDERBUFFER,it.__webglColorRenderbuffer[Ut])}s.bindRenderbuffer(s.RENDERBUFFER,null),U.depthBuffer&&(it.__webglDepthRenderbuffer=s.createRenderbuffer(),Mt(it.__webglDepthRenderbuffer,U,!0)),i.bindFramebuffer(s.FRAMEBUFFER,null)}}if(vt){i.bindTexture(s.TEXTURE_CUBE_MAP,mt.__webglTexture),tt(s.TEXTURE_CUBE_MAP,T);for(let Ut=0;Ut<6;Ut++)if(T.mipmaps&&T.mipmaps.length>0)for(let Ft=0;Ft<T.mipmaps.length;Ft++)At(it.__webglFramebuffer[Ut][Ft],U,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ut,Ft);else At(it.__webglFramebuffer[Ut],U,T,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ut,0);S(T)&&v(s.TEXTURE_CUBE_MAP),i.unbindTexture()}else if(Vt){for(let Ut=0,Ft=Tt.length;Ut<Ft;Ut++){const me=Tt[Ut],Ct=r.get(me);i.bindTexture(s.TEXTURE_2D,Ct.__webglTexture),tt(s.TEXTURE_2D,me),At(it.__webglFramebuffer,U,me,s.COLOR_ATTACHMENT0+Ut,s.TEXTURE_2D,0),S(me)&&v(s.TEXTURE_2D)}i.unbindTexture()}else{let Ut=s.TEXTURE_2D;if((U.isWebGL3DRenderTarget||U.isWebGLArrayRenderTarget)&&(Ut=U.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),i.bindTexture(Ut,mt.__webglTexture),tt(Ut,T),T.mipmaps&&T.mipmaps.length>0)for(let Ft=0;Ft<T.mipmaps.length;Ft++)At(it.__webglFramebuffer[Ft],U,T,s.COLOR_ATTACHMENT0,Ut,Ft);else At(it.__webglFramebuffer,U,T,s.COLOR_ATTACHMENT0,Ut,0);S(T)&&v(Ut),i.unbindTexture()}U.depthBuffer&&dt(U)}function Kt(U){const T=U.textures;for(let it=0,mt=T.length;it<mt;it++){const Tt=T[it];if(S(Tt)){const vt=P(U),Vt=r.get(Tt).__webglTexture;i.bindTexture(vt,Vt),v(vt),i.unbindTexture()}}}const he=[],F=[];function Ve(U){if(U.samples>0){if(se(U)===!1){const T=U.textures,it=U.width,mt=U.height;let Tt=s.COLOR_BUFFER_BIT;const vt=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Vt=r.get(U),Ut=T.length>1;if(Ut)for(let Ft=0;Ft<T.length;Ft++)i.bindFramebuffer(s.FRAMEBUFFER,Vt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ft,s.RENDERBUFFER,null),i.bindFramebuffer(s.FRAMEBUFFER,Vt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ft,s.TEXTURE_2D,null,0);i.bindFramebuffer(s.READ_FRAMEBUFFER,Vt.__webglMultisampledFramebuffer),i.bindFramebuffer(s.DRAW_FRAMEBUFFER,Vt.__webglFramebuffer);for(let Ft=0;Ft<T.length;Ft++){if(U.resolveDepthBuffer&&(U.depthBuffer&&(Tt|=s.DEPTH_BUFFER_BIT),U.stencilBuffer&&U.resolveStencilBuffer&&(Tt|=s.STENCIL_BUFFER_BIT)),Ut){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Vt.__webglColorRenderbuffer[Ft]);const me=r.get(T[Ft]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,me,0)}s.blitFramebuffer(0,0,it,mt,0,0,it,mt,Tt,s.NEAREST),p===!0&&(he.length=0,F.length=0,he.push(s.COLOR_ATTACHMENT0+Ft),U.depthBuffer&&U.resolveDepthBuffer===!1&&(he.push(vt),F.push(vt),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,F)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,he))}if(i.bindFramebuffer(s.READ_FRAMEBUFFER,null),i.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ut)for(let Ft=0;Ft<T.length;Ft++){i.bindFramebuffer(s.FRAMEBUFFER,Vt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ft,s.RENDERBUFFER,Vt.__webglColorRenderbuffer[Ft]);const me=r.get(T[Ft]).__webglTexture;i.bindFramebuffer(s.FRAMEBUFFER,Vt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ft,s.TEXTURE_2D,me,0)}i.bindFramebuffer(s.DRAW_FRAMEBUFFER,Vt.__webglMultisampledFramebuffer)}else if(U.depthBuffer&&U.resolveDepthBuffer===!1&&p){const T=U.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[T])}}}function ae(U){return Math.min(l.maxSamples,U.samples)}function se(U){const T=r.get(U);return U.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function qt(U){const T=d.render.frame;g.get(U)!==T&&(g.set(U,T),U.update())}function be(U,T){const it=U.colorSpace,mt=U.format,Tt=U.type;return U.isCompressedTexture===!0||U.isVideoTexture===!0||it!==Bs&&it!==Xa&&(we.getTransfer(it)===Fe?(mt!==bi||Tt!==da)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",it)),T}function bt(U){return typeof HTMLImageElement<"u"&&U instanceof HTMLImageElement?(m.width=U.naturalWidth||U.width,m.height=U.naturalHeight||U.height):typeof VideoFrame<"u"&&U instanceof VideoFrame?(m.width=U.displayWidth,m.height=U.displayHeight):(m.width=U.width,m.height=U.height),m}this.allocateTextureUnit=$,this.resetTextureUnits=J,this.setTexture2D=gt,this.setTexture2DArray=z,this.setTexture3D=K,this.setTextureCube=X,this.rebindTextures=zt,this.setupRenderTarget=Xt,this.updateRenderTargetMipmap=Kt,this.updateMultisampleRenderTarget=Ve,this.setupDepthRenderbuffer=dt,this.setupFrameBufferTexture=At,this.useMultisampledRTT=se}function r1(s,t){function i(r,l=Xa){let c;const d=we.getTransfer(l);if(r===da)return s.UNSIGNED_BYTE;if(r===Hd)return s.UNSIGNED_SHORT_4_4_4_4;if(r===Gd)return s.UNSIGNED_SHORT_5_5_5_1;if(r===tv)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===J0)return s.BYTE;if(r===$0)return s.SHORT;if(r===Zo)return s.UNSIGNED_SHORT;if(r===Fd)return s.INT;if(r===Cr)return s.UNSIGNED_INT;if(r===ca)return s.FLOAT;if(r===$o)return s.HALF_FLOAT;if(r===ev)return s.ALPHA;if(r===nv)return s.RGB;if(r===bi)return s.RGBA;if(r===iv)return s.LUMINANCE;if(r===av)return s.LUMINANCE_ALPHA;if(r===Ds)return s.DEPTH_COMPONENT;if(r===Ps)return s.DEPTH_STENCIL;if(r===rv)return s.RED;if(r===Vd)return s.RED_INTEGER;if(r===sv)return s.RG;if(r===kd)return s.RG_INTEGER;if(r===Xd)return s.RGBA_INTEGER;if(r===Bc||r===Ic||r===Fc||r===Hc)if(d===Fe)if(c=t.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(r===Bc)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===Ic)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===Fc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===Hc)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=t.get("WEBGL_compressed_texture_s3tc"),c!==null){if(r===Bc)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===Ic)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===Fc)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===Hc)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===ld||r===cd||r===ud||r===fd)if(c=t.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(r===ld)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===cd)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===ud)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===fd)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===hd||r===dd||r===pd)if(c=t.get("WEBGL_compressed_texture_etc"),c!==null){if(r===hd||r===dd)return d===Fe?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(r===pd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===md||r===gd||r===_d||r===vd||r===yd||r===xd||r===Sd||r===Md||r===Ed||r===Td||r===bd||r===Ad||r===Rd||r===Cd)if(c=t.get("WEBGL_compressed_texture_astc"),c!==null){if(r===md)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===gd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===_d)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===vd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===yd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===xd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===Sd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===Md)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===Ed)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===Td)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===bd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===Ad)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===Rd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===Cd)return d===Fe?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===Gc||r===wd||r===Dd)if(c=t.get("EXT_texture_compression_bptc"),c!==null){if(r===Gc)return d===Fe?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===wd)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===Dd)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===ov||r===Ud||r===Ld||r===Nd)if(c=t.get("EXT_texture_compression_rgtc"),c!==null){if(r===Gc)return c.COMPRESSED_RED_RGTC1_EXT;if(r===Ud)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===Ld)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===Nd)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===zs?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:i}}const s1={type:"move"};class Fh{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new fa,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new fa,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new Q,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new Q),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new fa,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new Q,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new Q),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const i=this._hand;if(i)for(const r of t.hand.values())this._getHandJoint(i,r)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,i,r){let l=null,c=null,d=null;const h=this._targetRay,p=this._grip,m=this._hand;if(t&&i.session.visibilityState!=="visible-blurred"){if(m&&t.hand){d=!0;for(const A of t.hand.values()){const S=i.getJointPose(A,r),v=this._getHandJoint(m,A);S!==null&&(v.matrix.fromArray(S.transform.matrix),v.matrix.decompose(v.position,v.rotation,v.scale),v.matrixWorldNeedsUpdate=!0,v.jointRadius=S.radius),v.visible=S!==null}const g=m.joints["index-finger-tip"],_=m.joints["thumb-tip"],x=g.position.distanceTo(_.position),M=.02,E=.005;m.inputState.pinching&&x>M+E?(m.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!m.inputState.pinching&&x<=M-E&&(m.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else p!==null&&t.gripSpace&&(c=i.getPose(t.gripSpace,r),c!==null&&(p.matrix.fromArray(c.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,c.linearVelocity?(p.hasLinearVelocity=!0,p.linearVelocity.copy(c.linearVelocity)):p.hasLinearVelocity=!1,c.angularVelocity?(p.hasAngularVelocity=!0,p.angularVelocity.copy(c.angularVelocity)):p.hasAngularVelocity=!1));h!==null&&(l=i.getPose(t.targetRaySpace,r),l===null&&c!==null&&(l=c),l!==null&&(h.matrix.fromArray(l.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,l.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(l.linearVelocity)):h.hasLinearVelocity=!1,l.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(l.angularVelocity)):h.hasAngularVelocity=!1,this.dispatchEvent(s1)))}return h!==null&&(h.visible=l!==null),p!==null&&(p.visible=c!==null),m!==null&&(m.visible=d!==null),this}_getHandJoint(t,i){if(t.joints[i.jointName]===void 0){const r=new fa;r.matrixAutoUpdate=!1,r.visible=!1,t.joints[i.jointName]=r,t.add(r)}return t.joints[i.jointName]}}const o1=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,l1=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class c1{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,i,r){if(this.texture===null){const l=new Un,c=t.properties.get(l);c.__webglTexture=i.texture,(i.depthNear!==r.depthNear||i.depthFar!==r.depthFar)&&(this.depthNear=i.depthNear,this.depthFar=i.depthFar),this.texture=l}}getMesh(t){if(this.texture!==null&&this.mesh===null){const i=t.cameras[0].viewport,r=new ja({vertexShader:o1,fragmentShader:l1,uniforms:{depthColor:{value:this.texture},depthWidth:{value:i.z},depthHeight:{value:i.w}}});this.mesh=new cn(new Ur(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class u1 extends Fs{constructor(t,i){super();const r=this;let l=null,c=1,d=null,h="local-floor",p=1,m=null,g=null,_=null,x=null,M=null,E=null;const A=new c1,S=i.getContextAttributes();let v=null,P=null;const N=[],D=[],q=new De;let H=null;const O=new Ei;O.viewport=new $e;const V=new Ei;V.viewport=new $e;const w=[O,V],R=new UM;let I=null,J=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let ft=N[Z];return ft===void 0&&(ft=new Fh,N[Z]=ft),ft.getTargetRaySpace()},this.getControllerGrip=function(Z){let ft=N[Z];return ft===void 0&&(ft=new Fh,N[Z]=ft),ft.getGripSpace()},this.getHand=function(Z){let ft=N[Z];return ft===void 0&&(ft=new Fh,N[Z]=ft),ft.getHandSpace()};function $(Z){const ft=D.indexOf(Z.inputSource);if(ft===-1)return;const At=N[ft];At!==void 0&&(At.update(Z.inputSource,Z.frame,m||d),At.dispatchEvent({type:Z.type,data:Z.inputSource}))}function ut(){l.removeEventListener("select",$),l.removeEventListener("selectstart",$),l.removeEventListener("selectend",$),l.removeEventListener("squeeze",$),l.removeEventListener("squeezestart",$),l.removeEventListener("squeezeend",$),l.removeEventListener("end",ut),l.removeEventListener("inputsourceschange",gt);for(let Z=0;Z<N.length;Z++){const ft=D[Z];ft!==null&&(D[Z]=null,N[Z].disconnect(ft))}I=null,J=null,A.reset(),t.setRenderTarget(v),M=null,x=null,_=null,l=null,P=null,St.stop(),r.isPresenting=!1,t.setPixelRatio(H),t.setSize(q.width,q.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){c=Z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){h=Z,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return m||d},this.setReferenceSpace=function(Z){m=Z},this.getBaseLayer=function(){return x!==null?x:M},this.getBinding=function(){return _},this.getFrame=function(){return E},this.getSession=function(){return l},this.setSession=async function(Z){if(l=Z,l!==null){if(v=t.getRenderTarget(),l.addEventListener("select",$),l.addEventListener("selectstart",$),l.addEventListener("selectend",$),l.addEventListener("squeeze",$),l.addEventListener("squeezestart",$),l.addEventListener("squeezeend",$),l.addEventListener("end",ut),l.addEventListener("inputsourceschange",gt),S.xrCompatible!==!0&&await i.makeXRCompatible(),H=t.getPixelRatio(),t.getSize(q),l.enabledFeatures!==void 0&&l.enabledFeatures.includes("layers")){let At=null,Mt=null,ot=null;S.depth&&(ot=S.stencil?i.DEPTH24_STENCIL8:i.DEPTH_COMPONENT24,At=S.stencil?Ps:Ds,Mt=S.stencil?zs:Cr);const dt={colorFormat:i.RGBA8,depthFormat:ot,scaleFactor:c};_=new XRWebGLBinding(l,i),x=_.createProjectionLayer(dt),l.updateRenderState({layers:[x]}),t.setPixelRatio(1),t.setSize(x.textureWidth,x.textureHeight,!1),P=new wr(x.textureWidth,x.textureHeight,{format:bi,type:da,depthTexture:new Mv(x.textureWidth,x.textureHeight,Mt,void 0,void 0,void 0,void 0,void 0,void 0,At),stencilBuffer:S.stencil,colorSpace:t.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:x.ignoreDepthValues===!1})}else{const At={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:c};M=new XRWebGLLayer(l,i,At),l.updateRenderState({baseLayer:M}),t.setPixelRatio(1),t.setSize(M.framebufferWidth,M.framebufferHeight,!1),P=new wr(M.framebufferWidth,M.framebufferHeight,{format:bi,type:da,colorSpace:t.outputColorSpace,stencilBuffer:S.stencil})}P.isXRRenderTarget=!0,this.setFoveation(p),m=null,d=await l.requestReferenceSpace(h),St.setContext(l),St.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(l!==null)return l.environmentBlendMode},this.getDepthTexture=function(){return A.getDepthTexture()};function gt(Z){for(let ft=0;ft<Z.removed.length;ft++){const At=Z.removed[ft],Mt=D.indexOf(At);Mt>=0&&(D[Mt]=null,N[Mt].disconnect(At))}for(let ft=0;ft<Z.added.length;ft++){const At=Z.added[ft];let Mt=D.indexOf(At);if(Mt===-1){for(let dt=0;dt<N.length;dt++)if(dt>=D.length){D.push(At),Mt=dt;break}else if(D[dt]===null){D[dt]=At,Mt=dt;break}if(Mt===-1)break}const ot=N[Mt];ot&&ot.connect(At)}}const z=new Q,K=new Q;function X(Z,ft,At){z.setFromMatrixPosition(ft.matrixWorld),K.setFromMatrixPosition(At.matrixWorld);const Mt=z.distanceTo(K),ot=ft.projectionMatrix.elements,dt=At.projectionMatrix.elements,zt=ot[14]/(ot[10]-1),Xt=ot[14]/(ot[10]+1),Kt=(ot[9]+1)/ot[5],he=(ot[9]-1)/ot[5],F=(ot[8]-1)/ot[0],Ve=(dt[8]+1)/dt[0],ae=zt*F,se=zt*Ve,qt=Mt/(-F+Ve),be=qt*-F;if(ft.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(be),Z.translateZ(qt),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),ot[10]===-1)Z.projectionMatrix.copy(ft.projectionMatrix),Z.projectionMatrixInverse.copy(ft.projectionMatrixInverse);else{const bt=zt+qt,U=Xt+qt,T=ae-be,it=se+(Mt-be),mt=Kt*Xt/U*bt,Tt=he*Xt/U*bt;Z.projectionMatrix.makePerspective(T,it,mt,Tt,bt,U),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function ht(Z,ft){ft===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(ft.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(l===null)return;let ft=Z.near,At=Z.far;A.texture!==null&&(A.depthNear>0&&(ft=A.depthNear),A.depthFar>0&&(At=A.depthFar)),R.near=V.near=O.near=ft,R.far=V.far=O.far=At,(I!==R.near||J!==R.far)&&(l.updateRenderState({depthNear:R.near,depthFar:R.far}),I=R.near,J=R.far),O.layers.mask=Z.layers.mask|2,V.layers.mask=Z.layers.mask|4,R.layers.mask=O.layers.mask|V.layers.mask;const Mt=Z.parent,ot=R.cameras;ht(R,Mt);for(let dt=0;dt<ot.length;dt++)ht(ot[dt],Mt);ot.length===2?X(R,O,V):R.projectionMatrix.copy(O.projectionMatrix),Et(Z,R,Mt)};function Et(Z,ft,At){At===null?Z.matrix.copy(ft.matrixWorld):(Z.matrix.copy(At.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(ft.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(ft.projectionMatrix),Z.projectionMatrixInverse.copy(ft.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=jo*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return R},this.getFoveation=function(){if(!(x===null&&M===null))return p},this.setFoveation=function(Z){p=Z,x!==null&&(x.fixedFoveation=Z),M!==null&&M.fixedFoveation!==void 0&&(M.fixedFoveation=Z)},this.hasDepthSensing=function(){return A.texture!==null},this.getDepthSensingMesh=function(){return A.getMesh(R)};let L=null;function tt(Z,ft){if(g=ft.getViewerPose(m||d),E=ft,g!==null){const At=g.views;M!==null&&(t.setRenderTargetFramebuffer(P,M.framebuffer),t.setRenderTarget(P));let Mt=!1;At.length!==R.cameras.length&&(R.cameras.length=0,Mt=!0);for(let dt=0;dt<At.length;dt++){const zt=At[dt];let Xt=null;if(M!==null)Xt=M.getViewport(zt);else{const he=_.getViewSubImage(x,zt);Xt=he.viewport,dt===0&&(t.setRenderTargetTextures(P,he.colorTexture,x.ignoreDepthValues?void 0:he.depthStencilTexture),t.setRenderTarget(P))}let Kt=w[dt];Kt===void 0&&(Kt=new Ei,Kt.layers.enable(dt),Kt.viewport=new $e,w[dt]=Kt),Kt.matrix.fromArray(zt.transform.matrix),Kt.matrix.decompose(Kt.position,Kt.quaternion,Kt.scale),Kt.projectionMatrix.fromArray(zt.projectionMatrix),Kt.projectionMatrixInverse.copy(Kt.projectionMatrix).invert(),Kt.viewport.set(Xt.x,Xt.y,Xt.width,Xt.height),dt===0&&(R.matrix.copy(Kt.matrix),R.matrix.decompose(R.position,R.quaternion,R.scale)),Mt===!0&&R.cameras.push(Kt)}const ot=l.enabledFeatures;if(ot&&ot.includes("depth-sensing")){const dt=_.getDepthInformation(At[0]);dt&&dt.isValid&&dt.texture&&A.init(t,dt,l.renderState)}}for(let At=0;At<N.length;At++){const Mt=D[At],ot=N[At];Mt!==null&&ot!==void 0&&ot.update(Mt,ft,m||d)}L&&L(Z,ft),ft.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:ft}),E=null}const St=new Tv;St.setAnimationLoop(tt),this.setAnimationLoop=function(Z){L=Z},this.dispose=function(){}}}const xr=new Bi,f1=new Ze;function h1(s,t){function i(S,v){S.matrixAutoUpdate===!0&&S.updateMatrix(),v.value.copy(S.matrix)}function r(S,v){v.color.getRGB(S.fogColor.value,vv(s)),v.isFog?(S.fogNear.value=v.near,S.fogFar.value=v.far):v.isFogExp2&&(S.fogDensity.value=v.density)}function l(S,v,P,N,D){v.isMeshBasicMaterial||v.isMeshLambertMaterial?c(S,v):v.isMeshToonMaterial?(c(S,v),_(S,v)):v.isMeshPhongMaterial?(c(S,v),g(S,v)):v.isMeshStandardMaterial?(c(S,v),x(S,v),v.isMeshPhysicalMaterial&&M(S,v,D)):v.isMeshMatcapMaterial?(c(S,v),E(S,v)):v.isMeshDepthMaterial?c(S,v):v.isMeshDistanceMaterial?(c(S,v),A(S,v)):v.isMeshNormalMaterial?c(S,v):v.isLineBasicMaterial?(d(S,v),v.isLineDashedMaterial&&h(S,v)):v.isPointsMaterial?p(S,v,P,N):v.isSpriteMaterial?m(S,v):v.isShadowMaterial?(S.color.value.copy(v.color),S.opacity.value=v.opacity):v.isShaderMaterial&&(v.uniformsNeedUpdate=!1)}function c(S,v){S.opacity.value=v.opacity,v.color&&S.diffuse.value.copy(v.color),v.emissive&&S.emissive.value.copy(v.emissive).multiplyScalar(v.emissiveIntensity),v.map&&(S.map.value=v.map,i(v.map,S.mapTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,i(v.alphaMap,S.alphaMapTransform)),v.bumpMap&&(S.bumpMap.value=v.bumpMap,i(v.bumpMap,S.bumpMapTransform),S.bumpScale.value=v.bumpScale,v.side===qn&&(S.bumpScale.value*=-1)),v.normalMap&&(S.normalMap.value=v.normalMap,i(v.normalMap,S.normalMapTransform),S.normalScale.value.copy(v.normalScale),v.side===qn&&S.normalScale.value.negate()),v.displacementMap&&(S.displacementMap.value=v.displacementMap,i(v.displacementMap,S.displacementMapTransform),S.displacementScale.value=v.displacementScale,S.displacementBias.value=v.displacementBias),v.emissiveMap&&(S.emissiveMap.value=v.emissiveMap,i(v.emissiveMap,S.emissiveMapTransform)),v.specularMap&&(S.specularMap.value=v.specularMap,i(v.specularMap,S.specularMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest);const P=t.get(v),N=P.envMap,D=P.envMapRotation;N&&(S.envMap.value=N,xr.copy(D),xr.x*=-1,xr.y*=-1,xr.z*=-1,N.isCubeTexture&&N.isRenderTargetTexture===!1&&(xr.y*=-1,xr.z*=-1),S.envMapRotation.value.setFromMatrix4(f1.makeRotationFromEuler(xr)),S.flipEnvMap.value=N.isCubeTexture&&N.isRenderTargetTexture===!1?-1:1,S.reflectivity.value=v.reflectivity,S.ior.value=v.ior,S.refractionRatio.value=v.refractionRatio),v.lightMap&&(S.lightMap.value=v.lightMap,S.lightMapIntensity.value=v.lightMapIntensity,i(v.lightMap,S.lightMapTransform)),v.aoMap&&(S.aoMap.value=v.aoMap,S.aoMapIntensity.value=v.aoMapIntensity,i(v.aoMap,S.aoMapTransform))}function d(S,v){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,v.map&&(S.map.value=v.map,i(v.map,S.mapTransform))}function h(S,v){S.dashSize.value=v.dashSize,S.totalSize.value=v.dashSize+v.gapSize,S.scale.value=v.scale}function p(S,v,P,N){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,S.size.value=v.size*P,S.scale.value=N*.5,v.map&&(S.map.value=v.map,i(v.map,S.uvTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,i(v.alphaMap,S.alphaMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest)}function m(S,v){S.diffuse.value.copy(v.color),S.opacity.value=v.opacity,S.rotation.value=v.rotation,v.map&&(S.map.value=v.map,i(v.map,S.mapTransform)),v.alphaMap&&(S.alphaMap.value=v.alphaMap,i(v.alphaMap,S.alphaMapTransform)),v.alphaTest>0&&(S.alphaTest.value=v.alphaTest)}function g(S,v){S.specular.value.copy(v.specular),S.shininess.value=Math.max(v.shininess,1e-4)}function _(S,v){v.gradientMap&&(S.gradientMap.value=v.gradientMap)}function x(S,v){S.metalness.value=v.metalness,v.metalnessMap&&(S.metalnessMap.value=v.metalnessMap,i(v.metalnessMap,S.metalnessMapTransform)),S.roughness.value=v.roughness,v.roughnessMap&&(S.roughnessMap.value=v.roughnessMap,i(v.roughnessMap,S.roughnessMapTransform)),v.envMap&&(S.envMapIntensity.value=v.envMapIntensity)}function M(S,v,P){S.ior.value=v.ior,v.sheen>0&&(S.sheenColor.value.copy(v.sheenColor).multiplyScalar(v.sheen),S.sheenRoughness.value=v.sheenRoughness,v.sheenColorMap&&(S.sheenColorMap.value=v.sheenColorMap,i(v.sheenColorMap,S.sheenColorMapTransform)),v.sheenRoughnessMap&&(S.sheenRoughnessMap.value=v.sheenRoughnessMap,i(v.sheenRoughnessMap,S.sheenRoughnessMapTransform))),v.clearcoat>0&&(S.clearcoat.value=v.clearcoat,S.clearcoatRoughness.value=v.clearcoatRoughness,v.clearcoatMap&&(S.clearcoatMap.value=v.clearcoatMap,i(v.clearcoatMap,S.clearcoatMapTransform)),v.clearcoatRoughnessMap&&(S.clearcoatRoughnessMap.value=v.clearcoatRoughnessMap,i(v.clearcoatRoughnessMap,S.clearcoatRoughnessMapTransform)),v.clearcoatNormalMap&&(S.clearcoatNormalMap.value=v.clearcoatNormalMap,i(v.clearcoatNormalMap,S.clearcoatNormalMapTransform),S.clearcoatNormalScale.value.copy(v.clearcoatNormalScale),v.side===qn&&S.clearcoatNormalScale.value.negate())),v.dispersion>0&&(S.dispersion.value=v.dispersion),v.iridescence>0&&(S.iridescence.value=v.iridescence,S.iridescenceIOR.value=v.iridescenceIOR,S.iridescenceThicknessMinimum.value=v.iridescenceThicknessRange[0],S.iridescenceThicknessMaximum.value=v.iridescenceThicknessRange[1],v.iridescenceMap&&(S.iridescenceMap.value=v.iridescenceMap,i(v.iridescenceMap,S.iridescenceMapTransform)),v.iridescenceThicknessMap&&(S.iridescenceThicknessMap.value=v.iridescenceThicknessMap,i(v.iridescenceThicknessMap,S.iridescenceThicknessMapTransform))),v.transmission>0&&(S.transmission.value=v.transmission,S.transmissionSamplerMap.value=P.texture,S.transmissionSamplerSize.value.set(P.width,P.height),v.transmissionMap&&(S.transmissionMap.value=v.transmissionMap,i(v.transmissionMap,S.transmissionMapTransform)),S.thickness.value=v.thickness,v.thicknessMap&&(S.thicknessMap.value=v.thicknessMap,i(v.thicknessMap,S.thicknessMapTransform)),S.attenuationDistance.value=v.attenuationDistance,S.attenuationColor.value.copy(v.attenuationColor)),v.anisotropy>0&&(S.anisotropyVector.value.set(v.anisotropy*Math.cos(v.anisotropyRotation),v.anisotropy*Math.sin(v.anisotropyRotation)),v.anisotropyMap&&(S.anisotropyMap.value=v.anisotropyMap,i(v.anisotropyMap,S.anisotropyMapTransform))),S.specularIntensity.value=v.specularIntensity,S.specularColor.value.copy(v.specularColor),v.specularColorMap&&(S.specularColorMap.value=v.specularColorMap,i(v.specularColorMap,S.specularColorMapTransform)),v.specularIntensityMap&&(S.specularIntensityMap.value=v.specularIntensityMap,i(v.specularIntensityMap,S.specularIntensityMapTransform))}function E(S,v){v.matcap&&(S.matcap.value=v.matcap)}function A(S,v){const P=t.get(v).light;S.referencePosition.value.setFromMatrixPosition(P.matrixWorld),S.nearDistance.value=P.shadow.camera.near,S.farDistance.value=P.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:l}}function d1(s,t,i,r){let l={},c={},d=[];const h=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function p(P,N){const D=N.program;r.uniformBlockBinding(P,D)}function m(P,N){let D=l[P.id];D===void 0&&(E(P),D=g(P),l[P.id]=D,P.addEventListener("dispose",S));const q=N.program;r.updateUBOMapping(P,q);const H=t.render.frame;c[P.id]!==H&&(x(P),c[P.id]=H)}function g(P){const N=_();P.__bindingPointIndex=N;const D=s.createBuffer(),q=P.__size,H=P.usage;return s.bindBuffer(s.UNIFORM_BUFFER,D),s.bufferData(s.UNIFORM_BUFFER,q,H),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,N,D),D}function _(){for(let P=0;P<h;P++)if(d.indexOf(P)===-1)return d.push(P),P;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function x(P){const N=l[P.id],D=P.uniforms,q=P.__cache;s.bindBuffer(s.UNIFORM_BUFFER,N);for(let H=0,O=D.length;H<O;H++){const V=Array.isArray(D[H])?D[H]:[D[H]];for(let w=0,R=V.length;w<R;w++){const I=V[w];if(M(I,H,w,q)===!0){const J=I.__offset,$=Array.isArray(I.value)?I.value:[I.value];let ut=0;for(let gt=0;gt<$.length;gt++){const z=$[gt],K=A(z);typeof z=="number"||typeof z=="boolean"?(I.__data[0]=z,s.bufferSubData(s.UNIFORM_BUFFER,J+ut,I.__data)):z.isMatrix3?(I.__data[0]=z.elements[0],I.__data[1]=z.elements[1],I.__data[2]=z.elements[2],I.__data[3]=0,I.__data[4]=z.elements[3],I.__data[5]=z.elements[4],I.__data[6]=z.elements[5],I.__data[7]=0,I.__data[8]=z.elements[6],I.__data[9]=z.elements[7],I.__data[10]=z.elements[8],I.__data[11]=0):(z.toArray(I.__data,ut),ut+=K.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,J,I.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function M(P,N,D,q){const H=P.value,O=N+"_"+D;if(q[O]===void 0)return typeof H=="number"||typeof H=="boolean"?q[O]=H:q[O]=H.clone(),!0;{const V=q[O];if(typeof H=="number"||typeof H=="boolean"){if(V!==H)return q[O]=H,!0}else if(V.equals(H)===!1)return V.copy(H),!0}return!1}function E(P){const N=P.uniforms;let D=0;const q=16;for(let O=0,V=N.length;O<V;O++){const w=Array.isArray(N[O])?N[O]:[N[O]];for(let R=0,I=w.length;R<I;R++){const J=w[R],$=Array.isArray(J.value)?J.value:[J.value];for(let ut=0,gt=$.length;ut<gt;ut++){const z=$[ut],K=A(z),X=D%q,ht=X%K.boundary,Et=X+ht;D+=ht,Et!==0&&q-Et<K.storage&&(D+=q-Et),J.__data=new Float32Array(K.storage/Float32Array.BYTES_PER_ELEMENT),J.__offset=D,D+=K.storage}}}const H=D%q;return H>0&&(D+=q-H),P.__size=D,P.__cache={},this}function A(P){const N={boundary:0,storage:0};return typeof P=="number"||typeof P=="boolean"?(N.boundary=4,N.storage=4):P.isVector2?(N.boundary=8,N.storage=8):P.isVector3||P.isColor?(N.boundary=16,N.storage=12):P.isVector4?(N.boundary=16,N.storage=16):P.isMatrix3?(N.boundary=48,N.storage=48):P.isMatrix4?(N.boundary=64,N.storage=64):P.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",P),N}function S(P){const N=P.target;N.removeEventListener("dispose",S);const D=d.indexOf(N.__bindingPointIndex);d.splice(D,1),s.deleteBuffer(l[N.id]),delete l[N.id],delete c[N.id]}function v(){for(const P in l)s.deleteBuffer(l[P]);d=[],l={},c={}}return{bind:p,update:m,dispose:v}}class p1{constructor(t={}){const{canvas:i=XS(),context:r=null,depth:l=!0,stencil:c=!1,alpha:d=!1,antialias:h=!1,premultipliedAlpha:p=!0,preserveDrawingBuffer:m=!1,powerPreference:g="default",failIfMajorPerformanceCaveat:_=!1,reverseDepthBuffer:x=!1}=t;this.isWebGLRenderer=!0;let M;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=r.getContextAttributes().alpha}else M=d;const E=new Uint32Array(4),A=new Int32Array(4);let S=null,v=null;const P=[],N=[];this.domElement=i,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=di,this.toneMapping=Ya,this.toneMappingExposure=1;const D=this;let q=!1,H=0,O=0,V=null,w=-1,R=null;const I=new $e,J=new $e;let $=null;const ut=new Te(0);let gt=0,z=i.width,K=i.height,X=1,ht=null,Et=null;const L=new $e(0,0,z,K),tt=new $e(0,0,z,K);let St=!1;const Z=new Wd;let ft=!1,At=!1;this.transmissionResolutionScale=1;const Mt=new Ze,ot=new Ze,dt=new Q,zt=new $e,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Kt=!1;function he(){return V===null?X:1}let F=r;function Ve(C,Y){return i.getContext(C,Y)}try{const C={alpha:!0,depth:l,stencil:c,antialias:h,premultipliedAlpha:p,preserveDrawingBuffer:m,powerPreference:g,failIfMajorPerformanceCaveat:_};if("setAttribute"in i&&i.setAttribute("data-engine",`three.js r${Bd}`),i.addEventListener("webglcontextlost",xt,!1),i.addEventListener("webglcontextrestored",Dt,!1),i.addEventListener("webglcontextcreationerror",Lt,!1),F===null){const Y="webgl2";if(F=Ve(Y,C),F===null)throw Ve(Y)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let ae,se,qt,be,bt,U,T,it,mt,Tt,vt,Vt,Ut,Ft,me,Ct,Ht,Yt,Wt,Bt,$t,oe,Oe,W;function wt(){ae=new Eb(F),ae.init(),oe=new r1(F,ae),se=new _b(F,ae,t,oe),qt=new i1(F,ae),se.reverseDepthBuffer&&x&&qt.buffers.depth.setReversed(!0),be=new Ab(F),bt=new XA,U=new a1(F,ae,qt,bt,se,oe,be),T=new yb(D),it=new Mb(D),mt=new NM(F),Oe=new mb(F,mt),Tt=new Tb(F,mt,be,Oe),vt=new Cb(F,Tt,mt,be),Wt=new Rb(F,se,U),Ct=new vb(bt),Vt=new kA(D,T,it,ae,se,Oe,Ct),Ut=new h1(D,bt),Ft=new WA,me=new JA(ae),Yt=new pb(D,T,it,qt,vt,M,p),Ht=new e1(D,vt,se),W=new d1(F,be,se,qt),Bt=new gb(F,ae,be),$t=new bb(F,ae,be),be.programs=Vt.programs,D.capabilities=se,D.extensions=ae,D.properties=bt,D.renderLists=Ft,D.shadowMap=Ht,D.state=qt,D.info=be}wt();const ct=new u1(D,F);this.xr=ct,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const C=ae.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=ae.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return X},this.setPixelRatio=function(C){C!==void 0&&(X=C,this.setSize(z,K,!1))},this.getSize=function(C){return C.set(z,K)},this.setSize=function(C,Y,rt=!0){if(ct.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=C,K=Y,i.width=Math.floor(C*X),i.height=Math.floor(Y*X),rt===!0&&(i.style.width=C+"px",i.style.height=Y+"px"),this.setViewport(0,0,C,Y)},this.getDrawingBufferSize=function(C){return C.set(z*X,K*X).floor()},this.setDrawingBufferSize=function(C,Y,rt){z=C,K=Y,X=rt,i.width=Math.floor(C*rt),i.height=Math.floor(Y*rt),this.setViewport(0,0,C,Y)},this.getCurrentViewport=function(C){return C.copy(I)},this.getViewport=function(C){return C.copy(L)},this.setViewport=function(C,Y,rt,st){C.isVector4?L.set(C.x,C.y,C.z,C.w):L.set(C,Y,rt,st),qt.viewport(I.copy(L).multiplyScalar(X).round())},this.getScissor=function(C){return C.copy(tt)},this.setScissor=function(C,Y,rt,st){C.isVector4?tt.set(C.x,C.y,C.z,C.w):tt.set(C,Y,rt,st),qt.scissor(J.copy(tt).multiplyScalar(X).round())},this.getScissorTest=function(){return St},this.setScissorTest=function(C){qt.setScissorTest(St=C)},this.setOpaqueSort=function(C){ht=C},this.setTransparentSort=function(C){Et=C},this.getClearColor=function(C){return C.copy(Yt.getClearColor())},this.setClearColor=function(){Yt.setClearColor.apply(Yt,arguments)},this.getClearAlpha=function(){return Yt.getClearAlpha()},this.setClearAlpha=function(){Yt.setClearAlpha.apply(Yt,arguments)},this.clear=function(C=!0,Y=!0,rt=!0){let st=0;if(C){let k=!1;if(V!==null){const Rt=V.texture.format;k=Rt===Xd||Rt===kd||Rt===Vd}if(k){const Rt=V.texture.type,Nt=Rt===da||Rt===Cr||Rt===Zo||Rt===zs||Rt===Hd||Rt===Gd,Pt=Yt.getClearColor(),It=Yt.getClearAlpha(),ee=Pt.r,ne=Pt.g,Zt=Pt.b;Nt?(E[0]=ee,E[1]=ne,E[2]=Zt,E[3]=It,F.clearBufferuiv(F.COLOR,0,E)):(A[0]=ee,A[1]=ne,A[2]=Zt,A[3]=It,F.clearBufferiv(F.COLOR,0,A))}else st|=F.COLOR_BUFFER_BIT}Y&&(st|=F.DEPTH_BUFFER_BIT),rt&&(st|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(st)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){i.removeEventListener("webglcontextlost",xt,!1),i.removeEventListener("webglcontextrestored",Dt,!1),i.removeEventListener("webglcontextcreationerror",Lt,!1),Yt.dispose(),Ft.dispose(),me.dispose(),bt.dispose(),T.dispose(),it.dispose(),vt.dispose(),Oe.dispose(),W.dispose(),Vt.dispose(),ct.dispose(),ct.removeEventListener("sessionstart",ks),ct.removeEventListener("sessionend",Xs),Ri.stop()};function xt(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),q=!0}function Dt(){console.log("THREE.WebGLRenderer: Context Restored."),q=!1;const C=be.autoReset,Y=Ht.enabled,rt=Ht.autoUpdate,st=Ht.needsUpdate,k=Ht.type;wt(),be.autoReset=C,Ht.enabled=Y,Ht.autoUpdate=rt,Ht.needsUpdate=st,Ht.type=k}function Lt(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function te(C){const Y=C.target;Y.removeEventListener("dispose",te),We(Y)}function We(C){un(C),bt.remove(C)}function un(C){const Y=bt.get(C).programs;Y!==void 0&&(Y.forEach(function(rt){Vt.releaseProgram(rt)}),C.isShaderMaterial&&Vt.releaseShaderCache(C))}this.renderBufferDirect=function(C,Y,rt,st,k,Rt){Y===null&&(Y=Xt);const Nt=k.isMesh&&k.matrixWorld.determinant()<0,Pt=Ws(C,Y,rt,st,k);qt.setMaterial(st,Nt);let It=rt.index,ee=1;if(st.wireframe===!0){if(It=Tt.getWireframeAttribute(rt),It===void 0)return;ee=2}const ne=rt.drawRange,Zt=rt.attributes.position;let ye=ne.start*ee,xe=(ne.start+ne.count)*ee;Rt!==null&&(ye=Math.max(ye,Rt.start*ee),xe=Math.min(xe,(Rt.start+Rt.count)*ee)),It!==null?(ye=Math.max(ye,0),xe=Math.min(xe,It.count)):Zt!=null&&(ye=Math.max(ye,0),xe=Math.min(xe,Zt.count));const ke=xe-ye;if(ke<0||ke===1/0)return;Oe.setup(k,st,Pt,rt,It);let Ae,ie=Bt;if(It!==null&&(Ae=mt.get(It),ie=$t,ie.setIndex(Ae)),k.isMesh)st.wireframe===!0?(qt.setLineWidth(st.wireframeLinewidth*he()),ie.setMode(F.LINES)):ie.setMode(F.TRIANGLES);else if(k.isLine){let Qt=st.linewidth;Qt===void 0&&(Qt=1),qt.setLineWidth(Qt*he()),k.isLineSegments?ie.setMode(F.LINES):k.isLineLoop?ie.setMode(F.LINE_LOOP):ie.setMode(F.LINE_STRIP)}else k.isPoints?ie.setMode(F.POINTS):k.isSprite&&ie.setMode(F.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)ie.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if(ae.get("WEBGL_multi_draw"))ie.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const Qt=k._multiDrawStarts,fn=k._multiDrawCounts,Me=k._multiDrawCount,Bn=It?mt.get(It).bytesPerElement:1,gi=bt.get(st).currentProgram.getUniforms();for(let Ln=0;Ln<Me;Ln++)gi.setValue(F,"_gl_DrawID",Ln),ie.render(Qt[Ln]/Bn,fn[Ln])}else if(k.isInstancedMesh)ie.renderInstances(ye,ke,k.count);else if(rt.isInstancedBufferGeometry){const Qt=rt._maxInstanceCount!==void 0?rt._maxInstanceCount:1/0,fn=Math.min(rt.instanceCount,Qt);ie.renderInstances(ye,ke,fn)}else ie.render(ye,ke)};function Ee(C,Y,rt){C.transparent===!0&&C.side===la&&C.forceSinglePass===!1?(C.side=qn,C.needsUpdate=!0,je(C,Y,rt),C.side=Za,C.needsUpdate=!0,je(C,Y,rt),C.side=la):je(C,Y,rt)}this.compile=function(C,Y,rt=null){rt===null&&(rt=C),v=me.get(rt),v.init(Y),N.push(v),rt.traverseVisible(function(k){k.isLight&&k.layers.test(Y.layers)&&(v.pushLight(k),k.castShadow&&v.pushShadow(k))}),C!==rt&&C.traverseVisible(function(k){k.isLight&&k.layers.test(Y.layers)&&(v.pushLight(k),k.castShadow&&v.pushShadow(k))}),v.setupLights();const st=new Set;return C.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const Rt=k.material;if(Rt)if(Array.isArray(Rt))for(let Nt=0;Nt<Rt.length;Nt++){const Pt=Rt[Nt];Ee(Pt,rt,k),st.add(Pt)}else Ee(Rt,rt,k),st.add(Rt)}),N.pop(),v=null,st},this.compileAsync=function(C,Y,rt=null){const st=this.compile(C,Y,rt);return new Promise(k=>{function Rt(){if(st.forEach(function(Nt){bt.get(Nt).currentProgram.isReady()&&st.delete(Nt)}),st.size===0){k(C);return}setTimeout(Rt,10)}ae.get("KHR_parallel_shader_compile")!==null?Rt():setTimeout(Rt,10)})};let vn=null;function pi(C){vn&&vn(C)}function ks(){Ri.stop()}function Xs(){Ri.start()}const Ri=new Tv;Ri.setAnimationLoop(pi),typeof self<"u"&&Ri.setContext(self),this.setAnimationLoop=function(C){vn=C,ct.setAnimationLoop(C),C===null?Ri.stop():Ri.start()},ct.addEventListener("sessionstart",ks),ct.addEventListener("sessionend",Xs),this.render=function(C,Y){if(Y!==void 0&&Y.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(q===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),Y.parent===null&&Y.matrixWorldAutoUpdate===!0&&Y.updateMatrixWorld(),ct.enabled===!0&&ct.isPresenting===!0&&(ct.cameraAutoUpdate===!0&&ct.updateCamera(Y),Y=ct.getCamera()),C.isScene===!0&&C.onBeforeRender(D,C,Y,V),v=me.get(C,N.length),v.init(Y),N.push(v),ot.multiplyMatrices(Y.projectionMatrix,Y.matrixWorldInverse),Z.setFromProjectionMatrix(ot),At=this.localClippingEnabled,ft=Ct.init(this.clippingPlanes,At),S=Ft.get(C,P.length),S.init(),P.push(S),ct.enabled===!0&&ct.isPresenting===!0){const Rt=D.xr.getDepthSensingMesh();Rt!==null&&Ka(Rt,Y,-1/0,D.sortObjects)}Ka(C,Y,0,D.sortObjects),S.finish(),D.sortObjects===!0&&S.sort(ht,Et),Kt=ct.enabled===!1||ct.isPresenting===!1||ct.hasDepthSensing()===!1,Kt&&Yt.addToRenderList(S,C),this.info.render.frame++,ft===!0&&Ct.beginShadows();const rt=v.state.shadowsArray;Ht.render(rt,C,Y),ft===!0&&Ct.endShadows(),this.info.autoReset===!0&&this.info.reset();const st=S.opaque,k=S.transmissive;if(v.setupLights(),Y.isArrayCamera){const Rt=Y.cameras;if(k.length>0)for(let Nt=0,Pt=Rt.length;Nt<Pt;Nt++){const It=Rt[Nt];qs(st,k,C,It)}Kt&&Yt.render(C);for(let Nt=0,Pt=Rt.length;Nt<Pt;Nt++){const It=Rt[Nt];Lr(S,C,It,It.viewport)}}else k.length>0&&qs(st,k,C,Y),Kt&&Yt.render(C),Lr(S,C,Y);V!==null&&O===0&&(U.updateMultisampleRenderTarget(V),U.updateRenderTargetMipmap(V)),C.isScene===!0&&C.onAfterRender(D,C,Y),Oe.resetDefaultState(),w=-1,R=null,N.pop(),N.length>0?(v=N[N.length-1],ft===!0&&Ct.setGlobalState(D.clippingPlanes,v.state.camera)):v=null,P.pop(),P.length>0?S=P[P.length-1]:S=null};function Ka(C,Y,rt,st){if(C.visible===!1)return;if(C.layers.test(Y.layers)){if(C.isGroup)rt=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(Y);else if(C.isLight)v.pushLight(C),C.castShadow&&v.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||Z.intersectsSprite(C)){st&&zt.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ot);const Nt=vt.update(C),Pt=C.material;Pt.visible&&S.push(C,Nt,Pt,rt,zt.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||Z.intersectsObject(C))){const Nt=vt.update(C),Pt=C.material;if(st&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),zt.copy(C.boundingSphere.center)):(Nt.boundingSphere===null&&Nt.computeBoundingSphere(),zt.copy(Nt.boundingSphere.center)),zt.applyMatrix4(C.matrixWorld).applyMatrix4(ot)),Array.isArray(Pt)){const It=Nt.groups;for(let ee=0,ne=It.length;ee<ne;ee++){const Zt=It[ee],ye=Pt[Zt.materialIndex];ye&&ye.visible&&S.push(C,Nt,ye,rt,zt.z,Zt)}}else Pt.visible&&S.push(C,Nt,Pt,rt,zt.z,null)}}const Rt=C.children;for(let Nt=0,Pt=Rt.length;Nt<Pt;Nt++)Ka(Rt[Nt],Y,rt,st)}function Lr(C,Y,rt,st){const k=C.opaque,Rt=C.transmissive,Nt=C.transparent;v.setupLightsView(rt),ft===!0&&Ct.setGlobalState(D.clippingPlanes,rt),st&&qt.viewport(I.copy(st)),k.length>0&&Qa(k,Y,rt),Rt.length>0&&Qa(Rt,Y,rt),Nt.length>0&&Qa(Nt,Y,rt),qt.buffers.depth.setTest(!0),qt.buffers.depth.setMask(!0),qt.buffers.color.setMask(!0),qt.setPolygonOffset(!1)}function qs(C,Y,rt,st){if((rt.isScene===!0?rt.overrideMaterial:null)!==null)return;v.state.transmissionRenderTarget[st.id]===void 0&&(v.state.transmissionRenderTarget[st.id]=new wr(1,1,{generateMipmaps:!0,type:ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float")?$o:da,minFilter:Rr,samples:4,stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:we.workingColorSpace}));const Rt=v.state.transmissionRenderTarget[st.id],Nt=st.viewport||I;Rt.setSize(Nt.z*D.transmissionResolutionScale,Nt.w*D.transmissionResolutionScale);const Pt=D.getRenderTarget();D.setRenderTarget(Rt),D.getClearColor(ut),gt=D.getClearAlpha(),gt<1&&D.setClearColor(16777215,.5),D.clear(),Kt&&Yt.render(rt);const It=D.toneMapping;D.toneMapping=Ya;const ee=st.viewport;if(st.viewport!==void 0&&(st.viewport=void 0),v.setupLightsView(st),ft===!0&&Ct.setGlobalState(D.clippingPlanes,st),Qa(C,rt,st),U.updateMultisampleRenderTarget(Rt),U.updateRenderTargetMipmap(Rt),ae.has("WEBGL_multisampled_render_to_texture")===!1){let ne=!1;for(let Zt=0,ye=Y.length;Zt<ye;Zt++){const xe=Y[Zt],ke=xe.object,Ae=xe.geometry,ie=xe.material,Qt=xe.group;if(ie.side===la&&ke.layers.test(st.layers)){const fn=ie.side;ie.side=qn,ie.needsUpdate=!0,mi(ke,rt,st,Ae,ie,Qt),ie.side=fn,ie.needsUpdate=!0,ne=!0}}ne===!0&&(U.updateMultisampleRenderTarget(Rt),U.updateRenderTargetMipmap(Rt))}D.setRenderTarget(Pt),D.setClearColor(ut,gt),ee!==void 0&&(st.viewport=ee),D.toneMapping=It}function Qa(C,Y,rt){const st=Y.isScene===!0?Y.overrideMaterial:null;for(let k=0,Rt=C.length;k<Rt;k++){const Nt=C[k],Pt=Nt.object,It=Nt.geometry,ee=st===null?Nt.material:st,ne=Nt.group;Pt.layers.test(rt.layers)&&mi(Pt,Y,rt,It,ee,ne)}}function mi(C,Y,rt,st,k,Rt){C.onBeforeRender(D,Y,rt,st,k,Rt),C.modelViewMatrix.multiplyMatrices(rt.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),k.onBeforeRender(D,Y,rt,st,C,Rt),k.transparent===!0&&k.side===la&&k.forceSinglePass===!1?(k.side=qn,k.needsUpdate=!0,D.renderBufferDirect(rt,Y,st,k,C,Rt),k.side=Za,k.needsUpdate=!0,D.renderBufferDirect(rt,Y,st,k,C,Rt),k.side=la):D.renderBufferDirect(rt,Y,st,k,C,Rt),C.onAfterRender(D,Y,rt,st,k,Rt)}function je(C,Y,rt){Y.isScene!==!0&&(Y=Xt);const st=bt.get(C),k=v.state.lights,Rt=v.state.shadowsArray,Nt=k.state.version,Pt=Vt.getParameters(C,k.state,Rt,Y,rt),It=Vt.getProgramCacheKey(Pt);let ee=st.programs;st.environment=C.isMeshStandardMaterial?Y.environment:null,st.fog=Y.fog,st.envMap=(C.isMeshStandardMaterial?it:T).get(C.envMap||st.environment),st.envMapRotation=st.environment!==null&&C.envMap===null?Y.environmentRotation:C.envMapRotation,ee===void 0&&(C.addEventListener("dispose",te),ee=new Map,st.programs=ee);let ne=ee.get(It);if(ne!==void 0){if(st.currentProgram===ne&&st.lightsStateVersion===Nt)return Ii(C,Pt),ne}else Pt.uniforms=Vt.getUniforms(C),C.onBeforeCompile(Pt,D),ne=Vt.acquireProgram(Pt,It),ee.set(It,ne),st.uniforms=Pt.uniforms;const Zt=st.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Zt.clippingPlanes=Ct.uniform),Ii(C,Pt),st.needsLights=nu(C),st.lightsStateVersion=Nt,st.needsLights&&(Zt.ambientLightColor.value=k.state.ambient,Zt.lightProbe.value=k.state.probe,Zt.directionalLights.value=k.state.directional,Zt.directionalLightShadows.value=k.state.directionalShadow,Zt.spotLights.value=k.state.spot,Zt.spotLightShadows.value=k.state.spotShadow,Zt.rectAreaLights.value=k.state.rectArea,Zt.ltc_1.value=k.state.rectAreaLTC1,Zt.ltc_2.value=k.state.rectAreaLTC2,Zt.pointLights.value=k.state.point,Zt.pointLightShadows.value=k.state.pointShadow,Zt.hemisphereLights.value=k.state.hemi,Zt.directionalShadowMap.value=k.state.directionalShadowMap,Zt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,Zt.spotShadowMap.value=k.state.spotShadowMap,Zt.spotLightMatrix.value=k.state.spotLightMatrix,Zt.spotLightMap.value=k.state.spotLightMap,Zt.pointShadowMap.value=k.state.pointShadowMap,Zt.pointShadowMatrix.value=k.state.pointShadowMatrix),st.currentProgram=ne,st.uniformsList=null,ne}function yn(C){if(C.uniformsList===null){const Y=C.currentProgram.getUniforms();C.uniformsList=Vc.seqWithValue(Y.seq,C.uniforms)}return C.uniformsList}function Ii(C,Y){const rt=bt.get(C);rt.outputColorSpace=Y.outputColorSpace,rt.batching=Y.batching,rt.batchingColor=Y.batchingColor,rt.instancing=Y.instancing,rt.instancingColor=Y.instancingColor,rt.instancingMorph=Y.instancingMorph,rt.skinning=Y.skinning,rt.morphTargets=Y.morphTargets,rt.morphNormals=Y.morphNormals,rt.morphColors=Y.morphColors,rt.morphTargetsCount=Y.morphTargetsCount,rt.numClippingPlanes=Y.numClippingPlanes,rt.numIntersection=Y.numClipIntersection,rt.vertexAlphas=Y.vertexAlphas,rt.vertexTangents=Y.vertexTangents,rt.toneMapping=Y.toneMapping}function Ws(C,Y,rt,st,k){Y.isScene!==!0&&(Y=Xt),U.resetTextureUnits();const Rt=Y.fog,Nt=st.isMeshStandardMaterial?Y.environment:null,Pt=V===null?D.outputColorSpace:V.isXRRenderTarget===!0?V.texture.colorSpace:Bs,It=(st.isMeshStandardMaterial?it:T).get(st.envMap||Nt),ee=st.vertexColors===!0&&!!rt.attributes.color&&rt.attributes.color.itemSize===4,ne=!!rt.attributes.tangent&&(!!st.normalMap||st.anisotropy>0),Zt=!!rt.morphAttributes.position,ye=!!rt.morphAttributes.normal,xe=!!rt.morphAttributes.color;let ke=Ya;st.toneMapped&&(V===null||V.isXRRenderTarget===!0)&&(ke=D.toneMapping);const Ae=rt.morphAttributes.position||rt.morphAttributes.normal||rt.morphAttributes.color,ie=Ae!==void 0?Ae.length:0,Qt=bt.get(st),fn=v.state.lights;if(ft===!0&&(At===!0||C!==R)){const Ke=C===R&&st.id===w;Ct.setState(st,C,Ke)}let Me=!1;st.version===Qt.__version?(Qt.needsLights&&Qt.lightsStateVersion!==fn.state.version||Qt.outputColorSpace!==Pt||k.isBatchedMesh&&Qt.batching===!1||!k.isBatchedMesh&&Qt.batching===!0||k.isBatchedMesh&&Qt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&Qt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&Qt.instancing===!1||!k.isInstancedMesh&&Qt.instancing===!0||k.isSkinnedMesh&&Qt.skinning===!1||!k.isSkinnedMesh&&Qt.skinning===!0||k.isInstancedMesh&&Qt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&Qt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&Qt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&Qt.instancingMorph===!1&&k.morphTexture!==null||Qt.envMap!==It||st.fog===!0&&Qt.fog!==Rt||Qt.numClippingPlanes!==void 0&&(Qt.numClippingPlanes!==Ct.numPlanes||Qt.numIntersection!==Ct.numIntersection)||Qt.vertexAlphas!==ee||Qt.vertexTangents!==ne||Qt.morphTargets!==Zt||Qt.morphNormals!==ye||Qt.morphColors!==xe||Qt.toneMapping!==ke||Qt.morphTargetsCount!==ie)&&(Me=!0):(Me=!0,Qt.__version=st.version);let Bn=Qt.currentProgram;Me===!0&&(Bn=je(st,Y,k));let gi=!1,Ln=!1,mn=!1;const ze=Bn.getUniforms(),Nn=Qt.uniforms;if(qt.useProgram(Bn.program)&&(gi=!0,Ln=!0,mn=!0),st.id!==w&&(w=st.id,Ln=!0),gi||R!==C){qt.buffers.depth.getReversed()?(Mt.copy(C.projectionMatrix),WS(Mt),YS(Mt),ze.setValue(F,"projectionMatrix",Mt)):ze.setValue(F,"projectionMatrix",C.projectionMatrix),ze.setValue(F,"viewMatrix",C.matrixWorldInverse);const xn=ze.map.cameraPosition;xn!==void 0&&xn.setValue(F,dt.setFromMatrixPosition(C.matrixWorld)),se.logarithmicDepthBuffer&&ze.setValue(F,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(st.isMeshPhongMaterial||st.isMeshToonMaterial||st.isMeshLambertMaterial||st.isMeshBasicMaterial||st.isMeshStandardMaterial||st.isShaderMaterial)&&ze.setValue(F,"isOrthographic",C.isOrthographicCamera===!0),R!==C&&(R=C,Ln=!0,mn=!0)}if(k.isSkinnedMesh){ze.setOptional(F,k,"bindMatrix"),ze.setOptional(F,k,"bindMatrixInverse");const Ke=k.skeleton;Ke&&(Ke.boneTexture===null&&Ke.computeBoneTexture(),ze.setValue(F,"boneTexture",Ke.boneTexture,U))}k.isBatchedMesh&&(ze.setOptional(F,k,"batchingTexture"),ze.setValue(F,"batchingTexture",k._matricesTexture,U),ze.setOptional(F,k,"batchingIdTexture"),ze.setValue(F,"batchingIdTexture",k._indirectTexture,U),ze.setOptional(F,k,"batchingColorTexture"),k._colorsTexture!==null&&ze.setValue(F,"batchingColorTexture",k._colorsTexture,U));const An=rt.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&Wt.update(k,rt,Bn),(Ln||Qt.receiveShadow!==k.receiveShadow)&&(Qt.receiveShadow=k.receiveShadow,ze.setValue(F,"receiveShadow",k.receiveShadow)),st.isMeshGouraudMaterial&&st.envMap!==null&&(Nn.envMap.value=It,Nn.flipEnvMap.value=It.isCubeTexture&&It.isRenderTargetTexture===!1?-1:1),st.isMeshStandardMaterial&&st.envMap===null&&Y.environment!==null&&(Nn.envMapIntensity.value=Y.environmentIntensity),Ln&&(ze.setValue(F,"toneMappingExposure",D.toneMappingExposure),Qt.needsLights&&eu(Nn,mn),Rt&&st.fog===!0&&Ut.refreshFogUniforms(Nn,Rt),Ut.refreshMaterialUniforms(Nn,st,X,K,v.state.transmissionRenderTarget[C.id]),Vc.upload(F,yn(Qt),Nn,U)),st.isShaderMaterial&&st.uniformsNeedUpdate===!0&&(Vc.upload(F,yn(Qt),Nn,U),st.uniformsNeedUpdate=!1),st.isSpriteMaterial&&ze.setValue(F,"center",k.center),ze.setValue(F,"modelViewMatrix",k.modelViewMatrix),ze.setValue(F,"normalMatrix",k.normalMatrix),ze.setValue(F,"modelMatrix",k.matrixWorld),st.isShaderMaterial||st.isRawShaderMaterial){const Ke=st.uniformsGroups;for(let xn=0,Nr=Ke.length;xn<Nr;xn++){const In=Ke[xn];W.update(In,Bn),W.bind(In,Bn)}}return Bn}function eu(C,Y){C.ambientLightColor.needsUpdate=Y,C.lightProbe.needsUpdate=Y,C.directionalLights.needsUpdate=Y,C.directionalLightShadows.needsUpdate=Y,C.pointLights.needsUpdate=Y,C.pointLightShadows.needsUpdate=Y,C.spotLights.needsUpdate=Y,C.spotLightShadows.needsUpdate=Y,C.rectAreaLights.needsUpdate=Y,C.hemisphereLights.needsUpdate=Y}function nu(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return O},this.getRenderTarget=function(){return V},this.setRenderTargetTextures=function(C,Y,rt){bt.get(C.texture).__webglTexture=Y,bt.get(C.depthTexture).__webglTexture=rt;const st=bt.get(C);st.__hasExternalTextures=!0,st.__autoAllocateDepthBuffer=rt===void 0,st.__autoAllocateDepthBuffer||ae.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),st.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(C,Y){const rt=bt.get(C);rt.__webglFramebuffer=Y,rt.__useDefaultFramebuffer=Y===void 0};const nl=F.createFramebuffer();this.setRenderTarget=function(C,Y=0,rt=0){V=C,H=Y,O=rt;let st=!0,k=null,Rt=!1,Nt=!1;if(C){const It=bt.get(C);if(It.__useDefaultFramebuffer!==void 0)qt.bindFramebuffer(F.FRAMEBUFFER,null),st=!1;else if(It.__webglFramebuffer===void 0)U.setupRenderTarget(C);else if(It.__hasExternalTextures)U.rebindTextures(C,bt.get(C.texture).__webglTexture,bt.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Zt=C.depthTexture;if(It.__boundDepthTexture!==Zt){if(Zt!==null&&bt.has(Zt)&&(C.width!==Zt.image.width||C.height!==Zt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");U.setupDepthRenderbuffer(C)}}const ee=C.texture;(ee.isData3DTexture||ee.isDataArrayTexture||ee.isCompressedArrayTexture)&&(Nt=!0);const ne=bt.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(ne[Y])?k=ne[Y][rt]:k=ne[Y],Rt=!0):C.samples>0&&U.useMultisampledRTT(C)===!1?k=bt.get(C).__webglMultisampledFramebuffer:Array.isArray(ne)?k=ne[rt]:k=ne,I.copy(C.viewport),J.copy(C.scissor),$=C.scissorTest}else I.copy(L).multiplyScalar(X).floor(),J.copy(tt).multiplyScalar(X).floor(),$=St;if(rt!==0&&(k=nl),qt.bindFramebuffer(F.FRAMEBUFFER,k)&&st&&qt.drawBuffers(C,k),qt.viewport(I),qt.scissor(J),qt.setScissorTest($),Rt){const It=bt.get(C.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+Y,It.__webglTexture,rt)}else if(Nt){const It=bt.get(C.texture),ee=Y;F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,It.__webglTexture,rt,ee)}else if(C!==null&&rt!==0){const It=bt.get(C.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,It.__webglTexture,rt)}w=-1},this.readRenderTargetPixels=function(C,Y,rt,st,k,Rt,Nt){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pt=bt.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Nt!==void 0&&(Pt=Pt[Nt]),Pt){qt.bindFramebuffer(F.FRAMEBUFFER,Pt);try{const It=C.texture,ee=It.format,ne=It.type;if(!se.textureFormatReadable(ee)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!se.textureTypeReadable(ne)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}Y>=0&&Y<=C.width-st&&rt>=0&&rt<=C.height-k&&F.readPixels(Y,rt,st,k,oe.convert(ee),oe.convert(ne),Rt)}finally{const It=V!==null?bt.get(V).__webglFramebuffer:null;qt.bindFramebuffer(F.FRAMEBUFFER,It)}}},this.readRenderTargetPixelsAsync=async function(C,Y,rt,st,k,Rt,Nt){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pt=bt.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Nt!==void 0&&(Pt=Pt[Nt]),Pt){const It=C.texture,ee=It.format,ne=It.type;if(!se.textureFormatReadable(ee))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!se.textureTypeReadable(ne))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(Y>=0&&Y<=C.width-st&&rt>=0&&rt<=C.height-k){qt.bindFramebuffer(F.FRAMEBUFFER,Pt);const Zt=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Zt),F.bufferData(F.PIXEL_PACK_BUFFER,Rt.byteLength,F.STREAM_READ),F.readPixels(Y,rt,st,k,oe.convert(ee),oe.convert(ne),0);const ye=V!==null?bt.get(V).__webglFramebuffer:null;qt.bindFramebuffer(F.FRAMEBUFFER,ye);const xe=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await qS(F,xe,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Zt),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,Rt),F.deleteBuffer(Zt),F.deleteSync(xe),Rt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(C,Y=null,rt=0){C.isTexture!==!0&&(As("WebGLRenderer: copyFramebufferToTexture function signature has changed."),Y=arguments[0]||null,C=arguments[1]);const st=Math.pow(2,-rt),k=Math.floor(C.image.width*st),Rt=Math.floor(C.image.height*st),Nt=Y!==null?Y.x:0,Pt=Y!==null?Y.y:0;U.setTexture2D(C,0),F.copyTexSubImage2D(F.TEXTURE_2D,rt,0,0,Nt,Pt,k,Rt),qt.unbindTexture()};const Ja=F.createFramebuffer(),Ys=F.createFramebuffer();this.copyTextureToTexture=function(C,Y,rt=null,st=null,k=0,Rt=null){C.isTexture!==!0&&(As("WebGLRenderer: copyTextureToTexture function signature has changed."),st=arguments[0]||null,C=arguments[1],Y=arguments[2],Rt=arguments[3]||0,rt=null),Rt===null&&(k!==0?(As("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Rt=k,k=0):Rt=0);let Nt,Pt,It,ee,ne,Zt,ye,xe,ke;const Ae=C.isCompressedTexture?C.mipmaps[Rt]:C.image;if(rt!==null)Nt=rt.max.x-rt.min.x,Pt=rt.max.y-rt.min.y,It=rt.isBox3?rt.max.z-rt.min.z:1,ee=rt.min.x,ne=rt.min.y,Zt=rt.isBox3?rt.min.z:0;else{const An=Math.pow(2,-k);Nt=Math.floor(Ae.width*An),Pt=Math.floor(Ae.height*An),C.isDataArrayTexture?It=Ae.depth:C.isData3DTexture?It=Math.floor(Ae.depth*An):It=1,ee=0,ne=0,Zt=0}st!==null?(ye=st.x,xe=st.y,ke=st.z):(ye=0,xe=0,ke=0);const ie=oe.convert(Y.format),Qt=oe.convert(Y.type);let fn;Y.isData3DTexture?(U.setTexture3D(Y,0),fn=F.TEXTURE_3D):Y.isDataArrayTexture||Y.isCompressedArrayTexture?(U.setTexture2DArray(Y,0),fn=F.TEXTURE_2D_ARRAY):(U.setTexture2D(Y,0),fn=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,Y.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,Y.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,Y.unpackAlignment);const Me=F.getParameter(F.UNPACK_ROW_LENGTH),Bn=F.getParameter(F.UNPACK_IMAGE_HEIGHT),gi=F.getParameter(F.UNPACK_SKIP_PIXELS),Ln=F.getParameter(F.UNPACK_SKIP_ROWS),mn=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,Ae.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Ae.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,ee),F.pixelStorei(F.UNPACK_SKIP_ROWS,ne),F.pixelStorei(F.UNPACK_SKIP_IMAGES,Zt);const ze=C.isDataArrayTexture||C.isData3DTexture,Nn=Y.isDataArrayTexture||Y.isData3DTexture;if(C.isDepthTexture){const An=bt.get(C),Ke=bt.get(Y),xn=bt.get(An.__renderTarget),Nr=bt.get(Ke.__renderTarget);qt.bindFramebuffer(F.READ_FRAMEBUFFER,xn.__webglFramebuffer),qt.bindFramebuffer(F.DRAW_FRAMEBUFFER,Nr.__webglFramebuffer);for(let In=0;In<It;In++)ze&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,bt.get(C).__webglTexture,k,Zt+In),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,bt.get(Y).__webglTexture,Rt,ke+In)),F.blitFramebuffer(ee,ne,Nt,Pt,ye,xe,Nt,Pt,F.DEPTH_BUFFER_BIT,F.NEAREST);qt.bindFramebuffer(F.READ_FRAMEBUFFER,null),qt.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(k!==0||C.isRenderTargetTexture||bt.has(C)){const An=bt.get(C),Ke=bt.get(Y);qt.bindFramebuffer(F.READ_FRAMEBUFFER,Ja),qt.bindFramebuffer(F.DRAW_FRAMEBUFFER,Ys);for(let xn=0;xn<It;xn++)ze?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,An.__webglTexture,k,Zt+xn):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,An.__webglTexture,k),Nn?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Ke.__webglTexture,Rt,ke+xn):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Ke.__webglTexture,Rt),k!==0?F.blitFramebuffer(ee,ne,Nt,Pt,ye,xe,Nt,Pt,F.COLOR_BUFFER_BIT,F.NEAREST):Nn?F.copyTexSubImage3D(fn,Rt,ye,xe,ke+xn,ee,ne,Nt,Pt):F.copyTexSubImage2D(fn,Rt,ye,xe,ee,ne,Nt,Pt);qt.bindFramebuffer(F.READ_FRAMEBUFFER,null),qt.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else Nn?C.isDataTexture||C.isData3DTexture?F.texSubImage3D(fn,Rt,ye,xe,ke,Nt,Pt,It,ie,Qt,Ae.data):Y.isCompressedArrayTexture?F.compressedTexSubImage3D(fn,Rt,ye,xe,ke,Nt,Pt,It,ie,Ae.data):F.texSubImage3D(fn,Rt,ye,xe,ke,Nt,Pt,It,ie,Qt,Ae):C.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,Rt,ye,xe,Nt,Pt,ie,Qt,Ae.data):C.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,Rt,ye,xe,Ae.width,Ae.height,ie,Ae.data):F.texSubImage2D(F.TEXTURE_2D,Rt,ye,xe,Nt,Pt,ie,Qt,Ae);F.pixelStorei(F.UNPACK_ROW_LENGTH,Me),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Bn),F.pixelStorei(F.UNPACK_SKIP_PIXELS,gi),F.pixelStorei(F.UNPACK_SKIP_ROWS,Ln),F.pixelStorei(F.UNPACK_SKIP_IMAGES,mn),Rt===0&&Y.generateMipmaps&&F.generateMipmap(fn),qt.unbindTexture()},this.copyTextureToTexture3D=function(C,Y,rt=null,st=null,k=0){return C.isTexture!==!0&&(As("WebGLRenderer: copyTextureToTexture3D function signature has changed."),rt=arguments[0]||null,st=arguments[1]||null,C=arguments[2],Y=arguments[3],k=arguments[4]||0),As('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,Y,rt,st,k)},this.initRenderTarget=function(C){bt.get(C).__webglFramebuffer===void 0&&U.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?U.setTextureCube(C,0):C.isData3DTexture?U.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?U.setTexture2DArray(C,0):U.setTexture2D(C,0),qt.unbindTexture()},this.resetState=function(){H=0,O=0,V=null,qt.reset(),Oe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ua}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const i=this.getContext();i.drawingBufferColorspace=we._getDrawingBufferColorSpace(t),i.unpackColorSpace=we._getUnpackColorSpace()}}function m1(s){s.traverse(t=>{var i;if(t.geometry&&t.geometry.dispose(),t.material){const r=Array.isArray(t.material)?t.material:[t.material];for(const l of r){for(const c of Object.keys(l)){const d=l[c];d&&d.isTexture&&d.dispose()}(i=l.dispose)==null||i.call(l)}}})}function g1(s,t={}){let i;t.lookWorld&&t.lookWorld.isVector3?i=t.lookWorld.clone():i=new Q(0,-2.95,-8);const r=typeof t.cameraLiftY=="number"?t.cameraLiftY:72,l=typeof t.frustumHalfH=="number"?t.frustumHalfH:26,c=typeof t.bottomTrim=="number"?t.bottomTrim:4,d=new gM,h=new DM(16774637,.9),p=new wM(16777215,.52);p.position.set(.06,1,-.1).normalize(),d.add(h,p);const m=new p1({antialias:!1,alpha:!1,powerPreference:"high-performance"});m.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),m.sortObjects=!0,m.domElement.style.display="block",m.domElement.style.width="100%",m.domElement.style.height="100%",s.innerHTML="",s.appendChild(m.domElement);let g;const _=()=>{const M=s.getBoundingClientRect(),E=Math.max(1,Math.floor(M.width)),A=Math.max(1,Math.floor(M.height));m.setSize(E,A,!1);const S=E/A,v=l,P=v*S,N=-v;g?(g.left=-P,g.right=P,g.top=v,g.bottom=N+c,g.updateProjectionMatrix()):(g=new Kd(-P,P,v,N+c,.4,220),g.position.copy(i).add(new Q(0,r,0)),g.lookAt(i))};_();let x=null;return typeof ResizeObserver<"u"?(x=new ResizeObserver(()=>_()),x.observe(s)):window.addEventListener("resize",_),{scene:d,get camera(){return g},renderer:m,dispose:()=>{x?x.disconnect():window.removeEventListener("resize",_),m1(d),m.dispose(),m.domElement.parentElement&&m.domElement.remove()}}}function _1(){const s=document.createElement("canvas");s.width=256,s.height=256;const t=s.getContext("2d");if(t){t.fillStyle="#0a0a0a",t.fillRect(0,0,256,256),t.strokeStyle="#220a05",t.lineWidth=2,t.lineCap="round";for(let d=0;d<8;d++){const h=20+d*32,p=d%2*30;t.beginPath(),t.moveTo(p,h),t.quadraticCurveTo(p+40,h-15,p+80,h),t.quadraticCurveTo(p+120,h+15,p+160,h),t.quadraticCurveTo(p+200,h-15,p+240,h),t.stroke()}}const i=new xM(s);i.wrapS=i.wrapT=qc,i.repeat.set(10,10);const r=new Ur(160,160),l=new zi({map:i}),c=new cn(r,l);return c.rotation.x=-Math.PI/2,c.position.set(0,-6.8,-6),c.name="lq-sea-sketch",c}const v1=20,y1=-6.5,kc=32,Qo=Object.freeze({x:0,y:-3.03,z:-4});let Xc=Qo.y;function x1(s){Xc=s}function S1(s,t){return(s.top-s.bottom)/Math.max(t,1)}function P0(s,t,i=kc){var l,c;const r=Math.max(24,Math.floor(((c=(l=s==null?void 0:s.getBoundingClientRect)==null?void 0:l.call(s))==null?void 0:c.height)??560));return 2*i/r*t}function Jo(s){return v1+s*y1}const M1=3.4;function Kc(s){const t=Oi.clamp(Math.floor(s),0,7);return t>=7?0:(t%2===0?1:-1)*M1}const qa=5.5;function E1(s){return new zi({color:s?65535:16777215,depthTest:!1,depthWrite:!1,transparent:!1})}function T1(){return new zi({color:0,depthTest:!1,depthWrite:!1,transparent:!1})}function b1(s,t,i=.06){var d;const r=[],c=new AM;for(let h=0;h<t.length;h++){const p=new fa;p.name=`lq-p-group-${h}`,p.position.y=h*.001;const m=((d=t[h])==null?void 0:d.sprite_url)??"";if(m){const g=i*2,_=c.load(m),x=new zi({map:_,transparent:!0,alphaTest:.1,depthTest:!1,depthWrite:!1}),M=new Ur(g,g),E=new cn(M,x);if(E.renderOrder=h*10+11,p.add(E),h===0){const A=new Rs(i*2.2,48),S=new zi({color:65535,transparent:!0,opacity:.5,depthTest:!1,depthWrite:!1}),v=new cn(A,S);v.position.y=-.02,p.add(v)}}else{const g=new Rs(i*1.1,48),_=new cn(g,T1());_.position.y=-.005,_.renderOrder=h*10+10,p.add(_);const x=h===0?i*1.1:i,M=new Rs(x,48),E=new cn(M,E1(h===0));if(E.renderOrder=h*10+11,p.add(E),h===0){const A=new Rs(i*2.2,48),S=new zi({color:65535,transparent:!0,opacity:.5,depthTest:!1,depthWrite:!1}),v=new cn(A,S);v.position.y=-.02,p.add(v)}}p.rotation.x=-Math.PI/2,p.renderOrder=h===0?32e3:18e3+h*2,p.visible=!1,s.add(p),r.push(p)}return r}function A1(s){const t=Math.max(0,Math.floor(s));if(t===0)return[0,0,0];const i=Math.ceil(t/3),r=t-i,l=Math.ceil(r/2),c=t-i-l;return[i,l,c]}function R1(s){const[t,i,r]=A1(s.length),l=s.slice(0,t),c=s.slice(t,t+i),d=s.slice(t+i,t+i+r);return[l,c,d]}function Xo(s,t,i){const r={};return[...s].sort((d,h)=>d===0&&h!==0?-1:h===0&&d!==0?1:d-h).forEach((d,h)=>{const p=Oi.clamp(t,0,7),m=Jo(p)+qa,g=Kc(p),x=h%2===0,M=Math.floor(h/2),E=.24,A=15,S=(M%A-(A-1)*.5)*E,v=x?.24:-.24,P=d*137%100/1e3-.05;r[d]={x:g+S+P+(d===0?.1:0),y:-5.74+(d===0?.05:0),z:m+v}}),r}function C1(s,t,i,r){const l=Xo(t,i);for(const c of t){const d=s[c],h=l[c];!h||!d||(d.position.set(h.x,h.y,h.z),d.rotation.x=-Math.PI/2,d.visible=!0)}}const w1=-5.74;function D1(s,t){for(const i of t){const r=s[i];if(!r)continue;const l=[...t].sort((m,g)=>m-g).indexOf(i),c=(i*7919+l*127>>>0)%9973/9973,d=((i+l*17)*1237>>>0)%9833/9833,h=-8.2+c*16.4,p=6.8+d*11.5+qa;r.position.set(h,w1+.05,p),r.rotation.x=-Math.PI/2,r.visible=!0}}async function U1(s,t,i={}){const r=i.hops??5,l=i.durMs??150,c=i.ease??Dv,d=i.seed??0,h=new Q(t.x,t.y,t.z),p=s.position.clone();for(let m=0;m<r;m++){const g=m===r-1;let _;if(g)_=h;else{const x=(m+1)/r,M=((d+m*911)*2654435761>>>0)%1e3/1e3-.5,E=((d+m*337)*1597334677>>>0)%1e3/1e3-.5;_=p.clone().lerp(h,x).add(new Q(M*2.9,0,E*2.1)),_.y+=.15+m%3*.04}await qo(s,{x:_.x,y:_.y,z:_.z},l+m*9,c),s.parent&&wv(s.parent,_)}}function qo(s,t,i,r=Dv){const l=s.position.clone(),c=t,d=performance.now();return new Promise(h=>{function p(m){const g=r(Math.min(1,(m-d)/i));s.position.x=Oi.lerp(l.x,c.x,g),s.position.y=Oi.lerp(l.y,c.y,g),s.position.z=Oi.lerp(l.z,c.z,g),g>=1?h():requestAnimationFrame(p)}requestAnimationFrame(p)})}function L1(s,t,i,r,l){const c=s.zoom,d=s.position.clone(),h=new Q(Qo.x,Xc,Qo.z),p=performance.now();return new Promise(m=>{function g(_){const x=Math.min(1,(_-p)/r),M=1-(1-x)*(1-x);s.zoom=Oi.lerp(c,t,M);const E=h.clone().lerp(new Q(i.x,Xc,i.z),M),A=Math.sin(x*Math.PI)*2.8;E.z+=A,s.position.x=Oi.lerp(d.x,E.x,M),s.position.z=Oi.lerp(d.z,E.z+72,M),s.lookAt(E.x,Xc,E.z),s.updateProjectionMatrix(),x>=1?m():requestAnimationFrame(g)}requestAnimationFrame(g)})}function wv(s,t){const r=new fa,l=new zi({color:16777215,transparent:!0,opacity:.6}),c=new Ur(.25,.25);for(let h=0;h<8;h++){let A=function(){const S=Math.min(1,(performance.now()-M)/E);p.position.x=Oi.lerp(t.x,_,S),p.position.z=Oi.lerp(t.z,x,S),p.material.opacity=.6*(1-S),p.scale.setScalar(1-S*.5),S<1?requestAnimationFrame(A):(r.remove(p),p.geometry.dispose(),p.material.dispose())};var d=A;const p=new cn(c,l.clone());p.position.set(t.x,t.y+.1,t.z),p.rotation.x=-Math.PI/2,r.add(p);const m=Math.random()*Math.PI*2,g=.5+Math.random()*.8,_=t.x+Math.cos(m)*g,x=t.z+Math.sin(m)*g,M=performance.now(),E=400+Math.random()*300;requestAnimationFrame(A)}s.add(r),setTimeout(()=>s.remove(r),1e3)}function Dv(s){return 1-(1-s)*(1-s)}function N1(s,t){const i=((s+911>>>3^t*17489^s*31337)>>>0)%9973/9973,r=(s*7919+t*793>>>0^9277)%9833/9833,l=(-12+i*24)*1.05,c=(r-.5)*4.8;return new Q(l,-.1-r*.24,c*.32)}function O1(){const s=new fa;s.name="lq-bridge";const t=new Uh({color:1706501,shininess:30,specular:3346688,emissive:2230784}),i=new zi({color:16729088,transparent:!0,opacity:.8}),r=new Uh({color:4863784,shininess:10}),l=new Uh({color:16763904,shininess:100,specular:16777215,emissive:4465152}),c=[];for(let p=0;p<7;p++){const m=Kc(p),g=Jo(p)+qa,_=new cn(new Yd(1.7,1.8,.6,24),t);_.receiveShadow=!0,_.position.set(m,-6.1,g),_.name=`lq-step-${p}`,s.add(_),c.push(_);const x=new cn(new Zd(1.85,.08,8,32),i);x.rotation.x=Math.PI/2,x.position.copy(_.position),x.position.y+=.35,s.add(x)}const d=Jo(7.8)+qa,h=new cn(new Dr(13,1.55,10.5),l);h.position.set(.15,-5.55,d),h.name="lq-treasure-island",s.add(h);for(let p=-1;p<=1;p++){const m=p===0?l:r,g=new cn(new Dr(2.35,2.05,1.75),m);g.position.set(p*2.35,-4.4,d-.45+Math.abs(p)*.18),s.add(g)}return{group:s,steps:c,island:h}}const z1=7,Sr=43.8,B0=-6,hi=-5.64,P1=9,B1=-32,I1=-23;function Hh(s,t){for(let i=1;i<t.length;i++)s.push(t[i-1].x,t[i-1].y,t[i-1].z,t[i].x,t[i].y,t[i].z)}function F1(){const s=new fa;s.name="lq-arena-map";const t=new Sv({color:16775124,transparent:!0,opacity:.8,depthWrite:!1,depthTest:!0}),i=t.clone();i.opacity=.42,i.color.setHex(16773608);const r=B0-Sr,l=B0+Sr,c=[new Q(-Sr,hi,r),new Q(Sr,hi,r),new Q(Sr,hi,l),new Q(-Sr,hi,l),new Q(-Sr,hi,r)],d=[];Hh(d,c);const h=new Wn;h.setAttribute("position",new nn(new Float32Array(d),3));const p=new Dh(h,i);p.renderOrder=-3,s.add(p);const m=P1,g=B1+qa,_=I1+qa,x=[new Q(-m,hi,g),new Q(m,hi,g),new Q(m,hi,_),new Q(-m,hi,_),new Q(-m,hi,g)],M=[];Hh(M,x);const E=new Wn;E.setAttribute("position",new nn(new Float32Array(M),3));const A=new Dh(E,t.clone());A.material.opacity=.52,A.material.color.setHex(16771242),A.renderOrder=-3,s.add(A);const S=[];for(let D=0;D<z1;D++){const q=Jo(D)+qa;S.push(new Q(Kc(D),hi,q))}S.push(new Q(Kc(7),hi,Jo(7)+qa));const v=[];Hh(v,S);const P=new Wn;P.setAttribute("position",new nn(new Float32Array(v),3));const N=new Dh(P,t.clone());return N.material.color.setHex(16773058),N.material.opacity=.94,N.renderOrder=-2,s.add(N),s}const zd=.52,ka=s=>Math.max(12,Math.round(s*zd));function H1(s){return s*s}function G1(s){return 1-(1-Math.min(1,Math.max(0,s)))**3}function I0(s){return 1-(1-s)*(1-s)}const V1=2.85,k1=5.86,X1=0;function Pc(s,t,i,r={}){const l=P0(s,150,kc),c=V1+l,d=P0(s,X1,kc),h=new Q(Qo.x,c-k1,Qo.z-d);x1(h.y);const p=g1(s,{lookWorld:h,cameraLiftY:72,frustumHalfH:kc,bottomTrim:0}),m=new fa;m.name="lq-world-root",m.position.y=c,p.scene.add(m);const g=_1();m.add(g);const _=O1();m.add(_.group),m.traverse(w=>{w.isMesh&&(w.renderOrder=0)}),m.add(F1());const x=p.camera,M=Math.max(1,p.renderer.domElement.height),A=S1(x,M)*3.85,S=b1(m,t,A),v=new Set(i),P=new Set;let N=Number.isFinite(r==null?void 0:r.playerClears)?r.playerClears:0,D=null;function q(){p.renderer.render(p.scene,p.camera),D=requestAnimationFrame(q)}q();function H(){C1(S,v,N);for(let w=0;w<S.length;w++)v.has(w)||(S[w].visible=P.has(w))}let O=Promise.resolve();if(r!=null&&r.fleaIntro){D1(S,v);for(let w=0;w<S.length;w++)v.has(w)||(S[w].visible=P.has(w));O=(async()=>{const w=Xo(v,N),I=[...v].sort((J,$)=>J-$).map(J=>{const $=S[J],ut=w[J];if(!ut||!$)return Promise.resolve();const gt=Math.floor((J*53+(J>>>2)*17)%260*zd);return hc(gt).then(()=>U1($,ut,{hops:4,durMs:ka(142),seed:J*997+13}))});await Promise.all(I),H()})()}else H();async function V(w,R){const I=Math.max(0,R-1);if(v.has(0)){const X=Xo(v,I)[0],ht=Xo(v,R)[0],Et=S[0];X&&ht&&Et&&(Et.position.set(X.x,X.y,X.z),await Promise.all([qo(Et,{x:ht.x,y:ht.y,z:ht.z},ka(450),I0),L1(p.camera,2,ht,ka(450))]),wv(p.scene,ht),await hc(ka(200)))}N=R;let J=0,$=0;const ut=new Set;for(const X of w){const ht=Number(X.idx);if(!Number.isFinite(ht)||ht<=0||ut.has(ht)||!v.has(ht))continue;ut.add(ht);const Et=Math.max(0,Number(X.delay_ms)||0),L=Math.max(0,Math.floor((Et-J)*zd));J=Et,await hc(L);const tt=S[ht],St=N1(ht,$);$+=1;const Z=tt.position.clone().add(St);await qo(tt,Z,ka(480),G1),v.delete(ht),P.add(ht);const ft=tt.material;ft&&"color"in ft&&ft.color.setHex(6974058),tt.visible=!0}const gt=[...v].sort((X,ht)=>X===0&&ht!==0?-1:ht===0&&X!==0?1:X-ht),z=Xo(v,R),K=R1(gt);for(const X of K){if(X.length===0)continue;const ht=X.map(Et=>{const L=z[Et],tt=S[Et];return!L||!tt?Promise.resolve():qo(tt,{x:L.x,y:L.y,z:L.z},ka(360),I0)});await Promise.all(ht),await hc(ka(150))}H()}return{fleaIntroPromise:O,getPlayerClears:()=>N,updatePlayerClears(w){N=w,H()},repositionAll(w,R){v.clear(),P.clear();for(const I of w)v.add(I);N=R,H()},playClearSuccessAnimation:V,async animateSelfEliminate(w){if(!v.has(0))return;w==null||w();const R=S[0];await Promise.all([qo(R,{x:R.position.x+1.1,y:R.position.y-9.35,z:R.position.z-3.6},ka(900),H1)]),R.visible=!1,v.delete(0),H()},getAliveClone(){return new Set(v)},disposeScene(){cancelAnimationFrame(D);try{p.dispose()}catch{}}}}function F0(s){const t=r=>r.eliminated?r.clears>0?[1,r.clears,r.eliminationLevel??0,-r.index]:[0,r.eliminationLevel??0,r.atLevelWhenFailed??0,-r.index]:[2,r.clears,-r.index],i=[...s];return i.sort((r,l)=>{const c=t(r),d=t(l);for(let h=0;h<Math.max(c.length,d.length);h++){const p=c[h]??0,m=d[h]??0;if(p!==m)return m-p}return r.index-l.index}),i}const q1=["screen-matching","screen-lobby","screen-attempt","screen-clear","screen-fail","screen-full-clear","screen-ranking","screen-reward"];function W1(){q1.forEach(s=>{var t;(t=document.getElementById(s))==null||t.classList.add("hidden")})}function ni(s){var i,r;W1(),(i=document.getElementById("toast"))==null||i.classList.add("hidden");const t=document.getElementById(s);if(!t){console.error("[LQ] missing screen element:",s),(r=document.getElementById("screen-lobby"))==null||r.classList.remove("hidden");return}t.classList.remove("hidden")}function Dn(s,t,i=2200){const r=document.getElementById("toast");r&&(r.textContent=t,r.classList.remove("hidden"),window.clearTimeout(Dn._t),Dn._t=window.setTimeout(()=>r.classList.add("hidden"),i))}function Y1(s,t=7){return`${s}/${t}`}function Z1(s,t=100){return`${s}/${t}`}function j1(s){const t=typeof s=="number"?s:Number.parseInt(String(s).replace(/,/g,""),10);return Number.isFinite(t)?t.toLocaleString("ko-KR"):String(s)}function H0(s,t){const i=Z1(t);s.statPlayers&&(s.statPlayers.textContent=i),s.attemptPlayers&&(s.attemptPlayers.textContent=i),s.attemptPlayersAlive&&(s.attemptPlayersAlive.textContent=i),s.clearPlayers&&(s.clearPlayers.textContent=i)}function K1(s,t){const i=Y1(t);s.statLevels&&(s.statLevels.textContent=i),s.attemptLevelNum&&(s.attemptLevelNum.textContent=i),s.clearLevels&&(s.clearLevels.textContent=i)}async function G0(s=1){for(let t=0;t<s;t++)await new Promise(i=>requestAnimationFrame(()=>i()))}function Q1(s){const t=s.attemptFlash;t&&(t.style.transition="none",t.style.opacity="0",requestAnimationFrame(()=>{t.style.transition="opacity 520ms ease",t.style.opacity="0.55",window.setTimeout(()=>{t.style.opacity="0"},520)}))}function J1(s){const t=s.attemptFlash;t&&(t.classList.add("lq-flash-overlay--success"),t.style.transition="none",t.style.opacity="0",requestAnimationFrame(()=>{t.style.transition="opacity 400ms ease-out",t.style.opacity="1",window.setTimeout(()=>{t.style.opacity="0",window.setTimeout(()=>{t.classList.remove("lq-flash-overlay--success")},400)},150)}))}function $1(s){const t=new Map;for(const i of s){const r=Math.trunc(Number(i.level));if(!r||r<1||r>7)continue;const l={reward_type:String(i.reward_type||"gold").toLowerCase(),reward_amount:Number(i.reward_amount)||0,reward_param:String(i.reward_param||"").trim(),reward_icon:String(i.reward_icon||"🎁").trim(),reward_label:String(i.reward_label||"").trim()},c=t.get(r)??[];c.push(l),t.set(r,c)}return t}function tR(s){return s.map(t=>({kind:t.reward_type==="equip"?"equip":t.reward_type==="gem"?"gem":t.reward_type==="lightning"?"lightning":"gold",amount:t.reward_amount,slotId:t.reward_type==="equip"&&t.reward_param||void 0}))}function eR(s){typeof window>"u"||window.parent===window||s.length&&window.parent.postMessage({type:"event:grant",rewards:tR(s)},"*")}function nR(s){return{kind:s.reward_type==="equip"?"equip":s.reward_type==="gem"?"gem":s.reward_type==="lightning"?"lightning":"gold",slotId:s.reward_type==="equip"&&s.reward_param||void 0,label:s.reward_label||void 0,icon:s.reward_icon||"🎁",amount:s.reward_amount||void 0}}function iR(s){typeof window>"u"||window.parent===window||window.parent.postMessage({type:"event:showRewardDetail",...nR(s)},"*")}function Gh(s,t,i={}){if(!s)return;if(s.innerHTML="",!t.length){s.textContent="—";return}const r=l=>{const c=String(l).toLowerCase();return c.includes("gold")?"/event/tycoonSeason/assets/reward_gold.png":c.includes("gem")||c.includes("diamond")?"/event/tycoonSeason/assets/reward_gem.png":c.includes("lightning")||c.includes("energy")||c.includes("ticket")?"/event/tycoonSeason/assets/reward_energy.png":c.includes("dna")||c.includes("evolution")?"/event/tycoonSeason/assets/reward_dna.png":c.includes("equip")||c.includes("box")||c.includes("chest")?"/event/tycoonSeason/assets/reward_lock.png":null};t.forEach(l=>{const c=document.createElement("button");c.type="button",c.className=i.compact?"lq-reward-card lq-reward-card--compact":"lq-reward-card",c.title="보상 정보";const d=r(l.reward_type);if(d){const p=document.createElement("img");p.src=d,p.className="reward-card-img",p.alt=l.reward_type,c.appendChild(p)}else{const p=document.createElement("span");p.className="reward-card-emoji",p.textContent=l.reward_icon||"🎁",c.appendChild(p)}const h=document.createElement("span");h.className="reward-card-text",h.textContent=l.reward_label||`${l.reward_amount}`,c.appendChild(h),c.addEventListener("click",p=>{p.stopPropagation(),iR(l)}),s.appendChild(c)})}function aR(s,t,i={}){const r=[...s.botConfigRaw].sort((ot,dt)=>jh(ot.bot_id)-jh(dt.bot_id)),l=i.persisted;let c=l&&(l.version===1||l.version===Yh)&&Array.isArray(l.aliveIds)&&Array.isArray(l.clearsForRank)&&l.clearsForRank.length===r.length,d=new Set(c?l.aliveIds.map(ot=>Math.trunc(Number(ot))).filter(ot=>Number.isFinite(ot)&&ot>=0&&ot<r.length):r.map((ot,dt)=>dt));c&&d.size===0&&(c=!1,d=new Set(r.map((ot,dt)=>dt)));let h=c?Math.min(7,Math.max(0,Number(l.clearsCompleted)||0)):0;const p=c?l.clearsForRank.map(ot=>Math.max(0,Math.floor(Number(ot)||0))):r.map(()=>0);c||(d=new Set(r.map((ot,dt)=>dt)),h=0,p.length=0,r.forEach((ot,dt)=>{p[dt]=0}));let m=!1,g=c&&(l==null?void 0:l.meFailedAttemptLevel)!=null?Number(l.meFailedAttemptLevel):null;!d.has(0)&&g==null&&d.add(0);let _=null,x=null,M=null;const E=s.eventConfig;let A=Number(E.duration_hours??24)*3600*1e3,S=null;const v=Number(E.grand_prize??1e4),P=$1(s.stageRewardRaw??[]),N=P.get(7)??[];t.prizeAmount&&(t.prizeAmount.textContent=""),Gh(t.grandPrizeRewards,N);function D(){const ot=Math.min(7,h+1),dt=P.get(ot)??[];if(Gh(t.lobbyNextReward,dt),t.lobbyNextReward&&dt.length){const zt=document.getElementById("lobby-hint-message");zt&&(zt.textContent=`레벨 ${ot} 클리어 보상`)}}function q(ot){const dt=P.get(ot)??[];eR(dt)}const H=ot=>{let dt=Math.max(0,Math.floor(ot/1e3));const zt=Math.floor(dt/3600);dt%=3600;const Xt=Math.floor(dt/60),Kt=dt%60;return`${String(zt).padStart(2,"0")}:${String(Xt).padStart(2,"0")}:${String(Kt).padStart(2,"0")}`};function O(){const ot=H(A);t.lobbyTimer&&(t.lobbyTimer.textContent=ot),t.attemptTimer&&(t.attemptTimer.textContent=ot),t.clearTimer&&(t.clearTimer.textContent=ot)}function V(){Ix({version:Yh,clearsCompleted:h,aliveIds:[...d].sort((ot,dt)=>ot-dt),clearsForRank:p,meFailedAttemptLevel:g})}if(c){const ot=d.size;let dt=Math.min(7,Math.max(0,Math.floor(Number(h)||0)));h=dt;const zt=d.has(0)?Math.min(7,Math.max(0,Math.floor(Number(p[0])||0))):-1;if(dt>=7&&ot>=99){d=new Set(r.map((Xt,Kt)=>Kt)),h=0;for(let Xt=0;Xt<r.length;Xt++)p[Xt]=0;g=null,Zh(),c=!1,V()}else if(zt>=0&&zt!==dt){h=zt;for(const Xt of d)p[Xt]=zt;V()}}function w(){S||(O(),S=window.setInterval(()=>{A-=1e3,O()},1e3))}function R(){const ot=[...d].length;K1(t,h),H0(t,ot),t.attemptPlayersAlive&&(t.attemptPlayersAlive.textContent=`${ot}/100`),D()}function I(){_==null||_.disposeScene(),_=null}function J(){x==null||x.disposeScene(),x=null}function $(){M==null||M.disposeScene(),M=null}function ut(){for(const ot of d)p[ot]+=1}function gt(){for(const ot of d)p[ot]=Math.max(0,p[ot]-1)}async function z(ot){await G0(2),J();const dt=Math.max(0,h-1);x=Pc(ot,r,[...d],{fleaIntro:!0,playerClears:dt}),await x.fleaIntroPromise,x==null||x.updatePlayerClears(dt),R(),V()}function K(){return r.map((dt,zt)=>({idx:zt,clears:p[zt]||0,elim:!d.has(zt),name:String(r[zt].display_name),emoji:String(r[zt].avatar_emoji)}))}const X=ot=>String(ot).replace(/&/g,"&amp;").replace(/</g,"&lt;");function ht(){return K().map(ot=>({index:ot.idx,botId:`bot_${String(ot.idx+1).padStart(3,"0")}`,displayName:ot.name,emoji:ot.emoji,clears:ot.clears,eliminated:ot.elim,eliminationLevel:ot.elim?ot.idx===0?h:ot.clears:null,atLevelWhenFailed:ot.elim&&ot.clears===0?ot.idx===0?g??1:0:void 0}))}function Et(){const ot=F0(ht()),dt=ot.findIndex(zt=>zt.index===0);return dt>=0?dt+1:ot.length}function L(){if(!t.rankList)return;t.rankList.innerHTML="",F0(ht()).forEach((dt,zt)=>{const Xt=document.createElement("div");Xt.className="rank-item";const Kt=dt.index===0;Kt&&Xt.classList.add(dt.eliminated?"me-out":"me"),dt.eliminated&&(Xt.style.opacity="0.62"),Xt.innerHTML=`<span class="rk-n">${zt+1}</span><span class="rk-dot${Kt?" rk-dot--me":""}" aria-hidden="true"></span><span class="rk-t">${X(dt.displayName)}${Kt?"<small>(나)</small>":""}</span><span class="rk-m">${dt.eliminated?"탈락":`${dt.clears} 클리어`}</span>`,t.rankList.appendChild(Xt)})}function tt(){t.winnerAvatars&&(t.winnerAvatars.innerHTML="",d.forEach(ot=>{const dt=document.createElement("span");dt.className="winner-avatar"+(ot===0?" winner-avatar--me":""),dt.setAttribute("aria-hidden","true"),t.winnerAvatars.appendChild(dt)}))}function St(ot){t.finalRankEl&&(t.finalRankEl.textContent=String(ot)),t.finalClearCountEl&&(t.finalClearCountEl.textContent=String(Math.min(h,7)));const dt=h>=7?"2.5":h>=6?"1.8":h>=4?"1.5":"1";if(t.bonusMultiplierEl&&(t.bonusMultiplierEl.textContent=dt),!t.rewardGrid)return;t.rewardGrid.innerHTML="";const zt=Math.min(7,Math.max(0,h));for(let Xt=1;Xt<=zt;Xt++){const Kt=P.get(Xt)??[],he=document.createElement("div");he.className="reward-tile sketch-panel";const F=document.createElement("div");F.style.fontWeight="900",F.style.marginBottom="6px",F.textContent=`Lv.${Xt} 클리어`,he.appendChild(F);const Ve=document.createElement("div");Gh(Ve,Kt,{compact:!0}),he.appendChild(Ve),t.rewardGrid.appendChild(he)}if(h>=7&&v>0){const Xt=document.createElement("div");Xt.className="reward-tile sketch-panel",Xt.textContent=`생존자 분배(데모): ${j1(Math.floor(v/Math.max([...d].length,1)))}`,t.rewardGrid.appendChild(Xt)}}async function Z(){g=null,d.has(0)||d.add(0),ni("screen-lobby"),w(),I(),J(),$();const ot=document.getElementById("canvas-container");ot&&(await G0(2),_=Pc(ot,r,[...d],{playerClears:h}),R(),V())}async function ft(){const ot=document.createElement("div");ot.className="lq-fx-mount",ot.setAttribute("aria-hidden","true"),document.body.appendChild(ot);const dt=document.createElement("div");Object.assign(dt.style,{width:"100%",height:"100%",pointerEvents:"none"}),ot.appendChild(dt);const zt=Pc(dt,r,[...d],{playerClears:h}),Xt=dt.querySelector("canvas");Xt instanceof HTMLCanvasElement&&(Xt.style.pointerEvents="none");try{await zt.animateSelfEliminate(()=>Q1(t))}finally{zt.disposeScene(),ot.remove()}}function At(){Zh(),d=new Set(r.map((ot,dt)=>dt)),h=0;for(let ot=0;ot<r.length;ot++)p[ot]=0;g=null,m=!1,I(),J(),R(),V()}function Mt(){var zt;(zt=document.getElementById("btn-matching-continue"))==null||zt.classList.add("hidden");const ot=document.getElementById("match-current");ot&&(ot.textContent="0");const dt=document.getElementById("avatar-stack");if(!dt){Z();return}dt.innerHTML="",r.forEach((Xt,Kt)=>{window.setTimeout(()=>{const he=document.createElement("div");he.className="avatar-cell",he.setAttribute("aria-hidden","true");const F=document.createElement("div");F.className=Kt===0?"avatar-item avatar-me":"avatar-item",F.setAttribute("aria-hidden","true"),he.appendChild(F),dt.appendChild(he),requestAnimationFrame(()=>F.classList.add("avatar-item-in"));const Ve=Math.min(Kt+1,100),ae=document.getElementById("match-current");ae&&(ae.textContent=String(Ve)),Ve===100&&window.setTimeout(()=>{var se;return(se=document.getElementById("btn-matching-continue"))==null?void 0:se.classList.remove("hidden")},450)},Kt*32)})}return{startMatchingAnimated:Mt,attachHandlers(){var ot,dt,zt,Xt,Kt,he,F,Ve,ae,se,qt,be;(ot=document.getElementById("btn-matching-continue"))==null||ot.addEventListener("click",()=>{Z()}),(dt=document.getElementById("btn-start-attempt"))==null||dt.addEventListener("click",()=>{if(d.has(0)||(d.add(0),R(),V()),m){Dn(null,"다른 처리가 진행 중입니다. 잠시 후 다시 눌러 주세요.");return}const bt=Math.min(7,h+1),U=Number(E.total_levels??7),T=bt>=U;if(window.parent!==window){window.parent.postMessage({type:"lq:start_attempt",level:bt,totalLevels:U,isLastLevel:T,aliveCount:[...d].length},"*");return}t.attemptPlayersAlive&&(t.attemptPlayersAlive.textContent=`${[...d].length}/100`),t.attemptLevelNum&&(t.attemptLevelNum.textContent=`${bt}/7`);const it=Math.min(7,Math.max(1,h+1)),Tt=(Array.isArray(s.levelConfig)?s.levelConfig:[]).find(Vt=>Number(Vt.level)===it);t.attemptTip&&(t.attemptTip.textContent=Tt!=null&&Tt.tip_text?String(Tt.tip_text):"성공하면 다음 레벨로 진행합니다"),I(),J(),$();const vt=document.getElementById("canvas-container-attempt");vt&&(M=Pc(vt,r,[...d],{playerClears:h})),ni("screen-attempt")}),window.addEventListener("message",bt=>{var U,T;!bt.data||bt.data.type!=="lq:result"||(bt.data.success?(U=document.getElementById("btn-success"))==null||U.click():(T=document.getElementById("btn-fail"))==null||T.click())}),(zt=document.getElementById("btn-success"))==null||zt.addEventListener("click",async()=>{if(g=null,m||!d.has(0)){d.has(0)?Dn(null,"다른 처리가 진행 중입니다. 잠시 후 다시 눌러 주세요."):Dn(null,"이미 탈락했습니다. 보상 화면으로 이동하세요.");return}m=!0;try{J1(t);const bt=document.getElementById("btn-clear-continue");I(),J(),$(),ut(),h=Math.min(7,h+1),q(h),ni("screen-clear"),t.clearLevels&&(t.clearLevels.textContent=`${h}/7`),bt==null||bt.classList.add("hidden"),bt==null||bt.setAttribute("disabled","");const U=document.getElementById("canvas-container-clear");if(!U){Dn(null,"화면 설정 오류: 연출 영역(canvas)이 없습니다."),ni("screen-attempt"),h-=1,gt(),bt==null||bt.classList.remove("hidden"),bt==null||bt.removeAttribute("disabled");return}await z(U);const T=Hx(s.eliminationSchedule,h);await(x==null?void 0:x.playClearSuccessAnimation(T,h));for(const it of T){const mt=it.idx;mt>0&&d.has(mt)&&d.delete(mt)}R(),V(),t.clearLevels&&(t.clearLevels.textContent=`${h}/7`),t.clearPlayers&&(t.clearPlayers.textContent=`${[...d].length}/100`),bt==null||bt.classList.remove("hidden"),bt==null||bt.removeAttribute("disabled")}catch(bt){console.error(bt),h=Math.max(0,h-1),gt(),Dn(null,`연출 중 오류: ${bt instanceof Error?bt.message:String(bt)} (새로고침 권장)`),ni("screen-lobby"),J(),Z();const U=document.getElementById("btn-clear-continue");U==null||U.classList.remove("hidden"),U==null||U.removeAttribute("disabled")}finally{m=!1}}),(Xt=document.getElementById("btn-fail"))==null||Xt.addEventListener("click",async()=>{if(m||!d.has(0)){d.has(0)?Dn(null,"다른 처리가 진행 중입니다."):Dn(null,"이미 탈락했습니다.");return}m=!0;try{g=Math.min(7,h+1),I(),J(),await ft(),d.delete(0),H0(t,[...d].length),t.failLevelEl&&(t.failLevelEl.textContent=String(Math.min(h+1,7))),t.failClearCountEl&&(t.failClearCountEl.textContent=String(h)),ni("screen-fail"),V()}catch(bt){console.error(bt),Dn(null,`실패 연출 오류: ${bt instanceof Error?bt.message:String(bt)}`),J(),Z()}finally{m=!1}}),(Kt=document.getElementById("btn-clear-continue"))==null||Kt.addEventListener("click",async()=>{const bt=document.getElementById("btn-clear-continue");if(bt!=null&&bt.disabled||bt!=null&&bt.classList.contains("hidden")){Dn(null,"탈락 연출이 끝난 뒤에 눌러 주세요.");return}if(m){Dn(null,"잠시만 기다려 주세요.");return}if(J(),h>=7){t.survivorsCountEl&&(t.survivorsCountEl.textContent=String([...d].length)),t.shareCountEl&&(t.shareCountEl.textContent=String(Math.max(0,[...d].length-1))),tt(),t.fullClearGoldOverlay&&(t.fullClearGoldOverlay.style.transition="",t.fullClearGoldOverlay.style.opacity="0",requestAnimationFrame(()=>{t.fullClearGoldOverlay.style.transition="opacity 420ms linear",t.fullClearGoldOverlay.style.opacity="0.93",window.setTimeout(()=>{t.fullClearGoldOverlay.style.opacity="0"},520)})),I(),J(),ni("screen-full-clear");return}I(),await Z()}),(he=document.getElementById("btn-full-clear-reward"))==null||he.addEventListener("click",()=>{I(),J(),St(Et()),ni("screen-reward")}),(F=document.getElementById("btn-fail-reward"))==null||F.addEventListener("click",()=>{I(),J(),St(Et()),ni("screen-reward")}),(Ve=document.getElementById("btn-ranking"))==null||Ve.addEventListener("click",()=>{if(!t.rankList){Dn(null,"순위 UI(#rank-list)가 없어 표시를 건너뜁니다.");return}L(),ni("screen-ranking")}),(ae=document.getElementById("btn-ranking-close"))==null||ae.addEventListener("click",()=>{ni("screen-lobby")}),(se=document.getElementById("btn-reward-confirm"))==null||se.addEventListener("click",()=>{At(),ni("screen-matching"),Dn(null,"새 이벤트로 초기화했어요. 매칭부터 다시 시작해요.",2600),Mt()}),(qt=document.getElementById("btn-lobby-info"))==null||qt.addEventListener("click",()=>{Dn(null,E.event_name??"용암 퀘스트")}),(be=document.getElementById("btn-session-reset"))==null||be.addEventListener("click",()=>{window.confirm("저장된 진행을 모두 지우고 처음부터 시작할까요?")&&(At(),ni("screen-matching"),Dn(null,"초기화했어요. 매칭부터 다시 해요.",2400),Mt())}),R()}}}function Ge(s){return document.getElementById(s)}async function rR(){const[s,t,i,r,l]=await Promise.all([Po("/lq_bot_config.csv"),Po("/lq_elimination_schedule.csv"),Po("/lq_level_config.csv"),Po("/lq_event_config.csv"),Po("/lq_stage_reward.csv")]),c=r[0]||{},d=Bx(),h=!!(d&&(d.version===1||d.version===Yh)&&Array.isArray(d.aliveIds)&&Array.isArray(d.clearsForRank)&&d.clearsForRank.length===s.length),p=aR({botConfigRaw:s,eliminationSchedule:t,levelConfig:i,eventConfig:c,stageRewardRaw:l},{prizeAmount:Ge("prize-amount"),grandPrizeRewards:Ge("grand-prize-rewards"),lobbyNextReward:Ge("lobby-next-reward"),lobbyTimer:Ge("lobby-timer"),clearTimer:Ge("clear-timer"),statLevels:Ge("stat-levels"),statPlayers:Ge("stat-players"),attemptPlayers:Ge("attempt-players-alive"),attemptLevelNum:Ge("attempt-level-num"),attemptTip:Ge("attempt-tip"),attemptTimer:Ge("attempt-timer"),attemptPlayersAlive:Ge("attempt-players-alive"),clearLevels:Ge("clear-levels"),clearPlayers:Ge("clear-players"),failLevelEl:Ge("fail-level"),failClearCountEl:Ge("fail-clear-count"),survivorsCountEl:Ge("survivors-count"),shareCountEl:Ge("share-count"),finalRankEl:Ge("final-rank"),finalClearCountEl:Ge("final-clear-count"),bonusMultiplierEl:Ge("bonus-multiplier"),rankList:Ge("rank-list"),winnerAvatars:Ge("winner-avatars"),rewardGrid:Ge("reward-grid"),fullClearGoldOverlay:Ge("full-clear-overlay"),attemptFlash:Ge("attempt-flash-overlay")},{persisted:h?d:null});p.attachHandlers(),p.startMatchingAnimated(),window.addEventListener("message",m=>{var g,_;((g=m.data)==null?void 0:g.type)==="host:eventDispose"&&((_=m.data)==null?void 0:_.eventId)==="lava"&&Zh()})}rR().catch(s=>{var i,r;console.error(s),(r=(i=document.getElementById("toast"))==null?void 0:i.classList)==null||r.remove("hidden");const t=document.getElementById("toast");if(t){const l=s instanceof Error?s.message:String(s);t.textContent=`시작하지 못했습니다. 원인: ${l}. Vite로 연 주소인지 확인하세요(예: npm run dev 또는 npm run preview).`}});function sR(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var Vh={exports:{}},re={};/**
 * @license React
 * react.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var V0;function oR(){if(V0)return re;V0=1;var s=Symbol.for("react.transitional.element"),t=Symbol.for("react.portal"),i=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),l=Symbol.for("react.profiler"),c=Symbol.for("react.consumer"),d=Symbol.for("react.context"),h=Symbol.for("react.forward_ref"),p=Symbol.for("react.suspense"),m=Symbol.for("react.memo"),g=Symbol.for("react.lazy"),_=Symbol.for("react.activity"),x=Symbol.iterator;function M(L){return L===null||typeof L!="object"?null:(L=x&&L[x]||L["@@iterator"],typeof L=="function"?L:null)}var E={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},A=Object.assign,S={};function v(L,tt,St){this.props=L,this.context=tt,this.refs=S,this.updater=St||E}v.prototype.isReactComponent={},v.prototype.setState=function(L,tt){if(typeof L!="object"&&typeof L!="function"&&L!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,L,tt,"setState")},v.prototype.forceUpdate=function(L){this.updater.enqueueForceUpdate(this,L,"forceUpdate")};function P(){}P.prototype=v.prototype;function N(L,tt,St){this.props=L,this.context=tt,this.refs=S,this.updater=St||E}var D=N.prototype=new P;D.constructor=N,A(D,v.prototype),D.isPureReactComponent=!0;var q=Array.isArray;function H(){}var O={H:null,A:null,T:null,S:null},V=Object.prototype.hasOwnProperty;function w(L,tt,St){var Z=St.ref;return{$$typeof:s,type:L,key:tt,ref:Z!==void 0?Z:null,props:St}}function R(L,tt){return w(L.type,tt,L.props)}function I(L){return typeof L=="object"&&L!==null&&L.$$typeof===s}function J(L){var tt={"=":"=0",":":"=2"};return"$"+L.replace(/[=:]/g,function(St){return tt[St]})}var $=/\/+/g;function ut(L,tt){return typeof L=="object"&&L!==null&&L.key!=null?J(""+L.key):tt.toString(36)}function gt(L){switch(L.status){case"fulfilled":return L.value;case"rejected":throw L.reason;default:switch(typeof L.status=="string"?L.then(H,H):(L.status="pending",L.then(function(tt){L.status==="pending"&&(L.status="fulfilled",L.value=tt)},function(tt){L.status==="pending"&&(L.status="rejected",L.reason=tt)})),L.status){case"fulfilled":return L.value;case"rejected":throw L.reason}}throw L}function z(L,tt,St,Z,ft){var At=typeof L;(At==="undefined"||At==="boolean")&&(L=null);var Mt=!1;if(L===null)Mt=!0;else switch(At){case"bigint":case"string":case"number":Mt=!0;break;case"object":switch(L.$$typeof){case s:case t:Mt=!0;break;case g:return Mt=L._init,z(Mt(L._payload),tt,St,Z,ft)}}if(Mt)return ft=ft(L),Mt=Z===""?"."+ut(L,0):Z,q(ft)?(St="",Mt!=null&&(St=Mt.replace($,"$&/")+"/"),z(ft,tt,St,"",function(zt){return zt})):ft!=null&&(I(ft)&&(ft=R(ft,St+(ft.key==null||L&&L.key===ft.key?"":(""+ft.key).replace($,"$&/")+"/")+Mt)),tt.push(ft)),1;Mt=0;var ot=Z===""?".":Z+":";if(q(L))for(var dt=0;dt<L.length;dt++)Z=L[dt],At=ot+ut(Z,dt),Mt+=z(Z,tt,St,At,ft);else if(dt=M(L),typeof dt=="function")for(L=dt.call(L),dt=0;!(Z=L.next()).done;)Z=Z.value,At=ot+ut(Z,dt++),Mt+=z(Z,tt,St,At,ft);else if(At==="object"){if(typeof L.then=="function")return z(gt(L),tt,St,Z,ft);throw tt=String(L),Error("Objects are not valid as a React child (found: "+(tt==="[object Object]"?"object with keys {"+Object.keys(L).join(", ")+"}":tt)+"). If you meant to render a collection of children, use an array instead.")}return Mt}function K(L,tt,St){if(L==null)return L;var Z=[],ft=0;return z(L,Z,"","",function(At){return tt.call(St,At,ft++)}),Z}function X(L){if(L._status===-1){var tt=L._result;tt=tt(),tt.then(function(St){(L._status===0||L._status===-1)&&(L._status=1,L._result=St)},function(St){(L._status===0||L._status===-1)&&(L._status=2,L._result=St)}),L._status===-1&&(L._status=0,L._result=tt)}if(L._status===1)return L._result.default;throw L._result}var ht=typeof reportError=="function"?reportError:function(L){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var tt=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof L=="object"&&L!==null&&typeof L.message=="string"?String(L.message):String(L),error:L});if(!window.dispatchEvent(tt))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",L);return}console.error(L)},Et={map:K,forEach:function(L,tt,St){K(L,function(){tt.apply(this,arguments)},St)},count:function(L){var tt=0;return K(L,function(){tt++}),tt},toArray:function(L){return K(L,function(tt){return tt})||[]},only:function(L){if(!I(L))throw Error("React.Children.only expected to receive a single React element child.");return L}};return re.Activity=_,re.Children=Et,re.Component=v,re.Fragment=i,re.Profiler=l,re.PureComponent=N,re.StrictMode=r,re.Suspense=p,re.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=O,re.__COMPILER_RUNTIME={__proto__:null,c:function(L){return O.H.useMemoCache(L)}},re.cache=function(L){return function(){return L.apply(null,arguments)}},re.cacheSignal=function(){return null},re.cloneElement=function(L,tt,St){if(L==null)throw Error("The argument must be a React element, but you passed "+L+".");var Z=A({},L.props),ft=L.key;if(tt!=null)for(At in tt.key!==void 0&&(ft=""+tt.key),tt)!V.call(tt,At)||At==="key"||At==="__self"||At==="__source"||At==="ref"&&tt.ref===void 0||(Z[At]=tt[At]);var At=arguments.length-2;if(At===1)Z.children=St;else if(1<At){for(var Mt=Array(At),ot=0;ot<At;ot++)Mt[ot]=arguments[ot+2];Z.children=Mt}return w(L.type,ft,Z)},re.createContext=function(L){return L={$$typeof:d,_currentValue:L,_currentValue2:L,_threadCount:0,Provider:null,Consumer:null},L.Provider=L,L.Consumer={$$typeof:c,_context:L},L},re.createElement=function(L,tt,St){var Z,ft={},At=null;if(tt!=null)for(Z in tt.key!==void 0&&(At=""+tt.key),tt)V.call(tt,Z)&&Z!=="key"&&Z!=="__self"&&Z!=="__source"&&(ft[Z]=tt[Z]);var Mt=arguments.length-2;if(Mt===1)ft.children=St;else if(1<Mt){for(var ot=Array(Mt),dt=0;dt<Mt;dt++)ot[dt]=arguments[dt+2];ft.children=ot}if(L&&L.defaultProps)for(Z in Mt=L.defaultProps,Mt)ft[Z]===void 0&&(ft[Z]=Mt[Z]);return w(L,At,ft)},re.createRef=function(){return{current:null}},re.forwardRef=function(L){return{$$typeof:h,render:L}},re.isValidElement=I,re.lazy=function(L){return{$$typeof:g,_payload:{_status:-1,_result:L},_init:X}},re.memo=function(L,tt){return{$$typeof:m,type:L,compare:tt===void 0?null:tt}},re.startTransition=function(L){var tt=O.T,St={};O.T=St;try{var Z=L(),ft=O.S;ft!==null&&ft(St,Z),typeof Z=="object"&&Z!==null&&typeof Z.then=="function"&&Z.then(H,ht)}catch(At){ht(At)}finally{tt!==null&&St.types!==null&&(tt.types=St.types),O.T=tt}},re.unstable_useCacheRefresh=function(){return O.H.useCacheRefresh()},re.use=function(L){return O.H.use(L)},re.useActionState=function(L,tt,St){return O.H.useActionState(L,tt,St)},re.useCallback=function(L,tt){return O.H.useCallback(L,tt)},re.useContext=function(L){return O.H.useContext(L)},re.useDebugValue=function(){},re.useDeferredValue=function(L,tt){return O.H.useDeferredValue(L,tt)},re.useEffect=function(L,tt){return O.H.useEffect(L,tt)},re.useEffectEvent=function(L){return O.H.useEffectEvent(L)},re.useId=function(){return O.H.useId()},re.useImperativeHandle=function(L,tt,St){return O.H.useImperativeHandle(L,tt,St)},re.useInsertionEffect=function(L,tt){return O.H.useInsertionEffect(L,tt)},re.useLayoutEffect=function(L,tt){return O.H.useLayoutEffect(L,tt)},re.useMemo=function(L,tt){return O.H.useMemo(L,tt)},re.useOptimistic=function(L,tt){return O.H.useOptimistic(L,tt)},re.useReducer=function(L,tt,St){return O.H.useReducer(L,tt,St)},re.useRef=function(L){return O.H.useRef(L)},re.useState=function(L){return O.H.useState(L)},re.useSyncExternalStore=function(L,tt,St){return O.H.useSyncExternalStore(L,tt,St)},re.useTransition=function(){return O.H.useTransition()},re.version="19.2.6",re}var k0;function Jd(){return k0||(k0=1,Vh.exports=oR()),Vh.exports}var lR=Jd();const cR=sR(lR);var kh={exports:{}},Vo={},Xh={exports:{}},qh={};/**
 * @license React
 * scheduler.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var X0;function uR(){return X0||(X0=1,(function(s){function t(z,K){var X=z.length;z.push(K);t:for(;0<X;){var ht=X-1>>>1,Et=z[ht];if(0<l(Et,K))z[ht]=K,z[X]=Et,X=ht;else break t}}function i(z){return z.length===0?null:z[0]}function r(z){if(z.length===0)return null;var K=z[0],X=z.pop();if(X!==K){z[0]=X;t:for(var ht=0,Et=z.length,L=Et>>>1;ht<L;){var tt=2*(ht+1)-1,St=z[tt],Z=tt+1,ft=z[Z];if(0>l(St,X))Z<Et&&0>l(ft,St)?(z[ht]=ft,z[Z]=X,ht=Z):(z[ht]=St,z[tt]=X,ht=tt);else if(Z<Et&&0>l(ft,X))z[ht]=ft,z[Z]=X,ht=Z;else break t}}return K}function l(z,K){var X=z.sortIndex-K.sortIndex;return X!==0?X:z.id-K.id}if(s.unstable_now=void 0,typeof performance=="object"&&typeof performance.now=="function"){var c=performance;s.unstable_now=function(){return c.now()}}else{var d=Date,h=d.now();s.unstable_now=function(){return d.now()-h}}var p=[],m=[],g=1,_=null,x=3,M=!1,E=!1,A=!1,S=!1,v=typeof setTimeout=="function"?setTimeout:null,P=typeof clearTimeout=="function"?clearTimeout:null,N=typeof setImmediate<"u"?setImmediate:null;function D(z){for(var K=i(m);K!==null;){if(K.callback===null)r(m);else if(K.startTime<=z)r(m),K.sortIndex=K.expirationTime,t(p,K);else break;K=i(m)}}function q(z){if(A=!1,D(z),!E)if(i(p)!==null)E=!0,H||(H=!0,J());else{var K=i(m);K!==null&&gt(q,K.startTime-z)}}var H=!1,O=-1,V=5,w=-1;function R(){return S?!0:!(s.unstable_now()-w<V)}function I(){if(S=!1,H){var z=s.unstable_now();w=z;var K=!0;try{t:{E=!1,A&&(A=!1,P(O),O=-1),M=!0;var X=x;try{e:{for(D(z),_=i(p);_!==null&&!(_.expirationTime>z&&R());){var ht=_.callback;if(typeof ht=="function"){_.callback=null,x=_.priorityLevel;var Et=ht(_.expirationTime<=z);if(z=s.unstable_now(),typeof Et=="function"){_.callback=Et,D(z),K=!0;break e}_===i(p)&&r(p),D(z)}else r(p);_=i(p)}if(_!==null)K=!0;else{var L=i(m);L!==null&&gt(q,L.startTime-z),K=!1}}break t}finally{_=null,x=X,M=!1}K=void 0}}finally{K?J():H=!1}}}var J;if(typeof N=="function")J=function(){N(I)};else if(typeof MessageChannel<"u"){var $=new MessageChannel,ut=$.port2;$.port1.onmessage=I,J=function(){ut.postMessage(null)}}else J=function(){v(I,0)};function gt(z,K){O=v(function(){z(s.unstable_now())},K)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(z){z.callback=null},s.unstable_forceFrameRate=function(z){0>z||125<z?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):V=0<z?Math.floor(1e3/z):5},s.unstable_getCurrentPriorityLevel=function(){return x},s.unstable_next=function(z){switch(x){case 1:case 2:case 3:var K=3;break;default:K=x}var X=x;x=K;try{return z()}finally{x=X}},s.unstable_requestPaint=function(){S=!0},s.unstable_runWithPriority=function(z,K){switch(z){case 1:case 2:case 3:case 4:case 5:break;default:z=3}var X=x;x=z;try{return K()}finally{x=X}},s.unstable_scheduleCallback=function(z,K,X){var ht=s.unstable_now();switch(typeof X=="object"&&X!==null?(X=X.delay,X=typeof X=="number"&&0<X?ht+X:ht):X=ht,z){case 1:var Et=-1;break;case 2:Et=250;break;case 5:Et=1073741823;break;case 4:Et=1e4;break;default:Et=5e3}return Et=X+Et,z={id:g++,callback:K,priorityLevel:z,startTime:X,expirationTime:Et,sortIndex:-1},X>ht?(z.sortIndex=X,t(m,z),i(p)===null&&z===i(m)&&(A?(P(O),O=-1):A=!0,gt(q,X-ht))):(z.sortIndex=Et,t(p,z),E||M||(E=!0,H||(H=!0,J()))),z},s.unstable_shouldYield=R,s.unstable_wrapCallback=function(z){var K=x;return function(){var X=x;x=K;try{return z.apply(this,arguments)}finally{x=X}}}})(qh)),qh}var q0;function fR(){return q0||(q0=1,Xh.exports=uR()),Xh.exports}var Wh={exports:{}},wn={};/**
 * @license React
 * react-dom.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var W0;function hR(){if(W0)return wn;W0=1;var s=Jd();function t(p){var m="https://react.dev/errors/"+p;if(1<arguments.length){m+="?args[]="+encodeURIComponent(arguments[1]);for(var g=2;g<arguments.length;g++)m+="&args[]="+encodeURIComponent(arguments[g])}return"Minified React error #"+p+"; visit "+m+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function i(){}var r={d:{f:i,r:function(){throw Error(t(522))},D:i,C:i,L:i,m:i,X:i,S:i,M:i},p:0,findDOMNode:null},l=Symbol.for("react.portal");function c(p,m,g){var _=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:l,key:_==null?null:""+_,children:p,containerInfo:m,implementation:g}}var d=s.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function h(p,m){if(p==="font")return"";if(typeof m=="string")return m==="use-credentials"?m:""}return wn.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=r,wn.createPortal=function(p,m){var g=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!m||m.nodeType!==1&&m.nodeType!==9&&m.nodeType!==11)throw Error(t(299));return c(p,m,null,g)},wn.flushSync=function(p){var m=d.T,g=r.p;try{if(d.T=null,r.p=2,p)return p()}finally{d.T=m,r.p=g,r.d.f()}},wn.preconnect=function(p,m){typeof p=="string"&&(m?(m=m.crossOrigin,m=typeof m=="string"?m==="use-credentials"?m:"":void 0):m=null,r.d.C(p,m))},wn.prefetchDNS=function(p){typeof p=="string"&&r.d.D(p)},wn.preinit=function(p,m){if(typeof p=="string"&&m&&typeof m.as=="string"){var g=m.as,_=h(g,m.crossOrigin),x=typeof m.integrity=="string"?m.integrity:void 0,M=typeof m.fetchPriority=="string"?m.fetchPriority:void 0;g==="style"?r.d.S(p,typeof m.precedence=="string"?m.precedence:void 0,{crossOrigin:_,integrity:x,fetchPriority:M}):g==="script"&&r.d.X(p,{crossOrigin:_,integrity:x,fetchPriority:M,nonce:typeof m.nonce=="string"?m.nonce:void 0})}},wn.preinitModule=function(p,m){if(typeof p=="string")if(typeof m=="object"&&m!==null){if(m.as==null||m.as==="script"){var g=h(m.as,m.crossOrigin);r.d.M(p,{crossOrigin:g,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0})}}else m==null&&r.d.M(p)},wn.preload=function(p,m){if(typeof p=="string"&&typeof m=="object"&&m!==null&&typeof m.as=="string"){var g=m.as,_=h(g,m.crossOrigin);r.d.L(p,g,{crossOrigin:_,integrity:typeof m.integrity=="string"?m.integrity:void 0,nonce:typeof m.nonce=="string"?m.nonce:void 0,type:typeof m.type=="string"?m.type:void 0,fetchPriority:typeof m.fetchPriority=="string"?m.fetchPriority:void 0,referrerPolicy:typeof m.referrerPolicy=="string"?m.referrerPolicy:void 0,imageSrcSet:typeof m.imageSrcSet=="string"?m.imageSrcSet:void 0,imageSizes:typeof m.imageSizes=="string"?m.imageSizes:void 0,media:typeof m.media=="string"?m.media:void 0})}},wn.preloadModule=function(p,m){if(typeof p=="string")if(m){var g=h(m.as,m.crossOrigin);r.d.m(p,{as:typeof m.as=="string"&&m.as!=="script"?m.as:void 0,crossOrigin:g,integrity:typeof m.integrity=="string"?m.integrity:void 0})}else r.d.m(p)},wn.requestFormReset=function(p){r.d.r(p)},wn.unstable_batchedUpdates=function(p,m){return p(m)},wn.useFormState=function(p,m,g){return d.H.useFormState(p,m,g)},wn.useFormStatus=function(){return d.H.useHostTransitionStatus()},wn.version="19.2.6",wn}var Y0;function dR(){if(Y0)return Wh.exports;Y0=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(t){console.error(t)}}return s(),Wh.exports=hR(),Wh.exports}/**
 * @license React
 * react-dom-client.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Z0;function pR(){if(Z0)return Vo;Z0=1;var s=fR(),t=Jd(),i=dR();function r(e){var n="https://react.dev/errors/"+e;if(1<arguments.length){n+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)n+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+n+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function l(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function c(e){var n=e,a=e;if(e.alternate)for(;n.return;)n=n.return;else{e=n;do n=e,(n.flags&4098)!==0&&(a=n.return),e=n.return;while(e)}return n.tag===3?a:null}function d(e){if(e.tag===13){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function h(e){if(e.tag===31){var n=e.memoizedState;if(n===null&&(e=e.alternate,e!==null&&(n=e.memoizedState)),n!==null)return n.dehydrated}return null}function p(e){if(c(e)!==e)throw Error(r(188))}function m(e){var n=e.alternate;if(!n){if(n=c(e),n===null)throw Error(r(188));return n!==e?null:e}for(var a=e,o=n;;){var u=a.return;if(u===null)break;var f=u.alternate;if(f===null){if(o=u.return,o!==null){a=o;continue}break}if(u.child===f.child){for(f=u.child;f;){if(f===a)return p(u),e;if(f===o)return p(u),n;f=f.sibling}throw Error(r(188))}if(a.return!==o.return)a=u,o=f;else{for(var y=!1,b=u.child;b;){if(b===a){y=!0,a=u,o=f;break}if(b===o){y=!0,o=u,a=f;break}b=b.sibling}if(!y){for(b=f.child;b;){if(b===a){y=!0,a=f,o=u;break}if(b===o){y=!0,o=f,a=u;break}b=b.sibling}if(!y)throw Error(r(189))}}if(a.alternate!==o)throw Error(r(190))}if(a.tag!==3)throw Error(r(188));return a.stateNode.current===a?e:n}function g(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e;for(e=e.child;e!==null;){if(n=g(e),n!==null)return n;e=e.sibling}return null}var _=Object.assign,x=Symbol.for("react.element"),M=Symbol.for("react.transitional.element"),E=Symbol.for("react.portal"),A=Symbol.for("react.fragment"),S=Symbol.for("react.strict_mode"),v=Symbol.for("react.profiler"),P=Symbol.for("react.consumer"),N=Symbol.for("react.context"),D=Symbol.for("react.forward_ref"),q=Symbol.for("react.suspense"),H=Symbol.for("react.suspense_list"),O=Symbol.for("react.memo"),V=Symbol.for("react.lazy"),w=Symbol.for("react.activity"),R=Symbol.for("react.memo_cache_sentinel"),I=Symbol.iterator;function J(e){return e===null||typeof e!="object"?null:(e=I&&e[I]||e["@@iterator"],typeof e=="function"?e:null)}var $=Symbol.for("react.client.reference");function ut(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===$?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case A:return"Fragment";case v:return"Profiler";case S:return"StrictMode";case q:return"Suspense";case H:return"SuspenseList";case w:return"Activity"}if(typeof e=="object")switch(e.$$typeof){case E:return"Portal";case N:return e.displayName||"Context";case P:return(e._context.displayName||"Context")+".Consumer";case D:var n=e.render;return e=e.displayName,e||(e=n.displayName||n.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case O:return n=e.displayName||null,n!==null?n:ut(e.type)||"Memo";case V:n=e._payload,e=e._init;try{return ut(e(n))}catch{}}return null}var gt=Array.isArray,z=t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,K=i.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,X={pending:!1,data:null,method:null,action:null},ht=[],Et=-1;function L(e){return{current:e}}function tt(e){0>Et||(e.current=ht[Et],ht[Et]=null,Et--)}function St(e,n){Et++,ht[Et]=e.current,e.current=n}var Z=L(null),ft=L(null),At=L(null),Mt=L(null);function ot(e,n){switch(St(At,n),St(ft,e),St(Z,null),n.nodeType){case 9:case 11:e=(e=n.documentElement)&&(e=e.namespaceURI)?n_(e):0;break;default:if(e=n.tagName,n=n.namespaceURI)n=n_(n),e=i_(n,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}tt(Z),St(Z,e)}function dt(){tt(Z),tt(ft),tt(At)}function zt(e){e.memoizedState!==null&&St(Mt,e);var n=Z.current,a=i_(n,e.type);n!==a&&(St(ft,e),St(Z,a))}function Xt(e){ft.current===e&&(tt(Z),tt(ft)),Mt.current===e&&(tt(Mt),Lo._currentValue=X)}var Kt,he;function F(e){if(Kt===void 0)try{throw Error()}catch(a){var n=a.stack.trim().match(/\n( *(at )?)/);Kt=n&&n[1]||"",he=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Kt+e+he}var Ve=!1;function ae(e,n){if(!e||Ve)return"";Ve=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var o={DetermineComponentFrameRoot:function(){try{if(n){var yt=function(){throw Error()};if(Object.defineProperty(yt.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(yt,[])}catch(lt){var at=lt}Reflect.construct(e,[],yt)}else{try{yt.call()}catch(lt){at=lt}e.call(yt.prototype)}}else{try{throw Error()}catch(lt){at=lt}(yt=e())&&typeof yt.catch=="function"&&yt.catch(function(){})}}catch(lt){if(lt&&at&&typeof lt.stack=="string")return[lt.stack,at.stack]}return[null,null]}};o.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var u=Object.getOwnPropertyDescriptor(o.DetermineComponentFrameRoot,"name");u&&u.configurable&&Object.defineProperty(o.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var f=o.DetermineComponentFrameRoot(),y=f[0],b=f[1];if(y&&b){var B=y.split(`
`),nt=b.split(`
`);for(u=o=0;o<B.length&&!B[o].includes("DetermineComponentFrameRoot");)o++;for(;u<nt.length&&!nt[u].includes("DetermineComponentFrameRoot");)u++;if(o===B.length||u===nt.length)for(o=B.length-1,u=nt.length-1;1<=o&&0<=u&&B[o]!==nt[u];)u--;for(;1<=o&&0<=u;o--,u--)if(B[o]!==nt[u]){if(o!==1||u!==1)do if(o--,u--,0>u||B[o]!==nt[u]){var pt=`
`+B[o].replace(" at new "," at ");return e.displayName&&pt.includes("<anonymous>")&&(pt=pt.replace("<anonymous>",e.displayName)),pt}while(1<=o&&0<=u);break}}}finally{Ve=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?F(a):""}function se(e,n){switch(e.tag){case 26:case 27:case 5:return F(e.type);case 16:return F("Lazy");case 13:return e.child!==n&&n!==null?F("Suspense Fallback"):F("Suspense");case 19:return F("SuspenseList");case 0:case 15:return ae(e.type,!1);case 11:return ae(e.type.render,!1);case 1:return ae(e.type,!0);case 31:return F("Activity");default:return""}}function qt(e){try{var n="",a=null;do n+=se(e,a),a=e,e=e.return;while(e);return n}catch(o){return`
Error generating stack: `+o.message+`
`+o.stack}}var be=Object.prototype.hasOwnProperty,bt=s.unstable_scheduleCallback,U=s.unstable_cancelCallback,T=s.unstable_shouldYield,it=s.unstable_requestPaint,mt=s.unstable_now,Tt=s.unstable_getCurrentPriorityLevel,vt=s.unstable_ImmediatePriority,Vt=s.unstable_UserBlockingPriority,Ut=s.unstable_NormalPriority,Ft=s.unstable_LowPriority,me=s.unstable_IdlePriority,Ct=s.log,Ht=s.unstable_setDisableYieldValue,Yt=null,Wt=null;function Bt(e){if(typeof Ct=="function"&&Ht(e),Wt&&typeof Wt.setStrictMode=="function")try{Wt.setStrictMode(Yt,e)}catch{}}var $t=Math.clz32?Math.clz32:W,oe=Math.log,Oe=Math.LN2;function W(e){return e>>>=0,e===0?32:31-(oe(e)/Oe|0)|0}var wt=256,ct=262144,xt=4194304;function Dt(e){var n=e&42;if(n!==0)return n;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&261888;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Lt(e,n,a){var o=e.pendingLanes;if(o===0)return 0;var u=0,f=e.suspendedLanes,y=e.pingedLanes;e=e.warmLanes;var b=o&134217727;return b!==0?(o=b&~f,o!==0?u=Dt(o):(y&=b,y!==0?u=Dt(y):a||(a=b&~e,a!==0&&(u=Dt(a))))):(b=o&~f,b!==0?u=Dt(b):y!==0?u=Dt(y):a||(a=o&~e,a!==0&&(u=Dt(a)))),u===0?0:n!==0&&n!==u&&(n&f)===0&&(f=u&-u,a=n&-n,f>=a||f===32&&(a&4194048)!==0)?n:u}function te(e,n){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&n)===0}function We(e,n){switch(e){case 1:case 2:case 4:case 8:case 64:return n+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return n+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function un(){var e=xt;return xt<<=1,(xt&62914560)===0&&(xt=4194304),e}function Ee(e){for(var n=[],a=0;31>a;a++)n.push(e);return n}function vn(e,n){e.pendingLanes|=n,n!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function pi(e,n,a,o,u,f){var y=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var b=e.entanglements,B=e.expirationTimes,nt=e.hiddenUpdates;for(a=y&~a;0<a;){var pt=31-$t(a),yt=1<<pt;b[pt]=0,B[pt]=-1;var at=nt[pt];if(at!==null)for(nt[pt]=null,pt=0;pt<at.length;pt++){var lt=at[pt];lt!==null&&(lt.lane&=-536870913)}a&=~yt}o!==0&&ks(e,o,0),f!==0&&u===0&&e.tag!==0&&(e.suspendedLanes|=f&~(y&~n))}function ks(e,n,a){e.pendingLanes|=n,e.suspendedLanes&=~n;var o=31-$t(n);e.entangledLanes|=n,e.entanglements[o]=e.entanglements[o]|1073741824|a&261930}function Xs(e,n){var a=e.entangledLanes|=n;for(e=e.entanglements;a;){var o=31-$t(a),u=1<<o;u&n|e[o]&n&&(e[o]|=n),a&=~u}}function Ri(e,n){var a=n&-n;return a=(a&42)!==0?1:Ka(a),(a&(e.suspendedLanes|n))!==0?0:a}function Ka(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Lr(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function qs(){var e=K.p;return e!==0?e:(e=window.event,e===void 0?32:A_(e.type))}function Qa(e,n){var a=K.p;try{return K.p=e,n()}finally{K.p=a}}var mi=Math.random().toString(36).slice(2),je="__reactFiber$"+mi,yn="__reactProps$"+mi,Ii="__reactContainer$"+mi,Ws="__reactEvents$"+mi,eu="__reactListeners$"+mi,nu="__reactHandles$"+mi,nl="__reactResources$"+mi,Ja="__reactMarker$"+mi;function Ys(e){delete e[je],delete e[yn],delete e[Ws],delete e[eu],delete e[nu]}function C(e){var n=e[je];if(n)return n;for(var a=e.parentNode;a;){if(n=a[Ii]||a[je]){if(a=n.alternate,n.child!==null||a!==null&&a.child!==null)for(e=u_(e);e!==null;){if(a=e[je])return a;e=u_(e)}return n}e=a,a=e.parentNode}return null}function Y(e){if(e=e[je]||e[Ii]){var n=e.tag;if(n===5||n===6||n===13||n===31||n===26||n===27||n===3)return e}return null}function rt(e){var n=e.tag;if(n===5||n===26||n===27||n===6)return e.stateNode;throw Error(r(33))}function st(e){var n=e[nl];return n||(n=e[nl]={hoistableStyles:new Map,hoistableScripts:new Map}),n}function k(e){e[Ja]=!0}var Rt=new Set,Nt={};function Pt(e,n){It(e,n),It(e+"Capture",n)}function It(e,n){for(Nt[e]=n,e=0;e<n.length;e++)Rt.add(n[e])}var ee=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),ne={},Zt={};function ye(e){return be.call(Zt,e)?!0:be.call(ne,e)?!1:ee.test(e)?Zt[e]=!0:(ne[e]=!0,!1)}function xe(e,n,a){if(ye(n))if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(n);return;case"boolean":var o=n.toLowerCase().slice(0,5);if(o!=="data-"&&o!=="aria-"){e.removeAttribute(n);return}}e.setAttribute(n,""+a)}}function ke(e,n,a){if(a===null)e.removeAttribute(n);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(n);return}e.setAttribute(n,""+a)}}function Ae(e,n,a,o){if(o===null)e.removeAttribute(a);else{switch(typeof o){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(n,a,""+o)}}function ie(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Qt(e){var n=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(n==="checkbox"||n==="radio")}function fn(e,n,a){var o=Object.getOwnPropertyDescriptor(e.constructor.prototype,n);if(!e.hasOwnProperty(n)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var u=o.get,f=o.set;return Object.defineProperty(e,n,{configurable:!0,get:function(){return u.call(this)},set:function(y){a=""+y,f.call(this,y)}}),Object.defineProperty(e,n,{enumerable:o.enumerable}),{getValue:function(){return a},setValue:function(y){a=""+y},stopTracking:function(){e._valueTracker=null,delete e[n]}}}}function Me(e){if(!e._valueTracker){var n=Qt(e)?"checked":"value";e._valueTracker=fn(e,n,""+e[n])}}function Bn(e){if(!e)return!1;var n=e._valueTracker;if(!n)return!0;var a=n.getValue(),o="";return e&&(o=Qt(e)?e.checked?"true":"false":e.value),e=o,e!==a?(n.setValue(e),!0):!1}function gi(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}var Ln=/[\n"\\]/g;function mn(e){return e.replace(Ln,function(n){return"\\"+n.charCodeAt(0).toString(16)+" "})}function ze(e,n,a,o,u,f,y,b){e.name="",y!=null&&typeof y!="function"&&typeof y!="symbol"&&typeof y!="boolean"?e.type=y:e.removeAttribute("type"),n!=null?y==="number"?(n===0&&e.value===""||e.value!=n)&&(e.value=""+ie(n)):e.value!==""+ie(n)&&(e.value=""+ie(n)):y!=="submit"&&y!=="reset"||e.removeAttribute("value"),n!=null?An(e,y,ie(n)):a!=null?An(e,y,ie(a)):o!=null&&e.removeAttribute("value"),u==null&&f!=null&&(e.defaultChecked=!!f),u!=null&&(e.checked=u&&typeof u!="function"&&typeof u!="symbol"),b!=null&&typeof b!="function"&&typeof b!="symbol"&&typeof b!="boolean"?e.name=""+ie(b):e.removeAttribute("name")}function Nn(e,n,a,o,u,f,y,b){if(f!=null&&typeof f!="function"&&typeof f!="symbol"&&typeof f!="boolean"&&(e.type=f),n!=null||a!=null){if(!(f!=="submit"&&f!=="reset"||n!=null)){Me(e);return}a=a!=null?""+ie(a):"",n=n!=null?""+ie(n):a,b||n===e.value||(e.value=n),e.defaultValue=n}o=o??u,o=typeof o!="function"&&typeof o!="symbol"&&!!o,e.checked=b?e.checked:!!o,e.defaultChecked=!!o,y!=null&&typeof y!="function"&&typeof y!="symbol"&&typeof y!="boolean"&&(e.name=y),Me(e)}function An(e,n,a){n==="number"&&gi(e.ownerDocument)===e||e.defaultValue===""+a||(e.defaultValue=""+a)}function Ke(e,n,a,o){if(e=e.options,n){n={};for(var u=0;u<a.length;u++)n["$"+a[u]]=!0;for(a=0;a<e.length;a++)u=n.hasOwnProperty("$"+e[a].value),e[a].selected!==u&&(e[a].selected=u),u&&o&&(e[a].defaultSelected=!0)}else{for(a=""+ie(a),n=null,u=0;u<e.length;u++){if(e[u].value===a){e[u].selected=!0,o&&(e[u].defaultSelected=!0);return}n!==null||e[u].disabled||(n=e[u])}n!==null&&(n.selected=!0)}}function xn(e,n,a){if(n!=null&&(n=""+ie(n),n!==e.value&&(e.value=n),a==null)){e.defaultValue!==n&&(e.defaultValue=n);return}e.defaultValue=a!=null?""+ie(a):""}function Nr(e,n,a,o){if(n==null){if(o!=null){if(a!=null)throw Error(r(92));if(gt(o)){if(1<o.length)throw Error(r(93));o=o[0]}a=o}a==null&&(a=""),n=a}a=ie(n),e.defaultValue=a,o=e.textContent,o===a&&o!==""&&o!==null&&(e.value=o),Me(e)}function In(e,n){if(n){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=n;return}}e.textContent=n}var Uv=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function $d(e,n,a){var o=n.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?o?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="":o?e.setProperty(n,a):typeof a!="number"||a===0||Uv.has(n)?n==="float"?e.cssFloat=a:e[n]=(""+a).trim():e[n]=a+"px"}function tp(e,n,a){if(n!=null&&typeof n!="object")throw Error(r(62));if(e=e.style,a!=null){for(var o in a)!a.hasOwnProperty(o)||n!=null&&n.hasOwnProperty(o)||(o.indexOf("--")===0?e.setProperty(o,""):o==="float"?e.cssFloat="":e[o]="");for(var u in n)o=n[u],n.hasOwnProperty(u)&&a[u]!==o&&$d(e,u,o)}else for(var f in n)n.hasOwnProperty(f)&&$d(e,f,n[f])}function iu(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var Lv=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Nv=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function il(e){return Nv.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Fi(){}var au=null;function ru(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Or=null,zr=null;function ep(e){var n=Y(e);if(n&&(e=n.stateNode)){var a=e[yn]||null;t:switch(e=n.stateNode,n.type){case"input":if(ze(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),n=a.name,a.type==="radio"&&n!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+mn(""+n)+'"][type="radio"]'),n=0;n<a.length;n++){var o=a[n];if(o!==e&&o.form===e.form){var u=o[yn]||null;if(!u)throw Error(r(90));ze(o,u.value,u.defaultValue,u.defaultValue,u.checked,u.defaultChecked,u.type,u.name)}}for(n=0;n<a.length;n++)o=a[n],o.form===e.form&&Bn(o)}break t;case"textarea":xn(e,a.value,a.defaultValue);break t;case"select":n=a.value,n!=null&&Ke(e,!!a.multiple,n,!1)}}}var su=!1;function np(e,n,a){if(su)return e(n,a);su=!0;try{var o=e(n);return o}finally{if(su=!1,(Or!==null||zr!==null)&&(Xl(),Or&&(n=Or,e=zr,zr=Or=null,ep(n),e)))for(n=0;n<e.length;n++)ep(e[n])}}function Zs(e,n){var a=e.stateNode;if(a===null)return null;var o=a[yn]||null;if(o===null)return null;a=o[n];t:switch(n){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(o=!o.disabled)||(e=e.type,o=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!o;break t;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(r(231,n,typeof a));return a}var Hi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),ou=!1;if(Hi)try{var js={};Object.defineProperty(js,"passive",{get:function(){ou=!0}}),window.addEventListener("test",js,js),window.removeEventListener("test",js,js)}catch{ou=!1}var pa=null,lu=null,al=null;function ip(){if(al)return al;var e,n=lu,a=n.length,o,u="value"in pa?pa.value:pa.textContent,f=u.length;for(e=0;e<a&&n[e]===u[e];e++);var y=a-e;for(o=1;o<=y&&n[a-o]===u[f-o];o++);return al=u.slice(e,1<o?1-o:void 0)}function rl(e){var n=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&n===13&&(e=13)):e=n,e===10&&(e=13),32<=e||e===13?e:0}function sl(){return!0}function ap(){return!1}function Fn(e){function n(a,o,u,f,y){this._reactName=a,this._targetInst=u,this.type=o,this.nativeEvent=f,this.target=y,this.currentTarget=null;for(var b in e)e.hasOwnProperty(b)&&(a=e[b],this[b]=a?a(f):f[b]);return this.isDefaultPrevented=(f.defaultPrevented!=null?f.defaultPrevented:f.returnValue===!1)?sl:ap,this.isPropagationStopped=ap,this}return _(n.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=sl)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=sl)},persist:function(){},isPersistent:sl}),n}var $a={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},ol=Fn($a),Ks=_({},$a,{view:0,detail:0}),Ov=Fn(Ks),cu,uu,Qs,ll=_({},Ks,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:hu,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Qs&&(Qs&&e.type==="mousemove"?(cu=e.screenX-Qs.screenX,uu=e.screenY-Qs.screenY):uu=cu=0,Qs=e),cu)},movementY:function(e){return"movementY"in e?e.movementY:uu}}),rp=Fn(ll),zv=_({},ll,{dataTransfer:0}),Pv=Fn(zv),Bv=_({},Ks,{relatedTarget:0}),fu=Fn(Bv),Iv=_({},$a,{animationName:0,elapsedTime:0,pseudoElement:0}),Fv=Fn(Iv),Hv=_({},$a,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Gv=Fn(Hv),Vv=_({},$a,{data:0}),sp=Fn(Vv),kv={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Xv={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},qv={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Wv(e){var n=this.nativeEvent;return n.getModifierState?n.getModifierState(e):(e=qv[e])?!!n[e]:!1}function hu(){return Wv}var Yv=_({},Ks,{key:function(e){if(e.key){var n=kv[e.key]||e.key;if(n!=="Unidentified")return n}return e.type==="keypress"?(e=rl(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Xv[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:hu,charCode:function(e){return e.type==="keypress"?rl(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?rl(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Zv=Fn(Yv),jv=_({},ll,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),op=Fn(jv),Kv=_({},Ks,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:hu}),Qv=Fn(Kv),Jv=_({},$a,{propertyName:0,elapsedTime:0,pseudoElement:0}),$v=Fn(Jv),ty=_({},ll,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),ey=Fn(ty),ny=_({},$a,{newState:0,oldState:0}),iy=Fn(ny),ay=[9,13,27,32],du=Hi&&"CompositionEvent"in window,Js=null;Hi&&"documentMode"in document&&(Js=document.documentMode);var ry=Hi&&"TextEvent"in window&&!Js,lp=Hi&&(!du||Js&&8<Js&&11>=Js),cp=" ",up=!1;function fp(e,n){switch(e){case"keyup":return ay.indexOf(n.keyCode)!==-1;case"keydown":return n.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function hp(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Pr=!1;function sy(e,n){switch(e){case"compositionend":return hp(n);case"keypress":return n.which!==32?null:(up=!0,cp);case"textInput":return e=n.data,e===cp&&up?null:e;default:return null}}function oy(e,n){if(Pr)return e==="compositionend"||!du&&fp(e,n)?(e=ip(),al=lu=pa=null,Pr=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(n.ctrlKey||n.altKey||n.metaKey)||n.ctrlKey&&n.altKey){if(n.char&&1<n.char.length)return n.char;if(n.which)return String.fromCharCode(n.which)}return null;case"compositionend":return lp&&n.locale!=="ko"?null:n.data;default:return null}}var ly={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function dp(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n==="input"?!!ly[e.type]:n==="textarea"}function pp(e,n,a,o){Or?zr?zr.push(o):zr=[o]:Or=o,n=Ql(n,"onChange"),0<n.length&&(a=new ol("onChange","change",null,a,o),e.push({event:a,listeners:n}))}var $s=null,to=null;function cy(e){Kg(e,0)}function cl(e){var n=rt(e);if(Bn(n))return e}function mp(e,n){if(e==="change")return n}var gp=!1;if(Hi){var pu;if(Hi){var mu="oninput"in document;if(!mu){var _p=document.createElement("div");_p.setAttribute("oninput","return;"),mu=typeof _p.oninput=="function"}pu=mu}else pu=!1;gp=pu&&(!document.documentMode||9<document.documentMode)}function vp(){$s&&($s.detachEvent("onpropertychange",yp),to=$s=null)}function yp(e){if(e.propertyName==="value"&&cl(to)){var n=[];pp(n,to,e,ru(e)),np(cy,n)}}function uy(e,n,a){e==="focusin"?(vp(),$s=n,to=a,$s.attachEvent("onpropertychange",yp)):e==="focusout"&&vp()}function fy(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return cl(to)}function hy(e,n){if(e==="click")return cl(n)}function dy(e,n){if(e==="input"||e==="change")return cl(n)}function py(e,n){return e===n&&(e!==0||1/e===1/n)||e!==e&&n!==n}var Yn=typeof Object.is=="function"?Object.is:py;function eo(e,n){if(Yn(e,n))return!0;if(typeof e!="object"||e===null||typeof n!="object"||n===null)return!1;var a=Object.keys(e),o=Object.keys(n);if(a.length!==o.length)return!1;for(o=0;o<a.length;o++){var u=a[o];if(!be.call(n,u)||!Yn(e[u],n[u]))return!1}return!0}function xp(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Sp(e,n){var a=xp(e);e=0;for(var o;a;){if(a.nodeType===3){if(o=e+a.textContent.length,e<=n&&o>=n)return{node:a,offset:n-e};e=o}t:{for(;a;){if(a.nextSibling){a=a.nextSibling;break t}a=a.parentNode}a=void 0}a=xp(a)}}function Mp(e,n){return e&&n?e===n?!0:e&&e.nodeType===3?!1:n&&n.nodeType===3?Mp(e,n.parentNode):"contains"in e?e.contains(n):e.compareDocumentPosition?!!(e.compareDocumentPosition(n)&16):!1:!1}function Ep(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var n=gi(e.document);n instanceof e.HTMLIFrameElement;){try{var a=typeof n.contentWindow.location.href=="string"}catch{a=!1}if(a)e=n.contentWindow;else break;n=gi(e.document)}return n}function gu(e){var n=e&&e.nodeName&&e.nodeName.toLowerCase();return n&&(n==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||n==="textarea"||e.contentEditable==="true")}var my=Hi&&"documentMode"in document&&11>=document.documentMode,Br=null,_u=null,no=null,vu=!1;function Tp(e,n,a){var o=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;vu||Br==null||Br!==gi(o)||(o=Br,"selectionStart"in o&&gu(o)?o={start:o.selectionStart,end:o.selectionEnd}:(o=(o.ownerDocument&&o.ownerDocument.defaultView||window).getSelection(),o={anchorNode:o.anchorNode,anchorOffset:o.anchorOffset,focusNode:o.focusNode,focusOffset:o.focusOffset}),no&&eo(no,o)||(no=o,o=Ql(_u,"onSelect"),0<o.length&&(n=new ol("onSelect","select",null,n,a),e.push({event:n,listeners:o}),n.target=Br)))}function tr(e,n){var a={};return a[e.toLowerCase()]=n.toLowerCase(),a["Webkit"+e]="webkit"+n,a["Moz"+e]="moz"+n,a}var Ir={animationend:tr("Animation","AnimationEnd"),animationiteration:tr("Animation","AnimationIteration"),animationstart:tr("Animation","AnimationStart"),transitionrun:tr("Transition","TransitionRun"),transitionstart:tr("Transition","TransitionStart"),transitioncancel:tr("Transition","TransitionCancel"),transitionend:tr("Transition","TransitionEnd")},yu={},bp={};Hi&&(bp=document.createElement("div").style,"AnimationEvent"in window||(delete Ir.animationend.animation,delete Ir.animationiteration.animation,delete Ir.animationstart.animation),"TransitionEvent"in window||delete Ir.transitionend.transition);function er(e){if(yu[e])return yu[e];if(!Ir[e])return e;var n=Ir[e],a;for(a in n)if(n.hasOwnProperty(a)&&a in bp)return yu[e]=n[a];return e}var Ap=er("animationend"),Rp=er("animationiteration"),Cp=er("animationstart"),gy=er("transitionrun"),_y=er("transitionstart"),vy=er("transitioncancel"),wp=er("transitionend"),Dp=new Map,xu="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");xu.push("scrollEnd");function _i(e,n){Dp.set(e,n),Pt(n,[e])}var ul=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var n=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(n))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ii=[],Fr=0,Su=0;function fl(){for(var e=Fr,n=Su=Fr=0;n<e;){var a=ii[n];ii[n++]=null;var o=ii[n];ii[n++]=null;var u=ii[n];ii[n++]=null;var f=ii[n];if(ii[n++]=null,o!==null&&u!==null){var y=o.pending;y===null?u.next=u:(u.next=y.next,y.next=u),o.pending=u}f!==0&&Up(a,u,f)}}function hl(e,n,a,o){ii[Fr++]=e,ii[Fr++]=n,ii[Fr++]=a,ii[Fr++]=o,Su|=o,e.lanes|=o,e=e.alternate,e!==null&&(e.lanes|=o)}function Mu(e,n,a,o){return hl(e,n,a,o),dl(e)}function nr(e,n){return hl(e,null,null,n),dl(e)}function Up(e,n,a){e.lanes|=a;var o=e.alternate;o!==null&&(o.lanes|=a);for(var u=!1,f=e.return;f!==null;)f.childLanes|=a,o=f.alternate,o!==null&&(o.childLanes|=a),f.tag===22&&(e=f.stateNode,e===null||e._visibility&1||(u=!0)),e=f,f=f.return;return e.tag===3?(f=e.stateNode,u&&n!==null&&(u=31-$t(a),e=f.hiddenUpdates,o=e[u],o===null?e[u]=[n]:o.push(n),n.lane=a|536870912),f):null}function dl(e){if(50<bo)throw bo=0,Lf=null,Error(r(185));for(var n=e.return;n!==null;)e=n,n=e.return;return e.tag===3?e.stateNode:null}var Hr={};function yy(e,n,a,o){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=n,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=o,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Zn(e,n,a,o){return new yy(e,n,a,o)}function Eu(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Gi(e,n){var a=e.alternate;return a===null?(a=Zn(e.tag,n,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=n,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&65011712,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,n=e.dependencies,a.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Lp(e,n){e.flags&=65011714;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=n,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,n=a.dependencies,e.dependencies=n===null?null:{lanes:n.lanes,firstContext:n.firstContext}),e}function pl(e,n,a,o,u,f){var y=0;if(o=e,typeof e=="function")Eu(e)&&(y=1);else if(typeof e=="string")y=Tx(e,a,Z.current)?26:e==="html"||e==="head"||e==="body"?27:5;else t:switch(e){case w:return e=Zn(31,a,n,u),e.elementType=w,e.lanes=f,e;case A:return ir(a.children,u,f,n);case S:y=8,u|=24;break;case v:return e=Zn(12,a,n,u|2),e.elementType=v,e.lanes=f,e;case q:return e=Zn(13,a,n,u),e.elementType=q,e.lanes=f,e;case H:return e=Zn(19,a,n,u),e.elementType=H,e.lanes=f,e;default:if(typeof e=="object"&&e!==null)switch(e.$$typeof){case N:y=10;break t;case P:y=9;break t;case D:y=11;break t;case O:y=14;break t;case V:y=16,o=null;break t}y=29,a=Error(r(130,e===null?"null":typeof e,"")),o=null}return n=Zn(y,a,n,u),n.elementType=e,n.type=o,n.lanes=f,n}function ir(e,n,a,o){return e=Zn(7,e,o,n),e.lanes=a,e}function Tu(e,n,a){return e=Zn(6,e,null,n),e.lanes=a,e}function Np(e){var n=Zn(18,null,null,0);return n.stateNode=e,n}function bu(e,n,a){return n=Zn(4,e.children!==null?e.children:[],e.key,n),n.lanes=a,n.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},n}var Op=new WeakMap;function ai(e,n){if(typeof e=="object"&&e!==null){var a=Op.get(e);return a!==void 0?a:(n={value:e,source:n,stack:qt(n)},Op.set(e,n),n)}return{value:e,source:n,stack:qt(n)}}var Gr=[],Vr=0,ml=null,io=0,ri=[],si=0,ma=null,Ci=1,wi="";function Vi(e,n){Gr[Vr++]=io,Gr[Vr++]=ml,ml=e,io=n}function zp(e,n,a){ri[si++]=Ci,ri[si++]=wi,ri[si++]=ma,ma=e;var o=Ci;e=wi;var u=32-$t(o)-1;o&=~(1<<u),a+=1;var f=32-$t(n)+u;if(30<f){var y=u-u%5;f=(o&(1<<y)-1).toString(32),o>>=y,u-=y,Ci=1<<32-$t(n)+u|a<<u|o,wi=f+e}else Ci=1<<f|a<<u|o,wi=e}function Au(e){e.return!==null&&(Vi(e,1),zp(e,1,0))}function Ru(e){for(;e===ml;)ml=Gr[--Vr],Gr[Vr]=null,io=Gr[--Vr],Gr[Vr]=null;for(;e===ma;)ma=ri[--si],ri[si]=null,wi=ri[--si],ri[si]=null,Ci=ri[--si],ri[si]=null}function Pp(e,n){ri[si++]=Ci,ri[si++]=wi,ri[si++]=ma,Ci=n.id,wi=n.overflow,ma=e}var Sn=null,Xe=null,Se=!1,ga=null,oi=!1,Cu=Error(r(519));function _a(e){var n=Error(r(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw ao(ai(n,e)),Cu}function Bp(e){var n=e.stateNode,a=e.type,o=e.memoizedProps;switch(n[je]=e,n[yn]=o,a){case"dialog":pe("cancel",n),pe("close",n);break;case"iframe":case"object":case"embed":pe("load",n);break;case"video":case"audio":for(a=0;a<Ro.length;a++)pe(Ro[a],n);break;case"source":pe("error",n);break;case"img":case"image":case"link":pe("error",n),pe("load",n);break;case"details":pe("toggle",n);break;case"input":pe("invalid",n),Nn(n,o.value,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name,!0);break;case"select":pe("invalid",n);break;case"textarea":pe("invalid",n),Nr(n,o.value,o.defaultValue,o.children)}a=o.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||n.textContent===""+a||o.suppressHydrationWarning===!0||t_(n.textContent,a)?(o.popover!=null&&(pe("beforetoggle",n),pe("toggle",n)),o.onScroll!=null&&pe("scroll",n),o.onScrollEnd!=null&&pe("scrollend",n),o.onClick!=null&&(n.onclick=Fi),n=!0):n=!1,n||_a(e,!0)}function Ip(e){for(Sn=e.return;Sn;)switch(Sn.tag){case 5:case 31:case 13:oi=!1;return;case 27:case 3:oi=!0;return;default:Sn=Sn.return}}function kr(e){if(e!==Sn)return!1;if(!Se)return Ip(e),Se=!0,!1;var n=e.tag,a;if((a=n!==3&&n!==27)&&((a=n===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Yf(e.type,e.memoizedProps)),a=!a),a&&Xe&&_a(e),Ip(e),n===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(r(317));Xe=c_(e)}else if(n===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(r(317));Xe=c_(e)}else n===27?(n=Xe,Ua(e.type)?(e=Jf,Jf=null,Xe=e):Xe=n):Xe=Sn?ci(e.stateNode.nextSibling):null;return!0}function ar(){Xe=Sn=null,Se=!1}function wu(){var e=ga;return e!==null&&(kn===null?kn=e:kn.push.apply(kn,e),ga=null),e}function ao(e){ga===null?ga=[e]:ga.push(e)}var Du=L(null),rr=null,ki=null;function va(e,n,a){St(Du,n._currentValue),n._currentValue=a}function Xi(e){e._currentValue=Du.current,tt(Du)}function Uu(e,n,a){for(;e!==null;){var o=e.alternate;if((e.childLanes&n)!==n?(e.childLanes|=n,o!==null&&(o.childLanes|=n)):o!==null&&(o.childLanes&n)!==n&&(o.childLanes|=n),e===a)break;e=e.return}}function Lu(e,n,a,o){var u=e.child;for(u!==null&&(u.return=e);u!==null;){var f=u.dependencies;if(f!==null){var y=u.child;f=f.firstContext;t:for(;f!==null;){var b=f;f=u;for(var B=0;B<n.length;B++)if(b.context===n[B]){f.lanes|=a,b=f.alternate,b!==null&&(b.lanes|=a),Uu(f.return,a,e),o||(y=null);break t}f=b.next}}else if(u.tag===18){if(y=u.return,y===null)throw Error(r(341));y.lanes|=a,f=y.alternate,f!==null&&(f.lanes|=a),Uu(y,a,e),y=null}else y=u.child;if(y!==null)y.return=u;else for(y=u;y!==null;){if(y===e){y=null;break}if(u=y.sibling,u!==null){u.return=y.return,y=u;break}y=y.return}u=y}}function Xr(e,n,a,o){e=null;for(var u=n,f=!1;u!==null;){if(!f){if((u.flags&524288)!==0)f=!0;else if((u.flags&262144)!==0)break}if(u.tag===10){var y=u.alternate;if(y===null)throw Error(r(387));if(y=y.memoizedProps,y!==null){var b=u.type;Yn(u.pendingProps.value,y.value)||(e!==null?e.push(b):e=[b])}}else if(u===Mt.current){if(y=u.alternate,y===null)throw Error(r(387));y.memoizedState.memoizedState!==u.memoizedState.memoizedState&&(e!==null?e.push(Lo):e=[Lo])}u=u.return}e!==null&&Lu(n,e,a,o),n.flags|=262144}function gl(e){for(e=e.firstContext;e!==null;){if(!Yn(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function sr(e){rr=e,ki=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Mn(e){return Fp(rr,e)}function _l(e,n){return rr===null&&sr(e),Fp(e,n)}function Fp(e,n){var a=n._currentValue;if(n={context:n,memoizedValue:a,next:null},ki===null){if(e===null)throw Error(r(308));ki=n,e.dependencies={lanes:0,firstContext:n},e.flags|=524288}else ki=ki.next=n;return a}var xy=typeof AbortController<"u"?AbortController:function(){var e=[],n=this.signal={aborted:!1,addEventListener:function(a,o){e.push(o)}};this.abort=function(){n.aborted=!0,e.forEach(function(a){return a()})}},Sy=s.unstable_scheduleCallback,My=s.unstable_NormalPriority,an={$$typeof:N,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Nu(){return{controller:new xy,data:new Map,refCount:0}}function ro(e){e.refCount--,e.refCount===0&&Sy(My,function(){e.controller.abort()})}var so=null,Ou=0,qr=0,Wr=null;function Ey(e,n){if(so===null){var a=so=[];Ou=0,qr=If(),Wr={status:"pending",value:void 0,then:function(o){a.push(o)}}}return Ou++,n.then(Hp,Hp),n}function Hp(){if(--Ou===0&&so!==null){Wr!==null&&(Wr.status="fulfilled");var e=so;so=null,qr=0,Wr=null;for(var n=0;n<e.length;n++)(0,e[n])()}}function Ty(e,n){var a=[],o={status:"pending",value:null,reason:null,then:function(u){a.push(u)}};return e.then(function(){o.status="fulfilled",o.value=n;for(var u=0;u<a.length;u++)(0,a[u])(n)},function(u){for(o.status="rejected",o.reason=u,u=0;u<a.length;u++)(0,a[u])(void 0)}),o}var Gp=z.S;z.S=function(e,n){Tg=mt(),typeof n=="object"&&n!==null&&typeof n.then=="function"&&Ey(e,n),Gp!==null&&Gp(e,n)};var or=L(null);function zu(){var e=or.current;return e!==null?e:He.pooledCache}function vl(e,n){n===null?St(or,or.current):St(or,n.pool)}function Vp(){var e=zu();return e===null?null:{parent:an._currentValue,pool:e}}var Yr=Error(r(460)),Pu=Error(r(474)),yl=Error(r(542)),xl={then:function(){}};function kp(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Xp(e,n,a){switch(a=e[a],a===void 0?e.push(n):a!==n&&(n.then(Fi,Fi),n=a),n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,Wp(e),e;default:if(typeof n.status=="string")n.then(Fi,Fi);else{if(e=He,e!==null&&100<e.shellSuspendCounter)throw Error(r(482));e=n,e.status="pending",e.then(function(o){if(n.status==="pending"){var u=n;u.status="fulfilled",u.value=o}},function(o){if(n.status==="pending"){var u=n;u.status="rejected",u.reason=o}})}switch(n.status){case"fulfilled":return n.value;case"rejected":throw e=n.reason,Wp(e),e}throw cr=n,Yr}}function lr(e){try{var n=e._init;return n(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(cr=a,Yr):a}}var cr=null;function qp(){if(cr===null)throw Error(r(459));var e=cr;return cr=null,e}function Wp(e){if(e===Yr||e===yl)throw Error(r(483))}var Zr=null,oo=0;function Sl(e){var n=oo;return oo+=1,Zr===null&&(Zr=[]),Xp(Zr,e,n)}function lo(e,n){n=n.props.ref,e.ref=n!==void 0?n:null}function Ml(e,n){throw n.$$typeof===x?Error(r(525)):(e=Object.prototype.toString.call(n),Error(r(31,e==="[object Object]"?"object with keys {"+Object.keys(n).join(", ")+"}":e)))}function Yp(e){function n(j,G){if(e){var et=j.deletions;et===null?(j.deletions=[G],j.flags|=16):et.push(G)}}function a(j,G){if(!e)return null;for(;G!==null;)n(j,G),G=G.sibling;return null}function o(j){for(var G=new Map;j!==null;)j.key!==null?G.set(j.key,j):G.set(j.index,j),j=j.sibling;return G}function u(j,G){return j=Gi(j,G),j.index=0,j.sibling=null,j}function f(j,G,et){return j.index=et,e?(et=j.alternate,et!==null?(et=et.index,et<G?(j.flags|=67108866,G):et):(j.flags|=67108866,G)):(j.flags|=1048576,G)}function y(j){return e&&j.alternate===null&&(j.flags|=67108866),j}function b(j,G,et,_t){return G===null||G.tag!==6?(G=Tu(et,j.mode,_t),G.return=j,G):(G=u(G,et),G.return=j,G)}function B(j,G,et,_t){var jt=et.type;return jt===A?pt(j,G,et.props.children,_t,et.key):G!==null&&(G.elementType===jt||typeof jt=="object"&&jt!==null&&jt.$$typeof===V&&lr(jt)===G.type)?(G=u(G,et.props),lo(G,et),G.return=j,G):(G=pl(et.type,et.key,et.props,null,j.mode,_t),lo(G,et),G.return=j,G)}function nt(j,G,et,_t){return G===null||G.tag!==4||G.stateNode.containerInfo!==et.containerInfo||G.stateNode.implementation!==et.implementation?(G=bu(et,j.mode,_t),G.return=j,G):(G=u(G,et.children||[]),G.return=j,G)}function pt(j,G,et,_t,jt){return G===null||G.tag!==7?(G=ir(et,j.mode,_t,jt),G.return=j,G):(G=u(G,et),G.return=j,G)}function yt(j,G,et){if(typeof G=="string"&&G!==""||typeof G=="number"||typeof G=="bigint")return G=Tu(""+G,j.mode,et),G.return=j,G;if(typeof G=="object"&&G!==null){switch(G.$$typeof){case M:return et=pl(G.type,G.key,G.props,null,j.mode,et),lo(et,G),et.return=j,et;case E:return G=bu(G,j.mode,et),G.return=j,G;case V:return G=lr(G),yt(j,G,et)}if(gt(G)||J(G))return G=ir(G,j.mode,et,null),G.return=j,G;if(typeof G.then=="function")return yt(j,Sl(G),et);if(G.$$typeof===N)return yt(j,_l(j,G),et);Ml(j,G)}return null}function at(j,G,et,_t){var jt=G!==null?G.key:null;if(typeof et=="string"&&et!==""||typeof et=="number"||typeof et=="bigint")return jt!==null?null:b(j,G,""+et,_t);if(typeof et=="object"&&et!==null){switch(et.$$typeof){case M:return et.key===jt?B(j,G,et,_t):null;case E:return et.key===jt?nt(j,G,et,_t):null;case V:return et=lr(et),at(j,G,et,_t)}if(gt(et)||J(et))return jt!==null?null:pt(j,G,et,_t,null);if(typeof et.then=="function")return at(j,G,Sl(et),_t);if(et.$$typeof===N)return at(j,G,_l(j,et),_t);Ml(j,et)}return null}function lt(j,G,et,_t,jt){if(typeof _t=="string"&&_t!==""||typeof _t=="number"||typeof _t=="bigint")return j=j.get(et)||null,b(G,j,""+_t,jt);if(typeof _t=="object"&&_t!==null){switch(_t.$$typeof){case M:return j=j.get(_t.key===null?et:_t.key)||null,B(G,j,_t,jt);case E:return j=j.get(_t.key===null?et:_t.key)||null,nt(G,j,_t,jt);case V:return _t=lr(_t),lt(j,G,et,_t,jt)}if(gt(_t)||J(_t))return j=j.get(et)||null,pt(G,j,_t,jt,null);if(typeof _t.then=="function")return lt(j,G,et,Sl(_t),jt);if(_t.$$typeof===N)return lt(j,G,et,_l(G,_t),jt);Ml(G,_t)}return null}function Gt(j,G,et,_t){for(var jt=null,Re=null,kt=G,ce=G=0,_e=null;kt!==null&&ce<et.length;ce++){kt.index>ce?(_e=kt,kt=null):_e=kt.sibling;var Ce=at(j,kt,et[ce],_t);if(Ce===null){kt===null&&(kt=_e);break}e&&kt&&Ce.alternate===null&&n(j,kt),G=f(Ce,G,ce),Re===null?jt=Ce:Re.sibling=Ce,Re=Ce,kt=_e}if(ce===et.length)return a(j,kt),Se&&Vi(j,ce),jt;if(kt===null){for(;ce<et.length;ce++)kt=yt(j,et[ce],_t),kt!==null&&(G=f(kt,G,ce),Re===null?jt=kt:Re.sibling=kt,Re=kt);return Se&&Vi(j,ce),jt}for(kt=o(kt);ce<et.length;ce++)_e=lt(kt,j,ce,et[ce],_t),_e!==null&&(e&&_e.alternate!==null&&kt.delete(_e.key===null?ce:_e.key),G=f(_e,G,ce),Re===null?jt=_e:Re.sibling=_e,Re=_e);return e&&kt.forEach(function(Pa){return n(j,Pa)}),Se&&Vi(j,ce),jt}function Jt(j,G,et,_t){if(et==null)throw Error(r(151));for(var jt=null,Re=null,kt=G,ce=G=0,_e=null,Ce=et.next();kt!==null&&!Ce.done;ce++,Ce=et.next()){kt.index>ce?(_e=kt,kt=null):_e=kt.sibling;var Pa=at(j,kt,Ce.value,_t);if(Pa===null){kt===null&&(kt=_e);break}e&&kt&&Pa.alternate===null&&n(j,kt),G=f(Pa,G,ce),Re===null?jt=Pa:Re.sibling=Pa,Re=Pa,kt=_e}if(Ce.done)return a(j,kt),Se&&Vi(j,ce),jt;if(kt===null){for(;!Ce.done;ce++,Ce=et.next())Ce=yt(j,Ce.value,_t),Ce!==null&&(G=f(Ce,G,ce),Re===null?jt=Ce:Re.sibling=Ce,Re=Ce);return Se&&Vi(j,ce),jt}for(kt=o(kt);!Ce.done;ce++,Ce=et.next())Ce=lt(kt,j,ce,Ce.value,_t),Ce!==null&&(e&&Ce.alternate!==null&&kt.delete(Ce.key===null?ce:Ce.key),G=f(Ce,G,ce),Re===null?jt=Ce:Re.sibling=Ce,Re=Ce);return e&&kt.forEach(function(zx){return n(j,zx)}),Se&&Vi(j,ce),jt}function Ie(j,G,et,_t){if(typeof et=="object"&&et!==null&&et.type===A&&et.key===null&&(et=et.props.children),typeof et=="object"&&et!==null){switch(et.$$typeof){case M:t:{for(var jt=et.key;G!==null;){if(G.key===jt){if(jt=et.type,jt===A){if(G.tag===7){a(j,G.sibling),_t=u(G,et.props.children),_t.return=j,j=_t;break t}}else if(G.elementType===jt||typeof jt=="object"&&jt!==null&&jt.$$typeof===V&&lr(jt)===G.type){a(j,G.sibling),_t=u(G,et.props),lo(_t,et),_t.return=j,j=_t;break t}a(j,G);break}else n(j,G);G=G.sibling}et.type===A?(_t=ir(et.props.children,j.mode,_t,et.key),_t.return=j,j=_t):(_t=pl(et.type,et.key,et.props,null,j.mode,_t),lo(_t,et),_t.return=j,j=_t)}return y(j);case E:t:{for(jt=et.key;G!==null;){if(G.key===jt)if(G.tag===4&&G.stateNode.containerInfo===et.containerInfo&&G.stateNode.implementation===et.implementation){a(j,G.sibling),_t=u(G,et.children||[]),_t.return=j,j=_t;break t}else{a(j,G);break}else n(j,G);G=G.sibling}_t=bu(et,j.mode,_t),_t.return=j,j=_t}return y(j);case V:return et=lr(et),Ie(j,G,et,_t)}if(gt(et))return Gt(j,G,et,_t);if(J(et)){if(jt=J(et),typeof jt!="function")throw Error(r(150));return et=jt.call(et),Jt(j,G,et,_t)}if(typeof et.then=="function")return Ie(j,G,Sl(et),_t);if(et.$$typeof===N)return Ie(j,G,_l(j,et),_t);Ml(j,et)}return typeof et=="string"&&et!==""||typeof et=="number"||typeof et=="bigint"?(et=""+et,G!==null&&G.tag===6?(a(j,G.sibling),_t=u(G,et),_t.return=j,j=_t):(a(j,G),_t=Tu(et,j.mode,_t),_t.return=j,j=_t),y(j)):a(j,G)}return function(j,G,et,_t){try{oo=0;var jt=Ie(j,G,et,_t);return Zr=null,jt}catch(kt){if(kt===Yr||kt===yl)throw kt;var Re=Zn(29,kt,null,j.mode);return Re.lanes=_t,Re.return=j,Re}finally{}}}var ur=Yp(!0),Zp=Yp(!1),ya=!1;function Bu(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Iu(e,n){e=e.updateQueue,n.updateQueue===e&&(n.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function xa(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Sa(e,n,a){var o=e.updateQueue;if(o===null)return null;if(o=o.shared,(Ue&2)!==0){var u=o.pending;return u===null?n.next=n:(n.next=u.next,u.next=n),o.pending=n,n=dl(e),Up(e,null,a),n}return hl(e,o,n,a),dl(e)}function co(e,n,a){if(n=n.updateQueue,n!==null&&(n=n.shared,(a&4194048)!==0)){var o=n.lanes;o&=e.pendingLanes,a|=o,n.lanes=a,Xs(e,a)}}function Fu(e,n){var a=e.updateQueue,o=e.alternate;if(o!==null&&(o=o.updateQueue,a===o)){var u=null,f=null;if(a=a.firstBaseUpdate,a!==null){do{var y={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};f===null?u=f=y:f=f.next=y,a=a.next}while(a!==null);f===null?u=f=n:f=f.next=n}else u=f=n;a={baseState:o.baseState,firstBaseUpdate:u,lastBaseUpdate:f,shared:o.shared,callbacks:o.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=n:e.next=n,a.lastBaseUpdate=n}var Hu=!1;function uo(){if(Hu){var e=Wr;if(e!==null)throw e}}function fo(e,n,a,o){Hu=!1;var u=e.updateQueue;ya=!1;var f=u.firstBaseUpdate,y=u.lastBaseUpdate,b=u.shared.pending;if(b!==null){u.shared.pending=null;var B=b,nt=B.next;B.next=null,y===null?f=nt:y.next=nt,y=B;var pt=e.alternate;pt!==null&&(pt=pt.updateQueue,b=pt.lastBaseUpdate,b!==y&&(b===null?pt.firstBaseUpdate=nt:b.next=nt,pt.lastBaseUpdate=B))}if(f!==null){var yt=u.baseState;y=0,pt=nt=B=null,b=f;do{var at=b.lane&-536870913,lt=at!==b.lane;if(lt?(ge&at)===at:(o&at)===at){at!==0&&at===qr&&(Hu=!0),pt!==null&&(pt=pt.next={lane:0,tag:b.tag,payload:b.payload,callback:null,next:null});t:{var Gt=e,Jt=b;at=n;var Ie=a;switch(Jt.tag){case 1:if(Gt=Jt.payload,typeof Gt=="function"){yt=Gt.call(Ie,yt,at);break t}yt=Gt;break t;case 3:Gt.flags=Gt.flags&-65537|128;case 0:if(Gt=Jt.payload,at=typeof Gt=="function"?Gt.call(Ie,yt,at):Gt,at==null)break t;yt=_({},yt,at);break t;case 2:ya=!0}}at=b.callback,at!==null&&(e.flags|=64,lt&&(e.flags|=8192),lt=u.callbacks,lt===null?u.callbacks=[at]:lt.push(at))}else lt={lane:at,tag:b.tag,payload:b.payload,callback:b.callback,next:null},pt===null?(nt=pt=lt,B=yt):pt=pt.next=lt,y|=at;if(b=b.next,b===null){if(b=u.shared.pending,b===null)break;lt=b,b=lt.next,lt.next=null,u.lastBaseUpdate=lt,u.shared.pending=null}}while(!0);pt===null&&(B=yt),u.baseState=B,u.firstBaseUpdate=nt,u.lastBaseUpdate=pt,f===null&&(u.shared.lanes=0),Aa|=y,e.lanes=y,e.memoizedState=yt}}function jp(e,n){if(typeof e!="function")throw Error(r(191,e));e.call(n)}function Kp(e,n){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)jp(a[e],n)}var jr=L(null),El=L(0);function Qp(e,n){e=$i,St(El,e),St(jr,n),$i=e|n.baseLanes}function Gu(){St(El,$i),St(jr,jr.current)}function Vu(){$i=El.current,tt(jr),tt(El)}var jn=L(null),li=null;function Ma(e){var n=e.alternate;St(tn,tn.current&1),St(jn,e),li===null&&(n===null||jr.current!==null||n.memoizedState!==null)&&(li=e)}function ku(e){St(tn,tn.current),St(jn,e),li===null&&(li=e)}function Jp(e){e.tag===22?(St(tn,tn.current),St(jn,e),li===null&&(li=e)):Ea()}function Ea(){St(tn,tn.current),St(jn,jn.current)}function Kn(e){tt(jn),li===e&&(li=null),tt(tn)}var tn=L(0);function Tl(e){for(var n=e;n!==null;){if(n.tag===13){var a=n.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Kf(a)||Qf(a)))return n}else if(n.tag===19&&(n.memoizedProps.revealOrder==="forwards"||n.memoizedProps.revealOrder==="backwards"||n.memoizedProps.revealOrder==="unstable_legacy-backwards"||n.memoizedProps.revealOrder==="together")){if((n.flags&128)!==0)return n}else if(n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return null;n=n.return}n.sibling.return=n.return,n=n.sibling}return null}var qi=0,le=null,Pe=null,rn=null,bl=!1,Kr=!1,fr=!1,Al=0,ho=0,Qr=null,by=0;function Qe(){throw Error(r(321))}function Xu(e,n){if(n===null)return!1;for(var a=0;a<n.length&&a<e.length;a++)if(!Yn(e[a],n[a]))return!1;return!0}function qu(e,n,a,o,u,f){return qi=f,le=n,n.memoizedState=null,n.updateQueue=null,n.lanes=0,z.H=e===null||e.memoizedState===null?zm:of,fr=!1,f=a(o,u),fr=!1,Kr&&(f=tm(n,a,o,u)),$p(e),f}function $p(e){z.H=go;var n=Pe!==null&&Pe.next!==null;if(qi=0,rn=Pe=le=null,bl=!1,ho=0,Qr=null,n)throw Error(r(300));e===null||sn||(e=e.dependencies,e!==null&&gl(e)&&(sn=!0))}function tm(e,n,a,o){le=e;var u=0;do{if(Kr&&(Qr=null),ho=0,Kr=!1,25<=u)throw Error(r(301));if(u+=1,rn=Pe=null,e.updateQueue!=null){var f=e.updateQueue;f.lastEffect=null,f.events=null,f.stores=null,f.memoCache!=null&&(f.memoCache.index=0)}z.H=Pm,f=n(a,o)}while(Kr);return f}function Ay(){var e=z.H,n=e.useState()[0];return n=typeof n.then=="function"?po(n):n,e=e.useState()[0],(Pe!==null?Pe.memoizedState:null)!==e&&(le.flags|=1024),n}function Wu(){var e=Al!==0;return Al=0,e}function Yu(e,n,a){n.updateQueue=e.updateQueue,n.flags&=-2053,e.lanes&=~a}function Zu(e){if(bl){for(e=e.memoizedState;e!==null;){var n=e.queue;n!==null&&(n.pending=null),e=e.next}bl=!1}qi=0,rn=Pe=le=null,Kr=!1,ho=Al=0,Qr=null}function On(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return rn===null?le.memoizedState=rn=e:rn=rn.next=e,rn}function en(){if(Pe===null){var e=le.alternate;e=e!==null?e.memoizedState:null}else e=Pe.next;var n=rn===null?le.memoizedState:rn.next;if(n!==null)rn=n,Pe=e;else{if(e===null)throw le.alternate===null?Error(r(467)):Error(r(310));Pe=e,e={memoizedState:Pe.memoizedState,baseState:Pe.baseState,baseQueue:Pe.baseQueue,queue:Pe.queue,next:null},rn===null?le.memoizedState=rn=e:rn=rn.next=e}return rn}function Rl(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function po(e){var n=ho;return ho+=1,Qr===null&&(Qr=[]),e=Xp(Qr,e,n),n=le,(rn===null?n.memoizedState:rn.next)===null&&(n=n.alternate,z.H=n===null||n.memoizedState===null?zm:of),e}function Cl(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return po(e);if(e.$$typeof===N)return Mn(e)}throw Error(r(438,String(e)))}function ju(e){var n=null,a=le.updateQueue;if(a!==null&&(n=a.memoCache),n==null){var o=le.alternate;o!==null&&(o=o.updateQueue,o!==null&&(o=o.memoCache,o!=null&&(n={data:o.data.map(function(u){return u.slice()}),index:0})))}if(n==null&&(n={data:[],index:0}),a===null&&(a=Rl(),le.updateQueue=a),a.memoCache=n,a=n.data[n.index],a===void 0)for(a=n.data[n.index]=Array(e),o=0;o<e;o++)a[o]=R;return n.index++,a}function Wi(e,n){return typeof n=="function"?n(e):n}function wl(e){var n=en();return Ku(n,Pe,e)}function Ku(e,n,a){var o=e.queue;if(o===null)throw Error(r(311));o.lastRenderedReducer=a;var u=e.baseQueue,f=o.pending;if(f!==null){if(u!==null){var y=u.next;u.next=f.next,f.next=y}n.baseQueue=u=f,o.pending=null}if(f=e.baseState,u===null)e.memoizedState=f;else{n=u.next;var b=y=null,B=null,nt=n,pt=!1;do{var yt=nt.lane&-536870913;if(yt!==nt.lane?(ge&yt)===yt:(qi&yt)===yt){var at=nt.revertLane;if(at===0)B!==null&&(B=B.next={lane:0,revertLane:0,gesture:null,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null}),yt===qr&&(pt=!0);else if((qi&at)===at){nt=nt.next,at===qr&&(pt=!0);continue}else yt={lane:0,revertLane:nt.revertLane,gesture:null,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null},B===null?(b=B=yt,y=f):B=B.next=yt,le.lanes|=at,Aa|=at;yt=nt.action,fr&&a(f,yt),f=nt.hasEagerState?nt.eagerState:a(f,yt)}else at={lane:yt,revertLane:nt.revertLane,gesture:nt.gesture,action:nt.action,hasEagerState:nt.hasEagerState,eagerState:nt.eagerState,next:null},B===null?(b=B=at,y=f):B=B.next=at,le.lanes|=yt,Aa|=yt;nt=nt.next}while(nt!==null&&nt!==n);if(B===null?y=f:B.next=b,!Yn(f,e.memoizedState)&&(sn=!0,pt&&(a=Wr,a!==null)))throw a;e.memoizedState=f,e.baseState=y,e.baseQueue=B,o.lastRenderedState=f}return u===null&&(o.lanes=0),[e.memoizedState,o.dispatch]}function Qu(e){var n=en(),a=n.queue;if(a===null)throw Error(r(311));a.lastRenderedReducer=e;var o=a.dispatch,u=a.pending,f=n.memoizedState;if(u!==null){a.pending=null;var y=u=u.next;do f=e(f,y.action),y=y.next;while(y!==u);Yn(f,n.memoizedState)||(sn=!0),n.memoizedState=f,n.baseQueue===null&&(n.baseState=f),a.lastRenderedState=f}return[f,o]}function em(e,n,a){var o=le,u=en(),f=Se;if(f){if(a===void 0)throw Error(r(407));a=a()}else a=n();var y=!Yn((Pe||u).memoizedState,a);if(y&&(u.memoizedState=a,sn=!0),u=u.queue,tf(am.bind(null,o,u,e),[e]),u.getSnapshot!==n||y||rn!==null&&rn.memoizedState.tag&1){if(o.flags|=2048,Jr(9,{destroy:void 0},im.bind(null,o,u,a,n),null),He===null)throw Error(r(349));f||(qi&127)!==0||nm(o,n,a)}return a}function nm(e,n,a){e.flags|=16384,e={getSnapshot:n,value:a},n=le.updateQueue,n===null?(n=Rl(),le.updateQueue=n,n.stores=[e]):(a=n.stores,a===null?n.stores=[e]:a.push(e))}function im(e,n,a,o){n.value=a,n.getSnapshot=o,rm(n)&&sm(e)}function am(e,n,a){return a(function(){rm(n)&&sm(e)})}function rm(e){var n=e.getSnapshot;e=e.value;try{var a=n();return!Yn(e,a)}catch{return!0}}function sm(e){var n=nr(e,2);n!==null&&Xn(n,e,2)}function Ju(e){var n=On();if(typeof e=="function"){var a=e;if(e=a(),fr){Bt(!0);try{a()}finally{Bt(!1)}}}return n.memoizedState=n.baseState=e,n.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wi,lastRenderedState:e},n}function om(e,n,a,o){return e.baseState=a,Ku(e,Pe,typeof o=="function"?o:Wi)}function Ry(e,n,a,o,u){if(Ll(e))throw Error(r(485));if(e=n.action,e!==null){var f={payload:u,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(y){f.listeners.push(y)}};z.T!==null?a(!0):f.isTransition=!1,o(f),a=n.pending,a===null?(f.next=n.pending=f,lm(n,f)):(f.next=a.next,n.pending=a.next=f)}}function lm(e,n){var a=n.action,o=n.payload,u=e.state;if(n.isTransition){var f=z.T,y={};z.T=y;try{var b=a(u,o),B=z.S;B!==null&&B(y,b),cm(e,n,b)}catch(nt){$u(e,n,nt)}finally{f!==null&&y.types!==null&&(f.types=y.types),z.T=f}}else try{f=a(u,o),cm(e,n,f)}catch(nt){$u(e,n,nt)}}function cm(e,n,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(o){um(e,n,o)},function(o){return $u(e,n,o)}):um(e,n,a)}function um(e,n,a){n.status="fulfilled",n.value=a,fm(n),e.state=a,n=e.pending,n!==null&&(a=n.next,a===n?e.pending=null:(a=a.next,n.next=a,lm(e,a)))}function $u(e,n,a){var o=e.pending;if(e.pending=null,o!==null){o=o.next;do n.status="rejected",n.reason=a,fm(n),n=n.next;while(n!==o)}e.action=null}function fm(e){e=e.listeners;for(var n=0;n<e.length;n++)(0,e[n])()}function hm(e,n){return n}function dm(e,n){if(Se){var a=He.formState;if(a!==null){t:{var o=le;if(Se){if(Xe){e:{for(var u=Xe,f=oi;u.nodeType!==8;){if(!f){u=null;break e}if(u=ci(u.nextSibling),u===null){u=null;break e}}f=u.data,u=f==="F!"||f==="F"?u:null}if(u){Xe=ci(u.nextSibling),o=u.data==="F!";break t}}_a(o)}o=!1}o&&(n=a[0])}}return a=On(),a.memoizedState=a.baseState=n,o={pending:null,lanes:0,dispatch:null,lastRenderedReducer:hm,lastRenderedState:n},a.queue=o,a=Lm.bind(null,le,o),o.dispatch=a,o=Ju(!1),f=sf.bind(null,le,!1,o.queue),o=On(),u={state:n,dispatch:null,action:e,pending:null},o.queue=u,a=Ry.bind(null,le,u,f,a),u.dispatch=a,o.memoizedState=e,[n,a,!1]}function pm(e){var n=en();return mm(n,Pe,e)}function mm(e,n,a){if(n=Ku(e,n,hm)[0],e=wl(Wi)[0],typeof n=="object"&&n!==null&&typeof n.then=="function")try{var o=po(n)}catch(y){throw y===Yr?yl:y}else o=n;n=en();var u=n.queue,f=u.dispatch;return a!==n.memoizedState&&(le.flags|=2048,Jr(9,{destroy:void 0},Cy.bind(null,u,a),null)),[o,f,e]}function Cy(e,n){e.action=n}function gm(e){var n=en(),a=Pe;if(a!==null)return mm(n,a,e);en(),n=n.memoizedState,a=en();var o=a.queue.dispatch;return a.memoizedState=e,[n,o,!1]}function Jr(e,n,a,o){return e={tag:e,create:a,deps:o,inst:n,next:null},n=le.updateQueue,n===null&&(n=Rl(),le.updateQueue=n),a=n.lastEffect,a===null?n.lastEffect=e.next=e:(o=a.next,a.next=e,e.next=o,n.lastEffect=e),e}function _m(){return en().memoizedState}function Dl(e,n,a,o){var u=On();le.flags|=e,u.memoizedState=Jr(1|n,{destroy:void 0},a,o===void 0?null:o)}function Ul(e,n,a,o){var u=en();o=o===void 0?null:o;var f=u.memoizedState.inst;Pe!==null&&o!==null&&Xu(o,Pe.memoizedState.deps)?u.memoizedState=Jr(n,f,a,o):(le.flags|=e,u.memoizedState=Jr(1|n,f,a,o))}function vm(e,n){Dl(8390656,8,e,n)}function tf(e,n){Ul(2048,8,e,n)}function wy(e){le.flags|=4;var n=le.updateQueue;if(n===null)n=Rl(),le.updateQueue=n,n.events=[e];else{var a=n.events;a===null?n.events=[e]:a.push(e)}}function ym(e){var n=en().memoizedState;return wy({ref:n,nextImpl:e}),function(){if((Ue&2)!==0)throw Error(r(440));return n.impl.apply(void 0,arguments)}}function xm(e,n){return Ul(4,2,e,n)}function Sm(e,n){return Ul(4,4,e,n)}function Mm(e,n){if(typeof n=="function"){e=e();var a=n(e);return function(){typeof a=="function"?a():n(null)}}if(n!=null)return e=e(),n.current=e,function(){n.current=null}}function Em(e,n,a){a=a!=null?a.concat([e]):null,Ul(4,4,Mm.bind(null,n,e),a)}function ef(){}function Tm(e,n){var a=en();n=n===void 0?null:n;var o=a.memoizedState;return n!==null&&Xu(n,o[1])?o[0]:(a.memoizedState=[e,n],e)}function bm(e,n){var a=en();n=n===void 0?null:n;var o=a.memoizedState;if(n!==null&&Xu(n,o[1]))return o[0];if(o=e(),fr){Bt(!0);try{e()}finally{Bt(!1)}}return a.memoizedState=[o,n],o}function nf(e,n,a){return a===void 0||(qi&1073741824)!==0&&(ge&261930)===0?e.memoizedState=n:(e.memoizedState=a,e=Ag(),le.lanes|=e,Aa|=e,a)}function Am(e,n,a,o){return Yn(a,n)?a:jr.current!==null?(e=nf(e,a,o),Yn(e,n)||(sn=!0),e):(qi&42)===0||(qi&1073741824)!==0&&(ge&261930)===0?(sn=!0,e.memoizedState=a):(e=Ag(),le.lanes|=e,Aa|=e,n)}function Rm(e,n,a,o,u){var f=K.p;K.p=f!==0&&8>f?f:8;var y=z.T,b={};z.T=b,sf(e,!1,n,a);try{var B=u(),nt=z.S;if(nt!==null&&nt(b,B),B!==null&&typeof B=="object"&&typeof B.then=="function"){var pt=Ty(B,o);mo(e,n,pt,$n(e))}else mo(e,n,o,$n(e))}catch(yt){mo(e,n,{then:function(){},status:"rejected",reason:yt},$n())}finally{K.p=f,y!==null&&b.types!==null&&(y.types=b.types),z.T=y}}function Dy(){}function af(e,n,a,o){if(e.tag!==5)throw Error(r(476));var u=Cm(e).queue;Rm(e,u,n,X,a===null?Dy:function(){return wm(e),a(o)})}function Cm(e){var n=e.memoizedState;if(n!==null)return n;n={memoizedState:X,baseState:X,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wi,lastRenderedState:X},next:null};var a={};return n.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Wi,lastRenderedState:a},next:null},e.memoizedState=n,e=e.alternate,e!==null&&(e.memoizedState=n),n}function wm(e){var n=Cm(e);n.next===null&&(n=e.alternate.memoizedState),mo(e,n.next.queue,{},$n())}function rf(){return Mn(Lo)}function Dm(){return en().memoizedState}function Um(){return en().memoizedState}function Uy(e){for(var n=e.return;n!==null;){switch(n.tag){case 24:case 3:var a=$n();e=xa(a);var o=Sa(n,e,a);o!==null&&(Xn(o,n,a),co(o,n,a)),n={cache:Nu()},e.payload=n;return}n=n.return}}function Ly(e,n,a){var o=$n();a={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Ll(e)?Nm(n,a):(a=Mu(e,n,a,o),a!==null&&(Xn(a,e,o),Om(a,n,o)))}function Lm(e,n,a){var o=$n();mo(e,n,a,o)}function mo(e,n,a,o){var u={lane:o,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Ll(e))Nm(n,u);else{var f=e.alternate;if(e.lanes===0&&(f===null||f.lanes===0)&&(f=n.lastRenderedReducer,f!==null))try{var y=n.lastRenderedState,b=f(y,a);if(u.hasEagerState=!0,u.eagerState=b,Yn(b,y))return hl(e,n,u,0),He===null&&fl(),!1}catch{}finally{}if(a=Mu(e,n,u,o),a!==null)return Xn(a,e,o),Om(a,n,o),!0}return!1}function sf(e,n,a,o){if(o={lane:2,revertLane:If(),gesture:null,action:o,hasEagerState:!1,eagerState:null,next:null},Ll(e)){if(n)throw Error(r(479))}else n=Mu(e,a,o,2),n!==null&&Xn(n,e,2)}function Ll(e){var n=e.alternate;return e===le||n!==null&&n===le}function Nm(e,n){Kr=bl=!0;var a=e.pending;a===null?n.next=n:(n.next=a.next,a.next=n),e.pending=n}function Om(e,n,a){if((a&4194048)!==0){var o=n.lanes;o&=e.pendingLanes,a|=o,n.lanes=a,Xs(e,a)}}var go={readContext:Mn,use:Cl,useCallback:Qe,useContext:Qe,useEffect:Qe,useImperativeHandle:Qe,useLayoutEffect:Qe,useInsertionEffect:Qe,useMemo:Qe,useReducer:Qe,useRef:Qe,useState:Qe,useDebugValue:Qe,useDeferredValue:Qe,useTransition:Qe,useSyncExternalStore:Qe,useId:Qe,useHostTransitionStatus:Qe,useFormState:Qe,useActionState:Qe,useOptimistic:Qe,useMemoCache:Qe,useCacheRefresh:Qe};go.useEffectEvent=Qe;var zm={readContext:Mn,use:Cl,useCallback:function(e,n){return On().memoizedState=[e,n===void 0?null:n],e},useContext:Mn,useEffect:vm,useImperativeHandle:function(e,n,a){a=a!=null?a.concat([e]):null,Dl(4194308,4,Mm.bind(null,n,e),a)},useLayoutEffect:function(e,n){return Dl(4194308,4,e,n)},useInsertionEffect:function(e,n){Dl(4,2,e,n)},useMemo:function(e,n){var a=On();n=n===void 0?null:n;var o=e();if(fr){Bt(!0);try{e()}finally{Bt(!1)}}return a.memoizedState=[o,n],o},useReducer:function(e,n,a){var o=On();if(a!==void 0){var u=a(n);if(fr){Bt(!0);try{a(n)}finally{Bt(!1)}}}else u=n;return o.memoizedState=o.baseState=u,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:u},o.queue=e,e=e.dispatch=Ly.bind(null,le,e),[o.memoizedState,e]},useRef:function(e){var n=On();return e={current:e},n.memoizedState=e},useState:function(e){e=Ju(e);var n=e.queue,a=Lm.bind(null,le,n);return n.dispatch=a,[e.memoizedState,a]},useDebugValue:ef,useDeferredValue:function(e,n){var a=On();return nf(a,e,n)},useTransition:function(){var e=Ju(!1);return e=Rm.bind(null,le,e.queue,!0,!1),On().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,n,a){var o=le,u=On();if(Se){if(a===void 0)throw Error(r(407));a=a()}else{if(a=n(),He===null)throw Error(r(349));(ge&127)!==0||nm(o,n,a)}u.memoizedState=a;var f={value:a,getSnapshot:n};return u.queue=f,vm(am.bind(null,o,f,e),[e]),o.flags|=2048,Jr(9,{destroy:void 0},im.bind(null,o,f,a,n),null),a},useId:function(){var e=On(),n=He.identifierPrefix;if(Se){var a=wi,o=Ci;a=(o&~(1<<32-$t(o)-1)).toString(32)+a,n="_"+n+"R_"+a,a=Al++,0<a&&(n+="H"+a.toString(32)),n+="_"}else a=by++,n="_"+n+"r_"+a.toString(32)+"_";return e.memoizedState=n},useHostTransitionStatus:rf,useFormState:dm,useActionState:dm,useOptimistic:function(e){var n=On();n.memoizedState=n.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return n.queue=a,n=sf.bind(null,le,!0,a),a.dispatch=n,[e,n]},useMemoCache:ju,useCacheRefresh:function(){return On().memoizedState=Uy.bind(null,le)},useEffectEvent:function(e){var n=On(),a={impl:e};return n.memoizedState=a,function(){if((Ue&2)!==0)throw Error(r(440));return a.impl.apply(void 0,arguments)}}},of={readContext:Mn,use:Cl,useCallback:Tm,useContext:Mn,useEffect:tf,useImperativeHandle:Em,useInsertionEffect:xm,useLayoutEffect:Sm,useMemo:bm,useReducer:wl,useRef:_m,useState:function(){return wl(Wi)},useDebugValue:ef,useDeferredValue:function(e,n){var a=en();return Am(a,Pe.memoizedState,e,n)},useTransition:function(){var e=wl(Wi)[0],n=en().memoizedState;return[typeof e=="boolean"?e:po(e),n]},useSyncExternalStore:em,useId:Dm,useHostTransitionStatus:rf,useFormState:pm,useActionState:pm,useOptimistic:function(e,n){var a=en();return om(a,Pe,e,n)},useMemoCache:ju,useCacheRefresh:Um};of.useEffectEvent=ym;var Pm={readContext:Mn,use:Cl,useCallback:Tm,useContext:Mn,useEffect:tf,useImperativeHandle:Em,useInsertionEffect:xm,useLayoutEffect:Sm,useMemo:bm,useReducer:Qu,useRef:_m,useState:function(){return Qu(Wi)},useDebugValue:ef,useDeferredValue:function(e,n){var a=en();return Pe===null?nf(a,e,n):Am(a,Pe.memoizedState,e,n)},useTransition:function(){var e=Qu(Wi)[0],n=en().memoizedState;return[typeof e=="boolean"?e:po(e),n]},useSyncExternalStore:em,useId:Dm,useHostTransitionStatus:rf,useFormState:gm,useActionState:gm,useOptimistic:function(e,n){var a=en();return Pe!==null?om(a,Pe,e,n):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:ju,useCacheRefresh:Um};Pm.useEffectEvent=ym;function lf(e,n,a,o){n=e.memoizedState,a=a(o,n),a=a==null?n:_({},n,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var cf={enqueueSetState:function(e,n,a){e=e._reactInternals;var o=$n(),u=xa(o);u.payload=n,a!=null&&(u.callback=a),n=Sa(e,u,o),n!==null&&(Xn(n,e,o),co(n,e,o))},enqueueReplaceState:function(e,n,a){e=e._reactInternals;var o=$n(),u=xa(o);u.tag=1,u.payload=n,a!=null&&(u.callback=a),n=Sa(e,u,o),n!==null&&(Xn(n,e,o),co(n,e,o))},enqueueForceUpdate:function(e,n){e=e._reactInternals;var a=$n(),o=xa(a);o.tag=2,n!=null&&(o.callback=n),n=Sa(e,o,a),n!==null&&(Xn(n,e,a),co(n,e,a))}};function Bm(e,n,a,o,u,f,y){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(o,f,y):n.prototype&&n.prototype.isPureReactComponent?!eo(a,o)||!eo(u,f):!0}function Im(e,n,a,o){e=n.state,typeof n.componentWillReceiveProps=="function"&&n.componentWillReceiveProps(a,o),typeof n.UNSAFE_componentWillReceiveProps=="function"&&n.UNSAFE_componentWillReceiveProps(a,o),n.state!==e&&cf.enqueueReplaceState(n,n.state,null)}function hr(e,n){var a=n;if("ref"in n){a={};for(var o in n)o!=="ref"&&(a[o]=n[o])}if(e=e.defaultProps){a===n&&(a=_({},a));for(var u in e)a[u]===void 0&&(a[u]=e[u])}return a}function Fm(e){ul(e)}function Hm(e){console.error(e)}function Gm(e){ul(e)}function Nl(e,n){try{var a=e.onUncaughtError;a(n.value,{componentStack:n.stack})}catch(o){setTimeout(function(){throw o})}}function Vm(e,n,a){try{var o=e.onCaughtError;o(a.value,{componentStack:a.stack,errorBoundary:n.tag===1?n.stateNode:null})}catch(u){setTimeout(function(){throw u})}}function uf(e,n,a){return a=xa(a),a.tag=3,a.payload={element:null},a.callback=function(){Nl(e,n)},a}function km(e){return e=xa(e),e.tag=3,e}function Xm(e,n,a,o){var u=a.type.getDerivedStateFromError;if(typeof u=="function"){var f=o.value;e.payload=function(){return u(f)},e.callback=function(){Vm(n,a,o)}}var y=a.stateNode;y!==null&&typeof y.componentDidCatch=="function"&&(e.callback=function(){Vm(n,a,o),typeof u!="function"&&(Ra===null?Ra=new Set([this]):Ra.add(this));var b=o.stack;this.componentDidCatch(o.value,{componentStack:b!==null?b:""})})}function Ny(e,n,a,o,u){if(a.flags|=32768,o!==null&&typeof o=="object"&&typeof o.then=="function"){if(n=a.alternate,n!==null&&Xr(n,a,u,!0),a=jn.current,a!==null){switch(a.tag){case 31:case 13:return li===null?ql():a.alternate===null&&Je===0&&(Je=3),a.flags&=-257,a.flags|=65536,a.lanes=u,o===xl?a.flags|=16384:(n=a.updateQueue,n===null?a.updateQueue=new Set([o]):n.add(o),zf(e,o,u)),!1;case 22:return a.flags|=65536,o===xl?a.flags|=16384:(n=a.updateQueue,n===null?(n={transitions:null,markerInstances:null,retryQueue:new Set([o])},a.updateQueue=n):(a=n.retryQueue,a===null?n.retryQueue=new Set([o]):a.add(o)),zf(e,o,u)),!1}throw Error(r(435,a.tag))}return zf(e,o,u),ql(),!1}if(Se)return n=jn.current,n!==null?((n.flags&65536)===0&&(n.flags|=256),n.flags|=65536,n.lanes=u,o!==Cu&&(e=Error(r(422),{cause:o}),ao(ai(e,a)))):(o!==Cu&&(n=Error(r(423),{cause:o}),ao(ai(n,a))),e=e.current.alternate,e.flags|=65536,u&=-u,e.lanes|=u,o=ai(o,a),u=uf(e.stateNode,o,u),Fu(e,u),Je!==4&&(Je=2)),!1;var f=Error(r(520),{cause:o});if(f=ai(f,a),To===null?To=[f]:To.push(f),Je!==4&&(Je=2),n===null)return!0;o=ai(o,a),a=n;do{switch(a.tag){case 3:return a.flags|=65536,e=u&-u,a.lanes|=e,e=uf(a.stateNode,o,e),Fu(a,e),!1;case 1:if(n=a.type,f=a.stateNode,(a.flags&128)===0&&(typeof n.getDerivedStateFromError=="function"||f!==null&&typeof f.componentDidCatch=="function"&&(Ra===null||!Ra.has(f))))return a.flags|=65536,u&=-u,a.lanes|=u,u=km(u),Xm(u,e,a,o),Fu(a,u),!1}a=a.return}while(a!==null);return!1}var ff=Error(r(461)),sn=!1;function En(e,n,a,o){n.child=e===null?Zp(n,null,a,o):ur(n,e.child,a,o)}function qm(e,n,a,o,u){a=a.render;var f=n.ref;if("ref"in o){var y={};for(var b in o)b!=="ref"&&(y[b]=o[b])}else y=o;return sr(n),o=qu(e,n,a,y,f,u),b=Wu(),e!==null&&!sn?(Yu(e,n,u),Yi(e,n,u)):(Se&&b&&Au(n),n.flags|=1,En(e,n,o,u),n.child)}function Wm(e,n,a,o,u){if(e===null){var f=a.type;return typeof f=="function"&&!Eu(f)&&f.defaultProps===void 0&&a.compare===null?(n.tag=15,n.type=f,Ym(e,n,f,o,u)):(e=pl(a.type,null,o,n,n.mode,u),e.ref=n.ref,e.return=n,n.child=e)}if(f=e.child,!yf(e,u)){var y=f.memoizedProps;if(a=a.compare,a=a!==null?a:eo,a(y,o)&&e.ref===n.ref)return Yi(e,n,u)}return n.flags|=1,e=Gi(f,o),e.ref=n.ref,e.return=n,n.child=e}function Ym(e,n,a,o,u){if(e!==null){var f=e.memoizedProps;if(eo(f,o)&&e.ref===n.ref)if(sn=!1,n.pendingProps=o=f,yf(e,u))(e.flags&131072)!==0&&(sn=!0);else return n.lanes=e.lanes,Yi(e,n,u)}return hf(e,n,a,o,u)}function Zm(e,n,a,o){var u=o.children,f=e!==null?e.memoizedState:null;if(e===null&&n.stateNode===null&&(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),o.mode==="hidden"){if((n.flags&128)!==0){if(f=f!==null?f.baseLanes|a:a,e!==null){for(o=n.child=e.child,u=0;o!==null;)u=u|o.lanes|o.childLanes,o=o.sibling;o=u&~f}else o=0,n.child=null;return jm(e,n,f,a,o)}if((a&536870912)!==0)n.memoizedState={baseLanes:0,cachePool:null},e!==null&&vl(n,f!==null?f.cachePool:null),f!==null?Qp(n,f):Gu(),Jp(n);else return o=n.lanes=536870912,jm(e,n,f!==null?f.baseLanes|a:a,a,o)}else f!==null?(vl(n,f.cachePool),Qp(n,f),Ea(),n.memoizedState=null):(e!==null&&vl(n,null),Gu(),Ea());return En(e,n,u,a),n.child}function _o(e,n){return e!==null&&e.tag===22||n.stateNode!==null||(n.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.sibling}function jm(e,n,a,o,u){var f=zu();return f=f===null?null:{parent:an._currentValue,pool:f},n.memoizedState={baseLanes:a,cachePool:f},e!==null&&vl(n,null),Gu(),Jp(n),e!==null&&Xr(e,n,o,!0),n.childLanes=u,null}function Ol(e,n){return n=Pl({mode:n.mode,children:n.children},e.mode),n.ref=e.ref,e.child=n,n.return=e,n}function Km(e,n,a){return ur(n,e.child,null,a),e=Ol(n,n.pendingProps),e.flags|=2,Kn(n),n.memoizedState=null,e}function Oy(e,n,a){var o=n.pendingProps,u=(n.flags&128)!==0;if(n.flags&=-129,e===null){if(Se){if(o.mode==="hidden")return e=Ol(n,o),n.lanes=536870912,_o(null,e);if(ku(n),(e=Xe)?(e=l_(e,oi),e=e!==null&&e.data==="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Ci,overflow:wi}:null,retryLane:536870912,hydrationErrors:null},a=Np(e),a.return=n,n.child=a,Sn=n,Xe=null)):e=null,e===null)throw _a(n);return n.lanes=536870912,null}return Ol(n,o)}var f=e.memoizedState;if(f!==null){var y=f.dehydrated;if(ku(n),u)if(n.flags&256)n.flags&=-257,n=Km(e,n,a);else if(n.memoizedState!==null)n.child=e.child,n.flags|=128,n=null;else throw Error(r(558));else if(sn||Xr(e,n,a,!1),u=(a&e.childLanes)!==0,sn||u){if(o=He,o!==null&&(y=Ri(o,a),y!==0&&y!==f.retryLane))throw f.retryLane=y,nr(e,y),Xn(o,e,y),ff;ql(),n=Km(e,n,a)}else e=f.treeContext,Xe=ci(y.nextSibling),Sn=n,Se=!0,ga=null,oi=!1,e!==null&&Pp(n,e),n=Ol(n,o),n.flags|=4096;return n}return e=Gi(e.child,{mode:o.mode,children:o.children}),e.ref=n.ref,n.child=e,e.return=n,e}function zl(e,n){var a=n.ref;if(a===null)e!==null&&e.ref!==null&&(n.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(r(284));(e===null||e.ref!==a)&&(n.flags|=4194816)}}function hf(e,n,a,o,u){return sr(n),a=qu(e,n,a,o,void 0,u),o=Wu(),e!==null&&!sn?(Yu(e,n,u),Yi(e,n,u)):(Se&&o&&Au(n),n.flags|=1,En(e,n,a,u),n.child)}function Qm(e,n,a,o,u,f){return sr(n),n.updateQueue=null,a=tm(n,o,a,u),$p(e),o=Wu(),e!==null&&!sn?(Yu(e,n,f),Yi(e,n,f)):(Se&&o&&Au(n),n.flags|=1,En(e,n,a,f),n.child)}function Jm(e,n,a,o,u){if(sr(n),n.stateNode===null){var f=Hr,y=a.contextType;typeof y=="object"&&y!==null&&(f=Mn(y)),f=new a(o,f),n.memoizedState=f.state!==null&&f.state!==void 0?f.state:null,f.updater=cf,n.stateNode=f,f._reactInternals=n,f=n.stateNode,f.props=o,f.state=n.memoizedState,f.refs={},Bu(n),y=a.contextType,f.context=typeof y=="object"&&y!==null?Mn(y):Hr,f.state=n.memoizedState,y=a.getDerivedStateFromProps,typeof y=="function"&&(lf(n,a,y,o),f.state=n.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof f.getSnapshotBeforeUpdate=="function"||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(y=f.state,typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount(),y!==f.state&&cf.enqueueReplaceState(f,f.state,null),fo(n,o,f,u),uo(),f.state=n.memoizedState),typeof f.componentDidMount=="function"&&(n.flags|=4194308),o=!0}else if(e===null){f=n.stateNode;var b=n.memoizedProps,B=hr(a,b);f.props=B;var nt=f.context,pt=a.contextType;y=Hr,typeof pt=="object"&&pt!==null&&(y=Mn(pt));var yt=a.getDerivedStateFromProps;pt=typeof yt=="function"||typeof f.getSnapshotBeforeUpdate=="function",b=n.pendingProps!==b,pt||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(b||nt!==y)&&Im(n,f,o,y),ya=!1;var at=n.memoizedState;f.state=at,fo(n,o,f,u),uo(),nt=n.memoizedState,b||at!==nt||ya?(typeof yt=="function"&&(lf(n,a,yt,o),nt=n.memoizedState),(B=ya||Bm(n,a,B,o,at,nt,y))?(pt||typeof f.UNSAFE_componentWillMount!="function"&&typeof f.componentWillMount!="function"||(typeof f.componentWillMount=="function"&&f.componentWillMount(),typeof f.UNSAFE_componentWillMount=="function"&&f.UNSAFE_componentWillMount()),typeof f.componentDidMount=="function"&&(n.flags|=4194308)):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),n.memoizedProps=o,n.memoizedState=nt),f.props=o,f.state=nt,f.context=y,o=B):(typeof f.componentDidMount=="function"&&(n.flags|=4194308),o=!1)}else{f=n.stateNode,Iu(e,n),y=n.memoizedProps,pt=hr(a,y),f.props=pt,yt=n.pendingProps,at=f.context,nt=a.contextType,B=Hr,typeof nt=="object"&&nt!==null&&(B=Mn(nt)),b=a.getDerivedStateFromProps,(nt=typeof b=="function"||typeof f.getSnapshotBeforeUpdate=="function")||typeof f.UNSAFE_componentWillReceiveProps!="function"&&typeof f.componentWillReceiveProps!="function"||(y!==yt||at!==B)&&Im(n,f,o,B),ya=!1,at=n.memoizedState,f.state=at,fo(n,o,f,u),uo();var lt=n.memoizedState;y!==yt||at!==lt||ya||e!==null&&e.dependencies!==null&&gl(e.dependencies)?(typeof b=="function"&&(lf(n,a,b,o),lt=n.memoizedState),(pt=ya||Bm(n,a,pt,o,at,lt,B)||e!==null&&e.dependencies!==null&&gl(e.dependencies))?(nt||typeof f.UNSAFE_componentWillUpdate!="function"&&typeof f.componentWillUpdate!="function"||(typeof f.componentWillUpdate=="function"&&f.componentWillUpdate(o,lt,B),typeof f.UNSAFE_componentWillUpdate=="function"&&f.UNSAFE_componentWillUpdate(o,lt,B)),typeof f.componentDidUpdate=="function"&&(n.flags|=4),typeof f.getSnapshotBeforeUpdate=="function"&&(n.flags|=1024)):(typeof f.componentDidUpdate!="function"||y===e.memoizedProps&&at===e.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||y===e.memoizedProps&&at===e.memoizedState||(n.flags|=1024),n.memoizedProps=o,n.memoizedState=lt),f.props=o,f.state=lt,f.context=B,o=pt):(typeof f.componentDidUpdate!="function"||y===e.memoizedProps&&at===e.memoizedState||(n.flags|=4),typeof f.getSnapshotBeforeUpdate!="function"||y===e.memoizedProps&&at===e.memoizedState||(n.flags|=1024),o=!1)}return f=o,zl(e,n),o=(n.flags&128)!==0,f||o?(f=n.stateNode,a=o&&typeof a.getDerivedStateFromError!="function"?null:f.render(),n.flags|=1,e!==null&&o?(n.child=ur(n,e.child,null,u),n.child=ur(n,null,a,u)):En(e,n,a,u),n.memoizedState=f.state,e=n.child):e=Yi(e,n,u),e}function $m(e,n,a,o){return ar(),n.flags|=256,En(e,n,a,o),n.child}var df={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function pf(e){return{baseLanes:e,cachePool:Vp()}}function mf(e,n,a){return e=e!==null?e.childLanes&~a:0,n&&(e|=Jn),e}function tg(e,n,a){var o=n.pendingProps,u=!1,f=(n.flags&128)!==0,y;if((y=f)||(y=e!==null&&e.memoizedState===null?!1:(tn.current&2)!==0),y&&(u=!0,n.flags&=-129),y=(n.flags&32)!==0,n.flags&=-33,e===null){if(Se){if(u?Ma(n):Ea(),(e=Xe)?(e=l_(e,oi),e=e!==null&&e.data!=="&"?e:null,e!==null&&(n.memoizedState={dehydrated:e,treeContext:ma!==null?{id:Ci,overflow:wi}:null,retryLane:536870912,hydrationErrors:null},a=Np(e),a.return=n,n.child=a,Sn=n,Xe=null)):e=null,e===null)throw _a(n);return Qf(e)?n.lanes=32:n.lanes=536870912,null}var b=o.children;return o=o.fallback,u?(Ea(),u=n.mode,b=Pl({mode:"hidden",children:b},u),o=ir(o,u,a,null),b.return=n,o.return=n,b.sibling=o,n.child=b,o=n.child,o.memoizedState=pf(a),o.childLanes=mf(e,y,a),n.memoizedState=df,_o(null,o)):(Ma(n),gf(n,b))}var B=e.memoizedState;if(B!==null&&(b=B.dehydrated,b!==null)){if(f)n.flags&256?(Ma(n),n.flags&=-257,n=_f(e,n,a)):n.memoizedState!==null?(Ea(),n.child=e.child,n.flags|=128,n=null):(Ea(),b=o.fallback,u=n.mode,o=Pl({mode:"visible",children:o.children},u),b=ir(b,u,a,null),b.flags|=2,o.return=n,b.return=n,o.sibling=b,n.child=o,ur(n,e.child,null,a),o=n.child,o.memoizedState=pf(a),o.childLanes=mf(e,y,a),n.memoizedState=df,n=_o(null,o));else if(Ma(n),Qf(b)){if(y=b.nextSibling&&b.nextSibling.dataset,y)var nt=y.dgst;y=nt,o=Error(r(419)),o.stack="",o.digest=y,ao({value:o,source:null,stack:null}),n=_f(e,n,a)}else if(sn||Xr(e,n,a,!1),y=(a&e.childLanes)!==0,sn||y){if(y=He,y!==null&&(o=Ri(y,a),o!==0&&o!==B.retryLane))throw B.retryLane=o,nr(e,o),Xn(y,e,o),ff;Kf(b)||ql(),n=_f(e,n,a)}else Kf(b)?(n.flags|=192,n.child=e.child,n=null):(e=B.treeContext,Xe=ci(b.nextSibling),Sn=n,Se=!0,ga=null,oi=!1,e!==null&&Pp(n,e),n=gf(n,o.children),n.flags|=4096);return n}return u?(Ea(),b=o.fallback,u=n.mode,B=e.child,nt=B.sibling,o=Gi(B,{mode:"hidden",children:o.children}),o.subtreeFlags=B.subtreeFlags&65011712,nt!==null?b=Gi(nt,b):(b=ir(b,u,a,null),b.flags|=2),b.return=n,o.return=n,o.sibling=b,n.child=o,_o(null,o),o=n.child,b=e.child.memoizedState,b===null?b=pf(a):(u=b.cachePool,u!==null?(B=an._currentValue,u=u.parent!==B?{parent:B,pool:B}:u):u=Vp(),b={baseLanes:b.baseLanes|a,cachePool:u}),o.memoizedState=b,o.childLanes=mf(e,y,a),n.memoizedState=df,_o(e.child,o)):(Ma(n),a=e.child,e=a.sibling,a=Gi(a,{mode:"visible",children:o.children}),a.return=n,a.sibling=null,e!==null&&(y=n.deletions,y===null?(n.deletions=[e],n.flags|=16):y.push(e)),n.child=a,n.memoizedState=null,a)}function gf(e,n){return n=Pl({mode:"visible",children:n},e.mode),n.return=e,e.child=n}function Pl(e,n){return e=Zn(22,e,null,n),e.lanes=0,e}function _f(e,n,a){return ur(n,e.child,null,a),e=gf(n,n.pendingProps.children),e.flags|=2,n.memoizedState=null,e}function eg(e,n,a){e.lanes|=n;var o=e.alternate;o!==null&&(o.lanes|=n),Uu(e.return,n,a)}function vf(e,n,a,o,u,f){var y=e.memoizedState;y===null?e.memoizedState={isBackwards:n,rendering:null,renderingStartTime:0,last:o,tail:a,tailMode:u,treeForkCount:f}:(y.isBackwards=n,y.rendering=null,y.renderingStartTime=0,y.last=o,y.tail=a,y.tailMode=u,y.treeForkCount=f)}function ng(e,n,a){var o=n.pendingProps,u=o.revealOrder,f=o.tail;o=o.children;var y=tn.current,b=(y&2)!==0;if(b?(y=y&1|2,n.flags|=128):y&=1,St(tn,y),En(e,n,o,a),o=Se?io:0,!b&&e!==null&&(e.flags&128)!==0)t:for(e=n.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&eg(e,a,n);else if(e.tag===19)eg(e,a,n);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===n)break t;for(;e.sibling===null;){if(e.return===null||e.return===n)break t;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(u){case"forwards":for(a=n.child,u=null;a!==null;)e=a.alternate,e!==null&&Tl(e)===null&&(u=a),a=a.sibling;a=u,a===null?(u=n.child,n.child=null):(u=a.sibling,a.sibling=null),vf(n,!1,u,a,f,o);break;case"backwards":case"unstable_legacy-backwards":for(a=null,u=n.child,n.child=null;u!==null;){if(e=u.alternate,e!==null&&Tl(e)===null){n.child=u;break}e=u.sibling,u.sibling=a,a=u,u=e}vf(n,!0,a,null,f,o);break;case"together":vf(n,!1,null,null,void 0,o);break;default:n.memoizedState=null}return n.child}function Yi(e,n,a){if(e!==null&&(n.dependencies=e.dependencies),Aa|=n.lanes,(a&n.childLanes)===0)if(e!==null){if(Xr(e,n,a,!1),(a&n.childLanes)===0)return null}else return null;if(e!==null&&n.child!==e.child)throw Error(r(153));if(n.child!==null){for(e=n.child,a=Gi(e,e.pendingProps),n.child=a,a.return=n;e.sibling!==null;)e=e.sibling,a=a.sibling=Gi(e,e.pendingProps),a.return=n;a.sibling=null}return n.child}function yf(e,n){return(e.lanes&n)!==0?!0:(e=e.dependencies,!!(e!==null&&gl(e)))}function zy(e,n,a){switch(n.tag){case 3:ot(n,n.stateNode.containerInfo),va(n,an,e.memoizedState.cache),ar();break;case 27:case 5:zt(n);break;case 4:ot(n,n.stateNode.containerInfo);break;case 10:va(n,n.type,n.memoizedProps.value);break;case 31:if(n.memoizedState!==null)return n.flags|=128,ku(n),null;break;case 13:var o=n.memoizedState;if(o!==null)return o.dehydrated!==null?(Ma(n),n.flags|=128,null):(a&n.child.childLanes)!==0?tg(e,n,a):(Ma(n),e=Yi(e,n,a),e!==null?e.sibling:null);Ma(n);break;case 19:var u=(e.flags&128)!==0;if(o=(a&n.childLanes)!==0,o||(Xr(e,n,a,!1),o=(a&n.childLanes)!==0),u){if(o)return ng(e,n,a);n.flags|=128}if(u=n.memoizedState,u!==null&&(u.rendering=null,u.tail=null,u.lastEffect=null),St(tn,tn.current),o)break;return null;case 22:return n.lanes=0,Zm(e,n,a,n.pendingProps);case 24:va(n,an,e.memoizedState.cache)}return Yi(e,n,a)}function ig(e,n,a){if(e!==null)if(e.memoizedProps!==n.pendingProps)sn=!0;else{if(!yf(e,a)&&(n.flags&128)===0)return sn=!1,zy(e,n,a);sn=(e.flags&131072)!==0}else sn=!1,Se&&(n.flags&1048576)!==0&&zp(n,io,n.index);switch(n.lanes=0,n.tag){case 16:t:{var o=n.pendingProps;if(e=lr(n.elementType),n.type=e,typeof e=="function")Eu(e)?(o=hr(e,o),n.tag=1,n=Jm(null,n,e,o,a)):(n.tag=0,n=hf(null,n,e,o,a));else{if(e!=null){var u=e.$$typeof;if(u===D){n.tag=11,n=qm(null,n,e,o,a);break t}else if(u===O){n.tag=14,n=Wm(null,n,e,o,a);break t}}throw n=ut(e)||e,Error(r(306,n,""))}}return n;case 0:return hf(e,n,n.type,n.pendingProps,a);case 1:return o=n.type,u=hr(o,n.pendingProps),Jm(e,n,o,u,a);case 3:t:{if(ot(n,n.stateNode.containerInfo),e===null)throw Error(r(387));o=n.pendingProps;var f=n.memoizedState;u=f.element,Iu(e,n),fo(n,o,null,a);var y=n.memoizedState;if(o=y.cache,va(n,an,o),o!==f.cache&&Lu(n,[an],a,!0),uo(),o=y.element,f.isDehydrated)if(f={element:o,isDehydrated:!1,cache:y.cache},n.updateQueue.baseState=f,n.memoizedState=f,n.flags&256){n=$m(e,n,o,a);break t}else if(o!==u){u=ai(Error(r(424)),n),ao(u),n=$m(e,n,o,a);break t}else{switch(e=n.stateNode.containerInfo,e.nodeType){case 9:e=e.body;break;default:e=e.nodeName==="HTML"?e.ownerDocument.body:e}for(Xe=ci(e.firstChild),Sn=n,Se=!0,ga=null,oi=!0,a=Zp(n,null,o,a),n.child=a;a;)a.flags=a.flags&-3|4096,a=a.sibling}else{if(ar(),o===u){n=Yi(e,n,a);break t}En(e,n,o,a)}n=n.child}return n;case 26:return zl(e,n),e===null?(a=p_(n.type,null,n.pendingProps,null))?n.memoizedState=a:Se||(a=n.type,e=n.pendingProps,o=Jl(At.current).createElement(a),o[je]=n,o[yn]=e,Tn(o,a,e),k(o),n.stateNode=o):n.memoizedState=p_(n.type,e.memoizedProps,n.pendingProps,e.memoizedState),null;case 27:return zt(n),e===null&&Se&&(o=n.stateNode=f_(n.type,n.pendingProps,At.current),Sn=n,oi=!0,u=Xe,Ua(n.type)?(Jf=u,Xe=ci(o.firstChild)):Xe=u),En(e,n,n.pendingProps.children,a),zl(e,n),e===null&&(n.flags|=4194304),n.child;case 5:return e===null&&Se&&((u=o=Xe)&&(o=fx(o,n.type,n.pendingProps,oi),o!==null?(n.stateNode=o,Sn=n,Xe=ci(o.firstChild),oi=!1,u=!0):u=!1),u||_a(n)),zt(n),u=n.type,f=n.pendingProps,y=e!==null?e.memoizedProps:null,o=f.children,Yf(u,f)?o=null:y!==null&&Yf(u,y)&&(n.flags|=32),n.memoizedState!==null&&(u=qu(e,n,Ay,null,null,a),Lo._currentValue=u),zl(e,n),En(e,n,o,a),n.child;case 6:return e===null&&Se&&((e=a=Xe)&&(a=hx(a,n.pendingProps,oi),a!==null?(n.stateNode=a,Sn=n,Xe=null,e=!0):e=!1),e||_a(n)),null;case 13:return tg(e,n,a);case 4:return ot(n,n.stateNode.containerInfo),o=n.pendingProps,e===null?n.child=ur(n,null,o,a):En(e,n,o,a),n.child;case 11:return qm(e,n,n.type,n.pendingProps,a);case 7:return En(e,n,n.pendingProps,a),n.child;case 8:return En(e,n,n.pendingProps.children,a),n.child;case 12:return En(e,n,n.pendingProps.children,a),n.child;case 10:return o=n.pendingProps,va(n,n.type,o.value),En(e,n,o.children,a),n.child;case 9:return u=n.type._context,o=n.pendingProps.children,sr(n),u=Mn(u),o=o(u),n.flags|=1,En(e,n,o,a),n.child;case 14:return Wm(e,n,n.type,n.pendingProps,a);case 15:return Ym(e,n,n.type,n.pendingProps,a);case 19:return ng(e,n,a);case 31:return Oy(e,n,a);case 22:return Zm(e,n,a,n.pendingProps);case 24:return sr(n),o=Mn(an),e===null?(u=zu(),u===null&&(u=He,f=Nu(),u.pooledCache=f,f.refCount++,f!==null&&(u.pooledCacheLanes|=a),u=f),n.memoizedState={parent:o,cache:u},Bu(n),va(n,an,u)):((e.lanes&a)!==0&&(Iu(e,n),fo(n,null,null,a),uo()),u=e.memoizedState,f=n.memoizedState,u.parent!==o?(u={parent:o,cache:o},n.memoizedState=u,n.lanes===0&&(n.memoizedState=n.updateQueue.baseState=u),va(n,an,o)):(o=f.cache,va(n,an,o),o!==u.cache&&Lu(n,[an],a,!0))),En(e,n,n.pendingProps.children,a),n.child;case 29:throw n.pendingProps}throw Error(r(156,n.tag))}function Zi(e){e.flags|=4}function xf(e,n,a,o,u){if((n=(e.mode&32)!==0)&&(n=!1),n){if(e.flags|=16777216,(u&335544128)===u)if(e.stateNode.complete)e.flags|=8192;else if(Dg())e.flags|=8192;else throw cr=xl,Pu}else e.flags&=-16777217}function ag(e,n){if(n.type!=="stylesheet"||(n.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!y_(n))if(Dg())e.flags|=8192;else throw cr=xl,Pu}function Bl(e,n){n!==null&&(e.flags|=4),e.flags&16384&&(n=e.tag!==22?un():536870912,e.lanes|=n,ns|=n)}function vo(e,n){if(!Se)switch(e.tailMode){case"hidden":n=e.tail;for(var a=null;n!==null;)n.alternate!==null&&(a=n),n=n.sibling;a===null?e.tail=null:a.sibling=null;break;case"collapsed":a=e.tail;for(var o=null;a!==null;)a.alternate!==null&&(o=a),a=a.sibling;o===null?n||e.tail===null?e.tail=null:e.tail.sibling=null:o.sibling=null}}function qe(e){var n=e.alternate!==null&&e.alternate.child===e.child,a=0,o=0;if(n)for(var u=e.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags&65011712,o|=u.flags&65011712,u.return=e,u=u.sibling;else for(u=e.child;u!==null;)a|=u.lanes|u.childLanes,o|=u.subtreeFlags,o|=u.flags,u.return=e,u=u.sibling;return e.subtreeFlags|=o,e.childLanes=a,n}function Py(e,n,a){var o=n.pendingProps;switch(Ru(n),n.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return qe(n),null;case 1:return qe(n),null;case 3:return a=n.stateNode,o=null,e!==null&&(o=e.memoizedState.cache),n.memoizedState.cache!==o&&(n.flags|=2048),Xi(an),dt(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(kr(n)?Zi(n):e===null||e.memoizedState.isDehydrated&&(n.flags&256)===0||(n.flags|=1024,wu())),qe(n),null;case 26:var u=n.type,f=n.memoizedState;return e===null?(Zi(n),f!==null?(qe(n),ag(n,f)):(qe(n),xf(n,u,null,o,a))):f?f!==e.memoizedState?(Zi(n),qe(n),ag(n,f)):(qe(n),n.flags&=-16777217):(e=e.memoizedProps,e!==o&&Zi(n),qe(n),xf(n,u,e,o,a)),null;case 27:if(Xt(n),a=At.current,u=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==o&&Zi(n);else{if(!o){if(n.stateNode===null)throw Error(r(166));return qe(n),null}e=Z.current,kr(n)?Bp(n):(e=f_(u,o,a),n.stateNode=e,Zi(n))}return qe(n),null;case 5:if(Xt(n),u=n.type,e!==null&&n.stateNode!=null)e.memoizedProps!==o&&Zi(n);else{if(!o){if(n.stateNode===null)throw Error(r(166));return qe(n),null}if(f=Z.current,kr(n))Bp(n);else{var y=Jl(At.current);switch(f){case 1:f=y.createElementNS("http://www.w3.org/2000/svg",u);break;case 2:f=y.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;default:switch(u){case"svg":f=y.createElementNS("http://www.w3.org/2000/svg",u);break;case"math":f=y.createElementNS("http://www.w3.org/1998/Math/MathML",u);break;case"script":f=y.createElement("div"),f.innerHTML="<script><\/script>",f=f.removeChild(f.firstChild);break;case"select":f=typeof o.is=="string"?y.createElement("select",{is:o.is}):y.createElement("select"),o.multiple?f.multiple=!0:o.size&&(f.size=o.size);break;default:f=typeof o.is=="string"?y.createElement(u,{is:o.is}):y.createElement(u)}}f[je]=n,f[yn]=o;t:for(y=n.child;y!==null;){if(y.tag===5||y.tag===6)f.appendChild(y.stateNode);else if(y.tag!==4&&y.tag!==27&&y.child!==null){y.child.return=y,y=y.child;continue}if(y===n)break t;for(;y.sibling===null;){if(y.return===null||y.return===n)break t;y=y.return}y.sibling.return=y.return,y=y.sibling}n.stateNode=f;t:switch(Tn(f,u,o),u){case"button":case"input":case"select":case"textarea":o=!!o.autoFocus;break t;case"img":o=!0;break t;default:o=!1}o&&Zi(n)}}return qe(n),xf(n,n.type,e===null?null:e.memoizedProps,n.pendingProps,a),null;case 6:if(e&&n.stateNode!=null)e.memoizedProps!==o&&Zi(n);else{if(typeof o!="string"&&n.stateNode===null)throw Error(r(166));if(e=At.current,kr(n)){if(e=n.stateNode,a=n.memoizedProps,o=null,u=Sn,u!==null)switch(u.tag){case 27:case 5:o=u.memoizedProps}e[je]=n,e=!!(e.nodeValue===a||o!==null&&o.suppressHydrationWarning===!0||t_(e.nodeValue,a)),e||_a(n,!0)}else e=Jl(e).createTextNode(o),e[je]=n,n.stateNode=e}return qe(n),null;case 31:if(a=n.memoizedState,e===null||e.memoizedState!==null){if(o=kr(n),a!==null){if(e===null){if(!o)throw Error(r(318));if(e=n.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(r(557));e[je]=n}else ar(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;qe(n),e=!1}else a=wu(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return n.flags&256?(Kn(n),n):(Kn(n),null);if((n.flags&128)!==0)throw Error(r(558))}return qe(n),null;case 13:if(o=n.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(u=kr(n),o!==null&&o.dehydrated!==null){if(e===null){if(!u)throw Error(r(318));if(u=n.memoizedState,u=u!==null?u.dehydrated:null,!u)throw Error(r(317));u[je]=n}else ar(),(n.flags&128)===0&&(n.memoizedState=null),n.flags|=4;qe(n),u=!1}else u=wu(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=u),u=!0;if(!u)return n.flags&256?(Kn(n),n):(Kn(n),null)}return Kn(n),(n.flags&128)!==0?(n.lanes=a,n):(a=o!==null,e=e!==null&&e.memoizedState!==null,a&&(o=n.child,u=null,o.alternate!==null&&o.alternate.memoizedState!==null&&o.alternate.memoizedState.cachePool!==null&&(u=o.alternate.memoizedState.cachePool.pool),f=null,o.memoizedState!==null&&o.memoizedState.cachePool!==null&&(f=o.memoizedState.cachePool.pool),f!==u&&(o.flags|=2048)),a!==e&&a&&(n.child.flags|=8192),Bl(n,n.updateQueue),qe(n),null);case 4:return dt(),e===null&&Vf(n.stateNode.containerInfo),qe(n),null;case 10:return Xi(n.type),qe(n),null;case 19:if(tt(tn),o=n.memoizedState,o===null)return qe(n),null;if(u=(n.flags&128)!==0,f=o.rendering,f===null)if(u)vo(o,!1);else{if(Je!==0||e!==null&&(e.flags&128)!==0)for(e=n.child;e!==null;){if(f=Tl(e),f!==null){for(n.flags|=128,vo(o,!1),e=f.updateQueue,n.updateQueue=e,Bl(n,e),n.subtreeFlags=0,e=a,a=n.child;a!==null;)Lp(a,e),a=a.sibling;return St(tn,tn.current&1|2),Se&&Vi(n,o.treeForkCount),n.child}e=e.sibling}o.tail!==null&&mt()>Vl&&(n.flags|=128,u=!0,vo(o,!1),n.lanes=4194304)}else{if(!u)if(e=Tl(f),e!==null){if(n.flags|=128,u=!0,e=e.updateQueue,n.updateQueue=e,Bl(n,e),vo(o,!0),o.tail===null&&o.tailMode==="hidden"&&!f.alternate&&!Se)return qe(n),null}else 2*mt()-o.renderingStartTime>Vl&&a!==536870912&&(n.flags|=128,u=!0,vo(o,!1),n.lanes=4194304);o.isBackwards?(f.sibling=n.child,n.child=f):(e=o.last,e!==null?e.sibling=f:n.child=f,o.last=f)}return o.tail!==null?(e=o.tail,o.rendering=e,o.tail=e.sibling,o.renderingStartTime=mt(),e.sibling=null,a=tn.current,St(tn,u?a&1|2:a&1),Se&&Vi(n,o.treeForkCount),e):(qe(n),null);case 22:case 23:return Kn(n),Vu(),o=n.memoizedState!==null,e!==null?e.memoizedState!==null!==o&&(n.flags|=8192):o&&(n.flags|=8192),o?(a&536870912)!==0&&(n.flags&128)===0&&(qe(n),n.subtreeFlags&6&&(n.flags|=8192)):qe(n),a=n.updateQueue,a!==null&&Bl(n,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),o=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(o=n.memoizedState.cachePool.pool),o!==a&&(n.flags|=2048),e!==null&&tt(or),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),n.memoizedState.cache!==a&&(n.flags|=2048),Xi(an),qe(n),null;case 25:return null;case 30:return null}throw Error(r(156,n.tag))}function By(e,n){switch(Ru(n),n.tag){case 1:return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 3:return Xi(an),dt(),e=n.flags,(e&65536)!==0&&(e&128)===0?(n.flags=e&-65537|128,n):null;case 26:case 27:case 5:return Xt(n),null;case 31:if(n.memoizedState!==null){if(Kn(n),n.alternate===null)throw Error(r(340));ar()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 13:if(Kn(n),e=n.memoizedState,e!==null&&e.dehydrated!==null){if(n.alternate===null)throw Error(r(340));ar()}return e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 19:return tt(tn),null;case 4:return dt(),null;case 10:return Xi(n.type),null;case 22:case 23:return Kn(n),Vu(),e!==null&&tt(or),e=n.flags,e&65536?(n.flags=e&-65537|128,n):null;case 24:return Xi(an),null;case 25:return null;default:return null}}function rg(e,n){switch(Ru(n),n.tag){case 3:Xi(an),dt();break;case 26:case 27:case 5:Xt(n);break;case 4:dt();break;case 31:n.memoizedState!==null&&Kn(n);break;case 13:Kn(n);break;case 19:tt(tn);break;case 10:Xi(n.type);break;case 22:case 23:Kn(n),Vu(),e!==null&&tt(or);break;case 24:Xi(an)}}function yo(e,n){try{var a=n.updateQueue,o=a!==null?a.lastEffect:null;if(o!==null){var u=o.next;a=u;do{if((a.tag&e)===e){o=void 0;var f=a.create,y=a.inst;o=f(),y.destroy=o}a=a.next}while(a!==u)}}catch(b){Ne(n,n.return,b)}}function Ta(e,n,a){try{var o=n.updateQueue,u=o!==null?o.lastEffect:null;if(u!==null){var f=u.next;o=f;do{if((o.tag&e)===e){var y=o.inst,b=y.destroy;if(b!==void 0){y.destroy=void 0,u=n;var B=a,nt=b;try{nt()}catch(pt){Ne(u,B,pt)}}}o=o.next}while(o!==f)}}catch(pt){Ne(n,n.return,pt)}}function sg(e){var n=e.updateQueue;if(n!==null){var a=e.stateNode;try{Kp(n,a)}catch(o){Ne(e,e.return,o)}}}function og(e,n,a){a.props=hr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(o){Ne(e,n,o)}}function xo(e,n){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var o=e.stateNode;break;case 30:o=e.stateNode;break;default:o=e.stateNode}typeof a=="function"?e.refCleanup=a(o):a.current=o}}catch(u){Ne(e,n,u)}}function Di(e,n){var a=e.ref,o=e.refCleanup;if(a!==null)if(typeof o=="function")try{o()}catch(u){Ne(e,n,u)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(u){Ne(e,n,u)}else a.current=null}function lg(e){var n=e.type,a=e.memoizedProps,o=e.stateNode;try{t:switch(n){case"button":case"input":case"select":case"textarea":a.autoFocus&&o.focus();break t;case"img":a.src?o.src=a.src:a.srcSet&&(o.srcset=a.srcSet)}}catch(u){Ne(e,e.return,u)}}function Sf(e,n,a){try{var o=e.stateNode;rx(o,e.type,a,n),o[yn]=n}catch(u){Ne(e,e.return,u)}}function cg(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&Ua(e.type)||e.tag===4}function Mf(e){t:for(;;){for(;e.sibling===null;){if(e.return===null||cg(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&Ua(e.type)||e.flags&2||e.child===null||e.tag===4)continue t;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Ef(e,n,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,n?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(e,n):(n=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,n.appendChild(e),a=a._reactRootContainer,a!=null||n.onclick!==null||(n.onclick=Fi));else if(o!==4&&(o===27&&Ua(e.type)&&(a=e.stateNode,n=null),e=e.child,e!==null))for(Ef(e,n,a),e=e.sibling;e!==null;)Ef(e,n,a),e=e.sibling}function Il(e,n,a){var o=e.tag;if(o===5||o===6)e=e.stateNode,n?a.insertBefore(e,n):a.appendChild(e);else if(o!==4&&(o===27&&Ua(e.type)&&(a=e.stateNode),e=e.child,e!==null))for(Il(e,n,a),e=e.sibling;e!==null;)Il(e,n,a),e=e.sibling}function ug(e){var n=e.stateNode,a=e.memoizedProps;try{for(var o=e.type,u=n.attributes;u.length;)n.removeAttributeNode(u[0]);Tn(n,o,a),n[je]=e,n[yn]=a}catch(f){Ne(e,e.return,f)}}var ji=!1,on=!1,Tf=!1,fg=typeof WeakSet=="function"?WeakSet:Set,gn=null;function Iy(e,n){if(e=e.containerInfo,qf=rc,e=Ep(e),gu(e)){if("selectionStart"in e)var a={start:e.selectionStart,end:e.selectionEnd};else t:{a=(a=e.ownerDocument)&&a.defaultView||window;var o=a.getSelection&&a.getSelection();if(o&&o.rangeCount!==0){a=o.anchorNode;var u=o.anchorOffset,f=o.focusNode;o=o.focusOffset;try{a.nodeType,f.nodeType}catch{a=null;break t}var y=0,b=-1,B=-1,nt=0,pt=0,yt=e,at=null;e:for(;;){for(var lt;yt!==a||u!==0&&yt.nodeType!==3||(b=y+u),yt!==f||o!==0&&yt.nodeType!==3||(B=y+o),yt.nodeType===3&&(y+=yt.nodeValue.length),(lt=yt.firstChild)!==null;)at=yt,yt=lt;for(;;){if(yt===e)break e;if(at===a&&++nt===u&&(b=y),at===f&&++pt===o&&(B=y),(lt=yt.nextSibling)!==null)break;yt=at,at=yt.parentNode}yt=lt}a=b===-1||B===-1?null:{start:b,end:B}}else a=null}a=a||{start:0,end:0}}else a=null;for(Wf={focusedElem:e,selectionRange:a},rc=!1,gn=n;gn!==null;)if(n=gn,e=n.child,(n.subtreeFlags&1028)!==0&&e!==null)e.return=n,gn=e;else for(;gn!==null;){switch(n=gn,f=n.alternate,e=n.flags,n.tag){case 0:if((e&4)!==0&&(e=n.updateQueue,e=e!==null?e.events:null,e!==null))for(a=0;a<e.length;a++)u=e[a],u.ref.impl=u.nextImpl;break;case 11:case 15:break;case 1:if((e&1024)!==0&&f!==null){e=void 0,a=n,u=f.memoizedProps,f=f.memoizedState,o=a.stateNode;try{var Gt=hr(a.type,u);e=o.getSnapshotBeforeUpdate(Gt,f),o.__reactInternalSnapshotBeforeUpdate=e}catch(Jt){Ne(a,a.return,Jt)}}break;case 3:if((e&1024)!==0){if(e=n.stateNode.containerInfo,a=e.nodeType,a===9)jf(e);else if(a===1)switch(e.nodeName){case"HEAD":case"HTML":case"BODY":jf(e);break;default:e.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;default:if((e&1024)!==0)throw Error(r(163))}if(e=n.sibling,e!==null){e.return=n.return,gn=e;break}gn=n.return}}function hg(e,n,a){var o=a.flags;switch(a.tag){case 0:case 11:case 15:Qi(e,a),o&4&&yo(5,a);break;case 1:if(Qi(e,a),o&4)if(e=a.stateNode,n===null)try{e.componentDidMount()}catch(y){Ne(a,a.return,y)}else{var u=hr(a.type,n.memoizedProps);n=n.memoizedState;try{e.componentDidUpdate(u,n,e.__reactInternalSnapshotBeforeUpdate)}catch(y){Ne(a,a.return,y)}}o&64&&sg(a),o&512&&xo(a,a.return);break;case 3:if(Qi(e,a),o&64&&(e=a.updateQueue,e!==null)){if(n=null,a.child!==null)switch(a.child.tag){case 27:case 5:n=a.child.stateNode;break;case 1:n=a.child.stateNode}try{Kp(e,n)}catch(y){Ne(a,a.return,y)}}break;case 27:n===null&&o&4&&ug(a);case 26:case 5:Qi(e,a),n===null&&o&4&&lg(a),o&512&&xo(a,a.return);break;case 12:Qi(e,a);break;case 31:Qi(e,a),o&4&&mg(e,a);break;case 13:Qi(e,a),o&4&&gg(e,a),o&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=Yy.bind(null,a),dx(e,a))));break;case 22:if(o=a.memoizedState!==null||ji,!o){n=n!==null&&n.memoizedState!==null||on,u=ji;var f=on;ji=o,(on=n)&&!f?Ji(e,a,(a.subtreeFlags&8772)!==0):Qi(e,a),ji=u,on=f}break;case 30:break;default:Qi(e,a)}}function dg(e){var n=e.alternate;n!==null&&(e.alternate=null,dg(n)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(n=e.stateNode,n!==null&&Ys(n)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Ye=null,Hn=!1;function Ki(e,n,a){for(a=a.child;a!==null;)pg(e,n,a),a=a.sibling}function pg(e,n,a){if(Wt&&typeof Wt.onCommitFiberUnmount=="function")try{Wt.onCommitFiberUnmount(Yt,a)}catch{}switch(a.tag){case 26:on||Di(a,n),Ki(e,n,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:on||Di(a,n);var o=Ye,u=Hn;Ua(a.type)&&(Ye=a.stateNode,Hn=!1),Ki(e,n,a),wo(a.stateNode),Ye=o,Hn=u;break;case 5:on||Di(a,n);case 6:if(o=Ye,u=Hn,Ye=null,Ki(e,n,a),Ye=o,Hn=u,Ye!==null)if(Hn)try{(Ye.nodeType===9?Ye.body:Ye.nodeName==="HTML"?Ye.ownerDocument.body:Ye).removeChild(a.stateNode)}catch(f){Ne(a,n,f)}else try{Ye.removeChild(a.stateNode)}catch(f){Ne(a,n,f)}break;case 18:Ye!==null&&(Hn?(e=Ye,s_(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),us(e)):s_(Ye,a.stateNode));break;case 4:o=Ye,u=Hn,Ye=a.stateNode.containerInfo,Hn=!0,Ki(e,n,a),Ye=o,Hn=u;break;case 0:case 11:case 14:case 15:Ta(2,a,n),on||Ta(4,a,n),Ki(e,n,a);break;case 1:on||(Di(a,n),o=a.stateNode,typeof o.componentWillUnmount=="function"&&og(a,n,o)),Ki(e,n,a);break;case 21:Ki(e,n,a);break;case 22:on=(o=on)||a.memoizedState!==null,Ki(e,n,a),on=o;break;default:Ki(e,n,a)}}function mg(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{us(e)}catch(a){Ne(n,n.return,a)}}}function gg(e,n){if(n.memoizedState===null&&(e=n.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{us(e)}catch(a){Ne(n,n.return,a)}}function Fy(e){switch(e.tag){case 31:case 13:case 19:var n=e.stateNode;return n===null&&(n=e.stateNode=new fg),n;case 22:return e=e.stateNode,n=e._retryCache,n===null&&(n=e._retryCache=new fg),n;default:throw Error(r(435,e.tag))}}function Fl(e,n){var a=Fy(e);n.forEach(function(o){if(!a.has(o)){a.add(o);var u=Zy.bind(null,e,o);o.then(u,u)}})}function Gn(e,n){var a=n.deletions;if(a!==null)for(var o=0;o<a.length;o++){var u=a[o],f=e,y=n,b=y;t:for(;b!==null;){switch(b.tag){case 27:if(Ua(b.type)){Ye=b.stateNode,Hn=!1;break t}break;case 5:Ye=b.stateNode,Hn=!1;break t;case 3:case 4:Ye=b.stateNode.containerInfo,Hn=!0;break t}b=b.return}if(Ye===null)throw Error(r(160));pg(f,y,u),Ye=null,Hn=!1,f=u.alternate,f!==null&&(f.return=null),u.return=null}if(n.subtreeFlags&13886)for(n=n.child;n!==null;)_g(n,e),n=n.sibling}var vi=null;function _g(e,n){var a=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:Gn(n,e),Vn(e),o&4&&(Ta(3,e,e.return),yo(3,e),Ta(5,e,e.return));break;case 1:Gn(n,e),Vn(e),o&512&&(on||a===null||Di(a,a.return)),o&64&&ji&&(e=e.updateQueue,e!==null&&(o=e.callbacks,o!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?o:a.concat(o))));break;case 26:var u=vi;if(Gn(n,e),Vn(e),o&512&&(on||a===null||Di(a,a.return)),o&4){var f=a!==null?a.memoizedState:null;if(o=e.memoizedState,a===null)if(o===null)if(e.stateNode===null){t:{o=e.type,a=e.memoizedProps,u=u.ownerDocument||u;e:switch(o){case"title":f=u.getElementsByTagName("title")[0],(!f||f[Ja]||f[je]||f.namespaceURI==="http://www.w3.org/2000/svg"||f.hasAttribute("itemprop"))&&(f=u.createElement(o),u.head.insertBefore(f,u.querySelector("head > title"))),Tn(f,o,a),f[je]=e,k(f),o=f;break t;case"link":var y=__("link","href",u).get(o+(a.href||""));if(y){for(var b=0;b<y.length;b++)if(f=y[b],f.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&f.getAttribute("rel")===(a.rel==null?null:a.rel)&&f.getAttribute("title")===(a.title==null?null:a.title)&&f.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){y.splice(b,1);break e}}f=u.createElement(o),Tn(f,o,a),u.head.appendChild(f);break;case"meta":if(y=__("meta","content",u).get(o+(a.content||""))){for(b=0;b<y.length;b++)if(f=y[b],f.getAttribute("content")===(a.content==null?null:""+a.content)&&f.getAttribute("name")===(a.name==null?null:a.name)&&f.getAttribute("property")===(a.property==null?null:a.property)&&f.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&f.getAttribute("charset")===(a.charSet==null?null:a.charSet)){y.splice(b,1);break e}}f=u.createElement(o),Tn(f,o,a),u.head.appendChild(f);break;default:throw Error(r(468,o))}f[je]=e,k(f),o=f}e.stateNode=o}else v_(u,e.type,e.stateNode);else e.stateNode=g_(u,o,e.memoizedProps);else f!==o?(f===null?a.stateNode!==null&&(a=a.stateNode,a.parentNode.removeChild(a)):f.count--,o===null?v_(u,e.type,e.stateNode):g_(u,o,e.memoizedProps)):o===null&&e.stateNode!==null&&Sf(e,e.memoizedProps,a.memoizedProps)}break;case 27:Gn(n,e),Vn(e),o&512&&(on||a===null||Di(a,a.return)),a!==null&&o&4&&Sf(e,e.memoizedProps,a.memoizedProps);break;case 5:if(Gn(n,e),Vn(e),o&512&&(on||a===null||Di(a,a.return)),e.flags&32){u=e.stateNode;try{In(u,"")}catch(Gt){Ne(e,e.return,Gt)}}o&4&&e.stateNode!=null&&(u=e.memoizedProps,Sf(e,u,a!==null?a.memoizedProps:u)),o&1024&&(Tf=!0);break;case 6:if(Gn(n,e),Vn(e),o&4){if(e.stateNode===null)throw Error(r(162));o=e.memoizedProps,a=e.stateNode;try{a.nodeValue=o}catch(Gt){Ne(e,e.return,Gt)}}break;case 3:if(ec=null,u=vi,vi=$l(n.containerInfo),Gn(n,e),vi=u,Vn(e),o&4&&a!==null&&a.memoizedState.isDehydrated)try{us(n.containerInfo)}catch(Gt){Ne(e,e.return,Gt)}Tf&&(Tf=!1,vg(e));break;case 4:o=vi,vi=$l(e.stateNode.containerInfo),Gn(n,e),Vn(e),vi=o;break;case 12:Gn(n,e),Vn(e);break;case 31:Gn(n,e),Vn(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Fl(e,o)));break;case 13:Gn(n,e),Vn(e),e.child.flags&8192&&e.memoizedState!==null!=(a!==null&&a.memoizedState!==null)&&(Gl=mt()),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Fl(e,o)));break;case 22:u=e.memoizedState!==null;var B=a!==null&&a.memoizedState!==null,nt=ji,pt=on;if(ji=nt||u,on=pt||B,Gn(n,e),on=pt,ji=nt,Vn(e),o&8192)t:for(n=e.stateNode,n._visibility=u?n._visibility&-2:n._visibility|1,u&&(a===null||B||ji||on||dr(e)),a=null,n=e;;){if(n.tag===5||n.tag===26){if(a===null){B=a=n;try{if(f=B.stateNode,u)y=f.style,typeof y.setProperty=="function"?y.setProperty("display","none","important"):y.display="none";else{b=B.stateNode;var yt=B.memoizedProps.style,at=yt!=null&&yt.hasOwnProperty("display")?yt.display:null;b.style.display=at==null||typeof at=="boolean"?"":(""+at).trim()}}catch(Gt){Ne(B,B.return,Gt)}}}else if(n.tag===6){if(a===null){B=n;try{B.stateNode.nodeValue=u?"":B.memoizedProps}catch(Gt){Ne(B,B.return,Gt)}}}else if(n.tag===18){if(a===null){B=n;try{var lt=B.stateNode;u?o_(lt,!0):o_(B.stateNode,!1)}catch(Gt){Ne(B,B.return,Gt)}}}else if((n.tag!==22&&n.tag!==23||n.memoizedState===null||n===e)&&n.child!==null){n.child.return=n,n=n.child;continue}if(n===e)break t;for(;n.sibling===null;){if(n.return===null||n.return===e)break t;a===n&&(a=null),n=n.return}a===n&&(a=null),n.sibling.return=n.return,n=n.sibling}o&4&&(o=e.updateQueue,o!==null&&(a=o.retryQueue,a!==null&&(o.retryQueue=null,Fl(e,a))));break;case 19:Gn(n,e),Vn(e),o&4&&(o=e.updateQueue,o!==null&&(e.updateQueue=null,Fl(e,o)));break;case 30:break;case 21:break;default:Gn(n,e),Vn(e)}}function Vn(e){var n=e.flags;if(n&2){try{for(var a,o=e.return;o!==null;){if(cg(o)){a=o;break}o=o.return}if(a==null)throw Error(r(160));switch(a.tag){case 27:var u=a.stateNode,f=Mf(e);Il(e,f,u);break;case 5:var y=a.stateNode;a.flags&32&&(In(y,""),a.flags&=-33);var b=Mf(e);Il(e,b,y);break;case 3:case 4:var B=a.stateNode.containerInfo,nt=Mf(e);Ef(e,nt,B);break;default:throw Error(r(161))}}catch(pt){Ne(e,e.return,pt)}e.flags&=-3}n&4096&&(e.flags&=-4097)}function vg(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var n=e;vg(n),n.tag===5&&n.flags&1024&&n.stateNode.reset(),e=e.sibling}}function Qi(e,n){if(n.subtreeFlags&8772)for(n=n.child;n!==null;)hg(e,n.alternate,n),n=n.sibling}function dr(e){for(e=e.child;e!==null;){var n=e;switch(n.tag){case 0:case 11:case 14:case 15:Ta(4,n,n.return),dr(n);break;case 1:Di(n,n.return);var a=n.stateNode;typeof a.componentWillUnmount=="function"&&og(n,n.return,a),dr(n);break;case 27:wo(n.stateNode);case 26:case 5:Di(n,n.return),dr(n);break;case 22:n.memoizedState===null&&dr(n);break;case 30:dr(n);break;default:dr(n)}e=e.sibling}}function Ji(e,n,a){for(a=a&&(n.subtreeFlags&8772)!==0,n=n.child;n!==null;){var o=n.alternate,u=e,f=n,y=f.flags;switch(f.tag){case 0:case 11:case 15:Ji(u,f,a),yo(4,f);break;case 1:if(Ji(u,f,a),o=f,u=o.stateNode,typeof u.componentDidMount=="function")try{u.componentDidMount()}catch(nt){Ne(o,o.return,nt)}if(o=f,u=o.updateQueue,u!==null){var b=o.stateNode;try{var B=u.shared.hiddenCallbacks;if(B!==null)for(u.shared.hiddenCallbacks=null,u=0;u<B.length;u++)jp(B[u],b)}catch(nt){Ne(o,o.return,nt)}}a&&y&64&&sg(f),xo(f,f.return);break;case 27:ug(f);case 26:case 5:Ji(u,f,a),a&&o===null&&y&4&&lg(f),xo(f,f.return);break;case 12:Ji(u,f,a);break;case 31:Ji(u,f,a),a&&y&4&&mg(u,f);break;case 13:Ji(u,f,a),a&&y&4&&gg(u,f);break;case 22:f.memoizedState===null&&Ji(u,f,a),xo(f,f.return);break;case 30:break;default:Ji(u,f,a)}n=n.sibling}}function bf(e,n){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(e=n.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&ro(a))}function Af(e,n){e=null,n.alternate!==null&&(e=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==e&&(n.refCount++,e!=null&&ro(e))}function yi(e,n,a,o){if(n.subtreeFlags&10256)for(n=n.child;n!==null;)yg(e,n,a,o),n=n.sibling}function yg(e,n,a,o){var u=n.flags;switch(n.tag){case 0:case 11:case 15:yi(e,n,a,o),u&2048&&yo(9,n);break;case 1:yi(e,n,a,o);break;case 3:yi(e,n,a,o),u&2048&&(e=null,n.alternate!==null&&(e=n.alternate.memoizedState.cache),n=n.memoizedState.cache,n!==e&&(n.refCount++,e!=null&&ro(e)));break;case 12:if(u&2048){yi(e,n,a,o),e=n.stateNode;try{var f=n.memoizedProps,y=f.id,b=f.onPostCommit;typeof b=="function"&&b(y,n.alternate===null?"mount":"update",e.passiveEffectDuration,-0)}catch(B){Ne(n,n.return,B)}}else yi(e,n,a,o);break;case 31:yi(e,n,a,o);break;case 13:yi(e,n,a,o);break;case 23:break;case 22:f=n.stateNode,y=n.alternate,n.memoizedState!==null?f._visibility&2?yi(e,n,a,o):So(e,n):f._visibility&2?yi(e,n,a,o):(f._visibility|=2,$r(e,n,a,o,(n.subtreeFlags&10256)!==0||!1)),u&2048&&bf(y,n);break;case 24:yi(e,n,a,o),u&2048&&Af(n.alternate,n);break;default:yi(e,n,a,o)}}function $r(e,n,a,o,u){for(u=u&&((n.subtreeFlags&10256)!==0||!1),n=n.child;n!==null;){var f=e,y=n,b=a,B=o,nt=y.flags;switch(y.tag){case 0:case 11:case 15:$r(f,y,b,B,u),yo(8,y);break;case 23:break;case 22:var pt=y.stateNode;y.memoizedState!==null?pt._visibility&2?$r(f,y,b,B,u):So(f,y):(pt._visibility|=2,$r(f,y,b,B,u)),u&&nt&2048&&bf(y.alternate,y);break;case 24:$r(f,y,b,B,u),u&&nt&2048&&Af(y.alternate,y);break;default:$r(f,y,b,B,u)}n=n.sibling}}function So(e,n){if(n.subtreeFlags&10256)for(n=n.child;n!==null;){var a=e,o=n,u=o.flags;switch(o.tag){case 22:So(a,o),u&2048&&bf(o.alternate,o);break;case 24:So(a,o),u&2048&&Af(o.alternate,o);break;default:So(a,o)}n=n.sibling}}var Mo=8192;function ts(e,n,a){if(e.subtreeFlags&Mo)for(e=e.child;e!==null;)xg(e,n,a),e=e.sibling}function xg(e,n,a){switch(e.tag){case 26:ts(e,n,a),e.flags&Mo&&e.memoizedState!==null&&bx(a,vi,e.memoizedState,e.memoizedProps);break;case 5:ts(e,n,a);break;case 3:case 4:var o=vi;vi=$l(e.stateNode.containerInfo),ts(e,n,a),vi=o;break;case 22:e.memoizedState===null&&(o=e.alternate,o!==null&&o.memoizedState!==null?(o=Mo,Mo=16777216,ts(e,n,a),Mo=o):ts(e,n,a));break;default:ts(e,n,a)}}function Sg(e){var n=e.alternate;if(n!==null&&(e=n.child,e!==null)){n.child=null;do n=e.sibling,e.sibling=null,e=n;while(e!==null)}}function Eo(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];gn=o,Eg(o,e)}Sg(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Mg(e),e=e.sibling}function Mg(e){switch(e.tag){case 0:case 11:case 15:Eo(e),e.flags&2048&&Ta(9,e,e.return);break;case 3:Eo(e);break;case 12:Eo(e);break;case 22:var n=e.stateNode;e.memoizedState!==null&&n._visibility&2&&(e.return===null||e.return.tag!==13)?(n._visibility&=-3,Hl(e)):Eo(e);break;default:Eo(e)}}function Hl(e){var n=e.deletions;if((e.flags&16)!==0){if(n!==null)for(var a=0;a<n.length;a++){var o=n[a];gn=o,Eg(o,e)}Sg(e)}for(e=e.child;e!==null;){switch(n=e,n.tag){case 0:case 11:case 15:Ta(8,n,n.return),Hl(n);break;case 22:a=n.stateNode,a._visibility&2&&(a._visibility&=-3,Hl(n));break;default:Hl(n)}e=e.sibling}}function Eg(e,n){for(;gn!==null;){var a=gn;switch(a.tag){case 0:case 11:case 15:Ta(8,a,n);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var o=a.memoizedState.cachePool.pool;o!=null&&o.refCount++}break;case 24:ro(a.memoizedState.cache)}if(o=a.child,o!==null)o.return=a,gn=o;else t:for(a=e;gn!==null;){o=gn;var u=o.sibling,f=o.return;if(dg(o),o===a){gn=null;break t}if(u!==null){u.return=f,gn=u;break t}gn=f}}}var Hy={getCacheForType:function(e){var n=Mn(an),a=n.data.get(e);return a===void 0&&(a=e(),n.data.set(e,a)),a},cacheSignal:function(){return Mn(an).controller.signal}},Gy=typeof WeakMap=="function"?WeakMap:Map,Ue=0,He=null,de=null,ge=0,Le=0,Qn=null,ba=!1,es=!1,Rf=!1,$i=0,Je=0,Aa=0,pr=0,Cf=0,Jn=0,ns=0,To=null,kn=null,wf=!1,Gl=0,Tg=0,Vl=1/0,kl=null,Ra=null,hn=0,Ca=null,is=null,ta=0,Df=0,Uf=null,bg=null,bo=0,Lf=null;function $n(){return(Ue&2)!==0&&ge!==0?ge&-ge:z.T!==null?If():qs()}function Ag(){if(Jn===0)if((ge&536870912)===0||Se){var e=ct;ct<<=1,(ct&3932160)===0&&(ct=262144),Jn=e}else Jn=536870912;return e=jn.current,e!==null&&(e.flags|=32),Jn}function Xn(e,n,a){(e===He&&(Le===2||Le===9)||e.cancelPendingCommit!==null)&&(as(e,0),wa(e,ge,Jn,!1)),vn(e,a),((Ue&2)===0||e!==He)&&(e===He&&((Ue&2)===0&&(pr|=a),Je===4&&wa(e,ge,Jn,!1)),Ui(e))}function Rg(e,n,a){if((Ue&6)!==0)throw Error(r(327));var o=!a&&(n&127)===0&&(n&e.expiredLanes)===0||te(e,n),u=o?Xy(e,n):Of(e,n,!0),f=o;do{if(u===0){es&&!o&&wa(e,n,0,!1);break}else{if(a=e.current.alternate,f&&!Vy(a)){u=Of(e,n,!1),f=!1;continue}if(u===2){if(f=n,e.errorRecoveryDisabledLanes&f)var y=0;else y=e.pendingLanes&-536870913,y=y!==0?y:y&536870912?536870912:0;if(y!==0){n=y;t:{var b=e;u=To;var B=b.current.memoizedState.isDehydrated;if(B&&(as(b,y).flags|=256),y=Of(b,y,!1),y!==2){if(Rf&&!B){b.errorRecoveryDisabledLanes|=f,pr|=f,u=4;break t}f=kn,kn=u,f!==null&&(kn===null?kn=f:kn.push.apply(kn,f))}u=y}if(f=!1,u!==2)continue}}if(u===1){as(e,0),wa(e,n,0,!0);break}t:{switch(o=e,f=u,f){case 0:case 1:throw Error(r(345));case 4:if((n&4194048)!==n)break;case 6:wa(o,n,Jn,!ba);break t;case 2:kn=null;break;case 3:case 5:break;default:throw Error(r(329))}if((n&62914560)===n&&(u=Gl+300-mt(),10<u)){if(wa(o,n,Jn,!ba),Lt(o,0,!0)!==0)break t;ta=n,o.timeoutHandle=a_(Cg.bind(null,o,a,kn,kl,wf,n,Jn,pr,ns,ba,f,"Throttled",-0,0),u);break t}Cg(o,a,kn,kl,wf,n,Jn,pr,ns,ba,f,null,-0,0)}}break}while(!0);Ui(e)}function Cg(e,n,a,o,u,f,y,b,B,nt,pt,yt,at,lt){if(e.timeoutHandle=-1,yt=n.subtreeFlags,yt&8192||(yt&16785408)===16785408){yt={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Fi},xg(n,f,yt);var Gt=(f&62914560)===f?Gl-mt():(f&4194048)===f?Tg-mt():0;if(Gt=Ax(yt,Gt),Gt!==null){ta=f,e.cancelPendingCommit=Gt(Pg.bind(null,e,n,f,a,o,u,y,b,B,pt,yt,null,at,lt)),wa(e,f,y,!nt);return}}Pg(e,n,f,a,o,u,y,b,B)}function Vy(e){for(var n=e;;){var a=n.tag;if((a===0||a===11||a===15)&&n.flags&16384&&(a=n.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var o=0;o<a.length;o++){var u=a[o],f=u.getSnapshot;u=u.value;try{if(!Yn(f(),u))return!1}catch{return!1}}if(a=n.child,n.subtreeFlags&16384&&a!==null)a.return=n,n=a;else{if(n===e)break;for(;n.sibling===null;){if(n.return===null||n.return===e)return!0;n=n.return}n.sibling.return=n.return,n=n.sibling}}return!0}function wa(e,n,a,o){n&=~Cf,n&=~pr,e.suspendedLanes|=n,e.pingedLanes&=~n,o&&(e.warmLanes|=n),o=e.expirationTimes;for(var u=n;0<u;){var f=31-$t(u),y=1<<f;o[f]=-1,u&=~y}a!==0&&ks(e,a,n)}function Xl(){return(Ue&6)===0?(Ao(0),!1):!0}function Nf(){if(de!==null){if(Le===0)var e=de.return;else e=de,ki=rr=null,Zu(e),Zr=null,oo=0,e=de;for(;e!==null;)rg(e.alternate,e),e=e.return;de=null}}function as(e,n){var a=e.timeoutHandle;a!==-1&&(e.timeoutHandle=-1,lx(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),ta=0,Nf(),He=e,de=a=Gi(e.current,null),ge=n,Le=0,Qn=null,ba=!1,es=te(e,n),Rf=!1,ns=Jn=Cf=pr=Aa=Je=0,kn=To=null,wf=!1,(n&8)!==0&&(n|=n&32);var o=e.entangledLanes;if(o!==0)for(e=e.entanglements,o&=n;0<o;){var u=31-$t(o),f=1<<u;n|=e[u],o&=~f}return $i=n,fl(),a}function wg(e,n){le=null,z.H=go,n===Yr||n===yl?(n=qp(),Le=3):n===Pu?(n=qp(),Le=4):Le=n===ff?8:n!==null&&typeof n=="object"&&typeof n.then=="function"?6:1,Qn=n,de===null&&(Je=1,Nl(e,ai(n,e.current)))}function Dg(){var e=jn.current;return e===null?!0:(ge&4194048)===ge?li===null:(ge&62914560)===ge||(ge&536870912)!==0?e===li:!1}function Ug(){var e=z.H;return z.H=go,e===null?go:e}function Lg(){var e=z.A;return z.A=Hy,e}function ql(){Je=4,ba||(ge&4194048)!==ge&&jn.current!==null||(es=!0),(Aa&134217727)===0&&(pr&134217727)===0||He===null||wa(He,ge,Jn,!1)}function Of(e,n,a){var o=Ue;Ue|=2;var u=Ug(),f=Lg();(He!==e||ge!==n)&&(kl=null,as(e,n)),n=!1;var y=Je;t:do try{if(Le!==0&&de!==null){var b=de,B=Qn;switch(Le){case 8:Nf(),y=6;break t;case 3:case 2:case 9:case 6:jn.current===null&&(n=!0);var nt=Le;if(Le=0,Qn=null,rs(e,b,B,nt),a&&es){y=0;break t}break;default:nt=Le,Le=0,Qn=null,rs(e,b,B,nt)}}ky(),y=Je;break}catch(pt){wg(e,pt)}while(!0);return n&&e.shellSuspendCounter++,ki=rr=null,Ue=o,z.H=u,z.A=f,de===null&&(He=null,ge=0,fl()),y}function ky(){for(;de!==null;)Ng(de)}function Xy(e,n){var a=Ue;Ue|=2;var o=Ug(),u=Lg();He!==e||ge!==n?(kl=null,Vl=mt()+500,as(e,n)):es=te(e,n);t:do try{if(Le!==0&&de!==null){n=de;var f=Qn;e:switch(Le){case 1:Le=0,Qn=null,rs(e,n,f,1);break;case 2:case 9:if(kp(f)){Le=0,Qn=null,Og(n);break}n=function(){Le!==2&&Le!==9||He!==e||(Le=7),Ui(e)},f.then(n,n);break t;case 3:Le=7;break t;case 4:Le=5;break t;case 7:kp(f)?(Le=0,Qn=null,Og(n)):(Le=0,Qn=null,rs(e,n,f,7));break;case 5:var y=null;switch(de.tag){case 26:y=de.memoizedState;case 5:case 27:var b=de;if(y?y_(y):b.stateNode.complete){Le=0,Qn=null;var B=b.sibling;if(B!==null)de=B;else{var nt=b.return;nt!==null?(de=nt,Wl(nt)):de=null}break e}}Le=0,Qn=null,rs(e,n,f,5);break;case 6:Le=0,Qn=null,rs(e,n,f,6);break;case 8:Nf(),Je=6;break t;default:throw Error(r(462))}}qy();break}catch(pt){wg(e,pt)}while(!0);return ki=rr=null,z.H=o,z.A=u,Ue=a,de!==null?0:(He=null,ge=0,fl(),Je)}function qy(){for(;de!==null&&!T();)Ng(de)}function Ng(e){var n=ig(e.alternate,e,$i);e.memoizedProps=e.pendingProps,n===null?Wl(e):de=n}function Og(e){var n=e,a=n.alternate;switch(n.tag){case 15:case 0:n=Qm(a,n,n.pendingProps,n.type,void 0,ge);break;case 11:n=Qm(a,n,n.pendingProps,n.type.render,n.ref,ge);break;case 5:Zu(n);default:rg(a,n),n=de=Lp(n,$i),n=ig(a,n,$i)}e.memoizedProps=e.pendingProps,n===null?Wl(e):de=n}function rs(e,n,a,o){ki=rr=null,Zu(n),Zr=null,oo=0;var u=n.return;try{if(Ny(e,u,n,a,ge)){Je=1,Nl(e,ai(a,e.current)),de=null;return}}catch(f){if(u!==null)throw de=u,f;Je=1,Nl(e,ai(a,e.current)),de=null;return}n.flags&32768?(Se||o===1?e=!0:es||(ge&536870912)!==0?e=!1:(ba=e=!0,(o===2||o===9||o===3||o===6)&&(o=jn.current,o!==null&&o.tag===13&&(o.flags|=16384))),zg(n,e)):Wl(n)}function Wl(e){var n=e;do{if((n.flags&32768)!==0){zg(n,ba);return}e=n.return;var a=Py(n.alternate,n,$i);if(a!==null){de=a;return}if(n=n.sibling,n!==null){de=n;return}de=n=e}while(n!==null);Je===0&&(Je=5)}function zg(e,n){do{var a=By(e.alternate,e);if(a!==null){a.flags&=32767,de=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!n&&(e=e.sibling,e!==null)){de=e;return}de=e=a}while(e!==null);Je=6,de=null}function Pg(e,n,a,o,u,f,y,b,B){e.cancelPendingCommit=null;do Yl();while(hn!==0);if((Ue&6)!==0)throw Error(r(327));if(n!==null){if(n===e.current)throw Error(r(177));if(f=n.lanes|n.childLanes,f|=Su,pi(e,a,f,y,b,B),e===He&&(de=He=null,ge=0),is=n,Ca=e,ta=a,Df=f,Uf=u,bg=o,(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?(e.callbackNode=null,e.callbackPriority=0,jy(Ut,function(){return Gg(),null})):(e.callbackNode=null,e.callbackPriority=0),o=(n.flags&13878)!==0,(n.subtreeFlags&13878)!==0||o){o=z.T,z.T=null,u=K.p,K.p=2,y=Ue,Ue|=4;try{Iy(e,n,a)}finally{Ue=y,K.p=u,z.T=o}}hn=1,Bg(),Ig(),Fg()}}function Bg(){if(hn===1){hn=0;var e=Ca,n=is,a=(n.flags&13878)!==0;if((n.subtreeFlags&13878)!==0||a){a=z.T,z.T=null;var o=K.p;K.p=2;var u=Ue;Ue|=4;try{_g(n,e);var f=Wf,y=Ep(e.containerInfo),b=f.focusedElem,B=f.selectionRange;if(y!==b&&b&&b.ownerDocument&&Mp(b.ownerDocument.documentElement,b)){if(B!==null&&gu(b)){var nt=B.start,pt=B.end;if(pt===void 0&&(pt=nt),"selectionStart"in b)b.selectionStart=nt,b.selectionEnd=Math.min(pt,b.value.length);else{var yt=b.ownerDocument||document,at=yt&&yt.defaultView||window;if(at.getSelection){var lt=at.getSelection(),Gt=b.textContent.length,Jt=Math.min(B.start,Gt),Ie=B.end===void 0?Jt:Math.min(B.end,Gt);!lt.extend&&Jt>Ie&&(y=Ie,Ie=Jt,Jt=y);var j=Sp(b,Jt),G=Sp(b,Ie);if(j&&G&&(lt.rangeCount!==1||lt.anchorNode!==j.node||lt.anchorOffset!==j.offset||lt.focusNode!==G.node||lt.focusOffset!==G.offset)){var et=yt.createRange();et.setStart(j.node,j.offset),lt.removeAllRanges(),Jt>Ie?(lt.addRange(et),lt.extend(G.node,G.offset)):(et.setEnd(G.node,G.offset),lt.addRange(et))}}}}for(yt=[],lt=b;lt=lt.parentNode;)lt.nodeType===1&&yt.push({element:lt,left:lt.scrollLeft,top:lt.scrollTop});for(typeof b.focus=="function"&&b.focus(),b=0;b<yt.length;b++){var _t=yt[b];_t.element.scrollLeft=_t.left,_t.element.scrollTop=_t.top}}rc=!!qf,Wf=qf=null}finally{Ue=u,K.p=o,z.T=a}}e.current=n,hn=2}}function Ig(){if(hn===2){hn=0;var e=Ca,n=is,a=(n.flags&8772)!==0;if((n.subtreeFlags&8772)!==0||a){a=z.T,z.T=null;var o=K.p;K.p=2;var u=Ue;Ue|=4;try{hg(e,n.alternate,n)}finally{Ue=u,K.p=o,z.T=a}}hn=3}}function Fg(){if(hn===4||hn===3){hn=0,it();var e=Ca,n=is,a=ta,o=bg;(n.subtreeFlags&10256)!==0||(n.flags&10256)!==0?hn=5:(hn=0,is=Ca=null,Hg(e,e.pendingLanes));var u=e.pendingLanes;if(u===0&&(Ra=null),Lr(a),n=n.stateNode,Wt&&typeof Wt.onCommitFiberRoot=="function")try{Wt.onCommitFiberRoot(Yt,n,void 0,(n.current.flags&128)===128)}catch{}if(o!==null){n=z.T,u=K.p,K.p=2,z.T=null;try{for(var f=e.onRecoverableError,y=0;y<o.length;y++){var b=o[y];f(b.value,{componentStack:b.stack})}}finally{z.T=n,K.p=u}}(ta&3)!==0&&Yl(),Ui(e),u=e.pendingLanes,(a&261930)!==0&&(u&42)!==0?e===Lf?bo++:(bo=0,Lf=e):bo=0,Ao(0)}}function Hg(e,n){(e.pooledCacheLanes&=n)===0&&(n=e.pooledCache,n!=null&&(e.pooledCache=null,ro(n)))}function Yl(){return Bg(),Ig(),Fg(),Gg()}function Gg(){if(hn!==5)return!1;var e=Ca,n=Df;Df=0;var a=Lr(ta),o=z.T,u=K.p;try{K.p=32>a?32:a,z.T=null,a=Uf,Uf=null;var f=Ca,y=ta;if(hn=0,is=Ca=null,ta=0,(Ue&6)!==0)throw Error(r(331));var b=Ue;if(Ue|=4,Mg(f.current),yg(f,f.current,y,a),Ue=b,Ao(0,!1),Wt&&typeof Wt.onPostCommitFiberRoot=="function")try{Wt.onPostCommitFiberRoot(Yt,f)}catch{}return!0}finally{K.p=u,z.T=o,Hg(e,n)}}function Vg(e,n,a){n=ai(a,n),n=uf(e.stateNode,n,2),e=Sa(e,n,2),e!==null&&(vn(e,2),Ui(e))}function Ne(e,n,a){if(e.tag===3)Vg(e,e,a);else for(;n!==null;){if(n.tag===3){Vg(n,e,a);break}else if(n.tag===1){var o=n.stateNode;if(typeof n.type.getDerivedStateFromError=="function"||typeof o.componentDidCatch=="function"&&(Ra===null||!Ra.has(o))){e=ai(a,e),a=km(2),o=Sa(n,a,2),o!==null&&(Xm(a,o,n,e),vn(o,2),Ui(o));break}}n=n.return}}function zf(e,n,a){var o=e.pingCache;if(o===null){o=e.pingCache=new Gy;var u=new Set;o.set(n,u)}else u=o.get(n),u===void 0&&(u=new Set,o.set(n,u));u.has(a)||(Rf=!0,u.add(a),e=Wy.bind(null,e,n,a),n.then(e,e))}function Wy(e,n,a){var o=e.pingCache;o!==null&&o.delete(n),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,He===e&&(ge&a)===a&&(Je===4||Je===3&&(ge&62914560)===ge&&300>mt()-Gl?(Ue&2)===0&&as(e,0):Cf|=a,ns===ge&&(ns=0)),Ui(e)}function kg(e,n){n===0&&(n=un()),e=nr(e,n),e!==null&&(vn(e,n),Ui(e))}function Yy(e){var n=e.memoizedState,a=0;n!==null&&(a=n.retryLane),kg(e,a)}function Zy(e,n){var a=0;switch(e.tag){case 31:case 13:var o=e.stateNode,u=e.memoizedState;u!==null&&(a=u.retryLane);break;case 19:o=e.stateNode;break;case 22:o=e.stateNode._retryCache;break;default:throw Error(r(314))}o!==null&&o.delete(n),kg(e,a)}function jy(e,n){return bt(e,n)}var Zl=null,ss=null,Pf=!1,jl=!1,Bf=!1,Da=0;function Ui(e){e!==ss&&e.next===null&&(ss===null?Zl=ss=e:ss=ss.next=e),jl=!0,Pf||(Pf=!0,Qy())}function Ao(e,n){if(!Bf&&jl){Bf=!0;do for(var a=!1,o=Zl;o!==null;){if(e!==0){var u=o.pendingLanes;if(u===0)var f=0;else{var y=o.suspendedLanes,b=o.pingedLanes;f=(1<<31-$t(42|e)+1)-1,f&=u&~(y&~b),f=f&201326741?f&201326741|1:f?f|2:0}f!==0&&(a=!0,Yg(o,f))}else f=ge,f=Lt(o,o===He?f:0,o.cancelPendingCommit!==null||o.timeoutHandle!==-1),(f&3)===0||te(o,f)||(a=!0,Yg(o,f));o=o.next}while(a);Bf=!1}}function Ky(){Xg()}function Xg(){jl=Pf=!1;var e=0;Da!==0&&ox()&&(e=Da);for(var n=mt(),a=null,o=Zl;o!==null;){var u=o.next,f=qg(o,n);f===0?(o.next=null,a===null?Zl=u:a.next=u,u===null&&(ss=a)):(a=o,(e!==0||(f&3)!==0)&&(jl=!0)),o=u}hn!==0&&hn!==5||Ao(e),Da!==0&&(Da=0)}function qg(e,n){for(var a=e.suspendedLanes,o=e.pingedLanes,u=e.expirationTimes,f=e.pendingLanes&-62914561;0<f;){var y=31-$t(f),b=1<<y,B=u[y];B===-1?((b&a)===0||(b&o)!==0)&&(u[y]=We(b,n)):B<=n&&(e.expiredLanes|=b),f&=~b}if(n=He,a=ge,a=Lt(e,e===n?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o=e.callbackNode,a===0||e===n&&(Le===2||Le===9)||e.cancelPendingCommit!==null)return o!==null&&o!==null&&U(o),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||te(e,a)){if(n=a&-a,n===e.callbackPriority)return n;switch(o!==null&&U(o),Lr(a)){case 2:case 8:a=Vt;break;case 32:a=Ut;break;case 268435456:a=me;break;default:a=Ut}return o=Wg.bind(null,e),a=bt(a,o),e.callbackPriority=n,e.callbackNode=a,n}return o!==null&&o!==null&&U(o),e.callbackPriority=2,e.callbackNode=null,2}function Wg(e,n){if(hn!==0&&hn!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Yl()&&e.callbackNode!==a)return null;var o=ge;return o=Lt(e,e===He?o:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),o===0?null:(Rg(e,o,n),qg(e,mt()),e.callbackNode!=null&&e.callbackNode===a?Wg.bind(null,e):null)}function Yg(e,n){if(Yl())return null;Rg(e,n,!0)}function Qy(){cx(function(){(Ue&6)!==0?bt(vt,Ky):Xg()})}function If(){if(Da===0){var e=qr;e===0&&(e=wt,wt<<=1,(wt&261888)===0&&(wt=256)),Da=e}return Da}function Zg(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:il(""+e)}function jg(e,n){var a=n.ownerDocument.createElement("input");return a.name=n.name,a.value=n.value,e.id&&a.setAttribute("form",e.id),n.parentNode.insertBefore(a,n),e=new FormData(e),a.parentNode.removeChild(a),e}function Jy(e,n,a,o,u){if(n==="submit"&&a&&a.stateNode===u){var f=Zg((u[yn]||null).action),y=o.submitter;y&&(n=(n=y[yn]||null)?Zg(n.formAction):y.getAttribute("formAction"),n!==null&&(f=n,y=null));var b=new ol("action","action",null,o,u);e.push({event:b,listeners:[{instance:null,listener:function(){if(o.defaultPrevented){if(Da!==0){var B=y?jg(u,y):new FormData(u);af(a,{pending:!0,data:B,method:u.method,action:f},null,B)}}else typeof f=="function"&&(b.preventDefault(),B=y?jg(u,y):new FormData(u),af(a,{pending:!0,data:B,method:u.method,action:f},f,B))},currentTarget:u}]})}}for(var Ff=0;Ff<xu.length;Ff++){var Hf=xu[Ff],$y=Hf.toLowerCase(),tx=Hf[0].toUpperCase()+Hf.slice(1);_i($y,"on"+tx)}_i(Ap,"onAnimationEnd"),_i(Rp,"onAnimationIteration"),_i(Cp,"onAnimationStart"),_i("dblclick","onDoubleClick"),_i("focusin","onFocus"),_i("focusout","onBlur"),_i(gy,"onTransitionRun"),_i(_y,"onTransitionStart"),_i(vy,"onTransitionCancel"),_i(wp,"onTransitionEnd"),It("onMouseEnter",["mouseout","mouseover"]),It("onMouseLeave",["mouseout","mouseover"]),It("onPointerEnter",["pointerout","pointerover"]),It("onPointerLeave",["pointerout","pointerover"]),Pt("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),Pt("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),Pt("onBeforeInput",["compositionend","keypress","textInput","paste"]),Pt("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),Pt("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),Pt("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Ro="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ex=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Ro));function Kg(e,n){n=(n&4)!==0;for(var a=0;a<e.length;a++){var o=e[a],u=o.event;o=o.listeners;t:{var f=void 0;if(n)for(var y=o.length-1;0<=y;y--){var b=o[y],B=b.instance,nt=b.currentTarget;if(b=b.listener,B!==f&&u.isPropagationStopped())break t;f=b,u.currentTarget=nt;try{f(u)}catch(pt){ul(pt)}u.currentTarget=null,f=B}else for(y=0;y<o.length;y++){if(b=o[y],B=b.instance,nt=b.currentTarget,b=b.listener,B!==f&&u.isPropagationStopped())break t;f=b,u.currentTarget=nt;try{f(u)}catch(pt){ul(pt)}u.currentTarget=null,f=B}}}}function pe(e,n){var a=n[Ws];a===void 0&&(a=n[Ws]=new Set);var o=e+"__bubble";a.has(o)||(Qg(n,e,2,!1),a.add(o))}function Gf(e,n,a){var o=0;n&&(o|=4),Qg(a,e,o,n)}var Kl="_reactListening"+Math.random().toString(36).slice(2);function Vf(e){if(!e[Kl]){e[Kl]=!0,Rt.forEach(function(a){a!=="selectionchange"&&(ex.has(a)||Gf(a,!1,e),Gf(a,!0,e))});var n=e.nodeType===9?e:e.ownerDocument;n===null||n[Kl]||(n[Kl]=!0,Gf("selectionchange",!1,n))}}function Qg(e,n,a,o){switch(A_(n)){case 2:var u=wx;break;case 8:u=Dx;break;default:u=ih}a=u.bind(null,n,a,e),u=void 0,!ou||n!=="touchstart"&&n!=="touchmove"&&n!=="wheel"||(u=!0),o?u!==void 0?e.addEventListener(n,a,{capture:!0,passive:u}):e.addEventListener(n,a,!0):u!==void 0?e.addEventListener(n,a,{passive:u}):e.addEventListener(n,a,!1)}function kf(e,n,a,o,u){var f=o;if((n&1)===0&&(n&2)===0&&o!==null)t:for(;;){if(o===null)return;var y=o.tag;if(y===3||y===4){var b=o.stateNode.containerInfo;if(b===u)break;if(y===4)for(y=o.return;y!==null;){var B=y.tag;if((B===3||B===4)&&y.stateNode.containerInfo===u)return;y=y.return}for(;b!==null;){if(y=C(b),y===null)return;if(B=y.tag,B===5||B===6||B===26||B===27){o=f=y;continue t}b=b.parentNode}}o=o.return}np(function(){var nt=f,pt=ru(a),yt=[];t:{var at=Dp.get(e);if(at!==void 0){var lt=ol,Gt=e;switch(e){case"keypress":if(rl(a)===0)break t;case"keydown":case"keyup":lt=Zv;break;case"focusin":Gt="focus",lt=fu;break;case"focusout":Gt="blur",lt=fu;break;case"beforeblur":case"afterblur":lt=fu;break;case"click":if(a.button===2)break t;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":lt=rp;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":lt=Pv;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":lt=Qv;break;case Ap:case Rp:case Cp:lt=Fv;break;case wp:lt=$v;break;case"scroll":case"scrollend":lt=Ov;break;case"wheel":lt=ey;break;case"copy":case"cut":case"paste":lt=Gv;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":lt=op;break;case"toggle":case"beforetoggle":lt=iy}var Jt=(n&4)!==0,Ie=!Jt&&(e==="scroll"||e==="scrollend"),j=Jt?at!==null?at+"Capture":null:at;Jt=[];for(var G=nt,et;G!==null;){var _t=G;if(et=_t.stateNode,_t=_t.tag,_t!==5&&_t!==26&&_t!==27||et===null||j===null||(_t=Zs(G,j),_t!=null&&Jt.push(Co(G,_t,et))),Ie)break;G=G.return}0<Jt.length&&(at=new lt(at,Gt,null,a,pt),yt.push({event:at,listeners:Jt}))}}if((n&7)===0){t:{if(at=e==="mouseover"||e==="pointerover",lt=e==="mouseout"||e==="pointerout",at&&a!==au&&(Gt=a.relatedTarget||a.fromElement)&&(C(Gt)||Gt[Ii]))break t;if((lt||at)&&(at=pt.window===pt?pt:(at=pt.ownerDocument)?at.defaultView||at.parentWindow:window,lt?(Gt=a.relatedTarget||a.toElement,lt=nt,Gt=Gt?C(Gt):null,Gt!==null&&(Ie=c(Gt),Jt=Gt.tag,Gt!==Ie||Jt!==5&&Jt!==27&&Jt!==6)&&(Gt=null)):(lt=null,Gt=nt),lt!==Gt)){if(Jt=rp,_t="onMouseLeave",j="onMouseEnter",G="mouse",(e==="pointerout"||e==="pointerover")&&(Jt=op,_t="onPointerLeave",j="onPointerEnter",G="pointer"),Ie=lt==null?at:rt(lt),et=Gt==null?at:rt(Gt),at=new Jt(_t,G+"leave",lt,a,pt),at.target=Ie,at.relatedTarget=et,_t=null,C(pt)===nt&&(Jt=new Jt(j,G+"enter",Gt,a,pt),Jt.target=et,Jt.relatedTarget=Ie,_t=Jt),Ie=_t,lt&&Gt)e:{for(Jt=nx,j=lt,G=Gt,et=0,_t=j;_t;_t=Jt(_t))et++;_t=0;for(var jt=G;jt;jt=Jt(jt))_t++;for(;0<et-_t;)j=Jt(j),et--;for(;0<_t-et;)G=Jt(G),_t--;for(;et--;){if(j===G||G!==null&&j===G.alternate){Jt=j;break e}j=Jt(j),G=Jt(G)}Jt=null}else Jt=null;lt!==null&&Jg(yt,at,lt,Jt,!1),Gt!==null&&Ie!==null&&Jg(yt,Ie,Gt,Jt,!0)}}t:{if(at=nt?rt(nt):window,lt=at.nodeName&&at.nodeName.toLowerCase(),lt==="select"||lt==="input"&&at.type==="file")var Re=mp;else if(dp(at))if(gp)Re=dy;else{Re=fy;var kt=uy}else lt=at.nodeName,!lt||lt.toLowerCase()!=="input"||at.type!=="checkbox"&&at.type!=="radio"?nt&&iu(nt.elementType)&&(Re=mp):Re=hy;if(Re&&(Re=Re(e,nt))){pp(yt,Re,a,pt);break t}kt&&kt(e,at,nt),e==="focusout"&&nt&&at.type==="number"&&nt.memoizedProps.value!=null&&An(at,"number",at.value)}switch(kt=nt?rt(nt):window,e){case"focusin":(dp(kt)||kt.contentEditable==="true")&&(Br=kt,_u=nt,no=null);break;case"focusout":no=_u=Br=null;break;case"mousedown":vu=!0;break;case"contextmenu":case"mouseup":case"dragend":vu=!1,Tp(yt,a,pt);break;case"selectionchange":if(my)break;case"keydown":case"keyup":Tp(yt,a,pt)}var ce;if(du)t:{switch(e){case"compositionstart":var _e="onCompositionStart";break t;case"compositionend":_e="onCompositionEnd";break t;case"compositionupdate":_e="onCompositionUpdate";break t}_e=void 0}else Pr?fp(e,a)&&(_e="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(_e="onCompositionStart");_e&&(lp&&a.locale!=="ko"&&(Pr||_e!=="onCompositionStart"?_e==="onCompositionEnd"&&Pr&&(ce=ip()):(pa=pt,lu="value"in pa?pa.value:pa.textContent,Pr=!0)),kt=Ql(nt,_e),0<kt.length&&(_e=new sp(_e,e,null,a,pt),yt.push({event:_e,listeners:kt}),ce?_e.data=ce:(ce=hp(a),ce!==null&&(_e.data=ce)))),(ce=ry?sy(e,a):oy(e,a))&&(_e=Ql(nt,"onBeforeInput"),0<_e.length&&(kt=new sp("onBeforeInput","beforeinput",null,a,pt),yt.push({event:kt,listeners:_e}),kt.data=ce)),Jy(yt,e,nt,a,pt)}Kg(yt,n)})}function Co(e,n,a){return{instance:e,listener:n,currentTarget:a}}function Ql(e,n){for(var a=n+"Capture",o=[];e!==null;){var u=e,f=u.stateNode;if(u=u.tag,u!==5&&u!==26&&u!==27||f===null||(u=Zs(e,a),u!=null&&o.unshift(Co(e,u,f)),u=Zs(e,n),u!=null&&o.push(Co(e,u,f))),e.tag===3)return o;e=e.return}return[]}function nx(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Jg(e,n,a,o,u){for(var f=n._reactName,y=[];a!==null&&a!==o;){var b=a,B=b.alternate,nt=b.stateNode;if(b=b.tag,B!==null&&B===o)break;b!==5&&b!==26&&b!==27||nt===null||(B=nt,u?(nt=Zs(a,f),nt!=null&&y.unshift(Co(a,nt,B))):u||(nt=Zs(a,f),nt!=null&&y.push(Co(a,nt,B)))),a=a.return}y.length!==0&&e.push({event:n,listeners:y})}var ix=/\r\n?/g,ax=/\u0000|\uFFFD/g;function $g(e){return(typeof e=="string"?e:""+e).replace(ix,`
`).replace(ax,"")}function t_(e,n){return n=$g(n),$g(e)===n}function Be(e,n,a,o,u,f){switch(a){case"children":typeof o=="string"?n==="body"||n==="textarea"&&o===""||In(e,o):(typeof o=="number"||typeof o=="bigint")&&n!=="body"&&In(e,""+o);break;case"className":ke(e,"class",o);break;case"tabIndex":ke(e,"tabindex",o);break;case"dir":case"role":case"viewBox":case"width":case"height":ke(e,a,o);break;case"style":tp(e,o,f);break;case"data":if(n!=="object"){ke(e,"data",o);break}case"src":case"href":if(o===""&&(n!=="a"||a!=="href")){e.removeAttribute(a);break}if(o==null||typeof o=="function"||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=il(""+o),e.setAttribute(a,o);break;case"action":case"formAction":if(typeof o=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof f=="function"&&(a==="formAction"?(n!=="input"&&Be(e,n,"name",u.name,u,null),Be(e,n,"formEncType",u.formEncType,u,null),Be(e,n,"formMethod",u.formMethod,u,null),Be(e,n,"formTarget",u.formTarget,u,null)):(Be(e,n,"encType",u.encType,u,null),Be(e,n,"method",u.method,u,null),Be(e,n,"target",u.target,u,null)));if(o==null||typeof o=="symbol"||typeof o=="boolean"){e.removeAttribute(a);break}o=il(""+o),e.setAttribute(a,o);break;case"onClick":o!=null&&(e.onclick=Fi);break;case"onScroll":o!=null&&pe("scroll",e);break;case"onScrollEnd":o!=null&&pe("scrollend",e);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(r(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(r(60));e.innerHTML=a}}break;case"multiple":e.multiple=o&&typeof o!="function"&&typeof o!="symbol";break;case"muted":e.muted=o&&typeof o!="function"&&typeof o!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(o==null||typeof o=="function"||typeof o=="boolean"||typeof o=="symbol"){e.removeAttribute("xlink:href");break}a=il(""+o),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""+o):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":o&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":o===!0?e.setAttribute(a,""):o!==!1&&o!=null&&typeof o!="function"&&typeof o!="symbol"?e.setAttribute(a,o):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":o!=null&&typeof o!="function"&&typeof o!="symbol"&&!isNaN(o)&&1<=o?e.setAttribute(a,o):e.removeAttribute(a);break;case"rowSpan":case"start":o==null||typeof o=="function"||typeof o=="symbol"||isNaN(o)?e.removeAttribute(a):e.setAttribute(a,o);break;case"popover":pe("beforetoggle",e),pe("toggle",e),xe(e,"popover",o);break;case"xlinkActuate":Ae(e,"http://www.w3.org/1999/xlink","xlink:actuate",o);break;case"xlinkArcrole":Ae(e,"http://www.w3.org/1999/xlink","xlink:arcrole",o);break;case"xlinkRole":Ae(e,"http://www.w3.org/1999/xlink","xlink:role",o);break;case"xlinkShow":Ae(e,"http://www.w3.org/1999/xlink","xlink:show",o);break;case"xlinkTitle":Ae(e,"http://www.w3.org/1999/xlink","xlink:title",o);break;case"xlinkType":Ae(e,"http://www.w3.org/1999/xlink","xlink:type",o);break;case"xmlBase":Ae(e,"http://www.w3.org/XML/1998/namespace","xml:base",o);break;case"xmlLang":Ae(e,"http://www.w3.org/XML/1998/namespace","xml:lang",o);break;case"xmlSpace":Ae(e,"http://www.w3.org/XML/1998/namespace","xml:space",o);break;case"is":xe(e,"is",o);break;case"innerText":case"textContent":break;default:(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")&&(a=Lv.get(a)||a,xe(e,a,o))}}function Xf(e,n,a,o,u,f){switch(a){case"style":tp(e,o,f);break;case"dangerouslySetInnerHTML":if(o!=null){if(typeof o!="object"||!("__html"in o))throw Error(r(61));if(a=o.__html,a!=null){if(u.children!=null)throw Error(r(60));e.innerHTML=a}}break;case"children":typeof o=="string"?In(e,o):(typeof o=="number"||typeof o=="bigint")&&In(e,""+o);break;case"onScroll":o!=null&&pe("scroll",e);break;case"onScrollEnd":o!=null&&pe("scrollend",e);break;case"onClick":o!=null&&(e.onclick=Fi);break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":break;case"innerText":case"textContent":break;default:if(!Nt.hasOwnProperty(a))t:{if(a[0]==="o"&&a[1]==="n"&&(u=a.endsWith("Capture"),n=a.slice(2,u?a.length-7:void 0),f=e[yn]||null,f=f!=null?f[a]:null,typeof f=="function"&&e.removeEventListener(n,f,u),typeof o=="function")){typeof f!="function"&&f!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(n,o,u);break t}a in e?e[a]=o:o===!0?e.setAttribute(a,""):xe(e,a,o)}}}function Tn(e,n,a){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":pe("error",e),pe("load",e);var o=!1,u=!1,f;for(f in a)if(a.hasOwnProperty(f)){var y=a[f];if(y!=null)switch(f){case"src":o=!0;break;case"srcSet":u=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(e,n,f,y,a,null)}}u&&Be(e,n,"srcSet",a.srcSet,a,null),o&&Be(e,n,"src",a.src,a,null);return;case"input":pe("invalid",e);var b=f=y=u=null,B=null,nt=null;for(o in a)if(a.hasOwnProperty(o)){var pt=a[o];if(pt!=null)switch(o){case"name":u=pt;break;case"type":y=pt;break;case"checked":B=pt;break;case"defaultChecked":nt=pt;break;case"value":f=pt;break;case"defaultValue":b=pt;break;case"children":case"dangerouslySetInnerHTML":if(pt!=null)throw Error(r(137,n));break;default:Be(e,n,o,pt,a,null)}}Nn(e,f,b,B,nt,y,u,!1);return;case"select":pe("invalid",e),o=y=f=null;for(u in a)if(a.hasOwnProperty(u)&&(b=a[u],b!=null))switch(u){case"value":f=b;break;case"defaultValue":y=b;break;case"multiple":o=b;default:Be(e,n,u,b,a,null)}n=f,a=y,e.multiple=!!o,n!=null?Ke(e,!!o,n,!1):a!=null&&Ke(e,!!o,a,!0);return;case"textarea":pe("invalid",e),f=u=o=null;for(y in a)if(a.hasOwnProperty(y)&&(b=a[y],b!=null))switch(y){case"value":o=b;break;case"defaultValue":u=b;break;case"children":f=b;break;case"dangerouslySetInnerHTML":if(b!=null)throw Error(r(91));break;default:Be(e,n,y,b,a,null)}Nr(e,o,u,f);return;case"option":for(B in a)if(a.hasOwnProperty(B)&&(o=a[B],o!=null))switch(B){case"selected":e.selected=o&&typeof o!="function"&&typeof o!="symbol";break;default:Be(e,n,B,o,a,null)}return;case"dialog":pe("beforetoggle",e),pe("toggle",e),pe("cancel",e),pe("close",e);break;case"iframe":case"object":pe("load",e);break;case"video":case"audio":for(o=0;o<Ro.length;o++)pe(Ro[o],e);break;case"image":pe("error",e),pe("load",e);break;case"details":pe("toggle",e);break;case"embed":case"source":case"link":pe("error",e),pe("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(nt in a)if(a.hasOwnProperty(nt)&&(o=a[nt],o!=null))switch(nt){case"children":case"dangerouslySetInnerHTML":throw Error(r(137,n));default:Be(e,n,nt,o,a,null)}return;default:if(iu(n)){for(pt in a)a.hasOwnProperty(pt)&&(o=a[pt],o!==void 0&&Xf(e,n,pt,o,a,void 0));return}}for(b in a)a.hasOwnProperty(b)&&(o=a[b],o!=null&&Be(e,n,b,o,a,null))}function rx(e,n,a,o){switch(n){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var u=null,f=null,y=null,b=null,B=null,nt=null,pt=null;for(lt in a){var yt=a[lt];if(a.hasOwnProperty(lt)&&yt!=null)switch(lt){case"checked":break;case"value":break;case"defaultValue":B=yt;default:o.hasOwnProperty(lt)||Be(e,n,lt,null,o,yt)}}for(var at in o){var lt=o[at];if(yt=a[at],o.hasOwnProperty(at)&&(lt!=null||yt!=null))switch(at){case"type":f=lt;break;case"name":u=lt;break;case"checked":nt=lt;break;case"defaultChecked":pt=lt;break;case"value":y=lt;break;case"defaultValue":b=lt;break;case"children":case"dangerouslySetInnerHTML":if(lt!=null)throw Error(r(137,n));break;default:lt!==yt&&Be(e,n,at,lt,o,yt)}}ze(e,y,b,B,nt,pt,f,u);return;case"select":lt=y=b=at=null;for(f in a)if(B=a[f],a.hasOwnProperty(f)&&B!=null)switch(f){case"value":break;case"multiple":lt=B;default:o.hasOwnProperty(f)||Be(e,n,f,null,o,B)}for(u in o)if(f=o[u],B=a[u],o.hasOwnProperty(u)&&(f!=null||B!=null))switch(u){case"value":at=f;break;case"defaultValue":b=f;break;case"multiple":y=f;default:f!==B&&Be(e,n,u,f,o,B)}n=b,a=y,o=lt,at!=null?Ke(e,!!a,at,!1):!!o!=!!a&&(n!=null?Ke(e,!!a,n,!0):Ke(e,!!a,a?[]:"",!1));return;case"textarea":lt=at=null;for(b in a)if(u=a[b],a.hasOwnProperty(b)&&u!=null&&!o.hasOwnProperty(b))switch(b){case"value":break;case"children":break;default:Be(e,n,b,null,o,u)}for(y in o)if(u=o[y],f=a[y],o.hasOwnProperty(y)&&(u!=null||f!=null))switch(y){case"value":at=u;break;case"defaultValue":lt=u;break;case"children":break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(r(91));break;default:u!==f&&Be(e,n,y,u,o,f)}xn(e,at,lt);return;case"option":for(var Gt in a)if(at=a[Gt],a.hasOwnProperty(Gt)&&at!=null&&!o.hasOwnProperty(Gt))switch(Gt){case"selected":e.selected=!1;break;default:Be(e,n,Gt,null,o,at)}for(B in o)if(at=o[B],lt=a[B],o.hasOwnProperty(B)&&at!==lt&&(at!=null||lt!=null))switch(B){case"selected":e.selected=at&&typeof at!="function"&&typeof at!="symbol";break;default:Be(e,n,B,at,o,lt)}return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var Jt in a)at=a[Jt],a.hasOwnProperty(Jt)&&at!=null&&!o.hasOwnProperty(Jt)&&Be(e,n,Jt,null,o,at);for(nt in o)if(at=o[nt],lt=a[nt],o.hasOwnProperty(nt)&&at!==lt&&(at!=null||lt!=null))switch(nt){case"children":case"dangerouslySetInnerHTML":if(at!=null)throw Error(r(137,n));break;default:Be(e,n,nt,at,o,lt)}return;default:if(iu(n)){for(var Ie in a)at=a[Ie],a.hasOwnProperty(Ie)&&at!==void 0&&!o.hasOwnProperty(Ie)&&Xf(e,n,Ie,void 0,o,at);for(pt in o)at=o[pt],lt=a[pt],!o.hasOwnProperty(pt)||at===lt||at===void 0&&lt===void 0||Xf(e,n,pt,at,o,lt);return}}for(var j in a)at=a[j],a.hasOwnProperty(j)&&at!=null&&!o.hasOwnProperty(j)&&Be(e,n,j,null,o,at);for(yt in o)at=o[yt],lt=a[yt],!o.hasOwnProperty(yt)||at===lt||at==null&&lt==null||Be(e,n,yt,at,o,lt)}function e_(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function sx(){if(typeof performance.getEntriesByType=="function"){for(var e=0,n=0,a=performance.getEntriesByType("resource"),o=0;o<a.length;o++){var u=a[o],f=u.transferSize,y=u.initiatorType,b=u.duration;if(f&&b&&e_(y)){for(y=0,b=u.responseEnd,o+=1;o<a.length;o++){var B=a[o],nt=B.startTime;if(nt>b)break;var pt=B.transferSize,yt=B.initiatorType;pt&&e_(yt)&&(B=B.responseEnd,y+=pt*(B<b?1:(b-nt)/(B-nt)))}if(--o,n+=8*(f+y)/(u.duration/1e3),e++,10<e)break}}if(0<e)return n/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var qf=null,Wf=null;function Jl(e){return e.nodeType===9?e:e.ownerDocument}function n_(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function i_(e,n){if(e===0)switch(n){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&n==="foreignObject"?0:e}function Yf(e,n){return e==="textarea"||e==="noscript"||typeof n.children=="string"||typeof n.children=="number"||typeof n.children=="bigint"||typeof n.dangerouslySetInnerHTML=="object"&&n.dangerouslySetInnerHTML!==null&&n.dangerouslySetInnerHTML.__html!=null}var Zf=null;function ox(){var e=window.event;return e&&e.type==="popstate"?e===Zf?!1:(Zf=e,!0):(Zf=null,!1)}var a_=typeof setTimeout=="function"?setTimeout:void 0,lx=typeof clearTimeout=="function"?clearTimeout:void 0,r_=typeof Promise=="function"?Promise:void 0,cx=typeof queueMicrotask=="function"?queueMicrotask:typeof r_<"u"?function(e){return r_.resolve(null).then(e).catch(ux)}:a_;function ux(e){setTimeout(function(){throw e})}function Ua(e){return e==="head"}function s_(e,n){var a=n,o=0;do{var u=a.nextSibling;if(e.removeChild(a),u&&u.nodeType===8)if(a=u.data,a==="/$"||a==="/&"){if(o===0){e.removeChild(u),us(n);return}o--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")o++;else if(a==="html")wo(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,wo(a);for(var f=a.firstChild;f;){var y=f.nextSibling,b=f.nodeName;f[Ja]||b==="SCRIPT"||b==="STYLE"||b==="LINK"&&f.rel.toLowerCase()==="stylesheet"||a.removeChild(f),f=y}}else a==="body"&&wo(e.ownerDocument.body);a=u}while(a);us(n)}function o_(e,n){var a=e;e=0;do{var o=a.nextSibling;if(a.nodeType===1?n?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(n?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),o&&o.nodeType===8)if(a=o.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=o}while(a)}function jf(e){var n=e.firstChild;for(n&&n.nodeType===10&&(n=n.nextSibling);n;){var a=n;switch(n=n.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":jf(a),Ys(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function fx(e,n,a,o){for(;e.nodeType===1;){var u=a;if(e.nodeName.toLowerCase()!==n.toLowerCase()){if(!o&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(o){if(!e[Ja])switch(n){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(f=e.getAttribute("rel"),f==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(f!==u.rel||e.getAttribute("href")!==(u.href==null||u.href===""?null:u.href)||e.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin)||e.getAttribute("title")!==(u.title==null?null:u.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(f=e.getAttribute("src"),(f!==(u.src==null?null:u.src)||e.getAttribute("type")!==(u.type==null?null:u.type)||e.getAttribute("crossorigin")!==(u.crossOrigin==null?null:u.crossOrigin))&&f&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(n==="input"&&e.type==="hidden"){var f=u.name==null?null:""+u.name;if(u.type==="hidden"&&e.getAttribute("name")===f)return e}else return e;if(e=ci(e.nextSibling),e===null)break}return null}function hx(e,n,a){if(n==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ci(e.nextSibling),e===null))return null;return e}function l_(e,n){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!n||(e=ci(e.nextSibling),e===null))return null;return e}function Kf(e){return e.data==="$?"||e.data==="$~"}function Qf(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function dx(e,n){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=n;else if(e.data!=="$?"||a.readyState!=="loading")n();else{var o=function(){n(),a.removeEventListener("DOMContentLoaded",o)};a.addEventListener("DOMContentLoaded",o),e._reactRetry=o}}function ci(e){for(;e!=null;e=e.nextSibling){var n=e.nodeType;if(n===1||n===3)break;if(n===8){if(n=e.data,n==="$"||n==="$!"||n==="$?"||n==="$~"||n==="&"||n==="F!"||n==="F")break;if(n==="/$"||n==="/&")return null}}return e}var Jf=null;function c_(e){e=e.nextSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(n===0)return ci(e.nextSibling);n--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||n++}e=e.nextSibling}return null}function u_(e){e=e.previousSibling;for(var n=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(n===0)return e;n--}else a!=="/$"&&a!=="/&"||n++}e=e.previousSibling}return null}function f_(e,n,a){switch(n=Jl(a),e){case"html":if(e=n.documentElement,!e)throw Error(r(452));return e;case"head":if(e=n.head,!e)throw Error(r(453));return e;case"body":if(e=n.body,!e)throw Error(r(454));return e;default:throw Error(r(451))}}function wo(e){for(var n=e.attributes;n.length;)e.removeAttributeNode(n[0]);Ys(e)}var ui=new Map,h_=new Set;function $l(e){return typeof e.getRootNode=="function"?e.getRootNode():e.nodeType===9?e:e.ownerDocument}var ea=K.d;K.d={f:px,r:mx,D:gx,C:_x,L:vx,m:yx,X:Sx,S:xx,M:Mx};function px(){var e=ea.f(),n=Xl();return e||n}function mx(e){var n=Y(e);n!==null&&n.tag===5&&n.type==="form"?wm(n):ea.r(e)}var os=typeof document>"u"?null:document;function d_(e,n,a){var o=os;if(o&&typeof n=="string"&&n){var u=mn(n);u='link[rel="'+e+'"][href="'+u+'"]',typeof a=="string"&&(u+='[crossorigin="'+a+'"]'),h_.has(u)||(h_.add(u),e={rel:e,crossOrigin:a,href:n},o.querySelector(u)===null&&(n=o.createElement("link"),Tn(n,"link",e),k(n),o.head.appendChild(n)))}}function gx(e){ea.D(e),d_("dns-prefetch",e,null)}function _x(e,n){ea.C(e,n),d_("preconnect",e,n)}function vx(e,n,a){ea.L(e,n,a);var o=os;if(o&&e&&n){var u='link[rel="preload"][as="'+mn(n)+'"]';n==="image"&&a&&a.imageSrcSet?(u+='[imagesrcset="'+mn(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(u+='[imagesizes="'+mn(a.imageSizes)+'"]')):u+='[href="'+mn(e)+'"]';var f=u;switch(n){case"style":f=ls(e);break;case"script":f=cs(e)}ui.has(f)||(e=_({rel:"preload",href:n==="image"&&a&&a.imageSrcSet?void 0:e,as:n},a),ui.set(f,e),o.querySelector(u)!==null||n==="style"&&o.querySelector(Do(f))||n==="script"&&o.querySelector(Uo(f))||(n=o.createElement("link"),Tn(n,"link",e),k(n),o.head.appendChild(n)))}}function yx(e,n){ea.m(e,n);var a=os;if(a&&e){var o=n&&typeof n.as=="string"?n.as:"script",u='link[rel="modulepreload"][as="'+mn(o)+'"][href="'+mn(e)+'"]',f=u;switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":f=cs(e)}if(!ui.has(f)&&(e=_({rel:"modulepreload",href:e},n),ui.set(f,e),a.querySelector(u)===null)){switch(o){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Uo(f)))return}o=a.createElement("link"),Tn(o,"link",e),k(o),a.head.appendChild(o)}}}function xx(e,n,a){ea.S(e,n,a);var o=os;if(o&&e){var u=st(o).hoistableStyles,f=ls(e);n=n||"default";var y=u.get(f);if(!y){var b={loading:0,preload:null};if(y=o.querySelector(Do(f)))b.loading=5;else{e=_({rel:"stylesheet",href:e,"data-precedence":n},a),(a=ui.get(f))&&$f(e,a);var B=y=o.createElement("link");k(B),Tn(B,"link",e),B._p=new Promise(function(nt,pt){B.onload=nt,B.onerror=pt}),B.addEventListener("load",function(){b.loading|=1}),B.addEventListener("error",function(){b.loading|=2}),b.loading|=4,tc(y,n,o)}y={type:"stylesheet",instance:y,count:1,state:b},u.set(f,y)}}}function Sx(e,n){ea.X(e,n);var a=os;if(a&&e){var o=st(a).hoistableScripts,u=cs(e),f=o.get(u);f||(f=a.querySelector(Uo(u)),f||(e=_({src:e,async:!0},n),(n=ui.get(u))&&th(e,n),f=a.createElement("script"),k(f),Tn(f,"link",e),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},o.set(u,f))}}function Mx(e,n){ea.M(e,n);var a=os;if(a&&e){var o=st(a).hoistableScripts,u=cs(e),f=o.get(u);f||(f=a.querySelector(Uo(u)),f||(e=_({src:e,async:!0,type:"module"},n),(n=ui.get(u))&&th(e,n),f=a.createElement("script"),k(f),Tn(f,"link",e),a.head.appendChild(f)),f={type:"script",instance:f,count:1,state:null},o.set(u,f))}}function p_(e,n,a,o){var u=(u=At.current)?$l(u):null;if(!u)throw Error(r(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(n=ls(a.href),a=st(u).hoistableStyles,o=a.get(n),o||(o={type:"style",instance:null,count:0,state:null},a.set(n,o)),o):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=ls(a.href);var f=st(u).hoistableStyles,y=f.get(e);if(y||(u=u.ownerDocument||u,y={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},f.set(e,y),(f=u.querySelector(Do(e)))&&!f._p&&(y.instance=f,y.state.loading=5),ui.has(e)||(a={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},ui.set(e,a),f||Ex(u,e,a,y.state))),n&&o===null)throw Error(r(528,""));return y}if(n&&o!==null)throw Error(r(529,""));return null;case"script":return n=a.async,a=a.src,typeof a=="string"&&n&&typeof n!="function"&&typeof n!="symbol"?(n=cs(a),a=st(u).hoistableScripts,o=a.get(n),o||(o={type:"script",instance:null,count:0,state:null},a.set(n,o)),o):{type:"void",instance:null,count:0,state:null};default:throw Error(r(444,e))}}function ls(e){return'href="'+mn(e)+'"'}function Do(e){return'link[rel="stylesheet"]['+e+"]"}function m_(e){return _({},e,{"data-precedence":e.precedence,precedence:null})}function Ex(e,n,a,o){e.querySelector('link[rel="preload"][as="style"]['+n+"]")?o.loading=1:(n=e.createElement("link"),o.preload=n,n.addEventListener("load",function(){return o.loading|=1}),n.addEventListener("error",function(){return o.loading|=2}),Tn(n,"link",a),k(n),e.head.appendChild(n))}function cs(e){return'[src="'+mn(e)+'"]'}function Uo(e){return"script[async]"+e}function g_(e,n,a){if(n.count++,n.instance===null)switch(n.type){case"style":var o=e.querySelector('style[data-href~="'+mn(a.href)+'"]');if(o)return n.instance=o,k(o),o;var u=_({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return o=(e.ownerDocument||e).createElement("style"),k(o),Tn(o,"style",u),tc(o,a.precedence,e),n.instance=o;case"stylesheet":u=ls(a.href);var f=e.querySelector(Do(u));if(f)return n.state.loading|=4,n.instance=f,k(f),f;o=m_(a),(u=ui.get(u))&&$f(o,u),f=(e.ownerDocument||e).createElement("link"),k(f);var y=f;return y._p=new Promise(function(b,B){y.onload=b,y.onerror=B}),Tn(f,"link",o),n.state.loading|=4,tc(f,a.precedence,e),n.instance=f;case"script":return f=cs(a.src),(u=e.querySelector(Uo(f)))?(n.instance=u,k(u),u):(o=a,(u=ui.get(f))&&(o=_({},a),th(o,u)),e=e.ownerDocument||e,u=e.createElement("script"),k(u),Tn(u,"link",o),e.head.appendChild(u),n.instance=u);case"void":return null;default:throw Error(r(443,n.type))}else n.type==="stylesheet"&&(n.state.loading&4)===0&&(o=n.instance,n.state.loading|=4,tc(o,a.precedence,e));return n.instance}function tc(e,n,a){for(var o=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),u=o.length?o[o.length-1]:null,f=u,y=0;y<o.length;y++){var b=o[y];if(b.dataset.precedence===n)f=b;else if(f!==u)break}f?f.parentNode.insertBefore(e,f.nextSibling):(n=a.nodeType===9?a.head:a,n.insertBefore(e,n.firstChild))}function $f(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.title==null&&(e.title=n.title)}function th(e,n){e.crossOrigin==null&&(e.crossOrigin=n.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=n.referrerPolicy),e.integrity==null&&(e.integrity=n.integrity)}var ec=null;function __(e,n,a){if(ec===null){var o=new Map,u=ec=new Map;u.set(a,o)}else u=ec,o=u.get(a),o||(o=new Map,u.set(a,o));if(o.has(e))return o;for(o.set(e,null),a=a.getElementsByTagName(e),u=0;u<a.length;u++){var f=a[u];if(!(f[Ja]||f[je]||e==="link"&&f.getAttribute("rel")==="stylesheet")&&f.namespaceURI!=="http://www.w3.org/2000/svg"){var y=f.getAttribute(n)||"";y=e+y;var b=o.get(y);b?b.push(f):o.set(y,[f])}}return o}function v_(e,n,a){e=e.ownerDocument||e,e.head.insertBefore(a,n==="title"?e.querySelector("head > title"):null)}function Tx(e,n,a){if(a===1||n.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof n.precedence!="string"||typeof n.href!="string"||n.href==="")break;return!0;case"link":if(typeof n.rel!="string"||typeof n.href!="string"||n.href===""||n.onLoad||n.onError)break;switch(n.rel){case"stylesheet":return e=n.disabled,typeof n.precedence=="string"&&e==null;default:return!0}case"script":if(n.async&&typeof n.async!="function"&&typeof n.async!="symbol"&&!n.onLoad&&!n.onError&&n.src&&typeof n.src=="string")return!0}return!1}function y_(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function bx(e,n,a,o){if(a.type==="stylesheet"&&(typeof o.media!="string"||matchMedia(o.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var u=ls(o.href),f=n.querySelector(Do(u));if(f){n=f._p,n!==null&&typeof n=="object"&&typeof n.then=="function"&&(e.count++,e=nc.bind(e),n.then(e,e)),a.state.loading|=4,a.instance=f,k(f);return}f=n.ownerDocument||n,o=m_(o),(u=ui.get(u))&&$f(o,u),f=f.createElement("link"),k(f);var y=f;y._p=new Promise(function(b,B){y.onload=b,y.onerror=B}),Tn(f,"link",o),a.instance=f}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,n),(n=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=nc.bind(e),n.addEventListener("load",a),n.addEventListener("error",a))}}var eh=0;function Ax(e,n){return e.stylesheets&&e.count===0&&ac(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var o=setTimeout(function(){if(e.stylesheets&&ac(e,e.stylesheets),e.unsuspend){var f=e.unsuspend;e.unsuspend=null,f()}},6e4+n);0<e.imgBytes&&eh===0&&(eh=62500*sx());var u=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&ac(e,e.stylesheets),e.unsuspend)){var f=e.unsuspend;e.unsuspend=null,f()}},(e.imgBytes>eh?50:800)+n);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(o),clearTimeout(u)}}:null}function nc(){if(this.count--,this.count===0&&(this.imgCount===0||!this.waitingForImages)){if(this.stylesheets)ac(this,this.stylesheets);else if(this.unsuspend){var e=this.unsuspend;this.unsuspend=null,e()}}}var ic=null;function ac(e,n){e.stylesheets=null,e.unsuspend!==null&&(e.count++,ic=new Map,n.forEach(Rx,e),ic=null,nc.call(e))}function Rx(e,n){if(!(n.state.loading&4)){var a=ic.get(e);if(a)var o=a.get(null);else{a=new Map,ic.set(e,a);for(var u=e.querySelectorAll("link[data-precedence],style[data-precedence]"),f=0;f<u.length;f++){var y=u[f];(y.nodeName==="LINK"||y.getAttribute("media")!=="not all")&&(a.set(y.dataset.precedence,y),o=y)}o&&a.set(null,o)}u=n.instance,y=u.getAttribute("data-precedence"),f=a.get(y)||o,f===o&&a.set(null,u),a.set(y,u),this.count++,o=nc.bind(this),u.addEventListener("load",o),u.addEventListener("error",o),f?f.parentNode.insertBefore(u,f.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(u,e.firstChild)),n.state.loading|=4}}var Lo={$$typeof:N,Provider:null,Consumer:null,_currentValue:X,_currentValue2:X,_threadCount:0};function Cx(e,n,a,o,u,f,y,b,B){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Ee(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Ee(0),this.hiddenUpdates=Ee(null),this.identifierPrefix=o,this.onUncaughtError=u,this.onCaughtError=f,this.onRecoverableError=y,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=B,this.incompleteTransitions=new Map}function x_(e,n,a,o,u,f,y,b,B,nt,pt,yt){return e=new Cx(e,n,a,y,B,nt,pt,yt,b),n=1,f===!0&&(n|=24),f=Zn(3,null,null,n),e.current=f,f.stateNode=e,n=Nu(),n.refCount++,e.pooledCache=n,n.refCount++,f.memoizedState={element:o,isDehydrated:a,cache:n},Bu(f),e}function S_(e){return e?(e=Hr,e):Hr}function M_(e,n,a,o,u,f){u=S_(u),o.context===null?o.context=u:o.pendingContext=u,o=xa(n),o.payload={element:a},f=f===void 0?null:f,f!==null&&(o.callback=f),a=Sa(e,o,n),a!==null&&(Xn(a,e,n),co(a,e,n))}function E_(e,n){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<n?a:n}}function nh(e,n){E_(e,n),(e=e.alternate)&&E_(e,n)}function T_(e){if(e.tag===13||e.tag===31){var n=nr(e,67108864);n!==null&&Xn(n,e,67108864),nh(e,67108864)}}function b_(e){if(e.tag===13||e.tag===31){var n=$n();n=Ka(n);var a=nr(e,n);a!==null&&Xn(a,e,n),nh(e,n)}}var rc=!0;function wx(e,n,a,o){var u=z.T;z.T=null;var f=K.p;try{K.p=2,ih(e,n,a,o)}finally{K.p=f,z.T=u}}function Dx(e,n,a,o){var u=z.T;z.T=null;var f=K.p;try{K.p=8,ih(e,n,a,o)}finally{K.p=f,z.T=u}}function ih(e,n,a,o){if(rc){var u=ah(o);if(u===null)kf(e,n,o,sc,a),R_(e,o);else if(Lx(u,e,n,a,o))o.stopPropagation();else if(R_(e,o),n&4&&-1<Ux.indexOf(e)){for(;u!==null;){var f=Y(u);if(f!==null)switch(f.tag){case 3:if(f=f.stateNode,f.current.memoizedState.isDehydrated){var y=Dt(f.pendingLanes);if(y!==0){var b=f;for(b.pendingLanes|=2,b.entangledLanes|=2;y;){var B=1<<31-$t(y);b.entanglements[1]|=B,y&=~B}Ui(f),(Ue&6)===0&&(Vl=mt()+500,Ao(0))}}break;case 31:case 13:b=nr(f,2),b!==null&&Xn(b,f,2),Xl(),nh(f,2)}if(f=ah(o),f===null&&kf(e,n,o,sc,a),f===u)break;u=f}u!==null&&o.stopPropagation()}else kf(e,n,o,null,a)}}function ah(e){return e=ru(e),rh(e)}var sc=null;function rh(e){if(sc=null,e=C(e),e!==null){var n=c(e);if(n===null)e=null;else{var a=n.tag;if(a===13){if(e=d(n),e!==null)return e;e=null}else if(a===31){if(e=h(n),e!==null)return e;e=null}else if(a===3){if(n.stateNode.current.memoizedState.isDehydrated)return n.tag===3?n.stateNode.containerInfo:null;e=null}else n!==e&&(e=null)}}return sc=e,null}function A_(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(Tt()){case vt:return 2;case Vt:return 8;case Ut:case Ft:return 32;case me:return 268435456;default:return 32}default:return 32}}var sh=!1,La=null,Na=null,Oa=null,No=new Map,Oo=new Map,za=[],Ux="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function R_(e,n){switch(e){case"focusin":case"focusout":La=null;break;case"dragenter":case"dragleave":Na=null;break;case"mouseover":case"mouseout":Oa=null;break;case"pointerover":case"pointerout":No.delete(n.pointerId);break;case"gotpointercapture":case"lostpointercapture":Oo.delete(n.pointerId)}}function zo(e,n,a,o,u,f){return e===null||e.nativeEvent!==f?(e={blockedOn:n,domEventName:a,eventSystemFlags:o,nativeEvent:f,targetContainers:[u]},n!==null&&(n=Y(n),n!==null&&T_(n)),e):(e.eventSystemFlags|=o,n=e.targetContainers,u!==null&&n.indexOf(u)===-1&&n.push(u),e)}function Lx(e,n,a,o,u){switch(n){case"focusin":return La=zo(La,e,n,a,o,u),!0;case"dragenter":return Na=zo(Na,e,n,a,o,u),!0;case"mouseover":return Oa=zo(Oa,e,n,a,o,u),!0;case"pointerover":var f=u.pointerId;return No.set(f,zo(No.get(f)||null,e,n,a,o,u)),!0;case"gotpointercapture":return f=u.pointerId,Oo.set(f,zo(Oo.get(f)||null,e,n,a,o,u)),!0}return!1}function C_(e){var n=C(e.target);if(n!==null){var a=c(n);if(a!==null){if(n=a.tag,n===13){if(n=d(a),n!==null){e.blockedOn=n,Qa(e.priority,function(){b_(a)});return}}else if(n===31){if(n=h(a),n!==null){e.blockedOn=n,Qa(e.priority,function(){b_(a)});return}}else if(n===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function oc(e){if(e.blockedOn!==null)return!1;for(var n=e.targetContainers;0<n.length;){var a=ah(e.nativeEvent);if(a===null){a=e.nativeEvent;var o=new a.constructor(a.type,a);au=o,a.target.dispatchEvent(o),au=null}else return n=Y(a),n!==null&&T_(n),e.blockedOn=a,!1;n.shift()}return!0}function w_(e,n,a){oc(e)&&a.delete(n)}function Nx(){sh=!1,La!==null&&oc(La)&&(La=null),Na!==null&&oc(Na)&&(Na=null),Oa!==null&&oc(Oa)&&(Oa=null),No.forEach(w_),Oo.forEach(w_)}function lc(e,n){e.blockedOn===n&&(e.blockedOn=null,sh||(sh=!0,s.unstable_scheduleCallback(s.unstable_NormalPriority,Nx)))}var cc=null;function D_(e){cc!==e&&(cc=e,s.unstable_scheduleCallback(s.unstable_NormalPriority,function(){cc===e&&(cc=null);for(var n=0;n<e.length;n+=3){var a=e[n],o=e[n+1],u=e[n+2];if(typeof o!="function"){if(rh(o||a)===null)continue;break}var f=Y(a);f!==null&&(e.splice(n,3),n-=3,af(f,{pending:!0,data:u,method:a.method,action:o},o,u))}}))}function us(e){function n(B){return lc(B,e)}La!==null&&lc(La,e),Na!==null&&lc(Na,e),Oa!==null&&lc(Oa,e),No.forEach(n),Oo.forEach(n);for(var a=0;a<za.length;a++){var o=za[a];o.blockedOn===e&&(o.blockedOn=null)}for(;0<za.length&&(a=za[0],a.blockedOn===null);)C_(a),a.blockedOn===null&&za.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(o=0;o<a.length;o+=3){var u=a[o],f=a[o+1],y=u[yn]||null;if(typeof f=="function")y||D_(a);else if(y){var b=null;if(f&&f.hasAttribute("formAction")){if(u=f,y=f[yn]||null)b=y.formAction;else if(rh(u)!==null)continue}else b=y.action;typeof b=="function"?a[o+1]=b:(a.splice(o,3),o-=3),D_(a)}}}function U_(){function e(f){f.canIntercept&&f.info==="react-transition"&&f.intercept({handler:function(){return new Promise(function(y){return u=y})},focusReset:"manual",scroll:"manual"})}function n(){u!==null&&(u(),u=null),o||setTimeout(a,20)}function a(){if(!o&&!navigation.transition){var f=navigation.currentEntry;f&&f.url!=null&&navigation.navigate(f.url,{state:f.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var o=!1,u=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",n),navigation.addEventListener("navigateerror",n),setTimeout(a,100),function(){o=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",n),navigation.removeEventListener("navigateerror",n),u!==null&&(u(),u=null)}}}function oh(e){this._internalRoot=e}uc.prototype.render=oh.prototype.render=function(e){var n=this._internalRoot;if(n===null)throw Error(r(409));var a=n.current,o=$n();M_(a,o,e,n,null,null)},uc.prototype.unmount=oh.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var n=e.containerInfo;M_(e.current,2,null,e,null,null),Xl(),n[Ii]=null}};function uc(e){this._internalRoot=e}uc.prototype.unstable_scheduleHydration=function(e){if(e){var n=qs();e={blockedOn:null,target:e,priority:n};for(var a=0;a<za.length&&n!==0&&n<za[a].priority;a++);za.splice(a,0,e),a===0&&C_(e)}};var L_=t.version;if(L_!=="19.2.6")throw Error(r(527,L_,"19.2.6"));K.findDOMNode=function(e){var n=e._reactInternals;if(n===void 0)throw typeof e.render=="function"?Error(r(188)):(e=Object.keys(e).join(","),Error(r(268,e)));return e=m(n),e=e!==null?g(e):null,e=e===null?null:e.stateNode,e};var Ox={bundleType:0,version:"19.2.6",rendererPackageName:"react-dom",currentDispatcherRef:z,reconcilerVersion:"19.2.6"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var fc=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!fc.isDisabled&&fc.supportsFiber)try{Yt=fc.inject(Ox),Wt=fc}catch{}}return Vo.createRoot=function(e,n){if(!l(e))throw Error(r(299));var a=!1,o="",u=Fm,f=Hm,y=Gm;return n!=null&&(n.unstable_strictMode===!0&&(a=!0),n.identifierPrefix!==void 0&&(o=n.identifierPrefix),n.onUncaughtError!==void 0&&(u=n.onUncaughtError),n.onCaughtError!==void 0&&(f=n.onCaughtError),n.onRecoverableError!==void 0&&(y=n.onRecoverableError)),n=x_(e,1,!1,null,null,a,o,null,u,f,y,U_),e[Ii]=n.current,Vf(e),new oh(n)},Vo.hydrateRoot=function(e,n,a){if(!l(e))throw Error(r(299));var o=!1,u="",f=Fm,y=Hm,b=Gm,B=null;return a!=null&&(a.unstable_strictMode===!0&&(o=!0),a.identifierPrefix!==void 0&&(u=a.identifierPrefix),a.onUncaughtError!==void 0&&(f=a.onUncaughtError),a.onCaughtError!==void 0&&(y=a.onCaughtError),a.onRecoverableError!==void 0&&(b=a.onRecoverableError),a.formState!==void 0&&(B=a.formState)),n=x_(e,1,!0,n,a??null,o,u,B,f,y,b,U_),n.context=S_(null),a=n.current,o=$n(),o=Ka(o),u=xa(o),u.callback=null,Sa(a,u,o),a=o,n.current.lanes=a,vn(n,a),Ui(n),e[Ii]=n.current,Vf(e),new uc(n)},Vo.version="19.2.6",Vo}var j0;function mR(){if(j0)return kh.exports;j0=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(t){console.error(t)}}return s(),kh.exports=pR(),kh.exports}var gR=mR();function _R(){return null}const tu=document.createElement("div");tu.id="lq-hud-root";tu.style.cssText="position:fixed;inset:0;pointer-events:none;z-index:9999";document.body.appendChild(tu);gR.createRoot(tu).render(cR.createElement(_R));
