export interface User {
  id: number;
  role: 'admin' | 'student' | 'driver';
  name: string;
  email: string;
  phone: string;
  student_id?: string | null;
  driver_id?: string | null;
  avatar_url?: string | null;
}

export interface RouteStop {
  id: number;
  route_id: number;
  stop_name: string;
  stop_order: number;
  latitude: number;
  longitude: number;
  estimated_time_offset_mins: number;
}

export interface Route {
  id: number;
  route_name: string;
  route_code: string;
  description: string;
  start_point: string;
  end_point: string;
  estimated_duration_mins: number;
  distance_km: number;
  is_active: number;
  stops?: RouteStop[];
}

export interface Bus {
  id: number;
  bus_number: string;
  license_plate: string;
  capacity: number;
  model: string;
  status: 'active' | 'in_maintenance' | 'inactive';
  assigned_driver_id?: number | null;
  current_route_id?: number | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  route_name?: string | null;
  route_code?: string | null;
}

export interface TripLocation {
  trip_id?: number;
  bus_id: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  recorded_at?: string;
}

export interface ActiveTrip {
  id: number;
  bus_id: number;
  driver_id: number;
  route_id: number;
  trip_type: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  bus_number: string;
  license_plate: string;
  bus_model: string;
  driver_name: string;
  driver_phone: string;
  route_name: string;
  route_code: string;
  current_latitude?: number;
  current_longitude?: number;
  current_speed?: number;
  current_heading?: number;
  last_updated?: string;
}

export interface LostFoundItem {
  id: number;
  user_id: number;
  type: 'lost' | 'found';
  title: string;
  description: string;
  category: 'electronics' | 'documents' | 'accessories' | 'bags' | 'clothing' | 'other';
  color?: string;
  item_date: string;
  location_name: string;
  bus_id?: number | null;
  bus_number?: string | null;
  image_url?: string | null;
  status: 'reported' | 'matched' | 'claimed' | 'resolved' | 'closed';
  reporter_name?: string;
  reporter_phone?: string;
  created_at: string;
}

export interface AiMatch {
  id: number;
  lost_item_id: number;
  found_item_id: number;
  match_score: number;
  match_reasons: string;
  status: 'suggested' | 'confirmed' | 'dismissed';
  matched_title?: string;
  matched_image?: string;
  matched_location?: string;
}

export interface Claim {
  id: number;
  item_id: number;
  claimant_id: number;
  proof_description: string;
  proof_image_url?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string | null;
  item_title?: string;
  item_image?: string | null;
  category?: string;
  claimant_name?: string;
  claimant_email?: string;
  claimant_phone?: string;
  created_at: string;
}

export interface EmergencyAlert {
  id: number;
  driver_id: number;
  bus_id: number;
  trip_id?: number | null;
  alert_type: string;
  latitude: number;
  longitude: number;
  notes?: string;
  status: 'active' | 'acknowledged' | 'resolved';
  driver_name?: string;
  driver_phone?: string;
  bus_number?: string;
  license_plate?: string;
  created_at: string;
  resolved_at?: string;
}

export interface DashboardMetrics {
  fleet: {
    total_buses: number;
    active_buses: number;
    in_maintenance: number;
    active_trips: number;
  };
  users: {
    total_students: number;
    total_drivers: number;
  };
  lost_and_found: {
    total_lost: number;
    total_found: number;
    pending_claims: number;
    estimated_recovery_rate: number;
  };
  security: {
    active_emergencies: number;
  };
  system_status: string;
}
