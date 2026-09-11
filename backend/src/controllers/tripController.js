const { isLive, query, memoryStore } = require('../config/db');

async function getActiveTrips(req, res) {
  try {
    if (isLive()) {
      const sql = `
        SELECT t.*, 
               b.bus_number, b.license_plate, b.model as bus_model,
               u.name as driver_name, u.phone as driver_phone,
               r.route_name, r.route_code,
               (SELECT latitude FROM trip_locations WHERE trip_id = t.id ORDER BY id DESC LIMIT 1) as current_latitude,
               (SELECT longitude FROM trip_locations WHERE trip_id = t.id ORDER BY id DESC LIMIT 1) as current_longitude,
               (SELECT speed FROM trip_locations WHERE trip_id = t.id ORDER BY id DESC LIMIT 1) as current_speed,
               (SELECT heading FROM trip_locations WHERE trip_id = t.id ORDER BY id DESC LIMIT 1) as current_heading,
               (SELECT recorded_at FROM trip_locations WHERE trip_id = t.id ORDER BY id DESC LIMIT 1) as last_updated
        FROM trips t
        JOIN buses b ON t.bus_id = b.id
        JOIN users u ON t.driver_id = u.id
        JOIN routes r ON t.route_id = r.id
        WHERE t.status = 'in_progress'
      `;
      const trips = await query(sql);
      return res.status(200).json({ success: true, data: trips });
    } else {
      const active = memoryStore.trips.filter(t => t.status === 'in_progress').map(t => {
        const bus = memoryStore.buses.find(b => b.id === t.bus_id) || {};
        const driver = memoryStore.users.find(u => u.id === t.driver_id) || {};
        const route = memoryStore.routes.find(r => r.id === t.route_id) || {};
        const locs = memoryStore.trip_locations.filter(l => l.trip_id === t.id || l.bus_id === t.bus_id);
        const lastLoc = locs.length > 0 ? locs[locs.length - 1] : { latitude: 22.2887, longitude: 73.3634, speed: 0, heading: 0 };

        return {
          ...t,
          bus_number: bus.bus_number,
          license_plate: bus.license_plate,
          bus_model: bus.model,
          driver_name: driver.name,
          driver_phone: driver.phone,
          route_name: route.route_name,
          route_code: route.route_code,
          current_latitude: lastLoc.latitude,
          current_longitude: lastLoc.longitude,
          current_speed: lastLoc.speed,
          current_heading: lastLoc.heading,
          last_updated: lastLoc.recorded_at || new Date()
        };
      });

      return res.status(200).json({ success: true, data: active });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getDriverCurrentTrip(req, res) {
  try {
    const driverId = req.user.id;
    if (isLive()) {
      const sql = `
        SELECT t.*, 
               b.bus_number, b.license_plate, b.capacity,
               r.route_name, r.route_code, r.start_point, r.end_point
        FROM trips t
        JOIN buses b ON t.bus_id = b.id
        JOIN routes r ON t.route_id = r.id
        WHERE t.driver_id = ? AND t.status IN ('in_progress', 'scheduled')
        ORDER BY t.status = 'in_progress' DESC, t.id DESC
        LIMIT 1
      `;
      const rows = await query(sql, [driverId]);
      if (!rows || rows.length === 0) {
        // Fallback: look for assigned bus
        const busRows = await query('SELECT b.*, r.route_name FROM buses b LEFT JOIN routes r ON b.current_route_id = r.id WHERE b.assigned_driver_id = ?', [driverId]);
        return res.status(200).json({ success: true, trip: null, assigned_bus: busRows[0] || null });
      }
      return res.status(200).json({ success: true, trip: rows[0] });
    } else {
      const trip = memoryStore.trips
        .filter(t => t.driver_id === driverId && (t.status === 'in_progress' || t.status === 'scheduled'))
        .sort((a, b) => (b.status === 'in_progress' ? 1 : 0) - (a.status === 'in_progress' ? 1 : 0))[0];

      const assignedBus = memoryStore.buses.find(b => b.assigned_driver_id === driverId);

      if (trip) {
        const bus = memoryStore.buses.find(b => b.id === trip.bus_id);
        const route = memoryStore.routes.find(r => r.id === trip.route_id);
        return res.status(200).json({
          success: true,
          trip: {
            ...trip,
            bus_number: bus ? bus.bus_number : 'BUS-101',
            license_plate: bus ? bus.license_plate : 'KA-01-EQ-4421',
            capacity: bus ? bus.capacity : 50,
            route_name: route ? route.route_name : 'North Campus Route',
            route_code: route ? route.route_code : 'RT-101',
            start_point: route ? route.start_point : 'Terminal A',
            end_point: route ? route.end_point : 'Main Quad'
          },
          assigned_bus: assignedBus || null
        });
      }

      return res.status(200).json({ success: true, trip: null, assigned_bus: assignedBus || null });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function startTrip(req, res) {
  try {
    const { bus_id, route_id, trip_type = 'morning' } = req.body;
    const driverId = req.user.id;

    if (!bus_id || !route_id) {
      return res.status(400).json({ success: false, message: 'bus_id and route_id are required' });
    }

    if (isLive()) {
      const result = await query(
        'INSERT INTO trips (bus_id, driver_id, route_id, trip_type, status, start_time) VALUES (?, ?, ?, ?, "in_progress", CURRENT_TIMESTAMP)',
        [bus_id, driverId, route_id, trip_type]
      );
      return res.status(201).json({ success: true, message: 'Trip started successfully', trip_id: result.insertId });
    } else {
      const newTrip = {
        id: memoryStore.trips.length + 1,
        bus_id: Number(bus_id),
        driver_id: driverId,
        route_id: Number(route_id),
        trip_type,
        status: 'in_progress',
        start_time: new Date(),
        end_time: null
      };
      memoryStore.trips.push(newTrip);
      return res.status(201).json({ success: true, message: 'Trip started successfully', trip: newTrip });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function endTrip(req, res) {
  try {
    const { trip_id } = req.body;
    if (!trip_id) {
      return res.status(400).json({ success: false, message: 'trip_id is required' });
    }

    if (isLive()) {
      await query('UPDATE trips SET status = "completed", end_time = CURRENT_TIMESTAMP WHERE id = ?', [trip_id]);
      return res.status(200).json({ success: true, message: 'Trip concluded successfully' });
    } else {
      const trip = memoryStore.trips.find(t => t.id === Number(trip_id));
      if (trip) {
        trip.status = 'completed';
        trip.end_time = new Date();
      }
      return res.status(200).json({ success: true, message: 'Trip concluded successfully' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function recordLocation(req, res) {
  try {
    const { trip_id, bus_id, latitude, longitude, speed = 0, heading = 0, accuracy = 5 } = req.body;

    if (!bus_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'bus_id, latitude, and longitude are required' });
    }

    if (isLive() && trip_id) {
      await query(
        'INSERT INTO trip_locations (trip_id, bus_id, latitude, longitude, speed, heading, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [trip_id, bus_id, latitude, longitude, speed, heading, accuracy]
      );
    } else {
      memoryStore.trip_locations.push({
        id: memoryStore.trip_locations.length + 1,
        trip_id: trip_id || null,
        bus_id: Number(bus_id),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        speed: parseFloat(speed),
        heading: parseFloat(heading),
        accuracy: parseFloat(accuracy),
        recorded_at: new Date()
      });
    }

    return res.status(200).json({ success: true, message: 'Location recorded' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getActiveTrips,
  getDriverCurrentTrip,
  startTrip,
  endTrip,
  recordLocation
};
