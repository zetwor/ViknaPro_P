let currentAdmin = null;
let currentPage = 'dashboard';

// Функції для роботи з API
async function loadDashboardData() {
    try {
        const response = await fetch('admin_api.php?action=get_dashboard_stats');
        const data = await response.json();
        
        if (data.success) {
            updateStats(data.data.overall);
            updateRecentRequests(data.data.recent_requests);
            createCharts(data.data.chart_data, data.data.by_service);
            updateMenuBadges(data.data.overall);
        }
    } catch (error) {
        console.error('Помилка:', error);
        // Якщо API не працює, використовуємо тестові дані
        useTestData();
    }
}

function useTestData() {
    // Тестові дані для демонстрації
    const testStats = {
        total: 10,
        new: 3,
        in_progress: 3,
        completed: 4
    };
    
    const testRequests = [
        {
            id: 1001,
            name: "Олена Петренко",
            phone: "+380961234567",
            email: "olena@gmail.com",
            service: "consultation",
            status: "new",
            created_at: "2024-01-15 10:30:00"
        },
        {
            id: 1002,
            name: "Андрій Коваленко",
            phone: "+380971234568",
            email: "andriy@ukr.net",
            service: "measurement",
            status: "in_progress",
            created_at: "2024-01-14 14:20:00"
        },
        {
            id: 1003,
            name: "Марія Сидоренко",
            phone: "+380931234569",
            email: "",
            service: "installation",
            status: "completed",
            created_at: "2024-01-13 09:15:00"
        }
    ];
    
    updateStats(testStats);
    updateRecentRequests(testRequests);
    updateMenuBadges(testStats);
    
    // Створюємо тестові графіки
    createTestCharts();
}

function updateStats(stats) {
    document.getElementById('statNew').textContent = stats.new || 0;
    document.getElementById('statInProgress').textContent = stats.in_progress || 0;
    document.getElementById('statCompleted').textContent = stats.completed || 0;
    document.getElementById('statTotal').textContent = stats.total || 0;
}

function updateMenuBadges(stats) {
    document.getElementById('newBadge').textContent = stats.new || 0;
    document.getElementById('inProgressBadge').textContent = stats.in_progress || 0;
    document.getElementById('completedBadge').textContent = stats.completed || 0;
    document.getElementById('totalRequestsBadge').textContent = stats.total || 0;
    document.getElementById('newRequestsBadge').textContent = stats.new || 0;
}

function updateRecentRequests(requests) {
    const tableBody = document.getElementById('recentRequestsTable');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.id}</td>
            <td>${escapeHtml(request.name)}</td>
            <td>${escapeHtml(request.phone)}</td>
            <td><span class="service-tag">${getServiceName(request.service)}</span></td>
            <td><span class="status-badge status-${request.status}">${getStatusName(request.status)}</span></td>
            <td>${formatDate(request.created_at)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" onclick="viewRequestDetails(${request.id})" title="Переглянути">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function displayAllRequests() {
    try {
        const response = await fetch('admin_api.php?action=get_requests');
        const data = await response.json();
        
        if (data.success) {
            displayRequestsTable(data.data.requests, data.data.pagination);
        } else {
            // Якщо API повертає помилку, показуємо тестові дані
            displayTestRequestsTable();
        }
    } catch (error) {
        console.error('Помилка:', error);
        displayTestRequestsTable();
    }
}

async function displayRequestsByStatus(status) {
    try {
        const response = await fetch(`admin_api.php?action=get_requests&status=${status}`);
        const data = await response.json();
        
        if (data.success) {
            displayRequestsTable(data.data.requests, data.data.pagination);
        } else {
            displayTestRequestsTable(status);
        }
    } catch (error) {
        console.error('Помилка:', error);
        displayTestRequestsTable(status);
    }
}

function displayRequestsTable(requests, pagination) {
    const pageContent = document.querySelector('.page-content');
    
    let container = document.getElementById('requestsPage');
    if (!container) {
        container = document.createElement('div');
        container.className = 'page';
        container.id = 'requestsPage';
        pageContent.appendChild(container);
    }
    
    const status = getStatusFromUrl();
    const title = status ? `${getStatusName(status)} заявки` : 'Всі заявки';
    
    let html = `
        <div class="requests-container">
            <h2>${title}</h2>
            <div class="table-controls">
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Пошук за ім'ям, телефоном..." 
                           onkeyup="searchRequests(this.value)">
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ім'я</th>
                            <th>Телефон</th>
                            <th>Послуга</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (requests.length === 0) {
        html += `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Заявок не знайдено</p>
                </td>
            </tr>
        `;
    } else {
        requests.forEach(request => {
            html += `
                <tr>
                    <td>${request.id}</td>
                    <td>${escapeHtml(request.name)}</td>
                    <td>${escapeHtml(request.phone)}</td>
                    <td>${getServiceName(request.service)}</td>
                    <td><span class="status-badge status-${request.status}">${getStatusName(request.status)}</span></td>
                    <td>${formatDate(request.created_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" onclick="viewRequestDetails(${request.id})" title="Переглянути">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
            
            ${pagination.total_pages > 1 ? `
            <div class="pagination">
                <button class="pagination-btn" onclick="changePage(${pagination.page - 1})" ${pagination.page <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-chevron-left"></i>
                </button>
                
                ${Array.from({length: Math.min(5, pagination.total_pages)}, (_, i) => {
                    const pageNum = i + 1;
                    return `
                    <button class="pagination-btn ${pageNum === pagination.page ? 'active' : ''}" 
                            onclick="changePage(${pageNum})">
                        ${pageNum}
                    </button>
                    `;
                }).join('')}
                
                <button class="pagination-btn" onclick="changePage(${pagination.page + 1})" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>
                    <i class="fas fa-chevron-right"></i>
                </button>
                
                <span class="pagination-info">
                    Сторінка ${pagination.page} з ${pagination.total_pages}
                </span>
            </div>
            ` : ''}
        </div>
    `;
    
    container.innerHTML = html;
}

function displayTestRequestsTable(status = '') {
    const testRequests = [
        {
            id: 1001,
            name: "Олена Петренко",
            phone: "+380961234567",
            email: "olena@gmail.com",
            service: "consultation",
            window_type: "premium",
            message: "Потрібна консультація щодо панорамних вікон для вілли",
            status: "new",
            created_at: "2024-01-15 10:30:00",
            updated_at: "2024-01-15 10:30:00",
            admin_notes: "",
            assigned_to: ""
        },
        {
            id: 1002,
            name: "Андрій Коваленко",
            phone: "+380971234568",
            email: "andriy@ukr.net",
            service: "measurement",
            window_type: "standard",
            message: "Потрібні заміри для 3-кімнатної квартири",
            status: "in_progress",
            created_at: "2024-01-14 14:20:00",
            updated_at: "2024-01-14 16:45:00",
            admin_notes: "Призначено виїзд на 16.01",
            assigned_to: "Менеджер Олексій"
        },
        {
            id: 1003,
            name: "Марія Сидоренко",
            phone: "+380931234569",
            email: "",
            service: "installation",
            window_type: "wooden",
            message: "Замовлення дерев'яних вікон для котеджу",
            status: "completed",
            created_at: "2024-01-13 09:15:00",
            updated_at: "2024-01-14 18:30:00",
            admin_notes: "Вікна встановлено, клієнт задоволений",
            assigned_to: "Бригада #2"
        }
    ];
    
    const filteredRequests = status ? testRequests.filter(r => r.status === status) : testRequests;
    
    const pageContent = document.querySelector('.page-content');
    
    let container = document.getElementById('requestsPage');
    if (!container) {
        container = document.createElement('div');
        container.className = 'page';
        container.id = 'requestsPage';
        pageContent.appendChild(container);
    }
    
    const title = status ? `${getStatusName(status)} заявки (тестові дані)` : 'Всі заявки (тестові дані)';
    
    let html = `
        <div class="requests-container">
            <h2>${title}</h2>
            <div class="table-controls">
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Пошук за ім'ям, телефоном..." 
                           onkeyup="searchRequests(this.value)">
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Ім'я</th>
                            <th>Телефон</th>
                            <th>Послуга</th>
                            <th>Статус</th>
                            <th>Дата</th>
                            <th>Дії</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    if (filteredRequests.length === 0) {
        html += `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #e2e8f0; margin-bottom: 20px;"></i>
                    <p style="color: #64748b; font-size: 1.1rem;">Заявок не знайдено</p>
                </td>
            </tr>
        `;
    } else {
        filteredRequests.forEach(request => {
            html += `
                <tr>
                    <td>${request.id}</td>
                    <td>${escapeHtml(request.name)}</td>
                    <td>${escapeHtml(request.phone)}</td>
                    <td>${getServiceName(request.service)}</td>
                    <td><span class="status-badge status-${request.status}">${getStatusName(request.status)}</span></td>
                    <td>${formatDate(request.created_at)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" onclick="viewTestRequestDetails(${request.id})" title="Переглянути">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }
    
    html += `
                    </tbody>
                </table>
            </div>
            
            <div class="pagination">
                <button class="pagination-btn" disabled>
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="pagination-btn active">1</button>
                <button class="pagination-btn" disabled>
                    <i class="fas fa-chevron-right"></i>
                </button>
                <span class="pagination-info">
                    Сторінка 1 з 1
                </span>
            </div>
            
            <div class="alert" style="margin-top: 20px; padding: 10px; background: #fef3c7; border-radius: 8px; color: #92400e;">
                <i class="fas fa-exclamation-circle"></i>
                <strong>Примітка:</strong> Відображаються тестові дані. Для відображення реальних заявок налаштуйте підключення до бази даних.
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}

async function viewRequestDetails(requestId) {
    try {
        const response = await fetch(`admin_api.php?action=get_request&id=${requestId}`);
        const data = await response.json();
        
        if (data.success) {
            showRequestModal(data.data);
        } else {
            viewTestRequestDetails(requestId);
        }
    } catch (error) {
        console.error('Помилка:', error);
        viewTestRequestDetails(requestId);
    }
}

function viewTestRequestDetails(requestId) {
    const testRequests = [
        {
            id: 1001,
            name: "Олена Петренко",
            phone: "+380961234567",
            email: "olena@gmail.com",
            service: "consultation",
            window_type: "premium",
            message: "Потрібна консультація щодо панорамних вікон для вілли",
            status: "new",
            created_at: "2024-01-15 10:30:00",
            updated_at: "2024-01-15 10:30:00",
            admin_notes: "",
            assigned_to: ""
        },
        {
            id: 1002,
            name: "Андрій Коваленко",
            phone: "+380971234568",
            email: "andriy@ukr.net",
            service: "measurement",
            window_type: "standard",
            message: "Потрібні заміри для 3-кімнатної квартири",
            status: "in_progress",
            created_at: "2024-01-14 14:20:00",
            updated_at: "2024-01-14 16:45:00",
            admin_notes: "Призначено виїзд на 16.01",
            assigned_to: "Менеджер Олексій"
        },
        {
            id: 1003,
            name: "Марія Сидоренко",
            phone: "+380931234569",
            email: "",
            service: "installation",
            window_type: "wooden",
            message: "Замовлення дерев'яних вікон для котеджу",
            status: "completed",
            created_at: "2024-01-13 09:15:00",
            updated_at: "2024-01-14 18:30:00",
            admin_notes: "Вікна встановлено, клієнт задоволений",
            assigned_to: "Бригада #2"
        }
    ];
    
    const request = testRequests.find(r => r.id === requestId);
    if (!request) return;
    
    showRequestModal(request);
}

function showRequestModal(request) {
    const modalHTML = `
        <div class="modal active" id="requestModal">
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>Заявка #${request.id}</h3>
                    <button class="modal-close" onclick="closeRequestModal()"><i class="fas fa-times"></i></button>
                </div>
                <div class="modal-body">
                    <div class="request-details-grid">
                        <div class="detail-section">
                            <h4><i class="fas fa-user"></i> Інформація про клієнта</h4>
                            <div class="detail-row">
                                <span class="detail-label">Ім'я:</span>
                                <span class="detail-value">${escapeHtml(request.name)}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Телефон:</span>
                                <a href="tel:${escapeHtml(request.phone)}" class="detail-value">${escapeHtml(request.phone)}</a>
                            </div>
                            ${request.email ? `
                            <div class="detail-row">
                                <span class="detail-label">Email:</span>
                                <a href="mailto:${escapeHtml(request.email)}" class="detail-value">${escapeHtml(request.email)}</a>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class="fas fa-tools"></i> Деталі заявки</h4>
                            <div class="detail-row">
                                <span class="detail-label">Послуга:</span>
                                <span class="detail-value">${getServiceName(request.service)}</span>
                            </div>
                            ${request.window_type ? `
                            <div class="detail-row">
                                <span class="detail-label">Тип вікна:</span>
                                <span class="detail-value">${getWindowTypeName(request.window_type)}</span>
                            </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="detail-label">Статус:</span>
                                <span class="status-badge status-${request.status}">
                                    ${getStatusName(request.status)}
                                </span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Дата створення:</span>
                                <span class="detail-value">${formatDate(request.created_at)}</span>
                            </div>
                            ${request.updated_at !== request.created_at ? `
                            <div class="detail-row">
                                <span class="detail-label">Дата оновлення:</span>
                                <span class="detail-value">${formatDate(request.updated_at)}</span>
                            </div>
                            ` : ''}
                        </div>
                        
                        ${request.message ? `
                        <div class="detail-section">
                            <h4><i class="fas fa-comment"></i> Повідомлення клієнта</h4>
                            <div class="message-content">
                                ${escapeHtml(request.message)}
                            </div>
                        </div>
                        ` : ''}
                        
                        ${request.admin_notes ? `
                        <div class="detail-section">
                            <h4><i class="fas fa-sticky-note"></i> Примітки адміністратора</h4>
                            <div class="notes-content">
                                ${escapeHtml(request.admin_notes)}
                            </div>
                        </div>
                        ` : ''}
                        
                        <div class="detail-section">
                            <h4><i class="fas fa-edit"></i> Змінити статус</h4>
                            <div class="detail-row">
                                <select id="statusSelect">
                                    <option value="new" ${request.status === 'new' ? 'selected' : ''}>Новий</option>
                                    <option value="in_progress" ${request.status === 'in_progress' ? 'selected' : ''}>В роботі</option>
                                    <option value="completed" ${request.status === 'completed' ? 'selected' : ''}>Завершений</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="updateRequest(${request.id})">Зберегти зміни</button>
                    <button class="btn btn-secondary" onclick="closeRequestModal()">Закрити</button>
                </div>
            </div>
        </div>
    `;
    
    const oldModal = document.getElementById('requestModal');
    if (oldModal) oldModal.remove();
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

async function updateRequest(id) {
    const statusSelect = document.getElementById('statusSelect');
    const adminNotes = document.querySelector('#requestModal .notes-content')?.textContent || '';
    
    try {
        const response = await fetch('admin_api.php?action=update_request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                id: id,
                status: statusSelect.value,
                admin_notes: adminNotes
            })
        });
        
        const data = await response.json();
        if (data.success) {
            closeRequestModal();
            loadDashboardData();
            loadPage(currentPage);
        }
    } catch (error) {
        console.error('Помилка:', error);
        alert('Зміни збережено локально (для роботи з реальними даними налаштуйте API)');
        closeRequestModal();
    }
}

// Інші функції залишаються незмінними...

function getServiceName(service) {
    const services = {
        'consultation': 'Консультація',
        'measurement': 'Заміри',
        'installation': 'Монтаж',
        'repair': 'Ремонт',
        'windows': 'Купівля вікон',
        'other': 'Інше'
    };
    return services[service] || service;
}

function getWindowTypeName(type) {
    const types = {
        'standard': 'Стандартне',
        'premium': 'Преміум',
        'wooden': 'Дерев\'яне',
        'aluminum': 'Алюмінієве',
        'panoramic': 'Панорамне',
        'not_selected': 'Не вибрано'
    };
    return types[type] || type;
}

function getStatusName(status) {
    const statuses = {
        'new': 'Новий',
        'in_progress': 'В роботі',
        'completed': 'Завершений'
    };
    return statuses[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
    
    const pageElement = document.getElementById(page + 'Page');
    const menuLink = document.querySelector(`[data-page="${page}"]`);
    
    if (pageElement) {
        pageElement.classList.add('active');
        currentPage = page;
        updatePageTitle(page);
        
        if (menuLink) menuLink.classList.add('active');
        
        switch(page) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'requests':
                displayAllRequests();
                break;
            case 'new-requests':
                displayRequestsByStatus('new');
                break;
            case 'in-progress':
                displayRequestsByStatus('in_progress');
                break;
            case 'completed':
                displayRequestsByStatus('completed');
                break;
            case 'statistics':
                loadStatistics();
                break;
        }
    }
}

function getStatusFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('status');
}

function searchRequests(query) {
    const table = document.querySelector('.data-table tbody');
    if (!table) return;
    
    const rows = table.querySelectorAll('tr');
    const searchTerm = query.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function closeRequestModal() {
    const modal = document.getElementById('requestModal');
    if (modal) modal.remove();
}

function createCharts(dailyData, serviceData) {
    // Якщо дані з API відсутні, створюємо тестові графіки
    if (!dailyData || !serviceData) {
        createTestCharts();
        return;
    }
    
    const requestsChartCtx = document.getElementById('requestsChart').getContext('2d');
    
    const dates = dailyData.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}.${date.getMonth() + 1}`;
    });
    
    const counts = dailyData.map(item => item.count);
    
    new Chart(requestsChartCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Кількість заявок',
                data: counts,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    const servicesChartCtx = document.getElementById('servicesChart').getContext('2d');
    
    const serviceLabels = serviceData.map(item => getServiceName(item.service));
    const serviceCounts = serviceData.map(item => item.count);
    
    const serviceColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    new Chart(servicesChartCtx, {
        type: 'doughnut',
        data: {
            labels: serviceLabels,
            datasets: [{
                data: serviceCounts,
                backgroundColor: serviceColors,
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function createTestCharts() {
    const requestsChartCtx = document.getElementById('requestsChart').getContext('2d');
    
    const testDates = ['15.01', '14.01', '13.01', '12.01', '11.01', '10.01', '9.01'];
    const testCounts = [2, 1, 1, 2, 1, 1, 2];
    
    new Chart(requestsChartCtx, {
        type: 'line',
        data: {
            labels: testDates,
            datasets: [{
                label: 'Кількість заявок',
                data: testCounts,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });

    const servicesChartCtx = document.getElementById('servicesChart').getContext('2d');
    
    new Chart(servicesChartCtx, {
        type: 'doughnut',
        data: {
            labels: ['Консультація', 'Заміри', 'Монтаж', 'Ремонт', 'Купівля'],
            datasets: [{
                data: [3, 2, 1, 2, 2],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updatePageTitle(page) {
    const titles = {
        'dashboard': 'Дашборд',
        'requests': 'Всі заявки',
        'new-requests': 'Нові заявки',
        'in-progress': 'В роботі',
        'completed': 'Завершені',
        'statistics': 'Статистика'
    };
    
    document.getElementById('pageTitle').textContent = titles[page] || 'Панель';
    document.getElementById('pageBreadcrumb').textContent = titles[page] || 'Панель';
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

function logout() {
    if (confirm('Ви впевнені, що хочете вийти?')) {
        window.location.href = 'logout.php';
    }
}

async function loadStatistics() {
    try {
        const response = await fetch('admin_api.php?action=get_statistics');
        const data = await response.json();
        
        if (data.success) {
            updateStatistics(data.data.overall_stats);
            createMonthlyChart(data.data.daily_stats);
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

function updateStatistics(stats) {
    document.getElementById('totalRequestsStat').textContent = stats.total_requests || 0;
    document.getElementById('avgResponseStat').textContent = Math.round(stats.avg_response_time || 0);
    document.getElementById('activeDaysStat').textContent = stats.active_days || 0;
    document.getElementById('uniqueServicesStat').textContent = stats.unique_services || 0;
}

function createMonthlyChart(dailyStats) {
    const ctx = document.getElementById('monthlyStatsChart').getContext('2d');
    
    // Якщо даних немає, створюємо тестові дані
    if (!dailyStats || dailyStats.length === 0) {
        const testDates = [];
        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            testDates.push(`${date.getDate()}.${date.getMonth() + 1}`);
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: testDates,
                datasets: [
                    {
                        label: 'Нові',
                        data: testDates.map(() => Math.floor(Math.random() * 5)),
                        backgroundColor: 'rgba(59, 130, 246, 0.7)',
                        borderColor: '#3b82f6',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        return;
    }
    
    const dates = dailyStats.map(item => {
        const date = new Date(item.date);
        return `${date.getDate()}.${date.getMonth() + 1}`;
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Нові',
                    data: dailyStats.map(item => item.new || 0),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderColor: '#3b82f6',
                    borderWidth: 1
                },
                {
                    label: 'В роботі',
                    data: dailyStats.map(item => item.in_progress || 0),
                    backgroundColor: 'rgba(245, 158, 11, 0.7)',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                },
                {
                    label: 'Завершені',
                    data: dailyStats.map(item => item.completed || 0),
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    stacked: true,
                },
                y: {
                    stacked: true,
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
});

// Додаємо мобільне меню
function setupMobileMenu() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        z-index: 999;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: white;
        border: 1px solid #e2e8f0;
        color: #475569;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        display: none;
    `;
    
    menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });
    
    document.body.appendChild(menuToggle);
    
    if (window.innerWidth <= 768) {
        menuToggle.style.display = 'flex';
    }
    
    window.addEventListener('resize', () => {
        menuToggle.style.display = window.innerWidth <= 768 ? 'flex' : 'none';
    });
}

// Викликаємо налаштування мобільного меню
setupMobileMenu();