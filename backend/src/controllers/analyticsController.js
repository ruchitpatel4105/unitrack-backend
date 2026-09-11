const { isLive, query, memoryStore } = require('../config/db');

async function getDashboardMetrics(req, res) {
  try {
    let totalBuses = 0;
    let activeBuses = 0;
    let inMaintenanceBuses = 0;
    let activeTrips = 0;
    let totalStudents = 0;
    let totalDrivers = 0;
    let lostItemsCount = 0;
    let foundItemsCount = 0;
    let claimsPending = 0;
    let activeEmergencies = 0;

    if (isLive()) {
      const busStats = await query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'in_maintenance' THEN 1 ELSE 0 END) as in_maintenance
        FROM buses
      `);
      if (busStats && busStats.length > 0) {
        totalBuses = busStats[0].total || 0;
        activeBuses = busStats[0].active || 0;
        inMaintenanceBuses = busStats[0].in_maintenance || 0;
      }

      const tripStats = await query('SELECT COUNT(*) as active_trips FROM trips WHERE status = "in_progress"');
      activeTrips = tripStats[0]?.active_trips || 0;

      const userStats = await query(`
        SELECT 
          SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
          SUM(CASE WHEN role = 'driver' THEN 1 ELSE 0 END) as drivers
        FROM users
      `);
      totalStudents = userStats[0]?.students || 0;
      totalDrivers = userStats[0]?.drivers || 0;

      const lfStats = await query(`
        SELECT 
          SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost,
          SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found
        FROM lost_found_items
      `);
      lostItemsCount = lfStats[0]?.lost || 0;
      foundItemsCount = lfStats[0]?.found || 0;

      const claimStats = await query('SELECT COUNT(*) as pending FROM lost_found_claims WHERE status = "pending"');
      claimsPending = claimStats[0]?.pending || 0;

      const claimApprovedStats = await query('SELECT COUNT(*) as approved FROM lost_found_claims WHERE status = "approved"');
      const approvedClaims = claimApprovedStats[0]?.approved || 0;

      const emergencyStats = await query('SELECT COUNT(*) as active FROM emergency_alerts WHERE status = "active"');
      activeEmergencies = emergencyStats[0]?.active || 0;

      // Category breakdown
      const catRows = await query('SELECT category, COUNT(*) as count FROM lost_found_items GROUP BY category');
      const totalLfItems = (lostItemsCount + foundItemsCount) || 1;
      const categoryDistribution = (catRows || []).map(r => ({
        label: r.category ? (r.category.charAt(0).toUpperCase() + r.category.slice(1)) : 'Other',
        count: Number(r.count),
        percentage: Math.round((Number(r.count) / totalLfItems) * 100)
      }));

      const totalTripsResult = await query('SELECT COUNT(*) as total FROM trips');
      const totalTripsCount = totalTripsResult[0]?.total || 0;
      const onTimeRate = totalTripsCount > 0 ? 100 : 0;
      const fleetUptime = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0;
      const recoveryRate = (lostItemsCount + foundItemsCount) > 0 ? Math.round((approvedClaims / (lostItemsCount || 1)) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          fleet: {
            total_buses: totalBuses,
            active_buses: activeBuses,
            in_maintenance: inMaintenanceBuses,
            active_trips: activeTrips,
            fleet_uptime: fleetUptime,
            on_time_departure_rate: onTimeRate
          },
          users: {
            total_students: totalStudents,
            total_drivers: totalDrivers
          },
          lost_and_found: {
            total_lost: lostItemsCount,
            total_found: foundItemsCount,
            pending_claims: claimsPending,
            approved_claims: approvedClaims,
            estimated_recovery_rate: recoveryRate,
            category_distribution: categoryDistribution
          },
          security: {
            active_emergencies: activeEmergencies
          },
          system_status: 'operational',
          timestamp: new Date()
        }
      });
    } else {
      totalBuses = memoryStore.buses.length;
      activeBuses = memoryStore.buses.filter(b => b.status === 'active').length;
      inMaintenanceBuses = memoryStore.buses.filter(b => b.status === 'in_maintenance').length;
      activeTrips = memoryStore.trips.filter(t => t.status === 'in_progress').length;
      totalStudents = memoryStore.users.filter(u => u.role === 'student').length;
      totalDrivers = memoryStore.users.filter(u => u.role === 'driver').length;
      lostItemsCount = memoryStore.lost_found_items.filter(i => i.type === 'lost').length;
      foundItemsCount = memoryStore.lost_found_items.filter(i => i.type === 'found').length;
      claimsPending = memoryStore.lost_found_claims.filter(c => c.status === 'pending').length;
      const approvedClaims = memoryStore.lost_found_claims.filter(c => c.status === 'approved').length;
      activeEmergencies = memoryStore.emergency_alerts.filter(e => e.status === 'active').length;

      // Real category breakdown from in-memory items
      const catCounts = {};
      memoryStore.lost_found_items.forEach(item => {
        const cat = item.category || 'other';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
      });
      const totalLfItems = memoryStore.lost_found_items.length || 1;
      const categoryDistribution = Object.entries(catCounts).map(([cat, count]) => ({
        label: cat.charAt(0).toUpperCase() + cat.slice(1),
        count,
        percentage: Math.round((count / totalLfItems) * 100)
      }));

      const fleetUptime = totalBuses > 0 ? Math.round((activeBuses / totalBuses) * 100) : 0;
      const totalTripsCount = memoryStore.trips.length;
      const onTimeRate = totalTripsCount > 0 ? 100 : 0;
      const recoveryRate = lostItemsCount > 0 ? Math.round((approvedClaims / lostItemsCount) * 100) : 0;

      return res.status(200).json({
        success: true,
        data: {
          fleet: {
            total_buses: totalBuses,
            active_buses: activeBuses,
            in_maintenance: inMaintenanceBuses,
            active_trips: activeTrips,
            fleet_uptime: fleetUptime,
            on_time_departure_rate: onTimeRate
          },
          users: {
            total_students: totalStudents,
            total_drivers: totalDrivers
          },
          lost_and_found: {
            total_lost: lostItemsCount,
            total_found: foundItemsCount,
            pending_claims: claimsPending,
            approved_claims: approvedClaims,
            estimated_recovery_rate: recoveryRate,
            category_distribution: categoryDistribution
          },
          security: {
            active_emergencies: activeEmergencies
          },
          system_status: 'operational',
          timestamp: new Date()
        }
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getDashboardMetrics
};
