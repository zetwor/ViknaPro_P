// Process page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('i');
            
            // Close all other FAQ items
            faqQuestions.forEach(otherQuestion => {
                if (otherQuestion !== question) {
                    const otherAnswer = otherQuestion.nextElementSibling;
                    const otherIcon = otherQuestion.querySelector('i');
                    otherQuestion.parentElement.classList.remove('active');
                    otherIcon.style.transform = 'rotate(0deg)';
                    otherAnswer.style.maxHeight = '0';
                }
            });
            
            // Toggle current FAQ item
            question.parentElement.classList.toggle('active');
            
            // Toggle icon and answer
            if (question.parentElement.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                icon.style.transform = 'rotate(0deg)';
                answer.style.maxHeight = '0';
            }
        });
    });
    
    // Timeline animation on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    });
    
    timelineItems.forEach(item => {
        observer.observe(item);
    });
    
    // Add CSS for animation
    const style = document.createElement('style');
    style.textContent = `
        .timeline-item {
            opacity: 0;
            transform: translateX(-20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .timeline-item:nth-child(even) {
            transform: translateX(20px);
        }
        
        .timeline-item.animated {
            opacity: 1;
            transform: translateX(0);
        }
        
        .timeline-content {
            transition: all 0.3s ease;
        }
        
        .step-image img {
            transition: transform 0.5s ease;
        }
        
        .timeline-content:hover .step-image img {
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
    
    // Print timeline functionality
    const printButton = document.createElement('button');
    printButton.className = 'btn btn-secondary';
    printButton.innerHTML = '<i class="fas fa-print"></i> Роздрукувати процес';
    printButton.style.margin = '30px auto';
    printButton.style.display = 'block';
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    // Insert print button after timeline
    const timelineSection = document.querySelector('.process-timeline-section');
    if (timelineSection) {
        timelineSection.appendChild(printButton);
    }
    
    // Share functionality
    const shareData = {
        title: 'Етапи робіт - Вікна Престиж',
        text: 'Ознайомтеся з нашим детальним процесом роботи',
        url: window.location.href
    };
    
    const shareButton = document.createElement('button');
    shareButton.className = 'btn btn-outline';
    shareButton.innerHTML = '<i class="fas fa-share-alt"></i> Поділитися';
    shareButton.style.margin = '0 10px';
    
    shareButton.addEventListener('click', async () => {
        try {
            await navigator.share(shareData);
        } catch (err) {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                alert('Посилання скопійовано в буфер обміну!');
            });
        }
    });
    
    if (printButton.parentNode) {
        printButton.parentNode.insertBefore(shareButton, printButton.nextSibling);
    }
    
    // Add print styles
    const printStyles = document.createElement('style');
    printStyles.media = 'print';
    printStyles.textContent = `
        .header, .footer, .cta-section, .scroll-top,
        .btn, .hamburger, .share-button {
            display: none !important;
        }
        
        body {
            font-size: 12pt;
            color: black;
            background: white;
        }
        
        .timeline-content {
            box-shadow: none;
            border: 1px solid #ddd;
            page-break-inside: avoid;
        }
        
        .step-image img {
            max-height: 150px;
        }
        
        .container {
            max-width: 100%;
        }
    `;
    document.head.appendChild(printStyles);
});

// Mobile timeline adjustment
function adjustTimelineForMobile() {
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.timeline-item').forEach(item => {
            item.style.flexDirection = 'column';
        });
    }
}

window.addEventListener('resize', adjustTimelineForMobile);
adjustTimelineForMobile();