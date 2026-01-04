// ===========================================
// DOM Elements
// ===========================================
const preloader = document.querySelector('.preloader');
const header = document.querySelector('.header');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const scrollTopBtn = document.querySelector('.scroll-top');
const modal = document.getElementById('successModal');
const successClose = document.querySelector('.success-modal .btn-primary');
const phoneInputs = document.querySelectorAll('input[type="tel"]');
const scrollIndicator = document.querySelector('.scroll-indicator');
const animatedElements = document.querySelectorAll('.process-step, .testimonial-card');
const currentYearElement = document.querySelector('.current-year');
const statNumbers = document.querySelectorAll('.stat-number');
const ctaForm = document.querySelector('.cta-form');
const ctaName = document.getElementById('cta-name');
const ctaPhone = document.getElementById('cta-phone');
const subscribeForm = document.querySelector('.subscribe-form');
const subscribeEmail = document.getElementById('subscribe-email');
const faqQuestions = document.querySelectorAll('.faq-question');
const readMoreButtons = document.querySelectorAll('.btn-read-more');

// ===========================================
// Phone Input Mask
// ===========================================
phoneInputs.forEach(input => {
    input.addEventListener('input', function(e) {
        let x = e.target.value.replace(/\D/g, '').match(/(\d{0,3})(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
        e.target.value = !x[2] ? x[1] : '+38 (0' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '') + (x[4] ? '-' + x[4] : '') + (x[5] ? '-' + x[5] : '');
    });
});

// ===========================================
// Preloader
// ===========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.classList.add('hidden');
        
        // Запуск анімацій при завантаженні
        checkAnimation();
        
        // Анімація статистики
        animateStats();
    }, 1000);
});

// ===========================================
// Mobile Menu Toggle
// ===========================================
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Закриття меню при кліку на посилання
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Закриття меню при кліку поза ним
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===========================================
// Header Scroll Effect
// ===========================================
window.addEventListener('scroll', () => {
    // Додаємо клас scrolled до header
    if (header) {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
    
    // Показуємо/ховаємо кнопку "наверх"
    if (scrollTopBtn) {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    }
    
    // Активне посилання в навігації
    updateActiveNavLink();
    
    // Анімації при скролі
    checkAnimation();
    
    // Parallax ефект для секцій
    updateParallax();
});

// ===========================================
// Scroll to Top
// ===========================================
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===========================================
// Scroll Indicator
// ===========================================
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', (e) => {
        e.preventDefault();
        const advantagesSection = document.getElementById('advantages');
        if (advantagesSection) {
            advantagesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}

// ===========================================
// Smooth Scrolling for Anchor Links
// ===========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            
            // Закриття мобільного меню
            if (navMenu && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// ===========================================
// Active Navigation Link
// ===========================================
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// ===========================================
// Success Modal Functions
// ===========================================
function submitCtaForm() {
    const name = ctaName ? ctaName.value.trim() : '';
    const phone = ctaPhone ? ctaPhone.value.trim() : '';
    
    if (!name || !phone) {
        showNotification('Будь ласка, заповніть всі поля', 'error');
        return;
    }
    
    // Валідація телефону
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 12) {
        showNotification('Будь ласка, введіть коректний номер телефону', 'error');
        return;
    }
    
    console.log('CTA Форма відправлена:', { name, phone });
    
    // Показуємо модальне вікно
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Очищаємо поля
    if (ctaName) ctaName.value = '';
    if (ctaPhone) ctaPhone.value = '';
    
    // Імітація відправки на сервер
    setTimeout(() => {
        console.log('Дані успішно відправлені на сервер');
    }, 1000);
}

function closeSuccessModal() {
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Закриття по кліку на кнопку
if (successClose) {
    successClose.addEventListener('click', closeSuccessModal);
}

// Закриття по кліку поза модального вікна
if (modal) {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSuccessModal();
        }
    });
}

// Закриття по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
        closeSuccessModal();
    }
});

// ===========================================
// Newsletter Subscription
// ===========================================
function subscribeNewsletter() {
    const email = subscribeEmail ? subscribeEmail.value.trim() : '';
    
    if (!email) {
        showNotification('Будь ласка, введіть email', 'error');
        return;
    }
    
    // Валідація email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Будь ласка, введіть коректний email', 'error');
        return;
    }
    
    console.log('Підписка на новини:', email);
    
    // Показуємо повідомлення про успіх
    showNotification('Дякуємо за підписку!', 'success');
    
    // Очищаємо поле
    if (subscribeEmail) subscribeEmail.value = '';
    
    // Імітація відправки на сервер
    setTimeout(() => {
        console.log('Email додано до розсилки');
    }, 1000);
}

// ===========================================
// FAQ Accordion
// ===========================================
if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const icon = question.querySelector('i');
            
            // Закриваємо всі інші елементи
            document.querySelectorAll('.faq-item').forEach(item => {
                if (item !== faqItem) {
                    item.classList.remove('active');
                    const otherAnswer = item.querySelector('.faq-answer');
                    const otherIcon = item.querySelector('.faq-question i');
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                    if (otherIcon) {
                        otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
            
            // Перемикаємо поточний елемент
            faqItem.classList.toggle('active');
            
            if (faqItem.classList.contains('active')) {
                if (answer) {
                    answer.style.maxHeight = answer.scrollHeight + 'px';
                }
                if (icon) {
                    icon.style.transform = 'rotate(180deg)';
                }
            } else {
                if (answer) {
                    answer.style.maxHeight = null;
                }
                if (icon) {
                    icon.style.transform = 'rotate(0deg)';
                }
            }
        });
    });
}

// ===========================================
// Testimonials Read More
// ===========================================
if (readMoreButtons.length > 0) {
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const testimonialCard = this.closest('.testimonial-card');
            const textElement = testimonialCard.querySelector('.testimonial-text');
            const icon = this.querySelector('i');
            
            if (textElement.classList.contains('expanded')) {
                textElement.classList.remove('expanded');
                this.innerHTML = '<i class="fas fa-chevron-down"></i> Читати далі';
                this.classList.remove('active');
                
                // Плавна прокрутка назад до картки
                testimonialCard.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'nearest'
                });
            } else {
                textElement.classList.add('expanded');
                this.innerHTML = '<i class="fas fa-chevron-up"></i> Згорнути';
                this.classList.add('active');
            }
        });
    });
}

// ===========================================
// Animate Statistics
// ===========================================
function animateStats() {
    if (statNumbers.length === 0) return;
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        if (isNaN(target)) return;
        
        const duration = 2000;
        const startTime = Date.now();
        
        function updateCounter() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(easeOutQuart * target);
            
            stat.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                stat.textContent = target.toLocaleString();
            }
        }
        
        updateCounter();
    });
}

// ===========================================
// Scroll Animations
// ===========================================
function checkAnimation() {
    if (animatedElements.length === 0) return;
    
    const windowHeight = window.innerHeight;
    
    animatedElements.forEach((element, index) => {
        const elementTop = element.getBoundingClientRect().top;
        
        if (elementTop < windowHeight - 100) {
            const delay = index * 100;
            
            setTimeout(() => {
                element.style.animation = 'fadeInUp 0.6s ease forwards';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, delay);
        }
    });
}

// ===========================================
// Parallax Effect
// ===========================================
function updateParallax() {
    const scrolled = window.pageYOffset;
    
    // Ефект для секції процесу
    const processSection = document.querySelector('.process');
    if (processSection) {
        const processRect = processSection.getBoundingClientRect();
        if (processRect.top < window.innerHeight && processRect.bottom > 0) {
            const processCards = processSection.querySelectorAll('.process-step');
            processCards.forEach((card, index) => {
                const speed = (index % 2 === 0) ? 0.05 : -0.05;
                card.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }
    }
    
    // Ефект для секції відгуків
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
        const testimonialsRect = testimonialsSection.getBoundingClientRect();
        if (testimonialsRect.top < window.innerHeight && testimonialsRect.bottom > 0) {
            const quoteIcons = testimonialsSection.querySelectorAll('.quote-icon');
            quoteIcons.forEach(icon => {
                icon.style.transform = `translateY(${scrolled * 0.02}px) rotate(${scrolled * 0.01}deg)`;
            });
        }
    }
}

// ===========================================
// Current Year in Footer
// ===========================================
if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
}

// ===========================================
// Notification System
// ===========================================
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.custom-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `custom-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                z-index: 9999;
                animation: slideInRight 0.3s ease;
                border-left: 4px solid;
                max-width: 400px;
                transform: translateX(0);
            }
            
            .custom-notification.success {
                border-left-color: #10b981;
            }
            
            .custom-notification.error {
                border-left-color: #ef4444;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
                flex: 1;
            }
            
            .notification-content i {
                font-size: 1.2rem;
            }
            
            .custom-notification.success .notification-content i {
                color: #10b981;
            }
            
            .custom-notification.error .notification-content i {
                color: #ef4444;
            }
            
            .notification-content span {
                color: #1e293b;
                font-size: 0.95rem;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #64748b;
                cursor: pointer;
                padding: 5px;
                font-size: 0.9rem;
                transition: color 0.3s ease;
            }
            
            .notification-close:hover {
                color: #1e293b;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @media (max-width: 768px) {
                .custom-notification {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    const removeTimeout = setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
    
    // Close button handler
    notification.querySelector('.notification-close').addEventListener('click', () => {
        clearTimeout(removeTimeout);
        notification.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
}

// ===========================================
// Form Validation
// ===========================================
function validateForm(form) {
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        // Clear previous error styles
        input.style.borderColor = '';
        
        // Remove existing error messages
        const existingError = input.parentElement.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        
        // Check if field is empty
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ef4444';
            
            // Add error message
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.style.color = '#ef4444';
            errorMessage.style.fontSize = '0.85rem';
            errorMessage.style.marginTop = '5px';
            errorMessage.textContent = 'Це поле обов\'язкове для заповнення';
            input.parentElement.appendChild(errorMessage);
            
            // Focus on first invalid field
            if (isValid === false) {
                input.focus();
            }
        }
    });
    
    return isValid;
}

// ===========================================
// Initialize Form Handlers
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // CTA Form
    if (ctaForm) {
        const ctaSubmitBtn = ctaForm.querySelector('.btn-primary');
        if (ctaSubmitBtn) {
            ctaSubmitBtn.addEventListener('click', submitCtaForm);
        }
    }
    
    // Newsletter Form
    if (subscribeForm) {
        const subscribeBtn = subscribeForm.querySelector('.btn-primary');
        if (subscribeBtn) {
            subscribeBtn.addEventListener('click', subscribeNewsletter);
        }
        
        // Allow Enter key to submit
        if (subscribeEmail) {
            subscribeEmail.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    subscribeNewsletter();
                }
            });
        }
    }
    
    // Initialize active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop();
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if ((currentPage === '' || currentPage === 'index.html') && linkHref === 'index.html') {
            link.classList.add('active');
        } else if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Initialize animations
    checkAnimation();
    
    // Set current year in footer
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    // Add hover effects to process steps
    const processSteps = document.querySelectorAll('.process-step');
    processSteps.forEach(step => {
        step.addEventListener('mouseenter', () => {
            step.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        step.addEventListener('mouseleave', () => {
            step.style.transform = '';
        });
    });
    
    // Add hover effects to testimonial cards
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    testimonialCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Interactive rating stars
    const ratingStars = document.querySelectorAll('.client-rating');
    ratingStars.forEach(rating => {
        const stars = rating.querySelectorAll('i');
        
        stars.forEach(star => {
            star.addEventListener('mouseover', function() {
                const index = Array.from(stars).indexOf(this);
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.style.transform = 'scale(1.2)';
                        s.style.color = '#fbbf24';
                    }
                });
            });
            
            star.addEventListener('mouseout', function() {
                stars.forEach(s => {
                    s.style.transform = 'scale(1)';
                    s.style.color = '';
                });
            });
        });
    });
    
    // Process step dots animation
    const stepDots = document.querySelectorAll('.step-dots span');
    stepDots.forEach(dot => {
        dot.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.5)';
            this.style.opacity = '1';
            this.style.background = '#2563eb';
        });
        
        dot.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '0.3';
            this.style.background = '#60a5fa';
        });
    });
    
    // Interactive step icons
    const stepIcons = document.querySelectorAll('.step-icon');
    stepIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(10deg)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });
    
    // Add click handlers for all CTA buttons
    document.querySelectorAll('.btn-primary').forEach(button => {
        if (!button.hasAttribute('onclick') && button.textContent.includes('замір') || 
            button.textContent.includes('Замовити') || 
            button.textContent.includes('Розрахувати')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                showNotification('Функція замовити замір активована! Наш менеджер зв\'яжеться з вами.', 'success');
            });
        }
    });
    
    // Initialize stats animation when they become visible
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsSection = document.querySelector('.statistics');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// ===========================================
// Window Load Handler
// ===========================================
window.addEventListener('load', () => {
    // Final initialization after everything is loaded
    setTimeout(() => {
        // Trigger animations for elements already in view
        checkAnimation();
        
        // Update parallax effect
        updateParallax();
        
        // Make sure footer year is set
        if (currentYearElement && !currentYearElement.textContent) {
            currentYearElement.textContent = new Date().getFullYear();
        }
    }, 500);
});

// ===========================================
// Make Functions Available Globally
// ===========================================
window.submitCtaForm = submitCtaForm;
window.closeSuccessModal = closeSuccessModal;
window.subscribeNewsletter = subscribeNewsletter;
window.readMore = function(button) {
    const testimonialCard = button.closest('.testimonial-card');
    const textElement = testimonialCard.querySelector('.testimonial-text');
    const icon = button.querySelector('i');
    
    if (textElement.classList.contains('expanded')) {
        textElement.classList.remove('expanded');
        button.innerHTML = '<i class="fas fa-chevron-down"></i> Читати далі';
        button.classList.remove('active');
        
        // Плавна прокрутка назад до картки
        testimonialCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest'
        });
    } else {
        textElement.classList.add('expanded');
        button.innerHTML = '<i class="fas fa-chevron-up"></i> Згорнути';
        button.classList.add('active');
    }
};

// ===========================================
// Error Boundary (for debugging)
// ===========================================
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.message, e.filename, e.lineno);
    // You could send this to an error tracking service
});

// ===========================================
// Performance Monitoring
// ===========================================
window.addEventListener('load', () => {
    setTimeout(() => {
        const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
        
        // Log if any images failed to load
        document.querySelectorAll('img').forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                console.warn('Image failed to load:', img.src);
            }
        });
    }, 0);
});

// ===========================================
// Responsive Adjustments
// ===========================================
function handleResponsiveChanges() {
    const isMobile = window.innerWidth <= 768;
    
    // Adjust animation delays for mobile
    if (isMobile) {
        animatedElements.forEach(el => {
            el.style.animationDelay = '0s';
        });
    }
    
    // Adjust parallax intensity for mobile
    if (isMobile) {
        window.removeEventListener('scroll', updateParallax);
    } else {
        window.addEventListener('scroll', updateParallax);
    }
}

// Initial call
handleResponsiveChanges();

// Update on resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResponsiveChanges, 250);
});

// ===========================================
// Service Worker Registration (for PWA)
// ===========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

// ===========================================
// Back to Top Button Enhancement
// ===========================================
if (scrollTopBtn) {
    scrollTopBtn.addEventListener('mouseenter', () => {
        scrollTopBtn.style.transform = 'translateY(-3px)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', () => {
        if (!scrollTopBtn.classList.contains('visible')) {
            scrollTopBtn.style.transform = 'translateY(20px)';
        } else {
            scrollTopBtn.style.transform = 'translateY(0)';
        }
    });
}

// ===========================================
// Keyboard Navigation Support
// ===========================================
document.addEventListener('keydown', (e) => {
    // Close modal with Escape
    if (e.key === 'Escape') {
        if (modal && modal.classList.contains('active')) {
            closeSuccessModal();
        }
    }
    
    // Navigate through FAQ with arrow keys
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        const activeFaq = document.querySelector('.faq-question:focus');
        if (activeFaq) {
            e.preventDefault();
            const allFaqs = Array.from(document.querySelectorAll('.faq-question'));
            const currentIndex = allFaqs.indexOf(activeFaq);
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < allFaqs.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : allFaqs.length - 1;
            }
            
            allFaqs[nextIndex].focus();
        }
    }
});

// ===========================================
// Touch Device Detection
// ===========================================
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
if (isTouchDevice) {
    document.body.classList.add('touch-device');
    
    // Disable hover effects on touch devices after first touch
    let touched = false;
    document.addEventListener('touchstart', () => {
        if (!touched) {
            document.body.classList.add('touch-active');
            touched = true;
        }
    }, { once: true });
}

// ===========================================
// Print Styles (optional)
// ===========================================
window.addEventListener('beforeprint', () => {
    // Hide elements that shouldn't be printed
    document.querySelectorAll('.no-print').forEach(el => {
        el.style.display = 'none';
    });
});

window.addEventListener('afterprint', () => {
    // Restore elements after printing
    document.querySelectorAll('.no-print').forEach(el => {
        el.style.display = '';
    });
});

// ===========================================
// Final Export
// ===========================================
// Ensure all functions are available
console.log('Windows Prestige script loaded successfully');

// Performance optimization: Use passive listeners for scroll events
document.addEventListener('DOMContentLoaded', () => {
    const options = {
        passive: true,
        capture: false
    };
    
    // Update event listeners to use passive where possible
    window.addEventListener('scroll', () => {
        // Scroll handlers are already passive by default
    }, options);
});