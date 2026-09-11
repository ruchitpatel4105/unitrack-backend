-- Uni-Track Seed Data

USE unitrack_db;

-- 1. Insert Initial Users
-- Password for all seed users is: password123 (or respective role password like admin123, student123, driver123)
-- bcrypt hash for 'password123': $2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS
INSERT INTO users (id, role, name, email, phone, student_id, driver_id, password_hash, avatar_url) VALUES
(1, 'admin', 'System Administrator', 'admin@unitrack.edu', '+19876543210', NULL, NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
(2, 'student', 'Alex Johnson', 'alex.j@student.unitrack.edu', '+19876543211', 'STD-2024-001', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
(3, 'student', 'Samantha Reed', 'samantha.r@student.unitrack.edu', '+19876543212', 'STD-2024-002', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
(4, 'driver', 'Robert Miller', 'robert.m@driver.unitrack.edu', '+19876543213', NULL, 'DRV-101', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
(5, 'driver', 'David Wilson', 'david.w@driver.unitrack.edu', '+19876543214', NULL, 'DRV-102', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Routes
INSERT INTO routes (id, route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km, is_active) VALUES
(1, 'Campus Express - North Route', 'RT-NORTH-101', 'Direct express transit from North Metro Hub to Engineering Block', 'North Metro Station', 'Engineering Campus Gate 3', 35, 14.50, 1),
(2, 'South Suburban Shuttle', 'RT-SOUTH-202', 'Connecting South City Residential Complex to Main University Library', 'South City Plaza', 'Central Library Complex', 45, 18.20, 1),
(3, 'East Hostel Campus Circulator', 'RT-CIRC-303', 'Loop service covering Hostels, Sports Complex, and Medical Sciences', 'Hostel Block A', 'Medical Science Quad', 25, 8.75, 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 3. Insert Route Stops
INSERT INTO route_stops (id, route_id, stop_name, stop_order, latitude, longitude, estimated_time_offset_mins) VALUES
-- Route 1 Stops
(1, 1, 'North Metro Station', 1, 12.971598, 77.594566, 0),
(2, 1, 'Tech Park Junction', 2, 12.976850, 77.599120, 10),
(3, 1, 'University North Gate', 3, 12.982400, 77.604500, 20),
(4, 1, 'Science & Tech Annex', 4, 12.986200, 77.608900, 28),
(5, 1, 'Engineering Campus Gate 3', 5, 12.990500, 77.614200, 35),

-- Route 2 Stops
(6, 2, 'South City Plaza', 1, 12.915000, 77.585000, 0),
(7, 2, 'Ring Road Overpass', 2, 12.928000, 77.589000, 12),
(8, 2, 'Student Housing Enclave', 3, 12.942000, 77.593000, 24),
(9, 2, 'Main Auditorium Gate', 4, 12.955000, 77.598000, 35),
(10, 2, 'Central Library Complex', 5, 12.962000, 77.602000, 45),

-- Route 3 Stops
(11, 3, 'Hostel Block A', 1, 12.980000, 77.610000, 0),
(12, 3, 'Olympic Sports Complex', 2, 12.983000, 77.612000, 8),
(13, 3, 'Student Activity Center', 3, 12.987000, 77.615000, 16),
(14, 3, 'Medical Science Quad', 4, 12.991000, 77.618000, 25)
ON DUPLICATE KEY UPDATE stop_name=VALUES(stop_name);

-- 4. Insert Buses
INSERT INTO buses (id, bus_number, license_plate, capacity, model, status, assigned_driver_id, current_route_id) VALUES
(1, 'BUS-101', 'KA-01-EQ-4421', 52, 'Volvo B8R Low Floor', 'active', 4, 1),
(2, 'BUS-102', 'KA-01-EQ-8812', 45, 'Tata Starbus Ultra', 'active', 5, 2),
(3, 'BUS-103', 'KA-01-EQ-9904', 36, 'Ashok Leyland Oyster', 'in_maintenance', NULL, 3)
ON DUPLICATE KEY UPDATE bus_number=VALUES(bus_number);

-- 5. Insert Sample Scheduled and In-Progress Trips
INSERT INTO trips (id, bus_id, driver_id, route_id, trip_type, status, start_time, end_time) VALUES
(1, 1, 4, 1, 'morning', 'in_progress', CURRENT_TIMESTAMP - INTERVAL 15 MINUTE, NULL),
(2, 2, 5, 2, 'morning', 'scheduled', CURRENT_TIMESTAMP + INTERVAL 30 MINUTE, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 6. Insert Live Location Breadcrumb
INSERT INTO trip_locations (trip_id, bus_id, latitude, longitude, speed, heading, accuracy) VALUES
(1, 1, 12.978200, 77.601200, 38.5, 45.0, 3.2);

-- 7. Insert Lost & Found Items
INSERT INTO lost_found_items (id, user_id, type, title, description, category, color, item_date, location_name, bus_id, image_url, status) VALUES
(1, 2, 'lost', 'Black Lenovo ThinkPad Laptop', 'Lenovo ThinkPad X1 Carbon with university sticker on the lid. Left near seat 14.', 'electronics', 'Black', CURRENT_DATE - INTERVAL 1 DAY, 'Bus 101 rear seats', 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', 'matched'),
(2, 4, 'found', 'Black Lenovo Laptop with Stickers', 'Found on seat 14 after morning express run. Has blue university sticker.', 'electronics', 'Black', CURRENT_DATE - INTERVAL 1 DAY, 'Bus 101 Terminal', 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', 'matched'),
(3, 3, 'lost', 'Brown Leather Student ID Card Wallet', 'Contains student ID card for Samantha Reed and bus pass voucher.', 'documents', 'Brown', CURRENT_DATE, 'Central Library Complex bus stop', 2, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300', 'reported'),
(4, 5, 'found', 'Scientific Calculator Casio fx-991EX', 'Black and white dual tone scientific calculator found in aisle.', 'electronics', 'Black', CURRENT_DATE, 'Bus 102 front seats', 2, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=300', 'reported')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 8. Insert AI Match Record
INSERT INTO lost_found_matches (id, lost_item_id, found_item_id, match_score, match_reasons, status) VALUES
(1, 1, 2, 94.50, 'Identical brand (Lenovo), exact category match (electronics), color match (black), exact same bus (BUS-101) within same 24-hour timeframe, and matching sticker description.', 'suggested')
ON DUPLICATE KEY UPDATE match_score=VALUES(match_score);

-- 9. Insert Sample Claim
INSERT INTO lost_found_claims (id, item_id, claimant_id, proof_description, proof_image_url, status, admin_notes) VALUES
(1, 2, 2, 'I can verify the serial number ending in 9841 and unlock the system using my fingerprint.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=300', 'pending', 'Awaiting claimant serial number verification in admin office')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Sample Emergency Alert
INSERT INTO emergency_alerts (id, driver_id, bus_id, trip_id, alert_type, latitude, longitude, notes, status) VALUES
(1, 4, 1, 1, 'breakdown', 12.978200, 77.601200, 'Minor engine temperature sensor indicator warning. Bus pulled over safely at Tech Park Junction.', 'resolved')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 11. Initial Notifications
INSERT INTO notifications (user_id, role, title, message, type, is_read) VALUES
(2, 'student', 'AI Match Found!', 'We found a 94.5% potential match for your reported lost Lenovo ThinkPad on Bus 101.', 'match', 0),
(1, 'admin', 'Fleet Update', 'Bus 101 commenced morning route RT-NORTH-101.', 'trip', 0);
