(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const a of e.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&r(a)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function r(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();const l={apiKey:"AIzaSyA7irjSjANGeY4iZe80ZuOo_pr3aBhFi5s",authDomain:"rifa-smart-watch.firebaseapp.com",databaseURL:"https://rifa-smart-watch-default-rtdb.firebaseio.com",projectId:"rifa-smart-watch",storageBucket:"rifa-smart-watch.appspot.com",messagingSenderId:"916262944799",appId:"1:916262944799:web:8198492c24022ae398952a",measurementId:"G-YWMZ995XRK"};firebase.initializeApp(l);const c=firebase.database();class h{constructor(){this.participants={},this.DONATION_AMOUNT=5e4,this.initializeApp(),this.setupFirebaseListener(),this.setupImageGallery()}setupImageGallery(){const n=document.querySelectorAll(".hero-image");let s=0;setInterval(()=>{n[s].classList.remove("active"),s=(s+1)%n.length,n[s].classList.add("active")},2e3)}initializeApp(){this.renderProgress(),this.renderParticipantsList(),this.setupEventListeners()}setupFirebaseListener(){c.ref("donations").on("value",n=>{this.participants=n.val()||{},this.renderProgress(),this.renderParticipantsList()})}async updatePaymentStatus(n,s){try{const r={};return n.forEach(t=>{r[`donations/${t}/paymentStatus`]=s}),await c.ref().update(r),!0}catch(r){return console.error("Error actualizando estado de pago:",r),!1}}calculateProgress(){const r=Object.keys(this.participants).length/3e3*100;return{percentage:Math.round(r*10)/10}}calculateTotals(){const n=this.groupParticipantsByPerson();let s=0,r=0;return Object.values(n).forEach(t=>{t.paymentStatus==="nequi"||t.paymentStatus==="other"?s+=this.DONATION_AMOUNT:r+=this.DONATION_AMOUNT}),{totalPaid:s,totalPending:r}}renderProgress(){const n=document.getElementById("progressContainer");if(!n)return;const s=this.calculateProgress();n.innerHTML=`
            <div class="progress-title">Progreso de la Rifa</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${s.percentage}%"></div>
                <div class="progress-text">${s.percentage}% vendido</div>
            </div>
        `}groupParticipantsByPerson(){const n={},s=new Set,r=Object.entries(this.participants).sort((t,e)=>t[1].timestamp-e[1].timestamp);for(let t=0;t<r.length;t++){const[e,a]=r[t];if(s.has(e))continue;const o=`${a.name}-${a.phone}-${a.email}-${a.timestamp}`,i=r[t+1];i&&!s.has(i[0])&&i[1].name===a.name&&i[1].phone===a.phone&&i[1].email===a.email&&i[1].timestamp===a.timestamp?(n[o]={name:a.name,phone:a.phone,email:a.email,numbers:[e,i[0]],paymentStatus:a.paymentStatus,timestamp:a.timestamp},s.add(e),s.add(i[0]),t++):(n[o]={name:a.name,phone:a.phone,email:a.email,numbers:[e],paymentStatus:a.paymentStatus,timestamp:a.timestamp},s.add(e))}return n}renderParticipantsList(){const n=document.getElementById("participantsList");if(!n)return;const{totalPaid:s,totalPending:r}=this.calculateTotals(),t=this.groupParticipantsByPerson();n.innerHTML=`
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
                        <th>Números</th>
                        <th>Nombre</th>
                        <th>Teléfono</th>
                        <th>Nequi</th>
                        <th>Otro</th>
                        <th>Pendiente</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.values(t).sort((e,a)=>e.timestamp-a.timestamp).map(e=>`
                            <tr>
                                <td>${e.numbers.sort().join(", ")}</td>
                                <td>${e.name}</td>
                                <td>${e.phone}</td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${e.numbers[0]}" 
                                           value="nequi" 
                                           ${e.paymentStatus==="nequi"?"checked":""}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(e.numbers)}'>
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${e.numbers[0]}" 
                                           value="other" 
                                           ${e.paymentStatus==="other"?"checked":""}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(e.numbers)}'>
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${e.numbers[0]}" 
                                           value="pending" 
                                           ${!e.paymentStatus||e.paymentStatus==="pending"?"checked":""}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(e.numbers)}'>
                                </td>
                            </tr>
                        `).join("")}
                </tbody>
            </table>
        `,document.querySelectorAll(".payment-radio").forEach(e=>{e.addEventListener("change",async a=>{const o=JSON.parse(a.target.dataset.numbers),i=a.target.value;await this.updatePaymentStatus(o,i)})})}generateUniqueNumbers(){const n=new Set(Object.keys(this.participants)),s=[];for(;s.length<2;){const r=Math.floor(Math.random()*1e4).toString().padStart(4,"0");n.has(r)||(s.push(r),n.add(r))}return s}async saveParticipant(n,s,r,t){try{const e=Date.now(),a={};return t.forEach(o=>{a[`donations/${o}`]={name:n,phone:s,email:r,timestamp:e,paymentStatus:"pending"}}),await c.ref().update(a),!0}catch(e){return console.error("Error guardando participante:",e),!1}}setupEventListeners(){const n=document.getElementById("buyButton"),s=document.getElementById("registrationModal"),r=document.getElementById("successModal"),t=document.getElementById("registrationForm");n&&n.addEventListener("click",()=>{s.classList.add("active")}),t&&t.addEventListener("submit",async e=>{e.preventDefault();const a=document.getElementById("name").value,o=document.getElementById("phone").value,i=document.getElementById("email").value,p=this.generateUniqueNumbers();if(await this.saveParticipant(a,o,i,p)){s.classList.remove("active");const m=document.getElementById("assignedNumbers");m.innerHTML=p.map(d=>`<span>${d}</span>`).join(""),r.classList.add("active"),t.reset()}else alert("Error al procesar la donación. Por favor intente nuevamente.")}),window.closeSuccessModal=()=>{r.classList.remove("active")},[s,r].forEach(e=>{e&&e.addEventListener("click",a=>{a.target===e&&e.classList.remove("active")})})}}new h;
