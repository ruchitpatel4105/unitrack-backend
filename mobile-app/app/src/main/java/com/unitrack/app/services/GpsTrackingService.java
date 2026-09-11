package com.unitrack.app.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import com.unitrack.app.activities.DriverDashboardActivity;
import com.unitrack.app.gps.LocationHelper;
import com.unitrack.app.socket.SocketManager;
import com.unitrack.app.utils.Constants;

public class GpsTrackingService extends Service {
    private static final int NOTIFICATION_ID = 1001;
    private LocationHelper locationHelper;
    private int busId;
    private Integer tripId;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        locationHelper = new LocationHelper(this);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null) {
            busId = intent.getIntExtra(Constants.EXTRA_BUS_ID, -1);
            int tid = intent.getIntExtra("extra_trip_id", -1);
            tripId = (tid != -1) ? tid : null;
        }

        if (busId <= 0) {
            stopSelf();
            return START_NOT_STICKY;
        }

        Notification notification = createNotification();
        startForeground(NOTIFICATION_ID, notification);

        SocketManager.getInstance().connect();

        // Collect GPS fixes every 3 seconds
        locationHelper.startLocationUpdates(3000, new LocationHelper.OnLocationUpdatedListener() {
            @Override
            public void onLocationChanged(Location location) {
                if (location != null) {
                    double lat = location.getLatitude();
                    double lng = location.getLongitude();
                    double speed = location.hasSpeed() ? (location.getSpeed() * 3.6) : 0.0; // km/h
                    double heading = location.hasBearing() ? location.getBearing() : 0.0;
                    double accuracy = location.hasAccuracy() ? location.getAccuracy() : 5.0;

                    // Stream to Socket.IO
                    SocketManager.getInstance().emitLocationUpdate(busId, tripId, lat, lng, speed, heading, accuracy);
                }
            }
        });

        return START_STICKY;
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, DriverDashboardActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT
        );

        return new NotificationCompat.Builder(this, Constants.CHANNEL_ID_TRACKING)
                .setContentTitle("Uni-Track Driver Beacon Active")
                .setContentText("Transmitting high-precision live GPS telemetry to campus dispatch")
                .setSmallIcon(android.R.drawable.ic_menu_compass)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    Constants.CHANNEL_ID_TRACKING,
                    "Campus Transit GPS Telemetry",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Background notification for real-time bus telemetry beacon");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (locationHelper != null) {
            locationHelper.stopLocationUpdates();
        }
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
