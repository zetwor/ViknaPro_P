CREATE DATABASE IF NOT EXISTS window_company 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE window_company;

CREATE TABLE IF NOT EXISTS feedback_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    service VARCHAR(50) NOT NULL,
    window_type VARCHAR(50),
    message TEXT,
    status ENUM('new', 'in_progress', 'completed') DEFAULT 'new',
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

CREATE TABLE IF NOT EXISTS admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'manager', 'viewer') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO admins (username, password_hash, full_name, email, role) 
VALUES ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Адміністратор', 'admin@vknaprestig.com', 'admin')
ON DUPLICATE KEY UPDATE id=id;
CREATE TABLE feedback_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    service ENUM('consultation', 'measurement', 'installation', 'repair', 'windows', 'other') NOT NULL,
    window_type ENUM('standard', 'premium', 'wooden', 'aluminum', 'panoramic', 'not_selected'),
    message TEXT,
    status ENUM('new', 'in_progress', 'completed') DEFAULT 'new',
    admin_notes TEXT,
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Додайте тестові дані
INSERT INTO feedback_requests (name, phone, email, service, window_type, message, status, admin_notes, assigned_to) VALUES
('Олена Петренко', '+380961234567', 'olena@gmail.com', 'consultation', 'premium', 'Потрібна консультація щодо панорамних вікон для вілли', 'new', '', ''),
('Андрій Коваленко', '+380971234568', 'andriy@ukr.net', 'measurement', 'standard', 'Потрібні заміри для 3-кімнатної квартири', 'in_progress', 'Призначено виїзд на 16.01', 'Менеджер Олексій'),
('Марія Сидоренко', '+380931234569', '', 'installation', 'wooden', 'Замовлення дерев''яних вікон для котеджу', 'completed', 'Вікна встановлено, клієнт задоволений', 'Бригада #2'),
('Ігор Мельник', '+380991234570', 'ihor@gmail.com', 'repair', NULL, 'Потрібний ремонт фурнітури на балконних дверях', 'new', '', ''),
('Наталія Бойко', '+380631234571', 'natalia@mail.ua', 'windows', 'aluminum', 'Інтересує вартість алюмінієвих вікон для офісу', 'in_progress', 'Відправлено комерційну пропозицію', 'Менеджер Ірина');