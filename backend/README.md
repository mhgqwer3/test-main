# Smart Bins System - Backend API

## Project Information
**Name:** Smart Bins System  
**Type:** Waste Management Tracking System  
**Backend:** PHP 7.4+ with PDO/MySQL

## Requirements

### PHP Extensions
- `php >= 7.4`
- `ext-pdo` - PHP Data Objects
- `ext-pdo_mysql` - MySQL driver for PDO
- `ext-json` - JSON support
- `ext-mbstring` - Multibyte string support

### Database
- MySQL 5.7+ or MySQL 8.0
- Database name: `smart_bins_system`

### Web Server
- Apache 2.4+ with mod_rewrite
- Or PHP built-in server (for development)

## Installation

### Using Docker
```bash
# Build and start all services
docker-compose up -d --build

# Backend will be available at: http://localhost:8080
# Frontend will be available at: http://localhost:80
```

### Manual Installation
```bash
# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
nano .env

# Import database
mysql -u root -p smart_bins_system < Database/smart_bins_system.sql

# Start PHP server (development)
php -S localhost:8080
```

## Environment Variables
See `.env.example` for all available configuration options.

## API Endpoints
- Base URL: `http://localhost:8080`
- Documentation: See `api/API_DOCUMENTATION.md`

## Main Files
- `API.php` - Main API endpoint
- `auth.php` - Authentication endpoint
- `Helpers.php` - Helper functions and database connection
