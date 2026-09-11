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
(1, 'Parul Campus Express - North Loop', 'PU-EXP-101', 'Campus loop covering Main Gate, Engineering Quad, and Parul Sevashram Hospital', 'Parul Main Gate & Admin Block', 'Hostel Enclaves & Sports Pavilion', 20, 6.50, 1),
(2, 'Vadodara Station - Parul Campus Shuttle', 'PU-CTY-202', 'Connecting Vadodara Central Station to Parul University Campus Terminal', 'Vadodara Railway Station', 'Parul Main Gate Terminal', 40, 17.80, 1),
(3, 'East Campus & Medical Circulator', 'PU-CIRC-303', 'Internal shuttle for Hostels, Library, and Parul Sevashram Medical Quad', 'Hostel Block A', 'Parul Sevashram Hospital', 15, 4.20, 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 3. Insert Route Stops
INSERT INTO route_stops (id, route_id, stop_name, stop_order, latitude, longitude, estimated_time_offset_mins) VALUES
-- Route 1 Stops (Parul Campus)
(1, 1, 'Parul Main Gate & Admin Block', 1, 22.288700, 73.363400, 0),
(2, 1, 'Faculty of Engineering & IT', 2, 22.289500, 73.364800, 5),
(3, 1, 'Parul Sevashram Hospital', 3, 22.290800, 73.362000, 10),
(4, 1, 'Central Library & SAC', 4, 22.287800, 73.361200, 15),
(5, 1, 'Hostel Enclaves & Sports Pavilion', 5, 22.286200, 73.364000, 20),

-- Route 2 Stops (Vadodara to Parul)
(6, 2, 'Vadodara Central Station', 1, 22.310800, 73.181200, 0),
(7, 2, 'Sayajigunj Circle', 2, 22.312000, 73.190500, 8),
(8, 2, 'Fatehgunj Flyover', 3, 22.321000, 73.195000, 18),
(9, 2, 'Waghodia Cross Roads', 4, 22.296500, 73.238000, 30),
(10, 2, 'Parul Main Gate Terminal', 5, 22.288700, 73.363400, 40),

-- Route 3 Stops (Campus Circulator)
(11, 3, 'Hostel Block A', 1, 22.286200, 73.364000, 0),
(12, 3, 'Sports Complex', 2, 22.287000, 73.365000, 5),
(13, 3, 'Central Library', 3, 22.287800, 73.361200, 10),
(14, 3, 'Parul Sevashram Hospital', 4, 22.290800, 73.362000, 15)
ON DUPLICATE KEY UPDATE stop_name=VALUES(stop_name);

-- 4. Insert Buses
INSERT INTO buses (id, bus_number, license_plate, capacity, model, status, assigned_driver_id, current_route_id) VALUES
(1, 'BUS-101', 'GJ-06-PU-1001', 52, 'Tata Starbus Ultra Campus EV', 'active', 4, 1),
(2, 'BUS-102', 'GJ-06-PU-1002', 45, 'Eicher Skyline Pro Campus', 'active', 5, 2),
(3, 'BUS-103', 'GJ-06-PU-1003', 36, 'Ashok Leyland Falcon', 'in_maintenance', NULL, 3)
ON DUPLICATE KEY UPDATE bus_number=VALUES(bus_number);

-- 5. Insert Sample Scheduled Trips (Buses at Campus Depot)
INSERT INTO trips (id, bus_id, driver_id, route_id, trip_type, status, start_time, end_time) VALUES
(1, 1, 4, 1, 'morning', 'scheduled', CURRENT_TIMESTAMP + INTERVAL 60 MINUTE, NULL),
(2, 2, 5, 2, 'morning', 'scheduled', CURRENT_TIMESTAMP + INTERVAL 90 MINUTE, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 6. Insert Live Location Breadcrumb (Campus Depot Standby)
INSERT INTO trip_locations (trip_id, bus_id, latitude, longitude, speed, heading, accuracy) VALUES
(1, 1, 22.288700, 73.363400, 0.0, 0.0, 3.0);

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
