document.addEventListener('DOMContentLoaded', function() {
    initFeedbackForm();
    initPhoneMask();
});

function initFeedbackForm() {
    const form = document.getElementById('feedbackFormElement');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitFeedbackForm(this);
    });
}

function submitFeedbackForm(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    
    if (!validateFormData(data)) {
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...';
    submitBtn.disabled = true;
    
    fetch('submit_feedback.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showSuccessModal(result.data);
            form.reset();
        } else {
            showNotification(result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Помилка:', error);
        showNotification('Помилка мережі. Спробуйте ще раз.', 'error');
    })
    .finally(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    });
}

function validateFormData(data) {
    if (!data.name || !data.phone || !data.service) {
        showNotification('Заповніть обов\'язкові поля', 'error');
        return false;
    }
    
    const phoneDigits = data.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
        showNotification('Введіть коректний номер телефону', 'error');
        return false;
    }
    
    if (data.email && !validateEmail(data.email)) {
        showNotification('Введіть коректний email', 'error');
        return false;
    }
    
    if (!data.privacy_policy) {
        showNotification('Погодьтесь з обробкою персональних даних', 'error');
        return false;
    }
    
    return true;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function initPhoneMask() {
    const phoneInput = document.getElementById('feedbackPhone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
        let value = this.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (!value.startsWith('380') && !value.startsWith('38')) {
                value = '38' + value;
            }
            
            let formatted = '+38 (0';
            
            if (value.length > 2) formatted += value.substring(2, 5);
            if (value.length > 5) formatted += ') ' + value.substring(5, 8);
            if (value.length > 8) formatted += '-' + value.substring(8, 10);
            if (value.length > 10) formatted += '-' + value.substring(10, 12);
            
            this.value = formatted;
        }
    });
}

function showSuccessModal(data) {
    const modal = document.getElementById('successModal');
    if (!modal) return;
    
    const modalContent = modal.querySelector('.modal-content');
    const title = modalContent.querySelector('h3');
    const message = modalContent.querySelector('p');
    
    if (title) title.textContent = 'Заявка успішно відправлена!';
    if (message) {
        message.innerHTML = `
            Номер заявки: <strong class="request-id">${data.id}</strong><br>
            Ми зв'яжемося з вами протягом 15 хвилин
        `;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) notification.remove();
    }, 5000);
}

window.closeSuccessModal = function() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};