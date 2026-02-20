# Smart Bins Management System API

نظام REST API لإدارة الصناديق الذكية، يربط بين الهاردوير (Sensors / Raspberry Pi) وبين الـ Dashboard وتطبيق الموبايل.

## 1. معلومات التشغيل

- Server: XAMPP Apache
- Base URL (محليًا):
```
http://localhost/smart-bins/api/
```

أو على الشبكة:
```
http://your-ip/smart-bins/api/
```

- جميع الـ APIs ترجع JSON بالصيغة:
```json
{
  "status": "success | error",
  "message": "اختياري",
  "data": {}
}
```

---

## 2. Authentication (auth.php)

### 2.1 Login

- **Method:** `POST`
- **URL:** `/auth.php?action=login`

#### Request Body (JSON)
```json
{
  "email": "admin@smartbins.com",
  "password": "password123"
}
```

#### Response (نجاح)
```json
{
  "status": "success",
  "message": "Login ok",
  "user": {
    "user_id": 1,
    "full_name": "Admin User",
    "email": "admin@smartbins.com",
    "role": "super_admin",
    "phone": "+20123456789",
    "avatar_url": null,
    "last_login": "2024-02-15 10:30:00",
    "created_at": "2024-01-01 00:00:00",
    "updated_at": "2024-02-15 10:30:00"
  },
  "token": "BASE64_TOKEN"
}
```

### 2.2 Logout

- **Method:** `POST`
- **URL:** `/auth.php?action=logout`

#### Response
```json
{
  "status": "success",
  "message": "Logged out"
}
```

---

## 3. Bins / Sensors API (API.php)

### 3.1 تحديث بيانات الصندوق (من الهاردوير)

- **Method:** `POST`
- **URL:** `/API.php?action=update_sensor`

#### Body
```json
{
  "bin_code": "BIN-001",
  "location": "Al Gomhoria St, Mansoura",
  "fill_level": 75,
  "battery_level": 85,
  "latitude": 31.0364,
  "longitude": 31.3807
}
```

#### Response
```json
{
  "status": "success",
  "bin_code": "BIN-001",
  "fill_level": 75,
  "battery_level": 85,
  "bin_status": "operational",
  "action": "normal"
}
```

### 3.2 جلب كل الصناديق

- **Method:** `GET`
- **URL:** `/API.php?action=list_bins`
- **URL (مع فلترة):** `/API.php?action=list_bins&status=operational`

#### Response
```json
{
  "status": "success",
  "data": [
    {
      "bin_id": 1,
      "bin_code": "BIN-001",
      "bin_name": "Smart Bin 001",
      "status": "operational",
      "zone": "zone-a",
      "location_name": "Al Gomhoria St, Mansoura",
      "latitude": 31.0364,
      "longitude": 31.3807,
      "battery_level": 85,
      "fill_level": 75,
      "capacity": 100,
      "updated_at": "2024-02-15 10:30:00"
    }
  ],
  "count": 8
}
```

### 3.3 جلب الصناديق الممتلئة

- **Method:** `GET`
- **URL:** `/API.php?action=full_bins`

### 3.4 جلب صندوق واحد

- **Method:** `GET`
- **URL:** `/API.php?action=get_bin&bin_code=BIN-001`

### 3.5 الإحصائيات العامة

- **Method:** `GET`
- **URL:** `/API.php?action=stats`

#### Response
```json
{
  "status": "success",
  "data": {
    "total_bins": 8,
    "operational": 6,
    "full_bins": 2,
    "low_battery": 1,
    "avg_fill": 65.5,
    "avg_battery": 78.3,
    "active_alerts": 5
  }
}
```

---

## 4. Tracking API (تتبع GPS)

### 4.1 إضافة نقطة تتبع

- **Method:** `POST`
- **URL:** `/API.php?action=add_tracking`

#### Body
```json
{
  "bin_code": "BIN-001",
  "trip_code": "TRP-2024-001",
  "latitude": 31.0370,
  "longitude": 31.3810,
  "speed": 25.5,
  "battery_level": 85,
  "fill_level": 65
}
```

#### Response
```json
{
  "status": "success",
  "message": "Tracking point added",
  "point_id": 123
}
```

---

## 5. Commands API (أوامر الصناديق)

### 5.1 إرسال أمر

- **Method:** `POST`
- **URL:** `/API.php?action=send_command`

#### Body
```json
{
  "bin_code": "BIN-001",
  "command": "collect",
  "params": {
    "priority": "high"
  }
}
```

#### Response
```json
{
  "status": "success",
  "message": "Command queued",
  "command_id": 45
}
```

### 5.2 سحب آخر أمر للجهاز

- **Method:** `GET`
- **URL:** `/API.php?action=get_command&bin_code=BIN-001`

#### Response (إذا يوجد أمر)
```json
{
  "status": "success",
  "command_id": 45,
  "command": "collect",
  "params": {
    "priority": "high"
  }
}
```

#### Response (إذا لا يوجد)
```json
{
  "status": "empty",
  "message": "No pending commands"
}
```

### 5.3 تأكيد تنفيذ الأمر

- **Method:** `POST`
- **URL:** `/API.php?action=command_done`

#### Body
```json
{
  "command_id": 45,
  "result": "success: Collection completed"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Command marked as completed"
}
```

**الأوامر المتاحة:**
- `collect` - بدء عملية الجمع
- `return_base` - العودة للقاعدة
- `reset_sensor` - إعادة ضبط الحساس
- `emergency_stop` - إيقاف طارئ

---

## 6. Alerts API (التنبيهات)

### 6.1 إضافة تنبيه

- **Method:** `POST`
- **URL:** `/API.php?action=add_alert`

#### Body
```json
{
  "bin_code": "BIN-001",
  "alert_type": "warning",
  "category": "fill_level",
  "title": "Bin Almost Full",
  "message": "BIN-001 fill level reached 90%",
  "priority": 8
}
```

**alert_type:** `critical` | `warning` | `info` | `success`  
**category:** `battery` | `fill_level` | `maintenance` | `system` | `location` | `trip`

#### Response
```json
{
  "status": "success",
  "message": "Alert created",
  "alert_id": 12
}
```

### 6.2 عرض التنبيهات

- **كل التنبيهات:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_alerts`

- **تنبيهات صندوق معيّن:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_alerts&bin_code=BIN-001`

- **تنبيهات نشطة فقط:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_alerts&status=active`

#### Response
```json
{
  "status": "success",
  "data": [
    {
      "alert_id": 1,
      "bin_code": "BIN-001",
      "bin_name": "Smart Bin 001",
      "alert_type": "warning",
      "category": "fill_level",
      "title": "Bin Almost Full",
      "message": "BIN-001 fill level reached 90%",
      "status": "active",
      "priority": 8,
      "created_at": "2024-02-15 10:30:00"
    }
  ],
  "count": 5
}
```

---

## 7. Trips API (الرحلات)

### 7.1 بدء رحلة جديدة

- **Method:** `POST`
- **URL:** `/API.php?action=start_trip`

#### Body
```json
{
  "bin_code": "BIN-001",
  "route_name": "Route A-1",
  "start_location": "Al Gomhoria St"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Trip started",
  "trip_code": "TRP-2024-5678",
  "trip_id": 89
}
```

### 7.2 عرض الرحلات

- **كل الرحلات:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_trips`

- **رحلات صندوق معيّن:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_trips&bin_code=BIN-001`

- **رحلات نشطة فقط:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=list_trips&status=active`

---

## 8. History Readings API (التاريخ)

### 8.1 عرض القراءات التاريخية

- **كل القراءات:**
  - **Method:** `GET`
  - **URL:** `/API.php?action=history&bin_code=BIN-001&limit=50`

#### Response
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "bin_code": "BIN-001",
      "fill_level": 75,
      "battery_level": 85,
      "latitude": 31.0364,
      "longitude": 31.3807,
      "recorded_at": "2024-02-15 10:30:00"
    }
  ],
  "count": 50
}
```

---

## 9. Management API (إدارة الصناديق)

### 9.1 تحديث حالة الصندوق

- **Method:** `PUT`
- **URL:** `/API.php?action=update_bin_status`

#### Body
```json
{
  "bin_code": "BIN-001",
  "status": "maintenance"
}
```

**الحالات المتاحة:** `operational` | `maintenance` | `charging` | `offline`

#### Response
```json
{
  "status": "success",
  "message": "Bin status updated"
}
```

---

## 10. ملاحظات للـ Front-End والموبايل

### عامة
- يجب إرسال `Content-Type: application/json` مع كل طلب `POST` و `PUT`.
- يمكن حفظ الـ token الراجع من `/auth.php?action=login` لاستخدامه لاحقًا.
- يمكن استبدال `localhost` بـ IP السيرفر عند التشغيل على شبكة محلية.

### من JavaScript
```javascript
// مثال: تسجيل الدخول
fetch('http://localhost/smart-bins/api/auth.php?action=login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@smartbins.com',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

### من Raspberry Pi (Python)
```python
import requests

# مثال: إرسال بيانات الحساس
url = "http://192.168.1.100/smart-bins/api/API.php?action=update_sensor"
data = {
    "bin_code": "BIN-001",
    "fill_level": 75,
    "battery_level": 85
}

response = requests.post(url, json=data, timeout=5)
print(response.json())
```

---

## 11. بيانات تسجيل الدخول الافتراضية

### Super Admin
```
Email: admin@smartbins.com
Password: password123
```

### Operator
```
Email: operator@smartbins.com
Password: password123
```

⚠️ **مهم:** غيّر كلمات المرور في بيئة الإنتاج!

---

## 12. قاعدة البيانات

### الجداول الرئيسية
- `users` - المستخدمين
- `bins` - الصناديق
- `trips` - الرحلات
- `tracking_points` - نقاط GPS
- `alerts` - التنبيهات
- `bin_commands` - الأوامر
- `history_readings` - التاريخ
- `maintenance_records` - الصيانة
- `activity_logs` - سجل النشاط

### اسم قاعدة البيانات
```
smart_bins_system
```

---

## 13. HTTP Status Codes

| Code | المعنى |
|------|--------|
| 200 | نجاح العملية |
| 400 | بيانات ناقصة أو خاطئة |
| 401 | غير مصرح (Unauthorized) |
| 404 | غير موجود (Not Found) |
| 500 | خطأ في السيرفر |

---

## 14. أمثلة سريعة (cURL)

### تسجيل الدخول
```bash
curl -X POST "http://localhost/smart-bins/api/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartbins.com","password":"password123"}'
```

### جلب كل الصناديق
```bash
curl "http://localhost/smart-bins/api/API.php?action=list_bins"
```

### إرسال بيانات حساس
```bash
curl -X POST "http://localhost/smart-bins/api/API.php?action=update_sensor" \
  -H "Content-Type: application/json" \
  -d '{"bin_code":"BIN-001","fill_level":75,"battery_level":85}'
```

---

## 15. الملفات المطلوبة

```
api/
├── Helpers.php       (دوال مساعدة - مطلوب)
├── auth.php          (المصادقة)
└── API.php           (العمليات الرئيسية)
```

---

