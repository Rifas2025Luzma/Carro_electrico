(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const n of e.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function r(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();const m={apiKey:"AIzaSyA7irjSjANGeY4iZe80ZuOo_pr3aBhFi5s",authDomain:"rifa-smart-watch.firebaseapp.com",databaseURL:"https://rifa-smart-watch-default-rtdb.firebaseio.com",projectId:"rifa-smart-watch",storageBucket:"rifa-smart-watch.appspot.com",messagingSenderId:"916262944799",appId:"1:916262944799:web:8198492c24022ae398952a",measurementId:"G-YWMZ995XRK"};firebase.initializeApp(m);const o=firebase.database();class h{constructor(){this.participants={},this.DONATION_AMOUNT=5e4,this.initializeApp(),this.setupFirebaseListener(),this.setupImageGallery()}setupImageGallery(){const a=document.querySelectorAll(".hero-image");let s=0;setInterval(()=>{a[s].classList.remove("active"),s=(s+1)%a.length,a[s].classList.add("active")},2e3)}initializeApp(){this.renderProgress(),this.renderParticipantsList(),this.setupEventListeners()}setupFirebaseListener(){o.ref("donations").on("value",s=>{this.participants=s.val()||{},this.renderProgress(),this.renderParticipantsList()})}async updatePaymentStatus(a,s){try{return await o.ref(`donations/${a}`).update({paymentStatus:s}),!0}catch(r){return console.error("Error actualizando estado de pago:",r),!1}}calculateProgress(){const r=Object.keys(this.participants).length/3e3*100;return{percentage:Math.round(r*10)/10}}calculateTotals(){let a=0,s=0;return Object.values(this.participants).forEach(r=>{r.paymentStatus==="nequi"||r.paymentStatus==="other"?a+=this.DONATION_AMOUNT:s+=this.DONATION_AMOUNT}),{totalPaid:a,totalPending:s}}renderProgress(){const a=document.getElementById("progressContainer");if(!a)return;const s=this.calculateProgress();a.innerHTML=`
            <div class="progress-title">Progreso de la Rifa</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${s.percentage}%"></div>
                <div class="progress-text">${s.percentage}% vendido</div>
            </div>
        `}renderParticipantsList(){const a=document.getElementById("participantsList");if(!a)return;const{totalPaid:s,totalPending:r}=this.calculateTotals();a.innerHTML=`
            <h2>Números Registrados</h2>
            <div class="sales-summary">
                <p>Total Vendido: <span class="amount">$${(s+r).toLocaleString()}</span></p>
                <p>Total Pagos: <span class="amount">$${s.toLocaleString()}</span></p>
                <p>Pendiente por Pagar: <span class="amount pending">$${r.toLocaleString()}</span></p>
                <p>Números Vendidos: <span class="amount">${Object.keys(this.participants).length}</span></p>
            </div>
            <table class="participants-table">
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Nequi</th>
                        <th>Otro</th>
                        <th>Pendiente</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.participants).sort(([t],[e])=>parseInt(t)-parseInt(e)).map(([t,e])=>`
                            <tr>
                                <td>${t}</td>
                                <td>${e.name}</td>
                                <td>${e.phone}</td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${t}" 
                                           value="nequi" 
                                           ${e.paymentStatus==="nequi"?"checked":""}
                                           class="payment-radio"
                                           data-number="${t}">
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${t}" 
                                           value="other" 
                                           ${e.paymentStatus==="other"?"checked":""}
                                           class="payment-radio"
                                           data-number="${t}">
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${t}" 
                                           value="pending" 
                                           ${!e.paymentStatus||e.paymentStatus==="pending"?"checked":""}
                                           class="payment-radio"
                                           data-number="${t}">
                                </td>
                            </tr>
                        `).join("")}
                </tbody>
            </table>
        `,document.querySelectorAll(".payment-radio").forEach(t=>{t.addEventListener("change",async e=>{const n=e.target.dataset.number,i=e.target.value;await this.updatePaymentStatus(n,i)})})}generateUniqueNumbers(){const a=new Set(Object.keys(this.participants)),s=[];for(;s.length<2;){const r=Math.floor(Math.random()*1e4).toString().padStart(4,"0");a.has(r)||(s.push(r),a.add(r))}return s}async saveParticipant(a,s,r,t){try{const e={};return t.forEach(n=>{e[`donations/${n}`]={name:a,phone:s,email:r,timestamp:Date.now(),paymentStatus:"pending"}}),await o.ref().update(e),!0}catch(e){return console.error("Error guardando participante:",e),!1}}setupEventListeners(){const a=document.getElementById("buyButton"),s=document.getElementById("registrationModal"),r=document.getElementById("successModal"),t=document.getElementById("registrationForm");a&&a.addEventListener("click",()=>{s.classList.add("active")}),t&&t.addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("name").value,i=document.getElementById("phone").value,l=document.getElementById("email").value,c=this.generateUniqueNumbers();if(await this.saveParticipant(n,i,l,c)){s.classList.remove("active");const p=document.getElementById("assignedNumbers");p.innerHTML=c.map(u=>`<span>${u}</span>`).join(""),r.classList.add("active"),t.reset()}else alert("Error al procesar la donación. Por favor intente nuevamente.")}),window.closeSuccessModal=()=>{r.classList.remove("active")},[s,r].forEach(e=>{e&&e.addEventListener("click",n=>{n.target===e&&e.classList.remove("active")})})}}new h;
