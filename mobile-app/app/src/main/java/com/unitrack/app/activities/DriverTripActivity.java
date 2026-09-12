package com.unitrack.app.activities;

import android.content.Intent;
import android.location.Location;
import android.os.Bundle;
import android.widget.ImageView;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import com.google.android.material.button.MaterialButton;
import com.unitrack.app.R;
import com.unitrack.app.gps.LocationHelper;
import com.unitrack.app.models.ApiResponse;
import com.unitrack.app.models.Trip;
import com.unitrack.app.network.ApiClient;
import com.unitrack.app.services.GpsTrackingService;
import com.unitrack.app.utils.Constants;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class DriverTripActivity extends AppCompatActivity {

    private ImageView btnBack;
    private TextView tvGpsStatusBadge;
    private TextView tvTripRouteName;
    private TextView tvTripBusInfo;
    private TextView tvLiveSpeed;
    private TextView tvLiveHeading;
    private TextView tvLiveAccuracy;
    private MaterialButton btnTripToggle;
    private MaterialButton btnEmergencySos;

    private LocationHelper locationHelper;
    private Trip currentTrip;
    private boolean isTripActive = true;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_driver_trip);

        btnBack = findViewById(R.id.btnBack);
        tvGpsStatusBadge = findViewById(R.id.tvGpsStatusBadge);
        tvTripRouteName = findViewById(R.id.tvTripRouteName);
        tvTripBusInfo = findViewById(R.id.tvTripBusInfo);
        tvLiveSpeed = findViewById(R.id.tvLiveSpeed);
        tvLiveHeading = findViewById(R.id.tvLiveHeading);
        tvLiveAccuracy = findViewById(R.id.tvLiveAccuracy);
        btnTripToggle = findViewById(R.id.btnTripToggle);
        btnEmergencySos = findViewById(R.id.btnEmergencySos);

        locationHelper = new LocationHelper(this);

        btnBack.setOnClickListener(v -> finish());

        btnTripToggle.setOnClickListener(v -> {
            if (isTripActive) {
                concludeTrip();
            } else {
                startNewTrip();
            }
        });

        btnEmergencySos.setOnClickListener(v -> {
            Intent intent = new Intent(DriverTripActivity.this, DriverEmergencyActivity.class);
            if (currentTrip != null) {
                intent.putExtra(Constants.EXTRA_BUS_ID, currentTrip.getBusId());
            }
            startActivity(intent);
        });

        loadCurrentTrip();
        startGpsService();
    }

    private void loadCurrentTrip() {
        ApiClient.getService(this).getDriverCurrentTrip().enqueue(new Callback<ApiResponse<Trip>>() {
            @Override
            public void onResponse(Call<ApiResponse<Trip>> call, Response<ApiResponse<Trip>> response) {
                if (response.isSuccessful() && response.body() != null && response.body().getData() != null) {
                    currentTrip = response.body().getData();
                    tvTripRouteName.setText(currentTrip.getRouteName() != null ? currentTrip.getRouteName() : "Assigned Route");
                    tvTripBusInfo.setText("Vehicle: Bus " + currentTrip.getBusNumber() + " (" + currentTrip.getLicensePlate() + ")");
                } else {
                    displayNoCurrentTrip();
                }
            }

            @Override
            public void onFailure(Call<ApiResponse<Trip>> call, Throwable t) {
                displayNoCurrentTrip();
            }
        });
    }

    private void displayNoCurrentTrip() {
        currentTrip = null;
        tvTripRouteName.setText("No Active Trip Assigned");
        tvTripBusInfo.setText("No Bus Assigned");
        isTripActive = false;
        btnTripToggle.setText("No Active Schedule");
        btnTripToggle.setEnabled(false);
        tvGpsStatusBadge.setText("NO ACTIVE TRIP");
        tvGpsStatusBadge.setBackgroundResource(R.drawable.bg_badge_amber);
        tvGpsStatusBadge.setTextColor(getResources().getColor(R.color.warning));
    }

    private void startNewTrip() {
        if (currentTrip == null) {
            Toast.makeText(this, "No active trip assigned to start.", Toast.LENGTH_SHORT).show();
            return;
        }

        isTripActive = true;
        btnTripToggle.setText("Conclude Trip");
        tvGpsStatusBadge.setText("GPS ACTIVE");
        tvGpsStatusBadge.setBackgroundResource(R.drawable.bg_badge_emerald);
        tvGpsStatusBadge.setTextColor(getResources().getColor(R.color.primary_dark));

        startGpsService();

        Map<String, Object> body = new HashMap<>();
        body.put("bus_id", currentTrip.getBusId());
        body.put("route_id", currentTrip.getRouteId());
        ApiClient.getService(this).startTrip(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
            @Override
            public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {}
            @Override
            public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {}
        });

        Toast.makeText(this, "Trip started! Telemetry beacon transmitting.", Toast.LENGTH_SHORT).show();
    }

    private void concludeTrip() {
        isTripActive = false;
        btnTripToggle.setText("Start Scheduled Trip");
        tvGpsStatusBadge.setText("STANDBY");
        tvGpsStatusBadge.setBackgroundResource(R.drawable.bg_badge_amber);
        tvGpsStatusBadge.setTextColor(getResources().getColor(R.color.warning));

        stopGpsService();

        if (currentTrip != null) {
            Map<String, Object> body = new HashMap<>();
            body.put("trip_id", currentTrip.getId());
            ApiClient.getService(this).endTrip(body).enqueue(new Callback<ApiResponse<Map<String, Object>>>() {
                @Override
                public void onResponse(Call<ApiResponse<Map<String, Object>>> call, Response<ApiResponse<Map<String, Object>>> response) {}
                @Override
                public void onFailure(Call<ApiResponse<Map<String, Object>>> call, Throwable t) {}
            });
        }

        Toast.makeText(this, "Trip concluded successfully.", Toast.LENGTH_SHORT).show();
    }

    private void startGpsService() {
        if (currentTrip != null) {
            Intent serviceIntent = new Intent(this, GpsTrackingService.class);
            serviceIntent.putExtra(Constants.EXTRA_BUS_ID, currentTrip.getBusId());
            serviceIntent.putExtra("extra_trip_id", currentTrip.getId());
            ContextCompat.startForegroundService(this, serviceIntent);
        }

        locationHelper.startLocationUpdates(2000, new LocationHelper.OnLocationUpdatedListener() {
            @Override
            public void onLocationChanged(Location location) {
                runOnUiThread(() -> {
                    tvLiveSpeed.setText("ACTIVE");

                    if (location.hasBearing()) {
                        float bearing = location.getBearing();
                        tvLiveHeading.setText(String.format(Locale.US, "%.0f° %s", bearing, getDirection(bearing)));
                    } else {
                        tvLiveHeading.setText("—");
                    }

                    if (location.hasAccuracy()) {
                        tvLiveAccuracy.setText(String.format(Locale.US, "±%.1fm", location.getAccuracy()));
                    } else {
                        tvLiveAccuracy.setText("—");
                    }
                });
            }
        });
    }

    private String getDirection(float bearing) {
        if (bearing >= 337.5 || bearing < 22.5) return "N";
        if (bearing >= 22.5 && bearing < 67.5) return "NE";
        if (bearing >= 67.5 && bearing < 112.5) return "E";
        if (bearing >= 112.5 && bearing < 157.5) return "SE";
        if (bearing >= 157.5 && bearing < 202.5) return "S";
        if (bearing >= 202.5 && bearing < 247.5) return "SW";
        if (bearing >= 247.5 && bearing < 292.5) return "W";
        return "NW";
    }

    private void stopGpsService() {
        Intent serviceIntent = new Intent(this, GpsTrackingService.class);
        stopService(serviceIntent);
        locationHelper.stopLocationUpdates();
        tvLiveSpeed.setText("STANDBY");
        tvLiveAccuracy.setText("Inactive");
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (locationHelper != null) {
            locationHelper.stopLocationUpdates();
        }
    }
}
