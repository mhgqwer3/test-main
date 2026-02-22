// ============================================
// api.js - Smart Bins API Service Layer
// Central file that connects all frontend pages
// to the PHP backend (API.php & auth.php)
// ============================================

const API = (() => {

    // ── تعديل الـ BASE_URL لو السيرفر عنده IP مختلف ──
    const BASE_URL = 'http://98.89.224.40:8080';

    // ─────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────

    async function request(url, options = {}) {
        try {
            const res = await fetch(url, {
                headers: { 'Content-Type': 'application/json', ...options.headers },
                ...options
            });
            const json = await res.json();
            return json;
        } catch (err) {
            console.error('[API Error]', url, err);
            return { status: 'error', message: 'Network error or server unreachable' };
        }
    }

    function get(endpoint) {
        return request(`${BASE_URL}/${endpoint}`);
    }

    function post(endpoint, body) {
        return request(`${BASE_URL}/${endpoint}`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    function put(endpoint, body) {
        return request(`${BASE_URL}/${endpoint}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    }

    // ─────────────────────────────────────────
    // Auth  (auth.php)
    // ─────────────────────────────────────────

    async function login(email, password) {
        return post('auth.php?action=login', { email, password });
    }

    async function logout() {
        return post('auth.php?action=logout', {});
    }

    // ─────────────────────────────────────────
    // Bins  (API.php)
    // ─────────────────────────────────────────

    async function listBins(status = 'all') {
        const qs = status !== 'all' ? `&status=${status}` : '';
        return get(`API.php?action=list_bins${qs}`);
    }

    async function getBin(binCode) {
        return get(`API.php?action=get_bin&bin_code=${binCode}`);
    }

    async function getFullBins() {
        return get('API.php?action=full_bins');
    }

    async function getStats() {
        return get('API.php?action=stats');
    }

    async function updateBinStatus(binCode, status) {
        return put('API.php?action=update_bin_status', { bin_code: binCode, status });
    }

    async function updateSensor(data) {
        return post('API.php?action=update_sensor', data);
    }

    // ─────────────────────────────────────────
    // Alerts  (API.php)
    // ─────────────────────────────────────────

    async function listAlerts(status = 'active', binCode = null) {
        let qs = `action=list_alerts&status=${status}`;
        if (binCode) qs += `&bin_code=${binCode}`;
        return get(`API.php?${qs}`);
    }

    async function addAlert(data) {
        return post('API.php?action=add_alert', data);
    }

    // ─────────────────────────────────────────
    // Trips  (API.php)
    // ─────────────────────────────────────────

    async function listTrips(status = 'all', binCode = null) {
        let qs = `action=list_trips&status=${status}`;
        if (binCode) qs += `&bin_code=${binCode}`;
        return get(`API.php?${qs}`);
    }

    async function startTrip(data) {
        return post('API.php?action=start_trip', data);
    }

    // ─────────────────────────────────────────
    // Tracking  (API.php)
    // ─────────────────────────────────────────

    async function addTracking(data) {
        return post('API.php?action=add_tracking', data);
    }

    async function getHistory(binCode, limit = 50) {
        return get(`API.php?action=history&bin_code=${binCode}&limit=${limit}`);
    }

    // ─────────────────────────────────────────
    // Commands  (API.php)
    // ─────────────────────────────────────────

    async function sendCommand(binCode, command, params = {}) {
        return post('API.php?action=send_command', { bin_code: binCode, command, params });
    }

    async function getCommand(binCode) {
        return get(`API.php?action=get_command&bin_code=${binCode}`);
    }

    async function commandDone(commandId, result = 'success') {
        return post('API.php?action=command_done', { command_id: commandId, result });
    }

    // ─────────────────────────────────────────
    // Session Helpers
    // ─────────────────────────────────────────

    function saveSession(user, token) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', user.email);
        sessionStorage.setItem('userRole', user.role);
        sessionStorage.setItem('userName', user.full_name);
        sessionStorage.setItem('userId', user.user_id);
        sessionStorage.setItem('token', token);
    }

    function clearSession() {
        sessionStorage.clear();
    }

    function isLoggedIn() {
        return sessionStorage.getItem('isLoggedIn') === 'true';
    }

    function getSession() {
        return {
            email:  sessionStorage.getItem('userEmail'),
            role:   sessionStorage.getItem('userRole'),
            name:   sessionStorage.getItem('userName'),
            id:     sessionStorage.getItem('userId'),
            token:  sessionStorage.getItem('token'),
        };
    }

    // ─────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────
    return {
        // auth
        login, logout,
        // bins
        listBins, getBin, getFullBins, getStats, updateBinStatus, updateSensor,
        // alerts
        listAlerts, addAlert,
        // trips
        listTrips, startTrip,
        // tracking
        addTracking, getHistory,
        // commands
        sendCommand, getCommand, commandDone,
        // session
        saveSession, clearSession, isLoggedIn, getSession,
        BASE_URL
    };

})();