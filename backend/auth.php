<?php
header("Content-Type: application/json; charset=utf-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . "/Helpers.php";

$pdo = getDbConnection();
$method = $_SERVER["REQUEST_METHOD"];
$data = getJsonInput();
$action = $_GET["action"] ?? ($data["action"] ?? "");

// ==============================
// تسجيل الدخول
// ==============================
if ($method === "POST" && $action === "login") {

    $email    = trim($data["email"] ?? "");
    $password = trim($data["password"] ?? "");

    if ($email === "" || $password === "") {
        jsonResponse(["status" => "error", "message" => "Missing email or password"], 400);
    }

    $stmt = $pdo->prepare("
        SELECT user_id, email, password, full_name, role
        FROM users
        WHERE email = ?
        LIMIT 1
    ");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user || $password !== $user["password"]) { 
        jsonResponse(["status" => "error", "message" => "Invalid email or password"], 401);
    }

    // تحديث آخر تسجيل دخول
    $upd = $pdo->prepare("UPDATE users SET last_login = NOW() WHERE user_id = ?");
    $upd->execute([$user["user_id"]]);

    // توكن بسيط
    $token = base64_encode($user["user_id"] . "|" . sha1($user["email"] . time()));

    jsonResponse([
        "status"  => "success",
        "message" => "Login successful",
        "token"   => $token,
        "user"    => [
            "user_id"   => $user["user_id"],
            "email"     => $user["email"],
            "full_name" => $user["full_name"],
            "role"      => $user["role"]
        ]
    ]);
}

// ==============================
// تسجيل الخروج
// ==============================
if ($method === "POST" && $action === "logout") {
    jsonResponse(["status" => "success", "message" => "Logged out"]);
}

// ==============================
// أكشن غير معروف
// ==============================
jsonResponse(["status" => "error", "message" => "Unknown action"], 404);