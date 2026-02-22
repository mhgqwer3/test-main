<?php
/**
 * Helper Functions
 * دوال مساعدة مشتركة لجميع ملفات API
 */

/**
 * قراءة JSON من الـ request body
 */
function getJsonInput() {
    $raw = file_get_contents("php://input");
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * إرجاع response بصيغة JSON
 */
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * تنظيف البيانات من XSS
 */
function sanitize($data) {
    if (is_array($data)) {
        return array_map('sanitize', $data);
    }
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, 'UTF-8');
}

/**
 * التحقق من الحقول المطلوبة
 */
function validateRequired($data, $fields) {
    $missing = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || (is_string($data[$field]) && trim($data[$field]) === '')) {
            $missing[] = $field;
        }
    }
    
    if (!empty($missing)) {
        jsonResponse([
            "status" => "error",
            "message" => "Missing required fields",
            "missing_fields" => $missing
        ], 400);
    }
}

/**
 * الحصول على الاتصال بقاعدة البيانات
 */
function getDbConnection() {
    static $db = null;
    
    if ($db !== null) {
        return $db;
    }
    
    $host = $_SERVER['DB_HOST'] ?? 'database';
    $dbname = $_SERVER['DB_NAME'] ?? 'smart_bins_system';
    $username = $_SERVER['DB_USER'] ?? 'root';
    $password = $_SERVER['DB_PASS'] ?? 'rootpassword';
    
    try {
        $db = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password,
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            )
        );
        return $db;
    } catch (PDOException $e) {
        jsonResponse([
            "status" => "error",
            "message" => "Database connection failed"
        ], 500);
    }
}

/**
 * تسجيل النشاط
 */
function logActivity($userId, $action, $entityType = null, $entityId = null, $description = null) {
    try {
        $db = getDbConnection();
        
        $stmt = $db->prepare("
            INSERT INTO activity_logs 
            (user_id, action_type, entity_type, entity_id, description, ip_address, created_at)
            VALUES (:user_id, :action, :entity_type, :entity_id, :description, :ip, NOW())
        ");
        
        $stmt->execute([
            ':user_id' => $userId,
            ':action' => $action,
            ':entity_type' => $entityType,
            ':entity_id' => $entityId,
            ':description' => $description,
            ':ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);
    } catch (Exception $e) {
        // Silent fail للـ logging
        error_log("Log Activity Error: " . $e->getMessage());
    }
}
?>
