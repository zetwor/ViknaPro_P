// Contacts page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initMap();
    
    // Phone input mask
    const phoneInput = document.getElementById('contactPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
            e.target.value = !x[2] ? x[1] : '+38 (0' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            // Validate
            if (!validateContactForm(data)) {
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...';
            submitBtn.disabled = true;
            
            // Simulate API call (in real project, replace with actual fetch)
            setTimeout(() => {
                // Success
                showSuccessModal();
                contactForm.reset();
                
                // Restore button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Log data (in real project, send to server)
                console.log('Contact form submitted:', data);
                
                // Send to Telegram (example webhook)
                // sendToTelegram(data);
                
            }, 1500);
        });
    }
    
    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            // Toggle
            question.parentElement.classList.toggle('active');
            
            if (question.parentElement.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                icon.style.transform = 'rotate(0deg)';
                answer.style.maxHeight = '0';
            }
        });
    });
    
    // Subscribe functionality
    const subscribeBtn = document.querySelector('.subscribe-form button');
    const subscribeInput = document.getElementById('subscribe-email-contacts');
    
    if (subscribeBtn && subscribeInput) {
        subscribeBtn.addEventListener('click', function() {
            const email = subscribeInput.value;
            
            if (!validateEmail(email)) {
                showNotification('Будь ласка, введіть коректний email', 'error');
                return;
            }
            
            // Simulate subscription
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            this.disabled = true;
            
            setTimeout(() => {
                showNotification('Дякуємо за підписку!', 'success');
                subscribeInput.value = '';
                this.innerHTML = '<i class="fas fa-paper-plane"></i>';
                this.disabled = false;
            }, 1000);
        });
    }
});

// Map functions
let map;
let marker;

function initMap() {
    // Kyiv coordinates
    const kyivCoords = [50.4501, 30.5234];
    
    // Initialize map
    map = L.map('map').setView(kyivCoords, 15);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add custom marker icon
    const windowIcon = L.divIcon({
        html: '<div style="background: #2563eb; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"><i class="fas fa-window-maximize"></i></div>',
        className: 'custom-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
    
    // Add marker
    marker = L.marker(kyivCoords, { icon: windowIcon }).addTo(map);
    
    // Add popup
    marker.bindPopup(`
        <div style="padding: 10px;">
            <h3 style="margin: 0 0 10px 0; color: #2563eb;">Вікна Престиж</h3>
            <p style="margin: 0 0 5px 0;">м. Київ, вул. Хрещатик, 44</p>
            <p style="margin: 0; color: #666;">Пн-Нд: 8:00 - 20:00</p>
        </div>
    `).openPopup();
    
    // Add circle for visual effect
    L.circle(kyivCoords, {
        color: '#2563eb',
        fillColor: '#2563eb',
        fillOpacity: 0.1,
        radius: 200
    }).addTo(map);
}

function showOnMap() {
    if (map && marker) {
        map.setView(marker.getLatLng(), 18);
        marker.openPopup();
    }
}

function getDirections() {
    // Open Google Maps with directions
    const address = encodeURIComponent('Київ, Хрещатик, 44');
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');
}

// Form validation
function validateContactForm(data) {
    // Check required fields
    if (!data.name || !data.phone) {
        showNotification('Будь ласка, заповніть обов\'язкові поля', 'error');
        return false;
    }
    
    // Validate phone
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
        showNotification('Будь ласка, введіть коректний номер телефону', 'error');
        return false;
    }
    
    // Validate email if provided
    if (data.email && !validateEmail(data.email)) {
        showNotification('Будь ласка, введіть коректний email', 'error');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Notification system
function showNotification(message, type = 'success') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 20px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-xl);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
            border-left: 4px solid;
            max-width: 400px;
        }
        
        .notification.success {
            border-left-color: var(--success);
        }
        
        .notification.error {
            border-left-color: var(--danger);
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .notification-content i {
            font-size: 1.2rem;
        }
        
        .notification.success .notification-content i {
            color: var(--success);
        }
        
        .notification.error .notification-content i {
            color: var(--danger);
        }
        
        .notification-close {
            background: none;
            border: none;
            color: var(--gray);
            cursor: pointer;
            padding: 5px;
            font-size: 0.9rem;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 5000);
    
    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
        style.remove();
    });
}

// Success modal
function showSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Send to Telegram (example webhook)
function sendToTelegram(data) {
    const botToken = 'YOUR_BOT_TOKEN';
    const chatId = 'YOUR_CHAT_ID';
    
    const message = `
📩 Нова заявка з контактної форми:
    
👤 Ім'я: ${data.name}
📞 Телефон: ${data.phone}
📧 Email: ${data.email || 'Не вказано'}
🏷 Тема: ${data.subject || 'Не вказано'}
💬 Повідомлення: ${data.message || 'Не вказано'}
    
⏰ Час: ${new Date().toLocaleString('uk-UA')}
    `;
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    }).catch(error => {
        console.error('Telegram error:', error);
    });
}

// Subscribe function for contacts page
function subscribeNewsletterContacts() {
    const emailInput = document.getElementById('subscribe-email-contacts');
    const email = emailInput.value;
    
    if (!validateEmail(email)) {
        showNotification('Будь ласка, введіть коректний email', 'error');
        return;
    }
    
    const btn = document.querySelector('.subscribe-form button');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    btn.disabled = true;
    
    setTimeout(() => {
        showNotification('Дякуємо за підписку!', 'success');
        emailInput.value = '';
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        btn.disabled = false;
    }, 1000);
}