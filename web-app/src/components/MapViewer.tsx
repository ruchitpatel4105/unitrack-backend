import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Bus, RouteStop } from '../types';

// Fix standard Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Bus Marker Icon with pulse effect
const createBusIcon = (busNumber: string, isMoving: boolean) => {
  return L.divIcon({
    className: 'custom-bus-marker',
    html: `
      <div style="
        position: relative;
        background: ${isMoving ? '#10b981' : '#3b82f6'};
        color: white;
        padding: 4px 8px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 11px;
        display: flex;
        align-items: center;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid white;
        white-space: nowrap;
      ">
        <span>🚌</span>
        <span>${busNumber}</span>
      </div>
    `,
    iconSize: [80, 30],
    iconAnchor: [40, 15]
  });
};

// Custom Stop Marker Icon
const createStopIcon = (stopOrder: number) => {
  return L.divIcon({
    className: 'custom-stop-marker',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        background: #f59e0b;
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      ">
        ${stopOrder}
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
};

interface MapViewerProps {
  center?: [number, number];
  zoom?: number;
  buses?: Array<{
    id: number;
    bus_number: string;
    latitude: number;
    longitude: number;
    speed?: number;
    heading?: number;
    driver_name?: string;
    route_name?: string;
  }>;
  stops?: RouteStop[];
  routePolyline?: [number, number][];
  height?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  center = [12.9782, 77.6012],
  zoom = 13,
  buses = [],
  stops = [],
  routePolyline = [],
  height = '500px'
}) => {
  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative z-10" style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        {routePolyline.length > 1 && (
          <Polyline
            positions={routePolyline}
            pathOptions={{ color: '#059669', weight: 5, opacity: 0.85, dashArray: '1, 6' }}
          />
        )}

        {/* Route Stops */}
        {stops.map((stop) => (
          <Marker
            key={`stop-${stop.id || stop.stop_order}`}
            position={[Number(stop.latitude), Number(stop.longitude)]}
            icon={createStopIcon(stop.stop_order)}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="text-xs font-semibold">
                Stop #{stop.stop_order}: {stop.stop_name}
              </div>
            </Tooltip>
            <Popup>
              <div className="p-1">
                <div className="font-bold text-xs text-amber-600">Route Stop #{stop.stop_order}</div>
                <div className="text-sm font-semibold text-slate-800">{stop.stop_name}</div>
                <div className="text-xs text-slate-500 mt-1">Offset: +{stop.estimated_time_offset_mins} mins</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live Buses */}
        {buses.map((bus) => (
          <Marker
            key={`bus-${bus.id}`}
            position={[bus.latitude, bus.longitude]}
            icon={createBusIcon(bus.bus_number, (bus.speed || 0) > 0)}
          >
            <Popup>
              <div className="p-2 space-y-1 min-w-[160px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{bus.bus_number}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    (bus.speed || 0) > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {(bus.speed || 0) > 0 ? `${bus.speed} km/h` : 'Stationary'}
                  </span>
                </div>
                {bus.driver_name && (
                  <div className="text-xs text-slate-600">Driver: <b>{bus.driver_name}</b></div>
                )}
                {bus.route_name && (
                  <div className="text-xs text-slate-500">Route: {bus.route_name}</div>
                )}
                <div className="text-[10px] text-slate-400 mt-1">
                  GPS: {bus.latitude.toFixed(4)}, {bus.longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
