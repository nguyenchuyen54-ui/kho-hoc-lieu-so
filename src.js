import { createClient } from '@supabase/supabase-js';import {grades,categories,filterPosts,safeFileName,validFile} from './logic.js';
// Điền URL và khóa publishable/anon của Supabase vào hai giá trị dưới đây khi sẵn sàng.
const url = import.meta.env.VITE_SUPABASE_URL?.trim() || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || '';
const configured=!!(url&&key&&!url.includes('YOUR_PROJECT'));const db=configured?createClient(url,key):null;
const demo=[{id:'demo1',title:'Kế hoạch chủ nhiệm tháng 10 lớp 1',description:'Kế hoạch chủ nhiệm tháng 10 lớp 1',grade:'Lớp 1',category:'Kế hoạch chủ nhiệm',image_url:'',file_path:null},{id:'demo2',title:'Kế hoạch chủ nhiệm tháng 9 - Năm học 2026–2027',description:'Tài liệu dành cho giáo viên tiểu học',grade:'Lớp 1',category:'Kế hoạch chủ nhiệm',image_url:'',file_path:null},{id:'demo3',title:'Kế hoạch chủ nhiệm năm học 2026–2027',description:'Mẫu kế hoạch chủ nhiệm năm học',grade:'Lớp 1',category:'Kế hoạch chủ nhiệm',image_url:'',file_path:null}];
let posts=[],user=null,isAdmin=false,selected=null,filters={q:'',grade:'',category:''},adminOpen=false;
const app=document.querySelector('#app');const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));const placeholder='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 420"><rect width="600" height="420" fill="#dcecf7"/><rect x="70" y="50" width="460" height="320" rx="18" fill="#fff"/><rect x="100" y="80" width="400" height="230" rx="12" fill="#c4e9d3"/><text x="300" y="175" text-anchor="middle" font-size="35" font-family="sans-serif" font-weight="bold" fill="#186e55">KHO HỌC LIỆU</text><text x="300" y="235" text-anchor="middle" font-size="25" font-family="sans-serif" fill="#297a60">GIÁO DỤC TIỂU HỌC</text><text x="300" y="290" text-anchor="middle" font-size="45">📚 ✏️ 🌼</text></svg>');
function menu(){return ['TRANG CHỦ',...grades.map(g=>g.toUpperCase()),'BÀI TẬP','SÁNG KIẾN','ĐỀ THI MA TRẬN','HỒ SƠ TỔ','TÀI LIỆU','LIÊN HỆ'].map(t=>`<button class="navbtn" data-nav="${esc(t)}">${esc(t)}</button>`).join('')}
function render(){const shown=filterPosts(posts,filters);app.innerHTML=`<header><div class="brand"><span class="brand-icon">📚</span><div><h1>KHO HỌC LIỆU SỐ</h1><small>Chia sẻ học liệu – Kết nối tri thức</small></div></div><button id="auth" class="login">${user?(isAdmin?'⚙ Quản trị':'Đăng xuất'):'🔐 Đăng nhập quản trị'}</button></header><nav>${menu()}</nav><main><div class="search"><input id="search" placeholder="Tìm tài liệu bạn quan tâm..." value="${esc(filters.q)}"/><button id="find">🔍</button></div>${!configured?'<p class="notice">Chế độ xem thử: hãy cấu hình Supabase để đăng bài và tải file thật.</p>':''}<div class="crumb">Trang chủ › ${esc(filters.grade||filters.category||'Tất cả tài liệu')}</div><div class="layout"><section><div class="sectionhead"><h2>${esc(filters.grade||filters.category||'Tài liệu mới nhất')}</h2><span>${shown.length} tài liệu</span></div><div class="cards">${shown.map(p=>`<article class="card" data-id="${esc(p.id)}"><img loading="lazy" src="${esc(p.image_url||placeholder)}" alt="Ảnh tài liệu"/><h3>${esc(p.title)}</h3><p>${esc(p.description||p.category)}</p><strong>Miễn phí</strong></article>`).join('')||'<div class="empty">Chưa có tài liệu phù hợp. Hãy thử từ khóa khác.</div>'}</div></section><aside>${categories.map(c=>`<button class="side ${filters.category===c?'active':''}" data-category="${esc(c)}">${esc(c)}</button>`).join('')}</aside></div></main><footer>© 2026 Kho học liệu số · Chia sẻ tài liệu giáo dục miễn phí</footer><div id="modal"></div>`;document.querySelector('#search').addEventListener('input',e=>{filters.q=e.target.value;updateResults()});document.querySelector('#find').onclick=updateResults;document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{let v=b.dataset.nav;filters={q:'',grade:grades.find(g=>g.toUpperCase()===v)||'',category:({'BÀI TẬP':'Bài tập','SÁNG KIẾN':'Sáng kiến','ĐỀ THI MA TRẬN':'Đề thi ma trận','HỒ SƠ TỔ':'Hồ sơ tổ','TÀI LIỆU':'Tài liệu khác'})[v]||''};if(v==='LIÊN HỆ'){showModal('<h2>Liên hệ</h2><p>Vui lòng liên hệ quản trị viên để được hỗ trợ.</p>');return}render()});document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{filters.category=b.dataset.category;filters.grade='';render()});document.querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>openPost(b.dataset.id));document.querySelector('#auth').onclick=()=>user?(isAdmin?openAdmin():logout()):openLogin()}
function updateResults(){const value=document.querySelector('#search')?.value||'';filters.q=value;render();document.querySelector('#search')?.focus()}
function showModal(html){document.querySelector('#modal').innerHTML=`<div class="overlay"><div class="dialog"><button class="close" id="close">✕</button>${html}</div></div>`;document.querySelector('#close').onclick=closeModal;document.querySelector('.overlay').addEventListener('click',e=>{if(e.target.classList.contains('overlay'))closeModal()})}function closeModal(){document.querySelector('#modal').innerHTML=''}
async function openPost(id){const p=posts.find(x=>String(x.id)===id);if(!p)return;selected=p;showModal(`<h2>${esc(p.title)}</h2><img class="detailimg" src="${esc(p.image_url||placeholder)}" alt="Ảnh bài đăng"/><p>${esc(p.description||'')}</p><p><b>Lớp:</b> ${esc(p.grade)} · <b>Danh mục:</b> ${esc(p.category)}</p><div class="actions"><button id="view" class="primary">👁 Xem tài liệu</button><button id="download">⬇ Tải tài liệu</button>${isAdmin?'<button id="edit">✎ Sửa</button><button id="delete" class="danger">Xóa</button>':''}</div><p id="msg"></p>`);document.querySelector('#view').onclick=()=>fileAction(p,false);document.querySelector('#download').onclick=()=>fileAction(p,true);if(isAdmin){document.querySelector('#edit').onclick=()=>openEditor(p);document.querySelector('#delete').onclick=()=>removePost(p)}}

async function fileAction(p, download) {
  const msg = document.querySelector('#msg');

  if (!db || !p.file_path) {
    msg.textContent = 'Tài liệu chưa có tệp đính kèm.';
    return;
  }

  const { data, error } = await db.storage
    .from('documents')
    .createSignedUrl(
      p.file_path,
      120,
      download ? { download: true } : {}
    );

  if (error) {
    msg.textContent = 'Không mở được tệp: ' + error.message;
    return;
  }

  const url = data.signedUrl;

  if (download) {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const ext = p.file_path.split('.').pop().toLowerCase();

  if (ext === 'docx') {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Không đọc được file');

      const buffer = await response.arrayBuffer();
      const mammoth = await import(
        'https://esm.sh/mammoth@1.11.0/mammoth.browser'
      );

      const result = await mammoth.convertToHtml({
        arrayBuffer: buffer
      });

      const purifier = await import(
        'https://esm.sh/dompurify@3.2.6'
      );

      const cleanHtml = purifier.default.sanitize(result.value);

      const viewer = document.createElement('div');
      viewer.style.cssText =
        'max-height:65vh;overflow:auto;padding:16px;' +
        'background:white;line-height:1.6';

      viewer.innerHTML = cleanHtml;

      const title = document.createElement('h2');
      title.textContent = p.title || 'Xem tài liệu Word';

      const container = document.createElement('div');
      container.append(title, viewer);

      const existingModal = document.querySelector('#modal');

      if (existingModal) {
        existingModal.replaceChildren(container);
      } else {
        const popup = window.open('', '_blank');
        if (!popup) throw new Error('Trình duyệt chặn cửa sổ');

        popup.document.title = title.textContent;
        popup.document.body.append(
          popup.document.importNode(container, true)
        );
      }
    } catch (err) {
      msg.textContent = 'Không xem được Word: ' + err.message;
    }
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
function openLogin(){if(!db){showModal('<h2>Chưa kết nối Supabase</h2><p>Hãy cấu hình thông tin dự án theo README.</p>');return}showModal('<h2>Đăng nhập quản trị</h2><form id="loginform"><label>Email</label><input type="email" name="email" required/><label>Mật khẩu</label><input type="password" name="password" required/><button class="primary">Đăng nhập</button><p id="msg"></p></form>');document.querySelector('#loginform').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const {error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});if(error)document.querySelector('#msg').textContent=error.message;else{closeModal();await refreshAuth();render();if(isAdmin)openAdmin();else alert('Tài khoản này không có quyền quản trị.')}}}
async function logout(){await db.auth.signOut();await refreshAuth();render()}

async function refreshAuth() {
  if (!db) return;

  const { data: { user: currentUser }, error: authError } =
    await db.auth.getUser();

  user = currentUser;
  isAdmin = false;

  if (authError || !user) return;

  const { data, error } = await db
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) {
    console.error('Lỗi kiểm tra quyền quản trị:', error);
    return;
  }

  isAdmin = !!data;
}

function openAdmin(){if(!isAdmin)return;showModal(`<h2>Quản trị học liệu</h2><p>Đã đăng nhập: ${esc(user.email)}</p><button id="new" class="primary">＋ Đăng bài mới</button> <button id="signout">Đăng xuất</button><p>Để sửa hoặc xóa, hãy mở một bài đăng trên trang chủ.</p>`);document.querySelector('#new').onclick=()=>openEditor();document.querySelector('#signout').onclick=async()=>{closeModal();await logout()}}
function openEditor(p=null){if(!isAdmin)return;showModal(`<h2>${p?'Chỉnh sửa':'Đăng'} tài liệu</h2><form id="editor"><label>Tiêu đề *</label><input name="title" required maxlength="180" value="${esc(p?.title||'')}"/><label>Mô tả</label><textarea name="description" rows="3">${esc(p?.description||'')}</textarea><label>Lớp</label><select name="grade">${grades.map(g=>`<option ${p?.grade===g?'selected':''}>${g}</option>`).join('')}</select><label>Danh mục</label><select name="category">${categories.map(c=>`<option ${p?.category===c?'selected':''}>${c}</option>`).join('')}</select><label>Ảnh đại diện (JPG, PNG, WEBP; tối đa 5 MB)</label><input type="file" name="image" accept="image/jpeg,image/png,image/webp"/><label>Tài liệu (PDF, Word, PPT, Excel, ảnh, MP4; tối đa 20 MB)</label><input type="file" name="document" ${p?'':'required'} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp,.mp4"/><button class="primary" id="save">${p?'Lưu thay đổi':'Đăng bài'}</button><p id="msg"></p></form>`);document.querySelector('#editor').onsubmit=e=>savePost(e,p)}
async function savePost(e,p){e.preventDefault();const form=e.target,f=new FormData(form),file=f.get('document'),img=f.get('image'),msg=document.querySelector('#msg'),button=document.querySelector('#save');if(file?.size&&!validFile(file)){msg.textContent='Tệp phải thuộc định dạng được hỗ trợ và không quá 20 MB.';return}if(img?.size&&(img.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(img.type))){msg.textContent='Ảnh phải là JPG, PNG hoặc WEBP và không quá 5 MB.';return}button.disabled=true;msg.textContent='Đang lưu, vui lòng chờ...';let filePath=p?.file_path||null,imagePath=p?.image_path||null,imageUrl=p?.image_url||null;let uploaded=[];try{if(file?.size){filePath=`${crypto.randomUUID()}/${safeFileName(file.name)}`;const r=await db.storage.from('documents').upload(filePath,file,{upsert:false});if(r.error)throw r.error;uploaded.push(['documents',filePath])}if(img?.size){imagePath=`${crypto.randomUUID()}/${safeFileName(img.name)}`;const r=await db.storage.from('covers').upload(imagePath,img,{upsert:false,contentType:img.type});if(r.error)throw r.error;uploaded.push(['covers',imagePath]);imageUrl=db.storage.from('covers').getPublicUrl(imagePath).data.publicUrl}const payload={title:String(f.get('title')).trim(),description:String(f.get('description')).trim(),grade:f.get('grade'),category:f.get('category'),file_path:filePath,image_path:imagePath,image_url:imageUrl};const result=p?await db.from('posts').update(payload).eq('id',p.id):await db.from('posts').insert(payload);if(result.error)throw result.error;closeModal();await loadPosts();render();if(p){if(file?.size&&p.file_path)await db.storage.from('documents').remove([p.file_path]);if(img?.size&&p.image_path)await db.storage.from('covers').remove([p.image_path])}}catch(err){msg.textContent='Không lưu được: '+err.message;for(const [bucket,path] of uploaded)await db.storage.from(bucket).remove([path])}finally{button.disabled=false}}
async function removePost(p){if(!confirm('Bạn có chắc muốn xóa bài này?'))return;const {error}=await db.from('posts').delete().eq('id',p.id);if(error){alert(error.message);return}if(p.file_path)await db.storage.from('documents').remove([p.file_path]);if(p.image_path)await db.storage.from('covers').remove([p.image_path]);closeModal();await loadPosts();render()}
async function loadPosts(){if(!db){posts=demo;return}const {data,error}=await db.from('posts').select('*').order('created_at',{ascending:false});if(error){posts=[];console.error(error);return}posts=data||[]}
async function init(){await refreshAuth();await loadPosts();render()}init();

