import './style.css';

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA7irjSjANGeY4iZe80ZuOo_pr3aBhFi5s",
    authDomain: "rifa-smart-watch.firebaseapp.com",
    databaseURL: "https://rifa-smart-watch-default-rtdb.firebaseio.com",
    projectId: "rifa-smart-watch",
    storageBucket: "rifa-smart-watch.appspot.com",
    messagingSenderId: "916262944799",
    appId: "1:916262944799:web:8198492c24022ae398952a",
    measurementId: "G-YWMZ995XRK"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

class DonationApp {
    constructor() {
        this.participants = {};
        this.DONATION_AMOUNT = 50000;
        this.initializeApp();
        this.setupFirebaseListener();
        this.setupImageGallery();
    }

    setupImageGallery() {
        const images = document.querySelectorAll('.hero-image');
        let currentIndex = 0;

        setInterval(() => {
            images[currentIndex].classList.remove('active');
            currentIndex = (currentIndex + 1) % images.length;
            images[currentIndex].classList.add('active');
        }, 2000);
    }

    initializeApp() {
        this.renderProgress();
        this.renderParticipantsList();
        this.setupEventListeners();
    }

    setupFirebaseListener() {
        database.ref('donations').on('value', (snapshot) => {
            this.participants = snapshot.val() || {};
            this.renderProgress();
            this.renderParticipantsList();
        });
    }

    async updatePaymentStatus(numbers, status) {
        try {
            const updates = {};
            numbers.forEach(number => {
                updates[`donations/${number}/paymentStatus`] = status;
            });
            await database.ref().update(updates);
            return true;
        } catch (error) {
            console.error("Error actualizando estado de pago:", error);
            return false;
        }
    }

    calculateProgress() {
        const totalNumbers = 3000;
        const soldNumbers = Object.keys(this.participants).length;
        const percentage = (soldNumbers / totalNumbers) * 100;
        return {
            percentage: Math.round(percentage * 10) / 10
        };
    }

    calculateTotals() {
        const groupedParticipants = this.groupParticipantsByPerson();
        let totalPaid = 0;
        let totalPending = 0;

        Object.values(groupedParticipants).forEach(participant => {
            if (participant.paymentStatus === 'nequi' || participant.paymentStatus === 'other') {
                totalPaid += this.DONATION_AMOUNT;
            } else {
                totalPending += this.DONATION_AMOUNT;
            }
        });

        return { totalPaid, totalPending };
    }

    renderProgress() {
        const progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) return;

        const progress = this.calculateProgress();
        
        progressContainer.innerHTML = `
            <div class="progress-title">Progreso de la Rifa</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                <div class="progress-text">${progress.percentage}% vendido</div>
            </div>
        `;
    }

    groupParticipantsByPerson() {
        const grouped = {};
        const processed = new Set();
        
        Object.entries(this.participants).forEach(([number, data]) => {
            if (processed.has(number)) return;
            
            const key = `${data.name}-${data.phone}-${data.email}`;
            const timestamp = data.timestamp;
            
            // Buscar el otro número del mismo bono
            const otherNumber = Object.entries(this.participants).find(([n, d]) => 
                n !== number && 
                !processed.has(n) && 
                d.name === data.name && 
                d.phone === data.phone && 
                d.email === data.email &&
                Math.abs(d.timestamp - timestamp) < 1000 // Mismo momento de compra
            );

            if (otherNumber) {
                grouped[key] = {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    numbers: [number, otherNumber[0]],
                    paymentStatus: data.paymentStatus,
                    timestamp: timestamp
                };
                processed.add(number);
                processed.add(otherNumber[0]);
            } else {
                grouped[key] = {
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    numbers: [number],
                    paymentStatus: data.paymentStatus,
                    timestamp: timestamp
                };
                processed.add(number);
            }
        });
        
        return grouped;
    }

    renderParticipantsList() {
        const participantsList = document.getElementById('participantsList');
        if (!participantsList) return;

        const { totalPaid, totalPending } = this.calculateTotals();
        const groupedParticipants = this.groupParticipantsByPerson();

        participantsList.innerHTML = `
            <h2>Números Registrados</h2>
            <div class="sales-summary">
                <p>Total Vendido: <span class="amount">$${(totalPaid + totalPending).toLocaleString()}</span></p>
                <p>Total Pagos: <span class="amount">$${totalPaid.toLocaleString()}</span></p>
                <p>Pendiente por Pagar: <span class="amount pending">$${totalPending.toLocaleString()}</span></p>
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
                    ${Object.values(groupedParticipants)
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .map(data => `
                            <tr>
                                <td>${data.numbers.sort().join(', ')}</td>
                                <td>${data.name}</td>
                                <td>${data.phone}</td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${data.numbers[0]}" 
                                           value="nequi" 
                                           ${data.paymentStatus === 'nequi' ? 'checked' : ''}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(data.numbers)}'>
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${data.numbers[0]}" 
                                           value="other" 
                                           ${data.paymentStatus === 'other' ? 'checked' : ''}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(data.numbers)}'>
                                </td>
                                <td>
                                    <input type="radio" 
                                           name="payment_${data.numbers[0]}" 
                                           value="pending" 
                                           ${!data.paymentStatus || data.paymentStatus === 'pending' ? 'checked' : ''}
                                           class="payment-radio"
                                           data-numbers='${JSON.stringify(data.numbers)}'>
                                </td>
                            </tr>
                        `).join('')}
                </tbody>
            </table>
        `;

        document.querySelectorAll('.payment-radio').forEach(radio => {
            radio.addEventListener('change', async (e) => {
                const numbers = JSON.parse(e.target.dataset.numbers);
                const status = e.target.value;
                await this.updatePaymentStatus(numbers, status);
            });
        });
    }

    generateUniqueNumbers() {
        const usedNumbers = new Set(Object.keys(this.participants));
        const numbers = [];
        
        while (numbers.length < 2) {
            const num = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            if (!usedNumbers.has(num)) {
                numbers.push(num);
                usedNumbers.add(num);
            }
        }
        
        return numbers;
    }

    async saveParticipant(name, phone, email, numbers) {
        try {
            const timestamp = Date.now();
            const updates = {};
            numbers.forEach(number => {
                updates[`donations/${number}`] = {
                    name,
                    phone,
                    email,
                    timestamp,
                    paymentStatus: 'pending'
                };
            });

            await database.ref().update(updates);
            return true;
        } catch (error) {
            console.error("Error guardando participante:", error);
            return false;
        }
    }

    setupEventListeners() {
        const buyButton = document.getElementById('buyButton');
        const registrationModal = document.getElementById('registrationModal');
        const successModal = document.getElementById('successModal');
        const registrationForm = document.getElementById('registrationForm');

        if (buyButton) {
            buyButton.addEventListener('click', () => {
                registrationModal.classList.add('active');
            });
        }

        if (registrationForm) {
            registrationForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const phone = document.getElementById('phone').value;
                const email = document.getElementById('email').value;

                const numbers = this.generateUniqueNumbers();
                const success = await this.saveParticipant(name, phone, email, numbers);

                if (success) {
                    registrationModal.classList.remove('active');
                    const assignedNumbers = document.getElementById('assignedNumbers');
                    assignedNumbers.innerHTML = numbers.map(n => `<span>${n}</span>`).join('');
                    successModal.classList.add('active');
                    registrationForm.reset();
                } else {
                    alert('Error al procesar la donación. Por favor intente nuevamente.');
                }
            });
        }

        window.closeSuccessModal = () => {
            successModal.classList.remove('active');
        };

        [registrationModal, successModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                    }
                });
            }
        });
    }
}

// Inicializar la aplicación
new DonationApp();
