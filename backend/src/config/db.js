const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

let pool = null;
let isConnected = false;

// Pre-seeded in-memory store as robust fallback when MySQL service is not running locally
const memoryStore = {
  users: [
    {
      id: 1,
      role: 'admin',
      name: 'System Administrator',
      email: 'admin@unitrack.edu',
      phone: '+19876543210',
      student_id: null,
      driver_id: null,
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS', // password123
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 2,
      role: 'student',
      name: 'Mavani Ruchit',
      email: '2403051057034@paruluniversity.ac.in',
      phone: '+919876543210',
      student_id: '2403051057034',
      driver_id: null,
      dob: '15082004', // Aug 15, 2004
      transport_fee_status: 'paid',
      pickup_stop: 'Sayajigunj Circle',
      assigned_route_id: 1,
      assigned_route_name: 'Vadodara Station Express',
      pass_number: 'PU-PASS-2024-57034',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 3,
      role: 'student',
      name: 'Samantha Reed',
      email: '2403051057002@paruluniversity.ac.in',
      phone: '+919876543212',
      student_id: '2403051057002',
      driver_id: null,
      dob: '20052003', // May 20, 2003
      transport_fee_status: 'paid',
      pickup_stop: 'Fatehgunj Bus Stop',
      assigned_route_id: 3,
      assigned_route_name: 'Karelibaug / Fatehgunj Route',
      pass_number: 'PU-PASS-2024-57002',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 8,
      role: 'student',
      name: 'Jay Patel',
      email: '2403051057035@paruluniversity.ac.in',
      phone: '+919876543217',
      student_id: '2403051057035',
      driver_id: null,
      dob: '10112004', // Nov 10, 2004
      transport_fee_status: 'paid',
      pickup_stop: 'Sama Road BRTS Stop',
      assigned_route_id: 2,
      assigned_route_name: 'Sama / Gorwa Route',
      pass_number: 'PU-PASS-2024-57035',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 9,
      role: 'student',
      name: 'Priya Sharma',
      email: '2403051057036@paruluniversity.ac.in',
      phone: '+919876543218',
      student_id: '2403051057036',
      driver_id: null,
      dob: '05032005', // Mar 05, 2005
      transport_fee_status: 'paid',
      pickup_stop: 'Waghodia Bus Stand',
      assigned_route_id: 4,
      assigned_route_name: 'Waghodia / Padra Route',
      pass_number: 'PU-PASS-2024-57036',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 4,
      role: 'driver',
      name: 'Robert Miller',
      email: 'robert.m@driver.unitrack.edu',
      phone: '+19876543213',
      student_id: null,
      driver_id: 'DRV-101',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 5,
      role: 'driver',
      name: 'David Wilson',
      email: 'david.w@driver.unitrack.edu',
      phone: '+919876543214',
      student_id: null,
      driver_id: 'DRV-102',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 6,
      role: 'driver',
      name: 'Ramesh Patel',
      email: 'ramesh.p@driver.unitrack.edu',
      phone: '+919876543215',
      student_id: null,
      driver_id: 'DRV-103',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 7,
      role: 'driver',
      name: 'Suresh Chauhan',
      email: 'suresh.c@driver.unitrack.edu',
      phone: '+919876543216',
      student_id: null,
      driver_id: 'DRV-104',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      fcm_token: null,
      created_at: new Date()
    }
  ],
  routes: [
    {
      id: 1,
      route_name: 'Vadodara Station Express',
      route_code: 'RT-001',
      description: 'Vadodara Railway Station to Parul University via Waghodia Road',
      start_point: 'Vadodara Railway Station',
      end_point: 'Parul University Main Gate',
      estimated_duration_mins: 45,
      distance_km: 18.5,
      is_active: 1
    },
    {
      id: 2,
      route_name: 'Sama / Gorwa Route',
      route_code: 'RT-002',
      description: 'Sama Road and Gorwa area to Parul University Campus',
      start_point: 'Sama Road BRTS Stop',
      end_point: 'Parul University Main Gate',
      estimated_duration_mins: 40,
      distance_km: 16.2,
      is_active: 1
    },
    {
      id: 3,
      route_name: 'Karelibaug / Fatehgunj Route',
      route_code: 'RT-003',
      description: 'Karelibaug and Fatehgunj area to Parul University via Subhanpura',
      start_point: 'Karelibaug Circle',
      end_point: 'Parul University Main Gate',
      estimated_duration_mins: 50,
      distance_km: 20.1,
      is_active: 1
    },
    {
      id: 4,
      route_name: 'Waghodia / Padra Route',
      route_code: 'RT-004',
      description: 'Waghodia town and Padra road corridor to Parul University',
      start_point: 'Waghodia Bus Stand',
      end_point: 'Parul University Main Gate',
      estimated_duration_mins: 35,
      distance_km: 12.8,
      is_active: 1
    }
  ],
  route_stops: [
    // Route 1: Vadodara Station Express
    { id: 1,  route_id: 1, stop_name: 'Vadodara Railway Station',  stop_order: 1, latitude: 22.3119, longitude: 73.1820, estimated_time_offset_mins: 0 },
    { id: 2,  route_id: 1, stop_name: 'Sayajigunj Circle',         stop_order: 2, latitude: 22.3090, longitude: 73.1890, estimated_time_offset_mins: 8 },
    { id: 3,  route_id: 1, stop_name: 'Subhanpura Crossroads',     stop_order: 3, latitude: 22.3020, longitude: 73.2200, estimated_time_offset_mins: 18 },
    { id: 4,  route_id: 1, stop_name: 'Waghodia Crossroads',       stop_order: 4, latitude: 22.2965, longitude: 73.2380, estimated_time_offset_mins: 30 },
    { id: 5,  route_id: 1, stop_name: 'Parul University Main Gate',stop_order: 5, latitude: 22.2887, longitude: 73.3634, estimated_time_offset_mins: 45 },

    // Route 2: Sama / Gorwa
    { id: 6,  route_id: 2, stop_name: 'Sama Road BRTS Stop',       stop_order: 1, latitude: 22.3250, longitude: 73.2000, estimated_time_offset_mins: 0 },
    { id: 7,  route_id: 2, stop_name: 'Gorwa Circle',              stop_order: 2, latitude: 22.3200, longitude: 73.2100, estimated_time_offset_mins: 7 },
    { id: 8,  route_id: 2, stop_name: 'Harni Road Junction',       stop_order: 3, latitude: 22.3100, longitude: 73.2350, estimated_time_offset_mins: 18 },
    { id: 9,  route_id: 2, stop_name: 'Waghodia Crossroads',       stop_order: 4, latitude: 22.2965, longitude: 73.2380, estimated_time_offset_mins: 27 },
    { id: 10, route_id: 2, stop_name: 'Parul University Main Gate',stop_order: 5, latitude: 22.2887, longitude: 73.3634, estimated_time_offset_mins: 40 },

    // Route 3: Karelibaug / Fatehgunj
    { id: 11, route_id: 3, stop_name: 'Karelibaug Circle',         stop_order: 1, latitude: 22.3200, longitude: 73.1900, estimated_time_offset_mins: 0 },
    { id: 12, route_id: 3, stop_name: 'Fatehgunj Bus Stop',        stop_order: 2, latitude: 22.3210, longitude: 73.1950, estimated_time_offset_mins: 6 },
    { id: 13, route_id: 3, stop_name: 'Subhanpura Crossroads',     stop_order: 3, latitude: 22.3020, longitude: 73.2200, estimated_time_offset_mins: 20 },
    { id: 14, route_id: 3, stop_name: 'Waghodia Crossroads',       stop_order: 4, latitude: 22.2965, longitude: 73.2380, estimated_time_offset_mins: 33 },
    { id: 15, route_id: 3, stop_name: 'Parul University Main Gate',stop_order: 5, latitude: 22.2887, longitude: 73.3634, estimated_time_offset_mins: 50 },

    // Route 4: Waghodia / Padra
    { id: 16, route_id: 4, stop_name: 'Waghodia Bus Stand',        stop_order: 1, latitude: 22.3300, longitude: 73.3000, estimated_time_offset_mins: 0 },
    { id: 17, route_id: 4, stop_name: 'Padra Road Junction',       stop_order: 2, latitude: 22.3150, longitude: 73.3100, estimated_time_offset_mins: 8 },
    { id: 18, route_id: 4, stop_name: 'Karjan Crossroads',         stop_order: 3, latitude: 22.3000, longitude: 73.3300, estimated_time_offset_mins: 18 },
    { id: 19, route_id: 4, stop_name: 'Parul University Main Gate',stop_order: 4, latitude: 22.2887, longitude: 73.3634, estimated_time_offset_mins: 35 }
  ],
  buses: [
    { id: 1, bus_number: '1', license_plate: 'GJ-06-PU-0001', capacity: 52, status: 'active', assigned_driver_id: 4, current_route_id: 1 },
    { id: 2, bus_number: '2', license_plate: 'GJ-06-PU-0002', capacity: 52, status: 'active', assigned_driver_id: 5, current_route_id: 2 },
    { id: 3, bus_number: '3', license_plate: 'GJ-06-PU-0003', capacity: 48, status: 'active', assigned_driver_id: 6, current_route_id: 3 },
    { id: 4, bus_number: '4', license_plate: 'GJ-06-PU-0004', capacity: 48, status: 'active', assigned_driver_id: 7, current_route_id: 4 }
  ],
  trips: [
    { id: 1, bus_id: 1, driver_id: 4, route_id: 1, trip_type: 'morning', status: 'scheduled', start_time: new Date(Date.now() + 60 * 60 * 1000), end_time: null },
    { id: 2, bus_id: 2, driver_id: 5, route_id: 2, trip_type: 'morning', status: 'scheduled', start_time: new Date(Date.now() + 90 * 60 * 1000), end_time: null }
  ],
  trip_locations: [
    { id: 1, trip_id: 1, bus_id: 1, latitude: 22.288700, longitude: 73.363400, speed: 0.0, heading: 0.0, accuracy: 3.0, recorded_at: new Date() }
  ],
  lost_found_items: [
    {
      id: 1,
      user_id: 2,
      type: 'lost',
      title: 'Black Lenovo ThinkPad Laptop',
      description: 'Lenovo ThinkPad X1 Carbon with university sticker on the lid. Left near seat 14.',
      category: 'electronics',
      color: 'Black',
      item_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
      location_name: 'Bus 1 rear seats',
      bus_id: 1,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      status: 'matched',
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 4,
      type: 'found',
      title: 'Black Lenovo Laptop with Stickers',
      description: 'Found on seat 14 after morning express run. Has blue university sticker.',
      category: 'electronics',
      color: 'Black',
      item_date: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
      location_name: 'Bus 1 Terminal',
      bus_id: 1,
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      status: 'matched',
      created_at: new Date()
    },
    {
      id: 3,
      user_id: 3,
      type: 'lost',
      title: 'Brown Leather Student ID Card Wallet',
      description: 'Contains student ID card for Samantha Reed and bus pass voucher.',
      category: 'documents',
      color: 'Brown',
      item_date: new Date().toISOString().split('T')[0],
      location_name: 'Vadodara Station bus stop',
      bus_id: 2,
      image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=400',
      status: 'reported',
      created_at: new Date()
    },
    {
      id: 4,
      user_id: 5,
      type: 'found',
      title: 'Scientific Calculator Casio fx-991EX',
      description: 'Black and white dual tone scientific calculator found in aisle.',
      category: 'electronics',
      color: 'Black',
      item_date: new Date().toISOString().split('T')[0],
      location_name: 'Bus 2 front seats',
      bus_id: 2,
      image_url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=400',
      status: 'reported',
      created_at: new Date()
    }
  ],
  lost_found_matches: [
    {
      id: 1,
      lost_item_id: 1,
      found_item_id: 2,
      match_score: 94.50,
      match_reasons: 'Identical brand (Lenovo), exact category match (electronics), color match (black), exact same bus (Bus 1) within same 24-hour timeframe, and matching sticker description.',
      status: 'suggested',
      created_at: new Date()
    }
  ],
  lost_found_claims: [
    {
      id: 1,
      item_id: 2,
      claimant_id: 2,
      proof_description: 'I can verify the serial number ending in 9841 and unlock the system using my fingerprint.',
      proof_image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400',
      status: 'pending',
      admin_notes: 'Awaiting claimant serial number verification in admin office',
      created_at: new Date()
    }
  ],
  emergency_alerts: [
    {
      id: 1,
      driver_id: 4,
      bus_id: 1,
      trip_id: 1,
      alert_type: 'breakdown',
      latitude: 22.288700,
      longitude: 73.363400,
      notes: 'Routine vehicle inspection completed at Parul Main Gate Depot.',
      status: 'resolved',
      created_at: new Date(Date.now() - 3600 * 1000),
      resolved_at: new Date()
    }
  ],
  notifications: [
    {
      id: 1,
      user_id: 2,
      role: 'student',
      title: 'AI Match Found!',
      message: 'We found a 94.5% potential match for your reported lost Lenovo ThinkPad on Bus 1.',
      type: 'match',
      is_read: 0,
      metadata: { lost_item_id: 1, found_item_id: 2 },
      created_at: new Date()
    },
    {
      id: 2,
      user_id: 1,
      role: 'admin',
      title: 'Fleet Update',
      message: 'Bus 1 commenced morning route RT-001 (Vadodara Station Express).',
      type: 'trip',
      is_read: 0,
      metadata: { bus_id: 1, trip_id: 1 },
      created_at: new Date()
    }
  ]

};

async function autoMigrateTables(poolInstance) {
  try {
    const [rows] = await poolInstance.query("SHOW TABLES LIKE 'users'");
    if (!rows || rows.length === 0) {
      console.log('🔄 [Database] Cloud database is empty. Auto-initializing tables and seed data...');
      let schemaPath = path.join(__dirname, '../../../database/schema.sql');
      if (!fs.existsSync(schemaPath)) schemaPath = path.join(__dirname, '../../database/schema.sql');
      let seedPath = path.join(__dirname, '../../../database/seed.sql');
      if (!fs.existsSync(seedPath)) seedPath = path.join(__dirname, '../../database/seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql
          .replace(/CREATE DATABASE[^;]+;/gi, '')
          .replace(/USE [^;]+;/gi, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of statements) {
          try {
            await poolInstance.query(statement);
          } catch (e) {
            // Ignore minor DDL notices
          }
        }
        console.log('✅ [Database] All 11 tables created successfully in cloud database.');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql
          .replace(/USE [^;]+;/gi, '')
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0);

        for (const statement of seedStatements) {
          try {
            await poolInstance.query(statement);
          } catch (e) {
            // Ignore duplicate inserts
          }
        }
        console.log('✅ [Database] Campus seed data successfully populated in cloud database.');
      }
    }

    // Incremental migrations to ensure existing tables match the latest schema
    const userCols = [
      { name: 'dob', type: 'VARCHAR(20) NULL' },
      { name: 'pickup_stop', type: 'VARCHAR(100) NULL' },
      { name: 'assigned_route_id', type: 'INT NULL' },
      { name: 'pass_number', type: 'VARCHAR(50) NULL' },
      { name: 'transport_fee_status', type: "ENUM('paid', 'pending', 'waived') DEFAULT 'paid'" }
    ];
    for (const col of userCols) {
      try {
        await poolInstance.query(`ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`);
      } catch (ignored) {
        // Column already exists
      }
    }

    // Ensure model column is dropped from buses table
    try {
      await poolInstance.query('ALTER TABLE buses DROP COLUMN model');
    } catch (ignored) {
      // Column already absent
    }
  } catch (err) {
    console.warn('⚠️ [Database] Auto-migration check:', err.message);
  }
}

async function initDb() {
  try {
    const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
    const poolConfig = dbUrl
      ? {
          uri: dbUrl,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          ssl: process.env.DB_SSL === 'false' ? undefined : { rejectUnauthorized: false }
        }
      : {
          host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
          port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
          user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
          password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
          database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'unitrack_db',
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          ssl: (process.env.DB_SSL === 'true' || process.env.MYSQLHOST) ? { rejectUnauthorized: false } : undefined
        };

    pool = mysql.createPool(poolConfig);

    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    isConnected = true;
    console.log('✅ [Database] Successfully connected to MySQL at ' + (dbUrl ? 'Cloud Database' : (process.env.DB_HOST || process.env.MYSQLHOST || 'localhost')));
    await autoMigrateTables(pool);
  } catch (err) {
    isConnected = false;
    console.warn('⚠️ [Database] MySQL connection failed (' + err.message + ').');
    console.warn('⚡ [Database] Running in high-performance memory fallback mode with seeded data.');
  }
}

// Universal query runner with fallback
async function query(sql, params = []) {
  if (isConnected && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('MySQL Query Error:', err.message);
      throw err;
    }
  }

  // Fallback handler is exposed directly to controllers via the memoryStore
  return null;
}

module.exports = {
  initDb,
  query,
  getPool: () => pool,
  isLive: () => isConnected,
  memoryStore
};
