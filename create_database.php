<?php
// create_database.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>Створення бази даних</h2>";

try {
    // Підключення до MySQL без вибору бази даних
    $pdo = new PDO('mysql:host=localhost;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Створення бази даних
    $sql = "CREATE DATABASE IF NOT EXISTS window_company 
            CHARACTER SET utf8mb4 
            COLLATE utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "<p style='color: green;'>✅ Базу даних 'window_company' успішно створено!</p>";
    
    // Перевірка
    $stmt = $pdo->query("SHOW DATABASES LIKE 'window_company'");
    if ($stmt->rowCount() > 0) {
        echo "<p>База даних існує та готова до використання.</p>";
    } else {
        echo "<p style='color: red;'>❌ Помилка: Базу даних не створено!</p>";
    }
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ Помилка: " . $e->getMessage() . "</p>";
    echo "<p><strong>Можливі причини:</strong></p>";
    echo "<ul>";
    echo "<li>MySQL сервер не запущено</li>";
    echo "<li>Невірний логін/пароль</li>";
    echo "<li>Немає прав на створення баз даних</li>";
    echo "</ul>";
    echo "<p><strong>Рішення:</strong></p>";
    echo "<ol>";
    echo "<li>Запустіть XAMPP, WAMP або MAMP</li>";
    echo "<li>Перевірте правильність логіну/пароля у config.php</li>";
    echo "<li>Зверніться до адміністратора сервера</li>";
    echo "</ol>";
}
?>