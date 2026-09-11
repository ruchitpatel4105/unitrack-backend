-- Uni-Track Database Schema
-- Compatible with MySQL 5.7+ and MySQL 8.0+

CREATE DATABASE IF NOT EXISTS unitrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE unitrack_db;

-- 1. Bus Routes Table
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    route_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT NULL,
    start_point VARCHAR(100) NOT NULL,
    end_point VARCHAR(100) NOT NULL,
    estimated_duration_mins INT DEFAULT 45,
    distance_km DECIMAL(6,2) DEFAULT 15.00,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Route Stops Table (Ordered waypoints)
CREATE TABLE IF NOT EXISTS route_stops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    route_id INT NOT NULL,
    stop_name VARCHAR(100) NOT NULL,
    stop_order INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    estimated_time_offset_mins INT DEFAULT 0,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_route_order (route_id, stop_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table (Admin, Student, Driver)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role ENUM('admin', 'student', 'driver') NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    student_id VARCHAR(50) UNIQUE NULL,
    driver_id VARCHAR(50) UNIQUE NULL,
    dob VARCHAR(20) NULL,
    pickup_stop VARCHAR(100) NULL,
    assigned_route_id INT NULL,
    pass_number VARCHAR(50) UNIQUE NULL,
    transport_fee_status ENUM('paid', 'pending', 'waived') DEFAULT 'paid',
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) NULL,
    fcm_token VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_user_role (role),
    INDEX idx_user_student_id (student_id),
    INDEX idx_user_driver_id (driver_id),
    INDEX idx_user_phone (phone),
    INDEX idx_user_pass_number (pass_number),
    INDEX idx_user_assigned_route (assigned_route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Buses Table
CREATE TABLE IF NOT EXISTS buses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_number VARCHAR(30) UNIQUE NOT NULL,
    license_plate VARCHAR(30) UNIQUE NOT NULL,
    capacity INT DEFAULT 50,
    status ENUM('active', 'in_maintenance', 'inactive') DEFAULT 'active',
    assigned_driver_id INT NULL,
    current_route_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (current_route_id) REFERENCES routes(id) ON DELETE SET NULL,
    INDEX idx_bus_driver (assigned_driver_id),
    INDEX idx_bus_route (current_route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bus_id INT NOT NULL,
    driver_id INT NOT NULL,
    route_id INT NOT NULL,
    trip_type ENUM('morning', 'evening', 'special') DEFAULT 'morning',
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_trip_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Trip Real-time GPS Locations Table
CREATE TABLE IF NOT EXISTS trip_locations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    bus_id INT NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    speed DECIMAL(5,2) DEFAULT 0.00,
    heading DECIMAL(5,2) DEFAULT 0.00,
    accuracy DECIMAL(6,2) DEFAULT 5.00,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_trip_bus_time (trip_id, bus_id, recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Lost & Found Items Table
CREATE TABLE IF NOT EXISTS lost_found_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('lost', 'found') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category ENUM('electronics', 'documents', 'accessories', 'bags', 'clothing', 'other') DEFAULT 'other',
    color VARCHAR(50) NULL,
    item_date DATE NOT NULL,
    location_name VARCHAR(150) NOT NULL,
    bus_id INT NULL,
    image_url VARCHAR(255) NULL,
    status ENUM('reported', 'matched', 'claimed', 'resolved', 'closed') DEFAULT 'reported',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE SET NULL,
    INDEX idx_lf_type (type),
    INDEX idx_lf_status (status),
    INDEX idx_lf_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Lost & Found Claims Table
CREATE TABLE IF NOT EXISTS lost_found_claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    claimant_id INT NOT NULL,
    proof_description TEXT NOT NULL,
    proof_image_url VARCHAR(255) NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    admin_notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES lost_found_items(id) ON DELETE CASCADE,
    FOREIGN KEY (claimant_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_claim_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. AI Matches Table
CREATE TABLE IF NOT EXISTS lost_found_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lost_item_id INT NOT NULL,
    found_item_id INT NOT NULL,
    match_score DECIMAL(5,2) NOT NULL,
    match_reasons TEXT NULL,
    status ENUM('suggested', 'confirmed', 'dismissed') DEFAULT 'suggested',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lost_item_id) REFERENCES lost_found_items(id) ON DELETE CASCADE,
    FOREIGN KEY (found_item_id) REFERENCES lost_found_items(id) ON DELETE CASCADE,
    UNIQUE KEY unique_match (lost_item_id, found_item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Emergency Alerts Table
CREATE TABLE IF NOT EXISTS emergency_alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    bus_id INT NOT NULL,
    trip_id INT NULL,
    alert_type ENUM('breakdown', 'medical', 'accident', 'security', 'other') DEFAULT 'other',
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    notes TEXT NULL,
    status ENUM('active', 'acknowledged', 'resolved') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
    INDEX idx_emergency_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    role ENUM('all', 'admin', 'student', 'driver') DEFAULT 'all',
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('trip', 'match', 'claim', 'emergency', 'general') DEFAULT 'general',
    is_read TINYINT(1) DEFAULT 0,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user_read (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
