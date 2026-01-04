<?php
// Простий сервер для тесту
if (isset($_POST['name'])) {
    // Обробка форми
    $data = [
        'id' => time(),
        'name' => $_POST['name'],
        'phone' => $_POST['phone'],
        'service' => $_POST['service'],
        'date' => date('Y-m-d H:i:s')
    ];
    
    // Зберігаємо в файл
    $requests = [];
    if (file_exists('requests.json')) {
        $requests = json_decode(file_get_contents('requests.json'), true);
    }
    $requests[] = $data;
    file_put_contents('requests.json', json_encode($requests, JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успішно відправлена!',
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Показуємо форму
?>
<!DOCTYPE html>
<html>
<head>
    <title>Тестова форма</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        form { max-width: 400px; }
        input, select, button { width: 100%; padding: 10px; margin: 5px 0; }
        button { background: #007bff; color: white; border: none; cursor: pointer; }
        .success { color: green; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Тестова форма</h1>
    <form id="testForm">
        <input type="text" name="name" placeholder="Ім'я" required>
        <input type="tel" name="phone" placeholder="Телефон" required>
        <select name="service" required>
            <option value="">Оберіть послугу</option>
            <option value="consultation">Консультація</option>
            <option value="measurement">Заміри</option>
            <option value="installation">Монтаж</option>
        </select>
        <button type="submit">Надіслати заявку</button>
    </form>
    
    <div id="result"></div>
    
    <script>
    document.getElementById('testForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const resultDiv = document.getElementById('result');
        
        try {
            const response = await fetch('index.php', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                resultDiv.innerHTML = `<p class="success">✅ ${data.message}</p>
                                      <p>ID заявки: ${data.data.id}</p>`;
                this.reset();
            } else {
                resultDiv.innerHTML = `<p class="error">❌ ${data.message}</p>`;
            }
        } catch (error) {
            resultDiv.innerHTML = `<p class="error">❌ Помилка мережі: ${error.message}</p>`;
        }
    });
    </script>
</body>
</html>