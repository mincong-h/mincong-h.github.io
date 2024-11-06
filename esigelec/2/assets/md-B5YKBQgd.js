import{_ as o}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-DAs4E7Fg.js";import{o as d,c as p,k as e,e as s,l,m as k,A as t,q as g,s as c,B as n}from"./modules/vue-37YBdVJj.js";import{I as m}from"./slidev/default-Jvjm4JHX.js";import{u,f as y}from"./slidev/context-CuYepZPB.js";import"./modules/unplugin-icons-Bgpsqvm4.js";import"./index-Dj4E4Rwh.js";import"./modules/shiki-7c4dKv-J.js";const f="/esigelec/2/assets/Screenshot-2024-10-20-secrets-1L74COzv.png",A={grid:"~ cols-2 gap-4"},w={__name:"chapter-2.md__slidev_37",setup(B){const{$slidev:C,$nav:D,$clicksContext:r,$clicks:v,$page:_,$renderContext:$,$frontmatter:h}=u();return r.setup(),(b,i)=>{const a=o;return d(),p(m,g(c(n(y)(n(h),36))),{default:e(()=>[i[5]||(i[5]=s("h1",null,[s("code",null,"docker/login-action")],-1)),i[6]||(i[6]=s("p",null,"Login to Docker Hub",-1)),s("div",A,[s("div",null,[i[2]||(i[2]=s("p",null,"Command line:",-1)),l(a,k({},{ranges:[]}),{default:e(()=>i[0]||(i[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-sh"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#80A665","--shiki-light":"#59873A"}},"docker"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," login"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," registry-1.docker.io"),s("span",{style:{"--shiki-dark":"#C99076","--shiki-light":"#A65E2B"}}," -u"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}}," ${"),s("span",{style:{"--shiki-dark":"#BD976A","--shiki-light":"#B07D48"}},"DOCKER_USERNAME"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"}")]),t(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#758575DD","--shiki-light":"#A0ADA0"}},"# Password:")])])],-1)])),_:1},16),i[3]||(i[3]=s("p",null,"GitHub Action:",-1)),l(a,k({},{ranges:[]}),{default:e(()=>i[1]||(i[1]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-yaml"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"-"),s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," name"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," Log in to Docker Hub")]),t(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  uses"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," docker/login-action@v3")]),t(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  with"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),t(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    username"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," ${{ secrets.DOCKER_USERNAME }}")]),t(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    password"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," ${{ secrets.DOCKER_PASSWORD }}")])])],-1)])),_:1},16)]),i[4]||(i[4]=s("div",null,[s("p",null,[s("img",{src:f,alt:"repository secrets in GitHub Actions"})])],-1))])]),_:1},16)}}};export{w as default};