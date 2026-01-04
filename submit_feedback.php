<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Content-Type: application/json');

require_once 'config.php';

// Додаткова конфігурація
define('TELEGRAM_BOT_TOKEN', '');
define('TELEGRAM_CHAT_ID', '');

$response = [
    'success' => false,
    'message' => '',
    'data' => [],
    'request_id' => null
];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Невірний метод запиту');
    }

    // Отримуємо дані
    $name = trim($_POST['name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $service = trim($_POST['service'] ?? '');
    $window_type = trim($_POST['window_type'] ?? '');
    $message = trim($_POST['message'] ?? '');
    $call_time_morning = isset($_POST['call_time_morning']) ? 1 : 0;
    $call_time_day = isset($_POST['call_time_day']) ? 1 : 0;
    $call_time_evening = isset($_POST['call_time_evening']) ? 1 : 0;
    $privacy_policy = isset($_POST['privacy_policy']) ? 1 : 0;

    // Валідація
    if (empty($name) || empty($phone) || empty($service)) {
        throw new Exception('Заповніть обов\'язкові поля');
    }

    if (!$privacy_policy) {
        throw new Exception('Погодьтесь з обробкою персональних даних');
    }

    $phone = preg_replace('/[^0-9+]/', '', $phone);

    // Підключення до БД
    $db = getDBConnection();
    if (!$db) {
        throw new Exception('Помилка підключення до бази даних');
    }

    // Зберігаємо заявку
    $stmt = $db->prepare("
        INSERT INTO feedback_requests 
        (name, phone, email, service, window_type, message, 
         call_time_morning, call_time_day, call_time_evening, 
         ip_address, user_agent, status, created_at)
        VALUES 
        (:name, :phone, :email, :service, :window_type, :message,
         :call_time_morning, :call_time_day, :call_time_evening,
         :ip_address, :user_agent, 'new', NOW())
    ");

    $stmt->execute([
        ':name' => $name,
        ':phone' => $phone,
        ':email' => $email,
        ':service' => $service,
        ':window_type' => $window_type,
        ':message' => $message,
        ':call_time_morning' => $call_time_morning,
        ':call_time_day' => $call_time_day,
        ':call_time_evening' => $call_time_evening,
        ':ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        ':user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
    ]);

    $requestId = $db->lastInsertId();

    // Відправка в Telegram (опційно)
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        sendToTelegram($requestId, $name, $phone, $service, $window_type, $message);
    }

    // Успішна відповідь
    $response['success'] = true;
    $response['message'] = 'Заявка успішно відправлена!';
    $response['request_id'] = $requestId;
    $response['data'] = [
        'id' => $requestId,
        'name' => $name,
        'phone' => $phone,
        'service' => getServiceName($service),
        'time' => date('H:i'),
        'date' => date('d.m.Y')
    ];

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

// Допоміжні функції
function getServiceName($service) {
    $services = [
        'consultation' => 'Консультація',
        'measurement' => 'Заміри',
        'installation' => 'Монтаж',
        'repair' => 'Ремонт',
        'windows' => 'Купівля вікон',
        'other' => 'Інше'
    ];
    return $services[$service] ?? $service;
}

function sendToTelegram($id, $name, $phone, $service, $window, $message) {
    $botToken = TELEGRAM_BOT_TOKEN;
    $chatId = TELEGRAM_CHAT_ID;
    
    $text = "🪟 *Нова заявка #$id*
👤 *Ім'я:* $name
📞 *Телефон:* $phone
🔧 *Послуга:* " . getServiceName($service);

    if ($window) {
        $text .= "\n🏠 *Тип вікна:* $window";
    }
    if ($message) {
        $text .= "\n💬 *Повідомлення:* $message";
    }
    
    $text .= "\n⏰ *Час:* " . date('H:i d.m.Y');
    
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'chat_id' => $chatId,
        'text' => $text,
        'parse_mode' => 'Markdown'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
}
?>