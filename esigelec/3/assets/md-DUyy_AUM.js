import{_ as k}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-C1lo-71X.js";import{o,c as h,k as t,e as s,aa as e,l as p,m as d,q as u,s as m,B as l}from"./modules/vue-D_uuiiMh.js";import{I as g}from"./slidev/default-BgaXmFaK.js";import{u as y,f}from"./slidev/context-Cu4bjT72.js";import"./modules/unplugin-icons-W80L7jcD.js";import"./index-odBeGqLM.js";import"./modules/shiki-DcTb12IS.js";const V={__name:"chapter-3.md__slidev_20",setup(c){const{$slidev:A,$nav:B,$clicksContext:a,$clicks:b,$page:v,$renderContext:C,$frontmatter:n}=y();return a.setup(),(D,i)=>{const r=k;return o(),h(g,u(m(l(f)(l(n),19))),{default:t(()=>[i[1]||(i[1]=s("h1",null,"Continuous Delivery with Kubernetes",-1)),i[2]||(i[2]=s("p",null,"A simplified version for Kubernetes",-1)),i[3]||(i[3]=s("p",null,"Steps:",-1)),i[4]||(i[4]=s("ol",null,[s("li",null,"Publish a container image to a registry (e.g. DockerHub) ✅"),s("li",null,[e("Update the container image in "),s("s",null,"the manifest of your resource"),e(" Kubernetes Deployment")]),s("li",null,[e("Apply the new definition in "),s("s",null,"the orchestration service"),e(" Kubernetes")])],-1)),i[5]||(i[5]=s("p",null,"GitHub Actions:",-1)),p(r,d({},{ranges:["4","6","all"]}),{default:t(()=>i[0]||(i[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-yaml"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"steps"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),e(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#758575DD","--shiki-light":"#A0ADA0"}},"# ...")]),e(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"-"),s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," name"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," Update image")]),e(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  run"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," kubectl set image deployments weekend-server-deployment main=mincongclassroom/weekend-server-demo:sha-abcdef")]),e(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"-"),s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," name"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," Rollout changes")]),e(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  run"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," kubectl rollout status deployments/weekend-server-deployment")])])],-1)])),_:1},16)]),_:1},16)}}};export{V as default};