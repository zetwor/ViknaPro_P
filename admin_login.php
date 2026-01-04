<?php
// admin_login.php - Обробник входу в адмін-панель
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    safeExit('Невірний метод запиту');
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');

if (empty($username) || empty($password)) {
    safeExit('Будь ласка, заповніть всі поля');
}

try {
    $db = getDBConnection();
    
    // Пошук адміна
    $stmt = $db->prepare("SELECT * FROM admins WHERE username = :username AND is_active = 1");
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch();
    
    if (!$admin || !verifyPassword($password, $admin['password_hash'])) {
        safeExit('Невірний логін або пароль');
    }
    
    // Оновлення часу останнього входу
    $stmt = $db->prepare("UPDATE admins SET last_login = NOW() WHERE id = :id");
    $stmt->execute([':id' => $admin['id']]);
    
    // Створення сесії
    $_SESSION['admin_id'] = $admin['id'];
    $_SESSION['admin_token'] = generateToken($admin['id'] . $admin['username']);
    
    // Логування
    logAction($admin['id'], 'login', 'Увійшов в систему');
    
    safeExit('Успішний вхід', [
        'id' => $admin['id'],
        'username' => $admin['username'],
        'full_name' => $admin['full_name'],
        'role' => $admin['role'],
        'email' => $admin['email']
    ]);
    
} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    safeExit('Помилка входу в систему');
}
?>