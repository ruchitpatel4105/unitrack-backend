package com.unitrack.app.socket;

import android.util.Log;
import com.unitrack.app.models.LocationUpdate;
import com.unitrack.app.utils.Constants;
import org.json.JSONObject;
import java.net.URI;
import io.socket.client.IO;
import io.socket.client.Socket;

public class SocketManager {
    private static final String TAG = "UniTrackSocket";
    private static SocketManager instance;
    private Socket socket;
    private LocationListener locationListener;

    public interface LocationListener {
        void onLocationReceived(LocationUpdate update);
    }

    private SocketManager() {
        initSocket();
    }

    public static synchronized SocketManager getInstance() {
        if (instance == null) {
            instance = new SocketManager();
        }
        return instance;
    }

    private void initSocket() {
        try {
            IO.Options options = IO.Options.builder()
                    .setTransports(new String[]{"websocket", "polling"})
                    .setReconnection(true)
                    .setReconnectionAttempts(10)
                    .setReconnectionDelay(2000)
                    .build();

            socket = IO.socket(URI.create(Constants.SOCKET_URL), options);

            socket.on(Socket.EVENT_CONNECT, args -> Log.d(TAG, "⚡ Socket connected successfully: " + socket.id()));
            socket.on(Socket.EVENT_DISCONNECT, args -> Log.d(TAG, "❌ Socket disconnected"));
            socket.on(Socket.EVENT_CONNECT_ERROR, args -> Log.e(TAG, "Socket connection error: " + (args.length > 0 ? args[0] : "unknown")));

            socket.on(Constants.EVENT_BUS_LOCATION, args -> {
                if (args.length > 0 && args[0] instanceof JSONObject) {
                    try {
                        JSONObject obj = (JSONObject) args[0];
                        LocationUpdate update = new LocationUpdate();
                        update.setBusId(obj.optInt("bus_id"));
                        update.setLatitude(obj.optDouble("latitude"));
                        update.setLongitude(obj.optDouble("longitude"));
                        update.setSpeed(obj.optDouble("speed"));
                        update.setHeading(obj.optDouble("heading"));
                        update.setAccuracy(obj.optDouble("accuracy"));

                        if (locationListener != null) {
                            locationListener.onLocationReceived(update);
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "Failed parsing socket location", e);
                    }
                }
            });

        } catch (Exception e) {
            Log.e(TAG, "Socket initialization failed", e);
        }
    }

    public void connect() {
        if (socket != null && !socket.connected()) {
            socket.connect();
        }
    }

    public void disconnect() {
        if (socket != null && socket.connected()) {
            socket.disconnect();
        }
    }

    public void setLocationListener(LocationListener listener) {
        this.locationListener = listener;
    }

    public void joinDriverSession(int driverId, int busId, Integer tripId) {
        try {
            JSONObject data = new JSONObject();
            data.put("driver_id", driverId);
            data.put("bus_id", busId);
            data.put("trip_id", tripId);
            if (socket != null) socket.emit(Constants.EVENT_DRIVER_JOIN, data);
        } catch (Exception e) {
            Log.e(TAG, "joinDriverSession error", e);
        }
    }

    public void emitLocationUpdate(int busId, Integer tripId, double latitude, double longitude, double speed, double heading, double accuracy) {
        try {
            JSONObject data = new JSONObject();
            data.put("bus_id", busId);
            data.put("trip_id", tripId);
            data.put("latitude", latitude);
            data.put("longitude", longitude);
            data.put("speed", speed);
            data.put("heading", heading);
            data.put("accuracy", accuracy);
            if (socket != null) socket.emit(Constants.EVENT_LOCATION_UPDATE, data);
        } catch (Exception e) {
            Log.e(TAG, "emitLocationUpdate error", e);
        }
    }

    public void emitStartTrip(int tripId, int busId, int driverId) {
        try {
            JSONObject data = new JSONObject();
            data.put("trip_id", tripId);
            data.put("bus_id", busId);
            data.put("driver_id", driverId);
            if (socket != null) socket.emit(Constants.EVENT_START_TRIP, data);
        } catch (Exception e) {
            Log.e(TAG, "emitStartTrip error", e);
        }
    }

    public void emitEndTrip(int tripId, int busId) {
        try {
            JSONObject data = new JSONObject();
            data.put("trip_id", tripId);
            data.put("bus_id", busId);
            if (socket != null) socket.emit(Constants.EVENT_END_TRIP, data);
        } catch (Exception e) {
            Log.e(TAG, "emitEndTrip error", e);
        }
    }

    public void emitEmergency(int driverId, int busId, Integer tripId, String alertType, double latitude, double longitude, String notes) {
        try {
            JSONObject data = new JSONObject();
            data.put("driver_id", driverId);
            data.put("bus_id", busId);
            data.put("trip_id", tripId);
            data.put("alert_type", alertType);
            data.put("latitude", latitude);
            data.put("longitude", longitude);
            data.put("notes", notes);
            if (socket != null) socket.emit(Constants.EVENT_EMERGENCY, data);
        } catch (Exception e) {
            Log.e(TAG, "emitEmergency error", e);
        }
    }

    public void emitEmergencyAlert(int busId, Integer tripId, String alertType, String notes, double latitude, double longitude) {
        emitEmergency(1, busId, tripId, alertType, latitude, longitude, notes);
    }

    public void trackBus(int busId) {
        try {
            JSONObject data = new JSONObject();
            data.put("bus_id", busId);
            if (socket != null) socket.emit(Constants.EVENT_TRACK_BUS, data);
        } catch (Exception e) {
            Log.e(TAG, "trackBus error", e);
        }
    }

    public boolean isConnected() {
        return socket != null && socket.connected();
    }
}
