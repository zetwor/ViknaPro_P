-- Створення бази даних
CREATE DATABASE IF NOT EXISTS window_company 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE window_company;

-- Таблиця для заявок
CREATE TABLE IF NOT EXISTS feedback_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    service VARCHAR(50) NOT NULL,
    window_type VARCHAR(50),
    message TEXT,
    form_type VARCHAR(20) DEFAULT 'feedback',
    status ENUM('new', 'in_progress', 'completed', 'rejected') DEFAULT 'new',
    call_time_morning BOOLEAN DEFAULT 0,
    call_time_day BOOLEAN DEFAULT 0,
    call_time_evening BOOLEAN DEFAULT 0,
    ip_address VARCHAR(45),
    user_agent TEXT,
    admin_notes TEXT,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_service (service)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблиця для адміністраторів
CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'manager', 'viewer') DEFAULT 'manager',
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Додавання тестового адміністратора (пароль: admin123)
INSERT INTO admins (username, password_hash, full_name, email, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Адміністратор', 'admin@vknaprestig.com', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Таблиця для статистики
CREATE TABLE IF NOT EXISTS statistics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    page_views INT DEFAULT 0,
    unique_visitors INT DEFAULT 0,
    form_submissions INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблиця для логу дій
CREATE TABLE IF NOT EXISTS action_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Тригер для автоматичного оновлення статистики
DELIMITER //

CREATE TRIGGER after_feedback_insert
AFTER INSERT ON feedback_requests
FOR EACH ROW
BEGIN
    DECLARE stat_date DATE;
    SET stat_date = DATE(NEW.created_at);
    
    INSERT INTO statistics (date, form_submissions)
    VALUES (stat_date, 1)
    ON DUPLICATE KEY UPDATE 
    form_submissions = form_submissions + 1;
END//

DELIMITER ;

-- Процедура для отримання статистики
DELIMITER //

CREATE PROCEDURE GetStatistics(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_requests,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
    FROM feedback_requests
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY DATE(created_at)
    ORDER BY date DESC;
END//

DELIMITER ;

-- Створення view для звітів
CREATE VIEW daily_reports AS
SELECT 
    DATE(created_at) as report_date,
    COUNT(*) as total_requests,
    GROUP_CONCAT(DISTINCT service) as services_requested,
    MIN(created_at) as first_request,
    MAX(created_at) as last_request
FROM feedback_requests
GROUP BY DATE(created_at)
ORDER BY report_date DESC;

-- Індекси для оптимізації
CREATE INDEX idx_feedback_date_status ON feedback_requests (DATE(created_at), status);
CREATE INDEX idx_feedback_service_date ON feedback_requests (service, DATE(created_at));
CREATE INDEX idx_admins_role_active ON admins (role, is_active);
