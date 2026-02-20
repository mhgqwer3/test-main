<?php
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/Helpers.php";

$pdo = getDbConnection();
$method = $_SERVER["REQUEST_METHOD"];

$data = getJsonInput();
$action = $_GET["action"] ?? $data["action"] ?? "";

// ==============================
// تسجيل الخروج
// ==============================
if ($method === "POST" && $action === "logout") {
    jsonResponse([
        "status"  => "success",
        "message" => "Logged out"
    ]);
}

// ==============================
// أكشن غير معروف
// ==============================
jsonResponse(["status"=>"error","message"=>"Unknown action"], 404);
