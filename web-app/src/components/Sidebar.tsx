import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Bus,
  Route,
  GraduationCap,
  UserCheck,
  Search,
  AlertTriangle,
  BarChart3,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard },
    { label: 'Live Fleet Map', to: '/live-map', icon: MapPin },
    { label: 'Bus Management', to: '/buses', icon: Bus },
    { label: 'Route Network', to: '/routes', icon: Route },
    { label: 'Student Bus Passes', to: '/students', icon: GraduationCap },
    { label: 'Drivers & Trips', to: '/driver-trips', icon: UserCheck },
    { label: 'Lost & Found AI', to: '/lost-found', icon: Search },
    { label: 'Emergency Alarms', to: '/emergencies', icon: AlertTriangle },
    { label: 'Analytics & Insights', to: '/analytics', icon: BarChart3 },
  ];


  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-screen sticky top-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight">Uni-Track</h1>
          <p className="text-xs text-emerald-400 font-medium">Enterprise Fleet Admin</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 m-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Telemetry Engine Live</span>
        </div>
        <div className="mt-1 text-[11px] text-slate-500">v1.0.0 • Production Build</div>
      </div>
    </aside>
  );
};
