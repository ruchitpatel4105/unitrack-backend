const { isLive, query, memoryStore } = require('../config/db');

async function createAlert(req, res) {
  try {
    const { bus_id, trip_id, alert_type = 'emergency', latitude, longitude, notes } = req.body;
    const driver_id = req.user.id;

    if (!bus_id) {
      return res.status(400).json({ success: false, message: 'bus_id is required' });
    }

    const alert = {
      driver_id,
      bus_id: Number(bus_id),
      trip_id: trip_id ? Number(trip_id) : null,
      alert_type,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0,
      notes: notes || 'Emergency assistance requested',
      status: 'active',
      created_at: new Date()
    };

    if (isLive()) {
      const result = await query(
        'INSERT INTO emergency_alerts (driver_id, bus_id, trip_id, alert_type, latitude, longitude, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, "active")',
        [driver_id, bus_id, trip_id || null, alert_type, alert.latitude, alert.longitude, alert.notes]
      );
      alert.id = result.insertId;
    } else {
      alert.id = memoryStore.emergency_alerts.length + 1;
      memoryStore.emergency_alerts.unshift(alert);
    }

    // Broadcast if req.app.get('io') is available
    const io = req.app.get('io');
    if (io) {
      io.to('admin_room').emit('emergency:alert', alert);
    }

    return res.status(201).json({
      success: true,
      message: 'Emergency alert logged and dispatched immediately',
      alert
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getAlerts(req, res) {
  try {
    const { status } = req.query;

    if (isLive()) {
      let sql = `
        SELECT ea.*, 
               u.name as driver_name, u.phone as driver_phone,
               b.bus_number, b.license_plate
        FROM emergency_alerts ea
        JOIN users u ON ea.driver_id = u.id
        JOIN buses b ON ea.bus_id = b.id
      `;
      const params = [];
      if (status) {
        sql += ' WHERE ea.status = ?';
        params.push(status);
      }
      sql += ' ORDER BY ea.id DESC';
      const alerts = await query(sql, params);
      return res.status(200).json({ success: true, data: alerts });
    } else {
      let alerts = memoryStore.emergency_alerts;
      if (status) {
        alerts = alerts.filter(a => a.status === status);
      }
      const enriched = alerts.map(a => {
        const driver = memoryStore.users.find(u => u.id === a.driver_id);
        const bus = memoryStore.buses.find(b => b.id === a.bus_id);
        return {
          ...a,
          driver_name: driver ? driver.name : 'Driver',
          driver_phone: driver ? driver.phone : '',
          bus_number: bus ? bus.bus_number : '1',
          license_plate: bus ? bus.license_plate : 'GJ-06-PU-0001'
        };
      });
      return res.status(200).json({ success: true, data: enriched });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateAlertStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['active', 'acknowledged', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Valid status is required' });
    }

    if (isLive()) {
      const resolvedSql = status === 'resolved' ? ', resolved_at = CURRENT_TIMESTAMP' : '';
      await query(`UPDATE emergency_alerts SET status = ? ${resolvedSql} WHERE id = ?`, [status, id]);
      return res.status(200).json({ success: true, message: `Emergency alert status updated to ${status}` });
    } else {
      const alert = memoryStore.emergency_alerts.find(a => a.id === Number(id));
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
      alert.status = status;
      if (status === 'resolved') alert.resolved_at = new Date();
      return res.status(200).json({ success: true, message: `Emergency alert status updated to ${status}`, alert });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createAlert,
  getAlerts,
  updateAlertStatus
};
