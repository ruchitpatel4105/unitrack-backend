const { isLive, query, memoryStore } = require('../config/db');

async function getAllBuses(req, res) {
  try {
    if (isLive()) {
      const sql = `
        SELECT b.*, 
               u.name as driver_name, u.phone as driver_phone,
               r.route_name, r.route_code
        FROM buses b
        LEFT JOIN users u ON b.assigned_driver_id = u.id
        LEFT JOIN routes r ON b.current_route_id = r.id
        ORDER BY b.id ASC
      `;
      const buses = await query(sql);
      return res.status(200).json({ success: true, data: buses });
    } else {
      const data = memoryStore.buses.map(b => {
        const driver = memoryStore.users.find(u => u.id === b.assigned_driver_id);
        const route = memoryStore.routes.find(r => r.id === b.current_route_id);
        return {
          ...b,
          driver_name: driver ? driver.name : null,
          driver_phone: driver ? driver.phone : null,
          route_name: route ? route.route_name : null,
          route_code: route ? route.route_code : null
        };
      });
      return res.status(200).json({ success: true, data });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getBusById(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      const sql = `
        SELECT b.*, 
               u.name as driver_name, u.phone as driver_phone,
               r.route_name, r.route_code
        FROM buses b
        LEFT JOIN users u ON b.assigned_driver_id = u.id
        LEFT JOIN routes r ON b.current_route_id = r.id
        WHERE b.id = ?
      `;
      const rows = await query(sql, [id]);
      if (!rows || rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Bus not found' });
      }
      return res.status(200).json({ success: true, data: rows[0] });
    } else {
      const b = memoryStore.buses.find(item => item.id === Number(id));
      if (!b) return res.status(404).json({ success: false, message: 'Bus not found' });
      const driver = memoryStore.users.find(u => u.id === b.assigned_driver_id);
      const route = memoryStore.routes.find(r => r.id === b.current_route_id);
      return res.status(200).json({
        success: true,
        data: {
          ...b,
          driver_name: driver ? driver.name : null,
          driver_phone: driver ? driver.phone : null,
          route_name: route ? route.route_name : null,
          route_code: route ? route.route_code : null
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createBus(req, res) {
  try {
    const { bus_number, license_plate, capacity = 50, model = 'Tata Starbus', status = 'active', assigned_driver_id, current_route_id } = req.body;
    if (!bus_number || !license_plate) {
      return res.status(400).json({ success: false, message: 'Bus number and license plate are required' });
    }

    if (isLive()) {
      const result = await query(
        'INSERT INTO buses (bus_number, license_plate, capacity, model, status, assigned_driver_id, current_route_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [bus_number, license_plate, capacity, model, status, assigned_driver_id || null, current_route_id || null]
      );
      return res.status(201).json({ success: true, message: 'Bus created', id: result.insertId });
    } else {
      const newBus = {
        id: memoryStore.buses.length + 1,
        bus_number,
        license_plate,
        capacity: Number(capacity),
        model,
        status,
        assigned_driver_id: assigned_driver_id ? Number(assigned_driver_id) : null,
        current_route_id: current_route_id ? Number(current_route_id) : null,
        created_at: new Date()
      };
      memoryStore.buses.push(newBus);
      return res.status(201).json({ success: true, message: 'Bus created', data: newBus });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateBus(req, res) {
  try {
    const { id } = req.params;
    const { bus_number, license_plate, capacity, model, status, assigned_driver_id, current_route_id } = req.body;

    if (isLive()) {
      await query(
        'UPDATE buses SET bus_number = COALESCE(?, bus_number), license_plate = COALESCE(?, license_plate), capacity = COALESCE(?, capacity), model = COALESCE(?, model), status = COALESCE(?, status), assigned_driver_id = ?, current_route_id = ? WHERE id = ?',
        [bus_number, license_plate, capacity, model, status, assigned_driver_id || null, current_route_id || null, id]
      );
      return res.status(200).json({ success: true, message: 'Bus updated' });
    } else {
      const bus = memoryStore.buses.find(b => b.id === Number(id));
      if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
      if (bus_number) bus.bus_number = bus_number;
      if (license_plate) bus.license_plate = license_plate;
      if (capacity) bus.capacity = Number(capacity);
      if (model) bus.model = model;
      if (status) bus.status = status;
      if (assigned_driver_id !== undefined) bus.assigned_driver_id = assigned_driver_id ? Number(assigned_driver_id) : null;
      if (current_route_id !== undefined) bus.current_route_id = current_route_id ? Number(current_route_id) : null;
      return res.status(200).json({ success: true, message: 'Bus updated', data: bus });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteBus(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      await query('DELETE FROM buses WHERE id = ?', [id]);
    } else {
      const idx = memoryStore.buses.findIndex(b => b.id === Number(id));
      if (idx !== -1) memoryStore.buses.splice(idx, 1);
    }
    return res.status(200).json({ success: true, message: 'Bus deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
};
