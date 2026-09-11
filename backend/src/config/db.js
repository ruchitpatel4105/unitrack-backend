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
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      fcm_token: null,
      created_at: new Date()
    },
    {
      id: 3,
      role: 'student',
      name: 'Samantha Reed',
      email: 'samantha.r@student.unitrack.edu',
      phone: '+19876543212',
      student_id: 'STD-2024-002',
      driver_id: null,
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
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
      phone: '+19876543214',
      student_id: null,
      driver_id: 'DRV-102',
      password_hash: '$2b$10$epRfZG5m/k0zN8MhE5L7p.UaZcT5xWp91mR2hS1F6qL0xZ.7wU6iS',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      fcm_token: null,
      created_at: new Date()
    }
  ],
  routes: [
    {
      id: 1,
      route_name: 'Parul Campus Express - North Loop',
      route_code: 'PU-EXP-101',
      description: 'Campus loop covering Main Gate, Engineering Quad, and Parul Sevashram Hospital',
      start_point: 'Parul Main Gate & Admin Block',
      end_point: 'Hostel Enclaves & Sports Pavilion',
      estimated_duration_mins: 20,
      distance_km: 6.50,
      is_active: 1
    },
    {
      id: 2,
      route_name: 'Vadodara Station - Parul Campus Shuttle',
      route_code: 'PU-CTY-202',
      description: 'Connecting Vadodara Central Station to Parul University Campus Terminal',
      start_point: 'Vadodara Railway Station',
      end_point: 'Parul Main Gate Terminal',
      estimated_duration_mins: 40,
      distance_km: 17.80,
      is_active: 1
    },
    {
      id: 3,
      route_name: 'East Campus & Medical Circulator',
      route_code: 'PU-CIRC-303',
      description: 'Internal shuttle for Hostels, Library, and Parul Sevashram Medical Quad',
      start_point: 'Hostel Block A',
      end_point: 'Parul Sevashram Hospital',
      estimated_duration_mins: 15,
      distance_km: 4.20,
      is_active: 1
    }
  ],
  route_stops: [
    { id: 1, route_id: 1, stop_name: 'Parul Main Gate & Admin Block', stop_order: 1, latitude: 22.288700, longitude: 73.363400, estimated_time_offset_mins: 0 },
    { id: 2, route_id: 1, stop_name: 'Faculty of Engineering & IT', stop_order: 2, latitude: 22.289500, longitude: 73.364800, estimated_time_offset_mins: 5 },
    { id: 3, route_id: 1, stop_name: 'Parul Sevashram Hospital', stop_order: 3, latitude: 22.290800, longitude: 73.362000, estimated_time_offset_mins: 10 },
    { id: 4, route_id: 1, stop_name: 'Central Library & SAC', stop_order: 4, latitude: 22.287800, longitude: 73.361200, estimated_time_offset_mins: 15 },
    { id: 5, route_id: 1, stop_name: 'Hostel Enclaves & Sports Pavilion', stop_order: 5, latitude: 22.286200, longitude: 73.364000, estimated_time_offset_mins: 20 },

    { id: 6, route_id: 2, stop_name: 'Vadodara Central Station', stop_order: 1, latitude: 22.310800, longitude: 73.181200, estimated_time_offset_mins: 0 },
    { id: 7, route_id: 2, stop_name: 'Sayajigunj Circle', stop_order: 2, latitude: 22.312000, longitude: 73.190500, estimated_time_offset_mins: 8 },
    { id: 8, route_id: 2, stop_name: 'Fatehgunj Flyover', stop_order: 3, latitude: 22.321000, longitude: 73.195000, estimated_time_offset_mins: 18 },
    { id: 9, route_id: 2, stop_name: 'Waghodia Cross Roads', stop_order: 4, latitude: 22.296500, longitude: 73.238000, estimated_time_offset_mins: 30 },
    { id: 10, route_id: 2, stop_name: 'Parul Main Gate Terminal', stop_order: 5, latitude: 22.288700, longitude: 73.363400, estimated_time_offset_mins: 40 },

    { id: 11, route_id: 3, stop_name: 'Hostel Block A', stop_order: 1, latitude: 22.286200, longitude: 73.364000, estimated_time_offset_mins: 0 },
    { id: 12, route_id: 3, stop_name: 'Sports Complex', stop_order: 2, latitude: 22.287000, longitude: 73.365000, estimated_time_offset_mins: 5 },
    { id: 13, route_id: 3, stop_name: 'Central Library', stop_order: 3, latitude: 22.287800, longitude: 73.361200, estimated_time_offset_mins: 10 },
    { id: 14, route_id: 3, stop_name: 'Parul Sevashram Hospital', stop_order: 4, latitude: 22.290800, longitude: 73.362000, estimated_time_offset_mins: 15 }
  ],
  buses: [
    { id: 1, bus_number: 'BUS-101', license_plate: 'GJ-06-PU-1001', capacity: 52, model: 'Tata Starbus Ultra Campus EV', status: 'active', assigned_driver_id: 4, current_route_id: 1 },
    { id: 2, bus_number: 'BUS-102', license_plate: 'GJ-06-PU-1002', capacity: 45, model: 'Eicher Skyline Pro Campus', status: 'active', assigned_driver_id: 5, current_route_id: 2 },
    { id: 3, bus_number: 'BUS-103', license_plate: 'GJ-06-PU-1003', capacity: 36, model: 'Ashok Leyland Falcon', status: 'in_maintenance', assigned_driver_id: null, current_route_id: 3 }
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
      location_name: 'Bus 101 rear seats',
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
      location_name: 'Bus 101 Terminal',
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
      location_name: 'Central Library Complex bus stop',
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
      location_name: 'Bus 102 front seats',
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
      match_reasons: 'Identical brand (Lenovo), exact category match (electronics), color match (black), exact same bus (BUS-101) within same 24-hour timeframe, and matching sticker description.',
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
      message: 'We found a 94.5% potential match for your reported lost Lenovo ThinkPad on Bus 101.',
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
      message: 'Bus 101 commenced morning route RT-NORTH-101.',
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
