import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { AlertOctagon, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyBanner: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const handleNewAlert = (alertData: any) => {
      setActiveAlert(alertData);
    };

    socket.on('emergency:alert', handleNewAlert);
    return () => {
      socket.off('emergency:alert', handleNewAlert);
    };
  }, []);

  if (!activeAlert) return null;

  return (
    <div className="bg-rose-600 text-white px-6 py-3.5 flex items-center justify-between shadow-lg sticky top-16 z-30 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-3">
        <span className="p-1.5 bg-rose-700 rounded-lg animate-ping">
          <AlertOctagon className="w-5 h-5" />
        </span>
        <div>
          <span className="font-bold text-sm tracking-wide uppercase bg-rose-800 px-2 py-0.5 rounded mr-2">
            HIGH PRIORITY EMERGENCY
          </span>
          <span className="text-sm font-medium">
            Driver (ID: {activeAlert.driver_id}) on Bus #{activeAlert.bus_id} triggered alert: <b>{activeAlert.alert_type}</b>.
          </span>
          {activeAlert.notes && (
            <span className="text-xs text-rose-100 ml-2 italic">"{activeAlert.notes}"</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/emergencies"
          className="flex items-center gap-1.5 text-xs font-semibold bg-white text-rose-700 px-3 py-1.5 rounded-lg shadow hover:bg-rose-50 transition-colors"
        >
          <span>Respond in Command Center</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setActiveAlert(null)}
          className="p-1 hover:bg-rose-700 rounded text-rose-200 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
