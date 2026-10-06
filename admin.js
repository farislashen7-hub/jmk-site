const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const AP='https://api.github.com',LP={};
let T=sessionStorage.getItem('jt')||'',R=localStorage.getItem('jr')||((location.hostname.endsWith('.github.io')&&location.pathname.split('/')[1])?location.hostname.split('.')[0]+'/'+location.pathname.split('/')[1]:''),D=null,SHA='';
const api=(p,o={})=>fetch(AP+'/repos/'+R+p,{...o,headers:{Authorization:'Bearer '+T,Accept:'application/vnd.github+json'}});
const b64e=s=>{let x='';new TextEncoder().encode(s).forEach(c=>x+=String.fromCharCode(c));return btoa(x)};
const b64d=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/\s/g,'')),c=>c.charCodeAt(0)));
const say=m=>{const e=$('ms');if(e)e.textContent=m};
async function login(t,r){T=t;R=r;if(!T||!/^[\w.-]+\/[\w.-]+$/.test(R))return say('اكتب التوكن واسم المخزن بالشكل owner/repo');
 try{const a=await api('');if(!a.ok){sessionStorage.removeItem('jt');return say('التوكن أو اسم المخزن غلط ('+a.status+')')}
 if(!(await a.json()).permissions?.push)return say('التوكن مالوش صلاحية كتابة (Contents: Read and write)');
 const f=await api('/contents/data.json');if(!f.ok)return say('مش لاقي data.json ('+f.status+')');const j=await f.json();SHA=j.sha;D=JSON.parse(b64d(j.content));
 sessionStorage.setItem('jt',T);localStorage.setItem('jr',R);ui()}catch(e){say('مشكلة اتصال بـ GitHub، جرّب VPN: '+e.message)}}
const out=()=>{sessionStorage.removeItem('jt');location.reload()};
const feat=(i,v)=>{D.products.forEach((p,j)=>p.featured=j===i?v:false);ui()};
const addP=f=>{if(f)D.products.forEach(p=>p.featured=false);D.products[f?'unshift':'push']({id:Date.now(),name:'',description:'',fl:'',specs:'',featured:f,price:0,offerPrice:null,images:[]});ui()};
async function shrink(f){try{const b=await createImageBitmap(f),k=Math.min(1,1400/Math.max(b.width,b.height));if(k===1&&f.size<8e5)return f;const c=document.createElement('canvas');c.width=Math.round(b.width*k);c.height=Math.round(b.height*k);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return await new Promise(r=>c.toBlob(x=>r(x||f),f.type==='image/png'?'image/png':'image/jpeg',.82))}catch{return f}}
const rd=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
async function up(i,files){for(const f0 of files){say('بيترفع…');const f=await shrink(f0),du=await rd(f),ext=f.type==='image/png'?'png':f.type==='image/webp'?'webp':'jpg',name='uploads/'+Date.now()+Math.random().toString(36).slice(2,7)+'.'+ext;
 const r=await api('/contents/'+name,{method:'PUT',body:JSON.stringify({message:'add image',content:du.split(',')[1]})});
 if(!r.ok){say('فشل رفع صورة ('+r.status+')');continue}LP[name]=du;D.products[i].images.push(name)}ui();say('✅ الصور اترفعت، اضغط حفظ')}
async function save(){say('بيتحفظ…');D.settings.whatsapp=String(D.settings.whatsapp||'').replace(/\D/g,'');D.products.forEach(p=>{p.price=+p.price||0});
 const r=await api('/contents/data.json',{method:'PUT',body:JSON.stringify({message:'update products',content:b64e(JSON.stringify(D,null,1)),sha:SHA})});
 if(r.status===409||r.status===422)return say('البيانات اتغيّرت من مكان تاني، حدّث الصفحة وادخل تاني');if(!r.ok)return say('فشل الحفظ ('+r.status+')');
 SHA=(await r.json()).content.sha;say('✅ اتحفظ. التغيير بيظهر على الموقع بعد دقيقة أو اتنين')}
const prod=(p,i)=>`<div class="ap"><label>الاسم<input value="${esc(p.name)}" oninput="D.products[${i}].name=this.value"></label><label>الوصف<textarea rows="2" oninput="D.products[${i}].description=this.value">${esc(p.description)}</textarea></label><label>النكهات (مفصولة بفاصلة)<input value="${esc(p.fl)}" oninput="D.products[${i}].fl=this.value"></label>
<div class="row"><label>السعر<input type="number" value="${+p.price}" oninput="D.products[${i}].price=+this.value"></label><label>سعر العرض (فاضي = مفيش عرض)<input type="number" value="${p.offerPrice??''}" oninput="D.products[${i}].offerPrice=this.value===''?null:+this.value"></label></div>
<label><input type="checkbox" style="width:auto;margin-inline-end:8px" ${p.featured?'checked':''} onchange="feat(${i},this.checked)">🔥 وصل حديثاً (صورته الأولى تبقى خلفية الموقع)</label>${p.featured?`<label>المواصفات (مثال: 7.5g:Citrulline Malate, 4g:Beta-Alanine)<input value="${esc(p.specs)}" oninput="D.products[${i}].specs=this.value"></label>`:''}
<label>الصور (تقدر تختار أكتر من واحدة)<input type="file" accept="image/png,image/jpeg,image/webp" multiple onchange="up(${i},this.files)"></label><div class="ims">${p.images.map((u,k)=>`<div><img src="${esc(LP[u]||u)}" alt=""><b onclick="D.products[${i}].images.splice(${k},1);ui()">×</b></div>`).join('')}</div>
<button class="d full" onclick="if(confirm('حذف؟')){D.products.splice(${i},1);ui()}">حذف المنتج</button></div>`;
function ui(){$('app').innerHTML=!D?`<div style="max-width:440px;margin:70px auto"><h2 style="color:#ff3347">JMK Admin</h2><label>اسم المخزن (owner/repo)<input id="rp" dir="ltr" value="${esc(R)}"></label><label>GitHub Token<input id="tk" type="password" dir="ltr" autocomplete="off"></label><button class="full" style="margin-top:12px" onclick="login($('tk').value.trim(),$('rp').value.trim())">دخول</button><p class="note" id="ms"></p></div>`
:`<div class="row" style="align-items:center;padding-top:20px"><h2 style="color:#ff3347">لوحة التحكم</h2><button class="s" style="flex:none" onclick="out()">خروج</button></div><div class="ap"><label>رقم واتساب استقبال الطلبات (بكود الدولة بدون +)<input inputmode="tel" value="${esc(D.settings.whatsapp)}" oninput="D.settings.whatsapp=this.value"></label></div>${D.products.map(prod).join('')}<div class="row" style="margin-top:14px;position:sticky;bottom:10px"><button class="s" onclick="addP(false)">+ منتج جديد</button><button class="s" onclick="addP(true)">+ وصل حديثاً 🔥</button><button onclick="save()">حفظ</button></div><p class="note" id="ms"></p>`}
ui();if(T&&R)login(T,R);
