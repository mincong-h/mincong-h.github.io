import{d as a,z as c,o as l,b as i,e as d,f as u,h as p}from"../modules/vue-D1L0g39B.js";import{u as f}from"./context-BRHCJFcz.js";function n(e){return e.startsWith("/")?"/esigelec/1/"+e.slice(1):e}function m(e,s=!1){const o=e&&["#","rgb","hsl"].some(r=>e.indexOf(r)===0),t={background:o?e:void 0,color:e&&!o?"white":void 0,backgroundImage:o?void 0:e?s?`linear-gradient(#0005, #0008), url(${n(e)})`:`url("${n(e)}")`:void 0,backgroundRepeat:"no-repeat",backgroundPosition:"center",backgroundSize:"cover"};return t.background||delete t.background,t}const v={class:"my-auto w-full"},_=a({__name:"cover",props:{background:{default:"https://source.unsplash.com/collection/94734566/1920x1080"}},setup(e){f();const s=e,o=c(()=>m(s.background,!0));return(t,r)=>(l(),i("div",{class:"slidev-layout cover text-center",style:p(o.value)},[d("div",v,[u(t.$slots,"default")])],4))}});export{_};
