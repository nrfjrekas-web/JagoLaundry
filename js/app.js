/* JagoLaundry - demo showcase. Data contoh fiktif, disimpan di localStorage browser. */
const $=(s,r=document)=>r.querySelector(s);
const rp=n=>"Rp "+Math.round(n||0).toLocaleString("id-ID");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const iso=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const dAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return iso(d)};
const addD=(s,n)=>{const d=new Date(s+"T00:00");d.setDate(d.getDate()+n);return iso(d)};
const today=dAgo(0);
const fdate=s=>s?new Date(s+"T00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"}):"-";
const ST=["Diterima","Menunggu","Dicuci","Dikeringkan","Disetrika","Dikemas","Selesai","Siap Diambil","Diambil"];
const KEY="jagolaundry-demo-v1";let S,uid=0;
const nid=()=>"i"+Date.now().toString(36)+(uid++);

function seed(){
  const cust=["Budi Santoso","Siti Aminah","Ahmad Fauzi","Dewi Lestari","Rina Marlina","Andi Pratama"].map((n,i)=>({id:"c"+i,nama:n,wa:"08123"+(100000+i*1111),alamat:"Jl. Mawar No. "+(i+3)+", Jember",tgl:dAgo(60-i*7)}));
  const svc=[["Cuci Kering",5000,"kg",24],["Cuci Setrika",7000,"kg",48],["Setrika Saja",4000,"kg",24],["Express",12000,"kg",6],["Selimut",20000,"satuan",48],["Bed Cover",25000,"satuan",48]].map((s,i)=>({id:"s"+i,nama:s[0],harga:s[1],tipe:s[2],est:s[3],aktif:"1"}));
  const trx=[],pay=[],hist=[];
  for(let i=0;i<70;i++){
    const age=Math.floor((69-i)/2),tgl=dAgo(age),s=svc[(i*5)%6],q=s.tipe==="kg"?2+(i*3)%7:1+i%3;
    const diskon=i%7===0?2000:0,total=s.harga*q-diskon,status=age>3?"Diambil":ST[1+(i%7)];
    const t={id:"t"+i,no:"JL-"+tgl.replace(/-/g,"")+"-"+String(i+1).padStart(3,"0"),tgl,est:addD(tgl,Math.ceil(s.est/24)),cust:cust[i%6].id,svc:s.id,qty:q,diskon,tambah:0,total,status,notes:""};
    trx.push(t);
    const paid=status==="Diambil"?total:[0,Math.round(total/2000)*1000,total][i%3];
    if(paid>0)pay.push({id:"p"+i,trx:t.id,tgl,metode:["Tunai","Transfer","QRIS"][i%3],jml:paid});
    hist.push({trx:t.id,dari:"-",ke:"Diterima",waktu:tgl});
  }
  const inv=[["Deterjen","kg",18,10,22000],["Pewangi","liter",6,8,45000],["Pelembut","liter",12,8,38000],["Plastik laundry","pak",15,5,15000],["Hanger","pcs",120,50,2500],["Label pakaian","roll",3,4,20000],["Gas","tabung",2,2,22000]].map((r,i)=>({id:"v"+i,nama:r[0],satuan:r[1],stok:r[2],min:r[3],harga:r[4]}));
  const kat=["Pembelian deterjen","Listrik","Air","Gaji","Perawatan mesin","Pembelian pewangi","Perlengkapan"];
  const exp=kat.concat(["Listrik","Air","Biaya lainnya"]).map((k,i)=>({id:"e"+i,tgl:dAgo(i*3),kat:k,ket:k+" (contoh)",nom:[220000,450000,180000,1500000,250000,135000,90000,430000,175000,60000][i]}));
  const emp=[["Rudi Hartono","Operator Cuci"],["Sari Wulandari","Kasir"],["Dimas Putra","Penyetrika"],["Lia Anggraini","Pengemasan"]].map((r,i)=>({id:"m"+i,nama:r[0],hp:"08567"+(200000+i*3333),jabatan:r[1],tgl:dAgo(300-i*40)}));
  return{cust,svc,trx,pay,hist,inv,exp,emp,log:[{tgl:today,txt:"Data contoh dimuat"}],toko:{nama:"JagoLaundry",alamat:"Jl. Contoh No. 10, Jember",telp:"0812-0000-0000",email:"halo@jagolaundry.example",footer:"Terima kasih telah mempercayakan cucian Anda."},tema:"light"};
}
function load(){try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){S=null}if(!S)S=seed()}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function logA(txt){S.log.unshift({tgl:today,txt});S.log=S.log.slice(0,30)}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove("on"),2200)}

const cn=id=>S.cust.find(c=>c.id===id)?.nama||"-";
const sv=id=>S.svc.find(s=>s.id===id);
const paid=t=>S.pay.filter(p=>p.trx===t.id).reduce((a,p)=>a+p.jml,0);
const sisa=t=>Math.max(0,t.total-paid(t));
const pst=t=>paid(t)<=0?"Belum Bayar":sisa(t)>0?"DP":"Lunas";
const bdg=(txt,c)=>`<span class="b ${c||""}">${esc(txt)}</span>`;
const bP=t=>{const s=pst(t);return bdg(s,{Lunas:"green",DP:"amber","Belum Bayar":"red"}[s])};
const bS=s=>bdg(s,s==="Diambil"?"gray":["Selesai","Siap Diambil"].includes(s)?"green":"");
const tbl=(h,rows)=>rows.length?`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map((c,i)=>`<td data-l="${esc(h[i])}">${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`:`<div class="empty">Belum ada data yang cocok.</div>`;
const F={cust:{q:""},svc:{q:""},inv:{q:""},exp:{q:""},emp:{q:""},trx:{q:"",st:"",a:"",b:"",n:40},kb:{q:""},rep:{p:"7d",a:today,b:today},dash:"d"};
const BODY={};

/* ---------- CRUD generik ---------- */
const ENT={
 cust:{t:"Data Pelanggan",o:"Pelanggan",c:[{k:"nama",l:"Nama"},{k:"wa",l:"WhatsApp"},{k:"alamat",l:"Alamat"},{k:"tgl",l:"Bergabung",t:"date",f:fdate}],
  x:[["Transaksi",r=>S.trx.filter(t=>t.cust===r.id).length],["Total belanja",r=>rp(S.trx.filter(t=>t.cust===r.id).reduce((a,t)=>a+t.total,0))]],act:r=>`<button class="btn sm" data-a="custdet" data-id="${r.id}">Riwayat</button>`},
 svc:{t:"Layanan & Harga",o:"Layanan",c:[{k:"nama",l:"Nama layanan"},{k:"tipe",l:"Jenis harga",t:"sel",o:[["kg","Per kilogram"],["satuan","Per satuan"],["paket","Per paket"]]},{k:"harga",l:"Harga",t:"number",f:rp},{k:"est",l:"Estimasi (jam)",t:"number"},{k:"aktif",l:"Status",t:"sel",o:[["1","Aktif"],["0","Nonaktif"]]}]},
 inv:{t:"Stok Barang",o:"Barang",c:[{k:"nama",l:"Nama barang"},{k:"satuan",l:"Satuan"},{k:"stok",l:"Stok",t:"number"},{k:"min",l:"Stok minimum",t:"number"},{k:"harga",l:"Harga beli",t:"number",f:rp}],
  x:[["Status",r=>r.stok<=r.min?bdg("Stok menipis","red"):bdg("Aman","green")]],act:r=>`<button class="btn sm" data-a="stok" data-id="${r.id}" data-d="1">+ Masuk</button><button class="btn sm" data-a="stok" data-id="${r.id}" data-d="-1">− Keluar</button>`},
 exp:{t:"Pengeluaran",o:"Pengeluaran",c:[{k:"tgl",l:"Tanggal",t:"date",f:fdate},{k:"kat",l:"Kategori",t:"sel",o:["Pembelian deterjen","Pembelian pewangi","Listrik","Air","Gaji","Perawatan mesin","Sewa tempat","Perlengkapan","Biaya lainnya"].map(x=>[x,x])},{k:"ket",l:"Keterangan"},{k:"nom",l:"Nominal",t:"number",f:rp}]},
 emp:{t:"Karyawan",o:"Karyawan",c:[{k:"nama",l:"Nama"},{k:"hp",l:"Nomor HP"},{k:"jabatan",l:"Jabatan"},{k:"tgl",l:"Bergabung",t:"date",f:fdate}]}
};
const show=(c,v)=>c.t==="sel"?(c.o.find(o=>o[0]==v)||[0,v])[1]:c.f?c.f(v):v;
function listBody(key){const E=ENT[key],q=F[key].q.toLowerCase();
 const rows=S[key].filter(r=>JSON.stringify(r).toLowerCase().includes(q));
 if(key==="exp")rows.sort((a,b)=>b.tgl.localeCompare(a.tgl));
 const h=[...E.c.map(c=>c.l),...(E.x||[]).map(x=>x[0]),""];
 return tbl(h,rows.map(r=>[...E.c.map(c=>esc(show(c,r[c.k]))),...(E.x||[]).map(x=>x[1](r)),
  `<button class="btn sm" data-a="edit" data-k="${key}" data-id="${r.id}">Ubah</button><button class="btn sm dng" data-a="del" data-k="${key}" data-id="${r.id}">Hapus</button>`+(E.act?E.act(r):"")]))}
function list(key){const E=ENT[key];BODY[key]=()=>listBody(key);
 let extra="";if(key==="exp"){const m=today.slice(0,7),by={};S.exp.filter(e=>e.tgl.startsWith(m)).forEach(e=>by[e.kat]=(by[e.kat]||0)+e.nom);
  extra=`<div class="card" style="margin-bottom:16px"><h3>Rekap bulan ini: ${rp(Object.values(by).reduce((a,b)=>a+b,0))}</h3><span class="hint">${Object.entries(by).map(([k,v])=>esc(k)+" "+rp(v)).join(" · ")||"Belum ada pengeluaran bulan ini."}</span></div>`}
 return `<div class="bar"><h1>${E.t}</h1></div>${extra}<div class="tools"><input type="search" placeholder="Cari..." aria-label="Cari" value="${esc(F[key].q)}" data-f="${key}.q"><button class="btn pri" data-a="add" data-k="${key}">+ Tambah ${E.o}</button></div><div id="tb">${listBody(key)}</div>`}
function form(key,id){const E=ENT[key],row=id?S[key].find(r=>r.id===id):{};
 const f=modal((id?"Ubah ":"Tambah ")+E.o,E.c.map(c=>`<label>${c.l}${c.t==="sel"?`<select name="${c.k}">${c.o.map(o=>`<option value="${esc(o[0])}"${row[c.k]==o[0]?" selected":""}>${esc(o[1])}</option>`).join("")}</select>`:`<input name="${c.k}" type="${c.t||"text"}" step="any" required value="${esc(row[c.k]??(c.t==="date"?today:""))}">`}</label>`).join(""),fd=>{
  const o={};E.c.forEach(c=>{const v=fd.get(c.k);o[c.k]=c.t==="number"?Number(v):v});
  if(id)Object.assign(row,o);else S[key].push({id:nid(),...o});
  logA((id?"Mengubah ":"Menambah ")+E.o.toLowerCase()+": "+(o.nama||o.ket||""));save();render();toast("Tersimpan")})}

/* ---------- Dashboard ---------- */
const sumPay=f=>S.pay.filter(f).reduce((a,p)=>a+p.jml,0);
function bars(d,col,fm){const mx=Math.max(1,...d.map(x=>x[1])),w=600/d.length;
 return `<svg viewBox="0 0 600 210" class="chart" role="img" aria-label="Grafik">${d.map((x,i)=>{const h=x[1]/mx*150;return `<rect x="${i*w+w*.2}" y="${170-h}" width="${w*.6}" height="${h}" rx="4" fill="${col}"><title>${x[0]}: ${fm(x[1])}</title></rect><text x="${i*w+w/2}" y="194" text-anchor="middle" font-size="12" fill="var(--mut)">${x[0]}</text>`}).join("")}</svg>`}
function series(per){const o=[];
 if(per==="d")for(let i=6;i>=0;i--){const d=dAgo(i);o.push([d.slice(8)+"/"+d.slice(5,7),sumPay(p=>p.tgl===d)])}
 else if(per==="w")for(let i=7;i>=0;i--){const a=dAgo(7*i+6),b=dAgo(7*i);o.push(["M"+(8-i),sumPay(p=>p.tgl>=a&&p.tgl<=b)])}
 else for(let i=5;i>=0;i--){const d=new Date();d.setDate(1);d.setMonth(d.getMonth()-i);const m=iso(d).slice(0,7);o.push([m.slice(5)+"/"+m.slice(2,4),sumPay(p=>p.tgl.startsWith(m))])}
 return o}
function dashboard(){
 const n=a=>S.trx.filter(t=>a.includes(t.status)).length;
 const cards=[["Pendapatan hari ini",rp(sumPay(p=>p.tgl===today))],["Transaksi hari ini",S.trx.filter(t=>t.tgl===today).length],["Total pelanggan",S.cust.length],["Sedang diproses",n(ST.slice(0,6))],["Selesai",n(["Selesai"])],["Siap diambil",n(["Siap Diambil"])],["Belum lunas",S.trx.filter(t=>sisa(t)>0).length]];
 const tx=[];for(let i=6;i>=0;i--){const d=dAgo(i);tx.push([d.slice(8)+"/"+d.slice(5,7),S.trx.filter(t=>t.tgl===d).length])}
 const last=[...S.trx].sort((a,b)=>b.tgl.localeCompare(a.tgl)||b.no.localeCompare(a.no)).slice(0,6);
 return `<div class="bar"><h1>Dashboard</h1><div class="tabs"><button class="btn pri" data-a="trxnew">+ Transaksi Baru</button><button class="btn" data-a="add" data-k="cust">+ Pelanggan</button><button class="btn" data-a="add" data-k="svc">+ Layanan</button><a class="btn" href="#/reports" style="display:inline-flex;align-items:center;text-decoration:none">Lihat Laporan</a></div></div>
 <div class="cards">${cards.map(c=>`<div class="card stat"><small>${c[0]}</small><b>${c[1]}</b></div>`).join("")}</div>
 <div class="g2"><div class="card"><div class="bar" style="margin-bottom:4px"><h2 style="margin:0">Pendapatan</h2><div class="tabs">${[["d","Harian"],["w","Mingguan"],["m","Bulanan"]].map(x=>`<button class="btn sm ${F.dash===x[0]?"on":""}" data-a="per" data-v="${x[0]}">${x[1]}</button>`).join("")}</div></div>${bars(series(F.dash),"var(--pri)",rp)}</div>
 <div class="card"><h2>Transaksi per hari (7 hari)</h2>${bars(tx,"var(--acc)",v=>v+" transaksi")}</div></div>
 <div class="g2"><div><h2>Transaksi terbaru</h2>${tbl(["No","Pelanggan","Total","Status",""],last.map(t=>[esc(t.no),esc(cn(t.cust)),rp(t.total),bS(t.status),`<button class="btn sm" data-a="det" data-id="${t.id}">Detail</button>`]))}</div>
 <div class="card"><h2>Aktivitas terbaru</h2><ul class="act">${S.log.slice(0,8).map(l=>`<li>${esc(l.txt)} <small>· ${fdate(l.tgl)}</small></li>`).join("")}</ul></div></div>`}

/* ---------- Transaksi ---------- */
function trxBody(){const f=F.trx,q=f.q.toLowerCase();
 const rows=[...S.trx].filter(t=>(!q||(t.no+cn(t.cust)).toLowerCase().includes(q))&&(!f.st||t.status===f.st)&&(!f.a||t.tgl>=f.a)&&(!f.b||t.tgl<=f.b)).sort((a,b)=>b.tgl.localeCompare(a.tgl)||b.no.localeCompare(a.no));
 return tbl(["No","Tanggal","Pelanggan","Layanan","Total","Pembayaran","Status",""],rows.slice(0,f.n).map(t=>[esc(t.no),fdate(t.tgl),esc(cn(t.cust)),esc(sv(t.svc)?.nama||"-"),rp(t.total),bP(t),bS(t.status),
  `<button class="btn sm" data-a="det" data-id="${t.id}">Detail</button><button class="btn sm" data-a="trxedit" data-id="${t.id}">Ubah</button><button class="btn sm" data-a="nota" data-id="${t.id}">Nota</button><button class="btn sm dng" data-a="trxdel" data-id="${t.id}">Hapus</button>`]))+(rows.length>f.n?`<p style="text-align:center"><button class="btn" data-a="more">Muat lebih banyak (${rows.length-f.n})</button></p>`:"")}
function transactions(){BODY.trx=trxBody;const f=F.trx;
 return `<div class="bar"><h1>Transaksi Laundry</h1><button class="btn pri" data-a="trxnew">+ Transaksi Baru</button></div>
 <div class="tools"><input type="search" placeholder="Cari nomor atau pelanggan" aria-label="Cari" value="${esc(f.q)}" data-f="trx.q"><select data-f="trx.st" aria-label="Status"><option value="">Semua status</option>${ST.map(s=>`<option${f.st===s?" selected":""}>${s}</option>`).join("")}</select><input type="date" data-f="trx.a" value="${f.a}" aria-label="Dari tanggal"><input type="date" data-f="trx.b" value="${f.b}" aria-label="Sampai tanggal"></div><div id="tb">${trxBody()}</div>`}
function trxForm(id){const t=id?S.trx.find(x=>x.id===id):null;
 const body=`<label>Pelanggan<select name="cust" data-nc>${S.cust.map(c=>`<option value="${c.id}"${t&&t.cust===c.id?" selected":""}>${esc(c.nama)}</option>`).join("")}<option value="_new">+ Pelanggan baru</option></select></label>
 <div id="nc" hidden><label>Nama pelanggan baru<input name="nn"></label><label>Nomor WhatsApp<input name="nw" inputmode="tel"></label></div>
 <label>Layanan<select name="svc">${S.svc.filter(s=>s.aktif==="1"||(t&&t.svc===s.id)).map(s=>`<option value="${s.id}"${t&&t.svc===s.id?" selected":""}>${esc(s.nama)} - ${rp(s.harga)}/${s.tipe}</option>`).join("")}</select></label>
 <label>Berat (kg) atau jumlah<input name="qty" type="number" step="0.1" min="0.1" required value="${t?t.qty:1}"></label>
 <label>Diskon (Rp)<input name="diskon" type="number" min="0" value="${t?t.diskon:0}"></label><label>Biaya tambahan (Rp)<input name="tambah" type="number" min="0" value="${t?t.tambah:0}"></label>
 ${t?"":`<label>DP (Rp)<input name="dp" type="number" min="0" value="0"></label>`}<label>Catatan<input name="notes" value="${esc(t?t.notes:"")}"></label>
 <div class="sum" id="sum"></div>`;
 const f=modal(t?"Ubah Transaksi "+t.no:"Transaksi Baru",body,fd=>{
  let cid=fd.get("cust");if(cid==="_new"){const nm=(fd.get("nn")||"").trim();if(!nm){toast("Isi nama pelanggan baru");return false}cid=nid();S.cust.push({id:cid,nama:nm,wa:fd.get("nw")||"",alamat:"-",tgl:today})}
  const s=sv(fd.get("svc")),q=Number(fd.get("qty")),dk=Number(fd.get("diskon")),tb=Number(fd.get("tambah")),total=Math.max(0,s.harga*q-dk+tb);
  if(t){Object.assign(t,{cust:cid,svc:s.id,qty:q,diskon:dk,tambah:tb,total,notes:fd.get("notes")});logA("Mengubah transaksi "+t.no)}
  else{const no="JL-"+today.replace(/-/g,"")+"-"+String(S.trx.length+1).padStart(3,"0"),nt={id:nid(),no,tgl:today,est:addD(today,Math.ceil(s.est/24)),cust:cid,svc:s.id,qty:q,diskon:dk,tambah:tb,total,status:"Diterima",notes:fd.get("notes")};
   S.trx.push(nt);S.hist.push({trx:nt.id,dari:"-",ke:"Diterima",waktu:today});logA("Transaksi baru "+no+" - "+cn(cid));
   const dp=Math.min(Number(fd.get("dp")||0),total);if(dp>0){S.pay.push({id:nid(),trx:nt.id,tgl:today,metode:"Tunai",jml:dp});logA("Pembayaran DP "+rp(dp)+" untuk "+no)}}
  save();render();toast("Transaksi tersimpan")});
 const calc=()=>{const fd=new FormData(f),s=sv(fd.get("svc"));if(!s)return;const sub=s.harga*Number(fd.get("qty")||0),tot=Math.max(0,sub-Number(fd.get("diskon")||0)+Number(fd.get("tambah")||0)),dp=Number(fd.get("dp")||(t?paid(t):0));
  $("#sum").innerHTML=`<div><span>Subtotal</span><b>${rp(sub)}</b></div><div><span>Total</span><b>${rp(tot)}</b></div><div><span>${t?"Sudah dibayar":"DP"}</span><b>${rp(dp)}</b></div><div><span>Sisa pembayaran</span><b>${rp(Math.max(0,tot-dp))}</b></div>`};
 f.addEventListener("input",calc);f.addEventListener("change",()=>{$("#nc").hidden=f.cust.value!=="_new";calc()});calc()}

/* ---------- Proses (Kanban) ---------- */
function kbBody(){const q=F.kb.q.toLowerCase();
 return `<div class="board">${ST.map((s,i)=>{const items=S.trx.filter(t=>t.status===s&&(!q||t.no.toLowerCase().includes(q)||cn(t.cust).toLowerCase().includes(q))&&!(s==="Diambil"&&t.tgl<dAgo(3)));
  return `<div class="col"><h3>${s}<span class="b gray">${items.length}</span></h3>${items.map(t=>`<div class="kc" data-a="det" data-id="${t.id}"><b>${esc(t.no.slice(-12))}</b><small>${esc(cn(t.cust))} · ${esc(sv(t.svc)?.nama||"")}</small><div class="mv"><button class="btn sm" data-a="move" data-id="${t.id}" data-d="-1" aria-label="Mundur"${i?"":" disabled"}>◀</button><button class="btn sm" data-a="move" data-id="${t.id}" data-d="1" aria-label="Maju"${i<8?"":" disabled"}>▶</button></div></div>`).join("")||'<small class="hint">Kosong</small>'}</div>`}).join("")}</div>`}
function process(){BODY.kb=kbBody;return `<div class="bar"><h1>Proses Laundry</h1></div><div class="tools"><input type="search" placeholder="Cari nomor atau pelanggan" aria-label="Cari" value="${esc(F.kb.q)}" data-f="kb.q"></div><p class="hint">Gunakan tombol ◀ ▶ untuk memindahkan status. Kolom Diambil hanya menampilkan 3 hari terakhir.</p><div id="tb">${kbBody()}</div>`}

/* ---------- Pembayaran ---------- */
function payments(){
 const unpaid=S.trx.filter(t=>sisa(t)>0).sort((a,b)=>b.tgl.localeCompare(a.tgl));
 const ps=[...S.pay].sort((a,b)=>b.tgl.localeCompare(a.tgl)).slice(0,40);
 return `<div class="bar"><h1>Pembayaran</h1><button class="btn pri" data-a="pay">+ Tambah Pembayaran</button></div>
 <h2>Tagihan belum lunas (${unpaid.length})</h2>${tbl(["No","Pelanggan","Total","Dibayar","Sisa","Status",""],unpaid.slice(0,30).map(t=>[esc(t.no),esc(cn(t.cust)),rp(t.total),rp(paid(t)),rp(sisa(t)),bP(t),`<button class="btn sm pri" data-a="pay" data-id="${t.id}">Bayar</button>`]))}
 <h2 style="margin-top:22px">Riwayat pembayaran (40 terbaru)</h2>${tbl(["Tanggal","Transaksi","Pelanggan","Metode","Jumlah",""],ps.map(p=>{const t=S.trx.find(x=>x.id===p.trx);return [fdate(p.tgl),esc(t?t.no:"-"),esc(t?cn(t.cust):"-"),esc(p.metode),rp(p.jml),t?`<button class="btn sm" data-a="nota" data-id="${t.id}">Cetak bukti</button>`:""]}))}`}
function payForm(id){const un=S.trx.filter(t=>sisa(t)>0);if(!un.length){toast("Semua transaksi sudah lunas");return}
 const cur=un.find(t=>t.id===id)||un[0];
 const f=modal("Tambah Pembayaran",`<label>Transaksi<select name="trx" data-pt>${un.map(t=>`<option value="${t.id}"${t.id===cur.id?" selected":""}>${esc(t.no)} - ${esc(cn(t.cust))} (sisa ${rp(sisa(t))})</option>`).join("")}</select></label>
 <label>Metode<select name="metode"><option>Tunai</option><option>Transfer</option><option>QRIS</option></select></label><label>Jumlah (Rp)<input name="jml" type="number" min="1" required value="${sisa(cur)}"></label><p class="hint">Jika kurang dari sisa tagihan, dicatat sebagai DP/pembayaran sebagian.</p>`,fd=>{
  const t=S.trx.find(x=>x.id===fd.get("trx")),j=Math.min(Number(fd.get("jml")),sisa(t));if(!(j>0)){toast("Jumlah tidak valid");return false}
  S.pay.push({id:nid(),trx:t.id,tgl:today,metode:fd.get("metode"),jml:j});logA((sisa(t)<=0?"Pelunasan ":"Pembayaran ")+rp(j)+" - "+t.no);save();render();toast("Pembayaran dicatat")});
 f.addEventListener("change",e=>{if(e.target.dataset.pt!==undefined)f.jml.value=sisa(S.trx.find(x=>x.id===e.target.value))})}

/* ---------- Detail, riwayat, nota ---------- */
function det(id){const t=S.trx.find(x=>x.id===id);if(!t)return;const s=sv(t.svc);
 modal("Detail "+t.no,`<p><b>${esc(cn(t.cust))}</b><br>${esc(s?.nama||"-")} × ${t.qty} ${s?.tipe||""}<br>Masuk ${fdate(t.tgl)} · Estimasi selesai ${fdate(t.est)}</p>
 <div class="sum"><div><span>Diskon</span><b>${rp(t.diskon)}</b></div><div><span>Biaya tambahan</span><b>${rp(t.tambah)}</b></div><div><span>Total</span><b>${rp(t.total)}</b></div><div><span>Dibayar</span><b>${rp(paid(t))}</b></div><div><span>Sisa</span><b>${rp(sisa(t))}</b></div></div>
 <p>${bS(t.status)} ${bP(t)}</p>${t.notes?`<p>Catatan: ${esc(t.notes)}</p>`:""}
 <h3>Riwayat status</h3><ul class="act">${S.hist.filter(h=>h.trx===id).map(h=>`<li>${esc(h.dari)} → <b>${esc(h.ke)}</b> <small>· ${fdate(h.waktu)}${h.cat?" · "+esc(h.cat):""}</small></li>`).join("")}</ul>
 <p><button type="button" class="btn" data-a="nota" data-id="${id}">Cetak nota</button> <button type="button" class="btn" data-a="pay" data-id="${id}">Tambah pembayaran</button></p>`)}
function nota(id){const t=S.trx.find(x=>x.id===id);if(!t)return;const s=sv(t.svc),T=S.toko,ps=S.pay.filter(p=>p.trx===id);
 const f=modal("Nota "+t.no,`<label>Ukuran kertas<select data-sz><option value="w80">Thermal 80 mm</option><option value="w58">Thermal 58 mm</option><option value="wa4">A4</option></select></label>
 <div id="nota" class="w80"><div style="text-align:center"><b>${esc(T.nama)}</b><br>${esc(T.alamat)}<br>${esc(T.telp)}</div><hr>
 <div>No: ${esc(t.no)}<br>Masuk: ${fdate(t.tgl)}<br>Estimasi: ${fdate(t.est)}<br>Pelanggan: ${esc(cn(t.cust))}</div><hr>
 <div class="r"><span>${esc(s?.nama||"")} ${t.qty}${s?.tipe==="kg"?"kg":""} × ${rp(s?.harga)}</span></div>
 <div class="r"><span>Diskon</span><span>${rp(t.diskon)}</span></div><div class="r"><span>Biaya tambahan</span><span>${rp(t.tambah)}</span></div>
 <div class="r"><b>TOTAL</b><b>${rp(t.total)}</b></div>${ps.map(p=>`<div class="r"><span>Bayar ${esc(p.metode)} ${fdate(p.tgl)}</span><span>${rp(p.jml)}</span></div>`).join("")}
 <div class="r"><span>Sisa</span><span>${rp(sisa(t))}</span></div><div>Status: ${pst(t)}</div>${t.notes?`<div>Catatan: ${esc(t.notes)}</div>`:""}<hr><div style="text-align:center">${esc(T.footer)}</div></div>
 <p><button type="button" class="btn pri" data-a="print">Cetak / simpan PDF</button></p>`);
 f.addEventListener("change",e=>{if(e.target.dataset.sz!==undefined)$("#nota").className=e.target.value})}

/* ---------- Laporan ---------- */
function rng(p){const n=new Date(),Y=n.getFullYear(),M=n.getMonth();
 return({today:[today,today],yest:[dAgo(1),dAgo(1)],"7d":[dAgo(6),today],month:[iso(new Date(Y,M,1)),today],lastm:[iso(new Date(Y,M-1,1)),iso(new Date(Y,M,0))],year:[iso(new Date(Y,0,1)),today]})[p]||[F.rep.a,F.rep.b]}
function repData(){const [a,b]=rng(F.rep.p),inr=d=>d>=a&&d<=b,T=S.trx.filter(t=>inr(t.tgl));
 const omzet=T.reduce((x,t)=>x+t.total,0),bayar=sumPay(p=>inr(p.tgl)),piut=T.reduce((x,t)=>x+sisa(t),0),keluar=S.exp.filter(e=>inr(e.tgl)).reduce((x,e)=>x+e.nom,0);
 const per=S.svc.map(s=>{const r=T.filter(t=>t.svc===s.id);return [s.nama,r.length,r.reduce((x,t)=>x+t.total,0)]});
 return{a,b,T,omzet,bayar,piut,keluar,laba:bayar-keluar,per,masuk:T.length,selesai:T.filter(t=>ST.indexOf(t.status)>=6).length,blmAmbil:T.filter(t=>["Selesai","Siap Diambil"].includes(t.status)).length,pel:new Set(T.map(t=>t.cust)).size}}
function repBody(){const d=repData();
 return `<div class="cards">${[["Total omzet",rp(d.omzet)],["Total pembayaran",rp(d.bayar)],["Total piutang",rp(d.piut)],["Total pengeluaran",rp(d.keluar)],["Estimasi keuntungan",rp(d.laba)]].map(c=>`<div class="card stat"><small>${c[0]}</small><b>${c[1]}</b></div>`).join("")}</div>
 <div class="cards">${[["Cucian masuk",d.masuk],["Cucian selesai",d.selesai],["Belum diambil",d.blmAmbil],["Jumlah pelanggan",d.pel]].map(c=>`<div class="card stat"><small>${c[0]}</small><b>${c[1]}</b></div>`).join("")}</div>
 <h2>Berdasarkan layanan</h2>${tbl(["Layanan","Transaksi","Omzet"],d.per.map(r=>[esc(r[0]),r[1],rp(r[2])]))}`}
function reports(){BODY.rep=repBody;const p=F.rep.p;
 return `<div class="bar"><h1>Laporan</h1><div class="tabs"><button class="btn" data-a="csv">Unduh CSV</button><button class="btn" data-a="print">Cetak / PDF</button></div></div>
 <div class="tools"><select data-f="rep.p" aria-label="Periode">${[["today","Hari ini"],["yest","Kemarin"],["7d","7 hari terakhir"],["month","Bulan ini"],["lastm","Bulan sebelumnya"],["year","Tahun ini"],["c","Rentang custom"]].map(o=>`<option value="${o[0]}"${p===o[0]?" selected":""}>${o[1]}</option>`).join("")}</select>
 ${p==="c"?`<input type="date" data-f="rep.a" value="${F.rep.a}" aria-label="Dari"><input type="date" data-f="rep.b" value="${F.rep.b}" aria-label="Sampai">`:""}</div><div id="tb">${repBody()}</div>`}

/* ---------- Pengaturan ---------- */
function settings(){const T=S.toko;
 return `<div class="bar"><h1>Pengaturan</h1></div><div class="g2"><form class="card" data-s="toko"><h2>Profil toko dan nota</h2>
 ${[["nama","Nama toko"],["alamat","Alamat"],["telp","Nomor telepon"],["email","Email"],["footer","Footer nota"]].map(f=>`<label>${f[1]}<input name="${f[0]}" value="${esc(T[f[0]])}"></label>`).join("")}<button class="btn pri">Simpan</button></form>
 <div class="card"><h2>Tampilan dan data</h2><p><button class="btn" data-a="theme">Ganti tema ${S.tema==="dark"?"terang":"gelap"}</button></p><p class="hint">Semua data adalah contoh fiktif yang tersimpan di browser ini saja. Perubahan bukan transaksi sungguhan.</p><button class="btn dng" data-a="reset">Reset data demo</button></div></div>`}

/* ---------- Shell ---------- */
const NAV=[["dashboard","Dashboard","📊"],["transactions","Transaksi Laundry","🧾"],["customers","Data Pelanggan","👥"],["services","Layanan & Harga","🏷️"],["process","Proses Laundry","🧺"],["payments","Pembayaran","💳"],["inventory","Stok Barang","📦"],["expenses","Pengeluaran","💸"],["employees","Karyawan","🧑‍🔧"],["reports","Laporan","📈"],["settings","Pengaturan","⚙️"]];
const PAGES={dashboard,transactions,customers:()=>list("cust"),services:()=>list("svc"),process,payments,inventory:()=>list("inv"),expenses:()=>list("exp"),employees:()=>list("emp"),reports,settings};
function modal(title,body,fn){$("#modal").innerHTML=`<div class="ov" data-a="ov"><form class="dlg"><h2>${title}</h2>${body}<div class="acts"><button type="button" class="btn" data-a="close">${fn?"Batal":"Tutup"}</button>${fn?'<button class="btn pri">Simpan</button>':""}</div></form></div>`;
 $("#modal").classList.add("on");const f=$("#modal form");f.onsubmit=e=>{e.preventDefault();if(!fn||fn(new FormData(f),f)!==false)A.close()};return f}
function render(){const r=location.hash.slice(2)||"dashboard",p=PAGES[r]?r:"dashboard";
 document.documentElement.dataset.theme=S.tema;
 $("#side").innerHTML=`<div class="logo">Jago<b>Laundry</b></div>${NAV.map(n=>`<a href="#/${n[0]}"${n[0]===p?' class="on"':""}>${n[2]} ${n[1]}</a>`).join("")}<div class="sp"></div><button class="lk" data-a="help">❓ Pusat Bantuan</button><button class="lk" data-a="info">ℹ️ Informasi Aplikasi</button>`;
 $("#side").classList.remove("open");
 $("#top").innerHTML=`<button class="btn burger" data-a="menu" aria-label="Buka menu">☰</button><span class="t">${esc(S.toko.nama)} · ${NAV.find(n=>n[0]===p)[1]}</span><span class="b amber">Mode demo</span><button class="btn sm" data-a="theme" aria-label="Ganti tema">${S.tema==="dark"?"☀️":"🌙"}</button>`;
 $("#view").innerHTML=PAGES[p]()}

const A={};
A.close=()=>{$("#modal").classList.remove("on");$("#modal").innerHTML=""};
A.ov=(d,b,e)=>{if(e.target===b)A.close()};
A.menu=()=>$("#side").classList.toggle("open");
A.add=d=>form(d.k);A.edit=d=>form(d.k,d.id);
A.del=d=>{if(confirm("Hapus data ini? (simulasi)")){S[d.k]=S[d.k].filter(r=>r.id!==d.id);logA("Menghapus data "+ENT[d.k].o.toLowerCase());save();render();toast("Dihapus")}};
A.stok=d=>{const r=S.inv.find(x=>x.id===d.id),q=Number(prompt((d.d==="1"?"Stok masuk":"Stok keluar")+" "+r.nama+" ("+r.satuan+"):","1"));if(!(q>0))return;
 if(d.d==="-1"&&q>r.stok){toast("Stok tidak cukup");return}r.stok+=q*Number(d.d);logA((d.d==="1"?"Stok masuk ":"Stok keluar ")+q+" "+r.satuan+" "+r.nama);save();render()};
A.trxnew=()=>trxForm();A.trxedit=d=>trxForm(d.id);
A.trxdel=d=>{if(confirm("Hapus transaksi ini? (simulasi)")){const t=S.trx.find(x=>x.id===d.id);S.trx=S.trx.filter(x=>x.id!==d.id);S.pay=S.pay.filter(p=>p.trx!==d.id);logA("Menghapus transaksi "+t.no);save();render();toast("Dihapus")}};
A.det=d=>det(d.id);A.nota=d=>nota(d.id);A.pay=d=>payForm(d.id);A.print=()=>window.print();
A.more=()=>{F.trx.n+=40;$("#tb").innerHTML=trxBody()};
A.per=d=>{F.dash=d.v;render()};
A.move=d=>{const t=S.trx.find(x=>x.id===d.id),i=ST.indexOf(t.status)+Number(d.d);if(i<0||i>8)return;
 S.hist.push({trx:t.id,dari:t.status,ke:ST[i],waktu:today});t.status=ST[i];logA(t.no+" → "+ST[i]);save();$("#tb").innerHTML=kbBody()};
A.custdet=d=>{const c=S.cust.find(x=>x.id===d.id),T=S.trx.filter(t=>t.cust===c.id).sort((a,b)=>b.tgl.localeCompare(a.tgl));
 modal(esc(c.nama),`<p>${esc(c.wa)} · ${esc(c.alamat)}<br>${T.length} transaksi · ${rp(T.reduce((a,t)=>a+t.total,0))} · terakhir ${T[0]?fdate(T[0].tgl):"-"}</p>${tbl(["No","Tanggal","Total","Status"],T.slice(0,15).map(t=>[esc(t.no),fdate(t.tgl),rp(t.total),bS(t.status)]))}`)};
A.theme=()=>{S.tema=S.tema==="dark"?"light":"dark";save();render()};
A.reset=()=>{if(confirm("Kembalikan semua data ke contoh awal?")){S=seed();save();render();toast("Data demo direset")}};
A.csv=()=>{const d=repData(),rows=[["No","Tanggal","Pelanggan","Layanan","Total","Dibayar","Sisa","Status"],...d.T.map(t=>[t.no,t.tgl,cn(t.cust),sv(t.svc)?.nama,t.total,paid(t),sisa(t),t.status])];
 const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n"),a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob(["\ufeff"+csv],{type:"text/csv"}));a.download="laporan-"+d.a+"_"+d.b+".csv";a.click()};
A.help=()=>modal("Pusat Bantuan","<p>Mulai dari <b>Transaksi Baru</b>, pindahkan status di <b>Proses Laundry</b>, catat bayar di <b>Pembayaran</b>, lalu cetak nota. Hasilnya terlihat di Dashboard dan Laporan.</p><p class='hint'>Gunakan Pengaturan → Reset data demo untuk mengembalikan data awal.</p>");
A.info=()=>modal("Informasi Aplikasi","<p><b>JagoLaundry</b> versi demo 2.0<br>Data fiktif, tersimpan hanya di browser Anda. Tidak ada login dan tidak ada transaksi sungguhan.</p>");

document.addEventListener("click",e=>{const b=e.target.closest("[data-a]");if(b&&A[b.dataset.a])A[b.dataset.a](b.dataset,b,e)});
const onF=e=>{const t=e.target;if(!t.dataset||!t.dataset.f)return;const[pg,k]=t.dataset.f.split(".");F[pg][k]=t.value;
 if(pg==="rep"&&k==="p"){render();return}const tb=$("#tb");if(tb&&BODY[pg])tb.innerHTML=BODY[pg]()};
document.addEventListener("input",onF);document.addEventListener("change",onF);
document.addEventListener("submit",e=>{const f=e.target;if(f.dataset.s==="toko"){e.preventDefault();Object.assign(S.toko,Object.fromEntries(new FormData(f)));save();render();toast("Pengaturan disimpan")}});
window.addEventListener("hashchange",()=>{A.close();render()});
load();render();
