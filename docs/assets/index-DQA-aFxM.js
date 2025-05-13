(function(){const a=document.createElement("link").relList;if(a&&a.supports&&a.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))r(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const n of e.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&r(n)}).observe(document,{childList:!0,subtree:!0});function s(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function r(t){if(t.ep)return;t.ep=!0;const e=s(t);fetch(t.href,e)}})();const h={apiKey:"AIzaSyA7irjSjANGeY4iZe80ZuOo_pr3aBhFi5s",authDomain:"rifa-smart-watch.firebaseapp.com",databaseURL:"https://rifa-smart-watch-default-rtdb.firebaseio.com",projectId:"rifa-smart-watch",storageBucket:"rifa-smart-watch.appspot.com",messagingSenderId:"916262944799",appId:"1:916262944799:web:8198492c24022ae398952a",measurementId:"G-YWMZ995XRK"};firebase.initializeApp(h);const l=firebase.database();class g{constructor(){this.participants={},this.DONATION_AMOUNT=5e4,this.initializeApp(),this.setupFirebaseListener(),this.setupImageGallery()}setupImageGallery(){const a=document.querySelectorAll(".hero-image");let s=0;setInterval(()=>{a[s].classList.remove("active"),s=(s+1)%a.length,a[s].classList.add("active")},2e3)}initializeApp(){this.renderProgress(),this.renderParticipantsList(),this.setupEventListeners()}setupFirebaseListener(){l.ref("donations").on("value",a=>{this.participants=a.val()||{},this.renderProgress(),this.renderParticipantsList()})}async updatePaymentStatus(a,s){try{const r={};return a.forEach(t=>{r[`donations/${t}/paymentStatus`]=s}),await l.ref().update(r),!0}catch(r){return console.error("Error actualizando estado de pago:",r),!1}}calculateProgress(){const r=Object.keys(this.participants).length/3e3*100;return{percentage:Math.round(r*10)/10}}calculateTotals(){const a=this.groupParticipantsByPerson();let s=0,r=0;return Object.values(a).forEach(t=>{t.paymentStatus==="nequi"||t.paymentStatus==="other"?s+=this.DONATION_AMOUNT:r+=this.DONATION_AMOUNT}),{totalPaid:s,totalPending:r}}renderProgress(){const a=document.getElementById("progressContainer");if(!a)return;const s=this.calculateProgress();a.innerHTML=`
            <div class="progress-title">Progreso de la Rifa</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${s.percentage}%"></div>
                <div class="progress-text">${s.percentage}% vendido</div>
            </div>
        `}groupParticipantsByPerson(){const a={},s=new Set,r=Object.entries(this.participants).sort((t,e)=>t[1].timestamp-e[1].timestamp);for(let t=0;t<r.length;t++){const[e,n]=r[t];if(s.has(e))continue;const o=`${n.name}-${n.phone}-${n.email}-${n.timestamp}`,i=r[t+1];i&&!s.has(i[0])&&i[1].name===n.name&&i[1].phone===n.phone&&i[1].email===n.email&&i[1].timestamp===n.timestamp?(a[o]={name:n.name,phone:n.phone,email:n.email,numbers:[e,i[0]],paymentStatus:n.paymentStatus,timestamp:n.timestamp},s.add(e),s.add(i[0]),t++):(a[o]={name:n.name,phone:n.phone,email:n.email,numbers:[e],paymentStatus:n.paymentStatus,timestamp:n.timestamp},s.add(e))}return a}renderParticipantsList(){const a=document.getElementById("participantsList");if(!a)return;const{totalPaid:s,totalPending:r}=this.calculateTotals(),t=this.groupParticipantsByPerson();a.innerHTML=`
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
                    ${Object.values(t).sort((e,n)=>e.timestamp-n.timestamp).map(e=>`
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
        `,document.querySelectorAll(".payment-radio").forEach(e=>{e.addEventListener("change",async n=>{const o=JSON.parse(n.target.dataset.numbers),i=n.target.value;await this.updatePaymentStatus(o,i)})})}generateUniqueNumbers(){const a=new Set(Object.keys(this.participants)),s=[];for(;s.length<2;){const r=Math.floor(Math.random()*1e4).toString().padStart(4,"0");a.has(r)||(s.push(r),a.add(r))}return s}generateTicketImage(a,s,r){const t=document.createElement("canvas"),e=t.getContext("2d");return t.width=800,t.height=400,e.fillStyle="#ffffff",e.fillRect(0,0,t.width,t.height),e.strokeStyle="#2ecc71",e.lineWidth=10,e.strokeRect(5,5,t.width-10,t.height-10),e.fillStyle="#2c3e50",e.textAlign="center",e.font="bold 40px Inter",e.fillText("Bono Donación Kiwo",t.width/2,80),e.font="24px Inter",e.fillText(`Nombre: ${a}`,t.width/2,150),e.fillText(`Teléfono: ${s}`,t.width/2,190),e.font="bold 36px Inter",e.fillStyle="#27ae60",e.fillText("Números asignados:",t.width/2,250),e.font="bold 48px Inter",e.fillText(r.join(" - "),t.width/2,310),e.font="20px Inter",e.fillStyle="#2c3e50",e.fillText("Sorteo: Sábado 24 de agosto - Lotería de Boyacá",t.width/2,370),t.toDataURL("image/png")}downloadTicket(a,s){const r=document.createElement("a");r.download=`bono-donacion-${s.toLowerCase().replace(/\s+/g,"-")}.png`,r.href=a,r.click()}async saveParticipant(a,s,r,t){try{const e=Date.now(),n={};return t.forEach(o=>{n[`donations/${o}`]={name:a,phone:s,email:r,timestamp:e,paymentStatus:"pending"}}),await l.ref().update(n),!0}catch(e){return console.error("Error guardando participante:",e),!1}}setupEventListeners(){const a=document.getElementById("buyButton"),s=document.getElementById("registrationModal"),r=document.getElementById("successModal"),t=document.getElementById("registrationForm");a&&a.addEventListener("click",()=>{s.classList.add("active")}),t&&t.addEventListener("submit",async e=>{e.preventDefault();const n=document.getElementById("name").value,o=document.getElementById("phone").value,i=document.getElementById("email").value,c=this.generateUniqueNumbers();if(await this.saveParticipant(n,o,i,c)){s.classList.remove("active");const p=document.getElementById("assignedNumbers");p.innerHTML=c.map(u=>`<span>${u}</span>`).join(""),r.classList.add("active");const m=this.generateTicketImage(n,o,c);this.downloadTicket(m,n),t.reset()}else alert("Error al procesar la donación. Por favor intente nuevamente.")}),window.closeSuccessModal=()=>{r.classList.remove("active")},[s,r].forEach(e=>{e&&e.addEventListener("click",n=>{n.target===e&&e.classList.remove("active")})})}}new g;
