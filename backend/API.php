<?php
/**
 * Smart Bins Unified API
 * All-in-one API endpoint
 */

header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/Helpers.php";
$pdo = getDbConnection();


$db = getDbConnection();
$method = $_SERVER["REQUEST_METHOD"];
$action = $_GET["action"] ?? "list";

// ==========================================
// POST Methods
// ==========================================

if ($method === "POST") {

    // ===== تحديث بيانات الحساس من Raspberry Pi =====
    if ($action === "update_sensor") {
        $data = getJsonInput();

        $binCode    = sanitize($data["bin_code"] ?? null);
        $location   = sanitize($data["location"] ?? null);
        $fillLevel  = isset($data["fill_level"]) ? (int)$data["fill_level"] : null;
        $batteryLevel = isset($data["battery_level"]) ? (int)$data["battery_level"] : null;
        $latitude   = isset($data["latitude"]) ? (float)$data["latitude"] : null;
        $longitude  = isset($data["longitude"]) ? (float)$data["longitude"] : null;

        if (!$binCode || $fillLevel === null) {
            jsonResponse(["status" => "error", "message" => "Missing required fields"], 400);
        }

        // تحديد الحالة
        $status = "operational";
        if ($fillLevel >= 90) {
            $status = "full";
        } elseif ($batteryLevel !== null && $batteryLevel < 20) {
            $status = "low_battery";
        }

        // تحديث الصندوق
        $stmt = $db->prepare("
            UPDATE bins 
            SET fill_level = :fill, 
                battery_level = :battery,
                latitude = COALESCE(:lat, latitude),
                longitude = COALESCE(:lon, longitude),
                location_name = COALESCE(:loc, location_name),
                updated_at = NOW()
            WHERE bin_code = :code AND is_active = 1
        ");

        try {
            $stmt->execute([
                ":fill"    => $fillLevel,
                ":battery" => $batteryLevel,
                ":lat"     => $latitude,
                ":lon"     => $longitude,
                ":loc"     => $location,
                ":code"    => $binCode
            ]);

            // إضافة للتاريخ
            $histStmt = $db->prepare("
                INSERT INTO history_readings (bin_code, fill_level, battery_level, latitude, longitude)
                SELECT bin_id, :fill, :battery, :lat, :lon
                FROM bins WHERE bin_code = :code LIMIT 1
            ");
            $histStmt->execute([
                ":fill"    => $fillLevel,
                ":battery" => $batteryLevel,
                ":lat"     => $latitude,
                ":lon"     => $longitude,
                ":code"    => $binCode
            ]);

            // إنشاء تنبيه إذا ممتلئ
            if ($fillLevel >= 90) {
                $alertStmt = $db->prepare("
                    INSERT INTO alerts (bin_id, alert_type, category, title, message, priority)
                    SELECT bin_id, 'warning', 'fill_level', 'Bin Full', 
                           CONCAT(:code, ' is full at ', :fill, '%'), 8
                    FROM bins WHERE bin_code = :code LIMIT 1
                ");
                $alertStmt->execute([":code" => $binCode, ":fill" => $fillLevel]);
            }

            jsonResponse([
                "status"        => "success",
                "bin_code"      => $binCode,
                "fill_level"    => $fillLevel,
                "battery_level" => $batteryLevel,
                "bin_status"    => $status,
                "action"        => ($fillLevel >= 90 ? "alert_created" : "normal")
            ]);

        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error: " . $e->getMessage()], 500);
        }
    }

    // ===== إضافة نقطة تتبع =====
    if ($action === "add_tracking") {
        $data = getJsonInput();

        $binCode   = sanitize($data["bin_code"] ?? null);
        $tripCode  = sanitize($data["trip_code"] ?? null);
        $latitude  = isset($data["latitude"]) ? (float)$data["latitude"] : null;
        $longitude = isset($data["longitude"]) ? (float)$data["longitude"] : null;
        $speed     = isset($data["speed"]) ? (float)$data["speed"] : null;
        $battery   = isset($data["battery_level"]) ? (int)$data["battery_level"] : null;
        $fill      = isset($data["fill_level"]) ? (int)$data["fill_level"] : null;

        if (!$binCode || !$latitude || !$longitude) {
            jsonResponse(["status" => "error", "message" => "Missing required fields"], 400);
        }

        try {
            // الحصول على bin_id و trip_id
            $binStmt = $db->prepare("SELECT bin_id FROM bins WHERE bin_code = :code LIMIT 1");
            $binStmt->execute([":code" => $binCode]);
            $bin = $binStmt->fetch();

            if (!$bin) {
                jsonResponse(["status" => "error", "message" => "Bin not found"], 404);
            }

            $tripId = null;
            if ($tripCode) {
                $tripStmt = $db->prepare("SELECT trip_id FROM trips WHERE trip_code = :code LIMIT 1");
                $tripStmt->execute([":code" => $tripCode]);
                $trip = $tripStmt->fetch();
                $tripId = $trip ? $trip['trip_id'] : null;
            }

            // إضافة نقطة التتبع
            $stmt = $db->prepare("
                INSERT INTO tracking_points 
                (trip_id, bin_id, latitude, longitude, speed, battery_level, fill_level, timestamp)
                VALUES (:tid, :bid, :lat, :lon, :speed, :battery, :fill, NOW())
            ");

            $stmt->execute([
                ":tid"     => $tripId,
                ":bid"     => $bin['bin_id'],
                ":lat"     => $latitude,
                ":lon"     => $longitude,
                ":speed"   => $speed,
                ":battery" => $battery,
                ":fill"    => $fill
            ]);

            // تحديث موقع الصندوق
            $updateStmt = $db->prepare("
                UPDATE bins 
                SET latitude = :lat, longitude = :lon, updated_at = NOW()
                WHERE bin_id = :bid
            ");
            $updateStmt->execute([
                ":lat" => $latitude,
                ":lon" => $longitude,
                ":bid" => $bin['bin_id']
            ]);

            jsonResponse([
                "status"  => "success",
                "message" => "Tracking point added",
                "point_id" => $db->lastInsertId()
            ]);

        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

    // ===== إرسال أمر للصندوق =====
    if ($action === "send_command") {
        $data = getJsonInput();

        $binCode  = sanitize($data["bin_code"] ?? null);
        $command  = sanitize($data["command"] ?? null);
        $params   = $data["params"] ?? null;

        if (!$binCode || !$command) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }

        $stmt = $db->prepare("
            INSERT INTO bin_commands (bin_code, command, params, status)
            VALUES (:code, :cmd, :params, 'pending')
        ");

        try {
            $stmt->execute([
                ":code"   => $binCode,
                ":cmd"    => $command,
                ":params" => json_encode($params)
            ]);

            jsonResponse([
                "status"     => "success",
                "message"    => "Command queued",
                "command_id" => $db->lastInsertId()
            ]);

        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

    // ===== تأكيد تنفيذ الأمر =====
    if ($action === "command_done") {
        $data = getJsonInput();
        $commandId = $data["command_id"] ?? null;
        $result    = sanitize($data["result"] ?? "success");

        if (!$commandId) {
            jsonResponse(["status" => "error", "message" => "Missing command_id"], 400);
        }

        $stmt = $db->prepare("
            UPDATE bin_commands
            SET status = 'completed', result = :result, executed_at = NOW()
            WHERE id = :id
        ");

        $stmt->execute([
            ":id"     => $commandId,
            ":result" => $result
        ]);

        jsonResponse(["status" => "success", "message" => "Command marked as completed"]);
    }

    // ===== إضافة تنبيه =====
    if ($action === "add_alert") {
        $data = getJsonInput();

        $binCode    = sanitize($data["bin_code"] ?? null);
        $alertType  = sanitize($data["alert_type"] ?? "warning");
        $category   = sanitize($data["category"] ?? "system");
        $title      = sanitize($data["title"] ?? null);
        $message    = sanitize($data["message"] ?? null);
        $priority   = isset($data["priority"]) ? (int)$data["priority"] : 5;

        if (!$title || !$message) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }

        $binId = null;
        if ($binCode) {
            $binStmt = $db->prepare("SELECT bin_id FROM bins WHERE bin_code = :code LIMIT 1");
            $binStmt->execute([":code" => $binCode]);
            $bin = $binStmt->fetch();
            $binId = $bin ? $bin['bin_id'] : null;
        }

        $stmt = $db->prepare("
            INSERT INTO alerts (bin_id, alert_type, category, title, message, priority, status)
            VALUES (:bid, :type, :cat, :title, :msg, :priority, 'active')
        ");

        try {
            $stmt->execute([
                ":bid"      => $binId,
                ":type"     => $alertType,
                ":cat"      => $category,
                ":title"    => $title,
                ":msg"      => $message,
                ":priority" => $priority
            ]);

            jsonResponse([
                "status"   => "success",
                "message"  => "Alert created",
                "alert_id" => $db->lastInsertId()
            ]);

        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

    // ===== بدء رحلة جديدة =====
    if ($action === "start_trip") {
        $data = getJsonInput();

        $binCode   = sanitize($data["bin_code"] ?? null);
        $routeName = sanitize($data["route_name"] ?? null);
        $startLoc  = sanitize($data["start_location"] ?? null);

        if (!$binCode || !$routeName) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }

        // الحصول على bin_id
        $binStmt = $db->prepare("SELECT bin_id, bin_code, battery_level, fill_level FROM bins WHERE bin_code = :code LIMIT 1");
        $binStmt->execute([":code" => $binCode]);
        $bin = $binStmt->fetch();

        if (!$bin) {
            jsonResponse(["status" => "error", "message" => "Bin not found"], 404);
        }

        // إنشاء trip_code
        $tripCode = 'TRP-' . date('Y') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);

        $stmt = $db->prepare("
            INSERT INTO trips 
            (trip_code, bin_id, route_name, start_location, start_time, 
             fill_level_start, battery_start, status)
            VALUES 
            (:code, :bid, :route, :start, NOW(), :fill, :battery, 'active')
        ");

        try {
            $stmt->execute([
                ":code"    => $tripCode,
                ":bid"     => $bin['bin_id'],
                ":route"   => $routeName,
                ":start"   => $startLoc,
                ":fill"    => $bin['fill_level'],
                ":battery" => $bin['battery_level']
            ]);

            jsonResponse([
                "status"    => "success",
                "message"   => "Trip started",
                "trip_code" => $tripCode,
                "trip_id"   => $db->lastInsertId()
            ]);

        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

    // ===== إضافة إشعار =====
    if ($action === "add_notification") {
        $data = getJsonInput();

        $userId  = $data["user_id"] ?? 1;
        $type    = sanitize($data["type"] ?? "info");
        $title   = sanitize($data["title"] ?? "");
        $message = sanitize($data["message"] ?? "");
        $link    = sanitize($data["link"] ?? "");

        if (!$title || !$message) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }

        $stmt = $db->prepare("
            INSERT INTO notifications (user_id, type, title, message, link, is_read)
            VALUES (:uid, :type, :title, :msg, :link, 0)
        ");

        try {
            $stmt->execute([
                ":uid"   => $userId,
                ":type"  => $type,
                ":title" => $title,
                ":msg"   => $message,
                ":link"  => $link
            ]);

            jsonResponse(["status" => "success", "message" => "Notification added", "id" => $db->lastInsertId()]);
        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

        // ===== إضافة مستخدم جديد (Admin Only) =====
    if ($action === "add_user") {
        $data = getJsonInput();

        $adminRole = $data["admin_role"] ?? "";
        if ($adminRole !== "admin" && $adminRole !== "super_admin") {
            jsonResponse(["status" => "error", "message" => "Access Denied. Admins only."], 403);
        }

        $email    = sanitize($data["email"]     ?? "");
        $password = sanitize($data["password"]  ?? "");
        $fullName = sanitize($data["full_name"] ?? "");
        $role     = sanitize($data["role"]      ?? "user");
        $phone    = sanitize($data["phone"]     ?? "");

        if (!$email || !$password || !$fullName) {
            jsonResponse(["status" => "error", "message" => "Missing required fields"], 400);
        }

        // تحقق إن الايميل مش موجود
        $check = $db->prepare("SELECT user_id FROM users WHERE email = :email LIMIT 1");
        $check->execute([":email" => $email]);
        if ($check->fetch()) {
            jsonResponse(["status" => "error", "message" => "Email already exists"], 409);
        }

        $stmt = $db->prepare("
            INSERT INTO users (email, password, full_name, role, phone, is_active, created_at)
            VALUES (:email, :password, :full_name, :role, :phone, 1, NOW())
        ");

        try {
            $stmt->execute([
                ":email"     => $email,
                ":password"  => $password,
                ":full_name" => $fullName,
                ":role"      => $role,
                ":phone"     => $phone
            ]);

            jsonResponse(["status" => "success", "message" => "User added", "user_id" => $db->lastInsertId()]);
        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

        // ===== إضافة Activity Log =====
    if ($action === "add_activity_log") {
        $data = getJsonInput();

        $userId      = $data["user_id"]      ?? 1;
        $actionType  = sanitize($data["action_type"]  ?? "");
        $entityType  = sanitize($data["entity_type"]  ?? null);
        $entityId    = $data["entity_id"]    ?? null;
        $description = sanitize($data["description"]  ?? "");
        $ipAddress   = $_SERVER["REMOTE_ADDR"] ?? "unknown";
        $userAgent   = $_SERVER["HTTP_USER_AGENT"] ?? "unknown";

        if (!$actionType || !$description) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }

        $stmt = $db->prepare("
            INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, description, ip_address, user_agent)
            VALUES (:uid, :action, :entity_type, :entity_id, :desc, :ip, :ua)
        ");

        try {
            $stmt->execute([
                ":uid"         => $userId,
                ":action"      => $actionType,
                ":entity_type" => $entityType,
                ":entity_id"   => $entityId,
                ":desc"        => $description,
                ":ip"          => $ipAddress,
                ":ua"          => $userAgent
            ]);

            jsonResponse(["status" => "success", "message" => "Log added", "id" => $db->lastInsertId()]);
        } catch (Exception $e) {
            jsonResponse(["status" => "error", "message" => "Database error"], 500);
        }
    }

        jsonResponse(["status" => "error", "message" => "Unknown POST action: " . $action], 404);
}

// ==========================================
// GET Methods
// ==========================================

if ($method === "GET") {

    // ===== قائمة جميع الصناديق =====
    if ($action === "list_bins") {
        $status = sanitize($_GET["status"] ?? "all");
        
        $query = "SELECT * FROM bins WHERE is_active = 1";
        
        if ($status !== "all") {
            $query .= " AND status = :status";
        }
        
        $query .= " ORDER BY updated_at DESC";
        
        $stmt = $db->prepare($query);
        
        if ($status !== "all") {
            $stmt->execute([":status" => $status]);
        } else {
            $stmt->execute();
        }
        
        $bins = $stmt->fetchAll();
        
        jsonResponse(["status" => "success", "data" => $bins, "count" => count($bins)]);
    }

    // ===== الصناديق الممتلئة =====
    if ($action === "full_bins") {
        $stmt = $db->query("
            SELECT * FROM bins 
            WHERE is_active = 1 AND fill_level >= 85 
            ORDER BY fill_level DESC
        ");
        
        $bins = $stmt->fetchAll();
        
        jsonResponse(["status" => "success", "data" => $bins, "count" => count($bins)]);
    }

    // ===== صندوق واحد =====
    if ($action === "get_bin") {
        $binCode = sanitize($_GET["bin_code"] ?? "");
        
        if (!$binCode) {
            jsonResponse(["status" => "error", "message" => "Missing bin_code"], 400);
        }
        
        $stmt = $db->prepare("SELECT * FROM bins WHERE bin_code = :code AND is_active = 1 LIMIT 1");
        $stmt->execute([":code" => $binCode]);
        $bin = $stmt->fetch();
        
        if (!$bin) {
            jsonResponse(["status" => "error", "message" => "Bin not found"], 404);
        }
        
        jsonResponse(["status" => "success", "data" => $bin]);
    }

    // ===== الحصول على أمر للصندوق =====
    if ($action === "get_command") {
        $binCode = sanitize($_GET["bin_code"] ?? null);

        if (!$binCode) {
            jsonResponse(["status" => "error", "message" => "Missing bin_code"], 400);
        }

        $stmt = $db->prepare("
            SELECT * FROM bin_commands
            WHERE bin_code = :code AND status = 'pending'
            ORDER BY id ASC
            LIMIT 1
        ");
        
        $stmt->execute([":code" => $binCode]);
        $cmd = $stmt->fetch();

        if (!$cmd) {
            jsonResponse(["status" => "empty", "message" => "No pending commands"]);
        }

        // تحديث الحالة إلى processing
        $upd = $db->prepare("UPDATE bin_commands SET status = 'processing' WHERE id = :id");
        $upd->execute([":id" => $cmd["id"]]);

        jsonResponse([
            "status"     => "success",
            "command_id" => $cmd["id"],
            "command"    => $cmd["command"],
            "params"     => json_decode($cmd["params"], true)
        ]);
    }

    // ===== قائمة التنبيهات =====
    if ($action === "list_alerts") {
        $status = sanitize($_GET["status"] ?? "active");
        $binCode = sanitize($_GET["bin_code"] ?? null);
        
        $query = "SELECT a.*, b.bin_code, b.bin_name 
                  FROM alerts a 
                  LEFT JOIN bins b ON a.bin_id = b.bin_id 
                  WHERE 1=1";
        
        $params = [];
        
        if ($status !== "all") {
            $query .= " AND a.status = :status";
            $params[":status"] = $status;
        }
        
        if ($binCode) {
            $query .= " AND b.bin_code = :code";
            $params[":code"] = $binCode;
        }
        
        $query .= " ORDER BY a.priority DESC, a.created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $alerts = $stmt->fetchAll();
        
        jsonResponse(["status" => "success", "data" => $alerts, "count" => count($alerts)]);
    }

    // ===== قائمة الرحلات =====
    if ($action === "list_trips") {
        $status = sanitize($_GET["status"] ?? "all");
        $binCode = sanitize($_GET["bin_code"] ?? null);
        
        $query = "SELECT t.*, b.bin_code, b.bin_name 
                  FROM trips t 
                  LEFT JOIN bins b ON t.bin_id = b.bin_id 
                  WHERE 1=1";
        
        $params = [];
        
        if ($status !== "all") {
            $query .= " AND t.status = :status";
            $params[":status"] = $status;
        }
        
        if ($binCode) {
            $query .= " AND b.bin_code = :code";
            $params[":code"] = $binCode;
        }
        
        $query .= " ORDER BY t.start_time DESC LIMIT 100";
        
        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $trips = $stmt->fetchAll();
        
        jsonResponse(["status" => "success", "data" => $trips, "count" => count($trips)]);
    }

    // ===== التاريخ =====
    if ($action === "history") {
        $binCode = sanitize($_GET["bin_code"] ?? null);
        $limit = isset($_GET["limit"]) ? (int)$_GET["limit"] : 100;
        
        if (!$binCode) {
            jsonResponse(["status" => "error", "message" => "Missing bin_code"], 400);
        }
        
        $stmt = $db->prepare("
            SELECT h.* FROM history_readings h
            JOIN bins b ON h.bin_id = b.bin_id
            WHERE b.bin_code = :code
            ORDER BY h.recorded_at DESC
            LIMIT :limit
        ");
        
        $stmt->bindValue(":code", $binCode);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $history = $stmt->fetchAll();
        
        jsonResponse(["status" => "success", "data" => $history, "count" => count($history)]);
    }

    // ===== الإحصائيات =====
    if ($action === "stats") {
        $statsStmt = $db->query("
            SELECT 
                COUNT(*) as total_bins,
                SUM(CASE WHEN status = 'operational' THEN 1 ELSE 0 END) as operational,
                SUM(CASE WHEN fill_level >= 85 THEN 1 ELSE 0 END) as full_bins,
                SUM(CASE WHEN battery_level < 20 THEN 1 ELSE 0 END) as low_battery,
                AVG(fill_level) as avg_fill,
                AVG(battery_level) as avg_battery
            FROM bins WHERE is_active = 1
        ");
        
        $stats = $statsStmt->fetch();
        
        $alertsStmt = $db->query("
            SELECT COUNT(*) as active_alerts 
            FROM alerts WHERE status = 'active'
        ");
        
        $alerts = $alertsStmt->fetch();
        
        jsonResponse([
            "status" => "success",
            "data" => array_merge($stats, $alerts)
        ]);
    }

    // ===== قائمة الإشعارات =====
    if ($action === "list_notifications") {
        $userId = $_GET["user_id"] ?? 1;
        $isRead = $_GET["is_read"] ?? null;

        $query = "SELECT * FROM notifications WHERE user_id = :uid";
        $params = [":uid" => $userId];

        if ($isRead !== null) {
            $query .= " AND is_read = :is_read";
            $params[":is_read"] = (int)$isRead;
        }

        $query .= " ORDER BY created_at DESC LIMIT 50";

        $stmt = $db->prepare($query);
        $stmt->execute($params);
        $notifications = $stmt->fetchAll();

        jsonResponse(["status" => "success", "data" => $notifications, "count" => count($notifications)]);
    }

        // ===== قائمة Activity Logs =====
    if ($action === "list_activity_logs") {
        $userId = $_GET["user_id"] ?? null;
        $limit  = isset($_GET["limit"]) ? (int)$_GET["limit"] : 50;

        $query  = "SELECT * FROM activity_logs WHERE 1=1";
        $params = [];

        if ($userId) {
            $query .= " AND user_id = :uid";
            $params[":uid"] = $userId;
        }

        $query .= " ORDER BY created_at DESC LIMIT :limit";

        $stmt = $db->prepare($query);
        $stmt->bindValue(":limit", $limit, PDO::PARAM_INT);
        foreach ($params as $k => $v) $stmt->bindValue($k, $v);
        $stmt->execute();
        $logs = $stmt->fetchAll();

        jsonResponse(["status" => "success", "data" => $logs, "count" => count($logs)]);
    }

        jsonResponse(["status" => "error", "message" => "Unknown GET action: " . $action], 404);
}


// ==========================================
// PUT Methods
// ==========================================

if ($method === "PUT") {
    
    // ===== تحديث حالة الصندوق =====
    if ($action === "update_bin_status") {
        $data = getJsonInput();
        
        $binCode = sanitize($data["bin_code"] ?? null);
        $status = sanitize($data["status"] ?? null);
        
        if (!$binCode || !$status) {
            jsonResponse(["status" => "error", "message" => "Missing fields"], 400);
        }
        
        $stmt = $db->prepare("
            UPDATE bins 
            SET status = :status, updated_at = NOW()
            WHERE bin_code = :code AND is_active = 1
        ");
        
        $stmt->execute([
            ":status" => $status,
            ":code"   => $binCode
        ]);
        
        jsonResponse(["status" => "success", "message" => "Bin status updated"]);
    }

    jsonResponse(["status" => "error", "message" => "Unknown PUT action"], 404);
}





jsonResponse(["status" => "error", "message" => "Method not allowed: " . $method], 405);
?>