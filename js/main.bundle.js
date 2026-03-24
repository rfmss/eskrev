(()=>{var mt=Object.defineProperty,Ci=Object.defineProperties;var Ti=Object.getOwnPropertyDescriptors;var Ta=Object.getOwnPropertySymbols;var pt=Object.prototype.hasOwnProperty,gt=Object.prototype.propertyIsEnumerable;var ut=(e,a,o)=>a in e?mt(e,a,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[a]=o,xe=(e,a)=>{for(var o in a||(a={}))pt.call(a,o)&&ut(e,o,a[o]);if(Ta)for(var o of Ta(a))gt.call(a,o)&&ut(e,o,a[o]);return e},$e=(e,a)=>Ci(e,Ti(a));var ft=(e,a)=>{var o={};for(var t in e)pt.call(e,t)&&a.indexOf(t)<0&&(o[t]=e[t]);if(e!=null&&Ta)for(var t of Ta(e))a.indexOf(t)<0&&gt.call(e,t)&&(o[t]=e[t]);return o};var _i=(e,a)=>()=>(e&&(a=e(e=0)),a);var ki=(e,a)=>{for(var o in a)mt(e,o,{get:a[o],enumerable:!0})};var S=(e,a,o)=>new Promise((t,r)=>{var i=d=>{try{s(o.next(d))}catch(c){r(c)}},n=d=>{try{s(o.throw(d))}catch(c){r(c)}},s=d=>d.done?t(d.value):Promise.resolve(d.value).then(i,n);s((o=o.apply(e,a)).next())});var Fr={};ki(Fr,{ptDictionary:()=>En});var hn,yn,xn,Sn,Qa,En,Br=_i(()=>{hn="src/assets/lingua/pt_dict_core.json",yn="src/assets/lingua/pt_dict_rich_chunk_",xn="src/assets/lingua/pt_duvidas.json",Sn="src/assets/lingua/pt_regencias.json",Qa=e=>S(null,null,function*(){let a=yield fetch(e);if(!a.ok)throw new Error(`Falha ao carregar ${e}`);return a.json()}),En={entries:new Map,formIndex:new Map,coreLoaded:!1,richLoaded:new Set,doubts:null,regencias:null,normalize(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}},normalizeLookupKey(e){if(!e)return"";let o=String(e).trim().replace(/^[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+|[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+$/g,"");try{return o.toLowerCase().normalize("NFC")}catch(t){return o.toLowerCase()}},deaccent(e){try{return e.normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e}},singularizePt(e){return!e||e.length<4?e:/ões$/.test(e)?e.replace(/ões$/,"\xE3o"):/ães$/.test(e)?e.replace(/ães$/,"\xE3o"):/ais$/.test(e)?e.replace(/ais$/,"al"):/éis$/.test(e)?e.replace(/éis$/,"el"):/óis$/.test(e)?e.replace(/óis$/,"ol"):/is$/.test(e)?e.replace(/is$/,"il"):/ns$/.test(e)?e.replace(/ns$/,"m"):/es$/.test(e)&&e.length>4?e.replace(/es$/,"e"):/s$/.test(e)&&e.length>3?e.replace(/s$/,""):e},addEntries(e){Object.keys(e||{}).forEach(a=>{let o=e[a];if(!o)return;let t=this.normalize(a),r=$e(xe({},o),{lemma:a});this.entries.set(t,r),[].concat(o.formas||[]).concat(o.flexoes||[]).concat(a).forEach(n=>{let s=this.normalize(String(n));this.formIndex.has(s)||this.formIndex.set(s,t)})})},loadCore(){return S(this,null,function*(){if(this.coreLoaded)return;let e=yield Qa(hn);this.addEntries(e),this.coreLoaded=!0})},firstLetter(e){if(!e)return"_";let o=e.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()[0]||"_";return/[a-z]/.test(o)?o:"_"},loadRichChunk(e){return S(this,null,function*(){if(!e||this.richLoaded.has(e))return;let a=`${yn}${e}.json`;try{let o=yield Qa(a);this.addEntries(o),this.richLoaded.add(e)}catch(o){console.warn("[DICT] rich chunk load failed",a,o)}})},lookup(e){return S(this,null,function*(){return(yield this.lookupDetailed(e)).entry||null})},lookupDetailed(e){return S(this,null,function*(){if(!e)return{entry:null,tried:[],status:null};let a=null;try{yield this.loadCore()}catch(g){a=g,console.warn("[DICT] core load failed",g)}let o=this.normalizeLookupKey(e),t=this.normalize(o),r=this.singularizePt(o),i=this.normalize(r),n=this.deaccent(o),s=this.normalize(n),d=this.singularizePt(n),c=this.normalize(d),l=[],u=g=>{if(!g)return null;l.push(g);let m=this.normalize(g),v=this.entries.has(m)?m:this.formIndex.get(m);return v&&this.entries.has(v)?this.entries.get(v):null},p=u(o)||u(t)||u(r)||u(i)||u(n)||u(s)||u(d)||u(c);if(!p){let g=[...new Set([this.firstLetter(t),this.firstLetter(s),"_"])];for(let m of g){if(!this.richLoaded.has(m))try{yield this.loadRichChunk(m)}catch(v){a=a||v}if(p=u(o)||u(t)||u(r)||u(i)||u(n)||u(s)||u(d)||u(c),p)break}}let b={coreLoaded:this.coreLoaded,richLoaded:this.richLoaded.size};return{entry:p||null,tried:l,raw:o,singular:r,deaccent:n,status:b,error:a}})},loadDoubts(){return S(this,null,function*(){this.doubts||(this.doubts=yield Qa(xn))})},loadRegencias(){return S(this,null,function*(){this.regencias||(this.regencias=yield Qa(Sn))})},getDoubt(e){return S(this,null,function*(){if(yield this.loadDoubts(),!this.doubts)return null;let a=this.normalize(e),o=e.toLowerCase(),t=Object.entries(this.doubts);for(let[r,i]of t){let n=i.patterns||[];for(let s of n)try{let d=new RegExp(s,"i");if(d.test(o)||d.test(a))return xe({key:r},i)}catch(d){continue}}return this.doubts[a]?xe({key:a},this.doubts[a]):null})},findDoubts(e){return S(this,null,function*(){if(yield this.loadDoubts(),!this.doubts||!e)return[];let a=[];return Object.entries(this.doubts).forEach(([o,t])=>{let r=t.patterns||[];for(let i of r)try{let n=new RegExp(i,"gi"),s=e.match(n);if(s&&s.length){a.push({key:o,item:t,count:s.length});break}}catch(n){return}}),a})},findDoubtsSync(e){if(!this.doubts||!e)return[];let a=[];return Object.entries(this.doubts).forEach(([o,t])=>{let r=t.patterns||[];for(let i of r)try{let n=new RegExp(i,"gi"),s=e.match(n);if(s&&s.length){a.push({key:o,item:t,count:s.length});break}}catch(n){return}}),a},getRegencia(e){return S(this,null,function*(){if(yield this.loadRegencias(),!this.regencias)return null;let a=this.normalize(e);return this.regencias[a]||null})},findRegenciaAlerts(e){return S(this,null,function*(){if(yield this.loadRegencias(),!this.regencias||!e)return[];let a=[],o=e.toLowerCase();if(this.regencias.assistir){let t=/\bassistir\s+(o|a|os|as|um|uma|uns|umas)\b/gi,r=o.match(t);r&&r.length&&a.push({verb:"assistir",count:r.length,message:"Reg\xEAncia usual: assistir a algo."})}if(this.regencias.preferir){let t=/\bpreferir\s+[^.]{0,40}\bdo\b/gi,r=o.match(t);r&&r.length&&a.push({verb:"preferir",count:r.length,message:"Reg\xEAncia usual: preferir X a Y."})}return a})},findRegenciaAlertsSync(e){if(!this.regencias||!e)return[];let a=[],o=e.toLowerCase();if(this.regencias.assistir){let t=/\bassistir\s+(o|a|os|as|um|uma|uns|umas)\b/gi,r=o.match(t);r&&r.length&&a.push({verb:"assistir",count:r.length,message:"Reg\xEAncia usual: assistir a algo."})}if(this.regencias.preferir){let t=/\bpreferir\s+[^.]{0,40}\bdo\b/gi,r=o.match(t);r&&r.length&&a.push({verb:"preferir",count:r.length,message:"Reg\xEAncia usual: preferir X a Y."})}return a},preload(){return S(this,null,function*(){yield this.loadCore(),yield Promise.all([this.loadDoubts(),this.loadRegencias()])})}}});function co(e){let{topbarEl:a}=e.refs;if(!a)return;a.style.setProperty("--topbar-scale","1");let o=Math.max(1,a.clientWidth-4),t=Math.max(1,a.scrollWidth),r=t>o?Math.max(.72,o/t):1;a.style.setProperty("--topbar-scale",String(r))}function Re(e){let{sliceDockEl:a,viewportEl:o}=e.refs,{dockOffsetX:t,dockOffsetY:r}=e.state;if(!a||!o)return;let i=document.querySelector(".page");if(!i){a.style.display="none";return}let n=i.querySelector(".pageContent");if(!n){a.style.display="none";return}let s=o.getBoundingClientRect(),d=i.getBoundingClientRect(),c=n.getBoundingClientRect(),l=s.right-d.right,u=24,p=l>=u,b=Math.round(p?d.right-s.left+t:d.right-s.left-u+t);a.classList.toggle("is-mobile",!p);let g=Math.round(c.top-s.top+r),m=Math.max(0,Math.round(c.height));a.style.display="block",a.style.left=`${b}px`,a.style.top=`${g}px`,a.style.height=`${m}px`}function ga(e){let a=e.parentElement,o=a?a.clientHeight:0,t=Math.max(18,Math.ceil(e.getBoundingClientRect().height||e.offsetWidth||108)),r=3,i=t+r,n=Math.max(i,o-r);return{minTop:i,maxTop:n}}function lo(e,a){let o=Object.prototype.hasOwnProperty.call(a.dataset,"manualTop"),t=Number(a.dataset.manualTop);if(o&&Number.isFinite(t)){let{minTop:g,maxTop:m}=ga(a),v=Math.min(Math.max(g,t),m);a.style.top=`${Math.round(v)}px`;return}let r=a.dataset.anchorId;if(!r)return;let i=document.getElementById(r);if(!i)return;let n=i.closest(".page");if(!n)return;let s=n.querySelector(".pageContent"),d=s?s.getBoundingClientRect():n.getBoundingClientRect(),c=i.getBoundingClientRect(),l=Math.round(c.top-d.top+2),{minTop:u,maxTop:p}=ga(a),b=Math.min(Math.max(u,l),p);a.style.top=`${b}px`}function bt(e){document.querySelectorAll(".sliceTag[data-anchor-id]").forEach(a=>{lo(e,a)})}var Li="eskrev";var Pi=["skrv_data","eskrev:onep:pages:v2","eskrev:onep:pages:v1","skrv_mobile_notes_v1","skrv_postits_v1","tot_data","eskrev:index2:page1:html"],vt="eskrev:idb:migrated",_a=null,fa=new Map;function ka(){return _a?Promise.resolve(_a):new Promise((e,a)=>{let o=indexedDB.open(Li,1);o.onupgradeneeded=t=>{let r=t.target.result;r.objectStoreNames.contains("kv")||r.createObjectStore("kv")},o.onsuccess=t=>{_a=t.target.result,e(_a)},o.onerror=t=>a(t.target.error),o.onblocked=()=>a(new Error("IndexedDB bloqueado"))})}function Ni(e){return ka().then(a=>new Promise((o,t)=>{let r=a.transaction("kv","readonly").objectStore("kv").get(e);r.onsuccess=()=>{var i;return o((i=r.result)!=null?i:null)},r.onerror=()=>t(r.error)}))}function uo(e,a){return ka().then(o=>new Promise((t,r)=>{let i=o.transaction("kv","readwrite").objectStore("kv").put(a,e);i.onsuccess=()=>t(),i.onerror=()=>r(i.error)}))}function Ii(e){return ka().then(a=>new Promise((o,t)=>{let r=a.transaction("kv","readwrite").objectStore("kv").delete(e);r.onsuccess=()=>o(),r.onerror=()=>t(r.error)}))}function $i(){return S(this,null,function*(){if(!localStorage.getItem(vt)){for(let e of Pi){let a=localStorage.getItem(e);if(a!==null)try{let o=JSON.parse(a);yield uo(e,o),localStorage.removeItem(e)}catch(o){try{yield uo(e,a),localStorage.removeItem(e)}catch(t){}}}localStorage.setItem(vt,"1")}})}function ht(){return S(this,null,function*(){try{yield ka(),yield $i();let e=["skrv_data","eskrev:onep:pages:v2","eskrev:onep:pages:v1","eskrev:index2:page1:html","skrv_mobile_notes_v1","skrv_postits_v1"];yield Promise.all(e.map(a=>S(null,null,function*(){let o=yield Ni(a);o!==null&&fa.set(a,o)})))}catch(e){console.warn("[idb] Indispon\xEDvel, operando sem persist\xEAncia IDB:",e)}})}function we(e){return fa.has(e)?fa.get(e):null}function _e(e,a){fa.set(e,a),uo(e,a).catch(()=>{try{localStorage.setItem(e,JSON.stringify(a))}catch(o){}})}function La(e){fa.delete(e),Ii(e).catch(()=>{try{localStorage.removeItem(e)}catch(a){}})}var ia=0,ke=["yellow","green","blue","pink"],yt="skrv_postits_v1";function Xe(e){let a=Pa(e);if(a)try{let o=Array.from(a.querySelectorAll(".postit")).map(t=>{var r,i;return{id:t.dataset.postitId||"",text:((i=(r=t.querySelector(".postitBody"))==null?void 0:r.innerText)==null?void 0:i.trim())||"",tone:t.dataset.tone||ke[0],left:Number.parseFloat(t.style.left)||0,top:Number.parseFloat(t.style.top)||0,minimized:t.classList.contains("isMinimized")}});_e(yt,o)}catch(o){}}function mo(e){let a=Pa(e);if(a)try{let o=we(yt);if(!o)return;let t=Array.isArray(o)?o:JSON.parse(o);if(!Array.isArray(t)||!t.length)return;t.forEach(r=>{let i=document.createElement("article");i.className="postit",i.dataset.tone=ke.includes(r.tone)?r.tone:ke[0],r.id&&(i.dataset.postitId=r.id),i.innerHTML=`
        <header class="postitHead" title="Arraste para mover">
          <div class="postitBtns">
            <button class="postitBtn postitClose" type="button" title="Fechar" aria-label="Fechar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1L7 7M7 1L1 7"/></svg></button>
            <button class="postitBtn postitMin"   type="button" title="Minimizar" aria-label="Minimizar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 4H7"/></svg></button>
            <button class="postitBtn postitColor" type="button" title="Alternar cor" aria-label="Alternar cor"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 C1 5 2 4 4 4 C6 4 7 5 7 7"/><path d="M4 4 L4 1"/></svg></button>
          </div>
          <span class="postitTitle">POST-IT</span>
        </header>
        <div class="postitBody" contenteditable="true" spellcheck="false"></div>
      `;let n=i.querySelector(".postitBody");n&&(n.textContent=r.text||""),i.style.left=`${Math.round(r.left||0)}px`,i.style.top=`${Math.round(r.top||0)}px`,r.minimized&&i.classList.add("isMinimized"),a.appendChild(i),po(e,i)})}catch(o){}}function Pe(e,a,o){return Math.min(Math.max(e,a),o)}function ba(e){var a;return((a=e==null?void 0:e.refs)==null?void 0:a.viewportEl)||document.querySelector(".viewport")}function Pa(e){var a;return((a=e==null?void 0:e.refs)==null?void 0:a.postitLayerEl)||document.getElementById("postitLayer")}function Na(e){let a=document.querySelector(".page");return a?a.getBoundingClientRect():null}function ji(e,a){let o=ba(e),t=Na(e);if(!o||!t)return null;let r=o.getBoundingClientRect();return{top:Math.round(t.bottom-r.top-a-24)}}function xt(e,a){let o=ba(e),t=Na(e);if(!o||!t)return{minY:0,maxY:0};let r=o.getBoundingClientRect(),i=3,n=Math.max(0,Math.round(t.top-r.top+i)),s=Math.max(n,Math.round(t.bottom-r.top-a-i));return{minY:n,maxY:s}}function St(){return window.innerWidth<600}function Mi(e,a){let o=ba(e),t=Na(e);if(!o||!t||!a)return;let r=o.getBoundingClientRect(),i=a.getBoundingClientRect();if(St()){let H=a.offsetWidth||148,P=a.offsetHeight||96,J=Number.parseFloat(a.style.left||"0")||0,A=Number.parseFloat(a.style.top||"0")||0,T=Pe(J,0,Math.max(0,r.width-H)),j=Pe(A,0,Math.max(0,r.height-P));(T!==J||j!==A)&&(a.classList.add("isSnapping"),a.style.left=`${Math.round(T)}px`,a.style.top=`${Math.round(j)}px`,window.setTimeout(()=>a.classList.remove("isSnapping"),280));return}if(!!(i.right<=t.left||i.left>=t.right||i.bottom<=t.top||i.top>=t.bottom))return;let s=a.offsetWidth||i.width||164,d=a.offsetHeight||i.height||96,c=8,l=Number.parseFloat(a.style.left||"0")||0,u=Number.parseFloat(a.style.top||"0")||0,p=t.left-r.left-s-c,b=t.right-r.left+c,{minY:g,maxY:m}=xt(e,d),v=Pe(u,g,m),y=Pe(p,0,Math.max(0,r.width-s)),E=Pe(b,0,Math.max(0,r.width-s)),f=H=>{let P=r.left+H,J=P+s,A=r.top+v,T=A+d;return!(J<=t.left||P>=t.right||T<=t.top||A>=t.bottom)},w=!f(y),O=!f(E),R=Math.abs(i.right-t.left),D=Math.abs(t.right-i.left),ne=l;w&&O?ne=R<=D?y:E:w?ne=y:O?ne=E:ne=R<=D?y:E,a.classList.add("isSnapping"),a.style.left=`${Math.round(ne)}px`,a.style.top=`${Math.round(v)}px`,window.setTimeout(()=>a.classList.remove("isSnapping"),280)}function Oi(e){e.dataset.postitId||(ia+=1,e.dataset.postitId=`postit-${ia}`);let a=Number.parseInt(String(e.dataset.postitId).replace(/\D/g,""),10);Number.isFinite(a)&&(ia=Math.max(ia,a))}function po(e,a){if(!a||a.__postitBound)return;a.__postitBound=!0,Oi(a);let o=a.querySelector(".postitHead"),t=a.querySelector(".postitClose"),r=a.querySelector(".postitMin"),i=a.querySelector(".postitColor"),n=a.querySelector(".postitBody");if(!o||!n)return;(!a.dataset.tone||!ke.includes(a.dataset.tone))&&(a.dataset.tone=ke[Math.floor(Math.random()*ke.length)]);let s=()=>{let m=a.dataset.tone,v=ke.indexOf(m),y=ke[(v+1)%ke.length]||ke[0];a.dataset.tone=y,Xe(e)},d=m=>{a.classList.toggle("isMinimized",m),Xe(e)},c=()=>d(!a.classList.contains("isMinimized"));t&&t.addEventListener("click",m=>{m.stopPropagation(),a.remove(),Xe(e)}),r&&r.addEventListener("click",m=>{m.stopPropagation();let v=Number(a.dataset.suppressToneUntil||"0");if(Date.now()<v){m.preventDefault();return}c()}),i&&i.addEventListener("click",m=>{m.stopPropagation();let v=Number(a.dataset.suppressToneUntil||"0");if(Date.now()<v){m.preventDefault();return}s()}),n&&n.addEventListener("input",()=>Xe(e));let l=null,u=!1,p=4,b=m=>{if(!l)return;let v=ba(e);if(!v)return;let y=v.getBoundingClientRect(),E=a.offsetWidth||164,f=a.offsetHeight||96,w=l.startX+(m.clientX-l.pointerX),O=l.startY+(m.clientY-l.pointerY),R=Pe(w,0,Math.max(0,y.width-E)),{minY:D,maxY:ne}=xt(e,f),H=Pe(O,D,ne);a.style.left=`${Math.round(R)}px`,a.style.top=`${Math.round(H)}px`;let P=ji(e,f),J=!!P&&H>=P.top;a.classList.toggle("isDeleteReady",J),(Math.abs(m.clientX-l.pointerX)>p||Math.abs(m.clientY-l.pointerY)>p)&&(u=!0)},g=()=>{if(l=null,a.classList.remove("isDragging"),a.classList.contains("isDeleteReady")){a.remove(),Xe(e);return}a.classList.remove("isDeleteReady"),Mi(e,a),Xe(e)};o.addEventListener("pointerdown",m=>{if(m.button!==0||m.target&&m.target.closest(".postitBtn"))return;let v=Number.parseFloat(a.style.left||"0"),y=Number.parseFloat(a.style.top||"0");l={startX:Number.isFinite(v)?v:0,startY:Number.isFinite(y)?y:0,pointerX:m.clientX,pointerY:m.clientY},u=!1,a.classList.add("isDragging"),o.setPointerCapture(m.pointerId),m.preventDefault()}),o.addEventListener("pointermove",b),o.addEventListener("pointerup",m=>{try{o.releasePointerCapture(m.pointerId)}catch(w){}if(!l)return;let v=Math.abs(m.clientX-l.pointerX),y=Math.abs(m.clientY-l.pointerY),E=v>p||y>p,f=u||E;g(),f&&(a.dataset.suppressToneUntil=String(Date.now()+220))}),o.addEventListener("pointercancel",g)}function Et(e){let a=Pa(e);a&&(a.querySelectorAll(".postit").forEach(o=>po(e,o)),a.querySelector(".postit")||mo(e))}function go(e,a){let o=Pa(e),t=ba(e),r=Na(e);if(!o||!t||!r)return null;let i=document.createElement("article");i.className="postit",i.dataset.tone=ke[Math.floor(Math.random()*ke.length)],i.innerHTML=`
    <header class="postitHead" title="Arraste para mover">
      <div class="postitBtns">
        <button class="postitBtn postitClose" type="button" title="Fechar" aria-label="Fechar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 1L7 7M7 1L1 7"/></svg></button>
        <button class="postitBtn postitMin"   type="button" title="Minimizar" aria-label="Minimizar post-it"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M1 4H7"/></svg></button>
        <button class="postitBtn postitColor" type="button" title="Alternar cor" aria-label="Alternar cor"><svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 7 C1 5 2 4 4 4 C6 4 7 5 7 7"/><path d="M4 4 L4 1"/></svg></button>
      </div>
      <span class="postitTitle">POST-IT</span>
    </header>
    <div class="postitBody" contenteditable="true" spellcheck="false"></div>
  `;let n=i.querySelector(".postitBody");n&&(n.textContent=String(a||"").trim()),o.appendChild(i);let s=t.getBoundingClientRect(),d=i.offsetWidth||164,c=i.offsetHeight||96,l,u;return St()?(l=Pe(s.width-d-8,0,Math.max(0,s.width-d)),u=Pe(44+ia%4*52,0,Math.max(0,s.height-c))):(l=Pe(r.right-s.left+18,0,Math.max(0,s.width-d)),u=Pe(r.top-s.top+44+ia%4*46,0,Math.max(0,s.height-c))),i.style.left=`${Math.round(l)}px`,i.style.top=`${Math.round(u)}px`,po(e,i),Xe(e),i}function qt(e,a){if(!a)return;let o=a.querySelector(".panelBody");if(!o)return;o.innerHTML=`
    <div class="postitComposer">
      <label class="postitComposerLabel" for="postitInput-${a.dataset.sliceId||"x"}">escreva e pressione Enter</label>
      <input class="postitComposerInput" id="postitInput-${a.dataset.sliceId||"x"}" type="text" placeholder="novo post-it..." />
      <div class="postitComposerHint">o post-it nasce fora da p\xE1gina branca e pode ser arrastado e minimizado.</div>
    </div>
  `;let t=o.querySelector(".postitComposerInput");t&&(t.addEventListener("keydown",r=>{var s;if(r.key!=="Enter")return;r.preventDefault();let i=String(t.value||"").trim();if(!i)return;go(e,i)&&(t.value="",(s=e==null?void 0:e.setStatus)==null||s.call(e,"post-it criado"))}),requestAnimationFrame(()=>t.focus()))}function Ia(){let e=window.getSelection();return!e||e.rangeCount===0?null:e.getRangeAt(0)}function $a(e){let a=Ia();if(!a||!e.contains(a.endContainer))return"";let o=a.cloneRange();return o.selectNodeContents(e),o.setEnd(a.endContainer,a.endOffset),o.toString()}function wt(e,a){let o=Ia();if(!o||!e.contains(o.startContainer))return;let t=o.cloneRange();t.collapse(!0);let r=a;function i(l){let u=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,null),p=null;for(;u.nextNode();){if(u.currentNode===l)return p;p=u.currentNode}return p}let n=t.startContainer,s=t.startOffset;if(n.nodeType!==Node.TEXT_NODE){let l=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,null),u=null;for(;l.nextNode();)u=l.currentNode;if(!u)return;n=u,s=u.textContent.length}let d=null,c=0;for(;r>0&&n;){let l=Math.min(r,s),u=s-l,p=document.createRange();if(p.setStart(n,u),p.setEnd(n,s),p.deleteContents(),d=n,c=u,r-=l,r<=0)break;n=i(n),s=n?n.textContent.length:0}if(d){let l=window.getSelection();if(l){let u=document.createRange();try{u.setStart(d,c),u.collapse(!0),l.removeAllRanges(),l.addRange(u)}catch(p){}}}}function Ve(e){let a=Ia();if(!a)return;a.collapse(!1),a.insertNode(e);let o=window.getSelection(),t=document.createRange();t.setStartAfter(e),t.collapse(!0),o.removeAllRanges(),o.addRange(t)}function ja(e){if(!e||!e.parentNode)return;let a=e.nextSibling;!a||a.nodeType!==Node.TEXT_NODE?(a=document.createTextNode("\u200B"),e.parentNode.insertBefore(a,e.nextSibling||null)):(!a.textContent||!a.textContent.includes("\u200B"))&&(a.textContent=`\u200B${a.textContent||""}`);let o=window.getSelection();if(!o)return;let t=document.createRange();t.setStart(a,1),t.collapse(!0),o.removeAllRanges(),o.addRange(t)}function Ma(e){if(document.execCommand("insertText",!1,e))return;let o=Ia();if(!o)return;o.deleteContents();let t=document.createTextNode(e);o.insertNode(t);let r=window.getSelection(),i=document.createRange();i.setStartAfter(t),i.collapse(!0),r.removeAllRanges(),r.addRange(i)}function Ee(e){return String(e!=null?e:"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;")}function Oa(e,a){let o=e.lastIndexOf(a);if(o===-1)return"";let r=e.slice(0,o).trimEnd().match(/([A-Za-zÀ-ÿ0-9_-]+)\s*$/);return r?r[1]:""}var sa={doravante:"A partir de agora; daqui em diante.",outrossim:"Al\xE9m disso; do mesmo modo; igualmente.",amiude:"Com frequ\xEAncia; muitas vezes.",destarte:"Dessa maneira; portanto.",mormente:"Principalmente; sobretudo."};var Ri="src/assets/lingua/pt_pos_core.json",zi=["src/assets/lingua/pt_pos_chunk_1.json","src/assets/lingua/pt_pos_chunk_2.json","src/assets/lingua/pt_pos_chunk_3.json"],Di=[/[a-f]/i,/[g-o]/i,/[p-z]/i],At=e=>S(null,null,function*(){let a=yield fetch(e);if(!a.ok)throw new Error(`Falha ao carregar ${e}`);return a.json()}),ge={entries:new Map,coreLoaded:!1,chunksLoaded:new Set,normalizeLookupKey(e){if(!e)return"";let o=String(e).trim().replace(/^[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+|[\s"'“”‘’.,;:!?()\\[\\]{}<>«»—-]+$/g,"");try{return o.toLowerCase().normalize("NFC")}catch(t){return o.toLowerCase()}},normalize(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}},addEntries(e){Object.entries(e||{}).forEach(([a,o])=>{if(!o)return;let t=this.normalize(a);this.entries.set(t,xe({word:a},o))})},loadCore(){return S(this,null,function*(){if(this.coreLoaded)return;let e=yield At(Ri);this.addEntries(e),this.coreLoaded=!0})},loadChunkFor(e){return S(this,null,function*(){let a=(e||"").charAt(0),o=Di.findIndex(i=>i.test(a));if(o<0||this.chunksLoaded.has(o))return;let t=zi[o];if(!t)return;let r=yield At(t);this.addEntries(r),this.chunksLoaded.add(o)})},lookup(e){return S(this,null,function*(){if(!e)return null;yield this.loadCore();let a=this.normalizeLookupKey(e),o=this.normalize(a),t=this.entries.get(o)||null;return t||(yield this.loadChunkFor(o),t=this.entries.get(o)||null),t})},guess(e){if(!e)return null;let a=this.normalizeLookupKey(e);if(!a)return null;let o=a.toLowerCase();return/^\d+([.,]\d+)?(%|º|ª)?$/.test(o)?{pos:["NUM"],probable:!0}:/(esimo|esima|esimos|esimas)$/.test(o)?{pos:["NUM"],probable:!0}:/mente$/.test(o)&&o.length>6?{pos:["ADV"],probable:!0}:/(agem|agens|igem|ugem)$/.test(o)?{pos:["SUBST"],probable:!0}:/(cao|coes|sao|soes)$/.test(o)?{pos:["SUBST"],probable:!0}:/(dade|dades|tude|tudes)$/.test(o)?{pos:["SUBST"],probable:!0}:/(ismo|ismos|ista|istas)$/.test(o)?{pos:["SUBST"],probable:!0}:/(mento|mentos)$/.test(o)?{pos:["SUBST"],probable:!0}:/(ncia|ncias)$/.test(o)?{pos:["SUBST"],probable:!0}:/(ura|uras)$/.test(o)&&o.length>5?{pos:["SUBST"],probable:!0}:/(eiro|eira|eiros|eiras)$/.test(o)?{pos:["SUBST"],probable:!0}:/(cia|cias|gia|gias|fia|fias|mia|mias|pia|pias|sia|sias|xia|xias|oria|orias|nia|nias)$/.test(o)?{pos:["SUBST"],probable:!0}:/(ando|endo|indo)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(ado|ido)$/.test(o)&&o.length>4?{pos:["VERB"],probable:!0}:/[aei]r$/.test(o)&&o.length>3?{pos:["VERB"],probable:!0}:/ei$/.test(o)&&o.length>4?{pos:["VERB"],probable:!0}:/ou$/.test(o)&&o.length>4?{pos:["VERB"],probable:!0}:/eu$/.test(o)&&o.length>3?{pos:["VERB"],probable:!0}:/iu$/.test(o)&&o.length>3?{pos:["VERB"],probable:!0}:/(ava|avas|avam)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(ia|ias|iam)$/.test(o)&&o.length>4?{pos:["VERB"],probable:!0}:/(aram|eram|iram)$/.test(o)&&o.length>6?{pos:["VERB"],probable:!0}:/(aste|este|iste)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(asse|asses|esse|esses|isse|isses)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(armos|ermos|irmos|arem|erem|irem)$/.test(o)&&o.length>6?{pos:["VERB"],probable:!0}:/(arei|erei|irei|ara|era|ira|arao|erao|irao)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(aria|arias|ariam|eria|erias|eriam|iria|irias|iriam)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(amos|emos|imos)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(ais|eis)$/.test(o)&&o.length>4?{pos:["VERB"],probable:!0}:/(alam|elam|ilam|ecam|icam|ocam|ucam|ulam)$/.test(o)?{pos:["VERB"],probable:!0}:/[^aeiou](am|em)$/.test(o)&&o.length>5?{pos:["VERB"],probable:!0}:/(avel|ivel|oso|osa|osos|osas|ivo|iva|ivos|ivas|ico|ica|icos|icas|ante|antes|ente|entes|udo|uda|udos|udas|undo|unda|undos|undas)$/.test(o)?{pos:["ADJ"],probable:!0}:/(al|ais|ual|uais|vel|veis|il|is)$/.test(o)&&o.length>4?{pos:["ADJ"],probable:!0}:/(issimo|issima|issimos|issimas)$/.test(o)?{pos:["ADJ"],probable:!0}:/^(meu|minha|meus|minhas|teu|tua|teus|tuas|seu|sua|seus|suas|nosso|nossa|nossos|nossas|vosso|vossa|vossos|vossas|este|esta|estes|estas|esse|essa|esses|essas|aquele|aquela|aqueles|aquelas|isto|isso|aquilo|alguem|ninguem|todos|todas|cada|qualquer|quaisquer|outro|outra|outros|outras|algum|alguma|alguns|algumas|nenhum|nenhuma|nenhuns|nenhumas|cujo|cuja|cujos|cujas|ambos|ambas|outrem|quem|onde|como)$/.test(o)?{pos:["PRON"],probable:!0}:{pos:["SUBST"],probable:!0,fallback:!0}},disambiguate(o){return S(this,arguments,function*(e,a=[]){if(!e)return null;let r=this.normalizeLookupKey(e).toLowerCase(),i=a.map(b=>this.normalizeLookupKey(b)),n=i.findIndex(b=>b===r),s=n>0?i[n-1]:"",d=n>=0&&n<i.length-1?i[n+1]:"",c=s?yield this.lookup(s):null,l=d?yield this.lookup(d):null,u=(c==null?void 0:c.pos)||[],p=(l==null?void 0:l.pos)||[];if(r==="muito"){if(p.includes("ADJ"))return{pos:["ADV"],contextual:!0};if(p.includes("SUBST"))return{pos:["ADJ"],contextual:!0}}if(r==="meio"){if(p.includes("ADJ"))return{pos:["ADV"],contextual:!0};if(p.includes("SUBST"))return{pos:["ADJ"],contextual:!0}}if(r==="s\xF3")return p.includes("VERB")?{pos:["ADV"],contextual:!0}:{pos:["ADJ"],contextual:!0};if(r==="que")return["o","a","os","as","um","uma","uns","umas"].includes(s)?{pos:["PRON"],contextual:!0}:{pos:["CONJ"],contextual:!0};if(r==="como")return["t\xE3o","assim","tal","mais","menos","tanto"].includes(s)?{pos:["ADV"],contextual:!0}:{pos:["CONJ"],contextual:!0};if(r==="se")return p.includes("VERB")?{pos:["PRON"],contextual:!0}:{pos:["CONJ"],contextual:!0};if(r==="logo")return s?{pos:["ADV"],contextual:!0}:{pos:["CONJ"],contextual:!0};if(r==="mais"||r==="menos"){if(p.includes("ADJ"))return{pos:["ADV"],contextual:!0};if(p.includes("SUBST"))return{pos:["ADJ"],contextual:!0}}return null})}};var Fi=["VERB","ADJ","ADV","SUBST","PRON","PREP","CONJ","ART","NUM","INTJ"],Bi={"wc-verb":"verbo","wc-subst":"substantivo","wc-adj":"adjetivo","wc-adv":"adv\xE9rbio","wc-pron":"pronome","wc-art":"artigo","wc-prep":"preposi\xE7\xE3o","wc-conj":"conjun\xE7\xE3o","wc-num":"numeral","wc-intj":"interjei\xE7\xE3o"};function Hi(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}}function Vi(e){var r;let a=Hi(e).replace(/^['\-]+|['\-]+$/g,"");if(!a)return null;let o=ge.entries.get(a),t=(o==null?void 0:o.pos)||((r=ge.guess(a))==null?void 0:r.pos)||[];for(let i of Fi)if(t.includes(i))return i;return null}function Ui(e){let a=[],o=/([a-záàãâéêíóôõúüçñ'-]+)|([^a-záàãâéêíóôõúüçñ'-]+)/gi,t;for(;(t=o.exec(e))!==null;)t[1]!==void 0?a.push({text:t[1],isWord:!0}):a.push({text:t[2],isWord:!1});return a}var Ki={acceptNode(e){var a,o,t,r;return(a=e.parentElement)!=null&&a.closest(".slice")||(r=(t=(o=e.parentElement)==null?void 0:o.className)==null?void 0:t.startsWith)!=null&&r.call(t,"wc-")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}},vo="wc-mark";function fo(e){let a=window.getSelection();if(!(a!=null&&a.rangeCount))return null;let o=a.getRangeAt(0);if(!o.collapsed||!e.contains(o.startContainer))return null;let t=document.createElement(vo);try{o.insertNode(t)}catch(r){return null}return{el:e}}function bo(e){var o;if(!e)return;let a=(o=e.el.querySelector(vo))!=null?o:document.querySelector(vo);if(a){try{let t=document.createRange();t.setStartAfter(a),t.collapse(!0);let r=window.getSelection();r==null||r.removeAllRanges(),r==null||r.addRange(t)}catch(t){}a.remove()}}function Lt(e){let a=Array.from(e.querySelectorAll('span[class^="wc-"]'));for(let o of a)o.replaceWith(document.createTextNode(o.textContent));e.normalize()}function Ct(e){Lt(e);let a=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,Ki),o=[],t;for(;t=a.nextNode();)o.push(t);for(let r of o){let i=r.textContent;if(!i.trim())continue;let n=Ui(i);if(!n.some(d=>d.isWord))continue;let s=document.createDocumentFragment();for(let{text:d,isWord:c}of n){if(!c){s.appendChild(document.createTextNode(d));continue}let l=Vi(d);if(!l){s.appendChild(document.createTextNode(d));continue}let u=document.createElement("span");u.className=`wc-${l.toLowerCase()}`,u.textContent=d,s.appendChild(u)}r.replaceWith(s)}}var Ne=null,ho=null;function Gi(){return Ne||(Ne=document.createElement("div"),Ne.id="wcTooltip",document.body.appendChild(Ne)),Ne}function xo(e){clearTimeout(ho);let a=e.className,o=Bi[a];if(!o)return;let t=getComputedStyle(e).color,r=Gi();r.textContent=o,r.style.color=t,r.style.borderColor=t.replace("rgb(","rgba(").replace(")",", .3)");let i=e.getBoundingClientRect();r.style.left=`${i.left+i.width/2}px`,r.style.top=`${i.top-10}px`,r.style.transform="translateX(-50%) translateY(-100%)",r.style.transition="none",r.classList.add("visible")}function Ue(e=!1){if(clearTimeout(ho),e){Ne==null||Ne.classList.remove("visible");return}ho=setTimeout(()=>Ne==null?void 0:Ne.classList.remove("visible"),120)}function Tt(e){var t,r;let a=window.getSelection();if(a&&!a.isCollapsed){Ue(!0);return}let o=(r=(t=e.target)==null?void 0:t.closest)==null?void 0:r.call(t,'span[class^="wc-"]');o?xo(o):Ue()}function _t(e){var r,i;let a=(r=e.changedTouches)==null?void 0:r[0];if(!a)return;let o=document.elementFromPoint(a.clientX,a.clientY),t=(i=o==null?void 0:o.closest)==null?void 0:i.call(o,'span[class^="wc-"]');t?(e.preventDefault(),xo(t)):Ue(!0)}var yo=null;function kt(){clearTimeout(yo),yo=setTimeout(()=>{var r,i;let e=window.getSelection();if(!(e!=null&&e.rangeCount))return;let a=e.getRangeAt(0);if(!a.collapsed){Ue(!0);return}let o=a.startContainer,t=(i=(r=o.nodeType===Node.TEXT_NODE?o.parentElement:o)==null?void 0:r.closest)==null?void 0:i.call(r,'span[class^="wc-"]');t&&xo(t)},200)}function Wi(){return S(this,null,function*(){yield ge.loadCore(),yield ge.loadChunkFor("a"),yield ge.loadChunkFor("g"),yield ge.loadChunkFor("p")})}function Pt(e){return S(this,null,function*(){var o,t,r,i,n,s,d;let a=!e.state.wcActive;if(e.state.wcActive=a,a){(o=e.setStatus)==null||o.call(e,"classes: carregando l\xE9xico\u2026");try{yield Wi()}catch(c){console.warn("WC lexicon:",c)}for(let c of e.state.pages||[]){let l=fo(c);Ct(c),l&&bo(l)}e.state._wcListeners=new Map,e.state._wcHoverListeners=new Map,e.state._wcTouchListeners=new Map,e.state._wcTimers=new Map;for(let c of e.state.pages||[]){let l=()=>{var p,b;if(e.state._wcAnnotating)return;clearTimeout((p=e.state._wcTimers)==null?void 0:p.get(c));let u=setTimeout(()=>{if(e.state._wcAnnotating)return;e.state._wcAnnotating=!0;let g=fo(c);Ct(c),g&&bo(g),e.state._wcAnnotating=!1},400);(b=e.state._wcTimers)==null||b.set(c,u)};c.addEventListener("input",l),e.state._wcListeners.set(c,l),c.addEventListener("mouseover",Tt),c.addEventListener("mouseleave",()=>Ue()),c.addEventListener("mousedown",()=>Ue(!0)),e.state._wcHoverListeners.set(c,Tt),c.addEventListener("touchend",_t,{passive:!1}),e.state._wcTouchListeners.set(c,_t)}document.addEventListener("selectionchange",kt),(t=e.setStatus)==null||t.call(e,"classes: ativo")}else{Ue(!0),clearTimeout(yo),document.removeEventListener("selectionchange",kt);for(let c of e.state.pages||[]){clearTimeout((r=e.state._wcTimers)==null?void 0:r.get(c));let l=(i=e.state._wcListeners)==null?void 0:i.get(c);l&&c.removeEventListener("input",l);let u=(n=e.state._wcHoverListeners)==null?void 0:n.get(c);u&&(c.removeEventListener("mouseover",u),c.removeEventListener("mouseleave",()=>Ue()));let p=(s=e.state._wcTouchListeners)==null?void 0:s.get(c);p&&c.removeEventListener("touchend",p);let b=fo(c);Lt(c),b&&bo(b)}e.state._wcListeners=new Map,e.state._wcHoverListeners=new Map,e.state._wcTouchListeners=new Map,e.state._wcTimers=new Map,(d=e.setStatus)==null||d.call(e,"classes: desativado")}})}function Nt(e){e.state.wcActive=!1,e.state._wcAnnotating=!1,e.state._wcListeners=new Map,e.state._wcHoverListeners=new Map,e.state._wcTouchListeners=new Map,e.state._wcTimers=new Map}var Ra=new Map,It=new Set,ze=null,na=null;function So(e){return S(this,null,function*(){let a=yield fetch(e);if(!a.ok)throw new Error(`Falha ao carregar ${e}`);return a.json()})}function Ji(e){var o;let a=(o=e==null?void 0:e.normalize("NFD").replace(/[\u0300-\u036f]/g,""))==null?void 0:o[0];return!a||!/[a-z]/.test(a)?"_":a}function $t(e){return S(this,null,function*(){if(!It.has(e)){It.add(e);try{let a=`src/assets/lingua/pt_dict_rich_chunk_${e}.json`,o=yield So(a);for(let[t,r]of Object.entries(o||{}))Ra.set(za(t),xe({word:t},r))}catch(a){}}})}function Yi(e){return S(this,null,function*(){yield $t(Ji(e))})}function Qi(){return S(this,null,function*(){if(!ze)try{ze=yield So("src/assets/lingua/pt_regencias.json")}catch(e){ze={}}})}function Xi(){return S(this,null,function*(){if(!na)try{na=yield So("src/assets/lingua/pt_duvidas.json")}catch(e){na={}}})}function za(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}}var Zi={VERB:"verbo",SUBST:"substantivo",ADJ:"adjetivo",ADV:"adv\xE9rbio",PRON:"pronome",ART:"artigo",PREP:"preposi\xE7\xE3o",CONJ:"conjun\xE7\xE3o",NUM:"numeral",INTJ:"interjei\xE7\xE3o",NOUN:"substantivo",PART:"partic\xEDpio"};function es(e){return!Array.isArray(e)||!e.length?null:e.map(a=>Zi[a]||a.toLowerCase()).join(" / ")}function jt(e){return S(this,null,function*(){if(!e)return null;let a=za(e.trim());if(!a)return null;yield Promise.all([Yi(a),ge.loadCore(),ge.loadChunkFor(a),Qi(),Xi()]);let o=Ra.get(a)||null,t=ge.entries.get(a)||null,r=(ze==null?void 0:ze[e.toLowerCase()])||(ze==null?void 0:ze[a])||null,i=Object.keys(na||{}).find(s=>{let d=na[s];return d.patterns?d.patterns.some(c=>{try{return new RegExp(c,"i").test(a)}catch(l){return!1}}):!1}),n=i?na[i]:null;return as(e,a,o,t,r,n)})}function as(e,a,o,t,r,i){var m,v,y,E,f,w,O,R;let n=[],s=e,d=(m=o==null?void 0:o.pos)!=null&&m.length?o.pos:(t==null?void 0:t.pos)||[],c=es(d);if(n.push(s.toUpperCase()+(c?`  [${c}]`:"")),n.push("\u2500".repeat(34)),o!=null&&o.def)n.push(os(o.def));else if(t){let D=ge.guess(a),ne=(((v=t==null?void 0:t.pos)==null?void 0:v[0])||((y=D==null?void 0:D.pos)==null?void 0:y[0])||"").toUpperCase();n.push(ts(a,ne)||"(palavra identificada no corpus \u2014 sem defini\xE7\xE3o)")}else n.push("(n\xE3o encontrado no corpus local)");let l=(o==null?void 0:o.sin)||[],u=(o==null?void 0:o.ant)||[];l.length&&(n.push(""),n.push("Sin\xF4nimos: "+l.join(", "))),u.length&&(n.push(""),n.push("Ant\xF4nimos: "+u.join(", ")));let p=(E=o==null?void 0:o.regencia)!=null&&E.length?o.regencia:r?Object.values(r.sentidos||{}).map(D=>`${D.regencia} \u2014 ${D.exemplo}`):[];p.length&&(n.push(""),n.push("Reg\xEAncia:"),p.forEach(D=>n.push(`  ${D}`)));let b=(o==null?void 0:o.formas)||(o==null?void 0:o.flexoes)||[];b.length&&(n.push(""),n.push("Formas: "+b.slice(0,6).join(", ")+(b.length>6?"\u2026":"")));let g=(o==null?void 0:o.exemplos)||[];return g.length&&(n.push(""),n.push("Ex.: "+g[0])),o!=null&&o.observacoes&&(n.push(""),n.push("Obs.: "+o.observacoes)),i&&(n.push(""),n.push("\u26A0 D\xFAvida comum:"),n.push(i.explicacao),(w=(f=i.exemplos)==null?void 0:f.correto)!=null&&w[0]&&n.push("  \u2713 "+i.exemplos.correto[0]),(R=(O=i.exemplos)==null?void 0:O.incorreto)!=null&&R[0]&&n.push("  \u2717 "+i.exemplos.incorreto[0])),{word:s,posList:d,label:c,body:n.join(`
`)}}function os(e){return e.replace(/^\s*[;,\s]+/,"").replace(/\s+/g," ").trim()}function ts(e,a){return{VERB:"Verbo da l\xEDngua portuguesa.",SUBST:"Substantivo \u2014 nomeia uma entidade.",ADJ:"Adjetivo \u2014 qualifica ou caracteriza.",ADV:"Adv\xE9rbio \u2014 modifica verbo, adjetivo ou outro adv\xE9rbio.",PRON:"Pronome \u2014 substitui ou acompanha o nome.",ART:"Artigo \u2014 determina o nome.",PREP:"Preposi\xE7\xE3o \u2014 conecta termos da ora\xE7\xE3o.",CONJ:"Conjun\xE7\xE3o \u2014 liga ora\xE7\xF5es ou termos.",NUM:"Numeral \u2014 indica quantidade ou ordem.",INTJ:"Interjei\xE7\xE3o \u2014 expressa emo\xE7\xE3o ou rea\xE7\xE3o."}[a]||null}function Mt(){return S(this,null,function*(){let e="abcdefghijklmnopqrstuvwxyz_".split("");yield Promise.all(e.map(a=>$t(a)))})}function Da(e){return Ra.has(za(e))}function Eo(e){var a;return(a=Ra.get(za(e)))!=null?a:null}var rs="/src/assets/corpus",qo=class{constructor(){this._cache=new Map,this._loading=new Map}load(a,o){return S(this,null,function*(){let t=`${a}/${o}`;if(this._cache.has(t))return this._cache.get(t);if(this._loading.has(t))return this._loading.get(t);let r=fetch(`${rs}/${a}/${o}.json`).then(i=>{if(!i.ok)throw new Error(`corpus: n\xE3o encontrado \u2014 ${t} (${i.status})`);return i.json()}).then(i=>(this._cache.set(t,i),this._loading.delete(t),i)).catch(i=>{throw this._loading.delete(t),i});return this._loading.set(t,r),r})}get(a,o){var t;return(t=this._cache.get(`${a}/${o}`))!=null?t:null}preload(a){return S(this,null,function*(){yield Promise.all(a.map(([o,t])=>this.load(o,t)))})}isLoaded(a,o){return this._cache.has(`${a}/${o}`)}_norm(a){return String(a).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}_flatten(a){return Array.isArray(a.entries)?a.entries:Array.isArray(a.sections)?a.sections.flatMap(o=>{var t,r,i;return[...(t=o.entries)!=null?t:[],...(r=o.rules)!=null?r:[],...(i=o.items)!=null?i:[]]}):[]}search(a,o,t){return S(this,null,function*(){let r=yield this.load(a,o),i=this._norm(t);return this._flatten(r).filter(n=>this._norm(JSON.stringify(n)).includes(i))})}deepSearch(a,o,t){return S(this,null,function*(){let r=yield this.load(a,o),i=this._norm(t),n=[],s=(d,c)=>{typeof d=="string"&&this._norm(d).includes(i)?n.push({path:c,value:d}):Array.isArray(d)?d.forEach((l,u)=>s(l,`${c}[${u}]`)):d&&typeof d=="object"&&Object.entries(d).forEach(([l,u])=>s(u,`${c}.${l}`))};return s(r,"root"),n})}lookup(a,o,t,r){return S(this,null,function*(){let i=yield this.load(a,o),n=this._norm(r);return this._flatten(i).filter(s=>{var d;return this._norm((d=s[t])!=null?d:"")===n})})}getById(a,o,t){return S(this,null,function*(){var i;return(i=(yield this.lookup(a,o,"id",t))[0])!=null?i:null})}all(a,o){return S(this,null,function*(){let t=yield this.load(a,o);return this._flatten(t)})}meta(a,o){return S(this,null,function*(){let s=yield this.load(a,o),{entries:r,sections:i}=s;return ft(s,["entries","sections"])})}verbRegency(a){return S(this,null,function*(){var i,n;let o=yield this.load("syntax","regencia"),t=this._norm(a);return(n=((i=o.sections)!=null?i:[]).flatMap(s=>{var d;return(d=s.entries)!=null?d:[]}).find(s=>{var d;return this._norm((d=s.verb)!=null?d:"").split("/").some(c=>c.trim()===t)}))!=null?n:null})}nominalRegency(a){return S(this,null,function*(){var i,n,s;let o=yield this.load("syntax","regencia"),t=this._norm(a),r=((i=o.sections)!=null?i:[]).find(d=>d.id==="regencia_nominal");return(s=((n=r==null?void 0:r.entries)!=null?n:[]).find(d=>{var c;return this._norm((c=d.name)!=null?c:"").split("/").some(l=>l.trim()===t)}))!=null?s:null})}concordanciaRule(a){return S(this,null,function*(){var r,i;return(i=((r=(yield this.load("syntax","concordancia")).sections)!=null?r:[]).flatMap(n=>{var s;return(s=n.rules)!=null?s:[]}).find(n=>n.id===a))!=null?i:null})}findParonyms(a){return S(this,null,function*(){var i,n;let o=yield this.load("semantics","semantics"),t=this._norm(a),r=((i=o.entries)!=null?i:[]).find(s=>s.id==="paronimia");return((n=r==null?void 0:r.entries)!=null?n:[]).filter(s=>{var d;return((d=s.pair)!=null?d:[]).some(c=>this._norm(c).includes(t))})})}figure(a){return S(this,null,function*(){var i,n;let o=yield this.load("stylistics","figures"),t=this._norm(a);return(n=((i=o.sections)!=null?i:[]).flatMap(s=>{var d;return(d=s.entries)!=null?d:[]}).find(s=>{var d,c;return this._norm((d=s.label)!=null?d:"").includes(t)||this._norm((c=s.id)!=null?c:"")===t}))!=null?n:null})}wordClass(a){return S(this,null,function*(){return this.getById("morphology","classes",a.toUpperCase())})}findPrefix(a){return S(this,null,function*(){var r;let o=yield this.load("morphology","prefixes"),t=String(a).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return((r=o.entries)!=null?r:[]).filter(i=>{var s;let n=String((s=i.form)!=null?s:"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return n.startsWith(t)||n.replace(/-/g,"").startsWith(t)})})}findSuffix(a){return S(this,null,function*(){var r;let o=yield this.load("morphology","suffixes"),t=String(a).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return((r=o.entries)!=null?r:[]).filter(i=>{var s;let n=String((s=i.form)!=null?s:"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/-/g,"");return n===t||n.endsWith(t)})})}findRoot(a){return S(this,null,function*(){return this.search("morphology","roots",a)})}verbClass(a){return S(this,null,function*(){return this.getById("morphology","flexion_verbal",a.toLowerCase())})}irregularVerb(a){return S(this,null,function*(){var r,i;let o=yield this.load("morphology","flexion_verbal"),t=a.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");return(i=((r=o.irregulars)!=null?r:[]).find(n=>{var d,c;return String((c=(d=n.id)!=null?d:n.infinitive)!=null?c:"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")===t}))!=null?i:null})}},ca=new qo;var is={mentePorParagrafo:{info:2,vicio:3},passivaPorParagrafo:{estilo:3},palavrasPorSentenca:{info:41,estilo:61},repeticaoJanela:30},ss={mentePorParagrafo:{vicio:2},passivaPorParagrafo:{estilo:2},palavrasPorSentenca:{estilo:36,vicio:51},repeticaoJanela:50},ns=/\b\w{4,}mente\b/gi,cs=/\b(?:foi|foram|é|são|era|eram|será|serão|tem\s+sido|têm\s+sido|está\s+sendo|estão\s+sendo|havia\s+sido|tinham\s+sido)\s+\w+(?:ado|ida|ados|idas|ido|idos)\b/gi,ls=/[.!?…]+/g;function ds(e,a){let t=e.trim().split(/\s+/).filter(u=>u.length>0).length;if(t<5)return null;let r=[...e.matchAll(ns)].map(u=>u[0]),i=r.length,s=[...e.matchAll(cs)].length,c=e.split(ls).filter(u=>u.trim().length>3).length||1,l=Math.round(t/c);return{idx:a,numPalavras:t,numMente:i,formasMente:[...new Set(r)],numPassiva:s,numSentencas:c,mediaWords:l}}function us(e,a){if(!e)return[];let o=a==="jornalistico"?ss:is,t=[];return o.mentePorParagrafo.vicio&&e.numMente>=o.mentePorParagrafo.vicio?t.push({nivel:"VICIO",mensagem:`${e.numMente} adv\xE9rbios em -mente neste par\xE1grafo`,detalhe:`Formas: ${e.formasMente.join(", ")}. Prefira substantivos com preposi\xE7\xE3o ou verbos mais precisos.`,paragrafo:e.idx}):o.mentePorParagrafo.info&&e.numMente>=o.mentePorParagrafo.info&&t.push({nivel:"INFO",mensagem:`${e.numMente} adv\xE9rbios em -mente neste par\xE1grafo`,detalhe:`Formas: ${e.formasMente.join(", ")}.`,paragrafo:e.idx}),o.passivaPorParagrafo.estilo&&e.numPassiva>=o.passivaPorParagrafo.estilo&&t.push({nivel:"ESTILO",mensagem:`${e.numPassiva} vozes passivas neste par\xE1grafo`,detalhe:"Excesso de voz passiva reduz a clareza. Prefira a voz ativa quando o agente \xE9 conhecido.",paragrafo:e.idx}),o.palavrasPorSentenca.vicio&&e.mediaWords>=o.palavrasPorSentenca.vicio?t.push({nivel:"VICIO",mensagem:`Senten\xE7as muito longas \u2014 m\xE9dia de ${e.mediaWords} palavras`,detalhe:"Senten\xE7as longas sobrecarregam o leitor. Divida em per\xEDodos mais curtos.",paragrafo:e.idx}):o.palavrasPorSentenca.estilo&&e.mediaWords>=o.palavrasPorSentenca.estilo?t.push({nivel:"ESTILO",mensagem:`Senten\xE7as longas \u2014 m\xE9dia de ${e.mediaWords} palavras`,detalhe:"Considere dividir algumas senten\xE7as para melhorar a leiturabilidade.",paragrafo:e.idx}):o.palavrasPorSentenca.info&&e.mediaWords>=o.palavrasPorSentenca.info&&t.push({nivel:"INFO",mensagem:`Senten\xE7as longas \u2014 m\xE9dia de ${e.mediaWords} palavras`,detalhe:"Senten\xE7as acima de 40 palavras podem ser divididas.",paragrafo:e.idx}),t}function Fa(e,a="literario"){if(!e||e.trim().length<20)return{metricas:[],alertas:[],resumo:null};let t=e.split(/\n{1,}/).filter(l=>l.trim().length>0).map((l,u)=>ds(l,u)).filter(Boolean),r=t.flatMap(l=>us(l,a)),i=t.reduce((l,u)=>l+u.numPalavras,0),n=t.reduce((l,u)=>l+u.numMente,0),s=t.reduce((l,u)=>l+u.numPassiva,0),d=t.length>0?Math.round(t.reduce((l,u)=>l+u.mediaWords,0)/t.length):0,c={totalPalavras:i,totalParagrafos:t.length,densidadeMente:i>0?+(n/i*100).toFixed(1):0,totalPassiva:s,mediaWordsPorSentenca:d,totalAlertas:r.length,erros:r.filter(l=>l.nivel==="VICIO").length,estilo:r.filter(l=>l.nivel==="ESTILO").length,info:r.filter(l=>l.nivel==="INFO").length,perfil:a};return{metricas:t,alertas:r,resumo:c}}var Rt=[{e:/\bcesso\b/gi,c:"acesso",r:"'Acesso' n\xE3o existe sem o 'a' inicial.",cat:"grafia",agt:1},{e:/\bexcessão\b/gi,c:"exce\xE7\xE3o",r:"'Exce\xE7\xE3o' n\xE3o tem duplo 's'.",cat:"grafia",agt:1},{e:/\bbeneficiente\b/gi,c:"beneficente",r:"'Beneficente' n\xE3o tem 'i' antes de 'ente'.",cat:"grafia",agt:1},{e:/\bimpecilho\b/gi,c:"empecilho",r:"'Empecilho' come\xE7a com 'em', n\xE3o 'im'.",cat:"grafia",agt:1},{e:/\bconcenso\b/gi,c:"consenso",r:"'Consenso' n\xE3o tem 'c' antes de 'n'.",cat:"grafia",agt:1},{e:/\bpreviligio\b/gi,c:"privil\xE9gio",r:"A grafia correta \xE9 'privil\xE9gio'.",cat:"grafia",agt:1},{e:/\bintersecção\b/gi,c:"interse\xE7\xE3o",r:"'Interse\xE7\xE3o' perdeu o duplo 'cc' ap\xF3s 2009.",cat:"grafia",agt:1},{e:/\bvôo\b/gi,c:"voo",r:"Ap\xF3s 2009, 'v\xF4o' perdeu o acento circunflexo.",cat:"acento",agt:1},{e:/\bzôo\b/gi,c:"zoo",r:"Ap\xF3s 2009, 'z\xF4o' perdeu o acento circunflexo.",cat:"acento",agt:1},{e:/\bpára\b/gi,c:"para",r:"Ap\xF3s a reforma de 2009, 'p\xE1ra' (verbo) perdeu o acento.",cat:"acento",agt:1},{e:/\bpólo\b/gi,c:"polo",r:"Ap\xF3s 2009, 'p\xF3lo' perdeu o acento diferencial.",cat:"acento",agt:1},{e:/\bfreqüente\b/gi,c:"frequente",r:"Ap\xF3s 2009, o trema foi eliminado do portugu\xEAs.",cat:"acento",agt:1},{e:/\btranqüilo\b/gi,c:"tranquilo",r:"Ap\xF3s 2009, o trema foi eliminado.",cat:"acento",agt:1},{e:/\bporquê\s+(?![.\?!,])/gi,c:"porque",r:"'Porqu\xEA' com acento s\xF3 aparece no final de frase ou como substantivo.",cat:"acento",agt:1},{e:/\bà\s+nível\b/gi,c:"em n\xEDvel",r:"'A n\xEDvel de' \xE9 galicismo. Use 'em n\xEDvel de'.",cat:"norma",agt:1},{e:/\bmeia\s+noite\b/gi,c:"meia-noite",r:"'Meia-noite' \xE9 grafado com h\xEDfen.",cat:"hifen",agt:1},{e:/\bmeia\s+dia\b/gi,c:"meio-dia",r:"'Meio-dia' \xE9 grafado com h\xEDfen.",cat:"hifen",agt:1},{e:/\bguarda\s+chuva\b/gi,c:"guarda-chuva",r:"Compostos com 'guarda' levam h\xEDfen.",cat:"hifen",agt:1},{e:/\bprefiro\s+mais\b/gi,c:"prefiro",r:"'Prefiro' j\xE1 indica compara\xE7\xE3o. 'Prefiro mais' \xE9 redundante.",cat:"pleonasmo",agt:1},{e:/\bpra\b/gi,c:"para",r:"'Pra' \xE9 contra\xE7\xE3o informal de 'para'. Em escrita formal ou liter\xE1ria, prefira 'para'.",cat:"norma",agt:1},{e:/\bpro\b(?!\s*(?:rata|tempore|forma|xy|domo))/gi,c:"para o",r:"'Pro' \xE9 contra\xE7\xE3o informal de 'para o'.",cat:"norma",agt:1},{e:/\bpros\b/gi,c:"para os",r:"'Pros' \xE9 contra\xE7\xE3o informal de 'para os'.",cat:"norma",agt:1},{e:/\bpras\b/gi,c:"para as",r:"'Pras' \xE9 contra\xE7\xE3o informal de 'para as'.",cat:"norma",agt:1},{e:/\bpq\b/gi,c:"porque / por qu\xEA",r:"'Pq' \xE9 abrevia\xE7\xE3o informal. Use 'porque' (explica\xE7\xE3o) ou 'por qu\xEA' (pergunta).",cat:"norma",agt:1},{e:/\bmau\s+(?:humor|cheiro|hálito|gosto|jeito|exemplo|caminho|estado|sinal)\b/gi,c:"mau humor / mau cheiro\u2026",r:"'Mau' (adjetivo = ruim) n\xE3o se confunde com 'mal' (adv\xE9rbio). Use 'mau' antes de substantivos.",cat:"grafia",agt:1},{e:/\bmal\s+(?:criado|educado|humorado|agradecido|tratado|comportado|entendido|estar|jeito)\b/gi,c:"mal-criado / mal-educado\u2026",r:"Compostos com 'mal' + adjetivo/partic\xEDpio levam h\xEDfen.",cat:"hifen",agt:1}],zt=[{e:/\bhouveram\b/gi,c:"houve",r:"'Haver' impessoal n\xE3o se flexiona no plural. Use sempre 'houve'.",cat:"flexao_verbal",agt:2},{e:/\bfazem\s+(?:dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+)\s+anos?\b/gi,c:"faz \u2026 anos",r:"'Fazer' indicando tempo decorrido \xE9 impessoal: 'faz dois anos'.",cat:"flexao_verbal",agt:2},{e:/\beles\s+é\b/gi,c:"eles s\xE3o",r:"Sujeito plural 'eles' exige verbo no plural.",cat:"concordancia",agt:2},{e:/\belas\s+é\b/gi,c:"elas s\xE3o",r:"Sujeito plural 'elas' exige verbo no plural.",cat:"concordancia",agt:2},{e:/\bpessoal\s+(?:foram|estavam|disseram|fizeram)\b/gi,c:"pessoal foi / estava / disse / fez",r:"'Pessoal' \xE9 coletivo singular. O verbo fica no singular.",cat:"concordancia",agt:2},{e:/\ba\s+gente\s+(?:fomos|éramos|fizemos|viemos)\b/gi,c:"a gente foi / era / fez / veio",r:"'A gente' exige verbo na 3\xAA pessoa do singular.",cat:"concordancia",agt:2},{e:/\bmenas\b/gi,c:"menos",r:"'Menos' \xE9 invari\xE1vel \u2014 n\xE3o existe 'menas'.",cat:"flexao_nominal",agt:2},{e:/\bmais\s+melhor\b/gi,c:"melhor",r:"'Melhor' j\xE1 \xE9 comparativo. 'Mais melhor' \xE9 pleonasmo.",cat:"grau",agt:2},{e:/\bmais\s+pior\b/gi,c:"pior",r:"'Pior' j\xE1 \xE9 comparativo. 'Mais pior' \xE9 pleonasmo.",cat:"grau",agt:2},{e:/\bmais\s+maior\b/gi,c:"maior",r:"'Maior' j\xE1 \xE9 comparativo. 'Mais maior' \xE9 redundante.",cat:"grau",agt:2},{e:/\bmuito\s+ótimo\b/gi,c:"\xF3timo",r:"'\xD3timo' j\xE1 \xE9 superlativo. 'Muito \xF3timo' \xE9 redundante.",cat:"grau",agt:2},{e:/\bmuito\s+péssimo\b/gi,c:"p\xE9ssimo",r:"'P\xE9ssimo' j\xE1 \xE9 superlativo. 'Muito p\xE9ssimo' \xE9 redundante.",cat:"grau",agt:2},{e:/\bpor\s+isso\s+que\b/gi,c:"por isso",r:"'Por isso que' \xE9 redundante. Use 'por isso' ou '\xE9 por isso que'.",cat:"classe_palavras",agt:2},{e:/\bonde\s+que\b/gi,c:"onde",r:"'Onde que' n\xE3o \xE9 aceito na norma culta.",cat:"classe_palavras",agt:2},{e:/\bo\s+sentinela\b/gi,c:"a sentinela",r:"'Sentinela' \xE9 sempre feminino.",cat:"genero",agt:2},{e:/\bde\s+encontro\s+com\b/gi,c:"de encontro a / ao encontro de",r:"'De encontro a' = contra. 'Ao encontro de' = a favor.",cat:"semantica_morfologica",agt:2},{e:/\btô\b|\btou\b/gi,c:"estou",r:"'T\xF4'/'Tou' s\xE3o formas coloquiais de 'estou'. Em texto escrito, prefira a forma completa.",cat:"registro",agt:2},{e:/\btá\b/gi,c:"est\xE1",r:"'T\xE1' \xE9 forma coloquial de 'est\xE1'. Em texto escrito, prefira a forma completa.",cat:"registro",agt:2},{e:/\btô\s+(?:indo|vindo|fazendo|pensando|tentando|trabalhando|estudando|querendo|podendo)\b/gi,c:"estou indo / estou vindo\u2026",r:"Use a forma completa 'estou' em vez de 't\xF4'.",cat:"registro",agt:2},{e:/\bvc\b/gi,c:"voc\xEA",r:"'Vc' \xE9 abrevia\xE7\xE3o informal de 'voc\xEA'. Use a forma completa.",cat:"registro",agt:2},{e:/\btbm?\b/gi,c:"tamb\xE9m",r:"'Tb'/'Tbm' s\xE3o abrevia\xE7\xF5es informais de 'tamb\xE9m'.",cat:"registro",agt:2},{e:/\bmsm\b/gi,c:"mesmo",r:"'Msm' \xE9 abrevia\xE7\xE3o informal de 'mesmo'.",cat:"registro",agt:2},{e:/\bqdo\b/gi,c:"quando",r:"'Qdo' \xE9 abrevia\xE7\xE3o informal de 'quando'.",cat:"registro",agt:2},{e:/\btem\s+(?:muitos?|muitas?|vários?|várias?|inúmeros?|inúmeras?|diversos?|diversas?|centenas?|milhares?|bilhões?)\b/gi,c:"h\xE1 muitos / h\xE1 v\xE1rios\u2026",r:"'Ter' como verbo existencial impessoal \xE9 coloquial. Na norma culta, use 'h\xE1': 'h\xE1 muitos problemas'.",cat:"norma",agt:2},{e:/\btinham\s+(?:muitos?|muitas?|vários?|várias?)\b/gi,c:"havia muitos / havia v\xE1rios\u2026",r:"'Tinham' existencial impessoal deve ser 'havia': 'havia muitas pessoas'.",cat:"flexao_verbal",agt:2}],Dt=[{e:/\bcheg(?:ar|ou|ei|amos|aram|aste|armos|arão|ava|avas|ávamos|ando)\s+(?:em|no|na|nos|nas)\b/gi,c:"chegar a / ao / \xE0\u2026",r:"'Chegar' rege a preposi\xE7\xE3o 'a' (ao/\xE0/aos/\xE0s): 'chegar ao aeroporto', 'chegar \xE0 escola'. Nunca 'chegar no/na'.",cat:"regencia_verbal",agt:3},{e:/\b(?:vou|fui|foi|irá|irei|iremos|irão|vamos|foram|iam|ia|ias|íamos)\s+(?:no|na|nos|nas)\s+\w+/gi,c:"vou ao / fui \xE0\u2026",r:"'Ir' rege a preposi\xE7\xE3o 'a' (ao/\xE0): 'vou ao m\xE9dico', 'fui \xE0 farm\xE1cia'. Nunca 'vou no/na'.",cat:"regencia_verbal",agt:3},{e:/\bassistir\s+(?:o\b|os\b)\s+\w+/gi,c:"assistir ao / aos\u2026",r:"'Assistir' no sentido de 'presenciar/ver' \xE9 transitivo indireto: 'assistir ao jogo', n\xE3o 'assistir o jogo'.",cat:"regencia_verbal",agt:3},{e:/\bvisar\s+(?:o\s+(?:lucro|resultado|objetivo|sucesso|crescimento|impacto|bem)|os\s+\w+)\b/gi,c:"visar ao lucro / aos objetivos\u2026",r:"'Visar' (objetivar) \xE9 transitivo indireto: 'visar ao lucro', n\xE3o 'visar o lucro'.",cat:"regencia_verbal",agt:3},{e:/\bobedece[rms]?\s+(?:as|os)\s+\w+/gi,c:"obedecer \xE0s / aos\u2026",r:"'Obedecer' \xE9 transitivo indireto: 'obedecer \xE0s regras' (com crase), n\xE3o 'obedecer as regras'.",cat:"regencia_verbal",agt:3},{e:/\bimplicar\s+em\b/gi,c:"implicar (direto)",r:"'Implicar' no sentido de 'acarretar' \xE9 transitivo direto \u2014 sem preposi\xE7\xE3o: 'isso implica responsabilidade'.",cat:"regencia_verbal",agt:3},{e:/\bnamorar\s+com\b/gi,c:"namorar (direto)",r:"'Namorar' \xE9 transitivo direto: 'ele namora Ana', n\xE3o 'ele namora com Ana'.",cat:"regencia_verbal",agt:3},{e:/\b(?:esquecer|esqueci|esqueceu|esqueço|esquecemos|esqueceram)\s+de\b/gi,c:"esquecer / esquecer-se de",r:"Sem pronome: 'esqueci o nome'. Com pronome: 'esqueci-me do nome'. 'Esquecer de' sem pronome \xE9 coloquial.",cat:"regencia_verbal",agt:3},{e:/\b(?:lembrar|lembrei|lembrou|lembro|lembramos|lembraram)\s+de\b/gi,c:"lembrar / lembrar-se de",r:"Sem pronome: 'lembrei o nome'. Com pronome: 'lembrei-me do nome'. 'Lembrar de' sem pronome \xE9 coloquial.",cat:"regencia_verbal",agt:3},{e:/\bresponder\s+(?:o\b|os\b)\s+\w+/gi,c:"responder ao / aos\u2026",r:"'Responder' (dar resposta a algo) \xE9 transitivo indireto: 'responder ao email', n\xE3o 'responder o email'.",cat:"regencia_verbal",agt:3},{e:/\bcapaz\s+(?:em|para|a\b|por|com|sobre)\b/gi,c:"capaz de",r:"'Capaz' rege exclusivamente 'de': 'capaz de fazer'. 'Capaz em/para/por' s\xE3o incorretos.",cat:"regencia_nominal",agt:3},{e:/\bansioso\s+para\b/gi,c:"ansioso por / ansioso com",r:"'Ansioso' rege 'por' ou 'com'. 'Ansioso para' \xE9 anglicismo (calco do ingl\xEAs 'anxious to').",cat:"regencia_nominal",agt:3},{e:/\bimune\s+de\b/gi,c:"imune a",r:"'Imune' rege exclusivamente 'a': 'imune a cr\xEDticas', n\xE3o 'imune de cr\xEDticas'.",cat:"regencia_nominal",agt:3},{e:/\bpara\s+mim\s+(?:\w+ar|\w+er|\w+ir|\w+or)\b/gi,c:"para eu fazer / para eu ir\u2026",r:"Antes de verbo no infinitivo, o pronome deve ser sujeito ('eu'), n\xE3o obl\xEDquo ('mim'): 'para eu fazer'.",cat:"regencia_nominal",agt:3},{e:/\bse\s+(?:vende|aluga|precisa|faz|compra|procura|aceita|busca|contrata|oferece|entrega|atende)\b/gi,c:"vende-se / aluga-se / precisa-se\u2026",r:"Com 'se' \xEDndice de indetermina\xE7\xE3o, a \xEAnclise \xE9 obrigat\xF3ria: 'vende-se', n\xE3o 'se vende'.",cat:"colocacao_pronominal",agt:3},{e:/\bMe\s+(?:diga|fala|conta|explica|mostra|ajuda|dê|faz|traz|manda|passa|diz)\b/g,c:"Diga-me / Fale-me / Conte-me\u2026",r:"No imperativo afirmativo, o pronome vai depois do verbo: 'Diga-me', n\xE3o 'Me diga'.",cat:"colocacao_pronominal",agt:3},{e:/\bsendo\s+que\b/gi,c:"embora / uma vez que / pois / j\xE1 que",r:"'Sendo que' \xE9 coloquial. Escolha a conjun\xE7\xE3o adequada: 'embora' (concess\xE3o), 'pois/j\xE1 que' (causa).",cat:"registro",agt:3},{e:/\baonde\s+(?!vou|vai|foram|ir|fica|você\s+vai|ele\s+vai)\b/gi,c:"onde",r:"'Aonde' indica movimento (destino). Para lugar sem movimento, use 'onde'.",cat:"regencia_verbal",agt:3},{e:/\bnenhum\s+dos\s+\w+\s+(?:foram|estavam|fizeram|disseram)\b/gi,c:"nenhum dos \u2026 (singular)",r:"Com 'nenhum dos', o verbo fica no singular: 'nenhum dos alunos foi'.",cat:"concordancia_verbal",agt:3},{e:/\bonde\s+(?=\w+\s+(?:disse|afirmou|declarou|escreveu|relatou|menciona))/gi,c:"em que / no qual / na qual",r:"'Onde' indica lugar f\xEDsico. Para contexto textual ou situa\xE7\xE3o, use 'em que' ou 'no qual'.",cat:"ambiguidade",agt:3},{e:/\bcujo\s+o\b|\bcuja\s+a\b|\bcujos\s+os\b|\bcujas\s+as\b/gi,c:"cujo / cuja / cujos / cujas (sem artigo)",r:"'Cujo' j\xE1 \xE9 determinante \u2014 n\xE3o leva artigo depois. 'Cujo o livro' \xE9 erro; use 'cujo livro'.",cat:"concordancia",agt:3},{e:/\ba\s+(?:um|dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+|pouco|muito|algum)\s+(?:tempo|anos?|meses?|dias?|horas?|semanas?)\s+(?:atrás|passados?)\b/gi,c:"h\xE1 \u2026 atr\xE1s",r:"Para tempo decorrido, use 'h\xE1' (verbo haver). 'A dois anos atr\xE1s' tem dupla marca\xE7\xE3o; correto: 'h\xE1 dois anos'.",cat:"grafia",agt:3}],Ft=[{e:/\bdescriminar\b/gi,c:"discriminar",r:"'Discriminar' = distinguir/segregar. 'Descriminar' = retirar car\xE1ter criminoso.",cat:"paronimia",agt:4},{e:/\bratificar\s+(?:uma\s+)?(?:erro|engano|equívoco)\b/gi,c:"retificar o erro",r:"'Retificar' = corrigir. 'Ratificar' = confirmar. N\xE3o se ratifica um erro.",cat:"paronimia",agt:4},{e:/\beminente\s+(?:perigo|risco|ameaça|colapso)\b/gi,c:"iminente perigo / risco iminente",r:"'Iminente' = prestes a acontecer. 'Eminente' = ilustre.",cat:"paronimia",agt:4},{e:/\bperigo\s+eminente\b/gi,c:"perigo iminente",r:"'Iminente' = prestes a ocorrer. 'Eminente' = not\xE1vel.",cat:"paronimia",agt:4},{e:/\brisco\s+eminente\b/gi,c:"risco iminente",r:"'Iminente' = prestes a ocorrer. Use 'risco iminente'.",cat:"paronimia",agt:4},{e:/\binfligir\s+(?:uma\s+)?(?:regra|norma|lei|contrato)\b/gi,c:"infringir a regra / a norma",r:"'Infringir' = violar norma. 'Infligir' = impor castigo.",cat:"paronimia",agt:4},{e:/\bimergir\s+(?:do|da|de)\b/gi,c:"emergir de",r:"'Imergir' = mergulhar. Para 'sair de', use 'emergir'.",cat:"paronimia",agt:4},{e:/\bsubir\s+para\s+cima\b/gi,c:"subir",r:"'Subir' j\xE1 implica movimento para cima. Pleonasmo vicioso.",cat:"pleonasmo",agt:4},{e:/\bdescer\s+(?:para\s+)?abaixo\b/gi,c:"descer",r:"'Descer' j\xE1 implica movimento para baixo. Pleonasmo vicioso.",cat:"pleonasmo",agt:4},{e:/\belo\s+de\s+ligação\b/gi,c:"elo",r:"'Elo' j\xE1 significa liga\xE7\xE3o. 'Elo de liga\xE7\xE3o' \xE9 pleonasmo.",cat:"pleonasmo",agt:4},{e:/\bconsenso\s+geral\b/gi,c:"consenso",r:"'Consenso' j\xE1 pressup\xF5e acordo geral. Redundante.",cat:"pleonasmo",agt:4},{e:/\bmonopólio\s+exclusivo\b/gi,c:"monop\xF3lio",r:"'Monop\xF3lio' j\xE1 \xE9 dom\xEDnio exclusivo. Pleonasmo.",cat:"pleonasmo",agt:4},{e:/\bprever\s+antecipadamente\b/gi,c:"prever",r:"'Prever' j\xE1 \xE9 'ver antes'. O adv\xE9rbio \xE9 redundante.",cat:"pleonasmo",agt:4},{e:/\bencarar\s+de\s+frente\b/gi,c:"encarar",r:"'Encarar' j\xE1 significa enfrentar de frente. Pleonasmo.",cat:"pleonasmo",agt:4},{e:/\brecapitular\s+novamente\b/gi,c:"recapitular",r:"'Recapitular' j\xE1 implica retomar. 'Novamente' \xE9 redundante.",cat:"pleonasmo",agt:4},{e:/\bviés\s+tendencioso\b/gi,c:"vi\xE9s",r:"'Vi\xE9s' j\xE1 denota inclina\xE7\xE3o tendenciosa.",cat:"pleonasmo",agt:4},{e:/\bfato\s+real\b/gi,c:"fato",r:"'Fato' j\xE1 denota algo real. 'Fato real' \xE9 tautologia.",cat:"redundancia",agt:4},{e:/\bopinião\s+pessoal\b/gi,c:"opini\xE3o",r:"'Opini\xE3o' j\xE1 \xE9 pessoal por natureza.",cat:"redundancia",agt:4},{e:/\bcolaborar\s+juntos\b/gi,c:"colaborar",r:"'Colaborar' j\xE1 pressup\xF5e a\xE7\xE3o conjunta.",cat:"redundancia",agt:4},{e:/\bdividir\s+em\s+duas\s+metades\b/gi,c:"dividir ao meio",r:"'Metade' j\xE1 significa cada uma das duas partes. Redundante.",cat:"redundancia",agt:4},{e:/\bliteralmente\s+(?:morri|matei|explodi|destruí)\b/gi,c:"(remova 'literalmente' ou use 'quase')",r:"'Literalmente' = de forma exata, n\xE3o figurada. Us\xE1-lo com hip\xE9rboles \xE9 contradi\xE7\xE3o sem\xE2ntica.",cat:"ambiguidade",agt:4},{e:/\bno\s+caso\s+de\s+que\b/gi,c:"no caso de / caso",r:"'No caso de que' \xE9 calco do espanhol/ingl\xEAs. Use 'no caso de' + infinitivo ou 'caso' + subjuntivo.",cat:"inadequado",agt:4},{e:/\bcessão\s+de\s+(?:palavras?|voz|vez|lugar)\b/gi,c:"concess\xE3o de palavras / ceder a vez",r:"'Cess\xE3o' = transfer\xEAncia de direito. Para ceder vez/lugar, use 'ceder' ou 'concess\xE3o'.",cat:"paronimia",agt:4},{e:/\bseção\s+(?:eleitoral|de\s+votação)\b|\bsessão\s+(?:do\s+dente|odontológica)\b/gi,c:"se\xE7\xE3o eleitoral / sess\xE3o odontol\xF3gica",r:"'Se\xE7\xE3o' = divis\xE3o/reparti\xE7\xE3o. 'Sess\xE3o' = per\xEDodo/reuni\xE3o. 'Cess\xE3o' = transfer\xEAncia.",cat:"paronimia",agt:4},{e:/\bao\s+invés\s+de\b/gi,c:"em vez de",r:"'Ao inv\xE9s de' significa 'ao contr\xE1rio de'. Para alternativa/substitui\xE7\xE3o, use 'em vez de'.",cat:"paronimia",agt:4},{e:/\bporque\s+não\?/gi,c:"por que n\xE3o?",r:"Em perguntas diretas ou indiretas, use 'por que' (separado e sem acento).",cat:"acento",agt:4},{e:/\bnão\s+obstante\s+(?:de\s+)?isso\b/gi,c:"n\xE3o obstante isso / n\xE3o obstante",r:"'N\xE3o obstante' n\xE3o requer preposi\xE7\xE3o 'de'. Diga 'n\xE3o obstante isso' ou apenas 'n\xE3o obstante'.",cat:"regencia_nominal",agt:4},{e:/\bapesar\s+que\b/gi,c:"apesar de (que)",r:"'Apesar de' rege preposi\xE7\xE3o 'de'. 'Apesar que' n\xE3o est\xE1 consagrado; use 'apesar de que' ou 'embora'.",cat:"regencia_nominal",agt:4},{e:/\bem\s+função\s+que\b/gi,c:"em fun\xE7\xE3o de",r:"'Em fun\xE7\xE3o de' rege preposi\xE7\xE3o 'de', n\xE3o 'que'.",cat:"regencia_nominal",agt:4},{e:/\bascendeu?\s+(?:a\s+luz|as\s+luzes|o\s+fogo|uma\s+vela|a\s+lareira|o\s+fogão)\b/gi,c:"acendeu a luz / o fogo\u2026",r:"'Acender' = ligar, iluminar. 'Ascender' = elevar-se. Para luz e fogo, use 'acender'.",cat:"paronimia",agt:4},{e:/\bacendeu?\s+(?:ao\s+poder|ao\s+trono|ao\s+cargo|à\s+chefia|à\s+presidência|socialmente)\b/gi,c:"ascendeu ao poder / cargo\u2026",r:"'Ascender' = elevar-se hierarquicamente. 'Acender' \xE9 para luz/fogo. Use 'ascender' para posi\xE7\xE3o.",cat:"paronimia",agt:4},{e:/\binfringi(?:u|ram)\s+(?:uma?\s+)?(?:pena|castigo|punição|sofrimento|dano)\b/gi,c:"infligiu uma pena / castigo\u2026",r:"'Infligir' = causar pena ou sofrimento. 'Infringir' = violar norma. Para penas/castigos, use 'infligir'.",cat:"paronimia",agt:4},{e:/\bdiferi(?:u|ram)\s+(?:o\s+)?(?:pedido|requerimento|recurso|solicitação)\b/gi,c:"deferiu o pedido / recurso\u2026",r:"'Deferir' = conceder, aprovar (jur\xEDdico). 'Diferir' = ser diferente. 'Diferiu o pedido' est\xE1 errado.",cat:"paronimia",agt:4},{e:/\bdeferiu?\s+(?:de|do|da)\s+/gi,c:"diferiu de\u2026",r:"'Diferir de' = ser diferente de. 'Deferir de' n\xE3o existe; use 'diferir de'.",cat:"paronimia",agt:4},{e:/\breali(?:zou|za|zei|zamos|zaram)\s+que\b/gi,c:"percebeu que / notou que\u2026",r:"Em PT-BR, 'realizar' = concretizar. 'Perceber', 'notar', 'tomar consci\xEAncia' para o sentido de 'to realize' do ingl\xEAs.",cat:"inadequado",agt:4},{e:/\bdiante\s+do\s+(?:acima\s+)?exposto\b/gi,c:"portanto / assim / logo\u2026",r:"Clich\xEA burocr\xE1tico. Conclua diretamente: 'A proposta \xE9, portanto, vi\xE1vel.' sem f\xF3rmula preambular.",cat:"redundancia",agt:4},{e:/\bno\s+que\s+(?:tange|diz\s+respeito|concerne)\s+(?:a|ao|à|aos|às)\b/gi,c:"quanto a / sobre / em rela\xE7\xE3o a\u2026",r:"Jarg\xE3o burocr\xE1tico pesado. Prefira 'quanto a', 'sobre', 'em rela\xE7\xE3o a' para o mesmo resultado.",cat:"redundancia",agt:4},{e:/\bfazer\s+uma\s+(?:reflexão|análise|avaliação|discussão|consideração|abordagem)\b/gi,c:"refletir / analisar / avaliar\u2026",r:"Verbo nominalizado dilui a a\xE7\xE3o. Use o verbo direto: 'refletir', 'analisar', 'avaliar'.",cat:"redundancia",agt:4}],Bt=[{e:/\bO\s+diretor,\s+(?:é|foi|será|estava|decidiu|anunciou)\b/gi,c:"O diretor (sem v\xEDrgula)",r:"N\xE3o se usa v\xEDrgula entre sujeito simples e verbo.",cat:"virgula_proibida",agt:5},{e:/\bOs\s+alunos,\s+(?:foram|estão|devem|podem|precisam|realizam)\b/gi,c:"Os alunos (sem v\xEDrgula)",r:"N\xE3o se usa v\xEDrgula entre sujeito e verbo.",cat:"virgula_proibida",agt:5},{e:/\bA\s+empresa,\s+(?:anunciou|decidiu|investiu|contratou|demitiu|lançou)\b/gi,c:"A empresa (sem v\xEDrgula)",r:"N\xE3o se usa v\xEDrgula entre sujeito e verbo.",cat:"virgula_proibida",agt:5},{e:/\bNo\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"No entanto,",r:"'No entanto' \xE9 conjun\xE7\xE3o adversativa. Deve ser seguido de v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bPortanto\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Portanto,",r:"'Portanto' \xE9 conjun\xE7\xE3o conclusiva. Deve ser seguido de v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bEntretanto\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Entretanto,",r:"'Entretanto' \xE9 conjun\xE7\xE3o adversativa. Exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bAssim\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Assim,",r:"'Assim' como conectivo conclusivo deve ser seguido de v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bAlém\s+disso\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Al\xE9m disso,",r:"'Al\xE9m disso' \xE9 locu\xE7\xE3o aditiva que exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bOu\s+seja\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Ou seja,",r:"'Ou seja' introduz explica\xE7\xE3o e exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bPor\s+exemplo\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Por exemplo,",r:"'Por exemplo' exige v\xEDrgula ap\xF3s a locu\xE7\xE3o.",cat:"virgula_obrigatoria",agt:5},{e:/\bDe\s+fato\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"De fato,",r:"'De fato' como conectivo deve ser seguido de v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bPor\s+(?:sua\s+vez|outro\s+lado|fim|último)\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Por sua vez, / Por outro lado, / Por fim,",r:"Locu\xE7\xF5es de transi\xE7\xE3o exigem v\xEDrgula ao final.",cat:"virgula_obrigatoria",agt:5},{e:/\bcomo\s*:\s*(?:por\s+exemplo|ex\.|e\.g\.)/gi,c:"como (sem dois-pontos)",r:"Ap\xF3s 'como', n\xE3o se usam dois-pontos antes de 'por exemplo'.",cat:"dois_pontos",agt:5},{e:/\bsão\s*:\s*(?:o|a|os|as|um|uma)\b/gi,c:"s\xE3o o / s\xE3o a\u2026",r:"Dois-pontos ap\xF3s verbo de liga\xE7\xE3o seguido de objeto simples \xE9 incorreto.",cat:"dois_pontos",agt:5},{e:/\bé\s*:\s*(?:o|a|os|as|um|uma)\b/gi,c:"\xE9 o / \xE9 a\u2026",r:"Dois-pontos ap\xF3s '\xE9' antes de predicativo simples \xE9 uso incorreto.",cat:"dois_pontos",agt:5},{e:/\.{4,}/g,c:"\u2026",r:"Retic\xEAncias t\xEAm exatamente tr\xEAs pontos. Quatro ou mais \xE9 incorreto.",cat:"reticencias",agt:5},{e:/[.!?]\s*\.\.\./g,c:"\u2026 (sem ponto antes)",r:"N\xE3o se usa ponto antes de retic\xEAncias. As retic\xEAncias j\xE1 encerram a frase.",cat:"reticencias",agt:5},{e:/\bContudo\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Contudo,",r:"'Contudo' \xE9 conjun\xE7\xE3o adversativa que exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bTodavia\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Todavia,",r:"'Todavia' \xE9 conjun\xE7\xE3o adversativa que exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bOutrossim\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Outrossim,",r:"'Outrossim' (al\xE9m disso) como conectivo exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bDessa\s+forma\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Dessa forma,",r:"'Dessa forma' como locu\xE7\xE3o conclusiva exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bDesse\s+modo\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Desse modo,",r:"'Desse modo' como locu\xE7\xE3o conclusiva exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bPor\s+conseguinte\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Por conseguinte,",r:"'Por conseguinte' \xE9 locu\xE7\xE3o conclusiva que exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bEm\s+suma\s+(?=[a-záéíóúàâêôãõçü])/gi,c:"Em suma,",r:"'Em suma' \xE9 locu\xE7\xE3o conclusiva que exige v\xEDrgula.",cat:"virgula_obrigatoria",agt:5},{e:/\bfim\s+de\s+semana\b/gi,c:"fim de semana",r:"Aten\xE7\xE3o: 'fim de semana' n\xE3o leva h\xEDfen na norma do Acordo de 1990.",cat:"hifen",agt:5}],Ht=[{e:/\ba\s+medida\s+que\b/gi,c:"\xE0 medida que",r:"'\xC0 medida que' \xE9 locu\xE7\xE3o adverbial proporcional e exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\bna\s+medida\s+que\b/gi,c:"na medida em que / \xE0 medida que",r:"'Na medida em que' indica causa. '\xC0 medida que' indica propor\xE7\xE3o. 'Na medida que' sem 'em' \xE9 incorreto.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+primeira\s+vista\b/gi,c:"\xE0 primeira vista",r:"'\xC0 primeira vista' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+toa\b/gi,c:"\xE0 toa",r:"'\xC0 toa' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+vontade\b/gi,c:"\xE0 vontade",r:"'\xC0 vontade' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+direita\b(?!\s+de)/gi,c:"\xE0 direita",r:"'\xC0 direita' como locu\xE7\xE3o de lugar exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+esquerda\b(?!\s+de)/gi,c:"\xE0 esquerda",r:"'\xC0 esquerda' como locu\xE7\xE3o de lugar exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+tarde\b(?!\s+de)/gi,c:"\xE0 tarde",r:"'\xC0 tarde' como locu\xE7\xE3o de tempo exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+noite\b(?!\s+de)/gi,c:"\xE0 noite",r:"'\xC0 noite' como locu\xE7\xE3o de tempo exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+base\s+de\b/gi,c:"\xE0 base de",r:"'\xC0 base de' \xE9 locu\xE7\xE3o prepositiva que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+beira\s+de\b/gi,c:"\xE0 beira de",r:"'\xC0 beira de' \xE9 locu\xE7\xE3o prepositiva que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+luz\s+de\b/gi,c:"\xE0 luz de",r:"'\xC0 luz de' (considerando) \xE9 locu\xE7\xE3o que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+mercê\s+de\b/gi,c:"\xE0 merc\xEA de",r:"'\xC0 merc\xEA de' (sujeito ao poder de) exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+custa\s+de\b/gi,c:"\xE0 custa de",r:"'\xC0 custa de' \xE9 locu\xE7\xE3o prepositiva que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+(?:uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)\s+horas?\b/gi,c:"\xE0s \u2026 horas",r:"Antes de horas determinadas, a crase \xE9 obrigat\xF3ria: '\xE0s tr\xEAs horas'.",cat:"crase_horas",agt:6},{e:/\bà\s+(?:seu|meu|nosso|vosso|este|esse|aquele|cada|qualquer|todo)\b/gi,c:"a seu / a meu / a nosso\u2026",r:"N\xE3o h\xE1 crase antes de pronomes possessivos ou demonstrativos masculinos.",cat:"crase_proibida",agt:6},{e:/\bà\s+(?:fazer|ser|estar|ter|ir|vir|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar)\b/gi,c:"a fazer / a ser / a estar\u2026",r:"N\xE3o h\xE1 crase antes de verbos no infinitivo.",cat:"crase_proibida",agt:6},{e:/\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós)\b/gi,c:"a ela / a elas / a voc\xEA\u2026",r:"N\xE3o h\xE1 crase antes de pronomes pessoais: 'disse a ela'.",cat:"crase_proibida",agt:6},{e:/\bpara\s+à\b/gi,c:"para a",r:"N\xE3o h\xE1 crase ap\xF3s a preposi\xE7\xE3o 'para'.",cat:"crase_proibida",agt:6},{e:/\bde\s+à\b/gi,c:"da",r:"N\xE3o h\xE1 crase ap\xF3s a preposi\xE7\xE3o 'de'. Use 'da'.",cat:"crase_proibida",agt:6},{e:/\bfoi\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi,c:"foi \xE0 Fran\xE7a / \xE0 Espanha\u2026",r:"Pa\xEDses femininos com artigo exigem crase: 'foi \xE0 Fran\xE7a'.",cat:"crase_paises",agt:6},{e:/\bvou\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Portugal|Grécia|Irlanda|Bélgica|Suécia)\b/gi,c:"vou \xE0 Fran\xE7a / \xE0 Espanha\u2026",r:"Pa\xEDses femininos com artigo exigem crase no destino: 'vou \xE0 Fran\xE7a'.",cat:"crase_paises",agt:6},{e:/\ba\s+última\s+hora\b/gi,c:"\xE0 \xFAltima hora",r:"'\xC0 \xFAltima hora' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+distância\b/gi,c:"\xE0 dist\xE2ncia",r:"'\xC0 dist\xE2ncia' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+força\b/gi,c:"\xE0 for\xE7a",r:"'\xC0 for\xE7a' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+mão\b/gi,c:"\xE0 m\xE3o",r:"'\xC0 m\xE3o' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+vista\b/gi,c:"\xE0 vista",r:"'\xC0 vista' (pagamento ou percep\xE7\xE3o) \xE9 locu\xE7\xE3o que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+deriva\b/gi,c:"\xE0 deriva",r:"'\xC0 deriva' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+revelia\b/gi,c:"\xE0 revelia",r:"'\xC0 revelia' (sem consentimento) exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+flor\s+da\b/gi,c:"\xE0 flor da",r:"'\xC0 flor da pele' \xE9 locu\xE7\xE3o que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+queima-roupa\b|\ba\s+queima\s+roupa\b/gi,c:"\xE0 queima-roupa",r:"'\xC0 queima-roupa' \xE9 locu\xE7\xE3o adverbial que exige crase.",cat:"crase_obrigatoria",agt:6},{e:/\ba\s+(?:uma|duas|três|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|treze|catorze|quatorze|quinze|dezesseis|dezessete|dezoito|dezenove|vinte)\s*(?:e\s*(?:meia|meia))?\s*h\b/gi,c:"\xE0s \u2026 h",r:"Antes de horas determinadas, a crase \xE9 obrigat\xF3ria: '\xE0s 15h'.",cat:"crase_horas",agt:6}],ms={1:1,2:2,3:3,4:4,5:5,6:6,8:8},ps={grafia:1,acento:2,hifen:3,crase_proibida:4,crase_obrigatoria:5,virgula_proibida:6,regencia:7,concordancia:8,flexao_verbal:9,virgula_obrigatoria:10,colocacao_pronominal:11,paronimia:12,concordancia_verbal:13,flexao_nominal:14,grau:15,genero:16,dois_pontos:17,norma:18,pleonasmo:19,registro:20,classe_palavras:21,redundancia:22,ambiguidade:23,reticencias:24,aposto:25,semantica_morfologica:26,crase_horas:5,crase_demonstrativo:6,crase_paises:7,inadequado:27,regencia_verbal:8,regencia_nominal:9},je={1:{nome:"Ortografia",cor:"#ff6b6b",sigla:"OR",regras:Rt},2:{nome:"Morfologia",cor:"#4dabf7",sigla:"MO",regras:zt},3:{nome:"Sintaxe",cor:"#69db7c",sigla:"SI",regras:Dt},4:{nome:"Sem\xE2ntica",cor:"#ffd43b",sigla:"SE",regras:Ft},5:{nome:"Pontua\xE7\xE3o",cor:"#f783ac",sigla:"PO",regras:Bt},6:{nome:"Crase",cor:"#da77f2",sigla:"CR",regras:Ht},7:{nome:"L\xE9xico",cor:"#ff9f43",sigla:"LE",regras:[]},8:{nome:"Estilo",cor:"#9c27b0",sigla:"ES",regras:[]}},Vt={1:"Ortografia \u2014 grafia correta das palavras, acentua\xE7\xE3o gr\xE1fica, uso do h\xEDfen e adequa\xE7\xE3o \xE0 norma ortogr\xE1fica vigente (Acordo de 2009).",2:"Morfologia \u2014 concord\xE2ncia nominal e verbal, flex\xE3o de n\xFAmero, g\xEAnero e grau, e classe gramatical das formas.",3:"Sintaxe \u2014 regras de reg\xEAncia (n\xE3o banco de frases): detecta qualquer desvio de preposi\xE7\xE3o, coloca\xE7\xE3o pronominal e estrutura oracional por padr\xE3o aberto.",4:"Sem\xE2ntica \u2014 sentido das palavras: paron\xEDmia, ambiguidade, redund\xE2ncia e usos semanticamente inadequados.",5:"Pontua\xE7\xE3o \u2014 emprego correto de v\xEDrgula obrigat\xF3ria e proibida, dois-pontos, retic\xEAncias e delimita\xE7\xE3o de aposto.",6:"Crase \u2014 acento grave resultante da contra\xE7\xE3o preposi\xE7\xE3o + artigo feminino: uso obrigat\xF3rio, proibido e contextual.",7:"L\xE9xico \u2014 spell-checker offline por dist\xE2ncia de Levenshtein: detecta prov\xE1veis erros de digita\xE7\xE3o e sugere a forma mais pr\xF3xima no l\xE9xico.",8:"Estilo \u2014 densidade de adv\xE9rbios em -mente, voz passiva e comprimento de senten\xE7a por par\xE1grafo. Perfil: liter\xE1rio (\u22653 -mente = v\xEDcio) e jornal\xEDstico (\u22652 -mente = v\xEDcio)."},wo={grafia:"#ff6b6b",acento:"#cc5de8",hifen:"#4dabf7",regencia:"#20c997",concordancia:"#ff8787",flexao_verbal:"#4dabf7",flexao_nominal:"#66d9e8",grau:"#ffa94d",genero:"#da77f2",norma:"#ff922b",pleonasmo:"#a9e34b",classe_palavras:"#69db7c",semantica_morfologica:"#ff6b6b",paronimia:"#f03e3e",redundancia:"#d9480f",ambiguidade:"#5c7cfa",inadequado:"#862e9c",virgula_obrigatoria:"#f76707",virgula_proibida:"#e03131",dois_pontos:"#1971c2",reticencias:"#5c940d",aposto:"#ae3ec9",concordancia_verbal:"#f76707",colocacao_pronominal:"#e64980",registro:"#ae3ec9",regencia_verbal:"#20c997",regencia_nominal:"#0ca678",crase_obrigatoria:"#da77f2",crase_proibida:"#f03e3e",crase_horas:"#ffd43b",crase_demonstrativo:"#63e6be",crase_paises:"#ff922b",typo:"#ff9f43",densidade_mente:"#9c27b0",densidade_passiva:"#7b1fa2",comprimento_frase:"#6a1b9a"};function gs(e,a){if(e===a)return 0;if(e.length===0)return a.length;if(a.length===0)return e.length;let o=Array.from({length:a.length+1},(t,r)=>r);for(let t=1;t<=e.length;t++){let r=t;for(let i=1;i<=a.length;i++){let n=e[t-1]===a[i-1]?0:1,s=r;r=Math.min(o[i]+1,r+1,o[i-1]+n),o[i-1]=s}o[a.length]=r}return o[a.length]}function fs(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}}function bs(e,a=2,o=3){var i;let t=e.length,r=[];for(let[n,s]of ge.entries){if(Math.abs(n.length-t)>a)continue;let d=gs(e,n);d<=a&&r.push({word:(i=s.word)!=null?i:n,key:n,dist:d})}return r.sort((n,s)=>n.dist-s.dist||n.key.length-s.key.length).slice(0,o)}function vs(e){if(!ge.coreLoaded)return[];let a=[],o=/[a-záàãâéêíóôõúüçñ'-]+/gi,t;for(;(t=o.exec(e))!==null;){let r=t[0];if(r.length<=3||/^\d/.test(r)||/^[A-ZÁÀÃÂÉÊÍÓÔÕÚ]/.test(r))continue;let i=fs(r);if(ge.entries.has(i))continue;let n=ge.guess(i);if(n&&!n.fallback)continue;let s=bs(i,2,3);if(s.length===0||s[0].dist===0)continue;let d=s[0].word;a.push({inicio:t.index,fim:t.index+r.length,texto:r,certo:d,sugs:s.map(c=>c.word),regra:"Poss\xEDveis corre\xE7\xF5es por dist\xE2ncia de edi\xE7\xE3o (Levenshtein).",categoria:"typo",agente:7,prioA:7,prioC:1})}return a}function hs(e){let a=(L==null?void 0:L.perfil)||"literario",{alertas:o,resumo:t}=Fa(e,a);return{alertas:o,resumo:t}}var Ut={grafia:"Grafia",acento:"Acentua\xE7\xE3o",hifen:"H\xEDfen",regencia:"Reg\xEAncia",concordancia:"Concord\xE2ncia",flexao_verbal:"Flex\xE3o Verbal",flexao_nominal:"Flex\xE3o Nominal",grau:"Grau",genero:"G\xEAnero",norma:"Norma Culta",pleonasmo:"Pleonasmo",classe_palavras:"Classe",semantica_morfologica:"Sem\xE2ntica",paronimia:"Paron\xEDmia",redundancia:"Redund\xE2ncia",ambiguidade:"Ambiguidade",inadequado:"Uso Inadequado",virgula_obrigatoria:"V\xEDrgula Obrig.",virgula_proibida:"V\xEDrgula Proib.",dois_pontos:"Dois-Pontos",reticencias:"Retic\xEAncias",aposto:"Aposto",concordancia_verbal:"Concord\xE2ncia V.",colocacao_pronominal:"Coloca\xE7\xE3o Pron.",registro:"Registro",regencia_verbal:"Reg\xEAncia V.",regencia_nominal:"Reg\xEAncia N.",crase_obrigatoria:"Crase Obrig.",crase_proibida:"Crase Proib.",crase_horas:"Crase Horas",crase_demonstrativo:"Crase Demon.",crase_paises:"Crase Pa\xEDses",typo:"Typo",densidade_mente:"Adv\xE9rbios -mente",densidade_passiva:"Voz Passiva",comprimento_frase:"Senten\xE7as Longas"};function ys(e,a){var i,n;let o=[];for(let s of a){let d=je[s];if(d)for(let c of d.regras){if(!c.c||!c.r)continue;let l=c.e.flags.includes("g")?c.e.flags:c.e.flags+"g",u=new RegExp(c.e.source,l),p;for(;(p=u.exec(e))!==null;)o.push({inicio:p.index,fim:p.index+p[0].length,texto:p[0],certo:c.c,regra:c.r,categoria:c.cat,agente:s,prioA:(i=ms[s])!=null?i:99,prioC:(n=ps[c.cat])!=null?n:50})}}o.sort((s,d)=>s.inicio!==d.inicio?s.inicio-d.inicio:s.prioA!==d.prioA?s.prioA-d.prioA:s.prioC-d.prioC);let t=[],r=-1;for(let s of o)s.inicio>=r&&(t.push(s),r=s.fim);return t}function Ae(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}function Kt(e,a){var r;let o="",t=0;for(let i of a){i.inicio>t&&(o+=Ae(e.slice(t,i.inicio)));let n=wo[i.categoria]||((r=je[i.agente])==null?void 0:r.cor)||"#fff";o+=`<span class="coord-err" style="border-bottom-color:${n}" data-idx="${i.inicio}">`+Ae(e.slice(i.inicio,i.fim))+"</span>",t=i.fim}return o+=Ae(e.slice(t)),o+=`
`,o}function xs(){let e=document.createElement("div");return e.id="coordOverlay",e.className="coord-overlay",e.setAttribute("aria-modal","true"),e.setAttribute("role","dialog"),e.setAttribute("aria-label","Inspe\xE7\xE3o Lingu\xEDstica"),e.innerHTML=`
    <div class="coord-shell">

      <!-- \u2500\u2500 TOPO: cabe\xE7alho + agentes \u2500\u2500 -->
      <div class="coord-top">
        <div class="coord-header">
          <div class="coord-title-text">
            <span class="coord-subtitle">Inspe\xE7\xE3o Lingu\xEDstica</span>
            <span class="coord-subtitle-tag">8 agentes</span>
          </div>
          <div class="coord-header-actions">
            <span class="coord-corrected" id="coordCorrected"></span>
            <button class="coord-apply-all" id="coordApplyAll" type="button">corrigir tudo</button>
            <button class="coord-close" id="coordClose" type="button" aria-label="Fechar">\u2715</button>
          </div>
        </div>
        <div class="coord-agents" id="coordAgents"></div>
        <div class="coord-defs" id="coordDefs"></div>
        <div class="coord-stat-bar" id="coordStatBar"></div>
      </div>

      <!-- \u2500\u2500 MEIO: editor \u2500\u2500 -->
      <div class="coord-editor-wrap">
        <div class="coord-highlight" id="coordHighlight" aria-hidden="true"></div>
        <textarea class="coord-textarea" id="coordTextarea"
          spellcheck="false"
          placeholder="Texto da p\xE1gina aparece aqui. Os 8 agentes inspecionam em paralelo\u2026"></textarea>
      </div>

      <!-- \u2500\u2500 BASE: filtros + fila \u2500\u2500 -->
      <div class="coord-bot">
        <div class="coord-filters" id="coordFilters"></div>
        <div class="coord-queue" id="coordQueue"></div>
        <div class="coord-style-panel" id="coordStylePanel" style="display:none"></div>
        <div class="coord-tech-panel" id="coordTechPanel"></div>
      </div>

    </div>

    <!-- Floater de detalhes ao hover -->
    <div class="coord-floater" id="coordFloater" aria-hidden="true"></div>
  `,document.body.appendChild(e),e}var L=null,Ze=null;function Ss(e){return{texto:e,erros:[],ativos:new Set([1,2,3,4,5,6,7,8]),clickOrder:[1,2,3,4,5,6,7,8],filtro:null,totalCorrigidos:0,debounceTimer:0,sourceRange:null,styleAlerts:[],styleResumo:null,perfil:"literario"}}function Es(){let e=document.getElementById("coordDefs");if(!e)return;let a=L.clickOrder.filter(o=>L.ativos.has(o));if(a.length===0){e.innerHTML="";return}e.innerHTML=a.map(o=>`<div class="coord-def-line" style="--def-cor:${je[o].cor}">${Vt[o]}</div>`).join("")}function Gt(){let{texto:e,erros:a,ativos:o,filtro:t,totalCorrigidos:r}=L,i=document.getElementById("coordHighlight");i&&(i.innerHTML=Kt(e,a));let n=document.getElementById("coordCorrected");n&&(n.textContent=r>0?`\u2713 ${r} corrigidos`:"");let s=document.getElementById("coordApplyAll");if(s){let g=t!==null?a.filter(m=>m.agente===t).length:a.length;s.style.display=g>0?"":"none",s.textContent=`corrigir tudo (${g})`}let d=document.getElementById("coordAgents");if(d){d.innerHTML="";for(let[g,m]of Object.entries(je)){let v=Number(g),y=a.filter(w=>w.agente===v).length,E=o.has(v),f=document.createElement("button");f.type="button",f.className="coord-agent-chip"+(E?" is-active":""),f.dataset.agentId=g,f.style.setProperty("--agt-cor",m.cor),f.title=`${m.nome} \u2014 ${Vt[v]||""}`,f.innerHTML=`
        <span class="coord-chip-sigla">${m.sigla}</span>
        <span class="coord-chip-count">${E?y>0?y:"\xB7":"off"}</span>
      `,d.appendChild(f)}}Es();let c=document.getElementById("coordStatBar");if(c){let g=Object.entries(je).map(([m,v])=>$e(xe({id:Number(m)},v),{count:a.filter(y=>y.agente===Number(m)).length})).filter(m=>m.count>0&&o.has(m.id));g.length>0?(c.innerHTML=`
        <span class="coord-stat-label">DISTRIBUI\xC7\xC3O:</span>
        ${g.map(m=>`<span class="coord-stat-chip" style="color:${m.cor};border-color:${m.cor}40;background:${m.cor}12">${m.sigla} ${m.count}</span>`).join("")}
        <span class="coord-stat-total">total: ${a.length}</span>
      `,c.style.display=""):c.style.display="none"}let l=document.getElementById("coordFilters");if(l)if(a.length>0){let g=Object.entries(je).map(([m,v])=>$e(xe({id:Number(m)},v),{count:a.filter(y=>y.agente===Number(m)).length})).filter(m=>m.count>0&&o.has(m.id));l.style.display="",l.innerHTML=`
        <span class="coord-filter-label">FILTRAR:</span>
        <button type="button" class="coord-filter-btn ${t===null?"is-active":""}" data-filtro="all">
          todos (${a.length})
        </button>
        ${g.map(m=>`
          <button type="button" class="coord-filter-btn ${t===m.id?"is-active":""}"
            data-filtro="${m.id}" style="--agt-cor:${m.cor}">
            ${m.sigla} (${m.count})
          </button>`).join("")}
      `}else l.style.display="none";let u=document.getElementById("coordQueue");if(u){let g=t!==null?a.filter(m=>m.agente===t):a;g.length===0?u.innerHTML=a.length===0?'<p class="coord-empty">Nenhuma ocorr\xEAncia encontrada.</p>':'<p class="coord-empty">Sem ocorr\xEAncias para o agente selecionado.</p>':u.innerHTML=g.map((m,v)=>{var O,R;let y=wo[m.categoria]||((O=je[m.agente])==null?void 0:O.cor)||"#4dabf7",E=Ut[m.categoria]||m.categoria,f=je[m.agente],w=((R=m.sugs)==null?void 0:R.length)>0?m.sugs.map(D=>`<button type="button" class="coord-queue-fix" data-erro-inicio="${m.inicio}" data-certo="${Ae(D)}" style="border-color:${y}40">${Ae(D)}</button>`).join(""):`<button type="button" class="coord-queue-fix" data-erro-inicio="${m.inicio}" style="border-color:${y}40">${Ae(m.certo)}</button>`;return`
          <div class="coord-queue-item" data-queue-idx="${v}" style="border-left-color:${y}">
            <span class="coord-queue-sigla" style="color:${f==null?void 0:f.cor};background:${f==null?void 0:f.cor}14;border-color:${f==null?void 0:f.cor}30">${f==null?void 0:f.sigla}</span>
            <div class="coord-queue-body">
              <div class="coord-queue-pair">
                <span class="coord-queue-wrong">${Ae(m.texto)}</span>
                <span class="coord-queue-arrow">\u2192</span>
                ${w}
                <span class="coord-queue-cat" style="color:${y};background:${y}14;border-color:${y}30">${E}</span>
              </div>
              <div class="coord-queue-rule">${Ae(m.regra)}</div>
            </div>
            <button type="button" class="coord-queue-apply" data-erro-inicio="${m.inicio}">corrigir</button>
          </div>
        `}).join("")}let p=document.getElementById("coordStylePanel");if(p)if(o.has(8)&&L.styleResumo){let g=L.styleResumo,m=L.styleAlerts.slice(0,5),v=L.styleAlerts.length-m.length,y=m.length?m.map(E=>`<div class="coord-style-alert coord-style-alert--${E.nivel==="VICIO"?"vicio":E.nivel==="ESTILO"?"estilo":"info"}">
              <span class="coord-style-nivel">${E.nivel}</span>
              <span class="coord-style-msg">${Ae(E.mensagem)}</span>
              ${E.paragrafo?`<span class="coord-style-par">\xA7${E.paragrafo}</span>`:""}
            </div>`).join("")+(v>0?`<div class="coord-style-more">+${v} alertas adicionais</div>`:""):'<p class="coord-style-ok">Densidade dentro do esperado.</p>';p.innerHTML=`
        <div class="coord-style-header">
          <span class="coord-style-sigla" style="color:#9c27b0;background:#9c27b014;border-color:#9c27b030">ES</span>
          <span class="coord-style-title">Estilo</span>
          <span class="coord-style-metrics">${g.densidadeMente}% -mente \xB7 ${g.totalPassiva} passiva${g.totalPassiva!==1?"s":""} \xB7 ${g.mediaWordsPorSentenca} p/frase</span>
        </div>
        ${y}
      `,p.style.display=""}else p.innerHTML="",p.style.display="none";let b=document.getElementById("coordTechPanel");if(b){let g=[Rt,zt,Dt,Ft,Bt,Ht].flat().filter(y=>y.c).length,m=ge.entries.size,v=[...o].sort().join(", ");b.innerHTML=`
      <span>agentes_ativos: [${v}]</span>
      <span>regras_totais: ${g} \xB7 l\xE9xico: ${m} entradas</span>
      <span>deduplica\xE7\xE3o: sobreposi\xE7\xE3o + prioridade agente \xD7 categoria</span>
      <span>debounce: 600ms \xB7 corrigir_tudo: offset acumulado</span>
      <span>fila_ativa: ${a.length} ocorr\xEAncia${a.length!==1?"s":""}</span>
      <span>agentes: OR \xB7 MO \xB7 SI \xB7 SE \xB7 PO \xB7 CR \xB7 LE \xB7 ES \u2014 todos integrados</span>
    `}}function Ot(e,a){let o=L.erros.find(r=>r.inicio===e);if(!o)return;let t=a!=null?a:o.certo;L.texto=L.texto.slice(0,o.inicio)+t+L.texto.slice(o.fim),L.totalCorrigidos++,la(),Ao()}function qs(){let e=(L.filtro!==null?L.erros.filter(t=>t.agente===L.filtro):[...L.erros]).sort((t,r)=>t.inicio-r.inicio),a=L.texto,o=0;for(let t of e)a=a.slice(0,t.inicio+o)+t.certo+a.slice(t.fim+o),o+=t.certo.length-(t.fim-t.inicio);L.texto=a,L.totalCorrigidos+=e.length,la(),Ao()}function Ao(){let e=document.getElementById("coordTextarea");e&&e.value!==L.texto&&(e.value=L.texto)}function la(){let e=ys(L.texto,L.ativos),a=L.ativos.has(7)?vs(L.texto):[];if(L.erros=[...e,...a].sort((o,t)=>o.inicio-t.inicio),L.ativos.has(8)){let{alertas:o,resumo:t}=hs(L.texto);L.styleAlerts=o,L.styleResumo=t}else L.styleAlerts=[],L.styleResumo=null;Gt()}function ws(e,a,o){let t=e.querySelector("#coordTextarea"),r=e.querySelector("#coordHighlight"),i=e.querySelector("#coordFloater");t.addEventListener("input",()=>{L.texto=t.value,clearTimeout(L.debounceTimer),L.debounceTimer=setTimeout(la,600),r&&(r.innerHTML=Kt(L.texto,L.erros))}),t.addEventListener("scroll",()=>{r&&(r.scrollTop=t.scrollTop,r.scrollLeft=t.scrollLeft)}),r.addEventListener("mouseover",n=>{var v,y,E;let s=n.target.closest(".coord-err");if(!s||!i)return;let d=Number(s.dataset.idx),c=L.erros.find(f=>f.inicio===d);if(!c)return;let l=wo[c.categoria]||((v=je[c.agente])==null?void 0:v.cor)||"#4dabf7",u=je[c.agente];i.innerHTML=`
      <div class="coord-floater-header">
        <span class="coord-floater-agt" style="color:${u==null?void 0:u.cor};background:${u==null?void 0:u.cor}18;border-color:${u==null?void 0:u.cor}33">
          AGT ${c.agente} \xB7 ${(y=u==null?void 0:u.nome)==null?void 0:y.toUpperCase()}
        </span>
        <span class="coord-floater-cat" style="color:${l};background:${l}14;border-color:${l}30">
          ${Ut[c.categoria]||c.categoria}
        </span>
      </div>
      <p class="coord-floater-rule">${Ae(c.regra)}</p>
      <div class="coord-floater-pair">
        <span class="coord-floater-wrong">${Ae(c.texto)}</span>
        <span class="coord-floater-arrow">\u2192</span>
        ${((E=c.sugs)==null?void 0:E.length)>0?c.sugs.map(f=>`<button type="button" class="coord-floater-fix" data-erro-inicio="${c.inicio}" data-certo="${Ae(f)}" style="border-color:${l}40">${Ae(f)}</button>`).join(""):`<button type="button" class="coord-floater-fix" data-erro-inicio="${c.inicio}" style="border-color:${l}40">${Ae(c.certo)}</button>`}
      </div>
      <span class="coord-floater-hint">clique na corre\xE7\xE3o para aplicar</span>
    `;let p=s.getBoundingClientRect(),b=window.innerWidth,g=p.left;g+320>b&&(g=b-328);let m=p.bottom+6;i.style.left=g+"px",i.style.top=m+"px",i.classList.add("is-visible"),i.setAttribute("aria-hidden","false")}),r.addEventListener("mouseleave",()=>{i==null||i.classList.remove("is-visible"),i==null||i.setAttribute("aria-hidden","true")}),i.addEventListener("click",n=>{let s=n.target.closest(".coord-floater-fix");s&&(Ot(Number(s.dataset.erroInicio),s.dataset.certo||void 0),i.classList.remove("is-visible"))}),e.addEventListener("click",n=>{let s=n.target.closest(".coord-agent-chip");if(s){let l=Number(s.dataset.agentId);L.ativos.has(l)?(L.ativos.delete(l),L.clickOrder=L.clickOrder.filter(u=>u!==l)):(L.ativos.add(l),L.clickOrder=[...L.clickOrder.filter(u=>u!==l),l]),la();return}let d=n.target.closest(".coord-filter-btn");if(d){let l=d.dataset.filtro;L.filtro=l==="all"?null:Number(l),Gt();return}let c=n.target.closest(".coord-queue-fix, .coord-queue-apply");if(c){Ot(Number(c.dataset.erroInicio),c.dataset.certo||void 0);return}if(n.target.closest("#coordApplyAll")){qs();return}if(n.target.closest("#coordClose")){Wt(a,o);return}})}function Ba(e,a,o){var n,s,d,c,l;let t=((s=(n=e.state)==null?void 0:n.pages)==null?void 0:s.find(u=>u===document.activeElement))||((c=(d=e.state)==null?void 0:d.pages)==null?void 0:c[0])||document.querySelector(".pageContent");if(!t)return;let r;if(a!==void 0)r=a;else{let u=t.cloneNode(!0);u.querySelectorAll(".slice").forEach(p=>p.remove()),r=u.innerText||""}let i=document.getElementById("coordOverlay");i||(i=xs(),ws(i,e,t)),i.dataset.sourceId=t.id||"",i._sourceEl=t,L=Ss(r),o&&(L.sourceRange=o),la(),Ao(),ge.coreLoaded||ge.loadCore().then(()=>{L&&la()}).catch(()=>{}),Ze&&Ze.abort(),Ze=new AbortController,document.addEventListener("keydown",u=>{u.key==="Escape"&&(u.preventDefault(),Wt(e,i._sourceEl))},{capture:!0,signal:Ze.signal}),i.classList.add("is-open"),document.body.style.overflow="hidden",(l=e.setStatus)==null||l.call(e,"coordenador central: aberto"),setTimeout(()=>{let u=i.querySelector("#coordTextarea");u==null||u.focus()},480)}function Wt(e,a){var r;let o=document.getElementById("coordOverlay");if(!o)return;let t=o._sourceEl||a;if(L!=null&&L.sourceRange)try{t==null||t.focus();let i=window.getSelection();i.removeAllRanges(),i.addRange(L.sourceRange),document.execCommand("insertText",!1,L.texto),t==null||t.dispatchEvent(new Event("input",{bubbles:!0}))}catch(i){}else if(t&&L){t.focus();let i=document.createRange();i.selectNodeContents(t);let n=window.getSelection();n.removeAllRanges(),n.addRange(i),document.execCommand("insertText",!1,L.texto),t.dispatchEvent(new Event("input",{bubbles:!0}))}o.classList.remove("is-open"),document.body.style.overflow="",(r=e.setStatus)==null||r.call(e,"coordenador central: fechado"),Ze&&(Ze.abort(),Ze=null),setTimeout(()=>{let i=o._sourceEl||a;i==null||i.focus()},50)}var qc=Math.round(297*(96/25.4));function ea(e){let a=String(e.textContent||"").replace(/\u200B/g,"").trim();e.classList.toggle("is-empty",!a&&!e.querySelector(".slice"))}function da(e,a,o=!1){let t=document.getElementById("pages"),r=e.state.pages.length+1,i=document.createElement("div");i.className="page",i.dataset.page=String(r);let n=document.createElement("div");n.className="pageContent",n.id=`page${r}`,n.contentEditable="true",n.setAttribute("spellcheck","false"),n.setAttribute("aria-label",`Editor p\xE1gina ${r}`),r===1&&n.setAttribute("data-placeholder","Comece a escrever. Atalhos: ..h para ajuda, ..a para arquivo, ..n para notas.");let s=document.createElement("div");if(s.className="pageNumber",s.textContent=String(r),i.appendChild(n),i.appendChild(s),a){a.closest(".page").after(i);let d=e.state.pages.indexOf(a)+1;e.state.pages.splice(d,0,n)}else t.appendChild(i),e.state.pages.push(n);return Yt(e),ar(e,n),o&&setTimeout(()=>n.focus(),0),n}function ua(e,a){if(e.state.pages.length<=1)return;let t=e.state.pages[a].closest(".page");e.state.pages.splice(a,1),t.remove(),Yt(e)}function Yt(e){e.state.pages.forEach((a,o)=>{let t=a.closest(".page");t&&(t.dataset.page=String(o+1));let r=t==null?void 0:t.querySelector(".pageNumber");r&&(r.textContent=String(o+1))})}function Ie(e,a){if(a.scrollHeight<=a.clientHeight)return;let o=e.state.pages.indexOf(a),t=e.state.pages[o+1];t||(t=da(e,a,!1)),Co(a,t),ea(a),ea(t),Ie(e,t)}function Va(e,a){let o=e.state.pages.indexOf(a),t=e.state.pages[o+1];if(t){for(;t.firstChild;){let r=t.firstChild;if(a.appendChild(r),a.scrollHeight>a.clientHeight){t.insertBefore(r,t.firstChild);break}}ea(a),ea(t),!t.firstChild||t.innerHTML.trim()===""?(ua(e,o+1),Va(e,a)):Va(e,t)}}function Qt(e){for(let a=e.state.pages.length-1;a>=1;a--){let o=e.state.pages[a];if(o.firstChild)break;let t=document.activeElement===o,r=e.state.pages[a-1];ua(e,a),t&&(aa(r),r.focus())}}function Co(e,a){var t;let o=e.lastChild;if(o){if(o.nodeType===Node.ELEMENT_NODE&&((t=o.classList)!=null&&t.contains("slice"))){e.removeChild(o),a.insertBefore(o,a.firstChild),e.scrollHeight>e.clientHeight&&Co(e,a);return}if(o.nodeType===Node.TEXT_NODE&&o.textContent.length>0){let r=As(e,o);if(r>0&&r<o.textContent.length){let i=o.splitText(r);a.insertBefore(i,a.firstChild);return}}e.removeChild(o),a.insertBefore(o,a.firstChild),e.scrollHeight>e.clientHeight&&Co(e,a)}}function As(e,a){let o=a.textContent,t=e.clientHeight,r=0,i=o.length;for(;r<i-1;){let n=Math.floor((r+i)/2);a.textContent=o.slice(0,n),e.scrollHeight<=t?r=n:i=n}return a.textContent=o,r}function Xt(e){var r,i;if(!((i=(r=e.state)==null?void 0:r.pages)!=null&&i.length))return null;let a=window.getSelection();if(!(a!=null&&a.rangeCount))return null;let o=a.getRangeAt(0);if(!o.collapsed)return null;let t=0;for(let n=0;n<e.state.pages.length;n++){let s=e.state.pages[n];if(s.contains(o.startContainer)){let d=document.createTreeWalker(s,NodeFilter.SHOW_TEXT),c;for(;c=d.nextNode();){if(c===o.startContainer)return t+=o.startOffset,{totalOffset:t};t+=c.textContent.length}try{let l=document.createRange();return l.selectNodeContents(s),l.setEnd(o.startContainer,o.startOffset),t+=l.toString().length,{totalOffset:t}}catch(l){return null}}t+=s.textContent.length}return null}function To(e,a){var r,i;if(!a||!((i=(r=e.state)==null?void 0:r.pages)!=null&&i.length))return;let o=a.totalOffset;for(let n of e.state.pages){let s=document.createTreeWalker(n,NodeFilter.SHOW_TEXT),d;for(;d=s.nextNode();){let c=d.textContent.length;if(o<=c){try{let l=document.createRange();l.setStart(d,o),l.collapse(!0);let u=window.getSelection();u==null||u.removeAllRanges(),u==null||u.addRange(l),document.activeElement!==n&&n.focus()}catch(l){aa(n),n.focus()}return}o-=c}}let t=e.state.pages[e.state.pages.length-1];t&&(aa(t),t.focus())}function Ua(e,a){if(!a)return!1;let o=document.createRange();return o.selectNodeContents(e),o.collapse(!0),a.compareBoundaryPoints(Range.START_TO_START,o)<=0}function _o(e,a){if(!a)return!1;let o=document.createRange();return o.selectNodeContents(e),o.collapse(!1),a.compareBoundaryPoints(Range.END_TO_END,o)>=0}function aa(e){let a=document.createRange();a.selectNodeContents(e),a.collapse(!1);let o=window.getSelection();o.removeAllRanges(),o.addRange(a)}function ko(e){let a=document.createRange();a.selectNodeContents(e),a.collapse(!0);let o=window.getSelection();o.removeAllRanges(),o.addRange(a)}var Zt="eskrev:onep:pages:v2",Jt="eskrev:onep:pages:v1",Cs="eskrev:index2:page1:html";function oa(e){try{let a=e.state.pages.map(o=>{let t=o.cloneNode(!0);return t.querySelectorAll(".slice").forEach(r=>r.remove()),t.querySelectorAll("span[data-anchor]").forEach(r=>{r.textContent.trim()||r.remove()}),t.innerHTML});_e(Zt,a)}catch(a){}}function er(e){try{let a=we(Zt);if(a){if(!(a!=null&&a.length))return;e.state.pages[0].innerHTML=a[0]||"";for(let r=1;r<a.length;r++){let i=e.state.pages[r-1],n=da(e,i,!1);n.innerHTML=a[r]||""}e.state.pages.forEach(r=>{r.querySelectorAll(".slice").forEach(i=>i.remove()),Ha(e,r),ea(r)}),requestAnimationFrame(()=>{e.state.pages.forEach(r=>Ie(e,r))});return}let o=we(Jt);if(o){if(Array.isArray(o)&&o.length){let r=o.join("");e.state.pages[0].innerHTML=r,e.state.pages[0].querySelectorAll(".slice").forEach(i=>i.remove()),Ha(e,e.state.pages[0]),ea(e.state.pages[0]),requestAnimationFrame(()=>{Ie(e,e.state.pages[0]),oa(e)}),La(Jt)}return}let t=we(Cs);t&&(e.state.pages[0].innerHTML=typeof t=="string"?t:"",e.state.pages[0].querySelectorAll(".slice").forEach(r=>r.remove()),Ha(e,e.state.pages[0]),ea(e.state.pages[0]),requestAnimationFrame(()=>Ie(e,e.state.pages[0])))}catch(a){}}var Ts="authoria-keys";var va="keys",Ga="author-signing-key";function Wa(){return new Promise((e,a)=>{let o=indexedDB.open(Ts,1);o.onupgradeneeded=t=>{t.target.result.createObjectStore(va,{keyPath:"id"})},o.onsuccess=t=>e(t.target.result),o.onerror=()=>a(o.error)})}function Po(e,a){return S(this,null,function*(){return new Promise((o,t)=>{let i=e.transaction(va,"readonly").objectStore(va).get(a);i.onsuccess=()=>o(i.result),i.onerror=()=>t(i.error)})})}function _s(e,a){return S(this,null,function*(){return new Promise((o,t)=>{let i=e.transaction(va,"readwrite").objectStore(va).put(a);i.onsuccess=()=>o(),i.onerror=()=>t(i.error)})})}function Ka(e){return btoa(String.fromCharCode(...new Uint8Array(e)))}function Lo(e){let a=atob(e),o=new Uint8Array(a.length);for(let t=0;t<a.length;t++)o[t]=a.charCodeAt(t);return o.buffer}function or(e,a){return S(this,null,function*(){let o=new TextEncoder,t=yield crypto.subtle.importKey("raw",o.encode(e),"PBKDF2",!1,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:a,iterations:2e5,hash:"SHA-256"},t,{name:"AES-GCM",length:256},!1,["wrapKey","unwrapKey"])})}function tr(e){return S(this,null,function*(){if(!e||e.length<8)throw new Error("A senha deve ter pelo menos 8 caracteres.");let a=yield crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},!0,["sign","verify"]),o=crypto.getRandomValues(new Uint8Array(16)),t=crypto.getRandomValues(new Uint8Array(12)),r=yield or(e,o),i=yield crypto.subtle.wrapKey("jwk",a.privateKey,r,{name:"AES-GCM",iv:t}),n=yield crypto.subtle.exportKey("jwk",a.publicKey),s=yield Wa();return yield _s(s,{id:Ga,salt:Ka(o),iv:Ka(t),encryptedPrivateKey:Ka(i),publicKeyJwk:n,createdAt:new Date().toISOString()}),s.close(),n})}function rr(){return S(this,null,function*(){try{let e=yield Wa(),a=yield Po(e,Ga);return e.close(),!!a}catch(e){return!1}})}function ks(){return S(this,null,function*(){try{let e=yield Wa(),a=yield Po(e,Ga);return e.close(),a?a.publicKeyJwk:null}catch(e){return null}})}function ir(e,a){return S(this,null,function*(){let o=yield Wa(),t=yield Po(o,Ga);if(o.close(),!t)throw new Error("Nenhuma chave de autor encontrada. Gere uma chave primeiro.");let r=Lo(t.salt),i=Lo(t.iv),n=Lo(t.encryptedPrivateKey),s;try{s=yield or(a,r)}catch(u){throw new Error("Erro ao processar senha.")}let d;try{d=yield crypto.subtle.unwrapKey("jwk",n,s,{name:"AES-GCM",iv:i},{name:"ECDSA",namedCurve:"P-256"},!1,["sign"])}catch(u){throw new Error("Senha incorreta ou chave corrompida.")}let c=new TextEncoder().encode(e),l=yield crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},d,c);return{signature:Ka(l),publicKeyJwk:t.publicKeyJwk,signed_at:new Date().toISOString()}})}function sr(){return S(this,null,function*(){let e=yield ks();return e?{type:"authoria-public-key",version:"1.0",algorithm:"ECDSA-P256",key:e,note:"Chave p\xFAblica do autor. Use no Authoria para verificar assinaturas de arquivos .skv."}:null})}var nr="skrv_mobile_notes_v1",Io="skrv_postits_v1",cr="eskrev:onep:pages:v2";function ta(e){let a=e.cloneNode(!0);return a.querySelectorAll(".slice").forEach(o=>o.remove()),a.innerText||""}function Ls(e){return S(this,null,function*(){let a=new TextEncoder().encode(e||""),o=yield crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(o)).map(t=>t.toString(16).padStart(2,"0")).join("")})}var lr=[{key:"capa",title:"Capa",body:`A capa apresenta o livro ao leitor.

Aqui entram o t\xEDtulo, o subt\xEDtulo (se houver)
e o nome do autor.

A capa n\xE3o explica o conte\xFAdo.
Ela anuncia que o livro existe.`},{key:"folha-rosto",title:"Folha de rosto",body:`A folha de rosto identifica formalmente a obra.

Costuma repetir o t\xEDtulo e o nome do autor
e pode incluir editora, local e ano.

\xC9 a primeira p\xE1gina oficial do livro.`},{key:"ficha-catalografica",title:"Ficha catalogr\xE1fica",body:`A ficha catalogr\xE1fica organiza os dados t\xE9cnicos do livro.

Ela \xE9 usada por bibliotecas, editoras e universidades.

Normalmente \xE9 preparada depois do texto pronto.`},{key:"dedicatoria",title:"Dedicat\xF3ria",body:`A dedicat\xF3ria \xE9 um espa\xE7o pessoal.

Pode ser breve, direta ou simb\xF3lica.

N\xE3o precisa explicar nada al\xE9m do gesto.`},{key:"epigrafe",title:"Ep\xEDgrafe",body:`A ep\xEDgrafe \xE9 uma cita\xE7\xE3o que dialoga com o livro.

Ela n\xE3o resume nem antecipa.

Funciona como um tom inicial.`},{key:"sumario",title:"Sum\xE1rio",body:`O sum\xE1rio organiza a leitura.

Ele mostra a estrutura do livro
e a ordem dos cap\xEDtulos.

Geralmente \xE9 ajustado ap\xF3s o texto final.`},{key:"introducao",title:"Introdu\xE7\xE3o",body:`A introdu\xE7\xE3o prepara o leitor.

Aqui voc\xEA apresenta o tema, o recorte
e o caminho que o livro percorre.

N\xE3o \xE9 o desenvolvimento do argumento.
\xC9 a entrada.`},{key:"capitulo-1",title:"Cap\xEDtulo 1 (modelo)",body:`Um cap\xEDtulo desenvolve uma ideia completa,
uma etapa do argumento ou uma parte da narrativa.

Ele se sustenta sozinho,
mas faz sentido dentro do conjunto.

(Cap\xEDtulos seguintes reutilizam este texto)`},{key:"conclusao",title:"Conclus\xE3o",body:`A conclus\xE3o retoma o percurso do livro.

Aqui voc\xEA pode fechar argumentos,
apontar consequ\xEAncias
ou abrir novas quest\xF5es.

Concluir n\xE3o \xE9 repetir.
\xC9 dar forma ao que ficou.`},{key:"agradecimentos",title:"Agradecimentos",body:`Espa\xE7o para reconhecer pessoas e apoios
que participaram do processo do livro.

Costuma ser breve e direto.`},{key:"notas",title:"Notas",body:`As notas complementam o texto principal.

Servem para esclarecimentos,
refer\xEAncias pontuais
ou coment\xE1rios laterais.`},{key:"referencias",title:"Refer\xEAncias",body:`Lista das obras citadas ou consultadas.

Pode seguir normas acad\xEAmicas,
dependendo do tipo de livro.`},{key:"quarta-capa",title:"Quarta capa",body:`A quarta capa conversa com o leitor antes da leitura.

Pode conter um texto curto sobre o livro,
um trecho destacado
ou informa\xE7\xF5es sobre o autor.

\xC9 o \xFAltimo contato antes da abertura.`}],dr=[{key:"capa",title:"Capa",body:`A capa \xE9 o primeiro contato com a hist\xF3ria.

Ela n\xE3o conta o enredo.
Sugere um mundo, um clima, uma promessa.

\xC0s vezes, basta um t\xEDtulo que n\xE3o explica tudo.`},{key:"folha-rosto",title:"Folha de rosto",body:`Aqui a hist\xF3ria se apresenta formalmente.

T\xEDtulo, autor, e o livro assume sua forma.

\xC9 o ponto em que a fic\xE7\xE3o vira objeto.`},{key:"dedicatoria",title:"Dedicat\xF3ria (opcional)",body:`A dedicat\xF3ria \xE9 um gesto silencioso.

Pode ser \xEDntima, simb\xF3lica ou enigm\xE1tica.

N\xE3o precisa ser entendida por todos.`},{key:"epigrafe",title:"Ep\xEDgrafe (opcional)",body:`Uma frase antes da hist\xF3ria come\xE7ar.

N\xE3o resume.
N\xE3o antecipa.

Apenas inclina o leitor na dire\xE7\xE3o certa.`},{key:"sumario",title:"Sum\xE1rio",body:`O sum\xE1rio mostra o ritmo do livro.

Cap\xEDtulos curtos, longos,
t\xEDtulos nomeados ou numerados.

Ele j\xE1 conta algo sobre a narrativa.`},{key:"prologo",title:"Pr\xF3logo (opcional)",body:`O pr\xF3logo acontece antes da hist\xF3ria,
mas n\xE3o necessariamente antes do tempo.

Pode apresentar um evento,
um tom ou uma pergunta.

Nem todo livro precisa de um.`},{key:"capitulo-1",title:"Cap\xEDtulo 1 (modelo)",body:`Um cap\xEDtulo \xE9 uma unidade de movimento.

Pode conter uma cena,
um conflito,
uma mudan\xE7a.

Algo precisa sair diferente do que entrou.

(Cap\xEDtulos seguintes reutilizam este placeholder)`},{key:"climax",title:"Cl\xEDmax",body:`Aqui a hist\xF3ria atinge seu ponto m\xE1ximo.

O conflito central se resolve,
ou se transforma definitivamente.

N\xE3o \xE9 o fim.
\xC9 o ponto sem retorno.`},{key:"desfecho",title:"Desfecho",body:`O desfecho mostra o que ficou depois.

N\xE3o precisa explicar tudo.

\xC0s vezes, basta deixar o leitor
sozinho com as consequ\xEAncias.`},{key:"quarta-capa",title:"Quarta capa",body:`A quarta capa fala com quem ainda n\xE3o leu.

Pode sugerir o conflito,
apresentar o universo
ou destacar um trecho.

Ela n\xE3o revela.
Ela chama.`}],ur=[{key:"capa",title:"Capa",body:`Um t\xEDtulo j\xE1 \xE9 um poema.

\xC0s vezes, o livro come\xE7a aqui.`},{key:"folha-rosto",title:"Folha de rosto",body:`O livro assume seu nome.

Autor, t\xEDtulo.

Nada mais precisa acontecer ainda.`},{key:"dedicatoria",title:"Dedicat\xF3ria (opcional)",body:`Um gesto breve.

Pode ser uma linha.
Pode ser um nome.
Pode ficar em branco.`},{key:"epigrafe",title:"Ep\xEDgrafe (opcional)",body:`Uma frase que inclina o livro.

N\xE3o explica.

Apenas toca o tom.`},{key:"nota-inicial",title:"Nota inicial (opcional)",body:`Algumas palavras antes dos poemas.

N\xE3o para explicar.

Para abrir o espa\xE7o.`},{key:"poemas",title:"Poemas",body:`Cada poema \xE9 um corpo independente.

A ordem cria um ritmo.

O conjunto cria outra coisa.`},{key:"ultimo-poema",title:"\xDAltimo poema",body:`Nem sempre \xE9 o melhor.

\xC9 o que fica por \xFAltimo.

O livro se despede aqui.`},{key:"quarta-capa",title:"Quarta capa",body:`Poucas linhas.

Um trecho.
Um gesto.
Um sil\xEAncio.

O suficiente para chamar algu\xE9m.`}],mr=[{id:"nonfiction",title:"Livro",template:lr,openDefault:!0},{id:"fiction",title:"Livro (fic\xE7\xE3o)",template:dr,openDefault:!1},{id:"poetry",title:"Livro (poesia)",template:ur,openDefault:!1}],Ps=new Set([...lr,...dr,...ur].map(e=>e.body));function Ns(e){return e.bookPart&&Ps.has(e.content||"")}var No="skrv_data",ue={data:{projects:[],activeId:null,memo:"",mobileNotes:[]},_timer:null,init(){try{let e=we(No)||we("tot_data");if(e){let a=typeof e=="string"?JSON.parse(e):e;this.data=a,Array.isArray(this.data.projects)||(this.data.projects=[]),Array.isArray(this.data.mobileNotes)||(this.data.mobileNotes=[])}else this._createDefaultProject()}catch(e){this._createDefaultProject()}$o(this)},_createDefaultProject(){let e=Date.now().toString();this.data={projects:[{id:e,name:"Projeto",content:"",date:new Date().toLocaleString(),cursorPos:0}],activeId:e,memo:"",mobileNotes:[]},this.persist(!0)},persist(e=!1){if(e){clearTimeout(this._timer),this._timer=null,_e(No,this.data);return}clearTimeout(this._timer),this._timer=setTimeout(()=>{_e(No,this.data),this._timer=null},500)},getActive(){let e=this.data.projects||[],a=e.find(o=>o.id===this.data.activeId);return!a&&e.length&&(a=e[0],this.data.activeId=a.id,this.persist(!0)),a||null},setActive(e){this.data.activeId=e,this.persist(!0)},createProject(e,a=""){let o=Date.now().toString(),t={id:o,name:e,content:a,date:new Date().toLocaleString(),cursorPos:0};return Array.isArray(this.data.projects)||(this.data.projects=[]),this.data.projects.unshift(t),this.data.activeId=o,this.persist(!0),t},renameProject(e,a){let o=(this.data.projects||[]).find(t=>t.id===e);o&&(o.name=a,this.persist(!0))},deleteProject(e){this.data.projects=(this.data.projects||[]).filter(a=>a.id!==e),this.data.activeId===e&&(this.data.activeId=this.data.projects.length?this.data.projects[0].id:null),this.persist(!0)},saveContent(e){let a=this.getActive();a&&(a.content=e,a.date=new Date().toLocaleString(),this.persist())}};function $o(e){Array.isArray(e.data.projects)||(e.data.projects=[]);let a=new Map;e.data.projects.forEach(t=>{t&&t.bookPartKey&&t.bookPartGroup&&a.set(`${t.bookPartGroup}:${t.bookPartKey}`,t)});let o=!1;mr.forEach(t=>{t.template.forEach(r=>{let i=`${t.id}:${r.key}`;if(!a.has(i))e.data.projects.push({id:`${t.id}_${r.key}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,name:r.title,content:r.body,date:new Date().toLocaleString(),cursorPos:0,bookPart:!0,bookPartKey:r.key,bookPartGroup:t.id}),o=!0;else{let n=a.get(i);n.bookPart||(n.bookPart=!0,o=!0),n.bookPartGroup!==t.id&&(n.bookPartGroup=t.id,o=!0)}})}),o&&e.persist(!0)}function Is(e,a){return(e.data.projects||[]).filter(o=>o&&o.bookPart&&o.bookPartGroup===a)}function $s(e){let a=e.content||"",o=window.open("","_blank");o&&(o.document.write(`<!doctype html><html><head><title>${e.name}</title><style>
    body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;max-width:65ch;margin:2cm auto;color:#000}
    pre{white-space:pre-wrap}
  </style></head><body><pre>${a.replace(/</g,"&lt;")}</pre></body></html>`),o.document.close(),o.print())}function ra(e,a,o){if(!e)return;e.innerHTML="",$o(a);let r=(a.data.projects||[]).filter(n=>!(n!=null&&n.bookPart)),i=(n,{isBookPart:s=!1}={})=>{let d=document.createElement("div");d.className="mesa-item"+(n.id===a.data.activeId?" is-active":"")+(s?" is-book-part":"");let c=document.createElement("div");c.className="mesa-item-info";let l=document.createElement("div");l.className="mesa-item-name",l.textContent=n.name;let u=document.createElement("div");u.className="mesa-item-meta",u.textContent=(n.date||"").split(",")[0],c.appendChild(l),c.appendChild(u),c.onclick=g=>{g.stopPropagation(),o(n.id)};let p=document.createElement("div");if(p.className="mesa-item-actions",!s){let g=document.createElement("button");g.className="mesa-btn-icon",g.title="Renomear",g.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 21h8"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>',g.onclick=m=>{m.stopPropagation(),js(c,n.id,n.name,a,e,o)},p.appendChild(g)}let b=document.createElement("button");if(b.className="mesa-btn-icon",b.title="Imprimir",b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>',b.onclick=g=>{g.stopPropagation(),$s(n)},p.appendChild(b),!s){let g=document.createElement("button");g.className="mesa-btn-icon is-danger",g.title="Apagar",g.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',g.onclick=m=>{m.stopPropagation(),confirm(`Apagar "${n.name}"? Esta a\xE7\xE3o n\xE3o pode ser desfeita.`)&&(a.deleteProject(n.id),ra(e,a,o),(n.id===a.data.activeId||a.data.projects.length===0)&&o(a.data.activeId))},p.appendChild(g)}return d.appendChild(c),d.appendChild(p),d};mr.forEach(n=>{let s=Is(a,n.id);if(!s.length)return;let d=document.createElement("div");d.className="mesa-folder";let c=document.createElement("div");c.className="mesa-folder-header";let l=document.createElement("span");l.className="mesa-folder-caret";let u=document.createElement("div");u.className="mesa-folder-label";let p=a.data.skvTitle||"";u.innerHTML=`<strong>${n.title}</strong>${p?`<span class="mesa-folder-meta">${p}</span>`:""}`;let b=document.createElement("div");b.className="mesa-folder-actions";let g=document.createElement("button");g.className="mesa-btn-icon",g.title="Imprimir livro completo",g.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>',g.onclick=f=>{f.stopPropagation();let w=s.map(D=>`=== ${D.name} ===

${D.content||""}`).join(`


`),O=a.data.skvTitle||n.title,R=window.open("","_blank");R&&(R.document.write(`<!doctype html><html><head><title>${O}</title><style>
        body{font-family:Georgia,serif;font-size:12pt;line-height:1.6;max-width:65ch;margin:2cm auto;color:#000}
        pre{white-space:pre-wrap}
        @media print{pre{page-break-inside:auto}}
      </style></head><body><pre>${w.replace(/</g,"&lt;")}</pre></body></html>`),R.document.close(),R.print())},b.appendChild(g),c.appendChild(l),c.appendChild(u),c.appendChild(b);let m=document.createElement("div");m.className="mesa-folder-items";let v=`skrv_book_folder_open_${n.id}`,y=localStorage.getItem(v),E=y===null?!!n.openDefault:y!=="0";E||m.classList.add("is-collapsed"),l.textContent=E?"\u25BE":"\u25B8",c.onclick=()=>{let f=!m.classList.contains("is-collapsed");m.classList.toggle("is-collapsed",f),l.textContent=f?"\u25B8":"\u25BE";try{localStorage.setItem(v,f?"0":"1")}catch(w){}},s.forEach(f=>m.appendChild(i(f,{isBookPart:!0}))),d.appendChild(c),d.appendChild(m),e.appendChild(d)}),r.forEach(n=>{n&&e.appendChild(i(n))})}function js(e,a,o,t,r,i){e.onclick=null,e.innerHTML=`<input class="mesa-rename-input" value="${o.replace(/"/g,"&quot;")}">`;let n=e.querySelector("input");if(n){n.focus();let s=()=>{let d=n.value.trim();d&&t.renameProject(a,d),ra(r,t,i)};n.addEventListener("blur",s),n.addEventListener("keydown",d=>{d.key==="Enter"&&n.blur()})}}function ha(e=null){return S(this,null,function*(){let a=document.querySelectorAll(".pageContent"),o=Array.from(a).map(w=>ta(w)).join("");ue.saveContent(o),ue.persist(!0);let t=ue.data,r=ue.getActive(),i=[];try{let w=we(cr);w&&(i=Array.isArray(w)?w:JSON.parse(w))}catch(w){}let n=[];try{let w=we(nr);w&&(n=Array.isArray(w)?w:JSON.parse(w))}catch(w){}let s=[];try{let w=we(Io);w&&(s=Array.isArray(w)?w:JSON.parse(w))}catch(w){}let d=yield Ls(o),c={content_hash:d,created_at:new Date().toISOString(),chars:o.length,words:o.trim()?o.trim().split(/\s+/).length:0},l=null;if(e)try{let{signature:w,publicKeyJwk:O,signed_at:R}=yield ir(d,e);l={signature:w,public_key_jwk:O,signed_at:R}}catch(w){throw w}let u=$e(xe($e(xe({},t),{pagesHtml:i,notes:n,postits:s,proof:c}),l?{authoria_sig:l}:{}),{skv_version:2}),p=t.skvTitle||(r==null?void 0:r.name)||"eskrev",b=w=>String(w||"eskrev").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]/gi,"_").replace(/_+/g,"_").replace(/^_|_$/g,"").substring(0,32)||"eskrev",g=new Date().toISOString().slice(0,10).replace(/-/g,""),m=Date.now(),v=`${b(p)}_${g}_${m}.skv`,y=new Blob([JSON.stringify(u,null,2)],{type:"application/json"}),E=URL.createObjectURL(y),f=document.createElement("a");return f.href=E,f.download=v,document.body.appendChild(f),f.click(),document.body.removeChild(f),setTimeout(()=>URL.revokeObjectURL(E),4e3),v})}function pr(e){let a=document.getElementById("filesSidebar");if(!a)return;let o=a.querySelector(".filesSidebarClose"),t=document.getElementById("mesaProjectList"),r=document.getElementById("mesaNewBtn"),i=document.getElementById("mesaOpenBtn"),n=document.getElementById("mesaFileInput");ue.init();function s(){return document.getElementById("page1")}function d(){var y;let m=(y=e.state)==null?void 0:y.pages,v=m&&m.length?m.map(E=>ta(E)).join(""):ta(s()||document.createElement("div"));ue.saveContent(v)}function c(){var v;let m=(v=e.state)==null?void 0:v.pages;if(m)for(;m.length>1;)ua(e,m.length-1)}function l(m,v){Ns(v)?(m.innerText="",m.classList.add("is-empty"),m.setAttribute("data-placeholder",v.content||"")):(m.setAttribute("data-placeholder",""),m.innerText=v.content||"",m.classList.toggle("is-empty",!(v.content||"").trim()))}function u(m){var f,w,O,R;if(!m)return;d(),ue.setActive(m);let v=ue.getActive(),y=s();if(!y||!v)return;let E=Array.from(document.querySelectorAll(".pageContent .slice")).map(D=>(D.remove(),D));c(),l(y,v),E.length&&E.forEach(D=>y.appendChild(D)),requestAnimationFrame(()=>{Ie(e,y),oa(e)}),(f=e.setStatus)==null||f.call(e,`projeto: ${v.name}`),ra(t,ue,u),(R=(O=(w=e.integrations)==null?void 0:w.persistence)==null?void 0:O.bind)==null||R.call(O,y),y.focus()}let p=s(),b=ue.getActive();if(p&&b&&!b.content&&ta(p).trim()?(b.content=ta(p).trim(),ue.persist(!0)):p&&b&&b.content&&!ta(p).trim()&&(c(),l(p,b),requestAnimationFrame(()=>{Ie(e,p),oa(e)})),p){let m=null;p.addEventListener("input",()=>{clearTimeout(m),m=setTimeout(()=>ue.saveContent(ta(p)),2e3)})}new MutationObserver(()=>{let m=a.classList.contains("is-open");a.setAttribute("aria-hidden",m?"false":"true"),m&&(d(),ra(t,ue,u))}).observe(a,{attributes:!0,attributeFilter:["class"]}),o&&o.addEventListener("click",()=>{var m;a.classList.remove("is-open"),(m=s())==null||m.focus()}),document.addEventListener("keydown",m=>{var v;m.key==="Escape"&&a.classList.contains("is-open")&&(a.classList.remove("is-open"),(v=s())==null||v.focus())}),r&&r.addEventListener("click",()=>{var y,E,f,w;d();let m=`Projeto ${new Date().toLocaleDateString("pt-BR")}`;ue.createProject(m,"");let v=s();v&&(c(),v.innerText="",oa(e),(f=(E=(y=e.integrations)==null?void 0:y.persistence)==null?void 0:E.bind)==null||f.call(E,v),v.focus()),(w=e.setStatus)==null||w.call(e,`novo projeto: ${m}`),ra(t,ue,u)}),i&&n&&(i.addEventListener("click",()=>n.click()),n.addEventListener("change",()=>{var y;let m=(y=n.files)==null?void 0:y[0];if(!m)return;let v=new FileReader;v.onload=E=>{var w,O,R,D,ne,H,P,J,A,T,j,V,W,Y,ae,X,ce;let f=(w=E.target)==null?void 0:w.result;if(f){try{let U=JSON.parse(f);if(Array.isArray(U.projects)){d(),ue.data={projects:U.projects,activeId:U.activeId||((R=(O=U.projects[0])==null?void 0:O.id)!=null?R:null),memo:U.memo||"",mobileNotes:U.mobileNotes||[],skvTitle:U.skvTitle||""},Array.isArray(ue.data.projects)||(ue.data.projects=[]),$o(ue),ue.persist(!0),Array.isArray(U.notes)&&_e(nr,U.notes);let G=document.getElementById("postitLayer");G&&G.querySelectorAll(".postit").forEach(M=>M.remove()),Array.isArray(U.postits)&&U.postits.length?(_e(Io,U.postits),mo(e)):La(Io);let fe=s();if(Array.isArray(U.pagesHtml)&&U.pagesHtml.length&&fe){_e(cr,U.pagesHtml),c(),fe.innerHTML=U.pagesHtml[0]||"";for(let M=1;M<U.pagesHtml.length;M++){let se=(ne=(D=e.state)==null?void 0:D.pages)==null?void 0:ne[M-1];if(!se)break;let le=da(e,se,!1);le&&(le.innerHTML=U.pagesHtml[M]||"")}(J=(P=(H=e.integrations)==null?void 0:H.persistence)==null?void 0:P.bind)==null||J.call(P,fe)}else if(fe){let M=ue.getActive();M&&(c(),l(fe,M),(j=(T=(A=e.integrations)==null?void 0:A.persistence)==null?void 0:T.bind)==null||j.call(T,fe))}requestAnimationFrame(()=>{let M=s();M&&Ie(e,M)}),(V=e.setStatus)==null||V.call(e,`importado: ${m.name}`)}else if(U.html){d();let G=s();G&&(G.innerHTML=U.html,(ae=(Y=(W=e.integrations)==null?void 0:W.persistence)==null?void 0:Y.bind)==null||ae.call(Y,G)),U.title&&ue.renameProject(ue.data.activeId,U.title),(X=e.setStatus)==null||X.call(e,`importado: ${m.name}`)}}catch(U){let G=s();G&&(G.innerText=f,d()),(ce=e.setStatus)==null||ce.call(e,`importado: ${m.name}`)}n.value="",ra(t,ue,u)}},v.readAsText(m,"utf-8")})),ra(t,ue,u)}var fr="eskrev:perf:ttfr",jo="eskrev:perf:ttfa";function br(){var a;if(typeof performance=="undefined")return;let e=Math.round(performance.now());try{sessionStorage.setItem(fr,String(e))}catch(o){}(a=performance.mark)==null||a.call(performance,"eskrev:ready")}function vr(){var e;if(typeof performance!="undefined"){try{if(sessionStorage.getItem(jo))return;let a=Math.round(performance.now());sessionStorage.setItem(jo,String(a))}catch(a){}(e=performance.mark)==null||e.call(performance,"eskrev:first-action")}}function gr(e){return e<1e3?`${e}ms`:`${(e/1e3).toFixed(1)}s`}function hr(){let e=null,a=null;try{let t=sessionStorage.getItem(fr),r=sessionStorage.getItem(jo);t&&(e=parseInt(t,10)),r&&(a=parseInt(r,10))}catch(t){}let o=null;return a!=null&&(a<2e3?o="ok":a<5e3?o="warn":o="slow"),{ttfr:e,ttfa:a,ttfrFmt:e!=null?gr(e):null,ttfaFmt:a!=null?gr(a):null,status:o}}var ya=null;function yr(e,a){if(window[a])return Promise.resolve();let o=document.querySelector(`script[data-qrLib="${a}"]`);return o?new Promise((t,r)=>{o.addEventListener("load",t,{once:!0}),o.addEventListener("error",r,{once:!0})}):new Promise((t,r)=>{let i=document.createElement("script");i.src=e,i.dataset.qrLib=a,i.onload=t,i.onerror=()=>r(new Error(`Falha ao carregar ${e}`)),document.head.appendChild(i)})}function Ms(){return S(this,null,function*(){if(!(window.QRCode&&window.LZString))return ya||(ya=Promise.all([yr("src/assets/js/qrcode.min.js","QRCode"),yr("src/assets/js/lz-string.min.js","LZString")]).finally(()=>{ya=null}),ya)})}function Os(){let e=document.querySelectorAll(".pageContent"),a=Array.from(e).map(i=>i.innerHTML),o={};try{o=JSON.parse(localStorage.getItem("skrv_data")||"{}")}catch(i){}let t=JSON.parse(localStorage.getItem("skrv_mobile_notes_v1")||"[]"),r=JSON.parse(localStorage.getItem("skrv_postits_v1")||"[]");return $e(xe({},o),{pagesHtml:a,notes:t,postits:r,skv_version:2})}function Rs(){return window.LZString.compressToBase64(JSON.stringify(Os()))}var zs=(()=>{let e=[];for(let a=0;a<256;a++){let o=a;for(let t=0;t<8;t++)o=o&1?3988292384^o>>>1:o>>>1;e.push(o>>>0)}return e})();function Ds(e){let a=-1;for(let o=0;o<e.length;o++)a=a>>>8^zs[(a^e.charCodeAt(o))&255];return((a^-1)>>>0).toString(16).padStart(8,"0")}function xr(){return`<div class="qrSliceWrap">
  <div class="qrSliceCode" id="qrStreamCode"></div>
  <p  class="qrSliceStatus" id="qrStreamStatus">carregando\u2026</p>
  <p  class="qrSliceMeta"   id="qrStreamMeta"></p>
  <div class="qrSliceActions">
    <button class="qrSliceBtn" id="qrStreamPause" type="button">pausar</button>
    <button class="qrSliceBtn" id="qrStreamCopy"  type="button">copiar base64</button>
  </div>
  <p class="qrSliceHint">Abra <strong>eskrev.app</strong> no celular \u2192 Importar</p>
</div>`}function Sr(e){return S(this,null,function*(){var f;let a=e.querySelector("#qrStreamStatus"),o=e.querySelector("#qrStreamMeta"),t=e.querySelector("#qrStreamCode"),r=e.querySelector("#qrStreamPause"),i=e.querySelector("#qrStreamCopy");try{yield Ms()}catch(w){a&&(a.textContent="erro: bibliotecas QR indispon\xEDveis");return}let n=Rs(),s=n.match(new RegExp(".{1,200}","g"))||[],d=s.length,c=Date.now().toString().slice(-6),l=0,u=null,p=!1,b=((f=getComputedStyle(document.documentElement).getPropertyValue("--bg"))==null?void 0:f.trim())||"#f5f2ea",g=new window.QRCode(t,{width:260,height:260,colorLight:b,correctLevel:window.QRCode.CorrectLevel.Q});function m(){let w=s[l];g.clear(),g.makeCode(`v1|${c}|${l+1}|${d}|${Ds(w)}|${w}`),a&&(a.textContent=`transmitindo \xB7 ID ${c}`),o&&(o.textContent=`frame ${String(l+1).padStart(3,"0")} / ${String(d).padStart(3,"0")}`),l=(l+1)%d}function v(){u||(u=setInterval(m,450),m())}function y(){clearInterval(u),u=null}v(),r&&(r.onclick=()=>{p=!p,p?(y(),r.textContent="retomar",a&&(a.textContent="pausado")):(v(),r.textContent="pausar")}),i&&(i.onclick=()=>S(null,null,function*(){try{yield navigator.clipboard.writeText(n),i.textContent="copiado!",setTimeout(()=>{i.textContent="copiar base64"},1500)}catch(w){}}));let E=new MutationObserver(()=>{e.isConnected||(y(),E.disconnect())});E.observe(document.body,{childList:!0,subtree:!0})})}function Er(e,a){let o=document.getElementById("eskrev-countdown");if(!o){o=document.createElement("div"),o.id="eskrev-countdown";let n=document.createElement("style");n.textContent=`
      #eskrev-countdown {
        position: fixed; bottom: 32px; left: 50%; transform: translateX(-50%);
        z-index: 8999; background: var(--iso-ink-1, #111); color: var(--iso-paper, #f7f5f0);
        font-family: ui-monospace, monospace; font-size: 12px; letter-spacing: .12em;
        padding: 7px 18px; border-radius: 3px; opacity: 0;
        transition: opacity .18s; pointer-events: none; white-space: nowrap;
      }
      #eskrev-countdown.cd-visible { opacity: .9; pointer-events: auto; }
    `,document.head.appendChild(n),document.body.appendChild(o)}o._cdTimer&&(clearInterval(o._cdTimer),o._cdTimer=null),o._cdEsc&&document.removeEventListener("keydown",o._cdEsc,!0);let t=3,r=()=>{o.textContent=`${e}  ${t}`};r(),o.classList.add("cd-visible");let i=n=>{n.key==="Escape"&&(n.stopImmediatePropagation(),clearInterval(o._cdTimer),document.removeEventListener("keydown",o._cdEsc,!0),o.classList.remove("cd-visible"),o._cdTimer=null)};o._cdEsc=i,document.addEventListener("keydown",i,!0),o._cdTimer=setInterval(()=>{if(t-=1,t>0){r();return}clearInterval(o._cdTimer),o._cdTimer=null,document.removeEventListener("keydown",o._cdEsc,!0),o.classList.remove("cd-visible"),a()},1e3)}function Fs(e){if(!e)return"";try{return decodeURIComponent(e)}catch(a){return e}}function Bs(e){return encodeURIComponent(String(e||""))}function Hs(e){var r;let a=Fs(e).trim();if(!a)return null;let o=document.createElement("div");o.innerHTML=a;let t=o.firstElementChild;return!t||!((r=t.classList)!=null&&r.contains("slice"))?null:t}function xa(e){return Ee(e).replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>")}function ma(e){let a=String(e||"").replace(/\r/g,"").split(`
`),o=[],t=[],r=null,i=[],n=!1,s=[],d=()=>{t.length&&(o.push(`<p>${t.map(u=>xa(u)).join("<br>")}</p>`),t=[])},c=()=>{!r||!i.length||(o.push(`<${r}>${i.map(u=>`<li>${xa(u)}</li>`).join("")}</${r}>`),r=null,i=[])},l=()=>{o.push(`<pre><code>${s.map(u=>Ee(u)).join(`
`)}</code></pre>`),s=[],n=!1};for(let u of a){let p=String(u||""),b=p.trim();if(n){b==="```"||b==="~~~"?l():s.push(p);continue}if(b.startsWith("```")||b.startsWith("~~~")){d(),c(),n=!0;continue}if(!b){d(),c();continue}let g=b.match(/^(#{1,3})\s+(.+)$/);if(g){d(),c();let E=Math.min(3,g[1].length);o.push(`<h${E}>${xa(g[2])}</h${E}>`);continue}if(/^---+$/.test(b)){d(),c(),o.push("<hr>");continue}let m=b.match(/^>\s+(.+)$/);if(m){d(),c(),o.push(`<blockquote>${xa(m[1])}</blockquote>`);continue}let v=b.match(/^[-*✓✗]\s+(.+)$/);if(v){d(),r&&r!=="ul"&&c(),r="ul",i.push(v[1]);continue}let y=b.match(/^\d+\.\s+(.+)$/);if(y){d(),r&&r!=="ol"&&c(),r="ol",i.push(y[1]);continue}c(),t.push(b)}return d(),c(),n&&s.length&&l(),o.join("")||`<p>${xa(String(e||""))}</p>`}function Vs(e){let a=Array.from(e.childNodes),o=[],t=null;for(let r of a){let i=r.nodeType===Node.ELEMENT_NODE&&/^H[123]$/.test(r.tagName);if(r.nodeType===Node.ELEMENT_NODE&&r.tagName==="HR"){t=null;continue}if(i){let d=(r.textContent||"").match(/^(\d+\))\s+(.+)$/);d&&(r.innerHTML=`<span class="modos-sec-num">${d[1]}</span> ${d[2]}`),t=document.createElement("div"),t.className="modos-section",t.appendChild(r.cloneNode(!0)),o.push(t);continue}t||(t=document.createElement("div"),t.className="modos-section",o.push(t)),t.appendChild(r.cloneNode(!0))}e.innerHTML="",o.forEach(r=>e.appendChild(r))}function Mo(e){let a=String(e||"").replace(/\r/g,"");if(!a)return"";let o=a.split(`
`),t=[],r=!1;for(let i of o){let n=i.trim();if(!n){t.push(i);continue}if(/^o texto mesmo voc[eê] escreve do lado\.?$/i.test(n)){r||(t.push("Isso aqui \xE9 s\xF3 um apoio."),r=!0);continue}if(/^isso aqui [ée] s[oó] um apoio\.?$/i.test(n)){r||(t.push("Isso aqui \xE9 s\xF3 um apoio."),r=!0);continue}t.push(i)}return t.join(`
`).replace(/\n{3,}/g,`

`).trim()}function ee(e,{meta:a,body:o}){if(!e)return;let t=e.querySelector(".sliceMeta"),r=e.querySelector(".panelBody");t&&typeof a=="string"&&(t.textContent=a),r&&typeof o=="string"&&(r.innerHTML=ma(o))}function Us(e,{duration:a=980,topGap:o=24}={}){let t=e==null?void 0:e.closest(".pageContent");if(!t)return;let r=t.scrollTop,n=Math.max(0,e.offsetTop-o)-r;if(Math.abs(n)<1)return;let s=performance.now(),d=l=>1-Math.pow(1-l,3),c=l=>{let u=Math.min(1,(l-s)/a);t.scrollTop=r+n*d(u),u<1&&requestAnimationFrame(c)};requestAnimationFrame(c)}function qr(e){var t,r,i,n;let a=((r=(t=e.querySelector(".badge strong"))==null?void 0:t.textContent)==null?void 0:r.trim())||"00",o=((n=(i=e.querySelector(".badge span"))==null?void 0:i.textContent)==null?void 0:n.trim())||"CUT";return{badge:a,title:o}}function wr(e,a){if(!a||a.__dockTagBound===!0)return;a.__dockTagBound=!0;let o=null,t=!1,r=4,i=92,n=.74,s=()=>{a.style.setProperty("--tag-danger","0"),a.classList.remove("isDeleteArmed")},d=()=>{o=null,a.classList.remove("isDragging"),s()},c=()=>{let u=Number.parseFloat(a.style.top||"0");if(!Number.isFinite(u))return;let{minTop:p}=ga(a),b=Math.max(p,u-12);a.classList.add("isBouncing"),a.style.top=`${Math.round(b)}px`,requestAnimationFrame(()=>{requestAnimationFrame(()=>{a.style.top=`${Math.round(u)}px`})}),window.setTimeout(()=>a.classList.remove("isBouncing"),280)},l=u=>{if(!o)return;let p=o.startTop+(u.clientY-o.startY),{minTop:b,maxTop:g}=ga(a),m=Math.min(Math.max(b,p),g);a.dataset.manualTop=String(m),a.style.top=`${Math.round(m)}px`;let v=Math.max(b,g-i),y=Math.min(1,Math.max(0,(m-v)/Math.max(1,g-v)));a.style.setProperty("--tag-danger",y.toFixed(3)),a.classList.toggle("isDeleteArmed",y>=n),Math.abs(u.clientY-o.startY)>r&&(t=!0)};a.addEventListener("pointerdown",u=>{if(u.button!==0)return;let p=Number.parseFloat(a.style.top||"0");o={startY:u.clientY,startTop:Number.isFinite(p)?p:0},t=!1,a.classList.add("isDragging"),a.setPointerCapture(u.pointerId),u.preventDefault()}),a.addEventListener("pointermove",l),a.addEventListener("pointerup",u=>{var g;let p=a.classList.contains("isDeleteArmed"),b=t;d();try{a.releasePointerCapture(u.pointerId)}catch(m){}if(p){let m=document.getElementById(a.dataset.anchorId||"");m&&m.remove(),a.remove(),Re(e),(g=e.setStatus)==null||g.call(e,"tag removida");return}b&&c()}),a.addEventListener("pointercancel",d),a.addEventListener("click",()=>{if(t){t=!1;return}let u=Hs(a.dataset.sliceHtml||"");if(!u)return;let p=document.getElementById("page1");if(!p)return;p.appendChild(u),Oo(e,u),u.classList.add("isEntering"),requestAnimationFrame(()=>requestAnimationFrame(()=>u.classList.remove("isEntering")));let b=document.getElementById(a.dataset.anchorId||"");b&&b.remove(),a.remove(),Re(e),e.setStatus(`reopened: ${qr(u).title}`)})}function Oo(e,a){if(!a||a.__sliceBound===!0)return;a.__sliceBound=!0,a.setAttribute("contenteditable","false"),a.dataset.kind=a.dataset.kind||"unknown",a.dataset.sliceId||(a.dataset.sliceId=String(++e.state.sliceId));let o=()=>{if(a.classList.contains("isClosing"))return;a.classList.add("isClosing");let l=()=>{a.parentNode&&a.remove()};a.addEventListener("transitionend",l,{once:!0}),setTimeout(l,420)},t=()=>{let{badge:l,title:u}=qr(a),p=e.refs.sliceDockEl||document.querySelector(".sliceDock");if(!p||a.classList.contains("isClosing"))return;let b=a.parentNode;if(!b)return;let g=document.createElement("span");g.className="sliceAnchor",g.id=`sliceAnchor${++e.state.dockAnchorId}`,g.setAttribute("contenteditable","false"),b.insertBefore(g,a.nextSibling);let m=document.createElement("button");m.type="button",m.className=`sliceTag k-${a.dataset.kind||"unknown"}`,m.textContent=`${l} ${u}`,m.title=`Reabrir ${u}`,m.dataset.sliceId=a.dataset.sliceId,m.dataset.anchorId=g.id,m.dataset.kind=a.dataset.kind||"unknown",m.dataset.sliceHtml=Bs(a.outerHTML),wr(e,m),p.prepend(m),Re(e),lo(e,m),a.dataset.liveVerify&&(m.dataset.liveVerify="1",Ys(e,m)),a.remove(),e.setStatus(`docked: ${u}`)},r=()=>a.classList.toggle("isMinimized"),i=a.querySelector(".sliceTopHandle"),n=a.querySelector(".sliceBottomHandle"),s=a.querySelector(".gutter.left"),d=a.querySelector(".gutter.right"),c=a.querySelector(".panelBody");if(i&&!i.querySelector(".sliceTopBlob")){let l=document.createElement("span");l.className="sliceTopBlob",i.appendChild(l)}if(i&&i.addEventListener("click",r),i){let l={tx:.5,ty:0,prevTy:0,x:.5,y:0,vx:0,vy:0,raf:0},u=()=>{let v=Math.max(1,i.clientWidth),y=Number.parseFloat(getComputedStyle(i).getPropertyValue("--venom-gap"))||12,E=Number.parseFloat(getComputedStyle(i).getPropertyValue("--venom-bar-h"))||6,f=l.x*v,O=1+Math.max(2,y-E-1)*l.y,R=Math.min(1,Math.abs(l.vx)*22+Math.abs(l.vy)*30),D=20-5*l.y+6*R,ne=Math.max(-9,Math.min(9,l.vx*580)),H=1+.22*R;i.style.setProperty("--venom-left",`${f.toFixed(2)}px`),i.style.setProperty("--venom-h",`${O.toFixed(2)}px`),i.style.setProperty("--venom-w",`${D.toFixed(2)}px`),i.style.setProperty("--venom-skew",`${ne.toFixed(2)}deg`),i.style.setProperty("--venom-squash",H.toFixed(3))},p=()=>{let v=(l.tx-l.x)*.24,y=(l.ty-l.y)*.2;l.vx=(l.vx+v)*.72,l.vy=(l.vy+y)*.7,l.x+=l.vx,l.y+=l.vy,l.x=Math.max(0,Math.min(1,l.x)),l.y>1?(l.y=1,l.vy>0&&(l.vy*=-.58)):l.y<0&&(l.y=0,l.vy<0&&(l.vy*=-.35)),u(),Math.abs(l.tx-l.x)>8e-4||Math.abs(l.ty-l.y)>8e-4||Math.abs(l.vx)>6e-4||Math.abs(l.vy)>6e-4?l.raf=requestAnimationFrame(p):l.raf=0},b=()=>{l.raf||(l.raf=requestAnimationFrame(p))},g=v=>{let y=i.getBoundingClientRect(),E=Number.parseFloat(getComputedStyle(i).getPropertyValue("--venom-bar-h"))||6,f=Math.max(0,Math.min(1,(v.clientX-y.left)/Math.max(1,y.width))),w=Math.abs(v.clientY-(y.top+E)),O=Math.max(0,1-w/84),R=w>84?Math.max(0,.24-(w-84)/360):0,D=Math.min(1,Math.max(O,R));D<l.ty&&l.y>.62&&(l.vy+=.012),l.tx=f,l.prevTy=l.ty,l.ty=D,b()},m=()=>{l.ty=0,b()};i.addEventListener("mousemove",g),a.addEventListener("mousemove",g),a.addEventListener("mouseleave",m),window.addEventListener("resize",u),u()}n&&n.addEventListener("click",l=>{l.stopPropagation(),t()}),s&&s.addEventListener("click",o),d&&d.addEventListener("click",o),c&&!c.dataset.heavyScrollBound&&(c.dataset.heavyScrollBound="1",c.addEventListener("wheel",l=>{if(Math.max(0,c.scrollHeight-c.clientHeight)<=0)return;let p=.38;c.scrollTop+=l.deltaY*p,l.preventDefault()},{passive:!1}))}function Ha(e,a){if(!a)return;let o=Array.from(a.querySelectorAll(".slice[data-slice-id]")).map(t=>Number.parseInt(t.dataset.sliceId||"0",10)).filter(t=>Number.isFinite(t)&&t>0);if(o.length){let t=Math.max(...o);e.state.sliceId=Math.max(e.state.sliceId||0,t)}a.querySelectorAll(".slice").forEach(t=>{t.classList.remove("isEntering","isClosing"),t.dataset.sliceBound&&delete t.dataset.sliceBound,Oo(e,t)})}function Ar(e){var o;let a=((o=e==null?void 0:e.refs)==null?void 0:o.sliceDockEl)||document.querySelector(".sliceDock");a&&a.querySelectorAll(".sliceTag").forEach(t=>{wr(e,t)})}function ie(e,a){let{badge:o,title:t,kindKey:r,meta:i,body:n,focusScroll:s}=a,d=document.createElement("div");return d.className="slice isEntering",d.setAttribute("contenteditable","false"),d.dataset.sliceId=String(++e.state.sliceId),d.dataset.kind=r||"unknown",d.innerHTML=`
    <div class="sliceRow">
      <div class="sliceTopHandle" title="Minimizar/expandir corte"></div>
      <div class="gutter left" title="Fechar corte"></div>

      <div class="sliceCard">
        <div class="sliceHead">
          <div class="badge"><strong>${Ee(o)}</strong> <span>${Ee(t)}</span></div>
          <div class="sliceMeta">${Ee(i||"")}</div>
        </div>
        <div class="sliceBody">
          <div class="panel">
            <div class="panelBody">${ma(n)}</div>
          </div>
        </div>
      </div>

      <div class="gutter right" title="Fechar corte"></div>
      <div class="sliceBottomHandle" title="Enviar para lateral"></div>
    </div>
  `,Oo(e,d),requestAnimationFrame(()=>requestAnimationFrame(()=>d.classList.remove("isEntering"))),s&&requestAnimationFrame(()=>requestAnimationFrame(()=>{Us(d,{duration:s==="heavy"?1180:760,topGap:20})})),d}function Ks(e){return String(e||"").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,"").trim()}function Gs(e){if(!e||e.ok===!1)return["Sem retorno do dicion\xE1rio."];let a=e.entry||{},o=[];return a.lemma&&o.push(`Lema: ${a.lemma}`),a.classe&&o.push(`Classe: ${a.classe}`),a.definicao&&o.push(`Defini\xE7\xE3o: ${a.definicao}`),Array.isArray(a.definicoes)&&a.definicoes.length&&o.push(...a.definicoes.slice(0,3).map((t,r)=>`${r+1}. ${String(t)}`)),Array.isArray(a.examples)&&a.examples.length&&o.push(`Ex.: ${String(a.examples[0])}`),o.length||o.push("Entrada encontrada, sem campos mapeados."),o}function Cr(e,a,o){var d,c,l,u,p,b;let t=String(o||"").trim();if(!t)return null;let r=Ks(t)||t,i=String((a==null?void 0:a.innerText)||(a==null?void 0:a.textContent)||""),n=ie(e,{badge:"03",title:"CONSULTA",kindKey:"consult",meta:`sele\xE7\xE3o: ${r} \u2022 carregando`,body:"Lendo dicion\xE1rio e contexto...",focusScroll:"heavy"}),s=(d=e.integrations)==null?void 0:d.consult;return s?(Promise.all([Promise.resolve(((c=s.findInVocab)==null?void 0:c.call(s,r))||[]),Promise.resolve(((l=s.findInText)==null?void 0:l.call(s,r,i,5))||[]),Promise.resolve(((u=s.lookupDictionary)==null?void 0:u.call(s,r))||null),Promise.resolve(((p=s.lookupDoubt)==null?void 0:p.call(s,r))||null),Promise.resolve(((b=s.lookupRegencia)==null?void 0:b.call(s,r))||null)]).then(([g,m,v,y,E])=>{let f=[];f.push(`## ${r}`),f.push(""),f.push("### Dicion\xE1rio"),f.push(...Gs(v)),f.push(""),f.push("### Vocabul\xE1rio local"),Array.isArray(g)&&g.length?f.push(...g.slice(0,5).map(([w,O])=>`- **${w}**: ${O}`)):f.push("- sem ocorr\xEAncia no vocab local"),f.push(""),f.push("### Ocorr\xEAncias no texto"),Array.isArray(m)&&m.length?f.push(...m.map(w=>`- linha ${w.idx}: ${w.line}`)):f.push("- sem ocorr\xEAncia no conte\xFAdo atual"),y!=null&&y.ok&&(y!=null&&y.doubt)&&(f.push(""),f.push("### D\xFAvida frequente"),f.push(`- ${y.doubt}`)),E!=null&&E.ok&&(E!=null&&E.regencia)&&(f.push(""),f.push("### Reg\xEAncia"),f.push(`- ${E.regencia}`)),ee(n,{meta:`sele\xE7\xE3o: ${r}`,body:f.join(`
`)})}).catch(g=>{ee(n,{meta:`sele\xE7\xE3o: ${r} \u2022 falha`,body:`Falha ao consultar sele\xE7\xE3o.

${(g==null?void 0:g.message)||String(g)}`})}),n):(ee(n,{meta:`sele\xE7\xE3o: ${r} \u2022 integra\xE7\xE3o indispon\xEDvel`,body:"Pacote de consulta indispon\xEDvel."}),n)}function Tr(){return Array.from(document.querySelectorAll(".pageContent")).map(e=>{let a=e.cloneNode(!0);return a.querySelectorAll(".slice").forEach(o=>o.remove()),a.innerText||""}).join(`
`)}function Ws(e){let a=e||"",o=a.trim()?a.trim().split(/\s+/).filter(Boolean).length:0,t=a.length,r=a.replace(/\s/g,"").length,i=a.split(/[.!?…]+/).filter(b=>b.trim().length>2).length,n=a.split(/\n{2,}|\r\n{2,}/).filter(b=>b.trim()).length||(a.trim()?1:0),s=Math.round(o/200*60),d=s<60?`${s}s`:`${Math.floor(s/60)}min ${s%60}s`,c=a.toLowerCase().match(/[\p{L}]{2,}/gu)||[],l=new Set(c),u=c.length?`${Math.round(l.size/c.length*100)}%`:"\u2014",p=c.reduce((b,g)=>g.length>b.length?g:b,"");return{words:o,chars:t,charsNoSpaces:r,sentences:i,paragraphs:n,readTime:d,lexDensity:u,longestWord:p}}function _r(e){return S(this,null,function*(){try{let a=new TextEncoder().encode(e||""),o=yield crypto.subtle.digest("SHA-256",a);return Array.from(new Uint8Array(o)).map(t=>t.toString(16).padStart(2,"0")).join("")}catch(a){return""}})}function Js(e){return S(this,null,function*(){var c,l,u,p;let a=((c=e==null?void 0:e.proof)==null?void 0:c.content_hash)||((l=e==null?void 0:e.HEADER)==null?void 0:l.HASH)||"";if(!a)return{status:"warn",msg:"Arquivo sem proof.content_hash \u2014 n\xE3o foi exportado com verifica\xE7\xE3o ativa."};let o="";if(Array.isArray(e.projects)){let b=e.projects.find(g=>g.id===e.activeId)||e.projects[0];o=(b==null?void 0:b.content)||""}else(u=e.content)!=null&&u.text?o=e.content.text:e.MASTER_TEXT&&(o=e.MASTER_TEXT);let t=yield _r(o);if(!t)return{status:"warn",msg:"N\xE3o foi poss\xEDvel calcular hash."};let r=a===t,i=e.authoria_sig||e.AUTHORIA_SIGNATURE,n=!!(i!=null&&i.signature&&(i!=null&&i.public_key_jwk)),s="";if(n)try{let b=yield crypto.subtle.importKey("jwk",i.public_key_jwk,{name:"ECDSA",namedCurve:"P-256"},!1,["verify"]),g=Uint8Array.from(atob(i.signature),y=>y.charCodeAt(0)),m=new TextEncoder().encode(t);s=(yield crypto.subtle.verify({name:"ECDSA",hash:"SHA-256"},b,g,m))?`
Assinatura ECDSA \xB7 v\xE1lida \u2713`:`
Assinatura ECDSA \xB7 inv\xE1lida \u2717`}catch(b){s=`
Assinatura ECDSA \xB7 erro ao verificar`}let d=(p=e.proof)!=null&&p.created_at?new Date(e.proof.created_at).toLocaleString("pt-BR"):"\u2014";return r?{status:"ok",msg:`Conte\xFAdo \xEDntegro \u2014 hash confere \u2713
Gerado em: ${d}
SHA-256: ${a.slice(0,16)}\u2026${s}`}:{status:"fail",msg:`Hash diverge \u2014 conte\xFAdo foi alterado ap\xF3s a exporta\xE7\xE3o \u2717
Registrado: ${a.slice(0,16)}\u2026
Atual:      ${t.slice(0,16)}\u2026`}})}function Ys(e,a){let o=n=>n>=1e3?`${(n/1e3).toFixed(1)}k`:String(n),t=()=>{if(!a.isConnected){clearInterval(r),document.removeEventListener("input",i,!0);return}let n=Tr(),s=n.trim()?n.trim().split(/\s+/).filter(Boolean).length:0,d=n.length;a.textContent=`${o(s)} pal \xB7 ${o(d)} chr`,a.title="Abrir verifica\xE7\xE3o"};t();let r=setInterval(t,3e3),i=()=>t();document.addEventListener("input",i,{capture:!0,passive:!0})}function Qs(){var i,n;let e="eskrev_pomo_target",a="eskrev_pomo_phase",o="eskrev_pomo_dur",t=document.getElementById("eskrev-pomo");if(!t){let c=function(m){let v=Math.max(0,Math.ceil(m/1e3)),y=Math.floor(v/60).toString().padStart(2,"0"),E=(v%60).toString().padStart(2,"0");return`${y}:${E}`},l=function(){clearInterval(d),d=null,localStorage.removeItem(e),localStorage.removeItem(a),localStorage.removeItem(o),t.className="pomo-hidden",t.innerHTML=""},u=function(m){let v=Date.now()+m*6e4;localStorage.setItem(e,String(v)),localStorage.setItem(a,"work"),localStorage.setItem(o,String(m)),t.className="pomo-work",t.innerHTML=`<span class="pomo-work-clock">${c(v-Date.now())}</span>`,clearInterval(d),d=setInterval(()=>{let y=parseInt(localStorage.getItem(e))-Date.now();if(y<=0){clearInterval(d),p();return}let E=t.querySelector(".pomo-work-clock");E&&(E.textContent=c(y))},1e3)},p=function(){let v=Date.now()+36e4;localStorage.setItem(e,String(v)),localStorage.setItem(a,"break");function y(E){t.className="",t.innerHTML=`
          <div class="pomo-box">
            <div class="pomo-title">pausa obrigat\xF3ria</div>
            <div class="pomo-clock" id="pomoClock">${c(E)}</div>
            <div class="pomo-sub">
              Descanse os olhos \xB7 afaste-se da tela<br>
              O editor reabre ao fim da pausa.
            </div>
            <div class="pomo-locked-note">n\xE3o \xE9 poss\xEDvel fechar antes do tempo</div>
          </div>
        `}y(36e4),clearInterval(d),d=setInterval(()=>{let E=parseInt(localStorage.getItem(e))-Date.now(),f=t.querySelector("#pomoClock");if(E<=0){clearInterval(d),b();return}f&&(f.textContent=c(E))},1e3)},b=function(){localStorage.removeItem(e),localStorage.setItem(a,"done"),t.className="",t.innerHTML=`
        <div class="pomo-box">
          <div class="pomo-title">ciclo conclu\xEDdo</div>
          <div class="pomo-sub">Pr\xF3ximo ciclo ou encerrar?</div>
          <div class="pomo-btns">
            <button class="pomo-btn" data-dur="25">25 min</button>
            <button class="pomo-btn" data-dur="50">50 min</button>
          </div>
          <button class="pomo-btn pomo-btn-stop" id="pomoStop">encerrar sess\xE3o</button>
        </div>
      `,t.querySelectorAll("[data-dur]").forEach(m=>{m.onclick=()=>u(parseInt(m.dataset.dur))}),t.querySelector("#pomoStop").onclick=()=>l()},g=function(){t.className="",t.innerHTML=`
        <div class="pomo-box">
          <div class="pomo-title">pomodoro \u2014 foco</div>
          <div class="pomo-sub">Quanto tempo de concentra\xE7\xE3o?</div>
          <div class="pomo-btns">
            <button class="pomo-btn" data-dur="25">25 min</button>
            <button class="pomo-btn" data-dur="50">50 min</button>
          </div>
          <button class="pomo-btn pomo-btn-stop" id="pomoCancelSetup">cancelar</button>
        </div>
      `,t.querySelectorAll("[data-dur]").forEach(m=>{m.onclick=()=>u(parseInt(m.dataset.dur))}),t.querySelector("#pomoCancelSetup").onclick=()=>l()};t=document.createElement("div"),t.id="eskrev-pomo";let s=document.createElement("style");s.textContent=`
      #eskrev-pomo {
        position: fixed; inset: 0; z-index: 8800;
        display: flex; align-items: center; justify-content: center;
        background: rgba(17,17,16,.92);
        font-family: ui-monospace, monospace;
        color: #f7f5f0;
        transition: opacity .25s;
      }
      #eskrev-pomo.pomo-work {
        inset: auto auto 18px 18px;
        width: auto; height: auto;
        background: none;
        border: none;
        border-radius: 0;
        align-items: flex-start; justify-content: flex-start;
        pointer-events: none;
      }
      #eskrev-pomo.pomo-hidden { display: none; }
      .pomo-box {
        display: flex; flex-direction: column; align-items: center; gap: 20px;
        padding: 40px 48px; text-align: center;
      }
      .pomo-title {
        font-size: 11px; letter-spacing: .2em; opacity: .5; text-transform: uppercase;
      }
      .pomo-clock {
        font-size: 52px; font-weight: 700; letter-spacing: -.02em;
        font-variant-numeric: tabular-nums;
      }
      .pomo-work .pomo-work-clock {
        font-size: 13px; letter-spacing: .06em; font-variant-numeric: tabular-nums;
        color: var(--iso-ink-3, #aaa);
        opacity: .38;
      }
      .pomo-sub { font-size: 11px; opacity: .45; line-height: 1.6; }
      .pomo-btns { display: flex; gap: 12px; }
      .pomo-btn {
        background: none; border: 1px solid rgba(247,245,240,.3);
        color: #f7f5f0; padding: 10px 28px; font-size: 12px; letter-spacing: .12em;
        cursor: pointer; font-family: ui-monospace, monospace;
        transition: background .15s, border-color .15s;
      }
      .pomo-btn:hover { background: rgba(247,245,240,.1); border-color: rgba(247,245,240,.6); }
      .pomo-btn.pomo-btn-stop {
        border-color: rgba(247,245,240,.12); opacity: .4; font-size: 10px; padding: 6px 16px;
      }
      .pomo-btn.pomo-btn-stop:hover { opacity: .8; }
      .pomo-locked-note { font-size: 10px; opacity: .3; letter-spacing: .08em; }
    `,document.head.appendChild(s),document.body.appendChild(t);let d=null;t._pomoShowSetup=g,t._pomoResume=()=>{let m=parseInt(localStorage.getItem(e)),v=localStorage.getItem(a);v==="work"&&m>Date.now()?(t.className="pomo-work",t.innerHTML=`<span class="pomo-work-clock">${c(m-Date.now())}</span>`,clearInterval(d),d=setInterval(()=>{let y=parseInt(localStorage.getItem(e))-Date.now();if(y<=0){clearInterval(d),p();return}let E=t.querySelector(".pomo-work-clock");E&&(E.textContent=c(y))},1e3)):v==="break"&&m>Date.now()?p():v==="done"&&b()}}let r=localStorage.getItem(a);if(r==="work"||r==="break"){(i=t._pomoResume)==null||i.call(t);return}(n=t._pomoShowSetup)==null||n.call(t)}var Sa=null,Ea=null;function Xs(){function e(n){let s=n.cloneNode(!0);return s.querySelectorAll(".slice,.sliceBar").forEach(d=>d.remove()),s.innerText||""}let a=document.querySelectorAll(".pageContent"),o=Array.from(a).map(e).join(`

`).trim();if(!o)return;let t=document.getElementById("eskrev-ereader");if(!t){let w=function(C){return String(C||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")},O=function(){f.themes.forEach(C=>t.classList.remove(C)),t.classList.add(f.themes[f.themeIdx]),t.querySelector("#er-theme").textContent=`\u25D1 ${f.themeLabels[f.themeIdx]}`},R=function(){if(f.mode==="page"){l.textContent=`P\xE1gina ${f.page+1} de ${f.total}`;return}let C=d.scrollHeight-d.clientHeight;l.textContent=`Lido: ${C>0?Math.round(d.scrollTop/C*100):0}%`},D=function(){f.total=Math.max(1,Math.ceil(c.scrollWidth/window.innerWidth)),R()},ne=function(C){let F=f.page+C;F>=0&&F<f.total&&(f.page=F,c.style.left=`-${f.page*100}vw`,R())},H=function(C){f.mode=C,s.className=s.className.replace(/\ber-(page|scroll)\b/g,"").trim(),s.classList.add(`er-${C}`),u.textContent=C==="page"?"\u21C4 p\xE1gina":"\u21C5 rolar",C==="page"?(f.page=0,setTimeout(()=>{D(),c.style.left="0",R()},60)):(c.style.left="0",setTimeout(R,60))},P=function(C){f.fontSize=Math.max(14,Math.min(32,f.fontSize+C)),c.style.fontSize=f.fontSize+"px",f.mode==="page"&&setTimeout(D,80)},J=function(C){let F=new Map;(C.toLowerCase().match(/[a-zà-ÿ]{4,}/gi)||[]).forEach(te=>F.set(te,(F.get(te)||0)+1));let Z=[...F.entries()].sort((te,de)=>de[1]-te[1]).slice(0,25);m.innerHTML=Z.map(([te,de])=>`<div class="er-glos-item"><span>${w(te)}</span><span>${de}</span></div>`).join("")},A=function(C,F=!1){return C.split(/\n{2,}/g).map(te=>te.trim()).filter(Boolean).map(te=>{let de=w(te);return`<p>${(F?de.replace(/\n/g,"<br>"):de.replace(/\n+/g," ")).replace(/\s{2,}/g," ").trim()}</p>`}).join("")},T=function(C){let F=C.replace(/\r\n/g,`
`),Z=F.match(/\*\*\*\s*START OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);Z&&(F=F.slice(Z.index+Z[0].length));let te=F.match(/\*\*\*\s*END OF (?:THIS|THE) PROJECT GUTENBERG EBOOK[\s\S]*?\*\*\*/i);return te&&(F=F.slice(0,te.index)),F.replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).trim()},j=function(C,F){c.innerHTML=C,c.scrollTop=0,f.mode==="page"&&(f.page=0,setTimeout(D,60)),J(F||c.innerText||""),R()},V=function(){f.libMode="user",c.innerHTML=A(f.userText),c.scrollTop=f.userScroll,J(f.userText),t.querySelector("#er-back").style.display="none",R()},ce=function(C){var F;if(!((F=C==null?void 0:C.entries)!=null&&F.length)){v.innerHTML='<div class="er-lib-empty">sem entradas</div>';return}v.innerHTML=C.entries.map((Z,te)=>`<div class="er-fio-item" data-fi="${te}"><div class="date">${w(Z.date||"")}</div><div class="title">${w(Z.title||"")}</div></div>`).join(""),v.querySelectorAll(".er-fio-item").forEach(Z=>{Z.onclick=()=>S(null,null,function*(){f.libMode!=="fiodoverso"&&(f.userScroll=c.scrollTop),f.libMode="fiodoverso",t.querySelector("#er-back").style.display="";let te=C.entries[parseInt(Z.dataset.fi)];try{let Ce=(yield(yield fetch(`src/assets/fiodoverso/${te.file}`)).text()).replace(/^---[\s\S]*?---\s*/m,"");j(A(Ce,!0),Ce)}catch(de){c.innerHTML="<p>erro ao carregar</p>"}s.classList.remove("show-lib")})})},U=function(C){f.libView=C,t.querySelector("#er-lib-tab-books").classList.toggle("active",C==="books"),t.querySelector("#er-lib-tab-fio").classList.toggle("active",C==="fio"),y.style.display=C==="books"?"":"none",E.style.display=C==="fio"?"":"none",C==="books"?ae():X()},G=function(){let C=d.getBoundingClientRect(),F=g.getBoundingClientRect(),Z=F.top-C.top,te=F.height;d.style.setProperty("--ruler-top",`${Z}px`),d.style.setProperty("--ruler-h",`${te}px`)},Be=function(){f.autoScroll=!1,f.autoRaf&&cancelAnimationFrame(f.autoRaf),f.autoRaf=null,t.querySelector("#er-play").classList.remove("er-btn-on"),t.querySelector("#er-play").textContent="\u25B6"},pa=function(){f.autoScroll=!0,t.querySelector("#er-play").classList.add("er-btn-on"),t.querySelector("#er-play").textContent="\u23F8";let C=()=>{if(!f.autoScroll)return;let F=d.scrollHeight-d.clientHeight;if(d.scrollTop>=F){Be();return}d.scrollTop+=f.autoSpeed,f.autoRaf=requestAnimationFrame(C)};f.autoRaf=requestAnimationFrame(C)};t=document.createElement("div"),t.id="eskrev-ereader";let n=document.createElement("style");n.textContent=`
      #eskrev-ereader {
        position: fixed; inset: 0; z-index: 9000;
        display: flex; flex-direction: column;
        transform: translateY(100%);
        transition: transform .35s cubic-bezier(.2,1,.3,1);
        background: var(--er-bg, #fcfbf9); color: var(--er-fg, #2c2c2c);
        font-family: Georgia, 'Times New Roman', serif;
      }
      #eskrev-ereader.er-active { transform: translateY(0); }
      /* temas */
      .er-t-paper { --er-bg:#fcfbf9; --er-fg:#2c2c2c; --er-tb:rgba(247,245,240,.95); --er-glass:rgba(252,251,249,.88); --er-ruler:#c4542a; }
      .er-t-sepia  { --er-bg:#f4ecd8; --er-fg:#5b4636; --er-tb:rgba(235,225,201,.95); --er-glass:rgba(244,236,216,.88); --er-ruler:#9b6a3a; }
      .er-t-chumbo { --er-bg:#111110; --er-fg:#c0c0c0; --er-tb:rgba(20,20,19,.95);    --er-glass:rgba(17,17,16,.88);    --er-ruler:#4a90d9; }
      /* toolbar */
      #er-tb {
        height: 48px; display: flex; align-items: center; gap: 6px;
        padding: 0 16px; border-bottom: 1px solid rgba(128,128,128,.12);
        background: var(--er-tb); backdrop-filter: blur(6px); flex-shrink: 0; z-index: 20;
      }
      #er-tb button {
        background: none; border: 1px solid transparent; border-radius: 5px;
        cursor: pointer; padding: 3px 9px; font-size: .75rem; font-family: ui-monospace, monospace;
        color: inherit; opacity: .6; transition: opacity .12s, border-color .12s; white-space: nowrap;
      }
      #er-tb button:hover { opacity: 1; border-color: rgba(128,128,128,.3); }
      #er-tb button.er-btn-on { opacity: 1; border-color: var(--er-ruler); color: var(--er-ruler); }
      .er-sep { width: 1px; height: 18px; background: currentColor; opacity: .12; flex-shrink: 0; }
      .er-spacer { flex: 1; }
      /* body layout */
      #er-body { flex: 1; display: flex; position: relative; overflow: hidden; min-height: 0; }
      #er-viewer { flex: 1; position: relative; overflow: hidden; }
      /* scroll mode */
      .er-scroll #er-viewer { overflow-y: auto; }
      .er-scroll #er-content {
        position: static; width: min(66ch, 88vw); margin: 0 auto;
        padding: 48px 0 120px; height: auto !important;
        column-width: auto !important; transform: none !important;
      }
      /* page mode */
      .er-page #er-viewer { overflow: hidden; }
      .er-page #er-content {
        position: absolute; top: 0; left: 0;
        height: calc(100vh - 96px);
        padding: 36px clamp(20px, 12vw, 140px);
        column-width: 68vw; column-gap: calc(100vw - 68vw);
        column-fill: auto; width: auto;
        transition: left .32s cubic-bezier(.25,1,.5,1);
      }
      .er-click { position: absolute; top: 0; bottom: 0; width: 11%; z-index: 12; cursor: pointer; display: none; }
      .er-page .er-click { display: block; }
      .er-click-l { left: 0; } .er-click-r { right: 0; }
      /* content */
      #er-content { font-size: 19px; line-height: 1.85; text-align: justify; outline: none; }
      #er-content p { margin: 0 0 .9em; }
      /* ruler / lupa */
      .er-ruler {
        position: absolute; left: 0; right: 0; z-index: 15;
        border-top: 1.5px solid var(--er-ruler); border-bottom: 1.5px solid var(--er-ruler);
        cursor: grab; display: none; user-select: none; touch-action: none;
        min-height: 44px;
      }
      .er-ruler.dragging { cursor: grabbing; }
      .er-box.show-ruler .er-ruler { display: block; }
      .er-glass {
        position: absolute; left: 0; right: 0; z-index: 14;
        background: var(--er-glass); pointer-events: none; display: none;
      }
      .er-box.show-ruler .er-glass { display: block; }
      .er-glass-top { top: 0; height: var(--ruler-top, 40%); }
      .er-glass-bot { top: calc(var(--ruler-top, 40%) + var(--ruler-h, 80px)); bottom: 0; }
      /* ruler resize edges */
      .er-ruler::before, .er-ruler::after {
        content: ""; position: absolute; left: 0; right: 0; height: 10px; cursor: ns-resize; z-index: 16;
      }
      .er-ruler::before { top: 0; }
      .er-ruler::after  { bottom: 0; }
      /* ruler controls */
      .er-ruler-bar {
        position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        display: none; gap: 4px; z-index: 17; align-items: center;
      }
      .er-box.show-ruler .er-ruler-bar { display: flex; }
      .er-ruler-bar button {
        background: var(--er-tb); border: 1px solid rgba(128,128,128,.2);
        color: var(--er-fg); border-radius: 4px; padding: 2px 7px; font-size: .7rem;
        cursor: pointer; font-family: ui-monospace, monospace; opacity: .7;
      }
      .er-ruler-bar button:hover { opacity: 1; }
      /* glossary sidebar */
      #er-glos {
        width: 0; overflow: hidden; flex-shrink: 0;
        transition: width .25s; border-left: 1px solid rgba(128,128,128,.12);
        display: flex; flex-direction: column;
      }
      .er-box.show-glos #er-glos { width: 200px; }
      .er-glos-title { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; opacity: .45; padding: 12px 12px 6px; }
      .er-glos-item { display: flex; justify-content: space-between; padding: 3px 12px; font-size: .75rem; opacity: .7; font-family: ui-monospace, monospace; }
      /* library panel */
      #er-lib-panel {
        position: absolute; top: 0; right: 0; bottom: 0; width: 0; overflow: hidden;
        background: var(--er-tb); border-left: 1px solid rgba(128,128,128,.12);
        z-index: 18; transition: width .25s; display: flex; flex-direction: column;
      }
      .er-box.show-lib #er-lib-panel { width: 280px; }
      .er-lib-header { display: flex; align-items: center; gap: 6px; padding: 10px 12px; border-bottom: 1px solid rgba(128,128,128,.12); flex-shrink: 0; }
      .er-lib-tabs { display: flex; gap: 4px; padding: 8px 12px 4px; flex-shrink: 0; }
      .er-lib-tab { background: none; border: 1px solid rgba(128,128,128,.2); border-radius: 4px; padding: 3px 10px; font-size: .7rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .55; }
      .er-lib-tab.active { opacity: 1; border-color: var(--er-ruler); color: var(--er-ruler); }
      .er-lib-lang { display: flex; gap: 3px; padding: 0 12px 6px; flex-shrink: 0; }
      .er-lib-lang-btn { background: none; border: 1px solid rgba(128,128,128,.18); border-radius: 3px; padding: 2px 7px; font-size: .68rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .5; }
      .er-lib-lang-btn.active { opacity: 1; border-color: var(--er-fg); }
      .er-lib-list { flex: 1; overflow-y: auto; padding: 4px 0; }
      .er-lib-item { padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(128,128,128,.06); }
      .er-lib-item:hover { background: rgba(128,128,128,.08); }
      .er-lib-item-title { font-size: .78rem; font-weight: 600; margin-bottom: 2px; }
      .er-lib-item-author { font-size: .68rem; opacity: .5; font-family: ui-monospace, monospace; }
      .er-lib-empty { padding: 20px 12px; font-size: .75rem; opacity: .45; text-align: center; }
      .er-lib-back { background: none; border: none; cursor: pointer; font-size: .72rem; color: inherit; opacity: .5; padding: 0; font-family: ui-monospace, monospace; }
      .er-lib-back:hover { opacity: 1; }
      /* fio do verso */
      .er-fio-tabs { display: flex; flex-wrap: wrap; gap: 3px; padding: 4px 12px 6px; flex-shrink: 0; }
      .er-fio-tab { background: none; border: 1px solid rgba(128,128,128,.18); border-radius: 3px; padding: 2px 7px; font-size: .65rem; cursor: pointer; color: inherit; font-family: ui-monospace, monospace; opacity: .5; }
      .er-fio-tab.active { opacity: 1; }
      .er-fio-item { padding: 6px 12px; cursor: pointer; border-bottom: 1px solid rgba(128,128,128,.06); }
      .er-fio-item:hover { background: rgba(128,128,128,.08); }
      .er-fio-item .date { font-size: .62rem; opacity: .4; font-family: ui-monospace, monospace; }
      .er-fio-item .title { font-size: .75rem; }
      /* auto-scroll */
      #er-play.er-btn-on { color: var(--er-ruler); border-color: var(--er-ruler); }
      /* footer */
      #er-footer { text-align: center; padding: 6px; font-size: .68rem; opacity: .4; flex-shrink: 0; font-family: ui-monospace, monospace; }
    `,document.head.appendChild(n),t.innerHTML=`
      <div id="er-tb">
        <button id="er-close" title="Fechar (Esc)">\u2715</button>
        <div class="er-sep"></div>
        <button id="er-lib-btn" title="Biblioteca">biblioteca</button>
        <button id="er-back" title="Voltar ao meu texto" style="display:none">\u2190 meu texto</button>
        <div class="er-sep"></div>
        <button id="er-glos-btn" title="Gloss\xE1rio de frequ\xEAncia">gloss\xE1rio</button>
        <button id="er-ruler-btn" title="R\xE9gua de leitura (lupa)">r\xE9gua</button>
        <div class="er-spacer"></div>
        <button id="er-play" title="Auto-scroll (A)">\u25B6</button>
        <button id="er-spd-d" title="Mais lento">\u2212</button>
        <button id="er-spd-u" title="Mais r\xE1pido">+</button>
        <div class="er-sep"></div>
        <button id="er-fminus" title="Fonte menor (-)">A\u2212</button>
        <button id="er-fplus"  title="Fonte maior (+)">A+</button>
        <div class="er-sep"></div>
        <button id="er-mode" title="Alternar modo (M)">\u21C4 p\xE1gina</button>
        <button id="er-theme" title="Tema (T)">\u25D1 tema</button>
      </div>
      <div class="er-box er-scroll" id="er-box">
        <div id="er-body">
          <div id="er-viewer">
            <div class="er-glass er-glass-top"></div>
            <div class="er-glass er-glass-bot"></div>
            <div class="er-ruler" id="er-ruler-el">
              <div class="er-ruler-bar">
                <button id="er-ruler-close">fechar r\xE9gua</button>
              </div>
            </div>
            <div class="er-click er-click-l" id="er-prev"></div>
            <div class="er-click er-click-r" id="er-next"></div>
            <div id="er-content"></div>
          </div>
          <aside id="er-glos"><div class="er-glos-title">Frequ\xEAncia</div><div id="er-glos-list"></div></aside>
          <aside id="er-lib-panel">
            <div class="er-lib-header">
              <button class="er-lib-back" id="er-lib-back" style="display:none">\u2190 voltar</button>
              <span style="font-size:.75rem;opacity:.6;font-family:ui-monospace,monospace;flex:1">Biblioteca eskrev</span>
            </div>
            <div class="er-lib-tabs">
              <button class="er-lib-tab active" id="er-lib-tab-books">livros</button>
              <button class="er-lib-tab" id="er-lib-tab-fio">fio do verso</button>
            </div>
            <div class="er-lib-lang" id="er-lib-lang">
              <button class="er-lib-lang-btn active" data-lang="ptbr">PTBR</button>
              <button class="er-lib-lang-btn" data-lang="en">EN</button>
              <button class="er-lib-lang-btn" data-lang="es">ES</button>
              <button class="er-lib-lang-btn" data-lang="fr">FR</button>
            </div>
            <div id="er-fio-tabs" class="er-fio-tabs" style="display:none"></div>
            <div class="er-lib-list" id="er-lib-list"></div>
          </aside>
        </div>
        <div id="er-footer"></div>
      </div>
    `,document.body.appendChild(t);let s=t.querySelector("#er-box"),d=t.querySelector("#er-viewer"),c=t.querySelector("#er-content"),l=t.querySelector("#er-footer"),u=t.querySelector("#er-mode"),p=t.querySelector(".er-glass-top"),b=t.querySelector(".er-glass-bot"),g=t.querySelector("#er-ruler-el"),m=t.querySelector("#er-glos-list"),v=t.querySelector("#er-lib-list"),y=t.querySelector("#er-lib-lang"),E=t.querySelector("#er-fio-tabs"),f={mode:"scroll",themeIdx:0,page:0,total:1,fontSize:19,autoScroll:!1,autoRaf:null,autoSpeed:1,libMode:"user",userText:"",userScroll:0,libLang:"ptbr",libView:"books",themes:["er-t-paper","er-t-sepia","er-t-chumbo"],themeLabels:["paper","s\xE9pia","chumbo"]};function W(){return S(this,null,function*(){if(Sa)return Sa;try{Sa=(yield(yield fetch("src/library/books.json")).json()).books||[]}catch(C){Sa=[]}return Sa})}function Y(){return S(this,null,function*(){if(Ea)return Ea;try{Ea=yield(yield fetch("src/assets/fiodoverso/index.json")).json()}catch(C){Ea=null}return Ea})}function ae(){return S(this,null,function*(){v.innerHTML='<div class="er-lib-empty">carregando\u2026</div>';let F=(yield W()).filter(Z=>Z.language===f.libLang);if(!F.length){v.innerHTML='<div class="er-lib-empty">nenhum livro neste idioma</div>';return}v.innerHTML=F.map((Z,te)=>`<div class="er-lib-item" data-bi="${te}"><div class="er-lib-item-title">${w(Z.title)}</div><div class="er-lib-item-author">${w(Z.author)}</div></div>`).join(""),v.querySelectorAll(".er-lib-item").forEach(Z=>{Z.onclick=()=>S(null,null,function*(){f.libMode!=="library"&&(f.userScroll=c.scrollTop),f.libMode="library",t.querySelector("#er-back").style.display="",v.innerHTML='<div class="er-lib-empty">carregando\u2026</div>';let te=F[parseInt(Z.dataset.bi)];try{let de=yield(yield fetch(te.file)).text(),Ce=T(de);j(A(Ce),Ce)}catch(de){v.innerHTML='<div class="er-lib-empty">erro ao carregar</div>'}ae(),s.classList.remove("show-lib")})})})}function X(){return S(this,null,function*(){var F,Z;E.innerHTML="",v.innerHTML='<div class="er-lib-empty">carregando\u2026</div>';let C=yield Y();if(!((F=C==null?void 0:C.months)!=null&&F.length)){v.innerHTML='<div class="er-lib-empty">n\xE3o dispon\xEDvel</div>';return}C.months.forEach(te=>{let de=document.createElement("button");de.className="er-fio-tab",de.textContent=te.label||te.id,de.onclick=()=>{E.querySelectorAll(".er-fio-tab").forEach(Ce=>Ce.classList.remove("active")),de.classList.add("active"),ce(te)},E.appendChild(de)}),(Z=E.querySelector(".er-fio-tab"))==null||Z.classList.add("active"),ce(C.months[0])})}let fe=!1,M=null,se=0,le=0,We=0,Je=10;g.addEventListener("pointerdown",C=>{if(!s.classList.contains("show-ruler"))return;let F=g.getBoundingClientRect(),Z=C.clientY-F.top;Z<Je?M="top":Z>F.height-Je?M="bot":(fe=!0,M=null),se=C.clientY,le=g.offsetTop,We=g.offsetHeight,g.classList.add("dragging"),g.setPointerCapture(C.pointerId),C.preventDefault()}),g.addEventListener("pointermove",C=>{if(!fe&&!M)return;let F=d.getBoundingClientRect(),Z=C.clientY-se,te=F.height-44;if(M==="top"){let de=Math.max(44,We-Z),Ce=Math.min(te,Math.max(0,le+(We-de)));g.style.top=`${Ce}px`,g.style.height=`${de}px`}else M==="bot"?g.style.height=`${Math.max(44,We+Z)}px`:g.style.top=`${Math.max(0,Math.min(te,le+Z))}px`;G()}),g.addEventListener("pointerup",()=>{fe=!1,M=null,g.classList.remove("dragging")}),t.querySelector("#er-close").onclick=()=>{Be(),t.classList.remove("er-active")},t.querySelector("#er-mode").onclick=()=>H(f.mode==="page"?"scroll":"page"),t.querySelector("#er-theme").onclick=()=>{f.themeIdx=(f.themeIdx+1)%f.themes.length,O()},t.querySelector("#er-fminus").onclick=()=>P(-1),t.querySelector("#er-fplus").onclick=()=>P(1),t.querySelector("#er-prev").onclick=()=>ne(-1),t.querySelector("#er-next").onclick=()=>ne(1),t.querySelector("#er-play").onclick=()=>f.autoScroll?Be():pa(),t.querySelector("#er-spd-d").onclick=()=>{f.autoSpeed=Math.max(.2,+(f.autoSpeed-.3).toFixed(1))},t.querySelector("#er-spd-u").onclick=()=>{f.autoSpeed=Math.min(4,+(f.autoSpeed+.3).toFixed(1))},t.querySelector("#er-glos-btn").onclick=()=>{s.classList.toggle("show-glos"),t.querySelector("#er-glos-btn").classList.toggle("er-btn-on",s.classList.contains("show-glos"))},t.querySelector("#er-ruler-btn").onclick=()=>{let C=s.classList.toggle("show-ruler");if(t.querySelector("#er-ruler-btn").classList.toggle("er-btn-on",C),C){let F=d.getBoundingClientRect();g.style.top=`${Math.round(F.height*.38)}px`,g.style.height="80px",G()}},t.querySelector("#er-ruler-close").onclick=()=>{s.classList.remove("show-ruler"),t.querySelector("#er-ruler-btn").classList.remove("er-btn-on")},t.querySelector("#er-lib-btn").onclick=()=>{s.classList.toggle("show-lib")&&U(f.libView)},t.querySelector("#er-back").onclick=()=>{V(),s.classList.remove("show-lib")},t.querySelector("#er-lib-tab-books").onclick=()=>U("books"),t.querySelector("#er-lib-tab-fio").onclick=()=>U("fio"),y.querySelectorAll(".er-lib-lang-btn").forEach(C=>{C.onclick=()=>{f.libLang=C.dataset.lang,y.querySelectorAll(".er-lib-lang-btn").forEach(F=>F.classList.toggle("active",F===C)),ae()}}),d.addEventListener("scroll",R,{passive:!0}),window.addEventListener("resize",()=>{f.mode==="page"&&D()}),document.addEventListener("keydown",C=>{if(t.classList.contains("er-active")){if(C.key==="Escape"){Be(),t.classList.remove("er-active");return}(C.key==="m"||C.key==="M")&&H(f.mode==="page"?"scroll":"page"),(C.key==="t"||C.key==="T")&&(f.themeIdx=(f.themeIdx+1)%f.themes.length,O()),(C.key==="a"||C.key==="A")&&(f.autoScroll?Be():pa(),C.preventDefault()),(C.key==="+"||C.key==="=")&&P(1),(C.key==="-"||C.key==="_")&&P(-1),f.mode==="page"&&((C.key==="ArrowRight"||C.key==="ArrowDown")&&ne(1),(C.key==="ArrowLeft"||C.key==="ArrowUp")&&ne(-1))}});let Aa=document.body.dataset.theme||"paper";f.themeIdx=Aa==="chumbo"?2:0,O(),t._erS=f,t._erSetContent=j,t._erShowUser=V,t._erTextToHtml=A,t._erBuildGlossary=J}let r=t._erS;r.userText=o,r.userScroll=0,r.libMode="user",t.querySelector("#er-back").style.display="none",t._erSetContent(t._erTextToHtml(o),o),t.querySelector("#er-content").style.fontSize=r.fontSize+"px",t.classList.add("er-active");let i=t.querySelector("#er-box");i.classList.remove("show-glos","show-lib","show-ruler","er-btn-on"),i.className=i.className.replace(/\ber-(page|scroll)\b/g,"").trim()+" er-scroll",t.querySelector("#er-mode").textContent="\u21C4 p\xE1gina"}function Zs(e){let a=e.querySelector(".panelBody");if(!a)return;let o=(r,i)=>`<div class="hItem"><span class="hDesc">${r}</span><code class="hCmd">${i}</code></div>`,t=r=>`<div class="hGroup">${r}</div>`;a.innerHTML=`
    <div class="hSlice">
      <p class="hIntro">Todos os atalhos s\xE3o disparados com <code class="hInlineCmd">..</code> (dois pontos finais) seguido de uma letra. Digite diretamente no editor.</p>
      <div class="hList">
        ${t("Escrita")}
        ${o("ajuda e atalhos","..h")}
        ${o("modos de escrita","..m")}
        ${o("verificar e estat\xEDsticas","..v")}
        ${o("coordenador lingu\xEDstico","..c")}
        ${o("verifica\xE7\xE3o gramatical","..g")}
        ${o("verbete da palavra anterior","palavra..d")}
        ${t("Arquivos")}
        ${o("projetos e arquivos","..a")}
        ${o("salvar \xB7 exportar .skv","..s")}
        ${o("importar .skv","..i")}
        ${o("enviar para celular (QR)","..q")}
        ${t("Ferramentas")}
        ${o("notas laterais","..n")}
        ${o("criar post-it","..p")}
        ${o("modo leitura","..r")}
        ${o("foco \xB7 pomodoro","..f")}
        ${o("alternar tema","..t")}
        ${t("Teclado")}
        ${o("salvar","Ctrl+S")}
      </div>
    </div>
  `}function en(e,a){let o=a.querySelector(".panelBody"),t=a.querySelector(".sliceMeta");if(!o)return;let r=Tr(),i=Ws(r),n=Fa(r);t&&(t.textContent=`${i.words} palavras \xB7 calculando hash\u2026`);let s=a.dataset.sliceId||"v",d=`vFile-${s}`,c=`vResult-${s}`,l=`vHash-${s}`,u=`vGen-${s}`;o.innerHTML=`
    <div class="vSlice">
      <section class="vSection">
        <div class="vSectionTitle">Texto</div>
        <div class="vGrid">
          <div class="vRow"><span class="vLabel">Palavras</span><span class="vVal">${i.words.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Caracteres</span><span class="vVal">${i.chars.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Sem espa\xE7os</span><span class="vVal">${i.charsNoSpaces.toLocaleString("pt-BR")}</span></div>
          <div class="vRow"><span class="vLabel">Frases</span><span class="vVal">${i.sentences}</span></div>
          <div class="vRow"><span class="vLabel">Par\xE1grafos</span><span class="vVal">${i.paragraphs}</span></div>
          <div class="vRow"><span class="vLabel">Leitura estimada</span><span class="vVal">${i.readTime}</span></div>
          <div class="vRow"><span class="vLabel">Densidade lexical</span><span class="vVal">${i.lexDensity}</span></div>
          ${i.longestWord?`<div class="vRow"><span class="vLabel">Palavra + longa</span><span class="vVal">${Ee(i.longestWord)}</span></div>`:""}
        </div>
      </section>
      ${n.resumo?`
      <section class="vSection">
        <div class="vSectionTitle">Estilo</div>
        <div class="vGrid">
          <div class="vRow"><span class="vLabel">Adv\xE9rbios -mente</span><span class="vVal">${n.resumo.densidadeMente}%</span></div>
          <div class="vRow"><span class="vLabel">Vozes passivas</span><span class="vVal">${n.resumo.totalPassiva}</span></div>
          <div class="vRow"><span class="vLabel">M\xE9dia palavras/frase</span><span class="vVal">${n.resumo.mediaWordsPorSentenca}</span></div>
        </div>
        ${n.alertas.length?`
        <div class="vStyleAlerts">
          ${n.alertas.slice(0,5).map(g=>`
            <div class="vStyleAlert vStyleAlert--${g.nivel.toLowerCase()}">
              <span class="vAlertNivel">${g.nivel}</span>
              <span class="vAlertMsg">${Ee(g.mensagem)} <span class="vAlertPar">(\xA7${g.paragrafo+1})</span></span>
            </div>
          `).join("")}
          ${n.alertas.length>5?`<div class="vStyleMore">+${n.alertas.length-5} alertas no painel de an\xE1lise</div>`:""}
        </div>`:'<p class="vNote">Densidade dentro do esperado.</p>'}
      </section>`:""}
      ${(()=>{let g=hr();if(!g.ttfr&&!g.ttfa)return"";let m=g.status?` vPerfVal--${g.status}`:"";return`
      <section class="vSection">
        <div class="vSectionTitle">Performance</div>
        <div class="vGrid">
          ${g.ttfrFmt?`<div class="vRow"><span class="vLabel">Editor pronto</span><span class="vVal">${g.ttfrFmt}</span></div>`:""}
          ${g.ttfaFmt?`<div class="vRow"><span class="vLabel">Primeira a\xE7\xE3o</span><span class="vVal${m}">${g.ttfaFmt}</span></div>`:""}
        </div>
      </section>`})()}
      <section class="vSection">
        <div class="vSectionTitle">Anterioridade</div>
        <div class="vGrid">
          <div class="vRow"><span class="vLabel">Hash SHA-256</span><span class="vVal vHash" id="${l}" title="Clique para copiar">calculando\u2026</span></div>
          <div class="vRow"><span class="vLabel">Gerado em</span><span class="vVal" id="${u}">\u2014</span></div>
        </div>
        <p class="vNote">Este hash \xE9 uma impress\xE3o digital do texto agora. Se uma v\xEDrgula mudar, o hash muda. Exporte como .skv para registrar com timestamp.</p>
      </section>
      <section class="vSection vSection--tool">
        <div class="vSectionTitle">Verificar arquivo</div>
        <p class="vNote">Suba um .skv para confirmar se o conte\xFAdo n\xE3o foi alterado ap\xF3s a exporta\xE7\xE3o.</p>
        <label class="vFileLabel">
          <input type="file" class="vFileInput" id="${d}" accept=".skv,.json" tabindex="-1" />
          <span class="vFileBtn">Escolher .skv</span>
        </label>
        <div class="vVerifyResult" id="${c}" style="display:none"></div>
      </section>
    </div>
  `,_r(r).then(g=>{let m=o.querySelector(`#${l}`),v=o.querySelector(`#${u}`);if(m){let y=g?`${g.slice(0,12)}\u2026${g.slice(-8)}`:"\u2014";m.textContent=y,m.title=g?`SHA-256: ${g}

Clique para copiar`:"",m.addEventListener("click",()=>{var E;g&&((E=navigator.clipboard)==null||E.writeText(g).then(()=>{m.classList.add("copied"),m.textContent="copiado \u2713",setTimeout(()=>{m.textContent=y,m.classList.remove("copied")},1600)}))})}v&&(v.textContent=new Date().toLocaleString("pt-BR")),t&&(t.textContent=`${i.words} palavras \xB7 hash: ${g.slice(0,8)}\u2026`)});let p=o.querySelector(`#${d}`),b=o.querySelector(`#${c}`);p&&b&&p.addEventListener("change",()=>{var y;let g=(y=p.files)==null?void 0:y[0];if(!g)return;let m=o.querySelector(".vFileBtn");m&&(m.textContent="verificando\u2026");let v=new FileReader;v.onload=E=>S(null,null,function*(){var f;try{let w=JSON.parse(((f=E.target)==null?void 0:f.result)||"{}"),O=yield Js(w);b.className=`vVerifyResult ${O.status}`,b.textContent=O.msg,b.style.display="",m&&(m.textContent="Escolher .skv")}catch(w){b.className="vVerifyResult fail",b.textContent="Arquivo inv\xE1lido ou corrompido.",b.style.display="",m&&(m.textContent="Escolher .skv")}p.value=""}),v.readAsText(g,"utf-8")})}function an(e,a){let o=a.querySelector(".panelBody"),t=a.querySelector(".sliceMeta");if(!o)return;t&&(t.textContent="verificando chave\u2026");let r=a.dataset.sliceId||"auth",i=`authMsg-${r}`;function n(c,l,u="info"){c.textContent=l,c.className=`auth-msg auth-msg--${u}`,c.style.display=l?"":"none"}function s(){t&&(t.textContent="Authoria \xB7 sem chave"),o.innerHTML=`
      <div class="auth-slice">
        <p class="auth-intro">Nenhuma chave de autor encontrada. Crie uma chave para assinar seus arquivos .skv com ECDSA P-256.</p>
        <div class="auth-form">
          <label class="auth-label">Senha da chave
            <input type="password" class="auth-input" id="authPwd-${r}" placeholder="m\xEDnimo 8 caracteres" autocomplete="new-password" />
          </label>
          <label class="auth-label">Confirmar senha
            <input type="password" class="auth-input" id="authPwd2-${r}" placeholder="repita a senha" autocomplete="new-password" />
          </label>
          <p id="${i}" class="auth-msg" style="display:none"></p>
          <button type="button" class="auth-btn auth-btn--primary" id="authGenBtn-${r}">Gerar chave</button>
        </div>
        <p class="auth-note">A chave privada \xE9 cifrada com sua senha e fica somente neste navegador (IndexedDB). Nunca sai do seu dispositivo.</p>
      </div>
    `;let c=o.querySelector(`#authPwd-${r}`),l=o.querySelector(`#authPwd2-${r}`),u=o.querySelector(`#${i}`),p=o.querySelector(`#authGenBtn-${r}`);p.addEventListener("click",()=>S(null,null,function*(){let b=c.value.trim(),g=l.value.trim();if(b.length<8){n(u,"A senha deve ter pelo menos 8 caracteres.","error");return}if(b!==g){n(u,"As senhas n\xE3o coincidem.","error");return}p.disabled=!0,p.textContent="Gerando\u2026";try{yield tr(b),d()}catch(m){n(u,`Erro: ${m.message}`,"error"),p.disabled=!1,p.textContent="Gerar chave"}})),requestAnimationFrame(()=>c==null?void 0:c.focus())}function d(){t&&(t.textContent="Authoria \xB7 chave ativa"),o.innerHTML=`
      <div class="auth-slice">
        <div class="auth-status">
          <span class="auth-status-dot"></span>
          <span class="auth-status-label">Chave de autor ativa</span>
        </div>
        <div class="auth-form auth-form--sign">
          <label class="auth-label">Senha para assinar
            <input type="password" class="auth-input" id="authSign-${r}" placeholder="senha da chave" autocomplete="current-password" />
          </label>
          <p id="${i}" class="auth-msg" style="display:none"></p>
          <button type="button" class="auth-btn auth-btn--primary" id="authSignBtn-${r}">\u270E Assinar e exportar .skv</button>
        </div>
        <div class="auth-actions">
          <button type="button" class="auth-btn auth-btn--ghost" id="authCertBtn-${r}">\u2B07 Baixar certificado p\xFAblico</button>
        </div>
        <p class="auth-note">O certificado p\xFAblico (.authoria-pub.json) pode ser compartilhado para que outros verifiquem sua assinatura.</p>
      </div>
    `;let c=o.querySelector(`#authSign-${r}`),l=o.querySelector(`#authSignBtn-${r}`),u=o.querySelector(`#authCertBtn-${r}`),p=o.querySelector(`#${i}`);l.addEventListener("click",()=>S(null,null,function*(){var g;let b=c.value;if(!b){n(p,"Digite a senha da chave.","error");return}l.disabled=!0,l.textContent="Assinando\u2026",n(p,"","info");try{let m=yield ha(b);n(p,`Assinado e exportado: ${m}`,"ok"),(g=e.setStatus)==null||g.call(e,`authoria: exportado ${m}`),c.value=""}catch(m){n(p,`Erro: ${m.message}`,"error")}finally{l.disabled=!1,l.textContent="\u270E Assinar e exportar .skv"}})),u.addEventListener("click",()=>S(null,null,function*(){var y;let b=yield sr();if(!b){n(o.querySelector(`#${i}`),"Nenhuma chave para exportar.","error");return}let g=new Blob([JSON.stringify(b,null,2)],{type:"application/json"}),m=URL.createObjectURL(g),v=document.createElement("a");v.href=m,v.download="authoria-pub.json",document.body.appendChild(v),v.click(),document.body.removeChild(v),setTimeout(()=>URL.revokeObjectURL(m),3e3),(y=e.setStatus)==null||y.call(e,"authoria: certificado p\xFAblico baixado")})),requestAnimationFrame(()=>c==null?void 0:c.focus())}rr().then(c=>{c?d():s()}).catch(()=>s())}function Ja(e,a,o,t){var g,m,v,y,E,f,w,O,R,D,ne,H,P,J,A,T,j,V,W,Y,ae,X,ce,U,G,fe,M,se,le,We,Je,Be,pa,Aa,C,F,Z,te,de,Ce,lt,dt;let r=`--${o}`,i=$a(a),n=t!=null?t:Oa(i,r),s=String(o||"").toLowerCase(),d=(x,q="")=>{var $,k,N;let h=(N=(k=($=e.integrations)==null?void 0:$.modalTransplant)==null?void 0:k.resolveCommand)==null?void 0:N.call(k,x,q);if(!h)return null;let I=ie(e,{badge:"10",title:"TRANSPLANT",kindKey:"consult",meta:`--${s} \u2022 carregando modal legado`,body:"Lendo fullm.html e convertendo modal para corte..."});return h.then(B=>{if(!B)return;ee(I,{meta:B.meta,body:B.body});let _=I.querySelector(".badge");_&&(_.innerHTML=`<strong>${Ee(B.badge||"10")}</strong> <span>${Ee(B.title||"TRANSPLANT")}</span>`)}),I},c=x=>ie(e,xe({focusScroll:"heavy"},x)),l=(x="")=>{var $,k,N;let q=String(x||"").trim().toLowerCase(),h=c({badge:"14",title:"WRITER",kindKey:"consult",meta:q?`persona: ${q} \u2022 carregando`:"personas de escrita",body:q?"Lendo persona...":"Selecione uma persona abaixo."}),I=B=>{var Q,z,oe;let _=String(B||"").trim().toLowerCase();_&&(ee(h,{meta:`persona: ${_} \u2022 carregando`,body:"Lendo templates do legado..."}),(oe=(z=(Q=e.integrations)==null?void 0:Q.personaTransplant)==null?void 0:z.resolve)==null||oe.call(z,_).then(re=>{var be;if(!re){ee(h,{meta:`persona: ${_} \u2022 n\xE3o encontrada`,body:"Persona n\xE3o encontrada."});return}let K=[];for(let pe of re.templates||[])K.push(Mo(pe.text||"(vazio)")),K.push("");ee(h,{meta:`persona: ${re.id} \u2022 ${((be=re.templates)==null?void 0:be.length)||0} template(s)`,body:K.join(`
`).trim()||"(sem conte\xFAdo)"})}).catch(re=>{ee(h,{meta:`persona: ${_} \u2022 falha`,body:`Falha ao carregar persona.

${(re==null?void 0:re.message)||String(re)}`})}))};return q?(I(q),h):((N=(k=($=e.integrations)==null?void 0:$.personaTransplant)==null?void 0:k.list)==null||N.call(k).then(B=>{let _=h.querySelector(".panelBody");if(!_)return;let Q=(B||[]).map(z=>String((z==null?void 0:z.id)||"").trim()).filter(Boolean);if(!Q.length){_.innerHTML="<p>Sem personas dispon\xEDveis.</p>";return}_.innerHTML=`
        <div class="writerPersonaList" role="list">
          ${Q.map(z=>`<button type="button" class="writerPersonaItem" data-persona="${Ee(z)}">${Ee(z)}</button>`).join("")}
        </div>
        <p>Atalho direto: <code>conto ..w</code>, <code>poesia ..w</code>...</p>
      `,_.querySelectorAll(".writerPersonaItem").forEach(z=>{z.addEventListener("click",()=>{let oe=z.getAttribute("data-persona")||"";I(oe)})})}).catch(B=>{ee(h,{meta:"personas \u2022 falha",body:`Falha ao listar personas.

${(B==null?void 0:B.message)||String(B)}`})}),h)};if(s==="b"||s==="buscar"){let N=function(){document.querySelectorAll(`.${h}`).forEach(K=>K.replaceWith(document.createTextNode(K.textContent))),$=[],k=-1},B=function(K){if(N(),!K)return;let be=e.state.pages||document.querySelectorAll(".pageContent"),pe=new RegExp(K.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"gi");be.forEach(ve=>{let Te=document.createTreeWalker(ve,NodeFilter.SHOW_TEXT,{acceptNode(Se){var Me,Le;return(Me=Se.parentElement)!=null&&Me.closest(".slice")||((Le=Se.parentElement)==null?void 0:Le.tagName)==="MARK"?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),Ye=[],Qe;for(;Qe=Te.nextNode();)Ye.push(Qe);Ye.forEach(Se=>{let Me=Se.textContent,Le;pe.lastIndex=0;let Oe=[],He=0;for(;(Le=pe.exec(Me))!==null;){Le.index>He&&Oe.push(document.createTextNode(Me.slice(He,Le.index)));let Ca=document.createElement("mark");Ca.className=h,Ca.textContent=Le[0],Oe.push(Ca),$.push(Ca),He=Le.index+Le[0].length}Oe.length&&(He<Me.length&&Oe.push(document.createTextNode(Me.slice(He))),Se.replaceWith(...Oe))})})},_=function(K){var be;$.length&&((be=$[k])==null||be.classList.remove(I),k=(K%$.length+$.length)%$.length,$[k].classList.add(I),$[k].scrollIntoView({block:"center",behavior:"smooth"}),Q())},Q=function(){let K=document.getElementById("eskrev-search-status");K&&(K.textContent=$.length?`${k+1} / ${$.length} resultado${$.length!==1?"s":""}`:oe!=null&&oe.value?"nenhum resultado":"")},x=c({badge:"01",title:"BUSCAR",kindKey:"consult",meta:"busca no texto"}),q=(g=x==null?void 0:x.querySelector)==null?void 0:g.call(x,".panelBody");if(!q)return x;q.innerHTML=`
      <div style="display:grid;gap:10px">
        <input id="eskrev-search-input" type="search" placeholder="buscar no texto\u2026"
          style="width:100%;box-sizing:border-box;border:1px solid rgba(0,0,0,.18);border-radius:6px;
                 background:rgba(255,255,255,.6);color:rgba(0,0,0,.82);padding:8px 10px;font:inherit;
                 font-size:14px;outline:none;" autocomplete="off" spellcheck="false" />
        <div id="eskrev-search-status" style="font-size:10px;color:rgba(0,0,0,.4);letter-spacing:.05em;min-height:1em"></div>
      </div>
    `;let h="eskrev-search-mark",I="eskrev-search-mark-active";if(!document.getElementById("eskrev-search-style")){let K=document.createElement("style");K.id="eskrev-search-style",K.textContent=`
        .${h} { background: rgba(196,84,42,.18); border-radius: 2px; }
        .${I} { background: rgba(196,84,42,.48); outline: 1px solid rgba(196,84,42,.6); }
      `,document.head.appendChild(K)}let $=[],k=-1,z,oe=q.querySelector("#eskrev-search-input");oe==null||oe.addEventListener("input",()=>{clearTimeout(z),z=setTimeout(()=>{B(oe.value.trim()),$.length?_(0):Q()},180)}),oe==null||oe.addEventListener("keydown",K=>{K.key==="Enter"&&(K.preventDefault(),_(K.shiftKey?k-1:k+1)),K.key==="Escape"&&(N(),oe.value="",Q())});let re=new MutationObserver(()=>{x.isConnected||(N(),re.disconnect())});return re.observe(document.body,{childList:!0,subtree:!0}),requestAnimationFrame(()=>oe==null?void 0:oe.focus()),x}if(s==="s"||s==="exportar")return ha().then(x=>{var q;return(q=e.setStatus)==null?void 0:q.call(e,`salvo: ${x}`)}),null;if(s==="n"||s==="notas"){let x=document.getElementById("notesSidebar");if(x){x.classList.toggle("is-open");let q=x.classList.contains("is-open");if(q&&((m=document.getElementById("filesSidebar"))==null||m.classList.remove("is-open")),(v=e.setStatus)==null||v.call(e,q?"notas: aberto":"notas: fechado"),q){let h=x.querySelector(".notes-search-input");h==null||h.focus()}return null}return null}if(s==="a"||s==="arquivos"){let x=document.getElementById("filesSidebar");if(x){x.classList.toggle("is-open");let q=x.classList.contains("is-open");if(q&&((y=document.getElementById("notesSidebar"))==null||y.classList.remove("is-open")),(E=e.setStatus)==null||E.call(e,q?"arquivos: aberto":"arquivos: fechado"),q){let h=document.getElementById("mesaNewBtn");h==null||h.focus()}return null}return null}if(s==="i"||s==="importar"){let x=document.getElementById("mesaFileInput");return x?(x.click(),null):c({badge:"04",title:"IMPORTAR",kindKey:"consult",meta:"importa\xE7\xE3o",body:"Input de arquivo n\xE3o encontrado."})}if(s==="books")return c({badge:"05",title:"BOOKS",kindKey:"consult",meta:"cat\xE1logo",body:"Books est\xE1 em transplante. Em breve aqui no corte."});if(s==="v"||s==="verificacao"||s==="verifica\xE7\xE3o"){let x=c({badge:"07",title:"VERIFICA\xC7\xC3O",kindKey:"consult",meta:"calculando\u2026",body:" ",focusScroll:"heavy"});return x.dataset.liveVerify="1",en(e,x),x}if(s==="authoria"||s==="auth"||s==="assinar"){let x=c({badge:"AU",title:"AUTHORIA",kindKey:"consult",meta:"verificando chave\u2026",body:" ",focusScroll:"light"});return an(e,x),x}if(s==="f"||s==="foco"||s==="pomodoro"||s==="pomo")return Qs(),null;if(s==="hardreset")return(O=(w=(f=e.integrations)==null?void 0:f.persistence)==null?void 0:w.clear)==null||O.call(w,a),c({badge:"09",title:"HARD RESET",kindKey:"unknown",meta:"estado local limpo",body:"Persist\xEAncia local limpa em modo seguro."});if(s==="l"||s==="idioma"){let x="eskrev:index2:lang",q=["pt-BR","en-GB","es-ES","fr-FR"],h=q[0];try{let I=localStorage.getItem(x)||q[0],$=q.indexOf(I);h=q[($+1)%q.length]||q[0],localStorage.setItem(x,h)}catch(I){}return c({badge:"10",title:"IDIOMA",kindKey:"help",meta:`idioma ativo: ${h}`,body:`Idiomas: ${q.join(" \u2022 ")}`})}if(s==="t")return(D=(R=e.theme)==null?void 0:R.cycle)==null||D.call(R),null;if(s==="p"||s==="postit"||s==="note"){let x=c({badge:"06",title:"POST-IT",kindKey:"consult",meta:"captura r\xE1pida",body:""});return qt(e,x),x}if(s==="r"||s==="reader")return Er("modo leitor",()=>Xs()),null;if(s==="writer")return l(n);if(s==="d"){let x=n||"?",q=ie(e,{badge:"DEF",title:"VERBETE",kindKey:"help",meta:x.toLowerCase(),body:"Consultando corpus\u2026"});return jt(x).then(h=>{if(!h){ee(q,{meta:x.toLowerCase(),body:`"${x}" n\xE3o encontrado no corpus local.`});return}ee(q,{meta:h.label?`${h.label}`:x.toLowerCase(),body:h.body})}).catch(()=>{ee(q,{meta:"erro",body:"Falha ao consultar o corpus."})}),q}if(s==="m"){let x=[{id:"conto",label:"Conto",desc:"Narrativa breve, tens\xE3o e corte."},{id:"romance",label:"Romance",desc:"Arco longo, personagens, mundos."},{id:"cronica",label:"Cr\xF4nica",desc:"Cotidiano, voz e tempo presente."},{id:"poesia",label:"Poesia",desc:"Imagem, ritmo, sil\xEAncio."},{id:"ensaio",label:"Ensaio",desc:"Argumento, reflex\xE3o, forma aberta."},{id:"roteiro",label:"Roteiro",desc:"Cena, di\xE1logo, a\xE7\xE3o visual."},{id:"enem",label:"Enem",desc:"Reda\xE7\xE3o dissertativa-argumentativa."},{id:"universitario",label:"Universit\xE1rio",desc:"Texto acad\xEAmico, ABNT."}],q=c({badge:"M",title:"MODOS",kindKey:"consult",meta:"modos de escrita",body:" "}),h=q.querySelector(".panelBody");return h&&(h.innerHTML=`
        <div class="modosSliceList">
          ${x.map(I=>`
            <button type="button" class="modosSliceItem" data-modo="${Ee(I.id)}">
              <span class="modosSliceLabel">${Ee(I.label)}</span>
              <span class="modosSliceDesc">${Ee(I.desc)}</span>
            </button>
          `).join("")}
        </div>
      `,h.querySelectorAll(".modosSliceItem").forEach(I=>{I.addEventListener("click",()=>{var Q,z,oe;let $=I.getAttribute("data-modo")||"",k=document.getElementById("modosSidebar"),N=document.getElementById("modosTitle"),B=document.getElementById("modosContent");if(!k||!B)return;h.querySelectorAll(".modosSliceItem").forEach(re=>re.classList.remove("is-active")),I.classList.add("is-active");let _=x.find(re=>re.id===$);N&&(N.textContent=((_==null?void 0:_.label)||$).toUpperCase()),B.innerHTML='<p class="modos-loading">Carregando\u2026</p>',k.classList.add("is-open"),k.setAttribute("aria-hidden","false"),(oe=(z=(Q=e.integrations)==null?void 0:Q.personaTransplant)==null?void 0:z.resolve)==null||oe.call(z,$).then(re=>{var be;if(!re||!((be=re.templates)!=null&&be.length)){B.innerHTML=ma((_==null?void 0:_.desc)||"Modo n\xE3o encontrado.");return}let K=re.templates.map(pe=>Mo(pe.text||"")).join(`

---

`);B.innerHTML=ma(K)||ma((_==null?void 0:_.desc)||""),Vs(B)}).catch(()=>{B.innerHTML=ma((_==null?void 0:_.desc)||"Falha ao carregar modo.")})})})),q}if(s==="w"){let x=e.state.wcActive,q=ie(e,{badge:"W",title:"CLASSES",kindKey:"help",meta:x?"desativando\u2026":"carregando l\xE9xico\u2026",body:x?"Removendo cores do texto.":"Aguarde \u2014 carregando l\xE9xico de portugu\xEAs."});return Pt(e).then(()=>{var oe;let h=e.state.wcActive,I=h?10:5;if(ee(q,{meta:h?"ativo":"inativo",body:h?" ":"Modo desativado."}),h){let re=q.querySelector(".panelBody");if(re){let K='<span style="opacity:.4"> \xB7 </span>',be="<br>",pe=(ve,Te)=>`<strong class="wc-${ve}" style="font-weight:700">${Te}</strong>`;re.innerHTML='<p style="margin-bottom:.6em;font-weight:600">Cores ativas no texto.</p><p style="line-height:1.9">'+pe("verb","VERB")+K+pe("subst","SUBST")+K+pe("adj","ADJ")+K+pe("adv","ADV")+K+pe("pron","PRON")+be+pe("art","ART")+K+pe("prep","PREP")+K+pe("conj","CONJ")+K+pe("num","NUM")+K+pe("intj","INTJ")+'</p><p style="opacity:.6;margin-top:.6em">Passe o mouse sobre uma palavra para ver a classe.<br>Digite ..w novamente para desativar.</p>'}}let $=13,k=+(2*Math.PI*$).toFixed(3),N=document.createElement("div");N.className="wcCountdown",N.innerHTML=`<svg viewBox="0 0 32 32" width="32" height="32"><circle class="wcc-track" cx="16" cy="16" r="${$}"/><circle class="wcc-fill" cx="16" cy="16" r="${$}" stroke-dasharray="${k}" stroke-dashoffset="0"/><text class="wcc-num" x="16" y="16">${I}</text></svg>`,(oe=q.querySelector(".sliceCard"))==null||oe.appendChild(N);let B=N.querySelector(".wcc-fill"),_=N.querySelector(".wcc-num"),Q=I-1,z=setInterval(()=>{if(!q.isConnected){clearInterval(z);return}if(Q<=0){clearInterval(z),q.remove();return}let re=Q/I;B&&(B.style.strokeDashoffset=String(+(k*(1-re)).toFixed(3))),_&&(_.textContent=String(Q)),Q--},1e3)}),q}if(s==="c")return Er("inspe\xE7\xE3o lingu\xEDstica",()=>Ba(e)),null;if(s==="h"||s==="help"){let x=c({badge:"01",title:"MENU",kindKey:"help",meta:"atalhos e comandos",body:" ",focusScroll:"heavy"});return Zs(x),x}if(s==="q"){let x=c({badge:"06",title:"CELULAR",kindKey:"qr",meta:"enviar por QR code",body:" ",focusScroll:"heavy"}),q=x.querySelector(".panelBody");return q&&(q.innerHTML=xr()),Sr(x),x}if(s==="o"||s==="modals"){let x=((P=(H=(ne=e.integrations)==null?void 0:ne.modalTransplant)==null?void 0:H.list)==null?void 0:P.call(H))||[],q=[];return q.push("Pacote modalTransplant"),q.push(""),x.length?x.forEach(h=>q.push(`\u2022 --${h.cmd}  ${h.title}  (${h.id})`)):q.push("Nenhum modal mapeado."),ie(e,{badge:"10",title:"TRANSPLANT",kindKey:"help",meta:"invent\xE1rio legado",body:q.join(`
`)})}let u=x=>{var I,$,k;let q=(x||"").trim().toLowerCase(),h=ie(e,{badge:"50",title:"PERSONA",kindKey:"consult",meta:q?`persona: ${q} \u2022 carregando`:"persona: informe uma persona",body:q?"Lendo templates do legado...":"Use: `conto ..persona` (ou romance/roteiro/ensaio/universitario/enem/poesia).",focusScroll:"heavy"});return q&&((k=($=(I=e.integrations)==null?void 0:I.personaTransplant)==null?void 0:$.resolve)==null||k.call($,q).then(N=>{var _;if(!N){ee(h,{meta:`persona: ${q} \u2022 n\xE3o encontrada`,body:"Persona n\xE3o encontrada no legado."});return}let B=[];for(let Q of N.templates||[])B.push(Mo(Q.text||"(vazio)")),B.push("");ee(h,{meta:`persona: ${N.id} \u2022 ${((_=N.templates)==null?void 0:_.length)||0} template(s)`,body:B.join(`
`).trim()||"(sem conte\xFAdo)"})}).catch(N=>{ee(h,{meta:`persona: ${q} \u2022 falha`,body:`Falha ao carregar persona.

${(N==null?void 0:N.message)||String(N)}`})})),h};if(s==="persona")return u(n);if(s==="templates"){let x=ie(e,{badge:"52",title:"TEMPLATES",kindKey:"consult",meta:"invent\xE1rio \u2022 carregando",body:"Lendo templates do legado...",focusScroll:"heavy"});return(T=(A=(J=e.integrations)==null?void 0:J.personaTransplant)==null?void 0:A.listTemplates)==null||T.call(A).then(q=>{let h=[];h.push(`Templates dispon\xEDveis: ${(q==null?void 0:q.length)||0}`),h.push(""),(q||[]).forEach(I=>{h.push(`- ${I.id}  (${I.persona})`)}),ee(x,{meta:"invent\xE1rio de templates",body:h.join(`
`)})}).catch(q=>{ee(x,{meta:"templates \u2022 falha",body:`Falha ao carregar templates.

${(q==null?void 0:q.message)||String(q)}`})}),x}if(s==="template"||s==="guide"){let x=(n||"").trim().toLowerCase(),q=ie(e,{badge:"53",title:"TEMPLATE",kindKey:"consult",meta:x?`template: ${x} \u2022 carregando`:"template: informe o id/persona",body:x?"Lendo template...":"Use: `conto ..template` ou `romance-capitulo ..template`.",focusScroll:"heavy"});return x&&((W=(V=(j=e.integrations)==null?void 0:j.personaTransplant)==null?void 0:V.resolveTemplate)==null||W.call(V,x).then(h=>{if(!h){ee(q,{meta:`template: ${x} \u2022 n\xE3o encontrado`,body:"Template n\xE3o encontrado no legado."});return}ee(q,{meta:`template: ${h.id} \u2022 persona ${h.persona}`,body:h.text||"(sem conte\xFAdo)"})}).catch(h=>{ee(q,{meta:`template: ${x} \u2022 falha`,body:`Falha ao carregar template.

${(h==null?void 0:h.message)||String(h)}`})})),q}if(s==="figures"){let x=(n||"").trim().toLowerCase(),q=ie(e,{badge:"51",title:"FIGURES",kindKey:"consult",meta:x?`figuras: ${x} \u2022 carregando`:"figuras \u2022 carregando",body:"Lendo base de figuras de linguagem do legado...",focusScroll:"heavy"});return(X=(ae=(Y=e.integrations)==null?void 0:Y.figuresTransplant)==null?void 0:ae.resolve)==null||X.call(ae,x).then(h=>{var $;if(!h){ee(q,{meta:"figuras \u2022 indispon\xEDvel",body:"N\xE3o foi poss\xEDvel carregar figuras."});return}let I=[];I.push(h.persona?`Persona: ${h.persona}`:"Persona: todas"),I.push("");for(let k of h.tabs||[]){I.push(`## ${k.label||k.id}`);for(let N of k.items||[])I.push(`### ${N.title||N.id}`),N.recognize&&I.push(`- Reconhecer: ${N.recognize}`),N.definition&&I.push(`- Defini\xE7\xE3o: ${N.definition}`),N.example_use&&I.push(`- Uso: ${N.example_use}`),N.example_interpret&&I.push(`- Interpreta\xE7\xE3o: ${N.example_interpret}`),N.not_confuse&&I.push(`- N\xE3o confundir: ${N.not_confuse}`),I.push("---")}ee(q,{meta:`figuras \u2022 ${(($=h.tabs)==null?void 0:$.length)||0} aba(s)`,body:I.join(`
`).trim()||"(sem conte\xFAdo)"})}).catch(h=>{ee(q,{meta:"figuras \u2022 falha",body:`Falha ao carregar figuras.

${(h==null?void 0:h.message)||String(h)}`})}),q}if(s==="theme"){let x=((U=(ce=e.theme)==null?void 0:ce.cycle)==null?void 0:U.call(ce))||"paper";return ie(e,{badge:"11",title:"THEME",kindKey:"help",meta:`tema aplicado: ${x}`,body:`Tema alterado para **${x}**.`})}if(s==="dark"||s==="light"){let x=s==="dark"?"ink":"paper",q=((fe=(G=e.theme)==null?void 0:G.set)==null?void 0:fe.call(G,x))||x;return ie(e,{badge:"11",title:"THEME",kindKey:"help",meta:`tema aplicado: ${q}`,body:`Comando legado \`--${s}\` aplicado para **${q}**.`})}if(s==="zen"||s==="fs"||s==="mode"){document.body.classList.toggle("zenMode");let x=document.body.classList.contains("zenMode");return ie(e,{badge:"12",title:"VIEW",kindKey:"help",meta:x?"modo foco ativado":"modo foco desativado",body:"Compatibilidade do legado aplicada no layout novo."})}if(s==="overview"||s==="thumbs")return d("overview",s)||ie(e,{badge:"12",title:"VIEW",kindKey:"help",meta:"overview",body:"Vis\xE3o geral indispon\xEDvel no momento."});if(s==="save"||s==="open"||s==="pomo"||s==="qr"||s==="mini"||s==="music")return d(s,s)||ie(e,{badge:"10",title:"TRANSPLANT",kindKey:"consult",meta:`--${s}`,body:"Modal legado indispon\xEDvel."});if(s==="mute"||s==="unmute"){let x=s==="mute";try{localStorage.setItem("skrv_sfx_muted",x?"true":"false")}catch(q){}return ie(e,{badge:"13",title:"AUDIO",kindKey:"help",meta:x?"\xE1udio mutado":"\xE1udio reativado",body:`Comando legado \`--${s}\` aplicado.`})}if(s==="visitas"){let x=0;try{x=Number.parseInt(localStorage.getItem("skrv_dedication_enter_count")||"0",10)||0}catch(q){}return ie(e,{badge:"14",title:"VISITAS",kindKey:"consult",meta:"contador da dedicat\xF3ria legado",body:`ENTER na dedicat\xF3ria: **${x}**`})}if(s==="reset")return(le=(se=(M=e.integrations)==null?void 0:M.persistence)==null?void 0:se.clear)==null||le.call(se,a),ie(e,{badge:"15",title:"RESET",kindKey:"unknown",meta:"conte\xFAdo local limpo",body:"Persist\xEAncia local deste editor foi limpa.\n\n(Comando `..reset` aplicado no modo seguro v2.)"});if(s==="roll"||s==="dice"||s==="dado"){let x=1+Math.floor(Math.random()*6);return ie(e,{badge:"16",title:"DICE",kindKey:"consult",meta:"rolagem inline",body:`Resultado: **${x}**`})}if(s==="kb"){let x=!1;try{localStorage.getItem("skrv_hwkb")==="true"?(localStorage.removeItem("skrv_hwkb"),localStorage.removeItem("tot_hwkb"),x=!1):(localStorage.setItem("skrv_hwkb","true"),x=!0)}catch(q){}return ie(e,{badge:"17",title:"KEYBOARD",kindKey:"help",meta:x?"hardware keyboard: on":"hardware keyboard: off",body:"Toggle de compatibilidade (`..kb`) aplicado."})}if(s==="v"||s==="vocab"){let x=Object.entries(sa).map(([q,h])=>`\u2022 ${q} \u2014 ${h}`).join(`
`);return ie(e,{badge:"02",title:"VOCAB",kindKey:"vocab",meta:`${Object.keys(sa).length} entradas`,body:x||"(vazio)"})}if(s==="d"||s==="define"){let x=(n||"").toLowerCase(),q=sa[x]||`N\xE3o encontrei defini\xE7\xE3o local para \u201C${n}\u201D.`,h=ie(e,{badge:"03",title:"DEFINE",kindKey:"define",meta:n?`\u201C${n}\u201D \u2022 buscando dicion\xE1rio legado...`:"nenhuma palavra detectada",body:q});if(!n)return h;let I=(Be=(Je=(We=e.integrations)==null?void 0:We.dictionary)==null?void 0:Je.lookup)==null?void 0:Be.call(Je,n);return I&&I.then($=>{var z,oe,re,K;if(!($!=null&&$.ok)){let be=($==null?void 0:$.reason)==="load_error"?"falha ao carregar base legado":"sem termo";ee(h,{meta:`\u201C${n}\u201D \u2022 ${be}`,body:`${q}

(detalhe: usando fallback local)`});return}let k=$.entry;if(!k){ee(h,{meta:`\u201C${n}\u201D \u2022 n\xE3o encontrado no legado`,body:`${q}

Base legado carregada: ${(oe=(z=$.status)==null?void 0:z.chunksLoaded)!=null?oe:0}/${(K=(re=$.status)==null?void 0:re.chunksTotal)!=null?K:0} chunks.`});return}let N=Array.isArray(k.def)?k.def.filter(Boolean):k.def?[String(k.def)]:[],B=Array.isArray(k.exemplos)?k.exemplos.filter(Boolean):[],_=Array.isArray(k.pos)?k.pos.filter(Boolean):k.pos?[String(k.pos)]:[],Q=[];N.length&&(Q.push("Defini\xE7\xF5es:"),N.slice(0,3).forEach((be,pe)=>Q.push(`${pe+1}. ${be}`))),_.length&&(Q.push(""),Q.push(`Classe: ${_.join(", ")}`)),B.length&&(Q.push(""),Q.push("Exemplo:"),Q.push(`\u2022 ${B[0]}`)),ee(h,{meta:`\u201C${n}\u201D \u2022 dicion\xE1rio legado`,body:Q.join(`
`)||q})}).catch(()=>{ee(h,{meta:`\u201C${n}\u201D \u2022 falha ao carregar base legado`,body:`${q}

(detalhe: usando fallback local)`})}),h}if(s==="c"||s==="consult"){let x=(n||"").trim(),q=((a==null?void 0:a.innerText)||"").trim(),h=(pa=e.integrations)==null?void 0:pa.consult,I=((Aa=h==null?void 0:h.findInVocab)==null?void 0:Aa.call(h,x))||[],$=((C=h==null?void 0:h.findInText)==null?void 0:C.call(h,x,q,6))||[],k=[];x?(k.push(`Termo: "${x}"`),k.push(`Vocabul\xE1rio: ${I.length} hit(s)`),I.length&&(k.push(""),k.push("No vocabul\xE1rio:"),I.slice(0,4).forEach(([_,Q])=>k.push(`\u2022 ${_} \u2014 ${Q}`))),k.push(""),k.push(`No texto atual: ${$.length} trecho(s)`),$.length?$.forEach(_=>k.push(`\u2022 L${_.idx}: ${_.line}`)):k.push("\u2022 nenhum trecho encontrado")):(k.push("Consulta local: digite uma palavra e use `..c`."),k.push(""),k.push("Exemplo: `doravante ..c`"));let N=ie(e,{badge:"04",title:"CONSULT",kindKey:"consult",meta:x?`termo: ${x}`:"termo: (vazio)",body:k.join(`
`)});if(!x)return N;let B=(F=h==null?void 0:h.lookupDictionary)==null?void 0:F.call(h,x);return B&&B.then(_=>{var oe,re,K,be,pe;let Q=((oe=h==null?void 0:h.findInText)==null?void 0:oe.call(h,x,q,6))||[],z=[];if(z.push(`Termo: "${x}"`),z.push(`No texto atual: ${Q.length} trecho(s)`),Q.length?Q.forEach(ve=>z.push(`\u2022 L${ve.idx}: ${ve.line}`)):z.push("\u2022 nenhum trecho encontrado"),_!=null&&_.ok&&_.entry){let ve=Array.isArray(_.entry.def)?_.entry.def.find(Boolean)||"":_.entry.def||"";z.push(""),z.push("Dicion\xE1rio legado:"),z.push(`\u2022 encontrado para "${_.entry.lemma||x}"`),ve&&z.push(`\u2022 ${ve}`),ee(N,{meta:`termo: ${x} \u2022 legado ok`,body:z.join(`
`)})}else _!=null&&_.ok&&!_.entry?(z.push(""),z.push("Dicion\xE1rio legado:"),z.push("\u2022 sem entrada correspondente"),ee(N,{meta:`termo: ${x} \u2022 sem entrada no legado`,body:z.join(`
`)})):(z.push(""),z.push("Dicion\xE1rio legado:"),z.push("\u2022 indispon\xEDvel (fallback local ativo)"),ee(N,{meta:`termo: ${x} \u2022 fallback local`,body:z.join(`
`)}));Promise.all([(re=h==null?void 0:h.lookupDoubt)==null?void 0:re.call(h,x),(K=h==null?void 0:h.lookupRegencia)==null?void 0:K.call(h,x),(be=h==null?void 0:h.scanDoubts)==null?void 0:be.call(h,q),(pe=h==null?void 0:h.scanRegencias)==null?void 0:pe.call(h,q)]).then(([ve,Te,Ye,Qe])=>{let Se=[];if(Se.push(...z),Se.push(""),Se.push("Linguagem (legado):"),ve!=null&&ve.ok&&(ve!=null&&ve.doubt)){let Oe=ve.doubt.key||x,He=ve.doubt.tip||ve.doubt.regra||"";Se.push(`- D\xFAvida: ${Oe}`),He&&Se.push(`  ${He}`)}else Se.push("- D\xFAvida: sem alerta direto para o termo");if(Te!=null&&Te.ok&&(Te!=null&&Te.regencia)){let Oe=typeof Te.regencia=="string"?Te.regencia:JSON.stringify(Te.regencia);Se.push(`- Reg\xEAncia: ${Oe}`)}else Se.push("- Reg\xEAncia: sem entrada direta para o termo");let Me=Array.isArray(Ye==null?void 0:Ye.items)?Ye.items.length:0,Le=Array.isArray(Qe==null?void 0:Qe.items)?Qe.items.length:0;Se.push(`- No texto atual: ${Me} d\xFAvida(s), ${Le} alerta(s) de reg\xEAncia`),ee(N,{meta:`termo: ${x} \u2022 consulta completa`,body:Se.join(`
`)})}).catch(()=>{})}).catch(()=>{ee(N,{meta:`termo: ${x} \u2022 fallback local`,body:[`Termo: "${x}"`,"Dicion\xE1rio legado:","\u2022 indispon\xEDvel (fallback local ativo)"].join(`
`)})}),N}if(s==="g"||s==="gram"||s==="grammar"){let x=e.grammarLint,q=a;if(n&&x){let h=ie(e,{badge:"GR",title:"GRAM\xC1TICA",kindKey:"help",meta:n.toLowerCase(),body:"Consultando corpus\u2026"});return Promise.all([ca.search("syntax","concordancia",n),ca.search("syntax","regencia",n),ca.search("stylistics","figures",n)]).then(([I,$,k])=>{let N=[...I,...$,...k],B=[];N.length?(B.push(`Ocorr\xEAncias para "${n}" no corpus:`),B.push(""),N.slice(0,8).forEach(_=>{let Q=_.id?`**${_.id}**  `:"",z=_.rule||_.tip||_.description||"",oe=_.correct||_.example||"";B.push(`- ${Q}${z}`),oe&&B.push(`  \u2713 ${oe}`)})):(B.push(`Nenhuma regra encontrada para **${n}** no corpus.`),B.push(""),B.push("Tente usar **..d** para buscar a defini\xE7\xE3o no verbete.")),ee(h,{meta:`gram\xE1tica: ${n.toLowerCase()}`,body:B.join(`
`)})}).catch(()=>{ee(h,{meta:"erro",body:"Falha ao consultar o corpus."})}),h}if(x){let h=x.toggle();h?x.scan(q):x.clear(q);let I=h?"ativo \u2014 desvios marcados":"desativado";return(Z=e.setStatus)==null||Z.call(e,`verificador gramatical: ${I}`),ie(e,{badge:"GR",title:"GRAM\xC1TICA",kindKey:"help",meta:I,body:h?`Verificador ativado.

Desvios comuns da norma padr\xE3o aparecem sublinhados em ondas.
Passe o mouse para ver a explica\xE7\xE3o.

Digite **..g** novamente para desativar.`:"Verificador desativado."})}return ie(e,{badge:"GR",title:"GRAM\xC1TICA",kindKey:"help",meta:"indispon\xEDvel",body:"Verificador gramatical n\xE3o foi inicializado. Verifique o console."})}let p=s==="modal"?n:s;return((Ce=(de=(te=e.integrations)==null?void 0:te.modalTransplant)==null?void 0:de.isLegacyCommand)==null?void 0:Ce.call(de,p))||s==="modal"&&!!n?d(p,n):((lt=e.flashCommandError)==null||lt.call(e),(dt=e.setStatus)==null||dt.call(e,`comando inv\xE1lido: ${r}`),null)}function on(e,a){let o=e.querySelectorAll(".slice");for(let t of o)try{if(a.intersectsNode(t))return!0}catch(r){}return!1}function tn(e,a){if(!e||!a)return!1;let o=a.startContainer,t=a.endContainer;return e.contains(o)&&e.contains(t)}function rn(e){return String(e||"").replace(/\s+/g," ").trim().slice(0,120)}function sn(e){return e.split(/\s+/).filter(Boolean).length}function kr(e,a){var g;let o=((g=e==null?void 0:e.refs)==null?void 0:g.selectionToolbarEl)||document.getElementById("selectionToolbar");if(!o||!a)return;let t=o.querySelector('[data-act="consult"]'),r=o.querySelector('[data-act="inspect"]'),i="",n="",s=null,d=0,c=()=>{o.classList.remove("isVisible"),o.setAttribute("aria-hidden","true")},l=m=>{let y=Math.max(8,m.top-o.offsetHeight-8),E=m.left+m.width/2-o.offsetWidth/2;E=Math.max(8,Math.min(E,window.innerWidth-o.offsetWidth-8)),o.style.top=`${Math.round(y)}px`,o.style.left=`${Math.round(E)}px`,o.classList.add("isVisible"),o.setAttribute("aria-hidden","false")},u=()=>{let m=window.getSelection();if(!m||m.rangeCount===0||m.isCollapsed){s=null,i="",c();return}let v=m.getRangeAt(0);if(!tn(a,v)||on(a,v)){s=null,i="",c();return}let y=rn(m.toString());if(!y){s=null,i="",n="",c();return}let E=v.getBoundingClientRect();if(!E||E.width===0||E.height===0){s=null,i="",n="",c();return}s=v.cloneRange(),i=y,n=m.toString().replace(/\s+/g," ").trim();let f=sn(y)>1;t&&(t.hidden=f),r&&(r.hidden=!f),l(E)},p=()=>{d&&cancelAnimationFrame(d),d=requestAnimationFrame(()=>{d=0,u()})},b=()=>{if(!s)return!1;let m=window.getSelection();return m?(m.removeAllRanges(),m.addRange(s),m.collapseToEnd(),!0):!1};o.addEventListener("mousedown",m=>{m.preventDefault()}),o.addEventListener("click",m=>{var E,f,w;let v=m.target&&m.target.closest?m.target.closest(".selectionToolbarBtn"):null;if(!v||!i)return;let y=v.getAttribute("data-act");if(y){if(y==="consult"){a.focus(),b();let O=Cr(e,a,i);O&&(Ve(O),(E=e.setStatus)==null||E.call(e,`consulta: ${i}`)),c();return}if(y==="inspect"){let O=n,R=(f=s==null?void 0:s.cloneRange())!=null?f:null;c(),Ba(e,O,R);return}y==="postit"&&(go(e,i),(w=e.setStatus)==null||w.call(e,"post-it criado pela sele\xE7\xE3o"),c())}}),document.addEventListener("selectionchange",p),a.addEventListener("mouseup",p),a.addEventListener("keyup",p),a.addEventListener("scroll",p),window.addEventListener("resize",p),document.addEventListener("pointerdown",m=>{o.contains(m.target)||a.contains(m.target)||c()})}function Ro(e){let a=String(e.textContent||"").replace(/\u200B/g,"").trim(),o=!!e.querySelector(".slice");e.classList.toggle("is-empty",!a&&!o)}function Lr(e){var o;if(!e||e.nodeType!==Node.ELEMENT_NODE)return!1;let a=e.tagName;return!!(a==="INPUT"||a==="TEXTAREA"||a==="SELECT"||a==="BUTTON"||(o=e.closest)!=null&&o.call(e,".postitComposer"))}function nn(e){var a;return!!(e&&e.nodeType===Node.ELEMENT_NODE&&((a=e.classList)!=null&&a.contains("slice")))}function cn(e){var a,o,t;return e?nn(e)?e:e.nodeType===Node.ELEMENT_NODE?((a=e.closest)==null?void 0:a.call(e,".slice"))||null:((t=(o=e.parentElement)==null?void 0:o.closest)==null?void 0:t.call(o,".slice"))||null:null}function ln(e,a,o){let t=e,r=a;for(;t;){if(t.nodeType===Node.ELEMENT_NODE){let n=t.childNodes;if(o==="back"&&r>0)return n[r-1]||null;if(o==="forward"&&r<n.length)return n[r]||null}let i=t.parentNode;if(!i||(r=Array.prototype.indexOf.call(i.childNodes,t),r<0))return null;t=i}return null}function dn(e,a){let o=e;for(;o&&o.nodeType===Node.ELEMENT_NODE;){let t=a==="back"?o.lastChild:o.firstChild;if(!t)break;o=t}return o}function Pr(e,a){var i;let o=e.startContainer,t=e.startOffset;if(o.nodeType===Node.TEXT_NODE){let n=((i=o.textContent)==null?void 0:i.length)||0;if(a==="back"&&t>0||a==="forward"&&t<n)return null}let r=ln(o,t,a);return r?(r=dn(r,a),cn(r)):null}function Nr(e,a){let o=e.querySelectorAll(".slice");for(let t of o)try{if(a.intersectsNode(t))return!0}catch(r){}return!1}function un(e,a){let o=[],t=e.querySelectorAll(".slice");for(let r of t)try{a.intersectsNode(r)&&o.push(r)}catch(i){}return o}function zo(e){if(!e||!e.parentNode)return!1;let a=document.createRange();a.setStartAfter(e),a.collapse(!0);let o=window.getSelection();return o?(o.removeAllRanges(),o.addRange(a),!0):!1}function mn(e,a){if(!a.collapsed)return null;let o=e.querySelectorAll(".slice");for(let t of o)try{if(a.comparePoint(t,0)<=0)continue;let r=document.createRange();if(r.setStart(a.startContainer,a.startOffset),r.setEndBefore(t),!r.toString().replace(/\u200B/g,"").trim())return t;break}catch(r){}return null}function pn(e,a){let o=window.getSelection();if(!o||o.rangeCount===0)return!1;let t=o.getRangeAt(0);if(!e.contains(t.startContainer)||!e.contains(t.endContainer))return!1;if(!t.collapsed){let n=un(e,t);if(!n.length)return!1;let s=n[n.length-1];return zo(s)}let r=Pr(t,"forward");if(r)return zo(r);let i=mn(e,t);return i?zo(i):!1}function gn(e,a){if(a!=="Backspace"&&a!=="Delete")return!1;let o=window.getSelection();if(!o||o.rangeCount===0)return!1;let t=o.getRangeAt(0);return!e.contains(t.startContainer)||!e.contains(t.endContainer)?!1:t.collapsed?!!Pr(t,a==="Backspace"?"back":"forward"):Nr(e,t)}function Do(){let e=document.activeElement;return e&&e.classList&&e.classList.contains("pageContent")?e:document.querySelector(".pageContent")}function fn(e){return["h","n","a","authoria","auth","assinar","w","d","c"]}function bn(e,a){let o=String(a||"").toLowerCase();return o?fn(e).some(r=>r!==o&&r.startsWith(o)):!1}function Ir(e,a,{force:o=!1}={}){var p,b;let t=$a(a),r=t.match(/\.\.([a-z][a-z0-9_-]{0,24})\s*$/i);if(!r)return;let i=(r[1]||"").toLowerCase(),n=`..${i}`,s=r[0].length,d=Oa(t,n),c=bn(e,i),l=/\s$/.test(t);if(!o&&c&&!l){clearTimeout(e.state.pendingCommandTimer),e.state.pendingCommandTimer=setTimeout(()=>{Ir(e,a,{force:!0})},360);return}clearTimeout(e.state.pendingCommandTimer),e.state.pendingCommandTimer=null,wt(a,s);let u=Ja(e,a,i,d);u&&((p=u.classList)!=null&&p.contains("slice")&&aa(a),Ve(u),(b=u.classList)!=null&&b.contains("slice")&&ja(u),e.setStatus(`slice: ..${i}`))}function ar(e,a){let o=null;Ro(a),a.addEventListener("keydown",r=>{var d,c,l,u,p,b,g,m,v,y,E,f,w,O,R,D,ne;if(Lr(r.target))return;if(r.key==="Backspace"&&!r.ctrlKey&&!r.metaKey){let H=(c=(d=e.state.pages)==null?void 0:d.indexOf(a))!=null?c:-1;if(H>0){let P=window.getSelection();if(P!=null&&P.isCollapsed&&(P!=null&&P.rangeCount)&&Ua(a,P.getRangeAt(0))){r.preventDefault();let J=e.state.pages[H-1],A=0;for(let T=0;T<H-1;T++)A+=((l=e.state.pages[T])==null?void 0:l.textContent.length)||0;for(A+=J.textContent.length;a.firstChild;)J.appendChild(a.firstChild);ua(e,H),J.focus(),Ie(e,J),To(e,{totalOffset:A});return}}}if(r.key==="ArrowDown"){let H=(p=(u=e.state.pages)==null?void 0:u.indexOf(a))!=null?p:-1;if(H>=0&&H<((g=(b=e.state.pages)==null?void 0:b.length)!=null?g:0)-1){let P=window.getSelection();if(P!=null&&P.rangeCount&&_o(a,P.getRangeAt(0))){r.preventDefault();let J=e.state.pages[H+1];ko(J),J.focus();return}}}if(r.key==="ArrowUp"){let H=(v=(m=e.state.pages)==null?void 0:m.indexOf(a))!=null?v:-1;if(H>0){let P=window.getSelection();if(P!=null&&P.rangeCount&&Ua(a,P.getRangeAt(0))){r.preventDefault();let J=e.state.pages[H-1];aa(J),J.focus();return}}}if(r.key==="ArrowLeft"&&!r.ctrlKey&&!r.metaKey&&!r.shiftKey){let H=(E=(y=e.state.pages)==null?void 0:y.indexOf(a))!=null?E:-1;if(H>0){let P=window.getSelection();if(P!=null&&P.isCollapsed&&(P!=null&&P.rangeCount)&&Ua(a,P.getRangeAt(0))){r.preventDefault();let J=e.state.pages[H-1];aa(J),J.focus();return}}}if(r.key==="ArrowRight"&&!r.ctrlKey&&!r.metaKey&&!r.shiftKey){let H=(w=(f=e.state.pages)==null?void 0:f.indexOf(a))!=null?w:-1;if(H>=0&&H<((R=(O=e.state.pages)==null?void 0:O.length)!=null?R:0)-1){let P=window.getSelection();if(P!=null&&P.isCollapsed&&(P!=null&&P.rangeCount)&&_o(a,P.getRangeAt(0))){r.preventDefault();let J=e.state.pages[H+1];ko(J),J.focus();return}}}if(gn(a,r.key)){r.preventDefault(),e.setStatus("corte protegido: use topo/laterais/tag");return}let i=r.key.length===1&&!r.ctrlKey&&!r.metaKey&&!r.altKey&&!r.isComposing,n=r.key==="Enter";if((n||i?pn(a,r.key):!1)&&i){r.preventDefault(),Ma(r.key),a.dispatchEvent(new Event("input",{bubbles:!0}));return}document.body.dataset.theme==="script"&&((ne=(D=e.sfx)==null?void 0:D.playForKey)==null||ne.call(D,r)),n&&(r.preventDefault(),Ma(`
`),a.dispatchEvent(new Event("input",{bubbles:!0})))}),a.addEventListener("input",r=>{Lr(r.target)||(clearTimeout(o),o=setTimeout(()=>{Ro(a),Ir(e,a),Ro(a);let i=Xt(e);Ie(e,a),Va(e,a),Qt(e),To(e,i),oa(e)},60))});let t="\u200B\uFEFF";a.addEventListener("copy",r=>{if(!r.clipboardData)return;let i=window.getSelection();!i||i.isCollapsed||(r.clipboardData.setData("text/plain",t+i.toString()),r.preventDefault())}),a.addEventListener("cut",r=>{if(!r.clipboardData)return;let i=window.getSelection();if(!i||!i.rangeCount||i.isCollapsed)return;let n=i.getRangeAt(0);a.contains(n.startContainer)&&(r.clipboardData.setData("text/plain",t+i.toString()),r.preventDefault(),Nr(a,n)?e.setStatus("corte protegido: selecione apenas texto"):(n.deleteContents(),a.dispatchEvent(new Event("input",{bubbles:!0}))))}),a.addEventListener("paste",r=>{var s;if(r.preventDefault(),!r.clipboardData)return;let i=r.clipboardData.getData("text/plain");if(!i.startsWith(t)){(s=e.flashCommandError)==null||s.call(e),e.setStatus("colar externo bloqueado: apenas conte\xFAdo criado aqui");return}let n=i.slice(t.length);n&&(Ma(n),a.dispatchEvent(new Event("input",{bubbles:!0})))}),Re(e),kr(e,a)}var $r="eskrev:index2:theme",Bo=new Set(["paper","chumbo"]),Fo=["paper","chumbo"],vn={paper:"Tema claro ativo",chumbo:"Tema escuro ativo"};function jr(e){let a=Bo.has(e)?e:"paper";document.body.dataset.theme=a;let o=a==="chumbo";return document.querySelectorAll(".chrome .themeToggle").forEach(t=>{var r;t.classList.toggle("is-dark",o),t.setAttribute("aria-pressed",o?"true":"false"),t.setAttribute("title",(r=vn[a])!=null?r:"Tema ativo")}),a}function Ho(e){let a=jr(e);try{localStorage.setItem($r,a)}catch(o){}return a}function Vo(){var a,o;let e=((o=(a=document.body)==null?void 0:a.dataset)==null?void 0:o.theme)||"";return Bo.has(e)?e:"paper"}function Ya(){let e=Vo(),a=Fo.indexOf(e),o=Fo[(a+1)%Fo.length]||"paper";return Ho(o)}function Mr(){let e=localStorage.getItem($r),a=jr(Bo.has(e)?e:"paper");return document.querySelectorAll(".chrome .themeToggle").forEach(o=>{o.addEventListener("click",()=>Ya()),o.addEventListener("keydown",t=>{t.key!=="Enter"&&t.key!==" "||(t.preventDefault(),Ya())})}),a}var Or="src/assets/audio/type.wav",Rr="src/assets/audio/enter.wav",zr="src/assets/audio/backspace.wav";function Dr(){let e={audioCtx:null,gainNode:null,buffers:{},fallback:{type:new Audio(Or),enter:new Audio(Rr),backspace:new Audio(zr)},lastTypeAt:0},a=()=>localStorage.getItem("skrv_sfx_muted")==="true",o=(c,l)=>S(null,null,function*(){if(e.audioCtx)try{let p=yield(yield fetch(l)).arrayBuffer();e.buffers[c]=yield e.audioCtx.decodeAudioData(p)}catch(u){}}),t=()=>{if(e.audioCtx)return;let c=window.AudioContext||window.webkitAudioContext;c&&(e.audioCtx=new c,e.gainNode=e.audioCtx.createGain(),e.gainNode.gain.value=.55,e.gainNode.connect(e.audioCtx.destination),o("type",Or),o("enter",Rr),o("backspace",zr))},r=()=>{t(),document.removeEventListener("pointerdown",r),document.removeEventListener("keydown",r)},i=c=>{let l=e.fallback[c]||e.fallback.type;if(l)try{l.currentTime=0,l.volume=.55,l.play().catch(()=>{})}catch(u){}},n=c=>{if(a())return;if(!e.audioCtx||!e.gainNode){i(c);return}e.audioCtx.state==="suspended"&&e.audioCtx.resume();let l=c==="backspace"&&!e.buffers.backspace?"type":c,u=e.buffers[l];if(!u){i(c);return}try{let p=e.audioCtx.createBufferSource();p.buffer=u,p.connect(e.gainNode),p.start(0)}catch(p){}};return{bind:()=>{document.addEventListener("pointerdown",r,{once:!0}),document.addEventListener("keydown",r,{once:!0})},playForKey:c=>{if(!c||c.ctrlKey||c.metaKey||c.altKey)return;let l=String(c.key||"");if(l==="Enter"){n("enter");return}if(l==="Backspace"||l==="Delete"){n("backspace");return}if(l.length===1){let u=performance.now();if(u-e.lastTypeAt<24)return;e.lastTypeAt=u,n("type")}},play:n}}var Uo=null;function Hr(e){return String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}function qa(){return S(this,null,function*(){return Uo||(Uo=Promise.resolve().then(()=>(Br(),Fr))),(yield Uo).ptDictionary})}function Vr(e){return S(this,null,function*(){let a=String(e||"").trim();if(!a)return{ok:!1,reason:"empty"};try{let t=yield(yield qa()).lookupDetailed(a);return{ok:!0,term:a,entry:(t==null?void 0:t.entry)||null,status:(t==null?void 0:t.status)||null,tried:(t==null?void 0:t.tried)||[],raw:(t==null?void 0:t.raw)||a,error:(t==null?void 0:t.error)||null}}catch(o){return{ok:!1,reason:"load_error",term:a,error:o}}})}function Ur(e){return S(this,null,function*(){let a=String(e||"").trim();if(!a)return{ok:!1,reason:"empty"};try{let t=yield(yield qa()).getDoubt(a);return{ok:!0,term:a,doubt:t||null}}catch(o){return{ok:!1,reason:"load_error",term:a,error:o}}})}function Kr(e){return S(this,null,function*(){let a=String(e||"").trim();if(!a)return{ok:!1,reason:"empty"};try{let t=yield(yield qa()).getRegencia(a);return{ok:!0,term:a,regencia:t||null}}catch(o){return{ok:!1,reason:"load_error",term:a,error:o}}})}function Gr(e){return S(this,null,function*(){let a=String(e||"").trim();if(!a)return{ok:!0,items:[]};try{let t=yield(yield qa()).findDoubts(a);return{ok:!0,items:Array.isArray(t)?t:[]}}catch(o){return{ok:!1,reason:"load_error",error:o,items:[]}}})}function Wr(e){return S(this,null,function*(){let a=String(e||"").trim();if(!a)return{ok:!0,items:[]};try{let t=yield(yield qa()).findRegenciaAlerts(a);return{ok:!0,items:Array.isArray(t)?t:[]}}catch(o){return{ok:!1,reason:"load_error",error:o,items:[]}}})}function Jr(e,a,o=6){let t=Hr(e).trim();return t?String(a||"").split(/\r?\n/).map(i=>i.trim()).map((i,n)=>({line:i,idx:n+1})).filter(i=>i.line&&Hr(i.line).includes(t)).slice(0,o):[]}function Yr(){return{lookup(a){return S(this,null,function*(){return Vr(a)})}}}function Ko(e){return String(e||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}function Qr(e,a){return{findInVocab(t){let r=Ko(t).trim();return r?Object.entries(sa).filter(([i,n])=>Ko(i).includes(r)||Ko(n).includes(r)):[]},findInText(t,r,i=6){return Jr(t,r,i)},lookupDictionary(t){return S(this,null,function*(){var r;return(r=a==null?void 0:a.dictionary)!=null&&r.lookup?a.dictionary.lookup(t):{ok:!1,reason:"disabled"}})},lookupDoubt(t){return S(this,null,function*(){return Ur(t)})},lookupRegencia(t){return S(this,null,function*(){return Kr(t)})},scanDoubts(t){return S(this,null,function*(){return Gr(t)})},scanRegencias(t){return S(this,null,function*(){return Wr(t)})}}}var Go="eskrev:index2:page1:content",Wo="eskrev:index2:page1:html",Jo="eskrev:index2:dock:html",Yo="eskrev:index2:postit:html",Qo="eskrev:index2:page1:scroll";function Xr(e){function a(i){i.querySelectorAll(".slice").forEach(n=>n.remove()),i.querySelectorAll(".gram-mark").forEach(n=>{n.replaceWith(document.createTextNode(n.textContent))})}function o(i){var n,s,d;if(i)try{let c=localStorage.getItem(Wo),l=localStorage.getItem(Go);if(c&&c.trim()){let v=document.createElement("div");v.innerHTML=c,a(v),i.innerHTML=v.innerHTML}else l&&l.trim()&&(i.innerText=l);let u=Number(localStorage.getItem(Qo)||"0");Number.isFinite(u)&&u>0&&(i.scrollTop=u);let p=((n=e==null?void 0:e.refs)==null?void 0:n.sliceDockEl)||document.getElementById("sliceDockRail"),b=localStorage.getItem(Jo);p&&typeof b=="string"&&(p.innerHTML=b);let g=((s=e==null?void 0:e.refs)==null?void 0:s.postitLayerEl)||document.getElementById("postitLayer"),m=localStorage.getItem(Yo);g&&typeof m=="string"&&(g.innerHTML=m)}catch(c){(d=e==null?void 0:e.setStatus)==null||d.call(e,"persist\xEAncia indispon\xEDvel")}}function t(i){var u,p;if(!i)return;let n=null,s=()=>{var b,g;try{let m=i.cloneNode(!0);a(m),localStorage.setItem(Wo,m.innerHTML||""),localStorage.setItem(Go,m.innerText||""),localStorage.setItem(Qo,String(i.scrollTop||0));let v=((b=e==null?void 0:e.refs)==null?void 0:b.sliceDockEl)||document.getElementById("sliceDockRail");v&&localStorage.setItem(Jo,v.innerHTML||"");let y=((g=e==null?void 0:e.refs)==null?void 0:g.postitLayerEl)||document.getElementById("postitLayer");y&&localStorage.setItem(Yo,y.innerHTML||"")}catch(m){}};i.addEventListener("input",()=>{clearTimeout(n),n=setTimeout(s,180)}),i.addEventListener("scroll",s);let d=((u=e==null?void 0:e.refs)==null?void 0:u.sliceDockEl)||document.getElementById("sliceDockRail"),c=((p=e==null?void 0:e.refs)==null?void 0:p.postitLayerEl)||document.getElementById("postitLayer"),l=new MutationObserver(()=>{clearTimeout(n),n=setTimeout(s,120)});l.observe(i,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),d&&l.observe(d,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),c&&l.observe(c,{subtree:!0,childList:!0,attributes:!0,characterData:!0})}function r(i){var d,c;try{localStorage.removeItem(Wo),localStorage.removeItem(Go),localStorage.removeItem(Jo),localStorage.removeItem(Yo),localStorage.removeItem(Qo)}catch(l){}i&&(i.innerText="",i.scrollTop=0);let n=((d=e==null?void 0:e.refs)==null?void 0:d.sliceDockEl)||document.getElementById("sliceDockRail");n&&(n.innerHTML="");let s=((c=e==null?void 0:e.refs)==null?void 0:c.postitLayerEl)||document.getElementById("postitLayer");s&&(s.innerHTML="")}return{restore:o,bind:t,clear:r}}var Zr=[{id:"gatekeeper",badge:"20",title:"LOCK",aliases:["lock","gate","senha"]},{id:"dedicationModal",badge:"21",title:"DEDICATION",aliases:["dedication","dedic"]},{id:"mobileGateModal",badge:"22",title:"MOBILE GATE",aliases:["mobilegate","mgate"]},{id:"mobileImportTargetModal",badge:"23",title:"MOBILE IMPORT",aliases:["mobileimport","mimport"]},{id:"onboardingModal",badge:"24",title:"ONBOARDING",aliases:["onboarding","onboard"]},{id:"termsModal",badge:"25",title:"TERMS",aliases:["terms"]},{id:"privacyModal",badge:"26",title:"PRIVACY",aliases:["privacy"]},{id:"manifestoModal",badge:"27",title:"MANIFESTO",aliases:["manifesto"]},{id:"notesModal",badge:"28",title:"NOTES",aliases:["notes","memo"]},{id:"newTextModal",badge:"29",title:"NEW TEXT",aliases:["newtext","new"]},{id:"exportModal",badge:"30",title:"EXPORT",aliases:["export","save"]},{id:"fediverseModal",badge:"31",title:"FEDIVERSE",aliases:["fediverse","fedi","social"]},{id:"socialShareModal",badge:"32",title:"SHARE",aliases:["share"]},{id:"readerModal",badge:"33",title:"READER",aliases:["reader","overview","thumbs"]},{id:"qrStreamModal",badge:"34",title:"QR STREAM",aliases:["qrstream","qrs","qr"]},{id:"qrScanModal",badge:"35",title:"QR SCAN",aliases:["qrscan"]},{id:"mobileIntroModal",badge:"36",title:"MOBILE INTRO",aliases:["mobileintro"]},{id:"resetModal",badge:"37",title:"RESET",aliases:["reset"]},{id:"importSessionModal",badge:"38",title:"IMPORT SESSION",aliases:["importsession","import","open"]},{id:"pomodoroModal",badge:"39",title:"POMODORO",aliases:["pomodoro","pomo"]},{id:"goalModal",badge:"40",title:"GOAL",aliases:["goal"]},{id:"helpModal",badge:"41",title:"HELP",aliases:["helpmodal"]},{id:"systemModal",badge:"42",title:"SYSTEM",aliases:["system","theme","music","zen","mini","mode"]},{id:"pasteChoiceModal",badge:"43",title:"PASTE CHOICE",aliases:["pastechoice","paste"]},{id:"commandPaletteModal",badge:"44",title:"COMMAND PALETTE",aliases:["commandpalette","palette"]},{id:"consultModal",badge:"45",title:"CONSULT LEGACY",aliases:["consultlegacy"]},{id:"figuresModal",badge:"46",title:"FIGURES",aliases:["figures"]}],qn=new Set(["modal","modals","h","help","d","define","v","vocab","c","consult","persona","figures","templates","template","guide"]);function Xa(e){return String(e||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function wn(e){return String(e||"").replace(/\r/g,"").replace(/[ \t]+\n/g,`
`).replace(/\n{3,}/g,`

`).trim()}function An(){return S(this,null,function*(){let e=yield fetch("fullm.html",{cache:"no-store"});if(!e.ok)throw new Error("fullm.html indispon\xEDvel");let a=yield e.text();return new DOMParser().parseFromString(a,"text/html")})}function Cn(e,a){let o=e.getElementById(a);if(!o)return"";let r=(o.querySelector(".modal-body")||o.querySelector(".modal-box")||o).cloneNode(!0);return r.querySelectorAll("button, input, textarea, select, svg, img, video, audio, iframe, canvas").forEach(i=>i.remove()),wn(r.textContent||"")}function Tn(){let e=new Map;for(let a of Zr){e.set(Xa(a.id),a);for(let o of a.aliases||[])e.set(Xa(o),a)}return e}function ei(e){let a=null,o=Tn();function t(){return S(this,null,function*(){return a||(a=yield An()),a})}function r(n){return o.get(Xa(n))||null}return{list(){return Zr.map(n=>({cmd:`--${n.aliases&&n.aliases[0]||n.id}`,id:n.id,title:n.title,aliases:n.aliases||[]}))},isLegacyCommand(n){let s=Xa(n);return!s||qn.has(s)?!1:!!r(s)},resolveCommand(n,s=""){return S(this,null,function*(){let d=r(n)||r(s);if(!d)return null;try{let c=yield t(),l=Cn(c,d.id);return{ok:!0,badge:d.badge,title:d.title,kindKey:"legacy-modal",meta:`transplante de ${d.id}`,body:l||"(sem conte\xFAdo textual no modal legado)"}}catch(c){return{ok:!1,badge:d.badge,title:d.title,kindKey:"legacy-modal",meta:`falha em ${d.id}`,body:`N\xE3o foi poss\xEDvel carregar o modal legado.

${(c==null?void 0:c.message)||String(c)}`}}})}}}var ai={conto:["conto","shortstory"],romance:["romance","novel"],roteiro:["roteiro","script"],ensaio:["ensaio","cronica","artigo"],universitario:["universitario","academico","abnt"],enem:["enem","redacao"],poesia:["poesia","poema"]};function Ke(e){return String(e||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}function oi(){let e=null,a=new Map;function o(){return S(this,null,function*(){if(!e){let s=yield fetch("config/persona-templates.json",{cache:"no-store"});if(!s.ok)throw new Error("config/persona-templates.json indispon\xEDvel");e=yield s.json()}return e})}function t(s){return S(this,null,function*(){if(a.has(s))return a.get(s);let d=yield fetch(s,{cache:"no-store"});if(!d.ok)throw new Error(`Template indispon\xEDvel: ${s}`);let c=yield d.text();return a.set(s,c),c})}function r(s,d){let c=Ke(d);return c&&(Array.isArray(s==null?void 0:s.personas)?s.personas:[]).find(u=>{let p=Ke(u.id);return p===c?!0:(ai[p]||[]).some(g=>Ke(g)===c)})||null}function i(s){return S(this,null,function*(){let d=Array.isArray(s==null?void 0:s.personas)?s.personas:[],c=[];return d.forEach(l=>{(Array.isArray(l.templates)?l.templates:[]).forEach(u=>{c.push({persona:l.id,id:u.id,label:u.label,file:u.file})})}),c})}return{list(){return S(this,null,function*(){let s=yield o();return(Array.isArray(s==null?void 0:s.personas)?s.personas:[]).map(c=>({id:c.id,aliases:ai[Ke(c.id)]||[c.id],templates:Array.isArray(c.templates)?c.templates.map(l=>({id:l.id,file:l.file})):[]}))})},resolve(s){return S(this,null,function*(){let d=yield o(),c=r(d,s);if(!c)return null;let l=Array.isArray(c.templates)?c.templates:[],u=[];for(let p of l){if(!(p!=null&&p.file))continue;let b=yield t(p.file);u.push({id:p.id,file:p.file,text:String(b||"").trim()})}return{id:c.id,templates:u}})},listTemplates(){return S(this,null,function*(){let s=yield o();return i(s)})},resolveTemplate(s){return S(this,null,function*(){let d=Ke(s);if(!d)return null;let c=yield o(),u=(yield i(c)).find(b=>Ke(b.id)===d||Ke(b.file)===d||Ke(b.persona)===d);if(!u)return null;let p=yield t(u.file);return{persona:u.persona,id:u.id,file:u.file,text:String(p||"").trim()}})}}}function Xo(e){return String(e||"").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}var _n={conto:["conto","shortstory"],romance:["romance","novel"],roteiro:["roteiro","script"],ensaio:["ensaio","cronica","artigo"],universitario:["universitario","academico","abnt"],enem:["enem","redacao"],poesia:["poesia","poema"]};function kn(e){let a=Xo(e);if(!a)return"";for(let[o,t]of Object.entries(_n))if(o===a||t.some(r=>Xo(r)===a))return o;return a}function ti(){let e=null;function a(){return S(this,null,function*(){if(!e){let t=yield fetch("src/assets/figures/figures_ptbr.json",{cache:"no-store"});if(!t.ok)throw new Error("figures_ptbr.json indispon\xEDvel");e=yield t.json()}return e})}return{resolve(t=""){return S(this,null,function*(){let r=yield a(),i=kn(t),s=(Array.isArray(r==null?void 0:r.tabs)?r.tabs:[]).map(d=>{let c=Array.isArray(d.items)?d.items:[],l=i?c.filter(u=>{let p=Array.isArray(u.personas)?u.personas.map(Xo):[];return!p.length||p.includes("all")||p.includes(i)}):c;return{id:d.id,label:d.label,items:l}}).filter(d=>d.items.length);return{persona:i||"",tabs:s}})}}}function ri(e){let a={dictionary:!0,consult:!0,persistence:!0,modalTransplant:!0,personaTransplant:!0,figuresTransplant:!0},o={};return a.dictionary&&(o.dictionary=Yr(e)),a.consult&&(o.consult=Qr(e,o)),a.persistence&&(o.persistence=Xr(e)),a.modalTransplant&&(o.modalTransplant=ei(e)),a.personaTransplant&&(o.personaTransplant=oi(e)),a.figuresTransplant&&(o.figuresTransplant=ti(e)),o}var ci="skrv_mobile_notes_v1",ii=200,si=30,Ln=5;function Ge(){let e=we(ci);if(!e)return[];if(Array.isArray(e))return e;try{let a=JSON.parse(e);return Array.isArray(a)?a:[]}catch(a){return[]}}function Za(e){_e(ci,Array.isArray(e)?e:[])}var De=e=>String(e||"").trim().replace(/^#/,"").toLowerCase(),Fe=e=>String(e||"").trim();function eo(e){if(!e)return"";let a=new Date(e);return isNaN(a.getTime())?"":a.toLocaleDateString("pt-BR")}function ni(e){if(e.title&&e.title.trim())return e.title.trim();let a=String(e.text||"").split(`
`).find(Boolean);return a?a.trim().slice(0,48):"sem t\xEDtulo"}function Pn(e){let a=String(e||"").trim().split(/\s+/).filter(Boolean),o=[],t="",r=[];return a.forEach(i=>{if(i.startsWith("#")&&i.length>1){o.push(De(i.slice(1)));return}if(i.startsWith("/")&&i.length>1){t=Fe(i.slice(1));return}r.push(i)}),{text:r.join(" ").toLowerCase(),tags:o,folder:t}}function Nn(e,a){if(!a.text&&!a.tags.length&&!a.folder)return!0;let o=`${e.title||""} ${e.text||""}`.toLowerCase();return!(a.text&&!o.includes(a.text)||a.folder&&Fe(e.folder)!==a.folder||a.tags.length&&!a.tags.every(t=>(e.tags||[]).map(De).includes(t)))}function li(){let e=document.getElementById("notesSidebar");if(!e)return;let a={activeId:null,stage:"list",search:"",folder:"",tag:"",overlayType:"",overlayValue:"",draftId:null,updateTimer:null},o=A=>document.getElementById(A),t=e.querySelector(".notesSidebarClose");function r(A){a.stage=A,e.querySelectorAll(".notes-stage").forEach(j=>j.classList.remove("is-active"));let T=e.querySelector(`.notes-stage-${A}`);T&&T.classList.add("is-active"),A==="list"&&s()}function i(A,T){a.overlayType=A,a.overlayValue=T;let j=o("onepNotesOverlay"),V=o("onepNotesOverlayTitle"),W=o("onepNotesOverlayList");if(!j||!W)return;let Y=Ge(),ae=A==="folder"?Y.filter(X=>Fe(X.folder)===T):Y.filter(X=>(X.tags||[]).map(De).includes(T));V&&(V.textContent=T),W.innerHTML="",ae.forEach(X=>W.appendChild(d(X))),j.classList.add("active")}function n(){let A=o("onepNotesOverlay");A&&A.classList.remove("active"),a.overlayType="",a.overlayValue=""}function s(){let A=o("onepNotesList"),T=o("onepNotesEmpty");if(!A||!T)return;let j=Ge(),V=Pn(a.search),W=j.filter(G=>Nn(G,V)).filter(G=>a.folder?Fe(G.folder)===a.folder:!0).filter(G=>a.tag?(G.tags||[]).map(De).includes(a.tag):!0),Y=o("onepNotesFoldersWrap"),ae=o("onepNotesFolders");if(Y&&ae){let G=new Map;j.forEach(M=>{let se=Fe(M.folder);if(!se)return;let le=new Date(M.updatedAt||M.createdAt||0).getTime();le>(G.get(se)||0)&&G.set(se,le)});let fe=Array.from(G.entries()).sort((M,se)=>se[1]-M[1]).map(([M])=>M);if(fe.length){Y.style.display="grid",ae.innerHTML="";let M=document.createElement("button");M.className="notes-filter-btn"+(a.folder?"":" active"),M.type="button",M.textContent="tudo",M.onclick=()=>{a.folder="",s()},ae.appendChild(M),fe.forEach(se=>{let le=document.createElement("button");le.className="notes-filter-btn"+(a.folder===se?" active":""),le.type="button",le.textContent=se,le.onclick=()=>i("folder",se),ae.appendChild(le)})}else Y.style.display="none"}let X=o("onepNotesTagsWrap"),ce=o("onepNotesTagsList");if(X&&ce){let G=new Map;j.forEach(M=>(M.tags||[]).map(De).filter(Boolean).forEach(se=>{let le=new Date(M.updatedAt||M.createdAt||0).getTime();le>(G.get(se)||0)&&G.set(se,le)}));let fe=Array.from(G.entries()).sort((M,se)=>se[1]-M[1]).map(([M])=>M);if(fe.length){X.style.display="grid",ce.innerHTML="";let M=document.createElement("button");M.className="notes-filter-btn"+(a.tag?"":" active"),M.type="button",M.textContent="todas",M.onclick=()=>{a.tag="",s()},ce.appendChild(M),fe.forEach(se=>{let le=document.createElement("button");le.className="notes-filter-btn"+(a.tag===se?" active":""),le.type="button",le.textContent=`#${se}`,le.onclick=()=>i("tag",se),ce.appendChild(le)})}else X.style.display="none"}if(A.innerHTML="",!W.length){T.style.display="flex";return}T.style.display="none",[...W.filter(G=>G.pinned),...W.filter(G=>!G.pinned)].forEach(G=>A.appendChild(d(G)))}function d(A){let T=document.createElement("div");T.className="notes-card"+(A.pinned?" is-pinned":"");let j=document.createElement("div");j.className="notes-card-header";let V=document.createElement("div");V.className="notes-card-title",V.textContent=ni(A);let W=document.createElement("button");W.type="button",W.className="notes-pin-btn"+(A.pinned?" active":""),W.innerHTML=A.pinned?'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:.4"><path d="M12 17v5"/><path d="M15 9.34V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H7.89"/><path d="m2 2 20 20"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h11"/></svg>',W.onclick=ce=>{ce.stopPropagation(),v(A.id)};let Y=document.createElement("div");Y.className="notes-card-meta",Y.textContent=A.folder?`${A.folder} \xB7 ${eo(A.updatedAt||A.createdAt)}`:eo(A.updatedAt||A.createdAt);let ae=document.createElement("div");ae.className="notes-card-meta",ae.textContent=String(A.text||"").replace(/\s+/g," ").trim().slice(0,80);let X=document.createElement("div");return X.className="notes-tags",(A.tags||[]).slice(0,6).forEach(ce=>{let U=document.createElement("span");U.className="notes-tag",U.textContent=`#${De(ce)}`,X.appendChild(U)}),j.appendChild(V),j.appendChild(W),T.appendChild(j),T.appendChild(Y),ae.textContent&&T.appendChild(ae),X.childElementCount&&T.appendChild(X),T.onclick=()=>c(A.id),T}function c(A){let T=Ge().find(ce=>ce.id===A);if(!T)return;a.activeId=A,a.draftId=null;let j=o("onepNotesTitle"),V=o("onepNotesBody"),W=o("onepNotesTags"),Y=o("onepNotesFolder"),ae=o("onepNotesMeta"),X=o("onepNotesPinToggle");j&&(j.value=T.title||""),V&&(V.value=T.text||""),W&&(W.value=(T.tags||[]).map(ce=>`#${De(ce)}`).join(", ")),Y&&(Y.value=T.folder||""),ae&&(ae.textContent=`atualizado: ${eo(T.updatedAt||T.createdAt)}`),X&&X.classList.toggle("active",!!T.pinned),r("edit"),V==null||V.focus()}function l(A={}){let T=Ge();if(T.length>=ii){alert("Limite de notas atingido.");return}let j=Fe(A.folder||"");if(j){let U=Array.from(new Set(T.map(G=>Fe(G.folder)).filter(Boolean)));if(!U.includes(j)&&U.length>=si){alert("Limite de pastas atingido.");return}}a.activeId=null,a.draftId=`note_${Date.now()}`,n();let V=o("onepNotesTitle"),W=o("onepNotesBody"),Y=o("onepNotesTags"),ae=o("onepNotesFolder"),X=o("onepNotesMeta"),ce=o("onepNotesPinToggle");V&&(V.value=""),W&&(W.value=""),Y&&(Y.value=(A.tags||[]).map(U=>`#${De(U)}`).join(", ")),ae&&(ae.value=j),X&&(X.textContent=""),ce&&ce.classList.remove("active"),r("edit"),W==null||W.focus()}function u(){let A=o("onepNotesTitle"),T=o("onepNotesBody"),j=o("onepNotesTags"),V=o("onepNotesFolder"),W=A?A.value.trim():"",Y=T?T.value:"",ae=j?j.value.split(",").map(De).filter(Boolean):[],X=V?Fe(V.value):"";return{title:W,text:Y,tags:ae,folder:X}}function p({title:A,text:T,folder:j,tags:V}){return!!`${A}${T}${j}${(V||[]).join("")}`.trim()}function b(){if(!a.draftId)return;let A=u();if(!p(A)){a.draftId=null;return}let T=Ge();if(T.length>=ii){a.draftId=null;return}let j={id:a.draftId,title:A.title,text:A.text,tags:A.tags,folder:A.folder,pinned:!1,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};T.unshift(j),Za(T),a.activeId=j.id,a.draftId=null}function g(){if(a.draftId){p(u())&&b();return}let A=Ge(),T=A.find(X=>X.id===a.activeId);if(!T)return;let{title:j,text:V,tags:W,folder:Y}=u();if(Y){let X=Array.from(new Set(A.map(ce=>Fe(ce.folder)).filter(Boolean)));if(!X.includes(Y)&&X.length>=si){alert("Limite de pastas atingido.");return}}T.title=j,T.text=V,T.tags=W,T.folder=Y,T.updatedAt=new Date().toISOString(),Za(A);let ae=o("onepNotesMeta");ae&&(ae.textContent=`atualizado: ${eo(T.updatedAt)}`)}function m(){clearTimeout(a.updateTimer),a.updateTimer=setTimeout(g,280)}function v(A){let T=Ge(),j=T.find(Y=>Y.id===A);if(!j)return;let V=T.filter(Y=>Y.pinned).length;if(!j.pinned&&V>=Ln){alert("Limite de fixados atingido.");return}j.pinned=!j.pinned,j.updatedAt=new Date().toISOString(),Za(T);let W=o("onepNotesPinToggle");a.activeId===A&&W&&W.classList.toggle("active",j.pinned),s()}function y(){let A=Ge(),T=A.find(V=>V.id===a.activeId);!T||!confirm(`Apagar "${ni(T)}"? Esta a\xE7\xE3o n\xE3o pode ser desfeita.`)||(Za(A.filter(V=>V.id!==a.activeId)),a.activeId=null,r("list"))}t&&t.addEventListener("click",()=>{var A;a.stage==="edit"&&b(),e.classList.remove("is-open"),(A=document.getElementById("page1"))==null||A.focus()}),new MutationObserver(()=>{let A=e.classList.contains("is-open");e.setAttribute("aria-hidden",A?"false":"true"),A&&a.stage==="list"&&s()}).observe(e,{attributes:!0,attributeFilter:["class"]}),document.addEventListener("keydown",A=>{var T;A.key==="Escape"&&e.classList.contains("is-open")&&(a.stage==="edit"?(b(),r("list")):(e.classList.remove("is-open"),(T=document.getElementById("page1"))==null||T.focus()))});let f=o("onepNotesSearch");f&&f.addEventListener("input",A=>{a.search=A.target.value,s()});let w=o("onepNotesNew"),O=o("onepNotesEmptyCreate"),R=o("onepNotesFab");w&&(w.onclick=()=>l()),O&&(O.onclick=()=>l()),R&&(R.onclick=()=>l());let D=o("onepNotesBack"),ne=o("onepNotesPinToggle"),H=o("onepNotesDelete");D&&(D.onclick=()=>{b(),r("list")}),ne&&(ne.onclick=()=>{a.activeId&&v(a.activeId)}),H&&(H.onclick=y),["onepNotesTitle","onepNotesBody","onepNotesTags","onepNotesFolder"].forEach(A=>{let T=o(A);T&&T.addEventListener("input",m)});let P=o("onepNotesOverlayClose"),J=o("onepNotesOverlayNew");P&&(P.onclick=n),J&&(J.onclick=()=>{a.overlayType==="tag"?l({tags:[a.overlayValue]}):a.overlayType==="folder"?l({folder:a.overlayValue}):l()})}var di=[{id:"comprimento_cumprimento",category:"paronimia",pattern:/\bcomprimento\b(?=\s+(?:ao|da|de|do|às|um|uma|os|as|seu|sua|meu|minha|cordial|formal|atencioso))/gi,label:"Par\xF4nimo: comprimento \xD7 cumprimento",explanation:"'Comprimento' = extens\xE3o/medida. 'Cumprimento' = sauda\xE7\xE3o ou ato de cumprir.",wrong:"Envio meus comprimentos.",right:"Envio meus cumprimentos.",area:"semantics",topic:"paronyms",detail:`## Comprimento \xD7 Cumprimento

Dois dos par\xF4nimos mais confundidos na escrita brasileira.

**Comprimento** = extens\xE3o, medida linear:
\u2713  O comprimento da mesa \xE9 de dois metros.
\u2713  Mede o comprimento da corda.

**Cumprimento** = sauda\xE7\xE3o / ato de cumprir:
\u2713  Envio meus cumprimentos ao diretor.
\u2713  O cumprimento do contrato foi rigoroso.

**Como lembrar:** comPRIMento tem a mesma raiz de "primar" (medir o primeiro). CumPRImento vem de "cumprir".

\u2717  Envio meus comprimentos.  (errado \u2014 n\xE3o \xE9 medida)
\u2713  Envio meus cumprimentos.`},{id:"eminente_iminente",category:"paronimia",pattern:/\beminente\b(?=\s+(?:perigo|risco|colapso|crise|desastre|queda|decisão|chegada|partida))/gi,label:"Par\xF4nimo: eminente \xD7 iminente",explanation:"'Eminente' = not\xE1vel, excelente. 'Iminente' = prestes a acontecer.",wrong:"H\xE1 um perigo eminente.",right:"H\xE1 um perigo iminente.",area:"semantics",topic:"paronyms",detail:`## Eminente \xD7 Iminente

**Eminente** = excelente, not\xE1vel, de grande prest\xEDgio:
\u2713  Um jurista eminente.
\u2713  Figura eminente na pol\xEDtica.

**Iminente** = que est\xE1 prestes a acontecer, imediato:
\u2713  Risco iminente de colapso.
\u2713  A chuva \xE9 iminente.

**Como lembrar:** iMinente = iMediato. O "i" inicial ajuda a lembrar da imin\xEAncia (do latim *imminere*, estar sobre, amea\xE7ar).

\u2717  Perigo eminente.  (n\xE3o \xE9 not\xE1vel \u2014 \xE9 imediato)
\u2713  Perigo iminente.`},{id:"ratificar_retificar",category:"paronimia",pattern:/\bratificar\b|\bretificar\b/gi,label:"Par\xF4nimo: ratificar \xD7 retificar",explanation:"'Ratificar' = confirmar, validar. 'Retificar' = corrigir, endireitar.",wrong:"Preciso ratificar o erro no documento.",right:"Preciso retificar o erro no documento.",area:"semantics",topic:"paronyms",detail:`## Ratificar \xD7 Retificar

**Ratificar** = confirmar, aprovar, validar o que j\xE1 existe:
\u2713  O Senado ratificou o tratado.
\u2713  Venho ratificar minha posi\xE7\xE3o anterior.

**Retificar** = corrigir, endireitar, retomar corretamente:
\u2713  Precisamos retificar o erro no relat\xF3rio.
\u2713  Retifiquei minha declara\xE7\xE3o ao juiz.

**Ra\xEDzes latinas:**
*ratificare* = tornar v\xE1lido (de *ratus*, confirmado)
*rectificare* = tornar reto/correto (de *rectus*, reto)

\u2717  Ratifique o erro. (voc\xEA confirmaria \u2014 n\xE3o corrigiria)
\u2713  Retifique o erro.`},{id:"trafego_trafico",category:"paronimia",pattern:/\btráfico\s+(?:intenso|lento|pesado|urbano|viário|de\s+veículos)\b|\btráfego\s+(?:de\s+drogas|humano|ilegal|de\s+armas)\b/gi,label:"Par\xF4nimo: tr\xE1fego \xD7 tr\xE1fico",explanation:"'Tr\xE1fego' = circula\xE7\xE3o de ve\xEDculos. 'Tr\xE1fico' = com\xE9rcio ilegal.",wrong:"O tr\xE1fico urbano estava intenso.",right:"O tr\xE1fego urbano estava intenso.",area:"semantics",topic:"paronyms",detail:`## Tr\xE1fego \xD7 Tr\xE1fico

**Tr\xE1fego** = circula\xE7\xE3o de ve\xEDculos, movimento em vias:
\u2713  O tr\xE1fego estava lento no hor\xE1rio de pico.
\u2713  Tr\xE1fego intenso na rodovia.

**Tr\xE1fico** = com\xE9rcio ilegal, especialmente de drogas ou pessoas:
\u2713  O tr\xE1fico de drogas \xE9 crime.
\u2713  Tr\xE1fico de pessoas \xE9 viola\xE7\xE3o dos direitos humanos.

\u2717  O tr\xE1fico urbano estava intenso.  (carros n\xE3o s\xE3o ilegais)
\u2713  O tr\xE1fego urbano estava intenso.

\u2717  Investigaram o tr\xE1fego de drogas.  (drogas n\xE3o s\xE3o ve\xEDculos)
\u2713  Investigaram o tr\xE1fico de drogas.`},{id:"mandato_mandado",category:"paronimia",pattern:/\bmandato\s+(?:de\s+prisão|judicial|de\s+busca|de\s+segurança)\b|\bmandado\s+(?:presidencial|parlamentar|eleitoral|de\s+quatro\s+anos)\b/gi,label:"Par\xF4nimo: mandato \xD7 mandado",explanation:"'Mandato' = per\xEDodo de exerc\xEDcio de cargo. 'Mandado' = ordem judicial.",wrong:"Cumpriu o mandado de quatro anos.",right:"Cumpriu o mandato de quatro anos.",area:"semantics",topic:"paronyms",detail:`## Mandato \xD7 Mandado

**Mandato** = per\xEDodo de exerc\xEDcio de cargo eletivo ou de representa\xE7\xE3o:
\u2713  O mandato do presidente dura quatro anos.
\u2713  Mandato parlamentar.
\u2713  Mandat\xE1rio = quem exerce o mandato.

**Mandado** = ordem judicial; ato de mandar:
\u2713  Mandado de pris\xE3o.
\u2713  Mandado de busca e apreens\xE3o.
\u2713  Mandado de seguran\xE7a (instrumento jur\xEDdico).

\u2717  O mandado presidencial termina em 2026. (n\xE3o \xE9 ordem judicial)
\u2713  O mandato presidencial termina em 2026.

\u2717  A pol\xEDcia cumpriu o mandato de pris\xE3o. (mandato \xE9 pol\xEDtico)
\u2713  A pol\xEDcia cumpriu o mandado de pris\xE3o.`},{id:"flagrante_fragrante",category:"paronimia",pattern:/\bflagrante\s+(?:perfume|aroma|cheiro|odor)\b|\bfragrante\s+(?:crime|delito|erro|mentira|injustiça)\b/gi,label:"Par\xF4nimo: flagrante \xD7 fragrante",explanation:"'Flagrante' = evidente, pego em ato. 'Fragrante' = que tem fragr\xE2ncia, perfumado.",wrong:"Um fragrante erro.",right:"Um flagrante erro.",area:"semantics",topic:"paronyms",detail:`## Flagrante \xD7 Fragrante

**Flagrante** = evidente, que salta aos olhos; situa\xE7\xE3o de pegar em ato:
\u2713  Um flagrante erro de c\xE1lculo.
\u2713  Preso em flagrante delito.
\u2713  Uma mentira flagrante.

**Fragrante** = que exala fragr\xE2ncia, perfumado (liter\xE1rio):
\u2713  O jardim fragrante de rosas.
\u2713  Uma fragrante brisa de jasmim.

\u2717  Um fragrante erro.  (erros n\xE3o t\xEAm perfume)
\u2713  Um flagrante erro.

\u2717  Preso em flagrante delito.  (correto \u2014 n\xE3o precisa corrigir)
\u2713  Um jardim fragrante. (correto \u2014 tem aroma)`},{id:"sortir_surtir",category:"paronimia",pattern:/\bsortir\s+efeito\b|\bsortiu\s+efeito\b|\bsurtiu\s+(?:o\s+)?estoque\b/gi,label:"Par\xF4nimo: sortir \xD7 surtir",explanation:"'Sortir' = abastecer com sortimento. 'Surtir' = produzir efeito, resultar.",wrong:"A medida n\xE3o sortiu efeito.",right:"A medida n\xE3o surtiu efeito.",area:"semantics",topic:"paronyms",detail:`## Sortir \xD7 Surtir

**Sortir** = abastecer de sortimento, variar (pouco usado):
\u2713  Sortir o estoque com variedade de produtos.

**Surtir** = produzir efeito, resultar:
\u2713  A medida surtiu o efeito esperado.
\u2713  O rem\xE9dio n\xE3o surtiu efeito.
\u2713  Suas palavras surtiram resultado.

\u2717  A medida n\xE3o sortiu efeito. (sortir = abastecer \u2014 sem rela\xE7\xE3o)
\u2713  A medida n\xE3o surtiu efeito.`},{id:"mas_sem_virgula",category:"pontuacao",pattern:new RegExp("(?<![,;\u2014\u2013])\\s+mas\\s+(?!que\\b)","gi"),label:"V\xEDrgula antes de 'mas' (conjun\xE7\xE3o adversativa)",explanation:"Conjun\xE7\xF5es adversativas como 'mas', 'por\xE9m', 'contudo' pedem v\xEDrgula antes.",wrong:"Estudei muito mas n\xE3o passei.",right:"Estudei muito, mas n\xE3o passei.",area:"punctuation",topic:"comma",detail:`## V\xEDrgula antes de conjun\xE7\xF5es adversativas

Conjun\xE7\xF5es adversativas \u2014 **mas, por\xE9m, contudo, todavia, entretanto, no entanto** \u2014 sempre pedem v\xEDrgula antes quando ligam duas ora\xE7\xF5es.

\u2717  Estudei muito mas n\xE3o passei.
\u2713  Estudei muito, mas n\xE3o passei.

\u2717  Tentou por\xE9m n\xE3o conseguiu.
\u2713  Tentou, por\xE9m n\xE3o conseguiu.

**Por qu\xEA?** A v\xEDrgula marca a fronteira entre as duas ora\xE7\xF5es e sinaliza a oposi\xE7\xE3o que vem. Sem ela, o leitor chega ao "mas" sem prepara\xE7\xE3o \u2014 o ritmo tromba.

**Aten\xE7\xE3o:** se "mas" est\xE1 dentro de uma ora\xE7\xE3o (como parte de express\xE3o), n\xE3o pede v\xEDrgula:
\u2713  N\xE3o s\xF3 veio mas trouxe presentes. (correla\xE7\xE3o \u2014 sem v\xEDrgula)
\u2713  Veio, mas n\xE3o ficou. (liga ora\xE7\xF5es \u2014 com v\xEDrgula)`},{id:"vocativo_sem_virgula",category:"pontuacao",pattern:/^([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)\s+(?:venha|venha|saia|entre|olhe|veja|escute|ouça|traga|vá|venha|fale|diga|faça|tome|pegue|deixe|pode|preciso|quero|você)/gm,label:"Vocativo sem v\xEDrgula",explanation:"Quando se chama algu\xE9m pelo nome diretamente, usa-se v\xEDrgula para isolar o vocativo.",wrong:"Maria venha aqui.",right:"Maria, venha aqui.",area:"punctuation",topic:"comma",detail:`## V\xEDrgula no vocativo \u2014 regra obrigat\xF3ria

O vocativo \u2014 quando se chama algu\xE9m diretamente \u2014 \xE9 sempre isolado por v\xEDrgula(s). Sem a v\xEDrgula, a frase muda de sentido ou fica amb\xEDgua.

**Vocativo no in\xEDcio:**
\u2717  Maria venha aqui.
\u2713  Maria, venha aqui.

**Vocativo no meio:**
\u2717  Venha Maria aqui.
\u2713  Venha, Maria, aqui.

**Vocativo no fim:**
\u2717  Venha aqui Maria.
\u2713  Venha aqui, Maria.

**Por que \xE9 obrigat\xF3rio?** Sem v\xEDrgula, "Maria venha" poderia ser lido como "Maria que vem" \u2014 sujeito + verbo, n\xE3o vocativo + imperativo. A v\xEDrgula faz a diferen\xE7a estrutural.

**Nomes pr\xF3prios, t\xEDtulos, apelidos:** todos seguem a mesma regra.
\u2713  Doutor, assine aqui.
\u2713  Meu filho, tome cuidado.`},{id:"aposto_sem_virgula",category:"pontuacao",pattern:/([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç]+)\s+o\s+(?:escritor|médico|advogado|professor|diretor|presidente|autor|poeta|jornalista|cientista|engenheiro)\b(?!\s*,)/gi,label:"Aposto explicativo sem v\xEDrgula",explanation:"O aposto explicativo \u2014 que esclarece o substantivo anterior \u2014 deve ser isolado por v\xEDrgulas.",wrong:"Pedro o escritor chegou.",right:"Pedro, o escritor, chegou.",area:"punctuation",topic:"comma",detail:`## V\xEDrgulas no aposto explicativo

O **aposto explicativo** \xE9 um termo que explica ou esclarece outro. Deve ser isolado por v\xEDrgulas \u2014 ou travess\xF5es, ou par\xEAnteses.

\u2717  Pedro o escritor chegou.
\u2713  Pedro, o escritor, chegou.

\u2717  A cidade S\xE3o Paulo tem 12 milh\xF5es de habitantes.  (aposto especificativo \u2014 sem v\xEDrgula \u2014 correto)
\u2713  S\xE3o Paulo, a maior cidade do Brasil, recebe milh\xF5es de turistas.  (explicativo \u2014 com v\xEDrgula)

**Aposto especificativo** (sem v\xEDrgula) \u2014 especifica qual entre v\xE1rios:
\u2713  O poeta Carlos Drummond de Andrade nasceu em Itabira.  (qual poeta? especifica)

**Aposto explicativo** (com v\xEDrgula) \u2014 acrescenta informa\xE7\xE3o sobre um ser \xFAnico:
\u2713  Carlos Drummond de Andrade, o maior poeta brasileiro do s\xE9culo XX, nasceu em Itabira.`},{id:"virgula_sujeito_verbo",category:"pontuacao",pattern:/([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç\s]{2,20}),\s+(?:foi|é|era|está|estava|fez|faz|disse|diz|chegou|chega|partiu|parte|saiu|sai)\b/gi,label:"V\xEDrgula separando sujeito do verbo",explanation:"Nunca se coloca v\xEDrgula entre o sujeito e o verbo \u2014 \xE9 erro grave de pontua\xE7\xE3o.",wrong:"A escritora que chegou cedo, foi a primeira a falar.",right:"A escritora que chegou cedo foi a primeira a falar.",area:"punctuation",topic:"comma",detail:`## Nunca v\xEDrgula entre sujeito e verbo

Uma das regras mais absolutas da pontua\xE7\xE3o: **jamais se coloca v\xEDrgula entre o sujeito e o predicado**.

\u2717  A escritora que chegou cedo, foi a primeira a falar.
\u2713  A escritora que chegou cedo foi a primeira a falar.

\u2717  O resultado do exame, surpreendeu a todos.
\u2713  O resultado do exame surpreendeu a todos.

**Por que o erro acontece?** O sujeito longo cria uma "pausa respirat\xF3ria" que o escritor registra como v\xEDrgula. Mas v\xEDrgula n\xE3o \xE9 pausa \u2014 \xE9 sinal sint\xE1tico. A pausa pode existir na leitura em voz alta sem aparecer no texto escrito.

**Exce\xE7\xE3o aparente:** quando h\xE1 aposto ou adjunto intercalado, as v\xEDrgulas isolam o intercalado \u2014 n\xE3o separam sujeito do verbo:
\u2713  A escritora, exausta, foi a primeira a falar.
     (exausta = aposto predicativo \u2014 as v\xEDrgulas isolam "exausta", n\xE3o separam sujeito de verbo)`},{id:"adjunto_longo_anteposto",category:"pontuacao",pattern:/^(?:No dia seguinte|Na semana passada|No ano anterior|Em seguida|Naquele momento|Naquela tarde|Naquele instante|Logo após|Pouco antes|Horas depois|Dias depois|Anos depois|Semanas depois|Meses depois)\s+[a-záàâãéêíóôõúüç]/gim,label:"Adjunto adverbial longo anteposto sem v\xEDrgula",explanation:"Adjuntos adverbiais longos antepostos ao sujeito pedem v\xEDrgula para separar da ora\xE7\xE3o principal.",wrong:"No dia seguinte ela foi embora.",right:"No dia seguinte, ela foi embora.",area:"punctuation",topic:"comma",detail:`## V\xEDrgula ap\xF3s adjunto adverbial anteposto

Quando um adjunto adverbial longo vem **antes do sujeito**, pede v\xEDrgula para separar da ora\xE7\xE3o principal.

\u2717  No dia seguinte ela foi embora.
\u2713  No dia seguinte, ela foi embora.

\u2717  Na semana passada aconteceu algo estranho.
\u2713  Na semana passada, aconteceu algo estranho.

**Curtos (at\xE9 3 palavras):** v\xEDrgula facultativa.
\u2713  Ontem ela chegou. (sem v\xEDrgula \u2014 correto)
\u2713  Ontem, ela chegou. (com v\xEDrgula \u2014 tamb\xE9m correto)

**Longos (mais de 3 palavras):** v\xEDrgula recomendada/obrigat\xF3ria.
\u2713  No dia seguinte ao acidente, ela foi ao hospital.

**Regra pr\xE1tica:** se o adjunto tem mais de 3 palavras e vem antes do sujeito \u2014 v\xEDrgula.`},{id:"crase_escola",category:"crase",pattern:/\bfui\s+a\s+escola\b|\bfoi\s+a\s+escola\b|\bvou\s+a\s+escola\b|\bvão\s+a\s+escola\b|\bvai\s+a\s+escola\b/gi,label:"Crase obrigat\xF3ria (verbo de movimento + feminino)",explanation:"Verbos de movimento + artigo feminino definido = crase. 'Fui \xE0 escola' (a + a = \xE0).",wrong:"Fui a escola ontem.",right:"Fui \xE0 escola ontem.",area:"syntax",topic:"crase",detail:`## Crase ap\xF3s verbo de movimento + substantivo feminino

A crase ocorre quando se fundem a **preposi\xE7\xE3o "a"** + o **artigo feminino "a"**. Resultado: **\xE0**.

Com verbos de movimento (ir, voltar, chegar, vir, correr, dirigir-se...) antes de substantivo feminino com artigo, a crase \xE9 obrigat\xF3ria.

\u2717  Fui a escola.  (preposi\xE7\xE3o "a" + artigo "a" = deveria ser "\xE0")
\u2713  Fui \xE0 escola.

\u2717  Voltou a cidade natal.
\u2713  Voltou \xE0 cidade natal.

**Teste da crase:** substitua o substantivo feminino por um masculino. Se aparecer "ao", havia crase:
\u2713  Fui **ao** col\xE9gio. \u2192 Fui **\xE0** escola. \u2713 (crase confirmada)

**Sem crase:**
\u2713  Fui a Recife. (top\xF4nimo sem artigo \u2014 sem crase)
\u2713  Fui a p\xE9. (express\xE3o adverbial \u2014 sem crase)
\u2713  Fui a uma escola nova. (artigo indefinido \u2014 sem crase)`},{id:"crase_medida",category:"crase",pattern:/\bà\s+medida\s+(?:que|em)\b/gi,label:"Crase em '\xE0 medida que' (obrigat\xF3ria)",explanation:"'\xC0 medida que' leva crase. 'Na medida em que' n\xE3o leva. S\xE3o express\xF5es diferentes.",wrong:"A medida que crescia, aprendia mais.",right:"\xC0 medida que crescia, aprendia mais.",area:"syntax",topic:"crase",detail:`## \xC0 medida que \xD7 Na medida em que

Duas express\xF5es parecidas com usos distintos \u2014 e apenas uma leva crase.

**"\xC0 medida que"** (com crase) = \xE0 propor\xE7\xE3o que, proporcionalmente:
\u2713  \xC0 medida que estudava, aprendia mais.
\u2713  Os pre\xE7os sobem \xE0 medida que a demanda aumenta.

**"Na medida em que"** (sem crase) = porque, uma vez que (causa):
\u2713  Apoio a proposta na medida em que ela resolve o problema.
\u2713  \xC9 importante, na medida em que afeta todos.

**O erro mais comum:**
\u2717  A medida que crescia... (sem crase \u2014 errado)
\u2713  \xC0 medida que crescia... (com crase \u2014 correto)

**Dica:** "\xE0 medida que" sempre fala de propor\xE7\xE3o simult\xE2nea. Se voc\xEA pode substituir por "\xE0 propor\xE7\xE3o que", use crase.`},{id:"crase_masculino",category:"crase",pattern:/\bà\s+(?:livro|texto|problema|tema|sistema|programa|tempo|lugar|ponto|momento|trabalho|estudo|projeto|resultado|homem|menino|rapaz|pai|irmão|filho|avô)\b/gi,label:"Crase indevida antes de masculino",explanation:"Crase s\xF3 ocorre antes de palavras femininas. Antes de masculinos, use 'a' simples.",wrong:"Chegou \xE0 tempo.",right:"Chegou a tempo.",area:"syntax",topic:"crase",detail:`## Crase antes de masculino \u2014 nunca

A crase \xE9 a fus\xE3o de "a" (preposi\xE7\xE3o) + "a" (artigo **feminino**). Antes de substantivos masculinos, o artigo \xE9 "o" \u2014 n\xE3o h\xE1 fus\xE3o poss\xEDvel.

\u2717  \xC0 tempo. (tempo = masculino)
\u2713  A tempo.

\u2717  Chegou \xE0 ponto de desistir. (ponto = masculino)
\u2713  Chegou a ponto de desistir.

\u2717  Refere-se \xE0 problema. (problema = masculino \u2014 mesmo que termine em -a)
\u2713  Refere-se ao problema.

**Palavras masculinas terminadas em -a que enganam:**
problema, tema, sistema, programa, clima, mapa \u2014 **todos masculinos** \u2014 todos sem crase.
\u2713  Referente ao problema. / ao tema. / ao sistema.`},{id:"crase_antes_verbo",category:"crase",pattern:/\bà\s+(?:fazer|ver|dizer|ir|ter|estar|ser|poder|querer|saber|trazer|vir|dar|pôr)\b/gi,label:"Crase antes de verbo no infinitivo \u2014 proibida",explanation:"N\xE3o existe crase antes de verbo. O acento grave antes de infinitivo \xE9 erro.",wrong:"Come\xE7ou \xE0 falar sobre o assunto.",right:"Come\xE7ou a falar sobre o assunto.",area:"syntax",topic:"crase",detail:`## Crase antes de infinitivo \u2014 proibido

Verbos n\xE3o t\xEAm artigo \u2014 portanto n\xE3o h\xE1 fus\xE3o poss\xEDvel, n\xE3o h\xE1 crase.

\u2717  Come\xE7ou \xE0 falar.
\u2713  Come\xE7ou a falar.

\u2717  Voltou \xE0 trabalhar.
\u2713  Voltou a trabalhar.

\u2717  Est\xE1 \xE0 espera. \u2192 N\xC3O \u2014 "espera" aqui \xE9 substantivo. Verifique se h\xE1 artigo impl\xEDcito.
\u2192 "\xC0 espera" (de/de uma) \u2014 pode ou n\xE3o ter crase dependendo do contexto.

**Regra absoluta:** antes de verbo no infinitivo \u2014 NUNCA crase.

**Teste:** coloque o verbo no masculino equivalente. Se n\xE3o existe masculino \u2192 \xE9 infinitivo \u2192 sem crase.`},{id:"cacofonia_via_ela",category:"semantica",pattern:/\bvia\s+ela\b|\bvia\s+ele\b/gi,label:"Cacofonia: 'via ela' \u2192 'viela'",explanation:"A jun\xE7\xE3o de 'via' + 'ela' produz o som 'viela' (beco). Reescreva.",wrong:"Via ela todos os dias.",right:"Ela via todos os dias. / Costumava v\xEA-la todos os dias.",area:"stylistics",topic:"cacophony",detail:`## Cacofonia: via ela

Cacofonia \xE9 o som desagrad\xE1vel ou indesejado produzido pela jun\xE7\xE3o de palavras.

"Via ela" \u2192 soa como "viela" (beco, travessa estreita).

\u2717  Via ela todos os dias.
\u2713  Costumava v\xEA-la todos os dias.
\u2713  Ela aparecia todos os dias.
\u2713  Eu a via todos os dias.

**O que \xE9 cacofonia?** A jun\xE7\xE3o do final de uma palavra com o in\xEDcio da pr\xF3xima produz uma terceira palavra indesejada. N\xE3o \xE9 erro gramatical \u2014 \xE9 v\xEDcio sonoro que distrai o leitor.

**Outros exemplos cl\xE1ssicos:**
\u2717  "Vi ela" \u2192 viela
\u2717  "j\xE1 que tinha" \u2192 jaquetinha  
\u2717  "me d\xEA uma m\xE3o" \u2192 m\xE3o \u2192 (contexto espec\xEDfico)

A solu\xE7\xE3o \xE9 sempre reescrever a constru\xE7\xE3o, usando pronome obl\xEDquo ou reestruturando a frase.`},{id:"eventualmente_anglicismo",category:"semantica",pattern:/\beventualmente\b/gi,label:"'Eventualmente' n\xE3o significa 'finalmente' (anglicismo)",explanation:"Em PT-BR, 'eventualmente' = \xE0s vezes, ocasionalmente. N\xE3o significa 'eventually' (ingl\xEAs) = finalmente.",wrong:"Eventualmente o projeto foi conclu\xEDdo.",right:"Por fim, o projeto foi conclu\xEDdo. / O projeto foi conclu\xEDdo por fim.",area:"semantics",topic:"false_cognates",detail:`## "Eventualmente" \u2014 falso cognato com o ingl\xEAs

Este \xE9 um dos anglicismos mais frequentes na escrita brasileira contempor\xE2nea.

**Em portugu\xEAs:** "eventualmente" = *\xE0s vezes, de vez em quando, ocasionalmente*:
\u2713  Eventualmente ele falta ao trabalho. (= \xE0s vezes)
\u2713  Isso acontece eventualmente. (= de forma eventual, n\xE3o sempre)

**Em ingl\xEAs:** "eventually" = *finalmente, com o tempo, por fim, no final das contas*

**O erro:** usar "eventualmente" com o sentido ingl\xEAs de "eventually":
\u2717  Eventualmente o projeto foi conclu\xEDdo. (querendo dizer "finalmente")
\u2713  Por fim, o projeto foi conclu\xEDdo.
\u2713  Com o tempo, o projeto foi conclu\xEDdo.
\u2713  No final, o projeto foi conclu\xEDdo.

**Dica:** se voc\xEA pode substituir por "\xE0s vezes" \u2014 est\xE1 correto. Se s\xF3 funciona com "finalmente" \u2014 est\xE1 errado.`},{id:"pleonasmo_consenso_geral",category:"pleonasmo",pattern:/\bconsenso\s+geral\b/gi,label:"Pleonasmo vicioso: 'consenso geral'",explanation:"'Consenso' j\xE1 pressup\xF5e acordo geral \u2014 'geral' \xE9 redundante.",wrong:"Chegamos a um consenso geral.",right:"Chegamos a um consenso.",area:"stylistics",topic:"figures",detail:`## Pleonasmo: consenso geral

"Consenso" vem do latim *consensus* = sentir junto, concordar **em conjunto**. A ideia de "geral" j\xE1 est\xE1 contida na palavra.

\u2717  Consenso geral.
\u2713  Consenso.

**Outros pleonasmos da mesma fam\xEDlia:**
\u2717  Unanimidade geral \u2192 \u2713  Unanimidade
\u2717  Acordo m\xFAtuo entre as partes \u2192 \u2713  Acordo entre as partes (m\xFAtuo = entre si = j\xE1 implica reciprocidade)
\u2717  Elo de liga\xE7\xE3o \u2192 \u2713  Elo (elo j\xE1 \xE9 liga\xE7\xE3o)

**Regra:** antes de adicionar um adjetivo, pergunte se ele acrescenta informa\xE7\xE3o nova ou apenas repete o que a palavra j\xE1 diz.`},{id:"pleonasmo_hemorragia",category:"pleonasmo",pattern:/\bhemorragia\s+de\s+sangue\b/gi,label:"Pleonasmo vicioso: 'hemorragia de sangue'",explanation:"'Hemorragia' j\xE1 significa derramamento de sangue \u2014 'de sangue' \xE9 redundante.",wrong:"O ferimento causou hemorragia de sangue.",right:"O ferimento causou hemorragia.",area:"stylistics",topic:"figures",detail:`## Pleonasmo: hemorragia de sangue

"Hemorragia" vem do grego *haima* (sangue) + *rhein* (fluir) = fluxo de sangue. "De sangue" repete exatamente a defini\xE7\xE3o da palavra.

\u2717  Hemorragia de sangue.
\u2713  Hemorragia.

**Outros pleonasmos m\xE9dicos semelhantes:**
\u2717  Decapitou a cabe\xE7a \u2192 \u2713  Decapitou (*deca* = cabe\xE7a em grego)
\u2717  Monop\xF3lio exclusivo \u2192 \u2713  Monop\xF3lio (*mono* = um s\xF3, exclusivo)
\u2717  Anomalia anormal \u2192 \u2713  Anomalia (*a-nomos* = fora da norma)`},{id:"pleonasmo_surpresa_inesperada",category:"pleonasmo",pattern:/\bsurpresa\s+inesperada\b|\bsurpresa\s+repentina\b/gi,label:"Pleonasmo vicioso: 'surpresa inesperada'",explanation:"'Surpresa' j\xE1 \xE9, por defini\xE7\xE3o, algo inesperado \u2014 o adjetivo \xE9 redundante.",wrong:"Foi uma surpresa inesperada.",right:"Foi uma surpresa.",area:"stylistics",topic:"figures",detail:`## Pleonasmo: surpresa inesperada

"Surpresa" = aquilo que vem sem aviso pr\xE9vio, o inesperado. Um adjetivo que diga "inesperada" ou "repentina" apenas repete o significado da palavra.

\u2717  Uma surpresa inesperada.
\u2717  Uma surpresa repentina.
\u2713  Uma surpresa.
\u2713  Um acontecimento inesperado.

**Pleonasmos de qualifica\xE7\xE3o desnecess\xE1ria \u2014 mesma fam\xEDlia:**
\u2717  Novidade nova \u2192 \u2713  Novidade
\u2717  Fato real \u2192 \u2713  Fato
\u2717  Sorriso na boca \u2192 pode ser expressivo em literatura; em prosa simples, corte "na boca"`},{id:"gerundismo_pode_estar",category:"norma",pattern:/\bpode\s+estar\s+\w+ndo\b|\bpoderia\s+estar\s+\w+ndo\b/gi,label:"Gerundismo (pode estar + ger\xFAndio)",explanation:"'Pode estar fazendo' \xE9 gerundismo. Use 'pode fazer'.",wrong:"Pode estar ligando mais tarde.",right:"Pode ligar mais tarde.",area:"variation",topic:"linguistic_variation",detail:`## Gerundismo: pode estar + ger\xFAndio

Mesma fam\xEDlia do "vou estar + ger\xFAndio". A estrutura "pode estar + ger\xFAndio" usa um verbo auxiliar desnecess\xE1rio.

\u2717  Pode estar ligando mais tarde.
\u2713  Pode ligar mais tarde.

\u2717  Poderia estar ajudando mais.
\u2713  Poderia ajudar mais.

**Ger\xFAndio correto \u2014 a\xE7\xE3o em andamento:**
\u2713  Pode estar dormindo agora. (a\xE7\xE3o em curso no presente \u2014 correto)
\u2713  Ela deve estar trabalhando. (probabilidade de estado atual \u2014 correto)

**A diferen\xE7a:** o erro \xE9 usar o ger\xFAndio para expressar a\xE7\xE3o futura ou poss\xEDvel. Quando descreve uma a\xE7\xE3o que pode estar acontecendo agora \u2014 \xE9 correto.`},{id:"nao_obstante_porem",category:"pleonasmo",pattern:/\bnão\s+obstante\s+(?:isso|,)\s+(?:porém|mas|contudo|todavia|entretanto)\b/gi,label:"Conectivos adversativos duplos (redund\xE2ncia)",explanation:"'N\xE3o obstante' j\xE1 \xE9 adversativo \u2014 seguido de 'por\xE9m', 'mas' ou 'contudo' \xE9 redundante.",wrong:"Tentou muito; n\xE3o obstante, por\xE9m, n\xE3o conseguiu.",right:"Tentou muito; n\xE3o obstante, n\xE3o conseguiu.",area:"text_production",topic:"cohesion_coherence",detail:`## Redund\xE2ncia de conectivos adversativos

"N\xE3o obstante", "por\xE9m", "contudo", "todavia", "entretanto", "mas" \u2014 todos expressam oposi\xE7\xE3o/ressalva. Usar dois seguidos \xE9 redund\xE2ncia.

\u2717  N\xE3o obstante, por\xE9m, n\xE3o conseguiu.
\u2717  Mas, contudo, a situa\xE7\xE3o piorou.
\u2713  N\xE3o obstante, n\xE3o conseguiu.
\u2713  Mas a situa\xE7\xE3o piorou.

**Conectivos adversativos que se equivalem \u2014 escolha um:**
mas / por\xE9m / contudo / todavia / entretanto / no entanto / n\xE3o obstante / ainda assim

Cada um tem nuance de formalidade, mas o valor l\xF3gico \xE9 o mesmo. Um por vez.`},{id:"conector_errado_portanto",category:"semantica",pattern:/\bportanto\s+(?:mesmo|ainda|apesar|embora)\b|\blogo\s+(?:mesmo|ainda|apesar|embora)\b/gi,label:"Conectivo de conclus\xE3o em contexto de concess\xE3o",explanation:"'Portanto' e 'logo' indicam conclus\xE3o l\xF3gica. Em contexto de concess\xE3o, use 'mesmo assim', 'ainda assim'.",wrong:"Estava cansada. Portanto ainda foi trabalhar.",right:"Estava cansada. Mesmo assim, foi trabalhar.",area:"text_production",topic:"cohesion_coherence",detail:`## Conectivo errado: portanto em lugar de mesmo assim

"Portanto" e "logo" indicam que a ora\xE7\xE3o seguinte \xE9 **consequ\xEAncia l\xF3gica e esperada** da anterior.

\u2717  Estava cansada. Portanto ainda foi trabalhar. (ir trabalhar n\xE3o decorre logicamente do cansa\xE7o)
\u2713  Estava cansada. Mesmo assim, foi trabalhar.
\u2713  Estava cansada. Ainda assim, trabalhou.

**Quando usar "portanto":**
\u2713  Estudou muito, portanto passou. (conclus\xE3o esperada)
\u2713  Chovia forte, portanto ficou em casa. (consequ\xEAncia natural)

**Quando usar "mesmo assim / ainda assim":**
\u2713  Estava cansada, mesmo assim foi trabalhar. (apesar da causa, a consequ\xEAncia \xE9 inesperada)
\u2713  Choveu muito, ainda assim sa\xEDmos. (concess\xE3o \u2014 a a\xE7\xE3o contraria a expectativa)

**Regra:** se a segunda ora\xE7\xE3o \xE9 surpreendente, use concessivo. Se \xE9 esperada, use conclusivo.`},{id:"onde_lugar",category:"semantica",pattern:/\bonde\s+(?:o\s+crime|a\s+reunião|o\s+acidente|o\s+problema|a\s+situação|o\s+momento|a\s+hora)\b/gi,label:"Uso inadequado de 'onde' para situa\xE7\xE3o/tempo",explanation:"'Onde' \xE9 pronome relativo de lugar. Para tempo ou situa\xE7\xE3o, use 'em que' ou 'no qual'.",wrong:"O momento onde tudo mudou.",right:"O momento em que tudo mudou.",area:"syntax",topic:"relative_pronouns",detail:`## "Onde" somente para lugar

"Onde" \xE9 pronome relativo que retoma **lugar**. Para outros referentes, use "em que", "no qual", "na qual".

\u2717  O momento onde tudo mudou. (momento n\xE3o \xE9 lugar)
\u2713  O momento em que tudo mudou.

\u2717  A situa\xE7\xE3o onde todos se calaram. (situa\xE7\xE3o n\xE3o \xE9 lugar)
\u2713  A situa\xE7\xE3o em que todos se calaram.

\u2717  O crime onde mais pessoas morrem. (crime n\xE3o \xE9 lugar)
\u2713  O crime em que mais pessoas morrem.

**"Onde" correto \u2014 com antecedente de lugar:**
\u2713  A cidade onde nasci.
\u2713  O lugar onde tudo come\xE7ou.
\u2713  A escola onde estudei.

**Dica:** substitua "onde" por "no qual / na qual". Se funcionar \u2192 "onde" est\xE1 correto. Se n\xE3o funcionar \u2192 use "em que".`},{id:"apesar_que",category:"regencia",pattern:/\bapesar\s+que\b/gi,label:"'Apesar que' \u2014 locu\xE7\xE3o incorreta",explanation:"'Apesar que' n\xE3o existe na norma culta. Use 'apesar de' + infinitivo ou 'embora' + subjuntivo.",wrong:"Apesar que chovesse, sa\xEDmos.",right:"Apesar de chover, sa\xEDmos. / Embora chovesse, sa\xEDmos.",area:"syntax",topic:"subordination",detail:`## "Apesar que" \u2014 forma inexistente

A locu\xE7\xE3o concessiva correta \xE9 **"apesar de"** \u2014 n\xE3o "apesar que".

\u2717  Apesar que chovesse, sa\xEDmos.
\u2713  Apesar de chover, sa\xEDmos.
\u2713  Embora chovesse, sa\xEDmos.

**"Apesar de" + substantivo / infinitivo:**
\u2713  Apesar do cansa\xE7o, continuou.
\u2713  Apesar de saber a verdade, calou-se.

**"Embora" + subjuntivo:**
\u2713  Embora soubesse, n\xE3o disse nada.
\u2713  Embora seja dif\xEDcil, vale a pena.

**Por que o erro ocorre?** Por contamina\xE7\xE3o de "ainda que" e "posto que" \u2014 que levam "que". Mas "apesar" rege preposi\xE7\xE3o "de", n\xE3o conjun\xE7\xE3o "que".`},{id:"cujo_com_artigo",category:"concordancia",pattern:/\bcujo\s+o\b|\bcuja\s+a\b|\bcujos\s+os\b|\bcujas\s+as\b/gi,label:"Artigo ap\xF3s 'cujo' \u2014 erro de dupla determina\xE7\xE3o",explanation:"'Cujo' j\xE1 funciona como determinante \u2014 n\xE3o se usa artigo depois dele. 'Cujo o' \xE9 errado.",wrong:"O autor cujo o livro vendeu mil c\xF3pias.",right:"O autor cujo livro vendeu mil c\xF3pias.",area:"syntax",topic:"relative_pronouns",detail:`## "Cujo" n\xE3o admite artigo depois

"Cujo" \xE9 pronome relativo possessivo. Por si s\xF3, determina o substantivo seguinte \u2014 como um adjetivo possessivo. Acrescentar o artigo "o/a/os/as" \xE9 redundante e agramatical.

\u2717  O autor cujo o livro vendeu mil c\xF3pias.
\u2713  O autor cujo livro vendeu mil c\xF3pias.

\u2717  A empresa cuja a sede fica em SP.
\u2713  A empresa cuja sede fica em SP.

\u2717  Os alunos cujos os pais compareceram.
\u2713  Os alunos cujos pais compareceram.

**Teste:** substitua "cujo" por "de quem" / "do qual" e veja se o artigo volta:
\u2192 "o livro do qual" \u2014 o artigo est\xE1 em "do", n\xE3o ap\xF3s "cujo".

**Lembrete de concord\xE2ncia:** cujo/cuja/cujos/cujas concorda com o possu\xEDdo (o que vem depois), n\xE3o com o possuidor.
\u2713  O escritor cujas obras s\xE3o cl\xE1ssicas. (obras = feminino plural \u2192 cujas)`},{id:"ha_vs_a_atras",category:"grafia",pattern:/\ba\s+(?:um|dois|três|quatro|cinco|seis|sete|oito|nove|dez|\d+|pouco|muito|algum)\s+(?:tempo|anos?|meses?|dias?|horas?|semanas?)\s+(?:atrás|passados?)\b/gi,label:"'A X anos atr\xE1s' \u2014 confus\xE3o entre 'a' e 'h\xE1'",explanation:"Para tempo decorrido, use 'h\xE1' (verbo haver = existir). 'A' indica dire\xE7\xE3o/destino, n\xE3o tempo passado.",wrong:"Isso aconteceu a dois anos atr\xE1s.",right:"Isso aconteceu h\xE1 dois anos.",area:"syntax",topic:"verbal_regency",detail:`## "H\xE1" vs "a" para indicar tempo

Quando se quer indicar **tempo decorrido** (no passado), usa-se **"h\xE1"** \u2014 forma do verbo "haver" impessoal.

\u2717  Isso aconteceu a dois anos atr\xE1s.
\u2713  Isso aconteceu h\xE1 dois anos.

\u2717  A muito tempo n\xE3o nos fal\xE1vamos.
\u2713  H\xE1 muito tempo n\xE3o nos fal\xE1vamos.

**"H\xE1" = verbo haver (tempo decorrido, passado):**
\u2713  H\xE1 tr\xEAs dias que n\xE3o como.
\u2713  Estudamos juntos h\xE1 dez anos.

**"A" = preposi\xE7\xE3o (tempo futuro, dist\xE2ncia):**
\u2713  Daqui a dois anos termino o curso. (futuro)
\u2713  A escola fica a dois quarteir\xF5es. (dist\xE2ncia)

**Teste:** substitua por "faz". Se funcionar \u2192 use "h\xE1":
\u2192  "Faz dois anos" \u2713 = "H\xE1 dois anos" \u2713

**Aten\xE7\xE3o:** "a X anos atr\xE1s" tem dupla marca\xE7\xE3o de passado ("a" + "atr\xE1s") \u2014 al\xE9m de errado, \xE9 redundante.`},{id:"implicar_em_transitivo",category:"regencia",pattern:/\bimplica(?:va|ndo|ou|ria|rá|ram|rão)?\s+em\b/gi,label:"Reg\xEAncia: 'implicar em' \u2014 transitivo direto",explanation:"'Implicar' no sentido de 'acarretar, pressupor' \xE9 transitivo direto \u2014 n\xE3o pede preposi\xE7\xE3o 'em'.",wrong:"A decis\xE3o implica em mudan\xE7as profundas.",right:"A decis\xE3o implica mudan\xE7as profundas.",area:"syntax",topic:"verbal_regency",detail:`## Reg\xEAncia de "implicar"

"Implicar" tem dois sentidos e duas reg\xEAncias diferentes:

**1. Acarretar, pressupor \u2192 transitivo direto (sem preposi\xE7\xE3o):**
\u2717  Isso implica em risco.
\u2713  Isso implica risco.
\u2713  A mudan\xE7a implica esfor\xE7o.
\u2713  O contrato implica responsabilidades.

**2. Envolver, comprometer (algu\xE9m em algo) \u2192 transitivo indireto:**
\u2713  Implicaram-no no crime. (transitivo direto + predicativo)
\u2713  Ele est\xE1 implicado no esquema.

**Por que o erro ocorre?** Por analogia com "resultar em", "consistir em", "redundar em" \u2014 verbos que pedem "em". Mas "implicar" (= acarretar) vai direto ao objeto, sem preposi\xE7\xE3o.

**Regra pr\xE1tica:** se voc\xEA pode substituir por "acarreta", "pressup\xF5e", "envolve" \u2014 n\xE3o use "em":
\u2713  A decis\xE3o acarreta mudan\xE7as. \u2192 A decis\xE3o implica mudan\xE7as.`},{id:"regencia_assistir_direto",category:"regencia",pattern:/\bassist(?:iu|ir|indo|iram)\s+o\s+(?:filme|jogo|show|espetáculo|evento|programa|debate|concerto|campeonato|torneio)\b/gi,label:"Reg\xEAncia: 'assistir o filme' \u2014 transitivo indireto",explanation:"'Assistir' no sentido de 'ver, presenciar' \xE9 transitivo indireto \u2014 pede preposi\xE7\xE3o 'a'.",wrong:"Assistimos o filme ontem.",right:"Assistimos ao filme ontem.",area:"syntax",topic:"verbal_regency",detail:`## Reg\xEAncia de "assistir" (ver, presenciar)

"Assistir" tem sentidos diferentes com reg\xEAncias diferentes:

**1. Ver, presenciar \u2192 transitivo indireto (pede "a"):**
\u2717  Assistimos o jogo.
\u2713  Assistimos ao jogo.
\u2713  Assisti ao filme duas vezes.
\u2713  Assistiu ao debate com aten\xE7\xE3o.

**2. Ajudar, socorrer \u2192 transitivo direto (sem preposi\xE7\xE3o):**
\u2713  O m\xE9dico assistiu o paciente. (cuidou de)
\u2713  A ONG assiste fam\xEDlias carentes. (apoia)

**3. Caber, pertencer (direito) \u2192 transitivo indireto:**
\u2713  Assiste-lhe o direito de recorrer. (= cabe-lhe)

**Como distinguir:** "ver/presenciar" sempre pede "a". Teste com pronome:
\u2192  Assisti **a ele** (ao show) \u2713 \u2014 n\xE3o: Assisti **ele** \u2717

**Aten\xE7\xE3o:** no Brasil coloquial, "assistir o jogo" est\xE1 largamente difundido \u2014 mas na escrita formal e liter\xE1ria, a reg\xEAncia culta \xE9 "assistir ao".`},{id:"acender_ascender_luz",category:"paronimia",pattern:/\bascendeu?\s+(?:a\s+luz|as\s+luzes|o\s+fogo|uma\s+vela|a\s+lareira|o\s+fogão|o\s+isqueiro|um\s+cigarro|o\s+archote)\b/gi,label:"Par\xF4nimo: acender \xD7 ascender (luz/fogo)",explanation:"'Acender' = ligar, p\xF4r fogo. 'Ascender' = subir, elevar-se. Para luz e fogo, use 'acender'.",wrong:"Ascendeu a luz da sala.",right:"Acendeu a luz da sala.",area:"semantics",topic:"paronyms",detail:`## Acender \xD7 Ascender

**Acender** = iluminar, p\xF4r fogo, ligar (aparelhos de luz ou fogo):
\u2713  Acendeu as velas.
\u2713  Acenda a luz, por favor.
\u2713  O isqueiro n\xE3o acende.

**Ascender** = subir, elevar-se (f\xEDsico ou hier\xE1rquico):
\u2713  O bal\xE3o ascendeu lentamente.
\u2713  Ascendeu ao cargo de diretor.
\u2713  A fuma\xE7a ascende pela chamin\xE9.

**O erro t\xEDpico:**
\u2717  Ascendeu a luz da sala. (luz n\xE3o sobe \u2014 \xE9 ativada)
\u2713  Acendeu a luz da sala.

\u2717  Acendeu ao poder pela for\xE7a. (poder n\xE3o se acende \u2014 se conquista)
\u2713  Ascendeu ao poder pela for\xE7a.

**Dica mnem\xF4nica:** aCENder \u2192 acESCENt \u2192 centelha (fa\xEDsca). aSCENder \u2192 aSCENs\xE3o \u2192 subida.`},{id:"acender_ascender_poder",category:"paronimia",pattern:/\bacendeu?\s+(?:ao\s+poder|ao\s+trono|ao\s+cargo|à\s+chefia|à\s+presidência|ao\s+topo|socialmente)\b/gi,label:"Par\xF4nimo: acender \xD7 ascender (poder/cargo)",explanation:"'Ascender' = elevar-se hierarquicamente. 'Acender' \xE9 ligar/iluminar \u2014 n\xE3o se usa para posi\xE7\xE3o social.",wrong:"Acendeu ao poder ap\xF3s a crise.",right:"Ascendeu ao poder ap\xF3s a crise.",area:"semantics",topic:"paronyms",detail:`## Acender \xD7 Ascender (posi\xE7\xE3o social)

Para movimento hier\xE1rquico, posi\xE7\xE3o social ou pol\xEDtica, o verbo correto \xE9 sempre **ascender**.

\u2717  Acendeu ao poder.
\u2713  Ascendeu ao poder.

\u2717  Acendeu ao trono pela linhagem.
\u2713  Ascendeu ao trono pela linhagem.

\u2717  Acendeu socialmente gra\xE7as ao estudo.
\u2713  Ascendeu socialmente gra\xE7as ao estudo.

**Fam\xEDlia de ascender:** ascens\xE3o, ascendente, ascend\xEAncia, ascensor.
**Fam\xEDlia de acender:** aceso, acendedor, inc\xEAndio (lat. *incendere*).

**Regra:** se pode ser substitu\xEDdo por "subir" ou "elevar-se" \u2192 ascender. Se pode ser substitu\xEDdo por "ligar" ou "iluminar" \u2192 acender.`},{id:"infligir_infringir_lei",category:"paronimia",pattern:/\binflig(?:iu|ir|indo|iram)\s+(?:a\s+)?(?:lei|norma|regra|código|regulamento|contrato|acordo|ordem)\b/gi,label:"Par\xF4nimo: infligir \xD7 infringir (lei/norma)",explanation:"'Infringir' = violar lei ou norma. 'Infligir' = causar (pena, sofrimento). Para leis, use 'infringir'.",wrong:"O r\xE9u infligiu as normas do contrato.",right:"O r\xE9u infringiu as normas do contrato.",area:"semantics",topic:"paronyms",detail:`## Infligir \xD7 Infringir

**Infligir** = causar, aplicar (pena, sofrimento, dano \u2014 sobre algu\xE9m):
\u2713  O juiz infligiu uma pena severa ao r\xE9u.
\u2713  A guerra infligiu sofrimento \xE0 popula\xE7\xE3o.
\u2713  Infligiu um dano irrepar\xE1vel \xE0 empresa.

**Infringir** = violar, transgredir (lei, norma, contrato):
\u2713  Infringiu o c\xF3digo de tr\xE2nsito.
\u2713  A empresa infringiu a lei trabalhista.
\u2713  Infringiu as regras do regulamento.

**O erro:**
\u2717  Infligiu a lei. (lei n\xE3o sofre \u2014 \xE9 violada)
\u2713  Infringiu a lei.

\u2717  Infringiu uma puni\xE7\xE3o ao acusado. (puni\xE7\xE3o n\xE3o \xE9 violada \u2014 \xE9 aplicada)
\u2713  Infligiu uma puni\xE7\xE3o ao acusado.

**Dica:** inFRINgir \u2192 tRINca \u2192 quebrar, violar. inFLIgir \u2192 FLIp \u2192 golpe, impacto sobre algu\xE9m.`},{id:"infligir_infringir_pena",category:"paronimia",pattern:/\binfringi(?:u|r|ndo|ram)\s+(?:uma?\s+)?(?:pena|castigo|punição|sofrimento|dano|golpe|derrota)\b/gi,label:"Par\xF4nimo: infrigir \xD7 infligir (pena/castigo)",explanation:"'Infligir' = aplicar pena ou causar sofrimento. 'Infringir' \xE9 violar \u2014 n\xE3o se aplica a castigos.",wrong:"O juiz infringiu uma pena severa.",right:"O juiz infligiu uma pena severa.",area:"semantics",topic:"paronyms",detail:`## Infligir \xD7 Infringir (pena/castigo)

"Infringir" = transgredir, violar. N\xE3o faz sentido "infringir uma pena" \u2014 pena n\xE3o \xE9 uma norma a ser violada.

\u2717  Infringiu-lhe uma puni\xE7\xE3o.
\u2713  Infligiu-lhe uma puni\xE7\xE3o.

\u2717  Infringiram ao ex\xE9rcito uma derrota humilhante.
\u2713  Infligiram ao ex\xE9rcito uma derrota humilhante.

\u2717  O examinador infringiu uma nota baixa. (nota n\xE3o se transgride)
\u2713  O examinador infligiu uma nota baixa.

**Resumo r\xE1pido:**
\u2022 infligir **a** algu\xE9m \u2192 dano, pena, sofrimento
\u2022 infringir **uma** norma \u2192 lei, regra, contrato`},{id:"deferir_diferir",category:"paronimia",pattern:/\bdiferi(?:u|ram|r|ndo)\s+(?:o\s+)?(?:pedido|requerimento|recurso|solicitação|habeas\s+corpus|mandado)\b|\bdeferiu?\s+(?:de|do|da)\s+/gi,label:"Par\xF4nimo: deferir \xD7 diferir",explanation:"'Deferir' = conceder, aprovar (pedido jur\xEDdico). 'Diferir' = ser diferente, divergir.",wrong:"O juiz diferiu o habeas corpus.",right:"O juiz deferiu o habeas corpus.",area:"semantics",topic:"paronyms",detail:`## Deferir \xD7 Diferir

**Deferir** = conceder, aprovar, dar deferimento a (pedido, requerimento):
\u2713  O juiz deferiu o pedido de liberdade.
\u2713  O requerimento foi deferido.
\u2713  Deferimento: ato de deferir. Indeferimento: recusa.

**Diferir** = ser diferente, divergir, adiar:
\u2713  Minha opini\xE3o difere da sua.
\u2713  Os resultados diferem entre si.
\u2713  Diferiu o pagamento para o m\xEAs seguinte. (= adiou)

**O erro t\xEDpico (jur\xEDdico):**
\u2717  O juiz diferiu o habeas corpus. (habeas corpus n\xE3o difere \u2014 \xE9 deferido ou indeferido)
\u2713  O juiz deferiu o habeas corpus.

\u2717  A senten\xE7a deferiu do esperado. (senten\xE7a n\xE3o concede "de" algo \u2014 difere)
\u2713  A senten\xE7a diferiu do esperado.

**Fam\xEDlia:** deferir \u2192 deferimento \u2192 indeferir. Diferir \u2192 diferen\xE7a \u2192 diferente.`},{id:"realizar_anglicismo",category:"semantica",pattern:/\breali(?:zou|za|zei|zamos|zaram|zar)\s+que\b/gi,label:"'Realizar que' \u2014 anglicismo sem\xE2ntico",explanation:"Em PT-BR, 'realizar' = concretizar, executar. O sentido de 'perceber' \xE9 anglicismo de 'to realize'.",wrong:"Realizou que havia cometido um erro.",right:"Percebeu que havia cometido um erro.",area:"semantics",topic:"false_cognates",detail:`## "Realizar que" \u2014 falso cognato com o ingl\xEAs

Este anglicismo sem\xE2ntico contaminou a escrita brasileira via textos traduzidos do ingl\xEAs.

**Em ingl\xEAs:** "to realize" = perceber, notar, tomar consci\xEAncia de
**Em portugu\xEAs:** "realizar" = concretizar, executar, levar a efeito

**O erro:**
\u2717  Realizei que estava errado. (querendo dizer "percebi")
\u2717  Ela realizou que o amava.
\u2717  Realizamos que o projeto falharia.

**As formas corretas em PT-BR:**
\u2713  Percebeu que havia cometido um erro.
\u2713  Notou que algo estava errado.
\u2713  Tomou consci\xEAncia do problema.
\u2713  Deu-se conta de que o amava.
\u2713  Compreendeu que o projeto falharia.

**"Realizar" correto em PT-BR:**
\u2713  Realizou o sonho de inf\xE2ncia. (= concretizou)
\u2713  A empresa realizou lucro recorde. (= obteve)
\u2713  O evento foi realizado no s\xE1bado. (= executado)`},{id:"diante_do_exposto",category:"redundancia",pattern:/\bdiante\s+do\s+(?:acima\s+)?exposto\b/gi,label:"Clich\xEA burocr\xE1tico: 'diante do exposto'",explanation:"F\xF3rmula de encerramento burocr\xE1tico. Em prosa liter\xE1ria ou jornal\xEDstica, conclua diretamente.",wrong:"Diante do exposto, conclui-se que a proposta \xE9 vi\xE1vel.",right:"A proposta, portanto, \xE9 vi\xE1vel.",area:"text_production",topic:"cohesion_coherence",detail:`## "Diante do exposto" \u2014 clich\xEA burocr\xE1tico

Esta f\xF3rmula pertence ao registro **jur\xEDdico-burocr\xE1tico**. Em textos liter\xE1rios, jornal\xEDsticos ou acad\xEAmicos de qualidade, ela soa artificial e evasiva.

\u2717  Diante do exposto, conclui-se que...
\u2713  A an\xE1lise indica, portanto, que...
\u2713  Isso demonstra que...
\u2713  Conclui-se, assim, que...

**Por que evitar?** A express\xE3o posterga a conclus\xE3o com uma ora\xE7\xE3o preambular desnecess\xE1ria. O leitor j\xE1 sabe o que foi exposto \u2014 n\xE3o precisa que voc\xEA o anuncie.

**Outros clich\xEAs do mesmo registro:**
\u2717  Tendo em vista o acima exposto...
\u2717  Em vista do que foi dito...
\u2717  Pelo exposto anteriormente...

**Regra:** se a frase pode come\xE7ar diretamente pela conclus\xE3o, comece por ela.`},{id:"no_que_tange",category:"redundancia",pattern:/\bno\s+que\s+(?:tange|diz\s+respeito|concerne)\s+(?:a|ao|à|aos|às)\b/gi,label:"Jarg\xE3o burocr\xE1tico: 'no que tange a'",explanation:"Express\xE3o burocr\xE1tica pesada. Prefira 'quanto a', 'sobre', 'em rela\xE7\xE3o a', 'no que se refere a'.",wrong:"No que tange ao or\xE7amento, h\xE1 problemas.",right:"Quanto ao or\xE7amento, h\xE1 problemas.",area:"text_production",topic:"cohesion_coherence",detail:`## "No que tange a" \u2014 jarg\xE3o pesado

Esta constru\xE7\xE3o \xE9 v\xE1lida gramaticalmente, mas pertence ao jarg\xE3o burocr\xE1tico formal \u2014 soa r\xEDgida e distante na maioria dos textos.

\u2717  No que tange ao or\xE7amento...
\u2717  No que diz respeito \xE0s medidas...
\u2717  No que concerne ao projeto...

**Alternativas diretas:**
\u2713  Quanto ao or\xE7amento...
\u2713  Sobre as medidas...
\u2713  Em rela\xE7\xE3o ao projeto...
\u2713  No que se refere ao prazo... (se quiser manter certa formalidade)

**Contextos em que \xE9 aceit\xE1vel:**
O jarg\xE3o \xE9 adequado em textos jur\xEDdicos, normativos ou regulat\xF3rios onde a precis\xE3o burocr\xE1tica \xE9 esperada. Em outros contextos, substitua.

**Princ\xEDpio:** quanto mais simples e direta a constru\xE7\xE3o, mais clara a escrita.`},{id:"sendo_que",category:"classe_palavras",pattern:/\bsendo\s+que\b/gi,label:"'Sendo que' \u2014 conector inadequado",explanation:"'Sendo que' n\xE3o \xE9 conjun\xE7\xE3o aceita na norma culta. Substitua por 'e', 'pois', 'uma vez que' ou reescreva.",wrong:"Chegou tarde, sendo que avisou ningu\xE9m.",right:"Chegou tarde e n\xE3o avisou ningu\xE9m.",area:"text_production",topic:"cohesion_coherence",detail:`## "Sendo que" \u2014 n\xE3o \xE9 conjun\xE7\xE3o

"Sendo que" \xE9 uma constru\xE7\xE3o coloquial amplamente difundida, mas **n\xE3o \xE9 aceita na norma culta** como conjun\xE7\xE3o coordenativa ou subordinativa.

\u2717  Comprou o carro, sendo que n\xE3o tinha dinheiro.
\u2713  Comprou o carro mesmo sem dinheiro.
\u2713  Comprou o carro, embora n\xE3o tivesse dinheiro.

\u2717  Estudou muito, sendo que passou em primeiro.
\u2713  Estudou muito e passou em primeiro.
\u2713  Estudou muito, raz\xE3o pela qual passou em primeiro.

**Qual conjun\xE7\xE3o usar?**
\u2014 Se a ideia \xE9 adi\xE7\xE3o: **"e"**
\u2014 Se \xE9 causa: **"pois", "porque", "uma vez que"**
\u2014 Se \xE9 concess\xE3o: **"embora", "ainda que", "apesar de"**
\u2014 Se \xE9 consequ\xEAncia: **"de modo que", "tanto que", "raz\xE3o pela qual"**

**Por que o erro ocorre?** "Sendo que" \xE9 uma tentativa de criar uma "mini-ora\xE7\xE3o" de apoio. Em vez disso, integre a ideia com a conjun\xE7\xE3o adequada ou reescreva em duas frases.`},{id:"fazer_verbo_nominalizado",category:"redundancia",pattern:/\bfazer\s+uma\s+(?:reflexão|análise|avaliação|discussão|consideração|abordagem|exposição|menção|referência|alusão|distinção)\b/gi,label:"Verbo nominalizado: 'fazer uma reflex\xE3o'",explanation:"Constru\xE7\xE3o evasiva que dilui o verbo em substantivo. Use o verbo direto: 'refletir', 'analisar', 'avaliar'.",wrong:"Vamos fazer uma an\xE1lise do problema.",right:"Vamos analisar o problema.",area:"stylistics",topic:"style",detail:`## Nominaliza\xE7\xE3o evasiva \u2014 "fazer uma X"

Esta constru\xE7\xE3o dilui a a\xE7\xE3o em duas palavras onde uma basta. \xC9 marca de escrita burocr\xE1tica e faz a prosa perder for\xE7a.

\u2717  Fazer uma reflex\xE3o sobre o tema.
\u2713  Refletir sobre o tema.

\u2717  Fazer uma an\xE1lise dos dados.
\u2713  Analisar os dados.

\u2717  Fazer uma avalia\xE7\xE3o do projeto.
\u2713  Avaliar o projeto.

\u2717  Fazer uma distin\xE7\xE3o entre os casos.
\u2713  Distinguir os casos.

\u2717  Fazer refer\xEAncia ao autor.
\u2713  Citar o autor. / Referir-se ao autor.

**Por que a nominaliza\xE7\xE3o enfraquece o texto?**
O verbo \xE9 o n\xFAcleo da a\xE7\xE3o. Transform\xE1-lo em substantivo e usar "fazer" como verbo-suporte transfere o peso sem\xE2ntico para um substantivo gen\xE9rico \u2014 a frase perde precis\xE3o e ritmo.

**Regra de ouro:** se existe um verbo direto para a a\xE7\xE3o, use-o.`}];var oo=null,ui=!1;function In(){return S(this,null,function*(){if(!(oo||ui)){ui=!0;try{let e=yield fetch("src/assets/lingua/pt_accent_map.json");e.ok&&(oo=yield e.json())}catch(e){}}})}function $n(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}}var ot=new Set(["que","se","pois","porque","ora","para","pela","pelo","pelas","pelos","pode","podes","tem","tens","vem","vens","nos","lhe","lhes","ele","ela","aquele","aquela","aqueles","aquelas","aquilo","so","co","disse","corre","corra","bebe","parte","come","vive","fez","vez","vezes","pez","boa","dia","dias","agora","lugar","lugares","coisa","coisas","casa","vida","base","arte","tipo","modo"]),tt={concordancia:{cor:"#5c6bc0",label:"Concord\xE2ncia"},regencia:{cor:"#00838f",label:"Reg\xEAncia"},pleonasmo:{cor:"#558b2f",label:"Pleonasmo"},norma:{cor:"#e65100",label:"Norma culta"},grafia:{cor:"#ef5350",label:"Grafia"},acento:{cor:"#7c4dff",label:"Acentua\xE7\xE3o"},hifen:{cor:"#1565c0",label:"H\xEDfen"},tipografia:{cor:"#78909c",label:"Tipografia"},morfologia:{cor:"#546e7a",label:"Morfologia"},paronimia:{cor:"#c62828",label:"Paron\xEDmia"},pontuacao:{cor:"#ef6c00",label:"Pontua\xE7\xE3o"},crase:{cor:"#7b1fa2",label:"Crase"},semantica:{cor:"#2e7d32",label:"Sem\xE2ntica"}},jn=[{id:"haver_existencial",category:"concordancia",pattern:/\bhaviam\b|\bhouveram\b(?=\s+\w)/gi,label:"Aten\xE7\xE3o ao verbo haver (concord\xE2ncia verbal)",explanation:"Quando 'haver' significa 'existir', \xE9 impessoal \u2014 sem sujeito, sem concord\xE2ncia, sempre no singular.",wrong:"Haviam muitas pessoas na fila.",right:"Havia muitas pessoas na fila.",area:"syntax",topic:"concordancia",detail:`## Por que "haviam" est\xE1 errado aqui?

"Haver" no sentido de *existir* ou *ocorrer* \xE9 um verbo **impessoal**: n\xE3o tem sujeito gramatical. Sem sujeito, n\xE3o h\xE1 concord\xE2ncia \u2014 o verbo fica fixo no singular.

O erro acontece porque confundimos com "ter", que concorda normalmente:

\u2717  Haviam muitas pessoas na fila.
\u2713  Havia muitas pessoas na fila.
\u2713  Tinha muitas pessoas na fila. (informal, mas "ter" concorda)

**Todos os tempos verbais \u2014 sempre no singular:**

\u2717  Haver\xE3o problemas s\xE9rios.      \u2713  Haver\xE1 problemas s\xE9rios.
\u2717  Houveram muitos acidentes.     \u2713  Houve muitos acidentes.
\u2717  H\xE3o muitas d\xFAvidas.            \u2713  H\xE1 muitas d\xFAvidas.

\u26A0  Aten\xE7\xE3o: "haver de" (= dever, ter obriga\xE7\xE3o) **tem sujeito** \u2014 a\xED concorda:
\u2713  Eles h\xE3o de chegar.
\u2713  Ela h\xE1 de vencer.

**Dica r\xE1pida:** substitua "haver" por "existir". Se "existe muita gente" fizer sentido, use "havia" \u2014 singular. Funciona em qualquer tempo verbal.`},{id:"fazer_temporal",category:"concordancia",pattern:/\bfaziam\b(?=\s+\d|\s+anos|\s+meses|\s+dias|\s+horas)/gi,label:"Aten\xE7\xE3o ao verbo fazer (concord\xE2ncia verbal)",explanation:"Para indicar tempo decorrido, 'fazer' \xE9 impessoal \u2014 sempre no singular.",wrong:"Faziam dois anos que partiu.",right:"Fazia dois anos que partiu.",area:"syntax",topic:"concordancia",detail:`## Por que "faziam" est\xE1 errado aqui?

Assim como "haver", o verbo **fazer** indica tempo decorrido de forma **impessoal** \u2014 sem sujeito. Fica sempre no singular, independentemente do n\xFAmero que vem depois.

\u2717  Faziam dois anos que partiu.
\u2713  Fazia dois anos que partiu.

\u2717  Fazem tr\xEAs meses que n\xE3o nos falamos.  (errado \u2014 "fazem" concorda indevidamente)
\u2713  Faz tr\xEAs meses que n\xE3o nos falamos.

**Todos os tempos:**
\u2717  Far\xE3o dez anos amanh\xE3.       \u2713  Far\xE1 dez anos amanh\xE3.
\u2717  Fizeram muitos anos.         \u2713  Fez muitos anos.

**Dica:** se voc\xEA pode substituir por "decorreu" no singular ("decorreu um ano"), use "faz/fazia" no singular.`},{id:"subir_cima",category:"pleonasmo",pattern:/\bsubir\s+pra\s+cima\b|\bsubiu\s+pra\s+cima\b|\bsubindo\s+para\s+cima\b/gi,label:"Palavra sobrando (pleonasmo vicioso)",explanation:"'Subir' j\xE1 cont\xE9m a dire\xE7\xE3o ascendente \u2014 'pra cima' \xE9 redundante.",wrong:"Subiu pra cima do morro.",right:"Subiu o morro.",area:"stylistics",topic:"figures",detail:`## O que \xE9 pleonasmo vicioso?

Pleonasmo vicioso \xE9 quando uma palavra repete o sentido de outra sem acrescentar nada \u2014 ao contr\xE1rio do pleonasmo liter\xE1rio, que existe para \xEAnfase expressiva.

"Subir" j\xE1 cont\xE9m a ideia de *movimento para cima*. Adicionar "pra cima" \xE9 escrever o mesmo duas vezes.

\u2717  Subiu pra cima do morro.
\u2713  Subiu o morro. / Subiu ao morro.

**Fam\xEDlia do mesmo erro:**
\u2717  Desceu pra baixo   \u2192  \u2713  Desceu
\u2717  Entrou dentro      \u2192  \u2713  Entrou em
\u2717  Saiu fora          \u2192  \u2713  Saiu de
\u2717  Chorou l\xE1grimas    \u2192  \u2713  Chorou (pleonasmo liter\xE1rio, aceit\xE1vel em poesia)

**Aten\xE7\xE3o:** pleonasmo *liter\xE1rio* \xE9 diferente. "Sorriso na boca", "ouvir com os ouvidos" podem ser recursos expressivos \u2014 o problema \xE9 quando o pleonasmo enfraquece em vez de refor\xE7ar.`},{id:"descer_baixo",category:"pleonasmo",pattern:/\bdescer\s+pra\s+baixo\b|\bdesceu\s+pra\s+baixo\b|\bdescendo\s+para\s+baixo\b/gi,label:"Palavra sobrando (pleonasmo vicioso)",explanation:"'Descer' j\xE1 implica movimento para baixo \u2014 'pra baixo' \xE9 redundante.",wrong:"Desceu pra baixo da ladeira.",right:"Desceu a ladeira.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: descer + pra baixo

"Descer" j\xE1 cont\xE9m a dire\xE7\xE3o descendente. "Pra baixo" n\xE3o acrescenta nenhuma informa\xE7\xE3o nova.

\u2717  Desceu pra baixo da ladeira.
\u2713  Desceu a ladeira.

**Erros da mesma fam\xEDlia:**
\u2717  Subiu pra cima     \u2192  \u2713  Subiu
\u2717  Entrou dentro      \u2192  \u2713  Entrou em
\u2717  Saiu fora          \u2192  \u2713  Saiu de
\u2717  Voltou para tr\xE1s   \u2192  \u2713  Voltou`},{id:"entrar_dentro",category:"pleonasmo",pattern:/\bentrar\s+dentro\b|\bentrou\s+dentro\b|\bentrando\s+dentro\b/gi,label:"Palavra sobrando (pleonasmo vicioso)",explanation:"'Entrar' j\xE1 significa ir para dentro \u2014 'dentro' \xE9 redundante.",wrong:"Entrou dentro da casa.",right:"Entrou na casa.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: entrar + dentro

"Entrar" j\xE1 carrega a ideia de *ir para o interior de algo*. "Dentro" repete exatamente isso.

\u2717  Entrou dentro da casa.
\u2713  Entrou na casa.

\u2717  Entrando dentro do carro.
\u2713  Entrando no carro.

**Exce\xE7\xE3o aparente:** "entrar para dentro" pode aparecer em constru\xE7\xF5es enf\xE1ticas coloquiais ("Vai entrar para dentro!"), mas \xE9 marcadamente oral. Na escrita, corte.

**Fam\xEDlia do erro:**
\u2717  Saiu fora        \u2192  \u2713  Saiu de
\u2717  Subiu pra cima   \u2192  \u2713  Subiu`},{id:"sair_fora",category:"pleonasmo",pattern:/\bsair\s+fora\b|\bsaiu\s+fora\b|\bsaindo\s+fora\b/gi,label:"Palavra sobrando (pleonasmo vicioso)",explanation:"'Sair' j\xE1 \xE9 movimento para fora \u2014 'fora' \xE9 redundante.",wrong:"Saiu fora do escrit\xF3rio.",right:"Saiu do escrit\xF3rio.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: sair + fora

"Sair" j\xE1 implica movimento para o exterior. "Fora" n\xE3o acrescenta informa\xE7\xE3o \u2014 apenas repete.

\u2717  Saiu fora do escrit\xF3rio.
\u2713  Saiu do escrit\xF3rio.

\u2717  Saindo fora da curva.  (met\xE1fora, mas redundante)
\u2713  Saindo da curva.

**Aten\xE7\xE3o \xE0 met\xE1fora:** "sair fora da curva" \xE9 coloquial e bastante comum. Em texto informal pode passar. Em texto formal, corte.`},{id:"ha_anos_atras",category:"pleonasmo",pattern:/\bhá\s+\d+\s+anos?\s+atrás\b|\bhá\s+\d+\s+meses?\s+atrás\b|\bhá\s+\d+\s+dias?\s+atrás\b/gi,label:"Palavra sobrando (pleonasmo vicioso)",explanation:"'H\xE1' j\xE1 situa no passado \u2014 'atr\xE1s' repete a mesma ideia.",wrong:"Conheci-a h\xE1 3 anos atr\xE1s.",right:"Conheci-a h\xE1 3 anos.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: h\xE1 + atr\xE1s

"H\xE1" (do verbo haver) j\xE1 indica que o evento ocorreu no passado. "Atr\xE1s" repete exatamente isso \u2014 os dois marcam passado ao mesmo tempo.

\u2717  Conheci-a h\xE1 3 anos atr\xE1s.
\u2713  Conheci-a h\xE1 3 anos.
\u2713  Conheci-a 3 anos atr\xE1s.   (sem "h\xE1", a\xED funciona)

**Regra:** use um ou outro, nunca os dois.

"H\xE1 3 anos" = o verbo situa no passado.
"3 anos atr\xE1s" = o adv\xE9rbio situa no passado.
"H\xE1 3 anos atr\xE1s" = dupla marca\xE7\xE3o = redund\xE2ncia.`},{id:"prefiro_mais_que",category:"pleonasmo",pattern:/\bprefiro\s+\w+\s+mais\s+(do\s+que|que)\b/gi,label:"Preferir j\xE1 \xE9 comparativo (redund\xE2ncia)",explanation:"'Preferir' j\xE1 carrega compara\xE7\xE3o \u2014 'mais' \xE9 redundante, e a reg\xEAncia pede 'a', n\xE3o 'do que'.",wrong:"Prefiro ch\xE1 mais do que caf\xE9.",right:"Prefiro ch\xE1 a caf\xE9.",area:"stylistics",topic:"figures",detail:`## Por que "prefiro mais do que" est\xE1 errado?

Dois problemas ao mesmo tempo:

**1. Redund\xE2ncia:** "preferir" j\xE1 cont\xE9m a ideia de compara\xE7\xE3o ("considero melhor que"). Adicionar "mais" \xE9 repetir o grau comparativo.

**2. Reg\xEAncia errada:** o verbo "preferir" exige a preposi\xE7\xE3o "a", n\xE3o "do que".

\u2717  Prefiro caf\xE9 mais do que ch\xE1.
\u2713  Prefiro caf\xE9 a ch\xE1.

\u2717  Preferia sil\xEAncio mais que barulho.
\u2713  Preferia sil\xEAncio a barulho.

**Aten\xE7\xE3o:** na fala coloquial, "prefiro X do que Y" \xE9 amplamente aceito. Na escrita padr\xE3o, a norma \xE9 "prefiro X a Y".`},{id:"mas_porem",category:"pleonasmo",pattern:/\bmas\s+porém\b|\bporém\s+mas\b/gi,label:"Dois conectivos, mesmo sentido (redund\xE2ncia)",explanation:"'Mas' e 'por\xE9m' s\xE3o sin\xF4nimos adversativos \u2014 use s\xF3 um.",wrong:"Tentei, mas por\xE9m n\xE3o consegui.",right:"Tentei, mas n\xE3o consegui.",area:"text_production",topic:"cohesion_coherence",detail:`## Por que "mas por\xE9m" est\xE1 errado?

"Mas" e "por\xE9m" s\xE3o conjun\xE7\xF5es adversativas sin\xF4nimas: as duas expressam oposi\xE7\xE3o ou ressalva. Usar as duas seguidas \xE9 redund\xE2ncia pura \u2014 como dizer "por\xE9m mas" ou "no entanto contudo".

\u2717  Tentei, mas por\xE9m n\xE3o consegui.
\u2713  Tentei, mas n\xE3o consegui.
\u2713  Tentei; por\xE9m n\xE3o consegui.

**Conectivos adversativos que se equivalem:**
mas / por\xE9m / contudo / todavia / entretanto / no entanto

Todos t\xEAm o mesmo valor l\xF3gico. Escolha um para cada lugar.

**Dica de estilo:** "mas" \xE9 mais \xE1gil e direto. "Por\xE9m", "contudo", "todavia" s\xE3o mais formais e ficam bem no in\xEDcio de frase ou em texto dissertativo.`},{id:"gerundismo_vou_estar",category:"norma",pattern:/\bvou\s+estar\s+\w+ndo\b/gi,label:"Jeito de call center (gerundismo)",explanation:"'Vou estar + ger\xFAndio' \xE9 gerundismo corporativo \u2014 use o futuro sint\xE9tico.",wrong:"Vou estar enviando o arquivo.",right:"Enviarei o arquivo.",area:"variation",topic:"linguistic_variation",detail:`## O que \xE9 gerundismo e por que evitar?

Gerundismo \xE9 o uso de "estar + ger\xFAndio" no lugar do futuro sint\xE9tico. Ficou famoso nos scripts de call center dos anos 2000 e virou marca de linguagem corporativa artificial.

O problema n\xE3o \xE9 gramatical \u2014 \xE9 de estilo. A constru\xE7\xE3o existe na l\xEDngua, mas soa mec\xE2nica e evasiva na escrita.

\u2717  Vou estar enviando o arquivo.
\u2713  Enviarei o arquivo.
\u2713  Vou enviar o arquivo.  (futuro perifr\xE1stico, mais natural)

\u2717  Estarei aguardando seu retorno.
\u2713  Aguardarei seu retorno.
\u2713  Fico no aguardo.

**Contextos em que o ger\xFAndio \xE9 correto:**
\u2713  Estou enviando agora.   (a\xE7\xE3o em curso no presente \u2014 correto)
\u2713  Estava dormindo quando chegou.  (a\xE7\xE3o em curso no passado \u2014 correto)

O erro \xE9 usar a estrutura para expressar *futuro*, quando o portugu\xEAs tem formas pr\xF3prias para isso.`},{id:"gerundismo_estarei",category:"norma",pattern:/\bestarei\s+\w+ndo\b/gi,label:"Jeito de call center (gerundismo)",explanation:"'Estarei + ger\xFAndio' \xE9 gerundismo \u2014 use o futuro sint\xE9tico do verbo principal.",wrong:"Estarei aguardando seu retorno.",right:"Aguardarei seu retorno.",area:"variation",topic:"linguistic_variation",detail:`## Gerundismo com "estarei"

Mesma l\xF3gica do "vou estar + ger\xFAndio": a estrutura "estarei + ger\xFAndio" usa um verbo auxiliar desnecess\xE1rio quando o futuro sint\xE9tico basta.

\u2717  Estarei aguardando seu retorno.
\u2713  Aguardarei seu retorno.

\u2717  Estarei verificando assim que poss\xEDvel.
\u2713  Verificarei assim que poss\xEDvel.

**Futuro sint\xE9tico dos verbos mais usados:**
enviar \u2192 enviarei / aguardar \u2192 aguardarei / verificar \u2192 verificarei
analisar \u2192 analisarei / retornar \u2192 retornarei / confirmar \u2192 confirmarei

**Dica de estilo:** o futuro sint\xE9tico \xE9 mais preciso, mais compacto e soa mais confiante. Gerundismo muitas vezes passa uma impress\xE3o de indecis\xE3o ou de falar para n\xE3o dizer nada.`},{id:"nivel_de",category:"norma",pattern:/\bà\s+nível\s+de\b|\bao\s+nível\s+de\b/gi,label:"Crase que n\xE3o existe aqui (norma culta)",explanation:"'N\xEDvel' pede a preposi\xE7\xE3o 'em', n\xE3o 'a' \u2014 sem 'a', sem crase.",wrong:"\xC0 n\xEDvel de Brasil.",right:"Em n\xEDvel nacional.",area:"syntax",topic:"regencia",detail:`## Por que "\xE0 n\xEDvel de" est\xE1 errado?

Dois problemas combinados:

**1. Galicismo:** a express\xE3o "\xE0 niveau de" vem do franc\xEAs e foi incorporada ao portugu\xEAs de forma errada. A preposi\xE7\xE3o que "n\xEDvel" pede em portugu\xEAs \xE9 "em", n\xE3o "a".

**2. Crase indevida:** crase = "a" (preposi\xE7\xE3o) + "a" (artigo). Se a preposi\xE7\xE3o \xE9 "em", n\xE3o h\xE1 "a" \u2014 portanto n\xE3o h\xE1 crase.

\u2717  \xC0 n\xEDvel de Brasil.
\u2717  Ao n\xEDvel de Brasil.
\u2713  Em n\xEDvel nacional.
\u2713  No \xE2mbito nacional.
\u2713  No plano nacional.

**Exce\xE7\xE3o real:** "ao n\xEDvel do mar" \u2014 aqui sim est\xE1 correto. "N\xEDvel do mar" \xE9 uma express\xE3o de medida f\xEDsica, e "ao" funciona como "na altura de". Mas isso \xE9 diferente de "\xE0 n\xEDvel de" como express\xE3o vaga de escopo.`},{id:"chegou_em",category:"regencia",pattern:/\bchegou\s+em\b/gi,label:"Reg\xEAncia do verbo chegar",explanation:"'Chegar' exige a preposi\xE7\xE3o 'a' na escrita padr\xE3o \u2014 n\xE3o 'em'.",wrong:"O \xF4nibus chegou em S\xE3o Paulo.",right:"O \xF4nibus chegou a S\xE3o Paulo.",area:"syntax",topic:"regencia",detail:`## Chegar a ou chegar em?

Na norma padr\xE3o escrita, "chegar" exige a preposi\xE7\xE3o **"a"**. O uso de "em" \xE9 coloquial e oral \u2014 muito comum na fala, mas marcado negativamente na escrita formal.

\u2717  O \xF4nibus chegou em S\xE3o Paulo.
\u2713  O \xF4nibus chegou a S\xE3o Paulo.

\u2717  Ela chegou em casa tarde.
\u2713  Ela chegou em casa tarde.  \u2190 exce\xE7\xE3o: "chegar em casa" \xE9 consagrado pelo uso

**A exce\xE7\xE3o de "casa":** "chegar em casa" (sem artigo) \xE9 aceito inclusive por gram\xE1ticos, pois "casa" aqui funciona como adv\xE9rbio de lugar, n\xE3o como substantivo. J\xE1 "chegar na casa" (com artigo) pede "a": "chegar \xE0 casa".

**Com artigo feminino:**
\u2713  Chegou \xE0 cidade.  (a + a = \xE0)
\u2713  Chegou ao aeroporto.  (a + o = ao)

**Dica:** se depois vem artigo feminino, vai aparecer "\xE0". Se parece estranho, considere reescrever: "aterrissar em", "desembarcar em" \u2014 verbos que aceitam "em" sem marca\xE7\xE3o.`},{id:"razao_porque",category:"regencia",pattern:/\bpelo\s+motivo\s+(?:de\s+)?porque\b/gi,label:"Por que ou porque? (reg\xEAncia nominal)",explanation:"Depois de 'motivo' ou 'raz\xE3o', use 'por que' separado \u2014 ele retoma o substantivo.",wrong:"O motivo porque partiu foi a saudade.",right:"O motivo por que partiu foi a saudade.",area:"syntax",topic:"regencia",detail:`## Os quatro "porqu\xEAs" \u2014 guia definitivo

**1. Por que** (separado, sem acento) \u2192 pergunta / pronome relativo
\u2713  Por que voc\xEA foi embora?  (pergunta)
\u2713  O motivo por que partiu foi a saudade.  (= pelo qual)

**2. Porque** (junto, sem acento) \u2192 conjun\xE7\xE3o causal/explicativa
\u2713  Fui embora porque estava cansada.  (explica\xE7\xE3o, resposta)
\u2713  Chore, porque a situa\xE7\xE3o \xE9 grave.  (explica\xE7\xE3o)

**3. Por qu\xEA** (separado, com acento) \u2192 no final de frase ou antes de pausa
\u2713  Voc\xEA foi embora, mas n\xE3o disse por qu\xEA.
\u2713  Fui. Por qu\xEA? N\xE3o sei.

**4. Porqu\xEA** (junto, com acento) \u2192 substantivo (= o motivo, a raz\xE3o)
\u2713  N\xE3o entendo o porqu\xEA dessa decis\xE3o.
\u2713  Explique-me o porqu\xEA.

**Dica r\xE1pida:** se d\xE1 para substituir por "pelo qual" ou "pela qual", \xE9 "por que" separado.`},{id:"cesso_acesso",category:"grafia",pattern:/\bcesso\b/gi,label:"Grafia incorreta: 'cesso'",explanation:"'Cesso' n\xE3o existe \u2014 a palavra \xE9 'acesso', sempre com 'ac' inicial.",wrong:"N\xE3o tenho cesso ao sistema.",right:"N\xE3o tenho acesso ao sistema.",area:"orthography",topic:"spelling_rules",detail:`## Por que "cesso" est\xE1 errado?

"Cesso" n\xE3o \xE9 uma palavra do portugu\xEAs. O que existe \xE9 "acesso" \u2014 substantivo derivado do latim *accessus* (aproxima\xE7\xE3o, entrada). O "ac" inicial \xE9 parte da palavra, n\xE3o um prefixo separ\xE1vel.

\u2717  N\xE3o tenho cesso ao sistema.
\u2713  N\xE3o tenho acesso ao sistema.

\u2717  Cesso restrito.
\u2713  Acesso restrito.

**Fam\xEDlia da palavra:**
acessar / acess\xEDvel / inacess\xEDvel / acesso / acess\xF3rio

Todas come\xE7am com "ac". Se a d\xFAvida surgir, pense na fam\xEDlia: "acessar" ajuda a lembrar "acesso".`},{id:"excessao_errada",category:"grafia",pattern:/\bexcessão\b/gi,label:"Grafia incorreta: 'excess\xE3o'",explanation:"'Exce\xE7\xE3o' tem um s\xF3 'c' \u2014 n\xE3o confunda com 'excesso', que tem 'ss'.",wrong:"Abri uma excess\xE3o para ele.",right:"Abri uma exce\xE7\xE3o para ele.",area:"orthography",topic:"spelling_rules",detail:`## Exce\xE7\xE3o ou excess\xE3o?

A confus\xE3o vem de "excesso" (com 'ss'), que fica gravado na mem\xF3ria e contamina "exce\xE7\xE3o".

\u2717  Excess\xE3o
\u2713  Exce\xE7\xE3o  (um s\xF3 'c', sem 's' dobrado)

**A diferen\xE7a:**
- **Excesso** = quantidade al\xE9m do limite. "Excesso de velocidade." (com ss)
- **Exce\xE7\xE3o** = o que foge \xE0 regra. "Toda regra tem exce\xE7\xE3o." (com \xE7, sem ss)

**Fam\xEDlia de "exce\xE7\xE3o":**
exce\xE7\xE3o / excepcional / excecionar (conjuga\xE7\xE3o rara)

**Fam\xEDlia de "excesso":**
excesso / excessivo / excessivamente

S\xE3o palavras diferentes, com grafias diferentes. Memorize o par: *exCESSo* (ss) vs *exCE\xE7\xE3o* (\xE7).`},{id:"beneficiente_errado",category:"grafia",pattern:/\bbeneficiente\b/gi,label:"Grafia incorreta: 'beneficiente'",explanation:"'Beneficente' n\xE3o tem 'i' antes de '-ente' \u2014 n\xE3o confunda com 'eficiente'.",wrong:"Uma entidade beneficiente.",right:"Uma entidade beneficente.",area:"orthography",topic:"spelling_rules",detail:`## Beneficente ou beneficiente?

O erro vem da interfer\xEAncia de "eficiente" e "suficiente" \u2014 palavras que terminam em "-iente". Mas "beneficente" vem do latim *beneficens* e n\xE3o passa por esse padr\xE3o.

\u2717  Beneficiente / benefici\xEAncia
\u2713  Beneficente / benefic\xEAncia

**Como lembrar:** pense em "benef-ic-ente" = que faz (faz = facere em latim, raiz "-fic-"). O sufixo \xE9 "-ente", sem o "i" a mais.

**Fam\xEDlia da palavra:**
beneficente / benefic\xEAncia / beneficiar / benef\xEDcio / benfeitor

Todas giram em torno de "bene-" (bem) + "fac/fic" (fazer). Nenhuma tem "-iente".`},{id:"impecilho_errado",category:"grafia",pattern:/\bimpecilho\b/gi,label:"Grafia incorreta: 'impecilho'",explanation:"A palavra \xE9 'empecilho', com 'em' \u2014 o prefixo est\xE1 trocado.",wrong:"Foi um impecilho enorme.",right:"Foi um empecilho enorme.",area:"orthography",topic:"spelling_rules",detail:`## Empecilho ou impecilho?

O erro \xE9 trocar o prefixo. A palavra come\xE7a com "em-", n\xE3o "im-".

\u2717  Impecilho
\u2713  Empecilho

**Etimologia:** vem do verbo "empecer" (= impedir, embara\xE7ar) + sufixo "-ilho". "Empecer" vem do latim *impedire*. O "em" inicial \xE9 parte da palavra, n\xE3o uma varia\xE7\xE3o do "im".

**Como lembrar:** pense em "EMbara\xE7o" \u2014 empecilho \xE9 algo que EMbara\xE7a, que EMPATILHA o caminho. O "em" est\xE1 certo.

\u2713  Esse burocracia \xE9 um empecilho.
\u2713  N\xE3o h\xE1 empecilho legal para isso.`},{id:"concenso_errado",category:"grafia",pattern:/\bconcenso\b/gi,label:"Grafia incorreta: 'concenso'",explanation:"'Consenso' n\xE3o tem 'c' antes do 'n' \u2014 vem do latim 'consensus'.",wrong:"Chegamos a um concenso.",right:"Chegamos a um consenso.",area:"orthography",topic:"spelling_rules",detail:`## Consenso ou concenso?

"Concenso" \xE9 um erro por hipercorre\xE7\xE3o \u2014 o escritor tenta inserir um 'c' que n\xE3o existe.

\u2717  Concenso
\u2713  Consenso

**Etimologia:** latim *consensus*, de *consentire* (sentir junto, concordar). O prefixo \xE9 "con-" (junto) + "sensus" (sentido, percep\xE7\xE3o). N\xE3o h\xE1 "c" intermedi\xE1rio.

**Fam\xEDlia da palavra:**
consenso / consensual / consentir / dissenso / dissentir

**Como lembrar:** pense em "con-SENSO" = senso comum, sentir junto. O "senso" \xE9 a raiz \u2014 sem 'c' no meio.`},{id:"previligio_errado",category:"grafia",pattern:/\bpreviligio\b|\bprevilégio\b/gi,label:"Grafia incorreta: 'previligio'",explanation:"A grafia correta \xE9 'privil\xE9gio': pri-vi-l\xE9-gio, com acento no '\xE9'.",wrong:"\xC9 um previligio ter acesso a isso.",right:"\xC9 um privil\xE9gio ter acesso a isso.",area:"orthography",topic:"spelling_rules",detail:`## Privil\xE9gio \u2014 como grafar corretamente

Dois erros comuns ao mesmo tempo: prefixo errado ("pre" em vez de "pri") e acento esquecido.

\u2717  Previligio / previl\xE9gio
\u2713  Privil\xE9gio  (pri-vi-l\xE9-gio)

**Etimologia:** latim *privilegium* = *privus* (privado, individual) + *lex/legis* (lei). Algo concedido individualmente por lei. O "pri" inicial \xE9 parte da raiz, n\xE3o o prefixo "pre-" (que indica anterioridade).

**Como lembrar:** pense em "PRIvado + LEi + gio". PRIvilegio. O "i" na primeira s\xEDlaba faz parte da raiz latina.

**Fam\xEDlia:**
privil\xE9gio / privilegiado / privilegiar / privilegiamento`},{id:"interseccao_errada",category:"grafia",pattern:/\bintersecção\b/gi,label:"Grafia desatualizada (reforma ortogr\xE1fica de 2009)",explanation:"Ap\xF3s a reforma de 2009, 'intersec\xE7\xE3o' perdeu um 'c'. Escreva 'interse\xE7\xE3o'.",wrong:"Na intersec\xE7\xE3o das ruas.",right:"Na interse\xE7\xE3o das ruas.",area:"orthography",topic:"spelling_rules",detail:`## Interse\xE7\xE3o \u2014 p\xF3s-reforma ortogr\xE1fica de 2009

O Acordo Ortogr\xE1fico de 2009 eliminou a consoante dupla em casos onde ela n\xE3o \xE9 pronunciada. "Intersec\xE7\xE3o" tinha 'cc' mas falamos apenas um 'c' \u2014 ficou 'interse\xE7\xE3o'.

\u2717  Intersec\xE7\xE3o (grafia pr\xE9-2009)
\u2713  Interse\xE7\xE3o  (grafia atual)

**Outras palavras que sofreram mudan\xE7a similar:**
\u2717  Ac\xE7\xE3o  \u2192  \u2713  A\xE7\xE3o
\u2717  Direc\xE7\xE3o  \u2192  \u2713  Dire\xE7\xE3o
\u2717  Colec\xE7\xE3o  \u2192  \u2713  Cole\xE7\xE3o
\u2717  Frac\xE7\xE3o  \u2192  \u2713  Fra\xE7\xE3o

**Aten\xE7\xE3o:** em Portugal, as grafias com consoante dupla continuam corretas. O acordo criou diverg\xEAncias que persistem. Se escrever para p\xFAblico lusitano, verifique a conven\xE7\xE3o adotada.`},{id:"voo_circunflexo",category:"acento",pattern:/\bvôo\b/gi,label:"Acento retirado pela reforma de 2009",explanation:"Ap\xF3s 2009, 'v\xF4o' perdeu o circunflexo \u2014 escreva 'voo'.",wrong:"O v\xF4o durou tr\xEAs horas.",right:"O voo durou tr\xEAs horas.",area:"orthography",topic:"accentuation",detail:`## Voo \u2014 p\xF3s-reforma ortogr\xE1fica de 2009

O Acordo Ortogr\xE1fico de 2009 eliminou o acento circunflexo em palavras com vogais duplas "oo" e "ee", pois esses acentos n\xE3o tinham fun\xE7\xE3o diferenciadora no portugu\xEAs brasileiro.

\u2717  V\xF4o, z\xF4o, enj\xF4o  (pr\xE9-2009)
\u2713  Voo, zoo, enjoo  (atual)

**Outras palavras afetadas:**
\u2717  Enj\xF4o  \u2192  \u2713  Enjoo
\u2717  V\xF4o    \u2192  \u2713  Voo
\u2717  Z\xF4o    \u2192  \u2713  Zoo
\u2717  D\xF4o    \u2192  \u2713  Doo (forma verbal rara de "doer")

**Por que o acento foi removido?** No PB, a pron\xFAncia j\xE1 era clara sem ele. O acento diferenciador (que distinguia formas) deixou de ser necess\xE1rio nesses casos.

**Nota sobre Portugal:** em Portugal, "voo" nunca teve acento. O acordo aproximou as grafias.`},{id:"zoo_circunflexo",category:"acento",pattern:/\bzôo\b/gi,label:"Acento retirado pela reforma de 2009",explanation:"Ap\xF3s 2009, 'z\xF4o' perdeu o circunflexo \u2014 escreva 'zoo'.",wrong:"Fomos ao z\xF4o no domingo.",right:"Fomos ao zoo no domingo.",area:"orthography",topic:"accentuation",detail:`## Zoo \u2014 p\xF3s-reforma ortogr\xE1fica de 2009

Assim como "voo", "zoo" perdeu o circunflexo com o Acordo de 2009. A vogal dupla "oo" n\xE3o precisa mais de acento para indicar pron\xFAncia aberta.

\u2717  Z\xF4o  (pr\xE9-2009)
\u2713  Zoo  (atual)

**Fam\xEDlia: palavras com "oo" sem acento:**
voo / zoo / enjoo

Todas seguem a mesma regra: vogal dupla, sem acento.`},{id:"frequente_trema",category:"acento",pattern:/\bfreqüente\b|\bfreqüência\b|\bfreqüentemente\b/gi,label:"Trema eliminado pela reforma de 2009",explanation:"O trema foi abolido do portugu\xEAs brasileiro em 2009 \u2014 escreva 'frequente', 'frequ\xEAncia'.",wrong:"Isso ocorre com freq\xFC\xEAncia.",right:"Isso ocorre com frequ\xEAncia.",area:"orthography",topic:"accentuation",detail:`## Trema \u2014 eliminado pela reforma de 2009

O Acordo Ortogr\xE1fico de 2009 eliminou o trema (\xA8) do portugu\xEAs brasileiro. Ele existia para indicar que o 'u' era pronunciado em certas sequ\xEAncias ("qu" e "gu"). Com a reforma, passou a ser subentendido pelo contexto.

\u2717  Freq\xFCente, freq\xFC\xEAncia, freq\xFCentemente
\u2713  Frequente, frequ\xEAncia, frequentemente

\u2717  Tranq\xFCilo, tranq\xFCilidade
\u2713  Tranquilo, tranquilidade

\u2717  Ling\xFCi\xE7a, ling\xFC\xEDstica
\u2713  Lingui\xE7a, lingu\xEDstica

**Exce\xE7\xE3o:** o trema ainda \xE9 usado em **nomes pr\xF3prios estrangeiros** e seus derivados:
\u2713  M\xFCller, M\xFCnchhausen, B\xFCndchen

E em palavras derivadas de nomes pr\xF3prios estrangeiros com trema:
\u2713  m\xFClleriano (de M\xFCller)

**Aten\xE7\xE3o:** em Portugal, o trema foi mantido em alguns casos. Verifique a conven\xE7\xE3o do seu p\xFAblico.`},{id:"tranquilo_trema",category:"acento",pattern:/\btranqüilo\b|\btranqüilidade\b|\btranqüilizar\b/gi,label:"Trema eliminado pela reforma de 2009",explanation:"Sem trema: 'tranquilo', 'tranquilidade'. O trema foi abolido em 2009.",wrong:"Fique tranq\xFCilo.",right:"Fique tranquilo.",area:"orthography",topic:"accentuation",detail:`## Tranquilo \u2014 sem trema ap\xF3s 2009

O trema em "tranq\xFCilo" marcava que o 'u' era pronunciado. Com a reforma de 2009, o trema foi eliminado e a pron\xFAncia continua a mesma \u2014 o contexto j\xE1 \xE9 suficiente.

\u2717  Tranq\xFCilo, tranq\xFCilidade, tranq\xFCilizar
\u2713  Tranquilo, tranquilidade, tranquilizar

**Mesma regra, outras palavras:**
\u2717  Freq\xFCente  \u2192  \u2713  Frequente
\u2717  Ling\xFC\xEDstica  \u2192  \u2713  Lingu\xEDstica
\u2717  Ling\xFCi\xE7a  \u2192  \u2713  Lingui\xE7a

O 'u' continua sendo pronunciado \u2014 s\xF3 o sinal gr\xE1fico foi removido.`},{id:"guarda_chuva_hifen",category:"hifen",pattern:/\bguarda\s+chuva\b/gi,label:"Composto sem h\xEDfen obrigat\xF3rio",explanation:"Compostos com 'guarda' + substantivo sempre levam h\xEDfen.",wrong:"Esqueci o guarda chuva em casa.",right:"Esqueci o guarda-chuva em casa.",area:"orthography",topic:"hyphen",detail:`## Compostos com "guarda" \u2014 sempre com h\xEDfen

Palavras formadas com "guarda" seguido de substantivo s\xE3o compostos que levam h\xEDfen obrigat\xF3rio pelo Acordo de 2009.

\u2717  Guarda chuva / guarda roupa / guarda costas
\u2713  Guarda-chuva / guarda-roupa / guarda-costas

**Lista dos principais:**
guarda-chuva / guarda-roupa / guarda-costas / guarda-civil / guarda-florestal / guarda-sol / guarda-volumes / guarda-mor

**Por que com h\xEDfen?** S\xE3o compostos cujos elementos mant\xEAm certa autonomia sem\xE2ntica \u2014 diferente de aglutina\xE7\xF5es totais como "girassol" (donde o h\xEDfen seria desnecess\xE1rio).

**Aten\xE7\xE3o ao verbo:** "guardar" conjugado n\xE3o leva h\xEDfen.
\u2713  Vou guardar roupa no arm\xE1rio.  (verbo + complemento \u2014 sem h\xEDfen)`},{id:"para_choque_hifen",category:"hifen",pattern:/\bpara\s+choque\b/gi,label:"Composto sem h\xEDfen obrigat\xF3rio",explanation:"Compostos com 'para' no sentido de prote\xE7\xE3o levam h\xEDfen.",wrong:"O para choque amassou.",right:"O para-choque amassou.",area:"orthography",topic:"hyphen",detail:`## Compostos com "para" \u2014 quando usar h\xEDfen

Quando "para" funciona como elemento de prote\xE7\xE3o ou bloqueio num composto, o h\xEDfen \xE9 obrigat\xF3rio.

\u2713  Para-choque (protege do choque)
\u2713  Para-brisa (protege do vento/brisa)
\u2713  Para-raios (protege dos raios)
\u2713  Para-quedas (para a queda)

**Como distinguir do "para" preposi\xE7\xE3o:**
\u2717  Para choque  (errado \u2014 sem h\xEDfen)
\u2713  Para-choque  (correto \u2014 elemento de composto)

"Para o choque" com artigo = constru\xE7\xE3o preposicional normal, sem h\xEDfen.
"Para-choque" = substantivo composto, com h\xEDfen.`},{id:"meia_noite_hifen",category:"hifen",pattern:/\bmeia\s+noite\b/gi,label:"Composto sem h\xEDfen obrigat\xF3rio",explanation:"'Meia-noite' \xE9 composto cristalizado \u2014 sempre com h\xEDfen.",wrong:"Chegou em meia noite.",right:"Chegou \xE0 meia-noite.",area:"orthography",topic:"hyphen",detail:`## Meia-noite e meio-dia \u2014 sempre com h\xEDfen

S\xE3o compostos cristalizados que designam hor\xE1rios espec\xEDficos. O h\xEDfen \xE9 obrigat\xF3rio em ambos.

\u2717  Meia noite / meio dia
\u2713  Meia-noite / meio-dia

**Uso:**
\u2713  Chegou \xE0 meia-noite em ponto.
\u2713  Almo\xE7amos ao meio-dia.
\u2713  O programa vai ao ar ao meio-dia e meia.  (= \xE0s 12h30 \u2014 "meia" aqui = meia hora)

**Aten\xE7\xE3o:** "meia" como numeral ou substantivo, sem compor com "noite", n\xE3o leva h\xEDfen:
\u2713  Comeu meia torta.   (metade)
\u2713  Uma meia x\xEDcara.   (metade)`},{id:"meio_dia_hifen",category:"hifen",pattern:/\bmeio\s+dia\b/gi,label:"Composto sem h\xEDfen obrigat\xF3rio",explanation:"'Meio-dia' \xE9 composto cristalizado \u2014 sempre com h\xEDfen.",wrong:"Almo\xE7amos ao meio dia.",right:"Almo\xE7amos ao meio-dia.",area:"orthography",topic:"hyphen",detail:`## Meio-dia \u2014 sempre com h\xEDfen

Composto cristalizado que designa o hor\xE1rio das 12h. H\xEDfen obrigat\xF3rio.

\u2717  Meio dia
\u2713  Meio-dia

\u2713  Sa\xEDmos ao meio-dia.
\u2713  O sol do meio-dia \xE9 forte.
\u2713  \xC0s doze horas, ou seja, ao meio-dia.

**Veja tamb\xE9m:** meia-noite (mesmo padr\xE3o).`},{id:"anti_social_hifen",category:"hifen",pattern:/\banti\s+social\b/gi,label:"Prefixo 'anti' aglutinado",explanation:"'Anti' + consoante (exceto h) = sem espa\xE7o e sem h\xEDfen: 'antissocial'.",wrong:"Comportamento anti social.",right:"Comportamento antissocial.",area:"orthography",topic:"hyphen",detail:`## Prefixo "anti" \u2014 quando usar h\xEDfen

O Acordo de 2009 estabeleceu regras claras para prefixos:

**"Anti" + consoante diferente de h e r \u2192 aglutina sem h\xEDfen:**
\u2713  Antissocial (s \u2192 ss por ser intervoc\xE1lico e sonoro)
\u2713  Antiv\xEDrus
\u2713  Anticoncepcional
\u2713  Anticorpos

**"Anti" + h \u2192 com h\xEDfen:**
\u2713  Anti-her\xF3i
\u2713  Anti-histam\xEDnico

**"Anti" + vogal \u2192 com h\xEDfen:**
\u2713  Anti-inflamat\xF3rio
\u2713  Anti-americano

**"Anti" + r \u2192 rr (por ser intervoc\xE1lico):**
\u2713  Antirru\xEDdo (e n\xE3o "anti-ru\xEDdo" \u2014 pelo acordo atual)

**Aten\xE7\xE3o:** a palavra "antissocial" dobra o 's' porque a regra do 's' intervoc\xE1lico se aplica: anti + social \u2192 antissocial (para preservar o som /s/).`},{id:"minuscula_apos_ponto",category:"tipografia",pattern:/[.!?] [a-záàâãéêíóôõúüç]/g,label:"Min\xFAscula ap\xF3s ponto final",explanation:"Ap\xF3s ponto, exclama\xE7\xE3o ou interroga\xE7\xE3o, a pr\xF3xima frase come\xE7a com mai\xFAscula.",wrong:"Cheguei tarde. fui dormir cedo.",right:"Cheguei tarde. Fui dormir cedo.",area:"text_production",topic:"cohesion_coherence",detail:`## Mai\xFAscula ap\xF3s ponto \u2014 regra b\xE1sica de pontua\xE7\xE3o

Ap\xF3s ponto final (.), ponto de exclama\xE7\xE3o (!) ou ponto de interroga\xE7\xE3o (?), a pr\xF3xima frase come\xE7a obrigatoriamente com letra mai\xFAscula.

\u2717  Cheguei tarde. fui dormir cedo.
\u2713  Cheguei tarde. Fui dormir cedo.

\u2717  Que dia dif\xEDcil! amanh\xE3 ser\xE1 melhor.
\u2713  Que dia dif\xEDcil! Amanh\xE3 ser\xE1 melhor.

**Exce\xE7\xE3o:** retic\xEAncias (...) podem ou n\xE3o reiniciar com mai\xFAscula, dependendo do sentido:
\u2713  N\xE3o sei... talvez amanh\xE3.  (continua\xE7\xE3o \u2014 min\xFAscula)
\u2713  N\xE3o sei... Talvez amanh\xE3.  (pausa longa, nova frase \u2014 mai\xFAscula)

**Nomes pr\xF3prios:** sempre com mai\xFAscula em qualquer posi\xE7\xE3o.`},{id:"espaco_duplo",category:"tipografia",pattern:/ {2,}/g,label:"Espa\xE7o duplo (tipografia)",explanation:"Em texto digital, um espa\xE7o simples entre palavras \xE9 suficiente.",wrong:"O gato  pulou  alto.",right:"O gato pulou alto.",area:"text_production",topic:"cohesion_coherence",detail:`## Por que espa\xE7o duplo \xE9 um problema?

O h\xE1bito de usar dois espa\xE7os ap\xF3s ponto vem da era das m\xE1quinas de escrever, onde a fonte monoespa\xE7ada exigia o espa\xE7o duplo para deixar clara a separa\xE7\xE3o entre frases. Em texto digital \u2014 com fontes proporcionais \u2014 um espa\xE7o \xE9 suficiente e mais limpo.

\u2717  O gato  pulou  alto.
\u2713  O gato pulou alto.

**Problemas que o espa\xE7o duplo causa:**
- Alinhamento irregular em texto justificado
- Espa\xE7os vis\xEDveis que quebram o ritmo de leitura
- Inconsist\xEAncia com padr\xF5es tipogr\xE1ficos profissionais

**Dica:** editores como Word e Google Docs \xE0s vezes ignoram o espa\xE7o duplo na renderiza\xE7\xE3o, mas o caractere est\xE1 l\xE1 no texto exportado.`},{id:"espaco_antes_pontuacao",category:"tipografia",pattern:/ [,;:!?]/g,label:"Espa\xE7o antes de pontua\xE7\xE3o",explanation:"V\xEDrgula, ponto e v\xEDrgula, dois-pontos e sinais de pontua\xE7\xE3o colam na palavra anterior.",wrong:"Bom dia , tudo bem ?",right:"Bom dia, tudo bem?",area:"text_production",topic:"cohesion_coherence",detail:`## Espa\xE7o antes de pontua\xE7\xE3o \u2014 erro tipogr\xE1fico

Em portugu\xEAs (e na maioria dos idiomas ocidentais), os sinais de pontua\xE7\xE3o ficam colados \xE0 palavra que os precede, sem espa\xE7o antes.

\u2717  Bom dia , tudo bem ?
\u2713  Bom dia, tudo bem?

\u2717  Trouxe p\xE3o ; leite ; e caf\xE9 .
\u2713  Trouxe p\xE3o; leite; e caf\xE9.

**Regra completa:**
- Sem espa\xE7o ANTES de: , ; : ! ? . \u2026
- Com espa\xE7o DEPOIS de: , ; : ! ? . \u2026

**Exce\xE7\xE3o francesa:** o franc\xEAs usa espa\xE7o antes de : ! ? ; \u2014 mas em portugu\xEAs n\xE3o.

**Travess\xE3o (\u2014):** pode ter espa\xE7o de ambos os lados ou nenhum, dependendo do estilo adotado. O importante \xE9 ser consistente.`},{id:"virgula_sem_espaco",category:"tipografia",pattern:/,[^\s\d"'»\n—–\)]/g,label:"Falta espa\xE7o ap\xF3s v\xEDrgula",explanation:"Ap\xF3s v\xEDrgula sempre vem um espa\xE7o antes da pr\xF3xima palavra.",wrong:"Comprei p\xE3o,leite e caf\xE9.",right:"Comprei p\xE3o, leite e caf\xE9.",area:"text_production",topic:"cohesion_coherence",detail:`## Espa\xE7o ap\xF3s v\xEDrgula \u2014 regra b\xE1sica

A v\xEDrgula termina colada \xE0 palavra anterior e vai seguida de um espa\xE7o antes da pr\xF3xima palavra ou n\xFAmero.

\u2717  Comprei p\xE3o,leite e caf\xE9.
\u2713  Comprei p\xE3o, leite e caf\xE9.

\u2717  Rio de Janeiro,S\xE3o Paulo e Belo Horizonte.
\u2713  Rio de Janeiro, S\xE3o Paulo e Belo Horizonte.

**Exce\xE7\xF5es que o inspetor n\xE3o marca (corretamente):**
- 1,5 (n\xFAmero decimal \u2014 v\xEDrgula sem espa\xE7o)
- "10,00" (valor monet\xE1rio \u2014 v\xEDrgula sem espa\xE7o)
- V\xEDrgula antes de aspas ou par\xEAnteses de fechamento

**Dica:** ap\xF3s cada v\xEDrgula, o leitor espera uma pequena respira\xE7\xE3o. O espa\xE7o \xE9 a representa\xE7\xE3o gr\xE1fica dessa pausa.`},{id:"inicio_minuscula",category:"tipografia",pattern:null,label:"Texto come\xE7a com min\xFAscula",explanation:"O primeiro caractere do texto deve ser mai\xFAsculo.",wrong:"era uma vez um gato.",right:"Era uma vez um gato.",area:"text_production",topic:"cohesion_coherence",detail:`## Texto come\xE7a com mai\xFAscula \u2014 regra universal

Todo texto come\xE7a com letra mai\xFAscula. Isso vale para qualquer g\xEAnero: narra\xE7\xE3o, ensaio, carta, artigo, lista, e-mail.

\u2717  era uma vez um gato preto.
\u2713  Era uma vez um gato preto.

**Exce\xE7\xF5es intencionais na literatura:**
Alguns autores usam min\xFAscula no in\xEDcio por escolha estil\xEDstica deliberada (poesia concreta, experimentalismo gr\xE1fico). Mas \xE9 uma decis\xE3o art\xEDstica consciente \u2014 n\xE3o um descuido.

Se for intencional, ignore o aviso. Se n\xE3o for, corrija.`},{id:"acento_faltando",category:"acento",pattern:null,label:"Acento ausente",explanation:"Esta palavra precisa de acento gr\xE1fico conforme a norma ortogr\xE1fica vigente.",wrong:"facil",right:"f\xE1cil",area:"orthography",topic:"accentuation",detail:`## Acento gr\xE1fico ausente

Esta palavra foi identificada como uma forma sem acento que deveria t\xEA-lo conforme a norma ortogr\xE1fica do portugu\xEAs brasileiro (p\xF3s-reforma 2009).

O inspetor usa um l\xE9xico de refer\xEAncia com mais de 100 mil palavras acentuadas para identificar esses casos.

**Regras gerais de acentua\xE7\xE3o (resumo):**

**Ox\xEDtonas** (\xFAltima s\xEDlaba t\xF4nica): acentuam-se as terminadas em a(s), e(s), o(s), em, ens:
\u2713  sof\xE1, caf\xE9, av\xF4, tamb\xE9m, parab\xE9ns

**Parox\xEDtonas** (pen\xFAltima s\xEDlaba t\xF4nica): acentuam-se as que N\xC3O terminam em a(s), e(s), o(s), em, ens:
\u2713  f\xE1cil, v\xEDrus, t\xF3rax, \xE1lbum, car\xE1ter

**Proparox\xEDtonas** (antepen\xFAltima): todas se acentuam:
\u2713  l\xE2mpada, m\xE9dico, \xF3culos, p\xE9rola

Se houver d\xFAvida espec\xEDfica sobre esta palavra, abra o dicion\xE1rio integrado com ..d.`},{id:"gente_plural_verb",category:"morfologia",pattern:/\ba\s+gente\s+(?:fomos|éramos|fizemos|viemos|estávamos|íamos|fossemos)\b/gi,label:"A gente + verbo no plural (morfologia)",explanation:"'A gente' equivale a 'n\xF3s', mas o verbo vai para a 3\xAA pessoa do singular.",wrong:"A gente fomos \xE0 praia.",right:"A gente foi \xE0 praia.",detail:`## Por que "a gente fomos" est\xE1 errado?

"A gente" \xE9 uma express\xE3o que substituiu "n\xF3s" na fala e na escrita informal, mas com uma diferen\xE7a crucial: o verbo fica na **3\xAA pessoa do singular**, n\xE3o na 1\xAA do plural.

\u2717  A gente fomos \xE0 praia.
\u2713  A gente foi \xE0 praia.

\u2717  A gente \xE9ramos jovens.
\u2713  A gente era jovem.

\u2717  A gente fizemos a li\xE7\xE3o.
\u2713  A gente fez a li\xE7\xE3o.

**Por qu\xEA?** "A gente" \xE9, gramaticalmente, um substantivo com artigo \u2014 "a gente" = as pessoas, o grupo. O verbo concorda com "gente" (singular feminino), n\xE3o com o referente impl\xEDcito (n\xF3s).

**Dica de consist\xEAncia:** se usar "a gente", use o verbo no singular. Se quiser o plural, use "n\xF3s fizemos", "n\xF3s fomos".`},{id:"pessoal_plural_verb",category:"morfologia",pattern:/\bpessoal\s+(?:foram|estavam|disseram|fizeram|vieram|chegaram|queriam)\b/gi,label:"Coletivo 'pessoal' com verbo no plural",explanation:"'Pessoal' \xE9 substantivo coletivo singular \u2014 o verbo deve ficar no singular.",wrong:"O pessoal foram embora.",right:"O pessoal foi embora.",detail:`## O coletivo "pessoal" \u2014 concord\xE2ncia verbal

"Pessoal" \xE9 um substantivo coletivo no singular. O verbo deve concordar com o singular, mesmo que o coletivo se refira a muitas pessoas.

\u2717  O pessoal foram embora.
\u2713  O pessoal foi embora.

\u2717  O pessoal estavam animados.
\u2713  O pessoal estava animado.

**Regra geral dos coletivos:** substantivos coletivos (pessoal, multid\xE3o, turma, equipe, grupo) pedem verbo no singular quando v\xEAm acompanhados de artigo singular.

\u2713  A turma foi ao teatro.
\u2713  A equipe ganhou o campeonato.
\u2713  A multid\xE3o correu.

**Exce\xE7\xE3o da concord\xE2ncia ideol\xF3gica:** em estilo informal, o plural pode ser aceito quando o coletivo est\xE1 afastado do verbo: "O pessoal que estava l\xE1 disseram que foi \xF3timo" \u2014 tolerado coloquialmente, mas evite na escrita formal.`},{id:"eles_e_singular",category:"morfologia",pattern:/\beles\s+é\b|\belas\s+é\b/gi,label:"Sujeito plural com verbo no singular",explanation:"Sujeito 'eles/elas' exige verbo no plural: 'eles s\xE3o', 'elas s\xE3o'.",wrong:"Eles \xE9 os respons\xE1veis.",right:"Eles s\xE3o os respons\xE1veis.",detail:`## Concord\xE2ncia com "eles/elas"

"Eles" e "elas" s\xE3o pronomes pessoais da 3\xAA pessoa do **plural**. O verbo ser concorda: "s\xE3o", nunca "\xE9".

\u2717  Eles \xE9 os respons\xE1veis.
\u2713  Eles s\xE3o os respons\xE1veis.

\u2717  Elas \xE9 inteligentes.
\u2713  Elas s\xE3o inteligentes.

Esta \xE9 uma das concord\xE2ncias mais b\xE1sicas da l\xEDngua. O erro ocorre geralmente em fala muito informal e n\xE3o deve aparecer na escrita padr\xE3o.`},{id:"menas_invariavel",category:"morfologia",pattern:/\bmenas\b/gi,label:"'Menas' n\xE3o existe em portugu\xEAs",explanation:"'Menos' \xE9 invari\xE1vel \u2014 n\xE3o existe 'menas'. Use sempre 'menos'.",wrong:"Precisamos de menas erros.",right:"Precisamos de menos erros.",detail:`## "Menas" \u2014 palavra inexistente

"Menos" \xE9 um adv\xE9rbio **invari\xE1vel** em portugu\xEAs \u2014 n\xE3o varia em g\xEAnero nem n\xFAmero. A forma "menas" n\xE3o existe na l\xEDngua portuguesa, em nenhum registro.

\u2717  Menas pessoas vieram.
\u2713  Menos pessoas vieram.

\u2717  Preciso de menas ajuda.
\u2713  Preciso de menos ajuda.

**Cuidado:** o erro "menas" \xE9 hipercorre\xE7\xE3o por analogia com "poucas" (que varia). "Menos" n\xE3o \xE9 adjetivo \u2014 \xE9 adv\xE9rbio. Adv\xE9rbios n\xE3o variam.

**Palavras invari\xE1veis semelhantes:** mais, menos, muito (como adv\xE9rbio), pouco (como adv\xE9rbio). Quando funcionam como adv\xE9rbios, nenhum varia.`},{id:"mais_melhor",category:"morfologia",pattern:/\bmais\s+melhor\b|\bmais\s+pior\b|\bmais\s+maior\b|\bmais\s+menor\b/gi,label:"Comparativo duplo (grau redundante)",explanation:"'Melhor/pior/maior/menor' j\xE1 s\xE3o comparativos \u2014 'mais' \xE9 redundante.",wrong:"Esse resultado \xE9 mais melhor.",right:"Esse resultado \xE9 melhor.",detail:`## Comparativos sint\xE9ticos \u2014 n\xE3o precisam de "mais"

Em portugu\xEAs, alguns adjetivos t\xEAm formas comparativas pr\xF3prias (chamadas comparativas sint\xE9ticas). Adicionar "mais" a essas formas \xE9 pleonasmo.

| Adjetivo | Comparativo anal\xEDtico | Comparativo sint\xE9tico |
|---|---|---|
| bom | mais bom (aceit\xE1vel) | **melhor** |
| mau/ruim | mais ruim (aceit\xE1vel) | **pior** |
| grande | mais grande (raro) | **maior** |
| pequeno | mais pequeno (raro) | **menor** |

\u2717  Mais melhor / mais pior / mais maior / mais menor
\u2713  Melhor / pior / maior / menor

**Dupla corre\xE7\xE3o:**
\u2717  Esse plano \xE9 muito mais melhor.
\u2713  Esse plano \xE9 muito melhor. (apenas "muito" como intensificador)

**Dica:** "muito melhor", "muito pior" s\xE3o corretos \u2014 "muito" intensifica o comparativo. O erro \xE9 usar "mais" antes do comparativo sint\xE9tico, n\xE3o "muito".`},{id:"muito_otimo",category:"morfologia",pattern:/\bmuito\s+ótimo\b|\bmuito\s+péssimo\b/gi,label:"Superlativo duplo (grau redundante)",explanation:"'\xD3timo' e 'p\xE9ssimo' j\xE1 s\xE3o superlativos absolutos \u2014 'muito' \xE9 redundante.",wrong:"O filme foi muito \xF3timo.",right:"O filme foi \xF3timo.",detail:`## Superlativos sint\xE9ticos \u2014 j\xE1 s\xE3o absolutos

"\xD3timo" e "p\xE9ssimo" s\xE3o superlativos absolutos \u2014 j\xE1 carregam o m\xE1ximo da qualidade. Adicionar "muito" \xE9 redundante.

| Adjetivo | Superlativo |
|---|---|
| bom | **\xF3timo** (n\xE3o "muito \xF3timo") |
| mau/ruim | **p\xE9ssimo** (n\xE3o "muito p\xE9ssimo") |

\u2717  Muito \xF3timo / muito p\xE9ssimo
\u2713  \xD3timo / p\xE9ssimo

**Intensificadores aceitos** (raramente, com efeito expressivo):
"Absolutamente \xF3timo", "simplesmente p\xE9ssimo" \u2014 funcionam como \xEAnfase ret\xF3rica, n\xE3o como grada\xE7\xE3o real.

**Por que o erro acontece?** Por analogia com "muito bom" (que \xE9 correto). A diferen\xE7a: "bom" \xE9 o grau positivo \u2014 precisa de "muito" para chegar ao superlativo. "\xD3timo" j\xE1 \xC9 o superlativo.`},{id:"por_isso_que",category:"morfologia",pattern:/\bpor\s+isso\s+que\b/gi,label:"Locu\xE7\xE3o redundante 'por isso que'",explanation:"Use 'por isso' ou '\xE9 por isso que' \u2014 nunca 'por isso que' sem o '\xE9'.",wrong:"Estudei muito, por isso que passei.",right:"Estudei muito, por isso passei. / \xC9 por isso que passei.",detail:`## "Por isso que" \u2014 locu\xE7\xE3o incorreta

"Por isso que" mistura duas constru\xE7\xF5es diferentes e resulta numa forma h\xEDbrida incorreta.

\u2717  Por isso que estou aqui.
\u2713  Por isso estou aqui.       (conjun\xE7\xE3o conclusiva)
\u2713  \xC9 por isso que estou aqui. (estrutura de clivagem \u2014 correta)

**As duas constru\xE7\xF5es corretas:**
1. **"Por isso" sozinho:** "Choveu, por isso ficamos em casa."
2. **"\xC9 por isso que":** "\xC9 por isso que n\xE3o concordo."

**Por que "por isso que" sem "\xE9" est\xE1 errado?** A conjun\xE7\xE3o "que" aqui precisa de um verbo de liga\xE7\xE3o antes ("\xE9") para ancorar a ora\xE7\xE3o. Sem o "\xE9", a estrutura fica suspensa.`},{id:"onde_que",category:"morfologia",pattern:/\bonde\s+que\b/gi,label:"Forma popular n\xE3o aceita na norma culta",explanation:"'Onde que' \xE9 constru\xE7\xE3o regional. Na escrita, use apenas 'onde'.",wrong:"O lugar onde que moro \xE9 bonito.",right:"O lugar onde moro \xE9 bonito.",detail:`## "Onde que" \u2014 n\xE3o existe na norma culta

"Onde que" \xE9 uma constru\xE7\xE3o popular presente em algumas regi\xF5es do Brasil, mas n\xE3o \xE9 aceita na norma padr\xE3o escrita.

\u2717  Onde que voc\xEA vai?
\u2713  Onde voc\xEA vai?

\u2717  O lugar onde que nasci.
\u2713  O lugar onde nasci.

O "que" aqui \xE9 parasit\xE1rio \u2014 n\xE3o tem fun\xE7\xE3o sint\xE1tica real. "Onde" j\xE1 introduz a ora\xE7\xE3o subordinada adverbial ou a ora\xE7\xE3o relativa sem precisar de refor\xE7o.`},{id:"de_encontro_com",category:"morfologia",pattern:/\bde\s+encontro\s+com\b/gi,label:"Preposi\xE7\xE3o errada em 'de encontro'",explanation:"'De encontro a' = contra. 'Ao encontro de' = a favor. A preposi\xE7\xE3o muda o sentido.",wrong:"Sua ideia vai de encontro com a minha.",right:"Sua ideia vai de encontro \xE0 minha. (= contraria) / vai ao encontro da minha. (= concorda)",detail:`## De encontro a \xD7 Ao encontro de \u2014 sentidos opostos

Estas duas express\xF5es s\xE3o paron\xEDmias sintagm\xE1ticas \u2014 parecem similares mas t\xEAm sentidos contr\xE1rios.

**"De encontro a"** = contra, em oposi\xE7\xE3o a, em choque com:
\u2713  Sua proposta vai de encontro ao que foi decidido. (= contraria)
\u2713  O carro foi de encontro ao muro. (= bateu no muro)

**"Ao encontro de"** = a favor de, em dire\xE7\xE3o a, consonante com:
\u2713  Sua ideia vai ao encontro do que propus. (= est\xE1 alinhada)
\u2713  Correu ao encontro do amigo. (= em dire\xE7\xE3o a)

**O erro mais comum:** usar "com" no lugar de "a":
\u2717  De encontro com a proposta.
\u2713  De encontro \xE0 proposta. (= contraria a proposta)`},{id:"assistiu_o",category:"regencia",pattern:/\bassistiu\s+o\b|\bassistir\s+o\b/gi,label:"Reg\xEAncia do verbo assistir (ver/presenciar)",explanation:"'Assistir' no sentido de ver \xE9 transitivo indireto \u2014 rege 'a', n\xE3o objeto direto.",wrong:"Assistimos o jogo ontem.",right:"Assistimos ao jogo ontem.",detail:`## Assistir \u2014 transitivo direto ou indireto?

Depende do sentido. Este \xE9 um dos verbos que muda de reg\xEAncia conforme o significado.

**"Assistir" = ver/presenciar \u2192 transitivo INDIRETO (rege "a"):**
\u2717  Assistimos o jogo.
\u2713  Assistimos ao jogo.
\u2713  Ela assistiu \xE0 pe\xE7a.
\u2713  Assisti \xE0 confer\xEAncia.

**"Assistir" = ajudar, estar presente \u2192 transitivo INDIRETO (rege "a"):**
\u2713  O m\xE9dico assistiu ao paciente.

**"Assistir" = caber, pertencer \u2192 transitivo INDIRETO (rege "a"):**
\u2713  Assiste-lhe o direito de recorrer.

**Dica:** no sentido de "ver", substitua por "ver" \u2014 se "ver o jogo" funciona (direto), lembre que "assistir" exige o "ao". \xC9 uma exig\xEAncia da norma culta escrita, ainda que "assistir o jogo" seja comum na fala.`},{id:"implicar_em",category:"regencia",pattern:/\bimplicar\s+em\b/gi,label:"Reg\xEAncia do verbo implicar",explanation:"'Implicar' (= acarretar) \xE9 transitivo direto \u2014 sem preposi\xE7\xE3o 'em'.",wrong:"Isso implica em riscos.",right:"Isso implica riscos.",detail:`## Implicar em ou implicar sem preposi\xE7\xE3o?

"Implicar" tem dois sentidos principais com reg\xEAncias diferentes:

**"Implicar" = acarretar, ter como consequ\xEAncia \u2192 TRANSITIVO DIRETO (sem preposi\xE7\xE3o):**
\u2717  Isso implica em riscos.
\u2713  Isso implica riscos.
\u2717  A decis\xE3o implica em mudan\xE7as.
\u2713  A decis\xE3o implica mudan\xE7as.

**"Implicar" = complicar, envolver algu\xE9m \u2192 TRANSITIVO DIRETO:**
\u2713  Implicaram-no no esquema.

**"Implicar com" = ter implic\xE2ncia com (= provocar) \u2192 TRANSITIVO INDIRETO:**
\u2713  Ele vive implicando com o colega.

**Por que o erro acontece?** Por analogia com "resultar em", "redundar em" \u2014 verbos de consequ\xEAncia que de fato exigem "em". "Implicar" foge a esse padr\xE3o.`},{id:"namorar_com",category:"regencia",pattern:/\bnamorar\s+com\b/gi,label:"Reg\xEAncia do verbo namorar",explanation:"'Namorar' \xE9 transitivo direto \u2014 sem 'com'.",wrong:"Ela namora com o Pedro.",right:"Ela namora o Pedro.",detail:`## Namorar com ou namorar sem preposi\xE7\xE3o?

Na norma culta, "namorar" \xE9 transitivo direto \u2014 o complemento vem sem preposi\xE7\xE3o.

\u2717  Ela namora com o Pedro.
\u2713  Ela namora o Pedro.

\u2717  Eles namoraram com por dois anos.
\u2713  Eles namoraram por dois anos.

**Por que o erro \xE9 t\xE3o comum?** "Namorar com" \xE9 amplamente usado na fala brasileira e j\xE1 est\xE1 consagrado pelo uso informal. Mas na escrita padr\xE3o, mant\xE9m-se o transitivo direto.

**Compara\xE7\xE3o com verbos similares:**
\u2713  Encontrou o amigo. (n\xE3o "com o amigo")
\u2713  Conheceu a professora. (n\xE3o "com a professora")

Verbos de rela\xE7\xE3o tendem ao transitivo direto em portugu\xEAs.`},{id:"esquecer_de",category:"regencia",pattern:/\besquecer\s+de\b(?!\s+(?:mim|ti|si|nós|vós))/gi,label:"Reg\xEAncia do verbo esquecer",explanation:"Sem pronome reflexivo: 'esquecer' \xE9 direto. Com reflexivo: 'esquecer-se de'.",wrong:"Esqueci de levar o documento.",right:"Esqueci o documento. / Esqueci-me de levar o documento.",detail:`## Esquecer \xD7 Esquecer-se de

S\xE3o duas constru\xE7\xF5es v\xE1lidas com reg\xEAncias diferentes:

**"Esquecer" sem pronome \u2192 TRANSITIVO DIRETO:**
\u2713  Esqueci o documento.
\u2713  Esqueci o nome dela.
\u2717  Esqueci de levar o documento. (norma culta: retire o "de")

**"Esquecer-se de" com pronome reflexivo \u2192 TRANSITIVO INDIRETO:**
\u2713  Esqueci-me de levar o documento.
\u2713  Ele se esqueceu do compromisso.

**Na pr\xE1tica:** "esquecer de" (sem pronome) \xE9 amplamente usado e j\xE1 aceito por muitos gram\xE1ticos como variante. Mas na escrita formal, prefira uma das duas formas can\xF4nicas.

**Dica r\xE1pida:** se n\xE3o tem pronome reflexivo, n\xE3o tem "de". Se tem "se/me/te", tem "de".`},{id:"ansioso_para",category:"regencia",pattern:/\bansioso\s+para\b|\bansiosa\s+para\b/gi,label:"Reg\xEAncia do adjetivo ansioso",explanation:"'Ansioso' rege a preposi\xE7\xE3o 'por' ou 'com' \u2014 n\xE3o 'para'.",wrong:"Estou ansioso para os resultados.",right:"Estou ansioso pelos resultados.",detail:`## Ansioso por, com ou para?

"Ansioso" \xE9 um adjetivo com reg\xEAncia nominal definida:

**"Ansioso por" \u2192 sentido de anseio/expectativa:**
\u2713  Ansioso pelos resultados.
\u2713  Ansiosa por not\xEDcias.

**"Ansioso com" \u2192 sentido de preocupa\xE7\xE3o:**
\u2713  Ansioso com a situa\xE7\xE3o.
\u2713  Ansiosa com o atraso.

**"Ansioso para" \u2192 n\xE3o \xE9 a reg\xEAncia padr\xE3o:**
\u2717  Ansioso para ver os resultados. (coloquial, mas tecnicamente impreciso)
A forma mais aceita seria "ansioso por ver" ou "ansioso para ver" \u2014 esta \xFAltima \xE9 tolerada quando "para" \xE9 preposi\xE7\xE3o de finalidade antes de infinitivo.

**Resumo pr\xE1tico:** antes de substantivo, use "por". Antes de infinitivo, "para" \xE9 tolerado, mas "por" \xE9 mais rigoroso.`},{id:"capaz_em",category:"regencia",pattern:/\bcapaz\s+em\b/gi,label:"Reg\xEAncia do adjetivo capaz",explanation:"'Capaz' rege a preposi\xE7\xE3o 'de' \u2014 n\xE3o 'em'.",wrong:"Ela \xE9 capaz em resolver qualquer problema.",right:"Ela \xE9 capaz de resolver qualquer problema.",detail:`## Capaz de ou capaz em?

"Capaz" exige a preposi\xE7\xE3o "de":

\u2717  Capaz em resolver.
\u2713  Capaz de resolver.

\u2717  Incapaz em compreender.
\u2713  Incapaz de compreender.

**Fam\xEDlia do erro:**
V\xE1rios adjetivos de capacidade/habilidade regem "de":
\u2713  H\xE1bil de / Apto a (ou para) / Competente para / Capaz de

**Aten\xE7\xE3o ao "apto":** "apto a" e "apto para" s\xE3o os dois aceitos. "Apto em" n\xE3o existe.`},{id:"favoravel_para",category:"regencia",pattern:/\bfavorável\s+para\b|\bfavoráveis\s+para\b/gi,label:"Reg\xEAncia do adjetivo favor\xE1vel",explanation:"'Favor\xE1vel' rege a preposi\xE7\xE3o 'a' \u2014 n\xE3o 'para'.",wrong:"A decis\xE3o foi favor\xE1vel para n\xF3s.",right:"A decis\xE3o foi favor\xE1vel a n\xF3s. / foi-nos favor\xE1vel.",detail:`## Favor\xE1vel a \u2014 reg\xEAncia nominal

"Favor\xE1vel" exige "a" como preposi\xE7\xE3o regente, n\xE3o "para".

\u2717  Favor\xE1vel para a proposta.
\u2713  Favor\xE1vel \xE0 proposta.

\u2717  Condi\xE7\xF5es favor\xE1veis para o crescimento.
\u2713  Condi\xE7\xF5es favor\xE1veis ao crescimento.

**Mesmo padr\xE3o \u2014 adjetivos que regem "a":**
\u2713  Contr\xE1rio a / Favor\xE1vel a / Oposto a / Fiel a / Leal a / Hostil a`},{id:"nunca_nao",category:"norma",pattern:/\bnunca\s+não\b|\bjamais\s+não\b|\bnem\s+não\b/gi,label:"Dupla nega\xE7\xE3o \u2014 redund\xE2ncia sint\xE1tica",explanation:"'Nunca', 'jamais' e 'nem' j\xE1 s\xE3o negativos \u2014 adicionar 'n\xE3o' \xE9 redundante.",wrong:"Nunca n\xE3o fiz isso.",right:"Nunca fiz isso. / N\xE3o fiz isso nunca.",detail:`## Dupla nega\xE7\xE3o em portugu\xEAs

O portugu\xEAs n\xE3o aceita dupla nega\xE7\xE3o como refor\xE7o (ao contr\xE1rio do ingl\xEAs arcaico ou de certas l\xEDnguas). Palavras como "nunca", "jamais", "nem", "ningu\xE9m", "nada" j\xE1 carregam nega\xE7\xE3o.

\u2717  Nunca n\xE3o fiz isso.
\u2713  Nunca fiz isso. / N\xE3o fiz isso nunca.

\u2717  Jamais n\xE3o voltarei.
\u2713  Jamais voltarei. / N\xE3o voltarei jamais.

\u2717  Nem n\xE3o tentei.
\u2713  Nem tentei.

**Exce\xE7\xE3o leg\xEDtima:** "N\xE3o \u2026 n\xE3o" pode funcionar como \xEAnfase em certas constru\xE7\xF5es orais, mas \xE9 sempre marcado como informal e deve ser evitado na escrita padr\xE3o.

**Posi\xE7\xE3o de "nunca" e "jamais":** podem vir antes ou depois do verbo:
\u2713  Nunca fiz isso.
\u2713  N\xE3o fiz isso nunca.
Ambas corretas \u2014 a vers\xE3o com "n\xE3o" antes do verbo \xE9 a mais neutra; a com "nunca/jamais" ap\xF3s \xE9 mais enf\xE1tica.`},{id:"apenas_somente",category:"pleonasmo",pattern:/\bapenas\s+somente\b|\bsó\s+apenas\b|\bsomente\s+apenas\b/gi,label:"Dois adv\xE9rbios de exclus\xE3o (pleonasmo)",explanation:"'Apenas', 'somente' e 's\xF3' s\xE3o sin\xF4nimos. Usar dois ao mesmo tempo \xE9 redundante.",wrong:"Apenas somente uma pessoa entrou.",right:"Apenas uma pessoa entrou. / Somente uma pessoa entrou.",detail:`## Pleonasmo vicioso: adv\xE9rbios de exclus\xE3o

"Apenas", "somente" e "s\xF3" t\xEAm o mesmo valor sem\xE2ntico de exclus\xE3o. Combin\xE1-los \xE9 redund\xE2ncia pura.

\u2717  Apenas somente eu sabia.
\u2713  Apenas eu sabia. / Somente eu sabia. / S\xF3 eu sabia.

**Mesma fam\xEDlia de erro:**
\u2717  S\xF3 apenas ele foi convidado.
\u2717  Somente apenas uma vez.

**Dica de estilo:**
- "S\xF3" \u2192 mais informal, mais curto
- "Apenas" \u2192 neutro, vers\xE1til
- "Somente" \u2192 mais formal, bom no in\xEDcio de frase

Escolha um e mantenha consist\xEAncia no texto.`},{id:"encontrar_com",category:"regencia",pattern:/\bencontrar\s+com\b|\bencontrei\s+com\b/gi,label:"Reg\xEAncia do verbo encontrar",explanation:"'Encontrar' \xE9 transitivo direto \u2014 sem 'com'.",wrong:"Encontrei com o diretor ontem.",right:"Encontrei o diretor ontem.",detail:`## Encontrar com ou encontrar sem preposi\xE7\xE3o?

Na norma culta, "encontrar" \xE9 transitivo direto \u2014 o complemento vem sem preposi\xE7\xE3o.

\u2717  Encontrei com o diretor.
\u2713  Encontrei o diretor.

**"Encontrar-se com" (com reflexivo) \xE9 diferente:**
\u2713  Encontrei-me com o diretor. (= nos reunimos)
\u2713  Vamos nos encontrar com a equipe. (= reuni\xE3o)

A forma com "se" indica encontro m\xFAtuo, deliberado. A forma sem "se" indica apenas ter visto, localizado.

**Na fala:** "encontrei com" \xE9 generalizado e dificilmente gera ambiguidade. Na escrita formal, prefira a forma direta.`},{id:"quanto_mais_mas",category:"norma",pattern:/\bquanto\s+mais\s+.{1,40}?\s+mas\b/gi,label:"Correla\xE7\xE3o incorreta 'quanto mais...mas'",explanation:"A correla\xE7\xE3o correta \xE9 'quanto mais...mais', n\xE3o 'quanto mais...mas'.",wrong:"Quanto mais estudo, mas aprendo.",right:"Quanto mais estudo, mais aprendo.",detail:`## Correla\xE7\xE3o "quanto mais...mais" \u2014 n\xE3o "mas"

"Mais" e "mas" s\xE3o palavras diferentes com fun\xE7\xF5es totalmente distintas. Na correla\xE7\xE3o proporcional, a palavra certa \xE9 "mais" \u2014 n\xE3o "mas".

\u2717  Quanto mais trabalho, mas ganho.
\u2713  Quanto mais trabalho, mais ganho.

\u2717  Quanto mais ele fala, mas erra.
\u2713  Quanto mais ele fala, mais erra.

**As correla\xE7\xF5es proporcionais corretas:**
\u2713  Quanto mais... mais
\u2713  Quanto menos... menos
\u2713  Quanto mais... menos
\u2713  Quanto menos... mais

**"Mas" \xE9 adversativo:** "Trabalhei muito, mas n\xE3o recebi." N\xE3o entra em correla\xE7\xF5es proporcionais.`},{id:"descriminar_discriminar",category:"paronimia",pattern:/\bdescrimin[aeiou]\w*\b/gi,label:"Paron\xEDmia: descriminar \xD7 discriminar",explanation:"'Discriminar' = segregar/distinguir. 'Descriminar' = retirar o car\xE1ter criminoso de algo.",wrong:"\xC9 errado descriminar pessoas por cor.",right:"\xC9 errado discriminar pessoas por cor.",detail:`## Discriminar \xD7 Descriminar \u2014 sentidos opostos

S\xE3o par\xF4nimos \u2014 palavras parecidas com sentidos radicalmente diferentes.

**"Discriminar"** (dis + criminar) = distinguir, separar, tratar de forma diferente (geralmente injusta):
\u2713  Discriminar pessoas por ra\xE7a \xE9 crime.
\u2713  O sistema discrimina quem n\xE3o tem acesso digital.

**"Descriminar"** (des + criminar) = retirar o car\xE1ter criminoso, descriminalizar:
\u2713  O movimento luta para descriminar o aborto.
\u2713  A lei descriminou certas condutas.

**Mnem\xF4nica:** "DIS-criminar" vem de "distinguir" (separar). "DES-criminar" vem de "des-" (retirar) + "crime".

\u2717  N\xE3o descrimine pessoas pela apar\xEAncia.
\u2713  N\xE3o discrimine pessoas pela apar\xEAncia.`},{id:"infligir_regra",category:"paronimia",pattern:/\binflig(?:ir|iu|e|em|indo|ido|iu|iram|isse|a|am|amos)\s+(?:a\s+)?(?:regra|norma|lei|contrato|acordo|regras|normas|leis)\b/gi,label:"Paron\xEDmia: infligir \xD7 infringir",explanation:"'Infringir' = violar uma norma. 'Infligir' = impor um castigo/sofrimento.",wrong:"Ele infligiu a lei.",right:"Ele infringiu a lei.",detail:`## Infligir \xD7 Infringir \u2014 dois verbos, dois sentidos

**"Infringir"** = violar, transgredir uma norma, lei ou regra:
\u2713  Infringiu o c\xF3digo de tr\xE2nsito.
\u2713  A empresa infringiu o contrato.
\u2713  Infringir as regras tem consequ\xEAncias.

**"Infligir"** = causar, impor um sofrimento, puni\xE7\xE3o ou dano:
\u2713  O juiz infligiu uma pena severa.
\u2713  A guerra infligiu sofrimento imensur\xE1vel.

**Regra mnem\xF4nica:**
- infr**i**ngir = viol**ar** (contem "fring", lembre de "infra\xE7\xE3o")
- infligir = impor (contem "flig", de "flagelo")

\u2717  Infligiu a lei trabalhista. (= violou a lei \u2192 infringiu)
\u2713  Infringiu a lei trabalhista.

\u2717  Infringiu uma puni\xE7\xE3o severa. (= imp\xF4s \u2192 infligiu)
\u2713  Infligiu uma puni\xE7\xE3o severa.`},{id:"retificar_ratificar",category:"paronimia",pattern:/\bratific(?:ar|ou|a|am|ando|ado|amos|aram|asse|ará)\s+(?:o\s+)?(?:erro|engano|equívoco|informação\s+errada|dado\s+incorreto)\b/gi,label:"Paron\xEDmia: ratificar \xD7 retificar",explanation:"'Retificar' = corrigir um erro. 'Ratificar' = confirmar, aprovar.",wrong:"O governo ratificou o erro nos dados.",right:"O governo retificou o erro nos dados.",detail:`## Ratificar \xD7 Retificar \u2014 sentidos opostos

**"Ratificar"** = confirmar, aprovar, validar o que j\xE1 foi dito ou feito:
\u2713  O Senado ratificou o tratado.
\u2713  Ratificou a decis\xE3o do j\xFAri.
\u2713  Venho ratificar o que disse antes.

**"Retificar"** = corrigir, emendar, desfazer um erro:
\u2713  Preciso retificar uma informa\xE7\xE3o.
\u2713  O comunicado foi retificado.
\u2713  Retificou o caminho errado.

**Mnem\xF4nica:**
- r**a**tificar \u2192 r**a**tifica\xE7\xE3o = v**a**lidar (vogal "a" de aprova\xE7\xE3o)
- r**e**tificar \u2192 r**e**to = corrigir, **e**ndireitar

\u2717  Ratificou o equ\xEDvoco na nota oficial. (= confirmou o erro \u2014 quase certeza n\xE3o \xE9 o que se quer dizer)
\u2713  Retificou o equ\xEDvoco na nota oficial.`},{id:"iminente_eminente",category:"paronimia",pattern:/\beminente\s+(?:perigo|risco|ameaça|colapso|queda|crise|catástrofe)\b|\bperigo\s+eminente\b|\brisco\s+eminente\b/gi,label:"Paron\xEDmia: iminente \xD7 eminente",explanation:"'Iminente' = prestes a acontecer. 'Eminente' = ilustre, elevado.",wrong:"Havia perigo eminente de acidente.",right:"Havia perigo iminente de acidente.",detail:`## Iminente \xD7 Eminente \u2014 os par\xF4nimos do risco

**"Iminente"** = que est\xE1 prestes a ocorrer, imediato, impendente:
\u2713  Perigo iminente.
\u2713  Colapso iminente.
\u2713  A chuva era iminente.

**"Eminente"** = ilustre, not\xE1vel, elevado (pessoa ou cargo):
\u2713  Um eminente jurista.
\u2713  Posi\xE7\xE3o eminente na hierarquia.

**Como lembrar:**
- **im**inente \u2192 **im**ediato, **im**pendente (est\xE1 vindo agora)
- **em**inente \u2192 **em**in\xEAncia, **e**xcel\xEAncia (elevado, digno)

\u2717  Risco eminente de epidemia.   (= risco not\xE1vel? n\xE3o faz sentido)
\u2713  Risco iminente de epidemia.   (= est\xE1 prestes a acontecer)

\u2717  Um iminente doutor em medicina.  (= prestes a ser doutor? talvez, mas incomum)
\u2713  Um eminente doutor em medicina.  (= ilustre, respeitado)`},{id:"principal_protagonista",category:"pleonasmo",pattern:/\bprincipal\s+protagonista\b|\bprotagonista\s+principal\b/gi,label:"Pleonasmo vicioso: protagonista",explanation:"'Protagonista' j\xE1 significa 'personagem principal' \u2014 'principal' \xE9 redundante.",wrong:"Ela \xE9 a principal protagonista da hist\xF3ria.",right:"Ela \xE9 a protagonista da hist\xF3ria.",detail:`## Pleonasmo vicioso: protagonista

"Protagonista" vem do grego *protos* (primeiro, principal) + *agonistes* (ator, lutador). A ideia de "principal" j\xE1 est\xE1 embutida na palavra.

\u2717  Principal protagonista.
\u2713  Protagonista.

\u2717  O protagonista principal do filme.
\u2713  O protagonista do filme.

**Uso correto de "protagonista":**
\u2713  Ela \xE9 a protagonista da s\xE9rie.
\u2713  O protagonista enfrenta conflitos internos.
\u2713  Cada personagem tem um papel \u2014 um \xE9 o protagonista.

**Aten\xE7\xE3o:** "protagonista" tamb\xE9m pode ser usado metaforicamente:
\u2713  Os jovens s\xE3o os protagonistas da mudan\xE7a.
Mesmo assim, "principal protagonistas" seria redundante.`},{id:"consenso_geral",category:"pleonasmo",pattern:/\bconsenso\s+geral\b|\bconsenso\s+unânime\b/gi,label:"Pleonasmo: consenso j\xE1 \xE9 geral",explanation:"'Consenso' pressup\xF5e acordo de todos \u2014 'geral' \xE9 redundante.",wrong:"Chegamos a um consenso geral.",right:"Chegamos a um consenso.",detail:`## Pleonasmo: consenso geral

"Consenso" (do latim *consensus*) significa acordo de opini\xF5es, consentimento coletivo. J\xE1 implica generalidade \u2014 \xE9 o que faz dele consenso.

\u2717  Consenso geral / consenso un\xE2nime
\u2713  Consenso

\u2717  Houve um consenso geral entre os participantes.
\u2713  Houve consenso entre os participantes.

**Fam\xEDlia do erro \u2014 outros pleonasmos com substantivos que j\xE1 implicam totalidade:**
\u2717  Monop\xF3lio exclusivo  \u2192  \u2713  Monop\xF3lio
\u2717  Hegemonia absoluta  \u2192  \u2713  Hegemonia
\u2717  Unanimidade total  \u2192  \u2713  Unanimidade`},{id:"prever_antecipadamente",category:"pleonasmo",pattern:/\bprever\s+antecipadamente\b|\bprevisto\s+antecipadamente\b|\bpreveja\s+antecipadamente\b/gi,label:"Pleonasmo: prever + antecipadamente",explanation:"'Prever' j\xE1 significa 'ver com anteced\xEAncia' \u2014 'antecipadamente' \xE9 redundante.",wrong:"\xC9 preciso prever antecipadamente os riscos.",right:"\xC9 preciso prever os riscos.",detail:`## Pleonasmo vicioso: prever + antecipadamente

"Prever" vem de *pr\xE9-* (antes) + *ver*. Significa literalmente "ver com anteced\xEAncia". Adicionar "antecipadamente" \xE9 dizer o mesmo duas vezes.

\u2717  Prever antecipadamente.
\u2713  Prever.

\u2717  O relat\xF3rio previu antecipadamente a crise.
\u2713  O relat\xF3rio previu a crise.

**Fam\xEDlia do erro \u2014 verbos com prefixo temporal redundado:**
\u2717  Antecipar previamente  \u2192  \u2713  Antecipar
\u2717  Recapitular novamente  \u2192  \u2713  Recapitular (j\xE1 \xE9 "recapitular" = rever o que foi dito)
\u2717  Predizer de antem\xE3o    \u2192  \u2713  Predizer`},{id:"fato_real",category:"pleonasmo",pattern:/\bfato\s+real\b|\bfatos\s+reais\b(?!\s+e\s+ficcionais|\s+e\s+imagin)/gi,label:"Pleonasmo: fato j\xE1 \xE9 real",explanation:"'Fato' designa algo que aconteceu \u2014 \xE9 real por defini\xE7\xE3o. 'Real' \xE9 redundante.",wrong:"Vou relatar um fato real.",right:"Vou relatar um fato.",detail:`## Pleonasmo vicioso: fato real

"Fato" (do latim *factum*) \xE9 algo que aconteceu, que existe na realidade. Por defini\xE7\xE3o, todo fato \xE9 real \u2014 caso contr\xE1rio, n\xE3o \xE9 um fato, \xE9 uma fic\xE7\xE3o, hip\xF3tese ou mentira.

\u2717  Um fato real que aconteceu.
\u2713  Um fato que aconteceu.

**Exce\xE7\xE3o leg\xEDtima:** quando "fato real" contrasta explicitamente com "fato ficcional":
\u2713  "Baseado em fatos reais" \u2014 contexto cinematogr\xE1fico onde "fatos" pode se referir a eventos de uma narrativa.
\u2713  "Distinguir fatos reais de hist\xF3rias inventadas" \u2014 o contraste justifica o adjetivo.

Fora do contraste expl\xEDcito, "fato real" \xE9 redundante.`},{id:"opiniao_pessoal",category:"pleonasmo",pattern:/\bopinião\s+pessoal\b|\bopiniões\s+pessoais\b/gi,label:"Pleonasmo: opini\xE3o j\xE1 \xE9 pessoal",explanation:"'Opini\xE3o' \xE9 um julgamento subjetivo \u2014 \xE9 pessoal por natureza. 'Pessoal' \xE9 redundante.",wrong:"Na minha opini\xE3o pessoal, acho que est\xE1 certo.",right:"Na minha opini\xE3o, est\xE1 certo.",detail:`## Pleonasmo: opini\xE3o pessoal

"Opini\xE3o" \xE9 um julgamento, ponto de vista subjetivo \u2014 \xE9 intrinsecamente pessoal. Adicionar "pessoal" n\xE3o acrescenta nada.

\u2717  Na minha opini\xE3o pessoal.
\u2713  Na minha opini\xE3o.

**Agravado:** "Na minha opini\xE3o pessoal, eu acho que" \u2014 tr\xEAs marcadores de subjetividade ao mesmo tempo. Escolha um.
\u2713  Na minha opini\xE3o, est\xE1 certo.
\u2713  Acho que est\xE1 certo.
\u2713  Do meu ponto de vista, est\xE1 certo.

**Opini\xE3o coletiva:** "opini\xE3o p\xFAblica" \xE9 correto \u2014 aqui "p\xFAblica" distingue da opini\xE3o individual, tem fun\xE7\xE3o diferenciadora.`},{id:"literalmente_hiperbole",category:"semantica",pattern:/\bliteralmente\s+(?:morri|matei|explodi|morreu|destruí|destruiu|enlouqueci|enlouqueceu|me\s+apaguei|apaguei)\b/gi,label:"Contradi\xE7\xE3o sem\xE2ntica: literalmente + hip\xE9rbole",explanation:"'Literalmente' = de forma exata. Us\xE1-lo com hip\xE9rboles cria contradi\xE7\xE3o de sentido.",wrong:"Literalmente morri de vergonha.",right:"Quase morri de vergonha. / Praticamente morri de vergonha.",detail:`## "Literalmente" + hip\xE9rbole = contradi\xE7\xE3o sem\xE2ntica

"Literalmente" significa "de forma literal, exata, n\xE3o figurada". Hip\xE9rbole \xE9 exatamente o oposto \u2014 uma figura de linguagem que exagera para criar efeito.

Combin\xE1-los \xE9 uma contradi\xE7\xE3o:

\u2717  "Literalmente morri de vergonha."
\u2192 Se fosse literal, voc\xEA estaria morto. Como est\xE1 escrevendo, foi figurado.

\u2717  "Literalmente explodi de raiva."
\u2192 Explos\xF5es reais n\xE3o permitem escrever depois.

**O que usar:**
\u2713  Quase morri de vergonha.
\u2713  Praticamente explodi de raiva.
\u2713  Fui abaixo de vergonha.
\u2713  Morri de vergonha. (sem o "literalmente" \u2014 a hip\xE9rbole funciona sozinha)

**Quando "literalmente" \xE9 correto:**
\u2713  "Ele literalmente correu 10 km." (fez isso de verdade)
\u2713  "A empresa literalmente dobrou de tamanho." (crescimento real)`},{id:"no_caso_de_que",category:"norma",pattern:/\bno\s+caso\s+de\s+que\b/gi,label:"Galicismo/anglicismo 'no caso de que'",explanation:"Em portugu\xEAs: 'no caso de' + infinitivo ou 'caso' + subjuntivo. Nunca 'no caso de que'.",wrong:"No caso de que chova, fique em casa.",right:"Caso chova, fique em casa. / No caso de chover, fique em casa.",detail:`## "No caso de que" \u2014 estrutura estrangeira

"No caso de que" \xE9 calco do espanhol (*en caso de que*) e do ingl\xEAs (*in case that*). N\xE3o existe em portugu\xEAs padr\xE3o.

**As formas corretas em portugu\xEAs:**

**"Caso" + subjuntivo:**
\u2713  Caso chova, fique em casa.
\u2713  Caso haja problemas, informe imediatamente.

**"No caso de" + infinitivo:**
\u2713  No caso de chover, fique em casa.
\u2713  No caso de haver problemas, informe.

**"Se" + indicativo ou subjuntivo:**
\u2713  Se chover, fique em casa.
\u2713  Se houver problemas, informe.

\u2717  No caso de que voc\xEA venha.
\u2713  Caso voc\xEA venha. / Se voc\xEA vier.`},{id:"no_entanto_sem_virgula",category:"pontuacao",pattern:/\bNo\s+entanto\s+(?=[a-záéíóúàâêôãõçü])/g,label:"V\xEDrgula ap\xF3s 'No entanto'",explanation:"'No entanto' como conectivo exige v\xEDrgula imediatamente depois.",wrong:"No entanto o projeto avan\xE7ou.",right:"No entanto, o projeto avan\xE7ou.",detail:`## V\xEDrgula obrigat\xF3ria ap\xF3s conectivos adversativos

Conectivos como "no entanto", "por\xE9m", "todavia", "contudo", "entretanto" \u2014 quando usados no in\xEDcio ou meio de frase para expressar oposi\xE7\xE3o \u2014 exigem v\xEDrgula ap\xF3s eles.

**In\xEDcio de frase:**
\u2717  No entanto o resultado foi positivo.
\u2713  No entanto, o resultado foi positivo.

**Meio de frase (intercalado):**
\u2713  O projeto, no entanto, avan\xE7ou bem.  (v\xEDrgula antes e depois)

**Por que a v\xEDrgula \xE9 obrigat\xF3ria aqui?** O conectivo funciona como adjunto conjuncional \u2014 um elemento que conecta ora\xE7\xF5es mas n\xE3o \xE9 sujeito nem predicado da nova ora\xE7\xE3o. Ele fica isolado por v\xEDrgula do restante.

**Mesma regra para:**
\u2713  Por\xE9m, o resultado...
\u2713  Todavia, n\xE3o foi poss\xEDvel...
\u2713  Contudo, a situa\xE7\xE3o melhorou...
\u2713  Entretanto, o prazo passou...`},{id:"portanto_sem_virgula",category:"pontuacao",pattern:/\bPortanto\s+(?=[a-záéíóúàâêôãõçü])/g,label:"V\xEDrgula ap\xF3s 'Portanto'",explanation:"'Portanto' \xE9 conectivo conclusivo \u2014 exige v\xEDrgula ap\xF3s ele.",wrong:"Portanto o trabalho foi aprovado.",right:"Portanto, o trabalho foi aprovado.",detail:`## V\xEDrgula obrigat\xF3ria ap\xF3s "Portanto"

"Portanto" \xE9 uma conjun\xE7\xE3o conclusiva \u2014 indica que o que vem depois \xE9 consequ\xEAncia do que foi dito antes. Como adjunto conjuncional, exige v\xEDrgula ap\xF3s si.

\u2717  Portanto o projeto foi aprovado.
\u2713  Portanto, o projeto foi aprovado.

**Alternativas sin\xF4nimas (mesma regra):**
\u2713  Logo, o projeto foi aprovado.
\u2713  Assim, o projeto foi aprovado.
\u2713  Consequentemente, o projeto foi aprovado.

**Quando "portanto" aparece no meio da frase:**
\u2713  O projeto, portanto, foi aprovado. (v\xEDrgulas de ambos os lados)`},{id:"alem_disso_sem_virgula",category:"pontuacao",pattern:/\bAlém\s+disso\s+(?=[a-záéíóúàâêôãõçü])/g,label:"V\xEDrgula ap\xF3s 'Al\xE9m disso'",explanation:"'Al\xE9m disso' \xE9 locu\xE7\xE3o aditiva que exige v\xEDrgula ap\xF3s ela.",wrong:"Al\xE9m disso o projeto foi entregue.",right:"Al\xE9m disso, o projeto foi entregue.",detail:`## V\xEDrgula obrigat\xF3ria ap\xF3s locu\xE7\xF5es de transi\xE7\xE3o

"Al\xE9m disso" \xE9 uma locu\xE7\xE3o adverbial aditiva de transi\xE7\xE3o. Quando inicia uma ora\xE7\xE3o, exige v\xEDrgula ap\xF3s a locu\xE7\xE3o.

\u2717  Al\xE9m disso o projeto foi entregue no prazo.
\u2713  Al\xE9m disso, o projeto foi entregue no prazo.

**Fam\xEDlia das locu\xE7\xF5es de transi\xE7\xE3o \u2014 todas pedem v\xEDrgula:**
\u2713  Al\xE9m disso, ...
\u2713  Por outro lado, ...
\u2713  Por sua vez, ...
\u2713  Em contrapartida, ...
\u2713  De fato, ...
\u2713  Por fim, ...
\u2713  Em suma, ...
\u2713  Ou seja, ...

**Dica dissertativa:** em textos argumentativos, essas locu\xE7\xF5es s\xE3o ferramentas de coes\xE3o. Us\xE1-las sem v\xEDrgula \xE9 o erro mais comum em reda\xE7\xF5es.`},{id:"ou_seja_sem_virgula",category:"pontuacao",pattern:/\bou\s+seja\s+(?=[a-záéíóúàâêôãõçü])/gi,label:"V\xEDrgula ap\xF3s 'ou seja'",explanation:"'Ou seja' introduz explica\xE7\xE3o \u2014 exige v\xEDrgula antes e depois.",wrong:"A lei foi aprovada ou seja entrar\xE1 em vigor amanh\xE3.",right:"A lei foi aprovada, ou seja, entrar\xE1 em vigor amanh\xE3.",detail:`## "Ou seja" \u2014 locu\xE7\xE3o explicativa com v\xEDrgulas

"Ou seja" introduz uma explica\xE7\xE3o, reformula\xE7\xE3o ou esclarecimento do que foi dito. Deve ser isolado por v\xEDrgulas dos dois lados.

**Estrutura correta:**
\u2713  ..., ou seja, ...

\u2717  A nota saiu ou seja foi aprovado.
\u2713  A nota saiu, ou seja, foi aprovado.

**Mesma regra para locu\xE7\xF5es explicativas:**
\u2713  ..., isto \xE9, ...
\u2713  ..., quer dizer, ...
\u2713  ..., a saber, ...

**Dica:** se puder substituir "ou seja" por "em outras palavras" e ainda fizer sentido, a v\xEDrgula \xE9 obrigat\xF3ria.`},{id:"por_exemplo_sem_virgula",category:"pontuacao",pattern:/\bPor\s+exemplo\s+(?=[a-záéíóúàâêôãõçü])/g,label:"V\xEDrgula ap\xF3s 'Por exemplo'",explanation:"'Por exemplo' como locu\xE7\xE3o exemplificativa exige v\xEDrgula ap\xF3s ela.",wrong:"Por exemplo o caso do Jo\xE3o foi resolvido.",right:"Por exemplo, o caso do Jo\xE3o foi resolvido.",detail:`## V\xEDrgula obrigat\xF3ria ap\xF3s "Por exemplo"

"Por exemplo" \xE9 uma locu\xE7\xE3o adverbial exemplificativa. Quando inicia ou interrompe a frase, exige v\xEDrgula.

**No in\xEDcio:**
\u2717  Por exemplo o caso foi diferente.
\u2713  Por exemplo, o caso foi diferente.

**No meio (intercalado):**
\u2713  O caso, por exemplo, foi diferente.  (v\xEDrgulas dos dois lados)

**Ap\xF3s dois-pontos:**
\u2713  H\xE1 v\xE1rias solu\xE7\xF5es, como: por exemplo, pode-se...
Mas o mais comum e limpo \xE9:
\u2713  H\xE1 v\xE1rias solu\xE7\xF5es. Por exemplo, pode-se...

**N\xE3o use "como, por exemplo" sem v\xEDrgula:**
\u2717  Como por exemplo o Jo\xE3o.
\u2713  Como, por exemplo, o Jo\xE3o. / Como o Jo\xE3o, por exemplo.`},{id:"sujeito_virgula_verbo",category:"pontuacao",pattern:/\bO\s+diretor,\s+(?:é|foi|será|estava|decidiu|anunciou|precisa|deve|pode)\b|\bA\s+empresa,\s+(?:anunciou|decidiu|investiu|contratou|demitiu|lançou|precisa)\b|\bOs\s+alunos,\s+(?:foram|estão|devem|podem|precisam|realizaram)\b/g,label:"V\xEDrgula entre sujeito e verbo (proibida)",explanation:"Nunca se separa sujeito e verbo com v\xEDrgula \u2014 isso parte ilegalmente a estrutura da ora\xE7\xE3o.",wrong:"O diretor, anunciou a decis\xE3o.",right:"O diretor anunciou a decis\xE3o.",detail:`## V\xEDrgula entre sujeito e verbo \u2014 regra proibida

Esta \xE9 uma das regras mais r\xEDgidas da pontua\xE7\xE3o: **nunca** se coloca v\xEDrgula entre o sujeito e o verbo. A v\xEDrgula parte a ora\xE7\xE3o em ponto errado.

\u2717  O diretor, anunciou a decis\xE3o.
\u2713  O diretor anunciou a decis\xE3o.

\u2717  A empresa, vai mudar de sede.
\u2713  A empresa vai mudar de sede.

**Exce\xE7\xE3o leg\xEDtima:** aposto explicativo ENTRE sujeito e verbo \u2014 a\xED o sujeito e o verbo ficam separados por duas v\xEDrgulas (uma abrindo e outra fechando o aposto):
\u2713  O diretor, Jo\xE3o Silva, anunciou a decis\xE3o.
(O sujeito real \xE9 "O diretor" \u2014 as v\xEDrgulas isolam o aposto "Jo\xE3o Silva")

**Como identificar:** se tirar o que est\xE1 entre as v\xEDrgulas e a frase ainda fizer sentido, \xE9 aposto v\xE1lido. Se n\xE3o, a v\xEDrgula est\xE1 errada.`},{id:"reticencias_quatro",category:"pontuacao",pattern:/\.{4,}/g,label:"Retic\xEAncias com mais de tr\xEAs pontos",explanation:"Retic\xEAncias t\xEAm exatamente tr\xEAs pontos. Quatro ou mais \xE9 uso incorreto.",wrong:"N\xE3o sei.... pode ser.",right:"N\xE3o sei... pode ser.",detail:`## Retic\xEAncias \u2014 exatamente tr\xEAs pontos

A norma estabelece que retic\xEAncias (...) s\xE3o sempre representadas por **exatamente tr\xEAs pontos**. Quatro ou mais pontos \xE9 uso incorreto.

\u2717  N\xE3o sei....
\u2717  Talvez.....
\u2713  N\xE3o sei...
\u2713  Talvez...

**O que as retic\xEAncias indicam:**
- Pausa sugestiva, hesita\xE7\xE3o ou suspense
- Omiss\xE3o em cita\xE7\xE3o: "O autor afirma que '...a l\xEDngua evolui...'"
- Interrup\xE7\xE3o de racioc\xEDnio
- Tom de continuidade impl\xEDcita

**N\xE3o use ponto antes das retic\xEAncias:**
\u2717  Terminou.\u2026
\u2713  Terminou\u2026 (as retic\xEAncias j\xE1 encerram)

**No final de frase:** as retic\xEAncias substituem o ponto final \u2014 n\xE3o se colocam os dois juntos:
\u2717  Fui embora...
\u2713  Fui embora\u2026  (sem ponto adicional ap\xF3s as retic\xEAncias)`},{id:"dois_pontos_verbo_ligacao",category:"pontuacao",pattern:/\b(?:são|é|eram|foram|estão)\s*:\s*(?:o\s+|a\s+|os\s+|as\s+|um\s+|uma\s+)\b/gi,label:"Dois-pontos ap\xF3s verbo de liga\xE7\xE3o",explanation:"Dois-pontos ap\xF3s '\xE9/s\xE3o' antes de predicativo simples \xE9 uso incorreto.",wrong:"O resultado \xE9: positivo.",right:"O resultado \xE9 positivo.",detail:`## Dois-pontos \u2014 quando usar e quando n\xE3o usar

**Uso correto dos dois-pontos:**
1. Para introduzir enumera\xE7\xE3o: "Trouxe tudo: caneta, papel e borracha."
2. Para introduzir cita\xE7\xE3o: 'Ele disse: "Vir\xE1 amanh\xE3."'
3. Para introduzir explica\xE7\xE3o/conclus\xE3o ap\xF3s ora\xE7\xE3o: "A solu\xE7\xE3o era simples: bastava perguntar."

**Uso incorreto \u2014 dois-pontos ap\xF3s verbo de liga\xE7\xE3o antes de predicativo simples:**
\u2717  O resultado \xE9: positivo.
\u2713  O resultado \xE9 positivo.

\u2717  Os objetivos s\xE3o: claros.
\u2713  Os objetivos s\xE3o claros.

**Quando a enumera\xE7\xE3o torna o dois-pontos correto:**
\u2713  Os objetivos s\xE3o: clareza, precis\xE3o e concis\xE3o.  (enumera\xE7\xE3o)
\u2713  O projeto \xE9: ousado, inovador e sustent\xE1vel.  (lista de adjetivos)

**A diferen\xE7a:** com predicativo \xFAnico, sem enumera\xE7\xE3o, o dois-pontos \xE9 desnecess\xE1rio.`},{id:"crase_a_medida_que",category:"crase",pattern:/\ba\s+medida\s+que\b/gi,label:"Crase obrigat\xF3ria: \xE0 medida que",explanation:"'\xC0 medida que' \xE9 locu\xE7\xE3o proporcional e exige crase. N\xE3o confundir com 'na medida em que'.",wrong:"A situa\xE7\xE3o piora a medida que o tempo passa.",right:"A situa\xE7\xE3o piora \xE0 medida que o tempo passa.",detail:`## \xC0 medida que \xD7 Na medida em que \u2014 distin\xE7\xE3o obrigat\xF3ria

S\xE3o duas express\xF5es diferentes, com sentidos diferentes, e s\xF3 uma delas leva crase.

**"\xC0 medida que"** = proporcionalmente, conforme (rela\xE7\xE3o de propor\xE7\xE3o):
\u2713  \xC0 medida que estudamos, aprendemos mais.
\u2713  \xC0 medida que o tempo passa, tudo muda.
*A crase \xE9 obrigat\xF3ria \u2014 preposi\xE7\xE3o "a" + artigo "a" da locu\xE7\xE3o.*

**"Na medida em que"** = porque, dado que (rela\xE7\xE3o de causalidade):
\u2713  Na medida em que todos colaboraram, o projeto avan\xE7ou.
*Sem crase \u2014 a preposi\xE7\xE3o aqui \xE9 "em", n\xE3o "a".*

**O erro duplo:** "na medida que" (sem "em") \xE9 forma incorreta de ambas:
\u2717  Na medida que o tempo passa...
\u2713  \xC0 medida que o tempo passa... (propor\xE7\xE3o)
\u2713  Na medida em que colaboraram... (causa)

**Mnem\xF4nica:** "\xC0 medida que" = \xE0 medida (propor\xE7\xE3o, ritmo). "Na medida em que" = na medida (dentro da raz\xE3o de).`},{id:"crase_a_primeira_vista",category:"crase",pattern:/\ba\s+primeira\s+vista\b/gi,label:"Crase obrigat\xF3ria: \xE0 primeira vista",explanation:"'\xC0 primeira vista' \xE9 locu\xE7\xE3o adverbial feminina \u2014 a crase \xE9 obrigat\xF3ria.",wrong:"A primeira vista parecia f\xE1cil.",right:"\xC0 primeira vista parecia f\xE1cil.",detail:`## Crase obrigat\xF3ria em locu\xE7\xF5es adverbiais femininas

"\xC0 primeira vista" \xE9 uma locu\xE7\xE3o adverbial. O "a" aqui \xE9 a fus\xE3o da preposi\xE7\xE3o "a" com o artigo definido feminino "a" \u2014 logo, crase obrigat\xF3ria.

\u2717  A primeira vista, parecia simples.
\u2713  \xC0 primeira vista, parecia simples.

**Como verificar:** substitua por uma locu\xE7\xE3o masculina equivalente. Se pede "ao", o feminino pede "\xE0":
"Ao primeiro olhar" \u2192 "\xC0 primeira vista" \u2713

**Locu\xE7\xF5es adverbiais femininas com crase obrigat\xF3ria:**
\u2713  \xC0 primeira vista
\u2713  \xC0 m\xE3o (feito \xE0 m\xE3o)
\u2713  \xC0 vontade
\u2713  \xC0 toa
\u2713  \xC0 tarde, \xE0 noite
\u2713  \xC0 esquerda, \xE0 direita
\u2713  \xC0 beira de, \xE0 base de`},{id:"crase_a_vontade",category:"crase",pattern:/\ba\s+vontade\b(?!\s+de\s+(?:ele|ela|você|nós|eles|elas))/gi,label:"Crase obrigat\xF3ria: \xE0 vontade",explanation:"'\xC0 vontade' como locu\xE7\xE3o adverbial sempre leva crase.",wrong:"Fique a vontade.",right:"Fique \xE0 vontade.",detail:`## Crase em "\xE0 vontade"

"\xC0 vontade" \xE9 uma locu\xE7\xE3o adverbial no feminino. A preposi\xE7\xE3o "a" funde com o artigo "a" = crase obrigat\xF3ria.

\u2717  Fique a vontade.
\u2713  Fique \xE0 vontade.

\u2717  Pode comer a vontade.
\u2713  Pode comer \xE0 vontade.

**Dica de verifica\xE7\xE3o:** substitua "vontade" por um substantivo masculino ("prazer"):
"Fique ao prazer" \u2192 confirma que pede artigo \u2192 o feminino pede crase.

**Aten\xE7\xE3o:** "a vontade de algu\xE9m" (= o desejo de algu\xE9m) n\xE3o \xE9 locu\xE7\xE3o adverbial \u2014 \xE9 substantivo com modificador:
\u2713  Respeitou a vontade dela.  (sem crase \u2014 "a" \xE9 artigo, n\xE3o preposi\xE7\xE3o)
\u2713  Fique \xE0 vontade.  (com crase \u2014 "\xE0 vontade" = livremente)`},{id:"crase_a_noite_tarde",category:"crase",pattern:/\ba\s+noite\b(?!\s+de\s+(?:hoje|ontem|amanhã|\d))|\ba\s+tarde\b(?!\s+de\s+(?:hoje|ontem|amanhã|\d))/gi,label:"Crase obrigat\xF3ria: \xE0 noite, \xE0 tarde",explanation:"'\xC0 noite' e '\xE0 tarde' como locu\xE7\xF5es adverbiais de tempo levam crase.",wrong:"Sa\xEDmos a noite para jantar.",right:"Sa\xEDmos \xE0 noite para jantar.",detail:`## Crase em express\xF5es de tempo femininas

"\xC0 noite", "\xE0 tarde", "\xE0 madrugada" s\xE3o locu\xE7\xF5es adverbiais de tempo no feminino \u2014 exigem crase.

\u2717  Sa\xEDmos a noite.
\u2713  Sa\xEDmos \xE0 noite.

\u2717  Chegamos a tarde.
\u2713  Chegamos \xE0 tarde.

**Verifica\xE7\xE3o:** substitua por express\xE3o masculina \u2014 "ao anoitecer", "ao entardecer" \u2014 se cabe "ao", o feminino pede "\xE0".

**Exce\xE7\xE3o:** "de noite" e "de tarde" \u2014 aqui a preposi\xE7\xE3o \xE9 "de", sem artigo, portanto sem crase:
\u2713  Sa\xEDmos de noite.  (= durante a noite \u2014 sem artigo)
\u2713  \xC0 noite sa\xEDmos.  (= \xE0 hora da noite \u2014 com artigo)

**M\xEAs/dia da semana:**
\u2713  \xC0s segundas-feiras. \u2713  \xC0s 18h.  \u2713  Na segunda.`},{id:"crase_a_base_de",category:"crase",pattern:/\ba\s+base\s+de\b/gi,label:"Crase obrigat\xF3ria: \xE0 base de",explanation:"'\xC0 base de' \xE9 locu\xE7\xE3o prepositiva feminina \u2014 crase obrigat\xF3ria.",wrong:"Vivia a base de caf\xE9.",right:"Vivia \xE0 base de caf\xE9.",detail:`## Crase em locu\xE7\xF5es prepositivas femininas

"\xC0 base de" \xE9 uma locu\xE7\xE3o prepositiva \u2014 funciona como preposi\xE7\xE3o composta. Como o n\xFAcleo \xE9 feminino ("base"), a crase \xE9 obrigat\xF3ria.

\u2717  Vivia a base de caf\xE9.
\u2713  Vivia \xE0 base de caf\xE9.

\u2717  Constru\xEDdo a base de concreto.
\u2713  Constru\xEDdo \xE0 base de concreto.

**Outras locu\xE7\xF5es prepositivas femininas com crase obrigat\xF3ria:**
\u2713  \xC0 beira de (\xE0 beira da estrada)
\u2713  \xC0 custa de (\xE0 custa de muito esfor\xE7o)
\u2713  \xC0 merc\xEA de (\xE0 merc\xEA do vento)
\u2713  \xC0 luz de (\xE0 luz dos fatos)
\u2713  \xC0 moda de (\xE0 moda da casa)
\u2713  \xC0 sombra de (\xE0 sombra de uma \xE1rvore)`},{id:"crase_proibida_verbo",category:"crase",pattern:/\bà\s+(?:fazer|ser|estar|ter|ir\b|vir\b|dizer|saber|poder|dever|querer|precisar|realizar|trabalhar|estudar|escrever|ler|correr|falar|pensar)\b/gi,label:"Crase proibida antes de verbo",explanation:"Crase nunca ocorre antes de verbos no infinitivo. Use 'a' simples.",wrong:"Come\xE7ou \xE0 trabalhar cedo.",right:"Come\xE7ou a trabalhar cedo.",detail:`## Crase proibida antes de verbos

Crase = preposi\xE7\xE3o "a" + artigo "a". Verbos no infinitivo n\xE3o aceitam artigo antes deles \u2014 portanto, n\xE3o h\xE1 crase antes de verbo.

\u2717  Come\xE7ou \xE0 trabalhar.
\u2713  Come\xE7ou a trabalhar.

\u2717  Foi \xE0 descansar.
\u2713  Foi descansar. / Foi para descansar.

\u2717  Resistiu \xE0 mudar de ideia.
\u2713  Resistiu a mudar de ideia.

**Regra pr\xE1tica:** se a pr\xF3xima palavra \xE9 um verbo no infinitivo, nunca use "\xE0" \u2014 sempre "a" simples.

**Como verificar:** tente substituir por "ao + infinitivo masculino". Se n\xE3o cabe, \xE9 porque verbo n\xE3o aceita artigo:
"ao trabalhar" \u2014 n\xE3o se diz "vou ao trabalhar" (agramatical)
\u2192 confirma que n\xE3o h\xE1 artigo \u2192 sem crase.`},{id:"crase_proibida_pronome_pessoal",category:"crase",pattern:/\bà\s+(?:ela|elas|ele|eles|você|vocês|mim|nós|vós|mim\b)\b/gi,label:"Crase proibida antes de pronomes pessoais",explanation:"Nunca h\xE1 crase antes de pronomes pessoais. Use 'a' simples.",wrong:"Entreguei \xE0 ela.",right:"Entreguei a ela. / Entreguei-lhe.",detail:`## Crase proibida antes de pronomes pessoais

Pronomes pessoais n\xE3o admitem artigo antes deles \u2014 portanto, n\xE3o h\xE1 crase.

\u2717  Disse \xE0 ela.
\u2713  Disse a ela. / Disse-lhe.

\u2717  Entreguei \xE0 voc\xEA.
\u2713  Entreguei a voc\xEA.

\u2717  Referia-se \xE0 elas.
\u2713  Referia-se a elas.

**Todos os pronomes pessoais \u2014 sem crase:**
a ele / a ela / a eles / a elas / a voc\xEA / a voc\xEAs / a mim / a n\xF3s / a v\xF3s

**Por que n\xE3o h\xE1 crase?** Crase \xE9 "a" (preposi\xE7\xE3o) + "a" (artigo feminino). Pronomes pessoais n\xE3o t\xEAm artigo \u2014 s\xE3o palavras autossuficientes. Logo, n\xE3o h\xE1 fus\xE3o.

**Dica:** coloque um pronome masculino no lugar. Se ficaria "a ele" (sem crase), o feminino fica "a ela" (sem crase). Nunca "\xE0 ela".`},{id:"crase_para_a",category:"crase",pattern:/\bpara\s+à\b/gi,label:"Crase imposs\xEDvel: para \xE0",explanation:"N\xE3o h\xE1 crase ap\xF3s outra preposi\xE7\xE3o. Depois de 'para', use 'a' ou 'a + artigo', nunca '\xE0'.",wrong:"Vou para \xE0 escola.",right:"Vou para a escola.",detail:`## Crase imposs\xEDvel ap\xF3s preposi\xE7\xE3o

Crase = preposi\xE7\xE3o "a" + artigo "a". Se j\xE1 h\xE1 outra preposi\xE7\xE3o antes ("para", "de", "em", "por", "com"), n\xE3o pode haver outra preposi\xE7\xE3o "a" \u2014 e portanto n\xE3o pode haver crase.

\u2717  Vou para \xE0 escola.
\u2713  Vou para a escola.

\u2717  Saiu de \xE0 cidade.
\u2713  Saiu da cidade.  (de + a = da \u2014 contra\xE7\xE3o, n\xE3o crase)

\u2717  Chegou por \xE0 tarde.
\u2713  Chegou pela tarde.  (por + a = pela)

**Regra geral:** ap\xF3s qualquer preposi\xE7\xE3o (para, de, em, com, por, sob, sobre, entre, desde, at\xE9, contra), nunca h\xE1 crase.

**Exce\xE7\xE3o aparente:** "at\xE9 \xE0" \u2014 alguns gram\xE1ticos aceitam "at\xE9 \xE0 praia" quando "at\xE9" \xE9 preposi\xE7\xE3o e "\xE0" \xE9 preposi\xE7\xE3o + artigo. Mas "at\xE9 a praia" (sem crase) tamb\xE9m \xE9 correto e evita a discuss\xE3o.`},{id:"crase_paises_femininos",category:"crase",pattern:/\b(?:vou|foi|ir|fui|viajei|viajou|retornou|voltou|cheguei|chegou)\s+a\s+(?:França|Espanha|Itália|Alemanha|Holanda|Bélgica|Suécia|Noruega|Dinamarca|Grécia|Portugal|Irlanda|Áustria|Suíça|Argentina|Índia|China|Coreia|Finlândia|Hungria|Polônia|Romênia|Bulgária|Croácia|Eslovênia|Ucrânia|Rússia|Turquia)\b/gi,label:"Crase com pa\xEDses femininos que admitem artigo",explanation:"Pa\xEDses femininos com artigo definido ('a Fran\xE7a', 'a It\xE1lia') exigem crase no destino.",wrong:"Viajei a Fran\xE7a no ver\xE3o.",right:"Viajei \xE0 Fran\xE7a no ver\xE3o.",detail:`## Crase com nomes de pa\xEDses \u2014 depende do artigo

A crase com pa\xEDses depende de um fator crucial: o pa\xEDs admite artigo definido?

**Com artigo \u2192 crase obrigat\xF3ria no destino:**
\u2713  Fui \xE0 Fran\xE7a. (a + a Fran\xE7a = \xE0 Fran\xE7a)
\u2713  Viajou \xE0 It\xE1lia.
\u2713  Voltou \xE0 Alemanha.
\u2713  Retornou \xE0 Argentina.

**Sem artigo \u2192 sem crase:**
\u2713  Fui a Cuba. (Cuba n\xE3o admite artigo \u2192 sem crase)
\u2713  Viajou a Portugal. (Portugal \xE9 especial \u2014 geralmente sem artigo no BR)
\u2713  Retornou a Israel.

**Como saber se o pa\xEDs admite artigo:** diga "Gosto da ___" ou "Gosto do ___". Se funciona ("Gosto da Fran\xE7a"), o pa\xEDs admite artigo feminino \u2192 usa crase quando precedido de "a" preposi\xE7\xE3o.

**Retorno \u2014 usa contra\xE7\xE3o "da":**
\u2713  Voltei da Fran\xE7a. (de + a = da)
\u2713  Chegou da It\xE1lia.`},{id:"na_medida_que_errado",category:"crase",pattern:/\bna\s+medida\s+que\b(?!\s+em)/gi,label:"Locu\xE7\xE3o incorreta 'na medida que'",explanation:"A forma correta \xE9 'na medida em que' (causa) ou '\xE0 medida que' (propor\xE7\xE3o).",wrong:"Na medida que o tempo passa, aprendemos.",right:"\xC0 medida que o tempo passa, aprendemos. (propor\xE7\xE3o)",detail:`## "Na medida que" \u2014 forma incorreta

"Na medida que" (sem "em") mistura as duas locu\xE7\xF5es corretas e resulta em forma incorreta.

**As duas formas corretas:**

**"\xC0 medida que"** = proporcionalmente, conforme:
\u2713  \xC0 medida que estudamos, aprendemos.
\u2713  O ritmo aumenta \xE0 medida que praticamos.

**"Na medida em que"** = porque, dado que, na propor\xE7\xE3o em que (causal):
\u2713  Na medida em que todos colaboram, o resultado melhora.
\u2713  O projeto avan\xE7a na medida em que h\xE1 recursos.

**O que nunca existe:**
\u2717  Na medida que o tempo passa.
\u2713  \xC0 medida que o tempo passa.  (propor\xE7\xE3o \u2192 \xE0 medida que)

**Mnem\xF4nica:** se pode substituir por "conforme" \u2192 "\xE0 medida que". Se pode substituir por "porque/dado que" \u2192 "na medida em que".`},{id:"gerundismo_vai_estar",category:"norma",pattern:/\bvai\s+estar\s+\w+ndo\b/gi,label:"Gerundismo (vai estar + ger\xFAndio)",explanation:"Substitua 'vai estar fazendo' por 'vai fazer' \u2014 mais direto e correto.",wrong:"Vai estar esperando na recep\xE7\xE3o.",right:"Vai esperar na recep\xE7\xE3o.",area:"variation",topic:"linguistic_variation",detail:`## Gerundismo: "vai estar + ger\xFAndio"

"Vai estar + ger\xFAndio" \xE9 mais uma variante do gerundismo corporativo. A per\xEDfrase "vai + infinitivo" j\xE1 expressa o futuro com clareza \u2014 o "estar" \xE9 sup\xE9rfluo.

\u2717  Vai estar esperando na recep\xE7\xE3o.
\u2713  Vai esperar na recep\xE7\xE3o.

\u2717  Vai estar enviando em breve.
\u2713  Vai enviar em breve.`},{id:"gerundismo_ira_estar",category:"norma",pattern:/\birá\s+estar\s+\w+ndo\b/gi,label:"Gerundismo (ir\xE1 estar + ger\xFAndio)",explanation:"Substitua 'ir\xE1 estar fazendo' por 'ir\xE1 fazer' \u2014 mais direto e correto.",wrong:"Ir\xE1 estar dispon\xEDvel amanh\xE3.",right:"Estar\xE1 dispon\xEDvel amanh\xE3.",area:"variation",topic:"linguistic_variation",detail:`## Gerundismo: "ir\xE1 estar + ger\xFAndio"

"Ir\xE1 estar + ger\xFAndio" combina dois auxiliares para expressar o futuro \u2014 quando bastaria um verbo no futuro simples.

\u2717  Ir\xE1 estar dispon\xEDvel amanh\xE3.
\u2713  Estar\xE1 dispon\xEDvel amanh\xE3.

\u2717  Ir\xE1 estar aguardando sua liga\xE7\xE3o.
\u2713  Aguardar\xE1 sua liga\xE7\xE3o.`},{id:"acabamento_final",category:"pleonasmo",pattern:/\bacabamento\s+final\b/gi,label:"Pleonasmo vicioso: acabamento final",explanation:"'Acabamento' j\xE1 \xE9 a etapa final de um processo \u2014 'final' \xE9 redundante.",wrong:"O acabamento final ficou impec\xE1vel.",right:"O acabamento ficou impec\xE1vel.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "acabamento final"

"Acabamento" denota a fase conclusiva de um processo. "Final" n\xE3o acrescenta informa\xE7\xE3o \u2014 \xE9 redundante.

\u2717  O acabamento final ficou impec\xE1vel.
\u2713  O acabamento ficou impec\xE1vel.`},{id:"adiar_para_depois",category:"pleonasmo",pattern:/\badiar\s+para\s+depois\b/gi,label:"Pleonasmo vicioso: adiar para depois",explanation:"'Adiar' j\xE1 significa mover para um momento posterior \u2014 'para depois' \xE9 redundante.",wrong:"Vamos adiar para depois a reuni\xE3o.",right:"Vamos adiar a reuni\xE3o.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "adiar para depois"

"Adiar" = transferir para data posterior. "Para depois" repete exatamente esse sentido.

\u2717  Vamos adiar para depois a reuni\xE3o.
\u2713  Vamos adiar a reuni\xE3o.`},{id:"comparecer_pessoalmente",category:"pleonasmo",pattern:/\bcomparecer\s+pessoalmente\b/gi,label:"Pleonasmo vicioso: comparecer pessoalmente",explanation:"'Comparecer' implica presen\xE7a f\xEDsica \u2014 'pessoalmente' \xE9 redundante.",wrong:"O r\xE9u dever\xE1 comparecer pessoalmente.",right:"O r\xE9u dever\xE1 comparecer.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "comparecer pessoalmente"

"Comparecer" = apresentar-se, estar presente. A presen\xE7a f\xEDsica j\xE1 est\xE1 embutida no verbo.

\u2717  O r\xE9u dever\xE1 comparecer pessoalmente.
\u2713  O r\xE9u dever\xE1 comparecer.`},{id:"erario_publico",category:"pleonasmo",pattern:/\berário\s+público\b/gi,label:"Pleonasmo vicioso: er\xE1rio p\xFAblico",explanation:"'Er\xE1rio' \xE9 por defini\xE7\xE3o o tesouro p\xFAblico \u2014 o adjetivo 'p\xFAblico' \xE9 redundante.",wrong:"Os recursos do er\xE1rio p\xFAblico foram desviados.",right:"Os recursos do er\xE1rio foram desviados.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "er\xE1rio p\xFAblico"

"Er\xE1rio" = tesouro do Estado, fazenda p\xFAblica. O adjetivo "p\xFAblico" \xE9 inerente ao substantivo.

\u2717  Os recursos do er\xE1rio p\xFAblico foram desviados.
\u2713  Os recursos do er\xE1rio foram desviados.`},{id:"futuro_porvir",category:"pleonasmo",pattern:/\bfuturo\s+porvir\b/gi,label:"Pleonasmo vicioso: futuro porvir",explanation:"'Porvir' j\xE1 significa 'futuro' \u2014 usar os dois juntos \xE9 redundante.",wrong:"As gera\xE7\xF5es do futuro porvir.",right:"As gera\xE7\xF5es do porvir. / As gera\xE7\xF5es futuras.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "futuro porvir"

"Porvir" (substantivo) = o futuro, o que h\xE1 de vir. Usar "futuro porvir" equivale a dizer "futuro futuro".

\u2717  As gera\xE7\xF5es do futuro porvir.
\u2713  As gera\xE7\xF5es do porvir.
\u2713  As gera\xE7\xF5es futuras.`},{id:"urgente_para_agora",category:"pleonasmo",pattern:/\burgente\s+para\s+agora\b/gi,label:"Pleonasmo vicioso: urgente para agora",explanation:"'Urgente' j\xE1 implica imediatismo \u2014 'para agora' \xE9 redundante.",wrong:"\xC9 urgente para agora.",right:"\xC9 urgente.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "urgente para agora"

"Urgente" = que exige a\xE7\xE3o imediata. "Para agora" apenas repete a ideia de imediatismo.

\u2717  \xC9 urgente para agora.
\u2713  \xC9 urgente.`},{id:"multidao_pessoas",category:"pleonasmo",pattern:/\bmultidão\s+de\s+pessoas\b/gi,label:"Pleonasmo vicioso: multid\xE3o de pessoas",explanation:"'Multid\xE3o' j\xE1 pressup\xF5e um grande n\xFAmero de pessoas \u2014 'de pessoas' \xE9 redundante.",wrong:"Uma multid\xE3o de pessoas protestou.",right:"Uma multid\xE3o protestou.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "multid\xE3o de pessoas"

"Multid\xE3o" = grande quantidade de pessoas reunidas. "De pessoas" \xE9 redundante.

\u2717  Uma multid\xE3o de pessoas protestou.
\u2713  Uma multid\xE3o protestou.`},{id:"novidade_nunca_vista",category:"pleonasmo",pattern:/\bnovidade\s+nunca\s+vista\b/gi,label:"Pleonasmo vicioso: novidade nunca vista",explanation:"'Novidade' j\xE1 implica algo novo ou nunca visto \u2014 a complementa\xE7\xE3o \xE9 redundante.",wrong:"Uma novidade nunca vista antes.",right:"Uma novidade.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "novidade nunca vista"

"Novidade" = algo que n\xE3o existia ou n\xE3o era conhecido antes. "Nunca vista" repete esse sentido.

\u2717  Uma novidade nunca vista antes.
\u2713  Uma novidade.`},{id:"orcamento_previo",category:"pleonasmo",pattern:/\borçamento\s+prévio\b/gi,label:"Pleonasmo vicioso: or\xE7amento pr\xE9vio",explanation:"'Or\xE7amento' \xE9 sempre feito antes da execu\xE7\xE3o \u2014 'pr\xE9vio' \xE9 redundante.",wrong:"Solicite um or\xE7amento pr\xE9vio.",right:"Solicite um or\xE7amento.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "or\xE7amento pr\xE9vio"

Um or\xE7amento \xE9, por natureza, elaborado antes da contrata\xE7\xE3o ou execu\xE7\xE3o do servi\xE7o. "Pr\xE9vio" n\xE3o acrescenta informa\xE7\xE3o.

\u2717  Solicite um or\xE7amento pr\xE9vio.
\u2713  Solicite um or\xE7amento.`},{id:"reabertura_novamente",category:"pleonasmo",pattern:/\breabertura\s+novamente\b/gi,label:"Pleonasmo vicioso: reabertura novamente",explanation:"O prefixo 're-' j\xE1 indica repeti\xE7\xE3o \u2014 'novamente' \xE9 redundante.",wrong:"Anunciaram a reabertura novamente das inscri\xE7\xF5es.",right:"Anunciaram a reabertura das inscri\xE7\xF5es.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "reabertura novamente"

O prefixo "re-" em "reabertura" j\xE1 indica que algo est\xE1 sendo aberto de novo. "Novamente" duplica esse sentido.

\u2717  Anunciaram a reabertura novamente das inscri\xE7\xF5es.
\u2713  Anunciaram a reabertura das inscri\xE7\xF5es.`},{id:"ha_tempo_atras",category:"pleonasmo",pattern:/\bhá\s+(?:muito|pouco|algum|bastante|tanto)\s+tempo\s+atrás\b/gi,label:"Pleonasmo vicioso: h\xE1 tempo atr\xE1s",explanation:"'H\xE1' indica passado e 'atr\xE1s' tamb\xE9m \u2014 use apenas um dos dois.",wrong:"Aconteceu h\xE1 muito tempo atr\xE1s.",right:"Aconteceu h\xE1 muito tempo. / Aconteceu muito tempo atr\xE1s.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "h\xE1 tempo atr\xE1s"

"H\xE1" (do verbo haver) indica tempo passado decorrido. "Atr\xE1s" tamb\xE9m situa no passado. Os dois juntos formam pleonasmo.

\u2717  Aconteceu h\xE1 muito tempo atr\xE1s.
\u2713  Aconteceu h\xE1 muito tempo.
\u2713  Aconteceu muito tempo atr\xE1s.

**Regra:** escolha um dos dois marcadores temporais \u2014 nunca ambos. Para casos com n\xFAmeros ("h\xE1 3 anos atr\xE1s"), a regra \xE9 a mesma.`},{id:"planejar_futuro",category:"pleonasmo",pattern:/\bplanejar\s+o\s+futuro\b/gi,label:"Pleonasmo vicioso: planejar o futuro",explanation:"'Planejar' \xE9 sempre orientado ao futuro \u2014 'o futuro' \xE9 redundante no contexto geral.",wrong:"Precisamos planejar o futuro.",right:"Precisamos planejar.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "planejar o futuro"

"Planejar" \xE9, por defini\xE7\xE3o, pensar e organizar a\xE7\xF5es para o que vir\xE1. "O futuro" n\xE3o especifica nada \u2014 apenas repete o que est\xE1 impl\xEDcito.

\u2717  Precisamos planejar o futuro.
\u2713  Precisamos planejar.
\u2713  Precisamos planejar os pr\xF3ximos passos.  (se quiser especificar, seja mais concreto)`},{id:"vereador_camara",category:"pleonasmo",pattern:/\bvereador\s+da\s+câmara\b/gi,label:"Pleonasmo vicioso: vereador da c\xE2mara",explanation:"Vereador \xE9, por defini\xE7\xE3o, membro da C\xE2mara Municipal \u2014 'da c\xE2mara' \xE9 redundante.",wrong:"O vereador da c\xE2mara prop\xF4s a lei.",right:"O vereador prop\xF4s a lei.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "vereador da c\xE2mara"

"Vereador" = membro eleito da C\xE2mara Municipal. A origem institucional j\xE1 est\xE1 embutida no cargo.

\u2717  O vereador da c\xE2mara prop\xF4s a lei.
\u2713  O vereador prop\xF4s a lei.`},{id:"senador_senado",category:"pleonasmo",pattern:/\bsenador\s+do\s+senado\b/gi,label:"Pleonasmo vicioso: senador do senado",explanation:"Senador \xE9, por defini\xE7\xE3o, membro do Senado \u2014 'do senado' \xE9 redundante.",wrong:"O senador do senado votou contra.",right:"O senador votou contra.",area:"stylistics",topic:"figures",detail:`## Pleonasmo vicioso: "senador do senado"

"Senador" = membro do Senado Federal. "Do senado" apenas repete a defini\xE7\xE3o do cargo.

\u2717  O senador do senado votou contra.
\u2713  O senador votou contra.`},{id:"cumprimento_comprimento",category:"paronimia",pattern:/\bcumprimento\s+(?:do|da|de|em|ao)\s+(?:caminho|distância|fio|cabo|rio|estrada|linha|percurso)\b/gi,label:"Cuidado: cumprimento \xD7 comprimento",explanation:"'Cumprimento' = sauda\xE7\xE3o ou a\xE7\xE3o de cumprir. 'Comprimento' = extens\xE3o, tamanho.",wrong:"O cumprimento do fio \xE9 de 10 metros.",right:"O comprimento do fio \xE9 de 10 metros.",area:"semantics",topic:"paronimia",detail:`## Par\xF4nimos: cumprimento \xD7 comprimento

Dois substantivos com grafia parecida e significados completamente diferentes.

**Cumprimento** (com u):
- Sauda\xE7\xE3o: "Dei um cumprimento ao vizinho."
- Ato de cumprir: "O cumprimento do contrato foi rigoroso."

**Comprimento** (com o):
- Extens\xE3o, medida linear: "O comprimento da estrada \xE9 de 40 km."
- Dimens\xE3o de um objeto: "Qual \xE9 o comprimento do cabo?"

\u2717  O cumprimento do rio \xE9 de 500 km.
\u2713  O comprimento do rio \xE9 de 500 km.

**Dica:** para extens\xE3o/medida, pense em "comprido" \u2192 comprimento.`},{id:"cessao_seccao_sessao",category:"paronimia",pattern:/\bcessão\s+(?:de|do|da|dos|das)\s+(?:espaço|sala|local|área)\b/gi,label:"Cuidado: cess\xE3o \xD7 se\xE7\xE3o \xD7 sess\xE3o",explanation:"'Cess\xE3o' = ato de ceder. 'Se\xE7\xE3o' = divis\xE3o, departamento. 'Sess\xE3o' = per\xEDodo de atividade.",wrong:"A cess\xE3o do espa\xE7o foi confirmada.",right:"A cess\xE3o do espa\xE7o foi confirmada. (ceder o espa\xE7o \u2014 correto se for isso) / A se\xE7\xE3o de espa\xE7o foi demarcada. (divis\xE3o)",area:"semantics",topic:"paronimia",detail:`## Par\xF4nimos: cess\xE3o \xD7 se\xE7\xE3o \xD7 sess\xE3o

Tr\xEAs palavras com pron\xFAncia id\xEAntica (/se's\xE3w/) e sentidos distintos.

**Cess\xE3o** (de ceder):
- Ato de transferir ou ceder algo: "A cess\xE3o do im\xF3vel foi assinada."

**Se\xE7\xE3o** (divis\xE3o):
- Parte, departamento, setor: "A se\xE7\xE3o de inform\xE1tica est\xE1 no 3\xBA andar."
- Corte, divis\xE3o f\xEDsica: "A se\xE7\xE3o transversal do osso."

**Sess\xE3o** (per\xEDodo de tempo):
- Reuni\xE3o, exibi\xE7\xE3o, per\xEDodo de atividade: "A sess\xE3o do tribunal durou tr\xEAs horas."
- "Sess\xE3o de cinema", "sess\xE3o de fotos".

**Dica:** cess\xE3o \u2192 ceder | se\xE7\xE3o \u2192 setor | sess\xE3o \u2192 sentar (reuni\xE3o)`},{id:"mal_mau_contexto",category:"paronimia",pattern:/\bmal\s+(?:tempo|cheiro|hálito|humor|caráter|índole|comportamento|exemplo)\b/gi,label:"Mal \xD7 mau: aten\xE7\xE3o ao contexto",explanation:"'Mau' \xE9 adjetivo (oposto de bom). 'Mal' \xE9 adv\xE9rbio (oposto de bem) ou substantivo.",wrong:"Ele tem mal h\xE1lito.",right:"Ele tem mau h\xE1lito.",area:"semantics",topic:"paronimia",detail:`## Par\xF4nimos: mal \xD7 mau

**Mau** (adjetivo \u2014 oposto de bom):
- Qualifica substantivos: mau car\xE1ter, mau exemplo, mau humor, mau cheiro, mau h\xE1lito.
- Concorda em g\xEAnero: mau/m\xE1, maus/m\xE1s.

**Mal** (adv\xE9rbio \u2014 oposto de bem):
- Modifica verbos ou adjetivos: "Ele se comportou mal." / "Estava mal informado."
- Tamb\xE9m pode ser substantivo: "O mal do s\xE9culo."

\u2717  Ele tem mal h\xE1lito.        \u2713  Ele tem mau h\xE1lito.
\u2717  \xC9 um mal exemplo.          \u2713  \xC9 um mau exemplo.
\u2717  Estava de mal humor.       \u2713  Estava de mau humor.

**Teste r\xE1pido:** substitua por "bom/boa". Se funcionar, use "mau/m\xE1". Se n\xE3o, use "mal".
\u2713  Ele tem bom h\xE1lito \u2192 mau h\xE1lito (adjetivo)
\u2717  Ele se comportou bom \u2192 se comportou mal (adv\xE9rbio)`},{id:"ascender_acender",category:"paronimia",pattern:/\bascender\s+(?:a\s+)?(?:luz|vela|fogo|fogueira|forno|churrasqueira)\b/gi,label:"Ascender \xD7 acender",explanation:"'Acender' = colocar fogo, ligar. 'Ascender' = subir, elevar-se.",wrong:"Ascenda a vela antes de dormir.",right:"Acenda a vela antes de dormir.",area:"semantics",topic:"paronimia",detail:`## Par\xF4nimos: acender \xD7 ascender

**Acender** (com c):
- Colocar fogo, ligar (luz, aparelho): "Acendeu o forno." / "Acendeu a luz."

**Ascender** (com sc):
- Subir, elevar-se, progredir: "Ascendeu ao cargo de diretor." / "O bal\xE3o ascendeu."

\u2717  Ascenda a fogueira.        \u2713  Acenda a fogueira.
\u2717  Acendeu na carreira.       \u2713  Ascendeu na carreira.

**Dica:** acender \u2192 fogo/luz | ascender \u2192 ascens\xE3o, subida.`},{id:"emigrar_imigrar",category:"paronimia",pattern:/\bimigrar\s+(?:para\s+)?(?:o\s+exterior|fora\s+do\s+país|outro\s+país)\b/gi,label:"Imigrar \xD7 emigrar",explanation:"'Emigrar' = sair do pa\xEDs de origem. 'Imigrar' = entrar em outro pa\xEDs.",wrong:"Ele decidiu imigrar para o exterior.",right:"Ele decidiu emigrar. (sair do Brasil) / Ele imigrou para a Alemanha. (entrar na Alemanha)",area:"semantics",topic:"paronimia",detail:`## Par\xF4nimos: emigrar \xD7 imigrar

**Emigrar** (sa\xEDda):
- Deixar o pa\xEDs de origem para viver em outro lugar.
- "Os brasileiros que emigram v\xE3o para Portugal, EUA, Jap\xE3o..."

**Imigrar** (entrada):
- Entrar em um pa\xEDs estrangeiro para nele residir.
- "Os alem\xE3es que imigraram para o Brasil no s\xE9culo XIX..."

A mesma pessoa *emigra* do pa\xEDs de origem e *imigra* no pa\xEDs de destino.

\u2717  Ele imigrou para o exterior.   (vago \u2014 quem emigra vai para "fora"; quem imigra chega em algum lugar espec\xEDfico)
\u2713  Ele emigrou do Brasil.
\u2713  Ele imigrou para Portugal.`}],fi=[...jn,...di],rt=new Map(fi.map(e=>[e.id,e])),he=null,et=null;function Mn(){return he||(he=document.createElement("button"),he.id="lintBadge",he.type="button",he.title="Ver ocorr\xEAncias do inspetor",he.setAttribute("aria-label","Inspetor gramatical \u2014 ver ocorr\xEAncias"),he.setAttribute("aria-hidden","true"),he.innerHTML='<span class="lb-icon">\u25C9</span><span class="lb-count">0</span>',document.body.appendChild(he),he.addEventListener("click",()=>{if(!et)return;let e=document.querySelector(".pageContent:focus")||document.querySelector(".pageContent");e&&bi(et,e)}),he)}function ao(e){var t,r;if(!he)return;let a=e?e.querySelectorAll(".gram-mark"):[],o=a.length;if(he.querySelector(".lb-count").textContent=o,o===0)he.setAttribute("aria-hidden","true"),he.classList.remove("is-visible");else{he.setAttribute("aria-hidden","false"),he.classList.add("is-visible");let i={};for(let s of a){let d=s.dataset.cat||"grafia";i[d]=(i[d]||0)+1}let n=((t=Object.entries(i).sort((s,d)=>d[1]-s[1])[0])==null?void 0:t[0])||"grafia";he.style.setProperty("--lb-color",((r=tt[n])==null?void 0:r.cor)||"#ef5350")}}function bi(e,a){var s;let o=Array.from(a.querySelectorAll(".gram-mark"));if(!o.length){let d=ie(e,{badge:"AG",title:"INSPETOR",kindKey:"help",meta:"nenhuma ocorr\xEAncia",body:"Nenhuma ocorr\xEAncia detectada. O texto est\xE1 limpo."});return Ve(d),d}let t={};for(let d of o){let c=rt.get(d.dataset.ruleId);if(!c)continue;let l=c.category||"grafia";((s=t[l])!=null?s:t[l]=[]).push({mark:d,rule:c})}let r='<div class="lint-report">';for(let[d,c]of Object.entries(t)){let l=tt[d]||{cor:"#888",label:d};r+='<div class="lint-cat-block">',r+=`<div class="lint-cat-head" style="--lc:${l.cor}">${l.label}<span class="lint-cat-count">${c.length}</span></div>`;for(let{mark:u,rule:p}of c){let b=u.dataset.wrong||u.textContent||p.wrong||"",g=(u.dataset.right||p.right||"").replace(/\(.*?\)/g,"").trim();r+='<div class="lint-item">',r+='<div class="lint-pair">',r+=`<span class="lint-wrong">${Zo(b)}</span>`,g&&(r+=`<span class="lint-arrow">\u2192</span><span class="lint-right">${Zo(g)}</span>`),r+="</div>",r+=`<div class="lint-item-label">${Zo(p.label)}</div>`,r+="</div>"}r+="</div>"}r+=`<div class="lint-report-footer">${o.length} ocorr\xEAncia${o.length!==1?"s":""} \xB7 hover no sublinhado para a regra</div>`,r+="</div>";let i=ie(e,{badge:"AG",title:"INSPETOR",kindKey:"help",meta:`${o.length} ocorr\xEAncia${o.length!==1?"s":""}`,body:""}),n=i.querySelector(".panelBody");return n&&(n.innerHTML=r),Ve(i),i}function Zo(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var ye=null,wa=0,mi=null;function On(){return ye||(ye=document.createElement("div"),ye.id="gramFloater",ye.setAttribute("aria-hidden","true"),ye.innerHTML=`
    <span class="gf-label"></span>
    <span class="gf-expl"></span>
    <span class="gf-pair">
      <span class="gf-wrong"></span>
      <span class="gf-arrow">\u2192</span>
      <span class="gf-right"></span>
    </span>
    <button class="gf-btn" type="button">entender melhor</button>
  `,document.body.appendChild(ye),ye.addEventListener("mouseenter",()=>clearTimeout(wa)),ye.addEventListener("mouseleave",vi),ye)}function vi(){clearTimeout(wa),wa=setTimeout(()=>{ye&&(ye.classList.remove("isVisible"),ye.setAttribute("aria-hidden","true"))},220)}function hi(){clearTimeout(wa),ye&&(ye.classList.remove("isVisible"),ye.setAttribute("aria-hidden","true"))}function Rn(e,a,o,t){var v;clearTimeout(wa),mi=t;let r=e.dataset.wrong||a.wrong||"",i=e.dataset.right||a.right||"",n=On(),s=((v=tt[a.category])==null?void 0:v.cor)||"#c4542a";n.querySelector(".gf-label").textContent=a.id==="acento_faltando"?`"${r}" sem acento (acentua\xE7\xE3o)`:a.label,n.querySelector(".gf-label").style.color=s,n.querySelector(".gf-expl").textContent=a.id==="acento_faltando"?`Esta palavra precisa de acento. Escreva "${i}".`:a.explanation,n.querySelector(".gf-wrong").textContent=r,n.querySelector(".gf-right").textContent=i;let d=r&&i;n.querySelector(".gf-pair").style.display=d?"flex":"none";let c=n.querySelector(".gf-btn"),l=c.cloneNode(!0);l.textContent="entender melhor",c.replaceWith(l),l.addEventListener("click",y=>{y.preventDefault(),y.stopPropagation(),hi();let E=mi;if(E){E.focus();let f=window.getSelection();if(!f||f.rangeCount===0){let w=document.createRange();w.selectNodeContents(E),w.collapse(!1),f==null||f.removeAllRanges(),f==null||f.addRange(w)}}o(a)});let u=e.getBoundingClientRect(),p=300,b=n.offsetHeight||120,g=u.left+u.width/2-p/2;g=Math.max(8,Math.min(g,window.innerWidth-p-8));let m=u.top-b-12;m<8&&(m=u.bottom+8),n.style.left=`${Math.round(g)}px`,n.style.top=`${Math.round(m)}px`,n.classList.add("isVisible"),n.setAttribute("aria-hidden","false")}function pi(e,a){at(e);let o=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(n){var d,c,l;let s=n.parentElement;return(d=s==null?void 0:s.closest)!=null&&d.call(s,".slice")||(l=(c=s==null?void 0:s.className)==null?void 0:c.startsWith)!=null&&l.call(c,"wc-")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),t=[],r=null,i;for(;i=o.nextNode();){r||(r=i);let n=i.textContent;for(let s of fi){if(!s.pattern)continue;s.pattern.lastIndex=0;let d;for(;(d=s.pattern.exec(n))!==null;)t.push({node:i,start:d.index,end:d.index+d[0].length,ruleId:s.id})}}if(r){let n=r.textContent[0];n&&/[a-záàâãéêíóôõúüç]/.test(n)&&t.push({node:r,start:0,end:1,ruleId:"inicio_minuscula"})}if(oo){let n=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(c){var u,p,b;let l=c.parentElement;return(u=l==null?void 0:l.closest)!=null&&u.call(l,".slice,.gram-mark")||(b=(p=l==null?void 0:l.className)==null?void 0:p.startsWith)!=null&&b.call(p,"wc-")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),s=/\b([A-Za-záàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ]{3,})\b/g,d;for(;d=n.nextNode();){let c=d.textContent;s.lastIndex=0;let l;for(;(l=s.exec(c))!==null;){let u=l[1],p=$n(u),b=/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(u)&&l.index>0;if(p===u.toLowerCase()&&!ot.has(p)&&!b){let g=oo[p];g&&g!==u.toLowerCase()&&t.push({node:d,start:l.index,end:l.index+u.length,ruleId:"acento_faltando",wrong:u,right:g})}}}}t.sort((n,s)=>n.node===s.node?s.start-n.start:0);for(let{node:n,start:s,end:d,ruleId:c,wrong:l,right:u}of t)try{let p=document.createRange();p.setStart(n,s),p.setEnd(n,d);let b=document.createElement("span"),g=rt.get(c);b.className="gram-mark",b.dataset.ruleId=c,b.dataset.cat=(g==null?void 0:g.category)||"grafia",l&&(b.dataset.wrong=l),u&&(b.dataset.right=u),p.surroundContents(b)}catch(p){}a==null||a(e)}function at(e){let a=e.querySelectorAll(".gram-mark");for(let o of a){let t=o.parentNode;if(t){for(;o.firstChild;)t.insertBefore(o.firstChild,o);t.removeChild(o),t.normalize()}}}function gi(e,a){let o=a.detail||zn(a),t=ie(e,{badge:"GR",title:"GRAM\xC1TICA",kindKey:"help",meta:a.label.toLowerCase(),body:o});return Ve(t),a.detail||ca.load(a.area,a.topic).then(r=>{var d,c;let n=(Array.isArray(r==null?void 0:r.sections)?r.sections.flatMap(l=>{var u,p,b;return[...(u=l.rules)!=null?u:[],...(p=l.entries)!=null?p:[],...(b=l.items)!=null?b:[]]}):(d=r==null?void 0:r.entries)!=null?d:[]).find(l=>l.id===a.id||l.id&&a.id.startsWith(l.id));if(!n)return;let s=[];if(n.rule&&s.push(`**Regra formal:** ${n.rule}`),n.tip&&s.push(n.tip),n.correct&&s.push(`\u2713 ${n.correct}`),n.incorrect&&s.push(`\u2717 ${n.incorrect}`),(c=n.examples)!=null&&c[0]&&s.push(`Exemplo do corpus: ${n.examples[0]}`),s.length){let l=t.querySelector(".panelBody");if(!l)return;let u=o+`

---
`+s.join(`
`);l.innerHTML=u.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/^## (.+)$/m,"<strong>$1</strong>").replace(/\n/g,"<br>")}}).catch(()=>{}),t}function zn(e){let a=[`## ${e.label}`,"",e.explanation];return e.wrong&&e.right&&a.push("",`\u2717  ${e.wrong}`,`\u2713  ${e.right}`),a.join(`
`)}function yi(e){let o=0,t=!0;In(),et=e,Mn();let r=i=>gi(e,i);document.addEventListener("mouseover",i=>{var c,l;let n=(l=(c=i.target)==null?void 0:c.closest)==null?void 0:l.call(c,".gram-mark");if(!n)return;let s=rt.get(n.dataset.ruleId);if(!s)return;let d=n.closest(".pageContent");Rn(n,s,r,d)}),document.addEventListener("mouseout",i=>{var d,c;if(!((c=(d=i.target)==null?void 0:d.closest)==null?void 0:c.call(d,".gram-mark")))return;let s=i.relatedTarget;ye&&(s===ye||ye.contains(s))||vi()}),document.addEventListener("input",i=>{var s,d;if(!t)return;let n=(d=(s=i.target)==null?void 0:s.closest)==null?void 0:d.call(s,".pageContent");n&&(clearTimeout(o),o=setTimeout(()=>pi(n,ao),2e3))}),document.addEventListener("focusin",i=>{var s,d;let n=(d=(s=i.target)==null?void 0:s.closest)==null?void 0:d.call(s,".pageContent");n&&(clearTimeout(o),at(n),ao(n),hi())}),e.grammarLint={scan(i){i&&pi(i,ao)},clear(i){i&&(at(i),ao(i))},toggle(){return t=!t,t},isActive(){return t},openRuleSlice:i=>gi(e,i),openReportSlice:i=>bi(e,i)}}function nt(e){try{return e.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}catch(a){return e.toLowerCase()}}var Dn=new Set([...ot,"a","e","o","\xE9","\xE0","i","u","ai","ei","eu","tu","em","de","do","da","no","na","ao","\xE0s","dos","das","nos","nas","um","uma","uns","umas","com","por","sem","sob","at\xE9","via"]),to=!1;function xi(){return S(this,null,function*(){to||(yield Mt(),to=!0)})}function Fn(e){return to?Da(e):!0}var it="a\xE1\xE2\xE3bc\xE7de\xE9\xEAfghi\xEDjklmno\xF3\xF4\xF5pqrstu\xFA\xFCvwxyz";function st(e){let a=e.toLowerCase(),o=new Set,t=a.length;for(let r=0;r<t;r++){o.add(a.slice(0,r)+a.slice(r+1)),r<t-1&&o.add(a.slice(0,r)+a[r+1]+a[r]+a.slice(r+2));for(let i of it)o.add(a.slice(0,r)+i+a.slice(r+1));for(let i of it)o.add(a.slice(0,r)+i+a.slice(r))}for(let r of it)o.add(a+r);return o}function Bn(e,a=4){if(!to||!e||e.length<3)return[];let o=new Map;for(let t of st(e)){if(t.length<2)continue;let r=nt(t);if(!o.has(r)&&Da(t)){let i=Eo(t);o.set(r,{word:(i==null?void 0:i.word)||t,dist:1})}}if(o.size<a){let t=[...st(e)].slice(0,40);e:for(let r of t)for(let i of st(r)){if(i===e.toLowerCase()||i.length<2)continue;let n=nt(i);if(!o.has(n)&&Da(i)){let s=Eo(i);if(o.set(n,{word:(s==null?void 0:s.word)||i,dist:2}),o.size>=a*3)break e}}}return[...o.values()].sort((t,r)=>t.dist-r.dist).slice(0,a).map(t=>t.word)}function Si(e){for(let a of e.querySelectorAll(".lex-mark")){let o=a.parentNode;if(o){for(;a.firstChild;)o.insertBefore(a.firstChild,a);o.removeChild(a),o.normalize()}}}function Hn(e){return S(this,null,function*(){if(!e)return;yield xi(),Si(e);let a=document.createTreeWalker(e,NodeFilter.SHOW_TEXT,{acceptNode(i){var n,s;return(s=(n=i.parentElement)==null?void 0:n.closest)!=null&&s.call(n,".slice,.gram-mark,.lex-mark")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),o=[],t=/\b([a-záàâãéêíóôõúüçA-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]{3,})\b/g,r;for(;r=a.nextNode();){let i=r.textContent,n;for(t.lastIndex=0;(n=t.exec(i))!==null;){let s=n[1],d=nt(s);Dn.has(d)||/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(s)&&n.index>0||Fn(s)||o.push({node:r,start:n.index,end:n.index+s.length,word:s})}}o.sort((i,n)=>i.node===n.node?n.start-i.start:0);for(let{node:i,start:n,end:s,word:d}of o)try{let c=document.createRange();c.setStart(i,n),c.setEnd(i,s);let l=document.createElement("span");l.className="lex-mark",l.dataset.word=d,c.surroundContents(l)}catch(c){}})}var qe=null,ro=0;function Vn(){return qe||(qe=document.createElement("div"),qe.id="lexFloater",qe.setAttribute("aria-hidden","true"),document.body.appendChild(qe),qe.addEventListener("mouseenter",()=>clearTimeout(ro)),qe.addEventListener("mouseleave",io),qe)}function io(){clearTimeout(ro),ro=setTimeout(()=>{qe&&(qe.classList.remove("isVisible"),qe.setAttribute("aria-hidden","true"))},200)}function Un(e,a){clearTimeout(ro);let o=Vn(),t='<span class="lf-label">n\xE3o encontrado</span>';if(a.length){t+='<span class="lf-hint">sugest\xF5es</span><div class="lf-chips">';for(let s of a)t+=`<button class="lf-chip" type="button" data-sug="${s}">${s}</button>`;t+="</div>"}else t+='<span class="lf-hint">sem sugest\xF5es pr\xF3ximas</span>';o.innerHTML=t,o.setAttribute("aria-hidden","false");let r=e.getBoundingClientRect(),i=r.bottom+window.scrollY+5,n=r.left+window.scrollX;n+220>window.innerWidth&&(n=window.innerWidth-228),i+80>window.innerHeight+window.scrollY&&(i=r.top+window.scrollY-80-5),o.style.top=i+"px",o.style.left=n+"px",o.classList.add("isVisible"),o.querySelectorAll(".lf-chip").forEach(s=>{s.addEventListener("click",()=>{let d=s.dataset.sug,c=e.textContent,l=/^[A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ]/.test(c)?d.charAt(0).toUpperCase()+d.slice(1):d,u=e.parentNode;u&&(u.replaceChild(document.createTextNode(l),e),u.normalize(),io())})})}function Ei(){let a=0;xi(),document.addEventListener("input",o=>{var r,i;let t=(i=(r=o.target)==null?void 0:r.closest)==null?void 0:i.call(r,".pageContent");t&&(clearTimeout(a),a=setTimeout(()=>Hn(t),2e3))}),document.addEventListener("focusin",o=>{var r,i;let t=(i=(r=o.target)==null?void 0:r.closest)==null?void 0:i.call(r,".pageContent");t&&(clearTimeout(a),Si(t),io())}),document.addEventListener("mouseover",o=>{var i,n;let t=(n=(i=o.target)==null?void 0:i.closest)==null?void 0:n.call(i,".lex-mark");if(!t)return;let r=t.dataset.word||t.textContent;Un(t,Bn(r))}),document.addEventListener("mouseout",o=>{var i,n;if(!((n=(i=o.target)==null?void 0:i.closest)==null?void 0:n.call(i,".lex-mark")))return;let r=o.relatedTarget;qe&&(r===qe||qe.contains(r))||io()})}var wi="skrv_onboard_v1",so=[{n:1,title:"Digite e abra atalhos",body:'Escreva normalmente. Quando precisar de algo, digite <code class="obCode">..</code> seguido de uma letra \u2014 o painel abre dentro do pr\xF3prio documento, sem sair do fluxo.',demo:"typing"},{n:2,title:"Cortes vivem no documento",body:"Cada atalho abre um <em>corte</em> \u2014 um painel que respira junto com o texto. Clique no cabe\xE7alho para minimizar. Arraste a tag lateral para reposicionar. Clique nas bordas para fechar.",demo:"slice"},{n:3,title:"Tudo ao lado, sempre acess\xEDvel",body:"Cada atalho abre uma aba lateral. Clique na aba para reabrir o painel quando precisar.",demo:"tabs",tabs:[{n:"01",label:"NOTAS"},{n:"02",label:"ARQUIVO"}]}];function Kn(e){return e.demo==="typing"?`
      <div class="obDemo obDemo--typing">
        <div class="obFakePage">
          <div class="obFakeLine">
            <span class="obLineText">escreva o que quiser</span><span class="obTyped"><span class="obT1">.</span><span class="obT2">.</span><span class="obT3">h</span></span><span class="obCaret"></span>
          </div>
          <div class="obFakeSlice">
            <div class="obFakeSliceHead">MENU \xB7 atalhos e comandos</div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">ajuda e atalhos</span><code class="obFakeCmd">..h</code></div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">modos de escrita</span><code class="obFakeCmd">..m</code></div>
            <div class="obFakeSliceRow"><span class="obFakeDesc">notas laterais</span><code class="obFakeCmd">..n</code></div>
          </div>
        </div>
      </div>`:e.demo==="slice"?`
      <div class="obDemo obDemo--slice">
        <div class="obFakePage obFakePage--anim">
          <div class="obFakeSliceOpen">
            <div class="obFakeSliceHead obFakeSliceHead--open obFakeHead--anim">
              <span>MENU \xB7 atalhos e comandos</span>
              <span class="obFakeSliceHint">\u2190 clique para minimizar</span>
            </div>
            <div class="obFakeSliceBody">
              <div class="obFakeSliceRow"><span class="obFakeDesc">ajuda e atalhos</span><code class="obFakeCmd">..h</code></div>
              <div class="obFakeSliceRow obFakeSliceRow--alt"><span class="obFakeDesc">notas laterais</span><code class="obFakeCmd">..n</code></div>
              <div class="obFakeSliceRow"><span class="obFakeDesc">projetos e arquivos</span><code class="obFakeCmd">..a</code></div>
            </div>
          </div>
          <div class="obFakeTag obFakeTag--anim">
            <div class="obFakeTagLabel">01 MENU</div>
            <div class="obFakeTagHint">arrastar \u2195</div>
          </div>
          <div class="obCursor" aria-hidden="true">
            <img src="assets/cursors/bibata-ice/pointer.svg" width="28" height="28" alt="">
          </div>
        </div>
      </div>`:e.demo==="tabs"?`
      <div class="obDemo obDemo--tabs">
        <div class="obTabsScene">
          <div class="obTabsPage">
            <div class="obTabsLine"></div>
            <div class="obTabsLine obTabsLine--mid"></div>
            <div class="obTabsLine obTabsLine--short"></div>
            <div class="obTabsLine obTabsLine--mid"></div>
          </div>
          <div class="obTabsDock">
            ${e.tabs.map((a,o)=>`
              <div class="obTabPill" style="animation-delay:${o*140}ms">
                <span class="obTabN">${a.n}</span>
                <span class="obTabLabel">${a.label}</span>
              </div>`).join("")}
          </div>
        </div>
      </div>`:""}function Gn(){let e=document.createElement("div");return e.className="obOverlay",e.id="obOverlay",e.innerHTML=`
    <div class="obCard" role="dialog" aria-modal="true" aria-label="Bem-vindo ao eskrev">
      <div class="obStepWrap" id="obStepWrap"></div>
      <div class="obNav">
        <div class="obDots" id="obDots"></div>
        <div class="obBtns">
          <button class="obSkip" id="obSkip" type="button">Pular</button>
          <button class="obNext" id="obNext" type="button">Pr\xF3ximo</button>
        </div>
      </div>
    </div>
  `,e}function ct(e,a){let o=so[a],t=e.querySelector("#obStepWrap"),r=e.querySelector("#obDots"),i=e.querySelector("#obNext"),n=e.querySelector("#obSkip"),s=a===so.length-1;r.innerHTML=so.map((d,c)=>`<button class="obDot${c===a?" is-active":""}" type="button" aria-label="Etapa ${c+1}"></button>`).join(""),r.querySelectorAll(".obDot").forEach((d,c)=>{d.addEventListener("click",()=>ct(e,c))}),t.innerHTML=`
    <div class="obStep obStep--enter">
      <div class="obStepNum">0${o.n} / 0${so.length}</div>
      <h2 class="obTitle">${o.title}</h2>
      <p class="obBody">${o.body}</p>
      ${Kn(o)}
    </div>
  `,i.textContent=s?"Come\xE7ar \u2192":"Pr\xF3ximo \u2192",n.style.display=s?"none":"",i.onclick=()=>{s?qi(e):ct(e,a+1)},n.onclick=()=>qi(e)}function qi(e){e.classList.add("obOverlay--out"),setTimeout(()=>e.remove(),350);try{localStorage.setItem(wi,"1")}catch(a){}}function Ai(){try{if(localStorage.getItem(wi))return}catch(a){}let e=Gn();document.body.appendChild(e),requestAnimationFrame(()=>{requestAnimationFrame(()=>{e.classList.add("obOverlay--in"),ct(e,0)})})}var no={frameEl:document.querySelector(".frame"),pagesEl:document.getElementById("pages"),statusEl:document.getElementById("status"),topbarEl:document.querySelector(".topbar"),viewportEl:document.querySelector(".viewport"),sliceDockEl:document.getElementById("sliceDockRail"),postitLayerEl:document.getElementById("postitLayer"),selectionToolbarEl:document.getElementById("selectionToolbar")},Wn={sliceId:0,dockAnchorId:0,pages:[],currentPageIdx:0,dockOffsetX:20,dockOffsetY:0},me={refs:no,state:Wn,integrations:null,sfx:Dr(),theme:{cycle:Ya,set:Ho,get:Vo},setStatus(e){no.statusEl&&(no.statusEl.textContent=e)},flashCommandError(){let e=no.frameEl;e&&(e.classList.remove("cmdErrorFlash"),e.offsetWidth,e.classList.add("cmdErrorFlash"),window.setTimeout(()=>e.classList.remove("cmdErrorFlash"),380))}};me.integrations=ri(me);me.sfx&&me.sfx.bind&&me.sfx.bind();(function(){return S(this,null,function*(){yield ht(),da(me,null,!0),er(me),Ar(me),Et(me),Mr(),Re(me),co(me),window.addEventListener("resize",()=>co(me)),window.addEventListener("resize",()=>{Re(me),bt(me)}),me.setStatus("ready"),window.__ESKREV_INDEX2_READY__=!0,br(),Ai(),Array.prototype.forEach.call(document.querySelectorAll(".ftab[data-cmd]"),function(o){o.addEventListener("click",()=>{let t=Do(),r=Ja(me,t,o.dataset.cmd);if(r&&r.classList&&r.classList.contains("slice")){let i=t||document.querySelector(".pageContent");i&&(i.appendChild(r),ja(r),i.focus(),r.scrollIntoView({behavior:"smooth",block:"nearest"}))}})});let a=document.getElementById("modosSidebarClose");a&&a.addEventListener("click",()=>{let o=document.getElementById("modosSidebar");o&&(o.classList.remove("is-open"),o.setAttribute("aria-hidden","true"))}),li(),pr(me),Nt(me),yi(me),Ei(),requestAnimationFrame(()=>{let o=document.getElementById("page1");o&&o.focus()});{let o=()=>{vr(),document.removeEventListener("keydown",o,!0),document.removeEventListener("input",o,!0)};document.addEventListener("keydown",o,!0),document.addEventListener("input",o,!0)}document.addEventListener("keydown",o=>{let t=String(o.key||"").toLowerCase(),r=(o.ctrlKey||o.metaKey)&&!o.shiftKey&&!o.altKey;if(r&&t==="s"){o.preventDefault(),o.stopPropagation(),me.setStatus&&me.setStatus("salvando\u2026"),ha().then(function(i){me.setStatus&&me.setStatus("salvo: "+i)});return}if(r&&t==="a"){let i=Do();if(!i)return;o.preventDefault(),o.stopPropagation(),i.focus();let n=document.createRange();n.selectNodeContents(i);let s=window.getSelection();if(!s)return;s.removeAllRanges(),s.addRange(n)}},!0)})})();})();
