export const grades=['Lớp 1','Lớp 2','Lớp 3','Lớp 4','Lớp 5'];
export const categories=['Giáo án tích hợp','Kế hoạch giáo dục','Bài giảng Toán','Bài giảng Tiếng Việt','Bài giảng Đạo đức','Bài giảng TNXH','Video AI','Giáo án & PPT AI','PPCT & Lịch báo giảng','Họp phụ huynh','Kế hoạch chủ nhiệm','Bài tập','Sáng kiến','Đề thi ma trận','Hồ sơ tổ','Tài liệu khác'];
export function filterPosts(posts,{q='',grade='',category=''}={}){const term=q.trim().toLocaleLowerCase('vi');return posts.filter(p=>(!grade||p.grade===grade)&&(!category||p.category===category)&&(!term||[p.title,p.description,p.category,p.grade].join(' ').toLocaleLowerCase('vi').includes(term)))}
export function safeFileName(name){return String(name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9._-]/g,'_').slice(-110)}
export function validFile(file){return !!file&&file.size<=20*1024*1024&&/\.(pdf|doc|docx|ppt|pptx|xls|xlsx|jpg|jpeg|png|webp|mp4)$/i.test(file.name)}
