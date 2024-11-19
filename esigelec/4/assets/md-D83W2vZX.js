import{_ as n}from"./slidev/CodeBlockWrapper.vue_vue_type_script_setup_true_lang-DUt_4N9x.js";import{o as r,c as p,k as l,e as s,l as d,m as g,aa as i,q as o,s as y,B as e}from"./modules/vue-C7pScABW.js";import{I as c}from"./slidev/default-ykDDiaTO.js";import{u as A,f as B}from"./slidev/context-5srfZBxO.js";import"./modules/unplugin-icons-BEnFx9qW.js";import"./index-YQKvpOp4.js";import"./modules/shiki-BsvmGPcF.js";const m="/esigelec/4/assets/service-loadbalancer-weekend-webapp-DXwGpurA.png",u={grid:"~ cols-2 gap-4"},N={__name:"chapter-4.md__slidev_35",setup(f){const{$slidev:v,$nav:C,$clicksContext:t,$clicks:_,$page:D,$renderContext:b,$frontmatter:k}=A();return t.setup(),(w,a)=>{const h=n;return r(),p(c,o(y(e(B)(e(k),34))),{default:l(()=>[a[2]||(a[2]=s("h1",null,"Load Balancer",-1)),a[3]||(a[3]=s("p",null,"with Kubernetes Service",-1)),s("div",u,[a[1]||(a[1]=s("div",null,[s("p",null,[s("img",{src:m,alt:"diagram",width:"320px"})])],-1)),s("div",null,[d(h,g({},{ranges:["all","1","2","3-4","5-13","14-17"]}),{default:l(()=>a[0]||(a[0]=[s("pre",{class:"shiki shiki-themes vitesse-dark vitesse-light slidev-code",style:{"--shiki-dark":"#dbd7caee","--shiki-light":"#393a34","--shiki-dark-bg":"#121212","--shiki-light-bg":"#ffffff"}},[s("code",{class:"language-yaml"},[s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"apiVersion"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," v1")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"kind"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," Service")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"metadata"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  name"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," weekend-server")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"spec"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  type"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," LoadBalancer")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  selector"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    app.kubernetes.io/name"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," weekend-server")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  ports"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"    -"),s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," protocol"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#C98A7D","--shiki-light":"#B56959"}}," TCP")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"      port"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#4C9A91","--shiki-light":"#2F798A"}}," 80")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"      targetPort"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#4C9A91","--shiki-light":"#2F798A"}}," 9376")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  clusterIP"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#4C9A91","--shiki-light":"#2F798A"}}," 10.0.171.239")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"status"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#758575DD","--shiki-light":"#A0ADA0"}},"  # once the balancer is provisioned")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"  loadBalancer"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}},"    ingress"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":")]),i(`
`),s("span",{class:"line"},[s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},"    -"),s("span",{style:{"--shiki-dark":"#B8A965","--shiki-light":"#998418"}}," ip"),s("span",{style:{"--shiki-dark":"#666666","--shiki-light":"#999999"}},":"),s("span",{style:{"--shiki-dark":"#4C9A91","--shiki-light":"#2F798A"}}," 192.0.2.127")])])],-1)])),_:1},16)])])]),_:1},16)}}};export{N as default};