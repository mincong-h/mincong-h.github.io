import{d as N,t as m,O as T,D as y,Q as E,v as c,av as O}from"../modules/vue-DrdKWIen.js";import{t as R}from"../modules/shiki-7aazkJtK.js";import{u as K}from"./context-C15krKIr.js";import{aa as w,C as x,ag as V,ah as j,ai as B,aj as D,ak as F,Y as C}from"../index-BkrbLHIq.js";const U=N({props:{at:{type:[Number,String],default:"+1"},unmount:{type:Boolean,default:!1},transition:{type:[Object,String,Boolean],default:!1},tag:{type:String,default:"div"},childTag:{type:String,default:"div"}},setup({at:S,unmount:_,transition:u,tag:f,childTag:g},{slots:h}){const L=Object.entries(h).sort((t,e)=>-t[0].split("-")[0]+ +e[0].split("-")[0]),o=[];let r;for(const[t,e]of L){const a=m();if(Number.isFinite(+t))o.push([+t,r??+t+1,e,a]),r=+t;else{const[s,i]=t.split("-").map(Number);if(!Number.isFinite(s)||!Number.isFinite(i))throw new Error(`Invalid range for v-switch: ${t}`);o.push([s,i,e,a]),r=s}}const I=Math.max(...o.map(t=>t[1]))-1,p=w(),n=m(0),{$clicksContext:l,$nav:k}=K();T(()=>{const t=l.calculateSince(S,I);if(!t){n.value=x;return}l.register(p,t),y(()=>{n.value=t.currentOffset.value+1})}),E(()=>{l.unregister(p)});function b(){C.value=!0,R()}const d=u&&{...V(u,k.value.navDirection<0),tag:f,onAfterLeave:b};return()=>{const t=[];for(let e=o.length-1;e>=0;e--){const[a,s,i,A]=o[e],v=a<=n.value&&n.value<s;_&&!v||t.push(c(g,{key:e,ref:A,class:[j,n.value===a&&B,n.value>=s&&D,!v&&F].filter(Boolean),"data-slidev-clicks-start":a,"data-slidev-clicks-end":s},i==null?void 0:i()))}return d?c(O,C.value?{}:d,()=>t):c(f,t)}}});export{U as _};
