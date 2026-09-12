-- Uni-Track Seed Data (Vadodara City to Parul University)

USE unitrack_db;

-- 1. Insert Routes (4 Vadodara City Routes)
INSERT INTO routes (id, route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km, is_active) VALUES
(1, 'Vadodara Station Express', 'RT-001', 'Vadodara Railway Station to Parul University via Waghodia Road', 'Vadodara Railway Station', 'Parul University Main Gate', 45, 18.50, 1),
(2, 'Sama / Gorwa Route', 'RT-002', 'Sama Road and Gorwa area to Parul University Campus', 'Sama Road BRTS Stop', 'Parul University Main Gate', 40, 16.20, 1),
(3, 'Karelibaug / Fatehgunj Route', 'RT-003', 'Karelibaug and Fatehgunj area to Parul University via Subhanpura', 'Karelibaug Circle', 'Parul University Main Gate', 50, 20.10, 1),
(4, 'Waghodia / Padra Route', 'RT-004', 'Waghodia town and Padra road corridor to Parul University', 'Waghodia Bus Stand', 'Parul University Main Gate', 35, 12.80, 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 2. Insert Route Stops
INSERT INTO route_stops (id, route_id, stop_name, stop_order, latitude, longitude, estimated_time_offset_mins) VALUES
-- Route 1: Vadodara Station Express
(1,  1, 'Vadodara Railway Station',  1, 22.311900, 73.182000, 0),
(2,  1, 'Sayajigunj Circle',         2, 22.309000, 73.189000, 8),
(3,  1, 'Subhanpura Crossroads',     3, 22.302000, 73.220000, 18),
(4,  1, 'Waghodia Crossroads',       4, 22.296500, 73.238000, 30),
(5,  1, 'Parul University Main Gate',5, 22.288700, 73.363400, 45),

-- Route 2: Sama / Gorwa
(6,  2, 'Sama Road BRTS Stop',       1, 22.325000, 73.200000, 0),
(7,  2, 'Gorwa Circle',              2, 22.320000, 73.210000, 7),
(8,  2, 'Harni Road Junction',       3, 22.310000, 73.235000, 18),
(9,  2, 'Waghodia Crossroads',       4, 22.296500, 73.238000, 27),
(10, 2, 'Parul University Main Gate',5, 22.288700, 73.363400, 40),

-- Route 3: Karelibaug / Fatehgunj
(11, 3, 'Karelibaug Circle',         1, 22.320000, 73.190000, 0),
(12, 3, 'Fatehgunj Bus Stop',        2, 22.321000, 73.195000, 6),
(13, 3, 'Subhanpura Crossroads',     3, 22.302000, 73.220000, 20),
(14, 3, 'Waghodia Crossroads',       4, 22.296500, 73.238000, 33),
(15, 3, 'Parul University Main Gate',5, 22.288700, 73.363400, 50),

-- Route 4: Waghodia / Padra
(16, 4, 'Waghodia Bus Stand',        1, 22.330000, 73.300000, 0),
(17, 4, 'Padra Road Junction',       2, 22.315000, 73.310000, 8),
(18, 4, 'Karjan Crossroads',         3, 22.300000, 73.330000, 18),
(19, 4, 'Parul University Main Gate',4, 22.288700, 73.363400, 35)
ON DUPLICATE KEY UPDATE stop_name=VALUES(stop_name);

-- 3. Insert Initial Users
INSERT INTO users (id, role, name, email, phone, student_id, driver_id, password_hash, avatar_url, dob, pickup_stop, assigned_route_id, pass_number, transport_fee_status) VALUES
(1, 'admin', 'System Administrator', 'admin@unitrack.edu', '+19876543210', NULL, NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(2, 'student', 'Mavani Ruchit', '2403051057034@paruluniversity.ac.in', '+919876543210', '2403051057034', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '15082004', 'Sayajigunj Circle', 1, 'PU-PASS-2024-57034', 'paid'),
(3, 'student', 'Samantha Reed', '2403051057002@paruluniversity.ac.in', '+919876543212', '2403051057002', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '20052003', 'Fatehgunj Bus Stop', 3, 'PU-PASS-2024-57002', 'paid'),
(4, 'driver', 'Robert Miller', 'robert.m@driver.unitrack.edu', '+919876543213', NULL, 'DRV-101', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, NULL, 'paid'),
(5, 'driver', 'David Wilson', 'david.w@driver.unitrack.edu', '+919876543214', NULL, 'DRV-102', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(6, 'driver', 'Ramesh Patel', 'ramesh.p@driver.unitrack.edu', '+919876543215', NULL, 'DRV-103', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(7, 'driver', 'Suresh Chauhan', 'suresh.c@driver.unitrack.edu', '+919876543216', NULL, 'DRV-104', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, NULL, 'paid')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 4. Insert Buses (1, 2, 3, 4 with Gujarat Plates)
INSERT INTO buses (id, bus_number, license_plate, capacity, status, assigned_driver_id, current_route_id) VALUES
(1, '1', 'GJ-06-PU-0001', 52, 'active', 4, 1),
(2, '2', 'GJ-06-PU-0002', 52, 'active', 5, 2),
(3, '3', 'GJ-06-PU-0003', 48, 'active', 6, 3),
(4, '4', 'GJ-06-PU-0004', 48, 'active', 7, 4)
ON DUPLICATE KEY UPDATE bus_number=VALUES(bus_number), license_plate=VALUES(license_plate);

-- 5. Insert Live Active Trips (All 4 Routes in Transit)
INSERT INTO trips (id, bus_id, driver_id, route_id, trip_type, status, start_time, end_time) VALUES
(1, 1, 4, 1, 'morning', 'in_progress', CURRENT_TIMESTAMP, NULL),
(2, 2, 5, 2, 'morning', 'in_progress', CURRENT_TIMESTAMP, NULL),
(3, 3, 6, 3, 'morning', 'in_progress', CURRENT_TIMESTAMP, NULL),
(4, 4, 7, 4, 'morning', 'in_progress', CURRENT_TIMESTAMP, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 6. Insert Live GPS Telemetry Locations
INSERT INTO trip_locations (id, trip_id, bus_id, latitude, longitude, speed, heading, accuracy) VALUES
(1, 1, 1, 22.305000, 73.210000, 0.0, 85.0, 4.0),
(2, 2, 2, 22.318000, 73.220000, 0.0, 110.0, 5.0),
(3, 3, 3, 22.315000, 73.205000, 0.0, 95.0, 3.5),
(4, 4, 4, 22.310000, 73.315000, 0.0, 70.0, 4.5)
ON DUPLICATE KEY UPDATE speed=VALUES(speed);

-- 7. Insert Lost & Found Items
INSERT INTO lost_found_items (id, user_id, type, title, description, category, color, item_date, location_name, bus_id, image_url, status) VALUES
(1, 2, 'lost', 'Black Lenovo ThinkPad Laptop', 'Lenovo ThinkPad X1 Carbon with university sticker on the lid. Left near seat 14.', 'electronics', 'Black', CURRENT_DATE - INTERVAL 1 DAY, 'Bus 1 rear seats', 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', 'matched'),
(2, 4, 'found', 'Black Lenovo Laptop with Stickers', 'Found on seat 14 after morning express run. Has blue university sticker.', 'electronics', 'Black', CURRENT_DATE - INTERVAL 1 DAY, 'Bus 1 Terminal', 1, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', 'matched'),
(3, 3, 'lost', 'Brown Leather Student ID Card Wallet', 'Contains student ID card for Samantha Reed and bus pass voucher.', 'documents', 'Brown', CURRENT_DATE, 'Vadodara Station bus stop', 2, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400', 'reported'),
(4, 5, 'found', 'Scientific Calculator Casio fx-991EX', 'Black and white dual tone scientific calculator found in aisle.', 'electronics', 'Black', CURRENT_DATE, 'Bus 2 front seats', 2, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400', 'reported')
ON DUPLICATE KEY UPDATE title=VALUES(title), status=VALUES(status);

-- 8. Insert AI Match Record
INSERT INTO lost_found_matches (id, lost_item_id, found_item_id, match_score, match_reasons, status) VALUES
(1, 1, 2, 94.50, 'Identical brand (Lenovo), exact category match (electronics), color match (black), exact same bus (Bus 1) within same 24-hour timeframe, and matching sticker description.', 'suggested')
ON DUPLICATE KEY UPDATE match_score=VALUES(match_score);

-- 9. Insert Sample Claim
INSERT INTO lost_found_claims (id, item_id, claimant_id, proof_description, proof_image_url, status, admin_notes) VALUES
(1, 2, 2, 'I can verify the serial number ending in 9841 and unlock the system using my fingerprint.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400', 'pending', 'Awaiting claimant serial number verification in admin office')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 10. Sample Emergency Alert
INSERT INTO emergency_alerts (id, driver_id, bus_id, trip_id, alert_type, latitude, longitude, notes, status) VALUES
(1, 4, 1, 1, 'breakdown', 22.305000, 73.210000, 'Minor engine temperature sensor indicator warning. Bus pulled over safely at Sayajigunj Circle.', 'resolved')
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 11. Initial Notifications
INSERT INTO notifications (id, user_id, role, title, message, type, is_read) VALUES
(1, 2, 'student', 'AI Match Found!', 'We found a 94.5% potential match for your reported lost Lenovo ThinkPad on Bus 1.', 'match', 0),
(2, 1, 'admin', 'Fleet Update', 'Bus 1 commenced morning route RT-001 (Vadodara Station Express).', 'trip', 0)
ON DUPLICATE KEY UPDATE title=VALUES(title);
