<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

session_start();
require_once 'config.php';

if (!DEV_MODE) {
    if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
        jsonResponse(false, 'Необхідна авторизація', null, 401);
    }
}

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_dashboard_stats':
        getDashboardStatsAPI();
        break;
        
    case 'get_requests':
        getRequestsAPI();
        break;
        
    case 'get_request':
        getRequestAPI();
        break;
        
    case 'update_request':
        updateRequestAPI();
        break;
        
    case 'delete_request':
        deleteRequestAPI();
        break;
        
    case 'get_statistics':
        getStatisticsAPI();
        break;
        
    default:
        jsonResponse(false, 'Невідома дія', null, 400);
}

function getDashboardStatsAPI() {
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $overall = $db->query("
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM feedback_requests
        ")->fetch();
        
        $last7days = $db->query("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count
            FROM feedback_requests 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ")->fetchAll();
        
        $byService = $db->query("
            SELECT service, COUNT(*) as count
            FROM feedback_requests
            GROUP BY service
            ORDER BY count DESC
            LIMIT 5
        ")->fetchAll();
        
        $recent = $db->query("
            SELECT id, name, phone, service, status, created_at
            FROM feedback_requests
            ORDER BY created_at DESC
            LIMIT 5
        ")->fetchAll();
        
        jsonResponse(true, 'Статистика завантажена', [
            'overall' => $overall,
            'chart_data' => $last7days,
            'by_service' => $byService,
            'recent_requests' => $recent
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function getRequestsAPI() {
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $status = $_GET['status'] ?? '';
        $search = $_GET['search'] ?? '';
        $page = intval($_GET['page'] ?? 1);
        $limit = 20;
        $offset = ($page - 1) * $limit;
        
        $where = [];
        $params = [];
        
        if ($status) {
            $where[] = 'status = ?';
            $params[] = $status;
        }
        
        if ($search) {
            $where[] = '(name LIKE ? OR phone LIKE ? OR email LIKE ?)';
            $searchTerm = "%$search%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
        
        $stmt = $db->prepare("
            SELECT SQL_CALC_FOUND_ROWS *
            FROM feedback_requests
            $whereClause
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        
        $params[] = $limit;
        $params[] = $offset;
        $stmt->execute($params);
        $requests = $stmt->fetchAll();
        
        $total = $db->query("SELECT FOUND_ROWS()")->fetchColumn();
        
        jsonResponse(true, 'Заявки отримані', [
            'requests' => $requests,
            'pagination' => [
                'page' => $page,
                'total' => $total,
                'total_pages' => ceil($total / $limit)
            ]
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function getRequestAPI() {
    $id = $_GET['id'] ?? 0;
    if (!$id) jsonResponse(false, 'Не вказано ID');
    
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $stmt = $db->prepare("SELECT * FROM feedback_requests WHERE id = ?");
        $stmt->execute([$id]);
        $request = $stmt->fetch();
        
        if (!$request) jsonResponse(false, 'Заявку не знайдено');
        
        jsonResponse(true, 'Заявка отримана', $request);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function updateRequestAPI() {
    $id = $_POST['id'] ?? 0;
    $status = $_POST['status'] ?? '';
    $admin_notes = $_POST['admin_notes'] ?? '';
    $assigned_to = $_POST['assigned_to'] ?? '';
    
    if (!$id) jsonResponse(false, 'Не вказано ID');
    
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $stmt = $db->prepare("
            UPDATE feedback_requests 
            SET status = ?, 
                admin_notes = ?,
                assigned_to = ?,
                updated_at = NOW()
            WHERE id = ?
        ");
        
        $stmt->execute([$status, $admin_notes, $assigned_to, $id]);
        jsonResponse(true, 'Заявка оновлена', ['id' => $id]);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function deleteRequestAPI() {
    $id = $_POST['id'] ?? 0;
    if (!$id) jsonResponse(false, 'Не вказано ID');
    
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $stmt = $db->prepare("DELETE FROM feedback_requests WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(true, 'Заявку видалено', ['id' => $id]);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function getStatisticsAPI() {
    $db = getDBConnection();
    if (!$db) jsonResponse(false, 'Помилка підключення до БД');
    
    try {
        $thirtyDaysAgo = date('Y-m-d', strtotime('-30 days'));
        
        $stmt = $db->prepare("
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
            FROM feedback_requests
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        ");
        
        $stmt->execute([$thirtyDaysAgo]);
        $dailyStats = $stmt->fetchAll();
        
        $stmt = $db->query("
            SELECT 
                COUNT(*) as total_requests,
                AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_response_time,
                COUNT(DISTINCT DATE(created_at)) as active_days,
                COUNT(DISTINCT service) as unique_services
            FROM feedback_requests
        ");
        
        $overallStats = $stmt->fetch();
        
        jsonResponse(true, 'Статистика отримана', [
            'daily_stats' => $dailyStats,
            'overall_stats' => $overallStats
        ]);
        
    } catch (PDOException $e) {
        jsonResponse(false, 'Помилка: ' . $e->getMessage());
    }
}

function jsonResponse($success, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ]);
    exit;
}

function getDBConnection() {
    static $db = null;
    
    if ($db === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $db = new PDO($dsn, DB_USER, DB_PASSWORD);
            $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            error_log('Database connection error: ' . $e->getMessage());
            return false;
        }
    }
    
    return $db;
}
?>