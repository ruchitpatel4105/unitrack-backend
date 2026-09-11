const { isLive, query, memoryStore } = require('../config/db');

function setupSocketIO(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.IO] Client connected: ${socket.id}`);

    // Driver joins tracking session
    socket.on('driver:join', (data) => {
      const { driver_id, bus_id, trip_id } = data || {};
      socket.join(`bus:${bus_id}`);
      socket.join(`driver:${driver_id}`);
      socket.data = { role: 'driver', driver_id, bus_id, trip_id };
      console.log(`🚌 Driver ${driver_id} joined for Bus ${bus_id} on Socket ${socket.id}`);
    });

    // Real-time Driver GPS Location Update
    socket.on('driver:location_update', async (payload) => {
      try {
        const {
          trip_id,
          bus_id,
          latitude,
          longitude,
          speed = 0,
          heading = 0,
          accuracy = 5,
          timestamp = new Date()
        } = payload || {};

        if (!bus_id || latitude === undefined || longitude === undefined) {
          return;
        }

        const locationData = {
          trip_id: trip_id || null,
          bus_id: Number(bus_id),
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          speed: parseFloat(speed) || 0,
          heading: parseFloat(heading) || 0,
          accuracy: parseFloat(accuracy) || 5,
          recorded_at: timestamp || new Date()
        };

        // Save location record
        if (isLive()) {
          if (trip_id) {
            await query(
              'INSERT INTO trip_locations (trip_id, bus_id, latitude, longitude, speed, heading, accuracy) VALUES (?, ?, ?, ?, ?, ?, ?)',
              [trip_id, bus_id, latitude, longitude, speed, heading, accuracy]
            );
          }
        } else {
          memoryStore.trip_locations.push({
            id: memoryStore.trip_locations.length + 1,
            ...locationData
          });
        }

        // Broadcast to student tracking room and admin fleet monitoring room
        io.to(`bus:${bus_id}`).emit('bus:location_update', locationData);
        io.to('admin_room').emit('bus:location_update', locationData);
      } catch (err) {
        console.error('Socket driver:location_update error:', err.message);
      }
    });

    // Driver Starts Trip
    socket.on('driver:start_trip', async (data) => {
      const { trip_id, bus_id, driver_id } = data || {};
      const statusData = { trip_id, bus_id, status: 'in_progress', start_time: new Date() };

      if (isLive()) {
        await query('UPDATE trips SET status = "in_progress", start_time = CURRENT_TIMESTAMP WHERE id = ?', [trip_id]);
      } else {
        const trip = memoryStore.trips.find(t => t.id === Number(trip_id));
        if (trip) {
          trip.status = 'in_progress';
          trip.start_time = new Date();
        }
      }

      io.to(`bus:${bus_id}`).emit('trip:status_change', statusData);
      io.to('admin_room').emit('trip:status_change', statusData);
      console.log(`🟢 Trip ${trip_id} started for Bus ${bus_id}`);
    });

    // Driver Ends Trip
    socket.on('driver:end_trip', async (data) => {
      const { trip_id, bus_id } = data || {};
      const statusData = { trip_id, bus_id, status: 'completed', end_time: new Date() };

      if (isLive()) {
        await query('UPDATE trips SET status = "completed", end_time = CURRENT_TIMESTAMP WHERE id = ?', [trip_id]);
      } else {
        const trip = memoryStore.trips.find(t => t.id === Number(trip_id));
        if (trip) {
          trip.status = 'completed';
          trip.end_time = new Date();
        }
      }

      io.to(`bus:${bus_id}`).emit('trip:status_change', statusData);
      io.to('admin_room').emit('trip:status_change', statusData);
      console.log(`🏁 Trip ${trip_id} ended for Bus ${bus_id}`);
    });

    // Driver Triggers Emergency Alert
    socket.on('driver:emergency', async (data) => {
      try {
        const { driver_id, bus_id, trip_id, alert_type, latitude, longitude, notes } = data || {};
        const alertRecord = {
          id: Date.now(),
          driver_id: Number(driver_id),
          bus_id: Number(bus_id),
          trip_id: trip_id ? Number(trip_id) : null,
          alert_type: alert_type || 'emergency',
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
          notes: notes || 'Emergency alert triggered by driver',
          status: 'active',
          created_at: new Date()
        };

        if (isLive()) {
          const res = await query(
            'INSERT INTO emergency_alerts (driver_id, bus_id, trip_id, alert_type, latitude, longitude, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [driver_id, bus_id, trip_id || null, alert_type || 'other', latitude || 0, longitude || 0, notes || '', 'active']
          );
          alertRecord.id = res.insertId;
        } else {
          memoryStore.emergency_alerts.unshift(alertRecord);
        }

        // Broadcast to Admin room with urgency
        io.to('admin_room').emit('emergency:alert', alertRecord);
        console.warn(`🚨 EMERGENCY ALERT from Driver ${driver_id} on Bus ${bus_id}!`);
      } catch (err) {
        console.error('Socket emergency error:', err.message);
      }
    });

    // Student Tracks Specific Bus
    socket.on('student:track_bus', (data) => {
      const { bus_id } = data || {};
      if (bus_id) {
        socket.join(`bus:${bus_id}`);
        console.log(`👨‍🎓 Student ${socket.id} started tracking Bus ${bus_id}`);
      }
    });

    socket.on('student:leave_bus', (data) => {
      const { bus_id } = data || {};
      if (bus_id) {
        socket.leave(`bus:${bus_id}`);
      }
    });

    // Admin joins Live Fleet Monitoring Room
    socket.on('admin:join', () => {
      socket.join('admin_room');
      console.log(`🛡️ Admin joined monitoring room on Socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupSocketIO;
