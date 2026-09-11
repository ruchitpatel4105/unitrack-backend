-- Uni-Track Seed Data (Vadodara City to Parul University)

USE unitrack_db;

-- 1. Insert Initial Users
INSERT INTO users (id, role, name, email, phone, student_id, driver_id, password_hash, avatar_url, dob, pickup_stop, assigned_route_id, pass_number, transport_fee_status) VALUES
(1, 'admin', 'System Administrator', 'admin@unitrack.edu', '+19876543210', NULL, NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(2, 'student', 'Mavani Ruchit', '2403051057034@paruluniversity.ac.in', '+919876543210', '2403051057034', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', '15082004', 'Sayajigunj Circle', 1, 'PU-PASS-2024-57034', 'paid'),
(3, 'student', 'Samantha Reed', '2403051057002@paruluniversity.ac.in', '+919876543212', '2403051057002', NULL, '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', '20052003', 'Fatehgunj Bus Stop', 3, 'PU-PASS-2024-57002', 'paid'),
(4, 'driver', 'Robert Miller', 'robert.m@driver.unitrack.edu', '+919876543213', NULL, 'DRV-101', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, NULL, 'paid'),
(5, 'driver', 'David Wilson', 'david.w@driver.unitrack.edu', '+919876543214', NULL, 'DRV-102', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(6, 'driver', 'Ramesh Patel', 'ramesh.p@driver.unitrack.edu', '+919876543215', NULL, 'DRV-103', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', NULL, NULL, NULL, NULL, 'paid'),
(7, 'driver', 'Suresh Chauhan', 'suresh.c@driver.unitrack.edu', '+919876543216', NULL, 'DRV-104', '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', NULL, NULL, NULL, NULL, 'paid')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Routes (4 Vadodara City Routes)
INSERT INTO routes (id, route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km, is_active) VALUES
(1, 'Vadodara Station Express', 'RT-001', 'Vadodara Railway Station to Parul University via Waghodia Road', 'Vadodara Railway Station', 'Parul University Main Gate', 45, 18.50, 1),
(2, 'Sama / Gorwa Route', 'RT-002', 'Sama Road and Gorwa area to Parul University Campus', 'Sama Road BRTS Stop', 'Parul University Main Gate', 40, 16.20, 1),
(3, 'Karelibaug / Fatehgunj Route', 'RT-003', 'Karelibaug and Fatehgunj area to Parul University via Subhanpura', 'Karelibaug Circle', 'Parul University Main Gate', 50, 20.10, 1),
(4, 'Waghodia / Padra Route', 'RT-004', 'Waghodia town and Padra road corridor to Parul University', 'Waghodia Bus Stand', 'Parul University Main Gate', 35, 12.80, 1)
ON DUPLICATE KEY UPDATE route_name=VALUES(route_name);

-- 3. Insert Route Stops
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

-- 4. Insert Buses (1, 2, 3, 4 with Gujarat Plates)
INSERT INTO buses (id, bus_number, license_plate, capacity, status, assigned_driver_id, current_route_id) VALUES
(1, '1', 'GJ-06-PU-0001', 52, 'active', 4, 1),
(2, '2', 'GJ-06-PU-0002', 52, 'active', 5, 2),
(3, '3', 'GJ-06-PU-0003', 48, 'active', 6, 3),
(4, '4', 'GJ-06-PU-0004', 48, 'active', 7, 4)
ON DUPLICATE KEY UPDATE bus_number=VALUES(bus_number), license_plate=VALUES(license_plate);

-- 5. Insert Sample Scheduled Trips
INSERT INTO trips (id, bus_id, driver_id, route_id, trip_type, status, start_time, end_time) VALUES
(1, 1, 4, 1, 'morning', 'scheduled', CURRENT_TIMESTAMP + INTERVAL 60 MINUTE, NULL),
(2, 2, 5, 2, 'morning', 'scheduled', CURRENT_TIMESTAMP + INTERVAL 90 MINUTE, NULL)
ON DUPLICATE KEY UPDATE status=VALUES(status);
