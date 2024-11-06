import{_ as d}from"./slidev/VClicks-DV0doFmN.js";import{_ as g}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-D1yKk7RW.js";import{o,c as y,k as l,e as s,l as e,m as a,aa as k,q as f,s as m,B as n}from"./modules/vue-C7pScABW.js";import{I as u}from"./slidev/default-B9YKxX9u.js";import{u as A,f as c}from"./slidev/context-CCoBpUFi.js";import"./index-B7Q8UOro.js";import"./modules/shiki-BsvmGPcF.js";import"./modules/unplugin-icons-BEnFx9qW.js";const C={grid:"~ cols-2 gap-4"},T={__name:"chapter-4.md__slidev_21",setup(B){const{$slidev:v,$nav:b,$clicksContext:r,$clicks:D,$page:_,$renderContext:x,$frontmatter:p}=A();return r.setup(),(E,i)=>{const t=g,h=d;return o(),y(u,f(m(n(c)(n(p),20))),{default:l(()=>[i[9]||(i[9]=s("h1",null,"Deployment Operations",-1)),i[10]||(i[10]=s("p",null,"Cheatseet",-1)),s("div",C,[s("div",null,[e(h,null,{default:l(()=>[i[3]||(i[3]=s("p",null,"Creation:",-1)),e(t,a({},{ranges:[]}),{default:l(()=>i[0]||(i[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," apply"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," -f"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment.yaml")])])],-1)])),_:1},16),e(t,a({},{ranges:[]}),{default:l(()=>i[1]||(i[1]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," create"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," my-app"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),k(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"    --image=nginx"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," --replicas=3")])])],-1)])),_:1},16),i[4]||(i[4]=s("p",null,"Scaling:",-1)),e(t,a({},{ranges:[]}),{default:l(()=>i[2]||(i[2]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," scale"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," --replicas=3"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment/my-app")]),k(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," autoscale"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment/my-app"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),k(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"    --min=10"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," --max=15"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," --cpu-percent=80")])])],-1)])),_:1},16)]),_:1})]),s("div",null,[e(h,null,{default:l(()=>[i[7]||(i[7]=s("p",null,"Set image:",-1)),e(t,a({},{ranges:[]}),{default:l(()=>i[5]||(i[5]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," set"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," image"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment/my-app"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),k(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"    nginx=nginx:my-new-version")])])],-1)])),_:1},16),i[8]||(i[8]=s("p",null,"Rollout:",-1)),e(t,a({},{ranges:[]}),{default:l(()=>i[6]||(i[6]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," rollout"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," status"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment/my-app")]),k(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"kubectl"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," rollout"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," history"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," deployment/my-app")])])],-1)])),_:1},16)]),_:1})])])]),_:1},16)}}};export{T as default};
