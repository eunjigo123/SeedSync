const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
const mobile=$('#mobileNav');$('#menuOpen').addEventListener('click',()=>mobile.classList.toggle('open'));
$$('.mobile-nav a').forEach(a=>a.addEventListener('click',()=>mobile.classList.remove('open')));
const modal=$('#searchModal');$('#searchOpen').addEventListener('click',()=>{modal.classList.add('active');setTimeout(()=>$('#searchInput').focus(),50)});$('#searchClose').addEventListener('click',()=>modal.classList.remove('active'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.classList.remove('active')});
let count=Number(localStorage.getItem('mallCartCount')||0);$('#cartCount').textContent=count;
$$('.add').forEach(btn=>btn.addEventListener('click',()=>{count++;localStorage.setItem('mallCartCount',count);$('#cartCount').textContent=count;const t=$('#toast');t.textContent=`${btn.dataset.name}을(를) 장바구니에 담았습니다.`;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}));
const header=$('#header');window.addEventListener('scroll',()=>header.style.boxShadow=scrollY>20?'0 3px 20px #0000000d':'none');
