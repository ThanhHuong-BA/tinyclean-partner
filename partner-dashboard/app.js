/* ---------- sample data (mock; replace with API) ---------- */
const NAMES=['Phùng Văn Tài','Ninh Thị Hoa','Âu Minh Tuấn','La Thị Thu','Giang Văn Sơn','Thái Ngọc Hân','Mạc Đức Thịnh','Lưu Thị Kim','Văn Quốc Việt','Hà Thanh Tâm','Khúc Thị Vân','Triệu Minh Hải','Nguyễn Thị Lan','Trần Văn Hùng','Lê Minh Châu','Phạm Thu Trang','Hoàng Đức Anh','Vũ Ngọc Mai','Đặng Quốc Bảo','Bùi Thanh Hà','Đỗ Hải Yến','Ngô Tuấn Kiệt','Dương Khánh Linh','Lý Gia Huy','Phan Mỹ Duyên','Trịnh Văn Nam','Mai Phương Thảo','Hồ Thị Ngọc','Tạ Minh Khoa','Cao Bảo Ngân','Lâm Hoài Phong','Chu Thị Hằng','Đinh Công Danh','Quách Tú Anh','Võ Thành Đạt','Kiều Diễm My','Lương Hữu Phước','Tô Thị Bích','Huỳnh Nhật Minh','Nghiêm Lan Chi'];
const ST={
  created:{label:'Chưa dùng thử',bg:'#F0F2F4',color:'#4E5860'},
  trial:{label:'Đang dùng thử',bg:'#FFF3DC',color:'#9A5B00'},
  paid:{label:'Đã mua gói',bg:'#DFF7EF',color:'#00744F'},
  cancelled:{label:'Hết hạn dùng thử',bg:'#FDE9E7',color:'#B23A2B'}
};
const PATTERN=['paid','trial','created','paid','paid','trial','created','cancelled','paid','trial','paid','created','paid','trial','created','paid','paid','created','trial','paid','cancelled','paid','created','trial','paid','created','paid','trial','paid','cancelled','paid','paid','cancelled','paid','paid','cancelled','paid','paid','cancelled','paid'];
const PLANS=[{name:'Gói 6 tháng',com:150000},{name:'Gói 1 năm',com:300000},{name:'Gói 3 năm',com:800000}];
const ADDRS=['12 Nguyễn Trãi, Q.1, TP.HCM','85 Cầu Giấy, Q. Cầu Giấy, Hà Nội','204 Lê Duẩn, Q. Hải Châu, Đà Nẵng','37 Phan Xích Long, Q. Phú Nhuận, TP.HCM','19 Trần Phú, TP. Nha Trang, Khánh Hòa','56 Hoàng Quốc Việt, Q. Cầu Giấy, Hà Nội','141 Võ Văn Tần, Q.3, TP.HCM'];
const TODAY=new Date(2026,9,22);          // fixed "today" used by the mock data
const CUR=202610, PREV=202609;            // current / previous settlement month (yyyymm)
const PER=10;
const DISCOUNT='5%';
const PW_OK=/^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const fmt=n=>n.toLocaleString('vi-VN')+'đ';
const dstr=d=>d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric'});
const mLabelOf=k=>String(k%100).padStart(2,'0')+'/'+Math.floor(k/100);
const payDateOf=k=>{const m=k%100,y=Math.floor(k/100);const nm=m===12?1:m+1,ny=m===12?y+1:y;return '05/'+String(nm).padStart(2,'0')+'/'+ny;};
const ALL_DATA=NAMES.map((n,idx)=>{
  const i=NAMES.length-1-idx,name=NAMES[i],s=PATTERN[i];
  const d=new Date(2026,9,22-Math.floor(i*2.8));
  const ph='09'+String((i*7919+12345)%100000000).padStart(8,'0');
  const plan=s==='paid'?PLANS[i%3]:null;
  let buy=null;
  if(s==='paid'){buy=new Date(d);buy.setDate(buy.getDate()+3+(i%9));if(buy>TODAY)buy=new Date(TODAY);}
  return {name,s,addr:ADDRS[i%ADDRS.length],phoneRaw:ph,created:d,date:dstr(d),plan,buy,buyDate:buy?dstr(buy):'—',
    mkey:buy?buy.getFullYear()*100+buy.getMonth()+1:null,com:s==='paid'?plan.com:0};
}).sort((a,b)=>b.created-a.created);

/* ---------- state ---------- */
const S={
  loggedIn:false,screen:'login',lang:'VN',
  phone:'0912345678',noCode:false,created:false,newUser:false,menuOpen:false,
  period:'cur',filter:'all',query:'',field:'phone',page:0,
  q1:'',field1:'phone',page1:0,dq:null,dq1:null,fieldOpen:false,fieldOpen1:false,
  copied:false,copiedTimer:null,
  rPhone:'',rOtp:'',rName:'',rEmail:'',rPw:'',showPw:false
};
const set=o=>{Object.assign(S,o);render();};
const mq=window.matchMedia('(max-width:639.98px)');
const isMobile=()=>mq.matches;

/* ---------- helpers ---------- */
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GRAD='linear-gradient(90deg,#00D4FF,#00C896)';
const GRAD135='linear-gradient(135deg,#00D4FF 0%,#00C8CA 50%,#00C896 100%)';
const CHEV='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B757D" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"></path></svg>';
const ARROW_DOWN='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M6 13l6 6 6-6"></path></svg>';
const PHONE_IC='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"></path></svg>';
const SEARCH_IC='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8A939A" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>';
const EYE='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
const EYE_OFF='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18"></path><path d="M10.58 10.58a2 2 0 002.83 2.83"></path><path d="M9.88 5.09A9.5 9.5 0 0112 5c5.5 0 9 5 9 7-.36.63-1.03 1.66-2.02 2.68M6.1 6.1C4.06 7.6 2.6 9.7 2 12c0 2 3.5 7 10 7 1.15 0 2.24-.15 3.24-.42"></path></svg>';

function genCode(){ // partner name (no accents, A-Z0-9) + last 4 phone digits; last 5 if already taken
  const name=S.newUser?S.rName:'Minh Anh Spa',ph=(S.phone||'').replace(/\D/g,'');
  const base=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').replace(/[^A-Za-z0-9]/g,'').toUpperCase()||'TINY';
  const taken=['MINHANHSPA0009','NGUYENVANAN5678'];
  let c=base+ph.slice(-4);if(taken.includes(c))c=base+ph.slice(-5);
  return c;
}
const myCode=()=>S.created?genCode():'MINHANH25';
const userName=()=>S.newUser?(S.rName.trim()||'Đối tác'):'Minh Anh Spa';
const initials=()=>S.newUser?(S.rName.trim().split(/\s+/).slice(-2).map(w=>w[0]).join('').toUpperCase()||'ĐT'):'MA';

function langToggle(pad,btnPad,fs){
  const b=(l)=>{const a=S.lang===l;return `<button data-act="lang" data-v="${l}" style="border:0;cursor:pointer;padding:${btnPad};border-radius:999px;font:600 ${fs} 'Be Vietnam Pro';background:${a?GRAD:'transparent'};color:${a?'#fff':'#5B6470'}">${l}</button>`;};
  return `<div style="display:flex;background:#EEF1F3;border-radius:999px;padding:${pad}">${b('EN')}${b('VN')}</div>`;
}

/* ---------- header ---------- */
function header(){
  const m=isMobile(),li=S.loggedIn;
  const left=`<div style="display:flex;align-items:center;gap:${m?'8px':'10px'}">
    <img src="assets/tinyclean-logo.png" alt="TinyClean" style="width:${m?34:42}px;height:${m?34:42}px;object-fit:contain;transform:scale(1.35)">
    <span style="font-weight:700;font-size:${m?18:21}px;color:#00B8A9">TinyClean</span>
    ${li?`<span style="margin-left:${m?0:6}px;padding:${m?'2px 8px':'3px 10px'};border-radius:999px;background:#E6FAF7;color:#00877C;font-size:${m?11:12}px;font-weight:600">Đối tác</span>`:''}
  </div>`;
  let right='';
  if(m){
    if(li) right+=`<button data-act="menu" aria-label="Tài khoản" style="width:44px;height:44px;border:0;background:none;padding:0;display:flex;align-items:center;justify-content:center;cursor:pointer"><span style="width:34px;height:34px;border-radius:50%;background:#E6FAF7;color:#00877C;font:700 13px 'Be Vietnam Pro';display:flex;align-items:center;justify-content:center;box-shadow:${S.menuOpen?'0 0 0 2px #00C2B2':'none'}">${esc(initials())}</span></button>`;
    else right+=langToggle('2px','5px 11px','12px');
    if(S.menuOpen&&li) right+=`<div data-act="menu-close" style="position:fixed;inset:0;z-index:1"></div>
      <div style="position:absolute;top:calc(100% + 4px);right:12px;width:240px;background:#fff;border:1px solid #E5E9EC;border-radius:12px;box-shadow:0 10px 28px rgba(16,24,32,.14);padding:6px;display:flex;flex-direction:column;z-index:2">
        <div style="padding:10px 12px;display:flex;flex-direction:column;border-bottom:1px solid #EEF1F3"><span style="font-weight:600;font-size:15px">${esc(userName())}</span><span style="font-size:12px;color:#6B757D">Đối tác</span></div>
        <div style="padding:10px 12px;display:flex;align-items:center;justify-content:space-between;font-size:14px"><span>Ngôn ngữ</span>${langToggle('2px','4px 10px','12px')}</div>
        <button data-act="logout" style="border:0;border-top:1px solid #EEF1F3;background:none;text-align:left;padding:12px;font:600 14px 'Be Vietnam Pro';color:#C0392B;cursor:pointer">Đăng xuất</button>
      </div>`;
  }else{
    right=`<div style="display:flex;align-items:center;gap:16px">${langToggle('3px','6px 14px','14px')}
      ${li?`<div style="display:flex;align-items:center;gap:10px"><div style="width:34px;height:34px;border-radius:50%;background:#E6FAF7;color:#00877C;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center">${esc(initials())}</div>
        <div style="display:flex;flex-direction:column;line-height:1.25"><span style="font-size:14px;font-weight:600">${esc(userName())}</span>
        <button data-act="logout" class="h-red" style="border:0;background:none;padding:0;text-align:left;cursor:pointer;color:#6B757D;font:500 12px 'Be Vietnam Pro'">Đăng xuất</button></div></div>`:''}
    </div>`;
  }
  return `<header style="background:#fff;border-bottom:1px solid #E8ECEF;position:sticky;top:0;z-index:5">
    <div style="max-width:1200px;margin:0 auto;padding:${m?'10px 12px 10px 16px':'14px 24px'};display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative">${left}${right}</div></header>`;
}

/* ---------- screens ---------- */
function loginScreen(){
  return `<main style="flex:1;display:flex;align-items:center;justify-content:center;padding:48px 20px;background:#fff">
  <div style="width:100%;max-width:420px;border:1px solid #E5E9EC;border-radius:16px;padding:44px 36px;display:flex;flex-direction:column;align-items:center;gap:14px">
    <img src="assets/tinyclean-logo.png" alt="TinyClean" style="width:72px;height:72px;object-fit:contain;transform:scale(1.35)">
    <h1 style="margin:8px 0 0;font-size:24px;font-weight:600;text-align:center">Cổng đối tác TinyClean</h1>
    <p style="margin:0 0 10px;color:#5B6470;font-size:15px;text-align:center">Đăng nhập để theo dõi khách hàng bạn giới thiệu và hoa hồng</p>
    <input id="in-phone" data-in="phone" class="fc" placeholder="Số điện thoại / mã đối tác" value="${esc(S.phone)}" style="width:100%;padding:14px 16px;border:1px solid #DDE2E6;border-radius:9px;font:15px 'Be Vietnam Pro';outline:none">
    <input type="password" class="fc" placeholder="Mật khẩu" value="password" style="width:100%;padding:14px 16px;border:1px solid #DDE2E6;border-radius:9px;font:15px 'Be Vietnam Pro';outline:none">
    <div style="width:100%;display:flex;justify-content:flex-end;margin-top:-4px"><a href="#" data-act="go-forgot" style="font-size:14px;font-weight:500">Quên mật khẩu?</a></div>
    <button data-act="login" class="h-dim" style="width:100%;margin-top:2px;padding:14px;border:0;border-radius:9px;background:${GRAD};color:#fff;font:600 15px 'Be Vietnam Pro';cursor:pointer">Đăng nhập</button>
    <span style="font-size:14px;color:#5B6470;margin-top:8px">Chưa có tài khoản? <button data-act="go-reg" class="h-link" style="border:0;background:none;padding:0;cursor:pointer;font:600 14px 'Be Vietnam Pro';color:#00A99D">Đăng ký tài khoản</button></span>
  </div></main>`;
}

const regOk=()=>({reg1:S.rPhone.length>=9,reg2:S.rOtp.length===6,reg3:PW_OK.test(S.rPw),reg4:!!S.rName.trim(),fp1:S.rPhone.length>=9,fp2:S.rOtp.length===6,fp3:PW_OK.test(S.rPw)}[S.screen]);
function rfield(id,key,label,o={}){
  const type=o.pw&&!S.showPw?'password':(o.type||'text');
  return `<div class="rf ${label==='SĐT'?'nols':''}" style="margin-bottom:${o.mb||'28px'}">
    <input id="${id}" data-in="${key}" type="${type}" inputmode="${o.mode||'text'}" placeholder=" " value="${esc(S[key]||'')}" class="${o.big?'big':''} ${o.pw?'pw':''}" ${o.max?`maxlength="${o.max}"`:''} autocomplete="off">
    <label>${label}</label>
    ${o.pw?`<button class="eye" data-act="toggle-pw" aria-label="Hiện mật khẩu">${S.showPw?EYE_OFF:EYE}</button>`:''}
  </div>`;
}
function regScreen(){
  const sc=S.screen,ok=regOk();
  let body='';
  if(sc==='reg1') body+=`<h1 style="margin:0 0 28px;text-align:center;font-size:20px;font-weight:700;color:#111827">Đăng ký tài khoản</h1>`;
  const heading={reg2:'Nhập mã xác nhận',reg3:'Thiết lập mật khẩu',fp1:'Quên mật khẩu',fp2:'Nhập mã xác nhận',fp3:'Đặt lại mật khẩu'}[sc];
  if(heading) body+=`<div style="display:flex;align-items:center;gap:16px;margin-bottom:28px"><button data-act="reg-back" aria-label="Quay lại" style="border:0;background:none;padding:0;cursor:pointer;font-size:20px;color:#374151;line-height:1">←</button><div style="font-size:17px;font-weight:700;color:#111827">${heading}</div></div>`;
  if(sc==='fp1') body+=`<div style="display:flex;justify-content:center;margin-bottom:24px"><img src="assets/ic-forgot-password.svg" alt="Quên mật khẩu" style="width:60px;height:104px"></div>
    <p style="margin:0 0 24px;text-align:center;font-size:15px;line-height:1.6;color:#4b5563">Nhập số điện thoại đã đăng ký để nhận mã xác nhận đặt lại mật khẩu.</p>`;
  if(sc==='reg2'||sc==='fp2') body+=`<div style="display:flex;justify-content:center;margin-bottom:24px"><img src="assets/ic-sms.svg" alt="SMS" style="width:60px;height:104px"></div>
    <p style="margin:0 0 28px;text-align:center;font-size:15px;line-height:1.6;color:#4b5563">Mã xác nhận đã được gửi đến số điện thoại <strong style="color:#111827">${esc(S.rPhone)}</strong></p>`;
  if(sc==='reg3'||sc==='fp3') body+=`<div style="display:flex;justify-content:center;margin-bottom:24px"><img src="assets/ic-password.svg" alt="Mật khẩu" style="width:100px;height:104px"></div>
    <p style="margin:0 0 24px;text-align:center;font-size:16px;${sc==='fp3'?'line-height:1.6;':''}color:#111827">${sc==='fp3'?`Nhập mật khẩu mới cho tài khoản <strong>${esc(S.rPhone)}</strong>`:'Vui lòng nhập mật khẩu để tiếp tục'}</p>`;
  if(sc==='reg4') body+=`<div style="display:flex;justify-content:center;margin-bottom:16px"><img src="assets/ic-success.svg" alt="Thành công" style="width:64px;height:64px"></div>
    <p style="margin:0 0 28px;text-align:center;font-size:15px;line-height:1.6;color:#4b5563">Chúc mừng bạn đã đăng ký tài khoản thành công! Thêm một vài thông tin nhỏ nữa để hoàn tất nhé.</p>
    <div style="font-size:16px;font-weight:700;color:#111827;margin-bottom:18px">Thông tin cá nhân</div>`;
  if(sc==='reg1'||sc==='fp1') body+=rfield('in-rPhone','rPhone','SĐT',{type:'tel',mode:'numeric',big:1});
  if(sc==='reg2'||sc==='fp2') body+=rfield('in-rOtp','rOtp','MÃ XÁC NHẬN',{mode:'numeric',big:1,max:6});
  if(sc==='reg3'||sc==='fp3') body+=rfield('in-rPw','rPw',sc==='fp3'?'MẬT KHẨU MỚI *':'MẬT KHẨU *',{pw:1,big:1,mb:'12px'})+
    `<div style="font-size:12px;color:#00C8CA;margin:-4px 0 28px;height:16px;line-height:16px;visibility:${PW_OK.test(S.rPw)?'hidden':'visible'}">*Mật khẩu tối thiểu 8 ký tự bao gồm cả chữ và số</div>`;
  if(sc==='reg4') body+=rfield('in-rName','rName','HỌ VÀ TÊN (BẮT BUỘC)',{mb:'22px'})+rfield('in-rEmail','rEmail','EMAIL (KHÔNG BẮT BUỘC)',{type:'email',mb:'26px'});
  body+=`<button data-act="reg-next" style="width:100%;border:0;border-radius:999px;padding:15px 0;font:700 16px 'Be Vietnam Pro';color:#fff;cursor:${ok?'pointer':'not-allowed'};background:${ok?GRAD135:'#d1d5db'}">${sc==='reg4'?'Vào trang đối tác TinyClean ngay':sc==='fp3'?'Xác nhận':'Tiếp tục'}</button>`;
  if(sc==='reg2'||sc==='fp2') body+=`<div style="text-align:center;font-size:13px;font-weight:600;letter-spacing:.03em;color:#00A0A0;margin-top:18px;cursor:pointer">NHẤN ĐỂ GỬI LẠI</div>`;
  if(sc==='reg1') body+=`<div style="font-size:13px;line-height:1.6;color:#9ca3af;margin-top:18px">*Bằng việc đăng ký tài khoản, bạn xác nhận đồng ý với <a href="https://tinyuse.ai/tinyclean/privacy" target="_blank" rel="noopener noreferrer" style="color:#00CBCA;text-decoration:underline">điều khoản &amp; điều kiện</a> mà TinyClean quy định.</div>
    <div style="font-size:14px;color:#5B6470;margin-top:16px;text-align:center">Đã có tài khoản? <button data-act="go-login" class="h-link" style="border:0;background:none;padding:0;cursor:pointer;font:600 14px 'Be Vietnam Pro';color:#00A99D">Đăng nhập</button></div>`;
  return `<main style="flex:1;display:flex;align-items:center;justify-content:center;padding:32px 20px;background:#f4faf9"><div style="width:100%;max-width:440px">
    <div style="display:flex;flex-direction:column;align-items:center;margin-bottom:28px">
      <img src="assets/tinyclean-logo.png" alt="TinyClean" style="width:72px;height:72px;object-fit:contain;transform:scale(1.35);margin-bottom:8px">
      <div style="font-size:26px;font-weight:800;letter-spacing:-.5px;background:linear-gradient(135deg,#00D4FF 0%,#00C8CA 50%,#00C896 100%);-webkit-background-clip:text;background-clip:text;color:transparent">TinyClean</div></div>
    <div style="background:#fff;border-radius:20px;box-shadow:0 2px 24px rgba(15,60,55,.08);padding:32px 28px">${body}</div></div></main>`;
}

function noCodeScreen(){
  return `<main style="flex:1;display:flex;align-items:center;justify-content:center;padding:48px 20px;background:#F7F9FA"><div style="width:100%;max-width:460px;background:#fff;border:1px solid #E5E9EC;border-radius:16px;padding:40px 32px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
    <div style="width:64px;height:64px;border-radius:50%;background:#E6FAF7;color:#00877C;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700">%</div>
    <h1 style="margin:4px 0 0;font-size:22px;font-weight:600">Bạn chưa có mã giới thiệu</h1>
    <p style="margin:0 0 8px;color:#5B6470;font-size:15px">Tạo mã giới thiệu để bắt đầu nhận hoa hồng khi khách mua gói TinyClean.</p>
    <button data-act="create-code" class="h-dim" style="width:100%;padding:14px;border:0;border-radius:9px;background:${GRAD};color:#fff;font:600 15px 'Be Vietnam Pro';cursor:pointer">Tạo mã giới thiệu ngay</button></div></main>`;
}
const copyBtnStyle=(pad)=>`border:0;cursor:pointer;padding:${pad};border-radius:8px;background:#E6FAF7;color:#00877C;font:600 13px 'Be Vietnam Pro';white-space:nowrap`;
const copyLabel=()=>'Sao chép';
const toastHtml=()=>S.copied?`<div style="position:fixed;left:50%;bottom:32px;transform:translateX(-50%);z-index:50;background:#1A2228;color:#fff;padding:12px 20px;border-radius:10px;font:500 14px 'Be Vietnam Pro';box-shadow:0 8px 24px rgba(16,24,32,.25);display:flex;align-items:center;gap:8px;max-width:calc(100vw - 32px)"><span style="color:#00C896;font-weight:700">✓</span>Đã sao chép mã thành công</div>`:'';
function createdScreen(){
  return `<main style="flex:1;display:flex;align-items:center;justify-content:center;padding:48px 20px;background:#F7F9FA"><div style="width:100%;max-width:460px;background:#fff;border:1px solid #E5E9EC;border-radius:16px;padding:40px 32px;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center">
    <img src="assets/ic-success.svg" alt="Thành công" style="width:64px;height:64px">
    <h1 style="margin:4px 0 0;font-size:22px;font-weight:600">Chúc mừng bạn!</h1>
    <p style="margin:0 0 8px;color:#5B6470;font-size:15px">Bạn đã trở thành đối tác giới thiệu của TinyClean. Chia sẻ mã bên dưới để khách hàng được giảm giá và bạn nhận hoa hồng.</p>
    <div style="display:flex;align-items:stretch;width:100%;background:#fff;border:1.5px dashed #C9D1D6;border-radius:12px;text-align:left">
      <div style="flex:1;padding:12px 14px;display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:12px;color:#6B757D">Mã giới thiệu của bạn</span><span style="font-size:24px;font-weight:700;letter-spacing:.06em;color:#00877C;line-height:1.2">${myCode()}</span><span style="font-size:12px;font-weight:600;color:#00877C;white-space:nowrap">Khách được giảm ${DISCOUNT}</span></div>
      <div style="display:flex;align-items:center;padding:0 12px;border-left:1.5px dashed #C9D1D6"><button data-act="copy-code" style="${copyBtnStyle('8px 12px')}">${copyLabel()}</button></div>
    </div>
    <button data-act="go-report" class="h-dim" style="width:100%;margin-top:8px;padding:14px;border:0;border-radius:9px;background:${GRAD};color:#fff;font:600 15px 'Be Vietnam Pro';cursor:pointer">Đến trang báo cáo ngay</button></div></main>`;
}

/* ---------- report ---------- */
function codeCard(extra){
  return `<div style="display:flex;align-items:stretch;max-width:100%;background:#fff;border:1.5px dashed #C9D1D6;border-radius:12px;${extra}">
    <div style="flex:1;padding:10px 12px 10px 14px;display:flex;flex-direction:column;gap:2px;min-width:0"><span style="font-size:12px;color:#6B757D">Mã giới thiệu</span><span style="font-size:20px;font-weight:700;letter-spacing:.06em;color:#00877C;line-height:1.2">${myCode()}</span><span style="font-size:12px;font-weight:600;color:#00877C;white-space:nowrap">Khách được giảm ${DISCOUNT}</span></div>
    <div style="display:flex;align-items:center;padding:0 10px;border-left:1.5px dashed #C9D1D6"><button data-act="copy-code" style="${copyBtnStyle('8px 10px')}">${copyLabel()}</button></div></div>`;
}
function phoneCell(d,m){
  const call=m?`href="tel:${d.phoneRaw}"`:'';
  return `<div style="display:flex;align-items:center;gap:8px;white-space:nowrap"><span>${d.phoneRaw}</span><a ${call} title="Gọi" aria-label="Gọi" class="h-call" style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;background:#F2F4F6;color:#5B6470;border-radius:50%;cursor:pointer;flex:none;text-decoration:none">${PHONE_IC}</a></div>`;
}
function searchBox(sfx,field,query,open){
  const draft=sfx?S.dq1:S.dq,shown=draft!==null?draft:query;
  const label={name:'Tên',phone:'SĐT'}[field],ph={name:'Nhập tên khách hàng',phone:'Nhập số điện thoại'}[field];
  const opts=[['phone','SĐT'],['name','Tên']].map(([k,l])=>{const a=field===k;return `<button data-act="field${sfx}" data-v="${k}" class="h-opt" style="display:flex;align-items:center;justify-content:space-between;gap:12px;border:0;background:${a?'#E6FAF7':'transparent'};padding:9px 12px;border-radius:7px;font:500 14px 'Be Vietnam Pro';color:${a?'#00877C':'#1A2228'};cursor:pointer;text-align:left">${l}<span style="color:#00A99D;font-weight:700">${a?'✓':''}</span></button>`;}).join('');
  return `<div class="fw" data-dd style="display:flex;align-items:center;height:40px;border:1px solid #DDE2E6;border-radius:10px;background:#fff;max-width:100%;position:relative">
    <button data-act="toggle-field${sfx}" style="height:100%;display:flex;align-items:center;gap:6px;border:0;background:none;padding:0 10px 0 14px;font:500 14px 'Be Vietnam Pro';color:#1A2228;cursor:pointer;white-space:nowrap">${label}${CHEV}</button>
    <span style="width:1px;height:20px;background:#E5E9EC"></span>
    <div style="display:flex;align-items:center;gap:8px;padding:0 14px 0 12px;height:100%">
      <button data-act="submit${sfx}" aria-label="Tìm kiếm" style="flex:none;border:0;padding:0;background:transparent;display:flex;cursor:pointer">${SEARCH_IC}</button>
      <input id="in-search${sfx}" data-in="search${sfx}" placeholder="${ph}" value="${esc(shown)}" style="width:200px;max-width:100%;flex:1;min-width:0;border:0;padding:0;font:14px 'Be Vietnam Pro';outline:none;background:transparent">
      <button data-act="clear-search${sfx}" aria-label="Xóa từ khóa" class="h-x" style="flex:none;width:18px;height:18px;padding:0;border:0;border-radius:50%;background:#C5CCD2;display:flex;align-items:center;justify-content:center;cursor:pointer;visibility:${shown?'visible':'hidden'}"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"></path></svg></button></div>
    ${open?`<div style="position:absolute;top:calc(100% + 6px);left:0;min-width:170px;background:#fff;border:1px solid #E5E9EC;border-radius:10px;box-shadow:0 8px 24px rgba(16,24,32,.10);padding:4px;z-index:10;display:flex;flex-direction:column">${opts}</div>`:''}</div>`;
}
const pager=(label,sfx)=>`<div style="padding:14px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-top:1px solid #EEF1F3;font-size:13px;color:#6B757D"><span>${label}</span><div style="display:flex;gap:8px">
  ${['prev','next'].map(a=>`<button data-act="${a}${sfx}" class="h-pg" style="border:1px solid #DDE2E6;background:#fff;padding:7px 14px;border-radius:8px;cursor:pointer;font:500 13px 'Be Vietnam Pro';color:#3A444C">${a==='prev'?'Trước':'Sau'}</button>`).join('')}</div></div>`;

function reportScreen(){
  const m=isMobile(),DATA=S.created?[]:ALL_DATA,per=S.period;
  const inP=k=>per==='all'||k===(per==='cur'?CUR:PREV);
  const pLabel={all:'toàn thời gian',cur:'tháng này ('+mLabelOf(CUR)+')',prev:'tháng trước ('+mLabelOf(PREV)+')'}[per];
  /* section 2: new sign-ups (by account-created month) */
  const base=DATA.filter(d=>inP(d.created.getFullYear()*100+d.created.getMonth()+1));
  const counts={all:base.length};Object.keys(ST).forEach(k=>counts[k]=base.filter(d=>d.s===k).length);
  const q=S.query.trim().toLowerCase();
  const list=base.filter(d=>(S.filter==='all'||d.s===S.filter)&&(!q||(S.field!=='phone'&&d.name.toLowerCase().includes(q))||(S.field!=='name'&&d.phoneRaw.includes(q.replace(/\s/g,'')))));
  const pages=Math.max(1,Math.ceil(list.length/PER)),page=Math.min(S.page,pages-1);
  S.page=page;
  /* section 1: purchases (by purchase month) */
  const mList=DATA.filter(d=>d.mkey&&inP(d.mkey)).sort((a,b)=>b.buy-a.buy);
  const q1=S.q1.trim().toLowerCase();
  const mShown=mList.filter(d=>!q1||(S.field1!=='phone'&&d.name.toLowerCase().includes(q1))||(S.field1!=='name'&&d.phoneRaw.includes(q1.replace(/\s/g,''))));
  const pages1=Math.max(1,Math.ceil(mShown.length/PER)),pg1=Math.min(S.page1,pages1-1);
  S.page1=pg1;
  const mSum=mList.reduce((a,d)=>a+d.com,0);
  const pend=mList.filter(d=>d.mkey===CUR).reduce((a,d)=>a+d.com,0);
  const isCur=per!=='prev'; // 'cur' (and 'all' for pay-date logic below)
  const mix=PLANS.map(pl=>[pl.name,mList.filter(d=>d.plan===pl).length]).filter(x=>x[1]).map(x=>x[1]+' '+x[0].toLowerCase()).join(' · ');
  const statusText=mSum===0?'Chưa phát sinh hoa hồng':per==='all'?(pend?'Đã thanh toán '+fmt(mSum-pend)+'\nChưa thanh toán '+fmt(pend):'Đã thanh toán toàn bộ'):per==='cur'?'Thanh toán ngày '+payDateOf(CUR).replace(/^0/,''):'Thanh toán ngày '+payDateOf(PREV).replace(/^0/,'');
  const newMix=counts.all?counts.paid+' đã mua gói · '+counts.trial+' đang dùng thử':'Chưa có khách đăng ký mới';
  /* referral-code card width: match one summary card (grid is auto-fit, min 240, gap 16) */
  const w=document.getElementById('app').getBoundingClientRect().width||window.innerWidth;
  const cw=Math.min(w,1200)-48,cc=Math.min(3,Math.max(1,Math.floor((cw+16)/256)));
  const refW='calc((100% - '+16*(cc-1)+'px)/'+cc+')';

  const months=[['all','Toàn thời gian'],['cur','Tháng này'],['prev','Tháng trước']].map(([k,l])=>{const a=k===per;return `<button data-act="period" data-v="${k}" style="border:1px solid ${a?'#1A2228':'#DDE2E6'};background:${a?'#1A2228':'#fff'};color:${a?'#fff':'#3A444C'};padding:${m?'8px 10px':'8px 16px'};white-space:nowrap;border-radius:999px;cursor:pointer;font:600 14px 'Be Vietnam Pro'">${l}</button>`;}).join('');
  const tabDefs=[['all','Tất cả'],['paid','Đã mua gói'],['trial','Đang dùng thử'],['created','Chưa dùng thử'],['cancelled','Hết hạn dùng thử']];
  const tabs=tabDefs.map(([k,l])=>{const a=S.filter===k;return `<button data-act="tab" data-v="${k}" style="border:1px solid ${a?'#00B8A9':'#DDE2E6'};background:${a?'#00B8A9':'#fff'};color:${a?'#fff':'#3A444C'};padding:7px 14px;border-radius:999px;cursor:pointer;font:600 13px 'Be Vietnam Pro';display:flex;gap:6px;align-items:center">${l}<span style="opacity:.7">${counts[k]}</span></button>`;}).join('');
  const detailBtn=(act,light)=>`<button data-act="${act}" class="${light?'h-white':'h-dark'}" style="align-self:flex-start;margin-top:8px;display:flex;align-items:center;gap:6px;border:${light?'0':'1px solid #1A2228'};cursor:pointer;padding:${light?'8px 14px':'7px 14px'};border-radius:8px;font:600 13px 'Be Vietnam Pro';background:${light?'#fff':'#1A2228'};color:${light?'#00877C':'#fff'}">Xem chi tiết${ARROW_DOWN}</button>`;
  const pill='align-self:flex-start;background:#E6FAF7;color:#00877C;padding:6px 12px;border-radius:999px;font-size:13px;font-weight:600;margin-top:4px';

  const rows1=mShown.slice(pg1*PER,pg1*PER+PER).map(d=>`<tr style="border-top:1px solid #EEF1F3">
    <td style="padding:14px 20px;font-weight:600;color:#1A2228">${esc(d.name)}</td><td>${phoneCell(d,m)}</td><td>${d.buyDate}</td><td>${d.plan.name}</td>
    <td style="padding:14px 20px;text-align:right;font-weight:600;color:#00875F">+${fmt(d.com)}</td></tr>`).join('');
  const rows2=list.slice(page*PER,page*PER+PER).map(d=>{const st=ST[d.s];return `<tr style="border-top:1px solid #EEF1F3">
    <td style="padding:14px 20px;font-weight:600;color:#1A2228">${esc(d.name)}</td><td>${phoneCell(d,m)}</td><td style="line-height:1.4">${esc(d.addr)}</td><td>${d.date}</td>
    <td><span style="padding:4px 10px;border-radius:999px;font-size:12px;font-weight:600;white-space:nowrap;background:${st.bg};color:${st.color}">${st.label}</span></td>
    <td>${d.plan?d.plan.name:'—'}</td><td style="padding:14px 20px;text-align:right">${d.buyDate}</td></tr>`;}).join('');
  const range1=mShown.length?`Hiển thị ${pg1*PER+1}–${Math.min(mShown.length,pg1*PER+PER)} trong ${mShown.length} khách hàng`:'0 khách hàng';
  const range2=list.length?`Hiển thị ${page*PER+1}–${Math.min(list.length,page*PER+PER)} trong ${list.length} khách hàng`:'0 khách hàng';
  const empty1=mShown.length===0?`<div style="padding:32px;text-align:center;color:#6B757D;font-size:14px">${mList.length?'Không tìm thấy khách hàng phù hợp':'Chưa có khách hàng mua gói trong khoảng thời gian này'}</div>`:'';
  const empty2=list.length===0?`<div style="padding:40px;text-align:center;color:#6B757D;font-size:14px">${base.length?'Không tìm thấy khách hàng phù hợp':'Chưa có khách hàng đăng ký mới trong khoảng thời gian này'}</div>`:'';
  const hd=(t,css)=>`<th style="${css||''}">${t}</th>`;

  return `<main style="flex:1;width:100%;max-width:1200px;margin:0 auto;padding:32px 24px 64px;display:flex;flex-direction:column;gap:24px">
    <div style="display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:16px">
      <div style="display:flex;flex-direction:column;gap:4px;flex:1 1 100%;min-width:0">
        <h1 style="margin:0;font-size:26px;font-weight:700">Báo cáo cho đối tác</h1>
        ${m?codeCard('margin-top:8px;align-self:stretch;width:100%'):''}
      </div></div>
    <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px 16px">
      <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px"><span style="font-size:14px;font-weight:600;color:#3A444C;margin-right:4px">Xem theo</span>${months}</div>
      ${m?'':codeCard(`margin-left:auto;flex:none;width:${refW}`)}
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px">
      <div style="border-radius:14px;padding:22px 24px;background:linear-gradient(120deg,#00C4E8,#00BF8F);color:#fff;display:flex;flex-direction:column;gap:6px">
        <span style="font-size:14px;font-weight:500">Hoa hồng ${pLabel}</span>
        <span style="font-size:32px;font-weight:700;letter-spacing:-.01em">${fmt(mSum)}</span>
        <span style="align-self:flex-start;background:rgba(255,255,255,.22);padding:6px 12px;font-size:13px;font-weight:600;margin-top:4px;white-space:pre-line;border-radius:16px">${statusText}</span>
        ${detailBtn('go-sec1',true)}</div>
      <div style="border-radius:14px;padding:22px 24px;background:#fff;border:1px solid #E5E9EC;display:flex;flex-direction:column;gap:6px">
        <span style="font-size:14px;font-weight:500;color:#5B6470">Số gói khách mua</span><span style="font-size:32px;font-weight:700">${mList.length}</span>
        <span style="${pill}">${mix||'Chưa có khách mua gói'}</span>${detailBtn('go-sec1',false)}</div>
      <div style="border-radius:14px;padding:22px 24px;background:#fff;border:1px solid #E5E9EC;display:flex;flex-direction:column;gap:6px">
        <span style="font-size:14px;font-weight:500;color:#5B6470">Số khách đăng ký mới</span><span style="font-size:32px;font-weight:700">${counts.all}</span>
        <span style="${pill}">${newMix}</span>${detailBtn('go-sec2',false)}</div>
    </div>

    <section id="sec1" style="background:#fff;border:1px solid #E5E9EC;border-radius:14px;overflow:hidden">
      <div style="padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #EEF1F3">
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-start"><h2 style="margin:0;font-size:18px;font-weight:600">1. Gói khách đã mua ${pLabel}</h2>
          <a href="#" data-act="noop" class="h-ul" style="font-size:14px;font-weight:600;color:#00877C;text-decoration:none;display:flex;align-items:center;gap:4px">Xem mức hoa hồng theo gói<span>→</span></a></div>
        ${searchBox('1',S.field1,S.q1,S.fieldOpen1)}</div>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;min-width:680px;font-size:14px"><thead><tr style="background:#FAFBFC;color:#6B757D;text-align:left">
        ${hd('Tên khách hàng','padding-left:20px')}${hd('Số điện thoại')}${hd('Ngày mua gói')}${hd('Gói')}${hd('Hoa hồng','padding-right:20px;text-align:right')}</tr></thead>
        <tbody>${rows1}</tbody></table>${empty1}</div>
      ${pager(range1,'1')}</section>

    <section id="sec2" style="background:#fff;border:1px solid #E5E9EC;border-radius:14px;overflow:hidden">
      <div style="padding:18px 20px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #EEF1F3">
        <h2 style="margin:0;font-size:18px;font-weight:600">2. Khách hàng đăng ký mới ${pLabel}</h2>${searchBox('',S.field,S.query,S.fieldOpen)}</div>
      <div style="padding:12px 20px;display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid #EEF1F3">${tabs}</div>
      <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;table-layout:fixed;min-width:1140px;font-size:14px"><thead><tr style="background:#FAFBFC;color:#6B757D;text-align:left">
        ${hd('Tên khách hàng','padding:12px 20px;width:15%')}${hd('Số điện thoại','width:20%')}${hd('Địa chỉ','width:19%')}${hd('Ngày tạo TK','width:12%')}${hd('Trạng thái','width:14%')}${hd('Gói','width:9%')}${hd('Ngày mua gói','padding:12px 20px;text-align:right;width:11%')}</tr></thead>
        <tbody>${rows2}</tbody></table>${empty2}</div>
      ${pager(range2,'')}</section>
  </main>`;
}

/* ---------- render ---------- */
function render(){
  const app=document.getElementById('app');
  const ae=document.activeElement;
  const keep=ae&&ae.id&&app.contains(ae)?{id:ae.id,s:ae.selectionStart,e:ae.selectionEnd}:null;
  let main='';
  if(!S.loggedIn) main=S.screen==='login'?loginScreen():regScreen();
  else if(S.noCode) main=S.created?createdScreen():noCodeScreen();
  else main=reportScreen();
  const y=window.scrollY;
  app.innerHTML=header()+main+toastHtml();
  if(keep){const el=document.getElementById(keep.id);if(el){el.focus();try{el.setSelectionRange(keep.s,keep.e);}catch(_){}}}
  if(Math.abs(window.scrollY-y)>1)window.scrollTo(0,y);
}

/* ---------- events ---------- */
const goTo=id=>{const el=document.getElementById(id);if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-76,behavior:'smooth'});};
const ACT={
  noop:()=>{},
  lang:v=>set({lang:v}),
  menu:()=>set({menuOpen:!S.menuOpen}),'menu-close':()=>set({menuOpen:false}),
  logout:()=>set({loggedIn:false,menuOpen:false,created:false,screen:'login'}),
  login:()=>set({loggedIn:true,noCode:S.phone.replace(/\s/g,'')==='0900000009',created:false,newUser:false,period:'cur',filter:'all',query:'',dq:null,q1:'',dq1:null,page:0,page1:0}),
  'go-reg':()=>set({screen:'reg1',rPhone:'',rOtp:'',rPw:'',rName:'',rEmail:'',showPw:false}),
  'go-login':()=>set({screen:'login'}),
  'reg-back':()=>set({screen:{reg3:'reg2',fp1:'login',fp2:'fp1',fp3:'fp2'}[S.screen]||'reg1'}),
  'go-forgot':()=>set({screen:'fp1',rPhone:S.phone,rOtp:'',rPw:'',showPw:false}),
  'reg-next':()=>{if(!regOk())return;
    if(S.screen==='reg4')return set({loggedIn:true,noCode:true,created:false,newUser:true,phone:S.rPhone,screen:'login'});
    if(S.screen==='fp3')return set({loggedIn:true,noCode:S.rPhone==='0900000009',created:false,newUser:false,phone:S.rPhone,screen:'login',showPw:false,menuOpen:false});
    set({screen:{reg1:'reg2',reg2:'reg3',reg3:'reg4',fp1:'fp2',fp2:'fp3'}[S.screen]});},
  'toggle-pw':()=>set({showPw:!S.showPw}),
  'create-code':()=>set({created:true,copied:false}),
  'go-report':()=>set({noCode:false}),
  'copy-code':()=>{try{navigator.clipboard.writeText(myCode());}catch(e){}
    set({copied:true});clearTimeout(S.copiedTimer);S.copiedTimer=setTimeout(()=>set({copied:false}),1800);},
  period:v=>set({period:v,page:0,page1:0,filter:'all',query:'',dq:null,q1:'',dq1:null}),
  tab:v=>set({filter:v,page:0}),
  'go-sec1':()=>goTo('sec1'),'go-sec2':()=>goTo('sec2'),
  'toggle-field':()=>set({fieldOpen:!S.fieldOpen,fieldOpen1:false}),'toggle-field1':()=>set({fieldOpen1:!S.fieldOpen1,fieldOpen:false}),
  field:v=>set({field:v,page:0,fieldOpen:false}),field1:v=>set({field1:v,page1:0,fieldOpen1:false}),
  'clear-search':()=>{set({query:'',dq:null,page:0});const i=document.getElementById('in-search');i&&i.focus();},
  'clear-search1':()=>{set({q1:'',dq1:null,page1:0});const i=document.getElementById('in-search1');i&&i.focus();},
  submit:()=>{if(S.dq!==null)set({query:S.dq,dq:null,page:0});},
  submit1:()=>{if(S.dq1!==null)set({q1:S.dq1,dq1:null,page1:0});},
  prev:()=>set({page:Math.max(0,S.page-1)}),next:()=>set({page:S.page+1}),
  prev1:()=>set({page1:Math.max(0,S.page1-1)}),next1:()=>set({page1:S.page1+1})   // upper bound clamped in render
};
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-act]');
  if(t&&ACT[t.dataset.act]){if(t.tagName==='A')e.preventDefault();ACT[t.dataset.act](t.dataset.v);return;}
  if((S.fieldOpen||S.fieldOpen1)&&!e.target.closest('[data-dd]'))set({fieldOpen:false,fieldOpen1:false}); // click outside closes dropdown
});
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter')return;const k=e.target.dataset&&e.target.dataset.in;
  if(k==='search')ACT.submit();else if(k==='search1')ACT.submit1();
});
document.addEventListener('input',e=>{
  const k=e.target.dataset&&e.target.dataset.in;if(!k)return;
  let v=e.target.value;
  if(k==='phone')return set({phone:v.replace(/\s/g,'')});
  if(k==='search')return set({dq:v});        // search runs on Enter / magnifier click
  if(k==='search1')return set({dq1:v});
  if(k==='rPhone'||k==='rOtp')v=v.replace(/\D/g,'');
  if(k==='rOtp')v=v.slice(0,6);
  set({[k]:v});
});
mq.addEventListener('change',()=>set({menuOpen:false}));
window.addEventListener('resize',()=>{if(S.loggedIn&&!S.noCode)render();});
render();
