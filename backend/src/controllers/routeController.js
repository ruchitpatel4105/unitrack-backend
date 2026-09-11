const { isLive, query, memoryStore } = require('../config/db');

async function getAllRoutes(req, res) {
  try {
    if (isLive()) {
      const routes = await query('SELECT * FROM routes WHERE is_active = 1 ORDER BY id ASC');
      const stops = await query('SELECT * FROM route_stops ORDER BY route_id ASC, stop_order ASC');
      
      const routesWithStops = routes.map(r => ({
        ...r,
        stops: stops.filter(s => s.route_id === r.id)
      }));
      return res.status(200).json({ success: true, data: routesWithStops });
    } else {
      const routesWithStops = memoryStore.routes.map(r => ({
        ...r,
        stops: memoryStore.route_stops.filter(s => s.route_id === r.id).sort((a, b) => a.stop_order - b.stop_order)
      }));
      return res.status(200).json({ success: true, data: routesWithStops });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function getRouteById(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      const routes = await query('SELECT * FROM routes WHERE id = ?', [id]);
      if (!routes || routes.length === 0) {
        return res.status(404).json({ success: false, message: 'Route not found' });
      }
      const stops = await query('SELECT * FROM route_stops WHERE route_id = ? ORDER BY stop_order ASC', [id]);
      return res.status(200).json({ success: true, data: { ...routes[0], stops } });
    } else {
      const route = memoryStore.routes.find(r => r.id === Number(id));
      if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
      const stops = memoryStore.route_stops.filter(s => s.route_id === Number(id)).sort((a, b) => a.stop_order - b.stop_order);
      return res.status(200).json({ success: true, data: { ...route, stops } });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function createRoute(req, res) {
  try {
    const { route_name, route_code, description, start_point, end_point, estimated_duration_mins = 40, distance_km = 12.0, stops = [] } = req.body;

    if (!route_name || !route_code || !start_point || !end_point) {
      return res.status(400).json({ success: false, message: 'Route name, code, start point and end point are required' });
    }

    if (isLive()) {
      const result = await query(
        'INSERT INTO routes (route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km]
      );
      const routeId = result.insertId;

      if (stops && stops.length > 0) {
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          await query(
            'INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude, estimated_time_offset_mins) VALUES (?, ?, ?, ?, ?, ?)',
            [routeId, s.stop_name, s.stop_order || (i + 1), s.latitude, s.longitude, s.estimated_time_offset_mins || 0]
          );
        }
      }

      return res.status(201).json({ success: true, message: 'Route created', id: routeId });
    } else {
      const newRoute = {
        id: memoryStore.routes.length + 1,
        route_name,
        route_code,
        description,
        start_point,
        end_point,
        estimated_duration_mins: Number(estimated_duration_mins),
        distance_km: Number(distance_km),
        is_active: 1
      };
      memoryStore.routes.push(newRoute);

      if (stops && stops.length > 0) {
        stops.forEach((s, i) => {
          memoryStore.route_stops.push({
            id: memoryStore.route_stops.length + 1,
            route_id: newRoute.id,
            stop_name: s.stop_name,
            stop_order: s.stop_order || (i + 1),
            latitude: Number(s.latitude),
            longitude: Number(s.longitude),
            estimated_time_offset_mins: Number(s.estimated_time_offset_mins || 0)
          });
        });
      }

      return res.status(201).json({ success: true, message: 'Route created', data: newRoute });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function updateRoute(req, res) {
  try {
    const { id } = req.params;
    const { route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km, is_active, stops } = req.body;

    if (isLive()) {
      await query(
        'UPDATE routes SET route_name = COALESCE(?, route_name), route_code = COALESCE(?, route_code), description = COALESCE(?, description), start_point = COALESCE(?, start_point), end_point = COALESCE(?, end_point), estimated_duration_mins = COALESCE(?, estimated_duration_mins), distance_km = COALESCE(?, distance_km), is_active = COALESCE(?, is_active) WHERE id = ?',
        [route_name, route_code, description, start_point, end_point, estimated_duration_mins, distance_km, is_active, id]
      );

      // Replace stops if provided
      if (stops && Array.isArray(stops)) {
        await query('DELETE FROM route_stops WHERE route_id = ?', [id]);
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          await query(
            'INSERT INTO route_stops (route_id, stop_name, stop_order, latitude, longitude, estimated_time_offset_mins) VALUES (?, ?, ?, ?, ?, ?)',
            [id, s.stop_name, s.stop_order || (i + 1), s.latitude || 22.2887, s.longitude || 73.3634, s.estimated_time_offset_mins || 0]
          );
        }
      }
      return res.status(200).json({ success: true, message: 'Route updated' });
    } else {
      const route = memoryStore.routes.find(r => r.id === Number(id));
      if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
      if (route_name) route.route_name = route_name;
      if (route_code) route.route_code = route_code;
      if (description !== undefined) route.description = description;
      if (start_point) route.start_point = start_point;
      if (end_point) route.end_point = end_point;
      if (estimated_duration_mins) route.estimated_duration_mins = Number(estimated_duration_mins);
      if (distance_km) route.distance_km = Number(distance_km);
      if (is_active !== undefined) route.is_active = Number(is_active);

      // Replace stops if provided
      if (stops && Array.isArray(stops)) {
        // Remove existing stops for this route
        const removeIndices = [];
        memoryStore.route_stops.forEach((s, idx) => { if (s.route_id === Number(id)) removeIndices.push(idx); });
        removeIndices.reverse().forEach(idx => memoryStore.route_stops.splice(idx, 1));

        // Insert new stops
        stops.forEach((s, i) => {
          memoryStore.route_stops.push({
            id: (memoryStore.route_stops.length > 0 ? Math.max(...memoryStore.route_stops.map(x => x.id)) : 0) + 1,
            route_id: Number(id),
            stop_name: s.stop_name,
            stop_order: s.stop_order || (i + 1),
            latitude: Number(s.latitude) || 22.2887,
            longitude: Number(s.longitude) || 73.3634,
            estimated_time_offset_mins: Number(s.estimated_time_offset_mins || 0)
          });
        });
      }
      return res.status(200).json({ success: true, message: 'Route updated', data: route });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteRoute(req, res) {
  try {
    const { id } = req.params;
    if (isLive()) {
      await query('DELETE FROM routes WHERE id = ?', [id]);
    } else {
      const idx = memoryStore.routes.findIndex(r => r.id === Number(id));
      if (idx !== -1) memoryStore.routes.splice(idx, 1);
      // Also remove stops
      const stopsToRemove = [];
      memoryStore.route_stops.forEach((s, i) => { if (s.route_id === Number(id)) stopsToRemove.push(i); });
      stopsToRemove.reverse().forEach(i => memoryStore.route_stops.splice(i, 1));
    }
    return res.status(200).json({ success: true, message: 'Route deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};

