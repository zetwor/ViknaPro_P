<?php
require_once 'config.php';

echo "<h2>Тестування підключення до бази даних</h2>";

// Спроба підключитись
$db = getDBConnection();

if ($db) {
    echo "<p style='color: green;'>✅ Підключення успішне!</p>";
    
    // Перевірка таблиць
    try {
        $stmt = $db->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        if (empty($tables)) {
            echo "<p style='color: orange;'>⚠ Таблиці не знайдені. Створюємо...</p>";
            
            // Створення таблиць
            createDatabaseTables();
            
            // Перевірка знову
            $stmt = $db->query("SHOW TABLES");
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
            
            echo "<p style='color: green;'>✅ Створені таблиці: " . implode(', ', $tables) . "</p>";
        } else {
            echo "<p style='color: green;'>✅ Знайдені таблиці: " . implode(', ', $tables) . "</p>";
        }
        
        // Тестова вставка
        $testData = [
            'name' => 'Тестовий Користувач',
            'phone' => '+380991234567',
            'service' => 'consultation',
            'privacy_policy' => 1
        ];
        
        $requestId = saveFeedbackRequest($testData);
        
        if ($requestId) {
            echo "<p style='color: green;'>✅ Тестова заявка збережена! ID: $requestId</p>";
        } else {
            echo "<p style='color: red;'>❌ Не вдалося зберегти тестову заявку</p>";
        }
        
    } catch(Exception $e) {
        echo "<p style='color: red;'>❌ Помилка: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p style='color: red;'>❌ Не вдалося підключитись до бази даних</p>";
}
?>