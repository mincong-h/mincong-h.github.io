import{_ as d}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-DAs4E7Fg.js";import{L as g,o as t,c as y,k as n,e as i,l as u,m as c,A as s,M as e,b as k,q as m,s as f,B as h}from"./modules/vue-37YBdVJj.js";import{I as B}from"./slidev/default-Jvjm4JHX.js";import{u as A,f as v}from"./slidev/context-CuYepZPB.js";import"./modules/unplugin-icons-Bgpsqvm4.js";import"./index-Dj4E4Rwh.js";import"./modules/shiki-7c4dKv-J.js";const C={grid:"~ cols-2 gap-4"},L={__name:"chapter-2.md__slidev_28",setup(w){const{$slidev:b,$nav:D,$clicksContext:r,$clicks:_,$page:$,$renderContext:x,$frontmatter:p}=A();return r.setup(),(j,l)=>{const o=d,a=g("click");return t(),y(B,m(f(h(v)(h(p),27))),{default:n(()=>[l[5]||(l[5]=i("h1",null,"Workflow",-1)),l[6]||(l[6]=i("p",null,"Run one or multiple jobs",-1)),i("div",C,[i("div",null,[u(o,c({at:1},{ranges:["all","1","2","3-4","all"]}),{default:n(()=>l[0]||(l[0]=[i("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[i("code",{class:"language-yaml"},[i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"name"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," esigelec")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#4D9375","--shiki-light":"#1E754F"}},"on"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}}," ["),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"push"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"]")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"jobs"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  webapp-lint"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    runs-on"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," ubuntu-latest")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    steps"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"      -"),i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," uses"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," actions/checkout@v4")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"      -"),i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," uses"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," actions/setup-node@v4")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"        with"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"          node-version"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}}," '"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}},"20"),i("span",{style:{"--shiki-dark":"#C98A7D77","--shiki-light":"#B5695977"}},"'")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"      -"),i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," run"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," npm install")]),s(`
`),i("span",{class:"line"},[i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"      -"),i("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," run"),i("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),i("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," npm run lint")])])],-1)])),_:1},16)]),i("div",null,[i("ol",null,[e((t(),k("li",null,l[1]||(l[1]=[s('The name of the workflow as it will appear in the "Actions" tab of the GitHub repository.')]))),[[a,1]]),e((t(),k("li",null,l[2]||(l[2]=[s("Workflow will run when triggered by an event")]))),[[a,2]]),e((t(),k("li",null,l[3]||(l[3]=[s("Workflow runs one or more jobs")]))),[[a,3]]),e((t(),k("li",null,l[4]||(l[4]=[s("The file should locate in the "),i("code",null,".github/workflows/",-1),s(" directory.")]))),[[a,4]])])])])]),_:1},16)}}};export{L as default};