import{_ as g}from"./slidev/VSwitch-BW3DjELC.js";import{_ as m}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-C1lo-71X.js";import{aB as u,o as a,c as y,k as t,e as i,ae as n,b as r,aa as e,l as k,m as f,q as C,s as v,B as o}from"./modules/vue-D_uuiiMh.js";import{I as B}from"./slidev/default-BgaXmFaK.js";import{u as A,f as _}from"./slidev/context-Cu4bjT72.js";import"./modules/shiki-DcTb12IS.js";import"./index-odBeGqLM.js";import"./modules/unplugin-icons-W80L7jcD.js";const w="/esigelec/3/assets/public-facing-api-ecs-ec2-cloudformation-CNE3nm7Y.png",D="/esigelec/3/assets/Screenshot-2024-07-01-security-group-Cfd-JQwk.png",E="/esigelec/3/assets/service-discovery-example-DZhjnBS9.png",b={grid:"~ cols-2 gap-4"},L={__name:"chapter-3.md__slidev_26",setup(x){const{$slidev:$,$nav:N,$clicksContext:p,$clicks:S,$page:P,$renderContext:j,$frontmatter:h}=A();return p.setup(),(V,s)=>{const d=m,c=g,l=u("click");return a(),y(B,C(v(o(_)(o(h),25))),{default:t(()=>[s[7]||(s[7]=i("h1",null,"Application: Networking",-1)),s[8]||(s[8]=i("p",null,"Communication with other resources",-1)),i("div",b,[i("div",null,[i("ul",null,[n((a(),r("li",null,s[0]||(s[0]=[e("Published port")]))),[[l,1]]),n((a(),r("li",null,s[1]||(s[1]=[e("Network permission")]))),[[l,2,3]]),n((a(),r("li",null,s[2]||(s[2]=[e("DNS (service discovery)")]))),[[l,4]])])]),i("div",null,[k(c,null,{1:t(()=>[k(d,f({},{ranges:["4"]}),{default:t(()=>s[3]||(s[3]=[i("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[i("code",{class:"language-bash"},[i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"docker"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," run"),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --rm"),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --name"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," weekend-server"),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --publish"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," 8080:8080"),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --network"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," network-esigelec"),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --volume"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}},' "'),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"${"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"HOME"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"}"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"/logs/weekend-server.log:/app/weekend-server/logs/weekend-server.log"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}},'"'),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}},"  --volume"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}},' "'),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"${"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"project_dir"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"}"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"/config/weekend-server/application.conf:/app/weekend-server/application.conf"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}},'"'),i("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," \\")]),e(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"  weekend-server")])])],-1)])),_:1},16)]),2:t(()=>s[4]||(s[4]=[i("img",{alt:"public-facing-api-ecs-ec2-cloudformation",src:w},null,-1),i("p",null,[i("small",null,[i("a",{href:"https://containersonaws.com/pattern/public-facing-api-ecs-ec2-cloudformation",target:"_blank"},"https://containersonaws.com/pattern/public-facing-api-ecs-ec2-cloudformation")])],-1)])),3:t(()=>s[5]||(s[5]=[i("img",{alt:"Security group",src:D},null,-1)])),4:t(()=>s[6]||(s[6]=[i("img",{alt:"Service Registration and Discovery & Configuration Management",src:E},null,-1),i("p",null,[i("small",null,[i("a",{href:"https://medium.com/@maxy_ermayank/service-registration-and-discovery-configuration-management-dffb15fc08a7",target:"_blank"},"https://medium.com/@maxy_ermayank/service-registration-and-discovery-configuration-management-dffb15fc08a7")])],-1)])),_:1})])])]),_:1},16)}}};export{L as default};
