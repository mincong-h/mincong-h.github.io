import{_ as p}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-CtyJ-37I.js";import{o as d,c as o,k as l,e as s,l as t,m as k,aa as a,q as g,s as D,B as n}from"./modules/vue-D1L0g39B.js";import{I as E}from"./slidev/default-DWBq2snJ.js";import{u,f as m}from"./slidev/context-C5QGIlfi.js";import"./modules/unplugin-icons-CS9LgUvp.js";import"./index-CMCW49hb.js";import"./modules/shiki-Xh86V3dz.js";const A={grid:"~ cols-2 gap-6"},P={__name:"chapter-1.md__slidev_22",setup(f){const{$slidev:y,$nav:c,$clicksContext:r,$clicks:C,$page:B,$renderContext:b,$frontmatter:h}=u();return r.setup(),(v,i)=>{const e=p;return d(),o(E,g(D(n(m)(n(h),21))),{default:l(()=>[i[4]||(i[4]=s("h1",null,[s("code",null,"FROM")],-1)),i[5]||(i[5]=s("p",null,"Dockerfile instructions",-1)),i[6]||(i[6]=s("p",null,"Create a new build stage from a base image.",-1)),t(e,k({},{ranges:[]}),{default:l(()=>i[0]||(i[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-dockerfile"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," <image>[:<tag>] ["),s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"AS"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," <name>]")])])],-1)])),_:1},16),i[7]||(i[7]=s("br",null,null,-1)),s("div",A,[s("div",null,[i[2]||(i[2]=s("p",null,[s("a",{href:"https://docs.docker.com/build/building/multi-stage/#name-your-build-stages",target:"_blank"},"Multi-stage builds"),a(" example:")],-1)),t(e,k({},{ranges:["1","6","8","1,6,8"]}),{default:l(()=>i[1]||(i[1]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-dockerfile"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," maven:3.9-eclipse-temurin-21 "),s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"AS"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," builder")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"WORKDIR"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," /src")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"COPY"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," . .")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"RUN"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," mvn clean install -DskipTests")]),a(`
`),s("span",{class:"line"}),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"FROM"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," eclipse-temurin:21")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"RUN"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," mkdir /opt/app")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"COPY"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," --from=builder /src/target/app.jar /opt/app")]),a(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"CMD"),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}}," ["),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"java"'),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},", "),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"-jar"'),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},", "),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},'"/opt/app/japp.jar"'),s("span",{style:{"--shiki-dark":"#DBD7CAEE","--shiki-light":"#393A34"}},"]")])])],-1)])),_:1},16)]),i[3]||(i[3]=s("div",null,null,-1))])]),_:1},16)}}};export{P as default};
