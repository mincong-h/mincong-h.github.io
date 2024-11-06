import{_ as p}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-CCPZLsTI.js";import{o as d,c as o,k as e,e as i,l as a,m as n,aa as l,q as g,s as f,B as k}from"./modules/vue-DrdKWIen.js";import{I as u}from"./slidev/default-BdcxVSTD.js";import{u as m,f as D}from"./slidev/context-Cldl4W0j.js";import"./modules/unplugin-icons-LfcarUhA.js";import"./index-BahLlCDo.js";import"./modules/shiki-7aazkJtK.js";const E={grid:"~ cols-2 gap-6"},M={__name:"chapter-1.md__slidev_21",setup(y){const{$slidev:A,$nav:C,$clicksContext:r,$clicks:B,$page:v,$renderContext:x,$frontmatter:h}=m();return r.setup(),(b,s)=>{const t=p;return d(),o(u,g(f(k(D)(k(h),20))),{default:e(()=>[s[9]||(s[9]=i("h1",null,[i("code",null,"FROM")],-1)),s[10]||(s[10]=i("p",null,"Dockerfile instructions",-1)),s[11]||(s[11]=i("p",null,"Create a new build stage from a base image.",-1)),a(t,n({},{ranges:[]}),{default:e(()=>s[0]||(s[0]=[i("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[i("code",{class:"language-dockerfile"},[i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," <image>[:<tag>] ["),i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"AS"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," <name>]")])])],-1)])),_:1},16),s[12]||(s[12]=i("br",null,null,-1)),i("div",E,[i("div",null,[s[2]||(s[2]=l(" Java example: ")),a(t,n({},{ranges:["1"]}),{default:e(()=>s[1]||(s[1]=[i("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[i("code",{class:"language-dockerfile"},[i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," eclipse-temurin:21")]),l(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"RUN"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," mkdir /opt/app")]),l(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"COPY"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," japp.jar /opt/app")]),l(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"CMD"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," ["),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"java"'),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},", "),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"-jar"'),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},", "),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"/opt/app/japp.jar"'),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},"]")])])],-1)])),_:1},16),s[3]||(s[3]=i("p",null,"where",-1)),s[4]||(s[4]=i("ul",null,[i("li",null,[i("code",null,"eclipse-temurin"),l(" is the name of the repository.")]),i("li",null,[i("code",null,"21"),l(" is the tag of the container (OpenJDK)")])],-1))]),i("div",null,[s[6]||(s[6]=l(" Web application example: ")),a(t,n({},{ranges:["1"]}),{default:e(()=>s[5]||(s[5]=[i("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[i("code",{class:"language-dockerfile"},[i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," nginx")]),l(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"COPY"),i("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," nginx.conf /etc/nginx/nginx.conf")])])],-1)])),_:1},16),s[7]||(s[7]=i("p",null,"where",-1)),s[8]||(s[8]=i("ul",null,[i("li",null,[i("code",null,"nginx"),l(" is the name of the repository.")]),i("li",null,"tag is omitted (default: latest)")],-1))])])]),_:1},16)}}};export{M as default};